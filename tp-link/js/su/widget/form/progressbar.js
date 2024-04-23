(function () {
	var Progressbar = $.su.Widget.register('progressbar', {
		settings: {
			text: {
				attribute: 'text',
				defaultValue: ''
			},
			unit: {
				attribute: 'unit',
				defaultValue: '%'
			},
			_timeout: {
				attribute: 'timeout',
				defaultValue: '0'
			},
			duration: {
				attribute: 'duration',
				defaultValue: 1000
			},
			value: {
				attribute: 'value',
				defaultValue: 0
			}, //0-1
			url: {
				attribute: 'url',
				defaultValue: null
			},
			animate: {
				attribute: 'animate',
				defaultValue: true
			},
			showPercentage: {
				attribute: 'show-percentage',
				defaultValue: true
			},
			underText: {
				attribute: 'under-text',
				defaultValue: null
			},
			infinite: {
				attribute: 'infinite',
				defaultValue: false
			},
			circle: {
				attribute: 'circle',
				defaultValue: false
			},
			fn: {
				attribute: 'fn',
				defaultValue: null
			},
			ptype: {
				attribute: 'ptype',
				defaultValue: 'horizontal' //horizontal vertical
			},
			tipText: {
				attribute: 'tip-text',
				defaultValue: ''
			},
			step: {
				attribute: 'step',
				defaultValue: false //gradual change default, step change if 'step' defined
			},
			animateText: {
				attribute: 'animate-text',
				defaultValue: ''
			}
		},
		init: function () {
			var settings = this.settings;
			if (settings.step !== false) {
				settings.step = parseInt(settings.step, 10);
			}
		},
		render: function () {
			var _this = this.dom();
			var settings = this.settings;

			var type = settings.ptype;
			var _value = settings.value;
			var _width = settings.width;
			var _height = settings.height;
			var labelField = settings.labelField === false ? 'label-empty' : '';
			var infinite = settings.infinite ? ' infinite-progress' : '';
			var circle = settings.circle ? ' circle-progress' : '';

			_this.addClass(settings.cls + 'progressbar-container progressbar-' + type + ' ' + labelField + infinite + circle);

			var inHTML = '';

			if (settings.labelField !== null) {
				inHTML += '<div class="widget-fieldlabel-wrap ' + settings.labelCls + '">';
				inHTML += '<div class="widget-fieldlabel-inner">';
				inHTML += '<label class="widget-fieldlabel processbar-fieldlabel">' + settings.labelField + '</label>';
				if (settings.labelField) {
					inHTML += '<span class="widget-separator">' + settings.separator + '</span>';
				}
				inHTML += '</div>';
				inHTML += '</div>';
			}

			inHTML += '<div class="widget-wrap-outer progressbar-wrap-outer">';
			inHTML += '<div class="widget-wrap progressbar-wrap">';
			inHTML += '<div class="widget-wrap progressbar-content">';
			inHTML += '<div class="progressbar-value"></div>';
			inHTML += '</div>';
			if (settings.text != '' || settings.showPercentage) {
				inHTML += '<div class="progressbar-text">';

				if (settings.text != '') {
					inHTML += '<span class="progressbar-text">' + settings.text + '</span>';
				}
				if (settings.showPercentage) {
					inHTML += '<span class="progressbar-percentage">' + _value + settings.unit + '</span>';
				}

				inHTML += '</div>';
			}

			inHTML += '</div>';
			if (settings.underText != null && settings.underText != undefined) {
				inHTML += '<div class="progressbar-under-text-wrap">';
				inHTML += '<div class="progressbar-under-text">';
				inHTML += settings.underText;
				inHTML += '</div>';
				inHTML += '</div>';
			}
			inHTML += '<div widget="errortip" error-cls="' + settings.errorTipsCls + '">';
			inHTML += '</div>';

			if (settings.tips != null && settings.tips != undefined) {
				inHTML += '<div class="widget-tips textbox-tips ' + settings.tipsCls + '">';
				inHTML += '<div class="content tips-content">' + settings.tips + '</div>';
				inHTML += '</div>';
			}

			inHTML += '</div>';

			if (settings.tipText) {
				inHTML += '<div widget="toolTip"></div>';
			}

			_this.append(inHTML);

			_this.find('div.progressbar-content').css({
				width: _width,
				height: _height
			});

			this.setTips(settings.tips);

			this.childrenDom = {};
			this.childrenDom.container = this.getContainer();
			this.childrenDom.progressbarBox = this.childrenDom.container.find('div.progressbar-content');
			this.childrenDom.progressbarBar = this.childrenDom.progressbarBox.children('div.progressbar-value');
			this.childrenDom.percentageBox = this.childrenDom.container.find('span.progressbar-percentage');
		},

		getValue: function () {
			return this.settings.value;
		},
		setValue: function (value, duration) {
			if (value === undefined || value === null) {
				return;
			}

			var settings = this.settings;
			settings.prevValue = settings.value;
			settings.value = value;

			var animateFlag = settings.animate;
			if (!animateFlag) {
				this.updateViewByPercentageVal(value);
			} else {
				this.animate({
					percentageStart: settings.prevValue,
					percentageEnd: value,
					duration: duration || settings.duration
				});
			}
		},
		animate: function (args) {
			var me = this;
			var settings = this.settings;
			var container = this.getContainer();
			var type = settings.ptype;
			var unit = settings.unit;
			var property = type === 'horizontal' ? 'width' : 'height';

			var percentageStart = args.percentageStart === null ? 0 : args.percentageStart;
			percentageStart = parseInt(percentageStart, 10);
			var percentageEnd = parseInt(args.percentageEnd, 10);
			var duration = $.type(parseInt(args.duration, 10)) === 'number' ? parseInt(args.duration, 10) : 500;
			var callback = args.callback || null;
			var percentageCurrent = percentageStart || 0;

			var progressbarBox = container.find('div.progressbar-content'),
				progressbarBar = progressbarBox.children('div.progressbar-value'),
				percentageBox = container.find('span.progressbar-percentage');

			var num = progressbarBox[property]();

			this.updateViewByPercentageVal(percentageStart);

			var t = parseInt(duration / Math.abs(percentageEnd - percentageStart), 10);

			var start = new Date();
			var start_time = start.getTime();
			clearInterval(settings._timeout);
			settings._timeout = setInterval(function () {
				var animateObj;
				var now = new Date();
				var now_time = now.getTime();
				var time_gap = now_time - start_time;
				var bar_gap = Math.round(time_gap / t);
				start_time = now_time;
				if (percentageCurrent != percentageEnd) {
					if (percentageCurrent > percentageEnd) {
						percentageCurrent -= bar_gap;
						percentageCurrent = percentageCurrent < percentageEnd ? percentageEnd : percentageCurrent;
					} else {
						percentageCurrent += bar_gap;
						percentageCurrent = percentageCurrent > percentageEnd ? percentageEnd : percentageCurrent;
					}
					settings.percentageCurrent = percentageCurrent.toFixed(1) / 100;

					if (settings.step !== false) {
						me.updateViewByPercentageVal(percentageCurrent);
					} else {
						animateObj = property === 'width' ? { width: percentageCurrent + unit } : { height: percentageCurrent + unit };
						progressbarBar.clearQueue().animate(animateObj, t, function () {
							percentageBox.html(percentageCurrent + unit);
						});
						me.settings.value = percentageCurrent;
					}
				} else {
					clearInterval(settings._timeout);
					settings._timeout = 0;
					me.updateViewByPercentageVal(percentageEnd);
					if (callback) {
						callback.call(this);
					}
				}
			}, t);
		},
		animateInfinite: function (flag) {
			this.underTextAnimate(flag);
			var me = this;
			var settings = this.settings;
			var container = this.getContainer();
			var type = settings.ptype;
			var unit = settings.unit;
			var progressbarBox = container.find('div.progressbar-content'),
				progressbarBar = progressbarBox.children('div.progressbar-value');

			if (settings.circle == true) {
				return;
			}
			if (flag !== false) {
				var animateFun = function () {
					progressbarBar.css({
						left: -progressbarBar.width()
					});
					progressbarBar.clearQueue().animate(
						{
							left: '100%'
						},
						4000
					);
				};
				animateFun();

				clearInterval(settings._timeout);
				settings._timeout = setInterval(function () {
					animateFun();
				}, 4000);
			} else {
				progressbarBar.clearQueue();
				clearInterval(settings._timeout);
			}
		},
		reset: function () {
			var settings = this.settings;
			var container = this.getContainer();
			var unit = settings.unit;
			var property = settings.ptype === 'horizontal' ? 'width' : 'height';

			this.stop();

			var progressbarBox = container.find('div.progressbar-content'),
				progressbarBar = progressbarBox.children('div.progressbar-value'),
				percentageBox = container.find('span.progressbar-percentage');

			var animateObj = property === 'width' ? { width: 0 } : { height: 0 };

			progressbarBar.stop();
			progressbarBar.css(animateObj);
			percentageBox.html(0 + unit);
			this.settings.value = 0;
		},
		stop: function () {
			clearInterval(this.settings._timeout);
		},
		setText: function (text) {
			var container = this.getContainer();

			var textBox = container.find('span.progressbar-text');
			textBox.text(text);
		},
		hide: function () {
			var container = this.getContainer();
			container.css('display', 'none');
		},
		show: function () {
			var container = this.getContainer();
			container.fadeIn(150);
		},
		hideBar: function () {
			var _this = this.dom();
			_this.find('div.progressbar-content').hide();
			_this.addClass('hide-bar');
		},
		showBar: function () {
			var _this = this.dom();
			_this.find('div.progressbar-content').show();
			_this.removeClass('hide-bar');
		},
		updateViewByPercentageVal: function (value) {
			var childrenDom = this.childrenDom;

			var settings = this.settings;
			var container = childrenDom.container;

			var type = settings.ptype;
			var unit = settings.unit;
			var property = type === 'horizontal' ? 'width' : 'height';

			var progressbarBar = childrenDom.progressbarBar;
			var percentageBox = childrenDom.percentageBox;
			var visualWidthHeight = value + '%';

			if (settings.step !== false) {
				visualWidthHeight = ((value * settings.step) / 100).toFixed(0) / settings.step + '%';
			}

			progressbarBar.css(property, visualWidthHeight);
			percentageBox.text(value + unit);
			this.settings.value = value;
		},
		setUnderText: function (text) {
			var _this = this.dom();
			if (text !== null && text !== undefined) {
				var underTextDom = _this.find('.progressbar-under-text-wrap');
				if (text == '') {
					underTextDom.hide();
				} else {
					underTextDom.show().find('.progressbar-under-text').html(text);
				}
			}
		},
		underTextAnimate: function (flag) {
			var me = this;
			var _this = this.dom();
			var underTextDom;
			if (this.settings.animateText) {
				underTextDom = $(this.settings.animateText);
			} else {
				underTextDom = _this.find('.progressbar-under-text');
			}
			if (underTextDom.length == 0) {
				return;
			}
			if (flag !== false) {
				clearInterval(this.underTextTimer);
				this.underTextTimer = setInterval(function () {
					if (!me.dom().is(':visible')) {
						clearInterval(me.underTextTimer);
						return;
					}
					var text = underTextDom.text();
					if (/\.\.\.$/.test(text)) {
						text = text.replace(/\.\.\.$/, '');
					} else {
						text += '.';
					}
					underTextDom.text(text);
				}, 500);
			} else {
				clearInterval(this.underTextTimer);
			}
		},
		continueToEnd: function (percentageEnd, duration, callback) {
			var startPercent = this.getValue();
			var func = $.isFunction(callback) ? callback : function () {};
			if (startPercent >= percentageEnd) {
				func();
				return;
			}
			this.animate({
				percentageStart: startPercent,
				percentageEnd: percentageEnd,
				duration: duration,
				callback: func
			});
		},
		destroy: function () {
			this.stop();
		}
	});
})();
