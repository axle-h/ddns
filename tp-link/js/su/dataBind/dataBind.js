(function ($) {
	$.su = $.su || {};
	$.su.DataBind = (function () {
		// var argsTransMap = {
		// };
		//
		// var viewEventMap = {
		//     defalut:{}
		// };
		// for(var item in viewEventMap){
		//     if(item != "default"){
		//         viewEventMap[item] = $.extend(true, {}, viewEventMap[item], viewEventMap.default);
		//     }
		// }
		//
		// var dataEventMap = {
		// };

		var DataBind = function (dataObj, viewObjs) {
			$.su.Observable.call(this);

			var me = this;
			this.viewObjs = [];
			this.dataObj = dataObj;

			if (viewObjs) {
				if (!$.isArray(viewObjs)) {
					viewObjs = [viewObjs];
				}
			}

			this.viewEventHandler = {};
			this.dataEventHandler = {};

			//store the bindObj to in viewObj
			// viewObj.dataBind = this;
			if (this.dataObj) {
				this.bindDataObj(this.dataObj);
			}
			if (viewObjs) {
				for (var i = 0; i < viewObjs.length; i++) {
					this.bindViewObj(viewObjs[i]);
				}
			}
		};

		$.su.inherit($.su.Observable, DataBind);

		DataBind.prototype.getName = function () {
			if (this.dataObj && this.dataObj._name) {
				return this.dataObj._name;
			}
		};

		DataBind.prototype.bind = function (viewObjs, dataObj) {
			if (!$.isArray(viewObjs)) {
				viewObjs = [viewObjs];
			}
			for (var i = 0; i < viewObjs.length; i++) {
				this.bindViewObj(viewObjs[i]);
			}

			this.bindDataObj(dataObj);
		};

		DataBind.prototype.bindDataObj = function (dataObj) {
			var me = this;
			var Class = this.constructor;
			var dataEventMap = Class.dataEventMap;
			this.unbindDataObj();
			this.dataObj = dataObj;
			// if(dataObj.name == "interfacesStore"){
			//     debugger;
			// }
			for (var event in dataEventMap) {
				var dealer = dataEventMap[event].fn;
				if (typeof dealer == 'string') {
					dealer = me[dealer];
				}
				var fn = (function (dealer, scope) {
					return function () {
						dealer.apply(scope, arguments);
					};
				})(dealer, me);
				this.dataEventHandler[event] = fn;
				// $(dataObj).on(event, fn);
				dataObj.addListener(event, fn);
			}
		};

		DataBind.prototype.viewIsBinded = function (viewObj) {
			return $.inArray(viewObj, this.viewObjs) >= 0;
		};

		DataBind.prototype.isBinded = function () {
			return this.dataObj !== null;
		};

		// single viewObj
		DataBind.prototype.bindViewObj = function (viewObj) {
			var me = this;
			var Class = this.constructor;
			var eventMap = Class.viewEventMap[viewObj._type] ? Class.viewEventMap[viewObj._type] : Class.viewEventMap.defaults;
			if (this.viewIsBinded(viewObj)) {
				return;
			}
			this.viewObjs.push(viewObj);

			this.viewEventHandler[viewObj.domId] = {};
			for (var event in eventMap) {
				var dealer = eventMap[event].fn;
				if (typeof dealer == 'string') {
					dealer = me[dealer];
				}
				var fn = (function (dealer, viewObj, scope) {
					return function () {
						var args = Array.prototype.slice.call(arguments);
						args[args.length] = viewObj;
						dealer.apply(scope, args);
					};
				})(dealer, viewObj, me);
				this.viewEventHandler[viewObj.domId][event] = fn;
				viewObj.dom().on(event, fn);
			}
			if (viewObj.dataBind) {
				viewObj.dataBind.push(me);
			} else {
				viewObj.dataBind = [me];
			}
		};
		DataBind.prototype.unbind = function () {
			this.unbindDataObj();
			this.unbindViewObjs();
		};
		DataBind.prototype.unbindDataObj = function () {
			if (this.dataObj) {
				for (var event in this.dataEventHandler) {
					this.dataObj.off(event, this.dataEventHandler[event]);
				}
				this.dataObj = null;
			}
			this.trigger('ev_data_unbind');
		};
		DataBind.prototype.unbindViewObj = function (viewObj) {
			var me = this;
			var index = $.inArray(viewObj, this.viewObjs);
			if (index >= 0) {
				var eventHandlerMap = this.viewEventHandler[viewObj.domId];
				for (var event in eventHandlerMap) {
					if (eventHandlerMap.hasOwnProperty(event)) {
						viewObj.dom().off(event, eventHandlerMap[event]);
					}
				}
				delete this.viewEventHandler[viewObj.domId];
				this.viewObjs.splice(index, 1);
			}
			var index = $.inArray(me, viewObj.dataBind);
			if (index >= 0) {
				viewObj.dataBind.splice(index, 1);
			}
		};
		DataBind.prototype.unbindViewObjs = function () {
			var length = this.viewObjs.length;
			for (var i = length; i > 0; i--) {
				this.unbindViewObj(this.viewObjs[i - 1]);
			}
		};

		DataBind.prototype.syncView = function () {
			// this.setValue(this.dataObj.getValue());
		};

		return DataBind;
	})();
})(jQuery);
