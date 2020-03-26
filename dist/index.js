(function (global, factory) {
  if (typeof define === "function" && define.amd) {
    define("vxe-table-plugin-iview", ["exports", "xe-utils"], factory);
  } else if (typeof exports !== "undefined") {
    factory(exports, require("xe-utils"));
  } else {
    var mod = {
      exports: {}
    };
    factory(mod.exports, global.XEUtils);
    global.VXETablePluginIView = mod.exports.default;
  }
})(typeof globalThis !== "undefined" ? globalThis : typeof self !== "undefined" ? self : this, function (_exports, _xeUtils) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports["default"] = _exports.VXETablePluginIView = void 0;
  _xeUtils = _interopRequireDefault(_xeUtils);

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
  _exports.VXETablePluginIView = VXETablePluginIView;

  if (typeof window !== 'undefined' && window.VXETable) {
    window.VXETable.use(VXETablePluginIView);
  }

  var _default = VXETablePluginIView;
  _exports["default"] = _default;
});