---
title: Tham khảo Thuộc tính (0.2.X)
icon: file-invoice
pageInfo: false
index: true
order: 12
---

<script setup>
    import { onMounted } from 'vue';
    onMounted(() => {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
    })
</script>

> [!caution]
> Tutorial dưới đây chỉ áp dụng cho các version `0.2.8.1`-`0.2.9`.

> [!important]  
> Các thuộc tính in _nghiêng_ không recommend modify, vì thay đổi có thể gây crash game hoặc không ổn định.

<ins class="adsbygoogle"
     style="display:block"
     data-ad-client="ca-pub-2336226859954206"
     data-ad-slot="6758794743"
     data-ad-format="auto"
     data-full-width-responsive="true">
</ins>

## Thuộc tính Cây

Phần sau mô tả các thuộc tính cơ bản và thông tin almanac cho cây, lấy Grapeshot làm ví dụ.

Các fields đa ngôn ngữ phải giữ nguyên cấu trúc và không được xóa hoặc mở rộng. Format ví dụ:

```json
{
  "en": "English",
  "zh": "中文"
}
```

### Thông tin cơ bản

| Thuộc tính         | Giá trị ví dụ                             | Mô tả                                                                                                        |
| ------------------ | ----------------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| **ID**             | 74                                        | ID unique trong game cho cây.                                                                                |
| **NAME**           | `{ "en": "Grapeshot", "zh": "爆裂葡萄" }` | Tên đa ngôn ngữ. `en` cho tiếng Anh, `zh` cho tiếng Trung.                                                   |
| _\_CARDSPRITENAME_ | "grapeshot"                               | Tên resource icon thẻ (tương ứng với game asset files).                                                      |
| _CODENAME_         | "grapeshot"                               | Identifier unique cho GE Patcher merging.                                                                    |
| _TYPE_             | `["plant", "lastStandDisallowed"]`        | Loại cây:<br>- `plant`: Cây tiêu chuẩn<br>- `lastStandDisallowed`: Không được phép trong mode "Last Stand".  |
| **OBTAINWORLD**    | "market"                                  | World theme cho background của cây.                                                                          |
| **ZENGARDEN**      | `{ "PlantPlace": "dirt" }`                | Vị trí trồng trong Zen Garden:<br>- `dirt`: Đất thường.                                                      |
| _COSTUME_          | 2                                         | Số lượng costumes có sẵn.                                                                                    |

### Thông tin Almanac (ALMANAC)

Nội dung sau là sub-attribute của `ALMANAC` của cây, chứa thông tin encyclopedia của cây:

| Field                 | Giá trị/Nội dung                                                                                                                                             | Mô tả                                           |
| --------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------- |
| _Elements_            | Các thuộc tính hiển thị trong almanac:<br>- `SUNCOST`: Chi phí sun<br>- `RECHARGE`: Cooldown<br>- `DAMAGE`: Damage (1800)<br>- `AREA`: Phạm vi (3x3)<br>- `FAMILY`: Gia đình | Các thuộc tính chính hiển thị trong almanac.    |
| **Introduction**      | `{ "en": "...", "zh": "爆炸后向 8 个方向发射弹性葡萄子弹" }`                                                                                                  | Mô tả chức năng đa ngôn ngữ.                    |
| _Special_             | `{ "NAME": {"en":"...","zh":"..."}, "DESCRIPTION": {"en":"...","zh":"..."} }`                                                                                | Giải thích cơ chế đặc biệt.                     |
| **Chat**              | `{"en":"...","zh":"..."}`                                                                                                                                    | Quotes tính cách đa ngôn ngữ.                   |
| **BriefIntroduction** | `{ "en": "Explodes...", "zh": "爆炸并发射弹射子弹" }`                                                                                                         | Tóm tắt ngắn đa ngôn ngữ về chức năng.          |
| **DisplayOffset**     | `{ "x": 0, "y": 0 }`                                                                                                                                         | Offset vị trí để hiển thị trong almanac.        |

### Gameplay Data (objdata)

Nội dung sau là sub-attribute của `objdata` của cây, chứa game mechanics data của cây. Với objdata hợp lệ của mỗi cây, xem [Almanac](../../almanac/):

| Thuộc tính                    | Giá trị/Ví dụ | Mô tả                                                        |
| ----------------------------- | ------------- | ------------------------------------------------------------ |
| **CannotBeSheepenedByWizard** | true          | Miễn nhiễm ability "Sheepify" của Wizard Zombie.             |
| **Damage**                    | 1800          | Giá trị damage cơ bản.                                       |
| **Cooldown**                  | 35            | Thời gian cooldown (giây).                                   |
| **CooldownFrom**              | 1             | Giá trị cooldown ban đầu.                                    |
| **SunCost**                   | 150           | Chi phí sun để trồng.                                        |
| **Toughness**                 | 300           | Máu cơ bản.                                                  |
| **Family**                    | "Explosive"   | Thuộc gia đình (ảnh hưởng buffs dựa trên gia đình).          |
| **ImmuneToIceblock**          | true          | Miễn nhiễm hiệu ứng đóng băng (vd: attacks của Ice Weasel Zombie). |

### JSON gốc cho Grapeshot

```json
{
  "ID": 74,
  "NAME": {
    "en": "Grapeshot",
    "zh": "爆裂葡萄"
  },
  "_CARDSPRITENAME": "grapeshot",
  "CODENAME": "grapeshot",
  "TYPE": ["plant", "lastStandDisallowed"],
  "OBTAINWORLD": "market",
  "ZENGARDEN": {
    "PlantPlace": "dirt"
  },
  "COSTUME": 2,
  "ALMANAC": {
    "Elements": [
      {
        "TYPE": "SUNCOST"
      },
      {
        "TYPE": "RECHARGE"
      },
      {
        "TYPE": "DAMAGE",
        "VALUE": 1800
      },
      {
        "TYPE": "AREA",
        "SORT": {
          "en": "3x3",
          "zh": "3x3范围"
        }
      },
      {
        "TYPE": "FAMILY"
      }
    ],
    "Introduction": {
      "en": "Grapeshots explode and scatter bouncing projectiles in eight directions.",
      "zh": "爆裂葡萄爆炸后向 8 个方向发射弹性葡萄子弹。"
    },
    "Special": [
      {
        "NAME": {
          "en": "Usage",
          "zh": "用途"
        },
        "DESCRIPTION": {
          "en": "single use, instant",
          "zh": "一次性使用，立刻触发"
        }
      }
    ],
    "Chat": {
      "en": "\"Spa-BOOM!\" enthuses Grapeshot. \"You liked that? I got a million of 'em! Wa-POW! Buh-BLAM! Za-... um... Ker-... hmmm... Okay, I guess I've only got the three.\"",
      "zh": ""唏——啪——！"爆裂葡萄激情地吼道。"你喜欢吗？我还有上万种这样的声音呢。哇——噗——！啪——砰——！咂——……！额……，轰——……！嗯嗯……，好吧，我想就这三种了。""
    },
    "BriefIntroduction": {
      "en": "Explodes and scatters bouncing projectiles",
      "zh": "爆炸并发射弹射子弹"
    },
    "DisplayOffset": {
      "x": 0,
      "y": 0
    }
  },
  "objdata": {
    "CannotBeSheepenedByWizard": true,
    "Damage": 1800,
    "Cooldown": 35,
    "CooldownFrom": 1,
    "SunCost": 150,
    "Toughness": 300,
    "Family": "Explosive",
    "ImmuneToIceblock": true
  }
}
```

## Thuộc tính Store

### Hàng hóa Cây

| Field                | Type   | Mô tả                            |
| -------------------- | ------ | -------------------------------- |
| _CommodityType_      | string | Giá trị cố định: "plant".        |
| **CommodityName**    | string | CODENAME của cây.                |
| **CurrencyType**     | string | Loại tiền tệ ("gem" hoặc "coin").|
| **CurrencyRequired** | number | Số lượng tiền tệ cần.            |
| _UnlockLevel_        | string | Yêu cầu unlock level.            |

#### Ví dụ: Hàng hóa Snow Pea

```json
{
  "CommodityType": "plant",
  "CommodityName": "snowpea",
  "CurrencyType": "gem",
  "CurrencyRequired": 25
}
```

### Hàng hóa Upgrade

| Field                | Type   | Mô tả                            |
| -------------------- | ------ | -------------------------------- |
| _CommodityType_      | string | Giá trị cố định: "upgrade".      |
| **CommodityName**    | string | CODENAME của Upgrade.            |
| **CurrencyType**     | string | Loại tiền tệ ("gem" hoặc "coin").|
| **CurrencyRequired** | number | Số lượng tiền tệ cần.            |

#### Ví dụ: Shovel Upgrade

```json
{
  "CommodityType": "upgrade",
  "CommodityName": "upgrade_sunshovel_lvl3",
  "CurrencyType": "gem",
  "CurrencyRequired": 20
}
```

### Hàng hóa Gem

| Field                    | Mô tả                            |
| ------------------------ | -------------------------------- |
| _CommodityType_          | Giá trị cố định: "gem".          |
| CommodityCount           | Số gems nhận được.               |
| **CurrencyType**         | Loại tiền tệ ("gem" hoặc "coin").|
| CurrencyRequired         | Số lượng tiền tệ cần.            |
| _StackLevel_             | Tier bundle.                     |
| **CommodityDisplayName** | Tên hiển thị đa ngôn ngữ.        |

#### Ví dụ: Gem Bundle

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

### Hàng hóa Coin

| Field                    | Mô tả                            |
| ------------------------ | -------------------------------- |
| _CommodityType_          | Giá trị cố định: "coin".         |
| CommodityCount           | Số coins nhận được.              |
| **CurrencyType**         | Loại tiền tệ ("gem" hoặc "coin").|
| CurrencyRequired         | Số lượng tiền tệ cần.            |
| _StackLevel_             | Tier bundle.                     |
| **CommodityDisplayName** | Tên hiển thị đa ngôn ngữ.        |
