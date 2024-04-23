// JavaScript Document
(function ($) {
	$.su.Store = function (options) {
		var defaults = {
			fields: null,
			model: null,
			xtype: 'store',
			autoLoad: false,
			autoReload: false,
			tag: 'store',
			global: false,
			keyProperty: 'key',
			updateMode: 'operation', //"complete"
			keyLength: 0,
			filters: [],
			data: [],
			convert: null, //将从proxy得到的数据进行转化
			serialize: null, //提交数据前将store的数据进行转化,
			preventSuccessEvent: false,
			preventFailEvent: false,
			preventErrorEvent: false
		};

		var me = this;
		var settings = $.extend(true, {}, defaults, options);

		$.su.Observable.call(this);

		if (settings.fields) {
			var foundFlag = false;
			for (var i = 0; i < settings.fields.length; i++) {
				if (settings.fields[i].name == settings.keyProperty) {
					foundFlag = true;
					break;
				}
			}
			if (!foundFlag) {
				settings.fields.push({ name: settings.keyProperty, mapping: settings.keyProperty });
			}
		}

		if (settings.proxy) {
			var manager = $.su.ClassManager.getInstance();
			var proxyClass;
			if ($.type(settings.proxy) === 'string') {
				proxyClass = manager.get(options.proxy);
				if (!proxyClass) {
					$.su.debug.error('Model proxy class not found: ' + settings.proxy);
				}
				settings.proxy = proxyClass.create ? proxyClass.create() : new proxyClass();
			} else if (!settings.proxy.isProxy) {
				var proxyOpt = $.extend(
					true,
					{
						triggerEvent: true
					},
					settings.proxy
				);
				proxyClass = manager.get($.su.settings.Store.defaultProxy);
				settings.proxy = proxyClass.create ? proxyClass.create(proxyOpt) : new proxyClass(proxyOpt);
			}

			settings.proxy.addListener('ev_load', function (e, data, others) {
				me.loadData(data, true, others);
			});
		}

		if (!settings.fields || settings.fields.length === 0) {
			//console.error("Debug: without fields or fields error!");
			return null;
		}

		if (settings.global === true) {
			if (!settings.id) {
				//console.error("You are init a global store, so you have to set an id for it!");
				return null;
			}
		}

		this.id = settings.id || $.su.randomId('store');
		this.init(settings);
	};

	$.su.inherit($.su.Observable, $.su.Store);

	/*
	 * check if proxy option is a class name, and need to be import async by SUClass system
	 *
	 * */
	$.su.Store.checkProxyDep = function (proxy) {
		return $.type(proxy) == 'string';
	};

	$.su.Store.importProxyDep = function (name, callback) {
		return $.su.require(name, callback);
	};

	$.su.Store.prototype.init = function (config) {
		$.extend(this, config);
		this._name = config.name;
		this.data = [];
		this.snapshot = null;

		this.isStore = true;
		this.isSorted = false;

		if (config.data && config.data.length > 0) {
			this.loadData(config.data, true);
		}

		if (this.autoLoad === true) {
			this.load();
		}

		//初始化默认的事件监听，这里注释定义了传进去的参数个数
		//$(this).on("loads", function(e, store, records){});
		// $(this).on("ev_datachanged", function(e, store, records){
		// this.isSorted = false;
		// });

		// $.su.storeManager.add(this);
	};

	$.su.Store.prototype.getSize = function () {
		return this.data.length;
	};

	$.su.Store.prototype.getProxy = function () {
		return this.proxy;
	};

	$.su.Store.prototype.hasField = function (name) {
		var fields = this.fields;
		for (var i = 0; i < fields.length; i++) {
			if (fields[i].name === name) {
				return true;
			}
		}
		return false;
	};

	$.su.Store.prototype.storeConvert = function (data) {
		if (this.data.length > 0) {
			this.removeAllData();
		}

		this.data = [];
		this.dataMap = {};

		if (this.convert !== null) {
			data = this.convert(data);
		}

		if (!data || $.isEmptyObject(data)) {
			data = [];
		}
		if (!$.isArray(data)) {
			data = [data];
		}

		for (var obj in data) {
			if (data.hasOwnProperty(obj)) {
				var temp = this.createModel();
				if (data[obj][this.keyProperty] === undefined) {
					data[obj][this.keyProperty] = $.su.randomId('key');
				}

				var key = data[obj][this.keyProperty];
				data[obj] = temp.modelConvert(data[obj]);

				// this.data.push(temp);
				// this.insertModelNoEvent(temp, obj);
				// this.dataMap[key] = temp;
			}
		}

		return data;
	};

	$.su.Store.prototype.storeSerialize = function (data) {
		this.dataMap = this.dataMap || {};
		if (!data) {
			data = [];
		}
		if (!$.isArray(data)) {
			data = [data];
		}

		for (var obj in data) {
			if (data.hasOwnProperty(obj)) {
				var key = data[obj][this.keyProperty];
				var temp = this.dataMap[key];

				if (!temp) {
					temp = this.createModel();
				}

				data[obj] = temp.modelSerialize(data[obj]);
			}
		}

		if (this.serialize !== null) {
			data = this.serialize(data);
		}

		return data;
	};

	//无ajax操作
	$.su.Store.prototype.loadData = function (data, needConvert, others, _callback) {
		if (needConvert) {
			data = this.storeConvert(data);
		} else {
			this.data = [];
			this.dataMap = {};
		}
		others = others || {};
		this.filterBackupData = data;
		if (this.filters.length > 0) {
			this.filter({ filters: [] });
			return;
		}

		var length = data.length;
		for (var i = 0; i < length; i++) {
			var key = data[i][this.keyProperty];
			var temp;
			if (key === undefined || !this.dataMap[key]) {
				temp = this.createModel();
				if (key === undefined) {
					key = data[i][this.keyProperty] = $.su.randomId('key');
				}

				// this.data.push(temp);
				temp.loadData(data[i]);
				this.insertModelNoEvent(temp, i);
				this.dataMap[key] = temp;
			} else {
				temp = this.dataMap[key];
				temp.loadData(data[i]);
			}
		}

		this.record();
		this.trigger('ev_loaded');
		this.fireEvent('ev_store_data_load_success', [data, others]);

		if (_callback) {
			_callback.call(this, data);
		}

		return this;
	};

	//刷新表格数据，与loadData区别为，需要对比原数据选择删除或者添加条目，保存表格当前浏览位置
	$.su.Store.prototype.refreshData = function (data) {
		var isObjectPropsEqual = function (originalItem, newItem, keyProperty) {
			var keyTag;
			var newItemHasKeyFlag = !!newItem.hasOwnProperty(keyProperty);

			for (var key1 in originalItem) {
				if (originalItem.hasOwnProperty(key1) && (key1 !== keyProperty || newItemHasKeyFlag)) {
					keyTag = false;

					for (var key2 in newItem) {
						if (newItem.hasOwnProperty(key2)) {
							if (key1 === key2 && originalItem[key1] === newItem[key2]) {
								keyTag = true;
							} else {
								if ($.type(originalItem[key1]) === 'array' && $.type(newItem[key2]) === 'array') {
									keyTag = originalItem[key1].join(',') === newItem[key2].join(',');
								} else if ($.type(originalItem[key1]) === 'object' && $.type(newItem[key2]) === 'object') {
									keyTag = isObjectPropsEqual(originalItem[key1], newItem[key2]);
								}
							}
						}
					}

					if (keyTag === false) {
						break;
					}
				}
			}
			return keyTag;
		};

		var convertStoreData = function (store, data) {
			if (store.convert !== null) {
				data = store.convert(data);
			}

			if (!data) {
				data = [];
			}
			if (!$.isArray(data)) {
				data = [data];
			}
			var temp = store.createModel();

			for (var obj in data) {
				if (data.hasOwnProperty(obj)) {
					if (!data[obj][store.keyProperty]) {
						data[obj][store.keyProperty] = $.su.randomId('key');
					}
					data[obj] = temp.modelConvert(data[obj]);
				}
			}
			return data;
		};
		if (this.data.length === 0) {
			this.loadData(data, true);
		} else {
			data = convertStoreData(this, data); //为了进行对比，这一步不会添加上key,如果本来没有的话
			var length = data.length;
			var i, j;
			var newDataItem;
			var originalDataItem;
			var newModel;
			var key;
			for (i = 0; i < length; i++) {
				newDataItem = data[i];
				if (newDataItem.hasOwnProperty(this.keyProperty) && newDataItem[this.keyProperty] !== undefined && newDataItem[this.keyProperty] !== null) {
					key = newDataItem[this.keyProperty];
					originalDataItem = this.getModelByKey(key);
					if (originalDataItem) {
						if (!isObjectPropsEqual(originalDataItem.getData(), data[i], this.keyProperty)) {
							originalDataItem.loadData(data[i]);
						}
						this.moveModelPosition(key, i);
					} else {
						newModel = this.createModel();
						newModel.loadData(data[i]);
						this.insertModel(newModel);
						this.moveModelPosition(key, i);
					}
				} else {
					j = i;
					var matchedItemKey;
					if (j < this.data.length) {
						for (j = i; j < this.data.length; j++) {
							originalDataItem = this.data[j];
							if (isObjectPropsEqual(originalDataItem.getData(), data[i], this.keyProperty)) {
								matchedItemKey = originalDataItem.getField(this.keyProperty).getValue();
								break;
							}
						}
					}
					if (matchedItemKey) {
						this.moveModelPosition(matchedItemKey, i);
					} else {
						newModel = this.createModel();
						newModel.loadData(data[i]);
						this.insertModel(newModel);
						this.moveModelPosition(newModel.getField(this.keyProperty).getValue(), i);
					}
				}
			}
			if (this.data.length > data.length) {
				var keyArray = [];
				for (i = data.length; i < this.data.length; i++) {
					keyArray.push(this.data[i].getField(this.keyProperty).getValue());
				}
				this.data.splice(data.length, this.data.length - data.length);
				this.trigger('ev_model_deleted', [keyArray]);
			}
		}
	};

	$.su.Store.prototype.loadFilterData = function (data) {
		if (this.filters.length > 0) {
			data = this.runFilter($.su.clone(data));
		}

		this.data = [];
		this.dataMap = {};

		for (var obj in data) {
			if (data.hasOwnProperty(obj)) {
				var key = data[obj][this.keyProperty];
				var temp;
				if (!key || !this.dataMap[key]) {
					temp = this.createModel();
					if (!key) {
						key = data[obj][this.keyProperty] = $.su.randomId('key');
					}

					// this.data.push(temp);
					temp.loadData(data[obj]);
					this.insertModelNoEvent(temp, obj);
					this.dataMap[key] = temp;
				} else {
					temp = this.dataMap[key];
					temp.loadData(data[obj]);
				}
			}
		}

		this.record();
		this.trigger('ev_loaded');

		return this;
	};

	/**
	 * {
	 * 		filters: [{value, column, func}].
	 * 		append: true/false,
	 *		columns: []
	 * }
	 * @param settings
	 */
	$.su.Store.prototype.filter = function (settings, precise) {
		var filters = settings.filters;
		var append = settings.append;
		var columns = settings.columns;
		this.rendererMap = {};
		this.filterPrecise = precise ? true : false;

		if (!filters || filters.length === 0) {
			if (this.filters.length > 0) {
				this.filters = [];
				this.loadData(this.filterBackupData);
			}
			return;
		}

		filters = $.isArray(filters) ? filters : [filters];

		if (append) {
			this.filters = this.filters.concat(filters);
		} else {
			this.filters = filters;
		}

		if (columns) {
			for (var i = 0, len = columns.length; i < len; i++) {
				var name = columns[i].dataIndex;
				this.rendererMap[name] = columns[i].renderer;
			}
		}

		this.loadFilterData(this.filterBackupData);
	};

	$.su.Store.prototype.runFilter = function (data) {
		var that = this;

		for (var i = 0, len = this.filters.length; i < len; i++) {
			var filter = this.filters[i];
			if (filter.func) {
				for (var j = data.length - 1; j >= 0; j--) {
					if (!filter.func(data[j])) {
						data.splice(j, 1);
					}
				}
			} else if (filter.value !== undefined && filter.value !== null && filter.value !== '' && filter.column !== undefined) {
				filterColumnValue(filter.column, filter.value);
			}
		}

		function filterColumnValue(column, value) {
			if (that.filterPrecise) {
				for (var j = data.length - 1; j >= 0; j--) {
					var x = data[j][column];
					if (x === undefined) {
						var tag = false;
						for (var c in data[j]) {
							if (data[j].hasOwnProperty(c) && c !== that.keyProperty) {
								var text = data[j][c];
								if (text !== undefined && text === value) {
									tag = true;
									break;
								}
							}
						}
						if (tag === false) {
							data.splice(j, 1);
						}
					} else if (x !== value) {
						data.splice(j, 1);
					}
				}
			} else {
				for (var j = data.length - 1; j >= 0; j--) {
					var x = getColumnText(column, data[j][column], data[j]);
					if (x === undefined) {
						var tag = false;
						for (var c in data[j]) {
							if (data[j].hasOwnProperty(c) && c !== that.keyProperty) {
								var text = getColumnText(c, data[j][c], data[j]);
								if (text !== undefined && (text + '').search(new RegExp(value, 'i')) !== -1) {
									tag = true;
									break;
								}
							}
						}
						if (tag === false) {
							data.splice(j, 1);
						}
					} else if ($.type(value) === 'array') {
						if ($.inArray(data[j][column], value) === -1) {
							data.splice(j, 1);
						}
					} else if (x.toString().search(new RegExp(value, 'i')) === -1 && data[j][column].toString().search(new RegExp(value, 'i')) === -1) {
						data.splice(j, 1);
					}
				}
			}
		}

		function getColumnText(column, value, modelValue) {
			if (that.rendererMap[column] === undefined) {
				return '' + value;
			}
			return that.rendererMap[column](value, modelValue);
		}

		return data;
	};

	$.su.Store.prototype.record = function () {
		for (var i = 0, len = this.data.length; i < len; i++) {
			this.data[i].record();
		}
		this.snapshot = $.su.clone(this.getStoreData());
		return this;
	};

	$.su.Store.prototype.getDataByIndex = function (index) {
		var data = this.data;
		return data[index].getData();
	};

	$.su.Store.prototype.getModelByIndex = function (index) {
		var data = this.data;
		return data[index];
	};

	$.su.Store.prototype.getModelByKey = function (key) {
		var data = this.data;
		var index = this.getIndex(key);
		return data[index];
	};

	$.su.Store.prototype.getIndex = function (key) {
		//根据key值来返回index值，key属性由keyProperty定义，默认为key
		var data = this.data,
			keyProperty = this.keyProperty;

		if (key === undefined) {
			return undefined;
		}

		for (var index = 0, len = data.length; index < len; index++) {
			if (data[index].getField(keyProperty).val().toString() == key.toString()) {
				return index;
			}
		}

		return undefined;
	};

	$.su.Store.prototype.getKeyByIndex = function (index) {
		var data = this.data;
		var keyProperty = this.keyProperty;
		var d = data[index];

		return d.getField(keyProperty).val();
	};

	$.su.Store.prototype.getIndexs = function (keyArray) {
		//根据keyArray返回index的array
		var data = this.data,
			keyProperty = this.keyProperty;

		if (keyArray.length === 0) {
			return undefined;
		}

		var indexArray = '';
		for (var jndex = 0, jlen = keyArray.length; jndex < jlen; jndex++) {
			for (var index = 0, len = data.length; index < len; index++) {
				var key = keyArray[jndex];
				if (data[index].getField(keyProperty).val().toString() == key.toString()) {
					indexArray += index + ',';
					break;
				}
			}
		}
		if ('' !== indexArray) {
			return indexArray.substring(0, indexArray.length - 1);
		}
		return indexArray;
	};

	// $.su.Store.prototype.beforeInsert = function (storeData, items, option) {
	// 	var me = this;
	// 	var sendData = {};
	// 	for (var key in items) {
	// 		if (items.hasOwnProperty(key)) {
	// 			sendData[key] = me.storeSerialize(items[key].model)[0];
	// 		}
	// 	}
	//
	// 	return {
	// 		data: sendData,
	// 		params: {
	// 			option: 'add'
	// 		},
	// 		success: function (result) {
	// 			me.loadData(result.model, true);
	// 			me.fireEvent('ev_store_sync_success');
	// 		},
	// 		fail: function (data, errorCode, status, xhr) {
	// 			me.loadData(me.snapshot);
	// 			if (errorCode) {
	// 				me.trigger("ev_store_sync_error", errorCode);
	// 			}
	// 		},
	// 		error: function (status, xhr) {
	// 			me.loadData(me.snapshot);
	// 			me.trigger("ev_store_ajax_error", [status, xhr]);
	// 		}
	// 	};
	// };
	//
	// //带data是本地操作，无data是ajax操作
	// $.su.Store.prototype.insert = function (items, option, cb) {
	// 	var me = this;
	// 	if (!this.proxy || $.isEmptyObject(items)) {
	// 		!!cb && cb('insert');
	// 		return;
	// 	}
	// 	var storeData = this.getStoreData();
	//
	// 	var serttings = this.beforeInsert(storeData, items, option, cb);
	//
	// 	this.proxy.create(serttings);
	// };

	$.su.Store.prototype.beforeLoad = function (option) {
		var me = this;

		var preventSuccessEvent = option.preventSuccessEvent === undefined ? me.preventSuccessEvent : option.preventSuccessEvent;
		var preventFailEvent = option.preventFailEvent === undefined ? me.preventFailEvent : option.preventFailEvent;
		var preventErrorEvent = option.preventErrorEvent === undefined ? me.preventErrorEvent : option.preventErrorEvent;

		//默认事件在此层执行，proxy层不再执行
		option.preventSuccessEvent = true;
		option.preventFailEvent = true;
		option.preventErrorEvent = true;

		// if (!(option && option.ajax && option.ajax.type)){
		// 	option = option || {};
		// 	option.ajax = option.ajax || {};
		// 	option.ajax.type = 'POST';
		// 	option.ajax.contentType = 'application/x-www-form-urlencoded';
		// }
		// option.data = $.extend({}, {operation: "load"}, option.data);

		var failFn = option.fail;
		option.fail = function (data, errorCode, status, xhr) {
			!!failFn && failFn(data, errorCode, status, xhr);
			if (errorCode && !preventFailEvent) {
				me.trigger('ev_store_sync_error', errorCode);
			}
		};
		var errorFn = option.error;
		option.error = function (status, xhr) {
			!!errorFn && errorFn(status, xhr);
			if (!preventErrorEvent) {
				me.trigger('ev_store_ajax_error', [status, xhr]);
			}
		};
		return option;
	};

	/*
	 * @param option option of load
	 *   option.direction: sync from|to the server, default value is 'read'
	 *      'read' : from the server
	 *      'write': to the server
	 *
	 *  option.url
	 *  option.timeout
	 *  option.sync
	 *  option.ajax
	 *  option.success
	 *  option.fail
	 *  option.error
	 * */
	$.su.Store.prototype.load = function (option) {
		option = option || {};
		option = this.beforeLoad(option);

		var proxySyncOption = $.extend(
			true,
			{
				operation: 'read',
				dataObj: this
			},
			option
		);

		if (this.proxy) {
			this.proxy.sync(proxySyncOption);
		}
	};

	$.su.Store.prototype.beforeUpdate = function (storeData, items, option) {
		var me = this;
		var sendData = {};

		for (var key in items) {
			if (items.hasOwnProperty(key)) {
				sendData[key] = me.storeSerialize(items[key].model)[0];
			}
		}
		return {
			data: sendData,
			params: {
				option: 'edit'
			},
			success: function (result) {
				me.loadData(result.model, true);
				me.fireEvent('ev_store_sync_success');
			},
			fail: function (data, errorCode, status, xhr) {
				me.loadData(me.snapshot);
				if (errorCode) {
					me.trigger('ev_store_sync_error', errorCode);
				}
			},
			error: function (status, xhr) {
				me.loadData(me.snapshot);
				me.trigger('ev_store_ajax_error', [status, xhr]);
			}
		};
	};

	$.su.Store.prototype.update = function (items, option, cb) {
		var me = this;
		if (!this.proxy || $.isEmptyObject(items)) {
			!!cb && cb('update');
			return;
		}
		var storeData = this.getStoreData();

		// var copyItem = function(){};
		var settings = this.beforeUpdate(storeData, items, option, cb);
		this.proxy.update(settings);
	};

	$.su.Store.prototype.beforeRemove = function (storeData, items, option) {
		var me = this;
		var sendData = {};

		for (var key in items) {
			if (items.hasOwnProperty(key)) {
				sendData[key] = me.storeSerialize(items[key].oldModel)[0];
			}
		}

		return {
			data: sendData,
			params: {
				option: 'delete'
			},
			success: function (result, data) {
				me.loadData(result.model, true);
				me.fireEvent('ev_store_sync_success');
			},
			fail: function (data, errorCode, status, xhr) {
				me.loadData(me.snapshot);
				if (errorCode) {
					me.trigger('ev_store_sync_error', errorCode);
				}
			},
			error: function (status, xhr) {
				me.loadData(me.snapshot);
				me.trigger('ev_store_ajax_error', [status, xhr]);
			}
		};
	};

	$.su.Store.prototype.remove = function (items, option, cb) {
		//需要返回indexArray
		var me = this;
		if (!this.proxy || $.isEmptyObject(items)) {
			!!cb && cb('remove');
			return;
		}
		var storeData = this.getStoreData();

		var settings = this.beforeRemove(storeData, items, option, cb);
		this.proxy.remove(settings);
	};

	$.su.Store.prototype.removeDataByKey = function (keyArray, _callback) {
		var index, len;
		var keyProperty = this.keyProperty;

		if (!$.isArray(keyArray)) {
			keyArray = [keyArray];
		}

		var keyObj = {};
		for (index = 0, len = keyArray.length; index < len; index++) {
			keyObj[keyArray[index]] = true;
		}

		var data = this.data;
		var indexArray = [];
		for (index = 0, len = data.length; index < len; index++) {
			if (data[index].getField(keyProperty).val() in keyObj) {
				indexArray.push(index);
			}
		}

		this.removeDataByIndex(indexArray, function (keyArray, indexArray) {
			if (_callback) {
				_callback.call(this, keyArray, indexArray);
			}
		});
	};

	$.su.Store.prototype.moveModelPosition = function (key, index) {
		var originalIndex = this.getIndex(key);
		if (originalIndex === index) {
			return;
		}
		var item = this.data.splice(originalIndex, 1);
		this.data.splice(index, 0, item[0]);
		this.trigger('ev_store_item_moved', [key, index, originalIndex]);
	};

	$.su.Store.prototype.removeDataByIndex = function (indexArray, _callback) {
		var keyProperty = this.keyProperty,
			data = this.data;

		if (!$.isArray(indexArray)) {
			indexArray = [indexArray];
		}

		indexArray.sort(function (a, b) {
			return a - b;
		});

		//从后向前作删
		var keyArray = [];
		for (var index = indexArray.length - 1; index >= 0; index--) {
			var i = indexArray[index];
			if (isNaN(i)) {
				continue;
			}
			keyArray.push(data[i][keyProperty].getValue());
			data.splice(indexArray[index], 1);
		}

		if (_callback) {
			_callback.call(this, keyArray, indexArray);
		}

		this.trigger('ev_model_deleted', [keyArray, indexArray]);
		this.trigger('ev_datachanged', [this, this.getStoreData, 'removeData']);

		return this;
	};

	$.su.Store.prototype.removeAllData = function (_callback) {
		this.data = null;
		delete this.data;
		this.data = [];
		// this.snapshot = null;

		this.trigger('ev_removeAllData', [this]);
		this.trigger('ev_datachanged', [this, this.data, 'removeData']);
		return this;
	};

	$.su.Store.prototype.getStoreData = function () {
		return this.getData();
	};

	$.su.Store.prototype.getSelectedStoreData = function () {
		var i;
		var data = [];
		for (i = 0; i < this.data.length; i++) {
			if (this.data[i].selected) {
				data.push(this.data[i]);
			}
		}

		var dataLength = data.length;
		var dataResult = [];
		for (i = 0; i < dataLength; i++) {
			var temp = data[i].getData();
			dataResult.push(temp);
		}
		return dataResult;
	};

	$.su.Store.prototype.getSelectedData = function () {
		var i;
		var data = [];
		for (i = 0; i < this.data.length; i++) {
			if (this.data[i].selected) {
				data.push(this.data[i]);
			}
		}

		var dataLength = data.length;
		var dataResult = [];
		for (i = 0; i < dataLength; i++) {
			var temp = data[i].getData();

			dataResult.push(temp);
		}
		return dataResult;
	};
	$.su.Store.prototype.getSelectedDataKey = function (keyProperty) {
		var i;
		var data = [];
		for (i = 0; i < this.data.length; i++) {
			if (this.data[i].selected) {
				data.push(this.data[i]);
			}
		}

		var dataLength = data.length;
		var dataResult = [];
		for (i = 0; i < dataLength; i++) {
			var temp = data[i].getField(keyProperty || this.keyProperty).getValue();
			dataResult.push(temp);
		}
		return dataResult;
	};
	$.su.Store.prototype.getData = function (type) {
		var data = this.data,
			dataLength = data.length,
			dataResult = [];
		for (var i = 0; i < dataLength; i++) {
			var temp = data[i].getData(type);
			dataResult.push(temp);
		}
		return dataResult;
	};

	$.su.Store.prototype.insertModel = function (model, pos) {
		var me = this;
		pos = pos || 0;
		this.data.splice(pos, 0, model);
		this.trigger('ev_model_inserted', [pos]);
		model.on('ev_data_change', function (e, msg, dataField, model) {
			me.trigger('ev_data_change', [msg, dataField, model, me]);
		});
		return this;
	};

	$.su.Store.prototype.insertModelNoEvent = function (model, pos) {
		var me = this;
		pos = pos || 0;
		this.data.splice(pos, 0, model);
		model.on('ev_data_change', function (e, msg, dataField, model) {
			me.trigger('ev_data_change', [msg, dataField, model, me]);
		});
		return this;
	};

	$.su.Store.prototype.insertData = function (data, pos) {
		pos = pos || 0;
		var keyProperty = this.keyProperty;
		var newModel = this.createModel();
		if (data[keyProperty] === undefined) {
			data[keyProperty] = newModel.getField(keyProperty).getValue();
		}
		newModel.replaceData(data, true);
		this.insertModel(newModel, pos);
	};

	$.su.Store.prototype.generateModelKey = function () {
		return $.su.randomId(this.keyProperty);
	};

	$.su.Store.prototype.createModel = function () {
		var me = this;
		var options = { fields: this.fields };
		var newModel = new $.su.Model(options);
		newModel.getField(this.keyProperty).setValue(this.generateModelKey());
		return newModel;
	};

	$.su.Store.prototype.getModelKey = function (model) {
		var dataField = model.getField(this.keyProperty);
		return dataField ? dataField.getValue() : null;
	};

	/*
	 * @param {Object} option
	 * @param {Boolean} option.sync : whether to serialize the data, for syncing to the server
	 *
	 * */
	$.su.Store.prototype.checkDataChange = function (option) {
		var toSync = option && option.sync;
		var store = this;
		var getObjWithKey = function (arr) {
			var keyData = {};
			var keyMap = {};
			if (!arr) {
				return {
					data: keyData,
					map: keyMap
				};
			}
			for (var i = 0, len = arr.length; i < len; i++) {
				var key = arr[i][store.keyProperty];
				keyData[key] = $.extend({}, arr[i]);
				// delete keyData[key].key;
				keyMap[key] = false;
			}
			return {
				data: keyData,
				map: keyMap
			};
		};
		var isObjectPropsEqual = function (obj1, obj2) {
			var len1 = $.su.getObjectLength(obj1);
			var len2 = $.su.getObjectLength(obj2);
			var keyTag;

			for (var key1 in obj1) {
				if (obj1.hasOwnProperty(key1)) {
					keyTag = false;

					for (var key2 in obj2) {
						if (obj2.hasOwnProperty(key2)) {
							if (key1 === key2 && obj1[key1] === obj2[key2]) {
								keyTag = true;
							} else if (key1 === key2) {
								if (
									($.type(obj1[key1]) === 'array' && $.type(obj2[key2]) === 'array') ||
									($.type(obj1[key1]) === 'object' && $.type(obj2[key2]) === 'object')
								) {
									keyTag = JSON.stringify(obj1[key1]) === JSON.stringify(obj2[key2]);
								}
							}
						}
					}

					if (keyTag === false) {
						break;
					}
				}
			}
			return len1 === len2 ? keyTag : false;
		};

		var storeData = this.getStoreData();

		var data = getObjWithKey(toSync ? this.storeSerialize(storeData) : storeData);
		var snap = getObjWithKey(toSync ? this.storeSerialize(this.snapshot) : this.snapshot);

		var insert = {};
		var update = {};
		var remove = {};
		var index = 0;
		// 遍历新旧数据的keys,data与snap中共有的key被置为true,标记为修改的条目(或者没有变化)
		// data中为false的条目为新增条目,snap中为false的条目为删除条目。
		for (var key1 in data.map) {
			if (data.map.hasOwnProperty(key1)) {
				for (var key2 in snap.map) {
					if (snap.map.hasOwnProperty(key2)) {
						if (key1 === key2) {
							snap.map[key2] = true;
							data.map[key1] = true;
						}
					}
				}
			}
		}

		// 从当前数据中取出修改过和新增的数据
		index = 0;
		for (var key in data.map) {
			if (data.map.hasOwnProperty(key)) {
				if (data.map[key] && snap.map[key] && !isObjectPropsEqual(data.data[key], snap.data[key])) {
					update[key] = {
						index: index,
						model: data.data[key],
						oldModel: snap.data[key]
					};
				} else if (!data.map[key]) {
					insert[key] = {
						index: index,
						model: data.data[key]
					};
				}
				index++;
			}
		}
		// 从快照数据中取出删除的数据
		index = 0;
		for (var keySnap in snap.map) {
			if (snap.map.hasOwnProperty(keySnap)) {
				if (!snap.map[keySnap]) {
					remove[keySnap] = {
						index: index,
						oldModel: snap.data[keySnap]
					};
				}
				index++;
			}
		}

		return {
			insert: insert,
			update: update,
			remove: remove
		};
	};

	$.su.Store.prototype.beforeSync = function (option) {
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
		option.success = function (result) {
			me.trigger('ev_store_sync_success', [result]);
			me.trigger('ev_store_sync_complete', ['success', result]);
			successCallback && successCallback(result);
			if (autoReload !== false) {
				me.load();
			}
			if (preventSuccessEvent !== true && option.operation != 'read') {
				$.su.moduleManager.query('main').showNotice($.su.CHAR.COMMON.SAVED);
			}
		};

		var failCallback = option.fail;
		option.fail = function (data, errorCode, status, xhr) {
			failCallback && failCallback(data, errorCode, status, xhr);
			if (errorCode && !preventFailEvent) {
				me.trigger('ev_store_sync_error', errorCode);
			}
			me.trigger('ev_store_sync_complete', ['fail', errorCode]);
			if (autoReload !== false) {
				me.load();
			}
		};

		var errorCallback = option.error;
		option.error = function (status, xhr) {
			errorCallback && errorCallback(status, xhr);
			if (!preventErrorEvent) {
				me.trigger('ev_store_ajax_error', [status, xhr]);
			}
			me.trigger('ev_store_sync_complete', ['error', status, xhr]);
		};

		var defaultHandler = $.su.getDefaultEvent(this, function () {});
		this.trigger('ev_store_before_sync', [defaultHandler.ev]);
		if (!defaultHandler.exe()) {
			return (option = null);
		}

		return option;
	};

	$.su.Store.prototype.afterSync = function () {};

	/*
	 * @param option option of sync
	 *   option.direction: sync from|to the server, default value is 'write'
	 *      'read' : from the server
	 *      'write': to the server
	 *
	 *  option.url
	 *  option.timeout
	 *  option.sync
	 *  option.ajax
	 *  option.success
	 *  option.fail
	 *  option.error
	 * */
	$.su.Store.prototype.sync = function (option) {
		option = option || {};
		option = this.beforeSync(option);
		if ($.type(option) !== 'object') {
			return null;
		}
		var argumentsCopy = Array.prototype.slice.call(arguments, 0);

		var proxySyncOption = $.extend(true, {}, option);

		proxySyncOption.difference = this.checkDataChange({ sync: true });
		proxySyncOption.operation = proxySyncOption.operation || 'write';
		proxySyncOption.dataObj = this;

		argumentsCopy[0] = proxySyncOption;
		if (this.proxy) {
			this.proxy.sync.apply(this.proxy, argumentsCopy);
		}
	};
	$.su.Store.prototype.abort = function () {
		this.proxy.abort.apply(this.proxy);
	};
	$.su.Store.prototype.isDirty = function () {
		var compareResult = this.checkDataChange();
		return !($.isEmptyObject(compareResult.insert) && $.isEmptyObject(compareResult.update) && $.isEmptyObject(compareResult.remove));
	};

	//从model的备份恢复，而非snapshot
	$.su.Store.prototype.reset = function () {
		for (var i = 0, len = this.data.length; i < len; i++) {
			// this.fields[i].reset();
			this.data[i].reset();
		}
		return this;
	};

	$.su.Store.prototype.selectByKey = function (key) {
		var model,
			toSelectKeys = [];
		key = $.isArray(key) ? key : [key];

		for (var i = 0, len = key.length; i < len; i++) {
			model = this.getModelByKey(key[i]);
			if (model && !model.selected) {
				toSelectKeys.push(key[i]);
				model.selected = true;
			}
		}
		this.trigger('ev_store_select_change', [{ select: toSelectKeys }]);
	};

	$.su.Store.prototype.selectAll = function () {
		var toSelectKeys = [];
		for (var i = 0, len = this.data.length; i < len; i++) {
			if (!this.data[i].selected) {
				toSelectKeys.push(this.getKeyByIndex(i));
				this.data[i].selected = true;
			}
		}
		this.trigger('ev_store_select_change', [{ select: toSelectKeys }]);
		return this;
	};

	$.su.Store.prototype.unselectAll = function () {
		var toUnselectKeys = [];
		for (var i = 0, len = this.data.length; i < len; i++) {
			if (this.data[i].selected) {
				toUnselectKeys.push(this.getKeyByIndex(i));
				this.data[i].selected = false;
			}
		}
		this.trigger('ev_store_select_change', [{ unselect: toUnselectKeys }]);
		return this;
	};

	$.su.Store.prototype.unselectByKey = function (key) {
		var model,
			toUnselectKeys = [];
		key = $.isArray(key) ? key : [key];

		for (var i = 0, len = key.length; i < len; i++) {
			model = this.getModelByKey(key[i]);
			if (model && model.selected) {
				toUnselectKeys.push(key[i]);
				model.selected = false;
			}
		}
		this.trigger('ev_store_select_change', [{ unselect: toUnselectKeys }]);
	};

	$.su.Store.prototype.syncSelectedData = function () {
		var store = this;
		var getObjWithKey = function (arr) {
			var keyData = {};
			var keyMap = {};
			if (!arr) {
				return {
					data: keyData,
					map: keyMap
				};
			}
			for (var i = 0, len = arr.length; i < len; i++) {
				var key = arr[i][store.keyProperty];
				keyData[key] = $.extend({}, arr[i]);
				// delete keyData[key].key;
				keyMap[key] = false;
			}
			return {
				data: keyData,
				map: keyMap
			};
		};
		var isObjectPropsEqual = function (obj1, obj2) {
			var len1 = $.su.getObjectLength(obj1);
			var len2 = $.su.getObjectLength(obj2);
			var keyTag;

			for (var key1 in obj1) {
				if (obj1.hasOwnProperty(key1)) {
					keyTag = false;

					for (var key2 in obj2) {
						if (obj2.hasOwnProperty(key2)) {
							if (key1 === key2 && obj1[key1] === obj2[key2]) {
								keyTag = true;
							}
						}
					}

					if (keyTag === false) {
						break;
					}
				}
			}
			return len1 === len2 ? keyTag : false;
		};

		var data = getObjWithKey(this.getSelectedData());
		var snap = getObjWithKey(this.snapshot);
		var update = {};

		// 遍历新旧数据的keys,data与snap中共有的key被置为true,标记为修改的条目(或者没有变化)
		// data中为false的条目为新增条目,snap中为false的条目为删除条目。
		for (var key1 in data.map) {
			if (data.map.hasOwnProperty(key1)) {
				for (var key2 in snap.map) {
					if (snap.map.hasOwnProperty(key2)) {
						if (key1 === key2) {
							snap.map[key2] = true;
							data.map[key1] = true;
						}
					}
				}
			}
		}

		// 从当前数据中取出修改过和新增的数据
		for (var key in data.map) {
			if (data.map.hasOwnProperty(key)) {
				if (data.map[key] && snap.map[key] && !isObjectPropsEqual(data.data[key], snap.data[key])) {
					update[key] = {
						model: data.data[key],
						oldModel: snap.data[key]
					};
				}
			}
		}

		this.update(update);
	};

	$.su.Store.prototype.getAllKeys = function () {
		var key = this.keyProperty;
		var data = this.data;
		var dataLength = data.length;
		var ret = [];
		for (var i = 0; i < dataLength; i++) {
			ret.push(data[i].getField(key).getValue());
		}
		return ret;
	};

	$.su.Store.prototype.setConvert = function (fn) {
		this.convert = fn;
	};
	/**
	 * 检测传入model的key是否与当前条目有冲突
	 * @param model
	 */
	$.su.Store.prototype.keyConflict = function (model) {
		var keyNew;
		if (model instanceof $.su.Model) {
			keyNew = model[this.keyProperty].getValue();
		} else {
			keyNew = model[this.keyProperty];
		}
		return {
			conflict: this.getIndex(keyNew) !== undefined,
			keyNew: keyNew
		};
	};
	/**
	 * 需要往store插入model前，可调用该方法对新model进行检测，看conflictFields中属性是否重复
	 * @param model 需要检测的model
	 * @param editingId model的id值
	 * @returns {*} 如果冲突，返回冲突的name，否则返回false
	 */
	$.su.Store.prototype.dataConflict = function (model, editingId) {
		if (!this.conflictFields || this.conflictFields.length == 0) {
			return false;
		}
		var modelData;
		if (model instanceof $.su.Model) {
			modelData = model.getData();
		} else {
			modelData = modelData;
		}
		var storeData = this.getData();
		var conflictFields = this.conflictFields;
		var keyProperty = this.keyProperty;
		for (var i = 0; i < storeData.length; i++) {
			var tmpItem = storeData[i];
			for (var j = 0; j < conflictFields.length; j++) {
				var name = conflictFields[j].name;
				if (tmpItem[name] == modelData[name]) {
					if (editingId && tmpItem[keyProperty] == editingId) {
						continue;
					} else {
						return name;
					}
				}
			}
		}
		return false;
	};

	/***tree***/
	$.su.Store.prototype.fetchChildren = function (param, callback) {
		this.load({
			operation: 'read',
			dataObj: this,
			data: param,
			success: function (data) {
				callback(data);
			}
		});
		return this;
	};
	//无ajax操作
	$.su.Store.prototype.loadTreeData = function (data) {
		this.data = [];
		this.dataMap = {};

		this.filterBackupData = data;
		if (this.filters.length > 0) {
			this.filter({ filters: [] });
			return;
		}

		var length = data.length;
		for (var i = 0; i < length; i++) {
			var key = data[i][this.keyProperty];
			var temp;
			if (key === undefined || !this.dataMap[key]) {
				temp = this.createModel();
				if (key === undefined) {
					key = data[i][this.keyProperty] = $.su.randomId('key');
				}
				// temp.loadData(data[i]);
				temp.loadData($.su.escapeHtmlForObject(data[i]));
				this.insertModelNoEvent(temp, i);
				this.dataMap[key] = temp;
			} else {
				temp = this.dataMap[key];
				// temp.loadData(data[i]);
				temp.loadData($.su.escapeHtmlForObject(data[i]));
			}
		}

		this.record();
		this.trigger('ev_render_tree');
		return this;
	};
})(jQuery);
