/*
 * @description @class SMB's Module class
 * @author KYJ
 * @change
 *   2017/09/22: create file
 *
 * */
(function ($) {
	$.su.Module = (function () {
		var AxModule = function (options) {
			AxModule.superclass.constructor.call(this, options);
		};
		$.su.inherit($.su.Module, AxModule);

		var _init = function () {
			var indexModule = $.su.moduleManager.query('index');
			var commonSave = this.settings.commonSave;
			if ($.su.moduleManager.getStatus('index') === 'available') {
				indexModule.hideSaveBtn();
				if (commonSave === false) {
					indexModule.alwaysShowSaveBtn(this.name);
				}
				$.each($.extend({}, this.data.stores, this.data.models), function (index, dataBind) {
					if (dataBind.dataObj && dataBind.dataObj.proxy) {
						if (commonSave !== false) {
							indexModule.registerAutoSaveData(dataBind);
						}
						indexModule.registerSaveLoading(dataBind);
					}
				});
			}
		};

		AxModule.prototype.launch = function (callback) {
			_init.call(this);
			AxModule.superclass.launch.call(this, callback);
		};

		AxModule.prototype.destroy = function (callback) {
			var indexModule = $.su.moduleManager.query('index');
			var commonSave = this.settings.commonSave;
			if ($.su.moduleManager.getStatus('index') === 'available') {
				if (commonSave === false) {
					indexModule.cancelAlwaysShowSaveBtn(this.name);
				}
				$.each($.extend({}, this.data.stores, this.data.models), function (index, dataBind) {
					if (dataBind.dataObj && dataBind.dataObj.proxy) {
						indexModule.unRegisterAutoSaveData(dataBind);
						indexModule.unRegisterSaveLoading(dataBind);
					}
				});
			}

			AxModule.superclass.destroy.call(this);
		};

		AxModule.prototype.registerAutoSaveData = function (dataBind) {
			if ($.su.moduleManager.getStatus('index') !== 'available') {
				return false;
			}
			var indexModule = $.su.moduleManager.query('index');
			if (!$.isArray(dataBind)) {
				dataBind = [dataBind];
			}
			$.each(dataBind, function (i, item) {
				if (item instanceof $.su.ModelBind || item instanceof $.su.StoreBind) {
					indexModule.registerAutoSaveData(item);
				}
			});
			return true;
		};

		AxModule.prototype.unRegisterAutoSaveData = function (dataBind) {
			if ($.su.moduleManager.getStatus('index') !== 'available') {
				return false;
			}
			var indexModule = $.su.moduleManager.query('index');
			if (!$.isArray(dataBind)) {
				dataBind = [dataBind];
			}
			$.each(dataBind, function (i, item) {
				if (item instanceof $.su.ModelBind || item instanceof $.su.StoreBind) {
					indexModule.unRegisterAutoSaveData(item);
				}
			});
			return true;
		};

		AxModule.STATUS = $.su.Module.STATUS;
		return AxModule;
	})();
})(jQuery);
