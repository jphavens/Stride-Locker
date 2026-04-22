# Stride Locker - Project Context & Vision

## 🎯 The Objective
Stride Locker is a "Digital Gear Closet" for runners. It solves the friction of matching clothing to weather and activity levels. Critically, it is designed for a **colorblind user** to remove the stress of color-matching and coordination.

## 🎨 Design & Accessibility Philosophy
- **Colorblind Friendly:** Do not rely on color alone to convey information. Use icons, labels, and text. The AI acts as a "Style Consultant," using objective color labels (e.g., "deep navy with purple undertones") so the user can coordinate outfits without needing to perceive color accurately.
- **Aesthetic:** Heritage, Gorpcore, and Minimalist (e.g., Tracksmith, Satisfy, District Vision).
- **Coordination Logic:** Shade descriptions captured at add-time are stored on items and fed into every outfit suggestion, giving the AI precise color intelligence without re-analyzing photos.

## 🧠 Core Logic & Features

### Weather → Outfit Flow
- Fetches real-time weather via Open-Meteo API (geolocation)
- Computes "felt temp" adjusted for activity effort (+15°F workout/race, -5°F easy)
- `buildContext()` converts felt temp + wind + humidity into hard climate rules
- `getSuggestion()` sends rules + full locker (with shade descriptions) to Claude Sonnet for a JSON outfit response

### Style Personas
Five personas filter brand/aesthetic preference: Real Keeper, Fashion Pacer, Precision Performer, Mindful Jogger, Trail Rebel. Applied after climate and color rules.

### Locker Management
- Track "worn today" status per item; AI avoids repeating worn items
- Filter by gear type
- Custom gear entry alongside curated GEAR_DB

### Photo & Shade System (added session 2)
- **Capture:** On add, user optionally captures or uploads a photo (camera + library picker on mobile)
- **Analysis:** Claude Haiku analyzes the photo once, returning a 1-2 sentence precise shade description (e.g., "deep forest green with subtle olive undertones")
- **Storage:** Photo Blob stored in IndexedDB (`stride-photos` DB, `photos` store, keyed by `lockerId`). Shade description stored as `shadeDescription` string on the locker item in localStorage. Photos are compressed to max 1024px / JPEG 85% before storage and analysis.
- **Photo Library:** Dedicated "Photos" nav tab — 2-column grid of all photographed gear with name, colorway, and shade description overlaid.
- **Outfit prompts:** `shadeDescription` is automatically appended to every locker item line sent to Claude (`| Shade: deep navy with...`), giving the stylist AI precise color intelligence at suggestion time with zero extra API calls.

## 🛠 Technical Architecture

### Stack
- **Frontend:** React, Vite, Tailwind v4 (via inline CSS in `css` template literal), Lucide-React, Recharts, Framer Motion
- **Host:** Ubuntu Server via Tailscale (`stride.home`, port 5173)
- **No backend / no server-side auth** — all API calls are client-side

### File Structure
```
src/
  App.jsx       — entire app (single component, ~970 lines)
  main.jsx      — React DOM mount
  index.css     — global reset
.env.local      — VITE_ANTHROPIC_API_KEY (gitignored, never commit)
vite.config.js  — allowedHosts: ['stride.home'], port 5173
```

### Data Persistence
| What | Where | Key |
|------|-------|-----|
| Locker items (incl. shadeDescription) | localStorage | `stride-v6-locker` |
| Selected persona | localStorage | `stride-persona` |
| Gear photos (Blob) | IndexedDB | DB: `stride-photos`, store: `photos`, key: `lockerId` |

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
  warmthMin: 52, warmthMax: 95,
  fabric: "Veloce Blend",            // optional
  persona: ["realkeeper"],
  isCustom: true,                    // only on manual entries
  notes: "...",                      // optional, custom only
  wornToday: "Mon Apr 21 2026",      // TODAY string or null
}
```

### AI Integration
| Call | Model | Trigger | Purpose |
|------|-------|---------|---------|
| Outfit suggestion | `claude-sonnet-4-20250514` | "Get Outfit Suggestion" button | Full outfit JSON from locker + climate rules |
| Shade analysis | `claude-haiku-4-5-20251001` | Photo captured at add-time | 1-2 sentence color description, stored on item |

Both calls: `POST https://api.anthropic.com/v1/messages` with headers `x-api-key: VITE_ANTHROPIC_API_KEY` and `anthropic-version: 2023-06-01`.

### Navigation Views
| View | Key | Notes |
|------|-----|-------|
| Today / Suggest | `home` / `suggest` | Weather, activity, persona, outfit output |
| Locker | `locker` | Item list with thumbnails, shade descriptions, worn tracking |
| Photos | `photos` | 2-col photo library grid |
| Browse | `gear` | Search/filter GEAR_DB, add to locker |

## ⚠️ Development Rules
1. **Label Everything:** Always include text labels for colors in the UI. Never rely on color alone.
2. **Mobile First:** Optimized for a quick check before heading out the door.
3. **Tailwind v4:** Standard styling engine (applied via inline `<style>` tag with CSS classes — see `css` template literal in App.jsx).
4. **API Key:** Never hardcode. Always use `import.meta.env.VITE_ANTHROPIC_API_KEY`. Key lives in `.env.local` (gitignored).
5. **Photos stay in IndexedDB:** Never store Blob data in localStorage. Only the `shadeDescription` text travels with the item.
6. **Single component:** App.jsx is intentionally monolithic. Don't extract components unless there's a strong reason — the inline style system and shared state make extraction expensive.
