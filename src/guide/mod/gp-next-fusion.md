---
title: 植物融合配方
icon: toolbox
pageInfo: false
index: true
order: 14
---

融合使用本体的 `EvolutionRecipes`，不需要另写 JS。将下面文件放进带有 `pack.json` 的数据包，即可把“双发射手上种向日葵”配置为融合成 `repeater_mgp`。

```json5
// jsons/objects/PlantProps.json5
{
  objects: [{
    objclass: 'PlantProperties',
    aliases: ['repeater'],
    objdata: {
      EvolutionRecipes: [{
        Name: 'my-pack:repeater-fusion',
        OtherPlantType: 'sunflower',
        TargetPlantType: 'repeater_mgp',
        MaxCount: 1,
      }],
    },
  }],
}
```

- `OtherPlantType`：种下的材料植物类型；`TargetPlantType`：融合结果类型。
- `Name`：数量限制分组。超过正数 `MaxCount` 后，较早的同组融合植物会退回融合前类型；不同配方可共用分组。
- `ReadOthersCostume`：是否读取材料植物的装扮；使用自定义外观时需确认结果植物支持该装扮。
- 配方有方向，反向种植需另写配方。`EvolutionRecipes` 数组会整体替换，保留原版配方时要一并写入；多个包不会自动追加配方。

## 自定义植物

使用[官方示例](./gp-next-examples.md)时，在 `content/entities.json` 对应植物的 `properties.EvolutionRecipes` 中写配方。框架独立持有这些属性，不要用普通 `PlantProps` 补丁去修改自定义植物。

引用自定义植物时使用框架注册的原生 codename，不是局部 `id`、`包名:id` 或数字 ID。可从“数据”页查看注册名称。例如官方内容包的 `pulse` 为：

`gpn_6578616d706c652e656e746974792d636f6e74656e74_70756c7365`

可将此值用作 `OtherPlantType` 或 `TargetPlantType`。跨包引用时声明内容包依赖；所需实体框架、行为和资源必须正常启用。配方本身不会创建新植物资源。属性和配方更新后重新导入并重启。
