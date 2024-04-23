/*
 * @description
 * @author XCH
 * @change
 *
 *
 * */
(function ($) {
	var portalPreview = $.su.Widget.register('portalPreview', {
		settings: {},

		listeners: [
			{
				selector: '.accept-checkbox span.text',
				event: 'click',
				callback: function (e, viewObj) {
					viewObj.dom().find('.portal-login-item-box').hide();
					viewObj.dom().find('.terms-of-use-item-box').show();
				}
			},
			{
				selector: '.terms-of-use-item-box span.icon',
				event: 'click',
				callback: function (e, viewObj) {
					viewObj.dom().find('.portal-login-item-box').show();
					viewObj.dom().find('.terms-of-use-item-box').hide();
				}
			}
		],

		init: function () {},

		render: function () {
			var me = this;
			var _this = me.dom();
			var settings = this.settings;

			_this.addClass('portal-preview-container');

			var innerHTML = '<div class="portal-preview-wrapper">';
			innerHTML += '<div class="portal-login-logo"><span></span></div>';
			innerHTML += '<div class="portal-login-title"><span></span></div>';
			innerHTML += '<div class="portal-login-item-box">';
			innerHTML += '<div widget="textbox" id="' + this.domId + '_textbox' + '" class="label-empty" hint="{GUEST_NETWORK.PASSWORD}"></div>';
			innerHTML +=
				'<div widget="button" id="' + this.domId + '_button' + '" class="login-button"text="{GUEST_NETWORK.LOG_IN}" label-field="{false}"></div>';
			innerHTML +=
				'<div widget="checkbox"  id="' +
				this.domId +
				'_checkbox' +
				'" class="accept-checkbox" box-label="{GUEST_NETWORK.TERMS_NOTE}" label-field="{false}"></div>';
			innerHTML += '</div>';
			innerHTML += '<div class="terms-of-use-item-box hidden">';
			innerHTML += '<div class="terms-of-use-title"><span></span></div>';
			innerHTML += '<pre class="terms-of-use-text"><span></span></pre>';
			innerHTML += '<span class="icon"></span>';
			innerHTML += '</div>';
			innerHTML += '</div>';

			_this.empty().append(innerHTML);

			me.password = new $.su.widgets.textbox({
				id: this.domId + '_textbox'
			});
			me.password.render();
			me.password.hide();

			me.button = new $.su.widgets.button({
				id: this.domId + '_button'
			});
			me.button.render();

			me.checkbox = new $.su.widgets.checkbox({
				id: this.domId + '_checkbox'
			});
			me.checkbox.render();

			_this.find('.terms-of-use-title').find('span').text($.su.CHAR.GUEST_NETWORK.TERMS_OF_USE);
		},

		setTitle: function (text) {
			var me = this;
			var _this = me.dom();

			_this.find('.portal-login-title').find('span').text(text);
		},

		setTermsOfUse: function (text) {
			var me = this;
			var _this = me.dom();

			_this.find('.terms-of-use-text').find('span').text(text);
		},

		showPassword: function () {
			var me = this;
			var _this = me.dom();

			me.password.show();
			_this.addClass('password');
		},

		hidePassword: function () {
			var me = this;
			var _this = me.dom();

			me.password.hide();
			_this.removeClass('password');
		},

		showCheckbox: function () {
			var me = this;
			var _this = me.dom();

			me.checkbox.show();
		},

		hideCheckbox: function () {
			var me = this;
			var _this = me.dom();

			me.checkbox.hide();
		},

		restoreDefault: function () {
			var me = this;
			var _this = me.dom();

			_this.find('.portal-login-logo').find('span').css({
				background: 'url("./themes/default/img/portal_logo.png") no-repeat center',
				'background-size': 'contain'
			});
			_this.css({
				background: 'url("./themes/default/img/portal_back.png") no-repeat center',
				'background-size': 'contain'
			});
		},

		changeLogo: function (pic) {
			var me = this;
			var _this = me.dom();

			if ($.su.isIe9()) {
				_this
					.find('.portal-login-logo')
					.find('span')
					.css({
						filter: "progid:DXImageTransform.Microsoft.AlphaImageLoader(enabled='true',sizingMethod='scale',src=\"" + pic + '")'
					});
			} else {
				_this
					.find('.portal-login-logo')
					.find('span')
					.css({
						background: 'url("' + pic + '") no-repeat center',
						'background-size': 'contain'
					});
			}
		},

		changeBackground: function (pic) {
			var me = this;
			var _this = me.dom();

			if ($.su.isIe9()) {
				_this.css({
					filter: "progid:DXImageTransform.Microsoft.AlphaImageLoader(enabled='true',sizingMethod='scale',src=\"" + pic + '")'
				});
			} else {
				_this.css({
					background: 'url("' + pic + '") no-repeat center',
					'background-size': 'contain'
				});
			}
		},

		changeLogoFormServer: function (pic) {
			var me = this;
			var _this = me.dom();

			if ($.su.isIe9()) {
				_this
					.find('.portal-login-logo')
					.find('span')
					.css({
						filter:
							"progid:DXImageTransform.Microsoft.AlphaImageLoader(enabled='true',sizingMethod='scale',src=\"" +
							pic +
							'?t=' +
							new Date().getTime() +
							'")'
					});
				_this.find('.portal-login-logo').find('span').css({
					'background-image': 'url()'
				});
			} else {
				_this
					.find('.portal-login-logo')
					.find('span')
					.css({
						background: 'url("' + pic + '?t=' + new Date().getTime() + '") no-repeat center',
						'background-size': 'contain'
					});
			}
		},

		changeBackgroundFormServer: function (pic) {
			var me = this;
			var _this = me.dom();

			if ($.su.isIe9()) {
				_this.css({
					filter:
						"progid:DXImageTransform.Microsoft.AlphaImageLoader(enabled='true',sizingMethod='scale',src=\"" +
						pic +
						'?t=' +
						new Date().getTime() +
						'")'
				});
				_this.css({
					'background-image': 'url()'
				});
			} else {
				_this.css({
					background: 'url("' + pic + '?t=' + new Date().getTime() + '") no-repeat center',
					'background-size': 'contain'
				});
			}
		},

		changeTitleColor: function (color) {
			this.dom().find('.portal-login-title').find('span').css('color', color);
		},

		changeThemeColor: function (color) {
			this.dom().find('.login-button').find('a').css('background', color);
		}
	});
})(jQuery);
