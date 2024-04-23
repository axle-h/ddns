(function () {
	$.su.scrollbar = function (obj, fn) {
		if ($.su.isMobile()) {
			return;
		} else if (navigator.appName === 'Microsoft Internet Explorer') {
			if ((navigator.userAgent.match(/Trident/i) && navigator.userAgent.match(/MSIE 8.0/i)) || navigator.userAgent.match(/MSIE 9.0/i)) {
				return;
			}
		}

		if ($.su.scrollbar.loaded) {
			initScrollbar(obj, fn);
		} else {
			$.su.router.loadFile('js/libs/perfect-scrollbar.min.js', function () {
				initScrollbar(obj, fn);
				$.su.scrollbar.loaded = true;
			});
		}
	};
	$.su.scrollbar.loaded = false;
	function initScrollbar(obj, fn) {
		var defaultOptions = {
			wheelPropagation: true,
			scrollXMarginOffset: 5
		};
		if ($(obj.ele).length > 0) {
			if (!$(obj.ele).data('ps')) {
				var ps;
				obj.opts = $.extend(obj.opts, defaultOptions);
				ps = new PerfectScrollbar(obj.ele, obj.opts);
				$(obj.ele).data('ps', ps);
				!!fn && fn(ps);
			} else {
				$(obj.ele).data('ps').update();
			}
		}
	}
})();
