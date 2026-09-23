# Sanity setup and verification

Live project: **`f6kx9jxa`**, dataset **`production`** (public ACL). The full acceptance checklist below passed against it on September 22 PDT, 2026; evidence and two bugs it found are in [VALIDATION.md](VALIDATION.md). Public editions can be read without a token:

<https://f6kx9jxa.api.sanity.io/v2026-09-21/data/query/production?query=*%5B_type%20%3D%3D%20%22patchworkPublication%22%5D>

Draft entries, sources, receipts and the manifest live under `drafts.` and are not returned to anonymous queries.

## Configuration

`SANITY_PROJECT_ID` and `SANITY_DATASET` identify the dedicated dataset. `SANITY_API_TOKEN` is a server-only write credential loaded by Next.js. No token input appears in the browser. Use the approved credential workflow and never paste a token into a public artifact. `.env.local` is ignored by Git.

Pinned client: `@sanity/client 8.6.2`; API date `2026-09-21`; `useCdn:false`; authenticated raw perspective for authoring, anonymous published perspective for visitors. Remote authoring endpoint requests are rejected; local binding is still required. Writes request `visibility:sync`, then fetch the operation receipt. Auto retry is disabled; an uncertain mutation checks the receipt before a caller can decide to retry.

The server-to-Sanity requests do not need browser CORS because the browser calls same-origin Next.js routes. If running the optional Studio, configure the appropriate local Studio origin in the project's CORS settings through the owner account. Do not add broad wildcard origins.

## Studio

```sh
cd studio
npm install
SANITY_STUDIO_PROJECT_ID=your_actual_id SANITY_STUDIO_DATASET=production npm run dev
```

Studio runs on port 3338 (not yet built or run against the live project). Public identifiers are not secrets. The write token remains in the parent app's server environment, not the Studio bundle. Every app document is read-only in this inspectable Studio configuration; workflow changes go through the authoring workbench. Studio validation is client-side, so the server also validates commands/content and enforces state transitions. Never claim the schema alone enforces those rules in Content Lake.

## Live acceptance checklist

1. `/api/status` returns the real project/dataset, a successful query and current check time. No synthetic success is returned when absent/offline.
2. Explicitly seed. Inspect draft IDs in Sanity; public edition count must be zero. A second seed must refuse to overwrite data.
3. Use the lantern (all mechanical gates already pass), request review, record three clearly labeled demo-role approvals and publish.
4. Confirm the public document exists and `/visit` returns the same multilingual content. Compare operation id and `_rev` readback; keep a sanitized record of actual response identifiers.
5. Edit English. The existing public edition remains unchanged; Finnish/Spanish go stale and a new publish is blocked.
6. Correct an access source, verify affected approvals clear, and then restore an earlier draft through history. Restoration must not republish it.
7. Use two open views or an independent client to produce a stale version/revision. Confirm409 conflict with no overwritten update.
8. Withdraw the public edition. `/visit` no longer displays it; source and revision history remain.

All eight passed against `f6kx9jxa/production` (after two fixes found by step 5); see [VALIDATION.md](VALIDATION.md).

## Transaction shape

Every command is one transaction. The manifest, every entry and every source document are patched with `ifRevisionID` set to the revision the server just read, even when unchanged: the manifest serializes app writes and per-document guards catch out-of-band edits. New revision receipts and new public editions use `create`. Unchanged public editions and existing receipts are not written at all, because any guarded patch gives a document a new `_rev`; a public edition's `_rev` therefore only changes when it is published again.

## Official documentation checked

- [Client setup](https://www.sanity.io/docs/apis-and-sdks/js-client-getting-started)
- [Atomic client transactions](https://www.sanity.io/docs/apis-and-sdks/js-client-transactions)
- [Revision preconditions and consistency](https://www.sanity.io/docs/content-lake/transactions)
- [Mutation options and visibility](https://www.sanity.io/docs/apis-and-sdks/js-client-advanced)
- [Draft/public document behavior](https://www.sanity.io/docs/content-lake/drafts)
- [Document schemas](https://www.sanity.io/docs/studio/document-type)

The implementation uses these documented primitives, while its editorial model and quality rules are original application code. It does not claim Sanity App SDK, Context MCP, AI translation, live subscriptions or external workflow services.
