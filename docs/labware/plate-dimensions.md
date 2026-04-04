# Plate Dimensions

All values are in millimetres and map directly to the `dimensions` object in the exported JSON.

| Field | Axis | JSON key | Description |
|---|---|---|---|
| Length (X) | X | `xDimension` | Footprint length along X (127.76 mm for SBS) |
| Width (Y) | Y | `yDimension` | Footprint width along Y (85.48 mm for SBS) |
| Height (Z) | Z | `zDimension` | Total height from deck surface to top of labware |

## SBS standard

The Society for Biomolecular Screening (SBS) standard footprint is **127.76 × 85.48 mm**.
All standard Opentrons OT-2 and Flex deck positions accept this footprint without offset correction.

!!! tip
    Use the SBS standard footprint unless you are designing labware for a custom adapter or
    non-standard slot position.

## Metadata fields

| Field | JSON path | Description |
|---|---|---|
| Display name | `metadata.displayName` | Human-readable label shown in the Opentrons App |
| Load name | `parameters.loadName` | Snake-case identifier used in Python protocols |
| Brand | `brand.brand` | Manufacturer name |

The load name is automatically sanitised to lowercase alphanumeric characters and underscores when exported.
