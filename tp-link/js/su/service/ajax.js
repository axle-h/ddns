/* eslint-disable no-console */
(function ($) {
	$.su = $.su || {};

	//service
	$.su.Ajax = (function () {
		var defaults = {
			url: null,
			ajax: {
				// <subuild name=supportLowerCpuUsage_exclude>
				timeout: 15 * 1000,
				// </subuild>
				contentType: 'application/x-www-form-urlencoded',
				type: 'POST'
			},
			root: null,
			params: {}
		};

		var Ajax = function (options) {
			if (typeof Ajax.instance === 'object') {
				return Ajax.instance;
			}
			$.extend(true, defaults.ajax, options.ajax);

			this.failHandler = options.failHandler;
			this.errorHandler = options.errorHandler;
			this.name = 'ajax';
			this.proxyMap = {};
			$.su.Service.call(this);

			Ajax.instance = this;
		};

		$.su.inherit($.su.Service, Ajax);

		Ajax.prototype.requestPromise = function (option) {
			var dfd = $.Deferred();

			var successCallback = function (data) {
				dfd.resolve(data);
			};
			var failCallback = function (data, errorCode) {
				dfd.reject(errorCode);
			};
			option.success = successCallback;
			option.error = failCallback;
			option.fail = failCallback;

			this.request(option);
			return dfd.promise();
		};

		Ajax.prototype.request = function (option) {
			// var dataAndCallback = {
			//     url: option.url,
			// 	ajax: option.ajax,
			//     data: option.data,
			//     success: option.success,
			//     fail: option.fail,
			//     error: option.error
			// };
			var me = this;
			var dataAndCallback = {};
			if (option.url) {
				dataAndCallback.url = option.url;
				$.su.debug.log('can not use url:' + option.url + ' in services ajax');
			}

			if (option.isLogin) {
				dataAndCallback.isLogin = option.isLogin;
			}

			dataAndCallback.ajax = $.extend(true, {}, defaults.ajax, option.ajax); //custom proxy has not completely ajax setting

			if (option.data) {
				dataAndCallback.data = option.data;
			}

			if (option.success) {
				dataAndCallback.success = option.success;
			}

			if (option.fail) {
				dataAndCallback.fail = option.fail;
			}

			if (option.error) {
				dataAndCallback.error = option.error;
			}

			if (this.failHandler) {
				dataAndCallback.fail = this.failHandler(option.fail);
			}
			if (this.errorHandler) {
				dataAndCallback.error = this.errorHandler(option.error, option.preventDefaultError);
			}
			if (option.params) {
				dataAndCallback.params = option.params;
				delete option.params;
			}

			dataAndCallback.preventSuccessEvent = option.preventSuccessEvent;
			dataAndCallback.preventFailEvent = option.preventFailEvent;
			dataAndCallback.preventErrorEvent = option.preventErrorEvent;

			option.proxy = option.proxy || $.su.settings.AjaxService.defaultProxy;

			var proxyOption = $.extend(true, {}, defaults, option);

			var manager = $.su.ClassManager.getInstance();
			var getProxyDfd = $.Deferred();
			if (option.proxy) {
				if (!this.proxyMap[option.proxy]) {
					$.su.create(option.proxy).done(function (proxy) {
						me.proxyMap[option.proxy] = proxy;
						getProxyDfd.resolve(proxy);
					});
				} else {
					getProxyDfd.resolve(me.proxyMap[option.proxy]);
				}
			} else {
				var proxy = manager.get($.su.settings.AjaxService.defaultProxy).create(proxyOption);
				getProxyDfd.resolve(proxy);
			}
			getProxyDfd.then(function (proxy) {
				if (option.method && proxy[option.method]) {
					proxy[option.method].call(proxy, dataAndCallback);
				} else {
					proxy.op('default', dataAndCallback);
				}
			});
		};

		Ajax.prototype.upload = function (option) {
			var me = this;
			var proxyOption = $.extend({}, defaults, option);
			var dataAndCallback = {
				fileId: option.fileId,
				data: option.data,
				success: option.success,
				fail: option.fail,
				error: option.error,
				timeout: option.timeout,
				noneEncrypt: option.noneEncrypt
			};
			var proxy;
			var manager = $.su.ClassManager.getInstance();
			var getProxyDfd = $.Deferred();
			if (option.proxy) {
				if (!this.proxyMap[option.proxy]) {
					$.su.create(option.proxy).done(function (proxy) {
						me.proxyMap[option.proxy] = proxy;
						getProxyDfd.resolve(proxy);
					});
				} else {
					getProxyDfd.resolve(me.proxyMap[option.proxy]);
				}
			} else {
				var proxy = manager.get($.su.settings.AjaxService.defaultProxy).create(proxyOption);
				getProxyDfd.resolve(proxy);
			}
			getProxyDfd.then(function (proxy) {
				proxy.upload(dataAndCallback);
			});
		};

		Ajax.prototype.download = function (fileName) {
			var manager = $.su.ClassManager.getInstance();
			var proxy = manager.get($.su.settings.AjaxService.defaultProxy).create(proxyOption);
			proxy.download(fileName);
		};

		Ajax.prototype.createProxy = function (name, options) {
			var manager = $.su.ClassManager.getInstance();
			var proxy = manager.get(name).create(options);
			return proxy;
		};
		// 用于控制台调试接口
		Ajax.prototype.devRequest = function (url, data) {
			var option = {};
			option.url = $.su.url(url);
			// 深层数据转化为字符串
			option.data = JSON.stringify(data);
			option.success = function (filteredData, data, status, xhr) {
				console.log(data);
			};
			option.fail = function (data, errorCode, status) {
				console.log(data);
			};
			option.error = function () {
				console.log('request error');
			};
			this.request(option);
		};
		return Ajax;
	})();
})(jQuery);
