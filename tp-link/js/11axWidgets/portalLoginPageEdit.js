/*
 * @description
 * @author zxp
 * @change 2020/12/30: create file
 *
 *
 * */
(function ($) {
	var portalLoginPageEdit = $.su.Widget.register('portalLoginPageEdit', {
		settings: {
			editLabel: {
				attribute: 'edit-label',
				defaultValue: ''
			}
		},

		listeners: [
			{
				selector: '#edit_page',
				event: 'click',
				callback: function (e, viewObj) {
					viewObj.dom().triggerHandler('ev_button_click', [{}]);
				}
			}
		],

		init: function () {},

		render: function () {
			var me = this;
			var _this = me.dom();
			var settings = this.settings;

			var innerHTML = '<label id="login_page_label">';
			innerHTML += '<span class="icon"></span>';
			innerHTML += '<a class="link" id="edit_page">' + settings.editLabel + '</a>';
			innerHTML += '</label>';

			_this.empty().append(innerHTML);
		}
	});
})(jQuery);
