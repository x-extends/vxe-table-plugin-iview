import XEUtils from 'xe-utils'

function getFormatDate (value, props, defaultFormat) {
  return XEUtils.toDateString(value, props.format || defaultFormat)
}

function getFormatDates (values, props, separator, defaultFormat) {
  return XEUtils.map(values, date => getFormatDate(date, props, defaultFormat)).join(separator)
}

function equalDaterange (cellValue, data, props, defaultFormat) {
  cellValue = getFormatDate(cellValue, props, defaultFormat)
  return cellValue >= getFormatDate(data[0], props, defaultFormat) && cellValue <= getFormatDate(data[1], props, defaultFormat)
}

function matchCascaderData (index, list, values, labels) {
  let val = values[index]
  if (list && values.length > index) {
    XEUtils.each(list, item => {
      if (item.value === val) {
        labels.push(item.label)
        matchCascaderData(++index, item.children, values, labels)
      }
    })
  }
}

function getCellEvents (editRender, params) {
  let { events } = editRender
  let { $table } = params
  let type = 'on-change'
  let on = {
    [type]: () => $table.updateStatus(params)
  }
  if (events) {
    XEUtils.assign(on, XEUtils.objectMap(events, cb => function () {
      cb.apply(null, [params].concat.apply(params, arguments))
    }))
  }
  return on
}

function defaultCellRender (h, editRender, params) {
  let { $table, row, column } = params
  let { props } = editRender
  if ($table.vSize) {
    props = XEUtils.assign({ size: $table.vSize }, props)
  }
  return [
    h(editRender.name, {
      props,
      model: {
        value: XEUtils.get(row, column.property),
        callback (value) {
          XEUtils.set(row, column.property, value)
        }
      },
      on: getCellEvents(editRender, params)
    })
  ]
}

function getFilterEvents (on, filterRender, params) {
  let { events } = filterRender
  if (events) {
    XEUtils.assign(on, XEUtils.objectMap(events, cb => function () {
      cb.apply(null, [params].concat.apply(params, arguments))
    }))
  }
  return on
}

function defaultFilterRender (h, filterRender, params, context) {
  let { $table, column } = params
  let { name, props } = filterRender
  let type = 'on-change'
  if ($table.vSize) {
    props = XEUtils.assign({ size: $table.vSize }, props)
  }
  return column.filters.map(item => {
    return h(name, {
      props,
      model: {
        value: item.data,
        callback (optionValue) {
          item.data = optionValue
        }
      },
      on: getFilterEvents({
        [type] () {
          context.changeMultipleOption({}, !!item.data, item)
        }
      }, filterRender, params)
    })
  })
}

function defaultFilterMethod ({ option, row, column }) {
  let { data } = option
  let cellValue = XEUtils.get(row, column.property)
  return cellValue === data
}

function cellText (h, cellValue) {
  return ['' + (cellValue === null || cellValue === void 0 ? '' : cellValue)]
}

/**
 * 渲染函数
 * renderEdit(h, editRender, params, context)
 * renderCell(h, editRender, params, context)
 */
const renderMap = {
  Input: {
    autofocus: 'input.ivu-input',
    renderEdit: defaultCellRender,
    renderFilter: defaultFilterRender,
    filterMethod: defaultFilterMethod
  },
  AutoComplete: {
    autofocus: 'input.ivu-input',
    renderEdit: defaultCellRender,
    renderFilter: defaultFilterRender,
    filterMethod: defaultFilterMethod
  },
  InputNumber: {
    autofocus: 'input.ivu-input-number-input',
    renderEdit: defaultCellRender,
    renderFilter: defaultFilterRender,
    filterMethod: defaultFilterMethod
  },
  Select: {
    renderEdit (h, editRender, params) {
      let { options, optionGroups, props = {}, optionProps = {}, optionGroupProps = {} } = editRender
      let { $table, row, column } = params
      let labelProp = optionProps.label || 'label'
      let valueProp = optionProps.value || 'value'
      if ($table.vSize) {
        props = XEUtils.assign({ size: $table.vSize }, props)
      }
      if (optionGroups) {
        let groupOptions = optionGroupProps.options || 'options'
        let groupLabel = optionGroupProps.label || 'label'
        return [
          h('Select', {
            props,
            model: {
              value: XEUtils.get(row, column.property),
              callback (cellValue) {
                XEUtils.set(row, column.property, cellValue)
              }
            },
            on: getCellEvents(editRender, params)
          }, XEUtils.map(optionGroups, (group, gIndex) => {
            return h('OptionGroup', {
              props: {
                label: group[groupLabel]
              },
              key: gIndex
            }, XEUtils.map(group[groupOptions], (item, index) => {
              return h('Option', {
                props: {
                  value: item[valueProp],
                  label: item[labelProp]
                },
                key: index
              })
            }))
          }))
        ]
      }
      return [
        h('Select', {
          props,
          model: {
            value: XEUtils.get(row, column.property),
            callback (cellValue) {
              XEUtils.set(row, column.property, cellValue)
            }
          },
          on: getCellEvents(editRender, params)
        }, XEUtils.map(options, (item, index) => {
          return h('Option', {
            props: {
              value: item[valueProp],
              label: item[labelProp]
            },
            key: index
          })
        }))
      ]
    },
    renderCell (h, editRender, params) {
      let { options, optionGroups, props = {}, optionProps = {}, optionGroupProps = {} } = editRender
      let { row, column } = params
      let labelProp = optionProps.label || 'label'
      let valueProp = optionProps.value || 'value'
      let groupOptions = optionGroupProps.options || 'options'
      let cellValue = XEUtils.get(row, column.property)
      if (!(cellValue === null || cellValue === undefined || cellValue === '')) {
        return cellText(h, XEUtils.map(props.multiple ? cellValue : [cellValue], optionGroups ? value => {
          let selectItem
          for (let index = 0; index < optionGroups.length; index++) {
            selectItem = XEUtils.find(optionGroups[index][groupOptions], item => item[valueProp] === value)
            if (selectItem) {
              break
            }
          }
          return selectItem ? selectItem[labelProp] : null
        } : value => {
          let selectItem = XEUtils.find(options, item => item[valueProp] === value)
          return selectItem ? selectItem[labelProp] : null
        }).join(';'))
      }
      return cellText(h, '')
    }
  },
  Cascader: {
    renderEdit: defaultCellRender,
    renderCell (h, { props = {} }, params) {
      let { row, column } = params
      let cellValue = XEUtils.get(row, column.property)
      let values = cellValue || []
      let labels = []
      matchCascaderData(0, props.data, values, labels)
      return cellText(h, labels.join(` ${props.separator || '/'} `))
    }
  },
  DatePicker: {
    renderEdit: defaultCellRender,
    renderCell (h, { props = {} }, params) {
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
    renderFilter (h, filterRender, params, context) {
      let { $table, column } = params
      let { props } = filterRender
      if ($table.vSize) {
        props = XEUtils.assign({ size: $table.vSize }, props)
      }
      return column.filters.map(item => {
        return h(filterRender.name, {
          props,
          model: {
            value: item.data,
            callback (optionValue) {
              item.data = optionValue
            }
          },
          on: getFilterEvents({
            'on-change' (value) {
              // 当前的选项是否选中，如果有值就是选中了，需要进行筛选
              context.changeMultipleOption({}, value && value.length > 0, item)
            }
          }, filterRender, params)
        })
      })
    },
    filterMethod ({ option, row, column }) {
      let { data } = option
      let { filterRender } = column
      let { props = {} } = filterRender
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
    renderEdit: defaultCellRender
  },
  Rate: {
    renderEdit: defaultCellRender
  },
  iSwitch: {
    renderEdit: defaultCellRender
  }
}

/**
 * 筛选兼容性处理
 */
function handleClearFilterEvent (params, evnt, context) {
  let { getEventTargetNode } = context
  if (
    // 下拉框、日期
    getEventTargetNode(evnt, document.body, 'ivu-select-dropdown').flag
  ) {
    return false
  }
}

/**
 * 单元格兼容性处理
 */
function handleClearActivedEvent (params, evnt, context) {
  let { getEventTargetNode } = context
  if (
    // 下拉框、日期
    getEventTargetNode(evnt, document.body, 'ivu-select-dropdown').flag
  ) {
    return false
  }
}

function VXETablePluginIView () {}

VXETablePluginIView.install = function ({ interceptor, renderer }) {
  // 添加到渲染器
  renderer.mixin(renderMap)
  // 处理事件冲突
  interceptor.add('event.clear_filter', handleClearFilterEvent)
  interceptor.add('event.clear_actived', handleClearActivedEvent)
}

if (typeof window !== 'undefined' && window.VXETable) {
  window.VXETable.use(VXETablePluginIView)
}

export default VXETablePluginIView
