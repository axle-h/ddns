(function () {
	var Textbox = $.su.Widget.register('textbox', {
		settings: {
			readOnly: {
				attribute: 'read-only',
				defaultValue: false
			},
			tipText: {
				attribute: 'tip-text',
				defaultValue: ''
			},
			unit: {
				attribute: 'unit',
				defaultValue: ''
			},
			addon: {
				attribute: 'add-on',
				defaultValue: ''
			},
			hint: {
				attribute: 'hint',
				defaultValue: null
			},
			prefix: {
				attribute: 'prefix',
				defaultValue: null
			},
			autoTrim: {
				attribute: 'auto-trim',
				defaultValue: null
			},
			emitEnter: {
				attribute: 'emit-enter',
				defaultValue: false
			}
		},

		listeners: [
			{
				selector: '.text-wrap-inner input',
				event: 'keyup',
				callback: function (e, viewObj) {
					var val = viewObj.getValue();
					viewObj.dom().find('.text-hint-inner').hide();
					viewObj.dom().triggerHandler('ev_view_change', [
						{
							type: 'value',
							value: val
						}
					]);
					if (viewObj.settings.emitEnter && e.keyCode == 13) {
						viewObj.dom().triggerHandler('ev_input_enter');
					}
				}
			},
			{
				selector: '.text-wrap-inner input',
				event: 'click',
				callback: function (e, viewObj) {
					var val = viewObj.getValue();
					viewObj.dom().addClass('focus');
					viewObj.dom().triggerHandler('ev_view_change', [
						{
							type: 'value',
							value: val
						}
					]);

					viewObj.dom().triggerHandler('ev_input_click');

					viewObj.dom().find('.text-hint-inner').hide();
				}
			},
			{
				selector: 'div.text-wrap',
				event: 'mouseenter',
				callback: function (e, viewObj) {
					viewObj.dom().addClass('hover');
				}
			},
			{
				selector: 'div.text-wrap',
				event: 'mouseleave',
				callback: function (e, viewObj) {
					viewObj.dom().removeClass('hover');
				}
			},
			{
				selector: '.text-wrap-inner input',
				event: 'blur',
				callback: function (e, viewObj) {
					var val = viewObj.getValue();
					if (viewObj.settings.autoTrim === true) {
						val = $.trim(val);
					}
					viewObj.dom().find('div.widget-addon').hide();
					viewObj.dom().triggerHandler('ev_view_change', [
						{
							type: 'value',
							value: val
						}
					]);
					viewObj.dom().triggerHandler('ev_view_change', [
						{
							type: 'valid',
							value: val
						}
					]);
					viewObj.dom().triggerHandler('ev_textbox_blur');
					viewObj.dom().removeClass('focus');

					if (val == '' && viewObj.settings.hint) {
						viewObj.dom().find('.text-hint-inner').show();
					}
				}
			},
			{
				selector: '.text-wrap input',
				event: 'focus',
				callback: function (e, viewObj) {
					viewObj.setAddon();
					viewObj.dom().addClass('focus');
					viewObj.dom().triggerHandler('ev_textbox_focus');
				}
			},
			{
				selector: '.text-hint-inner input.text-hint',
				event: 'click',
				callback: function (e, viewObj) {
					if (!viewObj.dom().hasClass('disabled')) {
						viewObj.dom().find('.text-wrap-inner input').click().focus();
					}
				}
			}
		],

		init: function () {},

		render: function () {
			var _this = this.dom();
			var viewObj = this;
			var settings = this.settings;
			var readOnly = settings.readOnly ? 'readonly="readonly"' : '';
			var readOnlyCls = settings.readOnly ? ' readonly' : '';
			var labelField = settings.labelField === false ? 'label-empty' : '';
			var addon = settings.addon === '' ? '' : ' addon';
			var unit = settings.unit === '' ? '' : ' unit';
			var tips = settings.tips === '' ? '' : ' tips';
			var shortTips = settings.shortTips === '' ? '' : ' short-tips';
			var prefix = settings.prefix == null ? '' : ' prefix';

			_this.addClass(settings.cls + 'text-container ' + labelField + addon + unit + tips + shortTips + prefix + readOnlyCls);

			var inHTML = '';

			if (settings.labelField !== null) {
				inHTML += '<div class="widget-fieldlabel-wrap' + settings.labelCls + (settings.labelField == '' ? ' empty' : '') + '">';
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
			if (settings.prefix || settings.unit) {
				inHTML += '<div class="widget-table-wrap text-table-wrap">';
			}
			inHTML += '<span class="text-wrap-before"></span>';
			if (settings.prefix) {
				inHTML += '<div class="text-wrap-prefix">';
				inHTML += '<span class="text-prefix">' + settings.prefix + '</span>';
				inHTML += '</div>';
			}
			inHTML += '<span class="text-wrap-inner"><input type="text" ' + readOnly + '/></span>';
			inHTML += '<span class="text-wrap-after"></span>';

			if (settings.unit) {
				inHTML += '<span class="text-wrap-unit">' + settings.unit + '</span>';
			}

			if (settings.hint) {
				inHTML += '<span class="hint text-hint-inner">';
				inHTML += '<input class="text-hint" value="' + settings.hint + '" tabindex="-1" contenteditable="false" readonly="readonly"/>';
				inHTML += '</span>';
			}
			if (settings.prefix || settings.unit) {
				inHTML += '</div>';
			}
			inHTML += '</div>';
			if (settings.shortTips != '' && settings.shortTips != null && settings.shortTips != undefined) {
				inHTML += '<div class="widget-short-tips textbox-short-tips">';
				inHTML += '<div class="content short-tips-content">' + settings.shortTips + '</div>';
				inHTML += '</div>';
			}
			if (settings.tips != '' && settings.tips != null && settings.tips != undefined) {
				inHTML += '<div class="widget-tips textbox-tips ' + settings.tipsCls + '">';
				inHTML += '<div class="content tips-content">' + settings.tips + '</div>';
				inHTML += '</div>';
			}

			inHTML += '<div widget="errortip" error-cls="' + settings.errorTipsCls + '">';
			inHTML += '</div>';

			if (settings.addon) {
				inHTML += '<div class="widget-addon">';
				inHTML += '<span class="addon-content">' + settings.addon + '</span>';
				inHTML += '</div>';
			}

			inHTML += '</div>';

			if (settings.tipText) {
				inHTML += '<div widget="toolTip"></div>';
				_this.addClass('has-tool-tip');
			}
			_this.empty().append(inHTML);
		},

		setMaxLength: function (num) {
			var _this = this.dom();
			num = parseInt(num);

			if ($.type(num) !== 'number') {
				return;
			}
			_this.find('.text-wrap-inner input').attr('maxlength', num);
		},

		focus: function () {
			var _this = this.dom();

			_this.find('.text-wrap-inner input').focus();
		},

		disable: function (visually) {
			var _this = this.dom();
			var container = this.getContainer();

			container.addClass('disabled');
			_this.find('.text-wrap-inner input').prop('disabled', true);
			if (visually) {
				container.addClass('visual-disabled');
			} else {
				_this.triggerHandler('ev_view_disable');
			}
		},

		enable: function () {
			var _this = this.dom();
			var container = this.getContainer();

			container.removeClass('disabled');
			_this.find('.text-wrap-inner input').prop('disabled', false);
			_this.triggerHandler('ev_view_enable');
		},

		setReadonly: function () {
			var _this = this.dom();
			var container = this.getContainer();

			container.addClass('read-only');
			_this.attr('readonly', 'readonly');
		},

		removeReadonly: function () {
			var _this = this.dom();
			var container = this.getContainer();

			container.removeClass('read-only');
			_this.removeAttr('readonly');
		},

		setValue: function (value) {
			if (this.getValue() === value) {
				return;
			}
			var _this = this.dom();
			_this.find('.text-wrap-inner input').val(value);
			if (value != '' && value != null) {
				_this.find('.text-hint-inner').hide();
			}
		},

		getValue: function () {
			var inputs = this.dom().find('.text-wrap-inner input');
			if (inputs.length > 1) {
				var val = [];
				inputs.each(function () {
					val.push($(this).val());
				});
				return val;
			} else {
				return inputs.val();
			}
		},
		setAddon: function (text) {
			var text = text || this.settings.addon;
			var addonDom = this.dom().find('div.widget-addon');

			var container = this.getContainer() || this.dom();
			var tips = this.dom().find('.widget-tips');

			container.removeClass('error dirty correct');
			if (this.errortip) {
				this.errortip.hide();
			}
			if (text == '' || !text) {
				tips.show();
				return;
			}

			tips.hide();
			addonDom.fadeIn(150);
		},
		setError: function (err) {
			var _this = this.dom();
			var container = this.getContainer();
			var errorDom = _this.find('div[widget=errortip]');
			var tips = _this.find('.widget-tips');
			if (!container || this.isDisabled()) {
				return;
			}
			tips.hide();
			if (this.errortip) {
				!!err && this.errortip.show(err);
			} else if (errorDom.length > 0 && container) {
				var errorTip = container.children('.widget-wrap-outer').children('div[widget=errortip]');
				if (errorTip.get(0)) {
					$(errorTip[0]).attr('id', this.domId + '_errortip');
					this.errortip = $(errorTip[0]).errortip({ type: this.type })[0];
					this.errortip.render();
					!!err && this.errortip.show(err);
				}
			}

			container.removeClass('valid').addClass('error');
			container.find('span.widget-validate-icon').css({
				display: 'inline-block'
			});
		},
		setNormal: function () {
			var _this = this.dom();
			var settings = this.settings;
			var container = this.getContainer() || _this;
			var errorDom = _this.find('div[widget=errortip]');
			var tips = _this.find('.widget-tips');
			if (!container) {
				return;
			}
			container.removeClass('error disable dirty correct');
			container.find('span.widget-validate-icon').css({
				display: 'none'
			});
			container.find('div.widget-addon').hide();
			if (this.errortip) {
				this.errortip.hide();
			}
			if (tips.length > 0) {
				tips.fadeIn(150);
			}
		},
		setPrefix: function (prefix) {
			this.dom().find('.text-prefix').html(prefix);
		}
	});
})();
