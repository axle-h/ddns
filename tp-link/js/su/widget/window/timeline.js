(function ($) {
	var Timeline = $.su.Widget.register('timeline', {
		settings: {
			// configItem[]: { type, dataIndex, text, cls, width, render }
			// type: timelineNode | time | actioncolumn
			configs: {
				attribute: 'configs',
				defaultValue: null
			},
			emptyText: {
				attribute: 'empty-text',
				defaultValue: $.su.CHAR.COMMON.NO_ENTRY
			},
			plainBackground: {
				attribute: 'plain-bg',
				defaultValue: false
			}
		},
		listeners: [
			{
				selector: '.timeline-cell-wrapper.actioncolumn span.text',
				event: 'click',
				callback: function (e, viewObj) {
					e.stopPropagation();
					e.preventDefault();
					var _this = viewObj.dom();
					var key = $(this).closest('.timeline-item-container').attr('data-key');
					_this.triggerHandler('ev_item_click', [key]);
				}
			}
		],
		init: function (options) {},
		render: function () {
			var dom = this.dom();
			var plainBgCls = this.settings.plainBackground ? ' plain-bg' : '';

			dom.addClass('widget-container timeline-container' + plainBgCls);
		},
		syncData: function (keys, callback) {
			this.dom().triggerHandler('ev_store_render_items', [keys]);
		},
		renderModels: function (key, models, callback) {
			var dom = '';
			var configs = this.settings.configs;
			var isEmpty = !models.length;
			var _self = this;

			dom += '<div class="scroll-x-container"></div>';
			dom += _renderHeader(configs);
			dom += '<div class="timeline-content-container">';
			dom += '<div class="timeline-content-wrapper">';
			dom += '<div class="timeline-line"></div>';

			if (isEmpty) {
				dom += '<span>' + this.settings.emptyText + '</span>';
			}

			models.forEach(function (item, index) {
				dom += _renderItem(item.getData(), index, configs);
			});

			dom += '</div></div>';

			this.dom().html(dom);
			setTimeout(function () {
				_self.renderLine(models.length - 1);
			}, 150);

			var contentWrapper = this.dom().find('.timeline-content-wrapper');
			if (contentWrapper.find('.ps__rail-y').length === 0) {
				$.su.scrollbar({ ele: contentWrapper[0], opts: { minScrollbarLength: 20 } });
			}

			$(window).on('ev_resize.' + this.settings.id, function (e, widgetSize, clientWidth, oldWidgetSize) {
				if (!_self.dom().is(':visible') || widgetSize === oldWidgetSize) {
					return;
				}

				_self.dom().find('.timeline-content-wrapper').scrollTop(0);
				setTimeout(function () {
					_self.renderLine(models.length - 1);
				}, 150);
			});
		},
		renderLine: function (lastIndex) {
			if (lastIndex < 1) {
				return;
			}

			var container = this.dom().find('.timeline-content-wrapper');
			var containerOffset = container.offset();

			var firstNode = this.dom().find('.timeline-node[data-index=0]');
			var firstNodeOffset = firstNode.offset();

			var lastNode = this.dom().find('.timeline-node[data-index=' + lastIndex + ']');
			var lastNodeOffset = lastNode.offset();

			var nodeHeight = firstNode.height();
			var pointWidth = firstNode.find('.timeline-point').width();

			var svgHeight = lastNodeOffset.top - containerOffset.top + nodeHeight;

			var position = [
				firstNodeOffset.left - containerOffset.left + pointWidth / 2,
				firstNodeOffset.top - containerOffset.top + nodeHeight / 2,
				lastNodeOffset.left - containerOffset.left + pointWidth / 2,
				lastNodeOffset.top - containerOffset.top + nodeHeight / 2
			];

			var fillColor = GLOBAL_STYLE === 'gaming' ? '#cecece' : '#4acbd6';

			var svgHTML = '<svg xmlns="http://www.w3.org/2000/svg" version="1.1" width="100%" height="' + svgHeight + '">';
			svgHTML += '<polyline points="' + position.join(',') + '" style="fill:none;stroke:' + fillColor + ';stroke-width:1" />';
			svgHTML += '</svg>';

			this.dom().find('.timeline-line').empty().append(svgHTML);
		},
		destroy: function () {
			$(window).off('ev_resize.' + this.settings.id);
		}
	});

	function _renderHeader(configs) {
		var inHTML = '<div class="timeline-header-container">';
		inHTML += '<div class="timeline-header-wrapper display-flex">';

		configs.forEach(function (config) {
			if (config.type === 'timelineNode') {
				inHTML += '<div class="timeline-header-item timeline-node"></div>';
			} else {
				if (config.type === 'time') {
					config.cls = (config.cls || '') + ' time';
				}

				inHTML += '<div class="timeline-header-item ' + (config.cls || '') + '"';

				if (config.width) {
					inHTML += ' style="flex: ' + config.width + ';"';
				}

				inHTML += ' data-index="' + config.dataIndex + '">';
				inHTML += '<span class="timeline-header-text">' + (config.text || '') + '</span>';
				inHTML += '</div>';
			}
		});

		inHTML += '</div></div>';

		return inHTML;
	}

	function _renderItem(item, itemIndex, configs) {
		var inHTML = '<div class="timeline-item-container display-flex" data-key="' + item.key + '">';

		configs.forEach(function (cellConfig) {
			if (cellConfig.type === 'timelineNode') {
				inHTML += _renderNode(itemIndex);
			} else {
				inHTML += _renderCell(item, cellConfig);
			}
		});

		inHTML += '</div>';

		return inHTML;
	}

	function _renderCell(cell, config) {
		var cellValue = $.su.escapeHtml(cell[config.dataIndex]);

		config.cls = config.cls || '';
		if (config.type === 'time') {
			config.cls += ' time';
		} else if (config.type === 'actioncolumn') {
			config.cls += ' actioncolumn';
		}

		var inHTML = '';
		inHTML += '<div class="timeline-cell-wrapper ' + config.cls + '"';

		if (config.width) {
			inHTML += ' style="flex: ' + config.width + ';"';
		}

		inHTML += ' data-index="' + config.dataIndex + '">';
		inHTML += '<span class="text">' + (config.render ? config.render(cellValue, cell) : cellValue) + '</span>';
		inHTML += '</div>';

		return inHTML;
	}

	function _renderNode(index) {
		var inHTML = '';

		inHTML += '<div class="timeline-node" data-index="' + index + '">';
		inHTML += '<span class="timeline-point"></span>';
		inHTML += '</div>';

		return inHTML;
	}
})(jQuery);
