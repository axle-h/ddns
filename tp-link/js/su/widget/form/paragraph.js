(function () {
	var Paragraph = $.su.Widget.register('paragraph', {
		settings: {
			text: {
				attribute: 'text',
				defaultValue: ''
			}
		},
		init: function () {},
		render: function () {
			var _this = this.dom();
			var settings = this.settings;
			var labelField = settings.labelField ? '' : 'label-empty';

			_this.addClass(settings.cls + ' ' + labelField + ' paragraph-container');

			var inHTML = '';

			if (settings.labelField) {
				inHTML += '<div class="widget-fieldlabel-wrap ' + settings.labelCls + (/\S/.test(settings.labelField) == false ? ' empty' : '') + '">';
				inHTML += '<label class="widget-fieldlabel text-fieldlabel">' + settings.labelField + '</label>';
				if (settings.labelField) {
					inHTML += '<span class="widget-separator">' + settings.separator + '</span>';
				}
				inHTML += '</div>';
			}

			inHTML += '<div class="widget-wrap-outer paragraph-wrap-outer">';
			inHTML += settings.text;
			inHTML += '</div>';

			_this.html(inHTML);
		},
		setText: function (text) {
			var settings = this.settings;
			var container = this.getContainer();
			var btnText = container.find('div.paragraph-wrap-outer');

			if (text !== undefined && text !== null) {
				settings.text = text;
				btnText.html(text);
			}
		},
		getText: function () {
			var container = this.getContainer();
			var text = container.find('div.paragraph-wrap-outer').text();
			return text;
		},
		setStatus: function (status, text) {
			var container = this.getContainer();
			container.removeClass('error link correct');
			container.addClass(status);
			this.setText(text);
		},
		setHtml: function (html) {
			this.dom().find('div.paragraph-wrap-outer').html(html);
		},
		hide: function () {
			this.dom().css('display', 'none');
		},
		show: function () {
			this.dom().css('display', 'block');
		},
		textAnimate: function (flag) {
			var me = this;
			if (flag !== false) {
				clearInterval(this.underTextTimer);
				this.underTextTimer = setInterval(function () {
					if (!me.dom().is(':visible')) {
						clearInterval(me.underTextTimer);
						return;
					}
					var text = me.getText();
					if (/\.\.\.$/.test(text)) {
						text = text.replace(/\.\.\.$/, '');
					} else {
						text += '.';
					}
					me.setText(text);
				}, 500);
			} else {
				clearInterval(this.underTextTimer);
			}
		}
	});
})();
