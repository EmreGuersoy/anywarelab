# Edge Offsets

Edge offsets define the position of a well's **centre** relative to the plate origin.

| Field | Description |
|---|---|
| Left edge | Distance from the plate left edge (X = 0) to the well centre, in mm |
| Front edge | Distance from the plate front edge (Y = 0) to the well centre, in mm |

## Anchor well (multi-select)

When multiple wells are selected, an **Anchor well** dropdown appears above the offset inputs.

- The inputs show the position of the anchor well.
- Editing the offset **moves all selected wells by the same delta**, preserving their relative positions.
- The anchor defaults to the first selected well and resets when the selection changes.

!!! example
    If the anchor is at X = 10 mm and you change it to X = 15 mm, every selected well moves +5 mm in X.
