(function () {
	var Navigator = $.su.Widget.register('navigator', {
		settings: {
			items: {
				attribute: 'items',
				defaultValue: null
			},
			itemWidget: {
				attribute: 'item-widget',
				defaultValue: null
			},
			bubbleEvent: {
				attribute: 'bubble',
				defaultValue: false
			},
			level: {
				attribute: 'level',
				defaultValue: null
			}
		},

		listeners: [
			{
				selector: 'li.navigator-li-effective',
				event: 'click',
				callback: function (e, viewObj) {
					// $(this).parent("ul").trigger("click", [this.id]);
					// $(this).siblings('li').removeClass('selected');
					// $(this).addClass('selected');
					var value = this.getAttribute('navi-value');
					viewObj.dom().triggerHandler('ev_navigator_clicked', [value]);
					// if(viewObj.settings.bubbleEvent){
					// 	viewObj.dom().trigger("ev_bubble", [{
					// 		event: "ev_navigator_clicked",
					// 		value: value
					// 	}]);
					// }
					e.stopPropagation();
				}
			}
		],

		init: function () {},

		render: function () {
			var _this = this.dom();
			var settings = this.settings;

			_this.addClass(settings.cls + 'navigator-container');
			var inHTML = '';

			inHTML += '<div class="widget-wrap-outer navigator-wrap-outer su-scroll">';
			inHTML += '<div class="widget-wrap navigator-wrap">';
			inHTML += '</div>';
			inHTML += '</div>';
			_this.empty().append(inHTML);
			this.loadItems(settings.items);
		},

		createNavi: function (items, level) {
			var className = 'navigator-ul';
			className += ' navigator-ul-level' + level;
			if (level > 1) {
				className += ' navigator-ul-sub';
			}
			var inHTML = '<ul class="' + className + '">';
			for (var i = 0; i < items.length; i++) {
				var item = items[i];
				inHTML += this.createNaviItem(item, level);
			}
			inHTML += '</ul>';
			return inHTML;
		},

		createNaviItem: function (item, level) {
			var redPointTopMenu = ['ADVANCED', 'HOMESHIELDBASIC'];
			var redPointSubMenu = ['PARENTALCONTROLS', 'PARENTALCONTROLSAD', 'HOMESHIELDADV'];

			var inHTML =
				'<li navi-value="' +
				item.name +
				'" class="navigator-li navigator-li-level' +
				level +
				' ' +
				(item.children ? ' has-sub-navi' : ' navigator-li-effective') +
				(item.cls ? ' ' + item.cls : '') +
				'">';
			inHTML += '<a>';
			inHTML += '<span class="sub-navigator-icon">';

			if (redPointTopMenu.indexOf(item.name.toUpperCase()) > -1) {
				inHTML += '<span class="adv-red-dot hidden"></span>';
			}

			inHTML += '</span>';
			inHTML += '<span class="sub-navigator-text">' + item.text;

			var hiddenCls = $.su.guideFlag ? '' : 'hidden';
			if (redPointSubMenu.indexOf(item.name.toUpperCase()) > -1) {
				inHTML += '<span class="adv-red-dot ' + hiddenCls + '"></span>';
			}
			inHTML += '</span>';
			inHTML += '<span class="sub-navigator-icon-after">' + '</span>';
			inHTML += '</a>';

			if (item.children && (!this.settings.level || level < this.settings.level)) {
				inHTML += this.createNavi(item.children, level + 1);
			}
			inHTML += '</li>';
			return inHTML;
		},

		loadItems: function (items) {
			var _this = this.dom();
			var settings = this.settings;
			settings.items = items;

			var inHTML = '';
			if (settings.items && settings.items.length > 0) {
				inHTML += this.createNavi(settings.items, 1);
			}
			_this.find('.navigator-wrap').empty().append(inHTML);
		},

		// goto: function(value){
		// 	var _this = this.dom();
		// 	var li = _this.find("#"+id);
		// 	li.trigger("click", id);
		// },
		showToggle: function () {
			var _this = this.dom();
			_this.toggleClass('show');
		},
		find: function (value) {
			var _this = this.dom();
			return _this.find('li.navigator-li[navi-value=' + value + ']');
		},
		hasChildren: function (value) {
			var item = this.find(value);
			return item.find('li.navigator-li').length > 0;
		},
		select: function (value) {
			this.find(value).addClass('selected');
		},
		isSelected: function (value) {
			return this.find(value).hasClass('selected');
		},
		unSelect: function (value) {
			this.find(value).removeClass('selected');
		},
		unSelectAll: function () {
			var _this = this.dom();
			_this.find('li.navigator-li.selected').removeClass('selected');
		},
		open: function (value) {
			this.find(value).addClass('opened');
		},
		close: function (value) {
			this.find(value).removeClass('opened');
		},
		toggleOpen: function (value) {
			this.find(value).toggleClass('opened');
		},
		closeAll: function () {
			var _this = this.dom();
			_this.find('li.navigator-li.opened').removeClass('opened');
		}
	});
})();
