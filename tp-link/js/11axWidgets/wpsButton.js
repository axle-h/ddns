/*
 * @description
 * @author XCH
 * @change
 *   2017/10/09: create file
 *
 * */
(function ($) {
	var WpsButton = $.su.Widget.register('wpsButton', {
		settings: {
			time: {
				attribute: 'time',
				defaultValue: 120
			},
			width: {
				attribute: 'width',
				defaultValue: 80
			},
			height: {
				attribute: 'height',
				defaultValue: 80
			}
		},

		listeners: [
			{
				selector: 'div.wps-button-wrapper',
				event: 'click',
				callback: function (e, viewObj) {
					if (!viewObj.dom().hasClass('disabled')) {
						var me = $(this);
						var text = me.find('span.text').text();
						if (text == $.su.CHAR.WPS.START) {
							me.find('span.text').text($.su.CHAR.WPS.CANCEL);
							me.find('span.text').addClass('cancel');
							me.find('div.wps-mask').addClass('connecting');

							// init circle
							var dfd = $.Deferred();
							if (window.echarts === undefined) {
								$.su.router.loadFile('js/libs/echarts.min.js', function () {
									viewObj.initCircle();
									dfd.resolve();
								});
							} else if (window.echarts) {
								viewObj.initCircle();
								dfd.resolve();
							}

							dfd.then(function () {
								var timeLeft = viewObj.settings.time;
								var t = viewObj.format(timeLeft);
								me.find('span.time').text(t);

								var run = function () {
									viewObj.countDown(timeLeft);

									var t = viewObj.format(timeLeft);
									me.find('span.time').text(t);

									timeLeft--;

									if (timeLeft == 0) {
										clearInterval(viewObj.settings._countDownId);
										me.find('div.wps-button').html('');
										me.find('span.time').text('');
										me.find('span.text').text($.su.CHAR.WPS.START);
										me.find('span.text').removeClass('cancel');
										me.find('div.wps-mask').removeClass('connecting');
									}
								};

								run();

								viewObj.settings._countDownId = setInterval(run, 1000);

								viewObj.dom().triggerHandler('ev_wps_button_click', [
									{
										clickType: 'start'
									}
								]);
							});

							return dfd.promise();
						} else {
							clearInterval(viewObj.settings._countDownId);
							// me.find("div.wps-button").html("");
							var timeLeft = viewObj.settings.time;
							viewObj.countDown(timeLeft);
							me.find('span.time').text('');
							me.find('span.text').text($.su.CHAR.WPS.START);
							me.find('span.text').removeClass('cancel');
							me.find('div.wps-mask').removeClass('connecting');

							viewObj.dom().triggerHandler('ev_wps_button_click', [
								{
									clickType: 'cancel'
								}
							]);
						}
					}
				}
			}
		],

		init: function () {},

		render: function () {
			var me = this;
			var _this = this.dom();
			var settings = this.settings;

			_this.addClass(settings.cls + 'wps-button-container');

			var innerHTML = '<div class="wps-button-wrapper">';
			innerHTML += '<div class="wps-mask"></div>';
			innerHTML += '<div class="wps-button-content">';
			innerHTML += '<div class="wps-button"></div>';
			innerHTML += '<span class="text"></span>';
			innerHTML += '<span class="time"></span>';
			innerHTML += '</div>';
			innerHTML += '</div>';

			_this.empty().append(innerHTML);

			_this.find('.wps-button-wrapper').css({
				width: settings.width,
				height: settings.height
			});

			_this.find('.wps-button-content').css({
				width: settings.width,
				height: settings.height
			});

			_this.find('.text').text($.su.CHAR.WPS.START);
		},

		initCircle: function () {
			var _this = this.dom();
			var settings = this.settings;

			var circleDiv = _this
				.find('.wps-button')
				.css({
					width: settings.width,
					height: settings.height
				})
				.get(0);

			this.echart = echarts.init(circleDiv);
		},

		countDown: function (timeLeft) {
			var me = this;
			var _this = this.dom();
			var settings = this.settings;

			var circleConfigs = me.setConfig(timeLeft);

			this.echart.setOption(circleConfigs);
		},

		format: function (time) {
			var t = '';
			if (time / 60 > 1) {
				t += time / 60 >= 10 ? parseInt(time / 60) + ':' : '0' + parseInt(time / 60) + ':';
			} else {
				t += '00:';
			}

			t += time % 60 >= 10 ? parseInt(time % 60) : '0' + parseInt(time % 60);

			return t;
		},

		setConfig: function (timeLeft) {
			var me = this;
			var percent = parseInt(((120 - timeLeft) / 120) * 100);

			var circleConfigs = {
				series: [
					{
						type: 'pie',
						animation: false,
						center: ['50%', '50%'],
						radius: [36, 39],
						itemStyle: {
							normal: {
								label: {
									show: false
								}
							}
						},
						data: [
							{
								name: '',
								value: percent,
								itemStyle: {
									normal: {
										color: GLOBAL_STYLE == 'gaming' ? '#DC0800' : '#4acbd6',
										label: {
											show: true,
											position: 'center'
										},
										labelLine: {
											show: false
										}
									}
								}
							},
							{
								name: 'invisible',
								value: 100 - percent,
								itemStyle: {
									normal: {
										color: 'rgba(0,0,0,0)',
										label: {
											show: false
										},
										labelLine: {
											show: false
										}
									},
									emphasis: {
										color: 'rgba(0,0,0,0)'
									}
								}
							}
						]
					}
				]
			};

			return circleConfigs;
		},

		reset: function () {
			var me = this;
			var button = this.dom().find('div.wps-button-wrapper');

			if (me.settings._countDownId) {
				clearInterval(me.settings._countDownId);
			}

			var timeLeft = me.settings.time;
			me.countDown(timeLeft);

			button.find('span.time').text('');
			button.find('span.text').text($.su.CHAR.WPS.START);
			button.find('span.text').removeClass('cancel');
			button.find('div.wps-mask').removeClass('connecting');
		},

		disable: function () {
			var _this = this.dom();
			var container = this.getContainer();

			container.addClass('disabled');
			_this.triggerHandler('ev_view_disable');
		},

		enable: function () {
			var _this = this.dom();
			var container = this.getContainer();

			container.removeClass('disabled');
			_this.triggerHandler('ev_view_enable');
		},

		setTimeLeft: function (time) {
			var _this = this.dom();
			var me = this;

			if (time) {
				me.settings.time = time;
			}
		}
	});
})(jQuery);
