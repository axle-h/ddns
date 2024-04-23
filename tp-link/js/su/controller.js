// JavaScript Document
(function ($) {
	$.su.Controller = (function () {
		var defaults = {
			xtype: 'controller',
			host: null,
			views: null,
			stores: null,
			models: null,
			listeners: {
				/* do not add handler on this event, because the module may has been destroyed when the handler is called
				 *
				 **/
				ev_view_unload: function (e, name) {
					// keep  a map?
					if (this.autoDestroy) {
						// 最后解绑了才卸载 view
						this.fireEvent('ev_to_destroy', this.name);
					}
				}
			},

			autoDestroy: true
		};

		var Controller = function (options) {
			$.su.Observable.call(this, options);
			var settings = $.extend(true, {}, defaults, options);
			this.settings = settings;
			if (settings.host) {
				settings.host = $(settings.host);
				if (settings.host.length == 0) {
					settings.host = null;
				}
			}

			this.data = {
				views: {},
				models: {},
				stores: {}
			};

			this.autoDestroy = settings.autoDestroy;
			this.isController = true;
			this.id = $.su.randomId('controller');
			this.addListener(settings.listeners);

			// this.initViews(settings);
			// this.initModels(settings);
			// this.initStores(settings);

			this.dataEventsMap = {};
			this.domEventsMap = {};
			this.effectiveViewDatas = {};
			// this.initViewData(settings);
			//this.addListener("ev_launched", this.onLaunch);
			this._init();
		};

		$.su.inherit($.su.Observable, Controller);

		// constructor.prototype.addEvents = function(){};	//define events,  not necessary, jquery can sastisfy

		var _createViewWidgets = function (viewName) {
			if (!viewName) {
				for (var i in this.view) {
					if (this.view.hasOwnProperty(i)) {
						var view = this._getView(this.view[i]);
						if (view.isEffective()) {
							view.createChildrenWidgets();
						}
					}
				}
			} else {
				if ($.inArray(viewName, this.view) >= 0) {
					this._getView(viewName).createChildrenWidgets();
				}
			}
		};

		var _render = function (viewName) {
			var dtd = $.Deferred();
			var me = this;
			var i, j;
			var promiseArray = [];

			this.fireEvent('before_render');

			if (!viewName) {
				for (i = 0; i < this.view.length; i++) {
					var view = this._getView(this.view[i]);
					if (view.isEffective()) {
						promiseArray.push(this._getView(this.view[i]).render());
					}
				}

				$.when.apply(this, promiseArray).done(function () {
					_bindEvent.call(me);
					me.fireEvent('ev_after_views_render');
					dtd.resolve();
				});
			} else {
				if ($.inArray(viewName, this.view) >= 0) {
					$.when(this._getView(viewName).render()).done(function () {
						_bindEvent.call(me);
						me.fireEvent('ev_after_view_render', [viewName]);
						dtd.resolve();
					});
				}
			}
			return dtd.promise();
		};

		Controller.prototype._getAttrBind = function (attrStr, viewName) {
			attrStr = attrStr.replace(/[\{,\}]/g, '');
			return (
				$.su.getAttrObject(this.data.models, attrStr) ||
				$.su.getAttrObject(this.data.stores, attrStr) ||
				$.su.getAttrObject(this.data.stores, attrStr) ||
				$.su.getAttrObject(this.data.views[viewName], attrStr)
			);
		};

		var _bindWidgetData = function (widgetInfo, view) {
			var viewObj = widgetInfo.instance;
			var attributes = widgetInfo.attributes;
			var viewName = view._name;

			if (!this.effectiveViewDatas[viewName]) {
				this.effectiveViewDatas[viewName] = [];
			}

			for (var item in attributes) {
				if (attributes.hasOwnProperty(item)) {
					if (item.match(/data-(.+)/g)) {
						var dataBindObj = this._getAttrBind(attributes[item], viewName);
						if (dataBindObj instanceof $.su.DataBind) {
							dataBindObj.bindViewObj(viewObj);
							this.effectiveViewDatas[viewName].push({
								viewObj: viewObj,
								bind: dataBindObj
							});
						}
					}
				}
			}
		};

		var _unBindWidgetData = function (widget, view) {
			var viewObj = widget;
			var viewName = view._name;

			if (!widget.dataBind) {
				return;
			}
			var dataBinds = widget.dataBind;
			var dataBindsLength = dataBinds.length;
			for (var i = dataBindsLength; i > 0; i--) {
				dataBinds[i - 1].unbindViewObj(widget);
				var effectiveViewDatas = this.effectiveViewDatas[viewName];
				if (effectiveViewDatas) {
					for (var j = effectiveViewDatas.length; j > 0; j--) {
						if (effectiveViewDatas[j - 1].viewObj === viewObj && effectiveViewDatas[j - 1].bind === dataBinds[i - 1]) {
							effectiveViewDatas.splice(j - 1, 1);
						}
					}
				}
			}
			widget.dataBind = [];
		};

		var _bindEvent = function (viewName) {
			_unbindEvent.call(this);
			// if(viewName && ($.inArray(viewName, this.view) >= 0)){
			// 	$.each(this.domEventsMap, function(selector, obj) {
			// 		var dom = $('div[view=\"{' + viewName + '}\"]').find(selector);
			// 		$.each(obj, function(ev, fnArr){
			// 			for(var i=0; i<fnArr.length; i++){
			// 				dom.on(ev, fnArr[i]);
			// 			}
			// 		});
			// 	});
			// }else if(!viewName){
			// 	for(var j=0; j<this.view.length; j++){
			// 		_bindEvent.call(this, this.view[j]);
			// 	}
			// }
			_unbindEvent.call(this);
			$.each(this.domEventsMap, function (selector, obj) {
				$.each(obj, function (ev, fnArr) {
					for (var i = 0; i < fnArr.length; i++) {
						var selectorArr = selector.split('=>');
						if (selectorArr.length == 1) {
							$(selector).on(ev, fnArr[i].effectiveHandler);
						} else {
							if (selectorArr.length !== 2) {
								// console.error('bindEvent error, incorrect selector format');
							}
							$(selectorArr[0]).delegate(selectorArr[1], ev, fnArr[i].effectiveHandler);
						}
					}
				});
			});
		};

		var _unbindEvent = function () {
			$.each(this.domEventsMap, function (selector, obj) {
				$.each(obj, function (ev, fnArr) {
					for (var i = 0; i < fnArr.length; i++) {
						var selectorArr = selector.split('=>');
						if (selectorArr.length == 1) {
							$(selector).off(ev, fnArr[i].effectiveHandler);
						} else {
							if (selectorArr.length !== 2) {
								// console.error('bindEvent error, incorrect selector format');
							}
							$(selectorArr[0]).undelegate(selectorArr[1], ev, fnArr[i].effectiveHandler);
						}
					}
				});
			});
		};

		Controller.prototype._init = function () {
			this.initViews();
			this.initModels();
			this.initStores();
			this.initViewData();
		};

		Controller.prototype.launch = function (callback) {
			_createViewWidgets.call(this);
			$.when(_render.call(this)).done(callback);
			// _render.call(this, callback);
			// _bindEvent.call(this);
			// _bindData.call(this);
			// this.fireEvent("ev_launched", "msg.....");
		};

		Controller.prototype.initViews = function () {
			var me = this;
			var settings = this.settings;
			var viewName;
			var view;
			this.view = [];
			this._viewsMap = {};
			if (settings.views) {
				for (var i = 0; i < settings.views.length; i++) {
					var item = settings.views[i];
					this.view.push(item);
					viewName = item;
					view = $.su.viewManager.init(viewName);
					this._viewsMap[viewName] = view;
					view.addListener($.su.View.EVENT.WIDGET_RENDERED, function (e, widgetInfo, view) {
						_bindWidgetData.call(me, widgetInfo, view);
					});

					view.addListener($.su.View.EVENT.WIDGET_WILL_DESTROY, function (e, widget, view) {
						_unBindWidgetData.call(me, widget, view);
					});
				}
			}
		};

		Controller.prototype.initModels = function () {
			var settings = this.settings;
			var me = this;
			this.model = settings.models;
			if (this.model) {
				for (var i = 0; i < this.model.length; i++) {
					$.su.modelManager.init(this.model[i]);
				}
			}
		};

		Controller.prototype.initStores = function (settings) {
			var me = this;
			var settings = this.settings;
			this.store = settings.stores;
			if (this.store) {
				for (var i = 0; i < this.store.length; i++) {
					$.su.storeManager.init(this.store[i]);
				}
			}
		};

		Controller.prototype.initViewData = function () {
			var me = this;
			var settings = this.settings;
			var i;

			this.data.stores = {};
			this.data.models = {};
			this.data.views = {};

			if (this.store) {
				for (i = 0; i < this.store.length; i++) {
					this.data.stores[this.store[i]] = new $.su.StoreBind(this._getStore(this.store[i]));
				}
			}
			if (this.model) {
				for (i = 0; i < this.model.length; i++) {
					this.data.models[this.model[i]] = new $.su.ModelBind(this._getModel(this.model[i]));
				}
			}
			if (this.view) {
				for (i = 0; i < this.view.length; i++) {
					var viewName = this.view[i];
					var view = this._getView(viewName);
					this.data.views[viewName] = {};

					$.each(view.getWidgetsMap(), function (index, item) {
						$.each(item.attributes, function (key, value) {
							if (key.match(/data-(.+)/g)) {
								var dataBindObj = me._getAttrBind(value, viewName);
								if (!dataBindObj) {
									var dataBind = new $.su.DataFieldBind(new $.su.DataField());
									var bindName = value.replace(/[\{,\}]/g, '');
									me.data.views[viewName][bindName] = dataBind;
								}
							}
						});
					});

					/* to be deprecated*/
					// var scopeData = view.scopeData;
					// for(var item in scopeData){
					// 	if(scopeData.hasOwnProperty(item)){
					// 		var model = scopeData[item].model;
					// 		this.data.views[viewName][model] = new $.su.DataFieldBind(new $.su.Model.DataField());
					// 	}
					// }
				}
			}
		};

		Controller.prototype.configViews = function (configArr) {
			if (!$.isArray(configArr)) {
				configArr = [configArr];
			}

			for (var i = 0; i < configArr.length; i++) {
				var config = configArr[i];
				var viewName = config.id;
				var configItems = config.items;
				var view = this._getView(viewName);
				view.configChildrenWidgets(configItems);
			}
		};

		Controller.prototype.control = function (options) {
			var me = this;
			for (var obj in options) {
				if (options.hasOwnProperty(obj)) {
					for (var ev in options[obj]) {
						if (options[obj].hasOwnProperty(ev)) {
							var handler = options[obj][ev];

							if (typeof handler === 'string') {
								//<debug>
								if (!me[handler]) {
									throw new Error('No method named "' + handler + '"');
								}
								//</debug>
								handler = me[handler];
							}

							var tmp = (function (handler) {
								return function () {
									handler.apply(me, arguments);
								};
							})(handler);

							// $(obj).on(ev, tmp);
							var selectorArr = obj.split('=>');
							if (selectorArr.length == 1) {
								$(obj).on(ev, tmp);
							} else {
								if (selectorArr.length !== 2) {
									throw new Error('bindEvent error, incorrect selector format');
								}
								$(selectorArr[0]).delegate(selectorArr[1], ev, tmp);
							}

							if (!this.domEventsMap[obj]) {
								this.domEventsMap[obj] = {};
							}
							if (!this.domEventsMap[obj][ev]) {
								this.domEventsMap[obj][ev] = [];
							}
							this.domEventsMap[obj][ev].push({
								effectiveHandler: tmp,
								handler: handler
							});
						}
					}
				}
			}
		};

		Controller.prototype.unControl = function (options) {
			var me = this;
			for (var obj in options) {
				if (options.hasOwnProperty(obj)) {
					for (var ev in options[obj]) {
						if (options[obj].hasOwnProperty(ev)) {
							var selectorArr = obj.split('=>');
							var handler = options[obj][ev];

							if (typeof handler === 'string') {
								//<debug>
								if (!me[handler]) {
									throw new Error('No method named "' + handler + '"');
								}
								//</debug>
								handler = me[handler];
							}

							if (this.domEventsMap[obj] && this.domEventsMap[obj][ev]) {
								for (var i = this.domEventsMap[obj][ev].length - 1; i >= 0; i--) {
									if (this.domEventsMap[obj][ev][i].handler == handler) {
										if (selectorArr.length == 1) {
											$(obj).off(ev, this.domEventsMap[obj][ev][i].effectiveHandler);
										} else {
											if (selectorArr.length !== 2) {
												throw new Error('bindEvent error, incorrect selector format');
												break;
											}
											$(selectorArr[0]).undelegate(selectorArr[1], ev, this.domEventsMap[obj][ev][i].effectiveHandler);
										}
										this.domEventsMap[obj][ev].splice(i, 1);
										break;
									}
								}
							}
						}
					}
				}
			}
		};

		Controller.prototype.listen = function (options) {
			var me = this;
			for (var obj in options) {
				if (options.hasOwnProperty(obj)) {
					var viewData = $.su.getAttrObject(this.data, obj);

					if (!viewData) {
						var strArr = obj.split('.');
						if (strArr[0] === 'views' && this.data.views[strArr[1]] && strArr[2] !== undefined) {
							viewData = this.data.views[strArr[1]][strArr[2]] = new $.su.DataFieldBind(new $.su.DataField());
						}
					}

					for (var ev in options[obj]) {
						if (options[obj].hasOwnProperty(ev)) {
							var handler = options[obj][ev];

							if (typeof handler === 'string') {
								//<debug>
								if (!me[handler]) {
									throw new Error('No method named "' + handler + '"');
								}
								//</debug>
								handler = me[handler];
							}

							viewData.addListener(ev, handler, me);

							if (!this.dataEventsMap[obj]) {
								this.dataEventsMap[obj] = {};
							}
							if (!this.dataEventsMap[obj][ev]) {
								this.dataEventsMap[obj][ev] = [];
							}
							this.dataEventsMap[obj][ev].push(handler);
						}
					}
				}
			}
		};

		Controller.prototype.unListen = function (options) {
			var me = this;
			var index;
			for (var obj in options) {
				if (options.hasOwnProperty(obj)) {
					var viewData = $.su.getAttrObject(this.data, obj);
					for (var ev in options[obj]) {
						if (options[obj].hasOwnProperty(ev)) {
							var handler = options[obj][ev];

							if (typeof handler === 'string') {
								//<debug>
								if (!me[handler]) {
									throw new Error('No method named "' + handler + '"');
								}
								//</debug>
								handler = me[handler];
							}

							if (this.dataEventsMap[obj] && this.dataEventsMap[obj][ev]) {
								index = $.inArray(handler, this.dataEventsMap[obj][ev]);
								if (index >= 0) {
									viewData.removeListener(ev, handler, me);
									this.dataEventsMap[obj][ev].splice(index, 1);
								}
							}
						}
					}
				}
			}
		};

		Controller.prototype.addModel = function (models) {
			var model;
			if (!$.isArray(models)) {
				models = [models];
			}
			for (var i = 0, length = models.length; i < length; i++) {
				model = models[i];

				if ($.su.modelManager.getStatus(model)) {
					$.su.modelManager.init(model);
					this.model.push(model);
					this.data.models[model] = new $.su.ModelBind($.su.modelManager.get(model));
				} else if ($.su.storeManager.getStatus(model)) {
					$.su.storeManager.init(model);
					this.store.push(model);
					this.data.stores[model] = new $.su.StoreBind($.su.storeManager.get(model));
				} else {
					throw new Error('model not defined');
				}
			}
			// this.unbind
		};

		Controller.prototype.updateView = function (viewName, callback) {
			var dtd = $.Deferred();
			var me = this;
			var i, j;
			var promiseArray = [];
			var viewManager = $.su.viewManager;

			this.fireEvent('before_render');

			if (typeof viewName !== 'string') {
				callback = viewName;
				viewName = null;
			}

			if (!viewName) {
				this.unbindView();
				for (i = 0; i < this.view.length; i++) {
					var view = this._getView(this.view[i]);
					var container = view._container;
					viewManager.removeByID(view.getID());

					view = viewManager.init(this.view[i]);
					this._viewsMap[this.view[i]] = view;
					view.addListener($.su.View.EVENT.WIDGET_RENDERED, function (e, widgetInfo, view) {
						_bindWidgetData.call(me, widgetInfo, view);
					});

					view.addListener($.su.View.EVENT.WIDGET_WILL_DESTROY, function (e, widget, view) {
						_unBindWidgetData.call(me, widget, view);
					});
					view.setContainer(container);

					view.createChildrenWidgets();

					if (view.isEffective()) {
						promiseArray.push(view.render());
					}
				}

				$.when.apply(this, promiseArray).done(function () {
					_bindEvent.call(me);
					me.fireEvent('ev_after_views_render');
					dtd.resolve();
				});
			} else {
				this.unbindView(viewName);
				if ($.inArray(viewName, this.view) >= 0) {
					var view = this._getView(viewName);
					var container = view._container;
					viewManager.removeByID(view.getID());

					view = viewManager.init(viewName);
					this._viewsMap[viewName] = view;
					view.addListener($.su.View.EVENT.WIDGET_RENDERED, function (e, widgetInfo, view) {
						_bindWidgetData.call(me, widgetInfo, view);
					});

					view.addListener($.su.View.EVENT.WIDGET_WILL_DESTROY, function (e, widget, view) {
						_unBindWidgetData.call(me, widget, view);
					});
					view.setContainer(container);
					view.createChildrenWidgets();

					$.when(view.render()).done(function () {
						_bindEvent.call(me);
						me.fireEvent('ev_after_view_render', [viewName]);
						dtd.resolve();
					});
				}
			}
			return dtd.promise();
		};

		Controller.prototype._getStore = function (id) {
			if ($.inArray(id, this.store) >= 0) {
				return $.su.storeManager.get(id);
			} else {
				//console.error("Do not belone to this Controller!");
				return null;
			}
		};
		Controller.prototype._getModel = function (id) {
			if ($.inArray(id, this.model) >= 0) {
				return $.su.modelManager.get(id);
			} else {
				//console.error("Do not belone to this Controller!");
				return null;
			}
		};

		Controller.prototype._getView = function (name) {
			name = name || this.view[0]; //_default view
			return this._viewsMap[name];
		};

		Controller.prototype.getStore = function (name) {
			return this.data.stores[name];
		};
		Controller.prototype.getModel = function (name) {
			return this.data.models[name];
		};
		Controller.prototype.getView = function (name) {
			return this.data.views[name];
		};
		Controller.prototype.getEffectiveView = function () {
			for (var viewName in this.effectiveViewDatas) {
				if (this.effectiveViewDatas.hasOwnProperty(viewName) && this._getView(viewName).isEffective()) {
					return viewName;
				}
			}
		};

		Controller.prototype.viewsEffective = function () {
			for (var i = 0; i < this.view.length; i++) {
				if (!this._getView(this.view[i]).isEffective()) {
					return false;
				}
			}
			return true;
		};

		Controller.prototype.unbindView = function (viewName) {
			if (viewName && $.inArray(viewName, this.view) >= 0) {
				if (this.effectiveViewDatas[viewName]) {
					for (var i = 0; i < this.effectiveViewDatas[viewName].length; i++) {
						var viewObj = this.effectiveViewDatas[viewName][i].viewObj;
						var bind = this.effectiveViewDatas[viewName][i].bind;
						bind.unbindViewObj(viewObj);
					}
				}
				this.effectiveViewDatas[viewName] = [];
			} else {
				for (var j = 0; j < this.view.length; j++) {
					this.unbindView(this.view[j]);
				}
			}
		};

		Controller.prototype.destroy = function () {
			var me = this;
			Controller.superclass.destroy.call(this);
			_unbindEvent.call(this);
			$.each(this.dataEventsMap, function (dataStr, eventMap) {
				var viewData = $.su.getAttrObject(me.data, dataStr);
				$.each(eventMap, function (event, handlerArr) {
					for (var i = 0; i < handlerArr.length; i++) {
						viewData.removeListener(event, handlerArr[i], me);
					}
				});
			});

			// this.unbindView();

			var clearViewModel = function (viewModels) {
				for (var obj in viewModels) {
					if (viewModels.hasOwnProperty(obj)) {
						viewModels[obj].unbind();
					}
				}
			};

			for (var viewData in this.data.views) {
				if (this.data.views.hasOwnProperty(viewData)) {
					clearViewModel(this.data.views[viewData]);
				}
			}

			for (var viewName in this._viewsMap) {
				if (this._viewsMap.hasOwnProperty(viewName)) {
					var view = this._getView(viewName);
					view.clear();
					$.su.viewManager.removeByID(view.getID());
				}
			}

			clearViewModel(this.data.models);
			clearViewModel(this.data.stores);

			this.data.views = {};
			this.data.models = {};
			this.data.stores = {};

			this.effectiveViewDatas = {};

			// this.fireEvent("ev_controller_destroy", this.name);
		};

		return Controller;
	})();
})(jQuery);
