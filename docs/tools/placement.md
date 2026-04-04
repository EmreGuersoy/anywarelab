# Placement Tools

## Add Well (single)

Click anywhere inside the plate footprint to place one well.

The new well **inherits its properties** from the most recently selected well (shape, diameter, depth, volume).
To set a default template, select an existing well before switching to the Add Well tool.

## Add Grid (multiple)

Drag a rectangular region on the plate to open the **multi-well panel** in the right sidebar.

| Field | Description |
|---|---|
| Rows | Number of rows (≥ 1). Shows a red warning if empty or zero. |
| Columns | Number of columns (≥ 1). Shows a red warning if empty or zero. |
| Row spacing | Centre-to-centre distance in Y (mm) |
| Column spacing | Centre-to-centre distance in X (mm) |
| Offset X | X position of the first well from the drag region's left edge |
| Offset Y | Y position of the first well from the drag region's bottom edge |

Click **Add Wells** to commit. The button is disabled until rows and columns are both valid.

## Select

| Interaction | Result |
|---|---|
| Click a well | Select that well |
| `Shift` + click | Add well to selection |
| Drag on empty canvas | Marquee-select all wells inside the rectangle |
| `Shift` + marquee drag | Add marquee result to existing selection |
| Drag a selected well | Move it (or move all selected wells if multiple are selected) |

## Erase

Click any well to delete it immediately.

To delete multiple wells at once, first select them with the Select tool, then press `Delete` or `Backspace`.
