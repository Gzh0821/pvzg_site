---
title: Archivos de nivel
index: true
icon: feather
pageInfo: false
order: 1
---

> [!info]
> Ve a la pagina de [Creator's Garden](../../creator-garden/) para descargar archivos de nivel de ejemplo.

## Niveles personalizados

El archivo de nivel personalizado del juego "PvZ2 Gardendless" es similar al de la version original. Es un archivo de texto JSON/JSON5 con sufijo `.json` o `json5`, que contiene toda la informacion del nivel, incluyendo plantas, zombis, terreno, etc.

Comparado con la version original, el archivo de nivel de "PvZ2 Gardendless" agrega algunos campos nuevos para describir la informacion basica del nivel.

## JSON y JSON5

Los objetos usan `{}`, los arrays `[]` y los campos pares clave-valor. `.json` requiere comillas dobles y no permite comentarios ni comas finales; usa `.json5` para esas funciones. Los siguientes ejemplos describen campos de nivel; usa los datos reales del juego.

## Estructura del archivo de nivel

La estructura del archivo de nivel de "PvZ2 Gardendless" es la siguiente:

```json
{
  // Titulo del nivel
  "#comment": "Nivel de ejemplo",
  // Informacion basica del nivel
  "Information": {},
  "objects": [
    // Lista de configuraciones del nivel
    {},
    {}
  ],
  "version": 1
}
```

El campo `#comment` es el titulo del nivel. Al escribir un nivel, asegurate de que su titulo sea unico y no repetido. El campo `version` esta fijo en 1.
Abajo se muestran descripciones detalladas de otros campos.

## Campo Information

PvZ2 Gardendless agrega el campo de nivel superior `Information` para describir la informacion basica del nivel.
Este campo no afecta la funcionalidad del nivel personalizado en el juego, pero puede ayudar a los jugadores a entender rapidamente la informacion del nivel que escribiste.

Este campo contiene lo siguiente:

```json
"Information": {
  // UUID del nivel
  "uuid": "c58a208a-a5e3-4cfa-9bc3-cc7fbb08c2e3",
  // Nombre del nivel
  "name": {
      "en": "SampleLevel",
      "zh-CN": "示例关卡"
  },
  // Autor del nivel
  "Author": "LMYY",
  // Opcional, enlace del autor
  "AuthorLink": "https://github.com/Gzh0821",
  // Descripcion del nivel
  "Introduction": {
      "en": "This is a sample level.",
      "zh-CN": "这是一个示例关卡。"
  },
  // Version del juego compatible
  "GameVersion": "0.1.1",
  // Version del nivel
  "Version": "1.0",
  // Fecha de creacion del nivel
  "CreatedAt": "2022-03-08",
  // Fecha de actualizacion del nivel
  "UpdatedAt": "2022-03-08",
  // Dificultad del nivel, valores opcionales: Easy, Normal, Hard, Expert
  "Difficulty": "Easy",
  // Categoria del nivel
  "Category": "Survival"
},
```

`uuid` es el identificador unico del nivel y se usa para distinguir distintos niveles. Asegura la unicidad del `uuid` de tu nivel.
Para obtener un `uuid` aleatorio, puedes usar una herramienta en linea como [UUID Generator](https://www.uuidgenerator.net/).

## Campo objects

objects es una lista en la que cada elemento representa una configuracion concreta del nivel. Hay multiples objetos en la lista y cada objeto corresponde a un item de configuracion. A continuacion se muestra un ejemplo de lista objects:

```json
"objects": [
  {
    // Item de configuracion: ajustes basicos del nivel
    "objclass": "LevelDefinition",
    // Ajustes basicos del nivel
    "objdata": {
      // Descripcion del nivel
      "Description": "~",
      // Numero de nivel, usado en series de niveles
      "LevelNumber": 1,
      // Mantener el valor por defecto
      "Loot": "RTID(DefaultLoot@LevelModules)",
      // Modo de juego del nivel, aqui se da el modo basico
      "Modules": [
        "RTID(ZombiesDeadWinCon@LevelModules)",
        "RTID(DefaultZombieWinCondition@LevelModules)",
        "RTID(NewWaves@CurrentLevel)",
        "RTID(SeedBank@CurrentLevel)"
      ],
      // Nombre del nivel mostrado en el juego
      "Name": "Bank theft 1",
      // Opcional: soporte multilenguaje
      "NameMultiLanguage": {
        "en": "Bank theft I",
        "zh": "银行失窃I"
      },
      // Autor, se recomienda que coincida con Information.Author
      "WritenBy": "保罗_刘",
      // Actualmente sin uso: relacionado con drops
      "NormalPresentTable": "egypt_normal_01",
      "ShinyPresentTable": "egypt_shiny_01",
      // Escenario del nivel, formato: RTID(nombre del mundo Stage@LevelModules)
      "StageModule": "RTID(TutorialStage@LevelModules)"
    }
  },
  // Configuracion para cada modo de juego:
  {
    "aliases": [
      "SeedBank"
    ],
    "objclass": "SeedBankProperties",
    "objdata": {
      "PresetPlantList": [
        {
          "Level": -1,
          "PlantType": "peashooter"
        }
      ],
      "SelectionMethod": "chooser"
    }
  },
  {
    "aliases": [
      "NewWaves"
    ],
    "objclass": "WaveManagerModuleProperties",
    "objdata": {
      "WaveManagerProps": "RTID(WaveManagerProps@CurrentLevel)"
    }
  },
  {
    "aliases": [
      "WaveManagerProps"
    ],
    "objclass": "WaveManagerProperties",
    "objdata": {
      "FlagWaveInterval": 1,
      "WaveCount": 1,
      "Waves": [
        [
          "RTID(Wave1@CurrentLevel)"
        ]
      ]
    }
  },
  {
    "aliases": [
      "Wave1"
    ],
    "objclass": "SpawnZombiesJitteredWaveActionProps",
    "objdata": {
      "AdditionalPlantfood": 0,
      "Zombies": [
        {
          "Type": "RTID(tutorial@ZombieTypes)"
        }
      ]
    }
  }
]
```
