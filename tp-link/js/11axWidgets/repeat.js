/*
 * @description  repeat directive, classify it to widget temporary.
 * @author  KYJ
 * @change
 *   2017/06/21: create file, this version ignore data binding
 *
 * */
(function ($) {
	var Repeat = $.su.Widget.register('repeat', {
		settings: {
			items: {
				attribute: 'items',
				defaultValue: []
			},
			itemWidget: {
				attribute: 'item-widget',
				defaultValue: null
			},
			itemDom: {
				attribute: 'item-dom',
				defaultValue: null
			},
			itemDataLoader: {
				attribute: 'item-data-loader',
				defaultValue: 'loadData'
			},
			autoRenderAllItems: {
				defaultValue: true
			},
			itemCls: {
				attribute: 'item-cls',
				defaultValue: ''
			}
		},

		init: function () {
			this.repeatId = $.su.randomId('repeat-');
			// this.repeatViewObjs = [];
			this._keys = [];
			this._renderedItems = [];
		},

		render: function () {
			var me = this;
			var _this = this.dom();
			var settings = this.settings;

			_this.addClass('repeat-container');

			if (!settings.itemWidget && !settings.itemRender) {
				_this.wrapInner(function () {
					return '<div class="repeat-item ' + settings.itemCls + '"></div>';
				});

				this.initItem = _this.find('.repeat-item');
				this.itemModel = this.initItem.clone();
				var widgetArr = [];
				this.initItem.find('[widget]').each(function (index, ele) {
					widgetArr.push($(ele).data('viewObj'));
				});
				$.each(widgetArr, function (index, item) {
					item._destroy(); //unRegister from parent View
				});
				this.initItem.detach();
			}
		},

		clearItems: function () {},

		syncData: function (keys, callback) {
			this._keys = keys;
			$.each(this._renderedItems, function (index, item) {
				item.obj.dom().remove();
			});
			this.dom().empty();
			this._renderedItems = [];
			if (this.settings.autoRenderAllItems) {
				this.dom().triggerHandler('ev_store_render_items', [keys]);
			}
		},

		setItemRender: function (fn) {
			this.settings.itemRender = fn;
		},

		renderModels: function (keyProperty, models, callback) {
			var me = this;
			var _this = this.dom();
			var settings = this.settings;

			var itemWidget = settings.itemWidget;
			var tagName = _this.attr('tagName');

			//other situation need to be added
			if (itemWidget) {
				var itemModel = _this.clone(false);
				var dataLoader = settings.itemDataLoader;

				itemModel.removeAttr('id');
				itemModel.removeAttr('item-Widget');
				itemModel.removeAttr('item-dom');
				itemModel.removeAttr('item-data-loader');
				itemModel.removeAttr('data-bind');
				itemModel.removeClass('repeat-container');
				itemModel.attr('widget', itemWidget);
				itemModel.attr('repeat-id', this.repeatId);

				for (var i = 0; i < models.length; i++) {
					var itemData = models[i].getData();
					var newItem = itemModel.clone(false);
					newItem.attr('id', $.su.randomId('widget-'));
					_this.append(newItem);
					var newItemViewObj = new $.su.widgets[itemWidget]({
						id: newItem,
						view: me._view
					});
					newItemViewObj.render(); //render
					if (dataLoader) {
						newItemViewObj[dataLoader](itemData);
					}
					this._renderedItems.push({
						key: models[i][keyProperty].getValue(),
						obj: newItemViewObj
					});
				}
				!!callback && callback(this._renderedItems);
			} else if (settings.itemRender) {
				for (var i = 0; i < models.length; i++) {
					var itemData = models[i].getData();
					var key = models[i][keyProperty].getValue();
					var ret = settings.itemRender.call(this, key, itemData);
					var itemDom = $(ret);
					itemDom.on(
						'click',
						(function (key, itemData) {
							return function () {
								_this.trigger('ev_item_click', [key, itemData]);
							};
						})(key, itemData)
					);
					_this.append(itemDom);

					var itemViewObj = new $.su.widgets.repeatItem({ id: itemDom });
					itemViewObj.render(); //render
					this._renderedItems.push({
						key: key,
						obj: itemViewObj
					});
				}
				!!callback && callback(this._renderedItems);
			} else {
				for (var i = 0; i < models.length; i++) {
					var newItem = this.itemModel.clone(false);
					// newItem.show();
					newItem.attr('id', $.su.randomId('widget-'));

					newItem.find('[id]').each(function (index, ele) {
						var eleObj = $(ele);
						eleObj.attr('id', $.su.randomId('widget-'));
					});

					_this.append(newItem);

					var newItemViewObj = new $.su.widgets.repeatItem({ id: newItem });

					newItem.find('[widget]').each(function (index, ele) {
						var eleObj = $(ele);
						var widget = eleObj.attr('widget');
						new $.su.widgets[widget]({
							id: eleObj,
							view: me._view
						}).render();
					});

					newItemViewObj.render(); //render
					this._renderedItems.push({
						key: models[i][keyProperty].getValue(),
						obj: newItemViewObj
					});
				}
				!!callback && callback(this._renderedItems);
			}
		},

		remove: function (key) {
			var i, len;
			var items = this._renderedItems;

			if (key) {
				for (i = items.length - 1; i >= 0; i--) {
					if (items[i].key === key) {
						items[i].obj._destroy();
						items.splice(i, 1);
					}
				}
			} else {
				for (i = 0, len = items.length; i < len; i++) {
					items[i].obj._destroy();
				}
				items.length = 0;
			}
		},

		each: function (dealer) {
			for (var i = 0; i < this._renderedItems.length; i++) {
				var itemViewObj = this._renderedItems[i];
				if (dealer(itemViewObj) === false) {
					//break if one item return false
					return;
				}
			}
		},

		/*
		 * @method find specific item
		 * @params condition[function]: function which return true when given the right item
		 * @return array[@class viewObj]: the specific items
		 *
		 * */
		find: function (condition) {
			var ret = [];
			if (typeof condition !== 'function') {
				return false;
			}
			for (var i = 0; i < this._renderedItems.length; i++) {
				var itemViewObj = this._renderedItems[i].obj;
				if (condition(itemViewObj)) {
					ret.push(itemViewObj);
				}
			}
			return ret;
		}
	});
})(jQuery);
