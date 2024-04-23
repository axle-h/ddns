(function ($) {
	$.su = $.su || {};
	$.su.Language = (function () {
		var getDefaults = function () {
			return {
				locale: 'en_US',
				URL_LAN_CHECK: $.su.url('/locale?form=lang'),
				DEFAULT_LAN_TYPE: 'en_US',
				URL_JS: './locale/%LAN_TYPE%/lan.js',
				URL_CSS: './locale/%LAN_TYPE%/lan.css',
				URL_HELP: './locale/%LAN_TYPE%/help.js'
			};
		};

		var Language = function (options) {
			this.settings = $.extend({}, getDefaults(), options);
			this.init();
		};

		Language.prototype.init = function () {
			this.getLocale();
		};

		Language.prototype.getLocale = function (callback_success, callback_failed) {
			var that = this;
			var settings = this.settings;

			var URL_LAN_CHECK = settings.URL_LAN_CHECK["default"];

			$.ajax({
				type: 'GET',
				url: URL_LAN_CHECK,
				async: false,
				dataType: 'json',
				data: {
					operation: 'read'
				},
				success: function (data) {
					if (data.success && data.data && data.data.locale) {
						that.changeType(data.data);
					} else {
						that.reset();
					}

					if (callback_success) {
						callback_success.call(that, data.data);
					}
				},
				error: function () {
					that.reset();
					if (callback_failed) {
						callback_failed.call(that);
					}
				}
			});
		};

		Language.prototype.defineGlobal = function () {};

		Language.prototype.getDeviceLanguage = function () {};

		Language.prototype.getClientLanguage = function () {};

		Language.prototype.reset = function () {
			this.changeType({
				locale: this.settings.DEFAULT_LAN_TYPE,
				force: false,
				model: '',
				region: '',
				rebootTime: 0
			});
		};

		Language.prototype.switchTo = function (lanType, callback_success, callback_failed) {
			var that = this;
			var settings = this.settings;

			if (!lanType) {
				return;
			}

			var URL_LAN_CHECK = settings.URL_LAN_CHECK;

			$.ajax({
				type: 'POST',
				url: URL_LAN_CHECK,
				async: false,
				dataType: 'json',
				cache: false,
				data: {
					operation: 'write',
					locale: lanType
				},
				success: function (data) {
					location.reload();
					if (callback_success) {
						callback_success.call(that);
					}
				},
				error: function () {
					that.reset();
					if (callback_failed) {
						callback_failed.call(that);
					}
				}
			});
		};

		Language.prototype.changeType = function (data) {
			var settings = this.settings,
				lanType = data.locale || settings.DEFAULT_LAN_TYPE;

			var URL_JS = settings.URL_JS.replace('%LAN_TYPE%', lanType);
			var URL_CSS = settings.URL_CSS.replace('%LAN_TYPE%', lanType);
			var URL_HELP = settings.URL_HELP.replace('%LAN_TYPE%', lanType);

			$('script#lan-js').remove();
			$('link#lan-css').remove();
			$('script#lan-help').remove();

			$('head')
				.append('<script id="lan-js" type="text/javascript" src="' + URL_JS + ' "></script>')
				.append('<link id="lan-css" type="text/css" rel="stylesheet" href="' + URL_CSS + ' "/>')
				.append('<script id="lan-help" type="text/javascript" src="' + URL_HELP + ' "></script>')
				.append('<script type="text/javascript" src="./locale/language.js" ></script>');
		};

		return Language;
	})();
})(jQuery);
