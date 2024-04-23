/*
 * @description 11ax navigator
 * @author KYJ
 * @change
 *   2017/07/06: create file
 *
 * */

(function () {
	var AXNavigator = $.su.Widget.register('AXNavigator', {
		extend: 'navigator',

		listeners: function () {
			return [
				{
					selector: 'li.navigator-li a',
					event: 'click',
					callback: function (e, viewObj) {
						var value = $(this).parent().attr('navi-value');
						//response ui

						if (viewObj.hasChildren(value)) {
							viewObj.toggleOpen(value);
						}
						!!value && viewObj.dom().triggerHandler('ev_navigator_clicked', [value]);

						if ($.su.guideFlag === false) {
							$('.adv-red-dot').addClass('hidden');
						} else {
							$('.adv-red-dot').removeClass('hidden');
						}
						// viewObj.select(value);   //not always
						e.stopPropagation();
					}
				},
				{
					selector: '',
					event: 'click',
					callback: function (e, viewObj) {
						e.stopPropagation();
					}
				},
				{
					selector: '.navigator-li>a',
					event: 'mouseenter',
					callback: function (e, viewObj) {
						$(this).addClass('hover');
					}
				},
				{
					selector: '.navigator-li>a',
					event: 'mouseleave',
					callback: function (e, viewObj) {
						$(this).removeClass('hover');
					}
				}
			];
		},

		render: function () {
			AXNavigator.superclass.render.call(this);
			this.initCloseAll();
		},

		loadItems: function (items, preventOperation) {
			AXNavigator.superclass.loadItems.call(this, items);
			this.initCloseAll();
			this.dom().triggerHandler('ev_navigator_loaded', [items, preventOperation]);
		},

		hide: function (speed) {
			var _this = this.dom();
			_this.removeClass('show');
			_this.slideUp(speed == undefined ? 200 : 0).addClass('hidden');
		},
		show: function (speed) {
			var _this = this.dom();
			_this.removeClass('hidden');
			_this.slideDown(speed == undefined ? 200 : 0).addClass('show');
		},
		toggleShow: function () {
			var _this = this.dom();
			if (_this.hasClass('show')) {
				_this.slideUp(200).addClass('hidden');
			} else {
				_this.slideDown(200).removeClass('hidden');
			}
			_this.toggleClass('show');
		},

		/*
		 * @override
		 * */
		select: function (value) {
			var _this = this.dom();
			this.unSelectAll();
			this.closeSiblings(value);

			var targetItem = this.find(value);
			targetItem.addClass('selected');
			targetItem.parentsUntil($('.navigator-ul-level1'), '.navigator-li').addClass('has-child-selected');
		},

		/*
		 * @override
		 * */
		unSelectAll: function () {
			var _this = this.dom();
			var targetItems = _this.find('li.navigator-li.selected');
			targetItems.removeClass('selected');
			targetItems.parentsUntil($('.navigator-ul-level1'), '.navigator-li').removeClass('has-child-selected');
		},

		// unSelectAll: function(){
		//     this.unSelectAll();
		// },
		openItem: function (li) {
			li.addClass('opened').children('ul.navigator-ul').slideDown(200);
		},
		closeItem: function (li) {
			li.removeClass('opened').children('ul.navigator-ul').slideUp(200);
		},
		closeAll: function () {
			var _this = this.dom();
			_this.find('li.navigator-li').removeClass('opened');
			_this.find('ul.navigator-ul-sub').slideUp(0);
		},
		initCloseAll: function () {
			this.dom().find('ul.navigator-ul-sub').slideUp(0);
		},

		open: function (value) {
			var target = this.find(value);
			this.closeSiblings(value);
			this.openItem(target);
			this.dom().triggerHandler('ev_navigator_opened', [value]);
		},
		close: function (value) {
			var target = this.find(value);
			this.closeSiblings(value);
			this.closeItem(target);
			this.closeItem(target.find('li.navigator-li'));
		},

		closeSiblings: function (value) {
			var target = this.find(value);
			var others = target.siblings('li.navigator-li.opened');
			var othersChildren = others.find('li.navigator-li.opened');
			this.closeItem(others);
			this.closeItem(othersChildren);
		},

		isOpened: function (value) {
			return this.find(value).hasClass('opened');
		},
		toggleOpen: function (value) {
			if (this.isOpened(value)) {
				this.close(value);
			} else {
				this.open(value);
			}
		},
		addClass: function (cls) {
			return this.dom().addClass(cls);
		},
		removeClass: function (cls) {
			return this.dom().removeClass(cls);
		}
	});
})();
