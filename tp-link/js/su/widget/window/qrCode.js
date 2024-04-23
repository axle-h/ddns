// 不能用在 tooltip 组件内，无法正常渲染
(function () {
	var qrCode = $.su.Widget.register('qrCode', {
		settings: {
			qrText: {
				attribute: 'qr-text',
				defaultValue: ''
			},
			iconClass: {
				// 设置 icon class 以设置中心 icon
				attribute: 'icon-class',
				defaultValue: ''
			},
			showBorder: {
				attribute: 'show-border',
				defaultValue: true
			}
		},
		render: function () {
			var dom = this.dom();
			var innerHtml = '<span class="qr-code-picture"></span>';

			dom.empty().append(innerHtml);

			if (this.settings.qrText) {
				this.generateQRCode({ text: this.settings.qrText });
			}

			if (this.settings.iconClass) {
				var iconClass = this.settings.iconClass;
				this.insertCenterIcon(iconClass);
			}
			if (this.settings.showBorder) {
				dom.addClass('show-border');
			}
		},
		generateQRCode: function (options) {
			var _canvasSupport = this._canvasSupport();

			var qrCodeWrapper = this.dom().find('.qr-code-picture');
			var options = $.extend(
				{
					width: this._getSize().width * 3, // 生成三倍图以增强清晰度
					height: this._getSize().height * 3,
					render: _canvasSupport ? 'canvas' : 'table',
					correctLevel: 0, // L:1, M:0, Q:3, H:2
					foreground: '#000000'
				},
				options
			);
			qrCodeWrapper.addClass('generated');
			qrCodeWrapper.empty().qrcode(options);
		},
		insertCenterIcon: function (iconClass) {
			var qrCodeWrapper = this.dom().find('.qr-code-picture');
			var innerHtml = '<div class="center-icon ' + iconClass + '"></div>';
			qrCodeWrapper.append(innerHtml);
		},
		_getSize: function () {
			var qrCodeWrapper = this.dom().find('.qr-code-picture');
			var width = qrCodeWrapper.innerWidth();
			var height = qrCodeWrapper.innerHeight();

			return {
				width: width,
				height: height
			};
		},
		_canvasSupport: function () {
			var support = true;
			var canvas = $('<canvas width="0" height="0" style="display: none;"></canvas>').appendTo($('body'));
			try {
				canvas[0].getContext('2d');
				support = true;
			} catch (e) {
				support = false;
			}
			canvas.remove();
			return support;
		}
	});
})();
