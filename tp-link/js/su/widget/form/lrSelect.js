(function () {
	$.su.Widget.register('lrselect', {
		settings: {
			readOnly: {
				attribute: 'read-only',
				defaultValue: false
			},
			labelField: {
				attribute: 'label-field',
				defaultValue: ''
			},
			displayField: {
				attribute: 'display-field',
				defaultValue: 'name'
			},
			valueField: {
				attribute: 'value-field',
				defaultValue: 'value'
			},
			tipText: {
				attribute: 'tip-text',
				defaultValue: ''
			}
		},
		listeners: [
			{
				selector: 'a.lrselect-switch',
				event: 'click',
				callback: function (e, viewObj) {
					var container = viewObj.getContainer(),
						switchBtn = $(this),
						settings = viewObj.settings;
					if (container.hasClass('disabled') || container.hasClass('none-items') || switchBtn.hasClass('disabled')) {
						return false;
					}
					var inIdx = viewObj._curIndex;
					if (switchBtn.hasClass('left-switch')) {
						--inIdx;
					} else if (switchBtn.hasClass('right-switch')) {
						++inIdx;
					}
					if (inIdx < 0) {
						inIdx = 0;
					}
					if (inIdx >= viewObj._items.length) {
						inIdx = viewObj._items.length - 1;
					}
					viewObj.dom().triggerHandler('ev_view_change', [
						{
							type: 'value',
							value: viewObj._items[inIdx][settings.valueField]
						}
					]);
				}
			}
		],
		init: function () {
			this._value = null;
			this._curIndex = -1;
			this._valueMap = {};
			this._items = [];
		},
		render: function () {
			var _this = this.dom();
			var settings = this.settings;
			var labelField = settings.labelField === false ? ' label-empty' : '';
			var readOnly = settings.readOnly ? ' readonly' : '';
			_this.addClass(settings.cls + 'lrselect-container ' + +labelField + readOnly);
			var inHTML = '';
			if (settings.labelField !== null) {
				inHTML += '<div class="widget-fieldlabel-wrap ' + settings.labelCls + '">';
				inHTML += '<div class="widget-fieldlabel-inner">';
				inHTML += '<label class="widget-fieldlabel combobox-fieldlabel">' + (settings.labelField === 'false' ? '' : settings.labelField) + '</label>';
				if (settings.labelField) {
					inHTML += '<span class="widget-separator">' + settings.separator + '</span>';
				}
				inHTML += '</div>';
				inHTML += '</div>';
			}
			inHTML += '<div class="widget-wrap-outer lrselect-wrap-outer">';
			inHTML += '<div class="widget-wrap lrselect-wrap">';
			inHTML += '<span class="text-wrap-before"></span>';
			inHTML += '<a class="lrselect-switch left-switch">';
			inHTML += '<span class="icon"></span>';
			inHTML += '</a>';
			inHTML += "<span class='lrselect-text'></span>";
			inHTML += '<a class="lrselect-switch right-switch">';
			inHTML += '<span class="icon"></span>';
			inHTML += '</a>';
			inHTML += '</div>';
			inHTML == '</div>';
			_this.append(inHTML);
			if (settings.items && settings.items.length > 0) {
				this.loadItems(settings.items);
			}
		},
		loadItems: function (items) {
			var settings = this.settings;
			var container = this.getContainer();
			if (!$.isArray(items)) {
				items = [];
			}
			this._items = items;
			this._curIndex = -1;
			var len = items.length;
			if (len == 0) {
				container.addClass('none-items');
			} else {
				container.removeClass('none-items');
			}

			for (var i = 0, item, map = {}, defaultV; i < len; i++) {
				item = items[i];
				map[item[settings.valueField]] = {
					dispaly: item[settings.displayField],
					index: i
				};
				if (item.selected === true) {
					defaultV = item[settings.valueField];
				}
			}
			this._valueMap = map;
			if (defaultV !== undefined) {
				this.setValue(defaultV);
			}
		},
		setValue: function (val) {
			var dom = this.dom(),
				itemLen = this._items.length;
			if (itemLen > 0) {
				var tarItem = this._valueMap[val];
				if (tarItem) {
					this._curIndex = tarItem.index;
					this.value = val;
					dom.find('span.lrselect-text').text(tarItem.dispaly);
					var lBtn = dom.find('.left-switch'),
						rBtn = dom.find('.right-switch');
					this._curIndex === 0 ? lBtn.addClass('disabled') : lBtn.removeClass('disabled');
					this._curIndex === itemLen - 1 ? rBtn.addClass('disabled') : rBtn.removeClass('disabled');
				}
			}
		},
		getValue: function () {
			return this._value;
		},
		disable: function () {
			var container = this.getContainer();
			container.addClass('disabled');
		},
		enable: function () {
			var container = this.getContainer();
			container.removeClass('disabled');
		}
	});
})();
