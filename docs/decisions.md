# Decisions

Durable technical decisions on Stride Locker. Each entry: what, why, triggers to revisit.

## 2026-11-18 — Raised Anthropic `max_tokens` instead of capping `output_config.effort`

Outfit `max_tokens` 4000 → 8000, swap 1000 → 2000. `effort` left at Sonnet 5's default (`"high"`).

Nov 14 `/api/suggest` failures had `stop_reason: max_tokens` with ~333 then 0 chars of returned text at a 4000 budget. The leading hypothesis is that adaptive thinking (default-on and non-disableable on Sonnet 5) consumed most of the budget, leaving no room for the schema-constrained text block. Four follow-up calls on Nov 18 succeeded, so the failure mode is intermittent — consistent with per-request variance in adaptive thinking depth.

**Considered and rejected:** `output_config: {effort: "low"}` on the two schema-constrained calls.

- Thinking as the cause is **still inferred**, not observed — no truncation has occurred since diagnostics were added, so no `usage.output_tokens_details.thinking_tokens` has been captured. Acting on an inferred cause risks fixing the wrong thing.
- `effort: "low"` could regress layering quality. The `sanitize*` backstops in `server/api.js` exist specifically because the model's reasoning has repeatedly failed the layering rules in ways a prompt alone couldn't fix (see CLAUDE.md "Server-side backstops"). Shallower thinking makes those failures more likely, not less — pushing more work onto the deterministic backstops is not a free swap.

Raising `max_tokens` leaves thinking intact and gives it headroom, treating the symptom (budget exhaustion) while preserving the suspected contributor (thinking depth). It costs more per call in the worst case, but the schema still caps the text block's structure so the common case is unaffected.

**Revisit when any of these hold:**
- `logTruncation` lines appear in container logs showing `thinking_tokens` **regularly > 4000** (one-off spikes don't count; a pattern does).
- User reports latency or Anthropic-cost complaints tied to the outfit call.
- A new Sonnet revision changes adaptive-thinking defaults.

**Right test at that point:** evaluate outfit quality (layering-rule pass rate, backstop activation rate, subjective picks) across `effort` levels `"low" | "medium" | "high"` on a fixed basket of weather + locker + activity inputs. Decide on data, not inference.
