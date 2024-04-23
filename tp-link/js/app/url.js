(function ($) {
	$.su = $.su || {};

	$.su.url = function (url) {
		function UrlObj() {}
		UrlObj.prototype.toString = function () {
			return $.su.url.subs + $.su.url.stok + url;
		};
		return new UrlObj();
	};

	$.su.ozkerurl = function (url) {
		var url = $.su.url.ozkersubs + $.su.url.stok + url;
		return url;
	};

	$.su.url.ozkersubs = '/cgi-bin/ozker/;stok=';

	$.su.url.subs = '/cgi-bin/luci/;stok=';

	$.su.url.stok = '';

	$.su.development = false;
})(jQuery);
