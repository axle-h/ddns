/*
 * @description  repeatItem widget.
 * @author  KYJ
 * @change
 *   2018/02/04: create file
 *
 * */
(function ($) {
	var RepeatItem = $.su.Widget.register('repeatItem', {
		extend: 'form',
		remove: function () {
			var _this = this.dom();
			_this.find('[widget]').each(function (index, ele) {
				var eleObj = $(ele).data('viewObj');
				!!eleObj && eleObj._destroy();
			});
			_this.remove();
			this.settings = null;
			!!this._view && this._view.removeChildWidget(this);
		}
	});
})(jQuery);
