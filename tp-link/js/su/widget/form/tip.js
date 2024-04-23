(function () {
	var Tip = $.su.Widget.register('tip', {
		settings: {},
		listeners: [
			{
				selector: function () {
					return {
						parent: 'body',
						target: '[data-tip]'
					};
				},
				event: $.su.isMobile() ? 'click' : 'mouseenter',
				callback: function (e, viewObj) {
					e.stopPropagation(); //should stop bubble
					var self = this;
					if (!$.su.isMobile()) {
						showTips();
						return;
					}

					var globalTip = $('#global-tip');
					if (globalTip.hasClass('show')) {
						var showingId = globalTip.attr('data-shown');
						var id = $(self).attr('data-key');
						var isSelfTrigger = showingId == id;
						if (isSelfTrigger) {
							return;
						} else {
							viewObj.hideTips();
							// 由于 hideTips 设置了 150 fadeout, 需要设置 大于 150 的 timeout，否则实际效果为先显示再隐藏
							setTimeout(function () {
								showTips();
							}, 180);
						}
					}

					function showTips() {
						var text = $(self).attr('data-tip');
						var pointer = $(self).data('pointer');
						var width = $(self).attr('tip-width');
						var maxWidth = $(self).attr('tip-max-width');
						var wrap = $(self).attr('tip-wrap');
						var id = $(self).attr('data-key');
						var tipClass = '';
						if ($(self).attr('tip-class')) {
							tipClass = $(self).attr('tip-class').split(' ');
						}

						if (text) {
							viewObj.setTip($(self), text, {
								// given left and top is the pointer
								pointer: pointer,
								width: width,
								wrap: wrap,
								tipClass: tipClass,
								maxWidth: maxWidth,
								key: id
							});
						}

						var remove = function () {
							viewObj.removeTip();
						};
						if ($.su.isMobile()) {
							$('div:not([data-tip],#global-tip)').one('click', remove);

							$('.su-scroll').one('scroll', removeScroll);
							function removeScroll() {
								viewObj.removeTip();
								$('.su-scroll').off('scroll', removeScroll);
							}
						} else {
							$(self).one('mouseleave', remove);
						}
					}

					showTips();
				}
			}
		],
		init: function () {},
		render: function () {
			this.dom().addClass('title-tip');
			this.dom().append('<span class="title-tip-text"></span><span class="tip-pointer"></span>');
		},
		setTip: function (triggerBox, text, options) {
			var _this = this.dom();
			_this.find('.title-tip-text').html(text);

			_this.attr('data-shown', options.key);

			_this.css({
				position: 'absolute',
				width: options.width || '',
				'max-width': options.maxWidth || 'auto'
			});
			_this.removeClass().addClass('title-tip show');

			if ($.type(options.tipClass) === 'string') {
				options.tipClass = [options.tipClass];
			}
			if ($.type(options.tipClass) === 'array') {
				for (var i = 0; i < options.tipClass.length; i++) {
					_this.addClass(options.tipClass[i]);
				}
			}

			//reset css for adjusting
			var zIndex = this.getMask().getMaxZIndex() + 1;
			_this.css({
				width: 'auto',
				left: -9999,
				top: -9999,
				zIndex: zIndex
			});

			var positionMapping = {
				s: 'bottom',
				m: 'top',
				l: 'right',
				xl: 'right'
			};
			var size = $.su.widgetSize;
			_this.removeClass('s m l xl').addClass(size);
			// s 布局下 tooltip 统一往下
			var position = size === 's' ? positionMapping['s'] : (options && options.pointer) || positionMapping[size];

			var triggerOffset = triggerBox.offset();
			var triggerWidth = triggerBox.width();
			var triggerHeight = triggerBox.height();
			var edgeOffset = 0;
			// Get tip offset.
			var textBoxWidth = _this.outerWidth();
			var textBoxHeight = _this.outerHeight();

			var pointerBoxWidthAndMargin = 10;
			var pointerBoxHeightAndMargin = 10;

			// 如果超出屏幕边缘则缩小宽度
			var tipEdge = textBoxWidth / 2;
			var rightRemainWidth = $('body').width() - triggerOffset.left - triggerWidth / 2;
			var leftRemainWidth = triggerOffset.left + triggerWidth / 2 - textBoxWidth / 2;
			if (tipEdge > rightRemainWidth) {
				if (options.width) {
					_this.outerWidth(options.width);
					edgeOffset = rightRemainWidth - tipEdge;
				} else {
					textBoxWidth = rightRemainWidth * 2 - 2;
					_this.outerWidth(textBoxWidth);
				}
			} else if (leftRemainWidth <= 0) {
				edgeOffset = -leftRemainWidth;
			} else {
				if (!options.width) {
					_this.css('width', 'auto');
				}
			}

			// 获取更新后的高度和宽度
			textBoxWidth = _this.outerWidth();
			textBoxHeight = _this.outerHeight();

			var offsetWidth = (textBoxWidth - triggerWidth) / 2;
			var offsetHeight = (textBoxHeight - triggerHeight) / 2;

			if (position === 'bottom') {
				var top = triggerOffset.top + triggerBox.height() + pointerBoxHeightAndMargin;
				if (top + textBoxHeight > $(window).height()) {
					position = 'top';
				}
			}

			_this.addClass(position);
			var toSetLeft;
			var toSetTop;
			if (position === 'bottom') {
				toSetLeft = triggerOffset.left - offsetWidth + edgeOffset;
				toSetTop = triggerOffset.top + triggerBox.height() + pointerBoxHeightAndMargin;
			} else if (position === 'top') {
				toSetLeft = triggerOffset.left - offsetWidth + edgeOffset;
				toSetTop = triggerOffset.top - textBoxHeight - pointerBoxHeightAndMargin;
			} else if (position === 'left') {
				toSetLeft = triggerOffset.left - textBoxWidth - pointerBoxWidthAndMargin;
				toSetTop = triggerOffset.top - offsetHeight;
			} else if (position === 'right') {
				toSetLeft = triggerOffset.left + triggerWidth + pointerBoxWidthAndMargin;
				toSetTop = triggerOffset.top - offsetHeight;
			}

			_this.css({
				left: toSetLeft + 'px',
				top: toSetTop + 'px'
			});

			if (position === 'bottom' || position === 'top') {
				_this.find('.tip-pointer').css({
					left: '50%',
					right: ''
				});
			} else if (position === 'left') {
				_this.find('.tip-pointer').css({
					right: 0 - pointerBoxWidthAndMargin / 2 + 'px',
					left: ''
				});
			} else if (position === 'right') {
				_this.find('.tip-pointer').css({
					right: '',
					left: 0 - pointerBoxWidthAndMargin / 2 + 'px'
				});
			}

			// 出现了换行情况，重新调整高度
			if (position === 'right' || position === 'left') {
				_this.css({
					top: triggerOffset.top - (_this.outerHeight() - triggerHeight) / 2
				});
			}
		},
		setText: function (id, text) {
			var dom;
			if ($.type(id) === 'string') {
				dom = $('#' + id);
			} else {
				dom = $(id);
			}
			dom.attr('data-tip', text);
		},
		removeTip: function () {
			var _this = this.dom();
			_this.removeClass('show').attr('data-shown', '_hidden_');
		}
	});
})();
