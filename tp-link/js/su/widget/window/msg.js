(function () {
	var Msg = $.su.Widget.register('msg', {
		settings: {
			type: {
				attribute: 'type',
				defaultValue: 'prompt'
			}, //alert, confirm, prompt, show, window
			_title: {
				attribute: 'msg-title',
				defaultValue: ''
			},
			autoshow: {
				attribute: 'autoshow',
				defaultValue: false
			},
			zIndex: {
				attribute: 'z-index',
				defaultValue: 'auto'
			},
			contentScrollX: {
				attribute: 'content-scroll-x',
				defaultValue: true
			},
			contentScroll: {
				attribute: 'content-scroll',
				defaultValue: true
			},
			dynamicHeight: {
				attribute: 'dynamic-height',
				defaultValue: true
			},
			remainHeight: {
				// 当 dynamicHeight 为真时，window 和 msg 的高度差
				attribute: 'remain-height',
				defaultValue: 300
			},
			mask: {
				attribute: 'mask',
				defaultValue: true
			},
			msg: {
				attribute: 'msg',
				defaultValue: ''
			},
			htmlLoader: {
				attribute: 'html-loader',
				defaultValue: false
			},
			callback: {
				attribute: 'callback',
				defaultValue: null
			},
			titleBar: {
				attribute: 'title-bar',
				defaultValue: true
			},
			closeBtn: {
				attribute: 'close-btn',
				defaultValue: true
			},
			okText: {
				attribute: 'ok-text',
				defaultValue: $.su.CHAR.OPERATION.OK
			},
			yesText: {
				attribute: 'yes-text',
				defaultValue: $.su.CHAR.OPERATION.YES_UPPERCASE
			},
			noText: {
				attribute: 'no-text',
				defaultValue: $.su.CHAR.OPERATION.NO_UPPERCASE
			},
			cancelText: {
				attribute: 'cancel-text',
				defaultValue: $.su.CHAR.OPERATION.CANCEL_UPPERCASE
			}
		},
		listeners: [
			{
				selector: 'a.msg-close',
				event: 'click',
				callback: function (e, viewObj) {
					e.preventDefault();

					var defaultEvent = $.su.getDefaultEvent(viewObj, viewObj.close);

					viewObj.dom().triggerHandler('ev_msg_close', [defaultEvent.ev]);
					defaultEvent.exe();
				}
			},
			{
				selector: 'div.btn-msg-ok',
				event: 'click',
				callback: function (e, viewObj) {
					e.preventDefault();
					e.stopPropagation();

					var defaultEvent = $.su.getDefaultEvent(viewObj, viewObj.close);

					viewObj.dom().triggerHandler('ev_msg_ok', [defaultEvent.ev]);
					defaultEvent.exe();
				}
			},
			{
				selector: 'div.btn-msg-no',
				event: 'click',
				callback: function (e, viewObj) {
					e.preventDefault();
					e.stopPropagation();

					var defaultEvent = $.su.getDefaultEvent(viewObj, viewObj.close);

					viewObj.dom().triggerHandler('ev_msg_no', [defaultEvent.ev]);
					defaultEvent.exe();
				}
			},
			{
				selector: 'div.btn-msg-cancel',
				event: 'click',
				callback: function (e, viewObj) {
					e.preventDefault();
					e.stopPropagation();

					var defaultEvent = $.su.getDefaultEvent(viewObj, viewObj.close);

					viewObj.dom().triggerHandler('ev_msg_cancel', [defaultEvent.ev]);
					defaultEvent.exe();
				}
			},
			{
				selector: '.msg-title',
				event: 'mousedown',
				callback: function (e, viewObj) {
					var oEvent = e || event;
					//获取按下鼠标到div left  top的距离
					viewObj.distanceX = oEvent.clientX - $(this).offset().left;
					viewObj.distanceY = oEvent.clientY - $(this).offset().top;
					viewObj.drag = true;

					var windowWidth = $(window).innerWidth();
					var windowHeight = $(window).innerHeight();
					var domWidth = viewObj.dom().outerWidth();
					var domHeight = viewObj.dom().outerHeight();

					function mouseMove(e) {
						if (viewObj.drag === false) {
							return;
						}

						var oEvent = e || event;
						//重新计算div的left top值
						var left = oEvent.clientX - viewObj.distanceX;
						var top = oEvent.clientY - viewObj.distanceY;
						//left  当小于等于零时，设置为零 防止div拖出document之外
						if (left <= 0) {
							left = 0;
						}
						//当left 超过文档右边界  设置为右边界
						else if (left >= windowWidth - domWidth) {
							left = windowWidth - domWidth;
						}
						if (top <= 0) {
							top = 0;
						} else if (top >= windowHeight - domHeight) {
							top = windowHeight - domHeight;
						}

						viewObj.dom().css({
							top: top + 'px',
							left: left + 'px'
						});
						return false;
					}

					function mouseUp(e) {
						$(document).off('mouseup', mouseUp).off('mousemove', mouseMove);
						return false;
					}

					$(document).on('mousemove', mouseMove).on('mouseup', mouseUp);
					return false;
				}
			}
		],
		init: function () {},
		render: function () {
			var _this = this.dom();
			var settings = this.settings;

			_this.addClass(settings.cls + ' msg-container ' + settings.type);

			if ($.su.platform === 'ios') {
				_this.addClass('ios');
			}

			var inHTML = '';
			inHTML += '<div class="msg-wrap">';

			if (settings.closeBtn) {
				inHTML += '<a class="widget-close msg-close"></a>';
			}

			inHTML += '<div class="msg-content-wrap">';

			var title = settings._title || '';
			if (settings.titleBar) {
				inHTML += '<h3 class="widget-title msg-title">';
				inHTML += '<span class="msg-title-container">' + title + '</span>';
				inHTML += '</h3>';
			}

			var content = settings.msg || '';

			inHTML += '<div class="widget-content msg-content-container">' + content + '</div>';
			inHTML += '</div>';

			var type = settings.type;
			var buttons = {
				ok: '<div widget="button" id="' + this.domId + '-btn-ok" class="btn-msg-ok" label-field="{false}" text="' + settings.okText + '"></div>',
				no: '<div widget="button" id="' + this.domId + '-btn-no" class="btn-msg-no" label-field="{false}" text="' + settings.noText + '"></div>',
				yes: '<div widget="button" id="' + this.domId + '-btn-ok" class="btn-msg-ok" label-field="{false}" text="' + settings.yesText + '"></div>',
				cancel:
					'<div widget="button" id="' +
					this.domId +
					'-btn-cancel" class="btn-msg-cancel" label-field="{false}" text="' +
					settings.cancelText +
					'"></div>'
			};

			switch (type) {
				case 'alert':
					inHTML += '<div class="msg-btn-container">';
					inHTML += '<div class="msg-btn-wrap">';
					inHTML += '<div class="button-container inline-block">';
					inHTML += buttons.ok;
					inHTML += '</div>';
					inHTML += '</div>';
					inHTML += '</div>';
					break;

				case 'confirm':
					inHTML += '<div class="msg-btn-container">';
					inHTML += '<div class="msg-btn-wrap">';
					inHTML += '<div class="button-container inline-block">';
					inHTML += buttons.no;
					inHTML += '</div>';
					inHTML += '<div class="button-container inline-block">';
					inHTML += buttons.yes;
					inHTML += '</div>';
					inHTML += '</div>';
					inHTML += '</div>';
					break;

				case 'prompt':
					inHTML += '<div class="button-container msg-btn-container">';
					inHTML += '<div class="msg-btn-wrap">';
					inHTML += '<div class="button-container inline-block">';
					inHTML += buttons.cancel;
					inHTML += '</div>';
					inHTML += '<div class="button-container inline-block">';
					inHTML += buttons.ok;
					inHTML += '</div>';
					inHTML += '</div>';
					inHTML += '</div>';
					break;

				case 'show':
					inHTML += '<div class="button-container msg-btn-container">';
					inHTML += '<div class="msg-btn-wrap">';
					inHTML += '<div class="button-container inline-block">';
					inHTML += buttons.cancel;
					inHTML += '</div>';
					inHTML += '<div class="button-container inline-block">';
					inHTML += buttons.no;
					inHTML += '</div>';
					inHTML += '<div class="button-container inline-block">';
					inHTML += buttons.yes;
					inHTML += '</div>';
					inHTML += '</div>';
					inHTML += '</div>';
					break;

				case 'window':
					break;

				default:
					var buttonsCfg = settings.buttons;
					if (buttonsCfg) {
						//这里扩展自定义按钮的情况
					}
					break;
			}

			inHTML += '</div>';

			// for ie shadow
			inHTML = '<div class="position-center-right">' + inHTML + '</div>';
			inHTML = '<div class="position-center-left">' + inHTML + '</div>';

			inHTML = '<div class="position-top-right"></div>' + inHTML;
			inHTML = '<div class="position-top-center"></div>' + inHTML;
			inHTML = '<div class="position-top-left"></div>' + inHTML;

			inHTML += '<div class="position-bottom-left"></div>';
			inHTML += '<div class="position-bottom-center"></div>';
			inHTML += '<div class="position-bottom-right"></div>';

			var msgBoxsContainer = $('div#msg-boxs-container');
			if (msgBoxsContainer.length == 0) {
				msgBoxsContainer = $('<div id="msg-boxs-container" class="msg-boxs-container"></div>');
				$('body').append(msgBoxsContainer);
			}

			msgBoxsContainer.append(_this);

			_this.append($(inHTML)).css({
				'z-index': settings.zIndex == 'auto' ? undefined : settings.zIndex,
				display: 'none'
			});

			if (settings.autoshow) {
				this.show();
			}

			var widgetButtons = _this.find('.msg-btn-container').find('div[widget=button]');

			for (var index = 0, len = widgetButtons.length; index < len; index++) {
				new $.su.widgets.button({ id: $(widgetButtons[index]) }).render();
			}

			if (_this.children('div[widget]').length > 0) {
				_this.children('div[widget]').appendTo(_this.find('div.msg-content-container'));
			}
		},
		show: function (callback) {
			var that = this;
			var _this = this.dom();
			var settings = this.settings;
			var container = this.getContainer();

			var contentContainer = $(_this.find('div.msg-content-wrap .msg-content-container').children().get(0));
			var wh = $(window).height();

			if ($.su.widgetSize !== 's' && settings.dynamicHeight === true && contentContainer.length !== 0) {
				contentContainer.css({
					'max-height': wh - settings.remainHeight
				});
			}

			if (settings.contentScroll && contentContainer.length !== 0) {
				var shouldScroll = true;
				if ($.type(settings.contentScroll) === 'string') {
					var scrollLayouts = settings.contentScroll.split(',');
					shouldScroll = scrollLayouts.includes($.su.widgetSize);
				}

				if (shouldScroll) {
					contentContainer.addClass('scroll');
					$.su.scrollbar({ ele: contentContainer[0] }, function (ps) {
						ps.update();
					});
				}
			}

			if (settings.mask && !settings.shown) {
				this.getMask().show(this.domId);
			}
			container.css({
				top: -9999,
				left: -9999,
				opacity: 0,
				filter: 'alpha(opacity=0)'
			});
			container.show();
			that.setPosition('center', 'center');
			settings.shown = true;

			//set transparent for avoiding strange behavior to be saw when calculate the position
			container.hide();
			container.css({
				opacity: 1,
				filter: 'alpha(opacity=100)'
			});
			container.fadeIn(200);
			if ($.isFunction(callback)) {
				callback();
			}
		},
		close: function (arg1, arg2) {
			var _this = this.dom();
			var settings = this.settings;
			var container = this.getContainer();
			var callback = $.type(arg1) === 'function' ? arg1 : null;
			var destroy = $.type(arg1) === 'boolean' ? arg1 : $.type(arg2) === 'boolean' ? arg2 : false;

			if (!settings || !settings.shown) {
				return;
			}

			if (settings.mask) {
				this.getMask().hide(this.domId);
			}
			if (destroy) {
				container.finish().fadeOut(200, function () {
					settings.shown = false;
					_this.remove();
				});
			} else {
				container.finish().fadeOut(200, function () {
					settings.shown = false;
					container.css({
						display: 'none',
						opacity: 0,
						filter: 'alpha(opacity=0)'
					});
				});
			}
			this.setNormal();

			if (callback) {
				return callback.call(this, this);
			}
		},
		hide: function () {
			var settings = this.settings;
			var container = this.getContainer();

			settings.shown = false;
			container.finish().css({
				display: 'none',
				opacity: 0,
				filter: 'alpha(opacity=0)'
			});
			if (settings.mask) {
				this.getMask().hide(this.domId);
			}
			this.setNormal();
		},
		setTitle: function (title) {
			//_title
			var _this = this.dom();
			var settings = this.settings;
			if (title !== undefined) {
				settings._title = title;
				_this.find('span.msg-title-container').text(title);
			}
		},
		setContent: function (text) {
			//_content可以是html代码！
			var _this = this.dom();
			if (text) {
				_this.find('div.msg-content-container').html(text);
			}
		},
		setButtonText: function (type, text) {
			var _this = this.dom();

			switch (type) {
				case 'yes':
				case 'ok':
					_this.find('.btn-msg-ok').data('viewObj').setText(text);
					break;
				case 'no':
					_this.find('.btn-msg-no').data('viewObj').setText(text);
					break;
				case 'cancel':
					_this.find('.btn-msg-cancel').data('viewObj').setText(text);
					break;
			}
		},
		showButtons: function () {
			var _this = this.dom();
			var buttonsContainer = _this.find('div.msg-btn-container');

			buttonsContainer.fadeIn(150);
		},
		hideButtons: function () {
			var _this = this.dom();
			var buttonsContainer = _this.find('div.msg-btn-container');

			buttonsContainer.css('display', 'none');
		},
		loadingBtn: function (type, flag) {
			var _this = this.dom();

			switch (type) {
				case 'yes':
				case 'ok':
					_this.find('.btn-msg-ok').data('viewObj').loading(flag);
					break;

				case 'no':
					_this.find('.btn-msg-no').data('viewObj').loading(flag);
					break;

				case 'cancel':
					_this.find('.btn-msg-cancel').data('viewObj').loading(flag);
					break;
			}
		},
		disableButton: function (type) {
			var _this = this.dom();

			switch (type) {
				case 'yes':
				case 'ok':
					_this.find('.btn-msg-ok').data('viewObj').disable();
					break;

				case 'no':
					_this.find('.btn-msg-no').data('viewObj').disable();
					break;

				case 'cancel':
					_this.find('.btn-msg-cancel').data('viewObj').disable();
					break;
			}
		},
		enableButton: function (type) {
			var _this = this.dom();

			switch (type) {
				case 'yes':
				case 'ok':
					_this.find('.btn-msg-ok').data('viewObj').enable();
					break;

				case 'no':
					_this.find('.btn-msg-no').data('viewObj').enable();
					break;

				case 'cancel':
					_this.find('.btn-msg-cancel').data('viewObj').enable();
					break;
			}
		},
		destroy: function () {
			var _this = this.dom();
			var settings = this.settings;
			if (settings.mask && !!settings.shown) {
				this.getMask().hide(this.domId);
			}
			_this.remove();
		},
		setNormal: function () {
			var container = this.dom();
			container.find('div[widget]').each(function (i, elem) {
				var viewObj = $(elem).data('viewObj');
				if (!viewObj) {
					// maybe a widget that is not inited, such as `msg`
					return;
				}
				viewObj.setNormal && viewObj.setNormal();
			});
		},
		setScrollToTop: function () {
			var _this = this.dom();
			var contentContainer = _this.find('div.msg-content-wrap .msg-content-container').children();
			contentContainer.scrollTop(0);
		}
	});
})();
