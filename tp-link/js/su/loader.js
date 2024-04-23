/*
 * @description load class or other defined object by retaining a name--path map,
 *      define this class because there is an increasing number of object need to be loaded dynamically,
 *      TODO: collate some methods of @class Router which are more suitable here
 *      TODO: fail handler?
 * @author KYJ
 * @change
 *   2018/02/06: create file
 *   2018/03/07: discard the file content when all callbacks has been called, reload it next time.
 *
 * */
(function ($) {
	$.su.Loader = (function () {
		var Loader = function () {
			$.su.Observable.call(this);
			this._map = {};

			this._fileLoading = [];
			// this._fileLoaded = [];

			this._fileLoadedHandlerMap = {};
			this._loadedFileDataMap = {};

			this.addListener('ev_file_loaded', function (e, filePath) {
				var handlerArray = this._fileLoadedHandlerMap[filePath];
				while (handlerArray && handlerArray.length) {
					// calls to refreshQueue may re-enter triggerReady
					// so we cannot necessarily iterate the readyListeners array
					handlerArray.shift()(this._loadedFileDataMap[filePath]);
				}
				delete this._fileLoadedHandlerMap[filePath];
				delete this._loadedFileDataMap[filePath];
			});
		};

		$.su.inherit($.su.Observable, Loader);

		/*
		 * @method setPath: set and store the map of object define by the format of 'name--path'
		 * */
		Loader.prototype.setPath = function (pathMap) {
			for (var item in pathMap) {
				if (pathMap.hasOwnProperty(item)) {
					this._map[item] = pathMap[item];
				}
			}
		};

		Loader.prototype.has = function (name) {
			return !!this._map[name];
		};

		/*
		 * load by name
		 * */
		Loader.prototype.load = function (name, option) {
			var path = this._map[name];
			if (!path) {
				return false;
			} else {
				_loadFile.call(this, path, option);
			}
		};

		/*
		 * @method loadScript: method of loading script file planned by @class Loader
		 * @param {string} file: path of the file
		 * @param {function} success: success callback
		 *
		 * */
		Loader.prototype.loadScript = function (file, callback) {
			_loadFile.call(this, file, {
				type: 'script',
				success: callback
			});
		};

		Loader.prototype.loadFile = function (file, callback) {
			_loadFile.call(this, file, {
				success: callback
			});
		};

		var _registerCallbackFn = function (filePath, callback) {
			if (this._fileLoadedHandlerMap[filePath]) {
				this._fileLoadedHandlerMap[filePath].push(callback);
			} else {
				this._fileLoadedHandlerMap[filePath] = [callback];
			}
		};

		/*
		 * @method   _loadFile: basic method of loadding file planned by @class Loader
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
				successCallback = option.success;
				failCallback = option.fail;
			}

			// if($.inArray(file, this._fileLoaded) >= 0 ){
			// 	!!successCallback && successCallback(this._loadedFileDataMap[file]);
			// }else

			if ($.inArray(file, this._fileLoading) >= 0) {
				!!successCallback && _registerCallbackFn.call(me, file, successCallback);
			} else {
				!!successCallback && _registerCallbackFn.call(me, file, successCallback);

				if (!option.type && file.match(/\.json/)) {
					option.type = 'json';
				}
				loadMethod(file, null, null, option.type)
					.done(function (data) {
						var index = $.inArray(file, me._fileLoading);
						me._fileLoading.splice(index, 1);
						// me._fileLoaded.push(file);
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

		return Loader;
	})();
})(jQuery);
