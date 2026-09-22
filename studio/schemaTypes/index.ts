import { defineField as f, defineType as t } from "sanity";
const string = (name: string, title = name) =>
  f({ name, title, type: "string" });
const number = (name: string) =>
  f({ name, type: "number", validation: (r) => r.integer().min(0) });
const strings = (name: string) =>
  f({ name, type: "array", of: [{ type: "string" }] });
const content = t({
  name: "patchworkContent",
  title: "Visitor content",
  type: "object",
  fields: [
    string("title"),
    f({ name: "summary", type: "text", rows: 2 }),
    f({ name: "body", type: "text" }),
    f({
      name: "imageAlt",
      title: "Image alternative text",
      type: "text",
      rows: 2,
    }),
    f({ name: "decorativeImage", type: "boolean" }),
    f({
      name: "accessNote",
      title: "Evidence-based access information",
      type: "text",
      rows: 3,
    }),
    string("linkLabel", "Descriptive link label"),
  ],
});
const approval = t({
  name: "patchworkApproval",
  title: "Version-bound review",
  type: "object",
  fields: [
    string("fingerprint"),
    string("reviewer"),
    f({ name: "at", type: "datetime" }),
    f({ name: "sourceChecked", type: "boolean" }),
    f({ name: "languageChecked", type: "boolean" }),
  ],
});
const variant = t({
  name: "patchworkVariant",
  title: "Localized revision",
  type: "object",
  fields: [
    f({ name: "content", type: "patchworkContent" }),
    number("baseVersion"),
    number("version"),
    f({ name: "approval", type: "patchworkApproval" }),
  ],
});
const variants = t({
  name: "patchworkVariants",
  title: "Languages and their source versions",
  type: "object",
  fields: ["en", "fi", "es"].map((name) =>
    f({ name, type: "patchworkVariant" }),
  ),
});
const entryFields = [
  string("id"),
  string("slug"),
  string("section"),
  string("accent"),
  number("version"),
  f({
    name: "stage",
    type: "string",
    options: { list: ["draft", "review", "approved", "published"] },
  }),
  strings("sourceIds"),
  f({ name: "variants", type: "patchworkVariants" }),
  strings("historyIds"),
  string("lastOperationId"),
  f({ name: "updatedAt", type: "datetime" }),
];
const state = t({
  name: "patchworkEntryState",
  title: "Entry snapshot",
  type: "object",
  fields: entryFields,
});
const entry = t({
  name: "patchworkEntry",
  title: "Editorial entries",
  type: "document",
  readOnly: true,
  description:
    "Managed by the Patchwork workflow API. Use the workbench so evidence checks and atomic revision guards run.",
  fields: entryFields,
  preview: {
    select: { title: "variants.en.content.title", subtitle: "stage" },
  },
});
const source = t({
  name: "patchworkSource",
  title: "Source evidence",
  type: "document",
  readOnly: true,
  fields: [
    string("id"),
    string("title"),
    f({
      name: "kind",
      type: "string",
      options: {
        list: ["access-audit", "curatorial-note", "translation-note"],
      },
    }),
    f({ name: "excerpt", type: "text" }),
    number("version"),
    f({ name: "observedAt", type: "datetime" }),
    f({ name: "synthetic", type: "boolean" }),
  ],
});
const revision = t({
  name: "patchworkRevision",
  title: "Workflow revisions",
  type: "document",
  readOnly: true,
  fields: [
    string("id"),
    string("workflowId"),
    string("operationId"),
    string("commandHash"),
    string("action"),
    string("actor"),
    f({ name: "at", type: "datetime" }),
    f({ name: "reason", type: "text" }),
    f({ name: "before", type: "patchworkEntryState" }),
    f({ name: "after", type: "patchworkEntryState" }),
  ],
  preview: { select: { title: "action", subtitle: "reason" } },
});
const contents = t({
  name: "patchworkPublishedContent",
  title: "Approved localized content",
  type: "object",
  fields: ["en", "fi", "es"].map((name) =>
    f({ name, type: "patchworkContent" }),
  ),
});
const publication = t({
  name: "patchworkPublication",
  title: "Public editions",
  type: "document",
  readOnly: true,
  fields: [
    string("id"),
    string("workflowId"),
    string("slug"),
    string("section"),
    number("version"),
    f({ name: "publishedAt", type: "datetime" }),
    f({ name: "content", type: "patchworkPublishedContent" }),
    string("operationId"),
    f({
      name: "sourceVersions",
      type: "array",
      of: [{ type: "object", fields: [string("sourceId"), number("version")] }],
    }),
    f({
      name: "reviewFingerprints",
      type: "object",
      fields: ["en", "fi", "es"].map((name) => string(name)),
    }),
  ],
  preview: { select: { title: "content.en.title", subtitle: "publishedAt" } },
});
const manifest = t({
  name: "patchworkManifest",
  title: "Workspace manifest",
  type: "document",
  readOnly: true,
  fields: [
    string("schema"),
    string("workspaceHash"),
    strings("workflowIds"),
    strings("sourceIds"),
    strings("revisionIds"),
    strings("publicationIds"),
  ],
});
export const schemaTypes = [
  content,
  approval,
  variant,
  variants,
  state,
  contents,
  entry,
  source,
  revision,
  publication,
  manifest,
];
