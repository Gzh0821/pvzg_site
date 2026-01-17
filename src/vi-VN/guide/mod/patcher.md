---
title: Hướng dẫn GE Patcher (mới nhất)
icon: wrench
pageInfo: false
index: true
order: 1
---

<script setup>
    import { onMounted } from 'vue';
    onMounted(() => {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
    })
</script>

> [!warning]
> Tutorial dưới đây chỉ áp dụng cho các version `0.3.X`-`0.6.X`.

GE Patcher là tool dùng để modify game data của PvZ2 Gardendless, support custom cây cối, zombie, grid items (GridItem), đạn (Projectile), upgrades, hàng trong shop và level.

Recommend dùng bản GE Patcher có sẵn (đã include trong bản release chính thức).

## Yêu cầu

1. JSON Editor (recommend VSCode/Notepad++)
2. Game Version ≥ 0.3.0
3. Về cấu trúc JSON properties của cây, zombie, v.v., xem [Tham khảo Properties](format.md)

<ins class="adsbygoogle"
style="display:block"
data-ad-client="ca-pub-2336226859954206"
data-ad-slot="6758794743"
data-ad-format="auto"
data-full-width-responsive="true">
</ins>

## GE Patcher cơ bản

Mở developer interface bằng cách nhấn "F12" khi game khởi động. Trong tab Console, bạn sẽ thấy output kiểu như sau:

```text
[GE Patcher] BaseDir: C:\Users\admin\AppData\Local\com.pvzge.app
```

Path trên là thư mục chính của GE Patcher (ví dụ). Chạy command sau trong console để xem help và output patches directory:

```javascript
gePatcher.help()
```

GE Patcher cũng tự động load module cloud save (`window.cloudSaver`).

Sau khi game load xong, chạy các command sau để load/apply patches:

```javascript
// Load base assets, không load patch files
gePatcher.initBase()

// Sau khi gọi initBase, bạn có thể gọi initPatchs() để load patch files
// Gọi lại function này để apply changes sau khi modify file JSON
gePatcher.initPatchs()

// Load cả base assets và patch files, tương đương gộp 2 bước trên
gePatcher.init()
```

Các function phổ biến khác:

```javascript
// List các level ID gốc trong game
gePatcher.showLevels()

// Set custom frame rate (thao tác nguy hiểm, có thể gây crash hoặc lag)
gePatcher.setFrameRate(30)

// Modify một property của một entity (ví dụ)
gePatcher.setPropsData('PlantProps', 'peashooter', 'ShootInterval', 1.2)

// Merge nhiều properties (pass object)
gePatcher.setPropsData('PlantProps', 'peashooter', { ShootInterval: 1.2, SunCost: 75 })

// Quản lý và export data
gePatcher.listOrigins()             // List các JSON data gốc đã lưu
gePatcher.exportJson('PlantFeatures', false) // Export data PlantFeatures hiện tại (arg thứ 2 true export JSON gốc, arg thứ 3 true download file, false output ra console)
gePatcher.restoreOriginal('PlantFeatures')   // Restore PlantFeatures về JSON data gốc
gePatcher.restoreAll()              // Restore tất cả data
```

## Cấu trúc file

Tạo folder `patches` trong `com.pvzge.app` với cấu trúc như sau:

```
patches/
└── jsons/
    ├── features/
    │   ├── PlantFeatures.json
    │   ├── PlantProps.json
    │   ├── PlantAlmanac.json
    │   ├── PlantTypes.json
    │   ├── ZombieFeatures.json
    │   ├── ZombieProps.json
    │   ├── ZombieAlmanac.json
    │   ├── ZombieTypes.json
    │   ├── BoardGridMaps.json
    │   ├── ProjectileProps.json
    │   ├── ProjectileTypes.json
    │   ├── UpgradeFeatures.json
    │   ├── PropertySheets.json
    │   ├── NarrativeList.json
    │   └── StoreCommodityFeatures.json
    └── levels/
        └── [LevelName].json
```

Mô tả:

- Folder `features` chứa các file Features/Props/Types/Almanac để modify metadata và behavior của các entity trong game.
- Các file modify nội dung gốc không cần tạo nếu không thay đổi gì.

## Files Features

Files Features dùng để merge các thay đổi metadata cho entities (cây, zombie, grid items, upgrades, v.v.).

### Ví dụ Features phổ biến

**PlantFeatures.json** (Ví dụ):

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

**ZombieFeatures.json** (Ví dụ):

```json
{
  "ZOMBIES": [
    {
      "CODENAME": "tutorial"
    }
  ]
}
```

**UpgradeFeatures.json** (Ví dụ):

```json
{
  "UPGRADES": [
    {
      "CODENAME": "upgrade_starting_sun_lvl1"
    }
  ]
}
```

**GridItemFeatures.json / StoreCommodityFeatures.json**, v.v., có cấu trúc tương tự, cung cấp CODENAME/Identifier của item cần modify theo cấu trúc game gốc.

### Quy tắc merge Features (Tóm tắt)

- Match entities hiện có bằng CODENAME (hoặc identifier tương ứng), sau đó merge object user cung cấp với object gốc.
- Các field kiểu primitive sẽ bị overwrite trực tiếp; kiểu object sẽ merge recursive; kiểu array sẽ merge theo thứ tự element (nếu element trong array là primitive, chúng sẽ bị overwrite).
- Với các field array top-level như `SEEDCHOOSERDEFAULTORDER`, `BASEUNLOCKLIST`, array gốc sẽ bị replace trực tiếp.

Quan trọng: GE Patcher chỉ modify entities có sẵn và không tạo entity mới. Cố gắng tránh modify các identifier quan trọng (vd: `ID`, `_CARDSPRITENAME`, v.v.).

## Files Props / Almanac / Types

Các file này dùng để modify các giá trị số, thông tin almanac, hoặc bảng type cho entities:

- `PlantProps.json` / `ZombieProps.json`: Modify các properties số (`PlantProperties` / `ZombieProperties`).
- `PlantAlmanac.json` / `ZombieAlmanac.json`: Modify thông tin hiển thị almanac (không ảnh hưởng stats chiến đấu thực tế).
- `PlantTypes.json` / `ZombieTypes.json`: Define type data cho cây/zombie.
- `ProjectileProps.json` / `ProjectileTypes.json`: Properties và định nghĩa type liên quan đến đạn/bullet.
- `NarrativeList.json`: Modify danh sách dialogue cốt truyện.
- `PropertySheets.json`: Overwrite hoặc bổ sung một số property sheets.

### Ví dụ file Props (PlantProps.json)

```json
{
  "objects": [
    {
      "aliases": ["peashooter"],
      "objclass": "PlantProperties",
      "objdata": {
        "ShootInterval": 1.35,
        "ShootIntervalAdditional": 0.15,
        "PlantfoodPeaCount": 60,
        "Cooldown": 5,
        "SunCost": 100,
        "Toughness": 300
      }
    }
  ]
}
```

### Ví dụ Almanac (PlantAlmanac.json)

```json
{
  "objects": [
    {
      "aliases": ["peashooter"],
      "objclass": "PlantAlmanacProperties",
      "objdata": {
        "Elements": [
          { "TYPE": "SUNCOST" },
          { "TYPE": "DAMAGE", "VALUE": 20 }
        ],
        "Introduction": { "en": "Peashooters are...", "zh": "豌豆射手是..." }
      }
    }
  ]
}
```

### Quy tắc merge

- Giống như Features: Match entity đích bằng `aliases` (item đầu tiên trong array), sau đó merge recursive `objdata`. Nếu bạn chỉ muốn modify một số field, chỉ cần cung cấp các properties cần thay đổi.

## Files Level

Custom levels được đặt trong `patches/jsons/levels/[LevelName].json`.

- Tên file phải khớp với level ID trong game (vd: `egypt1.json`).
- Dùng `gePatcher.showLevels()` trong console để xem các level ID có sẵn (cần init GE Patcher trước).

## Files Store

`StoreCommodityFeatures.json` dùng để replace/modify các category hàng trong shop:

```json
{
  "Plants": [],
  "Upgrade": [],
  "Gem": [],
  "Coin": []
}
```

Các category không cần modify có thể bỏ qua.

## Debug và khắc phục lỗi thường gặp

1. Check error logs trong console (F12).
2. Các lỗi phổ biến:
   - ❌ `Failed to load...`: Thường là lỗi JSON syntax.
   - ❌ `Level file not found`: Tên file hoặc path không khớp.
3. Validate JSON: Dùng [JSONLint](https://jsonlint.com/) hoặc plugin JSON validation của VSCode.
4. Lấy reference: Dùng các command như `gePatcher.exportJson('PlantProps', true)` để export data game gốc và so sánh sự khác biệt cấu trúc.

Gợi ý troubleshooting:

- Đầu tiên chạy `gePatcher.help()` trong console để output base patch directory (ví dụ: `C:\Users\admin\AppData\Local\com.pvzge.app\patches`) và danh sách các path được support để đảm bảo file đang ở đúng vị trí.
- Chỉ chạy `gePatcher.init()` sau khi game resources đã load xong, hoặc chạy `gePatcher.initBase()` trước và đợi hoàn tất (script sẽ check số lượng resource và warn nếu chưa load).
- Nếu changes không có effect, confirm rằng bạn đã re-execute `gePatcher.init()` hoặc `gePatcher.initPatchs()` và check console output để locate errors.
