# OT-2 Labware Designer

A browser-based CAD tool for designing custom labware definitions for the Opentrons OT-2 liquid handling robot. Build plate layouts visually and export valid Opentrons schema v2 JSON files.

![OT-2 Labware Designer](src/assets/hero.png)

## Features

- **Visual canvas** — draw, drag, and position wells on a to-scale plate footprint
- **Multiple placement modes** — single well, drag-to-place grid, reservoir
- **Selection tools** — click, shift-click, or marquee-select wells
- **Right panel (context-sensitive)** — properties, alignment, measurement, and spacing tools appear when wells are selected
- **Align to plate** — snap wells to left edge, horizontal center, or right edge of the plate
- **Align & distribute** — align wells to each other or distribute with a fixed gap
- **Bi-well measurement** — view ΔX / ΔY / distance between two selected wells and propagate spacing to a full row or column
- **Parametric spacing** — set X/Y pitch and apply uniformly to a row or column
- **Copy / Paste** — duplicate wells with a 5 mm offset (Ctrl+C / Ctrl+V)
- **Undo / Redo** — full history with Ctrl+Z / Ctrl+Y (up to 60 steps)
- **Import / Export** — load an existing Opentrons JSON file or export a ready-to-use definition
- **Coordinate indicator** — on-canvas axis marker showing OT-2 orientation (X right, Y toward back)

## Tech Stack

| Layer | Library |
|---|---|
| UI framework | React 19 + Vite |
| State management | Zustand + Immer |
| Styling | Tailwind CSS v4 |
| Canvas | SVG (no external dependency) |

## Getting Started

### Prerequisites

- Node.js 18+
- npm 9+

### Install & run

```bash
git clone https://github.com/<your-username>/ot2-labware-designer.git
cd ot2-labware-designer
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### Build for production

```bash
npm run build
npm run preview   # preview the production build locally
```

## Project Structure

```
src/
├── components/
│   ├── CanvasView.jsx     # SVG canvas — rendering, mouse events, tools
│   ├── Editor.jsx         # Root layout, keyboard shortcuts
│   ├── LeftPanel.jsx      # Plate config + well groups sidebar
│   ├── RightPanel.jsx     # Selection-driven properties sidebar
│   └── Toolbar.jsx        # Tool strip + import/export
├── store/
│   └── useLabwareStore.js # Zustand store — all state + actions
└── utils/
    ├── schemaExport.js    # Serialize state → Opentrons schema v2 JSON
    ├── schemaImport.js    # Parse Opentrons JSON → app state
    ├── useLabelMap.js     # Hook: generate A1/B2/… well labels
    └── wellNaming.js      # Label generation helpers
```

## Keyboard Shortcuts

| Key | Action |
|---|---|
| V | Select tool |
| W | Add single well |
| G | Multi-well grid (drag to draw region) |
| R | Reservoir |
| E | Erase |
| Delete / Backspace | Delete selected wells |
| Ctrl+Z | Undo |
| Ctrl+Y / Ctrl+Shift+Z | Redo |
| Ctrl+C | Copy selected wells |
| Ctrl+V | Paste (offset +5 mm) |

## Opentrons Schema v2

Exported files conform to the [Opentrons labware schema v2](https://github.com/Opentrons/opentrons/tree/edge/shared-data/labware) and can be loaded directly into the Opentrons App or Protocol Designer.

## License

MIT
