(function () {
	var PopEditor = $.su.Widget.register('popEditor', {
		extend: ['editor'],
		settings: {},
		listeners: [],
		init: function (options) {
			PopEditor.superclass.init.call(this, options);
			this.cells = [];
		},
		render: function () {
			var viewObj = this;
			var _this = this.dom();
			var settings = this.settings;
			var columns = settings.configs.columns;
			var grid = settings.objs.grid;
			var editorSetting = settings.configs.popEditor;

			settings.addTitle = editorSetting.addTitle || $.su.CHAR.OPERATION.ADD_TITLE;
			settings.editTitle = editorSetting.editTitle || $.su.CHAR.OPERATION.EDIT_TITLE;
			settings.addBtnText = editorSetting.addBtnText || $.su.CHAR.OPERATION.ADD_DEFAULT;
			settings.editBtnText = editorSetting.editBtnText || $.su.CHAR.OPERATION.SAVE_DEFAULT;

			var dHTML =
				'<div class="editor-container" id="' +
				this.domId +
				'">' +
				'<div widget="msg" type="window" close-btn="{true}" msg-title="' +
				(editorSetting.addTitle || '') +
				'" class="editor-container ' +
				editorSetting.cls +
				'" id="' +
				this.domId +
				'-msg" title-bar="{true}"';

			if (editorSetting.msg) {
				dHTML +=
					' content-scroll="{' +
					(editorSetting.msg.contentScroll === false ? false : true) +
					'}"' +
					' dynamic-height="{' +
					(editorSetting.msg.dynamicHeight === false ? false : true) +
					'}"';
			}

			dHTML += '></div></div>';

			var dom = $(dHTML);
			var wrap = grid.dom().find('.grid-panel-content-container .grid-container');

			$('#' + this.domId + '-msg').remove();
			wrap.append(dom);
			_this.remove();

			var container = $('#' + this.domId + '-msg');
			container.append($(editorSetting.content));
			if (editorSetting.customBtns) {
				container.append($(editorSetting.customBtns));
			}
			var btnContainer = $('<div widget="fieldset" class="inline-container btn-container"></div>').appendTo(container);

			var cancelBtn = $(
				'<div id="' +
					grid.domId +
					'-cancel-button" widget="button" class="btn-cancel button-button" text= "{OPERATION.CANCEL_UPPERCASE}" label-field={false}></div>'
			);
			var saveBtn = $(
				'<div id="' +
					grid.domId +
					'-save-button" widget="button" class="btn-submit button-button" text= "{OPERATION.SAVE_UPPERCASE}" label-field={false}></div>'
			);
			cancelBtn.appendTo(btnContainer);
			saveBtn.appendTo(btnContainer);

			(this.btnContainer = new $.su.widgets.fieldset({ id: btnContainer })).render();
			this.containerMsg = new $.su.widgets.msg({ id: container, settings: editorSetting.msg });
			this.cancelObj = new $.su.widgets.button({ id: cancelBtn });
			this.saveObj = new $.su.widgets.button({ id: saveBtn });

			this.containerMsg.render();
			this.cancelObj.render();
			this.saveObj.render();

			container.off('ev_msg_close').on('ev_msg_close', function () {
				var editingId = viewObj.getEditingId();

				var defaultEvent = $.su.getDefaultEvent(viewObj, function () {
					grid.dom().triggerHandler('ev_grid_cancel', [editingId, grid]);
					viewObj.cancelEdit();
				});
				grid.dom().triggerHandler('ev_before_grid_cancel', [defaultEvent.ev, editingId]);
				defaultEvent.exe();
			});

			this.cancelObj
				.dom()
				.off('ev_button_click')
				.on('ev_button_click', function () {
					var editingId = viewObj.getEditingId();

					var defaultEvent = $.su.getDefaultEvent(viewObj, function () {
						grid.dom().triggerHandler('ev_grid_cancel', [editingId, grid]);
						viewObj.containerMsg.close();
						viewObj.cancelEdit();
					});
					grid.dom().triggerHandler('ev_before_grid_cancel', [defaultEvent.ev, editingId]);
					defaultEvent.exe();
				});

			var _self = this;
			this.saveObj
				.dom()
				.off('ev_button_click')
				.on('ev_button_click', function () {
					var settings = viewObj.settings;
					var grid = settings.objs.grid;
					var editingId = viewObj.getEditingId();

					var beforeSaveDfd = '';
					var asyncBeforeSave = function () {
						_self.saveObj.loading(true);
						beforeSaveDfd = $.Deferred();

						return {
							resolve: function () {
								_self.saveObj.loading(false);
								beforeSaveDfd.resolve();
							}
						};
					};

					var beforeSave = $.su.getDefaultEvent(viewObj, function () {
						var defaultEvent = $.su.getDefaultEvent(viewObj, function () {
							viewObj.completeEdit();
						});
						grid.dom().triggerHandler('ev_grid_save', [defaultEvent.ev, editingId]);
						defaultEvent.exe();
						grid.dom().triggerHandler('ev_grid_after_save');
					});

					grid.dom().triggerHandler('ev_grid_before_save', [beforeSave.ev, editingId, asyncBeforeSave]);

					if (!beforeSaveDfd) {
						beforeSave.exe();
					} else {
						beforeSaveDfd.then(beforeSave.exe);
					}
				});
		},
		startEdit: function (id) {
			var _this = this.dom();
			var settings = this.settings;
			var editingId = id || 'add';
			var gridObj = settings.objs.grid;
			var grid = gridObj.dom();
			var fields = this.getAllFields();

			PopEditor.superclass.startEdit.call(this, id);

			if (editingId != 'add') {
				this.saveObj.setText(settings.editBtnText);
				this.containerMsg.setTitle(settings.editTitle);
			} else {
				this.saveObj.setText(settings.addBtnText);
				this.containerMsg.setTitle(settings.addTitle);
			}

			this.containerMsg.show();

			var editorHeight = _this.height();

			this.cancelObj.dom().css('top', editorHeight);
			this.saveObj.dom().css('top', editorHeight);
		},
		completeEdit: function () {
			var settings = this.settings;
			var grid = settings.objs.grid;

			PopEditor.superclass.completeEdit.call(this);

			this.containerMsg.close();
			grid.updateRowNumber();
		},
		cancelEdit: function () {
			var settings = this.settings;
			var grid = settings.objs.grid;

			PopEditor.superclass.cancelEdit.call(this);

			grid.updateRowNumber();
		},
		setTitle: function (title) {
			this.containerMsg.setTitle(title);
		},
		getMsgBox: function () {
			return this.containerMsg;
		},
		getCancelBtn: function () {
			return this.cancelObj;
		},
		getSaveBtn: function () {
			return this.saveObj;
		},
		showBtns: function () {
			this.btnContainer.show();
		},
		hideBtns: function () {
			this.btnContainer.hide();
		},
		destroy: function () {
			var msg = $('#' + this.domId + '-msg').data('viewObj');
			msg && msg.destroy();
		},
		closeMsgBox: function () {
			var grid = this.settings.objs.grid;
			var editingId = this.getEditingId();

			var defaultEvent = $.su.getDefaultEvent(this, function () {
				grid.dom().triggerHandler('ev_grid_cancel', [editingId, grid]);
				this.containerMsg.close();
				this.cancelEdit();
			});
			grid.dom().triggerHandler('ev_before_grid_cancel', [defaultEvent.ev, editingId]);
			defaultEvent.exe();
		}
	});
})();
