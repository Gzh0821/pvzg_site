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

## Archivo JSON

Si ya conoces el formato de archivo JSON, puedes saltar esta seccion.

JSON (JavaScript Object Notation) es un formato ligero de intercambio de datos, facil de leer y escribir. Usa pares clave-valor para representar datos y normalmente se utiliza para transmitir informacion entre cliente y servidor. Las estructuras de datos en JSON incluyen objetos, arreglos, cadenas, numeros, valores booleanos y null.

- Objetos: se escriben entre `{}` y contienen pares clave-valor.

- Arreglos: se escriben entre `[]` y contienen multiples valores.

- Cadenas: se escriben entre comillas dobles `""`.

- Valores booleanos: `true` o `false`.

- Numero: entero o decimal.

- null: representa un valor nulo.

> [!warning]
> Los archivos JSON no admiten comentarios. Cuando uses el codigo JSON proporcionado en este sitio, usa el formato `JSON5` mencionado abajo o elimina los comentarios que empiezan con `//`.

Ejemplo:

```json
{
  // Elimina este comentario al usar el codigo JSON
  "name": "Alice",
  "age": 25,
  "isStudent": false,
  "skills": ["JavaScript", "Python", "HTML"],
  "address": {
    "city": "New York",
    "zipCode": "10001"
  }
}
```

En este ejemplo:

`name` es de tipo cadena, y `age` es de tipo numero. `isStudent` es de tipo booleano. `skills` es un arreglo de cadenas. `address` es un objeto que contiene city y zipCode.

Para una explicacion mas detallada del formato JSON, consulta [aqui](https://www.json.org/json-en.html).

## Archivo JSON5

> [!important]
> Puedes usar el formato JSON5 al escribir archivos de nivel. Usa `.json5` como sufijo del archivo para distinguirlo del archivo `json` normal.

JSON5 es una extension basada en JSON (JavaScript Object Notation). Su objetivo es mejorar la legibilidad y facilidad de uso de JSON manteniendo la compatibilidad. JSON5 permite usar una sintaxis mas flexible y adaptarse a mas escenarios sin romper el estandar existente.

JSON5 introduce cierta flexibilidad para que los archivos de configuracion o formatos de intercambio de datos sean mas faciles de escribir y entender. Estas son sus principales caracteristicas:

### Nombres de clave mas flexibles

En JSON estandar, las claves deben ir entre comillas dobles; en JSON5, las claves pueden ir sin comillas o incluso usar comillas simples.

```json5
{
  unquoted: 'Esto esta permitido en JSON5',
  singleQuotes: 'Esto tambien esta permitido'
}
```

### Coma final

En JSON5, puedes agregar una coma despues del ultimo elemento de un objeto o arreglo, lo cual es muy comodo al editar.

```json5
{
  key: 'value',
  anotherKey: 42 // Permite coma final
}
```

### Soporte de comentarios

JSON5 admite comentarios de una linea y de multiples lineas, similar a JavaScript. JSON estandar no permite comentarios, mientras que JSON5 permite agregar anotaciones adicionales en los archivos de datos.

```json5
{
  // Este es un comentario de una linea
  key: 'value',

  /*
  Este es un comentario multilinea
  Puede explicar una configuracion compleja
  */
  anotherKey: 42
}
```

### Cadenas flexibles

JSON5 admite cadenas con comillas simples y con comillas dobles.

```json5
{
  singleQuotes: 'Esta es una cadena',
  doubleQuotes: 'Esta tambien es una cadena'
}
```

JSON5 permite usar saltos de linea en cadenas. A diferencia de JSON, no exige usar `\n` para representar nuevas lineas. Al mismo tiempo, tambien se pueden usar caracteres de escape en las cadenas.

```json5
{
  longString: 'Esta es una cadena muy larga que \
  ocupa multiples lineas\t'
}
```

### Tipos de datos adicionales

JSON5 soporta mas formatos numericos, como notacion hexadecimal y valores de infinito positivo o negativo (`Infinity`), ademas de `NaN` (Not-a-Number).

```json5
{
  decimal: 123,
  hexadecimal: 0x7b,
  infinity: Infinity,
  notANumber: NaN
}
```

### Representacion numerica mas flexible

Puedes omitir ceros en la parte entera o en la parte decimal.

```json5
{
  fractional: 0.5, // equivalente a 0.5
  trailing: 2 // equivalente a 2.0
}
```

Para mas informacion sobre JSON5, consulta [aqui](https://json5.org/).

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
