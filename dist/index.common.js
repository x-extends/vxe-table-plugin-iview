"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = exports.VXETablePluginIView = void 0;

var _xeUtils = _interopRequireDefault(require("xe-utils/methods/xe-utils"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

/* eslint-enable no-unused-vars */
function isEmptyValue(cellValue) {
  return cellValue === null || cellValue === undefined || cellValue === '';
}

function getModelProp(renderOpts) {
  return 'value';
}

function getModelEvent(renderOpts) {
  return 'input';
}

function getChangeEvent(renderOpts) {
  return 'on-change';
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

function getCellEditFilterProps(renderOpts, params, value, defaultProps) {
  var vSize = params.$table.vSize;
  return _xeUtils["default"].assign(vSize ? {
    size: vSize
  } : {}, defaultProps, renderOpts.props, _defineProperty({}, getModelProp(renderOpts), value));
}

function getItemProps(renderOpts, params, value, defaultProps) {
  var vSize = params.$form.vSize;
  return _xeUtils["default"].assign(vSize ? {
    size: vSize
  } : {}, defaultProps, renderOpts.props, _defineProperty({}, getModelProp(renderOpts), value));
}

function getOns(renderOpts, params, inputFunc, changeFunc) {
  var events = renderOpts.events;
  var modelEvent = getModelEvent(renderOpts);
  var changeEvent = getChangeEvent(renderOpts);
  var isSameEvent = changeEvent === modelEvent;
  var ons = {};

  _xeUtils["default"].objectEach(events, function (func, key) {
    ons[key] = function () {
      for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }

      func.apply(void 0, [params].concat(args));
    };
  });

  if (inputFunc) {
    ons[modelEvent] = function (args1) {
      inputFunc(args1);

      if (events && events[modelEvent]) {
        events[modelEvent](args1);
      }

      if (isSameEvent && changeFunc) {
        changeFunc(args1);
      }
    };
  }

  if (!isSameEvent && changeFunc) {
    ons[changeEvent] = function () {
      for (var _len2 = arguments.length, args = new Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
        args[_key2] = arguments[_key2];
      }

      changeFunc.apply(void 0, args);

      if (events && events[changeEvent]) {
        events[changeEvent].apply(events, [params].concat(args));
      }
    };
  }

  return ons;
}

function getEditOns(renderOpts, params) {
  var $table = params.$table,
      row = params.row,
      column = params.column;
  return getOns(renderOpts, params, function (value) {
    // 处理 model 值双向绑定
    _xeUtils["default"].set(row, column.property, value);
  }, function () {
    // 处理 change 事件相关逻辑
    $table.updateStatus(params);
  });
}

function getFilterOns(renderOpts, params, option, changeFunc) {
  return getOns(renderOpts, params, function (value) {
    // 处理 model 值双向绑定
    option.data = value;
  }, changeFunc);
}

function getItemOns(renderOpts, params) {
  var $form = params.$form,
      data = params.data,
      property = params.property;
  return getOns(renderOpts, params, function (value) {
    // 处理 model 值双向绑定
    _xeUtils["default"].set(data, property, value);
  }, function () {
    // 处理 change 事件相关逻辑
    $form.updateStatus(params);
  });
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

function getSelectCellValue(renderOpts, params) {
  var _renderOpts$options = renderOpts.options,
      options = _renderOpts$options === void 0 ? [] : _renderOpts$options,
      optionGroups = renderOpts.optionGroups,
      _renderOpts$props = renderOpts.props,
      props = _renderOpts$props === void 0 ? {} : _renderOpts$props,
      _renderOpts$optionPro = renderOpts.optionProps,
      optionProps = _renderOpts$optionPro === void 0 ? {} : _renderOpts$optionPro,
      _renderOpts$optionGro = renderOpts.optionGroupProps,
      optionGroupProps = _renderOpts$optionGro === void 0 ? {} : _renderOpts$optionGro;
  var row = params.row,
      column = params.column;
  var $table = params.$table;
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
    }).join(', ');
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

    var cellValue = _xeUtils["default"].get(row, column.property);

    return [h(renderOpts.name, {
      attrs: attrs,
      props: getCellEditFilterProps(renderOpts, params, cellValue, defaultProps),
      on: getEditOns(renderOpts, params)
    })];
  };
}

function defaultButtonEditRender(h, renderOpts, params) {
  var attrs = renderOpts.attrs;
  return [h('Button', {
    attrs: attrs,
    props: getCellEditFilterProps(renderOpts, params, null),
    on: getOns(renderOpts, params)
  }, cellText(h, renderOpts.content))];
}

function defaultButtonsEditRender(h, renderOpts, params) {
  return renderOpts.children.map(function (childRenderOpts) {
    return defaultButtonEditRender(h, childRenderOpts, params)[0];
  });
}

function createFilterRender(defaultProps) {
  return function (h, renderOpts, params) {
    var column = params.column;
    var name = renderOpts.name,
        attrs = renderOpts.attrs;
    return column.filters.map(function (option, oIndex) {
      var optionValue = option.data;
      return h(name, {
        key: oIndex,
        attrs: attrs,
        props: getCellEditFilterProps(renderOpts, params, optionValue, defaultProps),
        on: getFilterOns(renderOpts, params, option, function () {
          // 处理 change 事件相关逻辑
          handleConfirmFilter(params, !!option.data, option);
        })
      });
    });
  };
}

function handleConfirmFilter(params, checked, option) {
  var $panel = params.$panel;
  $panel.changeOption({}, checked, option);
}

function defaultFilterMethod(params) {
  var option = params.option,
      row = params.row,
      column = params.column;
  var data = option.data;

  var cellValue = _xeUtils["default"].get(row, column.property);
  /* eslint-disable eqeqeq */


  return cellValue === data;
}

function renderOptions(h, options, optionProps) {
  var labelProp = optionProps.label || 'label';
  var valueProp = optionProps.value || 'value';
  var disabledProp = optionProps.disabled || 'disabled';
  return _xeUtils["default"].map(options, function (item, oIndex) {
    return h('Option', {
      key: oIndex,
      props: {
        value: item[valueProp],
        label: item[labelProp],
        disabled: item[disabledProp]
      }
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

    var itemValue = _xeUtils["default"].get(data, property);

    return [h(name, {
      attrs: attrs,
      props: getItemProps(renderOpts, params, itemValue, defaultProps),
      on: getItemOns(renderOpts, params)
    })];
  };
}

function defaultButtonItemRender(h, renderOpts, params) {
  var attrs = renderOpts.attrs;
  var props = getItemProps(renderOpts, params, null);
  return [h('Button', {
    attrs: attrs,
    props: props,
    on: getOns(renderOpts, params)
  }, cellText(h, renderOpts.content || props.content))];
}

function defaultButtonsItemRender(h, renderOpts, params) {
  return renderOpts.children.map(function (childRenderOpts) {
    return defaultButtonItemRender(h, childRenderOpts, params)[0];
  });
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
        _renderOpts$options2 = renderOpts.options,
        options = _renderOpts$options2 === void 0 ? [] : _renderOpts$options2,
        _renderOpts$optionPro2 = renderOpts.optionProps,
        optionProps = _renderOpts$optionPro2 === void 0 ? {} : _renderOpts$optionPro2;
    var data = params.data,
        property = params.property;
    var attrs = renderOpts.attrs;
    var labelProp = optionProps.label || 'label';
    var valueProp = optionProps.value || 'value';
    var disabledProp = optionProps.disabled || 'disabled';

    var itemValue = _xeUtils["default"].get(data, property);

    return [h("".concat(name, "Group"), {
      attrs: attrs,
      props: getItemProps(renderOpts, params, itemValue),
      on: getItemOns(renderOpts, params)
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
      var _renderOpts$options3 = renderOpts.options,
          options = _renderOpts$options3 === void 0 ? [] : _renderOpts$options3,
          optionGroups = renderOpts.optionGroups,
          _renderOpts$optionPro3 = renderOpts.optionProps,
          optionProps = _renderOpts$optionPro3 === void 0 ? {} : _renderOpts$optionPro3,
          _renderOpts$optionGro2 = renderOpts.optionGroupProps,
          optionGroupProps = _renderOpts$optionGro2 === void 0 ? {} : _renderOpts$optionGro2;
      var row = params.row,
          column = params.column;
      var attrs = renderOpts.attrs;

      var cellValue = _xeUtils["default"].get(row, column.property);

      var props = getCellEditFilterProps(renderOpts, params, cellValue);
      var on = getEditOns(renderOpts, params);

      if (optionGroups) {
        var groupOptions = optionGroupProps.options || 'options';
        var groupLabel = optionGroupProps.label || 'label';
        return [h('Select', {
          attrs: attrs,
          props: props,
          on: on
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
        attrs: attrs,
        props: props,
        on: on
      }, renderOptions(h, options, optionProps))];
    },
    renderCell: function renderCell(h, renderOpts, params) {
      return cellText(h, getSelectCellValue(renderOpts, params));
    },
    renderFilter: function renderFilter(h, renderOpts, params) {
      var _renderOpts$options4 = renderOpts.options,
          options = _renderOpts$options4 === void 0 ? [] : _renderOpts$options4,
          optionGroups = renderOpts.optionGroups,
          _renderOpts$optionPro4 = renderOpts.optionProps,
          optionProps = _renderOpts$optionPro4 === void 0 ? {} : _renderOpts$optionPro4,
          _renderOpts$optionGro3 = renderOpts.optionGroupProps,
          optionGroupProps = _renderOpts$optionGro3 === void 0 ? {} : _renderOpts$optionGro3;
      var column = params.column;
      var attrs = renderOpts.attrs;

      if (optionGroups) {
        var groupOptions = optionGroupProps.options || 'options';
        var groupLabel = optionGroupProps.label || 'label';
        return column.filters.map(function (option, oIndex) {
          var optionValue = option.data;
          return h('Select', {
            key: oIndex,
            attrs: attrs,
            props: getCellEditFilterProps(renderOpts, params, optionValue),
            on: getFilterOns(renderOpts, params, option, function () {
              // 处理 change 事件相关逻辑
              handleConfirmFilter(params, option.data && option.data.length > 0, option);
            })
          }, _xeUtils["default"].map(optionGroups, function (group, gIndex) {
            return h('OptionGroup', {
              key: gIndex,
              props: {
                label: group[groupLabel]
              }
            }, renderOptions(h, group[groupOptions], optionProps));
          }));
        });
      }

      return column.filters.map(function (option, oIndex) {
        var optionValue = option.data;
        return h('Select', {
          key: oIndex,
          attrs: attrs,
          props: getCellEditFilterProps(renderOpts, params, optionValue),
          on: getFilterOns(renderOpts, params, option, function () {
            // 处理 change 事件相关逻辑
            handleConfirmFilter(params, option.data && option.data.length > 0, option);
          })
        }, renderOptions(h, options, optionProps));
      });
    },
    filterMethod: function filterMethod(params) {
      var option = params.option,
          row = params.row,
          column = params.column;
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
      var _renderOpts$options5 = renderOpts.options,
          options = _renderOpts$options5 === void 0 ? [] : _renderOpts$options5,
          optionGroups = renderOpts.optionGroups,
          _renderOpts$optionPro5 = renderOpts.optionProps,
          optionProps = _renderOpts$optionPro5 === void 0 ? {} : _renderOpts$optionPro5,
          _renderOpts$optionGro4 = renderOpts.optionGroupProps,
          optionGroupProps = _renderOpts$optionGro4 === void 0 ? {} : _renderOpts$optionGro4;
      var data = params.data,
          property = params.property;
      var attrs = renderOpts.attrs;

      var itemValue = _xeUtils["default"].get(data, property);

      var props = getItemProps(renderOpts, params, itemValue);
      var on = getItemOns(renderOpts, params);

      if (optionGroups) {
        var groupOptions = optionGroupProps.options || 'options';
        var groupLabel = optionGroupProps.label || 'label';
        return [h('Select', {
          props: props,
          attrs: attrs,
          on: on
        }, _xeUtils["default"].map(optionGroups, function (group, gIndex) {
          return h('OptionGroup', {
            key: gIndex,
            props: {
              label: group[groupLabel]
            }
          }, renderOptions(h, group[groupOptions], optionProps));
        }))];
      }

      return [h('Select', {
        props: props,
        attrs: attrs,
        on: on
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
      var attrs = renderOpts.attrs;
      return column.filters.map(function (option, oIndex) {
        var optionValue = option.data;
        return h(renderOpts.name, {
          key: oIndex,
          attrs: attrs,
          props: getCellEditFilterProps(renderOpts, params, optionValue),
          on: getFilterOns(renderOpts, params, option, function () {
            // 处理 change 事件相关逻辑
            handleConfirmFilter(params, !!option.data, option);
          })
        });
      });
    },
    filterMethod: function filterMethod(params) {
      var option = params.option,
          row = params.row,
          column = params.column;
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
    renderFilter: function renderFilter(h, renderOpts, params) {
      var column = params.column;
      var name = renderOpts.name,
          attrs = renderOpts.attrs;
      return column.filters.map(function (option, oIndex) {
        var optionValue = option.data;
        return h(name, {
          key: oIndex,
          attrs: attrs,
          props: getCellEditFilterProps(renderOpts, params, optionValue),
          on: getFilterOns(renderOpts, params, option, function () {
            // 处理 change 事件相关逻辑
            handleConfirmFilter(params, _xeUtils["default"].isBoolean(option.data), option);
          })
        });
      });
    },
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
 * 检查触发源是否属于目标节点
 */

function getEventTargetNode(evnt, container, className) {
  var targetElem;
  var target = evnt.target;

  while (target && target.nodeType && target !== document) {
    if (className && target.className && target.className.split && target.className.split(' ').indexOf(className) > -1) {
      targetElem = target;
    } else if (target === container) {
      return {
        flag: className ? !!targetElem : true,
        container: container,
        targetElem: targetElem
      };
    }

    target = target.parentNode;
  }

  return {
    flag: false
  };
}
/**
 * 事件兼容性处理
 */


function handleClearEvent(params, evnt) {
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
  install: function install(_ref) {
    var interceptor = _ref.interceptor,
        renderer = _ref.renderer;
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
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImluZGV4LnRzIl0sIm5hbWVzIjpbImlzRW1wdHlWYWx1ZSIsImNlbGxWYWx1ZSIsInVuZGVmaW5lZCIsImdldE1vZGVsUHJvcCIsInJlbmRlck9wdHMiLCJnZXRNb2RlbEV2ZW50IiwiZ2V0Q2hhbmdlRXZlbnQiLCJnZXRGb3JtYXREYXRlIiwidmFsdWUiLCJwcm9wcyIsImRlZmF1bHRGb3JtYXQiLCJYRVV0aWxzIiwidG9EYXRlU3RyaW5nIiwiZm9ybWF0IiwiZ2V0Rm9ybWF0RGF0ZXMiLCJ2YWx1ZXMiLCJzZXBhcmF0b3IiLCJtYXAiLCJkYXRlIiwiam9pbiIsImVxdWFsRGF0ZXJhbmdlIiwiZGF0YSIsImdldENlbGxFZGl0RmlsdGVyUHJvcHMiLCJwYXJhbXMiLCJkZWZhdWx0UHJvcHMiLCJ2U2l6ZSIsIiR0YWJsZSIsImFzc2lnbiIsInNpemUiLCJnZXRJdGVtUHJvcHMiLCIkZm9ybSIsImdldE9ucyIsImlucHV0RnVuYyIsImNoYW5nZUZ1bmMiLCJldmVudHMiLCJtb2RlbEV2ZW50IiwiY2hhbmdlRXZlbnQiLCJpc1NhbWVFdmVudCIsIm9ucyIsIm9iamVjdEVhY2giLCJmdW5jIiwia2V5IiwiYXJncyIsImFyZ3MxIiwiZ2V0RWRpdE9ucyIsInJvdyIsImNvbHVtbiIsInNldCIsInByb3BlcnR5IiwidXBkYXRlU3RhdHVzIiwiZ2V0RmlsdGVyT25zIiwib3B0aW9uIiwiZ2V0SXRlbU9ucyIsIm1hdGNoQ2FzY2FkZXJEYXRhIiwiaW5kZXgiLCJsaXN0IiwibGFiZWxzIiwidmFsIiwibGVuZ3RoIiwiZWFjaCIsIml0ZW0iLCJwdXNoIiwibGFiZWwiLCJjaGlsZHJlbiIsImdldFNlbGVjdENlbGxWYWx1ZSIsIm9wdGlvbnMiLCJvcHRpb25Hcm91cHMiLCJvcHRpb25Qcm9wcyIsIm9wdGlvbkdyb3VwUHJvcHMiLCJsYWJlbFByb3AiLCJ2YWx1ZVByb3AiLCJncm91cE9wdGlvbnMiLCJnZXQiLCJjb2xpZCIsImlkIiwicmVzdCIsImNlbGxEYXRhIiwiZmlsdGVyYWJsZSIsImZ1bGxBbGxEYXRhUm93TWFwIiwiY2FjaGVDZWxsIiwiaGFzIiwibXVsdGlwbGUiLCJzZWxlY3RJdGVtIiwiZmluZCIsImNlbGxMYWJlbCIsImdldENhc2NhZGVyQ2VsbFZhbHVlIiwiZ2V0RGF0ZVBpY2tlckNlbGxWYWx1ZSIsInR5cGUiLCJjcmVhdGVFZGl0UmVuZGVyIiwiaCIsImF0dHJzIiwibmFtZSIsIm9uIiwiZGVmYXVsdEJ1dHRvbkVkaXRSZW5kZXIiLCJjZWxsVGV4dCIsImNvbnRlbnQiLCJkZWZhdWx0QnV0dG9uc0VkaXRSZW5kZXIiLCJjaGlsZFJlbmRlck9wdHMiLCJjcmVhdGVGaWx0ZXJSZW5kZXIiLCJmaWx0ZXJzIiwib0luZGV4Iiwib3B0aW9uVmFsdWUiLCJoYW5kbGVDb25maXJtRmlsdGVyIiwiY2hlY2tlZCIsIiRwYW5lbCIsImNoYW5nZU9wdGlvbiIsImRlZmF1bHRGaWx0ZXJNZXRob2QiLCJyZW5kZXJPcHRpb25zIiwiZGlzYWJsZWRQcm9wIiwiZGlzYWJsZWQiLCJjcmVhdGVGb3JtSXRlbVJlbmRlciIsIml0ZW1WYWx1ZSIsImRlZmF1bHRCdXR0b25JdGVtUmVuZGVyIiwiZGVmYXVsdEJ1dHRvbnNJdGVtUmVuZGVyIiwiY3JlYXRlRXhwb3J0TWV0aG9kIiwidmFsdWVNZXRob2QiLCJpc0VkaXQiLCJyZW5kZXJQcm9wZXJ0eSIsImNyZWF0ZUZvcm1JdGVtUmFkaW9BbmRDaGVja2JveFJlbmRlciIsInJlbmRlck1hcCIsIklucHV0IiwiYXV0b2ZvY3VzIiwicmVuZGVyRGVmYXVsdCIsInJlbmRlckVkaXQiLCJyZW5kZXJGaWx0ZXIiLCJmaWx0ZXJNZXRob2QiLCJyZW5kZXJJdGVtIiwiQXV0b0NvbXBsZXRlIiwiSW5wdXROdW1iZXIiLCJTZWxlY3QiLCJncm91cExhYmVsIiwiZ3JvdXAiLCJnSW5kZXgiLCJyZW5kZXJDZWxsIiwiZmlsdGVyUmVuZGVyIiwiaXNBcnJheSIsImluY2x1ZGVBcnJheXMiLCJpbmRleE9mIiwiY2VsbEV4cG9ydE1ldGhvZCIsImVkaXRDZWxsRXhwb3J0TWV0aG9kIiwiQ2FzY2FkZXIiLCJ0cmFuc2ZlciIsIkRhdGVQaWNrZXIiLCJUaW1lUGlja2VyIiwiUmF0ZSIsImlTd2l0Y2giLCJpc0Jvb2xlYW4iLCJSYWRpbyIsIkNoZWNrYm94IiwiQnV0dG9uIiwiQnV0dG9ucyIsImdldEV2ZW50VGFyZ2V0Tm9kZSIsImV2bnQiLCJjb250YWluZXIiLCJjbGFzc05hbWUiLCJ0YXJnZXRFbGVtIiwidGFyZ2V0Iiwibm9kZVR5cGUiLCJkb2N1bWVudCIsInNwbGl0IiwiZmxhZyIsInBhcmVudE5vZGUiLCJoYW5kbGVDbGVhckV2ZW50IiwiYm9keUVsZW0iLCJib2R5IiwiVlhFVGFibGVQbHVnaW5JVmlldyIsImluc3RhbGwiLCJpbnRlcmNlcHRvciIsInJlbmRlcmVyIiwibWl4aW4iLCJhZGQiLCJ3aW5kb3ciLCJWWEVUYWJsZSIsInVzZSJdLCJtYXBwaW5ncyI6Ijs7Ozs7OztBQUVBOzs7Ozs7QUFtQkE7QUFFQSxTQUFTQSxZQUFULENBQXVCQyxTQUF2QixFQUFxQztBQUNuQyxTQUFPQSxTQUFTLEtBQUssSUFBZCxJQUFzQkEsU0FBUyxLQUFLQyxTQUFwQyxJQUFpREQsU0FBUyxLQUFLLEVBQXRFO0FBQ0Q7O0FBRUQsU0FBU0UsWUFBVCxDQUF1QkMsVUFBdkIsRUFBZ0Q7QUFDOUMsU0FBTyxPQUFQO0FBQ0Q7O0FBRUQsU0FBU0MsYUFBVCxDQUF3QkQsVUFBeEIsRUFBaUQ7QUFDL0MsU0FBTyxPQUFQO0FBQ0Q7O0FBRUQsU0FBU0UsY0FBVCxDQUF5QkYsVUFBekIsRUFBa0Q7QUFDaEQsU0FBTyxXQUFQO0FBQ0Q7O0FBRUQsU0FBU0csYUFBVCxDQUF3QkMsS0FBeEIsRUFBb0NDLEtBQXBDLEVBQW1FQyxhQUFuRSxFQUF3RjtBQUN0RixTQUFPQyxvQkFBUUMsWUFBUixDQUFxQkosS0FBckIsRUFBNEJDLEtBQUssQ0FBQ0ksTUFBTixJQUFnQkgsYUFBNUMsQ0FBUDtBQUNEOztBQUVELFNBQVNJLGNBQVQsQ0FBeUJDLE1BQXpCLEVBQXNDTixLQUF0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M0JBLFFBQTJCO0FBQ2pEQSxJQUFBQSxRQUFRLENBQUNDLEtBQVQsQ0FBZWxELFNBQWY7QUFDQWdELElBQUFBLFdBQVcsQ0FBQ0csR0FBWixDQUFnQixtQkFBaEIsRUFBcUNSLGdCQUFyQztBQUNBSyxJQUFBQSxXQUFXLENBQUNHLEdBQVosQ0FBZ0Isb0JBQWhCLEVBQXNDUixnQkFBdEM7QUFDRDtBQUxnQyxDQUE1Qjs7O0FBUVAsSUFBSSxPQUFPUyxNQUFQLEtBQWtCLFdBQWxCLElBQWlDQSxNQUFNLENBQUNDLFFBQTVDLEVBQXNEO0FBQ3BERCxFQUFBQSxNQUFNLENBQUNDLFFBQVAsQ0FBZ0JDLEdBQWhCLENBQW9CUixtQkFBcEI7QUFDRDs7ZUFFY0EsbUIiLCJmaWxlIjoiaW5kZXguY29tbW9uLmpzIiwic291cmNlc0NvbnRlbnQiOlsiLyogZXNsaW50LWRpc2FibGUgbm8tdW51c2VkLXZhcnMgKi9cclxuaW1wb3J0IHsgQ3JlYXRlRWxlbWVudCB9IGZyb20gJ3Z1ZSdcclxuaW1wb3J0IFhFVXRpbHMgZnJvbSAneGUtdXRpbHMvbWV0aG9kcy94ZS11dGlscydcclxuaW1wb3J0IHtcclxuICBWWEVUYWJsZSxcclxuICBSZW5kZXJQYXJhbXMsXHJcbiAgT3B0aW9uUHJvcHMsXHJcbiAgVGFibGVSZW5kZXJQYXJhbXMsXHJcbiAgUmVuZGVyT3B0aW9ucyxcclxuICBDb2x1bW5GaWx0ZXJQYXJhbXMsXHJcbiAgQ29sdW1uRmlsdGVyUmVuZGVyT3B0aW9ucyxcclxuICBDb2x1bW5DZWxsUmVuZGVyT3B0aW9ucyxcclxuICBDb2x1bW5FZGl0UmVuZGVyT3B0aW9ucyxcclxuICBDb2x1bW5DZWxsUmVuZGVyUGFyYW1zLFxyXG4gIENvbHVtbkVkaXRSZW5kZXJQYXJhbXMsXHJcbiAgQ29sdW1uRmlsdGVyUmVuZGVyUGFyYW1zLFxyXG4gIENvbHVtbkZpbHRlck1ldGhvZFBhcmFtcyxcclxuICBGb3JtSXRlbVJlbmRlclBhcmFtcyxcclxuICBGb3JtSXRlbVJlbmRlck9wdGlvbnMsXHJcbiAgQ29sdW1uRXhwb3J0Q2VsbFJlbmRlclBhcmFtc1xyXG59IGZyb20gJ3Z4ZS10YWJsZS9saWIvdnhlLXRhYmxlJ1xyXG4vKiBlc2xpbnQtZW5hYmxlIG5vLXVudXNlZC12YXJzICovXHJcblxyXG5mdW5jdGlvbiBpc0VtcHR5VmFsdWUgKGNlbGxWYWx1ZTogYW55KSB7XHJcbiAgcmV0dXJuIGNlbGxWYWx1ZSA9PT0gbnVsbCB8fCBjZWxsVmFsdWUgPT09IHVuZGVmaW5lZCB8fCBjZWxsVmFsdWUgPT09ICcnXHJcbn1cclxuXHJcbmZ1bmN0aW9uIGdldE1vZGVsUHJvcCAocmVuZGVyT3B0czogUmVuZGVyT3B0aW9ucykge1xyXG4gIHJldHVybiAndmFsdWUnXHJcbn1cclxuXHJcbmZ1bmN0aW9uIGdldE1vZGVsRXZlbnQgKHJlbmRlck9wdHM6IFJlbmRlck9wdGlvbnMpIHtcclxuICByZXR1cm4gJ2lucHV0J1xyXG59XHJcblxyXG5mdW5jdGlvbiBnZXRDaGFuZ2VFdmVudCAocmVuZGVyT3B0czogUmVuZGVyT3B0aW9ucykge1xyXG4gIHJldHVybiAnb24tY2hhbmdlJ1xyXG59XHJcblxyXG5mdW5jdGlvbiBnZXRGb3JtYXREYXRlICh2YWx1ZTogYW55LCBwcm9wczogeyBba2V5OiBzdHJpbmddOiBhbnkgfSwgZGVmYXVsdEZvcm1hdDogc3RyaW5nKSB7XHJcbiAgcmV0dXJuIFhFVXRpbHMudG9EYXRlU3RyaW5nKHZhbHVlLCBwcm9wcy5mb3JtYXQgfHwgZGVmYXVsdEZvcm1hdClcclxufVxyXG5cclxuZnVuY3Rpb24gZ2V0Rm9ybWF0RGF0ZXMgKHZhbHVlczogYW55LCBwcm9wczogeyBba2V5OiBzdHJpbmddOiBhbnkgfSwgc2VwYXJhdG9yOiBzdHJpbmcsIGRlZmF1bHRGb3JtYXQ6IHN0cmluZykge1xyXG4gIHJldHVybiBYRVV0aWxzLm1hcCh2YWx1ZXMsIChkYXRlOiBhbnkpID0+IGdldEZvcm1hdERhdGUoZGF0ZSwgcHJvcHMsIGRlZmF1bHRGb3JtYXQpKS5qb2luKHNlcGFyYXRvcilcclxufVxyXG5cclxuZnVuY3Rpb24gZXF1YWxEYXRlcmFuZ2UgKGNlbGxWYWx1ZTogYW55LCBkYXRhOiBhbnksIHByb3BzOiB7IFtrZXk6IHN0cmluZ106IGFueSB9LCBkZWZhdWx0Rm9ybWF0OiBzdHJpbmcpIHtcclxuICBjZWxsVmFsdWUgPSBnZXRGb3JtYXREYXRlKGNlbGxWYWx1ZSwgcHJvcHMsIGRlZmF1bHRGb3JtYXQpXHJcbiAgcmV0dXJuIGNlbGxWYWx1ZSA+PSBnZXRGb3JtYXREYXRlKGRhdGFbMF0sIHByb3BzLCBkZWZhdWx0Rm9ybWF0KSAmJiBjZWxsVmFsdWUgPD0gZ2V0Rm9ybWF0RGF0ZShkYXRhWzFdLCBwcm9wcywgZGVmYXVsdEZvcm1hdClcclxufVxyXG5cclxuZnVuY3Rpb24gZ2V0Q2VsbEVkaXRGaWx0ZXJQcm9wcyAocmVuZGVyT3B0czogUmVuZGVyT3B0aW9ucywgcGFyYW1zOiBUYWJsZVJlbmRlclBhcmFtcywgdmFsdWU6IGFueSwgZGVmYXVsdFByb3BzPzogeyBbcHJvcDogc3RyaW5nXTogYW55IH0pIHtcclxuICBjb25zdCB7IHZTaXplIH0gPSBwYXJhbXMuJHRhYmxlXHJcbiAgcmV0dXJuIFhFVXRpbHMuYXNzaWduKHZTaXplID8geyBzaXplOiB2U2l6ZSB9IDoge30sIGRlZmF1bHRQcm9wcywgcmVuZGVyT3B0cy5wcm9wcywgeyBbZ2V0TW9kZWxQcm9wKHJlbmRlck9wdHMpXTogdmFsdWUgfSlcclxufVxyXG5cclxuZnVuY3Rpb24gZ2V0SXRlbVByb3BzIChyZW5kZXJPcHRzOiBSZW5kZXJPcHRpb25zLCBwYXJhbXM6IEZvcm1JdGVtUmVuZGVyUGFyYW1zLCB2YWx1ZTogYW55LCBkZWZhdWx0UHJvcHM/OiB7IFtwcm9wOiBzdHJpbmddOiBhbnkgfSkge1xyXG4gIGNvbnN0IHsgdlNpemUgfSA9IHBhcmFtcy4kZm9ybVxyXG4gIHJldHVybiBYRVV0aWxzLmFzc2lnbih2U2l6ZSA/IHsgc2l6ZTogdlNpemUgfSA6IHt9LCBkZWZhdWx0UHJvcHMsIHJlbmRlck9wdHMucHJvcHMsIHsgW2dldE1vZGVsUHJvcChyZW5kZXJPcHRzKV06IHZhbHVlIH0pXHJcbn1cclxuXHJcbmZ1bmN0aW9uIGdldE9ucyAocmVuZGVyT3B0czogUmVuZGVyT3B0aW9ucywgcGFyYW1zOiBSZW5kZXJQYXJhbXMsIGlucHV0RnVuYz86IEZ1bmN0aW9uLCBjaGFuZ2VGdW5jPzogRnVuY3Rpb24pIHtcclxuICBjb25zdCB7IGV2ZW50cyB9ID0gcmVuZGVyT3B0c1xyXG4gIGNvbnN0IG1vZGVsRXZlbnQgPSBnZXRNb2RlbEV2ZW50KHJlbmRlck9wdHMpXHJcbiAgY29uc3QgY2hhbmdlRXZlbnQgPSBnZXRDaGFuZ2VFdmVudChyZW5kZXJPcHRzKVxyXG4gIGNvbnN0IGlzU2FtZUV2ZW50ID0gY2hhbmdlRXZlbnQgPT09IG1vZGVsRXZlbnRcclxuICBjb25zdCBvbnM6IHsgW3R5cGU6IHN0cmluZ106IEZ1bmN0aW9uIH0gPSB7fVxyXG4gIFhFVXRpbHMub2JqZWN0RWFjaChldmVudHMsIChmdW5jOiBGdW5jdGlvbiwga2V5OiBzdHJpbmcpID0+IHtcclxuICAgIG9uc1trZXldID0gZnVuY3Rpb24gKC4uLmFyZ3M6IGFueVtdKSB7XHJcbiAgICAgIGZ1bmMocGFyYW1zLCAuLi5hcmdzKVxyXG4gICAgfVxyXG4gIH0pXHJcbiAgaWYgKGlucHV0RnVuYykge1xyXG4gICAgb25zW21vZGVsRXZlbnRdID0gZnVuY3Rpb24gKGFyZ3MxOiBhbnkpIHtcclxuICAgICAgaW5wdXRGdW5jKGFyZ3MxKVxyXG4gICAgICBpZiAoZXZlbnRzICYmIGV2ZW50c1ttb2RlbEV2ZW50XSkge1xyXG4gICAgICAgIGV2ZW50c1ttb2RlbEV2ZW50XShhcmdzMSlcclxuICAgICAgfVxyXG4gICAgICBpZiAoaXNTYW1lRXZlbnQgJiYgY2hhbmdlRnVuYykge1xyXG4gICAgICAgIGNoYW5nZUZ1bmMoYXJnczEpXHJcbiAgICAgIH1cclxuICAgIH1cclxuICB9XHJcbiAgaWYgKCFpc1NhbWVFdmVudCAmJiBjaGFuZ2VGdW5jKSB7XHJcbiAgICBvbnNbY2hhbmdlRXZlbnRdID0gZnVuY3Rpb24gKC4uLmFyZ3M6IGFueVtdKSB7XHJcbiAgICAgIGNoYW5nZUZ1bmMoLi4uYXJncylcclxuICAgICAgaWYgKGV2ZW50cyAmJiBldmVudHNbY2hhbmdlRXZlbnRdKSB7XHJcbiAgICAgICAgZXZlbnRzW2NoYW5nZUV2ZW50XShwYXJhbXMsIC4uLmFyZ3MpXHJcbiAgICAgIH1cclxuICAgIH1cclxuICB9XHJcbiAgcmV0dXJuIG9uc1xyXG59XHJcblxyXG5mdW5jdGlvbiBnZXRFZGl0T25zIChyZW5kZXJPcHRzOiBSZW5kZXJPcHRpb25zLCBwYXJhbXM6IENvbHVtbkVkaXRSZW5kZXJQYXJhbXMpIHtcclxuICBjb25zdCB7ICR0YWJsZSwgcm93LCBjb2x1bW4gfSA9IHBhcmFtc1xyXG4gIHJldHVybiBnZXRPbnMocmVuZGVyT3B0cywgcGFyYW1zLCAodmFsdWU6IGFueSkgPT4ge1xyXG4gICAgLy8g5aSE55CGIG1vZGVsIOWAvOWPjOWQkee7keWumlxyXG4gICAgWEVVdGlscy5zZXQocm93LCBjb2x1bW4ucHJvcGVydHksIHZhbHVlKVxyXG4gIH0sICgpID0+IHtcclxuICAgIC8vIOWkhOeQhiBjaGFuZ2Ug5LqL5Lu255u45YWz6YC76L6RXHJcbiAgICAkdGFibGUudXBkYXRlU3RhdHVzKHBhcmFtcylcclxuICB9KVxyXG59XHJcblxyXG5mdW5jdGlvbiBnZXRGaWx0ZXJPbnMgKHJlbmRlck9wdHM6IFJlbmRlck9wdGlvbnMsIHBhcmFtczogQ29sdW1uRmlsdGVyUmVuZGVyUGFyYW1zLCBvcHRpb246IENvbHVtbkZpbHRlclBhcmFtcywgY2hhbmdlRnVuYzogRnVuY3Rpb24pIHtcclxuICByZXR1cm4gZ2V0T25zKHJlbmRlck9wdHMsIHBhcmFtcywgKHZhbHVlOiBhbnkpID0+IHtcclxuICAgIC8vIOWkhOeQhiBtb2RlbCDlgLzlj4zlkJHnu5HlrppcclxuICAgIG9wdGlvbi5kYXRhID0gdmFsdWVcclxuICB9LCBjaGFuZ2VGdW5jKVxyXG59XHJcblxyXG5mdW5jdGlvbiBnZXRJdGVtT25zIChyZW5kZXJPcHRzOiBSZW5kZXJPcHRpb25zLCBwYXJhbXM6IEZvcm1JdGVtUmVuZGVyUGFyYW1zKSB7XHJcbiAgY29uc3QgeyAkZm9ybSwgZGF0YSwgcHJvcGVydHkgfSA9IHBhcmFtc1xyXG4gIHJldHVybiBnZXRPbnMocmVuZGVyT3B0cywgcGFyYW1zLCAodmFsdWU6IGFueSkgPT4ge1xyXG4gICAgLy8g5aSE55CGIG1vZGVsIOWAvOWPjOWQkee7keWumlxyXG4gICAgWEVVdGlscy5zZXQoZGF0YSwgcHJvcGVydHksIHZhbHVlKVxyXG4gIH0sICgpID0+IHtcclxuICAgIC8vIOWkhOeQhiBjaGFuZ2Ug5LqL5Lu255u45YWz6YC76L6RXHJcbiAgICAkZm9ybS51cGRhdGVTdGF0dXMocGFyYW1zKVxyXG4gIH0pXHJcbn1cclxuXHJcbmZ1bmN0aW9uIG1hdGNoQ2FzY2FkZXJEYXRhIChpbmRleDogbnVtYmVyLCBsaXN0OiBhbnlbXSwgdmFsdWVzOiBhbnlbXSwgbGFiZWxzOiBhbnlbXSkge1xyXG4gIGNvbnN0IHZhbCA9IHZhbHVlc1tpbmRleF1cclxuICBpZiAobGlzdCAmJiB2YWx1ZXMubGVuZ3RoID4gaW5kZXgpIHtcclxuICAgIFhFVXRpbHMuZWFjaChsaXN0LCAoaXRlbSkgPT4ge1xyXG4gICAgICBpZiAoaXRlbS52YWx1ZSA9PT0gdmFsKSB7XHJcbiAgICAgICAgbGFiZWxzLnB1c2goaXRlbS5sYWJlbClcclxuICAgICAgICBtYXRjaENhc2NhZGVyRGF0YSgrK2luZGV4LCBpdGVtLmNoaWxkcmVuLCB2YWx1ZXMsIGxhYmVscylcclxuICAgICAgfVxyXG4gICAgfSlcclxuICB9XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGdldFNlbGVjdENlbGxWYWx1ZSAocmVuZGVyT3B0czogQ29sdW1uQ2VsbFJlbmRlck9wdGlvbnMsIHBhcmFtczogQ29sdW1uQ2VsbFJlbmRlclBhcmFtcykge1xyXG4gIGNvbnN0IHsgb3B0aW9ucyA9IFtdLCBvcHRpb25Hcm91cHMsIHByb3BzID0ge30sIG9wdGlvblByb3BzID0ge30sIG9wdGlvbkdyb3VwUHJvcHMgPSB7fSB9ID0gcmVuZGVyT3B0c1xyXG4gIGNvbnN0IHsgcm93LCBjb2x1bW4gfSA9IHBhcmFtc1xyXG4gIGNvbnN0ICR0YWJsZTogYW55ID0gcGFyYW1zLiR0YWJsZVxyXG4gIGNvbnN0IGxhYmVsUHJvcCA9IG9wdGlvblByb3BzLmxhYmVsIHx8ICdsYWJlbCdcclxuICBjb25zdCB2YWx1ZVByb3AgPSBvcHRpb25Qcm9wcy52YWx1ZSB8fCAndmFsdWUnXHJcbiAgY29uc3QgZ3JvdXBPcHRpb25zID0gb3B0aW9uR3JvdXBQcm9wcy5vcHRpb25zIHx8ICdvcHRpb25zJ1xyXG4gIGNvbnN0IGNlbGxWYWx1ZSA9IFhFVXRpbHMuZ2V0KHJvdywgY29sdW1uLnByb3BlcnR5KVxyXG4gIGNvbnN0IGNvbGlkID0gY29sdW1uLmlkXHJcbiAgbGV0IHJlc3Q6IGFueVxyXG4gIGxldCBjZWxsRGF0YTogYW55XHJcbiAgaWYgKHByb3BzLmZpbHRlcmFibGUpIHtcclxuICAgIGNvbnN0IGZ1bGxBbGxEYXRhUm93TWFwOiBNYXA8YW55LCBhbnk+ID0gJHRhYmxlLmZ1bGxBbGxEYXRhUm93TWFwXHJcbiAgICBjb25zdCBjYWNoZUNlbGwgPSBmdWxsQWxsRGF0YVJvd01hcC5oYXMocm93KVxyXG4gICAgaWYgKGNhY2hlQ2VsbCkge1xyXG4gICAgICByZXN0ID0gZnVsbEFsbERhdGFSb3dNYXAuZ2V0KHJvdylcclxuICAgICAgY2VsbERhdGEgPSByZXN0LmNlbGxEYXRhXHJcbiAgICAgIGlmICghY2VsbERhdGEpIHtcclxuICAgICAgICBjZWxsRGF0YSA9IGZ1bGxBbGxEYXRhUm93TWFwLmdldChyb3cpLmNlbGxEYXRhID0ge31cclxuICAgICAgfVxyXG4gICAgfVxyXG4gICAgaWYgKHJlc3QgJiYgY2VsbERhdGFbY29saWRdICYmIGNlbGxEYXRhW2NvbGlkXS52YWx1ZSA9PT0gY2VsbFZhbHVlKSB7XHJcbiAgICAgIHJldHVybiBjZWxsRGF0YVtjb2xpZF0ubGFiZWxcclxuICAgIH1cclxuICB9XHJcbiAgaWYgKCFpc0VtcHR5VmFsdWUoY2VsbFZhbHVlKSkge1xyXG4gICAgcmV0dXJuIFhFVXRpbHMubWFwKHByb3BzLm11bHRpcGxlID8gY2VsbFZhbHVlIDogW2NlbGxWYWx1ZV0sIG9wdGlvbkdyb3VwcyA/ICh2YWx1ZSkgPT4ge1xyXG4gICAgICBsZXQgc2VsZWN0SXRlbVxyXG4gICAgICBmb3IgKGxldCBpbmRleCA9IDA7IGluZGV4IDwgb3B0aW9uR3JvdXBzLmxlbmd0aDsgaW5kZXgrKykge1xyXG4gICAgICAgIHNlbGVjdEl0ZW0gPSBYRVV0aWxzLmZpbmQob3B0aW9uR3JvdXBzW2luZGV4XVtncm91cE9wdGlvbnNdLCAoaXRlbSkgPT4gaXRlbVt2YWx1ZVByb3BdID09PSB2YWx1ZSlcclxuICAgICAgICBpZiAoc2VsZWN0SXRlbSkge1xyXG4gICAgICAgICAgYnJlYWtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgICAgY29uc3QgY2VsbExhYmVsOiBhbnkgPSBzZWxlY3RJdGVtID8gc2VsZWN0SXRlbVtsYWJlbFByb3BdIDogdmFsdWVcclxuICAgICAgaWYgKGNlbGxEYXRhICYmIG9wdGlvbnMgJiYgb3B0aW9ucy5sZW5ndGgpIHtcclxuICAgICAgICBjZWxsRGF0YVtjb2xpZF0gPSB7IHZhbHVlOiBjZWxsVmFsdWUsIGxhYmVsOiBjZWxsTGFiZWwgfVxyXG4gICAgICB9XHJcbiAgICAgIHJldHVybiBjZWxsTGFiZWxcclxuICAgIH0gOiAodmFsdWUpID0+IHtcclxuICAgICAgY29uc3Qgc2VsZWN0SXRlbSA9IFhFVXRpbHMuZmluZChvcHRpb25zLCAoaXRlbSkgPT4gaXRlbVt2YWx1ZVByb3BdID09PSB2YWx1ZSlcclxuICAgICAgY29uc3QgY2VsbExhYmVsOiBhbnkgPSBzZWxlY3RJdGVtID8gc2VsZWN0SXRlbVtsYWJlbFByb3BdIDogdmFsdWVcclxuICAgICAgaWYgKGNlbGxEYXRhICYmIG9wdGlvbnMgJiYgb3B0aW9ucy5sZW5ndGgpIHtcclxuICAgICAgICBjZWxsRGF0YVtjb2xpZF0gPSB7IHZhbHVlOiBjZWxsVmFsdWUsIGxhYmVsOiBjZWxsTGFiZWwgfVxyXG4gICAgICB9XHJcbiAgICAgIHJldHVybiBjZWxsTGFiZWxcclxuICAgIH0pLmpvaW4oJywgJylcclxuICB9XHJcbiAgcmV0dXJuIG51bGxcclxufVxyXG5cclxuZnVuY3Rpb24gZ2V0Q2FzY2FkZXJDZWxsVmFsdWUgKHJlbmRlck9wdHM6IFJlbmRlck9wdGlvbnMsIHBhcmFtczogQ29sdW1uQ2VsbFJlbmRlclBhcmFtcykge1xyXG4gIGNvbnN0IHsgcHJvcHMgPSB7fSB9ID0gcmVuZGVyT3B0c1xyXG4gIGNvbnN0IHsgcm93LCBjb2x1bW4gfSA9IHBhcmFtc1xyXG4gIGNvbnN0IGNlbGxWYWx1ZSA9IFhFVXRpbHMuZ2V0KHJvdywgY29sdW1uLnByb3BlcnR5KVxyXG4gIGNvbnN0IHZhbHVlczogYW55W10gPSBjZWxsVmFsdWUgfHwgW11cclxuICBjb25zdCBsYWJlbHM6IGFueVtdID0gW11cclxuICBtYXRjaENhc2NhZGVyRGF0YSgwLCBwcm9wcy5kYXRhLCB2YWx1ZXMsIGxhYmVscylcclxuICByZXR1cm4gbGFiZWxzLmpvaW4oYCAke3Byb3BzLnNlcGFyYXRvciB8fCAnLyd9IGApXHJcbn1cclxuXHJcbmZ1bmN0aW9uIGdldERhdGVQaWNrZXJDZWxsVmFsdWUgKHJlbmRlck9wdHM6IFJlbmRlck9wdGlvbnMsIHBhcmFtczogQ29sdW1uQ2VsbFJlbmRlclBhcmFtcykge1xyXG4gIGNvbnN0IHsgcHJvcHMgPSB7fSB9ID0gcmVuZGVyT3B0c1xyXG4gIGNvbnN0IHsgcm93LCBjb2x1bW4gfSA9IHBhcmFtc1xyXG4gIGNvbnN0IHsgc2VwYXJhdG9yIH0gPSBwcm9wc1xyXG4gIGxldCBjZWxsVmFsdWUgPSBYRVV0aWxzLmdldChyb3csIGNvbHVtbi5wcm9wZXJ0eSlcclxuICBzd2l0Y2ggKHByb3BzLnR5cGUpIHtcclxuICAgIGNhc2UgJ3dlZWsnOlxyXG4gICAgICBjZWxsVmFsdWUgPSBnZXRGb3JtYXREYXRlKGNlbGxWYWx1ZSwgcHJvcHMsICd5eXl5d1dXJylcclxuICAgICAgYnJlYWtcclxuICAgIGNhc2UgJ21vbnRoJzpcclxuICAgICAgY2VsbFZhbHVlID0gZ2V0Rm9ybWF0RGF0ZShjZWxsVmFsdWUsIHByb3BzLCAneXl5eS1NTScpXHJcbiAgICAgIGJyZWFrXHJcbiAgICBjYXNlICd5ZWFyJzpcclxuICAgICAgY2VsbFZhbHVlID0gZ2V0Rm9ybWF0RGF0ZShjZWxsVmFsdWUsIHByb3BzLCAneXl5eScpXHJcbiAgICAgIGJyZWFrXHJcbiAgICBjYXNlICdkYXRlcyc6XHJcbiAgICAgIGNlbGxWYWx1ZSA9IGdldEZvcm1hdERhdGVzKGNlbGxWYWx1ZSwgcHJvcHMsICcsICcsICd5eXl5LU1NLWRkJylcclxuICAgICAgYnJlYWtcclxuICAgIGNhc2UgJ2RhdGVyYW5nZSc6XHJcbiAgICAgIGNlbGxWYWx1ZSA9IGdldEZvcm1hdERhdGVzKGNlbGxWYWx1ZSwgcHJvcHMsIGAgJHtzZXBhcmF0b3IgfHwgJy0nfSBgLCAneXl5eS1NTS1kZCcpXHJcbiAgICAgIGJyZWFrXHJcbiAgICBjYXNlICdkYXRldGltZXJhbmdlJzpcclxuICAgICAgY2VsbFZhbHVlID0gZ2V0Rm9ybWF0RGF0ZXMoY2VsbFZhbHVlLCBwcm9wcywgYCAke3NlcGFyYXRvciB8fCAnLSd9IGAsICd5eXl5LU1NLWRkIEhIOnNzOm1tJylcclxuICAgICAgYnJlYWtcclxuICAgIGRlZmF1bHQ6XHJcbiAgICAgIGNlbGxWYWx1ZSA9IGdldEZvcm1hdERhdGUoY2VsbFZhbHVlLCBwcm9wcywgJ3l5eXktTU0tZGQnKVxyXG4gICAgICBicmVha1xyXG4gIH1cclxuICByZXR1cm4gY2VsbFZhbHVlXHJcbn1cclxuXHJcbmZ1bmN0aW9uIGNyZWF0ZUVkaXRSZW5kZXIgKGRlZmF1bHRQcm9wcz86IHsgW2tleTogc3RyaW5nXTogYW55IH0pIHtcclxuICByZXR1cm4gZnVuY3Rpb24gKGg6IENyZWF0ZUVsZW1lbnQsIHJlbmRlck9wdHM6IENvbHVtbkVkaXRSZW5kZXJPcHRpb25zLCBwYXJhbXM6IENvbHVtbkVkaXRSZW5kZXJQYXJhbXMpIHtcclxuICAgIGNvbnN0IHsgcm93LCBjb2x1bW4gfSA9IHBhcmFtc1xyXG4gICAgY29uc3QgeyBhdHRycyB9ID0gcmVuZGVyT3B0c1xyXG4gICAgY29uc3QgY2VsbFZhbHVlID0gWEVVdGlscy5nZXQocm93LCBjb2x1bW4ucHJvcGVydHkpXHJcbiAgICByZXR1cm4gW1xyXG4gICAgICBoKHJlbmRlck9wdHMubmFtZSwge1xyXG4gICAgICAgIGF0dHJzLFxyXG4gICAgICAgIHByb3BzOiBnZXRDZWxsRWRpdEZpbHRlclByb3BzKHJlbmRlck9wdHMsIHBhcmFtcywgY2VsbFZhbHVlLCBkZWZhdWx0UHJvcHMpLFxyXG4gICAgICAgIG9uOiBnZXRFZGl0T25zKHJlbmRlck9wdHMsIHBhcmFtcylcclxuICAgICAgfSlcclxuICAgIF1cclxuICB9XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGRlZmF1bHRCdXR0b25FZGl0UmVuZGVyIChoOiBDcmVhdGVFbGVtZW50LCByZW5kZXJPcHRzOiBDb2x1bW5FZGl0UmVuZGVyT3B0aW9ucywgcGFyYW1zOiBDb2x1bW5FZGl0UmVuZGVyUGFyYW1zKSB7XHJcbiAgY29uc3QgeyBhdHRycyB9ID0gcmVuZGVyT3B0c1xyXG4gIHJldHVybiBbXHJcbiAgICBoKCdCdXR0b24nLCB7XHJcbiAgICAgIGF0dHJzLFxyXG4gICAgICBwcm9wczogZ2V0Q2VsbEVkaXRGaWx0ZXJQcm9wcyhyZW5kZXJPcHRzLCBwYXJhbXMsIG51bGwpLFxyXG4gICAgICBvbjogZ2V0T25zKHJlbmRlck9wdHMsIHBhcmFtcylcclxuICAgIH0sIGNlbGxUZXh0KGgsIHJlbmRlck9wdHMuY29udGVudCkpXHJcbiAgXVxyXG59XHJcblxyXG5mdW5jdGlvbiBkZWZhdWx0QnV0dG9uc0VkaXRSZW5kZXIgKGg6IENyZWF0ZUVsZW1lbnQsIHJlbmRlck9wdHM6IENvbHVtbkVkaXRSZW5kZXJPcHRpb25zLCBwYXJhbXM6IENvbHVtbkVkaXRSZW5kZXJQYXJhbXMpIHtcclxuICByZXR1cm4gcmVuZGVyT3B0cy5jaGlsZHJlbi5tYXAoKGNoaWxkUmVuZGVyT3B0czogQ29sdW1uRWRpdFJlbmRlck9wdGlvbnMpID0+IGRlZmF1bHRCdXR0b25FZGl0UmVuZGVyKGgsIGNoaWxkUmVuZGVyT3B0cywgcGFyYW1zKVswXSlcclxufVxyXG5cclxuZnVuY3Rpb24gY3JlYXRlRmlsdGVyUmVuZGVyIChkZWZhdWx0UHJvcHM/OiB7IFtrZXk6IHN0cmluZ106IGFueSB9KSB7XHJcbiAgcmV0dXJuIGZ1bmN0aW9uIChoOiBDcmVhdGVFbGVtZW50LCByZW5kZXJPcHRzOiBDb2x1bW5GaWx0ZXJSZW5kZXJPcHRpb25zLCBwYXJhbXM6IENvbHVtbkZpbHRlclJlbmRlclBhcmFtcykge1xyXG4gICAgY29uc3QgeyBjb2x1bW4gfSA9IHBhcmFtc1xyXG4gICAgY29uc3QgeyBuYW1lLCBhdHRycyB9ID0gcmVuZGVyT3B0c1xyXG4gICAgcmV0dXJuIGNvbHVtbi5maWx0ZXJzLm1hcCgob3B0aW9uLCBvSW5kZXgpID0+IHtcclxuICAgICAgY29uc3Qgb3B0aW9uVmFsdWUgPSBvcHRpb24uZGF0YVxyXG4gICAgICByZXR1cm4gaChuYW1lLCB7XHJcbiAgICAgICAga2V5OiBvSW5kZXgsXHJcbiAgICAgICAgYXR0cnMsXHJcbiAgICAgICAgcHJvcHM6IGdldENlbGxFZGl0RmlsdGVyUHJvcHMocmVuZGVyT3B0cywgcGFyYW1zLCBvcHRpb25WYWx1ZSwgZGVmYXVsdFByb3BzKSxcclxuICAgICAgICBvbjogZ2V0RmlsdGVyT25zKHJlbmRlck9wdHMsIHBhcmFtcywgb3B0aW9uLCAoKSA9PiB7XHJcbiAgICAgICAgICAvLyDlpITnkIYgY2hhbmdlIOS6i+S7tuebuOWFs+mAu+i+kVxyXG4gICAgICAgICAgaGFuZGxlQ29uZmlybUZpbHRlcihwYXJhbXMsICEhb3B0aW9uLmRhdGEsIG9wdGlvbilcclxuICAgICAgICB9KVxyXG4gICAgICB9KVxyXG4gICAgfSlcclxuICB9XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGhhbmRsZUNvbmZpcm1GaWx0ZXIgKHBhcmFtczogQ29sdW1uRmlsdGVyUmVuZGVyUGFyYW1zLCBjaGVja2VkOiBib29sZWFuLCBvcHRpb246IENvbHVtbkZpbHRlclBhcmFtcykge1xyXG4gIGNvbnN0IHsgJHBhbmVsIH0gPSBwYXJhbXNcclxuICAkcGFuZWwuY2hhbmdlT3B0aW9uKHt9LCBjaGVja2VkLCBvcHRpb24pXHJcbn1cclxuXHJcbmZ1bmN0aW9uIGRlZmF1bHRGaWx0ZXJNZXRob2QgKHBhcmFtczogQ29sdW1uRmlsdGVyTWV0aG9kUGFyYW1zKSB7XHJcbiAgY29uc3QgeyBvcHRpb24sIHJvdywgY29sdW1uIH0gPSBwYXJhbXNcclxuICBjb25zdCB7IGRhdGEgfSA9IG9wdGlvblxyXG4gIGNvbnN0IGNlbGxWYWx1ZSA9IFhFVXRpbHMuZ2V0KHJvdywgY29sdW1uLnByb3BlcnR5KVxyXG4gIC8qIGVzbGludC1kaXNhYmxlIGVxZXFlcSAqL1xyXG4gIHJldHVybiBjZWxsVmFsdWUgPT09IGRhdGFcclxufVxyXG5cclxuZnVuY3Rpb24gcmVuZGVyT3B0aW9ucyAoaDogQ3JlYXRlRWxlbWVudCwgb3B0aW9uczogYW55W10sIG9wdGlvblByb3BzOiBPcHRpb25Qcm9wcykge1xyXG4gIGNvbnN0IGxhYmVsUHJvcCA9IG9wdGlvblByb3BzLmxhYmVsIHx8ICdsYWJlbCdcclxuICBjb25zdCB2YWx1ZVByb3AgPSBvcHRpb25Qcm9wcy52YWx1ZSB8fCAndmFsdWUnXHJcbiAgY29uc3QgZGlzYWJsZWRQcm9wID0gb3B0aW9uUHJvcHMuZGlzYWJsZWQgfHwgJ2Rpc2FibGVkJ1xyXG4gIHJldHVybiBYRVV0aWxzLm1hcChvcHRpb25zLCAoaXRlbSwgb0luZGV4KSA9PiB7XHJcbiAgICByZXR1cm4gaCgnT3B0aW9uJywge1xyXG4gICAgICBrZXk6IG9JbmRleCxcclxuICAgICAgcHJvcHM6IHtcclxuICAgICAgICB2YWx1ZTogaXRlbVt2YWx1ZVByb3BdLFxyXG4gICAgICAgIGxhYmVsOiBpdGVtW2xhYmVsUHJvcF0sXHJcbiAgICAgICAgZGlzYWJsZWQ6IGl0ZW1bZGlzYWJsZWRQcm9wXVxyXG4gICAgICB9XHJcbiAgICB9KVxyXG4gIH0pXHJcbn1cclxuXHJcbmZ1bmN0aW9uIGNlbGxUZXh0IChoOiBDcmVhdGVFbGVtZW50LCBjZWxsVmFsdWU6IGFueSkge1xyXG4gIHJldHVybiBbJycgKyAoaXNFbXB0eVZhbHVlKGNlbGxWYWx1ZSkgPyAnJyA6IGNlbGxWYWx1ZSldXHJcbn1cclxuXHJcbmZ1bmN0aW9uIGNyZWF0ZUZvcm1JdGVtUmVuZGVyIChkZWZhdWx0UHJvcHM/OiB7IFtrZXk6IHN0cmluZ106IGFueSB9KSB7XHJcbiAgcmV0dXJuIGZ1bmN0aW9uIChoOiBDcmVhdGVFbGVtZW50LCByZW5kZXJPcHRzOiBGb3JtSXRlbVJlbmRlck9wdGlvbnMsIHBhcmFtczogRm9ybUl0ZW1SZW5kZXJQYXJhbXMpIHtcclxuICAgIGNvbnN0IHsgZGF0YSwgcHJvcGVydHkgfSA9IHBhcmFtc1xyXG4gICAgY29uc3QgeyBuYW1lIH0gPSByZW5kZXJPcHRzXHJcbiAgICBjb25zdCB7IGF0dHJzIH0gPSByZW5kZXJPcHRzXHJcbiAgICBjb25zdCBpdGVtVmFsdWUgPSBYRVV0aWxzLmdldChkYXRhLCBwcm9wZXJ0eSlcclxuICAgIHJldHVybiBbXHJcbiAgICAgIGgobmFtZSwge1xyXG4gICAgICAgIGF0dHJzLFxyXG4gICAgICAgIHByb3BzOiBnZXRJdGVtUHJvcHMocmVuZGVyT3B0cywgcGFyYW1zLCBpdGVtVmFsdWUsIGRlZmF1bHRQcm9wcyksXHJcbiAgICAgICAgb246IGdldEl0ZW1PbnMocmVuZGVyT3B0cywgcGFyYW1zKVxyXG4gICAgICB9KVxyXG4gICAgXVxyXG4gIH1cclxufVxyXG5cclxuZnVuY3Rpb24gZGVmYXVsdEJ1dHRvbkl0ZW1SZW5kZXIgKGg6IENyZWF0ZUVsZW1lbnQsIHJlbmRlck9wdHM6IEZvcm1JdGVtUmVuZGVyT3B0aW9ucywgcGFyYW1zOiBGb3JtSXRlbVJlbmRlclBhcmFtcykge1xyXG4gIGNvbnN0IHsgYXR0cnMgfSA9IHJlbmRlck9wdHNcclxuICBjb25zdCBwcm9wcyA9IGdldEl0ZW1Qcm9wcyhyZW5kZXJPcHRzLCBwYXJhbXMsIG51bGwpXHJcbiAgcmV0dXJuIFtcclxuICAgIGgoJ0J1dHRvbicsIHtcclxuICAgICAgYXR0cnMsXHJcbiAgICAgIHByb3BzLFxyXG4gICAgICBvbjogZ2V0T25zKHJlbmRlck9wdHMsIHBhcmFtcylcclxuICAgIH0sIGNlbGxUZXh0KGgsIHJlbmRlck9wdHMuY29udGVudCB8fCBwcm9wcy5jb250ZW50KSlcclxuICBdXHJcbn1cclxuXHJcbmZ1bmN0aW9uIGRlZmF1bHRCdXR0b25zSXRlbVJlbmRlciAoaDogQ3JlYXRlRWxlbWVudCwgcmVuZGVyT3B0czogRm9ybUl0ZW1SZW5kZXJPcHRpb25zLCBwYXJhbXM6IEZvcm1JdGVtUmVuZGVyUGFyYW1zKSB7XHJcbiAgcmV0dXJuIHJlbmRlck9wdHMuY2hpbGRyZW4ubWFwKChjaGlsZFJlbmRlck9wdHM6IEZvcm1JdGVtUmVuZGVyT3B0aW9ucykgPT4gZGVmYXVsdEJ1dHRvbkl0ZW1SZW5kZXIoaCwgY2hpbGRSZW5kZXJPcHRzLCBwYXJhbXMpWzBdKVxyXG59XHJcblxyXG5mdW5jdGlvbiBjcmVhdGVFeHBvcnRNZXRob2QgKHZhbHVlTWV0aG9kOiBGdW5jdGlvbiwgaXNFZGl0PzogYm9vbGVhbikge1xyXG4gIGNvbnN0IHJlbmRlclByb3BlcnR5ID0gaXNFZGl0ID8gJ2VkaXRSZW5kZXInIDogJ2NlbGxSZW5kZXInXHJcbiAgcmV0dXJuIGZ1bmN0aW9uIChwYXJhbXM6IENvbHVtbkV4cG9ydENlbGxSZW5kZXJQYXJhbXMpIHtcclxuICAgIHJldHVybiB2YWx1ZU1ldGhvZChwYXJhbXMuY29sdW1uW3JlbmRlclByb3BlcnR5XSwgcGFyYW1zKVxyXG4gIH1cclxufVxyXG5cclxuZnVuY3Rpb24gY3JlYXRlRm9ybUl0ZW1SYWRpb0FuZENoZWNrYm94UmVuZGVyICgpIHtcclxuICByZXR1cm4gZnVuY3Rpb24gKGg6IENyZWF0ZUVsZW1lbnQsIHJlbmRlck9wdHM6IEZvcm1JdGVtUmVuZGVyT3B0aW9ucywgcGFyYW1zOiBGb3JtSXRlbVJlbmRlclBhcmFtcykge1xyXG4gICAgY29uc3QgeyBuYW1lLCBvcHRpb25zID0gW10sIG9wdGlvblByb3BzID0ge30gfSA9IHJlbmRlck9wdHNcclxuICAgIGNvbnN0IHsgZGF0YSwgcHJvcGVydHkgfSA9IHBhcmFtc1xyXG4gICAgY29uc3QgeyBhdHRycyB9ID0gcmVuZGVyT3B0c1xyXG4gICAgY29uc3QgbGFiZWxQcm9wID0gb3B0aW9uUHJvcHMubGFiZWwgfHwgJ2xhYmVsJ1xyXG4gICAgY29uc3QgdmFsdWVQcm9wID0gb3B0aW9uUHJvcHMudmFsdWUgfHwgJ3ZhbHVlJ1xyXG4gICAgY29uc3QgZGlzYWJsZWRQcm9wID0gb3B0aW9uUHJvcHMuZGlzYWJsZWQgfHwgJ2Rpc2FibGVkJ1xyXG4gICAgY29uc3QgaXRlbVZhbHVlID0gWEVVdGlscy5nZXQoZGF0YSwgcHJvcGVydHkpXHJcbiAgICByZXR1cm4gW1xyXG4gICAgICBoKGAke25hbWV9R3JvdXBgLCB7XHJcbiAgICAgICAgYXR0cnMsXHJcbiAgICAgICAgcHJvcHM6IGdldEl0ZW1Qcm9wcyhyZW5kZXJPcHRzLCBwYXJhbXMsIGl0ZW1WYWx1ZSksXHJcbiAgICAgICAgb246IGdldEl0ZW1PbnMocmVuZGVyT3B0cywgcGFyYW1zKVxyXG4gICAgICB9LCBvcHRpb25zLm1hcCgob3B0aW9uKSA9PiB7XHJcbiAgICAgICAgcmV0dXJuIGgobmFtZSwge1xyXG4gICAgICAgICAgcHJvcHM6IHtcclxuICAgICAgICAgICAgbGFiZWw6IG9wdGlvblt2YWx1ZVByb3BdLFxyXG4gICAgICAgICAgICBkaXNhYmxlZDogb3B0aW9uW2Rpc2FibGVkUHJvcF1cclxuICAgICAgICAgIH1cclxuICAgICAgICB9LCBvcHRpb25bbGFiZWxQcm9wXSlcclxuICAgICAgfSkpXHJcbiAgICBdXHJcbiAgfVxyXG59XHJcblxyXG4vKipcclxuICog5riy5p+T5Ye95pWwXHJcbiAqL1xyXG5jb25zdCByZW5kZXJNYXA6IGFueSA9IHtcclxuICBJbnB1dDoge1xyXG4gICAgYXV0b2ZvY3VzOiAnaW5wdXQuaXZ1LWlucHV0JyxcclxuICAgIHJlbmRlckRlZmF1bHQ6IGNyZWF0ZUVkaXRSZW5kZXIoKSxcclxuICAgIHJlbmRlckVkaXQ6IGNyZWF0ZUVkaXRSZW5kZXIoKSxcclxuICAgIHJlbmRlckZpbHRlcjogY3JlYXRlRmlsdGVyUmVuZGVyKCksXHJcbiAgICBmaWx0ZXJNZXRob2Q6IGRlZmF1bHRGaWx0ZXJNZXRob2QsXHJcbiAgICByZW5kZXJJdGVtOiBjcmVhdGVGb3JtSXRlbVJlbmRlcigpXHJcbiAgfSxcclxuICBBdXRvQ29tcGxldGU6IHtcclxuICAgIGF1dG9mb2N1czogJ2lucHV0Lml2dS1pbnB1dCcsXHJcbiAgICByZW5kZXJEZWZhdWx0OiBjcmVhdGVFZGl0UmVuZGVyKCksXHJcbiAgICByZW5kZXJFZGl0OiBjcmVhdGVFZGl0UmVuZGVyKCksXHJcbiAgICByZW5kZXJGaWx0ZXI6IGNyZWF0ZUZpbHRlclJlbmRlcigpLFxyXG4gICAgZmlsdGVyTWV0aG9kOiBkZWZhdWx0RmlsdGVyTWV0aG9kLFxyXG4gICAgcmVuZGVySXRlbTogY3JlYXRlRm9ybUl0ZW1SZW5kZXIoKVxyXG4gIH0sXHJcbiAgSW5wdXROdW1iZXI6IHtcclxuICAgIGF1dG9mb2N1czogJ2lucHV0Lml2dS1pbnB1dC1udW1iZXItaW5wdXQnLFxyXG4gICAgcmVuZGVyRGVmYXVsdDogY3JlYXRlRWRpdFJlbmRlcigpLFxyXG4gICAgcmVuZGVyRWRpdDogY3JlYXRlRWRpdFJlbmRlcigpLFxyXG4gICAgcmVuZGVyRmlsdGVyOiBjcmVhdGVGaWx0ZXJSZW5kZXIoKSxcclxuICAgIGZpbHRlck1ldGhvZDogZGVmYXVsdEZpbHRlck1ldGhvZCxcclxuICAgIHJlbmRlckl0ZW06IGNyZWF0ZUZvcm1JdGVtUmVuZGVyKClcclxuICB9LFxyXG4gIFNlbGVjdDoge1xyXG4gICAgcmVuZGVyRWRpdCAoaDogQ3JlYXRlRWxlbWVudCwgcmVuZGVyT3B0czogQ29sdW1uRWRpdFJlbmRlck9wdGlvbnMsIHBhcmFtczogQ29sdW1uRWRpdFJlbmRlclBhcmFtcykge1xyXG4gICAgICBjb25zdCB7IG9wdGlvbnMgPSBbXSwgb3B0aW9uR3JvdXBzLCBvcHRpb25Qcm9wcyA9IHt9LCBvcHRpb25Hcm91cFByb3BzID0ge30gfSA9IHJlbmRlck9wdHNcclxuICAgICAgY29uc3QgeyByb3csIGNvbHVtbiB9ID0gcGFyYW1zXHJcbiAgICAgIGNvbnN0IHsgYXR0cnMgfSA9IHJlbmRlck9wdHNcclxuICAgICAgY29uc3QgY2VsbFZhbHVlID0gWEVVdGlscy5nZXQocm93LCBjb2x1bW4ucHJvcGVydHkpXHJcbiAgICAgIGNvbnN0IHByb3BzID0gZ2V0Q2VsbEVkaXRGaWx0ZXJQcm9wcyhyZW5kZXJPcHRzLCBwYXJhbXMsIGNlbGxWYWx1ZSlcclxuICAgICAgY29uc3Qgb24gPSBnZXRFZGl0T25zKHJlbmRlck9wdHMsIHBhcmFtcylcclxuICAgICAgaWYgKG9wdGlvbkdyb3Vwcykge1xyXG4gICAgICAgIGNvbnN0IGdyb3VwT3B0aW9ucyA9IG9wdGlvbkdyb3VwUHJvcHMub3B0aW9ucyB8fCAnb3B0aW9ucydcclxuICAgICAgICBjb25zdCBncm91cExhYmVsID0gb3B0aW9uR3JvdXBQcm9wcy5sYWJlbCB8fCAnbGFiZWwnXHJcbiAgICAgICAgcmV0dXJuIFtcclxuICAgICAgICAgIGgoJ1NlbGVjdCcsIHtcclxuICAgICAgICAgICAgYXR0cnMsXHJcbiAgICAgICAgICAgIHByb3BzLFxyXG4gICAgICAgICAgICBvblxyXG4gICAgICAgICAgfSwgWEVVdGlscy5tYXAob3B0aW9uR3JvdXBzLCAoZ3JvdXAsIGdJbmRleCkgPT4ge1xyXG4gICAgICAgICAgICByZXR1cm4gaCgnT3B0aW9uR3JvdXAnLCB7XHJcbiAgICAgICAgICAgICAgcHJvcHM6IHtcclxuICAgICAgICAgICAgICAgIGxhYmVsOiBncm91cFtncm91cExhYmVsXVxyXG4gICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAga2V5OiBnSW5kZXhcclxuICAgICAgICAgICAgfSwgcmVuZGVyT3B0aW9ucyhoLCBncm91cFtncm91cE9wdGlvbnNdLCBvcHRpb25Qcm9wcykpXHJcbiAgICAgICAgICB9KSlcclxuICAgICAgICBdXHJcbiAgICAgIH1cclxuICAgICAgcmV0dXJuIFtcclxuICAgICAgICBoKCdTZWxlY3QnLCB7XHJcbiAgICAgICAgICBhdHRycyxcclxuICAgICAgICAgIHByb3BzLFxyXG4gICAgICAgICAgb25cclxuICAgICAgICB9LCByZW5kZXJPcHRpb25zKGgsIG9wdGlvbnMsIG9wdGlvblByb3BzKSlcclxuICAgICAgXVxyXG4gICAgfSxcclxuICAgIHJlbmRlckNlbGwgKGg6IENyZWF0ZUVsZW1lbnQsIHJlbmRlck9wdHM6IENvbHVtbkNlbGxSZW5kZXJPcHRpb25zLCBwYXJhbXM6IENvbHVtbkNlbGxSZW5kZXJQYXJhbXMpIHtcclxuICAgICAgcmV0dXJuIGNlbGxUZXh0KGgsIGdldFNlbGVjdENlbGxWYWx1ZShyZW5kZXJPcHRzLCBwYXJhbXMpKVxyXG4gICAgfSxcclxuICAgIHJlbmRlckZpbHRlciAoaDogQ3JlYXRlRWxlbWVudCwgcmVuZGVyT3B0czogQ29sdW1uRmlsdGVyUmVuZGVyT3B0aW9ucywgcGFyYW1zOiBDb2x1bW5GaWx0ZXJSZW5kZXJQYXJhbXMpIHtcclxuICAgICAgY29uc3QgeyBvcHRpb25zID0gW10sIG9wdGlvbkdyb3Vwcywgb3B0aW9uUHJvcHMgPSB7fSwgb3B0aW9uR3JvdXBQcm9wcyA9IHt9IH0gPSByZW5kZXJPcHRzXHJcbiAgICAgIGNvbnN0IHsgY29sdW1uIH0gPSBwYXJhbXNcclxuICAgICAgY29uc3QgeyBhdHRycyB9ID0gcmVuZGVyT3B0c1xyXG4gICAgICBpZiAob3B0aW9uR3JvdXBzKSB7XHJcbiAgICAgICAgY29uc3QgZ3JvdXBPcHRpb25zID0gb3B0aW9uR3JvdXBQcm9wcy5vcHRpb25zIHx8ICdvcHRpb25zJ1xyXG4gICAgICAgIGNvbnN0IGdyb3VwTGFiZWwgPSBvcHRpb25Hcm91cFByb3BzLmxhYmVsIHx8ICdsYWJlbCdcclxuICAgICAgICByZXR1cm4gY29sdW1uLmZpbHRlcnMubWFwKChvcHRpb24sIG9JbmRleCkgPT4ge1xyXG4gICAgICAgICAgY29uc3Qgb3B0aW9uVmFsdWUgPSBvcHRpb24uZGF0YVxyXG4gICAgICAgICAgcmV0dXJuIGgoJ1NlbGVjdCcsIHtcclxuICAgICAgICAgICAga2V5OiBvSW5kZXgsXHJcbiAgICAgICAgICAgIGF0dHJzLFxyXG4gICAgICAgICAgICBwcm9wczogZ2V0Q2VsbEVkaXRGaWx0ZXJQcm9wcyhyZW5kZXJPcHRzLCBwYXJhbXMsIG9wdGlvblZhbHVlKSxcclxuICAgICAgICAgICAgb246IGdldEZpbHRlck9ucyhyZW5kZXJPcHRzLCBwYXJhbXMsIG9wdGlvbiwgKCkgPT4ge1xyXG4gICAgICAgICAgICAgIC8vIOWkhOeQhiBjaGFuZ2Ug5LqL5Lu255u45YWz6YC76L6RXHJcbiAgICAgICAgICAgICAgaGFuZGxlQ29uZmlybUZpbHRlcihwYXJhbXMsIG9wdGlvbi5kYXRhICYmIG9wdGlvbi5kYXRhLmxlbmd0aCA+IDAsIG9wdGlvbilcclxuICAgICAgICAgICAgfSlcclxuICAgICAgICAgIH0sIFhFVXRpbHMubWFwKG9wdGlvbkdyb3VwcywgKGdyb3VwLCBnSW5kZXgpID0+IHtcclxuICAgICAgICAgICAgcmV0dXJuIGgoJ09wdGlvbkdyb3VwJywge1xyXG4gICAgICAgICAgICAgIGtleTogZ0luZGV4LFxyXG4gICAgICAgICAgICAgIHByb3BzOiB7XHJcbiAgICAgICAgICAgICAgICBsYWJlbDogZ3JvdXBbZ3JvdXBMYWJlbF1cclxuICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0sIHJlbmRlck9wdGlvbnMoaCwgZ3JvdXBbZ3JvdXBPcHRpb25zXSwgb3B0aW9uUHJvcHMpKVxyXG4gICAgICAgICAgfSkpXHJcbiAgICAgICAgfSlcclxuICAgICAgfVxyXG4gICAgICByZXR1cm4gY29sdW1uLmZpbHRlcnMubWFwKChvcHRpb24sIG9JbmRleCkgPT4ge1xyXG4gICAgICAgIGNvbnN0IG9wdGlvblZhbHVlID0gb3B0aW9uLmRhdGFcclxuICAgICAgICByZXR1cm4gaCgnU2VsZWN0Jywge1xyXG4gICAgICAgICAga2V5OiBvSW5kZXgsXHJcbiAgICAgICAgICBhdHRycyxcclxuICAgICAgICAgIHByb3BzOiBnZXRDZWxsRWRpdEZpbHRlclByb3BzKHJlbmRlck9wdHMsIHBhcmFtcywgb3B0aW9uVmFsdWUpLFxyXG4gICAgICAgICAgb246IGdldEZpbHRlck9ucyhyZW5kZXJPcHRzLCBwYXJhbXMsIG9wdGlvbiwgKCkgPT4ge1xyXG4gICAgICAgICAgICAvLyDlpITnkIYgY2hhbmdlIOS6i+S7tuebuOWFs+mAu+i+kVxyXG4gICAgICAgICAgICBoYW5kbGVDb25maXJtRmlsdGVyKHBhcmFtcywgb3B0aW9uLmRhdGEgJiYgb3B0aW9uLmRhdGEubGVuZ3RoID4gMCwgb3B0aW9uKVxyXG4gICAgICAgICAgfSlcclxuICAgICAgICB9LCByZW5kZXJPcHRpb25zKGgsIG9wdGlvbnMsIG9wdGlvblByb3BzKSlcclxuICAgICAgfSlcclxuICAgIH0sXHJcbiAgICBmaWx0ZXJNZXRob2QgKHBhcmFtczogQ29sdW1uRmlsdGVyTWV0aG9kUGFyYW1zKSB7XHJcbiAgICAgIGNvbnN0IHsgb3B0aW9uLCByb3csIGNvbHVtbiB9ID0gcGFyYW1zXHJcbiAgICAgIGNvbnN0IHsgZGF0YSB9ID0gb3B0aW9uXHJcbiAgICAgIGNvbnN0IHsgcHJvcGVydHksIGZpbHRlclJlbmRlcjogcmVuZGVyT3B0cyB9ID0gY29sdW1uXHJcbiAgICAgIGNvbnN0IHsgcHJvcHMgPSB7fSB9ID0gcmVuZGVyT3B0c1xyXG4gICAgICBjb25zdCBjZWxsVmFsdWUgPSBYRVV0aWxzLmdldChyb3csIHByb3BlcnR5KVxyXG4gICAgICBpZiAocHJvcHMubXVsdGlwbGUpIHtcclxuICAgICAgICBpZiAoWEVVdGlscy5pc0FycmF5KGNlbGxWYWx1ZSkpIHtcclxuICAgICAgICAgIHJldHVybiBYRVV0aWxzLmluY2x1ZGVBcnJheXMoY2VsbFZhbHVlLCBkYXRhKVxyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gZGF0YS5pbmRleE9mKGNlbGxWYWx1ZSkgPiAtMVxyXG4gICAgICB9XHJcbiAgICAgIC8qIGVzbGludC1kaXNhYmxlIGVxZXFlcSAqL1xyXG4gICAgICByZXR1cm4gY2VsbFZhbHVlID09IGRhdGFcclxuICAgIH0sXHJcbiAgICByZW5kZXJJdGVtIChoOiBDcmVhdGVFbGVtZW50LCByZW5kZXJPcHRzOiBGb3JtSXRlbVJlbmRlck9wdGlvbnMsIHBhcmFtczogRm9ybUl0ZW1SZW5kZXJQYXJhbXMpIHtcclxuICAgICAgY29uc3QgeyBvcHRpb25zID0gW10sIG9wdGlvbkdyb3Vwcywgb3B0aW9uUHJvcHMgPSB7fSwgb3B0aW9uR3JvdXBQcm9wcyA9IHt9IH0gPSByZW5kZXJPcHRzXHJcbiAgICAgIGNvbnN0IHsgZGF0YSwgcHJvcGVydHkgfSA9IHBhcmFtc1xyXG4gICAgICBjb25zdCB7IGF0dHJzIH0gPSByZW5kZXJPcHRzXHJcbiAgICAgIGNvbnN0IGl0ZW1WYWx1ZSA9IFhFVXRpbHMuZ2V0KGRhdGEsIHByb3BlcnR5KVxyXG4gICAgICBjb25zdCBwcm9wcyA9IGdldEl0ZW1Qcm9wcyhyZW5kZXJPcHRzLCBwYXJhbXMsIGl0ZW1WYWx1ZSlcclxuICAgICAgY29uc3Qgb24gPSBnZXRJdGVtT25zKHJlbmRlck9wdHMsIHBhcmFtcylcclxuICAgICAgaWYgKG9wdGlvbkdyb3Vwcykge1xyXG4gICAgICAgIGNvbnN0IGdyb3VwT3B0aW9ucyA9IG9wdGlvbkdyb3VwUHJvcHMub3B0aW9ucyB8fCAnb3B0aW9ucydcclxuICAgICAgICBjb25zdCBncm91cExhYmVsID0gb3B0aW9uR3JvdXBQcm9wcy5sYWJlbCB8fCAnbGFiZWwnXHJcbiAgICAgICAgcmV0dXJuIFtcclxuICAgICAgICAgIGgoJ1NlbGVjdCcsIHtcclxuICAgICAgICAgICAgcHJvcHMsXHJcbiAgICAgICAgICAgIGF0dHJzLFxyXG4gICAgICAgICAgICBvblxyXG4gICAgICAgICAgfSwgWEVVdGlscy5tYXAob3B0aW9uR3JvdXBzLCAoZ3JvdXAsIGdJbmRleCkgPT4ge1xyXG4gICAgICAgICAgICByZXR1cm4gaCgnT3B0aW9uR3JvdXAnLCB7XHJcbiAgICAgICAgICAgICAga2V5OiBnSW5kZXgsXHJcbiAgICAgICAgICAgICAgcHJvcHM6IHtcclxuICAgICAgICAgICAgICAgIGxhYmVsOiBncm91cFtncm91cExhYmVsXVxyXG4gICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSwgcmVuZGVyT3B0aW9ucyhoLCBncm91cFtncm91cE9wdGlvbnNdLCBvcHRpb25Qcm9wcykpXHJcbiAgICAgICAgICB9KSlcclxuICAgICAgICBdXHJcbiAgICAgIH1cclxuICAgICAgcmV0dXJuIFtcclxuICAgICAgICBoKCdTZWxlY3QnLCB7XHJcbiAgICAgICAgICBwcm9wcyxcclxuICAgICAgICAgIGF0dHJzLFxyXG4gICAgICAgICAgb25cclxuICAgICAgICB9LCByZW5kZXJPcHRpb25zKGgsIG9wdGlvbnMsIG9wdGlvblByb3BzKSlcclxuICAgICAgXVxyXG4gICAgfSxcclxuICAgIGNlbGxFeHBvcnRNZXRob2Q6IGNyZWF0ZUV4cG9ydE1ldGhvZChnZXRTZWxlY3RDZWxsVmFsdWUpLFxyXG4gICAgZWRpdENlbGxFeHBvcnRNZXRob2Q6IGNyZWF0ZUV4cG9ydE1ldGhvZChnZXRTZWxlY3RDZWxsVmFsdWUsIHRydWUpXHJcbiAgfSxcclxuICBDYXNjYWRlcjoge1xyXG4gICAgcmVuZGVyRWRpdDogY3JlYXRlRWRpdFJlbmRlcih7IHRyYW5zZmVyOiB0cnVlIH0pLFxyXG4gICAgcmVuZGVyQ2VsbCAoaDogQ3JlYXRlRWxlbWVudCwgcmVuZGVyT3B0czogQ29sdW1uQ2VsbFJlbmRlck9wdGlvbnMsIHBhcmFtczogQ29sdW1uRWRpdFJlbmRlclBhcmFtcykge1xyXG4gICAgICByZXR1cm4gY2VsbFRleHQoaCwgZ2V0Q2FzY2FkZXJDZWxsVmFsdWUocmVuZGVyT3B0cywgcGFyYW1zKSlcclxuICAgIH0sXHJcbiAgICByZW5kZXJJdGVtOiBjcmVhdGVGb3JtSXRlbVJlbmRlcigpLFxyXG4gICAgY2VsbEV4cG9ydE1ldGhvZDogY3JlYXRlRXhwb3J0TWV0aG9kKGdldENhc2NhZGVyQ2VsbFZhbHVlKSxcclxuICAgIGVkaXRDZWxsRXhwb3J0TWV0aG9kOiBjcmVhdGVFeHBvcnRNZXRob2QoZ2V0Q2FzY2FkZXJDZWxsVmFsdWUsIHRydWUpXHJcbiAgfSxcclxuICBEYXRlUGlja2VyOiB7XHJcbiAgICByZW5kZXJFZGl0OiBjcmVhdGVFZGl0UmVuZGVyKHsgdHJhbnNmZXI6IHRydWUgfSksXHJcbiAgICByZW5kZXJDZWxsIChoOiBDcmVhdGVFbGVtZW50LCByZW5kZXJPcHRzOiBDb2x1bW5DZWxsUmVuZGVyT3B0aW9ucywgcGFyYW1zOiBDb2x1bW5FZGl0UmVuZGVyUGFyYW1zKSB7XHJcbiAgICAgIHJldHVybiBjZWxsVGV4dChoLCBnZXREYXRlUGlja2VyQ2VsbFZhbHVlKHJlbmRlck9wdHMsIHBhcmFtcykpXHJcbiAgICB9LFxyXG4gICAgcmVuZGVyRmlsdGVyIChoOiBDcmVhdGVFbGVtZW50LCByZW5kZXJPcHRzOiBDb2x1bW5GaWx0ZXJSZW5kZXJPcHRpb25zLCBwYXJhbXM6IENvbHVtbkZpbHRlclJlbmRlclBhcmFtcykge1xyXG4gICAgICBjb25zdCB7IGNvbHVtbiB9ID0gcGFyYW1zXHJcbiAgICAgIGNvbnN0IHsgYXR0cnMgfSA9IHJlbmRlck9wdHNcclxuICAgICAgcmV0dXJuIGNvbHVtbi5maWx0ZXJzLm1hcCgob3B0aW9uLCBvSW5kZXgpID0+IHtcclxuICAgICAgICBjb25zdCBvcHRpb25WYWx1ZSA9IG9wdGlvbi5kYXRhXHJcbiAgICAgICAgcmV0dXJuIGgocmVuZGVyT3B0cy5uYW1lLCB7XHJcbiAgICAgICAgICBrZXk6IG9JbmRleCxcclxuICAgICAgICAgIGF0dHJzLFxyXG4gICAgICAgICAgcHJvcHM6IGdldENlbGxFZGl0RmlsdGVyUHJvcHMocmVuZGVyT3B0cywgcGFyYW1zLCBvcHRpb25WYWx1ZSksXHJcbiAgICAgICAgICBvbjogZ2V0RmlsdGVyT25zKHJlbmRlck9wdHMsIHBhcmFtcywgb3B0aW9uLCAoKSA9PiB7XHJcbiAgICAgICAgICAgIC8vIOWkhOeQhiBjaGFuZ2Ug5LqL5Lu255u45YWz6YC76L6RXHJcbiAgICAgICAgICAgIGhhbmRsZUNvbmZpcm1GaWx0ZXIocGFyYW1zLCAhIW9wdGlvbi5kYXRhLCBvcHRpb24pXHJcbiAgICAgICAgICB9KVxyXG4gICAgICAgIH0pXHJcbiAgICAgIH0pXHJcbiAgICB9LFxyXG4gICAgZmlsdGVyTWV0aG9kIChwYXJhbXM6IENvbHVtbkZpbHRlck1ldGhvZFBhcmFtcykge1xyXG4gICAgICBjb25zdCB7IG9wdGlvbiwgcm93LCBjb2x1bW4gfSA9IHBhcmFtc1xyXG4gICAgICBjb25zdCB7IGRhdGEgfSA9IG9wdGlvblxyXG4gICAgICBjb25zdCB7IGZpbHRlclJlbmRlcjogcmVuZGVyT3B0cyB9ID0gY29sdW1uXHJcbiAgICAgIGNvbnN0IHsgcHJvcHMgPSB7fSB9ID0gcmVuZGVyT3B0c1xyXG4gICAgICBjb25zdCBjZWxsVmFsdWUgPSBYRVV0aWxzLmdldChyb3csIGNvbHVtbi5wcm9wZXJ0eSlcclxuICAgICAgaWYgKGRhdGEpIHtcclxuICAgICAgICBzd2l0Y2ggKHByb3BzLnR5cGUpIHtcclxuICAgICAgICAgIGNhc2UgJ2RhdGVyYW5nZSc6XHJcbiAgICAgICAgICAgIHJldHVybiBlcXVhbERhdGVyYW5nZShjZWxsVmFsdWUsIGRhdGEsIHByb3BzLCAneXl5eS1NTS1kZCcpXHJcbiAgICAgICAgICBjYXNlICdkYXRldGltZXJhbmdlJzpcclxuICAgICAgICAgICAgcmV0dXJuIGVxdWFsRGF0ZXJhbmdlKGNlbGxWYWx1ZSwgZGF0YSwgcHJvcHMsICd5eXl5LU1NLWRkIEhIOnNzOm1tJylcclxuICAgICAgICAgIGRlZmF1bHQ6XHJcbiAgICAgICAgICAgIHJldHVybiBjZWxsVmFsdWUgPT09IGRhdGFcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgICAgcmV0dXJuIGZhbHNlXHJcbiAgICB9LFxyXG4gICAgcmVuZGVySXRlbTogY3JlYXRlRm9ybUl0ZW1SZW5kZXIoKSxcclxuICAgIGNlbGxFeHBvcnRNZXRob2Q6IGNyZWF0ZUV4cG9ydE1ldGhvZChnZXREYXRlUGlja2VyQ2VsbFZhbHVlKSxcclxuICAgIGVkaXRDZWxsRXhwb3J0TWV0aG9kOiBjcmVhdGVFeHBvcnRNZXRob2QoZ2V0RGF0ZVBpY2tlckNlbGxWYWx1ZSwgdHJ1ZSlcclxuICB9LFxyXG4gIFRpbWVQaWNrZXI6IHtcclxuICAgIHJlbmRlckVkaXQ6IGNyZWF0ZUVkaXRSZW5kZXIoeyB0cmFuc2ZlcjogdHJ1ZSB9KSxcclxuICAgIHJlbmRlckl0ZW06IGNyZWF0ZUZvcm1JdGVtUmVuZGVyKClcclxuICB9LFxyXG4gIFJhdGU6IHtcclxuICAgIHJlbmRlckRlZmF1bHQ6IGNyZWF0ZUVkaXRSZW5kZXIoKSxcclxuICAgIHJlbmRlckVkaXQ6IGNyZWF0ZUVkaXRSZW5kZXIoKSxcclxuICAgIHJlbmRlckZpbHRlcjogY3JlYXRlRmlsdGVyUmVuZGVyKCksXHJcbiAgICBmaWx0ZXJNZXRob2Q6IGRlZmF1bHRGaWx0ZXJNZXRob2QsXHJcbiAgICByZW5kZXJJdGVtOiBjcmVhdGVGb3JtSXRlbVJlbmRlcigpXHJcbiAgfSxcclxuICBpU3dpdGNoOiB7XHJcbiAgICByZW5kZXJEZWZhdWx0OiBjcmVhdGVFZGl0UmVuZGVyKCksXHJcbiAgICByZW5kZXJFZGl0OiBjcmVhdGVFZGl0UmVuZGVyKCksXHJcbiAgICByZW5kZXJGaWx0ZXIgKGg6IENyZWF0ZUVsZW1lbnQsIHJlbmRlck9wdHM6IENvbHVtbkZpbHRlclJlbmRlck9wdGlvbnMsIHBhcmFtczogQ29sdW1uRmlsdGVyUmVuZGVyUGFyYW1zKSB7XHJcbiAgICAgIGNvbnN0IHsgY29sdW1uIH0gPSBwYXJhbXNcclxuICAgICAgY29uc3QgeyBuYW1lLCBhdHRycyB9ID0gcmVuZGVyT3B0c1xyXG4gICAgICByZXR1cm4gY29sdW1uLmZpbHRlcnMubWFwKChvcHRpb24sIG9JbmRleCkgPT4ge1xyXG4gICAgICAgIGNvbnN0IG9wdGlvblZhbHVlID0gb3B0aW9uLmRhdGFcclxuICAgICAgICByZXR1cm4gaChuYW1lLCB7XHJcbiAgICAgICAgICBrZXk6IG9JbmRleCxcclxuICAgICAgICAgIGF0dHJzLFxyXG4gICAgICAgICAgcHJvcHM6IGdldENlbGxFZGl0RmlsdGVyUHJvcHMocmVuZGVyT3B0cywgcGFyYW1zLCBvcHRpb25WYWx1ZSksXHJcbiAgICAgICAgICBvbjogZ2V0RmlsdGVyT25zKHJlbmRlck9wdHMsIHBhcmFtcywgb3B0aW9uLCAoKSA9PiB7XHJcbiAgICAgICAgICAgIC8vIOWkhOeQhiBjaGFuZ2Ug5LqL5Lu255u45YWz6YC76L6RXHJcbiAgICAgICAgICAgIGhhbmRsZUNvbmZpcm1GaWx0ZXIocGFyYW1zLCBYRVV0aWxzLmlzQm9vbGVhbihvcHRpb24uZGF0YSksIG9wdGlvbilcclxuICAgICAgICAgIH0pXHJcbiAgICAgICAgfSlcclxuICAgICAgfSlcclxuICAgIH0sXHJcbiAgICBmaWx0ZXJNZXRob2Q6IGRlZmF1bHRGaWx0ZXJNZXRob2QsXHJcbiAgICByZW5kZXJJdGVtOiBjcmVhdGVGb3JtSXRlbVJlbmRlcigpXHJcbiAgfSxcclxuICBSYWRpbzoge1xyXG4gICAgcmVuZGVySXRlbTogY3JlYXRlRm9ybUl0ZW1SYWRpb0FuZENoZWNrYm94UmVuZGVyKClcclxuICB9LFxyXG4gIENoZWNrYm94OiB7XHJcbiAgICByZW5kZXJJdGVtOiBjcmVhdGVGb3JtSXRlbVJhZGlvQW5kQ2hlY2tib3hSZW5kZXIoKVxyXG4gIH0sXHJcbiAgQnV0dG9uOiB7XHJcbiAgICByZW5kZXJFZGl0OiBkZWZhdWx0QnV0dG9uRWRpdFJlbmRlcixcclxuICAgIHJlbmRlckRlZmF1bHQ6IGRlZmF1bHRCdXR0b25FZGl0UmVuZGVyLFxyXG4gICAgcmVuZGVySXRlbTogZGVmYXVsdEJ1dHRvbkl0ZW1SZW5kZXJcclxuICB9LFxyXG4gIEJ1dHRvbnM6IHtcclxuICAgIHJlbmRlckVkaXQ6IGRlZmF1bHRCdXR0b25zRWRpdFJlbmRlcixcclxuICAgIHJlbmRlckRlZmF1bHQ6IGRlZmF1bHRCdXR0b25zRWRpdFJlbmRlcixcclxuICAgIHJlbmRlckl0ZW06IGRlZmF1bHRCdXR0b25zSXRlbVJlbmRlclxyXG4gIH1cclxufVxyXG5cclxuLyoqXHJcbiAqIOajgOafpeinpuWPkea6kOaYr+WQpuWxnuS6juebruagh+iKgueCuVxyXG4gKi9cclxuZnVuY3Rpb24gZ2V0RXZlbnRUYXJnZXROb2RlIChldm50OiBhbnksIGNvbnRhaW5lcjogSFRNTEVsZW1lbnQsIGNsYXNzTmFtZTogc3RyaW5nKSB7XHJcbiAgbGV0IHRhcmdldEVsZW1cclxuICBsZXQgdGFyZ2V0ID0gZXZudC50YXJnZXRcclxuICB3aGlsZSAodGFyZ2V0ICYmIHRhcmdldC5ub2RlVHlwZSAmJiB0YXJnZXQgIT09IGRvY3VtZW50KSB7XHJcbiAgICBpZiAoY2xhc3NOYW1lICYmIHRhcmdldC5jbGFzc05hbWUgJiYgdGFyZ2V0LmNsYXNzTmFtZS5zcGxpdCAmJiB0YXJnZXQuY2xhc3NOYW1lLnNwbGl0KCcgJykuaW5kZXhPZihjbGFzc05hbWUpID4gLTEpIHtcclxuICAgICAgdGFyZ2V0RWxlbSA9IHRhcmdldFxyXG4gICAgfSBlbHNlIGlmICh0YXJnZXQgPT09IGNvbnRhaW5lcikge1xyXG4gICAgICByZXR1cm4geyBmbGFnOiBjbGFzc05hbWUgPyAhIXRhcmdldEVsZW0gOiB0cnVlLCBjb250YWluZXIsIHRhcmdldEVsZW06IHRhcmdldEVsZW0gfVxyXG4gICAgfVxyXG4gICAgdGFyZ2V0ID0gdGFyZ2V0LnBhcmVudE5vZGVcclxuICB9XHJcbiAgcmV0dXJuIHsgZmxhZzogZmFsc2UgfVxyXG59XHJcblxyXG4vKipcclxuICog5LqL5Lu25YW85a655oCn5aSE55CGXHJcbiAqL1xyXG5mdW5jdGlvbiBoYW5kbGVDbGVhckV2ZW50IChwYXJhbXM6IFRhYmxlUmVuZGVyUGFyYW1zLCBldm50OiBhbnkpIHtcclxuICBjb25zdCBib2R5RWxlbTogSFRNTEVsZW1lbnQgPSBkb2N1bWVudC5ib2R5XHJcbiAgaWYgKFxyXG4gICAgLy8g5LiL5ouJ5qGG44CB5pel5pyfXHJcbiAgICBnZXRFdmVudFRhcmdldE5vZGUoZXZudCwgYm9keUVsZW0sICdpdnUtc2VsZWN0LWRyb3Bkb3duJykuZmxhZ1xyXG4gICkge1xyXG4gICAgcmV0dXJuIGZhbHNlXHJcbiAgfVxyXG59XHJcblxyXG4vKipcclxuICog5Z+65LqOIHZ4ZS10YWJsZSDooajmoLznmoTpgILphY3mj5Lku7bvvIznlKjkuo7lhbzlrrkgaXZpZXcg57uE5Lu25bqTXHJcbiAqL1xyXG5leHBvcnQgY29uc3QgVlhFVGFibGVQbHVnaW5JVmlldyA9IHtcclxuICBpbnN0YWxsICh7IGludGVyY2VwdG9yLCByZW5kZXJlciB9OiB0eXBlb2YgVlhFVGFibGUpIHtcclxuICAgIHJlbmRlcmVyLm1peGluKHJlbmRlck1hcClcclxuICAgIGludGVyY2VwdG9yLmFkZCgnZXZlbnQuY2xlYXJGaWx0ZXInLCBoYW5kbGVDbGVhckV2ZW50KVxyXG4gICAgaW50ZXJjZXB0b3IuYWRkKCdldmVudC5jbGVhckFjdGl2ZWQnLCBoYW5kbGVDbGVhckV2ZW50KVxyXG4gIH1cclxufVxyXG5cclxuaWYgKHR5cGVvZiB3aW5kb3cgIT09ICd1bmRlZmluZWQnICYmIHdpbmRvdy5WWEVUYWJsZSkge1xyXG4gIHdpbmRvdy5WWEVUYWJsZS51c2UoVlhFVGFibGVQbHVnaW5JVmlldylcclxufVxyXG5cclxuZXhwb3J0IGRlZmF1bHQgVlhFVGFibGVQbHVnaW5JVmlld1xyXG4iXX0=
