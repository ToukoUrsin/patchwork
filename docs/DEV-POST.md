---
title: "Patchwork: translations that know when they're out of date, published through Sanity"
published: true
tags: sanitychallenge, devchallenge, nextjs, webdev
cover_image: https://raw.githubusercontent.com/ToukoUrsin/patchwork/main/media/02-published-workbench.png
---


_This is a submission for the [Sanity Challenge](https://dev.to/challenges/sanity-2026-09-16): Path Two, a Next.js app with Sanity as the backend._

## What I Built

**Patchwork** is an editorial workbench for multilingual museum stories.

A museum fixes an entrance description in English. The Finnish and Spanish pages still give yesterday's directions, and the "translation complete" checkbox still says everything is fine. Patchwork models that dependency instead of hiding it:

- Every language keeps its own revision and **the English revision it was based on**. Edit English and the translations are marked stale until someone updates them or confirms they still hold.
- Every story is grounded in versioned **source notes** (curator notes, access walks). Correct a source and every approval that relied on it clears.
- A review records a **fingerprint of the exact content, language, English revision and source versions**. Change any of them and the approval no longer counts.
- Publishing needs fresh approvals in all three languages and writes a **separate public edition**. Later draft edits, source corrections and history restores never touch that edition until someone publishes again.
- Four mechanical gates block review: missing image description, missing summary, missing access note, and vague link text such as "click here". They are editorial prompts, not accessibility certification.

The museum ("Fieldnote Museum"), its three stories, translations and access measurements are synthetic fixtures written for the demo.

## Demo

{% embed https://youtu.be/yUKmSoR3Rdw %}

The film (2:08) is the actual app running locally and writing to the real Sanity project. Every save, approval and publish in it is a real transaction.

**Live dataset:** project ID **`f6kx9jxa`**, public dataset **`production`**. Anyone can query the published editions, no token needed:

https://f6kx9jxa.api.sanity.io/v2026-09-21/data/query/production?query=*%5B_type%20%3D%3D%20%22patchworkPublication%22%5D

It currently returns two trilingual editions (the loom and the garden). Drafts, sources and receipts live under `drafts.` and are not returned to anonymous queries; you can check with `count(*[_id in path("drafts.**")])`, which returns 0.

Review dialog: the approval is bound to a fingerprint of the exact versions.

![Review dialog showing the Finnish draft, two explicit confirmations and a version fingerprint](https://raw.githubusercontent.com/ToukoUrsin/patchwork/main/media/01-review-fingerprint.png)

All three reviews current, published:

![Workbench showing the garden story with three reviewed languages and a public edition](https://raw.githubusercontent.com/ToukoUrsin/patchwork/main/media/02-published-workbench.png)

After an English edit: Finnish and Spanish trail the source, and the published edition stays as it was:

![Finnish tab flagged as based on English v1 while English is v2](https://raw.githubusercontent.com/ToukoUrsin/patchwork/main/media/03-stale-translation.png)

The visitor page reads only Sanity's published perspective:

![Public editions page showing the garden story](https://raw.githubusercontent.com/ToukoUrsin/patchwork/main/media/04-public-editions.png)

## How I Used Sanity

Sanity is the whole persistence layer: the editorial state machine lives in Content Lake, and the Next.js server talks to it with the official `@sanity/client` (API version `2026-09-21`, `useCdn: false`).

**Schema.** Five document types (Studio schema in `studio/schemaTypes`):

| Type                   | Role                                                                         |
| ---------------------- | ---------------------------------------------------------------------------- |
| `patchworkEntry`       | A story: stage, per-language content, revision and English base revision     |
| `patchworkSource`      | Versioned curatorial and access evidence                                     |
| `patchworkRevision`    | Receipt per command: operation id, command hash, actor, reason, before/after |
| `patchworkManifest`    | Document inventory and the app-wide concurrency lock                         |
| `patchworkPublication` | The approved trilingual edition that visitors read                           |

**Drafts vs published.** Entries, sources, receipts and the manifest are stored with `drafts.` ids, so the public dataset does not expose them. Publications use plain ids. The authoring server reads with the authenticated `raw` perspective; the `/visit` page and anyone on the internet read the `published` perspective.

**One transaction per command, with revision preconditions.** The server reads everything, applies the command in pure TypeScript, and sends one `client.mutate([...])` transaction:

- The manifest, every entry and every source are patched with `ifRevisionID` set to the `_rev` it just read, changed or not. If anything moved in between, Sanity rejects the whole transaction with a 409, and nothing is written.
- New receipts and new editions use `create`, never `createOrReplace`.
- Writes use `visibility: "sync"`. Success is shown only after a fresh query finds the operation receipt. If a response is lost, the server looks for the receipt before anyone retries; reusing an operation id with different content is rejected by the command hash.

**Something I learned from running against the real API.** In Sanity, any guarded patch gives the document a new `_rev`, even if the content is identical. My first version guarded every document by patching it, so each draft edit quietly rewrote the public edition's `_rev` and `_updatedAt`. The live run caught it; now unchanged editions and receipts are left alone, and an edition's `_rev` only moves when it is published again. I verified this against the live dataset: the loom edition kept the same `_rev` through later loom and garden writes.

**Verified live.** I ran an eight-step acceptance checklist against `f6kx9jxa`: status, seed (atomic, refuses to overwrite), review and publish, anonymous and `/visit` readback, stale translations after an English edit, approvals clearing after a source correction, a history restore that does not republish, a 409 from two browser views and from an independent client racing the app, and withdrawal. The operation ids and `_rev` values are in [VALIDATION.md](https://github.com/ToukoUrsin/patchwork/blob/main/docs/VALIDATION.md).

## Code

{% github ToukoUrsin/patchwork %}

Next.js 16, React 19, TypeScript, `@sanity/client`. `npm test` runs 20 focused tests (translation lineage, fingerprints, source invalidation, immutable editions, restore, roles, stale versions, idempotency, transaction shape, lost-response reconciliation). MIT licensed.

## Limits and disclosure

- Authoring runs on localhost with a server-side token. There is no hosted editor and no real authentication: the editor, reviewer and publisher are clearly labelled **demo roles**, not independent people.
- The quality gates are presence and wording checks. They do not certify WCAG conformance, reading level or translation accuracy.
- All museum content, translations and measurements are synthetic.
- The optional Studio config is read-only by design and I have not run it against the live project. There are no live listeners; the UI reloads snapshots.
- **AI disclosure:** built from scratch in September 2026 with substantial help from OpenAI Codex (architecture, code, tests, fixture text, translations, artwork) and Claude (live Sanity verification, the two fixes it found, the film and this write-up). The app itself makes no model calls. The film's narration is an ElevenLabs stock voice; the footage is screen capture of the actual app.
