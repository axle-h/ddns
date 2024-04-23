$.su.Navigator = (function () {
	var defaults = {};

	var _map = {};

	var Navigator = function (options) {
		this.settings = $.extend({}, defaults, options);
		this.container = $(options.container);
		this.moduleContainerWidget = options.moduleContainerWidget || 'panel';
		this.service = options.service;
		this.name = 'navigator';
		$.su.Service.call(this);
	};

	$.su.inherit($.su.Service, Navigator);

	Navigator.prototype.setMenu = function () {};

	Navigator.prototype.getMenu = function () {};

	Navigator.prototype.getMenuList = function () {};

	Navigator.prototype.goto = function () {};

	Navigator.prototype.set = function (options) {
		_map = options;
	};

	Navigator.prototype.setContainer = function (container) {
		this.container = $(container).htmlLoader();
	};

	Navigator.prototype.load = function (name) {
		var moduleLoader = this.service.moduleLoader;
		var loading = this.service.loading;
		var childrenLength = $.su.getObjectLength(_map[name]);

		moduleLoader.unLoad(this.container);

		moduleLoader.load(
			{
				module: 'index'
				// view: null
			},
			{
				module: 'page',
				view: name
			},
			this.container,
			function () {
				setTimeout(function () {
					loading.hide(name);
				}, 0);
			},
			childrenLength
		);
	};

	Navigator.prototype.destroy = function () {};

	return Navigator;
})();
