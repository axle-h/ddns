(function () {
	var Accordion = $.su.Widget.register('accordion', {
		settings: {},
		listeners: [
			{
				selector: '.accordion-header',
				event: 'click',
				callback: function (e, viewObj) {
					var curAccordionItem = $(e.target).parent('.accordion-header').parent('.accordion-item');
					var widgetContainer = viewObj.dom();
					var isConflict = widgetContainer.data('conflict') === true ? true : false;

					var conflictItem;
					if (isConflict) {
						var accordionItemArr = widgetContainer.find('.accordion-item.accordion-item-wrap');
						var i = 0,
							len = accordionItemArr.length;
						for (; i < len; i++) {
							if (!$(accordionItemArr[i]).hasClass('collapsed')) {
								conflictItem = $(accordionItemArr[i]);
								break;
							}
						}
					}

					if (curAccordionItem.hasClass('collapsed')) {
						viewObj.expandItem(curAccordionItem);
						conflictItem && viewObj.collapseItem(conflictItem);
					} else {
						viewObj.collapseItem(curAccordionItem);
					}
					//防止msg内过长的内容展开后不居中
					if (viewObj.dom().parents('.msg-container').length > 0) {
						setTimeout(function () {
							$(window).trigger('resize');
						}, 201);
					}
				}
			}
		],
		init: function () {},
		render: function () {
			var _this = this.dom();
			var settings = this.settings;

			_this.addClass(settings.cls + 'accordion-container');

			var transcludeItems = _this.find('.accordion-item');
			var inHTML = '';
			inHTML += '<div class="accordion-wrap">';

			var i = 0,
				len = transcludeItems.length;

			for (; i < len; i++) {
				// var title = $(transcludeItems[i]).data("title").split(".");
				var title = $.su.getAttrObject($.su.CHAR, $(transcludeItems[i]).data('title'));
				var isCollapsed = $(transcludeItems[i]).data('collapsed') === false ? false : true;

				var accordionName = $(transcludeItems[i]).data('name') || 'accordion-name';

				// if (title.length !== 2 || title[1] === undefined || title[1] === "" || $.su.CHAR[title[0]][title[1]] === undefined) {
				//     console.error("please check the param data-title of accordion-item element: ", transcludeItems[i]);
				// }
				// title = $.su.CHAR[title[0]][title[1]];

				// 默认收起来
				if (isCollapsed) {
					inHTML += '<div class="accordion-item accordion-item-wrap collapsed"' + ' data-name="' + accordionName + '">';
				} else {
					inHTML += '<div class="accordion-item accordion-item-wrap"' + ' data-name="' + accordionName + '">';
				}
				inHTML += '<div class="accordion-header">';
				inHTML += '<span class="accordion-icon"></span>';
				inHTML += '<span class="accordion-title">' + title + '</span>';
				inHTML += '</div>';
				inHTML += '<div class="accordion-body"></div>';
				inHTML += '</div>';
			}

			inHTML += '</div>';
			var content = $(inHTML);

			for (i = 0; i < len; i++) {
				var accordionBody = $(content.find('.accordion-body')[i]);
				accordionBody.append(transcludeItems[i]);
				// $(accordionBody.find(".accordion-item")).remove(".accordion-item")
			}

			_this.append(content);
		},
		collapseItem: function (accordionItem, time) {
			if (!accordionItem) {
				return;
			}
			var time = time === undefined ? 200 : time;
			var curAccordionBody = accordionItem.find('.accordion-body');
			if (!accordionItem.hasClass('collapsed')) {
				curAccordionBody.slideUp(time, function () {
					accordionItem.addClass('collapsed');
				});
			}
		},
		expandItem: function (accordionItem, time) {
			if (!accordionItem) {
				return;
			}
			var time = time === undefined ? 200 : time;
			var curAccordionBody = accordionItem.find('.accordion-body');
			if (accordionItem.hasClass('collapsed')) {
				curAccordionBody.slideDown(time, function () {
					accordionItem.removeClass('collapsed');
				});
			}
		},
		reSet: function () {
			var _this = this.dom();
			var items = _this.find('.accordion-item.accordion-item-wrap');
			var i = 0,
				len = items.length;
			for (; i < len; i++) {
				var $item = $(items[i]);
				if (i === 0) {
					this.expandItem($item, 0);
				} else {
					this.collapseItem($item, 0);
				}
			}
		},
		goto: function (name) {
			if (!name) {
				return;
			}

			var _this = this.dom();
			var items = _this.find('.accordion-item.accordion-item-wrap');
			var i = 0,
				len = items.length;
			for (; i < len; i++) {
				var $item = $(items[i]);
				if (name === $item.data('name')) {
					this.expandItem($item, 0);
				} else {
					this.collapseItem($item, 0);
				}
			}
		}
	});
})();
