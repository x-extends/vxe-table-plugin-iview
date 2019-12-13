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

    var on = _defineProperty({}, type, function () {
      return $table.updateStatus(params);
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
    return ['' + (cellValue === null || cellValue === void 0 ? '' : cellValue)];
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
      filterMethod: defaultFilterMethod
    },
    AutoComplete: {
      autofocus: 'input.ivu-input',
      renderDefault: createEditRender(),
      renderEdit: createEditRender(),
      renderFilter: createFilterRender(),
      filterMethod: defaultFilterMethod
    },
    InputNumber: {
      autofocus: 'input.ivu-input-number-input',
      renderDefault: createEditRender(),
      renderEdit: createEditRender(),
      renderFilter: createFilterRender(),
      filterMethod: defaultFilterMethod
    },
    Select: {
      renderEdit: function renderEdit(h, renderOpts, params) {
        var options = renderOpts.options,
            optionGroups = renderOpts.optionGroups,
            _renderOpts$optionPro = renderOpts.optionProps,
            optionProps = _renderOpts$optionPro === void 0 ? {} : _renderOpts$optionPro,
            _renderOpts$optionGro = renderOpts.optionGroupProps,
            optionGroupProps = _renderOpts$optionGro === void 0 ? {} : _renderOpts$optionGro;
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
        var options = renderOpts.options,
            optionGroups = renderOpts.optionGroups,
            _renderOpts$props = renderOpts.props,
            props = _renderOpts$props === void 0 ? {} : _renderOpts$props,
            _renderOpts$optionPro2 = renderOpts.optionProps,
            optionProps = _renderOpts$optionPro2 === void 0 ? {} : _renderOpts$optionPro2,
            _renderOpts$optionGro2 = renderOpts.optionGroupProps,
            optionGroupProps = _renderOpts$optionGro2 === void 0 ? {} : _renderOpts$optionGro2;
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

        if (!(cellValue === null || cellValue === undefined || cellValue === '')) {
          return cellText(h, _xeUtils["default"].map(props.multiple ? cellValue : [cellValue], optionGroups ? function (value) {
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
          }).join(';'));
        }

        return cellText(h, '');
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
      filterMethod: function filterMethod(_ref4) {
        var option = _ref4.option,
            row = _ref4.row,
            column = _ref4.column;
        var data = option.data;
        var property = column.property,
            renderOpts = column.filterRender;
        var _renderOpts$props2 = renderOpts.props,
            props = _renderOpts$props2 === void 0 ? {} : _renderOpts$props2;

        var cellValue = _xeUtils["default"].get(row, property);

        if (props.multiple) {
          if (_xeUtils["default"].isArray(cellValue)) {
            return _xeUtils["default"].includeArrays(cellValue, data);
          }

          return data.indexOf(cellValue) > -1;
        }
        /* eslint-disable eqeqeq */


        return cellValue == data;
      }
    },
    Cascader: {
      renderEdit: createEditRender({
        transfer: true
      }),
      renderCell: function renderCell(h, _ref5, params) {
        var _ref5$props = _ref5.props,
            props = _ref5$props === void 0 ? {} : _ref5$props;
        var row = params.row,
            column = params.column;

        var cellValue = _xeUtils["default"].get(row, column.property);

        var values = cellValue || [];
        var labels = [];
        matchCascaderData(0, props.data, values, labels);
        return cellText(h, labels.join(" ".concat(props.separator || '/', " ")));
      }
    },
    DatePicker: {
      renderEdit: createEditRender({
        transfer: true
      }),
      renderCell: function renderCell(h, _ref6, params) {
        var _ref6$props = _ref6.props,
            props = _ref6$props === void 0 ? {} : _ref6$props;
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

        return cellText(h, cellValue);
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
        var _renderOpts$props3 = renderOpts.props,
            props = _renderOpts$props3 === void 0 ? {} : _renderOpts$props3;

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
      }
    },
    TimePicker: {
      renderEdit: createEditRender({
        transfer: true
      })
    },
    Rate: {
      renderDefault: createEditRender(),
      renderEdit: createEditRender(),
      renderFilter: createFilterRender(),
      filterMethod: defaultFilterMethod
    },
    iSwitch: {
      renderDefault: createEditRender(),
      renderEdit: createEditRender(),
      renderFilter: createFilterRender(),
      filterMethod: defaultFilterMethod
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
  _exports.VXETablePluginIView = VXETablePluginIView;

  if (typeof window !== 'undefined' && window.VXETable) {
    window.VXETable.use(VXETablePluginIView);
  }

  var _default = VXETablePluginIView;
  _exports["default"] = _default;
});