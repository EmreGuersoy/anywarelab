# Well Groups

Every well belongs to a **group**. Groups appear as separate entries in the exported JSON `groups` array
and carry a shared `wellBottomShape` (derived from the first well in the group).

## Managing groups

- **Create** — click **+ New Group** at the bottom of the Well Groups section.
- **Activate** — click a group name to make it the active group; new wells are added to it.
- **Rename** — click the group name while it is selected and type a new name.
- **Delete** — click the ✕ button that appears when the group is selected.

!!! warning
    Deleting a group removes all of its wells. Use **Ctrl+Z** immediately to undo.

## Groups in the exported JSON

```json
"groups": [
  {
    "metadata": {
      "wellBottomShape": "flat",
      "displayName": "Wells"
    },
    "wells": ["A1", "B1", "C1", "..."]
  }
]
```

## Why use multiple groups?

- Assign different `wellBottomShape` values to different regions of the plate.
- Organise wells logically (e.g. sample wells vs. control wells).
- Copy a group of wells and paste them into a new group for mirrored layouts.
