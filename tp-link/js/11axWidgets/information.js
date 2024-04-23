(function ($) {
	var Information = $.su.Widget.register('information', {
		settings: {
			operation: {
				attribute: 'operation', // clear|refresh|search
				defaultValue: ''
			},
			plugins: {
				attribute: 'plugins',
				defaultValue: '' // tbar
			},
			caseSensitive: {
				attribute: 'case-sensitive',
				defaultValue: true
			}
		},
		listeners: [
			{
				selector: '.information-panel-tbar-container .search-text',
				event: 'keyup',
				callback: function (e, viewObj) {
					if (e.keyCode === 13) {
						viewObj.dom().find('.btn-search').trigger('click');
					}
				}
			},
			{
				selector: '.information-panel-tbar-container .btn-search',
				event: 'click',
				callback: function (e, viewObj) {
					var searchText = viewObj.dom().find('.search-text').val();
					viewObj.search(searchText);
					if (viewObj._search.success) {
						viewObj.showResult();
					}
					if (viewObj._search.success && viewObj._search.total > 0) {
						viewObj.jumpTo(viewObj._search.current);
					}
				}
			},
			{
				selector: '.information-panel-tbar-container .btn-search-prev',
				event: 'click',
				callback: function (e, viewObj) {
					if (viewObj._search.current <= 1) {
						viewObj._search.current = viewObj._search.total;
					} else {
						viewObj._search.current--;
					}
					viewObj.jumpTo(viewObj._search.current);
				}
			},
			{
				selector: '.information-panel-tbar-container .btn-search-next',
				event: 'click',
				callback: function (e, viewObj) {
					if (viewObj._search.current >= viewObj._search.total) {
						viewObj._search.current = 1;
					} else {
						viewObj._search.current++;
					}
					viewObj.jumpTo(viewObj._search.current);
				}
			},
			{
				selector: '.information-panel-tbar-container .btn-clear',
				event: 'click',
				callback: function (e, viewObj) {
					// viewObj.clear();
					$(this).trigger('ev_grid_action_click');
				}
			},
			{
				selector: '.information-panel-tbar-container .btn-refresh',
				event: 'click',
				callback: function (e, viewObj) {
					viewObj.refresh();
				}
			}
		],
		init: function (options) {
			this._items = [];
			this._textList = [];
			this._keyMap = {};
			this._search = {};
		},

		render: function () {
			var viewObj = this;
			var dom = this.dom();
			var settings = this.settings;

			dom.addClass('container widget-container information-panel-container');

			var inHTML = '';
			inHTML += '<div class="information-panel-wrap">';
			inHTML += '<div class="information-panel-content">';
			inHTML += '<div class="information-panel-tbar-container hidden"></div>';
			inHTML += '<div class="information-panel-content-container">';
			inHTML += '<div class="information-content-container">';
			inHTML += '<div class="information-content-inner"></div>';
			inHTML += '</div>';
			inHTML += '</div>';
			inHTML += '</div>';
			inHTML += '</div>';

			var information = $(inHTML);
			dom.append(information);

			// 初始化plugins
			if (settings.plugins) {
				this.initPlugins(settings.plugins.split('|'));
			}
			$.su.scrollbar({
				ele: dom.find('.information-content-container')[0],
				opts: {
					minScrollbarLength: 50
				}
			});
		},
		initPlugins: function (plugin) {
			var _this = this.dom();
			var viewObj = this;
			var settings = this.settings;

			plugin = $.isArray(plugin) ? plugin : [plugin];
			for (var i = 0, len = plugin.length; i < len; i++) {
				init(plugin[i]);
			}

			function init(p) {
				var options = $.extend({}, settings);
				switch (p) {
					case 'tBar':
						if (options.operation) {
							viewObj.initTBar(options.operation.split('|'));
						}
						break;
					default:
						break;
				}
			}
		},
		initTBar: function (operation) {
			var viewObj = this;
			var tBarContainer = this.dom().find('div.information-panel-tbar-container');
			var settings = this.settings;
			tBarContainer.removeClass('hidden');

			var inHTML = '<div class="operation-container" id="' + viewObj.domId + '">';
			for (var index = 0, len = operation.length; index < len; index++) {
				switch (operation[index]) {
					case 'clear':
						inHTML += '<a tbar-name="clear" class="operation-btn btn-clear">';
						inHTML += '<span class="icon"></span>';
						inHTML += '<span class="text">' + $.su.CHAR.OPERATION.CLEAR_ALL + '</span>';
						inHTML += '</a>';
						break;
					case 'search':
						inHTML += '<div class="text-container search-container hidden-result">';

						inHTML += '<div class="widget-wrap text-wrap search-text-wrap">';
						inHTML += '<span class="text-wrap-inner">';
						inHTML += '<input type="text" class="text-text search-text" placeholder="' + $.su.CHAR.COMMON.SEARCH + '" />';
						inHTML += '</span>';
						inHTML += '<a class="btn-search"></a>';
						inHTML += '</div>';

						inHTML += '<div class="search-result-wrap">';

						inHTML += '<span class="search-result-success">';
						inHTML += '<span class="search-result-text">' + $.su.CHAR.OPERATION.RESULT + ': ';
						inHTML += '<span id="search-result-current"></span>/<span id="search-result-total"></span>';
						inHTML += '</span>';
						inHTML += '<a tbar-name="search-next" class="search-result-btn btn-search-next">';
						inHTML += '<span class="icon"></span>';
						inHTML += '</a>';
						inHTML += '<a tbar-name="search-prev" class="search-result-btn btn-search-prev">';
						inHTML += '<span class="icon"></span>';
						inHTML += '</a>';
						inHTML += '</span>';

						inHTML += '<span class="search-result-fail"><span class="search-result-text">' + $.su.CHAR.OPERATION.NO_MATCHES + '</span></span>';

						inHTML += '</div>';
						inHTML += '</div>';
						break;
					case 'refresh':
						inHTML += '<a tbar-name="refresh" class="operation-btn btn-refresh">';
						inHTML += '<span class="icon"></span>';
						inHTML += '<span class="text">' + $.su.CHAR.OPERATION.REFRESH + '</span>';
						inHTML += '</a>';
						break;
					default:
						break;
				}
			}
			inHTML += '</div>';

			var toolbar = $(inHTML);
			tBarContainer.append(toolbar);
		},
		syncData: function (keys, callback) {
			this._items = [];
			this._textList = [];
			this.hideResult();
			this.dom().find('.search-text').val('');
			var contentContainer = this.dom().find('.information-content-inner');
			contentContainer.empty();
			this.dom().triggerHandler('ev_store_render_items', [keys]);
		},
		renderModels: function (key, models, callback) {
			var me = this;
			var _this = this.dom();
			var settings = this.settings;

			var dom = '';
			for (var i = 0; i < models.length; i++) {
				var item = models[i].getData();
				this._items.push(item);
				this._keyMap[item.key] = i;
				dom += this.renderRow(item, i);
			}
			this.dom().find('.information-content-inner').html(dom);
		},
		getRow: function (key, model) {
			var _this = this.dom();
			var viewObj = this;
			var settings = this.settings;
		},
		createRow: function (key, model) {
			var _this = this.dom();
			var viewObj = this;
			var settings = this.settings;
		},
		renderRow: function (data, index) {
			var convertData = this.convert(data);
			this._textList.push(convertData);
			var dom = '<p class="information-wrap" data-index="' + index + '">' + convertData + '</p>';
			return dom;
		},
		remove: function (key) {
			var index = this._keyMap[key];
			var dom = this.dom();
			if (index !== undefined) {
				dom.find('.information-wrap[data-index=' + index + ']').remove();
				delete this._keyMap[key];
				this._items.splice(index, 1);
				this._textList.splice(index, 1);
			} else {
				dom.find('.information-content-inner').html('');
				this.init();
			}
		},
		refresh: function () {
			var store = this.dataBind[0];
			store.load();
			this.hideResult();
			this.dom().find('.search-text').val('');
			this.dom().triggerHandler('ev_refresh');
		},
		clear: function () {
			var store = this.dataBind[0];
			this.dom().triggerHandler('ev_grid_delete_all');
			this.hideResult();
			this.dom().find('.search-text').val('');
			this.dom().triggerHandler('ev_clear');
		},
		search: function (text) {
			var viewObj = this;
			var contentContainer = viewObj.dom().find('.information-content-inner');
			// 清除搜索结果
			viewObj.hideResult();
			if ($.type(text) !== 'string' || text.length === 0) {
				return;
			}
			var count = 0;
			var createReg = function (text) {
				// 正则关键字转义
				var reg = /[\*\.\?\+\$\^\[\]\(\)\{\}\|\\\/]/g;
				text = text.replace(reg, function ($1) {
					return '\\' + $1;
				});
				var ret = new RegExp(text, viewObj.settings.caseSensitive ? 'g' : 'gi');
				return ret;
			};
			var reg = createReg(text);
			contentContainer.find('.information-wrap').each(function () {
				var ret = '';
				var htmlText = $(this).text();
				ret = htmlText.replace(reg, function ($1) {
					count++;
					return '<span id="search-result-' + count + '" class="highlight">' + $('<div>').text($1).html() + '</span>';
				});
				$(this).html(ret);
			});

			// 保存相关属性
			viewObj._search.current = 1;
			viewObj._search.total = count;
			viewObj._search.text = text;
			viewObj._search.success = true;
			return count;
		},
		clearSearch: function () {
			var viewObj = this;
			viewObj
				.dom()
				.find('.highlight')
				.replaceWith(function () {
					return $(this).html();
				});
		},
		showResult: function () {
			var total = this._search.total;
			var searchContainer = this.dom().find('.search-container');
			if (total === 0) {
				searchContainer.addClass('fail-result').removeClass('success-result');
			} else {
				this.dom().find('#search-result-total').text(total);
				searchContainer.addClass('success-result').removeClass('fail-result');
			}
			searchContainer.removeClass('hidden-result');
		},
		hideResult: function () {
			this._search.current = 1;
			this._search.total = 0;
			this._search.text = '';
			this._search.success = false;
			this.dom().find('.search-container').addClass('hidden-result').removeClass('success-result', 'fail-result');
			this.clearSearch();
		},
		jumpTo: function (index) {
			var viewObj = this;
			var dom = viewObj.dom();
			var target = dom.find('#search-result-' + index);
			var panelContainer = dom.find('.information-panel-content-container');
			var scrollContainer = dom.find('.information-content-container');
			var containerHeight = scrollContainer.height();
			var innerHeight = panelContainer.height();
			var outerHeight = panelContainer.outerHeight();
			var curScrollTop = scrollContainer.scrollTop();
			var padding = (outerHeight - innerHeight) / 2;
			var offsetTop = target.position().top;

			dom.find('.highlight').removeClass('target');
			target.addClass('target');
			scrollContainer.scrollTop(offsetTop + curScrollTop - containerHeight + padding * 2);
			dom.find('#search-result-current').text(viewObj._search.current);
		},
		getDisplay: function () {
			return this._textList;
		},
		convert: function (data) {
			var ret = '';
			var fields;
			if (this.settings.configs && $.type(this.settings.configs.convert) === 'function' && this.settings.configs.convert) {
				ret = this.settings.configs.convert(data);
			} else {
				fields = this.dataBind[0].dataObj.fields.slice(0, -1);
				for (var i = 0; i < fields.length; i++) {
					ret += data[fields[i].name] + ' ';
				}
			}
			// 转义
			ret = $('<div>').text(ret).html();
			return ret;
		}
	});
})(jQuery);
