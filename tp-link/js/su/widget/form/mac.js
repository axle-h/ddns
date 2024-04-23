(function ($) {
	var Mac = $.su.Widget.register('mac', {
		extend: 'textbox',
		settings: {
			connector: {
				attribute: 'connector',
				defaultValue: '-'
			}
		},
		listeners: [
			{
				selector: 'span.mac-input input',
				event: 'keypress',
				callback: function (e, viewObj) {
					switch (e.charCode) {
						case 64:
						case 33:
						case 35:
						case 36:
						case 37:
						case 94:
						case 38:
						case 42:
						case 40:
						case 41:
							e.preventDefault();
							break;
					}
				}
			},
			{
				selector: 'span.mac-input input',
				event: 'keyup',
				callback: function (e, viewObj) {
					var input = $(this);
					var index = parseInt(input.attr('data-index'), 10);
					var start = input.get(0).selectionStart;
					var end = input.get(0).selectionEnd;
					this.value = this.value.toUpperCase();
					if (e.keyCode === 37 || e.keyCode === 39 || e.keyCode === 8) return;

					if (input.val().length == 2 && start === end) {
						if (index < 5) {
							var nextInput = viewObj.dom().find('span.mac-input input[data-index=' + (index + 1) + ']');
							nextInput.focus().select();
							e.preventDefault();
							return;
						}
					}
				}
			},
			{
				selector: 'span.mac-input input',
				event: 'keydown',
				callback: function (e, viewObj) {
					var input = $(this);
					var settings = viewObj.settings;
					var index = parseInt(input.attr('data-index'), 10);
					var connectorKeycode = settings.connector === '-' ? 189 : 186;

					// tab,ctrl use default behavior.
					if (e.keyCode === 9 || e.keyCode === 17) {
						return;
					}

					// behavior of paste (ctrl+v)
					if (e.keyCode === 86 && e.ctrlKey) {
						return;
					}

					// prevent keys except number delete backspace, connector, right and left.
					if (
						!(e.keyCode >= 48 && e.keyCode <= 57) &&
						!(e.keyCode >= 96 && e.keyCode <= 105) &&
						!(e.keyCode >= 65 && e.keyCode <= 70) &&
						e.keyCode != 8 &&
						e.keyCode !== connectorKeycode &&
						e.keyCode !== 39 &&
						e.keyCode !== 37
					) {
						e.preventDefault();
						return;
					}

					// behavior of "-" or "right"
					if (e.keyCode === connectorKeycode || e.keyCode === 39) {
						if (index < 5) {
							viewObj
								.dom()
								.find('span.mac-input input[data-index=' + (index + 1) + ']')
								.focus()
								.select();
						}
						e.preventDefault();
						return;
					}

					// behaviour of "left"
					if (e.keyCode === 37) {
						if (index > 0) {
							var prevInput = viewObj.dom().find('span.mac-input input[data-index=' + (index - 1) + ']');
							prevInput.focus().select();
							e.preventDefault();
						}
						return;
					}

					// behavior of backspace
					if (e.keyCode === 8) {
						if (input.val() === '' && index > 0) {
							var prevInput = viewObj.dom().find('span.mac-input input[data-index=' + (index - 1) + ']');
							prevInput.val(prevInput.val().slice(0, -1));
							prevInput.focus();
							e.preventDefault();
							return;
						}
						return;
					}
				}
			},
			{
				selector: 'span.mac-input input',
				event: 'blur',
				callback: function (e, viewObj) {
					this.value = this.value.toUpperCase();
				}
			},
			{
				selector: 'span.mac-input input',
				event: 'paste',
				callback: function (e, viewObj) {
					e.preventDefault();
					var clp = (e.originalEvent || e).clipboardData,
						text = '';

					if (clp === undefined || clp === null) {
						// opera,ie
						text = window.clipboardData.getData('text') || '';
					} else {
						text = clp.getData('text/plain') || '';
					}

					text = text.trim();

					var regex = /^[a-fA-F\d]{2}\-[a-fA-F\d]{2}\-[a-fA-F\d]{2}\-[a-fA-F\d]{2}\-[a-fA-F\d]{2}\-[a-fA-F\d]{2}$/;
					var patternMulti = /^\s*[0-9A-Fa-f]{1}[13579bdfBDF]{1}(\-[A-Fa-f0-9]{2}){5}\s*$/;
					var patternZero = /^(0{1,2}-){5}0{1,2}$/;

					if (regex.test(text) && !patternMulti.test(text) && !patternZero.test(text)) {
						viewObj.setValue(text);
					}
				}
			}
		],

		init: function () {},

		render: function () {
			var inHtml = '';
			var _this = this.dom();
			var connector = this.settings.connector;

			Mac.superclass.render.call(this);
			_this.addClass('mac-container');

			inHtml += '<span class="mac-input first"><input type="text" maxlength="2" data-index="0" /></span>';
			inHtml += '<span class="mac-dot">' + connector + '</span>';
			inHtml += '<span class="mac-input"><input type="text" maxlength="2" data-index="1" /></span>';
			inHtml += '<span class="mac-dot">' + connector + '</span>';
			inHtml += '<span class="mac-input"><input type="text" maxlength="2" data-index="2" /></span>';
			inHtml += '<span class="mac-dot">' + connector + '</span>';
			inHtml += '<span class="mac-input last"><input type="text" maxlength="2" data-index="3" /></span>';
			inHtml += '<span class="mac-dot">' + connector + '</span>';
			inHtml += '<span class="mac-input last"><input type="text" maxlength="2" data-index="4" /></span>';
			inHtml += '<span class="mac-dot">' + connector + '</span>';
			inHtml += '<span class="mac-input last"><input type="text" maxlength="2" data-index="5" /></span>';

			_this.find('.text-wrap-inner').html(inHtml);
		},

		getValue: function () {
			var vals = Mac.superclass.getValue.call(this);
			if (vals.join('') === '') {
				return '';
			}
			return vals.join(this.settings.connector);
		},

		setValue: function (val) {
			if (val == null) {
				val = '';
			} else if ($.type(val) !== 'string') {
				return;
			}
			var inputs = this.dom().find('span.mac-input input');
			var vals = val.split(this.settings.connector);

			inputs.each(function (i, v) {
				$(v).val(vals[i]);
			});
		},

		setMaxLength: function () {
			return false;
		}
	});
})(jQuery);
