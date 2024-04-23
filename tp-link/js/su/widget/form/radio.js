(function () {
	var Radio = $.su.Widget.register('radio', {
		settings: {
			name: {
				attribute: 'name',
				defaultValue: ''
			},
			columns: {
				attribute: 'columns',
				defaultValue: 1
			},
			tipText: {
				attribute: 'tip-text',
				defaultValue: ''
			},
			toggleContent: {
				attribute: 'toggle-content',
				defaultValue: false
			},
			toggleText: {
				attribute: 'toggle-text',
				defaultValue: false
			},
			checkedText: {
				attribute: 'checked-text',
				defaultValue: ''
			},
			unCheckedText: {
				attribute: 'unchecked-text',
				defaultValue: ''
			}
		},

		listeners: [
			{
				selector: '.radio-label',
				event: 'click',
				callback: function (e, viewObj) {
					e.preventDefault();
					e.stopPropagation();

					if ($(this).hasClass('disabled')) {
						return;
					}

					var dataIndex = $(this).find('input').attr('data-index');
					viewObj.dom().triggerHandler('ev_view_change', [
						{
							type: 'value',
							value: viewObj.dataMap[dataIndex]
						}
					]);
					viewObj.setStatus('checked', true);
				}
			}
		],

		init: function () {
			this._defaultValue = null;
			this.dataMap = {};
			this._status.checked = false;
		},

		render: function () {
			var _this = this.dom();
			var settings = this.settings;
			var labelField = settings.labelField === false ? 'label-empty' : '';

			_this.addClass(settings.cls + 'radio-group-container ' + labelField);

			var inHTML = '';

			if (settings.labelField !== null && settings.labelField !== 'false') {
				inHTML += '<div class="widget-fieldlabel-wrap ' + settings.labelCls + '">';
				inHTML += '<div class="widget-fieldlabel-inner">';
				inHTML += '<label class="widget-fieldlabel radio-group-fieldlabel">' + settings.labelField + '</label>';
				if (settings.labelField) {
					inHTML += '<span class="widget-separator">' + settings.separator + '</span>';
				}
				inHTML += '</div>';
				inHTML += '</div>';
			}

			inHTML += '<div class="widget-wrap-outer radio-group-wrap-outer">';
			inHTML += '<div class="radio-group-slot"></div>';
			inHTML += '<div class="radio-group-wrap">';
			inHTML += '</div>';

			inHTML += '<div widget="errortip" error-cls="' + settings.errorTipsCls + '">';
			inHTML += '</div>';

			if (settings.tips != null && settings.tips != undefined) {
				inHTML += '<div class="widget-tips textbox-tips ' + settings.tipsCls + '">';
				inHTML += '<div class="widget-tips-wrap">';
				inHTML += '<div class="content tips-content">' + settings.tips + '</div>';
				inHTML += '</div>';
				inHTML += '</div>';
			}

			inHTML += '</div>';

			if (settings.tipText) {
				inHTML += '<div widget="toolTip"></div>';
			}

			_this.append(inHTML);

			var radioGroupSlot = _this.find('.radio-group-slot-template');
			if (radioGroupSlot) {
				_this.find('.radio-group-slot').html(radioGroupSlot);
			}

			if (settings.items && settings.items.length > 0) {
				this.loadItems(settings.items);
			}
		},

		loadItems: function (items) {
			var _this = this.dom();
			var settings = this.settings,
				toggleText = settings.toggleText;
			var perColumnNum = Math.ceil(items.length / settings.columns);
			var index;
			var _numFlag = 0;
			var contentFlag = false;
			var customFlag = false;

			if (!$.isArray(items) || items.length <= 0) {
				return;
			}

			settings.items = items;

			settings.name = items[0].name;

			var inHTML = '<ul class="radio-group-list-wrap">';

			var funcInitLi = function (boxName, boxIndex, boxId, boxlabel, boxCls, customFlag, explanation) {
				inHTML += '<li class="radio-list">';
				inHTML += '<div class="widget-wrap">';
				inHTML += '<label class="radio-label ' + boxCls + ' ' + checkedCls + '" for="' + boxId + '">';
				inHTML +=
					'<input class="radio-radio" type="radio" data-text="' +
					boxlabel +
					'" name="' +
					boxName +
					'" data-index="' +
					boxIndex +
					'" id="' +
					boxId +
					'" ' +
					checked +
					' />';
				if (!customFlag) {
					inHTML += '<span class="icon"></span>';
					inHTML += '<span class="text">' + item.boxlabel + (!explanation ? '' : '<span class="explain">' + explanation + '</span>') + '</span>';

					if (toggleText) {
						inHTML += '<span class="extra-text checked">' + settings.checkedText + '</span>';
						inHTML += '<span class="extra-text unchecked">' + settings.unCheckedText + '</span>';
					}
				} else {
					inHTML += '<div class="radio-custom-label-wrap"></div>';
				}
				inHTML += '</label>';
				inHTML += '</div>';
				inHTML += '<div class="radio-content-wrap hidden"></div>';
				inHTML += '</li>';
			};

			for (index = 0; index < items.length; index++) {
				var item = items[index];
				var boxName = item.name || '';
				var boxValue = item.value == undefined ? '' : item.value;
				var boxId = item.id || $.su.randomId('radio');
				var boxCls = item.itemCls || '';
				var checked = '';
				var checkedCls = '';
				var explanation = item.explanation;
				this.dataMap[index] = boxValue;

				contentFlag = item.content ? true : contentFlag;
				customFlag = item.customLabel ? true : customFlag;

				if (item.checked === 'checked' || item.checked === true) {
					checked = 'checked="checked"';
					checkedCls = 'checked';
					this._defaultValue = boxValue;
				}

				if (_numFlag < perColumnNum) {
					funcInitLi(boxName, index, boxId, item.boxlabel, boxCls, customFlag, explanation);
				} else {
					inHTML += '</ul>';
					inHTML += '<ul class="radio-group-list-wrap">';
					funcInitLi(boxName, index, boxId, item.boxlabel, boxCls, customFlag, explanation);
					_numFlag = 0;
				}
				_numFlag++;
			}

			inHTML += '</ul>';

			var container = this.getContainer();
			var wrap = container.find('div.radio-group-wrap').empty();

			wrap.append($(inHTML));

			if (contentFlag || customFlag) {
				for (index = 0; index < items.length; index++) {
					item = items[index];
					if (item.customLabel) {
						var custom = $(item.customLabel);
						custom.removeClass('hidden');
						container.find('li.radio-list').eq(index).find('div.radio-custom-label-wrap').show().append(custom);
					} else {
						container.find('li.radio-list').eq(index).find('div.radio-custom-label-wrap').hide();
					}
					if (item.content) {
						var content = $(item.content);
						content.removeClass('hidden');
						container.find('li.radio-list').eq(index).find('div.radio-content-wrap').show().append(content);
					} else {
						container.find('li.radio-list').eq(index).find('div.radio-content-wrap').hide();
					}
				}
			}

			_this.triggerHandler('ev_view_update');
		},

		getSelectedText: function () {
			var _this = this.dom();
			var settings = this.settings;

			var radioBox = _this.find('input.radio-radio:checked');

			return radioBox.attr('data-text');
		},

		getValue: function () {
			var radios = this.dom().find('input[type=radio]');
			var dataIndex;

			radios.each(function () {
				if ($(this).prop('checked')) {
					dataIndex = $(this).attr('data-index');
				}
			});
			return dataIndex !== undefined ? this.dataMap[dataIndex] : dataIndex;
		},

		setStyle: function (value) {
			var _this = this.dom();
			var radioBox;
			var settings = this.settings;
			var radioBoxs = _this.find('input.radio-radio').removeAttr('checked');
			_this.find('label.radio-label').removeClass('checked');

			for (var dataIndex in this.dataMap) {
				if (this.dataMap.hasOwnProperty(dataIndex) && this.dataMap[dataIndex] === value) {
					radioBox = radioBoxs.filter('[data-index=' + dataIndex + ']');
					radioBox.prop('checked', true);
					radioBox.closest('label.radio-label').addClass('checked');
					if (settings.toggleContent) {
						radioBox.closest('li.radio-list').find('.radio-content-wrap').show();
					}
					if (settings.toggleText) {
						var tarDom = radioBox.closest('li.radio-list');
						tarDom.find('.extra-text.checked').show();
						tarDom.find('.extra-text.unchecked').hide();
					}
				} else {
					radioBox = radioBoxs.filter('[data-index=' + dataIndex + ']');
					radioBox.prop('checked', false);
					if (settings.toggleContent) {
						radioBox.closest('li.radio-list').find('.radio-content-wrap').hide();
					}
					if (settings.toggleText) {
						var tarDom = radioBox.closest('li.radio-list');
						tarDom.find('.extra-text.checked').hide();
						tarDom.find('.extra-text.unchecked').show();
					}
				}
			}
		},

		setValue: function (value) {
			if (value === undefined) {
				value = '';
			}

			if (value === null) {
				if (this._defaultValue === undefined || this._defaultValue === null) {
					value = '';
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
			this.setStyle(value);
		},

		disableItem: function (valueArray) {
			var _this = this.dom();
			var viewObj = this;
			var radios = _this.find('input.radio-radio');

			if ($.type(valueArray) === 'string' || $.type(valueArray) === 'number') {
				valueArray = [valueArray];
			}

			var valueObj = (function () {
				var valueObj = {};
				for (var index = 0; index < valueArray.length; index++) {
					valueObj[valueArray[index]] = true;
				}
				return valueObj;
			})();

			radios.each(function (i, obj) {
				var index = $(obj).attr('data-index');
				if (viewObj.dataMap[index] in valueObj) {
					$(obj).closest('li.radio-list').addClass('disabled');
					$(obj).closest('label.radio-label').addClass('disabled');
					obj.disabled = true;
				}
			});
		},

		enableItem: function (valueArray) {
			var _this = this.dom();
			var viewObj = this;
			var radios = _this.find('input.radio-radio');

			if ($.type(valueArray) === 'string' || $.type(valueArray) === 'number') {
				valueArray = [valueArray];
			}

			var valueObj = (function () {
				var valueObj = {};
				for (var index = 0; index < valueArray.length; index++) {
					valueObj[valueArray[index]] = true;
				}
				return valueObj;
			})();

			radios.each(function (i, obj) {
				var index = $(obj).attr('data-index');
				if (viewObj.dataMap[index] in valueObj) {
					$(obj).closest('li.radio-list').removeClass('disabled');
					$(obj).closest('label.radio-label').removeClass('disabled');
					obj.disabled = false;
				}
			});
		},

		showItemContent: function (valueArray) {
			var _this = this.dom();
			var viewObj = this;
			var radios = _this.find('input.radio-radio');

			if ($.type(valueArray) === 'string' || $.type(valueArray) === 'number') {
				valueArray = [valueArray];
			}

			var valueObj = (function () {
				var valueObj = {};
				for (var index = 0; index < valueArray.length; index++) {
					valueObj[valueArray[index]] = true;
				}
				return valueObj;
			})();

			radios.each(function (i, obj) {
				var index = $(obj).attr('data-index');
				if (viewObj.dataMap[index] in valueObj) {
					$(obj).closest('li.radio-list').find('.radio-content-wrap').show();
				}
			});
		},

		hideItemContent: function (valueArray, hideItem) {
			var _this = this.dom();
			var viewObj = this;
			var radios = _this.find('input.radio-radio');

			if ($.type(valueArray) === 'string' || $.type(valueArray) === 'number') {
				valueArray = [valueArray];
			}

			var valueObj = (function () {
				var valueObj = {};
				for (var index = 0; index < valueArray.length; index++) {
					valueObj[valueArray[index]] = true;
				}
				return valueObj;
			})();

			radios.each(function (i, obj) {
				var index = $(obj).attr('data-index');
				if (viewObj.dataMap[index] in valueObj) {
					if (hideItem === true) {
						$(obj).closest('li.radio-list').hide();
					} else {
						$(obj).closest('li.radio-list').find('.radio-content-wrap').hide();
					}
				}
			});
		},

		disable: function () {
			var _this = this.dom();
			var container = this.getContainer();
			var radios = _this.find('input.radio-radio');

			container.addClass('disabled');

			radios.each(function (i, obj) {
				var tar = $(obj);
				tar.closest('li.radio-list').addClass('disabled');
				tar.closest('label.radio-label').addClass('disabled');
				tar.prop('disabled', true);
			});
			_this.triggerHandler('ev_view_disable');
			this.setStatus('disabled', true);
		},

		enable: function () {
			var _this = this.dom();
			var container = this.getContainer();
			var radios = _this.find('input.radio-radio');

			container.removeClass('disabled');

			radios.each(function (i, obj) {
				var tar = $(obj);
				tar.closest('li.radio-list').removeClass('disabled');
				tar.closest('label.radio-label').removeClass('disabled');
				tar.prop('disabled', false);
			});
			_this.triggerHandler('ev_view_enable');
			this.setStatus('disabled', false);
		},
		/**
		 * Get text of boxlabel by value
		 * @param {String, Number} value [value of radio]
		 * @return {String, Number}       [boxlabel by value]
		 */
		getBoxlabel: function (value) {
			var _this = this.dom();
			for (var dataIndex in this.dataMap) {
				if (this.dataMap.hasOwnProperty(dataIndex) && this.dataMap[dataIndex] === value) {
					return _this
						.find('input.radio-radio[data-index=' + dataIndex + ']')
						.siblings('span.text')
						.html();
				}
			}
			return '';
		},
		/**
		 * Set text of boxlabel by value
		 * @param {String, Number} value [value of radio]
		 * @param {String} text  [new boxlabel, text or html text]
		 */
		setBoxlabel: function (value, text) {
			if ($.type(value) !== 'number' && $.type(value) !== 'string') {
				return;
			}
			var _this = this.dom();
			var radioBox;
			for (var dataIndex in this.dataMap) {
				if (this.dataMap.hasOwnProperty(dataIndex) && this.dataMap[dataIndex] === value) {
					radioBox = _this.find('input.radio-radio[data-index=' + dataIndex + ']');
					radioBox.attr('data-text', text).siblings('span.text').html(text);
					return;
				}
			}
		}
	});
})();
