"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = exports.VXETablePluginIView = void 0;

var _xeUtils = _interopRequireDefault(require("xe-utils/methods/xe-utils"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function getFormatDate(value, props, defaultFormat) {
  return _xeUtils["default"].toDateString(value, props.format || defaultFormat);
}

function getFormatDates(values, props, separator, defaultFormat) {
  return _xeUtils["default"].map(values, function (date) {
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
    _xeUtils["default"].each(list, function (item) {
      if (item.value === val) {
        labels.push(item.label);
        matchCascaderData(++index, item.children, values, labels);
      }
    });
  }
}

function getProps(_ref, _ref2, defaultProps) {
  var $table = _ref.$table;
  var props = _ref2.props;
  return _xeUtils["default"].assign($table.vSize ? {
    size: $table.vSize
  } : {}, defaultProps, props);
}

function getCellEvents(renderOpts, params) {
  var events = renderOpts.events;
  var $table = params.$table;
  var type = 'on-change';

  var on = _defineProperty({}, type, function () {
    return $table.updateStatus(params);
  });

  if (events) {
    return _xeUtils["default"].assign({}, _xeUtils["default"].objectMap(events, function (cb) {
      return function () {
        for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
          args[_key] = arguments[_key];
        }

        cb.apply(null, [params].concat.apply(params, args));
      };
    }), on);
  }

  return on;
}

function createEditRender(defaultProps) {
  return function (h, renderOpts, params) {
    var row = params.row,
        column = params.column;
    var attrs = renderOpts.attrs;
    var props = getProps(params, renderOpts, defaultProps);
    return [h(renderOpts.name, {
      props: props,
      attrs: attrs,
      model: {
        value: _xeUtils["default"].get(row, column.property),
        callback: function callback(value) {
          _xeUtils["default"].set(row, column.property, value);
        }
      },
      on: getCellEvents(renderOpts, params)
    })];
  };
}

function getFilterEvents(on, renderOpts, params, context) {
  var events = renderOpts.events;

  if (events) {
    return _xeUtils["default"].assign({}, _xeUtils["default"].objectMap(events, function (cb) {
      return function () {
        params = Object.assign({
          context: context
        }, params);

        for (var _len2 = arguments.length, args = new Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
          args[_key2] = arguments[_key2];
        }

        cb.apply(null, [params].concat.apply(params, args));
      };
    }), on);
  }

  return on;
}

function createFilterRender(defaultProps) {
  return function (h, renderOpts, params, context) {
    var column = params.column;
    var name = renderOpts.name,
        attrs = renderOpts.attrs,
        events = renderOpts.events;
    var type = 'on-change';
    var props = getProps(params, renderOpts);
    return column.filters.map(function (item) {
      return h(name, {
        props: props,
        attrs: attrs,
        model: {
          value: item.data,
          callback: function callback(optionValue) {
            item.data = optionValue;
          }
        },
        on: getFilterEvents(_defineProperty({}, type, function (evnt) {
          handleConfirmFilter(context, column, !!item.data, item);

          if (events && events[type]) {
            events[type](Object.assign({
              context: context
            }, params), evnt);
          }
        }), renderOpts, params, context)
      });
    });
  };
}

function handleConfirmFilter(context, column, checked, item) {
  context[column.filterMultiple ? 'changeMultipleOption' : 'changeRadioOption']({}, checked, item);
}

function defaultFilterMethod(_ref3) {
  var option = _ref3.option,
      row = _ref3.row,
      column = _ref3.column;
  var data = option.data;

  var cellValue = _xeUtils["default"].get(row, column.property);
  /* eslint-disable eqeqeq */


  return cellValue === data;
}

function renderOptions(h, options, optionProps) {
  var labelProp = optionProps.label || 'label';
  var valueProp = optionProps.value || 'value';
  var disabledProp = optionProps.disabled || 'disabled';
  return _xeUtils["default"].map(options, function (item, index) {
    return h('Option', {
      props: {
        value: item[valueProp],
        label: item[labelProp],
        disabled: item[disabledProp]
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
    renderDefault: createEditRender(),
    renderEdit: createEditRender(),
    renderFilter: createFilterRender(),
    filterMethod: defaultFilterMethod
  },
  AutoComplete: {
    autofocus: 'input.ivu-input',
    renderDefault: createEditRender(),
    renderEdit: createEditRender(),
    renderFilter: createFilterRender(),
    filterMethod: defaultFilterMethod
  },
  InputNumber: {
    autofocus: 'input.ivu-input-number-input',
    renderDefault: createEditRender(),
    renderEdit: createEditRender(),
    renderFilter: createFilterRender(),
    filterMethod: defaultFilterMethod
  },
  Select: {
    renderEdit: function renderEdit(h, renderOpts, params) {
      var options = renderOpts.options,
          optionGroups = renderOpts.optionGroups,
          _renderOpts$optionPro = renderOpts.optionProps,
          optionProps = _renderOpts$optionPro === void 0 ? {} : _renderOpts$optionPro,
          _renderOpts$optionGro = renderOpts.optionGroupProps,
          optionGroupProps = _renderOpts$optionGro === void 0 ? {} : _renderOpts$optionGro;
      var row = params.row,
          column = params.column;
      var attrs = renderOpts.attrs;
      var props = getProps(params, renderOpts, {
        transfer: true
      });

      if (optionGroups) {
        var groupOptions = optionGroupProps.options || 'options';
        var groupLabel = optionGroupProps.label || 'label';
        return [h('Select', {
          props: props,
          attrs: attrs,
          model: {
            value: _xeUtils["default"].get(row, column.property),
            callback: function callback(cellValue) {
              _xeUtils["default"].set(row, column.property, cellValue);
            }
          },
          on: getCellEvents(renderOpts, params)
        }, _xeUtils["default"].map(optionGroups, function (group, gIndex) {
          return h('OptionGroup', {
            props: {
              label: group[groupLabel]
            },
            key: gIndex
          }, renderOptions(h, group[groupOptions], optionProps));
        }))];
      }

      return [h('Select', {
        props: props,
        attrs: attrs,
        model: {
          value: _xeUtils["default"].get(row, column.property),
          callback: function callback(cellValue) {
            _xeUtils["default"].set(row, column.property, cellValue);
          }
        },
        on: getCellEvents(renderOpts, params)
      }, renderOptions(h, options, optionProps))];
    },
    renderCell: function renderCell(h, renderOpts, params) {
      var options = renderOpts.options,
          optionGroups = renderOpts.optionGroups,
          _renderOpts$props = renderOpts.props,
          props = _renderOpts$props === void 0 ? {} : _renderOpts$props,
          _renderOpts$optionPro2 = renderOpts.optionProps,
          optionProps = _renderOpts$optionPro2 === void 0 ? {} : _renderOpts$optionPro2,
          _renderOpts$optionGro2 = renderOpts.optionGroupProps,
          optionGroupProps = _renderOpts$optionGro2 === void 0 ? {} : _renderOpts$optionGro2;
      var row = params.row,
          column = params.column;
      var labelProp = optionProps.label || 'label';
      var valueProp = optionProps.value || 'value';
      var groupOptions = optionGroupProps.options || 'options';

      var cellValue = _xeUtils["default"].get(row, column.property);

      if (!(cellValue === null || cellValue === undefined || cellValue === '')) {
        return cellText(h, _xeUtils["default"].map(props.multiple ? cellValue : [cellValue], optionGroups ? function (value) {
          var selectItem;

          for (var index = 0; index < optionGroups.length; index++) {
            selectItem = _xeUtils["default"].find(optionGroups[index][groupOptions], function (item) {
              return item[valueProp] === value;
            });

            if (selectItem) {
              break;
            }
          }

          return selectItem ? selectItem[labelProp] : null;
        } : function (value) {
          var selectItem = _xeUtils["default"].find(options, function (item) {
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
          _renderOpts$optionPro3 = renderOpts.optionProps,
          optionProps = _renderOpts$optionPro3 === void 0 ? {} : _renderOpts$optionPro3,
          _renderOpts$optionGro3 = renderOpts.optionGroupProps,
          optionGroupProps = _renderOpts$optionGro3 === void 0 ? {} : _renderOpts$optionGro3;
      var column = params.column;
      var attrs = renderOpts.attrs,
          events = renderOpts.events;
      var props = getProps(params, renderOpts, {
        transfer: true
      });
      var type = 'on-change';

      if (optionGroups) {
        var groupOptions = optionGroupProps.options || 'options';
        var groupLabel = optionGroupProps.label || 'label';
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
            on: getFilterEvents(_defineProperty({}, type, function (value) {
              handleConfirmFilter(context, column, value && value.length > 0, item);

              if (events && events[type]) {
                events[type](Object.assign({
                  context: context
                }, params), value);
              }
            }), renderOpts, params, context)
          }, _xeUtils["default"].map(optionGroups, function (group, gIndex) {
            return h('OptionGroup', {
              props: {
                label: group[groupLabel]
              },
              key: gIndex
            }, renderOptions(h, group[groupOptions], optionProps));
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
          on: getFilterEvents(_defineProperty({}, type, function (value) {
            handleConfirmFilter(context, column, value && value.length > 0, item);

            if (events && events[type]) {
              events[type](Object.assign({
                context: context
              }, params), value);
            }
          }), renderOpts, params, context)
        }, renderOptions(h, options, optionProps));
      });
    },
    filterMethod: function filterMethod(_ref4) {
      var option = _ref4.option,
          row = _ref4.row,
          column = _ref4.column;
      var data = option.data;
      var property = column.property,
          renderOpts = column.filterRender;
      var _renderOpts$props2 = renderOpts.props,
          props = _renderOpts$props2 === void 0 ? {} : _renderOpts$props2;

      var cellValue = _xeUtils["default"].get(row, property);

      if (props.multiple) {
        if (_xeUtils["default"].isArray(cellValue)) {
          return _xeUtils["default"].includeArrays(cellValue, data);
        }

        return data.indexOf(cellValue) > -1;
      }
      /* eslint-disable eqeqeq */


      return cellValue == data;
    }
  },
  Cascader: {
    renderEdit: createEditRender({
      transfer: true
    }),
    renderCell: function renderCell(h, _ref5, params) {
      var _ref5$props = _ref5.props,
          props = _ref5$props === void 0 ? {} : _ref5$props;
      var row = params.row,
          column = params.column;

      var cellValue = _xeUtils["default"].get(row, column.property);

      var values = cellValue || [];
      var labels = [];
      matchCascaderData(0, props.data, values, labels);
      return cellText(h, labels.join(" ".concat(props.separator || '/', " ")));
    }
  },
  DatePicker: {
    renderEdit: createEditRender({
      transfer: true
    }),
    renderCell: function renderCell(h, _ref6, params) {
      var _ref6$props = _ref6.props,
          props = _ref6$props === void 0 ? {} : _ref6$props;
      var row = params.row,
          column = params.column;
      var separator = props.separator;

      var cellValue = _xeUtils["default"].get(row, column.property);

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
          cellValue = getFormatDates(cellValue, props, " ".concat(separator || '-', " "), 'yyyy-MM-dd');
          break;

        case 'datetimerange':
          cellValue = getFormatDates(cellValue, props, " ".concat(separator || '-', " "), 'yyyy-MM-dd HH:ss:mm');
          break;

        default:
          cellValue = getFormatDate(cellValue, props, 'yyyy-MM-dd');
          break;
      }

      return cellText(h, cellValue);
    },
    renderFilter: function renderFilter(h, renderOpts, params, context) {
      var column = params.column;
      var attrs = renderOpts.attrs,
          events = renderOpts.events;
      var props = getProps(params, renderOpts, {
        transfer: true
      });
      var type = 'on-change';
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
          on: getFilterEvents(_defineProperty({}, type, function (value) {
            handleConfirmFilter(context, column, !!value, item);

            if (events && events[type]) {
              events[type](Object.assign({
                context: context
              }, params), value);
            }
          }), renderOpts, params, context)
        });
      });
    },
    filterMethod: function filterMethod(_ref7) {
      var option = _ref7.option,
          row = _ref7.row,
          column = _ref7.column;
      var data = option.data;
      var renderOpts = column.filterRender;
      var _renderOpts$props3 = renderOpts.props,
          props = _renderOpts$props3 === void 0 ? {} : _renderOpts$props3;

      var cellValue = _xeUtils["default"].get(row, column.property);

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
    renderEdit: createEditRender({
      transfer: true
    })
  },
  Rate: {
    renderDefault: createEditRender(),
    renderEdit: createEditRender(),
    renderFilter: createFilterRender(),
    filterMethod: defaultFilterMethod
  },
  iSwitch: {
    renderDefault: createEditRender(),
    renderEdit: createEditRender(),
    renderFilter: createFilterRender(),
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


var VXETablePluginIView = {
  install: function install(xtable) {
    var interceptor = xtable.interceptor,
        renderer = xtable.renderer;
    renderer.mixin(renderMap);
    interceptor.add('event.clearFilter', handleClearEvent);
    interceptor.add('event.clearActived', handleClearEvent);
  }
};
exports.VXETablePluginIView = VXETablePluginIView;

if (typeof window !== 'undefined' && window.VXETable) {
  window.VXETable.use(VXETablePluginIView);
}

var _default = VXETablePluginIView;
exports["default"] = _default;
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImluZGV4LnRzIl0sIm5hbWVzIjpbImdldEZvcm1hdERhdGUiLCJ2YWx1ZSIsInByb3BzIiwiZGVmYXVsdEZvcm1hdCIsIlhFVXRpbHMiLCJ0b0RhdGVTdHJpbmciLCJmb3JtYXQiLCJnZXRGb3JtYXREYXRlcyIsInZhbHVlcyIsInNlcGFyYXRvciIsIm1hcCIsImRhdGUiLCJqb2luIiwiZXF1YWxEYXRlcmFuZ2UiLCJjZWxsVmFsdWUiLCJkYXRhIiwibWF0Y2hDYXNjYWRlckRhdGEiLCJpbmRleCIsImxpc3QiLCJsYWJlbHMiLCJ2YWwiLCJsZW5ndGgiLCJlYWNoIiwiaXRlbSIsInB1c2giLCJsYWJlbCIsImNoaWxkcmVuIiwiZ2V0UHJvcHMiLCJkZWZhdWx0UHJvcHMiLCIkdGFibGUiLCJhc3NpZ24iLCJ2U2l6ZSIsInNpemUiLCJnZXRDZWxsRXZlbnRzIiwicmVuZGVyT3B0cyIsInBhcmFtcyIsImV2ZW50cyIsInR5cGUiLCJvbiIsInVwZGF0ZVN0YXR1cyIsIm9iamVjdE1hcCIsImNiIiwiYXJncyIsImFwcGx5IiwiY29uY2F0IiwiY3JlYXRlRWRpdFJlbmRlciIsImgiLCJyb3ciLCJjb2x1bW4iLCJhdHRycyIsIm5hbWUiLCJtb2RlbCIsImdldCIsInByb3BlcnR5IiwiY2FsbGJhY2siLCJzZXQiLCJnZXRGaWx0ZXJFdmVudHMiLCJjb250ZXh0IiwiT2JqZWN0IiwiY3JlYXRlRmlsdGVyUmVuZGVyIiwiZmlsdGVycyIsIm9wdGlvblZhbHVlIiwiZXZudCIsImhhbmRsZUNvbmZpcm1GaWx0ZXIiLCJjaGVja2VkIiwiZmlsdGVyTXVsdGlwbGUiLCJkZWZhdWx0RmlsdGVyTWV0aG9kIiwib3B0aW9uIiwicmVuZGVyT3B0aW9ucyIsIm9wdGlvbnMiLCJvcHRpb25Qcm9wcyIsImxhYmVsUHJvcCIsInZhbHVlUHJvcCIsImRpc2FibGVkUHJvcCIsImRpc2FibGVkIiwia2V5IiwiY2VsbFRleHQiLCJyZW5kZXJNYXAiLCJJbnB1dCIsImF1dG9mb2N1cyIsInJlbmRlckRlZmF1bHQiLCJyZW5kZXJFZGl0IiwicmVuZGVyRmlsdGVyIiwiZmlsdGVyTWV0aG9kIiwiQXV0b0NvbXBsZXRlIiwiSW5wdXROdW1iZXIiLCJTZWxlY3QiLCJvcHRpb25Hcm91cHMiLCJvcHRpb25Hcm91cFByb3BzIiwidHJhbnNmZXIiLCJncm91cE9wdGlvbnMiLCJncm91cExhYmVsIiwiZ3JvdXAiLCJnSW5kZXgiLCJyZW5kZXJDZWxsIiwidW5kZWZpbmVkIiwibXVsdGlwbGUiLCJzZWxlY3RJdGVtIiwiZmluZCIsImZpbHRlclJlbmRlciIsImlzQXJyYXkiLCJpbmNsdWRlQXJyYXlzIiwiaW5kZXhPZiIsIkNhc2NhZGVyIiwiRGF0ZVBpY2tlciIsIlRpbWVQaWNrZXIiLCJSYXRlIiwiaVN3aXRjaCIsImhhbmRsZUNsZWFyRXZlbnQiLCJnZXRFdmVudFRhcmdldE5vZGUiLCJib2R5RWxlbSIsImRvY3VtZW50IiwiYm9keSIsImZsYWciLCJWWEVUYWJsZVBsdWdpbklWaWV3IiwiaW5zdGFsbCIsInh0YWJsZSIsImludGVyY2VwdG9yIiwicmVuZGVyZXIiLCJtaXhpbiIsImFkZCIsIndpbmRvdyIsIlZYRVRhYmxlIiwidXNlIl0sIm1hcHBpbmdzIjoiOzs7Ozs7O0FBQUE7Ozs7OztBQUdBLFNBQVNBLGFBQVQsQ0FBdUJDLEtBQXZCLEVBQW1DQyxLQUFuQyxFQUErQ0MsYUFBL0MsRUFBb0U7QUFDbEUsU0FBT0Msb0JBQVFDLFlBQVIsQ0FBcUJKLEtBQXJCLEVBQTRCQyxLQUFLLENBQUNJLE1BQU4sSUFBZ0JILGFBQTVDLENBQVA7QUFDRDs7QUFFRCxTQUFTSSxjQUFULENBQXdCQyxNQUF4QixFQUFxQ04sS0FBckMsRUFBaURPLFNBQWpELEVBQW9FTixhQUFwRSxFQUF5RjtBQUN2RixTQUFPQyxvQkFBUU0sR0FBUixDQUFZRixNQUFaLEVBQW9CLFVBQUNHLElBQUQ7QUFBQSxXQUFlWCxhQUFhLENBQUNXLElBQUQsRUFBT1QsS0FBUCxFQUFjQyxhQUFkLENBQTVCO0FBQUEsR0FBcEIsRUFBOEVT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SUFBQUEsV0FBVyxDQUFDRyxHQUFaLENBQWdCLG9CQUFoQixFQUFzQ1osZ0JBQXRDO0FBQ0Q7QUFOZ0MsQ0FBNUI7OztBQVNQLElBQUksT0FBT2EsTUFBUCxLQUFrQixXQUFsQixJQUFpQ0EsTUFBTSxDQUFDQyxRQUE1QyxFQUFzRDtBQUNwREQsRUFBQUEsTUFBTSxDQUFDQyxRQUFQLENBQWdCQyxHQUFoQixDQUFvQlQsbUJBQXBCO0FBQ0Q7O2VBRWNBLG1CIiwiZmlsZSI6ImluZGV4LmNvbW1vbi5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBYRVV0aWxzIGZyb20gJ3hlLXV0aWxzL21ldGhvZHMveGUtdXRpbHMnXHJcbmltcG9ydCBWWEVUYWJsZSBmcm9tICd2eGUtdGFibGUvbGliL3Z4ZS10YWJsZSdcclxuXHJcbmZ1bmN0aW9uIGdldEZvcm1hdERhdGUodmFsdWU6IGFueSwgcHJvcHM6IGFueSwgZGVmYXVsdEZvcm1hdDogc3RyaW5nKSB7XHJcbiAgcmV0dXJuIFhFVXRpbHMudG9EYXRlU3RyaW5nKHZhbHVlLCBwcm9wcy5mb3JtYXQgfHwgZGVmYXVsdEZvcm1hdClcclxufVxyXG5cclxuZnVuY3Rpb24gZ2V0Rm9ybWF0RGF0ZXModmFsdWVzOiBhbnksIHByb3BzOiBhbnksIHNlcGFyYXRvcjogc3RyaW5nLCBkZWZhdWx0Rm9ybWF0OiBzdHJpbmcpIHtcclxuICByZXR1cm4gWEVVdGlscy5tYXAodmFsdWVzLCAoZGF0ZTogYW55KSA9PiBnZXRGb3JtYXREYXRlKGRhdGUsIHByb3BzLCBkZWZhdWx0Rm9ybWF0KSkuam9pbihzZXBhcmF0b3IpXHJcbn1cclxuXHJcbmZ1bmN0aW9uIGVxdWFsRGF0ZXJhbmdlKGNlbGxWYWx1ZTogYW55LCBkYXRhOiBhbnksIHByb3BzOiBhbnksIGRlZmF1bHRGb3JtYXQ6IHN0cmluZykge1xyXG4gIGNlbGxWYWx1ZSA9IGdldEZvcm1hdERhdGUoY2VsbFZhbHVlLCBwcm9wcywgZGVmYXVsdEZvcm1hdClcclxuICByZXR1cm4gY2VsbFZhbHVlID49IGdldEZvcm1hdERhdGUoZGF0YVswXSwgcHJvcHMsIGRlZmF1bHRGb3JtYXQpICYmIGNlbGxWYWx1ZSA8PSBnZXRGb3JtYXREYXRlKGRhdGFbMV0sIHByb3BzLCBkZWZhdWx0Rm9ybWF0KVxyXG59XHJcblxyXG5mdW5jdGlvbiBtYXRjaENhc2NhZGVyRGF0YShpbmRleDogbnVtYmVyLCBsaXN0OiBBcnJheTxhbnk+LCB2YWx1ZXM6IEFycmF5PGFueT4sIGxhYmVsczogQXJyYXk8YW55Pikge1xyXG4gIGxldCB2YWwgPSB2YWx1ZXNbaW5kZXhdXHJcbiAgaWYgKGxpc3QgJiYgdmFsdWVzLmxlbmd0aCA+IGluZGV4KSB7XHJcbiAgICBYRVV0aWxzLmVhY2gobGlzdCwgKGl0ZW06IGFueSkgPT4ge1xyXG4gICAgICBpZiAoaXRlbS52YWx1ZSA9PT0gdmFsKSB7XHJcbiAgICAgICAgbGFiZWxzLnB1c2goaXRlbS5sYWJlbClcclxuICAgICAgICBtYXRjaENhc2NhZGVyRGF0YSgrK2luZGV4LCBpdGVtLmNoaWxkcmVuLCB2YWx1ZXMsIGxhYmVscylcclxuICAgICAgfVxyXG4gICAgfSlcclxuICB9XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGdldFByb3BzKHsgJHRhYmxlIH06IGFueSwgeyBwcm9wcyB9OiBhbnksIGRlZmF1bHRQcm9wcz86IGFueSkge1xyXG4gIHJldHVybiBYRVV0aWxzLmFzc2lnbigkdGFibGUudlNpemUgPyB7IHNpemU6ICR0YWJsZS52U2l6ZSB9IDoge30sIGRlZmF1bHRQcm9wcywgcHJvcHMpXHJcbn1cclxuXHJcbmZ1bmN0aW9uIGdldENlbGxFdmVudHMocmVuZGVyT3B0czogYW55LCBwYXJhbXM6IGFueSkge1xyXG4gIGxldCB7IGV2ZW50cyB9ID0gcmVuZGVyT3B0c1xyXG4gIGxldCB7ICR0YWJsZSB9ID0gcGFyYW1zXHJcbiAgbGV0IHR5cGUgPSAnb24tY2hhbmdlJ1xyXG4gIGxldCBvbiA9IHtcclxuICAgIFt0eXBlXTogKCkgPT4gJHRhYmxlLnVwZGF0ZVN0YXR1cyhwYXJhbXMpXHJcbiAgfVxyXG4gIGlmIChldmVudHMpIHtcclxuICAgIHJldHVybiBYRVV0aWxzLmFzc2lnbih7fSwgWEVVdGlscy5vYmplY3RNYXAoZXZlbnRzLCAoY2I6IEZ1bmN0aW9uKSA9PiBmdW5jdGlvbiAoLi4uYXJnczogYW55W10pIHtcclxuICAgICAgY2IuYXBwbHkobnVsbCwgW3BhcmFtc10uY29uY2F0LmFwcGx5KHBhcmFtcywgYXJncykpXHJcbiAgICB9KSwgb24pXHJcbiAgfVxyXG4gIHJldHVybiBvblxyXG59XHJcblxyXG5mdW5jdGlvbiBjcmVhdGVFZGl0UmVuZGVyKGRlZmF1bHRQcm9wcz86IGFueSkge1xyXG4gIHJldHVybiBmdW5jdGlvbiAoaDogRnVuY3Rpb24sIHJlbmRlck9wdHM6IGFueSwgcGFyYW1zOiBhbnkpIHtcclxuICAgIGxldCB7IHJvdywgY29sdW1uIH0gPSBwYXJhbXNcclxuICAgIGxldCB7IGF0dHJzIH0gPSByZW5kZXJPcHRzXHJcbiAgICBsZXQgcHJvcHMgPSBnZXRQcm9wcyhwYXJhbXMsIHJlbmRlck9wdHMsIGRlZmF1bHRQcm9wcylcclxuICAgIHJldHVybiBbXHJcbiAgICAgIGgocmVuZGVyT3B0cy5uYW1lLCB7XHJcbiAgICAgICAgcHJvcHMsXHJcbiAgICAgICAgYXR0cnMsXHJcbiAgICAgICAgbW9kZWw6IHtcclxuICAgICAgICAgIHZhbHVlOiBYRVV0aWxzLmdldChyb3csIGNvbHVtbi5wcm9wZXJ0eSksXHJcbiAgICAgICAgICBjYWxsYmFjayh2YWx1ZTogYW55KSB7XHJcbiAgICAgICAgICAgIFhFVXRpbHMuc2V0KHJvdywgY29sdW1uLnByb3BlcnR5LCB2YWx1ZSlcclxuICAgICAgICAgIH1cclxuICAgICAgICB9LFxyXG4gICAgICAgIG9uOiBnZXRDZWxsRXZlbnRzKHJlbmRlck9wdHMsIHBhcmFtcylcclxuICAgICAgfSlcclxuICAgIF1cclxuICB9XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGdldEZpbHRlckV2ZW50cyhvbjogYW55LCByZW5kZXJPcHRzOiBhbnksIHBhcmFtczogYW55LCBjb250ZXh0OiBhbnkpIHtcclxuICBsZXQgeyBldmVudHMgfSA9IHJlbmRlck9wdHNcclxuICBpZiAoZXZlbnRzKSB7XHJcbiAgICByZXR1cm4gWEVVdGlscy5hc3NpZ24oe30sIFhFVXRpbHMub2JqZWN0TWFwKGV2ZW50cywgKGNiOiBGdW5jdGlvbikgPT4gZnVuY3Rpb24gKC4uLmFyZ3M6IGFueVtdKSB7XHJcbiAgICAgIHBhcmFtcyA9IE9iamVjdC5hc3NpZ24oeyBjb250ZXh0IH0sIHBhcmFtcylcclxuICAgICAgY2IuYXBwbHkobnVsbCwgW3BhcmFtc10uY29uY2F0LmFwcGx5KHBhcmFtcywgYXJncykpXHJcbiAgICB9KSwgb24pXHJcbiAgfVxyXG4gIHJldHVybiBvblxyXG59XHJcblxyXG5mdW5jdGlvbiBjcmVhdGVGaWx0ZXJSZW5kZXIoZGVmYXVsdFByb3BzPzogYW55KSB7XHJcbiAgcmV0dXJuIGZ1bmN0aW9uIChoOiBGdW5jdGlvbiwgcmVuZGVyT3B0czogYW55LCBwYXJhbXM6IGFueSwgY29udGV4dDogYW55KSB7XHJcbiAgICBsZXQgeyBjb2x1bW4gfSA9IHBhcmFtc1xyXG4gICAgbGV0IHsgbmFtZSwgYXR0cnMsIGV2ZW50cyB9ID0gcmVuZGVyT3B0c1xyXG4gICAgbGV0IHR5cGUgPSAnb24tY2hhbmdlJ1xyXG4gICAgbGV0IHByb3BzID0gZ2V0UHJvcHMocGFyYW1zLCByZW5kZXJPcHRzKVxyXG4gICAgcmV0dXJuIGNvbHVtbi5maWx0ZXJzLm1hcCgoaXRlbTogYW55KSA9PiB7XHJcbiAgICAgIHJldHVybiBoKG5hbWUsIHtcclxuICAgICAgICBwcm9wcyxcclxuICAgICAgICBhdHRycyxcclxuICAgICAgICBtb2RlbDoge1xyXG4gICAgICAgICAgdmFsdWU6IGl0ZW0uZGF0YSxcclxuICAgICAgICAgIGNhbGxiYWNrKG9wdGlvblZhbHVlOiBhbnkpIHtcclxuICAgICAgICAgICAgaXRlbS5kYXRhID0gb3B0aW9uVmFsdWVcclxuICAgICAgICAgIH1cclxuICAgICAgICB9LFxyXG4gICAgICAgIG9uOiBnZXRGaWx0ZXJFdmVudHMoe1xyXG4gICAgICAgICAgW3R5cGVdKGV2bnQ6IGFueSkge1xyXG4gICAgICAgICAgICBoYW5kbGVDb25maXJtRmlsdGVyKGNvbnRleHQsIGNvbHVtbiwgISFpdGVtLmRhdGEsIGl0ZW0pXHJcbiAgICAgICAgICAgIGlmIChldmVudHMgJiYgZXZlbnRzW3R5cGVdKSB7XHJcbiAgICAgICAgICAgICAgZXZlbnRzW3R5cGVdKE9iamVjdC5hc3NpZ24oeyBjb250ZXh0IH0sIHBhcmFtcyksIGV2bnQpXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgIH1cclxuICAgICAgICB9LCByZW5kZXJPcHRzLCBwYXJhbXMsIGNvbnRleHQpXHJcbiAgICAgIH0pXHJcbiAgICB9KVxyXG4gIH1cclxufVxyXG5cclxuZnVuY3Rpb24gaGFuZGxlQ29uZmlybUZpbHRlcihjb250ZXh0OiBhbnksIGNvbHVtbjogYW55LCBjaGVja2VkOiBhbnksIGl0ZW06IGFueSkge1xyXG4gIGNvbnRleHRbY29sdW1uLmZpbHRlck11bHRpcGxlID8gJ2NoYW5nZU11bHRpcGxlT3B0aW9uJyA6ICdjaGFuZ2VSYWRpb09wdGlvbiddKHt9LCBjaGVja2VkLCBpdGVtKVxyXG59XHJcblxyXG5mdW5jdGlvbiBkZWZhdWx0RmlsdGVyTWV0aG9kKHsgb3B0aW9uLCByb3csIGNvbHVtbiB9OiBhbnkpIHtcclxuICBsZXQgeyBkYXRhIH0gPSBvcHRpb25cclxuICBsZXQgY2VsbFZhbHVlID0gWEVVdGlscy5nZXQocm93LCBjb2x1bW4ucHJvcGVydHkpXHJcbiAgLyogZXNsaW50LWRpc2FibGUgZXFlcWVxICovXHJcbiAgcmV0dXJuIGNlbGxWYWx1ZSA9PT0gZGF0YVxyXG59XHJcblxyXG5mdW5jdGlvbiByZW5kZXJPcHRpb25zKGg6IEZ1bmN0aW9uLCBvcHRpb25zOiBhbnksIG9wdGlvblByb3BzOiBhbnkpIHtcclxuICBsZXQgbGFiZWxQcm9wID0gb3B0aW9uUHJvcHMubGFiZWwgfHwgJ2xhYmVsJ1xyXG4gIGxldCB2YWx1ZVByb3AgPSBvcHRpb25Qcm9wcy52YWx1ZSB8fCAndmFsdWUnXHJcbiAgbGV0IGRpc2FibGVkUHJvcCA9IG9wdGlvblByb3BzLmRpc2FibGVkIHx8ICdkaXNhYmxlZCdcclxuICByZXR1cm4gWEVVdGlscy5tYXAob3B0aW9ucywgKGl0ZW06IGFueSwgaW5kZXg6IG51bWJlcikgPT4ge1xyXG4gICAgcmV0dXJuIGgoJ09wdGlvbicsIHtcclxuICAgICAgcHJvcHM6IHtcclxuICAgICAgICB2YWx1ZTogaXRlbVt2YWx1ZVByb3BdLFxyXG4gICAgICAgIGxhYmVsOiBpdGVtW2xhYmVsUHJvcF0sXHJcbiAgICAgICAgZGlzYWJsZWQ6IGl0ZW1bZGlzYWJsZWRQcm9wXVxyXG4gICAgICB9LFxyXG4gICAgICBrZXk6IGluZGV4XHJcbiAgICB9KVxyXG4gIH0pXHJcbn1cclxuXHJcbmZ1bmN0aW9uIGNlbGxUZXh0KGg6IEZ1bmN0aW9uLCBjZWxsVmFsdWU6IGFueSkge1xyXG4gIHJldHVybiBbJycgKyAoY2VsbFZhbHVlID09PSBudWxsIHx8IGNlbGxWYWx1ZSA9PT0gdm9pZCAwID8gJycgOiBjZWxsVmFsdWUpXVxyXG59XHJcblxyXG4vKipcclxuICog5riy5p+T5Ye95pWwXHJcbiAqL1xyXG5jb25zdCByZW5kZXJNYXAgPSB7XHJcbiAgSW5wdXQ6IHtcclxuICAgIGF1dG9mb2N1czogJ2lucHV0Lml2dS1pbnB1dCcsXHJcbiAgICByZW5kZXJEZWZhdWx0OiBjcmVhdGVFZGl0UmVuZGVyKCksXHJcbiAgICByZW5kZXJFZGl0OiBjcmVhdGVFZGl0UmVuZGVyKCksXHJcbiAgICByZW5kZXJGaWx0ZXI6IGNyZWF0ZUZpbHRlclJlbmRlcigpLFxyXG4gICAgZmlsdGVyTWV0aG9kOiBkZWZhdWx0RmlsdGVyTWV0aG9kXHJcbiAgfSxcclxuICBBdXRvQ29tcGxldGU6IHtcclxuICAgIGF1dG9mb2N1czogJ2lucHV0Lml2dS1pbnB1dCcsXHJcbiAgICByZW5kZXJEZWZhdWx0OiBjcmVhdGVFZGl0UmVuZGVyKCksXHJcbiAgICByZW5kZXJFZGl0OiBjcmVhdGVFZGl0UmVuZGVyKCksXHJcbiAgICByZW5kZXJGaWx0ZXI6IGNyZWF0ZUZpbHRlclJlbmRlcigpLFxyXG4gICAgZmlsdGVyTWV0aG9kOiBkZWZhdWx0RmlsdGVyTWV0aG9kXHJcbiAgfSxcclxuICBJbnB1dE51bWJlcjoge1xyXG4gICAgYXV0b2ZvY3VzOiAnaW5wdXQuaXZ1LWlucHV0LW51bWJlci1pbnB1dCcsXHJcbiAgICByZW5kZXJEZWZhdWx0OiBjcmVhdGVFZGl0UmVuZGVyKCksXHJcbiAgICByZW5kZXJFZGl0OiBjcmVhdGVFZGl0UmVuZGVyKCksXHJcbiAgICByZW5kZXJGaWx0ZXI6IGNyZWF0ZUZpbHRlclJlbmRlcigpLFxyXG4gICAgZmlsdGVyTWV0aG9kOiBkZWZhdWx0RmlsdGVyTWV0aG9kXHJcbiAgfSxcclxuICBTZWxlY3Q6IHtcclxuICAgIHJlbmRlckVkaXQoaDogRnVuY3Rpb24sIHJlbmRlck9wdHM6IGFueSwgcGFyYW1zOiBhbnkpIHtcclxuICAgICAgbGV0IHsgb3B0aW9ucywgb3B0aW9uR3JvdXBzLCBvcHRpb25Qcm9wcyA9IHt9LCBvcHRpb25Hcm91cFByb3BzID0ge30gfSA9IHJlbmRlck9wdHNcclxuICAgICAgbGV0IHsgcm93LCBjb2x1bW4gfSA9IHBhcmFtc1xyXG4gICAgICBsZXQgeyBhdHRycyB9ID0gcmVuZGVyT3B0c1xyXG4gICAgICBsZXQgcHJvcHMgPSBnZXRQcm9wcyhwYXJhbXMsIHJlbmRlck9wdHMsIHsgdHJhbnNmZXI6IHRydWUgfSlcclxuICAgICAgaWYgKG9wdGlvbkdyb3Vwcykge1xyXG4gICAgICAgIGxldCBncm91cE9wdGlvbnMgPSBvcHRpb25Hcm91cFByb3BzLm9wdGlvbnMgfHwgJ29wdGlvbnMnXHJcbiAgICAgICAgbGV0IGdyb3VwTGFiZWwgPSBvcHRpb25Hcm91cFByb3BzLmxhYmVsIHx8ICdsYWJlbCdcclxuICAgICAgICByZXR1cm4gW1xyXG4gICAgICAgICAgaCgnU2VsZWN0Jywge1xyXG4gICAgICAgICAgICBwcm9wcyxcclxuICAgICAgICAgICAgYXR0cnMsXHJcbiAgICAgICAgICAgIG1vZGVsOiB7XHJcbiAgICAgICAgICAgICAgdmFsdWU6IFhFVXRpbHMuZ2V0KHJvdywgY29sdW1uLnByb3BlcnR5KSxcclxuICAgICAgICAgICAgICBjYWxsYmFjayhjZWxsVmFsdWU6IGFueSkge1xyXG4gICAgICAgICAgICAgICAgWEVVdGlscy5zZXQocm93LCBjb2x1bW4ucHJvcGVydHksIGNlbGxWYWx1ZSlcclxuICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIG9uOiBnZXRDZWxsRXZlbnRzKHJlbmRlck9wdHMsIHBhcmFtcylcclxuICAgICAgICAgIH0sIFhFVXRpbHMubWFwKG9wdGlvbkdyb3VwcywgKGdyb3VwOiBhbnksIGdJbmRleDogbnVtYmVyKSA9PiB7XHJcbiAgICAgICAgICAgIHJldHVybiBoKCdPcHRpb25Hcm91cCcsIHtcclxuICAgICAgICAgICAgICBwcm9wczoge1xyXG4gICAgICAgICAgICAgICAgbGFiZWw6IGdyb3VwW2dyb3VwTGFiZWxdXHJcbiAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICBrZXk6IGdJbmRleFxyXG4gICAgICAgICAgICB9LCByZW5kZXJPcHRpb25zKGgsIGdyb3VwW2dyb3VwT3B0aW9uc10sIG9wdGlvblByb3BzKSlcclxuICAgICAgICAgIH0pKVxyXG4gICAgICAgIF1cclxuICAgICAgfVxyXG4gICAgICByZXR1cm4gW1xyXG4gICAgICAgIGgoJ1NlbGVjdCcsIHtcclxuICAgICAgICAgIHByb3BzLFxyXG4gICAgICAgICAgYXR0cnMsXHJcbiAgICAgICAgICBtb2RlbDoge1xyXG4gICAgICAgICAgICB2YWx1ZTogWEVVdGlscy5nZXQocm93LCBjb2x1bW4ucHJvcGVydHkpLFxyXG4gICAgICAgICAgICBjYWxsYmFjayhjZWxsVmFsdWU6IGFueSkge1xyXG4gICAgICAgICAgICAgIFhFVXRpbHMuc2V0KHJvdywgY29sdW1uLnByb3BlcnR5LCBjZWxsVmFsdWUpXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgIH0sXHJcbiAgICAgICAgICBvbjogZ2V0Q2VsbEV2ZW50cyhyZW5kZXJPcHRzLCBwYXJhbXMpXHJcbiAgICAgICAgfSwgcmVuZGVyT3B0aW9ucyhoLCBvcHRpb25zLCBvcHRpb25Qcm9wcykpXHJcbiAgICAgIF1cclxuICAgIH0sXHJcbiAgICByZW5kZXJDZWxsKGg6IEZ1bmN0aW9uLCByZW5kZXJPcHRzOiBhbnksIHBhcmFtczogYW55KSB7XHJcbiAgICAgIGxldCB7IG9wdGlvbnMsIG9wdGlvbkdyb3VwcywgcHJvcHMgPSB7fSwgb3B0aW9uUHJvcHMgPSB7fSwgb3B0aW9uR3JvdXBQcm9wcyA9IHt9IH0gPSByZW5kZXJPcHRzXHJcbiAgICAgIGxldCB7IHJvdywgY29sdW1uIH0gPSBwYXJhbXNcclxuICAgICAgbGV0IGxhYmVsUHJvcCA9IG9wdGlvblByb3BzLmxhYmVsIHx8ICdsYWJlbCdcclxuICAgICAgbGV0IHZhbHVlUHJvcCA9IG9wdGlvblByb3BzLnZhbHVlIHx8ICd2YWx1ZSdcclxuICAgICAgbGV0IGdyb3VwT3B0aW9ucyA9IG9wdGlvbkdyb3VwUHJvcHMub3B0aW9ucyB8fCAnb3B0aW9ucydcclxuICAgICAgbGV0IGNlbGxWYWx1ZSA9IFhFVXRpbHMuZ2V0KHJvdywgY29sdW1uLnByb3BlcnR5KVxyXG4gICAgICBpZiAoIShjZWxsVmFsdWUgPT09IG51bGwgfHwgY2VsbFZhbHVlID09PSB1bmRlZmluZWQgfHwgY2VsbFZhbHVlID09PSAnJykpIHtcclxuICAgICAgICByZXR1cm4gY2VsbFRleHQoaCwgWEVVdGlscy5tYXAocHJvcHMubXVsdGlwbGUgPyBjZWxsVmFsdWUgOiBbY2VsbFZhbHVlXSwgb3B0aW9uR3JvdXBzID8gKHZhbHVlOiBhbnkpID0+IHtcclxuICAgICAgICAgIGxldCBzZWxlY3RJdGVtXHJcbiAgICAgICAgICBmb3IgKGxldCBpbmRleCA9IDA7IGluZGV4IDwgb3B0aW9uR3JvdXBzLmxlbmd0aDsgaW5kZXgrKykge1xyXG4gICAgICAgICAgICBzZWxlY3RJdGVtID0gWEVVdGlscy5maW5kKG9wdGlvbkdyb3Vwc1tpbmRleF1bZ3JvdXBPcHRpb25zXSwgKGl0ZW06IGFueSkgPT4gaXRlbVt2YWx1ZVByb3BdID09PSB2YWx1ZSlcclxuICAgICAgICAgICAgaWYgKHNlbGVjdEl0ZW0pIHtcclxuICAgICAgICAgICAgICBicmVha1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgICByZXR1cm4gc2VsZWN0SXRlbSA/IHNlbGVjdEl0ZW1bbGFiZWxQcm9wXSA6IG51bGxcclxuICAgICAgICB9IDogKHZhbHVlOiBhbnkpID0+IHtcclxuICAgICAgICAgIGxldCBzZWxlY3RJdGVtID0gWEVVdGlscy5maW5kKG9wdGlvbnMsIChpdGVtOiBhbnkpID0+IGl0ZW1bdmFsdWVQcm9wXSA9PT0gdmFsdWUpXHJcbiAgICAgICAgICByZXR1cm4gc2VsZWN0SXRlbSA/IHNlbGVjdEl0ZW1bbGFiZWxQcm9wXSA6IG51bGxcclxuICAgICAgICB9KS5qb2luKCc7JykpXHJcbiAgICAgIH1cclxuICAgICAgcmV0dXJuIGNlbGxUZXh0KGgsICcnKVxyXG4gICAgfSxcclxuICAgIHJlbmRlckZpbHRlcihoOiBGdW5jdGlvbiwgcmVuZGVyT3B0czogYW55LCBwYXJhbXM6IGFueSwgY29udGV4dDogYW55KSB7XHJcbiAgICAgIGxldCB7IG9wdGlvbnMsIG9wdGlvbkdyb3Vwcywgb3B0aW9uUHJvcHMgPSB7fSwgb3B0aW9uR3JvdXBQcm9wcyA9IHt9IH0gPSByZW5kZXJPcHRzXHJcbiAgICAgIGxldCB7IGNvbHVtbiB9ID0gcGFyYW1zXHJcbiAgICAgIGxldCB7IGF0dHJzLCBldmVudHMgfSA9IHJlbmRlck9wdHNcclxuICAgICAgbGV0IHByb3BzID0gZ2V0UHJvcHMocGFyYW1zLCByZW5kZXJPcHRzLCB7IHRyYW5zZmVyOiB0cnVlIH0pXHJcbiAgICAgIGxldCB0eXBlID0gJ29uLWNoYW5nZSdcclxuICAgICAgaWYgKG9wdGlvbkdyb3Vwcykge1xyXG4gICAgICAgIGxldCBncm91cE9wdGlvbnMgPSBvcHRpb25Hcm91cFByb3BzLm9wdGlvbnMgfHwgJ29wdGlvbnMnXHJcbiAgICAgICAgbGV0IGdyb3VwTGFiZWwgPSBvcHRpb25Hcm91cFByb3BzLmxhYmVsIHx8ICdsYWJlbCdcclxuICAgICAgICByZXR1cm4gY29sdW1uLmZpbHRlcnMubWFwKChpdGVtOiBhbnkpID0+IHtcclxuICAgICAgICAgIHJldHVybiBoKCdTZWxlY3QnLCB7XHJcbiAgICAgICAgICAgIHByb3BzLFxyXG4gICAgICAgICAgICBhdHRycyxcclxuICAgICAgICAgICAgbW9kZWw6IHtcclxuICAgICAgICAgICAgICB2YWx1ZTogaXRlbS5kYXRhLFxyXG4gICAgICAgICAgICAgIGNhbGxiYWNrKG9wdGlvblZhbHVlOiBhbnkpIHtcclxuICAgICAgICAgICAgICAgIGl0ZW0uZGF0YSA9IG9wdGlvblZhbHVlXHJcbiAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICBvbjogZ2V0RmlsdGVyRXZlbnRzKHtcclxuICAgICAgICAgICAgICBbdHlwZV0odmFsdWU6IGFueSkge1xyXG4gICAgICAgICAgICAgICAgaGFuZGxlQ29uZmlybUZpbHRlcihjb250ZXh0LCBjb2x1bW4sIHZhbHVlICYmIHZhbHVlLmxlbmd0aCA+IDAsIGl0ZW0pXHJcbiAgICAgICAgICAgICAgICBpZiAoZXZlbnRzICYmIGV2ZW50c1t0eXBlXSkge1xyXG4gICAgICAgICAgICAgICAgICBldmVudHNbdHlwZV0oT2JqZWN0LmFzc2lnbih7IGNvbnRleHQgfSwgcGFyYW1zKSwgdmFsdWUpXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9LCByZW5kZXJPcHRzLCBwYXJhbXMsIGNvbnRleHQpXHJcbiAgICAgICAgICB9LCBYRVV0aWxzLm1hcChvcHRpb25Hcm91cHMsIChncm91cDogYW55LCBnSW5kZXg6IG51bWJlcikgPT4ge1xyXG4gICAgICAgICAgICByZXR1cm4gaCgnT3B0aW9uR3JvdXAnLCB7XHJcbiAgICAgICAgICAgICAgcHJvcHM6IHtcclxuICAgICAgICAgICAgICAgIGxhYmVsOiBncm91cFtncm91cExhYmVsXVxyXG4gICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAga2V5OiBnSW5kZXhcclxuICAgICAgICAgICAgfSwgcmVuZGVyT3B0aW9ucyhoLCBncm91cFtncm91cE9wdGlvbnNdLCBvcHRpb25Qcm9wcykpXHJcbiAgICAgICAgICB9KSlcclxuICAgICAgICB9KVxyXG4gICAgICB9XHJcbiAgICAgIHJldHVybiBjb2x1bW4uZmlsdGVycy5tYXAoKGl0ZW06IGFueSkgPT4ge1xyXG4gICAgICAgIHJldHVybiBoKCdTZWxlY3QnLCB7XHJcbiAgICAgICAgICBwcm9wcyxcclxuICAgICAgICAgIGF0dHJzLFxyXG4gICAgICAgICAgbW9kZWw6IHtcclxuICAgICAgICAgICAgdmFsdWU6IGl0ZW0uZGF0YSxcclxuICAgICAgICAgICAgY2FsbGJhY2sob3B0aW9uVmFsdWU6IGFueSkge1xyXG4gICAgICAgICAgICAgIGl0ZW0uZGF0YSA9IG9wdGlvblZhbHVlXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgIH0sXHJcbiAgICAgICAgICBvbjogZ2V0RmlsdGVyRXZlbnRzKHtcclxuICAgICAgICAgICAgW3R5cGVdKHZhbHVlOiBhbnkpIHtcclxuICAgICAgICAgICAgICBoYW5kbGVDb25maXJtRmlsdGVyKGNvbnRleHQsIGNvbHVtbiwgdmFsdWUgJiYgdmFsdWUubGVuZ3RoID4gMCwgaXRlbSlcclxuICAgICAgICAgICAgICBpZiAoZXZlbnRzICYmIGV2ZW50c1t0eXBlXSkge1xyXG4gICAgICAgICAgICAgICAgZXZlbnRzW3R5cGVdKE9iamVjdC5hc3NpZ24oeyBjb250ZXh0IH0sIHBhcmFtcyksIHZhbHVlKVxyXG4gICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgfSwgcmVuZGVyT3B0cywgcGFyYW1zLCBjb250ZXh0KVxyXG4gICAgICAgIH0sIHJlbmRlck9wdGlvbnMoaCwgb3B0aW9ucywgb3B0aW9uUHJvcHMpKVxyXG4gICAgICB9KVxyXG4gICAgfSxcclxuICAgIGZpbHRlck1ldGhvZCh7IG9wdGlvbiwgcm93LCBjb2x1bW4gfTogYW55KSB7XHJcbiAgICAgIGxldCB7IGRhdGEgfSA9IG9wdGlvblxyXG4gICAgICBsZXQgeyBwcm9wZXJ0eSwgZmlsdGVyUmVuZGVyOiByZW5kZXJPcHRzIH0gPSBjb2x1bW5cclxuICAgICAgbGV0IHsgcHJvcHMgPSB7fSB9ID0gcmVuZGVyT3B0c1xyXG4gICAgICBsZXQgY2VsbFZhbHVlID0gWEVVdGlscy5nZXQocm93LCBwcm9wZXJ0eSlcclxuICAgICAgaWYgKHByb3BzLm11bHRpcGxlKSB7XHJcbiAgICAgICAgaWYgKFhFVXRpbHMuaXNBcnJheShjZWxsVmFsdWUpKSB7XHJcbiAgICAgICAgICByZXR1cm4gWEVVdGlscy5pbmNsdWRlQXJyYXlzKGNlbGxWYWx1ZSwgZGF0YSlcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIGRhdGEuaW5kZXhPZihjZWxsVmFsdWUpID4gLTFcclxuICAgICAgfVxyXG4gICAgICAvKiBlc2xpbnQtZGlzYWJsZSBlcWVxZXEgKi9cclxuICAgICAgcmV0dXJuIGNlbGxWYWx1ZSA9PSBkYXRhXHJcbiAgICB9XHJcbiAgfSxcclxuICBDYXNjYWRlcjoge1xyXG4gICAgcmVuZGVyRWRpdDogY3JlYXRlRWRpdFJlbmRlcih7IHRyYW5zZmVyOiB0cnVlIH0pLFxyXG4gICAgcmVuZGVyQ2VsbChoOiBGdW5jdGlvbiwgeyBwcm9wcyA9IHt9IH06IGFueSwgcGFyYW1zOiBhbnkpIHtcclxuICAgICAgbGV0IHsgcm93LCBjb2x1bW4gfSA9IHBhcmFtc1xyXG4gICAgICBsZXQgY2VsbFZhbHVlID0gWEVVdGlscy5nZXQocm93LCBjb2x1bW4ucHJvcGVydHkpXHJcbiAgICAgIGxldCB2YWx1ZXMgPSBjZWxsVmFsdWUgfHwgW11cclxuICAgICAgbGV0IGxhYmVsczogQXJyYXk8YW55PiA9IFtdXHJcbiAgICAgIG1hdGNoQ2FzY2FkZXJEYXRhKDAsIHByb3BzLmRhdGEsIHZhbHVlcywgbGFiZWxzKVxyXG4gICAgICByZXR1cm4gY2VsbFRleHQoaCwgbGFiZWxzLmpvaW4oYCAke3Byb3BzLnNlcGFyYXRvciB8fCAnLyd9IGApKVxyXG4gICAgfVxyXG4gIH0sXHJcbiAgRGF0ZVBpY2tlcjoge1xyXG4gICAgcmVuZGVyRWRpdDogY3JlYXRlRWRpdFJlbmRlcih7IHRyYW5zZmVyOiB0cnVlIH0pLFxyXG4gICAgcmVuZGVyQ2VsbChoOiBGdW5jdGlvbiwgeyBwcm9wcyA9IHt9IH06IGFueSwgcGFyYW1zOiBhbnkpIHtcclxuICAgICAgbGV0IHsgcm93LCBjb2x1bW4gfSA9IHBhcmFtc1xyXG4gICAgICBsZXQgeyBzZXBhcmF0b3IgfSA9IHByb3BzXHJcbiAgICAgIGxldCBjZWxsVmFsdWUgPSBYRVV0aWxzLmdldChyb3csIGNvbHVtbi5wcm9wZXJ0eSlcclxuICAgICAgc3dpdGNoIChwcm9wcy50eXBlKSB7XHJcbiAgICAgICAgY2FzZSAnd2Vlayc6XHJcbiAgICAgICAgICBjZWxsVmFsdWUgPSBnZXRGb3JtYXREYXRlKGNlbGxWYWx1ZSwgcHJvcHMsICd5eXl5d1dXJylcclxuICAgICAgICAgIGJyZWFrXHJcbiAgICAgICAgY2FzZSAnbW9udGgnOlxyXG4gICAgICAgICAgY2VsbFZhbHVlID0gZ2V0Rm9ybWF0RGF0ZShjZWxsVmFsdWUsIHByb3BzLCAneXl5eS1NTScpXHJcbiAgICAgICAgICBicmVha1xyXG4gICAgICAgIGNhc2UgJ3llYXInOlxyXG4gICAgICAgICAgY2VsbFZhbHVlID0gZ2V0Rm9ybWF0RGF0ZShjZWxsVmFsdWUsIHByb3BzLCAneXl5eScpXHJcbiAgICAgICAgICBicmVha1xyXG4gICAgICAgIGNhc2UgJ2RhdGVzJzpcclxuICAgICAgICAgIGNlbGxWYWx1ZSA9IGdldEZvcm1hdERhdGVzKGNlbGxWYWx1ZSwgcHJvcHMsICcsICcsICd5eXl5LU1NLWRkJylcclxuICAgICAgICAgIGJyZWFrXHJcbiAgICAgICAgY2FzZSAnZGF0ZXJhbmdlJzpcclxuICAgICAgICAgIGNlbGxWYWx1ZSA9IGdldEZvcm1hdERhdGVzKGNlbGxWYWx1ZSwgcHJvcHMsIGAgJHtzZXBhcmF0b3IgfHwgJy0nfSBgLCAneXl5eS1NTS1kZCcpXHJcbiAgICAgICAgICBicmVha1xyXG4gICAgICAgIGNhc2UgJ2RhdGV0aW1lcmFuZ2UnOlxyXG4gICAgICAgICAgY2VsbFZhbHVlID0gZ2V0Rm9ybWF0RGF0ZXMoY2VsbFZhbHVlLCBwcm9wcywgYCAke3NlcGFyYXRvciB8fCAnLSd9IGAsICd5eXl5LU1NLWRkIEhIOnNzOm1tJylcclxuICAgICAgICAgIGJyZWFrXHJcbiAgICAgICAgZGVmYXVsdDpcclxuICAgICAgICAgIGNlbGxWYWx1ZSA9IGdldEZvcm1hdERhdGUoY2VsbFZhbHVlLCBwcm9wcywgJ3l5eXktTU0tZGQnKVxyXG4gICAgICAgICAgYnJlYWtcclxuICAgICAgfVxyXG4gICAgICByZXR1cm4gY2VsbFRleHQoaCwgY2VsbFZhbHVlKVxyXG4gICAgfSxcclxuICAgIHJlbmRlckZpbHRlcihoOiBGdW5jdGlvbiwgcmVuZGVyT3B0czogYW55LCBwYXJhbXM6IGFueSwgY29udGV4dDogYW55KSB7XHJcbiAgICAgIGxldCB7IGNvbHVtbiB9ID0gcGFyYW1zXHJcbiAgICAgIGxldCB7IGF0dHJzLCBldmVudHMgfSA9IHJlbmRlck9wdHNcclxuICAgICAgbGV0IHByb3BzID0gZ2V0UHJvcHMocGFyYW1zLCByZW5kZXJPcHRzLCB7IHRyYW5zZmVyOiB0cnVlIH0pXHJcbiAgICAgIGxldCB0eXBlID0gJ29uLWNoYW5nZSdcclxuICAgICAgcmV0dXJuIGNvbHVtbi5maWx0ZXJzLm1hcCgoaXRlbTogYW55KSA9PiB7XHJcbiAgICAgICAgcmV0dXJuIGgocmVuZGVyT3B0cy5uYW1lLCB7XHJcbiAgICAgICAgICBwcm9wcyxcclxuICAgICAgICAgIGF0dHJzLFxyXG4gICAgICAgICAgbW9kZWw6IHtcclxuICAgICAgICAgICAgdmFsdWU6IGl0ZW0uZGF0YSxcclxuICAgICAgICAgICAgY2FsbGJhY2sob3B0aW9uVmFsdWU6IGFueSkge1xyXG4gICAgICAgICAgICAgIGl0ZW0uZGF0YSA9IG9wdGlvblZhbHVlXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgIH0sXHJcbiAgICAgICAgICBvbjogZ2V0RmlsdGVyRXZlbnRzKHtcclxuICAgICAgICAgICAgW3R5cGVdKHZhbHVlOiBhbnkpIHtcclxuICAgICAgICAgICAgICBoYW5kbGVDb25maXJtRmlsdGVyKGNvbnRleHQsIGNvbHVtbiwgISF2YWx1ZSwgaXRlbSlcclxuICAgICAgICAgICAgICBpZiAoZXZlbnRzICYmIGV2ZW50c1t0eXBlXSkge1xyXG4gICAgICAgICAgICAgICAgZXZlbnRzW3R5cGVdKE9iamVjdC5hc3NpZ24oeyBjb250ZXh0IH0sIHBhcmFtcyksIHZhbHVlKVxyXG4gICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgfSwgcmVuZGVyT3B0cywgcGFyYW1zLCBjb250ZXh0KVxyXG4gICAgICAgIH0pXHJcbiAgICAgIH0pXHJcbiAgICB9LFxyXG4gICAgZmlsdGVyTWV0aG9kKHsgb3B0aW9uLCByb3csIGNvbHVtbiB9OiBhbnkpIHtcclxuICAgICAgbGV0IHsgZGF0YSB9ID0gb3B0aW9uXHJcbiAgICAgIGxldCB7IGZpbHRlclJlbmRlcjogcmVuZGVyT3B0cyB9ID0gY29sdW1uXHJcbiAgICAgIGxldCB7IHByb3BzID0ge30gfSA9IHJlbmRlck9wdHNcclxuICAgICAgbGV0IGNlbGxWYWx1ZSA9IFhFVXRpbHMuZ2V0KHJvdywgY29sdW1uLnByb3BlcnR5KVxyXG4gICAgICBpZiAoZGF0YSkge1xyXG4gICAgICAgIHN3aXRjaCAocHJvcHMudHlwZSkge1xyXG4gICAgICAgICAgY2FzZSAnZGF0ZXJhbmdlJzpcclxuICAgICAgICAgICAgcmV0dXJuIGVxdWFsRGF0ZXJhbmdlKGNlbGxWYWx1ZSwgZGF0YSwgcHJvcHMsICd5eXl5LU1NLWRkJylcclxuICAgICAgICAgIGNhc2UgJ2RhdGV0aW1lcmFuZ2UnOlxyXG4gICAgICAgICAgICByZXR1cm4gZXF1YWxEYXRlcmFuZ2UoY2VsbFZhbHVlLCBkYXRhLCBwcm9wcywgJ3l5eXktTU0tZGQgSEg6c3M6bW0nKVxyXG4gICAgICAgICAgZGVmYXVsdDpcclxuICAgICAgICAgICAgcmV0dXJuIGNlbGxWYWx1ZSA9PT0gZGF0YVxyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgICByZXR1cm4gZmFsc2VcclxuICAgIH1cclxuICB9LFxyXG4gIFRpbWVQaWNrZXI6IHtcclxuICAgIHJlbmRlckVkaXQ6IGNyZWF0ZUVkaXRSZW5kZXIoeyB0cmFuc2ZlcjogdHJ1ZSB9KVxyXG4gIH0sXHJcbiAgUmF0ZToge1xyXG4gICAgcmVuZGVyRGVmYXVsdDogY3JlYXRlRWRpdFJlbmRlcigpLFxyXG4gICAgcmVuZGVyRWRpdDogY3JlYXRlRWRpdFJlbmRlcigpLFxyXG4gICAgcmVuZGVyRmlsdGVyOiBjcmVhdGVGaWx0ZXJSZW5kZXIoKSxcclxuICAgIGZpbHRlck1ldGhvZDogZGVmYXVsdEZpbHRlck1ldGhvZFxyXG4gIH0sXHJcbiAgaVN3aXRjaDoge1xyXG4gICAgcmVuZGVyRGVmYXVsdDogY3JlYXRlRWRpdFJlbmRlcigpLFxyXG4gICAgcmVuZGVyRWRpdDogY3JlYXRlRWRpdFJlbmRlcigpLFxyXG4gICAgcmVuZGVyRmlsdGVyOiBjcmVhdGVGaWx0ZXJSZW5kZXIoKSxcclxuICAgIGZpbHRlck1ldGhvZDogZGVmYXVsdEZpbHRlck1ldGhvZFxyXG4gIH1cclxufVxyXG5cclxuLyoqXHJcbiAqIOS6i+S7tuWFvOWuueaAp+WkhOeQhlxyXG4gKi9cclxuZnVuY3Rpb24gaGFuZGxlQ2xlYXJFdmVudChwYXJhbXM6IGFueSwgZXZudDogYW55LCBjb250ZXh0OiBhbnkpIHtcclxuICBsZXQgeyBnZXRFdmVudFRhcmdldE5vZGUgfSA9IGNvbnRleHRcclxuICBsZXQgYm9keUVsZW0gPSBkb2N1bWVudC5ib2R5XHJcbiAgaWYgKFxyXG4gICAgLy8g5LiL5ouJ5qGG44CB5pel5pyfXHJcbiAgICBnZXRFdmVudFRhcmdldE5vZGUoZXZudCwgYm9keUVsZW0sICdpdnUtc2VsZWN0LWRyb3Bkb3duJykuZmxhZ1xyXG4gICkge1xyXG4gICAgcmV0dXJuIGZhbHNlXHJcbiAgfVxyXG59XHJcblxyXG4vKipcclxuICog5Z+65LqOIHZ4ZS10YWJsZSDooajmoLznmoTpgILphY3mj5Lku7bvvIznlKjkuo7lhbzlrrkgaXZpZXcg57uE5Lu25bqTXHJcbiAqL1xyXG5leHBvcnQgY29uc3QgVlhFVGFibGVQbHVnaW5JVmlldyA9IHtcclxuICBpbnN0YWxsKHh0YWJsZTogdHlwZW9mIFZYRVRhYmxlKSB7XHJcbiAgICBsZXQgeyBpbnRlcmNlcHRvciwgcmVuZGVyZXIgfSA9IHh0YWJsZVxyXG4gICAgcmVuZGVyZXIubWl4aW4ocmVuZGVyTWFwKVxyXG4gICAgaW50ZXJjZXB0b3IuYWRkKCdldmVudC5jbGVhckZpbHRlcicsIGhhbmRsZUNsZWFyRXZlbnQpXHJcbiAgICBpbnRlcmNlcHRvci5hZGQoJ2V2ZW50LmNsZWFyQWN0aXZlZCcsIGhhbmRsZUNsZWFyRXZlbnQpXHJcbiAgfVxyXG59XHJcblxyXG5pZiAodHlwZW9mIHdpbmRvdyAhPT0gJ3VuZGVmaW5lZCcgJiYgd2luZG93LlZYRVRhYmxlKSB7XHJcbiAgd2luZG93LlZYRVRhYmxlLnVzZShWWEVUYWJsZVBsdWdpbklWaWV3KVxyXG59XHJcblxyXG5leHBvcnQgZGVmYXVsdCBWWEVUYWJsZVBsdWdpbklWaWV3XHJcbiJdfQ==
