# Interface Layout

The designer is split into four regions.

## Navigation bar

The top bar contains the app title, page links (Home · Design · Docs · About · Support), and the GitHub star button.

## Toolbar

Below the nav bar, the toolbar contains:

| Control | Description |
|---|---|
| **Select** `V` | Click or marquee-drag to select wells |
| **Erase** `E` | Click a well to delete it |
| **⊡ Fit** | Reset zoom and pan to fit the plate on screen |
| **↩ Undo** | Undo last action `Ctrl+Z` |
| **↪ Redo** | Redo `Ctrl+Y` |
| **↑ Import JSON** | Load an existing labware definition |
| **↓ Export ▾** | Export JSON or PNG |

## Left panel (300 px)

Always visible. Contains four sections:

- **Labware Type** — selects the labware category
- **Plate** — display name, load name, brand, and physical dimensions
- **Add Wells** — placement tools (single and grid)
- **Well Groups** — group management

## Canvas

The main workspace. Features:

- White plate footprint on a dot-grid background
- Pan with `Alt + drag` or middle-mouse drag
- Zoom with the scroll wheel
- Dimension annotations, axis labels, and fiducial markers
- Empty-state overlay with instructions when no wells exist

## Right panel (280 px)

Appears when one or more wells are selected (or when a grid drag is in progress).
Contains:

- **Align & Distribute** — copy/paste, align to plate, align to each other, distribute
- **Well Properties** — shape, dimensions, depth, volume, bottom shape, edge offsets
- **Measurement** — distance and delta between two selected wells
- **Spacing** — distance from a well to its nearest neighbour
- **Multi-well placement** — rows/columns/spacing form after a grid drag
