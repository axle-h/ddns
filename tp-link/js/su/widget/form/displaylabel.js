(function () {
	var Displaylabel = $.su.Widget.register('displaylabel', {
		settings: {
			readOnly: {
				attribute: 'read-only',
				defaultValue: false
			},
			tipText: {
				attribute: 'tip-text',
				defaultValue: ''
			},
			customTipText: {
				attribute: 'custom-tip-text',
				defaultValue: false
			},
			customTipGlobalCls: {
				attribute: 'custom-global-cls',
				defaultValue: ''
			},
			customTipSmallSizePosition: {
				attribute: 'custom-tip-small-size-position',
				defaultValue: 'bottom'
			},
			renderer: {
				attribute: 'renderer',
				defaultValue: function (val) {
					if (val == null) {
						return '';
					}
					return val;
				}
			}
		},

		init: function () {},

		render: function () {
			var _this = this.dom();
			var settings = this.settings;
			var labelField = settings.labelField === false ? 'label-empty' : '';

			_this.addClass(settings.cls + 'displaylabel-container ' + labelField);

			var inHTML = '';

			if (settings.labelField !== null) {
				inHTML += '<div class="widget-fieldlabel-wrap ' + settings.labelCls + '">';
				inHTML += '<div class="widget-fieldlabel-inner">';
				inHTML += '<label class="widget-fieldlabel text-fieldlabel">' + settings.labelField + '</label>';
				if (settings.labelField) {
					inHTML += '<span class="widget-separator">' + settings.separator + '</span>';
				}
				inHTML += '</div>';
				inHTML += '</div>';
			}

			inHTML += '<div class="widget-wrap-outer text-wrap-outer">';
			inHTML += '<div class="widget-wrap text-wrap">';
			inHTML += '<span class="text-wrap-before"></span>';
			inHTML += '<span class="text-wrap-display"></span>';
			inHTML += '<span class="text-wrap-after"></span>';
			inHTML += '</div>';

			inHTML += '<div widget="errortip" error-cls="' + settings.errorTipsCls + '">';
			inHTML += '</div>';

			if (settings.tips != null && settings.tips != undefined) {
				inHTML += '<div class="widget-tips textbox-tips ' + settings.tipsCls + '">';
				inHTML += '<div class="content tips-content">' + settings.tips + '</div>';
				inHTML += '</div>';
			}

			inHTML += '</div>';

			if (settings.tipText || settings.customTipText) {
				inHTML += '<div widget="toolTip"></div>';
			}

			_this.append(inHTML);

			if (settings.customTipText) {
				var customTipContent = _this.find('.custom-tip-text').get(0);
				var toolTipWidget = _this.find('div[widget=toolTip]');

				toolTipWidget.html(customTipContent);
			}
		},

		setValue: function (value) {
			var _this = this.dom();
			var settings = this.settings;
			value = settings.renderer(value);
			_this.find('span.text-wrap-display').text(value);
		},

		setHTML: function (value) {
			var _this = this.dom();
			var settings = this.settings;
			value = settings.renderer(value);
			_this.find('span.text-wrap-display').html(value);
		},

		getValue: function () {
			var _this = this.dom();
			return _this.find('span.text-wrap-display').text();
		},

		setTextColor: function (color) {
			var _this = this.dom();

			_this.find('span.text-wrap-display').css('color', color);
		}
	});
})();
