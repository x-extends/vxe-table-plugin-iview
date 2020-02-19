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

function createFormItemRadioAndCheckboxRender() {
  return function (h, renderOpts, params, context) {
    var name = renderOpts.name,
        options = renderOpts.options,
        _renderOpts$optionPro2 = renderOpts.optionProps,
        optionProps = _renderOpts$optionPro2 === void 0 ? {} : _renderOpts$optionPro2;
    var data = params.data,
        property = params.property;
    var attrs = renderOpts.attrs;
    var props = getFormProps(context, renderOpts);
    var labelProp = optionProps.label || 'label';
    var valueProp = optionProps.value || 'value';
    var disabledProp = optionProps.disabled || 'disabled';
    return [h("".concat(name, "Group"), {
      props: props,
      attrs: attrs,
      model: {
        value: _xeUtils["default"].get(data, property),
        callback: function callback(cellValue) {
          _xeUtils["default"].set(data, property, cellValue);
        }
      },
      on: getFormEvents(renderOpts, params, context)
    }, options.map(function (option) {
      return h(name, {
        props: {
          label: option[valueProp],
          disabled: option[disabledProp]
        }
      }, option[labelProp]);
    }))];
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
          _renderOpts$optionPro3 = renderOpts.optionProps,
          optionProps = _renderOpts$optionPro3 === void 0 ? {} : _renderOpts$optionPro3,
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
          _renderOpts$optionPro4 = renderOpts.optionProps,
          optionProps = _renderOpts$optionPro4 === void 0 ? {} : _renderOpts$optionPro4,
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
          _renderOpts$optionPro5 = renderOpts.optionProps,
          optionProps = _renderOpts$optionPro5 === void 0 ? {} : _renderOpts$optionPro5,
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
    cellExportMethod: createExportMethod(getSelectCellValue),
    editCellExportMethod: createExportMethod(getSelectCellValue, true)
  },
  Cascader: {
    renderEdit: createEditRender({
      transfer: true
    }),
    renderCell: function renderCell(h, renderOpts, params) {
      return cellText(h, getCascaderCellValue(renderOpts, params));
    },
    renderItem: createFormItemRender(),
    cellExportMethod: createExportMethod(getCascaderCellValue),
    editCellExportMethod: createExportMethod(getCascaderCellValue, true)
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
    cellExportMethod: createExportMethod(getDatePickerCellValue),
    editCellExportMethod: createExportMethod(getDatePickerCellValue, true)
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
  },
  Radio: {
    renderItem: createFormItemRadioAndCheckboxRender()
  },
  Checkbox: {
    renderItem: createFormItemRadioAndCheckboxRender()
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
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImluZGV4LnRzIl0sIm5hbWVzIjpbImlzRW1wdHlWYWx1ZSIsImNlbGxWYWx1ZSIsInVuZGVmaW5lZCIsImdldEZvcm1hdERhdGUiLCJ2YWx1ZSIsInByb3BzIiwiZGVmYXVsdEZvcm1hdCIsIlhFVXRpbHMiLCJ0b0RhdGVTdHJpbmciLCJmb3JtYXQiLCJnZXRGb3JtYXREYXRlcyIsInZhbHVlcyIsInNlcGFyYXRvciIsIm1hcCIsImRhdGUiLCJqb2luIiwiZXF1YWxEYXRlcmFuZ2UiLCJkYXRhIiwibWF0Y2hDYXNjYWRlckRhdGEiLCJpbmRleCIsImxpc3QiLCJsYWJlbHMiLCJ2YWwiLCJsZW5ndGgiLCJlYWNoIiwiaXRlbSIsInB1c2giLCJsYWJlbCIsImNoaWxkcmVuIiwiZ2V0UHJvcHMiLCJkZWZhdWx0UHJvcHMiLCIkdGFibGUiLCJhc3NpZ24iLCJ2U2l6ZSIsInNpemUiLCJnZXRDZWxsRXZlbnRzIiwicmVuZGVyT3B0cyIsInBhcmFtcyIsImV2ZW50cyIsInR5cGUiLCJvbiIsImV2bnQiLCJ1cGRhdGVTdGF0dXMiLCJvYmplY3RNYXAiLCJjYiIsImFyZ3MiLCJhcHBseSIsImNvbmNhdCIsImdldFNlbGVjdENlbGxWYWx1ZSIsIm9wdGlvbnMiLCJvcHRpb25Hcm91cHMiLCJvcHRpb25Qcm9wcyIsIm9wdGlvbkdyb3VwUHJvcHMiLCJyb3ciLCJjb2x1bW4iLCJsYWJlbFByb3AiLCJ2YWx1ZVByb3AiLCJncm91cE9wdGlvbnMiLCJnZXQiLCJwcm9wZXJ0eSIsImNvbGlkIiwiaWQiLCJyZXN0IiwiY2VsbERhdGEiLCJmaWx0ZXJhYmxlIiwiZnVsbEFsbERhdGFSb3dNYXAiLCJjYWNoZUNlbGwiLCJoYXMiLCJtdWx0aXBsZSIsInNlbGVjdEl0ZW0iLCJmaW5kIiwiY2VsbExhYmVsIiwiZ2V0Q2FzY2FkZXJDZWxsVmFsdWUiLCJnZXREYXRlUGlja2VyQ2VsbFZhbHVlIiwiY3JlYXRlRWRpdFJlbmRlciIsImgiLCJhdHRycyIsIm5hbWUiLCJtb2RlbCIsImNhbGxiYWNrIiwic2V0IiwiZ2V0RmlsdGVyRXZlbnRzIiwiY29udGV4dCIsIk9iamVjdCIsImNyZWF0ZUZpbHRlclJlbmRlciIsImZpbHRlcnMiLCJvcHRpb25WYWx1ZSIsImhhbmRsZUNvbmZpcm1GaWx0ZXIiLCJjaGVja2VkIiwiZmlsdGVyTXVsdGlwbGUiLCJkZWZhdWx0RmlsdGVyTWV0aG9kIiwib3B0aW9uIiwicmVuZGVyT3B0aW9ucyIsImRpc2FibGVkUHJvcCIsImRpc2FibGVkIiwia2V5IiwiY2VsbFRleHQiLCJjcmVhdGVGb3JtSXRlbVJlbmRlciIsImdldEZvcm1Qcm9wcyIsImdldEZvcm1FdmVudHMiLCIkZm9ybSIsImNyZWF0ZUV4cG9ydE1ldGhvZCIsInZhbHVlTWV0aG9kIiwiaXNFZGl0IiwicmVuZGVyUHJvcGVydHkiLCJjcmVhdGVGb3JtSXRlbVJhZGlvQW5kQ2hlY2tib3hSZW5kZXIiLCJyZW5kZXJNYXAiLCJJbnB1dCIsImF1dG9mb2N1cyIsInJlbmRlckRlZmF1bHQiLCJyZW5kZXJFZGl0IiwicmVuZGVyRmlsdGVyIiwiZmlsdGVyTWV0aG9kIiwicmVuZGVySXRlbSIsIkF1dG9Db21wbGV0ZSIsIklucHV0TnVtYmVyIiwiU2VsZWN0IiwidHJhbnNmZXIiLCJncm91cExhYmVsIiwiZ3JvdXAiLCJnSW5kZXgiLCJyZW5kZXJDZWxsIiwiZmlsdGVyUmVuZGVyIiwiaXNBcnJheSIsImluY2x1ZGVBcnJheXMiLCJpbmRleE9mIiwiY2VsbEV4cG9ydE1ldGhvZCIsImVkaXRDZWxsRXhwb3J0TWV0aG9kIiwiQ2FzY2FkZXIiLCJEYXRlUGlja2VyIiwiVGltZVBpY2tlciIsIlJhdGUiLCJpU3dpdGNoIiwiUmFkaW8iLCJDaGVja2JveCIsImhhbmRsZUNsZWFyRXZlbnQiLCJnZXRFdmVudFRhcmdldE5vZGUiLCJib2R5RWxlbSIsImRvY3VtZW50IiwiYm9keSIsImZsYWciLCJWWEVUYWJsZVBsdWdpbklWaWV3IiwiaW5zdGFsbCIsInh0YWJsZSIsImludGVyY2VwdG9yIiwicmVuZGVyZXIi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aW5kZXguY29tbW9uLmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IFhFVXRpbHMgZnJvbSAneGUtdXRpbHMvbWV0aG9kcy94ZS11dGlscydcclxuaW1wb3J0IFZYRVRhYmxlIGZyb20gJ3Z4ZS10YWJsZS9saWIvdnhlLXRhYmxlJ1xyXG5cclxuZnVuY3Rpb24gaXNFbXB0eVZhbHVlIChjZWxsVmFsdWU6IGFueSkge1xyXG4gIHJldHVybiBjZWxsVmFsdWUgPT09IG51bGwgfHwgY2VsbFZhbHVlID09PSB1bmRlZmluZWQgfHwgY2VsbFZhbHVlID09PSAnJ1xyXG59XHJcblxyXG5mdW5jdGlvbiBnZXRGb3JtYXREYXRlICh2YWx1ZTogYW55LCBwcm9wczogYW55LCBkZWZhdWx0Rm9ybWF0OiBzdHJpbmcpIHtcclxuICByZXR1cm4gWEVVdGlscy50b0RhdGVTdHJpbmcodmFsdWUsIHByb3BzLmZvcm1hdCB8fCBkZWZhdWx0Rm9ybWF0KVxyXG59XHJcblxyXG5mdW5jdGlvbiBnZXRGb3JtYXREYXRlcyAodmFsdWVzOiBhbnksIHByb3BzOiBhbnksIHNlcGFyYXRvcjogc3RyaW5nLCBkZWZhdWx0Rm9ybWF0OiBzdHJpbmcpIHtcclxuICByZXR1cm4gWEVVdGlscy5tYXAodmFsdWVzLCAoZGF0ZTogYW55KSA9PiBnZXRGb3JtYXREYXRlKGRhdGUsIHByb3BzLCBkZWZhdWx0Rm9ybWF0KSkuam9pbihzZXBhcmF0b3IpXHJcbn1cclxuXHJcbmZ1bmN0aW9uIGVxdWFsRGF0ZXJhbmdlIChjZWxsVmFsdWU6IGFueSwgZGF0YTogYW55LCBwcm9wczogYW55LCBkZWZhdWx0Rm9ybWF0OiBzdHJpbmcpIHtcclxuICBjZWxsVmFsdWUgPSBnZXRGb3JtYXREYXRlKGNlbGxWYWx1ZSwgcHJvcHMsIGRlZmF1bHRGb3JtYXQpXHJcbiAgcmV0dXJuIGNlbGxWYWx1ZSA+PSBnZXRGb3JtYXREYXRlKGRhdGFbMF0sIHByb3BzLCBkZWZhdWx0Rm9ybWF0KSAmJiBjZWxsVmFsdWUgPD0gZ2V0Rm9ybWF0RGF0ZShkYXRhWzFdLCBwcm9wcywgZGVmYXVsdEZvcm1hdClcclxufVxyXG5cclxuZnVuY3Rpb24gbWF0Y2hDYXNjYWRlckRhdGEgKGluZGV4OiBudW1iZXIsIGxpc3Q6IEFycmF5PGFueT4sIHZhbHVlczogQXJyYXk8YW55PiwgbGFiZWxzOiBBcnJheTxhbnk+KSB7XHJcbiAgbGV0IHZhbCA9IHZhbHVlc1tpbmRleF1cclxuICBpZiAobGlzdCAmJiB2YWx1ZXMubGVuZ3RoID4gaW5kZXgpIHtcclxuICAgIFhFVXRpbHMuZWFjaChsaXN0LCAoaXRlbTogYW55KSA9PiB7XHJcbiAgICAgIGlmIChpdGVtLnZhbHVlID09PSB2YWwpIHtcclxuICAgICAgICBsYWJlbHMucHVzaChpdGVtLmxhYmVsKVxyXG4gICAgICAgIG1hdGNoQ2FzY2FkZXJEYXRhKCsraW5kZXgsIGl0ZW0uY2hpbGRyZW4sIHZhbHVlcywgbGFiZWxzKVxyXG4gICAgICB9XHJcbiAgICB9KVxyXG4gIH1cclxufVxyXG5cclxuZnVuY3Rpb24gZ2V0UHJvcHMgKHsgJHRhYmxlIH06IGFueSwgeyBwcm9wcyB9OiBhbnksIGRlZmF1bHRQcm9wcz86IGFueSkge1xyXG4gIHJldHVybiBYRVV0aWxzLmFzc2lnbigkdGFibGUudlNpemUgPyB7IHNpemU6ICR0YWJsZS52U2l6ZSB9IDoge30sIGRlZmF1bHRQcm9wcywgcHJvcHMpXHJcbn1cclxuXHJcbmZ1bmN0aW9uIGdldENlbGxFdmVudHMgKHJlbmRlck9wdHM6IGFueSwgcGFyYW1zOiBhbnkpIHtcclxuICBsZXQgeyBldmVudHMgfSA9IHJlbmRlck9wdHNcclxuICBsZXQgeyAkdGFibGUgfSA9IHBhcmFtc1xyXG4gIGxldCB0eXBlID0gJ29uLWNoYW5nZSdcclxuICBsZXQgb24gPSB7XHJcbiAgICBbdHlwZV06IChldm50OiBhbnkpID0+IHtcclxuICAgICAgJHRhYmxlLnVwZGF0ZVN0YXR1cyhwYXJhbXMpXHJcbiAgICAgIGlmIChldmVudHMgJiYgZXZlbnRzW3R5cGVdKSB7XHJcbiAgICAgICAgZXZlbnRzW3R5cGVdKHBhcmFtcywgZXZudClcclxuICAgICAgfVxyXG4gICAgfVxyXG4gIH1cclxuICBpZiAoZXZlbnRzKSB7XHJcbiAgICByZXR1cm4gWEVVdGlscy5hc3NpZ24oe30sIFhFVXRpbHMub2JqZWN0TWFwKGV2ZW50cywgKGNiOiBGdW5jdGlvbikgPT4gZnVuY3Rpb24gKC4uLmFyZ3M6IGFueVtdKSB7XHJcbiAgICAgIGNiLmFwcGx5KG51bGwsIFtwYXJhbXNdLmNvbmNhdC5hcHBseShwYXJhbXMsIGFyZ3MpKVxyXG4gICAgfSksIG9uKVxyXG4gIH1cclxuICByZXR1cm4gb25cclxufVxyXG5cclxuZnVuY3Rpb24gZ2V0U2VsZWN0Q2VsbFZhbHVlIChyZW5kZXJPcHRzOiBhbnksIHBhcmFtczogYW55KSB7XHJcbiAgbGV0IHsgb3B0aW9ucywgb3B0aW9uR3JvdXBzLCBwcm9wcyA9IHt9LCBvcHRpb25Qcm9wcyA9IHt9LCBvcHRpb25Hcm91cFByb3BzID0ge30gfSA9IHJlbmRlck9wdHNcclxuICBsZXQgeyAkdGFibGUsIHJvdywgY29sdW1uIH0gPSBwYXJhbXNcclxuICBsZXQgbGFiZWxQcm9wID0gb3B0aW9uUHJvcHMubGFiZWwgfHwgJ2xhYmVsJ1xyXG4gIGxldCB2YWx1ZVByb3AgPSBvcHRpb25Qcm9wcy52YWx1ZSB8fCAndmFsdWUnXHJcbiAgbGV0IGdyb3VwT3B0aW9ucyA9IG9wdGlvbkdyb3VwUHJvcHMub3B0aW9ucyB8fCAnb3B0aW9ucydcclxuICBsZXQgY2VsbFZhbHVlID0gWEVVdGlscy5nZXQocm93LCBjb2x1bW4ucHJvcGVydHkpXHJcbiAgbGV0IGNvbGlkOiBzdHJpbmcgPSBjb2x1bW4uaWRcclxuICBsZXQgcmVzdDogYW55XHJcbiAgbGV0IGNlbGxEYXRhOiBhbnlcclxuICBpZiAocHJvcHMuZmlsdGVyYWJsZSkge1xyXG4gICAgbGV0IGZ1bGxBbGxEYXRhUm93TWFwOiBNYXA8YW55LCBhbnk+ID0gJHRhYmxlLmZ1bGxBbGxEYXRhUm93TWFwXHJcbiAgICBsZXQgY2FjaGVDZWxsOiBhbnkgPSBmdWxsQWxsRGF0YVJvd01hcC5oYXMocm93KVxyXG4gICAgaWYgKGNhY2hlQ2VsbCkge1xyXG4gICAgICByZXN0ID0gZnVsbEFsbERhdGFSb3dNYXAuZ2V0KHJvdylcclxuICAgICAgY2VsbERhdGEgPSByZXN0LmNlbGxEYXRhXHJcbiAgICAgIGlmICghY2VsbERhdGEpIHtcclxuICAgICAgICBjZWxsRGF0YSA9IGZ1bGxBbGxEYXRhUm93TWFwLmdldChyb3cpLmNlbGxEYXRhID0ge31cclxuICAgICAgfVxyXG4gICAgfVxyXG4gICAgaWYgKHJlc3QgJiYgY2VsbERhdGFbY29saWRdICYmIGNlbGxEYXRhW2NvbGlkXS52YWx1ZSA9PT0gY2VsbFZhbHVlKSB7XHJcbiAgICAgIHJldHVybiBjZWxsRGF0YVtjb2xpZF0ubGFiZWxcclxuICAgIH1cclxuICB9XHJcbiAgaWYgKCFpc0VtcHR5VmFsdWUoY2VsbFZhbHVlKSkge1xyXG4gICAgcmV0dXJuIFhFVXRpbHMubWFwKHByb3BzLm11bHRpcGxlID8gY2VsbFZhbHVlIDogW2NlbGxWYWx1ZV0sIG9wdGlvbkdyb3VwcyA/ICh2YWx1ZTogYW55KSA9PiB7XHJcbiAgICAgIGxldCBzZWxlY3RJdGVtXHJcbiAgICAgIGZvciAobGV0IGluZGV4ID0gMDsgaW5kZXggPCBvcHRpb25Hcm91cHMubGVuZ3RoOyBpbmRleCsrKSB7XHJcbiAgICAgICAgc2VsZWN0SXRlbSA9IFhFVXRpbHMuZmluZChvcHRpb25Hcm91cHNbaW5kZXhdW2dyb3VwT3B0aW9uc10sIChpdGVtOiBhbnkpID0+IGl0ZW1bdmFsdWVQcm9wXSA9PT0gdmFsdWUpXHJcbiAgICAgICAgaWYgKHNlbGVjdEl0ZW0pIHtcclxuICAgICAgICAgIGJyZWFrXHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICAgIGxldCBjZWxsTGFiZWw6IGFueSA9IHNlbGVjdEl0ZW0gPyBzZWxlY3RJdGVtW2xhYmVsUHJvcF0gOiB2YWx1ZVxyXG4gICAgICBpZiAoY2VsbERhdGEgJiYgb3B0aW9ucyAmJiBvcHRpb25zLmxlbmd0aCkge1xyXG4gICAgICAgIGNlbGxEYXRhW2NvbGlkXSA9IHsgdmFsdWU6IGNlbGxWYWx1ZSwgbGFiZWw6IGNlbGxMYWJlbCB9XHJcbiAgICAgIH1cclxuICAgICAgcmV0dXJuIGNlbGxMYWJlbFxyXG4gICAgfSA6ICh2YWx1ZTogYW55KSA9PiB7XHJcbiAgICAgIGxldCBzZWxlY3RJdGVtID0gWEVVdGlscy5maW5kKG9wdGlvbnMsIChpdGVtOiBhbnkpID0+IGl0ZW1bdmFsdWVQcm9wXSA9PT0gdmFsdWUpXHJcbiAgICAgIGxldCBjZWxsTGFiZWw6IGFueSA9IHNlbGVjdEl0ZW0gPyBzZWxlY3RJdGVtW2xhYmVsUHJvcF0gOiB2YWx1ZVxyXG4gICAgICBpZiAoY2VsbERhdGEgJiYgb3B0aW9ucyAmJiBvcHRpb25zLmxlbmd0aCkge1xyXG4gICAgICAgIGNlbGxEYXRhW2NvbGlkXSA9IHsgdmFsdWU6IGNlbGxWYWx1ZSwgbGFiZWw6IGNlbGxMYWJlbCB9XHJcbiAgICAgIH1cclxuICAgICAgcmV0dXJuIGNlbGxMYWJlbFxyXG4gICAgfSkuam9pbignOycpXHJcbiAgfVxyXG4gIHJldHVybiBudWxsXHJcbn1cclxuXHJcbmZ1bmN0aW9uIGdldENhc2NhZGVyQ2VsbFZhbHVlIChyZW5kZXJPcHRzOiBhbnksIHBhcmFtczogYW55KSB7XHJcbiAgbGV0IHsgcHJvcHMgPSB7fSB9ID0gcmVuZGVyT3B0c1xyXG4gIGxldCB7IHJvdywgY29sdW1uIH0gPSBwYXJhbXNcclxuICBsZXQgY2VsbFZhbHVlID0gWEVVdGlscy5nZXQocm93LCBjb2x1bW4ucHJvcGVydHkpXHJcbiAgbGV0IHZhbHVlcyA9IGNlbGxWYWx1ZSB8fCBbXVxyXG4gIGxldCBsYWJlbHM6IEFycmF5PGFueT4gPSBbXVxyXG4gIG1hdGNoQ2FzY2FkZXJEYXRhKDAsIHByb3BzLmRhdGEsIHZhbHVlcywgbGFiZWxzKVxyXG4gIHJldHVybiBsYWJlbHMuam9pbihgICR7cHJvcHMuc2VwYXJhdG9yIHx8ICcvJ30gYClcclxufVxyXG5cclxuZnVuY3Rpb24gZ2V0RGF0ZVBpY2tlckNlbGxWYWx1ZSAocmVuZGVyT3B0czogYW55LCBwYXJhbXM6IGFueSkge1xyXG4gIGxldCB7IHByb3BzID0ge30gfSA9IHJlbmRlck9wdHNcclxuICBsZXQgeyByb3csIGNvbHVtbiB9ID0gcGFyYW1zXHJcbiAgbGV0IHsgc2VwYXJhdG9yIH0gPSBwcm9wc1xyXG4gIGxldCBjZWxsVmFsdWUgPSBYRVV0aWxzLmdldChyb3csIGNvbHVtbi5wcm9wZXJ0eSlcclxuICBzd2l0Y2ggKHByb3BzLnR5cGUpIHtcclxuICAgIGNhc2UgJ3dlZWsnOlxyXG4gICAgICBjZWxsVmFsdWUgPSBnZXRGb3JtYXREYXRlKGNlbGxWYWx1ZSwgcHJvcHMsICd5eXl5d1dXJylcclxuICAgICAgYnJlYWtcclxuICAgIGNhc2UgJ21vbnRoJzpcclxuICAgICAgY2VsbFZhbHVlID0gZ2V0Rm9ybWF0RGF0ZShjZWxsVmFsdWUsIHByb3BzLCAneXl5eS1NTScpXHJcbiAgICAgIGJyZWFrXHJcbiAgICBjYXNlICd5ZWFyJzpcclxuICAgICAgY2VsbFZhbHVlID0gZ2V0Rm9ybWF0RGF0ZShjZWxsVmFsdWUsIHByb3BzLCAneXl5eScpXHJcbiAgICAgIGJyZWFrXHJcbiAgICBjYXNlICdkYXRlcyc6XHJcbiAgICAgIGNlbGxWYWx1ZSA9IGdldEZvcm1hdERhdGVzKGNlbGxWYWx1ZSwgcHJvcHMsICcsICcsICd5eXl5LU1NLWRkJylcclxuICAgICAgYnJlYWtcclxuICAgIGNhc2UgJ2RhdGVyYW5nZSc6XHJcbiAgICAgIGNlbGxWYWx1ZSA9IGdldEZvcm1hdERhdGVzKGNlbGxWYWx1ZSwgcHJvcHMsIGAgJHtzZXBhcmF0b3IgfHwgJy0nfSBgLCAneXl5eS1NTS1kZCcpXHJcbiAgICAgIGJyZWFrXHJcbiAgICBjYXNlICdkYXRldGltZXJhbmdlJzpcclxuICAgICAgY2VsbFZhbHVlID0gZ2V0Rm9ybWF0RGF0ZXMoY2VsbFZhbHVlLCBwcm9wcywgYCAke3NlcGFyYXRvciB8fCAnLSd9IGAsICd5eXl5LU1NLWRkIEhIOnNzOm1tJylcclxuICAgICAgYnJlYWtcclxuICAgIGRlZmF1bHQ6XHJcbiAgICAgIGNlbGxWYWx1ZSA9IGdldEZvcm1hdERhdGUoY2VsbFZhbHVlLCBwcm9wcywgJ3l5eXktTU0tZGQnKVxyXG4gICAgICBicmVha1xyXG4gIH1cclxuICByZXR1cm4gY2VsbFZhbHVlXHJcbn1cclxuXHJcbmZ1bmN0aW9uIGNyZWF0ZUVkaXRSZW5kZXIgKGRlZmF1bHRQcm9wcz86IGFueSkge1xyXG4gIHJldHVybiBmdW5jdGlvbiAoaDogRnVuY3Rpb24sIHJlbmRlck9wdHM6IGFueSwgcGFyYW1zOiBhbnkpIHtcclxuICAgIGxldCB7IHJvdywgY29sdW1uIH0gPSBwYXJhbXNcclxuICAgIGxldCB7IGF0dHJzIH0gPSByZW5kZXJPcHRzXHJcbiAgICBsZXQgcHJvcHMgPSBnZXRQcm9wcyhwYXJhbXMsIHJlbmRlck9wdHMsIGRlZmF1bHRQcm9wcylcclxuICAgIHJldHVybiBbXHJcbiAgICAgIGgocmVuZGVyT3B0cy5uYW1lLCB7XHJcbiAgICAgICAgcHJvcHMsXHJcbiAgICAgICAgYXR0cnMsXHJcbiAgICAgICAgbW9kZWw6IHtcclxuICAgICAgICAgIHZhbHVlOiBYRVV0aWxzLmdldChyb3csIGNvbHVtbi5wcm9wZXJ0eSksXHJcbiAgICAgICAgICBjYWxsYmFjayAodmFsdWU6IGFueSkge1xyXG4gICAgICAgICAgICBYRVV0aWxzLnNldChyb3csIGNvbHVtbi5wcm9wZXJ0eSwgdmFsdWUpXHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfSxcclxuICAgICAgICBvbjogZ2V0Q2VsbEV2ZW50cyhyZW5kZXJPcHRzLCBwYXJhbXMpXHJcbiAgICAgIH0pXHJcbiAgICBdXHJcbiAgfVxyXG59XHJcblxyXG5mdW5jdGlvbiBnZXRGaWx0ZXJFdmVudHMgKG9uOiBhbnksIHJlbmRlck9wdHM6IGFueSwgcGFyYW1zOiBhbnksIGNvbnRleHQ6IGFueSkge1xyXG4gIGxldCB7IGV2ZW50cyB9ID0gcmVuZGVyT3B0c1xyXG4gIGlmIChldmVudHMpIHtcclxuICAgIHJldHVybiBYRVV0aWxzLmFzc2lnbih7fSwgWEVVdGlscy5vYmplY3RNYXAoZXZlbnRzLCAoY2I6IEZ1bmN0aW9uKSA9PiBmdW5jdGlvbiAoLi4uYXJnczogYW55W10pIHtcclxuICAgICAgcGFyYW1zID0gT2JqZWN0LmFzc2lnbih7IGNvbnRleHQgfSwgcGFyYW1zKVxyXG4gICAgICBjYi5hcHBseShudWxsLCBbcGFyYW1zXS5jb25jYXQuYXBwbHkocGFyYW1zLCBhcmdzKSlcclxuICAgIH0pLCBvbilcclxuICB9XHJcbiAgcmV0dXJuIG9uXHJcbn1cclxuXHJcbmZ1bmN0aW9uIGNyZWF0ZUZpbHRlclJlbmRlciAoZGVmYXVsdFByb3BzPzogYW55KSB7XHJcbiAgcmV0dXJuIGZ1bmN0aW9uIChoOiBGdW5jdGlvbiwgcmVuZGVyT3B0czogYW55LCBwYXJhbXM6IGFueSwgY29udGV4dDogYW55KSB7XHJcbiAgICBsZXQgeyBjb2x1bW4gfSA9IHBhcmFtc1xyXG4gICAgbGV0IHsgbmFtZSwgYXR0cnMsIGV2ZW50cyB9ID0gcmVuZGVyT3B0c1xyXG4gICAgbGV0IHR5cGUgPSAnb24tY2hhbmdlJ1xyXG4gICAgbGV0IHByb3BzID0gZ2V0UHJvcHMocGFyYW1zLCByZW5kZXJPcHRzKVxyXG4gICAgcmV0dXJuIGNvbHVtbi5maWx0ZXJzLm1hcCgoaXRlbTogYW55KSA9PiB7XHJcbiAgICAgIHJldHVybiBoKG5hbWUsIHtcclxuICAgICAgICBwcm9wcyxcclxuICAgICAgICBhdHRycyxcclxuICAgICAgICBtb2RlbDoge1xyXG4gICAgICAgICAgdmFsdWU6IGl0ZW0uZGF0YSxcclxuICAgICAgICAgIGNhbGxiYWNrIChvcHRpb25WYWx1ZTogYW55KSB7XHJcbiAgICAgICAgICAgIGl0ZW0uZGF0YSA9IG9wdGlvblZhbHVlXHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfSxcclxuICAgICAgICBvbjogZ2V0RmlsdGVyRXZlbnRzKHtcclxuICAgICAgICAgIFt0eXBlXSAoZXZudDogYW55KSB7XHJcbiAgICAgICAgICAgIGhhbmRsZUNvbmZpcm1GaWx0ZXIoY29udGV4dCwgY29sdW1uLCAhIWl0ZW0uZGF0YSwgaXRlbSlcclxuICAgICAgICAgICAgaWYgKGV2ZW50cyAmJiBldmVudHNbdHlwZV0pIHtcclxuICAgICAgICAgICAgICBldmVudHNbdHlwZV0oT2JqZWN0LmFzc2lnbih7IGNvbnRleHQgfSwgcGFyYW1zKSwgZXZudClcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH0sIHJlbmRlck9wdHMsIHBhcmFtcywgY29udGV4dClcclxuICAgICAgfSlcclxuICAgIH0pXHJcbiAgfVxyXG59XHJcblxyXG5mdW5jdGlvbiBoYW5kbGVDb25maXJtRmlsdGVyIChjb250ZXh0OiBhbnksIGNvbHVtbjogYW55LCBjaGVja2VkOiBhbnksIGl0ZW06IGFueSkge1xyXG4gIGNvbnRleHRbY29sdW1uLmZpbHRlck11bHRpcGxlID8gJ2NoYW5nZU11bHRpcGxlT3B0aW9uJyA6ICdjaGFuZ2VSYWRpb09wdGlvbiddKHt9LCBjaGVja2VkLCBpdGVtKVxyXG59XHJcblxyXG5mdW5jdGlvbiBkZWZhdWx0RmlsdGVyTWV0aG9kICh7IG9wdGlvbiwgcm93LCBjb2x1bW4gfTogYW55KSB7XHJcbiAgbGV0IHsgZGF0YSB9ID0gb3B0aW9uXHJcbiAgbGV0IGNlbGxWYWx1ZSA9IFhFVXRpbHMuZ2V0KHJvdywgY29sdW1uLnByb3BlcnR5KVxyXG4gIC8qIGVzbGludC1kaXNhYmxlIGVxZXFlcSAqL1xyXG4gIHJldHVybiBjZWxsVmFsdWUgPT09IGRhdGFcclxufVxyXG5cclxuZnVuY3Rpb24gcmVuZGVyT3B0aW9ucyAoaDogRnVuY3Rpb24sIG9wdGlvbnM6IGFueSwgb3B0aW9uUHJvcHM6IGFueSkge1xyXG4gIGxldCBsYWJlbFByb3AgPSBvcHRpb25Qcm9wcy5sYWJlbCB8fCAnbGFiZWwnXHJcbiAgbGV0IHZhbHVlUHJvcCA9IG9wdGlvblByb3BzLnZhbHVlIHx8ICd2YWx1ZSdcclxuICBsZXQgZGlzYWJsZWRQcm9wID0gb3B0aW9uUHJvcHMuZGlzYWJsZWQgfHwgJ2Rpc2FibGVkJ1xyXG4gIHJldHVybiBYRVV0aWxzLm1hcChvcHRpb25zLCAoaXRlbTogYW55LCBpbmRleDogbnVtYmVyKSA9PiB7XHJcbiAgICByZXR1cm4gaCgnT3B0aW9uJywge1xyXG4gICAgICBwcm9wczoge1xyXG4gICAgICAgIHZhbHVlOiBpdGVtW3ZhbHVlUHJvcF0sXHJcbiAgICAgICAgbGFiZWw6IGl0ZW1bbGFiZWxQcm9wXSxcclxuICAgICAgICBkaXNhYmxlZDogaXRlbVtkaXNhYmxlZFByb3BdXHJcbiAgICAgIH0sXHJcbiAgICAgIGtleTogaW5kZXhcclxuICAgIH0pXHJcbiAgfSlcclxufVxyXG5cclxuZnVuY3Rpb24gY2VsbFRleHQgKGg6IEZ1bmN0aW9uLCBjZWxsVmFsdWU6IGFueSkge1xyXG4gIHJldHVybiBbJycgKyAoaXNFbXB0eVZhbHVlKGNlbGxWYWx1ZSkgPyAnJyA6IGNlbGxWYWx1ZSldXHJcbn1cclxuXHJcbmZ1bmN0aW9uIGNyZWF0ZUZvcm1JdGVtUmVuZGVyIChkZWZhdWx0UHJvcHM/OiBhbnkpIHtcclxuICByZXR1cm4gZnVuY3Rpb24gKGg6IEZ1bmN0aW9uLCByZW5kZXJPcHRzOiBhbnksIHBhcmFtczogYW55LCBjb250ZXh0OiBhbnkpIHtcclxuICAgIGxldCB7IGRhdGEsIHByb3BlcnR5IH0gPSBwYXJhbXNcclxuICAgIGxldCB7IG5hbWUgfSA9IHJlbmRlck9wdHNcclxuICAgIGxldCB7IGF0dHJzIH06IGFueSA9IHJlbmRlck9wdHNcclxuICAgIGxldCBwcm9wczogYW55ID0gZ2V0Rm9ybVByb3BzKGNvbnRleHQsIHJlbmRlck9wdHMsIGRlZmF1bHRQcm9wcylcclxuICAgIHJldHVybiBbXHJcbiAgICAgIGgobmFtZSwge1xyXG4gICAgICAgIGF0dHJzLFxyXG4gICAgICAgIHByb3BzLFxyXG4gICAgICAgIG1vZGVsOiB7XHJcbiAgICAgICAgICB2YWx1ZTogWEVVdGlscy5nZXQoZGF0YSwgcHJvcGVydHkpLFxyXG4gICAgICAgICAgY2FsbGJhY2sgKHZhbHVlOiBhbnkpIHtcclxuICAgICAgICAgICAgWEVVdGlscy5zZXQoZGF0YSwgcHJvcGVydHksIHZhbHVlKVxyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgb246IGdldEZvcm1FdmVudHMocmVuZGVyT3B0cywgcGFyYW1zLCBjb250ZXh0KVxyXG4gICAgICB9KVxyXG4gICAgXVxyXG4gIH1cclxufVxyXG5cclxuZnVuY3Rpb24gZ2V0Rm9ybVByb3BzICh7ICRmb3JtIH06IGFueSwgeyBwcm9wcyB9OiBhbnksIGRlZmF1bHRQcm9wcz86IGFueSkge1xyXG4gIHJldHVybiBYRVV0aWxzLmFzc2lnbigkZm9ybS52U2l6ZSA/IHsgc2l6ZTogJGZvcm0udlNpemUgfSA6IHt9LCBkZWZhdWx0UHJvcHMsIHByb3BzKVxyXG59XHJcblxyXG5mdW5jdGlvbiBnZXRGb3JtRXZlbnRzIChyZW5kZXJPcHRzOiBhbnksIHBhcmFtczogYW55LCBjb250ZXh0OiBhbnkpIHtcclxuICBsZXQgeyBldmVudHMgfTogYW55ID0gcmVuZGVyT3B0c1xyXG4gIGxldCB7ICRmb3JtIH0gPSBwYXJhbXNcclxuICBsZXQgdHlwZSA9ICdvbi1jaGFuZ2UnXHJcbiAgbGV0IG9uID0ge1xyXG4gICAgW3R5cGVdOiAoZXZudDogYW55KSA9PiB7XHJcbiAgICAgICRmb3JtLnVwZGF0ZVN0YXR1cyhwYXJhbXMpXHJcbiAgICAgIGlmIChldmVudHMgJiYgZXZlbnRzW3R5cGVdKSB7XHJcbiAgICAgICAgZXZlbnRzW3R5cGVdKHBhcmFtcywgZXZudClcclxuICAgICAgfVxyXG4gICAgfVxyXG4gIH1cclxuICBpZiAoZXZlbnRzKSB7XHJcbiAgICByZXR1cm4gWEVVdGlscy5hc3NpZ24oe30sIFhFVXRpbHMub2JqZWN0TWFwKGV2ZW50cywgKGNiOiBGdW5jdGlvbikgPT4gZnVuY3Rpb24gKC4uLmFyZ3M6IGFueVtdKSB7XHJcbiAgICAgIGNiLmFwcGx5KG51bGwsIFtwYXJhbXNdLmNvbmNhdC5hcHBseShwYXJhbXMsIGFyZ3MpKVxyXG4gICAgfSksIG9uKVxyXG4gIH1cclxuICByZXR1cm4gb25cclxufVxyXG5cclxuZnVuY3Rpb24gY3JlYXRlRXhwb3J0TWV0aG9kICh2YWx1ZU1ldGhvZDogRnVuY3Rpb24sIGlzRWRpdD86IGJvb2xlYW4pIHtcclxuICBjb25zdCByZW5kZXJQcm9wZXJ0eSA9IGlzRWRpdCA/ICdlZGl0UmVuZGVyJyA6ICdjZWxsUmVuZGVyJ1xyXG4gIHJldHVybiBmdW5jdGlvbiAocGFyYW1zOiBhbnkpIHtcclxuICAgIHJldHVybiB2YWx1ZU1ldGhvZChwYXJhbXMuY29sdW1uW3JlbmRlclByb3BlcnR5XSwgcGFyYW1zKVxyXG4gIH1cclxufVxyXG5cclxuZnVuY3Rpb24gY3JlYXRlRm9ybUl0ZW1SYWRpb0FuZENoZWNrYm94UmVuZGVyICgpIHtcclxuICByZXR1cm4gZnVuY3Rpb24gKGg6IEZ1bmN0aW9uLCByZW5kZXJPcHRzOiBhbnksIHBhcmFtczogYW55LCBjb250ZXh0OiBhbnkpIHtcclxuICAgIGxldCB7IG5hbWUsIG9wdGlvbnMsIG9wdGlvblByb3BzID0ge30gfSA9IHJlbmRlck9wdHNcclxuICAgIGxldCB7IGRhdGEsIHByb3BlcnR5IH0gPSBwYXJhbXNcclxuICAgIGxldCB7IGF0dHJzIH0gPSByZW5kZXJPcHRzXHJcbiAgICBsZXQgcHJvcHM6IGFueSA9IGdldEZvcm1Qcm9wcyhjb250ZXh0LCByZW5kZXJPcHRzKVxyXG4gICAgbGV0IGxhYmVsUHJvcDogc3RyaW5nID0gb3B0aW9uUHJvcHMubGFiZWwgfHwgJ2xhYmVsJ1xyXG4gICAgbGV0IHZhbHVlUHJvcDogc3RyaW5nID0gb3B0aW9uUHJvcHMudmFsdWUgfHwgJ3ZhbHVlJ1xyXG4gICAgbGV0IGRpc2FibGVkUHJvcDogc3RyaW5nID0gb3B0aW9uUHJvcHMuZGlzYWJsZWQgfHwgJ2Rpc2FibGVkJ1xyXG4gICAgcmV0dXJuIFtcclxuICAgICAgaChgJHtuYW1lfUdyb3VwYCwge1xyXG4gICAgICAgIHByb3BzLFxyXG4gICAgICAgIGF0dHJzLFxyXG4gICAgICAgIG1vZGVsOiB7XHJcbiAgICAgICAgICB2YWx1ZTogWEVVdGlscy5nZXQoZGF0YSwgcHJvcGVydHkpLFxyXG4gICAgICAgICAgY2FsbGJhY2sgKGNlbGxWYWx1ZTogYW55KSB7XHJcbiAgICAgICAgICAgIFhFVXRpbHMuc2V0KGRhdGEsIHByb3BlcnR5LCBjZWxsVmFsdWUpXHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfSxcclxuICAgICAgICBvbjogZ2V0Rm9ybUV2ZW50cyhyZW5kZXJPcHRzLCBwYXJhbXMsIGNvbnRleHQpXHJcbiAgICAgIH0sIG9wdGlvbnMubWFwKChvcHRpb246IGFueSkgPT4ge1xyXG4gICAgICAgIHJldHVybiBoKG5hbWUsIHtcclxuICAgICAgICAgIHByb3BzOiB7XHJcbiAgICAgICAgICAgIGxhYmVsOiBvcHRpb25bdmFsdWVQcm9wXSxcclxuICAgICAgICAgICAgZGlzYWJsZWQ6IG9wdGlvbltkaXNhYmxlZFByb3BdXHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfSwgb3B0aW9uW2xhYmVsUHJvcF0pXHJcbiAgICAgIH0pKVxyXG4gICAgXVxyXG4gIH1cclxufVxyXG5cclxuLyoqXHJcbiAqIOa4suafk+WHveaVsFxyXG4gKi9cclxuY29uc3QgcmVuZGVyTWFwOiBhbnkgPSB7XHJcbiAgSW5wdXQ6IHtcclxuICAgIGF1dG9mb2N1czogJ2lucHV0Lml2dS1pbnB1dCcsXHJcbiAgICByZW5kZXJEZWZhdWx0OiBjcmVhdGVFZGl0UmVuZGVyKCksXHJcbiAgICByZW5kZXJFZGl0OiBjcmVhdGVFZGl0UmVuZGVyKCksXHJcbiAgICByZW5kZXJGaWx0ZXI6IGNyZWF0ZUZpbHRlclJlbmRlcigpLFxyXG4gICAgZmlsdGVyTWV0aG9kOiBkZWZhdWx0RmlsdGVyTWV0aG9kLFxyXG4gICAgcmVuZGVySXRlbTogY3JlYXRlRm9ybUl0ZW1SZW5kZXIoKVxyXG4gIH0sXHJcbiAgQXV0b0NvbXBsZXRlOiB7XHJcbiAgICBhdXRvZm9jdXM6ICdpbnB1dC5pdnUtaW5wdXQnLFxyXG4gICAgcmVuZGVyRGVmYXVsdDogY3JlYXRlRWRpdFJlbmRlcigpLFxyXG4gICAgcmVuZGVyRWRpdDogY3JlYXRlRWRpdFJlbmRlcigpLFxyXG4gICAgcmVuZGVyRmlsdGVyOiBjcmVhdGVGaWx0ZXJSZW5kZXIoKSxcclxuICAgIGZpbHRlck1ldGhvZDogZGVmYXVsdEZpbHRlck1ldGhvZCxcclxuICAgIHJlbmRlckl0ZW06IGNyZWF0ZUZvcm1JdGVtUmVuZGVyKClcclxuICB9LFxyXG4gIElucHV0TnVtYmVyOiB7XHJcbiAgICBhdXRvZm9jdXM6ICdpbnB1dC5pdnUtaW5wdXQtbnVtYmVyLWlucHV0JyxcclxuICAgIHJlbmRlckRlZmF1bHQ6IGNyZWF0ZUVkaXRSZW5kZXIoKSxcclxuICAgIHJlbmRlckVkaXQ6IGNyZWF0ZUVkaXRSZW5kZXIoKSxcclxuICAgIHJlbmRlckZpbHRlcjogY3JlYXRlRmlsdGVyUmVuZGVyKCksXHJcbiAgICBmaWx0ZXJNZXRob2Q6IGRlZmF1bHRGaWx0ZXJNZXRob2QsXHJcbiAgICByZW5kZXJJdGVtOiBjcmVhdGVGb3JtSXRlbVJlbmRlcigpXHJcbiAgfSxcclxuICBTZWxlY3Q6IHtcclxuICAgIHJlbmRlckVkaXQgKGg6IEZ1bmN0aW9uLCByZW5kZXJPcHRzOiBhbnksIHBhcmFtczogYW55KSB7XHJcbiAgICAgIGxldCB7IG9wdGlvbnMsIG9wdGlvbkdyb3Vwcywgb3B0aW9uUHJvcHMgPSB7fSwgb3B0aW9uR3JvdXBQcm9wcyA9IHt9IH0gPSByZW5kZXJPcHRzXHJcbiAgICAgIGxldCB7IHJvdywgY29sdW1uIH0gPSBwYXJhbXNcclxuICAgICAgbGV0IHsgYXR0cnMgfSA9IHJlbmRlck9wdHNcclxuICAgICAgbGV0IHByb3BzID0gZ2V0UHJvcHMocGFyYW1zLCByZW5kZXJPcHRzLCB7IHRyYW5zZmVyOiB0cnVlIH0pXHJcbiAgICAgIGlmIChvcHRpb25Hcm91cHMpIHtcclxuICAgICAgICBsZXQgZ3JvdXBPcHRpb25zID0gb3B0aW9uR3JvdXBQcm9wcy5vcHRpb25zIHx8ICdvcHRpb25zJ1xyXG4gICAgICAgIGxldCBncm91cExhYmVsID0gb3B0aW9uR3JvdXBQcm9wcy5sYWJlbCB8fCAnbGFiZWwnXHJcbiAgICAgICAgcmV0dXJuIFtcclxuICAgICAgICAgIGgoJ1NlbGVjdCcsIHtcclxuICAgICAgICAgICAgcHJvcHMsXHJcbiAgICAgICAgICAgIGF0dHJzLFxyXG4gICAgICAgICAgICBtb2RlbDoge1xyXG4gICAgICAgICAgICAgIHZhbHVlOiBYRVV0aWxzLmdldChyb3csIGNvbHVtbi5wcm9wZXJ0eSksXHJcbiAgICAgICAgICAgICAgY2FsbGJhY2sgKGNlbGxWYWx1ZTogYW55KSB7XHJcbiAgICAgICAgICAgICAgICBYRVV0aWxzLnNldChyb3csIGNvbHVtbi5wcm9wZXJ0eSwgY2VsbFZhbHVlKVxyXG4gICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgb246IGdldENlbGxFdmVudHMocmVuZGVyT3B0cywgcGFyYW1zKVxyXG4gICAgICAgICAgfSwgWEVVdGlscy5tYXAob3B0aW9uR3JvdXBzLCAoZ3JvdXA6IGFueSwgZ0luZGV4OiBudW1iZXIpID0+IHtcclxuICAgICAgICAgICAgcmV0dXJuIGgoJ09wdGlvbkdyb3VwJywge1xyXG4gICAgICAgICAgICAgIHByb3BzOiB7XHJcbiAgICAgICAgICAgICAgICBsYWJlbDogZ3JvdXBbZ3JvdXBMYWJlbF1cclxuICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgIGtleTogZ0luZGV4XHJcbiAgICAgICAgICAgIH0sIHJlbmRlck9wdGlvbnMoaCwgZ3JvdXBbZ3JvdXBPcHRpb25zXSwgb3B0aW9uUHJvcHMpKVxyXG4gICAgICAgICAgfSkpXHJcbiAgICAgICAgXVxyXG4gICAgICB9XHJcbiAgICAgIHJldHVybiBbXHJcbiAgICAgICAgaCgnU2VsZWN0Jywge1xyXG4gICAgICAgICAgcHJvcHMsXHJcbiAgICAgICAgICBhdHRycyxcclxuICAgICAgICAgIG1vZGVsOiB7XHJcbiAgICAgICAgICAgIHZhbHVlOiBYRVV0aWxzLmdldChyb3csIGNvbHVtbi5wcm9wZXJ0eSksXHJcbiAgICAgICAgICAgIGNhbGxiYWNrIChjZWxsVmFsdWU6IGFueSkge1xyXG4gICAgICAgICAgICAgIFhFVXRpbHMuc2V0KHJvdywgY29sdW1uLnByb3BlcnR5LCBjZWxsVmFsdWUpXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgIH0sXHJcbiAgICAgICAgICBvbjogZ2V0Q2VsbEV2ZW50cyhyZW5kZXJPcHRzLCBwYXJhbXMpXHJcbiAgICAgICAgfSwgcmVuZGVyT3B0aW9ucyhoLCBvcHRpb25zLCBvcHRpb25Qcm9wcykpXHJcbiAgICAgIF1cclxuICAgIH0sXHJcbiAgICByZW5kZXJDZWxsIChoOiBGdW5jdGlvbiwgcmVuZGVyT3B0czogYW55LCBwYXJhbXM6IGFueSkge1xyXG4gICAgICBjZWxsVGV4dChoLCBnZXRTZWxlY3RDZWxsVmFsdWUocmVuZGVyT3B0cywgcGFyYW1zKSlcclxuICAgIH0sXHJcbiAgICByZW5kZXJGaWx0ZXIgKGg6IEZ1bmN0aW9uLCByZW5kZXJPcHRzOiBhbnksIHBhcmFtczogYW55LCBjb250ZXh0OiBhbnkpIHtcclxuICAgICAgbGV0IHsgb3B0aW9ucywgb3B0aW9uR3JvdXBzLCBvcHRpb25Qcm9wcyA9IHt9LCBvcHRpb25Hcm91cFByb3BzID0ge30gfSA9IHJlbmRlck9wdHNcclxuICAgICAgbGV0IHsgY29sdW1uIH0gPSBwYXJhbXNcclxuICAgICAgbGV0IHsgYXR0cnMsIGV2ZW50cyB9ID0gcmVuZGVyT3B0c1xyXG4gICAgICBsZXQgcHJvcHMgPSBnZXRQcm9wcyhwYXJhbXMsIHJlbmRlck9wdHMsIHsgdHJhbnNmZXI6IHRydWUgfSlcclxuICAgICAgbGV0IHR5cGUgPSAnb24tY2hhbmdlJ1xyXG4gICAgICBpZiAob3B0aW9uR3JvdXBzKSB7XHJcbiAgICAgICAgbGV0IGdyb3VwT3B0aW9ucyA9IG9wdGlvbkdyb3VwUHJvcHMub3B0aW9ucyB8fCAnb3B0aW9ucydcclxuICAgICAgICBsZXQgZ3JvdXBMYWJlbCA9IG9wdGlvbkdyb3VwUHJvcHMubGFiZWwgfHwgJ2xhYmVsJ1xyXG4gICAgICAgIHJldHVybiBjb2x1bW4uZmlsdGVycy5tYXAoKGl0ZW06IGFueSkgPT4ge1xyXG4gICAgICAgICAgcmV0dXJuIGgoJ1NlbGVjdCcsIHtcclxuICAgICAgICAgICAgcHJvcHMsXHJcbiAgICAgICAgICAgIGF0dHJzLFxyXG4gICAgICAgICAgICBtb2RlbDoge1xyXG4gICAgICAgICAgICAgIHZhbHVlOiBpdGVtLmRhdGEsXHJcbiAgICAgICAgICAgICAgY2FsbGJhY2sgKG9wdGlvblZhbHVlOiBhbnkpIHtcclxuICAgICAgICAgICAgICAgIGl0ZW0uZGF0YSA9IG9wdGlvblZhbHVlXHJcbiAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICBvbjogZ2V0RmlsdGVyRXZlbnRzKHtcclxuICAgICAgICAgICAgICBbdHlwZV0gKHZhbHVlOiBhbnkpIHtcclxuICAgICAgICAgICAgICAgIGhhbmRsZUNvbmZpcm1GaWx0ZXIoY29udGV4dCwgY29sdW1uLCB2YWx1ZSAmJiB2YWx1ZS5sZW5ndGggPiAwLCBpdGVtKVxyXG4gICAgICAgICAgICAgICAgaWYgKGV2ZW50cyAmJiBldmVudHNbdHlwZV0pIHtcclxuICAgICAgICAgICAgICAgICAgZXZlbnRzW3R5cGVdKE9iamVjdC5hc3NpZ24oeyBjb250ZXh0IH0sIHBhcmFtcyksIHZhbHVlKVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSwgcmVuZGVyT3B0cywgcGFyYW1zLCBjb250ZXh0KVxyXG4gICAgICAgICAgfSwgWEVVdGlscy5tYXAob3B0aW9uR3JvdXBzLCAoZ3JvdXA6IGFueSwgZ0luZGV4OiBudW1iZXIpID0+IHtcclxuICAgICAgICAgICAgcmV0dXJuIGgoJ09wdGlvbkdyb3VwJywge1xyXG4gICAgICAgICAgICAgIHByb3BzOiB7XHJcbiAgICAgICAgICAgICAgICBsYWJlbDogZ3JvdXBbZ3JvdXBMYWJlbF1cclxuICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgIGtleTogZ0luZGV4XHJcbiAgICAgICAgICAgIH0sIHJlbmRlck9wdGlvbnMoaCwgZ3JvdXBbZ3JvdXBPcHRpb25zXSwgb3B0aW9uUHJvcHMpKVxyXG4gICAgICAgICAgfSkpXHJcbiAgICAgICAgfSlcclxuICAgICAgfVxyXG4gICAgICByZXR1cm4gY29sdW1uLmZpbHRlcnMubWFwKChpdGVtOiBhbnkpID0+IHtcclxuICAgICAgICByZXR1cm4gaCgnU2VsZWN0Jywge1xyXG4gICAgICAgICAgcHJvcHMsXHJcbiAgICAgICAgICBhdHRycyxcclxuICAgICAgICAgIG1vZGVsOiB7XHJcbiAgICAgICAgICAgIHZhbHVlOiBpdGVtLmRhdGEsXHJcbiAgICAgICAgICAgIGNhbGxiYWNrIChvcHRpb25WYWx1ZTogYW55KSB7XHJcbiAgICAgICAgICAgICAgaXRlbS5kYXRhID0gb3B0aW9uVmFsdWVcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgfSxcclxuICAgICAgICAgIG9uOiBnZXRGaWx0ZXJFdmVudHMoe1xyXG4gICAgICAgICAgICBbdHlwZV0gKHZhbHVlOiBhbnkpIHtcclxuICAgICAgICAgICAgICBoYW5kbGVDb25maXJtRmlsdGVyKGNvbnRleHQsIGNvbHVtbiwgdmFsdWUgJiYgdmFsdWUubGVuZ3RoID4gMCwgaXRlbSlcclxuICAgICAgICAgICAgICBpZiAoZXZlbnRzICYmIGV2ZW50c1t0eXBlXSkge1xyXG4gICAgICAgICAgICAgICAgZXZlbnRzW3R5cGVdKE9iamVjdC5hc3NpZ24oeyBjb250ZXh0IH0sIHBhcmFtcyksIHZhbHVlKVxyXG4gICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgfSwgcmVuZGVyT3B0cywgcGFyYW1zLCBjb250ZXh0KVxyXG4gICAgICAgIH0sIHJlbmRlck9wdGlvbnMoaCwgb3B0aW9ucywgb3B0aW9uUHJvcHMpKVxyXG4gICAgICB9KVxyXG4gICAgfSxcclxuICAgIGZpbHRlck1ldGhvZCAoeyBvcHRpb24sIHJvdywgY29sdW1uIH06IGFueSkge1xyXG4gICAgICBsZXQgeyBkYXRhIH0gPSBvcHRpb25cclxuICAgICAgbGV0IHsgcHJvcGVydHksIGZpbHRlclJlbmRlcjogcmVuZGVyT3B0cyB9ID0gY29sdW1uXHJcbiAgICAgIGxldCB7IHByb3BzID0ge30gfSA9IHJlbmRlck9wdHNcclxuICAgICAgbGV0IGNlbGxWYWx1ZSA9IFhFVXRpbHMuZ2V0KHJvdywgcHJvcGVydHkpXHJcbiAgICAgIGlmIChwcm9wcy5tdWx0aXBsZSkge1xyXG4gICAgICAgIGlmIChYRVV0aWxzLmlzQXJyYXkoY2VsbFZhbHVlKSkge1xyXG4gICAgICAgICAgcmV0dXJuIFhFVXRpbHMuaW5jbHVkZUFycmF5cyhjZWxsVmFsdWUsIGRhdGEpXHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBkYXRhLmluZGV4T2YoY2VsbFZhbHVlKSA+IC0xXHJcbiAgICAgIH1cclxuICAgICAgLyogZXNsaW50LWRpc2FibGUgZXFlcWVxICovXHJcbiAgICAgIHJldHVybiBjZWxsVmFsdWUgPT0gZGF0YVxyXG4gICAgfSxcclxuICAgIHJlbmRlckl0ZW0gKGg6IEZ1bmN0aW9uLCByZW5kZXJPcHRzOiBhbnksIHBhcmFtczogYW55LCBjb250ZXh0OiBhbnkpIHtcclxuICAgICAgbGV0IHsgb3B0aW9ucywgb3B0aW9uR3JvdXBzLCBvcHRpb25Qcm9wcyA9IHt9LCBvcHRpb25Hcm91cFByb3BzID0ge30gfSA9IHJlbmRlck9wdHNcclxuICAgICAgbGV0IHsgZGF0YSwgcHJvcGVydHkgfSA9IHBhcmFtc1xyXG4gICAgICBsZXQgeyBhdHRycyB9ID0gcmVuZGVyT3B0c1xyXG4gICAgICBsZXQgcHJvcHM6IGFueSA9IGdldEZvcm1Qcm9wcyhjb250ZXh0LCByZW5kZXJPcHRzKVxyXG4gICAgICBpZiAob3B0aW9uR3JvdXBzKSB7XHJcbiAgICAgICAgbGV0IGdyb3VwT3B0aW9uczogc3RyaW5nID0gb3B0aW9uR3JvdXBQcm9wcy5vcHRpb25zIHx8ICdvcHRpb25zJ1xyXG4gICAgICAgIGxldCBncm91cExhYmVsOiBzdHJpbmcgPSBvcHRpb25Hcm91cFByb3BzLmxhYmVsIHx8ICdsYWJlbCdcclxuICAgICAgICByZXR1cm4gW1xyXG4gICAgICAgICAgaCgnU2VsZWN0Jywge1xyXG4gICAgICAgICAgICBwcm9wcyxcclxuICAgICAgICAgICAgYXR0cnMsXHJcbiAgICAgICAgICAgIG1vZGVsOiB7XHJcbiAgICAgICAgICAgICAgdmFsdWU6IFhFVXRpbHMuZ2V0KGRhdGEsIHByb3BlcnR5KSxcclxuICAgICAgICAgICAgICBjYWxsYmFjayAoY2VsbFZhbHVlOiBhbnkpIHtcclxuICAgICAgICAgICAgICAgIFhFVXRpbHMuc2V0KGRhdGEsIHByb3BlcnR5LCBjZWxsVmFsdWUpXHJcbiAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICBvbjogZ2V0Rm9ybUV2ZW50cyhyZW5kZXJPcHRzLCBwYXJhbXMsIGNvbnRleHQpXHJcbiAgICAgICAgICB9LCBYRVV0aWxzLm1hcChvcHRpb25Hcm91cHMsIChncm91cDogYW55LCBnSW5kZXg6IG51bWJlcikgPT4ge1xyXG4gICAgICAgICAgICByZXR1cm4gaCgnT3B0aW9uR3JvdXAnLCB7XHJcbiAgICAgICAgICAgICAgcHJvcHM6IHtcclxuICAgICAgICAgICAgICAgIGxhYmVsOiBncm91cFtncm91cExhYmVsXVxyXG4gICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAga2V5OiBnSW5kZXhcclxuICAgICAgICAgICAgfSwgcmVuZGVyT3B0aW9ucyhoLCBncm91cFtncm91cE9wdGlvbnNdLCBvcHRpb25Qcm9wcykpXHJcbiAgICAgICAgICB9KSlcclxuICAgICAgICBdXHJcbiAgICAgIH1cclxuICAgICAgcmV0dXJuIFtcclxuICAgICAgICBoKCdTZWxlY3QnLCB7XHJcbiAgICAgICAgICBwcm9wcyxcclxuICAgICAgICAgIGF0dHJzLFxyXG4gICAgICAgICAgbW9kZWw6IHtcclxuICAgICAgICAgICAgdmFsdWU6IFhFVXRpbHMuZ2V0KGRhdGEsIHByb3BlcnR5KSxcclxuICAgICAgICAgICAgY2FsbGJhY2sgKGNlbGxWYWx1ZTogYW55KSB7XHJcbiAgICAgICAgICAgICAgWEVVdGlscy5zZXQoZGF0YSwgcHJvcGVydHksIGNlbGxWYWx1ZSlcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgfSxcclxuICAgICAgICAgIG9uOiBnZXRGb3JtRXZlbnRzKHJlbmRlck9wdHMsIHBhcmFtcywgY29udGV4dClcclxuICAgICAgICB9LCByZW5kZXJPcHRpb25zKGgsIG9wdGlvbnMsIG9wdGlvblByb3BzKSlcclxuICAgICAgXVxyXG4gICAgfSxcclxuICAgIGNlbGxFeHBvcnRNZXRob2Q6IGNyZWF0ZUV4cG9ydE1ldGhvZChnZXRTZWxlY3RDZWxsVmFsdWUpLFxyXG4gICAgZWRpdENlbGxFeHBvcnRNZXRob2Q6IGNyZWF0ZUV4cG9ydE1ldGhvZChnZXRTZWxlY3RDZWxsVmFsdWUsIHRydWUpXHJcbiAgfSxcclxuICBDYXNjYWRlcjoge1xyXG4gICAgcmVuZGVyRWRpdDogY3JlYXRlRWRpdFJlbmRlcih7IHRyYW5zZmVyOiB0cnVlIH0pLFxyXG4gICAgcmVuZGVyQ2VsbCAoaDogRnVuY3Rpb24sIHJlbmRlck9wdHM6IGFueSwgcGFyYW1zOiBhbnkpIHtcclxuICAgICAgcmV0dXJuIGNlbGxUZXh0KGgsIGdldENhc2NhZGVyQ2VsbFZhbHVlKHJlbmRlck9wdHMsIHBhcmFtcykpXHJcbiAgICB9LFxyXG4gICAgcmVuZGVySXRlbTogY3JlYXRlRm9ybUl0ZW1SZW5kZXIoKSxcclxuICAgIGNlbGxFeHBvcnRNZXRob2Q6IGNyZWF0ZUV4cG9ydE1ldGhvZChnZXRDYXNjYWRlckNlbGxWYWx1ZSksXHJcbiAgICBlZGl0Q2VsbEV4cG9ydE1ldGhvZDogY3JlYXRlRXhwb3J0TWV0aG9kKGdldENhc2NhZGVyQ2VsbFZhbHVlLCB0cnVlKVxyXG4gIH0sXHJcbiAgRGF0ZVBpY2tlcjoge1xyXG4gICAgcmVuZGVyRWRpdDogY3JlYXRlRWRpdFJlbmRlcih7IHRyYW5zZmVyOiB0cnVlIH0pLFxyXG4gICAgcmVuZGVyQ2VsbCAoaDogRnVuY3Rpb24sIHJlbmRlck9wdHM6IGFueSwgcGFyYW1zOiBhbnkpIHtcclxuICAgICAgcmV0dXJuIGNlbGxUZXh0KGgsIGdldERhdGVQaWNrZXJDZWxsVmFsdWUocmVuZGVyT3B0cywgcGFyYW1zKSlcclxuICAgIH0sXHJcbiAgICByZW5kZXJGaWx0ZXIgKGg6IEZ1bmN0aW9uLCByZW5kZXJPcHRzOiBhbnksIHBhcmFtczogYW55LCBjb250ZXh0OiBhbnkpIHtcclxuICAgICAgbGV0IHsgY29sdW1uIH0gPSBwYXJhbXNcclxuICAgICAgbGV0IHsgYXR0cnMsIGV2ZW50cyB9ID0gcmVuZGVyT3B0c1xyXG4gICAgICBsZXQgcHJvcHMgPSBnZXRQcm9wcyhwYXJhbXMsIHJlbmRlck9wdHMsIHsgdHJhbnNmZXI6IHRydWUgfSlcclxuICAgICAgbGV0IHR5cGUgPSAnb24tY2hhbmdlJ1xyXG4gICAgICByZXR1cm4gY29sdW1uLmZpbHRlcnMubWFwKChpdGVtOiBhbnkpID0+IHtcclxuICAgICAgICByZXR1cm4gaChyZW5kZXJPcHRzLm5hbWUsIHtcclxuICAgICAgICAgIHByb3BzLFxyXG4gICAgICAgICAgYXR0cnMsXHJcbiAgICAgICAgICBtb2RlbDoge1xyXG4gICAgICAgICAgICB2YWx1ZTogaXRlbS5kYXRhLFxyXG4gICAgICAgICAgICBjYWxsYmFjayAob3B0aW9uVmFsdWU6IGFueSkge1xyXG4gICAgICAgICAgICAgIGl0ZW0uZGF0YSA9IG9wdGlvblZhbHVlXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgIH0sXHJcbiAgICAgICAgICBvbjogZ2V0RmlsdGVyRXZlbnRzKHtcclxuICAgICAgICAgICAgW3R5cGVdICh2YWx1ZTogYW55KSB7XHJcbiAgICAgICAgICAgICAgaGFuZGxlQ29uZmlybUZpbHRlcihjb250ZXh0LCBjb2x1bW4sICEhdmFsdWUsIGl0ZW0pXHJcbiAgICAgICAgICAgICAgaWYgKGV2ZW50cyAmJiBldmVudHNbdHlwZV0pIHtcclxuICAgICAgICAgICAgICAgIGV2ZW50c1t0eXBlXShPYmplY3QuYXNzaWduKHsgY29udGV4dCB9LCBwYXJhbXMpLCB2YWx1ZSlcclxuICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgIH0sIHJlbmRlck9wdHMsIHBhcmFtcywgY29udGV4dClcclxuICAgICAgICB9KVxyXG4gICAgICB9KVxyXG4gICAgfSxcclxuICAgIGZpbHRlck1ldGhvZCAoeyBvcHRpb24sIHJvdywgY29sdW1uIH06IGFueSkge1xyXG4gICAgICBsZXQgeyBkYXRhIH0gPSBvcHRpb25cclxuICAgICAgbGV0IHsgZmlsdGVyUmVuZGVyOiByZW5kZXJPcHRzIH0gPSBjb2x1bW5cclxuICAgICAgbGV0IHsgcHJvcHMgPSB7fSB9ID0gcmVuZGVyT3B0c1xyXG4gICAgICBsZXQgY2VsbFZhbHVlID0gWEVVdGlscy5nZXQocm93LCBjb2x1bW4ucHJvcGVydHkpXHJcbiAgICAgIGlmIChkYXRhKSB7XHJcbiAgICAgICAgc3dpdGNoIChwcm9wcy50eXBlKSB7XHJcbiAgICAgICAgICBjYXNlICdkYXRlcmFuZ2UnOlxyXG4gICAgICAgICAgICByZXR1cm4gZXF1YWxEYXRlcmFuZ2UoY2VsbFZhbHVlLCBkYXRhLCBwcm9wcywgJ3l5eXktTU0tZGQnKVxyXG4gICAgICAgICAgY2FzZSAnZGF0ZXRpbWVyYW5nZSc6XHJcbiAgICAgICAgICAgIHJldHVybiBlcXVhbERhdGVyYW5nZShjZWxsVmFsdWUsIGRhdGEsIHByb3BzLCAneXl5eS1NTS1kZCBISDpzczptbScpXHJcbiAgICAgICAgICBkZWZhdWx0OlxyXG4gICAgICAgICAgICByZXR1cm4gY2VsbFZhbHVlID09PSBkYXRhXHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICAgIHJldHVybiBmYWxzZVxyXG4gICAgfSxcclxuICAgIHJlbmRlckl0ZW06IGNyZWF0ZUZvcm1JdGVtUmVuZGVyKCksXHJcbiAgICBjZWxsRXhwb3J0TWV0aG9kOiBjcmVhdGVFeHBvcnRNZXRob2QoZ2V0RGF0ZVBpY2tlckNlbGxWYWx1ZSksXHJcbiAgICBlZGl0Q2VsbEV4cG9ydE1ldGhvZDogY3JlYXRlRXhwb3J0TWV0aG9kKGdldERhdGVQaWNrZXJDZWxsVmFsdWUsIHRydWUpXHJcbiAgfSxcclxuICBUaW1lUGlja2VyOiB7XHJcbiAgICByZW5kZXJFZGl0OiBjcmVhdGVFZGl0UmVuZGVyKHsgdHJhbnNmZXI6IHRydWUgfSksXHJcbiAgICByZW5kZXJJdGVtOiBjcmVhdGVGb3JtSXRlbVJlbmRlcigpXHJcbiAgfSxcclxuICBSYXRlOiB7XHJcbiAgICByZW5kZXJEZWZhdWx0OiBjcmVhdGVFZGl0UmVuZGVyKCksXHJcbiAgICByZW5kZXJFZGl0OiBjcmVhdGVFZGl0UmVuZGVyKCksXHJcbiAgICByZW5kZXJGaWx0ZXI6IGNyZWF0ZUZpbHRlclJlbmRlcigpLFxyXG4gICAgZmlsdGVyTWV0aG9kOiBkZWZhdWx0RmlsdGVyTWV0aG9kLFxyXG4gICAgcmVuZGVySXRlbTogY3JlYXRlRm9ybUl0ZW1SZW5kZXIoKVxyXG4gIH0sXHJcbiAgaVN3aXRjaDoge1xyXG4gICAgcmVuZGVyRGVmYXVsdDogY3JlYXRlRWRpdFJlbmRlcigpLFxyXG4gICAgcmVuZGVyRWRpdDogY3JlYXRlRWRpdFJlbmRlcigpLFxyXG4gICAgcmVuZGVyRmlsdGVyOiBjcmVhdGVGaWx0ZXJSZW5kZXIoKSxcclxuICAgIGZpbHRlck1ldGhvZDogZGVmYXVsdEZpbHRlck1ldGhvZCxcclxuICAgIHJlbmRlckl0ZW06IGNyZWF0ZUZvcm1JdGVtUmVuZGVyKClcclxuICB9LFxyXG4gIFJhZGlvOiB7XHJcbiAgICByZW5kZXJJdGVtOiBjcmVhdGVGb3JtSXRlbVJhZGlvQW5kQ2hlY2tib3hSZW5kZXIoKVxyXG4gIH0sXHJcbiAgQ2hlY2tib3g6IHtcclxuICAgIHJlbmRlckl0ZW06IGNyZWF0ZUZvcm1JdGVtUmFkaW9BbmRDaGVja2JveFJlbmRlcigpXHJcbiAgfVxyXG59XHJcblxyXG4vKipcclxuICog5LqL5Lu25YW85a655oCn5aSE55CGXHJcbiAqL1xyXG5mdW5jdGlvbiBoYW5kbGVDbGVhckV2ZW50IChwYXJhbXM6IGFueSwgZXZudDogYW55LCBjb250ZXh0OiBhbnkpIHtcclxuICBsZXQgeyBnZXRFdmVudFRhcmdldE5vZGUgfSA9IGNvbnRleHRcclxuICBsZXQgYm9keUVsZW0gPSBkb2N1bWVudC5ib2R5XHJcbiAgaWYgKFxyXG4gICAgLy8g5LiL5ouJ5qGG44CB5pel5pyfXHJcbiAgICBnZXRFdmVudFRhcmdldE5vZGUoZXZudCwgYm9keUVsZW0sICdpdnUtc2VsZWN0LWRyb3Bkb3duJykuZmxhZ1xyXG4gICkge1xyXG4gICAgcmV0dXJuIGZhbHNlXHJcbiAgfVxyXG59XHJcblxyXG4vKipcclxuICog5Z+65LqOIHZ4ZS10YWJsZSDooajmoLznmoTpgILphY3mj5Lku7bvvIznlKjkuo7lhbzlrrkgaXZpZXcg57uE5Lu25bqTXHJcbiAqL1xyXG5leHBvcnQgY29uc3QgVlhFVGFibGVQbHVnaW5JVmlldyA9IHtcclxuICBpbnN0YWxsICh4dGFibGU6IHR5cGVvZiBWWEVUYWJsZSkge1xyXG4gICAgbGV0IHsgaW50ZXJjZXB0b3IsIHJlbmRlcmVyIH0gPSB4dGFibGVcclxuICAgIHJlbmRlcmVyLm1peGluKHJlbmRlck1hcClcclxuICAgIGludGVyY2VwdG9yLmFkZCgnZXZlbnQuY2xlYXJGaWx0ZXInLCBoYW5kbGVDbGVhckV2ZW50KVxyXG4gICAgaW50ZXJjZXB0b3IuYWRkKCdldmVudC5jbGVhckFjdGl2ZWQnLCBoYW5kbGVDbGVhckV2ZW50KVxyXG4gIH1cclxufVxyXG5cclxuaWYgKHR5cGVvZiB3aW5kb3cgIT09ICd1bmRlZmluZWQnICYmIHdpbmRvdy5WWEVUYWJsZSkge1xyXG4gIHdpbmRvdy5WWEVUYWJsZS51c2UoVlhFVGFibGVQbHVnaW5JVmlldylcclxufVxyXG5cclxuZXhwb3J0IGRlZmF1bHQgVlhFVGFibGVQbHVnaW5JVmlld1xyXG4iXX0=
