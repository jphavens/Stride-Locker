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
- `buildContext()` converts felt temp + wind + humidity into climate guidance (REQUIRED/CONSIDER lines) that the AI reasons against — not hard filters; the model can still pick an item rated outside today's range when layering or effort justifies it. It also surfaces each item's `notes` (free text) in the locker lines it builds, so anything the user wrote (e.g. "unlined") reaches the AI. **Excludes shoes** from the locker lines it builds (footwear is out of scope for outfit suggestions — chosen separately)
- `getSuggestion()` sends the guidance + full locker (minus shoes, with shade descriptions and notes) to Claude for a JSON outfit response. Bottom, Top, and Socks are always required; accessory categories (Gloves, Hat, etc.) are added per climate guidance. The response is constrained to `OUTFIT_SUGGESTION_SCHEMA` via `output_config.format` (structured outputs), so parsing doesn't depend on the model producing well-formed freeform JSON.

### Layering & Bottom-Category Reasoning
- The AI may add a "Base Layer — Bottom" row alongside a Shorts "Bottom" row for two distinct reasons: **coverage/support** — an `underwear`-type item (compression underwear) paired under shorts at any temperature or activity, especially when the shorts' notes mention no liner/unlined — or **warmth** — a `tights`-type item worn under shorts on cooler days (roughly felt < 52°F).
- On cold days (roughly felt < 52°F) the model weighs three options for the main Bottom rather than defaulting to tights: Pants alone (`pants`-type item, standalone), Tights alone, or Shorts + Tights layered for warmth.
- Guardrails enforced in the prompt's RULES: an `underwear`-type item must never be the sole Bottom (only ever a base-layer row alongside a real Bottom); a `pants`-type item must never be used as a base layer.

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
- **Backend:** Vite dev-server middleware (`vite.config.js`) exposes a small `locker-api` — `GET/POST /api/locker` (reads/writes `data/locker.json`) and `GET/POST /api/photos/:lockerId` (reads/writes `data/photos/{lockerId}.jpg`). No separate server process, no server-side auth — all AI calls remain client-side.
- **Host:** Self-hosted via Docker on the user's home infrastructure. Deploy details (hostname, ports, SSH access) intentionally live outside this repo, not in tracked files — this repo is public.

### File Structure
```
src/
  App.jsx       — entire app (single component, ~1100+ lines and growing; expect drift, don't trust an exact count here)
  main.jsx      — React DOM mount
  index.css     — global reset
data/           — server-persisted locker.json + photos/ (gitignored, never commit)
.env.local      — VITE_ANTHROPIC_API_KEY (gitignored, never commit)
vite.config.js  — locker-api middleware; allowedHosts restricted to the deploy host (see that file, not documented here)
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
  fabric: "Veloce Blend",            // optional
  persona: ["realkeeper"],           // legacy field on curated GEAR_DB items — NOT read by any current logic, purely inert. Don't wire it up without being asked; the persona/style-filter feature was intentionally removed.
  isCustom: true,                    // only on manual entries
  notes: "...",                      // optional, custom only
  wornToday: "Mon Apr 21 2026",      // TODAY string or null
}
```

### AI Integration
| Call | Model | Trigger | Purpose |
|------|-------|---------|---------|
| Outfit suggestion | `claude-opus-4-8` | "Get Outfit Suggestion" button | Full outfit JSON (Bottom/Top/Socks always, accessories per climate, no shoes) from locker + climate rules, schema-constrained via `output_config.format` |
| Shade analysis | `claude-opus-4-8` | Photo captured at add or edit time | 1-2 sentence color description, stored on item |

Both calls: `POST https://api.anthropic.com/v1/messages` with headers `x-api-key: VITE_ANTHROPIC_API_KEY` and `anthropic-version: 2023-06-01`. Model name drifts as it gets upgraded — grep `model:"` in `src/App.jsx` for ground truth rather than trusting this table blindly. The outfit-suggestion call passes `output_config: {format: {type:"json_schema", schema: OUTFIT_SUGGESTION_SCHEMA}}` so the API guarantees schema-valid JSON server-side — no markdown-fence stripping or malformed-JSON fallback needed on the client.

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
4. **API Key:** Never hardcode. Always use `import.meta.env.VITE_ANTHROPIC_API_KEY`. Key lives in `.env.local` (gitignored).
5. **Photos:** Blob data lives in IndexedDB (client cache) and as a JPEG on the server (`data/photos/`) — never in localStorage. Only the `shadeDescription` text travels with the locker item record.
6. **Single component:** App.jsx is intentionally monolithic. Don't extract components unless there's a strong reason — the inline style system and shared state make extraction expensive.
7. **This repo is public.** Never commit deploy specifics — hostnames, ports, SSH usernames, IPs, reverse-proxy config. `.env.local` and `data/` are gitignored for secrets/personal data; keep it that way, and don't add deploy topology to any tracked file (including this one). If you need that context, ask the user directly rather than writing it down here.
8. **This file drifts.** When you land a change that alters models, features, schema, or removes/adds a system (like the persona removal that CLAUDE.md missed for months), update this file in the same commit. A stale CLAUDE.md is worse than no CLAUDE.md.
