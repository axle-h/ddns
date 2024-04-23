(function () {
	var Address = $.su.Widget.register('mobileTopBar', {
		settings: {
			readOnly: {
				attribute: 'read-only',
				defaultValue: false
			},
			leftButtonId: {
				attribute: 'left-button-id',
				defaultValue: null
			},
			rightButtonId: {
				attribute: 'right-button-id',
				defaultValue: null
			}
		},

		listeners: [
			{
				selector: '.text-wrap input',
				event: 'keyup',
				callback: function (e, viewObj) {
					var val = $(this).val();
					viewObj.dom().triggerHandler('ev_view_change', [
						{
							type: 'value',
							value: val
						}
					]);
				}
			}
		],

		init: function () {},

		render: function () {
			var _this = this.dom();
			var viewObj = this;
			var settings = this.settings;
			var inHTML = '<div>';
			inHTML += '<div class="logo inline-block"></div>';
			inHTML += '<div class="center-text inline-block hidden"></div>';
			inHTML += '<div class="top-bar-button-container">';
			if (settings.leftButtonId == null) {
				settings.leftButtonId = 'menu-button';
				inHTML += '<div widget="button" icon-cls="menu" class="inline-block menu-button" id="menu-button"></div>';
			} else {
				var leftBtn = $('#' + this.settings.leftButtonId);
				leftBtn.attr('widget', 'button');
			}
			if (settings.rightButtonId == null) {
				settings.rightButtonId = 'func-button';
				inHTML += '<div widget="button" class="inline-block func-button" id="func-button" text="{COMMON.SAVE}"></div>';
			} else {
				var rightBtn = $('#' + this.settings.rightButtonId);
				rightBtn.attr('widget', 'button');
			}
			inHTML += '</div>';
			inHTML += '</div>';
			var tempDom = $(inHTML);
			if (leftBtn) {
				tempDom.find('.top-bar-button-container').prepend(leftBtn);
			}
			if (rightBtn) {
				tempDom.find('.top-bar-button-container').append(rightBtn);
			}
			_this.addClass('top-bar').empty().append(tempDom);
			_this.find('div[widget=button]').each(function () {
				var btn = $(this);
				new $.su.widgets.button({ id: btn }).render();
			});
		},

		setCenterText: function (text) {
			if (text !== null && text !== undefined) {
				var logo = this.dom().find('.logo');
				var centerText = this.dom().find('.center-text');
				if (text === '') {
					logo.show();
					centerText.hide();
				} else {
					logo.hide();
					centerText.show().html(text);
				}
			}
		},

		leftBtn: function () {
			return this.dom()
				.find('#' + this.settings.leftButtonId)
				.data('viewObj');
		},
		rightBtn: function () {
			return this.dom()
				.find('#' + this.settings.rightButtonId)
				.data('viewObj');
		},
		addClass: function (cls) {
			return this.dom().addClass(cls);
		},
		removeClass: function (cls) {
			return this.dom().removeClass(cls);
		}
	});
})();
