# Boundary Constraints

Anywarelab continuously validates all well positions against the plate footprint and highlights violations.

## Violation types

| Indicator | Condition | Meaning |
|---|---|---|
| 🔴 Red ring | Well **centre** is outside the footprint | The pipette cannot reliably access this well |
| 🟠 Orange ring | Centre is inside but one or more **edges** cross the boundary | Well geometry partially exits the plate |

## Canvas overlay

A summary badge at the bottom of the canvas shows the total count of each violation type.
It disappears automatically when all wells are within bounds.

## Export behaviour

Both violation types are exported to JSON as-is. Anywarelab does **not** block export of invalid labware,
allowing you to iterate freely. Fix violations before uploading a definition to a robot.

!!! warning
    The Opentrons App may reject or behave unexpectedly with labware containing wells whose centres
    are outside the declared footprint.
