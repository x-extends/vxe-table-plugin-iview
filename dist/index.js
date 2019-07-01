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
})(this, function (_exports, _xeUtils) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports["default"] = void 0;
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

  function getCellEvents(editRender, params) {
    var events = editRender.events;
    var $table = params.$table;
    var type = 'on-change';

    var on = _defineProperty({}, type, function () {
      return $table.updateStatus(params);
    });

    if (events) {
      _xeUtils["default"].assign(on, _xeUtils["default"].objectMap(events, function (cb) {
        return function () {
          cb.apply(null, [params].concat.apply(params, arguments));
        };
      }));
    }

    return on;
  }

  function defaultCellRender(h, editRender, params) {
    var $table = params.$table,
        row = params.row,
        column = params.column;
    var props = editRender.props;

    if ($table.vSize) {
      props = _xeUtils["default"].assign({
        size: $table.vSize
      }, props);
    }

    return [h(editRender.name, {
      props: props,
      model: {
        value: _xeUtils["default"].get(row, column.property),
        callback: function callback(value) {
          _xeUtils["default"].set(row, column.property, value);
        }
      },
      on: getCellEvents(editRender, params)
    })];
  }

  function getFilterEvents(on, filterRender, params) {
    var events = filterRender.events;

    if (events) {
      _xeUtils["default"].assign(on, _xeUtils["default"].objectMap(events, function (cb) {
        return function () {
          cb.apply(null, [params].concat.apply(params, arguments));
        };
      }));
    }

    return on;
  }

  function defaultFilterRender(h, filterRender, params, context) {
    var $table = params.$table,
        column = params.column;
    var name = filterRender.name,
        props = filterRender.props;
    var type = 'on-change';

    if ($table.vSize) {
      props = _xeUtils["default"].assign({
        size: $table.vSize
      }, props);
    }

    return column.filters.map(function (item) {
      return h(name, {
        props: props,
        model: {
          value: item.data,
          callback: function callback(optionValue) {
            item.data = optionValue;
          }
        },
        on: getFilterEvents(_defineProperty({}, type, function () {
          context.changeMultipleOption({}, !!item.data, item);
        }), filterRender, params)
      });
    });
  }

  function defaultFilterMethod(_ref) {
    var option = _ref.option,
        row = _ref.row,
        column = _ref.column;
    var data = option.data;

    var cellValue = _xeUtils["default"].get(row, column.property);

    return cellValue === data;
  }

  function cellText(h, cellValue) {
    return ['' + (cellValue === null || cellValue === void 0 ? '' : cellValue)];
  }
  /**
   * 渲染函数
   * renderEdit(h, editRender, params, context)
   * renderCell(h, editRender, params, context)
   */


  var renderMap = {
    Input: {
      autofocus: 'input.ivu-input',
      renderEdit: defaultCellRender,
      renderFilter: defaultFilterRender,
      filterMethod: defaultFilterMethod
    },
    AutoComplete: {
      autofocus: 'input.ivu-input',
      renderEdit: defaultCellRender,
      renderFilter: defaultFilterRender,
      filterMethod: defaultFilterMethod
    },
    InputNumber: {
      autofocus: 'input.ivu-input-number-input',
      renderEdit: defaultCellRender,
      renderFilter: defaultFilterRender,
      filterMethod: defaultFilterMethod
    },
    Select: {
      renderEdit: function renderEdit(h, editRender, params) {
        var options = editRender.options,
            optionGroups = editRender.optionGroups,
            _editRender$props = editRender.props,
            props = _editRender$props === void 0 ? {} : _editRender$props,
            _editRender$optionPro = editRender.optionProps,
            optionProps = _editRender$optionPro === void 0 ? {} : _editRender$optionPro,
            _editRender$optionGro = editRender.optionGroupProps,
            optionGroupProps = _editRender$optionGro === void 0 ? {} : _editRender$optionGro;
        var $table = params.$table,
            row = params.row,
            column = params.column;
        var labelProp = optionProps.label || 'label';
        var valueProp = optionProps.value || 'value';

        if ($table.vSize) {
          props = _xeUtils["default"].assign({
            size: $table.vSize
          }, props);
        }

        if (optionGroups) {
          var groupOptions = optionGroupProps.options || 'options';
          var groupLabel = optionGroupProps.label || 'label';
          return [h('Select', {
            props: props,
            model: {
              value: _xeUtils["default"].get(row, column.property),
              callback: function callback(cellValue) {
                _xeUtils["default"].set(row, column.property, cellValue);
              }
            },
            on: getCellEvents(editRender, params)
          }, _xeUtils["default"].map(optionGroups, function (group, gIndex) {
            return h('OptionGroup', {
              props: {
                label: group[groupLabel]
              },
              key: gIndex
            }, _xeUtils["default"].map(group[groupOptions], function (item, index) {
              return h('Option', {
                props: {
                  value: item[valueProp],
                  label: item[labelProp]
                },
                key: index
              });
            }));
          }))];
        }

        return [h('Select', {
          props: props,
          model: {
            value: _xeUtils["default"].get(row, column.property),
            callback: function callback(cellValue) {
              _xeUtils["default"].set(row, column.property, cellValue);
            }
          },
          on: getCellEvents(editRender, params)
        }, _xeUtils["default"].map(options, function (item, index) {
          return h('Option', {
            props: {
              value: item[valueProp],
              label: item[labelProp]
            },
            key: index
          });
        }))];
      },
      renderCell: function renderCell(h, editRender, params) {
        var options = editRender.options,
            optionGroups = editRender.optionGroups,
            _editRender$props2 = editRender.props,
            props = _editRender$props2 === void 0 ? {} : _editRender$props2,
            _editRender$optionPro2 = editRender.optionProps,
            optionProps = _editRender$optionPro2 === void 0 ? {} : _editRender$optionPro2,
            _editRender$optionGro2 = editRender.optionGroupProps,
            optionGroupProps = _editRender$optionGro2 === void 0 ? {} : _editRender$optionGro2;
        var row = params.row,
            column = params.column;
        var labelProp = optionProps.label || 'label';
        var valueProp = optionProps.value || 'value';
        var groupOptions = optionGroupProps.options || 'options';

        var cellValue = _xeUtils["default"].get(row, column.property);

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

            return selectItem ? selectItem[labelProp] : null;
          } : function (value) {
            var selectItem = _xeUtils["default"].find(options, function (item) {
              return item[valueProp] === value;
            });

            return selectItem ? selectItem[labelProp] : null;
          }).join(';'));
        }

        return cellText(h, '');
      }
    },
    Cascader: {
      renderEdit: defaultCellRender,
      renderCell: function renderCell(h, _ref2, params) {
        var _ref2$props = _ref2.props,
            props = _ref2$props === void 0 ? {} : _ref2$props;
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
      renderEdit: defaultCellRender,
      renderCell: function renderCell(h, _ref3, params) {
        var _ref3$props = _ref3.props,
            props = _ref3$props === void 0 ? {} : _ref3$props;
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
      renderFilter: function renderFilter(h, filterRender, params, context) {
        var $table = params.$table,
            column = params.column;
        var props = filterRender.props;

        if ($table.vSize) {
          props = _xeUtils["default"].assign({
            size: $table.vSize
          }, props);
        }

        return column.filters.map(function (item) {
          return h(filterRender.name, {
            props: props,
            model: {
              value: item.data,
              callback: function callback(optionValue) {
                item.data = optionValue;
              }
            },
            on: getFilterEvents({
              'on-change': function onChange(value) {
                // 当前的选项是否选中，如果有值就是选中了，需要进行筛选
                context.changeMultipleOption({}, value && value.length > 0, item);
              }
            }, filterRender, params)
          });
        });
      },
      filterMethod: function filterMethod(_ref4) {
        var option = _ref4.option,
            row = _ref4.row,
            column = _ref4.column;
        var data = option.data;
        var filterRender = column.filterRender;
        var _filterRender$props = filterRender.props,
            props = _filterRender$props === void 0 ? {} : _filterRender$props;

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
      renderEdit: defaultCellRender
    },
    Rate: {
      renderEdit: defaultCellRender
    },
    iSwitch: {
      renderEdit: defaultCellRender
    }
    /**
     * 筛选兼容性处理
     */

  };

  function handleClearFilterEvent(params, evnt, context) {
    var getEventTargetNode = context.getEventTargetNode;

    if ( // 下拉框、日期
    getEventTargetNode(evnt, document.body, 'ivu-select-dropdown').flag) {
      return false;
    }
  }
  /**
   * 单元格兼容性处理
   */


  function handleClearActivedEvent(params, evnt, context) {
    var getEventTargetNode = context.getEventTargetNode;

    if ( // 下拉框、日期
    getEventTargetNode(evnt, document.body, 'ivu-select-dropdown').flag) {
      return false;
    }
  }

  function VXETablePluginIView() {}

  VXETablePluginIView.install = function (_ref5) {
    var interceptor = _ref5.interceptor,
        renderer = _ref5.renderer;
    // 添加到渲染器
    renderer.mixin(renderMap); // 处理事件冲突

    interceptor.add('event.clear_filter', handleClearFilterEvent);
    interceptor.add('event.clear_actived', handleClearActivedEvent);
  };

  if (typeof window !== 'undefined' && window.VXETable) {
    window.VXETable.use(VXETablePluginIView);
  }

  var _default = VXETablePluginIView;
  _exports["default"] = _default;
});