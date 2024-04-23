(function () {
	var StatusBar = $.su.Widget.register('statusBar', {
		settings: {},
		listeners: [
			{
				selector: function () {
					var grid = this.settings.objs.grid;
					return {
						parent: grid.dom(),
						target: ''
					};
				},
				condition: function (viewObj) {
					var grid = viewObj.settings.objs.grid;
					return !!grid.getPlugin('statusBar');
				},
				event: 'ev_grid_row_clicked ev_grid_row_selected_all ev_grid_row_unselected_all ev_grid_delete',
				callback: function (e, key, viewObj) {
					viewObj.refreshStatus();
				}
			},
			{
				selector: function () {
					var grid = this.settings.objs.grid;
					return {
						parent: grid.dom(),
						target: ''
					};
				},
				condition: function (viewObj) {
					var grid = viewObj.settings.objs.grid;
					return !!grid.getPlugin('statusBar');
				},
				event: 'ev_store_bound',
				callback: function (e, viewObj) {
					viewObj.refreshStatus();
				}
			},
			{
				selector: function () {
					var grid = this.settings.objs.grid;
					return {
						parent: grid.dom(),
						target: ''
					};
				},
				event: 'ev_grid_save',
				callback: function (e, ev, key, viewObj) {
					// 先执行控制器中取消选中相关，再刷新状态
					setTimeout(function () {
						viewObj.refreshStatus();
					}, 100);
				}
			},
			{
				selector: function () {
					var grid = this.settings.objs.grid;
					return {
						parent: grid.dom(),
						target: ''
					};
				},
				event: 'ev_grid_row_created',
				callback: function (e, rows, viewObj) {
					var _this = viewObj.dom();
					clearTimeout(viewObj._updateTotal);
					viewObj._updateTotal = setTimeout(function () {
						_this.find('td.grid-status-td span.status-total-num').text(rows.length);
					}, 100);
				}
			},
			{
				selector: function () {
					var grid = this.settings.objs.grid;
					return {
						parent: grid.dom(),
						target: ''
					};
				},
				event: 'ev_grid_check_status',
				callback: function (e, viewObj) {
					viewObj.refreshStatus();
				}
			}
		],
		init: function (options) {
			this.settings = $.extend(
				{},
				this.settings,
				{
					objs: options.objs
				},
				options.configs.statusBar
			);
			var grid = this.settings.objs.grid;
		},
		render: function () {
			var _this = this.dom();
			var grid = this.settings.objs.grid;
			var total = this.settings.total === false ? false : true;
			var columns = grid.settings.configs.columns;
			var statusBarText = this.settings.statusBarText || $.su.CHAR.GRID.TOTAL;
			var wrap = _this.parent().find('div.grid-status-container');

			var inHTML = '<table border="0" cellspacing="0" cellpadding="0">';
			inHTML += '<tr class="status-row">';
			inHTML += '<td class="grid-status-td" colspan="' + (columns.length - grid.columnOffset) + '">';
			if (total) {
				inHTML += '<span class="status-total">' + statusBarText + ': <span class="status-total-num"></span></span>';
			}
			inHTML += '<span class="status-selected status-selected-text hidden"><span class="status-selected-num"></span></span>';

			inHTML += '</td>';
			inHTML += '</tr>';
			inHTML += '</table>';

			_this.append(inHTML).addClass('grid-status-bar-container');
			wrap.removeClass('hidden').append(_this);
			_this.find('td.grid-status-td span.status-total-num').text(this.settings.objs.rows.length);
		},
		refreshStatus: function () {
			var viewObj = this;
			var _this = viewObj.dom();
			var grid = viewObj.settings.objs.grid;
			var selected = grid.getSelected();
			var total = grid._keys.length;
			var paging = grid.getPlugin('paging');

			if (selected.length > 0) {
				if (selected.length == 1) {
					_this.find('td.grid-status-td span.status-selected-num').text($.su.CHAR.GRID.SELECTED_ONE);
				} else {
					// TODO: 文案缺失导致报错，需要补充文案
					_this.find('td.grid-status-td span.status-selected-num').text($.su.CHAR.GRID.SELECTED);
					//_this.find('td.grid-status-td span.status-selected-num').text($.su.CHAR.GRID.SELECTED.replace('%n%', selected.length));
				}
				_this.find('td.grid-status-td span.status-selected').show();
			} else {
				_this.find('td.grid-status-td span.status-selected').hide();
			}

			if (viewObj.toolEnable) {
				if (selected.length > 0) {
					_this.find('td.grid-status-td span.status-btns').show();
				} else {
					var defaultHide = $.su.getDefaultEvent(this, function () {
						_this.find('td.grid-status-td span.status-btns').hide();
					});
					grid.dom().triggerHandler('ev_grid_tool_status_hide', [defaultHide.ev]);
					defaultHide.exe();
				}
			}
			_this.find('td.grid-status-td span.status-total-num').text(total);
		}
	});
})();
