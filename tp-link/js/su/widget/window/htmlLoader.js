(function () {
	var HtmlLoader = $.su.Widget.register('htmlLoader', {
		settings: {
			// scroll: {
			//     attribute: "data-scroll",
			//     defaultValue: null
			// }
		},

		init: function () {},

		render: function () {
			var _this = this.dom();
			var settings = this.settings;
			_this.addClass(settings.cls + 'html-loader-container');
			// if (settings.scroll && $.su.scrollbar) {
			// 	    $.su.scrollbar({ele: _this[0]});
			// }
		},

		load: function (content, callback) {
			var container = this.getContainer();
			if (!container) {
				return;
			}
			if ($.type(content) === 'object') {
				container.append(content);
			} else if ($.type(content) === 'string') {
				container.html(content);
			}
			!!callback && callback();
		},

		unload: function () {}
	});
})();
