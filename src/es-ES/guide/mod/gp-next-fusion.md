---
title: Recetas de fusión de plantas
icon: toolbox
pageInfo: false
index: true
order: 14
---

La fusión usa `EvolutionRecipes` del juego; no necesita JS adicional. Añade este archivo a un paquete con `pack.json` para que plantar Girasol sobre Repetidora produzca `repeater_mgp`.

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

- `OtherPlantType`: planta que se coloca; `TargetPlantType`: resultado.
- `Name`: grupo del límite. Si se supera un `MaxCount` positivo, las fusiones anteriores del grupo vuelven a su tipo previo. Varias recetas pueden compartir grupo.
- `ReadOthersCostume`: lee el traje de la planta añadida; comprueba que el resultado personalizado lo admite.
- La receta tiene dirección; define la inversa por separado. El array `EvolutionRecipes` se sustituye completo. Incluye las recetas originales que quieras conservar; varios paquetes no añaden recetas automáticamente.

## Plantas personalizadas

Con el [ejemplo oficial](./gp-next-examples.md), escribe las recetas en `properties.EvolutionRecipes` de la planta en `content/entities.json`. El framework gestiona estas propiedades por separado; los parches normales de `PlantProps` no las modifican.

Usa el codename nativo registrado, no el ID local, `paquete:id` ni un ID numérico. Consulta el nombre registrado en Datos. Para `pulse` del paquete oficial:

`gpn_6578616d706c652e656e746974792d636f6e74656e74_70756c7365`

Úsalo como `OtherPlantType` o `TargetPlantType`. Declara las dependencias de contenido entre paquetes y activa los frameworks, comportamientos y recursos necesarios. Una receta no crea recursos de plantas. Tras cambiar propiedades o recetas, importa de nuevo y reinicia.
