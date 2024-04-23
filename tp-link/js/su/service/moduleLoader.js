(function ($) {
	$.su = $.su || {};

	$.su.Services = $.su.Services || {};

	/*
	 * @service ModuleLoader
	 * */
	$.su.Services.ModuleLoader = (function () {
		var ModuleLoader = function () {
			if (typeof ModuleLoader.instance === 'object') {
				return ModuleLoader.instance;
			}

			this.name = 'moduleLoader';
			$.su.Service.call(this);

			ModuleLoader.instance = this;

			this._map = {};
			this.loadingModule = {};
		};

		$.su.inherit($.su.Service, ModuleLoader);

		var _searchViewInfo = function (arr, id) {
			return arr[id];
		};

		var generateMapItemID = function (module, view) {
			return module + '_' + view;
		};

		ModuleLoader.prototype.load = function (parentViewInfo, childViewInfo, htmlLoader, callback) {
			var me = this;
			this.isBusy = true;
			var parentViewModule = parentViewInfo.module;
			var parentView = parentViewInfo.view || $.su.moduleManager.query(parentViewModule).view[0];
			var parentId = generateMapItemID(parentViewModule, parentView);
			var parentItem = _searchViewInfo(this._map, parentId);
			var childViewModule = childViewInfo.module;

			var timeStamp = $.su.randomId('timestamp');
			this.loadingModule[childViewModule] = this.loadingModule[childViewModule] || {};
			$.each(this.loadingModule[childViewModule], function (timestamp, state) {
				// 取消前面的load过程
				delete me.loadingModule[childViewModule][timestamp];
			});
			this.loadingModule[childViewModule][timeStamp] = 'running';

			if (!parentItem) {
				this._map[parentId] = {
					id: parentId,
					module: parentViewModule,
					view: parentView,
					children: [],
					htmlLoader: null,
					parent: null
				};
				parentItem = this._map[parentId];
			}
			me.unLoad(htmlLoader);

			$.su.moduleManager.load(childViewModule, function () {
				if (!me.loadingModule[childViewModule][timeStamp]) {
					// when A->B repeatly, the second loading may not launch because it's status is 'running'
					// so ignore the first launch
					return;
				}
				if (htmlLoader.dataObj === null) {
					// when A->B->C repeatly, htmlLoader in B may be unloaded (in second time)
					// then B->C throws error (in first time)
					// so cancel the first loading
					return;
				}
				var childModule = $.su.moduleManager.query(childViewModule);
				var childView = childViewInfo.view || $.su.moduleManager.query(childViewModule).view[0];
				var childId = generateMapItemID(childViewModule, childView);

				if (!me._map[childId]) {
					me._map[childId] = {
						id: childId,
						module: childViewModule,
						view: childView,
						children: [],
						htmlLoader: null,
						parent: parentId
					};
				} else {
					if (me._map[childId].htmlLoader) {
						me.unLoad(me._map[childId].htmlLoader);
					}
				}
				me._map[childId].htmlLoader = htmlLoader;
				if (!($.inArray(childId, parentItem.children) >= 0)) {
					parentItem.children.push(childId);
				}
				var container = htmlLoader.viewObjs ? htmlLoader.viewObjs[0] : htmlLoader;
				childModule._getView(childViewInfo.view).setContainer(container);
				childModule.load(function () {
					delete me.loadingModule[childViewModule][timeStamp];
					var currentChildModule = $.su.moduleManager.query(childViewModule);
					me.initEmitter(container, currentChildModule);
					!!callback && callback(currentChildModule);
				});
				me.isBusy = false;
			});
		};

		ModuleLoader.prototype.unLoad = function (htmlLoader) {
			var _notifyItemModule = function (map, item) {
				var moduleName = map[item].module;
				var module = $.su.moduleManager.query(moduleName);
				var children = map[item].children.slice(0);
				if (children && children.length > 0) {
					for (var i = 0; i < children.length; i++) {
						_notifyItemModule(map, children[i]);
					}
				}

				!!module.fireEvent && module.fireEvent('ev_before_view_unload', [map[item].view]);

				if (module) {
					module.fireEvent('ev_view_unload', [map[item].view]);
				}

				if (map[item].htmlLoader !== null) {
					map[item].htmlLoader.load('');
				}
				map[item].children = [];
				map[item].htmlLoader = null;
				if (map[item].parent) {
					var parentInfoNode = _searchViewInfo(map, map[item].parent);
					var index = $.inArray(item, parentInfoNode.children);
					if (index >= 0) {
						parentInfoNode.children.splice(index, 1);
					}
				}
			};

			for (var item in this._map) {
				if (this._map.hasOwnProperty(item)) {
					if (this._map[item].htmlLoader === htmlLoader) {
						_notifyItemModule(this._map, item);
					}
				}
			}
		};

		ModuleLoader.prototype.initEmitter = function (htmlContainer, module) {
			var me = htmlContainer;

			if (!module) {
				return;
			}

			var oldTrigger = module.trigger;

			module.trigger = function () {
				var args = [].slice.call(arguments, 0);
				var exec = oldTrigger.apply(module, args);
				if (!exec) {
					for (var i = 0; i < me.dataBind.length; i++) {
						me.dataBind[i].trigger.apply(me.dataBind[i], args);
					}
				}
			};
		};

		return ModuleLoader;
	})();
})(jQuery);
