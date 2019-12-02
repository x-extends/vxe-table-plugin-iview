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
      var $table = params.$table,
          row = params.row,
          column = params.column;
      var labelProp = optionProps.label || 'label';
      var valueProp = optionProps.value || 'value';
      var groupOptions = optionGroupProps.options || 'options';

      var cellValue = _xeUtils["default"].get(row, column.property);

      var colid = column.id;
      var rest;
      var cellData;

      if (props.remote) {
        var fullAllDataRowMap = $table.fullAllDataRowMap;
        var cacheCell = fullAllDataRowMap.has(row);

        if (cacheCell) {
          rest = fullAllDataRowMap.get(row);
          cellData = rest.cellData;

          if (!cellData) {
            cellData = fullAllDataRowMap.get(row).cellData = {};
          }
        }

        if (rest && cellData[colid] && cellData[colid].value === cellValue) {
          return cellData[colid].label;
        }
      }

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

          var cellLabel = selectItem ? selectItem[labelProp] : value;

          if (cellData && options && options.length) {
            cellData[colid] = {
              value: cellValue,
              label: cellLabel
            };
          }

          return cellLabel;
        } : function (value) {
          var selectItem = _xeUtils["default"].find(options, function (item) {
            return item[valueProp] === value;
          });

          var cellLabel = selectItem ? selectItem[labelProp] : value;

          if (cellData && options && options.length) {
            cellData[colid] = {
              value: cellValue,
              label: cellLabel
            };
          }

          return cellLabel;
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
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImluZGV4LnRzIl0sIm5hbWVzIjpbImdldEZvcm1hdERhdGUiLCJ2YWx1ZSIsInByb3BzIiwiZGVmYXVsdEZvcm1hdCIsIlhFVXRpbHMiLCJ0b0RhdGVTdHJpbmciLCJmb3JtYXQiLCJnZXRGb3JtYXREYXRlcyIsInZhbHVlcyIsInNlcGFyYXRvciIsIm1hcCIsImRhdGUiLCJqb2luIiwiZXF1YWxEYXRlcmFuZ2UiLCJjZWxsVmFsdWUiLCJkYXRhIiwibWF0Y2hDYXNjYWRlckRhdGEiLCJpbmRleCIsImxpc3QiLCJsYWJlbHMiLCJ2YWwiLCJsZW5ndGgiLCJlYWNoIiwiaXRlbSIsInB1c2giLCJsYWJlbCIsImNoaWxkcmVuIiwiZ2V0UHJvcHMiLCJkZWZhdWx0UHJvcHMiLCIkdGFibGUiLCJhc3NpZ24iLCJ2U2l6ZSIsInNpemUiLCJnZXRDZWxsRXZlbnRzIiwicmVuZGVyT3B0cyIsInBhcmFtcyIsImV2ZW50cyIsInR5cGUiLCJvbiIsInVwZGF0ZVN0YXR1cyIsIm9iamVjdE1hcCIsImNiIiwiYXJncyIsImFwcGx5IiwiY29uY2F0IiwiY3JlYXRlRWRpdFJlbmRlciIsImgiLCJyb3ciLCJjb2x1bW4iLCJhdHRycyIsIm5hbWUiLCJtb2RlbCIsImdldCIsInByb3BlcnR5IiwiY2FsbGJhY2siLCJzZXQiLCJnZXRGaWx0ZXJFdmVudHMiLCJjb250ZXh0IiwiT2JqZWN0IiwiY3JlYXRlRmlsdGVyUmVuZGVyIiwiZmlsdGVycyIsIm9wdGlvblZhbHVlIiwiZXZudCIsImhhbmRsZUNvbmZpcm1GaWx0ZXIiLCJjaGVja2VkIiwiZmlsdGVyTXVsdGlwbGUiLCJkZWZhdWx0RmlsdGVyTWV0aG9kIiwib3B0aW9uIiwicmVuZGVyT3B0aW9ucyIsIm9wdGlvbnMiLCJvcHRpb25Qcm9wcyIsImxhYmVsUHJvcCIsInZhbHVlUHJvcCIsImRpc2FibGVkUHJvcCIsImRpc2FibGVkIiwia2V5IiwiY2VsbFRleHQiLCJyZW5kZXJNYXAiLCJJbnB1dCIsImF1dG9mb2N1cyIsInJlbmRlckRlZmF1bHQiLCJyZW5kZXJFZGl0IiwicmVuZGVyRmlsdGVyIiwiZmlsdGVyTWV0aG9kIiwiQXV0b0NvbXBsZXRlIiwiSW5wdXROdW1iZXIiLCJTZWxlY3QiLCJvcHRpb25Hcm91cHMiLCJvcHRpb25Hcm91cFByb3BzIiwidHJhbnNmZXIiLCJncm91cE9wdGlvbnMiLCJncm91cExhYmVsIiwiZ3JvdXAiLCJnSW5kZXgiLCJyZW5kZXJDZWxsIiwiY29saWQiLCJpZCIsInJlc3QiLCJjZWxsRGF0YSIsInJlbW90ZSIsImZ1bGxBbGxEYXRhUm93TWFwIiwiY2FjaGVDZWxsIiwiaGFzIiwidW5kZWZpbmVkIiwibXVsdGlwbGUiLCJzZWxlY3RJdGVtIiwiZmluZCIsImNlbGxMYWJlbCIsImZpbHRlclJlbmRlciIsImlzQXJyYXkiLCJpbmNsdWRlQXJyYXlzIiwiaW5kZXhPZiIsIkNhc2NhZGVyIiwiRGF0ZVBpY2tlciIsIlRpbWVQaWNrZXIiLCJSYXRlIiwiaVN3aXRjaCIsImhhbmRsZUNsZWFyRXZlbnQiLCJnZXRFdmVudFRhcmdldE5vZGUiLCJib2R5RWxlbSIsImRvY3VtZW50IiwiYm9keSIsImZsYWciLCJWWEVUYWJsZVBsdWdpbklWaWV3IiwiaW5zdGFsbCIsInh0YWJsZSIsImludGVyY2VwdG9yIiwicmVuZGVyZXIiLCJtaXhpbiIsImFkZCIsIndpbmRvdyIsIlZYRVRhYmxlIiwidXNlIl0sIm1hcHBpbmdzIjoiOzs7Ozs7O0FBQUE7Ozs7OztBQUdBLFNBQVNBLGFBQVQsQ0FBdUJDLEtBQXZCLEVBQW1DQyxLQUFuQyxFQUErQ0MsYUFBL0MsRUFBb0U7QUFDbEUsU0FBT0Msb0JBQVFDLFlBQVIsQ0FBcUJKLEtBQXJCLEVBQTRCQyxLQUFLLENBQUNJLE1BQU4sSUFBZ0JILGFBQTVDLENBQVA7QUFDRDs7QUFFRCxTQUFTSSxjQUFULENBQXdCQyxNQUF4QixFQUFxQ04sS0FBckMsRUFBaURPLFNBQWpELEVBQW9FTixhQUFwRSxFQUF5RjtBQUN2RixTQUFPQyxvQkFBUU0sR0FBUixDQUFZRixNQUFa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LFdBQU8sS0FBUDtBQUNEO0FBQ0Y7QUFFRDs7Ozs7QUFHTyxJQUFNQyxtQkFBbUIsR0FBRztBQUNqQ0MsRUFBQUEsT0FEaUMsbUJBQ3pCQyxNQUR5QixFQUNGO0FBQUEsUUFDdkJDLFdBRHVCLEdBQ0dELE1BREgsQ0FDdkJDLFdBRHVCO0FBQUEsUUFDVkMsUUFEVSxHQUNHRixNQURILENBQ1ZFLFFBRFU7QUFFN0JBLElBQUFBLFFBQVEsQ0FBQ0MsS0FBVCxDQUFlbkQsU0FBZjtBQUNBaUQsSUFBQUEsV0FBVyxDQUFDRyxHQUFaLENBQWdCLG1CQUFoQixFQUFxQ1osZ0JBQXJDO0FBQ0FTLElBQUFBLFdBQVcsQ0FBQ0csR0FBWixDQUFnQixvQkFBaEIsRUFBc0NaLGdCQUF0QztBQUNEO0FBTmdDLENBQTVCOzs7QUFTUCxJQUFJLE9BQU9hLE1BQVAsS0FBa0IsV0FBbEIsSUFBaUNBLE1BQU0sQ0FBQ0MsUUFBNUMsRUFBc0Q7QUFDcERELEVBQUFBLE1BQU0sQ0FBQ0MsUUFBUCxDQUFnQkMsR0FBaEIsQ0FBb0JULG1CQUFwQjtBQUNEOztlQUVjQSxtQiIsImZpbGUiOiJpbmRleC5jb21tb24uanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgWEVVdGlscyBmcm9tICd4ZS11dGlscy9tZXRob2RzL3hlLXV0aWxzJ1xyXG5pbXBvcnQgVlhFVGFibGUgZnJvbSAndnhlLXRhYmxlL2xpYi92eGUtdGFibGUnXHJcblxyXG5mdW5jdGlvbiBnZXRGb3JtYXREYXRlKHZhbHVlOiBhbnksIHByb3BzOiBhbnksIGRlZmF1bHRGb3JtYXQ6IHN0cmluZykge1xyXG4gIHJldHVybiBYRVV0aWxzLnRvRGF0ZVN0cmluZyh2YWx1ZSwgcHJvcHMuZm9ybWF0IHx8IGRlZmF1bHRGb3JtYXQpXHJcbn1cclxuXHJcbmZ1bmN0aW9uIGdldEZvcm1hdERhdGVzKHZhbHVlczogYW55LCBwcm9wczogYW55LCBzZXBhcmF0b3I6IHN0cmluZywgZGVmYXVsdEZvcm1hdDogc3RyaW5nKSB7XHJcbiAgcmV0dXJuIFhFVXRpbHMubWFwKHZhbHVlcywgKGRhdGU6IGFueSkgPT4gZ2V0Rm9ybWF0RGF0ZShkYXRlLCBwcm9wcywgZGVmYXVsdEZvcm1hdCkpLmpvaW4oc2VwYXJhdG9yKVxyXG59XHJcblxyXG5mdW5jdGlvbiBlcXVhbERhdGVyYW5nZShjZWxsVmFsdWU6IGFueSwgZGF0YTogYW55LCBwcm9wczogYW55LCBkZWZhdWx0Rm9ybWF0OiBzdHJpbmcpIHtcclxuICBjZWxsVmFsdWUgPSBnZXRGb3JtYXREYXRlKGNlbGxWYWx1ZSwgcHJvcHMsIGRlZmF1bHRGb3JtYXQpXHJcbiAgcmV0dXJuIGNlbGxWYWx1ZSA+PSBnZXRGb3JtYXREYXRlKGRhdGFbMF0sIHByb3BzLCBkZWZhdWx0Rm9ybWF0KSAmJiBjZWxsVmFsdWUgPD0gZ2V0Rm9ybWF0RGF0ZShkYXRhWzFdLCBwcm9wcywgZGVmYXVsdEZvcm1hdClcclxufVxyXG5cclxuZnVuY3Rpb24gbWF0Y2hDYXNjYWRlckRhdGEoaW5kZXg6IG51bWJlciwgbGlzdDogQXJyYXk8YW55PiwgdmFsdWVzOiBBcnJheTxhbnk+LCBsYWJlbHM6IEFycmF5PGFueT4pIHtcclxuICBsZXQgdmFsID0gdmFsdWVzW2luZGV4XVxyXG4gIGlmIChsaXN0ICYmIHZhbHVlcy5sZW5ndGggPiBpbmRleCkge1xyXG4gICAgWEVVdGlscy5lYWNoKGxpc3QsIChpdGVtOiBhbnkpID0+IHtcclxuICAgICAgaWYgKGl0ZW0udmFsdWUgPT09IHZhbCkge1xyXG4gICAgICAgIGxhYmVscy5wdXNoKGl0ZW0ubGFiZWwpXHJcbiAgICAgICAgbWF0Y2hDYXNjYWRlckRhdGEoKytpbmRleCwgaXRlbS5jaGlsZHJlbiwgdmFsdWVzLCBsYWJlbHMpXHJcbiAgICAgIH1cclxuICAgIH0pXHJcbiAgfVxyXG59XHJcblxyXG5mdW5jdGlvbiBnZXRQcm9wcyh7ICR0YWJsZSB9OiBhbnksIHsgcHJvcHMgfTogYW55LCBkZWZhdWx0UHJvcHM/OiBhbnkpIHtcclxuICByZXR1cm4gWEVVdGlscy5hc3NpZ24oJHRhYmxlLnZTaXplID8geyBzaXplOiAkdGFibGUudlNpemUgfSA6IHt9LCBkZWZhdWx0UHJvcHMsIHByb3BzKVxyXG59XHJcblxyXG5mdW5jdGlvbiBnZXRDZWxsRXZlbnRzKHJlbmRlck9wdHM6IGFueSwgcGFyYW1zOiBhbnkpIHtcclxuICBsZXQgeyBldmVudHMgfSA9IHJlbmRlck9wdHNcclxuICBsZXQgeyAkdGFibGUgfSA9IHBhcmFtc1xyXG4gIGxldCB0eXBlID0gJ29uLWNoYW5nZSdcclxuICBsZXQgb24gPSB7XHJcbiAgICBbdHlwZV06ICgpID0+ICR0YWJsZS51cGRhdGVTdGF0dXMocGFyYW1zKVxyXG4gIH1cclxuICBpZiAoZXZlbnRzKSB7XHJcbiAgICByZXR1cm4gWEVVdGlscy5hc3NpZ24oe30sIFhFVXRpbHMub2JqZWN0TWFwKGV2ZW50cywgKGNiOiBGdW5jdGlvbikgPT4gZnVuY3Rpb24gKC4uLmFyZ3M6IGFueVtdKSB7XHJcbiAgICAgIGNiLmFwcGx5KG51bGwsIFtwYXJhbXNdLmNvbmNhdC5hcHBseShwYXJhbXMsIGFyZ3MpKVxyXG4gICAgfSksIG9uKVxyXG4gIH1cclxuICByZXR1cm4gb25cclxufVxyXG5cclxuZnVuY3Rpb24gY3JlYXRlRWRpdFJlbmRlcihkZWZhdWx0UHJvcHM/OiBhbnkpIHtcclxuICByZXR1cm4gZnVuY3Rpb24gKGg6IEZ1bmN0aW9uLCByZW5kZXJPcHRzOiBhbnksIHBhcmFtczogYW55KSB7XHJcbiAgICBsZXQgeyByb3csIGNvbHVtbiB9ID0gcGFyYW1zXHJcbiAgICBsZXQgeyBhdHRycyB9ID0gcmVuZGVyT3B0c1xyXG4gICAgbGV0IHByb3BzID0gZ2V0UHJvcHMocGFyYW1zLCByZW5kZXJPcHRzLCBkZWZhdWx0UHJvcHMpXHJcbiAgICByZXR1cm4gW1xyXG4gICAgICBoKHJlbmRlck9wdHMubmFtZSwge1xyXG4gICAgICAgIHByb3BzLFxyXG4gICAgICAgIGF0dHJzLFxyXG4gICAgICAgIG1vZGVsOiB7XHJcbiAgICAgICAgICB2YWx1ZTogWEVVdGlscy5nZXQocm93LCBjb2x1bW4ucHJvcGVydHkpLFxyXG4gICAgICAgICAgY2FsbGJhY2sodmFsdWU6IGFueSkge1xyXG4gICAgICAgICAgICBYRVV0aWxzLnNldChyb3csIGNvbHVtbi5wcm9wZXJ0eSwgdmFsdWUpXHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfSxcclxuICAgICAgICBvbjogZ2V0Q2VsbEV2ZW50cyhyZW5kZXJPcHRzLCBwYXJhbXMpXHJcbiAgICAgIH0pXHJcbiAgICBdXHJcbiAgfVxyXG59XHJcblxyXG5mdW5jdGlvbiBnZXRGaWx0ZXJFdmVudHMob246IGFueSwgcmVuZGVyT3B0czogYW55LCBwYXJhbXM6IGFueSwgY29udGV4dDogYW55KSB7XHJcbiAgbGV0IHsgZXZlbnRzIH0gPSByZW5kZXJPcHRzXHJcbiAgaWYgKGV2ZW50cykge1xyXG4gICAgcmV0dXJuIFhFVXRpbHMuYXNzaWduKHt9LCBYRVV0aWxzLm9iamVjdE1hcChldmVudHMsIChjYjogRnVuY3Rpb24pID0+IGZ1bmN0aW9uICguLi5hcmdzOiBhbnlbXSkge1xyXG4gICAgICBwYXJhbXMgPSBPYmplY3QuYXNzaWduKHsgY29udGV4dCB9LCBwYXJhbXMpXHJcbiAgICAgIGNiLmFwcGx5KG51bGwsIFtwYXJhbXNdLmNvbmNhdC5hcHBseShwYXJhbXMsIGFyZ3MpKVxyXG4gICAgfSksIG9uKVxyXG4gIH1cclxuICByZXR1cm4gb25cclxufVxyXG5cclxuZnVuY3Rpb24gY3JlYXRlRmlsdGVyUmVuZGVyKGRlZmF1bHRQcm9wcz86IGFueSkge1xyXG4gIHJldHVybiBmdW5jdGlvbiAoaDogRnVuY3Rpb24sIHJlbmRlck9wdHM6IGFueSwgcGFyYW1zOiBhbnksIGNvbnRleHQ6IGFueSkge1xyXG4gICAgbGV0IHsgY29sdW1uIH0gPSBwYXJhbXNcclxuICAgIGxldCB7IG5hbWUsIGF0dHJzLCBldmVudHMgfSA9IHJlbmRlck9wdHNcclxuICAgIGxldCB0eXBlID0gJ29uLWNoYW5nZSdcclxuICAgIGxldCBwcm9wcyA9IGdldFByb3BzKHBhcmFtcywgcmVuZGVyT3B0cylcclxuICAgIHJldHVybiBjb2x1bW4uZmlsdGVycy5tYXAoKGl0ZW06IGFueSkgPT4ge1xyXG4gICAgICByZXR1cm4gaChuYW1lLCB7XHJcbiAgICAgICAgcHJvcHMsXHJcbiAgICAgICAgYXR0cnMsXHJcbiAgICAgICAgbW9kZWw6IHtcclxuICAgICAgICAgIHZhbHVlOiBpdGVtLmRhdGEsXHJcbiAgICAgICAgICBjYWxsYmFjayhvcHRpb25WYWx1ZTogYW55KSB7XHJcbiAgICAgICAgICAgIGl0ZW0uZGF0YSA9IG9wdGlvblZhbHVlXHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfSxcclxuICAgICAgICBvbjogZ2V0RmlsdGVyRXZlbnRzKHtcclxuICAgICAgICAgIFt0eXBlXShldm50OiBhbnkpIHtcclxuICAgICAgICAgICAgaGFuZGxlQ29uZmlybUZpbHRlcihjb250ZXh0LCBjb2x1bW4sICEhaXRlbS5kYXRhLCBpdGVtKVxyXG4gICAgICAgICAgICBpZiAoZXZlbnRzICYmIGV2ZW50c1t0eXBlXSkge1xyXG4gICAgICAgICAgICAgIGV2ZW50c1t0eXBlXShPYmplY3QuYXNzaWduKHsgY29udGV4dCB9LCBwYXJhbXMpLCBldm50KVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfSwgcmVuZGVyT3B0cywgcGFyYW1zLCBjb250ZXh0KVxyXG4gICAgICB9KVxyXG4gICAgfSlcclxuICB9XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGhhbmRsZUNvbmZpcm1GaWx0ZXIoY29udGV4dDogYW55LCBjb2x1bW46IGFueSwgY2hlY2tlZDogYW55LCBpdGVtOiBhbnkpIHtcclxuICBjb250ZXh0W2NvbHVtbi5maWx0ZXJNdWx0aXBsZSA/ICdjaGFuZ2VNdWx0aXBsZU9wdGlvbicgOiAnY2hhbmdlUmFkaW9PcHRpb24nXSh7fSwgY2hlY2tlZCwgaXRlbSlcclxufVxyXG5cclxuZnVuY3Rpb24gZGVmYXVsdEZpbHRlck1ldGhvZCh7IG9wdGlvbiwgcm93LCBjb2x1bW4gfTogYW55KSB7XHJcbiAgbGV0IHsgZGF0YSB9ID0gb3B0aW9uXHJcbiAgbGV0IGNlbGxWYWx1ZSA9IFhFVXRpbHMuZ2V0KHJvdywgY29sdW1uLnByb3BlcnR5KVxyXG4gIC8qIGVzbGludC1kaXNhYmxlIGVxZXFlcSAqL1xyXG4gIHJldHVybiBjZWxsVmFsdWUgPT09IGRhdGFcclxufVxyXG5cclxuZnVuY3Rpb24gcmVuZGVyT3B0aW9ucyhoOiBGdW5jdGlvbiwgb3B0aW9uczogYW55LCBvcHRpb25Qcm9wczogYW55KSB7XHJcbiAgbGV0IGxhYmVsUHJvcCA9IG9wdGlvblByb3BzLmxhYmVsIHx8ICdsYWJlbCdcclxuICBsZXQgdmFsdWVQcm9wID0gb3B0aW9uUHJvcHMudmFsdWUgfHwgJ3ZhbHVlJ1xyXG4gIGxldCBkaXNhYmxlZFByb3AgPSBvcHRpb25Qcm9wcy5kaXNhYmxlZCB8fCAnZGlzYWJsZWQnXHJcbiAgcmV0dXJuIFhFVXRpbHMubWFwKG9wdGlvbnMsIChpdGVtOiBhbnksIGluZGV4OiBudW1iZXIpID0+IHtcclxuICAgIHJldHVybiBoKCdPcHRpb24nLCB7XHJcbiAgICAgIHByb3BzOiB7XHJcbiAgICAgICAgdmFsdWU6IGl0ZW1bdmFsdWVQcm9wXSxcclxuICAgICAgICBsYWJlbDogaXRlbVtsYWJlbFByb3BdLFxyXG4gICAgICAgIGRpc2FibGVkOiBpdGVtW2Rpc2FibGVkUHJvcF1cclxuICAgICAgfSxcclxuICAgICAga2V5OiBpbmRleFxyXG4gICAgfSlcclxuICB9KVxyXG59XHJcblxyXG5mdW5jdGlvbiBjZWxsVGV4dChoOiBGdW5jdGlvbiwgY2VsbFZhbHVlOiBhbnkpIHtcclxuICByZXR1cm4gWycnICsgKGNlbGxWYWx1ZSA9PT0gbnVsbCB8fCBjZWxsVmFsdWUgPT09IHZvaWQgMCA/ICcnIDogY2VsbFZhbHVlKV1cclxufVxyXG5cclxuLyoqXHJcbiAqIOa4suafk+WHveaVsFxyXG4gKi9cclxuY29uc3QgcmVuZGVyTWFwID0ge1xyXG4gIElucHV0OiB7XHJcbiAgICBhdXRvZm9jdXM6ICdpbnB1dC5pdnUtaW5wdXQnLFxyXG4gICAgcmVuZGVyRGVmYXVsdDogY3JlYXRlRWRpdFJlbmRlcigpLFxyXG4gICAgcmVuZGVyRWRpdDogY3JlYXRlRWRpdFJlbmRlcigpLFxyXG4gICAgcmVuZGVyRmlsdGVyOiBjcmVhdGVGaWx0ZXJSZW5kZXIoKSxcclxuICAgIGZpbHRlck1ldGhvZDogZGVmYXVsdEZpbHRlck1ldGhvZFxyXG4gIH0sXHJcbiAgQXV0b0NvbXBsZXRlOiB7XHJcbiAgICBhdXRvZm9jdXM6ICdpbnB1dC5pdnUtaW5wdXQnLFxyXG4gICAgcmVuZGVyRGVmYXVsdDogY3JlYXRlRWRpdFJlbmRlcigpLFxyXG4gICAgcmVuZGVyRWRpdDogY3JlYXRlRWRpdFJlbmRlcigpLFxyXG4gICAgcmVuZGVyRmlsdGVyOiBjcmVhdGVGaWx0ZXJSZW5kZXIoKSxcclxuICAgIGZpbHRlck1ldGhvZDogZGVmYXVsdEZpbHRlck1ldGhvZFxyXG4gIH0sXHJcbiAgSW5wdXROdW1iZXI6IHtcclxuICAgIGF1dG9mb2N1czogJ2lucHV0Lml2dS1pbnB1dC1udW1iZXItaW5wdXQnLFxyXG4gICAgcmVuZGVyRGVmYXVsdDogY3JlYXRlRWRpdFJlbmRlcigpLFxyXG4gICAgcmVuZGVyRWRpdDogY3JlYXRlRWRpdFJlbmRlcigpLFxyXG4gICAgcmVuZGVyRmlsdGVyOiBjcmVhdGVGaWx0ZXJSZW5kZXIoKSxcclxuICAgIGZpbHRlck1ldGhvZDogZGVmYXVsdEZpbHRlck1ldGhvZFxyXG4gIH0sXHJcbiAgU2VsZWN0OiB7XHJcbiAgICByZW5kZXJFZGl0KGg6IEZ1bmN0aW9uLCByZW5kZXJPcHRzOiBhbnksIHBhcmFtczogYW55KSB7XHJcbiAgICAgIGxldCB7IG9wdGlvbnMsIG9wdGlvbkdyb3Vwcywgb3B0aW9uUHJvcHMgPSB7fSwgb3B0aW9uR3JvdXBQcm9wcyA9IHt9IH0gPSByZW5kZXJPcHRzXHJcbiAgICAgIGxldCB7IHJvdywgY29sdW1uIH0gPSBwYXJhbXNcclxuICAgICAgbGV0IHsgYXR0cnMgfSA9IHJlbmRlck9wdHNcclxuICAgICAgbGV0IHByb3BzID0gZ2V0UHJvcHMocGFyYW1zLCByZW5kZXJPcHRzLCB7IHRyYW5zZmVyOiB0cnVlIH0pXHJcbiAgICAgIGlmIChvcHRpb25Hcm91cHMpIHtcclxuICAgICAgICBsZXQgZ3JvdXBPcHRpb25zID0gb3B0aW9uR3JvdXBQcm9wcy5vcHRpb25zIHx8ICdvcHRpb25zJ1xyXG4gICAgICAgIGxldCBncm91cExhYmVsID0gb3B0aW9uR3JvdXBQcm9wcy5sYWJlbCB8fCAnbGFiZWwnXHJcbiAgICAgICAgcmV0dXJuIFtcclxuICAgICAgICAgIGgoJ1NlbGVjdCcsIHtcclxuICAgICAgICAgICAgcHJvcHMsXHJcbiAgICAgICAgICAgIGF0dHJzLFxyXG4gICAgICAgICAgICBtb2RlbDoge1xyXG4gICAgICAgICAgICAgIHZhbHVlOiBYRVV0aWxzLmdldChyb3csIGNvbHVtbi5wcm9wZXJ0eSksXHJcbiAgICAgICAgICAgICAgY2FsbGJhY2soY2VsbFZhbHVlOiBhbnkpIHtcclxuICAgICAgICAgICAgICAgIFhFVXRpbHMuc2V0KHJvdywgY29sdW1uLnByb3BlcnR5LCBjZWxsVmFsdWUpXHJcbiAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICBvbjogZ2V0Q2VsbEV2ZW50cyhyZW5kZXJPcHRzLCBwYXJhbXMpXHJcbiAgICAgICAgICB9LCBYRVV0aWxzLm1hcChvcHRpb25Hcm91cHMsIChncm91cDogYW55LCBnSW5kZXg6IG51bWJlcikgPT4ge1xyXG4gICAgICAgICAgICByZXR1cm4gaCgnT3B0aW9uR3JvdXAnLCB7XHJcbiAgICAgICAgICAgICAgcHJvcHM6IHtcclxuICAgICAgICAgICAgICAgIGxhYmVsOiBncm91cFtncm91cExhYmVsXVxyXG4gICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAga2V5OiBnSW5kZXhcclxuICAgICAgICAgICAgfSwgcmVuZGVyT3B0aW9ucyhoLCBncm91cFtncm91cE9wdGlvbnNdLCBvcHRpb25Qcm9wcykpXHJcbiAgICAgICAgICB9KSlcclxuICAgICAgICBdXHJcbiAgICAgIH1cclxuICAgICAgcmV0dXJuIFtcclxuICAgICAgICBoKCdTZWxlY3QnLCB7XHJcbiAgICAgICAgICBwcm9wcyxcclxuICAgICAgICAgIGF0dHJzLFxyXG4gICAgICAgICAgbW9kZWw6IHtcclxuICAgICAgICAgICAgdmFsdWU6IFhFVXRpbHMuZ2V0KHJvdywgY29sdW1uLnByb3BlcnR5KSxcclxuICAgICAgICAgICAgY2FsbGJhY2soY2VsbFZhbHVlOiBhbnkpIHtcclxuICAgICAgICAgICAgICBYRVV0aWxzLnNldChyb3csIGNvbHVtbi5wcm9wZXJ0eSwgY2VsbFZhbHVlKVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICB9LFxyXG4gICAgICAgICAgb246IGdldENlbGxFdmVudHMocmVuZGVyT3B0cywgcGFyYW1zKVxyXG4gICAgICAgIH0sIHJlbmRlck9wdGlvbnMoaCwgb3B0aW9ucywgb3B0aW9uUHJvcHMpKVxyXG4gICAgICBdXHJcbiAgICB9LFxyXG4gICAgcmVuZGVyQ2VsbChoOiBGdW5jdGlvbiwgcmVuZGVyT3B0czogYW55LCBwYXJhbXM6IGFueSkge1xyXG4gICAgICBsZXQgeyBvcHRpb25zLCBvcHRpb25Hcm91cHMsIHByb3BzID0ge30sIG9wdGlvblByb3BzID0ge30sIG9wdGlvbkdyb3VwUHJvcHMgPSB7fSB9ID0gcmVuZGVyT3B0c1xyXG4gICAgICBsZXQgeyAkdGFibGUsIHJvdywgY29sdW1uIH0gPSBwYXJhbXNcclxuICAgICAgbGV0IGxhYmVsUHJvcCA9IG9wdGlvblByb3BzLmxhYmVsIHx8ICdsYWJlbCdcclxuICAgICAgbGV0IHZhbHVlUHJvcCA9IG9wdGlvblByb3BzLnZhbHVlIHx8ICd2YWx1ZSdcclxuICAgICAgbGV0IGdyb3VwT3B0aW9ucyA9IG9wdGlvbkdyb3VwUHJvcHMub3B0aW9ucyB8fCAnb3B0aW9ucydcclxuICAgICAgbGV0IGNlbGxWYWx1ZSA9IFhFVXRpbHMuZ2V0KHJvdywgY29sdW1uLnByb3BlcnR5KVxyXG4gICAgICBsZXQgY29saWQ6IHN0cmluZyA9IGNvbHVtbi5pZFxyXG4gICAgICBsZXQgcmVzdDogYW55XHJcbiAgICAgIGxldCBjZWxsRGF0YTogYW55XHJcbiAgICAgIGlmIChwcm9wcy5yZW1vdGUpIHtcclxuICAgICAgICBsZXQgZnVsbEFsbERhdGFSb3dNYXA6IE1hcDxhbnksIGFueT4gPSAkdGFibGUuZnVsbEFsbERhdGFSb3dNYXBcclxuICAgICAgICBsZXQgY2FjaGVDZWxsOiBhbnkgPSBmdWxsQWxsRGF0YVJvd01hcC5oYXMocm93KVxyXG4gICAgICAgIGlmIChjYWNoZUNlbGwpIHtcclxuICAgICAgICAgIHJlc3QgPSBmdWxsQWxsRGF0YVJvd01hcC5nZXQocm93KVxyXG4gICAgICAgICAgY2VsbERhdGEgPSByZXN0LmNlbGxEYXRhXHJcbiAgICAgICAgICBpZiAoIWNlbGxEYXRhKSB7XHJcbiAgICAgICAgICAgIGNlbGxEYXRhID0gZnVsbEFsbERhdGFSb3dNYXAuZ2V0KHJvdykuY2VsbERhdGEgPSB7fVxyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAocmVzdCAmJiBjZWxsRGF0YVtjb2xpZF0gJiYgY2VsbERhdGFbY29saWRdLnZhbHVlID09PSBjZWxsVmFsdWUpIHtcclxuICAgICAgICAgIHJldHVybiBjZWxsRGF0YVtjb2xpZF0ubGFiZWxcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgICAgaWYgKCEoY2VsbFZhbHVlID09PSBudWxsIHx8IGNlbGxWYWx1ZSA9PT0gdW5kZWZpbmVkIHx8IGNlbGxWYWx1ZSA9PT0gJycpKSB7XHJcbiAgICAgICAgcmV0dXJuIGNlbGxUZXh0KGgsIFhFVXRpbHMubWFwKHByb3BzLm11bHRpcGxlID8gY2VsbFZhbHVlIDogW2NlbGxWYWx1ZV0sIG9wdGlvbkdyb3VwcyA/ICh2YWx1ZTogYW55KSA9PiB7XHJcbiAgICAgICAgICBsZXQgc2VsZWN0SXRlbVxyXG4gICAgICAgICAgZm9yIChsZXQgaW5kZXggPSAwOyBpbmRleCA8IG9wdGlvbkdyb3Vwcy5sZW5ndGg7IGluZGV4KyspIHtcclxuICAgICAgICAgICAgc2VsZWN0SXRlbSA9IFhFVXRpbHMuZmluZChvcHRpb25Hcm91cHNbaW5kZXhdW2dyb3VwT3B0aW9uc10sIChpdGVtOiBhbnkpID0+IGl0ZW1bdmFsdWVQcm9wXSA9PT0gdmFsdWUpXHJcbiAgICAgICAgICAgIGlmIChzZWxlY3RJdGVtKSB7XHJcbiAgICAgICAgICAgICAgYnJlYWtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgfVxyXG4gICAgICAgICAgbGV0IGNlbGxMYWJlbDogYW55ID0gc2VsZWN0SXRlbSA/IHNlbGVjdEl0ZW1bbGFiZWxQcm9wXSA6IHZhbHVlXHJcbiAgICAgICAgICBpZiAoY2VsbERhdGEgJiYgb3B0aW9ucyAmJiBvcHRpb25zLmxlbmd0aCkge1xyXG4gICAgICAgICAgICBjZWxsRGF0YVtjb2xpZF0gPSB7IHZhbHVlOiBjZWxsVmFsdWUsIGxhYmVsOiBjZWxsTGFiZWwgfVxyXG4gICAgICAgICAgfVxyXG4gICAgICAgICAgcmV0dXJuIGNlbGxMYWJlbFxyXG4gICAgICAgIH0gOiAodmFsdWU6IGFueSkgPT4ge1xyXG4gICAgICAgICAgbGV0IHNlbGVjdEl0ZW0gPSBYRVV0aWxzLmZpbmQob3B0aW9ucywgKGl0ZW06IGFueSkgPT4gaXRlbVt2YWx1ZVByb3BdID09PSB2YWx1ZSlcclxuICAgICAgICAgIGxldCBjZWxsTGFiZWw6IGFueSA9IHNlbGVjdEl0ZW0gPyBzZWxlY3RJdGVtW2xhYmVsUHJvcF0gOiB2YWx1ZVxyXG4gICAgICAgICAgaWYgKGNlbGxEYXRhICYmIG9wdGlvbnMgJiYgb3B0aW9ucy5sZW5ndGgpIHtcclxuICAgICAgICAgICAgY2VsbERhdGFbY29saWRdID0geyB2YWx1ZTogY2VsbFZhbHVlLCBsYWJlbDogY2VsbExhYmVsIH1cclxuICAgICAgICAgIH1cclxuICAgICAgICAgIHJldHVybiBjZWxsTGFiZWxcclxuICAgICAgICB9KS5qb2luKCc7JykpXHJcbiAgICAgIH1cclxuICAgICAgcmV0dXJuIGNlbGxUZXh0KGgsICcnKVxyXG4gICAgfSxcclxuICAgIHJlbmRlckZpbHRlcihoOiBGdW5jdGlvbiwgcmVuZGVyT3B0czogYW55LCBwYXJhbXM6IGFueSwgY29udGV4dDogYW55KSB7XHJcbiAgICAgIGxldCB7IG9wdGlvbnMsIG9wdGlvbkdyb3Vwcywgb3B0aW9uUHJvcHMgPSB7fSwgb3B0aW9uR3JvdXBQcm9wcyA9IHt9IH0gPSByZW5kZXJPcHRzXHJcbiAgICAgIGxldCB7IGNvbHVtbiB9ID0gcGFyYW1zXHJcbiAgICAgIGxldCB7IGF0dHJzLCBldmVudHMgfSA9IHJlbmRlck9wdHNcclxuICAgICAgbGV0IHByb3BzID0gZ2V0UHJvcHMocGFyYW1zLCByZW5kZXJPcHRzLCB7IHRyYW5zZmVyOiB0cnVlIH0pXHJcbiAgICAgIGxldCB0eXBlID0gJ29uLWNoYW5nZSdcclxuICAgICAgaWYgKG9wdGlvbkdyb3Vwcykge1xyXG4gICAgICAgIGxldCBncm91cE9wdGlvbnMgPSBvcHRpb25Hcm91cFByb3BzLm9wdGlvbnMgfHwgJ29wdGlvbnMnXHJcbiAgICAgICAgbGV0IGdyb3VwTGFiZWwgPSBvcHRpb25Hcm91cFByb3BzLmxhYmVsIHx8ICdsYWJlbCdcclxuICAgICAgICByZXR1cm4gY29sdW1uLmZpbHRlcnMubWFwKChpdGVtOiBhbnkpID0+IHtcclxuICAgICAgICAgIHJldHVybiBoKCdTZWxlY3QnLCB7XHJcbiAgICAgICAgICAgIHByb3BzLFxyXG4gICAgICAgICAgICBhdHRycyxcclxuICAgICAgICAgICAgbW9kZWw6IHtcclxuICAgICAgICAgICAgICB2YWx1ZTogaXRlbS5kYXRhLFxyXG4gICAgICAgICAgICAgIGNhbGxiYWNrKG9wdGlvblZhbHVlOiBhbnkpIHtcclxuICAgICAgICAgICAgICAgIGl0ZW0uZGF0YSA9IG9wdGlvblZhbHVlXHJcbiAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICBvbjogZ2V0RmlsdGVyRXZlbnRzKHtcclxuICAgICAgICAgICAgICBbdHlwZV0odmFsdWU6IGFueSkge1xyXG4gICAgICAgICAgICAgICAgaGFuZGxlQ29uZmlybUZpbHRlcihjb250ZXh0LCBjb2x1bW4sIHZhbHVlICYmIHZhbHVlLmxlbmd0aCA+IDAsIGl0ZW0pXHJcbiAgICAgICAgICAgICAgICBpZiAoZXZlbnRzICYmIGV2ZW50c1t0eXBlXSkge1xyXG4gICAgICAgICAgICAgICAgICBldmVudHNbdHlwZV0oT2JqZWN0LmFzc2lnbih7IGNvbnRleHQgfSwgcGFyYW1zKSwgdmFsdWUpXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9LCByZW5kZXJPcHRzLCBwYXJhbXMsIGNvbnRleHQpXHJcbiAgICAgICAgICB9LCBYRVV0aWxzLm1hcChvcHRpb25Hcm91cHMsIChncm91cDogYW55LCBnSW5kZXg6IG51bWJlcikgPT4ge1xyXG4gICAgICAgICAgICByZXR1cm4gaCgnT3B0aW9uR3JvdXAnLCB7XHJcbiAgICAgICAgICAgICAgcHJvcHM6IHtcclxuICAgICAgICAgICAgICAgIGxhYmVsOiBncm91cFtncm91cExhYmVsXVxyXG4gICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAga2V5OiBnSW5kZXhcclxuICAgICAgICAgICAgfSwgcmVuZGVyT3B0aW9ucyhoLCBncm91cFtncm91cE9wdGlvbnNdLCBvcHRpb25Qcm9wcykpXHJcbiAgICAgICAgICB9KSlcclxuICAgICAgICB9KVxyXG4gICAgICB9XHJcbiAgICAgIHJldHVybiBjb2x1bW4uZmlsdGVycy5tYXAoKGl0ZW06IGFueSkgPT4ge1xyXG4gICAgICAgIHJldHVybiBoKCdTZWxlY3QnLCB7XHJcbiAgICAgICAgICBwcm9wcyxcclxuICAgICAgICAgIGF0dHJzLFxyXG4gICAgICAgICAgbW9kZWw6IHtcclxuICAgICAgICAgICAgdmFsdWU6IGl0ZW0uZGF0YSxcclxuICAgICAgICAgICAgY2FsbGJhY2sob3B0aW9uVmFsdWU6IGFueSkge1xyXG4gICAgICAgICAgICAgIGl0ZW0uZGF0YSA9IG9wdGlvblZhbHVlXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgIH0sXHJcbiAgICAgICAgICBvbjogZ2V0RmlsdGVyRXZlbnRzKHtcclxuICAgICAgICAgICAgW3R5cGVdKHZhbHVlOiBhbnkpIHtcclxuICAgICAgICAgICAgICBoYW5kbGVDb25maXJtRmlsdGVyKGNvbnRleHQsIGNvbHVtbiwgdmFsdWUgJiYgdmFsdWUubGVuZ3RoID4gMCwgaXRlbSlcclxuICAgICAgICAgICAgICBpZiAoZXZlbnRzICYmIGV2ZW50c1t0eXBlXSkge1xyXG4gICAgICAgICAgICAgICAgZXZlbnRzW3R5cGVdKE9iamVjdC5hc3NpZ24oeyBjb250ZXh0IH0sIHBhcmFtcyksIHZhbHVlKVxyXG4gICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgfSwgcmVuZGVyT3B0cywgcGFyYW1zLCBjb250ZXh0KVxyXG4gICAgICAgIH0sIHJlbmRlck9wdGlvbnMoaCwgb3B0aW9ucywgb3B0aW9uUHJvcHMpKVxyXG4gICAgICB9KVxyXG4gICAgfSxcclxuICAgIGZpbHRlck1ldGhvZCh7IG9wdGlvbiwgcm93LCBjb2x1bW4gfTogYW55KSB7XHJcbiAgICAgIGxldCB7IGRhdGEgfSA9IG9wdGlvblxyXG4gICAgICBsZXQgeyBwcm9wZXJ0eSwgZmlsdGVyUmVuZGVyOiByZW5kZXJPcHRzIH0gPSBjb2x1bW5cclxuICAgICAgbGV0IHsgcHJvcHMgPSB7fSB9ID0gcmVuZGVyT3B0c1xyXG4gICAgICBsZXQgY2VsbFZhbHVlID0gWEVVdGlscy5nZXQocm93LCBwcm9wZXJ0eSlcclxuICAgICAgaWYgKHByb3BzLm11bHRpcGxlKSB7XHJcbiAgICAgICAgaWYgKFhFVXRpbHMuaXNBcnJheShjZWxsVmFsdWUpKSB7XHJcbiAgICAgICAgICByZXR1cm4gWEVVdGlscy5pbmNsdWRlQXJyYXlzKGNlbGxWYWx1ZSwgZGF0YSlcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIGRhdGEuaW5kZXhPZihjZWxsVmFsdWUpID4gLTFcclxuICAgICAgfVxyXG4gICAgICAvKiBlc2xpbnQtZGlzYWJsZSBlcWVxZXEgKi9cclxuICAgICAgcmV0dXJuIGNlbGxWYWx1ZSA9PSBkYXRhXHJcbiAgICB9XHJcbiAgfSxcclxuICBDYXNjYWRlcjoge1xyXG4gICAgcmVuZGVyRWRpdDogY3JlYXRlRWRpdFJlbmRlcih7IHRyYW5zZmVyOiB0cnVlIH0pLFxyXG4gICAgcmVuZGVyQ2VsbChoOiBGdW5jdGlvbiwgeyBwcm9wcyA9IHt9IH06IGFueSwgcGFyYW1zOiBhbnkpIHtcclxuICAgICAgbGV0IHsgcm93LCBjb2x1bW4gfSA9IHBhcmFtc1xyXG4gICAgICBsZXQgY2VsbFZhbHVlID0gWEVVdGlscy5nZXQocm93LCBjb2x1bW4ucHJvcGVydHkpXHJcbiAgICAgIGxldCB2YWx1ZXMgPSBjZWxsVmFsdWUgfHwgW11cclxuICAgICAgbGV0IGxhYmVsczogQXJyYXk8YW55PiA9IFtdXHJcbiAgICAgIG1hdGNoQ2FzY2FkZXJEYXRhKDAsIHByb3BzLmRhdGEsIHZhbHVlcywgbGFiZWxzKVxyXG4gICAgICByZXR1cm4gY2VsbFRleHQoaCwgbGFiZWxzLmpvaW4oYCAke3Byb3BzLnNlcGFyYXRvciB8fCAnLyd9IGApKVxyXG4gICAgfVxyXG4gIH0sXHJcbiAgRGF0ZVBpY2tlcjoge1xyXG4gICAgcmVuZGVyRWRpdDogY3JlYXRlRWRpdFJlbmRlcih7IHRyYW5zZmVyOiB0cnVlIH0pLFxyXG4gICAgcmVuZGVyQ2VsbChoOiBGdW5jdGlvbiwgeyBwcm9wcyA9IHt9IH06IGFueSwgcGFyYW1zOiBhbnkpIHtcclxuICAgICAgbGV0IHsgcm93LCBjb2x1bW4gfSA9IHBhcmFtc1xyXG4gICAgICBsZXQgeyBzZXBhcmF0b3IgfSA9IHByb3BzXHJcbiAgICAgIGxldCBjZWxsVmFsdWUgPSBYRVV0aWxzLmdldChyb3csIGNvbHVtbi5wcm9wZXJ0eSlcclxuICAgICAgc3dpdGNoIChwcm9wcy50eXBlKSB7XHJcbiAgICAgICAgY2FzZSAnd2Vlayc6XHJcbiAgICAgICAgICBjZWxsVmFsdWUgPSBnZXRGb3JtYXREYXRlKGNlbGxWYWx1ZSwgcHJvcHMsICd5eXl5d1dXJylcclxuICAgICAgICAgIGJyZWFrXHJcbiAgICAgICAgY2FzZSAnbW9udGgnOlxyXG4gICAgICAgICAgY2VsbFZhbHVlID0gZ2V0Rm9ybWF0RGF0ZShjZWxsVmFsdWUsIHByb3BzLCAneXl5eS1NTScpXHJcbiAgICAgICAgICBicmVha1xyXG4gICAgICAgIGNhc2UgJ3llYXInOlxyXG4gICAgICAgICAgY2VsbFZhbHVlID0gZ2V0Rm9ybWF0RGF0ZShjZWxsVmFsdWUsIHByb3BzLCAneXl5eScpXHJcbiAgICAgICAgICBicmVha1xyXG4gICAgICAgIGNhc2UgJ2RhdGVzJzpcclxuICAgICAgICAgIGNlbGxWYWx1ZSA9IGdldEZvcm1hdERhdGVzKGNlbGxWYWx1ZSwgcHJvcHMsICcsICcsICd5eXl5LU1NLWRkJylcclxuICAgICAgICAgIGJyZWFrXHJcbiAgICAgICAgY2FzZSAnZGF0ZXJhbmdlJzpcclxuICAgICAgICAgIGNlbGxWYWx1ZSA9IGdldEZvcm1hdERhdGVzKGNlbGxWYWx1ZSwgcHJvcHMsIGAgJHtzZXBhcmF0b3IgfHwgJy0nfSBgLCAneXl5eS1NTS1kZCcpXHJcbiAgICAgICAgICBicmVha1xyXG4gICAgICAgIGNhc2UgJ2RhdGV0aW1lcmFuZ2UnOlxyXG4gICAgICAgICAgY2VsbFZhbHVlID0gZ2V0Rm9ybWF0RGF0ZXMoY2VsbFZhbHVlLCBwcm9wcywgYCAke3NlcGFyYXRvciB8fCAnLSd9IGAsICd5eXl5LU1NLWRkIEhIOnNzOm1tJylcclxuICAgICAgICAgIGJyZWFrXHJcbiAgICAgICAgZGVmYXVsdDpcclxuICAgICAgICAgIGNlbGxWYWx1ZSA9IGdldEZvcm1hdERhdGUoY2VsbFZhbHVlLCBwcm9wcywgJ3l5eXktTU0tZGQnKVxyXG4gICAgICAgICAgYnJlYWtcclxuICAgICAgfVxyXG4gICAgICByZXR1cm4gY2VsbFRleHQoaCwgY2VsbFZhbHVlKVxyXG4gICAgfSxcclxuICAgIHJlbmRlckZpbHRlcihoOiBGdW5jdGlvbiwgcmVuZGVyT3B0czogYW55LCBwYXJhbXM6IGFueSwgY29udGV4dDogYW55KSB7XHJcbiAgICAgIGxldCB7IGNvbHVtbiB9ID0gcGFyYW1zXHJcbiAgICAgIGxldCB7IGF0dHJzLCBldmVudHMgfSA9IHJlbmRlck9wdHNcclxuICAgICAgbGV0IHByb3BzID0gZ2V0UHJvcHMocGFyYW1zLCByZW5kZXJPcHRzLCB7IHRyYW5zZmVyOiB0cnVlIH0pXHJcbiAgICAgIGxldCB0eXBlID0gJ29uLWNoYW5nZSdcclxuICAgICAgcmV0dXJuIGNvbHVtbi5maWx0ZXJzLm1hcCgoaXRlbTogYW55KSA9PiB7XHJcbiAgICAgICAgcmV0dXJuIGgocmVuZGVyT3B0cy5uYW1lLCB7XHJcbiAgICAgICAgICBwcm9wcyxcclxuICAgICAgICAgIGF0dHJzLFxyXG4gICAgICAgICAgbW9kZWw6IHtcclxuICAgICAgICAgICAgdmFsdWU6IGl0ZW0uZGF0YSxcclxuICAgICAgICAgICAgY2FsbGJhY2sob3B0aW9uVmFsdWU6IGFueSkge1xyXG4gICAgICAgICAgICAgIGl0ZW0uZGF0YSA9IG9wdGlvblZhbHVlXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgIH0sXHJcbiAgICAgICAgICBvbjogZ2V0RmlsdGVyRXZlbnRzKHtcclxuICAgICAgICAgICAgW3R5cGVdKHZhbHVlOiBhbnkpIHtcclxuICAgICAgICAgICAgICBoYW5kbGVDb25maXJtRmlsdGVyKGNvbnRleHQsIGNvbHVtbiwgISF2YWx1ZSwgaXRlbSlcclxuICAgICAgICAgICAgICBpZiAoZXZlbnRzICYmIGV2ZW50c1t0eXBlXSkge1xyXG4gICAgICAgICAgICAgICAgZXZlbnRzW3R5cGVdKE9iamVjdC5hc3NpZ24oeyBjb250ZXh0IH0sIHBhcmFtcyksIHZhbHVlKVxyXG4gICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgfSwgcmVuZGVyT3B0cywgcGFyYW1zLCBjb250ZXh0KVxyXG4gICAgICAgIH0pXHJcbiAgICAgIH0pXHJcbiAgICB9LFxyXG4gICAgZmlsdGVyTWV0aG9kKHsgb3B0aW9uLCByb3csIGNvbHVtbiB9OiBhbnkpIHtcclxuICAgICAgbGV0IHsgZGF0YSB9ID0gb3B0aW9uXHJcbiAgICAgIGxldCB7IGZpbHRlclJlbmRlcjogcmVuZGVyT3B0cyB9ID0gY29sdW1uXHJcbiAgICAgIGxldCB7IHByb3BzID0ge30gfSA9IHJlbmRlck9wdHNcclxuICAgICAgbGV0IGNlbGxWYWx1ZSA9IFhFVXRpbHMuZ2V0KHJvdywgY29sdW1uLnByb3BlcnR5KVxyXG4gICAgICBpZiAoZGF0YSkge1xyXG4gICAgICAgIHN3aXRjaCAocHJvcHMudHlwZSkge1xyXG4gICAgICAgICAgY2FzZSAnZGF0ZXJhbmdlJzpcclxuICAgICAgICAgICAgcmV0dXJuIGVxdWFsRGF0ZXJhbmdlKGNlbGxWYWx1ZSwgZGF0YSwgcHJvcHMsICd5eXl5LU1NLWRkJylcclxuICAgICAgICAgIGNhc2UgJ2RhdGV0aW1lcmFuZ2UnOlxyXG4gICAgICAgICAgICByZXR1cm4gZXF1YWxEYXRlcmFuZ2UoY2VsbFZhbHVlLCBkYXRhLCBwcm9wcywgJ3l5eXktTU0tZGQgSEg6c3M6bW0nKVxyXG4gICAgICAgICAgZGVmYXVsdDpcclxuICAgICAgICAgICAgcmV0dXJuIGNlbGxWYWx1ZSA9PT0gZGF0YVxyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgICByZXR1cm4gZmFsc2VcclxuICAgIH1cclxuICB9LFxyXG4gIFRpbWVQaWNrZXI6IHtcclxuICAgIHJlbmRlckVkaXQ6IGNyZWF0ZUVkaXRSZW5kZXIoeyB0cmFuc2ZlcjogdHJ1ZSB9KVxyXG4gIH0sXHJcbiAgUmF0ZToge1xyXG4gICAgcmVuZGVyRGVmYXVsdDogY3JlYXRlRWRpdFJlbmRlcigpLFxyXG4gICAgcmVuZGVyRWRpdDogY3JlYXRlRWRpdFJlbmRlcigpLFxyXG4gICAgcmVuZGVyRmlsdGVyOiBjcmVhdGVGaWx0ZXJSZW5kZXIoKSxcclxuICAgIGZpbHRlck1ldGhvZDogZGVmYXVsdEZpbHRlck1ldGhvZFxyXG4gIH0sXHJcbiAgaVN3aXRjaDoge1xyXG4gICAgcmVuZGVyRGVmYXVsdDogY3JlYXRlRWRpdFJlbmRlcigpLFxyXG4gICAgcmVuZGVyRWRpdDogY3JlYXRlRWRpdFJlbmRlcigpLFxyXG4gICAgcmVuZGVyRmlsdGVyOiBjcmVhdGVGaWx0ZXJSZW5kZXIoKSxcclxuICAgIGZpbHRlck1ldGhvZDogZGVmYXVsdEZpbHRlck1ldGhvZFxyXG4gIH1cclxufVxyXG5cclxuLyoqXHJcbiAqIOS6i+S7tuWFvOWuueaAp+WkhOeQhlxyXG4gKi9cclxuZnVuY3Rpb24gaGFuZGxlQ2xlYXJFdmVudChwYXJhbXM6IGFueSwgZXZudDogYW55LCBjb250ZXh0OiBhbnkpIHtcclxuICBsZXQgeyBnZXRFdmVudFRhcmdldE5vZGUgfSA9IGNvbnRleHRcclxuICBsZXQgYm9keUVsZW0gPSBkb2N1bWVudC5ib2R5XHJcbiAgaWYgKFxyXG4gICAgLy8g5LiL5ouJ5qGG44CB5pel5pyfXHJcbiAgICBnZXRFdmVudFRhcmdldE5vZGUoZXZudCwgYm9keUVsZW0sICdpdnUtc2VsZWN0LWRyb3Bkb3duJykuZmxhZ1xyXG4gICkge1xyXG4gICAgcmV0dXJuIGZhbHNlXHJcbiAgfVxyXG59XHJcblxyXG4vKipcclxuICog5Z+65LqOIHZ4ZS10YWJsZSDooajmoLznmoTpgILphY3mj5Lku7bvvIznlKjkuo7lhbzlrrkgaXZpZXcg57uE5Lu25bqTXHJcbiAqL1xyXG5leHBvcnQgY29uc3QgVlhFVGFibGVQbHVnaW5JVmlldyA9IHtcclxuICBpbnN0YWxsKHh0YWJsZTogdHlwZW9mIFZYRVRhYmxlKSB7XHJcbiAgICBsZXQgeyBpbnRlcmNlcHRvciwgcmVuZGVyZXIgfSA9IHh0YWJsZVxyXG4gICAgcmVuZGVyZXIubWl4aW4ocmVuZGVyTWFwKVxyXG4gICAgaW50ZXJjZXB0b3IuYWRkKCdldmVudC5jbGVhckZpbHRlcicsIGhhbmRsZUNsZWFyRXZlbnQpXHJcbiAgICBpbnRlcmNlcHRvci5hZGQoJ2V2ZW50LmNsZWFyQWN0aXZlZCcsIGhhbmRsZUNsZWFyRXZlbnQpXHJcbiAgfVxyXG59XHJcblxyXG5pZiAodHlwZW9mIHdpbmRvdyAhPT0gJ3VuZGVmaW5lZCcgJiYgd2luZG93LlZYRVRhYmxlKSB7XHJcbiAgd2luZG93LlZYRVRhYmxlLnVzZShWWEVUYWJsZVBsdWdpbklWaWV3KVxyXG59XHJcblxyXG5leHBvcnQgZGVmYXVsdCBWWEVUYWJsZVBsdWdpbklWaWV3XHJcbiJdfQ==
