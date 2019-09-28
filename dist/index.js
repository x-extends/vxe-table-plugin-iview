(function (global, factory) {
  if (typeof define === "function" && define.amd) {
    define("vxe-table-plugin-iview", [], factory);
  } else if (typeof exports !== "undefined") {
    factory();
  } else {
    var mod = {
      exports: {}
    };
    factory();
    global.VXETablePluginIView = mod.exports.default;
  }
})(this, function () {
  "use strict";

  exports.__esModule = true;

  var xe_utils_1 = require("xe-utils");

  function getFormatDate(value, props, defaultFormat) {
    return xe_utils_1["default"].toDateString(value, props.format || defaultFormat);
  }

  function getFormatDates(values, props, separator, defaultFormat) {
    return xe_utils_1["default"].map(values, function (date) {
      return getFormatDate(date, props, defaultFormat);
    }).join(separator);
  }

  function equalDaterange(cellValue, data, props, defaultFormat) {
    cellValue = getFormatDate(cellValue, props, defaultFormat);
    return cellValue >= getFormatDate(data[0], props, defaultFormat) && cellValue <= getFormatDate(data[1], props, defaultFormat);
  }

  function matchCascaderData(index, list, values, labels) {
    var val = values[index];

    if (list && values.length > index) {
      xe_utils_1["default"].each(list, function (item) {
        if (item.value === val) {
          labels.push(item.label);
          matchCascaderData(++index, item.children, values, labels);
        }
      });
    }
  }

  function getProps(_a, _b) {
    var $table = _a.$table;
    var props = _b.props;
    return xe_utils_1["default"].assign($table.vSize ? {
      size: $table.vSize
    } : {}, props);
  }

  function getCellEvents(renderOpts, params) {
    var _a;

    var events = renderOpts.events;
    var $table = params.$table;
    var type = 'on-change';
    var on = (_a = {}, _a[type] = function () {
      return $table.updateStatus(params);
    }, _a);

    if (events) {
      xe_utils_1["default"].assign(on, xe_utils_1["default"].objectMap(events, function (cb) {
        return function () {
          cb.apply(null, [params].concat.apply(params, arguments));
        };
      }));
    }

    return on;
  }

  function defaultEditRender(h, renderOpts, params) {
    var row = params.row,
        column = params.column;
    var attrs = renderOpts.attrs;
    var props = getProps(params, renderOpts);
    return [h(renderOpts.name, {
      props: props,
      attrs: attrs,
      model: {
        value: xe_utils_1["default"].get(row, column.property),
        callback: function callback(value) {
          xe_utils_1["default"].set(row, column.property, value);
        }
      },
      on: getCellEvents(renderOpts, params)
    })];
  }

  function getFilterEvents(on, renderOpts, params) {
    var events = renderOpts.events;

    if (events) {
      xe_utils_1["default"].assign(on, xe_utils_1["default"].objectMap(events, function (cb) {
        return function () {
          cb.apply(null, [params].concat.apply(params, arguments));
        };
      }));
    }

    return on;
  }

  function defaultFilterRender(h, renderOpts, params, context) {
    var column = params.column;
    var name = renderOpts.name,
        attrs = renderOpts.attrs;
    var type = 'on-change';
    var props = getProps(params, renderOpts);
    return column.filters.map(function (item) {
      var _a;

      return h(name, {
        props: props,
        attrs: attrs,
        model: {
          value: item.data,
          callback: function callback(optionValue) {
            item.data = optionValue;
          }
        },
        on: getFilterEvents((_a = {}, _a[type] = function () {
          handleConfirmFilter(context, column, !!item.data, item);
        }, _a), renderOpts, params)
      });
    });
  }

  function handleConfirmFilter(context, column, checked, item) {
    context[column.filterMultiple ? 'changeMultipleOption' : 'changeRadioOption']({}, checked, item);
  }

  function defaultFilterMethod(_a) {
    var option = _a.option,
        row = _a.row,
        column = _a.column;
    var data = option.data;
    var cellValue = xe_utils_1["default"].get(row, column.property);
    /* eslint-disable eqeqeq */

    return cellValue === data;
  }

  function renderOptions(h, options, optionProps) {
    var labelProp = optionProps.label || 'label';
    var valueProp = optionProps.value || 'value';
    return xe_utils_1["default"].map(options, function (item, index) {
      return h('Option', {
        props: {
          value: item[valueProp],
          label: item[labelProp]
        },
        key: index
      });
    });
  }

  function cellText(h, cellValue) {
    return ['' + (cellValue === null || cellValue === void 0 ? '' : cellValue)];
  }
  /**
   * 渲染函数
   */


  var renderMap = {
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
      renderEdit: function renderEdit(h, renderOpts, params) {
        var options = renderOpts.options,
            optionGroups = renderOpts.optionGroups,
            _a = renderOpts.optionProps,
            optionProps = _a === void 0 ? {} : _a,
            _b = renderOpts.optionGroupProps,
            optionGroupProps = _b === void 0 ? {} : _b;
        var row = params.row,
            column = params.column;
        var attrs = renderOpts.attrs;
        var props = getProps(params, renderOpts);

        if (optionGroups) {
          var groupOptions_1 = optionGroupProps.options || 'options';
          var groupLabel_1 = optionGroupProps.label || 'label';
          return [h('Select', {
            props: props,
            attrs: attrs,
            model: {
              value: xe_utils_1["default"].get(row, column.property),
              callback: function callback(cellValue) {
                xe_utils_1["default"].set(row, column.property, cellValue);
              }
            },
            on: getCellEvents(renderOpts, params)
          }, xe_utils_1["default"].map(optionGroups, function (group, gIndex) {
            return h('OptionGroup', {
              props: {
                label: group[groupLabel_1]
              },
              key: gIndex
            }, renderOptions(h, group[groupOptions_1], optionProps));
          }))];
        }

        return [h('Select', {
          props: props,
          attrs: attrs,
          model: {
            value: xe_utils_1["default"].get(row, column.property),
            callback: function callback(cellValue) {
              xe_utils_1["default"].set(row, column.property, cellValue);
            }
          },
          on: getCellEvents(renderOpts, params)
        }, renderOptions(h, options, optionProps))];
      },
      renderCell: function renderCell(h, renderOpts, params) {
        var options = renderOpts.options,
            optionGroups = renderOpts.optionGroups,
            _a = renderOpts.props,
            props = _a === void 0 ? {} : _a,
            _b = renderOpts.optionProps,
            optionProps = _b === void 0 ? {} : _b,
            _c = renderOpts.optionGroupProps,
            optionGroupProps = _c === void 0 ? {} : _c;
        var row = params.row,
            column = params.column;
        var labelProp = optionProps.label || 'label';
        var valueProp = optionProps.value || 'value';
        var groupOptions = optionGroupProps.options || 'options';
        var cellValue = xe_utils_1["default"].get(row, column.property);

        if (!(cellValue === null || cellValue === undefined || cellValue === '')) {
          return cellText(h, xe_utils_1["default"].map(props.multiple ? cellValue : [cellValue], optionGroups ? function (value) {
            var selectItem;

            for (var index = 0; index < optionGroups.length; index++) {
              selectItem = xe_utils_1["default"].find(optionGroups[index][groupOptions], function (item) {
                return item[valueProp] === value;
              });

              if (selectItem) {
                break;
              }
            }

            return selectItem ? selectItem[labelProp] : null;
          } : function (value) {
            var selectItem = xe_utils_1["default"].find(options, function (item) {
              return item[valueProp] === value;
            });
            return selectItem ? selectItem[labelProp] : null;
          }).join(';'));
        }

        return cellText(h, '');
      },
      renderFilter: function renderFilter(h, renderOpts, params, context) {
        var options = renderOpts.options,
            optionGroups = renderOpts.optionGroups,
            _a = renderOpts.optionProps,
            optionProps = _a === void 0 ? {} : _a,
            _b = renderOpts.optionGroupProps,
            optionGroupProps = _b === void 0 ? {} : _b;
        var column = params.column;
        var attrs = renderOpts.attrs;
        var props = getProps(params, renderOpts);

        if (optionGroups) {
          var groupOptions_2 = optionGroupProps.options || 'options';
          var groupLabel_2 = optionGroupProps.label || 'label';
          return column.filters.map(function (item) {
            return h('Select', {
              props: props,
              attrs: attrs,
              model: {
                value: item.data,
                callback: function callback(optionValue) {
                  item.data = optionValue;
                }
              },
              on: getFilterEvents({
                'on-change': function onChange(value) {
                  handleConfirmFilter(context, column, value && value.length > 0, item);
                }
              }, renderOpts, params)
            }, xe_utils_1["default"].map(optionGroups, function (group, gIndex) {
              return h('OptionGroup', {
                props: {
                  label: group[groupLabel_2]
                },
                key: gIndex
              }, renderOptions(h, group[groupOptions_2], optionProps));
            }));
          });
        }

        return column.filters.map(function (item) {
          return h('Select', {
            props: props,
            attrs: attrs,
            model: {
              value: item.data,
              callback: function callback(optionValue) {
                item.data = optionValue;
              }
            },
            on: getFilterEvents({
              'on-change': function onChange(value) {
                handleConfirmFilter(context, column, value && value.length > 0, item);
              }
            }, renderOpts, params)
          }, renderOptions(h, options, optionProps));
        });
      },
      filterMethod: function filterMethod(_a) {
        var option = _a.option,
            row = _a.row,
            column = _a.column;
        var data = option.data;
        var property = column.property,
            renderOpts = column.filterRender;
        var _b = renderOpts.props,
            props = _b === void 0 ? {} : _b;
        var cellValue = xe_utils_1["default"].get(row, property);

        if (props.multiple) {
          if (xe_utils_1["default"].isArray(cellValue)) {
            return xe_utils_1["default"].includeArrays(cellValue, data);
          }

          return data.indexOf(cellValue) > -1;
        }
        /* eslint-disable eqeqeq */


        return cellValue == data;
      }
    },
    Cascader: {
      renderEdit: defaultEditRender,
      renderCell: function renderCell(h, _a, params) {
        var _b = _a.props,
            props = _b === void 0 ? {} : _b;
        var row = params.row,
            column = params.column;
        var cellValue = xe_utils_1["default"].get(row, column.property);
        var values = cellValue || [];
        var labels = [];
        matchCascaderData(0, props.data, values, labels);
        return cellText(h, labels.join(" " + (props.separator || '/') + " "));
      }
    },
    DatePicker: {
      renderEdit: defaultEditRender,
      renderCell: function renderCell(h, _a, params) {
        var _b = _a.props,
            props = _b === void 0 ? {} : _b;
        var row = params.row,
            column = params.column;
        var separator = props.separator;
        var cellValue = xe_utils_1["default"].get(row, column.property);

        switch (props.type) {
          case 'week':
            cellValue = getFormatDate(cellValue, props, 'yyyywWW');
            break;

          case 'month':
            cellValue = getFormatDate(cellValue, props, 'yyyy-MM');
            break;

          case 'year':
            cellValue = getFormatDate(cellValue, props, 'yyyy');
            break;

          case 'dates':
            cellValue = getFormatDates(cellValue, props, ', ', 'yyyy-MM-dd');
            break;

          case 'daterange':
            cellValue = getFormatDates(cellValue, props, " " + (separator || '-') + " ", 'yyyy-MM-dd');
            break;

          case 'datetimerange':
            cellValue = getFormatDates(cellValue, props, " " + (separator || '-') + " ", 'yyyy-MM-dd HH:ss:mm');
            break;

          default:
            cellValue = getFormatDate(cellValue, props, 'yyyy-MM-dd');
            break;
        }

        return cellText(h, cellValue);
      },
      renderFilter: function renderFilter(h, renderOpts, params, context) {
        var column = params.column;
        var attrs = renderOpts.attrs;
        var props = getProps(params, renderOpts);
        return column.filters.map(function (item) {
          return h(renderOpts.name, {
            props: props,
            attrs: attrs,
            model: {
              value: item.data,
              callback: function callback(optionValue) {
                item.data = optionValue;
              }
            },
            on: getFilterEvents({
              'on-change': function onChange(value) {
                handleConfirmFilter(context, column, !!value, item);
              }
            }, renderOpts, params)
          });
        });
      },
      filterMethod: function filterMethod(_a) {
        var option = _a.option,
            row = _a.row,
            column = _a.column;
        var data = option.data;
        var renderOpts = column.filterRender;
        var _b = renderOpts.props,
            props = _b === void 0 ? {} : _b;
        var cellValue = xe_utils_1["default"].get(row, column.property);

        if (data) {
          switch (props.type) {
            case 'daterange':
              return equalDaterange(cellValue, data, props, 'yyyy-MM-dd');

            case 'datetimerange':
              return equalDaterange(cellValue, data, props, 'yyyy-MM-dd HH:ss:mm');

            default:
              return cellValue === data;
          }
        }

        return false;
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
  };
  /**
   * 事件兼容性处理
   */

  function handleClearEvent(params, evnt, context) {
    var getEventTargetNode = context.getEventTargetNode;
    var bodyElem = document.body;

    if ( // 下拉框、日期
    getEventTargetNode(evnt, bodyElem, 'ivu-select-dropdown').flag) {
      return false;
    }
  }
  /**
   * 基于 vxe-table 表格的适配插件，用于兼容 iview 组件库
   */


  exports.VXETablePluginIView = {
    install: function install(xtable) {
      var interceptor = xtable.interceptor,
          renderer = xtable.renderer;
      renderer.mixin(renderMap);
      interceptor.add('event.clear_filter', handleClearEvent);
      interceptor.add('event.clear_actived', handleClearEvent);
    }
  };

  if (typeof window !== 'undefined' && window.VXETable) {
    window.VXETable.use(exports.VXETablePluginIView);
  }

  exports["default"] = exports.VXETablePluginIView;
});