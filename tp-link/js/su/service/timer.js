/*
 * @service Timer
 * */
(function ($) {
	$.su = $.su || {};
	$.su.Services = $.su.Services || {};
	$.su.Services.Timer = (function () {
		var Timer = function () {
			if (typeof Timer.instance === 'object') {
				return Timer.instance;
			}
			var me = this;
			this.name = 'timer';
			$.su.Service.call(this);
			Timer.instance = this;
			this._timerMap = {};
			this.defaultTimeout = 1000;
		};

		$.su.inherit($.su.Service, Timer);

		/**
		 * inner function
		 * @param {*} module
		 * @param {*} fn
		 * @param {*} timeout
		 * @param {*} immediate only for interval, whether executing function at once
		 * @param {*} type interval or timeout
		 */
		Timer.prototype.setTimer = function (module, fn, timeout, immediate, type) {
			var me = this;
			if ($.type(immediate) === 'string') {
				type = immediate;
				immediate = undefined;
			}
			if (!(module instanceof $.su.Module) || $.type(fn) !== 'function' || (type !== 'interval' && type !== 'timeout')) {
				$.su.debug.log('Error arguments.');
				return;
			}
			var moduleName = module.name;
			if (!this._timerMap[moduleName]) {
				this._timerMap[moduleName] = [];
			}
			// clear timer if module is not available
			if (module.status !== 'available' && module.status !== 'running') {
				this.clearAll(module);
				return;
			}
			// clear timer after destroy module
			var destroyHandler = function () {
				me.clearAll(module);
			};
			if (!this._timerMap[moduleName].destroyHandler) {
				this._timerMap[moduleName].destroyHandler = destroyHandler;
				module.one('ev_before_destroy', destroyHandler);
			}

			// clear timer that were created in the same but previous module
			for (var i = this._timerMap[moduleName].length - 1; i >= 0; i--) {
				var item = this._timerMap[moduleName][i];
				clearTimer = item.type === 'interval' ? clearInterval : clearTimeout;
				if (item.moduleId !== module.id) {
					clearTimer(item.timerId);
					this._timerMap[moduleName].splice(i, 1);
				}
			}

			if (type === 'interval') {
				setTimer = setInterval;
				clearTimer = clearInterval;
				immediate && fn();
			} else {
				setTimer = setTimeout;
				clearTimer = clearTimeout;
			}
			var func = function () {
				if (module.status !== 'available' && module.status !== 'running') {
					me.clearAll(module);
				} else {
					fn();
				}
			};
			var timerId = setTimer(func, timeout);
			this._timerMap[moduleName].push({
				timerId: timerId,
				moduleId: module.id,
				fn: func,
				type: type
			});
			return timerId;
		};

		/**
		 * executing function at regular time
		 * @param {*} module instance of $.su.Module
		 * @param {*} fn function to be executed
		 * @param {*} timeout executing period, ms
		 * @param {*} immediate whether executing function at once
		 */
		Timer.prototype.setInterval = function (module, fn, timeout, immediate) {
			return this.setTimer(module, fn, timeout, immediate, 'interval');
		};

		/**
		 * executing function after a certain time
		 * @param {*} module instance of $.su.Module
		 * @param {*} fn function to be executed
		 * @param {*} timeout executing delay, ms
		 */
		Timer.prototype.setTimeout = function (module, fn, timeout) {
			return this.setTimer(module, fn, timeout, 'timeout');
		};

		/**
		 * getting timer by id of timer
		 * @param {*} module
		 * @param {*} timerId
		 */
		Timer.prototype.get = function (module, timerId) {
			var moduleName = module.name;
			if (!this._timerMap[moduleName]) {
				return;
			}
			var result;
			$.each(this._timerMap[moduleName], function (i, item) {
				if (timerId === item.timerId) {
					result = { item: item, index: i };
					return;
				}
			});
			return result;
		};

		/**
		 * clear timer by id of timer
		 * @param {*} module
		 * @param {*} timerId same as return value of window.setInterval(setTimeout)
		 */
		Timer.prototype.clearTimer = function (module, timerId) {
			var moduleName = module.name;
			if (!this._timerMap[moduleName]) {
				return;
			}
			var result = this.get(module, timerId);

			if (!result) {
				return;
			}
			var item = result.item;
			var index = result.index;
			var clearTimer = item.type === 'interval' ? clearInterval : clearTimeout;
			this._timerMap[moduleName].splice(index, 1);
			clearTimer(timerId);
		};
		Timer.prototype.clearTimeout = Timer.prototype.clearTimer;
		Timer.prototype.clearInterval = Timer.prototype.clearTimer;

		/**
		 * clear all timers created in specific module
		 * @param {*} module
		 * @param {*} timerId same as return value of window.setInterval(setTimeout)
		 */
		Timer.prototype.clearAll = function (module) {
			var moduleName = module.name;
			var timerLen = this._timerMap[moduleName].length;
			if (!this._timerMap[moduleName] || !timerLen) {
				return;
			}
			for (var i = 0; i < timerLen; i++) {
				var clearTimer = this._timerMap[moduleName][i].type === 'interval' ? clearInterval : clearTimeout;
				clearTimer(this._timerMap[moduleName][i].timerId);
			}
			module.off('ev_before_destroy', this._timerMap[moduleName].destroyHandler);
			this._timerMap[moduleName].length = 0;
			this._timerMap[moduleName].destroyHandler = null;
		};
		return Timer;
	})();
})(jQuery);
