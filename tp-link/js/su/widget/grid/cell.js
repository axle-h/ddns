(function () {
	var Cell = $.su.Widget.register('cell', {
		settings: {},

		init: function () {},

		render: function () {},

		initCell: function (key, kndex, options) {
			var settings = {
				rowKey: key,
				columns: options.configs.columns,
				cellId: kndex,
				objs: options.objs
			};
			var convertEmptyCellValue = function (val) {
				return val === undefined || val === null || val === '' ? '---' : val;
			};
			var modelData = options.objs.modelMap[key].getData();
			var column = settings.columns[kndex];
			var len = settings.columns.length;
			var dd = convertEmptyCellValue(modelData[column.dataIndex]);
			var fst = kndex === 0 ? 'fst' : '';
			var lst = kndex === len - 1 ? 'lst' : '';

			var inHTML = '';
			var cellClass = column.cls || '';
			if (cellClass) {
				cellClass += ' ';
			}
			var cellAttr = '';
			var cell = {
				domId: settings.objs.grid.domId + '_tr_' + $.appUtils.keyHandler(key) + '_td_' + kndex,
				domContent: '',
				column: column,
				field: column.dataIndex || false,
				renderer: function (val, row) {
					var convert = function (row) {
						for (var prop in row) {
							if (row.hasOwnProperty(prop)) {
								var type = typeof row[prop];
								if (type === 'string') {
									row[prop] = $.su.escapeHtml(row[prop]);
								} else if (type === 'object') {
									if (row[prop] != null) {
										row[prop] = convert(row[prop]);
									}
								}
							}
						}
						return row;
					};
					row = convert(row);

					if (typeof val == 'string') {
						val = $.su.escapeHtml(val);
					}

					if (column.renderer) {
						return column.renderer(val, row);
					} else {
						return convertEmptyCellValue(val);
					}
				}
				// renderer: column.renderer || function(val) {
				// 	return convertEmptyCellValue(val);
				// }
			};
			// $('<td id="' + settings.objs.grid.domId + '_tr_' + $.appUtils.keyHandler(key) + '_td_' + kndex + '"></td>');
			// $('#' + settings.objs.grid.domId + '_tr_' + $.appUtils.keyHandler(key)).append(cell);

			if (options.editor) {
				if (0 === kndex) {
					cell.addClass('grid-content-td grid-content-td-0').css({ position: 'relative' });
				} else if (column.dataIndex) {
					cell.addClass('grid-content-td grid-content-td-' + kndex).append($(options.editorItems[column.dataIndex]));
				} else {
					cell.addClass('grid-content-td grid-content-td-' + kndex);
				}
			} else {
				switch (column.xtype) {
					case 'rownumberer':
						cellClass += 'grid-content-td grid-content-td-' + kndex + ' grid-content-td-row-numberer ' + fst + ' ' + lst + ' ' + column.cls;
						cellAttr += ' name="row-numberer"';
						inHTML += '<span class="grid-row-numberer content"></span>';
						break;

					case 'checkcolumn':
						var selected = options.objs.modelMap[key].selected;
						cellClass += ' grid-content-td grid-content-td-' + kndex + ' grid-content-td-check-column ' + fst + ' ' + lst;
						cellAttr += ' name="check-column"';
						//inHTML += 		'<input type="checkbox"/>';
						inHTML += '<div class="checkbox-group-container">';
						inHTML += '<div class="widget-wrap">';
						inHTML += '<label class="checkbox-label ' + (selected ? 'checked' : '') + '">';
						inHTML += '<input class="checkbox-checkbox" ' + (selected ? ' checked="checked" ' : ' ') + ' type="checkbox" value="' + key + '"/>';
						inHTML += '<span class="icon"></span>';
						inHTML += '</label>';
						inHTML += '</div>';
						inHTML += '</div>';
						inHTML += '<span class="content">--</span>';
						break;
					case 'statuscolumn':
						var res = '',
							cls = '',
							val = '',
							trueValue = column.trueValue || 'on',
							falseValue = column.falseValue || 'off';

						res = $.su.CHAR.GRID.DISABLED;
						cls = 'disabled';
						val = falseValue;

						cellClass += 'grid-content-td grid-content-td-' + kndex + ' grid-content-td-status-column ' + fst + ' ' + lst;
						cellAttr += ' name="check-column"';
						// cellObj.statusColumn = true;
						inHTML +=
							'<a data-index="' +
							kndex +
							'" data-name="' +
							column.dataIndex +
							'" data-value="' +
							val +
							'" data-key="' +
							key +
							'" data-on="' +
							trueValue +
							'" data-off="' +
							falseValue +
							'" class="grid-content-btn grid-content-btn-status btn-status ' +
							cls +
							'">';
						inHTML += '<span class="icon"></span>';
						inHTML += '<span class="text">' + res + '</span>';
						inHTML += '</a>';

						break;
					case 'settings':
						settings.objs.grid.dom().addClass('settings');
						cellClass += 'grid-content-td grid-content-td-' + kndex + ' grid-content-td-settings-column ' + fst + ' ' + lst;
						cellAttr == ' name="settings-column"';
						inHTML += '<div class="grid-btn-container">';
						if (column.items === undefined || $.inArray('edit', column.items) !== -1) {
							inHTML += '<a data-index="' + kndex + '" data-key="' + key + '" ' + 'class="grid-content-btn grid-content-btn-edit btn-edit">';
							inHTML += '<span class="icon"></span>';
							inHTML += '<span class="text">' + $.su.CHAR.OPERATION.EDIT + '</span>';
							inHTML += '</a>';
						}
						if (column.items === undefined || $.inArray('delete', column.items) !== -1) {
							inHTML += '<a data-index="' + kndex + '" data-key="' + key + '" ' + 'class="grid-content-btn grid-content-btn-delete btn-delete">';
							inHTML += '<span class="icon"></span>';
							inHTML += '<span class="text">' + $.su.CHAR.OPERATION.DELETE + '</span>';
							inHTML += '</a>';
						}
						inHTML += '<div>';
						break;
					case 'actioncolumn':
						settings.objs.grid.dom().addClass('actioncolumn');
						cellClass += 'grid-content-td grid-content-td-' + kndex + ' grid-content-td-action-column ' + fst + ' ' + lst;
						cellAttr += ' name="action-column"';
						inHTML += '<div class="grid-content-td-wrap" data-key="' + key + '">';
						inHTML += cell.renderer.call(cell, dd, settings.objs.modelMap[key].getData());
						inHTML += '</div>';
						break;
					case 'btn':
						cellClass += 'grid-content-td grid-content-td-' + kndex + ' ' + fst + ' ' + lst;
						cellAttr += ' name="btn-column"';
						break;
					case 'customWidget':
						var name = column.widgetName;
						cellClass += 'grid-content-td grid-content-td-' + kndex + ' grid-content-td-' + column.name + ' ' + fst + ' ' + lst + ' ' + column.cls;
						cellAttr += ' name="' + name + '"';
						if (name) {
							var className = name == 'textbox' && cell.renderer.call(cell, dd, settings.objs.modelMap[key].getData()) !== 'false' ? 'hidden' : '';
							var widgetDom = '<div widget="' + name + '" id="' + $.su.randomId('grid-content-custom-widget') + '" class="' + className + '"></div>';
							inHTML += widgetDom;
							if (column.renderer) {
								inHTML += '<div class="content">' + cell.renderer.call(cell, dd, settings.objs.modelMap[key].getData()) + '</div>';
							}
							// cellObj.customWidget = new $.su.widgets[name]({id: $(widgetDom)});
							// cellObj.customWidget.render();
						} else {
							inHTML += '<div class="content">' + cell.renderer.call(cell, dd, settings.objs.modelMap[key].getData()) + '</div>';
						}
						break;
					default:
						cellClass += 'grid-content-td grid-content-td-' + kndex + ' grid-content-td-' + column.name + ' ' + fst + ' ' + lst + ' ' + column.cls;
						cellAttr += ' name="' + column.name + '"';
						inHTML += '<div class="content">' + cell.renderer.call(cell, dd, settings.objs.modelMap[key].getData()) + '</div>';
						break;
				}
			}

			// cell.append(inHTML);
			cell.domContent =
				'<td id="' +
				cell.domId +
				'" class="' +
				cellClass +
				'" ' +
				cellAttr +
				'><div class="td-label">' +
				column.text +
				'<span class="content-separator">:</span></div><div class="td-content">' +
				inHTML +
				'</div></td>';

			cell.callback = function () {
				var cellObj = this;
				var widget = $('#' + cell.domId).find('div[widget]');
				if (widget.length > 0) {
					var name = cellObj.dom().attr('name');
					cellObj.customWidget = new $.su.widgets[name]({ id: widget, customSettings: cellObj.column.settings });
					cellObj.customWidget.render();
					$('#' + cell.domId)
						.find('div[widget]')
						.on('ev_view_change', function (e, data) {
							cellObj.dom().triggerHandler('ev_view_change', [data]);
							settings.objs.grid.dom().triggerHandler('ev_grid_custom_change', [data, cellObj.customWidget, settings.rowKey, column]);
						});
				}
			};

			cell.settings = settings;
			return cell;
		},
		getValue: function () {
			var _this = this.dom();

			if (this.statusColumn) {
				var a = _this.find('a');
				if (a.length) {
					return a.attr('data-value');
				}
				return false;
			} else {
				return this.dom()
					.find('div.content')
					.text()
					.replace(/\u00A0/g, ' ');
			}
		},
		setValue: function (value) {
			var _this = this.dom();
			var settings = this.settings;
			var index = settings.cellId;
			var column = settings.columns[index];
			var trueValue = column.trueValue || 'on';
			var falseValue = column.falseValue || 'off';
			var res, cls, val;
			var rowValue = this.settings.objs.modelMap[this.settings.rowKey].getData();

			if ($.type(value) === 'string') {
				value = $.su.transSpecialChar(value);
			}

			var renderValue = this.renderer(value, rowValue, settings.objs.rows.length - 1);

			if (this.statusColumn) {
				if (renderValue === 'on') {
					res = $.su.CHAR.GRID.ENABLED;
					cls = 'enabled';
					val = trueValue;
				} else {
					res = $.su.CHAR.GRID.DISABLED;
					cls = 'disabled';
					val = falseValue;
				}
				_this.find('a').removeClass('enabled disabled').addClass(cls).attr('data-value', val);
				_this.find('span.text').text(res);
			} else if (this.customWidget) {
				if (column.renderer && renderValue !== false) {
					if (column.widgetName == 'progressbar') {
						this.customWidget.show();
						this.customWidget.setValue(renderValue[0]);
						this.dom().find('div.content').show().html(renderValue[1]);
					} else if (column.widgetName == 'combobox' && column.showRenderer) {
						if (renderValue == '---') {
							this.customWidget.hide();
							this.dom().find('div.content').show().html(renderValue);
						} else {
							this.customWidget.show();
							this.customWidget.setValue(value);
							this.dom().find('div.content').show().html(renderValue);
						}
					} else {
						this.customWidget.hide();
						this.dom().find('div.content').show().html(renderValue);
					}
				} else {
					this.dom().find('div.content').hide();
					this.customWidget.show();
					this.customWidget.setValue(value);
				}
			} else {
				this.dom().find('div.td-content').html(renderValue);
			}
		},
		hideButton: function (className) {
			var _this = this.dom();
			_this.find(className).hide();
		},
		showButton: function (className) {
			var _this = this.dom();
			_this.find(className).show();
		},
		getInnerWidget: function () {
			return this.customWidget;
		},
		getInnerWidgetChange: function (option) {
			this.customWidget[option]();
		},
		getDisplay: function () {
			var _this = this.dom();
			if (this.customWidget) {
				switch (this.customWidget.type) {
					case 'grid':
						return this.customWidget;
						break;
					case 'combobox':
						return this.customWidget.getText();
						break;
					case 'textbox':
						return this.customWidget.getValue();
						break;
					default:
						return this.customWidget.getValue();
				}
			} else {
				return _this.find('div.content').text();
			}
		}
	});
})();
