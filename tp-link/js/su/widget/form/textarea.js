(function () {
	var Textarea = $.su.Widget.register('textarea', {
		settings: {
			readOnly: {
				attribute: 'read-only',
				defaultValue: false
			},
			datePicker: {
				attribute: 'date-picker',
				defaultValue: ''
			},
			tipText: {
				attribute: 'tip-text',
				defaultValue: ''
			},
			textareaCls: {
				attribute: 'textarea-cls',
				defaultValue: ''
			},
			placeholder: {
				attribute: 'placeholder',
				defaultValue: ''
			},
			rows: {
				attribute: 'rows',
				defaultValue: 4
			},
			autoHeight: {
				attribute: 'auto-height',
				defaultValue: false
			}
		},

		listeners: [
			{
				selector: '.text-wrap textarea',
				event: 'keyup',
				callback: function (e, viewObj) {
					var val = $(this).val();
					viewObj.dom().triggerHandler('ev_view_change', [
						{
							type: 'value',
							value: val
						}
					]);
				}
			},
			{
				selector: '.text-wrap textarea',
				event: 'blur',
				callback: function (e, viewObj) {
					var val = $(this).val();
					viewObj.dom().triggerHandler('ev_view_change', [
						{
							type: 'valid',
							value: val
						}
					]);
					viewObj.dom().triggerHandler('ev_textbox_blur');
				}
			}
		],

		init: function () {},

		render: function () {
			var _this = this.dom();
			var viewObj = this;
			var settings = this.settings;
			var readOnly = settings.readOnly ? 'readonly="readonly"' : '';
			var labelField = settings.labelField === false ? 'label-empty' : '';

			_this.addClass(settings.cls + 'text-container ' + labelField + ' ' + (settings.readOnly ? 'readOnly' : ''));

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
			inHTML += '<span class="text-wrap-inner">';
			inHTML += '<textarea type="text" placeholder="' + settings.placeholder;
			inHTML += '" rows="' + settings.rows;

			var textareaCls = settings.textareaCls + (settings.autoHeight ? ' auto-height' : '');
			inHTML += '" class="' + textareaCls + '" ' + readOnly + '></textarea>';
			inHTML += '</span>';
			inHTML += '<span class="text-wrap-after"></span>';

			if (settings.hint) {
				inHTML += '<span class="hint text-hint">';
				inHTML += '<input class="text-hint" value="' + settings.hint + '" tabindex="-1" contenteditable="false" readonly="readonly"/>';
				inHTML += '</span>';
			}

			if (settings.datePicker != '') {
				inHTML += '<div widget="datepicker" id="' + this.domId + '_date_picker" class="datepicker-widget"></div>';
			}

			inHTML += '</div>';

			inHTML += '<div widget="errortip" error-cls="' + settings.errorTipsCls + '">';
			inHTML += '</div>';

			if (settings.tips != null && settings.tips != undefined) {
				inHTML += '<div class="widget-tips textbox-tips ' + settings.tipsCls + '">';
				inHTML += '<div class="content tips-content">' + settings.tips + '</div>';
				inHTML += '</div>';
			}

			inHTML += '</div>';

			if (settings.tipText) {
				inHTML += '<div widget="toolTip"></div>';
			}
			_this.empty().append(inHTML);

			if (settings.datePicker != '') {
				_this.addClass('textbox-datepicker');
				_this.find('div[widget=datepicker]').datepicker({ textbox: viewObj })[0].render();
			}
		},

		setMaxLength: function (num) {
			var _this = this.dom();
			num = parseInt(num);

			if ($.type(num) !== 'number') {
				return;
			}
			_this.find('textarea').attr('maxlength', num);
		},

		setReadonly: function (flag) {
			var _this = this.dom();
			var input = _this.find('.text-wrap-inner textarea');

			if (flag) {
				input.prop('readonly', true);
				_this.addClass('readonly');
			} else {
				input.prop('readonly', false);
				_this.removeClass('readonly');
			}
		},

		focus: function () {
			var _this = this.dom();

			_this.find('textarea').focus();
		},

		setValue: function (value) {
			if (this.getValue() === value) {
				return;
			}
			var _this = this.dom();
			_this.find('textarea').val(value);
		},

		getValue: function () {
			var _this = this.dom();
			return _this.find('textarea').val();
		}
	});
})();
