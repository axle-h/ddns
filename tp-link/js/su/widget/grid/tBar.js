(function () {
	var TBar = $.su.Widget.register('tBar', {
		settings: {
			operation: {
				attribute: 'operation',
				defaultValue: ''
			}
		},
		listeners: [
			{
				selector: 'a.btn-add',
				event: 'click',
				callback: function (e, viewObj) {
					e.stopPropagation();
					e.preventDefault();
					if ($(this).hasClass('disabled')) {
						return;
					}
					var settings = viewObj.settings;
					var grid = settings.objs.grid;
					if (grid.isExceeded()) {
						grid.showMaxRulesWarning();
						return;
					}
					var editor = grid.getPlugin('editor');

					if (!editor || $(this).hasClass('disabled')) {
						return;
					}

					if ($.type(settings.beforeStartAdd) == 'function') {
						if (!settings.beforeStartAdd()) {
							return;
						}
					}
					// if (grid.isExceeded()) {
					// 	grid.showMaxRulesWarning();
					// 	return;
					// }

					if (editor.isEditing() === false) {
						var pagingStatus = settings.configs.paging;
						var paging = grid.plugins.paging;

						var defaultEvent = $.su.getDefaultEvent(viewObj, function () {
							if (pagingStatus && pagingStatus.isPaging) {
								paging.goToPage(0);
							}
							editor.startEdit('add');
							grid.dom().triggerHandler('ev_grid_edit', ['add']);
						});
						grid.dom().triggerHandler('ev_grid_before_edit', [defaultEvent.ev]);
						defaultEvent.exe();
						// if(pagingStatus && pagingStatus.isPaging){
						// 	paging.goToPage(0);
						// }
						// editor.startEdit("add");
						// grid.dom().triggerHandler('ev_grid_edit', ["add"]);
					}
				}
			},
			{
				selector: 'a.btn-delete',
				event: 'click',
				callback: function (e, viewObj) {
					e.stopPropagation();
					e.preventDefault();

					var settings = viewObj.settings;
					var grid = settings.objs.grid;
					var paging = grid.getPlugin('paging');
					var rows = grid.objs.rows;
					var editor = grid.getPlugin('editor');

					var selectedKeys = grid.getSelected();

					if ($(this).hasClass('disabled')) {
						return;
					}

					if (editor && editor.isEditing() === false) {
						grid.confirm($.su.CHAR.COMMON.DELETE_CONFIRM_CONTENT);
						$('#' + grid.confirmId)
							.one('ev_msg_ok', function () {
								for (var index = rows.length - 1; index >= 0; index--) {
									var rowOld = rows[index].obj;
									if ($.inArray(rowOld.dom().attr('data-key'), selectedKeys) !== -1) {
										rowOld.dom().remove();
										rows.splice(index, 1);
									}
								}
								grid.updateRowNumber();
								if (paging) {
									paging.updateBtns();
								}

								var defaultEvent = $.su.getDefaultEvent(viewObj, function () {
									grid.dom().triggerHandler('ev_grid_delete', [selectedKeys]);
								});
								grid.dom().triggerHandler('ev_grid_before_delete', [defaultEvent.ev]);
								defaultEvent.exe();
								grid.dom().triggerHandler('ev_grid_after_delete');
								$(this).off('ev_msg_no');
							})
							.one('ev_msg_no', function () {
								$(this).off('ev_msg_ok');
							});
					}
				}
			},
			{
				selector: 'a.btn-edit',
				event: 'click',
				callback: function (e, viewObj) {
					e.stopPropagation();
					e.preventDefault();
					var settings = viewObj.settings;
					var grid = settings.objs.grid;

					var keys = grid.getSelected();
					var editor = grid.getPlugin('editor');

					if (!editor || $(this).hasClass('disabled')) {
						return;
					}

					if (keys.length > 0 && editor && !editor.isEditing()) {
						editor.startEdit(keys[0]);
						grid.dom().triggerHandler('ev_grid_edit', [keys[0]]);
					}
				}
			},
			{
				selector: 'a.btn-delete-all',
				event: 'click',
				callback: function (e, viewObj) {
					e.stopPropagation();
					e.preventDefault();

					var settings = viewObj.settings;
					var grid = settings.objs.grid;
					var editor = grid.getPlugin('editor');

					if (!editor) {
						return;
					}

					if (editor.isEditing() === false) {
						var keys = [];
						var paging = grid.getPlugin('paging');
						var rows = grid.objs.rows;
						for (var i = rows.length - 1; i >= 0; i--) {
							keys.push(rows[i].key);
							rows[i].obj.dom().remove();
							rows.splice(i, 1);
						}
						grid.updateRowNumber();
						if (paging) {
							paging.updateBtns();
						}
						grid.dom().triggerHandler('ev_grid_delete', [keys]);
					}
				}
			},
			{
				selector: 'a.btn-clear',
				event: 'click',
				callback: function (e, viewObj) {
					e.stopPropagation();
					e.preventDefault();

					var settings = viewObj.settings;
					var grid = settings.objs.grid;
					var editor = grid.getPlugin('editor');
					var confirm = grid.confirm(settings.delAllText);
					confirm
						.dom()
						.off('ev_msg_ok')
						.on('ev_msg_ok', function () {
							if (!editor) {
								return;
							}
							if (editor.isEditing() === false) {
								grid.dom().triggerHandler('ev_grid_delete_all');
							}
						});
				}
			},
			{
				selector: 'input.search-text',
				event: 'focus',
				callback: function (e) {
					e.stopPropagation();
					$(this).closest('div.search-container').addClass('focus');
				}
			},
			{
				selector: 'input.search-text',
				event: 'blur',
				callback: function (e) {
					e.stopPropagation();
					$('div.search-container').removeClass('focus');
				}
			},
			{
				selector: 'a.operation-btn',
				event: 'click',
				callback: function (e, viewObj) {
					e.preventDefault();
					e.stopPropagation();

					if ($(this).hasClass('disabled')) {
						return;
					}

					var settings = viewObj.settings;
					var grid = settings.objs.grid;
					if (grid.isExceeded() && !$(this).hasClass('btn-refresh')) {
						grid.showMaxRulesWarning();
						return;
					}

					var name = $(this).attr('tbar-name');
					grid.dom().triggerHandler('ev_grid_tbar_' + name);
				}
			},
			{
				selector: 'a.search-switch',
				event: 'click',
				callback: function (e, viewObj) {
					e.stopPropagation();
					var settings = viewObj.settings;
					var grid = settings.objs.grid;
					var content = $(this).prevAll('input.search-text').val();
					grid.search(content);
				}
			}
		],
		init: function (options) {
			this.settings = options;
		},
		render: function () {
			var _this = this.dom();
			var wrap = _this.parent().find('div.grid-panel-tbar-container');
			var viewObj = this;
			var settings = this.settings;

			var type = $.type(settings.operation);
			var operations = [];

			settings.objs.grid.dom().addClass('grid-tbar');

			if (type === 'string') {
				operations = settings.operation.split('|');
			} else if (type === 'array') {
				operations = settings.operation;
			} else if (!settings.custom) {
				return null;
			}
			settings.operation = operations;
			wrap.removeClass('hidden');

			var inHTML = '<div class="operation-container" id="' + viewObj.domId + '">';
			for (var index = 0, len = operations.length; index < len; index++) {
				var fst = index === 0 ? 'fst' : '';
				var lst = index === len - 1 ? 'lst' : '';
				switch (operations[index]) {
					case 'add':
						inHTML += '<a tbar-name="add" class="operation-btn btn-add ' + fst + ' ' + lst + '">';
						inHTML += '<span class="icon"></span>';
						inHTML += '<span class="text">' + $.su.CHAR.OPERATION.ADD + '</span>';
						inHTML += '</a>';

						var msgInHTML = '<div class="grid-warning-msg warning">';
						msgInHTML += '<h4 class="title">';
						msgInHTML += '<span class="icon"></span>';
						msgInHTML += '<span class="text">' + settings.maxRulesMsgText + '</span>';
						msgInHTML += '</h4>';
						msgInHTML += '</div>';

						break;
					case 'edit':
						inHTML += '<a tbar-name="edit" class="operation-btn btn-edit ' + fst + ' ' + lst + '">';
						inHTML += '<span class="icon"></span>';
						inHTML += '<span class="text">' + $.su.CHAR.OPERATION.EDIT + '</span>';
						inHTML += '</a>';
						break;
					case 'prompt':
						inHTML += '<div class="grid-prompt hidden widget-container successed inline-block left">';
						inHTML += '<div class="content">';
						inHTML += '<span class="icon"></span>';
						inHTML += '<span class="text text-successed">' + settings.promptTextSuccessed + '</span>';
						inHTML += '<span class="text text-failed">' + settings.promptTextFailed + '</span>';
						inHTML += '</div>';
						inHTML += '</div>';

						settings.showPrompt = true;
						break;
					case 'delete':
						inHTML += '<a tbar-name="delete" class="operation-btn btn-delete ' + fst + ' ' + lst + '">';
						inHTML += '<span class="icon"></span>';
						inHTML += '<span class="text">' + $.su.CHAR.OPERATION.DELETE + '</span>';
						inHTML += '</a>';

						msgInHTML = '<div class="grid-warning-msg warning">';
						msgInHTML += '<h4 class="title">';
						msgInHTML += '<span class="icon"></span>';
						msgInHTML += '<span class="text">' + settings.noneSelectedMsgText + '</span>';
						msgInHTML += '</h4>';
						msgInHTML += '</div>';

						msgInHTML = '<div class="grid-warning-msg warning">';
						msgInHTML += '<h4 class="title">';
						msgInHTML += '<span class="icon"></span>';
						msgInHTML += '<span class="text">' + settings.deleteConfirmMsgText + '</span>';
						msgInHTML += '</h4>';
						msgInHTML += '</div>';

						break;
					case 'deleteAll':
						inHTML += '<a tbar-name="deleteAll" class="operation-btn btn-delete-all ' + fst + ' ' + lst + '">';
						inHTML += '<span class="icon"></span>';
						inHTML += '<span class="text">' + $.su.CHAR.OPERATION.DELETE_ALL + '</span>';
						inHTML += '</a>';

						msgInHTML = '<div class="grid-warning-msg warning">';
						msgInHTML += '<h4 class="title">';
						msgInHTML += '<span class="icon"></span>';
						msgInHTML += '<span class="text">' + settings.noneSelectedMsgText + '</span>';
						msgInHTML += '</h4>';
						msgInHTML += '</div>';

						msgInHTML = '<div class="grid-warning-msg warning">';
						msgInHTML += '<h4 class="title">';
						msgInHTML += '<span class="icon"></span>';
						msgInHTML += '<span class="text">' + settings.deleteAllConfirmMsgText + '</span>';
						msgInHTML += '</h4>';
						msgInHTML += '</div>';

						break;
					case 'clear':
						inHTML += '<a tbar-name="clear" class="operation-btn btn-clear ' + fst + ' ' + lst + '">';
						inHTML += '<span class="icon"></span>';
						inHTML += '<span class="text">' + $.su.CHAR.OPERATION.DELETE_ALL + '</span>';
						inHTML += '</a>';
						break;
					case 'enable':
						inHTML += '<a tbar-name="enable" class="operation-btn btn-enable ' + fst + ' ' + lst + '">';
						inHTML += '<span class="icon"></span>';
						inHTML += '<span class="text">' + $.su.CHAR.OPERATION.ENABLE + '</span>';
						inHTML += '</a>';
						break;
					case 'disable':
						inHTML += '<a tbar-name="disable" class="operation-btn btn-disable ' + fst + ' ' + lst + '">';
						inHTML += '<span class="icon"></span>';
						inHTML += '<span class="text">' + $.su.CHAR.OPERATION.DISABLE + '</span>';
						inHTML += '</a>';
						break;
					case 'search':
						inHTML += '<div class="container widget-container text-container search-container inline">';
						inHTML += '<span class="widget-wrap text-wrap search-wrap">'; //class 'text-wrap' 与textbox重名，可能有样式问题
						inHTML += '<input type="text" class="text-text search-text" value="' + $.su.CHAR.OPERATION.SEARCH + '" />';
						inHTML += '<span class="pos"></span>';
						inHTML += '<a class="search-switch"></a>';
						inHTML += '</span>';
						inHTML += '</div>';
						break;
					case 'refresh':
						inHTML += '<a tbar-name="refresh" class="operation-btn btn-refresh ' + fst + ' ' + lst + '">';
						inHTML += '<span class="icon"></span>';
						inHTML += '<span class="text">' + $.su.CHAR.OPERATION.REFRESH + '</span>';
						inHTML += '</a>';
						break;
					default:
						var xtype = operations[index].xtype;
						var renderer = operations[index].renderer;
						if (xtype) {
							inHTML +=
								'<input operation-index="' +
								index +
								'" class="operation-user-defined operation-' +
								index +
								' ' +
								fst +
								' ' +
								lst +
								' ' +
								xtype +
								'"/>';
						} else if (renderer) {
							inHTML += renderer();
						}
						break;
				}
			}
			inHTML += '</div>';

			var toolbar = $(inHTML);

			wrap.append(toolbar);

			_this.remove();

			for (var name in this.settings.custom) {
				if (this.settings.custom.hasOwnProperty(name)) {
					var config = this.settings.custom[name];
					var dom = '<a tbar-name="' + name + '" class="operation-btn btn-' + name + ' ' + config.cls + '">';
					dom += '<span class="icon"></span>';
					dom += '<span class="text">' + config.text + '</span>';
					dom += '</a>';
					if (config.index !== undefined) {
						var children = this.dom().children();
						if (config.index === 0) {
							this.dom().prepend($(dom));
						} else if (config.index <= children.length) {
							$(children.get(config.index - 1)).after($(dom));
						} else {
							this.dom().append($(dom));
						}
					} else {
						this.dom().append($(dom));
					}
				}
			}
			this.disable(['delete', 'edit']);
		},
		disable: function (names) {
			if (!$.isArray(names)) {
				names = [names];
			}
			for (var i = 0, len = names.length; i < len; i++) {
				var name = names[i];
				var className = '.operation-btn.btn-' + name;
				this.dom().find(className).addClass('disabled');
			}
		},
		enable: function (names) {
			if (!$.isArray(names)) {
				names = [names];
			}
			for (var i = 0, len = names.length; i < len; i++) {
				var name = names[i];
				var className = '.operation-btn.btn-' + name;
				this.dom().find(className).removeClass('disabled');
			}
		}
	});
})();
