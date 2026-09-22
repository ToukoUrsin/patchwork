# Validation status

September 21 PDT / September 22 UTC, 2026. Node 26.7.0, macOS.

- **20 local tests passed.** Translation lineage, exact review fingerprints, source corrections even without version bumps, immutable public snapshots, restoration, role boundaries, malformed input, stale versions, idempotency, atomic mutation guards, lost-success reconciliation, seed non-overwrite and local endpoint restrictions.
- **Production build passed:** Next.js 16.3.5 compiled, TypeScript completed, routes generated successfully. The standalone type check also passed before the final small adapter changes; the final production build includes their type check.
- **HTTP verification:** production routes `/`, `/api/status`, `/api/workspace` and `/visit` returned 200. Status explicitly reported `connected:false`; visitor page showed no public editions. Same-origin authoring and seeding returned disconnected errors rather than success. Remote-host draft access is forbidden.
- **Dependencies:** `npm audit` at installation reported zero known vulnerabilities. No production security audit is claimed.

The suite verifies actual pure workflow behavior and an explicitly identified revision-checking transaction test double. It does not contact Sanity and cannot establish successful live cloud integration. The HTTP check found and fixed a real Next.js loopback Host normalization issue before handoff, with a regression test.

Live Sanity configuration is absent. Full cloud acceptance remains in [SANITY.md](SANITY.md). Integrated-browser visual and interaction review is owned by the parent task because this build subagent has no integrated-browser surface. The optional standalone Studio package/schema has not yet been installed or built. No public deployment or film is claimed.
