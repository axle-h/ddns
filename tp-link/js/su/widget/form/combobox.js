(function () {
	var Combobox = $.su.Widget.register('combobox', {
		settings: {
			name: {
				attribute: 'name',
				defaultValue: ''
			},
			labelField: {
				attribute: 'label-field',
				defaultValue: ''
			},
			multiSelect: {
				attribute: 'multi-select',
				defaultValue: 'single' // single or multiple
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
			},
			editable: {
				attribute: 'editable',
				defaultValue: false
			},
			readOnly: {
				attribute: 'read-only',
				defaultValue: false
			},
			noneSelectedRemind: {
				attribute: 'none-selected-remind',
				defaultValue: true
			},
			noneSelectedText: {
				attribute: 'none-selected-text',
				defaultValue: $.su.CHAR.COMMON.PLEASE_SELECT
			},
			spanText: {
				attribute: 'span-text',
				defaultValue: false
			},
			optionWidth: {
				attribute: 'option-width',
				defaultValue: 'auto'
			}
		},
		listeners: [
			{
				selector: 'a.combobox-switch',
				event: 'click',
				callback: function (e, viewObj) {
					viewObj.dom().find('input.combobox-text').focus();
				}
			},
			{
				selector: 'div.combobox-wrap',
				event: 'click',
				callback: function (e, viewObj) {
					e.stopPropagation();
					if (!$.su.isMobile()) {
						viewObj._handleToggle();
					}
				}
			},
			{
				selector: 'div.combobox-wrap',
				event: 'mousedown',
				callback: function (e, viewObj) {
					e.stopPropagation();
				}
			},
			{
				selector: 'div.combobox-wrap',
				event: 'mouseenter',
				callback: function (e, viewObj) {
					viewObj.dom().addClass('hover');
				}
			},
			{
				selector: 'div.combobox-wrap',
				event: 'mouseleave',
				callback: function (e, viewObj) {
					viewObj.dom().removeClass('hover');
				}
			},
			{
				selector: 'input.combobox-text',
				event: 'click',
				callback: function (e) {
					e.preventDefault();
				}
			},
			{
				selector: 'span.combobox-text',
				event: 'click',
				callback: function (e) {
					e.preventDefault();
				}
			},
			{
				selector: 'input.combobox-text',
				event: 'focus',
				callback: function (e, viewObj) {
					var container = viewObj.getContainer();

					if (container.hasClass('disabled') || container.hasClass('none-items')) {
						return;
					}
					viewObj.setFocus();
					container.addClass('focus');
				}
			},
			{
				selector: 'input.combobox-text',
				event: 'keyup',
				callback: function (e, viewObj) {
					var container = viewObj.getContainer();
					var value = container.find('input.combobox-text').val();
					var checkboxs = container.find('input.combobox-checkbox');

					container.find('li').removeClass('selected');
					checkboxs.prop('checked', false);
					checkboxs.each(function (i, obj) {
						if ($(obj).val() == value) {
							$(obj).prop('checked', true);
							$(obj).closest('li.combobox-list').addClass('selected');
							return false;
						}
					});
				}
			},
			{
				selector: 'input.combobox-text',
				event: 'keyup',
				callback: function (e, viewObj) {
					if (!viewObj.settings.editable) {
						return;
					}

					var vNew = viewObj.dom().find('input.combobox-text').val();

					viewObj.dom().triggerHandler('ev_view_change', [
						{
							type: 'value',
							value: vNew
						}
					]);
				}
			},
			{
				selector: 'input.combobox-text',
				event: 'blur',
				callback: function (e, viewObj) {
					//			if (!viewObj.settings.editable){
					//				return;
					//			}

					var vNew = viewObj.dom().find('input.combobox-text').val();

					viewObj.dom().removeClass('focus');
					// viewObj.dom().triggerHandler("ev_view_change", [{
					// 	"type": "valid",
					// 	"value": vNew
					// }]);
				}
			}
		],

		init: function () {
			this._defaultValue = null;
			this._dataMap = {};
			this._displayMap = {};
			this._value = [];
		},
		render: function () {
			var _this = this.dom();
			var settings = this.settings;

			var editable = settings.editable === true && settings.multiSelect === 'single' ? '' : 'readonly="true"';
			var labelField = settings.labelField === false ? ' label-empty' : '';
			var readOnly = settings.readOnly ? ' readonly' : '';
			var tips = settings.tips ? ' tips' : '';
			var shortTips = settings.shortTips === '' ? '' : ' short-tips';
			var spanText = settings.spanText ? ' span-text-combobox' : '';

			_this.addClass(settings.cls + 'combobox-container ' + settings.multiSelect + labelField + readOnly + tips + shortTips + spanText);

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

			inHTML += '<div class="widget-wrap-outer combobox-wrap-outer">';
			inHTML += '<div class="widget-wrap combobox-wrap">';
			inHTML += '<span class="text-wrap-before"></span>';
			inHTML += '<span class="combobox-wrap-inner">';
			if (!settings.spanText) {
				inHTML +=
					'<input class="combobox-text ' +
					settings.inputCls +
					'" type="text" tabindex="-1" ' +
					editable +
					' value="' +
					(settings.noneSelectedRemind ? settings.noneSelectedText : '') +
					'" />';
			} else {
				inHTML +=
					'<span class="combobox-text ' + settings.inputCls + '">' + (settings.noneSelectedRemind ? settings.noneSelectedText : '') + '</span>';
			}

			inHTML += '</span>';
			inHTML += '<a class="combobox-switch" tabindex="' + settings.tabindex + '">';
			inHTML += '<span class="icon"></span>';
			inHTML += '</a>';

			// for ie shadow

			if ($('#global-combobox-options').children().length === 0) {
				var optionHtml = '<div class="combobox-list-wrap">';

				optionHtml += '<div class="position-top-left"></div><div class="position-top-center"></div>';
				optionHtml += '<div class="position-center-left"><div class="position-center-right">';

				optionHtml += '<div class="combobox-list-content-wrap">';
				optionHtml += '<ul class="combobox-list">';
				optionHtml += '</ul>';
				optionHtml += '</div>';

				optionHtml += '</div></div>';

				optionHtml += '<div class="position-bottom-left"></div><div class="position-bottom-center"></div>';

				optionHtml += '</div>';
				$('#global-combobox-options').append(optionHtml);
			}
			inHTML += '<div class="hidden combobox-lists"></div>';

			inHTML += '<span class="text-wrap-after"></span>';
			inHTML += '</div>';
			if (settings.shortTips != '' && settings.shortTips != null && settings.shortTips != undefined) {
				inHTML += '<div class="widget-short-tips combobox-short-tips">';
				inHTML += '<div class="content short-tips-content">' + settings.shortTips + '</div>';
				inHTML += '</div>';
			}
			inHTML += '<div widget="errortip" error-cls="' + settings.errorTipsCls + '">';
			inHTML += '</div>';
			inHTML += '<div class="widget-tips combobox-tips ' + settings.tipsCls + '">';
			inHTML += '<div class="content tips-content">' + settings.tips + '</div>';
			inHTML += '</div>';
			inHTML += '</div>';

			if (settings.tipText) {
				inHTML += '<div widget="toolTip"></div>';
			}

			_this.append(inHTML);

			if (settings.items && settings.items.length > 0) {
				this.loadItems(settings.items);
			}

			var comboboxList = $('#global-combobox-options .combobox-list-content-wrap');
			if (comboboxList.find('.ps__rail-y').length === 0) {
				$.su.scrollbar({ ele: comboboxList[0], opts: { minScrollbarLength: 20 } });
			}
		},
		loadItems: function (items) {
			var _this = this.dom();
			var settings = this.settings;
			var container = this.getContainer();
			var value;

			if (!$.isArray(items)) {
				items = [];
			}

			settings.items = items;

			var lists = '';
			for (var index = 0, len = items.length; index < len; index++) {
				if (items[index]) {
					//修改内部接口，下拉框数据加载时，只操作DOM一次（组装好再append）
					lists += this.initItemHtml(index, items[index]);
					if (items[index].selected) {
						value = items[index][settings.valueField];
						value = this.convertValue(value);
						this._defaultValue = value;
					}
				}
			}
			// this.lists = lists;
			_this.find('div.combobox-lists').html(lists);

			this.setValue(value);

			if (items.length == 0) {
				container.addClass('none-items');
			} else {
				container.removeClass('none-items');
			}

			_this.triggerHandler('ev_view_update');
		},
		initItemHtml: function (index, item) {
			var settings = this.settings;
			var _this = this.dom();
			var _selectType = settings.multiSelect;
			var _inputId = this.domId + '-' + $.su.randomId('option');
			var _display = item[settings.displayField];
			var _value = item[settings.valueField];
			var _disabled = item['disabled'] ? true : false;
			var _checked = item.selected ? true : false;
			var _cls = item.cls || '';

			this._dataMap[index] = _value;
			this._displayMap[_value] = _display;

			var lists = '';
			lists += '<li class="combobox-list ' + _cls + ' ' + (_disabled ? 'disabled' : '') + ' ' + (_checked ? 'selected' : '') + '">';
			lists += '<label for="' + _inputId + '" type="' + _selectType + '" class="combobox-label ' + _selectType + '">';
			lists +=
				'<input id="' +
				_inputId +
				'" name="' +
				settings.name +
				'" display="' +
				_display +
				'" class="combobox-checkbox" type="checkbox" data-index="' +
				index +
				'" ' +
				(_checked ? ' checked="checked"' : '') +
				' ' +
				(_disabled ? 'disabled="disabled"' : '') +
				' />';
			lists += '<span class="icon"></span>';
			lists += '<span class="text">' + _display + '</span>';
			lists += '</label>';
			lists += '</li>';
			return lists;
		},
		getLiIndex: function (val) {
			for (var index in this._dataMap) {
				if (this._dataMap.hasOwnProperty(index) && val === this._dataMap[index]) {
					return index;
				}
			}
			return false;
		},
		setValue: function (valueArray) {
			var globalOptions = $('#global-combobox-options');
			var settings = this.settings;
			var result;
			var display;

			if (valueArray === null) {
				if (this._defaultValue === undefined || this._defaultValue === null) {
					valueArray = this._defaultValue;
				} else {
					this.dom().triggerHandler('ev_view_change', [
						{
							type: 'record',
							value: this._defaultValue
						}
					]);
					return;
				}
			}

			valueArray = this.convertValue(valueArray);

			this._value = $.su.clone(valueArray);

			if (settings.multiSelect === 'multiple') {
				result = [];
				for (var index = 0; index < valueArray.length; index++) {
					display = this._displayMap[valueArray[index]] || valueArray[index];
					result.push(display);
				}

				result = result.join(',');
			} else if (settings.multiSelect === 'single') {
				result = this._displayMap[valueArray] || settings.noneSelectedText;
			}

			this.setText(result);
			if (globalOptions.attr('data-shown') === this.domId) {
				this.setOptionsSelected();
			}
		},
		setOptionsSelected: function () {
			var _this = this.dom();
			var viewObj = this;
			var settings = this.settings;
			var globalOptions = $('#global-combobox-options');
			var checkboxs = globalOptions.find('input.combobox-checkbox');
			var valueArray = $.isArray(this._value) ? this._value : [this._value];

			if (settings.multiSelect === 'multiple') {
				var valueObj = (function () {
					var valueObj = {};
					for (var index = 0; index < valueArray.length; index++) {
						valueObj[valueArray[index]] = true;
					}
					return valueObj;
				})();

				checkboxs.each(function (i, obj) {
					var tar = $(obj);
					var attr = tar.attr('data-index');
					var val = viewObj._dataMap[attr];
					if (val in valueObj) {
						tar.closest('li.combobox-list').addClass('selected');
						obj.checked = true;
					} else {
						tar.closest('li.combobox-list').removeClass('selected');
						obj.checked = false;
					}
				});
			} else if (settings.multiSelect === 'single') {
				valueArray = valueArray[0];
				checkboxs.each(function (i, obj) {
					var tar = $(obj);
					var attr = tar.attr('data-index');
					var val = viewObj._dataMap[attr];
					if (val === valueArray) {
						tar.closest('li.combobox-list').addClass('selected');
						obj.checked = true;
					} else {
						tar.closest('li.combobox-list').removeClass('selected');
						obj.checked = false;
					}
				});
			}
		},

		convertValue: function (valueArray) {
			var settings = this.settings;

			if ($.type(valueArray) !== 'array' && settings.multiSelect === 'multiple') {
				valueArray = valueArray == null ? [] : [valueArray];
			}
			return valueArray;
		},

		setText: function (value) {
			var container = this.getContainer();
			if (!this.settings.spanText) {
				var textBox = container.find('input.combobox-text');

				textBox.val(value);
			} else {
				container.find('span.combobox-text').text(value);
			}
		},
		getText: function () {
			var container = this.getContainer();
			if (!this.settings.spanText) {
				var textBox = container.find('input.combobox-text');

				return textBox.val() === undefined ? '' : textBox.val();
			} else {
				var textBox = container.find('span.combobox-text');

				return textBox.text() === undefined ? '' : textBox.text();
			}
		},
		setReadOnly: function (readonly) {
			var container = this.getContainer();

			if (readonly) {
				container.addClass('readonly');
			} else {
				container.removeClass('readonly');
			}
		},
		enable: function () {
			var container = this.getContainer();

			container.removeClass('disabled');
			container.find('input.combobox-text').removeAttr('disabled');
			container.find('input.combobox-checkbox').prop('disabled', false);
			container.triggerHandler('ev_view_enable');
		},
		disable: function () {
			var container = this.getContainer();

			container.addClass('disabled');
			container.find('input.combobox-text').attr('disabled', true);
			container.find('input.combobox-checkbox').prop('disabled', true);
			container.triggerHandler('ev_view_disable');
		},
		enableItems: function (val) {
			this.toggleItems(val, true);
		},
		disableItems: function (val) {
			this.toggleItems(val, false);
		},
		hideItems: function (val) {
			if (val === undefined) {
				return this.disable();
			}

			var index, li, liInput;
			var _this = this.dom();
			var globalOptions = $('#global-combobox-options');
			var listsWrap = _this.find('div.combobox-lists');
			val = $.isArray(val) ? val : [val];
			for (var i = 0, len = val.length; i < len; i++) {
				index = this.getLiIndex(val[i]);
				if (index !== false) {
					liInput = listsWrap.find('input.combobox-checkbox[data-index=' + index + ']');
					li = liInput.closest('li');
					li.addClass('hidden');
					li.addClass('disabled');
					liInput.attr('disabled', 'disabled');
				}
			}

			if (globalOptions.attr('data-shown') === this.domId) {
				var lists = listsWrap.eq(0).html();
				globalOptions.find('ul.combobox-list').html(lists);
				this.setOptionsSelected();
			}
		},
		showItems: function (val) {
			if (val === undefined) {
				return this.enable();
			}

			var index, li, liInput;
			var _this = this.dom();
			var globalOptions = $('#global-combobox-options');
			var listsWrap = _this.find('div.combobox-lists');
			val = $.isArray(val) ? val : [val];
			for (var i = 0, len = val.length; i < len; i++) {
				index = this.getLiIndex(val[i]);
				if (index !== false) {
					liInput = listsWrap.find('input.combobox-checkbox[data-index=' + index + ']');
					li = liInput.closest('li');
					li.removeClass('hidden');
					li.removeClass('disabled');
					liInput.removeAttr('disabled');
				}
			}

			if (globalOptions.attr('data-shown') === this.domId) {
				var lists = listsWrap.eq(0).html();
				globalOptions.find('ul.combobox-list').html(lists);
				this.setOptionsSelected();
			}
		},
		toggleItems: function (val, status) {
			if (val === undefined) {
				return this.disable();
			}

			var index, li, liInput;
			var _this = this.dom();
			var globalOptions = $('#global-combobox-options');
			var listsWrap = _this.find('div.combobox-lists');
			val = $.isArray(val) ? val : [val];
			for (var i = 0, len = val.length; i < len; i++) {
				index = this.getLiIndex(val[i]);
				if (index !== false) {
					liInput = listsWrap.find('input.combobox-checkbox[data-index=' + index + ']');
					li = liInput.closest('li');
					if (status) {
						li.removeClass('disabled');
						liInput.removeAttr('disabled');
					} else {
						li.addClass('disabled');
						liInput.attr('disabled', 'disabled');
					}
				}
			}

			if (globalOptions.attr('data-shown') === this.domId) {
				var lists = listsWrap.eq(0).html();
				globalOptions.find('ul.combobox-list').html(lists);
				this.setOptionsSelected();
			}
		},
		getValue: function () {
			var _this = this.dom();
			var viewObj = this;
			var settings = this.settings;
			var checkboxs = _this.find('input.combobox-checkbox');
			var result = $.isArray(this._value) ? $.su.clone(this._value) : [this._value];

			if (settings.multiSelect === 'single') {
				result = result.length > 0 ? result[0] : settings.noneSelectedText;
				if (settings.editable == true) {
					var input = _this.find('input.combobox-text');
					result = input.val();
				}
			}

			return result;
		},
		_handleToggle: function () {
			var viewObj = this;
			var _this = viewObj.dom();
			var switchBtn = _this.find('a.combobox-switch');
			var outerWrap = _this.find('.widget-wrap.combobox-wrap');
			var wrap = switchBtn.next('div.combobox-list-wrap');
			var container = viewObj.getContainer();
			var globalOptions = $('#global-combobox-options');
			var toggleFlag = globalOptions.attr('data-shown') === viewObj.domId ? 'shown' : 'hidden';

			if (container.hasClass('disabled') || container.hasClass('none-items') || container.hasClass('readonly')) {
				return false;
			}

			viewObj.setFocus();
			container.addClass('focus');
			container.removeClass('error');

			if (toggleFlag === 'hidden') {
				if (viewObj.settings.multiSelect == 'single') {
					globalOptions.addClass('single');
				} else {
					globalOptions.removeClass('single');
				}

				if (viewObj.settings.multiSelect === 'single') {
					_this.off('focusout', 'div.combobox-wrap-outer').on('focusout', 'div.combobox-wrap-outer', function (e) {
						var offset = globalOptions.offset();
						var width = globalOptions.find('.combobox-list-wrap').width();
						var height = globalOptions.find('.combobox-list-wrap').height();

						if (viewObj._xx < offset.left || viewObj._xx > offset.left + width || viewObj._yy < offset.top || viewObj._yy > offset.top + height) {
							viewObj.hideGlobalOptions();
						}
					});
				} else {
					$('html').on('click', 'div:not(.combobox-list-wrap)', viewObj.hideGlobalOptions);
				}
				viewObj._bindGlobalEvent();

				viewObj.showGlobalOptions();
			} else {
				viewObj.hideGlobalOptions();
			}
		},
		_bindGlobalEvent: function () {
			var viewObj = this;
			var globalOptions = $('#global-combobox-options');
			globalOptions.off('click', 'label.combobox-label').on('click', 'label.combobox-label', function (e) {
				e.stopPropagation();
				e.preventDefault();

				var label = $(this);
				var li = label.closest('li.combobox-list');
				var container = viewObj.getContainer();
				var input = label.find('input.combobox-checkbox');
				var value = viewObj._dataMap[input.attr('data-index')];
				var vOld = viewObj.getValue();
				var vNew = [];

				if (li.hasClass('disabled') || container.hasClass('readonly')) {
					return;
				}

				switch (viewObj.settings.multiSelect) {
					case 'multiple':
						var checked = input.prop('checked');
						if (checked) {
							if (vOld.length > 0) {
								for (var index = vOld.length - 1; index >= 0; index--) {
									if (vOld[index] == value) {
										vOld.splice(index, 1);
										break;
									}
								}
							}
						} else {
							vOld.push(value);
						}
						vNew = vOld;
						break;

					case 'single':
						vNew = value;
						viewObj.hideGlobalOptions();
						container.addClass('selected');
						container.removeClass('focus');
						// var listWrap = label.parents("div.combobox-list-wrap");
						// listWrap.hide().attr("toggleflag", "hidden");
						break;
				}

				viewObj.dom().triggerHandler('ev_view_change', [
					{
						type: 'value',
						value: vNew,
						triggerAction: 'clickLabel'
					},
					viewObj.getValue()
				]);
			});
		},
		showGlobalOptions: function () {
			var viewObj = this;
			var _this = viewObj.dom();
			var outerWrap = _this.find('.widget-wrap.combobox-wrap');
			var globalOptions = $('#global-combobox-options');
			var optionsOffset = outerWrap.offset();
			var containerOffset = $('body').offset();
			var lists = _this.find('div.combobox-lists').eq(0).html();
			var listWrap = globalOptions.find('div.combobox-list-wrap');
			globalOptions.find('ul.combobox-list').html(lists);
			var fromDownToTop = false;
			var width = this.settings.optionWidth == 'auto' ? outerWrap.outerWidth() + 'px' : this.settings.optionWidth;
			if (optionsOffset.top + outerWrap.height() + listWrap.outerHeight() + 10 > $(window).height() && optionsOffset.top - listWrap.height() > 0) {
				globalOptions
					.css({
						position: 'absolute',
						width: width,
						left: optionsOffset.left - containerOffset.left + 'px',
						top: 'auto',
						bottom: $(window).height() - optionsOffset.top,
						'z-index': $.su.getMaxZIndex() + 1
					})
					.addClass('down-to-up');
			} else {
				globalOptions
					.css({
						position: 'absolute',
						width: width,
						left: optionsOffset.left - containerOffset.left + 'px',
						top: optionsOffset.top + outerWrap.height() + 2 + 'px',
						bottom: 'auto',
						'z-index': $.su.getMaxZIndex() + 1
					})
					.removeClass('down-to-up');
			}

			listWrap.slideDown(150);

			globalOptions.attr('data-shown', viewObj.domId);
			$('body').on('mousemove', viewObj.getComboboxXy);
			viewObj.toggleFlag = 'shown';
			viewObj.setOptionsSelected();

			var selectedLi = globalOptions.find('li.selected');
			var firstLi = $(globalOptions.find('li').get(0));
			if (selectedLi.length > 0) {
				var offset = selectedLi.offset().top - firstLi.offset().top;
				globalOptions.find('div.combobox-list-content-wrap').scrollTop(offset);
			} else {
				globalOptions.find('div.combobox-list-content-wrap').scrollTop(0);
			}
			var ps = globalOptions.find('.combobox-list-content-wrap').data('ps');
			ps && ps.update();

			//close event
			$('div')
				.not(function () {
					return $(globalOptions).find(this).length || $(globalOptions).is(this) || $(this).closest('.combobox-wrap-outer', _this).length;
				})
				.off('.combobox')
				.one('scroll.combobox, mousedown.combobox', function (e) {
					viewObj.hideGlobalOptions();
					$('div').off('.combobox');
				});
		},
		hideGlobalOptions: function (animationFlag) {
			var viewObj = this;
			var globalOptions = $('#global-combobox-options');
			viewObj.toggleFlag = 'hidden';
			viewObj.dom().removeClass('focus');
			if (globalOptions.attr('data-shown') === viewObj.domId) {
				if (!animationFlag) {
					globalOptions.find('div.combobox-list-wrap').hide();
					triggerViewChange();
				} else {
					globalOptions.find('div.combobox-list-wrap').slideUp(150, triggerViewChange);
				}
				globalOptions.attr('data-shown', '_hidden_');
				globalOptions.off('click', 'label.combobox-label');
				$('body').off('mousemove', viewObj.getComboboxXy);
			}
			function triggerViewChange() {
				viewObj.dom().triggerHandler('ev_view_change', [
					{
						type: 'valid',
						value: viewObj._value
					}
				]);
			}
		},
		getComboboxXy: function (e) {
			var viewObj = this;
			var x, y;
			var e = e || window.event;
			viewObj._xx = e.clientX + document.body.scrollLeft + document.documentElement.scrollLeft;
			viewObj._yy = e.clientY + document.body.scrollTop + document.documentElement.scrollTop;
		},
		calculatePosition: function () {
			var _this = this.dom();
			var viewObj = this;
			var globalOptions = $('#global-combobox-options');
			var outerWrap = _this.find('.combobox-wrap');
			var optionsOffset = outerWrap.offset();
			var containerOffset = $('body').offset();
			var listWrap = globalOptions.find('div.combobox-list-wrap');
			var width = this.settings.optionWidth == 'auto' ? outerWrap.outerWidth() + 'px' : this.settings.optionWidth;
			if (optionsOffset.top + outerWrap.height() + listWrap.outerHeight() + 10 > $(window).height()) {
				globalOptions.css({
					position: 'absolute',
					width: width,
					left: optionsOffset.left - containerOffset.left + 'px',
					top: optionsOffset.top - listWrap.height() - 2 + 'px',
					'z-index': $.su.getMaxZIndex() + 1
				});
			} else {
				globalOptions.css({
					position: 'absolute',
					width: width,
					left: optionsOffset.left - containerOffset.left + 'px',
					top: optionsOffset.top + outerWrap.height() + 2 + 'px',
					'z-index': $.su.getMaxZIndex() + 1
				});
			}
		}
	});
})();
