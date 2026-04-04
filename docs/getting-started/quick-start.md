# Quick Start

Get from a blank canvas to a working labware definition in five minutes.

## Steps

1. Open the **Design** page from the navigation bar.
2. Choose a **Labware Type** in the left panel — Well Plate, Reservoir, Tube Rack, or Tip Rack.
3. Enter the physical **plate dimensions** (Length X, Width Y, Height Z).
4. Select a placement tool (**Add Well** or **Add Grid**) and click or drag on the canvas.
5. Select placed wells to configure their **shape, depth, and volume** in the right panel.
6. Click **Export ▾ → JSON file** to download the Opentrons-compatible definition.

## First design walkthrough

### 1 — Set up a standard 96-well plate

Set the plate dimensions to the SBS standard:

| Field | Value |
|---|---|
| Length (X) | `127.76` mm |
| Width (Y) | `85.48` mm |
| Height (Z) | `14.22` mm |

### 2 — Place a well grid

Select **Add Grid** in the left panel and drag a rectangle across the plate.
In the right panel, enter:

- Rows: `8`
- Columns: `12`

Click **Add Wells** to fill the grid.

### 3 — Configure well properties

Click any well to select it. In the right panel, set:

- Shape: `Circular`
- Diameter: `6.86` mm
- Depth (Z): `10.67` mm
- Volume: `200` µL
- Bottom: `Flat`

Select all wells with a marquee drag and apply the properties to all at once.

### 4 — Export

Click **Export ▾ → JSON file**. The file is named after the **Load name** field and is ready to import
into the Opentrons App or use in a Python protocol.

!!! tip
    Use **Export ▾ → PNG image** to get a clean image of the design for documentation or lab notes.
