import { test } from "node:test";
import assert from "node:assert/strict";
import { makeFixture, suggestedContent } from "../src/core/fixtures";
import {
  applyCommand,
  canPublish,
  findings,
  freshApproval,
  hash,
  parseCommand,
  parseContent,
} from "../src/core/workflow";
import { locales, type Actor, type Workspace } from "../src/core/types";
import {
  documents,
  fromDocuments,
  planTransaction,
  MANIFEST,
  entryId,
  sourceId,
} from "../src/server/documents";
import {
  configuration,
  commitCommand,
  requireLocalMutation,
  requireLocalRead,
  seedDataset,
} from "../src/server/sanity";
import type { SanityClient, Mutation } from "@sanity/client";
let n = 0;
const command = (
  w: Workspace,
  action: Record<string, unknown>,
  actor: Actor = "editor",
  id = "lantern",
) => ({
  ...action,
  workflowId: id,
  expectedVersion: w.workflows.find((f) => f.id === id)!.version,
  operationId: `test-operation-${++n}`,
  actor,
  reason: "Test the stated workflow boundary.",
  at: new Date(Date.UTC(2026, 8, 22, 0, 0, n)).toISOString(),
});
function step(
  w: Workspace,
  action: Record<string, unknown>,
  actor: Actor = "editor",
  id = "lantern",
) {
  return applyCommand(w, command(w, action, actor, id)).workspace;
}
function ready() {
  let w = makeFixture();
  w = step(w, { type: "request-review" });
  for (const locale of locales)
    w = step(
      w,
      { type: "approve", locale, sourceChecked: true, languageChecked: true },
      "reviewer",
    );
  return w;
}

test("authored missing fields become actionable errors, not an accessibility certificate", () => {
  const w = makeFixture(),
    flow = w.workflows[0];
  assert.deepEqual(
    new Set(
      findings(flow, "en", w)
        .filter((f) => f.severity === "error")
        .map((f) => f.code),
    ),
    new Set(["missing-alt", "missing-summary", "missing-access", "vague-link"]),
  );
  assert.throws(
    () => step(w, { type: "request-review" }, "editor", "loom"),
    /gates/,
  );
});
test("English edit invalidates locale bases; saving translations against current English repairs lineage", () => {
  let w = makeFixture();
  w = step(
    w,
    { type: "edit", locale: "en", content: suggestedContent.loom.en },
    "editor",
    "loom",
  );
  let flow = w.workflows[0];
  assert.equal(flow.variants.en.version, 2);
  assert.ok(
    findings(flow, "fi", w).some((f) => f.code === "stale-translation"),
  );
  assert.throws(() => step(w, { type: "request-review" }, "editor", "loom"));
  for (const locale of ["fi", "es"])
    w = step(
      w,
      {
        type: "edit",
        locale,
        content: suggestedContent.loom[locale as "fi" | "es"],
      },
      "editor",
      "loom",
    );
  w = step(w, { type: "request-review" }, "editor", "loom");
  assert.equal(w.workflows[0].stage, "review");
});
test("review requires both explicit confirmations and exact locale content/source fingerprints", () => {
  let w = step(makeFixture(), { type: "request-review" });
  for (const flags of [
    { sourceChecked: false, languageChecked: true },
    { sourceChecked: true, languageChecked: false },
  ])
    assert.throws(
      () => step(w, { type: "approve", locale: "en", ...flags }, "reviewer"),
      /Confirm/,
    );
  w = step(
    w,
    {
      type: "approve",
      locale: "en",
      sourceChecked: true,
      languageChecked: true,
    },
    "reviewer",
  );
  assert.ok(freshApproval(w.workflows[1], "en", w));
  assert.ok(!canPublish(w.workflows[1], w));
  w = step(w, {
    type: "edit",
    locale: "en",
    content: { ...suggestedContent.lantern.en, title: "Changed after review" },
  });
  assert.equal(w.workflows[1].stage, "draft");
  assert.equal(w.workflows[1].variants.en.approval, null);
  assert.ok(!freshApproval(w.workflows[1], "en", w));
});
test("publication requires all fresh reviews and produces an immutable public snapshot", () => {
  let w = ready();
  assert.equal(w.workflows[1].stage, "approved");
  assert.ok(canPublish(w.workflows[1], w));
  w = step(w, { type: "publish" }, "publisher");
  const published = structuredClone(w.publications[0]);
  assert.equal(w.workflows[1].stage, "published");
  assert.equal(published.content.fi.title, suggestedContent.lantern.fi.title);
  w = step(w, {
    type: "edit",
    locale: "en",
    content: { ...suggestedContent.lantern.en, title: "Unpublished change" },
  });
  assert.equal(w.workflows[1].stage, "draft");
  assert.deepEqual(w.publications[0], published);
  assert.throws(() => step(w, { type: "publish" }, "publisher"));
});
test("role boundaries are enforced in reducer, not only in disabled buttons", () => {
  const w = ready();
  assert.throws(() => step(w, { type: "publish" }, "editor"), /publisher role/);
  assert.throws(
    () =>
      step(
        w,
        { type: "edit", locale: "en", content: suggestedContent.lantern.en },
        "publisher",
      ),
    /editor role/,
  );
  assert.throws(
    () =>
      step(
        w,
        {
          type: "approve",
          locale: "en",
          sourceChecked: true,
          languageChecked: true,
        },
        "editor",
      ),
    /reviewer role/,
  );
});
test("stale versions conflict; repeated operations are idempotent only for the exact full command", () => {
  const w = makeFixture(),
    c = command(w, {
      type: "edit",
      locale: "en",
      content: suggestedContent.lantern.en,
    });
  const result = applyCommand(w, c);
  assert.equal(result.workspace.revisions.length, 1);
  assert.ok(applyCommand(result.workspace, c).idempotent);
  assert.throws(
    () =>
      applyCommand(result.workspace, {
        ...c,
        content: {
          ...suggestedContent.lantern.en,
          title: "Conflicting content",
        },
      }),
    /different change/,
  );
  assert.throws(
    () =>
      applyCommand(result.workspace, {
        ...c,
        operationId: "another-operation",
      }),
    /changed since/,
  );
});
test("source correction invalidates related approvals while preserving the previous public snapshot", () => {
  let w = step(ready(), { type: "publish" }, "publisher");
  const pub = structuredClone(w.publications[0]);
  w = step(w, {
    type: "revise-source",
    sourceId: "access-lantern",
    excerpt:
      "Corrected synthetic audit: the entrance is 12 metres from the case.",
  });
  assert.equal(w.sources.find((s) => s.id === "access-lantern")!.version, 2);
  assert.ok(locales.every((l) => !freshApproval(w.workflows[1], l, w)));
  assert.equal(w.workflows[1].stage, "draft");
  assert.deepEqual(w.publications[0], pub);
  assert.throws(() => step(w, { type: "publish" }, "publisher"));
});
test("restoring history makes a new unapproved draft, preserves stale translation status and never republishes", () => {
  let w = makeFixture();
  w = step(
    w,
    { type: "edit", locale: "en", content: suggestedContent.loom.en },
    "editor",
    "loom",
  );
  w = step(
    w,
    {
      type: "edit",
      locale: "en",
      content: { ...suggestedContent.loom.en, title: "Third version" },
    },
    "editor",
    "loom",
  );
  const second = w.revisions.at(-1)!;
  const oldCount = w.revisions.length;
  w = step(w, { type: "restore", revisionId: second.id }, "editor", "loom");
  assert.equal(w.revisions.length, oldCount + 1);
  assert.equal(
    w.workflows[0].variants.en.content.title,
    suggestedContent.loom.en.title,
  );
  assert.equal(w.workflows[0].stage, "draft");
  assert.ok(
    findings(w.workflows[0], "fi", w).some(
      (f) => f.code === "stale-translation",
    ),
  );
  assert.equal(w.publications.length, 0);
  assert.throws(
    () =>
      step(w, { type: "restore", revisionId: second.id }, "editor", "lantern"),
    /does not belong/,
  );
});
test("withdrawal removes only public edition and leaves source/revision audit intact", () => {
  let w = step(ready(), { type: "publish" }, "publisher");
  const before = w.revisions.length;
  w = step(w, { type: "unpublish" }, "publisher");
  assert.equal(w.publications.length, 0);
  assert.equal(w.revisions.length, before + 1);
  assert.equal(w.workflows[1].stage, "approved");
  assert.throws(
    () => step(w, { type: "unpublish" }, "publisher"),
    /no public edition/,
  );
});
test("malformed or overbroad content/commands fail before mutation and input remains unchanged", () => {
  const w = makeFixture(),
    before = hash(w);
  for (const content of [
    { ...suggestedContent.loom.en, title: "" },
    { ...suggestedContent.loom.en, secret: "unexpected" },
    { ...suggestedContent.loom.en, body: "x".repeat(12001) },
  ])
    assert.throws(() => parseContent(content));
  for (const patch of [
    { type: "delete-everything" },
    { expectedVersion: 1.2 },
    { actor: "administrator" },
    { operationId: "../x" },
    { reason: "" },
    { at: "never" },
    { locale: "xx" },
  ])
    assert.throws(() =>
      parseCommand({
        ...command(w, {
          type: "edit",
          locale: "en",
          content: suggestedContent.loom.en,
        }),
        ...patch,
      }),
    );
  step(w, { type: "request-review" });
  assert.equal(hash(w), before);
});
test("draft and publication document mapping round-trips without leaking internal drafts into public ids", () => {
  const w = step(ready(), { type: "publish" }, "publisher"),
    rows = documents(w);
  assert.deepEqual(fromDocuments(rows), w);
  assert.ok(
    rows
      .filter((d) => d._type !== "patchworkPublication")
      .every((d) => d._id.startsWith("drafts.")),
  );
  assert.ok(
    rows
      .filter((d) => d._type === "patchworkPublication")
      .every((d) => !d._id.startsWith("drafts.")),
  );
  assert.equal(rows.find((d) => d._id === MANIFEST)!.workspaceHash, hash(w));
});
test("transaction guards all prior documents and uses create (not overwrite) for new operation receipts", () => {
  const before = ready(),
    after = step(before, { type: "publish" }, "publisher");
  const revs = Object.fromEntries(
    documents(before).map((d) => [d._id, `rev-${d._id}`]),
  );
  const mutations = planTransaction(before, after, revs);
  for (const d of documents(before)) {
    const patch = mutations.find(
      (m) => "patch" in m && "id" in m.patch && m.patch.id === d._id,
    ) as { patch: { ifRevisionID: string } };
    assert.equal(patch.patch.ifRevisionID, revs[d._id]);
  }
  assert.ok(
    mutations.some(
      (m) => "create" in m && m.create._type === "patchworkPublication",
    ),
  );
  assert.ok(!mutations.some((m) => "createOrReplace" in m));
  assert.throws(
    () => planTransaction(before, after, {}),
    /Missing Sanity revision/,
  );
});
test("server configuration never manufactures a project id or write capability without token", () => {
  assert.deepEqual(configuration({}), {
    projectId: "",
    dataset: "",
    token: "",
    configured: false,
    canWrite: false,
  });
  assert.equal(
    configuration({
      SANITY_PROJECT_ID: "test123",
      SANITY_DATASET: "production",
    }).canWrite,
    false,
  );
  assert.throws(() =>
    configuration({ SANITY_PROJECT_ID: "bad/url", SANITY_DATASET: "x" }),
  );
  assert.throws(
    () =>
      requireLocalMutation(
        new Request("https://public.example/api/command", {
          method: "POST",
          headers: {
            origin: "https://public.example",
            "content-type": "application/json",
          },
        }),
      ),
    /Remote/,
  );
  assert.throws(
    () =>
      requireLocalMutation(
        new Request("http://127.0.0.1:4327/api/command", {
          method: "POST",
          headers: {
            origin: "https://foreign.example",
            "content-type": "application/json",
          },
        }),
      ),
    /same-origin/,
  );
});

function mockClient(initial = makeFixture()) {
  let clock = 1,
    rows = new Map(
      documents(initial).map((d) => [
        d._id,
        { ...structuredClone(d), _rev: `rev-${clock++}` },
      ]),
    ) as Map<string, Record<string, unknown>>;
  let failAfter = false,
    conflict = false;
  const client = {
    getDocument: async (id: string) => rows.get(id),
    fetch: async () => [...rows.values()].map((d) => structuredClone(d)),
    mutate: async (mutations: Mutation[]) => {
      const next = structuredClone(rows);
      for (const m of mutations) {
        if ("patch" in m) {
          const p = m.patch as {
            id: string;
            ifRevisionID: string;
            set: Record<string, unknown>;
          };
          const doc = next.get(p.id);
          if (conflict || doc?._rev !== p.ifRevisionID)
            throw Object.assign(new Error("revision conflict"), {
              statusCode: 409,
            });
          next.set(p.id, { ...doc, ...p.set, _rev: `rev-${clock++}` });
        } else if ("create" in m) {
          const d = m.create;
          if (next.has(d._id!))
            throw Object.assign(new Error("duplicate"), { statusCode: 409 });
          next.set(d._id!, { ...structuredClone(d), _rev: `rev-${clock++}` });
        } else if ("delete" in m) next.delete((m.delete as { id: string }).id);
        else throw new Error("Unexpected mutation");
      }
      rows = next;
      if (failAfter) throw new Error("connection lost after commit");
      return { transactionId: "actual-mock-transaction" };
    },
  } as unknown as SanityClient;
  return {
    client,
    rows: () => rows,
    loseReply: () => {
      failAfter = true;
    },
    conflict: () => {
      conflict = true;
    },
  };
}
test("Sanity adapter commits only guarded mutations, verifies readback and reconciles a lost success response", async () => {
  const w = makeFixture(),
    mock = mockClient(w);
  mock.loseReply();
  const c = command(w, { type: "request-review" });
  const result = await commitCommand(c, mock.client);
  assert.equal(result.verified, true);
  assert.equal(result.workspace.workflows[1].stage, "review");
  assert.equal(result.workspace.revisions.length, 1);
  const again = await commitCommand(c, mock.client);
  assert.equal(again.idempotent, true);
  assert.equal(again.workspace.revisions.length, 1);
});
test("Sanity conflict leaves state unmodified and never returns a published-success result", async () => {
  const w = ready(),
    mock = mockClient(w),
    before = hash([...mock.rows().values()]);
  mock.conflict();
  await assert.rejects(
    () =>
      commitCommand(command(w, { type: "publish" }, "publisher"), mock.client),
    /stale revision/,
  );
  assert.equal(hash([...mock.rows().values()]), before);
});
test("explicit seed refuses to overwrite an existing manifest", async () => {
  const mock = mockClient();
  await assert.rejects(() => seedDataset(mock.client), /already seeded/);
});

test("out-of-band evidence changes invalidate approval even without a version bump", () => {
  const w = ready(),
    flow = w.workflows.find((f) => f.id === "lantern")!;
  assert.equal(canPublish(flow, w), true);
  w.sources.find((s) => s.id === flow.sourceIds[0])!.excerpt +=
    " Evidence corrected.";
  assert.equal(canPublish(flow, w), false);
  assert.throws(
    () => step(w, { type: "publish" }, "publisher"),
    /review|approval/i,
  );
});
test("authenticated drafts cannot be read through a remote authoring endpoint", () => {
  assert.throws(
    () => requireLocalRead(new Request("https://example.org/api/workspace")),
    /Remote/,
  );
  assert.throws(
    () =>
      requireLocalRead(
        new Request("https://example.org/api/workspace", {
          headers: { host: "127.0.0.1:4327" },
        }),
      ),
    /Remote/,
  );
  assert.throws(
    () =>
      requireLocalRead(
        new Request("http://127.0.0.1:4327/api/workspace", {
          headers: { host: "example.org" },
        }),
      ),
    /Remote/,
  );
  assert.doesNotThrow(() =>
    requireLocalRead(new Request("http://127.0.0.1:4327/api/workspace")),
  );
});

test("stored public editions retain their snapshot when evidence is later corrected", () => {
  const w = step(ready(), { type: "publish" }, "publisher");
  const prior = documents(w).find((d) => d._type === "patchworkPublication");
  const next = structuredClone(w);
  next.sources.forEach((s) => {
    s.title += " corrected";
    s.excerpt += " updated";
    s.version++;
  });
  assert.deepEqual(
    documents(next).find((d) => d._type === "patchworkPublication"),
    prior,
  );
});

test("same-origin authoring tolerates Next's internal localhost URL with the real loopback Host", () => {
  assert.doesNotThrow(() =>
    requireLocalMutation(
      new Request("http://localhost:4327/api/command", {
        method: "POST",
        headers: {
          host: "127.0.0.1:4327",
          origin: "http://127.0.0.1:4327",
          "content-type": "application/json",
        },
      }),
    ),
  );
});
