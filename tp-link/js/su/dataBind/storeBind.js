(function ($) {
	$.su = $.su || {};
	$.su.StoreBind = (function () {
		var StoreBindListeners = {
			sync: function (e) {
				if (!this.dataObj) {
					return;
				}
				var keyArr = this.dataObj.getAllKeys();
				for (var i = 0, len = this.viewObjs.length; i < len; i++) {
					!!this.viewObjs[i].syncData && this.viewObjs[i].syncData(keyArr);
				}

				//tmp code
				var data = this.getStoreData();
				if (this.loadItems) {
					this.loadItems(data);
				}

				if (this.renderTree) {
					this.renderTree(data);
				}

				for (var i = 0, len = this.viewObjs.length; i < len; i++) {
					this.viewObjs[i].dom().triggerHandler('ev_store_bound');
				}
				//tmp code end
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

		//tmp fn for compatibility
		var _getModelBindFromWidget = function (viewObj) {
			if (viewObj._type == 'popEditor') {
				var form = viewObj.containerMsg.dom().find('div[widget=form]');
				if (form.length > 0) {
					return viewObj.containerMsg.dom().find('div[widget=form]').eq(0).data('viewObj').dataBind[0];
				}
			}
			return false;
		};

		var viewEventMap = {
			defaults: {
				ev_grid_edit: {
					fn: function (e, key, grid) {
						var editor = grid.getPlugin('editor');
						var editorModelBind = _getModelBindFromWidget(editor);

						if (editorModelBind) {
							if (key != 'add') {
								var modelBind = this.getSubModelBindByKey(key);
								var modelData = modelBind.getData();
								editorModelBind.loadData(modelData, true); //key will be replaced
							} else {
								var newModel = this.dataObj.createModel();
								this.addModelBind.modelBind = new $.su.ModelBind(newModel);
								editorModelBind.loadData(newModel.getData(), true);
								this.addModelBind.key = this.dataObj.getModelKey(newModel);
							}
							editorModelBind.setNormal();
						} else {
							var newModel = this.dataObj.createModel();
							this.addModelBind.modelBind = new $.su.ModelBind(newModel);
							this.addModelBind.modelBind.bindViewObj(editor);
							if (key != 'add') {
								var modelBind = this.getSubModelBindByKey(key);
								var modelData = modelBind.getData();
								this.addModelBind.modelBind.dataObj.loadData(modelData); //key will be replaced
								this.addModelBind.key = key;
							} else {
								//if some data change event no triggered, add loadData here
								this.addModelBind.modelBind.dataObj.loadData(newModel.getData());
								this.addModelBind.key = this.dataObj.getModelKey(newModel);
							}
						}

						this.trigger('ev_before_add', [this.addModelBind.modelBind, this]);
					},
					argsInterface: null
				},
				ev_grid_cancel: {
					fn: function (e, editingId, grid) {
						var editor = grid.getPlugin('editor');
						var editorModelBind = _getModelBindFromWidget(editor);
						if (editorModelBind) {
							editorModelBind.reset();
						} else {
							this.addModelBind.modelBind.reset();
							this.addModelBind.modelBind.unbindViewObj(editor);
							this.addModelBind.key = null;
							this.addModelBind.modelBind = null;
						}

						return;
					}
				},
				ev_grid_save: {
					fn: function (e, ev, editingId, grid) {
						var editor = grid.getPlugin('editor');
						var editorModelBind = _getModelBindFromWidget(editor);

						if (editorModelBind) {
							this.trigger('ev_before_save', [editorModelBind, this]);

							var validateResult = editorModelBind.dataObj.validate({ returnDetail: true });
							if (validateResult.result !== true) {
								this.trigger('ev_editor_validator_fail', [validateResult.field]);
								ev.preventDefault();
								return;
							}

							var conflictName = this.dataObj.dataConflict(editorModelBind.dataObj, editingId);
							if (conflictName) {
								this.trigger('ev_editor_data_conflict_fail', [editorModelBind, conflictName]);
								ev.preventDefault();
								return;
							}

							if (editingId != 'add') {
								var modelBind = this.getSubModelBindByKey(editingId);
								modelBind.replaceData(editorModelBind.modelSerialize(editorModelBind.getData())); //auto record?
							} else {
								if (this.addModelBind.key) {
									this.addModelBind.modelBind.replaceData(editorModelBind.modelSerialize(editorModelBind.getData()));
									// this.addModelBind.modelBind.record();
									this.dataObj.insertModel(this.addModelBind.modelBind.dataObj);
								}
							}
						} else {
							var editorModelBind = this.addModelBind.modelBind;
							this.trigger('ev_before_save', [editorModelBind, this]);
							var validateResult = editorModelBind.dataObj.validate({ returnDetail: true });
							if (validateResult.result !== true) {
								this.trigger('ev_editor_validator_fail', [validateResult.field]);
								ev.preventDefault();
								return;
							}

							var conflictName = this.dataObj.dataConflict(editorModelBind.dataObj, editingId);
							if (conflictName) {
								this.trigger('ev_editor_data_conflict_fail', [editorModelBind, conflictName]);
								ev.preventDefault();
								return;
							}

							if (editingId != 'add') {
								var modelBind = this.getSubModelBindByKey(editingId);
								modelBind.loadData(editorModelBind.getData()); //auto record?
								editorModelBind.unbindViewObj(editor); //released when start edit next time
							} else {
								if (this.addModelBind.key) {
									this.addModelBind.modelBind.unbindViewObj(editor);
									this.addModelBind.modelBind.record();
									this.dataObj.insertModel(this.addModelBind.modelBind.dataObj);
								}
							}
						}

						this.addModelBind.key = null;
						this.addModelBind.modelBind = null;
						if (this.dataObj.autoSync !== false) {
							var defaultEvent = $.su.getDefaultEvent(this, this.sync);
							this.trigger('ev_before_sync', [defaultEvent.ev, this.dataObj.proxy]);
							defaultEvent.exe();
						}
						return;
					}
				},
				ev_grid_delete: {
					fn: function (e, keys, grid) {
						this.dataObj.removeDataByKey(keys);
						var defaultEvent = $.su.getDefaultEvent(this, this.sync);
						this.trigger('ev_before_sync', [defaultEvent.ev, this.dataObj.proxy, keys]);

						defaultEvent.exe();
					}
				},
				ev_grid_delete_all: {
					fn: function (e) {
						var keys = this.dataObj.getAllKeys();
						this.dataObj.removeDataByKey(keys);
						var defaultEvent = $.su.getDefaultEvent(this, this.sync, {
							deleteAll: true
						});
						this.trigger('ev_before_delete_all', [defaultEvent.ev, this.dataObj.proxy]);
						defaultEvent.exe();
					}
				},
				ev_grid_row_selected: {
					fn: function (e, key) {
						this.dataObj.selectByKey(key);
					}
				},
				ev_grid_row_unselected: {
					fn: function (e, key) {
						this.dataObj.unselectByKey(key);
					}
				},
				ev_grid_row_selected_all: {
					fn: function (e, key) {
						this.dataObj.selectAll();
					}
				},
				ev_grid_row_unselected_all: {
					fn: function (e, key) {
						this.dataObj.unselectAll();
					}
				},
				ev_grid_filter: {
					fn: function (e, filters, append, columns) {
						this.dataObj.filter({
							filters: filters,
							append: append,
							columns: columns
						});
					}
				},
				ev_store_render_items: {
					fn: function (e, keyArr, viewObj) {
						if (!this.dataObj) {
							return;
						}
						var key = this.dataObj.keyProperty;
						var modelBindsTmpArr = []; //make it quicker to find modelBind while binding
						var models = [];
						for (var i = 0; i < keyArr.length; i++) {
							var modelBind = this.getSubModelBindByKey(keyArr[i]);
							models.push(modelBind.dataObj);
							modelBindsTmpArr.push(modelBind);
						}
						viewObj.renderModels(key, models, function (items) {
							var len = items.length;
							var len1 = modelBindsTmpArr.length; //should equal to 'len'
							for (var i = 0; i < len; i++) {
								var keyTarget = items[i].key;
								var itemViewObj = items[i].obj;
								var j = 0;

								for (; j < len1; j++) {
									var modelBind = modelBindsTmpArr[j];
									if (modelBind.dataObj.getField(key).getValue() === keyTarget) {
										modelBind.bindViewObj(itemViewObj);
										break;
									}
									throw new Error('store render item return unknown key');
								}
								modelBindsTmpArr.splice(j, 1);
								len1 = len1 - 1;
							}
						});
					}
				},
				ev_store_before_sync: {
					fn: function (e) {
						this.trigger('ev_store_before_sync');
					}
				},
				ev_store_sync_complete: {
					fn: function (e) {
						this.trigger('ev_store_sync_complete', [].slice.call(arguments, 1));
					}
				}
			},
			form: {},
			folderTree: {
				ev_folder_tree_open: {
					fn: function (e, param, cb) {
						this.dataObj.fetchChildren(param, cb);
					}
				},
				ev_folder_tree_close: {
					fn: function (e, data, cb) {
						cb();
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
			ev_loaded: {
				fn: function (e) {
					var store = this.dataObj;
					this.unbindDataObj();
					for (var i = 0; i < this.viewObjs.length; i++) {
						var viewObj = this.viewObjs[i];
						switch (viewObj._type) {
							case 'grid':
								var dom = viewObj.dom();
								dom.data('oldMinHeight', dom.css('min-height'));
								dom.css('min-height', dom.outerHeight() + 'px'); // to keep scrollTop by setting min-height to gird
								viewObj.remove(null, false); //do not update paging
								break;
							case 'repeat':
								viewObj.remove(null, false);
								break;
							case 'folderTree':
								if (viewObj._children.length) {
									this.bindDataObj(store, false);
									return;
								}
								break;
						}
					}
					this.bindDataObj(store);
					this.fireEvent('ev_loaded');
					this.fireEvent('ev_storedata_loaded');

					for (var i = 0; i < this.viewObjs.length; i++) {
						var viewObj = this.viewObjs[i];
						switch (viewObj._type) {
							case 'grid':
								var dom = viewObj.dom();
								dom.css('min-height', dom.data('oldMinHeight'));
								break;
						}
					}
				},
				argsInterface: null
			},
			ev_model_deleted: {
				fn: function (e, keyArr) {
					var i = 0;
					var key, modelBind;
					for (; i < keyArr.length; i++) {
						key = keyArr[i];

						var pos = this.getSubModelBindIndex(key);
						this.subModelsBinds[pos].unbind();
						this.subModelsBinds.splice(pos, 1);
						delete this._convertedkeyMap[this._convertKey(key)];

						for (var j = 0; j < this.viewObjs.length; j++) {
							var viewObj = this.viewObjs[j];
							if (viewObj._type === 'information') {
								viewObj.remove(key);
							}
							if (viewObj._type === 'grid') {
								viewObj.deleteItem(key);
							}
							if (viewObj._type === 'repeat') {
								viewObj.remove(key);
							}
						}
					}
				}
			},
			ev_model_inserted: {
				fn: function (e, pos) {
					pos = pos === undefined ? 0 : pos;
					var viewObj;
					var newKey = this.dataObj.getKeyByIndex(pos);
					var newModelBind = new $.su.ModelBind(this.dataObj.getModelByIndex(pos));
					this.subModelsBinds.splice(pos, 0, newModelBind);
					this._convertedkeyMap[this._convertKey(newKey)] = newModelBind;

					for (var i = 0; i < this.viewObjs.length; i++) {
						viewObj = this.viewObjs[i];
						if (viewObj._type !== 'grid') {
							continue;
						}

						viewObj.addItem(newKey);
						viewObj.moveItem(newKey, pos);
					}
				}
			},
			ev_store_item_moved: {
				fn: function (e, key, index, originalIndex) {
					var item = this.subModelsBinds.splice(originalIndex, 1);
					this.subModelsBinds.splice(index, 0, item[0]);

					var viewObj;
					for (var i = 0; i < this.viewObjs.length; i++) {
						viewObj = this.viewObjs[i];
						viewObj.moveItem(key, index);
					}
				}
			},
			ev_store_sync_success: {
				fn: function (e, result) {
					this.fireEvent('ev_store_sync_success', [result]);
				}
			},
			ev_store_sync_error: {
				fn: function (e, errorCode) {
					$.su.raise({
						msg: 'ev_store_submit_error',
						type: 'store_submit_error',

						errorCode: errorCode,
						storeBind: this
					});
					return;
				},
				argsInterface: null
			},
			ev_store_ajax_error: {
				fn: function (e, status, xhr) {
					$.su.raise({
						msg: 'ev_store_ajax_error',
						type: 'store_ajax_error',

						ajaxErrorStatus: status,
						ajaxErrorXhr: xhr,
						storeBind: this
					});
					return;
				},
				argsInterface: null
			},
			ev_data_change: {
				fn: function (e, msg, dataField, model, store) {
					var key = this.getModelKey(model);
					var modelBind = this.getSubModelBindByKey(key);
					var dataFieldBind = modelBind[dataField.name];
					this.trigger('ev_data_change', [msg.value, dataFieldBind, modelBind, this]);
				},
				argsInterface: null
			},
			ev_store_before_sync: {
				fn: function (e, ev) {
					this.trigger('ev_store_before_sync', [ev]);
				}
			},
			ev_store_sync_complete: {
				fn: function (e) {
					this.trigger('ev_store_sync_complete', [].slice.call(arguments, 1));
				}
			},
			ev_render_tree: {
				fn: function (e) {
					var store = this.dataObj;
					this.unbindDataObj();
					for (var i = 0; i < this.viewObjs.length; i++) {
						var viewObj = this.viewObjs[i];
						if (viewObj._type === 'folderTree') {
							if (viewObj._children.length) {
								viewObj.clearTree();
							}
						}
					}
					this.bindDataObj(store);
					this.fireEvent('ev_loaded');
					this.fireEvent('ev_storedata_loaded');
				},
				argsInterface: null
			},
			ev_store_data_load_success: {
				fn: function (e, data, others) {
					for (var i = 0; i < this.viewObjs.length; i++) {
						var viewObj = this.viewObjs[i];
						if (viewObj._type === 'grid' && $.type(others.maxRules) === 'number') {
							this.setMaxRules(others.maxRules);
						}
					}
				}
			},
			ev_store_select_change: {
				fn: function (e, data) {
					for (var i = 0; i < this.viewObjs.length; i++) {
						var viewObj = this.viewObjs[i];
						if (viewObj._type === 'grid') {
							data.select && data.select.length > 0 && viewObj.setSelected(data.select);
							data.unselect && data.unselect.length > 0 && viewObj.setUnselected(data.unselect);
						}
					}
				}
			}
		};

		var StoreBind = function (dataObj, viewObj) {
			this.subModelsBinds = [];
			this.addModelBind = {
				key: null,
				modelBind: null
			};

			//convert and store the key-address relationship by string, so that the modelBind can be
			//	found from this map quickly, instead of traverse an array.
			//	this logic should be realized in @class Store, and only 'converted key' be dealed in the
			//	SU frame, including StoreBind and grid widget.
			//	left to be refactored.
			this._convertedkeyMap = {};

			$.su.DataBind.call(this, dataObj, viewObj);
			this.addListener(StoreBindListeners);
		};

		$.su.inherit($.su.DataBind, StoreBind);

		StoreBind.argsTransMap = argsTransMap;
		StoreBind.viewEventMap = viewEventMap;
		StoreBind.dataEventMap = dataEventMap;

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
				var argsTrans = StoreBind.argsTransMap[name];
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
						if (!StoreBind.prototype[i]) {
							StoreBind.prototype[i] = createDataBindFn(i);
						}
					}
				}
			}
		}

		for (var item in $.su.Store.prototype) {
			if (typeof $.su.Store.prototype[item] == 'function') {
				if (!StoreBind.prototype[item]) {
					StoreBind.prototype[item] = createDataBindFn(item);
				}
			}
		}

		StoreBind.prototype.bindDataObj = function (dataObj, syncFlag) {
			StoreBind.superclass.bindDataObj.call(this, dataObj);
			this.createSubBinds();

			// if(this.viewObjs){
			// 	for(var i=0; i<this.viewObjs.length; i++){
			// 		this.syncSubViewBinds(this.viewObjs[i]);
			// 	}
			// }
			if (syncFlag == false) return;
			if (syncFlag == undefined) this.syncView();
		};

		StoreBind.prototype.createSubBinds = function () {
			this.subModelsBinds = [];
			var store = this.dataObj;
			var length = store.getSize();
			for (var i = 0; i < length; i++) {
				var model = store.getModelByIndex(i);
				var key = this.getModelKey(model);
				var modelBind = new $.su.ModelBind(model);
				this.subModelsBinds.push(modelBind);
				this._convertedkeyMap[this._convertKey(key)] = modelBind;
			}
		};

		StoreBind.prototype.syncSubViewBinds = function (viewObj) {
			var bind = this;
			//if is viewObj grid
			if (viewObj._type === 'grid') {
				viewObj.remove();

				viewObj.loadGridData(this.dataObj.keyProperty, this.dataObj.data, function () {
					var rows = viewObj.getRows();
					for (var i = 0; i < bind.subModelsBinds.length; i++) {
						var key = bind.dataObj.getKeyByIndex(i);
						var subModelBind = bind.subModelsBinds[i];
						var row = rows[i];
						subModelBind.bindViewObj(row);
					}
				});
			}
		};

		StoreBind.prototype.syncSubViewUnbinds = function (viewObj) {
			//if is viewObj grid
			var viewDomEffective = viewObj.dom().length === 0 ? false : true;
			if (viewObj._type === 'grid') {
				var rows = viewObj.getRow();
				var editor = viewObj.getPlugin('editor');
				var length = rows.length;
				for (var i = 0; i < length; i++) {
					var childViewObj = rows[i].obj;
					var key = childViewObj.key;
					var childDataBind = this.getSubModelBindByKey(key);
					if (childDataBind && childDataBind.viewIsBinded(childViewObj)) {
						childDataBind.unbindViewObj(childViewObj);
					}
				}

				if (viewDomEffective) {
					viewObj.remove();
				}

				if (this.addModelBind && this.addModelBind.modelBind && this.addModelBind.modelBind.viewIsBinded(editor)) {
					this.addModelBind.modelBind.unbindViewObj(editor);
				}
			}
		};

		// single viewObj
		StoreBind.prototype.bindViewObj = function (viewObj) {
			StoreBind.superclass.bindViewObj.call(this, viewObj);
			this.syncView();
		};

		StoreBind.prototype.getSubModelBindByKey = function (key) {
			return this._convertedkeyMap[this._convertKey(key)];
		};

		StoreBind.prototype.getModelByKey = StoreBind.prototype.getSubModelBindByKey;

		StoreBind.prototype.getSubModelBindByIndex = function (index) {
			return this.subModelsBinds[index];
		};

		StoreBind.prototype.getModelByIndex = StoreBind.prototype.getSubModelBindByIndex;

		StoreBind.prototype.getSubModelBindIndex = function (key) {
			var modelBind = this._convertedkeyMap[this._convertKey(key)];
			return $.inArray(modelBind, this.subModelsBinds);
		};

		StoreBind.prototype.getModelIndex = function (model) {
			return $.inArray(model, this.subModelsBinds);
		};

		StoreBind.prototype.getModelKey = function (model) {
			var key = this.dataObj.keyProperty;
			return model[key].getValue();
		};

		StoreBind.prototype.getEditingModel = function () {
			return this.addModelBind.modelBind;
		};

		StoreBind.prototype.each = function (dealear) {
			for (var i = 0; i < this.subModelsBinds.length; i++) {
				var modelBind = this.subModelsBinds[i];
				dealear(modelBind);
			}
		};

		StoreBind.prototype.setField = function (field, dealear) {
			for (var i = 0; i < this.subModelsBinds.length; i++) {
				var modelBind = this.subModelsBinds[i];
				var dataFieldBind = modelBind[field];
				dealear(dataFieldBind, modelBind);
			}
		};

		StoreBind.prototype.unbindDataObj = function () {
			for (var i = 0; i < this.subModelsBinds.length; i++) {
				this.subModelsBinds[i].unbind();
			}
			this.subModelsBinds = [];
			this._convertedkeyMap = {};
			StoreBind.superclass.unbindDataObj.call(this);
		};
		StoreBind.prototype.unbindViewObj = function (viewObj) {
			this.syncSubViewUnbinds(viewObj);
			// syncSubViewUnbinds
			StoreBind.superclass.unbindViewObj.call(this, viewObj);
		};
		StoreBind.prototype.syncView = function () {
			this.fireEvent('sync');
		};
		StoreBind.prototype.getSubModelBindByModel = function (model) {
			for (var i = 0; i < this.subModelsBinds.length; i++) {
				if (this.subModelsBinds[i].dataObj === model) {
					return this.subModelsBinds[i];
				}
			}
			return false;
		};

		StoreBind.prototype._convertKey = function (key) {
			return $.type(key) + '_' + key;
		};

		StoreBind.prototype._getOriginalKey = function (convertedkey) {
			//now only "string" and "number" considered, whose length are both 6.
			//update this logic if not satisfied.
			var type = convertedkey.slice(0, 6);
			var keyString = convertedkey.slice(7);

			return type === 'number' ? Number(keyString) : keyString;
		};

		return StoreBind;
	})();
})(jQuery);
