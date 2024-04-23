$.su.LanguageService = (function () {
	var Language = function () {
		this.init();
		this.name = 'language';
		$.su.Service.call(this);
	};

	$.su.inherit($.su.Service, Language);

	Language.prototype.init = function () {};

	Language.prototype.getLocale = function (callback_success, callback_failed) {
		$.su.language.getLocale(callback_success, callback_failed);
	};

	Language.prototype.switchTo = function (lanType, callback_success, callback_failed) {
		$.su.language.switchTo(lanType, callback_success, callback_failed);
	};

	return Language;
})();
