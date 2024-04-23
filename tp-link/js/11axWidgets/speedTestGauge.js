(function ($) {
	var _canvasSupport = (function () {
		var support = true;
		var canvas = $('<canvas width="0" height="0" style="display: none;"></canvas>').appendTo($('body'));
		try {
			canvas[0].getContext('2d');
			support = true;
		} catch (e) {
			support = false;
		}
		canvas.remove();
		return support;
	})();
	var SpeedTestGauge = $.su.Widget.register('speedTestGauge', {
		extend: 'echart',
		settings: {
			type: {
				attribute: 'type',
				defaultValue: 'gauge'
			}
		},
		listeners: [],
		init: function () {
			this.axisTickBackground = {
				image: this.getBackgroundFromCanvas([74, 203, 214], [39, 41, 100]), // #4acbd6, #272964
				repeat: 'no-repeat'
			};

			this.params = {
				min: 0,
				max: 300,
				value: 0,
				convert: [0, 5, 10, 25, 50, 100, 300, 1000, 2500]
			};
		},
		getBackgroundFromCanvas: function (from, to) {
			var canvas = document.createElement('canvas');
			canvas.width = canvas.height = 200;
			var ctx = canvas.getContext('2d');
			var x = canvas.width / 2;
			var y = canvas.height / 2;
			var radius = Math.min(x, y);
			var start;
			var end;
			var frame = 180;
			var diff = [];
			// 左下
			ctx.beginPath();
			ctx.moveTo(x, y);
			start = 0.5 * Math.PI;
			end = Math.PI;
			ctx.arc(x, y, radius, start, end);
			ctx.fillStyle = 'rgb(' + from.join() + ')';
			ctx.fill();
			ctx.closePath();
			// 左上、右上
			for (var i = 0; i < frame - 1; i++) {
				for (var j = 0; j < 3; j++) {
					diff[j] = Math.round(((to[j] - from[j]) / frame) * i + from[j]);
				}
				ctx.beginPath();
				ctx.moveTo(x, y);
				start = Math.PI + (Math.PI / frame) * i;
				end = start + (Math.PI / frame) * 2;
				ctx.fillStyle = 'rgb(' + diff.join() + ')';
				ctx.arc(x, y, radius, start, end);
				ctx.fill();
				ctx.closePath();
			}
			// 右下
			ctx.beginPath();
			ctx.moveTo(x, y);
			start = 0 * Math.PI;
			end = 0.5 * Math.PI;
			ctx.arc(x, y, radius, start, end);
			ctx.fillStyle = 'rgb(' + to.join() + ')';
			ctx.fill();
			ctx.closePath();
			return canvas;
		},
		render: function () {
			var dom = this.dom();
			return SpeedTestGauge.superclass.render.call(this).then(function () {
				_render();
				return $.Deferred().resolve();
			});

			function _render() {
				dom.addClass('speedTestGauge-container');
				var chartCanvas = dom.find('.chart-canvas');
				var inHTML = '';
				inHTML += '<div class="chart-info">';
				inHTML += '<div class="chart-detail">';
				inHTML += '<div class="chart-value"></div>';
				inHTML += '<div class="chart-unit">' + $.su.CHAR.NETWORK_MAP.MBPS_2 + '</div>';
				inHTML += '</div>';
				inHTML += '<div class="chart-title"></div>';
				inHTML += '</div>';
				chartCanvas.find('.chart-info').detach().end().append(inHTML);
			}
		},
		setOption: function (options) {
			var me = this;
			this.setWidgetParam(options);

			if (options.loading === true) {
				if (options.isStart === true) {
					this.startLoading(options);
				} else {
					this.continueLoading(options);
				}
			} else if (options.loading === false) {
				handleInfoVisible.call(me, false);
				this.stopLoading(function () {
					setGaugeData.call(me, options);
				}, options);
			} else {
				// 为了兼容 loading 不传递时可以正常展示 gauge
				setGaugeData.call(me, options);
			}
		},
		setWidgetParam: function (options) {
			if ($.type(options.convert) === 'array') {
				this.params.convert = options.convert;
			}

			this.setDataFormatter();
		},
		setDataFormatter: function () {
			var intervalNum = this.params.convert.length - 1;
			var to = this.params.convert;
			var from = [];
			var base = (this.params.max - this.params.min) / intervalNum;
			for (var i = 0; i <= intervalNum; i++) {
				from.push(base * i + this.params.min);
			}

			// 用于数值转换
			this.params.dataFormatter = piecewiseLinear(to, from);
		},
		startLoading: function (options) {
			var me = this;
			me.animationToggle = true;

			if (options.isNeedRealTime) {
				modifyAnimationData.call(me, options);
				// 实时数据的数据显示逻辑需要配合动画延后，不在此处写
			} else {
				// 非实时展示数据时隐藏中间数值显示
				handleInfoVisible.call(me, false);
			}

			doAnimation.call(me, options);
		},
		continueLoading: function (options) {
			if (!options.isNeedRealTime) {
				return;
			}
			var me = this;

			modifyAnimationData.call(me, options);
		},
		stopLoading: function (cb, options) {
			var me = this;
			me.clearAnimation();

			// 先转到最小值
			setAnimationData.call(me, {
				data: me.params.min,
				animationDuration: 500
			});

			// 再展示数值
			setTimeout(function () {
				cb && cb();
			}, 1000);
		},
		getAnimationToggleStatus: function () {
			return this.animationToggle;
		},
		clearAnimation: function () {
			var me = this;
			me.animationToggle = false;
			me.cumulativeTime = 0;

			clearInterval(me.loadingId);
		},
		calculateOption: function (params) {
			var offsetAngle = -35;
			var totalAngle = 250;
			var split = 75; //总刻度数
			var series = [];

			params = $.extend(true, this.params, params);
			var startAngle = totalAngle + offsetAngle;
			var speed = parseInt(params.value, 10);

			var speedAngle = getSpeedAngle({
				speed: speed,
				convert: params.convert,
				totalAngle: totalAngle
			});
			var endAngle = startAngle - speedAngle;

			var splitNumberCal = Math.floor(((startAngle - endAngle) / totalAngle) * split);
			splitNumberCal = splitNumberCal > split - 1 ? split : splitNumberCal;

			series.push(
				$.extend(true, this.getGaugeDefaultOption(), {
					name: 'blue',
					startAngle: startAngle,
					endAngle: endAngle,
					min: params.min,
					max: params.max,
					axisTick: {
						splitNumber: splitNumberCal
					},
					data: [
						{
							value: params.max,
							name: 'max'
						}
					],
					pointer: {
						show: true
					},
					itemStyle: {
						color: '#4acbd6'
					}
				})
			);

			// 灰色刻度
			series.push(
				$.extend(true, this.getGaugeDefaultOption(), {
					name: 'gray',
					startAngle: endAngle,
					endAngle: offsetAngle,
					axisTick: {
						splitNumber: split - splitNumberCal - 1,
						lineStyle: {
							color: '#a7a9ac'
						}
					}
				})
			);
			return series;
		},
		getGaugeDefaultOption: function () {
			var offsetAngle = -35;
			var totalAngle = 250;
			var axisTickWidth = 11;
			var split = 75;

			var startAngle = totalAngle + offsetAngle;
			var endAngle = offsetAngle;

			return {
				name: 'default',
				radius: '80%', // 表盘整体大小
				type: 'gauge',
				startAngle: startAngle,
				endAngle: endAngle,
				splitNumber: 1, //仪表盘大刻度的分割段数
				// 轴线样式
				axisLine: {
					show: false,
					lineStyle: {
						color: [[1, '#4acbd6']],
						opacity: 0
					}
				},
				// 分隔线（大刻度）样式
				splitLine: {
					show: false
				},
				// 刻度样式
				axisTick: {
					show: true,
					length: axisTickWidth,
					splitNumber: split, // 分割线之间的刻度数
					lineStyle: {
						color: this.axisTickBackground,
						width: 2
					}
				},
				// 刻度数值
				axisLabel: {
					show: false
				},
				// 指针基本信息
				pointer: {
					show: false,
					width: 2,
					length: '80%'
				},
				// 指针样式
				itemStyle: {},
				title: {
					show: false
				},
				detail: {
					show: false
				},
				data: [
					{
						value: 0,
						name: 'default'
					}
				],
				animation: true
			};
		}
	});
	function piecewiseLinear(from, to) {
		// var from = [0, 37.5, 75, 112.5, 150, 187.5, 225, 262.5, 300];
		// var to = [0, 2, 5, 10, 25, 50, 75, 150, 300];
		function calculateY(x, x1, y1, x2, y2) {
			// y = ax + b;
			var a = (y2 - y1) / (x2 - x1);
			var b = y1 - a * x1;
			return a * x + b;
		}
		function calculateResult(val) {
			var ret = val;
			for (var i = 0; i < from.length - 1; i++) {
				if (val >= from[i] && val <= from[i + 1]) {
					ret = calculateY(val, from[i], to[i], from[i + 1], to[i + 1]);
					break;
				}
			}
			if (ret > to[to.length - 1]) {
				ret = to[to.length - 1];
			}
			return (ret.toFixed(1) * 10) / 10;
		}
		return function (val) {
			return calculateResult(val);
		};
	}
	function setInfoText(options) {
		var title = options.name;
		var value = options.value || this.params.min; // 得有默认值进行占位
		var dom = this.dom();

		dom.find('.chart-title').text(title);
		dom.find('.chart-value').text(value);
	}
	function setGaugeData(options) {
		setInfoText.call(this, options);
		if (options.hideInfo === true) {
			handleInfoVisible.call(this, false);
		} else {
			handleInfoVisible.call(this, true);
		}

		var series = this.calculateOption(options);

		this.setGaugeOption({
			series: series
		});
	}
	function handleInfoVisible(show) {
		var dom = this.dom();
		var infoWrap = dom.find('.chart-info');
		var detail = dom.find('.chart-detail');
		var title = dom.find('.chart-title');

		infoWrap.show();
		detail.show();
		title.show(); // 标题默认一直展示

		if (show) {
			detail.css('visibility', 'visible');
		} else {
			detail.css('visibility', 'hidden');
		}
	}
	function doAnimation(options) {
		var me = this;
		me.cumulativeTime = 0;

		// 转到最大
		setAsynData.call(me, {
			data: me.params.max,
			animationDuration: 2000,
			wait: 200
		});

		// 转到最小
		setAsynData.call(me, {
			data: me.params.min,
			animationDuration: 500
		});

		// 在中值附近摆动
		setTimeout(function () {
			if (me.animationToggle !== true) {
				return;
			}

			var intervalTime = 500;
			setTimeout(function () {
				// 实时展示中间数据逻辑需配合动画延迟执行，在此处书写，而不是在 startLoading 中
				if (options.isNeedRealTime) {
					handleInfoVisible.call(me, true);
				}
			}, intervalTime);

			me.loadingId = setInterval(function () {
				if (me.animationToggle !== true) {
					return;
				}

				var middleData = parseInt((me.params.max - me.params.min) / 2);
				var dataPerInterval = (me.params.max - me.params.min) / (me.params.convert.length - 1);
				var data = middleData + dataPerInterval * (Math.random() - 0.5); // 中间刻度左右摆动，幅度为一个区间

				setAnimationData.call(me, {
					data: data,
					animationDuration: 0
				});

				if (options.isNeedRealTime) {
					setInfoText.call(me, {
						name: options.name,
						value: formatInfoData(data)
					});
				}
			}, intervalTime);
		}, me.cumulativeTime);
	}
	function modifyAnimationData(options) {
		// 修改轮盘极值，保证指针在中间附近波动
		var me = this;

		var value = options.value;
		var max = parseInt(value * 2);

		me.params.max = max;
	}
	function formatInfoData(value) {
		return value >= 1000 ? parseInt(value, 10) : parseFloat(value.toFixed(2));
	}
	function setAsynData(options) {
		var wait = options.wait ? options.wait : 0;
		var animationDuration = options.animationDuration ? options.animationDuration : 1000;
		var me = this;

		var delayTime = me.cumulativeTime;

		setTimeout(function () {
			setAnimationData.call(me, {
				data: options.data,
				animationDuration: animationDuration
			});
		}, delayTime);

		me.cumulativeTime += animationDuration;
		me.cumulativeTime += wait;
	}
	function setAnimationData(options) {
		// 带指针动画的表盘赋值函数
		var series = [];
		var data = options.data;
		var animationDuration = options.animationDuration;
		var me = this;

		series.push(
			$.extend(true, me.getGaugeDefaultOption(), {
				min: me.params.min,
				max: me.params.max,
				axisTick: {
					lineStyle: {
						color: '#a7a9ac'
					}
				},
				pointer: {
					show: true
				},
				itemStyle: {
					color: '#4acbd6'
				},
				data: [
					{
						value: data
					}
				],
				animationDuration: animationDuration
			})
		);

		// 清空表盘第二段数据
		series.push(
			$.extend(true, me.getGaugeDefaultOption(), {
				startAngle: 0,
				endAngle: 0,
				axisTick: {
					show: false
				}
			})
		);

		me.setGaugeOption({
			series: series
		});
	}
	function getSpeedAngle(options) {
		var speed = options.speed;
		var convert = options.convert;
		var totalAngle = options.totalAngle;
		var intervalNum = convert.length - 1;
		var anglePerSection = totalAngle / intervalNum;
		var speedAngle;
		var sectionLength;

		if (speed > convert[convert.length - 1]) {
			speed = convert[convert.length - 1];
		}
		if (speed < convert[0]) {
			speed = convert[0];
		}

		for (var i = 0; i < convert.length - 1; i++) {
			if (speed >= convert[i] && speed <= convert[i + 1]) {
				sectionLength = convert[i + 1] - convert[i];
				speedAngle = Math.floor(anglePerSection * i + ((speed - convert[i]) / sectionLength) * anglePerSection);
				break;
			}
		}

		return speedAngle;
	}
})(jQuery);
