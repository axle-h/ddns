//@ sourceURL=modules/login/models.js

// 加密传输信息的 rsa 公钥和随机数 sequence number
$.su.define('authProxy', {
	extend: 'IPFProxy',
	url: $.su.url('/login?form=auth'),
	writeFilter: function (data) {
		return $.extend(
			{
				operation: 'read'
			},
			data
		);
	}
});

// 加密登录信息的 rsa 公钥
$.su.define('keyProxy', {
	extend: 'IPFProxy',
	url: $.su.url('/login?form=keys'),
	writeFilter: function (data) {
		return $.extend(
			{
				operation: 'read'
			},
			data
		);
	}
});

$.su.define('firstTimeProxy', {
	extend: 'IPFProxy',
	url: $.su.url('/login?form=check_factory_default')
});

$.su.define('ipConflictProxy', {
	extend: 'IPFProxy',
	url: $.su.url('/domain_login?form=dlogin')
});

$.su.modelManager.define('firmwareModel', {
	type: 'model',
	fields: [
		{
			name: 'hardwareVersion',
			mapping: 'hardware_version'
		},
		{
			name: 'firmwareVersion',
			mapping: 'firmware_version'
		}
	],
	preventFailEvent: true,
	preventErrorEvent: true,
	proxy: {
		url: $.su.url('/login?form=get_firmware_info')
	}
});

$.su.modelManager.define('loginLanguage', {
	type: 'model',
	fields: [
		{
			name: 'language'
		}
	],
	proxy: {
		url: null
	}
});

$.su.storeManager.define('loginLanguageStore', {
	fields: [
		{
			name: 'name'
		},
		{
			name: 'value'
		}
	],
	convert: function (data) {
		for (var i = 0; i < data.length; i++) {
			data[i].name = $.su.CHAR.LANGUAGE[data[i].name];
		}
		return data;
	},
	proxy: {
		url: $.su.url('/locale?form=list'),
		api: {
			load: {
				writeFilter: function (data) {
					return {
						operation: 'read'
					};
				}
			}
		}
	}
});

