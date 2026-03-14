---
title: Referencia de propiedades
icon: file-invoice
pageInfo: false
index: true
order: 4
---

<script setup>
    import { onMounted } from 'vue';
    onMounted(() => {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
    })
</script>

> [!important]
> En las tablas, las propiedades en _cursiva_ son campos que probablemente no deberias modificar. Cambiarlos puede provocar errores o cierres del juego.

<ins class="adsbygoogle"
     style="display:block"
     data-ad-client="ca-pub-7637695321442015"
     data-ad-slot="7113006248"
     data-ad-format="auto"
     data-full-width-responsive="true">
</ins>

## Archivos de plantas

Abajo se muestra el formato de los archivos JSON de plantas, usando Grapeshot como ejemplo.

Las propiedades multilenguaje no pueden eliminarse ni ampliarse con campos extra. El formato debe ser:

```json
{
  "en": "English",
  "zh": "中文"
}
```

### PlantFeatures.json

El archivo PlantFeatures.json contiene las caracteristicas basicas de las plantas.

Cada planta en el array `PLANTS` incluye las siguientes propiedades:

| Propiedad          | Contenido de ejemplo                    | Descripcion                                                                                              |
| ------------------ | --------------------------------------- | -------------------------------------------------------------------------------------------------------- |
| **ID**             | 74                                      | ID unico de la planta en el juego                                                                        |
| **NAME**           | `{ "en": "Grapeshot", "zh": "爆裂葡萄" }` | Nombre multilenguaje, `en` para ingles y `zh` para chino                                                 |
| _\_CARDSPRITENAME_ | "grapeshot"                             | Nombre del recurso del icono de carta                                                                    |
| _CODENAME_         | "grapeshot"                             | Identificador unico de la planta (campo critico para merge en GE Patcher)                               |
| _TYPE_             | `["plant", "lastStandDisallowed"]`      | Tipo de planta:<br>- `plant`: planta normal<br>- `lastStandDisallowed`: no disponible en modo Last Stand |
| **OBTAINWORLD**    | "market"                                | Mundo donde se ubica la imagen de fondo                                                                  |
| **ZENGARDEN**      | `{ "PlantPlace": "dirt" }`            | Ubicacion de siembra en Zen Garden                                                                       |
| _COSTUME_          | 2                                       | Numero de disfraces                                                                                      |

El array `SEEDCHOOSERDEFAULTORDER` define el orden por defecto de plantas en el selector. Solo debe contener `CODENAME`.

El array `BASEUNLOCKLIST` contiene las plantas desbloqueadas por defecto para perfiles nuevos. Tambien usa `CODENAME`.

### PlantAlmanac.json

El archivo PlantAlmanac.json contiene informacion del almanaque de plantas.

Cada elemento en `objects` debe incluir `aliases`, `objclass` y `objdata`; de lo contrario puede que no se aplique en el juego.

`aliases` contiene el `CODENAME` de la planta. Actualmente solo se usa el primer elemento. `objclass` debe ser `PlantAlmanacProperties`.

`objdata` incluye propiedades del almanaque:

| Propiedad             | Valor/Contenido                                                                                                                                                     | Descripcion                                               |
| --------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------- |
| _Elements_            | Incluye varias propiedades:<br>- `SUNCOST` costo de sol<br>- `RECHARGE` recarga<br>- `DAMAGE` dano (1800)<br>- `AREA` alcance (3x3)<br>- `FAMILY` familia         | Etiquetas clave mostradas en el almanaque                |
| **Introduction**      | `{ "en": "...", "zh": "爆炸后向 8 个方向发射弹性葡萄子弹" }`                                                                                                    | Descripcion multilenguaje de la funcion                   |
| _Special_             | `{ "NAME": {"en":"...","zh":"..."}, "DESCRIPTION": {"en":"...","zh":"..."} }`                                                                  | Descripcion de mecanicas especiales                       |
| **Chat**              | `{"en":"...","zh":"..."}`                                                                                                                                   | Frases de personalidad multilenguaje                      |
| **BriefIntroduction** | `{ "en": "Explodes...", "zh": "爆炸并发射弹射子弹" }`                                                                                                           | Resumen corto multilenguaje                               |
| **DisplayOffset**     | `{ "x": 0, "y": 0 }`                                                                                                                                            | Desplazamiento de posicion en el almanaque                |

### PlantProps.json

El archivo PlantProps.json contiene propiedades de jugabilidad de plantas.

Cada elemento en `objects` incluye `aliases`, `objclass` y `objdata`, igual que en `PlantAlmanac.json`.

`aliases` contiene el `CODENAME` de la planta y solo se usa el primer elemento. `objclass` debe ser `PlantProperties`.

`objdata` incluye propiedades de jugabilidad. No todas las plantas tienen las mismas propiedades. Puedes consultar propiedades validas en [Almanac](../../almanac/).

| Propiedad                     | Valor/Contenido | Descripcion                                              |
| ---------------------------- | -------------- | -------------------------------------------------------- |
| **CannotBeSheepenedByWizard**| true           | Inmune a la habilidad de transformacion en oveja         |
| **Damage**                   | 1800           | Dano base                                                 |
| **Cooldown**                 | 35             | Tiempo de recarga (segundos)                             |
| **CooldownFrom**             | 1              | Inicio de la recarga                                     |
| **SunCost**                  | 150            | Sol requerido para plantar                               |
| **Toughness**                | 300            | Vida base de la planta                                   |
| **Family**                   | "Explosive"    | Familia (puede afectar bonos de familia)                 |
| **ImmuneToIceblock**         | true           | Inmune a congelacion (por ejemplo Ice Weasel Zombie)     |

## Archivos de tienda

`StoreCommodityFeatures.json` contiene informacion de la tienda, incluyendo cinco arrays: `Plants`, `Upgrade`, `Gem`, `Coin` y `Zen`.

### Plants

El array `Plants` contiene informacion de articulos de plantas.

| Propiedad            | Tipo   | Descripcion                            |
| -------------------- | ------ | -------------------------------------- |
| _CommodityType_      | string | Valor fijo "plant"                    |
| **CommodityName**    | string | CODENAME de la planta                  |
| **CurrencyType**     | string | Tipo de moneda ("gem" o "coin")     |
| **CurrencyRequired** | number | Cantidad de moneda requerida           |
| _UnlockLevel_        | string | Se desbloquea en cierto nivel          |

**Ejemplo: articulo de Snow Pea**

```json
{
  "CommodityType": "plant",
  "CommodityName": "snowpea",
  "CurrencyType": "gem",
  "CurrencyRequired": 25
}
```

### Upgrade

El array `Upgrade` contiene informacion de articulos de mejoras.

| Propiedad            | Tipo   | Descripcion                            |
| -------------------- | ------ | -------------------------------------- |
| _CommodityType_      | string | Valor fijo "upgrade"                  |
| **CommodityName**    | string | CODENAME del item de mejora            |
| **CurrencyType**     | string | Tipo de moneda ("gem" o "coin")     |
| **CurrencyRequired** | number | Cantidad de moneda requerida           |

**Ejemplo: mejora de pala**

```json
{
  "CommodityType": "upgrade",
  "CommodityName": "upgrade_sunshovel_lvl3",
  "CurrencyType": "gem",
  "CurrencyRequired": 20
}
```

### Gem

El array `Gem` contiene informacion de paquetes de gemas.

| Propiedad               | Descripcion                                 |
| ----------------------- | ------------------------------------------- |
| _CommodityType_         | Valor fijo "gem"                            |
| CommodityCount          | Cantidad de gemas obtenidas                 |
| **CurrencyType**        | Tipo de moneda ("gem" o "coin")           |
| CurrencyRequired        | Cantidad de moneda requerida                |
| _StackLevel_            | Nivel del paquete                           |
| **CommodityDisplayName**| Nombre mostrado del articulo (multilenguaje)|

**Ejemplo: ajustar un paquete de gemas**

```json
{
  "CommodityType": "gem",
  "CommodityCount": 10,
  "CurrencyType": "coin",
  "CurrencyRequired": 300000,
  "StackLevel": 4,
  "CommodityDisplayName": {
    "en": "Ultimate Gem Pack!",
    "zh": "终极钻石包！"
  }
}
```

### Coin

El array `Coin` contiene informacion de paquetes de monedas.

| Propiedad               | Descripcion                                 |
| ----------------------- | ------------------------------------------- |
| _CommodityType_         | Valor fijo "coin"                           |
| CommodityCount          | Cantidad de monedas obtenidas               |
| **CurrencyType**        | Tipo de moneda ("gem" o "coin")           |
| CurrencyRequired        | Cantidad de moneda requerida                |
| _StackLevel_            | Nivel del paquete                           |
| **CommodityDisplayName**| Nombre mostrado del articulo (multilenguaje)|

### Zen

El array `Zen` contiene informacion de recursos de Zen Garden. Su estructura es igual a `Gem`/`Coin`.

| Propiedad               | Descripcion                                 |
| ----------------------- | ------------------------------------------- |
| _CommodityType_         | Valor fijo "zen"                            |
| CommodityCount          | Cantidad de recursos de Zen Garden          |
| **CurrencyType**        | Tipo de moneda ("gem" o "coin")           |
| CurrencyRequired        | Cantidad de moneda requerida                |
| _StackLevel_            | Nivel del paquete                           |
| **CommodityDisplayName**| Nombre mostrado del articulo (multilenguaje)|
