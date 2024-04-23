(function () {
	var NoticeBar = $.su.Widget.register('noticeBar', {
		settings: {
			buttonType: {
				attribute: 'button-type',
				defaultValue: 'save'
			},
			noticeText: {
				attribute: 'notice-text',
				defaultValue: ''
			}
		},
		listeners: [
			{
				selector: '.button-button',
				event: 'click',
				callback: function (e, viewObj) {
					e.preventDefault();
					e.stopPropagation();

					var type = $(this).attr('data-type');

					var defaultEvent = $.su.getDefaultEvent(viewObj, viewObj.hide);
					viewObj.dom().triggerHandler('ev_notice_action', [defaultEvent.ev]);
					defaultEvent.exe();
				}
			}
		],
		init: function () {
			this.callback = {};
		},
		render: function () {
			var _this = this.dom(),
				settings = this.settings;

			settings.btnMap = {
				// type: id
				save: {
					id: 'noticeSave',
					text: $.su.CHAR.OPERATION.SAVE
				},
				cancel: {
					id: 'noticeCancel',
					text: $.su.CHAR.OPERATION.CANCEL
				},
				close: {
					id: 'noticeClose',
					text: $.su.CHAR.OPERATION.CLOSED
				}
			};

			_this.addClass(settings.cls + 'notice-bar-container');
			_this.css({ display: 'none' });

			var inHTML = '';
			inHTML += '<div class="notice-text-wrap">';
			inHTML += '<span class="notice-text">' + settings.noticeText + '</span>';
			inHTML += '</div>';
			inHTML += '<div class="notice-buttons-wrap">';
			inHTML += '</div>';

			_this.append(inHTML);

			this.btnType = settings.buttonType.split(' ');
			this.initButton();
		},
		initButton: function () {
			var _this = this.dom();
			var map = this.settings.btnMap;
			var types = this.btnType;
			var len = types.length;
			var wrap = _this.find('.notice-buttons-wrap').eq(0);

			wrap.empty();

			for (var i = 0; i < len; i++) {
				var type = types[i];
				if (map[type]) {
					var btn = $(
						'<div widget="button" text="' + map[type].text + '" id="' + map[type].id + '" data-type="' + type + '" class="button-button"></div>'
					);
					wrap.append(btn);
					new $.su.widgets.button({ id: btn }).render();
				}
			}
		},
		show: function () {
			var _this = this.dom();
			_this.stop(true).slideDown(300);
		},
		hide: function () {
			var _this = this.dom();
			_this.stop(true).slideUp(300);
		},
		setText: function (text, options) {
			// options: {btnType: callback, ..}
			var _this = this.dom();
			var typeNum = this.btnType.length;

			if (typeof text === 'string') {
				_this.find('span.notice-text').text(text);
			}

			if ($.type(options) !== 'object') {
				return;
			}

			this.btnType.splice(0, typeNum);
			for (var type in options) {
				if (options.hasOwnProperty(type)) {
					this.btnType.push(type);
					this.callback[type] = options[type];
				}
			}

			this.initButton();
		}
	});
})();
