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

function createFormItemRender(defaultProps) {
  return function (h, renderOpts, params, context) {
    var data = params.data,
        field = params.field;
    var name = renderOpts.name;
    var attrs = renderOpts.attrs;
    var props = getFormProps(context, renderOpts, defaultProps);
    return [h(name, {
      attrs: attrs,
      props: props,
      model: {
        value: _xeUtils["default"].get(data, field),
        callback: function callback(value) {
          _xeUtils["default"].set(data, field, value);
        }
      },
      on: getFormEvents(renderOpts, params, context)
    })];
  };
}

function getFormProps(_ref4, _ref5, defaultProps) {
  var $form = _ref4.$form;
  var props = _ref5.props;
  return _xeUtils["default"].assign($form.vSize ? {
    size: $form.vSize
  } : {}, defaultProps, props);
}

function getFormEvents(renderOpts, params, context) {
  var events = renderOpts.events;
  var on;

  if (events) {
    on = _xeUtils["default"].assign({}, _xeUtils["default"].objectMap(events, function (cb) {
      return function () {
        for (var _len3 = arguments.length, args = new Array(_len3), _key3 = 0; _key3 < _len3; _key3++) {
          args[_key3] = arguments[_key3];
        }

        cb.apply(null, [params].concat.apply(params, args));
      };
    }), on);
  }

  return on;
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
    filterMethod: function filterMethod(_ref6) {
      var option = _ref6.option,
          row = _ref6.row,
          column = _ref6.column;
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
    },
    renderItem: function renderItem(h, renderOpts, params, context) {
      var options = renderOpts.options,
          optionGroups = renderOpts.optionGroups,
          _renderOpts$optionPro4 = renderOpts.optionProps,
          optionProps = _renderOpts$optionPro4 === void 0 ? {} : _renderOpts$optionPro4,
          _renderOpts$optionGro4 = renderOpts.optionGroupProps,
          optionGroupProps = _renderOpts$optionGro4 === void 0 ? {} : _renderOpts$optionGro4;
      var data = params.data,
          property = params.property;
      var attrs = renderOpts.attrs;
      var props = getFormProps(context, renderOpts);

      if (optionGroups) {
        var groupOptions = optionGroupProps.options || 'options';
        var groupLabel = optionGroupProps.label || 'label';
        return [h('Select', {
          props: props,
          attrs: attrs,
          model: {
            value: _xeUtils["default"].get(data, property),
            callback: function callback(cellValue) {
              _xeUtils["default"].set(data, property, cellValue);
            }
          },
          on: getFormEvents(renderOpts, params, context)
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
          value: _xeUtils["default"].get(data, property),
          callback: function callback(cellValue) {
            _xeUtils["default"].set(data, property, cellValue);
          }
        },
        on: getFormEvents(renderOpts, params, context)
      }, renderOptions(h, options, optionProps))];
    }
  },
  Cascader: {
    renderEdit: createEditRender({
      transfer: true
    }),
    renderCell: function renderCell(h, _ref7, params) {
      var _ref7$props = _ref7.props,
          props = _ref7$props === void 0 ? {} : _ref7$props;
      var row = params.row,
          column = params.column;

      var cellValue = _xeUtils["default"].get(row, column.property);

      var values = cellValue || [];
      var labels = [];
      matchCascaderData(0, props.data, values, labels);
      return cellText(h, labels.join(" ".concat(props.separator || '/', " ")));
    },
    renderItem: createFormItemRender()
  },
  DatePicker: {
    renderEdit: createEditRender({
      transfer: true
    }),
    renderCell: function renderCell(h, _ref8, params) {
      var _ref8$props = _ref8.props,
          props = _ref8$props === void 0 ? {} : _ref8$props;
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
    filterMethod: function filterMethod(_ref9) {
      var option = _ref9.option,
          row = _ref9.row,
          column = _ref9.column;
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
    },
    renderItem: createFormItemRender()
  },
  TimePicker: {
    renderEdit: createEditRender({
      transfer: true
    }),
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
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImluZGV4LnRzIl0sIm5hbWVzIjpbImdldEZvcm1hdERhdGUiLCJ2YWx1ZSIsInByb3BzIiwiZGVmYXVsdEZvcm1hdCIsIlhFVXRpbHMiLCJ0b0RhdGVTdHJpbmciLCJmb3JtYXQiLCJnZXRGb3JtYXREYXRlcyIsInZhbHVlcyIsInNlcGFyYXRvciIsIm1hcCIsImRhdGUiLCJqb2luIiwiZXF1YWxEYXRlcmFuZ2UiLCJjZWxsVmFsdWUiLCJkYXRhIiwibWF0Y2hDYXNjYWRlckRhdGEiLCJpbmRleCIsImxpc3QiLCJsYWJlbHMiLCJ2YWwiLCJsZW5ndGgiLCJlYWNoIiwiaXRlbSIsInB1c2giLCJsYWJlbCIsImNoaWxkcmVuIiwiZ2V0UHJvcHMiLCJkZWZhdWx0UHJvcHMiLCIkdGFibGUiLCJhc3NpZ24iLCJ2U2l6ZSIsInNpemUiLCJnZXRDZWxsRXZlbnRzIiwicmVuZGVyT3B0cyIsInBhcmFtcyIsImV2ZW50cyIsInR5cGUiLCJvbiIsInVwZGF0ZVN0YXR1cyIsIm9iamVjdE1hcCIsImNiIiwiYXJncyIsImFwcGx5IiwiY29uY2F0IiwiY3JlYXRlRWRpdFJlbmRlciIsImgiLCJyb3ciLCJjb2x1bW4iLCJhdHRycyIsIm5hbWUiLCJtb2RlbCIsImdldCIsInByb3BlcnR5IiwiY2FsbGJhY2siLCJzZXQiLCJnZXRGaWx0ZXJFdmVudHMiLCJjb250ZXh0IiwiT2JqZWN0IiwiY3JlYXRlRmlsdGVyUmVuZGVyIiwiZmlsdGVycyIsIm9wdGlvblZhbHVlIiwiZXZudCIsImhhbmRsZUNvbmZpcm1GaWx0ZXIiLCJjaGVja2VkIiwiZmlsdGVyTXVsdGlwbGUiLCJkZWZhdWx0RmlsdGVyTWV0aG9kIiwib3B0aW9uIiwicmVuZGVyT3B0aW9ucyIsIm9wdGlvbnMiLCJvcHRpb25Qcm9wcyIsImxhYmVsUHJvcCIsInZhbHVlUHJvcCIsImRpc2FibGVkUHJvcCIsImRpc2FibGVkIiwia2V5IiwiY2VsbFRleHQiLCJjcmVhdGVGb3JtSXRlbVJlbmRlciIsImZpZWxkIiwiZ2V0Rm9ybVByb3BzIiwiZ2V0Rm9ybUV2ZW50cyIsIiRmb3JtIiwicmVuZGVyTWFwIiwiSW5wdXQiLCJhdXRvZm9jdXMiLCJyZW5kZXJEZWZhdWx0IiwicmVuZGVyRWRpdCIsInJlbmRlckZpbHRlciIsImZpbHRlck1ldGhvZCIsInJlbmRlckl0ZW0iLCJBdXRvQ29tcGxldGUiLCJJbnB1dE51bWJlciIsIlNlbGVjdCIsIm9wdGlvbkdyb3VwcyIsIm9wdGlvbkdyb3VwUHJvcHMiLCJ0cmFuc2ZlciIsImdyb3VwT3B0aW9ucyIsImdyb3VwTGFiZWwiLCJncm91cCIsImdJbmRleCIsInJlbmRlckNlbGwiLCJjb2xpZCIsImlkIiwicmVzdCIsImNlbGxEYXRhIiwiZmlsdGVyYWJsZSIsImZ1bGxBbGxEYXRhUm93TWFwIiwiY2FjaGVDZWxsIiwiaGFzIiwidW5kZWZpbmVkIiwibXVsdGlwbGUiLCJzZWxlY3RJdGVtIiwiZmluZCIsImNlbGxMYWJlbCIsImZpbHRlclJlbmRlciIsImlzQXJyYXkiLCJpbmNsdWRlQXJyYXlzIiwiaW5kZXhPZiIsIkNhc2NhZGVyIiwiRGF0ZVBpY2tlciIsIlRpbWVQaWNrZXIiLCJSYXRlIiwiaVN3aXRjaCIsImhhbmRsZUNsZWFyRXZlbnQiLCJnZXRFdmVudFRhcmdldE5vZGUiLCJib2R5RWxlbSIsImRvY3VtZW50IiwiYm9keSIsImZsYWciLCJWWEVUYWJsZVBsdWdpbklWaWV3IiwiaW5zdGFsbCIsInh0YWJsZSIsImludGVyY2VwdG9yIiwicmVuZGVyZXIiLCJtaXhpbiIsImFkZCIsIndpbmRvdyIsIlZYRVRhYmxlIiwidXNlIl0sIm1hcHBpbmdzIjoiOzs7Ozs7O0FBQUE7Ozs7OztBQUdBLFNBQVNBLGFBQVQsQ0FBd0JDLEtBQXhCLEVBQW9DQyxLQUFwQyxFQUFnREMsYUFBaEQsRUFBcUU7QUFDbkUsU0FBT0Msb0JBQVFDLFlBQVIsQ0FBcUJKLEtBQXJCLEVBQTRCQyxLQUFLLENBQUNJLE1BQU4sSUFBZ0JILGFBQTVDLENBQVA7QUFDRDs7QUFFRCxTQUFTSSxjQUFULENBQXlC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QixDQUFDOUQsSUFBRCxFQUFPK0QsUUFBUCxFQUFpQixxQkFBakIsQ0FBbEIsQ0FBMERHLElBRjVELEVBR0U7QUFDQSxXQUFPLEtBQVA7QUFDRDtBQUNGO0FBRUQ7Ozs7O0FBR08sSUFBTUMsbUJBQW1CLEdBQUc7QUFDakNDLEVBQUFBLE9BRGlDLG1CQUN4QkMsTUFEd0IsRUFDRDtBQUFBLFFBQ3hCQyxXQUR3QixHQUNFRCxNQURGLENBQ3hCQyxXQUR3QjtBQUFBLFFBQ1hDLFFBRFcsR0FDRUYsTUFERixDQUNYRSxRQURXO0FBRTlCQSxJQUFBQSxRQUFRLENBQUNDLEtBQVQsQ0FBZXBELFNBQWY7QUFDQWtELElBQUFBLFdBQVcsQ0FBQ0csR0FBWixDQUFnQixtQkFBaEIsRUFBcUNaLGdCQUFyQztBQUNBUyxJQUFBQSxXQUFXLENBQUNHLEdBQVosQ0FBZ0Isb0JBQWhCLEVBQXNDWixnQkFBdEM7QUFDRDtBQU5nQyxDQUE1Qjs7O0FBU1AsSUFBSSxPQUFPYSxNQUFQLEtBQWtCLFdBQWxCLElBQWlDQSxNQUFNLENBQUNDLFFBQTVDLEVBQXNEO0FBQ3BERCxFQUFBQSxNQUFNLENBQUNDLFFBQVAsQ0FBZ0JDLEdBQWhCLENBQW9CVCxtQkFBcEI7QUFDRDs7ZUFFY0EsbUIiLCJmaWxlIjoiaW5kZXguY29tbW9uLmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IFhFVXRpbHMgZnJvbSAneGUtdXRpbHMvbWV0aG9kcy94ZS11dGlscydcclxuaW1wb3J0IFZYRVRhYmxlIGZyb20gJ3Z4ZS10YWJsZS9saWIvdnhlLXRhYmxlJ1xyXG5cclxuZnVuY3Rpb24gZ2V0Rm9ybWF0RGF0ZSAodmFsdWU6IGFueSwgcHJvcHM6IGFueSwgZGVmYXVsdEZvcm1hdDogc3RyaW5nKSB7XHJcbiAgcmV0dXJuIFhFVXRpbHMudG9EYXRlU3RyaW5nKHZhbHVlLCBwcm9wcy5mb3JtYXQgfHwgZGVmYXVsdEZvcm1hdClcclxufVxyXG5cclxuZnVuY3Rpb24gZ2V0Rm9ybWF0RGF0ZXMgKHZhbHVlczogYW55LCBwcm9wczogYW55LCBzZXBhcmF0b3I6IHN0cmluZywgZGVmYXVsdEZvcm1hdDogc3RyaW5nKSB7XHJcbiAgcmV0dXJuIFhFVXRpbHMubWFwKHZhbHVlcywgKGRhdGU6IGFueSkgPT4gZ2V0Rm9ybWF0RGF0ZShkYXRlLCBwcm9wcywgZGVmYXVsdEZvcm1hdCkpLmpvaW4oc2VwYXJhdG9yKVxyXG59XHJcblxyXG5mdW5jdGlvbiBlcXVhbERhdGVyYW5nZSAoY2VsbFZhbHVlOiBhbnksIGRhdGE6IGFueSwgcHJvcHM6IGFueSwgZGVmYXVsdEZvcm1hdDogc3RyaW5nKSB7XHJcbiAgY2VsbFZhbHVlID0gZ2V0Rm9ybWF0RGF0ZShjZWxsVmFsdWUsIHByb3BzLCBkZWZhdWx0Rm9ybWF0KVxyXG4gIHJldHVybiBjZWxsVmFsdWUgPj0gZ2V0Rm9ybWF0RGF0ZShkYXRhWzBdLCBwcm9wcywgZGVmYXVsdEZvcm1hdCkgJiYgY2VsbFZhbHVlIDw9IGdldEZvcm1hdERhdGUoZGF0YVsxXSwgcHJvcHMsIGRlZmF1bHRGb3JtYXQpXHJcbn1cclxuXHJcbmZ1bmN0aW9uIG1hdGNoQ2FzY2FkZXJEYXRhIChpbmRleDogbnVtYmVyLCBsaXN0OiBBcnJheTxhbnk+LCB2YWx1ZXM6IEFycmF5PGFueT4sIGxhYmVsczogQXJyYXk8YW55Pikge1xyXG4gIGxldCB2YWwgPSB2YWx1ZXNbaW5kZXhdXHJcbiAgaWYgKGxpc3QgJiYgdmFsdWVzLmxlbmd0aCA+IGluZGV4KSB7XHJcbiAgICBYRVV0aWxzLmVhY2gobGlzdCwgKGl0ZW06IGFueSkgPT4ge1xyXG4gICAgICBpZiAoaXRlbS52YWx1ZSA9PT0gdmFsKSB7XHJcbiAgICAgICAgbGFiZWxzLnB1c2goaXRlbS5sYWJlbClcclxuICAgICAgICBtYXRjaENhc2NhZGVyRGF0YSgrK2luZGV4LCBpdGVtLmNoaWxkcmVuLCB2YWx1ZXMsIGxhYmVscylcclxuICAgICAgfVxyXG4gICAgfSlcclxuICB9XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGdldFByb3BzICh7ICR0YWJsZSB9OiBhbnksIHsgcHJvcHMgfTogYW55LCBkZWZhdWx0UHJvcHM/OiBhbnkpIHtcclxuICByZXR1cm4gWEVVdGlscy5hc3NpZ24oJHRhYmxlLnZTaXplID8geyBzaXplOiAkdGFibGUudlNpemUgfSA6IHt9LCBkZWZhdWx0UHJvcHMsIHByb3BzKVxyXG59XHJcblxyXG5mdW5jdGlvbiBnZXRDZWxsRXZlbnRzIChyZW5kZXJPcHRzOiBhbnksIHBhcmFtczogYW55KSB7XHJcbiAgbGV0IHsgZXZlbnRzIH0gPSByZW5kZXJPcHRzXHJcbiAgbGV0IHsgJHRhYmxlIH0gPSBwYXJhbXNcclxuICBsZXQgdHlwZSA9ICdvbi1jaGFuZ2UnXHJcbiAgbGV0IG9uID0ge1xyXG4gICAgW3R5cGVdOiAoKSA9PiAkdGFibGUudXBkYXRlU3RhdHVzKHBhcmFtcylcclxuICB9XHJcbiAgaWYgKGV2ZW50cykge1xyXG4gICAgcmV0dXJuIFhFVXRpbHMuYXNzaWduKHt9LCBYRVV0aWxzLm9iamVjdE1hcChldmVudHMsIChjYjogRnVuY3Rpb24pID0+IGZ1bmN0aW9uICguLi5hcmdzOiBhbnlbXSkge1xyXG4gICAgICBjYi5hcHBseShudWxsLCBbcGFyYW1zXS5jb25jYXQuYXBwbHkocGFyYW1zLCBhcmdzKSlcclxuICAgIH0pLCBvbilcclxuICB9XHJcbiAgcmV0dXJuIG9uXHJcbn1cclxuXHJcbmZ1bmN0aW9uIGNyZWF0ZUVkaXRSZW5kZXIgKGRlZmF1bHRQcm9wcz86IGFueSkge1xyXG4gIHJldHVybiBmdW5jdGlvbiAoaDogRnVuY3Rpb24sIHJlbmRlck9wdHM6IGFueSwgcGFyYW1zOiBhbnkpIHtcclxuICAgIGxldCB7IHJvdywgY29sdW1uIH0gPSBwYXJhbXNcclxuICAgIGxldCB7IGF0dHJzIH0gPSByZW5kZXJPcHRzXHJcbiAgICBsZXQgcHJvcHMgPSBnZXRQcm9wcyhwYXJhbXMsIHJlbmRlck9wdHMsIGRlZmF1bHRQcm9wcylcclxuICAgIHJldHVybiBbXHJcbiAgICAgIGgocmVuZGVyT3B0cy5uYW1lLCB7XHJcbiAgICAgICAgcHJvcHMsXHJcbiAgICAgICAgYXR0cnMsXHJcbiAgICAgICAgbW9kZWw6IHtcclxuICAgICAgICAgIHZhbHVlOiBYRVV0aWxzLmdldChyb3csIGNvbHVtbi5wcm9wZXJ0eSksXHJcbiAgICAgICAgICBjYWxsYmFjayAodmFsdWU6IGFueSkge1xyXG4gICAgICAgICAgICBYRVV0aWxzLnNldChyb3csIGNvbHVtbi5wcm9wZXJ0eSwgdmFsdWUpXHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfSxcclxuICAgICAgICBvbjogZ2V0Q2VsbEV2ZW50cyhyZW5kZXJPcHRzLCBwYXJhbXMpXHJcbiAgICAgIH0pXHJcbiAgICBdXHJcbiAgfVxyXG59XHJcblxyXG5mdW5jdGlvbiBnZXRGaWx0ZXJFdmVudHMgKG9uOiBhbnksIHJlbmRlck9wdHM6IGFueSwgcGFyYW1zOiBhbnksIGNvbnRleHQ6IGFueSkge1xyXG4gIGxldCB7IGV2ZW50cyB9ID0gcmVuZGVyT3B0c1xyXG4gIGlmIChldmVudHMpIHtcclxuICAgIHJldHVybiBYRVV0aWxzLmFzc2lnbih7fSwgWEVVdGlscy5vYmplY3RNYXAoZXZlbnRzLCAoY2I6IEZ1bmN0aW9uKSA9PiBmdW5jdGlvbiAoLi4uYXJnczogYW55W10pIHtcclxuICAgICAgcGFyYW1zID0gT2JqZWN0LmFzc2lnbih7IGNvbnRleHQgfSwgcGFyYW1zKVxyXG4gICAgICBjYi5hcHBseShudWxsLCBbcGFyYW1zXS5jb25jYXQuYXBwbHkocGFyYW1zLCBhcmdzKSlcclxuICAgIH0pLCBvbilcclxuICB9XHJcbiAgcmV0dXJuIG9uXHJcbn1cclxuXHJcbmZ1bmN0aW9uIGNyZWF0ZUZpbHRlclJlbmRlciAoZGVmYXVsdFByb3BzPzogYW55KSB7XHJcbiAgcmV0dXJuIGZ1bmN0aW9uIChoOiBGdW5jdGlvbiwgcmVuZGVyT3B0czogYW55LCBwYXJhbXM6IGFueSwgY29udGV4dDogYW55KSB7XHJcbiAgICBsZXQgeyBjb2x1bW4gfSA9IHBhcmFtc1xyXG4gICAgbGV0IHsgbmFtZSwgYXR0cnMsIGV2ZW50cyB9ID0gcmVuZGVyT3B0c1xyXG4gICAgbGV0IHR5cGUgPSAnb24tY2hhbmdlJ1xyXG4gICAgbGV0IHByb3BzID0gZ2V0UHJvcHMocGFyYW1zLCByZW5kZXJPcHRzKVxyXG4gICAgcmV0dXJuIGNvbHVtbi5maWx0ZXJzLm1hcCgoaXRlbTogYW55KSA9PiB7XHJcbiAgICAgIHJldHVybiBoKG5hbWUsIHtcclxuICAgICAgICBwcm9wcyxcclxuICAgICAgICBhdHRycyxcclxuICAgICAgICBtb2RlbDoge1xyXG4gICAgICAgICAgdmFsdWU6IGl0ZW0uZGF0YSxcclxuICAgICAgICAgIGNhbGxiYWNrIChvcHRpb25WYWx1ZTogYW55KSB7XHJcbiAgICAgICAgICAgIGl0ZW0uZGF0YSA9IG9wdGlvblZhbHVlXHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfSxcclxuICAgICAgICBvbjogZ2V0RmlsdGVyRXZlbnRzKHtcclxuICAgICAgICAgIFt0eXBlXSAoZXZudDogYW55KSB7XHJcbiAgICAgICAgICAgIGhhbmRsZUNvbmZpcm1GaWx0ZXIoY29udGV4dCwgY29sdW1uLCAhIWl0ZW0uZGF0YSwgaXRlbSlcclxuICAgICAgICAgICAgaWYgKGV2ZW50cyAmJiBldmVudHNbdHlwZV0pIHtcclxuICAgICAgICAgICAgICBldmVudHNbdHlwZV0oT2JqZWN0LmFzc2lnbih7IGNvbnRleHQgfSwgcGFyYW1zKSwgZXZudClcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH0sIHJlbmRlck9wdHMsIHBhcmFtcywgY29udGV4dClcclxuICAgICAgfSlcclxuICAgIH0pXHJcbiAgfVxyXG59XHJcblxyXG5mdW5jdGlvbiBoYW5kbGVDb25maXJtRmlsdGVyIChjb250ZXh0OiBhbnksIGNvbHVtbjogYW55LCBjaGVja2VkOiBhbnksIGl0ZW06IGFueSkge1xyXG4gIGNvbnRleHRbY29sdW1uLmZpbHRlck11bHRpcGxlID8gJ2NoYW5nZU11bHRpcGxlT3B0aW9uJyA6ICdjaGFuZ2VSYWRpb09wdGlvbiddKHt9LCBjaGVja2VkLCBpdGVtKVxyXG59XHJcblxyXG5mdW5jdGlvbiBkZWZhdWx0RmlsdGVyTWV0aG9kICh7IG9wdGlvbiwgcm93LCBjb2x1bW4gfTogYW55KSB7XHJcbiAgbGV0IHsgZGF0YSB9ID0gb3B0aW9uXHJcbiAgbGV0IGNlbGxWYWx1ZSA9IFhFVXRpbHMuZ2V0KHJvdywgY29sdW1uLnByb3BlcnR5KVxyXG4gIC8qIGVzbGludC1kaXNhYmxlIGVxZXFlcSAqL1xyXG4gIHJldHVybiBjZWxsVmFsdWUgPT09IGRhdGFcclxufVxyXG5cclxuZnVuY3Rpb24gcmVuZGVyT3B0aW9ucyAoaDogRnVuY3Rpb24sIG9wdGlvbnM6IGFueSwgb3B0aW9uUHJvcHM6IGFueSkge1xyXG4gIGxldCBsYWJlbFByb3AgPSBvcHRpb25Qcm9wcy5sYWJlbCB8fCAnbGFiZWwnXHJcbiAgbGV0IHZhbHVlUHJvcCA9IG9wdGlvblByb3BzLnZhbHVlIHx8ICd2YWx1ZSdcclxuICBsZXQgZGlzYWJsZWRQcm9wID0gb3B0aW9uUHJvcHMuZGlzYWJsZWQgfHwgJ2Rpc2FibGVkJ1xyXG4gIHJldHVybiBYRVV0aWxzLm1hcChvcHRpb25zLCAoaXRlbTogYW55LCBpbmRleDogbnVtYmVyKSA9PiB7XHJcbiAgICByZXR1cm4gaCgnT3B0aW9uJywge1xyXG4gICAgICBwcm9wczoge1xyXG4gICAgICAgIHZhbHVlOiBpdGVtW3ZhbHVlUHJvcF0sXHJcbiAgICAgICAgbGFiZWw6IGl0ZW1bbGFiZWxQcm9wXSxcclxuICAgICAgICBkaXNhYmxlZDogaXRlbVtkaXNhYmxlZFByb3BdXHJcbiAgICAgIH0sXHJcbiAgICAgIGtleTogaW5kZXhcclxuICAgIH0pXHJcbiAgfSlcclxufVxyXG5cclxuZnVuY3Rpb24gY2VsbFRleHQgKGg6IEZ1bmN0aW9uLCBjZWxsVmFsdWU6IGFueSkge1xyXG4gIHJldHVybiBbJycgKyAoY2VsbFZhbHVlID09PSBudWxsIHx8IGNlbGxWYWx1ZSA9PT0gdm9pZCAwID8gJycgOiBjZWxsVmFsdWUpXVxyXG59XHJcblxyXG5mdW5jdGlvbiBjcmVhdGVGb3JtSXRlbVJlbmRlciAoZGVmYXVsdFByb3BzPzogYW55KSB7XHJcbiAgcmV0dXJuIGZ1bmN0aW9uIChoOiBGdW5jdGlvbiwgcmVuZGVyT3B0czogYW55LCBwYXJhbXM6IGFueSwgY29udGV4dDogYW55KSB7XHJcbiAgICBsZXQgeyBkYXRhLCBmaWVsZCB9ID0gcGFyYW1zXHJcbiAgICBsZXQgeyBuYW1lIH0gPSByZW5kZXJPcHRzXHJcbiAgICBsZXQgeyBhdHRycyB9OiBhbnkgPSByZW5kZXJPcHRzXHJcbiAgICBsZXQgcHJvcHM6IGFueSA9IGdldEZvcm1Qcm9wcyhjb250ZXh0LCByZW5kZXJPcHRzLCBkZWZhdWx0UHJvcHMpXHJcbiAgICByZXR1cm4gW1xyXG4gICAgICBoKG5hbWUsIHtcclxuICAgICAgICBhdHRycyxcclxuICAgICAgICBwcm9wcyxcclxuICAgICAgICBtb2RlbDoge1xyXG4gICAgICAgICAgdmFsdWU6IFhFVXRpbHMuZ2V0KGRhdGEsIGZpZWxkKSxcclxuICAgICAgICAgIGNhbGxiYWNrICh2YWx1ZTogYW55KSB7XHJcbiAgICAgICAgICAgIFhFVXRpbHMuc2V0KGRhdGEsIGZpZWxkLCB2YWx1ZSlcclxuICAgICAgICAgIH1cclxuICAgICAgICB9LFxyXG4gICAgICAgIG9uOiBnZXRGb3JtRXZlbnRzKHJlbmRlck9wdHMsIHBhcmFtcywgY29udGV4dClcclxuICAgICAgfSlcclxuICAgIF1cclxuICB9XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGdldEZvcm1Qcm9wcyAoeyAkZm9ybSB9OiBhbnksIHsgcHJvcHMgfTogYW55LCBkZWZhdWx0UHJvcHM/OiBhbnkpIHtcclxuICByZXR1cm4gWEVVdGlscy5hc3NpZ24oJGZvcm0udlNpemUgPyB7IHNpemU6ICRmb3JtLnZTaXplIH0gOiB7fSwgZGVmYXVsdFByb3BzLCBwcm9wcylcclxufVxyXG5cclxuZnVuY3Rpb24gZ2V0Rm9ybUV2ZW50cyAocmVuZGVyT3B0czogYW55LCBwYXJhbXM6IGFueSwgY29udGV4dDogYW55KSB7XHJcbiAgbGV0IHsgZXZlbnRzIH06IGFueSA9IHJlbmRlck9wdHNcclxuICBsZXQgb25cclxuICBpZiAoZXZlbnRzKSB7XHJcbiAgICBvbiA9IFhFVXRpbHMuYXNzaWduKHt9LCBYRVV0aWxzLm9iamVjdE1hcChldmVudHMsIChjYjogRnVuY3Rpb24pID0+IGZ1bmN0aW9uICguLi5hcmdzOiBhbnlbXSkge1xyXG4gICAgICBjYi5hcHBseShudWxsLCBbcGFyYW1zXS5jb25jYXQuYXBwbHkocGFyYW1zLCBhcmdzKSlcclxuICAgIH0pLCBvbilcclxuICB9XHJcbiAgcmV0dXJuIG9uXHJcbn1cclxuXHJcbi8qKlxyXG4gKiDmuLLmn5Plh73mlbBcclxuICovXHJcbmNvbnN0IHJlbmRlck1hcDogYW55ID0ge1xyXG4gIElucHV0OiB7XHJcbiAgICBhdXRvZm9jdXM6ICdpbnB1dC5pdnUtaW5wdXQnLFxyXG4gICAgcmVuZGVyRGVmYXVsdDogY3JlYXRlRWRpdFJlbmRlcigpLFxyXG4gICAgcmVuZGVyRWRpdDogY3JlYXRlRWRpdFJlbmRlcigpLFxyXG4gICAgcmVuZGVyRmlsdGVyOiBjcmVhdGVGaWx0ZXJSZW5kZXIoKSxcclxuICAgIGZpbHRlck1ldGhvZDogZGVmYXVsdEZpbHRlck1ldGhvZCxcclxuICAgIHJlbmRlckl0ZW06IGNyZWF0ZUZvcm1JdGVtUmVuZGVyKClcclxuICB9LFxyXG4gIEF1dG9Db21wbGV0ZToge1xyXG4gICAgYXV0b2ZvY3VzOiAnaW5wdXQuaXZ1LWlucHV0JyxcclxuICAgIHJlbmRlckRlZmF1bHQ6IGNyZWF0ZUVkaXRSZW5kZXIoKSxcclxuICAgIHJlbmRlckVkaXQ6IGNyZWF0ZUVkaXRSZW5kZXIoKSxcclxuICAgIHJlbmRlckZpbHRlcjogY3JlYXRlRmlsdGVyUmVuZGVyKCksXHJcbiAgICBmaWx0ZXJNZXRob2Q6IGRlZmF1bHRGaWx0ZXJNZXRob2QsXHJcbiAgICByZW5kZXJJdGVtOiBjcmVhdGVGb3JtSXRlbVJlbmRlcigpXHJcbiAgfSxcclxuICBJbnB1dE51bWJlcjoge1xyXG4gICAgYXV0b2ZvY3VzOiAnaW5wdXQuaXZ1LWlucHV0LW51bWJlci1pbnB1dCcsXHJcbiAgICByZW5kZXJEZWZhdWx0OiBjcmVhdGVFZGl0UmVuZGVyKCksXHJcbiAgICByZW5kZXJFZGl0OiBjcmVhdGVFZGl0UmVuZGVyKCksXHJcbiAgICByZW5kZXJGaWx0ZXI6IGNyZWF0ZUZpbHRlclJlbmRlcigpLFxyXG4gICAgZmlsdGVyTWV0aG9kOiBkZWZhdWx0RmlsdGVyTWV0aG9kLFxyXG4gICAgcmVuZGVySXRlbTogY3JlYXRlRm9ybUl0ZW1SZW5kZXIoKVxyXG4gIH0sXHJcbiAgU2VsZWN0OiB7XHJcbiAgICByZW5kZXJFZGl0IChoOiBGdW5jdGlvbiwgcmVuZGVyT3B0czogYW55LCBwYXJhbXM6IGFueSkge1xyXG4gICAgICBsZXQgeyBvcHRpb25zLCBvcHRpb25Hcm91cHMsIG9wdGlvblByb3BzID0ge30sIG9wdGlvbkdyb3VwUHJvcHMgPSB7fSB9ID0gcmVuZGVyT3B0c1xyXG4gICAgICBsZXQgeyByb3csIGNvbHVtbiB9ID0gcGFyYW1zXHJcbiAgICAgIGxldCB7IGF0dHJzIH0gPSByZW5kZXJPcHRzXHJcbiAgICAgIGxldCBwcm9wcyA9IGdldFByb3BzKHBhcmFtcywgcmVuZGVyT3B0cywgeyB0cmFuc2ZlcjogdHJ1ZSB9KVxyXG4gICAgICBpZiAob3B0aW9uR3JvdXBzKSB7XHJcbiAgICAgICAgbGV0IGdyb3VwT3B0aW9ucyA9IG9wdGlvbkdyb3VwUHJvcHMub3B0aW9ucyB8fCAnb3B0aW9ucydcclxuICAgICAgICBsZXQgZ3JvdXBMYWJlbCA9IG9wdGlvbkdyb3VwUHJvcHMubGFiZWwgfHwgJ2xhYmVsJ1xyXG4gICAgICAgIHJldHVybiBbXHJcbiAgICAgICAgICBoKCdTZWxlY3QnLCB7XHJcbiAgICAgICAgICAgIHByb3BzLFxyXG4gICAgICAgICAgICBhdHRycyxcclxuICAgICAgICAgICAgbW9kZWw6IHtcclxuICAgICAgICAgICAgICB2YWx1ZTogWEVVdGlscy5nZXQocm93LCBjb2x1bW4ucHJvcGVydHkpLFxyXG4gICAgICAgICAgICAgIGNhbGxiYWNrIChjZWxsVmFsdWU6IGFueSkge1xyXG4gICAgICAgICAgICAgICAgWEVVdGlscy5zZXQocm93LCBjb2x1bW4ucHJvcGVydHksIGNlbGxWYWx1ZSlcclxuICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIG9uOiBnZXRDZWxsRXZlbnRzKHJlbmRlck9wdHMsIHBhcmFtcylcclxuICAgICAgICAgIH0sIFhFVXRpbHMubWFwKG9wdGlvbkdyb3VwcywgKGdyb3VwOiBhbnksIGdJbmRleDogbnVtYmVyKSA9PiB7XHJcbiAgICAgICAgICAgIHJldHVybiBoKCdPcHRpb25Hcm91cCcsIHtcclxuICAgICAgICAgICAgICBwcm9wczoge1xyXG4gICAgICAgICAgICAgICAgbGFiZWw6IGdyb3VwW2dyb3VwTGFiZWxdXHJcbiAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICBrZXk6IGdJbmRleFxyXG4gICAgICAgICAgICB9LCByZW5kZXJPcHRpb25zKGgsIGdyb3VwW2dyb3VwT3B0aW9uc10sIG9wdGlvblByb3BzKSlcclxuICAgICAgICAgIH0pKVxyXG4gICAgICAgIF1cclxuICAgICAgfVxyXG4gICAgICByZXR1cm4gW1xyXG4gICAgICAgIGgoJ1NlbGVjdCcsIHtcclxuICAgICAgICAgIHByb3BzLFxyXG4gICAgICAgICAgYXR0cnMsXHJcbiAgICAgICAgICBtb2RlbDoge1xyXG4gICAgICAgICAgICB2YWx1ZTogWEVVdGlscy5nZXQocm93LCBjb2x1bW4ucHJvcGVydHkpLFxyXG4gICAgICAgICAgICBjYWxsYmFjayAoY2VsbFZhbHVlOiBhbnkpIHtcclxuICAgICAgICAgICAgICBYRVV0aWxzLnNldChyb3csIGNvbHVtbi5wcm9wZXJ0eSwgY2VsbFZhbHVlKVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICB9LFxyXG4gICAgICAgICAgb246IGdldENlbGxFdmVudHMocmVuZGVyT3B0cywgcGFyYW1zKVxyXG4gICAgICAgIH0sIHJlbmRlck9wdGlvbnMoaCwgb3B0aW9ucywgb3B0aW9uUHJvcHMpKVxyXG4gICAgICBdXHJcbiAgICB9LFxyXG4gICAgcmVuZGVyQ2VsbCAoaDogRnVuY3Rpb24sIHJlbmRlck9wdHM6IGFueSwgcGFyYW1zOiBhbnkpIHtcclxuICAgICAgbGV0IHsgb3B0aW9ucywgb3B0aW9uR3JvdXBzLCBwcm9wcyA9IHt9LCBvcHRpb25Qcm9wcyA9IHt9LCBvcHRpb25Hcm91cFByb3BzID0ge30gfSA9IHJlbmRlck9wdHNcclxuICAgICAgbGV0IHsgJHRhYmxlLCByb3csIGNvbHVtbiB9ID0gcGFyYW1zXHJcbiAgICAgIGxldCBsYWJlbFByb3AgPSBvcHRpb25Qcm9wcy5sYWJlbCB8fCAnbGFiZWwnXHJcbiAgICAgIGxldCB2YWx1ZVByb3AgPSBvcHRpb25Qcm9wcy52YWx1ZSB8fCAndmFsdWUnXHJcbiAgICAgIGxldCBncm91cE9wdGlvbnMgPSBvcHRpb25Hcm91cFByb3BzLm9wdGlvbnMgfHwgJ29wdGlvbnMnXHJcbiAgICAgIGxldCBjZWxsVmFsdWUgPSBYRVV0aWxzLmdldChyb3csIGNvbHVtbi5wcm9wZXJ0eSlcclxuICAgICAgbGV0IGNvbGlkOiBzdHJpbmcgPSBjb2x1bW4uaWRcclxuICAgICAgbGV0IHJlc3Q6IGFueVxyXG4gICAgICBsZXQgY2VsbERhdGE6IGFueVxyXG4gICAgICBpZiAocHJvcHMuZmlsdGVyYWJsZSkge1xyXG4gICAgICAgIGxldCBmdWxsQWxsRGF0YVJvd01hcDogTWFwPGFueSwgYW55PiA9ICR0YWJsZS5mdWxsQWxsRGF0YVJvd01hcFxyXG4gICAgICAgIGxldCBjYWNoZUNlbGw6IGFueSA9IGZ1bGxBbGxEYXRhUm93TWFwLmhhcyhyb3cpXHJcbiAgICAgICAgaWYgKGNhY2hlQ2VsbCkge1xyXG4gICAgICAgICAgcmVzdCA9IGZ1bGxBbGxEYXRhUm93TWFwLmdldChyb3cpXHJcbiAgICAgICAgICBjZWxsRGF0YSA9IHJlc3QuY2VsbERhdGFcclxuICAgICAgICAgIGlmICghY2VsbERhdGEpIHtcclxuICAgICAgICAgICAgY2VsbERhdGEgPSBmdWxsQWxsRGF0YVJvd01hcC5nZXQocm93KS5jZWxsRGF0YSA9IHt9XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmIChyZXN0ICYmIGNlbGxEYXRhW2NvbGlkXSAmJiBjZWxsRGF0YVtjb2xpZF0udmFsdWUgPT09IGNlbGxWYWx1ZSkge1xyXG4gICAgICAgICAgcmV0dXJuIGNlbGxEYXRhW2NvbGlkXS5sYWJlbFxyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgICBpZiAoIShjZWxsVmFsdWUgPT09IG51bGwgfHwgY2VsbFZhbHVlID09PSB1bmRlZmluZWQgfHwgY2VsbFZhbHVlID09PSAnJykpIHtcclxuICAgICAgICByZXR1cm4gY2VsbFRleHQoaCwgWEVVdGlscy5tYXAocHJvcHMubXVsdGlwbGUgPyBjZWxsVmFsdWUgOiBbY2VsbFZhbHVlXSwgb3B0aW9uR3JvdXBzID8gKHZhbHVlOiBhbnkpID0+IHtcclxuICAgICAgICAgIGxldCBzZWxlY3RJdGVtXHJcbiAgICAgICAgICBmb3IgKGxldCBpbmRleCA9IDA7IGluZGV4IDwgb3B0aW9uR3JvdXBzLmxlbmd0aDsgaW5kZXgrKykge1xyXG4gICAgICAgICAgICBzZWxlY3RJdGVtID0gWEVVdGlscy5maW5kKG9wdGlvbkdyb3Vwc1tpbmRleF1bZ3JvdXBPcHRpb25zXSwgKGl0ZW06IGFueSkgPT4gaXRlbVt2YWx1ZVByb3BdID09PSB2YWx1ZSlcclxuICAgICAgICAgICAgaWYgKHNlbGVjdEl0ZW0pIHtcclxuICAgICAgICAgICAgICBicmVha1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgICBsZXQgY2VsbExhYmVsOiBhbnkgPSBzZWxlY3RJdGVtID8gc2VsZWN0SXRlbVtsYWJlbFByb3BdIDogdmFsdWVcclxuICAgICAgICAgIGlmIChjZWxsRGF0YSAmJiBvcHRpb25zICYmIG9wdGlvbnMubGVuZ3RoKSB7XHJcbiAgICAgICAgICAgIGNlbGxEYXRhW2NvbGlkXSA9IHsgdmFsdWU6IGNlbGxWYWx1ZSwgbGFiZWw6IGNlbGxMYWJlbCB9XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgICByZXR1cm4gY2VsbExhYmVsXHJcbiAgICAgICAgfSA6ICh2YWx1ZTogYW55KSA9PiB7XHJcbiAgICAgICAgICBsZXQgc2VsZWN0SXRlbSA9IFhFVXRpbHMuZmluZChvcHRpb25zLCAoaXRlbTogYW55KSA9PiBpdGVtW3ZhbHVlUHJvcF0gPT09IHZhbHVlKVxyXG4gICAgICAgICAgbGV0IGNlbGxMYWJlbDogYW55ID0gc2VsZWN0SXRlbSA/IHNlbGVjdEl0ZW1bbGFiZWxQcm9wXSA6IHZhbHVlXHJcbiAgICAgICAgICBpZiAoY2VsbERhdGEgJiYgb3B0aW9ucyAmJiBvcHRpb25zLmxlbmd0aCkge1xyXG4gICAgICAgICAgICBjZWxsRGF0YVtjb2xpZF0gPSB7IHZhbHVlOiBjZWxsVmFsdWUsIGxhYmVsOiBjZWxsTGFiZWwgfVxyXG4gICAgICAgICAgfVxyXG4gICAgICAgICAgcmV0dXJuIGNlbGxMYWJlbFxyXG4gICAgICAgIH0pLmpvaW4oJzsnKSlcclxuICAgICAgfVxyXG4gICAgICByZXR1cm4gY2VsbFRleHQoaCwgJycpXHJcbiAgICB9LFxyXG4gICAgcmVuZGVyRmlsdGVyIChoOiBGdW5jdGlvbiwgcmVuZGVyT3B0czogYW55LCBwYXJhbXM6IGFueSwgY29udGV4dDogYW55KSB7XHJcbiAgICAgIGxldCB7IG9wdGlvbnMsIG9wdGlvbkdyb3Vwcywgb3B0aW9uUHJvcHMgPSB7fSwgb3B0aW9uR3JvdXBQcm9wcyA9IHt9IH0gPSByZW5kZXJPcHRzXHJcbiAgICAgIGxldCB7IGNvbHVtbiB9ID0gcGFyYW1zXHJcbiAgICAgIGxldCB7IGF0dHJzLCBldmVudHMgfSA9IHJlbmRlck9wdHNcclxuICAgICAgbGV0IHByb3BzID0gZ2V0UHJvcHMocGFyYW1zLCByZW5kZXJPcHRzLCB7IHRyYW5zZmVyOiB0cnVlIH0pXHJcbiAgICAgIGxldCB0eXBlID0gJ29uLWNoYW5nZSdcclxuICAgICAgaWYgKG9wdGlvbkdyb3Vwcykge1xyXG4gICAgICAgIGxldCBncm91cE9wdGlvbnMgPSBvcHRpb25Hcm91cFByb3BzLm9wdGlvbnMgfHwgJ29wdGlvbnMnXHJcbiAgICAgICAgbGV0IGdyb3VwTGFiZWwgPSBvcHRpb25Hcm91cFByb3BzLmxhYmVsIHx8ICdsYWJlbCdcclxuICAgICAgICByZXR1cm4gY29sdW1uLmZpbHRlcnMubWFwKChpdGVtOiBhbnkpID0+IHtcclxuICAgICAgICAgIHJldHVybiBoKCdTZWxlY3QnLCB7XHJcbiAgICAgICAgICAgIHByb3BzLFxyXG4gICAgICAgICAgICBhdHRycyxcclxuICAgICAgICAgICAgbW9kZWw6IHtcclxuICAgICAgICAgICAgICB2YWx1ZTogaXRlbS5kYXRhLFxyXG4gICAgICAgICAgICAgIGNhbGxiYWNrIChvcHRpb25WYWx1ZTogYW55KSB7XHJcbiAgICAgICAgICAgICAgICBpdGVtLmRhdGEgPSBvcHRpb25WYWx1ZVxyXG4gICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgb246IGdldEZpbHRlckV2ZW50cyh7XHJcbiAgICAgICAgICAgICAgW3R5cGVdICh2YWx1ZTogYW55KSB7XHJcbiAgICAgICAgICAgICAgICBoYW5kbGVDb25maXJtRmlsdGVyKGNvbnRleHQsIGNvbHVtbiwgdmFsdWUgJiYgdmFsdWUubGVuZ3RoID4gMCwgaXRlbSlcclxuICAgICAgICAgICAgICAgIGlmIChldmVudHMgJiYgZXZlbnRzW3R5cGVdKSB7XHJcbiAgICAgICAgICAgICAgICAgIGV2ZW50c1t0eXBlXShPYmplY3QuYXNzaWduKHsgY29udGV4dCB9LCBwYXJhbXMpLCB2YWx1ZSlcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0sIHJlbmRlck9wdHMsIHBhcmFtcywgY29udGV4dClcclxuICAgICAgICAgIH0sIFhFVXRpbHMubWFwKG9wdGlvbkdyb3VwcywgKGdyb3VwOiBhbnksIGdJbmRleDogbnVtYmVyKSA9PiB7XHJcbiAgICAgICAgICAgIHJldHVybiBoKCdPcHRpb25Hcm91cCcsIHtcclxuICAgICAgICAgICAgICBwcm9wczoge1xyXG4gICAgICAgICAgICAgICAgbGFiZWw6IGdyb3VwW2dyb3VwTGFiZWxdXHJcbiAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICBrZXk6IGdJbmRleFxyXG4gICAgICAgICAgICB9LCByZW5kZXJPcHRpb25zKGgsIGdyb3VwW2dyb3VwT3B0aW9uc10sIG9wdGlvblByb3BzKSlcclxuICAgICAgICAgIH0pKVxyXG4gICAgICAgIH0pXHJcbiAgICAgIH1cclxuICAgICAgcmV0dXJuIGNvbHVtbi5maWx0ZXJzLm1hcCgoaXRlbTogYW55KSA9PiB7XHJcbiAgICAgICAgcmV0dXJuIGgoJ1NlbGVjdCcsIHtcclxuICAgICAgICAgIHByb3BzLFxyXG4gICAgICAgICAgYXR0cnMsXHJcbiAgICAgICAgICBtb2RlbDoge1xyXG4gICAgICAgICAgICB2YWx1ZTogaXRlbS5kYXRhLFxyXG4gICAgICAgICAgICBjYWxsYmFjayAob3B0aW9uVmFsdWU6IGFueSkge1xyXG4gICAgICAgICAgICAgIGl0ZW0uZGF0YSA9IG9wdGlvblZhbHVlXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgIH0sXHJcbiAgICAgICAgICBvbjogZ2V0RmlsdGVyRXZlbnRzKHtcclxuICAgICAgICAgICAgW3R5cGVdICh2YWx1ZTogYW55KSB7XHJcbiAgICAgICAgICAgICAgaGFuZGxlQ29uZmlybUZpbHRlcihjb250ZXh0LCBjb2x1bW4sIHZhbHVlICYmIHZhbHVlLmxlbmd0aCA+IDAsIGl0ZW0pXHJcbiAgICAgICAgICAgICAgaWYgKGV2ZW50cyAmJiBldmVudHNbdHlwZV0pIHtcclxuICAgICAgICAgICAgICAgIGV2ZW50c1t0eXBlXShPYmplY3QuYXNzaWduKHsgY29udGV4dCB9LCBwYXJhbXMpLCB2YWx1ZSlcclxuICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgIH0sIHJlbmRlck9wdHMsIHBhcmFtcywgY29udGV4dClcclxuICAgICAgICB9LCByZW5kZXJPcHRpb25zKGgsIG9wdGlvbnMsIG9wdGlvblByb3BzKSlcclxuICAgICAgfSlcclxuICAgIH0sXHJcbiAgICBmaWx0ZXJNZXRob2QgKHsgb3B0aW9uLCByb3csIGNvbHVtbiB9OiBhbnkpIHtcclxuICAgICAgbGV0IHsgZGF0YSB9ID0gb3B0aW9uXHJcbiAgICAgIGxldCB7IHByb3BlcnR5LCBmaWx0ZXJSZW5kZXI6IHJlbmRlck9wdHMgfSA9IGNvbHVtblxyXG4gICAgICBsZXQgeyBwcm9wcyA9IHt9IH0gPSByZW5kZXJPcHRzXHJcbiAgICAgIGxldCBjZWxsVmFsdWUgPSBYRVV0aWxzLmdldChyb3csIHByb3BlcnR5KVxyXG4gICAgICBpZiAocHJvcHMubXVsdGlwbGUpIHtcclxuICAgICAgICBpZiAoWEVVdGlscy5pc0FycmF5KGNlbGxWYWx1ZSkpIHtcclxuICAgICAgICAgIHJldHVybiBYRVV0aWxzLmluY2x1ZGVBcnJheXMoY2VsbFZhbHVlLCBkYXRhKVxyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gZGF0YS5pbmRleE9mKGNlbGxWYWx1ZSkgPiAtMVxyXG4gICAgICB9XHJcbiAgICAgIC8qIGVzbGludC1kaXNhYmxlIGVxZXFlcSAqL1xyXG4gICAgICByZXR1cm4gY2VsbFZhbHVlID09IGRhdGFcclxuICAgIH0sXHJcbiAgICByZW5kZXJJdGVtIChoOiBGdW5jdGlvbiwgcmVuZGVyT3B0czogYW55LCBwYXJhbXM6IGFueSwgY29udGV4dDogYW55KSB7XHJcbiAgICAgIGxldCB7IG9wdGlvbnMsIG9wdGlvbkdyb3Vwcywgb3B0aW9uUHJvcHMgPSB7fSwgb3B0aW9uR3JvdXBQcm9wcyA9IHt9IH0gPSByZW5kZXJPcHRzXHJcbiAgICAgIGxldCB7IGRhdGEsIHByb3BlcnR5IH0gPSBwYXJhbXNcclxuICAgICAgbGV0IHsgYXR0cnMgfSA9IHJlbmRlck9wdHNcclxuICAgICAgbGV0IHByb3BzOiBhbnkgPSBnZXRGb3JtUHJvcHMoY29udGV4dCwgcmVuZGVyT3B0cylcclxuICAgICAgaWYgKG9wdGlvbkdyb3Vwcykge1xyXG4gICAgICAgIGxldCBncm91cE9wdGlvbnM6IHN0cmluZyA9IG9wdGlvbkdyb3VwUHJvcHMub3B0aW9ucyB8fCAnb3B0aW9ucydcclxuICAgICAgICBsZXQgZ3JvdXBMYWJlbDogc3RyaW5nID0gb3B0aW9uR3JvdXBQcm9wcy5sYWJlbCB8fCAnbGFiZWwnXHJcbiAgICAgICAgcmV0dXJuIFtcclxuICAgICAgICAgIGgoJ1NlbGVjdCcsIHtcclxuICAgICAgICAgICAgcHJvcHMsXHJcbiAgICAgICAgICAgIGF0dHJzLFxyXG4gICAgICAgICAgICBtb2RlbDoge1xyXG4gICAgICAgICAgICAgIHZhbHVlOiBYRVV0aWxzLmdldChkYXRhLCBwcm9wZXJ0eSksXHJcbiAgICAgICAgICAgICAgY2FsbGJhY2sgKGNlbGxWYWx1ZTogYW55KSB7XHJcbiAgICAgICAgICAgICAgICBYRVV0aWxzLnNldChkYXRhLCBwcm9wZXJ0eSwgY2VsbFZhbHVlKVxyXG4gICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgb246IGdldEZvcm1FdmVudHMocmVuZGVyT3B0cywgcGFyYW1zLCBjb250ZXh0KVxyXG4gICAgICAgICAgfSwgWEVVdGlscy5tYXAob3B0aW9uR3JvdXBzLCAoZ3JvdXA6IGFueSwgZ0luZGV4OiBudW1iZXIpID0+IHtcclxuICAgICAgICAgICAgcmV0dXJuIGgoJ09wdGlvbkdyb3VwJywge1xyXG4gICAgICAgICAgICAgIHByb3BzOiB7XHJcbiAgICAgICAgICAgICAgICBsYWJlbDogZ3JvdXBbZ3JvdXBMYWJlbF1cclxuICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgIGtleTogZ0luZGV4XHJcbiAgICAgICAgICAgIH0sIHJlbmRlck9wdGlvbnMoaCwgZ3JvdXBbZ3JvdXBPcHRpb25zXSwgb3B0aW9uUHJvcHMpKVxyXG4gICAgICAgICAgfSkpXHJcbiAgICAgICAgXVxyXG4gICAgICB9XHJcbiAgICAgIHJldHVybiBbXHJcbiAgICAgICAgaCgnU2VsZWN0Jywge1xyXG4gICAgICAgICAgcHJvcHMsXHJcbiAgICAgICAgICBhdHRycyxcclxuICAgICAgICAgIG1vZGVsOiB7XHJcbiAgICAgICAgICAgIHZhbHVlOiBYRVV0aWxzLmdldChkYXRhLCBwcm9wZXJ0eSksXHJcbiAgICAgICAgICAgIGNhbGxiYWNrIChjZWxsVmFsdWU6IGFueSkge1xyXG4gICAgICAgICAgICAgIFhFVXRpbHMuc2V0KGRhdGEsIHByb3BlcnR5LCBjZWxsVmFsdWUpXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgIH0sXHJcbiAgICAgICAgICBvbjogZ2V0Rm9ybUV2ZW50cyhyZW5kZXJPcHRzLCBwYXJhbXMsIGNvbnRleHQpXHJcbiAgICAgICAgfSwgcmVuZGVyT3B0aW9ucyhoLCBvcHRpb25zLCBvcHRpb25Qcm9wcykpXHJcbiAgICAgIF1cclxuICAgIH1cclxuICB9LFxyXG4gIENhc2NhZGVyOiB7XHJcbiAgICByZW5kZXJFZGl0OiBjcmVhdGVFZGl0UmVuZGVyKHsgdHJhbnNmZXI6IHRydWUgfSksXHJcbiAgICByZW5kZXJDZWxsIChoOiBGdW5jdGlvbiwgeyBwcm9wcyA9IHt9IH06IGFueSwgcGFyYW1zOiBhbnkpIHtcclxuICAgICAgbGV0IHsgcm93LCBjb2x1bW4gfSA9IHBhcmFtc1xyXG4gICAgICBsZXQgY2VsbFZhbHVlID0gWEVVdGlscy5nZXQocm93LCBjb2x1bW4ucHJvcGVydHkpXHJcbiAgICAgIGxldCB2YWx1ZXMgPSBjZWxsVmFsdWUgfHwgW11cclxuICAgICAgbGV0IGxhYmVsczogQXJyYXk8YW55PiA9IFtdXHJcbiAgICAgIG1hdGNoQ2FzY2FkZXJEYXRhKDAsIHByb3BzLmRhdGEsIHZhbHVlcywgbGFiZWxzKVxyXG4gICAgICByZXR1cm4gY2VsbFRleHQoaCwgbGFiZWxzLmpvaW4oYCAke3Byb3BzLnNlcGFyYXRvciB8fCAnLyd9IGApKVxyXG4gICAgfSxcclxuICAgIHJlbmRlckl0ZW06IGNyZWF0ZUZvcm1JdGVtUmVuZGVyKClcclxuICB9LFxyXG4gIERhdGVQaWNrZXI6IHtcclxuICAgIHJlbmRlckVkaXQ6IGNyZWF0ZUVkaXRSZW5kZXIoeyB0cmFuc2ZlcjogdHJ1ZSB9KSxcclxuICAgIHJlbmRlckNlbGwgKGg6IEZ1bmN0aW9uLCB7IHByb3BzID0ge30gfTogYW55LCBwYXJhbXM6IGFueSkge1xyXG4gICAgICBsZXQgeyByb3csIGNvbHVtbiB9ID0gcGFyYW1zXHJcbiAgICAgIGxldCB7IHNlcGFyYXRvciB9ID0gcHJvcHNcclxuICAgICAgbGV0IGNlbGxWYWx1ZSA9IFhFVXRpbHMuZ2V0KHJvdywgY29sdW1uLnByb3BlcnR5KVxyXG4gICAgICBzd2l0Y2ggKHByb3BzLnR5cGUpIHtcclxuICAgICAgICBjYXNlICd3ZWVrJzpcclxuICAgICAgICAgIGNlbGxWYWx1ZSA9IGdldEZvcm1hdERhdGUoY2VsbFZhbHVlLCBwcm9wcywgJ3l5eXl3V1cnKVxyXG4gICAgICAgICAgYnJlYWtcclxuICAgICAgICBjYXNlICdtb250aCc6XHJcbiAgICAgICAgICBjZWxsVmFsdWUgPSBnZXRGb3JtYXREYXRlKGNlbGxWYWx1ZSwgcHJvcHMsICd5eXl5LU1NJylcclxuICAgICAgICAgIGJyZWFrXHJcbiAgICAgICAgY2FzZSAneWVhcic6XHJcbiAgICAgICAgICBjZWxsVmFsdWUgPSBnZXRGb3JtYXREYXRlKGNlbGxWYWx1ZSwgcHJvcHMsICd5eXl5JylcclxuICAgICAgICAgIGJyZWFrXHJcbiAgICAgICAgY2FzZSAnZGF0ZXMnOlxyXG4gICAgICAgICAgY2VsbFZhbHVlID0gZ2V0Rm9ybWF0RGF0ZXMoY2VsbFZhbHVlLCBwcm9wcywgJywgJywgJ3l5eXktTU0tZGQnKVxyXG4gICAgICAgICAgYnJlYWtcclxuICAgICAgICBjYXNlICdkYXRlcmFuZ2UnOlxyXG4gICAgICAgICAgY2VsbFZhbHVlID0gZ2V0Rm9ybWF0RGF0ZXMoY2VsbFZhbHVlLCBwcm9wcywgYCAke3NlcGFyYXRvciB8fCAnLSd9IGAsICd5eXl5LU1NLWRkJylcclxuICAgICAgICAgIGJyZWFrXHJcbiAgICAgICAgY2FzZSAnZGF0ZXRpbWVyYW5nZSc6XHJcbiAgICAgICAgICBjZWxsVmFsdWUgPSBnZXRGb3JtYXREYXRlcyhjZWxsVmFsdWUsIHByb3BzLCBgICR7c2VwYXJhdG9yIHx8ICctJ30gYCwgJ3l5eXktTU0tZGQgSEg6c3M6bW0nKVxyXG4gICAgICAgICAgYnJlYWtcclxuICAgICAgICBkZWZhdWx0OlxyXG4gICAgICAgICAgY2VsbFZhbHVlID0gZ2V0Rm9ybWF0RGF0ZShjZWxsVmFsdWUsIHByb3BzLCAneXl5eS1NTS1kZCcpXHJcbiAgICAgICAgICBicmVha1xyXG4gICAgICB9XHJcbiAgICAgIHJldHVybiBjZWxsVGV4dChoLCBjZWxsVmFsdWUpXHJcbiAgICB9LFxyXG4gICAgcmVuZGVyRmlsdGVyIChoOiBGdW5jdGlvbiwgcmVuZGVyT3B0czogYW55LCBwYXJhbXM6IGFueSwgY29udGV4dDogYW55KSB7XHJcbiAgICAgIGxldCB7IGNvbHVtbiB9ID0gcGFyYW1zXHJcbiAgICAgIGxldCB7IGF0dHJzLCBldmVudHMgfSA9IHJlbmRlck9wdHNcclxuICAgICAgbGV0IHByb3BzID0gZ2V0UHJvcHMocGFyYW1zLCByZW5kZXJPcHRzLCB7IHRyYW5zZmVyOiB0cnVlIH0pXHJcbiAgICAgIGxldCB0eXBlID0gJ29uLWNoYW5nZSdcclxuICAgICAgcmV0dXJuIGNvbHVtbi5maWx0ZXJzLm1hcCgoaXRlbTogYW55KSA9PiB7XHJcbiAgICAgICAgcmV0dXJuIGgocmVuZGVyT3B0cy5uYW1lLCB7XHJcbiAgICAgICAgICBwcm9wcyxcclxuICAgICAgICAgIGF0dHJzLFxyXG4gICAgICAgICAgbW9kZWw6IHtcclxuICAgICAgICAgICAgdmFsdWU6IGl0ZW0uZGF0YSxcclxuICAgICAgICAgICAgY2FsbGJhY2sgKG9wdGlvblZhbHVlOiBhbnkpIHtcclxuICAgICAgICAgICAgICBpdGVtLmRhdGEgPSBvcHRpb25WYWx1ZVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICB9LFxyXG4gICAgICAgICAgb246IGdldEZpbHRlckV2ZW50cyh7XHJcbiAgICAgICAgICAgIFt0eXBlXSAodmFsdWU6IGFueSkge1xyXG4gICAgICAgICAgICAgIGhhbmRsZUNvbmZpcm1GaWx0ZXIoY29udGV4dCwgY29sdW1uLCAhIXZhbHVlLCBpdGVtKVxyXG4gICAgICAgICAgICAgIGlmIChldmVudHMgJiYgZXZlbnRzW3R5cGVdKSB7XHJcbiAgICAgICAgICAgICAgICBldmVudHNbdHlwZV0oT2JqZWN0LmFzc2lnbih7IGNvbnRleHQgfSwgcGFyYW1zKSwgdmFsdWUpXHJcbiAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICB9LCByZW5kZXJPcHRzLCBwYXJhbXMsIGNvbnRleHQpXHJcbiAgICAgICAgfSlcclxuICAgICAgfSlcclxuICAgIH0sXHJcbiAgICBmaWx0ZXJNZXRob2QgKHsgb3B0aW9uLCByb3csIGNvbHVtbiB9OiBhbnkpIHtcclxuICAgICAgbGV0IHsgZGF0YSB9ID0gb3B0aW9uXHJcbiAgICAgIGxldCB7IGZpbHRlclJlbmRlcjogcmVuZGVyT3B0cyB9ID0gY29sdW1uXHJcbiAgICAgIGxldCB7IHByb3BzID0ge30gfSA9IHJlbmRlck9wdHNcclxuICAgICAgbGV0IGNlbGxWYWx1ZSA9IFhFVXRpbHMuZ2V0KHJvdywgY29sdW1uLnByb3BlcnR5KVxyXG4gICAgICBpZiAoZGF0YSkge1xyXG4gICAgICAgIHN3aXRjaCAocHJvcHMudHlwZSkge1xyXG4gICAgICAgICAgY2FzZSAnZGF0ZXJhbmdlJzpcclxuICAgICAgICAgICAgcmV0dXJuIGVxdWFsRGF0ZXJhbmdlKGNlbGxWYWx1ZSwgZGF0YSwgcHJvcHMsICd5eXl5LU1NLWRkJylcclxuICAgICAgICAgIGNhc2UgJ2RhdGV0aW1lcmFuZ2UnOlxyXG4gICAgICAgICAgICByZXR1cm4gZXF1YWxEYXRlcmFuZ2UoY2VsbFZhbHVlLCBkYXRhLCBwcm9wcywgJ3l5eXktTU0tZGQgSEg6c3M6bW0nKVxyXG4gICAgICAgICAgZGVmYXVsdDpcclxuICAgICAgICAgICAgcmV0dXJuIGNlbGxWYWx1ZSA9PT0gZGF0YVxyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgICByZXR1cm4gZmFsc2VcclxuICAgIH0sXHJcbiAgICByZW5kZXJJdGVtOiBjcmVhdGVGb3JtSXRlbVJlbmRlcigpXHJcbiAgfSxcclxuICBUaW1lUGlja2VyOiB7XHJcbiAgICByZW5kZXJFZGl0OiBjcmVhdGVFZGl0UmVuZGVyKHsgdHJhbnNmZXI6IHRydWUgfSksXHJcbiAgICByZW5kZXJJdGVtOiBjcmVhdGVGb3JtSXRlbVJlbmRlcigpXHJcbiAgfSxcclxuICBSYXRlOiB7XHJcbiAgICByZW5kZXJEZWZhdWx0OiBjcmVhdGVFZGl0UmVuZGVyKCksXHJcbiAgICByZW5kZXJFZGl0OiBjcmVhdGVFZGl0UmVuZGVyKCksXHJcbiAgICByZW5kZXJGaWx0ZXI6IGNyZWF0ZUZpbHRlclJlbmRlcigpLFxyXG4gICAgZmlsdGVyTWV0aG9kOiBkZWZhdWx0RmlsdGVyTWV0aG9kLFxyXG4gICAgcmVuZGVySXRlbTogY3JlYXRlRm9ybUl0ZW1SZW5kZXIoKVxyXG4gIH0sXHJcbiAgaVN3aXRjaDoge1xyXG4gICAgcmVuZGVyRGVmYXVsdDogY3JlYXRlRWRpdFJlbmRlcigpLFxyXG4gICAgcmVuZGVyRWRpdDogY3JlYXRlRWRpdFJlbmRlcigpLFxyXG4gICAgcmVuZGVyRmlsdGVyOiBjcmVhdGVGaWx0ZXJSZW5kZXIoKSxcclxuICAgIGZpbHRlck1ldGhvZDogZGVmYXVsdEZpbHRlck1ldGhvZCxcclxuICAgIHJlbmRlckl0ZW06IGNyZWF0ZUZvcm1JdGVtUmVuZGVyKClcclxuICB9XHJcbn1cclxuXHJcbi8qKlxyXG4gKiDkuovku7blhbzlrrnmgKflpITnkIZcclxuICovXHJcbmZ1bmN0aW9uIGhhbmRsZUNsZWFyRXZlbnQgKHBhcmFtczogYW55LCBldm50OiBhbnksIGNvbnRleHQ6IGFueSkge1xyXG4gIGxldCB7IGdldEV2ZW50VGFyZ2V0Tm9kZSB9ID0gY29udGV4dFxyXG4gIGxldCBib2R5RWxlbSA9IGRvY3VtZW50LmJvZHlcclxuICBpZiAoXHJcbiAgICAvLyDkuIvmi4nmoYbjgIHml6XmnJ9cclxuICAgIGdldEV2ZW50VGFyZ2V0Tm9kZShldm50LCBib2R5RWxlbSwgJ2l2dS1zZWxlY3QtZHJvcGRvd24nKS5mbGFnXHJcbiAgKSB7XHJcbiAgICByZXR1cm4gZmFsc2VcclxuICB9XHJcbn1cclxuXHJcbi8qKlxyXG4gKiDln7rkuo4gdnhlLXRhYmxlIOihqOagvOeahOmAgumFjeaPkuS7tu+8jOeUqOS6juWFvOWuuSBpdmlldyDnu4Tku7blupNcclxuICovXHJcbmV4cG9ydCBjb25zdCBWWEVUYWJsZVBsdWdpbklWaWV3ID0ge1xyXG4gIGluc3RhbGwgKHh0YWJsZTogdHlwZW9mIFZYRVRhYmxlKSB7XHJcbiAgICBsZXQgeyBpbnRlcmNlcHRvciwgcmVuZGVyZXIgfSA9IHh0YWJsZVxyXG4gICAgcmVuZGVyZXIubWl4aW4ocmVuZGVyTWFwKVxyXG4gICAgaW50ZXJjZXB0b3IuYWRkKCdldmVudC5jbGVhckZpbHRlcicsIGhhbmRsZUNsZWFyRXZlbnQpXHJcbiAgICBpbnRlcmNlcHRvci5hZGQoJ2V2ZW50LmNsZWFyQWN0aXZlZCcsIGhhbmRsZUNsZWFyRXZlbnQpXHJcbiAgfVxyXG59XHJcblxyXG5pZiAodHlwZW9mIHdpbmRvdyAhPT0gJ3VuZGVmaW5lZCcgJiYgd2luZG93LlZYRVRhYmxlKSB7XHJcbiAgd2luZG93LlZYRVRhYmxlLnVzZShWWEVUYWJsZVBsdWdpbklWaWV3KVxyXG59XHJcblxyXG5leHBvcnQgZGVmYXVsdCBWWEVUYWJsZVBsdWdpbklWaWV3XHJcbiJdfQ==
