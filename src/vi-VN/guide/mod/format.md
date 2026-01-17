---
title: Tham khảo Properties (mới nhất)
icon: file-invoice
pageInfo: false
index: true
order: 2
---

<script setup>
    import { onMounted } from 'vue';
    onMounted(() => {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
    })
</script>

> [!warning]
> Tutorial dưới đây chỉ hoạt động với các version `0.3.X`-`0.6.X`.

> [!important]
> Trong các bảng, các properties in _nghiêng_ là những properties bạn không nên modify. Thay đổi chúng có thể làm game crash hoặc bug.

<ins class="adsbygoogle"
     style="display:block"
     data-ad-client="ca-pub-2336226859954206"
     data-ad-slot="6758794743"
     data-ad-format="auto"
     data-full-width-responsive="true">
</ins>

## Files Cây

Dưới đây là format của các file JSON cây, lấy Grapeshot làm ví dụ.

Các properties có giá trị đa ngôn ngữ không được xóa hoặc thêm field. Format phải như sau:

```json
{
  "en": "English",
  "zh": "中文"
}
```

### PlantFeatures.json

File PlantFeatures.json chứa các đặc điểm cơ bản của cây.

Mỗi cây trong array `PLANTS` bao gồm các properties sau:

| Property           | Nội dung ví dụ                            | Mô tả                                                                                                    |
| ------------------ | ----------------------------------------- | -------------------------------------------------------------------------------------------------------- |
| **ID**             | 74                                        | Giá trị ID unique của cây trong game                                                                     |
| **NAME**           | `{ "en": "Grapeshot", "zh": "爆裂葡萄" }` | Tên đa ngôn ngữ, `en` cho tiếng Anh, `zh` cho tiếng Trung                                                |
| _\_CARDSPRITENAME_ | "grapeshot"                               | Tên resource icon thẻ (tương ứng với file resource game)                                                 |
| _CODENAME_         | "grapeshot"                               | Identifier unique cho cây (field quan trọng, dùng cho GE Patcher merge)                                  |
| _TYPE_             | `["plant", "lastStandDisallowed"]`        | Loại cây:<br>- `plant`: Cây thường<br>- `lastStandDisallowed`: Không thể dùng trong mode "Last Stand"    |
| **OBTAINWORLD**    | "market"                                  | World nơi background image nằm                                                                           |
| **ZENGARDEN**      | `{ "PlantPlace": "dirt" }`                | Vị trí trồng trong Zen Garden:<br>- `dirt`: Đất thường                                                   |
| _COSTUME_          | 2                                         | Số lượng costume                                                                                         |

Array `SEEDCHOOSERDEFAULTORDER` dùng để chỉ định thứ tự mặc định của cây trong giao diện chọn. Nó chỉ nên có `CODENAME` của cây và thứ tự trong array là thứ tự chúng sẽ xuất hiện trong almanac, seed chooser, v.v.

Array `BASEUNLOCKLIST` chứa các cây mà player profile mới tạo có sẵn. Nó cũng dùng `CODENAME` của cây.

### PlantAlmanac.json

File PlantAlmanac.json chứa thông tin Almanac cho cây.

Mỗi item trong array `objects` nên include `aliases`, `objclass`, và `objdata`, nếu không có thể không thay đổi trong game.

Array `aliases` chứa `CODENAME` của cây, dùng để chỉ định cây tương ứng cho object này. Hiện tại chỉ item đầu tiên được đọc. Giá trị của `objclass` là `PlantAlmanacProperties`, cho biết object này modify một entry almanac cây.

`objdata` bao gồm các properties Almanac sau:

| Property              | Giá trị/Nội dung                                                                                                                                            | Mô tả                                          |
| --------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------- |
| _Elements_            | Chứa nhiều properties:<br>- `SUNCOST`:Chi phí sun<br>- `RECHARGE`:Cooldown<br>- `DAMAGE`:Giá trị damage (1800)<br>- `AREA`:Phạm vi (3x3)<br>- `FAMILY`:Gia đình | Các tag property chính hiển thị trong Almanac |
| **Introduction**      | `{ "en": "...", "zh": "爆炸后向 8 个方向发射弹性葡萄子弹" }`                                                                                                 | Mô tả đa ngôn ngữ về chức năng cây             |
| _Special_             | `{ "NAME": {"en":"...","zh":"..."}, "DESCRIPTION": {"en":"...","zh":"..."} }`                                                                               | Mô tả cơ chế đặc biệt                          |
| **Chat**              | `{"en":"...","zh":"..."}`                                                                                                                                   | Đa ngôn ngữ, các câu nói tính cách của cây     |
| **BriefIntroduction** | `{ "en": "Explodes...", "zh": "爆炸并发射弹射子弹" }`                                                                                                        | Đa ngôn ngữ, tóm tắt ngắn về chức năng         |
| **DisplayOffset**     | `{ "x": 0, "y": 0 }`                                                                                                                                        | Offset vị trí hiển thị (điều chỉnh tọa độ trong Almanac) |

### PlantProps.json

File PlantProps.json chứa các properties gameplay của cây.

Mỗi item trong array `objects` bao gồm `aliases`, `objclass`, và `objdata`, giống như trong `PlantAlmanac.json`.

Array `aliases` chứa `CODENAME` của cây, dùng để chỉ định cây tương ứng cho object này. Một lần nữa, chỉ entry đầu tiên được đọc. Giá trị của `objclass` là `PlantProperties`, cho biết object này modify các properties gameplay của cây.

`objdata` bao gồm các properties sau, nhưng một số cây có properties mà cây khác không có. Các properties hợp lệ cho mỗi cây có thể xem trong [Almanac](../../almanac/).

| Property                      | Giá trị/Nội dung | Mô tả                                                   |
| ----------------------------- | ---------------- | ------------------------------------------------------- |
| **CannotBeSheepenedByWizard** | true             | Miễn nhiễm skill "biến thành cừu" của Wizard Zombie     |
| **Damage**                    | 1800             | Giá trị damage cơ bản                                   |
| **Cooldown**                  | 35               | Thời gian cooldown (đơn vị: giây)                       |
| **CooldownFrom**              | 1                | Thời gian bắt đầu cooldown (giá trị cooldown ban đầu)   |
| **SunCost**                   | 150              | Sun cần để trồng                                        |
| **Toughness**                 | 300              | Điểm máu cơ bản của cây                                 |
| **Family**                    | "Explosive"      | Gia đình (có thể ảnh hưởng hiệu ứng bonus gia đình)     |
| **ImmuneToIceblock**          | true             | Miễn nhiễm hiệu ứng đóng băng (vd: Ice Weasel Zombie)   |

## Files Store

File `StoreCommodityFeatures.json` chứa thông tin hàng hóa trong store, bao gồm 4 array: `Plants`, `Upgrade`, `Gem`, và `Coin`, đại diện cho các loại thông tin hàng hóa khác nhau.

### Plants

Array `Plants` chứa thông tin về hàng hóa cây.

| Property             | Type   | Mô tả                            |
| -------------------- | ------ | -------------------------------- |
| _CommodityType_      | string | Giá trị cố định "plant"          |
| **CommodityName**    | string | CODENAME của cây                 |
| **CurrencyType**     | string | Loại tiền tệ ("gem" hoặc "coin") |
| **CurrencyRequired** | number | Số lượng tiền tệ cần             |
| _UnlockLevel_        | string | Unlock ở một level nhất định     |

**Ví dụ: Hàng hóa Snow Pea**

```json
{
  "CommodityType": "plant",
  "CommodityName": "snowpea",
  "CurrencyType": "gem",
  "CurrencyRequired": 25
}
```

### Upgrade

Array `Upgrade` chứa thông tin về hàng hóa upgrade cây.

| Property             | Type   | Mô tả                            |
| -------------------- | ------ | -------------------------------- |
| _CommodityType_      | string | Giá trị cố định "upgrade"        |
| **CommodityName**    | string | CODENAME của upgrade item        |
| **CurrencyType**     | string | Loại tiền tệ ("gem" hoặc "coin") |
| **CurrencyRequired** | number | Số lượng tiền tệ cần             |

**Ví dụ: Shovel Upgrade**

```json
{
  "CommodityType": "upgrade",
  "CommodityName": "upgrade_sunshovel_lvl3",
  "CurrencyType": "gem",
  "CurrencyRequired": 20
}
```

### Gem

Array `Gem` chứa thông tin về hàng hóa Gem.

| Property                 | Mô tả                                |
| ------------------------ | ------------------------------------ |
| _CommodityType_          | Giá trị cố định "gem"                |
| CommodityCount           | Số lượng Gem nhận được               |
| **CurrencyType**         | Loại tiền tệ ("gem" hoặc "coin")     |
| CurrencyRequired         | Số lượng tiền tệ cần                 |
| _StackLevel_             | Level gói hàng                       |
| **CommodityDisplayName** | Tên hiển thị hàng hóa (đa ngôn ngữ)  |

**Ví dụ: Điều chỉnh Gem Pack**

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

Array `Coin` chứa thông tin về hàng hóa Coin.

| Property                 | Mô tả                                |
| ------------------------ | ------------------------------------ |
| _CommodityType_          | Giá trị cố định "coin"               |
| CommodityCount           | Số lượng Coin nhận được              |
| **CurrencyType**         | Loại tiền tệ ("gem" hoặc "coin")     |
| CurrencyRequired         | Số lượng tiền tệ cần                 |
| _StackLevel_             | Level gói hàng                       |
| **CommodityDisplayName** | Tên hiển thị hàng hóa (đa ngôn ngữ)  |
