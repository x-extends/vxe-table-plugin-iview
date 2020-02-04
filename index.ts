import XEUtils from 'xe-utils/methods/xe-utils'
import VXETable from 'vxe-table/lib/vxe-table'

function isEmptyValue (cellValue: any) {
  return cellValue === null || cellValue === undefined || cellValue === ''
}

function getFormatDate (value: any, props: any, defaultFormat: string) {
  return XEUtils.toDateString(value, props.format || defaultFormat)
}

function getFormatDates (values: any, props: any, separator: string, defaultFormat: string) {
  return XEUtils.map(values, (date: any) => getFormatDate(date, props, defaultFormat)).join(separator)
}

function equalDaterange (cellValue: any, data: any, props: any, defaultFormat: string) {
  cellValue = getFormatDate(cellValue, props, defaultFormat)
  return cellValue >= getFormatDate(data[0], props, defaultFormat) && cellValue <= getFormatDate(data[1], props, defaultFormat)
}

function matchCascaderData (index: number, list: Array<any>, values: Array<any>, labels: Array<any>) {
  let val = values[index]
  if (list && values.length > index) {
    XEUtils.each(list, (item: any) => {
      if (item.value === val) {
        labels.push(item.label)
        matchCascaderData(++index, item.children, values, labels)
      }
    })
  }
}

function getProps ({ $table }: any, { props }: any, defaultProps?: any) {
  return XEUtils.assign($table.vSize ? { size: $table.vSize } : {}, defaultProps, props)
}

function getCellEvents (renderOpts: any, params: any) {
  let { events } = renderOpts
  let { $table } = params
  let type = 'on-change'
  let on = {
    [type]: (evnt: any) => {
      $table.updateStatus(params)
      if (events && events[type]) {
        events[type](params, evnt)
      }
    }
  }
  if (events) {
    return XEUtils.assign({}, XEUtils.objectMap(events, (cb: Function) => function (...args: any[]) {
      cb.apply(null, [params].concat.apply(params, args))
    }), on)
  }
  return on
}

function getSelectCellValue (renderOpts: any, params: any) {
  let { options, optionGroups, props = {}, optionProps = {}, optionGroupProps = {} } = renderOpts
  let { $table, row, column } = params
  let labelProp = optionProps.label || 'label'
  let valueProp = optionProps.value || 'value'
  let groupOptions = optionGroupProps.options || 'options'
  let cellValue = XEUtils.get(row, column.property)
  let colid: string = column.id
  let rest: any
  let cellData: any
  if (props.filterable) {
    let fullAllDataRowMap: Map<any, any> = $table.fullAllDataRowMap
    let cacheCell: any = fullAllDataRowMap.has(row)
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
    return XEUtils.map(props.multiple ? cellValue : [cellValue], optionGroups ? (value: any) => {
      let selectItem
      for (let index = 0; index < optionGroups.length; index++) {
        selectItem = XEUtils.find(optionGroups[index][groupOptions], (item: any) => item[valueProp] === value)
        if (selectItem) {
          break
        }
      }
      let cellLabel: any = selectItem ? selectItem[labelProp] : value
      if (cellData && options && options.length) {
        cellData[colid] = { value: cellValue, label: cellLabel }
      }
      return cellLabel
    } : (value: any) => {
      let selectItem = XEUtils.find(options, (item: any) => item[valueProp] === value)
      let cellLabel: any = selectItem ? selectItem[labelProp] : value
      if (cellData && options && options.length) {
        cellData[colid] = { value: cellValue, label: cellLabel }
      }
      return cellLabel
    }).join(';')
  }
  return null
}

function getCascaderCellValue (renderOpts: any, params: any) {
  let { props = {} } = renderOpts
  let { row, column } = params
  let cellValue = XEUtils.get(row, column.property)
  let values = cellValue || []
  let labels: Array<any> = []
  matchCascaderData(0, props.data, values, labels)
  return labels.join(` ${props.separator || '/'} `)
}

function getDatePickerCellValue (renderOpts: any, params: any) {
  let { props = {} } = renderOpts
  let { row, column } = params
  let { separator } = props
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

function createEditRender (defaultProps?: any) {
  return function (h: Function, renderOpts: any, params: any) {
    let { row, column } = params
    let { attrs } = renderOpts
    let props = getProps(params, renderOpts, defaultProps)
    return [
      h(renderOpts.name, {
        props,
        attrs,
        model: {
          value: XEUtils.get(row, column.property),
          callback (value: any) {
            XEUtils.set(row, column.property, value)
          }
        },
        on: getCellEvents(renderOpts, params)
      })
    ]
  }
}

function getFilterEvents (on: any, renderOpts: any, params: any, context: any) {
  let { events } = renderOpts
  if (events) {
    return XEUtils.assign({}, XEUtils.objectMap(events, (cb: Function) => function (...args: any[]) {
      params = Object.assign({ context }, params)
      cb.apply(null, [params].concat.apply(params, args))
    }), on)
  }
  return on
}

function createFilterRender (defaultProps?: any) {
  return function (h: Function, renderOpts: any, params: any, context: any) {
    let { column } = params
    let { name, attrs, events } = renderOpts
    let type = 'on-change'
    let props = getProps(params, renderOpts)
    return column.filters.map((item: any) => {
      return h(name, {
        props,
        attrs,
        model: {
          value: item.data,
          callback (optionValue: any) {
            item.data = optionValue
          }
        },
        on: getFilterEvents({
          [type] (evnt: any) {
            handleConfirmFilter(context, column, !!item.data, item)
            if (events && events[type]) {
              events[type](Object.assign({ context }, params), evnt)
            }
          }
        }, renderOpts, params, context)
      })
    })
  }
}

function handleConfirmFilter (context: any, column: any, checked: any, item: any) {
  context[column.filterMultiple ? 'changeMultipleOption' : 'changeRadioOption']({}, checked, item)
}

function defaultFilterMethod ({ option, row, column }: any) {
  let { data } = option
  let cellValue = XEUtils.get(row, column.property)
  /* eslint-disable eqeqeq */
  return cellValue === data
}

function renderOptions (h: Function, options: any, optionProps: any) {
  let labelProp = optionProps.label || 'label'
  let valueProp = optionProps.value || 'value'
  let disabledProp = optionProps.disabled || 'disabled'
  return XEUtils.map(options, (item: any, index: number) => {
    return h('Option', {
      props: {
        value: item[valueProp],
        label: item[labelProp],
        disabled: item[disabledProp]
      },
      key: index
    })
  })
}

function cellText (h: Function, cellValue: any) {
  return ['' + (isEmptyValue(cellValue) ? '' : cellValue)]
}

function createFormItemRender (defaultProps?: any) {
  return function (h: Function, renderOpts: any, params: any, context: any) {
    let { data, property } = params
    let { name } = renderOpts
    let { attrs }: any = renderOpts
    let props: any = getFormProps(context, renderOpts, defaultProps)
    return [
      h(name, {
        attrs,
        props,
        model: {
          value: XEUtils.get(data, property),
          callback (value: any) {
            XEUtils.set(data, property, value)
          }
        },
        on: getFormEvents(renderOpts, params, context)
      })
    ]
  }
}

function getFormProps ({ $form }: any, { props }: any, defaultProps?: any) {
  return XEUtils.assign($form.vSize ? { size: $form.vSize } : {}, defaultProps, props)
}

function getFormEvents (renderOpts: any, params: any, context: any) {
  let { events }: any = renderOpts
  let { $form } = params
  let type = 'on-change'
  let on = {
    [type]: (evnt: any) => {
      $form.updateStatus(params)
      if (events && events[type]) {
        events[type](params, evnt)
      }
    }
  }
  if (events) {
    return XEUtils.assign({}, XEUtils.objectMap(events, (cb: Function) => function (...args: any[]) {
      cb.apply(null, [params].concat.apply(params, args))
    }), on)
  }
  return on
}

function createExportMethod (valueMethod: Function, isEdit?: boolean) {
  const renderProperty = isEdit ? 'editRender' : 'cellRender'
  return function (params: any) {
    return valueMethod(params.column[renderProperty], params)
  }
}

/**
 * 渲染函数
 */
const renderMap: any = {
  Input: {
    autofocus: 'input.ivu-input',
    renderDefault: createEditRender(),
    renderEdit: createEditRender(),
    renderFilter: createFilterRender(),
    filterMethod: defaultFilterMethod,
    renderItem: createFormItemRender()
  },
  AutoComplete: {
    autofocus: 'input.ivu-input',
    renderDefault: createEditRender(),
    renderEdit: createEditRender(),
    renderFilter: createFilterRender(),
    filterMethod: defaultFilterMethod,
    renderItem: createFormItemRender()
  },
  InputNumber: {
    autofocus: 'input.ivu-input-number-input',
    renderDefault: createEditRender(),
    renderEdit: createEditRender(),
    renderFilter: createFilterRender(),
    filterMethod: defaultFilterMethod,
    renderItem: createFormItemRender()
  },
  Select: {
    renderEdit (h: Function, renderOpts: any, params: any) {
      let { options, optionGroups, optionProps = {}, optionGroupProps = {} } = renderOpts
      let { row, column } = params
      let { attrs } = renderOpts
      let props = getProps(params, renderOpts, { transfer: true })
      if (optionGroups) {
        let groupOptions = optionGroupProps.options || 'options'
        let groupLabel = optionGroupProps.label || 'label'
        return [
          h('Select', {
            props,
            attrs,
            model: {
              value: XEUtils.get(row, column.property),
              callback (cellValue: any) {
                XEUtils.set(row, column.property, cellValue)
              }
            },
            on: getCellEvents(renderOpts, params)
          }, XEUtils.map(optionGroups, (group: any, gIndex: number) => {
            return h('OptionGroup', {
              props: {
                label: group[groupLabel]
              },
              key: gIndex
            }, renderOptions(h, group[groupOptions], optionProps))
          }))
        ]
      }
      return [
        h('Select', {
          props,
          attrs,
          model: {
            value: XEUtils.get(row, column.property),
            callback (cellValue: any) {
              XEUtils.set(row, column.property, cellValue)
            }
          },
          on: getCellEvents(renderOpts, params)
        }, renderOptions(h, options, optionProps))
      ]
    },
    renderCell (h: Function, renderOpts: any, params: any) {
      cellText(h, getSelectCellValue(renderOpts, params))
    },
    renderFilter (h: Function, renderOpts: any, params: any, context: any) {
      let { options, optionGroups, optionProps = {}, optionGroupProps = {} } = renderOpts
      let { column } = params
      let { attrs, events } = renderOpts
      let props = getProps(params, renderOpts, { transfer: true })
      let type = 'on-change'
      if (optionGroups) {
        let groupOptions = optionGroupProps.options || 'options'
        let groupLabel = optionGroupProps.label || 'label'
        return column.filters.map((item: any) => {
          return h('Select', {
            props,
            attrs,
            model: {
              value: item.data,
              callback (optionValue: any) {
                item.data = optionValue
              }
            },
            on: getFilterEvents({
              [type] (value: any) {
                handleConfirmFilter(context, column, value && value.length > 0, item)
                if (events && events[type]) {
                  events[type](Object.assign({ context }, params), value)
                }
              }
            }, renderOpts, params, context)
          }, XEUtils.map(optionGroups, (group: any, gIndex: number) => {
            return h('OptionGroup', {
              props: {
                label: group[groupLabel]
              },
              key: gIndex
            }, renderOptions(h, group[groupOptions], optionProps))
          }))
        })
      }
      return column.filters.map((item: any) => {
        return h('Select', {
          props,
          attrs,
          model: {
            value: item.data,
            callback (optionValue: any) {
              item.data = optionValue
            }
          },
          on: getFilterEvents({
            [type] (value: any) {
              handleConfirmFilter(context, column, value && value.length > 0, item)
              if (events && events[type]) {
                events[type](Object.assign({ context }, params), value)
              }
            }
          }, renderOpts, params, context)
        }, renderOptions(h, options, optionProps))
      })
    },
    filterMethod ({ option, row, column }: any) {
      let { data } = option
      let { property, filterRender: renderOpts } = column
      let { props = {} } = renderOpts
      let cellValue = XEUtils.get(row, property)
      if (props.multiple) {
        if (XEUtils.isArray(cellValue)) {
          return XEUtils.includeArrays(cellValue, data)
        }
        return data.indexOf(cellValue) > -1
      }
      /* eslint-disable eqeqeq */
      return cellValue == data
    },
    renderItem (h: Function, renderOpts: any, params: any, context: any) {
      let { options, optionGroups, optionProps = {}, optionGroupProps = {} } = renderOpts
      let { data, property } = params
      let { attrs } = renderOpts
      let props: any = getFormProps(context, renderOpts)
      if (optionGroups) {
        let groupOptions: string = optionGroupProps.options || 'options'
        let groupLabel: string = optionGroupProps.label || 'label'
        return [
          h('Select', {
            props,
            attrs,
            model: {
              value: XEUtils.get(data, property),
              callback (cellValue: any) {
                XEUtils.set(data, property, cellValue)
              }
            },
            on: getFormEvents(renderOpts, params, context)
          }, XEUtils.map(optionGroups, (group: any, gIndex: number) => {
            return h('OptionGroup', {
              props: {
                label: group[groupLabel]
              },
              key: gIndex
            }, renderOptions(h, group[groupOptions], optionProps))
          }))
        ]
      }
      return [
        h('Select', {
          props,
          attrs,
          model: {
            value: XEUtils.get(data, property),
            callback (cellValue: any) {
              XEUtils.set(data, property, cellValue)
            }
          },
          on: getFormEvents(renderOpts, params, context)
        }, renderOptions(h, options, optionProps))
      ]
    },
    editExportMethod: createExportMethod(getSelectCellValue, true),
    cellExportMethod: createExportMethod(getSelectCellValue)
  },
  Cascader: {
    renderEdit: createEditRender({ transfer: true }),
    renderCell (h: Function, renderOpts: any, params: any) {
      return cellText(h, getCascaderCellValue(renderOpts, params))
    },
    renderItem: createFormItemRender(),
    editExportMethod: createExportMethod(getCascaderCellValue, true),
    cellExportMethod: createExportMethod(getCascaderCellValue)
  },
  DatePicker: {
    renderEdit: createEditRender({ transfer: true }),
    renderCell (h: Function, renderOpts: any, params: any) {
      return cellText(h, getDatePickerCellValue(renderOpts, params))
    },
    renderFilter (h: Function, renderOpts: any, params: any, context: any) {
      let { column } = params
      let { attrs, events } = renderOpts
      let props = getProps(params, renderOpts, { transfer: true })
      let type = 'on-change'
      return column.filters.map((item: any) => {
        return h(renderOpts.name, {
          props,
          attrs,
          model: {
            value: item.data,
            callback (optionValue: any) {
              item.data = optionValue
            }
          },
          on: getFilterEvents({
            [type] (value: any) {
              handleConfirmFilter(context, column, !!value, item)
              if (events && events[type]) {
                events[type](Object.assign({ context }, params), value)
              }
            }
          }, renderOpts, params, context)
        })
      })
    },
    filterMethod ({ option, row, column }: any) {
      let { data } = option
      let { filterRender: renderOpts } = column
      let { props = {} } = renderOpts
      let cellValue = XEUtils.get(row, column.property)
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
    renderItem: createFormItemRender(),
    editExportMethod: createExportMethod(getDatePickerCellValue, true),
    cellExportMethod: createExportMethod(getDatePickerCellValue)
  },
  TimePicker: {
    renderEdit: createEditRender({ transfer: true }),
    renderItem: createFormItemRender()
  },
  Rate: {
    renderDefault: createEditRender(),
    renderEdit: createEditRender(),
    renderFilter: createFilterRender(),
    filterMethod: defaultFilterMethod,
    renderItem: createFormItemRender()
  },
  iSwitch: {
    renderDefault: createEditRender(),
    renderEdit: createEditRender(),
    renderFilter: createFilterRender(),
    filterMethod: defaultFilterMethod,
    renderItem: createFormItemRender()
  }
}

/**
 * 事件兼容性处理
 */
function handleClearEvent (params: any, evnt: any, context: any) {
  let { getEventTargetNode } = context
  let bodyElem = document.body
  if (
    // 下拉框、日期
    getEventTargetNode(evnt, bodyElem, 'ivu-select-dropdown').flag
  ) {
    return false
  }
}

/**
 * 基于 vxe-table 表格的适配插件，用于兼容 iview 组件库
 */
export const VXETablePluginIView = {
  install (xtable: typeof VXETable) {
    let { interceptor, renderer } = xtable
    renderer.mixin(renderMap)
    interceptor.add('event.clearFilter', handleClearEvent)
    interceptor.add('event.clearActived', handleClearEvent)
  }
}

if (typeof window !== 'undefined' && window.VXETable) {
  window.VXETable.use(VXETablePluginIView)
}

export default VXETablePluginIView
