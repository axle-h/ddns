// JavaScript Document
(function ($) {
	$.su = $.su || {};

	$.su.guideFlag = false;

	$.su.debug = $.su.debug || {
		log: function () {},
		warn: function () {},
		error: function () {}
	};

	/**
	 *@description 定义全局的ajax设置
	 */
	$.ajaxSetup({
		type: 'POST',
		cache: true,
		success: function (data, status, xhr) {},
		error: function (xhr, status, error) {}
	});

	/**
	 *@description 数据格式化相关函数
	 */
	$.su.format = {};
	$.su.format.capitalize = function (string) {
		string = string.toLowerCase();
		return string.replace(/\b(\w)|\s(\w)/g, function (s) {
			return s.toUpperCase();
		});
	};

	//公用函数
	$.su.getAttrObject = function (root, attrString) {
		attrString = attrString.replace(/[\{,\}]/g, '');

		if (!attrString) {
			return '';
		}

		if (attrString === 'true') {
			return true;
		} else if (attrString === 'false') {
			return false;
		}

		if (/^\d+$/.test(attrString)) {
			return parseInt(attrString, 10);
		}

		var stringList = attrString.split('.');
		var r = root;
		var index = 0;
		var len = stringList.length;

		while (index < len) {
			r = r[stringList[index]];
			if (!r) {
				return false;
			}
			index++;
		}
		if (!r) {
			return false;
		}
		return r;
	};

	$.su.formatAttrName = function (name) {
		var attrNameTmpArr = name.split('-');
		for (var num = 0; num < attrNameTmpArr.length; num++) {
			if (num !== 0) {
				attrNameTmpArr[num] = attrNameTmpArr[num].replace(/(\w)/, function (v) {
					return v.toUpperCase();
				});
			}
		}
		return attrNameTmpArr.join('');
	};

	$.su.randomId = function (type) {
		return type + '-' + $.su.guid();
	};

	$.su.guid = function () {
		var hexadecimal = function (num, x, y) {
			if (y !== undefined) {
				return parseInt(num.toString(), y).toString(x);
			} else {
				return parseInt(num.toString()).toString(x);
			}
		};
		var getGUIDDate = function (date) {
			return date.getFullYear() + addZero(date.getMonth() + 1) + addZero(date.getDay());
		};
		var addZero = function (num) {
			if (Number(num).toString() != 'NaN' && num >= 0 && num < 10) {
				return '0' + Math.floor(num);
			} else {
				return num.toString();
			}
		};
		var getGUIDTime = function (date) {
			return addZero(date.getHours()) + addZero(date.getMinutes()) + addZero(date.getSeconds()) + addZero(parseInt(date.getMilliseconds() / 10));
		};

		var formatGUID = function (guidStr) {
			var str1 = guidStr.slice(0, 8) + '-',
				str2 = guidStr.slice(8, 12) + '-',
				str3 = guidStr.slice(12, 16) + '-',
				str4 = guidStr.slice(16, 20) + '-',
				str5 = guidStr.slice(20);
			return str1 + str2 + str3 + str4 + str5;
		};

		var date = new Date();
		var guidStr = '';
		var sexadecimalDate = hexadecimal(getGUIDDate(date), 16);
		var sexadecimalTime = hexadecimal(getGUIDTime(date), 16);
		for (var i = 0; i < 9; i++) {
			guidStr += Math.floor(Math.random() * 16).toString(16);
		}
		guidStr += sexadecimalDate;
		guidStr += sexadecimalTime;
		while (guidStr.length < 32) {
			guidStr += Math.floor(Math.random() * 16).toString(16);
		}

		return formatGUID(guidStr);
	};

	$.su.clone = function (obj) {
		var result, index;
		var type = $.type(obj);
		switch (type) {
			case 'array':
				result = [];
				for (index = 0; index < obj.length; index++) {
					result[index] = $.su.clone(obj[index]);
				}
				return result;
			case 'object':
				result = {};
				for (index in obj) {
					result[index] = $.su.clone(obj[index]);
				}
				return result;
			case 'null':
				return null;
			case 'undefined':
				return undefined;
			case 'function':
				return obj;
			case 'string':
				result = obj;
				return result;
			case 'number':
				result = obj;
				return result;
			case 'boolean':
				if (!obj) {
					return false;
				} else {
					return true;
				}
				break;
			default:
				return undefined;
		}
	};

	/* 返回一个自定义事件的对象obj，obj.ev可在trigger自定义事件中传给监听函数
	 * 监听函数通过ev.preventDefault()来阻止自定义事件的默认方法执行。
	 * obj.exe()写在trigger之后，会根据监听函数是否preventDefault来确认是否调用func
	 * args: 作用域 函数 参数
	 */
	$.su.getDefaultEvent = function (obj, func, args) {
		var flag = true;
		if (args === undefined || args === null) {
			args = [];
		} else if (!$.isArray(args)) {
			args = [args];
		}

		return {
			exe: function () {
				if (flag) {
					func.apply(obj, args);
				}
				return flag;
			},
			ev: {
				preventDefault: function () {
					flag = false;
				}
			}
		};
	};

	/*
	 * 使用浏览器原生的方法转义特殊字符
	 */
	$.su.transSpecialChar = function (str) {
		var div = document.createElement('div');
		if (div.innerText !== undefined) {
			div.innerText = str;
		} else {
			div.textContent = str; //Support firefox
		}
		return div.innerHTML;
	};

	$.su.inherit = function (parentClass, childClass) {
		if (typeof parentClass != 'function' || typeof childClass != 'function') {
			return false;
		}
		var Tmp = function () {};
		Tmp.prototype = parentClass.prototype;
		childClass.prototype = new Tmp();
		childClass.prototype.constructor = childClass;
		childClass.superclass = parentClass.prototype;
	};

	$.su.getCookie = function () {
		var sliceStr;
		var srcStr;
		var tmpstring = document.cookie;
		while (tmpstring.length > 0) {
			var submitStr;
			sliceStr = tmpstring.indexOf(';');
			if (sliceStr == -1) {
				srcStr = tmpstring;
				if (checkCookie(srcStr) === true) {
					sliceStr = srcStr.indexOf('=');
					if (sliceStr == -1) return null;
					submitStr = strmodify(srcStr.slice(sliceStr + 1));
					return submitStr;
				}
			} else {
				srcStr = tmpstring.slice(0, sliceStr);
				if (checkCookie(srcStr) === true) {
					sliceStr = srcStr.indexOf('=');
					if (sliceStr == -1) return null;
					submitStr = strmodify(srcStr.slice(sliceStr + 1));
					return submitStr;
				}
			}
			tmpstring = tmpstring.slice(sliceStr + 1);
		}
		function checkCookie(srcStr) {
			var sliceStr = srcStr.indexOf('=');
			var testStr = strmodify(srcStr.slice(0, sliceStr)).toUpperCase();
			return testStr == 'COOKIE';
		}

		function strmodify(str) {
			var localStr = '';
			var len = str.length;
			var i, j;
			var charStr;
			for (i = 0; i < len; i++) {
				if (document.all) {
					charStr = str.slice(i, i + 1);
					if (charStr != ' ') {
						break;
					}
				} else {
					if (str[i] != ' ') {
						break;
					}
				}
			}
			for (j = len - 1; j > 0; j--) {
				if (document.all) {
					charStr = str.slice(j, j + 1);
					if (charStr != ' ') {
						break;
					}
				} else {
					if (str[j] != ' ') {
						break;
					}
				}
			}
			if (j < i) {
				return localStr;
			} else {
				localStr = str.slice(i, j + 1);
			}
			return localStr;
		}

		return null;
	};

	// 覆盖原jQuery方法

	// IE8下jQuery的inArray方法会报错，因此选择覆盖此方法
	// add by maihaihua 2017/5/11.
	$.inArray = function (item, arr) {
		if (!$.isArray(arr)) {
			return -1;
		}

		for (var i = 0, len = arr.length; i < len; i++) {
			if (arr[i] === item) {
				return i;
			}
		}
		return -1;
	};

	$.su.getObjectLength = function (object) {
		var length = 0;
		if (object) {
			for (var i in object) {
				if (object.hasOwnProperty(i)) {
					length++;
				}
			}
		}
		return length;
	};

	$.su.isEmptyObject = function (obj) {
		for (var name in obj) {
			return false;
		}
		return true;
	};

	$.su.isIe9 = function () {
		var userAgent = navigator.userAgent;
		if (userAgent.indexOf('compatible') > -1 && userAgent.indexOf('MSIE') > -1) {
			var reIE = new RegExp('MSIE (\\d+\\.\\d+);');
			reIE.test(userAgent);
			var fIEVersion = parseFloat(RegExp['$1']);
			return fIEVersion === 9;
		}
		return false;
	};

	$.su.platform = (function () {
		if (/(iPhone|iPad|iPod|iOS)/i.test(navigator.userAgent)) {
			return 'ios';
		} else if (/(Android)/i.test(navigator.userAgent)) {
			return 'android';
		} else {
			return 'pc';
		}
	})();

	$.su.escapeHtml = function (string) {
		var r = string.toString();
		r = r.replace(/\&/g, '&amp;');
		r = r.replace(/\</g, '&lt;');
		r = r.replace(/\>/g, '&gt;');
		r = r.replace(/\"/g, '&quot;');
		r = r.replace(/\s/g, '&nbsp;');

		return r;
	};

	$.su.unEscapeHtml = function (string) {
		var r = string.toString();
		r = r.replace(/&amp;/g, '&');
		r = r.replace(/&lt;/g, '<');
		r = r.replace(/&gt;/g, '>');
		r = r.replace(/&quot;/g, '"');
		r = r.replace(/&nbsp;/g, ' ');

		return r;
	};

	$.su.escapeHtmlForObject = function (dataObj) {
		var result = $.isArray(dataObj) ? [] : {};

		$.each(dataObj, function (key, value) {
			if (value == '' || value == null || value == undefined) {
				result[key] = value;
				return true;
			}

			var type = typeof value;

			switch (type) {
				case 'string':
					value = $.su.escapeHtml(value);
					break;
				case 'object':
					value = $.su.escapeHtmlForObject(value);
					break;
			}

			result[key] = value;
		});
		return result;
	};

	$.su.getBrowseVersion = function () {
		var Sys = {};
		var ua = navigator.userAgent.toLowerCase();
		var s;
		(s = ua.match(/msie ([\d.]+)/))
			? ((Sys['browse'] = 'ie'), (Sys['version'] = s[1]))
			: (s = ua.match(/firefox\/([\d.]+)/))
			? ((Sys['browse'] = 'firefox'), (Sys['version'] = s[1]))
			: (s = ua.match(/chrome\/([\d.]+)/))
			? ((Sys['browse'] = 'chrome'), (Sys['version'] = s[1]))
			: (s = ua.match(/opera.([\d.]+)/))
			? ((Sys['browse'] = 'opera'), (Sys['version'] = s[1]))
			: (s = ua.match(/version\/([\d.]+).*safari/))
			? ((Sys['browse'] = 'safari'), (Sys['version'] = s[1]))
			: 0;
		return Sys;
	};

	/*
	 * 简单扩展对象(extJs方法，去掉了enumerables数组的扩展)
	 */
	$.su.apply = function (object, config, defaults) {
		if (defaults) {
			$.su.apply(object, defaults);
		}

		if (object && config && typeof config === 'object') {
			var i, j, k;

			for (i in config) {
				if (config.hasOwnProperty(i)) {
					object[i] = config[i];
				}
			}
		}

		return object;
	};

	$.su.valueEqual = function (a, b) {
		if (a === b) {
			// number(not NaN), string, null, undefined, boolean
			return true;
		}
		var typeA = $.type(a);
		var typeB = $.type(b);
		if (typeA !== typeB) {
			return false;
		} else {
			switch (typeA) {
				case 'array':
				case 'object':
					return JSON.stringify(a) === JSON.stringify(b);
				default:
					return false;
			}
		}
	};

	$.su.isMobile = function () {
		return new $.su.UA(navigator.userAgent).device.type === 'mobile';
	};

	$.su.isTablet = function () {
		return new $.su.UA(navigator.userAgent).device.type === 'tablet';
	};

	$.su.isDesktop = function () {
		return new $.su.UA(navigator.userAgent).device.type === 'desktop';
	};

	$.su.ipToInt = function (str_ip) {
		if (!str_ip) {
			return;
		}
		var patternIp = /^\s*[0-9]{1,3}\.{1}[0-9]{1,3}\.{1}[0-9]{1,3}\.{1}[0-9]{1,3}\s*$/;
		var ip_array = str_ip.split('.');
		if (ip_array.length != 4) {
			return -1;
		}
		if (!patternIp.test(str_ip)) {
			return -1;
		}
		return Number(ip_array[0]) * (1 << 24) + ((Number(ip_array[1]) << 16) | (Number(ip_array[2]) << 8) | Number(ip_array[3]));
	};

	$.su.isCidrConflict = function (a, b) {
		// CIDR 以二进制划分的，因此不存在真正的相交或者重叠，只可能一个是另一个的子集。
		// 解决思路：判断两个网段，其中一个是否包含了另一个。
		// 解决方法：取两个网段最小的掩码长度，得到掩码，然后分别和两个 ip 进行与运算，如果结果相同则表明存在包含关系。
		// 参考资料：https://juejin.cn/post/7033668672585629732#heading-14
		// 开源库：https://github.com/indutny/node-ip
		if (a === b) {
			return true;
		}

		var maskLenA = parseInt(a.split('/')[1]);
		var maskLenB = parseInt(b.split('/')[1]);
		var minMaskLen = Math.min(maskLenA, maskLenB);
		var mask = '1'.repeat(minMaskLen) + '0'.repeat(32 - minMaskLen);

		var maskInt = parseInt(mask, 2) >>> 0;
		var ipIntA = $.su.ipToInt(a.split('/')[0]);
		var ipIntB = $.su.ipToInt(b.split('/')[0]);

		return (ipIntA & maskInt) === (ipIntB & maskInt);
	};

	$.su.createKeywordReg = function () {
		if (!arguments.length) {
			return false;
		}
		var reg = /[\*\.\?\+\$\^\[\]\(\)\{\}\\\\/]/g;
		var text = Array.prototype.join.call(arguments, '|');
		text = text.replace(reg, function ($1) {
			return '\\' + $1;
		});
		text = text.replace(/\s/g, function ($1) {
			return '\\s';
		});
		var ret = new RegExp(text, 'gi');
		return ret;
	};

	/***容量单位数值转换***/
	$.su.numToCapacity = function (value, dig) {
		if (isNaN(parseInt(value))) {
			return false;
		}
		var result = value,
			dig = dig || 3;
		if (value >= 1000 * 1000 * 1000 * 1000 * 1000) {
			result = (result / (1000 * 1000 * 1000 * 1000 * 1000)).toFixed(dig) + $.su.CHAR.UNIT.PB;
		} else if (value >= 1000 * 1000 * 1000 * 1000) {
			result = (result / (1000 * 1000 * 1000 * 1000)).toFixed(dig) + $.su.CHAR.UNIT.TB;
		} else if (value >= 1000 * 1000 * 1000) {
			result = (result / (1000 * 1000 * 1000)).toFixed(dig) + $.su.CHAR.UNIT.GB;
		} else if (value >= 1000 * 1000) {
			result = (result / (1000 * 1000)).toFixed(dig) + $.su.CHAR.UNIT.MB;
		} else if (value >= 1000) {
			result = (result / 1000).toFixed(dig) + $.su.CHAR.UNIT.KB;
		} else {
			result += $.su.CHAR.UNIT.B;
		}
		return result;
	};

	/***容量单位数值转换(精确版本)***/
	$.su.numToCapacityAccurate = function (value, dig) {
		if (isNaN(parseInt(value))) {
			return false;
		}
		var result = value,
			dig = dig || 3;
		if (value >= 1024 * 1024 * 1024 * 1024 * 1024) {
			result = (result / (1024 * 1024 * 1024 * 1024 * 1024)).toFixed(dig) + $.su.CHAR.UNIT.PB;
		} else if (value >= 1024 * 1024 * 1024 * 1024) {
			result = (result / (1024 * 1024 * 1024 * 1024)).toFixed(dig) + $.su.CHAR.UNIT.TB;
		} else if (value >= 1024 * 1024 * 1024) {
			result = (result / (1024 * 1024 * 1024)).toFixed(dig) + $.su.CHAR.UNIT.GB;
		} else if (value >= 1024 * 1024) {
			result = (result / (1024 * 1024)).toFixed(dig) + $.su.CHAR.UNIT.MB;
		} else if (value >= 1024) {
			result = (result / 1024).toFixed(dig) + $.su.CHAR.UNIT.KB;
		} else {
			result += $.su.CHAR.UNIT.B;
		}
		return result;
	};

	$.su.capacityToNum = function (str) {
		var str = str.replace('&nbsp;', '').replace(' ', '');
		var PB = $.su.CHAR.UNIT.PB;
		var TB = $.su.CHAR.UNIT.TB;
		var GB = $.su.CHAR.UNIT.GB;
		var MB = $.su.CHAR.UNIT.MB;
		var KB = $.su.CHAR.UNIT.KB;
		var B = $.su.CHAR.UNIT.B;
		var reg = $.su.createKeywordReg(PB, 'PB', TB, 'TB', GB, 'GB', MB, 'MB', KB, 'KB', B, 'B');
		var unitArr = str.match(reg);
		if (!unitArr || !unitArr.length) {
			return str;
		}
		var unit = unitArr[0];
		var unitText = $.su.CHAR.UNIT[unit] || unit;
		var val = str.split(reg)[0];
		switch (unitText) {
			case PB:
				return val * 1000 * 1000 * 1000 * 1000 * 1000;
			case TB:
				return val * 1000 * 1000 * 1000 * 1000;
			case GB:
				return val * 1000 * 1000 * 1000;
			case MB:
				return val * 1000 * 1000;
			case KB:
				return val * 1000;
			default:
				return val;
		}
	};

	$.su.convertUnit = function (value, base, rangeLength) {
		// 转换 value 数据类型，防止当 value 为 '0' 时导致报错
		value = parseFloat(value);

		var result = {};
		result.value = 0;
		result.index = 0;

		if (!value || !base || rangeLength <= 1) {
			return result;
		}

		for (var index = 0; index < rangeLength; index++) {
			if (value >= base) {
				value = value / base;
				continue;
			}

			result.value = value;
			result.index = index;

			break;
		}

		return result;
	};

	// 返回 function 函数的去抖版本, 将延迟函数的执行(真正的执行)在函数最后一次调用时刻的 wait 毫秒之后. 对于必须在一些输入（多是一些用户操作）停止到达之后执行的行为有帮助。
	$.su.debounce = function (func, wait, immediate) {
		var timeout;
		return function () {
			var context = this,
				args = arguments;
			var later = function () {
				timeout = null;
				if (!immediate) func.apply(context, args);
			};
			var callNow = immediate && !timeout;
			clearTimeout(timeout);
			timeout = setTimeout(later, wait);
			if (callNow) func.apply(context, args);
		};
	};
	// 返回 function 函数的节流版本，至少每隔duration毫秒调用一次该函数，最后一次延迟wait秒执行
	$.su.throttle = function (func, wait, duration) {
		var timeout,
			startTime = new Date();
		return function () {
			var context = this,
				args = arguments,
				curTime = new Date();
			clearTimeout(timeout);
			if (curTime - startTime >= duration) {
				func.apply(context, args);
				startTime = curTime;
			} else {
				timeout = setTimeout(func, wait);
			}
		};
	};
	//get maxZIndex
	$.su.getMaxZIndex = function () {
		var maxZ = Math.max.apply(
			null,
			$.map($('body div:visible'), function (e, n) {
				if ($(e).css('position') != 'static' && $(e).width() != 0 && $(e).height() != 0) return parseInt($(e).css('z-index')) || 1;
			})
		);
		return maxZ;
	};
	$.su.adjustViewPort = function () {
		if ($.su.isMobile()) {
			var viewport = $('meta[name="viewport"]')[0];
			viewport.content = 'width=device-width,initial-scale=1,minimum-scale=1,maximum-scale=1,user-scalable=0';
			if ($(window).width() > 767) {
				viewport.content = 'width=767,user-scalable=0';
			}
		}
	};

	$.su.cloudErrorCode = $.su.cloudErrorCode || [
		'E10000',
		'E20000',
		'E20002',
		'E20003',
		'E20104',
		'E20105',
		'E20107',
		'E20200',
		'E20502',
		'E3002',
		'E20503',
		'E20506',
		'E20507',
		'E20508',
		'E20509',
		'E20571',
		'E20580',
		'E20600',
		'E20601',
		'E20602',
		'E20603',
		'E20604',
		'E20606',
		'E20615',
		'E20616',
		'E20617',
		'E20618',
		'E20620',
		'E20621',
		'E20623',
		'E20651',
		'E20661',
		'E20662',
		'E20671',
		'E20672',
		'E20673',
		'E20674',
		'E20675',
		'E22000',
		'E22001',
		'E22003',
		'E22004',
		'E22006',
		'E22007',
		'E25001',
		'E22008',
		'E22010',
		'E50101',
		'E50102',
		'E50103',
		'E50111',
		'E50112',
		'E50121',
		'E50122',
		'E50131',
		'E50132',
		'E50140',
		'E51215',
		'E1000',
		'E5000',
		'E5001',
		'E5002'
	];

	$.su.securityCode = {
		no_security: '0',
		psk_aes: '1',
		psk_aes_tkip: '2',
		psk_sae_personal: '3',
		psk_sae_personal_aes: '4',
		wpa_enterprise: '5',
		wpa_enterprise_tkip: '6'
	};

	//颜色十六进制和rgb之间的相互转换
	$.su.rgbToHexString = function (obj) {
		return !!obj ? ((1 << 24) + (obj.r << 16) + (obj.g << 8) + obj.b).toString(16).slice(1) : undefined;
	};
	$.su.rgbToRgbString = function (obj) {
		if (!obj) {
			return null;
		}
		return obj.a === 1
			? 'rgb(' + Math.round(obj.r) + ', ' + Math.round(obj.g) + ', ' + Math.round(obj.b) + ')'
			: 'rgba(' + Math.round(obj.r) + ', ' + Math.round(obj.g) + ', ' + Math.round(obj.b) + ', ' + obj.a + ')';
	};
	$.su.hexToRgb = function (hex) {
		var shorthandRegex = /^([a-f\d])([a-f\d])([a-f\d])$/i;
		hex = hex.replace(shorthandRegex, function (m, r, g, b) {
			return r + r + g + g + b + b;
		});
		var result = /^([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
		return result
			? {
					r: parseInt(result[1], 16),
					g: parseInt(result[2], 16),
					b: parseInt(result[3], 16)
			  }
			: null;
	};

	$.su.flat = function (arr) {
		if (!$.isArray(arr)) {
			return false;
		}

		return JSON.stringify(arr)
			.replace(/\[|]|"|'/g, '')
			.split(',');
	};

	$.su.getDeviceType = function (type) {
		if (!type || typeof type !== 'string') {
			return 'other';
		}
		// e.g. 'Audio & Video', 'Wi-Fi Extender'
		return type
			.toLowerCase()
			.replace(/&|amp;|nbsp;/g, ' ')
			.replace(/(_|\s)+/g, '-');
	};

	$.su.NETWORK_MODE = {
		MODE_WIRED: 'wired',
		MODE_2G: '2g',
		MODE_5G: '5g',
		MODE_5G_1: '5g1',
		MODE_5G_2: '5g2',
		MODE_6G: '6g',
		MODE_IOT_2G: 'iot_2g',
		MODE_IOT_5G: 'iot_5g',
		MODE_IOT_5G_1: 'iot_5g1',
		MODE_IOT_5G_2: 'iot_5g2'
	};
})(jQuery);
