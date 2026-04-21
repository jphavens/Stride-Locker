# Stride Locker - Project Context & Vision

## 🎯 The Objective
Stride Locker is a "Digital Gear Closet" for runners. It solves the friction of matching clothing to weather and activity levels. Critically, it is designed for a **colorblind user** to remove the stress of color-matching and coordination.

## 🎨 Design & Accessibility Philosophy
- **Colorblind Friendly:** Do not rely on color alone to convey information (e.g., don't just use a red/green dot for "too hot/too cold"). Use icons, labels, and text.
- **Aesthetic:** Heritage, Gorpcore, and Minimalist (e.g., Tracksmith, Satisfy, District Vision).
- **Coordination Logic:** The app should act as a "Style Consultant," using objective color labels (e.g., "Navy," "Olive") to help the user build outfits that look good without needing to "see" the color perfectly.

## 🧠 Core Logic & Features
- **Weather-to-Gear Mapping:** Matches `warmthMin`/`warmthMax` to real-time temperature.
- **Style Personas:** Filters gear based on "Real Keeper," "Fashion Pacer," etc.
- **Locker Management:** Track "worn today" status and gear rotation stats.

## 🛠 Technical Infrastructure (Flight Deck)
- **Host:** Ubuntu Server via Tailscale (stride.home).
- **Stack:** React, Vite, Tailwind v4, Lucide-React, Recharts, Framer Motion.
- **Persistence:** LocalStorage (Keys: `stride-v6-locker`, `stride-persona`).

## ⚠️ Development Rules
1. **Label Everything:** Always include text labels for colors in the UI.
2. **Mobile First:** Optimized for a quick check before heading out the door.
3. **Tailwind v4:** Standard styling engine.
