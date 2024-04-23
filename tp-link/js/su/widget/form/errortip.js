(function () {
	var Errortip = $.su.Widget.register('errortip', {
		settings: {
			errorCls: {
				attribute: 'error-cls',
				defaultValue: ''
			}
		},
		listeners: [
			{
				selector: 'span.widget-error-tips-delta',
				event: 'mouseenter',
				callback: function (e, viewObj) {
					viewObj.dom().find('div.widget-error-tips-wrap').addClass('hover');
					viewObj.animate();
				}
			},
			{
				selector: 'span.widget-error-tips-delta',
				event: 'mouseleave',
				callback: function (e, viewObj) {
					viewObj.dom().find('div.widget-error-tips-wrap').removeClass('hover');
				}
			}
		],
		init: function (options) {
			var _this = this.dom();

			switch (options.type) {
				case 'errortip':
				case 'fieldset':
				case 'form':
				case 'msg':
					return false;
					break;

				case 'textbox':
				case 'password':
					_this.addClass('textbox-error-tips');
					break;

				case 'button':
				case 'checkbox':
				case 'combobox':
				case 'displaylabel':
				case 'radio':
					_this.addClass(options.type + '-error-tips');
					break;
			}
		},
		render: function () {
			var _this = this.dom();
			var settings = this.settings;

			var inHTML = '<span class="widget-error-tips-delta"></span>';
			inHTML += '<div class="widget-error-tips-wrap">';
			inHTML += '<span class="widget-error-tips-delta"></span>';
			inHTML += '<div class="content error-tips-content"></div>';
			inHTML += '</div>';

			_this.append(inHTML);

			_this.addClass(settings.errorCls + ' widget-error-tips');
		},

		show: function (tips) {
			this.animate(tips);
		},
		showHtml: function (tips) {
			this.animate(tips, true);
		},
		animate: function (tips, loadTipsAsHtml) {
			var _this = this.dom();
			var content = _this.find('div.error-tips-content');
			if ($.type(tips) === 'string') {
				if (loadTipsAsHtml) {
					content.html(tips);
				} else {
					content.text(tips);
				}
			}
			_this.addClass('show');
			_this.fadeIn(150);
		},
		hide: function () {
			this.dom().removeClass('show').stop(true).hide();
		}
	});
})();
