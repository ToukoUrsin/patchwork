# Demo film

`media/patchwork-demo.mp4` (local, not committed: `*.mp4` is gitignored): 2:08, 1920x1080 H.264 + AAC, yuv420p, faststart, 8.9 MB. English captions in `media/patchwork-demo.en.srt`; upload copy in [media/YOUTUBE.md](../media/YOUTUBE.md).

Recorded September 22 PDT, 2026 from the production build on localhost talking to the real Sanity project `f6kx9jxa/production`. Every save, approval and publish in the film is a real Sanity transaction (operation ids in [VALIDATION.md](VALIDATION.md)). Frames are Chrome DevTools screencast captures of the actual app; a dot shows the automated pointer. The only overlay is a caption naming the anonymous query URL during 1:25–1:35. Narration is an ElevenLabs stock voice reading a script written for this film.

| Time | Scene                                                                                  |
| ---- | -------------------------------------------------------------------------------------- |
| 0:00 | Connection dialog: verified `f6kx9jxa / production`                                    |
| 0:13 | Loom story blocked by four quality gates                                               |
| 0:23 | Authored suggestion loaded and saved to Sanity (guarded transaction, receipt readback) |
| 0:38 | Finnish and Spanish go stale; each confirmed against English v2; review requested      |
| 0:53 | Demo reviewer role records three fingerprinted approvals                               |
| 1:07 | Publisher writes the public edition                                                    |
| 1:17 | `/visit` reads the published perspective in three languages                            |
| 1:25 | Anonymous public query URL returns the same edition and operation id                   |
| 1:35 | Access source corrected: approvals clear, the public edition stays                     |
| 1:46 | History: reason, actor, before/after snapshots; restore never republishes              |
| 1:56 | Limits: synthetic content, editorial prompts rather than accessibility certification   |

Reproduction scripts (Playwright recorder, narration timing, two-pass encode) lived in a scratch directory and are not part of the app. To re-record, seed a fresh dataset: the film assumes the loom story is still in its seeded state.
