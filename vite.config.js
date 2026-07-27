import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import fs from 'fs'
import path from 'path'

const DATA_DIR = path.resolve(process.cwd(), 'data')
const LOCKER_FILE = path.join(DATA_DIR, 'locker.json')
const PHOTOS_DIR = path.join(DATA_DIR, 'photos')

// Kept in sync with TYPE_LABELS in src/App.jsx — buildContext() needs it to
// format locker lines for the AI prompt, same as the client used to.
const TYPE_LABELS = { "shorts":"Shorts","tights":"Tights","pants":"Pants","underwear":"Compression Underwear","tank":"Tank / Singlet","top-ss":"Short Sleeve","top-ls":"Long Sleeve","midlayer":"Midlayer","jacket":"Jacket","vest":"Vest","hat":"Hat / Cap","gloves":"Gloves","socks":"Socks","shoes":"Shoes" };

const OUTFIT_ITEM_SCHEMA = {
  type: "object",
  properties: {
    category: { type: "string", description: "e.g. Bottom, Top, Socks, Base Layer — Bottom, Gloves, Hat" },
    item: { anyOf: [{type:"string"},{type:"null"}], description: "brand+name, or null if no locker item fits" },
    colorway: { anyOf: [{type:"string"},{type:"null"}], description: "colorway, or null" },
    typeRecommendation: { type: "string", description: "only present if item is null" },
    why: { type: "string", description: "one sentence" }
  },
  required: ["category","item","colorway","why"],
  additionalProperties: false
};
const OUTFIT_SUGGESTION_SCHEMA = {
  type: "object",
  properties: {
    headline: { type: "string", description: "4-7 word editorial outfit name" },
    items: { type: "array", items: OUTFIT_ITEM_SCHEMA },
    stylistNote: { type: "string", description: "2-3 sentences: color story, climate logic, what makes it intentional" },
    weatherSummary: { type: "string", description: "one sharp line on what to expect physically" }
  },
  required: ["headline","items","stylistNote","weatherSummary"],
  additionalProperties: false
};

const TODAY = new Date().toDateString();

// ─── ALGORITHM (moved from src/App.jsx — needs to run server-side now that
// the Anthropic call is server-side) ───────────────────────────────────────
function buildContext(temp, wind, humidity, activity, locker) {
  const adj = (activity==="workout"||activity==="race")?15:activity==="easy"?-5:0;
  const felt = temp + adj;
  const climate = [];
  if (felt<32)      {climate.push("REQUIRED bottom: tights or pants");climate.push("REQUIRED top: long sleeve");climate.push("REQUIRED: midlayer or jacket");climate.push("REQUIRED: gloves");climate.push("REQUIRED: hat or beanie");climate.push("CONSIDER: neck gaiter or buff");}
  else if (felt<42) {climate.push("REQUIRED bottom: tights or pants");climate.push("REQUIRED top: long sleeve");climate.push("REQUIRED: gloves");climate.push("CONSIDER: midlayer or vest");climate.push("CONSIDER: light hat or ear covering");}
  else if (felt<52) {climate.push("REQUIRED bottom: tights, pants, or shorts");climate.push("REQUIRED top: long sleeve or short sleeve");climate.push("CONSIDER: light gloves");climate.push("CONSIDER: vest");}
  else if (felt<62) {climate.push("REQUIRED bottom: shorts");climate.push("REQUIRED top: short sleeve — no tanks");climate.push("CONSIDER: vest if breezy");}
  else if (felt<72) {climate.push("REQUIRED bottom: shorts");climate.push("REQUIRED top: short sleeve or tank/singlet");}
  else              {climate.push("REQUIRED bottom: lightest shorts");climate.push("REQUIRED top: tank/singlet preferred, lightest short sleeve acceptable");climate.push("CONSIDER: lightweight cap for sun and sweat");}
  if (wind>18) climate.push("REQUIRED: wind-blocking layer (jacket, midlayer, or vest)");
  if (humidity>78) climate.push("REQUIRED: moisture-wicking only");
  if (activity==="long") climate.push("CONSIDER: pockets, anti-chafe fabrics");
  const lockerLines = locker.filter(item => item.type!=="shoes").map(item => {
    const worn = item.wornToday===TODAY?" [WORN TODAY — avoid repeating]":"";
    const shade = item.shadeDescription ? ` | Shade: ${item.shadeDescription}` : "";
    const notes = item.notes ? ` | Notes: ${item.notes}` : "";
    return `${item.brand} ${item.name} (${item.colorway})${shade}${item.fabric?` [${item.fabric}]`:""} — ${TYPE_LABELS[item.type]||item.type} | rated ${item.warmthMin}–${item.warmthMax}°F${worn}${item.isCustom?" [custom]":""}${notes}`;
  });
  return {felt,climate,lockerLines};
}

const ACTIVITY_INFO = {
  easy: { label:"Easy Run", desc:"Recovery / conversational pace" },
  workout: { label:"Workout", desc:"Tempo, intervals, or fartlek" },
  long: { label:"Long Run", desc:"Distance — 60+ minutes" },
  race: { label:"Race", desc:"All out effort" },
};

function buildPrompt(ctx, activity, weather) {
  const actInfo = ACTIVITY_INFO[activity] || { label: activity, desc: "" };
  return `You are a running outfit editor. Pick one complete outfit from the locker below.

CONDITIONS: Felt temp ${ctx.felt}°F (actual ${weather.temp}°F) | Wind: ${weather.wind} mph | Humidity: ${weather.humidity}% | ${weather.condition}
ACTIVITY: ${actInfo.label} — ${actInfo.desc}

CLIMATE GUIDANCE (reason against these — not hard rules):
${ctx.climate.map(r=>`- ${r}`).join("\n")}
Prefer gear appropriate for the felt temp and activity. You MAY use an item rated outside today's range when effort or layering justifies it — reason about it.

ACTIVITY STYLE:
- workout/race → minimal and breathable; a short paired with compression underwear underneath is often preferred over full tights, even when cool
- easy → comfort and warmth fine
- long → coverage, pockets, anti-chafe fabrics

LAYERING — there are two distinct reasons to add a "Base Layer — Bottom" row alongside a Shorts "Bottom" row. They use different locker item types and different reasoning. Do not conflate them:
1. COVERAGE / SUPPORT layering (any temperature, any activity): if the chosen Bottom is shorts, check the locker for an "underwear"-type item (compression underwear). Pair it under the shorts as "Base Layer — Bottom" when the shorts' notes mention no liner, unlined, or similar, or when extra coverage/support suits the activity (e.g. workout/race). This is not a warmth decision — it applies on a hot day just as much as a cool one.
2. WARMTH layering (cooler days only, roughly felt < 52°F): a "tights"-type item may instead be worn under shorts as a "Base Layer — Bottom" purely for insulation. This is one of three cold-weather options for the bottom half — weigh it against choosing Pants alone or Tights alone as the main Bottom (see COLD BOTTOM CHOICE below) rather than defaulting to it automatically.
Add at most one "Base Layer — Bottom" row — pick whichever reason actually applies, or neither. Use the same item object shape for any base-layer row.

TOP LAYERING: The Top is a single item (Long Sleeve, Short Sleeve, or Tank/Singlet). When climate guidance flags "midlayer" or "vest", you may add one "Outer Layer" row using a locker item labeled "Midlayer" or "Vest" — never a second Top item. Reach for "Midlayer" when arms need warmth too (cold, low-effort, or wind-exposed conditions); reach for "Vest" when only the core needs wind/warmth blocking and the arms should stay free (mild-cool, breezy, or high-effort conditions where full sleeves would overheat). If climate guidance says "REQUIRED: wind-blocking layer (jacket, midlayer, or vest)", pick whichever of the three best fits the felt temp and arm-coverage need above.

COLD BOTTOM CHOICE: On cooler days (roughly felt < 52°F), reason about three options for the main Bottom rather than reflexively picking tights:
(a) Bottom: Pants — a standalone "pants"-type item, worn alone with no shorts
(b) Bottom: Tights — a standalone "tights"-type item, worn alone with no shorts
(c) Bottom: Shorts + Base Layer — Bottom: Tights — shorts layered over tights for warmth (per WARMTH layering above)
Weigh activity and felt temp when choosing; Pants and Tights-alone are equally valid options to Shorts+Tights-layered, not fallbacks.

COLOR: Neutrals (black/white/grey/navy/ecru/olive) pair with anything. Earth tones (rust/sage/moss/tan) are cohesive. Balance bold with neutral. Honor shade descriptions for coordination.

LOCKER (warmth ratings are guidance for reasoning):
${ctx.lockerLines.length>0 ? ctx.lockerLines.join("\n") : "Empty"}

RULES:
- ONLY suggest items from the LOCKER list above.
- Strongly avoid any item marked [WORN TODAY — avoid repeating] unless it is the only sensible option.
- Always include Bottom, Top, and Socks.
- Add accessory categories (Gloves, Hat, etc.) whenever climate guidance lists them as REQUIRED or CONSIDER — REQUIRED accessories must appear even if the locker has none; CONSIDER accessories appear only if the locker has a matching item. Midlayer and vest are handled separately under TOP LAYERING above, not as generic accessories.
- If no suitable locker item exists for a slot, set "item" to null and provide a "typeRecommendation".
- Never invent brand names or models not in the locker.
- An "underwear"-type item (compression underwear) must NEVER be used as the main "Bottom" category by itself — it may only appear as a "Base Layer — Bottom" row alongside a real Bottom (Shorts, Tights, or Pants).
- A "pants"-type item is a standalone Bottom, not a base layer — never place it in a "Base Layer — Bottom" row, and do not pair Pants with a Tights base-layer row (redundant warmth). Pants may still be paired with an "underwear" base-layer row for coverage/support if the locker has one.
- The Top item may only appear once in the outfit — never duplicate it under a different category name (e.g. "Base Layer — Top"). Any second warmth layer must be an "Outer Layer" row using a Midlayer or Vest item.
- Do not mention or reference shoes anywhere in the output — footwear is chosen separately and is out of scope for this suggestion.`;
}

// Deterministic backstop: the model occasionally stacks two Top-category items
// (e.g. relabeling a second long sleeve as "Base Layer — Top") despite prompt
// instructions against it. Strip duplicates by matching against actual locker
// item types rather than trusting the model's own category labels.
function findLockerType(itemStr, locker) {
  if (!itemStr) return null;
  const norm = s => (s||"").toLowerCase().replace(/[^a-z0-9]+/g,"");
  const target = norm(itemStr);
  const match = locker.find(i => norm(`${i.brand} ${i.name}`) === target);
  return match ? match.type : null;
}
function sanitizeTopLayering(suggestion, locker) {
  if (!suggestion || !Array.isArray(suggestion.items)) return suggestion;
  const topTypes = new Set(["top-ss","top-ls","tank"]);
  const isTopItem = row => topTypes.has(findLockerType(row.item, locker));
  const topRows = suggestion.items.filter(isTopItem);
  if (topRows.length <= 1) return suggestion;
  const keeper = topRows.find(r => (r.category||"").trim().toLowerCase() === "top") || topRows[0];
  const items = suggestion.items.filter(row => row === keeper || !isTopItem(row));
  console.warn("Stride: removed duplicate Top-category item(s) from AI suggestion", topRows.filter(r=>r!==keeper));
  return { ...suggestion, items };
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on('data', chunk => chunks.push(chunk));
    req.on('end', () => resolve(Buffer.concat(chunks)));
    req.on('error', reject);
  });
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const ANTHROPIC_API_KEY = env.ANTHROPIC_API_KEY

  return {
    plugins: [
      react(),
      {
        name: 'locker-api',
        configureServer(server) {
          // Locker items — GET to load, POST to save
          server.middlewares.use('/api/locker', (req, res) => {
            res.setHeader('Content-Type', 'application/json')
            if (req.method === 'GET') {
              try {
                res.end(fs.existsSync(LOCKER_FILE) ? fs.readFileSync(LOCKER_FILE, 'utf-8') : 'null')
              } catch (e) { res.writeHead(500); res.end(JSON.stringify({ error: e.message })) }
            } else if (req.method === 'POST') {
              let body = ''
              req.on('data', chunk => body += chunk)
              req.on('end', () => {
                try {
                  fs.mkdirSync(DATA_DIR, { recursive: true })
                  fs.writeFileSync(LOCKER_FILE, body, 'utf-8')
                  res.end(JSON.stringify({ ok: true }))
                } catch (e) { res.writeHead(500); res.end(JSON.stringify({ error: e.message })) }
              })
            } else { res.writeHead(405); res.end() }
          })

          // Photos — GET /api/photos/:lockerId, POST /api/photos/:lockerId, DELETE /api/photos/:lockerId
          server.middlewares.use('/api/photos', (req, res) => {
            const lockerId = req.url.slice(1) // strip leading '/'
            if (!lockerId) { res.writeHead(400); res.end(); return }
            const file = path.join(PHOTOS_DIR, `${lockerId}.jpg`)

            if (req.method === 'GET') {
              try {
                if (fs.existsSync(file)) {
                  res.setHeader('Content-Type', 'image/jpeg')
                  res.end(fs.readFileSync(file))
                } else { res.writeHead(404); res.end() }
              } catch (e) { res.writeHead(500); res.end(e.message) }
            } else if (req.method === 'POST') {
              const chunks = []
              req.on('data', chunk => chunks.push(chunk))
              req.on('end', () => {
                try {
                  fs.mkdirSync(PHOTOS_DIR, { recursive: true })
                  fs.writeFileSync(file, Buffer.concat(chunks))
                  res.setHeader('Content-Type', 'application/json')
                  res.end(JSON.stringify({ ok: true }))
                } catch (e) { res.writeHead(500); res.end(e.message) }
              })
            } else if (req.method === 'DELETE') {
              try {
                if (fs.existsSync(file)) fs.unlinkSync(file)
                res.setHeader('Content-Type', 'application/json')
                res.end(JSON.stringify({ ok: true }))
              } catch (e) { res.writeHead(500); res.end(e.message) }
            } else { res.writeHead(405); res.end() }
          })

          // Outfit suggestion — server builds climate context + prompt, calls Anthropic,
          // sanitizes the response, returns the same shape the client already expects.
          server.middlewares.use('/api/suggest', (req, res) => {
            if (req.method !== 'POST') { res.writeHead(405); res.end(); return }
            res.setHeader('Content-Type', 'application/json')
            readBody(req).then(async (raw) => {
              try {
                const { temp, wind, humidity, condition, activity, locker } = JSON.parse(raw.toString('utf-8'))
                const ctx = buildContext(temp, wind, humidity, activity, locker)
                const prompt = buildPrompt(ctx, activity, { temp, wind, humidity, condition })
                const aiRes = await fetch('https://api.anthropic.com/v1/messages', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json', 'x-api-key': ANTHROPIC_API_KEY, 'anthropic-version': '2023-06-01' },
                  body: JSON.stringify({ model: 'claude-sonnet-5', max_tokens: 4000, messages: [{ role: 'user', content: prompt }], output_config: { format: { type: 'json_schema', schema: OUTFIT_SUGGESTION_SCHEMA } } })
                })
                const d = await aiRes.json()
                if (!aiRes.ok) throw new Error(d.error?.message || `API error ${aiRes.status}`)
                if (d.stop_reason === 'max_tokens') console.warn('Outfit call hit max_tokens')
                const txt = d.content?.find(b => b.type === 'text')?.text || ''
                const parsed = sanitizeTopLayering(JSON.parse(txt.trim()), locker)
                res.end(JSON.stringify(parsed))
              } catch (e) {
                res.end(JSON.stringify({ error: true, message: e.message }))
              }
            })
          })

          // Shade analysis — client sends the already-compressed JPEG as a raw body.
          server.middlewares.use('/api/shade', (req, res) => {
            if (req.method !== 'POST') { res.writeHead(405); res.end(); return }
            res.setHeader('Content-Type', 'application/json')
            readBody(req).then(async (buf) => {
              try {
                const base64 = buf.toString('base64')
                const aiRes = await fetch('https://api.anthropic.com/v1/messages', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json', 'x-api-key': ANTHROPIC_API_KEY, 'anthropic-version': '2023-06-01' },
                  body: JSON.stringify({
                    model: 'claude-sonnet-5',
                    max_tokens: 300,
                    messages: [{ role: 'user', content: [
                      { type: 'image', source: { type: 'base64', media_type: 'image/jpeg', data: base64 } },
                      { type: 'text', text: 'Describe the exact shade and color of this running gear in 1-2 precise sentences. Be specific about tone (e.g., \'deep navy with slight purple undertones\', not just \'blue\'). Help a colorblind person coordinate outfits.' }
                    ] }]
                  })
                })
                const d = await aiRes.json()
                if (!aiRes.ok) throw new Error(d.error?.message || `API error ${aiRes.status}`)
                if (d.stop_reason === 'max_tokens') console.warn('Photo/shade call hit max_tokens')
                const text = d.content?.find(b => b.type === 'text')?.text?.trim()
                if (!text) throw new Error('Empty response from model')
                res.end(JSON.stringify({ shadeDescription: text }))
              } catch (e) {
                res.end(JSON.stringify({ error: e.message }))
              }
            })
          })
        }
      }
    ],
    server: {
      host: true,
      strictPort: true,
      port: 5173,
      allowedHosts: ['stride.home']
    }
  }
})
