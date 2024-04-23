(function () {
	var Tether = $.su.Widget.register('tether', {
		settings: {
			title: {
				attribute: 'title-text',
				defaultValue: ''
			},
			instruction: {
				attribute: 'instruction',
				defaultValue: ''
			},
			linkText: {
				attribute: 'link-text',
				defaultValue: ''
			},
			qrLink: {
				// qr code 对应链接
				attribute: 'qr-link',
				defaultValue: ''
			}
		},
		listeners: [{}],
		init: function () {},
		render: function () {
			var _this = this.dom();
			var infoCls = this.settings.title ? '' : ' tether-info-empty';
			_this.addClass('tether-container' + infoCls);

			var inHTML = '';
			var customInstruction = _this.find('.function-instruction')[0];

			inHTML += '<div class="tether-wrapper tether-info">';
			inHTML += '<h2 class="tether-title">' + this.settings.title + '</h2>';
			if (this.settings.instruction || customInstruction) {
				inHTML += '<p class="tether-instruction">' + this.settings.instruction + '</p>';
			}
			if (this.settings.linkText) {
				inHTML += '<a class="tether-linked" href="https://www.tp-link.com/tether" target="_blank">' + this.settings.linkText + '</a>';
			}
			inHTML += '</div>';

			inHTML += '<div class="tether-wrapper tether-store">';
			inHTML += '<div class="store-field">';
			inHTML += '<div class="display-flex">';
			inHTML += '<div class="store-wrapper">';
			inHTML += '<a class="apple-store" href="https://itunes.apple.com/us/app/tp-link-tether/id599496594?ls=1&mt=8" target="_blank"></a>';
			inHTML += '<a class="google-play" href="https://play.google.com/store/apps/details?id=com.tplink.tether" target="_blank"></a>';
			inHTML += '</div>';
			inHTML += '<div class="logo-wrapper"><span class="tether-logo"></div>';
			inHTML += '</div>';
			inHTML += '</div>';

			inHTML += '<div class="qr-code-field">';
			if (this.settings.qrLink) {
				inHTML += '<div class="qr-code-wrapper" widget="qrCode" qr-text="' + this.settings.qrLink + '" icon-class="tether-icon"></div>';
			} else {
				inHTML += '<div class="qr-code-wrapper">';
				inHTML += '<span class="qr-code-picture"></span>';
				inHTML += '</div>';
			}
			inHTML += '</div>';
			inHTML += '</div>';

			_this.empty().append(inHTML);

			if (customInstruction) {
				_this.find('.tether-instruction').html(customInstruction);
			}

			var qrCode = _this.find('[widget="qrCode"]');
			new $.su.widgets.qrCode({ id: $(qrCode) }).render();
		}
	});
})(jQuery);
