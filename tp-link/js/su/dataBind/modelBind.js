(function ($) {
	$.su = $.su || {};
	$.su.ModelBind = (function () {
		var argsTransMap = {
			setValue: {
				defaults: function (args) {
					return args;
				},
				textBox1: function (args) {
					return args[0];
				},
				dataObj1: function (args) {
					return args[0];
				}
			},
			load: {
				dataObj: function () {
					var args = [].slice.call(arguments, 0);
					var option = args[0];
					if (option && option.success) {
						option.success = decorateAsyncCallback.call(this, option.success);
					}
					if (option && option.fail) {
						option.fail = decorateAsyncCallback.call(this, option.fail);
					}
					if (option && option.error) {
						option.error = decorateAsyncCallback.call(this, option.error);
					}
					return args;
				}
			}
		};

		var viewEventMap = {
			defaults: {
				value_change: {
					fn: 'setValue',
					argsInterface: null
				},
				validate_change: {
					fn: 'validate'
				},
				ev_view_change: {
					fn: function (e, ev_msg) {
						switch (ev_msg.type) {
							case 'value':
								this.setValue(ev_msg.value);
								break;
							case 'valid':
								this.validate();
								break;
						}
					}
				}
			},
			form: {
				value_change: {
					fn: function (e, newV, oldV) {},
					argsInterface: null
				}
			}
		};
		for (var item in viewEventMap) {
			if (item != 'defaults') {
				viewEventMap[item] = $.extend(true, {}, viewEventMap.defaults, viewEventMap[item]);
			}
		}

		var dataEventMap = {
			ev_model_submit_error: {
				fn: function (e, errorCode) {
					$.su.raise({
						msg: 'ev_model_submit_error',
						type: 'model_submit_error',

						errorCode: errorCode,
						modelBind: this
					});
				},
				argsInterface: null
			},
			ev_model_load_error: {
				fn: function (e, errorCode) {
					$.su.raise({
						msg: 'ev_model_load_error',
						type: 'model_load_error',

						errorCode: errorCode,
						modelBind: this
					});
					return;
					// for(var i=0; i<this.viewObjs.length; i++){
					//     var text = $.su[$.app.language.settings.char]["ERRCODE"][errorCode] || $.su[$.app.language.settings.char]["ERRCODE"]["EDEFAULT"];    //?
					//     !!this.viewObjs[i].prompt && this.viewObjs[i].prompt(false, text, 150);
					// }
				},
				argsInterface: null
			},
			ev_model_ajax_error: {
				fn: function (e, status, xhr) {
					$.su.raise({
						msg: 'ev_model_ajax_error',
						type: 'model_ajax_error',

						ajaxErrorStatus: status,
						ajaxErrorXhr: xhr,
						modelBind: this
					});
					return;
					// for(var i=0; i<this.viewObjs.length; i++){
					//     var text = $.su[$.app.language.settings.char]["ALERT"]["FAIL_GET_DATA"];
					//     !!this.viewObjs[i].prompt && this.viewObjs[i].prompt(false, text, 150);
					// }
				},
				argsInterface: null
			},
			ev_before_load_data: {
				fn: function (e, data) {
					this.fireEvent('ev_before_load_data', [data]);
				},
				argsInterface: null
			},
			ev_loaded: {
				fn: function (e, data) {
					this.fireEvent('ev_loaded', [data]);
				},
				argsInterface: null
			},
			ev_data_change: {
				fn: function (e, msg, dataField, me) {
					this._responseDataChange();
					var dataFieldBind = this[dataField.getName()];
					this.trigger('ev_data_change', [msg.value, dataFieldBind, this]);
				}
			},
			ev_data_record: {
				fn: function (e, msg, dataField, me) {
					var dataFieldBind = this[dataField.getName()];
					this.trigger('ev_data_record', [msg.value, dataFieldBind, this]);
				}
			},
			ev_validate_change: {
				fn: function (e, msg) {
					this.trigger('ev_validate_change', [msg]);
				}
			},
			ev_model_submit: {
				fn: function (e, keyData, rawData) {
					this.trigger('ev_model_submit', [keyData, rawData]);
				}
			},
			ev_model_before_submit: {
				fn: function (e, ev) {
					this.trigger('ev_model_before_submit', [ev]);
				}
			},
			ev_model_submit_complete: {
				fn: function (e) {
					this.trigger('ev_model_submit_complete', [].slice.call(arguments, 1));
				}
			}
		};

		var ModelBind = function (dataObj, viewObj) {
			this.subFieldsBinds = {};
			$.su.DataBind.call(this, dataObj, viewObj);
		};

		$.su.inherit($.su.DataBind, ModelBind);

		ModelBind.argsTransMap = argsTransMap;
		ModelBind.viewEventMap = viewEventMap;
		ModelBind.dataEventMap = dataEventMap;

		var decorateAsyncCallback = function (fn) {
			var me = this;
			return function () {
				if (me && me.isBinded()) {
					fn.apply(me.dataObj, arguments);
				} else {
					me = null;
				}
			};
		};

		var createDataBindFn = function (name) {
			return function () {
				var argsTrans = ModelBind.argsTransMap[name];
				var ret;
				if (this.viewObjs && this.viewObjs.length > 0) {
					for (var i in this.viewObjs) {
						var viewObj = this.viewObjs[i];
						var type = viewObj._type;

						if (viewObj[name]) {
							var args = argsTrans && argsTrans[type] ? argsTrans[type].apply(this, arguments) : arguments;
							var re = viewObj[name].apply(viewObj, args);
							ret = re === undefined ? ret : re;
						}
					}
				}
				if (this.dataObj && this.dataObj[name]) {
					var args = argsTrans && argsTrans['dataObj'] ? argsTrans['dataObj'].apply(this, arguments) : arguments;
					var re = this.dataObj[name].apply(this.dataObj, args);
					ret = re;
				}
				return ret;
			};
		};

		for (var item in $.su.Widget.regMap) {
			if ($.su.Widget.regMap.hasOwnProperty(item)) {
				var widgetInfo = $.su.Widget.regMap[item];
			}
			for (var i in widgetInfo) {
				if (widgetInfo.hasOwnProperty(i) && typeof widgetInfo[i] == 'function') {
					if (i != '_init' && i != 'init' && i != 'create') {
						if (!ModelBind.prototype[i]) {
							ModelBind.prototype[i] = createDataBindFn(i);
						}
					}
				}
			}
		}

		for (var item in $.su.Model.prototype) {
			if (typeof $.su.Model.prototype[item] == 'function') {
				if (!ModelBind.prototype[item]) {
					ModelBind.prototype[item] = createDataBindFn(item);
				}
			}
		}

		ModelBind.prototype.bindDataObj = function (dataObj) {
			var me = this;
			ModelBind.superclass.bindDataObj.call(this, dataObj);
			this.createSubBinds();

			if (this.viewObjs) {
				for (var i = 0; i < this.viewObjs.length; i++) {
					this.syncSubViewBinds(this.viewObjs[i]);
				}
			}
			this.syncView();

			for (var item in dataObj.methods) {
				if (dataObj.methods.hasOwnProperty(item) && typeof dataObj.methods[item] == 'function') {
					if (!me[item]) {
						me[item] = (function (method) {
							return function () {
								dataObj.methods[method].apply(me, arguments);
							};
						})(item);
					}
				}
			}
		};

		ModelBind.prototype.createSubBinds = function () {
			// if(!this.dataObj){
			//     return;
			// }
			var fields = this.dataObj.fields;

			this.subFieldsBinds = {};
			for (var i = 0; i < fields.length; i++) {
				this[fields[i].name] = this.subFieldsBinds[fields[i].name] = new $.su.DataFieldBind(this.dataObj.data[i]);
			}
			// this.bindSubFields();
		};

		ModelBind.prototype.syncSubViewBinds = function (viewObj) {
			// this.bindSubFields();
			if (viewObj.getAllFields) {
				var childrenViewObjs = viewObj.getAllFields();
				if (!childrenViewObjs) {
					return;
				}
				for (var i = 0; i < childrenViewObjs.length; i++) {
					var childViewObj = childrenViewObjs[i];
					var field = childViewObj.field;
					var childDataBind = this.subFieldsBinds[field];
					if (childDataBind && !childDataBind.viewIsBinded(childViewObj)) {
						childDataBind.bindViewObj(childViewObj);
					}
				}
			}
		};

		ModelBind.prototype.syncSubViewUnbinds = function (viewObj) {
			// this.bindSubFields();
			if (viewObj.getAllFields) {
				var childrenViewObjs = viewObj.getAllFields();
				for (var i = 0; i < childrenViewObjs.length; i++) {
					var childViewObj = childrenViewObjs[i];
					var field = childViewObj.field;
					var childDataBind = this.subFieldsBinds[field];
					if (childDataBind && childDataBind.viewIsBinded(childViewObj)) {
						childDataBind.unbindViewObj(childViewObj);
					}
				}
			}
		};

		// single viewObj
		ModelBind.prototype.bindViewObj = function (viewObj) {
			ModelBind.superclass.bindViewObj.call(this, viewObj);
			if (this.dataObj) {
				this.syncSubViewBinds(viewObj);
			}
			this.syncView();
		};

		ModelBind.prototype.unbindDataObj = function () {
			for (var subField in this.subFieldsBinds) {
				if (this.subFieldsBinds.hasOwnProperty(subField)) {
					this.subFieldsBinds[subField].unbind();
					delete this[subField]; // temp: to avoid error of reading `field of undefined`, may cause memory leak?
				}
			}

			for (var method in this.dataObj.methods) {
				if (this.dataObj.methods.hasOwnProperty(method)) {
					delete this[method];
				}
			}

			this.subFieldsBinds = {};
			ModelBind.superclass.unbindDataObj.call(this);
		};
		ModelBind.prototype.unbindViewObj = function (viewObj) {
			this.syncSubViewUnbinds(viewObj);
			// syncSubViewUnbinds
			ModelBind.superclass.unbindViewObj.call(this, viewObj);
		};

		//sync change to other bind, this fn does not consider circle call, depending on dataField's avoiding circle call
		ModelBind.prototype._responseDataChange = function () {
			var data = this.dataObj.getData();
			for (var i = 0; i < this.viewObjs.length; i++) {
				var viewObj = this.viewObjs[i];
				for (var j = 0; j < viewObj.dataBind.length; j++) {
					var otherDataBind = viewObj.dataBind[j];
					if (otherDataBind.dataObj !== this.dataObj) {
						otherDataBind.dataObj.loadData(data);
					}
				}
			}
		};

		ModelBind.prototype.getAllFields = function () {
			return this.subFieldsBinds;
		};
		return ModelBind;
	})();
})(jQuery);
