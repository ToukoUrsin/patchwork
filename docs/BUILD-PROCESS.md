# Building a workflow instead of another content template

Built from scratch on September21,2026, within the challenge's September18–October4 window. Substantial Codex assistance produced architecture, code, tests, synthetic fixture text, translations and vector artwork. No runtime inference service is used. These are candid development notes, not a curated transcript claiming unaided human authorship.

The initial idea was a museum trail with accessible descriptions in three languages. A static “translation complete” badge would have hidden the hard part: translations and review decisions go stale when the English source or access evidence changes.

The model therefore gives each language its own version and the English version it follows. Review fingerprints include those versions, every content field and source versions. English edits clear approvals and make translated copies stale. Source corrections invalidate affected reviews. Mechanical checks block missing alt text, contradictory decorative-image declarations, vague links, missing access notes and absent evidence; they explicitly do not certify quality.

The first persistence design separated editorial objects from public editions. Draft entries, evidence, operation receipts and a manifest live as draft documents; visitors read only published edition snapshots. Restoring history makes a new draft and does not roll back publication by accident.

The most important technical correction was making operation idempotency cover the **entire command**, not just its action name. Otherwise a retry could reuse an identifier with changed content. A command hash now detects that collision. The adapter also guards every read document revision, not only the entry: an access-note update during publication must cause a conflict.

Lost network responses are another awkward boundary. A failed response does not prove that the transaction failed. The adapter checks the stored operation receipt before reporting uncertainty; it never blindly resubmits a mutation. Tests model a committed transaction whose response is lost.

The UI treats disconnected rehearsal as a separate state. It can test editing and review flow with transparent demo roles, but publication stays disabled. It never falls back to a preview when a public dataset query fails. This constraint is more valuable than a polished false “published” toast.

Next steps before submission: provision the real Sanity project through the campaign owner, run the live acceptance sequence, replace this pending status with actual sanitized evidence, review the UI in the integrated browser, capture a real film and screenshots, and publish an honest DEV post with the required project ID. No fake usage, independent human review or museum pilot is claimed.
