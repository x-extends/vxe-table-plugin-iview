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

function getFilterEvents(on, renderOpts, params) {
  var events = renderOpts.events;

  if (events) {
    return _xeUtils["default"].assign({}, _xeUtils["default"].objectMap(events, function (cb) {
      return function () {
        for (var _len2 = arguments.length, args = new Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
          args[_key2] = arguments[_key2];
        }

        cb.apply(null, [params].concat(args));
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
          handleConfirmFilter(params, column, !!item.data, item);

          if (events && events[type]) {
            events[type](params, evnt);
          }
        }), renderOpts, params)
      });
    });
  };
}

function handleConfirmFilter(params, column, checked, item) {
  var $panel = params.$panel || params.context;
  $panel[column.filterMultiple ? 'changeMultipleOption' : 'changeRadioOption']({}, checked, item);
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
    var props = getFormProps(params, renderOpts, defaultProps);
    return [h(name, {
      attrs: attrs,
      props: props,
      model: {
        value: _xeUtils["default"].get(data, property),
        callback: function callback(value) {
          _xeUtils["default"].set(data, property, value);
        }
      },
      on: getFormEvents(renderOpts, params)
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

function getFormEvents(renderOpts, params) {
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
    var props = getFormProps(params, renderOpts);
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
      on: getFormEvents(renderOpts, params)
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
              handleConfirmFilter(params, column, value && value.length > 0, item);

              if (events && events[type]) {
                events[type](params, value);
              }
            }), renderOpts, params)
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
            handleConfirmFilter(params, column, value && value.length > 0, item);

            if (events && events[type]) {
              events[type](params, value);
            }
          }), renderOpts, params)
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
      var props = getFormProps(params, renderOpts);

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
          on: getFormEvents(renderOpts, params)
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
        on: getFormEvents(renderOpts, params)
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
            handleConfirmFilter(params, column, !!value, item);

            if (events && events[type]) {
              events[type](params, value);
            }
          }), renderOpts, params)
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
  var $table = params.$table;
  var getEventTargetNode = $table ? $table.getEventTargetNode : context.getEventTargetNode;
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
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImluZGV4LnRzIl0sIm5hbWVzIjpbImlzRW1wdHlWYWx1ZSIsImNlbGxWYWx1ZSIsInVuZGVmaW5lZCIsImdldEZvcm1hdERhdGUiLCJ2YWx1ZSIsInByb3BzIiwiZGVmYXVsdEZvcm1hdCIsIlhFVXRpbHMiLCJ0b0RhdGVTdHJpbmciLCJmb3JtYXQiLCJnZXRGb3JtYXREYXRlcyIsInZhbHVlcyIsInNlcGFyYXRvciIsIm1hcCIsImRhdGUiLCJqb2luIiwiZXF1YWxEYXRlcmFuZ2UiLCJkYXRhIiwibWF0Y2hDYXNjYWRlckRhdGEiLCJpbmRleCIsImxpc3QiLCJsYWJlbHMiLCJ2YWwiLCJsZW5ndGgiLCJlYWNoIiwiaXRlbSIsInB1c2giLCJsYWJlbCIsImNoaWxkcmVuIiwiZ2V0UHJvcHMiLCJkZWZhdWx0UHJvcHMiLCIkdGFibGUiLCJhc3NpZ24iLCJ2U2l6ZSIsInNpemUiLCJnZXRDZWxsRXZlbnRzIiwicmVuZGVyT3B0cyIsInBhcmFtcyIsImV2ZW50cyIsInR5cGUiLCJvbiIsImV2bnQiLCJ1cGRhdGVTdGF0dXMiLCJvYmplY3RNYXAiLCJjYiIsImFyZ3MiLCJhcHBseSIsImNvbmNhdCIsImdldFNlbGVjdENlbGxWYWx1ZSIsIm9wdGlvbnMiLCJvcHRpb25Hcm91cHMiLCJvcHRpb25Qcm9wcyIsIm9wdGlvbkdyb3VwUHJvcHMiLCJyb3ciLCJjb2x1bW4iLCJsYWJlbFByb3AiLCJ2YWx1ZVByb3AiLCJncm91cE9wdGlvbnMiLCJnZXQiLCJwcm9wZXJ0eSIsImNvbGlkIiwiaWQiLCJyZXN0IiwiY2VsbERhdGEiLCJmaWx0ZXJhYmxlIiwiZnVsbEFsbERhdGFSb3dNYXAiLCJjYWNoZUNlbGwiLCJoYXMiLCJtdWx0aXBsZSIsInNlbGVjdEl0ZW0iLCJmaW5kIiwiY2VsbExhYmVsIiwiZ2V0Q2FzY2FkZXJDZWxsVmFsdWUiLCJnZXREYXRlUGlja2VyQ2VsbFZhbHVlIiwiY3JlYXRlRWRpdFJlbmRlciIsImgiLCJhdHRycyIsIm5hbWUiLCJtb2RlbCIsImNhbGxiYWNrIiwic2V0IiwiZ2V0RmlsdGVyRXZlbnRzIiwiY3JlYXRlRmlsdGVyUmVuZGVyIiwiY29udGV4dCIsImZpbHRlcnMiLCJvcHRpb25WYWx1ZSIsImhhbmRsZUNvbmZpcm1GaWx0ZXIiLCJjaGVja2VkIiwiJHBhbmVsIiwiZmlsdGVyTXVsdGlwbGUiLCJkZWZhdWx0RmlsdGVyTWV0aG9kIiwib3B0aW9uIiwicmVuZGVyT3B0aW9ucyIsImRpc2FibGVkUHJvcCIsImRpc2FibGVkIiwia2V5IiwiY2VsbFRleHQiLCJjcmVhdGVGb3JtSXRlbVJlbmRlciIsImdldEZvcm1Qcm9wcyIsImdldEZvcm1FdmVudHMiLCIkZm9ybSIsImNyZWF0ZUV4cG9ydE1ldGhvZCIsInZhbHVlTWV0aG9kIiwiaXNFZGl0IiwicmVuZGVyUHJvcGVydHkiLCJjcmVhdGVGb3JtSXRlbVJhZGlvQW5kQ2hlY2tib3hSZW5kZXIiLCJyZW5kZXJNYXAiLCJJbnB1dCIsImF1dG9mb2N1cyIsInJlbmRlckRlZmF1bHQiLCJyZW5kZXJFZGl0IiwicmVuZGVyRmlsdGVyIiwiZmlsdGVyTWV0aG9kIiwicmVuZGVySXRlbSIsIkF1dG9Db21wbGV0ZSIsIklucHV0TnVtYmVyIiwiU2VsZWN0IiwidHJhbnNmZXIiLCJncm91cExhYmVsIiwiZ3JvdXAiLCJnSW5kZXgiLCJyZW5kZXJDZWxsIiwiZmlsdGVyUmVuZGVyIiwiaXNBcnJheSIsImluY2x1ZGVBcnJheXMiLCJpbmRleE9mIiwiY2VsbEV4cG9ydE1ldGhvZCIsImVkaXRDZWxsRXhwb3J0TWV0aG9kIiwiQ2FzY2FkZXIiLCJEYXRlUGlja2VyIiwiVGltZVBpY2tlciIsIlJhdGUiLCJpU3dpdGNoIiwiUmFkaW8iLCJDaGVja2JveCIsImhhbmRsZUNsZWFyRXZlbnQiLCJnZXRFdmVudFRhcmdldE5vZGUiLCJib2R5RWxlbSIsImRvY3VtZW50IiwiYm9keSIsImZsYWciLCJWWEVUYWJsZVBsdWdpbklWaWV3IiwiaW5zdGFsbCIsInh0YWJsZSIsImludGVyY2VwdG9yIiwicmVuZGVyZXIi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QUY1RCxFQUdFO0FBQ0EsV0FBTyxLQUFQO0FBQ0Q7QUFDRjtBQUVEOzs7OztBQUdPLElBQU1DLG1CQUFtQixHQUFHO0FBQ2pDQyxFQUFBQSxPQURpQyxtQkFDeEJDLE1BRHdCLEVBQ0Q7QUFBQSxRQUN4QkMsV0FEd0IsR0FDRUQsTUFERixDQUN4QkMsV0FEd0I7QUFBQSxRQUNYQyxRQURXLEdBQ0VGLE1BREYsQ0FDWEUsUUFEVztBQUU5QkEsSUFBQUEsUUFBUSxDQUFDQyxLQUFULENBQWV4QyxTQUFmO0FBQ0FzQyxJQUFBQSxXQUFXLENBQUNHLEdBQVosQ0FBZ0IsbUJBQWhCLEVBQXFDWixnQkFBckM7QUFDQVMsSUFBQUEsV0FBVyxDQUFDRyxHQUFaLENBQWdCLG9CQUFoQixFQUFzQ1osZ0JBQXRDO0FBQ0Q7QUFOZ0MsQ0FBNUI7OztBQVNQLElBQUksT0FBT2EsTUFBUCxLQUFrQixXQUFsQixJQUFpQ0EsTUFBTSxDQUFDQyxRQUE1QyxFQUFzRDtBQUNwREQsRUFBQUEsTUFBTSxDQUFDQyxRQUFQLENBQWdCQyxHQUFoQixDQUFvQlQsbUJBQXBCO0FBQ0Q7O2VBRWNBLG1CIiwiZmlsZSI6ImluZGV4LmNvbW1vbi5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBYRVV0aWxzIGZyb20gJ3hlLXV0aWxzL21ldGhvZHMveGUtdXRpbHMnXHJcbmltcG9ydCBWWEVUYWJsZSBmcm9tICd2eGUtdGFibGUvbGliL3Z4ZS10YWJsZSdcclxuXHJcbmZ1bmN0aW9uIGlzRW1wdHlWYWx1ZSAoY2VsbFZhbHVlOiBhbnkpIHtcclxuICByZXR1cm4gY2VsbFZhbHVlID09PSBudWxsIHx8IGNlbGxWYWx1ZSA9PT0gdW5kZWZpbmVkIHx8IGNlbGxWYWx1ZSA9PT0gJydcclxufVxyXG5cclxuZnVuY3Rpb24gZ2V0Rm9ybWF0RGF0ZSAodmFsdWU6IGFueSwgcHJvcHM6IGFueSwgZGVmYXVsdEZvcm1hdDogc3RyaW5nKSB7XHJcbiAgcmV0dXJuIFhFVXRpbHMudG9EYXRlU3RyaW5nKHZhbHVlLCBwcm9wcy5mb3JtYXQgfHwgZGVmYXVsdEZvcm1hdClcclxufVxyXG5cclxuZnVuY3Rpb24gZ2V0Rm9ybWF0RGF0ZXMgKHZhbHVlczogYW55LCBwcm9wczogYW55LCBzZXBhcmF0b3I6IHN0cmluZywgZGVmYXVsdEZvcm1hdDogc3RyaW5nKSB7XHJcbiAgcmV0dXJuIFhFVXRpbHMubWFwKHZhbHVlcywgKGRhdGU6IGFueSkgPT4gZ2V0Rm9ybWF0RGF0ZShkYXRlLCBwcm9wcywgZGVmYXVsdEZvcm1hdCkpLmpvaW4oc2VwYXJhdG9yKVxyXG59XHJcblxyXG5mdW5jdGlvbiBlcXVhbERhdGVyYW5nZSAoY2VsbFZhbHVlOiBhbnksIGRhdGE6IGFueSwgcHJvcHM6IGFueSwgZGVmYXVsdEZvcm1hdDogc3RyaW5nKSB7XHJcbiAgY2VsbFZhbHVlID0gZ2V0Rm9ybWF0RGF0ZShjZWxsVmFsdWUsIHByb3BzLCBkZWZhdWx0Rm9ybWF0KVxyXG4gIHJldHVybiBjZWxsVmFsdWUgPj0gZ2V0Rm9ybWF0RGF0ZShkYXRhWzBdLCBwcm9wcywgZGVmYXVsdEZvcm1hdCkgJiYgY2VsbFZhbHVlIDw9IGdldEZvcm1hdERhdGUoZGF0YVsxXSwgcHJvcHMsIGRlZmF1bHRGb3JtYXQpXHJcbn1cclxuXHJcbmZ1bmN0aW9uIG1hdGNoQ2FzY2FkZXJEYXRhIChpbmRleDogbnVtYmVyLCBsaXN0OiBBcnJheTxhbnk+LCB2YWx1ZXM6IEFycmF5PGFueT4sIGxhYmVsczogQXJyYXk8YW55Pikge1xyXG4gIGxldCB2YWwgPSB2YWx1ZXNbaW5kZXhdXHJcbiAgaWYgKGxpc3QgJiYgdmFsdWVzLmxlbmd0aCA+IGluZGV4KSB7XHJcbiAgICBYRVV0aWxzLmVhY2gobGlzdCwgKGl0ZW06IGFueSkgPT4ge1xyXG4gICAgICBpZiAoaXRlbS52YWx1ZSA9PT0gdmFsKSB7XHJcbiAgICAgICAgbGFiZWxzLnB1c2goaXRlbS5sYWJlbClcclxuICAgICAgICBtYXRjaENhc2NhZGVyRGF0YSgrK2luZGV4LCBpdGVtLmNoaWxkcmVuLCB2YWx1ZXMsIGxhYmVscylcclxuICAgICAgfVxyXG4gICAgfSlcclxuICB9XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGdldFByb3BzICh7ICR0YWJsZSB9OiBhbnksIHsgcHJvcHMgfTogYW55LCBkZWZhdWx0UHJvcHM/OiBhbnkpIHtcclxuICByZXR1cm4gWEVVdGlscy5hc3NpZ24oJHRhYmxlLnZTaXplID8geyBzaXplOiAkdGFibGUudlNpemUgfSA6IHt9LCBkZWZhdWx0UHJvcHMsIHByb3BzKVxyXG59XHJcblxyXG5mdW5jdGlvbiBnZXRDZWxsRXZlbnRzIChyZW5kZXJPcHRzOiBhbnksIHBhcmFtczogYW55KSB7XHJcbiAgbGV0IHsgZXZlbnRzIH0gPSByZW5kZXJPcHRzXHJcbiAgbGV0IHsgJHRhYmxlIH0gPSBwYXJhbXNcclxuICBsZXQgdHlwZSA9ICdvbi1jaGFuZ2UnXHJcbiAgbGV0IG9uID0ge1xyXG4gICAgW3R5cGVdOiAoZXZudDogYW55KSA9PiB7XHJcbiAgICAgICR0YWJsZS51cGRhdGVTdGF0dXMocGFyYW1zKVxyXG4gICAgICBpZiAoZXZlbnRzICYmIGV2ZW50c1t0eXBlXSkge1xyXG4gICAgICAgIGV2ZW50c1t0eXBlXShwYXJhbXMsIGV2bnQpXHJcbiAgICAgIH1cclxuICAgIH1cclxuICB9XHJcbiAgaWYgKGV2ZW50cykge1xyXG4gICAgcmV0dXJuIFhFVXRpbHMuYXNzaWduKHt9LCBYRVV0aWxzLm9iamVjdE1hcChldmVudHMsIChjYjogRnVuY3Rpb24pID0+IGZ1bmN0aW9uICguLi5hcmdzOiBhbnlbXSkge1xyXG4gICAgICBjYi5hcHBseShudWxsLCBbcGFyYW1zXS5jb25jYXQuYXBwbHkocGFyYW1zLCBhcmdzKSlcclxuICAgIH0pLCBvbilcclxuICB9XHJcbiAgcmV0dXJuIG9uXHJcbn1cclxuXHJcbmZ1bmN0aW9uIGdldFNlbGVjdENlbGxWYWx1ZSAocmVuZGVyT3B0czogYW55LCBwYXJhbXM6IGFueSkge1xyXG4gIGxldCB7IG9wdGlvbnMsIG9wdGlvbkdyb3VwcywgcHJvcHMgPSB7fSwgb3B0aW9uUHJvcHMgPSB7fSwgb3B0aW9uR3JvdXBQcm9wcyA9IHt9IH0gPSByZW5kZXJPcHRzXHJcbiAgbGV0IHsgJHRhYmxlLCByb3csIGNvbHVtbiB9ID0gcGFyYW1zXHJcbiAgbGV0IGxhYmVsUHJvcCA9IG9wdGlvblByb3BzLmxhYmVsIHx8ICdsYWJlbCdcclxuICBsZXQgdmFsdWVQcm9wID0gb3B0aW9uUHJvcHMudmFsdWUgfHwgJ3ZhbHVlJ1xyXG4gIGxldCBncm91cE9wdGlvbnMgPSBvcHRpb25Hcm91cFByb3BzLm9wdGlvbnMgfHwgJ29wdGlvbnMnXHJcbiAgbGV0IGNlbGxWYWx1ZSA9IFhFVXRpbHMuZ2V0KHJvdywgY29sdW1uLnByb3BlcnR5KVxyXG4gIGxldCBjb2xpZDogc3RyaW5nID0gY29sdW1uLmlkXHJcbiAgbGV0IHJlc3Q6IGFueVxyXG4gIGxldCBjZWxsRGF0YTogYW55XHJcbiAgaWYgKHByb3BzLmZpbHRlcmFibGUpIHtcclxuICAgIGxldCBmdWxsQWxsRGF0YVJvd01hcDogTWFwPGFueSwgYW55PiA9ICR0YWJsZS5mdWxsQWxsRGF0YVJvd01hcFxyXG4gICAgbGV0IGNhY2hlQ2VsbDogYW55ID0gZnVsbEFsbERhdGFSb3dNYXAuaGFzKHJvdylcclxuICAgIGlmIChjYWNoZUNlbGwpIHtcclxuICAgICAgcmVzdCA9IGZ1bGxBbGxEYXRhUm93TWFwLmdldChyb3cpXHJcbiAgICAgIGNlbGxEYXRhID0gcmVzdC5jZWxsRGF0YVxyXG4gICAgICBpZiAoIWNlbGxEYXRhKSB7XHJcbiAgICAgICAgY2VsbERhdGEgPSBmdWxsQWxsRGF0YVJvd01hcC5nZXQocm93KS5jZWxsRGF0YSA9IHt9XHJcbiAgICAgIH1cclxuICAgIH1cclxuICAgIGlmIChyZXN0ICYmIGNlbGxEYXRhW2NvbGlkXSAmJiBjZWxsRGF0YVtjb2xpZF0udmFsdWUgPT09IGNlbGxWYWx1ZSkge1xyXG4gICAgICByZXR1cm4gY2VsbERhdGFbY29saWRdLmxhYmVsXHJcbiAgICB9XHJcbiAgfVxyXG4gIGlmICghaXNFbXB0eVZhbHVlKGNlbGxWYWx1ZSkpIHtcclxuICAgIHJldHVybiBYRVV0aWxzLm1hcChwcm9wcy5tdWx0aXBsZSA/IGNlbGxWYWx1ZSA6IFtjZWxsVmFsdWVdLCBvcHRpb25Hcm91cHMgPyAodmFsdWU6IGFueSkgPT4ge1xyXG4gICAgICBsZXQgc2VsZWN0SXRlbVxyXG4gICAgICBmb3IgKGxldCBpbmRleCA9IDA7IGluZGV4IDwgb3B0aW9uR3JvdXBzLmxlbmd0aDsgaW5kZXgrKykge1xyXG4gICAgICAgIHNlbGVjdEl0ZW0gPSBYRVV0aWxzLmZpbmQob3B0aW9uR3JvdXBzW2luZGV4XVtncm91cE9wdGlvbnNdLCAoaXRlbTogYW55KSA9PiBpdGVtW3ZhbHVlUHJvcF0gPT09IHZhbHVlKVxyXG4gICAgICAgIGlmIChzZWxlY3RJdGVtKSB7XHJcbiAgICAgICAgICBicmVha1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgICBsZXQgY2VsbExhYmVsOiBhbnkgPSBzZWxlY3RJdGVtID8gc2VsZWN0SXRlbVtsYWJlbFByb3BdIDogdmFsdWVcclxuICAgICAgaWYgKGNlbGxEYXRhICYmIG9wdGlvbnMgJiYgb3B0aW9ucy5sZW5ndGgpIHtcclxuICAgICAgICBjZWxsRGF0YVtjb2xpZF0gPSB7IHZhbHVlOiBjZWxsVmFsdWUsIGxhYmVsOiBjZWxsTGFiZWwgfVxyXG4gICAgICB9XHJcbiAgICAgIHJldHVybiBjZWxsTGFiZWxcclxuICAgIH0gOiAodmFsdWU6IGFueSkgPT4ge1xyXG4gICAgICBsZXQgc2VsZWN0SXRlbSA9IFhFVXRpbHMuZmluZChvcHRpb25zLCAoaXRlbTogYW55KSA9PiBpdGVtW3ZhbHVlUHJvcF0gPT09IHZhbHVlKVxyXG4gICAgICBsZXQgY2VsbExhYmVsOiBhbnkgPSBzZWxlY3RJdGVtID8gc2VsZWN0SXRlbVtsYWJlbFByb3BdIDogdmFsdWVcclxuICAgICAgaWYgKGNlbGxEYXRhICYmIG9wdGlvbnMgJiYgb3B0aW9ucy5sZW5ndGgpIHtcclxuICAgICAgICBjZWxsRGF0YVtjb2xpZF0gPSB7IHZhbHVlOiBjZWxsVmFsdWUsIGxhYmVsOiBjZWxsTGFiZWwgfVxyXG4gICAgICB9XHJcbiAgICAgIHJldHVybiBjZWxsTGFiZWxcclxuICAgIH0pLmpvaW4oJzsnKVxyXG4gIH1cclxuICByZXR1cm4gbnVsbFxyXG59XHJcblxyXG5mdW5jdGlvbiBnZXRDYXNjYWRlckNlbGxWYWx1ZSAocmVuZGVyT3B0czogYW55LCBwYXJhbXM6IGFueSkge1xyXG4gIGxldCB7IHByb3BzID0ge30gfSA9IHJlbmRlck9wdHNcclxuICBsZXQgeyByb3csIGNvbHVtbiB9ID0gcGFyYW1zXHJcbiAgbGV0IGNlbGxWYWx1ZSA9IFhFVXRpbHMuZ2V0KHJvdywgY29sdW1uLnByb3BlcnR5KVxyXG4gIGxldCB2YWx1ZXMgPSBjZWxsVmFsdWUgfHwgW11cclxuICBsZXQgbGFiZWxzOiBBcnJheTxhbnk+ID0gW11cclxuICBtYXRjaENhc2NhZGVyRGF0YSgwLCBwcm9wcy5kYXRhLCB2YWx1ZXMsIGxhYmVscylcclxuICByZXR1cm4gbGFiZWxzLmpvaW4oYCAke3Byb3BzLnNlcGFyYXRvciB8fCAnLyd9IGApXHJcbn1cclxuXHJcbmZ1bmN0aW9uIGdldERhdGVQaWNrZXJDZWxsVmFsdWUgKHJlbmRlck9wdHM6IGFueSwgcGFyYW1zOiBhbnkpIHtcclxuICBsZXQgeyBwcm9wcyA9IHt9IH0gPSByZW5kZXJPcHRzXHJcbiAgbGV0IHsgcm93LCBjb2x1bW4gfSA9IHBhcmFtc1xyXG4gIGxldCB7IHNlcGFyYXRvciB9ID0gcHJvcHNcclxuICBsZXQgY2VsbFZhbHVlID0gWEVVdGlscy5nZXQocm93LCBjb2x1bW4ucHJvcGVydHkpXHJcbiAgc3dpdGNoIChwcm9wcy50eXBlKSB7XHJcbiAgICBjYXNlICd3ZWVrJzpcclxuICAgICAgY2VsbFZhbHVlID0gZ2V0Rm9ybWF0RGF0ZShjZWxsVmFsdWUsIHByb3BzLCAneXl5eXdXVycpXHJcbiAgICAgIGJyZWFrXHJcbiAgICBjYXNlICdtb250aCc6XHJcbiAgICAgIGNlbGxWYWx1ZSA9IGdldEZvcm1hdERhdGUoY2VsbFZhbHVlLCBwcm9wcywgJ3l5eXktTU0nKVxyXG4gICAgICBicmVha1xyXG4gICAgY2FzZSAneWVhcic6XHJcbiAgICAgIGNlbGxWYWx1ZSA9IGdldEZvcm1hdERhdGUoY2VsbFZhbHVlLCBwcm9wcywgJ3l5eXknKVxyXG4gICAgICBicmVha1xyXG4gICAgY2FzZSAnZGF0ZXMnOlxyXG4gICAgICBjZWxsVmFsdWUgPSBnZXRGb3JtYXREYXRlcyhjZWxsVmFsdWUsIHByb3BzLCAnLCAnLCAneXl5eS1NTS1kZCcpXHJcbiAgICAgIGJyZWFrXHJcbiAgICBjYXNlICdkYXRlcmFuZ2UnOlxyXG4gICAgICBjZWxsVmFsdWUgPSBnZXRGb3JtYXREYXRlcyhjZWxsVmFsdWUsIHByb3BzLCBgICR7c2VwYXJhdG9yIHx8ICctJ30gYCwgJ3l5eXktTU0tZGQnKVxyXG4gICAgICBicmVha1xyXG4gICAgY2FzZSAnZGF0ZXRpbWVyYW5nZSc6XHJcbiAgICAgIGNlbGxWYWx1ZSA9IGdldEZvcm1hdERhdGVzKGNlbGxWYWx1ZSwgcHJvcHMsIGAgJHtzZXBhcmF0b3IgfHwgJy0nfSBgLCAneXl5eS1NTS1kZCBISDpzczptbScpXHJcbiAgICAgIGJyZWFrXHJcbiAgICBkZWZhdWx0OlxyXG4gICAgICBjZWxsVmFsdWUgPSBnZXRGb3JtYXREYXRlKGNlbGxWYWx1ZSwgcHJvcHMsICd5eXl5LU1NLWRkJylcclxuICAgICAgYnJlYWtcclxuICB9XHJcbiAgcmV0dXJuIGNlbGxWYWx1ZVxyXG59XHJcblxyXG5mdW5jdGlvbiBjcmVhdGVFZGl0UmVuZGVyIChkZWZhdWx0UHJvcHM/OiBhbnkpIHtcclxuICByZXR1cm4gZnVuY3Rpb24gKGg6IEZ1bmN0aW9uLCByZW5kZXJPcHRzOiBhbnksIHBhcmFtczogYW55KSB7XHJcbiAgICBsZXQgeyByb3csIGNvbHVtbiB9ID0gcGFyYW1zXHJcbiAgICBsZXQgeyBhdHRycyB9ID0gcmVuZGVyT3B0c1xyXG4gICAgbGV0IHByb3BzID0gZ2V0UHJvcHMocGFyYW1zLCByZW5kZXJPcHRzLCBkZWZhdWx0UHJvcHMpXHJcbiAgICByZXR1cm4gW1xyXG4gICAgICBoKHJlbmRlck9wdHMubmFtZSwge1xyXG4gICAgICAgIHByb3BzLFxyXG4gICAgICAgIGF0dHJzLFxyXG4gICAgICAgIG1vZGVsOiB7XHJcbiAgICAgICAgICB2YWx1ZTogWEVVdGlscy5nZXQocm93LCBjb2x1bW4ucHJvcGVydHkpLFxyXG4gICAgICAgICAgY2FsbGJhY2sgKHZhbHVlOiBhbnkpIHtcclxuICAgICAgICAgICAgWEVVdGlscy5zZXQocm93LCBjb2x1bW4ucHJvcGVydHksIHZhbHVlKVxyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgb246IGdldENlbGxFdmVudHMocmVuZGVyT3B0cywgcGFyYW1zKVxyXG4gICAgICB9KVxyXG4gICAgXVxyXG4gIH1cclxufVxyXG5cclxuZnVuY3Rpb24gZ2V0RmlsdGVyRXZlbnRzIChvbjogYW55LCByZW5kZXJPcHRzOiBhbnksIHBhcmFtczogYW55KSB7XHJcbiAgbGV0IHsgZXZlbnRzIH0gPSByZW5kZXJPcHRzXHJcbiAgaWYgKGV2ZW50cykge1xyXG4gICAgcmV0dXJuIFhFVXRpbHMuYXNzaWduKHt9LCBYRVV0aWxzLm9iamVjdE1hcChldmVudHMsIChjYjogRnVuY3Rpb24pID0+IGZ1bmN0aW9uICguLi5hcmdzOiBhbnlbXSkge1xyXG4gICAgICBjYi5hcHBseShudWxsLCBbcGFyYW1zXS5jb25jYXQoYXJncykpXHJcbiAgICB9KSwgb24pXHJcbiAgfVxyXG4gIHJldHVybiBvblxyXG59XHJcblxyXG5mdW5jdGlvbiBjcmVhdGVGaWx0ZXJSZW5kZXIgKGRlZmF1bHRQcm9wcz86IGFueSkge1xyXG4gIHJldHVybiBmdW5jdGlvbiAoaDogRnVuY3Rpb24sIHJlbmRlck9wdHM6IGFueSwgcGFyYW1zOiBhbnksIGNvbnRleHQ6IGFueSkge1xyXG4gICAgbGV0IHsgY29sdW1uIH0gPSBwYXJhbXNcclxuICAgIGxldCB7IG5hbWUsIGF0dHJzLCBldmVudHMgfSA9IHJlbmRlck9wdHNcclxuICAgIGxldCB0eXBlID0gJ29uLWNoYW5nZSdcclxuICAgIGxldCBwcm9wcyA9IGdldFByb3BzKHBhcmFtcywgcmVuZGVyT3B0cylcclxuICAgIHJldHVybiBjb2x1bW4uZmlsdGVycy5tYXAoKGl0ZW06IGFueSkgPT4ge1xyXG4gICAgICByZXR1cm4gaChuYW1lLCB7XHJcbiAgICAgICAgcHJvcHMsXHJcbiAgICAgICAgYXR0cnMsXHJcbiAgICAgICAgbW9kZWw6IHtcclxuICAgICAgICAgIHZhbHVlOiBpdGVtLmRhdGEsXHJcbiAgICAgICAgICBjYWxsYmFjayAob3B0aW9uVmFsdWU6IGFueSkge1xyXG4gICAgICAgICAgICBpdGVtLmRhdGEgPSBvcHRpb25WYWx1ZVxyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgb246IGdldEZpbHRlckV2ZW50cyh7XHJcbiAgICAgICAgICBbdHlwZV0gKGV2bnQ6IGFueSkge1xyXG4gICAgICAgICAgICBoYW5kbGVDb25maXJtRmlsdGVyKHBhcmFtcywgY29sdW1uLCAhIWl0ZW0uZGF0YSwgaXRlbSlcclxuICAgICAgICAgICAgaWYgKGV2ZW50cyAmJiBldmVudHNbdHlwZV0pIHtcclxuICAgICAgICAgICAgICBldmVudHNbdHlwZV0ocGFyYW1zLCBldm50KVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfSwgcmVuZGVyT3B0cywgcGFyYW1zKVxyXG4gICAgICB9KVxyXG4gICAgfSlcclxuICB9XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGhhbmRsZUNvbmZpcm1GaWx0ZXIgKHBhcmFtczogYW55LCBjb2x1bW46IGFueSwgY2hlY2tlZDogYW55LCBpdGVtOiBhbnkpIHtcclxuICBjb25zdCAkcGFuZWwgPSBwYXJhbXMuJHBhbmVsIHx8IHBhcmFtcy5jb250ZXh0XHJcbiAgJHBhbmVsW2NvbHVtbi5maWx0ZXJNdWx0aXBsZSA/ICdjaGFuZ2VNdWx0aXBsZU9wdGlvbicgOiAnY2hhbmdlUmFkaW9PcHRpb24nXSh7fSwgY2hlY2tlZCwgaXRlbSlcclxufVxyXG5cclxuZnVuY3Rpb24gZGVmYXVsdEZpbHRlck1ldGhvZCAoeyBvcHRpb24sIHJvdywgY29sdW1uIH06IGFueSkge1xyXG4gIGxldCB7IGRhdGEgfSA9IG9wdGlvblxyXG4gIGxldCBjZWxsVmFsdWUgPSBYRVV0aWxzLmdldChyb3csIGNvbHVtbi5wcm9wZXJ0eSlcclxuICAvKiBlc2xpbnQtZGlzYWJsZSBlcWVxZXEgKi9cclxuICByZXR1cm4gY2VsbFZhbHVlID09PSBkYXRhXHJcbn1cclxuXHJcbmZ1bmN0aW9uIHJlbmRlck9wdGlvbnMgKGg6IEZ1bmN0aW9uLCBvcHRpb25zOiBhbnksIG9wdGlvblByb3BzOiBhbnkpIHtcclxuICBsZXQgbGFiZWxQcm9wID0gb3B0aW9uUHJvcHMubGFiZWwgfHwgJ2xhYmVsJ1xyXG4gIGxldCB2YWx1ZVByb3AgPSBvcHRpb25Qcm9wcy52YWx1ZSB8fCAndmFsdWUnXHJcbiAgbGV0IGRpc2FibGVkUHJvcCA9IG9wdGlvblByb3BzLmRpc2FibGVkIHx8ICdkaXNhYmxlZCdcclxuICByZXR1cm4gWEVVdGlscy5tYXAob3B0aW9ucywgKGl0ZW06IGFueSwgaW5kZXg6IG51bWJlcikgPT4ge1xyXG4gICAgcmV0dXJuIGgoJ09wdGlvbicsIHtcclxuICAgICAgcHJvcHM6IHtcclxuICAgICAgICB2YWx1ZTogaXRlbVt2YWx1ZVByb3BdLFxyXG4gICAgICAgIGxhYmVsOiBpdGVtW2xhYmVsUHJvcF0sXHJcbiAgICAgICAgZGlzYWJsZWQ6IGl0ZW1bZGlzYWJsZWRQcm9wXVxyXG4gICAgICB9LFxyXG4gICAgICBrZXk6IGluZGV4XHJcbiAgICB9KVxyXG4gIH0pXHJcbn1cclxuXHJcbmZ1bmN0aW9uIGNlbGxUZXh0IChoOiBGdW5jdGlvbiwgY2VsbFZhbHVlOiBhbnkpIHtcclxuICByZXR1cm4gWycnICsgKGlzRW1wdHlWYWx1ZShjZWxsVmFsdWUpID8gJycgOiBjZWxsVmFsdWUpXVxyXG59XHJcblxyXG5mdW5jdGlvbiBjcmVhdGVGb3JtSXRlbVJlbmRlciAoZGVmYXVsdFByb3BzPzogYW55KSB7XHJcbiAgcmV0dXJuIGZ1bmN0aW9uIChoOiBGdW5jdGlvbiwgcmVuZGVyT3B0czogYW55LCBwYXJhbXM6IGFueSwgY29udGV4dDogYW55KSB7XHJcbiAgICBsZXQgeyBkYXRhLCBwcm9wZXJ0eSB9ID0gcGFyYW1zXHJcbiAgICBsZXQgeyBuYW1lIH0gPSByZW5kZXJPcHRzXHJcbiAgICBsZXQgeyBhdHRycyB9OiBhbnkgPSByZW5kZXJPcHRzXHJcbiAgICBsZXQgcHJvcHM6IGFueSA9IGdldEZvcm1Qcm9wcyhwYXJhbXMsIHJlbmRlck9wdHMsIGRlZmF1bHRQcm9wcylcclxuICAgIHJldHVybiBbXHJcbiAgICAgIGgobmFtZSwge1xyXG4gICAgICAgIGF0dHJzLFxyXG4gICAgICAgIHByb3BzLFxyXG4gICAgICAgIG1vZGVsOiB7XHJcbiAgICAgICAgICB2YWx1ZTogWEVVdGlscy5nZXQoZGF0YSwgcHJvcGVydHkpLFxyXG4gICAgICAgICAgY2FsbGJhY2sgKHZhbHVlOiBhbnkpIHtcclxuICAgICAgICAgICAgWEVVdGlscy5zZXQoZGF0YSwgcHJvcGVydHksIHZhbHVlKVxyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgb246IGdldEZvcm1FdmVudHMocmVuZGVyT3B0cywgcGFyYW1zKVxyXG4gICAgICB9KVxyXG4gICAgXVxyXG4gIH1cclxufVxyXG5cclxuZnVuY3Rpb24gZ2V0Rm9ybVByb3BzICh7ICRmb3JtIH06IGFueSwgeyBwcm9wcyB9OiBhbnksIGRlZmF1bHRQcm9wcz86IGFueSkge1xyXG4gIHJldHVybiBYRVV0aWxzLmFzc2lnbigkZm9ybS52U2l6ZSA/IHsgc2l6ZTogJGZvcm0udlNpemUgfSA6IHt9LCBkZWZhdWx0UHJvcHMsIHByb3BzKVxyXG59XHJcblxyXG5mdW5jdGlvbiBnZXRGb3JtRXZlbnRzIChyZW5kZXJPcHRzOiBhbnksIHBhcmFtczogYW55KSB7XHJcbiAgbGV0IHsgZXZlbnRzIH06IGFueSA9IHJlbmRlck9wdHNcclxuICBsZXQgeyAkZm9ybSB9ID0gcGFyYW1zXHJcbiAgbGV0IHR5cGUgPSAnb24tY2hhbmdlJ1xyXG4gIGxldCBvbiA9IHtcclxuICAgIFt0eXBlXTogKGV2bnQ6IGFueSkgPT4ge1xyXG4gICAgICAkZm9ybS51cGRhdGVTdGF0dXMocGFyYW1zKVxyXG4gICAgICBpZiAoZXZlbnRzICYmIGV2ZW50c1t0eXBlXSkge1xyXG4gICAgICAgIGV2ZW50c1t0eXBlXShwYXJhbXMsIGV2bnQpXHJcbiAgICAgIH1cclxuICAgIH1cclxuICB9XHJcbiAgaWYgKGV2ZW50cykge1xyXG4gICAgcmV0dXJuIFhFVXRpbHMuYXNzaWduKHt9LCBYRVV0aWxzLm9iamVjdE1hcChldmVudHMsIChjYjogRnVuY3Rpb24pID0+IGZ1bmN0aW9uICguLi5hcmdzOiBhbnlbXSkge1xyXG4gICAgICBjYi5hcHBseShudWxsLCBbcGFyYW1zXS5jb25jYXQuYXBwbHkocGFyYW1zLCBhcmdzKSlcclxuICAgIH0pLCBvbilcclxuICB9XHJcbiAgcmV0dXJuIG9uXHJcbn1cclxuXHJcbmZ1bmN0aW9uIGNyZWF0ZUV4cG9ydE1ldGhvZCAodmFsdWVNZXRob2Q6IEZ1bmN0aW9uLCBpc0VkaXQ/OiBib29sZWFuKSB7XHJcbiAgY29uc3QgcmVuZGVyUHJvcGVydHkgPSBpc0VkaXQgPyAnZWRpdFJlbmRlcicgOiAnY2VsbFJlbmRlcidcclxuICByZXR1cm4gZnVuY3Rpb24gKHBhcmFtczogYW55KSB7XHJcbiAgICByZXR1cm4gdmFsdWVNZXRob2QocGFyYW1zLmNvbHVtbltyZW5kZXJQcm9wZXJ0eV0sIHBhcmFtcylcclxuICB9XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGNyZWF0ZUZvcm1JdGVtUmFkaW9BbmRDaGVja2JveFJlbmRlciAoKSB7XHJcbiAgcmV0dXJuIGZ1bmN0aW9uIChoOiBGdW5jdGlvbiwgcmVuZGVyT3B0czogYW55LCBwYXJhbXM6IGFueSwgY29udGV4dDogYW55KSB7XHJcbiAgICBsZXQgeyBuYW1lLCBvcHRpb25zLCBvcHRpb25Qcm9wcyA9IHt9IH0gPSByZW5kZXJPcHRzXHJcbiAgICBsZXQgeyBkYXRhLCBwcm9wZXJ0eSB9ID0gcGFyYW1zXHJcbiAgICBsZXQgeyBhdHRycyB9ID0gcmVuZGVyT3B0c1xyXG4gICAgbGV0IHByb3BzOiBhbnkgPSBnZXRGb3JtUHJvcHMocGFyYW1zLCByZW5kZXJPcHRzKVxyXG4gICAgbGV0IGxhYmVsUHJvcDogc3RyaW5nID0gb3B0aW9uUHJvcHMubGFiZWwgfHwgJ2xhYmVsJ1xyXG4gICAgbGV0IHZhbHVlUHJvcDogc3RyaW5nID0gb3B0aW9uUHJvcHMudmFsdWUgfHwgJ3ZhbHVlJ1xyXG4gICAgbGV0IGRpc2FibGVkUHJvcDogc3RyaW5nID0gb3B0aW9uUHJvcHMuZGlzYWJsZWQgfHwgJ2Rpc2FibGVkJ1xyXG4gICAgcmV0dXJuIFtcclxuICAgICAgaChgJHtuYW1lfUdyb3VwYCwge1xyXG4gICAgICAgIHByb3BzLFxyXG4gICAgICAgIGF0dHJzLFxyXG4gICAgICAgIG1vZGVsOiB7XHJcbiAgICAgICAgICB2YWx1ZTogWEVVdGlscy5nZXQoZGF0YSwgcHJvcGVydHkpLFxyXG4gICAgICAgICAgY2FsbGJhY2sgKGNlbGxWYWx1ZTogYW55KSB7XHJcbiAgICAgICAgICAgIFhFVXRpbHMuc2V0KGRhdGEsIHByb3BlcnR5LCBjZWxsVmFsdWUpXHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfSxcclxuICAgICAgICBvbjogZ2V0Rm9ybUV2ZW50cyhyZW5kZXJPcHRzLCBwYXJhbXMpXHJcbiAgICAgIH0sIG9wdGlvbnMubWFwKChvcHRpb246IGFueSkgPT4ge1xyXG4gICAgICAgIHJldHVybiBoKG5hbWUsIHtcclxuICAgICAgICAgIHByb3BzOiB7XHJcbiAgICAgICAgICAgIGxhYmVsOiBvcHRpb25bdmFsdWVQcm9wXSxcclxuICAgICAgICAgICAgZGlzYWJsZWQ6IG9wdGlvbltkaXNhYmxlZFByb3BdXHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfSwgb3B0aW9uW2xhYmVsUHJvcF0pXHJcbiAgICAgIH0pKVxyXG4gICAgXVxyXG4gIH1cclxufVxyXG5cclxuLyoqXHJcbiAqIOa4suafk+WHveaVsFxyXG4gKi9cclxuY29uc3QgcmVuZGVyTWFwOiBhbnkgPSB7XHJcbiAgSW5wdXQ6IHtcclxuICAgIGF1dG9mb2N1czogJ2lucHV0Lml2dS1pbnB1dCcsXHJcbiAgICByZW5kZXJEZWZhdWx0OiBjcmVhdGVFZGl0UmVuZGVyKCksXHJcbiAgICByZW5kZXJFZGl0OiBjcmVhdGVFZGl0UmVuZGVyKCksXHJcbiAgICByZW5kZXJGaWx0ZXI6IGNyZWF0ZUZpbHRlclJlbmRlcigpLFxyXG4gICAgZmlsdGVyTWV0aG9kOiBkZWZhdWx0RmlsdGVyTWV0aG9kLFxyXG4gICAgcmVuZGVySXRlbTogY3JlYXRlRm9ybUl0ZW1SZW5kZXIoKVxyXG4gIH0sXHJcbiAgQXV0b0NvbXBsZXRlOiB7XHJcbiAgICBhdXRvZm9jdXM6ICdpbnB1dC5pdnUtaW5wdXQnLFxyXG4gICAgcmVuZGVyRGVmYXVsdDogY3JlYXRlRWRpdFJlbmRlcigpLFxyXG4gICAgcmVuZGVyRWRpdDogY3JlYXRlRWRpdFJlbmRlcigpLFxyXG4gICAgcmVuZGVyRmlsdGVyOiBjcmVhdGVGaWx0ZXJSZW5kZXIoKSxcclxuICAgIGZpbHRlck1ldGhvZDogZGVmYXVsdEZpbHRlck1ldGhvZCxcclxuICAgIHJlbmRlckl0ZW06IGNyZWF0ZUZvcm1JdGVtUmVuZGVyKClcclxuICB9LFxyXG4gIElucHV0TnVtYmVyOiB7XHJcbiAgICBhdXRvZm9jdXM6ICdpbnB1dC5pdnUtaW5wdXQtbnVtYmVyLWlucHV0JyxcclxuICAgIHJlbmRlckRlZmF1bHQ6IGNyZWF0ZUVkaXRSZW5kZXIoKSxcclxuICAgIHJlbmRlckVkaXQ6IGNyZWF0ZUVkaXRSZW5kZXIoKSxcclxuICAgIHJlbmRlckZpbHRlcjogY3JlYXRlRmlsdGVyUmVuZGVyKCksXHJcbiAgICBmaWx0ZXJNZXRob2Q6IGRlZmF1bHRGaWx0ZXJNZXRob2QsXHJcbiAgICByZW5kZXJJdGVtOiBjcmVhdGVGb3JtSXRlbVJlbmRlcigpXHJcbiAgfSxcclxuICBTZWxlY3Q6IHtcclxuICAgIHJlbmRlckVkaXQgKGg6IEZ1bmN0aW9uLCByZW5kZXJPcHRzOiBhbnksIHBhcmFtczogYW55KSB7XHJcbiAgICAgIGxldCB7IG9wdGlvbnMsIG9wdGlvbkdyb3Vwcywgb3B0aW9uUHJvcHMgPSB7fSwgb3B0aW9uR3JvdXBQcm9wcyA9IHt9IH0gPSByZW5kZXJPcHRzXHJcbiAgICAgIGxldCB7IHJvdywgY29sdW1uIH0gPSBwYXJhbXNcclxuICAgICAgbGV0IHsgYXR0cnMgfSA9IHJlbmRlck9wdHNcclxuICAgICAgbGV0IHByb3BzID0gZ2V0UHJvcHMocGFyYW1zLCByZW5kZXJPcHRzLCB7IHRyYW5zZmVyOiB0cnVlIH0pXHJcbiAgICAgIGlmIChvcHRpb25Hcm91cHMpIHtcclxuICAgICAgICBsZXQgZ3JvdXBPcHRpb25zID0gb3B0aW9uR3JvdXBQcm9wcy5vcHRpb25zIHx8ICdvcHRpb25zJ1xyXG4gICAgICAgIGxldCBncm91cExhYmVsID0gb3B0aW9uR3JvdXBQcm9wcy5sYWJlbCB8fCAnbGFiZWwnXHJcbiAgICAgICAgcmV0dXJuIFtcclxuICAgICAgICAgIGgoJ1NlbGVjdCcsIHtcclxuICAgICAgICAgICAgcHJvcHMsXHJcbiAgICAgICAgICAgIGF0dHJzLFxyXG4gICAgICAgICAgICBtb2RlbDoge1xyXG4gICAgICAgICAgICAgIHZhbHVlOiBYRVV0aWxzLmdldChyb3csIGNvbHVtbi5wcm9wZXJ0eSksXHJcbiAgICAgICAgICAgICAgY2FsbGJhY2sgKGNlbGxWYWx1ZTogYW55KSB7XHJcbiAgICAgICAgICAgICAgICBYRVV0aWxzLnNldChyb3csIGNvbHVtbi5wcm9wZXJ0eSwgY2VsbFZhbHVlKVxyXG4gICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgb246IGdldENlbGxFdmVudHMocmVuZGVyT3B0cywgcGFyYW1zKVxyXG4gICAgICAgICAgfSwgWEVVdGlscy5tYXAob3B0aW9uR3JvdXBzLCAoZ3JvdXA6IGFueSwgZ0luZGV4OiBudW1iZXIpID0+IHtcclxuICAgICAgICAgICAgcmV0dXJuIGgoJ09wdGlvbkdyb3VwJywge1xyXG4gICAgICAgICAgICAgIHByb3BzOiB7XHJcbiAgICAgICAgICAgICAgICBsYWJlbDogZ3JvdXBbZ3JvdXBMYWJlbF1cclxuICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgIGtleTogZ0luZGV4XHJcbiAgICAgICAgICAgIH0sIHJlbmRlck9wdGlvbnMoaCwgZ3JvdXBbZ3JvdXBPcHRpb25zXSwgb3B0aW9uUHJvcHMpKVxyXG4gICAgICAgICAgfSkpXHJcbiAgICAgICAgXVxyXG4gICAgICB9XHJcbiAgICAgIHJldHVybiBbXHJcbiAgICAgICAgaCgnU2VsZWN0Jywge1xyXG4gICAgICAgICAgcHJvcHMsXHJcbiAgICAgICAgICBhdHRycyxcclxuICAgICAgICAgIG1vZGVsOiB7XHJcbiAgICAgICAgICAgIHZhbHVlOiBYRVV0aWxzLmdldChyb3csIGNvbHVtbi5wcm9wZXJ0eSksXHJcbiAgICAgICAgICAgIGNhbGxiYWNrIChjZWxsVmFsdWU6IGFueSkge1xyXG4gICAgICAgICAgICAgIFhFVXRpbHMuc2V0KHJvdywgY29sdW1uLnByb3BlcnR5LCBjZWxsVmFsdWUpXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgIH0sXHJcbiAgICAgICAgICBvbjogZ2V0Q2VsbEV2ZW50cyhyZW5kZXJPcHRzLCBwYXJhbXMpXHJcbiAgICAgICAgfSwgcmVuZGVyT3B0aW9ucyhoLCBvcHRpb25zLCBvcHRpb25Qcm9wcykpXHJcbiAgICAgIF1cclxuICAgIH0sXHJcbiAgICByZW5kZXJDZWxsIChoOiBGdW5jdGlvbiwgcmVuZGVyT3B0czogYW55LCBwYXJhbXM6IGFueSkge1xyXG4gICAgICBjZWxsVGV4dChoLCBnZXRTZWxlY3RDZWxsVmFsdWUocmVuZGVyT3B0cywgcGFyYW1zKSlcclxuICAgIH0sXHJcbiAgICByZW5kZXJGaWx0ZXIgKGg6IEZ1bmN0aW9uLCByZW5kZXJPcHRzOiBhbnksIHBhcmFtczogYW55LCBjb250ZXh0OiBhbnkpIHtcclxuICAgICAgbGV0IHsgb3B0aW9ucywgb3B0aW9uR3JvdXBzLCBvcHRpb25Qcm9wcyA9IHt9LCBvcHRpb25Hcm91cFByb3BzID0ge30gfSA9IHJlbmRlck9wdHNcclxuICAgICAgbGV0IHsgY29sdW1uIH0gPSBwYXJhbXNcclxuICAgICAgbGV0IHsgYXR0cnMsIGV2ZW50cyB9ID0gcmVuZGVyT3B0c1xyXG4gICAgICBsZXQgcHJvcHMgPSBnZXRQcm9wcyhwYXJhbXMsIHJlbmRlck9wdHMsIHsgdHJhbnNmZXI6IHRydWUgfSlcclxuICAgICAgbGV0IHR5cGUgPSAnb24tY2hhbmdlJ1xyXG4gICAgICBpZiAob3B0aW9uR3JvdXBzKSB7XHJcbiAgICAgICAgbGV0IGdyb3VwT3B0aW9ucyA9IG9wdGlvbkdyb3VwUHJvcHMub3B0aW9ucyB8fCAnb3B0aW9ucydcclxuICAgICAgICBsZXQgZ3JvdXBMYWJlbCA9IG9wdGlvbkdyb3VwUHJvcHMubGFiZWwgfHwgJ2xhYmVsJ1xyXG4gICAgICAgIHJldHVybiBjb2x1bW4uZmlsdGVycy5tYXAoKGl0ZW06IGFueSkgPT4ge1xyXG4gICAgICAgICAgcmV0dXJuIGgoJ1NlbGVjdCcsIHtcclxuICAgICAgICAgICAgcHJvcHMsXHJcbiAgICAgICAgICAgIGF0dHJzLFxyXG4gICAgICAgICAgICBtb2RlbDoge1xyXG4gICAgICAgICAgICAgIHZhbHVlOiBpdGVtLmRhdGEsXHJcbiAgICAgICAgICAgICAgY2FsbGJhY2sgKG9wdGlvblZhbHVlOiBhbnkpIHtcclxuICAgICAgICAgICAgICAgIGl0ZW0uZGF0YSA9IG9wdGlvblZhbHVlXHJcbiAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICBvbjogZ2V0RmlsdGVyRXZlbnRzKHtcclxuICAgICAgICAgICAgICBbdHlwZV0gKHZhbHVlOiBhbnkpIHtcclxuICAgICAgICAgICAgICAgIGhhbmRsZUNvbmZpcm1GaWx0ZXIocGFyYW1zLCBjb2x1bW4sIHZhbHVlICYmIHZhbHVlLmxlbmd0aCA+IDAsIGl0ZW0pXHJcbiAgICAgICAgICAgICAgICBpZiAoZXZlbnRzICYmIGV2ZW50c1t0eXBlXSkge1xyXG4gICAgICAgICAgICAgICAgICBldmVudHNbdHlwZV0ocGFyYW1zLCB2YWx1ZSlcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0sIHJlbmRlck9wdHMsIHBhcmFtcylcclxuICAgICAgICAgIH0sIFhFVXRpbHMubWFwKG9wdGlvbkdyb3VwcywgKGdyb3VwOiBhbnksIGdJbmRleDogbnVtYmVyKSA9PiB7XHJcbiAgICAgICAgICAgIHJldHVybiBoKCdPcHRpb25Hcm91cCcsIHtcclxuICAgICAgICAgICAgICBwcm9wczoge1xyXG4gICAgICAgICAgICAgICAgbGFiZWw6IGdyb3VwW2dyb3VwTGFiZWxdXHJcbiAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICBrZXk6IGdJbmRleFxyXG4gICAgICAgICAgICB9LCByZW5kZXJPcHRpb25zKGgsIGdyb3VwW2dyb3VwT3B0aW9uc10sIG9wdGlvblByb3BzKSlcclxuICAgICAgICAgIH0pKVxyXG4gICAgICAgIH0pXHJcbiAgICAgIH1cclxuICAgICAgcmV0dXJuIGNvbHVtbi5maWx0ZXJzLm1hcCgoaXRlbTogYW55KSA9PiB7XHJcbiAgICAgICAgcmV0dXJuIGgoJ1NlbGVjdCcsIHtcclxuICAgICAgICAgIHByb3BzLFxyXG4gICAgICAgICAgYXR0cnMsXHJcbiAgICAgICAgICBtb2RlbDoge1xyXG4gICAgICAgICAgICB2YWx1ZTogaXRlbS5kYXRhLFxyXG4gICAgICAgICAgICBjYWxsYmFjayAob3B0aW9uVmFsdWU6IGFueSkge1xyXG4gICAgICAgICAgICAgIGl0ZW0uZGF0YSA9IG9wdGlvblZhbHVlXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgIH0sXHJcbiAgICAgICAgICBvbjogZ2V0RmlsdGVyRXZlbnRzKHtcclxuICAgICAgICAgICAgW3R5cGVdICh2YWx1ZTogYW55KSB7XHJcbiAgICAgICAgICAgICAgaGFuZGxlQ29uZmlybUZpbHRlcihwYXJhbXMsIGNvbHVtbiwgdmFsdWUgJiYgdmFsdWUubGVuZ3RoID4gMCwgaXRlbSlcclxuICAgICAgICAgICAgICBpZiAoZXZlbnRzICYmIGV2ZW50c1t0eXBlXSkge1xyXG4gICAgICAgICAgICAgICAgZXZlbnRzW3R5cGVdKHBhcmFtcywgdmFsdWUpXHJcbiAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICB9LCByZW5kZXJPcHRzLCBwYXJhbXMpXHJcbiAgICAgICAgfSwgcmVuZGVyT3B0aW9ucyhoLCBvcHRpb25zLCBvcHRpb25Qcm9wcykpXHJcbiAgICAgIH0pXHJcbiAgICB9LFxyXG4gICAgZmlsdGVyTWV0aG9kICh7IG9wdGlvbiwgcm93LCBjb2x1bW4gfTogYW55KSB7XHJcbiAgICAgIGxldCB7IGRhdGEgfSA9IG9wdGlvblxyXG4gICAgICBsZXQgeyBwcm9wZXJ0eSwgZmlsdGVyUmVuZGVyOiByZW5kZXJPcHRzIH0gPSBjb2x1bW5cclxuICAgICAgbGV0IHsgcHJvcHMgPSB7fSB9ID0gcmVuZGVyT3B0c1xyXG4gICAgICBsZXQgY2VsbFZhbHVlID0gWEVVdGlscy5nZXQocm93LCBwcm9wZXJ0eSlcclxuICAgICAgaWYgKHByb3BzLm11bHRpcGxlKSB7XHJcbiAgICAgICAgaWYgKFhFVXRpbHMuaXNBcnJheShjZWxsVmFsdWUpKSB7XHJcbiAgICAgICAgICByZXR1cm4gWEVVdGlscy5pbmNsdWRlQXJyYXlzKGNlbGxWYWx1ZSwgZGF0YSlcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIGRhdGEuaW5kZXhPZihjZWxsVmFsdWUpID4gLTFcclxuICAgICAgfVxyXG4gICAgICAvKiBlc2xpbnQtZGlzYWJsZSBlcWVxZXEgKi9cclxuICAgICAgcmV0dXJuIGNlbGxWYWx1ZSA9PSBkYXRhXHJcbiAgICB9LFxyXG4gICAgcmVuZGVySXRlbSAoaDogRnVuY3Rpb24sIHJlbmRlck9wdHM6IGFueSwgcGFyYW1zOiBhbnksIGNvbnRleHQ6IGFueSkge1xyXG4gICAgICBsZXQgeyBvcHRpb25zLCBvcHRpb25Hcm91cHMsIG9wdGlvblByb3BzID0ge30sIG9wdGlvbkdyb3VwUHJvcHMgPSB7fSB9ID0gcmVuZGVyT3B0c1xyXG4gICAgICBsZXQgeyBkYXRhLCBwcm9wZXJ0eSB9ID0gcGFyYW1zXHJcbiAgICAgIGxldCB7IGF0dHJzIH0gPSByZW5kZXJPcHRzXHJcbiAgICAgIGxldCBwcm9wczogYW55ID0gZ2V0Rm9ybVByb3BzKHBhcmFtcywgcmVuZGVyT3B0cylcclxuICAgICAgaWYgKG9wdGlvbkdyb3Vwcykge1xyXG4gICAgICAgIGxldCBncm91cE9wdGlvbnM6IHN0cmluZyA9IG9wdGlvbkdyb3VwUHJvcHMub3B0aW9ucyB8fCAnb3B0aW9ucydcclxuICAgICAgICBsZXQgZ3JvdXBMYWJlbDogc3RyaW5nID0gb3B0aW9uR3JvdXBQcm9wcy5sYWJlbCB8fCAnbGFiZWwnXHJcbiAgICAgICAgcmV0dXJuIFtcclxuICAgICAgICAgIGgoJ1NlbGVjdCcsIHtcclxuICAgICAgICAgICAgcHJvcHMsXHJcbiAgICAgICAgICAgIGF0dHJzLFxyXG4gICAgICAgICAgICBtb2RlbDoge1xyXG4gICAgICAgICAgICAgIHZhbHVlOiBYRVV0aWxzLmdldChkYXRhLCBwcm9wZXJ0eSksXHJcbiAgICAgICAgICAgICAgY2FsbGJhY2sgKGNlbGxWYWx1ZTogYW55KSB7XHJcbiAgICAgICAgICAgICAgICBYRVV0aWxzLnNldChkYXRhLCBwcm9wZXJ0eSwgY2VsbFZhbHVlKVxyXG4gICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgb246IGdldEZvcm1FdmVudHMocmVuZGVyT3B0cywgcGFyYW1zKVxyXG4gICAgICAgICAgfSwgWEVVdGlscy5tYXAob3B0aW9uR3JvdXBzLCAoZ3JvdXA6IGFueSwgZ0luZGV4OiBudW1iZXIpID0+IHtcclxuICAgICAgICAgICAgcmV0dXJuIGgoJ09wdGlvbkdyb3VwJywge1xyXG4gICAgICAgICAgICAgIHByb3BzOiB7XHJcbiAgICAgICAgICAgICAgICBsYWJlbDogZ3JvdXBbZ3JvdXBMYWJlbF1cclxuICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgIGtleTogZ0luZGV4XHJcbiAgICAgICAgICAgIH0sIHJlbmRlck9wdGlvbnMoaCwgZ3JvdXBbZ3JvdXBPcHRpb25zXSwgb3B0aW9uUHJvcHMpKVxyXG4gICAgICAgICAgfSkpXHJcbiAgICAgICAgXVxyXG4gICAgICB9XHJcbiAgICAgIHJldHVybiBbXHJcbiAgICAgICAgaCgnU2VsZWN0Jywge1xyXG4gICAgICAgICAgcHJvcHMsXHJcbiAgICAgICAgICBhdHRycyxcclxuICAgICAgICAgIG1vZGVsOiB7XHJcbiAgICAgICAgICAgIHZhbHVlOiBYRVV0aWxzLmdldChkYXRhLCBwcm9wZXJ0eSksXHJcbiAgICAgICAgICAgIGNhbGxiYWNrIChjZWxsVmFsdWU6IGFueSkge1xyXG4gICAgICAgICAgICAgIFhFVXRpbHMuc2V0KGRhdGEsIHByb3BlcnR5LCBjZWxsVmFsdWUpXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgIH0sXHJcbiAgICAgICAgICBvbjogZ2V0Rm9ybUV2ZW50cyhyZW5kZXJPcHRzLCBwYXJhbXMpXHJcbiAgICAgICAgfSwgcmVuZGVyT3B0aW9ucyhoLCBvcHRpb25zLCBvcHRpb25Qcm9wcykpXHJcbiAgICAgIF1cclxuICAgIH0sXHJcbiAgICBjZWxsRXhwb3J0TWV0aG9kOiBjcmVhdGVFeHBvcnRNZXRob2QoZ2V0U2VsZWN0Q2VsbFZhbHVlKSxcclxuICAgIGVkaXRDZWxsRXhwb3J0TWV0aG9kOiBjcmVhdGVFeHBvcnRNZXRob2QoZ2V0U2VsZWN0Q2VsbFZhbHVlLCB0cnVlKVxyXG4gIH0sXHJcbiAgQ2FzY2FkZXI6IHtcclxuICAgIHJlbmRlckVkaXQ6IGNyZWF0ZUVkaXRSZW5kZXIoeyB0cmFuc2ZlcjogdHJ1ZSB9KSxcclxuICAgIHJlbmRlckNlbGwgKGg6IEZ1bmN0aW9uLCByZW5kZXJPcHRzOiBhbnksIHBhcmFtczogYW55KSB7XHJcbiAgICAgIHJldHVybiBjZWxsVGV4dChoLCBnZXRDYXNjYWRlckNlbGxWYWx1ZShyZW5kZXJPcHRzLCBwYXJhbXMpKVxyXG4gICAgfSxcclxuICAgIHJlbmRlckl0ZW06IGNyZWF0ZUZvcm1JdGVtUmVuZGVyKCksXHJcbiAgICBjZWxsRXhwb3J0TWV0aG9kOiBjcmVhdGVFeHBvcnRNZXRob2QoZ2V0Q2FzY2FkZXJDZWxsVmFsdWUpLFxyXG4gICAgZWRpdENlbGxFeHBvcnRNZXRob2Q6IGNyZWF0ZUV4cG9ydE1ldGhvZChnZXRDYXNjYWRlckNlbGxWYWx1ZSwgdHJ1ZSlcclxuICB9LFxyXG4gIERhdGVQaWNrZXI6IHtcclxuICAgIHJlbmRlckVkaXQ6IGNyZWF0ZUVkaXRSZW5kZXIoeyB0cmFuc2ZlcjogdHJ1ZSB9KSxcclxuICAgIHJlbmRlckNlbGwgKGg6IEZ1bmN0aW9uLCByZW5kZXJPcHRzOiBhbnksIHBhcmFtczogYW55KSB7XHJcbiAgICAgIHJldHVybiBjZWxsVGV4dChoLCBnZXREYXRlUGlja2VyQ2VsbFZhbHVlKHJlbmRlck9wdHMsIHBhcmFtcykpXHJcbiAgICB9LFxyXG4gICAgcmVuZGVyRmlsdGVyIChoOiBGdW5jdGlvbiwgcmVuZGVyT3B0czogYW55LCBwYXJhbXM6IGFueSwgY29udGV4dDogYW55KSB7XHJcbiAgICAgIGxldCB7IGNvbHVtbiB9ID0gcGFyYW1zXHJcbiAgICAgIGxldCB7IGF0dHJzLCBldmVudHMgfSA9IHJlbmRlck9wdHNcclxuICAgICAgbGV0IHByb3BzID0gZ2V0UHJvcHMocGFyYW1zLCByZW5kZXJPcHRzLCB7IHRyYW5zZmVyOiB0cnVlIH0pXHJcbiAgICAgIGxldCB0eXBlID0gJ29uLWNoYW5nZSdcclxuICAgICAgcmV0dXJuIGNvbHVtbi5maWx0ZXJzLm1hcCgoaXRlbTogYW55KSA9PiB7XHJcbiAgICAgICAgcmV0dXJuIGgocmVuZGVyT3B0cy5uYW1lLCB7XHJcbiAgICAgICAgICBwcm9wcyxcclxuICAgICAgICAgIGF0dHJzLFxyXG4gICAgICAgICAgbW9kZWw6IHtcclxuICAgICAgICAgICAgdmFsdWU6IGl0ZW0uZGF0YSxcclxuICAgICAgICAgICAgY2FsbGJhY2sgKG9wdGlvblZhbHVlOiBhbnkpIHtcclxuICAgICAgICAgICAgICBpdGVtLmRhdGEgPSBvcHRpb25WYWx1ZVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICB9LFxyXG4gICAgICAgICAgb246IGdldEZpbHRlckV2ZW50cyh7XHJcbiAgICAgICAgICAgIFt0eXBlXSAodmFsdWU6IGFueSkge1xyXG4gICAgICAgICAgICAgIGhhbmRsZUNvbmZpcm1GaWx0ZXIocGFyYW1zLCBjb2x1bW4sICEhdmFsdWUsIGl0ZW0pXHJcbiAgICAgICAgICAgICAgaWYgKGV2ZW50cyAmJiBldmVudHNbdHlwZV0pIHtcclxuICAgICAgICAgICAgICAgIGV2ZW50c1t0eXBlXShwYXJhbXMsIHZhbHVlKVxyXG4gICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgfSwgcmVuZGVyT3B0cywgcGFyYW1zKVxyXG4gICAgICAgIH0pXHJcbiAgICAgIH0pXHJcbiAgICB9LFxyXG4gICAgZmlsdGVyTWV0aG9kICh7IG9wdGlvbiwgcm93LCBjb2x1bW4gfTogYW55KSB7XHJcbiAgICAgIGxldCB7IGRhdGEgfSA9IG9wdGlvblxyXG4gICAgICBsZXQgeyBmaWx0ZXJSZW5kZXI6IHJlbmRlck9wdHMgfSA9IGNvbHVtblxyXG4gICAgICBsZXQgeyBwcm9wcyA9IHt9IH0gPSByZW5kZXJPcHRzXHJcbiAgICAgIGxldCBjZWxsVmFsdWUgPSBYRVV0aWxzLmdldChyb3csIGNvbHVtbi5wcm9wZXJ0eSlcclxuICAgICAgaWYgKGRhdGEpIHtcclxuICAgICAgICBzd2l0Y2ggKHByb3BzLnR5cGUpIHtcclxuICAgICAgICAgIGNhc2UgJ2RhdGVyYW5nZSc6XHJcbiAgICAgICAgICAgIHJldHVybiBlcXVhbERhdGVyYW5nZShjZWxsVmFsdWUsIGRhdGEsIHByb3BzLCAneXl5eS1NTS1kZCcpXHJcbiAgICAgICAgICBjYXNlICdkYXRldGltZXJhbmdlJzpcclxuICAgICAgICAgICAgcmV0dXJuIGVxdWFsRGF0ZXJhbmdlKGNlbGxWYWx1ZSwgZGF0YSwgcHJvcHMsICd5eXl5LU1NLWRkIEhIOnNzOm1tJylcclxuICAgICAgICAgIGRlZmF1bHQ6XHJcbiAgICAgICAgICAgIHJldHVybiBjZWxsVmFsdWUgPT09IGRhdGFcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgICAgcmV0dXJuIGZhbHNlXHJcbiAgICB9LFxyXG4gICAgcmVuZGVySXRlbTogY3JlYXRlRm9ybUl0ZW1SZW5kZXIoKSxcclxuICAgIGNlbGxFeHBvcnRNZXRob2Q6IGNyZWF0ZUV4cG9ydE1ldGhvZChnZXREYXRlUGlja2VyQ2VsbFZhbHVlKSxcclxuICAgIGVkaXRDZWxsRXhwb3J0TWV0aG9kOiBjcmVhdGVFeHBvcnRNZXRob2QoZ2V0RGF0ZVBpY2tlckNlbGxWYWx1ZSwgdHJ1ZSlcclxuICB9LFxyXG4gIFRpbWVQaWNrZXI6IHtcclxuICAgIHJlbmRlckVkaXQ6IGNyZWF0ZUVkaXRSZW5kZXIoeyB0cmFuc2ZlcjogdHJ1ZSB9KSxcclxuICAgIHJlbmRlckl0ZW06IGNyZWF0ZUZvcm1JdGVtUmVuZGVyKClcclxuICB9LFxyXG4gIFJhdGU6IHtcclxuICAgIHJlbmRlckRlZmF1bHQ6IGNyZWF0ZUVkaXRSZW5kZXIoKSxcclxuICAgIHJlbmRlckVkaXQ6IGNyZWF0ZUVkaXRSZW5kZXIoKSxcclxuICAgIHJlbmRlckZpbHRlcjogY3JlYXRlRmlsdGVyUmVuZGVyKCksXHJcbiAgICBmaWx0ZXJNZXRob2Q6IGRlZmF1bHRGaWx0ZXJNZXRob2QsXHJcbiAgICByZW5kZXJJdGVtOiBjcmVhdGVGb3JtSXRlbVJlbmRlcigpXHJcbiAgfSxcclxuICBpU3dpdGNoOiB7XHJcbiAgICByZW5kZXJEZWZhdWx0OiBjcmVhdGVFZGl0UmVuZGVyKCksXHJcbiAgICByZW5kZXJFZGl0OiBjcmVhdGVFZGl0UmVuZGVyKCksXHJcbiAgICByZW5kZXJGaWx0ZXI6IGNyZWF0ZUZpbHRlclJlbmRlcigpLFxyXG4gICAgZmlsdGVyTWV0aG9kOiBkZWZhdWx0RmlsdGVyTWV0aG9kLFxyXG4gICAgcmVuZGVySXRlbTogY3JlYXRlRm9ybUl0ZW1SZW5kZXIoKVxyXG4gIH0sXHJcbiAgUmFkaW86IHtcclxuICAgIHJlbmRlckl0ZW06IGNyZWF0ZUZvcm1JdGVtUmFkaW9BbmRDaGVja2JveFJlbmRlcigpXHJcbiAgfSxcclxuICBDaGVja2JveDoge1xyXG4gICAgcmVuZGVySXRlbTogY3JlYXRlRm9ybUl0ZW1SYWRpb0FuZENoZWNrYm94UmVuZGVyKClcclxuICB9XHJcbn1cclxuXHJcbi8qKlxyXG4gKiDkuovku7blhbzlrrnmgKflpITnkIZcclxuICovXHJcbmZ1bmN0aW9uIGhhbmRsZUNsZWFyRXZlbnQgKHBhcmFtczogYW55LCBldm50OiBhbnksIGNvbnRleHQ6IGFueSkge1xyXG4gIGNvbnN0IHsgJHRhYmxlIH0gPSBwYXJhbXNcclxuICBjb25zdCBnZXRFdmVudFRhcmdldE5vZGUgPSAkdGFibGUgPyAkdGFibGUuZ2V0RXZlbnRUYXJnZXROb2RlIDogY29udGV4dC5nZXRFdmVudFRhcmdldE5vZGVcclxuICBjb25zdCBib2R5RWxlbTogSFRNTEVsZW1lbnQgPSBkb2N1bWVudC5ib2R5XHJcbiAgaWYgKFxyXG4gICAgLy8g5LiL5ouJ5qGG44CB5pel5pyfXHJcbiAgICBnZXRFdmVudFRhcmdldE5vZGUoZXZudCwgYm9keUVsZW0sICdpdnUtc2VsZWN0LWRyb3Bkb3duJykuZmxhZ1xyXG4gICkge1xyXG4gICAgcmV0dXJuIGZhbHNlXHJcbiAgfVxyXG59XHJcblxyXG4vKipcclxuICog5Z+65LqOIHZ4ZS10YWJsZSDooajmoLznmoTpgILphY3mj5Lku7bvvIznlKjkuo7lhbzlrrkgaXZpZXcg57uE5Lu25bqTXHJcbiAqL1xyXG5leHBvcnQgY29uc3QgVlhFVGFibGVQbHVnaW5JVmlldyA9IHtcclxuICBpbnN0YWxsICh4dGFibGU6IHR5cGVvZiBWWEVUYWJsZSkge1xyXG4gICAgbGV0IHsgaW50ZXJjZXB0b3IsIHJlbmRlcmVyIH0gPSB4dGFibGVcclxuICAgIHJlbmRlcmVyLm1peGluKHJlbmRlck1hcClcclxuICAgIGludGVyY2VwdG9yLmFkZCgnZXZlbnQuY2xlYXJGaWx0ZXInLCBoYW5kbGVDbGVhckV2ZW50KVxyXG4gICAgaW50ZXJjZXB0b3IuYWRkKCdldmVudC5jbGVhckFjdGl2ZWQnLCBoYW5kbGVDbGVhckV2ZW50KVxyXG4gIH1cclxufVxyXG5cclxuaWYgKHR5cGVvZiB3aW5kb3cgIT09ICd1bmRlZmluZWQnICYmIHdpbmRvdy5WWEVUYWJsZSkge1xyXG4gIHdpbmRvdy5WWEVUYWJsZS51c2UoVlhFVGFibGVQbHVnaW5JVmlldylcclxufVxyXG5cclxuZXhwb3J0IGRlZmF1bHQgVlhFVGFibGVQbHVnaW5JVmlld1xyXG4iXX0=
