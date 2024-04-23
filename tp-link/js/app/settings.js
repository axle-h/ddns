(function () {
	var extendSettings = {
		classManager: {
			loader: 'Loader'
		},
		Proxy: {
			defaultRoot: 'root'
		},
		Model: {
			defaultProxy: 'IPFProxy',
			depFields: ['proxy']
		},
		Store: {
			defaultProxy: 'IPFProxy',
			depFields: ['proxy']
		},
		AjaxService: {
			defaultProxy: 'IPFProxy'
		},
		AjaxProxy: {
			defaultConnection: 'Connection'
		}
	};

	$.extend($.su.settings, extendSettings);
})(jQuery);
