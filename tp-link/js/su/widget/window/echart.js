(function () {
	var Echart = $.su.Widget.register('echart', {
		settings: {
			type: {
				attribute: 'type',
				defaultValue: 'line'
			},
			width: {
				attribute: 'width',
				defaultValue: 480
			},
			height: {
				attribute: 'height',
				defaultValue: 280
			},
			autoResize: {
				attribute: 'auto-resize',
				defaultValue: false
			},
			chartConfigs: {
				attribute: 'echartConfigs',
				defaultValue: {
					title: {
						text: '',
						subtext: '',
						x: 30,
						y: 20,
						textStyle: {
							fontSize: 14
						}
					},
					legend: {
						data: []
					},
					tooltip: {
						trigger: 'axis'
					},
					toolbox: {
						show: false
					},
					calculable: false,
					xAxis: [
						{
							axisLine: {
								lineStyle: {
									color: '#222',
									width: 1,
									type: 'solid'
								},
								onZero: false
							},
							axisTick: {
								show: false
							},
							splitLine: {
								show: true
							},
							type: 'category',
							boundaryGap: false,
							data: []
						}
					],
					yAxis: [
						{
							axisLine: {
								lineStyle: {
									color: '#555',
									width: 1,
									type: 'solid'
								}
							},
							axisTick: {
								show: false
							},
							type: 'value',
							axisLabel: {
								formatter: '{value}'
							}
						}
					],
					series: [],
					animation: false
				}
			}
		},

		listeners: [
			{
				selector: function () {
					return {
						parent: window
					};
				},
				event: 'resize',
				condition: function (viewObj) {
					return viewObj.settings.autoResize === true;
				},
				callback: function (e, viewObj) {
					viewObj.resize();
				}
			}
		],

		init: function () {},

		destroy: function () {
			if (this.echart) {
				this.echart.clear();
			}
			this._isDestroyed = true;
			//
		},

		render: function (callback) {
			var me = this;
			var _this = this.dom();
			var settings = this.settings;

			_this.addClass(settings.cls + 'chart-container');

			var inHTML = '';
			inHTML += '<div class="chart-before">';
			inHTML += '</div>';

			// inHTML +=   '<div class="chart-area" style="filter: alpha(opacity=100); background-color: rgb(255,255,255)">';
			inHTML += '<div class="chart-area">';
			inHTML += '<div class="chart-scale"></div>';
			inHTML += '<div class="chart-canvas"></div>';
			inHTML += '</div>';

			inHTML += '<div class="chart-after">';
			inHTML += '</div>';

			_this.append(inHTML);

			var dfd = $.Deferred();
			if (window.echarts === undefined) {
				$.su.router.loadFile('js/libs/echarts.min.js', function () {
					if (me._isDestroyed) {
						return dfd.resolve();
					}
					_render();
					dfd.resolve();
				});
			} else if (window.echarts) {
				_render();
				dfd.resolve();
			}
			return dfd.promise();

			function _render() {
				if (settings.type === 'line') {
					me.initLine();
				} else if (settings.type === 'pie') {
					me.initPie();
				} else if (settings.type === 'gauge') {
					me.initGauge();
				}
				me.resize(
					settings.width == '100%' ? _this.parent().width() : settings.width,
					settings.height == '100%' ? _this.parent().height() : settings.height
				);
			}
		},

		reCreateCanvas: function () {
			var _this = this.dom();
			var settings = this.settings;

			_this.find('div.chart-canvas').empty();

			settings.canvas = document.createElement('canvas');
			settings.canvas.width = settings.width;
			settings.canvas.height = settings.height;

			_this.find('div.chart-canvas').append(settings.canvas);

			if (window.G_vmlCanvasManager) {
				settings.canvas = window.G_vmlCanvasManager.initElement(settings.canvas);
			}
			this.ctx = settings.canvas.getContext('2d');
		},

		resize: function (width, height) {
			var dom = this.dom();
			width = width || dom.parent().width();
			height = height || dom.parent().height();
			dom.find('.chart-canvas').css({
				width: width,
				height: height
			});
			this.echart.resize();
		},

		initLine: function () {
			var _this = this.dom();
			var settings = this.settings;
			var configs = settings.chartConfigs;

			// this.reCreateCanvas();
			var xLen = configs.xAxis[0].data.length;
			for (var index = 0, len = configs.series.length; index < len; index++) {
				var item = configs.series[index];
				item.data = this.adjustDataLength(xLen, item.data);
			}

			this.echart = echarts.init(_this.find('.chart-canvas').get(0));

			// this.echart.setOption(configs);
		},

		initPie: function () {
			var _this = this.dom();
			var settings = this.settings;
			// this.reCreateCanvas();

			this.echart = echarts.init(_this.find('.chart-canvas').get(0));
		},

		initGauge: function () {
			var _this = this.dom();
			var settings = this.settings;

			this.echart = echarts.init(_this.find('.chart-canvas').get(0));
		},

		adjustDataLength: function (xLen, data) {
			if (data.length > xLen) {
				data.length = xLen;
			} else if (data.length < xLen) {
				while (data.length < xLen) {
					data.push('-');
				}
			}
			return data;
		},

		addData: function (data) {
			var series = this.echart.getOption().series;
			var len = data.length;

			for (var i = 0; i < len; i++) {
				var item = data[i];
				var old = series[item.seriesIndex].data;
				var dataIndex = item.dataIndex;

				if (dataIndex > old.length - 1) {
					old.shift();
					old.push(item.data);
				} else {
					old[dataIndex] = item.data;
				}
			}

			this.echart.setOption({ series: series });
		},

		setSeries: function (series) {
			var options = this.echart.getOption();
			var xLen = options.xAxis[0].data.length;

			// 补齐数据长度，删除多余数据
			for (var i = 0, len = series.length; i < len; i++) {
				series[i].data = this.adjustDataLength(xLen, series[i].data);
			}

			this.echart.setOption({ series: series }, false);
		},

		setOption: function (options, notMerge) {
			var settings = this.settings;
			notMerge = notMerge === undefined ? false : notMerge;
			if (notMerge) {
				options = $.extend(true, {}, settings.chartConfigs, options);
			}

			// 补齐空数据，确保横坐标刻度可以显示出来。
			if (options.xAxis) {
				var xLen = options.xAxis[0].data.length;
				options.series = options.series || [];
				for (var index = 0, len = settings.chartConfigs.series.length; index < len; index++) {
					var item = (options.series[index] = options.series[index] || {});

					item.data = this.adjustDataLength(xLen, item.data || []);
				}
			}

			this.echart.setOption(options, notMerge);
		},

		setPieOption: function (options, notMerge) {
			var settings = this.settings;

			this.echart.setOption(options, notMerge);
		},

		setGaugeOption: function (options, notMerge) {
			this.echart.setOption(options, notMerge);
		}
	});
})();
