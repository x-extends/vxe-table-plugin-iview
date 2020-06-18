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

function getNativeOns(renderOpts, params) {
  var nativeEvents = renderOpts.nativeEvents;
  var nativeOns = {};

  _xeUtils["default"].objectEach(nativeEvents, function (func, key) {
    nativeOns[key] = function () {
      for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }

      func.apply(void 0, [params].concat(args));
    };
  });

  return nativeOns;
}

function getOns(renderOpts, params, inputFunc, changeFunc) {
  var events = renderOpts.events;
  var modelEvent = getModelEvent(renderOpts);
  var changeEvent = getChangeEvent(renderOpts);
  var isSameEvent = changeEvent === modelEvent;
  var ons = {};

  _xeUtils["default"].objectEach(events, function (func, key) {
    ons[key] = function () {
      for (var _len2 = arguments.length, args = new Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
        args[_key2] = arguments[_key2];
      }

      func.apply(void 0, [params].concat(args));
    };
  });

  if (inputFunc) {
    ons[modelEvent] = function (targetEvnt) {
      inputFunc(targetEvnt);

      if (events && events[modelEvent]) {
        events[modelEvent](params, targetEvnt);
      }

      if (isSameEvent && changeFunc) {
        changeFunc(targetEvnt);
      }
    };
  }

  if (!isSameEvent && changeFunc) {
    ons[changeEvent] = function () {
      for (var _len3 = arguments.length, args = new Array(_len3), _key3 = 0; _key3 < _len3; _key3++) {
        args[_key3] = arguments[_key3];
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
      on: getEditOns(renderOpts, params),
      nativeOn: getNativeOns(renderOpts, params)
    })];
  };
}

function defaultButtonEditRender(h, renderOpts, params) {
  var attrs = renderOpts.attrs;
  return [h('Button', {
    attrs: attrs,
    props: getCellEditFilterProps(renderOpts, params, null),
    on: getOns(renderOpts, params),
    nativeOn: getNativeOns(renderOpts, params)
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
    var nativeOn = getNativeOns(renderOpts, params);
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
        }),
        nativeOn: nativeOn
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
      on: getItemOns(renderOpts, params),
      nativeOn: getNativeOns(renderOpts, params)
    })];
  };
}

function defaultButtonItemRender(h, renderOpts, params) {
  var attrs = renderOpts.attrs;
  var props = getItemProps(renderOpts, params, null);
  return [h('Button', {
    attrs: attrs,
    props: props,
    on: getOns(renderOpts, params),
    nativeOn: getNativeOns(renderOpts, params)
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
      on: getItemOns(renderOpts, params),
      nativeOn: getNativeOns(renderOpts, params)
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
      var nativeOn = getNativeOns(renderOpts, params);

      if (optionGroups) {
        var groupOptions = optionGroupProps.options || 'options';
        var groupLabel = optionGroupProps.label || 'label';
        return [h('Select', {
          attrs: attrs,
          props: props,
          on: on,
          nativeOn: nativeOn
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
        on: on,
        nativeOn: nativeOn
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
      var nativeOn = getNativeOns(renderOpts, params);
      return [h('div', {
        "class": 'vxe-table--filter-iview-wrapper'
      }, optionGroups ? column.filters.map(function (option, oIndex) {
        var optionValue = option.data;
        var props = getCellEditFilterProps(renderOpts, params, optionValue);
        return h('Select', {
          key: oIndex,
          attrs: attrs,
          props: props,
          on: getFilterOns(renderOpts, params, option, function () {
            // 处理 change 事件相关逻辑
            handleConfirmFilter(params, props.multiple ? option.data && option.data.length > 0 : !_xeUtils["default"].eqNull(option.data), option);
          }),
          nativeOn: nativeOn
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
        var props = getCellEditFilterProps(renderOpts, params, optionValue);
        return h('Select', {
          key: oIndex,
          attrs: attrs,
          props: props,
          on: getFilterOns(renderOpts, params, option, function () {
            // 处理 change 事件相关逻辑
            handleConfirmFilter(params, props.multiple ? option.data && option.data.length > 0 : !_xeUtils["default"].eqNull(option.data), option);
          }),
          nativeOn: nativeOn
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
      var nativeOn = getNativeOns(renderOpts, params);

      if (optionGroups) {
        var groupOptions = optionGroupProps.options || 'options';
        var groupLabel = optionGroupProps.label || 'label';
        return [h('Select', {
          props: props,
          attrs: attrs,
          on: on,
          nativeOn: nativeOn
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
        on: on,
        nativeOn: nativeOn
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
      var nativeOn = getNativeOns(renderOpts, params);
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
          }),
          nativeOn: nativeOn
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
      var nativeOn = getNativeOns(renderOpts, params);
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
          }),
          nativeOn: nativeOn
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
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImluZGV4LnRzIl0sIm5hbWVzIjpbImlzRW1wdHlWYWx1ZSIsImNlbGxWYWx1ZSIsInVuZGVmaW5lZCIsImdldE1vZGVsUHJvcCIsInJlbmRlck9wdHMiLCJnZXRNb2RlbEV2ZW50IiwiZ2V0Q2hhbmdlRXZlbnQiLCJnZXRGb3JtYXREYXRlIiwidmFsdWUiLCJwcm9wcyIsImRlZmF1bHRGb3JtYXQiLCJYRVV0aWxzIiwidG9EYXRlU3RyaW5nIiwiZm9ybWF0IiwiZ2V0Rm9ybWF0RGF0ZXMiLCJ2YWx1ZXMiLCJzZXBhcmF0b3IiLCJtYXAiLCJkYXRlIiwiam9pbiIsImVxdWFsRGF0ZXJhbmdlIiwiZGF0YSIsImdldENlbGxFZGl0RmlsdGVyUHJvcHMiLCJwYXJhbXMiLCJkZWZhdWx0UHJvcHMiLCJ2U2l6ZSIsIiR0YWJsZSIsImFzc2lnbiIsInNpemUiLCJnZXRJdGVtUHJvcHMiLCIkZm9ybSIsImdldE5hdGl2ZU9ucyIsIm5hdGl2ZUV2ZW50cyIsIm5hdGl2ZU9ucyIsIm9iamVjdEVhY2giLCJmdW5jIiwia2V5IiwiYXJncyIsImdldE9ucyIsImlucHV0RnVuYyIsImNoYW5nZUZ1bmMiLCJldmVudHMiLCJtb2RlbEV2ZW50IiwiY2hhbmdlRXZlbnQiLCJpc1NhbWVFdmVudCIsIm9ucyIsInRhcmdldEV2bnQiLCJnZXRFZGl0T25zIiwicm93IiwiY29sdW1uIiwic2V0IiwicHJvcGVydHkiLCJ1cGRhdGVTdGF0dXMiLCJnZXRGaWx0ZXJPbnMiLCJvcHRpb24iLCJnZXRJdGVtT25zIiwibWF0Y2hDYXNjYWRlckRhdGEiLCJpbmRleCIsImxpc3QiLCJsYWJlbHMiLCJ2YWwiLCJsZW5ndGgiLCJlYWNoIiwiaXRlbSIsInB1c2giLCJsYWJlbCIsImNoaWxkcmVuIiwiZ2V0U2VsZWN0Q2VsbFZhbHVlIiwib3B0aW9ucyIsIm9wdGlvbkdyb3VwcyIsIm9wdGlvblByb3BzIiwib3B0aW9uR3JvdXBQcm9wcyIsImxhYmVsUHJvcCIsInZhbHVlUHJvcCIsImdyb3VwT3B0aW9ucyIsImdldCIsImNvbGlkIiwiaWQiLCJyZXN0IiwiY2VsbERhdGEiLCJmaWx0ZXJhYmxlIiwiZnVsbEFsbERhdGFSb3dNYXAiLCJjYWNoZUNlbGwiLCJoYXMiLCJtdWx0aXBsZSIsInNlbGVjdEl0ZW0iLCJmaW5kIiwiY2VsbExhYmVsIiwiZ2V0Q2FzY2FkZXJDZWxsVmFsdWUiLCJnZXREYXRlUGlja2VyQ2VsbFZhbHVlIiwidHlwZSIsImNyZWF0ZUVkaXRSZW5kZXIiLCJoIiwiYXR0cnMiLCJuYW1lIiwib24iLCJuYXRpdmVPbiIsImRlZmF1bHRCdXR0b25FZGl0UmVuZGVyIiwiY2VsbFRleHQiLCJjb250ZW50IiwiZGVmYXVsdEJ1dHRvbnNFZGl0UmVuZGVyIiwiY2hpbGRSZW5kZXJPcHRzIiwiY3JlYXRlRmlsdGVyUmVuZGVyIiwiZmlsdGVycyIsIm9JbmRleCIsIm9wdGlvblZhbHVlIiwiaGFuZGxlQ29uZmlybUZpbHRlciIsImNoZWNrZWQiLCIkcGFuZWwiLCJjaGFuZ2VPcHRpb24iLCJkZWZhdWx0RmlsdGVyTWV0aG9kIiwicmVuZGVyT3B0aW9ucyIsImRpc2FibGVkUHJvcCIsImRpc2FibGVkIiwiY3JlYXRlRm9ybUl0ZW1SZW5kZXIiLCJpdGVtVmFsdWUiLCJkZWZhdWx0QnV0dG9uSXRlbVJlbmRlciIsImRlZmF1bHRCdXR0b25zSXRlbVJlbmRlciIsImNyZWF0ZUV4cG9ydE1ldGhvZCIsInZhbHVlTWV0aG9kIiwiaXNFZGl0IiwicmVuZGVyUHJvcGVydHkiLCJjcmVhdGVGb3JtSXRlbVJhZGlvQW5kQ2hlY2tib3hSZW5kZXIiLCJyZW5kZXJNYXAiLCJJbnB1dCIsImF1dG9mb2N1cyIsInJlbmRlckRlZmF1bHQiLCJyZW5kZXJFZGl0IiwicmVuZGVyRmlsdGVyIiwiZmlsdGVyTWV0aG9kIiwicmVuZGVySXRlbSIsIkF1dG9Db21wbGV0ZSIsIklucHV0TnVtYmVyIiwiU2VsZWN0IiwiZ3JvdXBMYWJlbCIsImdyb3VwIiwiZ0luZGV4IiwicmVuZGVyQ2VsbCIsImVxTnVsbCIsImZpbHRlclJlbmRlciIsImlzQXJyYXkiLCJpbmNsdWRlQXJyYXlzIiwiaW5kZXhPZiIsImNlbGxFeHBvcnRNZXRob2QiLCJlZGl0Q2VsbEV4cG9ydE1ldGhvZCIsIkNhc2NhZGVyIiwidHJhbnNmZXIiLCJEYXRlUGlja2VyIiwiVGltZVBpY2tlciIsIlJhdGUiLCJpU3dpdGNoIiwiaXNCb29sZWFuIiwiUmFkaW8iLCJDaGVja2JveCIsIkJ1dHRvbiIsIkJ1dHRvbnMiLCJnZXRFdmVudFRhcmdldE5vZGUiLCJldm50IiwiY29udGFpbmVyIiwiY2xhc3NOYW1lIiwidGFyZ2V0RWxlbSIsInRhcmdldCIsIm5vZGVUeXBlIiwiZG9jdW1lbnQiLCJzcGxpdCIsImZsYWciLCJwYXJlbnROb2RlIiwiaGFuZGxlQ2xlYXJFdmVudCIsImUiLCJib2R5RWxlbSIsImJvZHkiLCIkZXZlbnQiLCJWWEVUYWJsZVBsdWdpbklWaWV3IiwiaW5zdGFsbCIsImludGVyY2VwdG9yIiwicmVuZGVyZXIiLCJtaXhpbiIsImFkZCIsIndpbmRvdyIsIlZYRVRhYmxlIiwidXNlIl0sIm1hcHBpbmdzIjoiOzs7Ozs7O0FBRUE7Ozs7OztBQW9CQTtBQUVBLFNBQVNBLFlBQVQsQ0FBdUJDLFNBQXZCLEVBQXFDO0FBQ25DLFNBQU9BLFNBQVMsS0FBSyxJQUFkLElBQXNCQSxTQUFTLEtBQUtDLFNBQXBDLElBQWlERCxTQUFTLEtBQUssRUFBdEU7QUFDRDs7QUFFRCxTQUFTRSxZQUFULENBQXVCQyxVQUF2QixFQUFnRDtBQUM5QyxTQUFPLE9BQVA7QUFDRDs7QUFFRCxTQUFTQyxhQUFULENBQXdCRCxVQUF4QixFQUFpRDtBQUMvQyxTQUFPLE9BQVA7QUFDRDs7QUFFRCxTQUFTRSxjQUFULENBQXlCRixVQUF6QixFQUFrRDtBQUNoRCxTQUFPLFdBQVA7QUFDRDs7QUFFRCxTQUFTRyxhQUFULENBQXdCQyxLQUF4QixFQUFvQ0MsS0FBcEMsRUFBbUVDLGFBQW5FLEVBQXdGO0FBQ3RGLFNBQU9DLG9CQUFRQyxZQUFSLENBQXFCSixLQUFyQixFQUE0QkMs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RztBQUNqQ0MsRUFBQUEsT0FEaUMseUJBQ2tCO0FBQUEsUUFBeENDLFdBQXdDLFFBQXhDQSxXQUF3QztBQUFBLFFBQTNCQyxRQUEyQixRQUEzQkEsUUFBMkI7QUFDakRBLElBQUFBLFFBQVEsQ0FBQ0MsS0FBVCxDQUFlckQsU0FBZjtBQUNBbUQsSUFBQUEsV0FBVyxDQUFDRyxHQUFaLENBQWdCLG1CQUFoQixFQUFxQ1YsZ0JBQXJDO0FBQ0FPLElBQUFBLFdBQVcsQ0FBQ0csR0FBWixDQUFnQixvQkFBaEIsRUFBc0NWLGdCQUF0QztBQUNEO0FBTGdDLENBQTVCOzs7QUFRUCxJQUFJLE9BQU9XLE1BQVAsS0FBa0IsV0FBbEIsSUFBaUNBLE1BQU0sQ0FBQ0MsUUFBNUMsRUFBc0Q7QUFDcERELEVBQUFBLE1BQU0sQ0FBQ0MsUUFBUCxDQUFnQkMsR0FBaEIsQ0FBb0JSLG1CQUFwQjtBQUNEOztlQUVjQSxtQiIsImZpbGUiOiJpbmRleC5jb21tb24uanMiLCJzb3VyY2VzQ29udGVudCI6WyIvKiBlc2xpbnQtZGlzYWJsZSBuby11bnVzZWQtdmFycyAqL1xyXG5pbXBvcnQgeyBDcmVhdGVFbGVtZW50IH0gZnJvbSAndnVlJ1xyXG5pbXBvcnQgWEVVdGlscyBmcm9tICd4ZS11dGlscy9tZXRob2RzL3hlLXV0aWxzJ1xyXG5pbXBvcnQge1xyXG4gIFZYRVRhYmxlLFxyXG4gIFJlbmRlclBhcmFtcyxcclxuICBPcHRpb25Qcm9wcyxcclxuICBJbnRlcmNlcHRvclBhcmFtcyxcclxuICBUYWJsZVJlbmRlclBhcmFtcyxcclxuICBSZW5kZXJPcHRpb25zLFxyXG4gIENvbHVtbkZpbHRlclBhcmFtcyxcclxuICBDb2x1bW5GaWx0ZXJSZW5kZXJPcHRpb25zLFxyXG4gIENvbHVtbkNlbGxSZW5kZXJPcHRpb25zLFxyXG4gIENvbHVtbkVkaXRSZW5kZXJPcHRpb25zLFxyXG4gIENvbHVtbkNlbGxSZW5kZXJQYXJhbXMsXHJcbiAgQ29sdW1uRWRpdFJlbmRlclBhcmFtcyxcclxuICBDb2x1bW5GaWx0ZXJSZW5kZXJQYXJhbXMsXHJcbiAgQ29sdW1uRmlsdGVyTWV0aG9kUGFyYW1zLFxyXG4gIEZvcm1JdGVtUmVuZGVyUGFyYW1zLFxyXG4gIEZvcm1JdGVtUmVuZGVyT3B0aW9ucyxcclxuICBDb2x1bW5FeHBvcnRDZWxsUmVuZGVyUGFyYW1zXHJcbn0gZnJvbSAndnhlLXRhYmxlL2xpYi92eGUtdGFibGUnXHJcbi8qIGVzbGludC1lbmFibGUgbm8tdW51c2VkLXZhcnMgKi9cclxuXHJcbmZ1bmN0aW9uIGlzRW1wdHlWYWx1ZSAoY2VsbFZhbHVlOiBhbnkpIHtcclxuICByZXR1cm4gY2VsbFZhbHVlID09PSBudWxsIHx8IGNlbGxWYWx1ZSA9PT0gdW5kZWZpbmVkIHx8IGNlbGxWYWx1ZSA9PT0gJydcclxufVxyXG5cclxuZnVuY3Rpb24gZ2V0TW9kZWxQcm9wIChyZW5kZXJPcHRzOiBSZW5kZXJPcHRpb25zKSB7XHJcbiAgcmV0dXJuICd2YWx1ZSdcclxufVxyXG5cclxuZnVuY3Rpb24gZ2V0TW9kZWxFdmVudCAocmVuZGVyT3B0czogUmVuZGVyT3B0aW9ucykge1xyXG4gIHJldHVybiAnaW5wdXQnXHJcbn1cclxuXHJcbmZ1bmN0aW9uIGdldENoYW5nZUV2ZW50IChyZW5kZXJPcHRzOiBSZW5kZXJPcHRpb25zKSB7XHJcbiAgcmV0dXJuICdvbi1jaGFuZ2UnXHJcbn1cclxuXHJcbmZ1bmN0aW9uIGdldEZvcm1hdERhdGUgKHZhbHVlOiBhbnksIHByb3BzOiB7IFtrZXk6IHN0cmluZ106IGFueSB9LCBkZWZhdWx0Rm9ybWF0OiBzdHJpbmcpIHtcclxuICByZXR1cm4gWEVVdGlscy50b0RhdGVTdHJpbmcodmFsdWUsIHByb3BzLmZvcm1hdCB8fCBkZWZhdWx0Rm9ybWF0KVxyXG59XHJcblxyXG5mdW5jdGlvbiBnZXRGb3JtYXREYXRlcyAodmFsdWVzOiBhbnksIHByb3BzOiB7IFtrZXk6IHN0cmluZ106IGFueSB9LCBzZXBhcmF0b3I6IHN0cmluZywgZGVmYXVsdEZvcm1hdDogc3RyaW5nKSB7XHJcbiAgcmV0dXJuIFhFVXRpbHMubWFwKHZhbHVlcywgKGRhdGU6IGFueSkgPT4gZ2V0Rm9ybWF0RGF0ZShkYXRlLCBwcm9wcywgZGVmYXVsdEZvcm1hdCkpLmpvaW4oc2VwYXJhdG9yKVxyXG59XHJcblxyXG5mdW5jdGlvbiBlcXVhbERhdGVyYW5nZSAoY2VsbFZhbHVlOiBhbnksIGRhdGE6IGFueSwgcHJvcHM6IHsgW2tleTogc3RyaW5nXTogYW55IH0sIGRlZmF1bHRGb3JtYXQ6IHN0cmluZykge1xyXG4gIGNlbGxWYWx1ZSA9IGdldEZvcm1hdERhdGUoY2VsbFZhbHVlLCBwcm9wcywgZGVmYXVsdEZvcm1hdClcclxuICByZXR1cm4gY2VsbFZhbHVlID49IGdldEZvcm1hdERhdGUoZGF0YVswXSwgcHJvcHMsIGRlZmF1bHRGb3JtYXQpICYmIGNlbGxWYWx1ZSA8PSBnZXRGb3JtYXREYXRlKGRhdGFbMV0sIHByb3BzLCBkZWZhdWx0Rm9ybWF0KVxyXG59XHJcblxyXG5mdW5jdGlvbiBnZXRDZWxsRWRpdEZpbHRlclByb3BzIChyZW5kZXJPcHRzOiBSZW5kZXJPcHRpb25zLCBwYXJhbXM6IFRhYmxlUmVuZGVyUGFyYW1zLCB2YWx1ZTogYW55LCBkZWZhdWx0UHJvcHM/OiB7IFtwcm9wOiBzdHJpbmddOiBhbnkgfSkge1xyXG4gIGNvbnN0IHsgdlNpemUgfSA9IHBhcmFtcy4kdGFibGVcclxuICByZXR1cm4gWEVVdGlscy5hc3NpZ24odlNpemUgPyB7IHNpemU6IHZTaXplIH0gOiB7fSwgZGVmYXVsdFByb3BzLCByZW5kZXJPcHRzLnByb3BzLCB7IFtnZXRNb2RlbFByb3AocmVuZGVyT3B0cyldOiB2YWx1ZSB9KVxyXG59XHJcblxyXG5mdW5jdGlvbiBnZXRJdGVtUHJvcHMgKHJlbmRlck9wdHM6IFJlbmRlck9wdGlvbnMsIHBhcmFtczogRm9ybUl0ZW1SZW5kZXJQYXJhbXMsIHZhbHVlOiBhbnksIGRlZmF1bHRQcm9wcz86IHsgW3Byb3A6IHN0cmluZ106IGFueSB9KSB7XHJcbiAgY29uc3QgeyB2U2l6ZSB9ID0gcGFyYW1zLiRmb3JtXHJcbiAgcmV0dXJuIFhFVXRpbHMuYXNzaWduKHZTaXplID8geyBzaXplOiB2U2l6ZSB9IDoge30sIGRlZmF1bHRQcm9wcywgcmVuZGVyT3B0cy5wcm9wcywgeyBbZ2V0TW9kZWxQcm9wKHJlbmRlck9wdHMpXTogdmFsdWUgfSlcclxufVxyXG5cclxuZnVuY3Rpb24gZ2V0TmF0aXZlT25zIChyZW5kZXJPcHRzOiBSZW5kZXJPcHRpb25zLCBwYXJhbXM6IFJlbmRlclBhcmFtcykge1xyXG4gIGNvbnN0IHsgbmF0aXZlRXZlbnRzIH0gPSByZW5kZXJPcHRzXHJcbiAgY29uc3QgbmF0aXZlT25zOiB7IFt0eXBlOiBzdHJpbmddOiBGdW5jdGlvbiB9ID0ge31cclxuICBYRVV0aWxzLm9iamVjdEVhY2gobmF0aXZlRXZlbnRzLCAoZnVuYzogRnVuY3Rpb24sIGtleTogc3RyaW5nKSA9PiB7XHJcbiAgICBuYXRpdmVPbnNba2V5XSA9IGZ1bmN0aW9uICguLi5hcmdzOiBhbnlbXSkge1xyXG4gICAgICBmdW5jKHBhcmFtcywgLi4uYXJncylcclxuICAgIH1cclxuICB9KVxyXG4gIHJldHVybiBuYXRpdmVPbnNcclxufVxyXG5cclxuZnVuY3Rpb24gZ2V0T25zIChyZW5kZXJPcHRzOiBSZW5kZXJPcHRpb25zLCBwYXJhbXM6IFJlbmRlclBhcmFtcywgaW5wdXRGdW5jPzogRnVuY3Rpb24sIGNoYW5nZUZ1bmM/OiBGdW5jdGlvbikge1xyXG4gIGNvbnN0IHsgZXZlbnRzIH0gPSByZW5kZXJPcHRzXHJcbiAgY29uc3QgbW9kZWxFdmVudCA9IGdldE1vZGVsRXZlbnQocmVuZGVyT3B0cylcclxuICBjb25zdCBjaGFuZ2VFdmVudCA9IGdldENoYW5nZUV2ZW50KHJlbmRlck9wdHMpXHJcbiAgY29uc3QgaXNTYW1lRXZlbnQgPSBjaGFuZ2VFdmVudCA9PT0gbW9kZWxFdmVudFxyXG4gIGNvbnN0IG9uczogeyBbdHlwZTogc3RyaW5nXTogRnVuY3Rpb24gfSA9IHt9XHJcbiAgWEVVdGlscy5vYmplY3RFYWNoKGV2ZW50cywgKGZ1bmM6IEZ1bmN0aW9uLCBrZXk6IHN0cmluZykgPT4ge1xyXG4gICAgb25zW2tleV0gPSBmdW5jdGlvbiAoLi4uYXJnczogYW55W10pIHtcclxuICAgICAgZnVuYyhwYXJhbXMsIC4uLmFyZ3MpXHJcbiAgICB9XHJcbiAgfSlcclxuICBpZiAoaW5wdXRGdW5jKSB7XHJcbiAgICBvbnNbbW9kZWxFdmVudF0gPSBmdW5jdGlvbiAodGFyZ2V0RXZudDogYW55KSB7XHJcbiAgICAgIGlucHV0RnVuYyh0YXJnZXRFdm50KVxyXG4gICAgICBpZiAoZXZlbnRzICYmIGV2ZW50c1ttb2RlbEV2ZW50XSkge1xyXG4gICAgICAgIGV2ZW50c1ttb2RlbEV2ZW50XShwYXJhbXMsIHRhcmdldEV2bnQpXHJcbiAgICAgIH1cclxuICAgICAgaWYgKGlzU2FtZUV2ZW50ICYmIGNoYW5nZUZ1bmMpIHtcclxuICAgICAgICBjaGFuZ2VGdW5jKHRhcmdldEV2bnQpXHJcbiAgICAgIH1cclxuICAgIH1cclxuICB9XHJcbiAgaWYgKCFpc1NhbWVFdmVudCAmJiBjaGFuZ2VGdW5jKSB7XHJcbiAgICBvbnNbY2hhbmdlRXZlbnRdID0gZnVuY3Rpb24gKC4uLmFyZ3M6IGFueVtdKSB7XHJcbiAgICAgIGNoYW5nZUZ1bmMoLi4uYXJncylcclxuICAgICAgaWYgKGV2ZW50cyAmJiBldmVudHNbY2hhbmdlRXZlbnRdKSB7XHJcbiAgICAgICAgZXZlbnRzW2NoYW5nZUV2ZW50XShwYXJhbXMsIC4uLmFyZ3MpXHJcbiAgICAgIH1cclxuICAgIH1cclxuICB9XHJcbiAgcmV0dXJuIG9uc1xyXG59XHJcblxyXG5mdW5jdGlvbiBnZXRFZGl0T25zIChyZW5kZXJPcHRzOiBSZW5kZXJPcHRpb25zLCBwYXJhbXM6IENvbHVtbkVkaXRSZW5kZXJQYXJhbXMpIHtcclxuICBjb25zdCB7ICR0YWJsZSwgcm93LCBjb2x1bW4gfSA9IHBhcmFtc1xyXG4gIHJldHVybiBnZXRPbnMocmVuZGVyT3B0cywgcGFyYW1zLCAodmFsdWU6IGFueSkgPT4ge1xyXG4gICAgLy8g5aSE55CGIG1vZGVsIOWAvOWPjOWQkee7keWumlxyXG4gICAgWEVVdGlscy5zZXQocm93LCBjb2x1bW4ucHJvcGVydHksIHZhbHVlKVxyXG4gIH0sICgpID0+IHtcclxuICAgIC8vIOWkhOeQhiBjaGFuZ2Ug5LqL5Lu255u45YWz6YC76L6RXHJcbiAgICAkdGFibGUudXBkYXRlU3RhdHVzKHBhcmFtcylcclxuICB9KVxyXG59XHJcblxyXG5mdW5jdGlvbiBnZXRGaWx0ZXJPbnMgKHJlbmRlck9wdHM6IFJlbmRlck9wdGlvbnMsIHBhcmFtczogQ29sdW1uRmlsdGVyUmVuZGVyUGFyYW1zLCBvcHRpb246IENvbHVtbkZpbHRlclBhcmFtcywgY2hhbmdlRnVuYzogRnVuY3Rpb24pIHtcclxuICByZXR1cm4gZ2V0T25zKHJlbmRlck9wdHMsIHBhcmFtcywgKHZhbHVlOiBhbnkpID0+IHtcclxuICAgIC8vIOWkhOeQhiBtb2RlbCDlgLzlj4zlkJHnu5HlrppcclxuICAgIG9wdGlvbi5kYXRhID0gdmFsdWVcclxuICB9LCBjaGFuZ2VGdW5jKVxyXG59XHJcblxyXG5mdW5jdGlvbiBnZXRJdGVtT25zIChyZW5kZXJPcHRzOiBSZW5kZXJPcHRpb25zLCBwYXJhbXM6IEZvcm1JdGVtUmVuZGVyUGFyYW1zKSB7XHJcbiAgY29uc3QgeyAkZm9ybSwgZGF0YSwgcHJvcGVydHkgfSA9IHBhcmFtc1xyXG4gIHJldHVybiBnZXRPbnMocmVuZGVyT3B0cywgcGFyYW1zLCAodmFsdWU6IGFueSkgPT4ge1xyXG4gICAgLy8g5aSE55CGIG1vZGVsIOWAvOWPjOWQkee7keWumlxyXG4gICAgWEVVdGlscy5zZXQoZGF0YSwgcHJvcGVydHksIHZhbHVlKVxyXG4gIH0sICgpID0+IHtcclxuICAgIC8vIOWkhOeQhiBjaGFuZ2Ug5LqL5Lu255u45YWz6YC76L6RXHJcbiAgICAkZm9ybS51cGRhdGVTdGF0dXMocGFyYW1zKVxyXG4gIH0pXHJcbn1cclxuXHJcbmZ1bmN0aW9uIG1hdGNoQ2FzY2FkZXJEYXRhIChpbmRleDogbnVtYmVyLCBsaXN0OiBhbnlbXSwgdmFsdWVzOiBhbnlbXSwgbGFiZWxzOiBhbnlbXSkge1xyXG4gIGNvbnN0IHZhbCA9IHZhbHVlc1tpbmRleF1cclxuICBpZiAobGlzdCAmJiB2YWx1ZXMubGVuZ3RoID4gaW5kZXgpIHtcclxuICAgIFhFVXRpbHMuZWFjaChsaXN0LCAoaXRlbSkgPT4ge1xyXG4gICAgICBpZiAoaXRlbS52YWx1ZSA9PT0gdmFsKSB7XHJcbiAgICAgICAgbGFiZWxzLnB1c2goaXRlbS5sYWJlbClcclxuICAgICAgICBtYXRjaENhc2NhZGVyRGF0YSgrK2luZGV4LCBpdGVtLmNoaWxkcmVuLCB2YWx1ZXMsIGxhYmVscylcclxuICAgICAgfVxyXG4gICAgfSlcclxuICB9XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGdldFNlbGVjdENlbGxWYWx1ZSAocmVuZGVyT3B0czogQ29sdW1uQ2VsbFJlbmRlck9wdGlvbnMsIHBhcmFtczogQ29sdW1uQ2VsbFJlbmRlclBhcmFtcykge1xyXG4gIGNvbnN0IHsgb3B0aW9ucyA9IFtdLCBvcHRpb25Hcm91cHMsIHByb3BzID0ge30sIG9wdGlvblByb3BzID0ge30sIG9wdGlvbkdyb3VwUHJvcHMgPSB7fSB9ID0gcmVuZGVyT3B0c1xyXG4gIGNvbnN0IHsgcm93LCBjb2x1bW4gfSA9IHBhcmFtc1xyXG4gIGNvbnN0ICR0YWJsZTogYW55ID0gcGFyYW1zLiR0YWJsZVxyXG4gIGNvbnN0IGxhYmVsUHJvcCA9IG9wdGlvblByb3BzLmxhYmVsIHx8ICdsYWJlbCdcclxuICBjb25zdCB2YWx1ZVByb3AgPSBvcHRpb25Qcm9wcy52YWx1ZSB8fCAndmFsdWUnXHJcbiAgY29uc3QgZ3JvdXBPcHRpb25zID0gb3B0aW9uR3JvdXBQcm9wcy5vcHRpb25zIHx8ICdvcHRpb25zJ1xyXG4gIGNvbnN0IGNlbGxWYWx1ZSA9IFhFVXRpbHMuZ2V0KHJvdywgY29sdW1uLnByb3BlcnR5KVxyXG4gIGNvbnN0IGNvbGlkID0gY29sdW1uLmlkXHJcbiAgbGV0IHJlc3Q6IGFueVxyXG4gIGxldCBjZWxsRGF0YTogYW55XHJcbiAgaWYgKHByb3BzLmZpbHRlcmFibGUpIHtcclxuICAgIGNvbnN0IGZ1bGxBbGxEYXRhUm93TWFwOiBNYXA8YW55LCBhbnk+ID0gJHRhYmxlLmZ1bGxBbGxEYXRhUm93TWFwXHJcbiAgICBjb25zdCBjYWNoZUNlbGwgPSBmdWxsQWxsRGF0YVJvd01hcC5oYXMocm93KVxyXG4gICAgaWYgKGNhY2hlQ2VsbCkge1xyXG4gICAgICByZXN0ID0gZnVsbEFsbERhdGFSb3dNYXAuZ2V0KHJvdylcclxuICAgICAgY2VsbERhdGEgPSByZXN0LmNlbGxEYXRhXHJcbiAgICAgIGlmICghY2VsbERhdGEpIHtcclxuICAgICAgICBjZWxsRGF0YSA9IGZ1bGxBbGxEYXRhUm93TWFwLmdldChyb3cpLmNlbGxEYXRhID0ge31cclxuICAgICAgfVxyXG4gICAgfVxyXG4gICAgaWYgKHJlc3QgJiYgY2VsbERhdGFbY29saWRdICYmIGNlbGxEYXRhW2NvbGlkXS52YWx1ZSA9PT0gY2VsbFZhbHVlKSB7XHJcbiAgICAgIHJldHVybiBjZWxsRGF0YVtjb2xpZF0ubGFiZWxcclxuICAgIH1cclxuICB9XHJcbiAgaWYgKCFpc0VtcHR5VmFsdWUoY2VsbFZhbHVlKSkge1xyXG4gICAgcmV0dXJuIFhFVXRpbHMubWFwKHByb3BzLm11bHRpcGxlID8gY2VsbFZhbHVlIDogW2NlbGxWYWx1ZV0sIG9wdGlvbkdyb3VwcyA/ICh2YWx1ZSkgPT4ge1xyXG4gICAgICBsZXQgc2VsZWN0SXRlbVxyXG4gICAgICBmb3IgKGxldCBpbmRleCA9IDA7IGluZGV4IDwgb3B0aW9uR3JvdXBzLmxlbmd0aDsgaW5kZXgrKykge1xyXG4gICAgICAgIHNlbGVjdEl0ZW0gPSBYRVV0aWxzLmZpbmQob3B0aW9uR3JvdXBzW2luZGV4XVtncm91cE9wdGlvbnNdLCAoaXRlbSkgPT4gaXRlbVt2YWx1ZVByb3BdID09PSB2YWx1ZSlcclxuICAgICAgICBpZiAoc2VsZWN0SXRlbSkge1xyXG4gICAgICAgICAgYnJlYWtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgICAgY29uc3QgY2VsbExhYmVsOiBhbnkgPSBzZWxlY3RJdGVtID8gc2VsZWN0SXRlbVtsYWJlbFByb3BdIDogdmFsdWVcclxuICAgICAgaWYgKGNlbGxEYXRhICYmIG9wdGlvbnMgJiYgb3B0aW9ucy5sZW5ndGgpIHtcclxuICAgICAgICBjZWxsRGF0YVtjb2xpZF0gPSB7IHZhbHVlOiBjZWxsVmFsdWUsIGxhYmVsOiBjZWxsTGFiZWwgfVxyXG4gICAgICB9XHJcbiAgICAgIHJldHVybiBjZWxsTGFiZWxcclxuICAgIH0gOiAodmFsdWUpID0+IHtcclxuICAgICAgY29uc3Qgc2VsZWN0SXRlbSA9IFhFVXRpbHMuZmluZChvcHRpb25zLCAoaXRlbSkgPT4gaXRlbVt2YWx1ZVByb3BdID09PSB2YWx1ZSlcclxuICAgICAgY29uc3QgY2VsbExhYmVsOiBhbnkgPSBzZWxlY3RJdGVtID8gc2VsZWN0SXRlbVtsYWJlbFByb3BdIDogdmFsdWVcclxuICAgICAgaWYgKGNlbGxEYXRhICYmIG9wdGlvbnMgJiYgb3B0aW9ucy5sZW5ndGgpIHtcclxuICAgICAgICBjZWxsRGF0YVtjb2xpZF0gPSB7IHZhbHVlOiBjZWxsVmFsdWUsIGxhYmVsOiBjZWxsTGFiZWwgfVxyXG4gICAgICB9XHJcbiAgICAgIHJldHVybiBjZWxsTGFiZWxcclxuICAgIH0pLmpvaW4oJywgJylcclxuICB9XHJcbiAgcmV0dXJuIG51bGxcclxufVxyXG5cclxuZnVuY3Rpb24gZ2V0Q2FzY2FkZXJDZWxsVmFsdWUgKHJlbmRlck9wdHM6IFJlbmRlck9wdGlvbnMsIHBhcmFtczogQ29sdW1uQ2VsbFJlbmRlclBhcmFtcykge1xyXG4gIGNvbnN0IHsgcHJvcHMgPSB7fSB9ID0gcmVuZGVyT3B0c1xyXG4gIGNvbnN0IHsgcm93LCBjb2x1bW4gfSA9IHBhcmFtc1xyXG4gIGNvbnN0IGNlbGxWYWx1ZSA9IFhFVXRpbHMuZ2V0KHJvdywgY29sdW1uLnByb3BlcnR5KVxyXG4gIGNvbnN0IHZhbHVlczogYW55W10gPSBjZWxsVmFsdWUgfHwgW11cclxuICBjb25zdCBsYWJlbHM6IGFueVtdID0gW11cclxuICBtYXRjaENhc2NhZGVyRGF0YSgwLCBwcm9wcy5kYXRhLCB2YWx1ZXMsIGxhYmVscylcclxuICByZXR1cm4gbGFiZWxzLmpvaW4oYCAke3Byb3BzLnNlcGFyYXRvciB8fCAnLyd9IGApXHJcbn1cclxuXHJcbmZ1bmN0aW9uIGdldERhdGVQaWNrZXJDZWxsVmFsdWUgKHJlbmRlck9wdHM6IFJlbmRlck9wdGlvbnMsIHBhcmFtczogQ29sdW1uQ2VsbFJlbmRlclBhcmFtcykge1xyXG4gIGNvbnN0IHsgcHJvcHMgPSB7fSB9ID0gcmVuZGVyT3B0c1xyXG4gIGNvbnN0IHsgcm93LCBjb2x1bW4gfSA9IHBhcmFtc1xyXG4gIGNvbnN0IHsgc2VwYXJhdG9yIH0gPSBwcm9wc1xyXG4gIGxldCBjZWxsVmFsdWUgPSBYRVV0aWxzLmdldChyb3csIGNvbHVtbi5wcm9wZXJ0eSlcclxuICBzd2l0Y2ggKHByb3BzLnR5cGUpIHtcclxuICAgIGNhc2UgJ3dlZWsnOlxyXG4gICAgICBjZWxsVmFsdWUgPSBnZXRGb3JtYXREYXRlKGNlbGxWYWx1ZSwgcHJvcHMsICd5eXl5d1dXJylcclxuICAgICAgYnJlYWtcclxuICAgIGNhc2UgJ21vbnRoJzpcclxuICAgICAgY2VsbFZhbHVlID0gZ2V0Rm9ybWF0RGF0ZShjZWxsVmFsdWUsIHByb3BzLCAneXl5eS1NTScpXHJcbiAgICAgIGJyZWFrXHJcbiAgICBjYXNlICd5ZWFyJzpcclxuICAgICAgY2VsbFZhbHVlID0gZ2V0Rm9ybWF0RGF0ZShjZWxsVmFsdWUsIHByb3BzLCAneXl5eScpXHJcbiAgICAgIGJyZWFrXHJcbiAgICBjYXNlICdkYXRlcyc6XHJcbiAgICAgIGNlbGxWYWx1ZSA9IGdldEZvcm1hdERhdGVzKGNlbGxWYWx1ZSwgcHJvcHMsICcsICcsICd5eXl5LU1NLWRkJylcclxuICAgICAgYnJlYWtcclxuICAgIGNhc2UgJ2RhdGVyYW5nZSc6XHJcbiAgICAgIGNlbGxWYWx1ZSA9IGdldEZvcm1hdERhdGVzKGNlbGxWYWx1ZSwgcHJvcHMsIGAgJHtzZXBhcmF0b3IgfHwgJy0nfSBgLCAneXl5eS1NTS1kZCcpXHJcbiAgICAgIGJyZWFrXHJcbiAgICBjYXNlICdkYXRldGltZXJhbmdlJzpcclxuICAgICAgY2VsbFZhbHVlID0gZ2V0Rm9ybWF0RGF0ZXMoY2VsbFZhbHVlLCBwcm9wcywgYCAke3NlcGFyYXRvciB8fCAnLSd9IGAsICd5eXl5LU1NLWRkIEhIOnNzOm1tJylcclxuICAgICAgYnJlYWtcclxuICAgIGRlZmF1bHQ6XHJcbiAgICAgIGNlbGxWYWx1ZSA9IGdldEZvcm1hdERhdGUoY2VsbFZhbHVlLCBwcm9wcywgJ3l5eXktTU0tZGQnKVxyXG4gICAgICBicmVha1xyXG4gIH1cclxuICByZXR1cm4gY2VsbFZhbHVlXHJcbn1cclxuXHJcbmZ1bmN0aW9uIGNyZWF0ZUVkaXRSZW5kZXIgKGRlZmF1bHRQcm9wcz86IHsgW2tleTogc3RyaW5nXTogYW55IH0pIHtcclxuICByZXR1cm4gZnVuY3Rpb24gKGg6IENyZWF0ZUVsZW1lbnQsIHJlbmRlck9wdHM6IENvbHVtbkVkaXRSZW5kZXJPcHRpb25zLCBwYXJhbXM6IENvbHVtbkVkaXRSZW5kZXJQYXJhbXMpIHtcclxuICAgIGNvbnN0IHsgcm93LCBjb2x1bW4gfSA9IHBhcmFtc1xyXG4gICAgY29uc3QgeyBhdHRycyB9ID0gcmVuZGVyT3B0c1xyXG4gICAgY29uc3QgY2VsbFZhbHVlID0gWEVVdGlscy5nZXQocm93LCBjb2x1bW4ucHJvcGVydHkpXHJcbiAgICByZXR1cm4gW1xyXG4gICAgICBoKHJlbmRlck9wdHMubmFtZSwge1xyXG4gICAgICAgIGF0dHJzLFxyXG4gICAgICAgIHByb3BzOiBnZXRDZWxsRWRpdEZpbHRlclByb3BzKHJlbmRlck9wdHMsIHBhcmFtcywgY2VsbFZhbHVlLCBkZWZhdWx0UHJvcHMpLFxyXG4gICAgICAgIG9uOiBnZXRFZGl0T25zKHJlbmRlck9wdHMsIHBhcmFtcyksXHJcbiAgICAgICAgbmF0aXZlT246IGdldE5hdGl2ZU9ucyhyZW5kZXJPcHRzLCBwYXJhbXMpXHJcbiAgICAgIH0pXHJcbiAgICBdXHJcbiAgfVxyXG59XHJcblxyXG5mdW5jdGlvbiBkZWZhdWx0QnV0dG9uRWRpdFJlbmRlciAoaDogQ3JlYXRlRWxlbWVudCwgcmVuZGVyT3B0czogQ29sdW1uRWRpdFJlbmRlck9wdGlvbnMsIHBhcmFtczogQ29sdW1uRWRpdFJlbmRlclBhcmFtcykge1xyXG4gIGNvbnN0IHsgYXR0cnMgfSA9IHJlbmRlck9wdHNcclxuICByZXR1cm4gW1xyXG4gICAgaCgnQnV0dG9uJywge1xyXG4gICAgICBhdHRycyxcclxuICAgICAgcHJvcHM6IGdldENlbGxFZGl0RmlsdGVyUHJvcHMocmVuZGVyT3B0cywgcGFyYW1zLCBudWxsKSxcclxuICAgICAgb246IGdldE9ucyhyZW5kZXJPcHRzLCBwYXJhbXMpLFxyXG4gICAgICBuYXRpdmVPbjogZ2V0TmF0aXZlT25zKHJlbmRlck9wdHMsIHBhcmFtcylcclxuICAgIH0sIGNlbGxUZXh0KGgsIHJlbmRlck9wdHMuY29udGVudCkpXHJcbiAgXVxyXG59XHJcblxyXG5mdW5jdGlvbiBkZWZhdWx0QnV0dG9uc0VkaXRSZW5kZXIgKGg6IENyZWF0ZUVsZW1lbnQsIHJlbmRlck9wdHM6IENvbHVtbkVkaXRSZW5kZXJPcHRpb25zLCBwYXJhbXM6IENvbHVtbkVkaXRSZW5kZXJQYXJhbXMpIHtcclxuICByZXR1cm4gcmVuZGVyT3B0cy5jaGlsZHJlbi5tYXAoKGNoaWxkUmVuZGVyT3B0czogQ29sdW1uRWRpdFJlbmRlck9wdGlvbnMpID0+IGRlZmF1bHRCdXR0b25FZGl0UmVuZGVyKGgsIGNoaWxkUmVuZGVyT3B0cywgcGFyYW1zKVswXSlcclxufVxyXG5cclxuZnVuY3Rpb24gY3JlYXRlRmlsdGVyUmVuZGVyIChkZWZhdWx0UHJvcHM/OiB7IFtrZXk6IHN0cmluZ106IGFueSB9KSB7XHJcbiAgcmV0dXJuIGZ1bmN0aW9uIChoOiBDcmVhdGVFbGVtZW50LCByZW5kZXJPcHRzOiBDb2x1bW5GaWx0ZXJSZW5kZXJPcHRpb25zLCBwYXJhbXM6IENvbHVtbkZpbHRlclJlbmRlclBhcmFtcykge1xyXG4gICAgY29uc3QgeyBjb2x1bW4gfSA9IHBhcmFtc1xyXG4gICAgY29uc3QgeyBuYW1lLCBhdHRycyB9ID0gcmVuZGVyT3B0c1xyXG4gICAgY29uc3QgbmF0aXZlT24gPSBnZXROYXRpdmVPbnMocmVuZGVyT3B0cywgcGFyYW1zKVxyXG4gICAgcmV0dXJuIFtcclxuICAgICAgaCgnZGl2Jywge1xyXG4gICAgICAgIGNsYXNzOiAndnhlLXRhYmxlLS1maWx0ZXItaXZpZXctd3JhcHBlcidcclxuICAgICAgfSwgY29sdW1uLmZpbHRlcnMubWFwKChvcHRpb24sIG9JbmRleCkgPT4ge1xyXG4gICAgICAgIGNvbnN0IG9wdGlvblZhbHVlID0gb3B0aW9uLmRhdGFcclxuICAgICAgICByZXR1cm4gaChuYW1lLCB7XHJcbiAgICAgICAgICBrZXk6IG9JbmRleCxcclxuICAgICAgICAgIGF0dHJzLFxyXG4gICAgICAgICAgcHJvcHM6IGdldENlbGxFZGl0RmlsdGVyUHJvcHMocmVuZGVyT3B0cywgcGFyYW1zLCBvcHRpb25WYWx1ZSwgZGVmYXVsdFByb3BzKSxcclxuICAgICAgICAgIG9uOiBnZXRGaWx0ZXJPbnMocmVuZGVyT3B0cywgcGFyYW1zLCBvcHRpb24sICgpID0+IHtcclxuICAgICAgICAgICAgLy8g5aSE55CGIGNoYW5nZSDkuovku7bnm7jlhbPpgLvovpFcclxuICAgICAgICAgICAgaGFuZGxlQ29uZmlybUZpbHRlcihwYXJhbXMsICEhb3B0aW9uLmRhdGEsIG9wdGlvbilcclxuICAgICAgICAgIH0pLFxyXG4gICAgICAgICAgbmF0aXZlT25cclxuICAgICAgICB9KVxyXG4gICAgICB9KSlcclxuICAgIF1cclxuICB9XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGhhbmRsZUNvbmZpcm1GaWx0ZXIgKHBhcmFtczogQ29sdW1uRmlsdGVyUmVuZGVyUGFyYW1zLCBjaGVja2VkOiBib29sZWFuLCBvcHRpb246IENvbHVtbkZpbHRlclBhcmFtcykge1xyXG4gIGNvbnN0IHsgJHBhbmVsIH0gPSBwYXJhbXNcclxuICAkcGFuZWwuY2hhbmdlT3B0aW9uKHt9LCBjaGVja2VkLCBvcHRpb24pXHJcbn1cclxuXHJcbmZ1bmN0aW9uIGRlZmF1bHRGaWx0ZXJNZXRob2QgKHBhcmFtczogQ29sdW1uRmlsdGVyTWV0aG9kUGFyYW1zKSB7XHJcbiAgY29uc3QgeyBvcHRpb24sIHJvdywgY29sdW1uIH0gPSBwYXJhbXNcclxuICBjb25zdCB7IGRhdGEgfSA9IG9wdGlvblxyXG4gIGNvbnN0IGNlbGxWYWx1ZSA9IFhFVXRpbHMuZ2V0KHJvdywgY29sdW1uLnByb3BlcnR5KVxyXG4gIC8qIGVzbGludC1kaXNhYmxlIGVxZXFlcSAqL1xyXG4gIHJldHVybiBjZWxsVmFsdWUgPT09IGRhdGFcclxufVxyXG5cclxuZnVuY3Rpb24gcmVuZGVyT3B0aW9ucyAoaDogQ3JlYXRlRWxlbWVudCwgb3B0aW9uczogYW55W10sIG9wdGlvblByb3BzOiBPcHRpb25Qcm9wcykge1xyXG4gIGNvbnN0IGxhYmVsUHJvcCA9IG9wdGlvblByb3BzLmxhYmVsIHx8ICdsYWJlbCdcclxuICBjb25zdCB2YWx1ZVByb3AgPSBvcHRpb25Qcm9wcy52YWx1ZSB8fCAndmFsdWUnXHJcbiAgY29uc3QgZGlzYWJsZWRQcm9wID0gb3B0aW9uUHJvcHMuZGlzYWJsZWQgfHwgJ2Rpc2FibGVkJ1xyXG4gIHJldHVybiBYRVV0aWxzLm1hcChvcHRpb25zLCAoaXRlbSwgb0luZGV4KSA9PiB7XHJcbiAgICByZXR1cm4gaCgnT3B0aW9uJywge1xyXG4gICAgICBrZXk6IG9JbmRleCxcclxuICAgICAgcHJvcHM6IHtcclxuICAgICAgICB2YWx1ZTogaXRlbVt2YWx1ZVByb3BdLFxyXG4gICAgICAgIGxhYmVsOiBpdGVtW2xhYmVsUHJvcF0sXHJcbiAgICAgICAgZGlzYWJsZWQ6IGl0ZW1bZGlzYWJsZWRQcm9wXVxyXG4gICAgICB9XHJcbiAgICB9KVxyXG4gIH0pXHJcbn1cclxuXHJcbmZ1bmN0aW9uIGNlbGxUZXh0IChoOiBDcmVhdGVFbGVtZW50LCBjZWxsVmFsdWU6IGFueSkge1xyXG4gIHJldHVybiBbJycgKyAoaXNFbXB0eVZhbHVlKGNlbGxWYWx1ZSkgPyAnJyA6IGNlbGxWYWx1ZSldXHJcbn1cclxuXHJcbmZ1bmN0aW9uIGNyZWF0ZUZvcm1JdGVtUmVuZGVyIChkZWZhdWx0UHJvcHM/OiB7IFtrZXk6IHN0cmluZ106IGFueSB9KSB7XHJcbiAgcmV0dXJuIGZ1bmN0aW9uIChoOiBDcmVhdGVFbGVtZW50LCByZW5kZXJPcHRzOiBGb3JtSXRlbVJlbmRlck9wdGlvbnMsIHBhcmFtczogRm9ybUl0ZW1SZW5kZXJQYXJhbXMpIHtcclxuICAgIGNvbnN0IHsgZGF0YSwgcHJvcGVydHkgfSA9IHBhcmFtc1xyXG4gICAgY29uc3QgeyBuYW1lIH0gPSByZW5kZXJPcHRzXHJcbiAgICBjb25zdCB7IGF0dHJzIH0gPSByZW5kZXJPcHRzXHJcbiAgICBjb25zdCBpdGVtVmFsdWUgPSBYRVV0aWxzLmdldChkYXRhLCBwcm9wZXJ0eSlcclxuICAgIHJldHVybiBbXHJcbiAgICAgIGgobmFtZSwge1xyXG4gICAgICAgIGF0dHJzLFxyXG4gICAgICAgIHByb3BzOiBnZXRJdGVtUHJvcHMocmVuZGVyT3B0cywgcGFyYW1zLCBpdGVtVmFsdWUsIGRlZmF1bHRQcm9wcyksXHJcbiAgICAgICAgb246IGdldEl0ZW1PbnMocmVuZGVyT3B0cywgcGFyYW1zKSxcclxuICAgICAgICBuYXRpdmVPbjogZ2V0TmF0aXZlT25zKHJlbmRlck9wdHMsIHBhcmFtcylcclxuICAgICAgfSlcclxuICAgIF1cclxuICB9XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGRlZmF1bHRCdXR0b25JdGVtUmVuZGVyIChoOiBDcmVhdGVFbGVtZW50LCByZW5kZXJPcHRzOiBGb3JtSXRlbVJlbmRlck9wdGlvbnMsIHBhcmFtczogRm9ybUl0ZW1SZW5kZXJQYXJhbXMpIHtcclxuICBjb25zdCB7IGF0dHJzIH0gPSByZW5kZXJPcHRzXHJcbiAgY29uc3QgcHJvcHMgPSBnZXRJdGVtUHJvcHMocmVuZGVyT3B0cywgcGFyYW1zLCBudWxsKVxyXG4gIHJldHVybiBbXHJcbiAgICBoKCdCdXR0b24nLCB7XHJcbiAgICAgIGF0dHJzLFxyXG4gICAgICBwcm9wcyxcclxuICAgICAgb246IGdldE9ucyhyZW5kZXJPcHRzLCBwYXJhbXMpLFxyXG4gICAgICBuYXRpdmVPbjogZ2V0TmF0aXZlT25zKHJlbmRlck9wdHMsIHBhcmFtcylcclxuICAgIH0sIGNlbGxUZXh0KGgsIHJlbmRlck9wdHMuY29udGVudCB8fCBwcm9wcy5jb250ZW50KSlcclxuICBdXHJcbn1cclxuXHJcbmZ1bmN0aW9uIGRlZmF1bHRCdXR0b25zSXRlbVJlbmRlciAoaDogQ3JlYXRlRWxlbWVudCwgcmVuZGVyT3B0czogRm9ybUl0ZW1SZW5kZXJPcHRpb25zLCBwYXJhbXM6IEZvcm1JdGVtUmVuZGVyUGFyYW1zKSB7XHJcbiAgcmV0dXJuIHJlbmRlck9wdHMuY2hpbGRyZW4ubWFwKChjaGlsZFJlbmRlck9wdHM6IEZvcm1JdGVtUmVuZGVyT3B0aW9ucykgPT4gZGVmYXVsdEJ1dHRvbkl0ZW1SZW5kZXIoaCwgY2hpbGRSZW5kZXJPcHRzLCBwYXJhbXMpWzBdKVxyXG59XHJcblxyXG5mdW5jdGlvbiBjcmVhdGVFeHBvcnRNZXRob2QgKHZhbHVlTWV0aG9kOiBGdW5jdGlvbiwgaXNFZGl0PzogYm9vbGVhbikge1xyXG4gIGNvbnN0IHJlbmRlclByb3BlcnR5ID0gaXNFZGl0ID8gJ2VkaXRSZW5kZXInIDogJ2NlbGxSZW5kZXInXHJcbiAgcmV0dXJuIGZ1bmN0aW9uIChwYXJhbXM6IENvbHVtbkV4cG9ydENlbGxSZW5kZXJQYXJhbXMpIHtcclxuICAgIHJldHVybiB2YWx1ZU1ldGhvZChwYXJhbXMuY29sdW1uW3JlbmRlclByb3BlcnR5XSwgcGFyYW1zKVxyXG4gIH1cclxufVxyXG5cclxuZnVuY3Rpb24gY3JlYXRlRm9ybUl0ZW1SYWRpb0FuZENoZWNrYm94UmVuZGVyICgpIHtcclxuICByZXR1cm4gZnVuY3Rpb24gKGg6IENyZWF0ZUVsZW1lbnQsIHJlbmRlck9wdHM6IEZvcm1JdGVtUmVuZGVyT3B0aW9ucywgcGFyYW1zOiBGb3JtSXRlbVJlbmRlclBhcmFtcykge1xyXG4gICAgY29uc3QgeyBuYW1lLCBvcHRpb25zID0gW10sIG9wdGlvblByb3BzID0ge30gfSA9IHJlbmRlck9wdHNcclxuICAgIGNvbnN0IHsgZGF0YSwgcHJvcGVydHkgfSA9IHBhcmFtc1xyXG4gICAgY29uc3QgeyBhdHRycyB9ID0gcmVuZGVyT3B0c1xyXG4gICAgY29uc3QgbGFiZWxQcm9wID0gb3B0aW9uUHJvcHMubGFiZWwgfHwgJ2xhYmVsJ1xyXG4gICAgY29uc3QgdmFsdWVQcm9wID0gb3B0aW9uUHJvcHMudmFsdWUgfHwgJ3ZhbHVlJ1xyXG4gICAgY29uc3QgZGlzYWJsZWRQcm9wID0gb3B0aW9uUHJvcHMuZGlzYWJsZWQgfHwgJ2Rpc2FibGVkJ1xyXG4gICAgY29uc3QgaXRlbVZhbHVlID0gWEVVdGlscy5nZXQoZGF0YSwgcHJvcGVydHkpXHJcbiAgICByZXR1cm4gW1xyXG4gICAgICBoKGAke25hbWV9R3JvdXBgLCB7XHJcbiAgICAgICAgYXR0cnMsXHJcbiAgICAgICAgcHJvcHM6IGdldEl0ZW1Qcm9wcyhyZW5kZXJPcHRzLCBwYXJhbXMsIGl0ZW1WYWx1ZSksXHJcbiAgICAgICAgb246IGdldEl0ZW1PbnMocmVuZGVyT3B0cywgcGFyYW1zKSxcclxuICAgICAgICBuYXRpdmVPbjogZ2V0TmF0aXZlT25zKHJlbmRlck9wdHMsIHBhcmFtcylcclxuICAgICAgfSwgb3B0aW9ucy5tYXAoKG9wdGlvbikgPT4ge1xyXG4gICAgICAgIHJldHVybiBoKG5hbWUsIHtcclxuICAgICAgICAgIHByb3BzOiB7XHJcbiAgICAgICAgICAgIGxhYmVsOiBvcHRpb25bdmFsdWVQcm9wXSxcclxuICAgICAgICAgICAgZGlzYWJsZWQ6IG9wdGlvbltkaXNhYmxlZFByb3BdXHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfSwgb3B0aW9uW2xhYmVsUHJvcF0pXHJcbiAgICAgIH0pKVxyXG4gICAgXVxyXG4gIH1cclxufVxyXG5cclxuLyoqXHJcbiAqIOa4suafk+WHveaVsFxyXG4gKi9cclxuY29uc3QgcmVuZGVyTWFwID0ge1xyXG4gIElucHV0OiB7XHJcbiAgICBhdXRvZm9jdXM6ICdpbnB1dC5pdnUtaW5wdXQnLFxyXG4gICAgcmVuZGVyRGVmYXVsdDogY3JlYXRlRWRpdFJlbmRlcigpLFxyXG4gICAgcmVuZGVyRWRpdDogY3JlYXRlRWRpdFJlbmRlcigpLFxyXG4gICAgcmVuZGVyRmlsdGVyOiBjcmVhdGVGaWx0ZXJSZW5kZXIoKSxcclxuICAgIGZpbHRlck1ldGhvZDogZGVmYXVsdEZpbHRlck1ldGhvZCxcclxuICAgIHJlbmRlckl0ZW06IGNyZWF0ZUZvcm1JdGVtUmVuZGVyKClcclxuICB9LFxyXG4gIEF1dG9Db21wbGV0ZToge1xyXG4gICAgYXV0b2ZvY3VzOiAnaW5wdXQuaXZ1LWlucHV0JyxcclxuICAgIHJlbmRlckRlZmF1bHQ6IGNyZWF0ZUVkaXRSZW5kZXIoKSxcclxuICAgIHJlbmRlckVkaXQ6IGNyZWF0ZUVkaXRSZW5kZXIoKSxcclxuICAgIHJlbmRlckZpbHRlcjogY3JlYXRlRmlsdGVyUmVuZGVyKCksXHJcbiAgICBmaWx0ZXJNZXRob2Q6IGRlZmF1bHRGaWx0ZXJNZXRob2QsXHJcbiAgICByZW5kZXJJdGVtOiBjcmVhdGVGb3JtSXRlbVJlbmRlcigpXHJcbiAgfSxcclxuICBJbnB1dE51bWJlcjoge1xyXG4gICAgYXV0b2ZvY3VzOiAnaW5wdXQuaXZ1LWlucHV0LW51bWJlci1pbnB1dCcsXHJcbiAgICByZW5kZXJEZWZhdWx0OiBjcmVhdGVFZGl0UmVuZGVyKCksXHJcbiAgICByZW5kZXJFZGl0OiBjcmVhdGVFZGl0UmVuZGVyKCksXHJcbiAgICByZW5kZXJGaWx0ZXI6IGNyZWF0ZUZpbHRlclJlbmRlcigpLFxyXG4gICAgZmlsdGVyTWV0aG9kOiBkZWZhdWx0RmlsdGVyTWV0aG9kLFxyXG4gICAgcmVuZGVySXRlbTogY3JlYXRlRm9ybUl0ZW1SZW5kZXIoKVxyXG4gIH0sXHJcbiAgU2VsZWN0OiB7XHJcbiAgICByZW5kZXJFZGl0IChoOiBDcmVhdGVFbGVtZW50LCByZW5kZXJPcHRzOiBDb2x1bW5FZGl0UmVuZGVyT3B0aW9ucywgcGFyYW1zOiBDb2x1bW5FZGl0UmVuZGVyUGFyYW1zKSB7XHJcbiAgICAgIGNvbnN0IHsgb3B0aW9ucyA9IFtdLCBvcHRpb25Hcm91cHMsIG9wdGlvblByb3BzID0ge30sIG9wdGlvbkdyb3VwUHJvcHMgPSB7fSB9ID0gcmVuZGVyT3B0c1xyXG4gICAgICBjb25zdCB7IHJvdywgY29sdW1uIH0gPSBwYXJhbXNcclxuICAgICAgY29uc3QgeyBhdHRycyB9ID0gcmVuZGVyT3B0c1xyXG4gICAgICBjb25zdCBjZWxsVmFsdWUgPSBYRVV0aWxzLmdldChyb3csIGNvbHVtbi5wcm9wZXJ0eSlcclxuICAgICAgY29uc3QgcHJvcHMgPSBnZXRDZWxsRWRpdEZpbHRlclByb3BzKHJlbmRlck9wdHMsIHBhcmFtcywgY2VsbFZhbHVlKVxyXG4gICAgICBjb25zdCBvbiA9IGdldEVkaXRPbnMocmVuZGVyT3B0cywgcGFyYW1zKVxyXG4gICAgICBjb25zdCBuYXRpdmVPbiA9IGdldE5hdGl2ZU9ucyhyZW5kZXJPcHRzLCBwYXJhbXMpXHJcbiAgICAgIGlmIChvcHRpb25Hcm91cHMpIHtcclxuICAgICAgICBjb25zdCBncm91cE9wdGlvbnMgPSBvcHRpb25Hcm91cFByb3BzLm9wdGlvbnMgfHwgJ29wdGlvbnMnXHJcbiAgICAgICAgY29uc3QgZ3JvdXBMYWJlbCA9IG9wdGlvbkdyb3VwUHJvcHMubGFiZWwgfHwgJ2xhYmVsJ1xyXG4gICAgICAgIHJldHVybiBbXHJcbiAgICAgICAgICBoKCdTZWxlY3QnLCB7XHJcbiAgICAgICAgICAgIGF0dHJzLFxyXG4gICAgICAgICAgICBwcm9wcyxcclxuICAgICAgICAgICAgb24sXHJcbiAgICAgICAgICAgIG5hdGl2ZU9uXHJcbiAgICAgICAgICB9LCBYRVV0aWxzLm1hcChvcHRpb25Hcm91cHMsIChncm91cCwgZ0luZGV4KSA9PiB7XHJcbiAgICAgICAgICAgIHJldHVybiBoKCdPcHRpb25Hcm91cCcsIHtcclxuICAgICAgICAgICAgICBwcm9wczoge1xyXG4gICAgICAgICAgICAgICAgbGFiZWw6IGdyb3VwW2dyb3VwTGFiZWxdXHJcbiAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICBrZXk6IGdJbmRleFxyXG4gICAgICAgICAgICB9LCByZW5kZXJPcHRpb25zKGgsIGdyb3VwW2dyb3VwT3B0aW9uc10sIG9wdGlvblByb3BzKSlcclxuICAgICAgICAgIH0pKVxyXG4gICAgICAgIF1cclxuICAgICAgfVxyXG4gICAgICByZXR1cm4gW1xyXG4gICAgICAgIGgoJ1NlbGVjdCcsIHtcclxuICAgICAgICAgIGF0dHJzLFxyXG4gICAgICAgICAgcHJvcHMsXHJcbiAgICAgICAgICBvbixcclxuICAgICAgICAgIG5hdGl2ZU9uXHJcbiAgICAgICAgfSwgcmVuZGVyT3B0aW9ucyhoLCBvcHRpb25zLCBvcHRpb25Qcm9wcykpXHJcbiAgICAgIF1cclxuICAgIH0sXHJcbiAgICByZW5kZXJDZWxsIChoOiBDcmVhdGVFbGVtZW50LCByZW5kZXJPcHRzOiBDb2x1bW5DZWxsUmVuZGVyT3B0aW9ucywgcGFyYW1zOiBDb2x1bW5DZWxsUmVuZGVyUGFyYW1zKSB7XHJcbiAgICAgIHJldHVybiBjZWxsVGV4dChoLCBnZXRTZWxlY3RDZWxsVmFsdWUocmVuZGVyT3B0cywgcGFyYW1zKSlcclxuICAgIH0sXHJcbiAgICByZW5kZXJGaWx0ZXIgKGg6IENyZWF0ZUVsZW1lbnQsIHJlbmRlck9wdHM6IENvbHVtbkZpbHRlclJlbmRlck9wdGlvbnMsIHBhcmFtczogQ29sdW1uRmlsdGVyUmVuZGVyUGFyYW1zKSB7XHJcbiAgICAgIGNvbnN0IHsgb3B0aW9ucyA9IFtdLCBvcHRpb25Hcm91cHMsIG9wdGlvblByb3BzID0ge30sIG9wdGlvbkdyb3VwUHJvcHMgPSB7fSB9ID0gcmVuZGVyT3B0c1xyXG4gICAgICBjb25zdCBncm91cE9wdGlvbnMgPSBvcHRpb25Hcm91cFByb3BzLm9wdGlvbnMgfHwgJ29wdGlvbnMnXHJcbiAgICAgIGNvbnN0IGdyb3VwTGFiZWwgPSBvcHRpb25Hcm91cFByb3BzLmxhYmVsIHx8ICdsYWJlbCdcclxuICAgICAgY29uc3QgeyBjb2x1bW4gfSA9IHBhcmFtc1xyXG4gICAgICBjb25zdCB7IGF0dHJzIH0gPSByZW5kZXJPcHRzXHJcbiAgICAgIGNvbnN0IG5hdGl2ZU9uID0gZ2V0TmF0aXZlT25zKHJlbmRlck9wdHMsIHBhcmFtcylcclxuICAgICAgcmV0dXJuIFtcclxuICAgICAgICBoKCdkaXYnLCB7XHJcbiAgICAgICAgICBjbGFzczogJ3Z4ZS10YWJsZS0tZmlsdGVyLWl2aWV3LXdyYXBwZXInXHJcbiAgICAgICAgfSwgb3B0aW9uR3JvdXBzXHJcbiAgICAgICAgICA/IGNvbHVtbi5maWx0ZXJzLm1hcCgob3B0aW9uLCBvSW5kZXgpID0+IHtcclxuICAgICAgICAgICAgY29uc3Qgb3B0aW9uVmFsdWUgPSBvcHRpb24uZGF0YVxyXG4gICAgICAgICAgICBjb25zdCBwcm9wcyA9IGdldENlbGxFZGl0RmlsdGVyUHJvcHMocmVuZGVyT3B0cywgcGFyYW1zLCBvcHRpb25WYWx1ZSlcclxuICAgICAgICAgICAgcmV0dXJuIGgoJ1NlbGVjdCcsIHtcclxuICAgICAgICAgICAgICBrZXk6IG9JbmRleCxcclxuICAgICAgICAgICAgICBhdHRycyxcclxuICAgICAgICAgICAgICBwcm9wcyxcclxuICAgICAgICAgICAgICBvbjogZ2V0RmlsdGVyT25zKHJlbmRlck9wdHMsIHBhcmFtcywgb3B0aW9uLCAoKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAvLyDlpITnkIYgY2hhbmdlIOS6i+S7tuebuOWFs+mAu+i+kVxyXG4gICAgICAgICAgICAgICAgaGFuZGxlQ29uZmlybUZpbHRlcihwYXJhbXMsIHByb3BzLm11bHRpcGxlID8gKG9wdGlvbi5kYXRhICYmIG9wdGlvbi5kYXRhLmxlbmd0aCA+IDApIDogIVhFVXRpbHMuZXFOdWxsKG9wdGlvbi5kYXRhKSwgb3B0aW9uKVxyXG4gICAgICAgICAgICAgIH0pLFxyXG4gICAgICAgICAgICAgIG5hdGl2ZU9uXHJcbiAgICAgICAgICAgIH0sIFhFVXRpbHMubWFwKG9wdGlvbkdyb3VwcywgKGdyb3VwLCBnSW5kZXgpID0+IHtcclxuICAgICAgICAgICAgICByZXR1cm4gaCgnT3B0aW9uR3JvdXAnLCB7XHJcbiAgICAgICAgICAgICAgICBrZXk6IGdJbmRleCxcclxuICAgICAgICAgICAgICAgIHByb3BzOiB7XHJcbiAgICAgICAgICAgICAgICAgIGxhYmVsOiBncm91cFtncm91cExhYmVsXVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgIH0sIHJlbmRlck9wdGlvbnMoaCwgZ3JvdXBbZ3JvdXBPcHRpb25zXSwgb3B0aW9uUHJvcHMpKVxyXG4gICAgICAgICAgICB9KSlcclxuICAgICAgICAgIH0pXHJcbiAgICAgICAgICA6IGNvbHVtbi5maWx0ZXJzLm1hcCgob3B0aW9uLCBvSW5kZXgpID0+IHtcclxuICAgICAgICAgICAgY29uc3Qgb3B0aW9uVmFsdWUgPSBvcHRpb24uZGF0YVxyXG4gICAgICAgICAgICBjb25zdCBwcm9wcyA9IGdldENlbGxFZGl0RmlsdGVyUHJvcHMocmVuZGVyT3B0cywgcGFyYW1zLCBvcHRpb25WYWx1ZSlcclxuICAgICAgICAgICAgcmV0dXJuIGgoJ1NlbGVjdCcsIHtcclxuICAgICAgICAgICAgICBrZXk6IG9JbmRleCxcclxuICAgICAgICAgICAgICBhdHRycyxcclxuICAgICAgICAgICAgICBwcm9wcyxcclxuICAgICAgICAgICAgICBvbjogZ2V0RmlsdGVyT25zKHJlbmRlck9wdHMsIHBhcmFtcywgb3B0aW9uLCAoKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAvLyDlpITnkIYgY2hhbmdlIOS6i+S7tuebuOWFs+mAu+i+kVxyXG4gICAgICAgICAgICAgICAgaGFuZGxlQ29uZmlybUZpbHRlcihwYXJhbXMsIHByb3BzLm11bHRpcGxlID8gKG9wdGlvbi5kYXRhICYmIG9wdGlvbi5kYXRhLmxlbmd0aCA+IDApIDogIVhFVXRpbHMuZXFOdWxsKG9wdGlvbi5kYXRhKSwgb3B0aW9uKVxyXG4gICAgICAgICAgICAgIH0pLFxyXG4gICAgICAgICAgICAgIG5hdGl2ZU9uXHJcbiAgICAgICAgICAgIH0sIHJlbmRlck9wdGlvbnMoaCwgb3B0aW9ucywgb3B0aW9uUHJvcHMpKVxyXG4gICAgICAgICAgfSlcclxuICAgICAgICApXHJcbiAgICAgIF1cclxuICAgIH0sXHJcbiAgICBmaWx0ZXJNZXRob2QgKHBhcmFtczogQ29sdW1uRmlsdGVyTWV0aG9kUGFyYW1zKSB7XHJcbiAgICAgIGNvbnN0IHsgb3B0aW9uLCByb3csIGNvbHVtbiB9ID0gcGFyYW1zXHJcbiAgICAgIGNvbnN0IHsgZGF0YSB9ID0gb3B0aW9uXHJcbiAgICAgIGNvbnN0IHsgcHJvcGVydHksIGZpbHRlclJlbmRlcjogcmVuZGVyT3B0cyB9ID0gY29sdW1uXHJcbiAgICAgIGNvbnN0IHsgcHJvcHMgPSB7fSB9ID0gcmVuZGVyT3B0c1xyXG4gICAgICBjb25zdCBjZWxsVmFsdWUgPSBYRVV0aWxzLmdldChyb3csIHByb3BlcnR5KVxyXG4gICAgICBpZiAocHJvcHMubXVsdGlwbGUpIHtcclxuICAgICAgICBpZiAoWEVVdGlscy5pc0FycmF5KGNlbGxWYWx1ZSkpIHtcclxuICAgICAgICAgIHJldHVybiBYRVV0aWxzLmluY2x1ZGVBcnJheXMoY2VsbFZhbHVlLCBkYXRhKVxyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gZGF0YS5pbmRleE9mKGNlbGxWYWx1ZSkgPiAtMVxyXG4gICAgICB9XHJcbiAgICAgIC8qIGVzbGludC1kaXNhYmxlIGVxZXFlcSAqL1xyXG4gICAgICByZXR1cm4gY2VsbFZhbHVlID09IGRhdGFcclxuICAgIH0sXHJcbiAgICByZW5kZXJJdGVtIChoOiBDcmVhdGVFbGVtZW50LCByZW5kZXJPcHRzOiBGb3JtSXRlbVJlbmRlck9wdGlvbnMsIHBhcmFtczogRm9ybUl0ZW1SZW5kZXJQYXJhbXMpIHtcclxuICAgICAgY29uc3QgeyBvcHRpb25zID0gW10sIG9wdGlvbkdyb3Vwcywgb3B0aW9uUHJvcHMgPSB7fSwgb3B0aW9uR3JvdXBQcm9wcyA9IHt9IH0gPSByZW5kZXJPcHRzXHJcbiAgICAgIGNvbnN0IHsgZGF0YSwgcHJvcGVydHkgfSA9IHBhcmFtc1xyXG4gICAgICBjb25zdCB7IGF0dHJzIH0gPSByZW5kZXJPcHRzXHJcbiAgICAgIGNvbnN0IGl0ZW1WYWx1ZSA9IFhFVXRpbHMuZ2V0KGRhdGEsIHByb3BlcnR5KVxyXG4gICAgICBjb25zdCBwcm9wcyA9IGdldEl0ZW1Qcm9wcyhyZW5kZXJPcHRzLCBwYXJhbXMsIGl0ZW1WYWx1ZSlcclxuICAgICAgY29uc3Qgb24gPSBnZXRJdGVtT25zKHJlbmRlck9wdHMsIHBhcmFtcylcclxuICAgICAgY29uc3QgbmF0aXZlT24gPSBnZXROYXRpdmVPbnMocmVuZGVyT3B0cywgcGFyYW1zKVxyXG4gICAgICBpZiAob3B0aW9uR3JvdXBzKSB7XHJcbiAgICAgICAgY29uc3QgZ3JvdXBPcHRpb25zID0gb3B0aW9uR3JvdXBQcm9wcy5vcHRpb25zIHx8ICdvcHRpb25zJ1xyXG4gICAgICAgIGNvbnN0IGdyb3VwTGFiZWwgPSBvcHRpb25Hcm91cFByb3BzLmxhYmVsIHx8ICdsYWJlbCdcclxuICAgICAgICByZXR1cm4gW1xyXG4gICAgICAgICAgaCgnU2VsZWN0Jywge1xyXG4gICAgICAgICAgICBwcm9wcyxcclxuICAgICAgICAgICAgYXR0cnMsXHJcbiAgICAgICAgICAgIG9uLFxyXG4gICAgICAgICAgICBuYXRpdmVPblxyXG4gICAgICAgICAgfSwgWEVVdGlscy5tYXAob3B0aW9uR3JvdXBzLCAoZ3JvdXAsIGdJbmRleCkgPT4ge1xyXG4gICAgICAgICAgICByZXR1cm4gaCgnT3B0aW9uR3JvdXAnLCB7XHJcbiAgICAgICAgICAgICAga2V5OiBnSW5kZXgsXHJcbiAgICAgICAgICAgICAgcHJvcHM6IHtcclxuICAgICAgICAgICAgICAgIGxhYmVsOiBncm91cFtncm91cExhYmVsXVxyXG4gICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSwgcmVuZGVyT3B0aW9ucyhoLCBncm91cFtncm91cE9wdGlvbnNdLCBvcHRpb25Qcm9wcykpXHJcbiAgICAgICAgICB9KSlcclxuICAgICAgICBdXHJcbiAgICAgIH1cclxuICAgICAgcmV0dXJuIFtcclxuICAgICAgICBoKCdTZWxlY3QnLCB7XHJcbiAgICAgICAgICBwcm9wcyxcclxuICAgICAgICAgIGF0dHJzLFxyXG4gICAgICAgICAgb24sXHJcbiAgICAgICAgICBuYXRpdmVPblxyXG4gICAgICAgIH0sIHJlbmRlck9wdGlvbnMoaCwgb3B0aW9ucywgb3B0aW9uUHJvcHMpKVxyXG4gICAgICBdXHJcbiAgICB9LFxyXG4gICAgY2VsbEV4cG9ydE1ldGhvZDogY3JlYXRlRXhwb3J0TWV0aG9kKGdldFNlbGVjdENlbGxWYWx1ZSksXHJcbiAgICBlZGl0Q2VsbEV4cG9ydE1ldGhvZDogY3JlYXRlRXhwb3J0TWV0aG9kKGdldFNlbGVjdENlbGxWYWx1ZSwgdHJ1ZSlcclxuICB9LFxyXG4gIENhc2NhZGVyOiB7XHJcbiAgICByZW5kZXJFZGl0OiBjcmVhdGVFZGl0UmVuZGVyKHsgdHJhbnNmZXI6IHRydWUgfSksXHJcbiAgICByZW5kZXJDZWxsIChoOiBDcmVhdGVFbGVtZW50LCByZW5kZXJPcHRzOiBDb2x1bW5DZWxsUmVuZGVyT3B0aW9ucywgcGFyYW1zOiBDb2x1bW5FZGl0UmVuZGVyUGFyYW1zKSB7XHJcbiAgICAgIHJldHVybiBjZWxsVGV4dChoLCBnZXRDYXNjYWRlckNlbGxWYWx1ZShyZW5kZXJPcHRzLCBwYXJhbXMpKVxyXG4gICAgfSxcclxuICAgIHJlbmRlckl0ZW06IGNyZWF0ZUZvcm1JdGVtUmVuZGVyKCksXHJcbiAgICBjZWxsRXhwb3J0TWV0aG9kOiBjcmVhdGVFeHBvcnRNZXRob2QoZ2V0Q2FzY2FkZXJDZWxsVmFsdWUpLFxyXG4gICAgZWRpdENlbGxFeHBvcnRNZXRob2Q6IGNyZWF0ZUV4cG9ydE1ldGhvZChnZXRDYXNjYWRlckNlbGxWYWx1ZSwgdHJ1ZSlcclxuICB9LFxyXG4gIERhdGVQaWNrZXI6IHtcclxuICAgIHJlbmRlckVkaXQ6IGNyZWF0ZUVkaXRSZW5kZXIoeyB0cmFuc2ZlcjogdHJ1ZSB9KSxcclxuICAgIHJlbmRlckNlbGwgKGg6IENyZWF0ZUVsZW1lbnQsIHJlbmRlck9wdHM6IENvbHVtbkNlbGxSZW5kZXJPcHRpb25zLCBwYXJhbXM6IENvbHVtbkVkaXRSZW5kZXJQYXJhbXMpIHtcclxuICAgICAgcmV0dXJuIGNlbGxUZXh0KGgsIGdldERhdGVQaWNrZXJDZWxsVmFsdWUocmVuZGVyT3B0cywgcGFyYW1zKSlcclxuICAgIH0sXHJcbiAgICByZW5kZXJGaWx0ZXIgKGg6IENyZWF0ZUVsZW1lbnQsIHJlbmRlck9wdHM6IENvbHVtbkZpbHRlclJlbmRlck9wdGlvbnMsIHBhcmFtczogQ29sdW1uRmlsdGVyUmVuZGVyUGFyYW1zKSB7XHJcbiAgICAgIGNvbnN0IHsgY29sdW1uIH0gPSBwYXJhbXNcclxuICAgICAgY29uc3QgeyBhdHRycyB9ID0gcmVuZGVyT3B0c1xyXG4gICAgICBjb25zdCBuYXRpdmVPbiA9IGdldE5hdGl2ZU9ucyhyZW5kZXJPcHRzLCBwYXJhbXMpXHJcbiAgICAgIHJldHVybiBbXHJcbiAgICAgICAgaCgnZGl2Jywge1xyXG4gICAgICAgICAgY2xhc3M6ICd2eGUtdGFibGUtLWZpbHRlci1pdmlldy13cmFwcGVyJ1xyXG4gICAgICAgIH0sIGNvbHVtbi5maWx0ZXJzLm1hcCgob3B0aW9uLCBvSW5kZXgpID0+IHtcclxuICAgICAgICAgIGNvbnN0IG9wdGlvblZhbHVlID0gb3B0aW9uLmRhdGFcclxuICAgICAgICAgIHJldHVybiBoKHJlbmRlck9wdHMubmFtZSwge1xyXG4gICAgICAgICAgICBrZXk6IG9JbmRleCxcclxuICAgICAgICAgICAgYXR0cnMsXHJcbiAgICAgICAgICAgIHByb3BzOiBnZXRDZWxsRWRpdEZpbHRlclByb3BzKHJlbmRlck9wdHMsIHBhcmFtcywgb3B0aW9uVmFsdWUpLFxyXG4gICAgICAgICAgICBvbjogZ2V0RmlsdGVyT25zKHJlbmRlck9wdHMsIHBhcmFtcywgb3B0aW9uLCAoKSA9PiB7XHJcbiAgICAgICAgICAgICAgLy8g5aSE55CGIGNoYW5nZSDkuovku7bnm7jlhbPpgLvovpFcclxuICAgICAgICAgICAgICBoYW5kbGVDb25maXJtRmlsdGVyKHBhcmFtcywgISFvcHRpb24uZGF0YSwgb3B0aW9uKVxyXG4gICAgICAgICAgICB9KSxcclxuICAgICAgICAgICAgbmF0aXZlT25cclxuICAgICAgICAgIH0pXHJcbiAgICAgICAgfSkpXHJcbiAgICAgIF1cclxuICAgIH0sXHJcbiAgICBmaWx0ZXJNZXRob2QgKHBhcmFtczogQ29sdW1uRmlsdGVyTWV0aG9kUGFyYW1zKSB7XHJcbiAgICAgIGNvbnN0IHsgb3B0aW9uLCByb3csIGNvbHVtbiB9ID0gcGFyYW1zXHJcbiAgICAgIGNvbnN0IHsgZGF0YSB9ID0gb3B0aW9uXHJcbiAgICAgIGNvbnN0IHsgZmlsdGVyUmVuZGVyOiByZW5kZXJPcHRzIH0gPSBjb2x1bW5cclxuICAgICAgY29uc3QgeyBwcm9wcyA9IHt9IH0gPSByZW5kZXJPcHRzXHJcbiAgICAgIGNvbnN0IGNlbGxWYWx1ZSA9IFhFVXRpbHMuZ2V0KHJvdywgY29sdW1uLnByb3BlcnR5KVxyXG4gICAgICBpZiAoZGF0YSkge1xyXG4gICAgICAgIHN3aXRjaCAocHJvcHMudHlwZSkge1xyXG4gICAgICAgICAgY2FzZSAnZGF0ZXJhbmdlJzpcclxuICAgICAgICAgICAgcmV0dXJuIGVxdWFsRGF0ZXJhbmdlKGNlbGxWYWx1ZSwgZGF0YSwgcHJvcHMsICd5eXl5LU1NLWRkJylcclxuICAgICAgICAgIGNhc2UgJ2RhdGV0aW1lcmFuZ2UnOlxyXG4gICAgICAgICAgICByZXR1cm4gZXF1YWxEYXRlcmFuZ2UoY2VsbFZhbHVlLCBkYXRhLCBwcm9wcywgJ3l5eXktTU0tZGQgSEg6c3M6bW0nKVxyXG4gICAgICAgICAgZGVmYXVsdDpcclxuICAgICAgICAgICAgcmV0dXJuIGNlbGxWYWx1ZSA9PT0gZGF0YVxyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgICByZXR1cm4gZmFsc2VcclxuICAgIH0sXHJcbiAgICByZW5kZXJJdGVtOiBjcmVhdGVGb3JtSXRlbVJlbmRlcigpLFxyXG4gICAgY2VsbEV4cG9ydE1ldGhvZDogY3JlYXRlRXhwb3J0TWV0aG9kKGdldERhdGVQaWNrZXJDZWxsVmFsdWUpLFxyXG4gICAgZWRpdENlbGxFeHBvcnRNZXRob2Q6IGNyZWF0ZUV4cG9ydE1ldGhvZChnZXREYXRlUGlja2VyQ2VsbFZhbHVlLCB0cnVlKVxyXG4gIH0sXHJcbiAgVGltZVBpY2tlcjoge1xyXG4gICAgcmVuZGVyRWRpdDogY3JlYXRlRWRpdFJlbmRlcih7IHRyYW5zZmVyOiB0cnVlIH0pLFxyXG4gICAgcmVuZGVySXRlbTogY3JlYXRlRm9ybUl0ZW1SZW5kZXIoKVxyXG4gIH0sXHJcbiAgUmF0ZToge1xyXG4gICAgcmVuZGVyRGVmYXVsdDogY3JlYXRlRWRpdFJlbmRlcigpLFxyXG4gICAgcmVuZGVyRWRpdDogY3JlYXRlRWRpdFJlbmRlcigpLFxyXG4gICAgcmVuZGVyRmlsdGVyOiBjcmVhdGVGaWx0ZXJSZW5kZXIoKSxcclxuICAgIGZpbHRlck1ldGhvZDogZGVmYXVsdEZpbHRlck1ldGhvZCxcclxuICAgIHJlbmRlckl0ZW06IGNyZWF0ZUZvcm1JdGVtUmVuZGVyKClcclxuICB9LFxyXG4gIGlTd2l0Y2g6IHtcclxuICAgIHJlbmRlckRlZmF1bHQ6IGNyZWF0ZUVkaXRSZW5kZXIoKSxcclxuICAgIHJlbmRlckVkaXQ6IGNyZWF0ZUVkaXRSZW5kZXIoKSxcclxuICAgIHJlbmRlckZpbHRlciAoaDogQ3JlYXRlRWxlbWVudCwgcmVuZGVyT3B0czogQ29sdW1uRmlsdGVyUmVuZGVyT3B0aW9ucywgcGFyYW1zOiBDb2x1bW5GaWx0ZXJSZW5kZXJQYXJhbXMpIHtcclxuICAgICAgY29uc3QgeyBjb2x1bW4gfSA9IHBhcmFtc1xyXG4gICAgICBjb25zdCB7IG5hbWUsIGF0dHJzIH0gPSByZW5kZXJPcHRzXHJcbiAgICAgIGNvbnN0IG5hdGl2ZU9uID0gZ2V0TmF0aXZlT25zKHJlbmRlck9wdHMsIHBhcmFtcylcclxuICAgICAgcmV0dXJuIFtcclxuICAgICAgICBoKCdkaXYnLCB7XHJcbiAgICAgICAgICBjbGFzczogJ3Z4ZS10YWJsZS0tZmlsdGVyLWl2aWV3LXdyYXBwZXInXHJcbiAgICAgICAgfSwgY29sdW1uLmZpbHRlcnMubWFwKChvcHRpb24sIG9JbmRleCkgPT4ge1xyXG4gICAgICAgICAgY29uc3Qgb3B0aW9uVmFsdWUgPSBvcHRpb24uZGF0YVxyXG4gICAgICAgICAgcmV0dXJuIGgobmFtZSwge1xyXG4gICAgICAgICAgICBrZXk6IG9JbmRleCxcclxuICAgICAgICAgICAgYXR0cnMsXHJcbiAgICAgICAgICAgIHByb3BzOiBnZXRDZWxsRWRpdEZpbHRlclByb3BzKHJlbmRlck9wdHMsIHBhcmFtcywgb3B0aW9uVmFsdWUpLFxyXG4gICAgICAgICAgICBvbjogZ2V0RmlsdGVyT25zKHJlbmRlck9wdHMsIHBhcmFtcywgb3B0aW9uLCAoKSA9PiB7XHJcbiAgICAgICAgICAgICAgLy8g5aSE55CGIGNoYW5nZSDkuovku7bnm7jlhbPpgLvovpFcclxuICAgICAgICAgICAgICBoYW5kbGVDb25maXJtRmlsdGVyKHBhcmFtcywgWEVVdGlscy5pc0Jvb2xlYW4ob3B0aW9uLmRhdGEpLCBvcHRpb24pXHJcbiAgICAgICAgICAgIH0pLFxyXG4gICAgICAgICAgICBuYXRpdmVPblxyXG4gICAgICAgICAgfSlcclxuICAgICAgICB9KSlcclxuICAgICAgXVxyXG4gICAgfSxcclxuICAgIGZpbHRlck1ldGhvZDogZGVmYXVsdEZpbHRlck1ldGhvZCxcclxuICAgIHJlbmRlckl0ZW06IGNyZWF0ZUZvcm1JdGVtUmVuZGVyKClcclxuICB9LFxyXG4gIFJhZGlvOiB7XHJcbiAgICByZW5kZXJJdGVtOiBjcmVhdGVGb3JtSXRlbVJhZGlvQW5kQ2hlY2tib3hSZW5kZXIoKVxyXG4gIH0sXHJcbiAgQ2hlY2tib3g6IHtcclxuICAgIHJlbmRlckl0ZW06IGNyZWF0ZUZvcm1JdGVtUmFkaW9BbmRDaGVja2JveFJlbmRlcigpXHJcbiAgfSxcclxuICBCdXR0b246IHtcclxuICAgIHJlbmRlckVkaXQ6IGRlZmF1bHRCdXR0b25FZGl0UmVuZGVyLFxyXG4gICAgcmVuZGVyRGVmYXVsdDogZGVmYXVsdEJ1dHRvbkVkaXRSZW5kZXIsXHJcbiAgICByZW5kZXJJdGVtOiBkZWZhdWx0QnV0dG9uSXRlbVJlbmRlclxyXG4gIH0sXHJcbiAgQnV0dG9uczoge1xyXG4gICAgcmVuZGVyRWRpdDogZGVmYXVsdEJ1dHRvbnNFZGl0UmVuZGVyLFxyXG4gICAgcmVuZGVyRGVmYXVsdDogZGVmYXVsdEJ1dHRvbnNFZGl0UmVuZGVyLFxyXG4gICAgcmVuZGVySXRlbTogZGVmYXVsdEJ1dHRvbnNJdGVtUmVuZGVyXHJcbiAgfVxyXG59XHJcblxyXG4vKipcclxuICog5qOA5p+l6Kem5Y+R5rqQ5piv5ZCm5bGe5LqO55uu5qCH6IqC54K5XHJcbiAqL1xyXG5mdW5jdGlvbiBnZXRFdmVudFRhcmdldE5vZGUgKGV2bnQ6IGFueSwgY29udGFpbmVyOiBIVE1MRWxlbWVudCwgY2xhc3NOYW1lOiBzdHJpbmcpIHtcclxuICBsZXQgdGFyZ2V0RWxlbVxyXG4gIGxldCB0YXJnZXQgPSBldm50LnRhcmdldFxyXG4gIHdoaWxlICh0YXJnZXQgJiYgdGFyZ2V0Lm5vZGVUeXBlICYmIHRhcmdldCAhPT0gZG9jdW1lbnQpIHtcclxuICAgIGlmIChjbGFzc05hbWUgJiYgdGFyZ2V0LmNsYXNzTmFtZSAmJiB0YXJnZXQuY2xhc3NOYW1lLnNwbGl0ICYmIHRhcmdldC5jbGFzc05hbWUuc3BsaXQoJyAnKS5pbmRleE9mKGNsYXNzTmFtZSkgPiAtMSkge1xyXG4gICAgICB0YXJnZXRFbGVtID0gdGFyZ2V0XHJcbiAgICB9IGVsc2UgaWYgKHRhcmdldCA9PT0gY29udGFpbmVyKSB7XHJcbiAgICAgIHJldHVybiB7IGZsYWc6IGNsYXNzTmFtZSA/ICEhdGFyZ2V0RWxlbSA6IHRydWUsIGNvbnRhaW5lciwgdGFyZ2V0RWxlbTogdGFyZ2V0RWxlbSB9XHJcbiAgICB9XHJcbiAgICB0YXJnZXQgPSB0YXJnZXQucGFyZW50Tm9kZVxyXG4gIH1cclxuICByZXR1cm4geyBmbGFnOiBmYWxzZSB9XHJcbn1cclxuXHJcbi8qKlxyXG4gKiDkuovku7blhbzlrrnmgKflpITnkIZcclxuICovXHJcbmZ1bmN0aW9uIGhhbmRsZUNsZWFyRXZlbnQgKHBhcmFtczogSW50ZXJjZXB0b3JQYXJhbXMsIGU6IGFueSkge1xyXG4gIGNvbnN0IGJvZHlFbGVtOiBIVE1MRWxlbWVudCA9IGRvY3VtZW50LmJvZHlcclxuICBjb25zdCBldm50ID0gcGFyYW1zLiRldmVudCB8fCBlXHJcbiAgaWYgKFxyXG4gICAgLy8g5LiL5ouJ5qGG44CB5pel5pyfXHJcbiAgICBnZXRFdmVudFRhcmdldE5vZGUoZXZudCwgYm9keUVsZW0sICdpdnUtc2VsZWN0LWRyb3Bkb3duJykuZmxhZ1xyXG4gICkge1xyXG4gICAgcmV0dXJuIGZhbHNlXHJcbiAgfVxyXG59XHJcblxyXG4vKipcclxuICog5Z+65LqOIHZ4ZS10YWJsZSDooajmoLznmoTpgILphY3mj5Lku7bvvIznlKjkuo7lhbzlrrkgaXZpZXcg57uE5Lu25bqTXHJcbiAqL1xyXG5leHBvcnQgY29uc3QgVlhFVGFibGVQbHVnaW5JVmlldyA9IHtcclxuICBpbnN0YWxsICh7IGludGVyY2VwdG9yLCByZW5kZXJlciB9OiB0eXBlb2YgVlhFVGFibGUpIHtcclxuICAgIHJlbmRlcmVyLm1peGluKHJlbmRlck1hcClcclxuICAgIGludGVyY2VwdG9yLmFkZCgnZXZlbnQuY2xlYXJGaWx0ZXInLCBoYW5kbGVDbGVhckV2ZW50KVxyXG4gICAgaW50ZXJjZXB0b3IuYWRkKCdldmVudC5jbGVhckFjdGl2ZWQnLCBoYW5kbGVDbGVhckV2ZW50KVxyXG4gIH1cclxufVxyXG5cclxuaWYgKHR5cGVvZiB3aW5kb3cgIT09ICd1bmRlZmluZWQnICYmIHdpbmRvdy5WWEVUYWJsZSkge1xyXG4gIHdpbmRvdy5WWEVUYWJsZS51c2UoVlhFVGFibGVQbHVnaW5JVmlldylcclxufVxyXG5cclxuZXhwb3J0IGRlZmF1bHQgVlhFVGFibGVQbHVnaW5JVmlld1xyXG4iXX0=
