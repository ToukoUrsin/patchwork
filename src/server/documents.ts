import type { Mutation, SanityDocument } from "@sanity/client";
import { hash, WorkflowError } from "../core/workflow";
import {
  locales,
  type Workspace,
  type Publication,
  type Workflow,
  type Source,
  type Revision,
  type Content,
} from "../core/types";
export const MANIFEST = "drafts.patchwork-manifest";
export type StoredDoc = {
  _id: string;
  _type: string;
  _rev?: string;
  [key: string]: unknown;
};
export const entryId = (id: string) => `drafts.patchwork-entry-${id}`;
export const sourceId = (id: string) => `drafts.patchwork-source-${id}`;
export const revisionId = (id: string) => `drafts.patchwork-${id}`;
export const publicationId = (id: string) => `patchwork-publication-${id}`;
export function documents(workspace: Workspace): StoredDoc[] {
  const workflows = workspace.workflows.map((flow) => ({
    _id: entryId(flow.id),
    _type: "patchworkEntry",
    ...flow,
  }));
  const sources = workspace.sources.map((source) => ({
    _id: sourceId(source.id),
    _type: "patchworkSource",
    ...source,
  }));
  const revisions = workspace.revisions.map((revision) => ({
    _id: revisionId(revision.id),
    _type: "patchworkRevision",
    ...revision,
  }));
  const publications = workspace.publications.map((publication) => ({
    _id: publicationId(publication.id),
    _type: "patchworkPublication",
    ...publication,
    sourceVersions: Object.entries(publication.sourceVersions).map(
      ([sourceId, version]) => ({ _key: sourceId, sourceId, version }),
    ),
    slug: workspace.workflows.find((f) => f.id === publication.workflowId)!
      .slug,
    section: workspace.workflows.find((f) => f.id === publication.workflowId)!
      .section,
  }));
  return [
    {
      _id: MANIFEST,
      _type: "patchworkManifest",
      schema: workspace.schema,
      workspaceHash: hash(workspace),
      workflowIds: workflows.map((d) => d._id),
      sourceIds: sources.map((d) => d._id),
      revisionIds: revisions.map((d) => d._id),
      publicationIds: publications.map((d) => d._id),
    },
    ...workflows,
    ...sources,
    ...revisions,
    ...publications,
  ];
}
const strip = (doc: StoredDoc) =>
  Object.fromEntries(
    Object.entries(doc).filter(
      ([key]) =>
        !["_id", "_type", "_rev", "_createdAt", "_updatedAt"].includes(key),
    ),
  );
export function fromDocuments(rows: StoredDoc[]): Workspace {
  const manifest = rows.find((d) => d._id === MANIFEST);
  if (!manifest)
    throw new WorkflowError(
      "The Sanity dataset is connected but has no Patchwork fixture. Seed it explicitly.",
      "unseeded",
    );
  const byId = new Map(rows.map((d) => [d._id, d]));
  const get = <T>(field: string): T[] => {
    const ids = manifest[field];
    if (!Array.isArray(ids) || ids.some((id) => typeof id !== "string"))
      throw new WorkflowError("Manifest is malformed.");
    return ids.map((id) => {
      const doc = byId.get(String(id));
      if (!doc)
        throw new WorkflowError(
          "The dataset snapshot is incomplete. Refresh before editing.",
          "conflict",
        );
      return strip(doc) as T;
    });
  };
  return {
    schema: "patchwork/v1",
    workflows: get<Workflow>("workflowIds"),
    sources: get<Source>("sourceIds"),
    revisions: get<Revision>("revisionIds"),
    publications: get<
      Publication & { sourceVersions: { sourceId: string; version: number }[] }
    >("publicationIds").map(
      ({
        id,
        workflowId,
        version,
        publishedAt,
        content,
        sourceVersions,
        reviewFingerprints,
        operationId,
      }) => ({
        id,
        workflowId,
        version,
        publishedAt,
        content,
        sourceVersions: Object.fromEntries(
          (
            sourceVersions as unknown as { sourceId: string; version: number }[]
          ).map((s) => [s.sourceId, s.version]),
        ),
        reviewFingerprints,
        operationId,
      }),
    ),
  };
}
// Guard all previously read app documents, including unchanged source evidence.
// The manifest provides an app-wide serializing lock. Per-document guards catch external edits.
export function planTransaction(
  before: Workspace,
  after: Workspace,
  revs: Record<string, string>,
): Mutation[] {
  const oldDocs = new Map(documents(before).map((d) => [d._id, d])),
    newDocs = new Map(documents(after).map((d) => [d._id, d]));
  const mutations: Mutation[] = [];
  for (const [id, oldDoc] of oldDocs) {
    if (!revs[id])
      throw new WorkflowError(
        `Missing Sanity revision for ${id}. Refresh before writing.`,
        "conflict",
      );
    const next = newDocs.get(id);
    if (!next) {
      mutations.push(
        { patch: { id, ifRevisionID: revs[id], set: { id: oldDoc.id } } },
        { delete: { id } },
      );
      continue;
    }
    const { _id, _type, ...fields } = next;
    mutations.push({ patch: { id, ifRevisionID: revs[id], set: fields } });
  }
  for (const [id, doc] of newDocs)
    if (!oldDocs.has(id)) mutations.push({ create: doc as SanityDocument });
  return mutations;
}
export function publicContent(
  publication: Publication,
  locale: string,
): Content | undefined {
  return locales.includes(locale as (typeof locales)[number])
    ? publication.content[locale as (typeof locales)[number]]
    : undefined;
}
