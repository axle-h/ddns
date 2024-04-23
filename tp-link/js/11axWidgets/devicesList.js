(function ($) {
	var DevicesList = $.su.Widget.register('devicesList', {
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
			pagination: {
				attribute: 'pagination',
				defaultValue: true
			},
			numPerPage: {
				attribute: 'num-per-page',
				defaultValue: 8
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
					var dom = viewObj.dom();
					if (!viewObj.settings.multiselect) {
						viewObj._selectedData[0] = data;
						var dataObj = viewObj.getSelected();
						dom.triggerHandler('ev_item_click', dataObj);

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
							dom.triggerHandler('ev_item_deselect', data.key);
						} else {
							checkboxObj.setValue(true);
							selectedData.push(data);
							$(this).addClass('item-selected');
							dom.triggerHandler('ev_item_select', data.key);
						}
					}
				}
			},
			{
				selector: '.devicesList-paging-container .paging-btn',
				event: 'click',
				callback: function (e, viewObj) {
					var items = viewObj.dom().find('.devicesList-item-container');
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
		init: function (options) {
			this._keys = [];
			this._renderedItems = [];
			this._selectedData = [];

			var host = this.settings.host;
			if (!!host && !!host.setted) {
				host.trueValue = host.trueValue !== undefined ? host.trueValue : 'HOST';
				host.name = host.name !== undefined ? host.name : 'host';
			}
		},

		render: function () {
			var settings = this.settings;
			var _this = this.dom();
			var typeCls = [];
			//sort and combine the types as a className
			for (var i = 0; i < settings.configs.length; i++) {
				typeCls.push(settings.configs[i].type.toLowerCase());
			}
			typeCls.sort();
			typeCls.push('list');
			typeCls = typeCls.join('-');
			_this.addClass('devicesList-container widget-container ' + typeCls);
			var inHTML = '';
			inHTML = '<ul class="devicesList-content-container"></ul>';

			_this.append(inHTML);
		},

		syncData: function (keys, callback) {
			this.dom().find('.devicesList-content-container').empty();
			this._keys = keys;
			this._renderedItems = [];
			this._selectedData = [];

			this.dom().triggerHandler('ev_store_render_items', [keys]);
		},

		renderModels: function (keyProperty, models, callback) {
			var listContainer = this.dom().find('.devicesList-content-container');
			var settings = this.settings;

			for (var i = 0; i < models.length; i++) {
				var itemData = models[i].getData();
				var key = models[i][keyProperty].getValue();

				var tempDom = $('<li id="' + this.domId + '-item-' + i + '" class="devicesList-item-container" data-key="' + key + '"></li>');
				var itemDom = $(this.renderContent(itemData));
				tempDom.append(itemDom).appendTo(listContainer);

				var itemObj = new $.su.widgets.form({ id: tempDom });
				itemObj.render();
				itemObj._relatedData = { key: key, data: itemData };

				if (settings.multiselect) {
					var checkboxItem = $('<div widget="checkbox" class="devicesList-item-checkbox" name="devicesList-item-checkbox"></div>').appendTo(tempDom);
					var checkboxObj = new $.su.widgets.checkbox({ id: checkboxItem });
					checkboxObj.render();
					tempDom.addClass('multi-select');
				} else {
					tempDom.addClass('single-select');
				}

				this._renderedItems.push({ key: key, obj: itemObj });
			}

			!!callback && callback(this._renderedItems);
			this.renderdevicesList();
		},
		renderdevicesList: function () {
			var _this = this.dom();
			var settings = this.settings;
			var maxLine = settings.maxLine;
			var numPerPage = settings.numPerPage;
			var items = _this.find('.devicesList-item-container');
			var contentHeight = items.eq(0).outerHeight(true) * maxLine;

			if (items.length > numPerPage && !settings.scroll && settings.pagination) {
				var total = Math.ceil(items.length / numPerPage);

				items
					.filter(function (i) {
						return i >= numPerPage;
					})
					.hide();

				initPagingBtn();
			} else if (settings.scroll) {
				_this.outerHeight(contentHeight);
				_this.css({ 'overflow-y': 'scroll' });
			}
			function initPagingBtn() {
				var inHTML = '<div class="devicesList-paging-container paging-container disabled">';
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
				_this.find('.devicesList-paging-container').remove();
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
			if (data == undefined) {
				return;
			}

			data = $.su.escapeHtmlForObject(data);

			var settings = this.settings;
			var configs = settings.configs;
			var host = settings.host;

			var fnlCls = '';
			if (!!host && !!host.setted) {
				fnlCls = host.trueValue === data[host.name] ? ' host' : '';
			}

			var html = '<div class="devicesList-item-content">';
			for (var i = 0, len = configs.length; i < len; i++) {
				var type = configs[i].type;
				var fnlType = type.replace(/[A-Z]/g, function (item) {
					return '-' + item.toLowerCase();
				});

				var content = configs[i].dataIndex;
				if (fnlType == 'logo') {
					var cls = data[content] || 'pc';
					cls = $.su.getDeviceType(cls);
					fnlCls = 'icon icon-' + cls + fnlCls;

					html += '<div class="logo-container"><span class="' + fnlCls + '"></span></div>';
				} else {
					var label = configs[i].label ? configs[i].label + ': ' : '';
					html += '<div class="devicesList-item devicesList-item-' + fnlType + '">';
					html += '<span class="content-label">' + label + '</span>';
					if (configs[i].renderer) {
						html += '<span class="content">' + configs[i].renderer.call(configs[i], data[content], data) + '</span></div>';
					} else {
						html += '<span class="content">' + data[content] + '</span></div>';
					}
				}
			}
			html += '</div>';

			return html;
		},
		getSelected: function () {
			var dataArr = this._selectedData;
			var selectedArr = [];
			for (var i = 0, len = dataArr.length; i < len; i++) {
				selectedArr.push(dataArr[i].data);
			}
			return selectedArr;
		},
		setMultiSelect: function (multiselect) {
			this.settings.multiselect = multiselect;
		},
		disable: function (keys) {
			if (keys == undefined) {
				keys = this._keys;
			}
			keys = $.isArray(keys) ? keys : [keys];

			for (var i = 0, len = keys.length; i < len; i++) {
				var item = $('.devicesList-item-container[data-key=' + keys[i] + ']');
				item.attr('disabled', true).addClass('disabled');
				item.data('viewObj')._status.disabled = true;
			}
		},
		enable: function (keys) {
			if (keys == undefined) {
				keys = this._keys;
			}
			keys = $.isArray(keys) ? keys : [keys];

			for (var i = 0, len = keys.length; i < len; i++) {
				var item = $('.devicesList-item-container[data-key=' + keys[i] + ']');
				var itemObj = item.data('viewObj');
				if (!itemObj._status.disabled) {
					continue;
				}
				item.removeAttr('disabled').removeClass('disabled');
				itemObj._status.disabled = false;
			}
		},
		selectItems: function (keys) {
			if (keys == undefined) {
				keys = this._keys;
			}
			keys = $.isArray(keys) ? keys : [keys];

			for (var i = 0, len = keys.length; i < len; i++) {
				var item = $('.devicesList-item-container[data-key=' + keys[i] + ']');
				if (!item.hasClass('item-selected')) {
					this._viewSelect(item);
				}
			}
		},
		unselectItems: function (keys) {
			if (keys == undefined) {
				keys = this._keys;
			}
			keys = $.isArray(keys) ? keys : [keys];

			for (var i = 0, len = keys.length; i < len; i++) {
				var item = $('.devicesList-item-container[data-key=' + keys[i] + ']');
				if (item.hasClass('item-selected')) {
					this._viewSelect(item);
				}
			}
		},
		_viewSelect: function (item) {
			var itemObj = item.data('viewObj');
			if (itemObj._status.disabled) {
				return;
			}
			var data = itemObj._relatedData;
			var viewObj = this;
			if (!viewObj.settings.multiselect) {
				viewObj._selectedData[0] = data;
				item.closest('[widget=devicesList]').find('.item-selected').removeClass('item-selected');
				item.addClass('item-selected');
			} else {
				var checkboxObj = item.find('.devicesList-item-checkbox[widget=checkbox]').data('viewObj');
				var flag = !checkboxObj._status.checked;
				var selectedData = viewObj._selectedData;
				if (!flag) {
					checkboxObj.setValue(false);
					for (var i = 0, len = selectedData.length; i < len; i++) {
						if (data.key == selectedData[i].key) {
							selectedData.splice(i, 1);
							break;
						}
					}
					item.removeClass('item-selected');
				} else {
					checkboxObj.setValue(true);
					selectedData.push(data);
					item.addClass('item-selected');
				}
			}
		}
	});
})(jQuery);
