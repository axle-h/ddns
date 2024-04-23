(function () {
	var SimpleDatepicker = $.su.Widget.register('simpleDatepicker', {
		extend: ['datepicker'],
		settings: {},
		listeners: [
			{
				selector: '.display-area',
				event: 'click',
				callback: function (e, viewObj) {
					if (viewObj.dom().find('.calendar-bar-month').size() == 0) {
						viewObj.renderDateCalendarBar();
					}
				}
			},
			{
				selector: '.date-calendar-container a',
				event: 'click',
				callback: function (e, viewObj) {
					var target = $(e.target);
					// viewObj.clickDateCalendar(target);

					var targetItem = target.closest('table');
					if (targetItem.hasClass('calendar-bar-month')) {
						var curTarget = target.closest('th');

						if (curTarget.hasClass('displayed-month')) {
							viewObj.dom().find('.date-calendar-container').hide();
							var monthCalendar = viewObj.dom().find('.month-calendar-container');
							if (monthCalendar.size() > 0) {
								monthCalendar.show();
								viewObj.updateMonthCalendar();
							} else {
								viewObj.syncMonthCalendar();
							}
						} else {
							viewObj.changeMonth(curTarget);
							viewObj.dom().triggerHandler('ev_view_change', [
								{
									type: 'value',
									value: viewObj.getValue()
								}
							]);
						}
					} else {
						viewObj.updateDateCalendarBar(viewObj.datepickerInfo.date);
						if (!$(target).closest('td').hasClass('stroke-selection')) {
							viewObj.dom().triggerHandler('ev_view_change', [
								{
									type: 'value',
									value: viewObj.getValue()
								}
							]);
						}
					}
				}
			},
			{
				selector: '.month-calendar-container a',
				event: 'click',
				callback: function (e, viewObj) {
					e.stopPropagation();
					var target = $(e.target);
					var targetItem = target.closest('table');
					//					debugger
					if (targetItem.hasClass('calendar-bar-year')) {
						var curTarget = target.closest('th');

						if (curTarget.hasClass('displayed-year')) {
							viewObj.dom().find('.month-calendar-container').hide();
							viewObj.syncYearCalendar();
						} else {
							viewObj.changeYear(curTarget);
						}
					} else {
						var curTarget = target.closest('td');
						viewObj.selectMonth(curTarget);
					}
					viewObj.dom().triggerHandler('ev_view_change', [
						{
							type: 'value',
							value: viewObj.getValue()
						}
					]);
				}
			},
			{
				selector: '.year-calendar-container a',
				event: 'click',
				callback: function (e, viewObj) {
					var target = $(e.target);
					var targetItem = target.closest('table');

					if (targetItem.hasClass('calendar-bar-yearslot')) {
						var curTarget = target.closest('th');

						if (curTarget.hasClass('displayed-yearslot')) {
							viewObj.dom().find('.year-calendar-container').hide();

							viewObj.syncYearslotCalendar();
						} else {
							viewObj.changeYearslot(curTarget);
						}
					} else {
						var curTarget = target.closest('td');
						viewObj.selectYear(curTarget);
					}
					viewObj.dom().triggerHandler('ev_view_change', [
						{
							type: 'value',
							value: viewObj.getValue()
						}
					]);
				}
			},
			{
				selector: '.yearslot-calendar-container a',
				event: 'click',
				callback: function (e, viewObj) {
					var target = $(e.target);
					var targetItem = target.closest('table');

					if (targetItem.hasClass('calendar-bar-century')) {
						var curTarget = target.closest('th');

						if (!curTarget.hasClass('displayed-century')) {
							viewObj.changeCentury(curTarget);
						}
					} else {
						var curTarget = target.closest('td');
						viewObj.selectYearslot(curTarget);
					}
					viewObj.dom().triggerHandler('ev_view_change', [
						{
							type: 'value',
							value: viewObj.getValue()
						}
					]);
				}
			}
		],
		init: function (options) {
			SimpleDatepicker.superclass.init.call(this, options);
		},
		render: function () {
			SimpleDatepicker.superclass.render.call(this);
		},
		renderDateCalendarBar: function () {
			var container = this.dom().find('.date-calendar-container');
			var date = this.datepickerInfo.date;
			var months = this.getMonths('whole');
			var month = date.getMonth();
			var year = date.getFullYear();

			var text = '<table class="calendar-bar-month calendar-head">';
			text += '<tr>';
			text += '<th class="prev-month-icon left-icon datepicker-icon">';
			text += '<a><</a>';
			text += '</th>';
			text += '<th class="displayed-month calendar-time-th" colspan="5" item-value="' + (month + '-' + year) + '">';
			text += '<a>' + months[month] + ' ' + year + '</a>';
			text += '</th>';
			text += '<th class="next-month-icon right-icon datepicker-icon">';
			text += '<a>></a>';
			text += '</th>';
			text += '</tr>';
			text += '</table>';

			container.prepend($(text));
		},
		changeMonth: function (target) {
			var curDate = this.datepickerInfo.date;
			var year = curDate.getFullYear();
			var month = curDate.getMonth();
			var date = curDate.getDate();
			if (target.hasClass('prev-month-icon')) {
				month = month - 1;
			} else {
				month = month + 1;
			}

			var newDate = new Date(year, month, date);
			this.updateDateCalendarBar(newDate);
			this.updateCalendar(newDate);
		},
		updateDateCalendarBar: function (date) {
			var months = this.getMonths('whole');
			var month = date.getMonth();
			var year = date.getFullYear();
			this.dom()
				.find('.displayed-month')
				.attr('item-value', month + '-' + year)
				.find('a')
				.text(months[month] + ' ' + year);
		},
		getMonths: function (type) {
			var months;
			var su = $.su.CHAR.DATEPICKER;
			if (type == 'simplified') {
				months = [su.JAN, su.FEB, su.MAR, su.APR, su.MAY, su.JUN, su.JUL, su.AUG, su.SEP, su.OCT, su.NOV, su.DEC];
			} else {
				months = [
					su.JANUARY,
					su.FEBRUARY,
					su.MARCH,
					su.APRIL,
					su.MAY,
					su.JUNE,
					su.JULY,
					su.AUGUST,
					su.SEPTEMBER,
					su.OCTOBER,
					su.NOVEMBER,
					su.DECEMBER
				];
			}
			return months;
		},
		//month-calendar
		syncMonthCalendar: function () {
			var date = this.datepickerInfo.date;
			var months = this.getMonths('simplified');
			var table = '<div class="month-calendar-container">';
			table += '<div>';
			table += '<table class="calendar-bar-year calendar-head">';
			table += '<tr>';
			table += '<th class="prev-year-icon left-icon datepicker-icon">';
			table += '<a><</a>';
			table += '</th>';
			table += '<th class="displayed-year calendar-time-th" colspan="2" item-value="' + date.getFullYear() + '">';
			table += '<a>' + date.getFullYear() + '</a>';
			table += '</th>';
			table += '<th class="next-year-icon right-icon datepicker-icon">';
			table += '<a>></a>';
			table += '</th>';
			table += '</tr>';
			table += '</table>';
			table += '<table class="month-calendar calendar-body">';
			for (var i = 0; i < 3; i++) {
				table += '<tr>';
				for (var j = 0; j < 4; j++) {
					if (date.getMonth() == i * 4 + j) {
						table +=
							'<td class="current-month month-selected datepicker-selected" item-value="' + (i * 4 + j) + '"><a>' + months[i * 4 + j] + '</a></td>';
					} else {
						table += '<td class="current-month" item-value="' + (i * 4 + j) + '"><a>' + months[i * 4 + j] + '</a></td>';
					}
				}
				table += '</tr>';
			}
			table += '</table>';
			table += '</div>';
			table += '</div>';

			var container = this.dom().find('.datepicker-calendar-container');
			// container.find(".calendar-bar-month,.date-calendar").hide();

			container.append($(table));
		},
		changeYear: function (target) {
			// var target=e.target.closest("th");
			var curYear = this.dom().find('.displayed-year');
			var value = parseInt(curYear.attr('item-value'));
			var date = this.datepickerInfo.date;
			if ($(target).hasClass('prev-year-icon')) {
				var tmpVal = value - 1;
			} else {
				var tmpVal = value + 1;
			}
			curYear.attr('item-value', tmpVal);
			curYear.find('a').text(tmpVal);

			var newDate = new Date(tmpVal, date.getMonth(), date.getDate());

			this.updateSelectedInfo(newDate);
			this.setSelectMonth(newDate);
		},
		selectMonth: function (target) {
			var _this = this.dom();
			var months = this.getMonths('simplified');

			var selMonth = parseInt(target.attr('item-value'));
			var datepickerInfo = this.datepickerInfo;

			var year = parseInt(this.dom().find('.displayed-year').attr('item-value'));
			var date = datepickerInfo.date.getDate();

			var newDate = new Date(year, selMonth, date);

			this.setSelectMonth(newDate);

			_this.find('.month-calendar-container').hide();
			_this.find('.date-calendar-container').show();

			this.updateDateCalendarBar(newDate);
			this.updateCalendar(newDate);
		},
		setSelectMonth: function (date) {
			var month = date.getMonth();
			var _this = this.dom();
			var tr = Math.floor(month / 4);
			var td = month % 4;

			_this.find('.month-selected').removeClass('month-selected datepicker-selected');
			_this.find('.month-calendar tr').eq(tr).find('td').eq(td).addClass('month-selected datepicker-selected');
		},
		updateMonthCalendar: function () {
			var date = this.datepickerInfo.date;
			var _this = this.dom();
			_this.find('.displayed-year').attr('item-value', date.getFullYear()).find('a').text(date.getFullYear());

			this.setSelectMonth(date);
		},
		//year-calendar
		syncYearCalendar: function (newDate) {
			var _this = this.dom();
			var date = newDate ? newDate : this.datepickerInfo.date;
			var year = date.getFullYear() + '';
			var lastNum = year.slice(-1);
			var specYear = year - lastNum;

			_this.find('.year-calendar-container').remove();

			var table = '<div class="year-calendar-container">';
			table += '<div>';
			table += '<table class="calendar-bar-yearslot calendar-head">';
			table += '<tr>';
			table += '<th class="prev-yearslot-icon left-icon datepicker-icon">';
			table += '<a><</a>';
			table += '</th>';
			table += '<th class="displayed-yearslot calendar-time-th" colspan="2" item-value="' + (specYear + ' - ' + (specYear + 9)) + '">';
			table += '<span>' + specYear + ' - ' + (specYear + 9) + '</span>';
			table += '</th>';
			table += '<th class="next-yearslot-icon right-icon datepicker-icon">';
			table += '<a>></a>';
			table += '</th>';
			table += '</tr>';
			table += '</table>';
			table += '<table class="year-calendar calendar-body">';

			specYear -= 1;
			table += '<tr>';
			table += '<td class="prev-year" item-value="' + specYear + '">';
			table += '<a>' + specYear + '</a>';
			table += '</td>';
			specYear += 1;
			for (var i = 1; i < 11; i++) {
				if (year == specYear) {
					table += '<td class="current-year year-selected datepicker-selected" item-value="' + specYear + '">';
					table += '<a>' + specYear + '</a>';
					table += '</td>';
					specYear += 1;
				} else {
					table += '<td class="current-year" item-value="' + specYear + '">';
					table += '<a>' + specYear + '</a>';
					table += '</td>';
					specYear += 1;
				}
				if ((i + 1) % 4 == 0) {
					table += '</tr><tr>';
				}
			}
			table += '<td class="next-year" item-value="' + specYear + '">';
			table += '<a>' + specYear + '</a>';
			table += '</td>';
			table += '</tr>';
			table += '</table>';
			table += '</div>';
			table += '</div>';
			specYear += 1;

			var container = _this.find('.datepicker-calendar-container');
			container.append($(table));
		},
		changeYearslot: function (target) {
			var curDate = this.datepickerInfo.date;
			var year = curDate.getFullYear();
			var month = curDate.getMonth();
			var date = curDate.getDate();
			if (target.hasClass('prev-yearslot-icon')) {
				year = year - 10;
			} else {
				year = year + 10;
			}

			var newDate = new Date(year, month, date);
			this.syncYearCalendar(newDate);
			this.updateSelectedInfo(newDate);
		},
		selectYear: function (target) {
			var _this = this.dom();
			var date = this.datepickerInfo.date;

			var year = parseInt(target.attr('item-value'));
			var newDate = new Date(year, date.getMonth(), date.getDate());

			this.updateSelectedInfo(newDate);

			if (target.hasClass('current-year')) {
				_this.find('.month-calendar-container').show();
				_this.find('.year-calendar-container').hide();
				this.updateMonthCalendar();
			} else {
				this.syncYearCalendar(newDate);
			}
		},
		//yearslot-calendar
		syncYearslotCalendar: function () {
			var _this = this.dom();
			var date = this.datepickerInfo.date;
			var year = date.getFullYear() + '';
			var lastNum = year.slice(-1);

			var startYear = year - lastNum;
			var startYearslot = startYear - (startYear + '').slice(-2) - 10;

			var curYearslot = startYear + ' - ' + (startYear + 9);

			_this.find('.yearslot-calendar-container').remove();

			var table = '<div class="yearslot-calendar-container">';
			table += '<div>';
			table += '<table class="calendar-bar-century calendar-head">';
			table += '<tr>';
			table += '<th class="prev-century-icon left-icon datepicker-icon">';
			table += '<a><</a>';
			table += '</th>';
			table +=
				'<th class="displayed-century calendar-time-th" colspan="2" item-value="' + (startYearslot + 10) + ' - ' + (startYearslot + 109) + '">';
			table += '<span>' + (startYearslot + 10) + ' - ' + (startYearslot + 109) + '</span>';
			table += '</th>';
			table += '<th class="next-century-icon right-icon datepicker-icon">';
			table += '<a>></a>';
			table += '</th>';
			table += '</tr>';
			table += '</table>';
			table += '<table class="yearslot-calendar calendar-body">';

			table += '<tr>';
			table += '<td class="prev-yearslot" item-value="' + (startYearslot + ' - ' + (startYearslot + 9)) + '">';
			table += '<a>' + startYearslot + ' - ' + (startYearslot + 9) + '</a>';
			table += '</td>';
			startYearslot += 10;
			for (var i = 1; i < 11; i++) {
				var temp = startYearslot + ' - ' + (startYearslot + 9);
				if (temp == curYearslot) {
					table += '<td class="current-yearslot yearslot-selected datepicker-selected" item-value="' + temp + '">';
					table += '<a>' + temp + '</a>';
					table += '</td>';
				} else {
					table += '<td class="current-yearslot" item-value="' + temp + '">';
					table += '<a>' + temp + '</a>';
					table += '</td>';
				}
				if ((i + 1) % 4 == 0) {
					table += '</tr><tr>';
				}
				startYearslot += 10;
			}
			table += '<td class="next-yearslot" item-value="' + (startYearslot + ' - ' + (startYearslot + 9)) + '">';
			table += '<a>' + startYearslot + ' - ' + (startYearslot + 9) + '</a>';
			table += '</td>';
			table += '</tr>';
			table += '</table>';
			table += '</div>';
			table += '</div>';

			var container = _this.find('.datepicker-calendar-container');
			container.append($(table));
		},
		selectYearslot: function (target) {
			var _this = this.dom();
			var date = this.datepickerInfo.date;

			var yearslot = target.attr('item-value');
			var year = yearslot.split(' - ')[0];
			year = year - 0 + ((date.getFullYear() + '').slice(-1) - 0);
			var newDate = new Date(year, date.getMonth(), date.getDate());

			this.updateSelectedInfo(newDate);

			if (target.hasClass('current-yearslot')) {
				_this.find('.year-calendar-container').show();
				_this.find('.yearslot-calendar-container').hide();
				this.syncYearCalendar();
			} else {
				this.syncYearslotCalendar();
			}
		},
		changeCentury: function (target) {
			var curDate = this.datepickerInfo.date;

			var yearslot = this.dom().find('.displayed-century').attr('item-value');
			var year = yearslot.split(' - ')[0];

			if (target.hasClass('prev-century-icon')) {
				year = year - 100;
			} else {
				year = year - 0 + 100;
			}

			year = year - 0 + ((curDate.getFullYear() + '').slice(-1) - 0);

			var newDate = new Date(year, curDate.getMonth(), curDate.getDate());

			this.updateSelectedInfo(newDate);
			this.syncYearslotCalendar();
		},

		getText: function () {
			return this.dom().find('.display-area').val();
		},
		getValue: function () {
			var value = this.formatDate(this.datepickerInfo.date);
			return value;
		},
		setValue: function (date) {
			if (!date) {
				return;
			}
			if ($.type(date) === 'date') {
				var newDate = date;
			} else if ($.type(date) === 'string') {
				var newDate = this.deformatDate(date);
			} else {
				return;
			}
			this.updateCalendar(newDate);
			this.updateDateCalendarBar(newDate);
			this.setSelectDate(newDate);
		}
	});
})();
