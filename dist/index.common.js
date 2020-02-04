"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = exports.VXETablePluginIView = void 0;

var _xeUtils = _interopRequireDefault(require("xe-utils/methods/xe-utils"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function isEmptyValue(cellValue) {
  return cellValue === null || cellValue === undefined || cellValue === '';
}

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

  var on = _defineProperty({}, type, function (evnt) {
    $table.updateStatus(params);

    if (events && events[type]) {
      events[type](params, evnt);
    }
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

function getSelectCellValue(renderOpts, params) {
  var options = renderOpts.options,
      optionGroups = renderOpts.optionGroups,
      _renderOpts$props = renderOpts.props,
      props = _renderOpts$props === void 0 ? {} : _renderOpts$props,
      _renderOpts$optionPro = renderOpts.optionProps,
      optionProps = _renderOpts$optionPro === void 0 ? {} : _renderOpts$optionPro,
      _renderOpts$optionGro = renderOpts.optionGroupProps,
      optionGroupProps = _renderOpts$optionGro === void 0 ? {} : _renderOpts$optionGro;
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

  if (!isEmptyValue(cellValue)) {
    return _xeUtils["default"].map(props.multiple ? cellValue : [cellValue], optionGroups ? function (value) {
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
    }).join(';');
  }

  return null;
}

function getCascaderCellValue(renderOpts, params) {
  var _renderOpts$props2 = renderOpts.props,
      props = _renderOpts$props2 === void 0 ? {} : _renderOpts$props2;
  var row = params.row,
      column = params.column;

  var cellValue = _xeUtils["default"].get(row, column.property);

  var values = cellValue || [];
  var labels = [];
  matchCascaderData(0, props.data, values, labels);
  return labels.join(" ".concat(props.separator || '/', " "));
}

function getDatePickerCellValue(renderOpts, params) {
  var _renderOpts$props3 = renderOpts.props,
      props = _renderOpts$props3 === void 0 ? {} : _renderOpts$props3;
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

  return cellValue;
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
  return ['' + (isEmptyValue(cellValue) ? '' : cellValue)];
}

function createFormItemRender(defaultProps) {
  return function (h, renderOpts, params, context) {
    var data = params.data,
        property = params.property;
    var name = renderOpts.name;
    var attrs = renderOpts.attrs;
    var props = getFormProps(context, renderOpts, defaultProps);
    return [h(name, {
      attrs: attrs,
      props: props,
      model: {
        value: _xeUtils["default"].get(data, property),
        callback: function callback(value) {
          _xeUtils["default"].set(data, property, value);
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
  var $form = params.$form;
  var type = 'on-change';

  var on = _defineProperty({}, type, function (evnt) {
    $form.updateStatus(params);

    if (events && events[type]) {
      events[type](params, evnt);
    }
  });

  if (events) {
    return _xeUtils["default"].assign({}, _xeUtils["default"].objectMap(events, function (cb) {
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

function createExportMethod(valueMethod, isEdit) {
  var renderProperty = isEdit ? 'editRender' : 'cellRender';
  return function (params) {
    return valueMethod(params.column[renderProperty], params);
  };
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
          _renderOpts$optionPro2 = renderOpts.optionProps,
          optionProps = _renderOpts$optionPro2 === void 0 ? {} : _renderOpts$optionPro2,
          _renderOpts$optionGro2 = renderOpts.optionGroupProps,
          optionGroupProps = _renderOpts$optionGro2 === void 0 ? {} : _renderOpts$optionGro2;
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
      cellText(h, getSelectCellValue(renderOpts, params));
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
      var _renderOpts$props4 = renderOpts.props,
          props = _renderOpts$props4 === void 0 ? {} : _renderOpts$props4;

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
    },
    editExportMethod: createExportMethod(getSelectCellValue, true),
    cellExportMethod: createExportMethod(getSelectCellValue)
  },
  Cascader: {
    renderEdit: createEditRender({
      transfer: true
    }),
    renderCell: function renderCell(h, renderOpts, params) {
      return cellText(h, getCascaderCellValue(renderOpts, params));
    },
    renderItem: createFormItemRender(),
    editExportMethod: createExportMethod(getCascaderCellValue, true),
    cellExportMethod: createExportMethod(getCascaderCellValue)
  },
  DatePicker: {
    renderEdit: createEditRender({
      transfer: true
    }),
    renderCell: function renderCell(h, renderOpts, params) {
      return cellText(h, getDatePickerCellValue(renderOpts, params));
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
      var _renderOpts$props5 = renderOpts.props,
          props = _renderOpts$props5 === void 0 ? {} : _renderOpts$props5;

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
    renderItem: createFormItemRender(),
    editExportMethod: createExportMethod(getDatePickerCellValue, true),
    cellExportMethod: createExportMethod(getDatePickerCellValue)
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
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImluZGV4LnRzIl0sIm5hbWVzIjpbImlzRW1wdHlWYWx1ZSIsImNlbGxWYWx1ZSIsInVuZGVmaW5lZCIsImdldEZvcm1hdERhdGUiLCJ2YWx1ZSIsInByb3BzIiwiZGVmYXVsdEZvcm1hdCIsIlhFVXRpbHMiLCJ0b0RhdGVTdHJpbmciLCJmb3JtYXQiLCJnZXRGb3JtYXREYXRlcyIsInZhbHVlcyIsInNlcGFyYXRvciIsIm1hcCIsImRhdGUiLCJqb2luIiwiZXF1YWxEYXRlcmFuZ2UiLCJkYXRhIiwibWF0Y2hDYXNjYWRlckRhdGEiLCJpbmRleCIsImxpc3QiLCJsYWJlbHMiLCJ2YWwiLCJsZW5ndGgiLCJlYWNoIiwiaXRlbSIsInB1c2giLCJsYWJlbCIsImNoaWxkcmVuIiwiZ2V0UHJvcHMiLCJkZWZhdWx0UHJvcHMiLCIkdGFibGUiLCJhc3NpZ24iLCJ2U2l6ZSIsInNpemUiLCJnZXRDZWxsRXZlbnRzIiwicmVuZGVyT3B0cyIsInBhcmFtcyIsImV2ZW50cyIsInR5cGUiLCJvbiIsImV2bnQiLCJ1cGRhdGVTdGF0dXMiLCJvYmplY3RNYXAiLCJjYiIsImFyZ3MiLCJhcHBseSIsImNvbmNhdCIsImdldFNlbGVjdENlbGxWYWx1ZSIsIm9wdGlvbnMiLCJvcHRpb25Hcm91cHMiLCJvcHRpb25Qcm9wcyIsIm9wdGlvbkdyb3VwUHJvcHMiLCJyb3ciLCJjb2x1bW4iLCJsYWJlbFByb3AiLCJ2YWx1ZVByb3AiLCJncm91cE9wdGlvbnMiLCJnZXQiLCJwcm9wZXJ0eSIsImNvbGlkIiwiaWQiLCJyZXN0IiwiY2VsbERhdGEiLCJmaWx0ZXJhYmxlIiwiZnVsbEFsbERhdGFSb3dNYXAiLCJjYWNoZUNlbGwiLCJoYXMiLCJtdWx0aXBsZSIsInNlbGVjdEl0ZW0iLCJmaW5kIiwiY2VsbExhYmVsIiwiZ2V0Q2FzY2FkZXJDZWxsVmFsdWUiLCJnZXREYXRlUGlja2VyQ2VsbFZhbHVlIiwiY3JlYXRlRWRpdFJlbmRlciIsImgiLCJhdHRycyIsIm5hbWUiLCJtb2RlbCIsImNhbGxiYWNrIiwic2V0IiwiZ2V0RmlsdGVyRXZlbnRzIiwiY29udGV4dCIsIk9iamVjdCIsImNyZWF0ZUZpbHRlclJlbmRlciIsImZpbHRlcnMiLCJvcHRpb25WYWx1ZSIsImhhbmRsZUNvbmZpcm1GaWx0ZXIiLCJjaGVja2VkIiwiZmlsdGVyTXVsdGlwbGUiLCJkZWZhdWx0RmlsdGVyTWV0aG9kIiwib3B0aW9uIiwicmVuZGVyT3B0aW9ucyIsImRpc2FibGVkUHJvcCIsImRpc2FibGVkIiwia2V5IiwiY2VsbFRleHQiLCJjcmVhdGVGb3JtSXRlbVJlbmRlciIsImdldEZvcm1Qcm9wcyIsImdldEZvcm1FdmVudHMiLCIkZm9ybSIsImNyZWF0ZUV4cG9ydE1ldGhvZCIsInZhbHVlTWV0aG9kIiwiaXNFZGl0IiwicmVuZGVyUHJvcGVydHkiLCJyZW5kZXJNYXAiLCJJbnB1dCIsImF1dG9mb2N1cyIsInJlbmRlckRlZmF1bHQiLCJyZW5kZXJFZGl0IiwicmVuZGVyRmlsdGVyIiwiZmlsdGVyTWV0aG9kIiwicmVuZGVySXRlbSIsIkF1dG9Db21wbGV0ZSIsIklucHV0TnVtYmVyIiwiU2VsZWN0IiwidHJhbnNmZXIiLCJncm91cExhYmVsIiwiZ3JvdXAiLCJnSW5kZXgiLCJyZW5kZXJDZWxsIiwiZmlsdGVyUmVuZGVyIiwiaXNBcnJheSIsImluY2x1ZGVBcnJheXMiLCJpbmRleE9mIiwiZWRpdEV4cG9ydE1ldGhvZCIsImNlbGxFeHBvcnRNZXRob2QiLCJDYXNjYWRlciIsIkRhdGVQaWNrZXIiLCJUaW1lUGlja2VyIiwiUmF0ZSIsImlTd2l0Y2giLCJoYW5kbGVDbGVhckV2ZW50IiwiZ2V0RXZlbnRUYXJnZXROb2RlIiwiYm9keUVsZW0iLCJkb2N1bWVudCIsImJvZHkiLCJmbGFnIiwiVlhFVGFibGVQbHVnaW5JVmlldyIsImluc3RhbGwiLCJ4dGFibGUiLCJpbnRlcmNlcHRvciIsInJlbmRlcmVyIiwibWl4aW4iLCJhZGQiLCJ3aW5kb3ciLCJWWEVUYWJsZSIsInVzZSJdLCJtYXBwaW5ncyI6Ijs7Ozs7OztB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WEUsUUFEVztBQUU5QkEsSUFBQUEsUUFBUSxDQUFDQyxLQUFULENBQWV0QyxTQUFmO0FBQ0FvQyxJQUFBQSxXQUFXLENBQUNHLEdBQVosQ0FBZ0IsbUJBQWhCLEVBQXFDWixnQkFBckM7QUFDQVMsSUFBQUEsV0FBVyxDQUFDRyxHQUFaLENBQWdCLG9CQUFoQixFQUFzQ1osZ0JBQXRDO0FBQ0Q7QUFOZ0MsQ0FBNUI7OztBQVNQLElBQUksT0FBT2EsTUFBUCxLQUFrQixXQUFsQixJQUFpQ0EsTUFBTSxDQUFDQyxRQUE1QyxFQUFzRDtBQUNwREQsRUFBQUEsTUFBTSxDQUFDQyxRQUFQLENBQWdCQyxHQUFoQixDQUFvQlQsbUJBQXBCO0FBQ0Q7O2VBRWNBLG1CIiwiZmlsZSI6ImluZGV4LmNvbW1vbi5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBYRVV0aWxzIGZyb20gJ3hlLXV0aWxzL21ldGhvZHMveGUtdXRpbHMnXHJcbmltcG9ydCBWWEVUYWJsZSBmcm9tICd2eGUtdGFibGUvbGliL3Z4ZS10YWJsZSdcclxuXHJcbmZ1bmN0aW9uIGlzRW1wdHlWYWx1ZSAoY2VsbFZhbHVlOiBhbnkpIHtcclxuICByZXR1cm4gY2VsbFZhbHVlID09PSBudWxsIHx8IGNlbGxWYWx1ZSA9PT0gdW5kZWZpbmVkIHx8IGNlbGxWYWx1ZSA9PT0gJydcclxufVxyXG5cclxuZnVuY3Rpb24gZ2V0Rm9ybWF0RGF0ZSAodmFsdWU6IGFueSwgcHJvcHM6IGFueSwgZGVmYXVsdEZvcm1hdDogc3RyaW5nKSB7XHJcbiAgcmV0dXJuIFhFVXRpbHMudG9EYXRlU3RyaW5nKHZhbHVlLCBwcm9wcy5mb3JtYXQgfHwgZGVmYXVsdEZvcm1hdClcclxufVxyXG5cclxuZnVuY3Rpb24gZ2V0Rm9ybWF0RGF0ZXMgKHZhbHVlczogYW55LCBwcm9wczogYW55LCBzZXBhcmF0b3I6IHN0cmluZywgZGVmYXVsdEZvcm1hdDogc3RyaW5nKSB7XHJcbiAgcmV0dXJuIFhFVXRpbHMubWFwKHZhbHVlcywgKGRhdGU6IGFueSkgPT4gZ2V0Rm9ybWF0RGF0ZShkYXRlLCBwcm9wcywgZGVmYXVsdEZvcm1hdCkpLmpvaW4oc2VwYXJhdG9yKVxyXG59XHJcblxyXG5mdW5jdGlvbiBlcXVhbERhdGVyYW5nZSAoY2VsbFZhbHVlOiBhbnksIGRhdGE6IGFueSwgcHJvcHM6IGFueSwgZGVmYXVsdEZvcm1hdDogc3RyaW5nKSB7XHJcbiAgY2VsbFZhbHVlID0gZ2V0Rm9ybWF0RGF0ZShjZWxsVmFsdWUsIHByb3BzLCBkZWZhdWx0Rm9ybWF0KVxyXG4gIHJldHVybiBjZWxsVmFsdWUgPj0gZ2V0Rm9ybWF0RGF0ZShkYXRhWzBdLCBwcm9wcywgZGVmYXVsdEZvcm1hdCkgJiYgY2VsbFZhbHVlIDw9IGdldEZvcm1hdERhdGUoZGF0YVsxXSwgcHJvcHMsIGRlZmF1bHRGb3JtYXQpXHJcbn1cclxuXHJcbmZ1bmN0aW9uIG1hdGNoQ2FzY2FkZXJEYXRhIChpbmRleDogbnVtYmVyLCBsaXN0OiBBcnJheTxhbnk+LCB2YWx1ZXM6IEFycmF5PGFueT4sIGxhYmVsczogQXJyYXk8YW55Pikge1xyXG4gIGxldCB2YWwgPSB2YWx1ZXNbaW5kZXhdXHJcbiAgaWYgKGxpc3QgJiYgdmFsdWVzLmxlbmd0aCA+IGluZGV4KSB7XHJcbiAgICBYRVV0aWxzLmVhY2gobGlzdCwgKGl0ZW06IGFueSkgPT4ge1xyXG4gICAgICBpZiAoaXRlbS52YWx1ZSA9PT0gdmFsKSB7XHJcbiAgICAgICAgbGFiZWxzLnB1c2goaXRlbS5sYWJlbClcclxuICAgICAgICBtYXRjaENhc2NhZGVyRGF0YSgrK2luZGV4LCBpdGVtLmNoaWxkcmVuLCB2YWx1ZXMsIGxhYmVscylcclxuICAgICAgfVxyXG4gICAgfSlcclxuICB9XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGdldFByb3BzICh7ICR0YWJsZSB9OiBhbnksIHsgcHJvcHMgfTogYW55LCBkZWZhdWx0UHJvcHM/OiBhbnkpIHtcclxuICByZXR1cm4gWEVVdGlscy5hc3NpZ24oJHRhYmxlLnZTaXplID8geyBzaXplOiAkdGFibGUudlNpemUgfSA6IHt9LCBkZWZhdWx0UHJvcHMsIHByb3BzKVxyXG59XHJcblxyXG5mdW5jdGlvbiBnZXRDZWxsRXZlbnRzIChyZW5kZXJPcHRzOiBhbnksIHBhcmFtczogYW55KSB7XHJcbiAgbGV0IHsgZXZlbnRzIH0gPSByZW5kZXJPcHRzXHJcbiAgbGV0IHsgJHRhYmxlIH0gPSBwYXJhbXNcclxuICBsZXQgdHlwZSA9ICdvbi1jaGFuZ2UnXHJcbiAgbGV0IG9uID0ge1xyXG4gICAgW3R5cGVdOiAoZXZudDogYW55KSA9PiB7XHJcbiAgICAgICR0YWJsZS51cGRhdGVTdGF0dXMocGFyYW1zKVxyXG4gICAgICBpZiAoZXZlbnRzICYmIGV2ZW50c1t0eXBlXSkge1xyXG4gICAgICAgIGV2ZW50c1t0eXBlXShwYXJhbXMsIGV2bnQpXHJcbiAgICAgIH1cclxuICAgIH1cclxuICB9XHJcbiAgaWYgKGV2ZW50cykge1xyXG4gICAgcmV0dXJuIFhFVXRpbHMuYXNzaWduKHt9LCBYRVV0aWxzLm9iamVjdE1hcChldmVudHMsIChjYjogRnVuY3Rpb24pID0+IGZ1bmN0aW9uICguLi5hcmdzOiBhbnlbXSkge1xyXG4gICAgICBjYi5hcHBseShudWxsLCBbcGFyYW1zXS5jb25jYXQuYXBwbHkocGFyYW1zLCBhcmdzKSlcclxuICAgIH0pLCBvbilcclxuICB9XHJcbiAgcmV0dXJuIG9uXHJcbn1cclxuXHJcbmZ1bmN0aW9uIGdldFNlbGVjdENlbGxWYWx1ZSAocmVuZGVyT3B0czogYW55LCBwYXJhbXM6IGFueSkge1xyXG4gIGxldCB7IG9wdGlvbnMsIG9wdGlvbkdyb3VwcywgcHJvcHMgPSB7fSwgb3B0aW9uUHJvcHMgPSB7fSwgb3B0aW9uR3JvdXBQcm9wcyA9IHt9IH0gPSByZW5kZXJPcHRzXHJcbiAgbGV0IHsgJHRhYmxlLCByb3csIGNvbHVtbiB9ID0gcGFyYW1zXHJcbiAgbGV0IGxhYmVsUHJvcCA9IG9wdGlvblByb3BzLmxhYmVsIHx8ICdsYWJlbCdcclxuICBsZXQgdmFsdWVQcm9wID0gb3B0aW9uUHJvcHMudmFsdWUgfHwgJ3ZhbHVlJ1xyXG4gIGxldCBncm91cE9wdGlvbnMgPSBvcHRpb25Hcm91cFByb3BzLm9wdGlvbnMgfHwgJ29wdGlvbnMnXHJcbiAgbGV0IGNlbGxWYWx1ZSA9IFhFVXRpbHMuZ2V0KHJvdywgY29sdW1uLnByb3BlcnR5KVxyXG4gIGxldCBjb2xpZDogc3RyaW5nID0gY29sdW1uLmlkXHJcbiAgbGV0IHJlc3Q6IGFueVxyXG4gIGxldCBjZWxsRGF0YTogYW55XHJcbiAgaWYgKHByb3BzLmZpbHRlcmFibGUpIHtcclxuICAgIGxldCBmdWxsQWxsRGF0YVJvd01hcDogTWFwPGFueSwgYW55PiA9ICR0YWJsZS5mdWxsQWxsRGF0YVJvd01hcFxyXG4gICAgbGV0IGNhY2hlQ2VsbDogYW55ID0gZnVsbEFsbERhdGFSb3dNYXAuaGFzKHJvdylcclxuICAgIGlmIChjYWNoZUNlbGwpIHtcclxuICAgICAgcmVzdCA9IGZ1bGxBbGxEYXRhUm93TWFwLmdldChyb3cpXHJcbiAgICAgIGNlbGxEYXRhID0gcmVzdC5jZWxsRGF0YVxyXG4gICAgICBpZiAoIWNlbGxEYXRhKSB7XHJcbiAgICAgICAgY2VsbERhdGEgPSBmdWxsQWxsRGF0YVJvd01hcC5nZXQocm93KS5jZWxsRGF0YSA9IHt9XHJcbiAgICAgIH1cclxuICAgIH1cclxuICAgIGlmIChyZXN0ICYmIGNlbGxEYXRhW2NvbGlkXSAmJiBjZWxsRGF0YVtjb2xpZF0udmFsdWUgPT09IGNlbGxWYWx1ZSkge1xyXG4gICAgICByZXR1cm4gY2VsbERhdGFbY29saWRdLmxhYmVsXHJcbiAgICB9XHJcbiAgfVxyXG4gIGlmICghaXNFbXB0eVZhbHVlKGNlbGxWYWx1ZSkpIHtcclxuICAgIHJldHVybiBYRVV0aWxzLm1hcChwcm9wcy5tdWx0aXBsZSA/IGNlbGxWYWx1ZSA6IFtjZWxsVmFsdWVdLCBvcHRpb25Hcm91cHMgPyAodmFsdWU6IGFueSkgPT4ge1xyXG4gICAgICBsZXQgc2VsZWN0SXRlbVxyXG4gICAgICBmb3IgKGxldCBpbmRleCA9IDA7IGluZGV4IDwgb3B0aW9uR3JvdXBzLmxlbmd0aDsgaW5kZXgrKykge1xyXG4gICAgICAgIHNlbGVjdEl0ZW0gPSBYRVV0aWxzLmZpbmQob3B0aW9uR3JvdXBzW2luZGV4XVtncm91cE9wdGlvbnNdLCAoaXRlbTogYW55KSA9PiBpdGVtW3ZhbHVlUHJvcF0gPT09IHZhbHVlKVxyXG4gICAgICAgIGlmIChzZWxlY3RJdGVtKSB7XHJcbiAgICAgICAgICBicmVha1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgICBsZXQgY2VsbExhYmVsOiBhbnkgPSBzZWxlY3RJdGVtID8gc2VsZWN0SXRlbVtsYWJlbFByb3BdIDogdmFsdWVcclxuICAgICAgaWYgKGNlbGxEYXRhICYmIG9wdGlvbnMgJiYgb3B0aW9ucy5sZW5ndGgpIHtcclxuICAgICAgICBjZWxsRGF0YVtjb2xpZF0gPSB7IHZhbHVlOiBjZWxsVmFsdWUsIGxhYmVsOiBjZWxsTGFiZWwgfVxyXG4gICAgICB9XHJcbiAgICAgIHJldHVybiBjZWxsTGFiZWxcclxuICAgIH0gOiAodmFsdWU6IGFueSkgPT4ge1xyXG4gICAgICBsZXQgc2VsZWN0SXRlbSA9IFhFVXRpbHMuZmluZChvcHRpb25zLCAoaXRlbTogYW55KSA9PiBpdGVtW3ZhbHVlUHJvcF0gPT09IHZhbHVlKVxyXG4gICAgICBsZXQgY2VsbExhYmVsOiBhbnkgPSBzZWxlY3RJdGVtID8gc2VsZWN0SXRlbVtsYWJlbFByb3BdIDogdmFsdWVcclxuICAgICAgaWYgKGNlbGxEYXRhICYmIG9wdGlvbnMgJiYgb3B0aW9ucy5sZW5ndGgpIHtcclxuICAgICAgICBjZWxsRGF0YVtjb2xpZF0gPSB7IHZhbHVlOiBjZWxsVmFsdWUsIGxhYmVsOiBjZWxsTGFiZWwgfVxyXG4gICAgICB9XHJcbiAgICAgIHJldHVybiBjZWxsTGFiZWxcclxuICAgIH0pLmpvaW4oJzsnKVxyXG4gIH1cclxuICByZXR1cm4gbnVsbFxyXG59XHJcblxyXG5mdW5jdGlvbiBnZXRDYXNjYWRlckNlbGxWYWx1ZSAocmVuZGVyT3B0czogYW55LCBwYXJhbXM6IGFueSkge1xyXG4gIGxldCB7IHByb3BzID0ge30gfSA9IHJlbmRlck9wdHNcclxuICBsZXQgeyByb3csIGNvbHVtbiB9ID0gcGFyYW1zXHJcbiAgbGV0IGNlbGxWYWx1ZSA9IFhFVXRpbHMuZ2V0KHJvdywgY29sdW1uLnByb3BlcnR5KVxyXG4gIGxldCB2YWx1ZXMgPSBjZWxsVmFsdWUgfHwgW11cclxuICBsZXQgbGFiZWxzOiBBcnJheTxhbnk+ID0gW11cclxuICBtYXRjaENhc2NhZGVyRGF0YSgwLCBwcm9wcy5kYXRhLCB2YWx1ZXMsIGxhYmVscylcclxuICByZXR1cm4gbGFiZWxzLmpvaW4oYCAke3Byb3BzLnNlcGFyYXRvciB8fCAnLyd9IGApXHJcbn1cclxuXHJcbmZ1bmN0aW9uIGdldERhdGVQaWNrZXJDZWxsVmFsdWUgKHJlbmRlck9wdHM6IGFueSwgcGFyYW1zOiBhbnkpIHtcclxuICBsZXQgeyBwcm9wcyA9IHt9IH0gPSByZW5kZXJPcHRzXHJcbiAgbGV0IHsgcm93LCBjb2x1bW4gfSA9IHBhcmFtc1xyXG4gIGxldCB7IHNlcGFyYXRvciB9ID0gcHJvcHNcclxuICBsZXQgY2VsbFZhbHVlID0gWEVVdGlscy5nZXQocm93LCBjb2x1bW4ucHJvcGVydHkpXHJcbiAgc3dpdGNoIChwcm9wcy50eXBlKSB7XHJcbiAgICBjYXNlICd3ZWVrJzpcclxuICAgICAgY2VsbFZhbHVlID0gZ2V0Rm9ybWF0RGF0ZShjZWxsVmFsdWUsIHByb3BzLCAneXl5eXdXVycpXHJcbiAgICAgIGJyZWFrXHJcbiAgICBjYXNlICdtb250aCc6XHJcbiAgICAgIGNlbGxWYWx1ZSA9IGdldEZvcm1hdERhdGUoY2VsbFZhbHVlLCBwcm9wcywgJ3l5eXktTU0nKVxyXG4gICAgICBicmVha1xyXG4gICAgY2FzZSAneWVhcic6XHJcbiAgICAgIGNlbGxWYWx1ZSA9IGdldEZvcm1hdERhdGUoY2VsbFZhbHVlLCBwcm9wcywgJ3l5eXknKVxyXG4gICAgICBicmVha1xyXG4gICAgY2FzZSAnZGF0ZXMnOlxyXG4gICAgICBjZWxsVmFsdWUgPSBnZXRGb3JtYXREYXRlcyhjZWxsVmFsdWUsIHByb3BzLCAnLCAnLCAneXl5eS1NTS1kZCcpXHJcbiAgICAgIGJyZWFrXHJcbiAgICBjYXNlICdkYXRlcmFuZ2UnOlxyXG4gICAgICBjZWxsVmFsdWUgPSBnZXRGb3JtYXREYXRlcyhjZWxsVmFsdWUsIHByb3BzLCBgICR7c2VwYXJhdG9yIHx8ICctJ30gYCwgJ3l5eXktTU0tZGQnKVxyXG4gICAgICBicmVha1xyXG4gICAgY2FzZSAnZGF0ZXRpbWVyYW5nZSc6XHJcbiAgICAgIGNlbGxWYWx1ZSA9IGdldEZvcm1hdERhdGVzKGNlbGxWYWx1ZSwgcHJvcHMsIGAgJHtzZXBhcmF0b3IgfHwgJy0nfSBgLCAneXl5eS1NTS1kZCBISDpzczptbScpXHJcbiAgICAgIGJyZWFrXHJcbiAgICBkZWZhdWx0OlxyXG4gICAgICBjZWxsVmFsdWUgPSBnZXRGb3JtYXREYXRlKGNlbGxWYWx1ZSwgcHJvcHMsICd5eXl5LU1NLWRkJylcclxuICAgICAgYnJlYWtcclxuICB9XHJcbiAgcmV0dXJuIGNlbGxWYWx1ZVxyXG59XHJcblxyXG5mdW5jdGlvbiBjcmVhdGVFZGl0UmVuZGVyIChkZWZhdWx0UHJvcHM/OiBhbnkpIHtcclxuICByZXR1cm4gZnVuY3Rpb24gKGg6IEZ1bmN0aW9uLCByZW5kZXJPcHRzOiBhbnksIHBhcmFtczogYW55KSB7XHJcbiAgICBsZXQgeyByb3csIGNvbHVtbiB9ID0gcGFyYW1zXHJcbiAgICBsZXQgeyBhdHRycyB9ID0gcmVuZGVyT3B0c1xyXG4gICAgbGV0IHByb3BzID0gZ2V0UHJvcHMocGFyYW1zLCByZW5kZXJPcHRzLCBkZWZhdWx0UHJvcHMpXHJcbiAgICByZXR1cm4gW1xyXG4gICAgICBoKHJlbmRlck9wdHMubmFtZSwge1xyXG4gICAgICAgIHByb3BzLFxyXG4gICAgICAgIGF0dHJzLFxyXG4gICAgICAgIG1vZGVsOiB7XHJcbiAgICAgICAgICB2YWx1ZTogWEVVdGlscy5nZXQocm93LCBjb2x1bW4ucHJvcGVydHkpLFxyXG4gICAgICAgICAgY2FsbGJhY2sgKHZhbHVlOiBhbnkpIHtcclxuICAgICAgICAgICAgWEVVdGlscy5zZXQocm93LCBjb2x1bW4ucHJvcGVydHksIHZhbHVlKVxyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgb246IGdldENlbGxFdmVudHMocmVuZGVyT3B0cywgcGFyYW1zKVxyXG4gICAgICB9KVxyXG4gICAgXVxyXG4gIH1cclxufVxyXG5cclxuZnVuY3Rpb24gZ2V0RmlsdGVyRXZlbnRzIChvbjogYW55LCByZW5kZXJPcHRzOiBhbnksIHBhcmFtczogYW55LCBjb250ZXh0OiBhbnkpIHtcclxuICBsZXQgeyBldmVudHMgfSA9IHJlbmRlck9wdHNcclxuICBpZiAoZXZlbnRzKSB7XHJcbiAgICByZXR1cm4gWEVVdGlscy5hc3NpZ24oe30sIFhFVXRpbHMub2JqZWN0TWFwKGV2ZW50cywgKGNiOiBGdW5jdGlvbikgPT4gZnVuY3Rpb24gKC4uLmFyZ3M6IGFueVtdKSB7XHJcbiAgICAgIHBhcmFtcyA9IE9iamVjdC5hc3NpZ24oeyBjb250ZXh0IH0sIHBhcmFtcylcclxuICAgICAgY2IuYXBwbHkobnVsbCwgW3BhcmFtc10uY29uY2F0LmFwcGx5KHBhcmFtcywgYXJncykpXHJcbiAgICB9KSwgb24pXHJcbiAgfVxyXG4gIHJldHVybiBvblxyXG59XHJcblxyXG5mdW5jdGlvbiBjcmVhdGVGaWx0ZXJSZW5kZXIgKGRlZmF1bHRQcm9wcz86IGFueSkge1xyXG4gIHJldHVybiBmdW5jdGlvbiAoaDogRnVuY3Rpb24sIHJlbmRlck9wdHM6IGFueSwgcGFyYW1zOiBhbnksIGNvbnRleHQ6IGFueSkge1xyXG4gICAgbGV0IHsgY29sdW1uIH0gPSBwYXJhbXNcclxuICAgIGxldCB7IG5hbWUsIGF0dHJzLCBldmVudHMgfSA9IHJlbmRlck9wdHNcclxuICAgIGxldCB0eXBlID0gJ29uLWNoYW5nZSdcclxuICAgIGxldCBwcm9wcyA9IGdldFByb3BzKHBhcmFtcywgcmVuZGVyT3B0cylcclxuICAgIHJldHVybiBjb2x1bW4uZmlsdGVycy5tYXAoKGl0ZW06IGFueSkgPT4ge1xyXG4gICAgICByZXR1cm4gaChuYW1lLCB7XHJcbiAgICAgICAgcHJvcHMsXHJcbiAgICAgICAgYXR0cnMsXHJcbiAgICAgICAgbW9kZWw6IHtcclxuICAgICAgICAgIHZhbHVlOiBpdGVtLmRhdGEsXHJcbiAgICAgICAgICBjYWxsYmFjayAob3B0aW9uVmFsdWU6IGFueSkge1xyXG4gICAgICAgICAgICBpdGVtLmRhdGEgPSBvcHRpb25WYWx1ZVxyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgb246IGdldEZpbHRlckV2ZW50cyh7XHJcbiAgICAgICAgICBbdHlwZV0gKGV2bnQ6IGFueSkge1xyXG4gICAgICAgICAgICBoYW5kbGVDb25maXJtRmlsdGVyKGNvbnRleHQsIGNvbHVtbiwgISFpdGVtLmRhdGEsIGl0ZW0pXHJcbiAgICAgICAgICAgIGlmIChldmVudHMgJiYgZXZlbnRzW3R5cGVdKSB7XHJcbiAgICAgICAgICAgICAgZXZlbnRzW3R5cGVdKE9iamVjdC5hc3NpZ24oeyBjb250ZXh0IH0sIHBhcmFtcyksIGV2bnQpXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgIH1cclxuICAgICAgICB9LCByZW5kZXJPcHRzLCBwYXJhbXMsIGNvbnRleHQpXHJcbiAgICAgIH0pXHJcbiAgICB9KVxyXG4gIH1cclxufVxyXG5cclxuZnVuY3Rpb24gaGFuZGxlQ29uZmlybUZpbHRlciAoY29udGV4dDogYW55LCBjb2x1bW46IGFueSwgY2hlY2tlZDogYW55LCBpdGVtOiBhbnkpIHtcclxuICBjb250ZXh0W2NvbHVtbi5maWx0ZXJNdWx0aXBsZSA/ICdjaGFuZ2VNdWx0aXBsZU9wdGlvbicgOiAnY2hhbmdlUmFkaW9PcHRpb24nXSh7fSwgY2hlY2tlZCwgaXRlbSlcclxufVxyXG5cclxuZnVuY3Rpb24gZGVmYXVsdEZpbHRlck1ldGhvZCAoeyBvcHRpb24sIHJvdywgY29sdW1uIH06IGFueSkge1xyXG4gIGxldCB7IGRhdGEgfSA9IG9wdGlvblxyXG4gIGxldCBjZWxsVmFsdWUgPSBYRVV0aWxzLmdldChyb3csIGNvbHVtbi5wcm9wZXJ0eSlcclxuICAvKiBlc2xpbnQtZGlzYWJsZSBlcWVxZXEgKi9cclxuICByZXR1cm4gY2VsbFZhbHVlID09PSBkYXRhXHJcbn1cclxuXHJcbmZ1bmN0aW9uIHJlbmRlck9wdGlvbnMgKGg6IEZ1bmN0aW9uLCBvcHRpb25zOiBhbnksIG9wdGlvblByb3BzOiBhbnkpIHtcclxuICBsZXQgbGFiZWxQcm9wID0gb3B0aW9uUHJvcHMubGFiZWwgfHwgJ2xhYmVsJ1xyXG4gIGxldCB2YWx1ZVByb3AgPSBvcHRpb25Qcm9wcy52YWx1ZSB8fCAndmFsdWUnXHJcbiAgbGV0IGRpc2FibGVkUHJvcCA9IG9wdGlvblByb3BzLmRpc2FibGVkIHx8ICdkaXNhYmxlZCdcclxuICByZXR1cm4gWEVVdGlscy5tYXAob3B0aW9ucywgKGl0ZW06IGFueSwgaW5kZXg6IG51bWJlcikgPT4ge1xyXG4gICAgcmV0dXJuIGgoJ09wdGlvbicsIHtcclxuICAgICAgcHJvcHM6IHtcclxuICAgICAgICB2YWx1ZTogaXRlbVt2YWx1ZVByb3BdLFxyXG4gICAgICAgIGxhYmVsOiBpdGVtW2xhYmVsUHJvcF0sXHJcbiAgICAgICAgZGlzYWJsZWQ6IGl0ZW1bZGlzYWJsZWRQcm9wXVxyXG4gICAgICB9LFxyXG4gICAgICBrZXk6IGluZGV4XHJcbiAgICB9KVxyXG4gIH0pXHJcbn1cclxuXHJcbmZ1bmN0aW9uIGNlbGxUZXh0IChoOiBGdW5jdGlvbiwgY2VsbFZhbHVlOiBhbnkpIHtcclxuICByZXR1cm4gWycnICsgKGlzRW1wdHlWYWx1ZShjZWxsVmFsdWUpID8gJycgOiBjZWxsVmFsdWUpXVxyXG59XHJcblxyXG5mdW5jdGlvbiBjcmVhdGVGb3JtSXRlbVJlbmRlciAoZGVmYXVsdFByb3BzPzogYW55KSB7XHJcbiAgcmV0dXJuIGZ1bmN0aW9uIChoOiBGdW5jdGlvbiwgcmVuZGVyT3B0czogYW55LCBwYXJhbXM6IGFueSwgY29udGV4dDogYW55KSB7XHJcbiAgICBsZXQgeyBkYXRhLCBwcm9wZXJ0eSB9ID0gcGFyYW1zXHJcbiAgICBsZXQgeyBuYW1lIH0gPSByZW5kZXJPcHRzXHJcbiAgICBsZXQgeyBhdHRycyB9OiBhbnkgPSByZW5kZXJPcHRzXHJcbiAgICBsZXQgcHJvcHM6IGFueSA9IGdldEZvcm1Qcm9wcyhjb250ZXh0LCByZW5kZXJPcHRzLCBkZWZhdWx0UHJvcHMpXHJcbiAgICByZXR1cm4gW1xyXG4gICAgICBoKG5hbWUsIHtcclxuICAgICAgICBhdHRycyxcclxuICAgICAgICBwcm9wcyxcclxuICAgICAgICBtb2RlbDoge1xyXG4gICAgICAgICAgdmFsdWU6IFhFVXRpbHMuZ2V0KGRhdGEsIHByb3BlcnR5KSxcclxuICAgICAgICAgIGNhbGxiYWNrICh2YWx1ZTogYW55KSB7XHJcbiAgICAgICAgICAgIFhFVXRpbHMuc2V0KGRhdGEsIHByb3BlcnR5LCB2YWx1ZSlcclxuICAgICAgICAgIH1cclxuICAgICAgICB9LFxyXG4gICAgICAgIG9uOiBnZXRGb3JtRXZlbnRzKHJlbmRlck9wdHMsIHBhcmFtcywgY29udGV4dClcclxuICAgICAgfSlcclxuICAgIF1cclxuICB9XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGdldEZvcm1Qcm9wcyAoeyAkZm9ybSB9OiBhbnksIHsgcHJvcHMgfTogYW55LCBkZWZhdWx0UHJvcHM/OiBhbnkpIHtcclxuICByZXR1cm4gWEVVdGlscy5hc3NpZ24oJGZvcm0udlNpemUgPyB7IHNpemU6ICRmb3JtLnZTaXplIH0gOiB7fSwgZGVmYXVsdFByb3BzLCBwcm9wcylcclxufVxyXG5cclxuZnVuY3Rpb24gZ2V0Rm9ybUV2ZW50cyAocmVuZGVyT3B0czogYW55LCBwYXJhbXM6IGFueSwgY29udGV4dDogYW55KSB7XHJcbiAgbGV0IHsgZXZlbnRzIH06IGFueSA9IHJlbmRlck9wdHNcclxuICBsZXQgeyAkZm9ybSB9ID0gcGFyYW1zXHJcbiAgbGV0IHR5cGUgPSAnb24tY2hhbmdlJ1xyXG4gIGxldCBvbiA9IHtcclxuICAgIFt0eXBlXTogKGV2bnQ6IGFueSkgPT4ge1xyXG4gICAgICAkZm9ybS51cGRhdGVTdGF0dXMocGFyYW1zKVxyXG4gICAgICBpZiAoZXZlbnRzICYmIGV2ZW50c1t0eXBlXSkge1xyXG4gICAgICAgIGV2ZW50c1t0eXBlXShwYXJhbXMsIGV2bnQpXHJcbiAgICAgIH1cclxuICAgIH1cclxuICB9XHJcbiAgaWYgKGV2ZW50cykge1xyXG4gICAgcmV0dXJuIFhFVXRpbHMuYXNzaWduKHt9LCBYRVV0aWxzLm9iamVjdE1hcChldmVudHMsIChjYjogRnVuY3Rpb24pID0+IGZ1bmN0aW9uICguLi5hcmdzOiBhbnlbXSkge1xyXG4gICAgICBjYi5hcHBseShudWxsLCBbcGFyYW1zXS5jb25jYXQuYXBwbHkocGFyYW1zLCBhcmdzKSlcclxuICAgIH0pLCBvbilcclxuICB9XHJcbiAgcmV0dXJuIG9uXHJcbn1cclxuXHJcbmZ1bmN0aW9uIGNyZWF0ZUV4cG9ydE1ldGhvZCAodmFsdWVNZXRob2Q6IEZ1bmN0aW9uLCBpc0VkaXQ/OiBib29sZWFuKSB7XHJcbiAgY29uc3QgcmVuZGVyUHJvcGVydHkgPSBpc0VkaXQgPyAnZWRpdFJlbmRlcicgOiAnY2VsbFJlbmRlcidcclxuICByZXR1cm4gZnVuY3Rpb24gKHBhcmFtczogYW55KSB7XHJcbiAgICByZXR1cm4gdmFsdWVNZXRob2QocGFyYW1zLmNvbHVtbltyZW5kZXJQcm9wZXJ0eV0sIHBhcmFtcylcclxuICB9XHJcbn1cclxuXHJcbi8qKlxyXG4gKiDmuLLmn5Plh73mlbBcclxuICovXHJcbmNvbnN0IHJlbmRlck1hcDogYW55ID0ge1xyXG4gIElucHV0OiB7XHJcbiAgICBhdXRvZm9jdXM6ICdpbnB1dC5pdnUtaW5wdXQnLFxyXG4gICAgcmVuZGVyRGVmYXVsdDogY3JlYXRlRWRpdFJlbmRlcigpLFxyXG4gICAgcmVuZGVyRWRpdDogY3JlYXRlRWRpdFJlbmRlcigpLFxyXG4gICAgcmVuZGVyRmlsdGVyOiBjcmVhdGVGaWx0ZXJSZW5kZXIoKSxcclxuICAgIGZpbHRlck1ldGhvZDogZGVmYXVsdEZpbHRlck1ldGhvZCxcclxuICAgIHJlbmRlckl0ZW06IGNyZWF0ZUZvcm1JdGVtUmVuZGVyKClcclxuICB9LFxyXG4gIEF1dG9Db21wbGV0ZToge1xyXG4gICAgYXV0b2ZvY3VzOiAnaW5wdXQuaXZ1LWlucHV0JyxcclxuICAgIHJlbmRlckRlZmF1bHQ6IGNyZWF0ZUVkaXRSZW5kZXIoKSxcclxuICAgIHJlbmRlckVkaXQ6IGNyZWF0ZUVkaXRSZW5kZXIoKSxcclxuICAgIHJlbmRlckZpbHRlcjogY3JlYXRlRmlsdGVyUmVuZGVyKCksXHJcbiAgICBmaWx0ZXJNZXRob2Q6IGRlZmF1bHRGaWx0ZXJNZXRob2QsXHJcbiAgICByZW5kZXJJdGVtOiBjcmVhdGVGb3JtSXRlbVJlbmRlcigpXHJcbiAgfSxcclxuICBJbnB1dE51bWJlcjoge1xyXG4gICAgYXV0b2ZvY3VzOiAnaW5wdXQuaXZ1LWlucHV0LW51bWJlci1pbnB1dCcsXHJcbiAgICByZW5kZXJEZWZhdWx0OiBjcmVhdGVFZGl0UmVuZGVyKCksXHJcbiAgICByZW5kZXJFZGl0OiBjcmVhdGVFZGl0UmVuZGVyKCksXHJcbiAgICByZW5kZXJGaWx0ZXI6IGNyZWF0ZUZpbHRlclJlbmRlcigpLFxyXG4gICAgZmlsdGVyTWV0aG9kOiBkZWZhdWx0RmlsdGVyTWV0aG9kLFxyXG4gICAgcmVuZGVySXRlbTogY3JlYXRlRm9ybUl0ZW1SZW5kZXIoKVxyXG4gIH0sXHJcbiAgU2VsZWN0OiB7XHJcbiAgICByZW5kZXJFZGl0IChoOiBGdW5jdGlvbiwgcmVuZGVyT3B0czogYW55LCBwYXJhbXM6IGFueSkge1xyXG4gICAgICBsZXQgeyBvcHRpb25zLCBvcHRpb25Hcm91cHMsIG9wdGlvblByb3BzID0ge30sIG9wdGlvbkdyb3VwUHJvcHMgPSB7fSB9ID0gcmVuZGVyT3B0c1xyXG4gICAgICBsZXQgeyByb3csIGNvbHVtbiB9ID0gcGFyYW1zXHJcbiAgICAgIGxldCB7IGF0dHJzIH0gPSByZW5kZXJPcHRzXHJcbiAgICAgIGxldCBwcm9wcyA9IGdldFByb3BzKHBhcmFtcywgcmVuZGVyT3B0cywgeyB0cmFuc2ZlcjogdHJ1ZSB9KVxyXG4gICAgICBpZiAob3B0aW9uR3JvdXBzKSB7XHJcbiAgICAgICAgbGV0IGdyb3VwT3B0aW9ucyA9IG9wdGlvbkdyb3VwUHJvcHMub3B0aW9ucyB8fCAnb3B0aW9ucydcclxuICAgICAgICBsZXQgZ3JvdXBMYWJlbCA9IG9wdGlvbkdyb3VwUHJvcHMubGFiZWwgfHwgJ2xhYmVsJ1xyXG4gICAgICAgIHJldHVybiBbXHJcbiAgICAgICAgICBoKCdTZWxlY3QnLCB7XHJcbiAgICAgICAgICAgIHByb3BzLFxyXG4gICAgICAgICAgICBhdHRycyxcclxuICAgICAgICAgICAgbW9kZWw6IHtcclxuICAgICAgICAgICAgICB2YWx1ZTogWEVVdGlscy5nZXQocm93LCBjb2x1bW4ucHJvcGVydHkpLFxyXG4gICAgICAgICAgICAgIGNhbGxiYWNrIChjZWxsVmFsdWU6IGFueSkge1xyXG4gICAgICAgICAgICAgICAgWEVVdGlscy5zZXQocm93LCBjb2x1bW4ucHJvcGVydHksIGNlbGxWYWx1ZSlcclxuICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIG9uOiBnZXRDZWxsRXZlbnRzKHJlbmRlck9wdHMsIHBhcmFtcylcclxuICAgICAgICAgIH0sIFhFVXRpbHMubWFwKG9wdGlvbkdyb3VwcywgKGdyb3VwOiBhbnksIGdJbmRleDogbnVtYmVyKSA9PiB7XHJcbiAgICAgICAgICAgIHJldHVybiBoKCdPcHRpb25Hcm91cCcsIHtcclxuICAgICAgICAgICAgICBwcm9wczoge1xyXG4gICAgICAgICAgICAgICAgbGFiZWw6IGdyb3VwW2dyb3VwTGFiZWxdXHJcbiAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICBrZXk6IGdJbmRleFxyXG4gICAgICAgICAgICB9LCByZW5kZXJPcHRpb25zKGgsIGdyb3VwW2dyb3VwT3B0aW9uc10sIG9wdGlvblByb3BzKSlcclxuICAgICAgICAgIH0pKVxyXG4gICAgICAgIF1cclxuICAgICAgfVxyXG4gICAgICByZXR1cm4gW1xyXG4gICAgICAgIGgoJ1NlbGVjdCcsIHtcclxuICAgICAgICAgIHByb3BzLFxyXG4gICAgICAgICAgYXR0cnMsXHJcbiAgICAgICAgICBtb2RlbDoge1xyXG4gICAgICAgICAgICB2YWx1ZTogWEVVdGlscy5nZXQocm93LCBjb2x1bW4ucHJvcGVydHkpLFxyXG4gICAgICAgICAgICBjYWxsYmFjayAoY2VsbFZhbHVlOiBhbnkpIHtcclxuICAgICAgICAgICAgICBYRVV0aWxzLnNldChyb3csIGNvbHVtbi5wcm9wZXJ0eSwgY2VsbFZhbHVlKVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICB9LFxyXG4gICAgICAgICAgb246IGdldENlbGxFdmVudHMocmVuZGVyT3B0cywgcGFyYW1zKVxyXG4gICAgICAgIH0sIHJlbmRlck9wdGlvbnMoaCwgb3B0aW9ucywgb3B0aW9uUHJvcHMpKVxyXG4gICAgICBdXHJcbiAgICB9LFxyXG4gICAgcmVuZGVyQ2VsbCAoaDogRnVuY3Rpb24sIHJlbmRlck9wdHM6IGFueSwgcGFyYW1zOiBhbnkpIHtcclxuICAgICAgY2VsbFRleHQoaCwgZ2V0U2VsZWN0Q2VsbFZhbHVlKHJlbmRlck9wdHMsIHBhcmFtcykpXHJcbiAgICB9LFxyXG4gICAgcmVuZGVyRmlsdGVyIChoOiBGdW5jdGlvbiwgcmVuZGVyT3B0czogYW55LCBwYXJhbXM6IGFueSwgY29udGV4dDogYW55KSB7XHJcbiAgICAgIGxldCB7IG9wdGlvbnMsIG9wdGlvbkdyb3Vwcywgb3B0aW9uUHJvcHMgPSB7fSwgb3B0aW9uR3JvdXBQcm9wcyA9IHt9IH0gPSByZW5kZXJPcHRzXHJcbiAgICAgIGxldCB7IGNvbHVtbiB9ID0gcGFyYW1zXHJcbiAgICAgIGxldCB7IGF0dHJzLCBldmVudHMgfSA9IHJlbmRlck9wdHNcclxuICAgICAgbGV0IHByb3BzID0gZ2V0UHJvcHMocGFyYW1zLCByZW5kZXJPcHRzLCB7IHRyYW5zZmVyOiB0cnVlIH0pXHJcbiAgICAgIGxldCB0eXBlID0gJ29uLWNoYW5nZSdcclxuICAgICAgaWYgKG9wdGlvbkdyb3Vwcykge1xyXG4gICAgICAgIGxldCBncm91cE9wdGlvbnMgPSBvcHRpb25Hcm91cFByb3BzLm9wdGlvbnMgfHwgJ29wdGlvbnMnXHJcbiAgICAgICAgbGV0IGdyb3VwTGFiZWwgPSBvcHRpb25Hcm91cFByb3BzLmxhYmVsIHx8ICdsYWJlbCdcclxuICAgICAgICByZXR1cm4gY29sdW1uLmZpbHRlcnMubWFwKChpdGVtOiBhbnkpID0+IHtcclxuICAgICAgICAgIHJldHVybiBoKCdTZWxlY3QnLCB7XHJcbiAgICAgICAgICAgIHByb3BzLFxyXG4gICAgICAgICAgICBhdHRycyxcclxuICAgICAgICAgICAgbW9kZWw6IHtcclxuICAgICAgICAgICAgICB2YWx1ZTogaXRlbS5kYXRhLFxyXG4gICAgICAgICAgICAgIGNhbGxiYWNrIChvcHRpb25WYWx1ZTogYW55KSB7XHJcbiAgICAgICAgICAgICAgICBpdGVtLmRhdGEgPSBvcHRpb25WYWx1ZVxyXG4gICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgb246IGdldEZpbHRlckV2ZW50cyh7XHJcbiAgICAgICAgICAgICAgW3R5cGVdICh2YWx1ZTogYW55KSB7XHJcbiAgICAgICAgICAgICAgICBoYW5kbGVDb25maXJtRmlsdGVyKGNvbnRleHQsIGNvbHVtbiwgdmFsdWUgJiYgdmFsdWUubGVuZ3RoID4gMCwgaXRlbSlcclxuICAgICAgICAgICAgICAgIGlmIChldmVudHMgJiYgZXZlbnRzW3R5cGVdKSB7XHJcbiAgICAgICAgICAgICAgICAgIGV2ZW50c1t0eXBlXShPYmplY3QuYXNzaWduKHsgY29udGV4dCB9LCBwYXJhbXMpLCB2YWx1ZSlcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0sIHJlbmRlck9wdHMsIHBhcmFtcywgY29udGV4dClcclxuICAgICAgICAgIH0sIFhFVXRpbHMubWFwKG9wdGlvbkdyb3VwcywgKGdyb3VwOiBhbnksIGdJbmRleDogbnVtYmVyKSA9PiB7XHJcbiAgICAgICAgICAgIHJldHVybiBoKCdPcHRpb25Hcm91cCcsIHtcclxuICAgICAgICAgICAgICBwcm9wczoge1xyXG4gICAgICAgICAgICAgICAgbGFiZWw6IGdyb3VwW2dyb3VwTGFiZWxdXHJcbiAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICBrZXk6IGdJbmRleFxyXG4gICAgICAgICAgICB9LCByZW5kZXJPcHRpb25zKGgsIGdyb3VwW2dyb3VwT3B0aW9uc10sIG9wdGlvblByb3BzKSlcclxuICAgICAgICAgIH0pKVxyXG4gICAgICAgIH0pXHJcbiAgICAgIH1cclxuICAgICAgcmV0dXJuIGNvbHVtbi5maWx0ZXJzLm1hcCgoaXRlbTogYW55KSA9PiB7XHJcbiAgICAgICAgcmV0dXJuIGgoJ1NlbGVjdCcsIHtcclxuICAgICAgICAgIHByb3BzLFxyXG4gICAgICAgICAgYXR0cnMsXHJcbiAgICAgICAgICBtb2RlbDoge1xyXG4gICAgICAgICAgICB2YWx1ZTogaXRlbS5kYXRhLFxyXG4gICAgICAgICAgICBjYWxsYmFjayAob3B0aW9uVmFsdWU6IGFueSkge1xyXG4gICAgICAgICAgICAgIGl0ZW0uZGF0YSA9IG9wdGlvblZhbHVlXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgIH0sXHJcbiAgICAgICAgICBvbjogZ2V0RmlsdGVyRXZlbnRzKHtcclxuICAgICAgICAgICAgW3R5cGVdICh2YWx1ZTogYW55KSB7XHJcbiAgICAgICAgICAgICAgaGFuZGxlQ29uZmlybUZpbHRlcihjb250ZXh0LCBjb2x1bW4sIHZhbHVlICYmIHZhbHVlLmxlbmd0aCA+IDAsIGl0ZW0pXHJcbiAgICAgICAgICAgICAgaWYgKGV2ZW50cyAmJiBldmVudHNbdHlwZV0pIHtcclxuICAgICAgICAgICAgICAgIGV2ZW50c1t0eXBlXShPYmplY3QuYXNzaWduKHsgY29udGV4dCB9LCBwYXJhbXMpLCB2YWx1ZSlcclxuICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgIH0sIHJlbmRlck9wdHMsIHBhcmFtcywgY29udGV4dClcclxuICAgICAgICB9LCByZW5kZXJPcHRpb25zKGgsIG9wdGlvbnMsIG9wdGlvblByb3BzKSlcclxuICAgICAgfSlcclxuICAgIH0sXHJcbiAgICBmaWx0ZXJNZXRob2QgKHsgb3B0aW9uLCByb3csIGNvbHVtbiB9OiBhbnkpIHtcclxuICAgICAgbGV0IHsgZGF0YSB9ID0gb3B0aW9uXHJcbiAgICAgIGxldCB7IHByb3BlcnR5LCBmaWx0ZXJSZW5kZXI6IHJlbmRlck9wdHMgfSA9IGNvbHVtblxyXG4gICAgICBsZXQgeyBwcm9wcyA9IHt9IH0gPSByZW5kZXJPcHRzXHJcbiAgICAgIGxldCBjZWxsVmFsdWUgPSBYRVV0aWxzLmdldChyb3csIHByb3BlcnR5KVxyXG4gICAgICBpZiAocHJvcHMubXVsdGlwbGUpIHtcclxuICAgICAgICBpZiAoWEVVdGlscy5pc0FycmF5KGNlbGxWYWx1ZSkpIHtcclxuICAgICAgICAgIHJldHVybiBYRVV0aWxzLmluY2x1ZGVBcnJheXMoY2VsbFZhbHVlLCBkYXRhKVxyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gZGF0YS5pbmRleE9mKGNlbGxWYWx1ZSkgPiAtMVxyXG4gICAgICB9XHJcbiAgICAgIC8qIGVzbGludC1kaXNhYmxlIGVxZXFlcSAqL1xyXG4gICAgICByZXR1cm4gY2VsbFZhbHVlID09IGRhdGFcclxuICAgIH0sXHJcbiAgICByZW5kZXJJdGVtIChoOiBGdW5jdGlvbiwgcmVuZGVyT3B0czogYW55LCBwYXJhbXM6IGFueSwgY29udGV4dDogYW55KSB7XHJcbiAgICAgIGxldCB7IG9wdGlvbnMsIG9wdGlvbkdyb3Vwcywgb3B0aW9uUHJvcHMgPSB7fSwgb3B0aW9uR3JvdXBQcm9wcyA9IHt9IH0gPSByZW5kZXJPcHRzXHJcbiAgICAgIGxldCB7IGRhdGEsIHByb3BlcnR5IH0gPSBwYXJhbXNcclxuICAgICAgbGV0IHsgYXR0cnMgfSA9IHJlbmRlck9wdHNcclxuICAgICAgbGV0IHByb3BzOiBhbnkgPSBnZXRGb3JtUHJvcHMoY29udGV4dCwgcmVuZGVyT3B0cylcclxuICAgICAgaWYgKG9wdGlvbkdyb3Vwcykge1xyXG4gICAgICAgIGxldCBncm91cE9wdGlvbnM6IHN0cmluZyA9IG9wdGlvbkdyb3VwUHJvcHMub3B0aW9ucyB8fCAnb3B0aW9ucydcclxuICAgICAgICBsZXQgZ3JvdXBMYWJlbDogc3RyaW5nID0gb3B0aW9uR3JvdXBQcm9wcy5sYWJlbCB8fCAnbGFiZWwnXHJcbiAgICAgICAgcmV0dXJuIFtcclxuICAgICAgICAgIGgoJ1NlbGVjdCcsIHtcclxuICAgICAgICAgICAgcHJvcHMsXHJcbiAgICAgICAgICAgIGF0dHJzLFxyXG4gICAgICAgICAgICBtb2RlbDoge1xyXG4gICAgICAgICAgICAgIHZhbHVlOiBYRVV0aWxzLmdldChkYXRhLCBwcm9wZXJ0eSksXHJcbiAgICAgICAgICAgICAgY2FsbGJhY2sgKGNlbGxWYWx1ZTogYW55KSB7XHJcbiAgICAgICAgICAgICAgICBYRVV0aWxzLnNldChkYXRhLCBwcm9wZXJ0eSwgY2VsbFZhbHVlKVxyXG4gICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgb246IGdldEZvcm1FdmVudHMocmVuZGVyT3B0cywgcGFyYW1zLCBjb250ZXh0KVxyXG4gICAgICAgICAgfSwgWEVVdGlscy5tYXAob3B0aW9uR3JvdXBzLCAoZ3JvdXA6IGFueSwgZ0luZGV4OiBudW1iZXIpID0+IHtcclxuICAgICAgICAgICAgcmV0dXJuIGgoJ09wdGlvbkdyb3VwJywge1xyXG4gICAgICAgICAgICAgIHByb3BzOiB7XHJcbiAgICAgICAgICAgICAgICBsYWJlbDogZ3JvdXBbZ3JvdXBMYWJlbF1cclxuICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgIGtleTogZ0luZGV4XHJcbiAgICAgICAgICAgIH0sIHJlbmRlck9wdGlvbnMoaCwgZ3JvdXBbZ3JvdXBPcHRpb25zXSwgb3B0aW9uUHJvcHMpKVxyXG4gICAgICAgICAgfSkpXHJcbiAgICAgICAgXVxyXG4gICAgICB9XHJcbiAgICAgIHJldHVybiBbXHJcbiAgICAgICAgaCgnU2VsZWN0Jywge1xyXG4gICAgICAgICAgcHJvcHMsXHJcbiAgICAgICAgICBhdHRycyxcclxuICAgICAgICAgIG1vZGVsOiB7XHJcbiAgICAgICAgICAgIHZhbHVlOiBYRVV0aWxzLmdldChkYXRhLCBwcm9wZXJ0eSksXHJcbiAgICAgICAgICAgIGNhbGxiYWNrIChjZWxsVmFsdWU6IGFueSkge1xyXG4gICAgICAgICAgICAgIFhFVXRpbHMuc2V0KGRhdGEsIHByb3BlcnR5LCBjZWxsVmFsdWUpXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgIH0sXHJcbiAgICAgICAgICBvbjogZ2V0Rm9ybUV2ZW50cyhyZW5kZXJPcHRzLCBwYXJhbXMsIGNvbnRleHQpXHJcbiAgICAgICAgfSwgcmVuZGVyT3B0aW9ucyhoLCBvcHRpb25zLCBvcHRpb25Qcm9wcykpXHJcbiAgICAgIF1cclxuICAgIH0sXHJcbiAgICBlZGl0RXhwb3J0TWV0aG9kOiBjcmVhdGVFeHBvcnRNZXRob2QoZ2V0U2VsZWN0Q2VsbFZhbHVlLCB0cnVlKSxcclxuICAgIGNlbGxFeHBvcnRNZXRob2Q6IGNyZWF0ZUV4cG9ydE1ldGhvZChnZXRTZWxlY3RDZWxsVmFsdWUpXHJcbiAgfSxcclxuICBDYXNjYWRlcjoge1xyXG4gICAgcmVuZGVyRWRpdDogY3JlYXRlRWRpdFJlbmRlcih7IHRyYW5zZmVyOiB0cnVlIH0pLFxyXG4gICAgcmVuZGVyQ2VsbCAoaDogRnVuY3Rpb24sIHJlbmRlck9wdHM6IGFueSwgcGFyYW1zOiBhbnkpIHtcclxuICAgICAgcmV0dXJuIGNlbGxUZXh0KGgsIGdldENhc2NhZGVyQ2VsbFZhbHVlKHJlbmRlck9wdHMsIHBhcmFtcykpXHJcbiAgICB9LFxyXG4gICAgcmVuZGVySXRlbTogY3JlYXRlRm9ybUl0ZW1SZW5kZXIoKSxcclxuICAgIGVkaXRFeHBvcnRNZXRob2Q6IGNyZWF0ZUV4cG9ydE1ldGhvZChnZXRDYXNjYWRlckNlbGxWYWx1ZSwgdHJ1ZSksXHJcbiAgICBjZWxsRXhwb3J0TWV0aG9kOiBjcmVhdGVFeHBvcnRNZXRob2QoZ2V0Q2FzY2FkZXJDZWxsVmFsdWUpXHJcbiAgfSxcclxuICBEYXRlUGlja2VyOiB7XHJcbiAgICByZW5kZXJFZGl0OiBjcmVhdGVFZGl0UmVuZGVyKHsgdHJhbnNmZXI6IHRydWUgfSksXHJcbiAgICByZW5kZXJDZWxsIChoOiBGdW5jdGlvbiwgcmVuZGVyT3B0czogYW55LCBwYXJhbXM6IGFueSkge1xyXG4gICAgICByZXR1cm4gY2VsbFRleHQoaCwgZ2V0RGF0ZVBpY2tlckNlbGxWYWx1ZShyZW5kZXJPcHRzLCBwYXJhbXMpKVxyXG4gICAgfSxcclxuICAgIHJlbmRlckZpbHRlciAoaDogRnVuY3Rpb24sIHJlbmRlck9wdHM6IGFueSwgcGFyYW1zOiBhbnksIGNvbnRleHQ6IGFueSkge1xyXG4gICAgICBsZXQgeyBjb2x1bW4gfSA9IHBhcmFtc1xyXG4gICAgICBsZXQgeyBhdHRycywgZXZlbnRzIH0gPSByZW5kZXJPcHRzXHJcbiAgICAgIGxldCBwcm9wcyA9IGdldFByb3BzKHBhcmFtcywgcmVuZGVyT3B0cywgeyB0cmFuc2ZlcjogdHJ1ZSB9KVxyXG4gICAgICBsZXQgdHlwZSA9ICdvbi1jaGFuZ2UnXHJcbiAgICAgIHJldHVybiBjb2x1bW4uZmlsdGVycy5tYXAoKGl0ZW06IGFueSkgPT4ge1xyXG4gICAgICAgIHJldHVybiBoKHJlbmRlck9wdHMubmFtZSwge1xyXG4gICAgICAgICAgcHJvcHMsXHJcbiAgICAgICAgICBhdHRycyxcclxuICAgICAgICAgIG1vZGVsOiB7XHJcbiAgICAgICAgICAgIHZhbHVlOiBpdGVtLmRhdGEsXHJcbiAgICAgICAgICAgIGNhbGxiYWNrIChvcHRpb25WYWx1ZTogYW55KSB7XHJcbiAgICAgICAgICAgICAgaXRlbS5kYXRhID0gb3B0aW9uVmFsdWVcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgfSxcclxuICAgICAgICAgIG9uOiBnZXRGaWx0ZXJFdmVudHMoe1xyXG4gICAgICAgICAgICBbdHlwZV0gKHZhbHVlOiBhbnkpIHtcclxuICAgICAgICAgICAgICBoYW5kbGVDb25maXJtRmlsdGVyKGNvbnRleHQsIGNvbHVtbiwgISF2YWx1ZSwgaXRlbSlcclxuICAgICAgICAgICAgICBpZiAoZXZlbnRzICYmIGV2ZW50c1t0eXBlXSkge1xyXG4gICAgICAgICAgICAgICAgZXZlbnRzW3R5cGVdKE9iamVjdC5hc3NpZ24oeyBjb250ZXh0IH0sIHBhcmFtcyksIHZhbHVlKVxyXG4gICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgfSwgcmVuZGVyT3B0cywgcGFyYW1zLCBjb250ZXh0KVxyXG4gICAgICAgIH0pXHJcbiAgICAgIH0pXHJcbiAgICB9LFxyXG4gICAgZmlsdGVyTWV0aG9kICh7IG9wdGlvbiwgcm93LCBjb2x1bW4gfTogYW55KSB7XHJcbiAgICAgIGxldCB7IGRhdGEgfSA9IG9wdGlvblxyXG4gICAgICBsZXQgeyBmaWx0ZXJSZW5kZXI6IHJlbmRlck9wdHMgfSA9IGNvbHVtblxyXG4gICAgICBsZXQgeyBwcm9wcyA9IHt9IH0gPSByZW5kZXJPcHRzXHJcbiAgICAgIGxldCBjZWxsVmFsdWUgPSBYRVV0aWxzLmdldChyb3csIGNvbHVtbi5wcm9wZXJ0eSlcclxuICAgICAgaWYgKGRhdGEpIHtcclxuICAgICAgICBzd2l0Y2ggKHByb3BzLnR5cGUpIHtcclxuICAgICAgICAgIGNhc2UgJ2RhdGVyYW5nZSc6XHJcbiAgICAgICAgICAgIHJldHVybiBlcXVhbERhdGVyYW5nZShjZWxsVmFsdWUsIGRhdGEsIHByb3BzLCAneXl5eS1NTS1kZCcpXHJcbiAgICAgICAgICBjYXNlICdkYXRldGltZXJhbmdlJzpcclxuICAgICAgICAgICAgcmV0dXJuIGVxdWFsRGF0ZXJhbmdlKGNlbGxWYWx1ZSwgZGF0YSwgcHJvcHMsICd5eXl5LU1NLWRkIEhIOnNzOm1tJylcclxuICAgICAgICAgIGRlZmF1bHQ6XHJcbiAgICAgICAgICAgIHJldHVybiBjZWxsVmFsdWUgPT09IGRhdGFcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgICAgcmV0dXJuIGZhbHNlXHJcbiAgICB9LFxyXG4gICAgcmVuZGVySXRlbTogY3JlYXRlRm9ybUl0ZW1SZW5kZXIoKSxcclxuICAgIGVkaXRFeHBvcnRNZXRob2Q6IGNyZWF0ZUV4cG9ydE1ldGhvZChnZXREYXRlUGlja2VyQ2VsbFZhbHVlLCB0cnVlKSxcclxuICAgIGNlbGxFeHBvcnRNZXRob2Q6IGNyZWF0ZUV4cG9ydE1ldGhvZChnZXREYXRlUGlja2VyQ2VsbFZhbHVlKVxyXG4gIH0sXHJcbiAgVGltZVBpY2tlcjoge1xyXG4gICAgcmVuZGVyRWRpdDogY3JlYXRlRWRpdFJlbmRlcih7IHRyYW5zZmVyOiB0cnVlIH0pLFxyXG4gICAgcmVuZGVySXRlbTogY3JlYXRlRm9ybUl0ZW1SZW5kZXIoKVxyXG4gIH0sXHJcbiAgUmF0ZToge1xyXG4gICAgcmVuZGVyRGVmYXVsdDogY3JlYXRlRWRpdFJlbmRlcigpLFxyXG4gICAgcmVuZGVyRWRpdDogY3JlYXRlRWRpdFJlbmRlcigpLFxyXG4gICAgcmVuZGVyRmlsdGVyOiBjcmVhdGVGaWx0ZXJSZW5kZXIoKSxcclxuICAgIGZpbHRlck1ldGhvZDogZGVmYXVsdEZpbHRlck1ldGhvZCxcclxuICAgIHJlbmRlckl0ZW06IGNyZWF0ZUZvcm1JdGVtUmVuZGVyKClcclxuICB9LFxyXG4gIGlTd2l0Y2g6IHtcclxuICAgIHJlbmRlckRlZmF1bHQ6IGNyZWF0ZUVkaXRSZW5kZXIoKSxcclxuICAgIHJlbmRlckVkaXQ6IGNyZWF0ZUVkaXRSZW5kZXIoKSxcclxuICAgIHJlbmRlckZpbHRlcjogY3JlYXRlRmlsdGVyUmVuZGVyKCksXHJcbiAgICBmaWx0ZXJNZXRob2Q6IGRlZmF1bHRGaWx0ZXJNZXRob2QsXHJcbiAgICByZW5kZXJJdGVtOiBjcmVhdGVGb3JtSXRlbVJlbmRlcigpXHJcbiAgfVxyXG59XHJcblxyXG4vKipcclxuICog5LqL5Lu25YW85a655oCn5aSE55CGXHJcbiAqL1xyXG5mdW5jdGlvbiBoYW5kbGVDbGVhckV2ZW50IChwYXJhbXM6IGFueSwgZXZudDogYW55LCBjb250ZXh0OiBhbnkpIHtcclxuICBsZXQgeyBnZXRFdmVudFRhcmdldE5vZGUgfSA9IGNvbnRleHRcclxuICBsZXQgYm9keUVsZW0gPSBkb2N1bWVudC5ib2R5XHJcbiAgaWYgKFxyXG4gICAgLy8g5LiL5ouJ5qGG44CB5pel5pyfXHJcbiAgICBnZXRFdmVudFRhcmdldE5vZGUoZXZudCwgYm9keUVsZW0sICdpdnUtc2VsZWN0LWRyb3Bkb3duJykuZmxhZ1xyXG4gICkge1xyXG4gICAgcmV0dXJuIGZhbHNlXHJcbiAgfVxyXG59XHJcblxyXG4vKipcclxuICog5Z+65LqOIHZ4ZS10YWJsZSDooajmoLznmoTpgILphY3mj5Lku7bvvIznlKjkuo7lhbzlrrkgaXZpZXcg57uE5Lu25bqTXHJcbiAqL1xyXG5leHBvcnQgY29uc3QgVlhFVGFibGVQbHVnaW5JVmlldyA9IHtcclxuICBpbnN0YWxsICh4dGFibGU6IHR5cGVvZiBWWEVUYWJsZSkge1xyXG4gICAgbGV0IHsgaW50ZXJjZXB0b3IsIHJlbmRlcmVyIH0gPSB4dGFibGVcclxuICAgIHJlbmRlcmVyLm1peGluKHJlbmRlck1hcClcclxuICAgIGludGVyY2VwdG9yLmFkZCgnZXZlbnQuY2xlYXJGaWx0ZXInLCBoYW5kbGVDbGVhckV2ZW50KVxyXG4gICAgaW50ZXJjZXB0b3IuYWRkKCdldmVudC5jbGVhckFjdGl2ZWQnLCBoYW5kbGVDbGVhckV2ZW50KVxyXG4gIH1cclxufVxyXG5cclxuaWYgKHR5cGVvZiB3aW5kb3cgIT09ICd1bmRlZmluZWQnICYmIHdpbmRvdy5WWEVUYWJsZSkge1xyXG4gIHdpbmRvdy5WWEVUYWJsZS51c2UoVlhFVGFibGVQbHVnaW5JVmlldylcclxufVxyXG5cclxuZXhwb3J0IGRlZmF1bHQgVlhFVGFibGVQbHVnaW5JVmlld1xyXG4iXX0=
