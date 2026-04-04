# Export JSON

Click **Export ▾ → JSON file** in the toolbar to download the labware definition as an
**Opentrons Labware Schema v2** JSON file. The filename is derived from the `loadName` field.

## Using the JSON in a Python protocol

```python
import json
from opentrons import protocol_api

metadata = {"apiLevel": "2.14"}

def run(protocol: protocol_api.ProtocolContext):
    with open("custom_labware.json") as f:
        definition = json.load(f)

    labware = protocol.load_labware_from_definition(
        definition,
        location=1
    )

    # Access wells normally
    protocol.comment(str(labware["A1"].top()))
```

## Importing into the Opentrons App

1. Open the Opentrons App and navigate to **More → Labware**.
2. Click **Import** and select the exported JSON file.
3. The labware appears in the custom labware list and is available in any protocol.

## Schema notes

- The `ordering` array columns are compacted onto single lines for readability.
- Well `z` is computed as `max(0, zDimension − depth)`.
- The `namespace` is always `custom_beta`.
- The `loadName` is sanitised to lowercase alphanumeric characters and underscores.
- `parameters.isTiprack` is always `false` in the current version.
