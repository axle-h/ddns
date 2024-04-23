(function () {
	var Checkbox = $.su.Widget.register('checkbox', {
		settings: {
			name: {
				attribute: 'name',
				defaultValue: ''
			},
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
			},
			boxLabel: {
				attribute: 'box-label',
				defaultValue: ''
			},
			actionCls: {
				attribute: 'action-cls',
				defaultValue: ''
			}
		},

		listeners: [
			{
				selector: '.checkbox-label',
				event: 'click',
				callback: function (e, viewObj) {
					e.preventDefault();
					// e.stopPropagation();

					var node = $(this);
					var settings = viewObj.settings;
					var name = node.find('input[type=checkbox]').attr('name');
					var value = node.find('input[type=checkbox]').prop('checked');
					var val = viewObj.getValue();

					if (node.hasClass('disabled')) {
						return;
					}

					val = val === settings.trueValue ? settings.falseValue : settings.trueValue;
					viewObj.dom().triggerHandler('ev_view_change', [
						{
							type: 'value',
							value: val
						}
					]);
					viewObj.setStatus('checked', val === settings.trueValue);
				}
			},
			{
				selector: '.checkbox-label a[href]',
				event: 'click',
				callback: function (e) {
					e.stopPropagation();
				}
			}
		],

		init: function () {
			this._status.disabled = false;
			this._status.checked = false;
		},

		render: function () {
			var _this = this.dom();
			var settings = this.settings;
			var labelField = settings.labelField === false ? 'label-empty' : '';
			var boxId = this.domId + '-checkbox-' + parseInt(Math.random() * 1000 * 1000 * 1000, 10).toString();

			_this.addClass(settings.cls + 'checkbox-container ' + labelField);

			var inHTML = '';

			if (settings.labelField !== null) {
				inHTML += '<div class="widget-fieldlabel-wrap ' + settings.labelCls + '">';
				inHTML += '<div class="widget-fieldlabel-inner">';
				inHTML += '<label class="widget-fieldlabel checkbox-group-label">' + settings.labelField + '</label>';
				if (settings.labelField) {
					inHTML += '<span class="widget-separator">' + settings.separator + '</span>';
				}
				inHTML += '</div>';
				inHTML += '</div>';
			}

			inHTML += '<div class="widget-wrap-outer checkbox-group-wrap-outer">';
			inHTML += '<div class="checkbox-group-wrap">';

			inHTML += '<ul>';
			inHTML += '<li class="checkbox-list">';
			inHTML += '<div class="widget-wrap">';
			inHTML += '<label class="checkbox-label ' + '" for="' + boxId + '">';
			inHTML += '<input class="checkbox-checkbox" type="checkbox" id="' + boxId + '" />';
			inHTML += '<span class="icon"></span>';
			inHTML += '<span class="text">' + settings.boxLabel + '</span>';
			inHTML += '</label>';
			inHTML += '</div>';
			inHTML += '</li>';
			inHTML += '</ul>';

			inHTML += '</div>';

			if (settings.tips != null && settings.tips != undefined) {
				inHTML += '<div class="widget-tips textbox-tips ' + settings.tipsCls + '">';
				inHTML += '<div class="widget-tips-wrap">';
				inHTML += '<div class="content tips-content">' + settings.tips + '</div>';
				inHTML += '</div>';
				inHTML += '</div>';
			}

			inHTML += '<div widget="errortip" error-cls="' + settings.errorTipsCls + '">';
			inHTML += '</div>';

			inHTML += '</div>';

			if (settings.tipText) {
				inHTML += '<div widget="toolTip"></div>';
				_this.addClass('has-tool-tip');
			}

			if (settings.actionCls) {
				inHTML += '<div class="checkbox-action-container">';
				inHTML += '<span class="icon ' + settings.actionCls + '"></span>';
				inHTML += '</div>';
			}

			_this.append(inHTML);
		},

		setValue: function (value) {
			var _this = this.dom();
			var viewObj = this;
			var settings = this.settings;
			var checkBox = _this.find('input[type=checkbox]');

			var setChecked = function (checkBox, value) {
				if (value === settings.trueValue || value === true || value === 1) {
					checkBox.closest('label.checkbox-label').addClass('checked');
					checkBox.prop('checked', true);
					viewObj.setStatus('checked', true);
				} else if (value === settings.falseValue || value === false || value === 0) {
					checkBox.closest('label.checkbox-label').removeClass('checked');
					checkBox.prop('checked', false);
					viewObj.setStatus('checked', false);
				}
			};

			setChecked(checkBox.eq(0), value);
		},

		getValue: function () {
			var _this = this.dom();
			var settings = this.settings;
			var checkBox = _this.find('input[type=checkbox]');

			return checkBox.eq(0).prop('checked') ? settings.trueValue : settings.falseValue;
		},

		disable: function (visually) {
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
			if (!visually) {
				_this.triggerHandler('ev_view_disable');
				this.setStatus('disabled', true);
			}
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

		showActionIcon: function () {
			var _this = this.dom();
			_this.find('.checkbox-action-container').show();
		},

		hideActionIcon: function () {
			var _this = this.dom();
			_this.find('.checkbox-action-container').hide();
		}
	});
})();
