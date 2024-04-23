/*
 * @description
 * @author XCH
 * @change
 *   2017/11/19: create file
 *
 * */
(function ($) {
	var filterContent = $.su.Widget.register('filterContent', {
		settings: {
			type: {
				attribute: 'type',
				defaultValue: 'app'
			},
			placeholder: {
				attribute: 'placeholder',
				defaultValue: $.su.CHAR.COMMON.APP_FILTER_PLACEHOLDER
			}
		},

		listeners: [
			{
				selector: function () {
					return {
						parent: 'body',
						target: ''
					};
				},
				event: 'click',
				callback: function (e, viewObj) {
					var settings = viewObj.settings;
					var target = e.target ? e.target : e.srcElement;
					var wrapper = $(target).closest('.filter-content-wrapper');
					if (wrapper.length === 0 || $(target)[0] === wrapper[0]) {
						viewObj.dom().find('.filter-hint-wrapper').hide();
					}
				}
			},
			{
				selector: '.text-wrap-inner input',
				event: 'click',
				callback: function (e, viewObj) {
					// viewObj.button.show();

					// if(viewObj.settings.type === 'app'){
					viewObj.dom().find('.filter-hint-wrapper').removeClass('no-hint');
					viewObj.dom().find('.filter-hint-wrapper').show();
					// }

					viewObj.dom().triggerHandler('ev_input_click', [
						{
							type: viewObj.settings.type
						}
					]);
				}
			},
			{
				selector: '.text-wrap-inner input',
				event: 'blur',
				callback: function (e, viewObj) {
					setTimeout(function (e) {
						// if(viewObj.settings.type === 'app'){
						// if(!$(".filter-hint-wrapper").is(":focus") && (viewObj.keydownCode && viewObj.keydownCode != 13)){
						if (!viewObj.showTips) {
							viewObj.dom().find('.filter-hint-wrapper').hide();
						} else {
							viewObj.dom().find('.filter-hint-wrapper').show();
						}
						// }
						// }
						// if(!viewObj.button.dom().is(":focus")){
						// 	viewObj.button.hide();
						// }
					}, 0);
				}
			},
			{
				selector: '.text-wrap-inner input',
				event: 'keydown',
				callback: function (e, viewObj) {
					viewObj.keydownCode = e.keyCode;
				}
			},
			{
				selector: '.text-wrap-inner input',
				event: 'keyup',
				callback: function (e, viewObj) {
					if (e.keyCode == 13) {
						var addItems = viewObj.addItems();
						// if(viewObj.settings.type === 'app'){
						if (addItems) {
							viewObj.dom().find('.filter-hint-wrapper').hide();
							// viewObj.button.hide();
							viewObj.showTips = false;
						} else {
							viewObj.dom().find('.filter-hint-wrapper').addClass('no-hint');
							viewObj.showTips = true;
						}
						// }else{
						// 	viewObj.button.hide();
						// }
					}

					// if(viewObj.settings.type === 'app'){
					viewObj.search($(this).val());
					// }
				}
			},
			{
				selector: '.filter-items .icon',
				event: 'click',
				callback: function (e, viewObj) {
					var deleteVal = $(this).closest('.filter-items').attr('data-val');

					val = viewObj.removeItems(deleteVal);

					viewObj.dom().triggerHandler('ev_view_change', [
						{
							type: 'value',
							value: val
						}
					]);
				}
			},
			{
				selector: '.filter-hint-wrapper',
				event: 'blur',
				callback: function (e, viewObj) {
					// if(viewObj.settings.type === 'app'){
					viewObj.dom().find('.filter-hint-wrapper').hide();
					// }
				}
			},
			{
				selector: '.filter-hint-wrapper .app-name',
				event: 'mousedown',
				callback: function (e, viewObj) {
					var val = $(this).find('span').text();
					viewObj.addItems(val);
					$(viewObj.dom()).find('.filter-hint-wrapper').hide();
				}
			}
		],

		init: function () {},

		render: function () {
			var me = this;
			var _this = this.dom();
			var settings = this.settings;

			_this.addClass('filter-content-container ' + settings.type);

			var innerHTML = '<div class="filter-content-wrapper">';
			innerHTML +=
				'<div widget="textbox" id="' + this.domId + '_textbox' + '" class="label-empty inline-block" hint="' + settings.placeholder + '" />';
			if (settings.type === 'app') {
				innerHTML +=
					'<div widget="button" id="' +
					this.domId +
					'_button' +
					'" class="label-empty btn-rare hidden" text="' +
					(settings.type === 'app' ? $.su.CHAR.OPERATION.CANCEL_UPPERCASE : $.su.CHAR.OPERATION.ADD) +
					'"></div>';
			} else {
				innerHTML += '<div widget="button" id="' + this.domId + '_button' + '" class="label-empty icon-button add-icon-btn hidden" text=""></div>';
			}
			innerHTML += '<div class="filter-items-wrapper"></div>';
			// if(settings.type === 'app'){
			innerHTML += '<div class="filter-hint-wrapper hidden">';
			innerHTML += '<div class="filter-hint su-scroll"></div>';
			innerHTML += '</div>';
			// }
			innerHTML += '</div>';

			_this.append(innerHTML);

			if (settings.type === 'app') {
				// $.su.scrollbar({
				// 	ele: $(_this).find(".filter-hint-wrapper")[0],
				// 	opts:{
				// 		suppressScrollY: true
				// 	}
				// });
			}

			me.input = new $.su.widgets.textbox({
				id: this.domId + '_textbox'
			});
			me.input.render();

			me.button = new $.su.widgets.button({
				id: this.domId + '_button'
			});
			me.button.render();
			// me.button.hide();

			me.button.dom().on('ev_button_click', function () {
				if (settings.type === 'app') {
					me.dom().find('.filter-hint-wrapper').hide();
				} else {
					// me.addItems();
					var addItems = me.addItems();
					if (addItems) {
						me.dom().find('.filter-hint-wrapper').hide();
						me.showTips = false;
					} else {
						me.dom().find('.filter-hint-wrapper').addClass('no-hint');
						me.showTips = true;
					}
				}
				// me.button.hide();
			});

			// $.su.scrollbar({
			// 	ele: '.filter-hint-wrapper .filter-hint',
			// 	opts:{
			// 		suppressScrollX: true
			// 	}});
		},

		setValue: function (value) {
			if (value) {
				var _this = this.dom();
				var settings = this.settings;

				this.value = value;

				var innerHTML = '';
				for (var i = 0; i < value.length; i++) {
					innerHTML += '<div class="filter-items" data-val="' + value[i] + '">';
					innerHTML += '<span class="icon"></span>';
					innerHTML += '<span class="text">' + value[i] + '</span>';
					innerHTML += '</div>';
				}

				$(_this).find('.filter-items-wrapper').empty().append(innerHTML);
			}
		},

		getValue: function () {
			return this.value;
		},

		removeItems: function (items) {
			var arr = $.su.clone(this.getValue());

			for (var i = 0; i < arr.length; i++) {
				if (arr[i] == items) {
					arr.splice(i, 1);
					break;
				}
			}

			return arr;
		},

		checkItems: function (items) {
			var arr = $.isArray($.su.clone(this.getValue())) ? $.su.clone(this.getValue()) : [];
			for (var i = 0; i < arr.length; i++) {
				if (arr[i] == items) {
					break;
				}
			}

			if (i != arr.length) {
				return true;
			} else {
				return false;
			}
		},

		addItems: function (value) {
			var me = this;
			var _this = this.dom();
			var settings = this.settings;

			var input = $(_this).find('.text-wrap-inner input');
			var inputVal = value ? value : input.val();

			if (settings.type === 'app') {
				if (me.search(inputVal) && me.checkHintBase(inputVal) && !me.checkItems(inputVal)) {
					var val = $.isArray($.su.clone(this.getValue())) ? $.su.clone(this.getValue()) : [];
					val.push(inputVal);
					me.dom().triggerHandler('ev_view_change', [
						{
							type: 'value',
							value: val
						}
					]);
					input.val('');
					input.blur();
					return true;
				} else {
					input.val('');
					input.blur();
					return false;
				}
			} else {
				var val = $.isArray($.su.clone(this.getValue())) ? $.su.clone(this.getValue()) : [];
				if (val.length + 1 > me.maxItems) {
					input.val('');
					input.blur();
					me.dom().triggerHandler('ev_items_limit');
					return true;
				}

				if ((me.search(inputVal) && me.checkHintBase(inputVal) && !me.checkItems(inputVal)) || (!me.checkItems(inputVal) && me.isURL(inputVal))) {
					// var val = me.getValue();
					val.push(inputVal);
					me.dom().triggerHandler('ev_view_change', [
						{
							type: 'value',
							value: val
						}
					]);
					input.val('');
					input.blur();
					return true;
				} else {
					// the item has been in the list
					input.val('');
					input.blur();
					return false;
				}
			}
		},

		loadItems: function (items) {
			var _this = this.dom();
			var settings = this.settings;

			this.items = items;

			var innerHTML = '';
			innerHTML += '<div class="app-name-wrapper">';
			for (var i = 0; i < items.length; i++) {
				innerHTML += '<div class="app-name" data-val="' + items[i].name + '">';
				innerHTML += '<span>' + items[i].name + '</span>';
				innerHTML += '</div>';
			}
			innerHTML += '</div>';
			innerHTML +=
				'<div class="app-name-note">' +
				(settings.type == 'app' ? $.su.CHAR.PARENTAL_CONTROLS.FILTER_LEVEL_NOTE2 : $.su.CHAR.PARENTAL_CONTROLS.FILTER_LEVEL_NOTE3) +
				'</div>';

			$(_this).find('.filter-hint').empty().append(innerHTML);
		},

		getHintBase: function () {
			return this.items;
		},

		search: function (items) {
			var me = this;
			var hintBase = $.su.clone(me.getHintBase());
			var hintBaseTemp = $.su.clone(hintBase);
			var temp = [];
			var reg = new RegExp(items, 'i');
			var checked = [];

			if (!items) {
				return false;
			}

			for (var i = 0; i < hintBase.length; i++) {
				if (reg.test(hintBase[i].name)) {
					checked.push({
						name: hintBase[i].name,
						key: hintBase[i].key,
						checked: true
					});
					temp.push(i);
				}
				hintBaseTemp[i].checked = false;
			}

			for (var j = temp.length - 1; j >= 0; j--) {
				hintBaseTemp.splice(temp[j], 1);
			}

			if (checked.length == 0) {
				me.loadItems(hintBaseTemp);
				return false;
			} else {
				hintBase = me.sort(checked).concat(me.sort(hintBaseTemp));
				me.loadItems(hintBase);
				return true;
			}
		},

		checkHintBase: function (items) {
			var me = this;
			var hintBase = $.su.clone(me.getHintBase());
			var reg = new RegExp('^' + items + '$');

			for (var i = 0; i < hintBase.length; i++) {
				if (reg.test(hintBase[i].name)) {
					return true;
				}
			}

			return false;
		},

		sort: function (arr) {
			var sortChar = function (a, b) {
				var c1 = a['name'].toLowerCase();
				var c2 = b['name'].toLowerCase();

				if (c1 < c2) {
					return -1;
				} else {
					return 1;
				}
			};
			return arr.sort(sortChar);
		},

		isURL: function (str_url) {
			// var strRegex = '^((https|http|ftp|rtsp|mms)?://)' + '?(([0-9a-z_!~*\'().&=+$%-]+: )?[0-9a-z_!~*\'().&=+$%-]+@)?' + '(([0-9]{1,3}.){3}[0-9]{1,3}' // IP形式的URL- 199.194.52.184
			// + '|' // 允许IP和DOMAIN（域名）
			// + '([0-9a-z_!~*\'()-]+.)*' // 域名- www.
			// + '([0-9a-z][0-9a-z-]{0,61})?[0-9a-z].' // 二级域名
			// + '[a-z]{2,6})' // first level domain- .com or .museum
			// + '(:[0-9]{1,4})?' // 端口- :80
			// + '((/?)|' // a slash isn't required if there is no file name
			// + '(/[0-9a-z_!~*\'().;?:@&=+$,%#-]+)+/?)$';
			var regex = /^([\w-]+\.)+[\w-]+(\/[\w- .\/?%&=]*)?$/i;
			var re = new RegExp(regex);
			if (re.test(str_url)) {
				return true;
			} else {
				return false;
			}
		},

		setMaxItems: function (length) {
			if (length) {
				this.maxItems = parseInt(length);
			}
		}
	});
})(jQuery);
