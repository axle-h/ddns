// JavaScript Document
(function ($) {
	$.su.Router = (function () {
		var Router = function () {
			$.su.Observable.call(this);

			this.routerList = {};
			this.modelsMap = {};
			this.helpMap = {};

			this._fileLoading = [];
			this._fileLoaded = [];

			this._fileLoadedHandlerMap = {};
			this._loadedFileDataMap = {};

			this.addListener('ev_file_loaded', function (e, filePath) {
				var handlerArray = this._fileLoadedHandlerMap[filePath];

				while (handlerArray && handlerArray.length) {
					// calls to refreshQueue may re-enter triggerReady
					// so we cannot necessarily iterate the readyListeners array
					handlerArray.shift()(this._loadedFileDataMap[filePath]);
				}
			});
		};
		$.su.inherit($.su.Observable, Router);

		var _registerCallbackFn = function (filePath, callback) {
			if (this._fileLoadedHandlerMap[filePath]) {
				this._fileLoadedHandlerMap[filePath].push(callback);
			} else {
				this._fileLoadedHandlerMap[filePath] = [callback];
			}
		};

		/*
		 * @method   _loadFile: basic method of loadding file planned by @class Router
		 * @private
		 * @param {string} file: path of the file
		 * @param {object} option: setting of loading detail
		 *
		 * */
		var _loadFile = function (file, option) {
			var me = this;

			var successCallback;
			var failCallback;
			var loadMethod = $.get; //change to $.getScript if the file's option declare the type is 'script'

			if (option) {
				if (option.type === 'script') {
					loadMethod = $.getScript;
				}
				successCallback = option.success;
				failCallback = option.fail;
			}

			if ($.inArray(file, this._fileLoaded) >= 0) {
				!!successCallback && successCallback(this._loadedFileDataMap[file]);
			} else if ($.inArray(file, this._fileLoading) >= 0) {
				!!successCallback && _registerCallbackFn.call(me, file, successCallback);
			} else {
				!!successCallback && _registerCallbackFn.call(me, file, successCallback);

				loadMethod(file)
					.done(function (data) {
						var index = $.inArray(file, me._fileLoading);
						me._fileLoading.splice(index, 1);
						me._fileLoaded.push(file);
						if (loadMethod === $.get) {
							me._loadedFileDataMap[file] = data;
						}
						me.fireEvent('ev_file_loaded', [file]);
					})
					.fail(function (jqxhr, settings, exception) {
						!!failCallback && failCallback();
						$.su.debug.error('load file error: ', file, '\n', exception);
					});
				this._fileLoading.push(file);
			}
		};

		/*
		 * @method loadFile: method of loadding ordinary file planned by @class Router
		 * @param {string} file: path of the file
		 * @param {function} success: success callback
		 *
		 * */
		Router.prototype.loadFile = function (file, callback) {
			var dfd = $.Deferred();
			_loadFile.call(this, file, {
				success: function (data) {
					!!callback && callback(data);
					dfd.resolve(data);
				}
			});
			return dfd.promise();
		};

		/*
		 * @method loadScript: method of loadding script file planned by @class Router
		 * @param {string} file: path of the file
		 * @param {function} success: success callback
		 *
		 * */
		Router.prototype.loadScript = function (file, callback) {
			var dfd = $.Deferred();
			_loadFile.call(this, file, {
				type: 'script',
				success: function (data) {
					!!callback && callback(data);
					dfd.resolve(data);
				}
			});
			return dfd.promise();
		};

		Router.prototype.set = function (list) {
			var list = list;
			if ($.isEmptyObject(list)) {
				return;
			}
			$.each(list, function (module, obj) {
				if (typeof obj.controller === 'string') {
					obj.controller = {
						_default: obj.controller
					};
				}
				if (typeof obj.view === 'string') {
					obj.view = {
						_default: obj.view
					};
				}
			});
			this.routerList = list;
		};

		Router.prototype.setItem = function (name, option) {
			if (this.routerList[name]) {
				$.extend(true, this.routerList[name], option);
			} else {
				this.routerList[name] = option;
			}
			if (typeof this.routerList[name].controller === 'string') {
				this.routerList[name].controller = {
					_default: this.routerList[name].controller
				};
			}
			if (typeof this.routerList[name].view === 'string') {
				this.routerList[name].view = {
					_default: this.routerList[name].view
				};
			}
		};

		Router.prototype.query = function (name) {
			return this.routerList[name];
		};

		Router.prototype.loadController = function (arg1, arg2, arg3) {
			var name = arg1;
			var controller;
			var callback;
			if (typeof arg2 === 'function') {
				callback = arg2;
			} else {
				controller = arg2;
				callback = arg3;
			}
			var routerObj = this.routerList[name];

			if (!controller) {
				this.loadFile.call(this, routerObj.controller._default, callback);
			} else {
				if (routerObj.controller[controller]) {
					this.loadFile.call(this, routerObj.controller[controller], callback);
				}
			}
		};
		Router.prototype.loadView = function (arg1, arg2, arg3) {
			var name = arg1;
			var view;
			var callback;
			if (typeof arg2 === 'function') {
				callback = arg2;
			} else {
				view = arg2;
				callback = arg3;
			}
			var routerObj = this.routerList[name];

			if (!view || !routerObj.view[view]) {
				this.loadFile.call(this, routerObj.view._default, callback);
			} else {
				if (routerObj.view[view]) {
					this.loadFile.call(this, routerObj.view[view], callback);
				}
			}
		};

		Router.prototype.setModelsPath = function (modelsPathMap) {
			for (var item in modelsPathMap) {
				if (modelsPathMap.hasOwnProperty(item)) {
					this.modelsMap[item] = modelsPathMap[item];
				}
			}
		};

		Router.prototype.loadModel = function (name, callback) {
			var me = this;
			if (!this.modelsMap[name]) {
				throw new Error('Model "' + name + '" has not declare file path');
			} else {
				this.loadFile.call(this, this.modelsMap[name], callback);
			}
		};

		Router.prototype.setHelpPath = function (helpMap) {
			for (var item in helpMap) {
				if (helpMap.hasOwnProperty(item)) {
					this.helpMap[item] = helpMap[item];
				}
			}
		};

		Router.prototype.loadHelp = function (name, callback) {
			var path;
			if (this.helpMap[name]) {
				path = this.helpMap[name];
			} else {
				// var textName = name.replace(/[A-Z]/g, function(l){
				//     return '_'+l;
				// });
				path = {
					struct: name + '.html',
					name: name
				};
			}

			$.get('./help/' + path.struct, function (data) {
				callback(path.name, data);
			});
		};
		return Router;
	})();
})(jQuery);
