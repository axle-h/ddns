(function ($) {
	$.su.Connection = (function () {
		var _defaultAjaxSettings = {
			url: null,
			async: true,
			// <subuild name=supportLowerCpuUsage_exclude>
			timeout: 20 * 1000,
			// </subuild>
			type: 'POST',
			dataType: 'json',
			// cache: true,
			contentType: 'application/json',
			successJudge: function () {
				return true;
			}
		};

		var _readFilter = [];
		var _writeFilter = [];
		var _failHandler = [];

		var _addList = function (list, fn) {
			if (typeof fn !== 'function' || (fn ? $.inArray(fn, list) > -1 : !!(list && list.length))) {
				return;
			}

			list.push(fn);
		};

		var _fireList = function (list, data, settings) {
			var listLength = list.length,
				fireIndex = 0;

			for (; fireIndex < listLength; fireIndex++) {
				data = list[fireIndex].call(this, data, settings);
			}

			return data;
		};

		var Connection = function (options) {
			$.su.Observable.call(this);

			this.ajax = $.extend({}, _defaultAjaxSettings, options);

			if (options && options.readFilter) {
				_addList(_readFilter, options.readFilter);
				delete options.readFilter;
			}
			if (options && options.writeFilter) {
				_addList(_writeFilter, options.writeFilter);
				delete options.writeFilter;
			}
			if (options && options.failHandler) {
				_addList(_failHandler, options.failHandler);
				delete options.failHandler;
			}
		};

		$.su.inherit($.su.Observable, Connection);

		var _params = function (settings) {
			var url = settings.url["default"]
			if(settings.data){
				url = settings.url[settings.data.operation]? settings.url[settings.data.operation] :settings.url["default"]
			}
			
			var options = $.extend(true, {}, settings.params);
			var text = '';
			// 取出url中已经包含的参数
			var getExistParams = function (url) {
				var parts = url.split('?');
				var params = parts[1].split('&');
				var paramsObj = {};
				if (!params || (params && params[0] === '')) {
					return {};
				}
				for (var i = 0, len = params.length; i < len; i++) {
					var paramName = params[i].split('=')[0];
					if (!paramsObj[paramName]) {
						paramsObj[paramName] = [];
					}
					paramsObj[paramName].push(params[i].split('=')[1]);
				}
				return paramsObj;
			};
			if (/\?/.test(url) === true) {
				// 将option传入的参数覆盖到url原参数上
				var existParams = getExistParams(url);
				options = $.extend(true, existParams, options);
				url = url.split('?')[0];
			}

			if (!$.isEmptyObject(options)) {
				text += '?';
				for (var option in options) {
					if (options.hasOwnProperty(option)) {
						$.each(options[option], function (i, val) {
							text += option;
							text += '=';
							text += val;
							text += '&';
						});
					}
				}
				text = text.substring(0, text.lastIndexOf('&'));
			}

			return url + text;
		};

		Connection.prototype.upload = function (options) {
			var that = this;
			options.success = options.success || function () {};
			var url = options.url || this.ajax.url;
			if (!options.fileId) {
				return false;
			}

			var frameName = $.su.randomId('iframe-');
			var iframe = $('<iframe class="hidden" id="' + frameName + '" name="' + frameName + '"></iframe>');
			$('body').append(iframe);

			var form,
				createFormFlag = $('#' + options.fileId + '_form').length == 0;
			if (!createFormFlag) {
				form = $('#' + options.fileId + '_form')
					.attr('target', frameName)
					.attr('action', url);
			} else {
				form = $('<form class="hidden" id="' + options.fileId + '_form" method="POST" enctype="multipart/form-data"></form>')
					.attr('target', frameName)
					.attr('action', url);
				$('body').append(form);
			}
			if (this.fieldset) {
				this.fieldset.remove();
				this.fieldset = undefined;
			}
			if (options.data) {
				this.fieldset = $('<fieldset></fieldset>');
				for (var param in options.data) {
					if (options.data.hasOwnProperty(param)) {
						this.fieldset.append('<input name="' + param + '" value="' + options.data[param] + '" />');
					}
				}
				form.append(this.fieldset);
			}
			form.submit();

			var timeoutFlag = false;
			var timer;
			if (options.timeout) {
				timer = setTimeout(function () {
					timeoutFlag = true;
					iframe.remove();
					if (createFormFlag) form.remove();
					if (that.fieldset) {
						that.fieldset.remove();
						that.fieldset = undefined;
					}

					options.error && options.error();
				}, options.timeout);
			}

			iframe.on('load', function () {
				if (timeoutFlag == true) {
					return;
				} else {
					clearTimeout(timer);
					timer = null;
				}
				var frame = iframe.get(0);
				var response = {};
				var data;
				var result;

				var doc = frame.contentWindow.document || frame.contentDocument || window.frames[frame.id].document;

				iframe.remove();
				if (createFormFlag) form.remove();
				if (that.fieldset) {
					that.fieldset.remove();
					that.fieldset = undefined;
				}

				if (doc.body) {
					if ((contentNode = doc.body.firstChild) && /pre/i.test(contentNode.tagName)) {
						response.responseText = contentNode.textContent;
					} else if ((contentNode = doc.getElementsByTagName('textarea')[0])) {
						response.responseText = contentNode.value;
					} else {
						response.responseText = doc.body.textContent || doc.body.innerText;
					}
				}
				//in IE the document may still have a body even if returns XML.
				response.responseXML = doc.XMLDocument || doc;
				data = response.responseText && JSON.parse(response.responseText);
				!!that.root ? (result = data[that.root]) : (result = data);

				data = _fireList.call(that, _readFilter, data);
				var res = that.successJudge ? that.successJudge(data, settings) : true;
				if (res === true) {
					!!options.success && options.success(result || response.responseXML);
				} else {
					_fireList.call(that, _failHandler, data);
					!!options.fail && options.fail(res, result || response.responseXML);
				}
			});
		};

		Connection.prototype.request = function (options) {
			var that = this;
			var res;
			var ajax = options.ajax || {};
			var settings = $.extend(true, {}, this.ajax, ajax, options);
			var noEncryptUrl = [
				'/domain_login?form=dlogin',
				'/locale?form=lang',
				'/login?form=auth',
				'/login?form=keys',
				'/login?form=password',
				'/locale?form=list',
				'/login?form=get_token',
				'/login?form=get_eweb_url',
				'/login?form=get_deviceInfo',
				'/login?form=check_factory_default',
				'/login?form=get_firmware_info',
				'/login?form=check_internet',
				'/login?form=cloud_bind_status',
				'/login?form=vercode',
				'/login?form=sysmode',
				'/admin/firmware?form=config_multipart',
				'/admin/firmware?form=save_upgrade',
				'/admin/openvpn?form=export',
				'/admin/syslog?form=save_log'
			];

			settings.url = _params(settings);
			settings.data = _fireList.call(this, _writeFilter, options.data || {}, settings);

			$.each(noEncryptUrl, function (i, n) {
				noEncryptUrl[i] = $.su.url(n).toString();
			});
			noEncryptUrl.push('./config/device.json');
			noEncryptUrl.push('./config/device.ru.json');

			if (settings.contentType === 'application/json' && !$.isEmptyObject(settings.data)) {
				settings.data = JSON.stringify(settings.data);
			}
			
			return (this.ajaxRequest = $.ajax(settings))
			.done(function (data, status, xhr) {})
				.fail(function (status, xhr) {});
		};
		Connection.prototype.abort = function () {
			if (this.ajaxRequest) {
				this.ajaxRequest.abort();
				this.ajaxRequest = null;
			}
		};
		Connection.prototype.download = function (file) {
			var tid = localStorage.getItem('_tid_');
			var lvl = localStorage.getItem('usrLvl');
			if (file.indexOf('?') >= 0) {
				file = file + '&_tid_=' + tid + '&' + 'usrLvl=' + lvl;
			} else {
				file = file + '?_tid_=' + tid + '&' + 'usrLvl=' + lvl;
			}

			if ($.su.getBrowseVersion().browse === 'ie') {
				var referLink = document.createElement('a');
				referLink.href = file;
				document.body.appendChild(referLink);
				referLink.click();
				document.body.removeChild(referLink);
			} else {
				setTimeout(function () {
					window.location.href = file;
				}, 100);
			}
		};

		return Connection;
	})();
})(jQuery);
