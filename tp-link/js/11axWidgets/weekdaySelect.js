/*
 * @description
 * @author XCH
 * @change
 *   2017/12/07: create file
 *
 * */
(function ($) {
	var weekdaySelect = $.su.Widget.register('weekdaySelect', {
		settings: {
			format: {
				attribute: 'format',
				defaultValue: function (valueArr) {
					var value = valueArr.join(',');
					var weekdaysReg = /(((mon)|(tue)|(wed)|(thu)|(fri)),){4}((mon)|(tue)|(wed)|(thu)|(fri))/;
					var weekendsReg = /((sat)|(sun)),((sat)|(sun))/;

					if (value.split(',').length == 7) {
						return 'eve';
					} else if (value.split(',').length == 5 && weekdaysReg.test(value)) {
						return 'weekdays';
					} else if (value.split(',').length == 2 && weekendsReg.test(value)) {
						return 'weekends';
					} else {
						return value;
					}
				}
			}
		},

		listeners: [
			{
				selector: '.icon',
				event: 'click',
				callback: function (e, viewObj) {
					$(this).toggleClass('selected');
					var val = viewObj.getValue();

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
			var settings = this.settings;
			var labelField = settings.labelField === false ? 'label-empty' : '';

			_this.addClass(settings.cls + 'wireless-schedule-repeat-container ' + labelField);

			var innerHTML = '';
			if (settings.labelField !== null) {
				innerHTML += '<div class="widget-fieldlabel-wrap' + settings.labelCls + (settings.labelField == '' ? ' empty' : '') + '">';
				innerHTML += '<div class="widget-fieldlabel-inner">';
				innerHTML += '<label class="widget-fieldlabel text-fieldlabel">' + settings.labelField + '</label>';
				if (settings.labelField) {
					innerHTML += '<span class="widget-separator">' + settings.separator + '</span>';
				}
				innerHTML += '</div>';
				innerHTML += '</div>';
			}
			innerHTML += '<div class="widget-wrap-outer wireless-schedule-repeat-wrap-outer">';
			innerHTML += '<ul>';
			innerHTML += '<li ><span class="icon sun" data-type="sun"></span></li> ';
			innerHTML += '<li ><span class="icon mon" data-type="mon"></span></li> ';
			innerHTML += '<li ><span class="icon tue" data-type="tue"></span></li> ';
			innerHTML += '<li ><span class="icon wed" data-type="wed"></span></li> ';
			innerHTML += '<li ><span class="icon thu" data-type="thu"></span></li> ';
			innerHTML += '<li ><span class="icon fri" data-type="fri"></span></li> ';
			innerHTML += '<li ><span class="icon sat" data-type="sat"></span></li> ';
			innerHTML += '</ul>';
			innerHTML += '<div widget="errortip" error-cls="' + settings.errorTipsCls + '">';
			innerHTML += '</div>';
			innerHTML += '</div>';

			_this.empty().append(innerHTML);
		},

		setValue: function (value) {
			var _this = this.dom();
			if (value) {
				var days = value.split(',');
				_this.find('.icon').removeClass('selected');

				if (value == 'eve') {
					_this.find('.icon').addClass('selected');
					return;
				} else if (value == 'weekdays') {
					_this.find('.icon.mon').addClass('selected');
					_this.find('.icon.tue').addClass('selected');
					_this.find('.icon.wed').addClass('selected');
					_this.find('.icon.thu').addClass('selected');
					_this.find('.icon.fri').addClass('selected');
					return;
				} else if (value == 'weekends') {
					_this.find('.icon.sat').addClass('selected');
					_this.find('.icon.sun').addClass('selected');
					return;
				}
				for (var i = 0; i < days.length; i++) {
					var day = days[i].toLowerCase();
					_this.find('.icon.' + day).addClass('selected');
				}
			} else {
				_this.find('.icon').removeClass('selected');
			}
		},

		getValue: function () {
			var _this = this.dom();
			var valueArr = [];
			var days = _this.find('.icon');
			var format = this.settings.format;

			for (var i = 0; i < days.length; i++) {
				if ($(days[i]).hasClass('selected')) {
					valueArr.push($(days[i]).attr('data-type'));
				}
			}

			return format(valueArr);
		}
	});
})(jQuery);
