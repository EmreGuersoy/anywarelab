# Coordinate System

Anywarelab uses the **Opentrons coordinate convention** throughout the editor and the exported JSON.

## Axes

| Axis | Direction | Origin |
|---|---|---|
| X | Left → Right | Left edge of the plate footprint |
| Y | Front → Back (toward the robot arm) | Front edge of the plate footprint |
| Z | Deck surface → Up | Deck surface |

## Canvas orientation

On the canvas, Y is displayed with the **front edge at the bottom** and the **back edge at the top** —
matching how you physically look down at the deck from above.

```
Back  (Y = yDimension)
┌─────────────────────┐
│   A1  A2  A3 ...   │
│   B1  B2  B3 ...   │
│         ...         │
│   H1  H2  H3 ...   │
└─────────────────────┘
Front (Y = 0)
Left (X=0)        Right (X=xDimension)
```

## Well labelling

Well labels follow the Opentrons convention:

- **Row letter** A–H: Y axis, back to front (A = highest Y, H = lowest Y)
- **Column number** 1–12: X axis, left to right

Labels are assigned globally across all groups based on position, ensuring unique and
position-consistent identifiers in the exported JSON.
