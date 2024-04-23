// JavaScript Document
(function ($) {
	$.su.StoreManager = (function () {
		var StoreManager = function () {
			$.su.Manager.call(this);
			this.type = $.su.Store;
		};
		$.su.inherit($.su.Manager, StoreManager);

		StoreManager.prototype.define = function (name, options, factory) {
			var me = this;
			var settings = $.extend(
				{
					name: name,
					factory: factory,
					singleton: true
				},
				options
			);

			if (this._infoMap[name]) {
				$.su.debug.error('Duplicated store definition "' + name + '"');
				return;
			}

			if (options && $.su.Store.checkProxyDep(options.proxy)) {
				$.su.Store.importProxyDep(options.proxy, function () {
					me._infoMap[name] = {
						settings: settings,
						status: 'defined' //defined, inited,
					};
					me.trigger(generateDefinedEventName(name));
				});
			} else {
				me._infoMap[name] = {
					settings: settings,
					status: 'defined' //defined, inited,
				};
				me.trigger(generateDefinedEventName(name));
			}
		};

		StoreManager.prototype.init = function (name) {
			var info = this._infoMap[name];
			if (!info || info.status == 'available') {
				return null;
			}

			if (info.settings.singleton === false) {
				info.status = 'available';
				return;
			}

			var type = this._infoMap[name].settings.type || 'store';
			this._map[name] = new $.su[$.su.format.capitalize(type)](this._infoMap[name].settings);
			this._infoMap[name].status = 'available';
		};

		StoreManager.prototype.get = function (name) {
			var info = this._infoMap[name];
			if (!info) {
				return null;
			}
			if (info.settings.singleton === false) {
				var type = this._infoMap[name].settings.type || 'store';
				return new $.su[$.su.format.capitalize(type)](info.settings);
			} else if (this._map[name]) {
				return this._map[name];
			} else {
				// modelManager.init(name);
				// return _models[name];
				return null;
			}
		};

		StoreManager.prototype.loadDefine = function (name, callback) {
			this.one(generateDefinedEventName(name), callback);
			$.su.router.loadModel(name);
		};

		StoreManager.prototype.getStatus = function (name) {
			if (!this._infoMap[name]) {
				return null;
			} else {
				return this._infoMap[name].status;
			}
		};

		StoreManager.prototype.isDefined = function (name) {
			if (this._infoMap[name]) {
				return true;
			}
			return false;
		};

		StoreManager.prototype.isAvailable = function (name) {
			if (this._infoMap[name] && this._infoMap[name].status === 'available') {
				return true;
			}
			return false;
		};

		StoreManager.prototype.destroy = function (name) {
			var _this = this;
			delete this._map[name];
		};

		function generateDefinedEventName(name) {
			return 'ev_' + name + '_defined';
		}

		return StoreManager;
	})();
})(jQuery);
