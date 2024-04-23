/*
 * @description SU frame settings object
 * */
(function ($) {
	$.su.settings = {
		classManager: {
			loader: 'Loader'
		},
		Proxy: {
			defaultRoot: 'root'
		},
		Model: {
			defaultProxy: 'SPFProxy',
			depFields: ['proxy']
		},
		Store: {
			defaultProxy: 'DecoProxy',
			depFields: ['proxy']
		},
		AjaxService: {
			defaultProxy: 'DecoProxy'
		},
		Loader: {
			classesPath: './config/classes.json'
		}
	};
})(jQuery);
