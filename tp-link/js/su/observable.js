(function ($) {
	$.su = $.su || {};
	$.su.Observable = (function () {
		var Observable = function () {
			this.eventDealer = {
				eventInfo: {}
			};
		};

		Observable.prototype.addListener = function (ename, fn, scope, options) {
			var me = this;

			if (typeof ename !== 'string') {
				options = ename;
				for (ename in options) {
					if (options.hasOwnProperty(ename)) {
						var config = options[ename];
						// test name
						me.addListener(ename, config.fn || config, config.scope || options.scope, config.fn ? config : options);
					}
				}
			} else {
				scope = scope || me;
				// Allow listeners: { click: 'onClick', scope: myObject }
				if (typeof fn === 'string') {
					//<debug>
					if (!(scope[fn] || me[fn])) {
						throw new Error('No method named "' + fn + '"');
					}
					//</debug>
					fn = scope[fn] || me[fn];
				}

				// store the event and dealer relationMap
				if (me.eventDealer.eventInfo[ename]) {
					me.eventDealer.eventInfo[ename].push({
						fn: fn,
						scope: scope
					});
				} else {
					me.eventDealer.eventInfo[ename] = [
						{
							fn: fn,
							scope: scope
						}
					];
				}
			}
		};

		Observable.prototype.removeListener = function (ename, fn, scope, options) {
			var me = this;

			if (typeof ename !== 'string') {
				options = ename;
				for (ename in options) {
					if (options.hasOwnProperty(ename)) {
						var config = options[ename];
						me.removeListener(ename, config.fn || config, config.scope || options.scope, config.fn ? config : options);
					}
				}
			} else {
				scope = scope || me;
				// Allow listeners: { click: 'onClick', scope: myObject }
				if (typeof fn === 'string') {
					//<debug>
					if (!(scope[fn] || me[fn])) {
						throw new Error('No method named "' + fn + '"');
					}
					//</debug>
					fn = scope[fn] || me[fn];
				}

				// store the event and dealer relationMap
				if (me.eventDealer.eventInfo[ename]) {
					for (var i = me.eventDealer.eventInfo[ename].length - 1; i >= 0; i--) {
						var obj = me.eventDealer.eventInfo[ename][i];
						if (obj.fn == fn && obj.scope == scope) {
							// remove info from the map
							me.eventDealer.eventInfo[ename].splice(i, 1);
						}
					}
				} else {
					return false;
				}
			}
		};

		// 触发一次后解绑，该方法需要完善
		Observable.prototype.one = function (eventName, fn, scope) {
			var me = this;
			scope = scope || me;

			// 保存该事件及其响应方法
			if (me.eventDealer.eventInfo[eventName]) {
				me.eventDealer.eventInfo[eventName].push({
					fn: fn,
					scope: scope,
					once: true
				});
			} else {
				me.eventDealer.eventInfo[eventName] = [
					{
						fn: fn,
						scope: scope,
						once: true
					}
				];
			}
		};

		Observable.prototype.fireEvent = function (eventName, msg) {
			var me = this;
			if (!me.eventDealer) {
				return false;
			}
			var dealers = me.eventDealer.eventInfo[eventName];
			if (!dealers) {
				return false;
			}

			var fireList = dealers.slice(0);
			var args = [fireList].concat(msg);
			args[0].type = eventName;
			for (var i = 0; i < fireList.length; i++) {
				fireList[i].fn.apply(fireList[i].scope, args);
				if (fireList[i].once) {
					me.removeListener(eventName, fireList[i].fn, fireList[i].scope);
				}
			}
			return true;
		};
		Observable.prototype.clearListeners = function () {
			this.eventDealer.eventInfo = {};
		};
		Observable.prototype.destroy = function () {
			this.clearListeners();
			delete this.eventDealer;
		};

		Observable.prototype.trigger = Observable.prototype.fireEvent;
		Observable.prototype.on = Observable.prototype.addListener;
		Observable.prototype.off = Observable.prototype.removeListener;
		return Observable;
	})();
})(jQuery);
