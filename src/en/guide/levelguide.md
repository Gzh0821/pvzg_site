---
title: Custom Level Guide
index: true
icon: feather
pageInfo: false
comment: false
order: 3
---

## Custom Levels

The custom level file of the game "PvZ2 Gardendless" is similar to the original version. It is a text file with the suffix `.json`, which contains all the information of the level, including plants, zombies, terrain, etc.

Compared with the original version, the level file of "PvZ2 Gardendless" adds some new fields to describe the basic information of the level.

## JSON File

If you are already familiar with the JSON file format, you can skip this section directly.

JSON (JavaScript Object Notation) is a lightweight data exchange format that is easy to read and write. It uses key-value pairs to represent data and is usually used to transmit data between clients and servers. The data structures in JSON include objects, arrays, strings, numbers, Boolean values, and null.

- Objects: wrapped in `{}`, containing key-value pairs.

- Arrays: wrapped in `[]`, containing multiple values.

- Strings: wrapped in `""` double quotes.

- Boolean values: `true` or `false`.
- Number: integer or floating point number.
- null: represents a null value.

Example:

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

In this example:

`name` is a string type, and `age` is a number type. `isStudent` is a Boolean type. `skills` is an array of strings. `address` is an object containing city and zipCode.

For a more in-depth understanding of the JSON format, you can refer to [here](https://www.json.org/json-en.html).

## Fields added in "PvZ2 Gardendless"

"PvZ2 Gardendless" adds the `Information` top-level field to describe basic information about the level.
This field does not affect the function of the custom level in the game, but it can help players quickly understand the information of the level you wrote.

This field contains the following:

```json
"Information": {
    // Level author
    "Author": "LMYY",
    // Author link
    "AuthorLink": "https://github.com/Gzh0821",
    // Level description
    "Introduction": "A level that is easy to play, but hard to win.",
    // Level version
    "Version": "1.0",
    // Level creation time
    "CreatedAt": "2022-03-08",
    // Level update time
    "UpdatedAt": "2022-03-08",
    // Level difficulty, optional values ​​are: Easy, Normal, Hard, Expert
    "Difficulty": "Easy",
    // Level category
    "Category": "Survival",
},
```
