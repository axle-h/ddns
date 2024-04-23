(function () {
	var Row = $.su.Widget.register('row', {
		settings: {},

		init: function (options) {
			this.objs = options.objs;
			this.cells = [];
		},

		render: function () {},

		initRow: function (key, options) {
			var columns = options.configs.columns,
				settings = {
					inited: true,
					columns: columns,
					objs: options.objs,
					cells: [],
					cellObjs: []
				};

			var selected = options.objs.modelMap[key].selected;
			var len = columns.length;
			var wrap = settings.objs.grid.dom().find('tbody.grid-content-data').eq(0);
			var tr = {
				domId: settings.objs.grid.domId + '_tr_' + $.appUtils.keyHandler(key),
				key: key,
				domContent: ''
			};
			var trContent = '';
			// $('<tr class="" ' + '></tr>');

			for (var kndex = 0; kndex < len; kndex++) {
				settings.cellObjs[kndex] = settings.objs.cell.initCell(key, kndex, options);
				trContent += settings.cellObjs[kndex].domContent;
			}
			trContent += "<td class='ghost-td'><div class='head'></div><div class='foot'></div></td>";
			tr.domContent =
				'<tr id="' +
				tr.domId +
				'" class="grid-content-tr ' +
				(selected ? 'selected' : '') +
				' grid-content-tr-' +
				$.appUtils.keyHandler(key) +
				'" data-key="' +
				key +
				'">' +
				trContent +
				'</tr>';

			// trObj.key = key;
			tr.settings = settings;

			return tr;
		},

		getAllFields: function () {
			return this.cells;
		},

		initEmptyRow: function (len, viewObj) {
			var offset = this.objs.grid.columnOffset !== undefined ? this.objs.grid.columnOffset : 0;
			var inHTML = '<tr class="grid-content-tr empty">';
			var ths = viewObj.dom().find('tr.grid-header-tr th');

			// 从offset开始是因为有的列是自动增加的隐藏列
			// for(var index = 0; index < len; index++){
			// 	var width = $(ths.get(index)).width();
			// 	var style = 'style="width:'+width+'px"';
			// 	if (index < offset){
			// 		inHTML += '<td class="grid-content-td grid-content-td-' + index + '" '+style+'></td>';
			// 	}else{
			// 		var lst = (index == len - 1) ? "lst" : "";
			// 		inHTML += '<td class="grid-content-td grid-content-td-' + index + ' ' + lst + '" '+(width > 0 ? style : '')+'>--</td>';
			// 	}
			// }
			inHTML += '<td class="empty-td" colspan="' + len + '">' + viewObj.settings.emptyText + '</td>';
			inHTML += '<td class="ghost-td"><div class="head"></div><div class="foot"></div></td>';
			inHTML += '</tr>';

			return $(inHTML);
		},

		disableRow: function (disableWidget) {
			var _this = this.dom();
			var settings = this.settings;
			var columns = settings.columns;
			var row = _this;

			if (row) {
				row.addClass('disabled');

				for (var i = 0, len = columns.length; i < len; i++) {
					var column = columns[i];
					var items = column.items;

					if (column.xtype === 'actioncolumn') {
						for (var jndex = 0, jen = items.length; jndex < jen; jndex++) {
							var item = items[jndex];
							var xtype = item.xtype;
							var dataIndex = column.dataIndex;
							var act = row.find('input[data-property=' + dataIndex + '][data-type=' + xtype + ']');
							if (act && $.type(act[xtype]) == 'function') {
								act[xtype]('disable');
							}
						}
					} else if (disableWidget && column.xtype === 'customWidget') {
						var tarDom = row.find('[widget=' + column.widgetName + ']');
						var tarWidget = tarDom.length > 0 && tarDom.data('viewObj');
						if (tarWidget) {
							tarWidget.disable();
						}
					}
				}
			}
		},

		enableRow: function () {
			var _this = this.dom();
			var settings = this.settings;
			var columns = settings.columns;
			var row = _this;

			if (row) {
				row.removeClass('disabled');

				for (var i = 0, len = columns.length; i < len; i++) {
					var column = columns[i];
					var items = column.items;

					if (column.xtype === 'actioncolumn' && items) {
						for (var jndex = 0, jen = items.length; jndex < jen; jndex++) {
							var item = items[jndex];
							var xtype = item.xtype;
							var dataIndex = column.dataIndex;
							var act = row.find('input[data-property=' + dataIndex + '][data-type=' + xtype + ']');

							if (act && $.type(act[xtype]) == 'function') {
								act[xtype]('enable');
							}
						}
					} else if (column.xtype === 'customWidget') {
						var tarDom = row.find('[widget=' + column.widgetName + ']');
						var tarWidget = tarDom.length > 0 && tarDom.data('viewObj');
						if (tarWidget) {
							tarWidget.enable();
						}
					}
				}
			}
		}
	});
})();
