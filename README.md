# vxe-table-plugin-iview

[![gitee star](https://gitee.com/xuliangzhan_admin/vxe-table-plugin-iview/badge/star.svg?theme=dark)](https://gitee.com/xuliangzhan_admin/vxe-table-plugin-iview/stargazers)
[![npm version](https://img.shields.io/npm/v/vxe-table-plugin-iview.svg?style=flat-square)](https://www.npmjs.org/package/vxe-table-plugin-iview)
[![npm downloads](https://img.shields.io/npm/dm/vxe-table-plugin-iview.svg?style=flat-square)](http://npm-stat.com/charts.html?package=vxe-table-plugin-iview)
[![gzip size: JS](http://img.badgesize.io/https://unpkg.com/vxe-table-plugin-iview/dist/index.min.js?compression=gzip&label=gzip%20size:%20JS)](https://unpkg.com/vxe-table-plugin-iview/dist/index.min.js)
[![gzip size: CSS](http://img.badgesize.io/https://unpkg.com/vxe-table-plugin-iview/dist/style.min.css?compression=gzip&label=gzip%20size:%20CSS)](https://unpkg.com/vxe-table-plugin-iview/dist/style.min.css)
[![npm license](https://img.shields.io/github/license/mashape/apistatus.svg)](LICENSE)

基于 [vxe-table](https://www.npmjs.com/package/vxe-table) 表格的适配插件，用于兼容 [iview](https://www.npmjs.com/package/iview)、[view-design](https://www.npmjs.com/package/view-design) 组件库

## Installing

```shell
npm install xe-utils vxe-table vxe-table-plugin-iview iview
```

```javascript
// ...
import VXETablePluginIView from 'vxe-table-plugin-iview'
import 'vxe-table-plugin-iview/dist/style.css'
// ...

VXETable.use(VXETablePluginIView)
```

## API

### cell-render 默认的渲染器配置项说明

| 属性 | 描述 | 类型 | 可选值 | 默认值 |
|------|------|-----|-----|-----|
| name | 支持的渲染组件 | String | Input, AutoComplete, InputNumber, Rate, iSwitch, Button, Buttons | — |
| props | 渲染组件附加属性，参数请查看被渲染的 Component props | Object | — | {} |
| options | 只对 name=Select 有效，下拉组件选项列表 | Array | — | [] |
| optionProps | 只对 name=Select 有效，下拉组件选项属性参数配置 | Object | — | { value: 'value', label: 'label', disabled: 'disabled' } |
| optionGroups | 只对 name=ElSelect 有效，下拉组件分组选项列表 | Array | — | [] |
| optionGroupProps | 只对 name=ElSelect 有效，下拉组件分组选项属性参数配置 | Object | — | { options: 'options', label: 'label' } |
| events | 渲染组件附加事件，参数为 ( {row,rowIndex,column,columnIndex}, ...Component arguments ) | Object | — | — |
| nativeEvents | 渲染组件附加事件，参数为 ( {row,rowIndex,column,columnIndex}, ...Component arguments ) | Object | — | — |

### edit-render 可编辑渲染器配置项说明

| 属性 | 描述 | 类型 | 可选值 | 默认值 |
|------|------|-----|-----|-----|
| name | 支持的渲染组件 | String | Input, AutoComplete, InputNumber, Select, Cascader, DatePicker, TimePicker, Rate, iSwitch, Button, Buttons | — |
| props | 渲染组件附加属性，参数请查看被渲染的 Component props | Object | — | {} |
| options | 只对 name=Select 有效，下拉组件选项列表 | Array | — | [] |
| optionProps | 只对 name=Select 有效，下拉组件选项属性参数配置 | Object | — | { value: 'value', label: 'label', disabled: 'disabled' } |
| optionGroups | 只对 name=ElSelect 有效，下拉组件分组选项列表 | Array | — | [] |
| optionGroupProps | 只对 name=ElSelect 有效，下拉组件分组选项属性参数配置 | Object | — | { options: 'options', label: 'label' } |
| events | 渲染组件附加事件，参数为 ( {row,rowIndex,column,columnIndex}, ...Component arguments ) | Object | — | — |
| nativeEvents | 渲染组件附加事件，参数为 ( {row,rowIndex,column,columnIndex}, ...Component arguments ) | Object | — | — |

### filter-render 筛选渲染器配置项说明

| 属性 | 描述 | 类型 | 可选值 | 默认值 |
|------|------|-----|-----|-----|
| name | 支持的渲染组件 | String | Input, AutoComplete, InputNumber, Select, Rate, iSwitch | — |
| props | 渲染组件附加属性，参数请查看被渲染的 Component props | Object | — | {} |
| options | 只对 name=Select 有效，下拉组件选项列表 | Array | — | [] |
| optionProps | 只对 name=Select 有效，下拉组件选项属性参数配置 | Object | — | { value: 'value', label: 'label', disabled: 'disabled' } |
| optionGroups | 只对 name=ElSelect 有效，下拉组件分组选项列表 | Array | — | [] |
| optionGroupProps | 只对 name=ElSelect 有效，下拉组件分组选项属性参数配置 | Object | — | { options: 'options', label: 'label' } |
| events | 渲染组件附加事件，参数为 ( {}, ...Component arguments ) | Object | — | — |
| nativeEvents | 渲染组件附加事件，参数为 ( {}, ...Component arguments ) | Object | — | — |

### item-render 表单-项渲染器配置项说明

| 属性 | 描述 | 类型 | 可选值 | 默认值 |
|------|------|-----|-----|-----|
| name | 支持的渲染组件 | String | Input, AutoComplete, InputNumber, Select, Rate, iSwitch, Radio, Checkbox, Button, Buttons | — |
| props | 渲染组件附加属性，参数请查看被渲染的 Component props | Object | — | {} |
| options | 只对 name=Select 有效，下拉组件选项列表 | Array | — | [] |
| optionProps | 只对 name=Select 有效，下拉组件选项属性参数配置 | Object | — | { value: 'value', label: 'label', disabled: 'disabled' } |
| optionGroups | 只对 name=ElSelect 有效，下拉组件分组选项列表 | Array | — | [] |
| optionGroupProps | 只对 name=ElSelect 有效，下拉组件分组选项属性参数配置 | Object | — | { options: 'options', label: 'label' } |
| events | 渲染组件附加事件，参数为 ( {}, ...Component arguments ) | Object | — | — |
| nativeEvents | 渲染组件附加事件，参数为 ( {}, ...Component arguments ) | Object | — | — |

## Cell demo

```html
<vxe-table
  height="600"
  :data="tableData"
  :edit-config="{trigger: 'click', mode: 'cell'}">
  <vxe-table-column type="selection" width="60"></vxe-table-column>
  <vxe-table-column type="index" width="60"></vxe-table-column>
  <vxe-table-column field="name" title="Input" min-width="140" :edit-render="{name: 'Input'}"></vxe-table-column>
  <vxe-table-column field="age" title="InputNumber" width="140" :edit-render="{name: 'InputNumber', props: {max: 35, min: 18}}"></vxe-table-column>
  <vxe-table-column field="sex" title="Select" width="140" :edit-render="{name: 'Select', options: sexList}"></vxe-table-column>
  <vxe-table-column field="region" title="Cascader" width="200" :edit-render="{name: 'Cascader', props: {data: regionList}}"> </vxe-table-column>
  <vxe-table-column field="date" title="DatePicker" width="200" :edit-render="{name: 'DatePicker', props: {type: 'date', format: 'yyyy/MM/dd'}}"></vxe-table-column>
  <vxe-table-column field="date2" title="TimePicker" width="200" :edit-render="{name: 'TimePicker', props: {type: 'time'}}"></vxe-table-column>
  <vxe-table-column field="rate" title="Rate" width="200" :edit-render="{name: 'Rate', type: 'visible'}"></vxe-table-column>
  <vxe-table-column field="flag" title="iSwitch" width="100" :edit-render="{name: 'iSwitch', type: 'visible'}"></vxe-table-column>
</vxe-table>
```

```javascript
export default {
  data () {
    return {
      tableData: [
        {
          id: 100,
          name: 'test',
          age: 26,
          sex: '1',
          region: ['shenzhen'],
          date: null,
          date2: null,
          rate: 2,
          flag: true
        }
      ],
      sexList: [
        {
          'label': '男',
          'value': '1'
        },
        {
          'label': '女',
          'value': '0'
        }
      ],
      regionList: [
        {
          'label': '深圳',
          'value': 'shenzhen'
        },
        {
          'label': '广州',
          'value': 'guangzhou'
        }
      ]
    }
  }
}
```

## Filter demo

```html
<vxe-table
  border
  height="600"
  :data="tableData">
  <vxe-table-column type="index" width="60"></vxe-table-column>
  <vxe-table-column field="name" title="Name"></vxe-table-column>
  <vxe-table-column field="age" title="Age"></vxe-table-column>
  <vxe-table-column field="date" title="Date" :filters="[{data: []}]" :filter-render="{name: 'Input'}"></vxe-table-column>
</vxe-table>
```

```javascript
export default {
  data () {
    return {
      tableData: [
        {
          id: 100,
          name: 'test',
          age: 26,
          date: null
        }
      ]
    }
  }
}
```

## License

[MIT](LICENSE) © 2019-present, Xu Liangzhan
