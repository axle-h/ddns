(function () {
	var Timer = $.su.Widget.register('timer', {
		settings: {},

		listeners: [],

		init: function () {},

		render: function () {
			var _this = this.dom();
			var viewObj = this;
			var settings = this.settings;

			_this.addClass(settings.cls + 'timer-container');

			var inHTML = '';
			if (settings.labelField !== null) {
				inHTML += '<div class="widget-fieldlabel-wrap ' + settings.labelCls + '">';
				inHTML += '<div class="widget-fieldlabel-inner">';
				inHTML += '<label class="widget-fieldlabel timer-fieldlabel">' + settings.labelField + '</label>';
				if (settings.labelField) {
					inHTML += '<span class="widget-separator">' + settings.separator + '</span>';
				}
				inHTML += '</div>';
				inHTML += '</div>';
			}
			inHTML += '<div class="widget-wrap-outer text-wrap-outer">';
			inHTML += '<span class="icon"></span>';
			inHTML += '<span class="text"></span>';
			inHTML += '</div>';

			_this.empty().append(inHTML);
		},

		setValue: function (value) {
			var container = this.getContainer();
			var _this = this.dom();
			var seconds = value;
			var countDownId = null;

			var formatTime = '';

			var format = function (s) {
				if (s <= 0) {
					if (s == 0) {
						container.triggerHandler('ev_time_end');
					}
					clearInterval(countDownId);
					return;
				}
				var hour = parseInt(s / 3600);
				var min = parseInt((s / 60) % 60);
				var sec = parseInt(s % 60);
				if (hour < 10) {
					formatTime = '0' + hour + ':';
				} else {
					formatTime = hour + ':';
				}

				if (min < 10) {
					formatTime += '0';
				}
				formatTime += min + ':';

				if (sec < 10) {
					formatTime += '0';
				}
				formatTime += sec;

				return formatTime;
			};

			formatTime = format(seconds);
			_this.find('span.text').text(formatTime);
			seconds--;

			countDownId = setInterval(function () {
				formatTime = format(seconds);
				_this.find('span.text').text(formatTime);
				seconds--;
			}, 1000);
		},

		show: function () {
			var _this = this.dom();

			_this.css('opacity', '1');
		},

		hide: function () {
			var _this = this.dom();

			_this.css('opacity', '0');
		}
	});
})();
