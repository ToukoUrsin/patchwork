import { configuration, clientFor } from "@/server/sanity";
import { locales, localeNames, type Publication } from "@/core/types";
export const dynamic = "force-dynamic";
export default async function Visitor() {
  let entries: (Publication & { slug: string; section: string })[] = [];
  let message = "Sanity is not connected. No public editions are available.";
  try {
    if (configuration().configured) {
      entries = await clientFor().fetch(
        '*[_type == "patchworkPublication" && !(_id in path("drafts.**"))] | order(publishedAt desc)',
        {},
        { perspective: "published" },
      );
      message =
        "No public editions yet. Local previews are never presented as published content.";
    }
  } catch {
    message =
      "The public dataset could not be reached. No cached preview is substituted.";
  }
  return (
    <main className="visitor-site">
      <a href="/" className="visitor-back">
        ← Editorial workbench
      </a>
      <div className="wordmark">
        patchwork<span>PUBLIC EDITIONS</span>
      </div>
      <h1>
        A little museum.
        <br />
        <em>More ways in.</em>
      </h1>
      <p className="visitor-intro">
        A fictional museum trail, authored for a workflow demonstration. Only
        editions read from the Sanity published perspective appear here.
      </p>
      {!entries.length ? (
        <div className="visitor-empty">{message}</div>
      ) : (
        entries.map((entry) => (
          <article className="visitor-entry" key={entry.id}>
            <span className="section-kicker">
              {entry.section} · published{" "}
              {new Date(entry.publishedAt).toLocaleDateString("en-GB")}
            </span>
            {locales.map((locale) => (
              <section key={locale} lang={locale}>
                <span className="locale-label">{localeNames[locale]}</span>
                <h2>{entry.content[locale].title}</h2>
                <p className="visitor-summary">
                  {entry.content[locale].summary}
                </p>
                <p>{entry.content[locale].body}</p>
                <aside>{entry.content[locale].accessNote}</aside>
                <small>
                  Image description:{" "}
                  {entry.content[locale].decorativeImage
                    ? "Decorative image"
                    : entry.content[locale].imageAlt}
                </small>
              </section>
            ))}
          </article>
        ))
      )}
      <footer>
        Source-backed editorial decisions · Synthetic content · No accessibility
        certification claimed.
      </footer>
    </main>
  );
}
