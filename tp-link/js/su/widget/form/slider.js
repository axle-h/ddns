(function () {
	var Slider = $.su.Widget.register('slider', {
		settings: {
			showPercentage: {
				attribute: 'show-percentage',
				defaultValue: true
			},
			_width: {
				attribute: 'width',
				defaultValue: 255
			},
			inputBox: {
				attribute: 'input-box',
				defaultValue: false
			},
			increment: {
				attribute: 'increment',
				defaultValue: 1
			},
			minValue: {
				attribute: 'min-value',
				defaultValue: 0
			},
			maxValue: {
				attribute: 'max-value',
				defaultValue: 100
			},
			range: {
				attribute: 'range',
				defaultValue: null
			},
			unit: {
				attribute: 'unit',
				defaultValue: ''
			},
			value: {
				attribute: 'value',
				defaultValue: 0
			},
			tipText: {
				attribute: 'tip-text',
				defaultValue: ''
			},
			rangeSlider: {
				attribute: 'range-slider',
				defaultValue: false
			},
			poleValue: {
				attribute: 'pole-value',
				defaultValue: false
			},
			displayValue: {
				attribute: 'display-value',
				defaultValue: false
			},
			valueMarker: {
				attribute: 'value-marker',
				defaultValue: false
			},
			valueMarkerPos: {
				attribute: 'value-marker-pos',
				defaultValue: 'top'
				// top|bottom
			},
			disablePole: {
				attribute: 'disable-pole',
				defaultValue: false
				// both|min|max
			},
			voiceSlider: {
				attribute: 'voice-slider',
				defaultValue: false
			}
		},

		listeners: [
			{
				selector: 'div.left-box input[type=text]',
				event: 'keyup',
				callback: function (e, viewObj) {
					var value = $.su.clone(viewObj.settings.value);
					var val = $(this).val();
					var ret = viewObj.formatType(val);
					if (ret) {
						$(this).val(ret);
						var max = value[0] > value[1] ? value[0] : value[1];
						if (ret <= max) {
							value[0] < value[1] ? (value[0] = ret) : (value[1] = ret);
							viewObj.setValue(value);
						}
					}
				}
			},
			{
				selector: 'div.right-box input[type=text]',
				event: 'keyup',
				callback: function (e, viewObj) {
					var value = $.su.clone(viewObj.settings.value);
					var val = $(this).val();
					var ret = viewObj.formatType(val);
					if (ret) {
						$(this).val(ret);
						if (viewObj.settings.rangeSlider) {
							var min = value[0] < value[1] ? value[0] : value[1];
							if (ret >= min) {
								value[0] > value[1] ? (value[0] = ret) : (value[1] = ret);
								viewObj.setValue(value);
							}
						} else {
							viewObj.setValue(ret);
						}
					}
				}
			},
			{
				selector: 'div.widget-wrap.slider-wrap',
				event: 'click',
				callback: function (e, viewObj) {
					if (viewObj.dom().hasClass('disabled')) {
						return;
					}
					viewObj.dragingHandler(e);
				}
			}
		],

		init: function () {
			var settings = this.settings;
			settings.value = settings.rangeSlider ? [0, 0] : 0;
			this.leftBox = undefined;
			this.rightBox = undefined;
			if (settings.configs && $.type(settings.configs.convertValue) === 'function') {
				this.convertValue = settings.configs.convertValue;
			}
			if (settings.width) {
				settings._width = settings.width;
				delete settings.width;
			}
			settings._splitorWidth = 2;

			if ($.su.widgetSize == 's') {
				var clientWith = document.body.clientWidth;
				var availWidth = 0.75 * clientWith;
				if (availWidth < settings._width) {
					var num = Math.round((settings.maxValue - settings.minValue) / settings.increment);
					availWidth = Math.floor(availWidth / num) * num;
					settings._width = availWidth;
					settings._splitorWidth = 1;
				}
			}
			settings._splitorAll = Math.round(settings._width / Math.round((settings.maxValue - settings.minValue) / settings.increment));
		},

		render: function () {
			var _this = this.dom();
			var settings = this.settings;

			_this.addClass(settings.cls + 'slider-container' + (settings.rangeSlider ? ' range' : ''));

			var inHTML = '';

			if (settings.labelField !== null && settings.labelField !== false) {
				inHTML += '<div class="widget-fieldlabel-wrap ' + settings.labelCls + '">';
				inHTML += '<label class="widget-fieldlabel slider-fieldlabel">' + settings.labelField + '</label>';
				if (settings.labelField !== '') {
					inHTML += '<span class="widget-separator">' + settings.separator + '</span>';
				}
				inHTML += '</div>';
			}
			inHTML += '<div class="widget-wrap-outer slider-wrap-outer' + (settings.voiceSlider ? ' voice-slider' : '') + '">';
			if (settings.inputBox && settings.rangeSlider) {
				inHTML += '<div widget="textbox" id="' + this.domId + '_left_textbox" class="left-box"></div>';
			}
			if (!settings.inputBox && settings.rangeSlider && settings.displayValue) {
				inHTML += '<div class="display-value-container left-value"><span class="content"></span></div>';
			}
			if (settings.voiceSlider) {
				inHTML += '<div class="voice-slider-left"></div>';
			}
			inHTML += '<div class="widget-wrap slider-wrap">';
			inHTML += '<div class="widget-wrap slider-content-left">';
			inHTML += '<div class="widget-wrap slider-content-right">';
			inHTML += '<div class="widget-wrap slider-content">';
			inHTML += '<div class="widget-value slider-value"></div>';
			inHTML += '<div class="split-background"></div>';
			var valStart = !!this.convertValue ? this.convertValue(settings.value[0]) : settings.value[0];
			inHTML +=
				'<div ' +
				(settings.voiceSlider ? '' : 'data-tip="' + valStart + '"') +
				' data-pointer="top" class="widget-value-outer slider-value-outer left">';
			if (settings.valueMarker) {
				inHTML += "<span class='slider-value-marker %pos'>%value</span>"
					.replace('%pos', settings.valueMarkerPos === 'top' ? 'top' : 'bottom')
					.replace('%value', valStart);
			}
			inHTML += '</div>';
			if (settings.rangeSlider) {
				var valEnd = settings.rangeSlider ? settings.value[1] : settings.value;
				valEnd = !!this.convertValue ? this.convertValue(valEnd) : valEnd;
				inHTML += '<div data-tip="' + valEnd + '" data-pointer="top" class="widget-value-outer slider-value-outer right"></div>';
			}
			inHTML += '</div>';

			inHTML += '</div>';

			inHTML += '</div>';
			if (settings.poleValue) {
				var leftValue = settings.minValue;
				var rightValue = settings.maxValue;
				var anchors = settings.anchors;
				if ($.isArray(anchors) && anchors.length <= 2) {
					leftValue = anchors[0] || leftValue;
					rightValue = anchors[1] || rightValue;
				}
				var leftTip = !!this.convertValue ? this.convertValue(leftValue) : leftValue;
				var rightTip = !!this.convertValue ? this.convertValue(rightValue) : rightValue;

				inHTML += '<div class="pole-tips-container">';
				inHTML += '<span class="pole-tips left-tip">' + leftTip + '</span>';
				inHTML += '<span class="pole-tips right-tip">' + rightTip + '</span>';
				inHTML += '</div>';
			}
			inHTML += '</div>';
			if (settings.inputBox) {
				inHTML += '<div widget="textbox" id="' + this.domId + '_right_textbox" class="right-box"></div>';
			}
			if (!settings.inputBox && settings.displayValue) {
				inHTML += '<div class="display-value-container right-value"><span class="content"></span></div>';
			}

			if (settings.tipText) {
				inHTML += '<div widget="toolTip"></div>';
			}

			if (settings.voiceSlider) {
				inHTML += '<div class="voice-slider-right"></div>';
			}

			inHTML += '<div widget="errortip">';
			inHTML += '</div>';

			inHTML += '</div>';
			_this.append($(inHTML));

			this.leftBox = new $.su.widgets.textbox({ id: this.domId + '_left_textbox' });
			this.rightBox = new $.su.widgets.textbox({ id: this.domId + '_right_textbox' });

			this.leftBox.render();
			this.rightBox.render();

			if (settings.maxValue <= settings.minValue) {
				return;
			}

			if (!settings.range) {
				settings.range = [settings.minValue, settings.maxValue];
			}
			// right: 2px;
			// background: repeating-linear-gradient(to right, transparent 0 18px, white 18px 20px);
			_this.find('div.slider-content').css({
				width: settings._width
			});

			if (!settings.voiceSlider) {
				_this.find('.split-background').css({
					right: settings._splitorWidth,
					background:
						'repeating-linear-gradient(to right, transparent 0 ' +
						(settings._splitorAll - settings._splitorWidth) +
						'px, white ' +
						(settings._splitorAll - settings._splitorWidth) +
						'px ' +
						settings._splitorAll +
						'px)'
				});
			}

			_this.find('span.slider-percentage').text(settings.value + settings.unit);
			var viewObj = this;

			_this.find('div.slider-value-outer').on('mousedown touchstart', function (e) {
				if (viewObj.dom().hasClass('disabled')) {
					return;
				}
				$(this).parent().find('div.slider-mask').remove();
				$(this).before('<div class="slider-mask"></div>');
				var isLeft = $(this).hasClass('left');
				var dragingHandler = function (e) {
					var _this = viewObj.dom();
					var settings = viewObj.settings;
					e.type === 'mousemove' && e.preventDefault();
					var wrap = viewObj.dom().find('div.slider-wrap');
					// var tip = $("#global-tip").data("viewObj");
					// tip.removeTip();
					viewObj
						.dom()
						.find('div.slider-value-outer' + (isLeft ? '.left' : '.right'))
						.trigger('mouseenter');

					var maxValue = parseInt(settings.maxValue, 10);
					var minValue = parseInt(settings.minValue, 10);
					var width = parseInt(settings._width, 10);
					var increment = parseInt(settings.increment, 10);
					var posX = e.type === 'mousemove' ? e.pageX || e.screenX : e.originalEvent.changedTouches[0].pageX;
					var left = posX - wrap.offset().left;
					var step = Math.round((left / width) * (maxValue - minValue)) + minValue;
					var l = Math.round(step / increment) * increment;

					if (l > maxValue) {
						l = maxValue;
					} else if (l < minValue) {
						l = minValue;
					}
					var disablePole = settings.disablePole;
					if (disablePole) {
						if (l == minValue && (disablePole == 'both' || disablePole == 'min')) {
							l += increment;
						}
						if (l == maxValue && (disablePole == 'both' || disablePole == 'max')) {
							l -= increment;
						}
					}
					if (!isLeft) {
						var w = posX - wrap.offset().left;
						step = Math.round((w / width) * maxValue);
						var v = Math.round(step / increment) * increment;

						if (v > maxValue) {
							v = maxValue;
						} else if (v < minValue) {
							v = minValue;
						}
					}

					_this.triggerHandler('ev_view_change', [
						{
							type: 'value',
							value: viewObj.settings.rangeSlider ? [isLeft ? l : viewObj.settings.value[0], isLeft ? viewObj.settings.value[1] : v] : l
						}
					]);
				};
				var mouseupHandler = function () {
					// $("#global-tip").data("viewObj").removeTip();
					$('html').off('mousemove touchmove', dragingHandler).off('mouseup touchend', mouseupHandler);
				};
				$('html').on('mousemove touchmove', dragingHandler);
				$('html').on('mouseup touchend', mouseupHandler);
			});
		},

		dragingHandler: function (e) {
			var _this = this.dom();
			var settings = this.settings;
			var viewObj = this;

			e.preventDefault();
			var bar = _this.find('div.slider-wrap');

			var maxValue = parseInt(settings.maxValue, 10);
			var minValue = parseInt(settings.minValue, 10);
			var width = parseInt(settings._width, 10);
			var increment = parseInt(settings.increment, 10);
			var posX = e.pageX || e.screenX;
			var w = posX - bar.offset().left;

			var step = Math.round((w / width) * (maxValue - minValue)) + minValue;
			var v = Math.round(step / increment) * increment;

			if (v > maxValue) {
				v = maxValue;
			} else if (v < minValue) {
				v = minValue;
			}
			var disablePole = settings.disablePole;
			if (disablePole) {
				if (v == minValue && (disablePole == 'both' || disablePole == 'min')) {
					v += increment;
				}
				if (v == maxValue && (disablePole == 'both' || disablePole == 'max')) {
					v -= increment;
				}
			}

			var value = $.isArray(this.settings.value) ? $.su.clone(this.settings.value) : this.settings.value;
			if ($.isArray(value)) {
				Math.abs(v - value[0]) < Math.abs(v - value[1]) ? (value[0] = v) : (value[1] = v);
			}
			var values = (settings.configs && settings.configs.values) || [];
			if (values.length > 0 && !viewObj.settings.rangeSlider) {
				var value = settings.value;
				for (var i = 0, len = values.length - 1; i < len; i++) {
					if (values[i] < value && value < values[i + 1]) {
						_this.triggerHandler('ev_view_change', [
							{
								type: 'value',
								value: value - values[i] <= values[i + 1] - value ? values[i] : values[i + 1]
							}
						]);
						break;
					}
				}
			} else {
				this.setDisplay(viewObj.settings.rangeSlider ? value : v);
				_this.triggerHandler('ev_view_change', [
					{
						type: 'value',
						value: viewObj.settings.rangeSlider ? value : v
					}
				]);
			}
		},

		getValue: function () {
			var settings = this.settings;
			return settings.value;
		},

		setRangeSytle: function (first, second) {
			var _this = this.dom();
			var settings = this.settings;
			var box = _this.find('div.slider-value');
			var leftBar = _this.find('div.slider-value-outer.left');
			var rightBar = _this.find('div.slider-value-outer.right');

			var maxValue = parseInt(settings.maxValue, 10);
			var minValue = parseInt(settings.minValue, 10);

			var maxRange = parseInt(settings.range[1], 10);
			var minRange = parseInt(settings.range[0], 10);

			var width = parseInt(settings._width, 10);

			if (first > maxRange) {
				first = maxRange;
			} else if (first < minRange) {
				first = minRange;
			}

			if (second > maxRange) {
				second = maxRange;
			} else if (second < minRange) {
				second = minRange;
			}

			var l = (width / (maxValue - minValue)) * (first - minValue);
			var l2 = (width / (maxValue - minValue)) * (second - minValue);
			var w = (width / (maxValue - minValue)) * Math.abs(second - first);
			box.css({
				left: l < l2 ? l : l2,
				width: w
			});
			leftBar.css({
				left: l
			});
			rightBar.css({
				left: l2
			});

			// _this.find("span.slider-percentage").html(value + settings.unit);

			first = !!this.convertValue ? this.convertValue(first) : first;
			second = !!this.convertValue ? this.convertValue(second) : second;
			_this.find('.slider-value-outer.left').attr('data-tip', first);
			_this.find('.slider-value-outer.right').attr('data-tip', second);
		},
		setStyle: function (value) {
			var _this = this.dom();
			var settings = this.settings;
			var box = _this.find('div.slider-value');
			var leftBar = _this.find('div.slider-value-outer.left');

			var maxValue = parseInt(settings.maxValue, 10);
			var minValue = parseInt(settings.minValue, 10);

			var maxRange = parseInt(settings.range[1], 10);
			var minRange = parseInt(settings.range[0], 10);

			if (value > maxRange) {
				value = maxRange;
			} else if (value < minRange) {
				value = minRange;
			}

			var width = parseInt(settings._width, 10);

			var w = Math.round((width / (maxValue - minValue)) * (value - minValue));
			// console.log(w);
			box.css({
				width: w
			});
			leftBar.css({
				left: w
			});

			_this.find('span.slider-percentage').html(value + settings.unit);

			value = !!this.convertValue ? this.convertValue(value) : value;

			if (!settings.voiceSlider) {
				_this.find('.slider-value-outer.left').attr('data-tip', value);
			} else {
				value = value + '%';
			}

			if (settings.valueMarker) {
				_this.find('.slider-value-marker').html(value);
			}
		},

		setValue: function (value) {
			var settings = this.settings;
			value = value || (settings.rangeSlider ? [0, 0] : 0);
			settings.value = value;

			if ($.isArray(value)) {
				!!this.leftBox && this.leftBox.setValue(value[0] < value[1] ? value[0] : value[1]);
				!!this.rightBox && this.rightBox.setValue(value[0] < value[1] ? value[1] : value[0]);
				this.setRangeSytle(value[0], value[1]);
			} else {
				if (settings.disablePoints && settings.disablePoints.length > 0) {
					if (settings.disablePoints.indexOf(value) !== -1) {
						var values = settings.enableValue;
						for (var i = 0, l = values.length; i < l; i++) {
							if (values[i] > value) {
								value = i === 0 ? values[i] : value - values[i - 1] <= values[i] - value ? values[i - 1] : values[i];
								settings.value = value;
								break;
							}
						}
					}
				}
				!!this.rightBox && this.rightBox.setValue(value);
				this.setStyle(value);
			}
			this.setDisplay(value);
		},
		setDisplay: function (value) {
			var settings = this.settings;
			if (!settings.inputBox && settings.displayValue) {
				var displayContainer = this.dom().find('.display-value-container');
				var left = displayContainer.filter('.left-value').find('.content');
				var right = displayContainer.filter('.right-value').find('.content');
				if ($.isArray(value)) {
					var min = value[0] < value[1] ? value[0] : value[1];
					var max = value[0] < value[1] ? value[1] : value[0];
					if (!!this.convertValue) {
						min = this.convertValue(min);
						max = this.convertValue(max);
					}
					left.length > 0 && left.text(min);
					right.length > 0 && right.text(max);
				} else {
					value = !!this.convertValue ? this.convertValue(value) : value;
					right.text(value);
				}
			}
		},
		setRange: function (range) {
			var settings = this.settings;

			if (range[0] < settings.minValue) {
				range[0] = settings.minValue;
			}

			if (range[1] > settings.maxValue) {
				range[1] = settings.maxValue;
			}

			if (range[0] > range[1]) {
				range[1] = range[0] - range[1];
				range[0] = range[0] - range[1];
				range[1] = range[0] + range[1];
			}

			settings.range = range;
		},

		setMaxValue: function (max) {
			max = parseInt(max);

			if ($.type(max) !== 'number') {
				return;
			}

			this.settings.maxValue = max;
		},

		setMinValue: function (min) {
			min = parseInt(min);

			if ($.type(min) !== 'number') {
				return;
			}

			this.settings.minValue = min;
		},
		formatType: function (value) {
			var formattedValue = parseFloat(value, 10);
			if (/^\d+$/.test(value) && $.isNumeric(formattedValue)) {
				return formattedValue;
			} else if (isNaN(formattedValue) || (formattedValue + '').length !== (value + '').length) {
				return value;
			} else return false;
		},
		disable: function () {
			this.dom().addClass('disabled');
			!!this.leftBox && this.leftBox.disable();
			!!this.rightBox && this.rightBox.disable();
		},
		enable: function () {
			this.dom().removeClass('disabled');
			!!this.leftBox && this.leftBox.enable();
			!!this.rightBox && this.rightBox.enable();
		},
		setDisablePoints: function (p) {
			var settings = this.settings;
			if (settings.configs && settings.configs.values) {
				var values = settings.configs.values.slice();
				p = $.type(p) === 'array' ? p : [p];
				var val = this.getValue();
				var index = p.indexOf(val);
				settings.disablePoints = p.slice();
				for (var m = 0, len = p.length; m < len; m++) {
					var valIdx = values.indexOf(p[m]);
					if (valIdx !== -1) {
						values.splice(valIdx, 1);
					}
				}
				values.sort(function (v1, v2) {
					return v1 - v2;
				});
				settings.enableValue = values;
				if (index !== -1) {
					this.setValue(val);
				}
			}
		}
	});
})();
