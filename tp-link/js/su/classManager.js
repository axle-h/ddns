/*
 * @description @class class manager of SU, this Class is special, not created by @SUClass for now
 *
 * @author KYJ
 * @change
 *   2018/02/06: create file
 *
 * */
(function ($) {
	$.su.ClassManager = (function () {
		var ClassManager = function (config) {
			if (ClassManager.instance != null) {
				return instance;
			}

			$.su.Observable.call(this);
			this._map = {};

			if (config && config.loader) {
				this.loader = config.loader;
			}

			this.settings = {};

			this.definingClasses = [];

			ClassManager.instance = this;
		};

		//TODO: change to Mixin
		$.su.inherit($.su.Observable, ClassManager);

		ClassManager.instance = null;

		ClassManager.getInstance = function () {
			if (ClassManager.instance == null) {
				ClassManager.instance = new ClassManager();
				var loaderClass = $.su.settings.classManager.loader;
				var loader = new $.su[loaderClass]();
				ClassManager.instance.setLoader(loader);
			}
			return ClassManager.instance;
		};

		ClassManager.prototype.setLoader = function (loader) {
			this.loader = loader;
		};

		function generateDefinedEventName(name) {
			return 'ev_' + name + '_defined';
		}

		// private
		ClassManager.prototype.loadDefine = function (name, callback) {
			var dtd = $.Deferred();
			if (this.get(name)) {
				!!callback && callback();
				dtd.resolve();
				return dtd.promise();
			}

			this.one(generateDefinedEventName(name), function () {
				!!callback && callback();
				dtd.resolve();
			});

			var loadingIndex = $.inArray(name, this.definingClasses);
			if (loadingIndex < 0) {
				this.definingClasses.push(name);
				var loader = this.loader;
				loader.load(name, { type: 'script' });
			}
			return dtd.promise();
		};

		ClassManager.prototype.get = function (name) {
			if (this._map[name]) {
				return this._map[name];
			}

			// for compatibility for previous defined Class which is not managed by SU Class system
			var ret = $.su[name];
			if ($.type(ret) == 'function') {
				return ret;
			}
		};

		// /*
		// * create a instance by Class name, call this
		//  */
		// ClassManager.create = function(){
		//
		// };
		//
		// ClassManager.createSync = function(name){
		//
		// };
		//
		// ClassManager.createAsync = function(name){
		//
		// };

		/*
		 * TODO: handle of some anonymous Class(not string, need not to require)
		 * */
		function prepareDeps(option) {
			var me = this;

			var PromiseArr = [];
			var dtd = $.Deferred();

			var extendClassPromise;
			var mixinsClassPromise;
			var depsGathererPromise;
			var inheritableDepsGathererPromise;
			var inheritedDepsGathererPromise;

			// extend
			if (option.extend) {
				var extendOpt = option.extend;
				if ($.type(extendOpt) == 'string') {
					extendClassPromise = $.su.require(extendOpt);
					// PromiseArr.push(extendClassPromise);
				}
			}

			//mixins
			if (option.minxins) {
				var mixinsOpt = option.minxins;
				if ($.type(mixinsOpt) == 'string' || $.type(mixinsOpt) == 'array') {
					mixinsClassPromise = $.su.require(mixinsOpt);
					PromiseArr.push(mixinsClassPromise);
				} else if ($.type(mixinsOpt) == 'object') {
					var mixinsArr = [];
					for (var name in mixinsOpt) {
						if (mixinsOpt.hasOwnProperty(name)) {
							mixinsArr.push(mixinsOpt[name]);
						}
					}
					mixinsClassPromise = $.su.require(mixinsArr);
					PromiseArr.push(mixinsClassPromise);
				}
			}

			//depsGatherer
			if (option.depsGatherer) {
				depsGathererPromise = option.depsGatherer(option);
				PromiseArr.push(depsGathererPromise);
			}

			//inheritableDepsGatherer
			if (option.inheritableDepsGatherer) {
				inheritableDepsGathererPromise = option.inheritableDepsGatherer(option);
				PromiseArr.push(inheritableDepsGathererPromise);
			}

			var gatherInheritedDeps = function (option) {
				var dtd = $.Deferred();
				var parentClass = me.get(option.extend);
				var inheritedDepsGatherer = parentClass.$inheritableDepsGatherer;
				var tmpPromiseArr = [];
				for (var i = 0; i < inheritedDepsGatherer.length; i++) {
					tmpPromiseArr.push(inheritedDepsGatherer[i](option));
				}
				$.when.apply(this, tmpPromiseArr).done(function () {
					dtd.resolve();
				});
				return dtd.promise();
			};

			if (extendClassPromise) {
				extendClassPromise.done(function () {
					var gatherInheriablePromise = gatherInheritedDeps(option);
					PromiseArr.push(gatherInheriablePromise);
					$.when.apply(this, PromiseArr).done(function () {
						dtd.resolve();
					});
				});
			} else {
				$.when.apply(this, PromiseArr).done(function () {
					dtd.resolve();
				});
			}

			return dtd.promise();
		}

		var onClassDefined = function (suClass) {
			if (suClass.$inheritableOnClassDefined) {
				for (var i = 0; i < suClass.$inheritableOnClassDefined.length; i++) {
					suClass.$inheritableOnClassDefined[i](suClass);
				}
			}
			!!suClass.$onClassDefined && suClass.$onClassDefined(suClass);
		};

		/*
		 * define a new Class
		 * async
		 * */
		ClassManager.prototype.define = function (name, option, callback) {
			var me = this;
			var dtd = $.Deferred();
			var noName;

			if (!name) {
				noName = true;
				// option.name = name = $.su.randomId("AnonymousClass");
			} else {
				option.name = name;
			}
			prepareDeps.call(this, option).done(function () {
				var suClass = new $.su.SUClass(option);
				if (!noName) {
					me._map[name] = suClass;
				}
				onClassDefined(suClass);
				!!callback && callback(suClass);
				if (!noName) {
					var loadingIndex = $.inArray(name, me.definingClasses);
					if (loadingIndex >= 0) {
						me.definingClasses.splice(loadingIndex, 1);
					}
					me.trigger(generateDefinedEventName(name));
				}
				dtd.resolve(suClass);
			});
			return dtd.promise();
		};

		ClassManager.prototype.defineSync = function (name, option) {
			var me = this;
			var suClass = new $.su.SUClass(option);
			me._map[name] = suClass;
		};

		ClassManager.prototype.instantiators = [];

		ClassManager.prototype.getInstantiator = function (length) {
			var instantiators = this.instantiators;
			var instantiator = instantiators[length];

			if (!instantiator) {
				var args = [];
				for (var i = 0; i < length; i++) {
					args.push('a[' + i + ']');
				}
				instantiator = instantiators[length] = new Function('c', 'a', 'return new c(' + args.join(',') + ')');
				instantiator.name = 'SUInstantiator' + length;
			}

			return instantiator;
		};

		return ClassManager;
	})();

	$.su.require = function (names, callback) {
		var manager = $.su.ClassManager.getInstance();
		//<DEBUG>
		if (!manager) {
			$.su.debug.error('ClassManager not init');
		}
		//</DEBUG>

		if ($.type(names) === 'string') {
			names = [names];
		}

		var requirePromise = $.Deferred();
		var promiseArray = [];

		for (var i = 0, len = names.length; i < len; i++) {
			var name = names[i];
			var dtd = $.Deferred();
			promiseArray.push(dtd);
			if (manager.get(name)) {
				dtd.resolve();
			} else {
				manager.loadDefine(
					name,
					(function (dtd) {
						return function () {
							dtd.resolve();
						};
					})(dtd)
				);
			}
		}

		$.when.apply(this, promiseArray).done(function () {
			!!callback && callback();
			requirePromise.resolve();
		});

		return requirePromise.promise();
	};

	$.su.define = function () {
		var manager = $.su.ClassManager.getInstance();
		//<DEBUG>
		if (!manager) {
			$.su.debug.error('ClassManager not init');
		}
		//</DEBUG>

		return manager.define.apply(manager, arguments);
	};

	// $.su.create = function(classInfo, option, callback){
	// 	var dtd = $.Deferred();

	// 	if($.type(option) === "function"){
	// 		callback = option;
	// 		option = undefined;
	// 	}

	// 	var manager = $.su.ClassManager.getInstance();
	// 	var type = $.type(classInfo);
	// 	if(type === "string"){
	// 		var name = classInfo;
	// 		$.su.require(name).done(function(){
	// 			var suClass = manager.get(name);
	// 			var ret = suClass.create ? suClass.create(option) : new suClass(option);
	// 			!!callback && callback(ret);
	// 			dtd.resolve(ret);
	// 		})
	// 	}else if(type === "function"){  //SUClass
	// 		var suClass = classInfo;
	// 		var ret = suClass.create ? suClass.create(option) : new suClass(option);
	// 		!!callback && callback(ret);
	// 		dtd.resolve(ret);
	// 	}else if(type === "object"){
	// 		manager.define(null, classInfo).done(function(suClass){
	// 			var ret = suClass.create ? suClass.create(option) : new suClass(option);
	// 			!!callback && callback(ret);
	// 			dtd.resolve(ret);
	// 		})
	// 	}
	// 	return dtd.promise();
	// };

	function _createInstance(suClass, args) {
		var manager = $.su.ClassManager.getInstance();
		if (suClass.create) {
			return suClass.create.apply(suClass, args);
		} else {
			var instantiator = manager.getInstantiator(args.length);
			return instantiator(suClass, args);
		}
	}

	/**
	 * @param {string/function} class
	 * @param {...} args
	 *
	 * use this fn in method of promise, because args is uncertain, can not push the callback at end
	 * ok: $.su.create('DemoClass', ...args).done(callback);
	 * error: $.su.create('DemoClass', ...args, callback)
	 */
	$.su.create = function () {
		var classInfo = arguments[0];
		var args = Array.prototype.slice.call(arguments, 1);
		var type = $.type(classInfo);
		var manager = $.su.ClassManager.getInstance();
		var dtd = $.Deferred();

		if (type === 'string') {
			var name = classInfo;
			$.su.require(name).done(function () {
				var suClass = manager.get(name);
				var ret = _createInstance(suClass, args);
				dtd.resolve(ret);
			});
		} else if (type === 'function') {
			//SUClass
			var suClass = classInfo;
			var ret = _createInstance(suClass, args);
			dtd.resolve(ret);
		} else if (type === 'object') {
			manager.define(null, classInfo).done(function (suClass) {
				var ret = _createInstance(suClass, args);
				dtd.resolve(ret);
			});
		}
		return dtd.promise();
	};

	/**
	 * @param {string/function} class
	 * @param {...} args
	 *
	 */
	$.su.createSync = function () {
		var classInfo = arguments[0];
		var args = Array.prototype.slice.call(arguments, 1);
		var type = $.type(classInfo);
		var manager = $.su.ClassManager.getInstance();
		if (type === 'string') {
			var name = classInfo;
			var suClass = manager.get(name);
			if (!suClass) {
				$.su.debug.error('class not defined: ' + name);
			}
			return _createInstance(suClass, args);
		}
		//TODO: other type
	};
})(jQuery);
