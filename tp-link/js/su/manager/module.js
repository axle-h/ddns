// JavaScript Document
(function ($) {
	$.su = $.su || {};

	$.su.ModuleManager = (function () {
		var ModuleManager = function () {
			$.su.Manager.call(this);
			this.type = $.su.Module;

			this._depMap = {};
			this._toDestroy = [];
		};
		$.su.inherit($.su.Manager, ModuleManager);

		function geneCtrFn(func) {
			var map = {
				views: this.data.views,
				models: this.data.models,
				stores: this.data.stores,
				deps: this.data.deps,
				services: this.services
			};
			var funcArgs = func
				.toString()
				.match(/^function\s*[^\(]*\(\s*([^\)]*)\)/m)[1]
				.replace(/ /g, '')
				.split(',');
			var flag = new Array(funcArgs.length);
			for (var i = 0; i < funcArgs.length; i++) {
				var name = funcArgs[i];
				if (map.hasOwnProperty(name)) {
					funcArgs[i] = map[name];
					flag[i] = true;
				} else {
					flag[i] = false;
				}
			}
			return function () {
				var valueArr = Array.prototype.slice.call(arguments, 0);
				var args = new Array(funcArgs.length);
				for (var i = 0; i < funcArgs.length; i++) {
					if (!flag[i]) {
						args[i] = valueArr[i];
					} else {
						args[i] = funcArgs[i];
					}
				}
				return func.apply(this, args);
			};
		}

		var geneLoadRequiresFn = function (name, callback) {
			// return function(){
			var settings = this._infoMap[name].settings;
			var models = settings.models;
			var stores = settings.stores;
			var deps = settings.deps;
			var views = settings.views;

			var depsReady = false;
			var modelsReady = false;
			var storesReady = false;
			var viewsReady = false;

			var checkModels = function () {
				for (var i = 0; i < models.length; i++) {
					var modelName = models[i];
					if (!$.su.modelManager.isDefined(modelName)) {
						return false;
					}
				}
				if (!modelsReady) {
					modelsReady = true;
					checkStatus();
				}
			};
			var checkStores = function () {
				for (var i = 0; i < stores.length; i++) {
					var storeName = stores[i];
					if (!$.su.storeManager.isDefined(storeName)) {
						return false;
					}
				}
				if (!storesReady) {
					storesReady = true;
					checkStatus();
				}
			};
			var checkDeps = function () {
				for (var i = 0; i < deps.length; i++) {
					var depName = deps[i];
					if (!$.su.moduleManager.isDefined(depName)) {
						return false;
					}
				}
				if (!depsReady) {
					depsReady = true;
					checkStatus();
				}
			};

			var checkViews = function () {
				for (var i = 0; i < views.length; i++) {
					var viewName = views[i];
					if (!$.su.viewManager.isDefined(viewName, name)) {
						return false;
					}
				}
				if (!viewsReady) {
					viewsReady = true;
					checkStatus();
				}
			};

			var checkStatus = function () {
				if (depsReady && modelsReady && storesReady && viewsReady) {
					callback();
				}
			};

			if (models.length == 0) {
				modelsReady = true;
				checkStatus();
			} else {
				for (var i = 0; i < models.length; i++) {
					var modelName = models[i];
					if (!$.su.modelManager.isDefined(modelName)) {
						$.su.modelManager.loadDefine(modelName, function () {
							checkModels();
						});
					} else {
						checkModels();
					}
				}
			}

			if (stores.length == 0) {
				storesReady = true;
				checkStatus();
			} else {
				for (var j = 0; j < stores.length; j++) {
					var storeName = stores[j];
					if (!$.su.storeManager.isDefined(storeName)) {
						$.su.storeManager.loadDefine(storeName, function () {
							checkStores();
						});
					} else {
						checkStores();
					}
				}
			}

			if (views.length == 0) {
				viewsReady = true;
				checkStatus();
			} else {
				for (var index = 0; index < views.length; index++) {
					var viewName = views[index];

					// cause the current config file, view is bound to a specific module
					if (!$.su.viewManager.isDefined(viewName, name)) {
						$.su.viewManager.loadDefine(viewName, name, function () {
							checkViews();
						});
					} else {
						checkViews();
					}
				}
			}

			if (deps.length == 0) {
				depsReady = true;
				checkStatus();
			} else {
				for (var k = 0; k < deps.length; k++) {
					var depName = deps[k];
					if (!$.su.moduleManager.isDefined(depName)) {
						if (!($.su.moduleManager.getStatus(depName) === $.su.Module.STATUS.LOADING_DEFINE)) {
							$.su.moduleManager.loadDefine(depName, checkDeps);
						} else {
							$($.su.moduleManager).one('ev_module_' + depName + '_defined', function () {
								checkDeps();
							});
						}
					} else {
						checkDeps();
					}
				}
			}
			// };
		};

		var _updateDepMap = function (module, deps) {
			if (deps.length === 0) {
				return;
			}
			for (var i = 0; i < deps.length; i++) {
				if (this._depMap.hasOwnProperty(deps[i])) {
					if (!($.inArray(this._depMap[deps[i]], module) >= 0)) {
						this._depMap[deps[i]].push(module);
					}
				} else {
					this._depMap[deps[i]] = [module];
				}
			}
		};

		ModuleManager.prototype.define = function (name, options, factory) {
			var me = this;
			//参数验证
			//var module = new $.su.Module();
			var settings = $.extend(
				{
					name: name,
					deps: [],
					models: [],
					stores: [],
					views: []
				},
				options
			);

			if (this._infoMap[name]) {
				$.su.debug.error('Duplicated module definition "' + name + '"');
				return;
			}

			_updateDepMap.call(this, settings.name, settings.deps);

			this._infoMap[name] = {
				settings: settings,
				constructor: null,
				status: $.su.Module.STATUS.LOADING_DEFINE
			};

			var Module = function (options) {
				this.factory = factory;
				$.su.Module.call(this, options);

				// var funcArgs = factory.toString().match(/^function\s*[^\(]*\(\s*([^\)]*)\)/m)[1].replace(/ /g, '').split(',');

				// var factoryObj = (geneCtrFn.call(this, factory))();
			};

			$.su.inherit($.su.Module, Module);
			// Module.prototype = $.extend(Module.prototype, injectDeps(factory, settings, _deps).call(Module.prototype));

			this._infoMap[name].constructor = Module;

			geneLoadRequiresFn.call(this, name, function () {
				me._infoMap[name].status = $.su.Module.STATUS.DEFINED;
				$(me).trigger('ev_module_' + name + '_defined');
			});
		};

		// ModuleManager.prototype.loadDefine = function(name, callback){
		// 	$.su.router.load(name, callback);
		// };

		// ModuleManager.prototype.load= function(id, callback){
		// 	if($.su.moduleManager.query(id)){
		// 		$.su.moduleManager.query(id).load(callback);
		// 	}
		// };

		//private func
		ModuleManager.prototype.query = function (id) {
			if (this._map[id]) {
				return this._map[id];
			} else {
				return false;
			}
		};

		ModuleManager.prototype.unload = function (id) {
			if (this._map[id]) {
				this._map[id].destroy(); //left
				delete this._map[id];
				this._infoMap[id].status = $.su.Module.STATUS.DEFINED;
			}
		};

		ModuleManager.prototype.loadDefine = function (name, callback) {
			$(this).one('ev_module_' + name + '_defined', callback);
			$.su.router.loadController(name);
		};

		ModuleManager.prototype.load = function (name, callback) {
			switch ($.su.moduleManager.getStatus(name)) {
				case $.su.Module.STATUS.LOADING_DEFINE:
					$($.su.moduleManager).one('ev_module_' + name + '_defined', function () {
						$.su.moduleManager.init(name);
						!!callback && callback();
						// $.su.moduleManager.query(name).load(callback);
					});
					break;
				case $.su.Module.STATUS.DEFINED:
					$.su.moduleManager.init(name);
					!!callback && callback();
					// $.su.moduleManager.query(name).load(callback);
					break;
				case $.su.Module.STATUS.AVAILABLE:
					var module = $.su.moduleManager.query(name);
					!!callback && callback();
					// module.load(callback);
					break;
				case false:
				default:
					$.su.moduleManager.loadDefine(name, function () {
						$.su.moduleManager.init(name);
						!!callback && callback();
						// $.su.moduleManager.query(name).load(callback);
					});
					break;
			}
		};

		ModuleManager.prototype.getStatus = function (name) {
			var infoMap = this._infoMap;
			if (infoMap[name]) {
				return infoMap[name].status;
			} else if ($.su.router.query(name)) {
				return $.su.Module.STATUS.DEFINE_NOT_LOADED;
			} else {
				return false;
			}
		};

		ModuleManager.prototype.isDefined = function (name) {
			if (this._infoMap[name] && this._infoMap[name].status !== $.su.Module.STATUS.LOADING_DEFINE) {
				return true;
			}
			return false;
		};

		ModuleManager.prototype.isAvailable = function (name) {
			if (this._infoMap[name] && this._infoMap[name].status === $.su.Module.STATUS.AVAILABLE) {
				return true;
			}
			return false;
		};

		ModuleManager.prototype.init = function (name) {
			var me = this;
			if (!this._infoMap[name] || this._infoMap[name].status == $.su.Module.STATUS.AVAILABLE) {
				return;
			}
			this._map[name] = new this._infoMap[name].constructor(this._infoMap[name].settings);
			this._infoMap[name].status = $.su.Module.STATUS.AVAILABLE;
			this._map[name].addListener('ev_to_destroy', function (e, name) {
				me.prepareDestroy(name);
			});
		};

		ModuleManager.prototype.prepareDestroy = function (name) {
			if (this._depMap[name]) {
				for (var i = 0; i < this._depMap[name].length; i++) {
					var module = this._depMap[name][i];
					if (this.isAvailable(module)) {
						if ($.inArray(name, this._toDestroy) === -1) {
							this._toDestroy.push(name);
						}
						return;
					}
				}
			}
			this.unload(name);
			var index = $.inArray(name, this._toDestroy);
			if (index >= 0) {
				this._toDestroy.splice(index, 1);
			}

			var deps = this._infoMap[name].settings.deps;
			for (var j = 0; j < deps.length; j++) {
				if ($.inArray(deps[j], this._toDestroy) >= 0) {
					this.prepareDestroy(deps[j]);
				}
			}
		};

		ModuleManager.prototype.launch = function (name, callback) {
			this.load(name, function () {
				$.su.moduleManager.query(name).load(callback);
			});
		};

		return ModuleManager;
	})();
})(jQuery);
