import { useState, useEffect } from "react";

const STYLE_PERSONAS = [
  { id: "realkeeper", label: "Real Keeper", tag: "Heritage · Collegiate", description: "Tracksmith, New Balance — timeless aesthetics, discipline, the amateur spirit of the sport", brands: ["Tracksmith", "New Balance", "Brooks", "Saucony"] },
  { id: "fashion-pacer", label: "Fashion Pacer", tag: "Streetwear · Gorpcore", description: "Satisfy, Bandit, Norda — technical details as fashion statements, blurring sport and street", brands: ["Satisfy", "Bandit", "Norda", "Hoka"] },
  { id: "precision", label: "Precision Performer", tag: "Technical · Minimalist", description: "On Running, Soar, Janji — industrial sophistication, performance-first with a clean edge", brands: ["On Running", "Soar", "Janji", "Adidas"] },
  { id: "mindful", label: "Mindful Jogger", tag: "Expressive · Vibrant", description: "District Vision, NNormal, Rabbit — joyful palette, mindful movement, vibrant self-expression", brands: ["District Vision", "NNormal", "Rabbit", "Ciele"] },
  { id: "trail-rebel", label: "Trail Rebel", tag: "Rugged · Mountain-to-City", description: "Salomon, La Sportiva, Patagonia — gorpcore authority, built for the mountain and the street", brands: ["Salomon", "La Sportiva", "The North Face", "Patagonia"] },
];

const GEAR_DATABASE = [
  { id: "s1", brand: "Satisfy", name: "Justice Distance Shorts", type: "shorts", fabric: "Justice™", persona: ["fashion-pacer", "precision"], lined: false, warmthMin: 55, warmthMax: 95, colorways: ["Black", "Aged White", "Olive Drab"] },
  { id: "s2", brand: "Satisfy", name: "MothTech Muscle Shorts", type: "shorts", fabric: "MothTech™", persona: ["fashion-pacer"], lined: false, warmthMin: 58, warmthMax: 95, colorways: ["Black", "Off White", "Moss"] },
  { id: "s3", brand: "Satisfy", name: "AuraLite Trail Shorts", type: "shorts", fabric: "AuraLite™", persona: ["fashion-pacer", "precision"], lined: false, warmthMin: 55, warmthMax: 95, colorways: ["Black", "Ecru", "Burgundy"] },
  { id: "s4", brand: "Tracksmith", name: "Session Short", type: "shorts", fabric: "Veloce Blend", persona: ["realkeeper"], lined: true, warmthMin: 52, warmthMax: 95, colorways: ["Heather Grey", "Black", "Navy", "Ivory"] },
  { id: "s5", brand: "Tracksmith", name: "Van Cortlandt Short", type: "shorts", fabric: "2:09 Mesh", persona: ["realkeeper"], lined: false, warmthMin: 55, warmthMax: 95, colorways: ["Heather Grey/Navy", "Black/Gold", "Ivory/Wine"] },
  { id: "s6", brand: "Tracksmith", name: "Twilight Short", type: "shorts", fabric: "Bravio Blend", persona: ["realkeeper"], lined: false, warmthMin: 58, warmthMax: 95, colorways: ["Heather Navy", "Black", "Moss Gray"] },
  { id: "s7", brand: "On Running", name: "Lightweight Shorts 5in", type: "shorts", fabric: "Swift-Weave", persona: ["precision"], lined: true, warmthMin: 55, warmthMax: 95, colorways: ["Black", "Navy", "Glacier", "Undyed"] },
  { id: "s8", brand: "District Vision", name: "Sphaera 4in Short", type: "shorts", fabric: "Technical Mesh", persona: ["mindful"], lined: true, warmthMin: 55, warmthMax: 95, colorways: ["Black", "Sage", "Dark Taupe", "Wild Flower"] },
  { id: "s9", brand: "Rabbit", name: "Run Stuff It Short", type: "shorts", fabric: "EZ Performance", persona: ["mindful"], lined: true, warmthMin: 50, warmthMax: 90, colorways: ["Black", "Cobalt Blue", "Forest Green", "Sky"] },
  { id: "s10", brand: "Janji", name: "5in AFO Short", type: "shorts", fabric: "AFO Stretch", persona: ["precision"], lined: true, warmthMin: 55, warmthMax: 95, colorways: ["Black", "Dusk Blue", "Vintage Khaki", "Rust"] },
  { id: "s11", brand: "Bandit", name: "Run Short 5in", type: "shorts", fabric: "Stretch Woven", persona: ["fashion-pacer"], lined: true, warmthMin: 55, warmthMax: 95, colorways: ["Black", "Ecru", "Forest"] },
  { id: "s12", brand: "Soar", name: "Run Short", type: "shorts", fabric: "Swift Knit", persona: ["precision"], lined: false, warmthMin: 55, warmthMax: 95, colorways: ["Black", "White", "Navy"] },
  { id: "t1", brand: "Satisfy", name: "TechSilk Tights", type: "tights", fabric: "TechSilk™", persona: ["fashion-pacer", "precision"], warmthMin: 20, warmthMax: 52, colorways: ["Black", "Dark Olive"] },
  { id: "t2", brand: "Tracksmith", name: "Twilight Tight", type: "tights", fabric: "Bravio Blend", persona: ["realkeeper"], warmthMin: 22, warmthMax: 50, colorways: ["Heather Navy", "Black", "Moss Gray"] },
  { id: "t3", brand: "Tracksmith", name: "Harrier Tight", type: "tights", fabric: "Inverno Blend", persona: ["realkeeper"], warmthMin: 15, warmthMax: 45, colorways: ["Black", "Heather Grey"] },
  { id: "t4", brand: "On Running", name: "Running Tights", type: "tights", fabric: "Swift-Weave", persona: ["precision"], warmthMin: 20, warmthMax: 50, colorways: ["Black", "Navy"] },
  { id: "t5", brand: "District Vision", name: "Sphaera Tight", type: "tights", fabric: "Compression Knit", persona: ["mindful"], warmthMin: 22, warmthMax: 50, colorways: ["Black", "Dark Taupe", "Sage"] },
  { id: "t6", brand: "Rabbit", name: "Run Tight", type: "tights", fabric: "EZ Compression", persona: ["mindful"], warmthMin: 20, warmthMax: 50, colorways: ["Black", "Heather Charcoal", "Forest"] },
  { id: "ts1", brand: "Satisfy", name: "AuraLite Tee", type: "top-ss", fabric: "AuraLite™", persona: ["fashion-pacer", "precision"], warmthMin: 52, warmthMax: 95, colorways: ["White", "Black", "Aged White", "Burgundy"] },
  { id: "ts2", brand: "Satisfy", name: "MothTech Muscle Tee", type: "top-ss", fabric: "MothTech™", persona: ["fashion-pacer"], warmthMin: 58, warmthMax: 95, colorways: ["Black", "Off White", "Washed Brown"] },
  { id: "ts3", brand: "Satisfy", name: "PeaceShell River Shirt", type: "top-ss", fabric: "PeaceShell™", persona: ["fashion-pacer"], warmthMin: 52, warmthMax: 85, colorways: ["Black", "Olive", "Ecru"] },
  { id: "ts4", brand: "Tracksmith", name: "Harrier Tee", type: "top-ss", fabric: "Merino/Nylon", persona: ["realkeeper"], warmthMin: 48, warmthMax: 85, colorways: ["Heather Grey", "Navy", "Ivory", "Bering Sea"] },
  { id: "ts5", brand: "Tracksmith", name: "Van Cortlandt Singlet", type: "top-ss", fabric: "2:09 Mesh", persona: ["realkeeper"], warmthMin: 55, warmthMax: 95, colorways: ["Heather Grey/Navy", "Black/Gold", "Ivory/Wine"] },
  { id: "ts6", brand: "District Vision", name: "Karuna Training Tee", type: "top-ss", fabric: "Recycled Mesh", persona: ["mindful"], warmthMin: 55, warmthMax: 95, colorways: ["Black", "White", "Sage", "Chamomile", "Arctic Gray"] },
  { id: "ts7", brand: "On Running", name: "Performance Tee", type: "top-ss", fabric: "On-Dry", persona: ["precision"], warmthMin: 50, warmthMax: 95, colorways: ["Black", "White", "Glacier", "Undyed"] },
  { id: "ts8", brand: "Janji", name: "Groundwork Tee", type: "top-ss", fabric: "AFO Air", persona: ["precision"], warmthMin: 50, warmthMax: 90, colorways: ["Black", "Fog", "Rust", "Dusk Blue"] },
  { id: "ts9", brand: "Rabbit", name: "Run EZ Short Sleeve", type: "top-ss", fabric: "EZ Performance", persona: ["mindful"], warmthMin: 50, warmthMax: 90, colorways: ["White", "Black", "Sky", "Wild Flower"] },
  { id: "ts10", brand: "Bandit", name: "Run Tee", type: "top-ss", fabric: "Stretch Knit", persona: ["fashion-pacer"], warmthMin: 52, warmthMax: 90, colorways: ["Black", "Ecru", "Sage"] },
  { id: "ts11", brand: "Soar", name: "Technical Tee", type: "top-ss", fabric: "Swift Knit", persona: ["precision"], warmthMin: 52, warmthMax: 90, colorways: ["Black", "White", "Navy"] },
  { id: "ts12", brand: "NNormal", name: "Running Tee", type: "top-ss", fabric: "Recycled Tech", persona: ["mindful", "trail-rebel"], warmthMin: 50, warmthMax: 90, colorways: ["Black", "White", "Terracotta"] },
  { id: "tl1", brand: "Satisfy", name: "CloudMerino Long Sleeve", type: "top-ls", fabric: "CloudMerino™", persona: ["fashion-pacer", "precision"], warmthMin: 32, warmthMax: 58, colorways: ["Black", "Ecru", "Moss"] },
  { id: "tl2", brand: "Tracksmith", name: "Harrier Long Sleeve", type: "top-ls", fabric: "Inverno Blend", persona: ["realkeeper"], warmthMin: 28, warmthMax: 55, colorways: ["Heather Grey", "Navy", "Bering Sea"] },
  { id: "tl3", brand: "District Vision", name: "Karuna Long Sleeve", type: "top-ls", fabric: "Recycled Mesh", persona: ["mindful"], warmthMin: 35, warmthMax: 58, colorways: ["Black", "Chamomile", "Sage", "Cacao"] },
  { id: "tl4", brand: "On Running", name: "Performance Long-T", type: "top-ls", fabric: "On-Dry", persona: ["precision"], warmthMin: 30, warmthMax: 55, colorways: ["Black", "Navy", "Undyed"] },
  { id: "tl5", brand: "Janji", name: "Groundwork Long Sleeve", type: "top-ls", fabric: "AFO Air", persona: ["precision"], warmthMin: 32, warmthMax: 55, colorways: ["Black", "Forest", "Fog"] },
  { id: "m1", brand: "Satisfy", name: "CloudMerino Half-Zip", type: "midlayer", fabric: "CloudMerino™", persona: ["fashion-pacer", "precision"], warmthMin: 22, warmthMax: 48, colorways: ["Black", "Ecru", "Olive Drab"] },
  { id: "m2", brand: "Tracksmith", name: "Oslo Half-Zip", type: "midlayer", fabric: "Inverno Blend", persona: ["realkeeper"], warmthMin: 18, warmthMax: 45, colorways: ["Heather Grey", "Navy", "Black", "Wine"] },
  { id: "m3", brand: "District Vision", name: "Sphaera Half-Zip", type: "midlayer", fabric: "Compression Knit", persona: ["mindful"], warmthMin: 28, warmthMax: 50, colorways: ["Black", "Sage", "Cacao"] },
  { id: "m4", brand: "Janji", name: "Groundwork Half-Zip", type: "midlayer", fabric: "AFO Fleece", persona: ["precision"], warmthMin: 25, warmthMax: 48, colorways: ["Black", "Forest", "Rust"] },
  { id: "m5", brand: "Bandit", name: "Quarter Zip", type: "midlayer", fabric: "Fleece Knit", persona: ["fashion-pacer"], warmthMin: 25, warmthMax: 48, colorways: ["Black", "Ecru", "Forest"] },
  { id: "j1", brand: "Satisfy", name: "Justice Wind Jacket", type: "jacket", fabric: "Justice™", persona: ["fashion-pacer", "precision"], warmthMin: 18, warmthMax: 45, colorways: ["Black", "Olive Drab", "Ecru"] },
  { id: "j2", brand: "Tracksmith", name: "Twilight Jacket", type: "jacket", fabric: "Weather-Repellent Bravio", persona: ["realkeeper"], warmthMin: 20, warmthMax: 48, colorways: ["Heather Navy", "Black", "Ivory"] },
  { id: "j3", brand: "On Running", name: "Weather Jacket", type: "jacket", fabric: "On-Repel", persona: ["precision"], warmthMin: 15, warmthMax: 45, colorways: ["Black", "Navy", "Glacier"] },
  { id: "j4", brand: "Janji", name: "NGFS Vest", type: "vest", fabric: "Recycled DWR", persona: ["precision"], warmthMin: 25, warmthMax: 50, colorways: ["Black", "Fog", "Rust"] },
  { id: "j5", brand: "Salomon", name: "Bonatti Trail Jacket", type: "jacket", fabric: "AdvancedSkin Shield", persona: ["trail-rebel"], warmthMin: 18, warmthMax: 50, colorways: ["Black", "Deep Blue", "Peat"] },
  { id: "j6", brand: "District Vision", name: "Sphaera Shell", type: "jacket", fabric: "Recycled DWR", persona: ["mindful", "trail-rebel"], warmthMin: 22, warmthMax: 48, colorways: ["Black", "Sage", "Dark Taupe"] },
  { id: "j7", brand: "NNormal", name: "Tomir Jacket", type: "jacket", fabric: "Recycled Stretch Shell", persona: ["trail-rebel", "mindful"], warmthMin: 20, warmthMax: 48, colorways: ["Black", "Deep Teal", "Terracotta"] },
  { id: "h1", brand: "Ciele", name: "GOCap Standard", type: "hat", persona: ["fashion-pacer", "precision", "realkeeper"], warmthMin: 0, warmthMax: 95, colorways: ["Black", "White", "Navy", "Olive", "Red"] },
  { id: "h2", brand: "Ciele", name: "FSTCap Standard", type: "hat", persona: ["fashion-pacer", "precision"], warmthMin: 0, warmthMax: 95, colorways: ["Black", "White", "Forest Green", "Graphite"] },
  { id: "h3", brand: "Tracksmith", name: "Harrier Cap", type: "hat", persona: ["realkeeper"], warmthMin: 40, warmthMax: 95, colorways: ["Heather Grey", "Navy", "Black", "Ivory"] },
  { id: "h4", brand: "Satisfy", name: "PeaceShell Cap", type: "hat", fabric: "PeaceShell™", persona: ["fashion-pacer"], warmthMin: 35, warmthMax: 95, colorways: ["Black", "Ecru", "Olive"] },
  { id: "h5", brand: "District Vision", name: "Tom Running Cap", type: "hat", persona: ["mindful"], warmthMin: 35, warmthMax: 95, colorways: ["Black", "White", "Sage", "Chamomile"] },
  { id: "h6", brand: "Salomon", name: "Sense Aero Cap", type: "hat", persona: ["trail-rebel"], warmthMin: 35, warmthMax: 95, colorways: ["Black", "Deep Blue", "Peat"] },
  { id: "h7", brand: "NNormal", name: "Running Cap", type: "hat", persona: ["trail-rebel", "mindful"], warmthMin: 35, warmthMax: 95, colorways: ["Black", "Terracotta", "Deep Teal"] },
  { id: "g1", brand: "Tracksmith", name: "Oslo Glove", type: "gloves", persona: ["realkeeper"], warmthMin: 0, warmthMax: 38, colorways: ["Black", "Heather Grey", "Navy"] },
  { id: "g2", brand: "On Running", name: "Running Glove", type: "gloves", persona: ["precision"], warmthMin: 0, warmthMax: 40, colorways: ["Black", "Navy"] },
  { id: "g3", brand: "Salomon", name: "Agile Warm Glove", type: "gloves", persona: ["trail-rebel"], warmthMin: 0, warmthMax: 38, colorways: ["Black", "Peat"] },
  { id: "g4", brand: "District Vision", name: "Running Glove", type: "gloves", persona: ["mindful"], warmthMin: 0, warmthMax: 40, colorways: ["Black", "Sage"] },
  { id: "k1", brand: "Tracksmith", name: "Endorphin Sock", type: "socks", persona: ["realkeeper"], warmthMin: 0, warmthMax: 95, colorways: ["White/Navy", "Black/Gold", "Grey/Navy", "Ivory/Wine"] },
  { id: "k2", brand: "Satisfy", name: "Merino Low Sock", type: "socks", fabric: "CloudMerino™", persona: ["fashion-pacer"], warmthMin: 0, warmthMax: 95, colorways: ["White", "Black", "Ecru"] },
  { id: "k3", brand: "On Running", name: "Mid Sock", type: "socks", persona: ["precision"], warmthMin: 0, warmthMax: 95, colorways: ["Black/White", "White/Black", "Navy/Glacier"] },
  { id: "k4", brand: "District Vision", name: "Running Sock", type: "socks", persona: ["mindful"], warmthMin: 0, warmthMax: 95, colorways: ["Black", "White", "Sage", "Wild Flower"] },
  { id: "k5", brand: "Darn Tough", name: "Run No Show Tab", type: "socks", persona: ["realkeeper", "trail-rebel"], warmthMin: 0, warmthMax: 95, colorways: ["Black", "White", "Navy", "Olive"] },
  { id: "sh1", brand: "New Balance", name: "Fresh Foam X 1080v15", type: "shoes", persona: ["realkeeper", "fashion-pacer"], use: "Daily Trainer", warmthMin: 0, warmthMax: 95, colorways: ["Grey Matter/Slate Gray", "Earth Shadow", "Desert Clay", "Vintage Indigo", "Black"] },
  { id: "sh2", brand: "New Balance", name: "880v15", type: "shoes", persona: ["realkeeper"], use: "Daily Trainer", warmthMin: 0, warmthMax: 95, colorways: ["Grey Matter", "Black", "Navy", "White/Silver"] },
  { id: "sh3", brand: "Saucony", name: "Endorphin Speed 4", type: "shoes", persona: ["realkeeper", "precision"], use: "Speed / Tempo", warmthMin: 0, warmthMax: 95, colorways: ["Black/Gold", "White/Jade", "Grape/Silver", "Mint"] },
  { id: "sh4", brand: "Brooks", name: "Ghost 17", type: "shoes", persona: ["realkeeper"], use: "Daily Trainer", warmthMin: 0, warmthMax: 95, colorways: ["Black/Biscuit", "Coconut/Portabella", "Alloy/White/Gold Fusion"] },
  { id: "sh5", brand: "On Running", name: "Cloudsurfer 2", type: "shoes", persona: ["precision"], use: "Daily Trainer", warmthMin: 0, warmthMax: 95, colorways: ["Black/Eclipse", "Ivory/Heron", "Undyed/White", "Cobalt/Glacier"] },
  { id: "sh6", brand: "On Running", name: "Cloudmonster 2", type: "shoes", persona: ["precision", "fashion-pacer"], use: "Max Cushion", warmthMin: 0, warmthMax: 95, colorways: ["Black/Eclipse", "Undyed/White", "Glacier/Cloud"] },
  { id: "sh7", brand: "Adidas", name: "Adizero Adios Pro 4", type: "shoes", persona: ["precision"], use: "Race Day", warmthMin: 0, warmthMax: 95, colorways: ["Black/Gold", "White/Solar Red", "Core Black"] },
  { id: "sh8", brand: "Nike", name: "Pegasus 42", type: "shoes", persona: ["precision", "realkeeper"], use: "Daily Trainer", warmthMin: 0, warmthMax: 95, colorways: ["Dusty Cactus/Black", "Summit White/Photon Dust", "Cannon/Volt/Obsidian"] },
  { id: "sh9", brand: "Hoka", name: "Clifton 10", type: "shoes", persona: ["fashion-pacer", "mindful"], use: "Daily Trainer", warmthMin: 0, warmthMax: 95, colorways: ["Solar Flare/Lettuce", "Dusk/Illusion", "Harbor Mist", "Nimbus Cloud", "Bellweather Blue"] },
  { id: "sh10", brand: "Hoka", name: "Bondi 9", type: "shoes", persona: ["fashion-pacer", "mindful"], use: "Max Cushion / Recovery", warmthMin: 0, warmthMax: 95, colorways: ["Black/White", "Desert Sun", "White/Lemonade", "Black/Rose Gold"] },
  { id: "sh11", brand: "Hoka", name: "Speedgoat 7", type: "shoes", persona: ["trail-rebel", "fashion-pacer"], use: "Trail", warmthMin: 0, warmthMax: 95, colorways: ["Black/Black", "Harbor Mist/Lunar Rock", "Desert Sun/Amber"] },
  { id: "sh12", brand: "Norda", name: "001", type: "shoes", persona: ["fashion-pacer", "trail-rebel"], use: "Trail / Lifestyle", warmthMin: 0, warmthMax: 95, colorways: ["White/Gum", "Black/Black", "Cobalt/White", "Natural/Gum"] },
  { id: "sh13", brand: "Salomon", name: "XT-6", type: "shoes", persona: ["trail-rebel", "fashion-pacer"], use: "Trail / Lifestyle", warmthMin: 0, warmthMax: 95, colorways: ["Black/Phantom", "Alpen Blossom Pack", "Red Ashes Pack", "Orchid Pack"] },
  { id: "sh14", brand: "Salomon", name: "S/LAB Ultra 3", type: "shoes", persona: ["trail-rebel"], use: "Ultra Trail", warmthMin: 0, warmthMax: 95, colorways: ["Black", "White/Black", "Peat/Blue"] },
  { id: "sh15", brand: "La Sportiva", name: "Prodigio Pro", type: "shoes", persona: ["trail-rebel"], use: "Trail Racing", warmthMin: 0, warmthMax: 95, colorways: ["Black/Yellow", "White/Blue", "Carbon/Neon"] },
  { id: "sh16", brand: "ASICS", name: "Gel-Nimbus 28", type: "shoes", persona: ["mindful", "realkeeper"], use: "Max Cushion", warmthMin: 0, warmthMax: 95, colorways: ["Sheet Rock/Indigo Blue", "Soothing Sea/Sea Glass", "Papaya/Dusty Purple", "Grey Floss/Lemon Spark"] },
  { id: "sh17", brand: "ASICS", name: "Novablast 5", type: "shoes", persona: ["mindful"], use: "Daily Speed", warmthMin: 0, warmthMax: 95, colorways: ["Black/Glow Yellow", "Island Blue/Sun Peach", "Pink Rave/Pure Silver"] },
  { id: "sh18", brand: "Hoka x Satisfy", name: "Mafate Speed 4 Lite", type: "shoes", persona: ["fashion-pacer"], use: "Trail / Collab", warmthMin: 0, warmthMax: 95, colorways: ["Silver/Clear Technical"] },
];

const TYPE_LABELS = {
  "shorts": "Shorts", "tights": "Tights", "top-ss": "Short Sleeve",
  "top-ls": "Long Sleeve", "midlayer": "Midlayer", "jacket": "Jacket",
  "vest": "Vest", "hat": "Hat / Cap", "gloves": "Gloves",
  "socks": "Socks", "shoes": "Shoes"
};

const WARMTH_RANGES = [
  { label: "Any temp", min: 0, max: 95 },
  { label: "Cold (under 40°F)", min: 0, max: 40 },
  { label: "Cool (40–55°F)", min: 40, max: 55 },
  { label: "Mild (55–65°F)", min: 55, max: 65 },
  { label: "Warm (65°F+)", min: 65, max: 95 },
];

const ACTIVITY_TYPES = [
  { id: "easy", label: "Easy Run", icon: "◦", description: "Recovery / conversational pace" },
  { id: "workout", label: "Workout", icon: "◈", description: "Tempo, intervals, or fartlek" },
  { id: "long", label: "Long Run", icon: "◉", description: "Distance — 60+ minutes" },
  { id: "race", label: "Race", icon: "◎", description: "All out effort" },
];

const EMPTY_CUSTOM = { brand: "", name: "", type: "shorts", colorway: "", warmthRange: 0, notes: "" };

function buildAlgorithmContext(temp, wind, humidity, activity, persona, locker) {
  const effortAdjust = (activity === "workout" || activity === "race") ? 15 : activity === "easy" ? -5 : 0;
  const feltTemp = temp + effortAdjust;
  const climateRules = [];
  if (feltTemp < 32) {
    climateRules.push("REQUIRED bottom: tights (not shorts)");
    climateRules.push("REQUIRED top: long sleeve base layer");
    climateRules.push("REQUIRED layer: midlayer or jacket");
    climateRules.push("REQUIRED: gloves");
    climateRules.push("CONSIDER: ear coverage or buff");
  } else if (feltTemp < 42) {
    climateRules.push("REQUIRED bottom: tights strongly preferred");
    climateRules.push("REQUIRED top: long sleeve");
    climateRules.push("CONSIDER: light midlayer or jacket");
    climateRules.push("CONSIDER: gloves for first miles");
  } else if (feltTemp < 52) {
    climateRules.push("bottom: tights or shorts - runner's preference");
    climateRules.push("top: long sleeve or short sleeve with arm sleeves");
  } else if (feltTemp < 62) {
    climateRules.push("REQUIRED bottom: shorts");
    climateRules.push("top: short sleeve");
  } else if (feltTemp < 72) {
    climateRules.push("REQUIRED bottom: shorts");
    climateRules.push("REQUIRED top: short sleeve or singlet");
  } else {
    climateRules.push("REQUIRED bottom: shorts - lightest available");
    climateRules.push("REQUIRED top: singlet or lightest short sleeve");
  }
  if (wind > 18) climateRules.push("REQUIRED: wind-blocking outer layer");
  if (humidity > 78) climateRules.push("REQUIRED: technical moisture-wicking only");
  if (activity === "long") climateRules.push("CONSIDER: pockets for nutrition, anti-chafe fabrics");
  const colorGuide = [
    "Evaluate color harmony AFTER culimate requirements are met.",
    "Neutral anchors (black, white, grey, navy, ecru, olive) pair with anything.",
    "Earth tones (tan, brown, rust, sage, moss) are cohesive together.",
    "Bold/bright pieces should be balanced with at least one neutral.",
    "Avoid clashing saturated colors.",
    "Monochromatic or tonal outfits are always editorially strong.",
    "If locker items constrain color options, honor those constraints before style.",
  ];
  const styleNote = `Apply style persona LAST, only to fill remaining gaps. Climate and color compatibility take priority. When suggesting outside locker, prefer ${persona.brands.slice(0, 2).join(" or ")}.`;
  const lockerWithSuitability = locker.map(item => {
    const climateOk = item.warmthMin <= temp && item.warmthMax >= temp;
    return `${item.brand} ${item.name} (${item.colorway})${item.fabric ? ` [${item.fabric}]` : ""} -- ${TYPE_LABELS[item.type] || item.type}${climateOk ? "" : " WARNING: CLIMATE MISMATCH"}${item.isCustom ? " [custom]" : ""}`;
  });
  return { climateRules, colorGuide, styleNote, lockerWithSuitability, feltTemp };
}

export default function RunLocker() {
  const [view, setView] = useState("home");
  const [addGearMode, setAddGearMode] = useState("browse");
  const [locker, setLocker] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState("all");
  const [personaFilter, setPersonaFilter] = useState("all");
  const [weather, setWeather] = useState({ temp: 52, wind: 8, humidity: 60, condition: "Partly Cloudy" });
  const [activity, setActivity] = useState("easy");
  const [persona, setPersona] = useState("realkeeper");
  const [suggestion, setSuggestion] = useState(null);
  const [loadingSuggestion, setLoadingSuggestion] = useState(false);
  const [addingItem, setAddingItem] = useState(null);
  const [selectedColorway, setSelectedColorway] = useState("");
  const [lockerFilter, setLockerFilter] = useState("all");
  const [storageReady, setStorageReady] = useState(false);
  const [customForm, setCustomForm] = useState(EMPTY_CUSTOM);
  const [customAdded, setCustomAdded] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [showAddGear, setShowAddGear] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const r = await window.storage.get("locker-v4");
        if (r?.value) setLocker(JSON.parse(r.value));
        const p = await window.storage.get("stride-persona");
        if (p?.value) setPersona(p.value);
      } catch (e) {}
      setStorageReady(true);
    };
    load();
  }, []);

  useEffect(() => {
    if (!storageReady) return;
    window.storage.set("locker-v4", JSON.stringify(locker)).catch(() => {});
  }, [locker, storageReady]);

  const savePersona = (p) => {
    setPersona(p);
    window.storage.set("stride-persona", p).catch(() => {});
  };

  const addToLocker = (item, colorway)=>{ const entry = { ...item, colorway, lockerId: `${item.id}-${colorway}-${Date.now()}` }; setLocker(prev => [...prev, entry]); setAddingItem(null); setSelectedColorway(""); setShowAddGear(false); };

  const addCustomToLocker = () => {
    if (!customForm.brand || !customForm.name || !customForm.colorway) return;
    const range = WARMTH_RANGES[customForm.warmthRange];
    const entry = { id: `custom-${Date.now()}`, lockerId: `custom-${Date.now()}-${Math.random()}`, brand: customForm.brand.trim(), name: customForm.name.trim(), type: customForm.type, colorway: customForm.colorway.trim(), notes: customForm.notes.trim(), warmthMin: range.min, warmthMax: range.max, persona: [], isCustom: true };
    setLocker(prev => [...prev, entry]); setCustomForm(EMPTY_CUSTOM); setCustomAdded(true); setShowAddGear(false); setTimeout(() => setCustomAdded(false), 2500);
  };

  const removeFromLocker = (lockerId) => setLocker(prev => prev.filter(i => i.lockerId !== lockerId));

  const filteredGear = GEAR_DATABASE.filter(item => {
    const q = searchQuery.toLowerCase();
    const matchesSearch = q === "" || item.name.toLowerCase().includes(q) || item.brand.toLowerCase().includes(q) || (item.fabric || "").toLowerCase().includes(q);
    const matchesType = selectedType === "all" || item.type === selectedType;
    const matchesPersona = personaFilter === "all" || (item.persona || []).includes(personaFilter);
    return matchesSearch && matchesType && matchesPersona;
  });

  const currentPersona = STYLE_PERSONAS.find(p => p.id === persona);
  const lockerFiltered = lockerFilter === "all" ? locker : locker.filter(i => i.type === lockerFilter);

  const getSuggestion = async () => {
    setLoadingSuggestion(true); setSuggestion(null); setView("suggest");
    const ctx = buildAlgorithmContext(weather.temp, weather.wind, weather.humidity, activity, currentPersona, locker);
    const activityInfo = ACTIVITY_TYPES.find(a => a.id === activity);
    const prompt = `You are a running fashion editor. Suggest a complete running outfit using a strict 3-tier priority system.

PRIORITY 1: CLIMATE (non-negotiable)
Felt temp: ${ctx.feltTemp}F (actual: ${weather.temp}F)
Wind: ${weather.wind} mph | Humidity: ${weather.humidity}% | ${weather.condition}
Activity: ${activityInfo.label} -- ${activityInfo.description}

Climate requirements (MUST be satisfied first):
${ctx.climateRules.map(r => `- ${r}`).join("\n")}

PRIORITY 2: COLOR HARMONY (apply after climate)
${ctx.colorGuide.map(r => `- ${r}`).join("\n")}

PRIORITY 3 STYLE PERSONA: ${currentPersona.label} -- ${currentPersona.tag}
${ctx.styleNote}

RUNNER's LOCKER:
${ctx.lockerWithSuitability.length > 0 ? ctx.lockerWithSuitability.join("\n") : "Empty -- suggest from persona-aligned brands"}

INSTRUCTIONS:
1. First resolve climate requirements using locker items.
2. Check color harmony of selected items.
3. Fill gaps using style persona.
4. Items marked CLIMATE MISMATCH must not be used.
5. Always include shoes.

Respond ONLY in this JSON:
{"headline":"Punchy 4-7 word editorial outfit name","items":[{"category":"Bottom","item":"Brand + item","colorway":"specific colorway","why":"one sentence"},{"category":"Top","item":"Brand + item","colorway":"colorway","why":"one sentence"},{"category":"Shoes","item":"Brand + model","colorway":"colorway","why":"how it completes the look"}],"stylistNote":"2-3 editorial sentences on why this outfit works.","weatherSummary":"One sharp line about what to expect physically."}`;
    try {
      const response = await fetch("https://api.anthropic.com/v1/messages", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ model: "claude-sonnet-4-20250514", max_tokens: 1000, messages: [{ role: "user", content: prompt }] }) });
      const data = await response.json();
      const text = data.content?.find(b => b.type === "text")?.text || "";
      setSuggestion(JSON.parse(text.replace(/```json|```/g, "").trim()));
    } catch (e) { setSuggestion({ error: true }); }
    setLoadingSuggestion(false);
  };

  // UI render -- same as v4 artifact, truncated here for brevity
  // Full component render is in the artifact
  return null;
}
