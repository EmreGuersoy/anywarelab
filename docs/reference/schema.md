# Schema Reference

Anywarelab exports **Opentrons Labware Schema v2**. Below are the key fields.

## Top-level fields

| Field | Type | Description |
|---|---|---|
| `ordering` | `string[][]` | Column-major array of well labels (`[["A1","B1",...],["A2",...]]`) |
| `brand` | object | `{ brand: string, brandId: [] }` |
| `metadata.displayName` | string | Human-readable name shown in the Opentrons App |
| `metadata.displayCategory` | string | Labware category (`wellPlate`, `reservoir`, `tubeRack`, `tipRack`) |
| `metadata.displayVolumeUnits` | string | Always `µL` |
| `metadata.tags` | string[] | Always `[]` |
| `dimensions` | object | `{ xDimension, yDimension, zDimension }` in mm |
| `wells` | object | Map of well label → well definition |
| `groups` | object[] | Array of group metadata + well label lists |
| `parameters.format` | string | Always `"irregular"` |
| `parameters.quirks` | string[] | Always `[]` |
| `parameters.isTiprack` | boolean | Always `false` |
| `parameters.isMagneticModuleCompatible` | boolean | Always `false` |
| `parameters.loadName` | string | Snake-case identifier for protocol use |
| `namespace` | string | Always `"custom_beta"` |
| `version` | number | Always `1` |
| `schemaVersion` | number | Always `2` |
| `cornerOffsetFromSlot` | object | `{ x: 0, y: 0, z: 0 }` |

## Well object fields

| Field | Type | Description |
|---|---|---|
| `x` | number | Well centre X in mm from the left plate edge |
| `y` | number | Well centre Y in mm from the front plate edge |
| `z` | number | Well bottom height in mm above the deck (`= zDimension − depth`) |
| `depth` | number | Well depth in mm |
| `shape` | string | `"circular"` or `"rectangular"` |
| `diameter` | number | Well diameter in mm (circular only) |
| `xDimension` | number | Well X size in mm (rectangular only) |
| `yDimension` | number | Well Y size in mm (rectangular only) |
| `totalLiquidVolume` | number | Maximum liquid volume in µL |

## Example output

```json
{
  "ordering": [["A1", "B1", "C1"], ["A2", "B2", "C2"]],
  "brand": { "brand": "Generic", "brandId": [] },
  "metadata": {
    "displayName": "Custom Labware",
    "displayCategory": "wellPlate",
    "displayVolumeUnits": "µL",
    "tags": []
  },
  "dimensions": { "xDimension": 127.76, "yDimension": 85.48, "zDimension": 14.22 },
  "wells": {
    "A1": {
      "depth": 10.67, "totalLiquidVolume": 200,
      "shape": "circular", "diameter": 6.86,
      "x": 14.38, "y": 74.24, "z": 3.55
    }
  },
  "groups": [
    {
      "metadata": { "wellBottomShape": "flat", "displayName": "Wells" },
      "wells": ["A1", "B1", "C1", "A2", "B2", "C2"]
    }
  ],
  "parameters": {
    "format": "irregular", "quirks": [],
    "isTiprack": false, "isMagneticModuleCompatible": false,
    "loadName": "custom_labware_1"
  },
  "namespace": "custom_beta",
  "version": 1,
  "schemaVersion": 2,
  "cornerOffsetFromSlot": { "x": 0, "y": 0, "z": 0 }
}
```
