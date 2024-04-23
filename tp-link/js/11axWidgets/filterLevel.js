/*
 * @description
 * @author XCH
 * @change
 *   2017/11/20: create file
 *
 * */
(function ($) {
	var filterLevel = $.su.Widget.register('filterLevel', {
		settings: {},

		listeners: [
			{
				selector: '.filter-level-items .items',
				event: 'click',
				callback: function (e, viewObj) {
					viewObj.dom().find('.filter-level-items .items').removeClass('selected');
					$(this).addClass('selected');

					viewObj.dom().triggerHandler('ev_items_btn_click', [
						{
							level: $(this).attr('data-val')
						}
					]);

					viewObj.dom().triggerHandler('ev_view_change', [
						{
							type: 'value',
							value: $(this).attr('data-val')
						}
					]);
				}
			}
		],

		init: function () {},

		render: function () {
			var me = this;
			var _this = this.dom();
			var settings = this.settings;

			_this.addClass('filter-level-container');

			var innerHTML = '<div class="filter-level-wrapper">';
			innerHTML += '<div class="filter-level-items">';
			innerHTML += '<div class="items child" data-val="child">';
			innerHTML += '<span class="icon"></span>';
			innerHTML += '<span class="type">' + $.su.CHAR.PARENTAL_CONTROLS.CHILD + '</span>';
			innerHTML += '<span class="age">(0-7)</span>';
			innerHTML += '</div> ';
			innerHTML += '<div class="items pre-teen" data-val="pre-teen">';
			innerHTML += '<span class="icon"></span>';
			innerHTML += '<span class="type">' + $.su.CHAR.PARENTAL_CONTROLS.PRE_TEEN + '</span>';
			innerHTML += '<span class="age">(8-12)</span>';
			innerHTML += '</div> ';
			innerHTML += '<div class="items teen" data-val="teen">';
			innerHTML += '<span class="icon"></span>';
			innerHTML += '<span class="type">' + $.su.CHAR.PARENTAL_CONTROLS.TEEN + '</span>';
			innerHTML += '<span class="age">(13-17)</span>';
			innerHTML += '</div> ';
			innerHTML += '<div class="items adult" data-val="adult">';
			innerHTML += '<span class="icon"></span>';
			innerHTML += '<span class="type">' + $.su.CHAR.PARENTAL_CONTROLS.ADULT + '</span>';
			innerHTML += '<span class="age">(>17)</span>';
			innerHTML += '</div> ';
			innerHTML += '</div>';
			innerHTML += '</div>';

			_this.empty().append(innerHTML);
		},

		setValue: function (value) {
			var me = this;
			var _this = this.dom();
			var settings = this.settings;
			$(_this).find('.filter-level-items .items').removeClass('selected');

			if (value) {
				$(_this)
					.find('.items.' + value.toLowerCase())
					.addClass('selected');
			}
		}
	});
})(jQuery);
