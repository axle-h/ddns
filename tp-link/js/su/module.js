// JavaScript Document
(function ($) {
	$.su.Module = (function () {
		//private
		var _defaultOptions = {
			container: null,
			page: '',
			controller: null,
			autoRender: false,
			deps: null,
			service: null,

			init: function (opt) {},
			onLaunch: function () {}
		};

		var EVENT = {
			AFTER_RENDER: 'afterRender'
		};

		var STATUS = {
			DEFINE_NOT_LOADED: 'defineNotLoaded', //module exists, but its define has not been loaded
			LOADING_DEFINE: 'loadingDefine', //the module's define is loading
			DEFINED: 'defined', //manager has retained the module's define
			AVAILABLE: 'available', //the module has been inited
			RUNNING: 'running' //the module is running
		};

		var Module = function (options) {
			var settings = $.extend(true, {}, _defaultOptions, options);
			this.name = settings.name;
			this.status = Module.STATUS.AVAILABLE;
			this.dataEventsListeners = {};
			this.domEventsListeners = {};
			$.su.Controller.call(this, settings);
		};

		$.su.inherit($.su.Controller, Module);

		/*
		 * @override
		 * */
		Module.prototype._init = function () {
			this.data.deps = {};
			this.services = {};
			this.initDeps();
			this.initServices();
			for (var i = 0; i < this.deps.length; i++) {
				this.data.deps[this.deps[i]] = this.getDep(this.deps[i]);
			}

			Module.superclass._init.call(this);

			var factoryObj = this.factory.call(this, this, this.data.views, this.data.models, this.data.stores, this.data.deps, this.services);
			!!factoryObj && $.extend(this, factoryObj);
			this.settings.init.call(this, this, this.data.views, this.data.models, this.data.stores, this.data.deps, this.services);
		};

		Module.prototype.initDeps = function () {
			var me = this;
			var settings = this.settings;
			this.deps = settings.deps;
			for (var i = 0; i < this.deps.length; i++) {
				$.su.moduleManager.init(this.deps[i]);
			}
		};

		Module.prototype.initServices = function () {
			var me = this;
			var settings = this.settings;
			var services = settings.services;
			if (services) {
				for (var i = 0; i < services.length; i++) {
					this.services[services[i]] = $.su.serviceManager.get(services[i]);
				}
			}
		};

		/*
		 * @override
		 * */
		Module.prototype._getAttrBind = function (attrStr, viewName) {
			attrStr = attrStr.replace(/[\{,\}]/g, '');
			return (
				$.su.getAttrObject(this.data.models, attrStr) ||
				$.su.getAttrObject(this.data.stores, attrStr) ||
				$.su.getAttrObject(this.data.views[viewName], attrStr) ||
				$.su.getAttrObject(this.data.deps, attrStr)
			);
		};

		Module.prototype.load = function (callback) {
			var me = this;
			if (this.status == Module.STATUS.RUNNING) {
				this.updateView(callback);
			} else {
				this.launch(function () {
					// add listeners after launch
					me.bindControl();
					me.bindListen();
					me.status = Module.STATUS.RUNNING;
					!!callback && callback();
					me.trigger('ev_after_launch', [me, me.data.views, me.data.models, me.data.stores, me.data.deps, me.services]);
				});
			}
		};

		Module.prototype.launch = function (callback) {
			this.trigger('ev_before_launch');
			var me = this;
			Module.superclass.launch.call(this, function () {
				me.trigger('ev_on_launch', [me, me.data.views, me.data.models, me.data.stores, me.data.deps, me.services]);
				!!callback && callback();
			});
		};

		Module.prototype.getDep = function (id) {
			if ($.inArray(id, this.deps) >= 0) {
				return $.su.moduleManager.query(id);
			}

			return null;
		};

		Module.prototype.getService = function (id) {
			return this.services[id];
		};

		Module.prototype.destroy = function () {
			this.fireEvent('ev_before_destroy', [this, this.data.views, this.data.models, this.data.stores, this.data.deps, this.services]);
			Module.superclass.destroy.call(this);
			this.data.deps = {};
			this.services = {};
			this.status = Module.STATUS.DEFINED;
		};

		Module.prototype.control = function (options) {
			this.domEventsListeners = options;
			if (this.status === Module.STATUS.RUNNING) {
				this.bindControl();
			}
		};

		Module.prototype.bindControl = function () {
			Module.superclass.control.call(this, this.domEventsListeners);
			this.domEventsListeners = {};
		};

		Module.prototype.listen = function (options) {
			this.dataEventsListeners = options;
			if (this.status === Module.STATUS.RUNNING) {
				this.bindListen();
			}
		};

		Module.prototype.bindListen = function () {
			Module.superclass.listen.call(this, this.dataEventsListeners);
			this.dataEventsListeners = {};
		};

		Module.prototype.isRunning = function () {
			return this.status === STATUS.RUNNING;
		};

		Module.EVENT = EVENT;
		Module.STATUS = STATUS;
		return Module;
	})();
})(jQuery);
