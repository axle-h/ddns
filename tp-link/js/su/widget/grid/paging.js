(function () {
	var Paging = $.su.Widget.register('paging', {
		settings: {
			numPerPage: {
				attribute: 'num-per-page',
				defaultValue: 6
			}
		},
		listeners: [
			{
				selector: 'a.paging-btn-num',
				event: 'click',
				callback: function (e, viewObj) {
					e.stopPropagation();
					e.preventDefault();

					var settings = viewObj.settings,
						grid = settings.objs.grid,
						btn = $(this),
						pageNum = parseInt(btn.attr('data-index'), 10),
						editor = settings.plugins.editor || settings.plugins.rowEditor,
						editorStatus = grid.getPlugin('editor') ? settings.configs.editor : settings.configs.rowEditor;

					if (btn.hasClass('disabled')) {
						return;
					} else {
						if (editorStatus && editorStatus.editing) {
							editor.cancelEdit();
						}
					}

					viewObj.goToPage(pageNum);
				}
			},
			{
				selector: 'a.pageing-btn-prev',
				event: 'click',
				callback: function (e, viewObj) {
					e.stopPropagation();
					e.preventDefault();

					var settings = viewObj.settings,
						grid = settings.objs.grid,
						btn = $(this);

					if (btn.hasClass('disabled')) {
					} else {
						// btn.addClass("disabled");
						viewObj.goFirst();
					}
				}
			},
			{
				selector: 'a.pageing-btn-next',
				event: 'click',
				callback: function (e, viewObj) {
					e.stopPropagation();
					e.preventDefault();

					var settings = viewObj.settings,
						grid = settings.objs.grid,
						btn = $(this);

					if ($(this).hasClass('disabled')) {
					} else {
						// btn.addClass("disabled");
						viewObj.goLast();
					}
				}
			}
		],
		init: function (options) {
			var _this = this.dom();
			var settings = this.settings;

			this._pageMap = {};
			$.extend(settings, options, options.configs.paging);
		},
		render: function () {
			var me = this,
				_this = this.dom(),
				wrap = _this.parent().find('div.grid-panel-content');
			grid = this.settings.objs.grid;
			var settings = this.settings;

			var inHTML = '<div class="container widget-container paging-container disabled">';
			inHTML += '<div class="paging-wrap">';
			inHTML += '<div class="paging-options inline-block hidden">';
			inHTML += '<div class="paging-info inline-block">';
			inHTML += '<span></span>';
			inHTML += '</div>';
			inHTML += '<div class="paging-select inline-block">';
			inHTML += '<div id="' + this.domId + '_select" label-field="' + $.su.CHAR.COMMON.GRID_PAGING_PER + '" widget="combobox"></div>';
			inHTML += '</div>';
			inHTML += '</div>';

			inHTML += '<div class="paging-btns inline-block">';
			// 上一页按钮
			inHTML += '<a class="paging-btn pageing-btn-prev" data-index="prev">';
			inHTML += '<span class="icon"></span>';
			inHTML += '<span class="text">' + $.su.CHAR.OPERATION.PREV + '</span>';
			inHTML += '</a>';

			inHTML += '<div class="num-buttons-container">';
			inHTML += '</div>';

			// 下一页按钮
			inHTML += '<a class="paging-btn pageing-btn-next" data-index="next">';
			inHTML += '<span class="icon"></span>';
			inHTML += '<span class="text">' + $.su.CHAR.OPERATION.NEXT + '</span>';
			inHTML += '</a>';
			inHTML += '</div>';

			inHTML += '</div>';
			inHTML += '</div>';
			inHTML += '<input type="hidden" class="hidden paging-input">';

			_this.append($(inHTML));
			wrap.append(_this);

			this._numSelect = new $.su.widgets.combobox({ id: this.domId + '_select' });
			this._numSelect.render();
			this._numSelect.loadItems(settings.items);
			settings.numPerPage = this._numSelect.getValue() || settings.numPerPage;
			settings.objs.grid.updateRowNumber();

			this._numSelect.dom().on('ev_view_change', function (e, obj) {
				me._numSelect.setValue(obj.value);
				settings.numPerPage = obj.value;
				me.updateRowPage(grid._keys);
				me.goToPage(settings.currentPage);
				settings.objs.grid.updateRowNumber();
			});
		},
		updateBtns: function () {
			var _this = this.dom();
			var settings = this.settings;
			var grid = settings.objs.grid;
			var container = _this.find('div.paging-btns');
			var btnsContainer = container.find('div.num-buttons-container');
			var numPerPage = settings.numPerPage;
			var currentPage = settings.currentPage;
			var len = settings.objs.grid._keys.length;
			var totalPage = Math.ceil(len / numPerPage);

			settings.totalPage = totalPage;
			grid.dom().find('tr.grid-content-tr').removeClass('hidden');

			if (totalPage == 0 || totalPage == 1) {
				container.addClass('disabled').hide();
			} else {
				container.removeClass('disabled').show();
				var inHTML = '';
				for (var index = 0; index < totalPage; index++) {
					inHTML += '<a class="paging-btn paging-btn-num pageing-btn-' + index + '" data-index="' + index + '">';
					inHTML += '<span class="icon"></span>';
					inHTML += '<span class="text">' + (index + 1) + '</span>';
					inHTML += '</a>';
					inHTML += '<span class="dots">...</span>';
				}
			}

			btnsContainer.empty().append($(inHTML));

			if (currentPage > totalPage) {
				currentPage = settings.currentPage = totalPage;
			}

			this.goToPage(currentPage);
		},
		goToPage: function (pageNum) {
			var _this = this.dom();
			var settings = this.settings;
			var container = _this.find('div.paging-container');
			var grid = settings.objs.grid.dom();
			var rows = settings.objs.rows;
			var currentPage = isNaN(pageNum) ? 0 : pageNum;
			var numPerPage = settings.numPerPage;
			var totalPage = settings.totalPage;
			var wrap = grid.find('tbody.grid-content-data').eq(0);
			var dataLength = settings.objs.grid._keys.length;

			if (currentPage >= totalPage && totalPage > 0) {
				currentPage = totalPage - 1;
			} else if (currentPage < 0) {
				currentPage = 0;
			}

			// 显示信息
			var start = dataLength === 0 ? 0 : currentPage * numPerPage + 1;
			var end = dataLength === 0 ? 0 : start + numPerPage - 1;
			end = end > dataLength ? dataLength : end;
			var text = $.su.CHAR.COMMON.GRID_PAGING_SHOW;
			text = text.replace('%start', start);
			text = text.replace('%end', end);
			text = text.replace('%total', dataLength);
			_this.find('.paging-info span').text(text);

			//按钮样式调整
			var btnPrev = container.find('a.paging-btn.pageing-btn-prev');
			var btnNext = container.find('a.paging-btn.pageing-btn-next');
			var btns = container.find('a.paging-btn-num');
			var dots = container.find('span.dots');

			//数字按钮的处理
			btns.removeClass('current');
			dots.addClass('hidden');
			btns.filter('[data-index=' + currentPage + ']').addClass('current');

			if (totalPage > 5) {
				var minOri = currentPage - 2;
				var maxOri = currentPage + 2;
				var totalOri = totalPage - 1;
				var max = currentPage + 2 + (minOri < 0 ? 0 - minOri : maxOri > totalOri ? totalOri : 0);
				var min = minOri < 0 ? 0 : minOri - (maxOri > totalOri ? maxOri - totalOri : 0);

				btns.addClass('hidden');

				for (var index = min; index <= max; index++) {
					btns.eq(index).removeClass('hidden');
				}
			}

			//数据跳转
			settings.currentPage = currentPage;

			var keys = this.getPageKeys();
			wrap.children('tr[data-page!=' + currentPage + ']').addClass('hidden');
			wrap.children('tr[data-page=' + currentPage + '], .grid-content-tr.empty').removeClass('hidden');
			grid.triggerHandler('ev_store_render_items', [keys]);

			if ($.su.getBrowseVersion().browse == 'safari') {
				var table = grid.find('table');
				table.css('display', 'inline-table');
				setTimeout(function () {
					table.css('display', '');
				}, 0);
			}

			setTimeout(function () {
				// 前后按钮的处理
				if (totalPage <= 5) {
					btnPrev.hide();
					btnNext.hide();
				} else {
					btnPrev.show();
					btnNext.show();
				}

				if (currentPage === 0) {
					btnPrev.addClass('disabled');
					btnNext.removeClass('disabled');
				} else if (currentPage >= totalPage - 1) {
					btnPrev.removeClass('disabled');
					btnNext.addClass('disabled');
				} else {
					btnPrev.removeClass('disabled');
					btnNext.removeClass('disabled');
				}
			}, 180);

			grid.triggerHandler('ev_grid_paging_changed');
		},
		goPrev: function () {
			var settings = this.settings;
			var currentPage = settings.currentPage;

			currentPage--;
			if (currentPage < 0) {
			} else {
				//跳转到前一页
				this.goToPage(currentPage);
			}
		},
		goNext: function () {
			var settings = this.settings;
			var currentPage = settings.currentPage;
			var totalPage = settings.totalPage;

			currentPage++;
			if (currentPage >= totalPage) {
			} else {
				//跳转到下一页
				this.goToPage(currentPage);
			}
		},
		goFirst: function () {
			var settings = this.settings;
			var totalPage = settings.totalPage;

			settings.currentPage = 0;
			this.goToPage(0);
		},
		goLast: function () {
			var settings = this.settings;
			var totalPage = settings.totalPage;

			settings.currentPage = totalPage > 1 ? totalPage - 1 : totalPage;
			this.goToPage(settings.currentPage);
		},
		getPageKeys: function () {
			var settings = this.settings;
			var grid = settings.objs.grid;
			var renderMap = grid._renderMap;
			var keys = grid._keys;
			var numPerPage = settings.numPerPage;
			var currentPage = settings.currentPage;
			var startPosition = numPerPage * currentPage;
			var endPosition = startPosition + numPerPage - 1;
			// var pageKeys = [];
			var renderKeys = [];

			for (var i = startPosition; i <= endPosition; i++) {
				// pageKeys.push(keys[i]);
				if (!renderMap[keys[i]] && keys[i] != undefined) {
					renderKeys.push(keys[i]);
				}
			}
			// this._pageMap[currentPage] = pageKeys;

			return renderKeys;
		},
		updateRowPage: function (keys) {
			var viewObj = this;
			var settings = this.settings;
			var grid = settings.objs.grid;
			var numPerPage = settings.numPerPage;
			var wrap = grid.dom().find('tbody.grid-content-data').eq(0);
			var rows = wrap.children('tr');

			for (var i = 0, len = keys.length; i < len; i++) {
				var page = Math.floor(i / numPerPage);
				this._pageMap[keys[i]] = page;
			}

			rows.each(function () {
				var key = $(this).attr('data-key');
				$(this).attr('data-page', viewObj._pageMap[key]);
			});

			return this._pageMap;
		}
	});
})();
