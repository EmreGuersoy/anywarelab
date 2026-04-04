# Labware Types

The labware type sets the `displayCategory` in the exported JSON and controls the naming of placement tools.

| Type | JSON category | Single tool | Grid tool |
|---|---|---|---|
| Well Plate | `wellPlate` | Add Well | Add Grid |
| Reservoir | `reservoir` | Add Reservoir | Add Grid |
| Tube Rack | `tubeRack` | Add Tube | Add Tube Grid |
| Tip Rack | `tipRack` | Add Tip | Add Tip Grid |

!!! note
    Changing the labware type after placing wells only updates the export category and tool labels.
    It does **not** reposition or resize existing wells.

## When to use each type

**Well Plate** — Multi-well plates for cell culture, PCR, or assays (e.g. 96-well, 384-well).

**Reservoir** — Single- or multi-column troughs used for distributing reagents with multichannel pipettes.

**Tube Rack** — Racks that hold conical tubes (15 mL, 50 mL) or microcentrifuge tubes (1.5 mL, 2 mL).

**Tip Rack** — Tip boxes compatible with single-channel or multi-channel pipettes.
