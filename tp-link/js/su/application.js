$.su.Application = (function () {
	var defaults = {};

	var Application = function () {
		$.su.Controller.call(this);
		$.su.modelManager = new $.su.ModelManager();
		$.su.moduleManager = new $.su.ModuleManager();
		$.su.storeManager = new $.su.StoreManager();
		$.su.viewManager = new $.su.ViewManager();
		$.su.serviceManager = new $.su.ServiceManager();

		this.modelManager = $.su.modelManager;
		this.moduleManager = $.su.moduleManager;
		this.storeManager = $.su.storeManager;
		this.viewManager = $.su.viewManager;
		this.serviceManager = $.su.serviceManager;

		this.container = null;
	};

	$.su.inherit($.su.Controller, Application);

	Application.prototype.setContainer = function (selector) {
		this.container = selector;
	};

	Application.prototype.init = function () {};

	Application.prototype.launch = function (selector) {
		var me = this;
		if (this.container) {
			var htmlLoader = new $.su.widgets.htmlLoader({ id: this.container });
			$.when(htmlLoader.render()).done(function () {
				$.su.moduleManager.load('main', function () {
					var mainModule = $.su.moduleManager.query('main');
					mainModule._getView().setContainer(htmlLoader);
					mainModule.load();
				});
				// htmlLoader.load({name: "main"}, function(){
				// 	me.moduleManager.launch("main");
				// });
			});
		}
	};

	return Application;
})(jQuery);
