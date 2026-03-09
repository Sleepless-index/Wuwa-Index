
## File Structure

```
├── index.html      — Html
├── style.css       — All visual styling and CSS variables
├── data.js         — Static resonator data, element colours
├── app.js          — State management, tracker rendering, all UI logic
├── snapshot.js     — Snapshot modal, preview rendering, Canvas PNG export
│
├── icons/
│   ├── head_<Name>.webp     — Head portrait per resonator
│   └── icon_<Element>.webp  — Element icon
│
└── art/
    └── art_<Name>.avif      — art card used in gallery snapshot
```

## Adding Resonator Assets

Image filenames follow a strict pattern — spaces and special characters in names are replaced with `_`:

| Asset type | Path | Example |
|---|---|---|
| Head icon | `icons/head_<Name>.webp` | `icons/head_Xiangli_Yao.webp` |
| Element icon | `icons/icon_<Element>.webp` | `icons/icon_Electro.webp` |
| Full art | `art/art_<Name>.avif` | `art/art_Carlotta.avif` |

Missing assets degrade gracefully — icons hide themselves, art falls back to the head portrait in snapshots.

## Adding New Resonators

Open `data.js` and add an entry to the appropriate region group (or create a new one):

```js
{ id: 29, ver: "3.2", name: "Newchar", element: "Glacio" },
```

IDs must be unique. Versions use `"X.X"` format; Standard banner uses `"—"`.
