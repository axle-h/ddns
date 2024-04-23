(function ($) {
	$.su.ViewManager = (function () {
		var ViewManager = function () {
			$.su.Manager.call(this);
			this.type = $.su.View;
		};
		$.su.inherit($.su.Manager, ViewManager);

		ViewManager.prototype.init = function (name) {
			var info = this._infoMap[name];
			var instance = new $.su.View(name, this._infoMap[name].DOM);
			var instanceID = instance.getID();
			this._map[instanceID] = instance;
			return instance;
		};

		/*
		 * @method _dealViewFile : find all the views info in the file string, and register the info
		 *      this need to be tested in Firefox, considering the use of 'outerHTML' attribute
		 * @param string {string}: the string
		 *
		 * */
		var _dealViewFile = function (string) {
			var me = this;
			$(string)
				.filter('[view]')
				.each(function (index, ele) {
					var item = $(ele);
					var name = item.attr('view').replace(/[\{,\}]/g, '');
					me.define(name, $(ele));
				});
		};

		/*
		 * @method define : register the construction info of a view class
		 * @param name {string}: view's name
		 * @param option {object}: view's dom template(jquery object for current)
		 * */
		ViewManager.prototype.define = function (name, option) {
			if (this._infoMap[name]) {
				return;
			}

			this._infoMap[name] = {
				DOM: option,
				status: 'defined' //defined, inited,
			};
		};

		ViewManager.prototype.isDefined = function (name, moduleName) {
			if (this._infoMap[name]) {
				return true;
			}
			return false;
		};

		ViewManager.prototype.loadDefine = function (name, moduleName, callback) {
			var me = this;
			$.su.router.loadView(moduleName, name, function (data) {
				_dealViewFile.call(me, data);
				!!callback && callback();
			});
		};

		//make sure the view is loaded
		ViewManager.prototype.get = function (option) {
			var id = typeof option == 'string' ? option : option.id;

			if (this._map[id]) {
				return this._map[id];
			}
		};

		ViewManager.prototype.removeByID = function (id) {
			if (this._map[id]) {
				this._map[id].destroy();
				delete this._map[id];
			}
		};

		return ViewManager;
	})();
})(jQuery);
