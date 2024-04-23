/*
 * @description
 * @author
 * @change
 *
 *
 * */
(function ($) {
	var commonServices = $.su.Widget.register('commonServices', {
		extend: 'repeat',
		settings: {},

		listeners: [],

		init: function () {
			commonServices.superclass.init.call(this);
			this.settings.itemRender = function (key, data) {
				var innerHTML = '<div class="common-service-kinds-layout">';
				innerHTML += '<div class="common-service-kinds">';
				innerHTML += '<span>' + data.name + '</span>';
				innerHTML += '</div>';
				innerHTML += '</div>';
				return innerHTML;
			};
		}
	});
})(jQuery);
