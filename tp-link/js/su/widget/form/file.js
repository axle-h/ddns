(function () {
	var File = $.su.Widget.register('file', {
		settings: {
			inputOuterCls: {
				attribute: 'input-outer-cls',
				defaultValue: ''
			},
			inputCls: {
				attribute: 'input-cls',
				defaultValue: 'l'
			},
			buttonCls: {
				attribute: 'button-cls',
				defaultValue: 'inline-block'
			},
			buttonText: {
				attribute: 'button-text',
				defaultValue: $.su.CHAR.OPERATION.FILEBUTTONTEXT
			},
			blankText: {
				attribute: 'blank-text',
				defaultValue: $.su.CHAR.OPERATION.FILEBLANKTEXT
			},
			extension: {
				attribute: 'extension',
				defaultValue: 'txt, ai, docx'
			},
			extensionErrorText: {
				attribute: 'extension-error-text',
				defaultValue: $.su.CHAR.ERROR['00000074']
			},
			tipText: {
				attribute: 'tip-text',
				defaultValue: ''
			},
			paramName: {
				attribute: 'param-name',
				defaultValue: 'file'
			},
			note: {
				attribute: 'note',
				defaultValue: ''
			},
			errorPosition: {
				attribute: 'error-position',
				defaultValue: 'middle'
			}
		},
		listeners: [
			{
				selector: 'div.file-button',
				event: 'click',
				callback: function (e, viewObj) {
					var container = viewObj.getContainer();
					e.preventDefault();
					e.stopPropagation();
					var defaultEvent = $.su.getDefaultEvent(viewObj, function () {
						container.find('input.file-input').click();
					});
					viewObj.dom().triggerHandler('ev_before_open', [defaultEvent.ev]);
					defaultEvent.exe();
				}
			},
			{
				selector: 'label.file-text',
				event: 'click',
				callback: function (e, viewObj) {
					var container = viewObj.getContainer();
					e.preventDefault();
					e.stopPropagation();

					if (!container.hasClass('disabled')) {
						container.find('div.file-button').click();
					}
				}
			},
			{
				selector: function () {
					return {
						parent: this.dom().find('input.file-input')
					};
				},
				event: 'change',
				callback: function (e, viewObj) {
					var container = viewObj.getContainer();
					var tar = $(this);
					var value = tar.val();

					var p = /.+(?=\\)/g;
					var v = value.toString().match(p);
					if (v && v[0] && v[0].length) {
						v = value.substring(v[0].length + 1);
					} else {
						v = value;
					}

					container.find('label.file-text').html(v);
					container.find('label.file-text').attr('title', v);

					viewObj.dom().triggerHandler('ev_file_change', [v]);
				}
			}
		],
		init: function () {},
		render: function () {
			var _this = this.dom();
			var settings = this.settings;

			_this.addClass(settings.cls + 'text-container file-container');

			var inHTML = '';

			if (settings.labelField !== null) {
				inHTML += '<div class="widget-fieldlabel-wrap ' + settings.labelCls + '">';
				inHTML += '<div class="widget-fieldlabel-inner">';
				inHTML += '<label class="widget-fieldlabel text-fieldlabel">' + settings.labelField + '</label>';
				if (settings.labelField !== '') {
					inHTML += '<span class="widget-separator">' + settings.separator + '</span>';
				}
				inHTML += '</div>';
				inHTML += '</div>';
			}
			inHTML += '<div class="file-wrap-outer widget-wrap-outer">';
			inHTML += '<div class="file-wrap widget-wrap ' + settings.inputOuterCls + '">';
			inHTML += '<div class="widget-wrap text-wrap">';
			inHTML += '<span class="text-wrap-before"></span>';
			inHTML += '<span class="text-wrap-inner">';
			inHTML += '<label class="file-text text-text ' + settings.inputCls + '"></label>';
			inHTML += '</span>';
			inHTML += '<span class="text-wrap-after"></span>';
			inHTML += '</div>';
			if (settings.note) {
				inHTML += '<div class="note"><span class="file-note">' + settings.note + '</span></div>';
			}
			inHTML += '</div>';

			if (settings.errorPosition == 'middle') {
				inHTML += '<div widget="errortip" error-cls="' + settings.errorTipsCls + '">';
				inHTML += '</div>';
				inHTML += '<div class="button-container file-button-container ' + settings.buttonCls + '">';
				inHTML += '<div widget="button" id="' + this.domId + '-btn" class="file-button" type="button" text="' + settings.buttonText + '"></div>';
				inHTML += '</div>';
			} else {
				inHTML += '<div class="button-container file-button-container ' + settings.buttonCls + '">';
				inHTML += '<div widget="button" id="' + this.domId + '-btn" class="file-button" type="button" text="' + settings.buttonText + '"></div>';
				inHTML += '</div>';
				inHTML += '<div widget="errortip" error-cls="' + settings.errorTipsCls + '">';
				inHTML += '</div>';
			}
			if (settings.tips) {
				inHTML += '<div class="widget-tips textbox-tips ' + settings.tipsCls + '">';
				inHTML += '<div class="content tips-content">' + settings.tips + '</div>';
				inHTML += '</div>';
			}

			inHTML += '</div>';
			if (settings.tipText) {
				inHTML += '<div widget="toolTip"></div>';
			}

			_this.append(inHTML);

			var acceptType = settings.extension.replace(/\b\w+\b/g, function (ext) {
				return '.' + ext;
			});

			var container = this.getContainer();
			var form =
				'<form method="post" id="' +
				this.domId +
				'_form" class="hidden" name="form" enctype="multipart/form-data">' +
				'<input type="file" accept= "' +
				acceptType +
				'" name="' +
				settings.paramName +
				'" class="file-input">' +
				'</form>';
			container.find('div.file-wrap').append($(form).prop('single', true));
			container.find('div.file-wrap').append('<div class="file-text-hover"></div>');

			// _this.find('div[widget=button]').each(function() {
			// 	var btn = $(this);
			// 	(new $.su.widgets.button({id: btn})).render();
			// });

			var btn = _this.find('div[widget=button]')[0];
			this.btn = new $.su.widgets.button({ id: $(btn) });
			this.btn.render();

			this.setTips(settings.tips);
		},
		getFile: function () {
			var _this = this.dom();
			var input = _this.find('input.file-input');
			return input[0];
		},
		getFileName: function () {
			var _this = this.dom();
			var input = _this.find('input.file-input');
			return input.val() === undefined ? '' : input.val();
		},
		getFileSize: function () {
			var _this = this.dom();
			var input = _this.find('input.file-input');
			var size = Math.round((input[0].files[0].size / 1024) * 100) / 100;
			return size;
		},
		startUpload: function () {
			var _this = this.dom();

			_this.addClass('disabled');
			this.btn.loading(true);
		},
		endUpload: function () {
			var _this = this.dom();

			_this.removeClass('disabled');
			this.btn.loading(false);
		},
		resetFile: function () {
			var _this = this.dom();
			var input = _this.find('input.file-input');
			var label = _this.find('label.file-text');
			input.val('');
			label.html('');
		},
		getFileValue: function () {
			var _this = this.dom();
			var input = _this.find('input.file-input');
			return input.val();
		},
		setFileText: function (value) {
			var p = /.+(?=\\)/g;
			var v = value.toString().match(p);
			if (v && v[0] && v[0].length) {
				v = value.substring(v[0].length + 1);
			} else {
				v = value;
			}
			var _this = this.dom();
			_this.find('label.file-text').html(v);
			_this.find('label.file-text').attr('title', v);
		},
		setFileNote: function (note) {
			var _this = this.dom();
			_this.find('span.file-note').html(note);
		}
	});
})();
