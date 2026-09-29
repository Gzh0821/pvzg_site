---
title: Plant fusion recipes
icon: toolbox
pageInfo: false
index: true
order: 14
---

Fusion uses the game's `EvolutionRecipes`; no additional JS is needed. Add this file to a datapack with `pack.json` to make planting Sunflower on Repeater produce `repeater_mgp`.

```json5
// jsons/objects/PlantProps.json5
{
  objects: [{
    objclass: 'PlantProperties',
    aliases: ['repeater'],
    objdata: {
      EvolutionRecipes: [{
        Name: 'my-pack:repeater-fusion',
        OtherPlantType: 'sunflower',
        TargetPlantType: 'repeater_mgp',
        MaxCount: 1,
      }],
    },
  }],
}
```

- `OtherPlantType` is the incoming plant type; `TargetPlantType` is the result.
- `Name` groups the quota. Exceeding a positive `MaxCount` reverts older plants in that group to their pre-fusion types. Different recipes can share a group.
- `ReadOthersCostume` reads the incoming plant's costume; verify that a custom result supports that costume.
- Recipes are directional. Define the reverse separately. `EvolutionRecipes` replaces the entire array, so include native recipes you want to retain. Multiple packs do not automatically append recipes.

## Custom plants

With the [official example](./gp-next-examples.md), put recipes in the plant's `properties.EvolutionRecipes` in `content/entities.json`. The framework owns these properties separately; ordinary `PlantProps` patches do not edit them.

References use the registered native codename, not the local ID, `package:id` or a numeric ID. Find the registered name in Data. The official content package's `pulse` is:

`gpn_6578616d706c652e656e746974792d636f6e74656e74_70756c7365`

Use it as `OtherPlantType` or `TargetPlantType`. Declare content package dependencies for cross-package references and enable the required entity framework, behaviors and resources. A recipe alone does not create plant assets. Reimport and restart after property or recipe changes.
