//@ sourceURL=modules/login/localLogin/models.js

$.su.define('loginProxy', {
	extend: 'IPFProxy',
	url: $.su.url('/login?form=login'),
	api: {
		login: {
			writeFilter: function (data) {
				data.operation = 'login';
				return data;
			},
			isLogin: true
		}
	}
});

$.su.modelManager.define('localLogin', {
	type: 'model',
	fields: [
		{
			name: 'password'
		},
		{
			name: 'stok',
			disabled: true
		}
	],
	proxy: 'loginProxy',
	methods: {
		login: function (options) {
			var me = this;
			var formData = this.getData('submit');
			options.data = $.extend({}, options.data, formData);
			this.getProxy().login(options);
		}
	}
});

$.su.modelManager.define('localLoginControl', {
	type: 'model',
	fields: [
		{
			name: 'password',
			vtype: {
				vtype: 'ascii_visible'
			},
			maxLength: 32,
			minLength: 1,
			allowBlank: false
		}
	]
});

$.su.define('loginCheckInternetProxy', {
	extend: 'IPFProxy',
	preventFailEvent: true,
	url: $.su.url('/login?form=check_internet')
});

$.su.define('forgetPasswordProxy', {
	extend: 'IPFProxy',
	url: $.su.url('/login?form=password'),
	writeFilter: function (data) {
		return $.extend(
			{
				operation: 'read'
			},
			data
		);
	}
});
$.su.define('sendCodeProxy', {
	extend: 'IPFProxy',
	url: $.su.url('/login?form=vercode')
});

$.su.modelManager.define('vercodeModel', {
	type: 'model',
	preventFailEvent: true,
	fields: [
		{
			name: 'vercode',
			serialize: function (data) {
				return $.trim(data);
			}
		}
	],
	proxy: 'sendCodeProxy'
});
$.su.modelManager.define('resetPwdModel', {
	type: 'model',
	fields: [
		{
			name: 'password',
			vtype: {
				vtype: 'ascii_visible||string_no_spaces||symbols_combined_pws'
			},
			maxLength: 32,
			minLength: 6,
			allowBlank: false
		},
		{
			name: 'confirm',
			allowBlank: false
		}
	]
});
