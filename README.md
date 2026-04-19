# MealSwap

> AI-powered healthy food alternative finder | Vite + React + Tailwind CSS + PWA

## 🥗 About

MealSwap uses AI to analyze your food craving and suggest a healthier alternative with a full **КБЖВ comparison** (калорії, білки, жири, вуглеводи).

## ✨ Features

- 🔍 **Vibe-based search** — describe a feeling, get a healthy swap
- 📊 **КБЖВ comparison** — side-by-side nutritional table
- ❤️ **Favorites** — save your best swaps (via Supabase)
- 📱 **PWA** — installable on mobile (iOS/Android)
- 🤖 **AI-powered** — real AI integration in Step 2

## 🚀 Quick Start

```bash
npm install --legacy-peer-deps
npm run dev
```

## 📁 Project Structure

```
src/
├── components/
│   ├── SearchBar.tsx      # Animated search
│   ├── HistoryCard.tsx    # Bento grid cards
│   ├── ResultScreen.tsx   # Comparison table
│   └── MacroCard.tsx      # Nutritional bars
├── App.tsx
├── mockData.ts
├── types.ts
└── index.css
```

## 📱 Android Build

```bash
npm run build
npx cap add android
npx cap sync android
npx cap open android
```

## 🔐 Environment Variables

Copy `.env.example` → `.env.local`:

| Variable | Description |
|---|---|
| `VITE_SUPABASE_URL` | Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | Supabase anon key |

## 🚢 Deploy to Netlify

Push to GitHub → Connect to Netlify → Done! (auto-detects `netlify.toml`)
