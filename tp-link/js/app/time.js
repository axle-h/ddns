(function ($) {
	$.su.Time = (function () {
		var defaults = {
			format: 'MM/dd/yyyy HH:mm:ss',
			defaultTime: '01/01/1990 00:00:00',
			proxy: 'timeServiceProxy'
		};
		var timeInterval = null;
		var record = null;
		var initDeferred = $.Deferred();
		var Time = function (options) {
			if (typeof Time.instance === 'object') {
				return Time.instance;
			}
			var me = this;
			clearInterval(timeInterval);
			this.settings = $.extend({}, defaults, options);
			this.name = 'time';
			$.su.Service.call(this);
			Time.instance = this;
			this.init();
		};

		$.su.inherit($.su.Service, Time);
		Time.prototype.init = function () {
			var me = this;
			this.currentTime = null;
			this.hour24Enable = null;

			if (!this.proxy) {
				// a hack, to ensure execute relevant methods after init
				this.proxy = {
					read: function () {
						var args = [].slice.call(arguments, 0);
						initDeferred.then(function () {
							me.proxy.read.apply(me.proxy, args);
						});
					}
				};
			}

			$.su.require([this.settings.proxy]).done(function () {
				me.proxy = $.su.createSync(me.settings.proxy);
				initDeferred.resolve();
				me.sync();
			});
		};
		Time.prototype.addListener = function (ename, fn, scope, options) {
			this.constructor.superclass.on.call(this, ename, fn, scope, options);
			this.addListenerHandler(ename);
		};
		Time.prototype.removeListener = function (ename, fn, scope, options) {
			this.constructor.superclass.off.call(this, ename, fn, scope, options);
			this.removeListenerHandler(ename);
		};
		Time.prototype.fireEvent = function (eventName) {
			var msg = '';
			switch (eventName) {
				case 'on_time_change':
					msg = this.currentTime;
					break;
				case 'on_hour24_change':
					msg = this.hour24Enable;
					break;
				default:
					break;
			}
			this.constructor.superclass.trigger.call(this, eventName, msg);
		};
		/**
		 * 订阅处理
		 * @param {String} type
		 */
		Time.prototype.addListenerHandler = function (type) {
			if (!this.eventDealer.eventInfo[type]) {
				return;
			}
			var me = this;
			switch (type) {
				case 'on_time_change':
					this.sync(function () {
						me.updateTime();
					});
					break;
				case 'on_hour24_change':
					this.sync();
					break;
				default:
					break;
			}
		};

		/**
		 * 取消订阅处理
		 * @param {String} type
		 */
		Time.prototype.removeListenerHandler = function (type) {
			var eventInfo = this.eventDealer.eventInfo;
			if (!eventInfo[type]) {
				return;
			}
			switch (type) {
				case 'on_time_change':
					if (eventInfo[type].length === 0) {
						this.stopUpdateTime();
					}
					break;
				default:
					break;
			}
		};
		/**
		 * 从后台获取时间
		 * @param {Function} callback
		 */
		Time.prototype.sync = function (callback) {
			var me = this;
			if (this.isBusy) {
				!!callback && callback(me.currentTime);
				return;
			}
			this.isBusy = true;
			this.proxy.read({
				success: function (data) {
					me.setHour24(data.hour24Enable === 'on');
					me.setTime(me.convert(data.date + ' ' + data.time));
					me.isBusy = false;
					!!callback && callback(me.currentTime);
				},
				fail: function () {
					me.setHour24(true);
					me.setTime(new Date());
					me.isBusy = false;
					!!callback && callback(me.currentTime);
				},
				error: function () {
					me.setHour24(true);
					me.setTime(new Date());
					me.isBusy = false;
					!!callback && callback(me.currentTime);
				}
			});
		};
		Time.prototype.getTime = function () {
			var me = this;
			if (this.currentTime === null) {
				this.proxy.read({
					ajax: {
						async: false
					},
					success: function (data) {
						me.setTime(me.convert(data.date + ' ' + data.time));
					},
					fail: function () {
						me.setTime(new Date());
					},
					error: function () {
						me.setTime(new Date());
					}
				});
			}
			return this.currentTime;
		};
		Time.prototype.setTime = function (dateTime) {
			if ($.type(dateTime) !== 'date') {
				return;
			}
			this.currentTime = dateTime;
			this.fireEvent('on_time_change');
		};
		Time.prototype.getHour24 = function (enable) {
			var me = this;
			if (this.hour24Enable === null) {
				this.proxy.read({
					ajax: {
						async: false
					},
					success: function (data) {
						me.setHour24(data.hour24Enable === 'on');
					},
					fail: function (data) {
						me.setHour24(true);
					},
					error: function (data) {
						me.setHour24(true);
					}
				});
			}
			return this.hour24Enable;
		};
		Time.prototype.setHour24 = function (enable) {
			this.hour24Enable = !!enable;
			this.fireEvent('on_hour24_change');
		};
		Time.prototype.updateTime = function () {
			var me = this;
			clearInterval(timeInterval);
			record = new Date();
			timeInterval = setInterval(function () {
				var current = new Date();
				var timeChange = current.getTime() - record.getTime();
				record = current;
				me.setTime(new Date(me.currentTime.getTime() + timeChange));
			}, 1000);
		};
		Time.prototype.stopUpdateTime = function () {
			clearInterval(timeInterval);
			timeInterval = null;
		};
		/**
		 * 时间字符串转化成date对象
		 * @param {string format of time} stringTime
		 * @param {String, format of time input} format
		 */
		Time.prototype.convert = function (stringTime, format) {
			stringTime = stringTime || this.settings.defaultTime;
			format = format || this.settings.format;
			var pattern = {
				'y+': 'year',
				'M+': 'month',
				'd+': 'day',
				'H+': 'hour',
				'm+': 'minute',
				's+': 'second'
			};
			var result = {};
			for (var key in pattern) {
				var reg = new RegExp(key);
				var match = reg.exec(format);
				result[pattern[key]] = stringTime.slice(match.index, match.index + match[0].length);
			}
			return new Date(result.year, result.month - 1, result.day, result.hour, result.minute, result.second);
		};
		/**
		 * 格式化date对象
		 * @param {Date Object} dateTime
		 * @param {String, format of time output} format
		 */
		Time.prototype.format = function (dateTime, format, hour24Enable) {
			hour24Enable = hour24Enable || this.hour24Enable;
			var result = format || this.settings.format;
			var hour = dateTime.getHours();
			var pattern = {
				'y+': dateTime.getFullYear(),
				'M+': dateTime.getMonth() + 1,
				'd+': dateTime.getDate(),
				'H+': hour,
				'm+': dateTime.getMinutes(),
				's+': dateTime.getSeconds()
			};
			if (!hour24Enable) {
				if (hour === 0) {
					pattern['H+'] = 12;
				} else if (hour > 12) {
					pattern['H+'] -= 12;
				}
			}
			for (var key in pattern) {
				var val = pattern[key];
				if (new RegExp('(' + key + ')').test(result)) {
					var match = RegExp.$1;
					if (key === 'H+' && !hour24Enable) {
						result = result.replace(match, val);
					} else {
						result = result.replace(match, ('0' + val).slice((match + '').length * -1));
					}
				}
			}
			if (!hour24Enable) {
				result += hour >= 12 ? ' PM' : ' AM';
			}
			return result;
		};
		Time.prototype.on = Time.prototype.addListener;
		Time.prototype.off = Time.prototype.removeListener;
		return Time;
	})();
})(jQuery);
