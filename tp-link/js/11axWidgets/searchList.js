(function ($) {
	var SearchList = $.su.Widget.register('searchList', {
		settings: {
			multiselect: {
				attribute: 'multiselect',
				defaultValue: false
			},
			maxLine: {
				attribute: 'max-line',
				defaultValue: 4
			},
			scroll: {
				attribute: 'scroll',
				defaultValue: false
			},
			numPerPage: {
				attribute: 'num-per-page',
				defaultValue: 10
			},
			pathSeparator: {
				attribute: 'path-separator',
				defaultValue: '>'
			}
		},
		listeners: [
			{
				selector: '.devicesList-item-container',
				event: 'click',
				callback: function (e, viewObj) {
					e.stopPropagation();
					var itemObj = $(this).data('viewObj');
					if (itemObj._status.disabled) {
						return;
					}

					var data = itemObj._relatedData;
					if (!viewObj.settings.multiselect) {
						viewObj._selectedData.push(data);
						var dataObj = viewObj.getSelected();
						viewObj.dom().triggerHandler('ev_item_click', dataObj);

						$(this).closest('[widget=devicesList]').find('.item-selected').removeClass('item-selected');
						$(this).addClass('item-selected');
					} else {
						var checkboxObj = $(this).find('.devicesList-item-checkbox[widget=checkbox]').data('viewObj');
						var tmpTarget = e.target ? e.target : e.srcElement;
						var checkboxItem = $(tmpTarget).closest('.devicesList-item-checkbox[widget=checkbox]');

						var flag = !checkboxObj._status.checked;
						if (checkboxItem.size() > 0) {
							flag = !flag;
						}
						var selectedData = viewObj._selectedData;
						if (!flag) {
							checkboxObj.setValue(false);
							for (var i = 0, len = selectedData.length; i < len; i++) {
								if (data.key == selectedData[i].key) {
									selectedData.splice(i, 1);
									break;
								}
							}
							$(this).removeClass('item-selected');
						} else {
							checkboxObj.setValue(true);
							selectedData.push(data);
							$(this).addClass('item-selected');
						}
					}
				}
			},
			{
				selector: '.searchList-paging-container .paging-btn',
				event: 'click',
				callback: function (e, viewObj) {
					var items = viewObj.dom().find('.searchList-item-container');
					var i = parseInt($(this).text());
					var num = viewObj.settings.numPerPage;
					var btns = viewObj.dom().find('.paging-btn-num');
					items.hide();
					if (isNaN(i)) {
						if ($(this).hasClass('pageing-btn-prev')) {
							i = 1;
						} else {
							i = btns.length;
						}
					}
					items
						.filter(function (index) {
							return index >= (i - 1) * num && index < i * num;
						})
						.show();
					viewObj.dom().find('.current').removeClass('current');

					btns.hide();
					if (i <= 2) {
						btns
							.filter(function (index) {
								return index <= 4;
							})
							.show();
					} else if (i >= btns.length - 1) {
						btns
							.filter(function (index) {
								return index >= btns.length - 5;
							})
							.show();
					} else {
						btns
							.filter(function (index) {
								return index >= i - 3 && index <= i + 1;
							})
							.show();
					}
					btns.eq(i - 1).addClass('current');
				}
			}
		],
		init: function (options) {},

		render: function () {
			var viewObj = this;
			var settings = this.settings;
			var _this = this.dom();
			_this.addClass('searchList-container widget-container ');
			var inHTML = '';
			inHTML += '<div class="searchList-header">';
			inHTML += '<div class="searchList-results-title">';
			inHTML += '<span class="searchList-results-label">' + $.su.CHAR.SEARCH.SEARCH_RESULTS + '</span>';
			inHTML += '<span class="searchList-results-separator"> - </span>';
			inHTML += '<span class="searchList-results-count">' + $.su.CHAR.SEARCH.RESULTS + '</span>';
			inHTML += '</div>';
			inHTML += '</div>';
			inHTML += '<div class="no-results-prompt">';
			inHTML += '<p>' + $.su.CHAR.SEARCH.NO_RESULTS_PROMPT + '</p>';
			inHTML += '</div>';
			inHTML += '<div class="searchList-content-container">';
			inHTML += '<ul class="searchList-content-ul"></ul>';
			inHTML += '</div>';
			_this.append(inHTML);
			$.su.scrollbar({ ele: '.searchList-content-ul' });
		},

		loadItems: function (data) {
			var me = this;
			var listContainer = this.dom().find('.searchList-content-ul');
			var settings = this.settings;
			var _this = this.dom();

			listContainer.empty();
			var dataLength = data.length;
			if (dataLength === 0) {
				_this.find('.no-results-prompt').show();
				_this.find('.searchList-content-container').hide();
			} else {
				_this.find('.no-results-prompt').hide();
				_this.find('.searchList-content-container').show();
				for (var i = 0; i < dataLength; i++) {
					var itemData = data[i];
					var tempDom = $('<li id="' + this.domId + '-item-' + i + '" class="searchList-item-container"></li>');
					var itemDom = $(this.renderContent(itemData));
					tempDom.append(itemDom).appendTo(listContainer);
				}
			}
			_this.find('.searchList-results-count').text(dataLength + ' ' + $.su.CHAR.SEARCH.RESULTS);
			this.renderSearchList();
		},
		renderSearchList: function () {
			var _this = this.dom();
			var viewObj = this;
			var settings = this.settings;
			var maxLine = settings.maxLine;
			var numPerPage = settings.numPerPage;
			var items = _this.find('.searchList-item-container');
			var contentHeight = items.eq(0).outerHeight(true) * maxLine;

			if (items.length > numPerPage && !settings.scroll) {
				var total = Math.ceil(items.length / numPerPage);

				items
					.filter(function (i) {
						return i >= numPerPage;
					})
					.hide();
			} else if (settings.scroll) {
				_this.outerHeight(contentHeight);
				_this.css({ 'overflow-y': 'scroll' });
			}
			initPagingBtn();
			function initPagingBtn() {
				var inHTML = '<div class="searchList-paging-container paging-container disabled">';
				inHTML += '<div class="paging-wrap">';
				inHTML += '<div class="paging-btns inline-block">';
				if (total > 5) {
					inHTML += '<a class="paging-btn pageing-btn-prev" data-index="prev">';
					inHTML += '<span class="icon"></span><span class="text"><</span></a>';
				}
				inHTML += '<div class="num-buttons-container">';
				for (var i = 0; i < total; i++) {
					inHTML += '<a class="paging-btn paging-btn-num pageing-btn-' + i + '">';
					inHTML += '<span class="icon"></span>';
					inHTML += '<span class="text">' + (i + 1) + '</span>';
					inHTML += '</a>';
				}
				inHTML += '</div>';
				if (total > 5) {
					inHTML += '<a class="paging-btn pageing-btn-next" data-index="next">';
					inHTML += '<span class="icon"></span><span class="text">></span></a>';
				}
				inHTML += '</div></div></div>';
				_this.find('.searchList-paging-container').remove();
				$(inHTML).appendTo(_this);
				var btns = _this.find('.paging-btn-num');
				btns.eq(0).addClass('current');
				if (total > 5) {
					btns
						.filter(function (i) {
							return i >= 5;
						})
						.hide();
				}
			}
		},
		renderContent: function (data) {
			var settings = this.settings;
			var name = data.name;
			var path = data.path;
			var introduction = data.introduction;
			var separator = settings.pathSeparator;

			if (!$.isArray(path)) {
				path = [path];
			}

			var html = '<div class="searchList-item-content">';
			var length = path.length;
			html += '<a href="#' + name + '">';
			for (var i = 0; i < length; i++) {
				if (this.isContainLink(path[i])) {
					path[i] = this.deleteLink(path[i]);
				}
				html += '<span class="path-node">' + this.handleSearchItemContent(path[i]) + '</span>';
				if (i != length - 1) {
					html += '<span class="path-separator"> ' + separator + ' </span>';
				}
			}
			html += '</a>';
			if (introduction != '') {
				html += '<div class="searchList-item-introduction">' + introduction + '</div>';
				html += '</div>';
			}

			return html;
		},
		isContainLink: function (str) {
			var regLink = /<[a].+?>.+?<\/[a]>/gi;
			return regLink.test(str);
		},
		deleteLink: function (str) {
			var regLinkHead = /<[a].+?>/gi;
			var regLinkFoot = /<\/[a]>/gi;
			str = str.replace(regLinkHead, '');
			str = str.replace(regLinkFoot, '');
			return str;
		},
		setSearchWorld: function (word) {
			var _this = this.dom();
			_this.find('.searchList-item-content').each(function () {
				var matchNode = $(this).find('.path-node').last();
				wordTransed = word.replace(/[\*\.\?\+\$\^\[\]\(\)\{\}\|\\\/]/g, function ($1) {
					return '\\' + $1;
				});
				var reg = new RegExp(wordTransed, 'i');
				matchNode.html(
					matchNode.text().replace(reg, function ($1) {
						return '<span class="searchList-matched-text">' + $1 + '</span>';
					})
				);
			});
		},
		handleSearchItemContent: function (str) {
			return str;
		}
	});
})(jQuery);
