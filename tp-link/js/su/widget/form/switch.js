(function () {
	var Switch = $.su.Widget.register('switch', {
		settings: {
			name: {
				attribute: 'name',
				defaultValue: ''
			},
			trueValue: {
				attribute: 'true-value',
				defaultValue: 1
			},
			falseValue: {
				attribute: 'false-value',
				defaultValue: 0
			},
			columns: {
				attribute: 'columns',
				defaultValue: 1
			},
			tipText: {
				attribute: 'tip-text',
				defaultValue: ''
			},
			//		boxLabel: {
			//			attribute: "box-label",
			//			defaultValue: ""
			//		},
			animateTime: {
				attribute: 'animate-time',
				defaultValue: 300
			}
		},

		listeners: [
			{
				selector: '.switch-label',
				event: 'click',
				callback: function (e, viewObj) {
					e.preventDefault();
					e.stopPropagation();
					var node = $(this);
					var settings = viewObj.settings;
					var val = viewObj.getValue();
					var container = node.closest('.switch-container');
					if (node.hasClass('disabled') || container.hasClass('loading-on') || container.hasClass('loading-off')) {
						return;
					}
					val = val === settings.trueValue ? settings.falseValue : settings.trueValue;

					var defaultEvent = $.su.getDefaultEvent(viewObj, function () {
						viewObj.dom().triggerHandler('ev_view_change', [
							{
								type: 'value',
								value: val
							}
						]);
					});
					viewObj.dom().trigger('ev_view_will_change', [defaultEvent.ev]);
					defaultEvent.exe();
				}
			}
		],
		init: function () {},
		render: function () {
			var _this = this.dom();
			var settings = this.settings;
			this.value = null;
			//		var boxId = this.domId + "-checkbox-" + parseInt(Math.random() * 1000 * 1000 * 1000, 10).toString();

			_this.addClass(settings.cls + 'switch-container');

			var inHTML = '';

			if (settings.labelField !== null) {
				inHTML += '<div class="widget-fieldlabel-wrap ' + settings.labelCls + '">';
				inHTML += '<div class="widget-fieldlabel-inner">';
				inHTML += '<label class="widget-fieldlabel switch-fieldlabel">' + settings.labelField + '</label>';
				if (settings.labelField !== '') {
					inHTML += '<span class="widget-separator">' + settings.separator + '</span>';
				}
				inHTML += '</div>';
				inHTML += '</div>';
			}

			inHTML += '<div class="widget-wrap-outer switch-wrap-outer">';
			inHTML += '<div class="switch-wrap">';

			inHTML += '<div class="widget-wrap">';
			inHTML += '<label class="switch-label">';
			//			inHTML += 					'<input class="checkbox-checkbox" type="checkbox" id="' + boxId + '" />';
			inHTML += '<span class="icon-bg"></span>';
			inHTML += '<span class="icon-ball"></span>';
			inHTML += '<span class="icon-loading"></span>';
			//			inHTML += 					'<span class="text">' + settings.boxLabel + '</span>';
			inHTML += '</label>';
			inHTML += '</div>';

			inHTML += '</div>';

			if (settings.tips != null && settings.tips != undefined) {
				inHTML += '<div class="widget-tips textbox-tips ' + settings.tipsCls + '">';
				inHTML += '<div class="widget-tips-wrap">';
				inHTML += '<div class="content tips-content">' + settings.tips + '</div>';
				inHTML += '</div>';
				inHTML += '</div>';
			}

			inHTML += '<div widget="errortip" error-cls="' + settings.errorTipsCls + '">';
			inHTML += '</div>';

			inHTML += '</div>';

			if (settings.tipText) {
				inHTML += '<div widget="toolTip"></div>';
			}

			_this.empty().append(inHTML);
		},

		init: function () {},

		setValue: function (value) {
			var _this = this.dom();
			var settings = this.settings;
			var label = _this.find('label.switch-label');
			var me = this;
			var setChecked = function (label, value) {
				if (value === settings.trueValue) {
					label.addClass('checked');
					me.value = value;
				} else if (value === settings.falseValue) {
					label.removeClass('checked');
					me.value = value;
				}
			};

			setChecked(label.eq(0), value);
		},

		getValue: function () {
			var settings = this.settings;

			return this.value === settings.trueValue ? settings.trueValue : settings.falseValue;
		},

		disable: function () {
			this.getContainer().addClass('disabled');
			this.dom().find('label.switch-label').addClass('disabled');
			this.setStatus('disabled', true);
		},

		enable: function () {
			this.getContainer().removeClass('disabled');
			this.dom().find('label.switch-label').removeClass('disabled');
			this.setStatus('disabled', false);
		},

		showTips: function () {
			this.dom().find('.widget-tips').removeClass('hidden');
		},

		hideTips: function () {
			this.dom().find('.widget-tips').addClass('hidden');
		},
		showLoading: function (status) {
			if (status == 'on') {
				this.dom().removeClass('loading-off').addClass('loading-on');
			} else {
				this.dom().removeClass('loading-on').addClass('loading-off');
			}
		},
		hideLoading: function () {
			this.dom().removeClass('loading-on loading-off');
		}
	});
})();
