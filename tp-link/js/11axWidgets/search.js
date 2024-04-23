/*
 * @description search
 * @author KYJ
 * @change
 *   2017/07/18: create file
 *
 * */
(function () {
	var Search = $.su.Widget.register('search', {
		settings: {
			itemName: {
				attribute: 'item-name',
				defaultValue: ''
			}
		},

		listeners: [
			{
				selector: function () {
					return {
						parent: '#' + this.textbox.domId
					};
				},
				event: 'ev_view_change',
				callback: function (e, msg, viewObj) {
					if (msg.type == 'value') {
						var value = msg.value;
						viewObj.dom().triggerHandler('ev_view_change', [
							{
								type: 'value',
								value: value
							}
						]);
					}
				}
			},
			{
				selector: 'input',
				event: 'focus',
				callback: function (e, viewObj) {
					viewObj.dom().triggerHandler('ev_view_change', [
						{
							type: 'value',
							value: viewObj.textbox.getValue()
						}
					]);
					viewObj.dom().find('.search-content-container').show();
				}
			},
			{
				selector: '',
				event: 'blur',
				callback: function (e, viewObj) {
					viewObj.dom().find('.search-content-container').hide();
				}
			},
			{
				selector: '',
				event: 'keydown',
				callback: function (e, viewObj) {
					var items = viewObj.dom().find('li.search-content-li');
					var itemsLen = items.length;
					var focusedItem = viewObj.dom().find('li.search-content-li.focused');
					var index = focusedItem.index();

					var keyCode = e.keyCode;

					if (keyCode == 40) {
						//down
						if (index < 0 && itemsLen > 0) {
							items.eq(0).addClass('focused');
						} else if (index >= 0 && index < itemsLen - 1) {
							items.eq(index).removeClass('focused');
							items.eq(index + 1).addClass('focused');
						}
					} else if (keyCode == 38) {
						if (index > 0) {
							items.eq(index).removeClass('focused');
							items.eq(index - 1).addClass('focused');
						} else if (index == 0) {
							items.eq(index).removeClass('focused');
						}

						e.preventDefault();
					} else if (keyCode == 13) {
						if (index >= 0) {
							focusedItem.trigger('click');
						}
					}
				}
			},
			{
				selector: 'li.search-content-li',
				event: 'click',
				callback: function (e, viewObj) {
					var value = $(this).attr('event-key');
					if (value) {
						viewObj.dom().triggerHandler('ev_item_selected', [value]);
					}
					viewObj.dom().find('.search-content-container').hide();
				}
			}
		],

		init: function () {},

		render: function () {
			var _this = this.dom();
			var settings = this.settings;

			_this.empty();

			var textbox = $('<div widget="textbox"></div>');
			textbox.attr('id', this.domId + '-sub-textbox');
			_this.append(textbox);
			this.textbox = new $.su.widgets.textbox({ id: textbox });
			this.textbox.render();

			var contentBoxHTML = '';
			contentBoxHTML += '<div class="search-content-container">';
			contentBoxHTML += '<div class="search-content-ul-before"></div>';
			contentBoxHTML += '<ul class="search-content-ul">';
			contentBoxHTML += '</ul>';
			contentBoxHTML += '<div class="search-content-ul-after"></div>';
			contentBoxHTML += '</div>';

			_this.append(contentBoxHTML);
		},

		setValue: function (value) {
			this.textbox.setValue(value);
		},

		loadItems: function (items) {
			if (!items) {
				return;
			}

			var dom = this.dom();
			var contentContainer = dom.find('.search-content-ul');
			contentContainer.empty();

			var len = items.length;
			var itemsHTML = '';
			for (var i = 0; i < len; i++) {
				var item = items[i];
				itemsHTML += '<li class="search-content-li" event-key="' + item.name + '">';
				itemsHTML += '<div class="search-content-li-body">';
				itemsHTML += '<div class="search-content-li-text-before"></div>';
				itemsHTML += '<div class="search-content-li-text">' + item.text + '</div>';
				itemsHTML += '<div class="search-content-li-text-after"></div>';
				itemsHTML += '</div>';
				itemsHTML += '</li>';
			}
			contentContainer.append(itemsHTML);
		}
	});
})();
