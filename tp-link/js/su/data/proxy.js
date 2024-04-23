(function ($) {
	$.su.define('Proxy', {
		// TODO: change to mixins
		extend: $.su.Observable,
		constructor: (function () {
			var Proxy = function (options) {
				$.su.Observable.call(this);
				this.initApi(options);
				var connection = this.connection || $.su.settings.AjaxProxy.defaultConnection;
				this.connection = $.type(connection) === 'string' ? $.su.createSync(connection) : connection;
				this.isProxy = true;
			};
			return Proxy;
		})(),
		inheritableDepsGatherer: function (option) {
			var connection = option.connection;
			var depsPromise = $.Deferred();
			if (connection && $.type(connection) === 'string') {
				$.su.require(connection).done(function () {
					depsPromise.resolve();
				});
			} else {
				depsPromise.resolve();
			}
			return depsPromise.promise();
		},

		connection: null,

		data: null,
		readFilter: null,
		writeFilter: null,
		successJudge: null,

		defaultOption: {},

		api: {},

		initApi: function (options) {
			var me = this;
			//options args is for the compatibility of old codes,
			//under SU Class Frame the 'options' should be set on the Class define option
			options = options || {};
			this.defaultOption = {
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

		sync: function () {},

		// model update/ store update/remove/add batched
		request: function (option) {
			this._decorateOption(option);
			this.connection.request(option);
		},
		abort: function () {
			this.connection.abort();
		},
		// @param {string} operation: api name to call
		// @param {object} options: for the compatibility of old codes,
		op: function (operation, options) {
			// this.connection.request(options);
			var defaultOption = this.api[operation] ? this.api[operation] : this.defaultOption;
			var optionTar = $.extend(true, {}, defaultOption, options);

			this.request(optionTar);
		},

		_decorateOption: function (option) {
			var me = this;
			if (option.writeFilter) {
				option.data = option.writeFilter.call(this, option.data);
			}
			var successCallback = !!option && option.success;
			var failCallback = !!option && option.fail;
			option.success = function (data, status, xhr) {
				var res = option.successJudge ? option.successJudge(data, status, xhr) : true;
				if (res === true) {
					var filteredData = option.readFilter ? option.readFilter.call(me, data) : data;
					!!successCallback && successCallback(filteredData, data, status, xhr);
				} else {
					var failData = option.failFilter ? option.failFilter.call(me, data) : data;
					!!failCallback && failCallback(failData, res, status, xhr);
				}
			};
		},

		read: function () {},
		write: function () {},
		create: function () {},
		update: function () {},
		remove: function () {}
	});
})(jQuery);
