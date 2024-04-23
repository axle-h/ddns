(function ($) {
	$.su = $.su || {};

	//service
	$.su.Service = (function () {
		var Service = function () {
			if (typeof this.constructor.instance === 'object') {
				return this.constructor.instance;
			}

			$.su.Observable.call(this);

			this.constructor.instance = this;

			$.su.serviceManager.register(this.name, this);
		};

		$.su.inherit($.su.Observable, Service);

		return Service;
	})();
})(jQuery);
