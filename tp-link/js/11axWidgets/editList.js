(function ($) {
	var editList = $.su.Widget.register('editList', {
		settings: {
			delIconPos: {
				attribute: 'del-icon-pos',
				defaultValue: 'right'
			},
			addBtn: {
				attribute: 'add-btn',
				defaultValue: false
			},
			addText: {
				attribute: 'add-text',
				defaultValue: ''
			},
			itemCls: {
				attribute: 'item-cls',
				defaultValue: ''
			},
			idKey: {
				attribute: 'id-key',
				defaultValue: 'index'
				// index: each item is a value not object
			}
		},
		listeners: [
			{
				selector: '.del-icon',
				event: 'click',
				callback: function (e, viewObj) {
					var id = $(this).attr('data-id');
					var data = $.su.clone(viewObj.getValue());
					var keyProperty = viewObj.settings.idKey;
					if (keyProperty == 'index') {
						data.splice(id, 1);
					} else {
						for (var i = 0; i < data.length; i++) {
							if (id == data[i][keyProperty]) {
								data.splice(i, 1);
							}
						}
					}
					viewObj.dom().triggerHandler('ev_view_change', [
						{
							type: 'value',
							value: data
						}
					]);
				}
			},
			{
				selector: '.add-button',
				event: 'click',
				callback: function (e, viewObj) {
					var data = viewObj.getValue();

					viewObj.dom().triggerHandler('ev_add_item', [
						{
							type: 'value',
							value: data
						}
					]);
				}
			}
		],

		init: function () {},

		render: function () {
			var me = this;
			var _this = this.dom();
			var settings = this.settings;
			var labelField = settings.labelField === false ? ' label-empty' : '';
			_this.addClass(settings.cls + ' editlist-container' + labelField);
			var inHTML = '';
			if (settings.labelField !== null) {
				inHTML += '<div class="widget-fieldlabel-wrap' + settings.labelCls + (settings.labelField == '' ? ' empty' : '') + '">';
				inHTML += '<div class="widget-fieldlabel-inner">';
				inHTML += '<label class="widget-fieldlabel editlist-fieldlabel">' + settings.labelField + '</label>';
				if (settings.labelField) {
					inHTML += '<span class="widget-separator">' + settings.separator + '</span>';
				}
				inHTML += '</div>';
				inHTML += '</div>';
			}
			inHTML += '<div class="widget-wrap-outer editlist-wrap-outer">';
			inHTML += '<div class="widget-wrap editlist-wrap">';
			if (settings.addBtn) {
				inHTML += '<a class="add-button">' + '<span class="add-icon"></span>' + '<span class="add-text">' + settings.addText + '</span>' + '</a>';
			}

			inHTML += '</div>';
			inHTML += '</div>';

			_this.empty().append(inHTML);
		},

		setValue: function (value) {
			if (value != null) {
				var me = this;
				var _this = this.dom();
				var settings = this.settings,
					keyProperty = settings.idKey,
					itemCls = settings.itemCls ? ' ' + settings.itemCls : '';
				me.value = value;

				var innerHTML = '';

				for (var i = 0; i < value.length; i++) {
					innerHTML += '<div class="list-item' + itemCls + '">';
					innerHTML += settings.renderer
						? settings.renderer(value[i])
						: '<span title="' + $.su.escapeHtml(value[i]) + '">' + $.su.escapeHtml(value[i]) + '</span>';
					innerHTML += '<span class="del-icon icon" data-id="' + $.su.escapeHtml(keyProperty == 'index' ? i : value[i][keyProperty]) + '"></span>';
					innerHTML += '</div>';
				}
				$(_this).find('.list-item').remove();
				$(_this).find('.editlist-wrap').append(innerHTML);
			}
		},

		getValue: function () {
			return this.value;
		}
	});
})(jQuery);
