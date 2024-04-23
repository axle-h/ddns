(function () {
	var Toast = $.su.Widget.register('toast', {
		settings: {
			noticeText: {
				attribute: 'notice-text',
				defaultValue: ''
			},
			showTime: {
				attribute: 'show-time',
				defaultValue: 3000
			},
			fadeTime: {
				attribute: 'fade-time',
				defaultValue: 300
			}
		},
		listeners: [
			{
				selector: 'div.close',
				event: 'click',
				callback: function (e, viewObj) {
					e.preventDefault();
					e.stopPropagation();
					viewObj.hide();
				}
			}
		],
		init: function () {},
		render: function () {
			var _this = this.dom(),
				settings = this.settings;

			_this.addClass(settings.cls + ' notice-bar-container');
			_this.css({ display: 'none' });

			var inHTML = '';
			inHTML += '<div class="img-wrap">';
			inHTML += '<span class="icon"></span>';
			inHTML += '</div>';
			inHTML += '<div class="text-wrap">';
			inHTML += '<span class="text">' + settings.noticeText + '</span>';
			inHTML += '</div>';
			inHTML += '<div class="close">';
			inHTML += '</div>';

			_this.append(inHTML);
		},
		/**
		 * 显示气泡消息
		 * @param text 文案
		 * @param type 默认为0，成功提示；1表示失败；2表示其它
		 */
		show: function (text, type, time) {
			var _this = this.dom();
			var me = this;
			var settings = this.settings;
			_this.removeClass('success fail other');
			if (!type) {
				_this.addClass('success');
			} else if (type == 1) {
				_this.addClass('fail');
			} else if (type == 2) {
				_this.addClass('other');
			}
			!!text && this.setText(text);
			if (settings.timerFlag) {
				clearTimeout(settings.timer);
			}
			//			_this.css({
			//				minWidth: 0,
			//				left: 0
			//			});
			this.dom().fadeIn(settings.fadeTime);
			//			_this.css({
			//				minWidth: _this.outerWidth() + 1
			//			});

			var fadeOutTime = typeof time === 'number' ? time : settings.showTime;
			this.settings.timer = setTimeout(function () {
				me.hide();
			}, fadeOutTime);
			settings.timerFlag = true;
			this.setPosition('center', 'auto', null, 68);
		},
		hide: function (immediately) {
			var _this = this.dom();
			this.dom()
				.stop(true)
				.fadeOut(immediately ? 0 : this.settings.fadeTime);
			this.settings.timerFlag = false;
		},
		setText: function (text) {
			if (typeof text === 'string') {
				this.dom().find('span.text').text(text);
			}
		}
	});
})(jQuery);
