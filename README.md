# WuWa Limited Resonator Tracker

A Next.js + React + TypeScript tracker for Wuthering Waves limited resonators. Hosted statically on GitHub Pages — no server, no account, all data in your browser.

## ✨ Stack

| Technology | Purpose |
|---|---|
| **Next.js 14** (Pages Router) | Framework, static export |
| **React 18** | UI components |
| **TypeScript** | Type safety throughout |
| **Tailwind CSS** | Styling + dark/light theme |
| **Zustand** | Global state with localStorage persistence |

## 🚀 Getting Started

```bash
npm install
npm run dev        # http://localhost:3000
npm run build      # generates /out for static hosting
```

## 📦 Deploy to GitHub Pages

1. Push this repo to GitHub
2. Go to **Settings → Pages → Source** and select **GitHub Actions**
3. On the next push to `main` the workflow in `.github/workflows/deploy.yml` builds and deploys automatically

> **Note:** If your repo is at `github.com/<you>/<repo>` (not a root user page), open `.github/workflows/deploy.yml` and set `NEXT_PUBLIC_BASE_PATH` to `/<repo>`. Also update `next.config.js` if you're running locally with a base path.

## 🗂️ Project Structure

```
├── components/
│   ├── modals/           — Export, Import, Snapshot, Edit, Release modals
│   ├── Header.tsx
│   ├── ThemeToggle.tsx
│   ├── StatsBar.tsx
│   ├── ProgressBars.tsx
│   ├── ElementBreakdown.tsx
│   ├── TrackerHeader.tsx
│   ├── TrackerEntry.tsx   — Single resonator row (checkbox, S/R dropdowns, priority)
│   ├── TrackerSection.tsx — Collapsible version group
│   ├── PriorityList.tsx   — Drag-and-drop pull priority
│   └── UpcomingSection.tsx
├── data/
│   └── resonators.ts     — HARDCODED roster + element colours
├── hooks/
│   ├── useTheme.ts       — Dark/light toggle
│   └── useCollapse.ts    — Generic collapsible animation
├── pages/
│   ├── _app.tsx          — Zustand rehydration
│   ├── _document.tsx     — Flash-of-unstyled-content prevention
│   └── index.tsx         — Main page
├── store/
│   └── trackerStore.ts   — All app state (Zustand + persist)
├── styles/
│   └── globals.css       — CSS variable themes (light + dark)
├── types/
│   └── index.ts          — Shared TypeScript interfaces
└── utils/
    ├── helpers.ts        — Utility functions
    └── snapshot.ts       — Canvas PNG export (gallery + regions modes)
```

## 🖼️ Adding Resonator Assets

Place images in `public/` — Next.js serves them from the root:

| Asset | Path | Example |
|---|---|---|
| Head icon | `public/icons/head_<slug>.webp` | `head_Xiangli_Yao.webp` |
| Element icon | `public/icons/icon_<Element>.webp` | `icon_Electro.webp` |
| Full art | `public/art/art_<slug>.avif` | `art_Carlotta.avif` |

Slug = name with non-alphanumeric chars replaced by `_`.
Missing assets degrade gracefully.

## ➕ Adding New Resonators

Edit `data/resonators.ts`:

```ts
{ id: 29, ver: "3.2", name: "NewChar", element: "Glacio" },
```

IDs must be unique. Use `"—"` for Standard banner characters.

## 🎨 Theming

Edit CSS variables in `styles/globals.css`:

```css
:root   { /* light theme */ }
.dark   { /* dark theme  */ }
```

Tailwind classes reference these variables via `tailwind.config.js`.

## 📄 License

MIT
