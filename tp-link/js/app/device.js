$.su.Device = (function () {
	var defaults = {
		CONFIG_URL: './config/device.json',
		NAVIGATOR_URL: './config/navigator.json',
		SEARCH_URL: './config/allModulesToLan.json'
	};

	var Device = function (options) {
		var device = this;
		this.settings = $.extend({}, defaults, options);
		this.settings.DEVICE_NAME_URL = $.su.url('/locale?form=lang');
		this.settings.DEVICE_COUNTRY_URL = $.su.url('/locale?form=country');
		this.service = options.service;
		this.configs = {
			supportLanIptv: true,
			country: ''
		};
		this.modulesToTextMap = {};
		this.service.ajax.request({
			ajax: {
				async: false
			},
			data: {
				operation: 'read'
			},
			url: this.settings.DEVICE_NAME_URL,
			success: function (data) {
				device.configs.deviceName = data.model;
				device.configs.locale = data.locale;
				device.configs.force = data.force;
			}
		});

		this.service.ajax.request({
			ajax: {
				async: false
			},
			data: {
				operation: 'read'
			},
			url: this.settings.DEVICE_COUNTRY_URL,
			success: function (data) {
				var country = data.country || 'US';
				device.configs.country = country.toUpperCase();

				//shareTag
				country = country.toLowerCase();
				device.settings.CONFIG_URL = device.settings.CONFIG_URL.replace('device', 'device.' + country);
				device.settings.NAVIGATOR_URL = device.settings.NAVIGATOR_URL.replace('json', country + '.json');
				//shareTagEnd
			}
		});

		_initConfigs.call(this);

		this.name = 'device';
		$.su.Service.call(this);
	};

	$.su.inherit($.su.Service, Device);

	Device.prototype.reboot = function () {};

	Device.prototype.reset = function () {};

	Device.prototype.getNavigatorUrl = function (mode, isDefault) {
		var navigatorUrl = isDefault ? defaults.NAVIGATOR_URL : this.settings.NAVIGATOR_URL;
		mode = mode === 'router' ? '' : mode + '.';
		return navigatorUrl.replace(/(navigator.)/, '$1' + mode);
	};

	Device.prototype.getProductName = function () {
		var device = this;
		if (this.configs.deviceName === undefined) {
			this.service.ajax.request({
				ajax: {
					async: false
				},
				data: {
					operation: 'read'
				},
				url: this.settings.DEVICE_NAME_URL,
				success: function (data) {
					device.configs.deviceName = data.model;
				}
			});
		}
		return this.configs.deviceName;
	};

	Device.prototype.getRebootTime = function () {
		var device = this;
		if (this.configs.rebootTime === undefined) {
			this.service.ajax.request({
				ajax: {
					async: false
				},
				data: {
					operation: 'read'
				},
				url: this.settings.DEVICE_NAME_URL,
				success: function (data) {
					device.configs.rebootTime = data.rebootTime;
				}
			});
		}
		return this.configs.rebootTime;
	};

	Device.prototype.getLocale = function () {
		var device = this;

		if (this.configs.locale === undefined) {
			this.service.ajax.request({
				ajax: {
					async: false
				},
				data: {
					operation: 'read'
				},
				url: this.settings.DEVICE_NAME_URL,
				success: function (data) {
					device.configs.locale = data.locale;
				}
			});
		}
		return this.configs.locale;
	};

	Device.prototype.getCloudLocale = function () {
		var locale = this.getLocale();
		switch (locale) {
			case 'no_NO':
				return 'nb_NO';
			case 'jp_JP':
				return 'ja_JP';
			case 'es_MX':
				return 'es_LA';
			default:
				return locale;
		}
	};

	Device.prototype.getForce = function () {
		var device = this;
		if (this.configs.force === undefined) {
			this.service.ajax.request({
				ajax: {
					async: false
				},
				data: {
					operation: 'read'
				},
				url: this.settings.DEVICE_NAME_URL,
				success: function (data) {
					device.configs.force = data.force;
				}
			});
		}
		return this.configs.force;
	};

	Device.prototype.getCurrentMode = function () {
		var device = this;
		if (this.configs.mode === undefined) {
			this.service.ajax.request({
				ajax: {
					async: false
				},
				data: {
					operation: 'read'
				},
				url: $.su.url('/admin/system?form=sysmode'),
				success: function (data) {
					var modeSupported = device.configs.supportOperationMode;
					var mode = data.mode;

					device.configs.mode = modeSupported.includes(mode) ? mode : modeSupported[0];
				}
			});
		}
		return this.configs.mode;
	};

	Device.prototype.isMainOperationMode = function () {
		var currentMode = this.getCurrentMode();
		var mainMode = this.configs.supportOperationMode[0];

		return currentMode === mainMode;
	};

	Device.prototype.getCurrentDial = function () {
		var device = this;
		if (this.configs.dialType === undefined) {
			this.service.ajax.request({
				ajax: {
					async: false
				},
				data: {
					operation: 'read'
				},
				url: $.su.url('/admin/network?form=wan_ipv4_status'),
				success: function (data) {
					device.configs.dialType = data.conntype;
				}
			});
		}
		return this.configs.dialType;
	};
	Device.prototype.getIsTriband = function () {
		var device = this;
		if (this.configs.isTriband === undefined) {
			this.service.ajax.request({
				ajax: {
					async: false
				},
				url: this.settings.CONFIG_URL,
				success: function (data) {
					device.configs.isTriband = data.isTriband;
				}
			});
		}
		return this.configs.isTriband;
	};
	Device.prototype.getModulesToTextMap = function () {
		return $.extend({}, this.modulesToTextMap);
	};
	Device.prototype.getNetworkMode = function () {
		var networkMode = [$.su.NETWORK_MODE.MODE_WIRED, $.su.NETWORK_MODE.MODE_2G, $.su.NETWORK_MODE.MODE_IOT_2G];

		if (this.configs.isTriband) {
			networkMode.push($.su.NETWORK_MODE.MODE_5G_1);
			networkMode.push($.su.NETWORK_MODE.MODE_IOT_5G_1);
			networkMode.push($.su.NETWORK_MODE.MODE_5G_2);
			networkMode.push($.su.NETWORK_MODE.MODE_IOT_5G_2);
		} else {
			networkMode.push($.su.NETWORK_MODE.MODE_5G);
			networkMode.push($.su.NETWORK_MODE.MODE_IOT_5G);
		}

		if (this.configs.supportWifi6E) {
			networkMode.push($.su.NETWORK_MODE.MODE_6G);
		}

		return networkMode;
	};

	Device.prototype.getIsBeta = function () {
		var device = this;
		if (this.configs.isBeta === undefined) {
			this.service.ajax.request({
				ajax: {
					async: false
				},
				url: this.settings.CONFIG_URL,
				success: function (data) {
					device.configs.isBeta = data.isBeta;
				}
			});
		}
		return this.configs.isBeta;
	};

	Device.prototype.getWanLanPorts = function () {
		var wanLanPorts = [];

		if (!this.configs.supportWanLanPort) {
			return wanLanPorts;
		}

		var interfaceList = this.configs.supportPorts;
		$.each(interfaceList, function (index, port) {
			if (typeof port === 'string' && /^wanlan/.test(port)) {
				wanLanPorts.push(port);
			}
		});

		var comboReg = /^wanlancombo/;
		var comboArr = [];
		var normalArr = [];

		wanLanPorts.forEach(function (ele) {
			if (comboReg.test(ele)) {
				comboArr.push(ele);
			} else {
				normalArr.push(ele);
			}
		});

		return comboArr.concat(normalArr);
	};

	Device.prototype.isCoincidedWithIptv = function () {
		if (!this.configs.supportWanLanPort) {
			return false;
		}

		var interfaceList = $.su.flat(this.configs.supportPorts);
		var lanList = $.grep(interfaceList, function (port) {
			return /^lan/.test(port);
		});

		// iptv 必须有 4 个 LAN 口
		return lanList.length < 4;
	};

	Device.prototype.switchMode = function (oldValue, newValue, callback) {
		var that = this;
		this.service.loading.show('changeMode');
		this.service.ajax.request({
			url: './data/sysmod.json',
			data: {
				oldValue: oldValue,
				newValue: newValue
			},
			success: function (response) {
				callback(response);
			},
			fail: function () {
				that.service.loading.hide('changeMode');
			},
			error: function () {
				that.service.loading.hide('changeMode');
			}
		});
	};

	Device.prototype.switchDialType = function (dialType) {
		this.configs.dialType = dialType;
	};
	Device.prototype.getSoftwareInfo = function () {
		var device = this;
		if (this.configs.version === undefined) {
			this.service.ajax.request({
				ajax: {
					async: false
				},
				url: './data/systemSummaryConfig.json',
				success: function (data) {
					device.configs.version = data.fw_version;
				}
			});
		}
		return this.configs.version;
	};

	Device.prototype.getHardwareInfo = function () {};

	Device.prototype.getDeviceStatus = function () {
		var device = this;
		this.service.ajax.request({
			ajax: {
				async: false
			},
			url: './data/status.json',
			success: function (data) {
				device.configs.status = data.auth;
			}
		});

		return this.configs.status;
	};

	Device.prototype.getLanIptv = function (finish) {
		return this.configs.supportLanIptv;
	};

	Device.prototype.getLanAgg = function () {
		return this.configs.supportLanAgg;
	};

	Device.prototype.getPortName = function (decodedName) {
		var name = decodedName.split('_')[0];

		var index = '';
		// 旧版本不显示速率只有 lan1——lan8,此时返回 LAN 1 - LAN 8 即可
		var oldPatternReg = /^lan[1-8]$/g;
		if (oldPatternReg.test(name)) {
			index = name.slice(-1);
			return 'LAN ' + index;
		}
		var hasIndex = decodedName.indexOf('_') != -1;

		if (hasIndex) {
			index = ' ' + decodedName.split('_')[1];
		}
		var NameMap = {
			wan: 'WAN',
			lan: 'LAN',
			lan1g: '1Gbps LAN',
			lan2g5: '2.5Gbps LAN',
			lan10g: '10Gbps LAN',
			wanlan1g: '1Gbps WAN/LAN',
			wanlan2g5: '2.5Gbps WAN/LAN',
			wanlan10g: '10Gbps WAN/LAN'
		};

		return NameMap[name] + (hasIndex ? index : '');
	};

	Device.prototype.getOFDMA = function () {
		return this.configs.supportOFDMA;
	};

	Device.prototype.getZeroWaitDFS = function () {
		return this.configs.supportZeroWaitDFS;
	};

	Device.prototype.getConfig = function () {
		return $.extend({}, this.configs);
	};

	Device.prototype.loadNavigator = function (mode, options) {
		options = options || {};
		successCallback = options.successCallback || function () {};

		var _self = this;
		var ajaxOptions = {
			async: !!options.async,
			type: 'GET'
		};
		var localDfd = _loadJsonFile(_self.getNavigatorUrl(mode), ajaxOptions);

		$.when(localDfd)
			.done(successCallback)
			.fail(function () {
				var defaultDfd = _loadJsonFile(_self.getNavigatorUrl(mode, true), ajaxOptions);
				$.when(defaultDfd).done(successCallback);
			});
	};

	Device.prototype.getTimeFormat = function () {
		return this.configs.country === 'BR' ? 'dd-MM-yyyy HH:mm:ss' : 'yyyy-MM-dd HH:mm:ss';
	};

	Device.prototype.supportExtenderGuidance = function () {
		var device = this;

		if (!this.configs.supportExtenderGuidance) {
			return;
		}

		if (this.configs.isShowExtenderGuidance !== undefined) {
			return this.configs.isShowExtenderGuidance;
		}

		var isShowExtenderGuidance = false;
		this.service.ajax.request({
			ajax: {
				async: false
			},
			data: {
				operation: 'read'
			},
			url: $.su.url('/admin/quick_setup?form=check_support_extender_guidance'),
			success: function (data) {
				isShowExtenderGuidance = data.support_extender_guidance === 'yes';
			}
		});
		device.configs.isShowExtenderGuidance = isShowExtenderGuidance;
		return this.configs.isShowExtenderGuidance;
	};

	function _initConfigs() {
		var _self = this;
		var localDfd = _loadJsonFile(_self.settings.CONFIG_URL);
		var localTextMap = _loadJsonFile(_self.settings.SEARCH_URL);

		$.when(localTextMap).done(setTextUrl);

		$.when(localDfd)
			.done(setDeviceConfig)
			.fail(function () {
				var defaultDfd = _loadJsonFile(defaults.CONFIG_URL);
				$.when(defaultDfd).done(setDeviceConfig);
			});

		function setTextUrl(data) {
			$.extend(_self.modulesToTextMap, data);
		}

		function setDeviceConfig(data) {
			$.extend(_self.configs, data);

			var supportRgSec = data.supportRgSec || [];
			$.su.IS_RG_SEC = supportRgSec.indexOf(_self.configs.country) >= 0;

			if (!_self.configs.supportShortGI) {
				delete $.su.CHAR.ADDITIONAL_SETTINGS.SHORT_GI;
			}

			if (!_self.configs.supportLanAgg) {
				delete $.su.CHAR.NETWORK_STATUS.LINK;
				delete $.su.CHAR.NETWORK_LAN.LINK;
				delete $.su.CHAR.NETWORK_IPTV.IPTV_LAN_OCCUPIED;
				delete $.su.CHAR.NETWORK_IPTV.LA;
				delete $.su.CHAR.NETWORK_IPTV.IPTV_VLAN_MSGQS;
				delete $.su.CHAR.NETWORK_IPTV.IPTV_VLAN_MSG;
			}
		}
	}

	function _loadJsonFile(url, options) {
		var dfd = $.Deferred();

		options = options || {};

		$.ajax({
			url: url,
			async: !!options.async,
			type: options.type || 'POST',
			dataType: 'json',
			success: function (data) {
				dfd.resolve(data);
			},
			fail: function () {
				dfd.reject();
			},
			error: function () {
				dfd.reject();
			}
		});

		return dfd;
	}

	return Device;
})();
