/**
 * Created by hewenlin on 2017/11/13.
 */
(function () {
	var Time = $.su.Widget.register('combination', {
		settings: {
			widgetSeparator: {
				attribute: 'widget-separator',
				defaultValue: ''
			},
			subLabelField: {
				attribute: 'sub-label-field',
				defaultValue: ''
			},
			total: {
				attribute: 'total',
				defaultValue: ''
			},
			autoCompose: {
				attribute: 'auto-compose',
				defaultValue: true
			}
		},

		listeners: [],

		init: function () {},

		render: function () {
			var _this = this.dom();
			var settings = this.settings;
			_this.addClass(settings.cls + 'combination-container');

			var inHTML = '';

			if (settings.labelField !== false || settings.subLabelField) {
				inHTML += '<div class="widget-fieldlabel-wrap ' + settings.labelCls + (settings.labelField ? ' has-main-label' : '') + '">';
				inHTML += '<div class="widget-fieldlabel-inner">';
				inHTML += '<label class="widget-fieldlabel combination-fieldlabel">' + settings.labelField + '</label>';
				if (settings.labelField !== '') {
					inHTML += '<span class="widget-separator">' + settings.separator + '</span>';
				}
				if (settings.subLabelField !== '') {
					inHTML += '<span class="widget-sub-fieldlabel combination-sub-fieldlabel">' + settings.subLabelField + '</span>';
				}
				inHTML += '</div>';
				inHTML += '</div>';
			}

			inHTML += '<div class="widget-wrap-outer combination-wrap-outer">';
			inHTML += '<div class="widget-wrap combination-wrap">';

			inHTML += '</div>';
			inHTML += '<div widget="errortip"></div>';
			inHTML += '</div>';

			if (settings.tipText) {
				inHTML += '<div widget="toolTip"></div>';
			}

			var widgets = _this.find('div[widget]');
			this.widgets = widgets;
			var len = widgets.length;
			_this.append(inHTML);
			_this.find('div.combination-wrap').eq(0).append(widgets);
			//			debugger
			if (settings.autoCompose) {
				if (/^\[.*\]$/.test(settings.widgetSeparator)) {
					//if is array
					settings.widgetSeparator = eval(settings.widgetSeparator);
				}
				var separatorIsArray = $.isArray(settings.widgetSeparator);
				widgets.each(function (index, element) {
					var type = $(this).attr('widget');
					$(this).addClass('widget-' + index + ' ' + type + '-' + index);
					if (settings.widgetSeparator !== false && index < len - 1) {
						$(this).after(
							'<span class="separator ' +
								('separator-' + index) +
								'">' +
								(separatorIsArray ? settings.widgetSeparator[index] || settings.widgetSeparator : settings.widgetSeparator) +
								'</span>'
						);
					}
				});
				_this.addClass('total-' + (settings.total === '' ? len : settings.total));
			}
		},
		enable: function () {
			this.dom().removeClass('disabled');
			this.widgets.each(function () {
				$(this).data('viewObj').enable();
			});
		},
		disable: function () {
			this.dom().addClass('disabled');
			this.widgets.each(function () {
				$(this).data('viewObj').disable();
			});
		},
		setSubLabel: function (text) {
			if (text !== undefined && text !== null) {
				this.dom().find('.combination-sub-fieldlabel').html(text);
			}
		},
		remove: function () {
			var _this = this.dom();
			_this.find('[widget]').each(function (index, ele) {
				var eleObj = $(ele).data('viewObj');
				!!eleObj && eleObj.remove();
			});
			_this.remove();
			this.settings = null;
			!!this._view && this._view.removeChildWidget(this);
		}
	});
})();
