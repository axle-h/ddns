// JavaScript Document
(function ($) {
	function _hourTo24(num) {
		var str = num.toString();
		return (str.length === 1 ? '0' + num : str) + ':00';
	}
	function _hourTo12(num) {
		var n = num % 12;
		return (n === 0 ? 12 : n) + (num / 12 >= 1 && num / 12 < 2 ? ' PM' : ' AM');
	}
	function _crtRBtn(week, start, end, transFun) {
		var range = transFun(start) + ' - ' + transFun(end),
			html = "<div class='time-range' data-week='" + week + "' data-start='" + start + "' data-end='" + end + "'>";
		html += "<span class='week'>" + week2TextMap[week] + '</span>';
		html += "<span class='hour'>" + range + '</span>';
		html += "<span class='del-icon'></span>";
		html += '</div>';
		return html;
	}
	function _updateRBtn(target, start, end, transFun, week) {
		var text = transFun(start) + ' - ' + transFun(end);
		target.find('.hour').text(text);
		target.attr('data-start', start).attr('data-end', end);
		if (week) {
			target.find('.week').text(week2TextMap[week]);
			target.attr('data-week', week);
		}
	}
	function _isRangeOverlap(aStart, aEnd, bStart, bEnd) {
		return !(aEnd < bStart || bEnd < aStart);
	}
	function _getDiffRange(pickers) {
		var map = {},
			min,
			max;
		for (var i = pickers.length, data; i--; ) {
			data = pickers[i].data();
			if (!map[data.week]) {
				map[data.week] = [];
			}
			map[data.week].push(data.timeStart);
		}
		// 由于连续性是一定的，只需要拿最小值和最大值
		for (var p in map) {
			min = Math.min.apply(null, map[p]);
			max = Math.max.apply(null, map[p]);
			map[p] = [min, max + 1];
		}
		return map;
	}
	var week2TextMap = {
		mon: $.su.CHAR.DATEPICKER.MONDAY,
		tue: $.su.CHAR.DATEPICKER.TUESDAY,
		wed: $.su.CHAR.DATEPICKER.WEDNESDAY,
		thu: $.su.CHAR.DATEPICKER.THURSDAY,
		fri: $.su.CHAR.DATEPICKER.FRIDAY,
		sat: $.su.CHAR.DATEPICKER.SATURDAY,
		sun: $.su.CHAR.DATEPICKER.SUNDAY
	};
	var weekSeq = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
	var emptyJson = JSON.stringify({ sun: [], mon: [], tue: [], wed: [], thu: [], fri: [], sat: [] });
	var timepicker = $.su.Widget.register('timepicker', {
		settings: {
			viewOnly: {
				attribute: 'view-only',
				defaultValue: false
			},
			showLegend: {
				attribute: 'show-legend',
				defaultValue: true
			},
			selLegendText: {
				attribute: 'selected-legend',
				defaultValue: ''
			},
			deselLegendText: {
				attribute: 'deselected-legend',
				defaultValue: ''
			},
			is24: {
				attribute: 'is-24',
				defaultValue: true
			}
		},
		listeners: [
			{
				selector: 'div.btn-sel',
				event: 'click',
				callback: function (e, viewObj) {
					e.preventDefault();
					e.stopPropagation();
					if (viewObj.settings.viewOnly || viewObj.getContainer().hasClass('disabled')) {
						return;
					}
					var jsonStr;
					if (viewObj.dom().find('.btn-sel').hasClass('sel')) {
						var allVals = { mon: [[0, 24]], tue: [[0, 24]], wed: [[0, 24]], thu: [[0, 24]], fri: [[0, 24]], sat: [[0, 24]], sun: [[0, 24]] };
						jsonStr = JSON.stringify(allVals);
					} else {
						jsonStr = emptyJson;
					}
					viewObj.dom().triggerHandler('ev_view_change', [
						{
							type: 'value',
							value: jsonStr
						}
					]);
				}
			},
			{
				selector: 'div.btn-reset',
				event: 'click',
				callback: function (e, viewObj) {
					e.preventDefault();
					e.stopPropagation();
					if (viewObj.settings.viewOnly || viewObj.getContainer().hasClass('disabled')) {
						return;
					}
					var snapshot = viewObj.snapshot;
					if (!snapshot) {
						snapshot = JSON.stringify({ mon: [], tue: [], wed: [], thu: [], fri: [], sat: [], sun: [] });
					}
					viewObj.dom().triggerHandler('ev_view_change', [
						{
							type: 'value',
							value: snapshot
						}
					]);
				}
			},
			{
				selector: '.time-range .del-icon',
				event: 'click',
				callback: function (e, viewObj) {
					e.preventDefault();
					e.stopPropagation();
					if (viewObj.settings.viewOnly || viewObj.getContainer().hasClass('disabled')) {
						return;
					}
					var btn = $(this).parent(),
						week = btn.attr('data-week'),
						start = parseInt(btn.attr('data-start')),
						end = parseInt(btn.attr('data-end')),
						data = JSON.parse(viewObj.getValue());
					for (var weekData = data[week], rangeIdx = weekData.length, range; rangeIdx--; ) {
						range = weekData[rangeIdx];
						if (range[0] == start && range[1] == end) {
							weekData.splice(rangeIdx, 1);
							break;
						}
					}
					viewObj.dom().triggerHandler('ev_view_change', [
						{
							type: 'value',
							value: JSON.stringify(data)
						}
					]);
				}
			},
			{
				selector: '.timepicker-picker',
				event: 'click',
				callback: function (e, viewObj) {
					e.stopPropagation();
					e.preventDefault();
				}
			},
			{
				selector: 'div.timepicker-container-wrap',
				event: 'mousedown touchstart',
				callback: function (e, viewObj) {
					e.type == 'mousedown' && e.preventDefault();
					e.stopPropagation();
					if (viewObj.settings.viewOnly || viewObj.getContainer().hasClass('disabled')) {
						return;
					}
					var dom = viewObj.dom();
					var posX = e.type == 'mousedown' ? e.pageX || e.screenX : e.originalEvent.changedTouches[0].pageX;
					posY = e.type == 'mousedown' ? e.pageY || e.screenY : e.originalEvent.changedTouches[0].pageY;

					var canvas = $(this);
					posX = posX - canvas.offset().left;
					posY = posY - canvas.offset().top;

					var wrap = canvas.find('div.timepicker-select-wrap');
					if (wrap.length == 0) {
						wrap = $('<div class="timepicker-select-wrap"></div>');
						canvas.append(wrap);
					}

					wrap.attr('fl', posX);
					wrap.attr('ft', posY);

					wrap.css({
						left: posX,
						top: posY,
						display: 'block'
					});
					dom.attr('dragFlag', true);
					function mouseUp(e) {
						e.preventDefault();
						e.stopPropagation();
						if (viewObj.settings.viewOnly || viewObj.getContainer().hasClass('disabled')) {
							return;
						}
						var dom = viewObj.dom();
						var wrap = dom.find('div.timepicker-select-wrap');
						if (wrap.length > 0) {
							var l = wrap.offset().left;
							var t = wrap.offset().top;
							var r = l + wrap.width();
							var b = t + wrap.height();

							var canvas = $(this);
							var pickers = canvas.find('div.timepicker-picker');
							var hasEmptyPicker = false,
								pickerChosen = [];
							if (l == 0 && t == 0 && r == 0 && b == 0) {
								return;
							}
							pickers.each(function (i, obj) {
								var p = $(obj);

								var pl = p.offset().left;
								var pt = p.offset().top;
								var pr = pl + p.width();
								var pb = pt + p.height();

								//if ()
								var c1 = (pl <= l && l <= pr) || (l <= pl && pr <= r) || (pl <= r && r <= pr);
								var c2 = (pt <= t && t <= pb) || (t <= pt && pb <= b) || (pt <= b && b <= pb);

								if (c1 && c2) {
									pickerChosen.push(p);
									// c1 && c2找到和框重叠的cell(包括框内、跨越框边界)
									// hasEmptyPicker 只要这些重叠框中有一个没被selected
									// 则选中所有重叠的cell, 否则toggle
									if (!p.hasClass('selected')) {
										hasEmptyPicker = true;
									}
									// jquery return false 会终止each循环
								}
							});
							if (pickerChosen.length > 0) {
								var newValue = '';
								if (hasEmptyPicker) {
									// for(var idx = pickerChosen.length; idx--;){
									// 	pickerChosen[idx].addClass("selected");
									// }
									// if(obj.isNew){
									var range = _getDiffRange(pickerChosen);
									newValue = viewObj._getAfterValue(range, 'add');
									// me.timepicker("_table2label",range, "add");
									// }
								} else {
									// for(var idx = pickerChosen.length; idx--;){
									// 	pickerChosen[idx].removeClass("selected");
									// }
									// if(obj.isNew){
									var range = _getDiffRange(pickerChosen);
									newValue = viewObj._getAfterValue(range, 'remove');
									// console.log(pickerChosen.length, range);

									// me.timepicker("_table2label",range, "remove");
									// }
								}
								dom.triggerHandler('ev_view_change', [
									{
										type: 'value',
										value: newValue
									}
								]);
							}

							wrap.css({
								display: 'none',
								width: 0,
								height: 0
							});
							dom.removeAttr('dragFlag');
						}
						dom.off('mouseup touchend', mouseUp).off('mousemove touchmove', mouseMove);
					}
					function mouseMove(e) {
						e.type == 'mousemove' && e.preventDefault();
						e.stopPropagation();
						if (viewObj.settings.viewOnly || viewObj.getContainer().hasClass('disabled')) {
							return;
						}
						var posX = e.type == 'mousemove' ? e.pageX || e.screenX : e.originalEvent.changedTouches[0].pageX,
							posY = e.type == 'mousemove' ? e.pageY || e.screenY : e.originalEvent.changedTouches[0].pageY;

						var canvas = $(this);
						posX = posX - canvas.offset().left;
						posY = posY - canvas.offset().top;
						var dom = viewObj.dom();
						if (dom.attr('dragFlag')) {
							var wrap = dom.find('div.timepicker-select-wrap');

							var fl = parseInt(wrap.attr('fl'), 10);
							var ft = parseInt(wrap.attr('ft'), 10);

							var w = posX - fl;
							if (w > 0) {
								wrap.css({
									width: w
								});
							} else {
								w = Math.abs(w);
								wrap.css({
									width: w,
									left: posX
								});
							}

							var h = posY - ft;
							if (h > 0) {
								wrap.css({
									height: h
								});
							} else {
								h = Math.abs(h);
								wrap.css({
									height: h,
									top: posY
								});
							}
						}
					}
					dom.on('mousemove touchmove', mouseMove).on('mouseup touchend', mouseUp);
					return false;
				}
			}
		],
		init: function () {
			this.snapshot = null;
			this._value = '';
			this.transHour = this.settings.is24 ? _hourTo24 : _hourTo12;
		},
		render: function () {
			var _this = this.dom(),
				settings = this.settings,
				viewOnlyCls = settings.viewOnly ? ' view-only' : '';
			_this.addClass(settings.cls + 'timepicker-container' + viewOnlyCls);
			var inHTML = '';
			inHTML += "<div class='timepicker-layout'>";
			// 表格 + 图例 部分
			inHTML += '<div class="canvas">';
			inHTML += '<div class="timepicker-container-wrap">';
			inHTML += '<table class="timepicker">';

			inHTML += '<thead>';
			// var char = $.su.CHAR.DATEPICKER;
			// $.su.CHAR.DATEPICKER
			inHTML += '<tr>';
			inHTML += '<th class="fst"></th>';
			for (var i = 0, len = weekSeq.length, day; i < len; i++) {
				day = weekSeq[i];
				inHTML += '<th class="week-picker" data-week="' + day + '">' + week2TextMap[day] + '</th>';
			}

			// inHTML += "<th class=\"week-picker\" data-week=\"mon\">" + char.MONDAY + "</th>";
			// inHTML += "<th class=\"week-picker\" data-week=\"tue\">" + char.TUESDAY + "</th>";
			// inHTML += "<th class=\"week-picker\" data-week=\"wed\">" + char.WEDNESDAY + "</th>";
			// inHTML += "<th class=\"week-picker\" data-week=\"thu\">" + char.THURSDAY + "</th>";
			// inHTML += "<th class=\"week-picker\" data-week=\"fri\">" + char.FRIDAY + "</th>";
			// inHTML += "<th class=\"week-picker\" data-week=\"sat\">" + char.SATURDAY + "</th>";

			inHTML += '</tr>';

			inHTML += '</thead>';

			inHTML += '<tbody>';
			for (var index = 0; index < 24; index++) {
				inHTML += '<tr>';
				inHTML += '<td class="fst"><div class="row-picker"></div></td>';
				for (var j = 0; j < 7; j++) {
					inHTML +=
						'<td><div data-time-start="' +
						index +
						'" data-time-end="' +
						(index + 1) +
						'" data-week="' +
						weekSeq[j] +
						'" class="timepicker-picker"></div></td>';
				}
				// inHTML += "<td><div data-time-start=\"" + index + "\" data-time-end=\"" + (index + 1) + "\" data-week=\"mon\" class=\"timepicker-picker\"></div></td>";
				// inHTML += "<td><div data-time-start=\"" + index + "\" data-time-end=\"" + (index + 1) + "\" data-week=\"tue\" class=\"timepicker-picker\"></div></td>";
				// inHTML += "<td><div data-time-start=\"" + index + "\" data-time-end=\"" + (index + 1) + "\" data-week=\"wed\" class=\"timepicker-picker\"></div></td>";
				// inHTML += "<td><div data-time-start=\"" + index + "\" data-time-end=\"" + (index + 1) + "\" data-week=\"thu\" class=\"timepicker-picker\"></div></td>";
				// inHTML += "<td><div data-time-start=\"" + index + "\" data-time-end=\"" + (index + 1) + "\" data-week=\"fri\" class=\"timepicker-picker\"></div></td>";
				// inHTML += "<td><div data-time-start=\"" + index + "\" data-time-end=\"" + (index + 1) + "\" data-week=\"sat\" class=\"timepicker-picker\"></div></td>";
				// inHTML += "<td><div data-time-start=\"" + index + "\" data-time-end=\"" + (index + 1) + "\" data-week=\"sun\" class=\"timepicker-picker\"></div></td>";
				inHTML += '</tr>';
			}

			inHTML += '</tbody>';

			inHTML += '</table>';
			inHTML += '</div>';

			//垂直坐标
			inHTML += '<div class="x-axis">';
			inHTML += '<div class="x-axis-wrap">';

			for (var index = 0; index <= 24; index++) {
				inHTML += '<span>' + this.transHour(index) + '</span>';
			}

			inHTML += '</div>';
			inHTML += '</div>';
			// 图例
			inHTML += '<div class="legend-container">';
			inHTML += '<span class="icon selected"></span>';
			inHTML += '<span class="text">' + settings.selLegendText + '</span>';
			if (settings.deselLegendText !== null) {
				if ($.su.widgetSize == 's') {
					inHTML += '<br>';
				}
				inHTML += '<span class="icon nonselect"></span>';
				inHTML += '<span class="text">' + settings.deselLegendText + '</span>';
			}
			inHTML += '</div>';
			// 图例 结束

			inHTML += '</div>';
			// .canvas 结束
			if (!settings.viewOnly) {
				// 右侧操作栏
				inHTML += "<div class='timepicker-right'>";
				inHTML += "<div class='right-btn-container'>";
				inHTML +=
					'<div widget="button" id="' +
					this.domId +
					'-sel-all" class="btn-sel sel" label-field="{false}" text="' +
					$.su.CHAR.OPERATION.SELECT_ALL +
					'"></div>';
				inHTML +=
					'<div widget="button" id="' +
					this.domId +
					'-reset" class="btn-reset btn-msg-no" label-field="{false}" text="' +
					$.su.CHAR.OPERATION.REVERT +
					'"></div>';

				inHTML += '</div>';
				inHTML +=
					"<div class='timepicker-labels su-scroll empty'><div class='empty-note'>" +
					$.su.CHAR.OPERATION.SELECT_TIME_SLOT +
					"</div><div class='range-btn-container'></div></div>";
				inHTML += '</div>';

				inHTML += '</div>';
				// .layout 结束
			}

			inHTML += '</div>';
			_this.append(inHTML);
			var widgetButtons = _this.find('.right-btn-container').find('div[widget=button]');

			for (var index = 0, len = widgetButtons.length; index < len; index++) {
				new $.su.widgets.button({ id: $(widgetButtons[index]) }).render();
			}
		},
		enable: function () {
			var _this = this.dom();
			_this.removeClass('disabled');
			_this.find('a.timepicker-switch, .time-range').removeClass('disabled');
		},
		disable: function () {
			var _this = this.dom();
			_this.addClass('disabled');
			_this.find('a.timepicker-switch, .time-range').addClass('disabled');
		},
		setValue: function (value) {
			value = value || emptyJson;
			this._value = value;
			var obj = JSON.parse(value);
			var all = true;
			var tarBtnDom = this.dom().find('.btn-sel');
			var tarBtnWidget = tarBtnDom.data('viewObj');
			for (var p = weekSeq.length, day, cond; p--; ) {
				day = obj[weekSeq[p]];
				cond = day && day.length === 1 && day[0][0] === 0 && day[0][1] === 24;
				if (!cond) {
					all = false;
					break;
				}
			}
			if (tarBtnDom.hasClass('sel') && all) {
				tarBtnWidget.setText($.su.CHAR.OPERATION.DESELECT_ALL);
				tarBtnDom.removeClass('sel').addClass('desel');
			} else if (tarBtnDom.hasClass('desel') && !all) {
				tarBtnWidget.setText($.su.CHAR.OPERATION.SELECT_ALL);
				tarBtnDom.removeClass('desel').addClass('sel');
			}
			this.setStyle(value || emptyJson);
		},
		setStyle: function (value) {
			var _this = this.dom();
			var fun = this.transHour;
			var pickers = _this.find('div.timepicker-picker').removeClass('selected');
			var rangeHtml = '';

			value = JSON.parse(value);
			for (var wIdx = 0, wlen = weekSeq.length, dataWeek; wIdx < wlen; wIdx++) {
				dataWeek = weekSeq[wIdx];
				var timeArray = value[dataWeek];
				if (timeArray) {
					var col = pickers.filter('[data-week=' + dataWeek + ']');
					for (var index = 0, len = timeArray.length; index < len; index++) {
						var time = timeArray[index],
							dataTimeStart = time[0],
							dataTimeEnd = time[1];
						for (var jndex = dataTimeStart; jndex < dataTimeEnd; jndex++) {
							col.filter('[data-time-start="' + jndex + '"]').addClass('selected');
						}
						rangeHtml += _crtRBtn(dataWeek, dataTimeStart, dataTimeEnd, fun);
					}
				}
			}
			var btnWrap = _this.find('.range-btn-container');
			btnWrap.empty().html(rangeHtml);
			if (rangeHtml.length > 0) {
				btnWrap.parent().removeClass('empty');
			} else {
				btnWrap.parent().addClass('empty');
			}
		},
		getValue: function () {
			return this._value;
			// var _this = this.dom();

			// var pickers = _this.find("div.timepicker-picker");
			// var result = {};

			// for (var index = 0, len = pickers.length; index < len; index++) {
			//   var tar = $(pickers[index]),
			//     dataWeek = tar.attr("data-week"),
			//     dataTimeStart = parseInt(tar.attr("data-time-start"), 10),
			//     dataTimeEnd = parseInt(tar.attr("data-time-end"), 10);

			//   if (tar.hasClass("selected")) {
			//     result[dataWeek] = result[dataWeek] || [];
			//     result[dataWeek].push([dataTimeStart, dataTimeEnd]);
			//     //result[dataWeek].push(dataTimeStart);
			//   } else {
			//     continue;
			//   };
			// };

			// for (var week in result) {
			//   var timeArray = result[week],
			//     dArray = [],
			//     tmpArray = [],
			//     tmp = -1;

			//   timeArray.sort(function (a, b) {
			//     return a[0] - b[0];
			//   });

			//   //console.log("week", week, timeArray);

			//   for (var index = 0, len = timeArray.length; index < len; index++) {
			//     var d = timeArray[index];

			//     if (len == 1) {
			//       dArray.push(d);
			//       tmp = -1;
			//       tmpArray = [];
			//       continue;
			//     };

			//     if (tmp == -1) {
			//       tmp = d;
			//       tmpArray = [tmp[0]];
			//       continue;
			//     };

			//     if (tmp[1] == d[0]) {
			//       tmp = d;
			//     } else {
			//       tmpArray.push(tmp[1]);
			//       dArray.push(tmpArray);
			//       //console.log("done", tmpArray, "00");
			//       tmp = d;
			//       tmpArray = [tmp[0]];
			//     };

			//     if (index == len - 1) {
			//       tmpArray.push(d[1]);
			//       dArray.push(tmpArray);
			//       //console.log("done", tmpArray);
			//       tmp = -1;
			//       tmpArray = [];
			//       continue;
			//     };
			//   };

			//   //console.log("d", d, "tmp", tmp, "tmpArray", tmpArray, "dArray", dArray);
			//   result[week] = dArray;
			// };

			// //console.log("result", result);
			// var val = JSON.stringify(result);
			// return val;
		},
		setSnapshot: function (snap) {
			this.snapshot = snap;
		},
		setIs24: function (is24) {
			is24 = Boolean(is24);
			this.settings.is24 = is24;
			this.transHour = is24 ? _hourTo24 : _hourTo12;
			context = this;
			this.dom()
				.find('.x-axis-wrap')
				.children()
				.each(function (i, ele) {
					$(ele).text(context.transHour(i));
				});
		},
		_getAfterValue: function (diffRange, mode) {
			var origin = JSON.parse(this._value || emptyJson),
				dayDiff,
				start,
				end,
				dayOrigin;
			// console.log((JSON.parse(this._value || emptyJson)).tue);
			if (mode === 'add') {
				for (var day in diffRange) {
					dayDiff = diffRange[day];
					if (!$.isArray(origin[day])) {
						origin[day] = [];
					}
					dayOrigin = origin[day];
					start = dayDiff[0];
					end = dayDiff[1];
					var maxRange = [start, end];
					for (var overlaps = [], s, e, cur, last = dayOrigin.length; last--; ) {
						cur = dayOrigin[last];
						s = cur[0];
						e = cur[1];
						if (_isRangeOverlap(s, e, start, end)) {
							overlaps.push(last);
							if (s < maxRange[0]) {
								maxRange[0] = s;
							}
							if (e > maxRange[1]) {
								maxRange[1] = e;
							}
						}
					}
					if (overlaps.length === 0) {
						// 找到合适的位置
						for (var last = dayOrigin.length, pos = -1, dayEnd; last--; ) {
							dayEnd = dayOrigin[last][1];
							if (dayEnd < start) {
								pos = last;
								break;
							}
						}
						dayOrigin.splice(pos + 1, 0, maxRange);
					} else {
						dayOrigin.splice(overlaps[overlaps.length - 1], overlaps.length, maxRange);
					}
				}
			} else {
				for (var day in diffRange) {
					dayDiff = diffRange[day];
					dayOrigin = origin[day];
					start = dayDiff[0];
					end = dayDiff[1];
					for (var idx = dayOrigin.length, cur, s, e, tarPos = -1; idx--; ) {
						cur = dayOrigin[idx];
						s = cur[0];
						e = cur[1];
						if (start >= s && end <= e) {
							tarPos = idx;
							break;
						}
					}
					if (tarPos >= 0) {
						if (s == start && e == end) {
							dayOrigin.splice(tarPos, 1);
						} else if (s == start) {
							dayOrigin[tarPos][0] = end;
							// _updateRBtn(target, end, e, this.transHour);
						} else if (e == end) {
							dayOrigin[tarPos][1] = start;
						} else {
							dayOrigin.splice(tarPos, 1, [s, start], [end, e]);
						}
					}
				}
				// console.log("remove", origin.tue, diffRange.tue)
			}
			for (var i = 0, len = weekSeq.length, result = {}, day; i < len; i++) {
				day = weekSeq[i];
				result[day] = origin[day] || [];
			}
			return JSON.stringify(result);
		},
		_table2label: function (diffRange, mode) {
			var dom = this.dom(),
				dayDiff,
				start,
				end;
			if (mode === 'add') {
				for (var day in diffRange) {
					dayDiff = diffRange[day];
					start = dayDiff[0];
					end = dayDiff[1];
					btns = dom.find(".time-range[data-week='" + day + "']");
					var maxRange = [start, end];
					for (var overlaps = [], s, e, cur, last = btns.length; last--; ) {
						cur = $(btns[last]);
						s = parseInt(cur.attr('data-start'));
						e = parseInt(cur.attr('data-end'));
						if (_isRangeOverlap(s, e, start, end)) {
							overlaps.push(cur);
							if (s < maxRange[0]) {
								maxRange[0] = s;
							}
							if (e > maxRange[1]) {
								maxRange[1] = e;
							}
						}
					}
					if (overlaps.length === 0) {
						// 找位置插入新的
						var prev = null,
							newBtn = _crtRBtn(day, start, end, this.transHour);
						for (var last = btns.length, cur, btnEnd; last--; ) {
							cur = $(btns[last]);
							btnEnd = cur.attr('data-end');
							if (btnEnd < start) {
								prev = cur;
								break;
							}
						}
						var dayIdx = weekSeq.indexOf(day);
						if (prev === null && dayIdx > 1) {
							var prevdays = weekSeq.slice(0, dayIdx);
							for (var prevIdx = prevdays.length; prevIdx--; ) {
								prevdays[prevIdx] = ".time-range[data-week='" + prevdays[prevIdx] + "']";
							}
							var prevTars = dom.find(prevdays.join(','));
							prev = prevTars.length > 0 ? prevTars.last() : null;
						}
						if (prev !== null) {
							$(newBtn).insertAfter(prev);
						} else {
							dom.find('.range-btn-container').prepend(newBtn);
						}
					} else {
						_updateRBtn(overlaps[0], maxRange[0], maxRange[1], this.transHour);
						for (var oIdx = overlaps.length; oIdx-- > 1; ) {
							overlaps[oIdx].remove();
						}
					}
				}
			} else if (mode === 'remove') {
				for (var day in diffRange) {
					dayDiff = diffRange[day];
					start = dayDiff[0];
					end = dayDiff[1];
					btns = dom.find(".time-range[data-week='" + day + "']");
					for (var idx = btns.length, btn, s, e, target; idx--; ) {
						(btn = $(btns[idx])), (s = parseInt(btn.attr('data-start'))), (e = parseInt(btn.attr('data-end')));
						if (start >= s && end <= e) {
							target = btn;
							break;
						}
					}
					if (target) {
						if (s == start && e == end) {
							target.remove();
						} else if (s == start) {
							_updateRBtn(target, end, e, this.transHour);
						} else {
							_updateRBtn(target, s, start, this.transHour);
							e != end && $(_crtRBtn(day, end, e, this.transHour)).insertAfter(target);
						}
					}
				}
			}
			var btnWrap = dom.find('.range-btn-container');
			if (btnWrap.find(' .time-range').length > 0) {
				btnWrap.parent().removeClass('empty');
			} else {
				btnWrap.parent().addClass('empty');
			}
		}
	});
})(jQuery);
