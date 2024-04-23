(function () {
	var Swiper = $.su.Widget.register('swiper', {
		// 使用插件 slick https://kenwheeler.github.io/slick/
		settings: {
			arrows: {
				// 是否显示箭头
				attribute: 'arrows',
				defaultValue: false
			},
			dots: {
				// 是否显示圆点
				attribute: 'dots',
				defaultValue: true
			},
			autoplay: {
				// 是否自动轮播
				attribute: 'autoplay',
				defaultValue: true
			},
			autoplaySpeed: {
				// 自动轮播的停留时间，和 autoPlay 一同出现（单位毫秒）
				attribute: 'autoplay-speed',
				defaultValue: 3000
			},
			pauseHover: {
				// 悬浮停止
				attribute: 'pause-hover',
				defaultValue: false
			},
			pauseOnDotsHover: {
				// 悬浮于圆点停止
				attribute: 'pause-on-dots-hover',
				defaultValue: false
			}
		},
		listeners: [
			{
				selector: '',
				event: 'reInit',
				callback: function (e, slick, viewObj) {
					viewObj.dom().triggerHandler('ev_re_init');
				}
			},
			{
				selector: '',
				event: 'beforeChange',
				callback: function (e, slick, currentSlide, nextSlide, viewObj) {
					viewObj.dom().triggerHandler('ev_before_change', [currentSlide, nextSlide]);
				}
			},
			{
				selector: '',
				event: 'afterChange',
				callback: function (e, slick, currentSlide, viewObj) {
					viewObj.dom().triggerHandler('ev_after_change', currentSlide);
				}
			},
			{
				selector: '',
				event: 'edge', // 触及到边界
				callback: function (e, slick, currentSlide, viewObj) {
					viewObj.dom().triggerHandler('ev_reach_edge', currentSlide);
				}
			},
			{
				selector: '',
				event: 'swipe', // 手动拖拽后执行
				callback: function (e, slick, direction, viewObj) {
					viewObj.dom().triggerHandler('ev_after_swipe', direction);
				}
			}
		],
		init: function () {},
		render: function () {
			var self = this.dom();
			var _this = this;
			// 确保在组件渲染后 init ,插件可以获取到内容长度
			setTimeout(function () {
				self.slick(_this.settings);
				// 为节点中的组件进行初始化
				_this._registerWidgets();
			}, 20);
		},
		_registerWidgets: function () {
			var self = this.dom();
			var list = self[0].querySelectorAll('.slick-slide');
			for (i = 0; i < list.length; i++) {
				var transitionList = list[i].querySelectorAll('[widget]');

				transitionList.forEach(function (item) {
					var widgetName = item.getAttribute('widget');
					new $.su.widgets[widgetName]({ id: $(item) }).render();
				});
			}
		},
		rerender: function () {
			// 若出现渲染异常的情况，比如被设置为 display:none 需要在显示时，重新 render
			this.dom().slick('unslick');
			this.render();
		},
		setOptions: function (options) {
			this.dom().slick('slickSetOption', options, true);
			this._registerWidgets();
		},
		next: function () {
			this.dom().slick('slickNext');
		},
		back: function () {
			this.dom().slick('slickPrev');
		},
		pause: function () {
			this.dom().slick('slickPause');
		},
		play: function () {
			this.dom().slick('slickPlay');
		},
		goTo: function (pageNum, noAnimate) {
			// animate 表示是否需要切换动画
			this.dom().slick('slickGoTo', pageNum, noAnimate);
		}
	});
})(jQuery);
