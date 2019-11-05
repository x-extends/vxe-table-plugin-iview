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

function getProps(_ref, _ref2) {
  var $table = _ref.$table;
  var props = _ref2.props;
  return _xeUtils["default"].assign($table.vSize ? {
    size: $table.vSize
  } : {}, props);
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

function defaultEditRender(h, renderOpts, params) {
  var row = params.row,
      column = params.column;
  var attrs = renderOpts.attrs;
  var props = getProps(params, renderOpts);
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

function defaultFilterRender(h, renderOpts, params, context) {
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
          _renderOpts$optionPro = renderOpts.optionProps,
          optionProps = _renderOpts$optionPro === void 0 ? {} : _renderOpts$optionPro,
          _renderOpts$optionGro = renderOpts.optionGroupProps,
          optionGroupProps = _renderOpts$optionGro === void 0 ? {} : _renderOpts$optionGro;
      var row = params.row,
          column = params.column;
      var attrs = renderOpts.attrs;
      var props = getProps(params, renderOpts);

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
      var props = getProps(params, renderOpts);
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
    renderEdit: defaultEditRender,
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
    renderEdit: defaultEditRender,
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
      var props = getProps(params, renderOpts);
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
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImluZGV4LnRzIl0sIm5hbWVzIjpbImdldEZvcm1hdERhdGUiLCJ2YWx1ZSIsInByb3BzIiwiZGVmYXVsdEZvcm1hdCIsIlhFVXRpbHMiLCJ0b0RhdGVTdHJpbmciLCJmb3JtYXQiLCJnZXRGb3JtYXREYXRlcyIsInZhbHVlcyIsInNlcGFyYXRvciIsIm1hcCIsImRhdGUiLCJqb2luIiwiZXF1YWxEYXRlcmFuZ2UiLCJjZWxsVmFsdWUiLCJkYXRhIiwibWF0Y2hDYXNjYWRlckRhdGEiLCJpbmRleCIsImxpc3QiLCJsYWJlbHMiLCJ2YWwiLCJsZW5ndGgiLCJlYWNoIiwiaXRlbSIsInB1c2giLCJsYWJlbCIsImNoaWxkcmVuIiwiZ2V0UHJvcHMiLCIkdGFibGUiLCJhc3NpZ24iLCJ2U2l6ZSIsInNpemUiLCJnZXRDZWxsRXZlbnRzIiwicmVuZGVyT3B0cyIsInBhcmFtcyIsImV2ZW50cyIsInR5cGUiLCJvbiIsInVwZGF0ZVN0YXR1cyIsIm9iamVjdE1hcCIsImNiIiwiYXJncyIsImFwcGx5IiwiY29uY2F0IiwiZGVmYXVsdEVkaXRSZW5kZXIiLCJoIiwicm93IiwiY29sdW1uIiwiYXR0cnMiLCJuYW1lIiwibW9kZWwiLCJnZXQiLCJwcm9wZXJ0eSIsImNhbGxiYWNrIiwic2V0IiwiZ2V0RmlsdGVyRXZlbnRzIiwiY29udGV4dCIsIk9iamVjdCIsImRlZmF1bHRGaWx0ZXJSZW5kZXIiLCJmaWx0ZXJzIiwib3B0aW9uVmFsdWUiLCJldm50IiwiaGFuZGxlQ29uZmlybUZpbHRlciIsImNoZWNrZWQiLCJmaWx0ZXJNdWx0aXBsZSIsImRlZmF1bHRGaWx0ZXJNZXRob2QiLCJvcHRpb24iLCJyZW5kZXJPcHRpb25zIiwib3B0aW9ucyIsIm9wdGlvblByb3BzIiwibGFiZWxQcm9wIiwidmFsdWVQcm9wIiwiZGlzYWJsZWRQcm9wIiwiZGlzYWJsZWQiLCJrZXkiLCJjZWxsVGV4dCIsInJlbmRlck1hcCIsIklucHV0IiwiYXV0b2ZvY3VzIiwicmVuZGVyRGVmYXVsdCIsInJlbmRlckVkaXQiLCJyZW5kZXJGaWx0ZXIiLCJmaWx0ZXJNZXRob2QiLCJBdXRvQ29tcGxldGUiLCJJbnB1dE51bWJlciIsIlNlbGVjdCIsIm9wdGlvbkdyb3VwcyIsIm9wdGlvbkdyb3VwUHJvcHMiLCJncm91cE9wdGlvbnMiLCJncm91cExhYmVsIiwiZ3JvdXAiLCJnSW5kZXgiLCJyZW5kZXJDZWxsIiwidW5kZWZpbmVkIiwibXVsdGlwbGUiLCJzZWxlY3RJdGVtIiwiZmluZCIsImZpbHRlclJlbmRlciIsImlzQXJyYXkiLCJpbmNsdWRlQXJyYXlzIiwiaW5kZXhPZiIsIkNhc2NhZGVyIiwiRGF0ZVBpY2tlciIsIlRpbWVQaWNrZXIiLCJSYXRlIiwiaVN3aXRjaCIsImhhbmRsZUNsZWFyRXZlbnQiLCJnZXRFdmVudFRhcmdldE5vZGUiLCJib2R5RWxlbSIsImRvY3VtZW50IiwiYm9keSIsImZsYWciLCJWWEVUYWJsZVBsdWdpbklWaWV3IiwiaW5zdGFsbCIsInh0YWJsZSIsImludGVyY2VwdG9yIiwicmVuZGVyZXIiLCJtaXhpbiIsImFkZCIsIndpbmRvdyIsIlZYRVRhYmxlIiwidXNlIl0sIm1hcHBpbmdzIjoiOzs7Ozs7O0FBQUE7Ozs7OztBQUdBLFNBQVNBLGFBQVQsQ0FBdUJDLEtBQXZCLEVBQW1DQyxLQUFuQyxFQUErQ0MsYUFBL0MsRUFBb0U7QUFDbEUsU0FBT0Msb0JBQVFDLFlBQVIsQ0FBcUJKLEtBQXJCLEVBQTRCQyxLQUFLLENBQUNJLE1BQU4sSUFBZ0JILGFBQTVDLENBQVA7QUFDRDs7QUFFRCxTQUFTSSxjQUFULENBQXdCQyxNQUF4QixFQUFxQ04sS0FBckMsRUFBaURPLFNBQWpELEVBQW9FTixhQUFwRSxFQUF5RjtBQUN2RixTQUFPQyxvQkFBUU0sR0FBUixDQUFZRixNQUFaLEVBQW9CLFVBQUNHLElBQUQ7QUFBQSxXQUFlWCxhQUFhLENBQUNXLElBQUQsRUFBT1QsS0FBUCxFQUFjQyxhQUFkLENBQTVCO0FBQUEsR0FBcEIsRUFBOEVTLElBQTlFLENBQW1GSCxTQUFuRixDQUFQ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UUFBUSxDQUFDQyxJQUF4Qjs7QUFDQSxPQUNFO0FBQ0FILEVBQUFBLGtCQUFrQixDQUFDOUMsSUFBRCxFQUFPK0MsUUFBUCxFQUFpQixxQkFBakIsQ0FBbEIsQ0FBMERHLElBRjVELEVBR0U7QUFDQSxXQUFPLEtBQVA7QUFDRDtBQUNGO0FBRUQ7Ozs7O0FBR08sSUFBTUMsbUJBQW1CLEdBQUc7QUFDakNDLEVBQUFBLE9BRGlDLG1CQUN6QkMsTUFEeUIsRUFDRjtBQUFBLFFBQ3ZCQyxXQUR1QixHQUNHRCxNQURILENBQ3ZCQyxXQUR1QjtBQUFBLFFBQ1ZDLFFBRFUsR0FDR0YsTUFESCxDQUNWRSxRQURVO0FBRTdCQSxJQUFBQSxRQUFRLENBQUNDLEtBQVQsQ0FBZXpDLFNBQWY7QUFDQXVDLElBQUFBLFdBQVcsQ0FBQ0csR0FBWixDQUFnQixtQkFBaEIsRUFBcUNaLGdCQUFyQztBQUNBUyxJQUFBQSxXQUFXLENBQUNHLEdBQVosQ0FBZ0Isb0JBQWhCLEVBQXNDWixnQkFBdEM7QUFDRDtBQU5nQyxDQUE1Qjs7O0FBU1AsSUFBSSxPQUFPYSxNQUFQLEtBQWtCLFdBQWxCLElBQWlDQSxNQUFNLENBQUNDLFFBQTVDLEVBQXNEO0FBQ3BERCxFQUFBQSxNQUFNLENBQUNDLFFBQVAsQ0FBZ0JDLEdBQWhCLENBQW9CVCxtQkFBcEI7QUFDRDs7ZUFFY0EsbUIiLCJmaWxlIjoiaW5kZXguY29tbW9uLmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IFhFVXRpbHMgZnJvbSAneGUtdXRpbHMvbWV0aG9kcy94ZS11dGlscydcclxuaW1wb3J0IFZYRVRhYmxlIGZyb20gJ3Z4ZS10YWJsZS9saWIvdnhlLXRhYmxlJ1xyXG5cclxuZnVuY3Rpb24gZ2V0Rm9ybWF0RGF0ZSh2YWx1ZTogYW55LCBwcm9wczogYW55LCBkZWZhdWx0Rm9ybWF0OiBzdHJpbmcpIHtcclxuICByZXR1cm4gWEVVdGlscy50b0RhdGVTdHJpbmcodmFsdWUsIHByb3BzLmZvcm1hdCB8fCBkZWZhdWx0Rm9ybWF0KVxyXG59XHJcblxyXG5mdW5jdGlvbiBnZXRGb3JtYXREYXRlcyh2YWx1ZXM6IGFueSwgcHJvcHM6IGFueSwgc2VwYXJhdG9yOiBzdHJpbmcsIGRlZmF1bHRGb3JtYXQ6IHN0cmluZykge1xyXG4gIHJldHVybiBYRVV0aWxzLm1hcCh2YWx1ZXMsIChkYXRlOiBhbnkpID0+IGdldEZvcm1hdERhdGUoZGF0ZSwgcHJvcHMsIGRlZmF1bHRGb3JtYXQpKS5qb2luKHNlcGFyYXRvcilcclxufVxyXG5cclxuZnVuY3Rpb24gZXF1YWxEYXRlcmFuZ2UoY2VsbFZhbHVlOiBhbnksIGRhdGE6IGFueSwgcHJvcHM6IGFueSwgZGVmYXVsdEZvcm1hdDogc3RyaW5nKSB7XHJcbiAgY2VsbFZhbHVlID0gZ2V0Rm9ybWF0RGF0ZShjZWxsVmFsdWUsIHByb3BzLCBkZWZhdWx0Rm9ybWF0KVxyXG4gIHJldHVybiBjZWxsVmFsdWUgPj0gZ2V0Rm9ybWF0RGF0ZShkYXRhWzBdLCBwcm9wcywgZGVmYXVsdEZvcm1hdCkgJiYgY2VsbFZhbHVlIDw9IGdldEZvcm1hdERhdGUoZGF0YVsxXSwgcHJvcHMsIGRlZmF1bHRGb3JtYXQpXHJcbn1cclxuXHJcbmZ1bmN0aW9uIG1hdGNoQ2FzY2FkZXJEYXRhKGluZGV4OiBudW1iZXIsIGxpc3Q6IEFycmF5PGFueT4sIHZhbHVlczogQXJyYXk8YW55PiwgbGFiZWxzOiBBcnJheTxhbnk+KSB7XHJcbiAgbGV0IHZhbCA9IHZhbHVlc1tpbmRleF1cclxuICBpZiAobGlzdCAmJiB2YWx1ZXMubGVuZ3RoID4gaW5kZXgpIHtcclxuICAgIFhFVXRpbHMuZWFjaChsaXN0LCAoaXRlbTogYW55KSA9PiB7XHJcbiAgICAgIGlmIChpdGVtLnZhbHVlID09PSB2YWwpIHtcclxuICAgICAgICBsYWJlbHMucHVzaChpdGVtLmxhYmVsKVxyXG4gICAgICAgIG1hdGNoQ2FzY2FkZXJEYXRhKCsraW5kZXgsIGl0ZW0uY2hpbGRyZW4sIHZhbHVlcywgbGFiZWxzKVxyXG4gICAgICB9XHJcbiAgICB9KVxyXG4gIH1cclxufVxyXG5cclxuZnVuY3Rpb24gZ2V0UHJvcHMoeyAkdGFibGUgfTogYW55LCB7IHByb3BzIH06IGFueSkge1xyXG4gIHJldHVybiBYRVV0aWxzLmFzc2lnbigkdGFibGUudlNpemUgPyB7IHNpemU6ICR0YWJsZS52U2l6ZSB9IDoge30sIHByb3BzKVxyXG59XHJcblxyXG5mdW5jdGlvbiBnZXRDZWxsRXZlbnRzKHJlbmRlck9wdHM6IGFueSwgcGFyYW1zOiBhbnkpIHtcclxuICBsZXQgeyBldmVudHMgfSA9IHJlbmRlck9wdHNcclxuICBsZXQgeyAkdGFibGUgfSA9IHBhcmFtc1xyXG4gIGxldCB0eXBlID0gJ29uLWNoYW5nZSdcclxuICBsZXQgb24gPSB7XHJcbiAgICBbdHlwZV06ICgpID0+ICR0YWJsZS51cGRhdGVTdGF0dXMocGFyYW1zKVxyXG4gIH1cclxuICBpZiAoZXZlbnRzKSB7XHJcbiAgICByZXR1cm4gWEVVdGlscy5hc3NpZ24oe30sIFhFVXRpbHMub2JqZWN0TWFwKGV2ZW50cywgKGNiOiBGdW5jdGlvbikgPT4gZnVuY3Rpb24gKC4uLmFyZ3M6IGFueVtdKSB7XHJcbiAgICAgIGNiLmFwcGx5KG51bGwsIFtwYXJhbXNdLmNvbmNhdC5hcHBseShwYXJhbXMsIGFyZ3MpKVxyXG4gICAgfSksIG9uKVxyXG4gIH1cclxuICByZXR1cm4gb25cclxufVxyXG5cclxuZnVuY3Rpb24gZGVmYXVsdEVkaXRSZW5kZXIoaDogRnVuY3Rpb24sIHJlbmRlck9wdHM6IGFueSwgcGFyYW1zOiBhbnkpIHtcclxuICBsZXQgeyByb3csIGNvbHVtbiB9ID0gcGFyYW1zXHJcbiAgbGV0IHsgYXR0cnMgfSA9IHJlbmRlck9wdHNcclxuICBsZXQgcHJvcHMgPSBnZXRQcm9wcyhwYXJhbXMsIHJlbmRlck9wdHMpXHJcbiAgcmV0dXJuIFtcclxuICAgIGgocmVuZGVyT3B0cy5uYW1lLCB7XHJcbiAgICAgIHByb3BzLFxyXG4gICAgICBhdHRycyxcclxuICAgICAgbW9kZWw6IHtcclxuICAgICAgICB2YWx1ZTogWEVVdGlscy5nZXQocm93LCBjb2x1bW4ucHJvcGVydHkpLFxyXG4gICAgICAgIGNhbGxiYWNrKHZhbHVlOiBhbnkpIHtcclxuICAgICAgICAgIFhFVXRpbHMuc2V0KHJvdywgY29sdW1uLnByb3BlcnR5LCB2YWx1ZSlcclxuICAgICAgICB9XHJcbiAgICAgIH0sXHJcbiAgICAgIG9uOiBnZXRDZWxsRXZlbnRzKHJlbmRlck9wdHMsIHBhcmFtcylcclxuICAgIH0pXHJcbiAgXVxyXG59XHJcblxyXG5mdW5jdGlvbiBnZXRGaWx0ZXJFdmVudHMob246IGFueSwgcmVuZGVyT3B0czogYW55LCBwYXJhbXM6IGFueSwgY29udGV4dDogYW55KSB7XHJcbiAgbGV0IHsgZXZlbnRzIH0gPSByZW5kZXJPcHRzXHJcbiAgaWYgKGV2ZW50cykge1xyXG4gICAgcmV0dXJuIFhFVXRpbHMuYXNzaWduKHt9LCBYRVV0aWxzLm9iamVjdE1hcChldmVudHMsIChjYjogRnVuY3Rpb24pID0+IGZ1bmN0aW9uICguLi5hcmdzOiBhbnlbXSkge1xyXG4gICAgICBwYXJhbXMgPSBPYmplY3QuYXNzaWduKHsgY29udGV4dCB9LCBwYXJhbXMpXHJcbiAgICAgIGNiLmFwcGx5KG51bGwsIFtwYXJhbXNdLmNvbmNhdC5hcHBseShwYXJhbXMsIGFyZ3MpKVxyXG4gICAgfSksIG9uKVxyXG4gIH1cclxuICByZXR1cm4gb25cclxufVxyXG5cclxuZnVuY3Rpb24gZGVmYXVsdEZpbHRlclJlbmRlcihoOiBGdW5jdGlvbiwgcmVuZGVyT3B0czogYW55LCBwYXJhbXM6IGFueSwgY29udGV4dDogYW55KSB7XHJcbiAgbGV0IHsgY29sdW1uIH0gPSBwYXJhbXNcclxuICBsZXQgeyBuYW1lLCBhdHRycywgZXZlbnRzIH0gPSByZW5kZXJPcHRzXHJcbiAgbGV0IHR5cGUgPSAnb24tY2hhbmdlJ1xyXG4gIGxldCBwcm9wcyA9IGdldFByb3BzKHBhcmFtcywgcmVuZGVyT3B0cylcclxuICByZXR1cm4gY29sdW1uLmZpbHRlcnMubWFwKChpdGVtOiBhbnkpID0+IHtcclxuICAgIHJldHVybiBoKG5hbWUsIHtcclxuICAgICAgcHJvcHMsXHJcbiAgICAgIGF0dHJzLFxyXG4gICAgICBtb2RlbDoge1xyXG4gICAgICAgIHZhbHVlOiBpdGVtLmRhdGEsXHJcbiAgICAgICAgY2FsbGJhY2sob3B0aW9uVmFsdWU6IGFueSkge1xyXG4gICAgICAgICAgaXRlbS5kYXRhID0gb3B0aW9uVmFsdWVcclxuICAgICAgICB9XHJcbiAgICAgIH0sXHJcbiAgICAgIG9uOiBnZXRGaWx0ZXJFdmVudHMoe1xyXG4gICAgICAgIFt0eXBlXShldm50OiBhbnkpIHtcclxuICAgICAgICAgIGhhbmRsZUNvbmZpcm1GaWx0ZXIoY29udGV4dCwgY29sdW1uLCAhIWl0ZW0uZGF0YSwgaXRlbSlcclxuICAgICAgICAgIGlmIChldmVudHMgJiYgZXZlbnRzW3R5cGVdKSB7XHJcbiAgICAgICAgICAgIGV2ZW50c1t0eXBlXShPYmplY3QuYXNzaWduKHsgY29udGV4dCB9LCBwYXJhbXMpLCBldm50KVxyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgfSwgcmVuZGVyT3B0cywgcGFyYW1zLCBjb250ZXh0KVxyXG4gICAgfSlcclxuICB9KVxyXG59XHJcblxyXG5mdW5jdGlvbiBoYW5kbGVDb25maXJtRmlsdGVyKGNvbnRleHQ6IGFueSwgY29sdW1uOiBhbnksIGNoZWNrZWQ6IGFueSwgaXRlbTogYW55KSB7XHJcbiAgY29udGV4dFtjb2x1bW4uZmlsdGVyTXVsdGlwbGUgPyAnY2hhbmdlTXVsdGlwbGVPcHRpb24nIDogJ2NoYW5nZVJhZGlvT3B0aW9uJ10oe30sIGNoZWNrZWQsIGl0ZW0pXHJcbn1cclxuXHJcbmZ1bmN0aW9uIGRlZmF1bHRGaWx0ZXJNZXRob2QoeyBvcHRpb24sIHJvdywgY29sdW1uIH06IGFueSkge1xyXG4gIGxldCB7IGRhdGEgfSA9IG9wdGlvblxyXG4gIGxldCBjZWxsVmFsdWUgPSBYRVV0aWxzLmdldChyb3csIGNvbHVtbi5wcm9wZXJ0eSlcclxuICAvKiBlc2xpbnQtZGlzYWJsZSBlcWVxZXEgKi9cclxuICByZXR1cm4gY2VsbFZhbHVlID09PSBkYXRhXHJcbn1cclxuXHJcbmZ1bmN0aW9uIHJlbmRlck9wdGlvbnMoaDogRnVuY3Rpb24sIG9wdGlvbnM6IGFueSwgb3B0aW9uUHJvcHM6IGFueSkge1xyXG4gIGxldCBsYWJlbFByb3AgPSBvcHRpb25Qcm9wcy5sYWJlbCB8fCAnbGFiZWwnXHJcbiAgbGV0IHZhbHVlUHJvcCA9IG9wdGlvblByb3BzLnZhbHVlIHx8ICd2YWx1ZSdcclxuICBsZXQgZGlzYWJsZWRQcm9wID0gb3B0aW9uUHJvcHMuZGlzYWJsZWQgfHwgJ2Rpc2FibGVkJ1xyXG4gIHJldHVybiBYRVV0aWxzLm1hcChvcHRpb25zLCAoaXRlbTogYW55LCBpbmRleDogbnVtYmVyKSA9PiB7XHJcbiAgICByZXR1cm4gaCgnT3B0aW9uJywge1xyXG4gICAgICBwcm9wczoge1xyXG4gICAgICAgIHZhbHVlOiBpdGVtW3ZhbHVlUHJvcF0sXHJcbiAgICAgICAgbGFiZWw6IGl0ZW1bbGFiZWxQcm9wXSxcclxuICAgICAgICBkaXNhYmxlZDogaXRlbVtkaXNhYmxlZFByb3BdXHJcbiAgICAgIH0sXHJcbiAgICAgIGtleTogaW5kZXhcclxuICAgIH0pXHJcbiAgfSlcclxufVxyXG5cclxuZnVuY3Rpb24gY2VsbFRleHQoaDogRnVuY3Rpb24sIGNlbGxWYWx1ZTogYW55KSB7XHJcbiAgcmV0dXJuIFsnJyArIChjZWxsVmFsdWUgPT09IG51bGwgfHwgY2VsbFZhbHVlID09PSB2b2lkIDAgPyAnJyA6IGNlbGxWYWx1ZSldXHJcbn1cclxuXHJcbi8qKlxyXG4gKiDmuLLmn5Plh73mlbBcclxuICovXHJcbmNvbnN0IHJlbmRlck1hcCA9IHtcclxuICBJbnB1dDoge1xyXG4gICAgYXV0b2ZvY3VzOiAnaW5wdXQuaXZ1LWlucHV0JyxcclxuICAgIHJlbmRlckRlZmF1bHQ6IGRlZmF1bHRFZGl0UmVuZGVyLFxyXG4gICAgcmVuZGVyRWRpdDogZGVmYXVsdEVkaXRSZW5kZXIsXHJcbiAgICByZW5kZXJGaWx0ZXI6IGRlZmF1bHRGaWx0ZXJSZW5kZXIsXHJcbiAgICBmaWx0ZXJNZXRob2Q6IGRlZmF1bHRGaWx0ZXJNZXRob2RcclxuICB9LFxyXG4gIEF1dG9Db21wbGV0ZToge1xyXG4gICAgYXV0b2ZvY3VzOiAnaW5wdXQuaXZ1LWlucHV0JyxcclxuICAgIHJlbmRlckRlZmF1bHQ6IGRlZmF1bHRFZGl0UmVuZGVyLFxyXG4gICAgcmVuZGVyRWRpdDogZGVmYXVsdEVkaXRSZW5kZXIsXHJcbiAgICByZW5kZXJGaWx0ZXI6IGRlZmF1bHRGaWx0ZXJSZW5kZXIsXHJcbiAgICBmaWx0ZXJNZXRob2Q6IGRlZmF1bHRGaWx0ZXJNZXRob2RcclxuICB9LFxyXG4gIElucHV0TnVtYmVyOiB7XHJcbiAgICBhdXRvZm9jdXM6ICdpbnB1dC5pdnUtaW5wdXQtbnVtYmVyLWlucHV0JyxcclxuICAgIHJlbmRlckRlZmF1bHQ6IGRlZmF1bHRFZGl0UmVuZGVyLFxyXG4gICAgcmVuZGVyRWRpdDogZGVmYXVsdEVkaXRSZW5kZXIsXHJcbiAgICByZW5kZXJGaWx0ZXI6IGRlZmF1bHRGaWx0ZXJSZW5kZXIsXHJcbiAgICBmaWx0ZXJNZXRob2Q6IGRlZmF1bHRGaWx0ZXJNZXRob2RcclxuICB9LFxyXG4gIFNlbGVjdDoge1xyXG4gICAgcmVuZGVyRWRpdChoOiBGdW5jdGlvbiwgcmVuZGVyT3B0czogYW55LCBwYXJhbXM6IGFueSkge1xyXG4gICAgICBsZXQgeyBvcHRpb25zLCBvcHRpb25Hcm91cHMsIG9wdGlvblByb3BzID0ge30sIG9wdGlvbkdyb3VwUHJvcHMgPSB7fSB9ID0gcmVuZGVyT3B0c1xyXG4gICAgICBsZXQgeyByb3csIGNvbHVtbiB9ID0gcGFyYW1zXHJcbiAgICAgIGxldCB7IGF0dHJzIH0gPSByZW5kZXJPcHRzXHJcbiAgICAgIGxldCBwcm9wcyA9IGdldFByb3BzKHBhcmFtcywgcmVuZGVyT3B0cylcclxuICAgICAgaWYgKG9wdGlvbkdyb3Vwcykge1xyXG4gICAgICAgIGxldCBncm91cE9wdGlvbnMgPSBvcHRpb25Hcm91cFByb3BzLm9wdGlvbnMgfHwgJ29wdGlvbnMnXHJcbiAgICAgICAgbGV0IGdyb3VwTGFiZWwgPSBvcHRpb25Hcm91cFByb3BzLmxhYmVsIHx8ICdsYWJlbCdcclxuICAgICAgICByZXR1cm4gW1xyXG4gICAgICAgICAgaCgnU2VsZWN0Jywge1xyXG4gICAgICAgICAgICBwcm9wcyxcclxuICAgICAgICAgICAgYXR0cnMsXHJcbiAgICAgICAgICAgIG1vZGVsOiB7XHJcbiAgICAgICAgICAgICAgdmFsdWU6IFhFVXRpbHMuZ2V0KHJvdywgY29sdW1uLnByb3BlcnR5KSxcclxuICAgICAgICAgICAgICBjYWxsYmFjayhjZWxsVmFsdWU6IGFueSkge1xyXG4gICAgICAgICAgICAgICAgWEVVdGlscy5zZXQocm93LCBjb2x1bW4ucHJvcGVydHksIGNlbGxWYWx1ZSlcclxuICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIG9uOiBnZXRDZWxsRXZlbnRzKHJlbmRlck9wdHMsIHBhcmFtcylcclxuICAgICAgICAgIH0sIFhFVXRpbHMubWFwKG9wdGlvbkdyb3VwcywgKGdyb3VwOiBhbnksIGdJbmRleDogbnVtYmVyKSA9PiB7XHJcbiAgICAgICAgICAgIHJldHVybiBoKCdPcHRpb25Hcm91cCcsIHtcclxuICAgICAgICAgICAgICBwcm9wczoge1xyXG4gICAgICAgICAgICAgICAgbGFiZWw6IGdyb3VwW2dyb3VwTGFiZWxdXHJcbiAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICBrZXk6IGdJbmRleFxyXG4gICAgICAgICAgICB9LCByZW5kZXJPcHRpb25zKGgsIGdyb3VwW2dyb3VwT3B0aW9uc10sIG9wdGlvblByb3BzKSlcclxuICAgICAgICAgIH0pKVxyXG4gICAgICAgIF1cclxuICAgICAgfVxyXG4gICAgICByZXR1cm4gW1xyXG4gICAgICAgIGgoJ1NlbGVjdCcsIHtcclxuICAgICAgICAgIHByb3BzLFxyXG4gICAgICAgICAgYXR0cnMsXHJcbiAgICAgICAgICBtb2RlbDoge1xyXG4gICAgICAgICAgICB2YWx1ZTogWEVVdGlscy5nZXQocm93LCBjb2x1bW4ucHJvcGVydHkpLFxyXG4gICAgICAgICAgICBjYWxsYmFjayhjZWxsVmFsdWU6IGFueSkge1xyXG4gICAgICAgICAgICAgIFhFVXRpbHMuc2V0KHJvdywgY29sdW1uLnByb3BlcnR5LCBjZWxsVmFsdWUpXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgIH0sXHJcbiAgICAgICAgICBvbjogZ2V0Q2VsbEV2ZW50cyhyZW5kZXJPcHRzLCBwYXJhbXMpXHJcbiAgICAgICAgfSwgcmVuZGVyT3B0aW9ucyhoLCBvcHRpb25zLCBvcHRpb25Qcm9wcykpXHJcbiAgICAgIF1cclxuICAgIH0sXHJcbiAgICByZW5kZXJDZWxsKGg6IEZ1bmN0aW9uLCByZW5kZXJPcHRzOiBhbnksIHBhcmFtczogYW55KSB7XHJcbiAgICAgIGxldCB7IG9wdGlvbnMsIG9wdGlvbkdyb3VwcywgcHJvcHMgPSB7fSwgb3B0aW9uUHJvcHMgPSB7fSwgb3B0aW9uR3JvdXBQcm9wcyA9IHt9IH0gPSByZW5kZXJPcHRzXHJcbiAgICAgIGxldCB7IHJvdywgY29sdW1uIH0gPSBwYXJhbXNcclxuICAgICAgbGV0IGxhYmVsUHJvcCA9IG9wdGlvblByb3BzLmxhYmVsIHx8ICdsYWJlbCdcclxuICAgICAgbGV0IHZhbHVlUHJvcCA9IG9wdGlvblByb3BzLnZhbHVlIHx8ICd2YWx1ZSdcclxuICAgICAgbGV0IGdyb3VwT3B0aW9ucyA9IG9wdGlvbkdyb3VwUHJvcHMub3B0aW9ucyB8fCAnb3B0aW9ucydcclxuICAgICAgbGV0IGNlbGxWYWx1ZSA9IFhFVXRpbHMuZ2V0KHJvdywgY29sdW1uLnByb3BlcnR5KVxyXG4gICAgICBpZiAoIShjZWxsVmFsdWUgPT09IG51bGwgfHwgY2VsbFZhbHVlID09PSB1bmRlZmluZWQgfHwgY2VsbFZhbHVlID09PSAnJykpIHtcclxuICAgICAgICByZXR1cm4gY2VsbFRleHQoaCwgWEVVdGlscy5tYXAocHJvcHMubXVsdGlwbGUgPyBjZWxsVmFsdWUgOiBbY2VsbFZhbHVlXSwgb3B0aW9uR3JvdXBzID8gKHZhbHVlOiBhbnkpID0+IHtcclxuICAgICAgICAgIGxldCBzZWxlY3RJdGVtXHJcbiAgICAgICAgICBmb3IgKGxldCBpbmRleCA9IDA7IGluZGV4IDwgb3B0aW9uR3JvdXBzLmxlbmd0aDsgaW5kZXgrKykge1xyXG4gICAgICAgICAgICBzZWxlY3RJdGVtID0gWEVVdGlscy5maW5kKG9wdGlvbkdyb3Vwc1tpbmRleF1bZ3JvdXBPcHRpb25zXSwgKGl0ZW06IGFueSkgPT4gaXRlbVt2YWx1ZVByb3BdID09PSB2YWx1ZSlcclxuICAgICAgICAgICAgaWYgKHNlbGVjdEl0ZW0pIHtcclxuICAgICAgICAgICAgICBicmVha1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgICByZXR1cm4gc2VsZWN0SXRlbSA/IHNlbGVjdEl0ZW1bbGFiZWxQcm9wXSA6IG51bGxcclxuICAgICAgICB9IDogKHZhbHVlOiBhbnkpID0+IHtcclxuICAgICAgICAgIGxldCBzZWxlY3RJdGVtID0gWEVVdGlscy5maW5kKG9wdGlvbnMsIChpdGVtOiBhbnkpID0+IGl0ZW1bdmFsdWVQcm9wXSA9PT0gdmFsdWUpXHJcbiAgICAgICAgICByZXR1cm4gc2VsZWN0SXRlbSA/IHNlbGVjdEl0ZW1bbGFiZWxQcm9wXSA6IG51bGxcclxuICAgICAgICB9KS5qb2luKCc7JykpXHJcbiAgICAgIH1cclxuICAgICAgcmV0dXJuIGNlbGxUZXh0KGgsICcnKVxyXG4gICAgfSxcclxuICAgIHJlbmRlckZpbHRlcihoOiBGdW5jdGlvbiwgcmVuZGVyT3B0czogYW55LCBwYXJhbXM6IGFueSwgY29udGV4dDogYW55KSB7XHJcbiAgICAgIGxldCB7IG9wdGlvbnMsIG9wdGlvbkdyb3Vwcywgb3B0aW9uUHJvcHMgPSB7fSwgb3B0aW9uR3JvdXBQcm9wcyA9IHt9IH0gPSByZW5kZXJPcHRzXHJcbiAgICAgIGxldCB7IGNvbHVtbiB9ID0gcGFyYW1zXHJcbiAgICAgIGxldCB7IGF0dHJzLCBldmVudHMgfSA9IHJlbmRlck9wdHNcclxuICAgICAgbGV0IHByb3BzID0gZ2V0UHJvcHMocGFyYW1zLCByZW5kZXJPcHRzKVxyXG4gICAgICBsZXQgdHlwZSA9ICdvbi1jaGFuZ2UnXHJcbiAgICAgIGlmIChvcHRpb25Hcm91cHMpIHtcclxuICAgICAgICBsZXQgZ3JvdXBPcHRpb25zID0gb3B0aW9uR3JvdXBQcm9wcy5vcHRpb25zIHx8ICdvcHRpb25zJ1xyXG4gICAgICAgIGxldCBncm91cExhYmVsID0gb3B0aW9uR3JvdXBQcm9wcy5sYWJlbCB8fCAnbGFiZWwnXHJcbiAgICAgICAgcmV0dXJuIGNvbHVtbi5maWx0ZXJzLm1hcCgoaXRlbTogYW55KSA9PiB7XHJcbiAgICAgICAgICByZXR1cm4gaCgnU2VsZWN0Jywge1xyXG4gICAgICAgICAgICBwcm9wcyxcclxuICAgICAgICAgICAgYXR0cnMsXHJcbiAgICAgICAgICAgIG1vZGVsOiB7XHJcbiAgICAgICAgICAgICAgdmFsdWU6IGl0ZW0uZGF0YSxcclxuICAgICAgICAgICAgICBjYWxsYmFjayhvcHRpb25WYWx1ZTogYW55KSB7XHJcbiAgICAgICAgICAgICAgICBpdGVtLmRhdGEgPSBvcHRpb25WYWx1ZVxyXG4gICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgb246IGdldEZpbHRlckV2ZW50cyh7XHJcbiAgICAgICAgICAgICAgW3R5cGVdKHZhbHVlOiBhbnkpIHtcclxuICAgICAgICAgICAgICAgIGhhbmRsZUNvbmZpcm1GaWx0ZXIoY29udGV4dCwgY29sdW1uLCB2YWx1ZSAmJiB2YWx1ZS5sZW5ndGggPiAwLCBpdGVtKVxyXG4gICAgICAgICAgICAgICAgaWYgKGV2ZW50cyAmJiBldmVudHNbdHlwZV0pIHtcclxuICAgICAgICAgICAgICAgICAgZXZlbnRzW3R5cGVdKE9iamVjdC5hc3NpZ24oeyBjb250ZXh0IH0sIHBhcmFtcyksIHZhbHVlKVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSwgcmVuZGVyT3B0cywgcGFyYW1zLCBjb250ZXh0KVxyXG4gICAgICAgICAgfSwgWEVVdGlscy5tYXAob3B0aW9uR3JvdXBzLCAoZ3JvdXA6IGFueSwgZ0luZGV4OiBudW1iZXIpID0+IHtcclxuICAgICAgICAgICAgcmV0dXJuIGgoJ09wdGlvbkdyb3VwJywge1xyXG4gICAgICAgICAgICAgIHByb3BzOiB7XHJcbiAgICAgICAgICAgICAgICBsYWJlbDogZ3JvdXBbZ3JvdXBMYWJlbF1cclxuICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgIGtleTogZ0luZGV4XHJcbiAgICAgICAgICAgIH0sIHJlbmRlck9wdGlvbnMoaCwgZ3JvdXBbZ3JvdXBPcHRpb25zXSwgb3B0aW9uUHJvcHMpKVxyXG4gICAgICAgICAgfSkpXHJcbiAgICAgICAgfSlcclxuICAgICAgfVxyXG4gICAgICByZXR1cm4gY29sdW1uLmZpbHRlcnMubWFwKChpdGVtOiBhbnkpID0+IHtcclxuICAgICAgICByZXR1cm4gaCgnU2VsZWN0Jywge1xyXG4gICAgICAgICAgcHJvcHMsXHJcbiAgICAgICAgICBhdHRycyxcclxuICAgICAgICAgIG1vZGVsOiB7XHJcbiAgICAgICAgICAgIHZhbHVlOiBpdGVtLmRhdGEsXHJcbiAgICAgICAgICAgIGNhbGxiYWNrKG9wdGlvblZhbHVlOiBhbnkpIHtcclxuICAgICAgICAgICAgICBpdGVtLmRhdGEgPSBvcHRpb25WYWx1ZVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICB9LFxyXG4gICAgICAgICAgb246IGdldEZpbHRlckV2ZW50cyh7XHJcbiAgICAgICAgICAgIFt0eXBlXSh2YWx1ZTogYW55KSB7XHJcbiAgICAgICAgICAgICAgaGFuZGxlQ29uZmlybUZpbHRlcihjb250ZXh0LCBjb2x1bW4sIHZhbHVlICYmIHZhbHVlLmxlbmd0aCA+IDAsIGl0ZW0pXHJcbiAgICAgICAgICAgICAgaWYgKGV2ZW50cyAmJiBldmVudHNbdHlwZV0pIHtcclxuICAgICAgICAgICAgICAgIGV2ZW50c1t0eXBlXShPYmplY3QuYXNzaWduKHsgY29udGV4dCB9LCBwYXJhbXMpLCB2YWx1ZSlcclxuICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgIH0sIHJlbmRlck9wdHMsIHBhcmFtcywgY29udGV4dClcclxuICAgICAgICB9LCByZW5kZXJPcHRpb25zKGgsIG9wdGlvbnMsIG9wdGlvblByb3BzKSlcclxuICAgICAgfSlcclxuICAgIH0sXHJcbiAgICBmaWx0ZXJNZXRob2QoeyBvcHRpb24sIHJvdywgY29sdW1uIH06IGFueSkge1xyXG4gICAgICBsZXQgeyBkYXRhIH0gPSBvcHRpb25cclxuICAgICAgbGV0IHsgcHJvcGVydHksIGZpbHRlclJlbmRlcjogcmVuZGVyT3B0cyB9ID0gY29sdW1uXHJcbiAgICAgIGxldCB7IHByb3BzID0ge30gfSA9IHJlbmRlck9wdHNcclxuICAgICAgbGV0IGNlbGxWYWx1ZSA9IFhFVXRpbHMuZ2V0KHJvdywgcHJvcGVydHkpXHJcbiAgICAgIGlmIChwcm9wcy5tdWx0aXBsZSkge1xyXG4gICAgICAgIGlmIChYRVV0aWxzLmlzQXJyYXkoY2VsbFZhbHVlKSkge1xyXG4gICAgICAgICAgcmV0dXJuIFhFVXRpbHMuaW5jbHVkZUFycmF5cyhjZWxsVmFsdWUsIGRhdGEpXHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBkYXRhLmluZGV4T2YoY2VsbFZhbHVlKSA+IC0xXHJcbiAgICAgIH1cclxuICAgICAgLyogZXNsaW50LWRpc2FibGUgZXFlcWVxICovXHJcbiAgICAgIHJldHVybiBjZWxsVmFsdWUgPT0gZGF0YVxyXG4gICAgfVxyXG4gIH0sXHJcbiAgQ2FzY2FkZXI6IHtcclxuICAgIHJlbmRlckVkaXQ6IGRlZmF1bHRFZGl0UmVuZGVyLFxyXG4gICAgcmVuZGVyQ2VsbChoOiBGdW5jdGlvbiwgeyBwcm9wcyA9IHt9IH06IGFueSwgcGFyYW1zOiBhbnkpIHtcclxuICAgICAgbGV0IHsgcm93LCBjb2x1bW4gfSA9IHBhcmFtc1xyXG4gICAgICBsZXQgY2VsbFZhbHVlID0gWEVVdGlscy5nZXQocm93LCBjb2x1bW4ucHJvcGVydHkpXHJcbiAgICAgIGxldCB2YWx1ZXMgPSBjZWxsVmFsdWUgfHwgW11cclxuICAgICAgbGV0IGxhYmVsczogQXJyYXk8YW55PiA9IFtdXHJcbiAgICAgIG1hdGNoQ2FzY2FkZXJEYXRhKDAsIHByb3BzLmRhdGEsIHZhbHVlcywgbGFiZWxzKVxyXG4gICAgICByZXR1cm4gY2VsbFRleHQoaCwgbGFiZWxzLmpvaW4oYCAke3Byb3BzLnNlcGFyYXRvciB8fCAnLyd9IGApKVxyXG4gICAgfVxyXG4gIH0sXHJcbiAgRGF0ZVBpY2tlcjoge1xyXG4gICAgcmVuZGVyRWRpdDogZGVmYXVsdEVkaXRSZW5kZXIsXHJcbiAgICByZW5kZXJDZWxsKGg6IEZ1bmN0aW9uLCB7IHByb3BzID0ge30gfTogYW55LCBwYXJhbXM6IGFueSkge1xyXG4gICAgICBsZXQgeyByb3csIGNvbHVtbiB9ID0gcGFyYW1zXHJcbiAgICAgIGxldCB7IHNlcGFyYXRvciB9ID0gcHJvcHNcclxuICAgICAgbGV0IGNlbGxWYWx1ZSA9IFhFVXRpbHMuZ2V0KHJvdywgY29sdW1uLnByb3BlcnR5KVxyXG4gICAgICBzd2l0Y2ggKHByb3BzLnR5cGUpIHtcclxuICAgICAgICBjYXNlICd3ZWVrJzpcclxuICAgICAgICAgIGNlbGxWYWx1ZSA9IGdldEZvcm1hdERhdGUoY2VsbFZhbHVlLCBwcm9wcywgJ3l5eXl3V1cnKVxyXG4gICAgICAgICAgYnJlYWtcclxuICAgICAgICBjYXNlICdtb250aCc6XHJcbiAgICAgICAgICBjZWxsVmFsdWUgPSBnZXRGb3JtYXREYXRlKGNlbGxWYWx1ZSwgcHJvcHMsICd5eXl5LU1NJylcclxuICAgICAgICAgIGJyZWFrXHJcbiAgICAgICAgY2FzZSAneWVhcic6XHJcbiAgICAgICAgICBjZWxsVmFsdWUgPSBnZXRGb3JtYXREYXRlKGNlbGxWYWx1ZSwgcHJvcHMsICd5eXl5JylcclxuICAgICAgICAgIGJyZWFrXHJcbiAgICAgICAgY2FzZSAnZGF0ZXMnOlxyXG4gICAgICAgICAgY2VsbFZhbHVlID0gZ2V0Rm9ybWF0RGF0ZXMoY2VsbFZhbHVlLCBwcm9wcywgJywgJywgJ3l5eXktTU0tZGQnKVxyXG4gICAgICAgICAgYnJlYWtcclxuICAgICAgICBjYXNlICdkYXRlcmFuZ2UnOlxyXG4gICAgICAgICAgY2VsbFZhbHVlID0gZ2V0Rm9ybWF0RGF0ZXMoY2VsbFZhbHVlLCBwcm9wcywgYCAke3NlcGFyYXRvciB8fCAnLSd9IGAsICd5eXl5LU1NLWRkJylcclxuICAgICAgICAgIGJyZWFrXHJcbiAgICAgICAgY2FzZSAnZGF0ZXRpbWVyYW5nZSc6XHJcbiAgICAgICAgICBjZWxsVmFsdWUgPSBnZXRGb3JtYXREYXRlcyhjZWxsVmFsdWUsIHByb3BzLCBgICR7c2VwYXJhdG9yIHx8ICctJ30gYCwgJ3l5eXktTU0tZGQgSEg6c3M6bW0nKVxyXG4gICAgICAgICAgYnJlYWtcclxuICAgICAgICBkZWZhdWx0OlxyXG4gICAgICAgICAgY2VsbFZhbHVlID0gZ2V0Rm9ybWF0RGF0ZShjZWxsVmFsdWUsIHByb3BzLCAneXl5eS1NTS1kZCcpXHJcbiAgICAgICAgICBicmVha1xyXG4gICAgICB9XHJcbiAgICAgIHJldHVybiBjZWxsVGV4dChoLCBjZWxsVmFsdWUpXHJcbiAgICB9LFxyXG4gICAgcmVuZGVyRmlsdGVyKGg6IEZ1bmN0aW9uLCByZW5kZXJPcHRzOiBhbnksIHBhcmFtczogYW55LCBjb250ZXh0OiBhbnkpIHtcclxuICAgICAgbGV0IHsgY29sdW1uIH0gPSBwYXJhbXNcclxuICAgICAgbGV0IHsgYXR0cnMsIGV2ZW50cyB9ID0gcmVuZGVyT3B0c1xyXG4gICAgICBsZXQgcHJvcHMgPSBnZXRQcm9wcyhwYXJhbXMsIHJlbmRlck9wdHMpXHJcbiAgICAgIGxldCB0eXBlID0gJ29uLWNoYW5nZSdcclxuICAgICAgcmV0dXJuIGNvbHVtbi5maWx0ZXJzLm1hcCgoaXRlbTogYW55KSA9PiB7XHJcbiAgICAgICAgcmV0dXJuIGgocmVuZGVyT3B0cy5uYW1lLCB7XHJcbiAgICAgICAgICBwcm9wcyxcclxuICAgICAgICAgIGF0dHJzLFxyXG4gICAgICAgICAgbW9kZWw6IHtcclxuICAgICAgICAgICAgdmFsdWU6IGl0ZW0uZGF0YSxcclxuICAgICAgICAgICAgY2FsbGJhY2sob3B0aW9uVmFsdWU6IGFueSkge1xyXG4gICAgICAgICAgICAgIGl0ZW0uZGF0YSA9IG9wdGlvblZhbHVlXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgIH0sXHJcbiAgICAgICAgICBvbjogZ2V0RmlsdGVyRXZlbnRzKHtcclxuICAgICAgICAgICAgW3R5cGVdKHZhbHVlOiBhbnkpIHtcclxuICAgICAgICAgICAgICBoYW5kbGVDb25maXJtRmlsdGVyKGNvbnRleHQsIGNvbHVtbiwgISF2YWx1ZSwgaXRlbSlcclxuICAgICAgICAgICAgICBpZiAoZXZlbnRzICYmIGV2ZW50c1t0eXBlXSkge1xyXG4gICAgICAgICAgICAgICAgZXZlbnRzW3R5cGVdKE9iamVjdC5hc3NpZ24oeyBjb250ZXh0IH0sIHBhcmFtcyksIHZhbHVlKVxyXG4gICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgfSwgcmVuZGVyT3B0cywgcGFyYW1zLCBjb250ZXh0KVxyXG4gICAgICAgIH0pXHJcbiAgICAgIH0pXHJcbiAgICB9LFxyXG4gICAgZmlsdGVyTWV0aG9kKHsgb3B0aW9uLCByb3csIGNvbHVtbiB9OiBhbnkpIHtcclxuICAgICAgbGV0IHsgZGF0YSB9ID0gb3B0aW9uXHJcbiAgICAgIGxldCB7IGZpbHRlclJlbmRlcjogcmVuZGVyT3B0cyB9ID0gY29sdW1uXHJcbiAgICAgIGxldCB7IHByb3BzID0ge30gfSA9IHJlbmRlck9wdHNcclxuICAgICAgbGV0IGNlbGxWYWx1ZSA9IFhFVXRpbHMuZ2V0KHJvdywgY29sdW1uLnByb3BlcnR5KVxyXG4gICAgICBpZiAoZGF0YSkge1xyXG4gICAgICAgIHN3aXRjaCAocHJvcHMudHlwZSkge1xyXG4gICAgICAgICAgY2FzZSAnZGF0ZXJhbmdlJzpcclxuICAgICAgICAgICAgcmV0dXJuIGVxdWFsRGF0ZXJhbmdlKGNlbGxWYWx1ZSwgZGF0YSwgcHJvcHMsICd5eXl5LU1NLWRkJylcclxuICAgICAgICAgIGNhc2UgJ2RhdGV0aW1lcmFuZ2UnOlxyXG4gICAgICAgICAgICByZXR1cm4gZXF1YWxEYXRlcmFuZ2UoY2VsbFZhbHVlLCBkYXRhLCBwcm9wcywgJ3l5eXktTU0tZGQgSEg6c3M6bW0nKVxyXG4gICAgICAgICAgZGVmYXVsdDpcclxuICAgICAgICAgICAgcmV0dXJuIGNlbGxWYWx1ZSA9PT0gZGF0YVxyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgICByZXR1cm4gZmFsc2VcclxuICAgIH1cclxuICB9LFxyXG4gIFRpbWVQaWNrZXI6IHtcclxuICAgIHJlbmRlckVkaXQ6IGRlZmF1bHRFZGl0UmVuZGVyXHJcbiAgfSxcclxuICBSYXRlOiB7XHJcbiAgICByZW5kZXJEZWZhdWx0OiBkZWZhdWx0RWRpdFJlbmRlcixcclxuICAgIHJlbmRlckVkaXQ6IGRlZmF1bHRFZGl0UmVuZGVyLFxyXG4gICAgcmVuZGVyRmlsdGVyOiBkZWZhdWx0RmlsdGVyUmVuZGVyLFxyXG4gICAgZmlsdGVyTWV0aG9kOiBkZWZhdWx0RmlsdGVyTWV0aG9kXHJcbiAgfSxcclxuICBpU3dpdGNoOiB7XHJcbiAgICByZW5kZXJEZWZhdWx0OiBkZWZhdWx0RWRpdFJlbmRlcixcclxuICAgIHJlbmRlckVkaXQ6IGRlZmF1bHRFZGl0UmVuZGVyLFxyXG4gICAgcmVuZGVyRmlsdGVyOiBkZWZhdWx0RmlsdGVyUmVuZGVyLFxyXG4gICAgZmlsdGVyTWV0aG9kOiBkZWZhdWx0RmlsdGVyTWV0aG9kXHJcbiAgfVxyXG59XHJcblxyXG4vKipcclxuICog5LqL5Lu25YW85a655oCn5aSE55CGXHJcbiAqL1xyXG5mdW5jdGlvbiBoYW5kbGVDbGVhckV2ZW50KHBhcmFtczogYW55LCBldm50OiBhbnksIGNvbnRleHQ6IGFueSkge1xyXG4gIGxldCB7IGdldEV2ZW50VGFyZ2V0Tm9kZSB9ID0gY29udGV4dFxyXG4gIGxldCBib2R5RWxlbSA9IGRvY3VtZW50LmJvZHlcclxuICBpZiAoXHJcbiAgICAvLyDkuIvmi4nmoYbjgIHml6XmnJ9cclxuICAgIGdldEV2ZW50VGFyZ2V0Tm9kZShldm50LCBib2R5RWxlbSwgJ2l2dS1zZWxlY3QtZHJvcGRvd24nKS5mbGFnXHJcbiAgKSB7XHJcbiAgICByZXR1cm4gZmFsc2VcclxuICB9XHJcbn1cclxuXHJcbi8qKlxyXG4gKiDln7rkuo4gdnhlLXRhYmxlIOihqOagvOeahOmAgumFjeaPkuS7tu+8jOeUqOS6juWFvOWuuSBpdmlldyDnu4Tku7blupNcclxuICovXHJcbmV4cG9ydCBjb25zdCBWWEVUYWJsZVBsdWdpbklWaWV3ID0ge1xyXG4gIGluc3RhbGwoeHRhYmxlOiB0eXBlb2YgVlhFVGFibGUpIHtcclxuICAgIGxldCB7IGludGVyY2VwdG9yLCByZW5kZXJlciB9ID0geHRhYmxlXHJcbiAgICByZW5kZXJlci5taXhpbihyZW5kZXJNYXApXHJcbiAgICBpbnRlcmNlcHRvci5hZGQoJ2V2ZW50LmNsZWFyRmlsdGVyJywgaGFuZGxlQ2xlYXJFdmVudClcclxuICAgIGludGVyY2VwdG9yLmFkZCgnZXZlbnQuY2xlYXJBY3RpdmVkJywgaGFuZGxlQ2xlYXJFdmVudClcclxuICB9XHJcbn1cclxuXHJcbmlmICh0eXBlb2Ygd2luZG93ICE9PSAndW5kZWZpbmVkJyAmJiB3aW5kb3cuVlhFVGFibGUpIHtcclxuICB3aW5kb3cuVlhFVGFibGUudXNlKFZYRVRhYmxlUGx1Z2luSVZpZXcpXHJcbn1cclxuXHJcbmV4cG9ydCBkZWZhdWx0IFZYRVRhYmxlUGx1Z2luSVZpZXdcclxuIl19
