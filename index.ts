import { h, resolveComponent, ComponentOptions } from 'vue'
import XEUtils from 'xe-utils'
import { VXETableCore, VxeTableDefines, VxeColumnPropTypes, VxeGlobalRendererHandles, VxeGlobalInterceptorHandles, FormItemRenderOptions, FormItemContentRenderParams } from 'vxe-table'

function isEmptyValue (cellValue: any) {
  return cellValue === null || cellValue === undefined || cellValue === ''
}

function getModelProp (renderOpts: VxeGlobalRendererHandles.RenderOptions) {
  return 'modelValue'
}

function getModelEvent (renderOpts: VxeGlobalRendererHandles.RenderOptions) {
  return 'update:modelValue'
}

function getChangeEvent (renderOpts: VxeGlobalRendererHandles.RenderOptions) {
  return 'change'
}

function getFormatDate (value: any, props: { [key: string]: any }, defaultFormat: string) {
  return XEUtils.toDateString(value, props.format || defaultFormat)
}

function getFormatDates (values: any, props: { [key: string]: any }, separator: string, defaultFormat: string) {
  return XEUtils.map(values, (date: any) => getFormatDate(date, props, defaultFormat)).join(separator)
}

function equalDaterange (cellValue: any, data: any, props: { [key: string]: any }, defaultFormat: string) {
  cellValue = getFormatDate(cellValue, props, defaultFormat)
  return cellValue >= getFormatDate(data[0], props, defaultFormat) && cellValue <= getFormatDate(data[1], props, defaultFormat)
}

function getCellEditFilterProps (renderOpts: VxeGlobalRendererHandles.RenderOptions, params: VxeGlobalRendererHandles.RenderEditParams | VxeGlobalRendererHandles.RenderFilterParams, value: any, defaultProps?: { [prop: string]: any }) {
  return XEUtils.assign({}, defaultProps, renderOpts.props, { [getModelProp(renderOpts)]: value })
}

function getItemProps (renderOpts: VxeGlobalRendererHandles.RenderOptions, params: FormItemContentRenderParams, value: any, defaultProps?: { [prop: string]: any }) {
  return XEUtils.assign({}, defaultProps, renderOpts.props, { [getModelProp(renderOpts)]: value })
}

function getOns (renderOpts: VxeGlobalRendererHandles.RenderOptions, params: VxeGlobalRendererHandles.RenderParams, inputFunc?: Function, changeFunc?: Function) {
  const { events } = renderOpts
  const modelEvent = getModelEvent(renderOpts)
  const changeEvent = getChangeEvent(renderOpts)
  const isSameEvent = changeEvent === modelEvent
  const ons: { [type: string]: Function } = {}
  XEUtils.objectEach(events, (func: Function, key: string) => {
    ons[key] = function (...args: any[]) {
      func(params, ...args)
    }
  })
  if (inputFunc) {
    ons[modelEvent] = function (targetEvnt: any) {
      inputFunc(targetEvnt)
      if (events && events[modelEvent]) {
        events[modelEvent](params, targetEvnt)
      }
      if (isSameEvent && changeFunc) {
        changeFunc(targetEvnt)
      }
    }
  }
  if (!isSameEvent && changeFunc) {
    ons[changeEvent] = function (...args: any[]) {
      changeFunc(...args)
      if (events && events[changeEvent]) {
        events[changeEvent](params, ...args)
      }
    }
  }
  return ons
}

function getEditOns (renderOpts: VxeGlobalRendererHandles.RenderOptions, params: VxeGlobalRendererHandles.RenderEditParams) {
  const { $table, row, column } = params
  return getOns(renderOpts, params, (value: any) => {
    // 处理 model 值双向绑定
    XEUtils.set(row, column.property, value)
  }, () => {
    // 处理 change 事件相关逻辑
    $table.updateStatus(params)
  })
}

function getFilterOns (renderOpts: VxeGlobalRendererHandles.RenderOptions, params: VxeGlobalRendererHandles.RenderFilterParams, option: VxeTableDefines.FilterOption, changeFunc: Function) {
  return getOns(renderOpts, params, (value: any) => {
    // 处理 model 值双向绑定
    option.data = value
  }, changeFunc)
}

function getItemOns (renderOpts: VxeGlobalRendererHandles.RenderOptions, params: FormItemContentRenderParams) {
  const { $form, data, property } = params
  return getOns(renderOpts, params, (value: any) => {
    // 处理 model 值双向绑定
    XEUtils.set(data, property, value)
  }, () => {
    // 处理 change 事件相关逻辑
    $form.updateStatus(params)
  })
}

function matchCascaderData (index: number, list: any[], values: any[], labels: any[]) {
  const val = values[index]
  if (list && values.length > index) {
    XEUtils.each(list, (item) => {
      if (item.value === val) {
        labels.push(item.label)
        matchCascaderData(++index, item.children, values, labels)
      }
    })
  }
}

function getSelectCellValue (renderOpts: VxeColumnPropTypes.EditRender, params: VxeGlobalRendererHandles.RenderCellParams) {
  const { options = [], optionGroups, props = {}, optionProps = {}, optionGroupProps = {} } = renderOpts
  const { row, column } = params
  const $table: any = params.$table
  const labelProp = optionProps.label || 'label'
  const valueProp = optionProps.value || 'value'
  const groupOptions = optionGroupProps.options || 'options'
  const cellValue = XEUtils.get(row, column.property)
  const colid = column.id
  let rest: any
  let cellData: any
  if (props.filterable) {
    const fullAllDataRowMap: Map<any, any> = $table.fullAllDataRowMap
    const cacheCell = fullAllDataRowMap.has(row)
    if (cacheCell) {
      rest = fullAllDataRowMap.get(row)
      cellData = rest.cellData
      if (!cellData) {
        cellData = fullAllDataRowMap.get(row).cellData = {}
      }
    }
    if (rest && cellData[colid] && cellData[colid].value === cellValue) {
      return cellData[colid].label
    }
  }
  if (!isEmptyValue(cellValue)) {
    return XEUtils.map(props.multiple ? cellValue : [cellValue], optionGroups
      ? (value) => {
          let selectItem
          for (let index = 0; index < optionGroups.length; index++) {
            selectItem = XEUtils.find(optionGroups[index][groupOptions], (item) => item[valueProp] === value)
            if (selectItem) {
              break
            }
          }
          const cellLabel: any = selectItem ? selectItem[labelProp] : value
          if (cellData && options && options.length) {
            cellData[colid] = { value: cellValue, label: cellLabel }
          }
          return cellLabel
        }
      : (value) => {
          const selectItem = XEUtils.find(options, (item) => item[valueProp] === value)
          const cellLabel: any = selectItem ? selectItem[labelProp] : value
          if (cellData && options && options.length) {
            cellData[colid] = { value: cellValue, label: cellLabel }
          }
          return cellLabel
        }).join(', ')
  }
  return null
}

function getCascaderCellValue (renderOpts: VxeGlobalRendererHandles.RenderOptions, params: VxeGlobalRendererHandles.RenderCellParams | VxeGlobalRendererHandles.ExportMethodParams) {
  const { props = {} } = renderOpts
  const { row, column } = params
  const cellValue = XEUtils.get(row, column.property)
  const values: any[] = cellValue || []
  const labels: any[] = []
  matchCascaderData(0, props.data, values, labels)
  return labels.join(` ${props.separator || '/'} `)
}

function getDatePickerCellValue (renderOpts: VxeGlobalRendererHandles.RenderOptions, params: VxeGlobalRendererHandles.RenderCellParams | VxeGlobalRendererHandles.ExportMethodParams) {
  const { props = {} } = renderOpts
  const { row, column } = params
  const { separator } = props
  let cellValue = XEUtils.get(row, column.property)
  switch (props.type) {
    case 'week':
      cellValue = getFormatDate(cellValue, props, 'yyyywWW')
      break
    case 'month':
      cellValue = getFormatDate(cellValue, props, 'yyyy-MM')
      break
    case 'year':
      cellValue = getFormatDate(cellValue, props, 'yyyy')
      break
    case 'dates':
      cellValue = getFormatDates(cellValue, props, ', ', 'yyyy-MM-dd')
      break
    case 'daterange':
      cellValue = getFormatDates(cellValue, props, ` ${separator || '-'} `, 'yyyy-MM-dd')
      break
    case 'datetimerange':
      cellValue = getFormatDates(cellValue, props, ` ${separator || '-'} `, 'yyyy-MM-dd HH:ss:mm')
      break
    default:
      cellValue = getFormatDate(cellValue, props, 'yyyy-MM-dd')
      break
  }
  return cellValue
}

function createEditRender (defaultProps?: { [key: string]: any }) {
  return function (renderOpts: VxeColumnPropTypes.EditRender & { name: string }, params: VxeGlobalRendererHandles.RenderEditParams) {
    const { row, column } = params
    const { attrs } = renderOpts
    const cellValue = XEUtils.get(row, column.property)
    return [
      h(renderOpts.name, {
        attrs,
        props: getCellEditFilterProps(renderOpts, params, cellValue, defaultProps),
        on: getEditOns(renderOpts, params)
      })
    ]
  }
}

function defaultButtonEditRender (renderOpts: VxeColumnPropTypes.EditRender, params: VxeGlobalRendererHandles.RenderEditParams) {
  const { attrs } = renderOpts
  return [
    h('Button', {
      attrs,
      props: getCellEditFilterProps(renderOpts, params, null),
      on: getOns(renderOpts, params)
    }, cellText(renderOpts.content))
  ]
}

function defaultButtonsEditRender (renderOpts: VxeColumnPropTypes.EditRender, params: VxeGlobalRendererHandles.RenderEditParams) {
  const { children } = renderOpts
  if (children) {
    return children.map((childRenderOpts: VxeColumnPropTypes.EditRender) => defaultButtonEditRender(childRenderOpts, params)[0])
  }
  return []
}

function createFilterRender (defaultProps?: { [key: string]: any }) {
  return function (renderOpts: VxeColumnPropTypes.FilterRender & { name: string }, params: VxeGlobalRendererHandles.RenderFilterParams) {
    const { column } = params
    const { name, attrs } = renderOpts
    return [
      h('div', {
        class: 'vxe-table--filter-iview-wrapper'
      }, column.filters.map((option, oIndex) => {
        const optionValue = option.data
        return h(name, {
          key: oIndex,
          attrs,
          props: getCellEditFilterProps(renderOpts, params, optionValue, defaultProps),
          on: getFilterOns(renderOpts, params, option, () => {
            // 处理 change 事件相关逻辑
            handleConfirmFilter(params, !!option.data, option)
          })
        })
      }))
    ]
  }
}

function handleConfirmFilter (params: VxeGlobalRendererHandles.RenderFilterParams, checked: boolean, option: VxeTableDefines.FilterOption) {
  const { $panel } = params
  $panel.changeOption(null, checked, option)
}

function defaultFilterMethod (params: VxeGlobalRendererHandles.FilterMethodParams) {
  const { option, row, column } = params
  const { data } = option
  const cellValue = XEUtils.get(row, column.property)
  /* eslint-disable eqeqeq */
  return cellValue === data
}

function renderOptions (options: any[], optionProps: VxeGlobalRendererHandles.RenderOptionProps) {
  const labelProp = optionProps.label || 'label'
  const valueProp = optionProps.value || 'value'
  return XEUtils.map(options, (item, oIndex) => {
    return h('Option', {
      key: oIndex,
      props: {
        value: item[valueProp],
        label: item[labelProp],
        disabled: item.disabled
      }
    })
  })
}

function cellText (cellValue: any) {
  return ['' + (isEmptyValue(cellValue) ? '' : cellValue)]
}

function createFormItemRender (defaultProps?: { [key: string]: any }) {
  return function (renderOpts: FormItemRenderOptions & { name: string }, params: FormItemContentRenderParams) {
    const { data, property } = params
    const { name } = renderOpts
    const { attrs } = renderOpts
    const itemValue = XEUtils.get(data, property)
    return [
      h(name, {
        attrs,
        props: getItemProps(renderOpts, params, itemValue, defaultProps),
        on: getItemOns(renderOpts, params)
      })
    ]
  }
}

function defaultButtonItemRender (renderOpts: FormItemRenderOptions, params: FormItemContentRenderParams) {
  const { attrs } = renderOpts
  const props = getItemProps(renderOpts, params, null)
  return [
    h('Button', {
      attrs,
      props,
      on: getOns(renderOpts, params)
    }, {
      default: () => cellText(renderOpts.content || props.content)
    })
  ]
}

function defaultButtonsItemRender (renderOpts: FormItemRenderOptions, params: FormItemContentRenderParams) {
  const { children } = renderOpts
  if (children) {
    return children.map((childRenderOpts: FormItemRenderOptions) => defaultButtonItemRender(childRenderOpts, params)[0])
  }
  return []
}

function createExportMethod (getExportCellValue: Function) {
  return function (params: VxeGlobalRendererHandles.ExportMethodParams) {
    const { row, column, options } = params
    return options && options.original ? XEUtils.get(row, column.field) : getExportCellValue(column.editRender || column.cellRender, params)
  }
}

function createFormItemRadioAndCheckboxRender () {
  return function (renderOpts: FormItemRenderOptions, params: FormItemContentRenderParams) {
    const { name, options = [], optionProps = {} } = renderOpts
    const { data, field } = params
    const { attrs } = renderOpts
    const labelProp = optionProps.label || 'label'
    const valueProp = optionProps.value || 'value'
    const itemValue = XEUtils.get(data, field)
    return [
      h(`${name}Group`, {
        attrs,
        props: getItemProps(renderOpts, params, itemValue),
        on: getItemOns(renderOpts, params)
      }, options.map((option) => {
        return h(name, {
          props: {
            label: option[valueProp],
            disabled: option.disabled
          }
        }, option[labelProp])
      }))
    ]
  }
}

/**
 * 检查触发源是否属于目标节点
 */
function getEventTargetNode (evnt: any, container: HTMLElement, className: string) {
  let targetElem
  let target = evnt.target
  while (target && target.nodeType && target !== document) {
    if (className && target.className && target.className.split && target.className.split(' ').indexOf(className) > -1) {
      targetElem = target
    } else if (target === container) {
      return { flag: className ? !!targetElem : true, container, targetElem: targetElem }
    }
    target = target.parentNode
  }
  return { flag: false }
}

/**
 * 事件兼容性处理
 */
function handleClearEvent (params: VxeGlobalInterceptorHandles.InterceptorClearFilterParams | VxeGlobalInterceptorHandles.InterceptorClearActivedParams | VxeGlobalInterceptorHandles.InterceptorClearAreasParams) {
  const { $event } = params
  const bodyElem = document.body
  if (
    // 下拉框、日期
    getEventTargetNode($event, bodyElem, 'ivu-select-dropdown').flag
  ) {
    return false
  }
}

/**
 * 基于 vxe-table 的表格适配插件，用于兼容 view-ui-plus 组件库
 */
export const VXETablePluginIView = {
  install (vxetable: VXETableCore) {
    // 检查版本
    if (!/^(4)\./.test(vxetable.version) && !/v4/i.test((vxetable as any).v)) {
      console.error('[vxe-table-plugin-iview 4.x] Version vxe-table 4.x is required')
    }

    vxetable.renderer.mixin({
      IInput: {
        autofocus: 'input.ivu-input',
        renderDefault: createEditRender(),
        renderEdit: createEditRender(),
        renderFilter: createFilterRender(),
        filterMethod: defaultFilterMethod,
        renderItemContent: createFormItemRender()
      },
      IAutoComplete: {
        autofocus: 'input.ivu-input',
        renderDefault: createEditRender(),
        renderEdit: createEditRender(),
        renderFilter: createFilterRender(),
        filterMethod: defaultFilterMethod,
        renderItemContent: createFormItemRender()
      },
      IInputNumber: {
        autofocus: 'input.ivu-input-number-input',
        renderDefault: createEditRender(),
        renderEdit: createEditRender(),
        renderFilter: createFilterRender(),
        filterMethod: defaultFilterMethod,
        renderItemContent: createFormItemRender()
      },
      ISelect: {
        renderEdit (renderOpts, params) {
          const { options = [], optionGroups, optionProps = {}, optionGroupProps = {} } = renderOpts
          const { row, column } = params
          const { attrs } = renderOpts
          const cellValue = XEUtils.get(row, column.property)
          const props = getCellEditFilterProps(renderOpts, params, cellValue)
          const on = getEditOns(renderOpts, params)
          if (optionGroups) {
            const groupOptions = optionGroupProps.options || 'options'
            const groupLabel = optionGroupProps.label || 'label'
            return [
              h('Select', {
                ...attrs,
                ...props,
                on
              }, XEUtils.map(optionGroups, (group, gIndex) => {
                return h('OptionGroup', {
                  props: {
                    label: group[groupLabel]
                  },
                  key: gIndex
                }, renderOptions(group[groupOptions], optionProps))
              }))
            ]
          }
          return [
            h('Select', {
              attrs,
              props,
              on
            }, renderOptions(options, optionProps))
          ]
        },
        renderCell (renderOpts, params) {
          return cellText(getSelectCellValue(renderOpts, params))
        },
        renderFilter (renderOpts, params) {
          const { options = [], optionGroups, optionProps = {}, optionGroupProps = {} } = renderOpts
          const groupOptions = optionGroupProps.options || 'options'
          const groupLabel = optionGroupProps.label || 'label'
          const { column } = params
          const { attrs } = renderOpts
          return [
            h('div', {
              class: 'vxe-table--filter-iview-wrapper'
            }, optionGroups
              ? column.filters.map((option, oIndex) => {
                const optionValue = option.data
                const props = getCellEditFilterProps(renderOpts, params, optionValue)
                return h('Select', {
                  key: oIndex,
                  attrs,
                  props,
                  on: getFilterOns(renderOpts, params, option, () => {
                    // 处理 change 事件相关逻辑
                    handleConfirmFilter(params, props.multiple ? (option.data && option.data.length > 0) : !XEUtils.eqNull(option.data), option)
                  })
                }, XEUtils.map(optionGroups, (group, gIndex) => {
                  return h('OptionGroup', {
                    key: gIndex,
                    props: {
                      label: group[groupLabel]
                    }
                  }, renderOptions(group[groupOptions], optionProps))
                }))
              })
              : column.filters.map((option, oIndex) => {
                const optionValue = option.data
                const props = getCellEditFilterProps(renderOpts, params, optionValue)
                return h('Select', {
                  key: oIndex,
                  attrs,
                  props,
                  on: getFilterOns(renderOpts, params, option, () => {
                    // 处理 change 事件相关逻辑
                    handleConfirmFilter(params, props.multiple ? (option.data && option.data.length > 0) : !XEUtils.eqNull(option.data), option)
                  })
                }, renderOptions(options, optionProps))
              })
            )
          ]
        },
        filterMethod (params) {
          const { option, row, column } = params
          const { data } = option
          const { property, filterRender: renderOpts } = column
          const { props = {} } = renderOpts
          const cellValue = XEUtils.get(row, property)
          if (props.multiple) {
            if (XEUtils.isArray(cellValue)) {
              return XEUtils.includeArrays(cellValue, data)
            }
            return data.indexOf(cellValue) > -1
          }
          /* eslint-disable eqeqeq */
          return cellValue == data
        },
        renderItemContent (renderOpts, params) {
          const { options = [], optionGroups, optionProps = {}, optionGroupProps = {} } = renderOpts
          const { data, property } = params
          const { attrs } = renderOpts
          const itemValue = XEUtils.get(data, property)
          const props = getItemProps(renderOpts, params, itemValue)
          const on = getItemOns(renderOpts, params)
          if (optionGroups) {
            const groupOptions = optionGroupProps.options || 'options'
            const groupLabel = optionGroupProps.label || 'label'
            return [
              h('Select', {
                props,
                attrs,
                on
              }, XEUtils.map(optionGroups, (group, gIndex) => {
                return h('OptionGroup', {
                  key: gIndex,
                  props: {
                    label: group[groupLabel]
                  }
                }, renderOptions(group[groupOptions], optionProps))
              }))
            ]
          }
          return [
            h('Select', {
              props,
              attrs,
              on
            }, renderOptions(options, optionProps))
          ]
        },
        exportMethod: createExportMethod(getSelectCellValue)
      },
      ICascader: {
        renderEdit: createEditRender({ transfer: true }),
        renderCell (renderOpts, params) {
          return cellText(getCascaderCellValue(renderOpts, params))
        },
        renderItemContent: createFormItemRender(),
        exportMethod: createExportMethod(getCascaderCellValue)
      },
      IDatePicker: {
        renderEdit: createEditRender({ transfer: true }),
        renderCell (renderOpts, params) {
          return cellText(getDatePickerCellValue(renderOpts, params))
        },
        renderFilter (renderOpts, params) {
          const { column } = params
          const { attrs } = renderOpts
          return [
            h('div', {
              class: 'vxe-table--filter-iview-wrapper'
            }, column.filters.map((option, oIndex) => {
              const optionValue = option.data
              return h(renderOpts.name, {
                key: oIndex,
                attrs,
                props: getCellEditFilterProps(renderOpts, params, optionValue),
                on: getFilterOns(renderOpts, params, option, () => {
                  // 处理 change 事件相关逻辑
                  handleConfirmFilter(params, !!option.data, option)
                })
              })
            }))
          ]
        },
        filterMethod (params) {
          const { option, row, column } = params
          const { data } = option
          const { filterRender: renderOpts } = column
          const { props = {} } = renderOpts
          const cellValue = XEUtils.get(row, column.field)
          if (data) {
            switch (props.type) {
              case 'daterange':
                return equalDaterange(cellValue, data, props, 'yyyy-MM-dd')
              case 'datetimerange':
                return equalDaterange(cellValue, data, props, 'yyyy-MM-dd HH:ss:mm')
              default:
                return cellValue === data
            }
          }
          return false
        },
        renderItemContent: createFormItemRender(),
        exportMethod: createExportMethod(getDatePickerCellValue)
      },
      ITimePicker: {
        renderEdit: createEditRender({ transfer: true }),
        renderItemContent: createFormItemRender()
      },
      IRate: {
        renderDefault: createEditRender(),
        renderEdit: createEditRender(),
        renderFilter: createFilterRender(),
        filterMethod: defaultFilterMethod,
        renderItemContent: createFormItemRender()
      },
      ISwitch: {
        renderDefault: createEditRender(),
        renderEdit: createEditRender(),
        renderFilter (renderOpts, params) {
          const { column } = params
          const { name, attrs } = renderOpts
          return [
            h('div', {
              class: 'vxe-table--filter-iview-wrapper'
            }, column.filters.map((option, oIndex) => {
              const optionValue = option.data
              return h(name, {
                key: oIndex,
                attrs,
                props: getCellEditFilterProps(renderOpts, params, optionValue),
                on: getFilterOns(renderOpts, params, option, () => {
                  // 处理 change 事件相关逻辑
                  handleConfirmFilter(params, XEUtils.isBoolean(option.data), option)
                })
              })
            }))
          ]
        },
        filterMethod: defaultFilterMethod,
        renderItemContent: createFormItemRender()
      },
      IRadio: {
        renderItemContent: createFormItemRadioAndCheckboxRender()
      },
      ICheckbox: {
        renderItemContent: createFormItemRadioAndCheckboxRender()
      },
      IButton: {
        renderEdit: defaultButtonEditRender,
        renderDefault: defaultButtonEditRender,
        renderItemContent: defaultButtonItemRender
      },
      IButtons: {
        renderEdit: defaultButtonsEditRender,
        renderDefault: defaultButtonsEditRender,
        renderItemContent: defaultButtonsItemRender
      }
    })

    vxetable.interceptor.add('event.clearFilter', handleClearEvent)
    vxetable.interceptor.add('event.clearActived', handleClearEvent)
    vxetable.interceptor.add('event.clearAreas', handleClearEvent)
  }
}

if (typeof window !== 'undefined' && window.VXETable && window.VXETable.use) {
  window.VXETable.use(VXETablePluginIView)
}

export default VXETablePluginIView
