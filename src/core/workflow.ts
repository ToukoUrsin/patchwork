import { sha256 } from "@noble/hashes/sha2.js";
import { bytesToHex } from "@noble/hashes/utils.js";
import {
  actors,
  locales,
  type Command,
  type Content,
  type Finding,
  type Locale,
  type Publication,
  type Workspace,
  type Workflow,
} from "./types";

export class WorkflowError extends Error {
  constructor(
    message: string,
    public code = "invalid",
  ) {
    super(message);
  }
}
const record = (v: unknown): v is Record<string, unknown> =>
  typeof v === "object" && v !== null && !Array.isArray(v);
const text = (value: unknown, min: number, max: number) =>
  typeof value === "string" &&
  value.trim().length >= min &&
  value.length <= max;
const ordered = (value: unknown): unknown =>
  Array.isArray(value)
    ? value.map(ordered)
    : record(value)
      ? Object.fromEntries(
          Object.keys(value)
            .sort()
            .map((k) => [k, ordered(value[k])]),
        )
      : value;
export const hash = (value: unknown) =>
  bytesToHex(sha256(new TextEncoder().encode(JSON.stringify(ordered(value)))));
const contentKeys = [
  "title",
  "summary",
  "body",
  "imageAlt",
  "decorativeImage",
  "accessNote",
  "linkLabel",
] as const;
export function parseContent(value: unknown): Content {
  if (
    !record(value) ||
    Object.keys(value).sort().join("|") !== [...contentKeys].sort().join("|")
  )
    throw new WorkflowError(
      "Content fields do not match this document schema.",
    );
  const bounds: Record<string, [number, number]> = {
    title: [1, 100],
    summary: [0, 300],
    body: [1, 12000],
    imageAlt: [0, 350],
    accessNote: [0, 1000],
    linkLabel: [0, 120],
  };
  for (const [key, [min, max]] of Object.entries(bounds))
    if (!text(value[key], min, max))
      throw new WorkflowError(`${key} must contain ${min}–${max} characters.`);
  if (typeof value.decorativeImage !== "boolean")
    throw new WorkflowError("decorativeImage must be boolean.");
  return Object.fromEntries(contentKeys.map((k) => [k, value[k]])) as Content;
}
export function parseCommand(value: unknown): Command {
  if (
    !record(value) ||
    !text(value.workflowId, 1, 100) ||
    !Number.isSafeInteger(value.expectedVersion) ||
    Number(value.expectedVersion) < 1 ||
    !text(value.operationId, 8, 80) ||
    !/^[a-zA-Z0-9_-]+$/.test(String(value.operationId)) ||
    !["editor", "reviewer", "publisher"].includes(String(value.actor)) ||
    !text(value.reason, 3, 500) ||
    typeof value.at !== "string" ||
    Number.isNaN(Date.parse(value.at))
  )
    throw new WorkflowError("Command metadata is malformed.");
  const base = [
    "workflowId",
    "expectedVersion",
    "operationId",
    "actor",
    "at",
    "reason",
    "type",
  ];
  const extras: Record<string, string[]> = {
    edit: ["locale", "content"],
    "request-review": [],
    approve: ["locale", "sourceChecked", "languageChecked"],
    publish: [],
    unpublish: [],
    restore: ["revisionId"],
    "revise-source": ["sourceId", "excerpt"],
  };
  if (
    !Object.hasOwn(extras, String(value.type)) ||
    Object.keys(value).some(
      (k) => ![...base, ...extras[String(value.type)]].includes(k),
    )
  )
    throw new WorkflowError("Unknown operation or command fields.");
  if (
    ["edit", "approve"].includes(String(value.type)) &&
    !locales.includes(value.locale as Locale)
  )
    throw new WorkflowError("Unknown locale.");
  const parsedContent =
    value.type === "edit" ? parseContent(value.content) : undefined;
  if (
    value.type === "approve" &&
    (typeof value.sourceChecked !== "boolean" ||
      typeof value.languageChecked !== "boolean")
  )
    throw new WorkflowError("Review confirmations must be explicit booleans.");
  if (value.type === "restore" && !text(value.revisionId, 1, 120))
    throw new WorkflowError("Revision id missing.");
  if (
    value.type === "revise-source" &&
    (!text(value.sourceId, 1, 100) || !text(value.excerpt, 5, 4000))
  )
    throw new WorkflowError("Source edit missing or too long.");
  return structuredClone({
    ...value,
    ...(parsedContent ? { content: parsedContent } : {}),
  }) as Command;
}
export function findings(
  flow: Workflow,
  locale: Locale,
  workspace: Workspace,
): Finding[] {
  const variant = flow.variants[locale],
    c = variant.content,
    issues: Finding[] = [];
  if (!c.decorativeImage && !c.imageAlt.trim())
    issues.push({
      code: "missing-alt",
      severity: "error",
      label: "The image needs a description",
      detail:
        "Write useful alternative text, or explicitly identify a decorative image.",
      field: "imageAlt",
    });
  if (c.decorativeImage && c.imageAlt.trim())
    issues.push({
      code: "decorative-alt",
      severity: "error",
      label: "Decorative images use empty alt text",
      detail: "Remove the description or mark this as a meaningful image.",
      field: "imageAlt",
    });
  if (!c.summary.trim())
    issues.push({
      code: "missing-summary",
      severity: "error",
      label: "Add a plain-language summary",
      detail: "Visitors need a short introduction before the full story.",
      field: "summary",
    });
  if (!c.accessNote.trim())
    issues.push({
      code: "missing-access",
      severity: "error",
      label: "Access information is missing",
      detail:
        "Give concrete route/access information grounded in the attached evidence.",
      field: "accessNote",
    });
  if (
    !c.linkLabel.trim() ||
    /^(click here|here|more|read more|link|tästä|lisää|aquí|más)$/i.test(
      c.linkLabel.trim(),
    )
  )
    issues.push({
      code: "vague-link",
      severity: "error",
      label: "The link label needs a destination",
      detail: "Use a descriptive label that makes sense outside the sentence.",
      field: "linkLabel",
    });
  if (locale !== "en" && variant.baseVersion !== flow.variants.en.version)
    issues.push({
      code: "stale-translation",
      severity: "error",
      label: "The translation trails the source",
      detail: `Based on English v${variant.baseVersion}; English is now v${flow.variants.en.version}. Update and review it against the current source.`,
    });
  if (
    flow.sourceIds.length === 0 ||
    flow.sourceIds.some((id) => !workspace.sources.some((s) => s.id === id))
  )
    issues.push({
      code: "missing-source",
      severity: "error",
      label: "Source evidence is missing",
      detail: "Every entry requires inspectable source evidence.",
    });
  const sentences = c.body.split(/[.!?]+/).filter((s) => s.trim());
  if (sentences.some((s) => s.trim().split(/\s+/).length > 30))
    issues.push({
      code: "long-sentence",
      severity: "warning",
      label: "A sentence may be hard to follow",
      detail:
        "One sentence exceeds 30 words. This heuristic is an editing prompt, not a reading-level certification.",
      field: "body",
    });
  return issues;
}
export function reviewFingerprint(
  flow: Workflow,
  locale: Locale,
  workspace: Workspace,
) {
  const v = flow.variants[locale];
  return hash([
    locale,
    contentKeys.map((k) => v.content[k]),
    v.version,
    v.baseVersion,
    flow.variants.en.version,
    flow.sourceIds.map((id) => {
      const source = workspace.sources.find((s) => s.id === id);
      return [id, source ? hash(source) : null];
    }),
  ]);
}
export function freshApproval(
  flow: Workflow,
  locale: Locale,
  workspace: Workspace,
) {
  const approval = flow.variants[locale].approval;
  return (
    !!approval &&
    approval.sourceChecked &&
    approval.languageChecked &&
    approval.fingerprint === reviewFingerprint(flow, locale, workspace)
  );
}
export const canPublish = (flow: Workflow, w: Workspace) =>
  locales.every(
    (locale) =>
      freshApproval(flow, locale, w) &&
      !findings(flow, locale, w).some((f) => f.severity === "error"),
  );
export function applyCommand(
  original: Workspace,
  raw: unknown,
): { workspace: Workspace; workflow: Workflow; idempotent: boolean } {
  const c = parseCommand(raw),
    previous = original.revisions.find((r) => r.operationId === c.operationId);
  if (previous) {
    if (previous.commandHash !== hash(c))
      throw new WorkflowError(
        "Operation id already belongs to a different change.",
        "conflict",
      );
    return {
      workspace: structuredClone(original),
      workflow: structuredClone(
        original.workflows.find((f) => f.id === c.workflowId)!,
      ),
      idempotent: true,
    };
  }
  const w = structuredClone(original),
    flow = w.workflows.find((f) => f.id === c.workflowId);
  if (!flow) throw new WorkflowError("Entry not found.", "not-found");
  if (flow.version !== c.expectedVersion)
    throw new WorkflowError(
      "This entry changed since you opened it. Reload before applying your edit.",
      "conflict",
    );
  if (Date.parse(c.at) < Date.parse(flow.updatedAt))
    throw new WorkflowError("An operation cannot predate the entry revision.");
  if (w.revisions.length >= 1000)
    throw new WorkflowError(
      "This prototype retains at most 1000 workflow revisions. Export and start a separate dataset.",
    );
  const required =
    c.type === "approve"
      ? "reviewer"
      : ["publish", "unpublish"].includes(c.type)
        ? "publisher"
        : "editor";
  if (actors[c.actor].role !== required)
    throw new WorkflowError(
      `This operation requires the ${required} role.`,
      "role",
    );
  const before = structuredClone(flow);
  if (c.type === "edit") {
    const variant = flow.variants[c.locale];
    variant.content = parseContent(c.content);
    variant.version++;
    variant.baseVersion =
      c.locale === "en" ? variant.version : flow.variants.en.version;
    variant.approval = null;
    flow.stage = "draft";
    if (c.locale === "en")
      for (const locale of locales) flow.variants[locale].approval = null;
  }
  if (c.type === "request-review") {
    if (flow.stage !== "draft")
      throw new WorkflowError("Only a draft can request review.");
    const errors = locales.flatMap((locale) =>
      findings(flow, locale, w)
        .filter((f) => f.severity === "error")
        .map((f) => `${locale}: ${f.label}`),
    );
    if (errors.length)
      throw new WorkflowError(
        `Fix the publication gates first: ${errors.join("; ")}`,
        "gates",
      );
    flow.stage = "review";
  }
  if (c.type === "approve") {
    if (flow.stage !== "review")
      throw new WorkflowError("Request review before recording an approval.");
    if (!c.sourceChecked || !c.languageChecked)
      throw new WorkflowError(
        "Confirm source evidence and language/accessibility checks.",
        "gates",
      );
    if (findings(flow, c.locale, w).some((f) => f.severity === "error"))
      throw new WorkflowError(
        "This locale still has blocking findings.",
        "gates",
      );
    flow.variants[c.locale].approval = {
      fingerprint: reviewFingerprint(flow, c.locale, w),
      reviewer: c.actor,
      at: c.at,
      sourceChecked: true,
      languageChecked: true,
    };
    if (canPublish(flow, w)) flow.stage = "approved";
  }
  if (c.type === "publish") {
    if (flow.stage !== "approved" || !canPublish(flow, w))
      throw new WorkflowError(
        "Publish requires fresh approvals for every locale and source version.",
        "gates",
      );
    const publication: Publication = {
      id: flow.id,
      workflowId: flow.id,
      version: flow.version + 1,
      publishedAt: c.at,
      content: Object.fromEntries(
        locales.map((locale) => [
          locale,
          structuredClone(flow.variants[locale].content),
        ]),
      ) as Publication["content"],
      sourceVersions: Object.fromEntries(
        flow.sourceIds.map((id) => [
          id,
          w.sources.find((s) => s.id === id)!.version,
        ]),
      ),
      reviewFingerprints: Object.fromEntries(
        locales.map((locale) => [locale, reviewFingerprint(flow, locale, w)]),
      ) as Publication["reviewFingerprints"],
      operationId: c.operationId,
    };
    w.publications = w.publications.filter((p) => p.workflowId !== flow.id);
    w.publications.push(publication);
    flow.stage = "published";
  }
  if (c.type === "unpublish") {
    if (!w.publications.some((p) => p.workflowId === flow.id))
      throw new WorkflowError("There is no public edition to withdraw.");
    w.publications = w.publications.filter((p) => p.workflowId !== flow.id);
    flow.stage = canPublish(flow, w) ? "approved" : "draft";
  }
  if (c.type === "restore") {
    const revision = w.revisions.find(
      (r) => r.id === c.revisionId && r.workflowId === flow.id,
    );
    if (!revision)
      throw new WorkflowError("Revision does not belong to this entry.");
    for (const locale of locales) {
      flow.variants[locale] = {
        ...structuredClone(revision.before.variants[locale]),
        version: flow.variants[locale].version + 1,
        approval: null,
      };
    }
    flow.variants.en.baseVersion = flow.variants.en.version;
    for (const locale of ["fi", "es"] as const)
      flow.variants[locale].baseVersion =
        revision.before.variants[locale].baseVersion ===
        revision.before.variants.en.version
          ? flow.variants.en.version
          : 0;
    flow.stage = "draft";
  }
  if (c.type === "revise-source") {
    if (!flow.sourceIds.includes(c.sourceId))
      throw new WorkflowError("Source is not attached to this entry.");
    const source = w.sources.find((s) => s.id === c.sourceId)!;
    source.excerpt = c.excerpt;
    source.version++;
    source.observedAt = c.at;
    for (const affected of w.workflows.filter((f) =>
      f.sourceIds.includes(source.id),
    )) {
      for (const locale of locales) affected.variants[locale].approval = null;
      if (affected.id !== flow.id) {
        affected.version++;
        affected.updatedAt = c.at;
      }
      affected.stage = "draft";
    }
  }
  flow.version++;
  flow.updatedAt = c.at;
  flow.lastOperationId = c.operationId;
  const revisionId = `revision-${c.operationId}`;
  flow.historyIds.push(revisionId);
  w.revisions.push({
    id: revisionId,
    workflowId: flow.id,
    operationId: c.operationId,
    commandHash: hash(c),
    action: c.type,
    actor: c.actor,
    at: c.at,
    reason: c.reason,
    before,
    after: structuredClone(flow),
  });
  return { workspace: w, workflow: flow, idempotent: false };
}
