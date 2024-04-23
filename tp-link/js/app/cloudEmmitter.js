(function ($) {
	$.su = $.su || {};
	$.su.CloudEmmitter = (function () {
		var defaults = {};
		var _origin = undefined;
		var _token = undefined;
		var _timer = false;
		var MAX_TIMES = 3;
		var CloudEmmitter = function (options) {
			if (typeof CloudEmmitter.instance === 'object') {
				return CloudEmmitter.instance;
			}

			this.name = 'cloudEmmitter';
			$.su.Service.call(this);
			this.service = options.service;

			CloudEmmitter.instance = this;
		};

		$.su.inherit($.su.Service, CloudEmmitter);

		CloudEmmitter.prototype.init = function (options) {
			this.settings = $.extend({}, defaults, options);
			_loadCloudPage.call(this);
			_offWindowEvents();
			_onWindowEvents.call(this);
			_onDefaultEvents.call(this);
		};

		CloudEmmitter.prototype.off = function () {
			_offWindowEvents();
			this.clearListeners();
		};

		CloudEmmitter.prototype.postMessage = function (eventName, msg) {
			if (!_origin) {
				return;
			}
			var params = {};
			params.eType = eventName;
			$.extend(params, msg || {});
			params = JSON.stringify(params);
			window.frames[this.settings.name] && window.frames[this.settings.name].postMessage(params, _origin);
		};

		CloudEmmitter.prototype.getOrigin = function () {
			return _origin;
		};

		var _onReceive = function (eObject) {
			var e = eObject.originalEvent || eObject;
			if (e.origin !== _origin && e.origin !== '_self' && e.origin != undefined) {
				return;
			}
			var data = e.data;
			if (typeof data == 'string') {
				data = $.parseJSON(data);
			}
			if (!data.eType) {
				return;
			}
			this.trigger(data.eType, [data]);
		};

		var _onWindowEvents = function () {
			var self = this;
			var loadFailCallback = self.settings.loadFailCallback;

			$(window).on('ev_waitingTimeout', function () {
				!!loadFailCallback && loadFailCallback();
			});

			$(window).on('ev_iframe_resize', function (e, size) {
				self.postMessage('ev_iframe_resize', { size: size });
			});

			$(window).on('message', _onReceive.bind(this));
		};

		var _offWindowEvents = function () {
			$(window).off('ev_waitingTimeout');
			$(window).off('ev_iframe_resize');
			$(window).off('message');
		};

		var _onDefaultEvents = function () {
			this.on('load', _onCloudLoad.bind(this));
			this.on('ev_cloud_error', _onShowError.bind(this));
			this.on('ev_cloud_notice', _onShowNotice.bind(this));
			// this.on("ev_cloud_msg", _onShowMsg.bind(this));
			this.on('ev_cloud_resize', _onCloudResize.bind(this));
			this.on('ev_mouseWheel', _onCloudMouseWheel.bind(this));
			this.on('ev_cloud_link', _onCloudLinkVisit.bind(this));
			this.on('ev_cloud_logout', _onCloudLogout.bind(this));
		};

		var _loadCloudPage = function () {
			var mode = this.settings.mode;
			switch (mode) {
				case 'login':
					_loadLoginPage.call(this);
					break;
				default:
					_loadTokenPage.call(this);
			}
		};

		var _loadLoginPage = function () {
			if (_origin) {
				_setIframeSrc.call(this);
			} else {
				_getCloudOrigin.call(this);
			}
		};

		var _loadTokenPage = function () {
			if ($.su.userInfo.token && _token) {
				_setIframeSrc.call(this);
			} else {
				_getCloudOrigin.call(this, true, 0);
			}
		};

		var _getCloudOrigin = function (withToken, tryTime) {
			var self = this;
			var proxyName = withToken ? 'tokenProxyIndex' : 'tokenProxyLogin';
			this.service.ajax.request({
				proxy: proxyName,
				method: 'read',
				success: function (data) {
					if (withToken && !data.token && ++tryTime < MAX_TIMES) {
						_getCloudOrigin.call(self, withToken, tryTime);
						return;
					}
					if ((!data.token && withToken) || !data.origin_url) {
						$(window).trigger('ev_waitingTimeout');
						return;
					}
					_origin = data.origin_url;
					_token = data.token;
					_setIframeSrc.call(self);
				},
				fail: function () {
					$(window).trigger('ev_waitingTimeout');
				},
				error: function () {
					$(window).trigger('ev_waitingTimeout');
				}
			});
		};

		var _setIframeSrc = function () {
			var t = new Date();
			var url = _origin + '/cloud_ui_v3/index.html?t=' + t.getTime();
			// var url = _origin;
			$('iframe[name=' + this.settings.name + ']').attr('src', url);
			_setWaitingEvent('ev_waitingTimeout');
		};

		var _setWaitingEvent = function (eventName, scope, time) {
			_timer = false;
			time = time || 20 * 1000;
			scope = scope || window;
			scope = scope.jquery ? scope : $(scope);
			_timer = setTimeout(function () {
				scope.trigger(eventName);
			}, time);
			return true;
		};

		var _clearWaitingEvent = function () {
			if (_timer) {
				clearTimeout(_timer);
				_timer = false;
			}
		};

		var _onCloudLoad = function (e, data) {
			var device = this.service.device;
			var params = {};
			params.mode = this.settings.mode;
			params.deviceInfo = {
				themes: GLOBAL_STYLE,
				locale: device.getCloudLocale(),
				force: device.getForce(),
				model: device.getProductName(),
				token: _token,
				configs: {
					supportRgSec: $.su.IS_RG_SEC,
					cloudTetherFunc: device.getConfig().cloudTetherFunc
				}
			};
			if ($.su.userInfo && $.su.userInfo.token) {
				params.userInfo = $.su.userInfo;
			}
			params.size = $.su.widgetSize;
			this.postMessage('ev_init', params);

			_clearWaitingEvent();
			var loadSuccessCallback = this.settings.loadSuccessCallback;
			!!loadSuccessCallback && loadSuccessCallback();
		};

		var _onShowError = function (e, data) {
			$.su.moduleManager.query('main').showError(data.msg);
		};

		var _onShowNotice = function (e, data) {
			$.su.moduleManager.query('main').showNotice(data.text, data.type);
		};

		var _onCloudMouseWheel = function (e, data) {
			var mode = this.settings.mode;
			var scrollTop, dom;
			switch (mode) {
				case 'adv':
					dom = $('.page-content');
					break;
				case 'qs':
					dom = $('.page-content-container');
					break;
				case 'basic':
					dom = $('#basic-cloud-frame-field');
					break;
				case 'login':
					dom = $('#login-card');
					break;
			}

			if (!dom) {
				return;
			}

			var scrollTop = dom.scrollTop();
			dom.scrollTop(scrollTop - data.delta);
		};

		var _onCloudLinkVisit = function (e, data) {
			if (!data.url) {
				return;
			}
			window.open(data.url);
		};

		var _onCloudLogout = function (e, data) {
			localStorage.setItem('userInfo', '');
			$.su.userInfo = {};
			var indexModule = $.su.moduleManager.get('index');
			!!indexModule && indexModule.changeTPLinkID($.su.CHAR.INDEX.TPLINK_ID);
		};

		var _onCloudResize = function (e, data) {
			$('.iframe-container').css('min-height', 'auto');
			_setFrameSize(this.settings.mode, data.height);
		};

		var _setFrameSize = function (mode, ifmHeight) {
			ifmHeight = ifmHeight || 1;
			var width = 1,
				height = 1,
				delta;
			switch (mode) {
				case 'adv':
					width = $('.page-content.module-tpLinkCloud').width();
					height = $('.page-content.module-tpLinkCloud').height() - $('.cloud-frame-container .panel-header').outerHeight(true) - 30;
					height = Math.max(height, ifmHeight);
					break;
				case 'qs':
					width = $('.qs-cloud-container .cloud-frame-field').width();
					height = ifmHeight;
					break;
				case 'login':
					width = $('#login-card .panel-content').width();
					height = ifmHeight;
					break;
				case 'basic':
					width = $('.cloud-frame-msg').width();
					height = ifmHeight;
					// basic cloud login
					if (!$.su.userInfo.token) {
						height += $.su.widgetSize != 's' ? -70 : 180;
					}
					break;
			}
			var aspectRatio = ((height / width) * 100).toFixed(2);
			$('.iframe-container').css('padding-top', aspectRatio + '%');
		};

		return CloudEmmitter;
	})();
})(jQuery);
