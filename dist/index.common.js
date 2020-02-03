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
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImluZGV4LnRzIl0sIm5hbWVzIjpbImlzRW1wdHlWYWx1ZSIsImNlbGxWYWx1ZSIsInVuZGVmaW5lZCIsImdldEZvcm1hdERhdGUiLCJ2YWx1ZSIsInByb3BzIiwiZGVmYXVsdEZvcm1hdCIsIlhFVXRpbHMiLCJ0b0RhdGVTdHJpbmciLCJmb3JtYXQiLCJnZXRGb3JtYXREYXRlcyIsInZhbHVlcyIsInNlcGFyYXRvciIsIm1hcCIsImRhdGUiLCJqb2luIiwiZXF1YWxEYXRlcmFuZ2UiLCJkYXRhIiwibWF0Y2hDYXNjYWRlckRhdGEiLCJpbmRleCIsImxpc3QiLCJsYWJlbHMiLCJ2YWwiLCJsZW5ndGgiLCJlYWNoIiwiaXRlbSIsInB1c2giLCJsYWJlbCIsImNoaWxkcmVuIiwiZ2V0UHJvcHMiLCJkZWZhdWx0UHJvcHMiLCIkdGFibGUiLCJhc3NpZ24iLCJ2U2l6ZSIsInNpemUiLCJnZXRDZWxsRXZlbnRzIiwicmVuZGVyT3B0cyIsInBhcmFtcyIsImV2ZW50cyIsInR5cGUiLCJvbiIsImV2bnQiLCJ1cGRhdGVTdGF0dXMiLCJvYmplY3RNYXAiLCJjYiIsImFyZ3MiLCJhcHBseSIsImNvbmNhdCIsImdldFNlbGVjdENlbGxWYWx1ZSIsIm9wdGlvbnMiLCJvcHRpb25Hcm91cHMiLCJvcHRpb25Qcm9wcyIsIm9wdGlvbkdyb3VwUHJvcHMiLCJyb3ciLCJjb2x1bW4iLCJsYWJlbFByb3AiLCJ2YWx1ZVByb3AiLCJncm91cE9wdGlvbnMiLCJnZXQiLCJwcm9wZXJ0eSIsImNvbGlkIiwiaWQiLCJyZXN0IiwiY2VsbERhdGEiLCJmaWx0ZXJhYmxlIiwiZnVsbEFsbERhdGFSb3dNYXAiLCJjYWNoZUNlbGwiLCJoYXMiLCJtdWx0aXBsZSIsInNlbGVjdEl0ZW0iLCJmaW5kIiwiY2VsbExhYmVsIiwiZ2V0Q2FzY2FkZXJDZWxsVmFsdWUiLCJnZXREYXRlUGlja2VyQ2VsbFZhbHVlIiwiY3JlYXRlRWRpdFJlbmRlciIsImgiLCJhdHRycyIsIm5hbWUiLCJtb2RlbCIsImNhbGxiYWNrIiwic2V0IiwiZ2V0RmlsdGVyRXZlbnRzIiwiY29udGV4dCIsIk9iamVjdCIsImNyZWF0ZUZpbHRlclJlbmRlciIsImZpbHRlcnMiLCJvcHRpb25WYWx1ZSIsImhhbmRsZUNvbmZpcm1GaWx0ZXIiLCJjaGVja2VkIiwiZmlsdGVyTXVsdGlwbGUiLCJkZWZhdWx0RmlsdGVyTWV0aG9kIiwib3B0aW9uIiwicmVuZGVyT3B0aW9ucyIsImRpc2FibGVkUHJvcCIsImRpc2FibGVkIiwia2V5IiwiY2VsbFRleHQiLCJjcmVhdGVGb3JtSXRlbVJlbmRlciIsImZpZWxkIiwiZ2V0Rm9ybVByb3BzIiwiZ2V0Rm9ybUV2ZW50cyIsIiRmb3JtIiwiY3JlYXRlRXhwb3J0TWV0aG9kIiwidmFsdWVNZXRob2QiLCJpc0VkaXQiLCJyZW5kZXJQcm9wZXJ0eSIsInJlbmRlck1hcCIsIklucHV0IiwiYXV0b2ZvY3VzIiwicmVuZGVyRGVmYXVsdCIsInJlbmRlckVkaXQiLCJyZW5kZXJGaWx0ZXIiLCJmaWx0ZXJNZXRob2QiLCJyZW5kZXJJdGVtIiwiQXV0b0NvbXBsZXRlIiwiSW5wdXROdW1iZXIiLCJTZWxlY3QiLCJ0cmFuc2ZlciIsImdyb3VwTGFiZWwiLCJncm91cCIsImdJbmRleCIsInJlbmRlckNlbGwiLCJmaWx0ZXJSZW5kZXIiLCJpc0FycmF5IiwiaW5jbHVkZUFycmF5cyIsImluZGV4T2YiLCJlZGl0RXhwb3J0TWV0aG9kIiwiY2VsbEV4cG9ydE1ldGhvZCIsIkNhc2NhZGVyIiwiRGF0ZVBpY2tlciIsIlRpbWVQaWNrZXIiLCJSYXRlIiwiaVN3aXRjaCIsImhhbmRsZUNsZWFyRXZlbnQiLCJnZXRFdmVudFRhcmdldE5vZGUiLCJib2R5RWxlbSIsImRvY3VtZW50IiwiYm9keSIsImZsYWciLCJWWEVUYWJsZVBsdWdpbklWaWV3IiwiaW5zdGFsbCIsInh0YWJsZSIsImludGVyY2VwdG9yIiwicmVuZGVyZXIiLCJtaXhpbiIsImFkZCIsIndpbmRvdyIsIlZYRVRhYmxlIiwidXNlIl0sIm1hcHBpbmdzIjoi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VyxHQUNFRixNQURGLENBQ1hFLFFBRFc7QUFFOUJBLElBQUFBLFFBQVEsQ0FBQ0MsS0FBVCxDQUFldEMsU0FBZjtBQUNBb0MsSUFBQUEsV0FBVyxDQUFDRyxHQUFaLENBQWdCLG1CQUFoQixFQUFxQ1osZ0JBQXJDO0FBQ0FTLElBQUFBLFdBQVcsQ0FBQ0csR0FBWixDQUFnQixvQkFBaEIsRUFBc0NaLGdCQUF0QztBQUNEO0FBTmdDLENBQTVCOzs7QUFTUCxJQUFJLE9BQU9hLE1BQVAsS0FBa0IsV0FBbEIsSUFBaUNBLE1BQU0sQ0FBQ0MsUUFBNUMsRUFBc0Q7QUFDcERELEVBQUFBLE1BQU0sQ0FBQ0MsUUFBUCxDQUFnQkMsR0FBaEIsQ0FBb0JULG1CQUFwQjtBQUNEOztlQUVjQSxtQiIsImZpbGUiOiJpbmRleC5jb21tb24uanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgWEVVdGlscyBmcm9tICd4ZS11dGlscy9tZXRob2RzL3hlLXV0aWxzJ1xyXG5pbXBvcnQgVlhFVGFibGUgZnJvbSAndnhlLXRhYmxlL2xpYi92eGUtdGFibGUnXHJcblxyXG5mdW5jdGlvbiBpc0VtcHR5VmFsdWUgKGNlbGxWYWx1ZTogYW55KSB7XHJcbiAgcmV0dXJuIGNlbGxWYWx1ZSA9PT0gbnVsbCB8fCBjZWxsVmFsdWUgPT09IHVuZGVmaW5lZCB8fCBjZWxsVmFsdWUgPT09ICcnXHJcbn1cclxuXHJcbmZ1bmN0aW9uIGdldEZvcm1hdERhdGUgKHZhbHVlOiBhbnksIHByb3BzOiBhbnksIGRlZmF1bHRGb3JtYXQ6IHN0cmluZykge1xyXG4gIHJldHVybiBYRVV0aWxzLnRvRGF0ZVN0cmluZyh2YWx1ZSwgcHJvcHMuZm9ybWF0IHx8IGRlZmF1bHRGb3JtYXQpXHJcbn1cclxuXHJcbmZ1bmN0aW9uIGdldEZvcm1hdERhdGVzICh2YWx1ZXM6IGFueSwgcHJvcHM6IGFueSwgc2VwYXJhdG9yOiBzdHJpbmcsIGRlZmF1bHRGb3JtYXQ6IHN0cmluZykge1xyXG4gIHJldHVybiBYRVV0aWxzLm1hcCh2YWx1ZXMsIChkYXRlOiBhbnkpID0+IGdldEZvcm1hdERhdGUoZGF0ZSwgcHJvcHMsIGRlZmF1bHRGb3JtYXQpKS5qb2luKHNlcGFyYXRvcilcclxufVxyXG5cclxuZnVuY3Rpb24gZXF1YWxEYXRlcmFuZ2UgKGNlbGxWYWx1ZTogYW55LCBkYXRhOiBhbnksIHByb3BzOiBhbnksIGRlZmF1bHRGb3JtYXQ6IHN0cmluZykge1xyXG4gIGNlbGxWYWx1ZSA9IGdldEZvcm1hdERhdGUoY2VsbFZhbHVlLCBwcm9wcywgZGVmYXVsdEZvcm1hdClcclxuICByZXR1cm4gY2VsbFZhbHVlID49IGdldEZvcm1hdERhdGUoZGF0YVswXSwgcHJvcHMsIGRlZmF1bHRGb3JtYXQpICYmIGNlbGxWYWx1ZSA8PSBnZXRGb3JtYXREYXRlKGRhdGFbMV0sIHByb3BzLCBkZWZhdWx0Rm9ybWF0KVxyXG59XHJcblxyXG5mdW5jdGlvbiBtYXRjaENhc2NhZGVyRGF0YSAoaW5kZXg6IG51bWJlciwgbGlzdDogQXJyYXk8YW55PiwgdmFsdWVzOiBBcnJheTxhbnk+LCBsYWJlbHM6IEFycmF5PGFueT4pIHtcclxuICBsZXQgdmFsID0gdmFsdWVzW2luZGV4XVxyXG4gIGlmIChsaXN0ICYmIHZhbHVlcy5sZW5ndGggPiBpbmRleCkge1xyXG4gICAgWEVVdGlscy5lYWNoKGxpc3QsIChpdGVtOiBhbnkpID0+IHtcclxuICAgICAgaWYgKGl0ZW0udmFsdWUgPT09IHZhbCkge1xyXG4gICAgICAgIGxhYmVscy5wdXNoKGl0ZW0ubGFiZWwpXHJcbiAgICAgICAgbWF0Y2hDYXNjYWRlckRhdGEoKytpbmRleCwgaXRlbS5jaGlsZHJlbiwgdmFsdWVzLCBsYWJlbHMpXHJcbiAgICAgIH1cclxuICAgIH0pXHJcbiAgfVxyXG59XHJcblxyXG5mdW5jdGlvbiBnZXRQcm9wcyAoeyAkdGFibGUgfTogYW55LCB7IHByb3BzIH06IGFueSwgZGVmYXVsdFByb3BzPzogYW55KSB7XHJcbiAgcmV0dXJuIFhFVXRpbHMuYXNzaWduKCR0YWJsZS52U2l6ZSA/IHsgc2l6ZTogJHRhYmxlLnZTaXplIH0gOiB7fSwgZGVmYXVsdFByb3BzLCBwcm9wcylcclxufVxyXG5cclxuZnVuY3Rpb24gZ2V0Q2VsbEV2ZW50cyAocmVuZGVyT3B0czogYW55LCBwYXJhbXM6IGFueSkge1xyXG4gIGxldCB7IGV2ZW50cyB9ID0gcmVuZGVyT3B0c1xyXG4gIGxldCB7ICR0YWJsZSB9ID0gcGFyYW1zXHJcbiAgbGV0IHR5cGUgPSAnb24tY2hhbmdlJ1xyXG4gIGxldCBvbiA9IHtcclxuICAgIFt0eXBlXTogKGV2bnQ6IGFueSkgPT4ge1xyXG4gICAgICAkdGFibGUudXBkYXRlU3RhdHVzKHBhcmFtcylcclxuICAgICAgaWYgKGV2ZW50cyAmJiBldmVudHNbdHlwZV0pIHtcclxuICAgICAgICBldmVudHNbdHlwZV0ocGFyYW1zLCBldm50KVxyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgfVxyXG4gIGlmIChldmVudHMpIHtcclxuICAgIHJldHVybiBYRVV0aWxzLmFzc2lnbih7fSwgWEVVdGlscy5vYmplY3RNYXAoZXZlbnRzLCAoY2I6IEZ1bmN0aW9uKSA9PiBmdW5jdGlvbiAoLi4uYXJnczogYW55W10pIHtcclxuICAgICAgY2IuYXBwbHkobnVsbCwgW3BhcmFtc10uY29uY2F0LmFwcGx5KHBhcmFtcywgYXJncykpXHJcbiAgICB9KSwgb24pXHJcbiAgfVxyXG4gIHJldHVybiBvblxyXG59XHJcblxyXG5mdW5jdGlvbiBnZXRTZWxlY3RDZWxsVmFsdWUgKHJlbmRlck9wdHM6IGFueSwgcGFyYW1zOiBhbnkpIHtcclxuICBsZXQgeyBvcHRpb25zLCBvcHRpb25Hcm91cHMsIHByb3BzID0ge30sIG9wdGlvblByb3BzID0ge30sIG9wdGlvbkdyb3VwUHJvcHMgPSB7fSB9ID0gcmVuZGVyT3B0c1xyXG4gIGxldCB7ICR0YWJsZSwgcm93LCBjb2x1bW4gfSA9IHBhcmFtc1xyXG4gIGxldCBsYWJlbFByb3AgPSBvcHRpb25Qcm9wcy5sYWJlbCB8fCAnbGFiZWwnXHJcbiAgbGV0IHZhbHVlUHJvcCA9IG9wdGlvblByb3BzLnZhbHVlIHx8ICd2YWx1ZSdcclxuICBsZXQgZ3JvdXBPcHRpb25zID0gb3B0aW9uR3JvdXBQcm9wcy5vcHRpb25zIHx8ICdvcHRpb25zJ1xyXG4gIGxldCBjZWxsVmFsdWUgPSBYRVV0aWxzLmdldChyb3csIGNvbHVtbi5wcm9wZXJ0eSlcclxuICBsZXQgY29saWQ6IHN0cmluZyA9IGNvbHVtbi5pZFxyXG4gIGxldCByZXN0OiBhbnlcclxuICBsZXQgY2VsbERhdGE6IGFueVxyXG4gIGlmIChwcm9wcy5maWx0ZXJhYmxlKSB7XHJcbiAgICBsZXQgZnVsbEFsbERhdGFSb3dNYXA6IE1hcDxhbnksIGFueT4gPSAkdGFibGUuZnVsbEFsbERhdGFSb3dNYXBcclxuICAgIGxldCBjYWNoZUNlbGw6IGFueSA9IGZ1bGxBbGxEYXRhUm93TWFwLmhhcyhyb3cpXHJcbiAgICBpZiAoY2FjaGVDZWxsKSB7XHJcbiAgICAgIHJlc3QgPSBmdWxsQWxsRGF0YVJvd01hcC5nZXQocm93KVxyXG4gICAgICBjZWxsRGF0YSA9IHJlc3QuY2VsbERhdGFcclxuICAgICAgaWYgKCFjZWxsRGF0YSkge1xyXG4gICAgICAgIGNlbGxEYXRhID0gZnVsbEFsbERhdGFSb3dNYXAuZ2V0KHJvdykuY2VsbERhdGEgPSB7fVxyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgICBpZiAocmVzdCAmJiBjZWxsRGF0YVtjb2xpZF0gJiYgY2VsbERhdGFbY29saWRdLnZhbHVlID09PSBjZWxsVmFsdWUpIHtcclxuICAgICAgcmV0dXJuIGNlbGxEYXRhW2NvbGlkXS5sYWJlbFxyXG4gICAgfVxyXG4gIH1cclxuICBpZiAoIWlzRW1wdHlWYWx1ZShjZWxsVmFsdWUpKSB7XHJcbiAgICByZXR1cm4gWEVVdGlscy5tYXAocHJvcHMubXVsdGlwbGUgPyBjZWxsVmFsdWUgOiBbY2VsbFZhbHVlXSwgb3B0aW9uR3JvdXBzID8gKHZhbHVlOiBhbnkpID0+IHtcclxuICAgICAgbGV0IHNlbGVjdEl0ZW1cclxuICAgICAgZm9yIChsZXQgaW5kZXggPSAwOyBpbmRleCA8IG9wdGlvbkdyb3Vwcy5sZW5ndGg7IGluZGV4KyspIHtcclxuICAgICAgICBzZWxlY3RJdGVtID0gWEVVdGlscy5maW5kKG9wdGlvbkdyb3Vwc1tpbmRleF1bZ3JvdXBPcHRpb25zXSwgKGl0ZW06IGFueSkgPT4gaXRlbVt2YWx1ZVByb3BdID09PSB2YWx1ZSlcclxuICAgICAgICBpZiAoc2VsZWN0SXRlbSkge1xyXG4gICAgICAgICAgYnJlYWtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgICAgbGV0IGNlbGxMYWJlbDogYW55ID0gc2VsZWN0SXRlbSA/IHNlbGVjdEl0ZW1bbGFiZWxQcm9wXSA6IHZhbHVlXHJcbiAgICAgIGlmIChjZWxsRGF0YSAmJiBvcHRpb25zICYmIG9wdGlvbnMubGVuZ3RoKSB7XHJcbiAgICAgICAgY2VsbERhdGFbY29saWRdID0geyB2YWx1ZTogY2VsbFZhbHVlLCBsYWJlbDogY2VsbExhYmVsIH1cclxuICAgICAgfVxyXG4gICAgICByZXR1cm4gY2VsbExhYmVsXHJcbiAgICB9IDogKHZhbHVlOiBhbnkpID0+IHtcclxuICAgICAgbGV0IHNlbGVjdEl0ZW0gPSBYRVV0aWxzLmZpbmQob3B0aW9ucywgKGl0ZW06IGFueSkgPT4gaXRlbVt2YWx1ZVByb3BdID09PSB2YWx1ZSlcclxuICAgICAgbGV0IGNlbGxMYWJlbDogYW55ID0gc2VsZWN0SXRlbSA/IHNlbGVjdEl0ZW1bbGFiZWxQcm9wXSA6IHZhbHVlXHJcbiAgICAgIGlmIChjZWxsRGF0YSAmJiBvcHRpb25zICYmIG9wdGlvbnMubGVuZ3RoKSB7XHJcbiAgICAgICAgY2VsbERhdGFbY29saWRdID0geyB2YWx1ZTogY2VsbFZhbHVlLCBsYWJlbDogY2VsbExhYmVsIH1cclxuICAgICAgfVxyXG4gICAgICByZXR1cm4gY2VsbExhYmVsXHJcbiAgICB9KS5qb2luKCc7JylcclxuICB9XHJcbiAgcmV0dXJuIG51bGxcclxufVxyXG5cclxuZnVuY3Rpb24gZ2V0Q2FzY2FkZXJDZWxsVmFsdWUgKHJlbmRlck9wdHM6IGFueSwgcGFyYW1zOiBhbnkpIHtcclxuICBsZXQgeyBwcm9wcyA9IHt9IH0gPSByZW5kZXJPcHRzXHJcbiAgbGV0IHsgcm93LCBjb2x1bW4gfSA9IHBhcmFtc1xyXG4gIGxldCBjZWxsVmFsdWUgPSBYRVV0aWxzLmdldChyb3csIGNvbHVtbi5wcm9wZXJ0eSlcclxuICBsZXQgdmFsdWVzID0gY2VsbFZhbHVlIHx8IFtdXHJcbiAgbGV0IGxhYmVsczogQXJyYXk8YW55PiA9IFtdXHJcbiAgbWF0Y2hDYXNjYWRlckRhdGEoMCwgcHJvcHMuZGF0YSwgdmFsdWVzLCBsYWJlbHMpXHJcbiAgcmV0dXJuIGxhYmVscy5qb2luKGAgJHtwcm9wcy5zZXBhcmF0b3IgfHwgJy8nfSBgKVxyXG59XHJcblxyXG5mdW5jdGlvbiBnZXREYXRlUGlja2VyQ2VsbFZhbHVlIChyZW5kZXJPcHRzOiBhbnksIHBhcmFtczogYW55KSB7XHJcbiAgbGV0IHsgcHJvcHMgPSB7fSB9ID0gcmVuZGVyT3B0c1xyXG4gIGxldCB7IHJvdywgY29sdW1uIH0gPSBwYXJhbXNcclxuICBsZXQgeyBzZXBhcmF0b3IgfSA9IHByb3BzXHJcbiAgbGV0IGNlbGxWYWx1ZSA9IFhFVXRpbHMuZ2V0KHJvdywgY29sdW1uLnByb3BlcnR5KVxyXG4gIHN3aXRjaCAocHJvcHMudHlwZSkge1xyXG4gICAgY2FzZSAnd2Vlayc6XHJcbiAgICAgIGNlbGxWYWx1ZSA9IGdldEZvcm1hdERhdGUoY2VsbFZhbHVlLCBwcm9wcywgJ3l5eXl3V1cnKVxyXG4gICAgICBicmVha1xyXG4gICAgY2FzZSAnbW9udGgnOlxyXG4gICAgICBjZWxsVmFsdWUgPSBnZXRGb3JtYXREYXRlKGNlbGxWYWx1ZSwgcHJvcHMsICd5eXl5LU1NJylcclxuICAgICAgYnJlYWtcclxuICAgIGNhc2UgJ3llYXInOlxyXG4gICAgICBjZWxsVmFsdWUgPSBnZXRGb3JtYXREYXRlKGNlbGxWYWx1ZSwgcHJvcHMsICd5eXl5JylcclxuICAgICAgYnJlYWtcclxuICAgIGNhc2UgJ2RhdGVzJzpcclxuICAgICAgY2VsbFZhbHVlID0gZ2V0Rm9ybWF0RGF0ZXMoY2VsbFZhbHVlLCBwcm9wcywgJywgJywgJ3l5eXktTU0tZGQnKVxyXG4gICAgICBicmVha1xyXG4gICAgY2FzZSAnZGF0ZXJhbmdlJzpcclxuICAgICAgY2VsbFZhbHVlID0gZ2V0Rm9ybWF0RGF0ZXMoY2VsbFZhbHVlLCBwcm9wcywgYCAke3NlcGFyYXRvciB8fCAnLSd9IGAsICd5eXl5LU1NLWRkJylcclxuICAgICAgYnJlYWtcclxuICAgIGNhc2UgJ2RhdGV0aW1lcmFuZ2UnOlxyXG4gICAgICBjZWxsVmFsdWUgPSBnZXRGb3JtYXREYXRlcyhjZWxsVmFsdWUsIHByb3BzLCBgICR7c2VwYXJhdG9yIHx8ICctJ30gYCwgJ3l5eXktTU0tZGQgSEg6c3M6bW0nKVxyXG4gICAgICBicmVha1xyXG4gICAgZGVmYXVsdDpcclxuICAgICAgY2VsbFZhbHVlID0gZ2V0Rm9ybWF0RGF0ZShjZWxsVmFsdWUsIHByb3BzLCAneXl5eS1NTS1kZCcpXHJcbiAgICAgIGJyZWFrXHJcbiAgfVxyXG4gIHJldHVybiBjZWxsVmFsdWVcclxufVxyXG5cclxuZnVuY3Rpb24gY3JlYXRlRWRpdFJlbmRlciAoZGVmYXVsdFByb3BzPzogYW55KSB7XHJcbiAgcmV0dXJuIGZ1bmN0aW9uIChoOiBGdW5jdGlvbiwgcmVuZGVyT3B0czogYW55LCBwYXJhbXM6IGFueSkge1xyXG4gICAgbGV0IHsgcm93LCBjb2x1bW4gfSA9IHBhcmFtc1xyXG4gICAgbGV0IHsgYXR0cnMgfSA9IHJlbmRlck9wdHNcclxuICAgIGxldCBwcm9wcyA9IGdldFByb3BzKHBhcmFtcywgcmVuZGVyT3B0cywgZGVmYXVsdFByb3BzKVxyXG4gICAgcmV0dXJuIFtcclxuICAgICAgaChyZW5kZXJPcHRzLm5hbWUsIHtcclxuICAgICAgICBwcm9wcyxcclxuICAgICAgICBhdHRycyxcclxuICAgICAgICBtb2RlbDoge1xyXG4gICAgICAgICAgdmFsdWU6IFhFVXRpbHMuZ2V0KHJvdywgY29sdW1uLnByb3BlcnR5KSxcclxuICAgICAgICAgIGNhbGxiYWNrICh2YWx1ZTogYW55KSB7XHJcbiAgICAgICAgICAgIFhFVXRpbHMuc2V0KHJvdywgY29sdW1uLnByb3BlcnR5LCB2YWx1ZSlcclxuICAgICAgICAgIH1cclxuICAgICAgICB9LFxyXG4gICAgICAgIG9uOiBnZXRDZWxsRXZlbnRzKHJlbmRlck9wdHMsIHBhcmFtcylcclxuICAgICAgfSlcclxuICAgIF1cclxuICB9XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGdldEZpbHRlckV2ZW50cyAob246IGFueSwgcmVuZGVyT3B0czogYW55LCBwYXJhbXM6IGFueSwgY29udGV4dDogYW55KSB7XHJcbiAgbGV0IHsgZXZlbnRzIH0gPSByZW5kZXJPcHRzXHJcbiAgaWYgKGV2ZW50cykge1xyXG4gICAgcmV0dXJuIFhFVXRpbHMuYXNzaWduKHt9LCBYRVV0aWxzLm9iamVjdE1hcChldmVudHMsIChjYjogRnVuY3Rpb24pID0+IGZ1bmN0aW9uICguLi5hcmdzOiBhbnlbXSkge1xyXG4gICAgICBwYXJhbXMgPSBPYmplY3QuYXNzaWduKHsgY29udGV4dCB9LCBwYXJhbXMpXHJcbiAgICAgIGNiLmFwcGx5KG51bGwsIFtwYXJhbXNdLmNvbmNhdC5hcHBseShwYXJhbXMsIGFyZ3MpKVxyXG4gICAgfSksIG9uKVxyXG4gIH1cclxuICByZXR1cm4gb25cclxufVxyXG5cclxuZnVuY3Rpb24gY3JlYXRlRmlsdGVyUmVuZGVyIChkZWZhdWx0UHJvcHM/OiBhbnkpIHtcclxuICByZXR1cm4gZnVuY3Rpb24gKGg6IEZ1bmN0aW9uLCByZW5kZXJPcHRzOiBhbnksIHBhcmFtczogYW55LCBjb250ZXh0OiBhbnkpIHtcclxuICAgIGxldCB7IGNvbHVtbiB9ID0gcGFyYW1zXHJcbiAgICBsZXQgeyBuYW1lLCBhdHRycywgZXZlbnRzIH0gPSByZW5kZXJPcHRzXHJcbiAgICBsZXQgdHlwZSA9ICdvbi1jaGFuZ2UnXHJcbiAgICBsZXQgcHJvcHMgPSBnZXRQcm9wcyhwYXJhbXMsIHJlbmRlck9wdHMpXHJcbiAgICByZXR1cm4gY29sdW1uLmZpbHRlcnMubWFwKChpdGVtOiBhbnkpID0+IHtcclxuICAgICAgcmV0dXJuIGgobmFtZSwge1xyXG4gICAgICAgIHByb3BzLFxyXG4gICAgICAgIGF0dHJzLFxyXG4gICAgICAgIG1vZGVsOiB7XHJcbiAgICAgICAgICB2YWx1ZTogaXRlbS5kYXRhLFxyXG4gICAgICAgICAgY2FsbGJhY2sgKG9wdGlvblZhbHVlOiBhbnkpIHtcclxuICAgICAgICAgICAgaXRlbS5kYXRhID0gb3B0aW9uVmFsdWVcclxuICAgICAgICAgIH1cclxuICAgICAgICB9LFxyXG4gICAgICAgIG9uOiBnZXRGaWx0ZXJFdmVudHMoe1xyXG4gICAgICAgICAgW3R5cGVdIChldm50OiBhbnkpIHtcclxuICAgICAgICAgICAgaGFuZGxlQ29uZmlybUZpbHRlcihjb250ZXh0LCBjb2x1bW4sICEhaXRlbS5kYXRhLCBpdGVtKVxyXG4gICAgICAgICAgICBpZiAoZXZlbnRzICYmIGV2ZW50c1t0eXBlXSkge1xyXG4gICAgICAgICAgICAgIGV2ZW50c1t0eXBlXShPYmplY3QuYXNzaWduKHsgY29udGV4dCB9LCBwYXJhbXMpLCBldm50KVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfSwgcmVuZGVyT3B0cywgcGFyYW1zLCBjb250ZXh0KVxyXG4gICAgICB9KVxyXG4gICAgfSlcclxuICB9XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGhhbmRsZUNvbmZpcm1GaWx0ZXIgKGNvbnRleHQ6IGFueSwgY29sdW1uOiBhbnksIGNoZWNrZWQ6IGFueSwgaXRlbTogYW55KSB7XHJcbiAgY29udGV4dFtjb2x1bW4uZmlsdGVyTXVsdGlwbGUgPyAnY2hhbmdlTXVsdGlwbGVPcHRpb24nIDogJ2NoYW5nZVJhZGlvT3B0aW9uJ10oe30sIGNoZWNrZWQsIGl0ZW0pXHJcbn1cclxuXHJcbmZ1bmN0aW9uIGRlZmF1bHRGaWx0ZXJNZXRob2QgKHsgb3B0aW9uLCByb3csIGNvbHVtbiB9OiBhbnkpIHtcclxuICBsZXQgeyBkYXRhIH0gPSBvcHRpb25cclxuICBsZXQgY2VsbFZhbHVlID0gWEVVdGlscy5nZXQocm93LCBjb2x1bW4ucHJvcGVydHkpXHJcbiAgLyogZXNsaW50LWRpc2FibGUgZXFlcWVxICovXHJcbiAgcmV0dXJuIGNlbGxWYWx1ZSA9PT0gZGF0YVxyXG59XHJcblxyXG5mdW5jdGlvbiByZW5kZXJPcHRpb25zIChoOiBGdW5jdGlvbiwgb3B0aW9uczogYW55LCBvcHRpb25Qcm9wczogYW55KSB7XHJcbiAgbGV0IGxhYmVsUHJvcCA9IG9wdGlvblByb3BzLmxhYmVsIHx8ICdsYWJlbCdcclxuICBsZXQgdmFsdWVQcm9wID0gb3B0aW9uUHJvcHMudmFsdWUgfHwgJ3ZhbHVlJ1xyXG4gIGxldCBkaXNhYmxlZFByb3AgPSBvcHRpb25Qcm9wcy5kaXNhYmxlZCB8fCAnZGlzYWJsZWQnXHJcbiAgcmV0dXJuIFhFVXRpbHMubWFwKG9wdGlvbnMsIChpdGVtOiBhbnksIGluZGV4OiBudW1iZXIpID0+IHtcclxuICAgIHJldHVybiBoKCdPcHRpb24nLCB7XHJcbiAgICAgIHByb3BzOiB7XHJcbiAgICAgICAgdmFsdWU6IGl0ZW1bdmFsdWVQcm9wXSxcclxuICAgICAgICBsYWJlbDogaXRlbVtsYWJlbFByb3BdLFxyXG4gICAgICAgIGRpc2FibGVkOiBpdGVtW2Rpc2FibGVkUHJvcF1cclxuICAgICAgfSxcclxuICAgICAga2V5OiBpbmRleFxyXG4gICAgfSlcclxuICB9KVxyXG59XHJcblxyXG5mdW5jdGlvbiBjZWxsVGV4dCAoaDogRnVuY3Rpb24sIGNlbGxWYWx1ZTogYW55KSB7XHJcbiAgcmV0dXJuIFsnJyArIChpc0VtcHR5VmFsdWUoY2VsbFZhbHVlKSA/ICcnIDogY2VsbFZhbHVlKV1cclxufVxyXG5cclxuZnVuY3Rpb24gY3JlYXRlRm9ybUl0ZW1SZW5kZXIgKGRlZmF1bHRQcm9wcz86IGFueSkge1xyXG4gIHJldHVybiBmdW5jdGlvbiAoaDogRnVuY3Rpb24sIHJlbmRlck9wdHM6IGFueSwgcGFyYW1zOiBhbnksIGNvbnRleHQ6IGFueSkge1xyXG4gICAgbGV0IHsgZGF0YSwgZmllbGQgfSA9IHBhcmFtc1xyXG4gICAgbGV0IHsgbmFtZSB9ID0gcmVuZGVyT3B0c1xyXG4gICAgbGV0IHsgYXR0cnMgfTogYW55ID0gcmVuZGVyT3B0c1xyXG4gICAgbGV0IHByb3BzOiBhbnkgPSBnZXRGb3JtUHJvcHMoY29udGV4dCwgcmVuZGVyT3B0cywgZGVmYXVsdFByb3BzKVxyXG4gICAgcmV0dXJuIFtcclxuICAgICAgaChuYW1lLCB7XHJcbiAgICAgICAgYXR0cnMsXHJcbiAgICAgICAgcHJvcHMsXHJcbiAgICAgICAgbW9kZWw6IHtcclxuICAgICAgICAgIHZhbHVlOiBYRVV0aWxzLmdldChkYXRhLCBmaWVsZCksXHJcbiAgICAgICAgICBjYWxsYmFjayAodmFsdWU6IGFueSkge1xyXG4gICAgICAgICAgICBYRVV0aWxzLnNldChkYXRhLCBmaWVsZCwgdmFsdWUpXHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfSxcclxuICAgICAgICBvbjogZ2V0Rm9ybUV2ZW50cyhyZW5kZXJPcHRzLCBwYXJhbXMsIGNvbnRleHQpXHJcbiAgICAgIH0pXHJcbiAgICBdXHJcbiAgfVxyXG59XHJcblxyXG5mdW5jdGlvbiBnZXRGb3JtUHJvcHMgKHsgJGZvcm0gfTogYW55LCB7IHByb3BzIH06IGFueSwgZGVmYXVsdFByb3BzPzogYW55KSB7XHJcbiAgcmV0dXJuIFhFVXRpbHMuYXNzaWduKCRmb3JtLnZTaXplID8geyBzaXplOiAkZm9ybS52U2l6ZSB9IDoge30sIGRlZmF1bHRQcm9wcywgcHJvcHMpXHJcbn1cclxuXHJcbmZ1bmN0aW9uIGdldEZvcm1FdmVudHMgKHJlbmRlck9wdHM6IGFueSwgcGFyYW1zOiBhbnksIGNvbnRleHQ6IGFueSkge1xyXG4gIGxldCB7IGV2ZW50cyB9OiBhbnkgPSByZW5kZXJPcHRzXHJcbiAgbGV0IHsgJGZvcm0gfSA9IHBhcmFtc1xyXG4gIGxldCB0eXBlID0gJ29uLWNoYW5nZSdcclxuICBsZXQgb24gPSB7XHJcbiAgICBbdHlwZV06IChldm50OiBhbnkpID0+IHtcclxuICAgICAgJGZvcm0udXBkYXRlU3RhdHVzKHBhcmFtcylcclxuICAgICAgaWYgKGV2ZW50cyAmJiBldmVudHNbdHlwZV0pIHtcclxuICAgICAgICBldmVudHNbdHlwZV0ocGFyYW1zLCBldm50KVxyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgfVxyXG4gIGlmIChldmVudHMpIHtcclxuICAgIHJldHVybiBYRVV0aWxzLmFzc2lnbih7fSwgWEVVdGlscy5vYmplY3RNYXAoZXZlbnRzLCAoY2I6IEZ1bmN0aW9uKSA9PiBmdW5jdGlvbiAoLi4uYXJnczogYW55W10pIHtcclxuICAgICAgY2IuYXBwbHkobnVsbCwgW3BhcmFtc10uY29uY2F0LmFwcGx5KHBhcmFtcywgYXJncykpXHJcbiAgICB9KSwgb24pXHJcbiAgfVxyXG4gIHJldHVybiBvblxyXG59XHJcblxyXG5mdW5jdGlvbiBjcmVhdGVFeHBvcnRNZXRob2QgKHZhbHVlTWV0aG9kOiBGdW5jdGlvbiwgaXNFZGl0PzogYm9vbGVhbikge1xyXG4gIGNvbnN0IHJlbmRlclByb3BlcnR5ID0gaXNFZGl0ID8gJ2VkaXRSZW5kZXInIDogJ2NlbGxSZW5kZXInXHJcbiAgcmV0dXJuIGZ1bmN0aW9uIChwYXJhbXM6IGFueSkge1xyXG4gICAgcmV0dXJuIHZhbHVlTWV0aG9kKHBhcmFtcy5jb2x1bW5bcmVuZGVyUHJvcGVydHldLCBwYXJhbXMpXHJcbiAgfVxyXG59XHJcblxyXG4vKipcclxuICog5riy5p+T5Ye95pWwXHJcbiAqL1xyXG5jb25zdCByZW5kZXJNYXA6IGFueSA9IHtcclxuICBJbnB1dDoge1xyXG4gICAgYXV0b2ZvY3VzOiAnaW5wdXQuaXZ1LWlucHV0JyxcclxuICAgIHJlbmRlckRlZmF1bHQ6IGNyZWF0ZUVkaXRSZW5kZXIoKSxcclxuICAgIHJlbmRlckVkaXQ6IGNyZWF0ZUVkaXRSZW5kZXIoKSxcclxuICAgIHJlbmRlckZpbHRlcjogY3JlYXRlRmlsdGVyUmVuZGVyKCksXHJcbiAgICBmaWx0ZXJNZXRob2Q6IGRlZmF1bHRGaWx0ZXJNZXRob2QsXHJcbiAgICByZW5kZXJJdGVtOiBjcmVhdGVGb3JtSXRlbVJlbmRlcigpXHJcbiAgfSxcclxuICBBdXRvQ29tcGxldGU6IHtcclxuICAgIGF1dG9mb2N1czogJ2lucHV0Lml2dS1pbnB1dCcsXHJcbiAgICByZW5kZXJEZWZhdWx0OiBjcmVhdGVFZGl0UmVuZGVyKCksXHJcbiAgICByZW5kZXJFZGl0OiBjcmVhdGVFZGl0UmVuZGVyKCksXHJcbiAgICByZW5kZXJGaWx0ZXI6IGNyZWF0ZUZpbHRlclJlbmRlcigpLFxyXG4gICAgZmlsdGVyTWV0aG9kOiBkZWZhdWx0RmlsdGVyTWV0aG9kLFxyXG4gICAgcmVuZGVySXRlbTogY3JlYXRlRm9ybUl0ZW1SZW5kZXIoKVxyXG4gIH0sXHJcbiAgSW5wdXROdW1iZXI6IHtcclxuICAgIGF1dG9mb2N1czogJ2lucHV0Lml2dS1pbnB1dC1udW1iZXItaW5wdXQnLFxyXG4gICAgcmVuZGVyRGVmYXVsdDogY3JlYXRlRWRpdFJlbmRlcigpLFxyXG4gICAgcmVuZGVyRWRpdDogY3JlYXRlRWRpdFJlbmRlcigpLFxyXG4gICAgcmVuZGVyRmlsdGVyOiBjcmVhdGVGaWx0ZXJSZW5kZXIoKSxcclxuICAgIGZpbHRlck1ldGhvZDogZGVmYXVsdEZpbHRlck1ldGhvZCxcclxuICAgIHJlbmRlckl0ZW06IGNyZWF0ZUZvcm1JdGVtUmVuZGVyKClcclxuICB9LFxyXG4gIFNlbGVjdDoge1xyXG4gICAgcmVuZGVyRWRpdCAoaDogRnVuY3Rpb24sIHJlbmRlck9wdHM6IGFueSwgcGFyYW1zOiBhbnkpIHtcclxuICAgICAgbGV0IHsgb3B0aW9ucywgb3B0aW9uR3JvdXBzLCBvcHRpb25Qcm9wcyA9IHt9LCBvcHRpb25Hcm91cFByb3BzID0ge30gfSA9IHJlbmRlck9wdHNcclxuICAgICAgbGV0IHsgcm93LCBjb2x1bW4gfSA9IHBhcmFtc1xyXG4gICAgICBsZXQgeyBhdHRycyB9ID0gcmVuZGVyT3B0c1xyXG4gICAgICBsZXQgcHJvcHMgPSBnZXRQcm9wcyhwYXJhbXMsIHJlbmRlck9wdHMsIHsgdHJhbnNmZXI6IHRydWUgfSlcclxuICAgICAgaWYgKG9wdGlvbkdyb3Vwcykge1xyXG4gICAgICAgIGxldCBncm91cE9wdGlvbnMgPSBvcHRpb25Hcm91cFByb3BzLm9wdGlvbnMgfHwgJ29wdGlvbnMnXHJcbiAgICAgICAgbGV0IGdyb3VwTGFiZWwgPSBvcHRpb25Hcm91cFByb3BzLmxhYmVsIHx8ICdsYWJlbCdcclxuICAgICAgICByZXR1cm4gW1xyXG4gICAgICAgICAgaCgnU2VsZWN0Jywge1xyXG4gICAgICAgICAgICBwcm9wcyxcclxuICAgICAgICAgICAgYXR0cnMsXHJcbiAgICAgICAgICAgIG1vZGVsOiB7XHJcbiAgICAgICAgICAgICAgdmFsdWU6IFhFVXRpbHMuZ2V0KHJvdywgY29sdW1uLnByb3BlcnR5KSxcclxuICAgICAgICAgICAgICBjYWxsYmFjayAoY2VsbFZhbHVlOiBhbnkpIHtcclxuICAgICAgICAgICAgICAgIFhFVXRpbHMuc2V0KHJvdywgY29sdW1uLnByb3BlcnR5LCBjZWxsVmFsdWUpXHJcbiAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICBvbjogZ2V0Q2VsbEV2ZW50cyhyZW5kZXJPcHRzLCBwYXJhbXMpXHJcbiAgICAgICAgICB9LCBYRVV0aWxzLm1hcChvcHRpb25Hcm91cHMsIChncm91cDogYW55LCBnSW5kZXg6IG51bWJlcikgPT4ge1xyXG4gICAgICAgICAgICByZXR1cm4gaCgnT3B0aW9uR3JvdXAnLCB7XHJcbiAgICAgICAgICAgICAgcHJvcHM6IHtcclxuICAgICAgICAgICAgICAgIGxhYmVsOiBncm91cFtncm91cExhYmVsXVxyXG4gICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAga2V5OiBnSW5kZXhcclxuICAgICAgICAgICAgfSwgcmVuZGVyT3B0aW9ucyhoLCBncm91cFtncm91cE9wdGlvbnNdLCBvcHRpb25Qcm9wcykpXHJcbiAgICAgICAgICB9KSlcclxuICAgICAgICBdXHJcbiAgICAgIH1cclxuICAgICAgcmV0dXJuIFtcclxuICAgICAgICBoKCdTZWxlY3QnLCB7XHJcbiAgICAgICAgICBwcm9wcyxcclxuICAgICAgICAgIGF0dHJzLFxyXG4gICAgICAgICAgbW9kZWw6IHtcclxuICAgICAgICAgICAgdmFsdWU6IFhFVXRpbHMuZ2V0KHJvdywgY29sdW1uLnByb3BlcnR5KSxcclxuICAgICAgICAgICAgY2FsbGJhY2sgKGNlbGxWYWx1ZTogYW55KSB7XHJcbiAgICAgICAgICAgICAgWEVVdGlscy5zZXQocm93LCBjb2x1bW4ucHJvcGVydHksIGNlbGxWYWx1ZSlcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgfSxcclxuICAgICAgICAgIG9uOiBnZXRDZWxsRXZlbnRzKHJlbmRlck9wdHMsIHBhcmFtcylcclxuICAgICAgICB9LCByZW5kZXJPcHRpb25zKGgsIG9wdGlvbnMsIG9wdGlvblByb3BzKSlcclxuICAgICAgXVxyXG4gICAgfSxcclxuICAgIHJlbmRlckNlbGwgKGg6IEZ1bmN0aW9uLCByZW5kZXJPcHRzOiBhbnksIHBhcmFtczogYW55KSB7XHJcbiAgICAgIGNlbGxUZXh0KGgsIGdldFNlbGVjdENlbGxWYWx1ZShyZW5kZXJPcHRzLCBwYXJhbXMpKVxyXG4gICAgfSxcclxuICAgIHJlbmRlckZpbHRlciAoaDogRnVuY3Rpb24sIHJlbmRlck9wdHM6IGFueSwgcGFyYW1zOiBhbnksIGNvbnRleHQ6IGFueSkge1xyXG4gICAgICBsZXQgeyBvcHRpb25zLCBvcHRpb25Hcm91cHMsIG9wdGlvblByb3BzID0ge30sIG9wdGlvbkdyb3VwUHJvcHMgPSB7fSB9ID0gcmVuZGVyT3B0c1xyXG4gICAgICBsZXQgeyBjb2x1bW4gfSA9IHBhcmFtc1xyXG4gICAgICBsZXQgeyBhdHRycywgZXZlbnRzIH0gPSByZW5kZXJPcHRzXHJcbiAgICAgIGxldCBwcm9wcyA9IGdldFByb3BzKHBhcmFtcywgcmVuZGVyT3B0cywgeyB0cmFuc2ZlcjogdHJ1ZSB9KVxyXG4gICAgICBsZXQgdHlwZSA9ICdvbi1jaGFuZ2UnXHJcbiAgICAgIGlmIChvcHRpb25Hcm91cHMpIHtcclxuICAgICAgICBsZXQgZ3JvdXBPcHRpb25zID0gb3B0aW9uR3JvdXBQcm9wcy5vcHRpb25zIHx8ICdvcHRpb25zJ1xyXG4gICAgICAgIGxldCBncm91cExhYmVsID0gb3B0aW9uR3JvdXBQcm9wcy5sYWJlbCB8fCAnbGFiZWwnXHJcbiAgICAgICAgcmV0dXJuIGNvbHVtbi5maWx0ZXJzLm1hcCgoaXRlbTogYW55KSA9PiB7XHJcbiAgICAgICAgICByZXR1cm4gaCgnU2VsZWN0Jywge1xyXG4gICAgICAgICAgICBwcm9wcyxcclxuICAgICAgICAgICAgYXR0cnMsXHJcbiAgICAgICAgICAgIG1vZGVsOiB7XHJcbiAgICAgICAgICAgICAgdmFsdWU6IGl0ZW0uZGF0YSxcclxuICAgICAgICAgICAgICBjYWxsYmFjayAob3B0aW9uVmFsdWU6IGFueSkge1xyXG4gICAgICAgICAgICAgICAgaXRlbS5kYXRhID0gb3B0aW9uVmFsdWVcclxuICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIG9uOiBnZXRGaWx0ZXJFdmVudHMoe1xyXG4gICAgICAgICAgICAgIFt0eXBlXSAodmFsdWU6IGFueSkge1xyXG4gICAgICAgICAgICAgICAgaGFuZGxlQ29uZmlybUZpbHRlcihjb250ZXh0LCBjb2x1bW4sIHZhbHVlICYmIHZhbHVlLmxlbmd0aCA+IDAsIGl0ZW0pXHJcbiAgICAgICAgICAgICAgICBpZiAoZXZlbnRzICYmIGV2ZW50c1t0eXBlXSkge1xyXG4gICAgICAgICAgICAgICAgICBldmVudHNbdHlwZV0oT2JqZWN0LmFzc2lnbih7IGNvbnRleHQgfSwgcGFyYW1zKSwgdmFsdWUpXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9LCByZW5kZXJPcHRzLCBwYXJhbXMsIGNvbnRleHQpXHJcbiAgICAgICAgICB9LCBYRVV0aWxzLm1hcChvcHRpb25Hcm91cHMsIChncm91cDogYW55LCBnSW5kZXg6IG51bWJlcikgPT4ge1xyXG4gICAgICAgICAgICByZXR1cm4gaCgnT3B0aW9uR3JvdXAnLCB7XHJcbiAgICAgICAgICAgICAgcHJvcHM6IHtcclxuICAgICAgICAgICAgICAgIGxhYmVsOiBncm91cFtncm91cExhYmVsXVxyXG4gICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAga2V5OiBnSW5kZXhcclxuICAgICAgICAgICAgfSwgcmVuZGVyT3B0aW9ucyhoLCBncm91cFtncm91cE9wdGlvbnNdLCBvcHRpb25Qcm9wcykpXHJcbiAgICAgICAgICB9KSlcclxuICAgICAgICB9KVxyXG4gICAgICB9XHJcbiAgICAgIHJldHVybiBjb2x1bW4uZmlsdGVycy5tYXAoKGl0ZW06IGFueSkgPT4ge1xyXG4gICAgICAgIHJldHVybiBoKCdTZWxlY3QnLCB7XHJcbiAgICAgICAgICBwcm9wcyxcclxuICAgICAgICAgIGF0dHJzLFxyXG4gICAgICAgICAgbW9kZWw6IHtcclxuICAgICAgICAgICAgdmFsdWU6IGl0ZW0uZGF0YSxcclxuICAgICAgICAgICAgY2FsbGJhY2sgKG9wdGlvblZhbHVlOiBhbnkpIHtcclxuICAgICAgICAgICAgICBpdGVtLmRhdGEgPSBvcHRpb25WYWx1ZVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICB9LFxyXG4gICAgICAgICAgb246IGdldEZpbHRlckV2ZW50cyh7XHJcbiAgICAgICAgICAgIFt0eXBlXSAodmFsdWU6IGFueSkge1xyXG4gICAgICAgICAgICAgIGhhbmRsZUNvbmZpcm1GaWx0ZXIoY29udGV4dCwgY29sdW1uLCB2YWx1ZSAmJiB2YWx1ZS5sZW5ndGggPiAwLCBpdGVtKVxyXG4gICAgICAgICAgICAgIGlmIChldmVudHMgJiYgZXZlbnRzW3R5cGVdKSB7XHJcbiAgICAgICAgICAgICAgICBldmVudHNbdHlwZV0oT2JqZWN0LmFzc2lnbih7IGNvbnRleHQgfSwgcGFyYW1zKSwgdmFsdWUpXHJcbiAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICB9LCByZW5kZXJPcHRzLCBwYXJhbXMsIGNvbnRleHQpXHJcbiAgICAgICAgfSwgcmVuZGVyT3B0aW9ucyhoLCBvcHRpb25zLCBvcHRpb25Qcm9wcykpXHJcbiAgICAgIH0pXHJcbiAgICB9LFxyXG4gICAgZmlsdGVyTWV0aG9kICh7IG9wdGlvbiwgcm93LCBjb2x1bW4gfTogYW55KSB7XHJcbiAgICAgIGxldCB7IGRhdGEgfSA9IG9wdGlvblxyXG4gICAgICBsZXQgeyBwcm9wZXJ0eSwgZmlsdGVyUmVuZGVyOiByZW5kZXJPcHRzIH0gPSBjb2x1bW5cclxuICAgICAgbGV0IHsgcHJvcHMgPSB7fSB9ID0gcmVuZGVyT3B0c1xyXG4gICAgICBsZXQgY2VsbFZhbHVlID0gWEVVdGlscy5nZXQocm93LCBwcm9wZXJ0eSlcclxuICAgICAgaWYgKHByb3BzLm11bHRpcGxlKSB7XHJcbiAgICAgICAgaWYgKFhFVXRpbHMuaXNBcnJheShjZWxsVmFsdWUpKSB7XHJcbiAgICAgICAgICByZXR1cm4gWEVVdGlscy5pbmNsdWRlQXJyYXlzKGNlbGxWYWx1ZSwgZGF0YSlcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIGRhdGEuaW5kZXhPZihjZWxsVmFsdWUpID4gLTFcclxuICAgICAgfVxyXG4gICAgICAvKiBlc2xpbnQtZGlzYWJsZSBlcWVxZXEgKi9cclxuICAgICAgcmV0dXJuIGNlbGxWYWx1ZSA9PSBkYXRhXHJcbiAgICB9LFxyXG4gICAgcmVuZGVySXRlbSAoaDogRnVuY3Rpb24sIHJlbmRlck9wdHM6IGFueSwgcGFyYW1zOiBhbnksIGNvbnRleHQ6IGFueSkge1xyXG4gICAgICBsZXQgeyBvcHRpb25zLCBvcHRpb25Hcm91cHMsIG9wdGlvblByb3BzID0ge30sIG9wdGlvbkdyb3VwUHJvcHMgPSB7fSB9ID0gcmVuZGVyT3B0c1xyXG4gICAgICBsZXQgeyBkYXRhLCBwcm9wZXJ0eSB9ID0gcGFyYW1zXHJcbiAgICAgIGxldCB7IGF0dHJzIH0gPSByZW5kZXJPcHRzXHJcbiAgICAgIGxldCBwcm9wczogYW55ID0gZ2V0Rm9ybVByb3BzKGNvbnRleHQsIHJlbmRlck9wdHMpXHJcbiAgICAgIGlmIChvcHRpb25Hcm91cHMpIHtcclxuICAgICAgICBsZXQgZ3JvdXBPcHRpb25zOiBzdHJpbmcgPSBvcHRpb25Hcm91cFByb3BzLm9wdGlvbnMgfHwgJ29wdGlvbnMnXHJcbiAgICAgICAgbGV0IGdyb3VwTGFiZWw6IHN0cmluZyA9IG9wdGlvbkdyb3VwUHJvcHMubGFiZWwgfHwgJ2xhYmVsJ1xyXG4gICAgICAgIHJldHVybiBbXHJcbiAgICAgICAgICBoKCdTZWxlY3QnLCB7XHJcbiAgICAgICAgICAgIHByb3BzLFxyXG4gICAgICAgICAgICBhdHRycyxcclxuICAgICAgICAgICAgbW9kZWw6IHtcclxuICAgICAgICAgICAgICB2YWx1ZTogWEVVdGlscy5nZXQoZGF0YSwgcHJvcGVydHkpLFxyXG4gICAgICAgICAgICAgIGNhbGxiYWNrIChjZWxsVmFsdWU6IGFueSkge1xyXG4gICAgICAgICAgICAgICAgWEVVdGlscy5zZXQoZGF0YSwgcHJvcGVydHksIGNlbGxWYWx1ZSlcclxuICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIG9uOiBnZXRGb3JtRXZlbnRzKHJlbmRlck9wdHMsIHBhcmFtcywgY29udGV4dClcclxuICAgICAgICAgIH0sIFhFVXRpbHMubWFwKG9wdGlvbkdyb3VwcywgKGdyb3VwOiBhbnksIGdJbmRleDogbnVtYmVyKSA9PiB7XHJcbiAgICAgICAgICAgIHJldHVybiBoKCdPcHRpb25Hcm91cCcsIHtcclxuICAgICAgICAgICAgICBwcm9wczoge1xyXG4gICAgICAgICAgICAgICAgbGFiZWw6IGdyb3VwW2dyb3VwTGFiZWxdXHJcbiAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICBrZXk6IGdJbmRleFxyXG4gICAgICAgICAgICB9LCByZW5kZXJPcHRpb25zKGgsIGdyb3VwW2dyb3VwT3B0aW9uc10sIG9wdGlvblByb3BzKSlcclxuICAgICAgICAgIH0pKVxyXG4gICAgICAgIF1cclxuICAgICAgfVxyXG4gICAgICByZXR1cm4gW1xyXG4gICAgICAgIGgoJ1NlbGVjdCcsIHtcclxuICAgICAgICAgIHByb3BzLFxyXG4gICAgICAgICAgYXR0cnMsXHJcbiAgICAgICAgICBtb2RlbDoge1xyXG4gICAgICAgICAgICB2YWx1ZTogWEVVdGlscy5nZXQoZGF0YSwgcHJvcGVydHkpLFxyXG4gICAgICAgICAgICBjYWxsYmFjayAoY2VsbFZhbHVlOiBhbnkpIHtcclxuICAgICAgICAgICAgICBYRVV0aWxzLnNldChkYXRhLCBwcm9wZXJ0eSwgY2VsbFZhbHVlKVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICB9LFxyXG4gICAgICAgICAgb246IGdldEZvcm1FdmVudHMocmVuZGVyT3B0cywgcGFyYW1zLCBjb250ZXh0KVxyXG4gICAgICAgIH0sIHJlbmRlck9wdGlvbnMoaCwgb3B0aW9ucywgb3B0aW9uUHJvcHMpKVxyXG4gICAgICBdXHJcbiAgICB9LFxyXG4gICAgZWRpdEV4cG9ydE1ldGhvZDogY3JlYXRlRXhwb3J0TWV0aG9kKGdldFNlbGVjdENlbGxWYWx1ZSwgdHJ1ZSksXHJcbiAgICBjZWxsRXhwb3J0TWV0aG9kOiBjcmVhdGVFeHBvcnRNZXRob2QoZ2V0U2VsZWN0Q2VsbFZhbHVlKVxyXG4gIH0sXHJcbiAgQ2FzY2FkZXI6IHtcclxuICAgIHJlbmRlckVkaXQ6IGNyZWF0ZUVkaXRSZW5kZXIoeyB0cmFuc2ZlcjogdHJ1ZSB9KSxcclxuICAgIHJlbmRlckNlbGwgKGg6IEZ1bmN0aW9uLCByZW5kZXJPcHRzOiBhbnksIHBhcmFtczogYW55KSB7XHJcbiAgICAgIHJldHVybiBjZWxsVGV4dChoLCBnZXRDYXNjYWRlckNlbGxWYWx1ZShyZW5kZXJPcHRzLCBwYXJhbXMpKVxyXG4gICAgfSxcclxuICAgIHJlbmRlckl0ZW06IGNyZWF0ZUZvcm1JdGVtUmVuZGVyKCksXHJcbiAgICBlZGl0RXhwb3J0TWV0aG9kOiBjcmVhdGVFeHBvcnRNZXRob2QoZ2V0Q2FzY2FkZXJDZWxsVmFsdWUsIHRydWUpLFxyXG4gICAgY2VsbEV4cG9ydE1ldGhvZDogY3JlYXRlRXhwb3J0TWV0aG9kKGdldENhc2NhZGVyQ2VsbFZhbHVlKVxyXG4gIH0sXHJcbiAgRGF0ZVBpY2tlcjoge1xyXG4gICAgcmVuZGVyRWRpdDogY3JlYXRlRWRpdFJlbmRlcih7IHRyYW5zZmVyOiB0cnVlIH0pLFxyXG4gICAgcmVuZGVyQ2VsbCAoaDogRnVuY3Rpb24sIHJlbmRlck9wdHM6IGFueSwgcGFyYW1zOiBhbnkpIHtcclxuICAgICAgcmV0dXJuIGNlbGxUZXh0KGgsIGdldERhdGVQaWNrZXJDZWxsVmFsdWUocmVuZGVyT3B0cywgcGFyYW1zKSlcclxuICAgIH0sXHJcbiAgICByZW5kZXJGaWx0ZXIgKGg6IEZ1bmN0aW9uLCByZW5kZXJPcHRzOiBhbnksIHBhcmFtczogYW55LCBjb250ZXh0OiBhbnkpIHtcclxuICAgICAgbGV0IHsgY29sdW1uIH0gPSBwYXJhbXNcclxuICAgICAgbGV0IHsgYXR0cnMsIGV2ZW50cyB9ID0gcmVuZGVyT3B0c1xyXG4gICAgICBsZXQgcHJvcHMgPSBnZXRQcm9wcyhwYXJhbXMsIHJlbmRlck9wdHMsIHsgdHJhbnNmZXI6IHRydWUgfSlcclxuICAgICAgbGV0IHR5cGUgPSAnb24tY2hhbmdlJ1xyXG4gICAgICByZXR1cm4gY29sdW1uLmZpbHRlcnMubWFwKChpdGVtOiBhbnkpID0+IHtcclxuICAgICAgICByZXR1cm4gaChyZW5kZXJPcHRzLm5hbWUsIHtcclxuICAgICAgICAgIHByb3BzLFxyXG4gICAgICAgICAgYXR0cnMsXHJcbiAgICAgICAgICBtb2RlbDoge1xyXG4gICAgICAgICAgICB2YWx1ZTogaXRlbS5kYXRhLFxyXG4gICAgICAgICAgICBjYWxsYmFjayAob3B0aW9uVmFsdWU6IGFueSkge1xyXG4gICAgICAgICAgICAgIGl0ZW0uZGF0YSA9IG9wdGlvblZhbHVlXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgIH0sXHJcbiAgICAgICAgICBvbjogZ2V0RmlsdGVyRXZlbnRzKHtcclxuICAgICAgICAgICAgW3R5cGVdICh2YWx1ZTogYW55KSB7XHJcbiAgICAgICAgICAgICAgaGFuZGxlQ29uZmlybUZpbHRlcihjb250ZXh0LCBjb2x1bW4sICEhdmFsdWUsIGl0ZW0pXHJcbiAgICAgICAgICAgICAgaWYgKGV2ZW50cyAmJiBldmVudHNbdHlwZV0pIHtcclxuICAgICAgICAgICAgICAgIGV2ZW50c1t0eXBlXShPYmplY3QuYXNzaWduKHsgY29udGV4dCB9LCBwYXJhbXMpLCB2YWx1ZSlcclxuICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgIH0sIHJlbmRlck9wdHMsIHBhcmFtcywgY29udGV4dClcclxuICAgICAgICB9KVxyXG4gICAgICB9KVxyXG4gICAgfSxcclxuICAgIGZpbHRlck1ldGhvZCAoeyBvcHRpb24sIHJvdywgY29sdW1uIH06IGFueSkge1xyXG4gICAgICBsZXQgeyBkYXRhIH0gPSBvcHRpb25cclxuICAgICAgbGV0IHsgZmlsdGVyUmVuZGVyOiByZW5kZXJPcHRzIH0gPSBjb2x1bW5cclxuICAgICAgbGV0IHsgcHJvcHMgPSB7fSB9ID0gcmVuZGVyT3B0c1xyXG4gICAgICBsZXQgY2VsbFZhbHVlID0gWEVVdGlscy5nZXQocm93LCBjb2x1bW4ucHJvcGVydHkpXHJcbiAgICAgIGlmIChkYXRhKSB7XHJcbiAgICAgICAgc3dpdGNoIChwcm9wcy50eXBlKSB7XHJcbiAgICAgICAgICBjYXNlICdkYXRlcmFuZ2UnOlxyXG4gICAgICAgICAgICByZXR1cm4gZXF1YWxEYXRlcmFuZ2UoY2VsbFZhbHVlLCBkYXRhLCBwcm9wcywgJ3l5eXktTU0tZGQnKVxyXG4gICAgICAgICAgY2FzZSAnZGF0ZXRpbWVyYW5nZSc6XHJcbiAgICAgICAgICAgIHJldHVybiBlcXVhbERhdGVyYW5nZShjZWxsVmFsdWUsIGRhdGEsIHByb3BzLCAneXl5eS1NTS1kZCBISDpzczptbScpXHJcbiAgICAgICAgICBkZWZhdWx0OlxyXG4gICAgICAgICAgICByZXR1cm4gY2VsbFZhbHVlID09PSBkYXRhXHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICAgIHJldHVybiBmYWxzZVxyXG4gICAgfSxcclxuICAgIHJlbmRlckl0ZW06IGNyZWF0ZUZvcm1JdGVtUmVuZGVyKCksXHJcbiAgICBlZGl0RXhwb3J0TWV0aG9kOiBjcmVhdGVFeHBvcnRNZXRob2QoZ2V0RGF0ZVBpY2tlckNlbGxWYWx1ZSwgdHJ1ZSksXHJcbiAgICBjZWxsRXhwb3J0TWV0aG9kOiBjcmVhdGVFeHBvcnRNZXRob2QoZ2V0RGF0ZVBpY2tlckNlbGxWYWx1ZSlcclxuICB9LFxyXG4gIFRpbWVQaWNrZXI6IHtcclxuICAgIHJlbmRlckVkaXQ6IGNyZWF0ZUVkaXRSZW5kZXIoeyB0cmFuc2ZlcjogdHJ1ZSB9KSxcclxuICAgIHJlbmRlckl0ZW06IGNyZWF0ZUZvcm1JdGVtUmVuZGVyKClcclxuICB9LFxyXG4gIFJhdGU6IHtcclxuICAgIHJlbmRlckRlZmF1bHQ6IGNyZWF0ZUVkaXRSZW5kZXIoKSxcclxuICAgIHJlbmRlckVkaXQ6IGNyZWF0ZUVkaXRSZW5kZXIoKSxcclxuICAgIHJlbmRlckZpbHRlcjogY3JlYXRlRmlsdGVyUmVuZGVyKCksXHJcbiAgICBmaWx0ZXJNZXRob2Q6IGRlZmF1bHRGaWx0ZXJNZXRob2QsXHJcbiAgICByZW5kZXJJdGVtOiBjcmVhdGVGb3JtSXRlbVJlbmRlcigpXHJcbiAgfSxcclxuICBpU3dpdGNoOiB7XHJcbiAgICByZW5kZXJEZWZhdWx0OiBjcmVhdGVFZGl0UmVuZGVyKCksXHJcbiAgICByZW5kZXJFZGl0OiBjcmVhdGVFZGl0UmVuZGVyKCksXHJcbiAgICByZW5kZXJGaWx0ZXI6IGNyZWF0ZUZpbHRlclJlbmRlcigpLFxyXG4gICAgZmlsdGVyTWV0aG9kOiBkZWZhdWx0RmlsdGVyTWV0aG9kLFxyXG4gICAgcmVuZGVySXRlbTogY3JlYXRlRm9ybUl0ZW1SZW5kZXIoKVxyXG4gIH1cclxufVxyXG5cclxuLyoqXHJcbiAqIOS6i+S7tuWFvOWuueaAp+WkhOeQhlxyXG4gKi9cclxuZnVuY3Rpb24gaGFuZGxlQ2xlYXJFdmVudCAocGFyYW1zOiBhbnksIGV2bnQ6IGFueSwgY29udGV4dDogYW55KSB7XHJcbiAgbGV0IHsgZ2V0RXZlbnRUYXJnZXROb2RlIH0gPSBjb250ZXh0XHJcbiAgbGV0IGJvZHlFbGVtID0gZG9jdW1lbnQuYm9keVxyXG4gIGlmIChcclxuICAgIC8vIOS4i+aLieahhuOAgeaXpeacn1xyXG4gICAgZ2V0RXZlbnRUYXJnZXROb2RlKGV2bnQsIGJvZHlFbGVtLCAnaXZ1LXNlbGVjdC1kcm9wZG93bicpLmZsYWdcclxuICApIHtcclxuICAgIHJldHVybiBmYWxzZVxyXG4gIH1cclxufVxyXG5cclxuLyoqXHJcbiAqIOWfuuS6jiB2eGUtdGFibGUg6KGo5qC855qE6YCC6YWN5o+S5Lu277yM55So5LqO5YW85a65IGl2aWV3IOe7hOS7tuW6k1xyXG4gKi9cclxuZXhwb3J0IGNvbnN0IFZYRVRhYmxlUGx1Z2luSVZpZXcgPSB7XHJcbiAgaW5zdGFsbCAoeHRhYmxlOiB0eXBlb2YgVlhFVGFibGUpIHtcclxuICAgIGxldCB7IGludGVyY2VwdG9yLCByZW5kZXJlciB9ID0geHRhYmxlXHJcbiAgICByZW5kZXJlci5taXhpbihyZW5kZXJNYXApXHJcbiAgICBpbnRlcmNlcHRvci5hZGQoJ2V2ZW50LmNsZWFyRmlsdGVyJywgaGFuZGxlQ2xlYXJFdmVudClcclxuICAgIGludGVyY2VwdG9yLmFkZCgnZXZlbnQuY2xlYXJBY3RpdmVkJywgaGFuZGxlQ2xlYXJFdmVudClcclxuICB9XHJcbn1cclxuXHJcbmlmICh0eXBlb2Ygd2luZG93ICE9PSAndW5kZWZpbmVkJyAmJiB3aW5kb3cuVlhFVGFibGUpIHtcclxuICB3aW5kb3cuVlhFVGFibGUudXNlKFZYRVRhYmxlUGx1Z2luSVZpZXcpXHJcbn1cclxuXHJcbmV4cG9ydCBkZWZhdWx0IFZYRVRhYmxlUGx1Z2luSVZpZXdcclxuIl19
