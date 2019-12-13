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

      if (props.filterable) {
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
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImluZGV4LnRzIl0sIm5hbWVzIjpbImdldEZvcm1hdERhdGUiLCJ2YWx1ZSIsInByb3BzIiwiZGVmYXVsdEZvcm1hdCIsIlhFVXRpbHMiLCJ0b0RhdGVTdHJpbmciLCJmb3JtYXQiLCJnZXRGb3JtYXREYXRlcyIsInZhbHVlcyIsInNlcGFyYXRvciIsIm1hcCIsImRhdGUiLCJqb2luIiwiZXF1YWxEYXRlcmFuZ2UiLCJjZWxsVmFsdWUiLCJkYXRhIiwibWF0Y2hDYXNjYWRlckRhdGEiLCJpbmRleCIsImxpc3QiLCJsYWJlbHMiLCJ2YWwiLCJsZW5ndGgiLCJlYWNoIiwiaXRlbSIsInB1c2giLCJsYWJlbCIsImNoaWxkcmVuIiwiZ2V0UHJvcHMiLCJkZWZhdWx0UHJvcHMiLCIkdGFibGUiLCJhc3NpZ24iLCJ2U2l6ZSIsInNpemUiLCJnZXRDZWxsRXZlbnRzIiwicmVuZGVyT3B0cyIsInBhcmFtcyIsImV2ZW50cyIsInR5cGUiLCJvbiIsInVwZGF0ZVN0YXR1cyIsIm9iamVjdE1hcCIsImNiIiwiYXJncyIsImFwcGx5IiwiY29uY2F0IiwiY3JlYXRlRWRpdFJlbmRlciIsImgiLCJyb3ciLCJjb2x1bW4iLCJhdHRycyIsIm5hbWUiLCJtb2RlbCIsImdldCIsInByb3BlcnR5IiwiY2FsbGJhY2siLCJzZXQiLCJnZXRGaWx0ZXJFdmVudHMiLCJjb250ZXh0IiwiT2JqZWN0IiwiY3JlYXRlRmlsdGVyUmVuZGVyIiwiZmlsdGVycyIsIm9wdGlvblZhbHVlIiwiZXZudCIsImhhbmRsZUNvbmZpcm1GaWx0ZXIiLCJjaGVja2VkIiwiZmlsdGVyTXVsdGlwbGUiLCJkZWZhdWx0RmlsdGVyTWV0aG9kIiwib3B0aW9uIiwicmVuZGVyT3B0aW9ucyIsIm9wdGlvbnMiLCJvcHRpb25Qcm9wcyIsImxhYmVsUHJvcCIsInZhbHVlUHJvcCIsImRpc2FibGVkUHJvcCIsImRpc2FibGVkIiwia2V5IiwiY2VsbFRleHQiLCJyZW5kZXJNYXAiLCJJbnB1dCIsImF1dG9mb2N1cyIsInJlbmRlckRlZmF1bHQiLCJyZW5kZXJFZGl0IiwicmVuZGVyRmlsdGVyIiwiZmlsdGVyTWV0aG9kIiwiQXV0b0NvbXBsZXRlIiwiSW5wdXROdW1iZXIiLCJTZWxlY3QiLCJvcHRpb25Hcm91cHMiLCJvcHRpb25Hcm91cFByb3BzIiwidHJhbnNmZXIiLCJncm91cE9wdGlvbnMiLCJncm91cExhYmVsIiwiZ3JvdXAiLCJnSW5kZXgiLCJyZW5kZXJDZWxsIiwiY29saWQiLCJpZCIsInJlc3QiLCJjZWxsRGF0YSIsImZpbHRlcmFibGUiLCJmdWxsQWxsRGF0YVJvd01hcCIsImNhY2hlQ2VsbCIsImhhcyIsInVuZGVmaW5lZCIsIm11bHRpcGxlIiwic2VsZWN0SXRlbSIsImZpbmQiLCJjZWxsTGFiZWwiLCJmaWx0ZXJSZW5kZXIiLCJpc0FycmF5IiwiaW5jbHVkZUFycmF5cyIsImluZGV4T2YiLCJDYXNjYWRlciIsIkRhdGVQaWNrZXIiLCJUaW1lUGlja2VyIiwiUmF0ZSIsImlTd2l0Y2giLCJoYW5kbGVDbGVhckV2ZW50IiwiZ2V0RXZlbnRUYXJnZXROb2RlIiwiYm9keUVsZW0iLCJkb2N1bWVudCIsImJvZHkiLCJmbGFnIiwiVlhFVGFibGVQbHVnaW5JVmlldyIsImluc3RhbGwiLCJ4dGFibGUiLCJpbnRlcmNlcHRvciIsInJlbmRlcmVyIiwibWl4aW4iLCJhZGQiLCJ3aW5kb3ciLCJWWEVUYWJsZSIsInVzZSJdLCJtYXBwaW5ncyI6Ijs7Ozs7OztBQUFBOzs7Ozs7QUFHQSxTQUFTQSxhQUFULENBQXVCQyxLQUF2QixFQUFtQ0MsS0FBbkMsRUFBK0NDLGFBQS9DLEVBQW9FO0FBQ2xFLFNBQU9DLG9CQUFRQyxZQUFSLENBQXFCSixLQUFyQixFQUE0QkMsS0FBSyxDQUFDSSxNQUFOLElBQWdCSCxhQUE1QyxDQUFQO0FBQ0Q7O0FBRUQsU0FBU0ksY0FBVCxDQUF3QkMsTUFBeEIsRUFBcUNOLEtBQXJDLEVBQWlETyxTQUFqRCxFQUFvRU4sYUFBcEUsRUFBeUY7QUFDdkYsU0FBT0Msb0JBQVFNLEdBQVIsQ0FBWUYs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QUFDQSxXQUFPLEtBQVA7QUFDRDtBQUNGO0FBRUQ7Ozs7O0FBR08sSUFBTUMsbUJBQW1CLEdBQUc7QUFDakNDLEVBQUFBLE9BRGlDLG1CQUN6QkMsTUFEeUIsRUFDRjtBQUFBLFFBQ3ZCQyxXQUR1QixHQUNHRCxNQURILENBQ3ZCQyxXQUR1QjtBQUFBLFFBQ1ZDLFFBRFUsR0FDR0YsTUFESCxDQUNWRSxRQURVO0FBRTdCQSxJQUFBQSxRQUFRLENBQUNDLEtBQVQsQ0FBZW5ELFNBQWY7QUFDQWlELElBQUFBLFdBQVcsQ0FBQ0csR0FBWixDQUFnQixtQkFBaEIsRUFBcUNaLGdCQUFyQztBQUNBUyxJQUFBQSxXQUFXLENBQUNHLEdBQVosQ0FBZ0Isb0JBQWhCLEVBQXNDWixnQkFBdEM7QUFDRDtBQU5nQyxDQUE1Qjs7O0FBU1AsSUFBSSxPQUFPYSxNQUFQLEtBQWtCLFdBQWxCLElBQWlDQSxNQUFNLENBQUNDLFFBQTVDLEVBQXNEO0FBQ3BERCxFQUFBQSxNQUFNLENBQUNDLFFBQVAsQ0FBZ0JDLEdBQWhCLENBQW9CVCxtQkFBcEI7QUFDRDs7ZUFFY0EsbUIiLCJmaWxlIjoiaW5kZXguY29tbW9uLmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IFhFVXRpbHMgZnJvbSAneGUtdXRpbHMvbWV0aG9kcy94ZS11dGlscydcclxuaW1wb3J0IFZYRVRhYmxlIGZyb20gJ3Z4ZS10YWJsZS9saWIvdnhlLXRhYmxlJ1xyXG5cclxuZnVuY3Rpb24gZ2V0Rm9ybWF0RGF0ZSh2YWx1ZTogYW55LCBwcm9wczogYW55LCBkZWZhdWx0Rm9ybWF0OiBzdHJpbmcpIHtcclxuICByZXR1cm4gWEVVdGlscy50b0RhdGVTdHJpbmcodmFsdWUsIHByb3BzLmZvcm1hdCB8fCBkZWZhdWx0Rm9ybWF0KVxyXG59XHJcblxyXG5mdW5jdGlvbiBnZXRGb3JtYXREYXRlcyh2YWx1ZXM6IGFueSwgcHJvcHM6IGFueSwgc2VwYXJhdG9yOiBzdHJpbmcsIGRlZmF1bHRGb3JtYXQ6IHN0cmluZykge1xyXG4gIHJldHVybiBYRVV0aWxzLm1hcCh2YWx1ZXMsIChkYXRlOiBhbnkpID0+IGdldEZvcm1hdERhdGUoZGF0ZSwgcHJvcHMsIGRlZmF1bHRGb3JtYXQpKS5qb2luKHNlcGFyYXRvcilcclxufVxyXG5cclxuZnVuY3Rpb24gZXF1YWxEYXRlcmFuZ2UoY2VsbFZhbHVlOiBhbnksIGRhdGE6IGFueSwgcHJvcHM6IGFueSwgZGVmYXVsdEZvcm1hdDogc3RyaW5nKSB7XHJcbiAgY2VsbFZhbHVlID0gZ2V0Rm9ybWF0RGF0ZShjZWxsVmFsdWUsIHByb3BzLCBkZWZhdWx0Rm9ybWF0KVxyXG4gIHJldHVybiBjZWxsVmFsdWUgPj0gZ2V0Rm9ybWF0RGF0ZShkYXRhWzBdLCBwcm9wcywgZGVmYXVsdEZvcm1hdCkgJiYgY2VsbFZhbHVlIDw9IGdldEZvcm1hdERhdGUoZGF0YVsxXSwgcHJvcHMsIGRlZmF1bHRGb3JtYXQpXHJcbn1cclxuXHJcbmZ1bmN0aW9uIG1hdGNoQ2FzY2FkZXJEYXRhKGluZGV4OiBudW1iZXIsIGxpc3Q6IEFycmF5PGFueT4sIHZhbHVlczogQXJyYXk8YW55PiwgbGFiZWxzOiBBcnJheTxhbnk+KSB7XHJcbiAgbGV0IHZhbCA9IHZhbHVlc1tpbmRleF1cclxuICBpZiAobGlzdCAmJiB2YWx1ZXMubGVuZ3RoID4gaW5kZXgpIHtcclxuICAgIFhFVXRpbHMuZWFjaChsaXN0LCAoaXRlbTogYW55KSA9PiB7XHJcbiAgICAgIGlmIChpdGVtLnZhbHVlID09PSB2YWwpIHtcclxuICAgICAgICBsYWJlbHMucHVzaChpdGVtLmxhYmVsKVxyXG4gICAgICAgIG1hdGNoQ2FzY2FkZXJEYXRhKCsraW5kZXgsIGl0ZW0uY2hpbGRyZW4sIHZhbHVlcywgbGFiZWxzKVxyXG4gICAgICB9XHJcbiAgICB9KVxyXG4gIH1cclxufVxyXG5cclxuZnVuY3Rpb24gZ2V0UHJvcHMoeyAkdGFibGUgfTogYW55LCB7IHByb3BzIH06IGFueSwgZGVmYXVsdFByb3BzPzogYW55KSB7XHJcbiAgcmV0dXJuIFhFVXRpbHMuYXNzaWduKCR0YWJsZS52U2l6ZSA/IHsgc2l6ZTogJHRhYmxlLnZTaXplIH0gOiB7fSwgZGVmYXVsdFByb3BzLCBwcm9wcylcclxufVxyXG5cclxuZnVuY3Rpb24gZ2V0Q2VsbEV2ZW50cyhyZW5kZXJPcHRzOiBhbnksIHBhcmFtczogYW55KSB7XHJcbiAgbGV0IHsgZXZlbnRzIH0gPSByZW5kZXJPcHRzXHJcbiAgbGV0IHsgJHRhYmxlIH0gPSBwYXJhbXNcclxuICBsZXQgdHlwZSA9ICdvbi1jaGFuZ2UnXHJcbiAgbGV0IG9uID0ge1xyXG4gICAgW3R5cGVdOiAoKSA9PiAkdGFibGUudXBkYXRlU3RhdHVzKHBhcmFtcylcclxuICB9XHJcbiAgaWYgKGV2ZW50cykge1xyXG4gICAgcmV0dXJuIFhFVXRpbHMuYXNzaWduKHt9LCBYRVV0aWxzLm9iamVjdE1hcChldmVudHMsIChjYjogRnVuY3Rpb24pID0+IGZ1bmN0aW9uICguLi5hcmdzOiBhbnlbXSkge1xyXG4gICAgICBjYi5hcHBseShudWxsLCBbcGFyYW1zXS5jb25jYXQuYXBwbHkocGFyYW1zLCBhcmdzKSlcclxuICAgIH0pLCBvbilcclxuICB9XHJcbiAgcmV0dXJuIG9uXHJcbn1cclxuXHJcbmZ1bmN0aW9uIGNyZWF0ZUVkaXRSZW5kZXIoZGVmYXVsdFByb3BzPzogYW55KSB7XHJcbiAgcmV0dXJuIGZ1bmN0aW9uIChoOiBGdW5jdGlvbiwgcmVuZGVyT3B0czogYW55LCBwYXJhbXM6IGFueSkge1xyXG4gICAgbGV0IHsgcm93LCBjb2x1bW4gfSA9IHBhcmFtc1xyXG4gICAgbGV0IHsgYXR0cnMgfSA9IHJlbmRlck9wdHNcclxuICAgIGxldCBwcm9wcyA9IGdldFByb3BzKHBhcmFtcywgcmVuZGVyT3B0cywgZGVmYXVsdFByb3BzKVxyXG4gICAgcmV0dXJuIFtcclxuICAgICAgaChyZW5kZXJPcHRzLm5hbWUsIHtcclxuICAgICAgICBwcm9wcyxcclxuICAgICAgICBhdHRycyxcclxuICAgICAgICBtb2RlbDoge1xyXG4gICAgICAgICAgdmFsdWU6IFhFVXRpbHMuZ2V0KHJvdywgY29sdW1uLnByb3BlcnR5KSxcclxuICAgICAgICAgIGNhbGxiYWNrKHZhbHVlOiBhbnkpIHtcclxuICAgICAgICAgICAgWEVVdGlscy5zZXQocm93LCBjb2x1bW4ucHJvcGVydHksIHZhbHVlKVxyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgb246IGdldENlbGxFdmVudHMocmVuZGVyT3B0cywgcGFyYW1zKVxyXG4gICAgICB9KVxyXG4gICAgXVxyXG4gIH1cclxufVxyXG5cclxuZnVuY3Rpb24gZ2V0RmlsdGVyRXZlbnRzKG9uOiBhbnksIHJlbmRlck9wdHM6IGFueSwgcGFyYW1zOiBhbnksIGNvbnRleHQ6IGFueSkge1xyXG4gIGxldCB7IGV2ZW50cyB9ID0gcmVuZGVyT3B0c1xyXG4gIGlmIChldmVudHMpIHtcclxuICAgIHJldHVybiBYRVV0aWxzLmFzc2lnbih7fSwgWEVVdGlscy5vYmplY3RNYXAoZXZlbnRzLCAoY2I6IEZ1bmN0aW9uKSA9PiBmdW5jdGlvbiAoLi4uYXJnczogYW55W10pIHtcclxuICAgICAgcGFyYW1zID0gT2JqZWN0LmFzc2lnbih7IGNvbnRleHQgfSwgcGFyYW1zKVxyXG4gICAgICBjYi5hcHBseShudWxsLCBbcGFyYW1zXS5jb25jYXQuYXBwbHkocGFyYW1zLCBhcmdzKSlcclxuICAgIH0pLCBvbilcclxuICB9XHJcbiAgcmV0dXJuIG9uXHJcbn1cclxuXHJcbmZ1bmN0aW9uIGNyZWF0ZUZpbHRlclJlbmRlcihkZWZhdWx0UHJvcHM/OiBhbnkpIHtcclxuICByZXR1cm4gZnVuY3Rpb24gKGg6IEZ1bmN0aW9uLCByZW5kZXJPcHRzOiBhbnksIHBhcmFtczogYW55LCBjb250ZXh0OiBhbnkpIHtcclxuICAgIGxldCB7IGNvbHVtbiB9ID0gcGFyYW1zXHJcbiAgICBsZXQgeyBuYW1lLCBhdHRycywgZXZlbnRzIH0gPSByZW5kZXJPcHRzXHJcbiAgICBsZXQgdHlwZSA9ICdvbi1jaGFuZ2UnXHJcbiAgICBsZXQgcHJvcHMgPSBnZXRQcm9wcyhwYXJhbXMsIHJlbmRlck9wdHMpXHJcbiAgICByZXR1cm4gY29sdW1uLmZpbHRlcnMubWFwKChpdGVtOiBhbnkpID0+IHtcclxuICAgICAgcmV0dXJuIGgobmFtZSwge1xyXG4gICAgICAgIHByb3BzLFxyXG4gICAgICAgIGF0dHJzLFxyXG4gICAgICAgIG1vZGVsOiB7XHJcbiAgICAgICAgICB2YWx1ZTogaXRlbS5kYXRhLFxyXG4gICAgICAgICAgY2FsbGJhY2sob3B0aW9uVmFsdWU6IGFueSkge1xyXG4gICAgICAgICAgICBpdGVtLmRhdGEgPSBvcHRpb25WYWx1ZVxyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgb246IGdldEZpbHRlckV2ZW50cyh7XHJcbiAgICAgICAgICBbdHlwZV0oZXZudDogYW55KSB7XHJcbiAgICAgICAgICAgIGhhbmRsZUNvbmZpcm1GaWx0ZXIoY29udGV4dCwgY29sdW1uLCAhIWl0ZW0uZGF0YSwgaXRlbSlcclxuICAgICAgICAgICAgaWYgKGV2ZW50cyAmJiBldmVudHNbdHlwZV0pIHtcclxuICAgICAgICAgICAgICBldmVudHNbdHlwZV0oT2JqZWN0LmFzc2lnbih7IGNvbnRleHQgfSwgcGFyYW1zKSwgZXZudClcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH0sIHJlbmRlck9wdHMsIHBhcmFtcywgY29udGV4dClcclxuICAgICAgfSlcclxuICAgIH0pXHJcbiAgfVxyXG59XHJcblxyXG5mdW5jdGlvbiBoYW5kbGVDb25maXJtRmlsdGVyKGNvbnRleHQ6IGFueSwgY29sdW1uOiBhbnksIGNoZWNrZWQ6IGFueSwgaXRlbTogYW55KSB7XHJcbiAgY29udGV4dFtjb2x1bW4uZmlsdGVyTXVsdGlwbGUgPyAnY2hhbmdlTXVsdGlwbGVPcHRpb24nIDogJ2NoYW5nZVJhZGlvT3B0aW9uJ10oe30sIGNoZWNrZWQsIGl0ZW0pXHJcbn1cclxuXHJcbmZ1bmN0aW9uIGRlZmF1bHRGaWx0ZXJNZXRob2QoeyBvcHRpb24sIHJvdywgY29sdW1uIH06IGFueSkge1xyXG4gIGxldCB7IGRhdGEgfSA9IG9wdGlvblxyXG4gIGxldCBjZWxsVmFsdWUgPSBYRVV0aWxzLmdldChyb3csIGNvbHVtbi5wcm9wZXJ0eSlcclxuICAvKiBlc2xpbnQtZGlzYWJsZSBlcWVxZXEgKi9cclxuICByZXR1cm4gY2VsbFZhbHVlID09PSBkYXRhXHJcbn1cclxuXHJcbmZ1bmN0aW9uIHJlbmRlck9wdGlvbnMoaDogRnVuY3Rpb24sIG9wdGlvbnM6IGFueSwgb3B0aW9uUHJvcHM6IGFueSkge1xyXG4gIGxldCBsYWJlbFByb3AgPSBvcHRpb25Qcm9wcy5sYWJlbCB8fCAnbGFiZWwnXHJcbiAgbGV0IHZhbHVlUHJvcCA9IG9wdGlvblByb3BzLnZhbHVlIHx8ICd2YWx1ZSdcclxuICBsZXQgZGlzYWJsZWRQcm9wID0gb3B0aW9uUHJvcHMuZGlzYWJsZWQgfHwgJ2Rpc2FibGVkJ1xyXG4gIHJldHVybiBYRVV0aWxzLm1hcChvcHRpb25zLCAoaXRlbTogYW55LCBpbmRleDogbnVtYmVyKSA9PiB7XHJcbiAgICByZXR1cm4gaCgnT3B0aW9uJywge1xyXG4gICAgICBwcm9wczoge1xyXG4gICAgICAgIHZhbHVlOiBpdGVtW3ZhbHVlUHJvcF0sXHJcbiAgICAgICAgbGFiZWw6IGl0ZW1bbGFiZWxQcm9wXSxcclxuICAgICAgICBkaXNhYmxlZDogaXRlbVtkaXNhYmxlZFByb3BdXHJcbiAgICAgIH0sXHJcbiAgICAgIGtleTogaW5kZXhcclxuICAgIH0pXHJcbiAgfSlcclxufVxyXG5cclxuZnVuY3Rpb24gY2VsbFRleHQoaDogRnVuY3Rpb24sIGNlbGxWYWx1ZTogYW55KSB7XHJcbiAgcmV0dXJuIFsnJyArIChjZWxsVmFsdWUgPT09IG51bGwgfHwgY2VsbFZhbHVlID09PSB2b2lkIDAgPyAnJyA6IGNlbGxWYWx1ZSldXHJcbn1cclxuXHJcbi8qKlxyXG4gKiDmuLLmn5Plh73mlbBcclxuICovXHJcbmNvbnN0IHJlbmRlck1hcCA9IHtcclxuICBJbnB1dDoge1xyXG4gICAgYXV0b2ZvY3VzOiAnaW5wdXQuaXZ1LWlucHV0JyxcclxuICAgIHJlbmRlckRlZmF1bHQ6IGNyZWF0ZUVkaXRSZW5kZXIoKSxcclxuICAgIHJlbmRlckVkaXQ6IGNyZWF0ZUVkaXRSZW5kZXIoKSxcclxuICAgIHJlbmRlckZpbHRlcjogY3JlYXRlRmlsdGVyUmVuZGVyKCksXHJcbiAgICBmaWx0ZXJNZXRob2Q6IGRlZmF1bHRGaWx0ZXJNZXRob2RcclxuICB9LFxyXG4gIEF1dG9Db21wbGV0ZToge1xyXG4gICAgYXV0b2ZvY3VzOiAnaW5wdXQuaXZ1LWlucHV0JyxcclxuICAgIHJlbmRlckRlZmF1bHQ6IGNyZWF0ZUVkaXRSZW5kZXIoKSxcclxuICAgIHJlbmRlckVkaXQ6IGNyZWF0ZUVkaXRSZW5kZXIoKSxcclxuICAgIHJlbmRlckZpbHRlcjogY3JlYXRlRmlsdGVyUmVuZGVyKCksXHJcbiAgICBmaWx0ZXJNZXRob2Q6IGRlZmF1bHRGaWx0ZXJNZXRob2RcclxuICB9LFxyXG4gIElucHV0TnVtYmVyOiB7XHJcbiAgICBhdXRvZm9jdXM6ICdpbnB1dC5pdnUtaW5wdXQtbnVtYmVyLWlucHV0JyxcclxuICAgIHJlbmRlckRlZmF1bHQ6IGNyZWF0ZUVkaXRSZW5kZXIoKSxcclxuICAgIHJlbmRlckVkaXQ6IGNyZWF0ZUVkaXRSZW5kZXIoKSxcclxuICAgIHJlbmRlckZpbHRlcjogY3JlYXRlRmlsdGVyUmVuZGVyKCksXHJcbiAgICBmaWx0ZXJNZXRob2Q6IGRlZmF1bHRGaWx0ZXJNZXRob2RcclxuICB9LFxyXG4gIFNlbGVjdDoge1xyXG4gICAgcmVuZGVyRWRpdChoOiBGdW5jdGlvbiwgcmVuZGVyT3B0czogYW55LCBwYXJhbXM6IGFueSkge1xyXG4gICAgICBsZXQgeyBvcHRpb25zLCBvcHRpb25Hcm91cHMsIG9wdGlvblByb3BzID0ge30sIG9wdGlvbkdyb3VwUHJvcHMgPSB7fSB9ID0gcmVuZGVyT3B0c1xyXG4gICAgICBsZXQgeyByb3csIGNvbHVtbiB9ID0gcGFyYW1zXHJcbiAgICAgIGxldCB7IGF0dHJzIH0gPSByZW5kZXJPcHRzXHJcbiAgICAgIGxldCBwcm9wcyA9IGdldFByb3BzKHBhcmFtcywgcmVuZGVyT3B0cywgeyB0cmFuc2ZlcjogdHJ1ZSB9KVxyXG4gICAgICBpZiAob3B0aW9uR3JvdXBzKSB7XHJcbiAgICAgICAgbGV0IGdyb3VwT3B0aW9ucyA9IG9wdGlvbkdyb3VwUHJvcHMub3B0aW9ucyB8fCAnb3B0aW9ucydcclxuICAgICAgICBsZXQgZ3JvdXBMYWJlbCA9IG9wdGlvbkdyb3VwUHJvcHMubGFiZWwgfHwgJ2xhYmVsJ1xyXG4gICAgICAgIHJldHVybiBbXHJcbiAgICAgICAgICBoKCdTZWxlY3QnLCB7XHJcbiAgICAgICAgICAgIHByb3BzLFxyXG4gICAgICAgICAgICBhdHRycyxcclxuICAgICAgICAgICAgbW9kZWw6IHtcclxuICAgICAgICAgICAgICB2YWx1ZTogWEVVdGlscy5nZXQocm93LCBjb2x1bW4ucHJvcGVydHkpLFxyXG4gICAgICAgICAgICAgIGNhbGxiYWNrKGNlbGxWYWx1ZTogYW55KSB7XHJcbiAgICAgICAgICAgICAgICBYRVV0aWxzLnNldChyb3csIGNvbHVtbi5wcm9wZXJ0eSwgY2VsbFZhbHVlKVxyXG4gICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgb246IGdldENlbGxFdmVudHMocmVuZGVyT3B0cywgcGFyYW1zKVxyXG4gICAgICAgICAgfSwgWEVVdGlscy5tYXAob3B0aW9uR3JvdXBzLCAoZ3JvdXA6IGFueSwgZ0luZGV4OiBudW1iZXIpID0+IHtcclxuICAgICAgICAgICAgcmV0dXJuIGgoJ09wdGlvbkdyb3VwJywge1xyXG4gICAgICAgICAgICAgIHByb3BzOiB7XHJcbiAgICAgICAgICAgICAgICBsYWJlbDogZ3JvdXBbZ3JvdXBMYWJlbF1cclxuICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgIGtleTogZ0luZGV4XHJcbiAgICAgICAgICAgIH0sIHJlbmRlck9wdGlvbnMoaCwgZ3JvdXBbZ3JvdXBPcHRpb25zXSwgb3B0aW9uUHJvcHMpKVxyXG4gICAgICAgICAgfSkpXHJcbiAgICAgICAgXVxyXG4gICAgICB9XHJcbiAgICAgIHJldHVybiBbXHJcbiAgICAgICAgaCgnU2VsZWN0Jywge1xyXG4gICAgICAgICAgcHJvcHMsXHJcbiAgICAgICAgICBhdHRycyxcclxuICAgICAgICAgIG1vZGVsOiB7XHJcbiAgICAgICAgICAgIHZhbHVlOiBYRVV0aWxzLmdldChyb3csIGNvbHVtbi5wcm9wZXJ0eSksXHJcbiAgICAgICAgICAgIGNhbGxiYWNrKGNlbGxWYWx1ZTogYW55KSB7XHJcbiAgICAgICAgICAgICAgWEVVdGlscy5zZXQocm93LCBjb2x1bW4ucHJvcGVydHksIGNlbGxWYWx1ZSlcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgfSxcclxuICAgICAgICAgIG9uOiBnZXRDZWxsRXZlbnRzKHJlbmRlck9wdHMsIHBhcmFtcylcclxuICAgICAgICB9LCByZW5kZXJPcHRpb25zKGgsIG9wdGlvbnMsIG9wdGlvblByb3BzKSlcclxuICAgICAgXVxyXG4gICAgfSxcclxuICAgIHJlbmRlckNlbGwoaDogRnVuY3Rpb24sIHJlbmRlck9wdHM6IGFueSwgcGFyYW1zOiBhbnkpIHtcclxuICAgICAgbGV0IHsgb3B0aW9ucywgb3B0aW9uR3JvdXBzLCBwcm9wcyA9IHt9LCBvcHRpb25Qcm9wcyA9IHt9LCBvcHRpb25Hcm91cFByb3BzID0ge30gfSA9IHJlbmRlck9wdHNcclxuICAgICAgbGV0IHsgJHRhYmxlLCByb3csIGNvbHVtbiB9ID0gcGFyYW1zXHJcbiAgICAgIGxldCBsYWJlbFByb3AgPSBvcHRpb25Qcm9wcy5sYWJlbCB8fCAnbGFiZWwnXHJcbiAgICAgIGxldCB2YWx1ZVByb3AgPSBvcHRpb25Qcm9wcy52YWx1ZSB8fCAndmFsdWUnXHJcbiAgICAgIGxldCBncm91cE9wdGlvbnMgPSBvcHRpb25Hcm91cFByb3BzLm9wdGlvbnMgfHwgJ29wdGlvbnMnXHJcbiAgICAgIGxldCBjZWxsVmFsdWUgPSBYRVV0aWxzLmdldChyb3csIGNvbHVtbi5wcm9wZXJ0eSlcclxuICAgICAgbGV0IGNvbGlkOiBzdHJpbmcgPSBjb2x1bW4uaWRcclxuICAgICAgbGV0IHJlc3Q6IGFueVxyXG4gICAgICBsZXQgY2VsbERhdGE6IGFueVxyXG4gICAgICBpZiAocHJvcHMuZmlsdGVyYWJsZSkge1xyXG4gICAgICAgIGxldCBmdWxsQWxsRGF0YVJvd01hcDogTWFwPGFueSwgYW55PiA9ICR0YWJsZS5mdWxsQWxsRGF0YVJvd01hcFxyXG4gICAgICAgIGxldCBjYWNoZUNlbGw6IGFueSA9IGZ1bGxBbGxEYXRhUm93TWFwLmhhcyhyb3cpXHJcbiAgICAgICAgaWYgKGNhY2hlQ2VsbCkge1xyXG4gICAgICAgICAgcmVzdCA9IGZ1bGxBbGxEYXRhUm93TWFwLmdldChyb3cpXHJcbiAgICAgICAgICBjZWxsRGF0YSA9IHJlc3QuY2VsbERhdGFcclxuICAgICAgICAgIGlmICghY2VsbERhdGEpIHtcclxuICAgICAgICAgICAgY2VsbERhdGEgPSBmdWxsQWxsRGF0YVJvd01hcC5nZXQocm93KS5jZWxsRGF0YSA9IHt9XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmIChyZXN0ICYmIGNlbGxEYXRhW2NvbGlkXSAmJiBjZWxsRGF0YVtjb2xpZF0udmFsdWUgPT09IGNlbGxWYWx1ZSkge1xyXG4gICAgICAgICAgcmV0dXJuIGNlbGxEYXRhW2NvbGlkXS5sYWJlbFxyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgICBpZiAoIShjZWxsVmFsdWUgPT09IG51bGwgfHwgY2VsbFZhbHVlID09PSB1bmRlZmluZWQgfHwgY2VsbFZhbHVlID09PSAnJykpIHtcclxuICAgICAgICByZXR1cm4gY2VsbFRleHQoaCwgWEVVdGlscy5tYXAocHJvcHMubXVsdGlwbGUgPyBjZWxsVmFsdWUgOiBbY2VsbFZhbHVlXSwgb3B0aW9uR3JvdXBzID8gKHZhbHVlOiBhbnkpID0+IHtcclxuICAgICAgICAgIGxldCBzZWxlY3RJdGVtXHJcbiAgICAgICAgICBmb3IgKGxldCBpbmRleCA9IDA7IGluZGV4IDwgb3B0aW9uR3JvdXBzLmxlbmd0aDsgaW5kZXgrKykge1xyXG4gICAgICAgICAgICBzZWxlY3RJdGVtID0gWEVVdGlscy5maW5kKG9wdGlvbkdyb3Vwc1tpbmRleF1bZ3JvdXBPcHRpb25zXSwgKGl0ZW06IGFueSkgPT4gaXRlbVt2YWx1ZVByb3BdID09PSB2YWx1ZSlcclxuICAgICAgICAgICAgaWYgKHNlbGVjdEl0ZW0pIHtcclxuICAgICAgICAgICAgICBicmVha1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgICBsZXQgY2VsbExhYmVsOiBhbnkgPSBzZWxlY3RJdGVtID8gc2VsZWN0SXRlbVtsYWJlbFByb3BdIDogdmFsdWVcclxuICAgICAgICAgIGlmIChjZWxsRGF0YSAmJiBvcHRpb25zICYmIG9wdGlvbnMubGVuZ3RoKSB7XHJcbiAgICAgICAgICAgIGNlbGxEYXRhW2NvbGlkXSA9IHsgdmFsdWU6IGNlbGxWYWx1ZSwgbGFiZWw6IGNlbGxMYWJlbCB9XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgICByZXR1cm4gY2VsbExhYmVsXHJcbiAgICAgICAgfSA6ICh2YWx1ZTogYW55KSA9PiB7XHJcbiAgICAgICAgICBsZXQgc2VsZWN0SXRlbSA9IFhFVXRpbHMuZmluZChvcHRpb25zLCAoaXRlbTogYW55KSA9PiBpdGVtW3ZhbHVlUHJvcF0gPT09IHZhbHVlKVxyXG4gICAgICAgICAgbGV0IGNlbGxMYWJlbDogYW55ID0gc2VsZWN0SXRlbSA/IHNlbGVjdEl0ZW1bbGFiZWxQcm9wXSA6IHZhbHVlXHJcbiAgICAgICAgICBpZiAoY2VsbERhdGEgJiYgb3B0aW9ucyAmJiBvcHRpb25zLmxlbmd0aCkge1xyXG4gICAgICAgICAgICBjZWxsRGF0YVtjb2xpZF0gPSB7IHZhbHVlOiBjZWxsVmFsdWUsIGxhYmVsOiBjZWxsTGFiZWwgfVxyXG4gICAgICAgICAgfVxyXG4gICAgICAgICAgcmV0dXJuIGNlbGxMYWJlbFxyXG4gICAgICAgIH0pLmpvaW4oJzsnKSlcclxuICAgICAgfVxyXG4gICAgICByZXR1cm4gY2VsbFRleHQoaCwgJycpXHJcbiAgICB9LFxyXG4gICAgcmVuZGVyRmlsdGVyKGg6IEZ1bmN0aW9uLCByZW5kZXJPcHRzOiBhbnksIHBhcmFtczogYW55LCBjb250ZXh0OiBhbnkpIHtcclxuICAgICAgbGV0IHsgb3B0aW9ucywgb3B0aW9uR3JvdXBzLCBvcHRpb25Qcm9wcyA9IHt9LCBvcHRpb25Hcm91cFByb3BzID0ge30gfSA9IHJlbmRlck9wdHNcclxuICAgICAgbGV0IHsgY29sdW1uIH0gPSBwYXJhbXNcclxuICAgICAgbGV0IHsgYXR0cnMsIGV2ZW50cyB9ID0gcmVuZGVyT3B0c1xyXG4gICAgICBsZXQgcHJvcHMgPSBnZXRQcm9wcyhwYXJhbXMsIHJlbmRlck9wdHMsIHsgdHJhbnNmZXI6IHRydWUgfSlcclxuICAgICAgbGV0IHR5cGUgPSAnb24tY2hhbmdlJ1xyXG4gICAgICBpZiAob3B0aW9uR3JvdXBzKSB7XHJcbiAgICAgICAgbGV0IGdyb3VwT3B0aW9ucyA9IG9wdGlvbkdyb3VwUHJvcHMub3B0aW9ucyB8fCAnb3B0aW9ucydcclxuICAgICAgICBsZXQgZ3JvdXBMYWJlbCA9IG9wdGlvbkdyb3VwUHJvcHMubGFiZWwgfHwgJ2xhYmVsJ1xyXG4gICAgICAgIHJldHVybiBjb2x1bW4uZmlsdGVycy5tYXAoKGl0ZW06IGFueSkgPT4ge1xyXG4gICAgICAgICAgcmV0dXJuIGgoJ1NlbGVjdCcsIHtcclxuICAgICAgICAgICAgcHJvcHMsXHJcbiAgICAgICAgICAgIGF0dHJzLFxyXG4gICAgICAgICAgICBtb2RlbDoge1xyXG4gICAgICAgICAgICAgIHZhbHVlOiBpdGVtLmRhdGEsXHJcbiAgICAgICAgICAgICAgY2FsbGJhY2sob3B0aW9uVmFsdWU6IGFueSkge1xyXG4gICAgICAgICAgICAgICAgaXRlbS5kYXRhID0gb3B0aW9uVmFsdWVcclxuICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIG9uOiBnZXRGaWx0ZXJFdmVudHMoe1xyXG4gICAgICAgICAgICAgIFt0eXBlXSh2YWx1ZTogYW55KSB7XHJcbiAgICAgICAgICAgICAgICBoYW5kbGVDb25maXJtRmlsdGVyKGNvbnRleHQsIGNvbHVtbiwgdmFsdWUgJiYgdmFsdWUubGVuZ3RoID4gMCwgaXRlbSlcclxuICAgICAgICAgICAgICAgIGlmIChldmVudHMgJiYgZXZlbnRzW3R5cGVdKSB7XHJcbiAgICAgICAgICAgICAgICAgIGV2ZW50c1t0eXBlXShPYmplY3QuYXNzaWduKHsgY29udGV4dCB9LCBwYXJhbXMpLCB2YWx1ZSlcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0sIHJlbmRlck9wdHMsIHBhcmFtcywgY29udGV4dClcclxuICAgICAgICAgIH0sIFhFVXRpbHMubWFwKG9wdGlvbkdyb3VwcywgKGdyb3VwOiBhbnksIGdJbmRleDogbnVtYmVyKSA9PiB7XHJcbiAgICAgICAgICAgIHJldHVybiBoKCdPcHRpb25Hcm91cCcsIHtcclxuICAgICAgICAgICAgICBwcm9wczoge1xyXG4gICAgICAgICAgICAgICAgbGFiZWw6IGdyb3VwW2dyb3VwTGFiZWxdXHJcbiAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICBrZXk6IGdJbmRleFxyXG4gICAgICAgICAgICB9LCByZW5kZXJPcHRpb25zKGgsIGdyb3VwW2dyb3VwT3B0aW9uc10sIG9wdGlvblByb3BzKSlcclxuICAgICAgICAgIH0pKVxyXG4gICAgICAgIH0pXHJcbiAgICAgIH1cclxuICAgICAgcmV0dXJuIGNvbHVtbi5maWx0ZXJzLm1hcCgoaXRlbTogYW55KSA9PiB7XHJcbiAgICAgICAgcmV0dXJuIGgoJ1NlbGVjdCcsIHtcclxuICAgICAgICAgIHByb3BzLFxyXG4gICAgICAgICAgYXR0cnMsXHJcbiAgICAgICAgICBtb2RlbDoge1xyXG4gICAgICAgICAgICB2YWx1ZTogaXRlbS5kYXRhLFxyXG4gICAgICAgICAgICBjYWxsYmFjayhvcHRpb25WYWx1ZTogYW55KSB7XHJcbiAgICAgICAgICAgICAgaXRlbS5kYXRhID0gb3B0aW9uVmFsdWVcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgfSxcclxuICAgICAgICAgIG9uOiBnZXRGaWx0ZXJFdmVudHMoe1xyXG4gICAgICAgICAgICBbdHlwZV0odmFsdWU6IGFueSkge1xyXG4gICAgICAgICAgICAgIGhhbmRsZUNvbmZpcm1GaWx0ZXIoY29udGV4dCwgY29sdW1uLCB2YWx1ZSAmJiB2YWx1ZS5sZW5ndGggPiAwLCBpdGVtKVxyXG4gICAgICAgICAgICAgIGlmIChldmVudHMgJiYgZXZlbnRzW3R5cGVdKSB7XHJcbiAgICAgICAgICAgICAgICBldmVudHNbdHlwZV0oT2JqZWN0LmFzc2lnbih7IGNvbnRleHQgfSwgcGFyYW1zKSwgdmFsdWUpXHJcbiAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICB9LCByZW5kZXJPcHRzLCBwYXJhbXMsIGNvbnRleHQpXHJcbiAgICAgICAgfSwgcmVuZGVyT3B0aW9ucyhoLCBvcHRpb25zLCBvcHRpb25Qcm9wcykpXHJcbiAgICAgIH0pXHJcbiAgICB9LFxyXG4gICAgZmlsdGVyTWV0aG9kKHsgb3B0aW9uLCByb3csIGNvbHVtbiB9OiBhbnkpIHtcclxuICAgICAgbGV0IHsgZGF0YSB9ID0gb3B0aW9uXHJcbiAgICAgIGxldCB7IHByb3BlcnR5LCBmaWx0ZXJSZW5kZXI6IHJlbmRlck9wdHMgfSA9IGNvbHVtblxyXG4gICAgICBsZXQgeyBwcm9wcyA9IHt9IH0gPSByZW5kZXJPcHRzXHJcbiAgICAgIGxldCBjZWxsVmFsdWUgPSBYRVV0aWxzLmdldChyb3csIHByb3BlcnR5KVxyXG4gICAgICBpZiAocHJvcHMubXVsdGlwbGUpIHtcclxuICAgICAgICBpZiAoWEVVdGlscy5pc0FycmF5KGNlbGxWYWx1ZSkpIHtcclxuICAgICAgICAgIHJldHVybiBYRVV0aWxzLmluY2x1ZGVBcnJheXMoY2VsbFZhbHVlLCBkYXRhKVxyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gZGF0YS5pbmRleE9mKGNlbGxWYWx1ZSkgPiAtMVxyXG4gICAgICB9XHJcbiAgICAgIC8qIGVzbGludC1kaXNhYmxlIGVxZXFlcSAqL1xyXG4gICAgICByZXR1cm4gY2VsbFZhbHVlID09IGRhdGFcclxuICAgIH1cclxuICB9LFxyXG4gIENhc2NhZGVyOiB7XHJcbiAgICByZW5kZXJFZGl0OiBjcmVhdGVFZGl0UmVuZGVyKHsgdHJhbnNmZXI6IHRydWUgfSksXHJcbiAgICByZW5kZXJDZWxsKGg6IEZ1bmN0aW9uLCB7IHByb3BzID0ge30gfTogYW55LCBwYXJhbXM6IGFueSkge1xyXG4gICAgICBsZXQgeyByb3csIGNvbHVtbiB9ID0gcGFyYW1zXHJcbiAgICAgIGxldCBjZWxsVmFsdWUgPSBYRVV0aWxzLmdldChyb3csIGNvbHVtbi5wcm9wZXJ0eSlcclxuICAgICAgbGV0IHZhbHVlcyA9IGNlbGxWYWx1ZSB8fCBbXVxyXG4gICAgICBsZXQgbGFiZWxzOiBBcnJheTxhbnk+ID0gW11cclxuICAgICAgbWF0Y2hDYXNjYWRlckRhdGEoMCwgcHJvcHMuZGF0YSwgdmFsdWVzLCBsYWJlbHMpXHJcbiAgICAgIHJldHVybiBjZWxsVGV4dChoLCBsYWJlbHMuam9pbihgICR7cHJvcHMuc2VwYXJhdG9yIHx8ICcvJ30gYCkpXHJcbiAgICB9XHJcbiAgfSxcclxuICBEYXRlUGlja2VyOiB7XHJcbiAgICByZW5kZXJFZGl0OiBjcmVhdGVFZGl0UmVuZGVyKHsgdHJhbnNmZXI6IHRydWUgfSksXHJcbiAgICByZW5kZXJDZWxsKGg6IEZ1bmN0aW9uLCB7IHByb3BzID0ge30gfTogYW55LCBwYXJhbXM6IGFueSkge1xyXG4gICAgICBsZXQgeyByb3csIGNvbHVtbiB9ID0gcGFyYW1zXHJcbiAgICAgIGxldCB7IHNlcGFyYXRvciB9ID0gcHJvcHNcclxuICAgICAgbGV0IGNlbGxWYWx1ZSA9IFhFVXRpbHMuZ2V0KHJvdywgY29sdW1uLnByb3BlcnR5KVxyXG4gICAgICBzd2l0Y2ggKHByb3BzLnR5cGUpIHtcclxuICAgICAgICBjYXNlICd3ZWVrJzpcclxuICAgICAgICAgIGNlbGxWYWx1ZSA9IGdldEZvcm1hdERhdGUoY2VsbFZhbHVlLCBwcm9wcywgJ3l5eXl3V1cnKVxyXG4gICAgICAgICAgYnJlYWtcclxuICAgICAgICBjYXNlICdtb250aCc6XHJcbiAgICAgICAgICBjZWxsVmFsdWUgPSBnZXRGb3JtYXREYXRlKGNlbGxWYWx1ZSwgcHJvcHMsICd5eXl5LU1NJylcclxuICAgICAgICAgIGJyZWFrXHJcbiAgICAgICAgY2FzZSAneWVhcic6XHJcbiAgICAgICAgICBjZWxsVmFsdWUgPSBnZXRGb3JtYXREYXRlKGNlbGxWYWx1ZSwgcHJvcHMsICd5eXl5JylcclxuICAgICAgICAgIGJyZWFrXHJcbiAgICAgICAgY2FzZSAnZGF0ZXMnOlxyXG4gICAgICAgICAgY2VsbFZhbHVlID0gZ2V0Rm9ybWF0RGF0ZXMoY2VsbFZhbHVlLCBwcm9wcywgJywgJywgJ3l5eXktTU0tZGQnKVxyXG4gICAgICAgICAgYnJlYWtcclxuICAgICAgICBjYXNlICdkYXRlcmFuZ2UnOlxyXG4gICAgICAgICAgY2VsbFZhbHVlID0gZ2V0Rm9ybWF0RGF0ZXMoY2VsbFZhbHVlLCBwcm9wcywgYCAke3NlcGFyYXRvciB8fCAnLSd9IGAsICd5eXl5LU1NLWRkJylcclxuICAgICAgICAgIGJyZWFrXHJcbiAgICAgICAgY2FzZSAnZGF0ZXRpbWVyYW5nZSc6XHJcbiAgICAgICAgICBjZWxsVmFsdWUgPSBnZXRGb3JtYXREYXRlcyhjZWxsVmFsdWUsIHByb3BzLCBgICR7c2VwYXJhdG9yIHx8ICctJ30gYCwgJ3l5eXktTU0tZGQgSEg6c3M6bW0nKVxyXG4gICAgICAgICAgYnJlYWtcclxuICAgICAgICBkZWZhdWx0OlxyXG4gICAgICAgICAgY2VsbFZhbHVlID0gZ2V0Rm9ybWF0RGF0ZShjZWxsVmFsdWUsIHByb3BzLCAneXl5eS1NTS1kZCcpXHJcbiAgICAgICAgICBicmVha1xyXG4gICAgICB9XHJcbiAgICAgIHJldHVybiBjZWxsVGV4dChoLCBjZWxsVmFsdWUpXHJcbiAgICB9LFxyXG4gICAgcmVuZGVyRmlsdGVyKGg6IEZ1bmN0aW9uLCByZW5kZXJPcHRzOiBhbnksIHBhcmFtczogYW55LCBjb250ZXh0OiBhbnkpIHtcclxuICAgICAgbGV0IHsgY29sdW1uIH0gPSBwYXJhbXNcclxuICAgICAgbGV0IHsgYXR0cnMsIGV2ZW50cyB9ID0gcmVuZGVyT3B0c1xyXG4gICAgICBsZXQgcHJvcHMgPSBnZXRQcm9wcyhwYXJhbXMsIHJlbmRlck9wdHMsIHsgdHJhbnNmZXI6IHRydWUgfSlcclxuICAgICAgbGV0IHR5cGUgPSAnb24tY2hhbmdlJ1xyXG4gICAgICByZXR1cm4gY29sdW1uLmZpbHRlcnMubWFwKChpdGVtOiBhbnkpID0+IHtcclxuICAgICAgICByZXR1cm4gaChyZW5kZXJPcHRzLm5hbWUsIHtcclxuICAgICAgICAgIHByb3BzLFxyXG4gICAgICAgICAgYXR0cnMsXHJcbiAgICAgICAgICBtb2RlbDoge1xyXG4gICAgICAgICAgICB2YWx1ZTogaXRlbS5kYXRhLFxyXG4gICAgICAgICAgICBjYWxsYmFjayhvcHRpb25WYWx1ZTogYW55KSB7XHJcbiAgICAgICAgICAgICAgaXRlbS5kYXRhID0gb3B0aW9uVmFsdWVcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgfSxcclxuICAgICAgICAgIG9uOiBnZXRGaWx0ZXJFdmVudHMoe1xyXG4gICAgICAgICAgICBbdHlwZV0odmFsdWU6IGFueSkge1xyXG4gICAgICAgICAgICAgIGhhbmRsZUNvbmZpcm1GaWx0ZXIoY29udGV4dCwgY29sdW1uLCAhIXZhbHVlLCBpdGVtKVxyXG4gICAgICAgICAgICAgIGlmIChldmVudHMgJiYgZXZlbnRzW3R5cGVdKSB7XHJcbiAgICAgICAgICAgICAgICBldmVudHNbdHlwZV0oT2JqZWN0LmFzc2lnbih7IGNvbnRleHQgfSwgcGFyYW1zKSwgdmFsdWUpXHJcbiAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICB9LCByZW5kZXJPcHRzLCBwYXJhbXMsIGNvbnRleHQpXHJcbiAgICAgICAgfSlcclxuICAgICAgfSlcclxuICAgIH0sXHJcbiAgICBmaWx0ZXJNZXRob2QoeyBvcHRpb24sIHJvdywgY29sdW1uIH06IGFueSkge1xyXG4gICAgICBsZXQgeyBkYXRhIH0gPSBvcHRpb25cclxuICAgICAgbGV0IHsgZmlsdGVyUmVuZGVyOiByZW5kZXJPcHRzIH0gPSBjb2x1bW5cclxuICAgICAgbGV0IHsgcHJvcHMgPSB7fSB9ID0gcmVuZGVyT3B0c1xyXG4gICAgICBsZXQgY2VsbFZhbHVlID0gWEVVdGlscy5nZXQocm93LCBjb2x1bW4ucHJvcGVydHkpXHJcbiAgICAgIGlmIChkYXRhKSB7XHJcbiAgICAgICAgc3dpdGNoIChwcm9wcy50eXBlKSB7XHJcbiAgICAgICAgICBjYXNlICdkYXRlcmFuZ2UnOlxyXG4gICAgICAgICAgICByZXR1cm4gZXF1YWxEYXRlcmFuZ2UoY2VsbFZhbHVlLCBkYXRhLCBwcm9wcywgJ3l5eXktTU0tZGQnKVxyXG4gICAgICAgICAgY2FzZSAnZGF0ZXRpbWVyYW5nZSc6XHJcbiAgICAgICAgICAgIHJldHVybiBlcXVhbERhdGVyYW5nZShjZWxsVmFsdWUsIGRhdGEsIHByb3BzLCAneXl5eS1NTS1kZCBISDpzczptbScpXHJcbiAgICAgICAgICBkZWZhdWx0OlxyXG4gICAgICAgICAgICByZXR1cm4gY2VsbFZhbHVlID09PSBkYXRhXHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICAgIHJldHVybiBmYWxzZVxyXG4gICAgfVxyXG4gIH0sXHJcbiAgVGltZVBpY2tlcjoge1xyXG4gICAgcmVuZGVyRWRpdDogY3JlYXRlRWRpdFJlbmRlcih7IHRyYW5zZmVyOiB0cnVlIH0pXHJcbiAgfSxcclxuICBSYXRlOiB7XHJcbiAgICByZW5kZXJEZWZhdWx0OiBjcmVhdGVFZGl0UmVuZGVyKCksXHJcbiAgICByZW5kZXJFZGl0OiBjcmVhdGVFZGl0UmVuZGVyKCksXHJcbiAgICByZW5kZXJGaWx0ZXI6IGNyZWF0ZUZpbHRlclJlbmRlcigpLFxyXG4gICAgZmlsdGVyTWV0aG9kOiBkZWZhdWx0RmlsdGVyTWV0aG9kXHJcbiAgfSxcclxuICBpU3dpdGNoOiB7XHJcbiAgICByZW5kZXJEZWZhdWx0OiBjcmVhdGVFZGl0UmVuZGVyKCksXHJcbiAgICByZW5kZXJFZGl0OiBjcmVhdGVFZGl0UmVuZGVyKCksXHJcbiAgICByZW5kZXJGaWx0ZXI6IGNyZWF0ZUZpbHRlclJlbmRlcigpLFxyXG4gICAgZmlsdGVyTWV0aG9kOiBkZWZhdWx0RmlsdGVyTWV0aG9kXHJcbiAgfVxyXG59XHJcblxyXG4vKipcclxuICog5LqL5Lu25YW85a655oCn5aSE55CGXHJcbiAqL1xyXG5mdW5jdGlvbiBoYW5kbGVDbGVhckV2ZW50KHBhcmFtczogYW55LCBldm50OiBhbnksIGNvbnRleHQ6IGFueSkge1xyXG4gIGxldCB7IGdldEV2ZW50VGFyZ2V0Tm9kZSB9ID0gY29udGV4dFxyXG4gIGxldCBib2R5RWxlbSA9IGRvY3VtZW50LmJvZHlcclxuICBpZiAoXHJcbiAgICAvLyDkuIvmi4nmoYbjgIHml6XmnJ9cclxuICAgIGdldEV2ZW50VGFyZ2V0Tm9kZShldm50LCBib2R5RWxlbSwgJ2l2dS1zZWxlY3QtZHJvcGRvd24nKS5mbGFnXHJcbiAgKSB7XHJcbiAgICByZXR1cm4gZmFsc2VcclxuICB9XHJcbn1cclxuXHJcbi8qKlxyXG4gKiDln7rkuo4gdnhlLXRhYmxlIOihqOagvOeahOmAgumFjeaPkuS7tu+8jOeUqOS6juWFvOWuuSBpdmlldyDnu4Tku7blupNcclxuICovXHJcbmV4cG9ydCBjb25zdCBWWEVUYWJsZVBsdWdpbklWaWV3ID0ge1xyXG4gIGluc3RhbGwoeHRhYmxlOiB0eXBlb2YgVlhFVGFibGUpIHtcclxuICAgIGxldCB7IGludGVyY2VwdG9yLCByZW5kZXJlciB9ID0geHRhYmxlXHJcbiAgICByZW5kZXJlci5taXhpbihyZW5kZXJNYXApXHJcbiAgICBpbnRlcmNlcHRvci5hZGQoJ2V2ZW50LmNsZWFyRmlsdGVyJywgaGFuZGxlQ2xlYXJFdmVudClcclxuICAgIGludGVyY2VwdG9yLmFkZCgnZXZlbnQuY2xlYXJBY3RpdmVkJywgaGFuZGxlQ2xlYXJFdmVudClcclxuICB9XHJcbn1cclxuXHJcbmlmICh0eXBlb2Ygd2luZG93ICE9PSAndW5kZWZpbmVkJyAmJiB3aW5kb3cuVlhFVGFibGUpIHtcclxuICB3aW5kb3cuVlhFVGFibGUudXNlKFZYRVRhYmxlUGx1Z2luSVZpZXcpXHJcbn1cclxuXHJcbmV4cG9ydCBkZWZhdWx0IFZYRVRhYmxlUGx1Z2luSVZpZXdcclxuIl19
