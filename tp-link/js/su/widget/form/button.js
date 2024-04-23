(function () {
	var Button = $.su.Widget.register('button', {
		settings: {
			text: {
				attribute: 'text',
				defaultValue: ''
			},
			iconCls: {
				attribute: 'icon-cls',
				defaultValue: ''
			},
			enableToggle: {
				attribute: 'enable-toggle',
				defaultValue: false
			},
			toggleHander: {
				attribute: 'toggle-hander',
				defaultValue: null
			},
			pressedCls: {
				attribute: 'pressed-cls',
				defaultValue: 'pressed'
			},
			pressed: {
				attribute: 'pressed',
				defaultValue: false
			},
			btnCls: {
				attribute: 'btn-cls',
				defaultValue: 'button-button'
			},
			handler: {
				attribute: 'handler',
				defaultValue: null
			},
			tipText: {
				attribute: 'tip-text',
				defaultValue: ''
			}
		},
		listeners: [
			{
				selector: '',
				event: 'click',
				condition: function (viewObj) {
					var toggle = viewObj.settings.enableToggle;
					return toggle === 'true' || toggle === true;
				},
				callback: function (e, viewObj) {
					e.preventDefault();
					var btn = $(this);
					var settings = viewObj.settings;
					var _prs = settings.pressed;

					if (_prs.toString() === 'false') {
						btn.addClass(settings.pressedCls);
						_prs = true;
					} else {
						btn.removeClass(settings.pressedCls);
						_prs = false;
					}

					btn.attr('pressed', _prs);
					settings.pressed = _prs;

					if ($.type(settings.toggleHander) === 'function') {
						settings.toggleHander.call(this, _prs);
					}
				}
			},
			{
				selector: 'a.button-button',
				event: 'mousedown touchstart',
				callback: function (e, viewObj) {
					e.stopPropagation();
					if (viewObj.getContainer() && !viewObj.getContainer().hasClass('disabled') && !viewObj.getContainer().hasClass('clicked')) {
						viewObj.getContainer().addClass('clicked');
						var btn = $(this);
						var m = btn.find('.button-moire');
						var btnW = btn.outerWidth();
						var btnH = btn.outerHeight();
						var radius = Math.sqrt(btnW * btnW + btnH * btnH);
						m.css({
							width: 2 * radius,
							height: 2 * radius,
							left: e.offsetX - radius,
							top: e.offsetY - radius
						});
					}
				}
			},
			{
				selector: 'a.button-button',
				event: 'mouseup mouseleave touchend touchcancel',
				callback: function (e, viewObj) {
					e.stopPropagation();
					if (viewObj.getContainer() && viewObj.getContainer().hasClass('clicked')) {
						setTimeout(function () {
							var container = viewObj.getContainer();
							if (container) {
								container.removeClass('clicked');
							}
						}, 200);
					}
				}
			},
			{
				selector: 'a.button-button',
				event: 'click',
				callback: function (e, viewObj) {
					e.preventDefault();
					if (viewObj.getContainer() && viewObj.getContainer().hasClass('disabled')) {
						e.stopPropagation();
					} else {
						viewObj.dom().triggerHandler('ev_button_click');
					}
				}
			}
		],
		init: function (options) {},
		render: function () {
			var _this = this.dom();
			var settings = this.settings;
			var cls = settings.btnCls || '';
			var text = settings.text || '';
			var labelField = settings.labelField === false ? 'label-empty' : '';

			_this.addClass(settings.cls + ' button-container ' + labelField);

			var inHTML = '';

			if (settings.labelField !== null) {
				inHTML += '<div class="widget-fieldlabel-wrap ' + settings.labelCls + '">';
				inHTML += '<div class="widget-fieldlabel-inner">';
				inHTML += '<label class="widget-fieldlabel text-fieldlabel">' + settings.labelField + '</label>';
				if (settings.labelField) {
					inHTML += '<span class="widget-separator">' + settings.separator + '</span>';
				}
				inHTML += '</div>';
				inHTML += '</div>';
			}

			inHTML += '<div class="widget-wrap-outer button-wrap-outer">';
			inHTML += '<div class="widget-wrap button-wrap">';
			inHTML += '<a class="' + cls + '" type="button" title="' + text + '">';
			inHTML += '<span class="button-button-before"></span>';
			if (settings.iconCls !== '') {
				inHTML += '<span class="icon button-icon ' + settings.iconCls + '"></span>';
			}
			inHTML += '<span class="text button-text">' + text + '</span>';
			inHTML += '<span class="icon button-loading"></span>';
			inHTML += '<span class="button-moire"></span>';
			inHTML += '</a>';
			inHTML += '</div>';

			if (settings.tips != null && settings.tips != undefined) {
				inHTML += '<div class="widget-tips textbox-tips ' + settings.tipsCls + '">';
				inHTML += '<div class="content tips-content"></div>';
				inHTML += '</div>';
			}

			inHTML += '<div widget="errortip" error-cls="' + settings.errorTipsCls + '">';
			inHTML += '</div>';

			inHTML += '</div>';

			if (settings.tipText) {
				inHTML += '<div widget="toolTip"></div>';
			}

			_this.empty().append(inHTML);

			if (settings.enableToggle === true) {
				var prs = settings.pressed;
				_this.attr('pressed', prs);

				if (prs.toString() === 'true') {
					_this.addClass(settings.pressedCls);
				}
			}

			this.setTips(settings.tips);
		},
		setHref: function (text) {
			var container = this.getContainer();
			var btn = container.find('a.button-button');

			btn.attr('href', text);
		},
		setText: function (text) {
			var settings = this.settings;
			var container = this.getContainer();
			var btnTitle = container.find('a.button-button');
			var btnText = container.find('a.button-button span.button-text');

			if (text) {
				settings.text = text;
				btnText.html(text);
				btnTitle.attr('title', text);
			}
		},
		getText: function () {
			return this.settings.text;
		},
		setValue: function (value) {},
		loading: function (flag) {
			var _this = this.dom();
			if (flag === false) {
				_this.removeClass('loading');
				this.enable();
			} else {
				_this.addClass('loading');
				this.disable();
			}
		},
		setIconCls: function (cls) {
			var clsSpan = this.dom().find('.button-icon');
			clsSpan.removeClass().addClass('icon button-icon ' + cls);
		},
		status: function (status) {
			//remark the button's status
			if (status !== undefined) {
				//remove old status class
				this.dom().removeClass(this.dom().data('status'));

				this.dom().data('status', status);
				this.dom().addClass(status);
			}
			return this.dom().data('status');
		},
		textAnimate: function (flag) {
			var me = this;
			var _this = this.dom();
			var btnText = this.getContainer().find('a.button-button span.button-text');
			if (flag !== false) {
				clearInterval(this.underTextTimer);
				this.underTextTimer = setInterval(function () {
					if (!me.dom().is(':visible')) {
						clearInterval(me.underTextTimer);
						return;
					}
					var text = btnText.text();
					if (/\.\.\.$/.test(text)) {
						text = text.replace(/\.\.\.$/, '');
					} else {
						text += '.';
					}
					text = text.replace(/(\.*$)/, '<span class="dots">$1</span>');
					btnText.html(text);
				}, 500);
			} else {
				clearInterval(this.underTextTimer);
			}
		}
	});
})();
