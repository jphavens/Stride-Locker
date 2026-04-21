import { useState, useEffect } from "react";

// ─── CONSTANTS ────────────────────────────────────────────────────────────────

const STYLE_PERSONAS = [
  { id:"realkeeper", label:"Real Keeper", tag:"Heritage · Collegiate", description:"Tracksmith, New Balance — timeless aesthetics, discipline, the amateur spirit of the sport", brands:["Tracksmith","New Balance","Brooks","Saucony"] },
  { id:"fashion-pacer", label:"Fashion Pacer", tag:"Streetwear · Gorpcore", description:"Satisfy, Bandit, Norda — technical details as fashion statements, blurring sport and street", brands:["Satisfy","Bandit","Norda","Hoka"] },
  { id:"precision", label:"Precision Performer", tag:"Technical · Minimalist", description:"On Running, Soar, Janji — industrial sophistication, performance-first with a clean edge", brands:["On Running","Soar","Janji","Adidas"] },
  { id:"mindful", label:"Mindful Jogger", tag:"Expressive · Vibrant", description:"District Vision, NNormal, Rabbit — joyful palette, mindful movement, vibrant self-expression", brands:["District Vision","NNormal","Rabbit","Ciele"] },
  { id:"trail-rebel", label:"Trail Rebel", tag:"Rugged · Mountain-to-City", description:"Salomon, La Sportiva, Patagonia — gorpcore authority, built for the mountain and the street", brands:["Salomon","La Sportiva","The North Face","Patagonia"] },
];

const GEAR_DB = [
  { id:"s1", brand:"Satisfy", name:"Justice Distance Shorts", type:"shorts", fabric:"Justice™", persona:["fashion-pacer","precision"], warmthMin:55, warmthMax:95, colorways:["Black","Aged White","Olive Drab"] },
  { id:"s2", brand:"Satisfy", name:"MothTech Muscle Shorts", type:"shorts", fabric:"MothTech™", persona:["fashion-pacer"], warmthMin:58, warmthMax:95, colorways:["Black","Off White","Moss"] },
  { id:"s3", brand:"Satisfy", name:"AuraLite Trail Shorts", type:"shorts", fabric:"AuraLite™", persona:["fashion-pacer","precision"], warmthMin:55, warmthMax:95, colorways:["Black","Ecru","Burgundy"] },
  { id:"s4", brand:"Tracksmith", name:"Session Short", type:"shorts", fabric:"Veloce Blend", persona:["realkeeper"], warmthMin:52, warmthMax:95, colorways:["Heather Grey","Black","Navy","Ivory"] },
  { id:"s5", brand:"Tracksmith", name:"Van Cortlandt Short", type:"shorts", fabric:"2:09 Mesh", persona:["realkeeper"], warmthMin:55, warmthMax:95, colorways:["Heather Grey/Navy","Black/Gold","Ivory/Wine"] },
  { id:"s6", brand:"Tracksmith", name:"Twilight Short", type:"shorts", fabric:"Bravio Blend", persona:["realkeeper"], warmthMin:58, warmthMax:95, colorways:["Heather Navy","Black","Moss Gray"] },
  { id:"s7", brand:"On Running", name:"Lightweight Shorts 5in", type:"shorts", fabric:"Swift-Weave", persona:["precision"], warmthMin:55, warmthMax:95, colorways:["Black","Navy","Glacier","Undyed"] },
  { id:"s8", brand:"District Vision", name:"Sphaera 4in Short", type:"shorts", fabric:"Technical Mesh", persona:["mindful"], warmthMin:55, warmthMax:95, colorways:["Black","Sage","Dark Taupe","Wild Flower"] },
  { id:"s9", brand:"Rabbit", name:"Run Stuff It Short", type:"shorts", fabric:"EZ Performance", persona:["mindful"], warmthMin:50, warmthMax:90, colorways:["Black","Cobalt Blue","Forest Green","Sky"] },
  { id:"s10", brand:"Janji", name:"5in AFO Short", type:"shorts", fabric:"AFO Stretch", persona:["precision"], warmthMin:55, warmthMax:95, colorways:["Black","Dusk Blue","Vintage Khaki","Rust"] },
  { id:"s11", brand:"Bandit", name:"Run Short 5in", type:"shorts", fabric:"Stretch Woven", persona:["fashion-pacer"], warmthMin:55, warmthMax:95, colorways:["Black","Ecru","Forest"] },
  { id:"s12", brand:"Soar", name:"Run Short", type:"shorts", fabric:"Swift Knit", persona:["precision"], warmthMin:55, warmthMax:95, colorways:["Black","White","Navy"] },
  { id:"t1", brand:"Satisfy", name:"TechSilk Tights", type:"tights", fabric:"TechSilk™", persona:["fashion-pacer","precision"], warmthMin:20, warmthMax:52, colorways:["Black","Dark Olive"] },
  { id:"t2", brand:"Tracksmith", name:"Twilight Tight", type:"tights", fabric:"Bravio Blend", persona:["realkeeper"], warmthMin:22, warmthMax:50, colorways:["Heather Navy","Black","Moss Gray"] },
  { id:"t3", brand:"Tracksmith", name:"Harrier Tight", type:"tights", fabric:"Inverno Blend", persona:["realkeeper"], warmthMin:15, warmthMax:45, colorways:["Black","Heather Grey"] },
  { id:"t4", brand:"On Running", name:"Running Tights", type:"tights", fabric:"Swift-Weave", persona:["precision"], warmthMin:20, warmthMax:50, colorways:["Black","Navy"] },
  { id:"t5", brand:"District Vision", name:"Sphaera Tight", type:"tights", fabric:"Compression Knit", persona:["mindful"], warmthMin:22, warmthMax:50, colorways:["Black","Dark Taupe","Sage"] },
  { id:"t6", brand:"Rabbit", name:"Run Tight", type:"tights", fabric:"EZ Compression", persona:["mindful"], warmthMin:20, warmthMax:50, colorways:["Black","Heather Charcoal","Forest"] },
  { id:"ts1", brand:"Satisfy", name:"AuraLite Tee", type:"top-ss", fabric:"AuraLite™", persona:["fashion-pacer","precision"], warmthMin:52, warmthMax:95, colorways:["White","Black","Aged White","Burgundy"] },
  { id:"ts2", brand:"Satisfy", name:"MothTech Muscle Tee", type:"top-ss", fabric:"MothTech™", persona:["fashion-pacer"], warmthMin:58, warmthMax:95, colorways:["Black","Off White","Washed Brown"] },
  { id:"ts3", brand:"Satisfy", name:"PeaceShell River Shirt", type:"top-ss", fabric:"PeaceShell™", persona:["fashion-pacer"], warmthMin:52, warmthMax:85, colorways:["Black","Olive","Ecru"] },
  { id:"ts4", brand:"Tracksmith", name:"Harrier Tee", type:"top-ss", fabric:"Merino/Nylon", persona:["realkeeper"], warmthMin:48, warmthMax:85, colorways:["Heather Grey","Navy","Ivory","Bering Sea"] },
  { id:"ts5", brand:"Tracksmith", name:"Van Cortlandt Singlet", type:"top-ss", fabric:"2:09 Mesh", persona:["realkeeper"], warmthMin:55, warmthMax:95, colorways:["Heather Grey/Navy","Black/Gold","Ivory/Wine"] },
  { id:"ts6", brand:"District Vision", name:"Karuna Training Tee", type:"top-ss", fabric:"Recycled Mesh", persona:["mindful"], warmthMin:55, warmthMax:95, colorways:["Black","White","Sage","Chamomile","Arctic Gray"] },
  { id:"ts7", brand:"On Running", name:"Performance Tee", type:"top-ss", fabric:"On-Dry", persona:["precision"], warmthMin:50, warmthMax:95, colorways:["Black","White","Glacier","Undyed"] },
  { id:"ts8", brand:"Janji", name:"Groundwork Tee", type:"top-ss", fabric:"AFO Air", persona:["precision"], warmthMin:50, warmthMax:90, colorways:["Black","Fog","Rust","Dusk Blue"] },
  { id:"ts9", brand:"Rabbit", name:"Run EZ Short Sleeve", type:"top-ss", fabric:"EZ Performance", persona:["mindful"], warmthMin:50, warmthMax:90, colorways:["White","Black","Sky","Wild Flower"] },
  { id:"ts10", brand:"Bandit", name:"Run Tee", type:"top-ss", fabric:"Stretch Knit", persona:["fashion-pacer"], warmthMin:52, warmthMax:90, colorways:["Black","Ecru","Sage"] },
  { id:"ts11", brand:"Soar", name:"Technical Tee", type:"top-ss", fabric:"Swift Knit", persona:["precision"], warmthMin:52, warmthMax:90, colorways:["Black","White","Navy"] },
  { id:"ts12", brand:"NNormal", name:"Running Tee", type:"top-ss", fabric:"Recycled Tech", persona:["mindful","trail-rebel"], warmthMin:50, warmthMax:90, colorways:["Black","White","Terracotta"] },
  { id:"tl1", brand:"Satisfy", name:"CloudMerino Long Sleeve", type:"top-ls", fabric:"CloudMerino™", persona:["fashion-pacer","precision"], warmthMin:32, warmthMax:58, colorways:["Black","Ecru","Moss"] },
  { id:"tl2", brand:"Tracksmith", name:"Harrier Long Sleeve", type:"top-ls", fabric:"Inverno Blend", persona:["realkeeper"], warmthMin:28, warmthMax:55, colorways:["Heather Grey","Navy","Bering Sea"] },
  { id:"tl3", brand:"District Vision", name:"Karuna Long Sleeve", type:"top-ls", fabric:"Recycled Mesh", persona:["mindful"], warmthMin:35, warmthMax:58, colorways:["Black","Chamomile","Sage","Cacao"] },
  { id:"tl4", brand:"On Running", name:"Performance Long-T", type:"top-ls", fabric:"On-Dry", persona:["precision"], warmthMin:30, warmthMax:55, colorways:["Black","Navy","Undyed"] },
  { id:"tl5", brand:"Janji", name:"Groundwork Long Sleeve", type:"top-ls", fabric:"AFO Air", persona:["precision"], warmthMin:32, warmthMax:55, colorways:["Black","Forest","Fog"] },
  { id:"m1", brand:"Satisfy", name:"CloudMerino Half-Zip", type:"midlayer", fabric:"CloudMerino™", persona:["fashion-pacer","precision"], warmthMin:22, warmthMax:48, colorways:["Black","Ecru","Olive Drab"] },
  { id:"m2", brand:"Tracksmith", name:"Oslo Half-Zip", type:"midlayer", fabric:"Inverno Blend", persona:["realkeeper"], warmthMin:18, warmthMax:45, colorways:["Heather Grey","Navy","Black","Wine"] },
  { id:"m3", brand:"District Vision", name:"Sphaera Half-Zip", type:"midlayer", fabric:"Compression Knit", persona:["mindful"], warmthMin:28, warmthMax:50, colorways:["Black","Sage","Cacao"] },
  { id:"m4", brand:"Janji", name:"Groundwork Half-Zip", type:"midlayer", fabric:"AFO Fleece", persona:["precision"], warmthMin:25, warmthMax:48, colorways:["Black","Forest","Rust"] },
  { id:"m5", brand:"Bandit", name:"Quarter Zip", type:"midlayer", fabric:"Fleece Knit", persona:["fashion-pacer"], warmthMin:25, warmthMax:48, colorways:["Black","Ecru","Forest"] },
  { id:"j1", brand:"Satisfy", name:"Justice Wind Jacket", type:"jacket", fabric:"Justice™", persona:["fashion-pacer","precision"], warmthMin:18, warmthMax:45, colorways:["Black","Olive Drab","Ecru"] },
  { id:"j2", brand:"Tracksmith", name:"Twilight Jacket", type:"jacket", fabric:"Weather-Repellent Bravio", persona:["realkeeper"], warmthMin:20, warmthMax:48, colorways:["Heather Navy","Black","Ivory"] },
  { id:"j3", brand:"On Running", name:"Weather Jacket", type:"jacket", fabric:"On-Repel", persona:["precision"], warmthMin:15, warmthMax:45, colorways:["Black","Navy","Glacier"] },
  { id:"j4", brand:"Janji", name:"NGFS Vest", type:"vest", fabric:"Recycled DWR", persona:["precision"], warmthMin:25, warmthMax:50, colorways:["Black","Fog","Rust"] },
  { id:"j5", brand:"Salomon", name:"Bonatti Trail Jacket", type:"jacket", fabric:"AdvancedSkin Shield", persona:["trail-rebel"], warmthMin:18, warmthMax:50, colorways:["Black","Deep Blue","Peat"] },
  { id:"j6", brand:"District Vision", name:"Sphaera Shell", type:"jacket", fabric:"Recycled DWR", persona:["mindful","trail-rebel"], warmthMin:22, warmthMax:48, colorways:["Black","Sage","Dark Taupe"] },
  { id:"j7", brand:"NNormal", name:"Tomir Jacket", type:"jacket", fabric:"Recycled Stretch Shell", persona:["trail-rebel","mindful"], warmthMin:20, warmthMax:48, colorways:["Black","Deep Teal","Terracotta"] },
  { id:"h1", brand:"Ciele", name:"GOCap Standard", type:"hat", persona:["fashion-pacer","precision","realkeeper"], warmthMin:0, warmthMax:95, colorways:["Black","White","Navy","Olive","Red"] },
  { id:"h2", brand:"Ciele", name:"FSTCap Standard", type:"hat", persona:["fashion-pacer","precision"], warmthMin:0, warmthMax:95, colorways:["Black","White","Forest Green","Graphite"] },
  { id:"h3", brand:"Tracksmith", name:"Harrier Cap", type:"hat", persona:["realkeeper"], warmthMin:40, warmthMax:95, colorways:["Heather Grey","Navy","Black","Ivory"] },
  { id:"h4", brand:"Satisfy", name:"PeaceShell Cap", type:"hat", fabric:"PeaceShell™", persona:["fashion-pacer"], warmthMin:35, warmthMax:95, colorways:["Black","Ecru","Olive"] },
  { id:"h5", brand:"District Vision", name:"Tom Running Cap", type:"hat", persona:["mindful"], warmthMin:35, warmthMax:95, colorways:["Black","White","Sage","Chamomile"] },
  { id:"h6", brand:"Salomon", name:"Sense Aero Cap", type:"hat", persona:["trail-rebel"], warmthMin:35, warmthMax:95, colorways:["Black","Deep Blue","Peat"] },
  { id:"h7", brand:"NNormal", name:"Running Cap", type:"hat", persona:["trail-rebel","mindful"], warmthMin:35, warmthMax:95, colorways:["Black","Terracotta","Deep Teal"] },
  { id:"g1", brand:"Tracksmith", name:"Oslo Glove", type:"gloves", persona:["realkeeper"], warmthMin:0, warmthMax:38, colorways:["Black","Heather Grey","Navy"] },
  { id:"g2", brand:"On Running", name:"Running Glove", type:"gloves", persona:["precision"], warmthMin:0, warmthMax:40, colorways:["Black","Navy"] },
  { id:"g3", brand:"Salomon", name:"Agile Warm Glove", type:"gloves", persona:["trail-rebel"], warmthMin:0, warmthMax:38, colorways:["Black","Peat"] },
  { id:"g4", brand:"District Vision", name:"Running Glove", type:"gloves", persona:["mindful"], warmthMin:0, warmthMax:40, colorways:["Black","Sage"] },
  { id:"k1", brand:"Tracksmith", name:"Endorphin Sock", type:"socks", persona:["realkeeper"], warmthMin:0, warmthMax:95, colorways:["White/Navy","Black/Gold","Grey/Navy","Ivory/Wine"] },
  { id:"k2", brand:"Satisfy", name:"Merino Low Sock", type:"socks", fabric:"CloudMerino™", persona:["fashion-pacer"], warmthMin:0, warmthMax:95, colorways:["White","Black","Ecru"] },
  { id:"k3", brand:"On Running", name:"Mid Sock", type:"socks", persona:["precision"], warmthMin:0, warmthMax:95, colorways:["Black/White","White/Black","Navy/Glacier"] },
  { id:"k4", brand:"District Vision", name:"Running Sock", type:"socks", persona:["mindful"], warmthMin:0, warmthMax:95, colorways:["Black","White","Sage","Wild Flower"] },
  { id:"k5", brand:"Darn Tough", name:"Run No Show Tab", type:"socks", persona:["realkeeper","trail-rebel"], warmthMin:0, warmthMax:95, colorways:["Black","White","Navy","Olive"] },
  { id:"sh1", brand:"New Balance", name:"Fresh Foam X 1080v15", type:"shoes", persona:["realkeeper","fashion-pacer"], use:"Daily Trainer", warmthMin:0, warmthMax:95, colorways:["Grey Matter/Slate Gray","Earth Shadow","Desert Clay","Vintage Indigo","Black"] },
  { id:"sh2", brand:"New Balance", name:"880v15", type:"shoes", persona:["realkeeper"], use:"Daily Trainer", warmthMin:0, warmthMax:95, colorways:["Grey Matter","Black","Navy","White/Silver"] },
  { id:"sh3", brand:"Saucony", name:"Endorphin Speed 4", type:"shoes", persona:["realkeeper","precision"], use:"Speed / Tempo", warmthMin:0, warmthMax:95, colorways:["Black/Gold","White/Jade","Grape/Silver","Mint"] },
  { id:"sh4", brand:"Brooks", name:"Ghost 17", type:"shoes", persona:["realkeeper"], use:"Daily Trainer", warmthMin:0, warmthMax:95, colorways:["Black/Biscuit","Coconut/Portabella","Alloy/White/Gold Fusion"] },
  { id:"sh5", brand:"On Running", name:"Cloudsurfer 2", type:"shoes", persona:["precision"], use:"Daily Trainer", warmthMin:0, warmthMax:95, colorways:["Black/Eclipse","Ivory/Heron","Undyed/White","Cobalt/Glacier"] },
  { id:"sh6", brand:"On Running", name:"Cloudmonster 2", type:"shoes", persona:["precision","fashion-pacer"], use:"Max Cushion", warmthMin:0, warmthMax:95, colorways:["Black/Eclipse","Undyed/White","Glacier/Cloud"] },
  { id:"sh7", brand:"Adidas", name:"Adizero Adios Pro 4", type:"shoes", persona:["precision"], use:"Race Day", warmthMin:0, warmthMax:95, colorways:["Black/Gold","White/Solar Red","Core Black"] },
  { id:"sh8", brand:"Nike", name:"Pegasus 42", type:"shoes", persona:["precision","realkeeper"], use:"Daily Trainer", warmthMin:0, warmthMax:95, colorways:["Dusty Cactus/Black","Summit White/Photon Dust","Cannon/Volt/Obsidian"] },
  { id:"sh9", brand:"Hoka", name:"Clifton 10", type:"shoes", persona:["fashion-pacer","mindful"], use:"Daily Trainer", warmthMin:0, warmthMax:95, colorways:["Solar Flare/Lettuce","Dusk/Illusion","Harbor Mist","Nimbus Cloud","Bellweather Blue"] },
  { id:"sh10", brand:"Hoka", name:"Bondi 9", type:"shoes", persona:["fashion-pacer","mindful"], use:"Max Cushion", warmthMin:0, warmthMax:95, colorways:["Black/White","Desert Sun","White/Lemonade","Black/Rose Gold"] },
  { id:"sh11", brand:"Hoka", name:"Speedgoat 7", type:"shoes", persona:["trail-rebel","fashion-pacer"], use:"Trail", warmthMin:0, warmthMax:95, colorways:["Black/Black","Harbor Mist/Lunar Rock","Desert Sun/Amber"] },
  { id:"sh12", brand:"Norda", name:"001", type:"shoes", persona:["fashion-pacer","trail-rebel"], use:"Trail / Lifestyle", warmthMin:0, warmthMax:95, colorways:["White/Gum","Black/Black","Cobalt/White","Natural/Gum"] },
  { id:"sh13", brand:"Salomon", name:"XT-6", type:"shoes", persona:["trail-rebel","fashion-pacer"], use:"Trail / Lifestyle", warmthMin:0, warmthMax:95, colorways:["Black/Phantom","Alpen Blossom Pack","Red Ashes Pack","Orchid Pack"] },
  { id:"sh14", brand:"Salomon", name:"S/LAB Ultra 3", type:"shoes", persona:["trail-rebel"], use:"Ultra Trail", warmthMin:0, warmthMax:95, colorways:["Black","White/Black","Peat/Blue"] },
  { id:"sh15", brand:"La Sportiva", name:"Prodigio Pro", type:"shoes", persona:["trail-rebel"], use:"Trail Racing", warmthMin:0, warmthMax:95, colorways:["Black/Yellow","White/Blue","Carbon/Neon"] },
  { id:"sh16", brand:"ASICS", name:"Gel-Nimbus 28", type:"shoes", persona:["mindful","realkeeper"], use:"Max Cushion", warmthMin:0, warmthMax:95, colorways:["Sheet Rock/Indigo Blue","Soothing Sea/Sea Glass","Papaya/Dusty Purple","Grey Floss/Lemon Spark"] },
  { id:"sh17", brand:"ASICS", name:"Novablast 5", type:"shoes", persona:["mindful"], use:"Daily Speed", warmthMin:0, warmthMax:95, colorways:["Black/Glow Yellow","Island Blue/Sun Peach","Pink Rave/Pure Silver"] },
  { id:"sh18", brand:"Hoka x Satisfy", name:"Mafate Speed 4 Lite", type:"shoes", persona:["fashion-pacer"], use:"Trail / Collab", warmthMin:0, warmthMax:95, colorways:["Silver/Clear Technical"] },
];

const TYPE_LABELS = { "shorts":"Shorts","tights":"Tights","top-ss":"Short Sleeve","top-ls":"Long Sleeve","midlayer":"Midlayer","jacket":"Jacket","vest":"Vest","hat":"Hat / Cap","gloves":"Gloves","socks":"Socks","shoes":"Shoes" };
const WARMTH_RANGES = [{label:"Any temp",min:0,max:95},{label:"Cold (under 40°F)",min:0,max:40},{label:"Cool (40–55°F)",min:40,max:55},{label:"Mild (55–65°F)",min:55,max:65},{label:"Warm (65°F+)",min:65,max:95}];
const ACTIVITY_TYPES = [{id:"easy",label:"Easy Run",icon:"◦",desc:"Recovery / conversational pace"},{id:"workout",label:"Workout",icon:"◈",desc:"Tempo, intervals, or fartlek"},{id:"long",label:"Long Run",icon:"◉",desc:"Distance — 60+ minutes"},{id:"race",label:"Race",icon:"◎",desc:"All out effort"}];
const EMPTY_CUSTOM = {brand:"",name:"",type:"shorts",colorway:"",warmthRange:0,notes:""};
const TODAY = new Date().toDateString();

// ─── WEATHER ─────────────────────────────────────────────────────────────────
async function fetchWeather(lat, lon) {
  const res = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,wind_speed_10m,relative_humidity_2m,weather_code&temperature_unit=fahrenheit&wind_speed_unit=mph&timezone=auto`);
  const d = await res.json();
  const c = d.current;
  const code = c.weather_code;
  const condition = code<=1?"Clear":code<=3?"Partly Cloudy":code<=49?"Foggy":code<=67?"Rainy":code<=77?"Snowy":code<=82?"Showers":"Stormy";
  return {temp:Math.round(c.temperature_2m),wind:Math.round(c.wind_speed_10m),humidity:Math.round(c.relative_humidity_2m),condition,auto:true};
}

// ─── ALGORITHM ───────────────────────────────────────────────────────────────
function buildContext(temp, wind, humidity, activity, persona, locker) {
  const adj = (activity==="workout"||activity==="race")?15:activity==="easy"?-5:0;
  const felt = temp + adj;
  const climate = [];
  if (felt<32)      {climate.push("REQUIRED bottom: tights");climate.push("REQUIRED top: long sleeve base");climate.push("REQUIRED: midlayer or jacket");climate.push("REQUIRED: gloves");}
  else if (felt<42) {climate.push("REQUIRED bottom: tights preferred");climate.push("REQUIRED top: long sleeve");climate.push("CONSIDER: midlayer, gloves");}
  else if (felt<52) {climate.push("bottom: tights or shorts");climate.push("top: long sleeve or short sleeve");}
  else if (felt<62) {climate.push("REQUIRED bottom: shorts");climate.push("top: short sleeve");}
  else if (felt<72) {climate.push("REQUIRED bottom: shorts");climate.push("REQUIRED top: short sleeve or singlet");}
  else              {climate.push("REQUIRED bottom: lightest shorts");climate.push("REQUIRED top: singlet or lightest short sleeve");}
  if (wind>18) climate.push("REQUIRED: wind-blocking layer");
  if (humidity>78) climate.push("REQUIRED: moisture-wicking only");
  if (activity==="long") climate.push("CONSIDER: pockets, anti-chafe fabrics");
  const lockerLines = locker.map(item => {
    const ok = item.warmthMin<=temp && item.warmthMax>=temp;
    const worn = item.wornToday===TODAY?" [WORN TODAY — avoid repeating]":"";
    return `${item.brand} ${item.name} (${item.colorway})${item.fabric?` [${item.fabric}]`:""} — ${TYPE_LABELS[item.type]||item.type}${ok?"":"  ⚠ CLIMATE MISMATCH"}${worn}${item.isCustom?" [custom]":""}`;
  });
  return {felt,climate,lockerLines,persona};
}

// ─── COMPONENT ───────────────────────────────────────────────────────────────
export default function Stride() {
  const [view, setView] = useState("home");
  const [locker, setLocker] = useState([]);
  const [weather, setWeather] = useState({temp:52,wind:8,humidity:60,condition:"Partly Cloudy",auto:false});
  const [wxStatus, setWxStatus] = useState("idle"); // idle | loading | ok | error
  const [activity, setActivity] = useState("easy");
  const [persona, setPersona] = useState("realkeeper");
  const [suggestion, setSuggestion] = useState(null);
  const [suggesting, setSuggesting] = useState(false);
  // worn selections on suggestion screen — set of suggested item names
  const [wornSelections, setWornSelections] = useState(new Set());
  const [wornSaved, setWornSaved] = useState(false);
  const [addingItem, setAddingItem] = useState(null);
  const [colorway, setColorway] = useState("");
  const [lockerFilter, setLockerFilter] = useState("all");
  const [ready, setReady] = useState(false);
  const [customForm, setCustomForm] = useState(EMPTY_CUSTOM);
  const [profileOpen, setProfileOpen] = useState(false);
  const [addModal, setAddModal] = useState(false);
  const [addMode, setAddMode] = useState("browse");
  const [dbSearch, setDbSearch] = useState("");
  const [dbType, setDbType] = useState("all");
  const [toast, setToast] = useState("");

  // Persistence
  useEffect(() => {
    (async () => {
      try {
        const l = await window.storage.get("stride-v6-locker");
        if (l?.value) setLocker(JSON.parse(l.value));
        const p = await window.storage.get("stride-persona");
        if (p?.value) setPersona(p.value);
      } catch(e){}
      setReady(true);
    })();
  }, []);

  useEffect(() => {
    if (!ready) return;
    window.storage.set("stride-v6-locker", JSON.stringify(locker)).catch(()=>{});
  }, [locker, ready]);

  // Auto weather on mount — silent attempt, no UI noise
  useEffect(() => {
    if (!navigator.geolocation) return;
    setWxStatus("loading");
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const w = await fetchWeather(pos.coords.latitude, pos.coords.longitude);
          setWeather(w);
          setWxStatus("ok");
        } catch(e) { setWxStatus("error"); }
      },
      () => setWxStatus("error"),
      {timeout:8000}
    );
  }, []);

  // Manual weather fetch button
  const getWeather = () => {
    if (!navigator.geolocation) { showToast("Location not available on this device"); return; }
    setWxStatus("loading");
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const w = await fetchWeather(pos.coords.latitude, pos.coords.longitude);
          setWeather(w);
          setWxStatus("ok");
          showToast("Weather updated ✓");
        } catch(e) { setWxStatus("error"); showToast("Weather fetch failed — set manually"); }
      },
      () => { setWxStatus("error"); showToast("Location denied — set manually"); },
      {timeout:8000}
    );
  };

  const showToast = (msg) => { setToast(msg); setTimeout(()=>setToast(""),2400); };
  const savePersona = (p) => { setPersona(p); window.storage.set("stride-persona",p).catch(()=>{}); };

  const addToLocker = (item, cw) => {
    setLocker(prev => [...prev, {...item, colorway:cw, lockerId:`${item.id}-${cw}-${Date.now()}`}]);
    setAddingItem(null); setColorway(""); setAddModal(false);
    showToast("Added to locker ✓");
  };

  const addCustom = () => {
    if (!customForm.brand||!customForm.name||!customForm.colorway) return;
    const range = WARMTH_RANGES[customForm.warmthRange];
    setLocker(prev => [...prev, {id:`c-${Date.now()}`,lockerId:`c-${Date.now()}-${Math.random()}`,brand:customForm.brand.trim(),name:customForm.name.trim(),type:customForm.type,colorway:customForm.colorway.trim(),notes:customForm.notes.trim(),warmthMin:range.min,warmthMax:range.max,persona:[],isCustom:true}]);
    setCustomForm(EMPTY_CUSTOM); setAddModal(false);
    showToast("Added to locker ✓");
  };

  const removeFromLocker = (id) => setLocker(prev => prev.filter(i=>i.lockerId!==id));

  const toggleWornToday = (lockerId) => {
    setLocker(prev => prev.map(i => i.lockerId===lockerId ? {...i, wornToday:i.wornToday===TODAY?null:TODAY} : i));
  };

  // Match a suggested item name back to locker items
  const findLockerMatches = (suggestedItemName) => {
    if (!suggestedItemName) return [];
    const lower = suggestedItemName.toLowerCase();
    return locker.filter(i => lower.includes(i.name.toLowerCase()) || lower.includes(i.brand.toLowerCase()));
  };

  // Toggle a suggested item in the worn selection set
  const toggleWornSelection = (itemName) => {
    setWornSelections(prev => {
      const next = new Set(prev);
      next.has(itemName) ? next.delete(itemName) : next.add(itemName);
      return next;
    });
    setWornSaved(false);
  };

  const selectAllWorn = () => {
    if (!suggestion?.items) return;
    setWornSelections(new Set(suggestion.items.map(i=>i.item)));
    setWornSaved(false);
  };

  // Commit worn selections to locker
  const saveWornToday = () => {
    if (wornSelections.size===0) return;
    let matched = 0;
    setLocker(prev => prev.map(item => {
      const shouldMark = [...wornSelections].some(name => {
        const lower = name.toLowerCase();
        return lower.includes(item.name.toLowerCase()) || lower.includes(item.brand.toLowerCase());
      });
      if (shouldMark && item.wornToday!==TODAY) { matched++; return {...item, wornToday:TODAY}; }
      return item;
    }));
    setWornSaved(true);
    showToast(matched>0 ? `${matched} item${matched>1?"s":""} marked worn today ✓` : "No matching locker items found");
  };

  const currentPersona = STYLE_PERSONAS.find(p=>p.id===persona);
  const lockerFiltered = lockerFilter==="all" ? locker : locker.filter(i=>i.type===lockerFilter);
  const dbFiltered = GEAR_DB.filter(i => {
    const q = dbSearch.toLowerCase();
    return (dbType==="all"||i.type===dbType) && (q===""||i.name.toLowerCase().includes(q)||i.brand.toLowerCase().includes(q)||(i.fabric||"").toLowerCase().includes(q));
  });

  const getSuggestion = async () => {
    setSuggesting(true); setSuggestion(null); setWornSelections(new Set()); setWornSaved(false); setView("suggest");
    const ctx = buildContext(weather.temp, weather.wind, weather.humidity, activity, currentPersona, locker);
    const actInfo = ACTIVITY_TYPES.find(a=>a.id===activity);
    const prompt = `Running fashion editor. Suggest a complete outfit using strict priority: 1) Climate 2) Color harmony 3) Style persona.

FELT TEMP: ${ctx.felt}F (actual ${weather.temp}F) | Wind: ${weather.wind}mph | Humidity: ${weather.humidity}% | ${weather.condition}
ACTIVITY: ${actInfo.label} — ${actInfo.desc}

CLIMATE RULES (satisfy first):
${ctx.climate.map(r=>`- ${r}`).join("\n")}

COLOR: Neutrals (black/white/grey/navy/ecru/olive) pair with anything. Earth tones (rust/sage/moss/tan) cohesive. Balance bold with neutral. Honor locker color constraints before style.

STYLE PERSONA: ${currentPersona.label} (${currentPersona.tag}) — preferred brands: ${currentPersona.brands.slice(0,2).join(", ")}. Apply only after climate and color are resolved.

LOCKER:
${ctx.lockerLines.length>0 ? ctx.lockerLines.join("\n") : "Empty — suggest from persona brands"}

RULES: Prioritize locker items. Skip CLIMATE MISMATCH or WORN TODAY items. Always include shoes. Fill gaps from persona brands.

JSON only:
{"headline":"4-7 word editorial outfit name","items":[{"category":"Bottom","item":"brand+name","colorway":"colorway","why":"one sentence"},{"category":"Top","item":"brand+name","colorway":"colorway","why":"one sentence"},{"category":"Shoes","item":"brand+model","colorway":"colorway","why":"one sentence"}],"stylistNote":"2-3 sentences: color story, climate logic, what makes it intentional.","weatherSummary":"One sharp line on what to expect physically."}`;
    try {
      const res = await fetch("https://api.anthropic.com/v1/messages",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({model:"claude-sonnet-4-20250514",max_tokens:800,messages:[{role:"user",content:prompt}]})});
      const d = await res.json();
      const txt = d.content?.find(b=>b.type==="text")?.text||"";
      setSuggestion(JSON.parse(txt.replace(/```json|```/g,"").trim()));
    } catch(e) { setSuggestion({error:true}); }
    setSuggesting(false);
  };

  // ── Styles ──
  const css = `
    @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;0,900;1,400;1,700&family=DM+Sans:wght@300;400;500&display=swap');
    *{box-sizing:border-box;margin:0;padding:0;}
    .pf{font-family:'Playfair Display',Georgia,serif;}
    .dm{font-family:'DM Sans',sans-serif;}
    .nb{background:none;border:none;cursor:pointer;}
    .nav-btn{background:none;border:none;cursor:pointer;padding:8px 16px;font-family:'DM Sans',sans-serif;font-size:11px;letter-spacing:.12em;text-transform:uppercase;color:#888;transition:color .2s;}
    .nav-btn:hover,.nav-btn.active{color:#1A1A1A;}
    .nav-btn.active{border-bottom:1.5px solid #1A1A1A;}
    .pill{display:inline-block;padding:4px 12px;border-radius:100px;font-size:11px;cursor:pointer;transition:all .15s;font-family:'DM Sans',sans-serif;border:1px solid #ccc;background:transparent;color:#666;}
    .pill:hover,.pill.on{border-color:#1A1A1A;background:#1A1A1A;color:#F5F2ED;}
    .card{background:white;border:1px solid #E8E4DF;padding:14px;cursor:pointer;transition:all .2s;}
    .card:hover{border-color:#1A1A1A;transform:translateY(-1px);box-shadow:0 4px 12px rgba(0,0,0,.08);}
    .li{background:white;border:1px solid #E8E4DF;padding:11px 13px;display:flex;align-items:center;justify-content:space-between;gap:10px;}
    .li.custom{border-left:3px solid #C8A96E;}
    .li.worn{opacity:.5;}
    .btn{background:#1A1A1A;color:#F5F2ED;border:none;padding:12px 22px;font-family:'DM Sans',sans-serif;font-size:11px;letter-spacing:.14em;text-transform:uppercase;cursor:pointer;transition:background .2s;width:100%;}
    .btn:hover{background:#333;}
    .btn:disabled{background:#bbb;cursor:not-allowed;}
    .btn2{background:transparent;color:#1A1A1A;border:1.5px solid #1A1A1A;padding:10px 22px;font-family:'DM Sans',sans-serif;font-size:11px;letter-spacing:.14em;text-transform:uppercase;cursor:pointer;transition:all .2s;width:100%;}
    .btn2:hover{background:#1A1A1A;color:#F5F2ED;}
    .btn-sm{background:none;border:1px solid #ddd;padding:5px 12px;font-family:'DM Sans',sans-serif;font-size:10px;letter-spacing:.1em;text-transform:uppercase;cursor:pointer;color:#666;transition:all .15s;}
    .btn-sm:hover{border-color:#1A1A1A;color:#1A1A1A;}
    .btn-sm.active{border-color:#1A1A1A;background:#1A1A1A;color:#F5F2ED;}
    .inp{border:1px solid #ddd;background:white;padding:9px 12px;font-family:'DM Sans',sans-serif;font-size:13px;color:#1A1A1A;outline:none;width:100%;transition:border-color .2s;}
    .inp:focus{border-color:#1A1A1A;}
    select.inp{cursor:pointer;}
    .overlay{position:fixed;inset:0;background:rgba(0,0,0,.55);z-index:100;display:flex;align-items:flex-end;justify-content:center;}
    .modal{background:#F5F2ED;width:100%;max-width:600px;max-height:88vh;overflow-y:auto;padding:26px 20px;}
    .side-overlay{position:fixed;inset:0;background:rgba(0,0,0,.5);z-index:100;display:flex;align-items:flex-start;justify-content:flex-end;}
    .side{background:#F5F2ED;width:320px;height:100vh;overflow-y:auto;padding:26px 20px;}
    .slider{width:100%;appearance:none;height:2px;background:rgba(255,255,255,.3);outline:none;}
    .slider::-webkit-slider-thumb{appearance:none;width:16px;height:16px;border-radius:50%;background:#F5F2ED;cursor:pointer;}
    .act-btn{border:1.5px solid #E8E4DF;padding:11px;cursor:pointer;transition:all .2s;background:white;text-align:left;width:100%;}
    .act-btn:hover,.act-btn.on{border-color:#1A1A1A;background:#1A1A1A;color:#F5F2ED;}
    .pc{border:1.5px solid #E8E4DF;padding:11px 13px;cursor:pointer;transition:all .2s;background:white;text-align:left;width:100%;margin-bottom:5px;}
    .pc:hover{border-color:#888;}
    .pc.on{border-color:#1A1A1A;background:#1A1A1A;color:#F5F2ED;}
    .si{border:1.5px solid #E8E4DF;padding:11px 13px;margin-bottom:7px;background:white;cursor:pointer;transition:all .15s;}
    .si:hover{border-color:#888;}
    .si.selected{border-color:#C8A96E;background:#FBF7F0;}
    .cw-btn{border:1.5px solid #ddd;background:white;padding:7px 12px;cursor:pointer;font-family:'DM Sans',sans-serif;font-size:12px;transition:all .15s;}
    .cw-btn:hover,.cw-btn.on{border-color:#1A1A1A;background:#1A1A1A;color:white;}
    .rt{height:3px;background:#1A1A1A;margin-bottom:4px;}
    .rn{height:1px;background:#E8E4DF;}
    .fade{animation:fi .35s ease forwards;}
    @keyframes fi{from{opacity:0;transform:translateY(6px);}to{opacity:1;transform:translateY(0);}}
    .pulse{animation:pu 1.4s ease-in-out infinite;}
    @keyframes pu{0%,100%{opacity:1;}50%{opacity:.3;}}
    .ptag{display:inline-block;font-family:'DM Sans',sans-serif;font-size:9px;letter-spacing:.14em;text-transform:uppercase;padding:2px 7px;border:1px solid currentColor;border-radius:100px;opacity:.6;margin-bottom:4px;}
    .plus{background:#1A1A1A;color:#F5F2ED;border:none;width:32px;height:32px;border-radius:50%;font-size:19px;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:background .2s;flex-shrink:0;}
    .plus:hover{background:#444;}
    .stab{background:none;border:none;cursor:pointer;padding:6px 0;font-family:'DM Sans',sans-serif;font-size:11px;letter-spacing:.1em;text-transform:uppercase;color:#888;margin-right:18px;}
    .stab.on{color:#1A1A1A;border-bottom:1.5px solid #1A1A1A;}
    .cbadge{font-family:'DM Sans',sans-serif;font-size:9px;letter-spacing:.1em;text-transform:uppercase;background:#C8A96E22;color:#8B6914;border:1px solid #C8A96E55;padding:1px 5px;border-radius:3px;margin-left:5px;}
    .wx-btn{background:none;border:1px solid rgba(255,255,255,.2);padding:3px 10px;font-family:'DM Sans',sans-serif;font-size:10px;letter-spacing:.1em;text-transform:uppercase;cursor:pointer;color:#aaa;border-radius:100px;transition:all .2s;}
    .wx-btn:hover{border-color:rgba(255,255,255,.5);color:#ddd;}
    .pb{display:inline-block;font-family:'DM Sans',sans-serif;font-size:9px;letter-spacing:.1em;text-transform:uppercase;padding:2px 6px;border-radius:3px;}
    .pb1{background:#1A1A1A22;color:#1A1A1A;}
    .pb2{background:#C8A96E22;color:#8B6914;}
    .pb3{background:#88888818;color:#666;}
    .check{width:16px;height:16px;border-radius:3px;border:1.5px solid #C8A96E;display:flex;align-items:center;justify-content:center;flex-shrink:0;font-size:10px;transition:all .15s;}
    .check.on{background:#C8A96E;border-color:#C8A96E;color:white;}
  `;

  return (
    <div style={{minHeight:"100vh",background:"#F5F2ED",fontFamily:"Georgia,serif",color:"#1A1A1A"}}>
      <style>{css}</style>

      {/* HEADER */}
      <header style={{borderBottom:"1px solid #E8E4DF",background:"#F5F2ED",position:"sticky",top:0,zIndex:50}}>
        <div style={{maxWidth:620,margin:"0 auto",padding:"0 18px"}}>
          <div style={{paddingTop:15,paddingBottom:5}}>
            <div className="rt"/>
            <div style={{display:"flex",alignItems:"baseline",justifyContent:"space-between",paddingTop:5}}>
              <div>
                <h1 className="pf" style={{fontSize:27,fontWeight:900,letterSpacing:"-0.02em",lineHeight:1}}>STRIDE</h1>
                <p className="dm" style={{fontSize:9,letterSpacing:"0.22em",color:"#999",textTransform:"uppercase",marginTop:1}}>Running Wardrobe</p>
              </div>
              <div style={{display:"flex",alignItems:"center",gap:12}}>
                <span className="dm" style={{fontSize:11,color:"#999"}}>{locker.length} items</span>
                <button className="nb" onClick={()=>setProfileOpen(true)} style={{border:"1px solid #ddd",borderRadius:"50%",width:27,height:27,display:"flex",alignItems:"center",justifyContent:"center",fontSize:13}}>⚙</button>
              </div>
            </div>
            <div className="rn" style={{marginTop:8}}/>
          </div>
          <nav style={{display:"flex"}}>
            {[["home","Today"],["locker","My Locker"],["gear","Browse"]].map(([id,label])=>(
              <button key={id} className={`nav-btn ${view===id||(view==="suggest"&&id==="home")?"active":""}`} onClick={()=>setView(id)}>{label}</button>
            ))}
          </nav>
        </div>
      </header>

      <main style={{maxWidth:620,margin:"0 auto",padding:"18px 18px 80px"}}>

        {/* ── HOME / SUGGEST ── */}
        {(view==="home"||view==="suggest") && (
          <div>
            {/* Weather */}
            <div style={{background:"#1A1A1A",color:"#F5F2ED",padding:"20px",marginBottom:13}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:14}}>
                <div>
                  <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:3}}>
                    <p className="dm" style={{fontSize:10,letterSpacing:"0.16em",textTransform:"uppercase",color:"#777"}}>Conditions</p>
                    {wxStatus==="ok" && <span style={{fontFamily:"'DM Sans',sans-serif",fontSize:9,letterSpacing:"0.1em",textTransform:"uppercase",background:"rgba(255,255,255,.1)",padding:"1px 7px",borderRadius:"100px",color:"#888"}}>Auto</span>}
                  </div>
                  <p className="pf" style={{fontSize:36,fontWeight:700,lineHeight:1}}>{weather.temp}°</p>
                  <p className="dm" style={{fontSize:12,color:"#999",marginTop:3}}>{weather.condition}</p>
                </div>
                <div style={{textAlign:"right"}}>
                  <div className="dm" style={{fontSize:12,color:"#999",marginBottom:8}}>
                    <div style={{marginBottom:4}}>💨 {weather.wind} mph</div>
                    <div>💧 {weather.humidity}%</div>
                  </div>
                  <button className="wx-btn" onClick={getWeather} disabled={wxStatus==="loading"}>
                    {wxStatus==="loading" ? "…" : wxStatus==="ok" ? "Refresh" : "Get Weather"}
                  </button>
                </div>
              </div>
              {[{label:"Temp",key:"temp",min:0,max:100,unit:"°F"},{label:"Wind",key:"wind",min:0,max:40,unit:" mph"},{label:"Humidity",key:"humidity",min:0,max:100,unit:"%"}].map(({label,key,min,max,unit})=>(
                <div key={key} style={{marginBottom:9}}>
                  <div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}>
                    <span className="dm" style={{fontSize:10,letterSpacing:"0.12em",textTransform:"uppercase",color:"#777"}}>{label}</span>
                    <span className="dm" style={{fontSize:11,color:"#ddd"}}>{weather[key]}{unit}</span>
                  </div>
                  <input type="range" className="slider" min={min} max={max} value={weather[key]} onChange={e=>setWeather(prev=>({...prev,[key]:Number(e.target.value),auto:false}))}/>
                </div>
              ))}
            </div>

            {/* Activity */}
            <div style={{marginBottom:13}}>
              <p className="dm" style={{fontSize:10,letterSpacing:"0.16em",textTransform:"uppercase",color:"#888",marginBottom:8}}>Activity</p>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:6}}>
                {ACTIVITY_TYPES.map(a=>(
                  <button key={a.id} className={`act-btn ${activity===a.id?"on":""}`} onClick={()=>setActivity(a.id)}>
                    <div style={{display:"flex",alignItems:"center",gap:7}}>
                      <span style={{fontSize:14,flexShrink:0}}>{a.icon}</span>
                      <div><div className="dm" style={{fontSize:12,fontWeight:500}}>{a.label}</div><div className="dm" style={{fontSize:10,opacity:.6,marginTop:1}}>{a.desc}</div></div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Persona compact */}
            <div style={{marginBottom:16,background:"white",border:"1px solid #E8E4DF",padding:"11px 13px",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
              <div>
                <p className="dm" style={{fontSize:10,letterSpacing:"0.14em",textTransform:"uppercase",color:"#888",marginBottom:2}}>Style Persona</p>
                <p className="dm" style={{fontSize:13,fontWeight:500}}>{currentPersona.label}</p>
                <p className="dm" style={{fontSize:11,color:"#888"}}>{currentPersona.tag}</p>
              </div>
              <button onClick={()=>setProfileOpen(true)} className="btn-sm">Change</button>
            </div>

            <button className="btn" onClick={getSuggestion} disabled={suggesting}>
              {suggesting ? "Styling your run…" : "Get Outfit Suggestion"}
            </button>

            {/* Suggestion output */}
            {view==="suggest" && (
              <div style={{marginTop:24}}>
                <div className="rn" style={{marginBottom:20}}/>
                {suggesting && <div style={{textAlign:"center",padding:"42px 0"}}><p className="pf pulse" style={{fontSize:18,fontStyle:"italic",color:"#888"}}>Styling your run…</p></div>}

                {suggestion&&!suggestion.error&&(
                  <div className="fade">
                    <p className="dm" style={{fontSize:10,letterSpacing:"0.16em",textTransform:"uppercase",color:"#888",marginBottom:5}}>Today's Look</p>
                    <h2 className="pf" style={{fontSize:23,fontWeight:700,fontStyle:"italic",marginBottom:4,lineHeight:1.2}}>{suggestion.headline}</h2>
                    <p className="dm" style={{fontSize:12,color:"#888",marginBottom:16,fontStyle:"italic"}}>{suggestion.weatherSummary}</p>

                    {/* Suggested items — tappable to mark worn */}
                    <div style={{marginBottom:6}}>
                      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
                        <p className="dm" style={{fontSize:10,letterSpacing:"0.12em",textTransform:"uppercase",color:"#888"}}>Tap items you wore today</p>
                        <button className="btn-sm" onClick={selectAllWorn}>Select All</button>
                      </div>
                      {suggestion.items?.map((item,i)=>{
                        const selected = wornSelections.has(item.item);
                        return (
                          <div key={i} className={`si ${selected?"selected":""}`} onClick={()=>toggleWornSelection(item.item)}>
                            <div style={{display:"flex",alignItems:"flex-start",gap:10}}>
                              <div className={`check ${selected?"on":""}`}>{selected?"✓":""}</div>
                              <div style={{flex:1}}>
                                <p className="dm" style={{fontSize:10,letterSpacing:"0.12em",textTransform:"uppercase",color:"#888",marginBottom:2}}>{item.category}</p>
                                <p className="dm" style={{fontSize:13,fontWeight:500}}>{item.item}</p>
                                <p className="dm" style={{fontSize:12,color:"#888"}}>{item.colorway}</p>
                                <p className="dm" style={{fontSize:11,color:"#aaa",marginTop:3,fontStyle:"italic"}}>{item.why}</p>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Mark worn button */}
                    {wornSelections.size>0 && !wornSaved && (
                      <button className="btn2" style={{marginBottom:12}} onClick={saveWornToday}>
                        Mark {wornSelections.size} Item{wornSelections.size>1?"s":""} as Worn Today
                      </button>
                    )}
                    {wornSaved && (
                      <div style={{background:"#F0EDE8",padding:"9px 13px",marginBottom:12,display:"flex",alignItems:"center",gap:8}}>
                        <span style={{color:"#C8A96E",fontSize:13}}>●</span>
                        <p className="dm" style={{fontSize:12,color:"#888"}}>Worn items saved — next suggestion will avoid repeating them.</p>
                      </div>
                    )}

                    {/* Stylist note */}
                    <div style={{background:"#1A1A1A",color:"#F5F2ED",padding:"17px 19px",marginBottom:13}}>
                      <p className="dm" style={{fontSize:10,letterSpacing:"0.16em",textTransform:"uppercase",color:"#777",marginBottom:6}}>Stylist's Note</p>
                      <p className="pf" style={{fontSize:14,fontStyle:"italic",lineHeight:1.65}}>{suggestion.stylistNote}</p>
                    </div>

                    <button className="btn2" onClick={getSuggestion}>Suggest Again</button>
                  </div>
                )}
                {suggestion?.error&&<p className="dm" style={{color:"#E03E3E",fontSize:13,marginTop:10}}>Something went wrong. Try again.</p>}
              </div>
            )}
          </div>
        )}

        {/* ── LOCKER ── */}
        {view==="locker" && (
          <div>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
              <div><div className="rt" style={{width:34,marginBottom:5}}/><h2 className="pf" style={{fontSize:20,fontWeight:700}}>My Locker</h2></div>
              <button className="plus" onClick={()=>{setAddModal(true);setAddMode("browse");}} title="Add gear">+</button>
            </div>

            {locker.length===0 ? (
              <div style={{textAlign:"center",padding:"52px 20px"}}>
                <p className="pf" style={{fontSize:18,fontStyle:"italic",color:"#888",marginBottom:9}}>Your locker is empty.</p>
                <p className="dm" style={{fontSize:13,color:"#aaa"}}>Tap + to add your gear.</p>
              </div>
            ) : (
              <div>
                {locker.some(i=>i.wornToday===TODAY) && (
                  <div style={{background:"white",border:"1px solid #E8E4DF",padding:"9px 13px",marginBottom:10,display:"flex",alignItems:"center",gap:8}}>
                    <span style={{color:"#C8A96E",fontSize:12}}>●</span>
                    <p className="dm" style={{fontSize:12,color:"#888"}}><strong style={{color:"#1A1A1A"}}>{locker.filter(i=>i.wornToday===TODAY).length}</strong> item{locker.filter(i=>i.wornToday===TODAY).length>1?"s":""} marked worn today</p>
                  </div>
                )}
                <div style={{display:"flex",gap:5,flexWrap:"wrap",marginBottom:12}}>
                  <button className={`pill ${lockerFilter==="all"?"on":""}`} onClick={()=>setLockerFilter("all")}>All</button>
                  {[...new Set(locker.map(i=>i.type))].map(t=>(<button key={t} className={`pill ${lockerFilter===t?"on":""}`} onClick={()=>setLockerFilter(t)}>{TYPE_LABELS[t]||t}</button>))}
                </div>
                <div style={{display:"flex",flexDirection:"column",gap:6}}>
                  {lockerFiltered.map(item=>(
                    <div key={item.lockerId} className={`li ${item.isCustom?"custom":""} ${item.wornToday===TODAY?"worn":""}`}>
                      <div style={{flex:1,minWidth:0}}>
                        <p className="dm" style={{fontSize:10,letterSpacing:"0.1em",textTransform:"uppercase",color:"#888",marginBottom:1}}>
                          {item.brand}{item.fabric?` · ${item.fabric}`:""} · {TYPE_LABELS[item.type]||item.type}
                          {item.isCustom&&<span className="cbadge">Custom</span>}
                        </p>
                        <p className="dm" style={{fontSize:13,fontWeight:500,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{item.name}</p>
                        <p className="dm" style={{fontSize:12,color:"#aaa"}}>{item.colorway}</p>
                        {item.notes&&<p className="dm" style={{fontSize:11,color:"#bbb",marginTop:1,fontStyle:"italic"}}>{item.notes}</p>}
                      </div>
                      <div style={{display:"flex",alignItems:"center",gap:7,flexShrink:0}}>
                        <button className="nb dm" onClick={()=>toggleWornToday(item.lockerId)} title={item.wornToday===TODAY?"Unmark worn today":"Mark worn today"} style={{fontSize:13,color:"#C8A96E",opacity:item.wornToday===TODAY?1:0.25}}>●</button>
                        <button className="nb" onClick={()=>removeFromLocker(item.lockerId)} style={{color:"#ccc",fontSize:18,lineHeight:1}}>×</button>
                      </div>
                    </div>
                  ))}
                </div>
                <p className="dm" style={{fontSize:11,color:"#bbb",marginTop:10,textAlign:"center"}}>Tap ● to mark worn today</p>
              </div>
            )}
          </div>
        )}

        {/* ── BROWSE ── */}
        {view==="gear" && (
          <div>
            <div className="rt" style={{width:34,marginBottom:5}}/>
            <h2 className="pf" style={{fontSize:20,fontWeight:700,marginBottom:12}}>Gear Database</h2>
            <input className="inp" placeholder="Search brands, items, fabrics…" value={dbSearch} onChange={e=>setDbSearch(e.target.value)} style={{marginBottom:8}}/>
            <div style={{display:"flex",gap:5,flexWrap:"wrap",marginBottom:12}}>
              <button className={`pill ${dbType==="all"?"on":""}`} onClick={()=>setDbType("all")}>All</button>
              {Object.entries(TYPE_LABELS).map(([k,v])=>(<button key={k} className={`pill ${dbType===k?"on":""}`} onClick={()=>setDbType(k)}>{v}</button>))}
            </div>
            <p className="dm" style={{fontSize:11,color:"#aaa",marginBottom:9}}>{dbFiltered.length} items</p>
            <div style={{display:"flex",flexDirection:"column",gap:6}}>
              {dbFiltered.map(item=>{
                const inLocker = locker.some(l=>l.id===item.id);
                return (
                  <div key={item.id} className="card" onClick={()=>{setAddingItem(item);setColorway("");}}>
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
                      <div style={{flex:1}}>
                        <p className="dm" style={{fontSize:10,letterSpacing:"0.1em",textTransform:"uppercase",color:"#888",marginBottom:1}}>{item.brand} · {TYPE_LABELS[item.type]}{item.fabric?` · ${item.fabric}`:""}</p>
                        <p className="dm" style={{fontSize:13,fontWeight:500}}>{item.name}</p>
                        {item.use&&<p className="dm" style={{fontSize:11,color:"#999",marginTop:1}}>{item.use}</p>}
                        <p className="dm" style={{fontSize:11,color:"#bbb",marginTop:2}}>{item.colorways.join(" · ")}</p>
                      </div>
                      <span style={{fontSize:16,color:inLocker?"#4CAF50":"#ccc",marginLeft:10,flexShrink:0}}>{inLocker?"✓":"+"}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </main>

      {/* ADD MODAL */}
      {addModal && (
        <div className="overlay" onClick={()=>setAddModal(false)}>
          <div className="modal" onClick={e=>e.stopPropagation()}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:13}}>
              <h3 className="pf" style={{fontSize:18,fontWeight:700}}>Add to Locker</h3>
              <button className="nb" onClick={()=>setAddModal(false)} style={{fontSize:20,color:"#888"}}>×</button>
            </div>
            <div style={{display:"flex",borderBottom:"1px solid #E8E4DF",marginBottom:16}}>
              <button className={`stab ${addMode==="browse"?"on":""}`} onClick={()=>setAddMode("browse")}>Browse</button>
              <button className={`stab ${addMode==="manual"?"on":""}`} onClick={()=>setAddMode("manual")}>Add Custom</button>
            </div>
            {addMode==="browse"&&(
              <div>
                <input className="inp" placeholder="Search…" value={dbSearch} onChange={e=>setDbSearch(e.target.value)} style={{marginBottom:8}}/>
                <div style={{display:"flex",gap:5,flexWrap:"wrap",marginBottom:11}}>
                  <button className={`pill ${dbType==="all"?"on":""}`} onClick={()=>setDbType("all")}>All</button>
                  {Object.entries(TYPE_LABELS).map(([k,v])=>(<button key={k} className={`pill ${dbType===k?"on":""}`} onClick={()=>setDbType(k)}>{v}</button>))}
                </div>
                <div style={{display:"flex",flexDirection:"column",gap:6,maxHeight:"46vh",overflowY:"auto"}}>
                  {dbFiltered.map(item=>{
                    const inLocker=locker.some(l=>l.id===item.id);
                    return (
                      <div key={item.id} className="card" onClick={()=>{setAddingItem(item);setColorway("");setAddModal(false);}}>
                        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
                          <div style={{flex:1}}>
                            <p className="dm" style={{fontSize:10,letterSpacing:"0.1em",textTransform:"uppercase",color:"#888",marginBottom:1}}>{item.brand} · {TYPE_LABELS[item.type]}</p>
                            <p className="dm" style={{fontSize:13,fontWeight:500}}>{item.name}</p>
                            <p className="dm" style={{fontSize:11,color:"#bbb",marginTop:2}}>{item.colorways.join(" · ")}</p>
                          </div>
                          <span style={{fontSize:15,color:inLocker?"#4CAF50":"#ccc",marginLeft:9,flexShrink:0}}>{inLocker?"✓":"+"}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
            {addMode==="manual"&&(
              <div style={{display:"flex",flexDirection:"column",gap:10}}>
                {[["Brand *","brand","e.g. Tracksmith, Nike, Vintage…"],["Item Name *","name","e.g. Session Short, Wind Jacket…"],["Colorway *","colorway","e.g. Black, Heather Grey/Navy…"],["Notes (optional)","notes","e.g. lined, race day only…"]].map(([label,key,ph])=>(
                  <div key={key}>
                    <p className="dm" style={{fontSize:10,letterSpacing:"0.14em",textTransform:"uppercase",color:"#888",marginBottom:4}}>{label}</p>
                    <input className="inp" placeholder={ph} value={customForm[key]} onChange={e=>setCustomForm(f=>({...f,[key]:e.target.value}))}/>
                  </div>
                ))}
                <div>
                  <p className="dm" style={{fontSize:10,letterSpacing:"0.14em",textTransform:"uppercase",color:"#888",marginBottom:4}}>Type *</p>
                  <select className="inp" value={customForm.type} onChange={e=>setCustomForm(f=>({...f,type:e.target.value}))}>
                    {Object.entries(TYPE_LABELS).map(([k,v])=><option key={k} value={k}>{v}</option>)}
                  </select>
                </div>
                <div>
                  <p className="dm" style={{fontSize:10,letterSpacing:"0.14em",textTransform:"uppercase",color:"#888",marginBottom:4}}>Best Worn In</p>
                  <select className="inp" value={customForm.warmthRange} onChange={e=>setCustomForm(f=>({...f,warmthRange:Number(e.target.value)}))}>
                    {WARMTH_RANGES.map((r,i)=><option key={i} value={i}>{r.label}</option>)}
                  </select>
                </div>
                <button className="btn" style={{marginTop:3}} disabled={!customForm.brand||!customForm.name||!customForm.colorway} onClick={addCustom}>Add to Locker</button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* COLORWAY PICKER */}
      {addingItem && (
        <div className="overlay" onClick={()=>setAddingItem(null)}>
          <div className="modal" onClick={e=>e.stopPropagation()}>
            <p className="dm" style={{fontSize:10,letterSpacing:"0.16em",textTransform:"uppercase",color:"#888",marginBottom:3}}>{addingItem.brand}{addingItem.fabric?` · ${addingItem.fabric}`:""}</p>
            <h3 className="pf" style={{fontSize:19,fontWeight:700,marginBottom:5}}>{addingItem.name}</h3>
            {addingItem.use&&<p className="dm" style={{fontSize:12,color:"#888",marginBottom:11}}>{addingItem.use}</p>}
            <div className="rn" style={{marginBottom:13}}/>
            <p className="dm" style={{fontSize:10,letterSpacing:"0.14em",textTransform:"uppercase",color:"#888",marginBottom:8}}>Select Colorway</p>
            <div style={{display:"flex",flexWrap:"wrap",gap:6,marginBottom:20}}>
              {addingItem.colorways.map(c=>(<button key={c} className={`cw-btn ${colorway===c?"on":""}`} onClick={()=>setColorway(c)}>{c}</button>))}
            </div>
            <div style={{display:"flex",gap:8}}>
              <button className="btn2" style={{flex:1}} onClick={()=>setAddingItem(null)}>Cancel</button>
              <button className="btn" style={{flex:1}} disabled={!colorway} onClick={()=>addToLocker(addingItem,colorway)}>Add to Locker</button>
            </div>
          </div>
        </div>
      )}

      {/* PROFILE PANEL */}
      {profileOpen && (
        <div className="side-overlay" onClick={()=>setProfileOpen(false)}>
          <div className="side" onClick={e=>e.stopPropagation()}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20}}>
              <div><div className="rt" style={{width:26,marginBottom:4}}/><h2 className="pf" style={{fontSize:18,fontWeight:700}}>Profile</h2></div>
              <button className="nb" onClick={()=>setProfileOpen(false)} style={{fontSize:20,color:"#888",lineHeight:1}}>×</button>
            </div>
            <div style={{background:"#F0EDE8",padding:"10px 12px",marginBottom:16}}>
              <p className="dm" style={{fontSize:10,letterSpacing:"0.12em",textTransform:"uppercase",color:"#888",marginBottom:6}}>Suggestion Priority</p>
              {[["1","Climate","Temp, wind, humidity, effort","pb1"],["2","Color Harmony","Cohesive colorways from locker","pb2"],["3","Style Persona","Brand and aesthetic preference","pb3"]].map(([n,t,d,c])=>(
                <div key={n} style={{display:"flex",alignItems:"flex-start",gap:8,marginBottom:6}}>
                  <span className={`pb ${c}`}>{n}</span>
                  <div><p className="dm" style={{fontSize:12,fontWeight:500}}>{t}</p><p className="dm" style={{fontSize:11,color:"#888"}}>{d}</p></div>
                </div>
              ))}
            </div>
            <p className="dm" style={{fontSize:10,letterSpacing:"0.16em",textTransform:"uppercase",color:"#888",marginBottom:10}}>Style Persona</p>
            {STYLE_PERSONAS.map(p=>(
              <button key={p.id} className={`pc ${persona===p.id?"on":""}`} onClick={()=>savePersona(p.id)}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
                  <div><span className="ptag">{p.tag}</span><div className="dm" style={{fontSize:12,fontWeight:500}}>{p.label}</div><div className="dm" style={{fontSize:11,opacity:.6,marginTop:1}}>{p.description}</div></div>
                  {persona===p.id&&<span style={{fontSize:14,flexShrink:0,marginLeft:8}}>✓</span>}
                </div>
              </button>
            ))}
            <div className="rn" style={{margin:"18px 0 12px"}}/>
            <p className="dm" style={{fontSize:10,letterSpacing:"0.14em",textTransform:"uppercase",color:"#aaa",marginBottom:6}}>Coming Soon</p>
            {["Photo capture for exact shade/tone matching","Colorblindness type","Run-hot / run-cold tendency","Home location for auto-weather","Training app integration"].map(i=>(
              <p key={i} className="dm" style={{fontSize:12,color:"#bbb",marginBottom:4,paddingLeft:3}}>· {i}</p>
            ))}
          </div>
        </div>
      )}

      {/* TOAST */}
      {toast && (
        <div style={{position:"fixed",bottom:20,left:"50%",transform:"translateX(-50%)",background:"#1A1A1A",color:"#F5F2ED",padding:"8px 20px",fontFamily:"'DM Sans',sans-serif",fontSize:12,letterSpacing:"0.08em",zIndex:200,animation:"fi .3s ease",whiteSpace:"nowrap"}}>
          {toast}
        </div>
      )}
    </div>
  );
}
