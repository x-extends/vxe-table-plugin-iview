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
    ons[modelEvent] = function (value) {
      inputFunc(value);

      if (events && events[modelEvent]) {
        events[modelEvent](value);
      }

      if (isSameEvent && changeFunc) {
        changeFunc();
      }
    };
  }

  if (!isSameEvent && changeFunc) {
    ons[changeEvent] = function () {
      changeFunc();

      if (events && events[changeEvent]) {
        for (var _len2 = arguments.length, args = new Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
          args[_key2] = arguments[_key2];
        }

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
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImluZGV4LnRzIl0sIm5hbWVzIjpbImlzRW1wdHlWYWx1ZSIsImNlbGxWYWx1ZSIsInVuZGVmaW5lZCIsImdldE1vZGVsUHJvcCIsInJlbmRlck9wdHMiLCJnZXRNb2RlbEV2ZW50IiwiZ2V0Q2hhbmdlRXZlbnQiLCJnZXRGb3JtYXREYXRlIiwidmFsdWUiLCJwcm9wcyIsImRlZmF1bHRGb3JtYXQiLCJYRVV0aWxzIiwidG9EYXRlU3RyaW5nIiwiZm9ybWF0IiwiZ2V0Rm9ybWF0RGF0ZXMiLCJ2YWx1ZXMiLCJzZXBhcmF0b3IiLCJtYXAiLCJkYXRlIiwiam9pbiIsImVxdWFsRGF0ZXJhbmdlIiwiZGF0YSIsImdldENlbGxFZGl0RmlsdGVyUHJvcHMiLCJwYXJhbXMiLCJkZWZhdWx0UHJvcHMiLCJ2U2l6ZSIsIiR0YWJsZSIsImFzc2lnbiIsInNpemUiLCJnZXRJdGVtUHJvcHMiLCIkZm9ybSIsImdldE9ucyIsImlucHV0RnVuYyIsImNoYW5nZUZ1bmMiLCJldmVudHMiLCJtb2RlbEV2ZW50IiwiY2hhbmdlRXZlbnQiLCJpc1NhbWVFdmVudCIsIm9ucyIsIm9iamVjdEVhY2giLCJmdW5jIiwia2V5IiwiYXJncyIsImdldEVkaXRPbnMiLCJyb3ciLCJjb2x1bW4iLCJzZXQiLCJwcm9wZXJ0eSIsInVwZGF0ZVN0YXR1cyIsImdldEZpbHRlck9ucyIsIm9wdGlvbiIsImdldEl0ZW1PbnMiLCJtYXRjaENhc2NhZGVyRGF0YSIsImluZGV4IiwibGlzdCIsImxhYmVscyIsInZhbCIsImxlbmd0aCIsImVhY2giLCJpdGVtIiwicHVzaCIsImxhYmVsIiwiY2hpbGRyZW4iLCJnZXRTZWxlY3RDZWxsVmFsdWUiLCJvcHRpb25zIiwib3B0aW9uR3JvdXBzIiwib3B0aW9uUHJvcHMiLCJvcHRpb25Hcm91cFByb3BzIiwibGFiZWxQcm9wIiwidmFsdWVQcm9wIiwiZ3JvdXBPcHRpb25zIiwiZ2V0IiwiY29saWQiLCJpZCIsInJlc3QiLCJjZWxsRGF0YSIsImZpbHRlcmFibGUiLCJmdWxsQWxsRGF0YVJvd01hcCIsImNhY2hlQ2VsbCIsImhhcyIsIm11bHRpcGxlIiwic2VsZWN0SXRlbSIsImZpbmQiLCJjZWxsTGFiZWwiLCJnZXRDYXNjYWRlckNlbGxWYWx1ZSIsImdldERhdGVQaWNrZXJDZWxsVmFsdWUiLCJ0eXBlIiwiY3JlYXRlRWRpdFJlbmRlciIsImgiLCJhdHRycyIsIm5hbWUiLCJvbiIsImRlZmF1bHRCdXR0b25FZGl0UmVuZGVyIiwiY2VsbFRleHQiLCJjb250ZW50IiwiZGVmYXVsdEJ1dHRvbnNFZGl0UmVuZGVyIiwiY2hpbGRSZW5kZXJPcHRzIiwiY3JlYXRlRmlsdGVyUmVuZGVyIiwiZmlsdGVycyIsIm9JbmRleCIsIm9wdGlvblZhbHVlIiwiaGFuZGxlQ29uZmlybUZpbHRlciIsImNoZWNrZWQiLCIkcGFuZWwiLCJjaGFuZ2VPcHRpb24iLCJkZWZhdWx0RmlsdGVyTWV0aG9kIiwicmVuZGVyT3B0aW9ucyIsImRpc2FibGVkUHJvcCIsImRpc2FibGVkIiwiY3JlYXRlRm9ybUl0ZW1SZW5kZXIiLCJpdGVtVmFsdWUiLCJkZWZhdWx0QnV0dG9uSXRlbVJlbmRlciIsImRlZmF1bHRCdXR0b25zSXRlbVJlbmRlciIsImNyZWF0ZUV4cG9ydE1ldGhvZCIsInZhbHVlTWV0aG9kIiwiaXNFZGl0IiwicmVuZGVyUHJvcGVydHkiLCJjcmVhdGVGb3JtSXRlbVJhZGlvQW5kQ2hlY2tib3hSZW5kZXIiLCJyZW5kZXJNYXAiLCJJbnB1dCIsImF1dG9mb2N1cyIsInJlbmRlckRlZmF1bHQiLCJyZW5kZXJFZGl0IiwicmVuZGVyRmlsdGVyIiwiZmlsdGVyTWV0aG9kIiwicmVuZGVySXRlbSIsIkF1dG9Db21wbGV0ZSIsIklucHV0TnVtYmVyIiwiU2VsZWN0IiwiZ3JvdXBMYWJlbCIsImdyb3VwIiwiZ0luZGV4IiwicmVuZGVyQ2VsbCIsImZpbHRlclJlbmRlciIsImlzQXJyYXkiLCJpbmNsdWRlQXJyYXlzIiwiaW5kZXhPZiIsImNlbGxFeHBvcnRNZXRob2QiLCJlZGl0Q2VsbEV4cG9ydE1ldGhvZCIsIkNhc2NhZGVyIiwidHJhbnNmZXIiLCJEYXRlUGlja2VyIiwiVGltZVBpY2tlciIsIlJhdGUiLCJpU3dpdGNoIiwiaXNCb29sZWFuIiwiUmFkaW8iLCJDaGVja2JveCIsIkJ1dHRvbiIsIkJ1dHRvbnMiLCJnZXRFdmVudFRhcmdldE5vZGUiLCJldm50IiwiY29udGFpbmVyIiwiY2xhc3NOYW1lIiwidGFyZ2V0RWxlbSIsInRhcmdldCIsIm5vZGVUeXBlIiwiZG9jdW1lbnQiLCJzcGxpdCIsImZsYWciLCJwYXJlbnROb2RlIiwiaGFuZGxlQ2xlYXJFdmVudCIsImJvZHlFbGVtIiwiYm9keSIsIlZYRVRhYmxlUGx1Z2luSVZpZXciLCJpbnN0YWxsIiwiaW50ZXJjZXB0b3IiLCJyZW5kZXJlciIsIm1peGluIiwiYWRkIiwid2luZG93IiwiVlhFVGFibGUiLCJ1c2UiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7QUFFQTs7Ozs7O0FBbUJBO0FBRUEsU0FBU0EsWUFBVCxDQUF1QkMsU0FBdkIsRUFBcUM7QUFDbkMsU0FBT0EsU0FBUyxLQUFLLElBQWQsSUFBc0JBLFNBQVMsS0FBS0MsU0FBcEMsSUFBaURELFNBQVMsS0FBSyxFQUF0RTtBQUNEOztBQUVELFNBQVNFLFlBQVQsQ0FBdUJDLFVBQXZCLEVBQWdEO0FBQzlDLFNBQU8sT0FBUDtBQUNEOztBQUVELFNBQVNDLGFBQVQsQ0FBd0JELFVBQXhCLEVBQWlEO0FBQy9DLFNBQU8sT0FBUDtBQUNEOztBQUVELFNBQVNFLGNBQVQsQ0FBeUJGLFVBQXpCLEVBQWtEO0FBQ2hELFNBQU8sV0FBUDtBQUNEOztBQUVELFNBQVNHLGFBQVQsQ0FBd0JDLEtBQXhCLEVBQW9DQyxLQUFwQyxFQUFtRUMsYUFBbkUsRUFBd0Y7QUFDdEYsU0FBT0Msb0JBQVFDLFlBQVIsQ0FBcUJKLEtBQXJCLEVBQTRCQyxLQUFLLENBQUNJLE1BQU4sSUFBZ0JILGFBQTVDLENBQVA7QUFDRDs7QUFFRCxTQUFTSSxjQUFULENBQXlCQyxNQUF6QixFQUFzQ04sS0FBdEMsRUFBcUVP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S0FBVCxDQUFlbEQsU0FBZjtBQUNBZ0QsSUFBQUEsV0FBVyxDQUFDRyxHQUFaLENBQWdCLG1CQUFoQixFQUFxQ1IsZ0JBQXJDO0FBQ0FLLElBQUFBLFdBQVcsQ0FBQ0csR0FBWixDQUFnQixvQkFBaEIsRUFBc0NSLGdCQUF0QztBQUNEO0FBTGdDLENBQTVCOzs7QUFRUCxJQUFJLE9BQU9TLE1BQVAsS0FBa0IsV0FBbEIsSUFBaUNBLE1BQU0sQ0FBQ0MsUUFBNUMsRUFBc0Q7QUFDcERELEVBQUFBLE1BQU0sQ0FBQ0MsUUFBUCxDQUFnQkMsR0FBaEIsQ0FBb0JSLG1CQUFwQjtBQUNEOztlQUVjQSxtQiIsImZpbGUiOiJpbmRleC5jb21tb24uanMiLCJzb3VyY2VzQ29udGVudCI6WyIvKiBlc2xpbnQtZGlzYWJsZSBuby11bnVzZWQtdmFycyAqL1xyXG5pbXBvcnQgeyBDcmVhdGVFbGVtZW50IH0gZnJvbSAndnVlJ1xyXG5pbXBvcnQgWEVVdGlscyBmcm9tICd4ZS11dGlscy9tZXRob2RzL3hlLXV0aWxzJ1xyXG5pbXBvcnQge1xyXG4gIFZYRVRhYmxlLFxyXG4gIFJlbmRlclBhcmFtcyxcclxuICBPcHRpb25Qcm9wcyxcclxuICBUYWJsZVJlbmRlclBhcmFtcyxcclxuICBSZW5kZXJPcHRpb25zLFxyXG4gIENvbHVtbkZpbHRlclBhcmFtcyxcclxuICBDb2x1bW5GaWx0ZXJSZW5kZXJPcHRpb25zLFxyXG4gIENvbHVtbkNlbGxSZW5kZXJPcHRpb25zLFxyXG4gIENvbHVtbkVkaXRSZW5kZXJPcHRpb25zLFxyXG4gIENvbHVtbkNlbGxSZW5kZXJQYXJhbXMsXHJcbiAgQ29sdW1uRWRpdFJlbmRlclBhcmFtcyxcclxuICBDb2x1bW5GaWx0ZXJSZW5kZXJQYXJhbXMsXHJcbiAgQ29sdW1uRmlsdGVyTWV0aG9kUGFyYW1zLFxyXG4gIEZvcm1JdGVtUmVuZGVyUGFyYW1zLFxyXG4gIEZvcm1JdGVtUmVuZGVyT3B0aW9ucyxcclxuICBDb2x1bW5FeHBvcnRDZWxsUmVuZGVyUGFyYW1zXHJcbn0gZnJvbSAndnhlLXRhYmxlL2xpYi92eGUtdGFibGUnXHJcbi8qIGVzbGludC1lbmFibGUgbm8tdW51c2VkLXZhcnMgKi9cclxuXHJcbmZ1bmN0aW9uIGlzRW1wdHlWYWx1ZSAoY2VsbFZhbHVlOiBhbnkpIHtcclxuICByZXR1cm4gY2VsbFZhbHVlID09PSBudWxsIHx8IGNlbGxWYWx1ZSA9PT0gdW5kZWZpbmVkIHx8IGNlbGxWYWx1ZSA9PT0gJydcclxufVxyXG5cclxuZnVuY3Rpb24gZ2V0TW9kZWxQcm9wIChyZW5kZXJPcHRzOiBSZW5kZXJPcHRpb25zKSB7XHJcbiAgcmV0dXJuICd2YWx1ZSdcclxufVxyXG5cclxuZnVuY3Rpb24gZ2V0TW9kZWxFdmVudCAocmVuZGVyT3B0czogUmVuZGVyT3B0aW9ucykge1xyXG4gIHJldHVybiAnaW5wdXQnXHJcbn1cclxuXHJcbmZ1bmN0aW9uIGdldENoYW5nZUV2ZW50IChyZW5kZXJPcHRzOiBSZW5kZXJPcHRpb25zKSB7XHJcbiAgcmV0dXJuICdvbi1jaGFuZ2UnXHJcbn1cclxuXHJcbmZ1bmN0aW9uIGdldEZvcm1hdERhdGUgKHZhbHVlOiBhbnksIHByb3BzOiB7IFtrZXk6IHN0cmluZ106IGFueSB9LCBkZWZhdWx0Rm9ybWF0OiBzdHJpbmcpIHtcclxuICByZXR1cm4gWEVVdGlscy50b0RhdGVTdHJpbmcodmFsdWUsIHByb3BzLmZvcm1hdCB8fCBkZWZhdWx0Rm9ybWF0KVxyXG59XHJcblxyXG5mdW5jdGlvbiBnZXRGb3JtYXREYXRlcyAodmFsdWVzOiBhbnksIHByb3BzOiB7IFtrZXk6IHN0cmluZ106IGFueSB9LCBzZXBhcmF0b3I6IHN0cmluZywgZGVmYXVsdEZvcm1hdDogc3RyaW5nKSB7XHJcbiAgcmV0dXJuIFhFVXRpbHMubWFwKHZhbHVlcywgKGRhdGU6IGFueSkgPT4gZ2V0Rm9ybWF0RGF0ZShkYXRlLCBwcm9wcywgZGVmYXVsdEZvcm1hdCkpLmpvaW4oc2VwYXJhdG9yKVxyXG59XHJcblxyXG5mdW5jdGlvbiBlcXVhbERhdGVyYW5nZSAoY2VsbFZhbHVlOiBhbnksIGRhdGE6IGFueSwgcHJvcHM6IHsgW2tleTogc3RyaW5nXTogYW55IH0sIGRlZmF1bHRGb3JtYXQ6IHN0cmluZykge1xyXG4gIGNlbGxWYWx1ZSA9IGdldEZvcm1hdERhdGUoY2VsbFZhbHVlLCBwcm9wcywgZGVmYXVsdEZvcm1hdClcclxuICByZXR1cm4gY2VsbFZhbHVlID49IGdldEZvcm1hdERhdGUoZGF0YVswXSwgcHJvcHMsIGRlZmF1bHRGb3JtYXQpICYmIGNlbGxWYWx1ZSA8PSBnZXRGb3JtYXREYXRlKGRhdGFbMV0sIHByb3BzLCBkZWZhdWx0Rm9ybWF0KVxyXG59XHJcblxyXG5mdW5jdGlvbiBnZXRDZWxsRWRpdEZpbHRlclByb3BzIChyZW5kZXJPcHRzOiBSZW5kZXJPcHRpb25zLCBwYXJhbXM6IFRhYmxlUmVuZGVyUGFyYW1zLCB2YWx1ZTogYW55LCBkZWZhdWx0UHJvcHM/OiB7IFtwcm9wOiBzdHJpbmddOiBhbnkgfSkge1xyXG4gIGNvbnN0IHsgdlNpemUgfSA9IHBhcmFtcy4kdGFibGVcclxuICByZXR1cm4gWEVVdGlscy5hc3NpZ24odlNpemUgPyB7IHNpemU6IHZTaXplIH0gOiB7fSwgZGVmYXVsdFByb3BzLCByZW5kZXJPcHRzLnByb3BzLCB7IFtnZXRNb2RlbFByb3AocmVuZGVyT3B0cyldOiB2YWx1ZSB9KVxyXG59XHJcblxyXG5mdW5jdGlvbiBnZXRJdGVtUHJvcHMgKHJlbmRlck9wdHM6IFJlbmRlck9wdGlvbnMsIHBhcmFtczogRm9ybUl0ZW1SZW5kZXJQYXJhbXMsIHZhbHVlOiBhbnksIGRlZmF1bHRQcm9wcz86IHsgW3Byb3A6IHN0cmluZ106IGFueSB9KSB7XHJcbiAgY29uc3QgeyB2U2l6ZSB9ID0gcGFyYW1zLiRmb3JtXHJcbiAgcmV0dXJuIFhFVXRpbHMuYXNzaWduKHZTaXplID8geyBzaXplOiB2U2l6ZSB9IDoge30sIGRlZmF1bHRQcm9wcywgcmVuZGVyT3B0cy5wcm9wcywgeyBbZ2V0TW9kZWxQcm9wKHJlbmRlck9wdHMpXTogdmFsdWUgfSlcclxufVxyXG5cclxuZnVuY3Rpb24gZ2V0T25zIChyZW5kZXJPcHRzOiBSZW5kZXJPcHRpb25zLCBwYXJhbXM6IFJlbmRlclBhcmFtcywgaW5wdXRGdW5jPzogRnVuY3Rpb24sIGNoYW5nZUZ1bmM/OiBGdW5jdGlvbikge1xyXG4gIGNvbnN0IHsgZXZlbnRzIH0gPSByZW5kZXJPcHRzXHJcbiAgY29uc3QgbW9kZWxFdmVudCA9IGdldE1vZGVsRXZlbnQocmVuZGVyT3B0cylcclxuICBjb25zdCBjaGFuZ2VFdmVudCA9IGdldENoYW5nZUV2ZW50KHJlbmRlck9wdHMpXHJcbiAgY29uc3QgaXNTYW1lRXZlbnQgPSBjaGFuZ2VFdmVudCA9PT0gbW9kZWxFdmVudFxyXG4gIGNvbnN0IG9uczogeyBbdHlwZTogc3RyaW5nXTogRnVuY3Rpb24gfSA9IHt9XHJcbiAgWEVVdGlscy5vYmplY3RFYWNoKGV2ZW50cywgKGZ1bmM6IEZ1bmN0aW9uLCBrZXk6IHN0cmluZykgPT4ge1xyXG4gICAgb25zW2tleV0gPSBmdW5jdGlvbiAoLi4uYXJnczogYW55W10pIHtcclxuICAgICAgZnVuYyhwYXJhbXMsIC4uLmFyZ3MpXHJcbiAgICB9XHJcbiAgfSlcclxuICBpZiAoaW5wdXRGdW5jKSB7XHJcbiAgICBvbnNbbW9kZWxFdmVudF0gPSBmdW5jdGlvbiAodmFsdWU6IGFueSkge1xyXG4gICAgICBpbnB1dEZ1bmModmFsdWUpXHJcbiAgICAgIGlmIChldmVudHMgJiYgZXZlbnRzW21vZGVsRXZlbnRdKSB7XHJcbiAgICAgICAgZXZlbnRzW21vZGVsRXZlbnRdKHZhbHVlKVxyXG4gICAgICB9XHJcbiAgICAgIGlmIChpc1NhbWVFdmVudCAmJiBjaGFuZ2VGdW5jKSB7XHJcbiAgICAgICAgY2hhbmdlRnVuYygpXHJcbiAgICAgIH1cclxuICAgIH1cclxuICB9XHJcbiAgaWYgKCFpc1NhbWVFdmVudCAmJiBjaGFuZ2VGdW5jKSB7XHJcbiAgICBvbnNbY2hhbmdlRXZlbnRdID0gZnVuY3Rpb24gKC4uLmFyZ3M6IGFueVtdKSB7XHJcbiAgICAgIGNoYW5nZUZ1bmMoKVxyXG4gICAgICBpZiAoZXZlbnRzICYmIGV2ZW50c1tjaGFuZ2VFdmVudF0pIHtcclxuICAgICAgICBldmVudHNbY2hhbmdlRXZlbnRdKHBhcmFtcywgLi4uYXJncylcclxuICAgICAgfVxyXG4gICAgfVxyXG4gIH1cclxuICByZXR1cm4gb25zXHJcbn1cclxuXHJcbmZ1bmN0aW9uIGdldEVkaXRPbnMgKHJlbmRlck9wdHM6IFJlbmRlck9wdGlvbnMsIHBhcmFtczogQ29sdW1uRWRpdFJlbmRlclBhcmFtcykge1xyXG4gIGNvbnN0IHsgJHRhYmxlLCByb3csIGNvbHVtbiB9ID0gcGFyYW1zXHJcbiAgcmV0dXJuIGdldE9ucyhyZW5kZXJPcHRzLCBwYXJhbXMsICh2YWx1ZTogYW55KSA9PiB7XHJcbiAgICAvLyDlpITnkIYgbW9kZWwg5YC85Y+M5ZCR57uR5a6aXHJcbiAgICBYRVV0aWxzLnNldChyb3csIGNvbHVtbi5wcm9wZXJ0eSwgdmFsdWUpXHJcbiAgfSwgKCkgPT4ge1xyXG4gICAgLy8g5aSE55CGIGNoYW5nZSDkuovku7bnm7jlhbPpgLvovpFcclxuICAgICR0YWJsZS51cGRhdGVTdGF0dXMocGFyYW1zKVxyXG4gIH0pXHJcbn1cclxuXHJcbmZ1bmN0aW9uIGdldEZpbHRlck9ucyAocmVuZGVyT3B0czogUmVuZGVyT3B0aW9ucywgcGFyYW1zOiBDb2x1bW5GaWx0ZXJSZW5kZXJQYXJhbXMsIG9wdGlvbjogQ29sdW1uRmlsdGVyUGFyYW1zLCBjaGFuZ2VGdW5jOiBGdW5jdGlvbikge1xyXG4gIHJldHVybiBnZXRPbnMocmVuZGVyT3B0cywgcGFyYW1zLCAodmFsdWU6IGFueSkgPT4ge1xyXG4gICAgLy8g5aSE55CGIG1vZGVsIOWAvOWPjOWQkee7keWumlxyXG4gICAgb3B0aW9uLmRhdGEgPSB2YWx1ZVxyXG4gIH0sIGNoYW5nZUZ1bmMpXHJcbn1cclxuXHJcbmZ1bmN0aW9uIGdldEl0ZW1PbnMgKHJlbmRlck9wdHM6IFJlbmRlck9wdGlvbnMsIHBhcmFtczogRm9ybUl0ZW1SZW5kZXJQYXJhbXMpIHtcclxuICBjb25zdCB7ICRmb3JtLCBkYXRhLCBwcm9wZXJ0eSB9ID0gcGFyYW1zXHJcbiAgcmV0dXJuIGdldE9ucyhyZW5kZXJPcHRzLCBwYXJhbXMsICh2YWx1ZTogYW55KSA9PiB7XHJcbiAgICAvLyDlpITnkIYgbW9kZWwg5YC85Y+M5ZCR57uR5a6aXHJcbiAgICBYRVV0aWxzLnNldChkYXRhLCBwcm9wZXJ0eSwgdmFsdWUpXHJcbiAgfSwgKCkgPT4ge1xyXG4gICAgLy8g5aSE55CGIGNoYW5nZSDkuovku7bnm7jlhbPpgLvovpFcclxuICAgICRmb3JtLnVwZGF0ZVN0YXR1cyhwYXJhbXMpXHJcbiAgfSlcclxufVxyXG5cclxuZnVuY3Rpb24gbWF0Y2hDYXNjYWRlckRhdGEgKGluZGV4OiBudW1iZXIsIGxpc3Q6IGFueVtdLCB2YWx1ZXM6IGFueVtdLCBsYWJlbHM6IGFueVtdKSB7XHJcbiAgY29uc3QgdmFsID0gdmFsdWVzW2luZGV4XVxyXG4gIGlmIChsaXN0ICYmIHZhbHVlcy5sZW5ndGggPiBpbmRleCkge1xyXG4gICAgWEVVdGlscy5lYWNoKGxpc3QsIChpdGVtKSA9PiB7XHJcbiAgICAgIGlmIChpdGVtLnZhbHVlID09PSB2YWwpIHtcclxuICAgICAgICBsYWJlbHMucHVzaChpdGVtLmxhYmVsKVxyXG4gICAgICAgIG1hdGNoQ2FzY2FkZXJEYXRhKCsraW5kZXgsIGl0ZW0uY2hpbGRyZW4sIHZhbHVlcywgbGFiZWxzKVxyXG4gICAgICB9XHJcbiAgICB9KVxyXG4gIH1cclxufVxyXG5cclxuZnVuY3Rpb24gZ2V0U2VsZWN0Q2VsbFZhbHVlIChyZW5kZXJPcHRzOiBDb2x1bW5DZWxsUmVuZGVyT3B0aW9ucywgcGFyYW1zOiBDb2x1bW5DZWxsUmVuZGVyUGFyYW1zKSB7XHJcbiAgY29uc3QgeyBvcHRpb25zID0gW10sIG9wdGlvbkdyb3VwcywgcHJvcHMgPSB7fSwgb3B0aW9uUHJvcHMgPSB7fSwgb3B0aW9uR3JvdXBQcm9wcyA9IHt9IH0gPSByZW5kZXJPcHRzXHJcbiAgY29uc3QgeyByb3csIGNvbHVtbiB9ID0gcGFyYW1zXHJcbiAgY29uc3QgJHRhYmxlOiBhbnkgPSBwYXJhbXMuJHRhYmxlXHJcbiAgY29uc3QgbGFiZWxQcm9wID0gb3B0aW9uUHJvcHMubGFiZWwgfHwgJ2xhYmVsJ1xyXG4gIGNvbnN0IHZhbHVlUHJvcCA9IG9wdGlvblByb3BzLnZhbHVlIHx8ICd2YWx1ZSdcclxuICBjb25zdCBncm91cE9wdGlvbnMgPSBvcHRpb25Hcm91cFByb3BzLm9wdGlvbnMgfHwgJ29wdGlvbnMnXHJcbiAgY29uc3QgY2VsbFZhbHVlID0gWEVVdGlscy5nZXQocm93LCBjb2x1bW4ucHJvcGVydHkpXHJcbiAgY29uc3QgY29saWQgPSBjb2x1bW4uaWRcclxuICBsZXQgcmVzdDogYW55XHJcbiAgbGV0IGNlbGxEYXRhOiBhbnlcclxuICBpZiAocHJvcHMuZmlsdGVyYWJsZSkge1xyXG4gICAgY29uc3QgZnVsbEFsbERhdGFSb3dNYXA6IE1hcDxhbnksIGFueT4gPSAkdGFibGUuZnVsbEFsbERhdGFSb3dNYXBcclxuICAgIGNvbnN0IGNhY2hlQ2VsbCA9IGZ1bGxBbGxEYXRhUm93TWFwLmhhcyhyb3cpXHJcbiAgICBpZiAoY2FjaGVDZWxsKSB7XHJcbiAgICAgIHJlc3QgPSBmdWxsQWxsRGF0YVJvd01hcC5nZXQocm93KVxyXG4gICAgICBjZWxsRGF0YSA9IHJlc3QuY2VsbERhdGFcclxuICAgICAgaWYgKCFjZWxsRGF0YSkge1xyXG4gICAgICAgIGNlbGxEYXRhID0gZnVsbEFsbERhdGFSb3dNYXAuZ2V0KHJvdykuY2VsbERhdGEgPSB7fVxyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgICBpZiAocmVzdCAmJiBjZWxsRGF0YVtjb2xpZF0gJiYgY2VsbERhdGFbY29saWRdLnZhbHVlID09PSBjZWxsVmFsdWUpIHtcclxuICAgICAgcmV0dXJuIGNlbGxEYXRhW2NvbGlkXS5sYWJlbFxyXG4gICAgfVxyXG4gIH1cclxuICBpZiAoIWlzRW1wdHlWYWx1ZShjZWxsVmFsdWUpKSB7XHJcbiAgICByZXR1cm4gWEVVdGlscy5tYXAocHJvcHMubXVsdGlwbGUgPyBjZWxsVmFsdWUgOiBbY2VsbFZhbHVlXSwgb3B0aW9uR3JvdXBzID8gKHZhbHVlKSA9PiB7XHJcbiAgICAgIGxldCBzZWxlY3RJdGVtXHJcbiAgICAgIGZvciAobGV0IGluZGV4ID0gMDsgaW5kZXggPCBvcHRpb25Hcm91cHMubGVuZ3RoOyBpbmRleCsrKSB7XHJcbiAgICAgICAgc2VsZWN0SXRlbSA9IFhFVXRpbHMuZmluZChvcHRpb25Hcm91cHNbaW5kZXhdW2dyb3VwT3B0aW9uc10sIChpdGVtKSA9PiBpdGVtW3ZhbHVlUHJvcF0gPT09IHZhbHVlKVxyXG4gICAgICAgIGlmIChzZWxlY3RJdGVtKSB7XHJcbiAgICAgICAgICBicmVha1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgICBjb25zdCBjZWxsTGFiZWw6IGFueSA9IHNlbGVjdEl0ZW0gPyBzZWxlY3RJdGVtW2xhYmVsUHJvcF0gOiB2YWx1ZVxyXG4gICAgICBpZiAoY2VsbERhdGEgJiYgb3B0aW9ucyAmJiBvcHRpb25zLmxlbmd0aCkge1xyXG4gICAgICAgIGNlbGxEYXRhW2NvbGlkXSA9IHsgdmFsdWU6IGNlbGxWYWx1ZSwgbGFiZWw6IGNlbGxMYWJlbCB9XHJcbiAgICAgIH1cclxuICAgICAgcmV0dXJuIGNlbGxMYWJlbFxyXG4gICAgfSA6ICh2YWx1ZSkgPT4ge1xyXG4gICAgICBjb25zdCBzZWxlY3RJdGVtID0gWEVVdGlscy5maW5kKG9wdGlvbnMsIChpdGVtKSA9PiBpdGVtW3ZhbHVlUHJvcF0gPT09IHZhbHVlKVxyXG4gICAgICBjb25zdCBjZWxsTGFiZWw6IGFueSA9IHNlbGVjdEl0ZW0gPyBzZWxlY3RJdGVtW2xhYmVsUHJvcF0gOiB2YWx1ZVxyXG4gICAgICBpZiAoY2VsbERhdGEgJiYgb3B0aW9ucyAmJiBvcHRpb25zLmxlbmd0aCkge1xyXG4gICAgICAgIGNlbGxEYXRhW2NvbGlkXSA9IHsgdmFsdWU6IGNlbGxWYWx1ZSwgbGFiZWw6IGNlbGxMYWJlbCB9XHJcbiAgICAgIH1cclxuICAgICAgcmV0dXJuIGNlbGxMYWJlbFxyXG4gICAgfSkuam9pbignLCAnKVxyXG4gIH1cclxuICByZXR1cm4gbnVsbFxyXG59XHJcblxyXG5mdW5jdGlvbiBnZXRDYXNjYWRlckNlbGxWYWx1ZSAocmVuZGVyT3B0czogUmVuZGVyT3B0aW9ucywgcGFyYW1zOiBDb2x1bW5DZWxsUmVuZGVyUGFyYW1zKSB7XHJcbiAgY29uc3QgeyBwcm9wcyA9IHt9IH0gPSByZW5kZXJPcHRzXHJcbiAgY29uc3QgeyByb3csIGNvbHVtbiB9ID0gcGFyYW1zXHJcbiAgY29uc3QgY2VsbFZhbHVlID0gWEVVdGlscy5nZXQocm93LCBjb2x1bW4ucHJvcGVydHkpXHJcbiAgY29uc3QgdmFsdWVzOiBhbnlbXSA9IGNlbGxWYWx1ZSB8fCBbXVxyXG4gIGNvbnN0IGxhYmVsczogYW55W10gPSBbXVxyXG4gIG1hdGNoQ2FzY2FkZXJEYXRhKDAsIHByb3BzLmRhdGEsIHZhbHVlcywgbGFiZWxzKVxyXG4gIHJldHVybiBsYWJlbHMuam9pbihgICR7cHJvcHMuc2VwYXJhdG9yIHx8ICcvJ30gYClcclxufVxyXG5cclxuZnVuY3Rpb24gZ2V0RGF0ZVBpY2tlckNlbGxWYWx1ZSAocmVuZGVyT3B0czogUmVuZGVyT3B0aW9ucywgcGFyYW1zOiBDb2x1bW5DZWxsUmVuZGVyUGFyYW1zKSB7XHJcbiAgY29uc3QgeyBwcm9wcyA9IHt9IH0gPSByZW5kZXJPcHRzXHJcbiAgY29uc3QgeyByb3csIGNvbHVtbiB9ID0gcGFyYW1zXHJcbiAgY29uc3QgeyBzZXBhcmF0b3IgfSA9IHByb3BzXHJcbiAgbGV0IGNlbGxWYWx1ZSA9IFhFVXRpbHMuZ2V0KHJvdywgY29sdW1uLnByb3BlcnR5KVxyXG4gIHN3aXRjaCAocHJvcHMudHlwZSkge1xyXG4gICAgY2FzZSAnd2Vlayc6XHJcbiAgICAgIGNlbGxWYWx1ZSA9IGdldEZvcm1hdERhdGUoY2VsbFZhbHVlLCBwcm9wcywgJ3l5eXl3V1cnKVxyXG4gICAgICBicmVha1xyXG4gICAgY2FzZSAnbW9udGgnOlxyXG4gICAgICBjZWxsVmFsdWUgPSBnZXRGb3JtYXREYXRlKGNlbGxWYWx1ZSwgcHJvcHMsICd5eXl5LU1NJylcclxuICAgICAgYnJlYWtcclxuICAgIGNhc2UgJ3llYXInOlxyXG4gICAgICBjZWxsVmFsdWUgPSBnZXRGb3JtYXREYXRlKGNlbGxWYWx1ZSwgcHJvcHMsICd5eXl5JylcclxuICAgICAgYnJlYWtcclxuICAgIGNhc2UgJ2RhdGVzJzpcclxuICAgICAgY2VsbFZhbHVlID0gZ2V0Rm9ybWF0RGF0ZXMoY2VsbFZhbHVlLCBwcm9wcywgJywgJywgJ3l5eXktTU0tZGQnKVxyXG4gICAgICBicmVha1xyXG4gICAgY2FzZSAnZGF0ZXJhbmdlJzpcclxuICAgICAgY2VsbFZhbHVlID0gZ2V0Rm9ybWF0RGF0ZXMoY2VsbFZhbHVlLCBwcm9wcywgYCAke3NlcGFyYXRvciB8fCAnLSd9IGAsICd5eXl5LU1NLWRkJylcclxuICAgICAgYnJlYWtcclxuICAgIGNhc2UgJ2RhdGV0aW1lcmFuZ2UnOlxyXG4gICAgICBjZWxsVmFsdWUgPSBnZXRGb3JtYXREYXRlcyhjZWxsVmFsdWUsIHByb3BzLCBgICR7c2VwYXJhdG9yIHx8ICctJ30gYCwgJ3l5eXktTU0tZGQgSEg6c3M6bW0nKVxyXG4gICAgICBicmVha1xyXG4gICAgZGVmYXVsdDpcclxuICAgICAgY2VsbFZhbHVlID0gZ2V0Rm9ybWF0RGF0ZShjZWxsVmFsdWUsIHByb3BzLCAneXl5eS1NTS1kZCcpXHJcbiAgICAgIGJyZWFrXHJcbiAgfVxyXG4gIHJldHVybiBjZWxsVmFsdWVcclxufVxyXG5cclxuZnVuY3Rpb24gY3JlYXRlRWRpdFJlbmRlciAoZGVmYXVsdFByb3BzPzogeyBba2V5OiBzdHJpbmddOiBhbnkgfSkge1xyXG4gIHJldHVybiBmdW5jdGlvbiAoaDogQ3JlYXRlRWxlbWVudCwgcmVuZGVyT3B0czogQ29sdW1uRWRpdFJlbmRlck9wdGlvbnMsIHBhcmFtczogQ29sdW1uRWRpdFJlbmRlclBhcmFtcykge1xyXG4gICAgY29uc3QgeyByb3csIGNvbHVtbiB9ID0gcGFyYW1zXHJcbiAgICBjb25zdCB7IGF0dHJzIH0gPSByZW5kZXJPcHRzXHJcbiAgICBjb25zdCBjZWxsVmFsdWUgPSBYRVV0aWxzLmdldChyb3csIGNvbHVtbi5wcm9wZXJ0eSlcclxuICAgIHJldHVybiBbXHJcbiAgICAgIGgocmVuZGVyT3B0cy5uYW1lLCB7XHJcbiAgICAgICAgYXR0cnMsXHJcbiAgICAgICAgcHJvcHM6IGdldENlbGxFZGl0RmlsdGVyUHJvcHMocmVuZGVyT3B0cywgcGFyYW1zLCBjZWxsVmFsdWUsIGRlZmF1bHRQcm9wcyksXHJcbiAgICAgICAgb246IGdldEVkaXRPbnMocmVuZGVyT3B0cywgcGFyYW1zKVxyXG4gICAgICB9KVxyXG4gICAgXVxyXG4gIH1cclxufVxyXG5cclxuZnVuY3Rpb24gZGVmYXVsdEJ1dHRvbkVkaXRSZW5kZXIgKGg6IENyZWF0ZUVsZW1lbnQsIHJlbmRlck9wdHM6IENvbHVtbkVkaXRSZW5kZXJPcHRpb25zLCBwYXJhbXM6IENvbHVtbkVkaXRSZW5kZXJQYXJhbXMpIHtcclxuICBjb25zdCB7IGF0dHJzIH0gPSByZW5kZXJPcHRzXHJcbiAgcmV0dXJuIFtcclxuICAgIGgoJ0J1dHRvbicsIHtcclxuICAgICAgYXR0cnMsXHJcbiAgICAgIHByb3BzOiBnZXRDZWxsRWRpdEZpbHRlclByb3BzKHJlbmRlck9wdHMsIHBhcmFtcywgbnVsbCksXHJcbiAgICAgIG9uOiBnZXRPbnMocmVuZGVyT3B0cywgcGFyYW1zKVxyXG4gICAgfSwgY2VsbFRleHQoaCwgcmVuZGVyT3B0cy5jb250ZW50KSlcclxuICBdXHJcbn1cclxuXHJcbmZ1bmN0aW9uIGRlZmF1bHRCdXR0b25zRWRpdFJlbmRlciAoaDogQ3JlYXRlRWxlbWVudCwgcmVuZGVyT3B0czogQ29sdW1uRWRpdFJlbmRlck9wdGlvbnMsIHBhcmFtczogQ29sdW1uRWRpdFJlbmRlclBhcmFtcykge1xyXG4gIHJldHVybiByZW5kZXJPcHRzLmNoaWxkcmVuLm1hcCgoY2hpbGRSZW5kZXJPcHRzOiBDb2x1bW5FZGl0UmVuZGVyT3B0aW9ucykgPT4gZGVmYXVsdEJ1dHRvbkVkaXRSZW5kZXIoaCwgY2hpbGRSZW5kZXJPcHRzLCBwYXJhbXMpWzBdKVxyXG59XHJcblxyXG5mdW5jdGlvbiBjcmVhdGVGaWx0ZXJSZW5kZXIgKGRlZmF1bHRQcm9wcz86IHsgW2tleTogc3RyaW5nXTogYW55IH0pIHtcclxuICByZXR1cm4gZnVuY3Rpb24gKGg6IENyZWF0ZUVsZW1lbnQsIHJlbmRlck9wdHM6IENvbHVtbkZpbHRlclJlbmRlck9wdGlvbnMsIHBhcmFtczogQ29sdW1uRmlsdGVyUmVuZGVyUGFyYW1zKSB7XHJcbiAgICBjb25zdCB7IGNvbHVtbiB9ID0gcGFyYW1zXHJcbiAgICBjb25zdCB7IG5hbWUsIGF0dHJzIH0gPSByZW5kZXJPcHRzXHJcbiAgICByZXR1cm4gY29sdW1uLmZpbHRlcnMubWFwKChvcHRpb24sIG9JbmRleCkgPT4ge1xyXG4gICAgICBjb25zdCBvcHRpb25WYWx1ZSA9IG9wdGlvbi5kYXRhXHJcbiAgICAgIHJldHVybiBoKG5hbWUsIHtcclxuICAgICAgICBrZXk6IG9JbmRleCxcclxuICAgICAgICBhdHRycyxcclxuICAgICAgICBwcm9wczogZ2V0Q2VsbEVkaXRGaWx0ZXJQcm9wcyhyZW5kZXJPcHRzLCBwYXJhbXMsIG9wdGlvblZhbHVlLCBkZWZhdWx0UHJvcHMpLFxyXG4gICAgICAgIG9uOiBnZXRGaWx0ZXJPbnMocmVuZGVyT3B0cywgcGFyYW1zLCBvcHRpb24sICgpID0+IHtcclxuICAgICAgICAgIC8vIOWkhOeQhiBjaGFuZ2Ug5LqL5Lu255u45YWz6YC76L6RXHJcbiAgICAgICAgICBoYW5kbGVDb25maXJtRmlsdGVyKHBhcmFtcywgISFvcHRpb24uZGF0YSwgb3B0aW9uKVxyXG4gICAgICAgIH0pXHJcbiAgICAgIH0pXHJcbiAgICB9KVxyXG4gIH1cclxufVxyXG5cclxuZnVuY3Rpb24gaGFuZGxlQ29uZmlybUZpbHRlciAocGFyYW1zOiBDb2x1bW5GaWx0ZXJSZW5kZXJQYXJhbXMsIGNoZWNrZWQ6IGJvb2xlYW4sIG9wdGlvbjogQ29sdW1uRmlsdGVyUGFyYW1zKSB7XHJcbiAgY29uc3QgeyAkcGFuZWwgfSA9IHBhcmFtc1xyXG4gICRwYW5lbC5jaGFuZ2VPcHRpb24oe30sIGNoZWNrZWQsIG9wdGlvbilcclxufVxyXG5cclxuZnVuY3Rpb24gZGVmYXVsdEZpbHRlck1ldGhvZCAocGFyYW1zOiBDb2x1bW5GaWx0ZXJNZXRob2RQYXJhbXMpIHtcclxuICBjb25zdCB7IG9wdGlvbiwgcm93LCBjb2x1bW4gfSA9IHBhcmFtc1xyXG4gIGNvbnN0IHsgZGF0YSB9ID0gb3B0aW9uXHJcbiAgY29uc3QgY2VsbFZhbHVlID0gWEVVdGlscy5nZXQocm93LCBjb2x1bW4ucHJvcGVydHkpXHJcbiAgLyogZXNsaW50LWRpc2FibGUgZXFlcWVxICovXHJcbiAgcmV0dXJuIGNlbGxWYWx1ZSA9PT0gZGF0YVxyXG59XHJcblxyXG5mdW5jdGlvbiByZW5kZXJPcHRpb25zIChoOiBDcmVhdGVFbGVtZW50LCBvcHRpb25zOiBhbnlbXSwgb3B0aW9uUHJvcHM6IE9wdGlvblByb3BzKSB7XHJcbiAgY29uc3QgbGFiZWxQcm9wID0gb3B0aW9uUHJvcHMubGFiZWwgfHwgJ2xhYmVsJ1xyXG4gIGNvbnN0IHZhbHVlUHJvcCA9IG9wdGlvblByb3BzLnZhbHVlIHx8ICd2YWx1ZSdcclxuICBjb25zdCBkaXNhYmxlZFByb3AgPSBvcHRpb25Qcm9wcy5kaXNhYmxlZCB8fCAnZGlzYWJsZWQnXHJcbiAgcmV0dXJuIFhFVXRpbHMubWFwKG9wdGlvbnMsIChpdGVtLCBvSW5kZXgpID0+IHtcclxuICAgIHJldHVybiBoKCdPcHRpb24nLCB7XHJcbiAgICAgIGtleTogb0luZGV4LFxyXG4gICAgICBwcm9wczoge1xyXG4gICAgICAgIHZhbHVlOiBpdGVtW3ZhbHVlUHJvcF0sXHJcbiAgICAgICAgbGFiZWw6IGl0ZW1bbGFiZWxQcm9wXSxcclxuICAgICAgICBkaXNhYmxlZDogaXRlbVtkaXNhYmxlZFByb3BdXHJcbiAgICAgIH1cclxuICAgIH0pXHJcbiAgfSlcclxufVxyXG5cclxuZnVuY3Rpb24gY2VsbFRleHQgKGg6IENyZWF0ZUVsZW1lbnQsIGNlbGxWYWx1ZTogYW55KSB7XHJcbiAgcmV0dXJuIFsnJyArIChpc0VtcHR5VmFsdWUoY2VsbFZhbHVlKSA/ICcnIDogY2VsbFZhbHVlKV1cclxufVxyXG5cclxuZnVuY3Rpb24gY3JlYXRlRm9ybUl0ZW1SZW5kZXIgKGRlZmF1bHRQcm9wcz86IHsgW2tleTogc3RyaW5nXTogYW55IH0pIHtcclxuICByZXR1cm4gZnVuY3Rpb24gKGg6IENyZWF0ZUVsZW1lbnQsIHJlbmRlck9wdHM6IEZvcm1JdGVtUmVuZGVyT3B0aW9ucywgcGFyYW1zOiBGb3JtSXRlbVJlbmRlclBhcmFtcykge1xyXG4gICAgY29uc3QgeyBkYXRhLCBwcm9wZXJ0eSB9ID0gcGFyYW1zXHJcbiAgICBjb25zdCB7IG5hbWUgfSA9IHJlbmRlck9wdHNcclxuICAgIGNvbnN0IHsgYXR0cnMgfSA9IHJlbmRlck9wdHNcclxuICAgIGNvbnN0IGl0ZW1WYWx1ZSA9IFhFVXRpbHMuZ2V0KGRhdGEsIHByb3BlcnR5KVxyXG4gICAgcmV0dXJuIFtcclxuICAgICAgaChuYW1lLCB7XHJcbiAgICAgICAgYXR0cnMsXHJcbiAgICAgICAgcHJvcHM6IGdldEl0ZW1Qcm9wcyhyZW5kZXJPcHRzLCBwYXJhbXMsIGl0ZW1WYWx1ZSwgZGVmYXVsdFByb3BzKSxcclxuICAgICAgICBvbjogZ2V0SXRlbU9ucyhyZW5kZXJPcHRzLCBwYXJhbXMpXHJcbiAgICAgIH0pXHJcbiAgICBdXHJcbiAgfVxyXG59XHJcblxyXG5mdW5jdGlvbiBkZWZhdWx0QnV0dG9uSXRlbVJlbmRlciAoaDogQ3JlYXRlRWxlbWVudCwgcmVuZGVyT3B0czogRm9ybUl0ZW1SZW5kZXJPcHRpb25zLCBwYXJhbXM6IEZvcm1JdGVtUmVuZGVyUGFyYW1zKSB7XHJcbiAgY29uc3QgeyBhdHRycyB9ID0gcmVuZGVyT3B0c1xyXG4gIGNvbnN0IHByb3BzID0gZ2V0SXRlbVByb3BzKHJlbmRlck9wdHMsIHBhcmFtcywgbnVsbClcclxuICByZXR1cm4gW1xyXG4gICAgaCgnQnV0dG9uJywge1xyXG4gICAgICBhdHRycyxcclxuICAgICAgcHJvcHMsXHJcbiAgICAgIG9uOiBnZXRPbnMocmVuZGVyT3B0cywgcGFyYW1zKVxyXG4gICAgfSwgY2VsbFRleHQoaCwgcmVuZGVyT3B0cy5jb250ZW50IHx8IHByb3BzLmNvbnRlbnQpKVxyXG4gIF1cclxufVxyXG5cclxuZnVuY3Rpb24gZGVmYXVsdEJ1dHRvbnNJdGVtUmVuZGVyIChoOiBDcmVhdGVFbGVtZW50LCByZW5kZXJPcHRzOiBGb3JtSXRlbVJlbmRlck9wdGlvbnMsIHBhcmFtczogRm9ybUl0ZW1SZW5kZXJQYXJhbXMpIHtcclxuICByZXR1cm4gcmVuZGVyT3B0cy5jaGlsZHJlbi5tYXAoKGNoaWxkUmVuZGVyT3B0czogRm9ybUl0ZW1SZW5kZXJPcHRpb25zKSA9PiBkZWZhdWx0QnV0dG9uSXRlbVJlbmRlcihoLCBjaGlsZFJlbmRlck9wdHMsIHBhcmFtcylbMF0pXHJcbn1cclxuXHJcbmZ1bmN0aW9uIGNyZWF0ZUV4cG9ydE1ldGhvZCAodmFsdWVNZXRob2Q6IEZ1bmN0aW9uLCBpc0VkaXQ/OiBib29sZWFuKSB7XHJcbiAgY29uc3QgcmVuZGVyUHJvcGVydHkgPSBpc0VkaXQgPyAnZWRpdFJlbmRlcicgOiAnY2VsbFJlbmRlcidcclxuICByZXR1cm4gZnVuY3Rpb24gKHBhcmFtczogQ29sdW1uRXhwb3J0Q2VsbFJlbmRlclBhcmFtcykge1xyXG4gICAgcmV0dXJuIHZhbHVlTWV0aG9kKHBhcmFtcy5jb2x1bW5bcmVuZGVyUHJvcGVydHldLCBwYXJhbXMpXHJcbiAgfVxyXG59XHJcblxyXG5mdW5jdGlvbiBjcmVhdGVGb3JtSXRlbVJhZGlvQW5kQ2hlY2tib3hSZW5kZXIgKCkge1xyXG4gIHJldHVybiBmdW5jdGlvbiAoaDogQ3JlYXRlRWxlbWVudCwgcmVuZGVyT3B0czogRm9ybUl0ZW1SZW5kZXJPcHRpb25zLCBwYXJhbXM6IEZvcm1JdGVtUmVuZGVyUGFyYW1zKSB7XHJcbiAgICBjb25zdCB7IG5hbWUsIG9wdGlvbnMgPSBbXSwgb3B0aW9uUHJvcHMgPSB7fSB9ID0gcmVuZGVyT3B0c1xyXG4gICAgY29uc3QgeyBkYXRhLCBwcm9wZXJ0eSB9ID0gcGFyYW1zXHJcbiAgICBjb25zdCB7IGF0dHJzIH0gPSByZW5kZXJPcHRzXHJcbiAgICBjb25zdCBsYWJlbFByb3AgPSBvcHRpb25Qcm9wcy5sYWJlbCB8fCAnbGFiZWwnXHJcbiAgICBjb25zdCB2YWx1ZVByb3AgPSBvcHRpb25Qcm9wcy52YWx1ZSB8fCAndmFsdWUnXHJcbiAgICBjb25zdCBkaXNhYmxlZFByb3AgPSBvcHRpb25Qcm9wcy5kaXNhYmxlZCB8fCAnZGlzYWJsZWQnXHJcbiAgICBjb25zdCBpdGVtVmFsdWUgPSBYRVV0aWxzLmdldChkYXRhLCBwcm9wZXJ0eSlcclxuICAgIHJldHVybiBbXHJcbiAgICAgIGgoYCR7bmFtZX1Hcm91cGAsIHtcclxuICAgICAgICBhdHRycyxcclxuICAgICAgICBwcm9wczogZ2V0SXRlbVByb3BzKHJlbmRlck9wdHMsIHBhcmFtcywgaXRlbVZhbHVlKSxcclxuICAgICAgICBvbjogZ2V0SXRlbU9ucyhyZW5kZXJPcHRzLCBwYXJhbXMpXHJcbiAgICAgIH0sIG9wdGlvbnMubWFwKChvcHRpb24pID0+IHtcclxuICAgICAgICByZXR1cm4gaChuYW1lLCB7XHJcbiAgICAgICAgICBwcm9wczoge1xyXG4gICAgICAgICAgICBsYWJlbDogb3B0aW9uW3ZhbHVlUHJvcF0sXHJcbiAgICAgICAgICAgIGRpc2FibGVkOiBvcHRpb25bZGlzYWJsZWRQcm9wXVxyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH0sIG9wdGlvbltsYWJlbFByb3BdKVxyXG4gICAgICB9KSlcclxuICAgIF1cclxuICB9XHJcbn1cclxuXHJcbi8qKlxyXG4gKiDmuLLmn5Plh73mlbBcclxuICovXHJcbmNvbnN0IHJlbmRlck1hcDogYW55ID0ge1xyXG4gIElucHV0OiB7XHJcbiAgICBhdXRvZm9jdXM6ICdpbnB1dC5pdnUtaW5wdXQnLFxyXG4gICAgcmVuZGVyRGVmYXVsdDogY3JlYXRlRWRpdFJlbmRlcigpLFxyXG4gICAgcmVuZGVyRWRpdDogY3JlYXRlRWRpdFJlbmRlcigpLFxyXG4gICAgcmVuZGVyRmlsdGVyOiBjcmVhdGVGaWx0ZXJSZW5kZXIoKSxcclxuICAgIGZpbHRlck1ldGhvZDogZGVmYXVsdEZpbHRlck1ldGhvZCxcclxuICAgIHJlbmRlckl0ZW06IGNyZWF0ZUZvcm1JdGVtUmVuZGVyKClcclxuICB9LFxyXG4gIEF1dG9Db21wbGV0ZToge1xyXG4gICAgYXV0b2ZvY3VzOiAnaW5wdXQuaXZ1LWlucHV0JyxcclxuICAgIHJlbmRlckRlZmF1bHQ6IGNyZWF0ZUVkaXRSZW5kZXIoKSxcclxuICAgIHJlbmRlckVkaXQ6IGNyZWF0ZUVkaXRSZW5kZXIoKSxcclxuICAgIHJlbmRlckZpbHRlcjogY3JlYXRlRmlsdGVyUmVuZGVyKCksXHJcbiAgICBmaWx0ZXJNZXRob2Q6IGRlZmF1bHRGaWx0ZXJNZXRob2QsXHJcbiAgICByZW5kZXJJdGVtOiBjcmVhdGVGb3JtSXRlbVJlbmRlcigpXHJcbiAgfSxcclxuICBJbnB1dE51bWJlcjoge1xyXG4gICAgYXV0b2ZvY3VzOiAnaW5wdXQuaXZ1LWlucHV0LW51bWJlci1pbnB1dCcsXHJcbiAgICByZW5kZXJEZWZhdWx0OiBjcmVhdGVFZGl0UmVuZGVyKCksXHJcbiAgICByZW5kZXJFZGl0OiBjcmVhdGVFZGl0UmVuZGVyKCksXHJcbiAgICByZW5kZXJGaWx0ZXI6IGNyZWF0ZUZpbHRlclJlbmRlcigpLFxyXG4gICAgZmlsdGVyTWV0aG9kOiBkZWZhdWx0RmlsdGVyTWV0aG9kLFxyXG4gICAgcmVuZGVySXRlbTogY3JlYXRlRm9ybUl0ZW1SZW5kZXIoKVxyXG4gIH0sXHJcbiAgU2VsZWN0OiB7XHJcbiAgICByZW5kZXJFZGl0IChoOiBDcmVhdGVFbGVtZW50LCByZW5kZXJPcHRzOiBDb2x1bW5FZGl0UmVuZGVyT3B0aW9ucywgcGFyYW1zOiBDb2x1bW5FZGl0UmVuZGVyUGFyYW1zKSB7XHJcbiAgICAgIGNvbnN0IHsgb3B0aW9ucyA9IFtdLCBvcHRpb25Hcm91cHMsIG9wdGlvblByb3BzID0ge30sIG9wdGlvbkdyb3VwUHJvcHMgPSB7fSB9ID0gcmVuZGVyT3B0c1xyXG4gICAgICBjb25zdCB7IHJvdywgY29sdW1uIH0gPSBwYXJhbXNcclxuICAgICAgY29uc3QgeyBhdHRycyB9ID0gcmVuZGVyT3B0c1xyXG4gICAgICBjb25zdCBjZWxsVmFsdWUgPSBYRVV0aWxzLmdldChyb3csIGNvbHVtbi5wcm9wZXJ0eSlcclxuICAgICAgY29uc3QgcHJvcHMgPSBnZXRDZWxsRWRpdEZpbHRlclByb3BzKHJlbmRlck9wdHMsIHBhcmFtcywgY2VsbFZhbHVlKVxyXG4gICAgICBjb25zdCBvbiA9IGdldEVkaXRPbnMocmVuZGVyT3B0cywgcGFyYW1zKVxyXG4gICAgICBpZiAob3B0aW9uR3JvdXBzKSB7XHJcbiAgICAgICAgY29uc3QgZ3JvdXBPcHRpb25zID0gb3B0aW9uR3JvdXBQcm9wcy5vcHRpb25zIHx8ICdvcHRpb25zJ1xyXG4gICAgICAgIGNvbnN0IGdyb3VwTGFiZWwgPSBvcHRpb25Hcm91cFByb3BzLmxhYmVsIHx8ICdsYWJlbCdcclxuICAgICAgICByZXR1cm4gW1xyXG4gICAgICAgICAgaCgnU2VsZWN0Jywge1xyXG4gICAgICAgICAgICBhdHRycyxcclxuICAgICAgICAgICAgcHJvcHMsXHJcbiAgICAgICAgICAgIG9uXHJcbiAgICAgICAgICB9LCBYRVV0aWxzLm1hcChvcHRpb25Hcm91cHMsIChncm91cCwgZ0luZGV4KSA9PiB7XHJcbiAgICAgICAgICAgIHJldHVybiBoKCdPcHRpb25Hcm91cCcsIHtcclxuICAgICAgICAgICAgICBwcm9wczoge1xyXG4gICAgICAgICAgICAgICAgbGFiZWw6IGdyb3VwW2dyb3VwTGFiZWxdXHJcbiAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICBrZXk6IGdJbmRleFxyXG4gICAgICAgICAgICB9LCByZW5kZXJPcHRpb25zKGgsIGdyb3VwW2dyb3VwT3B0aW9uc10sIG9wdGlvblByb3BzKSlcclxuICAgICAgICAgIH0pKVxyXG4gICAgICAgIF1cclxuICAgICAgfVxyXG4gICAgICByZXR1cm4gW1xyXG4gICAgICAgIGgoJ1NlbGVjdCcsIHtcclxuICAgICAgICAgIGF0dHJzLFxyXG4gICAgICAgICAgcHJvcHMsXHJcbiAgICAgICAgICBvblxyXG4gICAgICAgIH0sIHJlbmRlck9wdGlvbnMoaCwgb3B0aW9ucywgb3B0aW9uUHJvcHMpKVxyXG4gICAgICBdXHJcbiAgICB9LFxyXG4gICAgcmVuZGVyQ2VsbCAoaDogQ3JlYXRlRWxlbWVudCwgcmVuZGVyT3B0czogQ29sdW1uQ2VsbFJlbmRlck9wdGlvbnMsIHBhcmFtczogQ29sdW1uQ2VsbFJlbmRlclBhcmFtcykge1xyXG4gICAgICByZXR1cm4gY2VsbFRleHQoaCwgZ2V0U2VsZWN0Q2VsbFZhbHVlKHJlbmRlck9wdHMsIHBhcmFtcykpXHJcbiAgICB9LFxyXG4gICAgcmVuZGVyRmlsdGVyIChoOiBDcmVhdGVFbGVtZW50LCByZW5kZXJPcHRzOiBDb2x1bW5GaWx0ZXJSZW5kZXJPcHRpb25zLCBwYXJhbXM6IENvbHVtbkZpbHRlclJlbmRlclBhcmFtcykge1xyXG4gICAgICBjb25zdCB7IG9wdGlvbnMgPSBbXSwgb3B0aW9uR3JvdXBzLCBvcHRpb25Qcm9wcyA9IHt9LCBvcHRpb25Hcm91cFByb3BzID0ge30gfSA9IHJlbmRlck9wdHNcclxuICAgICAgY29uc3QgeyBjb2x1bW4gfSA9IHBhcmFtc1xyXG4gICAgICBjb25zdCB7IGF0dHJzIH0gPSByZW5kZXJPcHRzXHJcbiAgICAgIGlmIChvcHRpb25Hcm91cHMpIHtcclxuICAgICAgICBjb25zdCBncm91cE9wdGlvbnMgPSBvcHRpb25Hcm91cFByb3BzLm9wdGlvbnMgfHwgJ29wdGlvbnMnXHJcbiAgICAgICAgY29uc3QgZ3JvdXBMYWJlbCA9IG9wdGlvbkdyb3VwUHJvcHMubGFiZWwgfHwgJ2xhYmVsJ1xyXG4gICAgICAgIHJldHVybiBjb2x1bW4uZmlsdGVycy5tYXAoKG9wdGlvbiwgb0luZGV4KSA9PiB7XHJcbiAgICAgICAgICBjb25zdCBvcHRpb25WYWx1ZSA9IG9wdGlvbi5kYXRhXHJcbiAgICAgICAgICByZXR1cm4gaCgnU2VsZWN0Jywge1xyXG4gICAgICAgICAgICBrZXk6IG9JbmRleCxcclxuICAgICAgICAgICAgYXR0cnMsXHJcbiAgICAgICAgICAgIHByb3BzOiBnZXRDZWxsRWRpdEZpbHRlclByb3BzKHJlbmRlck9wdHMsIHBhcmFtcywgb3B0aW9uVmFsdWUpLFxyXG4gICAgICAgICAgICBvbjogZ2V0RmlsdGVyT25zKHJlbmRlck9wdHMsIHBhcmFtcywgb3B0aW9uLCAoKSA9PiB7XHJcbiAgICAgICAgICAgICAgLy8g5aSE55CGIGNoYW5nZSDkuovku7bnm7jlhbPpgLvovpFcclxuICAgICAgICAgICAgICBoYW5kbGVDb25maXJtRmlsdGVyKHBhcmFtcywgb3B0aW9uLmRhdGEgJiYgb3B0aW9uLmRhdGEubGVuZ3RoID4gMCwgb3B0aW9uKVxyXG4gICAgICAgICAgICB9KVxyXG4gICAgICAgICAgfSwgWEVVdGlscy5tYXAob3B0aW9uR3JvdXBzLCAoZ3JvdXAsIGdJbmRleCkgPT4ge1xyXG4gICAgICAgICAgICByZXR1cm4gaCgnT3B0aW9uR3JvdXAnLCB7XHJcbiAgICAgICAgICAgICAga2V5OiBnSW5kZXgsXHJcbiAgICAgICAgICAgICAgcHJvcHM6IHtcclxuICAgICAgICAgICAgICAgIGxhYmVsOiBncm91cFtncm91cExhYmVsXVxyXG4gICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSwgcmVuZGVyT3B0aW9ucyhoLCBncm91cFtncm91cE9wdGlvbnNdLCBvcHRpb25Qcm9wcykpXHJcbiAgICAgICAgICB9KSlcclxuICAgICAgICB9KVxyXG4gICAgICB9XHJcbiAgICAgIHJldHVybiBjb2x1bW4uZmlsdGVycy5tYXAoKG9wdGlvbiwgb0luZGV4KSA9PiB7XHJcbiAgICAgICAgY29uc3Qgb3B0aW9uVmFsdWUgPSBvcHRpb24uZGF0YVxyXG4gICAgICAgIHJldHVybiBoKCdTZWxlY3QnLCB7XHJcbiAgICAgICAgICBrZXk6IG9JbmRleCxcclxuICAgICAgICAgIGF0dHJzLFxyXG4gICAgICAgICAgcHJvcHM6IGdldENlbGxFZGl0RmlsdGVyUHJvcHMocmVuZGVyT3B0cywgcGFyYW1zLCBvcHRpb25WYWx1ZSksXHJcbiAgICAgICAgICBvbjogZ2V0RmlsdGVyT25zKHJlbmRlck9wdHMsIHBhcmFtcywgb3B0aW9uLCAoKSA9PiB7XHJcbiAgICAgICAgICAgIC8vIOWkhOeQhiBjaGFuZ2Ug5LqL5Lu255u45YWz6YC76L6RXHJcbiAgICAgICAgICAgIGhhbmRsZUNvbmZpcm1GaWx0ZXIocGFyYW1zLCBvcHRpb24uZGF0YSAmJiBvcHRpb24uZGF0YS5sZW5ndGggPiAwLCBvcHRpb24pXHJcbiAgICAgICAgICB9KVxyXG4gICAgICAgIH0sIHJlbmRlck9wdGlvbnMoaCwgb3B0aW9ucywgb3B0aW9uUHJvcHMpKVxyXG4gICAgICB9KVxyXG4gICAgfSxcclxuICAgIGZpbHRlck1ldGhvZCAocGFyYW1zOiBDb2x1bW5GaWx0ZXJNZXRob2RQYXJhbXMpIHtcclxuICAgICAgY29uc3QgeyBvcHRpb24sIHJvdywgY29sdW1uIH0gPSBwYXJhbXNcclxuICAgICAgY29uc3QgeyBkYXRhIH0gPSBvcHRpb25cclxuICAgICAgY29uc3QgeyBwcm9wZXJ0eSwgZmlsdGVyUmVuZGVyOiByZW5kZXJPcHRzIH0gPSBjb2x1bW5cclxuICAgICAgY29uc3QgeyBwcm9wcyA9IHt9IH0gPSByZW5kZXJPcHRzXHJcbiAgICAgIGNvbnN0IGNlbGxWYWx1ZSA9IFhFVXRpbHMuZ2V0KHJvdywgcHJvcGVydHkpXHJcbiAgICAgIGlmIChwcm9wcy5tdWx0aXBsZSkge1xyXG4gICAgICAgIGlmIChYRVV0aWxzLmlzQXJyYXkoY2VsbFZhbHVlKSkge1xyXG4gICAgICAgICAgcmV0dXJuIFhFVXRpbHMuaW5jbHVkZUFycmF5cyhjZWxsVmFsdWUsIGRhdGEpXHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBkYXRhLmluZGV4T2YoY2VsbFZhbHVlKSA+IC0xXHJcbiAgICAgIH1cclxuICAgICAgLyogZXNsaW50LWRpc2FibGUgZXFlcWVxICovXHJcbiAgICAgIHJldHVybiBjZWxsVmFsdWUgPT0gZGF0YVxyXG4gICAgfSxcclxuICAgIHJlbmRlckl0ZW0gKGg6IENyZWF0ZUVsZW1lbnQsIHJlbmRlck9wdHM6IEZvcm1JdGVtUmVuZGVyT3B0aW9ucywgcGFyYW1zOiBGb3JtSXRlbVJlbmRlclBhcmFtcykge1xyXG4gICAgICBjb25zdCB7IG9wdGlvbnMgPSBbXSwgb3B0aW9uR3JvdXBzLCBvcHRpb25Qcm9wcyA9IHt9LCBvcHRpb25Hcm91cFByb3BzID0ge30gfSA9IHJlbmRlck9wdHNcclxuICAgICAgY29uc3QgeyBkYXRhLCBwcm9wZXJ0eSB9ID0gcGFyYW1zXHJcbiAgICAgIGNvbnN0IHsgYXR0cnMgfSA9IHJlbmRlck9wdHNcclxuICAgICAgY29uc3QgaXRlbVZhbHVlID0gWEVVdGlscy5nZXQoZGF0YSwgcHJvcGVydHkpXHJcbiAgICAgIGNvbnN0IHByb3BzID0gZ2V0SXRlbVByb3BzKHJlbmRlck9wdHMsIHBhcmFtcywgaXRlbVZhbHVlKVxyXG4gICAgICBjb25zdCBvbiA9IGdldEl0ZW1PbnMocmVuZGVyT3B0cywgcGFyYW1zKVxyXG4gICAgICBpZiAob3B0aW9uR3JvdXBzKSB7XHJcbiAgICAgICAgY29uc3QgZ3JvdXBPcHRpb25zID0gb3B0aW9uR3JvdXBQcm9wcy5vcHRpb25zIHx8ICdvcHRpb25zJ1xyXG4gICAgICAgIGNvbnN0IGdyb3VwTGFiZWwgPSBvcHRpb25Hcm91cFByb3BzLmxhYmVsIHx8ICdsYWJlbCdcclxuICAgICAgICByZXR1cm4gW1xyXG4gICAgICAgICAgaCgnU2VsZWN0Jywge1xyXG4gICAgICAgICAgICBwcm9wcyxcclxuICAgICAgICAgICAgYXR0cnMsXHJcbiAgICAgICAgICAgIG9uXHJcbiAgICAgICAgICB9LCBYRVV0aWxzLm1hcChvcHRpb25Hcm91cHMsIChncm91cCwgZ0luZGV4KSA9PiB7XHJcbiAgICAgICAgICAgIHJldHVybiBoKCdPcHRpb25Hcm91cCcsIHtcclxuICAgICAgICAgICAgICBrZXk6IGdJbmRleCxcclxuICAgICAgICAgICAgICBwcm9wczoge1xyXG4gICAgICAgICAgICAgICAgbGFiZWw6IGdyb3VwW2dyb3VwTGFiZWxdXHJcbiAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9LCByZW5kZXJPcHRpb25zKGgsIGdyb3VwW2dyb3VwT3B0aW9uc10sIG9wdGlvblByb3BzKSlcclxuICAgICAgICAgIH0pKVxyXG4gICAgICAgIF1cclxuICAgICAgfVxyXG4gICAgICByZXR1cm4gW1xyXG4gICAgICAgIGgoJ1NlbGVjdCcsIHtcclxuICAgICAgICAgIHByb3BzLFxyXG4gICAgICAgICAgYXR0cnMsXHJcbiAgICAgICAgICBvblxyXG4gICAgICAgIH0sIHJlbmRlck9wdGlvbnMoaCwgb3B0aW9ucywgb3B0aW9uUHJvcHMpKVxyXG4gICAgICBdXHJcbiAgICB9LFxyXG4gICAgY2VsbEV4cG9ydE1ldGhvZDogY3JlYXRlRXhwb3J0TWV0aG9kKGdldFNlbGVjdENlbGxWYWx1ZSksXHJcbiAgICBlZGl0Q2VsbEV4cG9ydE1ldGhvZDogY3JlYXRlRXhwb3J0TWV0aG9kKGdldFNlbGVjdENlbGxWYWx1ZSwgdHJ1ZSlcclxuICB9LFxyXG4gIENhc2NhZGVyOiB7XHJcbiAgICByZW5kZXJFZGl0OiBjcmVhdGVFZGl0UmVuZGVyKHsgdHJhbnNmZXI6IHRydWUgfSksXHJcbiAgICByZW5kZXJDZWxsIChoOiBDcmVhdGVFbGVtZW50LCByZW5kZXJPcHRzOiBDb2x1bW5DZWxsUmVuZGVyT3B0aW9ucywgcGFyYW1zOiBDb2x1bW5FZGl0UmVuZGVyUGFyYW1zKSB7XHJcbiAgICAgIHJldHVybiBjZWxsVGV4dChoLCBnZXRDYXNjYWRlckNlbGxWYWx1ZShyZW5kZXJPcHRzLCBwYXJhbXMpKVxyXG4gICAgfSxcclxuICAgIHJlbmRlckl0ZW06IGNyZWF0ZUZvcm1JdGVtUmVuZGVyKCksXHJcbiAgICBjZWxsRXhwb3J0TWV0aG9kOiBjcmVhdGVFeHBvcnRNZXRob2QoZ2V0Q2FzY2FkZXJDZWxsVmFsdWUpLFxyXG4gICAgZWRpdENlbGxFeHBvcnRNZXRob2Q6IGNyZWF0ZUV4cG9ydE1ldGhvZChnZXRDYXNjYWRlckNlbGxWYWx1ZSwgdHJ1ZSlcclxuICB9LFxyXG4gIERhdGVQaWNrZXI6IHtcclxuICAgIHJlbmRlckVkaXQ6IGNyZWF0ZUVkaXRSZW5kZXIoeyB0cmFuc2ZlcjogdHJ1ZSB9KSxcclxuICAgIHJlbmRlckNlbGwgKGg6IENyZWF0ZUVsZW1lbnQsIHJlbmRlck9wdHM6IENvbHVtbkNlbGxSZW5kZXJPcHRpb25zLCBwYXJhbXM6IENvbHVtbkVkaXRSZW5kZXJQYXJhbXMpIHtcclxuICAgICAgcmV0dXJuIGNlbGxUZXh0KGgsIGdldERhdGVQaWNrZXJDZWxsVmFsdWUocmVuZGVyT3B0cywgcGFyYW1zKSlcclxuICAgIH0sXHJcbiAgICByZW5kZXJGaWx0ZXIgKGg6IENyZWF0ZUVsZW1lbnQsIHJlbmRlck9wdHM6IENvbHVtbkZpbHRlclJlbmRlck9wdGlvbnMsIHBhcmFtczogQ29sdW1uRmlsdGVyUmVuZGVyUGFyYW1zKSB7XHJcbiAgICAgIGNvbnN0IHsgY29sdW1uIH0gPSBwYXJhbXNcclxuICAgICAgY29uc3QgeyBhdHRycyB9ID0gcmVuZGVyT3B0c1xyXG4gICAgICByZXR1cm4gY29sdW1uLmZpbHRlcnMubWFwKChvcHRpb24sIG9JbmRleCkgPT4ge1xyXG4gICAgICAgIGNvbnN0IG9wdGlvblZhbHVlID0gb3B0aW9uLmRhdGFcclxuICAgICAgICByZXR1cm4gaChyZW5kZXJPcHRzLm5hbWUsIHtcclxuICAgICAgICAgIGtleTogb0luZGV4LFxyXG4gICAgICAgICAgYXR0cnMsXHJcbiAgICAgICAgICBwcm9wczogZ2V0Q2VsbEVkaXRGaWx0ZXJQcm9wcyhyZW5kZXJPcHRzLCBwYXJhbXMsIG9wdGlvblZhbHVlKSxcclxuICAgICAgICAgIG9uOiBnZXRGaWx0ZXJPbnMocmVuZGVyT3B0cywgcGFyYW1zLCBvcHRpb24sICgpID0+IHtcclxuICAgICAgICAgICAgLy8g5aSE55CGIGNoYW5nZSDkuovku7bnm7jlhbPpgLvovpFcclxuICAgICAgICAgICAgaGFuZGxlQ29uZmlybUZpbHRlcihwYXJhbXMsICEhb3B0aW9uLmRhdGEsIG9wdGlvbilcclxuICAgICAgICAgIH0pXHJcbiAgICAgICAgfSlcclxuICAgICAgfSlcclxuICAgIH0sXHJcbiAgICBmaWx0ZXJNZXRob2QgKHBhcmFtczogQ29sdW1uRmlsdGVyTWV0aG9kUGFyYW1zKSB7XHJcbiAgICAgIGNvbnN0IHsgb3B0aW9uLCByb3csIGNvbHVtbiB9ID0gcGFyYW1zXHJcbiAgICAgIGNvbnN0IHsgZGF0YSB9ID0gb3B0aW9uXHJcbiAgICAgIGNvbnN0IHsgZmlsdGVyUmVuZGVyOiByZW5kZXJPcHRzIH0gPSBjb2x1bW5cclxuICAgICAgY29uc3QgeyBwcm9wcyA9IHt9IH0gPSByZW5kZXJPcHRzXHJcbiAgICAgIGNvbnN0IGNlbGxWYWx1ZSA9IFhFVXRpbHMuZ2V0KHJvdywgY29sdW1uLnByb3BlcnR5KVxyXG4gICAgICBpZiAoZGF0YSkge1xyXG4gICAgICAgIHN3aXRjaCAocHJvcHMudHlwZSkge1xyXG4gICAgICAgICAgY2FzZSAnZGF0ZXJhbmdlJzpcclxuICAgICAgICAgICAgcmV0dXJuIGVxdWFsRGF0ZXJhbmdlKGNlbGxWYWx1ZSwgZGF0YSwgcHJvcHMsICd5eXl5LU1NLWRkJylcclxuICAgICAgICAgIGNhc2UgJ2RhdGV0aW1lcmFuZ2UnOlxyXG4gICAgICAgICAgICByZXR1cm4gZXF1YWxEYXRlcmFuZ2UoY2VsbFZhbHVlLCBkYXRhLCBwcm9wcywgJ3l5eXktTU0tZGQgSEg6c3M6bW0nKVxyXG4gICAgICAgICAgZGVmYXVsdDpcclxuICAgICAgICAgICAgcmV0dXJuIGNlbGxWYWx1ZSA9PT0gZGF0YVxyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgICByZXR1cm4gZmFsc2VcclxuICAgIH0sXHJcbiAgICByZW5kZXJJdGVtOiBjcmVhdGVGb3JtSXRlbVJlbmRlcigpLFxyXG4gICAgY2VsbEV4cG9ydE1ldGhvZDogY3JlYXRlRXhwb3J0TWV0aG9kKGdldERhdGVQaWNrZXJDZWxsVmFsdWUpLFxyXG4gICAgZWRpdENlbGxFeHBvcnRNZXRob2Q6IGNyZWF0ZUV4cG9ydE1ldGhvZChnZXREYXRlUGlja2VyQ2VsbFZhbHVlLCB0cnVlKVxyXG4gIH0sXHJcbiAgVGltZVBpY2tlcjoge1xyXG4gICAgcmVuZGVyRWRpdDogY3JlYXRlRWRpdFJlbmRlcih7IHRyYW5zZmVyOiB0cnVlIH0pLFxyXG4gICAgcmVuZGVySXRlbTogY3JlYXRlRm9ybUl0ZW1SZW5kZXIoKVxyXG4gIH0sXHJcbiAgUmF0ZToge1xyXG4gICAgcmVuZGVyRGVmYXVsdDogY3JlYXRlRWRpdFJlbmRlcigpLFxyXG4gICAgcmVuZGVyRWRpdDogY3JlYXRlRWRpdFJlbmRlcigpLFxyXG4gICAgcmVuZGVyRmlsdGVyOiBjcmVhdGVGaWx0ZXJSZW5kZXIoKSxcclxuICAgIGZpbHRlck1ldGhvZDogZGVmYXVsdEZpbHRlck1ldGhvZCxcclxuICAgIHJlbmRlckl0ZW06IGNyZWF0ZUZvcm1JdGVtUmVuZGVyKClcclxuICB9LFxyXG4gIGlTd2l0Y2g6IHtcclxuICAgIHJlbmRlckRlZmF1bHQ6IGNyZWF0ZUVkaXRSZW5kZXIoKSxcclxuICAgIHJlbmRlckVkaXQ6IGNyZWF0ZUVkaXRSZW5kZXIoKSxcclxuICAgIHJlbmRlckZpbHRlciAoaDogQ3JlYXRlRWxlbWVudCwgcmVuZGVyT3B0czogQ29sdW1uRmlsdGVyUmVuZGVyT3B0aW9ucywgcGFyYW1zOiBDb2x1bW5GaWx0ZXJSZW5kZXJQYXJhbXMpIHtcclxuICAgICAgY29uc3QgeyBjb2x1bW4gfSA9IHBhcmFtc1xyXG4gICAgICBjb25zdCB7IG5hbWUsIGF0dHJzIH0gPSByZW5kZXJPcHRzXHJcbiAgICAgIHJldHVybiBjb2x1bW4uZmlsdGVycy5tYXAoKG9wdGlvbiwgb0luZGV4KSA9PiB7XHJcbiAgICAgICAgY29uc3Qgb3B0aW9uVmFsdWUgPSBvcHRpb24uZGF0YVxyXG4gICAgICAgIHJldHVybiBoKG5hbWUsIHtcclxuICAgICAgICAgIGtleTogb0luZGV4LFxyXG4gICAgICAgICAgYXR0cnMsXHJcbiAgICAgICAgICBwcm9wczogZ2V0Q2VsbEVkaXRGaWx0ZXJQcm9wcyhyZW5kZXJPcHRzLCBwYXJhbXMsIG9wdGlvblZhbHVlKSxcclxuICAgICAgICAgIG9uOiBnZXRGaWx0ZXJPbnMocmVuZGVyT3B0cywgcGFyYW1zLCBvcHRpb24sICgpID0+IHtcclxuICAgICAgICAgICAgLy8g5aSE55CGIGNoYW5nZSDkuovku7bnm7jlhbPpgLvovpFcclxuICAgICAgICAgICAgaGFuZGxlQ29uZmlybUZpbHRlcihwYXJhbXMsIFhFVXRpbHMuaXNCb29sZWFuKG9wdGlvbi5kYXRhKSwgb3B0aW9uKVxyXG4gICAgICAgICAgfSlcclxuICAgICAgICB9KVxyXG4gICAgICB9KVxyXG4gICAgfSxcclxuICAgIGZpbHRlck1ldGhvZDogZGVmYXVsdEZpbHRlck1ldGhvZCxcclxuICAgIHJlbmRlckl0ZW06IGNyZWF0ZUZvcm1JdGVtUmVuZGVyKClcclxuICB9LFxyXG4gIFJhZGlvOiB7XHJcbiAgICByZW5kZXJJdGVtOiBjcmVhdGVGb3JtSXRlbVJhZGlvQW5kQ2hlY2tib3hSZW5kZXIoKVxyXG4gIH0sXHJcbiAgQ2hlY2tib3g6IHtcclxuICAgIHJlbmRlckl0ZW06IGNyZWF0ZUZvcm1JdGVtUmFkaW9BbmRDaGVja2JveFJlbmRlcigpXHJcbiAgfSxcclxuICBCdXR0b246IHtcclxuICAgIHJlbmRlckVkaXQ6IGRlZmF1bHRCdXR0b25FZGl0UmVuZGVyLFxyXG4gICAgcmVuZGVyRGVmYXVsdDogZGVmYXVsdEJ1dHRvbkVkaXRSZW5kZXIsXHJcbiAgICByZW5kZXJJdGVtOiBkZWZhdWx0QnV0dG9uSXRlbVJlbmRlclxyXG4gIH0sXHJcbiAgQnV0dG9uczoge1xyXG4gICAgcmVuZGVyRWRpdDogZGVmYXVsdEJ1dHRvbnNFZGl0UmVuZGVyLFxyXG4gICAgcmVuZGVyRGVmYXVsdDogZGVmYXVsdEJ1dHRvbnNFZGl0UmVuZGVyLFxyXG4gICAgcmVuZGVySXRlbTogZGVmYXVsdEJ1dHRvbnNJdGVtUmVuZGVyXHJcbiAgfVxyXG59XHJcblxyXG4vKipcclxuICog5qOA5p+l6Kem5Y+R5rqQ5piv5ZCm5bGe5LqO55uu5qCH6IqC54K5XHJcbiAqL1xyXG5mdW5jdGlvbiBnZXRFdmVudFRhcmdldE5vZGUgKGV2bnQ6IGFueSwgY29udGFpbmVyOiBIVE1MRWxlbWVudCwgY2xhc3NOYW1lOiBzdHJpbmcpIHtcclxuICBsZXQgdGFyZ2V0RWxlbVxyXG4gIGxldCB0YXJnZXQgPSBldm50LnRhcmdldFxyXG4gIHdoaWxlICh0YXJnZXQgJiYgdGFyZ2V0Lm5vZGVUeXBlICYmIHRhcmdldCAhPT0gZG9jdW1lbnQpIHtcclxuICAgIGlmIChjbGFzc05hbWUgJiYgdGFyZ2V0LmNsYXNzTmFtZSAmJiB0YXJnZXQuY2xhc3NOYW1lLnNwbGl0ICYmIHRhcmdldC5jbGFzc05hbWUuc3BsaXQoJyAnKS5pbmRleE9mKGNsYXNzTmFtZSkgPiAtMSkge1xyXG4gICAgICB0YXJnZXRFbGVtID0gdGFyZ2V0XHJcbiAgICB9IGVsc2UgaWYgKHRhcmdldCA9PT0gY29udGFpbmVyKSB7XHJcbiAgICAgIHJldHVybiB7IGZsYWc6IGNsYXNzTmFtZSA/ICEhdGFyZ2V0RWxlbSA6IHRydWUsIGNvbnRhaW5lciwgdGFyZ2V0RWxlbTogdGFyZ2V0RWxlbSB9XHJcbiAgICB9XHJcbiAgICB0YXJnZXQgPSB0YXJnZXQucGFyZW50Tm9kZVxyXG4gIH1cclxuICByZXR1cm4geyBmbGFnOiBmYWxzZSB9XHJcbn1cclxuXHJcbi8qKlxyXG4gKiDkuovku7blhbzlrrnmgKflpITnkIZcclxuICovXHJcbmZ1bmN0aW9uIGhhbmRsZUNsZWFyRXZlbnQgKHBhcmFtczogVGFibGVSZW5kZXJQYXJhbXMsIGV2bnQ6IGFueSkge1xyXG4gIGNvbnN0IGJvZHlFbGVtOiBIVE1MRWxlbWVudCA9IGRvY3VtZW50LmJvZHlcclxuICBpZiAoXHJcbiAgICAvLyDkuIvmi4nmoYbjgIHml6XmnJ9cclxuICAgIGdldEV2ZW50VGFyZ2V0Tm9kZShldm50LCBib2R5RWxlbSwgJ2l2dS1zZWxlY3QtZHJvcGRvd24nKS5mbGFnXHJcbiAgKSB7XHJcbiAgICByZXR1cm4gZmFsc2VcclxuICB9XHJcbn1cclxuXHJcbi8qKlxyXG4gKiDln7rkuo4gdnhlLXRhYmxlIOihqOagvOeahOmAgumFjeaPkuS7tu+8jOeUqOS6juWFvOWuuSBpdmlldyDnu4Tku7blupNcclxuICovXHJcbmV4cG9ydCBjb25zdCBWWEVUYWJsZVBsdWdpbklWaWV3ID0ge1xyXG4gIGluc3RhbGwgKHsgaW50ZXJjZXB0b3IsIHJlbmRlcmVyIH06IHR5cGVvZiBWWEVUYWJsZSkge1xyXG4gICAgcmVuZGVyZXIubWl4aW4ocmVuZGVyTWFwKVxyXG4gICAgaW50ZXJjZXB0b3IuYWRkKCdldmVudC5jbGVhckZpbHRlcicsIGhhbmRsZUNsZWFyRXZlbnQpXHJcbiAgICBpbnRlcmNlcHRvci5hZGQoJ2V2ZW50LmNsZWFyQWN0aXZlZCcsIGhhbmRsZUNsZWFyRXZlbnQpXHJcbiAgfVxyXG59XHJcblxyXG5pZiAodHlwZW9mIHdpbmRvdyAhPT0gJ3VuZGVmaW5lZCcgJiYgd2luZG93LlZYRVRhYmxlKSB7XHJcbiAgd2luZG93LlZYRVRhYmxlLnVzZShWWEVUYWJsZVBsdWdpbklWaWV3KVxyXG59XHJcblxyXG5leHBvcnQgZGVmYXVsdCBWWEVUYWJsZVBsdWdpbklWaWV3XHJcbiJdfQ==
