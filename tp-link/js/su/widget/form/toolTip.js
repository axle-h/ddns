(function () {
	var ToolTip = $.su.Widget.register('toolTip', {
		settings: {
			tipPrefix: {
				attribute: 'tip-prefix',
				defaultValue: ''
			},
			tipTitle: {
				attribute: 'tip-title',
				defaultValue: ''
			},
			tipText: {
				attribute: 'tip-text',
				defaultValue: ''
			},
			tipPosition: {
				attribute: 'tip-position',
				defaultValue: ''
			},
			tipSmallSizePosition: {
				attribute: 'tip-small-size-position',
				defaultValue: 'bottom'
			},
			iconCls: {
				attribute: 'icon-cls',
				defaultValue: ''
			},
			sizeMapping: {
				attribute: 'size-mapping',
				defaultValue: {}
			},
			globalCls: {
				attribute: 'global-cls',
				defaultValue: ''
			},
			needScrollbarClass: {
				attribute: 'need-scrollbar-class',
				defaultValue: ''
			}
		},

		listeners: [
			{
				selector: 'span.tooltip-icon, div.tip-text-container, span.tooltip-title, span.tooltip-prefix',
				event: 'click',
				callback: function (e, viewObj) {
					e.stopPropagation(); //should stop bubble
					var globalTip = $('#global-tips-text');
					if (globalTip.hasClass('show')) {
						viewObj.hideTips();
					} else {
						viewObj.showTips();
					}
				}
			}
		],

		init: function (options) {
			$.extend(this.settings, options);
		},

		render: function () {
			var _this = this.dom();
			var settings = this.settings;

			_this.addClass(settings.cls + 'tooltip-container');

			var inHTML = '';

			inHTML += '<div class="widget-wrap-outer tooltip-wrap-outer">';
			inHTML += '<div class="widget-wrap tooltip-wrap">';
			inHTML += '<div class="tooltip-icon-container">';
			inHTML += '<span class="tooltip-icon-mask"></span>';
			if (settings.tipPrefix) {
				inHTML += '<span class="tooltip-prefix">' + settings.tipPrefix + '</span>';
			}
			inHTML += '<span class="tooltip-icon ' + settings.iconCls + '"></span>';
			inHTML += '<span class="tooltip-title">' + settings.tipTitle + '</span>';
			inHTML += '</div>';
			inHTML += '<div class="tip-text-container">';
			inHTML += '<div class="tip-text-delta-container">';
			inHTML += '<span class="icon-delta"></span>';
			inHTML += '</div>';
			inHTML += '<div class="tip-text-box">';
			inHTML += '<p class="tip-text"></p>';
			inHTML += '</div>';
			inHTML += '</div>';
			inHTML += '</div>';
			inHTML += '</div>';

			_this.append(inHTML);

			var textBox = _this.find('div.tip-text-container');
			var tipText = this.settings.tipText || _this.find('.tip-text-content').get(0);
			textBox.find('p.tip-text').html(tipText);
		},
		showTips: function () {
			var me = this;
			var globalTip = $('#global-tips-text');
			globalTip.attr('data-shown', this.domId);
			this.settings.globalCls && globalTip.addClass(this.settings.globalCls);
			//close event
			$('div:not(.tooltip-container,.tooltip-container div, .global-tips-text, .global-tips-text div)')
				.off('.toolTip')
				.on('click.toolTip scroll.toolTip', function (e) {
					me.hideTips();
					$('div').off('.toolTip');
				});
			globalTip.empty().append(this.dom().find('div.tip-text-container').clone());

			if (this.settings.needScrollbarClass != '') {
				$.su.scrollbar({ ele: '.' + this.settings.needScrollbarClass });
			}

			globalTip.fadeIn(150).addClass('show');

			this.adjustLayout($.su.widgetSize);
		},
		hideTips: function () {
			var me = this;
			var globalTip = $('#global-tips-text');
			globalTip.fadeOut(150, function () {
				me.settings.globalCls && globalTip.removeClass(me.settings.globalCls);
				globalTip.removeClass('show').attr('data-shown', '_hidden_');
			});
		},
		adjustLayout: function (size) {
			var globalTip = $('#global-tips-text');
			var positionMapping = {
				s: this.settings.tipSmallSizePosition || 'bottom',
				m: 'top',
				l: 'right',
				xl: 'right'
			};
			var _this = this.dom();
			if (!globalTip.hasClass('show')) {
				return;
			}

			//some widget like grid header, will show tooltip in shape of 'm' but the screen is in size 'l'. use this to chang the relationship
			var sizeMapping = this.settings.sizeMapping;
			size = sizeMapping[size] || size;
			var position = this.settings.tipPosition || positionMapping[size];
			//reset css for adjusting
			globalTip.css({
				width: 'auto',
				left: -9999,
				top: -9999
			});

			//panel
			var panel = $(_this).closest('.panel-container');
			var panelOffset = panel.offset();

			if (size === 's') {
				globalTip.css({
					width: panel.outerWidth() || $('body').width() - 50
				});
			}

			//globalTip
			var globalHeight = globalTip.height();
			var globalWidth = globalTip.width();
			globalTip.removeClass('s m l xl').addClass(size);

			//textBox
			var textBox = globalTip.find('div.tip-text-container');
			textBox.removeClass('top bottom right').addClass(position);
			var textHeight = textBox.height();
			var textWidth = textBox.width();

			//iconBox
			var iconBox = _this.find('.tooltip-icon-container');
			var iconBoxOffset = iconBox.offset();
			var iconHeight = iconBox.height();
			var iconWidth = iconBox.width();

			//deltaBox
			var deltaBox = globalTip.find('.tip-text-delta-container');
			var deltaHeight = deltaBox.height();
			var deltaWidth = deltaBox.width();

			var globalTop, globalLeft, deltaTop, deltaLeft;

			switch (position) {
				case 'right':
					globalTop = iconBoxOffset.top - (globalHeight - iconHeight) / 2;
					globalLeft = iconBoxOffset.left + iconWidth;
					deltaTop = (textHeight - deltaHeight) / 2;
					deltaLeft = -deltaWidth;
					break;
				case 'top':
					globalTop = iconBoxOffset.top - globalHeight;
					globalLeft = iconBoxOffset.left - (globalWidth - iconWidth) / 2;
					deltaTop = textHeight;
					deltaLeft = (textWidth - deltaWidth) / 2;
					break;
				case 'bottom':
					globalTop = iconBoxOffset.top + iconHeight;
					globalLeft = panelOffset.left;
					deltaTop = -deltaHeight + 1;
					deltaLeft = iconBoxOffset.left - panelOffset.left + (iconWidth - deltaWidth) / 2;
					break;
			}

			deltaBox.css({
				top: deltaTop,
				left: deltaLeft
			});

			globalTip.css({
				top: globalTop,
				left: globalLeft
			});

			if (position === 'top') {
				//出现了换行情况，重新调整高度
				globalTip.css({
					top: iconBoxOffset.top - globalTip.height()
				});
				deltaBox.css({
					top: textBox.height()
				});
			}

			if (size === 's' && position === 'top') {
				globalTip.css({
					left: ($('body').width() - globalWidth) / 2
				});
				deltaBox.css({
					left: iconBoxOffset.left - globalTip.offset().left + (iconWidth - deltaWidth) / 2
				});
			}
		}
	});
})();
