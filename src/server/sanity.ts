import { createClient, type SanityClient } from "@sanity/client";
import { makeFixture } from "../core/fixtures";
import { applyCommand, parseCommand, WorkflowError } from "../core/workflow";
import {
  documents,
  fromDocuments,
  MANIFEST,
  planTransaction,
  type StoredDoc,
} from "./documents";
import type { CloudState, Snapshot, Workspace, Command } from "../core/types";

export const API_VERSION = "2026-09-21";
export function configuration(
  env: Record<string, string | undefined> = process.env,
) {
  const projectId = env.SANITY_PROJECT_ID?.trim() ?? "",
    dataset = env.SANITY_DATASET?.trim() ?? "",
    token = env.SANITY_API_TOKEN?.trim() ?? "";
  if (projectId && !/^[a-z0-9]{3,32}$/.test(projectId))
    throw new WorkflowError("SANITY_PROJECT_ID is malformed.", "configuration");
  if (dataset && !/^[a-z0-9_-]{1,64}$/.test(dataset))
    throw new WorkflowError("SANITY_DATASET is malformed.", "configuration");
  return {
    projectId,
    dataset,
    token,
    configured: !!projectId && !!dataset,
    canWrite: !!projectId && !!dataset && !!token,
  };
}
export function clientFor(write = false) {
  const config = configuration();
  if (!config.configured || (write && !config.canWrite))
    throw new WorkflowError(
      "Sanity is disconnected or missing a server-side write token. No cloud publication occurred.",
      "disconnected",
    );
  return createClient({
    projectId: config.projectId,
    dataset: config.dataset,
    token: write ? config.token : undefined,
    apiVersion: API_VERSION,
    useCdn: false,
    perspective: write ? "raw" : "published",
    maxRetries: 0,
    timeout: 10000,
  });
}
export async function readWorkspace(
  client: SanityClient,
): Promise<{ workspace: Workspace; revisions: Record<string, string> }> {
  const rows = await client.fetch<StoredDoc[]>(
    "*[_type in $types]",
    {
      types: [
        "patchworkManifest",
        "patchworkEntry",
        "patchworkSource",
        "patchworkRevision",
        "patchworkPublication",
      ],
    },
    { perspective: "raw" },
  );
  return {
    workspace: fromDocuments(rows),
    revisions: Object.fromEntries(
      rows.filter((d) => d._rev).map((d) => [d._id, d._rev!]),
    ),
  };
}
export async function status(): Promise<CloudState> {
  let config: ReturnType<typeof configuration>;
  try {
    config = configuration();
  } catch (error) {
    return {
      connected: false,
      configured: false,
      canWrite: false,
      projectId: null,
      dataset: null,
      message: String(error),
      checkedAt: new Date().toISOString(),
      mode: "disconnected",
    };
  }
  const base = {
    configured: config.configured,
    projectId: config.projectId || null,
    dataset: config.dataset || null,
    checkedAt: new Date().toISOString(),
  };
  if (!config.configured)
    return {
      ...base,
      connected: false,
      canWrite: false,
      message:
        "Sanity is not configured. The workspace is a local rehearsal; nothing is published.",
      mode: "disconnected",
    };
  try {
    const count = await clientFor(config.canWrite).fetch<number>(
      "count(*[_type in $types])",
      {
        types: [
          "patchworkManifest",
          "patchworkEntry",
          "patchworkSource",
          "patchworkRevision",
          "patchworkPublication",
        ],
      },
    );
    return {
      ...base,
      connected: true,
      canWrite: config.canWrite,
      message: config.canWrite
        ? "Sanity connection verified. Server-side authoring available."
        : "Public dataset reachable. Server write token is not configured.",
      mode: config.canWrite ? "connected" : "read-only",
      documentCount: count,
    };
  } catch {
    return {
      ...base,
      connected: false,
      canWrite: false,
      message:
        "Sanity could not be reached or authentication failed. No cloud write is confirmed.",
      mode: "disconnected",
    };
  }
}
export async function snapshot(): Promise<Snapshot> {
  const cloud = await status();
  if (!cloud.connected || !cloud.canWrite)
    return { cloud, workspace: makeFixture(), revisions: {} };
  try {
    return { cloud, ...(await readWorkspace(clientFor(true))) };
  } catch (error) {
    if (error instanceof WorkflowError && error.code === "unseeded")
      return {
        cloud: { ...cloud, message: error.message },
        workspace: makeFixture(),
        revisions: {},
      };
    throw error;
  }
}
export async function seedDataset(client = clientFor(true)) {
  const existing = await client.getDocument(MANIFEST);
  if (existing)
    throw new WorkflowError(
      "Patchwork is already seeded. Existing content will not be overwritten.",
      "conflict",
    );
  const seed = makeFixture();
  const mutations = documents(seed).map((doc) => ({ create: doc }));
  await client.mutate(mutations, {
    visibility: "sync",
    returnDocuments: false,
    autoGenerateArrayKeys: false,
  });
  const verified = await readWorkspace(client);
  if (verified.workspace.workflows.length !== 3)
    throw new WorkflowError(
      "Seed transaction returned, but readback did not verify. Refresh.",
      "uncertain",
    );
  return verified;
}
export async function commitCommand(raw: unknown, client = clientFor(true)) {
  const command = parseCommand(raw);
  const before = await readWorkspace(client);
  const result = applyCommand(before.workspace, command);
  if (result.idempotent) return { ...before, idempotent: true, verified: true };
  try {
    await client.mutate(
      planTransaction(before.workspace, result.workspace, before.revisions),
      {
        visibility: "sync",
        returnDocuments: false,
        autoGenerateArrayKeys: false,
      },
    );
  } catch (error) {
    const code = (error as { statusCode?: number }).statusCode;
    if (code === 409)
      throw new WorkflowError(
        "Sanity rejected a stale revision. Reload and reapply your change.",
        "conflict",
      );
    // Network failure after a successful commit is ambiguous. Read the operation receipt before retrying.
    try {
      const check = await readWorkspace(client);
      if (
        check.workspace.revisions.some(
          (r) => r.operationId === command.operationId,
        )
      )
        return { ...check, idempotent: true, verified: true };
    } catch {}
    throw new WorkflowError(
      "The cloud write was not confirmed. Refresh and check the operation receipt before retrying.",
      "uncertain",
    );
  }
  const readback = await readWorkspace(client);
  if (
    !readback.workspace.revisions.some(
      (r) => r.operationId === command.operationId,
    )
  )
    throw new WorkflowError(
      "Transaction responded, but the operation was not visible in readback. Refresh before retrying.",
      "uncertain",
    );
  return { ...readback, idempotent: false, verified: true };
}
export function requireLocalRead(request: Request) {
  const url = new URL(request.url);
  const host = request.headers.get("host");
  const allowed = ["localhost", "127.0.0.1", "[::1]"];
  if (
    !allowed.includes(url.hostname) ||
    (host && !allowed.includes(new URL(`http://${host}`).hostname))
  )
    throw new WorkflowError(
      "Remote installations expose public editions only. Run the authoring workbench on localhost.",
      "forbidden",
    );
}
export function requireLocalMutation(request: Request) {
  requireLocalRead(request);
  const url = new URL(request.url);
  const origin = request.headers.get("origin");
  const browserHost = request.headers.get("host") ?? url.host;
  if (
    !origin ||
    new URL(origin).host !== browserHost ||
    new URL(origin).protocol !== url.protocol
  )
    throw new WorkflowError(
      "Authoring requires a same-origin browser request.",
      "forbidden",
    );
  if (request.headers.get("content-type")?.split(";")[0] !== "application/json")
    throw new WorkflowError("JSON request required.");
}
export function errorResponse(error: unknown) {
  const known = error instanceof WorkflowError;
  const code = known ? error.code : "error";
  return Response.json(
    {
      ok: false,
      error: known
        ? error.message
        : "The Sanity request failed. No new publication is confirmed.",
      code,
    },
    {
      status:
        code === "conflict"
          ? 409
          : code === "forbidden"
            ? 403
            : code === "disconnected"
              ? 503
              : code === "uncertain"
                ? 502
                : 400,
    },
  );
}
