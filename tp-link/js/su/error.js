/*
 * @class Error 错误处理类
 * */
(function () {
	function toString() {
		// var me = this,
		//     cls = me.sourceClass,
		//     method = me.sourceMethod,
		//     msg = me.msg;
		//
		// if (method) {
		//     if (msg) {
		//         method += '(): ';
		//         method += msg;
		//     } else {
		//         method += '()';
		//     }
		// }
		//
		// if (cls) {
		//     method = method ? (cls + '.' + method) : cls;
		// }
		//
		// return method || msg || '';
		return this.msg || this.message;
	}

	$.su.Error = function (config) {
		if (typeof config === 'string') {
			config = { msg: config };
		}

		var error = new Error();

		$.su.apply(error, config);

		error.message = error.message || error.msg; // message为标准名称，有的旧浏览器中为只读

		error.toString = toString;

		return error;
	};

	$.su.apply($.su.Error, {
		/**
		 * @property {Boolean} ignore 如果设置为true, 且没有重写{@link #handle}方法，框架对错误不进行处理，修改方法：
		 *      $.su.Error.ignore = true;
		 *
		 * @static
		 */
		ignore: false,

		/**
		 * @method 框架抛出错误，该方法放在$.su下，不直接调用
		 *
		 * @static
		 */
		raise: function (err) {
			err = err || {};
			if (typeof err === 'string') {
				err = { msg: err };
			}

			//目前SU框架类中不存储方法名和类名，暂时不添加这些信息
			// var me = this,
			//     method = me.raise.caller,
			//     msg, name;
			//
			// if (method === Ext.raise) {
			//     method = method.caller;
			// }
			// if (method) {
			//     if (!err.sourceMethod && (name = method.$name)) {
			//         err.sourceMethod = name;
			//     }
			//     if (!err.sourceClass && (name = method.$owner) && (name = name.$className)) {
			//         err.sourceClass = name;
			//     }
			// }

			if (this.handle(err) !== true) {
				// //<debug>
				// msg = toString.call(err);
				// Ext.log({
				//     msg: msg,
				//     level: 'error',
				//     dump: err,
				//     stack: true
				// });
				// //</debug>

				throw new $.su.Error(err);
			}
		},

		/**
		 * @static 错误的全局处理方法，项目中一般要进行重写:
		 *      $.su.Error.handle = function(err) {};
		 *
		 * @return 如果为true不再处理, 否则抛出浏览器错误
		 */
		handle: function () {
			return this.ignore;
		}
	});
})();

/**
 * Error类的raise方法挂在SU下
 */
$.su.raise = function () {
	$.su.Error.raise.apply($.su.Error, arguments);
};
