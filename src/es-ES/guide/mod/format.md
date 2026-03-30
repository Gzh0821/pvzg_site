---
title: Tipos y campos
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
> Las propiedades en cursiva de las tablas son campos que normalmente no deberias modificar. Cambiarlos puede provocar cierres inesperados u otros problemas.

<ins class="adsbygoogle"
     style="display:block"
     data-ad-client="ca-pub-7637695321442015"
     data-ad-slot="7113006248"
     data-ad-format="auto"
     data-full-width-responsive="true">
</ins>

## Como usar esta pagina

Esta no es una introduccion para crear un mod desde cero. Es una pagina de referencia de campos.
Resulta mas util cuando:

- ya sabes que tipo de datos quieres editar, pero no conoces el nombre del campo
- ya exportaste un JSON del juego y quieres revisar para que sirve cada campo
- quieres ver que campos suelen aparecer en archivos comunes de `Features` o `Props`

Si aun no exportaste el JSON original, empieza por [Datos originales](./gp-next-json.md).

## Archivos relacionados con plantas

Los ejemplos siguientes usan Grapeshot para explicar la estructura de los JSON de plantas.

Los campos multilingues no deberian quitar claves de idioma necesarias ni anadir estructuras irrelevantes. El formato debe verse asi:

```json
{
  "en": "English",
  "zh": "中文"
}
```

### PlantFeatures.json

`PlantFeatures.json` contiene los datos basicos de caracteristicas de una planta.

Cada planta dentro del array `PLANTS` suele incluir campos como estos:

| Propiedad          | Ejemplo                                   | Descripcion                                                     |
| ------------------ | ----------------------------------------- | --------------------------------------------------------------- |
| **ID**             | 74                                        | ID unico de la planta dentro del juego                          |
| **NAME**           | `{ "en": "Grapeshot", "zh": "爆裂葡萄" }` | Nombre multilingue                                              |
| _\_CARDSPRITENAME_ | "grapeshot"                               | Nombre del recurso del icono de la carta                        |
| _CODENAME_         | "grapeshot"                               | Identificador unico usado por GP-Next para localizar y fusionar |
| _TYPE_             | `["plant", "lastStandDisallowed"]`        | Etiquetas de tipo de planta                                     |
| **OBTAINWORLD**    | "market"                                  | Mundo usado para la imagen de fondo                             |
| **ZENGARDEN**      | `{ "PlantPlace": "dirt" }`                | Configuracion de colocacion en Zen Garden                       |
| _COSTUME_          | 2                                         | Numero de apariencias                                           |

El array `SEEDCHOOSERDEFAULTORDER` define el orden por defecto de las plantas en la interfaz de seleccion. Cada elemento es un `CODENAME`.

El array `BASEUNLOCKLIST` contiene las plantas desbloqueadas por defecto. Cada elemento es un `CODENAME`.

### PlantAlmanac.json

`PlantAlmanac.json` contiene la informacion del almanaque de plantas.

Cada entrada dentro del array `objects` contiene `aliases`, `objclass` y `objdata`.

El array `aliases` contiene el `CODENAME` de la planta, que identifica a la planta objetivo. El valor de `objclass` es `PlantAlmanacProperties`.

`objdata` puede incluir campos como estos:

| Campo                 | Ejemplo / contenido                                                                                                           | Descripcion                      |
| --------------------- | ----------------------------------------------------------------------------------------------------------------------------- | -------------------------------- |
| _Elements_            | Multiples etiquetas como `SUNCOST`, `RECHARGE`, `DAMAGE`, `AREA`, `FAMILY`                                                   | Etiquetas clave del almanaque    |
| **Introduction**      | `{ "en": "...", "zh": "爆炸后向 8 个方向发射弹性葡萄子弹" }`                                                                  | Introduccion multilingue         |
| _Special_             | `{ "NAME": {"en":"...","zh":"..."}, "DESCRIPTION": {"en":"...","zh":"..."} }`                                                | Descripcion de mecanica especial |
| **Chat**              | `{"en":"...","zh":"..."}`                                                                                                     | Frase de personalidad            |
| **BriefIntroduction** | `{ "en": "Explodes...", "zh": "爆炸并发射弹射子弹" }`                                                                         | Resumen corto                    |
| **DisplayOffset**     | `{ "x": 0, "y": 0 }`                                                                                                          | Desplazamiento visual            |

### PlantProps.json

`PlantProps.json` contiene los valores de propiedades de la planta.

Cada entrada dentro del array `objects` contiene `aliases`, `objclass` y `objdata`.

El array `aliases` contiene el `CODENAME` de la planta, que identifica a la planta objetivo. El valor de `objclass` es `PlantProperties`.

`objdata` puede incluir campos como los siguientes. Tambien puedes consultar los Props efectivos de una planta en el [Almanaque](../../almanac/):

| Propiedad                     | Ejemplo     | Descripcion                        |
| ----------------------------- | ----------- | ---------------------------------- |
| **CannotBeSheepenedByWizard** | true        | Inmunidad al efecto oveja del mago |
| **Damage**                    | 1800        | Dano base                          |
| **Cooldown**                  | 35          | Enfriamiento en segundos           |
| **CooldownFrom**              | 1           | Valor inicial de enfriamiento      |
| **SunCost**                   | 150         | Coste de sol                       |
| **Toughness**                 | 300         | Vida base                          |
| **Family**                    | "Explosive" | Familia                            |
| **ImmuneToIceblock**          | true        | Inmunidad a congelacion / hielo    |

## Archivos relacionados con la tienda

`StoreCommodityFeatures.json` contiene la informacion de productos de la tienda. Incluye cinco arrays: `Plants`, `Upgrade`, `Gem`, `Coin` y `Zen`.

### Plants

El array `Plants` contiene entradas de productos de plantas.

| Campo                | Tipo   | Descripcion                     |
| -------------------- | ------ | ------------------------------- |
| _CommodityType_      | string | Valor fijo `"plant"`            |
| **CommodityName**    | string | `CODENAME` de la planta         |
| **CurrencyType**     | string | Tipo de moneda (`gem` o `coin`) |
| **CurrencyRequired** | number | Cantidad de moneda necesaria    |
| _UnlockLevel_        | string | Nivel de desbloqueo             |

**Ejemplo: producto de Snow Pea**

```json
{
  "CommodityType": "plant",
  "CommodityName": "snowpea",
  "CurrencyType": "gem",
  "CurrencyRequired": 25
}
```

### Upgrade

El array `Upgrade` contiene entradas de mejoras.

| Campo                | Tipo   | Descripcion                     |
| -------------------- | ------ | ------------------------------- |
| _CommodityType_      | string | Valor fijo `"upgrade"`          |
| **CommodityName**    | string | `CODENAME` de la mejora         |
| **CurrencyType**     | string | Tipo de moneda (`gem` o `coin`) |
| **CurrencyRequired** | number | Cantidad de moneda necesaria    |

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

El array `Gem` contiene productos de gemas.

| Campo                    | Descripcion                      |
| ------------------------ | -------------------------------- |
| _CommodityType_          | Valor fijo `"gem"`               |
| CommodityCount           | Numero de gemas entregadas       |
| **CurrencyType**         | Tipo de moneda (`gem` o `coin`)  |
| CurrencyRequired         | Cantidad de moneda necesaria     |
| _StackLevel_             | Nivel del paquete                |
| **CommodityDisplayName** | Nombre visible (multilingue)     |

**Ejemplo: paquete de gemas personalizado**

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

El array `Coin` contiene productos de monedas.

| Campo                    | Descripcion                      |
| ------------------------ | -------------------------------- |
| _CommodityType_          | Valor fijo `"coin"`              |
| CommodityCount           | Numero de monedas entregadas     |
| **CurrencyType**         | Tipo de moneda (`gem` o `coin`)  |
| CurrencyRequired         | Cantidad de moneda necesaria     |
| _StackLevel_             | Nivel del paquete                |
| **CommodityDisplayName** | Nombre visible (multilingue)     |

### Zen

El array `Zen` contiene productos de Zen Garden y tiene la misma estructura que `Gem` / `Coin`.

| Campo                    | Descripcion                       |
| ------------------------ | --------------------------------- |
| _CommodityType_          | Valor fijo `"zen"`                |
| CommodityCount           | Cantidad del recurso de Zen Garden |
| **CurrencyType**         | Tipo de moneda (`gem` o `coin`)   |
| CurrencyRequired         | Cantidad de moneda necesaria      |
| _StackLevel_             | Nivel del paquete                 |
| **CommodityDisplayName** | Nombre visible (multilingue)      |
