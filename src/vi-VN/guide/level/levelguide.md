---
title: Cấu trúc File Level
index: true
icon: feather
pageInfo: false
order: 1
---

> [!info]
> Ghé qua trang [Vườn Sáng Tạo](../../creator-garden/) để tải các file level mẫu nhé!

## Custom Level

File custom level của game "PvZ2 Gardendless" khá giống với bản gốc. Đây là file text JSON/JSON5 với đuôi `.json` hoặc `.json5`, chứa toàn bộ thông tin của level, bao gồm cây, zombie, địa hình, v.v.

So với bản gốc, file level của "PvZ2 Gardendless" có thêm một số field mới để mô tả thông tin cơ bản của level.

## File JSON

Nếu bạn đã quen với format JSON rồi thì skip phần này luôn nhé.

JSON (JavaScript Object Notation) là một format trao đổi dữ liệu nhẹ, dễ đọc và viết. Nó sử dụng các cặp key-value để biểu diễn data và thường dùng để truyền dữ liệu giữa client và server. Các cấu trúc dữ liệu trong JSON bao gồm object, array, string, number, boolean và null.

- Object: được bọc trong `{}`, chứa các cặp key-value.

- Array: được bọc trong `[]`, chứa nhiều giá trị.

- String: được bọc trong dấu ngoặc kép `""`.

- Boolean: `true` hoặc `false`.
- Number: số nguyên hoặc số thập phân.
- null: đại diện cho giá trị rỗng.

> [!warning]
> File JSON không support comment. Khi bạn sử dụng code JSON trên website này, hãy dùng format `JSON5` được đề cập bên dưới, hoặc xóa các comment bắt đầu bằng `//`.

Ví dụ:

```json
{
  // Xóa comment này khi sử dụng code JSON
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

Trong ví dụ này:

`name` là kiểu string, `age` là kiểu number. `isStudent` là kiểu boolean. `skills` là array của string. `address` là object chứa city và zipCode.

Để hiểu sâu hơn về format JSON, bạn có thể tham khảo [tại đây](https://www.json.org/json-en.html).

## File JSON5

> [!important]
> Bạn có thể dùng format JSON5 khi viết file level. Hãy dùng đuôi `.json5` cho file level để phân biệt với file `json` thường.

JSON5 là phiên bản mở rộng dựa trên JSON (JavaScript Object Notation). Mục tiêu là tăng tính dễ đọc và tiện dụng của JSON trong khi vẫn tương thích với JSON. JSON5 cho phép dev dùng cú pháp linh hoạt hơn mà không vi phạm chuẩn JSON hiện có.

JSON5 mang đến một số điểm linh hoạt, giúp file config hoặc format truyền data dễ viết và dễ hiểu hơn. Sau đây là các tính năng chính của JSON5:

### Key name linh hoạt

Trong JSON chuẩn, tên key phải được bọc trong dấu ngoặc kép, còn trong JSON5, tên key có thể không cần quote hoặc dùng dấu nháy đơn.

```json5
{
  unquoted: 'Cái này hợp lệ trong JSON5',
  singleQuotes: 'Cái này cũng được'
}
```

### Dấu phẩy cuối dòng

Trong JSON5, bạn có thể thêm dấu phẩy sau item cuối cùng của object hoặc array, khá tiện khi edit.

```json5
{
  key: 'value',
  anotherKey: 42 // Cho phép dấu phẩy cuối dòng
}
```

### Support Comment

JSON5 support cả comment một dòng và nhiều dòng, giống JavaScript. JSON chuẩn không cho phép comment, còn JSON5 cho phép dev thêm annotation trong file data.

```json5
{
  // Đây là comment một dòng
  key: 'value',

  /*
  Đây là comment nhiều dòng
  Có thể giải thích config phức tạp
  */
  anotherKey: 42
}
```

### String linh hoạt

JSON5 support cả string dùng nháy đơn và nháy kép.

```json5
{
  singleQuotes: 'Đây là string',
  doubleQuotes: 'Đây cũng là string'
}
```

JSON5 cho phép dùng ký tự xuống dòng trong string. Khác với JSON, bạn không cần dùng `\n` để xuống dòng. Đồng thời, escape character cũng có thể dùng trong string.

```json5
{
  longString: 'Đây là một string rất dài \
  trải qua nhiều dòng\t'
}
```

### Kiểu dữ liệu bổ sung

JSON5 support thêm nhiều format số, như ký hiệu hex và giá trị vô cực (`Infinity`), cũng như `NaN` (Not-a-Number).

```json5
{
  decimal: 123,
  hexadecimal: 0x7b,
  infinity: Infinity,
  notANumber: NaN
}
```

### Biểu diễn số linh hoạt hơn

Bạn có thể bỏ số 0 ở phần nguyên hoặc phần thập phân.

```json5
{
  fractional: 0.5, // tương đương 0.5
  trailing: 2 // tương đương 2.0
}
```

Để biết thêm về JSON5, check [tại đây](https://json5.org/).

## Cấu trúc file Level

Cấu trúc file level của "PvZ2 Gardendless" như sau:

```json
{
  // Tiêu đề level
  "#comment": "Sample Level",
  // Thông tin cơ bản của level
  "Information": {},
  "objects": [
    // Danh sách các setting của level
    {},
    {}
  ],
  "version": 1
}
```

Field `#comment` là tiêu đề của level. Khi viết level, hãy đảm bảo tiêu đề level của bạn là duy nhất, không trùng lặp. Field `version` cố định là 1.
Mô tả chi tiết các field khác ở bên dưới.

## Field Information

PvZ2 Gardendless thêm field top-level `Information` để mô tả thông tin cơ bản về level.
Field này không ảnh hưởng đến chức năng của custom level trong game, nhưng giúp player nhanh chóng hiểu thông tin level bạn viết.

Field này chứa những thông tin sau:

```json
"Information": {
  // UUID của level
  "uuid": "c58a208a-a5e3-4cfa-9bc3-cc7fbb08c2e3",
  // Tên level
  "name": {
      "en": "SampleLevel",
      "zh-CN": "示例关卡"
  },
  // Tác giả level
  "Author": "LMYY",
  // Optional, link tác giả
  "AuthorLink": "https://github.com/Gzh0821",
  // Mô tả level
  "Introduction": {
      "en": "This is a sample level.",
      "zh-CN": "这是一个示例关卡。"
  },
  // Phiên bản game hỗ trợ
  "GameVersion": "0.1.1",
  // Phiên bản level
  "Version": "1.0",
  // Thời gian tạo level
  "CreatedAt": "2022-03-08",
  // Thời gian update level
  "UpdatedAt": "2022-03-08",
  // Độ khó level, các giá trị: Easy, Normal, Hard, Expert
  "Difficulty": "Easy",
  // Thể loại level
  "Category": "Survival"
},
```

`uuid` là định danh duy nhất của level, dùng để phân biệt các level khác nhau. Hãy đảm bảo `uuid` của level bạn là unique.
Để lấy `uuid` ngẫu nhiên, bạn có thể dùng tool online như [UUID Generator](https://www.uuidgenerator.net/).

## Field objects

objects là một list mà mỗi element là một setting cụ thể của level. Có nhiều object trong list, mỗi object tương ứng với một config item. Sau đây là ví dụ về list objects:

```json
"objects": [
  {
    // Config item: setting cơ bản của level
    "objclass": "LevelDefinition",
    // Setting cơ bản của level
    "objdata": {
      // Mô tả level
      "Description": "~",
      // Số thứ tự level, dùng trong series level
      "LevelNumber": 1,
      // Giữ mặc định
      "Loot": "RTID(DefaultLoot@LevelModules)",
      // Game mode của level, đây là game mode cơ bản
      "Modules": [
        "RTID(ZombiesDeadWinCon@LevelModules)",
        "RTID(DefaultZombieWinCondition@LevelModules)",
        "RTID(NewWaves@CurrentLevel)",
        "RTID(SeedBank@CurrentLevel)"
      ],
      // Tên level hiển thị trong game
      "Name": "Bank theft 1",
      // Optional: hỗ trợ đa ngôn ngữ
      "NameMultiLanguage": {
        "en": "Bank theft I",
        "zh": "银行失窃I"
      },
      // Tác giả, recommend giống với Information.Author
      "WritenBy": "保罗_刘",
      // Hiện tại chưa dùng: liên quan đến drop
      "NormalPresentTable": "egypt_normal_01",
      "ShinyPresentTable": "egypt_shiny_01",
      // Scene của level, format: RTID(tên world Stage@LevelModules)
      "StageModule": "RTID(TutorialStage@LevelModules)"
    }
  },
  // Config cho từng gameplay mode:
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
