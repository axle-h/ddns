// JavaScript Document
(function ($) {
	$.su.ModelManager = (function () {
		var ModelManager = function () {
			$.su.Manager.call(this);
			this.type = $.su.Model;
		};
		$.su.inherit($.su.Manager, ModelManager);

		ModelManager.prototype.define = function (name, options, factory) {
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
				$.su.debug.error('Duplicated model definition "' + name + '"');
				return;
			}

			if (options && $.su.Model.checkProxyDep(options.proxy)) {
				$.su.Model.importProxyDep(options.proxy, function () {
					me._infoMap[name] = {
						settings: settings,
						constructor: $.su.Model,
						status: 'defined' //defined, inited,
					};
					me.trigger(generateDefinedEventName(name));
				});
			} else {
				me._infoMap[name] = {
					settings: settings,
					constructor: $.su.Model,
					status: 'defined' //defined, inited,
				};
				me.trigger(generateDefinedEventName(name));
			}

			// if(factory){
			// 	var Model = function(options){
			// 		$.su.Model.call(this, options);
			//
			// 		var factoryObj = factory.call(this);
			// 		!!factoryObj && $.extend(this, factoryObj);
			// 	};
			//
			// 	$.su.inherit($.su.Model, Model);
			//
			// 	this._infoMap[name].constructor = Model;
			// }else{
			// 	this._infoMap[name].constructor = $.su.Model;
			// }
		};

		ModelManager.prototype.init = function (name) {
			var info = this._infoMap[name];
			if (!info || info.status == 'available') {
				return null;
			}

			if (info.settings.singleton === false) {
				info.status = 'available';
				return;
			}

			this._map[name] = new this._infoMap[name].constructor(this._infoMap[name].settings);
			this._infoMap[name].status = 'available';
		};

		ModelManager.prototype.get = function (name) {
			var info = this._infoMap[name];
			if (!info) {
				return null;
			}

			if (info.settings.singleton === false) {
				return new this._infoMap[name].constructor(this._infoMap[name].settings);
			} else if (this._map[name]) {
				return this._map[name];
			} else {
				// modelManager.init(name);
				// return _models[name];
				return null;
			}
		};

		ModelManager.prototype.loadDefine = function (name, callback) {
			this.one(generateDefinedEventName(name), callback);
			$.su.router.loadModel(name);
		};

		ModelManager.prototype.getStatus = function (name) {
			if (!this._infoMap[name]) {
				return null;
			} else {
				return this._infoMap[name].status;
			}
		};

		ModelManager.prototype.isDefined = function (name) {
			if (this._infoMap[name]) {
				return true;
			}
			return false;
		};

		ModelManager.prototype.isAvailable = function (name) {
			if (this._infoMap[name] && this._infoMap[name].status === 'available') {
				return true;
			}
			return false;
		};

		ModelManager.prototype.destroy = function (name) {
			var _this = this;
			delete this._map[name];
		};

		function generateDefinedEventName(name) {
			return 'ev_' + name + '_defined';
		}

		return ModelManager;
	})();
})(jQuery);
