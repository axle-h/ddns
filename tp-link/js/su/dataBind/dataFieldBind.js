(function ($) {
	$.su = $.su || {};
	$.su.DataFieldBind = (function () {
		var dataFieldBindListeners = {
			sync: function (e) {
				if (this.dataObj) {
					var value = this.dataObj.getValue();
					// this.setValue(value);
					this._syncDataValue(value);

					var disabled = this.dataObj.disabled;
					if (disabled) {
						this.disable();
					}
				}
			}
		};

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
			validate: {},
			getValue: {}
		};

		var viewEventMap = {
			defaults: {
				ev_view_change: {
					fn: function (e, ev_msg, viewObj) {
						e.stopPropagation();
						switch (ev_msg.type) {
							case 'value':
								this._responseViewValueChanges(ev_msg.value, viewObj);
								break;
							case 'valid':
								this.validate();
								break;
							case 'record':
								if (this.dataObj) {
									this.setValue(ev_msg.value);
									this.dataObj.record();
								}
								break;
						}
					}
				},
				ev_view_update: {
					fn: function () {
						if (!this.dataObj) {
							return;
						}
						var value = this.dataObj.getValue();
						// for(var i=0; i<this.viewObjs.length; i++){
						// 	this.viewObjs[i].setValue(value);
						// }
						this._syncDataValue(value);
					}
				},
				ev_view_disable: {
					fn: function () {
						this.dataObj.disable();
					}
				},
				ev_view_enable: {
					fn: function () {
						this.dataObj.enable();
					}
				},
				ev_widget_hide: {
					fn: function () {
						this.setNormal && this.setNormal();
					}
				}
			},
			switch: {
				ev_view_change: {
					fn: function (e, ev_msg, viewObj) {
						e.stopPropagation();
						switch (ev_msg.type) {
							case 'value':
								switchHandler(viewObj);
								this._responseViewValueChanges(ev_msg.value, viewObj);
								break;
							case 'valid':
								this.validate();
								break;
							case 'record':
								if (this.dataObj) {
									this.setValue(ev_msg.value);
									this.dataObj.record();
								}
								break;
						}

						function switchHandler(viewObj) {
							var dataFieldBind = viewObj.dataBind[0];
							var settings = viewObj.settings;
							var trueValue = settings.trueValue;
							var falseValue = settings.falseValue;
							var submitFlag = false;
							viewObj.showLoading(ev_msg.value === trueValue ? 'on' : 'off');
							var func = function (e, ev, model) {
								submitFlag = true;
								model.one('ev_model_submit_complete', function (e) {
									if (dataFieldBind.dataObj.isDirty()) {
										dataFieldBind.dataObj.reset();
									}
									viewObj.hideLoading();
								});
							};
							dataFieldBind.one('ev_model_before_submit', func);
							setTimeout(function () {
								if (!submitFlag) {
									dataFieldBind.off('ev_model_before_submit', func);
									viewObj.hideLoading();
								}
							}, 0);
						}
					},
					argsInterface: null
				}
			},
			cell: {
				ev_view_change: {
					fn: function (e, ev_msg, viewObj) {
						e.stopPropagation();
						switch (ev_msg.type) {
							case 'value':
								if (viewObj.column.widgetName === 'switch') {
									switchHandler(viewObj);
								}
								this._responseViewValueChanges(ev_msg.value, viewObj);
								break;
							case 'valid':
								this.validate();
								break;
							case 'record':
								if (this.dataObj) {
									this.setValue(ev_msg.value);
									this.dataObj.record();
								}
								break;
						}

						function switchHandler(viewObj) {
							var gridView = viewObj.settings.objs.grid;
							var storeBind = gridView.dataBind[0];
							var switchView = viewObj.dom().find('[widget=switch]').data('viewObj');
							var settings = viewObj.column.settings;
							var trueValue = settings.trueValue;
							var falseValue = settings.falseValue;
							var syncFlag = false;
							switchView.showLoading(ev_msg.value === trueValue ? 'on' : 'off');
							var func = function (e, ev, store) {
								syncFlag = true;
								storeBind.one('ev_store_sync_complete', function (e) {
									if (storeBind.isDirty()) {
										storeBind.reset();
									}
									switchView.hideLoading();
								});
							};
							storeBind.one('ev_store_before_sync', func);
							setTimeout(function () {
								if (!syncFlag) {
									storeBind.off('ev_store_before_sync', func);
									switchView.hideLoading();
								}
							}, 0);
						}
					}
				}
			}
		};
		for (var item in viewEventMap) {
			if (item != 'defaults') {
				viewEventMap[item] = $.extend(true, {}, viewEventMap.defaults, viewEventMap[item]);
			}
		}

		var dataEventMap = {
			// value_change: {
			// 	fn: function(e, newV, oldV){
			// 		if(newV == oldV){
			// 			this.setValue(newV);
			// 		}
			// 	},
			// 	argsInterface: null
			// },
			ev_data_change: {
				fn: function (e, ev_msg) {
					switch (ev_msg.type) {
						case '_value':
							this.setNormal();
							this._responseDataValueChange(ev_msg.value.value, ev_msg.value.oldValue);
							break;
						case 'valid':
							if (ev_msg.value === true) {
								this.setNormal();
							} else {
								this.setError(ev_msg.value);
							}
							this.fireEvent('ev_valid_change', [ev_msg.value]);
							break;
					}
				}
			},
			ev_model_before_submit: {
				fn: function (e, ev, model) {
					this.trigger('ev_model_before_submit', [ev, model]);
				}
			}
			// validate_change: {
			// 	fn: function(){},
			// 	argsInterface: null
			// }
		};

		var DataFieldBind = function (dataObj, viewObjs) {
			$.su.DataBind.call(this, dataObj, viewObjs);
			this.addListener(dataFieldBindListeners);
		};

		$.su.inherit($.su.DataBind, DataFieldBind);

		DataFieldBind.argsTransMap = argsTransMap;
		DataFieldBind.viewEventMap = viewEventMap;
		DataFieldBind.dataEventMap = dataEventMap;

		var createDataBindFn = function (name) {
			return function () {
				var argsTrans = DataFieldBind.argsTransMap[name];
				var ret;

				if (this.viewObjs && this.viewObjs.length > 0) {
					for (var i in this.viewObjs) {
						var viewObj = this.viewObjs[i];
						var type = viewObj._type;

						if (viewObj[name]) {
							var re = viewObj[name].apply(viewObj, argsTrans && argsTrans[type] ? argsTrans[type](arguments) : arguments);
							ret = re === undefined ? ret : re;
						}
					}
				}
				if (this.dataObj && this.dataObj[name]) {
					var re = this.dataObj[name].apply(this.dataObj, argsTrans && argsTrans['dataObj'] ? argsTrans['dataObj'](arguments) : arguments);
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
						if (!DataFieldBind.prototype[i]) {
							DataFieldBind.prototype[i] = createDataBindFn(i);
						}
					}
				}
			}
		}

		for (var item in $.su.DataField.prototype) {
			if (typeof $.su.DataField.prototype[item] == 'function') {
				if (!DataFieldBind.prototype[item]) {
					DataFieldBind.prototype[item] = createDataBindFn(item);
				}
			}
		}

		DataFieldBind.prototype.setValue = function (value) {
			var dataObj = this.dataObj;
			if (!dataObj) {
				this._syncDataValue(value);
			} else {
				// if(!$.su.valueEqual(this.dataObj.getValue(), value)){
				this.dataObj.setValue(value);
				// }
			}

			return;
		};

		DataFieldBind.prototype.getName = function () {
			if (this.dataObj && this.dataObj.name) {
				return this.dataObj.name;
			}
		};

		DataFieldBind.prototype._responseViewValueChanges = function (value, viewObj) {
			if (!this.dataObj) {
				return;
			}
			if (!$.su.valueEqual(value, this.dataObj.getValue())) {
				this.dataObj.setValue(value); //this will  lead to other viewObj's sync.
			}
		};

		DataFieldBind.prototype._responseDataValueChange = function (value, oldValue) {
			if (!$.su.valueEqual(value, oldValue)) {
				if (this._syncDataValue(value) === false) {
					return;
				}
				this.fireEvent('ev_value_change', [value, oldValue]);
			} else {
				var viewObjsLength = this.viewObjs.length;
				if (viewObjsLength === 0) {
					this.fireEvent('ev_value_change', [value, oldValue]);
				} else {
					for (var i = 0; i < viewObjsLength; i++) {
						var viewObj = this.viewObjs[i];
						for (var j = 0; j < viewObj.dataBind.length; j++) {
							var otherDataBind = viewObj.dataBind[j];
							if (otherDataBind instanceof $.su.DataFieldBind) {
								viewObj.dataBind[j].fireEvent('ev_value_change', [value, oldValue]);
							}
						}
					}
				}
			}
		};

		DataFieldBind.prototype._syncDataValue = function (value) {
			for (var i = 0; i < this.viewObjs.length; i++) {
				var viewObj = this.viewObjs[i];
				if (viewObj.setValue) {
					if (viewObj.getValue) {
						if (!$.su.valueEqual(viewObj.getValue(), value)) {
							viewObj.setValue(value);
						}
					} else {
						viewObj.setValue(value);
					}
				}

				//the value may be changed by logic such as 'defaultValue', no need to continue
				if (this.dataObj && !$.su.valueEqual(this.dataObj.getValue(), value)) {
					return false;
				}

				for (var j = 0; j < viewObj.dataBind.length; j++) {
					var otherDataBind = viewObj.dataBind[j];
					if (
						otherDataBind !== this &&
						otherDataBind instanceof $.su.DataFieldBind &&
						otherDataBind.getValue &&
						!$.su.valueEqual(otherDataBind.getValue(), value)
					) {
						// !!viewObj.dataBind[j].dataObj && viewObj.dataBind[j].dataObj.setValue(value);
						viewObj.dataBind[j].setValue(value);
					}
				}
			}
		};

		DataFieldBind.prototype.bindDataObj = function (dataObj) {
			DataFieldBind.superclass.bindDataObj.call(this, dataObj);
			this.syncView();
		};

		DataFieldBind.prototype.bindViewObj = function (viewObj) {
			DataFieldBind.superclass.bindViewObj.call(this, viewObj);
			this.syncView();
		};

		DataFieldBind.prototype.syncView = function () {
			this.fireEvent('sync');
		};
		return DataFieldBind;
	})();
})(jQuery);
