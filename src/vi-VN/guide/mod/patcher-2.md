---
title: Hướng dẫn GE Patcher (0.2.X)
icon: wrench
pageInfo: false
index: true
order: 11
---

<script setup>
    import { onMounted } from 'vue';
    onMounted(() => {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
    })
</script>

> [!caution]
> Tutorial dưới đây chỉ áp dụng cho các version `0.2.8.1`-`0.2.9`.

Game có sẵn tool GE Patcher, cho phép load custom JSON resources và levels.

## Yêu cầu

1. Cài đặt JSON editor (recommend: VSCode/Notepad++).
2. Đảm bảo game version ≥ 0.2.8.1.
3. Hiểu cơ bản về JSON, như syntax và data types.
4. Làm quen với cấu trúc thuộc tính của cây, zombie, v.v. trong JSON (xem [Tham khảo Thuộc tính](format.md)).

<ins class="adsbygoogle"
     style="display:block"
     data-ad-client="ca-pub-2336226859954206"
     data-ad-slot="6758794743"
     data-ad-format="auto"
     data-full-width-responsive="true">
</ins>

## GE Patcher cơ bản

Nhấn `F12` khi game khởi động để mở developer interface. Trong tab console, bạn sẽ thấy output kiểu như:

```
[GE Patcher] BaseDir: C:\Users\admin\AppData\Local\com.pvzge.app
```

Nhập command sau để xem help trong game, bao gồm paths cho custom JSON files:

```javascript
gePatcher.help()
```

Sau khi game load xong, chạy command này để load tất cả custom JSON files:

```javascript
gePatcher.init()
```

**Chạy lại command này sau khi modify JSON files để apply changes.**

## Cấu trúc file

Tạo folder `patches` trong `com.pvzge.app` với cấu trúc sau:

```
patches/
└── jsons/
    ├── features/
    │   ├── PlantFeatures.json
    │   ├── ZombieFeatures.json
    │   ├── UpgradeFeatures.json
    │   └── StoreCommodityFeatures.json
    └── levels/
        └── [LevelName].json
```

Bỏ qua các file cho features không modify.

## Formats file

**PlantFeatures.json**: Thuộc tính cây (ví dụ cấu trúc):

```json
{
  "PLANTS": [
    {
      "CODENAME": "peashooter"
    }
  ],
  "SEEDCHOOSERDEFAULTORDER": ["peashooter", "sunflower"],
  "BASEUNLOCKLIST": ["peashooter", "sunflower"]
}
```

**ZombieFeatures.json**: Thuộc tính zombie (ví dụ cấu trúc):

```json
{
  "ZOMBIES": [
    {
      "CODENAME": "tutorial"
    }
  ]
}
```

**UpgradeFeatures.json**: Thuộc tính upgrade (ví dụ cấu trúc):

```json
{
  "UPGRADES": [
    {
      "CODENAME": "upgrade_starting_sun_lvl1"
    }
  ]
}
```

**StoreCommodityFeatures.json**: Thuộc tính store items.

#### Lưu ý quan trọng:

- Các array `PLANTS`, `ZOMBIES`, và `UPGRADES` define modifications cho entities có sẵn.
- `SEEDCHOOSERDEFAULTORDER` set thứ tự cây mặc định trong seed selector.
- `BASEUNLOCKLIST` define các cây được unlock sẵn.

## Modify Plants/Zombies/Upgrades

Với `PlantFeatures`, `ZombieFeatures`, và `UpgradeFeatures`, GE Patcher áp dụng các quy tắc xử lý sau.

Mỗi object trong array `PLANTS` (hoặc `ZOMBIES`, `UPGRADES`) được merge vào JSON gốc sau khi match bằng field `CODENAME`. Quy tắc merge như sau:

- **Array Elements**: Nếu type của thuộc tính là array, mỗi giá trị trong array sẽ được merge theo thứ tự elements. Nếu values trong array là objects, chúng sẽ được merge recursive. Nếu values trong array là basic types, chúng sẽ trực tiếp overwrite values trong JSON gốc.
- **Object Merging**: Nếu type của thuộc tính là object, sẽ thực hiện recursive merge. Nếu có properties với key giống nhau trong object, values trong JSON gốc sẽ bị overwrite trực tiếp.
- **Basic Attributes**: Với basic attributes có key giống nhau, overwrite trực tiếp, tức là replace value trong JSON gốc.

Với các fields khác, như `SEEDCHOOSERDEFAULTORDER`/`BASEUNLOCKLIST`, v.v., replace trực tiếp array gốc.

Do đó, với bất kỳ cây/zombie nào bạn muốn modify, bạn cần thêm một object trong array `PLANTS` (`ZOMBIES`) trong custom JSON file, và field `CODENAME` của object này phải khớp với tên cây gốc trong JSON.

Với các cây/zombie không cần modify, không cần thêm object này.

Trong một object cây/zombie, chỉ `CODENAME` là bắt buộc. Nếu các fields khác không điền, chúng sẽ giữ nguyên. Nếu cần modify, phải thêm các fields tương ứng.

> [!important]
>
> - Tránh modify các fields quan trọng như `ID` hoặc `_CARDSPRITENAME` để tránh crash.
> - **GE Patcher không thể tạo entities mới; nó chỉ modify các entities có sẵn.**

#### Ví dụ:

Để modify family của Peashooter thành "Fire", đổi background thành "epic", set cost của Sunflower thành 25, và giảm cooldown xuống 1 giây:

```json
{
  "PLANTS": [
    {
      "CODENAME": "peashooter",
      "OBTAINWORLD": "epic",
      "objdata": {
        "Family": "Fire"
      }
    },
    {
      "CODENAME": "sunflower",
      "objdata": {
        "SunCost": 25,
        "Cooldown": 1
      }
    }
  ]
}
```

## Modify Levels

Đặt custom level files trong `patches/jsons/levels/[LevelName].json`.

- Tên file phải khớp với level ID trong game (vd: `egypt1.json`).
- Dùng `gePatcher.showLevels()` để xem level IDs gốc (cần init GE Patcher trước).

## Modify Store

`StoreCommodityFeatures.json` replace các category store trong game:

```json
{
  "Plants": [], // Plants
  "Upgrade": [], // Upgrades
  "Gem": [], // Gem items (mua bằng coins)
  "Coin": [] // Coin items (mua bằng gems)
}
```

Bỏ qua các category không modify.

## Debug

1. Check console để tìm errors trong quá trình loading.
2. Các lỗi phổ biến:
   - ❌ `Failed to load...`: Lỗi JSON syntax.
   - ❌ `Level file not found`: Tên file không khớp.
3. Validate JSON dùng tools như [JSONLint](https://jsonlint.com/).
