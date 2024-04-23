(function ($) {
	$.su.define('AjaxProxy', {
		extend: 'Proxy',
		//constructor: use default
		url: null,
		method: 'POST',
		ajax: null,
		initApi: function (options) {
			var me = this;
			//options args is for the compatibility of old codes,
			//under SU Class Frame the 'options' should be set on the Class define option
			options = options || {};
			this.defaultOption = {
				url: options.url || this.url,
				method: options.method || this.method,
				ajax: $.extend(true, {}, this.ajax, options.ajax),
				noneEncrypt: false,
				readFilter: options.readFilter || this.readFilter,
				writeFilter: options.writeFilter || this.writeFilter,
				failFilter: options.failFilter || this.failFilter,
				successJudge: options.successJudge || this.successJudge
			};
			this.defaultOption.ajax.url = this.url;
			this.defaultOption.ajax.data = this.data;

			var defaultOption = this.defaultOption;
			var api = (this.api = $.extend({}, this.api, options.api));
			for (var operation in api) {
				if (api.hasOwnProperty(operation)) {
					api[operation] = $.extend({}, defaultOption, api[operation]);
					if (!this[operation]) {
						this[operation] = (function (operation) {
							return function (options) {
								this.op(operation, options); //this
							};
						})(operation);
					}
				}
			}
		},
		upload: function (options) {
			var defaultOption = this.api['upload'] ? this.api['upload'] : this.defaultOption;
			var optionTar = $.extend({}, defaultOption, options);
			this._decorateOption(optionTar);
			this.connection.upload(optionTar);
		},
		download: function (file) {
			this.connection.download(file);
		}
	});

	return;
})(jQuery);
