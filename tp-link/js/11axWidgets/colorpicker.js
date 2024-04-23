(function ($) {
	var colorPicker = $.su.Widget.register('colorpicker', {
		settings: {},
		listeners: [
			{
				selector: 'input.hex-input',
				event: 'keydown',
				callback: function (e, viewObj) {
					if (
						!(e.keyCode >= 48 && e.keyCode <= 57) &&
						!(e.keyCode >= 96 && e.keyCode <= 105) &&
						!(e.keyCode >= 65 && e.keyCode <= 70) &&
						e.keyCode !== 8 &&
						e.keyCode !== 190 &&
						e.keyCode !== 110 &&
						!e.ctrlKey &&
						!e.metaKey &&
						e.keyCode !== 39 &&
						e.keyCode !== 37
					) {
						e.preventDefault();
						return;
					}
				}
			},
			// {
			//     selector: 'input.hex-input',
			//     event: 'keyup change',
			//     callback: $.su.debounce(function (e, viewObj) {
			//         var val = $(this).val() || "ffffff";
			//         var ret = $.su.clone(viewObj.value);
			//         var _temp = $.su.hexToRgb(val);
			//         if (!!_temp) {
			//             ret.r = _temp.r;
			//             ret.g = _temp.g;
			//             ret.b = _temp.b;

			//             viewObj.dom().triggerHandler("ev_view_change", [{
			//                 "type": "value",
			//                 "value": ret
			//             }]);
			//         }
			//     }, 500)
			// },
			{
				selector: 'input.hex-input',
				event: 'blur',
				callback: $.su.debounce(function (e, viewObj) {
					var val = $(this).val() || '';
					var ret = $.su.clone(viewObj.value);
					if (!/^([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/g.test(val)) {
						$(this).val('000000');
						val = '000000';
					}
					var _temp = $.su.hexToRgb(val);
					if (!!_temp) {
						ret.r = _temp.r;
						ret.g = _temp.g;
						ret.b = _temp.b;

						viewObj.dom().triggerHandler('ev_view_change', [
							{
								type: 'value',
								value: ret
							}
						]);
					}
				}, 500)
			},
			{
				selector: 'input.opacity-input',
				event: 'focus',
				callback: function (e, viewObj) {
					var val = $(this).val() || 100;
					viewObj.dom().find('input.opacity-input-old').val(val);
				}
			},
			{
				selector: 'input.opacity-input',
				event: 'blur',
				callback: $.su.debounce(function (e, viewObj) {
					var val = $(this).val() || 100;
					if (Number(val) > 100) {
						val = 100;
					} else if (Number(val) < 0) {
						val = 0;
					} else if (isNaN(Number(val))) {
						val = viewObj.dom().find('input.opacity-input-old').val();
					}
					val = Number(val).toFixed(0);
					$(this).val(val);
					var ret = $.su.clone(viewObj.value);
					ret.a = Number(val) / 100;
					viewObj.dom().triggerHandler('ev_view_change', [
						{
							type: 'value',
							value: ret
						}
					]);
				}, 100)
			},
			// {
			//     selector: 'input.opacity-input',
			//     event: 'keyup change',
			//     callback: $.su.debounce(function (e, viewObj) {
			//         var val = $(this).val() || 100;
			//         if (Number(val) > 100 || Number(val) < 0 || isNaN(Number(val))) {
			//             return;
			//         }
			//         var ret = $.su.clone(viewObj.value);
			//         ret.a = Number(val) / 100;
			//         viewObj.dom().triggerHandler("ev_view_change", [{
			//             "type": "value",
			//             "value": ret
			//         }]);
			//     }, 500)
			// },
			{
				selector: 'input.opacity-input',
				event: 'keydown',
				callback: function (e, viewObj) {
					if (
						!(e.keyCode >= 48 && e.keyCode <= 57) &&
						!(e.keyCode >= 96 && e.keyCode <= 105) &&
						e.keyCode !== 8 &&
						e.keyCode !== 190 &&
						e.keyCode !== 110 &&
						!e.ctrlKey &&
						!e.metaKey &&
						e.keyCode !== 39 &&
						e.keyCode !== 37
					) {
						e.preventDefault();
						return;
					}
					// prevent shift key
					if (e.shiftKey === true) {
						e.preventDefault();
						return;
					}
				}
			},
			{
				selector: 'span.colorpicker-color-display',
				event: 'click',
				callback: function (e, viewObj) {
					e.stopPropagation();
					if (viewObj._showPicker) {
						viewObj.hidePicker();
					} else {
						viewObj.showPicker();
					}
				}
			},
			{
				selector: 'span.opacity-button.up',
				event: 'click',
				callback: function (e, viewObj) {
					// viewObj.showPicker();
					var opacity = viewObj.dom().find('input.opacity-input').val();
					if (Number(opacity) === 100) {
						return;
					}
					if (opacity !== '' && typeof Number(opacity) === 'number' && opacity >= 0 && opacity <= 99) {
						viewObj
							.dom()
							.find('input.opacity-input')
							.val(++opacity);
					} else {
						viewObj.dom().find('input.opacity-input').val(0);
						opacity = 0;
					}
					var ret = $.su.clone(viewObj.value);
					ret.a = Number(opacity) / 100;
					viewObj.dom().triggerHandler('ev_view_change', [
						{
							type: 'value',
							value: ret
						}
					]);
				}
			},
			{
				selector: 'span.opacity-button.down',
				event: 'click',
				callback: function (e, viewObj) {
					// viewObj.showPicker();
					var opacity = viewObj.dom().find('input.opacity-input').val();
					if (Number(opacity) === 0) {
						return;
					}
					if (opacity !== '' && typeof Number(opacity) === 'number' && opacity >= 1 && opacity <= 100) {
						viewObj
							.dom()
							.find('input.opacity-input')
							.val(--opacity);
					} else {
						viewObj.dom().find('input.opacity-input').val(100);
						opacity = 100;
					}
					var ret = $.su.clone(viewObj.value);
					ret.a = Number(opacity) / 100;
					viewObj.dom().triggerHandler('ev_view_change', [
						{
							type: 'value',
							value: ret
						}
					]);
				}
			}
		],
		init: function () {
			this._showPicker = false;
			this.value = {
				a: 1,
				b: 255,
				g: 255,
				r: 255
			};
			this.hexString = '';
			this.opacity = '';
		},
		render: function () {
			var viewObj = this;
			var _this = this.dom();
			var settings = this.settings;
			var readOnly = settings.readOnly ? 'readonly="readonly"' : '';
			var labelField = settings.labelField === false ? 'label-empty' : '';

			var inHTML = '';
			_this.addClass('colorpicker-container widget-container');

			if (settings.labelField !== null) {
				inHTML += '<div class="widget-fieldlabel-wrap ' + settings.labelCls + '">';
				inHTML += '<label class="widget-fieldlabel keywords-fieldlabel">' + settings.labelField + '</label>';
				if (settings.labelField) {
					inHTML += '<span class="widget-separator">' + settings.separator + '</span>';
				}
				inHTML += '</div>';
			}

			inHTML += '<span class="colorpicker-color-display"></span>';
			inHTML += '<div class="colorpicker-hex-container"><span class="colorpicker-hex-pre">#</span><input type="text" class="hex-input"></div>';
			inHTML +=
				'<div class="colorpicker-opacity-container"><input type="text" class="opacity-input"><span class="colorpicker-opacity-back">%</span></div>';
			inHTML += '<input type="text" class="opacity-input-old">';
			inHTML += '<div class="widget-colorpicker-wrap u-d-none">';
			inHTML += '<label class="colorpicker-fieldlabel"></label>';
			inHTML += '</div>';

			_this.append(inHTML);

			var colorDfd = $.Deferred();

			if (!$('<div>').spectrum) {
				$.su.router.loadFile('js/libs/spectrum.js').then(function () {
					colorDfd.resolve();
				});
			} else {
				colorDfd.resolve();
			}
			_this
				.find('.colorpicker-opacity-container')
				.append("<div class='text-wrap-after'><span class='opacity-button up'></span><span class='opacity-button down'></span></div>");

			colorDfd.then(function () {
				_this.find('.colorpicker-fieldlabel').spectrum({
					preferredFormat: 'hex',
					color: '#ffffff',
					flat: true,
					appendTo: _this,
					move: function (color) {
						viewObj.dom().triggerHandler('ev_view_change', [
							{
								type: 'value',
								value: color.toRgb()
							}
						]);
						_this.find('span.colorpicker-color-display').css('background-color', color.toRgbString());
						viewObj.setValue(color.toRgb());
						_this.find('input.opacity-input').val((color.toRgb().a * 100).toFixed(0));
					}
				});
				_this.find('.sp-button-container').hide();
				viewObj.hidePicker();
			});
		},
		setValue: function (value) {
			if (this.value === value || !value) {
				return;
			}
			this.value = value;
			var _this = this.dom();
			_this.find('input.hex-input').val($.su.rgbToHexString(value));
			this.hexString = $.su.rgbToHexString(value);
			if (value.a !== undefined && value.a !== null && value.a !== '') {
				_this.find('input.opacity-input').val((value.a * 100).toFixed(0));
				this.opacity = (value.a * 100).toFixed(0);
			} else {
				_this.find('input.opacity-input').val(this.opacity);
			}
			_this.find('.colorpicker-fieldlabel').spectrum('set', value);
			_this.find('span.colorpicker-color-display').css('background-color', this.toRgbString(value));
		},
		getValue: function () {
			return this.value;
		},
		reflow: function () {
			var _this = this.dom();
			_this.find('.colorpicker-fieldlabel').spectrum('reflow');
		},
		showPicker: function () {
			var _this = this.dom();
			var viewObj = this;
			_this.find('.widget-colorpicker-wrap').show();
			// _this.find(".widget-colorpicker-wrap").css("margin-top", 4);
			// _this.find(".widget-colorpicker-wrap").css("left", 210);
			_this.find('.colorpicker-fieldlabel').spectrum('reflow');

			setTimeout(function () {
				$('body').on('click', function (e) {
					var target = e.target ? e.target : e.srcElement;
					if (viewObj._showPicker && $(target).closest(viewObj.domId).length === 0) {
						viewObj.hidePicker();
						$('body').off('click');
					}
				});
			}, 0);

			this._showPicker = true;
		},
		hidePicker: function () {
			var _this = this.dom();
			_this.find('.widget-colorpicker-wrap').hide();
			this._showPicker = false;
		},
		toRgbString: function (obj) {
			return obj.a === 1
				? 'rgb(' + Math.round(obj.r) + ', ' + Math.round(obj.g) + ', ' + Math.round(obj.b) + ')'
				: 'rgba(' + Math.round(obj.r) + ', ' + Math.round(obj.g) + ', ' + Math.round(obj.b) + ', ' + obj.a + ')';
		}
	});
})(jQuery);
