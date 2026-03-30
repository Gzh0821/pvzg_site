---
title: API консоли
icon: terminal
pageInfo: false
index: true
order: 8
---

# API консоли

Когда игра запущена, GP-Next предоставляет глобальный объект:

```js
window.gpNext
```

Его можно вызывать напрямую из консоли разработчика.

> [!tip]
> Если вы не уверены, какие команды доступны, начните с:
>
> ```js
> gpNext.help()
> ```

## Перед использованием

- игра полностью загрузилась
- GP-Next успешно инициализирован
- у вас открыта консоль разработчика

Если вы хотите сначала экспортировать исходные JSON для `Features`, `Props` или языков, откройте [Исходные данные](./gp-next-json.md).

## Панель

### `gpNext.toggle()`

Показывает или скрывает панель GP-Next.

Без параметров.

### Пример

```js
gpNext.toggle()
```

### `gpNext.show()`

Показывает панель.

### `gpNext.hide()`

Скрывает панель.

### `gpNext.help()`

Выводит справку по командам в консоль.

---

## Патчи и состояние

### `gpNext.init()`

Повторно запускает процесс загрузки патчей.

### Возвращаемое значение

Обычно возвращает текущий результат загрузки патчей.

### `gpNext.reload()`

Повторно считывает файлы патчей с диска и применяет их заново.

Это одна из самых часто используемых команд.

### Пример

```js
await gpNext.reload()
```

### `gpNext.status()`

Показывает текущее состояние patcher.

### Основные поля результата

- `loaded`: список загруженных типов
- `skipped`: пропущенные типы
- `errors`: список ошибок
- `packs`: обнаруженные datapack-пакеты
- `disabledPacks`: отключенные datapack-пакеты
- `singleFile`: информация об однофайловых патчах
- `editsPack`: информация о пакете ручных правок
- `editsCount`: количество ручных правок
- `extraLanguages`: зарегистрированные дополнительные языки
- `plantRegistry`: отладочная информация динамического реестра растений

### Пример

```js
const status = gpNext.status()
console.log(status.packs)
console.log(status.errors)
```

---

## Редактирование данных

### `gpNext.setObjectsData(type, alias, key, value)`

Изменяет одно поле в записи типа Objects.

### Параметры

- `type`: имя типа объекта, например `PlantProps`
- `alias`: основной alias целевой записи, например `peashooter`
- `key`: имя изменяемого поля
- `value`: новое значение

### Пример

```js
gpNext.setObjectsData('PlantProps', 'peashooter', 'SunCost', 50)
```

### `gpNext.setObjectsData(type, alias, patchObject)`

Сливает объект в `objdata` целевой записи.

### Параметры

- `type`: имя типа объекта
- `alias`: основной alias целевой записи
- `patchObject`: объект, который нужно влить в запись

### Пример

```js
gpNext.setObjectsData('PlantProps', 'peashooter', {
  SunCost: 50,
  Cooldown: 2
})
```

> [!warning]
> Это изменение во время выполнения. Оно удобно для отладки и быстрой проверки, но не создает за вас полноценный datapack автоматически.

---

## Экспорт и восстановление

### `gpNext.exportJson(type, useOriginal = false, autoDownload = true)`

Экспортирует JSON-тип.

### Параметры

- `type`: имя типа, например `PlantFeatures`
- `useOriginal`: `true` экспортирует исходные данные, `false` - текущие runtime-данные
- `autoDownload`: `true` открывает окно сохранения, `false` выводит результат в консоль

### Пример

```js
await gpNext.exportJson('PlantProps')
await gpNext.exportJson('PlantProps', true)
await gpNext.exportJson('PlantProps', false, false)
```

### `gpNext.exportLang(useOriginal = false, autoDownload = true)`

Экспортирует текущую языковую таблицу `MultiLanguage.lyrics`.

### Полезные случаи

- проверить, применился ли языковой пакет
- сравнить текущий расширенный результат языков
- экспортировать исходную языковую таблицу для сравнения

### Пример

```js
await gpNext.exportLang()
await gpNext.exportLang(true)
```

### `gpNext.restoreOriginal(type)`

Восстанавливает один тип до исходного состояния.

### Пример

```js
gpNext.restoreOriginal('PlantFeatures')
```

### `gpNext.restoreAll()`

Восстанавливает все сохраненные типы.

### `gpNext.listOrigins()`

Показывает все типы, для которых сейчас есть исходные копии.

### `gpNext.hasOrigin(type)`

Проверяет, есть ли для типа исходная копия.

---

## Игра

### `gpNext.setFrameRate(fps)`

Устанавливает частоту кадров игры.

### Параметры

- `fps`: число, например `30` или `60`

### Пример

```js
gpNext.setFrameRate(60)
```

### `gpNext.setGameSpeed(multiplier)`

Напрямую изменяет внутренний масштаб времени.

### Параметры

- `multiplier`: значение скорости, например `1` или `1.5`

### Пример

```js
gpNext.setGameSpeed(1)
gpNext.setGameSpeed(1.5)
```

> [!warning]
> Эта команда существует, но использует низкоуровневый путь `_timeScale` и не так безопасна, как штатные варианты `1x / 1.5x` на странице Trainer.
> В большинстве случаев лучше переключать скорость через интерфейс.

---

## Cheats

### `gpNext.cheats.setSun(value)`

Напрямую устанавливает текущее количество солнца.

### Пример

```js
gpNext.cheats.setSun(9999)
```

### `gpNext.cheats.addSun(value = 1000)`

Добавляет солнце.

### Пример

```js
gpNext.cheats.addSun()
gpNext.cheats.addSun(500)
```

### `gpNext.cheats.winLevel()`

Мгновенно завершает текущий уровень победой.

> [!warning]
> В некоторых тестовых или sandbox-сценах лучше рассматривать это как временный ярлык, а не как часть стабильного рабочего процесса.

---

## Отладка

### `gpNext.debug.getPlantRegistry()`

Показывает отладочную информацию динамического реестра растений.

### Полезно для

- добавления новых растений
- клонирования растений
- поиска проблем с сопоставлением идентичности растений

### Пример

```js
const info = gpNext.debug.getPlantRegistry()
console.log(info)
```

---

## Прочее

### `gpNext.version`

Текущая версия GP-Next.

### Пример

```js
gpNext.version
```

### `gpNext.debug`

Это пространство имен для отладки, а не просто булев переключатель.

Сейчас чаще всего используется:

```js
gpNext.debug.getPlantRegistry()
```

## Примеры

### Перезагрузить патчи и проверить состояние

```js
await gpNext.reload()
console.log(gpNext.status())
```

### Быстро проверить значения растения

```js
gpNext.setObjectsData('PlantProps', 'peashooter', {
  SunCost: 50,
  Cooldown: 2
})
```

### Экспортировать текущие данные в консоль

```js
await gpNext.exportJson('PlantProps', false, false)
```

### Экспортировать исходную языковую таблицу

```js
await gpNext.exportLang(true)
```
