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

function defaultButtonEditRender(h, renderOpts, params) {
  var attrs = renderOpts.attrs;
  var props = getProps(params, renderOpts);
  return [h('Button', {
    attrs: attrs,
    props: props,
    on: getCellEvents(renderOpts, params)
  }, cellText(h, renderOpts.content))];
}

function defaultButtonsEditRender(h, renderOpts, params) {
  return renderOpts.children.map(function (childRenderOpts) {
    return defaultButtonEditRender(h, childRenderOpts, params)[0];
  });
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
  return function (h, renderOpts, params) {
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
  return function (h, renderOpts, params) {
    var data = params.data,
        property = params.property;
    var name = renderOpts.name;
    var attrs = renderOpts.attrs;
    var props = getFormItemProps(params, renderOpts, defaultProps);
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

function defaultButtonItemRender(h, renderOpts, params) {
  var attrs = renderOpts.attrs;
  var props = getFormItemProps(params, renderOpts);
  return [h('Button', {
    attrs: attrs,
    props: props,
    on: getFormEvents(renderOpts, params)
  }, cellText(h, props.content))];
}

function defaultButtonsItemRender(h, renderOpts, params) {
  return renderOpts.children.map(function (childRenderOpts) {
    return defaultButtonItemRender(h, childRenderOpts, params)[0];
  });
}

function getFormItemProps(_ref4, _ref5, defaultProps) {
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
  return function (h, renderOpts, params) {
    var name = renderOpts.name,
        options = renderOpts.options,
        _renderOpts$optionPro2 = renderOpts.optionProps,
        optionProps = _renderOpts$optionPro2 === void 0 ? {} : _renderOpts$optionPro2;
    var data = params.data,
        property = params.property;
    var attrs = renderOpts.attrs;
    var props = getFormItemProps(params, renderOpts);
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
      return cellText(h, getSelectCellValue(renderOpts, params));
    },
    renderFilter: function renderFilter(h, renderOpts, params) {
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
    renderItem: function renderItem(h, renderOpts, params) {
      var options = renderOpts.options,
          optionGroups = renderOpts.optionGroups,
          _renderOpts$optionPro5 = renderOpts.optionProps,
          optionProps = _renderOpts$optionPro5 === void 0 ? {} : _renderOpts$optionPro5,
          _renderOpts$optionGro4 = renderOpts.optionGroupProps,
          optionGroupProps = _renderOpts$optionGro4 === void 0 ? {} : _renderOpts$optionGro4;
      var data = params.data,
          property = params.property;
      var attrs = renderOpts.attrs;
      var props = getFormItemProps(params, renderOpts);

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
    renderFilter: function renderFilter(h, renderOpts, params) {
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
  },
  Button: {
    renderEdit: defaultButtonEditRender,
    renderDefault: defaultButtonEditRender,
    renderItem: defaultButtonItemRender
  },
  Buttons: {
    renderEdit: defaultButtonsEditRender,
    renderDefault: defaultButtonsEditRender,
    renderItem: defaultButtonsItemRender
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
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImluZGV4LnRzIl0sIm5hbWVzIjpbImlzRW1wdHlWYWx1ZSIsImNlbGxWYWx1ZSIsInVuZGVmaW5lZCIsImdldEZvcm1hdERhdGUiLCJ2YWx1ZSIsInByb3BzIiwiZGVmYXVsdEZvcm1hdCIsIlhFVXRpbHMiLCJ0b0RhdGVTdHJpbmciLCJmb3JtYXQiLCJnZXRGb3JtYXREYXRlcyIsInZhbHVlcyIsInNlcGFyYXRvciIsIm1hcCIsImRhdGUiLCJqb2luIiwiZXF1YWxEYXRlcmFuZ2UiLCJkYXRhIiwibWF0Y2hDYXNjYWRlckRhdGEiLCJpbmRleCIsImxpc3QiLCJsYWJlbHMiLCJ2YWwiLCJsZW5ndGgiLCJlYWNoIiwiaXRlbSIsInB1c2giLCJsYWJlbCIsImNoaWxkcmVuIiwiZ2V0UHJvcHMiLCJkZWZhdWx0UHJvcHMiLCIkdGFibGUiLCJhc3NpZ24iLCJ2U2l6ZSIsInNpemUiLCJnZXRDZWxsRXZlbnRzIiwicmVuZGVyT3B0cyIsInBhcmFtcyIsImV2ZW50cyIsInR5cGUiLCJvbiIsImV2bnQiLCJ1cGRhdGVTdGF0dXMiLCJvYmplY3RNYXAiLCJjYiIsImFyZ3MiLCJhcHBseSIsImNvbmNhdCIsImdldFNlbGVjdENlbGxWYWx1ZSIsIm9wdGlvbnMiLCJvcHRpb25Hcm91cHMiLCJvcHRpb25Qcm9wcyIsIm9wdGlvbkdyb3VwUHJvcHMiLCJyb3ciLCJjb2x1bW4iLCJsYWJlbFByb3AiLCJ2YWx1ZVByb3AiLCJncm91cE9wdGlvbnMiLCJnZXQiLCJwcm9wZXJ0eSIsImNvbGlkIiwiaWQiLCJyZXN0IiwiY2VsbERhdGEiLCJmaWx0ZXJhYmxlIiwiZnVsbEFsbERhdGFSb3dNYXAiLCJjYWNoZUNlbGwiLCJoYXMiLCJtdWx0aXBsZSIsInNlbGVjdEl0ZW0iLCJmaW5kIiwiY2VsbExhYmVsIiwiZ2V0Q2FzY2FkZXJDZWxsVmFsdWUiLCJnZXREYXRlUGlja2VyQ2VsbFZhbHVlIiwiY3JlYXRlRWRpdFJlbmRlciIsImgiLCJhdHRycyIsIm5hbWUiLCJtb2RlbCIsImNhbGxiYWNrIiwic2V0IiwiZGVmYXVsdEJ1dHRvbkVkaXRSZW5kZXIiLCJjZWxsVGV4dCIsImNvbnRlbnQiLCJkZWZhdWx0QnV0dG9uc0VkaXRSZW5kZXIiLCJjaGlsZFJlbmRlck9wdHMiLCJnZXRGaWx0ZXJFdmVudHMiLCJjcmVhdGVGaWx0ZXJSZW5kZXIiLCJmaWx0ZXJzIiwib3B0aW9uVmFsdWUiLCJoYW5kbGVDb25maXJtRmlsdGVyIiwiY2hlY2tlZCIsIiRwYW5lbCIsImNvbnRleHQiLCJmaWx0ZXJNdWx0aXBsZSIsImRlZmF1bHRGaWx0ZXJNZXRob2QiLCJvcHRpb24iLCJyZW5kZXJPcHRpb25zIiwiZGlzYWJsZWRQcm9wIiwiZGlzYWJsZWQiLCJrZXkiLCJjcmVhdGVGb3JtSXRlbVJlbmRlciIsImdldEZvcm1JdGVtUHJvcHMiLCJnZXRGb3JtRXZlbnRzIiwiZGVmYXVsdEJ1dHRvbkl0ZW1SZW5kZXIiLCJkZWZhdWx0QnV0dG9uc0l0ZW1SZW5kZXIiLCIkZm9ybSIsImNyZWF0ZUV4cG9ydE1ldGhvZCIsInZhbHVlTWV0aG9kIiwiaXNFZGl0IiwicmVuZGVyUHJvcGVydHkiLCJjcmVhdGVGb3JtSXRlbVJhZGlvQW5kQ2hlY2tib3hSZW5kZXIiLCJyZW5kZXJNYXAiLCJJbnB1dCIsImF1dG9mb2N1cyIsInJlbmRlckRlZmF1bHQiLCJyZW5kZXJFZGl0IiwicmVuZGVyRmlsdGVyIiwiZmlsdGVyTWV0aG9kIiwicmVuZGVySXRlbSIsIkF1dG9Db21wbGV0ZSIsIklucHV0TnVtYmVyIiwiU2VsZWN0IiwidHJhbnNmZXIiLCJncm91cExhYmVsIiwiZ3JvdXAiLCJnSW5kZXgiLCJyZW5kZXJDZWxsIiwiZmlsdGVyUmVuZGVyIiwiaXNBcnJheSIsImluY2x1ZGVBcnJheXMiLCJpbmRleE9mIiwiY2VsbEV4cG9ydE1ldGhvZCIsImVkaXRDZWxsRXhwb3J0TWV0aG9kIiwiQ2FzY2FkZXIiLCJEYXRlUGlja2VyIiwiVGltZVBpY2tlciIsIlJhdGUiLCJpU3dpdGNoIiwiUmFkaW8iLCJDaGVja2JveCIsIkJ1dHRvbiIsIkJ1dHRvbnMiLCJoYW5kbGVDbGVhckV2ZW50IiwiZ2V0RXZlbnRUYXJnZXROb2RlIiwiYm9keUVsZW0iLCJkb2N1bWVudCIsImJvZHkiLCJmbGFnIiwiVlhFVGFibGVQbHVnaW5JVmlldyIsImluc3RhbGwiLCJ4dGFibGUiLCJpbnRlcmNlcHRvciIsInJlbmRlcmVyIiwibWl4aW4iLCJhZGQiLCJ3aW5kb3ciLCJWWEVUYWJsZSIsInVzZSJdLCJtYXBwaW5ncyI6Ijs7Ozs7OztBQUFBOzs7Ozs7QUFHQSxTQUFTQSxZQUFULENBQXVCQyxTQUF2QixFQUFxQztBQUNuQyxTQUFPQSxTQUFTLEtBQUssSUFBZCxJQUFzQkEsU0FBUyxLQUFLQyxTQUFwQyxJQUFpREQsU0FBUyxLQUFLLEVBQXRFO0FBQ0Q7O0FBRUQsU0FBU0UsYUFBVCxDQUF3QkMsS0FBeEIsRUFBb0NDLEtBQXBDLEVBQWdEQyxhQUFoRCxFQUFxRTtBQUNuRSxTQUFPQyxvQkFBUUMsWUFBUixDQUFxQkosS0FBckIsRUFBNEJDLEtBQUssQ0FBQ0ksTUFBTixJQUFnQkgsYUFBNUMsQ0FBUDtBQUNEOztBQUVELFNBQVNJLGNBQVQsQ0FBeUJDLE1BQXpCLEVBQXNDTixLQUF0QyxFQUFrRE8sU0FBbEQsRUFBcUVOLGFBQXJFLEVBQTBGO0FBQ3hGLFNBQU9DLG9CQUFRTSxHQUFSLENBQVlGLE1BQVosRUFBb0IsVUFBQ0csSUFBRDtBQUFBLFdBQWVYLGFBQWEsQ0FBQ1csSUFBRCxFQUFPVCxLQUFQLEVBQWNDLGFBQWQsQ0FBNUI7QUFBQSxHQUFwQixFQUE4RVMsSUFBOUUsQ0FBbUZILFNBQW5GLENBQVA7QUFDRDs7QUFFRCxTQUFTSSxjQUFULENBQXlCZixTQUF6QixFQUF5Q2dCLElBQXpDLEVBQW9EWixLQUFwRCxFQUFnRUMsYUFBaEUsRUFBcUY7QUFDbkZMLEVBQUFBLFNBQVMsR0FBR0UsYUFBYSxDQUFDRixTQUFELEVBQVlJLEtBQVosRUFBbUJDLGFBQW5CLENBQXpCO0FBQ0EsU0FBT0wsU0FBUyxJQUFJRSxhQUFhLENBQUNjLElBQUks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RyxHQUFaLENBQWdCLG1CQUFoQixFQUFxQ1osZ0JBQXJDO0FBQ0FTLElBQUFBLFdBQVcsQ0FBQ0csR0FBWixDQUFnQixvQkFBaEIsRUFBc0NaLGdCQUF0QztBQUNEO0FBTmdDLENBQTVCOzs7QUFTUCxJQUFJLE9BQU9hLE1BQVAsS0FBa0IsV0FBbEIsSUFBaUNBLE1BQU0sQ0FBQ0MsUUFBNUMsRUFBc0Q7QUFDcERELEVBQUFBLE1BQU0sQ0FBQ0MsUUFBUCxDQUFnQkMsR0FBaEIsQ0FBb0JULG1CQUFwQjtBQUNEOztlQUVjQSxtQiIsImZpbGUiOiJpbmRleC5jb21tb24uanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgWEVVdGlscyBmcm9tICd4ZS11dGlscy9tZXRob2RzL3hlLXV0aWxzJ1xyXG5pbXBvcnQgVlhFVGFibGUgZnJvbSAndnhlLXRhYmxlL2xpYi92eGUtdGFibGUnXHJcblxyXG5mdW5jdGlvbiBpc0VtcHR5VmFsdWUgKGNlbGxWYWx1ZTogYW55KSB7XHJcbiAgcmV0dXJuIGNlbGxWYWx1ZSA9PT0gbnVsbCB8fCBjZWxsVmFsdWUgPT09IHVuZGVmaW5lZCB8fCBjZWxsVmFsdWUgPT09ICcnXHJcbn1cclxuXHJcbmZ1bmN0aW9uIGdldEZvcm1hdERhdGUgKHZhbHVlOiBhbnksIHByb3BzOiBhbnksIGRlZmF1bHRGb3JtYXQ6IHN0cmluZykge1xyXG4gIHJldHVybiBYRVV0aWxzLnRvRGF0ZVN0cmluZyh2YWx1ZSwgcHJvcHMuZm9ybWF0IHx8IGRlZmF1bHRGb3JtYXQpXHJcbn1cclxuXHJcbmZ1bmN0aW9uIGdldEZvcm1hdERhdGVzICh2YWx1ZXM6IGFueSwgcHJvcHM6IGFueSwgc2VwYXJhdG9yOiBzdHJpbmcsIGRlZmF1bHRGb3JtYXQ6IHN0cmluZykge1xyXG4gIHJldHVybiBYRVV0aWxzLm1hcCh2YWx1ZXMsIChkYXRlOiBhbnkpID0+IGdldEZvcm1hdERhdGUoZGF0ZSwgcHJvcHMsIGRlZmF1bHRGb3JtYXQpKS5qb2luKHNlcGFyYXRvcilcclxufVxyXG5cclxuZnVuY3Rpb24gZXF1YWxEYXRlcmFuZ2UgKGNlbGxWYWx1ZTogYW55LCBkYXRhOiBhbnksIHByb3BzOiBhbnksIGRlZmF1bHRGb3JtYXQ6IHN0cmluZykge1xyXG4gIGNlbGxWYWx1ZSA9IGdldEZvcm1hdERhdGUoY2VsbFZhbHVlLCBwcm9wcywgZGVmYXVsdEZvcm1hdClcclxuICByZXR1cm4gY2VsbFZhbHVlID49IGdldEZvcm1hdERhdGUoZGF0YVswXSwgcHJvcHMsIGRlZmF1bHRGb3JtYXQpICYmIGNlbGxWYWx1ZSA8PSBnZXRGb3JtYXREYXRlKGRhdGFbMV0sIHByb3BzLCBkZWZhdWx0Rm9ybWF0KVxyXG59XHJcblxyXG5mdW5jdGlvbiBtYXRjaENhc2NhZGVyRGF0YSAoaW5kZXg6IG51bWJlciwgbGlzdDogQXJyYXk8YW55PiwgdmFsdWVzOiBBcnJheTxhbnk+LCBsYWJlbHM6IEFycmF5PGFueT4pIHtcclxuICBsZXQgdmFsID0gdmFsdWVzW2luZGV4XVxyXG4gIGlmIChsaXN0ICYmIHZhbHVlcy5sZW5ndGggPiBpbmRleCkge1xyXG4gICAgWEVVdGlscy5lYWNoKGxpc3QsIChpdGVtOiBhbnkpID0+IHtcclxuICAgICAgaWYgKGl0ZW0udmFsdWUgPT09IHZhbCkge1xyXG4gICAgICAgIGxhYmVscy5wdXNoKGl0ZW0ubGFiZWwpXHJcbiAgICAgICAgbWF0Y2hDYXNjYWRlckRhdGEoKytpbmRleCwgaXRlbS5jaGlsZHJlbiwgdmFsdWVzLCBsYWJlbHMpXHJcbiAgICAgIH1cclxuICAgIH0pXHJcbiAgfVxyXG59XHJcblxyXG5mdW5jdGlvbiBnZXRQcm9wcyAoeyAkdGFibGUgfTogYW55LCB7IHByb3BzIH06IGFueSwgZGVmYXVsdFByb3BzPzogYW55KSB7XHJcbiAgcmV0dXJuIFhFVXRpbHMuYXNzaWduKCR0YWJsZS52U2l6ZSA/IHsgc2l6ZTogJHRhYmxlLnZTaXplIH0gOiB7fSwgZGVmYXVsdFByb3BzLCBwcm9wcylcclxufVxyXG5cclxuZnVuY3Rpb24gZ2V0Q2VsbEV2ZW50cyAocmVuZGVyT3B0czogYW55LCBwYXJhbXM6IGFueSkge1xyXG4gIGxldCB7IGV2ZW50cyB9ID0gcmVuZGVyT3B0c1xyXG4gIGxldCB7ICR0YWJsZSB9ID0gcGFyYW1zXHJcbiAgbGV0IHR5cGUgPSAnb24tY2hhbmdlJ1xyXG4gIGxldCBvbiA9IHtcclxuICAgIFt0eXBlXTogKGV2bnQ6IGFueSkgPT4ge1xyXG4gICAgICAkdGFibGUudXBkYXRlU3RhdHVzKHBhcmFtcylcclxuICAgICAgaWYgKGV2ZW50cyAmJiBldmVudHNbdHlwZV0pIHtcclxuICAgICAgICBldmVudHNbdHlwZV0ocGFyYW1zLCBldm50KVxyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgfVxyXG4gIGlmIChldmVudHMpIHtcclxuICAgIHJldHVybiBYRVV0aWxzLmFzc2lnbih7fSwgWEVVdGlscy5vYmplY3RNYXAoZXZlbnRzLCAoY2I6IEZ1bmN0aW9uKSA9PiBmdW5jdGlvbiAoLi4uYXJnczogYW55W10pIHtcclxuICAgICAgY2IuYXBwbHkobnVsbCwgW3BhcmFtc10uY29uY2F0LmFwcGx5KHBhcmFtcywgYXJncykpXHJcbiAgICB9KSwgb24pXHJcbiAgfVxyXG4gIHJldHVybiBvblxyXG59XHJcblxyXG5mdW5jdGlvbiBnZXRTZWxlY3RDZWxsVmFsdWUgKHJlbmRlck9wdHM6IGFueSwgcGFyYW1zOiBhbnkpIHtcclxuICBsZXQgeyBvcHRpb25zLCBvcHRpb25Hcm91cHMsIHByb3BzID0ge30sIG9wdGlvblByb3BzID0ge30sIG9wdGlvbkdyb3VwUHJvcHMgPSB7fSB9ID0gcmVuZGVyT3B0c1xyXG4gIGxldCB7ICR0YWJsZSwgcm93LCBjb2x1bW4gfSA9IHBhcmFtc1xyXG4gIGxldCBsYWJlbFByb3AgPSBvcHRpb25Qcm9wcy5sYWJlbCB8fCAnbGFiZWwnXHJcbiAgbGV0IHZhbHVlUHJvcCA9IG9wdGlvblByb3BzLnZhbHVlIHx8ICd2YWx1ZSdcclxuICBsZXQgZ3JvdXBPcHRpb25zID0gb3B0aW9uR3JvdXBQcm9wcy5vcHRpb25zIHx8ICdvcHRpb25zJ1xyXG4gIGxldCBjZWxsVmFsdWUgPSBYRVV0aWxzLmdldChyb3csIGNvbHVtbi5wcm9wZXJ0eSlcclxuICBsZXQgY29saWQ6IHN0cmluZyA9IGNvbHVtbi5pZFxyXG4gIGxldCByZXN0OiBhbnlcclxuICBsZXQgY2VsbERhdGE6IGFueVxyXG4gIGlmIChwcm9wcy5maWx0ZXJhYmxlKSB7XHJcbiAgICBsZXQgZnVsbEFsbERhdGFSb3dNYXA6IE1hcDxhbnksIGFueT4gPSAkdGFibGUuZnVsbEFsbERhdGFSb3dNYXBcclxuICAgIGxldCBjYWNoZUNlbGw6IGFueSA9IGZ1bGxBbGxEYXRhUm93TWFwLmhhcyhyb3cpXHJcbiAgICBpZiAoY2FjaGVDZWxsKSB7XHJcbiAgICAgIHJlc3QgPSBmdWxsQWxsRGF0YVJvd01hcC5nZXQocm93KVxyXG4gICAgICBjZWxsRGF0YSA9IHJlc3QuY2VsbERhdGFcclxuICAgICAgaWYgKCFjZWxsRGF0YSkge1xyXG4gICAgICAgIGNlbGxEYXRhID0gZnVsbEFsbERhdGFSb3dNYXAuZ2V0KHJvdykuY2VsbERhdGEgPSB7fVxyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgICBpZiAocmVzdCAmJiBjZWxsRGF0YVtjb2xpZF0gJiYgY2VsbERhdGFbY29saWRdLnZhbHVlID09PSBjZWxsVmFsdWUpIHtcclxuICAgICAgcmV0dXJuIGNlbGxEYXRhW2NvbGlkXS5sYWJlbFxyXG4gICAgfVxyXG4gIH1cclxuICBpZiAoIWlzRW1wdHlWYWx1ZShjZWxsVmFsdWUpKSB7XHJcbiAgICByZXR1cm4gWEVVdGlscy5tYXAocHJvcHMubXVsdGlwbGUgPyBjZWxsVmFsdWUgOiBbY2VsbFZhbHVlXSwgb3B0aW9uR3JvdXBzID8gKHZhbHVlOiBhbnkpID0+IHtcclxuICAgICAgbGV0IHNlbGVjdEl0ZW1cclxuICAgICAgZm9yIChsZXQgaW5kZXggPSAwOyBpbmRleCA8IG9wdGlvbkdyb3Vwcy5sZW5ndGg7IGluZGV4KyspIHtcclxuICAgICAgICBzZWxlY3RJdGVtID0gWEVVdGlscy5maW5kKG9wdGlvbkdyb3Vwc1tpbmRleF1bZ3JvdXBPcHRpb25zXSwgKGl0ZW06IGFueSkgPT4gaXRlbVt2YWx1ZVByb3BdID09PSB2YWx1ZSlcclxuICAgICAgICBpZiAoc2VsZWN0SXRlbSkge1xyXG4gICAgICAgICAgYnJlYWtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgICAgbGV0IGNlbGxMYWJlbDogYW55ID0gc2VsZWN0SXRlbSA/IHNlbGVjdEl0ZW1bbGFiZWxQcm9wXSA6IHZhbHVlXHJcbiAgICAgIGlmIChjZWxsRGF0YSAmJiBvcHRpb25zICYmIG9wdGlvbnMubGVuZ3RoKSB7XHJcbiAgICAgICAgY2VsbERhdGFbY29saWRdID0geyB2YWx1ZTogY2VsbFZhbHVlLCBsYWJlbDogY2VsbExhYmVsIH1cclxuICAgICAgfVxyXG4gICAgICByZXR1cm4gY2VsbExhYmVsXHJcbiAgICB9IDogKHZhbHVlOiBhbnkpID0+IHtcclxuICAgICAgbGV0IHNlbGVjdEl0ZW0gPSBYRVV0aWxzLmZpbmQob3B0aW9ucywgKGl0ZW06IGFueSkgPT4gaXRlbVt2YWx1ZVByb3BdID09PSB2YWx1ZSlcclxuICAgICAgbGV0IGNlbGxMYWJlbDogYW55ID0gc2VsZWN0SXRlbSA/IHNlbGVjdEl0ZW1bbGFiZWxQcm9wXSA6IHZhbHVlXHJcbiAgICAgIGlmIChjZWxsRGF0YSAmJiBvcHRpb25zICYmIG9wdGlvbnMubGVuZ3RoKSB7XHJcbiAgICAgICAgY2VsbERhdGFbY29saWRdID0geyB2YWx1ZTogY2VsbFZhbHVlLCBsYWJlbDogY2VsbExhYmVsIH1cclxuICAgICAgfVxyXG4gICAgICByZXR1cm4gY2VsbExhYmVsXHJcbiAgICB9KS5qb2luKCc7JylcclxuICB9XHJcbiAgcmV0dXJuIG51bGxcclxufVxyXG5cclxuZnVuY3Rpb24gZ2V0Q2FzY2FkZXJDZWxsVmFsdWUgKHJlbmRlck9wdHM6IGFueSwgcGFyYW1zOiBhbnkpIHtcclxuICBsZXQgeyBwcm9wcyA9IHt9IH0gPSByZW5kZXJPcHRzXHJcbiAgbGV0IHsgcm93LCBjb2x1bW4gfSA9IHBhcmFtc1xyXG4gIGxldCBjZWxsVmFsdWUgPSBYRVV0aWxzLmdldChyb3csIGNvbHVtbi5wcm9wZXJ0eSlcclxuICBsZXQgdmFsdWVzID0gY2VsbFZhbHVlIHx8IFtdXHJcbiAgbGV0IGxhYmVsczogQXJyYXk8YW55PiA9IFtdXHJcbiAgbWF0Y2hDYXNjYWRlckRhdGEoMCwgcHJvcHMuZGF0YSwgdmFsdWVzLCBsYWJlbHMpXHJcbiAgcmV0dXJuIGxhYmVscy5qb2luKGAgJHtwcm9wcy5zZXBhcmF0b3IgfHwgJy8nfSBgKVxyXG59XHJcblxyXG5mdW5jdGlvbiBnZXREYXRlUGlja2VyQ2VsbFZhbHVlIChyZW5kZXJPcHRzOiBhbnksIHBhcmFtczogYW55KSB7XHJcbiAgbGV0IHsgcHJvcHMgPSB7fSB9ID0gcmVuZGVyT3B0c1xyXG4gIGxldCB7IHJvdywgY29sdW1uIH0gPSBwYXJhbXNcclxuICBsZXQgeyBzZXBhcmF0b3IgfSA9IHByb3BzXHJcbiAgbGV0IGNlbGxWYWx1ZSA9IFhFVXRpbHMuZ2V0KHJvdywgY29sdW1uLnByb3BlcnR5KVxyXG4gIHN3aXRjaCAocHJvcHMudHlwZSkge1xyXG4gICAgY2FzZSAnd2Vlayc6XHJcbiAgICAgIGNlbGxWYWx1ZSA9IGdldEZvcm1hdERhdGUoY2VsbFZhbHVlLCBwcm9wcywgJ3l5eXl3V1cnKVxyXG4gICAgICBicmVha1xyXG4gICAgY2FzZSAnbW9udGgnOlxyXG4gICAgICBjZWxsVmFsdWUgPSBnZXRGb3JtYXREYXRlKGNlbGxWYWx1ZSwgcHJvcHMsICd5eXl5LU1NJylcclxuICAgICAgYnJlYWtcclxuICAgIGNhc2UgJ3llYXInOlxyXG4gICAgICBjZWxsVmFsdWUgPSBnZXRGb3JtYXREYXRlKGNlbGxWYWx1ZSwgcHJvcHMsICd5eXl5JylcclxuICAgICAgYnJlYWtcclxuICAgIGNhc2UgJ2RhdGVzJzpcclxuICAgICAgY2VsbFZhbHVlID0gZ2V0Rm9ybWF0RGF0ZXMoY2VsbFZhbHVlLCBwcm9wcywgJywgJywgJ3l5eXktTU0tZGQnKVxyXG4gICAgICBicmVha1xyXG4gICAgY2FzZSAnZGF0ZXJhbmdlJzpcclxuICAgICAgY2VsbFZhbHVlID0gZ2V0Rm9ybWF0RGF0ZXMoY2VsbFZhbHVlLCBwcm9wcywgYCAke3NlcGFyYXRvciB8fCAnLSd9IGAsICd5eXl5LU1NLWRkJylcclxuICAgICAgYnJlYWtcclxuICAgIGNhc2UgJ2RhdGV0aW1lcmFuZ2UnOlxyXG4gICAgICBjZWxsVmFsdWUgPSBnZXRGb3JtYXREYXRlcyhjZWxsVmFsdWUsIHByb3BzLCBgICR7c2VwYXJhdG9yIHx8ICctJ30gYCwgJ3l5eXktTU0tZGQgSEg6c3M6bW0nKVxyXG4gICAgICBicmVha1xyXG4gICAgZGVmYXVsdDpcclxuICAgICAgY2VsbFZhbHVlID0gZ2V0Rm9ybWF0RGF0ZShjZWxsVmFsdWUsIHByb3BzLCAneXl5eS1NTS1kZCcpXHJcbiAgICAgIGJyZWFrXHJcbiAgfVxyXG4gIHJldHVybiBjZWxsVmFsdWVcclxufVxyXG5cclxuZnVuY3Rpb24gY3JlYXRlRWRpdFJlbmRlciAoZGVmYXVsdFByb3BzPzogYW55KSB7XHJcbiAgcmV0dXJuIGZ1bmN0aW9uIChoOiBGdW5jdGlvbiwgcmVuZGVyT3B0czogYW55LCBwYXJhbXM6IGFueSkge1xyXG4gICAgbGV0IHsgcm93LCBjb2x1bW4gfSA9IHBhcmFtc1xyXG4gICAgbGV0IHsgYXR0cnMgfSA9IHJlbmRlck9wdHNcclxuICAgIGxldCBwcm9wcyA9IGdldFByb3BzKHBhcmFtcywgcmVuZGVyT3B0cywgZGVmYXVsdFByb3BzKVxyXG4gICAgcmV0dXJuIFtcclxuICAgICAgaChyZW5kZXJPcHRzLm5hbWUsIHtcclxuICAgICAgICBwcm9wcyxcclxuICAgICAgICBhdHRycyxcclxuICAgICAgICBtb2RlbDoge1xyXG4gICAgICAgICAgdmFsdWU6IFhFVXRpbHMuZ2V0KHJvdywgY29sdW1uLnByb3BlcnR5KSxcclxuICAgICAgICAgIGNhbGxiYWNrICh2YWx1ZTogYW55KSB7XHJcbiAgICAgICAgICAgIFhFVXRpbHMuc2V0KHJvdywgY29sdW1uLnByb3BlcnR5LCB2YWx1ZSlcclxuICAgICAgICAgIH1cclxuICAgICAgICB9LFxyXG4gICAgICAgIG9uOiBnZXRDZWxsRXZlbnRzKHJlbmRlck9wdHMsIHBhcmFtcylcclxuICAgICAgfSlcclxuICAgIF1cclxuICB9XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGRlZmF1bHRCdXR0b25FZGl0UmVuZGVyIChoOiBGdW5jdGlvbiwgcmVuZGVyT3B0czogYW55LCBwYXJhbXM6IGFueSkge1xyXG4gIGNvbnN0IHsgYXR0cnMgfSA9IHJlbmRlck9wdHNcclxuICBjb25zdCBwcm9wczogYW55ID0gZ2V0UHJvcHMocGFyYW1zLCByZW5kZXJPcHRzKVxyXG4gIHJldHVybiBbXHJcbiAgICBoKCdCdXR0b24nLCB7XHJcbiAgICAgIGF0dHJzLFxyXG4gICAgICBwcm9wcyxcclxuICAgICAgb246IGdldENlbGxFdmVudHMocmVuZGVyT3B0cywgcGFyYW1zKVxyXG4gICAgfSwgY2VsbFRleHQoaCwgcmVuZGVyT3B0cy5jb250ZW50KSlcclxuICBdXHJcbn1cclxuXHJcbmZ1bmN0aW9uIGRlZmF1bHRCdXR0b25zRWRpdFJlbmRlciAoaDogRnVuY3Rpb24sIHJlbmRlck9wdHM6IGFueSwgcGFyYW1zOiBhbnkpIHtcclxuICByZXR1cm4gcmVuZGVyT3B0cy5jaGlsZHJlbi5tYXAoKGNoaWxkUmVuZGVyT3B0czogYW55KSA9PiBkZWZhdWx0QnV0dG9uRWRpdFJlbmRlcihoLCBjaGlsZFJlbmRlck9wdHMsIHBhcmFtcylbMF0pXHJcbn1cclxuXHJcbmZ1bmN0aW9uIGdldEZpbHRlckV2ZW50cyAob246IGFueSwgcmVuZGVyT3B0czogYW55LCBwYXJhbXM6IGFueSkge1xyXG4gIGxldCB7IGV2ZW50cyB9ID0gcmVuZGVyT3B0c1xyXG4gIGlmIChldmVudHMpIHtcclxuICAgIHJldHVybiBYRVV0aWxzLmFzc2lnbih7fSwgWEVVdGlscy5vYmplY3RNYXAoZXZlbnRzLCAoY2I6IEZ1bmN0aW9uKSA9PiBmdW5jdGlvbiAoLi4uYXJnczogYW55W10pIHtcclxuICAgICAgY2IuYXBwbHkobnVsbCwgW3BhcmFtc10uY29uY2F0KGFyZ3MpKVxyXG4gICAgfSksIG9uKVxyXG4gIH1cclxuICByZXR1cm4gb25cclxufVxyXG5cclxuZnVuY3Rpb24gY3JlYXRlRmlsdGVyUmVuZGVyIChkZWZhdWx0UHJvcHM/OiBhbnkpIHtcclxuICByZXR1cm4gZnVuY3Rpb24gKGg6IEZ1bmN0aW9uLCByZW5kZXJPcHRzOiBhbnksIHBhcmFtczogYW55KSB7XHJcbiAgICBsZXQgeyBjb2x1bW4gfSA9IHBhcmFtc1xyXG4gICAgbGV0IHsgbmFtZSwgYXR0cnMsIGV2ZW50cyB9ID0gcmVuZGVyT3B0c1xyXG4gICAgbGV0IHR5cGUgPSAnb24tY2hhbmdlJ1xyXG4gICAgbGV0IHByb3BzID0gZ2V0UHJvcHMocGFyYW1zLCByZW5kZXJPcHRzKVxyXG4gICAgcmV0dXJuIGNvbHVtbi5maWx0ZXJzLm1hcCgoaXRlbTogYW55KSA9PiB7XHJcbiAgICAgIHJldHVybiBoKG5hbWUsIHtcclxuICAgICAgICBwcm9wcyxcclxuICAgICAgICBhdHRycyxcclxuICAgICAgICBtb2RlbDoge1xyXG4gICAgICAgICAgdmFsdWU6IGl0ZW0uZGF0YSxcclxuICAgICAgICAgIGNhbGxiYWNrIChvcHRpb25WYWx1ZTogYW55KSB7XHJcbiAgICAgICAgICAgIGl0ZW0uZGF0YSA9IG9wdGlvblZhbHVlXHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfSxcclxuICAgICAgICBvbjogZ2V0RmlsdGVyRXZlbnRzKHtcclxuICAgICAgICAgIFt0eXBlXSAoZXZudDogYW55KSB7XHJcbiAgICAgICAgICAgIGhhbmRsZUNvbmZpcm1GaWx0ZXIocGFyYW1zLCBjb2x1bW4sICEhaXRlbS5kYXRhLCBpdGVtKVxyXG4gICAgICAgICAgICBpZiAoZXZlbnRzICYmIGV2ZW50c1t0eXBlXSkge1xyXG4gICAgICAgICAgICAgIGV2ZW50c1t0eXBlXShwYXJhbXMsIGV2bnQpXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgIH1cclxuICAgICAgICB9LCByZW5kZXJPcHRzLCBwYXJhbXMpXHJcbiAgICAgIH0pXHJcbiAgICB9KVxyXG4gIH1cclxufVxyXG5cclxuZnVuY3Rpb24gaGFuZGxlQ29uZmlybUZpbHRlciAocGFyYW1zOiBhbnksIGNvbHVtbjogYW55LCBjaGVja2VkOiBhbnksIGl0ZW06IGFueSkge1xyXG4gIGNvbnN0ICRwYW5lbCA9IHBhcmFtcy4kcGFuZWwgfHwgcGFyYW1zLmNvbnRleHRcclxuICAkcGFuZWxbY29sdW1uLmZpbHRlck11bHRpcGxlID8gJ2NoYW5nZU11bHRpcGxlT3B0aW9uJyA6ICdjaGFuZ2VSYWRpb09wdGlvbiddKHt9LCBjaGVja2VkLCBpdGVtKVxyXG59XHJcblxyXG5mdW5jdGlvbiBkZWZhdWx0RmlsdGVyTWV0aG9kICh7IG9wdGlvbiwgcm93LCBjb2x1bW4gfTogYW55KSB7XHJcbiAgbGV0IHsgZGF0YSB9ID0gb3B0aW9uXHJcbiAgbGV0IGNlbGxWYWx1ZSA9IFhFVXRpbHMuZ2V0KHJvdywgY29sdW1uLnByb3BlcnR5KVxyXG4gIC8qIGVzbGludC1kaXNhYmxlIGVxZXFlcSAqL1xyXG4gIHJldHVybiBjZWxsVmFsdWUgPT09IGRhdGFcclxufVxyXG5cclxuZnVuY3Rpb24gcmVuZGVyT3B0aW9ucyAoaDogRnVuY3Rpb24sIG9wdGlvbnM6IGFueSwgb3B0aW9uUHJvcHM6IGFueSkge1xyXG4gIGxldCBsYWJlbFByb3AgPSBvcHRpb25Qcm9wcy5sYWJlbCB8fCAnbGFiZWwnXHJcbiAgbGV0IHZhbHVlUHJvcCA9IG9wdGlvblByb3BzLnZhbHVlIHx8ICd2YWx1ZSdcclxuICBsZXQgZGlzYWJsZWRQcm9wID0gb3B0aW9uUHJvcHMuZGlzYWJsZWQgfHwgJ2Rpc2FibGVkJ1xyXG4gIHJldHVybiBYRVV0aWxzLm1hcChvcHRpb25zLCAoaXRlbTogYW55LCBpbmRleDogbnVtYmVyKSA9PiB7XHJcbiAgICByZXR1cm4gaCgnT3B0aW9uJywge1xyXG4gICAgICBwcm9wczoge1xyXG4gICAgICAgIHZhbHVlOiBpdGVtW3ZhbHVlUHJvcF0sXHJcbiAgICAgICAgbGFiZWw6IGl0ZW1bbGFiZWxQcm9wXSxcclxuICAgICAgICBkaXNhYmxlZDogaXRlbVtkaXNhYmxlZFByb3BdXHJcbiAgICAgIH0sXHJcbiAgICAgIGtleTogaW5kZXhcclxuICAgIH0pXHJcbiAgfSlcclxufVxyXG5cclxuZnVuY3Rpb24gY2VsbFRleHQgKGg6IEZ1bmN0aW9uLCBjZWxsVmFsdWU6IGFueSkge1xyXG4gIHJldHVybiBbJycgKyAoaXNFbXB0eVZhbHVlKGNlbGxWYWx1ZSkgPyAnJyA6IGNlbGxWYWx1ZSldXHJcbn1cclxuXHJcbmZ1bmN0aW9uIGNyZWF0ZUZvcm1JdGVtUmVuZGVyIChkZWZhdWx0UHJvcHM/OiBhbnkpIHtcclxuICByZXR1cm4gZnVuY3Rpb24gKGg6IEZ1bmN0aW9uLCByZW5kZXJPcHRzOiBhbnksIHBhcmFtczogYW55KSB7XHJcbiAgICBsZXQgeyBkYXRhLCBwcm9wZXJ0eSB9ID0gcGFyYW1zXHJcbiAgICBsZXQgeyBuYW1lIH0gPSByZW5kZXJPcHRzXHJcbiAgICBsZXQgeyBhdHRycyB9OiBhbnkgPSByZW5kZXJPcHRzXHJcbiAgICBsZXQgcHJvcHM6IGFueSA9IGdldEZvcm1JdGVtUHJvcHMocGFyYW1zLCByZW5kZXJPcHRzLCBkZWZhdWx0UHJvcHMpXHJcbiAgICByZXR1cm4gW1xyXG4gICAgICBoKG5hbWUsIHtcclxuICAgICAgICBhdHRycyxcclxuICAgICAgICBwcm9wcyxcclxuICAgICAgICBtb2RlbDoge1xyXG4gICAgICAgICAgdmFsdWU6IFhFVXRpbHMuZ2V0KGRhdGEsIHByb3BlcnR5KSxcclxuICAgICAgICAgIGNhbGxiYWNrICh2YWx1ZTogYW55KSB7XHJcbiAgICAgICAgICAgIFhFVXRpbHMuc2V0KGRhdGEsIHByb3BlcnR5LCB2YWx1ZSlcclxuICAgICAgICAgIH1cclxuICAgICAgICB9LFxyXG4gICAgICAgIG9uOiBnZXRGb3JtRXZlbnRzKHJlbmRlck9wdHMsIHBhcmFtcylcclxuICAgICAgfSlcclxuICAgIF1cclxuICB9XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGRlZmF1bHRCdXR0b25JdGVtUmVuZGVyIChoOiBGdW5jdGlvbiwgcmVuZGVyT3B0czogYW55LCBwYXJhbXM6IGFueSkge1xyXG4gIGNvbnN0IHsgYXR0cnMgfSA9IHJlbmRlck9wdHNcclxuICBjb25zdCBwcm9wczogYW55ID0gZ2V0Rm9ybUl0ZW1Qcm9wcyhwYXJhbXMsIHJlbmRlck9wdHMpXHJcbiAgcmV0dXJuIFtcclxuICAgIGgoJ0J1dHRvbicsIHtcclxuICAgICAgYXR0cnMsXHJcbiAgICAgIHByb3BzLFxyXG4gICAgICBvbjogZ2V0Rm9ybUV2ZW50cyhyZW5kZXJPcHRzLCBwYXJhbXMpXHJcbiAgICB9LCBjZWxsVGV4dChoLCBwcm9wcy5jb250ZW50KSlcclxuICBdXHJcbn1cclxuXHJcbmZ1bmN0aW9uIGRlZmF1bHRCdXR0b25zSXRlbVJlbmRlciAoaDogRnVuY3Rpb24sIHJlbmRlck9wdHM6IGFueSwgcGFyYW1zOiBhbnkpIHtcclxuICByZXR1cm4gcmVuZGVyT3B0cy5jaGlsZHJlbi5tYXAoKGNoaWxkUmVuZGVyT3B0czogYW55KSA9PiBkZWZhdWx0QnV0dG9uSXRlbVJlbmRlcihoLCBjaGlsZFJlbmRlck9wdHMsIHBhcmFtcylbMF0pXHJcbn1cclxuXHJcbmZ1bmN0aW9uIGdldEZvcm1JdGVtUHJvcHMgKHsgJGZvcm0gfTogYW55LCB7IHByb3BzIH06IGFueSwgZGVmYXVsdFByb3BzPzogYW55KSB7XHJcbiAgcmV0dXJuIFhFVXRpbHMuYXNzaWduKCRmb3JtLnZTaXplID8geyBzaXplOiAkZm9ybS52U2l6ZSB9IDoge30sIGRlZmF1bHRQcm9wcywgcHJvcHMpXHJcbn1cclxuXHJcbmZ1bmN0aW9uIGdldEZvcm1FdmVudHMgKHJlbmRlck9wdHM6IGFueSwgcGFyYW1zOiBhbnkpIHtcclxuICBsZXQgeyBldmVudHMgfTogYW55ID0gcmVuZGVyT3B0c1xyXG4gIGxldCB7ICRmb3JtIH0gPSBwYXJhbXNcclxuICBsZXQgdHlwZSA9ICdvbi1jaGFuZ2UnXHJcbiAgbGV0IG9uID0ge1xyXG4gICAgW3R5cGVdOiAoZXZudDogYW55KSA9PiB7XHJcbiAgICAgICRmb3JtLnVwZGF0ZVN0YXR1cyhwYXJhbXMpXHJcbiAgICAgIGlmIChldmVudHMgJiYgZXZlbnRzW3R5cGVdKSB7XHJcbiAgICAgICAgZXZlbnRzW3R5cGVdKHBhcmFtcywgZXZudClcclxuICAgICAgfVxyXG4gICAgfVxyXG4gIH1cclxuICBpZiAoZXZlbnRzKSB7XHJcbiAgICByZXR1cm4gWEVVdGlscy5hc3NpZ24oe30sIFhFVXRpbHMub2JqZWN0TWFwKGV2ZW50cywgKGNiOiBGdW5jdGlvbikgPT4gZnVuY3Rpb24gKC4uLmFyZ3M6IGFueVtdKSB7XHJcbiAgICAgIGNiLmFwcGx5KG51bGwsIFtwYXJhbXNdLmNvbmNhdC5hcHBseShwYXJhbXMsIGFyZ3MpKVxyXG4gICAgfSksIG9uKVxyXG4gIH1cclxuICByZXR1cm4gb25cclxufVxyXG5cclxuZnVuY3Rpb24gY3JlYXRlRXhwb3J0TWV0aG9kICh2YWx1ZU1ldGhvZDogRnVuY3Rpb24sIGlzRWRpdD86IGJvb2xlYW4pIHtcclxuICBjb25zdCByZW5kZXJQcm9wZXJ0eSA9IGlzRWRpdCA/ICdlZGl0UmVuZGVyJyA6ICdjZWxsUmVuZGVyJ1xyXG4gIHJldHVybiBmdW5jdGlvbiAocGFyYW1zOiBhbnkpIHtcclxuICAgIHJldHVybiB2YWx1ZU1ldGhvZChwYXJhbXMuY29sdW1uW3JlbmRlclByb3BlcnR5XSwgcGFyYW1zKVxyXG4gIH1cclxufVxyXG5cclxuZnVuY3Rpb24gY3JlYXRlRm9ybUl0ZW1SYWRpb0FuZENoZWNrYm94UmVuZGVyICgpIHtcclxuICByZXR1cm4gZnVuY3Rpb24gKGg6IEZ1bmN0aW9uLCByZW5kZXJPcHRzOiBhbnksIHBhcmFtczogYW55KSB7XHJcbiAgICBsZXQgeyBuYW1lLCBvcHRpb25zLCBvcHRpb25Qcm9wcyA9IHt9IH0gPSByZW5kZXJPcHRzXHJcbiAgICBsZXQgeyBkYXRhLCBwcm9wZXJ0eSB9ID0gcGFyYW1zXHJcbiAgICBsZXQgeyBhdHRycyB9ID0gcmVuZGVyT3B0c1xyXG4gICAgbGV0IHByb3BzOiBhbnkgPSBnZXRGb3JtSXRlbVByb3BzKHBhcmFtcywgcmVuZGVyT3B0cylcclxuICAgIGxldCBsYWJlbFByb3A6IHN0cmluZyA9IG9wdGlvblByb3BzLmxhYmVsIHx8ICdsYWJlbCdcclxuICAgIGxldCB2YWx1ZVByb3A6IHN0cmluZyA9IG9wdGlvblByb3BzLnZhbHVlIHx8ICd2YWx1ZSdcclxuICAgIGxldCBkaXNhYmxlZFByb3A6IHN0cmluZyA9IG9wdGlvblByb3BzLmRpc2FibGVkIHx8ICdkaXNhYmxlZCdcclxuICAgIHJldHVybiBbXHJcbiAgICAgIGgoYCR7bmFtZX1Hcm91cGAsIHtcclxuICAgICAgICBwcm9wcyxcclxuICAgICAgICBhdHRycyxcclxuICAgICAgICBtb2RlbDoge1xyXG4gICAgICAgICAgdmFsdWU6IFhFVXRpbHMuZ2V0KGRhdGEsIHByb3BlcnR5KSxcclxuICAgICAgICAgIGNhbGxiYWNrIChjZWxsVmFsdWU6IGFueSkge1xyXG4gICAgICAgICAgICBYRVV0aWxzLnNldChkYXRhLCBwcm9wZXJ0eSwgY2VsbFZhbHVlKVxyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgb246IGdldEZvcm1FdmVudHMocmVuZGVyT3B0cywgcGFyYW1zKVxyXG4gICAgICB9LCBvcHRpb25zLm1hcCgob3B0aW9uOiBhbnkpID0+IHtcclxuICAgICAgICByZXR1cm4gaChuYW1lLCB7XHJcbiAgICAgICAgICBwcm9wczoge1xyXG4gICAgICAgICAgICBsYWJlbDogb3B0aW9uW3ZhbHVlUHJvcF0sXHJcbiAgICAgICAgICAgIGRpc2FibGVkOiBvcHRpb25bZGlzYWJsZWRQcm9wXVxyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH0sIG9wdGlvbltsYWJlbFByb3BdKVxyXG4gICAgICB9KSlcclxuICAgIF1cclxuICB9XHJcbn1cclxuXHJcbi8qKlxyXG4gKiDmuLLmn5Plh73mlbBcclxuICovXHJcbmNvbnN0IHJlbmRlck1hcDogYW55ID0ge1xyXG4gIElucHV0OiB7XHJcbiAgICBhdXRvZm9jdXM6ICdpbnB1dC5pdnUtaW5wdXQnLFxyXG4gICAgcmVuZGVyRGVmYXVsdDogY3JlYXRlRWRpdFJlbmRlcigpLFxyXG4gICAgcmVuZGVyRWRpdDogY3JlYXRlRWRpdFJlbmRlcigpLFxyXG4gICAgcmVuZGVyRmlsdGVyOiBjcmVhdGVGaWx0ZXJSZW5kZXIoKSxcclxuICAgIGZpbHRlck1ldGhvZDogZGVmYXVsdEZpbHRlck1ldGhvZCxcclxuICAgIHJlbmRlckl0ZW06IGNyZWF0ZUZvcm1JdGVtUmVuZGVyKClcclxuICB9LFxyXG4gIEF1dG9Db21wbGV0ZToge1xyXG4gICAgYXV0b2ZvY3VzOiAnaW5wdXQuaXZ1LWlucHV0JyxcclxuICAgIHJlbmRlckRlZmF1bHQ6IGNyZWF0ZUVkaXRSZW5kZXIoKSxcclxuICAgIHJlbmRlckVkaXQ6IGNyZWF0ZUVkaXRSZW5kZXIoKSxcclxuICAgIHJlbmRlckZpbHRlcjogY3JlYXRlRmlsdGVyUmVuZGVyKCksXHJcbiAgICBmaWx0ZXJNZXRob2Q6IGRlZmF1bHRGaWx0ZXJNZXRob2QsXHJcbiAgICByZW5kZXJJdGVtOiBjcmVhdGVGb3JtSXRlbVJlbmRlcigpXHJcbiAgfSxcclxuICBJbnB1dE51bWJlcjoge1xyXG4gICAgYXV0b2ZvY3VzOiAnaW5wdXQuaXZ1LWlucHV0LW51bWJlci1pbnB1dCcsXHJcbiAgICByZW5kZXJEZWZhdWx0OiBjcmVhdGVFZGl0UmVuZGVyKCksXHJcbiAgICByZW5kZXJFZGl0OiBjcmVhdGVFZGl0UmVuZGVyKCksXHJcbiAgICByZW5kZXJGaWx0ZXI6IGNyZWF0ZUZpbHRlclJlbmRlcigpLFxyXG4gICAgZmlsdGVyTWV0aG9kOiBkZWZhdWx0RmlsdGVyTWV0aG9kLFxyXG4gICAgcmVuZGVySXRlbTogY3JlYXRlRm9ybUl0ZW1SZW5kZXIoKVxyXG4gIH0sXHJcbiAgU2VsZWN0OiB7XHJcbiAgICByZW5kZXJFZGl0IChoOiBGdW5jdGlvbiwgcmVuZGVyT3B0czogYW55LCBwYXJhbXM6IGFueSkge1xyXG4gICAgICBsZXQgeyBvcHRpb25zLCBvcHRpb25Hcm91cHMsIG9wdGlvblByb3BzID0ge30sIG9wdGlvbkdyb3VwUHJvcHMgPSB7fSB9ID0gcmVuZGVyT3B0c1xyXG4gICAgICBsZXQgeyByb3csIGNvbHVtbiB9ID0gcGFyYW1zXHJcbiAgICAgIGxldCB7IGF0dHJzIH0gPSByZW5kZXJPcHRzXHJcbiAgICAgIGxldCBwcm9wcyA9IGdldFByb3BzKHBhcmFtcywgcmVuZGVyT3B0cywgeyB0cmFuc2ZlcjogdHJ1ZSB9KVxyXG4gICAgICBpZiAob3B0aW9uR3JvdXBzKSB7XHJcbiAgICAgICAgbGV0IGdyb3VwT3B0aW9ucyA9IG9wdGlvbkdyb3VwUHJvcHMub3B0aW9ucyB8fCAnb3B0aW9ucydcclxuICAgICAgICBsZXQgZ3JvdXBMYWJlbCA9IG9wdGlvbkdyb3VwUHJvcHMubGFiZWwgfHwgJ2xhYmVsJ1xyXG4gICAgICAgIHJldHVybiBbXHJcbiAgICAgICAgICBoKCdTZWxlY3QnLCB7XHJcbiAgICAgICAgICAgIHByb3BzLFxyXG4gICAgICAgICAgICBhdHRycyxcclxuICAgICAgICAgICAgbW9kZWw6IHtcclxuICAgICAgICAgICAgICB2YWx1ZTogWEVVdGlscy5nZXQocm93LCBjb2x1bW4ucHJvcGVydHkpLFxyXG4gICAgICAgICAgICAgIGNhbGxiYWNrIChjZWxsVmFsdWU6IGFueSkge1xyXG4gICAgICAgICAgICAgICAgWEVVdGlscy5zZXQocm93LCBjb2x1bW4ucHJvcGVydHksIGNlbGxWYWx1ZSlcclxuICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIG9uOiBnZXRDZWxsRXZlbnRzKHJlbmRlck9wdHMsIHBhcmFtcylcclxuICAgICAgICAgIH0sIFhFVXRpbHMubWFwKG9wdGlvbkdyb3VwcywgKGdyb3VwOiBhbnksIGdJbmRleDogbnVtYmVyKSA9PiB7XHJcbiAgICAgICAgICAgIHJldHVybiBoKCdPcHRpb25Hcm91cCcsIHtcclxuICAgICAgICAgICAgICBwcm9wczoge1xyXG4gICAgICAgICAgICAgICAgbGFiZWw6IGdyb3VwW2dyb3VwTGFiZWxdXHJcbiAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICBrZXk6IGdJbmRleFxyXG4gICAgICAgICAgICB9LCByZW5kZXJPcHRpb25zKGgsIGdyb3VwW2dyb3VwT3B0aW9uc10sIG9wdGlvblByb3BzKSlcclxuICAgICAgICAgIH0pKVxyXG4gICAgICAgIF1cclxuICAgICAgfVxyXG4gICAgICByZXR1cm4gW1xyXG4gICAgICAgIGgoJ1NlbGVjdCcsIHtcclxuICAgICAgICAgIHByb3BzLFxyXG4gICAgICAgICAgYXR0cnMsXHJcbiAgICAgICAgICBtb2RlbDoge1xyXG4gICAgICAgICAgICB2YWx1ZTogWEVVdGlscy5nZXQocm93LCBjb2x1bW4ucHJvcGVydHkpLFxyXG4gICAgICAgICAgICBjYWxsYmFjayAoY2VsbFZhbHVlOiBhbnkpIHtcclxuICAgICAgICAgICAgICBYRVV0aWxzLnNldChyb3csIGNvbHVtbi5wcm9wZXJ0eSwgY2VsbFZhbHVlKVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICB9LFxyXG4gICAgICAgICAgb246IGdldENlbGxFdmVudHMocmVuZGVyT3B0cywgcGFyYW1zKVxyXG4gICAgICAgIH0sIHJlbmRlck9wdGlvbnMoaCwgb3B0aW9ucywgb3B0aW9uUHJvcHMpKVxyXG4gICAgICBdXHJcbiAgICB9LFxyXG4gICAgcmVuZGVyQ2VsbCAoaDogRnVuY3Rpb24sIHJlbmRlck9wdHM6IGFueSwgcGFyYW1zOiBhbnkpIHtcclxuICAgICAgcmV0dXJuIGNlbGxUZXh0KGgsIGdldFNlbGVjdENlbGxWYWx1ZShyZW5kZXJPcHRzLCBwYXJhbXMpKVxyXG4gICAgfSxcclxuICAgIHJlbmRlckZpbHRlciAoaDogRnVuY3Rpb24sIHJlbmRlck9wdHM6IGFueSwgcGFyYW1zOiBhbnkpIHtcclxuICAgICAgbGV0IHsgb3B0aW9ucywgb3B0aW9uR3JvdXBzLCBvcHRpb25Qcm9wcyA9IHt9LCBvcHRpb25Hcm91cFByb3BzID0ge30gfSA9IHJlbmRlck9wdHNcclxuICAgICAgbGV0IHsgY29sdW1uIH0gPSBwYXJhbXNcclxuICAgICAgbGV0IHsgYXR0cnMsIGV2ZW50cyB9ID0gcmVuZGVyT3B0c1xyXG4gICAgICBsZXQgcHJvcHMgPSBnZXRQcm9wcyhwYXJhbXMsIHJlbmRlck9wdHMsIHsgdHJhbnNmZXI6IHRydWUgfSlcclxuICAgICAgbGV0IHR5cGUgPSAnb24tY2hhbmdlJ1xyXG4gICAgICBpZiAob3B0aW9uR3JvdXBzKSB7XHJcbiAgICAgICAgbGV0IGdyb3VwT3B0aW9ucyA9IG9wdGlvbkdyb3VwUHJvcHMub3B0aW9ucyB8fCAnb3B0aW9ucydcclxuICAgICAgICBsZXQgZ3JvdXBMYWJlbCA9IG9wdGlvbkdyb3VwUHJvcHMubGFiZWwgfHwgJ2xhYmVsJ1xyXG4gICAgICAgIHJldHVybiBjb2x1bW4uZmlsdGVycy5tYXAoKGl0ZW06IGFueSkgPT4ge1xyXG4gICAgICAgICAgcmV0dXJuIGgoJ1NlbGVjdCcsIHtcclxuICAgICAgICAgICAgcHJvcHMsXHJcbiAgICAgICAgICAgIGF0dHJzLFxyXG4gICAgICAgICAgICBtb2RlbDoge1xyXG4gICAgICAgICAgICAgIHZhbHVlOiBpdGVtLmRhdGEsXHJcbiAgICAgICAgICAgICAgY2FsbGJhY2sgKG9wdGlvblZhbHVlOiBhbnkpIHtcclxuICAgICAgICAgICAgICAgIGl0ZW0uZGF0YSA9IG9wdGlvblZhbHVlXHJcbiAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICBvbjogZ2V0RmlsdGVyRXZlbnRzKHtcclxuICAgICAgICAgICAgICBbdHlwZV0gKHZhbHVlOiBhbnkpIHtcclxuICAgICAgICAgICAgICAgIGhhbmRsZUNvbmZpcm1GaWx0ZXIocGFyYW1zLCBjb2x1bW4sIHZhbHVlICYmIHZhbHVlLmxlbmd0aCA+IDAsIGl0ZW0pXHJcbiAgICAgICAgICAgICAgICBpZiAoZXZlbnRzICYmIGV2ZW50c1t0eXBlXSkge1xyXG4gICAgICAgICAgICAgICAgICBldmVudHNbdHlwZV0ocGFyYW1zLCB2YWx1ZSlcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0sIHJlbmRlck9wdHMsIHBhcmFtcylcclxuICAgICAgICAgIH0sIFhFVXRpbHMubWFwKG9wdGlvbkdyb3VwcywgKGdyb3VwOiBhbnksIGdJbmRleDogbnVtYmVyKSA9PiB7XHJcbiAgICAgICAgICAgIHJldHVybiBoKCdPcHRpb25Hcm91cCcsIHtcclxuICAgICAgICAgICAgICBwcm9wczoge1xyXG4gICAgICAgICAgICAgICAgbGFiZWw6IGdyb3VwW2dyb3VwTGFiZWxdXHJcbiAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICBrZXk6IGdJbmRleFxyXG4gICAgICAgICAgICB9LCByZW5kZXJPcHRpb25zKGgsIGdyb3VwW2dyb3VwT3B0aW9uc10sIG9wdGlvblByb3BzKSlcclxuICAgICAgICAgIH0pKVxyXG4gICAgICAgIH0pXHJcbiAgICAgIH1cclxuICAgICAgcmV0dXJuIGNvbHVtbi5maWx0ZXJzLm1hcCgoaXRlbTogYW55KSA9PiB7XHJcbiAgICAgICAgcmV0dXJuIGgoJ1NlbGVjdCcsIHtcclxuICAgICAgICAgIHByb3BzLFxyXG4gICAgICAgICAgYXR0cnMsXHJcbiAgICAgICAgICBtb2RlbDoge1xyXG4gICAgICAgICAgICB2YWx1ZTogaXRlbS5kYXRhLFxyXG4gICAgICAgICAgICBjYWxsYmFjayAob3B0aW9uVmFsdWU6IGFueSkge1xyXG4gICAgICAgICAgICAgIGl0ZW0uZGF0YSA9IG9wdGlvblZhbHVlXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgIH0sXHJcbiAgICAgICAgICBvbjogZ2V0RmlsdGVyRXZlbnRzKHtcclxuICAgICAgICAgICAgW3R5cGVdICh2YWx1ZTogYW55KSB7XHJcbiAgICAgICAgICAgICAgaGFuZGxlQ29uZmlybUZpbHRlcihwYXJhbXMsIGNvbHVtbiwgdmFsdWUgJiYgdmFsdWUubGVuZ3RoID4gMCwgaXRlbSlcclxuICAgICAgICAgICAgICBpZiAoZXZlbnRzICYmIGV2ZW50c1t0eXBlXSkge1xyXG4gICAgICAgICAgICAgICAgZXZlbnRzW3R5cGVdKHBhcmFtcywgdmFsdWUpXHJcbiAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICB9LCByZW5kZXJPcHRzLCBwYXJhbXMpXHJcbiAgICAgICAgfSwgcmVuZGVyT3B0aW9ucyhoLCBvcHRpb25zLCBvcHRpb25Qcm9wcykpXHJcbiAgICAgIH0pXHJcbiAgICB9LFxyXG4gICAgZmlsdGVyTWV0aG9kICh7IG9wdGlvbiwgcm93LCBjb2x1bW4gfTogYW55KSB7XHJcbiAgICAgIGxldCB7IGRhdGEgfSA9IG9wdGlvblxyXG4gICAgICBsZXQgeyBwcm9wZXJ0eSwgZmlsdGVyUmVuZGVyOiByZW5kZXJPcHRzIH0gPSBjb2x1bW5cclxuICAgICAgbGV0IHsgcHJvcHMgPSB7fSB9ID0gcmVuZGVyT3B0c1xyXG4gICAgICBsZXQgY2VsbFZhbHVlID0gWEVVdGlscy5nZXQocm93LCBwcm9wZXJ0eSlcclxuICAgICAgaWYgKHByb3BzLm11bHRpcGxlKSB7XHJcbiAgICAgICAgaWYgKFhFVXRpbHMuaXNBcnJheShjZWxsVmFsdWUpKSB7XHJcbiAgICAgICAgICByZXR1cm4gWEVVdGlscy5pbmNsdWRlQXJyYXlzKGNlbGxWYWx1ZSwgZGF0YSlcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIGRhdGEuaW5kZXhPZihjZWxsVmFsdWUpID4gLTFcclxuICAgICAgfVxyXG4gICAgICAvKiBlc2xpbnQtZGlzYWJsZSBlcWVxZXEgKi9cclxuICAgICAgcmV0dXJuIGNlbGxWYWx1ZSA9PSBkYXRhXHJcbiAgICB9LFxyXG4gICAgcmVuZGVySXRlbSAoaDogRnVuY3Rpb24sIHJlbmRlck9wdHM6IGFueSwgcGFyYW1zOiBhbnkpIHtcclxuICAgICAgbGV0IHsgb3B0aW9ucywgb3B0aW9uR3JvdXBzLCBvcHRpb25Qcm9wcyA9IHt9LCBvcHRpb25Hcm91cFByb3BzID0ge30gfSA9IHJlbmRlck9wdHNcclxuICAgICAgbGV0IHsgZGF0YSwgcHJvcGVydHkgfSA9IHBhcmFtc1xyXG4gICAgICBsZXQgeyBhdHRycyB9ID0gcmVuZGVyT3B0c1xyXG4gICAgICBsZXQgcHJvcHM6IGFueSA9IGdldEZvcm1JdGVtUHJvcHMocGFyYW1zLCByZW5kZXJPcHRzKVxyXG4gICAgICBpZiAob3B0aW9uR3JvdXBzKSB7XHJcbiAgICAgICAgbGV0IGdyb3VwT3B0aW9uczogc3RyaW5nID0gb3B0aW9uR3JvdXBQcm9wcy5vcHRpb25zIHx8ICdvcHRpb25zJ1xyXG4gICAgICAgIGxldCBncm91cExhYmVsOiBzdHJpbmcgPSBvcHRpb25Hcm91cFByb3BzLmxhYmVsIHx8ICdsYWJlbCdcclxuICAgICAgICByZXR1cm4gW1xyXG4gICAgICAgICAgaCgnU2VsZWN0Jywge1xyXG4gICAgICAgICAgICBwcm9wcyxcclxuICAgICAgICAgICAgYXR0cnMsXHJcbiAgICAgICAgICAgIG1vZGVsOiB7XHJcbiAgICAgICAgICAgICAgdmFsdWU6IFhFVXRpbHMuZ2V0KGRhdGEsIHByb3BlcnR5KSxcclxuICAgICAgICAgICAgICBjYWxsYmFjayAoY2VsbFZhbHVlOiBhbnkpIHtcclxuICAgICAgICAgICAgICAgIFhFVXRpbHMuc2V0KGRhdGEsIHByb3BlcnR5LCBjZWxsVmFsdWUpXHJcbiAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICBvbjogZ2V0Rm9ybUV2ZW50cyhyZW5kZXJPcHRzLCBwYXJhbXMpXHJcbiAgICAgICAgICB9LCBYRVV0aWxzLm1hcChvcHRpb25Hcm91cHMsIChncm91cDogYW55LCBnSW5kZXg6IG51bWJlcikgPT4ge1xyXG4gICAgICAgICAgICByZXR1cm4gaCgnT3B0aW9uR3JvdXAnLCB7XHJcbiAgICAgICAgICAgICAgcHJvcHM6IHtcclxuICAgICAgICAgICAgICAgIGxhYmVsOiBncm91cFtncm91cExhYmVsXVxyXG4gICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAga2V5OiBnSW5kZXhcclxuICAgICAgICAgICAgfSwgcmVuZGVyT3B0aW9ucyhoLCBncm91cFtncm91cE9wdGlvbnNdLCBvcHRpb25Qcm9wcykpXHJcbiAgICAgICAgICB9KSlcclxuICAgICAgICBdXHJcbiAgICAgIH1cclxuICAgICAgcmV0dXJuIFtcclxuICAgICAgICBoKCdTZWxlY3QnLCB7XHJcbiAgICAgICAgICBwcm9wcyxcclxuICAgICAgICAgIGF0dHJzLFxyXG4gICAgICAgICAgbW9kZWw6IHtcclxuICAgICAgICAgICAgdmFsdWU6IFhFVXRpbHMuZ2V0KGRhdGEsIHByb3BlcnR5KSxcclxuICAgICAgICAgICAgY2FsbGJhY2sgKGNlbGxWYWx1ZTogYW55KSB7XHJcbiAgICAgICAgICAgICAgWEVVdGlscy5zZXQoZGF0YSwgcHJvcGVydHksIGNlbGxWYWx1ZSlcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgfSxcclxuICAgICAgICAgIG9uOiBnZXRGb3JtRXZlbnRzKHJlbmRlck9wdHMsIHBhcmFtcylcclxuICAgICAgICB9LCByZW5kZXJPcHRpb25zKGgsIG9wdGlvbnMsIG9wdGlvblByb3BzKSlcclxuICAgICAgXVxyXG4gICAgfSxcclxuICAgIGNlbGxFeHBvcnRNZXRob2Q6IGNyZWF0ZUV4cG9ydE1ldGhvZChnZXRTZWxlY3RDZWxsVmFsdWUpLFxyXG4gICAgZWRpdENlbGxFeHBvcnRNZXRob2Q6IGNyZWF0ZUV4cG9ydE1ldGhvZChnZXRTZWxlY3RDZWxsVmFsdWUsIHRydWUpXHJcbiAgfSxcclxuICBDYXNjYWRlcjoge1xyXG4gICAgcmVuZGVyRWRpdDogY3JlYXRlRWRpdFJlbmRlcih7IHRyYW5zZmVyOiB0cnVlIH0pLFxyXG4gICAgcmVuZGVyQ2VsbCAoaDogRnVuY3Rpb24sIHJlbmRlck9wdHM6IGFueSwgcGFyYW1zOiBhbnkpIHtcclxuICAgICAgcmV0dXJuIGNlbGxUZXh0KGgsIGdldENhc2NhZGVyQ2VsbFZhbHVlKHJlbmRlck9wdHMsIHBhcmFtcykpXHJcbiAgICB9LFxyXG4gICAgcmVuZGVySXRlbTogY3JlYXRlRm9ybUl0ZW1SZW5kZXIoKSxcclxuICAgIGNlbGxFeHBvcnRNZXRob2Q6IGNyZWF0ZUV4cG9ydE1ldGhvZChnZXRDYXNjYWRlckNlbGxWYWx1ZSksXHJcbiAgICBlZGl0Q2VsbEV4cG9ydE1ldGhvZDogY3JlYXRlRXhwb3J0TWV0aG9kKGdldENhc2NhZGVyQ2VsbFZhbHVlLCB0cnVlKVxyXG4gIH0sXHJcbiAgRGF0ZVBpY2tlcjoge1xyXG4gICAgcmVuZGVyRWRpdDogY3JlYXRlRWRpdFJlbmRlcih7IHRyYW5zZmVyOiB0cnVlIH0pLFxyXG4gICAgcmVuZGVyQ2VsbCAoaDogRnVuY3Rpb24sIHJlbmRlck9wdHM6IGFueSwgcGFyYW1zOiBhbnkpIHtcclxuICAgICAgcmV0dXJuIGNlbGxUZXh0KGgsIGdldERhdGVQaWNrZXJDZWxsVmFsdWUocmVuZGVyT3B0cywgcGFyYW1zKSlcclxuICAgIH0sXHJcbiAgICByZW5kZXJGaWx0ZXIgKGg6IEZ1bmN0aW9uLCByZW5kZXJPcHRzOiBhbnksIHBhcmFtczogYW55KSB7XHJcbiAgICAgIGxldCB7IGNvbHVtbiB9ID0gcGFyYW1zXHJcbiAgICAgIGxldCB7IGF0dHJzLCBldmVudHMgfSA9IHJlbmRlck9wdHNcclxuICAgICAgbGV0IHByb3BzID0gZ2V0UHJvcHMocGFyYW1zLCByZW5kZXJPcHRzLCB7IHRyYW5zZmVyOiB0cnVlIH0pXHJcbiAgICAgIGxldCB0eXBlID0gJ29uLWNoYW5nZSdcclxuICAgICAgcmV0dXJuIGNvbHVtbi5maWx0ZXJzLm1hcCgoaXRlbTogYW55KSA9PiB7XHJcbiAgICAgICAgcmV0dXJuIGgocmVuZGVyT3B0cy5uYW1lLCB7XHJcbiAgICAgICAgICBwcm9wcyxcclxuICAgICAgICAgIGF0dHJzLFxyXG4gICAgICAgICAgbW9kZWw6IHtcclxuICAgICAgICAgICAgdmFsdWU6IGl0ZW0uZGF0YSxcclxuICAgICAgICAgICAgY2FsbGJhY2sgKG9wdGlvblZhbHVlOiBhbnkpIHtcclxuICAgICAgICAgICAgICBpdGVtLmRhdGEgPSBvcHRpb25WYWx1ZVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICB9LFxyXG4gICAgICAgICAgb246IGdldEZpbHRlckV2ZW50cyh7XHJcbiAgICAgICAgICAgIFt0eXBlXSAodmFsdWU6IGFueSkge1xyXG4gICAgICAgICAgICAgIGhhbmRsZUNvbmZpcm1GaWx0ZXIocGFyYW1zLCBjb2x1bW4sICEhdmFsdWUsIGl0ZW0pXHJcbiAgICAgICAgICAgICAgaWYgKGV2ZW50cyAmJiBldmVudHNbdHlwZV0pIHtcclxuICAgICAgICAgICAgICAgIGV2ZW50c1t0eXBlXShwYXJhbXMsIHZhbHVlKVxyXG4gICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgfSwgcmVuZGVyT3B0cywgcGFyYW1zKVxyXG4gICAgICAgIH0pXHJcbiAgICAgIH0pXHJcbiAgICB9LFxyXG4gICAgZmlsdGVyTWV0aG9kICh7IG9wdGlvbiwgcm93LCBjb2x1bW4gfTogYW55KSB7XHJcbiAgICAgIGxldCB7IGRhdGEgfSA9IG9wdGlvblxyXG4gICAgICBsZXQgeyBmaWx0ZXJSZW5kZXI6IHJlbmRlck9wdHMgfSA9IGNvbHVtblxyXG4gICAgICBsZXQgeyBwcm9wcyA9IHt9IH0gPSByZW5kZXJPcHRzXHJcbiAgICAgIGxldCBjZWxsVmFsdWUgPSBYRVV0aWxzLmdldChyb3csIGNvbHVtbi5wcm9wZXJ0eSlcclxuICAgICAgaWYgKGRhdGEpIHtcclxuICAgICAgICBzd2l0Y2ggKHByb3BzLnR5cGUpIHtcclxuICAgICAgICAgIGNhc2UgJ2RhdGVyYW5nZSc6XHJcbiAgICAgICAgICAgIHJldHVybiBlcXVhbERhdGVyYW5nZShjZWxsVmFsdWUsIGRhdGEsIHByb3BzLCAneXl5eS1NTS1kZCcpXHJcbiAgICAgICAgICBjYXNlICdkYXRldGltZXJhbmdlJzpcclxuICAgICAgICAgICAgcmV0dXJuIGVxdWFsRGF0ZXJhbmdlKGNlbGxWYWx1ZSwgZGF0YSwgcHJvcHMsICd5eXl5LU1NLWRkIEhIOnNzOm1tJylcclxuICAgICAgICAgIGRlZmF1bHQ6XHJcbiAgICAgICAgICAgIHJldHVybiBjZWxsVmFsdWUgPT09IGRhdGFcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgICAgcmV0dXJuIGZhbHNlXHJcbiAgICB9LFxyXG4gICAgcmVuZGVySXRlbTogY3JlYXRlRm9ybUl0ZW1SZW5kZXIoKSxcclxuICAgIGNlbGxFeHBvcnRNZXRob2Q6IGNyZWF0ZUV4cG9ydE1ldGhvZChnZXREYXRlUGlja2VyQ2VsbFZhbHVlKSxcclxuICAgIGVkaXRDZWxsRXhwb3J0TWV0aG9kOiBjcmVhdGVFeHBvcnRNZXRob2QoZ2V0RGF0ZVBpY2tlckNlbGxWYWx1ZSwgdHJ1ZSlcclxuICB9LFxyXG4gIFRpbWVQaWNrZXI6IHtcclxuICAgIHJlbmRlckVkaXQ6IGNyZWF0ZUVkaXRSZW5kZXIoeyB0cmFuc2ZlcjogdHJ1ZSB9KSxcclxuICAgIHJlbmRlckl0ZW06IGNyZWF0ZUZvcm1JdGVtUmVuZGVyKClcclxuICB9LFxyXG4gIFJhdGU6IHtcclxuICAgIHJlbmRlckRlZmF1bHQ6IGNyZWF0ZUVkaXRSZW5kZXIoKSxcclxuICAgIHJlbmRlckVkaXQ6IGNyZWF0ZUVkaXRSZW5kZXIoKSxcclxuICAgIHJlbmRlckZpbHRlcjogY3JlYXRlRmlsdGVyUmVuZGVyKCksXHJcbiAgICBmaWx0ZXJNZXRob2Q6IGRlZmF1bHRGaWx0ZXJNZXRob2QsXHJcbiAgICByZW5kZXJJdGVtOiBjcmVhdGVGb3JtSXRlbVJlbmRlcigpXHJcbiAgfSxcclxuICBpU3dpdGNoOiB7XHJcbiAgICByZW5kZXJEZWZhdWx0OiBjcmVhdGVFZGl0UmVuZGVyKCksXHJcbiAgICByZW5kZXJFZGl0OiBjcmVhdGVFZGl0UmVuZGVyKCksXHJcbiAgICByZW5kZXJGaWx0ZXI6IGNyZWF0ZUZpbHRlclJlbmRlcigpLFxyXG4gICAgZmlsdGVyTWV0aG9kOiBkZWZhdWx0RmlsdGVyTWV0aG9kLFxyXG4gICAgcmVuZGVySXRlbTogY3JlYXRlRm9ybUl0ZW1SZW5kZXIoKVxyXG4gIH0sXHJcbiAgUmFkaW86IHtcclxuICAgIHJlbmRlckl0ZW06IGNyZWF0ZUZvcm1JdGVtUmFkaW9BbmRDaGVja2JveFJlbmRlcigpXHJcbiAgfSxcclxuICBDaGVja2JveDoge1xyXG4gICAgcmVuZGVySXRlbTogY3JlYXRlRm9ybUl0ZW1SYWRpb0FuZENoZWNrYm94UmVuZGVyKClcclxuICB9LFxyXG4gIEJ1dHRvbjoge1xyXG4gICAgcmVuZGVyRWRpdDogZGVmYXVsdEJ1dHRvbkVkaXRSZW5kZXIsXHJcbiAgICByZW5kZXJEZWZhdWx0OiBkZWZhdWx0QnV0dG9uRWRpdFJlbmRlcixcclxuICAgIHJlbmRlckl0ZW06IGRlZmF1bHRCdXR0b25JdGVtUmVuZGVyXHJcbiAgfSxcclxuICBCdXR0b25zOiB7XHJcbiAgICByZW5kZXJFZGl0OiBkZWZhdWx0QnV0dG9uc0VkaXRSZW5kZXIsXHJcbiAgICByZW5kZXJEZWZhdWx0OiBkZWZhdWx0QnV0dG9uc0VkaXRSZW5kZXIsXHJcbiAgICByZW5kZXJJdGVtOiBkZWZhdWx0QnV0dG9uc0l0ZW1SZW5kZXJcclxuICB9XHJcbn1cclxuXHJcbi8qKlxyXG4gKiDkuovku7blhbzlrrnmgKflpITnkIZcclxuICovXHJcbmZ1bmN0aW9uIGhhbmRsZUNsZWFyRXZlbnQgKHBhcmFtczogYW55LCBldm50OiBhbnksIGNvbnRleHQ6IGFueSkge1xyXG4gIGNvbnN0IHsgJHRhYmxlIH0gPSBwYXJhbXNcclxuICBjb25zdCBnZXRFdmVudFRhcmdldE5vZGUgPSAkdGFibGUgPyAkdGFibGUuZ2V0RXZlbnRUYXJnZXROb2RlIDogY29udGV4dC5nZXRFdmVudFRhcmdldE5vZGVcclxuICBjb25zdCBib2R5RWxlbTogSFRNTEVsZW1lbnQgPSBkb2N1bWVudC5ib2R5XHJcbiAgaWYgKFxyXG4gICAgLy8g5LiL5ouJ5qGG44CB5pel5pyfXHJcbiAgICBnZXRFdmVudFRhcmdldE5vZGUoZXZudCwgYm9keUVsZW0sICdpdnUtc2VsZWN0LWRyb3Bkb3duJykuZmxhZ1xyXG4gICkge1xyXG4gICAgcmV0dXJuIGZhbHNlXHJcbiAgfVxyXG59XHJcblxyXG4vKipcclxuICog5Z+65LqOIHZ4ZS10YWJsZSDooajmoLznmoTpgILphY3mj5Lku7bvvIznlKjkuo7lhbzlrrkgaXZpZXcg57uE5Lu25bqTXHJcbiAqL1xyXG5leHBvcnQgY29uc3QgVlhFVGFibGVQbHVnaW5JVmlldyA9IHtcclxuICBpbnN0YWxsICh4dGFibGU6IHR5cGVvZiBWWEVUYWJsZSkge1xyXG4gICAgbGV0IHsgaW50ZXJjZXB0b3IsIHJlbmRlcmVyIH0gPSB4dGFibGVcclxuICAgIHJlbmRlcmVyLm1peGluKHJlbmRlck1hcClcclxuICAgIGludGVyY2VwdG9yLmFkZCgnZXZlbnQuY2xlYXJGaWx0ZXInLCBoYW5kbGVDbGVhckV2ZW50KVxyXG4gICAgaW50ZXJjZXB0b3IuYWRkKCdldmVudC5jbGVhckFjdGl2ZWQnLCBoYW5kbGVDbGVhckV2ZW50KVxyXG4gIH1cclxufVxyXG5cclxuaWYgKHR5cGVvZiB3aW5kb3cgIT09ICd1bmRlZmluZWQnICYmIHdpbmRvdy5WWEVUYWJsZSkge1xyXG4gIHdpbmRvdy5WWEVUYWJsZS51c2UoVlhFVGFibGVQbHVnaW5JVmlldylcclxufVxyXG5cclxuZXhwb3J0IGRlZmF1bHQgVlhFVGFibGVQbHVnaW5JVmlld1xyXG4iXX0=
