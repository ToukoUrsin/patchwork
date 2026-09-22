"use client";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowDownToLine,
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  Check,
  CheckCheck,
  ChevronDown,
  ChevronRight,
  Clock3,
  CloudOff,
  Code2,
  Columns3,
  ExternalLink,
  Eye,
  FileText,
  Globe2,
  History,
  Info,
  Languages,
  Leaf,
  Link2,
  LoaderCircle,
  LockKeyhole,
  PenLine,
  Plus,
  RefreshCcw,
  RotateCcw,
  Send,
  Settings2,
  ShieldCheck,
  Sparkles,
  Unplug,
  Upload,
  X,
} from "lucide-react";
import { makeFixture, suggestedContent } from "@/core/fixtures";
import {
  actors,
  locales,
  localeNames,
  type Actor,
  type CloudState,
  type Command,
  type Content,
  type Locale,
  type Snapshot,
  type Source,
  type Workspace,
} from "@/core/types";
import {
  applyCommand,
  canPublish,
  findings,
  freshApproval,
  hash,
  reviewFingerprint,
} from "@/core/workflow";

const blankCloud: CloudState = {
  connected: false,
  configured: false,
  canWrite: false,
  projectId: null,
  dataset: null,
  message: "Checking the Sanity connection…",
  checkedAt: "",
  mode: "disconnected",
};
const fieldLabels: Record<keyof Content, string> = {
  title: "Story title",
  summary: "Plain-language introduction",
  body: "The story",
  imageAlt: "Image description",
  decorativeImage: "This image is decorative",
  accessNote: "Getting there, with confidence",
  linkLabel: "Link destination label",
};
const stageText = {
  draft: "In the making",
  review: "In review",
  approved: "Ready to share",
  published: "Public edition",
};
function exportFile(name: string, value: unknown) {
  const url = URL.createObjectURL(
    new Blob([JSON.stringify(value, null, 2)], { type: "application/json" }),
  );
  const link = document.createElement("a");
  link.href = url;
  link.download = name;
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
function Art({
  kind = "loom",
  compact = false,
}: {
  kind?: string;
  compact?: boolean;
}) {
  return (
    <svg
      className={`object-art ${compact ? "compact" : ""}`}
      viewBox="0 0 440 310"
      role="img"
      aria-label={
        kind === "loom"
          ? "Stylized fictional handloom"
          : kind === "lantern"
            ? "Stylized fictional lantern"
            : "Stylized fictional garden beds"
      }
    >
      <defs>
        <pattern
          id={`dots-${kind}`}
          width="12"
          height="12"
          patternUnits="userSpaceOnUse"
        >
          <circle cx="2" cy="2" r=".65" fill="#a17f6850" />
        </pattern>
      </defs>
      <rect
        width="440"
        height="310"
        fill={
          kind === "loom"
            ? "#efddd2"
            : kind === "lantern"
              ? "#eee2bd"
              : "#dfe5d4"
        }
      />
      <rect width="440" height="310" fill={`url(#dots-${kind})`} />
      <ellipse cx="223" cy="259" rx="123" ry="15" fill="#68534915" />
      {kind === "loom" ? (
        <g>
          <path
            d="M110 79L111 257M326 79L326 257M117 235L96 258M320 235L343 258"
            stroke="#766352"
            strokeWidth="13"
            strokeLinecap="round"
          />
          <path
            d="M104 88H332M121 215H316"
            stroke="#a68063"
            strokeWidth="18"
            strokeLinecap="round"
          />
          <path
            d="M137 83V209M150 83V209M163 83V209M176 83V209M189 83V209M202 83V209M215 83V209M228 83V209M241 83V209M254 83V209M267 83V209M280 83V209M293 83V209"
            stroke="#fff8e3"
            strokeWidth="4"
          />
          <path d="M133 166H303V212H133Z" fill="#bb725f" />
          <path
            d="M135 175H301M135 187H301M135 199H301"
            stroke="#e5b690"
            strokeWidth="4"
          />
          <path
            d="M136 174V213M151 174V213M167 174V213M183 174V213M199 174V213M215 174V213M231 174V213M247 174V213M263 174V213M279 174V213M295 174V213"
            stroke="#965743"
            strokeWidth="2"
          />
          <path
            d="M105 78L96 47M331 78L341 47M94 45H343"
            stroke="#997157"
            strokeWidth="10"
            strokeLinecap="round"
          />
          <path d="M151 238L217 232L238 239L172 244Z" fill="#c59268" />
          <path
            d="M277 232l3 6 7 1-5 5 1 7-6-3-6 3 1-7-5-5 7-1z"
            fill="#c59873"
          />
        </g>
      ) : kind === "lantern" ? (
        <g>
          <path
            d="M174 85V68C174 13 265 13 265 68V85"
            fill="none"
            stroke="#8c7c51"
            strokeWidth="9"
          />
          <path d="M162 96L182 74H258L278 96V239H162Z" fill="#7c8171" />
          <rect x="175" y="108" width="92" height="119" rx="3" fill="#a4a58b" />
          <path
            d="M188 140l4 8 9 1-6 6 1 9-8-4-8 4 1-9-6-6 9-1M235 170l4 8 9 1-6 6 1 9-8-4-8 4 1-9-6-6 9-1M234 116l4 8 9 1-6 6 1 9-8-4-8 4 1-9-6-6 9-1"
            fill="#ffebb2"
          />
          <rect x="151" y="238" width="139" height="13" rx="4" fill="#696f60" />
        </g>
      ) : (
        <g>
          {[0, 1, 2].map((i) => (
            <g key={i} transform={`translate(${i * 93},${(i % 2) * -28})`}>
              <path d="M62 184L106 166L175 181L129 203Z" fill="#816b52" />
              <path d="M62 184V223L129 244V203Z" fill="#b29373" />
              <path d="M129 203V244L175 222V181Z" fill="#947757" />
              <path
                d="M112 191V127M124 195V141M139 187V118"
                stroke="#77835d"
                strokeWidth="5"
              />
              <ellipse
                cx="101"
                cy="142"
                rx="16"
                ry="9"
                transform="rotate(30 101 142)"
                fill="#8e9d71"
              />
              <ellipse
                cx="126"
                cy="132"
                rx="16"
                ry="9"
                transform="rotate(-30 126 132)"
                fill="#74875b"
              />
              <ellipse
                cx="153"
                cy="154"
                rx="17"
                ry="10"
                transform="rotate(-25 153 154)"
                fill="#9dab7b"
              />
            </g>
          ))}
        </g>
      )}
    </svg>
  );
}

export default function Workbench() {
  const [workspace, setWorkspace] = useState<Workspace>(makeFixture),
    [cloud, setCloud] = useState(blankCloud),
    [seeded, setSeeded] = useState(false),
    [loading, setLoading] = useState(true),
    [busy, setBusy] = useState(false);
  const [entry, setEntry] = useState("loom"),
    [locale, setLocale] = useState<Locale>("en"),
    [actor, setActor] = useState<Actor>("editor"),
    [view, setView] = useState("edit"),
    [panel, setPanel] = useState("checks"),
    [modal, setModal] = useState<
      "connect" | "review" | "source" | "method" | null
    >(null),
    [toast, setToast] = useState(""),
    [error, setError] = useState("");
  const [form, setForm] = useState<Content>(
      makeFixture().workflows[0].variants.en.content,
    ),
    [reason, setReason] = useState(
      "Clarify this story using the attached source evidence.",
    ),
    [review, setReview] = useState({
      sourceChecked: false,
      languageChecked: false,
    }),
    [activeSource, setActiveSource] = useState<Source | null>(null),
    [sourceText, setSourceText] = useState("");
  const current =
    workspace.workflows.find((f) => f.id === entry) ?? workspace.workflows[0];
  const isCloud = cloud.connected && cloud.canWrite && seeded;
  const issues = useMemo(
    () =>
      findings(
        {
          ...current,
          variants: {
            ...current.variants,
            [locale]: { ...current.variants[locale], content: form },
          },
        },
        locale,
        workspace,
      ),
    [current, form, locale, workspace],
  );
  const allIssues = locales.flatMap((l) =>
    findings(current, l, workspace)
      .filter((f) => f.severity === "error")
      .map((f) => ({ ...f, locale: l })),
  );
  const approvalCount = locales.filter((l) =>
    freshApproval(current, l, workspace),
  ).length;
  const dirty = hash(form) !== hash(current.variants[locale].content);
  const publicEdition = workspace.publications.find(
    (p) => p.workflowId === current.id,
  );
  const revisions = [...workspace.revisions]
    .filter((r) => r.workflowId === current.id)
    .reverse();
  useEffect(() => {
    void refresh(true);
  }, []);
  useEffect(() => {
    setForm(structuredClone(current.variants[locale].content));
    setReview({ sourceChecked: false, languageChecked: false });
  }, [current.id, current.version, locale]);
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(""), 5000);
    return () => clearTimeout(timer);
  }, [toast]);
  useEffect(() => {
    if (loading || isCloud) return;
    try {
      localStorage.setItem("patchwork-rehearsal-v1", JSON.stringify(workspace));
    } catch {}
  }, [workspace, isCloud, loading]);
  async function refresh(initial = false) {
    setLoading(true);
    try {
      const response = await fetch("/api/workspace", { cache: "no-store" });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      const s = data as Snapshot;
      setCloud(s.cloud);
      setSeeded(Object.keys(s.revisions).length > 0);
      if (
        s.cloud.connected &&
        s.cloud.canWrite &&
        Object.keys(s.revisions).length > 0
      )
        setWorkspace(s.workspace);
      else if (initial) {
        try {
          const saved = JSON.parse(
            localStorage.getItem("patchwork-rehearsal-v1") ?? "null",
          );
          if (
            saved?.schema === "patchwork/v1" &&
            saved.workflows?.length === 3 &&
            Array.isArray(saved.revisions) &&
            Array.isArray(saved.sources) &&
            Array.isArray(saved.publications)
          ) {
            setWorkspace(saved);
          } else setWorkspace(makeFixture());
        } catch {
          setWorkspace(makeFixture());
        }
      } else if (!initial) setToast(s.cloud.message);
    } catch (e) {
      setCloud({
        ...blankCloud,
        message:
          "Connection check failed. The local rehearsal is not a cloud publication.",
      });
      setError(e instanceof Error ? e.message : "Connection failed");
    } finally {
      setLoading(false);
    }
  }
  async function command(action: Record<string, unknown>) {
    setBusy(true);
    setError("");
    const cmd = {
      ...action,
      workflowId: current.id,
      expectedVersion: current.version,
      operationId: crypto.randomUUID(),
      actor,
      at: new Date().toISOString(),
      reason,
    };
    try {
      if (isCloud) {
        const response = await fetch("/api/command", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(cmd),
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error);
        setWorkspace(data.workspace);
        setToast(
          action.type === "publish"
            ? "Published to Sanity and verified by readback."
            : action.type === "unpublish"
              ? "Public edition withdrawn; Sanity readback verified."
              : "Saved to Sanity. Revision and operation receipt verified.",
        );
      } else {
        if (["publish", "unpublish"].includes(String(action.type)))
          throw new Error(
            "Connect a real Sanity dataset before publishing. No publication occurred.",
          );
        const result = applyCommand(workspace, cmd);
        setWorkspace(result.workspace);
        setToast(
          "Saved in the local rehearsal. Sanity is not connected; nothing was published.",
        );
      }
      setModal(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Change failed");
    } finally {
      setBusy(false);
    }
  }
  async function seed() {
    setBusy(true);
    setError("");
    try {
      const response = await fetch("/api/seed", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ confirm: "seed-public-synthetic-content" }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      setWorkspace(data.workspace);
      setSeeded(true);
      setModal(null);
      setToast(
        "Three synthetic draft entries and six sources created in Sanity. No public edition created.",
      );
    } catch (e) {
      setError(e instanceof Error ? e.message : "Seed failed");
    } finally {
      setBusy(false);
    }
  }
  const restoreFixture = () => {
    if (isCloud) {
      setToast(
        "Connected content is preserved. Use revision history to restore a draft.",
      );
      return;
    }
    setWorkspace(makeFixture());
    setEntry("loom");
    setLocale("en");
    setToast("Local rehearsal restored. No Sanity data changed.");
  };
  function sourceModal(source: Source) {
    setActiveSource(source);
    setSourceText(source.excerpt);
    setModal("source");
    setError("");
  }
  return (
    <div className="pw-shell">
      <aside className="sidebar">
        <a className="wordmark" href="/">
          patchwork<span>STORIES FOR EVERYONE</span>
        </a>
        <div className="workspace-name">
          <span className="workspace-icon">
            <Leaf size={19} />
          </span>
          <div>
            Fieldnote Museum<small>Fictional collection</small>
          </div>
          <ChevronDown size={14} />
        </div>
        <div className="nav-label">YOUR WORKSPACE</div>
        <button className="nav-item active" onClick={() => setView("edit")}>
          <Columns3 size={17} /> Stories <span>3</span>
        </button>
        <button
          className="nav-item"
          onClick={() => {
            setPanel("history");
            setView("edit");
          }}
        >
          <History size={17} /> Revision trail{" "}
          <span>{workspace.revisions.length}</span>
        </button>
        <a className="nav-item" href="/visit" target="_blank" rel="noreferrer">
          <Globe2 size={17} /> Public editions <ArrowUpRight size={13} />
        </a>
        <div className="sidebar-divider" />
        <div className="nav-label">
          THE COLLECTION <span>03</span>
        </div>
        <div className="story-nav">
          {workspace.workflows.map((flow) => (
            <button
              key={flow.id}
              className={flow.id === current.id ? "selected" : ""}
              onClick={() => {
                if (dirty) {
                  setToast(
                    "Unsaved form edits were left behind; saved revisions are preserved.",
                  );
                }
                setEntry(flow.id);
                setView("edit");
                setError("");
              }}
            >
              <span style={{ background: flow.accent }} />
              <div>
                {flow.variants.en.content.title}
                <small>{flow.section}</small>
              </div>
              <ChevronRight size={12} />
            </button>
          ))}
        </div>
        <div className="sidebar-bottom">
          <div className="sidebar-note">
            <span>Every story has a way in.</span>
            <p>
              A clearer sentence. A useful description. A translation that stays
              in step.
            </p>
            <div className="mini-patches">
              <i />
              <i />
              <i />
              <i />
            </div>
          </div>
          <button
            className={`connection-button ${isCloud ? "online" : ""}`}
            onClick={() => {
              setModal("connect");
              setError("");
            }}
          >
            {isCloud ? <CheckCheck size={16} /> : <CloudOff size={16} />}
            <div>
              {isCloud ? "Sanity connected" : "Sanity disconnected"}
              <small>
                {isCloud
                  ? `${cloud.projectId} / ${cloud.dataset}`
                  : "Local rehearsal only"}
              </small>
            </div>
            <Settings2 size={13} />
          </button>
        </div>
      </aside>
      <main className="workbench">
        <header className="page-top">
          <div className="breadcrumbs">
            Collection <ChevronRight size={12} />{" "}
            <span>{current.variants.en.content.title}</span>
          </div>
          <div className="top-right">
            <span className="demo-label">SYNTHETIC MUSEUM TRAIL</span>
            <button
              className="small-icon"
              aria-label="Reload from Sanity"
              disabled={busy}
              onClick={() => void refresh()}
            >
              <RefreshCcw size={16} className={loading ? "spin" : ""} />
            </button>
            <button className="top-info" onClick={() => setModal("method")}>
              <Info size={15} /> Method
            </button>
          </div>
        </header>
        <section className="welcome">
          <div className="welcome-copy">
            <span className="section-kicker">
              <span /> SMALL CHANGES. MORE WAYS IN.
            </span>
            <h1>
              Every visitor belongs
              <br />
              in the <em>story.</em>
            </h1>
            <p>
              Shape a museum trail that welcomes more people.
              <br />
              Keep every language connected to its evidence.
            </p>
          </div>
          <div className="patchwork-illustration" aria-hidden="true">
            <div className="patch patch-a">
              <span>Aa</span>
              <small>plain language</small>
            </div>
            <div className="patch patch-b">
              <Languages size={34} />
              <small>three ways to say it</small>
            </div>
            <div className="patch patch-c">
              <Eye size={29} />
              <small>a useful description</small>
            </div>
            <div className="patch patch-d">
              <span>✳</span>
              <small>room for everyone</small>
            </div>
            <div className="seam seam-h" />
            <div className="seam seam-v" />
          </div>
        </section>
        <div className={`connection-strip ${isCloud ? "verified" : ""}`}>
          <div>
            {isCloud ? <CheckCheck size={15} /> : <Unplug size={15} />}
            <span>
              {isCloud
                ? "Live Sanity workspace. Each change is revision-guarded and read back."
                : "You’re in a local rehearsal. No Sanity publication has happened."}
            </span>
          </div>
          <button onClick={() => setModal("connect")}>
            {isCloud ? "Connection details" : "Connect Sanity"}
            <ArrowRight size={13} />
          </button>
        </div>
        <section className="editor-heading">
          <div>
            <span className="section-kicker">{current.section}</span>
            <h2>
              {current.variants.en.content.title}
              <span className={`stage stage-${current.stage}`}>
                {stageText[current.stage]}
              </span>
            </h2>
          </div>
          <div className="heading-actions">
            <button
              className={`button ghost ${view === "preview" ? "chosen" : ""}`}
              onClick={() => setView(view === "preview" ? "edit" : "preview")}
            >
              <Eye size={15} />
              {view === "preview" ? "Back to editor" : "Preview visitor view"}
            </button>
            <button
              className="button pale"
              onClick={() =>
                exportFile("patchwork-editorial-evidence.json", {
                  schema: "patchwork-export/v1",
                  scope: isCloud
                    ? "Sanity readback snapshot"
                    : "Local rehearsal, no cloud publication",
                  projectId: cloud.projectId,
                  dataset: cloud.dataset,
                  workspace,
                  digest: hash(workspace),
                })
              }
            >
              <ArrowDownToLine size={15} /> Evidence
            </button>
          </div>
        </section>
        <div className="editor-grid">
          <section className="content-panel">
            <div className="language-tabs">
              {locales.map((l) => (
                <button
                  className={locale === l ? "active" : ""}
                  key={l}
                  onClick={() => {
                    setLocale(l);
                    setError("");
                  }}
                >
                  <span>{l.toUpperCase()}</span>
                  {localeNames[l]}
                  {freshApproval(current, l, workspace) ? (
                    <Check size={12} />
                  ) : current.variants[l].baseVersion !==
                      current.variants.en.version && l !== "en" ? (
                    <i className="outdated-dot" />
                  ) : null}
                </button>
              ))}
              <div className="revision-label">
                v{current.variants[locale].version}
                <span>·</span>
                {locale === "en"
                  ? "source language"
                  : `from EN v${current.variants[locale].baseVersion}`}
              </div>
            </div>
            {view === "preview" ? (
              <div className="visitor-preview">
                <div className="preview-ribbon">
                  <Eye size={13} /> DRAFT PREVIEW · NOT A PUBLICATION
                </div>
                <Art kind={current.id} />
                <div className="preview-copy" lang={locale}>
                  <span className="section-kicker">{current.section}</span>
                  <h2>{form.title}</h2>
                  <p className="preview-summary">
                    {form.summary || "Add a plain-language introduction."}
                  </p>
                  <p>{form.body}</p>
                  <aside>
                    <span>YOUR VISIT</span>
                    {form.accessNote ||
                      "Access information has not been written yet."}
                  </aside>
                  <button
                    type="button"
                    className="preview-link"
                    onClick={() =>
                      setToast(
                        "Preview link label only; no destination is configured in this fictional trail.",
                      )
                    }
                  >
                    {form.linkLabel || "Add a destination label"}{" "}
                    <ArrowUpRight size={15} />
                  </button>
                  <small>
                    Image alt:{" "}
                    {form.decorativeImage
                      ? "Empty (decorative)"
                      : form.imageAlt || "Missing description"}
                  </small>
                </div>
              </div>
            ) : (
              <>
                <div className="story-art">
                  <Art kind={current.id} />
                  <span className="art-label">
                    AUTHORED VECTOR ILLUSTRATION · FICTIONAL OBJECT
                  </span>
                  <div className="object-number">
                    {current.id === "loom"
                      ? "01"
                      : current.id === "lantern"
                        ? "02"
                        : "03"}
                    <small>FIELDNOTES</small>
                  </div>
                </div>
                <div className="content-form">
                  <div className="form-intro">
                    <span>
                      <PenLine size={14} /> {localeNames[locale]} editorial
                      draft
                    </span>
                    <button
                      className="suggestion"
                      disabled={busy || actor !== "editor"}
                      onClick={() => {
                        setForm(
                          structuredClone(suggestedContent[current.id][locale]),
                        );
                        setToast(
                          "Loaded the authored fixture suggestion. Review it against the source, then save. No AI inference ran.",
                        );
                      }}
                    >
                      <Sparkles size={13} /> Use authored suggestion
                    </button>
                  </div>
                  {(
                    [
                      "title",
                      "summary",
                      "body",
                      "imageAlt",
                      "accessNote",
                      "linkLabel",
                    ] as (keyof Content)[]
                  ).map((field) => (
                    <label
                      className={`field ${issues.some((i) => i.field === field && i.severity === "error") ? "needs-work" : ""}`}
                      key={field}
                    >
                      <span>
                        {fieldLabels[field]}
                        {[
                          "imageAlt",
                          "accessNote",
                          "summary",
                          "linkLabel",
                        ].includes(field) && (
                          <small>
                            {field === "imageAlt"
                              ? "Describe what matters, not every pixel."
                              : field === "accessNote"
                                ? "Use specific facts from the attached access note."
                                : field === "summary"
                                  ? "A short invitation into the story."
                                  : "A label that makes sense on its own."}
                          </small>
                        )}
                      </span>
                      {["title", "linkLabel"].includes(field) ? (
                        <input
                          value={form[field] as string}
                          disabled={busy || actor !== "editor"}
                          maxLength={field === "title" ? 100 : 120}
                          onChange={(e) =>
                            setForm((f) => ({ ...f, [field]: e.target.value }))
                          }
                        />
                      ) : (
                        <textarea
                          value={form[field] as string}
                          disabled={busy || actor !== "editor"}
                          rows={
                            field === "body"
                              ? 5
                              : field === "accessNote"
                                ? 3
                                : 2
                          }
                          maxLength={
                            field === "body"
                              ? 12000
                              : field === "accessNote"
                                ? 1000
                                : 350
                          }
                          onChange={(e) =>
                            setForm((f) => ({ ...f, [field]: e.target.value }))
                          }
                        />
                      )}{" "}
                      {issues
                        .filter((i) => i.field === field)
                        .map((i) => (
                          <div className="field-hint" key={i.code}>
                            <Info size={11} />
                            {i.label}
                          </div>
                        ))}
                      {field === "imageAlt" && (
                        <span className="decorative-choice">
                          <input
                            type="checkbox"
                            checked={form.decorativeImage}
                            disabled={actor !== "editor"}
                            onChange={(e) =>
                              setForm((f) => ({
                                ...f,
                                decorativeImage: e.target.checked,
                              }))
                            }
                          />{" "}
                          This image is purely decorative
                        </span>
                      )}
                    </label>
                  ))}
                  <label className="field reason-field">
                    <span>Why this change?</span>
                    <input
                      value={reason}
                      maxLength={500}
                      onChange={(e) => setReason(e.target.value)}
                    />
                  </label>
                </div>
              </>
            )}
            <div className="save-bar">
              <span className={dirty ? "unsaved" : ""}>
                <span />
                {dirty
                  ? "Unsaved form changes"
                  : isCloud
                    ? "Saved Sanity revision"
                    : "Saved local rehearsal"}
              </span>
              <button
                className="button dark"
                disabled={busy || !dirty || actor !== "editor"}
                onClick={() =>
                  void command({ type: "edit", locale, content: form })
                }
              >
                {busy ? (
                  <LoaderCircle className="spin" size={14} />
                ) : (
                  <Check size={14} />
                )}{" "}
                {isCloud ? "Save to Sanity" : "Save rehearsal"}
              </button>
            </div>
          </section>
          <aside className="review-panel">
            <div className="review-top">
              <div>
                <ShieldCheck size={18} />
                <h3>A little care, before sharing.</h3>
              </div>
              <p>Good intentions need a few concrete checks.</p>
            </div>
            <div className="review-tabs">
              {[
                ["checks", "Quality checks"],
                ["sources", "Sources"],
                ["history", "History"],
              ].map(([k, label]) => (
                <button
                  key={k}
                  onClick={() => setPanel(k)}
                  className={panel === k ? "active" : ""}
                >
                  {label}
                  {k === "checks" && (
                    <span>
                      {issues.filter((i) => i.severity === "error").length}
                    </span>
                  )}
                </button>
              ))}
            </div>
            {panel === "checks" && (
              <div className="checks-body">
                <div
                  className={`quality-summary ${issues.some((i) => i.severity === "error") ? "attention" : "clear"}`}
                >
                  <span>
                    {issues.filter((i) => i.severity === "error").length || (
                      <Check size={21} />
                    )}
                  </span>
                  <div>
                    <strong>
                      {issues.some((i) => i.severity === "error")
                        ? "A few stitches need attention."
                        : "This language is ready for review."}
                    </strong>
                    <p>
                      {issues.some((i) => i.severity === "error")
                        ? "Clear these gates before the draft moves on."
                        : "Mechanical checks passed. A person still needs to review the meaning."}
                    </p>
                  </div>
                </div>
                {issues.length ? (
                  issues.map((issue) => (
                    <div
                      className={`quality-item ${issue.severity}`}
                      key={issue.code}
                    >
                      <span>
                        {issue.severity === "error" ? (
                          <Info size={13} />
                        ) : (
                          <Eye size={13} />
                        )}
                      </span>
                      <div>
                        <strong>{issue.label}</strong>
                        <p>{issue.detail}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="quality-item success">
                    <span>
                      <Check size={13} />
                    </span>
                    <div>
                      <strong>
                        Descriptions, links and access notes are present.
                      </strong>
                      <p>
                        These checks do not certify WCAG conformance or
                        translation accuracy.
                      </p>
                    </div>
                  </div>
                )}
                <div className="language-status">
                  <div className="tiny-title">ONE STORY, THREE LANGUAGES</div>
                  {locales.map((l) => (
                    <button key={l} onClick={() => setLocale(l)}>
                      <span>{l.toUpperCase()}</span>
                      <strong>{localeNames[l]}</strong>
                      {freshApproval(current, l, workspace) ? (
                        <em className="approved">
                          Reviewed <Check size={11} />
                        </em>
                      ) : l !== "en" &&
                        current.variants[l].baseVersion !==
                          current.variants.en.version ? (
                        <em className="stale">Source changed</em>
                      ) : (
                        <em>Needs review</em>
                      )}
                    </button>
                  ))}
                </div>
                <div className="evidence-nudge">
                  <Link2 size={15} />
                  <div>
                    <strong>
                      Grounded in {current.sourceIds.length} source notes
                    </strong>
                    <p>The review fingerprint includes their versions.</p>
                    <button onClick={() => setPanel("sources")}>
                      Inspect the evidence <ArrowRight size={12} />
                    </button>
                  </div>
                </div>
              </div>
            )}
            {panel === "sources" && (
              <div className="sources-body">
                <p className="panel-explainer">
                  These are authored synthetic source notes, not a real museum
                  survey. Changes invalidate every affected approval.
                </p>
                {workspace.sources
                  .filter((s) => current.sourceIds.includes(s.id))
                  .map((source) => (
                    <button
                      className="source-card"
                      key={source.id}
                      onClick={() => sourceModal(source)}
                    >
                      <span>
                        <FileText size={15} />
                        {source.kind === "access-audit"
                          ? "ACCESS EVIDENCE"
                          : "CURATORIAL EVIDENCE"}
                        <em>v{source.version}</em>
                      </span>
                      <h4>{source.title}</h4>
                      <p>{source.excerpt}</p>
                      <small>
                        Synthetic fixture ·{" "}
                        {new Date(source.observedAt).toLocaleDateString(
                          "en-GB",
                        )}{" "}
                        <ArrowUpRight size={12} />
                      </small>
                    </button>
                  ))}
              </div>
            )}
            {panel === "history" && (
              <div className="history-body">
                <p className="panel-explainer">
                  Each transition keeps its reason and a complete before/after
                  snapshot. Restoring creates a new draft; it never republishes
                  an old edition.
                </p>
                {revisions.length ? (
                  revisions.map((revision) => (
                    <div className="history-card" key={revision.id}>
                      <span className="history-dot" />
                      <div>
                        <div>
                          <strong>
                            {revision.action.replaceAll("-", " ")}
                          </strong>
                          <small>v{revision.after.version}</small>
                        </div>
                        <p>{revision.reason}</p>
                        <span>
                          {actors[revision.actor as Actor]?.name ??
                            revision.actor}{" "}
                          ·{" "}
                          {new Date(revision.at).toLocaleTimeString("en-GB", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                        <button
                          disabled={busy || actor !== "editor"}
                          onClick={() =>
                            void command({
                              type: "restore",
                              revisionId: revision.id,
                            })
                          }
                        >
                          <RotateCcw size={11} /> Restore content from before
                          this change
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="empty-history">
                    <History size={28} />
                    <p>The first saved change starts the trail.</p>
                  </div>
                )}
              </div>
            )}
            <div className="workflow-actions">
              <div className="actor-control">
                <span>DEMO WORKFLOW ROLE</span>
                <select
                  value={actor}
                  onChange={(e) => setActor(e.target.value as Actor)}
                  disabled={busy}
                >
                  {Object.entries(actors).map(([key, value]) => (
                    <option key={key} value={key}>
                      {value.name}
                    </option>
                  ))}
                </select>
                <small>
                  Role rehearsal, not authenticated multi-user review.
                </small>
              </div>
              <div className="workflow-steps">
                <span className="done" />
                <i />
                <span
                  className={
                    ["review", "approved", "published"].includes(current.stage)
                      ? "done"
                      : ""
                  }
                />
                <i />
                <span
                  className={
                    ["approved", "published"].includes(current.stage)
                      ? "done"
                      : ""
                  }
                />
                <i />
                <span className={current.stage === "published" ? "done" : ""} />
              </div>
              <div className="workflow-labels">
                <span>Draft</span>
                <span>Review</span>
                <span>Ready</span>
                <span>Public</span>
              </div>
              {actor === "editor" && (
                <button
                  className="button full pale"
                  disabled={
                    busy ||
                    dirty ||
                    current.stage !== "draft" ||
                    allIssues.length > 0
                  }
                  onClick={() => void command({ type: "request-review" })}
                >
                  <Send size={14} /> Request review
                </button>
              )}
              {actor === "reviewer" && (
                <button
                  className="button full pale"
                  disabled={
                    busy ||
                    dirty ||
                    current.stage !== "review" ||
                    freshApproval(current, locale, workspace)
                  }
                  onClick={() => {
                    setReview({ sourceChecked: false, languageChecked: false });
                    setError("");
                    setModal("review");
                  }}
                >
                  <ShieldCheck size={14} /> Review {localeNames[locale]}
                </button>
              )}
              {actor === "publisher" && (
                <button
                  className="button full dark"
                  disabled={
                    busy ||
                    dirty ||
                    !isCloud ||
                    current.stage !== "approved" ||
                    !canPublish(current, workspace)
                  }
                  onClick={() => void command({ type: "publish" })}
                >
                  <Upload size={14} />{" "}
                  {isCloud
                    ? "Publish approved edition"
                    : "Connect Sanity to publish"}
                </button>
              )}
              <p className="action-explainer">
                {allIssues.length
                  ? `${allIssues.length} blocking check${allIssues.length === 1 ? "" : "s"} across the full story.`
                  : `${approvalCount} of 3 language reviews are current.`}
                {!isCloud ? " Local changes stay unpublished." : ""}
              </p>
              {publicEdition && (
                <div className="publication-state">
                  <Globe2 size={14} />
                  <p>
                    Public edition v{publicEdition.version}
                    {publicEdition.version !== current.version
                      ? " remains available while this draft changes."
                      : "."}
                    <a href="/visit" target="_blank" rel="noreferrer">
                      View public edition <ArrowUpRight size={11} />
                    </a>
                  </p>
                  {actor === "publisher" && isCloud && (
                    <button
                      onClick={() => void command({ type: "unpublish" })}
                      disabled={busy}
                    >
                      Withdraw
                    </button>
                  )}
                </div>
              )}
            </div>
          </aside>
        </div>
        {error && (
          <div className="error-banner" role="alert">
            <Info size={17} />
            <span>{error}</span>
            <button onClick={() => setError("")} aria-label="Dismiss error">
              <X size={15} />
            </button>
          </div>
        )}
        <footer className="workbench-footer">
          <span>Crafted with care. Reviewed with evidence.</span>
          <div>
            <button onClick={restoreFixture}>Restore local fixture</button>
            <i /> AI-assisted build · no runtime inference <i />
            <button onClick={() => setModal("method")}>What this proves</button>
          </div>
        </footer>
      </main>
      {toast && (
        <div className="toast" role="status">
          <Check size={16} />
          <span>{toast}</span>
          <button
            aria-label="Dismiss notification"
            onClick={() => setToast("")}
          >
            <X size={15} />
          </button>
        </div>
      )}
      {modal && (
        <div
          className="dialog-backdrop"
          onClick={(e) => {
            if (e.target === e.currentTarget) setModal(null);
          }}
        >
          <section
            className="dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby="dialog-title"
          >
            <button
              className="dialog-close"
              aria-label="Close dialog"
              onClick={() => setModal(null)}
            >
              <X size={20} />
            </button>
            {modal === "connect" && (
              <>
                <span className="section-kicker">
                  <Unplug size={13} /> CONNECT THE CONTENT LAKE
                </span>
                <h2 id="dialog-title">A real home for the story.</h2>
                <p>
                  Local rehearsal is useful. A public edition requires a
                  verified Sanity transaction and readback.
                </p>
                <div
                  className={`connection-result ${cloud.connected ? "success" : ""}`}
                >
                  <strong>
                    {cloud.connected ? "Connection verified" : "Not connected"}
                  </strong>
                  <p>{cloud.message}</p>
                  {cloud.projectId && (
                    <code>
                      {cloud.projectId} / {cloud.dataset}
                    </code>
                  )}
                </div>
                <ol className="setup-steps">
                  <li>
                    Create a dedicated Sanity project and public dataset for
                    these synthetic fixtures.
                  </li>
                  <li>
                    Set <code>SANITY_PROJECT_ID</code>,{" "}
                    <code>SANITY_DATASET</code> and a server-only{" "}
                    <code>SANITY_API_TOKEN</code> in <code>.env.local</code>.
                    Never put a token in browser code.
                  </li>
                  <li>
                    Restart the local app, verify the connection, then
                    explicitly seed the three draft stories. Nothing is
                    published by seeding.
                  </li>
                </ol>
                <div className="dialog-actions">
                  <button
                    className="button pale"
                    onClick={() => void refresh()}
                    disabled={loading}
                  >
                    <RefreshCcw size={14} /> Check connection
                  </button>
                  {cloud.connected && cloud.canWrite && !seeded && (
                    <button
                      className="button dark"
                      disabled={busy}
                      onClick={() => void seed()}
                    >
                      <Plus size={14} /> Seed synthetic drafts
                    </button>
                  )}
                </div>
                <p className="dialog-note">
                  Root owns account setup. Remote deployments are read-only;
                  authoring is available on localhost. Sanity credentials never
                  appear in exports.
                </p>
              </>
            )}
            {modal === "review" && (
              <>
                <span className="section-kicker">
                  <ShieldCheck size={13} /> A REVIEW THAT FOLLOWS THE VERSION
                </span>
                <h2 id="dialog-title">Read it with someone in mind.</h2>
                <p>
                  Review the {localeNames[locale]} draft against the evidence.
                  These are explicitly demo role actions; no independent human
                  assessment is implied.
                </p>
                <div className="review-excerpt">
                  <strong>{current.variants[locale].content.title}</strong>
                  <p>{current.variants[locale].content.summary}</p>
                  <small>
                    EN source v{current.variants.en.version} ·{" "}
                    {locale.toUpperCase()} v{current.variants[locale].version}
                  </small>
                </div>
                <label className="review-checkbox">
                  <input
                    type="checkbox"
                    checked={review.sourceChecked}
                    onChange={(e) =>
                      setReview((r) => ({
                        ...r,
                        sourceChecked: e.target.checked,
                      }))
                    }
                  />
                  <span>
                    I checked factual and access statements against the attached
                    source notes.
                  </span>
                </label>
                <label className="review-checkbox">
                  <input
                    type="checkbox"
                    checked={review.languageChecked}
                    onChange={(e) =>
                      setReview((r) => ({
                        ...r,
                        languageChecked: e.target.checked,
                      }))
                    }
                  />
                  <span>
                    I checked this language, descriptions and links for clarity
                    and meaning.
                  </span>
                </label>
                <div className="review-fingerprint">
                  <LockKeyhole size={13} />
                  <code>
                    {reviewFingerprint(current, locale, workspace).slice(0, 20)}
                    …
                  </code>
                  <span>Bound to content + source versions</span>
                </div>
                <div className="dialog-actions">
                  <button
                    className="button dark"
                    disabled={
                      busy || !review.sourceChecked || !review.languageChecked
                    }
                    onClick={() =>
                      void command({ type: "approve", locale, ...review })
                    }
                  >
                    <CheckCheck size={15} /> Record demo review
                  </button>
                </div>
              </>
            )}
            {modal === "source" && activeSource && (
              <>
                <span className="section-kicker">
                  <FileText size={13} /> SYNTHETIC SOURCE EVIDENCE · V
                  {activeSource.version}
                </span>
                <h2 id="dialog-title">{activeSource.title}</h2>
                <p>
                  Changing this source invalidates the associated language
                  reviews. Existing public editions remain until a publisher
                  explicitly withdraws or replaces them.
                </p>
                <textarea
                  className="source-editor"
                  rows={7}
                  value={sourceText}
                  maxLength={4000}
                  onChange={(e) => setSourceText(e.target.value)}
                  disabled={actor !== "editor"}
                />
                <label className="field">
                  <span>Reason for this source correction</span>
                  <input
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                  />
                </label>
                <div className="dialog-actions">
                  <button
                    className="button dark"
                    disabled={
                      busy ||
                      actor !== "editor" ||
                      sourceText === activeSource.excerpt
                    }
                    onClick={() =>
                      void command({
                        type: "revise-source",
                        sourceId: activeSource.id,
                        excerpt: sourceText,
                      })
                    }
                  >
                    <PenLine size={14} /> Save new source version
                  </button>
                </div>
              </>
            )}
            {modal === "method" && (
              <>
                <span className="section-kicker">
                  <BookOpen size={13} /> BUILT TO BE INSPECTED
                </span>
                <h2 id="dialog-title">Meaning is a workflow.</h2>
                <div className="method-section">
                  <h3>What the model remembers</h3>
                  <p>
                    Every language has its own revision and the English revision
                    it was based on. Approvals bind content, language, English
                    and source versions. Editing the source language makes
                    translations stale. Editing source evidence invalidates
                    affected reviews.
                  </p>
                </div>
                <div className="method-section">
                  <h3>What Sanity actually does</h3>
                  <p>
                    Draft entries, source notes, revision records and a manifest
                    live as protected draft documents. Publishing writes a
                    separate public edition in an atomic transaction guarded by
                    the exact Sanity document revisions. A fresh query verifies
                    the operation before success is shown.
                  </p>
                </div>
                <div className="method-section">
                  <h3>What the checks cannot prove</h3>
                  <p>
                    Presence checks and sentence heuristics are editorial
                    prompts. They do not certify accessibility, medical safety
                    or translation accuracy. The role switcher is a transparent
                    demo, not identity authentication or proof of independent
                    human review. All museum facts and measurements are
                    synthetic.
                  </p>
                </div>
                <div className="method-section">
                  <h3>What stays honest when disconnected</h3>
                  <p>
                    Local edits and reviews work for rehearsal, but publication
                    is disabled. The public visitor route reads only Sanity’s
                    published perspective. It never substitutes a local preview
                    for missing cloud content. Revision restores create a new
                    unapproved draft and preserve the prior audit trail.
                  </p>
                </div>
                <p className="dialog-note">
                  Original September 2026 work, with substantial AI coding
                  assistance. No runtime inference API. Created for the DEV
                  Sanity Path Two challenge; participation and publication are
                  separate verified actions.
                </p>
              </>
            )}
            {error && <div className="dialog-error">{error}</div>}
          </section>
        </div>
      )}
    </div>
  );
}
