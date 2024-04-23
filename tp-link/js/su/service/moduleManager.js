(function ($) {
	$.su = $.su || {};

	$.su.Services = $.su.Services || {};

	//service
	$.su.Services.ModuleManager = (function () {
		var ModuleManager = function () {
			if (typeof ModuleManager.instance === 'object') {
				return ModuleManager.instance;
			}

			this.name = 'moduleManager';
			$.su.Service.call(this);

			ModuleManager.instance = this;
		};

		$.su.inherit($.su.Service, ModuleManager);

		/*
		 * option:
		 *   url: url
		 *   success:
		 *   fail:
		 *   error:
		 *
		 * */
		// ModuleManager.prototype.getStatus = function(name){
		//     return $.su.moduleManager.getStatus(name);
		// };

		ModuleManager.prototype.launch = function (name, callback) {
			$.su.moduleManager.launch(name, callback);
		};

		ModuleManager.prototype.get = function (name) {
			var queryResult = $.su.moduleManager.query(name);
			if (queryResult instanceof $.su.Module) {
				return queryResult;
			} else {
				return false;
			}
		};

		ModuleManager.prototype.getStatus = function (name) {
			return $.su.moduleManager.getStatus(name);
		};

		ModuleManager.prototype.hasModule = function (name) {
			return $.su.moduleManager.getStatus(name) !== false;
		};
		return ModuleManager;
	})();
})(jQuery);
