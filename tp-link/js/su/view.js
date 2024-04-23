(function ($) {
	$.su.View = (function () {
		var View = function (name, options) {
			$.su.Observable.call(this, options);

			this._id = $.su.randomId('view');
			this._name = name;
			this._childrenWidgets = {};
			this._DOM = typeof options === 'string' ? $(options) : options.clone();
			this._container = null;

			_init.call(this);
		};

		$.su.inherit($.su.Observable, View);

		var EVENT = {
			WIDGET_RENDERED: 'ev_view_widget_rendered',
			WIDGET_CREATED: 'ev_view_widget_created',
			WIDGET_WILL_DESTROY: 'ev_view_widget_will_destroy'
		};

		var _init = function () {
			var widgetDivArray = this._DOM.find('[widget]');

			if (widgetDivArray.length !== 0) {
				for (var index = 0; index < widgetDivArray.length; index++) {
					var item = widgetDivArray[index];
					var id = item.id;

					if (!id) {
						item.id = id = $.su.randomId('widget-');
					}
					this._childrenWidgets[id] = {
						attributes: View.transWidgetOptions(item.attributes), //
						config: null,
						instance: null
					};
				}
			}
		};

		/*
		 * @method _transWidgetOptions: trans DOM attributes to plain object
		 *   - the logic of serching info from view config is deprecated
		 * @static
		 * */
		View.transWidgetOptions = function (attributes) {
			var options = {};
			for (var i = 0; i < attributes.length; i++) {
				var value = attributes[i].nodeValue;
				var testStr = '{' + this._name + '.';

				options[attributes[i].nodeName] = value;

				/* the logic of serching info from view config is deprecated */
				// if(typeof value == "string" && value.indexOf(testStr) === 0){
				// 	options[attributes[i].nodeName] = $.su.clone($.su.getAttrObject(this.settings, value.substring(testStr.length)));
				// }else{
				// 	options[attributes[i].nodeName] = value;
				// }
			}
			return options;
		};

		// View.prototype.setHTMLStr = function(string){
		// 	this._HTMLStr = string;
		// };

		View.prototype.getChild = function (id) {
			return this._childrenWidgets[id].instance;
		};

		View.prototype.getWidgetsMap = function () {
			return this._childrenWidgets;
		};

		View.prototype.getName = function () {
			return this._name;
		};

		View.prototype.getID = function () {
			return this._id;
		};

		View.prototype.dom = function () {
			return this._DOM;
		};

		View.prototype.isEffective = function () {
			var dom = $('div[view="{' + this._name + '}"]');
			if (dom.length === 0) {
				return false;
			} else {
				return true;
			}
		};

		/*
		 * @method configChildrenWidgets
		 *          ! scopeData field need to be deleted in the next SU version
		 * @param configArr {array}
		 * */
		View.prototype.configChildrenWidgets = function (configArr) {
			if (!configArr) {
				return;
			}

			// var childrenWidgetsConfigs = {};
			// childrenWidgetsConfigs.scopeData = {};
			for (var i = 0; i < configArr.length; i++) {
				var itemID = configArr[i].id;
				var childrenWidgetsMapNode = this._childrenWidgets[itemID];
				if (childrenWidgetsMapNode) {
					childrenWidgetsMapNode.config = configArr[i];

					/* compatibility for old interface(views: configs: model: modelXXX)
					 * delete this when switch to new interface
					 * */
					if (configArr[i].model) {
						childrenWidgetsMapNode.attributes['data-bind'] = configArr[i].model;
					}
				}
				// this._childrenWidgets.[itemID] = configArr[i];
				// if(configArr[i].model){
				// 	childrenWidgetsConfigs.scopeData[itemID] = configArr[i];
				// }
			}
			// this.childrenWidgetsConfigs = childrenWidgetsConfigs;
		};

		View.prototype.clear = function () {
			for (var item in this._childrenWidgets) {
				if (this._childrenWidgets.hasOwnProperty(item)) {
					this._childrenWidgets[item].instance && this._childrenWidgets[item].instance._destroy();
				}
			}
			this._childrenWidgets = {};
		};

		/*
		 * @method createChildrenWidgets: init all widgets instance(! not rendered)
		 * */
		View.prototype.createChildrenWidgets = function () {
			for (var item in this._childrenWidgets) {
				if (this._childrenWidgets.hasOwnProperty(item)) {
					var id = item;
					var viewObj = null;
					var childrenWidgetsMapNode = this._childrenWidgets[id];
					if ($('#' + id).data('viewObj')) {
						childrenWidgetsMapNode.instance = $('#' + id).data('viewObj');
					} else {
						var options = $.extend(true, {}, childrenWidgetsMapNode.attributes, childrenWidgetsMapNode.config);
						var widgetName = options.widget;
						if ($.su.widgets[widgetName]) {
							viewObj = new $.su.widgets[widgetName]({
								id: id,
								view: this,
								settings: options
							});
						}
						childrenWidgetsMapNode.instance = viewObj;
					}
					this.fireEvent(EVENT.WIDGET_CREATED, [childrenWidgetsMapNode, this]);
				}
			}
		};

		View.prototype.setContainer = function (container) {
			this._container = container;
			!!container.load && container.load(this._DOM);
		};

		View.prototype.render = function () {
			var me = this;
			var promiseArray = [];
			var dtd = $.Deferred();

			if ($.su.getObjectLength(this._childrenWidgets) == 0) {
				dtd.resolve();
				return dtd.promise();
			}

			var childrenWidgets = $.extend({}, this._childrenWidgets);
			$.each(childrenWidgets, function (id, widgetInfo) {
				if (childrenWidgets.hasOwnProperty(id) && me._childrenWidgets.hasOwnProperty(id)) {
					promiseArray.push(widgetInfo.instance.render());
				}
			});

			$.when.apply(this, promiseArray).done(function () {
				me.rendered = true;
				dtd.resolve();
			});

			return dtd.promise();
		};

		View.prototype.removeChildWidget = function (itemArr) {
			if (!$.isArray(itemArr)) {
				itemArr = [itemArr];
			}
			for (var i = 0; i < itemArr.length; i++) {
				var id = itemArr[i].domId;
				this.fireEvent(EVENT.WIDGET_WILL_DESTROY, [itemArr[i], this]);
				this._childrenWidgets[id] = null;
				delete this._childrenWidgets[id];
			}
		};

		View.prototype.addChildWidget = function (itemArr) {
			if (!$.isArray(itemArr)) {
				itemArr = [itemArr];
			}
			for (var i = 0; i < itemArr.length; i++) {
				var id = itemArr[i].domId;
				if (!this._childrenWidgets[id]) {
					this._childrenWidgets[id] = {
						instance: itemArr[i],
						attributes: View.transWidgetOptions(itemArr[i].dom().get(0).attributes)
					};
				}
			}
		};

		View.prototype.onChildWidgetRendered = function (widgetObj) {
			var id = widgetObj.domId;
			this.fireEvent(EVENT.WIDGET_RENDERED, [this._childrenWidgets[id], this]);
		};

		View.prototype.destroy = function () {
			View.superclass.destroy.call(this);

			delete this._id;
			delete this._name;
			delete this._childrenWidgets;
			this._DOM.remove();
			delete this._DOM;
			delete this._container;
		};
		View.EVENT = EVENT;

		return View;
	})();
})(jQuery);
