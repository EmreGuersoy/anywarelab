# Distribute

Distributes the selected wells evenly between the two outermost wells.
Requires **at least two wells** selected.

## Gap modes

| Gap field | Mode | Behaviour |
|---|---|---|
| Empty | **Symmetric** | Equal centre-to-centre spacing across the full span of the outermost wells |
| Numeric (mm) | **Fixed gap** | Exact edge-to-edge gap between each adjacent pair of wells |

| Button | Action |
|---|---|
| ⟺ Dist. H | Distribute horizontally (along X axis) |
| ⟷ Dist. V | Distribute vertically (along Y axis) |

The Distribute buttons are disabled when the Gap field contains an invalid value (non-numeric or negative).
Click the ✕ next to the gap input to reset to symmetric mode.

!!! example
    To create a column of 8 wells with a 0.5 mm gap between each:

    1. Select all 8 wells.
    2. Enter `0.5` in the Gap field.
    3. Click **⟷ Dist. V**.
