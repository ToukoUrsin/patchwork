# YouTube upload copy

File: `patchwork-demo.mp4` (2:08, 1080p) · Captions: `patchwork-demo.en.srt` (English) · Visibility: unlisted or public, owner's choice.

## Title

Patchwork: multilingual museum stories with revision-guarded Sanity publishing

## Description

Patchwork is an editorial workbench for a small, fictional museum. Each story exists in English, Finnish and Spanish. When the English text or its access evidence changes, translations go stale and reviews clear, so an outdated approval can never publish a new edition.

Everything in this film is the actual app (Next.js 16, running locally) writing to a real Sanity project: `f6kx9jxa`, dataset `production`. Each save is one Sanity transaction guarded by the revision of every document it read, and the server reads the operation receipt back before showing success. Public editions are separate published documents that anyone can query without a token:

https://f6kx9jxa.api.sanity.io/v2026-09-21/data/query/production?query=*%5B_type%20%3D%3D%20%22patchworkPublication%22%5D

Code: https://github.com/ToukoUrsin/patchwork

Built for the DEV Sanity Challenge (Path Two), September 2026.

Limits: the museum, stories, translations and access measurements are synthetic. Quality checks are editorial prompts, not WCAG certification or translation evaluation. The reviewer and publisher roles are clearly labelled demo roles, not authentication.

AI disclosure: the code was written with substantial help from OpenAI Codex and Claude. Narration is an ElevenLabs stock voice reading our script. The footage is screen capture of the actual app talking to Sanity; a dot marks the automated pointer, and one caption names the public query URL.

## Chapters

0:00 Connected to a real Sanity project
0:13 Four quality gates block the loom story
0:23 Save: one guarded transaction, receipt read back
0:38 English changed, translations go stale
0:53 Demo reviewer approvals with fingerprints
1:07 Publish a separate public edition
1:17 Visitor page reads the published perspective
1:25 Anonymous public query URL
1:35 Source correction clears approvals, edition stays
1:46 History and restore
1:56 Limits
