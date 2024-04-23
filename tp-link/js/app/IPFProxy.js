(function ($) {
	$.su.define('IPFProxy', {
		extend: 'AjaxProxy',
		constructor: (function () {
			var IPFProxy = function (options) {
				IPFProxy.$parent.call(this, options);
				//for the compatibility of old codes
				if (options && options.hasOwnProperty('preventSuccessEvent')) {
					this.preventSuccessEvent = options.preventSuccessEvent;
				}
				if (options && options.hasOwnProperty('preventFailEvent')) {
					this.preventFailEvent = options.preventFailEvent;
				}

				this.defaultOption.preventSuccessEvent = this.preventSuccessEvent;
				this.defaultOption.preventFailEvent = this.preventFailEvent;
			};
			return IPFProxy;
		})(),
		successJudge: function (data, settings) {
			if (data.success === false) {
				var errorCode = data.errorCode || data.error || data.error_code || data.errorcode;
				var mainModule = $.su.moduleManager.query('main');
				switch (errorCode) {
					case 'timeout':
						if (mainModule instanceof $.su.Module) {
							mainModule.trigger('ev_login_timeout');
						}
						break;
					case 'auto upgrading':
						if (mainModule instanceof $.su.Module) {
							mainModule.trigger('ev_auto_upgrading');
						}
						break;
					case 'user conflict':
						if (mainModule instanceof $.su.Module) {
							mainModule.trigger('ev_user_conflict');
						}
						break;
					case 'permission denied':
						if (mainModule instanceof $.su.Module) {
							mainModule.trigger('ev_permission_denied');
						}
						break;
				}
				return errorCode;
			} else {
				return true;
			}
		},
		readFilter: function (data) {
			data.others = data.others || {};
			if (data.others.max_rules) {
				data.others.maxRules = data.others.max_rules;
				delete data.others.max_rules;
			}
			return data.data;
		},
		failFilter: function (data) {
			var result = $.extend({}, data);
			result.errorCode = data.errorCode || data.error || data.error_code || data.errorcode;
			return result;
		},
		ajax: {
			contentType: 'application/x-www-form-urlencoded'
		},
		sync: function (option) {
			var args = Array.prototype.slice.call(arguments, 0);
			var operation = option.operation;
			var dataObj = option.dataObj;
			var modelType;
			if (dataObj instanceof $.su.Model) {
				modelType = 'Model';
			} else if (dataObj instanceof $.su.Store) {
				modelType = 'Store';
			}
			// var difference = option.difference;
			// var dataObj = option.dataObj;

			if (operation === 'read' && modelType === 'Model') {
				this.read.apply(this, args);
			} else if (operation === 'read' && modelType === 'Store') {
				this.load.apply(this, args);
			} else if (operation === 'write' && modelType === 'Model') {
				this.write.apply(this, args);
			} else if (operation === 'write' && modelType === 'Store') {
				if (!$.su.isEmptyObject(option.difference.remove)) {
					this.remove.apply(this, args);
				}
				if (!$.su.isEmptyObject(option.difference.insert)) {
					this.insert.apply(this, args);
				}
				if (!$.su.isEmptyObject(option.difference.update)) {
					this.update.apply(this, args);
				}
			} else {
				if (!this[operation]) {
					$.su.debug.error('no such operation: ', operation);
				} else {
					this[operation].apply(this, args);
				}
			}
		},

		read: function (option, triggerEve) {
			var me = this;
			option.data = $.extend({}, { operation: 'read' }, option.data);
			var successCallback = option.success;
			if (triggerEve !== false) {
				option.success = function (filteredData, data, status, xhr) {
					me.trigger('ev_load', [filteredData]);
					!!successCallback && successCallback(filteredData, data, status, xhr);
				};
			}

			this.op('read', option);
		},

		write: function (option) {
			var me = this;
			var model = option.dataObj;
			option.difference = $.extend({ update: {} }, option.difference);
			option.data = $.extend({}, { operation: 'write' }, option.difference.update.model, option.data);
			var successCallback = option.success;
			option.success = function (filteredData) {
				model && model.record();
				!!successCallback && successCallback(filteredData);
			};
			this.op('write', option);
		},

		load: function (option) {
			var me = this;
			option.data = $.extend({}, { operation: 'load' }, option.data);
			var successCallback = option.success;
			option.success = function (filteredData, data, status, xhr) {
				me.trigger('ev_load', [filteredData, data.others]);
				!!successCallback && successCallback(filteredData, data, status, xhr);
			};
			this.op('load', option);
		},

		remove: function (option) {
			var removeItems = option.difference.remove;

			var store = option.dataObj;
			var keyProperty = store.keyProperty;

			var sendData = {
				key: [],
				index: []
			};

			for (var key in removeItems) {
				if (removeItems.hasOwnProperty(key)) {
					//key may be int type, 'key' property name is not reliable.
					sendData.key.push(removeItems[key].oldModel[keyProperty]);
				}
			}
			sendData.index = store.getIndexsInSnapshot(sendData.key);
			option.data = $.extend({}, sendData, { operation: 'remove' });
			var successCallback = option.success || function () {};
			option.traditional = true;
			option.success = function (filteredData, data, status, xhr) {
				store.record();
				successCallback(filteredData, data, status, xhr);
			};
			this.op('remove', option);
		},

		insert: function (option) {
			var insertItems = option.difference.insert;
			var sendData = {};
			var store = option.dataObj;

			var singleItemDealed = false;
			for (var key in insertItems) {
				if (insertItems.hasOwnProperty(key)) {
					//key may be int type, 'key' property name is not reliable.
					if (!singleItemDealed) {
						sendData.key = 'add';
						sendData['new'] = JSON.stringify(insertItems[key].model);
						sendData.old = 'add';
						sendData.index = 0;
						singleItemDealed = true;
					} else {
						continue;
					}
				}
			}
			option.data = $.extend({}, sendData, { operation: 'insert' });
			var successCallback = option.success || function () {};
			option.success = function (filteredData, data, status, xhr) {
				store.record();
				successCallback(filteredData, data, status, xhr);
			};
			this.op('insert', option);
		},

		update: function (option) {
			var updateItems = option.difference.update;
			var sendData = {};
			var store = option.dataObj;
			var keyProperty = store.keyProperty;

			//single operation
			var singleItemDealed = false;
			for (var key in updateItems) {
				if (updateItems.hasOwnProperty(key)) {
					//key may be int type, 'key' property name is not reliable.
					if (!singleItemDealed) {
						sendData.key = updateItems[key].oldModel[keyProperty];
						sendData['new'] = JSON.stringify(updateItems[key].model);
						sendData.old = JSON.stringify(updateItems[key].oldModel);
						singleItemDealed = true;
					} else {
						continue;
					}
				}
			}
			option.data = $.extend({}, sendData, { operation: 'update' });
			var successCallback = option.success || function () {};
			option.success = function (filteredData, data, status, xhr) {
				store.record();
				successCallback(filteredData, data, status, xhr);
			};
			this.op('update', option);
		},
		_decorateOption: function (option) {
			var me = this;
			if (option.writeFilter) {
				option.data = option.writeFilter.call(this, option.data);
			}
			var successCallback = !!option && option.success;
			var failCallback = !!option && option.fail;
			option.success = function (dataOrigin, status, xhr) {
				var data;
				var noEncryptUrl = [
					'/domain_login?form=dlogin',
					'/locale?form=lang',
					'/locale?form=country',
					'/login?form=auth',
					'/login?form=keys',
					'/login?form=password',
					'/locale?form=list',
					'/login?form=get_token',
					'/login?form=get_eweb_url',
					'/login?form=get_deviceInfo',
					'/login?form=check_factory_default',
					'/login?form=get_firmware_info',
					'/login?form=check_internet',
					'/login?form=cloud_bind_status',
					'/login?form=vercode',
					'/login?form=sysmode',
					'/admin/firmware?form=config_multipart',
					'/admin/firmware?form=save_upgrade',
					'/admin/openvpn?form=export',
					'/admin/syslog?form=save_log',
					'/admin/wifidog?form=portal_logo',
					'/admin/wifidog?form=portal_background'
				];

				$.each(noEncryptUrl, function (i, n) {
					noEncryptUrl[i] = $.su.url(n).toString();
				});

				if (option.noneEncrypt) {
					noEncryptUrl.push(option.url.toString());
				}

					data = dataOrigin;
				var res = option.successJudge ? option.successJudge(data, status, xhr) : true;
				if (res === true) {
					var filteredData = option.readFilter ? option.readFilter.call(me, data) : data;
					!!successCallback && successCallback(filteredData, data, status, xhr);
					var operation = option.data && option.data.operation;
					if (option.preventSuccessEvent !== true && operation && operation != 'read' && operation != 'load') {
						if ($.su.moduleManager.query('main')) {
							$.su.moduleManager.query('main').showNotice($.su.CHAR.COMMON.SAVED);
						}
					}
				} else {
					var failData = option.failFilter ? option.failFilter.call(me, data) : data;
					!!failCallback && failCallback(failData, res, status, xhr);
					if (option.preventFailEvent !== true) {
						$.su.raise({
							msg: 'ev_proxy_fail',
							type: 'proxy_fail',
							errorCode: data.errorCode || data.error || data.error_code || data.errorcode,
							proxy: me
						});
					}
				}
			};
		}
	});
})(jQuery);
