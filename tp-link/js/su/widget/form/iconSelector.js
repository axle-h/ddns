(function () {
	var iconSelector = $.su.Widget.register('iconSelector', {
		settings: {
			name: {
				attribute: 'name',
				defaultValue: ''
			},
			lines: {
				attribute: 'lines',
				defaultValue: 1
			}
		},

		listeners: [
			{
				selector: '.icon-selector-radio-label',
				event: 'click',
				callback: function (e, viewObj) {
					e.preventDefault();
					e.stopPropagation();

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

			_this.addClass(settings.cls + 'icon-selector-container ' + labelField);

			var template = '<div class="widget-wrap-outer icon-selector-wrap-outer">\
			<div class="icon-selector-wrap"></div>\
			</div>';

			if (settings.labelField !== null && settings.labelField !== 'false') {
				var labelTemplate =
					'<div class="widget-fieldlabel-wrap %CLS%">\
				<div class="widget-fieldlabel-inner">\
				<label class="widget-fieldlabel icon-selector-fieldlabel">%FIELD%</label>\
				%SEPARATOR%\
				</div></div>';
				labelTemplate = labelTemplate
					.replace(/\%CLS\%/g, settings.labelCls)
					.replace(/\%FIELD\%/, settings.labelField)
					.replace(/\%SEPARATOR\%/, settings.labelField ? '<span class="widget-separator">' + settings.separator + '</span>' : '');
				template = labelTemplate + template;
			}
			_this.append(template);

			if (settings.items && settings.items.length > 0) {
				this.loadItems(settings.items);
			}
		},

		loadItems: function (items) {
			var _this = this.dom();
			var settings = this.settings;
			var perLineNum = settings.lines;
			var index;
			var _numFlag = 0;

			settings.items = items;
			settings.name = items[0].name;

			var inHTML = '<ul class="icon-selector-list-wrap">';

			var funcInitLi = function (boxName, boxIndex, boxId, boxIcon) {
				inHTML += '<li class="radio-list">';
				inHTML += '<label class="icon-selector-radio-label" for="' + boxId + '">';
				inHTML += '<input type="radio" name="' + boxName + '" data-index="' + boxIndex + '" id="' + boxId + '" ' + checked + '>';
				inHTML += '<div class="icon-selector-icon-box"><div class="icon-selector-icon ' + boxIcon + '"></div></div>';
				inHTML += '</label>';
				inHTML += '</div>';
				inHTML += '<div class="radio-content-wrap hidden"></div>';
				inHTML += '</li>';
			};

			for (index = 0; index < items.length; index++) {
				var item = items[index];
				var boxName = settings.name ? settings.name : items[0].value;
				var boxValue = item.value == undefined ? '' : item.value;
				var boxId = item.id || $.su.randomId('radio');
				var checked = '';
				var checkedCls = '';
				this.dataMap[index] = boxValue;

				if (item.checked === 'checked' || item.checked === true) {
					checked = 'checked="checked"';
					checkedCls = 'checked';
					this._defaultValue = boxValue;
				}

				if (_numFlag < perLineNum) {
					funcInitLi(boxName, index, boxId, item.icon);
				} else {
					inHTML += '</ul>';
					inHTML += '<ul class="icon-selector-list-wrap">';
					funcInitLi(boxName, index, boxId, item.icon);
					_numFlag = 0;
				}
				_numFlag++;
			}

			inHTML += '</ul>';

			var container = this.getContainer();
			var wrap = container.find('div.icon-selector-wrap').empty();

			wrap.append(inHTML);

			_this.triggerHandler('ev_view_update');
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
			var radioBoxs = _this.find('input').removeAttr('checked');
			_this.find('label.icon-selector-radio-label').removeClass('checked');

			for (var dataIndex in this.dataMap) {
				if (this.dataMap.hasOwnProperty(dataIndex) && this.dataMap[dataIndex] === value) {
					radioBox = radioBoxs.filter('[data-index=' + dataIndex + ']');
					radioBox.prop('checked', true);
					radioBox.closest('label.icon-selector-radio-label').addClass('checked');
				} else {
					radioBox = radioBoxs.filter('[data-index=' + dataIndex + ']');
					radioBox.prop('checked', false);
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
		}
	});
})();
