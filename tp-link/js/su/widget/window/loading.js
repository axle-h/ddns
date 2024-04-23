(function () {
	var Loading = $.su.Widget.register('loading', {
		settings: {
			firstLoading: {
				attribute: 'first-loading',
				defaultValue: false
			}
		},
		init: function () {},
		render: function () {
			var _this = this.dom();
			var settings = this.settings;

			var inHTML;

			if (settings.firstLoading === false) {
				inHTML = '<div class="loading-container-wrap">';
				inHTML += '<div class="loading-container-inner">';
				inHTML += '<div class="loading-waiting-icon">';
				inHTML += '</div>';
				inHTML += '</div>';
				inHTML += '</div>';
			} else if (settings.firstLoading === true) {
				inHTML = '<div class="first-loading">';
				inHTML += '<div class="loading-spinner-icon"></div>';
				inHTML += '<div class="loading-text">' + $.su.SMB_CHAR.TIP.LOADING + '</div>';
				inHTML += '<br />';
				inHTML += '<div class="loading-text">' + $.su.SMB_CHAR.TIP.WEB_BROWSER + '</div>';
				inHTML += '</div>';
			}

			_this.addClass('loading-container').append(inHTML);
			this.useMap = {};
			this.hide();
		},
		show: function () {
			var _this = this.dom();

			this.getMask().show(this.domId);
			_this.show();
		},
		hide: function () {
			var _this = this.dom();

			this.getMask().hide(this.domId);
			_this.hide();
		}
	});
})();
