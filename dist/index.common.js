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
    if (className && target.className && target.className.split(' ').indexOf(className) > -1) {
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
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImluZGV4LnRzIl0sIm5hbWVzIjpbImlzRW1wdHlWYWx1ZSIsImNlbGxWYWx1ZSIsInVuZGVmaW5lZCIsImdldE1vZGVsUHJvcCIsInJlbmRlck9wdHMiLCJnZXRNb2RlbEV2ZW50IiwiZ2V0Q2hhbmdlRXZlbnQiLCJnZXRGb3JtYXREYXRlIiwidmFsdWUiLCJwcm9wcyIsImRlZmF1bHRGb3JtYXQiLCJYRVV0aWxzIiwidG9EYXRlU3RyaW5nIiwiZm9ybWF0IiwiZ2V0Rm9ybWF0RGF0ZXMiLCJ2YWx1ZXMiLCJzZXBhcmF0b3IiLCJtYXAiLCJkYXRlIiwiam9pbiIsImVxdWFsRGF0ZXJhbmdlIiwiZGF0YSIsImdldENlbGxFZGl0RmlsdGVyUHJvcHMiLCJwYXJhbXMiLCJkZWZhdWx0UHJvcHMiLCJ2U2l6ZSIsIiR0YWJsZSIsImFzc2lnbiIsInNpemUiLCJnZXRJdGVtUHJvcHMiLCIkZm9ybSIsImdldE9ucyIsImlucHV0RnVuYyIsImNoYW5nZUZ1bmMiLCJldmVudHMiLCJtb2RlbEV2ZW50IiwiY2hhbmdlRXZlbnQiLCJpc1NhbWVFdmVudCIsIm9ucyIsIm9iamVjdEVhY2giLCJmdW5jIiwia2V5IiwiYXJncyIsImdldEVkaXRPbnMiLCJyb3ciLCJjb2x1bW4iLCJzZXQiLCJwcm9wZXJ0eSIsInVwZGF0ZVN0YXR1cyIsImdldEZpbHRlck9ucyIsIm9wdGlvbiIsImdldEl0ZW1PbnMiLCJtYXRjaENhc2NhZGVyRGF0YSIsImluZGV4IiwibGlzdCIsImxhYmVscyIsInZhbCIsImxlbmd0aCIsImVhY2giLCJpdGVtIiwicHVzaCIsImxhYmVsIiwiY2hpbGRyZW4iLCJnZXRTZWxlY3RDZWxsVmFsdWUiLCJvcHRpb25zIiwib3B0aW9uR3JvdXBzIiwib3B0aW9uUHJvcHMiLCJvcHRpb25Hcm91cFByb3BzIiwibGFiZWxQcm9wIiwidmFsdWVQcm9wIiwiZ3JvdXBPcHRpb25zIiwiZ2V0IiwiY29saWQiLCJpZCIsInJlc3QiLCJjZWxsRGF0YSIsImZpbHRlcmFibGUiLCJmdWxsQWxsRGF0YVJvd01hcCIsImNhY2hlQ2VsbCIsImhhcyIsIm11bHRpcGxlIiwic2VsZWN0SXRlbSIsImZpbmQiLCJjZWxsTGFiZWwiLCJnZXRDYXNjYWRlckNlbGxWYWx1ZSIsImdldERhdGVQaWNrZXJDZWxsVmFsdWUiLCJ0eXBlIiwiY3JlYXRlRWRpdFJlbmRlciIsImgiLCJhdHRycyIsIm5hbWUiLCJvbiIsImRlZmF1bHRCdXR0b25FZGl0UmVuZGVyIiwiY2VsbFRleHQiLCJjb250ZW50IiwiZGVmYXVsdEJ1dHRvbnNFZGl0UmVuZGVyIiwiY2hpbGRSZW5kZXJPcHRzIiwiY3JlYXRlRmlsdGVyUmVuZGVyIiwiZmlsdGVycyIsIm9JbmRleCIsIm9wdGlvblZhbHVlIiwiaGFuZGxlQ29uZmlybUZpbHRlciIsImNoZWNrZWQiLCIkcGFuZWwiLCJjaGFuZ2VPcHRpb24iLCJkZWZhdWx0RmlsdGVyTWV0aG9kIiwicmVuZGVyT3B0aW9ucyIsImRpc2FibGVkUHJvcCIsImRpc2FibGVkIiwiY3JlYXRlRm9ybUl0ZW1SZW5kZXIiLCJpdGVtVmFsdWUiLCJkZWZhdWx0QnV0dG9uSXRlbVJlbmRlciIsImRlZmF1bHRCdXR0b25zSXRlbVJlbmRlciIsImNyZWF0ZUV4cG9ydE1ldGhvZCIsInZhbHVlTWV0aG9kIiwiaXNFZGl0IiwicmVuZGVyUHJvcGVydHkiLCJjcmVhdGVGb3JtSXRlbVJhZGlvQW5kQ2hlY2tib3hSZW5kZXIiLCJyZW5kZXJNYXAiLCJJbnB1dCIsImF1dG9mb2N1cyIsInJlbmRlckRlZmF1bHQiLCJyZW5kZXJFZGl0IiwicmVuZGVyRmlsdGVyIiwiZmlsdGVyTWV0aG9kIiwicmVuZGVySXRlbSIsIkF1dG9Db21wbGV0ZSIsIklucHV0TnVtYmVyIiwiU2VsZWN0IiwiZ3JvdXBMYWJlbCIsImdyb3VwIiwiZ0luZGV4IiwicmVuZGVyQ2VsbCIsImZpbHRlclJlbmRlciIsImlzQXJyYXkiLCJpbmNsdWRlQXJyYXlzIiwiaW5kZXhPZiIsImNlbGxFeHBvcnRNZXRob2QiLCJlZGl0Q2VsbEV4cG9ydE1ldGhvZCIsIkNhc2NhZGVyIiwidHJhbnNmZXIiLCJEYXRlUGlja2VyIiwiVGltZVBpY2tlciIsIlJhdGUiLCJpU3dpdGNoIiwiaXNCb29sZWFuIiwiUmFkaW8iLCJDaGVja2JveCIsIkJ1dHRvbiIsIkJ1dHRvbnMiLCJnZXRFdmVudFRhcmdldE5vZGUiLCJldm50IiwiY29udGFpbmVyIiwiY2xhc3NOYW1lIiwidGFyZ2V0RWxlbSIsInRhcmdldCIsIm5vZGVUeXBlIiwiZG9jdW1lbnQiLCJzcGxpdCIsImZsYWciLCJwYXJlbnROb2RlIiwiaGFuZGxlQ2xlYXJFdmVudCIsImJvZHlFbGVtIiwiYm9keSIsIlZYRVRhYmxlUGx1Z2luSVZpZXciLCJpbnN0YWxsIiwiaW50ZXJjZXB0b3IiLCJyZW5kZXJlciIsIm1peGluIiwiYWRkIiwid2luZG93IiwiVlhFVGFibGUiLCJ1c2UiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7QUFDQTs7Ozs7O0FBR0EsU0FBU0EsWUFBVCxDQUF1QkMsU0FBdkIsRUFBcUM7QUFDbkMsU0FBT0EsU0FBUyxLQUFLLElBQWQsSUFBc0JBLFNBQVMsS0FBS0MsU0FBcEMsSUFBaURELFNBQVMsS0FBSyxFQUF0RTtBQUNEOztBQUVELFNBQVNFLFlBQVQsQ0FBdUJDLFVBQXZCLEVBQWdEO0FBQzlDLFNBQU8sT0FBUDtBQUNEOztBQUVELFNBQVNDLGFBQVQsQ0FBd0JELFVBQXhCLEVBQWlEO0FBQy9DLFNBQU8sT0FBUDtBQUNEOztBQUVELFNBQVNFLGNBQVQsQ0FBeUJGLFVBQXpCLEVBQWtEO0FBQ2hELFNBQU8sV0FBUDtBQUNEOztBQUVELFNBQVNHLGFBQVQsQ0FBd0JDLEtBQXhCLEVBQW9DQyxLQUFwQyxFQUFnREMsYUFBaEQsRUFBcUU7QUFDbkUsU0FBT0Msb0JBQVFDLFlBQVIsQ0FBcUJKLEtBQXJCLEVBQTRCQyxLQUFLLENBQUNJLE1BQU4sSUFBZ0JILGFBQTVDLENBQVA7QUFDRDs7QUFFRCxTQUFTSSxjQUFULENBQXlCQyxNQUF6QixFQUFzQ04sS0FBdEMsRUFBa0RPLFNBQWxE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LENBQWdCLG1CQUFoQixFQUFxQ1IsZ0JBQXJDO0FBQ0FLLElBQUFBLFdBQVcsQ0FBQ0csR0FBWixDQUFnQixvQkFBaEIsRUFBc0NSLGdCQUF0QztBQUNEO0FBTGdDLENBQTVCOzs7QUFRUCxJQUFJLE9BQU9TLE1BQVAsS0FBa0IsV0FBbEIsSUFBaUNBLE1BQU0sQ0FBQ0MsUUFBNUMsRUFBc0Q7QUFDcERELEVBQUFBLE1BQU0sQ0FBQ0MsUUFBUCxDQUFnQkMsR0FBaEIsQ0FBb0JSLG1CQUFwQjtBQUNEOztlQUVjQSxtQiIsImZpbGUiOiJpbmRleC5jb21tb24uanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBDcmVhdGVFbGVtZW50IH0gZnJvbSAndnVlJyAvLyBlc2xpbnQtZGlzYWJsZS1saW5lIG5vLXVudXNlZC12YXJzXHJcbmltcG9ydCBYRVV0aWxzIGZyb20gJ3hlLXV0aWxzL21ldGhvZHMveGUtdXRpbHMnXHJcbmltcG9ydCB7IFZYRVRhYmxlLCBSZW5kZXJQYXJhbXMsIE9wdGlvblByb3BzLCBUYWJsZVJlbmRlclBhcmFtcywgUmVuZGVyT3B0aW9ucywgRmlsdGVyUmVuZGVyT3B0aW9ucywgQ2VsbFJlbmRlck9wdGlvbnMsIEVkaXRSZW5kZXJPcHRpb25zLCBJdGVtUmVuZGVyT3B0aW9ucywgQ2VsbFJlbmRlclBhcmFtcywgRWRpdFJlbmRlclBhcmFtcywgRmlsdGVyUmVuZGVyUGFyYW1zLCBGaWx0ZXJNZXRob2RQYXJhbXMsIEl0ZW1SZW5kZXJQYXJhbXMsIERhdGFFeHBvcnRMYWJlbFBhcmFtcyB9IGZyb20gJ3Z4ZS10YWJsZS9saWIvdnhlLXRhYmxlJyAvLyBlc2xpbnQtZGlzYWJsZS1saW5lIG5vLXVudXNlZC12YXJzXHJcblxyXG5mdW5jdGlvbiBpc0VtcHR5VmFsdWUgKGNlbGxWYWx1ZTogYW55KSB7XHJcbiAgcmV0dXJuIGNlbGxWYWx1ZSA9PT0gbnVsbCB8fCBjZWxsVmFsdWUgPT09IHVuZGVmaW5lZCB8fCBjZWxsVmFsdWUgPT09ICcnXHJcbn1cclxuXHJcbmZ1bmN0aW9uIGdldE1vZGVsUHJvcCAocmVuZGVyT3B0czogUmVuZGVyT3B0aW9ucykge1xyXG4gIHJldHVybiAndmFsdWUnXHJcbn1cclxuXHJcbmZ1bmN0aW9uIGdldE1vZGVsRXZlbnQgKHJlbmRlck9wdHM6IFJlbmRlck9wdGlvbnMpIHtcclxuICByZXR1cm4gJ2lucHV0J1xyXG59XHJcblxyXG5mdW5jdGlvbiBnZXRDaGFuZ2VFdmVudCAocmVuZGVyT3B0czogUmVuZGVyT3B0aW9ucykge1xyXG4gIHJldHVybiAnb24tY2hhbmdlJ1xyXG59XHJcblxyXG5mdW5jdGlvbiBnZXRGb3JtYXREYXRlICh2YWx1ZTogYW55LCBwcm9wczogYW55LCBkZWZhdWx0Rm9ybWF0OiBzdHJpbmcpIHtcclxuICByZXR1cm4gWEVVdGlscy50b0RhdGVTdHJpbmcodmFsdWUsIHByb3BzLmZvcm1hdCB8fCBkZWZhdWx0Rm9ybWF0KVxyXG59XHJcblxyXG5mdW5jdGlvbiBnZXRGb3JtYXREYXRlcyAodmFsdWVzOiBhbnksIHByb3BzOiBhbnksIHNlcGFyYXRvcjogc3RyaW5nLCBkZWZhdWx0Rm9ybWF0OiBzdHJpbmcpIHtcclxuICByZXR1cm4gWEVVdGlscy5tYXAodmFsdWVzLCAoZGF0ZTogYW55KSA9PiBnZXRGb3JtYXREYXRlKGRhdGUsIHByb3BzLCBkZWZhdWx0Rm9ybWF0KSkuam9pbihzZXBhcmF0b3IpXHJcbn1cclxuXHJcbmZ1bmN0aW9uIGVxdWFsRGF0ZXJhbmdlIChjZWxsVmFsdWU6IGFueSwgZGF0YTogYW55LCBwcm9wczogYW55LCBkZWZhdWx0Rm9ybWF0OiBzdHJpbmcpIHtcclxuICBjZWxsVmFsdWUgPSBnZXRGb3JtYXREYXRlKGNlbGxWYWx1ZSwgcHJvcHMsIGRlZmF1bHRGb3JtYXQpXHJcbiAgcmV0dXJuIGNlbGxWYWx1ZSA+PSBnZXRGb3JtYXREYXRlKGRhdGFbMF0sIHByb3BzLCBkZWZhdWx0Rm9ybWF0KSAmJiBjZWxsVmFsdWUgPD0gZ2V0Rm9ybWF0RGF0ZShkYXRhWzFdLCBwcm9wcywgZGVmYXVsdEZvcm1hdClcclxufVxyXG5cclxuZnVuY3Rpb24gZ2V0Q2VsbEVkaXRGaWx0ZXJQcm9wcyAocmVuZGVyT3B0czogUmVuZGVyT3B0aW9ucywgcGFyYW1zOiBUYWJsZVJlbmRlclBhcmFtcywgdmFsdWU6IGFueSwgZGVmYXVsdFByb3BzPzogeyBbcHJvcDogc3RyaW5nXTogYW55IH0pIHtcclxuICBjb25zdCB7IHZTaXplIH0gPSBwYXJhbXMuJHRhYmxlXHJcbiAgcmV0dXJuIFhFVXRpbHMuYXNzaWduKHZTaXplID8geyBzaXplOiB2U2l6ZSB9IDoge30sIGRlZmF1bHRQcm9wcywgcmVuZGVyT3B0cy5wcm9wcywgeyBbZ2V0TW9kZWxQcm9wKHJlbmRlck9wdHMpXTogdmFsdWUgfSlcclxufVxyXG5cclxuZnVuY3Rpb24gZ2V0SXRlbVByb3BzIChyZW5kZXJPcHRzOiBSZW5kZXJPcHRpb25zLCBwYXJhbXM6IEl0ZW1SZW5kZXJQYXJhbXMsIHZhbHVlOiBhbnksIGRlZmF1bHRQcm9wcz86IHsgW3Byb3A6IHN0cmluZ106IGFueSB9KSB7XHJcbiAgY29uc3QgeyB2U2l6ZSB9ID0gcGFyYW1zLiRmb3JtXHJcbiAgcmV0dXJuIFhFVXRpbHMuYXNzaWduKHZTaXplID8geyBzaXplOiB2U2l6ZSB9IDoge30sIGRlZmF1bHRQcm9wcywgcmVuZGVyT3B0cy5wcm9wcywgeyBbZ2V0TW9kZWxQcm9wKHJlbmRlck9wdHMpXTogdmFsdWUgfSlcclxufVxyXG5cclxuZnVuY3Rpb24gZ2V0T25zIChyZW5kZXJPcHRzOiBSZW5kZXJPcHRpb25zLCBwYXJhbXM6IFJlbmRlclBhcmFtcywgaW5wdXRGdW5jPzogRnVuY3Rpb24sIGNoYW5nZUZ1bmM/OiBGdW5jdGlvbikge1xyXG4gIGNvbnN0IHsgZXZlbnRzIH0gPSByZW5kZXJPcHRzXHJcbiAgY29uc3QgbW9kZWxFdmVudCA9IGdldE1vZGVsRXZlbnQocmVuZGVyT3B0cylcclxuICBjb25zdCBjaGFuZ2VFdmVudCA9IGdldENoYW5nZUV2ZW50KHJlbmRlck9wdHMpXHJcbiAgY29uc3QgaXNTYW1lRXZlbnQgPSBjaGFuZ2VFdmVudCA9PT0gbW9kZWxFdmVudFxyXG4gIGNvbnN0IG9uczogeyBbdHlwZTogc3RyaW5nXTogRnVuY3Rpb24gfSA9IHt9XHJcbiAgWEVVdGlscy5vYmplY3RFYWNoKGV2ZW50cywgKGZ1bmM6IEZ1bmN0aW9uLCBrZXk6IHN0cmluZykgPT4ge1xyXG4gICAgb25zW2tleV0gPSBmdW5jdGlvbiAoLi4uYXJnczogYW55W10pIHtcclxuICAgICAgZnVuYyhwYXJhbXMsIC4uLmFyZ3MpXHJcbiAgICB9XHJcbiAgfSlcclxuICBpZiAoaW5wdXRGdW5jKSB7XHJcbiAgICBvbnNbbW9kZWxFdmVudF0gPSBmdW5jdGlvbiAodmFsdWU6IGFueSkge1xyXG4gICAgICBpbnB1dEZ1bmModmFsdWUpXHJcbiAgICAgIGlmIChldmVudHMgJiYgZXZlbnRzW21vZGVsRXZlbnRdKSB7XHJcbiAgICAgICAgZXZlbnRzW21vZGVsRXZlbnRdKHZhbHVlKVxyXG4gICAgICB9XHJcbiAgICAgIGlmIChpc1NhbWVFdmVudCAmJiBjaGFuZ2VGdW5jKSB7XHJcbiAgICAgICAgY2hhbmdlRnVuYygpXHJcbiAgICAgIH1cclxuICAgIH1cclxuICB9XHJcbiAgaWYgKCFpc1NhbWVFdmVudCAmJiBjaGFuZ2VGdW5jKSB7XHJcbiAgICBvbnNbY2hhbmdlRXZlbnRdID0gZnVuY3Rpb24gKC4uLmFyZ3M6IGFueVtdKSB7XHJcbiAgICAgIGNoYW5nZUZ1bmMoKVxyXG4gICAgICBpZiAoZXZlbnRzICYmIGV2ZW50c1tjaGFuZ2VFdmVudF0pIHtcclxuICAgICAgICBldmVudHNbY2hhbmdlRXZlbnRdKHBhcmFtcywgLi4uYXJncylcclxuICAgICAgfVxyXG4gICAgfVxyXG4gIH1cclxuICByZXR1cm4gb25zXHJcbn1cclxuXHJcbmZ1bmN0aW9uIGdldEVkaXRPbnMgKHJlbmRlck9wdHM6IFJlbmRlck9wdGlvbnMsIHBhcmFtczogRWRpdFJlbmRlclBhcmFtcykge1xyXG4gIGNvbnN0IHsgJHRhYmxlLCByb3csIGNvbHVtbiB9ID0gcGFyYW1zXHJcbiAgcmV0dXJuIGdldE9ucyhyZW5kZXJPcHRzLCBwYXJhbXMsICh2YWx1ZTogYW55KSA9PiB7XHJcbiAgICAvLyDlpITnkIYgbW9kZWwg5YC85Y+M5ZCR57uR5a6aXHJcbiAgICBYRVV0aWxzLnNldChyb3csIGNvbHVtbi5wcm9wZXJ0eSwgdmFsdWUpXHJcbiAgfSwgKCkgPT4ge1xyXG4gICAgLy8g5aSE55CGIGNoYW5nZSDkuovku7bnm7jlhbPpgLvovpFcclxuICAgICR0YWJsZS51cGRhdGVTdGF0dXMocGFyYW1zKVxyXG4gIH0pXHJcbn1cclxuXHJcbmZ1bmN0aW9uIGdldEZpbHRlck9ucyAocmVuZGVyT3B0czogUmVuZGVyT3B0aW9ucywgcGFyYW1zOiBGaWx0ZXJSZW5kZXJQYXJhbXMsIG9wdGlvbjogYW55LCBjaGFuZ2VGdW5jOiBGdW5jdGlvbikge1xyXG4gIHJldHVybiBnZXRPbnMocmVuZGVyT3B0cywgcGFyYW1zLCAodmFsdWU6IGFueSkgPT4ge1xyXG4gICAgLy8g5aSE55CGIG1vZGVsIOWAvOWPjOWQkee7keWumlxyXG4gICAgb3B0aW9uLmRhdGEgPSB2YWx1ZVxyXG4gIH0sIGNoYW5nZUZ1bmMpXHJcbn1cclxuXHJcbmZ1bmN0aW9uIGdldEl0ZW1PbnMgKHJlbmRlck9wdHM6IFJlbmRlck9wdGlvbnMsIHBhcmFtczogSXRlbVJlbmRlclBhcmFtcykge1xyXG4gIGNvbnN0IHsgJGZvcm0sIGRhdGEsIHByb3BlcnR5IH0gPSBwYXJhbXNcclxuICByZXR1cm4gZ2V0T25zKHJlbmRlck9wdHMsIHBhcmFtcywgKHZhbHVlOiBhbnkpID0+IHtcclxuICAgIC8vIOWkhOeQhiBtb2RlbCDlgLzlj4zlkJHnu5HlrppcclxuICAgIFhFVXRpbHMuc2V0KGRhdGEsIHByb3BlcnR5LCB2YWx1ZSlcclxuICB9LCAoKSA9PiB7XHJcbiAgICAvLyDlpITnkIYgY2hhbmdlIOS6i+S7tuebuOWFs+mAu+i+kVxyXG4gICAgJGZvcm0udXBkYXRlU3RhdHVzKHBhcmFtcylcclxuICB9KVxyXG59XHJcblxyXG5mdW5jdGlvbiBtYXRjaENhc2NhZGVyRGF0YSAoaW5kZXg6IG51bWJlciwgbGlzdDogQXJyYXk8YW55PiwgdmFsdWVzOiBBcnJheTxhbnk+LCBsYWJlbHM6IEFycmF5PGFueT4pIHtcclxuICBjb25zdCB2YWwgPSB2YWx1ZXNbaW5kZXhdXHJcbiAgaWYgKGxpc3QgJiYgdmFsdWVzLmxlbmd0aCA+IGluZGV4KSB7XHJcbiAgICBYRVV0aWxzLmVhY2gobGlzdCwgKGl0ZW06IGFueSkgPT4ge1xyXG4gICAgICBpZiAoaXRlbS52YWx1ZSA9PT0gdmFsKSB7XHJcbiAgICAgICAgbGFiZWxzLnB1c2goaXRlbS5sYWJlbClcclxuICAgICAgICBtYXRjaENhc2NhZGVyRGF0YSgrK2luZGV4LCBpdGVtLmNoaWxkcmVuLCB2YWx1ZXMsIGxhYmVscylcclxuICAgICAgfVxyXG4gICAgfSlcclxuICB9XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGdldFNlbGVjdENlbGxWYWx1ZSAocmVuZGVyT3B0czogQ2VsbFJlbmRlck9wdGlvbnMsIHBhcmFtczogYW55KSB7XHJcbiAgY29uc3QgeyBvcHRpb25zID0gW10sIG9wdGlvbkdyb3VwcywgcHJvcHMgPSB7fSwgb3B0aW9uUHJvcHMgPSB7fSwgb3B0aW9uR3JvdXBQcm9wcyA9IHt9IH0gPSByZW5kZXJPcHRzXHJcbiAgY29uc3QgeyAkdGFibGUsIHJvdywgY29sdW1uIH0gPSBwYXJhbXNcclxuICBjb25zdCBsYWJlbFByb3AgPSBvcHRpb25Qcm9wcy5sYWJlbCB8fCAnbGFiZWwnXHJcbiAgY29uc3QgdmFsdWVQcm9wID0gb3B0aW9uUHJvcHMudmFsdWUgfHwgJ3ZhbHVlJ1xyXG4gIGNvbnN0IGdyb3VwT3B0aW9ucyA9IG9wdGlvbkdyb3VwUHJvcHMub3B0aW9ucyB8fCAnb3B0aW9ucydcclxuICBjb25zdCBjZWxsVmFsdWUgPSBYRVV0aWxzLmdldChyb3csIGNvbHVtbi5wcm9wZXJ0eSlcclxuICBjb25zdCBjb2xpZCA9IGNvbHVtbi5pZFxyXG4gIGxldCByZXN0OiBhbnlcclxuICBsZXQgY2VsbERhdGE6IGFueVxyXG4gIGlmIChwcm9wcy5maWx0ZXJhYmxlKSB7XHJcbiAgICBjb25zdCBmdWxsQWxsRGF0YVJvd01hcDogTWFwPGFueSwgYW55PiA9ICR0YWJsZS5mdWxsQWxsRGF0YVJvd01hcFxyXG4gICAgY29uc3QgY2FjaGVDZWxsID0gZnVsbEFsbERhdGFSb3dNYXAuaGFzKHJvdylcclxuICAgIGlmIChjYWNoZUNlbGwpIHtcclxuICAgICAgcmVzdCA9IGZ1bGxBbGxEYXRhUm93TWFwLmdldChyb3cpXHJcbiAgICAgIGNlbGxEYXRhID0gcmVzdC5jZWxsRGF0YVxyXG4gICAgICBpZiAoIWNlbGxEYXRhKSB7XHJcbiAgICAgICAgY2VsbERhdGEgPSBmdWxsQWxsRGF0YVJvd01hcC5nZXQocm93KS5jZWxsRGF0YSA9IHt9XHJcbiAgICAgIH1cclxuICAgIH1cclxuICAgIGlmIChyZXN0ICYmIGNlbGxEYXRhW2NvbGlkXSAmJiBjZWxsRGF0YVtjb2xpZF0udmFsdWUgPT09IGNlbGxWYWx1ZSkge1xyXG4gICAgICByZXR1cm4gY2VsbERhdGFbY29saWRdLmxhYmVsXHJcbiAgICB9XHJcbiAgfVxyXG4gIGlmICghaXNFbXB0eVZhbHVlKGNlbGxWYWx1ZSkpIHtcclxuICAgIHJldHVybiBYRVV0aWxzLm1hcChwcm9wcy5tdWx0aXBsZSA/IGNlbGxWYWx1ZSA6IFtjZWxsVmFsdWVdLCBvcHRpb25Hcm91cHMgPyAodmFsdWU6IGFueSkgPT4ge1xyXG4gICAgICBsZXQgc2VsZWN0SXRlbVxyXG4gICAgICBmb3IgKGxldCBpbmRleCA9IDA7IGluZGV4IDwgb3B0aW9uR3JvdXBzLmxlbmd0aDsgaW5kZXgrKykge1xyXG4gICAgICAgIHNlbGVjdEl0ZW0gPSBYRVV0aWxzLmZpbmQob3B0aW9uR3JvdXBzW2luZGV4XVtncm91cE9wdGlvbnNdLCAoaXRlbTogYW55KSA9PiBpdGVtW3ZhbHVlUHJvcF0gPT09IHZhbHVlKVxyXG4gICAgICAgIGlmIChzZWxlY3RJdGVtKSB7XHJcbiAgICAgICAgICBicmVha1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgICBjb25zdCBjZWxsTGFiZWw6IGFueSA9IHNlbGVjdEl0ZW0gPyBzZWxlY3RJdGVtW2xhYmVsUHJvcF0gOiB2YWx1ZVxyXG4gICAgICBpZiAoY2VsbERhdGEgJiYgb3B0aW9ucyAmJiBvcHRpb25zLmxlbmd0aCkge1xyXG4gICAgICAgIGNlbGxEYXRhW2NvbGlkXSA9IHsgdmFsdWU6IGNlbGxWYWx1ZSwgbGFiZWw6IGNlbGxMYWJlbCB9XHJcbiAgICAgIH1cclxuICAgICAgcmV0dXJuIGNlbGxMYWJlbFxyXG4gICAgfSA6ICh2YWx1ZTogYW55KSA9PiB7XHJcbiAgICAgIGNvbnN0IHNlbGVjdEl0ZW0gPSBYRVV0aWxzLmZpbmQob3B0aW9ucywgKGl0ZW06IGFueSkgPT4gaXRlbVt2YWx1ZVByb3BdID09PSB2YWx1ZSlcclxuICAgICAgY29uc3QgY2VsbExhYmVsOiBhbnkgPSBzZWxlY3RJdGVtID8gc2VsZWN0SXRlbVtsYWJlbFByb3BdIDogdmFsdWVcclxuICAgICAgaWYgKGNlbGxEYXRhICYmIG9wdGlvbnMgJiYgb3B0aW9ucy5sZW5ndGgpIHtcclxuICAgICAgICBjZWxsRGF0YVtjb2xpZF0gPSB7IHZhbHVlOiBjZWxsVmFsdWUsIGxhYmVsOiBjZWxsTGFiZWwgfVxyXG4gICAgICB9XHJcbiAgICAgIHJldHVybiBjZWxsTGFiZWxcclxuICAgIH0pLmpvaW4oJywgJylcclxuICB9XHJcbiAgcmV0dXJuIG51bGxcclxufVxyXG5cclxuZnVuY3Rpb24gZ2V0Q2FzY2FkZXJDZWxsVmFsdWUgKHJlbmRlck9wdHM6IFJlbmRlck9wdGlvbnMsIHBhcmFtczogQ2VsbFJlbmRlclBhcmFtcykge1xyXG4gIGNvbnN0IHsgcHJvcHMgPSB7fSB9ID0gcmVuZGVyT3B0c1xyXG4gIGNvbnN0IHsgcm93LCBjb2x1bW4gfSA9IHBhcmFtc1xyXG4gIGNvbnN0IGNlbGxWYWx1ZSA9IFhFVXRpbHMuZ2V0KHJvdywgY29sdW1uLnByb3BlcnR5KVxyXG4gIGNvbnN0IHZhbHVlcyA9IGNlbGxWYWx1ZSB8fCBbXVxyXG4gIGNvbnN0IGxhYmVsczogQXJyYXk8YW55PiA9IFtdXHJcbiAgbWF0Y2hDYXNjYWRlckRhdGEoMCwgcHJvcHMuZGF0YSwgdmFsdWVzLCBsYWJlbHMpXHJcbiAgcmV0dXJuIGxhYmVscy5qb2luKGAgJHtwcm9wcy5zZXBhcmF0b3IgfHwgJy8nfSBgKVxyXG59XHJcblxyXG5mdW5jdGlvbiBnZXREYXRlUGlja2VyQ2VsbFZhbHVlIChyZW5kZXJPcHRzOiBSZW5kZXJPcHRpb25zLCBwYXJhbXM6IENlbGxSZW5kZXJQYXJhbXMpIHtcclxuICBjb25zdCB7IHByb3BzID0ge30gfSA9IHJlbmRlck9wdHNcclxuICBjb25zdCB7IHJvdywgY29sdW1uIH0gPSBwYXJhbXNcclxuICBjb25zdCB7IHNlcGFyYXRvciB9ID0gcHJvcHNcclxuICBsZXQgY2VsbFZhbHVlID0gWEVVdGlscy5nZXQocm93LCBjb2x1bW4ucHJvcGVydHkpXHJcbiAgc3dpdGNoIChwcm9wcy50eXBlKSB7XHJcbiAgICBjYXNlICd3ZWVrJzpcclxuICAgICAgY2VsbFZhbHVlID0gZ2V0Rm9ybWF0RGF0ZShjZWxsVmFsdWUsIHByb3BzLCAneXl5eXdXVycpXHJcbiAgICAgIGJyZWFrXHJcbiAgICBjYXNlICdtb250aCc6XHJcbiAgICAgIGNlbGxWYWx1ZSA9IGdldEZvcm1hdERhdGUoY2VsbFZhbHVlLCBwcm9wcywgJ3l5eXktTU0nKVxyXG4gICAgICBicmVha1xyXG4gICAgY2FzZSAneWVhcic6XHJcbiAgICAgIGNlbGxWYWx1ZSA9IGdldEZvcm1hdERhdGUoY2VsbFZhbHVlLCBwcm9wcywgJ3l5eXknKVxyXG4gICAgICBicmVha1xyXG4gICAgY2FzZSAnZGF0ZXMnOlxyXG4gICAgICBjZWxsVmFsdWUgPSBnZXRGb3JtYXREYXRlcyhjZWxsVmFsdWUsIHByb3BzLCAnLCAnLCAneXl5eS1NTS1kZCcpXHJcbiAgICAgIGJyZWFrXHJcbiAgICBjYXNlICdkYXRlcmFuZ2UnOlxyXG4gICAgICBjZWxsVmFsdWUgPSBnZXRGb3JtYXREYXRlcyhjZWxsVmFsdWUsIHByb3BzLCBgICR7c2VwYXJhdG9yIHx8ICctJ30gYCwgJ3l5eXktTU0tZGQnKVxyXG4gICAgICBicmVha1xyXG4gICAgY2FzZSAnZGF0ZXRpbWVyYW5nZSc6XHJcbiAgICAgIGNlbGxWYWx1ZSA9IGdldEZvcm1hdERhdGVzKGNlbGxWYWx1ZSwgcHJvcHMsIGAgJHtzZXBhcmF0b3IgfHwgJy0nfSBgLCAneXl5eS1NTS1kZCBISDpzczptbScpXHJcbiAgICAgIGJyZWFrXHJcbiAgICBkZWZhdWx0OlxyXG4gICAgICBjZWxsVmFsdWUgPSBnZXRGb3JtYXREYXRlKGNlbGxWYWx1ZSwgcHJvcHMsICd5eXl5LU1NLWRkJylcclxuICAgICAgYnJlYWtcclxuICB9XHJcbiAgcmV0dXJuIGNlbGxWYWx1ZVxyXG59XHJcblxyXG5mdW5jdGlvbiBjcmVhdGVFZGl0UmVuZGVyIChkZWZhdWx0UHJvcHM/OiB7IFtrZXk6IHN0cmluZ106IGFueSB9KSB7XHJcbiAgcmV0dXJuIGZ1bmN0aW9uIChoOiBDcmVhdGVFbGVtZW50LCByZW5kZXJPcHRzOiBFZGl0UmVuZGVyT3B0aW9ucywgcGFyYW1zOiBFZGl0UmVuZGVyUGFyYW1zKSB7XHJcbiAgICBjb25zdCB7IHJvdywgY29sdW1uIH0gPSBwYXJhbXNcclxuICAgIGNvbnN0IHsgYXR0cnMgfSA9IHJlbmRlck9wdHNcclxuICAgIGNvbnN0IGNlbGxWYWx1ZSA9IFhFVXRpbHMuZ2V0KHJvdywgY29sdW1uLnByb3BlcnR5KVxyXG4gICAgcmV0dXJuIFtcclxuICAgICAgaChyZW5kZXJPcHRzLm5hbWUsIHtcclxuICAgICAgICBhdHRycyxcclxuICAgICAgICBwcm9wczogZ2V0Q2VsbEVkaXRGaWx0ZXJQcm9wcyhyZW5kZXJPcHRzLCBwYXJhbXMsIGNlbGxWYWx1ZSwgZGVmYXVsdFByb3BzKSxcclxuICAgICAgICBvbjogZ2V0RWRpdE9ucyhyZW5kZXJPcHRzLCBwYXJhbXMpXHJcbiAgICAgIH0pXHJcbiAgICBdXHJcbiAgfVxyXG59XHJcblxyXG5mdW5jdGlvbiBkZWZhdWx0QnV0dG9uRWRpdFJlbmRlciAoaDogQ3JlYXRlRWxlbWVudCwgcmVuZGVyT3B0czogRWRpdFJlbmRlck9wdGlvbnMsIHBhcmFtczogRWRpdFJlbmRlclBhcmFtcykge1xyXG4gIGNvbnN0IHsgYXR0cnMgfSA9IHJlbmRlck9wdHNcclxuICByZXR1cm4gW1xyXG4gICAgaCgnQnV0dG9uJywge1xyXG4gICAgICBhdHRycyxcclxuICAgICAgcHJvcHM6IGdldENlbGxFZGl0RmlsdGVyUHJvcHMocmVuZGVyT3B0cywgcGFyYW1zLCBudWxsKSxcclxuICAgICAgb246IGdldE9ucyhyZW5kZXJPcHRzLCBwYXJhbXMpXHJcbiAgICB9LCBjZWxsVGV4dChoLCByZW5kZXJPcHRzLmNvbnRlbnQpKVxyXG4gIF1cclxufVxyXG5cclxuZnVuY3Rpb24gZGVmYXVsdEJ1dHRvbnNFZGl0UmVuZGVyIChoOiBDcmVhdGVFbGVtZW50LCByZW5kZXJPcHRzOiBFZGl0UmVuZGVyT3B0aW9ucywgcGFyYW1zOiBFZGl0UmVuZGVyUGFyYW1zKSB7XHJcbiAgcmV0dXJuIHJlbmRlck9wdHMuY2hpbGRyZW4ubWFwKChjaGlsZFJlbmRlck9wdHM6IGFueSkgPT4gZGVmYXVsdEJ1dHRvbkVkaXRSZW5kZXIoaCwgY2hpbGRSZW5kZXJPcHRzLCBwYXJhbXMpWzBdKVxyXG59XHJcblxyXG5mdW5jdGlvbiBjcmVhdGVGaWx0ZXJSZW5kZXIgKGRlZmF1bHRQcm9wcz86IGFueSkge1xyXG4gIHJldHVybiBmdW5jdGlvbiAoaDogQ3JlYXRlRWxlbWVudCwgcmVuZGVyT3B0czogRmlsdGVyUmVuZGVyT3B0aW9ucywgcGFyYW1zOiBGaWx0ZXJSZW5kZXJQYXJhbXMpIHtcclxuICAgIGNvbnN0IHsgY29sdW1uIH0gPSBwYXJhbXNcclxuICAgIGNvbnN0IHsgbmFtZSwgYXR0cnMgfSA9IHJlbmRlck9wdHNcclxuICAgIHJldHVybiBjb2x1bW4uZmlsdGVycy5tYXAoKG9wdGlvbjogYW55LCBvSW5kZXg6IG51bWJlcikgPT4ge1xyXG4gICAgICBjb25zdCBvcHRpb25WYWx1ZSA9IG9wdGlvbi5kYXRhXHJcbiAgICAgIHJldHVybiBoKG5hbWUsIHtcclxuICAgICAgICBrZXk6IG9JbmRleCxcclxuICAgICAgICBhdHRycyxcclxuICAgICAgICBwcm9wczogZ2V0Q2VsbEVkaXRGaWx0ZXJQcm9wcyhyZW5kZXJPcHRzLCBwYXJhbXMsIG9wdGlvblZhbHVlLCBkZWZhdWx0UHJvcHMpLFxyXG4gICAgICAgIG9uOiBnZXRGaWx0ZXJPbnMocmVuZGVyT3B0cywgcGFyYW1zLCBvcHRpb24sICgpID0+IHtcclxuICAgICAgICAgIC8vIOWkhOeQhiBjaGFuZ2Ug5LqL5Lu255u45YWz6YC76L6RXHJcbiAgICAgICAgICBoYW5kbGVDb25maXJtRmlsdGVyKHBhcmFtcywgISFvcHRpb24uZGF0YSwgb3B0aW9uKVxyXG4gICAgICAgIH0pXHJcbiAgICAgIH0pXHJcbiAgICB9KVxyXG4gIH1cclxufVxyXG5cclxuZnVuY3Rpb24gaGFuZGxlQ29uZmlybUZpbHRlciAocGFyYW1zOiBGaWx0ZXJSZW5kZXJQYXJhbXMsIGNoZWNrZWQ6IGJvb2xlYW4sIG9wdGlvbjogYW55KSB7XHJcbiAgY29uc3QgeyAkcGFuZWwgfSA9IHBhcmFtc1xyXG4gICRwYW5lbC5jaGFuZ2VPcHRpb24oe30sIGNoZWNrZWQsIG9wdGlvbilcclxufVxyXG5cclxuZnVuY3Rpb24gZGVmYXVsdEZpbHRlck1ldGhvZCAocGFyYW1zOiBGaWx0ZXJNZXRob2RQYXJhbXMpIHtcclxuICBjb25zdCB7IG9wdGlvbiwgcm93LCBjb2x1bW4gfSA9IHBhcmFtc1xyXG4gIGNvbnN0IHsgZGF0YSB9ID0gb3B0aW9uXHJcbiAgY29uc3QgY2VsbFZhbHVlID0gWEVVdGlscy5nZXQocm93LCBjb2x1bW4ucHJvcGVydHkpXHJcbiAgLyogZXNsaW50LWRpc2FibGUgZXFlcWVxICovXHJcbiAgcmV0dXJuIGNlbGxWYWx1ZSA9PT0gZGF0YVxyXG59XHJcblxyXG5mdW5jdGlvbiByZW5kZXJPcHRpb25zIChoOiBDcmVhdGVFbGVtZW50LCBvcHRpb25zOiBhbnlbXSwgb3B0aW9uUHJvcHM6IE9wdGlvblByb3BzKSB7XHJcbiAgY29uc3QgbGFiZWxQcm9wID0gb3B0aW9uUHJvcHMubGFiZWwgfHwgJ2xhYmVsJ1xyXG4gIGNvbnN0IHZhbHVlUHJvcCA9IG9wdGlvblByb3BzLnZhbHVlIHx8ICd2YWx1ZSdcclxuICBjb25zdCBkaXNhYmxlZFByb3AgPSBvcHRpb25Qcm9wcy5kaXNhYmxlZCB8fCAnZGlzYWJsZWQnXHJcbiAgcmV0dXJuIFhFVXRpbHMubWFwKG9wdGlvbnMsIChpdGVtLCBvSW5kZXgpID0+IHtcclxuICAgIHJldHVybiBoKCdPcHRpb24nLCB7XHJcbiAgICAgIGtleTogb0luZGV4LFxyXG4gICAgICBwcm9wczoge1xyXG4gICAgICAgIHZhbHVlOiBpdGVtW3ZhbHVlUHJvcF0sXHJcbiAgICAgICAgbGFiZWw6IGl0ZW1bbGFiZWxQcm9wXSxcclxuICAgICAgICBkaXNhYmxlZDogaXRlbVtkaXNhYmxlZFByb3BdXHJcbiAgICAgIH1cclxuICAgIH0pXHJcbiAgfSlcclxufVxyXG5cclxuZnVuY3Rpb24gY2VsbFRleHQgKGg6IENyZWF0ZUVsZW1lbnQsIGNlbGxWYWx1ZTogYW55KSB7XHJcbiAgcmV0dXJuIFsnJyArIChpc0VtcHR5VmFsdWUoY2VsbFZhbHVlKSA/ICcnIDogY2VsbFZhbHVlKV1cclxufVxyXG5cclxuZnVuY3Rpb24gY3JlYXRlRm9ybUl0ZW1SZW5kZXIgKGRlZmF1bHRQcm9wcz86IHsgW2tleTogc3RyaW5nXTogYW55IH0pIHtcclxuICByZXR1cm4gZnVuY3Rpb24gKGg6IENyZWF0ZUVsZW1lbnQsIHJlbmRlck9wdHM6IEl0ZW1SZW5kZXJPcHRpb25zLCBwYXJhbXM6IEl0ZW1SZW5kZXJQYXJhbXMpIHtcclxuICAgIGNvbnN0IHsgZGF0YSwgcHJvcGVydHkgfSA9IHBhcmFtc1xyXG4gICAgY29uc3QgeyBuYW1lIH0gPSByZW5kZXJPcHRzXHJcbiAgICBjb25zdCB7IGF0dHJzIH0gPSByZW5kZXJPcHRzXHJcbiAgICBjb25zdCBpdGVtVmFsdWUgPSBYRVV0aWxzLmdldChkYXRhLCBwcm9wZXJ0eSlcclxuICAgIHJldHVybiBbXHJcbiAgICAgIGgobmFtZSwge1xyXG4gICAgICAgIGF0dHJzLFxyXG4gICAgICAgIHByb3BzOiBnZXRJdGVtUHJvcHMocmVuZGVyT3B0cywgcGFyYW1zLCBpdGVtVmFsdWUsIGRlZmF1bHRQcm9wcyksXHJcbiAgICAgICAgb246IGdldEl0ZW1PbnMocmVuZGVyT3B0cywgcGFyYW1zKVxyXG4gICAgICB9KVxyXG4gICAgXVxyXG4gIH1cclxufVxyXG5cclxuZnVuY3Rpb24gZGVmYXVsdEJ1dHRvbkl0ZW1SZW5kZXIgKGg6IENyZWF0ZUVsZW1lbnQsIHJlbmRlck9wdHM6IEl0ZW1SZW5kZXJPcHRpb25zLCBwYXJhbXM6IEl0ZW1SZW5kZXJQYXJhbXMpIHtcclxuICBjb25zdCB7IGF0dHJzIH0gPSByZW5kZXJPcHRzXHJcbiAgY29uc3QgcHJvcHMgPSBnZXRJdGVtUHJvcHMocmVuZGVyT3B0cywgcGFyYW1zLCBudWxsKVxyXG4gIHJldHVybiBbXHJcbiAgICBoKCdCdXR0b24nLCB7XHJcbiAgICAgIGF0dHJzLFxyXG4gICAgICBwcm9wcyxcclxuICAgICAgb246IGdldE9ucyhyZW5kZXJPcHRzLCBwYXJhbXMpXHJcbiAgICB9LCBjZWxsVGV4dChoLCByZW5kZXJPcHRzLmNvbnRlbnQgfHwgcHJvcHMuY29udGVudCkpXHJcbiAgXVxyXG59XHJcblxyXG5mdW5jdGlvbiBkZWZhdWx0QnV0dG9uc0l0ZW1SZW5kZXIgKGg6IENyZWF0ZUVsZW1lbnQsIHJlbmRlck9wdHM6IEl0ZW1SZW5kZXJPcHRpb25zLCBwYXJhbXM6IEl0ZW1SZW5kZXJQYXJhbXMpIHtcclxuICByZXR1cm4gcmVuZGVyT3B0cy5jaGlsZHJlbi5tYXAoKGNoaWxkUmVuZGVyT3B0czogYW55KSA9PiBkZWZhdWx0QnV0dG9uSXRlbVJlbmRlcihoLCBjaGlsZFJlbmRlck9wdHMsIHBhcmFtcylbMF0pXHJcbn1cclxuXHJcbmZ1bmN0aW9uIGNyZWF0ZUV4cG9ydE1ldGhvZCAodmFsdWVNZXRob2Q6IEZ1bmN0aW9uLCBpc0VkaXQ/OiBib29sZWFuKSB7XHJcbiAgY29uc3QgcmVuZGVyUHJvcGVydHkgPSBpc0VkaXQgPyAnZWRpdFJlbmRlcicgOiAnY2VsbFJlbmRlcidcclxuICByZXR1cm4gZnVuY3Rpb24gKHBhcmFtczogRGF0YUV4cG9ydExhYmVsUGFyYW1zKSB7XHJcbiAgICByZXR1cm4gdmFsdWVNZXRob2QocGFyYW1zLmNvbHVtbltyZW5kZXJQcm9wZXJ0eV0sIHBhcmFtcylcclxuICB9XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGNyZWF0ZUZvcm1JdGVtUmFkaW9BbmRDaGVja2JveFJlbmRlciAoKSB7XHJcbiAgcmV0dXJuIGZ1bmN0aW9uIChoOiBDcmVhdGVFbGVtZW50LCByZW5kZXJPcHRzOiBJdGVtUmVuZGVyT3B0aW9ucywgcGFyYW1zOiBJdGVtUmVuZGVyUGFyYW1zKSB7XHJcbiAgICBjb25zdCB7IG5hbWUsIG9wdGlvbnMgPSBbXSwgb3B0aW9uUHJvcHMgPSB7fSB9ID0gcmVuZGVyT3B0c1xyXG4gICAgY29uc3QgeyBkYXRhLCBwcm9wZXJ0eSB9ID0gcGFyYW1zXHJcbiAgICBjb25zdCB7IGF0dHJzIH0gPSByZW5kZXJPcHRzXHJcbiAgICBjb25zdCBsYWJlbFByb3AgPSBvcHRpb25Qcm9wcy5sYWJlbCB8fCAnbGFiZWwnXHJcbiAgICBjb25zdCB2YWx1ZVByb3AgPSBvcHRpb25Qcm9wcy52YWx1ZSB8fCAndmFsdWUnXHJcbiAgICBjb25zdCBkaXNhYmxlZFByb3AgPSBvcHRpb25Qcm9wcy5kaXNhYmxlZCB8fCAnZGlzYWJsZWQnXHJcbiAgICBjb25zdCBpdGVtVmFsdWUgPSBYRVV0aWxzLmdldChkYXRhLCBwcm9wZXJ0eSlcclxuICAgIHJldHVybiBbXHJcbiAgICAgIGgoYCR7bmFtZX1Hcm91cGAsIHtcclxuICAgICAgICBhdHRycyxcclxuICAgICAgICBwcm9wczogZ2V0SXRlbVByb3BzKHJlbmRlck9wdHMsIHBhcmFtcywgaXRlbVZhbHVlKSxcclxuICAgICAgICBvbjogZ2V0SXRlbU9ucyhyZW5kZXJPcHRzLCBwYXJhbXMpXHJcbiAgICAgIH0sIG9wdGlvbnMubWFwKChvcHRpb246IGFueSkgPT4ge1xyXG4gICAgICAgIHJldHVybiBoKG5hbWUsIHtcclxuICAgICAgICAgIHByb3BzOiB7XHJcbiAgICAgICAgICAgIGxhYmVsOiBvcHRpb25bdmFsdWVQcm9wXSxcclxuICAgICAgICAgICAgZGlzYWJsZWQ6IG9wdGlvbltkaXNhYmxlZFByb3BdXHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfSwgb3B0aW9uW2xhYmVsUHJvcF0pXHJcbiAgICAgIH0pKVxyXG4gICAgXVxyXG4gIH1cclxufVxyXG5cclxuLyoqXHJcbiAqIOa4suafk+WHveaVsFxyXG4gKi9cclxuY29uc3QgcmVuZGVyTWFwOiBhbnkgPSB7XHJcbiAgSW5wdXQ6IHtcclxuICAgIGF1dG9mb2N1czogJ2lucHV0Lml2dS1pbnB1dCcsXHJcbiAgICByZW5kZXJEZWZhdWx0OiBjcmVhdGVFZGl0UmVuZGVyKCksXHJcbiAgICByZW5kZXJFZGl0OiBjcmVhdGVFZGl0UmVuZGVyKCksXHJcbiAgICByZW5kZXJGaWx0ZXI6IGNyZWF0ZUZpbHRlclJlbmRlcigpLFxyXG4gICAgZmlsdGVyTWV0aG9kOiBkZWZhdWx0RmlsdGVyTWV0aG9kLFxyXG4gICAgcmVuZGVySXRlbTogY3JlYXRlRm9ybUl0ZW1SZW5kZXIoKVxyXG4gIH0sXHJcbiAgQXV0b0NvbXBsZXRlOiB7XHJcbiAgICBhdXRvZm9jdXM6ICdpbnB1dC5pdnUtaW5wdXQnLFxyXG4gICAgcmVuZGVyRGVmYXVsdDogY3JlYXRlRWRpdFJlbmRlcigpLFxyXG4gICAgcmVuZGVyRWRpdDogY3JlYXRlRWRpdFJlbmRlcigpLFxyXG4gICAgcmVuZGVyRmlsdGVyOiBjcmVhdGVGaWx0ZXJSZW5kZXIoKSxcclxuICAgIGZpbHRlck1ldGhvZDogZGVmYXVsdEZpbHRlck1ldGhvZCxcclxuICAgIHJlbmRlckl0ZW06IGNyZWF0ZUZvcm1JdGVtUmVuZGVyKClcclxuICB9LFxyXG4gIElucHV0TnVtYmVyOiB7XHJcbiAgICBhdXRvZm9jdXM6ICdpbnB1dC5pdnUtaW5wdXQtbnVtYmVyLWlucHV0JyxcclxuICAgIHJlbmRlckRlZmF1bHQ6IGNyZWF0ZUVkaXRSZW5kZXIoKSxcclxuICAgIHJlbmRlckVkaXQ6IGNyZWF0ZUVkaXRSZW5kZXIoKSxcclxuICAgIHJlbmRlckZpbHRlcjogY3JlYXRlRmlsdGVyUmVuZGVyKCksXHJcbiAgICBmaWx0ZXJNZXRob2Q6IGRlZmF1bHRGaWx0ZXJNZXRob2QsXHJcbiAgICByZW5kZXJJdGVtOiBjcmVhdGVGb3JtSXRlbVJlbmRlcigpXHJcbiAgfSxcclxuICBTZWxlY3Q6IHtcclxuICAgIHJlbmRlckVkaXQgKGg6IENyZWF0ZUVsZW1lbnQsIHJlbmRlck9wdHM6IEVkaXRSZW5kZXJPcHRpb25zLCBwYXJhbXM6IEVkaXRSZW5kZXJQYXJhbXMpIHtcclxuICAgICAgY29uc3QgeyBvcHRpb25zID0gW10sIG9wdGlvbkdyb3Vwcywgb3B0aW9uUHJvcHMgPSB7fSwgb3B0aW9uR3JvdXBQcm9wcyA9IHt9IH0gPSByZW5kZXJPcHRzXHJcbiAgICAgIGNvbnN0IHsgcm93LCBjb2x1bW4gfSA9IHBhcmFtc1xyXG4gICAgICBjb25zdCB7IGF0dHJzIH0gPSByZW5kZXJPcHRzXHJcbiAgICAgIGNvbnN0IGNlbGxWYWx1ZSA9IFhFVXRpbHMuZ2V0KHJvdywgY29sdW1uLnByb3BlcnR5KVxyXG4gICAgICBjb25zdCBwcm9wcyA9IGdldENlbGxFZGl0RmlsdGVyUHJvcHMocmVuZGVyT3B0cywgcGFyYW1zLCBjZWxsVmFsdWUpXHJcbiAgICAgIGNvbnN0IG9uID0gZ2V0RWRpdE9ucyhyZW5kZXJPcHRzLCBwYXJhbXMpXHJcbiAgICAgIGlmIChvcHRpb25Hcm91cHMpIHtcclxuICAgICAgICBjb25zdCBncm91cE9wdGlvbnMgPSBvcHRpb25Hcm91cFByb3BzLm9wdGlvbnMgfHwgJ29wdGlvbnMnXHJcbiAgICAgICAgY29uc3QgZ3JvdXBMYWJlbCA9IG9wdGlvbkdyb3VwUHJvcHMubGFiZWwgfHwgJ2xhYmVsJ1xyXG4gICAgICAgIHJldHVybiBbXHJcbiAgICAgICAgICBoKCdTZWxlY3QnLCB7XHJcbiAgICAgICAgICAgIGF0dHJzLFxyXG4gICAgICAgICAgICBwcm9wcyxcclxuICAgICAgICAgICAgb25cclxuICAgICAgICAgIH0sIFhFVXRpbHMubWFwKG9wdGlvbkdyb3VwcywgKGdyb3VwOiBhbnksIGdJbmRleDogbnVtYmVyKSA9PiB7XHJcbiAgICAgICAgICAgIHJldHVybiBoKCdPcHRpb25Hcm91cCcsIHtcclxuICAgICAgICAgICAgICBwcm9wczoge1xyXG4gICAgICAgICAgICAgICAgbGFiZWw6IGdyb3VwW2dyb3VwTGFiZWxdXHJcbiAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICBrZXk6IGdJbmRleFxyXG4gICAgICAgICAgICB9LCByZW5kZXJPcHRpb25zKGgsIGdyb3VwW2dyb3VwT3B0aW9uc10sIG9wdGlvblByb3BzKSlcclxuICAgICAgICAgIH0pKVxyXG4gICAgICAgIF1cclxuICAgICAgfVxyXG4gICAgICByZXR1cm4gW1xyXG4gICAgICAgIGgoJ1NlbGVjdCcsIHtcclxuICAgICAgICAgIGF0dHJzLFxyXG4gICAgICAgICAgcHJvcHMsXHJcbiAgICAgICAgICBvblxyXG4gICAgICAgIH0sIHJlbmRlck9wdGlvbnMoaCwgb3B0aW9ucywgb3B0aW9uUHJvcHMpKVxyXG4gICAgICBdXHJcbiAgICB9LFxyXG4gICAgcmVuZGVyQ2VsbCAoaDogQ3JlYXRlRWxlbWVudCwgcmVuZGVyT3B0czogQ2VsbFJlbmRlck9wdGlvbnMsIHBhcmFtczogQ2VsbFJlbmRlclBhcmFtcykge1xyXG4gICAgICByZXR1cm4gY2VsbFRleHQoaCwgZ2V0U2VsZWN0Q2VsbFZhbHVlKHJlbmRlck9wdHMsIHBhcmFtcykpXHJcbiAgICB9LFxyXG4gICAgcmVuZGVyRmlsdGVyIChoOiBDcmVhdGVFbGVtZW50LCByZW5kZXJPcHRzOiBGaWx0ZXJSZW5kZXJPcHRpb25zLCBwYXJhbXM6IEZpbHRlclJlbmRlclBhcmFtcykge1xyXG4gICAgICBjb25zdCB7IG9wdGlvbnMgPSBbXSwgb3B0aW9uR3JvdXBzLCBvcHRpb25Qcm9wcyA9IHt9LCBvcHRpb25Hcm91cFByb3BzID0ge30gfSA9IHJlbmRlck9wdHNcclxuICAgICAgY29uc3QgeyBjb2x1bW4gfSA9IHBhcmFtc1xyXG4gICAgICBjb25zdCB7IGF0dHJzIH0gPSByZW5kZXJPcHRzXHJcbiAgICAgIGlmIChvcHRpb25Hcm91cHMpIHtcclxuICAgICAgICBjb25zdCBncm91cE9wdGlvbnMgPSBvcHRpb25Hcm91cFByb3BzLm9wdGlvbnMgfHwgJ29wdGlvbnMnXHJcbiAgICAgICAgY29uc3QgZ3JvdXBMYWJlbCA9IG9wdGlvbkdyb3VwUHJvcHMubGFiZWwgfHwgJ2xhYmVsJ1xyXG4gICAgICAgIHJldHVybiBjb2x1bW4uZmlsdGVycy5tYXAoKG9wdGlvbiwgb0luZGV4KSA9PiB7XHJcbiAgICAgICAgICBjb25zdCBvcHRpb25WYWx1ZSA9IG9wdGlvbi5kYXRhXHJcbiAgICAgICAgICByZXR1cm4gaCgnU2VsZWN0Jywge1xyXG4gICAgICAgICAgICBrZXk6IG9JbmRleCxcclxuICAgICAgICAgICAgYXR0cnMsXHJcbiAgICAgICAgICAgIHByb3BzOiBnZXRDZWxsRWRpdEZpbHRlclByb3BzKHJlbmRlck9wdHMsIHBhcmFtcywgb3B0aW9uVmFsdWUpLFxyXG4gICAgICAgICAgICBvbjogZ2V0RmlsdGVyT25zKHJlbmRlck9wdHMsIHBhcmFtcywgb3B0aW9uLCAoKSA9PiB7XHJcbiAgICAgICAgICAgICAgLy8g5aSE55CGIGNoYW5nZSDkuovku7bnm7jlhbPpgLvovpFcclxuICAgICAgICAgICAgICBoYW5kbGVDb25maXJtRmlsdGVyKHBhcmFtcywgb3B0aW9uLmRhdGEgJiYgb3B0aW9uLmRhdGEubGVuZ3RoID4gMCwgb3B0aW9uKVxyXG4gICAgICAgICAgICB9KVxyXG4gICAgICAgICAgfSwgWEVVdGlscy5tYXAob3B0aW9uR3JvdXBzLCAoZ3JvdXAsIGdJbmRleCkgPT4ge1xyXG4gICAgICAgICAgICByZXR1cm4gaCgnT3B0aW9uR3JvdXAnLCB7XHJcbiAgICAgICAgICAgICAga2V5OiBnSW5kZXgsXHJcbiAgICAgICAgICAgICAgcHJvcHM6IHtcclxuICAgICAgICAgICAgICAgIGxhYmVsOiBncm91cFtncm91cExhYmVsXVxyXG4gICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSwgcmVuZGVyT3B0aW9ucyhoLCBncm91cFtncm91cE9wdGlvbnNdLCBvcHRpb25Qcm9wcykpXHJcbiAgICAgICAgICB9KSlcclxuICAgICAgICB9KVxyXG4gICAgICB9XHJcbiAgICAgIHJldHVybiBjb2x1bW4uZmlsdGVycy5tYXAoKG9wdGlvbiwgb0luZGV4KSA9PiB7XHJcbiAgICAgICAgY29uc3Qgb3B0aW9uVmFsdWUgPSBvcHRpb24uZGF0YVxyXG4gICAgICAgIHJldHVybiBoKCdTZWxlY3QnLCB7XHJcbiAgICAgICAgICBrZXk6IG9JbmRleCxcclxuICAgICAgICAgIGF0dHJzLFxyXG4gICAgICAgICAgcHJvcHM6IGdldENlbGxFZGl0RmlsdGVyUHJvcHMocmVuZGVyT3B0cywgcGFyYW1zLCBvcHRpb25WYWx1ZSksXHJcbiAgICAgICAgICBvbjogZ2V0RmlsdGVyT25zKHJlbmRlck9wdHMsIHBhcmFtcywgb3B0aW9uLCAoKSA9PiB7XHJcbiAgICAgICAgICAgIC8vIOWkhOeQhiBjaGFuZ2Ug5LqL5Lu255u45YWz6YC76L6RXHJcbiAgICAgICAgICAgIGhhbmRsZUNvbmZpcm1GaWx0ZXIocGFyYW1zLCBvcHRpb24uZGF0YSAmJiBvcHRpb24uZGF0YS5sZW5ndGggPiAwLCBvcHRpb24pXHJcbiAgICAgICAgICB9KVxyXG4gICAgICAgIH0sIHJlbmRlck9wdGlvbnMoaCwgb3B0aW9ucywgb3B0aW9uUHJvcHMpKVxyXG4gICAgICB9KVxyXG4gICAgfSxcclxuICAgIGZpbHRlck1ldGhvZCAocGFyYW1zOiBGaWx0ZXJNZXRob2RQYXJhbXMpIHtcclxuICAgICAgY29uc3QgeyBvcHRpb24sIHJvdywgY29sdW1uIH0gPSBwYXJhbXNcclxuICAgICAgY29uc3QgeyBkYXRhIH0gPSBvcHRpb25cclxuICAgICAgY29uc3QgeyBwcm9wZXJ0eSwgZmlsdGVyUmVuZGVyOiByZW5kZXJPcHRzIH0gPSBjb2x1bW5cclxuICAgICAgY29uc3QgeyBwcm9wcyA9IHt9IH0gPSByZW5kZXJPcHRzXHJcbiAgICAgIGNvbnN0IGNlbGxWYWx1ZSA9IFhFVXRpbHMuZ2V0KHJvdywgcHJvcGVydHkpXHJcbiAgICAgIGlmIChwcm9wcy5tdWx0aXBsZSkge1xyXG4gICAgICAgIGlmIChYRVV0aWxzLmlzQXJyYXkoY2VsbFZhbHVlKSkge1xyXG4gICAgICAgICAgcmV0dXJuIFhFVXRpbHMuaW5jbHVkZUFycmF5cyhjZWxsVmFsdWUsIGRhdGEpXHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBkYXRhLmluZGV4T2YoY2VsbFZhbHVlKSA+IC0xXHJcbiAgICAgIH1cclxuICAgICAgLyogZXNsaW50LWRpc2FibGUgZXFlcWVxICovXHJcbiAgICAgIHJldHVybiBjZWxsVmFsdWUgPT0gZGF0YVxyXG4gICAgfSxcclxuICAgIHJlbmRlckl0ZW0gKGg6IENyZWF0ZUVsZW1lbnQsIHJlbmRlck9wdHM6IEl0ZW1SZW5kZXJPcHRpb25zLCBwYXJhbXM6IEl0ZW1SZW5kZXJQYXJhbXMpIHtcclxuICAgICAgY29uc3QgeyBvcHRpb25zID0gW10sIG9wdGlvbkdyb3Vwcywgb3B0aW9uUHJvcHMgPSB7fSwgb3B0aW9uR3JvdXBQcm9wcyA9IHt9IH0gPSByZW5kZXJPcHRzXHJcbiAgICAgIGNvbnN0IHsgZGF0YSwgcHJvcGVydHkgfSA9IHBhcmFtc1xyXG4gICAgICBjb25zdCB7IGF0dHJzIH0gPSByZW5kZXJPcHRzXHJcbiAgICAgIGNvbnN0IGl0ZW1WYWx1ZSA9IFhFVXRpbHMuZ2V0KGRhdGEsIHByb3BlcnR5KVxyXG4gICAgICBjb25zdCBwcm9wcyA9IGdldEl0ZW1Qcm9wcyhyZW5kZXJPcHRzLCBwYXJhbXMsIGl0ZW1WYWx1ZSlcclxuICAgICAgY29uc3Qgb24gPSBnZXRJdGVtT25zKHJlbmRlck9wdHMsIHBhcmFtcylcclxuICAgICAgaWYgKG9wdGlvbkdyb3Vwcykge1xyXG4gICAgICAgIGNvbnN0IGdyb3VwT3B0aW9ucyA9IG9wdGlvbkdyb3VwUHJvcHMub3B0aW9ucyB8fCAnb3B0aW9ucydcclxuICAgICAgICBjb25zdCBncm91cExhYmVsID0gb3B0aW9uR3JvdXBQcm9wcy5sYWJlbCB8fCAnbGFiZWwnXHJcbiAgICAgICAgcmV0dXJuIFtcclxuICAgICAgICAgIGgoJ1NlbGVjdCcsIHtcclxuICAgICAgICAgICAgcHJvcHMsXHJcbiAgICAgICAgICAgIGF0dHJzLFxyXG4gICAgICAgICAgICBvblxyXG4gICAgICAgICAgfSwgWEVVdGlscy5tYXAob3B0aW9uR3JvdXBzLCAoZ3JvdXAsIGdJbmRleCkgPT4ge1xyXG4gICAgICAgICAgICByZXR1cm4gaCgnT3B0aW9uR3JvdXAnLCB7XHJcbiAgICAgICAgICAgICAga2V5OiBnSW5kZXgsXHJcbiAgICAgICAgICAgICAgcHJvcHM6IHtcclxuICAgICAgICAgICAgICAgIGxhYmVsOiBncm91cFtncm91cExhYmVsXVxyXG4gICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSwgcmVuZGVyT3B0aW9ucyhoLCBncm91cFtncm91cE9wdGlvbnNdLCBvcHRpb25Qcm9wcykpXHJcbiAgICAgICAgICB9KSlcclxuICAgICAgICBdXHJcbiAgICAgIH1cclxuICAgICAgcmV0dXJuIFtcclxuICAgICAgICBoKCdTZWxlY3QnLCB7XHJcbiAgICAgICAgICBwcm9wcyxcclxuICAgICAgICAgIGF0dHJzLFxyXG4gICAgICAgICAgb25cclxuICAgICAgICB9LCByZW5kZXJPcHRpb25zKGgsIG9wdGlvbnMsIG9wdGlvblByb3BzKSlcclxuICAgICAgXVxyXG4gICAgfSxcclxuICAgIGNlbGxFeHBvcnRNZXRob2Q6IGNyZWF0ZUV4cG9ydE1ldGhvZChnZXRTZWxlY3RDZWxsVmFsdWUpLFxyXG4gICAgZWRpdENlbGxFeHBvcnRNZXRob2Q6IGNyZWF0ZUV4cG9ydE1ldGhvZChnZXRTZWxlY3RDZWxsVmFsdWUsIHRydWUpXHJcbiAgfSxcclxuICBDYXNjYWRlcjoge1xyXG4gICAgcmVuZGVyRWRpdDogY3JlYXRlRWRpdFJlbmRlcih7IHRyYW5zZmVyOiB0cnVlIH0pLFxyXG4gICAgcmVuZGVyQ2VsbCAoaDogQ3JlYXRlRWxlbWVudCwgcmVuZGVyT3B0czogQ2VsbFJlbmRlck9wdGlvbnMsIHBhcmFtczogRWRpdFJlbmRlclBhcmFtcykge1xyXG4gICAgICByZXR1cm4gY2VsbFRleHQoaCwgZ2V0Q2FzY2FkZXJDZWxsVmFsdWUocmVuZGVyT3B0cywgcGFyYW1zKSlcclxuICAgIH0sXHJcbiAgICByZW5kZXJJdGVtOiBjcmVhdGVGb3JtSXRlbVJlbmRlcigpLFxyXG4gICAgY2VsbEV4cG9ydE1ldGhvZDogY3JlYXRlRXhwb3J0TWV0aG9kKGdldENhc2NhZGVyQ2VsbFZhbHVlKSxcclxuICAgIGVkaXRDZWxsRXhwb3J0TWV0aG9kOiBjcmVhdGVFeHBvcnRNZXRob2QoZ2V0Q2FzY2FkZXJDZWxsVmFsdWUsIHRydWUpXHJcbiAgfSxcclxuICBEYXRlUGlja2VyOiB7XHJcbiAgICByZW5kZXJFZGl0OiBjcmVhdGVFZGl0UmVuZGVyKHsgdHJhbnNmZXI6IHRydWUgfSksXHJcbiAgICByZW5kZXJDZWxsIChoOiBDcmVhdGVFbGVtZW50LCByZW5kZXJPcHRzOiBDZWxsUmVuZGVyT3B0aW9ucywgcGFyYW1zOiBFZGl0UmVuZGVyUGFyYW1zKSB7XHJcbiAgICAgIHJldHVybiBjZWxsVGV4dChoLCBnZXREYXRlUGlja2VyQ2VsbFZhbHVlKHJlbmRlck9wdHMsIHBhcmFtcykpXHJcbiAgICB9LFxyXG4gICAgcmVuZGVyRmlsdGVyIChoOiBDcmVhdGVFbGVtZW50LCByZW5kZXJPcHRzOiBGaWx0ZXJSZW5kZXJPcHRpb25zLCBwYXJhbXM6IEZpbHRlclJlbmRlclBhcmFtcykge1xyXG4gICAgICBjb25zdCB7IGNvbHVtbiB9ID0gcGFyYW1zXHJcbiAgICAgIGNvbnN0IHsgYXR0cnMgfSA9IHJlbmRlck9wdHNcclxuICAgICAgcmV0dXJuIGNvbHVtbi5maWx0ZXJzLm1hcCgob3B0aW9uLCBvSW5kZXgpID0+IHtcclxuICAgICAgICBjb25zdCBvcHRpb25WYWx1ZSA9IG9wdGlvbi5kYXRhXHJcbiAgICAgICAgcmV0dXJuIGgocmVuZGVyT3B0cy5uYW1lLCB7XHJcbiAgICAgICAgICBrZXk6IG9JbmRleCxcclxuICAgICAgICAgIGF0dHJzLFxyXG4gICAgICAgICAgcHJvcHM6IGdldENlbGxFZGl0RmlsdGVyUHJvcHMocmVuZGVyT3B0cywgcGFyYW1zLCBvcHRpb25WYWx1ZSksXHJcbiAgICAgICAgICBvbjogZ2V0RmlsdGVyT25zKHJlbmRlck9wdHMsIHBhcmFtcywgb3B0aW9uLCAoKSA9PiB7XHJcbiAgICAgICAgICAgIC8vIOWkhOeQhiBjaGFuZ2Ug5LqL5Lu255u45YWz6YC76L6RXHJcbiAgICAgICAgICAgIGhhbmRsZUNvbmZpcm1GaWx0ZXIocGFyYW1zLCAhIW9wdGlvbi5kYXRhLCBvcHRpb24pXHJcbiAgICAgICAgICB9KVxyXG4gICAgICAgIH0pXHJcbiAgICAgIH0pXHJcbiAgICB9LFxyXG4gICAgZmlsdGVyTWV0aG9kIChwYXJhbXM6IEZpbHRlck1ldGhvZFBhcmFtcykge1xyXG4gICAgICBjb25zdCB7IG9wdGlvbiwgcm93LCBjb2x1bW4gfSA9IHBhcmFtc1xyXG4gICAgICBjb25zdCB7IGRhdGEgfSA9IG9wdGlvblxyXG4gICAgICBjb25zdCB7IGZpbHRlclJlbmRlcjogcmVuZGVyT3B0cyB9ID0gY29sdW1uXHJcbiAgICAgIGNvbnN0IHsgcHJvcHMgPSB7fSB9ID0gcmVuZGVyT3B0c1xyXG4gICAgICBjb25zdCBjZWxsVmFsdWUgPSBYRVV0aWxzLmdldChyb3csIGNvbHVtbi5wcm9wZXJ0eSlcclxuICAgICAgaWYgKGRhdGEpIHtcclxuICAgICAgICBzd2l0Y2ggKHByb3BzLnR5cGUpIHtcclxuICAgICAgICAgIGNhc2UgJ2RhdGVyYW5nZSc6XHJcbiAgICAgICAgICAgIHJldHVybiBlcXVhbERhdGVyYW5nZShjZWxsVmFsdWUsIGRhdGEsIHByb3BzLCAneXl5eS1NTS1kZCcpXHJcbiAgICAgICAgICBjYXNlICdkYXRldGltZXJhbmdlJzpcclxuICAgICAgICAgICAgcmV0dXJuIGVxdWFsRGF0ZXJhbmdlKGNlbGxWYWx1ZSwgZGF0YSwgcHJvcHMsICd5eXl5LU1NLWRkIEhIOnNzOm1tJylcclxuICAgICAgICAgIGRlZmF1bHQ6XHJcbiAgICAgICAgICAgIHJldHVybiBjZWxsVmFsdWUgPT09IGRhdGFcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgICAgcmV0dXJuIGZhbHNlXHJcbiAgICB9LFxyXG4gICAgcmVuZGVySXRlbTogY3JlYXRlRm9ybUl0ZW1SZW5kZXIoKSxcclxuICAgIGNlbGxFeHBvcnRNZXRob2Q6IGNyZWF0ZUV4cG9ydE1ldGhvZChnZXREYXRlUGlja2VyQ2VsbFZhbHVlKSxcclxuICAgIGVkaXRDZWxsRXhwb3J0TWV0aG9kOiBjcmVhdGVFeHBvcnRNZXRob2QoZ2V0RGF0ZVBpY2tlckNlbGxWYWx1ZSwgdHJ1ZSlcclxuICB9LFxyXG4gIFRpbWVQaWNrZXI6IHtcclxuICAgIHJlbmRlckVkaXQ6IGNyZWF0ZUVkaXRSZW5kZXIoeyB0cmFuc2ZlcjogdHJ1ZSB9KSxcclxuICAgIHJlbmRlckl0ZW06IGNyZWF0ZUZvcm1JdGVtUmVuZGVyKClcclxuICB9LFxyXG4gIFJhdGU6IHtcclxuICAgIHJlbmRlckRlZmF1bHQ6IGNyZWF0ZUVkaXRSZW5kZXIoKSxcclxuICAgIHJlbmRlckVkaXQ6IGNyZWF0ZUVkaXRSZW5kZXIoKSxcclxuICAgIHJlbmRlckZpbHRlcjogY3JlYXRlRmlsdGVyUmVuZGVyKCksXHJcbiAgICBmaWx0ZXJNZXRob2Q6IGRlZmF1bHRGaWx0ZXJNZXRob2QsXHJcbiAgICByZW5kZXJJdGVtOiBjcmVhdGVGb3JtSXRlbVJlbmRlcigpXHJcbiAgfSxcclxuICBpU3dpdGNoOiB7XHJcbiAgICByZW5kZXJEZWZhdWx0OiBjcmVhdGVFZGl0UmVuZGVyKCksXHJcbiAgICByZW5kZXJFZGl0OiBjcmVhdGVFZGl0UmVuZGVyKCksXHJcbiAgICByZW5kZXJGaWx0ZXIgKGg6IENyZWF0ZUVsZW1lbnQsIHJlbmRlck9wdHM6IEZpbHRlclJlbmRlck9wdGlvbnMsIHBhcmFtczogRmlsdGVyUmVuZGVyUGFyYW1zKSB7XHJcbiAgICAgIGNvbnN0IHsgY29sdW1uIH0gPSBwYXJhbXNcclxuICAgICAgY29uc3QgeyBuYW1lLCBhdHRycyB9ID0gcmVuZGVyT3B0c1xyXG4gICAgICByZXR1cm4gY29sdW1uLmZpbHRlcnMubWFwKChvcHRpb246IGFueSwgb0luZGV4OiBudW1iZXIpID0+IHtcclxuICAgICAgICBjb25zdCBvcHRpb25WYWx1ZSA9IG9wdGlvbi5kYXRhXHJcbiAgICAgICAgcmV0dXJuIGgobmFtZSwge1xyXG4gICAgICAgICAga2V5OiBvSW5kZXgsXHJcbiAgICAgICAgICBhdHRycyxcclxuICAgICAgICAgIHByb3BzOiBnZXRDZWxsRWRpdEZpbHRlclByb3BzKHJlbmRlck9wdHMsIHBhcmFtcywgb3B0aW9uVmFsdWUpLFxyXG4gICAgICAgICAgb246IGdldEZpbHRlck9ucyhyZW5kZXJPcHRzLCBwYXJhbXMsIG9wdGlvbiwgKCkgPT4ge1xyXG4gICAgICAgICAgICAvLyDlpITnkIYgY2hhbmdlIOS6i+S7tuebuOWFs+mAu+i+kVxyXG4gICAgICAgICAgICBoYW5kbGVDb25maXJtRmlsdGVyKHBhcmFtcywgWEVVdGlscy5pc0Jvb2xlYW4ob3B0aW9uLmRhdGEpLCBvcHRpb24pXHJcbiAgICAgICAgICB9KVxyXG4gICAgICAgIH0pXHJcbiAgICAgIH0pXHJcbiAgICB9LFxyXG4gICAgZmlsdGVyTWV0aG9kOiBkZWZhdWx0RmlsdGVyTWV0aG9kLFxyXG4gICAgcmVuZGVySXRlbTogY3JlYXRlRm9ybUl0ZW1SZW5kZXIoKVxyXG4gIH0sXHJcbiAgUmFkaW86IHtcclxuICAgIHJlbmRlckl0ZW06IGNyZWF0ZUZvcm1JdGVtUmFkaW9BbmRDaGVja2JveFJlbmRlcigpXHJcbiAgfSxcclxuICBDaGVja2JveDoge1xyXG4gICAgcmVuZGVySXRlbTogY3JlYXRlRm9ybUl0ZW1SYWRpb0FuZENoZWNrYm94UmVuZGVyKClcclxuICB9LFxyXG4gIEJ1dHRvbjoge1xyXG4gICAgcmVuZGVyRWRpdDogZGVmYXVsdEJ1dHRvbkVkaXRSZW5kZXIsXHJcbiAgICByZW5kZXJEZWZhdWx0OiBkZWZhdWx0QnV0dG9uRWRpdFJlbmRlcixcclxuICAgIHJlbmRlckl0ZW06IGRlZmF1bHRCdXR0b25JdGVtUmVuZGVyXHJcbiAgfSxcclxuICBCdXR0b25zOiB7XHJcbiAgICByZW5kZXJFZGl0OiBkZWZhdWx0QnV0dG9uc0VkaXRSZW5kZXIsXHJcbiAgICByZW5kZXJEZWZhdWx0OiBkZWZhdWx0QnV0dG9uc0VkaXRSZW5kZXIsXHJcbiAgICByZW5kZXJJdGVtOiBkZWZhdWx0QnV0dG9uc0l0ZW1SZW5kZXJcclxuICB9XHJcbn1cclxuXHJcbi8qKlxyXG4gKiDmo4Dmn6Xop6blj5HmupDmmK/lkKblsZ7kuo7nm67moIfoioLngrlcclxuICovXHJcbmZ1bmN0aW9uIGdldEV2ZW50VGFyZ2V0Tm9kZSAoZXZudDogYW55LCBjb250YWluZXI6IEhUTUxFbGVtZW50LCBjbGFzc05hbWU6IHN0cmluZykge1xyXG4gIGxldCB0YXJnZXRFbGVtXHJcbiAgbGV0IHRhcmdldCA9IGV2bnQudGFyZ2V0XHJcbiAgd2hpbGUgKHRhcmdldCAmJiB0YXJnZXQubm9kZVR5cGUgJiYgdGFyZ2V0ICE9PSBkb2N1bWVudCkge1xyXG4gICAgaWYgKGNsYXNzTmFtZSAmJiB0YXJnZXQuY2xhc3NOYW1lICYmIHRhcmdldC5jbGFzc05hbWUuc3BsaXQoJyAnKS5pbmRleE9mKGNsYXNzTmFtZSkgPiAtMSkge1xyXG4gICAgICB0YXJnZXRFbGVtID0gdGFyZ2V0XHJcbiAgICB9IGVsc2UgaWYgKHRhcmdldCA9PT0gY29udGFpbmVyKSB7XHJcbiAgICAgIHJldHVybiB7IGZsYWc6IGNsYXNzTmFtZSA/ICEhdGFyZ2V0RWxlbSA6IHRydWUsIGNvbnRhaW5lciwgdGFyZ2V0RWxlbTogdGFyZ2V0RWxlbSB9XHJcbiAgICB9XHJcbiAgICB0YXJnZXQgPSB0YXJnZXQucGFyZW50Tm9kZVxyXG4gIH1cclxuICByZXR1cm4geyBmbGFnOiBmYWxzZSB9XHJcbn1cclxuXHJcbi8qKlxyXG4gKiDkuovku7blhbzlrrnmgKflpITnkIZcclxuICovXHJcbmZ1bmN0aW9uIGhhbmRsZUNsZWFyRXZlbnQgKHBhcmFtczogVGFibGVSZW5kZXJQYXJhbXMsIGV2bnQ6IGFueSkge1xyXG4gIGNvbnN0IGJvZHlFbGVtOiBIVE1MRWxlbWVudCA9IGRvY3VtZW50LmJvZHlcclxuICBpZiAoXHJcbiAgICAvLyDkuIvmi4nmoYbjgIHml6XmnJ9cclxuICAgIGdldEV2ZW50VGFyZ2V0Tm9kZShldm50LCBib2R5RWxlbSwgJ2l2dS1zZWxlY3QtZHJvcGRvd24nKS5mbGFnXHJcbiAgKSB7XHJcbiAgICByZXR1cm4gZmFsc2VcclxuICB9XHJcbn1cclxuXHJcbi8qKlxyXG4gKiDln7rkuo4gdnhlLXRhYmxlIOihqOagvOeahOmAgumFjeaPkuS7tu+8jOeUqOS6juWFvOWuuSBpdmlldyDnu4Tku7blupNcclxuICovXHJcbmV4cG9ydCBjb25zdCBWWEVUYWJsZVBsdWdpbklWaWV3ID0ge1xyXG4gIGluc3RhbGwgKHsgaW50ZXJjZXB0b3IsIHJlbmRlcmVyIH06IHR5cGVvZiBWWEVUYWJsZSkge1xyXG4gICAgcmVuZGVyZXIubWl4aW4ocmVuZGVyTWFwKVxyXG4gICAgaW50ZXJjZXB0b3IuYWRkKCdldmVudC5jbGVhckZpbHRlcicsIGhhbmRsZUNsZWFyRXZlbnQpXHJcbiAgICBpbnRlcmNlcHRvci5hZGQoJ2V2ZW50LmNsZWFyQWN0aXZlZCcsIGhhbmRsZUNsZWFyRXZlbnQpXHJcbiAgfVxyXG59XHJcblxyXG5pZiAodHlwZW9mIHdpbmRvdyAhPT0gJ3VuZGVmaW5lZCcgJiYgd2luZG93LlZYRVRhYmxlKSB7XHJcbiAgd2luZG93LlZYRVRhYmxlLnVzZShWWEVUYWJsZVBsdWdpbklWaWV3KVxyXG59XHJcblxyXG5leHBvcnQgZGVmYXVsdCBWWEVUYWJsZVBsdWdpbklWaWV3XHJcbiJdfQ==
