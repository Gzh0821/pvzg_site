---
title: 自定义关卡教程
index: true
icon: feather
pageInfo: false
comment: false
order: 3
---

## 自定义关卡

《PvZ2 Gardendless》游戏的自定义关卡文件与原版类似，是一个以`.json`为后缀的文本文件，其中包含了关卡的所有信息，包括植物、僵尸、地形等。
相比原版，《PvZ2 Gardendless》的关卡文件增加了一些新的字段，来描述该关卡的基本信息。

## JSON 文件

若您已经熟悉 JSON 文件格式，可以直接跳过本章节。

JSON（JavaScript Object Notation）是一种轻量级的数据交换格式，易于阅读和编写。它使用键值对来表示数据，通常用于客户端与服务器之间传输数据。JSON 中的数据结构包括对象、数组、字符串、数字、布尔值和 null。

- 对象：使用 `{}` 包裹，包含键值对。
- 数组：使用 `[]` 包裹，包含多个值。
- 字符串：使用 `""` 双引号包裹。
- 布尔值：`true` 或 `false`。
- 数字：整数或浮点数。
- null：表示空值。

示例：

```json
{
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

在这个示例中：

`name` 是字符串类型，`age` 是数字类型。`isStudent` 是布尔类型。`skills` 是一个字符串数组。`address` 是一个对象，包含 city 和 zipCode。

想更深入的了解 JSON 格式，可以参考[这里](https://www.json.org/json-zh.html)。

## 《PvZ2 Gardendless》增加的字段

《PvZ2 Gardendless》增加了`Information`顶级字段，用于描述关卡的基本信息。
该字段并不会影响自定义关卡在游戏内的功能，但能够帮助玩家快速了解您编写的关卡的信息。

这个字段包含了以下内容：

```json
"Information": {
    // 关卡的作者
    "Author": "LMYY",
    // 作者的链接
    "AuthorLink": "https://github.com/Gzh0821",
    // 关卡的描述
    "Introduction": "A level that is easy to play, but hard to win.",
    // 关卡的版本
    "Version": "1.0",
    // 关卡的创建时间
    "CreatedAt": "2022-03-08",
    // 关卡的更新时间
    "UpdatedAt": "2022-03-08",
    // 关卡的难度，可选值有：Easy, Normal, Hard, Expert
    "Difficulty": "Easy",
    // 关卡的分类
    "Category": "Survival",
},
```
