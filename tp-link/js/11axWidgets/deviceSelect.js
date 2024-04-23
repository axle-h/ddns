/*
 * @description
 * @author XCH
 * @change
 *   2017/11/20: create file
 *
 * */
(function ($) {
	var deviceSelect = $.su.Widget.register('deviceSelect', {
		settings: {},

		listeners: [
			{
				selector: '.close-icon',
				event: 'click',
				callback: function (e, viewObj) {
					var id = $(this).attr('data-id');
					var data = $.su.clone(viewObj.getValue());

					for (var i = 0; i < data.length; i++) {
						if (id == data[i].deviceId) {
							data.splice(i, 1);
						}
					}

					viewObj.dom().triggerHandler('ev_view_change', [
						{
							type: 'value',
							value: data
						}
					]);
				}
			},
			{
				selector: '.add-button',
				event: 'click',
				callback: function (e, viewObj) {
					var data = viewObj.getValue();

					viewObj.dom().triggerHandler('ev_add_device', [
						{
							type: 'value',
							value: data
						}
					]);
				}
			},
			{
				selector: '.delete-button',
				event: 'click',
				callback: function (e, viewObj) {
					viewObj.dom().find('.close-icon').toggleClass('hidden');
				}
			}
		],

		init: function () {},

		render: function () {
			var me = this;
			var _this = this.dom();
			var settings = this.settings;

			_this.addClass('device-list-container');

			var innerHTML = '<div class="device-list-wrapper">';
			innerHTML += '</div>';

			_this.empty().append(innerHTML);
		},

		setValue: function (value) {
			if (value != null) {
				var me = this;
				var _this = this.dom();
				var settings = this.settings;
				me.value = value;

				var innerHTML = '';

				for (var i = 0; i < value.length; i++) {
					innerHTML += '<div class="device">';
					innerHTML += '<div class="icon-wrapper">';
					innerHTML += '<div class="icon ' + value[i].clientType + '"></div>';
					innerHTML += '<div class="close-icon hidden" data-id="' + value[i].deviceId + '"></div>';
					innerHTML += '</div>';
					innerHTML += '<div class="text" title="' + value[i].name + '">' + value[i].name + '</div>';
					innerHTML += '</div> ';
				}

				innerHTML += '<div class="add-button">';
				innerHTML += '<span class="icon"></span>';
				innerHTML += '</div> ';
				innerHTML += '<div class="delete-button">';
				innerHTML += '<span class="icon"></span>';
				innerHTML += '</div> ';
				innerHTML += '<div class="layout-stand-in"></div> ';
				innerHTML += '<div class="layout-stand-in"></div> ';
				innerHTML += '<div class="layout-stand-in"></div> ';
				innerHTML += '<div class="layout-stand-in"></div> ';
				innerHTML += '<div class="layout-stand-in"></div> ';

				$(_this).find('.device-list-wrapper').empty().append(innerHTML);
			}
		},

		getValue: function () {
			return this.value;
		}
	});
})(jQuery);
