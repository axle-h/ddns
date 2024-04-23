(function ($) {
	$.su.ServiceManager = (function () {
		var ServiceManager = function () {
			$.su.Manager.call(this);
			this.type = $.su.Service;
		};
		$.su.inherit($.su.Manager, ServiceManager);

		ServiceManager.prototype.register = function (name, service) {
			if (this._map[name]) {
				return this._map[name];
			}
			this._map[name] = service;
		};

		ServiceManager.prototype.get = function (name) {
			if (this._map[name]) {
				return this._map[name];
			}
			return null;
		};

		return ServiceManager;
	})();
})(jQuery);
