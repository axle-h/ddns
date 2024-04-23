(function () {
	var RowEditor = $.su.Widget.register('rowEditor', {
		extend: ['editor'],
		settings: {},
		listeners: [
			{
				selector: 'div.btn-cancel',
				event: 'click',
				callback: function (e, viewObj) {
					var settings = viewObj.settings;
					var grid = settings.objs.grid;
					var editingId = viewObj.getEditingId();
					var targetTr = settings.objs.grid.getRow(editingId);
					if (viewObj.isEditing() && !settings.configs.rowEditor.adding) {
						targetTr.enableRow(editingId).dom().show();
					}
					var defaultEvent = $.su.getDefaultEvent(viewObj, function () {
						grid.dom().triggerHandler('ev_grid_cancel', [editingId, grid]);
						viewObj.cancelEdit();
					});
					grid.dom().triggerHandler('ev_before_grid_cancel', [defaultEvent.ev, editingId]);
					defaultEvent.exe();
				}
			},
			{
				selector: 'div.btn-submit',
				event: 'click',
				callback: function (e, viewObj) {
					var that = $(this);
					var settings = viewObj.settings;
					var grid = settings.objs.grid;
					var editingId = viewObj.getEditingId();
					var targetTr = settings.objs.grid.getRow(editingId);

					// that.attr("disabled", true);
					//
					// if(settings.beforeSubmit){
					// 	var t = settings.beforeSubmit();
					// 	if(!t){
					// 		that.attr("disabled", false);
					// 		return;
					// 	}
					// }

					var defaultEvent = $.su.getDefaultEvent(viewObj, function () {
						if (viewObj.isEditing() && !settings.configs.rowEditor.adding) {
							targetTr.enableRow(editingId).dom().show();
						}
						viewObj.completeEdit();
					});

					grid.dom().triggerHandler('ev_grid_save', [defaultEvent.ev, editingId]);
					defaultEvent.exe();
				}
			},
			{
				selector: function () {
					var grid = this.settings.objs.grid;
					return {
						parent: grid.dom(),
						target: 'tr.grid-content-tr:not(.empty)'
					};
				},
				event: 'dblclick',
				callback: function (e, viewObj) {
					e.stopPropagation();
					e.preventDefault();

					var grid = viewObj.settings.objs.grid;
					var key = $(this).attr('data-key');

					if (viewObj && !viewObj.isEditing()) {
						viewObj.startEdit(key);
						grid.dom().triggerHandler('ev_grid_edit', [key]);
					}
				}
			}
		],
		init: function (options) {
			RowEditor.superclass.init.call(this, options);
			this.cells = [];
		},
		render: function () {
			var _this = this.dom();
			var settings = this.settings;
			var columns = settings.configs.columns;
			var cell = settings.objs.cell;
			var grid = settings.objs.grid;
			var dom = $('<tr class="editor-container" id=' + this.domId + '></tr>');
			var wrap = _this.parent().find('tbody.grid-content-data');

			wrap.append(dom);
			_this.remove();

			for (var i = 0, len = columns.length; i < len; i++) {
				var c = cell.initCell('editor', i, this.editorConfigs);
				this.cells.push(c);
			}

			var cancelBtn = $('<div id="' + grid.domId + '-cancel-button" widget="button" class="btn-cancel button-button" text= "Cancel"></div>');
			var saveBtn = $('<div id="' + grid.domId + '-save-button" widget="button" class="btn-submit button-button" text= "Save"></div>');
			var editorTd = this.dom().find('td').eq(0).empty();
			cancelBtn.appendTo(editorTd);
			saveBtn.appendTo(editorTd);
			this.cancelObj = new $.su.widgets.button({ id: cancelBtn });
			this.saveObj = new $.su.widgets.button({ id: saveBtn });

			this.cancelObj.render();
			this.saveObj.render();

			$(settings.configs.rowEditor.content).remove();

			this.dom().css('display', 'none');
		},
		startEdit: function (id) {
			var _this = this.dom();
			var settings = this.settings;
			var editingId = id || 'add';
			var gridObj = settings.objs.grid;
			var grid = gridObj.dom();
			var targetTr = null;
			var fields = this.getAllFields();

			RowEditor.superclass.startEdit.call(this, id);

			if (editingId != 'add') {
				targetTr = gridObj.getRow(editingId);

				if (targetTr) {
					targetTr.dom().addClass('editing');
					targetTr.disableRow(editingId).dom().hide();
				}
			} else {
				var dataContainer = grid.find('tbody.grid-content-data');
				var fistTr = dataContainer.find('tr.grid-content-tr').eq(0);

				targetTr = fistTr.row();
			}

			if (targetTr && targetTr.dom) {
				_this.insertBefore(targetTr.dom());
			} else {
				_this.prependTo(grid.find('tbody.grid-content-data'));
			}
			_this.show();

			for (i = 0, len = this.widgets.length; i < len; i++) {
				var widget = this.widgets[i];
				this.setWidgetWidth($('#' + widget.id), widget.name, widget.widget);
			}

			var editorHeight = _this.height();

			this.cancelObj.dom().css('top', editorHeight);
			this.saveObj.dom().css('top', editorHeight);
		},
		completeEdit: function () {
			var _this = this.dom();
			var settings = this.settings;
			var grid = settings.objs.grid;
			var editingIndex = this.getEditingId();

			RowEditor.superclass.completeEdit.call(this);

			if (this.isEditing() && !settings.configs.rowEditor.adding) {
				var row = settings.objs.grid.getRow(editingIndex);
				row.dom().removeClass('editing');
				row.enableRow();
			}

			_this.hide();
			grid.updateRowNumber();
		},
		cancelEdit: function () {
			var _this = this.dom();
			var settings = this.settings;
			var gridObj = settings.objs.grid;
			var grid = gridObj.dom();
			var editingIndex = settings.configs.rowEditor.editingIndex;

			RowEditor.superclass.cancelEdit.call(this);

			if (editingIndex !== 'add') {
				var row = settings.objs.grid.getRow(editingIndex);
				row.dom().removeClass('editing');
				row.enableRow();
			} else {
				grid.find('tr.grid-content-tr.add').remove();
			}

			_this.hide();
			gridObj.updateRowNumber();
		},
		setWidgetWidth: function (node, name, widget) {
			var _this = this.dom();
			var columns = this.settings.configs.columns;
			var widthMap = {};

			for (var i = 0, len = columns.length; i < len; i++) {
				if (columns[i].dataIndex) {
					var index = columns[i].dataIndex;
					widthMap[index] = columns[i].width;
				}
			}

			if (widget === 'combobox') {
				var btnWidth = parseInt(_this.find('a.combobox-switch').width()) + 1 || 18;
				var errorWidth = parseInt(_this.find('div.widget-error-tips').width()) + 1 || 24;
				var paddingOffset = 13;
				var columnWidth = widthMap[name];

				var comboboxWidth = columnWidth - paddingOffset;
				// var inputWidth = (comboboxWidth - btnWidth) + 'px';
				var currentWidth = $(node).find('.widget-wrap').outerWidth();

				if (currentWidth > comboboxWidth) {
					$(node)
						.find('.widget-wrap')
						.css({ width: comboboxWidth + 'px' });
				}
			}
		}
	});
})();
