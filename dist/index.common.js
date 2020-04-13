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
    return [h('div', {
      "class": 'vxe-table--filter-iview-wrapper'
    }, column.filters.map(function (option, oIndex) {
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
    }))];
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
      var groupOptions = optionGroupProps.options || 'options';
      var groupLabel = optionGroupProps.label || 'label';
      var column = params.column;
      var attrs = renderOpts.attrs;
      return [h('div', {
        "class": 'vxe-table--filter-iview-wrapper'
      }, optionGroups ? column.filters.map(function (option, oIndex) {
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
      }) : column.filters.map(function (option, oIndex) {
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
      }))];
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
      return [h('div', {
        "class": 'vxe-table--filter-iview-wrapper'
      }, column.filters.map(function (option, oIndex) {
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
      }))];
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
      return [h('div', {
        "class": 'vxe-table--filter-iview-wrapper'
      }, column.filters.map(function (option, oIndex) {
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
      }))];
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


function handleClearEvent(params, e) {
  var bodyElem = document.body;
  var evnt = params.$event || e;

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
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImluZGV4LnRzIl0sIm5hbWVzIjpbImlzRW1wdHlWYWx1ZSIsImNlbGxWYWx1ZSIsInVuZGVmaW5lZCIsImdldE1vZGVsUHJvcCIsInJlbmRlck9wdHMiLCJnZXRNb2RlbEV2ZW50IiwiZ2V0Q2hhbmdlRXZlbnQiLCJnZXRGb3JtYXREYXRlIiwidmFsdWUiLCJwcm9wcyIsImRlZmF1bHRGb3JtYXQiLCJYRVV0aWxzIiwidG9EYXRlU3RyaW5nIiwiZm9ybWF0IiwiZ2V0Rm9ybWF0RGF0ZXMiLCJ2YWx1ZXMiLCJzZXBhcmF0b3IiLCJtYXAiLCJkYXRlIiwiam9pbiIsImVxdWFsRGF0ZXJhbmdlIiwiZGF0YSIsImdldENlbGxFZGl0RmlsdGVyUHJvcHMiLCJwYXJhbXMiLCJkZWZhdWx0UHJvcHMiLCJ2U2l6ZSIsIiR0YWJsZSIsImFzc2lnbiIsInNpemUiLCJnZXRJdGVtUHJvcHMiLCIkZm9ybSIsImdldE9ucyIsImlucHV0RnVuYyIsImNoYW5nZUZ1bmMiLCJldmVudHMiLCJtb2RlbEV2ZW50IiwiY2hhbmdlRXZlbnQiLCJpc1NhbWVFdmVudCIsIm9ucyIsIm9iamVjdEVhY2giLCJmdW5jIiwia2V5IiwiYXJncyIsImFyZ3MxIiwiZ2V0RWRpdE9ucyIsInJvdyIsImNvbHVtbiIsInNldCIsInByb3BlcnR5IiwidXBkYXRlU3RhdHVzIiwiZ2V0RmlsdGVyT25zIiwib3B0aW9uIiwiZ2V0SXRlbU9ucyIsIm1hdGNoQ2FzY2FkZXJEYXRhIiwiaW5kZXgiLCJsaXN0IiwibGFiZWxzIiwidmFsIiwibGVuZ3RoIiwiZWFjaCIsIml0ZW0iLCJwdXNoIiwibGFiZWwiLCJjaGlsZHJlbiIsImdldFNlbGVjdENlbGxWYWx1ZSIsIm9wdGlvbnMiLCJvcHRpb25Hcm91cHMiLCJvcHRpb25Qcm9wcyIsIm9wdGlvbkdyb3VwUHJvcHMiLCJsYWJlbFByb3AiLCJ2YWx1ZVByb3AiLCJncm91cE9wdGlvbnMiLCJnZXQiLCJjb2xpZCIsImlkIiwicmVzdCIsImNlbGxEYXRhIiwiZmlsdGVyYWJsZSIsImZ1bGxBbGxEYXRhUm93TWFwIiwiY2FjaGVDZWxsIiwiaGFzIiwibXVsdGlwbGUiLCJzZWxlY3RJdGVtIiwiZmluZCIsImNlbGxMYWJlbCIsImdldENhc2NhZGVyQ2VsbFZhbHVlIiwiZ2V0RGF0ZVBpY2tlckNlbGxWYWx1ZSIsInR5cGUiLCJjcmVhdGVFZGl0UmVuZGVyIiwiaCIsImF0dHJzIiwibmFtZSIsIm9uIiwiZGVmYXVsdEJ1dHRvbkVkaXRSZW5kZXIiLCJjZWxsVGV4dCIsImNvbnRlbnQiLCJkZWZhdWx0QnV0dG9uc0VkaXRSZW5kZXIiLCJjaGlsZFJlbmRlck9wdHMiLCJjcmVhdGVGaWx0ZXJSZW5kZXIiLCJmaWx0ZXJzIiwib0luZGV4Iiwib3B0aW9uVmFsdWUiLCJoYW5kbGVDb25maXJtRmlsdGVyIiwiY2hlY2tlZCIsIiRwYW5lbCIsImNoYW5nZU9wdGlvbiIsImRlZmF1bHRGaWx0ZXJNZXRob2QiLCJyZW5kZXJPcHRpb25zIiwiZGlzYWJsZWRQcm9wIiwiZGlzYWJsZWQiLCJjcmVhdGVGb3JtSXRlbVJlbmRlciIsIml0ZW1WYWx1ZSIsImRlZmF1bHRCdXR0b25JdGVtUmVuZGVyIiwiZGVmYXVsdEJ1dHRvbnNJdGVtUmVuZGVyIiwiY3JlYXRlRXhwb3J0TWV0aG9kIiwidmFsdWVNZXRob2QiLCJpc0VkaXQiLCJyZW5kZXJQcm9wZXJ0eSIsImNyZWF0ZUZvcm1JdGVtUmFkaW9BbmRDaGVja2JveFJlbmRlciIsInJlbmRlck1hcCIsIklucHV0IiwiYXV0b2ZvY3VzIiwicmVuZGVyRGVmYXVsdCIsInJlbmRlckVkaXQiLCJyZW5kZXJGaWx0ZXIiLCJmaWx0ZXJNZXRob2QiLCJyZW5kZXJJdGVtIiwiQXV0b0NvbXBsZXRlIiwiSW5wdXROdW1iZXIiLCJTZWxlY3QiLCJncm91cExhYmVsIiwiZ3JvdXAiLCJnSW5kZXgiLCJyZW5kZXJDZWxsIiwiZmlsdGVyUmVuZGVyIiwiaXNBcnJheSIsImluY2x1ZGVBcnJheXMiLCJpbmRleE9mIiwiY2VsbEV4cG9ydE1ldGhvZCIsImVkaXRDZWxsRXhwb3J0TWV0aG9kIiwiQ2FzY2FkZXIiLCJ0cmFuc2ZlciIsIkRhdGVQaWNrZXIiLCJUaW1lUGlja2VyIiwiUmF0ZSIsImlTd2l0Y2giLCJpc0Jvb2xlYW4iLCJSYWRpbyIsIkNoZWNrYm94IiwiQnV0dG9uIiwiQnV0dG9ucyIsImdldEV2ZW50VGFyZ2V0Tm9kZSIsImV2bnQiLCJjb250YWluZXIiLCJjbGFzc05hbWUiLCJ0YXJnZXRFbGVtIiwidGFyZ2V0Iiwibm9kZVR5cGUiLCJkb2N1bWVudCIsInNwbGl0IiwiZmxhZyIsInBhcmVudE5vZGUiLCJoYW5kbGVDbGVhckV2ZW50IiwiZSIsImJvZHlFbGVtIiwiYm9keSIsIiRldmVudCIsIlZYRVRhYmxlUGx1Z2luSVZpZXciLCJpbnN0YWxsIiwiaW50ZXJjZXB0b3IiLCJyZW5kZXJlciIsIm1peGluIiwiYWRkIiwid2luZG93IiwiVlhFVGFibGUiLCJ1c2UiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7QUFFQTs7Ozs7O0FBb0JBO0FBRUEsU0FBU0EsWUFBVCxDQUF1QkMsU0FBdkIsRUFBcUM7QUFDbkMsU0FBT0EsU0FBUyxLQUFLLElBQWQsSUFBc0JBLFNBQVMsS0FBS0MsU0FBcEMsSUFBaURELFNBQVMsS0FBSyxFQUF0RTtBQUNEOztBQUVELFNBQVNFLFlBQVQsQ0FBdUJDLFVBQXZCLEVBQWdEO0FBQzlDLFNBQU8sT0FBUDtBQUNEOztBQUVELFNBQVNDLGFBQVQsQ0FBd0JELFVBQXhCLEVBQWlEO0FBQy9DLFNBQU8sT0FBUDtBQUNEOztBQUVELFNBQVNFLGNBQVQsQ0FBeUJGLFVBQXpCLEVBQWtEO0FBQ2hELFNBQU8sV0FBUDtBQUNEOztBQUVELFNBQVNHLGFBQVQsQ0FBd0JDLEtBQXhCLEVBQW9DQyxLQUFwQyxFQUFtRUMsYUFBbkUsRUFBd0Y7QUFDdEYsU0FBT0Msb0JBQVFDLFlBQVIsQ0FBcUJKLEtBQXJCLEVBQTRCQyxLQUFLLENBQUNJLE1BQU4sSUFBZ0JILGFBQTVDLENBQVA7QUFDRDs7QUFFRCxTQUFTSSxjQUFULENBQXlCQyxNQUF6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LFFBQVEsQ0FBQ08sSUFBdkM7QUFDQSxNQUFNYixJQUFJLEdBQUdqSSxNQUFNLENBQUMrSSxNQUFQLElBQWlCSCxDQUE5Qjs7QUFDQSxPQUNFO0FBQ0FaLEVBQUFBLGtCQUFrQixDQUFDQyxJQUFELEVBQU9ZLFFBQVAsRUFBaUIscUJBQWpCLENBQWxCLENBQTBESixJQUY1RCxFQUdFO0FBQ0EsV0FBTyxLQUFQO0FBQ0Q7QUFDRjtBQUVEOzs7OztBQUdPLElBQU1PLG1CQUFtQixHQUFHO0FBQ2pDQyxFQUFBQSxPQURpQyx5QkFDa0I7QUFBQSxRQUF4Q0MsV0FBd0MsUUFBeENBLFdBQXdDO0FBQUEsUUFBM0JDLFFBQTJCLFFBQTNCQSxRQUEyQjtBQUNqREEsSUFBQUEsUUFBUSxDQUFDQyxLQUFULENBQWVwRCxTQUFmO0FBQ0FrRCxJQUFBQSxXQUFXLENBQUNHLEdBQVosQ0FBZ0IsbUJBQWhCLEVBQXFDVixnQkFBckM7QUFDQU8sSUFBQUEsV0FBVyxDQUFDRyxHQUFaLENBQWdCLG9CQUFoQixFQUFzQ1YsZ0JBQXRDO0FBQ0Q7QUFMZ0MsQ0FBNUI7OztBQVFQLElBQUksT0FBT1csTUFBUCxLQUFrQixXQUFsQixJQUFpQ0EsTUFBTSxDQUFDQyxRQUE1QyxFQUFzRDtBQUNwREQsRUFBQUEsTUFBTSxDQUFDQyxRQUFQLENBQWdCQyxHQUFoQixDQUFvQlIsbUJBQXBCO0FBQ0Q7O2VBRWNBLG1CIiwiZmlsZSI6ImluZGV4LmNvbW1vbi5qcyIsInNvdXJjZXNDb250ZW50IjpbIi8qIGVzbGludC1kaXNhYmxlIG5vLXVudXNlZC12YXJzICovXHJcbmltcG9ydCB7IENyZWF0ZUVsZW1lbnQgfSBmcm9tICd2dWUnXHJcbmltcG9ydCBYRVV0aWxzIGZyb20gJ3hlLXV0aWxzL21ldGhvZHMveGUtdXRpbHMnXHJcbmltcG9ydCB7XHJcbiAgVlhFVGFibGUsXHJcbiAgUmVuZGVyUGFyYW1zLFxyXG4gIE9wdGlvblByb3BzLFxyXG4gIEludGVyY2VwdG9yUGFyYW1zLFxyXG4gIFRhYmxlUmVuZGVyUGFyYW1zLFxyXG4gIFJlbmRlck9wdGlvbnMsXHJcbiAgQ29sdW1uRmlsdGVyUGFyYW1zLFxyXG4gIENvbHVtbkZpbHRlclJlbmRlck9wdGlvbnMsXHJcbiAgQ29sdW1uQ2VsbFJlbmRlck9wdGlvbnMsXHJcbiAgQ29sdW1uRWRpdFJlbmRlck9wdGlvbnMsXHJcbiAgQ29sdW1uQ2VsbFJlbmRlclBhcmFtcyxcclxuICBDb2x1bW5FZGl0UmVuZGVyUGFyYW1zLFxyXG4gIENvbHVtbkZpbHRlclJlbmRlclBhcmFtcyxcclxuICBDb2x1bW5GaWx0ZXJNZXRob2RQYXJhbXMsXHJcbiAgRm9ybUl0ZW1SZW5kZXJQYXJhbXMsXHJcbiAgRm9ybUl0ZW1SZW5kZXJPcHRpb25zLFxyXG4gIENvbHVtbkV4cG9ydENlbGxSZW5kZXJQYXJhbXNcclxufSBmcm9tICd2eGUtdGFibGUvbGliL3Z4ZS10YWJsZSdcclxuLyogZXNsaW50LWVuYWJsZSBuby11bnVzZWQtdmFycyAqL1xyXG5cclxuZnVuY3Rpb24gaXNFbXB0eVZhbHVlIChjZWxsVmFsdWU6IGFueSkge1xyXG4gIHJldHVybiBjZWxsVmFsdWUgPT09IG51bGwgfHwgY2VsbFZhbHVlID09PSB1bmRlZmluZWQgfHwgY2VsbFZhbHVlID09PSAnJ1xyXG59XHJcblxyXG5mdW5jdGlvbiBnZXRNb2RlbFByb3AgKHJlbmRlck9wdHM6IFJlbmRlck9wdGlvbnMpIHtcclxuICByZXR1cm4gJ3ZhbHVlJ1xyXG59XHJcblxyXG5mdW5jdGlvbiBnZXRNb2RlbEV2ZW50IChyZW5kZXJPcHRzOiBSZW5kZXJPcHRpb25zKSB7XHJcbiAgcmV0dXJuICdpbnB1dCdcclxufVxyXG5cclxuZnVuY3Rpb24gZ2V0Q2hhbmdlRXZlbnQgKHJlbmRlck9wdHM6IFJlbmRlck9wdGlvbnMpIHtcclxuICByZXR1cm4gJ29uLWNoYW5nZSdcclxufVxyXG5cclxuZnVuY3Rpb24gZ2V0Rm9ybWF0RGF0ZSAodmFsdWU6IGFueSwgcHJvcHM6IHsgW2tleTogc3RyaW5nXTogYW55IH0sIGRlZmF1bHRGb3JtYXQ6IHN0cmluZykge1xyXG4gIHJldHVybiBYRVV0aWxzLnRvRGF0ZVN0cmluZyh2YWx1ZSwgcHJvcHMuZm9ybWF0IHx8IGRlZmF1bHRGb3JtYXQpXHJcbn1cclxuXHJcbmZ1bmN0aW9uIGdldEZvcm1hdERhdGVzICh2YWx1ZXM6IGFueSwgcHJvcHM6IHsgW2tleTogc3RyaW5nXTogYW55IH0sIHNlcGFyYXRvcjogc3RyaW5nLCBkZWZhdWx0Rm9ybWF0OiBzdHJpbmcpIHtcclxuICByZXR1cm4gWEVVdGlscy5tYXAodmFsdWVzLCAoZGF0ZTogYW55KSA9PiBnZXRGb3JtYXREYXRlKGRhdGUsIHByb3BzLCBkZWZhdWx0Rm9ybWF0KSkuam9pbihzZXBhcmF0b3IpXHJcbn1cclxuXHJcbmZ1bmN0aW9uIGVxdWFsRGF0ZXJhbmdlIChjZWxsVmFsdWU6IGFueSwgZGF0YTogYW55LCBwcm9wczogeyBba2V5OiBzdHJpbmddOiBhbnkgfSwgZGVmYXVsdEZvcm1hdDogc3RyaW5nKSB7XHJcbiAgY2VsbFZhbHVlID0gZ2V0Rm9ybWF0RGF0ZShjZWxsVmFsdWUsIHByb3BzLCBkZWZhdWx0Rm9ybWF0KVxyXG4gIHJldHVybiBjZWxsVmFsdWUgPj0gZ2V0Rm9ybWF0RGF0ZShkYXRhWzBdLCBwcm9wcywgZGVmYXVsdEZvcm1hdCkgJiYgY2VsbFZhbHVlIDw9IGdldEZvcm1hdERhdGUoZGF0YVsxXSwgcHJvcHMsIGRlZmF1bHRGb3JtYXQpXHJcbn1cclxuXHJcbmZ1bmN0aW9uIGdldENlbGxFZGl0RmlsdGVyUHJvcHMgKHJlbmRlck9wdHM6IFJlbmRlck9wdGlvbnMsIHBhcmFtczogVGFibGVSZW5kZXJQYXJhbXMsIHZhbHVlOiBhbnksIGRlZmF1bHRQcm9wcz86IHsgW3Byb3A6IHN0cmluZ106IGFueSB9KSB7XHJcbiAgY29uc3QgeyB2U2l6ZSB9ID0gcGFyYW1zLiR0YWJsZVxyXG4gIHJldHVybiBYRVV0aWxzLmFzc2lnbih2U2l6ZSA/IHsgc2l6ZTogdlNpemUgfSA6IHt9LCBkZWZhdWx0UHJvcHMsIHJlbmRlck9wdHMucHJvcHMsIHsgW2dldE1vZGVsUHJvcChyZW5kZXJPcHRzKV06IHZhbHVlIH0pXHJcbn1cclxuXHJcbmZ1bmN0aW9uIGdldEl0ZW1Qcm9wcyAocmVuZGVyT3B0czogUmVuZGVyT3B0aW9ucywgcGFyYW1zOiBGb3JtSXRlbVJlbmRlclBhcmFtcywgdmFsdWU6IGFueSwgZGVmYXVsdFByb3BzPzogeyBbcHJvcDogc3RyaW5nXTogYW55IH0pIHtcclxuICBjb25zdCB7IHZTaXplIH0gPSBwYXJhbXMuJGZvcm1cclxuICByZXR1cm4gWEVVdGlscy5hc3NpZ24odlNpemUgPyB7IHNpemU6IHZTaXplIH0gOiB7fSwgZGVmYXVsdFByb3BzLCByZW5kZXJPcHRzLnByb3BzLCB7IFtnZXRNb2RlbFByb3AocmVuZGVyT3B0cyldOiB2YWx1ZSB9KVxyXG59XHJcblxyXG5mdW5jdGlvbiBnZXRPbnMgKHJlbmRlck9wdHM6IFJlbmRlck9wdGlvbnMsIHBhcmFtczogUmVuZGVyUGFyYW1zLCBpbnB1dEZ1bmM/OiBGdW5jdGlvbiwgY2hhbmdlRnVuYz86IEZ1bmN0aW9uKSB7XHJcbiAgY29uc3QgeyBldmVudHMgfSA9IHJlbmRlck9wdHNcclxuICBjb25zdCBtb2RlbEV2ZW50ID0gZ2V0TW9kZWxFdmVudChyZW5kZXJPcHRzKVxyXG4gIGNvbnN0IGNoYW5nZUV2ZW50ID0gZ2V0Q2hhbmdlRXZlbnQocmVuZGVyT3B0cylcclxuICBjb25zdCBpc1NhbWVFdmVudCA9IGNoYW5nZUV2ZW50ID09PSBtb2RlbEV2ZW50XHJcbiAgY29uc3Qgb25zOiB7IFt0eXBlOiBzdHJpbmddOiBGdW5jdGlvbiB9ID0ge31cclxuICBYRVV0aWxzLm9iamVjdEVhY2goZXZlbnRzLCAoZnVuYzogRnVuY3Rpb24sIGtleTogc3RyaW5nKSA9PiB7XHJcbiAgICBvbnNba2V5XSA9IGZ1bmN0aW9uICguLi5hcmdzOiBhbnlbXSkge1xyXG4gICAgICBmdW5jKHBhcmFtcywgLi4uYXJncylcclxuICAgIH1cclxuICB9KVxyXG4gIGlmIChpbnB1dEZ1bmMpIHtcclxuICAgIG9uc1ttb2RlbEV2ZW50XSA9IGZ1bmN0aW9uIChhcmdzMTogYW55KSB7XHJcbiAgICAgIGlucHV0RnVuYyhhcmdzMSlcclxuICAgICAgaWYgKGV2ZW50cyAmJiBldmVudHNbbW9kZWxFdmVudF0pIHtcclxuICAgICAgICBldmVudHNbbW9kZWxFdmVudF0oYXJnczEpXHJcbiAgICAgIH1cclxuICAgICAgaWYgKGlzU2FtZUV2ZW50ICYmIGNoYW5nZUZ1bmMpIHtcclxuICAgICAgICBjaGFuZ2VGdW5jKGFyZ3MxKVxyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgfVxyXG4gIGlmICghaXNTYW1lRXZlbnQgJiYgY2hhbmdlRnVuYykge1xyXG4gICAgb25zW2NoYW5nZUV2ZW50XSA9IGZ1bmN0aW9uICguLi5hcmdzOiBhbnlbXSkge1xyXG4gICAgICBjaGFuZ2VGdW5jKC4uLmFyZ3MpXHJcbiAgICAgIGlmIChldmVudHMgJiYgZXZlbnRzW2NoYW5nZUV2ZW50XSkge1xyXG4gICAgICAgIGV2ZW50c1tjaGFuZ2VFdmVudF0ocGFyYW1zLCAuLi5hcmdzKVxyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgfVxyXG4gIHJldHVybiBvbnNcclxufVxyXG5cclxuZnVuY3Rpb24gZ2V0RWRpdE9ucyAocmVuZGVyT3B0czogUmVuZGVyT3B0aW9ucywgcGFyYW1zOiBDb2x1bW5FZGl0UmVuZGVyUGFyYW1zKSB7XHJcbiAgY29uc3QgeyAkdGFibGUsIHJvdywgY29sdW1uIH0gPSBwYXJhbXNcclxuICByZXR1cm4gZ2V0T25zKHJlbmRlck9wdHMsIHBhcmFtcywgKHZhbHVlOiBhbnkpID0+IHtcclxuICAgIC8vIOWkhOeQhiBtb2RlbCDlgLzlj4zlkJHnu5HlrppcclxuICAgIFhFVXRpbHMuc2V0KHJvdywgY29sdW1uLnByb3BlcnR5LCB2YWx1ZSlcclxuICB9LCAoKSA9PiB7XHJcbiAgICAvLyDlpITnkIYgY2hhbmdlIOS6i+S7tuebuOWFs+mAu+i+kVxyXG4gICAgJHRhYmxlLnVwZGF0ZVN0YXR1cyhwYXJhbXMpXHJcbiAgfSlcclxufVxyXG5cclxuZnVuY3Rpb24gZ2V0RmlsdGVyT25zIChyZW5kZXJPcHRzOiBSZW5kZXJPcHRpb25zLCBwYXJhbXM6IENvbHVtbkZpbHRlclJlbmRlclBhcmFtcywgb3B0aW9uOiBDb2x1bW5GaWx0ZXJQYXJhbXMsIGNoYW5nZUZ1bmM6IEZ1bmN0aW9uKSB7XHJcbiAgcmV0dXJuIGdldE9ucyhyZW5kZXJPcHRzLCBwYXJhbXMsICh2YWx1ZTogYW55KSA9PiB7XHJcbiAgICAvLyDlpITnkIYgbW9kZWwg5YC85Y+M5ZCR57uR5a6aXHJcbiAgICBvcHRpb24uZGF0YSA9IHZhbHVlXHJcbiAgfSwgY2hhbmdlRnVuYylcclxufVxyXG5cclxuZnVuY3Rpb24gZ2V0SXRlbU9ucyAocmVuZGVyT3B0czogUmVuZGVyT3B0aW9ucywgcGFyYW1zOiBGb3JtSXRlbVJlbmRlclBhcmFtcykge1xyXG4gIGNvbnN0IHsgJGZvcm0sIGRhdGEsIHByb3BlcnR5IH0gPSBwYXJhbXNcclxuICByZXR1cm4gZ2V0T25zKHJlbmRlck9wdHMsIHBhcmFtcywgKHZhbHVlOiBhbnkpID0+IHtcclxuICAgIC8vIOWkhOeQhiBtb2RlbCDlgLzlj4zlkJHnu5HlrppcclxuICAgIFhFVXRpbHMuc2V0KGRhdGEsIHByb3BlcnR5LCB2YWx1ZSlcclxuICB9LCAoKSA9PiB7XHJcbiAgICAvLyDlpITnkIYgY2hhbmdlIOS6i+S7tuebuOWFs+mAu+i+kVxyXG4gICAgJGZvcm0udXBkYXRlU3RhdHVzKHBhcmFtcylcclxuICB9KVxyXG59XHJcblxyXG5mdW5jdGlvbiBtYXRjaENhc2NhZGVyRGF0YSAoaW5kZXg6IG51bWJlciwgbGlzdDogYW55W10sIHZhbHVlczogYW55W10sIGxhYmVsczogYW55W10pIHtcclxuICBjb25zdCB2YWwgPSB2YWx1ZXNbaW5kZXhdXHJcbiAgaWYgKGxpc3QgJiYgdmFsdWVzLmxlbmd0aCA+IGluZGV4KSB7XHJcbiAgICBYRVV0aWxzLmVhY2gobGlzdCwgKGl0ZW0pID0+IHtcclxuICAgICAgaWYgKGl0ZW0udmFsdWUgPT09IHZhbCkge1xyXG4gICAgICAgIGxhYmVscy5wdXNoKGl0ZW0ubGFiZWwpXHJcbiAgICAgICAgbWF0Y2hDYXNjYWRlckRhdGEoKytpbmRleCwgaXRlbS5jaGlsZHJlbiwgdmFsdWVzLCBsYWJlbHMpXHJcbiAgICAgIH1cclxuICAgIH0pXHJcbiAgfVxyXG59XHJcblxyXG5mdW5jdGlvbiBnZXRTZWxlY3RDZWxsVmFsdWUgKHJlbmRlck9wdHM6IENvbHVtbkNlbGxSZW5kZXJPcHRpb25zLCBwYXJhbXM6IENvbHVtbkNlbGxSZW5kZXJQYXJhbXMpIHtcclxuICBjb25zdCB7IG9wdGlvbnMgPSBbXSwgb3B0aW9uR3JvdXBzLCBwcm9wcyA9IHt9LCBvcHRpb25Qcm9wcyA9IHt9LCBvcHRpb25Hcm91cFByb3BzID0ge30gfSA9IHJlbmRlck9wdHNcclxuICBjb25zdCB7IHJvdywgY29sdW1uIH0gPSBwYXJhbXNcclxuICBjb25zdCAkdGFibGU6IGFueSA9IHBhcmFtcy4kdGFibGVcclxuICBjb25zdCBsYWJlbFByb3AgPSBvcHRpb25Qcm9wcy5sYWJlbCB8fCAnbGFiZWwnXHJcbiAgY29uc3QgdmFsdWVQcm9wID0gb3B0aW9uUHJvcHMudmFsdWUgfHwgJ3ZhbHVlJ1xyXG4gIGNvbnN0IGdyb3VwT3B0aW9ucyA9IG9wdGlvbkdyb3VwUHJvcHMub3B0aW9ucyB8fCAnb3B0aW9ucydcclxuICBjb25zdCBjZWxsVmFsdWUgPSBYRVV0aWxzLmdldChyb3csIGNvbHVtbi5wcm9wZXJ0eSlcclxuICBjb25zdCBjb2xpZCA9IGNvbHVtbi5pZFxyXG4gIGxldCByZXN0OiBhbnlcclxuICBsZXQgY2VsbERhdGE6IGFueVxyXG4gIGlmIChwcm9wcy5maWx0ZXJhYmxlKSB7XHJcbiAgICBjb25zdCBmdWxsQWxsRGF0YVJvd01hcDogTWFwPGFueSwgYW55PiA9ICR0YWJsZS5mdWxsQWxsRGF0YVJvd01hcFxyXG4gICAgY29uc3QgY2FjaGVDZWxsID0gZnVsbEFsbERhdGFSb3dNYXAuaGFzKHJvdylcclxuICAgIGlmIChjYWNoZUNlbGwpIHtcclxuICAgICAgcmVzdCA9IGZ1bGxBbGxEYXRhUm93TWFwLmdldChyb3cpXHJcbiAgICAgIGNlbGxEYXRhID0gcmVzdC5jZWxsRGF0YVxyXG4gICAgICBpZiAoIWNlbGxEYXRhKSB7XHJcbiAgICAgICAgY2VsbERhdGEgPSBmdWxsQWxsRGF0YVJvd01hcC5nZXQocm93KS5jZWxsRGF0YSA9IHt9XHJcbiAgICAgIH1cclxuICAgIH1cclxuICAgIGlmIChyZXN0ICYmIGNlbGxEYXRhW2NvbGlkXSAmJiBjZWxsRGF0YVtjb2xpZF0udmFsdWUgPT09IGNlbGxWYWx1ZSkge1xyXG4gICAgICByZXR1cm4gY2VsbERhdGFbY29saWRdLmxhYmVsXHJcbiAgICB9XHJcbiAgfVxyXG4gIGlmICghaXNFbXB0eVZhbHVlKGNlbGxWYWx1ZSkpIHtcclxuICAgIHJldHVybiBYRVV0aWxzLm1hcChwcm9wcy5tdWx0aXBsZSA/IGNlbGxWYWx1ZSA6IFtjZWxsVmFsdWVdLCBvcHRpb25Hcm91cHMgPyAodmFsdWUpID0+IHtcclxuICAgICAgbGV0IHNlbGVjdEl0ZW1cclxuICAgICAgZm9yIChsZXQgaW5kZXggPSAwOyBpbmRleCA8IG9wdGlvbkdyb3Vwcy5sZW5ndGg7IGluZGV4KyspIHtcclxuICAgICAgICBzZWxlY3RJdGVtID0gWEVVdGlscy5maW5kKG9wdGlvbkdyb3Vwc1tpbmRleF1bZ3JvdXBPcHRpb25zXSwgKGl0ZW0pID0+IGl0ZW1bdmFsdWVQcm9wXSA9PT0gdmFsdWUpXHJcbiAgICAgICAgaWYgKHNlbGVjdEl0ZW0pIHtcclxuICAgICAgICAgIGJyZWFrXHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICAgIGNvbnN0IGNlbGxMYWJlbDogYW55ID0gc2VsZWN0SXRlbSA/IHNlbGVjdEl0ZW1bbGFiZWxQcm9wXSA6IHZhbHVlXHJcbiAgICAgIGlmIChjZWxsRGF0YSAmJiBvcHRpb25zICYmIG9wdGlvbnMubGVuZ3RoKSB7XHJcbiAgICAgICAgY2VsbERhdGFbY29saWRdID0geyB2YWx1ZTogY2VsbFZhbHVlLCBsYWJlbDogY2VsbExhYmVsIH1cclxuICAgICAgfVxyXG4gICAgICByZXR1cm4gY2VsbExhYmVsXHJcbiAgICB9IDogKHZhbHVlKSA9PiB7XHJcbiAgICAgIGNvbnN0IHNlbGVjdEl0ZW0gPSBYRVV0aWxzLmZpbmQob3B0aW9ucywgKGl0ZW0pID0+IGl0ZW1bdmFsdWVQcm9wXSA9PT0gdmFsdWUpXHJcbiAgICAgIGNvbnN0IGNlbGxMYWJlbDogYW55ID0gc2VsZWN0SXRlbSA/IHNlbGVjdEl0ZW1bbGFiZWxQcm9wXSA6IHZhbHVlXHJcbiAgICAgIGlmIChjZWxsRGF0YSAmJiBvcHRpb25zICYmIG9wdGlvbnMubGVuZ3RoKSB7XHJcbiAgICAgICAgY2VsbERhdGFbY29saWRdID0geyB2YWx1ZTogY2VsbFZhbHVlLCBsYWJlbDogY2VsbExhYmVsIH1cclxuICAgICAgfVxyXG4gICAgICByZXR1cm4gY2VsbExhYmVsXHJcbiAgICB9KS5qb2luKCcsICcpXHJcbiAgfVxyXG4gIHJldHVybiBudWxsXHJcbn1cclxuXHJcbmZ1bmN0aW9uIGdldENhc2NhZGVyQ2VsbFZhbHVlIChyZW5kZXJPcHRzOiBSZW5kZXJPcHRpb25zLCBwYXJhbXM6IENvbHVtbkNlbGxSZW5kZXJQYXJhbXMpIHtcclxuICBjb25zdCB7IHByb3BzID0ge30gfSA9IHJlbmRlck9wdHNcclxuICBjb25zdCB7IHJvdywgY29sdW1uIH0gPSBwYXJhbXNcclxuICBjb25zdCBjZWxsVmFsdWUgPSBYRVV0aWxzLmdldChyb3csIGNvbHVtbi5wcm9wZXJ0eSlcclxuICBjb25zdCB2YWx1ZXM6IGFueVtdID0gY2VsbFZhbHVlIHx8IFtdXHJcbiAgY29uc3QgbGFiZWxzOiBhbnlbXSA9IFtdXHJcbiAgbWF0Y2hDYXNjYWRlckRhdGEoMCwgcHJvcHMuZGF0YSwgdmFsdWVzLCBsYWJlbHMpXHJcbiAgcmV0dXJuIGxhYmVscy5qb2luKGAgJHtwcm9wcy5zZXBhcmF0b3IgfHwgJy8nfSBgKVxyXG59XHJcblxyXG5mdW5jdGlvbiBnZXREYXRlUGlja2VyQ2VsbFZhbHVlIChyZW5kZXJPcHRzOiBSZW5kZXJPcHRpb25zLCBwYXJhbXM6IENvbHVtbkNlbGxSZW5kZXJQYXJhbXMpIHtcclxuICBjb25zdCB7IHByb3BzID0ge30gfSA9IHJlbmRlck9wdHNcclxuICBjb25zdCB7IHJvdywgY29sdW1uIH0gPSBwYXJhbXNcclxuICBjb25zdCB7IHNlcGFyYXRvciB9ID0gcHJvcHNcclxuICBsZXQgY2VsbFZhbHVlID0gWEVVdGlscy5nZXQocm93LCBjb2x1bW4ucHJvcGVydHkpXHJcbiAgc3dpdGNoIChwcm9wcy50eXBlKSB7XHJcbiAgICBjYXNlICd3ZWVrJzpcclxuICAgICAgY2VsbFZhbHVlID0gZ2V0Rm9ybWF0RGF0ZShjZWxsVmFsdWUsIHByb3BzLCAneXl5eXdXVycpXHJcbiAgICAgIGJyZWFrXHJcbiAgICBjYXNlICdtb250aCc6XHJcbiAgICAgIGNlbGxWYWx1ZSA9IGdldEZvcm1hdERhdGUoY2VsbFZhbHVlLCBwcm9wcywgJ3l5eXktTU0nKVxyXG4gICAgICBicmVha1xyXG4gICAgY2FzZSAneWVhcic6XHJcbiAgICAgIGNlbGxWYWx1ZSA9IGdldEZvcm1hdERhdGUoY2VsbFZhbHVlLCBwcm9wcywgJ3l5eXknKVxyXG4gICAgICBicmVha1xyXG4gICAgY2FzZSAnZGF0ZXMnOlxyXG4gICAgICBjZWxsVmFsdWUgPSBnZXRGb3JtYXREYXRlcyhjZWxsVmFsdWUsIHByb3BzLCAnLCAnLCAneXl5eS1NTS1kZCcpXHJcbiAgICAgIGJyZWFrXHJcbiAgICBjYXNlICdkYXRlcmFuZ2UnOlxyXG4gICAgICBjZWxsVmFsdWUgPSBnZXRGb3JtYXREYXRlcyhjZWxsVmFsdWUsIHByb3BzLCBgICR7c2VwYXJhdG9yIHx8ICctJ30gYCwgJ3l5eXktTU0tZGQnKVxyXG4gICAgICBicmVha1xyXG4gICAgY2FzZSAnZGF0ZXRpbWVyYW5nZSc6XHJcbiAgICAgIGNlbGxWYWx1ZSA9IGdldEZvcm1hdERhdGVzKGNlbGxWYWx1ZSwgcHJvcHMsIGAgJHtzZXBhcmF0b3IgfHwgJy0nfSBgLCAneXl5eS1NTS1kZCBISDpzczptbScpXHJcbiAgICAgIGJyZWFrXHJcbiAgICBkZWZhdWx0OlxyXG4gICAgICBjZWxsVmFsdWUgPSBnZXRGb3JtYXREYXRlKGNlbGxWYWx1ZSwgcHJvcHMsICd5eXl5LU1NLWRkJylcclxuICAgICAgYnJlYWtcclxuICB9XHJcbiAgcmV0dXJuIGNlbGxWYWx1ZVxyXG59XHJcblxyXG5mdW5jdGlvbiBjcmVhdGVFZGl0UmVuZGVyIChkZWZhdWx0UHJvcHM/OiB7IFtrZXk6IHN0cmluZ106IGFueSB9KSB7XHJcbiAgcmV0dXJuIGZ1bmN0aW9uIChoOiBDcmVhdGVFbGVtZW50LCByZW5kZXJPcHRzOiBDb2x1bW5FZGl0UmVuZGVyT3B0aW9ucywgcGFyYW1zOiBDb2x1bW5FZGl0UmVuZGVyUGFyYW1zKSB7XHJcbiAgICBjb25zdCB7IHJvdywgY29sdW1uIH0gPSBwYXJhbXNcclxuICAgIGNvbnN0IHsgYXR0cnMgfSA9IHJlbmRlck9wdHNcclxuICAgIGNvbnN0IGNlbGxWYWx1ZSA9IFhFVXRpbHMuZ2V0KHJvdywgY29sdW1uLnByb3BlcnR5KVxyXG4gICAgcmV0dXJuIFtcclxuICAgICAgaChyZW5kZXJPcHRzLm5hbWUsIHtcclxuICAgICAgICBhdHRycyxcclxuICAgICAgICBwcm9wczogZ2V0Q2VsbEVkaXRGaWx0ZXJQcm9wcyhyZW5kZXJPcHRzLCBwYXJhbXMsIGNlbGxWYWx1ZSwgZGVmYXVsdFByb3BzKSxcclxuICAgICAgICBvbjogZ2V0RWRpdE9ucyhyZW5kZXJPcHRzLCBwYXJhbXMpXHJcbiAgICAgIH0pXHJcbiAgICBdXHJcbiAgfVxyXG59XHJcblxyXG5mdW5jdGlvbiBkZWZhdWx0QnV0dG9uRWRpdFJlbmRlciAoaDogQ3JlYXRlRWxlbWVudCwgcmVuZGVyT3B0czogQ29sdW1uRWRpdFJlbmRlck9wdGlvbnMsIHBhcmFtczogQ29sdW1uRWRpdFJlbmRlclBhcmFtcykge1xyXG4gIGNvbnN0IHsgYXR0cnMgfSA9IHJlbmRlck9wdHNcclxuICByZXR1cm4gW1xyXG4gICAgaCgnQnV0dG9uJywge1xyXG4gICAgICBhdHRycyxcclxuICAgICAgcHJvcHM6IGdldENlbGxFZGl0RmlsdGVyUHJvcHMocmVuZGVyT3B0cywgcGFyYW1zLCBudWxsKSxcclxuICAgICAgb246IGdldE9ucyhyZW5kZXJPcHRzLCBwYXJhbXMpXHJcbiAgICB9LCBjZWxsVGV4dChoLCByZW5kZXJPcHRzLmNvbnRlbnQpKVxyXG4gIF1cclxufVxyXG5cclxuZnVuY3Rpb24gZGVmYXVsdEJ1dHRvbnNFZGl0UmVuZGVyIChoOiBDcmVhdGVFbGVtZW50LCByZW5kZXJPcHRzOiBDb2x1bW5FZGl0UmVuZGVyT3B0aW9ucywgcGFyYW1zOiBDb2x1bW5FZGl0UmVuZGVyUGFyYW1zKSB7XHJcbiAgcmV0dXJuIHJlbmRlck9wdHMuY2hpbGRyZW4ubWFwKChjaGlsZFJlbmRlck9wdHM6IENvbHVtbkVkaXRSZW5kZXJPcHRpb25zKSA9PiBkZWZhdWx0QnV0dG9uRWRpdFJlbmRlcihoLCBjaGlsZFJlbmRlck9wdHMsIHBhcmFtcylbMF0pXHJcbn1cclxuXHJcbmZ1bmN0aW9uIGNyZWF0ZUZpbHRlclJlbmRlciAoZGVmYXVsdFByb3BzPzogeyBba2V5OiBzdHJpbmddOiBhbnkgfSkge1xyXG4gIHJldHVybiBmdW5jdGlvbiAoaDogQ3JlYXRlRWxlbWVudCwgcmVuZGVyT3B0czogQ29sdW1uRmlsdGVyUmVuZGVyT3B0aW9ucywgcGFyYW1zOiBDb2x1bW5GaWx0ZXJSZW5kZXJQYXJhbXMpIHtcclxuICAgIGNvbnN0IHsgY29sdW1uIH0gPSBwYXJhbXNcclxuICAgIGNvbnN0IHsgbmFtZSwgYXR0cnMgfSA9IHJlbmRlck9wdHNcclxuICAgIHJldHVybiBbXHJcbiAgICAgIGgoJ2RpdicsIHtcclxuICAgICAgICBjbGFzczogJ3Z4ZS10YWJsZS0tZmlsdGVyLWl2aWV3LXdyYXBwZXInXHJcbiAgICAgIH0sIGNvbHVtbi5maWx0ZXJzLm1hcCgob3B0aW9uLCBvSW5kZXgpID0+IHtcclxuICAgICAgICBjb25zdCBvcHRpb25WYWx1ZSA9IG9wdGlvbi5kYXRhXHJcbiAgICAgICAgcmV0dXJuIGgobmFtZSwge1xyXG4gICAgICAgICAga2V5OiBvSW5kZXgsXHJcbiAgICAgICAgICBhdHRycyxcclxuICAgICAgICAgIHByb3BzOiBnZXRDZWxsRWRpdEZpbHRlclByb3BzKHJlbmRlck9wdHMsIHBhcmFtcywgb3B0aW9uVmFsdWUsIGRlZmF1bHRQcm9wcyksXHJcbiAgICAgICAgICBvbjogZ2V0RmlsdGVyT25zKHJlbmRlck9wdHMsIHBhcmFtcywgb3B0aW9uLCAoKSA9PiB7XHJcbiAgICAgICAgICAgIC8vIOWkhOeQhiBjaGFuZ2Ug5LqL5Lu255u45YWz6YC76L6RXHJcbiAgICAgICAgICAgIGhhbmRsZUNvbmZpcm1GaWx0ZXIocGFyYW1zLCAhIW9wdGlvbi5kYXRhLCBvcHRpb24pXHJcbiAgICAgICAgICB9KVxyXG4gICAgICAgIH0pXHJcbiAgICAgIH0pKVxyXG4gICAgXVxyXG4gIH1cclxufVxyXG5cclxuZnVuY3Rpb24gaGFuZGxlQ29uZmlybUZpbHRlciAocGFyYW1zOiBDb2x1bW5GaWx0ZXJSZW5kZXJQYXJhbXMsIGNoZWNrZWQ6IGJvb2xlYW4sIG9wdGlvbjogQ29sdW1uRmlsdGVyUGFyYW1zKSB7XHJcbiAgY29uc3QgeyAkcGFuZWwgfSA9IHBhcmFtc1xyXG4gICRwYW5lbC5jaGFuZ2VPcHRpb24oe30sIGNoZWNrZWQsIG9wdGlvbilcclxufVxyXG5cclxuZnVuY3Rpb24gZGVmYXVsdEZpbHRlck1ldGhvZCAocGFyYW1zOiBDb2x1bW5GaWx0ZXJNZXRob2RQYXJhbXMpIHtcclxuICBjb25zdCB7IG9wdGlvbiwgcm93LCBjb2x1bW4gfSA9IHBhcmFtc1xyXG4gIGNvbnN0IHsgZGF0YSB9ID0gb3B0aW9uXHJcbiAgY29uc3QgY2VsbFZhbHVlID0gWEVVdGlscy5nZXQocm93LCBjb2x1bW4ucHJvcGVydHkpXHJcbiAgLyogZXNsaW50LWRpc2FibGUgZXFlcWVxICovXHJcbiAgcmV0dXJuIGNlbGxWYWx1ZSA9PT0gZGF0YVxyXG59XHJcblxyXG5mdW5jdGlvbiByZW5kZXJPcHRpb25zIChoOiBDcmVhdGVFbGVtZW50LCBvcHRpb25zOiBhbnlbXSwgb3B0aW9uUHJvcHM6IE9wdGlvblByb3BzKSB7XHJcbiAgY29uc3QgbGFiZWxQcm9wID0gb3B0aW9uUHJvcHMubGFiZWwgfHwgJ2xhYmVsJ1xyXG4gIGNvbnN0IHZhbHVlUHJvcCA9IG9wdGlvblByb3BzLnZhbHVlIHx8ICd2YWx1ZSdcclxuICBjb25zdCBkaXNhYmxlZFByb3AgPSBvcHRpb25Qcm9wcy5kaXNhYmxlZCB8fCAnZGlzYWJsZWQnXHJcbiAgcmV0dXJuIFhFVXRpbHMubWFwKG9wdGlvbnMsIChpdGVtLCBvSW5kZXgpID0+IHtcclxuICAgIHJldHVybiBoKCdPcHRpb24nLCB7XHJcbiAgICAgIGtleTogb0luZGV4LFxyXG4gICAgICBwcm9wczoge1xyXG4gICAgICAgIHZhbHVlOiBpdGVtW3ZhbHVlUHJvcF0sXHJcbiAgICAgICAgbGFiZWw6IGl0ZW1bbGFiZWxQcm9wXSxcclxuICAgICAgICBkaXNhYmxlZDogaXRlbVtkaXNhYmxlZFByb3BdXHJcbiAgICAgIH1cclxuICAgIH0pXHJcbiAgfSlcclxufVxyXG5cclxuZnVuY3Rpb24gY2VsbFRleHQgKGg6IENyZWF0ZUVsZW1lbnQsIGNlbGxWYWx1ZTogYW55KSB7XHJcbiAgcmV0dXJuIFsnJyArIChpc0VtcHR5VmFsdWUoY2VsbFZhbHVlKSA/ICcnIDogY2VsbFZhbHVlKV1cclxufVxyXG5cclxuZnVuY3Rpb24gY3JlYXRlRm9ybUl0ZW1SZW5kZXIgKGRlZmF1bHRQcm9wcz86IHsgW2tleTogc3RyaW5nXTogYW55IH0pIHtcclxuICByZXR1cm4gZnVuY3Rpb24gKGg6IENyZWF0ZUVsZW1lbnQsIHJlbmRlck9wdHM6IEZvcm1JdGVtUmVuZGVyT3B0aW9ucywgcGFyYW1zOiBGb3JtSXRlbVJlbmRlclBhcmFtcykge1xyXG4gICAgY29uc3QgeyBkYXRhLCBwcm9wZXJ0eSB9ID0gcGFyYW1zXHJcbiAgICBjb25zdCB7IG5hbWUgfSA9IHJlbmRlck9wdHNcclxuICAgIGNvbnN0IHsgYXR0cnMgfSA9IHJlbmRlck9wdHNcclxuICAgIGNvbnN0IGl0ZW1WYWx1ZSA9IFhFVXRpbHMuZ2V0KGRhdGEsIHByb3BlcnR5KVxyXG4gICAgcmV0dXJuIFtcclxuICAgICAgaChuYW1lLCB7XHJcbiAgICAgICAgYXR0cnMsXHJcbiAgICAgICAgcHJvcHM6IGdldEl0ZW1Qcm9wcyhyZW5kZXJPcHRzLCBwYXJhbXMsIGl0ZW1WYWx1ZSwgZGVmYXVsdFByb3BzKSxcclxuICAgICAgICBvbjogZ2V0SXRlbU9ucyhyZW5kZXJPcHRzLCBwYXJhbXMpXHJcbiAgICAgIH0pXHJcbiAgICBdXHJcbiAgfVxyXG59XHJcblxyXG5mdW5jdGlvbiBkZWZhdWx0QnV0dG9uSXRlbVJlbmRlciAoaDogQ3JlYXRlRWxlbWVudCwgcmVuZGVyT3B0czogRm9ybUl0ZW1SZW5kZXJPcHRpb25zLCBwYXJhbXM6IEZvcm1JdGVtUmVuZGVyUGFyYW1zKSB7XHJcbiAgY29uc3QgeyBhdHRycyB9ID0gcmVuZGVyT3B0c1xyXG4gIGNvbnN0IHByb3BzID0gZ2V0SXRlbVByb3BzKHJlbmRlck9wdHMsIHBhcmFtcywgbnVsbClcclxuICByZXR1cm4gW1xyXG4gICAgaCgnQnV0dG9uJywge1xyXG4gICAgICBhdHRycyxcclxuICAgICAgcHJvcHMsXHJcbiAgICAgIG9uOiBnZXRPbnMocmVuZGVyT3B0cywgcGFyYW1zKVxyXG4gICAgfSwgY2VsbFRleHQoaCwgcmVuZGVyT3B0cy5jb250ZW50IHx8IHByb3BzLmNvbnRlbnQpKVxyXG4gIF1cclxufVxyXG5cclxuZnVuY3Rpb24gZGVmYXVsdEJ1dHRvbnNJdGVtUmVuZGVyIChoOiBDcmVhdGVFbGVtZW50LCByZW5kZXJPcHRzOiBGb3JtSXRlbVJlbmRlck9wdGlvbnMsIHBhcmFtczogRm9ybUl0ZW1SZW5kZXJQYXJhbXMpIHtcclxuICByZXR1cm4gcmVuZGVyT3B0cy5jaGlsZHJlbi5tYXAoKGNoaWxkUmVuZGVyT3B0czogRm9ybUl0ZW1SZW5kZXJPcHRpb25zKSA9PiBkZWZhdWx0QnV0dG9uSXRlbVJlbmRlcihoLCBjaGlsZFJlbmRlck9wdHMsIHBhcmFtcylbMF0pXHJcbn1cclxuXHJcbmZ1bmN0aW9uIGNyZWF0ZUV4cG9ydE1ldGhvZCAodmFsdWVNZXRob2Q6IEZ1bmN0aW9uLCBpc0VkaXQ/OiBib29sZWFuKSB7XHJcbiAgY29uc3QgcmVuZGVyUHJvcGVydHkgPSBpc0VkaXQgPyAnZWRpdFJlbmRlcicgOiAnY2VsbFJlbmRlcidcclxuICByZXR1cm4gZnVuY3Rpb24gKHBhcmFtczogQ29sdW1uRXhwb3J0Q2VsbFJlbmRlclBhcmFtcykge1xyXG4gICAgcmV0dXJuIHZhbHVlTWV0aG9kKHBhcmFtcy5jb2x1bW5bcmVuZGVyUHJvcGVydHldLCBwYXJhbXMpXHJcbiAgfVxyXG59XHJcblxyXG5mdW5jdGlvbiBjcmVhdGVGb3JtSXRlbVJhZGlvQW5kQ2hlY2tib3hSZW5kZXIgKCkge1xyXG4gIHJldHVybiBmdW5jdGlvbiAoaDogQ3JlYXRlRWxlbWVudCwgcmVuZGVyT3B0czogRm9ybUl0ZW1SZW5kZXJPcHRpb25zLCBwYXJhbXM6IEZvcm1JdGVtUmVuZGVyUGFyYW1zKSB7XHJcbiAgICBjb25zdCB7IG5hbWUsIG9wdGlvbnMgPSBbXSwgb3B0aW9uUHJvcHMgPSB7fSB9ID0gcmVuZGVyT3B0c1xyXG4gICAgY29uc3QgeyBkYXRhLCBwcm9wZXJ0eSB9ID0gcGFyYW1zXHJcbiAgICBjb25zdCB7IGF0dHJzIH0gPSByZW5kZXJPcHRzXHJcbiAgICBjb25zdCBsYWJlbFByb3AgPSBvcHRpb25Qcm9wcy5sYWJlbCB8fCAnbGFiZWwnXHJcbiAgICBjb25zdCB2YWx1ZVByb3AgPSBvcHRpb25Qcm9wcy52YWx1ZSB8fCAndmFsdWUnXHJcbiAgICBjb25zdCBkaXNhYmxlZFByb3AgPSBvcHRpb25Qcm9wcy5kaXNhYmxlZCB8fCAnZGlzYWJsZWQnXHJcbiAgICBjb25zdCBpdGVtVmFsdWUgPSBYRVV0aWxzLmdldChkYXRhLCBwcm9wZXJ0eSlcclxuICAgIHJldHVybiBbXHJcbiAgICAgIGgoYCR7bmFtZX1Hcm91cGAsIHtcclxuICAgICAgICBhdHRycyxcclxuICAgICAgICBwcm9wczogZ2V0SXRlbVByb3BzKHJlbmRlck9wdHMsIHBhcmFtcywgaXRlbVZhbHVlKSxcclxuICAgICAgICBvbjogZ2V0SXRlbU9ucyhyZW5kZXJPcHRzLCBwYXJhbXMpXHJcbiAgICAgIH0sIG9wdGlvbnMubWFwKChvcHRpb24pID0+IHtcclxuICAgICAgICByZXR1cm4gaChuYW1lLCB7XHJcbiAgICAgICAgICBwcm9wczoge1xyXG4gICAgICAgICAgICBsYWJlbDogb3B0aW9uW3ZhbHVlUHJvcF0sXHJcbiAgICAgICAgICAgIGRpc2FibGVkOiBvcHRpb25bZGlzYWJsZWRQcm9wXVxyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH0sIG9wdGlvbltsYWJlbFByb3BdKVxyXG4gICAgICB9KSlcclxuICAgIF1cclxuICB9XHJcbn1cclxuXHJcbi8qKlxyXG4gKiDmuLLmn5Plh73mlbBcclxuICovXHJcbmNvbnN0IHJlbmRlck1hcCA9IHtcclxuICBJbnB1dDoge1xyXG4gICAgYXV0b2ZvY3VzOiAnaW5wdXQuaXZ1LWlucHV0JyxcclxuICAgIHJlbmRlckRlZmF1bHQ6IGNyZWF0ZUVkaXRSZW5kZXIoKSxcclxuICAgIHJlbmRlckVkaXQ6IGNyZWF0ZUVkaXRSZW5kZXIoKSxcclxuICAgIHJlbmRlckZpbHRlcjogY3JlYXRlRmlsdGVyUmVuZGVyKCksXHJcbiAgICBmaWx0ZXJNZXRob2Q6IGRlZmF1bHRGaWx0ZXJNZXRob2QsXHJcbiAgICByZW5kZXJJdGVtOiBjcmVhdGVGb3JtSXRlbVJlbmRlcigpXHJcbiAgfSxcclxuICBBdXRvQ29tcGxldGU6IHtcclxuICAgIGF1dG9mb2N1czogJ2lucHV0Lml2dS1pbnB1dCcsXHJcbiAgICByZW5kZXJEZWZhdWx0OiBjcmVhdGVFZGl0UmVuZGVyKCksXHJcbiAgICByZW5kZXJFZGl0OiBjcmVhdGVFZGl0UmVuZGVyKCksXHJcbiAgICByZW5kZXJGaWx0ZXI6IGNyZWF0ZUZpbHRlclJlbmRlcigpLFxyXG4gICAgZmlsdGVyTWV0aG9kOiBkZWZhdWx0RmlsdGVyTWV0aG9kLFxyXG4gICAgcmVuZGVySXRlbTogY3JlYXRlRm9ybUl0ZW1SZW5kZXIoKVxyXG4gIH0sXHJcbiAgSW5wdXROdW1iZXI6IHtcclxuICAgIGF1dG9mb2N1czogJ2lucHV0Lml2dS1pbnB1dC1udW1iZXItaW5wdXQnLFxyXG4gICAgcmVuZGVyRGVmYXVsdDogY3JlYXRlRWRpdFJlbmRlcigpLFxyXG4gICAgcmVuZGVyRWRpdDogY3JlYXRlRWRpdFJlbmRlcigpLFxyXG4gICAgcmVuZGVyRmlsdGVyOiBjcmVhdGVGaWx0ZXJSZW5kZXIoKSxcclxuICAgIGZpbHRlck1ldGhvZDogZGVmYXVsdEZpbHRlck1ldGhvZCxcclxuICAgIHJlbmRlckl0ZW06IGNyZWF0ZUZvcm1JdGVtUmVuZGVyKClcclxuICB9LFxyXG4gIFNlbGVjdDoge1xyXG4gICAgcmVuZGVyRWRpdCAoaDogQ3JlYXRlRWxlbWVudCwgcmVuZGVyT3B0czogQ29sdW1uRWRpdFJlbmRlck9wdGlvbnMsIHBhcmFtczogQ29sdW1uRWRpdFJlbmRlclBhcmFtcykge1xyXG4gICAgICBjb25zdCB7IG9wdGlvbnMgPSBbXSwgb3B0aW9uR3JvdXBzLCBvcHRpb25Qcm9wcyA9IHt9LCBvcHRpb25Hcm91cFByb3BzID0ge30gfSA9IHJlbmRlck9wdHNcclxuICAgICAgY29uc3QgeyByb3csIGNvbHVtbiB9ID0gcGFyYW1zXHJcbiAgICAgIGNvbnN0IHsgYXR0cnMgfSA9IHJlbmRlck9wdHNcclxuICAgICAgY29uc3QgY2VsbFZhbHVlID0gWEVVdGlscy5nZXQocm93LCBjb2x1bW4ucHJvcGVydHkpXHJcbiAgICAgIGNvbnN0IHByb3BzID0gZ2V0Q2VsbEVkaXRGaWx0ZXJQcm9wcyhyZW5kZXJPcHRzLCBwYXJhbXMsIGNlbGxWYWx1ZSlcclxuICAgICAgY29uc3Qgb24gPSBnZXRFZGl0T25zKHJlbmRlck9wdHMsIHBhcmFtcylcclxuICAgICAgaWYgKG9wdGlvbkdyb3Vwcykge1xyXG4gICAgICAgIGNvbnN0IGdyb3VwT3B0aW9ucyA9IG9wdGlvbkdyb3VwUHJvcHMub3B0aW9ucyB8fCAnb3B0aW9ucydcclxuICAgICAgICBjb25zdCBncm91cExhYmVsID0gb3B0aW9uR3JvdXBQcm9wcy5sYWJlbCB8fCAnbGFiZWwnXHJcbiAgICAgICAgcmV0dXJuIFtcclxuICAgICAgICAgIGgoJ1NlbGVjdCcsIHtcclxuICAgICAgICAgICAgYXR0cnMsXHJcbiAgICAgICAgICAgIHByb3BzLFxyXG4gICAgICAgICAgICBvblxyXG4gICAgICAgICAgfSwgWEVVdGlscy5tYXAob3B0aW9uR3JvdXBzLCAoZ3JvdXAsIGdJbmRleCkgPT4ge1xyXG4gICAgICAgICAgICByZXR1cm4gaCgnT3B0aW9uR3JvdXAnLCB7XHJcbiAgICAgICAgICAgICAgcHJvcHM6IHtcclxuICAgICAgICAgICAgICAgIGxhYmVsOiBncm91cFtncm91cExhYmVsXVxyXG4gICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAga2V5OiBnSW5kZXhcclxuICAgICAgICAgICAgfSwgcmVuZGVyT3B0aW9ucyhoLCBncm91cFtncm91cE9wdGlvbnNdLCBvcHRpb25Qcm9wcykpXHJcbiAgICAgICAgICB9KSlcclxuICAgICAgICBdXHJcbiAgICAgIH1cclxuICAgICAgcmV0dXJuIFtcclxuICAgICAgICBoKCdTZWxlY3QnLCB7XHJcbiAgICAgICAgICBhdHRycyxcclxuICAgICAgICAgIHByb3BzLFxyXG4gICAgICAgICAgb25cclxuICAgICAgICB9LCByZW5kZXJPcHRpb25zKGgsIG9wdGlvbnMsIG9wdGlvblByb3BzKSlcclxuICAgICAgXVxyXG4gICAgfSxcclxuICAgIHJlbmRlckNlbGwgKGg6IENyZWF0ZUVsZW1lbnQsIHJlbmRlck9wdHM6IENvbHVtbkNlbGxSZW5kZXJPcHRpb25zLCBwYXJhbXM6IENvbHVtbkNlbGxSZW5kZXJQYXJhbXMpIHtcclxuICAgICAgcmV0dXJuIGNlbGxUZXh0KGgsIGdldFNlbGVjdENlbGxWYWx1ZShyZW5kZXJPcHRzLCBwYXJhbXMpKVxyXG4gICAgfSxcclxuICAgIHJlbmRlckZpbHRlciAoaDogQ3JlYXRlRWxlbWVudCwgcmVuZGVyT3B0czogQ29sdW1uRmlsdGVyUmVuZGVyT3B0aW9ucywgcGFyYW1zOiBDb2x1bW5GaWx0ZXJSZW5kZXJQYXJhbXMpIHtcclxuICAgICAgY29uc3QgeyBvcHRpb25zID0gW10sIG9wdGlvbkdyb3Vwcywgb3B0aW9uUHJvcHMgPSB7fSwgb3B0aW9uR3JvdXBQcm9wcyA9IHt9IH0gPSByZW5kZXJPcHRzXHJcbiAgICAgIGNvbnN0IGdyb3VwT3B0aW9ucyA9IG9wdGlvbkdyb3VwUHJvcHMub3B0aW9ucyB8fCAnb3B0aW9ucydcclxuICAgICAgY29uc3QgZ3JvdXBMYWJlbCA9IG9wdGlvbkdyb3VwUHJvcHMubGFiZWwgfHwgJ2xhYmVsJ1xyXG4gICAgICBjb25zdCB7IGNvbHVtbiB9ID0gcGFyYW1zXHJcbiAgICAgIGNvbnN0IHsgYXR0cnMgfSA9IHJlbmRlck9wdHNcclxuICAgICAgcmV0dXJuIFtcclxuICAgICAgICBoKCdkaXYnLCB7XHJcbiAgICAgICAgICBjbGFzczogJ3Z4ZS10YWJsZS0tZmlsdGVyLWl2aWV3LXdyYXBwZXInXHJcbiAgICAgICAgfSwgb3B0aW9uR3JvdXBzXHJcbiAgICAgICAgICA/IGNvbHVtbi5maWx0ZXJzLm1hcCgob3B0aW9uLCBvSW5kZXgpID0+IHtcclxuICAgICAgICAgICAgY29uc3Qgb3B0aW9uVmFsdWUgPSBvcHRpb24uZGF0YVxyXG4gICAgICAgICAgICByZXR1cm4gaCgnU2VsZWN0Jywge1xyXG4gICAgICAgICAgICAgIGtleTogb0luZGV4LFxyXG4gICAgICAgICAgICAgIGF0dHJzLFxyXG4gICAgICAgICAgICAgIHByb3BzOiBnZXRDZWxsRWRpdEZpbHRlclByb3BzKHJlbmRlck9wdHMsIHBhcmFtcywgb3B0aW9uVmFsdWUpLFxyXG4gICAgICAgICAgICAgIG9uOiBnZXRGaWx0ZXJPbnMocmVuZGVyT3B0cywgcGFyYW1zLCBvcHRpb24sICgpID0+IHtcclxuICAgICAgICAgICAgICAvLyDlpITnkIYgY2hhbmdlIOS6i+S7tuebuOWFs+mAu+i+kVxyXG4gICAgICAgICAgICAgICAgaGFuZGxlQ29uZmlybUZpbHRlcihwYXJhbXMsIG9wdGlvbi5kYXRhICYmIG9wdGlvbi5kYXRhLmxlbmd0aCA+IDAsIG9wdGlvbilcclxuICAgICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICB9LCBYRVV0aWxzLm1hcChvcHRpb25Hcm91cHMsIChncm91cCwgZ0luZGV4KSA9PiB7XHJcbiAgICAgICAgICAgICAgcmV0dXJuIGgoJ09wdGlvbkdyb3VwJywge1xyXG4gICAgICAgICAgICAgICAga2V5OiBnSW5kZXgsXHJcbiAgICAgICAgICAgICAgICBwcm9wczoge1xyXG4gICAgICAgICAgICAgICAgICBsYWJlbDogZ3JvdXBbZ3JvdXBMYWJlbF1cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICB9LCByZW5kZXJPcHRpb25zKGgsIGdyb3VwW2dyb3VwT3B0aW9uc10sIG9wdGlvblByb3BzKSlcclxuICAgICAgICAgICAgfSkpXHJcbiAgICAgICAgICB9KVxyXG4gICAgICAgICAgOiBjb2x1bW4uZmlsdGVycy5tYXAoKG9wdGlvbiwgb0luZGV4KSA9PiB7XHJcbiAgICAgICAgICAgIGNvbnN0IG9wdGlvblZhbHVlID0gb3B0aW9uLmRhdGFcclxuICAgICAgICAgICAgcmV0dXJuIGgoJ1NlbGVjdCcsIHtcclxuICAgICAgICAgICAgICBrZXk6IG9JbmRleCxcclxuICAgICAgICAgICAgICBhdHRycyxcclxuICAgICAgICAgICAgICBwcm9wczogZ2V0Q2VsbEVkaXRGaWx0ZXJQcm9wcyhyZW5kZXJPcHRzLCBwYXJhbXMsIG9wdGlvblZhbHVlKSxcclxuICAgICAgICAgICAgICBvbjogZ2V0RmlsdGVyT25zKHJlbmRlck9wdHMsIHBhcmFtcywgb3B0aW9uLCAoKSA9PiB7XHJcbiAgICAgICAgICAgICAgLy8g5aSE55CGIGNoYW5nZSDkuovku7bnm7jlhbPpgLvovpFcclxuICAgICAgICAgICAgICAgIGhhbmRsZUNvbmZpcm1GaWx0ZXIocGFyYW1zLCBvcHRpb24uZGF0YSAmJiBvcHRpb24uZGF0YS5sZW5ndGggPiAwLCBvcHRpb24pXHJcbiAgICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgfSwgcmVuZGVyT3B0aW9ucyhoLCBvcHRpb25zLCBvcHRpb25Qcm9wcykpXHJcbiAgICAgICAgICB9KVxyXG4gICAgICAgIClcclxuICAgICAgXVxyXG4gICAgfSxcclxuICAgIGZpbHRlck1ldGhvZCAocGFyYW1zOiBDb2x1bW5GaWx0ZXJNZXRob2RQYXJhbXMpIHtcclxuICAgICAgY29uc3QgeyBvcHRpb24sIHJvdywgY29sdW1uIH0gPSBwYXJhbXNcclxuICAgICAgY29uc3QgeyBkYXRhIH0gPSBvcHRpb25cclxuICAgICAgY29uc3QgeyBwcm9wZXJ0eSwgZmlsdGVyUmVuZGVyOiByZW5kZXJPcHRzIH0gPSBjb2x1bW5cclxuICAgICAgY29uc3QgeyBwcm9wcyA9IHt9IH0gPSByZW5kZXJPcHRzXHJcbiAgICAgIGNvbnN0IGNlbGxWYWx1ZSA9IFhFVXRpbHMuZ2V0KHJvdywgcHJvcGVydHkpXHJcbiAgICAgIGlmIChwcm9wcy5tdWx0aXBsZSkge1xyXG4gICAgICAgIGlmIChYRVV0aWxzLmlzQXJyYXkoY2VsbFZhbHVlKSkge1xyXG4gICAgICAgICAgcmV0dXJuIFhFVXRpbHMuaW5jbHVkZUFycmF5cyhjZWxsVmFsdWUsIGRhdGEpXHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBkYXRhLmluZGV4T2YoY2VsbFZhbHVlKSA+IC0xXHJcbiAgICAgIH1cclxuICAgICAgLyogZXNsaW50LWRpc2FibGUgZXFlcWVxICovXHJcbiAgICAgIHJldHVybiBjZWxsVmFsdWUgPT0gZGF0YVxyXG4gICAgfSxcclxuICAgIHJlbmRlckl0ZW0gKGg6IENyZWF0ZUVsZW1lbnQsIHJlbmRlck9wdHM6IEZvcm1JdGVtUmVuZGVyT3B0aW9ucywgcGFyYW1zOiBGb3JtSXRlbVJlbmRlclBhcmFtcykge1xyXG4gICAgICBjb25zdCB7IG9wdGlvbnMgPSBbXSwgb3B0aW9uR3JvdXBzLCBvcHRpb25Qcm9wcyA9IHt9LCBvcHRpb25Hcm91cFByb3BzID0ge30gfSA9IHJlbmRlck9wdHNcclxuICAgICAgY29uc3QgeyBkYXRhLCBwcm9wZXJ0eSB9ID0gcGFyYW1zXHJcbiAgICAgIGNvbnN0IHsgYXR0cnMgfSA9IHJlbmRlck9wdHNcclxuICAgICAgY29uc3QgaXRlbVZhbHVlID0gWEVVdGlscy5nZXQoZGF0YSwgcHJvcGVydHkpXHJcbiAgICAgIGNvbnN0IHByb3BzID0gZ2V0SXRlbVByb3BzKHJlbmRlck9wdHMsIHBhcmFtcywgaXRlbVZhbHVlKVxyXG4gICAgICBjb25zdCBvbiA9IGdldEl0ZW1PbnMocmVuZGVyT3B0cywgcGFyYW1zKVxyXG4gICAgICBpZiAob3B0aW9uR3JvdXBzKSB7XHJcbiAgICAgICAgY29uc3QgZ3JvdXBPcHRpb25zID0gb3B0aW9uR3JvdXBQcm9wcy5vcHRpb25zIHx8ICdvcHRpb25zJ1xyXG4gICAgICAgIGNvbnN0IGdyb3VwTGFiZWwgPSBvcHRpb25Hcm91cFByb3BzLmxhYmVsIHx8ICdsYWJlbCdcclxuICAgICAgICByZXR1cm4gW1xyXG4gICAgICAgICAgaCgnU2VsZWN0Jywge1xyXG4gICAgICAgICAgICBwcm9wcyxcclxuICAgICAgICAgICAgYXR0cnMsXHJcbiAgICAgICAgICAgIG9uXHJcbiAgICAgICAgICB9LCBYRVV0aWxzLm1hcChvcHRpb25Hcm91cHMsIChncm91cCwgZ0luZGV4KSA9PiB7XHJcbiAgICAgICAgICAgIHJldHVybiBoKCdPcHRpb25Hcm91cCcsIHtcclxuICAgICAgICAgICAgICBrZXk6IGdJbmRleCxcclxuICAgICAgICAgICAgICBwcm9wczoge1xyXG4gICAgICAgICAgICAgICAgbGFiZWw6IGdyb3VwW2dyb3VwTGFiZWxdXHJcbiAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9LCByZW5kZXJPcHRpb25zKGgsIGdyb3VwW2dyb3VwT3B0aW9uc10sIG9wdGlvblByb3BzKSlcclxuICAgICAgICAgIH0pKVxyXG4gICAgICAgIF1cclxuICAgICAgfVxyXG4gICAgICByZXR1cm4gW1xyXG4gICAgICAgIGgoJ1NlbGVjdCcsIHtcclxuICAgICAgICAgIHByb3BzLFxyXG4gICAgICAgICAgYXR0cnMsXHJcbiAgICAgICAgICBvblxyXG4gICAgICAgIH0sIHJlbmRlck9wdGlvbnMoaCwgb3B0aW9ucywgb3B0aW9uUHJvcHMpKVxyXG4gICAgICBdXHJcbiAgICB9LFxyXG4gICAgY2VsbEV4cG9ydE1ldGhvZDogY3JlYXRlRXhwb3J0TWV0aG9kKGdldFNlbGVjdENlbGxWYWx1ZSksXHJcbiAgICBlZGl0Q2VsbEV4cG9ydE1ldGhvZDogY3JlYXRlRXhwb3J0TWV0aG9kKGdldFNlbGVjdENlbGxWYWx1ZSwgdHJ1ZSlcclxuICB9LFxyXG4gIENhc2NhZGVyOiB7XHJcbiAgICByZW5kZXJFZGl0OiBjcmVhdGVFZGl0UmVuZGVyKHsgdHJhbnNmZXI6IHRydWUgfSksXHJcbiAgICByZW5kZXJDZWxsIChoOiBDcmVhdGVFbGVtZW50LCByZW5kZXJPcHRzOiBDb2x1bW5DZWxsUmVuZGVyT3B0aW9ucywgcGFyYW1zOiBDb2x1bW5FZGl0UmVuZGVyUGFyYW1zKSB7XHJcbiAgICAgIHJldHVybiBjZWxsVGV4dChoLCBnZXRDYXNjYWRlckNlbGxWYWx1ZShyZW5kZXJPcHRzLCBwYXJhbXMpKVxyXG4gICAgfSxcclxuICAgIHJlbmRlckl0ZW06IGNyZWF0ZUZvcm1JdGVtUmVuZGVyKCksXHJcbiAgICBjZWxsRXhwb3J0TWV0aG9kOiBjcmVhdGVFeHBvcnRNZXRob2QoZ2V0Q2FzY2FkZXJDZWxsVmFsdWUpLFxyXG4gICAgZWRpdENlbGxFeHBvcnRNZXRob2Q6IGNyZWF0ZUV4cG9ydE1ldGhvZChnZXRDYXNjYWRlckNlbGxWYWx1ZSwgdHJ1ZSlcclxuICB9LFxyXG4gIERhdGVQaWNrZXI6IHtcclxuICAgIHJlbmRlckVkaXQ6IGNyZWF0ZUVkaXRSZW5kZXIoeyB0cmFuc2ZlcjogdHJ1ZSB9KSxcclxuICAgIHJlbmRlckNlbGwgKGg6IENyZWF0ZUVsZW1lbnQsIHJlbmRlck9wdHM6IENvbHVtbkNlbGxSZW5kZXJPcHRpb25zLCBwYXJhbXM6IENvbHVtbkVkaXRSZW5kZXJQYXJhbXMpIHtcclxuICAgICAgcmV0dXJuIGNlbGxUZXh0KGgsIGdldERhdGVQaWNrZXJDZWxsVmFsdWUocmVuZGVyT3B0cywgcGFyYW1zKSlcclxuICAgIH0sXHJcbiAgICByZW5kZXJGaWx0ZXIgKGg6IENyZWF0ZUVsZW1lbnQsIHJlbmRlck9wdHM6IENvbHVtbkZpbHRlclJlbmRlck9wdGlvbnMsIHBhcmFtczogQ29sdW1uRmlsdGVyUmVuZGVyUGFyYW1zKSB7XHJcbiAgICAgIGNvbnN0IHsgY29sdW1uIH0gPSBwYXJhbXNcclxuICAgICAgY29uc3QgeyBhdHRycyB9ID0gcmVuZGVyT3B0c1xyXG4gICAgICByZXR1cm4gW1xyXG4gICAgICAgIGgoJ2RpdicsIHtcclxuICAgICAgICAgIGNsYXNzOiAndnhlLXRhYmxlLS1maWx0ZXItaXZpZXctd3JhcHBlcidcclxuICAgICAgICB9LCBjb2x1bW4uZmlsdGVycy5tYXAoKG9wdGlvbiwgb0luZGV4KSA9PiB7XHJcbiAgICAgICAgICBjb25zdCBvcHRpb25WYWx1ZSA9IG9wdGlvbi5kYXRhXHJcbiAgICAgICAgICByZXR1cm4gaChyZW5kZXJPcHRzLm5hbWUsIHtcclxuICAgICAgICAgICAga2V5OiBvSW5kZXgsXHJcbiAgICAgICAgICAgIGF0dHJzLFxyXG4gICAgICAgICAgICBwcm9wczogZ2V0Q2VsbEVkaXRGaWx0ZXJQcm9wcyhyZW5kZXJPcHRzLCBwYXJhbXMsIG9wdGlvblZhbHVlKSxcclxuICAgICAgICAgICAgb246IGdldEZpbHRlck9ucyhyZW5kZXJPcHRzLCBwYXJhbXMsIG9wdGlvbiwgKCkgPT4ge1xyXG4gICAgICAgICAgICAgIC8vIOWkhOeQhiBjaGFuZ2Ug5LqL5Lu255u45YWz6YC76L6RXHJcbiAgICAgICAgICAgICAgaGFuZGxlQ29uZmlybUZpbHRlcihwYXJhbXMsICEhb3B0aW9uLmRhdGEsIG9wdGlvbilcclxuICAgICAgICAgICAgfSlcclxuICAgICAgICAgIH0pXHJcbiAgICAgICAgfSkpXHJcbiAgICAgIF1cclxuICAgIH0sXHJcbiAgICBmaWx0ZXJNZXRob2QgKHBhcmFtczogQ29sdW1uRmlsdGVyTWV0aG9kUGFyYW1zKSB7XHJcbiAgICAgIGNvbnN0IHsgb3B0aW9uLCByb3csIGNvbHVtbiB9ID0gcGFyYW1zXHJcbiAgICAgIGNvbnN0IHsgZGF0YSB9ID0gb3B0aW9uXHJcbiAgICAgIGNvbnN0IHsgZmlsdGVyUmVuZGVyOiByZW5kZXJPcHRzIH0gPSBjb2x1bW5cclxuICAgICAgY29uc3QgeyBwcm9wcyA9IHt9IH0gPSByZW5kZXJPcHRzXHJcbiAgICAgIGNvbnN0IGNlbGxWYWx1ZSA9IFhFVXRpbHMuZ2V0KHJvdywgY29sdW1uLnByb3BlcnR5KVxyXG4gICAgICBpZiAoZGF0YSkge1xyXG4gICAgICAgIHN3aXRjaCAocHJvcHMudHlwZSkge1xyXG4gICAgICAgICAgY2FzZSAnZGF0ZXJhbmdlJzpcclxuICAgICAgICAgICAgcmV0dXJuIGVxdWFsRGF0ZXJhbmdlKGNlbGxWYWx1ZSwgZGF0YSwgcHJvcHMsICd5eXl5LU1NLWRkJylcclxuICAgICAgICAgIGNhc2UgJ2RhdGV0aW1lcmFuZ2UnOlxyXG4gICAgICAgICAgICByZXR1cm4gZXF1YWxEYXRlcmFuZ2UoY2VsbFZhbHVlLCBkYXRhLCBwcm9wcywgJ3l5eXktTU0tZGQgSEg6c3M6bW0nKVxyXG4gICAgICAgICAgZGVmYXVsdDpcclxuICAgICAgICAgICAgcmV0dXJuIGNlbGxWYWx1ZSA9PT0gZGF0YVxyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgICByZXR1cm4gZmFsc2VcclxuICAgIH0sXHJcbiAgICByZW5kZXJJdGVtOiBjcmVhdGVGb3JtSXRlbVJlbmRlcigpLFxyXG4gICAgY2VsbEV4cG9ydE1ldGhvZDogY3JlYXRlRXhwb3J0TWV0aG9kKGdldERhdGVQaWNrZXJDZWxsVmFsdWUpLFxyXG4gICAgZWRpdENlbGxFeHBvcnRNZXRob2Q6IGNyZWF0ZUV4cG9ydE1ldGhvZChnZXREYXRlUGlja2VyQ2VsbFZhbHVlLCB0cnVlKVxyXG4gIH0sXHJcbiAgVGltZVBpY2tlcjoge1xyXG4gICAgcmVuZGVyRWRpdDogY3JlYXRlRWRpdFJlbmRlcih7IHRyYW5zZmVyOiB0cnVlIH0pLFxyXG4gICAgcmVuZGVySXRlbTogY3JlYXRlRm9ybUl0ZW1SZW5kZXIoKVxyXG4gIH0sXHJcbiAgUmF0ZToge1xyXG4gICAgcmVuZGVyRGVmYXVsdDogY3JlYXRlRWRpdFJlbmRlcigpLFxyXG4gICAgcmVuZGVyRWRpdDogY3JlYXRlRWRpdFJlbmRlcigpLFxyXG4gICAgcmVuZGVyRmlsdGVyOiBjcmVhdGVGaWx0ZXJSZW5kZXIoKSxcclxuICAgIGZpbHRlck1ldGhvZDogZGVmYXVsdEZpbHRlck1ldGhvZCxcclxuICAgIHJlbmRlckl0ZW06IGNyZWF0ZUZvcm1JdGVtUmVuZGVyKClcclxuICB9LFxyXG4gIGlTd2l0Y2g6IHtcclxuICAgIHJlbmRlckRlZmF1bHQ6IGNyZWF0ZUVkaXRSZW5kZXIoKSxcclxuICAgIHJlbmRlckVkaXQ6IGNyZWF0ZUVkaXRSZW5kZXIoKSxcclxuICAgIHJlbmRlckZpbHRlciAoaDogQ3JlYXRlRWxlbWVudCwgcmVuZGVyT3B0czogQ29sdW1uRmlsdGVyUmVuZGVyT3B0aW9ucywgcGFyYW1zOiBDb2x1bW5GaWx0ZXJSZW5kZXJQYXJhbXMpIHtcclxuICAgICAgY29uc3QgeyBjb2x1bW4gfSA9IHBhcmFtc1xyXG4gICAgICBjb25zdCB7IG5hbWUsIGF0dHJzIH0gPSByZW5kZXJPcHRzXHJcbiAgICAgIHJldHVybiBbXHJcbiAgICAgICAgaCgnZGl2Jywge1xyXG4gICAgICAgICAgY2xhc3M6ICd2eGUtdGFibGUtLWZpbHRlci1pdmlldy13cmFwcGVyJ1xyXG4gICAgICAgIH0sIGNvbHVtbi5maWx0ZXJzLm1hcCgob3B0aW9uLCBvSW5kZXgpID0+IHtcclxuICAgICAgICAgIGNvbnN0IG9wdGlvblZhbHVlID0gb3B0aW9uLmRhdGFcclxuICAgICAgICAgIHJldHVybiBoKG5hbWUsIHtcclxuICAgICAgICAgICAga2V5OiBvSW5kZXgsXHJcbiAgICAgICAgICAgIGF0dHJzLFxyXG4gICAgICAgICAgICBwcm9wczogZ2V0Q2VsbEVkaXRGaWx0ZXJQcm9wcyhyZW5kZXJPcHRzLCBwYXJhbXMsIG9wdGlvblZhbHVlKSxcclxuICAgICAgICAgICAgb246IGdldEZpbHRlck9ucyhyZW5kZXJPcHRzLCBwYXJhbXMsIG9wdGlvbiwgKCkgPT4ge1xyXG4gICAgICAgICAgICAgIC8vIOWkhOeQhiBjaGFuZ2Ug5LqL5Lu255u45YWz6YC76L6RXHJcbiAgICAgICAgICAgICAgaGFuZGxlQ29uZmlybUZpbHRlcihwYXJhbXMsIFhFVXRpbHMuaXNCb29sZWFuKG9wdGlvbi5kYXRhKSwgb3B0aW9uKVxyXG4gICAgICAgICAgICB9KVxyXG4gICAgICAgICAgfSlcclxuICAgICAgICB9KSlcclxuICAgICAgXVxyXG4gICAgfSxcclxuICAgIGZpbHRlck1ldGhvZDogZGVmYXVsdEZpbHRlck1ldGhvZCxcclxuICAgIHJlbmRlckl0ZW06IGNyZWF0ZUZvcm1JdGVtUmVuZGVyKClcclxuICB9LFxyXG4gIFJhZGlvOiB7XHJcbiAgICByZW5kZXJJdGVtOiBjcmVhdGVGb3JtSXRlbVJhZGlvQW5kQ2hlY2tib3hSZW5kZXIoKVxyXG4gIH0sXHJcbiAgQ2hlY2tib3g6IHtcclxuICAgIHJlbmRlckl0ZW06IGNyZWF0ZUZvcm1JdGVtUmFkaW9BbmRDaGVja2JveFJlbmRlcigpXHJcbiAgfSxcclxuICBCdXR0b246IHtcclxuICAgIHJlbmRlckVkaXQ6IGRlZmF1bHRCdXR0b25FZGl0UmVuZGVyLFxyXG4gICAgcmVuZGVyRGVmYXVsdDogZGVmYXVsdEJ1dHRvbkVkaXRSZW5kZXIsXHJcbiAgICByZW5kZXJJdGVtOiBkZWZhdWx0QnV0dG9uSXRlbVJlbmRlclxyXG4gIH0sXHJcbiAgQnV0dG9uczoge1xyXG4gICAgcmVuZGVyRWRpdDogZGVmYXVsdEJ1dHRvbnNFZGl0UmVuZGVyLFxyXG4gICAgcmVuZGVyRGVmYXVsdDogZGVmYXVsdEJ1dHRvbnNFZGl0UmVuZGVyLFxyXG4gICAgcmVuZGVySXRlbTogZGVmYXVsdEJ1dHRvbnNJdGVtUmVuZGVyXHJcbiAgfVxyXG59XHJcblxyXG4vKipcclxuICog5qOA5p+l6Kem5Y+R5rqQ5piv5ZCm5bGe5LqO55uu5qCH6IqC54K5XHJcbiAqL1xyXG5mdW5jdGlvbiBnZXRFdmVudFRhcmdldE5vZGUgKGV2bnQ6IGFueSwgY29udGFpbmVyOiBIVE1MRWxlbWVudCwgY2xhc3NOYW1lOiBzdHJpbmcpIHtcclxuICBsZXQgdGFyZ2V0RWxlbVxyXG4gIGxldCB0YXJnZXQgPSBldm50LnRhcmdldFxyXG4gIHdoaWxlICh0YXJnZXQgJiYgdGFyZ2V0Lm5vZGVUeXBlICYmIHRhcmdldCAhPT0gZG9jdW1lbnQpIHtcclxuICAgIGlmIChjbGFzc05hbWUgJiYgdGFyZ2V0LmNsYXNzTmFtZSAmJiB0YXJnZXQuY2xhc3NOYW1lLnNwbGl0ICYmIHRhcmdldC5jbGFzc05hbWUuc3BsaXQoJyAnKS5pbmRleE9mKGNsYXNzTmFtZSkgPiAtMSkge1xyXG4gICAgICB0YXJnZXRFbGVtID0gdGFyZ2V0XHJcbiAgICB9IGVsc2UgaWYgKHRhcmdldCA9PT0gY29udGFpbmVyKSB7XHJcbiAgICAgIHJldHVybiB7IGZsYWc6IGNsYXNzTmFtZSA/ICEhdGFyZ2V0RWxlbSA6IHRydWUsIGNvbnRhaW5lciwgdGFyZ2V0RWxlbTogdGFyZ2V0RWxlbSB9XHJcbiAgICB9XHJcbiAgICB0YXJnZXQgPSB0YXJnZXQucGFyZW50Tm9kZVxyXG4gIH1cclxuICByZXR1cm4geyBmbGFnOiBmYWxzZSB9XHJcbn1cclxuXHJcbi8qKlxyXG4gKiDkuovku7blhbzlrrnmgKflpITnkIZcclxuICovXHJcbmZ1bmN0aW9uIGhhbmRsZUNsZWFyRXZlbnQgKHBhcmFtczogYW55LCBlOiBhbnkpIHtcclxuICBjb25zdCBib2R5RWxlbTogSFRNTEVsZW1lbnQgPSBkb2N1bWVudC5ib2R5XHJcbiAgY29uc3QgZXZudCA9IHBhcmFtcy4kZXZlbnQgfHwgZVxyXG4gIGlmIChcclxuICAgIC8vIOS4i+aLieahhuOAgeaXpeacn1xyXG4gICAgZ2V0RXZlbnRUYXJnZXROb2RlKGV2bnQsIGJvZHlFbGVtLCAnaXZ1LXNlbGVjdC1kcm9wZG93bicpLmZsYWdcclxuICApIHtcclxuICAgIHJldHVybiBmYWxzZVxyXG4gIH1cclxufVxyXG5cclxuLyoqXHJcbiAqIOWfuuS6jiB2eGUtdGFibGUg6KGo5qC855qE6YCC6YWN5o+S5Lu277yM55So5LqO5YW85a65IGl2aWV3IOe7hOS7tuW6k1xyXG4gKi9cclxuZXhwb3J0IGNvbnN0IFZYRVRhYmxlUGx1Z2luSVZpZXcgPSB7XHJcbiAgaW5zdGFsbCAoeyBpbnRlcmNlcHRvciwgcmVuZGVyZXIgfTogdHlwZW9mIFZYRVRhYmxlKSB7XHJcbiAgICByZW5kZXJlci5taXhpbihyZW5kZXJNYXApXHJcbiAgICBpbnRlcmNlcHRvci5hZGQoJ2V2ZW50LmNsZWFyRmlsdGVyJywgaGFuZGxlQ2xlYXJFdmVudClcclxuICAgIGludGVyY2VwdG9yLmFkZCgnZXZlbnQuY2xlYXJBY3RpdmVkJywgaGFuZGxlQ2xlYXJFdmVudClcclxuICB9XHJcbn1cclxuXHJcbmlmICh0eXBlb2Ygd2luZG93ICE9PSAndW5kZWZpbmVkJyAmJiB3aW5kb3cuVlhFVGFibGUpIHtcclxuICB3aW5kb3cuVlhFVGFibGUudXNlKFZYRVRhYmxlUGx1Z2luSVZpZXcpXHJcbn1cclxuXHJcbmV4cG9ydCBkZWZhdWx0IFZYRVRhYmxlUGx1Z2luSVZpZXdcclxuIl19
