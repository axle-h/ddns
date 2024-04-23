/**
 * Created by hwl on 2015/10/22.
 *
 * 2018/03/13 proxy can be configed whit a proxy sub class name
 * Model class keep unchanged when import SUClass, because its  sync define and use has been
 *   a widely base of the SU frame
 */
(function ($) {
	$.su = $.su || {};

	/*================================================
	 * code for Model
	 *================================================*/
	$.su.Model = (function () {
		/*
		 * Frame provide all args possiblely used;
		 * Specific project deal the args to the correct format
		 * */

		var Model = function (options) {
			/*deep extend for proxy*/
			options = $.extend(
				true,
				{
					fields: null,
					feedback: true,
					validator: null,
					autoReload: false,
					convert: null, //将从proxy得到的数据进行转化
					serialize: null, //提交数据前将model的数据进行转化
					preventSuccessEvent: false,
					preventFailEvent: false,
					preventErrorEvent: false,
					params: {
						read: {},
						update: {},
						create: {},
						remove: {}
					},
					methods: {}
				},
				options
			);
			var me = this;
			this.name = options.name;
			this._name = options.name;
			this.feedback = options.feedback;
			this.fields = options.fields;
			this.validator = options.validator;
			this.data = [];
			this.convert = options.convert;
			this.serialize = options.serialize;
			this.params = options.params;

			this.methods = options.methods;

			this.autoReload = options.autoReload;
			this.preventSuccessEvent = options.preventSuccessEvent;
			this.preventFailEvent = options.preventFailEvent;
			this.preventErrorEvent = options.preventErrorEvent;

			$.su.Observable.call(this);

			/*create a proxy from options.proxy*/
			if (options.proxy) {
				var manager = $.su.ClassManager.getInstance();
				if ($.type(options.proxy) === 'string') {
					var proxyClass = manager.get(options.proxy);
					if (!proxyClass) {
						$.su.debug.error('Model proxy class not found: ' + options.proxy);
					}
					this.proxy = proxyClass.create();
				} else if (!options.proxy.isProxy) {
					var proxyOpt = $.extend(
						true,
						{
							triggerEvent: true
						},
						options.proxy
					);
					this.proxy = manager.get($.su.settings.Model.defaultProxy).create(proxyOpt);
				} else {
					this.proxy = options.proxy;
				}

				this.proxy.addListener('ev_load', function (e, data) {
					me.loadData(data, true);
				});
			}

			_init.call(this);
		};

		$.su.inherit($.su.Observable, Model);

		var _initField = function (fieldInfo) {
			var newField = new $.su.DataField(fieldInfo);
			var model = this;
			if (newField.validator) {
				var tmp = newField.validator;
				newField.validator = function () {
					var scope = this;
					var args = Array.prototype.slice.call(arguments, 0);
					args.push(model);
					return tmp.apply(scope, args);
				};
			}
			return newField;
		};

		var _init = function () {
			var me = this;
			for (var i = 0, len = this.fields.length; i < len; i++) {
				/*upgrade the field as a DataField.*/
				// this.fields[i] = new $.su.Model.DataField(this.fields[i]);
				this.data[i] = _initField.call(this, this.fields[i]);
				this[this.fields[i].name] = this.data[i];
				this.data[i].on('ev_data_change', function (e, msg, dataField) {
					if (msg.type === '_value') {
						//event need to be redesigned
						me.trigger('ev_data_change', [msg, dataField, me]);
					}
				});
				this.data[i].on('ev_data_record', function (e, msg, dataField) {
					me.trigger('ev_data_record', [msg, dataField, me]);
				});
			}

			for (var method in me.methods) {
				if (me.methods.hasOwnProperty(method)) {
					me[method] = (function (method) {
						return function () {
							me.methods[method].apply(me, arguments);
						};
					})(method);
				}
			}
		};

		/*
		 * check if proxy option is a class name, and need to be import async by SUClass system
		 *
		 * */
		Model.checkProxyDep = function (proxy) {
			return $.type(proxy) == 'string';
		};

		Model.importProxyDep = function (name, callback) {
			return $.su.require(name, callback);
		};

		Model.prototype.modelConvert = function (data) {
			var formatData = {};
			if (!data) {
				data = {};
			}
			if (this.convert !== null) {
				data = this.convert(data);
			}

			for (var i = 0, len = this.data.length; i < len; i++) {
				var field = this.data[i];
				if (field.mapping) {
					// mapping => convert
					var value = data[field.mapping];
					formatData[field.name] = value === undefined ? field.defaultValue : value;
					if (field.convert !== null && value !== undefined && value !== null) {
						formatData[field.name] = field.convert(value, data);
					}
				}
			}
			return formatData;
		};

		Model.prototype.modelSerialize = function (data) {
			var originData = {};
			if (!data) {
				return {};
			}

			for (var i = 0, len = this.data.length; i < len; i++) {
				var field = this.data[i];
				if (field.name) {
					// serialize => mapping
					var value = data[field.name];
					if (field.serialize !== null && value !== undefined) {
						value = field.serialize(value, data);
					}
					originData[field.mapping] = value;
				}
			}

			if (this.serialize !== null) {
				originData = this.serialize(originData);
			}

			return originData;
		};

		/**
		 * it use to set DataField from json.
		 * it is NO need to use this method, except you set options.feedback to false.
		 */
		Model.prototype.loadData = function (data, needConvert) {
			this.trigger('ev_before_load_data', [data]);
			if (needConvert) {
				data = this.modelConvert(data);
			}
			for (var i = 0, len = this.data.length; i < len; i++) {
				var value = data[this.data[i].name];
				this.data[i].setValue(value);
			}
			this.record();
			this.trigger('ev_loaded', [data]);
		};

		Model.prototype.replaceData = function (data, needConvert, needRecord) {
			if (needConvert) {
				data = this.modelConvert(data);
			}
			for (var i = 0, len = this.data.length; i < len; i++) {
				var value = data[this.data[i].name];
				if (value !== undefined) {
					this.data[i].setValue(value);
					if (needRecord) {
						this.data[i].record();
					}
				}
			}
			this.trigger('ev_loaded', [data]);
		};

		/**
		 * get json from model.if the result of validate is not true, it will return null.
		 * It is always used like:
		 * data = m.getData();
		 * m.write(data);
		 */
		Model.prototype.getData = function (type, mapFlag) {
			var result = {};
			var value;
			// if (this.validate() !== true) {
			//     return null;
			// }

			for (var i = 0, len = this.fields.length; i < len; i++) {
				if (type === 'submit' && this.data[i].disabled) {
					continue;
				}
				value = this.data[i].getValue();

				var item = {};
				if (mapFlag === true) {
					item[this.data[i].mapping] = value;
				} else {
					item[this.data[i].name] = value;
				}
				$.extend(result, item);
			}
			return result;
		};

		/**
		 * Only returning true means it pass the validator. Otherwise, the return value is a message or a error code or false.
		 */
		Model.prototype.validate = function (option) {
			var returnDetail = option && option.returnDetail;
			var result = true;
			for (var i = 0, len = this.fields.length; i < len; i++) {
				// result = this.data[i].validate();

				var field = this.data[i];
				// if (!(field.vtype.length === 1 && field.vtype[0] === null)) {
				result = field.validate();
				// }

				if (result !== true) {
					this.trigger('ev_validate_change', [
						{
							result: false,
							field: field.getName()
						}
					]);
					return returnDetail ? { result: false, field: field.getName() } : result;
				}
			}
			if ($.isFunction(this.validator)) {
				result = this.validator.call(this);
				this.trigger('ev_validate_change', [
					{
						result: result,
						field: null
					}
				]);
				return returnDetail ? { result: false, field: field.getName() } : result;
			}
			this.trigger('ev_validate_change', [
				{
					result: true
				}
			]);
			return returnDetail ? { result: true, field: field.getName() } : result;
		};

		Model.prototype.beforeLoad = function (option) {
			var me = this;
			option = option || {};
			// !!this.read && this.read(option);
			// if (!(option && option.ajax && option.ajax.type)){
			// 	option = option || {};
			// 	option.data = $.extend({}, {operation: "read"}, option.data);
			// 	option.ajax = option.ajax || {};
			// 	option.ajax.type = 'POST';
			// 	option.ajax.contentType = 'application/x-www-form-urlencoded';
			// 	!!option.url && (option.ajax.url = option.url);
			// }
			// option.params = option.params || {};

			var preventSuccessEvent = option.preventSuccessEvent === undefined ? me.preventSuccessEvent : option.preventSuccessEvent;
			var preventFailEvent = option.preventFailEvent === undefined ? me.preventFailEvent : option.preventFailEvent;
			var preventErrorEvent = option.preventErrorEvent === undefined ? me.preventErrorEvent : option.preventErrorEvent;

			//默认事件在此层执行，proxy层不再执行
			option.preventSuccessEvent = true;
			option.preventFailEvent = true;
			option.preventErrorEvent = true;

			var successFn = option.success;
			option.success = function (keyData, rawData) {
				!!successFn && successFn(keyData, rawData);
			};
			var failFn = option.fail;
			option.fail = function (data, errorCode, status, xhr) {
				!!failFn && failFn(data, errorCode, status, xhr);
				if (errorCode && !preventFailEvent) {
					me.trigger('ev_model_load_error', errorCode);
				}
			};
			var errorFn = option.error;
			option.error = function (status, xhr) {
				!!errorFn && errorFn(status, xhr);
				if (!preventErrorEvent) {
					me.trigger('ev_model_ajax_error', [status, xhr]);
				}
			};
			return option;
		};

		Model.prototype.load = function (option) {
			option = option || {};
			var settings = this.beforeLoad(option);
			this.proxy.sync(
				$.extend(
					{},
					{
						operation: 'read',
						dataObj: this
					},
					settings
				)
			);
			return;
		};

		Model.prototype.getProxy = function () {
			return this.proxy;
		};

		Model.prototype.setProxyUrl = function (url) {
			this.proxy.defaultOption.url = url;
		};

		Model.prototype.beforeSubmit = function (data, option) {
			var model = this;

			return {
				ajax: {
					url: option.url || undefined,
					contentType: 'application/x-www-form-urlencoded'
				},
				data: model.modelSerialize(data),
				params: option.params || {},
				success: function (keyData, rawData) {
					if (keyData.model && rawData.data) {
						model.loadData(keyData.model, true);
					}
					!!option.success && option.success(keyData.model, rawData);
					model.fireEvent('ev_model_submit');
				},
				fail: function (data, errorCode, status, xhr) {
					if (errorCode) {
						$(model).trigger('ev_model_submit_error', errorCode);
					}
					!!option.fail && option.fail(data, errorCode, status, xhr);
				},
				error: function (status, xhr) {
					!!option.error && option.error(status, xhr);
					$(model).trigger('ev_model_ajax_error', [status, xhr]);
				}
			};
		};

		Model.prototype.submit = function (option) {
			if (this.validate() !== true) {
				return null;
			}
			option = option || {};
			this.sync(option);
			return;

			// if (data) {
			// 	var settings = this.beforeSubmit(data, option);

			// 	this.proxy.update(settings);
			// }
		};

		Model.prototype.beforeSync = function (option) {
			var me = this;
			var autoReload = option.autoReload === undefined ? me.autoReload : option.autoReload;
			var preventSuccessEvent = option.preventSuccessEvent === undefined ? me.preventSuccessEvent : option.preventSuccessEvent;
			var preventFailEvent = option.preventFailEvent === undefined ? me.preventFailEvent : option.preventFailEvent;
			var preventErrorEvent = option.preventErrorEvent === undefined ? me.preventErrorEvent : option.preventErrorEvent;

			//默认事件在此层执行，proxy层不再执行
			option.preventSuccessEvent = true;
			option.preventFailEvent = true;
			option.preventErrorEvent = true;

			var successCallback = option.success;
			option.success = function (keyData, rawData) {
				!!successCallback && successCallback(keyData, rawData);
				me.trigger('ev_model_submit', [keyData, rawData]);
				me.trigger('ev_model_submit_complete', ['success', keyData, rawData]);
				if (autoReload !== false) {
					me.load();
				}
				if (preventSuccessEvent !== true && option.operation != 'read') {
					$.su.moduleManager.query('main').showNotice($.su.CHAR.COMMON.SAVED);
				}
			};

			var failCallback = option.fail;
			option.fail = function (data, errorCode, status, xhr) {
				if (errorCode && preventFailEvent !== true) {
					me.trigger('ev_model_submit_error', errorCode);
				}
				me.trigger('ev_model_submit_complete', ['fail', errorCode]);
				!!failCallback && failCallback(data, errorCode, status, xhr);
				if (autoReload !== false) {
					me.load();
				}
			};

			var errorCallback = option.error;
			option.error = function (status, xhr) {
				!!errorCallback && errorCallback(status, xhr);
				if (preventErrorEvent !== true) {
					me.trigger('ev_model_ajax_error', [status, xhr]);
				}
				me.trigger('ev_model_submit_complete', ['error', status, xhr]);
				if (autoReload !== false) {
					me.load();
				}
			};

			var defaultHandler = $.su.getDefaultEvent(this, function () {});
			this.trigger('ev_model_before_submit', [defaultHandler.ev]);
			$.each(this.data, function (i, dataField) {
				dataField.trigger('ev_model_before_submit', [defaultHandler.ev, me]);
			});
			if (!defaultHandler.exe()) {
				return (option = null);
			}

			return option;
		};

		Model.prototype.sync = function (option) {
			var me = this;
			option = option || {};
			option = this.beforeSync(option);
			if ($.type(option) !== 'object') {
				return null;
			}
			var argumentsCopy = Array.prototype.slice.call(arguments, 0);
			if (option && option.operation !== 'read') {
				if (this.validate() !== true) {
					return null;
				}
			}
			var proxySyncOption = $.extend(true, {}, option);

			proxySyncOption.operation = proxySyncOption.operation || 'write';
			if (proxySyncOption.operation !== 'read') {
				proxySyncOption.difference = this.checkDataChange(option);
			}

			proxySyncOption.dataObj = this;

			proxySyncOption.success = function (filteredData) {
				!!option && !!option.success && option.success(me.modelConvert(filteredData));
			};

			argumentsCopy[0] = proxySyncOption;

			if (this.proxy) {
				this.proxy.sync.apply(this.proxy, argumentsCopy);
			}
		};
		Model.prototype.abort = function () {
			this.proxy.abort.apply(this.proxy);
		};
		Model.prototype.checkDataChange = function (option) {
			var updateDataKey = option.updateDataKey || 'update';
			var result = {};
			result[updateDataKey] = {
				model: this.modelSerialize(this.getData('submit')),
				oldModel: null //TODO: import the snapshot mechanism
			};
			return result;
		};

		/**
		 * record the model's value as the backup value.
		 * if feedback is true, this method will be used when model Synchronize data with server(read or write) automatically.
		 */
		Model.prototype.record = function () {
			for (var i = 0, len = this.fields.length; i < len; i++) {
				// this.fields[i].record();
				this.data[i].record();
			}
			return this;
		};

		/**
		 * reset the model's value as the backup value.
		 */
		Model.prototype.reset = function () {
			for (var i = 0, len = this.fields.length; i < len; i++) {
				// this.fields[i].reset();
				this.data[i].reset();
			}
			return this;
		};

		Model.prototype.isDirty = function () {
			for (var i = 0, len = this.fields.length; i < len; i++) {
				// if (this.fields[i].isDirty()) {
				if (this.data[i].isDirty()) {
					return true;
				}
			}

			return false;
		};

		Model.prototype.getField = function (fieldName) {
			// for (var i = 0, len = this.fields.length; i < len; i++) {
			//     if (this.fields[i]["name"] == fieldName) {
			//         // return this.fields[i];
			//         return this.fields[i];
			//     }
			// }
			// return null;
			return this[fieldName];
		};

		Model.prototype.getFieldNameByIndex = function (index) {
			if (this.fields.length >= index) {
				// return this.fields[i]["name"];
				return this.data[i].name;
			}
			return null;
		};

		Model.prototype.getSize = function (fieldName) {
			return this.fields.length;
		};

		Model.prototype.toggleFields = function (name, state) {
			var data = this.data;
			var type = $.type(name);

			if (type === 'boolean') {
				state = name;
				for (var i = 0, len = this.fields.length; i < len; i++) {
					state ? data[i].enable() : data[i].disable();
				}
				return;
			}

			for (var i = 0, len = this.fields.length; i < len; i++) {
				if ((type === 'regexp' && name.test(data[i].getName())) || (type === 'function' && name(data[i].getName()))) {
					state ? data[i].enable() : data[i].disable();
				}
			}
		};

		return Model;
	})();
})(jQuery);
