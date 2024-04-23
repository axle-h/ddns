(function () {
	var Grid = $.su.Widget.register('grid', {
		settings: {
			operation: {
				attribute: 'operation', // add|deleteAll|refresh|delete
				defaultValue: null
			},
			plugins: {
				attribute: 'plugins',
				defaultValue: '' // options: paging, editor, rowEditor
			},
			minLines: {
				attribute: 'min-lines',
				defaultValue: 0
			},
			multiSelect: {
				attribute: 'multi-select',
				defaultValue: false
			},
			multiSelectMax: {
				attribute: 'multi-select-max',
				defaultValue: false
			},
			selectAll: {
				attribute: 'select-all',
				defaultValue: false
			},
			selectType: {
				attribute: 'select-type',
				defaultValue: 'row' // row | checkbox
			},
			rowSelect: {
				attribute: 'row-select',
				defaultValue: false
			},
			xScroll: {
				attribute: 'x-scroll',
				defaultValue: false
			},
			maxLines: {
				attribute: 'max-lines',
				defaultValue: false
			},
			showPrompt: {
				attribute: 'show-prompt',
				defaultValue: true
			},
			configs: {
				attribute: 'configs',
				defaultValue: null
			},
			delAllText: {
				attribute: 'del-all-text',
				defaultValue: $.su.CHAR.COMMON.DELETE_CONFIRM_CONTENT
			},
			maxRulesText: {
				attribute: 'max-rules-text',
				defaultValue: $.su.CHAR.GRID.MAX_RULES_TIPS
			},
			emptyText: {
				attribute: 'empty-text',
				defaultValue: $.su.CHAR.COMMON.NO_ENTRY
			},
			autoMinHeight: {
				attribute: 'auto-min-height',
				defaultValue: false
			}
		},
		listeners: [
			{
				selector: 'td.grid-content-td-check-column label.checkbox-label',
				event: 'click',
				callback: function (e, viewObj, selectedFlag) {
					e.stopPropagation();
					e.preventDefault();

					var _this = viewObj.dom();
					var index;
					var label = $(this);
					var tr = label.closest('tr.grid-content-tr');
					var key = viewObj.getKeyById(tr.attr('id'));
					var checkbox = label.find('input[type=checkbox]');

					if (tr.hasClass('disabled')) {
						return;
					}

					if (viewObj.settings.multiSelect === false) {
						var checkboxes = _this.find('tr.grid-content-tr').find('input[type=checkbox]');
						_this.find('tr.grid-content-tr').each(function () {
							var k = viewObj.getKeyById($(this).attr('id'));
							if ($(this).hasClass('selected')) {
								_this.triggerHandler('ev_grid_row_unselected', [k]);
							}
						});
						checkboxes.each(function () {
							$(this).prop('checked', false);
							$(this).closest('label.checkbox-label').removeClass('checked');
							$(this).closest('tr.grid-content-tr').removeClass('selected');
						});
						checkbox.prop('checked', true);
						label.addClass('checked');
						tr.addClass('selected');
						viewObj.dom().triggerHandler('ev_grid_row_selected', [key]);
					} else if (viewObj.settings.multiSelect === true) {
						tr.toggleClass('selected');
						if (tr.hasClass('selected')) {
							checkbox.prop('checked', true);
							label.addClass('checked');
							viewObj.dom().triggerHandler('ev_grid_row_selected', [key]);
						} else {
							checkbox.prop('checked', false);
							label.removeClass('checked');
							viewObj.dom().triggerHandler('ev_grid_row_unselected', [key]);
						}
					}

					if (selectedFlag !== 'unselected') {
						_this.triggerHandler('ev_grid_row_clicked', [key]);
					}

					viewObj.checkSelected();
					//如果勾选框不全选或全选了，同步th上的勾选框
					var trList = _this.find('tr.grid-content-tr');
					label = _this.find('tr.grid-header-tr label.checkbox-label');
					var container = label.closest('div.checkbox-group-container');
					if (trList.length > 0) {
						//不全选
						for (index = 0; index < trList.length; ++index) {
							if ($(trList[index]).hasClass('disabled')) {
								continue;
							}
							if (!$(trList[index]).hasClass('selected')) {
								break;
							}
						}
						if (index != trList.length) {
							container.removeClass('selected');
							label.removeClass('checked');
						}
						//全选
						for (index = 0; index < trList.length; ++index) {
							if ($(trList[index]).hasClass('disabled')) {
								continue;
							}
							if (!$(trList[index]).hasClass('selected')) {
								break;
							}
						}
						if (index == trList.length) {
							container.addClass('selected');
							label.addClass('checked');
						}
					}

					if (viewObj.settings.multiSelectMax) {
						viewObj.handleSelectMax();
					}
				}
			},
			{
				selector: 'th.grid-header div.checkcolumn label.checkbox-label',
				event: 'click',
				callback: function (e, viewObj) {
					e.stopPropagation();
					e.preventDefault();
					var _this = viewObj.dom();
					var label = $(this);
					var container = $(this).closest('div.checkbox-group-container');
					var trList = _this.find('tr.grid-content-tr:not(.disabled)');
					if (trList.hasClass('empty')) {
						return false;
					}
					if (container.hasClass('selected')) {
						container.removeClass('selected');

						trList.removeClass('selected');
						trList.find('label.checkbox-label').removeClass('checked');
						trList.find('input[type=checkbox]').prop('checked', false);

						label.find('input[type=checkbox]').prop('checked', false);
						label.removeClass('checked');

						viewObj.dom().triggerHandler('ev_grid_row_unselected_all', ['all']);
					} else {
						container.addClass('selected');

						trList.addClass('selected');
						trList.find('input[type=checkbox]').prop('checked', true);
						trList.find('label.checkbox-label').addClass('checked');

						label.find('input[type=checkbox]').prop('checked', true);
						label.addClass('checked');

						viewObj.dom().triggerHandler('ev_grid_row_selected_all', ['all']);
					}

					viewObj.checkSelected();
				}
			},
			{
				selector: 'td.grid-content-td-action-column a, td.custom-action-column a',
				event: 'click',
				callback: function (e, viewObj) {
					e.stopPropagation();
					e.preventDefault();

					var tr = $(this).closest('tr.grid-content-tr');
					var key = viewObj.getKeyById(tr.attr('id'));
					$(this).trigger('ev_grid_action_click', [key]);
				}
			},
			{
				selector: 'td.grid-content-td',
				event: 'click',
				callback: function (e, viewObj) {
					e.preventDefault();
					// e.stopPropagation();
					var tr = $(this).parent();
					var key = tr.attr('data-key');
					var settings = viewObj.settings;

					if ($(e.target).hasClass('grid-content-td') || $(e.target).hasClass('content')) {
						$(this).trigger('ev_grid_td_click', [key]);
					} else {
						$(this).trigger('ev_grid_action_click', [key]);
					}

					if (settings.rowSelect && settings.selectType == 'checkbox') {
						tr.find('td.grid-content-td-check-column label.checkbox-label').trigger('click');
					}
				}
			},
			{
				selector: '.grid-content-btn-edit',
				event: 'click',
				callback: function (e, viewObj) {
					e.stopPropagation();
					e.preventDefault();

					var tr = $(this).closest('tr.grid-content-tr');
					var key = viewObj.getKeyById(tr.attr('id'));
					var editor = viewObj.getPlugin('editor');

					if (editor && !editor.isEditing() && key !== false && !tr.hasClass('disabled')) {
						var func = function () {
							editor.startEdit(key);
							viewObj.dom().triggerHandler('ev_grid_edit', [key]);
						};
						var defaultEvent = $.su.getDefaultEvent(viewObj, func);

						viewObj.dom().triggerHandler('ev_grid_before_edit', [defaultEvent.ev, key]);
						defaultEvent.exe();
					}
				}
			},
			{
				selector: '.grid-content-btn-delete',
				event: 'click',
				callback: function (e, viewObj) {
					e.preventDefault();
					e.stopPropagation();

					var btn = $(this);
					var tr = btn.closest('tr.grid-content-tr');
					var editor = viewObj.getPlugin('editor');
					var key = viewObj.getKeyById(tr.attr('id'));

					if (tr.hasClass('disabled') || btn.hasClass('disabled') || key === false) {
						return;
					}

					if (!editor || editor.isEditing() === false) {
						var func = function () {
							viewObj.dom().triggerHandler('ev_grid_delete', [[key]]);
						};
						var defaultEvent = $.su.getDefaultEvent(viewObj, func);
						viewObj.dom().triggerHandler('ev_grid_before_item_delete', [defaultEvent.ev, key]);
						defaultEvent.exe();
					} else {
						editor.shake();
					}
				}
			},
			{
				selector: '',
				event: 'ev_widget_show',
				callback: function (e, viewObj) {
					viewObj.setGridHeight();
				}
			}
		],
		init: function () {
			var columns = this.settings.configs.columns.filter(function (item) {
				return !item.hideColumn;
			});

			this.settings.configs.columns = columns;

			var viewObj = this;
			this.objs = {};
			this.objs.grid = this;
			this.objs.modelMap = {};

			var trTool = $('<tr id="' + $.su.randomId('trTool') + '"></tr>');
			var tdTool = $('<td id="' + $.su.randomId('tdTool') + '"></td>');
			this.objs.row = new $.su.widgets.row({
				id: trTool,
				objs: viewObj.objs
			});
			this.objs.cell = new $.su.widgets.cell({
				id: tdTool
			});
			this._keys = [];
			this._renderMap = {};
			this.objs.rows = [];
		},
		render: function () {
			var _this = this.dom();
			var settings = this.settings;
			var columns = settings.configs.columns;
			var styleText = '<style type="text/css" name="column">';
			var hasBtn = false;
			var selectCls = settings.multiSelect ? '' : ' single-select';

			_this.addClass(settings.cls + 'grid-container' + selectCls);

			this.columnOffset = 0;

			for (var i = 0, len = columns.length; i < len; i++) {
				if (settings.selectType === 'row' && columns[i] && columns[i].xtype === 'checkcolumn') {
					columns.splice(i, 1);
					this.columnOffset -= 1;
				}
				if (columns[i] && columns[i].xtype === 'btn') {
					hasBtn = true;
				}
			}

			if (!hasBtn) {
				columns.unshift({
					width: 0,
					xtype: 'btn'
				});
				this.columnOffset += 1;
			}

			var inHTML = '';
			inHTML += '<div  id="' + this.domId + '-panel" class="grid-panel">';
			inHTML += '<div class="container widget-container grid-panel-container' + settings.cls + '">';
			inHTML += '<div class="grid-panel-wrap">';
			inHTML += '<div class="grid-panel-content">';
			inHTML += '<div class="grid-status-container hidden"></div>';
			inHTML += '<div class="grid-limit-container hidden"></div>';
			inHTML += '<div class="grid-panel-tbar-container tbar-container hidden"></div>';
			inHTML += '<div class="grid-panel-content-container">';
			inHTML += '<div class="container grid-container">';

			inHTML += '<div class="scroll-x-container">';

			inHTML += '<div class="container grid-header-container">';
			inHTML += '<table border="0" cellspacing="0" cellpadding="0">';
			inHTML += '<tr class="grid-header-tr">';

			for (var index = 0; index < columns.length; index++) {
				var column = columns[index];
				column.cls = column.cls || '';
				column.dataIndex = column.dataIndex || '';

				if (column.colspan === false) {
					continue;
				}

				if (column.width !== undefined) {
					if (typeof column.width == 'number') {
						column.width = column.width + 'px';
					}
					styleText += 'div#' + this.domId + ' th.grid-header-' + index + ',';
					styleText += 'div#' + this.domId + ' td.grid-tool-td-' + index + ',';
					styleText += 'div#' + this.domId + ' td.grid-content-td-' + index;
					styleText += '{width:' + column.width + ';';
					if (column.width === 0) {
						styleText += 'padding: 0;';
					}
					styleText += '}';
				}

				var addOn = '';

				switch (column.xtype) {
					case 'checkcolumn':
						if (settings.selectAll !== false) {
							addOn += '<div class="checkbox-group-container grid-header-checkbox checkcolumn inline">';
							addOn += '<div class="widget-wrap">';
							addOn += '<label class="checkbox-label">';
							addOn += '<input class="checkbox-checkbox" type="checkbox" value=""/>';
							addOn += '<span class="icon"></span>';
							addOn += '</label>';
							addOn += '</div>';
							addOn += '</div>';
						}
						column.text = column.text || '';
						column.name = column.name || 'select';
						break;
					case 'rownumberer':
						column.text = column.text || $.su.CHAR.GRID.ID;
						column.name = column.name || 'seq';
						break;
					case 'settings':
						column.text = column.text || $.su.CHAR.GRID.MODIFY;
						column.name = column.name || 'settings';
						break;
					case 'statuscolumn':
						column.text = column.text || $.su.CHAR.GRID.STATUS;
						column.dataIndex = column.dataIndex || '';
						column.name = column.name || column.dataIndex;
						break;
					default:
						column.text = column.text || '';
						column.name = column.name || column.dataIndex;
				}
				if (column.thRenderer) {
					inHTML += column.thRenderer();
				} else {
					var className = 'grid-header-' + (column.xtype || 'other') + (column.cls ? ' ' + column.cls : '');
					inHTML +=
						'<th class="grid-header grid-header-' +
						index +
						' ' +
						column.dataIndex +
						(index == columns.length - 1 ? ' lst' : '') +
						' ' +
						className +
						'" ' +
						(column.colspan ? 'colspan="' + column.colspan + '"' : '') +
						' name="' +
						column.dataIndex +
						'">';
					inHTML += addOn;
					inHTML += '<span class="content ' + (column.xtype || '') + '">' + column.text + '</span>';
					if (column.tipText) {
						inHTML += '<div widget="toolTip" data-index="' + index + '" class="grid-header-toolTip"></div>';
					}
					inHTML += '</th>';
				}
			}

			inHTML += '</tr>';
			inHTML += '</table>';
			inHTML += '</div>';
			inHTML += '<div class="grid-tool-container hidden"></div>';
			inHTML += '<div class="grid-content-container-outer">';
			inHTML += '<div class="grid-content-container">';
			inHTML += '<table border="0" cellspacing="0" cellpadding="0">';
			inHTML += '<tbody class="grid-content-data">';
			inHTML += '</tbody>';
			inHTML += '</table>';

			inHTML += '</div>';

			inHTML += '</div>';

			inHTML += '</div>';

			inHTML += '</div>';
			inHTML += '</div>';

			inHTML += '<div class="grid-panel-fbar-container"></div>';
			inHTML += '</div>';
			inHTML += '</div>';
			inHTML += '</div>';
			inHTML += '</div>';

			var grid = $(inHTML);
			_this.find('.grid-panel, .grid-prompt-msg').remove();
			_this.append(grid);
			if (!_this[0]) {
				return;
			}
			this.msgId = _this[0].id + '-prompt-msg';
			this.confirmId = _this[0].id + '-confirm-msg';

			_this.append($('<div class="grid-prompt-msg global-alert" widget="msg" type="alert" id = "' + this.msgId + '"></div>'));
			_this.append($('<div class="grid-confirm-msg global-confirm" widget="msg" type="confirm" id = "' + this.confirmId + '"></div>'));

			styleText += '</style>';
			grid.prepend($(styleText));

			//初始化plugins
			if (settings.plugins) {
				this.initPlugins(settings.plugins.split('|'));
			}
			this.initToolTip();
			// 支持横向滚动
			var scrollWidth = _this.find('div.grid-header-container>table').outerWidth();
			if (scrollWidth && settings.xScroll) {
				var scroll = _this.find('.scroll-x-container');
				scroll.css('width', scrollWidth + 10 + 'px');
				scroll.parent().css('overflow-x', 'auto');
			}
		},
		initToolTip: function () {
			var me = this;
			this.dom()
				.find('div[widget=toolTip]')
				.each(function (index, ele) {
					var columnIndex = $(ele).attr('data-index');
					var columnSetting = me.settings.configs.columns[columnIndex];
					new $.su.widgets.toolTip({ id: $(ele), tipText: columnSetting.tipText, sizeMapping: { l: 'm', xl: 'm' } }).render();
				});
		},
		initPlugins: function (plugin) {
			var _this = this.dom();
			var viewObj = this;
			var settings = this.settings;

			viewObj.plugins = {};

			plugin = $.isArray(plugin) ? plugin : [plugin];
			for (var i = 0, len = plugin.length; i < len; i++) {
				init(plugin[i]);
			}

			function init(p) {
				var options = $.extend({}, settings, {
					objs: viewObj.objs,
					plugins: viewObj.plugins
				});

				switch (p) {
					case 'tBar':
						$.extend(options, {
							custom: settings.configs.tbar
						});
						var tbar = $('<div id="' + viewObj.domId + '_bar" operation="' + settings.operation + '"></div>').appendTo(_this);
						viewObj.plugins.tBar = new $.su.widgets.tBar($.extend(options, { id: tbar }));
						viewObj.plugins.tBar.render();
						break;

					case 'rowEditor':
						var rowEditor = $('<div id="' + viewObj.domId + '_tr_editor"></div>').appendTo(_this);
						viewObj.plugins.rowEditor = new $.su.widgets.rowEditor($.extend(options, { id: rowEditor }));
						viewObj.plugins.rowEditor.render();
						break;

					default:
						var pluginDom = $('<div id="' + viewObj.domId + '_' + p + '"></div>').appendTo(_this);
						if ($.su.widgets[p]) {
							viewObj.plugins[p] = new $.su.widgets[p]($.extend(options, { id: pluginDom }));
							viewObj.plugins[p].render();
						}
						break;
				}
			}
		},
		getValue: function () {
			return this.objs.rows;
		},
		setValue: function () {
			return 0;
		},

		/**
		 * sync data keys from the store dataObj, consisting the whole data, regardless of paging config.
		 * the grid won't render all the rows if it has paging config, only render the rows of the current page.
		 *
		 *
		 * */
		syncData: function (keys, callback) {
			var viewObj = this;
			var grid = this.dom();
			var paging = viewObj.getPlugin('paging');

			viewObj.objs.rows = [];
			viewObj.objs.modelMap = {};
			viewObj._keys = keys;
			this._renderMap = {};

			if (paging) {
				paging.updateRowPage(keys);
				paging.updateBtns(keys);

				// setTimeout( function(){
				//    this.updateRow();
				// } ,10)
			} else {
				grid.triggerHandler('ev_store_render_items', [keys]);
			}
			if (this.settings.autoMinHeight) {
				grid.css('min-height', 0);
				grid.css('min-height', grid.outerHeight());
			}
		},
		renderModels: function (key, models, callback) {
			var viewObj = this;
			var settings = this.settings;
			var rowObj;
			var gridContent = '';
			var rowCollect = [];
			var options = $.extend({}, settings, { objs: viewObj.objs });
			var wrap = this.dom().find('tbody.grid-content-data').eq(0);
			var currentObjs = [];
			var paging = viewObj.getPlugin('paging');
			var pageMap = paging ? paging._pageMap : {};

			for (var i = 0, len = models.length; i < len; i++) {
				var keyVal = models[i][key].getValue();
				viewObj.objs.modelMap[keyVal] = models[i];
				rowObj = viewObj.objs.row.initRow(keyVal, options);
				rowCollect.push(rowObj);
				this._renderMap[keyVal] = true;
				gridContent += rowObj.domContent;
			}

			// Get Position
			if (paging) {
				if (models.length > 0) {
					var first = models[0][key].getValue();
					var index = $.inArray(first, this._keys);
					if (index !== -1) {
						if (index === 0) {
							wrap.prepend(gridContent);
						} else {
							// Find closest row before this row.
							var existDomKey;
							for (var keyPrev = index - 1; keyPrev >= 0; keyPrev--) {
								if (this._renderMap[this._keys[keyPrev]]) {
									existDomKey = this._keys[keyPrev];
									break;
								}
							}
							if (existDomKey) {
								wrap.find('tr[data-key="' + existDomKey + '"]').after(gridContent);
							} else {
								wrap.prepend(gridContent);
							}
						}
					}
				}
			} else {
				// wrap.html(gridContent);
				wrap.prepend(gridContent);
			}

			// Render rows and cells.
			for (var rowIndex = 0, rowNum = rowCollect.length; rowIndex < rowNum; rowIndex++) {
				var id = rowCollect[rowIndex].domId;
				var keyProp = rowCollect[rowIndex].key;
				var trObj = new $.su.widgets.row({ id: id });
				var cellObjs = rowCollect[rowIndex].settings.cellObjs;

				if (paging) {
					trObj.dom().attr('data-page', pageMap[keyProp]);
				}

				$.extend(trObj, rowCollect[rowIndex]);
				viewObj.objs.rows.push({ key: keyProp, obj: trObj });
				currentObjs.push({ key: keyProp, obj: trObj });
				for (var cellIndex = 0, cellNum = cellObjs.length; cellIndex < cellNum; cellIndex++) {
					var cellId = cellObjs[cellIndex].domId;
					var cellObj = new $.su.widgets.cell({ id: cellId });
					$.extend(cellObj, cellObjs[cellIndex]);
					if (cellObjs[cellIndex].callback) {
						cellObjs[cellIndex].callback.call(cellObj);
					}
					trObj.cells.push(cellObj);
				}
			}

			for (var j = 0; j < currentObjs.length; j++) {
				var row = currentObjs[j].obj;
				var key = currentObjs[j].key;
				if (row) {
					row
						.dom()
						.find('span.grid-row-numberer')
						.html($.inArray(key, this._keys) + 1);
				}
			}

			if (this.settings.operation && this.settings.operation.indexOf('columns') !== -1) {
				this.objs.tool.renderDefaultCol(this);
			}
			this.updateRowNumber();
			callback(currentObjs);
		},

		/**
		 * add data, called by the 'dateBind', only notify the grid new data item has been added, judge whether render
		 * it by grid's current setting
		 * @param key{string} added item's key
		 */
		addItem: function (key) {
			this._keys.push(key);

			var paging = this.getPlugin('paging');
			if (paging) {
				paging.updateRowPage(this._keys);
				paging.updateBtns();
			} else {
				this.dom().triggerHandler('ev_store_render_items', [[key]]);
			}
		},

		/**
		 * delete data item in the grid's '_keys', not about the DOM render
		 * TODO: seperate DOM dealer to the 'remove' function
		 * @param key
		 */
		deleteItem: function (key) {
			var index = $.inArray(key, this._keys);
			if (index >= 0) {
				this._keys.splice(index, 1);
				this.remove(key); //if not rendered, 'remove' function should deal the situation.
				var paging = this.getPlugin('paging');
				if (paging) {
					paging.updateRowPage(this._keys);
					paging.updateBtns();
				}
			}
		},

		/**
		 * @Deprecated
		 *
		 * */
		createRow: function (key, model) {
			var viewObj = this;
			var settings = this.settings;
			var row = {};
			var options = $.extend({}, settings, {
				objs: viewObj.objs
			});

			var cells = {};
			var body = viewObj.dom().find('tbody.grid-content-data').eq(0);

			cells[key] = [];
			viewObj.objs.cells = cells;
			viewObj.objs.modelMap[key] = model;
			this._keys.push(key);

			row.key = key;
			var tempObj = viewObj.objs.row.initRow(key, options);
			body.append(tempObj.domContent);
			row.obj = new $.su.widgets.row({ id: tempObj.domId });
			$.extend(row.obj, tempObj);

			for (var i = 0, len = tempObj.settings.cellObjs.length; i < len; i++) {
				var cellTempObj = tempObj.settings.cellObjs[i];
				var cellId = cellTempObj.domId;
				var cellObj = new $.su.widgets.cell({ id: cellId });
				$.extend(cellObj, cellTempObj);
				if (cellTempObj.callback) {
					cellTempObj.callback.call(cellObj);
				}
				row.obj.cells.push(cellObj);
			}

			viewObj.objs.rows.push(row);

			this._renderMap[key] = true;

			viewObj.updateRowNumber();
			var paging = this.getPlugin('paging');
			if (paging) {
				paging.updateRowPage(this._keys);
				paging.updateBtns();
			}
			viewObj.dom().triggerHandler('ev_grid_row_created', [viewObj.objs.rows]);

			return row.obj;
		},
		updateRowNumber: function () {
			var viewObj = this;

			// clearTimeout(viewObj._updateRow);
			// viewObj._updateRow = setTimeout(function(){
			if (viewObj.dom().length > 0) {
				viewObj.updateRow();
			}
			// }, 100);
		},
		updateRow: function () {
			var _this = this.dom();
			var index;
			var wrap = _this.find('tbody.grid-content-data');
			var label = _this.find('th.grid-header div.checkcolumn label.checkbox-label');
			var container = label.closest('div.checkbox-group-container');
			// var paging = this.getPlugin('paging');

			// if(paging){
			// 	paging.updateBtns();
			// }

			if (this.getPlugin('toolRow')) {
				// this.getPlugin('toolRow').refreshStatus();
			}

			// paging插件中可能会触发页码跳转，重新加载数据，所以在这里获取row。
			var rows = this.objs.rows;
			var len = rows.length;

			if (len == 0) {
				if (wrap.find('tr.grid-content-tr.empty').length === 0) {
					var rowEmpty = this.objs.row.initEmptyRow(this.getColumns().length, this);
					wrap.append(rowEmpty);
					container.removeClass('selected');
					label.removeClass('checked');
					this.setGridHeight();
					this.checkSelected();
					return;
				}
			} else {
				_this.find('.grid-content-tr.empty').remove();
			}

			for (index = 0; index < len; index++) {
				var row = rows[index].obj;
				var key = rows[index].key;
				if (row) {
					row
						.dom()
						.find('span.grid-row-numberer')
						.html($.inArray(key, this._keys) + 1);
				}
			}

			var trList = _this.find('tr.grid-content-tr:not(.disabled)');

			if (trList.length > 0) {
				//不全选
				for (index = 0; index < trList.length; ++index) {
					if ($(trList[index]).hasClass('disabled')) {
						continue;
					}
					if (!$(trList[index]).hasClass('selected')) {
						break;
					}
				}
				if (index != trList.length) {
					container.removeClass('selected');
					label.removeClass('checked');
				}
				//全选
				for (index = 0; index < trList.length; ++index) {
					if ($(trList[index]).hasClass('disabled')) {
						continue;
					}
					if (!$(trList[index]).hasClass('selected')) {
						break;
					}
				}
				if (index == trList.length) {
					container.addClass('selected');
					label.addClass('checked');
				}
			}

			this.setGridHeight();
			this.checkSelected();
		},
		setGridHeight: function () {
			var settings = this.settings;
			var container = this.getContainer();
			var contentContainer = container.find('.grid-content-container')[0];
			var offsetTop = contentContainer.scrollTop;
			if (container.find('style[name=grid]').length > 0) {
				container.find('style[name=grid]').remove();
			}

			var styleText = '<style type="text/css" name="grid">';
			styleText += 'div#' + this.domId + ' div.grid-content-container{';

			var trs = container.find('tr.grid-content-tr');
			var normalTr = null;
			for (var i = 0, len = trs.length; i < len; i++) {
				var tr = trs.eq(i);
				var tds = tr.find('td');
				var flag = false;
				for (var j = 0, jlen = tds.length; j < jlen; j++) {
					var rowspan = tds.eq(j).attr('rowspan');
					if (rowspan > 1) {
						flag = true;
						break;
					}
				}
				if (!flag) {
					normalTr = tr;
					break;
				}
			}
			var lineHeight = 0;
			if (normalTr) {
				lineHeight = normalTr.outerHeight();
			} else {
				//To be continute.
				//In case of there is no normal td without rowspan attribute,
				//we don't know how to set a proper lineHeigh value.
			}
			// var lineHeight = container.find("tr.grid-content-tr").outerHeight();
			if (settings.minLines) {
				styleText += 'min-height:' + settings.minLines * lineHeight + 'px;';
			}
			if (settings.maxLines) {
				styleText += 'max-height:' + settings.maxLines * lineHeight + 'px;';
				if (!container.hasClass('allow-scroll')) {
					$.su.scrollbar({
						ele: contentContainer
					});
				}
				container.addClass('allow-scroll');
			}

			styleText += '}';
			styleText += '</style>';

			container.prepend($(styleText));
			contentContainer.scrollTop = offsetTop;

			if ($(contentContainer).height() < $(contentContainer).find('table').height()) {
				if (!this._resetWidth) {
					var scrollWidth = $(contentContainer).width() - $(contentContainer).children('table').width();
					this._resetWidth = true;
					// container.find('.grid-header-container').css('padding-right', scrollWidth);
					// container.find('.grid-tool-container').css('padding-right', scrollWidth);
				}
			} else {
				if (this._resetWidth) {
					this._resetWidth = false;
					// container.find('.grid-header-container').css('padding-right', 0);
					// container.find('.grid-tool-container').css('padding-right', 0);
				}
			}
		},
		setGridColumnName: function (names) {
			var _this = this.dom();
			var columns = this.settings.configs.columns;

			if (!$.isArray(names)) {
				return;
			}

			for (var i = 0, len = names.length; i < len; i++) {
				var index = parseInt(names[i].index) + this.columnOffset;
				var text = names[i].text;
				var th = _this.find('.grid-header-container th').get(index);
				if (th) {
					$(th).find('span.content').text(text);
				}
				columns[index].text = text;
			}
		},
		reRenderColumn: function (name) {
			var rows = this.objs.rows;
			var modelMap = this.objs.modelMap;

			for (var i = 0, len = rows.length; i < len; i++) {
				var key = rows[i].key;
				var cells = rows[i].obj.cells;
				var data = modelMap[key].getData();
				var val = data[name];

				for (var j = 0, cellLen = cells.length; j < cellLen; j++) {
					if (cells[j].field === name) {
						cells[j].setValue(val);
					}
				}
			}
		},
		getKeys: function () {
			var keys = [];
			var map = this.objs.modelMap;
			for (var key in map) {
				if (map.hasOwnProperty(key)) {
					keys.push(key);
				}
			}
			return keys;
		},
		getRow: function (key) {
			var rows = this.objs.rows;

			if (key === undefined) {
				return rows;
			}
			for (var i = 0, len = rows.length; i < len; i++) {
				if (key === rows[i].key) {
					return rows[i].obj;
				}
			}
			return false;
		},
		getRows: function () {
			var rowObjs = this.objs.rows;
			var rows = [];
			for (var i = 0, len = rowObjs.length; i < len; i++) {
				rows.push(rowObjs[i].obj);
			}
			return rows;
		},
		getPlugin: function (plugin) {
			var viewObj = this;
			var settings = this.settings;
			var plugins = settings.plugins.split('|');

			if (plugin === 'editor') {
				if ($.inArray('editor', plugins) !== -1) {
					return viewObj.plugins['editor'];
				} else if ($.inArray('rowEditor', plugins) !== -1) {
					return viewObj.plugins['rowEditor'];
				} else if ($.inArray('popEditor', plugins) !== -1) {
					return viewObj.plugins['popEditor'];
				}
			}

			if ($.inArray(plugin, plugins) !== -1) {
				return viewObj.plugins[plugin];
			}
			return false;
		},
		getColumns: function () {
			var settings = this.settings;

			return settings.configs.columns;
		},
		getSelected: function () {
			var me = this;
			var _this = this.dom();
			var selectedTrs = _this.find('tr.grid-content-tr.selected');
			var result = [];

			selectedTrs.each(function (i, obj) {
				var tr = $(obj);
				var rules = !tr.hasClass('empty') && !tr.hasClass('disabled');
				if (rules) {
					var id = tr.attr('id');
					var key = me.getKeyById(id);
					result.push(key);
				}
			});

			return result;
		},
		checkSelected: function () {
			var me = this;
			var keys = this.getSelected();
			var tbar = this.getPlugin('tBar');

			if (tbar) {
				if (keys.length === 0) {
					tbar.disable(['delete', 'edit']);
				} else if (keys.length === 1) {
					tbar.enable(['delete', 'edit']);
				} else if (keys.length > 1) {
					tbar.disable('edit');
					tbar.enable('delete');
				}
			}

			clearTimeout(this._checkStatusEvent);
			this._checkStatusEvent = setTimeout(function () {
				me.dom().triggerHandler('ev_grid_check_status');
			}, 10);
		},
		setSelected: function (keys) {
			var _this = this.dom();
			var checkedKeys = this.getSelected();

			if (keys === undefined) {
				keys = this._keys;
			}

			keys = $.isArray(keys) ? keys : [keys];
			for (var i = 0, len = keys.length; i < len; i++) {
				if ($.inArray(keys[i], checkedKeys) === -1) {
					var tr = _this.find('tr.grid-content-tr[data-key="' + keys[i] + '"]');
					var label = tr.find('label.checkbox-label');
					label.trigger('click', [this, 'selected']);
				}
			}
		},
		setUnselected: function (keys) {
			var _this = this.dom();
			var checkedKeys = this.getSelected();

			if (keys === undefined) {
				keys = this._keys;
			}

			keys = $.isArray(keys) ? keys : [keys];
			for (var i = 0, len = keys.length; i < len; i++) {
				if ($.inArray(keys[i], checkedKeys) !== -1) {
					var tr = _this.find('tr.grid-content-tr[data-key="' + keys[i] + '"]');
					var label = tr.find('label.checkbox-label');
					label.trigger('click', [this, 'unselected']);
				}
			}
		},
		clearSelected: function () {
			var _this = this.dom();
			var keys = this.getSelected();

			keys = $.isArray(keys) ? keys : [keys];
			for (var i = 0, len = keys.length; i < len; i++) {
				var tr = _this.find('tr.grid-content-tr[data-key="' + keys[i] + '"]');
				var label = tr.find('label.checkbox-label');
				tr.removeClass('selected');
				label.removeClass('checked');
			}
		},
		getDisplay: function () {
			var _this = this.dom();

			var display = _this.find('input.grid-display');
			if (display.length > 0) {
				return display;
			} else {
				return null;
			}
		},
		search: function (content) {
			if (!content) {
				return null;
			}
		},
		updateRowId: function () {
			var _this = this.dom();
			var trs = _this.find('tbody.grid-content-data tr.grid-content-tr');
			trs.each(function (i, obj) {
				$(obj)
					.find('span.grid-row-numberer')
					.text(i + 1);
			});
		},

		moveItem: function (key, index) {
			var _this = this.dom();
			var tr = _this.find('tr.grid-content-tr[data-key=' + key + ']');

			if (tr.index() === index) {
				return;
			}

			var target = _this.find('tbody.grid-content-data tr.grid-content-tr').get(index);

			$(target).before(tr);

			var oriIndex = $.inArray(key, this._keys);
			this._keys.splice(oriIndex, 1);
			this._keys.splice(index, 0, key);

			this.updateRowId();

			var paging = this.getPlugin('paging');
			if (paging) {
				paging.updateRowPage(this._keys);
				paging.updateBtns();
			}
		},
		runProgress: function () {
			var toolbar = this.getPlugin('tBar').dom();
			var progressbar = toolbar.find('div.gird-prompt-progressbar');
			var bar = progressbar.find('div.progressbar-value');

			bar.stop();
			bar.css('width', '0px');
			progressbar.clearQueue().fadeIn(100, function () {
				bar.animate(
					{
						width: '50%'
					},
					5 * 1000
				);
			});
		},
		prompt: function (text) {
			var me = this;
			var msg = $('#' + me.msgId);
			if (msg.data('viewObj')) {
				msg.data('viewObj').setContent(text);
				msg.data('viewObj').show();
				return msg.data('viewObj');
			} else {
				var promptObj = new $.su.widgets.msg({ id: me.msgId });
				promptObj.render();
				promptObj._gridObj = this;
				promptObj.setContent(text);
				promptObj.show();
				return promptObj;
			}
		},
		confirm: function (text) {
			var me = this;
			var msg = $('#' + me.confirmId);
			if (msg.data('viewObj')) {
				msg.data('viewObj').setContent(text);
				msg.data('viewObj').show();
				return msg.data('viewObj');
			} else {
				var confirmObj = new $.su.widgets.msg({ id: me.confirmId });
				confirmObj.render();
				confirmObj._gridObj = this;
				confirmObj.setContent(text);
				confirmObj.show();
				return confirmObj;
			}
		},
		insert: function (index, data) {
			var _this = this.dom();
			var settings = this.settings;
			var wrap = _this.find('tbody.grid-content-data');

			index = parseInt(index, 10) || 0;
			data = data || [{}];

			if (!$.isArray(data)) {
				data = [data];
			}

			data.reverse();

			for (var jndex = 0, len = data.length; jndex < len; jndex++) {
				var newRow = settings.row.initRow(index + jndex, data[jndex]);

				if (index == 0) {
					wrap.prepend(newRow);
				} else {
					newRow.insertBefore(this.objs.rows[index]);
				}
				this.objs.rows.splice(index, 0, newRow);
			}

			this.updateRowNumber();

			_this.triggerHandler('ev_insert', [index, data]);
		},
		remove: function (key) {
			var i, len;
			var rows = this.objs.rows;

			if (key) {
				for (i = rows.length - 1; i >= 0; i--) {
					if (rows[i].key === key) {
						var mergeRow = rows[i].obj.dom().closest('.row-merge-tr');
						if (mergeRow.length > 0 && mergeRow.find('.grid-content-tr').length == 1) {
							mergeRow.remove();
						} else {
							rows[i].obj.dom().remove();
						}

						rows.splice(i, 1);
					}
				}
				delete this.objs.modelMap[key];
				var index = $.inArray(key, this._keys);
				if (index >= 0) {
					this._keys.splice(index, 1);
				}
			} else {
				for (i = 0, len = rows.length; i < len; i++) {
					var mergeRow = rows[i].obj.dom().closest('.row-merge-tr');
					if (mergeRow.length > 0 && mergeRow.find('.grid-content-tr').length == 1) {
						mergeRow.remove();
					} else {
						rows[i].obj.dom().remove();
					}
				}
				rows.length = 0;
				this.objs.modelMap = [];
				this._keys = [];
			}
			this.updateRowNumber();

			var paging = this.getPlugin('paging');
			if (paging) {
				paging.updateRowPage(this._keys);
				paging.updateBtns();
			}
		},
		/**
		 * 0: not editing; 1: edit; 2: add;
		 * @returns {number}
		 */
		getEditStatus: function () {
			var editor = this.getPlugin('editor');
			if (editor.isEditing()) {
				if (editor.getEditingId() === '') {
					return 0;
				} else if (editor.getEditingId() === 'add') {
					return 2;
				} else {
					return 1;
				}
			} else {
				return 0;
			}
		},
		getKeyById: function (id) {
			var rows = this.objs.rows;

			for (var i = 0, len = rows.length; i < len; i++) {
				var obj = rows[i].obj;
				if (id === obj.domId) {
					return rows[i].key;
				}
			}
			return false;
		},
		/**
		 * @param column name
		 * @param spans [[0,1,2], [3,4], [5]]
		 */
		rowSpan: function (column, spans) {
			var me = this;
			var _this = this.dom();
			var map = {};

			if (spans === undefined) {
				map['0'] = me.objs.rows.length;
			} else {
				for (var i = 0, len = spans.length; i < len; i++) {
					var span = spans[i];
					map[span[0]] = span.length;
				}
			}

			_this.find('td.grid-content-td-' + column).each(function (index, item) {
				$(item).show();
				if (map[index]) {
					$(item).attr('rowspan', map[index]);
				} else {
					$(item).hide();
				}
			});
		},
		rowMerge: function (rows) {
			var me = this;
			var colspan;
			var _this = this.dom();
			if (!$.isArray(rows)) {
				return;
			}
			for (var i = 0; i < rows.length; i++) {
				var temp = rows[i];
				var selector = '';
				if ($.isArray(temp) && temp.length > 1) {
					for (var j = 0; j < temp.length; j++) {
						selector += 'tr.grid-content-tr:eq(' + temp[j] + '),';
					}
					selector = selector.slice(0, selector.length - 1);
					var trs = _this.find(selector);
					colspan = colspan || trs.eq(0).children('.grid-content-td').length;
					trs.wrapAll(
						"<tr class='row-merge-tr'><td class='row-merge-td' colspan='" + colspan + "'><table class='row-merge-table'></table></td></tr>"
					);
				}
			}
			_this
				.find('.grid-content-data')
				.children('tr.grid-content-tr')
				.each(function (i, item) {
					colspan = colspan || $(this).children('.grid-content-td').length;
					$(this).wrap(
						"<tr class='row-merge-tr'><td class='row-merge-td' colspan='" + colspan + "'><table class='row-merge-table'></table></td></tr>"
					);
				});
		},
		/**
		 * @param spans [[columnName1, columnName2], [columnName3]]
		 * @param row keys
		 */
		colSpan: function (spans, row) {
			var me = this;
			var _this = this.dom();
			var map = {};
			var rows = [];
			var hides = [];

			if (row === undefined) {
				for (var i = 0, len = me.objs.rows.length; i < len; i++) {
					rows.push(me.objs.rows[i].key);
				}
			} else {
				rows = $.isArray(row) ? row : [row];
			}

			for (var j = 0, lenJ = spans.length; j < lenJ; j++) {
				var span = spans[j];
				map[span[0]] = span.length;
				hides = hides.concat(span.slice(1));
			}

			for (var k = 0, lenK = rows.length; k < lenK; k++) {
				var tr = _this.find('tr.grid-content-tr[data-key="' + rows[k] + '"]');
				if (tr.length > 0) {
					tr.find('td.grid-content-td').each(function (index, item) {
						var name = $(item).attr('name');

						if (name === 'btn-column') {
							return;
						}

						$(item).show();
						if (map[name]) {
							$(item).attr('colspan', map[name]);
						} else if ($.inArray(name, hides) !== -1) {
							$(item).hide();
							$(item).removeAttr('colspan');
						} else {
							$(item).removeAttr('colspan');
						}
					});
				}
			}
		},
		enableColumn: function (name) {
			var _this = this.dom();
			var className = 'td.grid-content-td-' + name;
			_this.find(className).removeClass('disabled');
		},
		disableColumn: function (name) {
			var _this = this.dom();
			var className = 'td.grid-content-td-' + name;
			_this.find(className).addClass('disabled');
		},
		showColumn: function (name) {
			var container = this.dom().find('div.grid-container');
			container.children('style.column-hide-style[data-index=' + name + ']').remove();
		},
		hideColumn: function (name) {
			var style = '';
			var id = '#' + this.domId + ' ';
			var container = this.dom().find('div.grid-container');
			style += '<style class="column-hide-style" data-index="' + name + '">';
			style += id + 'th.grid-header.' + name + ', ';
			style += id + 'td.grid-content-td-' + name + ', ';
			style += id + 'td.grid-tool-td-' + name;
			style += '{display: none;}</style>';
			container.append(style);
		},
		/**
		 * [setMaxRules description]
		 * @param {[number]} maxRules    [number of max limit]
		 * @param {[boolean]} showStatus      [whether the status is displayed]
		 * @param {[string]} errorText [user-defined text in alert]
		 */
		setMaxRules: function (maxRules, showStatus, errorText) {
			showStatus = showStatus || false;
			errorText = errorText || this.settings.maxRulesText;
			maxRules = parseInt(maxRules, 10);
			if (isNaN(maxRules) || maxRules <= 0) {
				maxRules = 0;
				showStatus = false;
			}
			var container = this.dom().find('div.grid-limit-container');
			var inHTML = '';
			inHTML += '<div class="grid-limit-bar-container">';
			inHTML += '<span>' + $.su.CHAR.GRID.MAX_LIMIT + ': <span class="limit-num"></span></span>';
			inHTML += '</div>';
			container.append(inHTML);

			if ($.type(this.objs.maxRulesObj) !== 'object') {
				this.objs.maxRulesObj = {};
			}
			this.objs.maxRulesObj.maxRules = maxRules;
			this.objs.maxRulesObj.errorText = errorText;
			container.find('.limit-num').text(this.objs.maxRulesObj.maxRules);
			if (showStatus) {
				container.removeClass('hidden');
			} else {
				container.addClass('hidden');
			}
		},
		/**
		 * [getMaxRules description]
		 * @return {[number]}   [number of max limit]
		 */
		getMaxRules: function () {
			if ($.type(this.objs.maxRulesObj) !== 'object') {
				return 0;
			}
			return this.objs.maxRulesObj.maxRules || 0;
		},
		setMaxLines: function (num) {
			this.settings.maxLines = num;
		},
		setEmptyText: function (text) {
			this.settings.emptyText = text;

			var container = this.getContainer();
			container.find('.empty-td').text(text);
		},
		/**
		 * [getMaxRules description]
		 * @return {[boolean]}  [whether rows is exceeded]
		 */
		isExceeded: function () {
			return this.getMaxRules() > 0 && this.objs.grid.dataBind[0].getSize() >= this.getMaxRules();
		},
		/**
		 * [showMaxRulesWarning description]
		 * @return
		 */
		showMaxRulesWarning: function () {
			this.prompt(this.objs.maxRulesObj.errorText);
		},
		destroy: function () {
			var msg = $('#' + this.msgId).data('viewObj');
			var confirm = $('#' + this.confirmId).data('viewObj');
			var popEditor = this.getPlugin('popEditor');
			msg && msg.destroy();
			confirm && confirm.destroy();
			popEditor && popEditor.destroy();
		},
		handleSelectMax: function () {
			if (this.getSelected().length >= this.settings.multiSelectMax) {
				this.dom()
					.find('tr.grid-content-tr')
					.each(function (index, views) {
						if (!$(views).hasClass('selected')) {
							$(views).addClass('disabled');
						}
					});
			} else {
				this.dom()
					.find('tr.grid-content-tr')
					.each(function (index, views) {
						if ($(views).hasClass('disabled')) {
							$(views).removeClass('disabled');
						}
					});
			}
		}
	});
})();
