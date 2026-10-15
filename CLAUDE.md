# Stride Locker - Project Context & Vision

## 🎯 The Objective
Stride Locker is a "Digital Gear Closet" for runners. It solves the friction of matching clothing to weather and activity levels. Critically, it is designed for a **colorblind user** to remove the stress of color-matching and coordination.

## 🎨 Design & Accessibility Philosophy
- **Colorblind Friendly:** Do not rely on color alone to convey information. Use icons, labels, and text. The AI acts as a "Style Consultant," using objective color labels (e.g., "deep navy with purple undertones") so the user can coordinate outfits without needing to perceive color accurately.
- **Aesthetic:** Heritage, Gorpcore, and Minimalist gear catalog (e.g., Tracksmith, Satisfy, District Vision).
- **Coordination Logic:** Shade descriptions captured at add-time are stored on items and fed into every outfit suggestion, giving the AI precise color intelligence without re-analyzing photos.

## 🧠 Core Logic & Features

### Weather → Outfit Flow
- Fetches real-time weather via Open-Meteo API (geolocation)
- Computes "felt temp" adjusted for activity effort (+15°F workout/race, -5°F easy)
- `buildContext()` (server-side, in `server/api.js`) converts felt temp + wind + humidity into climate guidance (REQUIRED/CONSIDER lines) that the AI reasons against — not hard filters; the model can still pick an item rated outside today's range when layering or effort justifies it. It also surfaces each item's `notes` (free text) in the locker lines it builds, plus a `| Lined` / `| Unlined` segment on shorts + tights (from the structured `lined` field — see Layering below). **Excludes shoes** from the locker lines it builds (footwear is out of scope for outfit suggestions — chosen separately)
- `getSuggestion()` (client, in `App.jsx`) posts `{temp, wind, humidity, condition, activity, locker}` to `POST /api/suggest`. The server builds the guidance + prompt from the full locker (minus shoes, with shade descriptions and notes) and calls Claude for a JSON outfit response. Bottom, Top, and Socks are always required; accessory categories (Gloves, Hat, etc.) are added per climate guidance. The response is constrained to `OUTFIT_SUGGESTION_SCHEMA` via `output_config.format` (structured outputs), so parsing doesn't depend on the model producing well-formed freeform JSON.
- **Per-row swap:** `swapItem(rowIndex)` (client, in `App.jsx`) lets the user regenerate a single row of an existing suggestion without rerolling the rest. It posts the same `POST /api/suggest` endpoint with `mode: "swap"` plus `{category, previousItem, lockedItems}` — `lockedItems` is every other non-gap row of the current suggestion (`{category, item, colorway}` only), and the weather/activity fields are read from the frozen `suggestionMeta`, not live state, since the rest of the outfit was chosen against those exact conditions. Server-side, `handleSuggest()` branches on `body.mode === "swap"` before building any prompt: it calls `buildSwapPrompt()` (built from `buildSharedGuidance(ctx)` — the layering/color rules shared with the full-suggestion prompt, extracted out of `buildPrompt()` — plus a "locked outfit, don't reuse" list and a "replace this slot only, not the current item" instruction) and requests `OUTFIT_ITEM_SCHEMA` (a single item, not the full array) with `max_tokens: 1000` (300 measured too low in practice and truncated the JSON mid-response — a single item's reasoning sentence can still run long). The parsed item is run through `isInvalidSwap()` (takes `category`, reuses `findLockerType()`/`findLockerItem()`) before being trusted: rejects if the model repeats the current item, reuses any locked item, returns no item, would introduce a second Top-type row (`top-ss`/`top-ls`/`tank`) alongside one already in `lockedItems`, or would create an invalid bottom pair (lined shorts as Bottom while a "Base Layer — Bottom" row is locked; a `tights`/`pants` item swapped *into* a base-layer row; a base layer swapped in under a locked lined-shorts Bottom) — the same invariants the full-suggestion `sanitize*` backstops enforce, checked pre-emptively here instead of post-hoc. An invalid or empty result returns `{ noAlternative: true }` instead of the item; the client shows a toast ("No other `<category>` option in your locker") rather than a silent no-op or a repeated item. On success the client replaces that row in `suggestion.items`, re-persists the whole suggestion to `stride-last-suggestion-v1`, and drops the old item's name from `wornSelections` if it was selected (the row identity changed, so a stale worn-selection shouldn't carry over to whatever replaced it).
- **Short-term temperature trend (Long Run only):** `fetchWeather()` (client, in `App.jsx`) requests `hourly=temperature_2m&forecast_hours=4` from Open-Meteo alongside the existing `current=` fields (one request, no extra network round-trip) and returns the 4-entry array as `hourlyTemps` on the weather object. This only reflects a live auto-fetch — the manual weather sliders already set `weather.auto:false` on any edit, and `hourlyTemps` is only sent when `weather.auto` is true, so a hand-corrected temp never rides alongside stale trend data. `hourlyTemps` is threaded through `suggestionMeta` exactly like `temp`/`wind`/`humidity` so a later per-row swap reasons against the same trend the original suggestion saw, and persists with the rest of `suggestionMeta` in `stride-last-suggestion-v1` for free. Server-side, `buildContext()` (in `server/api.js`) takes `hourlyTemps` as its final param and, only when `activity==="long"`, compares index 0 (now) to index 3 (3 hours ahead); a swing of ≥8°F either direction pushes one `CONSIDER: temperature rising/falling ~N°F over the next 3hrs` line into the same `climate[]` array the felt-temp/wind/humidity lines already populate — no new prompt section, `buildPrompt()`/`buildSwapPrompt()` render it for free. Soft guidance only, like the rest of `climate[]`: the model reasons against it, nothing is hard-filtered. Scoped to Long Run because a 3-hour-ahead trend describes conditions a 40+ minute run will be out in; shorter activities never see the line even when the underlying swing is large. Known simplification: only hour-0-vs-hour-3 is compared, not a peak/trough in between.

### Layering & Bottom/Top-Category Reasoning
- **Whole-outfit warmth, not per-slot:** `buildSharedGuidance()`'s LAYERING PRINCIPLE tells the model to reason about total insulation for each body-half as a whole and to pick *either* one garment warm enough alone *or* one lighter garment plus one added layer — never a warm garment **and** an extra layer. "CONSIDER" in the climate guidance explicitly means *weigh*, not *include*: a considered item is added only if the main garment actually chosen leaves a real gap for the felt temp.
- **`lined` field on shorts + standalone tights** (`item.lined`, default/missing = lined). `buildContext()` surfaces it on those two types' locker lines as `| Lined` / `| Unlined`. For shorts it's a hard layering signal; for tights it's a warmth signal (unlined = very-hot-day / hard-effort, lined = cooler temps).
- **Bottom = exactly one main Bottom.** `tights` and `pants` are **always standalone outer garments** — never worn under shorts, never in a "Base Layer — Bottom" row. The only leg garment allowed as a base layer is `underwear` (compression), and only under shorts marked **Unlined** (coverage/support any temp; warmth on cold days with a thermal/full-length one). **Lined shorts are a complete bottom — nothing goes under them, ever.** If lined shorts aren't warm enough, the model switches the Bottom to Tights or Pants rather than layering. Below felt ~52°F, Tights-alone and Pants-alone are the defaults.
- **Top chosen by *centered* range.** When several candidate Tops include the felt temp, the model picks the one whose rated range is centered nearest felt, not merely one that contains it — a top rated 20–63°F at felt 45°F is a deep-winter piece being stretched. Heavy/cold-rated tops only when felt sits in the lower third of their range and nothing lighter covers the day.
- **Top slot is a single standalone choice** (short sleeve, long sleeve, or tank). When climate guidance flags "midlayer"/"vest", the AI adds at most one "Outer Layer" row worn over the Top — `midlayer` (full-sleeve warmth) vs `vest` (core-only) — **and only when the Top it chose is light enough to leave a gap.** A mid/heavy Top gets no Outer Layer unless a wind layer is explicitly REQUIRED.
- **Vest climate triggers:** `buildContext()` emits `CONSIDER: midlayer or vest` (32–42°F felt), `CONSIDER: vest …` (42–52°F felt — now **conditional**, only pushed when `wind>10 || activity easy/long`, and self-qualifying: "only if the top you pick runs light … skip it over a mid/heavy top"), `CONSIDER: vest if breezy` (52–62°F felt), and the wind>18mph line reads `REQUIRED: wind-blocking layer (jacket, midlayer, or vest)`.
- **Server-side backstops** (all in `server/api.js`, chained right after parsing the Anthropic response in the `/api/suggest` full-suggestion branch; each matches returned items to their actual locker `type`, not the model's self-assigned category label, and `console.warn`s on action):
  - `sanitizeTopLayering()` — strips any second `top-ls`/`top-ss`/`tank` row (the model has a strong prior that a thin + heavy long-sleeve stack is legit cold-weather advice and kept reintroducing it across prompt iterations).
  - `sanitizeBottomLayering()` — collapses an invalid bottom pair: a `tights`/`pants` item used as a "Base Layer — Bottom" is promoted to the sole Bottom (shorts row dropped); any base layer under **lined** shorts is dropped (lined shorts stand alone). Added after the same reasoning-vs-rules failure — the model kept layering a leg garment under lined shorts (physical chafe), so this got both the `lined` structured field (reversing the earlier notes-only decision, justified by the physical failure mode) *and* a deterministic guard.
  - `sanitizeOuterLayer()` — narrow, vest-only: strips a CONSIDER-only vest stacked over a `top-ls` Top in calm (`wind ≤ 18`, no REQUIRED wind layer), not-deep-cold (`felt ≥ 45`, and `felt ≥ top.warmthMin + 6`) conditions. Not applied on the swap path (swapping the Outer Layer row is an explicit request for a different outer piece).
- These are narrow, well-tested correctness backstops kept after repeated prompt-only attempts failed — a rare exception to [[stride-locker-ai-reasoning-over-rules]], not a general pattern to reach for first.

### Locker Management
- Track "worn today" status per item; AI avoids repeating worn items
- Filter by gear type
- Custom gear entry (brand, name, colorway, notes, type, numeric warmth min/max in °F) alongside curated GEAR_DB
- **Full edit support:** any locker item (curated or custom) can be edited after the fact — brand, name, colorway, notes, type, and warmth min/max are all editable via the edit modal (`editForm` state, `openEditModal`/`saveEdit`). Save is blocked unless `warmthMin < warmthMax` and brand/name/colorway are non-empty.

### Photo & Shade System
- **Capture:** On add or edit, user optionally captures or uploads a photo (camera + library picker on mobile)
- **Analysis:** Claude analyzes the photo once, returning a 1-2 sentence precise shade description (e.g., "deep forest green with subtle olive undertones")
- **Storage:** Photo compressed to max 1024px / JPEG 85% before storage and analysis. Blob cached client-side in IndexedDB (`stride-photos` DB, `photos` store, keyed by `lockerId`) and persisted server-side as `data/photos/{lockerId}.jpg`. Shade description stored as `shadeDescription` string on the locker item.
- **Photo Library:** Dedicated "Photos" nav tab — 2-column grid of all photographed gear with name, colorway, and shade description overlaid.
- **Outfit prompts:** `shadeDescription` is automatically appended to every locker item line sent to Claude (`| Shade: deep navy with...`), giving the stylist AI precise color intelligence at suggestion time with zero extra API calls.

## 🛠 Technical Architecture

### Stack
- **Frontend:** React, Vite, Tailwind v4 (via inline CSS in `css` template literal), Lucide-React, Recharts, Framer Motion
- **Backend:** The four API routes (`GET/POST /api/locker`, `GET/POST/DELETE /api/photos/:lockerId`, `POST /api/suggest`, `POST /api/shade`) are implemented once, in `server/api.js`, as plain `(req, res)` functions against Node's raw `http` API — no framework. Two different entrypoints wire them up depending on context:
  - **Local dev** (`npm run dev`): `vite.config.js` imports the same handlers from `server/api.js` and mounts them via `configureServer` middleware, alongside Vite's own dev server + HMR — unchanged from before.
  - **Production** (`npm start` / the Docker image): `server/index.js` is a small standalone `http.createServer` that routes `/api/*` to the same handlers and serves the built `dist/` folder (via `sirv`) for everything else. Vite is not running and is not a runtime dependency in production — `vite build` only produces the static bundle ahead of time.

  Every route rejects requests missing a matching `x-stride-key` header (checked against `VITE_STRIDE_SHARED_KEY`) — but since the SPA has to attach that header to its own requests, the key ships in the client bundle and is readable by anyone with devtools open on the page. It is not secrecy from a human user; it stops opportunistic/automated hits that never load the real app, and it's rotatable independently of the real Anthropic key. The Anthropic key itself (`ANTHROPIC_API_KEY`) never leaves the server, and in production is read from `process.env` at request time (not baked into anything).
- **Host:** Self-hosted via Docker on the user's home infrastructure. Deploy details (hostname, ports, SSH access) intentionally live outside this repo, not in tracked files — this repo is public.

### File Structure
```
src/
  App.jsx       — entire app (single component, ~1100+ lines and growing; expect drift, don't trust an exact count here)
  main.jsx      — React DOM mount
  index.css     — global reset
server/
  api.js        — shared route handlers (locker/photos/suggest/shade, auth gate, logging) — imported by both vite.config.js (dev) and server/index.js (prod)
  index.js      — production entrypoint: plain http server, /api/* → server/api.js handlers, static dist/ via sirv otherwise
public/         — favicon set (favicon.ico/.svg, apple-touch-icon.png, icon-192/512.png) + site.webmanifest; Vite copies it into dist/ at build, sirv serves it in prod
data/           — server-persisted locker.json + photos/ (gitignored, never commit)
.env.local      — ANTHROPIC_API_KEY, VITE_STRIDE_SHARED_KEY (gitignored, never commit)
vite.config.js  — dev-only now: wires server/api.js handlers into configureServer for `npm run dev`; allowedHosts restricted to the deploy host (see that file, not documented here) — dev-server-specific, has no production equivalent
```

### Data Persistence
| What | Where | Key |
|------|-------|-----|
| Locker items (incl. shadeDescription) | Server (`data/locker.json`), source of truth — with localStorage fallback/offline cache | `stride-v6-locker` |
| Last outfit suggestion | localStorage | `stride-last-suggestion-v1` |
| Gear photos (Blob) | Server (`data/photos/{lockerId}.jpg`) — IndexedDB used as client-side session cache | DB: `stride-photos`, store: `photos`, key: `lockerId` |

**Sync model:** server is source of truth. On load, the app fetches `/api/locker`; if the server has data it wins, if the server is empty the app migrates whatever's in localStorage up to the server automatically. If the server is unreachable, the app falls back to localStorage silently and queues nothing — it just stays local until the server is reachable again.

### Gear Item Schema
```js
{
  id: "s1",                          // DB id (or "c-{timestamp}" for custom)
  lockerId: "s1-Black-1713718234",   // unique per locker instance
  brand: "Tracksmith",
  name: "Session Short",
  type: "shorts",                    // key into TYPE_LABELS
  colorway: "Black",                 // user-selected string
  shadeDescription: "...",           // AI-analyzed shade text (nullable)
  warmthMin: 52, warmthMax: 95,      // editable numeric range, °F
  lined: true,                       // shorts + standalone tights only; missing = lined.
                                     //   shorts: hard layering signal (nothing under lined shorts)
                                     //   tights: warmth signal (unlined = hot day / hard effort)
  fabric: "Veloce Blend",            // optional
  isCustom: true,                    // only on manual entries
  notes: "...",                      // optional, custom only
  wornToday: "Mon Apr 21 2026",      // TODAY string or null
}
```

### AI Integration
| Call | Model | Trigger | Purpose |
|------|-------|---------|---------|
| Outfit suggestion | `claude-sonnet-5` | "Get Outfit Suggestion" button → client posts to `POST /api/suggest` | Full outfit JSON (Bottom/Top/Socks always, accessories per climate, no shoes) from locker + climate rules, schema-constrained via `output_config.format` |
| Single-item swap | `claude-sonnet-5` | Tapping a suggestion row's swap button → client posts to `POST /api/suggest` with `mode: "swap"` | One replacement item for that row only (rest of the outfit locked), schema-constrained to `OUTFIT_ITEM_SCHEMA`, `max_tokens: 1000` |
| Shade analysis | `claude-sonnet-5` | Photo captured at add or edit time → client posts raw JPEG to `POST /api/shade` | 1-2 sentence color description, stored on item |

Both calls are server-side, made from the `/api/suggest` and `/api/shade` handlers in `server/api.js` — `POST https://api.anthropic.com/v1/messages` with headers `x-api-key: ANTHROPIC_API_KEY` (server env, no `VITE_` prefix) and `anthropic-version: 2023-06-01`. The browser never sees the Anthropic key or talks to `api.anthropic.com` directly. Model name drifts as it gets upgraded — grep `model:` in `vite.config.js` for ground truth rather than trusting this table blindly. The outfit-suggestion call passes `output_config: {format: {type:"json_schema", schema: OUTFIT_SUGGESTION_SCHEMA}}` so the API guarantees schema-valid JSON server-side — no markdown-fence stripping or malformed-JSON fallback needed on the client.

### Navigation Views
| View | Key | Notes |
|------|-----|-------|
| Today / Suggest | `home` / `suggest` | Weather, activity, outfit output |
| Locker | `locker` | Item list with thumbnails, shade descriptions, worn tracking, edit/delete |
| Photos | `photos` | 2-col photo library grid |
| Browse | `gear` | Search/filter curated GEAR_DB, add to locker |

## ⚠️ Development Rules
1. **Label Everything:** Always include text labels for colors in the UI. Never rely on color alone.
2. **Mobile First:** Optimized for a quick check before heading out the door.
3. **Tailwind v4:** Standard styling engine (applied via inline `<style>` tag with CSS classes — see `css` template literal in App.jsx).
4. **API Key:** Never hardcode. The Anthropic key lives server-side only (`ANTHROPIC_API_KEY`, no `VITE_` prefix, read from `process.env` at request time — via `loadEnv` in dev, plain `process.env` in `server/index.js` in production) and is never referenced in `App.jsx`. Same-origin `/api/*` calls from the client go through the `apiFetch()` helper, which attaches `VITE_STRIDE_SHARED_KEY` as the `x-stride-key` header — see the Backend section above for what that key does and doesn't buy us. `VITE_STRIDE_SHARED_KEY` is read by `import.meta.env` at **build time** and baked into the client bundle — a production Docker build must pass it as a build arg (see `Dockerfile`/`docker-compose.yml`), since `.dockerignore` excludes `.env.local` from the build context. Both keys live in `.env.local` (gitignored).
5. **Photos:** Blob data lives in IndexedDB (client cache) and as a JPEG on the server (`data/photos/`) — never in localStorage. Only the `shadeDescription` text travels with the locker item record.
6. **Single component:** App.jsx is intentionally monolithic. Don't extract components unless there's a strong reason — the inline style system and shared state make extraction expensive.
7. **This repo is public.** Never commit deploy specifics — hostnames, ports, SSH usernames, IPs, reverse-proxy config. `.env.local` and `data/` are gitignored for secrets/personal data; keep it that way, and don't add deploy topology to any tracked file (including this one). If you need that context, ask the user directly rather than writing it down here.
8. **This file drifts.** When you land a change that alters models, features, schema, or removes/adds a system (like the persona removal that CLAUDE.md missed for months), update this file in the same commit. A stale CLAUDE.md is worse than no CLAUDE.md.
