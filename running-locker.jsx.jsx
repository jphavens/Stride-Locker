import { useState, useEffect } from "react";

// ─── CONSTANTS ────────────────────────────────────────────────────────────────

const STYLE_PERSONAS = [
  { id:"realkeeper", label:"Real Keeper", tag:"Heritage · Collegiate", description:"Tracksmith, New Balance — timeless aesthetics, discipline, the amateur spirit of the sport", brands:["Tracksmith","New Balance","Brooks","Saucony"] },
  { id:"fashion-pacer", label:"Fashion Pacer", tag:"Streetwear · Gorpcore", description:"Satisfy, Bandit, Norda — technical details as fashion statements, blurring sport and street", brands:["Satisfy","Bandit","Norda","Hoka"] },
  { id:"precision", label:"Precision Performer", tag:"Technical · Minimalist", description:"On Running, Soar, Janji — industrial sophistication, performance-first with a clean edge", brands:["On Running","Soar","Janji","Adidas"] },
  { id:"mindful", label:"Mindful Jogger", tag:"Expressive · Vibrant", description:"District Vision, NNormal, Rabbit — joyful palette, mindful movement, vibrant self-expression", brands:["District Vision","NNormal","Rabbit","Ciele"] },
  { id:"trail-rebel", label:"Trail Rebel", tag:"Rugged · Mountain-to-City", description:"Salomon, La Sportiva, Patagonia — gorpcore authority, built for the mountain and the street", brands:["Salomon","La Sportiva","The North Face","Patagonia"] },
];

// [FULL GEAR_DB and component code from v6 artifact]
// See artifact in conversation for complete file
