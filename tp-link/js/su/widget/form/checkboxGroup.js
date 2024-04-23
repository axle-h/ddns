(function () {
	var CheckboxGroup = $.su.Widget.register('checkboxGroup', {
		settings: {
			trueValue: {
				attribute: 'true-value',
				defaultValue: true
			},
			falseValue: {
				attribute: 'false-value',
				defaultValue: false
			},
			columns: {
				attribute: 'columns',
				defaultValue: 1
			},
			tipText: {
				attribute: 'tip-text',
				defaultValue: ''
			}
		},

		listeners: [
			{
				selector: '.checkbox-label',
				event: 'click',
				callback: function (e, viewObj) {
					e.preventDefault();
					e.stopPropagation();

					var node = $(this);
					var settings = viewObj.settings;
					var name = node.find('input[type=checkbox]').attr('name');
					var value = node.find('input[type=checkbox]').prop('checked');
					var vals = viewObj.getValue();

					if (node.hasClass('disabled')) {
						return;
					}

					if ($.type(vals) == 'object' && vals[name] !== undefined) {
						vals[name] = vals[name] === settings.trueValue ? settings.falseValue : settings.trueValue;
					} else {
						vals = vals === settings.trueValue ? settings.falseValue : settings.trueValue;
					}

					viewObj.dom().triggerHandler('ev_view_change', [
						{
							type: 'value',
							value: vals
						}
					]);
				}
			}
		],

		init: function () {
			this._status.disabled = false;
		},

		render: function () {
			var _this = this.dom();
			var settings = this.settings;

			_this.addClass(settings.cls + 'checkbox-group-container');

			var inHTML = '';

			if (settings.labelField !== null) {
				inHTML += '<div class="widget-fieldlabel-wrap ' + settings.labelCls + '">';
				inHTML += '<div class="widget-fieldlabel-inner">';
				inHTML += '<label class="widget-fieldlabel checkbox-group-label">' + settings.labelField + '</label>';
				if (settings.labelField !== '') {
					inHTML += '<span class="widget-separator">' + settings.separator + '</span>';
				}
				inHTML += '</div>';
				inHTML += '</div>';
			}

			inHTML += '<div class="widget-wrap-outer checkbox-group-wrap-outer">';
			inHTML += '<div class="checkbox-group-wrap">';
			inHTML += '</div>';

			if (settings.tips != null && settings.tips != undefined) {
				inHTML += '<div class="widget-tips textbox-tips ' + settings.tipsCls + '">';
				inHTML += '<div class="widget-tips-wrap">';
				inHTML += '<div class="content tips-content"></div>';
				inHTML += '</div>';
				inHTML += '</div>';
			}

			inHTML += '<div widget="errortip" error-cls="' + settings.errorTipsCls + '">';
			inHTML += '</div>';

			inHTML += '</div>';

			if (settings.tipText) {
				inHTML += '<div widget="toolTip"></div>';
			}

			_this.append(inHTML);

			if (settings.items && settings.items.length > 0) {
				this.loadItems(settings.items);
			}
		},

		loadItems: function (items) {
			var _this = this.dom();
			var settings = this.settings;
			var perColumnNum = Math.ceil(items.length / settings.columns);
			var _numFlag = 0;

			if (!$.isArray(items) && typeof items === 'object') {
				items = [items];
			}

			if (!$.isArray(items) || items.length < 0) {
				return;
			}

			settings.items = items;

			var inHTML = '<ul class="checkbox-group-list-wrap">';

			var funcInitLi = function (boxName, itemCls, boxValue, boxId, boxLabel) {
				inHTML += '<li class="checkbox-list">';
				inHTML += '<div class="widget-wrap">';
				inHTML += '<label class="checkbox-label ' + itemCls + ' ' + checkedCls + '" for="' + boxId + '">';
				inHTML += '<input class="hidden" type="hidden" name="' + boxName + '" data-checked="' + boxValue + '" ' + disabled + ' />';
				inHTML +=
					'<input class="checkbox-checkbox" type="checkbox" name="' +
					boxName +
					'" value="' +
					boxValue +
					'" data-checked="' +
					boxValue +
					'" data-index="' +
					index +
					'" id="' +
					boxId +
					'" ' +
					checked +
					' />';
				inHTML += '<span class="icon"></span>';
				inHTML += '<span class="text">' + boxLabel + '</span>';
				inHTML += '</label>';
				inHTML += '</div>';
				inHTML += '</li>';
			};

			for (var index = 0; index < items.length; index++) {
				var boxName = items[index].name || '';
				var boxValue = items[index].value || false;
				var itemCls = items[index].itemCls || '';
				if (index == 0) {
					itemCls += ' first';
				}
				if (index == items.length - 1) {
					itemCls += ' lst';
				}
				var boxId = items[index].id || 'checkbox-' + parseInt(Math.random() * 1000 * 1000 * 1000, 10).toString();

				var checked = '';
				var disabled = '';
				var checkedCls = '';
				if (items[index].checked === 'checked' || items[index].checked === true) {
					checked = 'checked="checked"';
					disabled = 'disabled="disabled"';
					checkedCls = 'checked';
				}

				if (_numFlag < perColumnNum) {
					funcInitLi(boxName, itemCls, boxValue, boxId, items[index].boxlabel || '');
				} else {
					inHTML += '</ul>';
					inHTML += '<ul class="checkbox-group-list-wrap">';
					funcInitLi(boxName, itemCls, boxValue, boxId, items[index].boxlabel || '');
					_numFlag = 0;
				}
				_numFlag++;
			}

			inHTML += '</ul>';

			var wrap = _this.find('div.checkbox-group-wrap').empty();

			wrap.append($(inHTML));
		},

		setValue: function (value) {
			var _this = this.dom();
			var settings = this.settings;
			var checkBox = _this.find('input[type=checkbox]');

			var setChecked = function (checkBox, value) {
				if (value === settings.trueValue) {
					checkBox.closest('label.checkbox-label').addClass('checked');
					checkBox.prop('checked', true);
				} else if (value === settings.falseValue) {
					checkBox.closest('label.checkbox-label').removeClass('checked');
					checkBox.prop('checked', false);
				}
			};

			//批量修改控件隐藏时会设置空值，此时将所有checkbox清空。
			//平时也可以用此方法清空选择。
			if (value === '') {
				checkBox.each(function (i, obj) {
					setChecked($(obj), settings.falseValue);
				});
				return;
			}

			if (checkBox.length === 1) {
				setChecked(checkBox.eq(0), value);
			} else if (checkBox.length > 1) {
				for (var name in value) {
					if (value.hasOwnProperty(name)) {
						var box = _this.find('input[type=checkbox][name="' + name + '"]');
						if (box.length !== 0) {
							setChecked(box.eq(0), value[name]);
						}
					}
				}
			}
		},

		getValue: function () {
			var _this = this.dom();
			var settings = this.settings;
			var result = {};
			var checkBox = _this.find('input[type=checkbox]');

			if (checkBox.length === 1) {
				return checkBox.eq(0).prop('checked') ? settings.trueValue : settings.falseValue;
			} else if (checkBox.length > 1) {
				checkBox.each(function (i, obj) {
					var name = $(obj).attr('name');
					result[name] = $(obj).prop('checked') ? settings.trueValue : settings.falseValue;
				});
				return result;
			}
			return false;
		},

		disable: function () {
			var _this = this.dom();
			var checkboxs = _this.find('input.checkbox-checkbox');

			this.getContainer().addClass('disabled');

			checkboxs.each(function (i, obj) {
				var tar = $(obj);
				tar.closest('li.checkbox-list').addClass('disabled');
				tar.closest('label.checkbox-label').addClass('disabled');
				tar.prev('input[type=hidden]').prop('disabled', true);
				tar.prop('disabled', true);
			});
			_this.triggerHandler('ev_view_disable');
			this.setStatus('disabled', true);
		},

		enable: function () {
			var _this = this.dom();
			var checkboxs = _this.find('input.checkbox-checkbox');

			this.getContainer().removeClass('disabled');

			checkboxs.each(function (i, obj) {
				var tar = $(obj);
				tar.closest('li.checkbox-list').removeClass('disabled');
				tar.closest('label.checkbox-label').removeClass('disabled');
				tar.prev('input[type=hidden]').prop('disabled', false);
				tar.prop('disabled', false);
			});
			_this.triggerHandler('ev_view_enable');
			this.setStatus('disabled', false);
		},

		disableItem: function (index) {
			var _this = this.dom();
			var checkboxs = _this.find('input.checkbox-checkbox');

			checkboxs.each(function (i, obj) {
				var tar = $(obj);
				if (i === index) {
					tar.closest('li.checkbox-list').addClass('disabled');
					tar.closest('label.checkbox-label').addClass('disabled');
					tar.prev('input[type=hidden]').prop('disabled', true);
					tar.prop('disabled', true);
				}
			});
		},

		enableItem: function (index) {
			var _this = this.dom();
			var checkboxs = _this.find('input.checkbox-checkbox');

			checkboxs.each(function (i, obj) {
				var tar = $(obj);
				if (i === index) {
					tar.closest('li.checkbox-list').removeClass('disabled');
					tar.closest('label.checkbox-label').removeClass('disabled');
					tar.prev('input[type=hidden]').prop('disabled', false);
					tar.prop('disabled', false);
				}
			});
		}
	});
})();
