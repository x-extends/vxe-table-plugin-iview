import XEUtils from 'xe-utils/methods/xe-utils'
import VXETable from 'vxe-table/lib/vxe-table'

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

function getProps ({ $table }: any, { props }: any) {
  return XEUtils.assign($table.vSize ? { size: $table.vSize } : {}, props)
}

function getCellEvents (renderOpts: any, params: any) {
  let { events } = renderOpts
  let { $table } = params
  let type = 'on-change'
  let on = {
    [type]: () => $table.updateStatus(params)
  }
  if (events) {
    XEUtils.assign(
      {}, 
      XEUtils.objectMap(events, (cb: Function) => function (...args: any[]) {
        cb.apply(null, [params].concat.apply(params, args))
      }),
      on
    )
  }
  return on
}

function defaultEditRender (h: Function, renderOpts: any, params: any) {
  let { row, column } = params
  let { attrs } = renderOpts
  let props = getProps(params, renderOpts)
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

function getFilterEvents (on: any, renderOpts: any, params: any) {
  let { events } = renderOpts
  if (events) {
    XEUtils.assign({}, XEUtils.objectMap(events, (cb: Function) => function (...args: any[]) {
      cb.apply(null, [params].concat.apply(params, args))
    }), on)
  }
  return on
}

function defaultFilterRender (h: Function, renderOpts: any, params: any, context: any) {
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
            events[type](params, evnt)
          }
        }
      }, renderOpts, params)
    })
  })
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
  return XEUtils.map(options, (item: any, index: number) => {
    return h('Option', {
      props: {
        value: item[valueProp],
        label: item[labelProp]
      },
      key: index
    })
  })
}

function cellText (h: Function, cellValue: any) {
  return ['' + (cellValue === null || cellValue === void 0 ? '' : cellValue)]
}

/**
 * 渲染函数
 */
const renderMap = {
  Input: {
    autofocus: 'input.ivu-input',
    renderDefault: defaultEditRender,
    renderEdit: defaultEditRender,
    renderFilter: defaultFilterRender,
    filterMethod: defaultFilterMethod
  },
  AutoComplete: {
    autofocus: 'input.ivu-input',
    renderDefault: defaultEditRender,
    renderEdit: defaultEditRender,
    renderFilter: defaultFilterRender,
    filterMethod: defaultFilterMethod
  },
  InputNumber: {
    autofocus: 'input.ivu-input-number-input',
    renderDefault: defaultEditRender,
    renderEdit: defaultEditRender,
    renderFilter: defaultFilterRender,
    filterMethod: defaultFilterMethod
  },
  Select: {
    renderEdit (h: Function, renderOpts: any, params: any) {
      let { options, optionGroups, optionProps = {}, optionGroupProps = {} } = renderOpts
      let { row, column } = params
      let { attrs } = renderOpts
      let props = getProps(params, renderOpts)
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
      let { options, optionGroups, props = {}, optionProps = {}, optionGroupProps = {} } = renderOpts
      let { row, column } = params
      let labelProp = optionProps.label || 'label'
      let valueProp = optionProps.value || 'value'
      let groupOptions = optionGroupProps.options || 'options'
      let cellValue = XEUtils.get(row, column.property)
      if (!(cellValue === null || cellValue === undefined || cellValue === '')) {
        return cellText(h, XEUtils.map(props.multiple ? cellValue : [cellValue], optionGroups ? (value: any) => {
          let selectItem
          for (let index = 0; index < optionGroups.length; index++) {
            selectItem = XEUtils.find(optionGroups[index][groupOptions], (item: any) => item[valueProp] === value)
            if (selectItem) {
              break
            }
          }
          return selectItem ? selectItem[labelProp] : null
        } : (value: any) => {
          let selectItem = XEUtils.find(options, (item: any) => item[valueProp] === value)
          return selectItem ? selectItem[labelProp] : null
        }).join(';'))
      }
      return cellText(h, '')
    },
    renderFilter (h: Function, renderOpts: any, params: any, context: any) {
      let { options, optionGroups, optionProps = {}, optionGroupProps = {} } = renderOpts
      let { column } = params
      let { attrs, events } = renderOpts
      let props = getProps(params, renderOpts)
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
                  events[type](params, value)
                }
              }
            }, renderOpts, params)
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
                events[type](params, value)
              }
            }
          }, renderOpts, params)
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
    }
  },
  Cascader: {
    renderEdit: defaultEditRender,
    renderCell (h: Function, { props = {} }: any, params: any) {
      let { row, column } = params
      let cellValue = XEUtils.get(row, column.property)
      let values = cellValue || []
      let labels: Array<any> = []
      matchCascaderData(0, props.data, values, labels)
      return cellText(h, labels.join(` ${props.separator || '/'} `))
    }
  },
  DatePicker: {
    renderEdit: defaultEditRender,
    renderCell (h: Function, { props = {} }: any, params: any) {
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
      return cellText(h, cellValue)
    },
    renderFilter (h: Function, renderOpts: any, params: any, context: any) {
      let { column } = params
      let { attrs, events } = renderOpts
      let props = getProps(params, renderOpts)
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
                events[type](params, value)
              }
            }
          }, renderOpts, params)
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
    }
  },
  TimePicker: {
    renderEdit: defaultEditRender
  },
  Rate: {
    renderDefault: defaultEditRender,
    renderEdit: defaultEditRender,
    renderFilter: defaultFilterRender,
    filterMethod: defaultFilterMethod
  },
  iSwitch: {
    renderDefault: defaultEditRender,
    renderEdit: defaultEditRender,
    renderFilter: defaultFilterRender,
    filterMethod: defaultFilterMethod
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
