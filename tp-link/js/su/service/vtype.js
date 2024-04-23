(function ($) {
	$.su.Vtype = (function () {
		var Vtype = function (options) {
			if (typeof Vtype.instance === 'object') {
				return Vtype.instance;
			}

			this.name = 'vtype';
			$.su.Service.call(this);

			Vtype.instance = this;

			//$.extend(types, $.su.vtype);
		};

		$.su.inherit($.su.Service, Vtype);

		Vtype.types = {
			email: {
				regex: /^[a-zA-Z0-9_+.-]+\@([a-zA-Z0-9-]+\.)+[a-zA-Z0-9]{1,}$/,
				vtypeText: $.su.CHAR.VTYPETEXT.EMAIL
			},
			float_positive: {
				regex: /^[0-9]\d*(\.[0-9]\d*)?$/,
				vtypeText: $.su.CHAR.VTYPETEXT.NUMBER
			},
			float_number: {
				// regex: /^-?[0-9]\d*(.[0-9]\d{0,2})?$/,
				regex: /^-?[0-9]\d*(\.[0-9]\d*)?$/,
				vtypeText: $.su.CHAR.VTYPETEXT.NUMBER,
				validator: function (value) {
					value = parseFloat(value);
					if (this.max !== null || this.max !== undefined) {
						if (value > this.max) {
							if (this.min !== null || this.min !== undefined) {
								var str = $.su.CHAR.VTYPETEXT.NUMBER_MIN_MAX.replace('%min', this.min.toString()).replace('%max', this.max.toString());
								return str;
							} else {
								var str = $.su.CHAR.VTYPETEXT.NUMBER_MAX.replace('%max', this.max.toString());
								return str;
							}
						}
					}

					if (this.min !== null || this.min !== undefined) {
						if (value < this.min) {
							if (this.max !== null || this.max !== undefined) {
								var str = $.su.CHAR.VTYPETEXT.NUMBER_MIN_MAX.replace('%min', this.min.toString()).replace('%max', this.max.toString());
								return str;
							} else {
								var str = $.su.CHAR.VTYPETEXT.NUMBER_MIN.replace('%min', this.min.toString());
								return str;
								//return 	$.su.CHAR.VTYPETEXT.NUMBER_MIN.replace("%min", this.min.toString());
							}
						}
					}
					return true;
				}
			},
			float_number2: {
				regex: /^[1-9]\d*(\.[0-9]\d{0,1})?$/,
				vtypeText: $.su.CHAR.VTYPETEXT.NUMBER,
				validator: function (value) {
					value = parseFloat(value);
					if (this.max !== null || this.max !== undefined) {
						if (value > this.max) {
							if (this.min !== null || this.min !== undefined) {
								var str = $.su.CHAR.VTYPETEXT.NUMBER_MIN_MAX.replace('%min', this.min.toString()).replace('%max', this.max.toString());
								return str;
							} else {
								var str = $.su.CHAR.VTYPETEXT.NUMBER_MAX.replace('%max', this.max.toString());
								return str;
							}
						}
					}
					if (this.min !== null || this.min !== undefined) {
						if (value < this.min) {
							if (this.max !== null || this.max !== undefined) {
								var str = $.su.CHAR.VTYPETEXT.NUMBER_MIN_MAX.replace('%min', this.min.toString()).replace('%max', this.max.toString());
								return str;
							} else {
								var str = $.su.CHAR.VTYPETEXT.NUMBER_MIN.replace('%min', this.min.toString());
								return str;
							}
						}
					}
					return true;
				}
			},
			number: {
				regex: /^-?[0-9]\d*$/,
				vtypeText: $.su.CHAR.VTYPETEXT.NUMBER,
				minMaxText: $.su.CHAR.VTYPETEXT.NUMBER_MIN_MAX,
				maxText: $.su.CHAR.VTYPETEXT.NUMBER_MAX,
				minText: $.su.CHAR.VTYPETEXT.NUMBER_MIN,
				validator: function (value) {
					value = parseInt(value, 10);
					if (this.max !== null && this.max !== undefined) {
						if (value > this.max) {
							if (this.min !== null || this.min !== undefined) {
								var str = this.minMaxText.replace('%min', this.min.toString()).replace('%max', this.max.toString());
								return str;
							} else {
								var str = this.maxText.replace('%max', this.max.toString());
								return str;
							}
						}
					}

					if (this.min !== null && this.min !== undefined) {
						if (value < this.min) {
							if (this.max !== null || this.max !== undefined) {
								var str = this.minMaxText.replace('%min', this.min.toString()).replace('%max', this.max.toString());
								return str;
							} else {
								var str = this.minText.NUMBER_MIN.replace('%min', this.min.toString());
								return str;
								//return 	$.su.CHAR.VTYPETEXT.NUMBER_MIN.replace("%min", this.min.toString());
							}
						}
					}

					return true;
				},
				keybordHandler: function (e) {
					e.stopPropagation();
					var keyCode = e.keyCode,
						shiftKey = e.shiftKey,
						ctrlKey = e.ctrlKey;

					if (shiftKey) {
						return false;
					}

					if (keyCode == 37 || keyCode == 39) {
						return true;
					}

					if (keyCode == 38 || keyCode == 40) {
						var input = $(this),
							_value = input.val();

						if ($.su.vtype.types.number.regex.test(_value)) {
							if (keyCode == 38) {
								var _maxValue = input.hasClass('hour-text') ? 23 : 59;
								if (_value < _maxValue) {
									input.val(parseInt(_value, 10) + 1);
								} else {
									return false;
								}
							} else {
								if (_value == 0) {
									return false;
								} else {
									input.val(parseInt(_value, 10) - 1);
								}
							}
						} else {
							input.val(0);
						}
					}

					if (!ctrlKey) {
						if ((keyCode < 48 || keyCode > 57) && keyCode > 32) {
							return false;
						}
					}
				}
			},
			date: {
				format: 'yyyy/MM/dd',
				validator: function (val) {
					var regex;
					if (this.format === 'MM/dd/yyyy') {
						regex = /^(0[1-9]|1[0-2])\/(0[1-9]|1[0-9]|2[0-9]|3[0-1])\/([0-9]{4})$/;
						var arr = val.split('/');
						if (parseInt(arr[2], 10) < 1970) {
							return $.su.CHAR.VTYPETEXT.DATE_INVALID;
						}
						if (parseInt(arr[2], 10) > 2030) {
							return $.su.CHAR.VTYPETEXT.DATE_INVALID;
						}
					} else if (this.format === 'yyyy/MM/dd') {
						regex = /^([0-9]{4})\/(0[1-9]|1[0-2])\/(0[1-9]|1[0-9]|2[0-9]|3[0-1])$/;
					}
					if (regex.test(val) === false) {
						return $.su.CHAR.VTYPETEXT.DATE;
					}
					return true;
				}
			},
			ipv6: {
				isPrefixFlag: false,
				regex:
					/^\s*((([0-9A-Fa-f]{1,4}:){7}([0-9A-Fa-f]{1,4}|:))|(([0-9A-Fa-f]{1,4}:){6}(:[0-9A-Fa-f]{1,4}|((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3})|:))|(([0-9A-Fa-f]{1,4}:){5}(((:[0-9A-Fa-f]{1,4}){1,2})|:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3})|:))|(([0-9A-Fa-f]{1,4}:){4}(((:[0-9A-Fa-f]{1,4}){1,3})|((:[0-9A-Fa-f]{1,4})?:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){3}(((:[0-9A-Fa-f]{1,4}){1,4})|((:[0-9A-Fa-f]{1,4}){0,2}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){2}(((:[0-9A-Fa-f]{1,4}){1,5})|((:[0-9A-Fa-f]{1,4}){0,3}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){1}(((:[0-9A-Fa-f]{1,4}){1,6})|((:[0-9A-Fa-f]{1,4}){0,4}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(:(((:[0-9A-Fa-f]{1,4}){1,7})|((:[0-9A-Fa-f]{1,4}){0,5}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:)))(%.+)?\s*$/,
				vtypeText: $.su.CHAR.VTYPETEXT.IPV6,
				validator: function (val) {
					var reg1 = new RegExp('^[2-3][0-9A-Fa-f]{1,3}:');
					if (!reg1.test(val)) {
						return $.su.CHAR.VTYPETEXT.IPV6_NOT_GLOBAL;
					}
					var reg2 = new RegExp('::$');
					var reg4 = new RegExp('^2002:');
					if (this.isPrefixFlag) {
						if (!reg2.test(val)) {
							return $.su.CHAR.VTYPETEXT.IPV6_NOT_PREFIX;
						}
						if (reg4.test(val)) {
							return $.su.CHAR.VTYPETEXT.IPV6_PREFIX;
						}
					} else {
						if (reg2.test(val)) {
							return $.su.CHAR.VTYPETEXT.IPV6_NOT_GLOBAL;
						}
					}

					var reg3 = /:/g;
					var arr = val.match(reg3);
					if (this.isPrefixFlag) {
						if (arr.length > 5) {
							return $.su.CHAR.VTYPETEXT.IPV6_NOT_PREFIX;
						}
					}
					return true;
				}
			},
			ip: {
				allowAllZeroFlag: false,
				disallowAllZeroText: $.su.CHAR.VTYPETEXT.IP_NO_ALL_ZERO,
				allowLoopFlag: false,
				disallowLoopText: $.su.CHAR.VTYPETEXT.IP_NO_LOOP,
				allowDTypeFlag: false,
				disallowDTypeText: $.su.CHAR.VTYPETEXT.IP_NO_D_TYPE,
				allowETypeFlag: false,
				disallowETypeText: $.su.CHAR.VTYPETEXT.IP_NO_E_TYPE,
				allowAllOneFlag: false,
				disallowAllOneText: $.su.CHAR.VTYPETEXT.IP_NO_ALL_ONE,
				disallowFirstZeroFlag: true,
				disallowFirstZeroText: $.su.CHAR.VTYPETEXT.IP_NO_FIRST_ZERO,
				disallowFirstAllOneText: $.su.CHAR.VTYPETEXT.IP_NO_FIRST_ALL_ONE,
				regex: /^(\d{1,2}|1\d\d|2[0-4]\d|25[0-5]|0\d\d)(\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5]|0\d\d)){3}$/,
				validator: function (value) {
					var ipStr = value;
					var szarray = [0, 0, 0, 0];
					var remain;
					var i;
					for (i = 0; i < 3; i++) {
						var n = ipStr.indexOf('.');
						szarray[i] = ipStr.substring(0, n);
						remain = ipStr.substring(n + 1);
						ipStr = remain;
					}
					szarray[3] = remain;
					for (i = 0; i < 4; i++) {
						if (szarray[i] < 0 || szarray[i] > 255) {
							return false;
						}
					}

					if (!this.allowLoopFlag) {
						if (szarray[0] == 127) {
							return this.disallowLoopText;
						}
					}
					if (!this.allowDTypeFlag) {
						if (szarray[0] >= 224 && szarray[0] <= 239) {
							return this.disallowDTypeText;
						}
					}
					if (!this.allowETypeFlag) {
						if (szarray[0] >= 240 && szarray[0] <= 254) {
							return this.disallowETypeText;
						}
					}

					if (!this.allowAllOneFlag) {
						// if(szarray[0]==255)
						// {
						// 	return this.disallowAllOneText;
						// }
						if (szarray[0] == 255 && szarray[1] == 255 && szarray[2] == 255 && szarray[3] == 255) {
							return this.disallowAllOneText;
						}
						if (szarray[0] == 255) {
							return this.disallowFirstAllOneText;
						}
					} else {
						if (szarray[0] == 255 && szarray[1] == 255 && szarray[2] == 255 && szarray[3] == 255) {
						} else {
							if (szarray[0] == 255) {
								return this.disallowFirstAllOneText;
							}
						}
					}
					if (!this.allowAllZeroFlag) {
						if (szarray[0] == 0 && szarray[1] == 0 && szarray[2] == 0 && szarray[3] == 0) {
							return this.disallowAllZeroText;
						}
					}

					if (this.disallowFirstZeroFlag) {
						if (szarray[0] == 0 && (szarray[1] != 0 || szarray[2] != 0 || szarray[3] != 0)) {
							return this.disallowFirstZeroText;
						}
					}

					return true;
				},
				vtypeText: $.su.CHAR.VTYPETEXT.IP
			},
			// CIDR 无类别域间路由：https://en.wikipedia.org/wiki/Classless_Inter-Domain_Routing
			cidr: {
				allowMultiInput: false, // 是否允许多填
				allowBroadcast: false, // 掩码长度是否允许为 0
				validator: function (cidrStr) {
					var cidrReg = /^((2(5[0-5]|[0-4]\d))|[0-1]?\d{1,2})(\.((2(5[0-5]|[0-4]\d))|[0-1]?\d{1,2})){3}\/([1-9]|[1-2]\d|3[0-2])$/;
					var allowBroadcastReg = /^((2(5[0-5]|[0-4]\d))|[0-1]?\d{1,2})(\.((2(5[0-5]|[0-4]\d))|[0-1]?\d{1,2})){3}\/([0-9]|[1-2]\d|3[0-2])$/;

					if (this.allowMultiInput) {
						cidrReg = /^((((2(5[0-5]|[0-4]\d))|[0-1]?\d{1,2})(\.((2(5[0-5]|[0-4]\d))|[0-1]?\d{1,2})){3}\/([1-9]|[1-2]\d|3[0-2]))[,$]?)+$/;
						allowBroadcastReg = /^((((2(5[0-5]|[0-4]\d))|[0-1]?\d{1,2})(\.((2(5[0-5]|[0-4]\d))|[0-1]?\d{1,2})){3}\/([0-9]|[1-2]\d|3[0-2]))[,$]?)+$/;
					}

					var isValid = (this.allowBroadcast ? allowBroadcastReg : cidrReg).test(cidrStr);

					if (!isValid) {
						return $.su.CHAR.VTYPETEXT.INVALIDTEXT;
					}

					// 非多填项只需要校验格式
					if (!this.allowMultiInput) {
						return true;
					}

					// 校验网段冲突
					cidrStr = cidrStr.replace(/(,*$)/g, '');
					var cidrArr = cidrStr.split(',');
					var cidrArrLen = cidrArr.length;

					if (cidrArrLen === 1) {
						return true;
					}

					for (var i = 0; i < cidrArrLen; i++) {
						for (var j = i + 1; j < cidrArrLen; j++) {
							if ($.su.isCidrConflict(cidrArr[i], cidrArr[j])) {
								return $.su.CHAR.VTYPETEXT.INVALIDTEXT;
							}
						}
					}

					return true;
				}
			},
			ipRange: {
				validator: function (value) {
					function ipToInt(str_ip) {
						var patternIp = /^\s*[0-9]{1,3}\.{1}[0-9]{1,3}\.{1}[0-9]{1,3}\.{1}[0-9]{1,3}\s*$/;
						var ip_array = str_ip.split('.');

						if (ip_array.length != 4) {
							return -1;
						}

						if (!patternIp.test(str_ip)) {
							return -1;
						}

						return Number(ip_array[0]) * (1 << 24) + ((Number(ip_array[1]) << 16) | (Number(ip_array[2]) << 8) | Number(ip_array[3]));
					}

					var reg = /^(\d{1,2}|1\d\d|2[0-4]\d|25[0-5]|0\d\d)(\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5]|0\d\d)){3}$/;

					var list = value.split('-');

					if (list.length == 1) {
						var ipStart = list[0];
						if (ipStart == '0.0.0.0') {
							return $.su.CHAR.VTYPETEXT.IP_ALL_ZERO;
						}
						if (reg.test(ipStart) == false) {
							return $.su.CHAR.VTYPETEXT.IP_FORMAT;
						}
					} else if (list.length == 2) {
						var ipStart = list[0];
						var ipEnd = list[1];
						if (reg.test(ipStart) != true) {
							if (reg.test(ipStart) == false) {
								return $.su.CHAR.VTYPETEXT.IP_FORMAT;
							}
						}
						if (reg.test(ipEnd) != true) {
							if (reg.test(ipEnd) == false) {
								return $.su.CHAR.VTYPETEXT.IP_FORMAT;
							}
						}
						if (ipToInt(ipStart) >= ipToInt(ipEnd)) {
							return $.su.CHAR.VTYPETEXT.IP_RANGE; //smb.charset.validation.ipRange;
						}
						return true;
					} else {
						return $.su.CHAR.VTYPETEXT.IP_RANGE_NUM; //smb.charset.validation.ipRangeNum;
					}

					return true;
				}
			},
			portRange: {
				validator: function (value) {
					function isInt(value) {
						var pattern_int = /^[0-9]+$/;
						if (pattern_int.test(value) == false) {
							return $.su.CHAR.VTYPETEXT.NUMBER; //$.su.CHAR.VTYPETEXT.PORT_START_ERR;
						} else {
							return true;
						}
					}

					var list = value.split('-');
					if (list.length == 1) {
						var portStart = list[0];
						if (Number(portStart) < 1) {
							return $.su.CHAR.VTYPETEXT.PORT_START_ERR;
						}
						if (Number(portStart) > 65535) {
							return $.su.CHAR.VTYPETEXT.PORT_END_ERR;
						}
						return isInt(portStart);
					} else if (list.length == 2) {
						var portStart = list[0];
						var portEnd = list[1];
						if (isInt(portStart) && isInt(portEnd)) {
							if (Number(portStart) < Number(portEnd)) {
								if (Number(portStart) < 1) {
									return $.su.CHAR.VTYPETEXT.PORT_START_ERR;
								}
								if (Number(portEnd) > 65535) {
									return $.su.CHAR.VTYPETEXT.PORT_END_ERR;
								}
								return true;
							} else {
								return $.su.CHAR.VTYPETEXT.PORT_RANGE_ERR;
							}
						} else {
							return $.su.CHAR.VTYPETEXT.PORT_RANGE_FORMAT;
						}
					} else {
						return $.su.CHAR.VTYPETEXT.PORT_RANGE_INVALID;
					}
					return true;
				}
			},
			timeRange: {
				validator: function (value) {
					function timeToInt(value) {
						var tmTemp = value.split(':');
						data = tmTemp[0].toString() + tmTemp[1].toString();
						data = Number(data);
						if (data == 0) {
							data = '0000';
						}
						return data;
					}

					function isTimeStart(value) {
						var pattern_time = /^[0-9]{1,2}\:{1}[0-9]{1,2}$/g;
						if (!pattern_time.test(value)) {
							return $.su.CHAR.VTYPETEXT.TIME_FORMAT;
						}
						var time_slice = value.indexOf(':');
						var hour = parseInt(value.slice(0, time_slice), 10);
						var mins = parseInt(value.slice(time_slice + 1), 10);
						if (hour < 0 || hour >= 24) {
							return $.su.CHAR.VTYPETEXT.TIME_FORMAT;
						}
						if (mins < 0 || mins >= 60) {
							return $.su.CHAR.VTYPETEXT.TIME_FORMAT;
						}
						if (hour == 24 && mins > 0) {
							return $.su.CHAR.VTYPETEXT.TIME_START;
						}
						return true;
					}

					function isTimeEnd(value) {
						var pattern_time = /^[0-9]{1,2}\:{1}[0-9]{1,2}$/g;
						if (!pattern_time.test(value)) {
							return $.su.CHAR.VTYPETEXT.TIME_FORMAT;
						}
						var time_slice = value.indexOf(':');
						var hour = parseInt(value.slice(0, time_slice), 10);
						var mins = parseInt(value.slice(time_slice + 1), 10);
						if (hour < 0 || hour > 24) {
							return $.su.CHAR.VTYPETEXT.TIME_FORMAT;
						}
						if (mins < 0 || mins >= 60) {
							return $.su.CHAR.VTYPETEXT.TIME_FORMAT;
						}
						if (hour == 0 && mins == 0) {
							return false;
						}
						if (hour == 24 && mins > 0) {
							return $.su.CHAR.VTYPETEXT.TIME_END;
						}
						return true;
					}

					var list = value.split('-');

					if (list != '' && list.length == 1) {
						return $.su.CHAR.VTYPETEXT.TIME_END;
					} else if (list.length == 2) {
						var timeStart = list[0];
						var timeEnd = list[1];
						if (isTimeStart(timeStart) == true && isTimeEnd(timeEnd) == true) {
							var timeStart = timeToInt(list[0]);
							var timeEnd = timeToInt(list[1]);
							if (timeStart < timeEnd) {
								return true;
							} else {
								return $.su.CHAR.VTYPETEXT.TIME_RANGE;
							}
						} else if (isTimeStart(timeStart) != true) {
							return $.su.CHAR.VTYPETEXT.TIME_START;
						} else if (isTimeEnd(timeEnd) != true) {
							return $.su.CHAR.VTYPETEXT.TIME_END;
						}
					} else {
						return $.su.CHAR.VTYPETEXT.TIME_FORMAT;
					}

					return true;
				}
			},
			ip_no_zero: {},
			mac: {
				regex: /^[a-fA-F\d]{2}\-[a-fA-F\d]{2}\-[a-fA-F\d]{2}\-[a-fA-F\d]{2}\-[a-fA-F\d]{2}\-[a-fA-F\d]{2}$/,
				disallowAllMultiText: $.su.CHAR.VTYPETEXT.MULTI_MAC,
				validator: function (value) {
					var patternMulti = /^\s*[0-9A-Fa-f]{1}[13579bdfBDF]{1}(\-[A-Fa-f0-9]{2}){5}\s*$/;
					var flag = patternMulti.test(value);
					if (flag) {
						return this.disallowAllMultiText;
					}

					var patternZero = /^(0{1,2}-){5}0{1,2}$/;
					if (patternZero.test(value)) {
						return this.disallowAllMultiText;
					}

					return true;
				},
				vtypeText: $.su.CHAR.VTYPETEXT.MAC
			},
			netmask: {
				//regex: /^(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])(\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])){3}$/,
				allowAllOneFlag: false,
				disallowAllOneText: $.su.CHAR.VTYPETEXT.MASK_NO_ALL_ONE,
				regex:
					/^(254|252|248|240|224|192|128)\.0\.0\.0$|^(255\.(254|252|248|240|224|192|128|0)\.0\.0)$|^(255\.255\.(254|252|248|240|224|192|128|0)\.0)$|^(255\.255\.255\.(254|252|248|240|224|192|128|0))$|^255.255.255.255$/,
				vtypeText: $.su.CHAR.VTYPETEXT.MASK,
				validator: function (value) {
					if (value == '255.255.255.255') {
						if (this.allowAllOneFlag) {
							return true;
						} else {
							return this.disallowAllOneText;
						}
					}
					return true;
				}
			},
			string_ip_domain: {
				regex: /^[A-Za-z0-9\_\-]+\.{1,}/,
				vtypeText: $.su.CHAR.VTYPETEXT.STRING_DOMAIN,
				validator: function (value) {
					var regex = /^\S+$/;
					if (!regex.test(value)) {
						return $.su.CHAR.VTYPETEXT.STRING_DOMAIN;
					}
					return true;
				}
			},
			string_ip_domain_no_loop: {
				regex: /^[A-Za-z0-9\_\-]+\.{1,}/,
				validator: function (value) {
					if (value == '127.0.0.1') {
						return $.su.CHAR.ERROR['00000131'];
					}
					return true;
				},
				vtypeText: $.su.CHAR.VTYPETEXT.STRING_DOMAIN
			},
			ip_domain: {
				regex: /^.+$/,
				vtypeText: $.su.CHAR.VTYPETEXT.IP_DOMAIN,
				validator: function (value) {
					if ($.su.Vtype.types['ip'].regex.test(value) === true && $.su.Vtype.types['ip'].validator(value) === true) {
						return true;
					} else {
						if ($.su.Vtype.types['domain'].regex.test(value) === true) {
							return true;
						}
						return $.su.CHAR.VTYPETEXT.IP_DOMAIN;
					}
					return $.su.CHAR.VTYPETEXT.IP_DOMAIN;
				}
			},
			domain: {
				regex: /^([a-zA-Z0-9]([a-zA-Z0-9\-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,26}$/,
				vtypeText: $.su.CHAR.VTYPETEXT.DOMAIN
			},
			domain_header: {
				regex: /^[a-zA-Z0-9]([a-zA-Z0-9\-]{0,61}[a-zA-Z0-9]*)$/,
				vtypeText: $.su.CHAR.VTYPETEXT.DOMAIN
			},
			ascii_visible: {
				regex: /^[\x21-\x7e]+$/,
				vtypeText: $.su.CHAR.VTYPETEXT.ASCII_VISIBLE
			},
			ascii_allow_blank: {
				regex: /^[\x20-\x7e]+$/,
				vtypeText: $.su.CHAR.VTYPETEXT.ASCII_VISIBLE
			},
			symbols_combined_pws: {
				validator: function (val) {
					var letterReg = /[a-zA-Z]/g;
					var numReg = /[0-9]/g;
					var symbolReg = /[\`\~\!\@\#\$\%\^\&\*\(\)\-\=\_\+\[\]\{\}\;\:\'\"\\\|\/\?\.\,\<\>\x20]/g;
					if (Boolean(letterReg.test(val)) + Boolean(numReg.test(val)) + Boolean(symbolReg.test(val)) >= 2) {
						return true;
					} else {
						return $.su.CHAR.VTYPETEXT.PWD_SYMBOL_CHECK;
					}
				}
			},
			string_no_spaces: {
				validator: function (val) {
					var spacesReg = /[\s]/i;
					if (!spacesReg.test(val)) {
						return true;
					} else {
						return $.su.CHAR.VTYPETEXT.PWD_NOSPACE_CHECK;
					}
				}
			},
			string_visible: {
				regex: /^\S+$/,
				vtypeText: $.su.CHAR.VTYPETEXT.STRING_VISIBLE
			},
			string_visible_no_comma: {
				regex: /^\S+$/,
				vtypeText: $.su.CHAR.VTYPETEXT.STRING_VISIBLE_NO_COMMA,
				validator: function (value) {
					if (value.indexOf(',') >= 0) {
						return $.su.CHAR.VTYPETEXT.STRING_VISIBLE_NO_COMMA;
					}
					return true;
				}
			},
			password: {
				regex: /^[A-Za-z0-9\`\~\!\@\#\$\&\*\(\)\-\=\_\+\[\]\{\}\;\:\'\"\\\|\/\?\.\,\<\>\%\^\/\ ]+$/,
				vtypeText: $.su.CHAR.VTYPETEXT.PWD
			},

			portal_password: {
				regex: /^[A-Za-z0-9_]+$/,
				vtypeText: $.su.CHAR.ERROR['00000259'],
				validator: function (value) {
					if (value.length < 8 || value.length > 16) {
						return $.su.CHAR.ERROR['00000259'];
					}
					return true;
				}
			},

			psk_password: {
				regex: /^([A-Za-z0-9\`\~\!\@\#\$\%\^\&\*\(\)\-\=\_\+\[\]\{\}\;\:\'\"\\\|\/\?\.\,\<\>\ ]{8,63}|[0-9a-fA-F]{8,64})$/,
				vtypeText: $.su.CHAR.ERROR['00000066']
			},

			wpa3_password: {
				regex: /^([A-Za-z0-9\`\~\!\@\#\$\%\^\&\*\(\)\-\=\_\+\[\]\{\}\;\:\'\"\\\|\/\?\.\,\<\>\ ]{8,63})$/,
				vtypeText: $.su.CHAR.ERROR['00004193']
			},

			portal_domain_name: {
				regex:
					/((http|ftp|https):\/\/)*(([a-zA-Z0-9\._-]+\.[a-zA-Z]{2,6})|([0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}))(:[0-9]{1,4})*(\/[a-zA-Z0-9\&%_\.\/-~-]*)?/,
				vtypeText: $.su.CHAR.VTYPETEXT.INVALIDTEXT
			},
			protal_title: {
				//regex: /^\S+$/,
				vtypeText: $.su.CHAR.ERROR['00000256'],
				validator: function (value) {
					if (value.length > 31) {
						return false;
					}
					return true;
				}
			},
			protal_content: {
				vtypeText: $.su.CHAR.ERROR['00000257'],
				validator: function (value) {
					if (value.length > 200) {
						return $.su.CHAR.ERROR['00000257'];
					}
					return true;
				}
			},
			string_visible_allow_blank: {
				regex: /^(\S|\x20)+$/,
				vtypeText: $.su.CHAR.VTYPETEXT.STRING_VISIBLE_ALLOW_BLANK
			},
			string_visible_describe: {
				regex: /^[A-Za-z0-9\-\_]+$/,
				vtypeText: $.su.CHAR.VTYPETEXT.INVALIDTEXT
			},
			name: {
				regex: /^[A-Za-z0-9\_]+$/,
				vtypeText: $.su.CHAR.VTYPETEXT.NAME
			},
			name_special: {
				regex: /^[A-Za-z0-9\_\-]+$/,
				vtypeText: $.su.CHAR.VTYPETEXT.NAME,
				validator: function (value) {
					if (value.length < 4) {
						return false;
					}
					return true;
				}
			},
			name_with_special_start: {
				regex: /^[a-zA-Z_]/,
				vtypeText: $.su.CHAR.VTYPETEXT.NAME_START
			},
			name_in_vpn: {
				regex: /^[a-zA-Z0-9\_][A-Za-z0-9\_\-]{0,14}$/,
				vtypeText: $.su.CHAR.VTYPETEXT.VPN_NAME_PWD
			},
			pwd_in_vpn: {
				regex: /^[A-Za-z0-9\_\-]{1,15}$/,
				vtypeText: $.su.CHAR.VTYPETEXT.INVALIDTEXT
			},
			username_password_in_vpn_server_account: {
				regex: /^[a-zA-Z0-9`-~!#$%^()_'{}]{1,64}$/,
				vtypeText: $.su.CHAR.VTYPETEXT.INVALIDTEXT
			},
			des_in_vpn_client: {
				regex: /^[a-zA-Z0-9`-~!#$%^()_'{} @&]{1,64}$/,
				vtypeText: $.su.CHAR.VTYPETEXT.INVALIDTEXT
			},
			username_password_in_vpn_client: {
				regex: /^[a-zA-Z0-9`-~!#$%^()_'{}=*+[\]\\;,.\/|:? @&"]{1,64}$/,
				vtypeText: $.su.CHAR.VTYPETEXT.INVALIDTEXT
			},
			cloud_username: {
				regex: /^[\s\S]*?$/,
				vtypeText: $.su.CHAR.VTYPETEXT.NAME
			},
			cloud_email: {
				regex: /^[a-zA-Z0-9\.\!\#\$\%\&\'\*\+\/\=\?\^\_\`\{\|\}\~\-]+@[a-zA-Z0-9-]+(\.[a-zA-Z0-9-]+)*$/,
				vtypeText: $.su.CHAR.VTYPETEXT.EMAIL
			},
			cloud_pwd: {
				regex: /^[\x21-\x7E]{6,32}$/,
				vtypeText: $.su.CHAR.VTYPETEXT.PWD
			},
			note: {
				regex: /^[A-Za-z0-9\`\~\!\@\#\$\%\^\&\*\(\)\-\=\_\+\[\]\{\}\;\:\'\"\\\|\/\?\.\,\<\>\ ]*$/,
				vtypeText: $.su.CHAR.VTYPETEXT.NOTE
			},
			sim_pin: {
				regex: /^[0-9]{4}$/,
				vtypeText: $.su.CHAR.VTYPETEXT.SIM_PIN
			},
			sim_dialnum: {
				regex: /^[0-9*#]{0,118}$/,
				vtypeText: $.su.CHAR.VTYPETEXT.SIM_DIALNUM
			},
			port: {
				validator: function (value) {
					var patternPort = /^\s*[0-9]+\s*$/;
					var strPortRange = value.toString();
					var subArray = strPortRange.split('-');
					var len = subArray.length;
					if (len > 2) {
						return $.su.CHAR.VTYPETEXT.PORT_RANGE_FORMAT;
					}
					for (var i = 0; i < len; i++) {
						if (subArray[i].length == 0 || !patternPort.test(subArray[i]) || parseInt(subArray[i]) < 1 || parseInt(subArray[i]) > 65535) {
							return $.su.CHAR.VTYPETEXT.PORT_RANGE_OUT;
						}
					}
					return true;
				}
			},
			time_start: {
				validator: function (value) {
					var patternTime = /^[0-9]{1,2}\:{1}[0-9]{1,2}$/g;
					if (!patternTime.test(value)) {
						return $.su.CHAR.VTYPETEXT.TIME_FORMAT;
					}
					var timeSlice = value.indexOf(':');
					var hour = parseInt(value.slice(0, timeSlice), 10);
					var mins = parseInt(value.slice(timeSlice + 1), 10);
					if (hour < 0 || hour >= 24) {
						return $.su.CHAR.VTYPETEXT.TIME_FORMAT;
					}
					if (mins < 0 || mins >= 60) {
						return $.su.CHAR.VTYPETEXT.TIME_FORMAT;
					}
					if (hour == 24 && mins > 0) {
						return $.su.CHAR.VTYPETEXT.TIME_START;
					}
					return true;
				}
			},
			time_end: {
				validator: function (value) {
					var patternTime = /^[0-9]{1,2}\:{1}[0-9]{1,2}$/g;
					if (!patternTime.test(value)) {
						return $.su.CHAR.VTYPETEXT.TIME_FORMAT;
					}
					var timeSlice = value.indexOf(':');
					var hour = parseInt(value.slice(0, timeSlice), 10);
					var mins = parseInt(value.slice(timeSlice + 1), 10);
					if (hour < 0 || hour > 24) {
						return $.su.CHAR.VTYPETEXT.TIME_FORMAT;
					}
					if (mins < 0 || mins >= 60) {
						return $.su.CHAR.VTYPETEXT.TIME_FORMAT;
					}
					if (hour == 0 && mins == 0) {
						return $.su.CHAR.VTYPETEXT.TIME_END;
					}
					if (hour == 24 && mins > 0) {
						return $.su.CHAR.VTYPETEXT.TIME_END;
					}
					return true;
				}
			},
			time: {
				format: 'hh:mm:ss',
				validator: function (value) {
					if (this.format === 'hh:mm:ss') {
						var HhMmSs = /^(?:[01]\d|2[0-3])(?::[0-5]\d){2}$/;
						if (HhMmSs.test(value) === false) {
							return $.su.CHAR.VTYPETEXT.TIME_FORMAT;
						}
					} else if (this.format === 'hh:mm') {
						var HhMm = /^(?:[01]\d|2[0-3])(?::[0-5]\d){1}$/;
						if (HhMm.test(value) === false) {
							return $.su.CHAR.VTYPETEXT.TIME_FORMAT;
						}
					}
					return true;
				}
			},
			username: {
				regex: /^[A-Za-z0-9\`\~\!\@\#\$\%\^\&\*\(\)\-\=\_\+\[\]\{\}\;\:\'\"\\\|\/\?\.\,\<\>\ ]+$/,
				vtypeText: $.su.CHAR.VTYPETEXT.USERNAME
			},
			adminName: {
				regex: /^[A-Za-z0-9\-\_\@\.]+$/,
				vtypeText: $.su.CHAR.VTYPETEXT.USERNAME
			},
			securityPwd: {
				validator: function (value) {
					if (value.length >= 8 && value.length < 64) {
						var patternPassword = /^[A-Za-z0-9\`\~\!\@\#\$\&\*\(\)\-\=\_\+\[\]\{\}\;\:\'\"\\\|\/\?\.\,\<\>\%\^\ ]+$/;
						if (value && !patternPassword.test(value)) {
							return $.su.CHAR.VTYPETEXT.ILLEGAL_PWD;
						}
					} else if (value.length == 64) {
						var patternPassword = /^[A-Fa-f0-9]+$/;
						if (value && !patternPassword.test(value)) {
							return smb.charset.validation.ILLEGAL_PWD;
						}
					}
					return true;
				}
			},
			wanPwd: {
				regex: /^[A-Za-z0-9\`\~\!\@\#\$\&\*\(\)\-\=\_\+\[\]\{\}\;\:\'\"\\\|\/\?\.\,\<\>\%\^\/\ ]+$/,
				vtypeText: $.su.CHAR.VTYPETEXT.PASSWORD_FORMAT
			},
			userPwd: {
				regex: /^[A-Za-z0-9\`\~\!\@\#\$\&\*\(\)\-\=\_\+\[\]\{\}\;\:\'\"\\\|\/\?\.\,\<\>\%\^\/]+$/,
				vtypeText: $.su.CHAR.VTYPETEXT.PASSWORD_FORMAT
			},
			serviceName: {
				regex: /^[A-Za-z0-9\`\~\!\@\#\$\&\*\(\)\-\=\_\+\[\]\{\}\;\:\'\"\\\|\/\?\.\,\<\>\%\^\/\ ]+$/,
				vtypeText: $.su.CHAR.VTYPETEXT.SERVICE_NAME
			},
			acName: {
				regex: /^[A-Za-z0-9\`\~\!\@\#\$\&\*\(\)\-\=\_\+\[\]\{\}\;\:\'\"\\\|\/\?\.\,\<\>\%\^\/\ ]+$/,
				vtypeText: $.su.CHAR.VTYPETEXT.AC_NAME
			},
			integer: {
				regex: /^[0-9]+$/,
				vtypeText: $.su.CHAR.VTYPETEXT.INTEGER_INVALID,
				validator: function (value) {
					if (this.max !== null || this.max !== undefined) {
						if (value > this.max) {
							if (this.min !== null || this.min !== undefined) {
								var str = $.su.CHAR.VTYPETEXT.NUMBER_MIN_MAX.replace('%min', this.min.toString()).replace('%max', this.max.toString());
								return str;
							} else {
								var str = $.su.CHAR.VTYPETEXT.NUMBER_MAX.replace('%max', this.max.toString());
								return str;
							}
						}
					}

					if (this.min !== null || this.min !== undefined) {
						if (value < this.min) {
							if (this.max !== null || this.max !== undefined) {
								var str = $.su.CHAR.VTYPETEXT.NUMBER_MIN_MAX.replace('%min', this.min.toString()).replace('%max', this.max.toString());
								return str;
							} else {
								var str = $.su.CHAR.VTYPETEXT.NUMBER_MIN.replace('%min', this.min.toString());
								return str;
								//return 	$.su.CHAR.VTYPETEXT.NUMBER_MIN.replace("%min", this.min.toString());
							}
						}
					}
					return true;
				}
			},
			groupKey: {
				validator: function (value) {
					if (value !== 0 && value < 30) {
						return $.su.CHAR.VTYPETEXT.MIN_THIRTY;
					} else if (value !== 0 && value > 1000000) {
						return $.su.CHAR.VTYPETEXT.MAX_MILLION;
					}
					return true;
				}
			},
			ipMask: {
				allowAllZero: false,
				allowAny: false,
				validator: function (value) {
					var index = value.indexOf('/');
					var ip = value.slice(0, index);
					var mask = value.slice(index + 1, value.length);
					if (mask <= 0 || mask > 32) {
						return $.su.CHAR.VTYPETEXT.IP_MASK_UNION;
					}
					var patternIp = /^[0-9]{1,3}\.{1}[0-9]{1,3}\.{1}[0-9]{1,3}\.{1}[0-9]{1,3}$/;
					if (!patternIp.test(value)) {
						return $.su.CHAR.VTYPETEXT.IP_MASK_UNION;
					}
					var subArray = value.split('.');
					for (i = 0; i < 4; i++) {
						if (subArray[i] < 0 || subArray[i] > 255) {
							return $.su.CHAR.VTYPETEXT.IP_MASK_UNION;
						}
					}
					if (!this.allowAllZero) {
						if (
							parseInt(subArray[0], 10) == 0 &&
							parseInt(subArray[1], 10) == 0 &&
							parseInt(subArray[2], 10) == 0 &&
							parseInt(subArray[3], 10) == 0
						) {
							return $.su.CHAR.VTYPETEXT.IP_MASK_UNION;
						}
					}
					/************允许255.255.255.255为任意地址ַ***********/
					if (subArray[0] == 255) {
						if (!this.allowAny) {
							return $.su.CHAR.VTYPETEXT.IP_MASK_UNION;
						} else {
							if (!(subArray[1] == 255 && subArray[2] == 255 && subArray[3] == 255)) {
								return $.su.CHAR.VTYPETEXT.IP_MASK_UNION;
							}
						}
					}
					if (subArray[0] >= 240 && subArray[0] <= 254) {
						return $.su.CHAR.VTYPETEXT.IP_MASK_UNION;
					}
					if (subArray[0] >= 224 && subArray[0] <= 239) {
						return $.su.CHAR.VTYPETEXT.IP_MASK_UNION;
					}
					if (subArray[0] == 127) {
						return $.su.CHAR.VTYPETEXT.IP_MASK_UNION;
					}
					return true;
				}
			},
			deviceName: {
				regex: /^[A-Za-z0-9\-\_]+$/,
				vtypeText: $.su.CHAR.VTYPETEXT.DEVICE_NAME_INVALID
			},
			noStartSpace: {
				validator: function (value) {
					var pattern = /^\s+/;
					if (value && pattern.test(value)) {
						return $.su.CHAR.VTYPETEXT.START_SPACE_IS_NOT_ALLOW;
					}
					return true;
				}
			},
			noSpecialChar: {
				validator: function (value) {
					var pattern = /[\s\$\`\#\&\(\)\;\"\'\<\>]+/;
					if (value && pattern.test(value)) {
						return $.su.CHAR.VTYPETEXT.NO_SPECIAL_CHARACTER;
					}
					return true;
				}
			},
			hex: {
				regex: /^[A-Fa-f0-9]*$/,
				vtypeText: $.su.CHAR.VTYPETEXT.INVALIDTEXT
			},
			hex_64: {
				regex: /^[0-9a-fA-F]{10}$/,
				vtypeText: $.su.CHAR.VTYPETEXT['HEX_64']
			},
			hex_128: {
				regex: /^[0-9a-fA-F]{26}$/,
				vtypeText: $.su.CHAR.VTYPETEXT['HEX_128']
			},
			asic_64: {
				regex: /^[A-Za-z0-9\`\~\!\@\#\$\%\^\&\*\(\)\-\=\_\+\[\]\{\}\;\:\'\"\\\|\/\?\.\,\<\>\ ]{5}$/,
				vtypeText: $.su.CHAR.VTYPETEXT['ASIC_64']
			},
			asic_128: {
				regex: /^[A-Za-z0-9\`\~\!\@\#\$\%\^\&\*\(\)\-\=\_\+\[\]\{\}\;\:\'\"\\\|\/\?\.\,\<\>\ ]{13}$/,
				vtypeText: $.su.CHAR.VTYPETEXT['ASIC_128']
			},
			string: {
				regex: /^[A-Za-z0-9\_\-\@\:\/\.]+$/,
				vtypeText: $.su.CHAR.VTYPETEXT.INVALIDTEXT
			},
			numberAndPoint: {
				regex: /^[0-9\.]+$/,
				vtypeText: $.su.CHAR.VTYPETEXT.INVALIDTEXT
			},
			string_file: {
				extension: 'txt', //default
				errorText: $.su.CHAR.ERROR['00000001'], //defult, a function is acceptable
				validator: function (value) {
					var extensionList = $.isArray(this.extension) ? this.extension : [this.extension];
					var extensionStr = extensionList.join('|');
					var extensionReg = new RegExp('.*.(' + extensionStr + ')$', 'i');

					if (extensionReg.test(value)) {
						return true;
					}

					return $.isFunction(this.errorText) ? this.errorText(value) : this.errorText;
				}
			},
			noConsecutive: {
				vtypeText: $.su.CHAR.VTYPETEXT.PWD_CONSECUTIVE_CHECK,
				validator: function (value) {
					var pattern = /(.)\1/g;
					if (value && pattern.test(value)) {
						return $.su.CHAR.VTYPETEXT.PWD_CONSECUTIVE_CHECK;
					}
					return true;
				}
			},
			ssid_string_length_count_byte: {
				regex: /^(\S|\x20)+$/,
				vtypeText: $.su.CHAR.VTYPETEXT.STRING_VISIBLE_ALLOW_BLANK,
				validator: function (value) {
					var total = 0;
					var charCode = 0;
					var len = value.length;

					for (var i = 0; i < len; i++) {
						charCode = value.charCodeAt(i);
						if (charCode <= 0x007f) {
							total += 1;
						} else if (charCode <= 0x07ff) {
							total += 2;
						} else if (charCode <= 0xffff) {
							total += 3;
						} else {
							total += 4;
						}
					}

					if (total > this.max) {
						var str = $.su.CHAR.VTYPETEXT.LEN_MAX.replace('%max', this.max.toString());
						return str;
					}
					return true;
				}
			}
		};
		Vtype.prototype.validate = function (value, options) {
			var defaults = {
				type: 'sample',
				regex: /^[a-zA-Z0-9]&/,
				vtypeText: '',
				validator: null
			};

			var name = '',
				opt = {};

			if ($.type(options) === 'string') {
				name = options;
			} else if ($.type(options) === 'object' && options.vtype) {
				name = options.vtype;
				opt = options;
				if (!name) {
					return true;
				}
			}

			if (!Vtype.types[name]) {
				// var vtypeArray =
				var result = false;
				var orTypeArr = name.split('||');
				for (var i = 0; i < orTypeArr.length; i++) {
					var itemResult = true;
					var andTyprStr = orTypeArr[i];
					var andTypeArr = andTyprStr.split('&&');
					for (var j = 0; j < andTypeArr.length; j++) {
						var type = $.trim(andTypeArr[j]);
						if (!Vtype.types[type]) {
							return null;
						}

						itemResult = this.validate(value, { vtype: type });
						if (itemResult !== true) {
							break;
						}
					}
					if (itemResult === true) {
						result = true;
						break;
					} else {
						result = itemResult;
					}
				}
				return result === true ? true : opt.vtypeText ? opt.vtypeText : result;
			} else {
				defaults = Vtype.types[name];
			}

			var rules = $.extend({}, defaults, opt);

			var resultVal = true;
			var resultReg = true;

			if (rules.regex) {
				resultReg = rules.regex.test(value);
				if (resultReg !== true) {
					if (rules.vtypeText !== undefined || rules.vtypeText !== null || rules.vtypeText !== '') return rules.vtypeText;
				}
			}

			if (rules.validator) {
				resultVal = rules.validator(value);
				if (resultVal !== true) {
					return resultVal;
				}
			}
			return true;
		};

		Vtype.prototype.addVtype = function (newVtype) {
			$.extend(Vtype.types, newVtype);
		};

		return Vtype;
	})();
})(jQuery);
