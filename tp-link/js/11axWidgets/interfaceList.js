(function ($) {
	var INTERFACE_NAME = {
		'1g': '1Gbps',
		'2g5': '2.5Gbps',
		'10g': '10Gbps',
		'10gsfpplus': '10Gbps SFP+',
		combo: '10Gbps'
	};

	var Information = $.su.Widget.register('interfaceList', {
		settings: {},
		listeners: [],
		init: function (options) {},
		render: function () {
			var dom = this.dom();

			dom.addClass('widget-container interface-list-container');
		},
		syncData: function (keys) {
			if (keys.length) {
				var interfaceList = $.su.serviceManager.get('device').getConfig().supportPorts;
				keys = $.su.flat(interfaceList);
			}
			this.dom().triggerHandler('ev_store_render_items', [keys]);
		},
		renderModels: function (key, models, callback) {
			var dom = '';

			if (!models.length) {
				return dom;
			}

			var _self = this;
			var interfaceList = $.su.serviceManager.get('device').getConfig().supportPorts;

			if ($.su.widgetSize === 's') {
				interfaceList = $.su.flat(interfaceList);
			}

			var lanGroupOffset = 0;
			var lanGroupKeys = '';
			var comboModelsData = [];

			$.each(interfaceList, function (index, key) {
				index += lanGroupOffset;
				if (typeof key === 'string') {
					if (key.indexOf('combo') !== -1) {
						comboModelsData.push(models[index].getData());
						dom += _self.generateComboHtml(dom);
					} else {
						dom += _self.generateLanHtml(models[index]);
					}
					return true;
				}

				var lanNumPerLine = key[0].length;
				var totalLanNum = lanNumPerLine * 2;
				lanGroupKeys = key;

				dom += _self.generateLanGroupHtml(models.slice(index, index + totalLanNum));
				lanGroupOffset += totalLanNum - 1;
			});

			this.dom().html(dom);
			this.renderLanGroupSeparator(lanGroupKeys);
			if (comboModelsData.length > 0) {
				this.modifyComboDom(comboModelsData);
			}
		},
		// 用于生成单个端口的 HTML 字符串
		generateLanHtml: function (model) {
			var data = model.getData();

			var inHTML = '';
			inHTML += '<div class="interface-list-item ' + getStatusCls(data) + '">';
			inHTML +=
				'<div class="interface-container"><span class="interface-icon ' +
				getIconCls(data.name) +
				'"></span><p class="interface-name">' +
				getName(data.name, data.is_wan) +
				'</p></div>';
			inHTML += '<div class="interface-separator"></div>';
			inHTML += generateTransmissionHTML(data);
			inHTML += '</div>';

			return inHTML;
		},
		// 用于生成 combo 端口的 HTML 字符串
		generateComboHtml: function (dom) {
			var hasComboHtmlWrap = dom.indexOf('combo-interface-list-item') !== -1;
			if (hasComboHtmlWrap) {
				return '';
			} else {
				return _generateComboHtml();
			}

			function _generateComboHtml() {
				var inHTML = '';
				inHTML += '<div class="interface-list-item combo-interface-list-item">';
				inHTML += '<div class="interface-combo-container">';
				inHTML += '<p class="interface-name">SFP+/RJ45 Combo</p>';
				inHTML +=
					'<svg xmlns="http://www.w3.org/2000/svg" version="1.1" width="100%" height="13" class="interface-combo-line up"><polyline points="18,13 18,1 120,1 120,13" style="fill:none;stroke:#d6d6d6;stroke-width:1" /></svg>';
				inHTML += '<div class="interface-combo-port"></div>';
				inHTML +=
					'<svg xmlns="http://www.w3.org/2000/svg" version="1.1" width="100%" height="14" class="interface-combo-line down"><polyline points="18,0 18,13 30,13" style="fill:none;stroke:#d6d6d6;stroke-width:1" /><polyline points="108,13 120,13 120,0" style="fill:none;stroke:#d6d6d6;stroke-width:1" /></svg>';
				inHTML += '<p class="interface-name interface-combo-name"></p>';
				inHTML += '</div>';
				inHTML += '<div class="interface-separator"></div>';
				inHTML += '</div>';

				return inHTML;
			}
		},
		// 用于生成双排 LAN 口的 HTML 字符串
		generateLanGroupHtml: function (models) {
			var num = models.length / 2,
				offset = num;

			var INTERFACE_ICON = '<div class="interface-group-item %status%"><span class="interface-icon %iconCls%"></span></div>';
			var INTERFACE_NAME_ITEM = '<div class="interface-name-wrap" name="%name%"><p>%type%</p><span class="arrow-icon %iconCls%"></span></div>';

			var inHTML = '<div class="interface-list-item interface-group">';
			var topGroupHTML = '<div class="interface-icon-group group-top">';
			var bottomGroupHTML = '<div class="interface-icon-group">';
			var interfaceNameHTML = '<div class="interface-name-group">';
			var interfaceNameTopHTML = '<div class="interface-name-group-item">';
			var interfaceNameBottomHTML = '<div class="interface-name-group-item">';
			var interfaceInfoHTML = '<div class="interface-info-group">';
			var interfaceInfoTopHTML = '<div class="interface-info-group-item">';
			var interfaceInfoBottomHTML = '<div class="interface-info-group-item">';

			for (var index = 0; index < num; index++) {
				var topData = models[index].getData();
				var bottomData = models[index + offset].getData();
				var topType = topData.name.match(/^lan(.*)/)[1];
				var bottomType = bottomData.name.match(/^lan(.*)/)[1];

				topGroupHTML += INTERFACE_ICON.replace('%status%', getStatusCls(topData)).replace('%iconCls%', getIconCls(topData.name));
				interfaceNameTopHTML += INTERFACE_NAME_ITEM.replace('%name%', topData.name)
					.replace('%type%', INTERFACE_NAME[topType] || topType)
					.replace('%iconCls%', 'arrow-up');
				interfaceInfoTopHTML += generateTransmissionHTML(topData);

				bottomGroupHTML += INTERFACE_ICON.replace('%status%', getStatusCls(bottomData)).replace('%iconCls%', getIconCls(bottomData.name));
				interfaceNameBottomHTML += INTERFACE_NAME_ITEM.replace('%name%', bottomData.name)
					.replace('%type%', INTERFACE_NAME[bottomType] || bottomType)
					.replace('%iconCls%', 'arrow-down');
				interfaceInfoBottomHTML += generateTransmissionHTML(bottomData);
			}

			interfaceNameHTML += interfaceNameTopHTML + '</div>';
			interfaceNameHTML += '<p class="interface-name">LAN</p>';
			interfaceNameHTML += interfaceNameBottomHTML + '</div>';
			interfaceNameHTML += '</div>';

			interfaceInfoHTML += interfaceInfoTopHTML + '</div>';
			interfaceInfoHTML += interfaceInfoBottomHTML + '</div>';
			interfaceInfoHTML += '</div>';

			inHTML += topGroupHTML + '</div>';
			inHTML += bottomGroupHTML + '</div>';
			inHTML += interfaceNameHTML;
			inHTML += '<div class="interface-separator"></div>';
			inHTML += interfaceInfoHTML;
			inHTML += '</div>';

			return inHTML;
		},
		// 用来画双排 LAN 口中端口名与端口信息之间的连线
		renderLanGroupSeparator: function (keys) {
			if (!keys.length) {
				return;
			}

			keys = $.su.flat(keys);

			var dom = this.dom();
			var container = dom.find('.interface-group .interface-separator');
			var containerOffset = container.offset();
			var containerHeight = container.height();

			var totalLanNum = keys.length;
			var lanNumPerLine = totalLanNum / 2;
			var divHeight = containerHeight / lanNumPerLine;
			var svgHTML = '<svg xmlns="http://www.w3.org/2000/svg" version="1.1" width="100%" height="' + containerHeight + '">';
			var polylineHTML = '<polyline points="x1,0 x1,y1 x2,y1 x2,' + containerHeight + '" style="fill:none;stroke:#d6d6d6;stroke-width:1" />';

			var y1 = 0;
			for (var i = 0; i < totalLanNum; i++) {
				var key = keys[i];
				var arrowIcon = dom.find('.interface-name-wrap[name=' + key + ']');
				var arrowIconOffset = arrowIcon.offset();
				var arrowIconWith = arrowIcon.width();
				var infoDom = dom.find('.interface-info-container[name=' + key + ']');
				var infoDomOffset = infoDom.offset();
				var infoDomWidth = infoDom.width();

				var x1 = arrowIconOffset.left - containerOffset.left + arrowIconWith / 2;
				var x2 = infoDomOffset.left - containerOffset.left + infoDomWidth / 2;

				if (i === lanNumPerLine - 1 || i === lanNumPerLine) {
					x2 = x1;
				}

				if (i < lanNumPerLine) {
					y1 += divHeight;
				} else if (i > lanNumPerLine) {
					y1 -= divHeight;
				}

				svgHTML += polylineHTML.replace(/x1/g, x1).replace(/x2/g, x2).replace(/y1/g, y1);
			}

			svgHTML += '</svg>';

			container.html(svgHTML);
		},
		// 用来调整生成时不方便处理的 combo 口 dom 内容
		modifyComboDom: function (dataArr) {
			if (dataArr.length > 2) {
				// combo 口两个一组
				return;
			}

			var dom = this.dom();
			var comboInfoObj = _getComboInfoObj(dataArr);

			_addConnectClass(dom, comboInfoObj);
			_addComboPortSpan(dom, dataArr);
			_addPortName(dom, comboInfoObj);
			_addTransmission(dom, comboInfoObj);

			function _getComboInfoObj(dataArr) {
				var result;
				var status = 'disconnected';
				var is_wan = false;
				var comboName = 'combo';
				var activePort = '';
				var duplex, speed;

				if (dataArr[0].status === 'connected' || dataArr[1].status === 'connected') {
					status = 'connected';
				}
				if (dataArr[0].is_wan === true || dataArr[1].is_wan === true) {
					is_wan = true;
				}
				if (/^wanlancombo/.test(dataArr[0].name) || /^wanlancombo/.test(dataArr[1].name)) {
					comboName = 'wanlancombo';
				}

				if (status === 'connected') {
					dataArr.forEach(function (ele) {
						// combo 口只有一个口生效,取已连接的端口信息
						if (ele.status === 'connected') {
							duplex = ele.duplex.toLowerCase();
							speed = ele.speed;

							if (ele.name.toLowerCase().indexOf('phy') !== -1) {
								activePort += 'phy ';
							} else {
								activePort += 'sfpplus ';
							}
						}
					});
				}

				result = {
					name: comboName,
					status: status,
					is_wan: is_wan,
					duplex: duplex,
					speed: speed,
					activePort: activePort
				};
				return result;
			}
			function _addConnectClass(dom, comboInfoObj) {
				var clsName = getStatusCls(comboInfoObj) + comboInfoObj.activePort;
				dom.find('.combo-interface-list-item').addClass(clsName);
			}
			function _addComboPortSpan(dom, dataArr) {
				var strategies = {
					combophy: '<span class="interface-icon"></span>',
					combosfp: '<span class="interface-icon sfpplus"></span>',
					wanlancombophy: '<span class="interface-icon"></span>',
					wanlancombosfp: '<span class="interface-icon sfpplus"></span>'
				};
				var portsHtml = '';

				for (var i = 0; i < dataArr.length; i++) {
					portsHtml += strategies[dataArr[i].name];
				}
				dom.find('div.interface-combo-port').append(portsHtml);
			}
			function _addPortName(dom, comboInfoObj) {
				var name = getName(comboInfoObj.name, comboInfoObj.is_wan);
				dom.find('.combo-interface-list-item p.interface-combo-name').text(name);
			}
			function _addTransmission(dom, comboInfoObj) {
				var transmissionHTML = generateTransmissionHTML(comboInfoObj);
				dom.find('.combo-interface-list-item').append(transmissionHTML);
			}
		}
	});

	function getStatusCls(data) {
		var statusCls = data.status === 'connected' ? 'connected ' : 'disconnected ';

		return statusCls;
	}
	function getIconCls(name) {
		return /sfpplus/.test(name) ? 'sfpplus' : '';
	}
	function getName(name, isWan) {
		if (name === 'wan' || isWan) {
			return $.su.CHAR.NETWORK_MAP.INTERNET;
		}

		if (name === 'combo') {
			return '10Gbps LAN';
		}

		if (/^wanlan/.test(name)) {
			return INTERFACE_NAME[name.match(/^wanlan(.*)/)[1]] + ' WAN/LAN';
		}

		var info = name.split('_');
		var type = info[0].match(/^lan(.*)/)[1];
		var index = info[1] || '';

		if (INTERFACE_NAME[type]) {
			return INTERFACE_NAME[type] + ' ' + $.su.CHAR.NETWORK_MAP.LAN + index;
		}

		return $.su.CHAR.NETWORK_MAP.LAN + ' ' + type;
	}
	function getSpeed(val) {
		val = parseInt(val, 10);
		if (val > 1000) {
			return val / 1000 + $.su.CHAR.NETWORK_MAP.GBPS_2;
		}
		return val + $.su.CHAR.NETWORK_MAP.MBPS_2;
	}
	function getDuplex(val) {
		if (val.toLowerCase() === 'full') {
			return $.su.CHAR.NETWORK_MAP.FULL_DUPLEX;
		}
		return $.su.CHAR.NETWORK_MAP.HALF_DUPLEX;
	}
	function generateTransmissionHTML(data) {
		var inHTML = '<div class="interface-info-container ' + getStatusCls(data) + '" name="' + data.name + '">';

		if (data.status === 'connected') {
			inHTML += '<p>' + getSpeed(data.speed) + '</p>';
			inHTML += '<p>' + getDuplex(data.duplex) + '</p>';
		} else {
			inHTML += '---';
		}

		inHTML += '</div>';

		return inHTML;
	}
})(jQuery);
