export const locales = ["en", "fi", "es"] as const;
export type Locale = (typeof locales)[number];
export const localeNames: Record<Locale, string> = {
  en: "English",
  fi: "Finnish",
  es: "Spanish",
};
export type Content = {
  title: string;
  summary: string;
  body: string;
  imageAlt: string;
  decorativeImage: boolean;
  accessNote: string;
  linkLabel: string;
};
export type Source = {
  id: string;
  title: string;
  kind: "access-audit" | "curatorial-note" | "translation-note";
  excerpt: string;
  version: number;
  observedAt: string;
  synthetic: true;
};
export type Approval = {
  fingerprint: string;
  reviewer: string;
  at: string;
  sourceChecked: boolean;
  languageChecked: boolean;
};
export type Variant = {
  content: Content;
  baseVersion: number;
  version: number;
  approval: Approval | null;
};
export type Stage = "draft" | "review" | "approved" | "published";
export type Workflow = {
  id: string;
  slug: string;
  section: string;
  accent: string;
  version: number;
  stage: Stage;
  sourceIds: string[];
  variants: Record<Locale, Variant>;
  historyIds: string[];
  lastOperationId: string;
  updatedAt: string;
};
export type Revision = {
  id: string;
  workflowId: string;
  operationId: string;
  commandHash: string;
  action: string;
  actor: string;
  at: string;
  reason: string;
  before: Workflow;
  after: Workflow;
};
export type Publication = {
  id: string;
  workflowId: string;
  version: number;
  publishedAt: string;
  content: Record<Locale, Content>;
  sourceVersions: Record<string, number>;
  reviewFingerprints: Record<Locale, string>;
  operationId: string;
};
export type Workspace = {
  schema: "patchwork/v1";
  workflows: Workflow[];
  sources: Source[];
  revisions: Revision[];
  publications: Publication[];
};
export const actors = {
  editor: { name: "Alex · demo editor", role: "editor" },
  reviewer: { name: "Bea · demo reviewer", role: "reviewer" },
  publisher: { name: "Cleo · demo publisher", role: "publisher" },
} as const;
export type Actor = keyof typeof actors;
export type CommandBase = {
  workflowId: string;
  expectedVersion: number;
  operationId: string;
  actor: Actor;
  at: string;
  reason: string;
};
export type Command = CommandBase &
  (
    | { type: "edit"; locale: Locale; content: Content }
    | { type: "request-review" }
    | {
        type: "approve";
        locale: Locale;
        sourceChecked: boolean;
        languageChecked: boolean;
      }
    | { type: "publish" }
    | { type: "unpublish" }
    | { type: "restore"; revisionId: string }
    | { type: "revise-source"; sourceId: string; excerpt: string }
  );
export type Finding = {
  code: string;
  severity: "error" | "warning";
  label: string;
  detail: string;
  field?: keyof Content;
};
export type CloudState = {
  connected: boolean;
  configured: boolean;
  canWrite: boolean;
  projectId: string | null;
  dataset: string | null;
  message: string;
  checkedAt: string;
  mode: "disconnected" | "read-only" | "connected";
  documentCount?: number;
};
export type Snapshot = {
  workspace: Workspace;
  cloud: CloudState;
  revisions: Record<string, string>;
};
