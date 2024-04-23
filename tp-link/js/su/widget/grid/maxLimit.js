(function () {
	var MaxLimit = $.su.Widget.register('maxLimit', {
		settings: {},
		listeners: [],
		init: function (options) {
			this.limit = 0;
			this.settings = $.extend(
				{},
				this.settings,
				{
					objs: options.objs
				},
				options.configs.maxLimit
			);
		},
		render: function () {
			var _this = this.dom();
			var grid = this.settings.objs.grid;
			var wrap = _this.parent().find('div.grid-limit-container');

			var inHTML = '<span>' + $.su.CHAR.GRID.MAX_LIMIT + ': <span class="limit-num"></span></span>';

			_this.append(inHTML).addClass('grid-limit-bar-container');
			wrap.removeClass('hidden').append(_this);
		},
		setLimit: function (num) {
			if ($.type(num) !== 'number') {
				return false;
			}
			this.limit = num;
			var _this = this.dom();
			_this.find('.limit-num').text(num);
			return true;
		},
		getLimit: function () {
			return this.limit;
		}
	});
})();
