(function ($) {
	$.su = $.su || {};

	//service
	$.su.Polling = (function () {
		var Polling = function () {
			if (typeof Polling.instance === 'object') {
				return Polling.instance;
			}

			this.name = 'polling';
			$.su.Service.call(this);

			Polling.instance = this;

			this.activityModelMap = {};
			this.addListener('ev_model_dirty', function (e, name) {
				this.clearPolling(name);
			});
		};

		$.su.inherit($.su.Service, Polling);

		var _generatePollFreq = function (modelPollInfo) {
			var ret = null;
			for (var item in modelPollInfo) {
				if (modelPollInfo.hasOwnProperty(item)) {
					if (ret === null) {
						ret = modelPollInfo[item];
					} else {
						if (modelPollInfo[item] > 0 && modelPollInfo[item] < ret) {
							ret = modelPollInfo[item];
						}
					}
				}
			}
			return ret;
		};

		Polling.prototype.poll = function (model, method, dataAndCallback, interval, immediately, module) {
			//modelName, interval, module, callback, method
			if (immediately instanceof $.su.Module) {
				// maybe 'immediately' is not in parameters;
				module = immediately;
				immediately = true;
			}
			var modelName = typeof model == 'string' ? model : model.name ? model.name : model.dataObj.name;
			var moduleName = typeof module == 'string' ? module : module.name;
			var me = this;

			if (!this.activityModelMap[modelName]) {
				this.activityModelMap[modelName] = {
					modules: {},
					queryInterval: null,
					instance: null
				};
				this.activityModelMap[modelName].modules[moduleName] = interval;
				this.activityModelMap[modelName].method = method;
				this.activityModelMap[modelName].dataAndCallback = $.su.clone(dataAndCallback);

				var fn = function () {
					var dataObj = $.su.modelManager.get(modelName) || $.su.storeManager.get(modelName);
					// if(dataObj.isDirty() && (method!="load")){
					if (dataObj.isDirty()) {
						// me.fireEvent("ev_model_dirty", [modelName]);
						return;
					} else {
						dataObj[method](dataAndCallback);
					}
				};
				this.activityModelMap[modelName].instance = setInterval(fn, interval);
				immediately && fn();
			} else {
				this.activityModelMap[modelName].modules[moduleName] = interval;
				clearInterval(this.activityModelMap[modelName].instance);
				var interval = _generatePollFreq(this.activityModelMap[modelName].modules);
				this.activityModelMap[modelName].method = method;
				this.activityModelMap[modelName].dataAndCallback = $.su.clone(dataAndCallback);
				var fn = function () {
					var dataObj = $.su.modelManager.get(modelName) || $.su.storeManager.get(modelName);
					// if(dataObj.isDirty() && (method!="load")){
					if (dataObj.isDirty()) {
						// me.fireEvent("ev_model_dirty", [modelName]);
						return;
					} else {
						dataObj[method](dataAndCallback);
					}
				};

				this.activityModelMap[modelName].instance = setInterval(fn, interval);
				immediately && fn();
			}
		};

		Polling.prototype.stopPolling = function (model, immediately, module) {
			if (immediately instanceof $.su.Module) {
				// maybe 'immediately' is not in parameters;
				module = immediately;
				immediately = true;
			}
			var modelName = typeof model == 'string' ? model : model.name ? model.name : model.dataObj.name;
			var moduleName = typeof module == 'string' ? module : module.name;
			if (!this.checkPolling(model, module)) {
				return;
			}
			if (moduleName in this.activityModelMap[modelName].modules) {
				this.activityModelMap[modelName].modules[moduleName] = undefined;
			}
			clearInterval(this.activityModelMap[modelName].instance);
			var interval = _generatePollFreq(this.activityModelMap[modelName].modules);
			var method = this.activityModelMap[modelName].method;
			var dataAndCallback = this.activityModelMap[modelName].dataAndCallback;
			if (interval) {
				var fn = function () {
					var dataObj = $.su.modelManager.get(modelName) || $.su.storeManager.get(modelName);
					// if(dataObj.isDirty() && (method!="load")){
					if (dataObj.isDirty()) {
						// me.fireEvent("ev_model_dirty", [modelName]);
						return;
					} else {
						dataObj[method](dataAndCallback);
					}
				};

				this.activityModelMap[modelName].instance = setInterval(fn, interval);
				immediately && fn();
			}
		};

		Polling.prototype.clearPolling = function (modelName) {
			clearInterval(this.activityModelMap[modelName].instance);
			for (var item in this.activityModelMap[modelName].modules) {
				if (this.activityModelMap[modelName].modules.hasOwnProperty(item)) {
					this.activityModelMap[modelName].modules[item] = undefined;
				}
			}
		};

		Polling.prototype.checkPolling = function (model, module) {
			var modelName = typeof model == 'string' ? model : model.name ? model.name : model.dataObj.name;
			var moduleName = typeof module == 'string' ? module : module.name;

			if (this.activityModelMap[modelName]) {
				return this.activityModelMap[modelName].modules[moduleName];
			}
			return false;
		};
		// Polling.prototype._doPolling = function(modelName){
		//     var info = this.activityModelMap[modelName];
		//
		// };
		return Polling;
	})();
})(jQuery);
