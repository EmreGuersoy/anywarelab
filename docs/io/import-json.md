# Import JSON

Click **↑ Import JSON** in the toolbar and select an existing **Opentrons Labware Schema v2** JSON file.

The designer reconstructs:

- Plate dimensions (xDimension, yDimension, zDimension)
- Display name, load name, and brand
- All well groups with their names
- All well positions and properties (shape, diameter/dimensions, depth, volume, bottom shape)

!!! warning
    Importing a file **replaces the current design**. Export your work before importing a new file.

## Supported format

Only Opentrons Labware Schema **v2** (`"schemaVersion": 2`) is supported.
Definitions from the Opentrons labware library and files exported by Anywarelab are both compatible.
