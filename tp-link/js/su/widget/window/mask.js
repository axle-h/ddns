(function () {
	var Mask = $.su.Widget.register('mask', {
		settings: {},
		init: function () {},
		render: function () {
			var _this = this.dom();
			_this.addClass('mask');
			this.useMap = {};
			this.hide();
		},
		show: function (id) {
			var _this = this.dom();

			if (id && !this.useMap.hasOwnProperty(id)) {
				this.useMap[id] = true;
				_this.show().addClass(id);
				this.resetZIndex();
			}
		},
		hide: function (id) {
			var _this = this.dom();

			if (id === false) {
				_this.hide().removeClass().addClass('mask');
			} else {
				if (this.useMap.hasOwnProperty(id)) {
					delete this.useMap[id];
					_this.removeClass(id);
				}
				this.resetZIndex();
				if (!this.checkUse()) {
					_this.hide();
				}
			}
			this.resetZIndex();
			if (!this.checkUse()) {
				_this.hide();
			}
		},
		getMaxZIndex: function () {
			var maxZ = 0;
			var inUse = false;
			for (var i in this.useMap) {
				if (this.useMap.hasOwnProperty(i)) {
					inUse = true;
					var tempZ = parseInt($('#' + i).css('zIndex'));
					if (tempZ > maxZ) {
						maxZ = tempZ;
					}
				}
			}
			if (!inUse || maxZ == 0) {
				maxZ = 998;
			}
			return maxZ;
		},
		resetZIndex: function () {
			var maxZ = this.getMaxZIndex();
			this.dom().css({
				zIndex: maxZ
			});
		},
		checkUse: function () {
			for (var i in this.useMap) {
				if (this.useMap.hasOwnProperty(i)) {
					return true;
				}
				return false;
			}
		}
	});
})();
