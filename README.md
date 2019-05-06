# vxe-table-plugin-iview

[![npm version](https://img.shields.io/npm/v/vxe-table-plugin-iview.svg?style=flat-square)](https://www.npmjs.org/package/vxe-table-plugin-iview)
[![npm downloads](https://img.shields.io/npm/dm/vxe-table-plugin-iview.svg?style=flat-square)](http://npm-stat.com/charts.html?package=vxe-table-plugin-iview)
[![gzip size: JS](http://img.badgesize.io/https://unpkg.com/vxe-table-plugin-iview/lib/index.umd.min.js?compression=gzip&label=gzip%20size:%20JS)](http://img.badgesize.io/https://unpkg.com/vxe-table-plugin-iview/lib/index.umd.min.js?compression=gzip&label=gzip%20size:%20JS)
[![gzip size: CSS](http://img.badgesize.io/https://unpkg.com/vxe-table-plugin-iview/lib/index.css?compression=gzip&label=gzip%20size:%20CSS)](http://img.badgesize.io/https://unpkg.com/vxe-table-plugin-iview/lib/index.css?compression=gzip&label=gzip%20size:%20CSS)
[![npm license](https://img.shields.io/github/license/mashape/apistatus.svg)](https://github.com/xuliangzhan/vxe-table-plugin-iview/blob/master/LICENSE)

该插件用于 vxe-table 列中渲染 iview 组件中提供简化的配置

## API

### edit-render 配置项说明

| 属性 | 描述 | 类型 | 可选值 | 默认值 |
|------|------|-----|-----|-----|
| name | 渲染的组件名 | String | Input / InputNumber / Select / Cascader / DatePicker / TimePicker / Rate / iSwitch | — |
| props | 渲染组件附加属性，参数请查看被渲染的 Component props | Object | — | {} |
| options | 只对 name=Select 有效，下拉组件选项列表 | Array | — | [] |
| optionProps | 只对 name=Select 有效，下拉组件选项属性参数配置 | Object | — | { value: 'value', label: 'label' } |
| optionGroups | 只对 name=Select 有效，下拉组件分组选项列表 | Array | — | [] |
| optionGroupProps | 只对 name=Select 有效，下拉组件分组选项属性参数配置 | Object | — | { options: 'options', label: 'label' } |

## License

Copyright (c) 2019-present, Xu Liangzhan