(function () {
	var Time = $.su.Widget.register('time', {
		settings: {
			format: {
				attribute: 'format',
				defaultValue: 'h:i:s'
			},
			hourSystem: {
				attribute: 'hour-system',
				defaultValue: '24'
			},
			minuteInterval: {
				attribute: 'minute-interval',
				defaultValue: '1'
			},
			subLabelField: {
				attribute: 'sub-label-field',
				defaultValue: ''
			},
			shortTips: {
				attribute: 'short-tips',
				defaultValue: null
			}
		},

		listeners: [
			{
				selector: function () {
					return {
						parent: this.timers.hour.dom()
					};
				},
				condition: function (viewObj) {
					return !!viewObj.timers.hour;
				},
				event: 'ev_view_change',
				callback: function (e, val) {
					var viewObj = Array.prototype.slice.call(arguments, 0).reverse()[0];
					if (val.type === 'value') {
						viewObj.timers.hour.setValue(val.value);
						viewObj.viewChange(viewObj.getValue());
					}
				}
			},
			{
				selector: function () {
					return {
						parent: this.timers.minute.dom()
					};
				},
				condition: function (viewObj) {
					return !!viewObj.timers.minute;
				},
				event: 'ev_view_change',
				callback: function (e, val) {
					var viewObj = Array.prototype.slice.call(arguments, 0).reverse()[0];
					if (val.type === 'value') {
						viewObj.timers.minute.setValue(val.value);
						viewObj.viewChange(viewObj.getValue());
					}
				}
			},
			{
				selector: function () {
					return {
						parent: this.timers.second.dom()
					};
				},
				condition: function (viewObj) {
					return !!viewObj.timers.second;
				},
				event: 'ev_view_change',
				callback: function (e, val) {
					var viewObj = Array.prototype.slice.call(arguments, 0).reverse()[0];
					if (val.type === 'value') {
						viewObj.timers.second.setValue(val.value);
						viewObj.viewChange(viewObj.getValue());
					}
				}
			},
			{
				selector: function () {
					return {
						parent: this.timers.ampm.dom()
					};
				},
				condition: function (viewObj) {
					return !!viewObj.timers.ampm;
				},
				event: 'ev_view_change',
				callback: function (e, val) {
					var viewObj = Array.prototype.slice.call(arguments, 0).reverse()[0];
					if (val.type === 'value') {
						viewObj.timers.ampm.setValue(val.value);
						viewObj.viewChange(viewObj.getValue());
					}
				}
			}
		],

		init: function () {
			this.timers = {
				hour: null,
				minute: null,
				second: null,
				ampm: null
			};
		},

		destroy: function () {
			var _this = this.dom();
			_this.removeClass();
			_this.empty();
			for (var item in this.timers) {
				if (this.timers.hasOwnProperty(item) && this.timers[item]) {
					this.timers[item].dom().remove();
				}
			}
		},

		render: function () {
			var _this = this.dom();
			var settings = this.settings;
			var hour = ' hour-' + settings.hourSystem;
			var shortTips = settings.shortTips === '' ? '' : ' short-tips';
			_this.addClass(settings.cls + 'combobox-container time-container' + hour + shortTips);

			var inHTML = '';

			if (settings.labelField !== false || settings.subLabelField) {
				inHTML += '<div class="widget-fieldlabel-wrap ' + settings.labelCls + (settings.labelField ? ' has-main-label' : '') + '">';
				inHTML += '<div class="widget-fieldlabel-inner">';
				inHTML += '<label class="widget-fieldlabel time-fieldlabel">' + settings.labelField + '</label>';
				if (settings.labelField !== '') {
					inHTML += '<span class="widget-separator">' + settings.separator + '</span>';
				}
				if (settings.subLabelField !== '') {
					inHTML += '<span class="widget-sub-fieldlabel time-sub-fieldlabel">' + settings.subLabelField + '</span>';
				}
				inHTML += '</div>';
				inHTML += '</div>';
			}

			var _format = settings.format;
			var _sepMark = _format.charAt(1) || ' ';
			var items = _format.split(_sepMark);
			settings.sepMark = _sepMark;
			var comboboxCount = 0;
			inHTML += '<div class="widget-wrap-outer time-wrap-outer">';
			inHTML += '<div class="widget-wrap time-wrap">';

			for (var i = 0, len = items.length; i < len; i++) {
				comboboxCount++;
				switch (items[i]) {
					case 'H':
					case 'h':
						inHTML += '<div widget="combobox" id="' + this.domId + '_hour" class="label-empty combobox-hour' + (' combobox-' + i) + '"></div>';
						this.timers.hour = this.domId + '_hour';
						break;
					case 'I':
					case 'i':
						inHTML += '<div widget="combobox" id="' + this.domId + '_minute" class="label-empty combobox-minute' + (' combobox-' + i) + '"></div>';
						this.timers.minute = this.domId + '_minute';
						break;
					case 'S':
					case 's':
						inHTML += '<div widget="combobox" id="' + this.domId + '_second" class="label-empty combobox-second' + (' combobox-' + i) + '"></div>';
						this.timers.second = this.domId + '_second';
						break;
				}
				if (i < len - 1) {
					inHTML += '<span class="separator separator-' + i + '">' + _sepMark + '</span>';
				}
			}

			if (settings.hourSystem === '12') {
				comboboxCount++;
				inHTML += '<span class="separator separator-' + (i - 1) + '"> </span>';
				inHTML += '<div widget="combobox" id="' + this.domId + '_ampm" class="label-empty combobox-ampm' + (' combobox-' + i) + '"></div>';
				this.timers.ampm = this.domId + '_ampm';
			}
			inHTML += '</div>';
			if (settings.shortTips != null && settings.shortTips != undefined) {
				inHTML += '<div class="widget-short-tips textbox-short-tips">';
				inHTML += '<div class="content short-tips-content">' + settings.shortTips + '</div>';
				inHTML += '</div>';
			}
			inHTML += '<div widget="errortip" error-cls="' + settings.errorTipsCls + '">';
			inHTML += '</div>';

			if (settings.tips != null && settings.tips != undefined) {
				inHTML += '<div class="widget-tips textbox-tips ' + settings.tipsCls + '">';
				inHTML += '<div class="content tips-content"></div>';
				inHTML += '</div>';
			}

			inHTML += '</div>';

			if (settings.tipText) {
				inHTML += '<div widget="toolTip"></div>';
			}

			_this.append($(inHTML));
			_this.addClass('total-' + comboboxCount);
			for (var t in this.timers) {
				if (this.timers.hasOwnProperty(t) && this.timers[t]) {
					this.timers[t] = new $.su.widgets.combobox({
						id: this.timers[t]
					});
					this.timers[t].render();
					if (t === 'minute') {
						var options = this.getOptions(t).filter(function (item) {
							return item.value % parseInt(settings.minuteInterval) === 0;
						});
						this.timers[t].loadItems(options);
					} else {
						this.timers[t].loadItems(this.getOptions(t));
					}
				}
			}
		},

		getHour: function () {
			return (this.timers.hour && this.timers.hour.getValue()) || 0;
		},

		getMinute: function () {
			return (this.timers.minute && this.timers.minute.getValue()) || 0;
		},

		getSecond: function () {
			return (this.timers.second && this.timers.second.getValue()) || 0;
		},

		setValue: function (value) {
			var _this = this.dom();
			var settings = this.settings;
			var format = settings.format;
			var separator = settings.sepMark;

			if ($.type(value) === 'string') {
				value = value.split(separator);
			}

			if ($.type(value) !== 'array') {
				return;
			}
			this._value = value;

			var formats = format.split(separator);

			for (var index = 0, len = formats.length; index < len; index++) {
				var fmt = formats[index];
				var val = parseInt(value[index], 10);
				var lis;

				switch (fmt) {
					case 'H':
					case 'h':
						if (settings.hourSystem === '12') {
							if (val < 12) {
								// am
								this.timers.ampm.setValue(0);
							} else {
								// pm
								this.timers.ampm.setValue(1);
							}
							val = val % 12;
							if (val === 0) {
								val = 12;
							}
						}
						this.timers.hour.setValue(val);
						break;
					case 'i':
						this.timers.minute.setValue(val);
						break;
					case 's':
						this.timers.second.setValue(val);
						break;
				}
			}
		},

		getValue: function () {
			var time = [];
			var format = this.settings.format;
			var hour = this.getHour();
			var minute = this.getMinute();
			var second = this.getSecond();

			if ($.type(hour) === 'number' && this.settings.hourSystem === '12') {
				if (this.timers.ampm.getValue() === 1) {
					// pm
					if (hour !== 12) {
						hour += 12;
					}
				} else {
					// am
					if (hour === 12) {
						hour = 0;
					}
				}
			}
			if (/[hH]/.test(format)) {
				time.push(hour < 10 ? '0' + hour : hour);
			}
			if (/[iI]/.test(format)) {
				time.push(minute < 10 ? '0' + minute : minute);
			}
			if (/[sS]/.test(format)) {
				time.push(second < 10 ? '0' + second : second);
			}
			return time.join(this.settings.sepMark);
		},

		viewChange: function (val) {
			this.dom().triggerHandler('ev_view_change', [
				{
					type: 'value',
					value: val
				}
			]);
		},

		getOptions: function (type) {
			var min = 0;
			var max = 0;
			var options = [];
			var settings = this.settings;

			if (type === 'ampm') {
				return [
					{
						name: 'AM',
						value: 0,
						boxlabel: 'AM',
						selected: true
					},
					{
						name: 'PM',
						value: 1,
						boxlabel: 'PM'
					}
				];
			}

			switch (type) {
				case 'hour':
					min = settings.hourSystem === '12' ? 1 : 0;
					max = settings.hourSystem === '12' ? 12 : 23;
					break;
				case 'minute':
				case 'second':
					max = 59;
					break;
			}
			for (var i = min; i <= max; i++) {
				var value = i < 10 && (settings.hourSystem === '24' || type !== 'hour') ? '0' + i : '' + i;
				options.push({
					name: value,
					value: i,
					boxlabel: value,
					selected: i === min ? true : false
				});
			}
			return options;
		},
		setSubLabel: function (text) {
			if (text !== undefined && text !== null) {
				this.dom().find('.time-sub-fieldlabel').html(text);
			}
		},
		setHourSystem: function (hourType) {
			if (hourType !== '12' && hourType !== '24') {
				return false;
			}

			var settings = this.settings;
			var value = this.getValue();

			if (hourType === settings.hourSystem) {
				return;
			}

			settings.hourSystem = hourType;
			this.destroy();
			this.init();
			this.render();
			this.setValue(value);
		}
	});
})();
