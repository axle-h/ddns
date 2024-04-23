(function ($) {
	$.su.App = (function () {
		var models;
		var modules;
		$.ajax('./config/models.json', {
			async: false,
			method: 'GET',
			dataType: 'json',
			success: function (data) {
				models = $.extend({}, data);
			}
		});
		$.ajax('./config/modules.json', {
			async: false,
			method: 'GET',
			dataType: 'json',
			success: function (data) {
				modules = data;
			}
		});
		$.ajax('./config/src.js', {
			async: true,
			method: 'GET',
			dataType: 'script'
		});

		var App = function (options) {
			var that = this;

			this.override();

			$.su.Application.call(this);

			this.loader = new $.su.Loader();
			this.classManager = $.su.ClassManager.getInstance();
			this.classManager.setLoader(this.loader);

			new $.su.Ajax({
				ajax: {
					contentType: 'application/x-www-form-urlencoded',
					type: 'POST'
				},
				failHandler: function (failCallback) {
					return function (data, errorCode, status, xhr) {
						!!failCallback && failCallback(data, errorCode, status, xhr);
					};
				},
				errorHandler: function (errorCallback) {
					return function (status, xhr) {
						!!errorCallback && errorCallback(status, xhr);
					};
				}
			});
			new $.su.Vtype();
			new $.su.Polling();
			new $.su.Services.ModuleManager();
			new $.su.Device({
				service: {
					ajax: that.serviceManager.get('ajax'),
					loading: that.serviceManager.get('loading')
				}
			});
			new $.su.CloudEmmitter({
				service: {
					ajax: that.serviceManager.get('ajax'),
					device: that.serviceManager.get('device')
				}
			});
			new $.su.Time({
				service: {
					ajax: that.serviceManager.get('ajax')
				}
			});
			new $.su.Services.Timer();
			this.moduleLoader = new $.su.Services.ModuleLoader();

			this.language = new $.su.LanguageService();
			this.navigator = new $.su.Navigator({
				service: {
					moduleLoader: that.moduleLoader,
					loading: that.loading
				}
			});
			this.router = $.su.router = new $.su.Router();

			this.router.setModelsPath(models);
			this.router.set(modules);
			this.navigator.set({});
		};

		$.su.inherit($.su.Application, App);

		App.prototype.init = function () {
			var dtd = $.Deferred();
			var me = this;
			var promiseArr = [];

			var mobileFilePromise = $.Deferred();
			promiseArr.push(mobileFilePromise);
			if ($.su.isMobile()) {
				// load widget.mobile.js
				$.getScript('./js/su/widget/widget.mobile.js', function () {
					mobileFilePromise.resolve();
				});
			} else {
				mobileFilePromise.resolve();
			}

			var loaderPathFetchPromise = $.Deferred();
			promiseArr.push(loaderPathFetchPromise);
			var path = $.su.settings.Loader.classesPath;
			this.loader.loadFile(path, function (data) {
				me.loader.setPath(data);
				loaderPathFetchPromise.resolve();
			});

			$.when.apply(this, promiseArr).done(function () {
				dtd.resolve();
			});

			return dtd.promise();
		};

		App.prototype.customWidget = function () {
			// 覆盖默认控件方法
			var overRide = {
				errortip: {
					animate: function (tips) {
						var _this = this.dom();
						var wrap = _this.find('div.widget-error-tips-wrap');
						var content = _this.find('div.error-tips-content');
						var loaderContainer = _this.closest('.html-loader-container');
						var msgContainer = _this.closest('.msg-content-wrap');
						var container = loaderContainer.length > 0 ? loaderContainer : msgContainer.length > 0 ? msgContainer : $('#index-view-container');
						var containerOffset = container.offset();
						var containerWidth = container.width();

						if ($.type(tips) === 'string') {
							content.text(tips);
						}

						_this.addClass('show').show();

						// 计算位置
						var offset = wrap.offset();
						var width = wrap.width();

						if (offset.left - containerOffset.left + width > containerWidth) {
							wrap.css({
								right: 0
							});
						}
					}
				}
			};

			for (var widget in overRide) {
				if (overRide.hasOwnProperty(widget)) {
					for (var method in overRide[widget]) {
						if (overRide[widget].hasOwnProperty(method)) {
							if ($.fn[widget]) {
								$.fn[widget][method] = overRide[widget][method];
							}
						}
					}
				}
			}
		};

		App.prototype.override = function () {
			$.su.Store.prototype.getIndexsInSnapshot = function (keyArray) {
				//根据keyArray返回index的array
				var data = this.snapshot;
				var keyProperty = this.keyProperty;

				if (keyArray.length === 0) {
					return undefined;
				}

				var indexArray = [];
				for (var jndex = 0, jlen = keyArray.length; jndex < jlen; jndex++) {
					for (var index = 0, len = data.length; index < len; index++) {
						var key = keyArray[jndex];
						if (data[index][keyProperty] == key.toString()) {
							indexArray.push(index);
							break;
						}
					}
				}
				return indexArray;
			};

			$.su.Store.prototype.beforeRemove = function (storeData, items, option) {
				var keyProperty = this.keyProperty;
				option = option || {};
				var me = this;
				var sendData = {
					key: [],
					index: []
				};

				for (var key in items) {
					if (items.hasOwnProperty(key)) {
						//key may be int type, 'key' property name is not reliable.
						sendData.key.push(items[key].oldModel[keyProperty]);
					}
				}
				sendData.index = this.getIndexsInSnapshot(sendData.key);

				return {
					ajax: $.extend(
						{},
						{
							url: option.url || undefined,
							type: 'POST',
							contentType: 'application/x-www-form-urlencoded',
							traditional: true
						},
						option.ajax
					),
					data: $.extend({}, sendData, { operation: 'remove' }, option.data),
					success: function (result, data) {
						// me.loadData(result.model, true);
						!!option.success && option.success(result);
						me.fireEvent('ev_store_sync_success');
						me.load();
					},
					fail: function (data, errorCode, status, xhr) {
						me.loadData(me.snapshot);
						!!option.fail && option.fail(data, errorCode, status, xhr);
						if (errorCode) {
							me.trigger('ev_store_sync_error', errorCode);
						}
					},
					error: function (status, xhr) {
						me.loadData(me.snapshot);
						!!option.error && option.error(status, xhr);
						me.trigger('ev_store_ajax_error', [status, xhr]);
					}
				};
			};
			$.su.Error.handle = function (err) {
				switch (err.type) {
					//这里处理的是数据交互的一些错误，但并不限于此
					//'errorCode' 为框架内部对错误码的固定名称
					// case "proxy_fail":
					// 	if(err.errorCode && err.errorCode !=51203){
					// 		var code = err.errorCode + '';
					// 		code = (code.substr(0,1) == 'e') ? code : ('e'+code)
					// 		var errorMsg = $.su[$.app.language.settings.char]["ERRCODE"][code] || $.su[$.app.language.settings.char]["ERRCODE"]["EDEFAULT"];
					// 		$.su.moduleManager.query("main").showNotice(errorMsg, 1);
					// 	}
					// 	return true;

					case 'model_ajax_error':
					case 'store_ajax_error':
						$.su.moduleManager.query('main').showNotice($.su.CHAR.ERROR[code] || $.su.CHAR.COMMON.SAVE_FAILED, 1);
						return true;

					case 'module_not_found':
					case 'module_not_defined':
						$.su.debug.error('navigator error', err.module);
						return true;
					default:
						var code = err.errorCode;
						var errorText = '';
						switch (code) {
							case 'timeout':
							case 'user conflict':
							case 'permission denied':
								errorText = '';
								break;
							default:
								errorText = $.su.CHAR.ERROR[code] || $.su.CHAR.COMMON.SAVE_FAILED;
								break;
						}
						if (errorText && $.su.moduleManager.query('main')) {
							$.su.moduleManager.query('main').showNotice(errorText, 1);
						}
						return true;
				}
			};

			$.su.Model.promiseLoad = function (modelOrStore, data) {
				var isModelOrStore =
					modelOrStore instanceof $.su.Model ||
					modelOrStore instanceof $.su.ModelBind ||
					modelOrStore instanceof $.su.Store ||
					modelOrStore instanceof $.su.StoreBind;

				if (!isModelOrStore) {
					return;
				}
				var dfd = $.Deferred();

				var sendObj = data ? { data: data } : {};
				$.extend(sendObj, {
					success: function (data) {
						dfd.resolve(data);
					},
					fail: dfd.reject,
					error: dfd.reject
				});
				modelOrStore.load(sendObj);
				return dfd.promise();
			};
		};

		App.prototype.reset = function () {};

		App.prototype.reload = function () {};

		App.prototype.getInfo = function () {};

		return App;
	})();

	$.appUtils = $.su.App.utils = {
		intToArray: function (num, length) {
			num = parseInt(num);
			var result = [];
			while (num > 0) {
				result.push(num % 2);
				num = parseInt(num / 2);
			}
			if (result.length < length) {
				var len = result.length;
				for (var i = 0; i < length - len; i++) {
					result.push(0);
				}
			}
			return result;
		},
		arrayToInt: function (array) {
			var result = 0;
			var base = 1;
			while (array.length > 0) {
				result += (array.shift() || 0) * base;
				base = base * 2;
			}
			return result;
		},
		objectToArray: function (obj) {
			var array = [];
			for (var i in obj) {
				array[i] = obj[i];
			}
			return array;
		},
		resetPortsValue: function (origin, target) {
			var val1 = $.appUtils.portSplit(origin).split(',');
			var val2 = $.appUtils.portSplit(target).split(',');
			/*-------------------------------*/

			for (var i = 0; i < val1.length; i++) {
				var index = val2.indexOf(val1[i]);
				if (index >= 0) {
					val2.splice(index, 1);
				}
			}
			return $.appUtils.portCombine(val2.join(','));
		},
		keyHandler: function (key) {
			return key.toString().replace(/[\/\.\:\s\(\)]/g, '_');
		},
		doLayout: function () {
			var h1 = $('#scroll-layer').height() - $('.bot').height();
			$('#main-con').css({
				minHeight: h1
			});
		},
		isSameMac: function (mac1, mac2) {
			return typeof mac1 === 'string' && typeof mac2 === 'string' && $.trim(mac1.toLowerCase()) === $.trim(mac2.toLowerCase());
		}
	};
})(jQuery);
