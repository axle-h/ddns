(function ($) {
	var supportInfo = {
		_canvasSupport: (function () {
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
		})(),
		_blobSupport: (function () {
			var support = false;
			try {
				new Blob();
				support = true;
			} catch (e) {
				support = false;
			}
			return support;
		})(),
		_browserSupport: (function () {
			var ua = navigator.userAgent;
			var regMobile = /AppleWebKit.*Mobile.*/i;
			if (!regMobile.test(ua)) {
				return true;
			}
			if (
				/chrome\/(\d|\.)+\s+(mobile\s+)?Safari\/(\d|\.)+$/i.test(ua) || //chrome
				/firefox/i.test(ua) || //firefox
				/YaBrowser/i.test(ua) || //Yandex
				/(OPR|opera)/i.test(ua) || //opera
				(!/chrome/i.test(ua) && /safari/i.test(ua)) //safari /(?<!chrome.*)safari/i
			) {
				return true;
			}
			return false;
		})()
	};
	var Wifisharing = $.su.Widget.register('wifisharing', {
		settings: {
			sharingText: {
				attribute: 'sharing-text',
				defaultValue: ''
			},
			zIndex: {
				attribute: 'z-index',
				defaultValue: 10
			},
			onlyShowQrcode: {
				attribute: 'only-show-qrcode',
				defaultValue: 0
			},
			qrcodeText: {
				attribute: 'qrcode-text',
				defaultValue: ''
			}
		},
		listeners: [
			{
				selector: '.wifisharing-sharing-btn-container .wifisharing-sharing-btn',
				event: 'click',
				callback: function (e, viewObj) {
					viewObj.showContent();
				}
			},
			{
				selector: '.wifisharing-save-btn-container',
				event: 'click',
				callback: function (e, viewObj) {
					if (viewObj._enable.qrcode || viewObj._enable.text) {
						viewObj.saveImage();
					}
				}
			},
			{
				selector: '.wifisharing-qrcode-checkbox-container',
				event: 'click',
				callback: function (e, viewObj) {
					var widgetQrcodeCheckbox = viewObj.dom().find('.wifisharing-qrcode-checkbox-container').data('viewObj');
					if (viewObj._enable.qrcode) {
						widgetQrcodeCheckbox.setValue(false);
						viewObj.disableQrcode();
					} else {
						widgetQrcodeCheckbox.setValue(true);
						viewObj.enableQrcode();
					}
				}
			},
			{
				selector: '.wifisharing-text-checkbox-container',
				event: 'click',
				callback: function (e, viewObj) {
					var widgetTextCheckbox = viewObj.dom().find('.wifisharing-text-checkbox-container').data('viewObj');
					if (viewObj._enable.text) {
						widgetTextCheckbox.setValue(false);
						viewObj.disableText();
					} else {
						widgetTextCheckbox.setValue(true);
						viewObj.enableText();
					}
				}
			}
		],
		init: function (options) {
			this._data = {
				ssid: '',
				password: '',
				security: ''
			};
			this._enable = {
				qrcode: true,
				text: true
			};
			this._canvasSupport = supportInfo._canvasSupport;
			this._blobSupport = supportInfo._blobSupport;
			this._browserSupport = supportInfo._browserSupport;
		},

		render: function () {
			var viewObj = this;
			var dom = this.dom();
			var settings = this.settings;

			dom.addClass('container widget-container wifisharing-container');

			var inHTML = '';
			inHTML += '<div class="wifisharing-wrap">';
			inHTML += '<div class="wifisharing-sharing-btn-container">';
			inHTML += '<a class="wifisharing-sharing-btn">' + viewObj.settings.sharingText + '</a>';
			inHTML += '</div>';
			inHTML += '<div class="wifisharing-main-container">';
			inHTML += '<div class="wifisharing-main-outer">';
			inHTML += '<div class="wifisharing-delta-container">';
			inHTML += '<span class="icon-delta"></span>';
			inHTML += '</div>';
			inHTML += '<div class="wifisharing-main-wrap">';
			inHTML += '<div class="wifisharing-content">';
			inHTML += '<div class="wifisharing-qrcode-container">';
			inHTML += '<div class="wifisharing-qrcode-wrap"></div>';
			inHTML += '<div class="wifisharing-checkbox-container wifisharing-qrcode-checkbox-container"></div>';
			inHTML += '</div>';
			inHTML += '<div class="wifisharing-text-container">';
			inHTML += '<div class="wifisharing-text-wrap">';
			inHTML += '<div class="ssid-displaylabel-container reset" widget="displaylabel" label-field="' + $.su.CHAR.WIFI_SHARING.SSID + '"></div>';
			inHTML += '<div class="wifisharing-password-container">';
			inHTML +=
				'<div class="password-displaylabel-container reset" widget="displaylabel" label-field="' + $.su.CHAR.WIFI_SHARING.PASSWORD + '"></div>';
			inHTML += '<div class="wifisharing-no-password-content hidden">';
			inHTML += '<p class="wifisharing-no-password-text">' + $.su.CHAR.WIFI_SHARING.NO_PASSWORD + '</p>';
			inHTML += '</div>';
			inHTML += '</div>';
			inHTML += '</div>';
			inHTML += '<div class="security-displaylabel-container reset hidden" widget="displaylabel"></div>';
			inHTML += '<div class="wifisharing-checkbox-container wifisharing-text-checkbox-container"></div>';
			inHTML += '</div>';
			inHTML += '</div>';
			if (this._blobSupport && this._browserSupport) {
				inHTML += '<div class="wifisharing-save-btn-container">';
				inHTML += '<a class="wifisharing-save-btn">' + $.su.CHAR.WIFI_SHARING.SAVE_PICTURE + '</a>';
				inHTML += '</div>';
			}
			inHTML += '</div>';
			inHTML += '</div>';
			inHTML += '</div>';
			inHTML += '</div>';

			if (viewObj.settings.onlyShowQrcode) {
				inHTML = '<div class="wifisharing-qrcode-wrap"></div>';
				inHTML += '<div class="wifisharing-qrcode-text">' + viewObj.settings.qrcodeText + '</div>';
			}

			dom.append($(inHTML)).css({
				'z-index': parseInt(settings.zIndex)
			});

			var widgetSsid = new $.su.widgets.displaylabel({
				id: dom.find('.ssid-displaylabel-container')
			});
			var widgetPassword = new $.su.widgets.displaylabel({
				id: dom.find('.password-displaylabel-container')
			});

			widgetSsid.render();
			widgetPassword.render();

			_renderCheckbox();

			function _renderCheckbox() {
				if (viewObj.settings.onlyShowQrcode) {
					return;
				}

				var widgetQrcodeCheckbox = new $.su.widgets.checkbox({
					id: dom.find('.wifisharing-qrcode-checkbox-container')
				});
				var widgetTextCheckbox = new $.su.widgets.checkbox({
					id: dom.find('.wifisharing-text-checkbox-container')
				});
				widgetQrcodeCheckbox.render();
				widgetTextCheckbox.render();
				widgetQrcodeCheckbox.setValue(true);
				widgetTextCheckbox.setValue(true);
				viewObj.enableQrcode();
				viewObj.enableText();
			}
		},
		generateQRCodeText: function (data) {
			// Special characters "\", ";", "," and ":" should be escaped with a backslash ("\")
			var encode = function (str) {
				if (str) {
					return str.replace(/([\\\,\"\;\:])/g, '\\$1');
				} else {
					return str;
				}
			};
			data = $.extend(
				{
					ssid: '',
					password: '',
					security: ''
				},
				data
			);
			var str = '';
			var securityStr;
			switch (data.security.toLowerCase()) {
				case 'wpa':
				case 'wpa2':
				case 'psk':
				case $.su.securityCode.psk_aes:
				case $.su.securityCode.psk_aes_tkip:
				case $.su.securityCode.psk_sae_personal_aes:
				case $.su.securityCode.wpa_enterprise:
				case $.su.securityCode.wpa_enterprise_tkip:
					securityStr = 'WPA';
					break;
				case $.su.securityCode.psk_sae_personal:
					securityStr = 'SAE';
					break;
				case 'psk_sae':
					if (data.pskVersion == 'sae_only') {
						securityStr = 'SAE';
					} else {
						securityStr = 'WPA';
					}
					break;
				case 'wep':
					securityStr = 'WEP';
					break;
				default:
					securityStr = 'nopass';
					break;
			}
			str += 'WIFI:S:';
			str += encode(data.ssid) + ';';
			str += 'T:';
			str += securityStr + ';';
			str += 'P:';
			str += encode(data.password) + ';';
			return str;
		},
		generateQRCode: function (options) {
			var utf16to8 = function (str) {
				var out, i, len, c;
				out = '';
				len = str.length;
				for (i = 0; i < len; i++) {
					c = str.charCodeAt(i);
					if (c >= 0x0001 && c <= 0x007f) {
						out += str.charAt(i);
					} else if (c > 0x07ff) {
						out += String.fromCharCode(0xe0 | ((c >> 12) & 0x0f));
						out += String.fromCharCode(0x80 | ((c >> 6) & 0x3f));
						out += String.fromCharCode(0x80 | ((c >> 0) & 0x3f));
					} else {
						out += String.fromCharCode(0xc0 | ((c >> 6) & 0x1f));
						out += String.fromCharCode(0x80 | ((c >> 0) & 0x3f));
					}
				}
				return out;
			};
			var str = this.generateQRCodeText(this._data);
			var qrcodeWarp = this.dom().find('.wifisharing-qrcode-wrap');
			options = $.extend(
				{
					width: qrcodeWarp.innerWidth() || 84,
					height: qrcodeWarp.innerHeight() || 84,
					render: this._canvasSupport ? 'canvas' : 'table',
					correctLevel: 1, // L:1, M:0, Q:3, H:2
					foreground: '#000000',
					text: utf16to8(str)
				},
				options
			);
			qrcodeWarp.empty().qrcode(options);
		},
		setValue: function (data) {
			var viewObj = this;
			var dom = viewObj.dom();
			if (!!data && (!data.security || data.security == 'none' || data.security == $.su.securityCode.no_security)) {
				data.password = '';
			}
			$.extend(viewObj._data, data);

			if (!viewObj.settings.onlyShowQrcode) {
				dom.find('.ssid-displaylabel-container').data('viewObj').setValue(viewObj._data.ssid);
				dom.find('.password-displaylabel-container').data('viewObj').setValue(viewObj._data.password);
				if (viewObj._data.password.length > 0) {
					dom.find('.password-displaylabel-container').data('viewObj').show();
					dom.find('.wifisharing-no-password-content').addClass('hidden');
				} else {
					dom.find('.password-displaylabel-container').data('viewObj').hide();
					dom.find('.wifisharing-no-password-content').removeClass('hidden');
				}
			}

			viewObj.generateQRCode();
		},
		showContent: function () {
			var viewObj = this;
			var container = viewObj.dom().find('.wifisharing-main-container');
			if (container.filter(':animated').length > 0) {
				return;
			}
			container.slideDown(150, function () {
				// 委托click事件
				$('html')
					.off('.wifisharing')
					.on('click.wifisharing', 'div', function (e) {
						e.stopPropagation();
						if (container.find(this).length === 0 || container.is(this)) {
							viewObj.hideContent();
							$('html').off('.wifisharing');
						}
					});
				// 绑定scroll事件
				var divs = $('div').not(container);
				divs.off('scroll.wifisharing').on('scroll.wifisharing', function () {
					viewObj.hideContent();
					divs.off('scroll.wifisharing').off('scroll.wifisharing');
				});
			});
		},
		hideContent: function () {
			var viewObj = this;
			var container = viewObj.dom().find('.wifisharing-main-container');
			if (container.filter(':animated').length > 0) {
				return;
			}
			container.slideUp(150);
		},
		enableQrcode: function () {
			var viewObj = this;
			var qrcodeContainer = viewObj.dom().find('.wifisharing-qrcode-container');
			qrcodeContainer.removeClass('disabled');
			viewObj._enable.qrcode = true;
			viewObj.generateQRCode({
				foreground: '#000000'
			});
			viewObj.refreshStatus();
		},
		disableQrcode: function () {
			var viewObj = this;
			var qrcodeContainer = viewObj.dom().find('.wifisharing-qrcode-container');
			qrcodeContainer.addClass('disabled');
			viewObj._enable.qrcode = false;
			viewObj.generateQRCode({
				foreground: '#676666'
			});
			viewObj.refreshStatus();
		},
		enableText: function () {
			var viewObj = this;
			var textContainer = viewObj.dom().find('.wifisharing-text-container');
			textContainer.removeClass('disabled');
			viewObj._enable.text = true;
			viewObj.refreshStatus();
		},
		disableText: function () {
			var viewObj = this;
			var textContainer = viewObj.dom().find('.wifisharing-text-container');
			textContainer.addClass('disabled');
			viewObj._enable.text = false;
			viewObj.refreshStatus();
		},
		enableSaveBtn: function () {
			var viewObj = this;
			viewObj.dom().find('.wifisharing-save-btn-container').removeClass('disabled');
		},
		disableSaveBtn: function () {
			var viewObj = this;
			viewObj.dom().find('.wifisharing-save-btn-container').addClass('disabled');
		},
		refreshStatus: function () {
			var viewObj = this;
			var _enable = viewObj._enable;
			if (_enable.qrcode || _enable.text) {
				viewObj.enableSaveBtn();
			} else {
				viewObj.disableSaveBtn();
			}
		},
		saveImage: function () {
			// 1. clone dom保持样式
			// 2. 调整样式
			// 3. 生成canvas
			// 4. 删除clone的dom
			// 5. 保存图片文件
			var viewObj = this;
			var fileName = 'qrcode.png';
			var dom = viewObj.dom();
			var imgContainer;
			if (!this._canvasSupport || !this._blobSupport || !this._browserSupport) {
				return false;
			}
			var cloneDom = function (dom) {
				var ret = dom.clone(false);
				ret.find('canvas')[0].getContext('2d').drawImage(dom.find('canvas')[0], 0, 0);
				ret.css({
					position: 'absolute',
					bottom: 0,
					opacity: 0
				});
				return ret;
			};
			var clone = cloneDom(dom).removeClass('popup').addClass('download').prependTo('body');
			clone.find('.wifisharing-checkbox-container').remove();
			if (viewObj._enable.qrcode && viewObj._enable.text) {
				imgContainer = clone.find('.wifisharing-content');
			} else if (viewObj._enable.qrcode && !viewObj._enable.text) {
				imgContainer = clone.find('.wifisharing-qrcode-wrap');
			} else if (!viewObj._enable.qrcode && viewObj._enable.text) {
				imgContainer = clone.find('.wifisharing-text-wrap');
			} else {
				return false;
			}

			// 添加内容的外边框
			imgContainer.css({
				'background-color': clone.find('.wifisharing-main-wrap').css('background-color'),
				border: '1px solid ' + clone.find('.wifisharing-main-wrap').css('border-top-color'),
				'border-radius': '5px',
				width: imgContainer.width(),
				height: imgContainer.height(),
				margin: '0 auto',
				padding: '18px',
				'box-sizing': 'content-box',
				'text-align': imgContainer.css('text-align')
			});

			var getWrapCanvas = function (canvas, options) {
				options = $.extend(
					{
						width: 300,
						height: 300
					},
					options
				);
				var newCanvas = document.createElement('canvas');
				newCanvas.width = options.width;
				newCanvas.height = Math.max(imgContainer.outerHeight(), options.height);
				newCanvas.getContext('2d').drawImage(canvas, (newCanvas.width - canvas.width) / 2, (newCanvas.height - canvas.height) / 2);
				return newCanvas;
			};
			var downloadFile = function (blob, fileName) {
				if (navigator.msSaveBlob) {
					navigator.msSaveBlob(blob, fileName);
				} else {
					var link = document.createElement('a');
					var href = window.URL.createObjectURL(blob);
					link.href = href;
					link.download = fileName;
					document.body.appendChild(link); // firefox需要添加到dom才能click
					link.click();
					setTimeout(function () {
						// 延时保证下载成功执行
						window.URL.revokeObjectURL(href);
						document.body.removeChild(link);
					}, 100);
				}
			};
			var callback = function (canvas) {
				var base64Text = getWrapCanvas(canvas, {
					width: 300,
					height: 300
				}).toDataURL('image/png');
				var blob = viewObj._getBlob(base64Text);
				clone.remove();
				downloadFile(blob, fileName);
			};
			html2canvas(imgContainer[0], {
				letterRendering: true,
				onrendered: callback
			});
		},
		/**
		 * 获取Blob
		 * @param {stirng} base64
		 */
		_getBlob: function (base64) {
			// 获取base64中的数据
			var getData = function (base64) {
				return base64.substr(base64.indexOf('base64,') + 7, base64.length);
			};
			// 获取文件类型
			var getContentType = function (base64) {
				return /data:([^;]*);/i.exec(base64)[1];
			};
			// base64转Blob
			var b64toBlob = function (b64Data, contentType, sliceSize) {
				contentType = contentType || '';
				sliceSize = sliceSize || 512;
				var byteCharacters = atob(b64Data);
				var byteArrays = [];
				for (var offset = 0; offset < byteCharacters.length; offset += sliceSize) {
					var slice = byteCharacters.slice(offset, offset + sliceSize);
					var byteNumbers = new Array(slice.length);
					for (var i = 0; i < slice.length; i++) {
						byteNumbers[i] = slice.charCodeAt(i);
					}
					var byteArray = new Uint8Array(byteNumbers);
					byteArrays.push(byteArray);
				}
				var blob = new Blob(byteArrays, { type: contentType });
				return blob;
			};
			return b64toBlob(getData(base64), getContentType(base64));
		},
		show: function () {
			this.dom().removeClass('hidden');
		},
		hide: function () {
			this.dom().addClass('hidden');
		}
	});
})(jQuery);
