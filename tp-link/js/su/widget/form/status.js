// JavaScript Document
(function ($) {
	var Status = $.su.Widget.register('status', {
		settings: {
			loadingText: {
				attribute: 'loading-text',
				defaultValue: ''
			},
			successText: {
				attribute: 'success-text',
				defaultValue: ''
			},
			failedText: {
				attribute: 'fail-text',
				defaultValue: ''
			},
			showText: {
				attribute: 'show-text',
				defaultValue: true
			}
		},

		render: function () {
			var settings = this.settings;
			var _this = this.dom();

			_this.addClass('status-container widget-container');

			var inHTML = '';

			if (settings.labelField !== null && settings.labelField !== 'false') {
				inHTML += '<div class="widget-fieldlabel-wrap ' + settings.labelCls + '">';
				inHTML += '<label class="widget-fieldlabel status-fieldlabel">' + settings.labelField + '</label>';
				if (settings.labelField) {
					inHTML += '<span class="widget-separator">' + settings.separator + '</span>';
				}
				inHTML += '</div>';
			}

			inHTML += '<div class="widget-wrap status-wrap">';
			inHTML += '<span class="icon"></span>';
			inHTML += '<span class="text"></span>';
			inHTML += '</div>';
			inHTML += '</div>';

			_this.append($(inHTML)).hide();

			if (!settings.showText) {
				container.find('span.text').css('display', 'none');
			}
			this.setNormal();
		},

		reset: function () {
			var _this = this.dom();
			_this.closest('div.status-container').removeClass('loading failed success normal');
			_this.find('div.status-wrap span.text').empty();
		},

		setNormal: function (text) {
			var _this = this.dom();

			this.reset();
			_this.addClass('normal');
			this.setText(text);
		},
		setSuccess: function (text) {
			var _this = this.dom();

			this.reset();
			_this.addClass('success');
			this.setText(text);
		},
		setFailed: function (text) {
			var _this = this.dom();

			this.reset();
			_this.addClass('failed');
			this.setText(text);
		},
		setLoading: function (text) {
			var _this = this.dom();

			this.reset();
			_this.addClass('loading');
			this.setText(text);
		},
		setText: function (text) {
			var _this = this.dom();
			_this.find('div.status-wrap span.text').empty().html(text);
		}
	});
})(jQuery);
