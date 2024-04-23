(function () {
	var Datepicker = $.su.Widget.register('datepicker', {
		settings: {
			format: {
				attribute: 'format',
				defaultValue: 'yyyy/mm/dd'
			},
			startDay: {
				attribute: 'start-day',
				defaultValue: 0 //0:sunday
			},
			blankFilling: {
				attribute: 'blank-filling',
				defaultValue: 1 //0:date  1:"-"  2:""
			},
			labelField: {
				attribute: 'label-field',
				defaultValue: ''
			}
		},
		listeners: [
			{
				selector: '.datepicker-input-container .display-area',
				event: 'click',
				callback: function (e, viewObj) {
					var settings = viewObj.settings;
					var textbox = viewObj.dom().find('.text-container');
					if (settings.pickerShow) {
						viewObj.showDatepicker();
						settings.pickerShow = false;
						textbox.addClass('focus');
					} else {
						// var container = viewObj.dom().find(".date-picker");
						// container.children().not(".datepicker-input-container").hide();
						viewObj.hideDatepicker();
						settings.pickerShow = true;
						textbox.removeClass('focus');
					}
				}
			},
			{
				selector: '.date-calendar tbody a',
				event: 'click',
				callback: function (e, viewObj) {
					var target = e.target ? e.target : e.srcElement;
					viewObj.selectDate(target);
					if ($(target).closest('td').hasClass('current-month-date')) {
						// viewObj.dom().find(".date-picker").children().not(".datepicker-input-container").hide();
						viewObj.hideDatepicker();
						viewObj.settings.pickerShow = true;
					}
				}
			},
			{
				selector: 'div.text-wrap',
				event: 'mouseenter',
				callback: function (e, viewObj) {
					viewObj.dom().find('.text-container').addClass('hover');
				}
			},
			{
				selector: 'div.text-wrap',
				event: 'mouseleave',
				callback: function (e, viewObj) {
					viewObj.dom().find('.text-container').removeClass('hover');
				}
			},
			{
				selector: function () {
					return {
						parent: 'div',
						target: ''
					};
				},
				event: 'click',
				callback: function (e, viewObj) {
					var settings = viewObj.settings;
					var target = e.target ? e.target : e.srcElement;
					var datepicker = $(target).closest('.date-picker');
					if (settings.pickerShow || datepicker.length !== 0) {
						return;
					} else {
						var textbox = viewObj.dom().find('.text-container');
						textbox.removeClass('focus');
						viewObj.hideDatepicker();
						settings.pickerShow = true;
					}
				}
			}
		],
		init: function (options) {},
		render: function () {
			var viewObj = this;
			var _this = this.dom();
			var settings = this.settings;

			_this.addClass(settings.cls + 'datepicker-container');

			var inHTML = '';

			if (settings.labelField !== null) {
				inHTML += '<div class="widget-fieldlabel-wrap ' + settings.labelCls + '">';
				inHTML += '<div class="widget-fieldlabel-inner">';
				inHTML += '<label class="widget-fieldlabel combobox-fieldlabel">' + (settings.labelField === 'false' ? '' : settings.labelField) + '</label>';
				if (settings.labelField) {
					inHTML += '<span class="widget-separator">' + settings.separator + '</span>';
				}
				inHTML += '</div>';
				inHTML += '</div>';
			}
			inHTML += '<div class="widget-wrap-outer datepicker-wrap-outer">';
			inHTML += '<div id="' + this.domId + '_picker" class="date-picker">';
			inHTML += '<div class="datepicker-input-container text-container">';
			inHTML += '<div class="widget-wrap text-wrap">';
			inHTML += '<span class="text-wrap-before"></span>';
			inHTML += '<span class="text-wrap-inner">';
			inHTML += '<input type="text" class="display-area" readonly>';
			inHTML += '</span>';
			inHTML += '<span class="text-wrap-after"></span>';
			inHTML += '</div>';
			inHTML += '</div>';
			inHTML += '</div>';
			inHTML += '</div>';
			_this.append(inHTML);

			settings.picker = $('#' + this.domId + '_picker');

			settings.pickerShow = true;
			_this.on('selectstart', function () {
				return false;
			});
			this.initCalendar();
		},
		initCalendar: function () {
			this.datepickerInfo = {};
			this.datepickerInfo.today = new Date();
			this.datepickerInfo.date = this.datepickerInfo.today;
			this.datepickerInfo.lastDate = this.datepickerInfo.date;
			this.datepickerInfo.selected =
				this.datepickerInfo.date.getMonth() + 1 + '/' + this.datepickerInfo.date.getDate() + '/' + this.datepickerInfo.date.getFullYear();

			this.renderCalendarHead();
			this.syncCalendar(this.datepickerInfo.date);
			this.setSelectDate(this.datepickerInfo.date);

			this.dom().find('.datepicker-calendar-container').hide();
		},
		renderCalendarHead: function (type) {
			var datepicker = $('<div class="datepicker-calendar-container"></div>');
			var su = $.su.CHAR.DATEPICKER;

			var weekStr = this.sortWeek().join(',');
			var reg = /\d/g;

			var head = weekStr.replace(reg, function (item, index) {
				switch (item) {
					case '0':
						return su.SUNDAY;
					case '1':
						return su.MONDAY;
					case '2':
						return su.TUESDAY;
					case '3':
						return su.WEDNESDAY;
					case '4':
						return su.THURSDAY;
					case '5':
						return su.FRIDAY;
					case '6':
						return su.SATURDAY;
				}
			});

			var headArr = head.split(',');

			var headText = "<div class='date-calendar-container'>";
			headText += "<table class='date-calendar calendar-body'>";
			headText += "<thead class='calendar-days-container'>";
			headText += '<tr>';
			$.each(headArr, function (i, item) {
				headText += '<th>';
				headText += '<span>' + item + '</span>';
				headText += '</th>';
			});
			headText += '</tr>';
			headText += '</thead>';
			headText += '</table>';
			headText += '</div>';

			datepicker.append($(headText)).appendTo(this.dom().find('.date-picker'));
		},
		syncCalendar: function (defaultDate) {
			var viewObj = this;
			var blankFilling = parseInt(this.settings.blankFilling);
			var settings = this.settings;
			var datepickerInfo = this.datepickerInfo;
			var tbody = '<tbody>';
			var d = new Date(defaultDate);
			var days = this.getDays(defaultDate);
			var selectArr = datepickerInfo.selected.split('/');
			var selected = new Date(selectArr[2], selectArr[0] - 1, selectArr[1], datepickerInfo.date.getHours());
			var today = new Date(datepickerInfo.today);
			var weekArr = this.sortWeek();
			var day = 1;

			var calContainer = this.dom().find('.date-calendar');
			calContainer.find('tbody').remove();

			for (var i = 0; i < 6; i++) {
				var row = '<tr>';
				if (i == 0) {
					var tempVar = $.inArray(d.getDay(d.setDate(1)), weekArr);
					row += handlePrevMonthDate(tempVar);
				}

				while (day <= days) {
					d.setDate(day);
					var dayOfWeek = $.inArray(d.getDay(), weekArr);
					if (dayOfWeek == 0 && i == 0) {
						row += '</tr>';
						break;
					}

					if (dayOfWeek <= 6) {
						if (d.getTime() == selected.getTime()) {
							row += '<td class="date-selected current-month-date datepicker-selected" item-value="' + day + '">';
							row += '<a>' + day + '</a>';
							row += '</td>';
						} else {
							row += '<td class="current-month-date" item-value="' + day + '">';
							row += '<a>' + day + '</a>';
							row += '</td>';
						}
						day += 1;
						if (dayOfWeek == 6) {
							row += '</tr>';
							break;
						}
					}
				}
				if (day > days) {
					row += handleNextMonthDate(dayOfWeek, i);
					i = 6;
				}
				tbody += row;
			}
			tbody += '</tbody>';

			calContainer.append(tbody);

			function handlePrevMonthDate(num) {
				var temp = '';
				var year = defaultDate.getFullYear();
				var month = defaultDate.getMonth() - 1;
				var date = defaultDate.getDate();
				var prev = new Date(year, month, date);
				var prevDays = viewObj.getDays(prev);
				if (num == 0) {
					num = 7;
				}
				if (blankFilling == 0) {
					for (var j = 0; j < num; j++) {
						temp = '<td class="prev-month-date other-selection" item-value="' + prevDays + '"><a>' + prevDays + '</a></td>' + temp;
						prevDays -= 1;
					}
				} else {
					if (blankFilling == 1) {
						var tempVar = '-';
					} else {
						var tempVar = '';
					}
					for (var j = 0; j < num; j++) {
						temp = '<td class="other-selection stroke-selection"><span>' + tempVar + '</span></td>' + temp;
					}
				}

				return temp;
			}

			function handleNextMonthDate(days, i) {
				var definedDays = i * 7 + days + 1;
				var leftDays = 42 - definedDays;
				var year = defaultDate.getFullYear();
				var month = defaultDate.getMonth() + 1;
				var date = defaultDate.getDate();
				var next = new Date(year, month, date);
				var n = 1;
				var temp = '';

				if (blankFilling == 0) {
					for (var k = 0; k < leftDays; k++) {
						if ((k + definedDays) % 7 == 0 && k != leftDays - 1) {
							temp += '</tr><tr>';
						}
						temp += '<td class="next-month-date other-selection" item-value="' + n + '"><a>' + n + '</a></td>';
						n += 1;
					}
				} else {
					if (blankFilling == 1) {
						var tempVar = '-';
					} else {
						var tempVar = '';
					}
					for (var k = 0; k < leftDays; k++) {
						if ((k + definedDays) % 7 == 0 && k != leftDays - 1) {
							temp += '</tr><tr>';
						}
						temp += '<td class="other-selection stroke-selection"><span>' + tempVar + '</span></td>';
					}
				}

				temp += '</tr>';
				return temp;
			}
		},
		getDays: function (date) {
			var days = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
			return days;
		},
		deformatDate: function (formatDate) {
			var format = this.settings.format;

			var year = parseInt(formatDate.substring(format.indexOf('y'), format.lastIndexOf('y') + 1));
			var month = parseInt(formatDate.substring(format.indexOf('m'), format.lastIndexOf('m') + 1));
			var date = parseInt(formatDate.substring(format.indexOf('d'), format.lastIndexOf('d') + 1));

			if (formatDate.indexOf(':') != -1) {
				var i = formatDate.indexOf(':');
				var hours = parseInt(formatDate.substr(i - 2, 2));
				var mins = parseInt(formatDate.substr(i + 1, 2));
			} else {
				var hours = this.datepickerInfo.date.getHours();
				var mins = this.datepickerInfo.date.getMinutes();
			}

			return new Date(year, month - 1, date, hours, mins);
		},
		formatDate: function (d) {
			var date;
			var formatStyle = this.settings.format;
			if (d) {
				date = new Date(d);
			} else {
				date = new Date();
			}
			var year = date.getFullYear();
			var month = (date.getMonth() + 1 + '').length == 1 ? '0' + (date.getMonth() + 1 + '') : date.getMonth() + 1 + '';
			var specDate = (date.getDate() + '').length == 1 ? '0' + (date.getDate() + '') : date.getDate() + '';
			var formatted = formatStyle.replace('yyyy', year).replace('mm', month).replace('dd', specDate);
			return formatted;
		},
		updateCalendar: function (newDate) {
			var year = newDate.getFullYear();
			var month = newDate.getMonth();
			var date = newDate.getDate();
			var selectArr = this.datepickerInfo.selected.split('/');
			if (year == selectArr[2] && month == selectArr[0] - 1) {
				this.setSelectDate(newDate);
			} else {
				this.updateSelectedInfo(newDate);
				this.syncCalendar(newDate);
			}
		},
		setSelectDate: function (selectDate) {
			var year = selectDate.getFullYear();
			var month = selectDate.getMonth();
			var date = selectDate.getDate();

			var startDay = new Date(year, month, 1).getDay();
			var weekArr = this.sortWeek();
			var prevDays = $.inArray(startDay, weekArr);
			var n = Math.floor((date + prevDays) / 7);
			var num = (date + prevDays) % 7;
			if (startDay == weekArr[0]) {
				n++;
			}
			if (num == 0) {
				n--;
				num = 7;
			}

			$('#' + this.domId + ' .date-selected').removeClass('date-selected datepicker-selected');

			this.dom()
				.find('.date-calendar')
				.find('tbody tr')
				.eq(n)
				.find('td')
				.eq(num - 1)
				.addClass('date-selected datepicker-selected');
			this.updateSelectedInfo(selectDate);
		},
		sortWeek: function () {
			var startDay = parseInt(this.settings.startDay);
			var weekArr = [0, 1, 2, 3, 4, 5, 6];

			var i = $.inArray(startDay, weekArr);
			var before = weekArr.slice(0, i);
			var after = weekArr.slice(i);
			weekArr = after.concat(before);

			return weekArr;
		},
		showDatepicker: function () {
			var datepickerInfo = this.datepickerInfo;
			var container = this.dom().find('.date-picker');
			if (container.find('.datepicker-calendar-container').size() > 0) {
				if (datepickerInfo.lastDate.getTime() != datepickerInfo.date.getTime()) {
					this.updateCalendar(datepickerInfo.date);
				} else {
					container.children().not('.datepicker-input-container').slideDown(150);
					$('#' + this.domId + ' .display-area').val(this.formatDate(this.datepickerInfo.date));
				}
			}
			container.children().not('.datepicker-input-container').slideDown(150);
		},
		selectDate: function (target) {
			var target = $(target).closest('td');
			var selectedDate = parseInt(target.attr('item-value'));
			var date = this.datepickerInfo.date;
			var dateObj;
			if (target.hasClass('current-month-date')) {
				dateObj = new Date(date.getFullYear(), date.getMonth(), selectedDate, date.getHours());
				this.setSelectDate(dateObj);
			} else if (target.hasClass('prev-month-date') || target.hasClass('next-month-date')) {
				dateObj = findSpecDate(target);
				this.updateCalendar(dateObj);
			}

			function findSpecDate(target) {
				var year, month;
				if (target.hasClass('prev-month-date')) {
					month = date.getMonth() - 1;
				} else {
					month = date.getMonth() + 1;
				}
				year = date.getFullYear();
				return new Date(year, month, selectedDate, date.getHours());
			}
		},
		updateSelectedInfo: function (date) {
			$('#' + this.domId + ' .display-area').val(this.formatDate(date));
			if (date.getTime() == this.datepickerInfo.date.getTime()) {
				return;
			}
			this.datepickerInfo.lastDate = this.datepickerInfo.date;
			this.datepickerInfo.date = date;
			this.datepickerInfo.today = new Date();
			this.datepickerInfo.selected = date.getMonth() + 1 + '/' + date.getDate() + '/' + date.getFullYear();
			// $("#" + this.domId + " .display-area").val(this.formatDate(date));
		},
		hideDatepicker: function () {
			var container = this.dom().find('.date-picker').children().not('.datepicker-input-container');
			container.slideUp(150);
		}
	});
})();
