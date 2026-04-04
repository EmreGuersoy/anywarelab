# Well Properties

Select one or more wells to reveal the **Well Properties** section in the right panel.
Editing any property applies it to **all selected wells simultaneously**.

## Properties

| Property | Unit | Description |
|---|---|---|
| Shape | — | `Circular` or `Rectangular` |
| Diameter | mm | Well diameter (circular only) |
| Length (X) | mm | Well dimension along X axis (rectangular only) |
| Width (Y) | mm | Well dimension along Y axis (rectangular only) |
| Depth (Z) | mm | Depth of the well from its top rim downward |
| Volume | µL | Maximum liquid volume the well can hold |
| Bottom | — | `Flat`, `U-bottom`, or `V-bottom` |

## Z position in the exported JSON

The `z` field for each well in the exported JSON is:

```
z = max(0, zDimension − depth)
```

This represents the height of the **well bottom** above the deck surface.

## Multi-well selection

When more than one well is selected, the properties panel shows the values of the **first selected well**.
Changes apply to all selected wells. Use the **anchor** dropdown in the Edge Offsets sub-section to
control which well is used as the positional reference.
