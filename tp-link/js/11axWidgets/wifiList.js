(function ($) {
	var WifiList = $.su.Widget.register('wifiList', {
		settings: {
			operation: {
				attribute: 'operation', // refresh
				defaultValue: ''
			},
			plugins: {
				attribute: 'plugins',
				defaultValue: '' // options: wifiManual
			},
			manualStore: {
				attribute: 'manualStore',
				defaultValue: '' // options: wifiManual
			}
		},
		listeners: [
			{
				selector: '.wifiList-item',
				event: 'click',
				callback: function (e, viewObj) {
					viewObj.hideAllWidget();
					var widgetContent = $(this).closest('.wifiList-wrap').find('.wifiList-item-widget');
					var btn = widgetContent.find('div[widget=button]').data('viewObj');
					widgetContent.show();
					// viewObj.setStatus(true, btn);
					var password = widgetContent.find('.password-text');
					if (password != 0) {
						var psdVal = $(password[0]).val() == '' ? $(password[1]).val() : $(password[0]).val();
						if (psdVal == '') {
							widgetContent.find('div[widget=button]').addClass('disabled');
						}
					}
				}
			},
			{
				selector: '.wifiList-content-inner a.button-button',
				event: 'click',
				callback: function (e, viewObj) {
					var widgetContent = $(this).closest('.wifiList-wrap').find('.wifiList-item-widget');
					// var psd = widgetContent.find("div[widget=password]").data("viewObj");
					var btn = widgetContent.find('div[widget=button]').data('viewObj');
					var password = widgetContent.find('.password-text');
					var psdVal = $(password[0]).val() == '' ? $(password[1]).val() : $(password[0]).val();
					var wifiNameContent = $(this).closest('.wifiList-wrap').find('.wifiList-item');
					var wifiName = wifiNameContent.text();
					var data = {};
					data.ssid = wifiName;
					data.password = psdVal || '';
					viewObj.dom().triggerHandler('ev_connect_click', [data, btn]);
				}
			},
			{
				selector: '.wifiList-content-manual a.button-button',
				event: 'click',
				callback: function (e, viewObj) {
					var widgetContent = $(this).closest('.wifiList-wrap').find('.wifiList-item-widget');
					var btn = widgetContent.find('div[widget=button]').data('viewObj');
					var password = widgetContent.find('.password-text');
					var psdVal = $(password[0]).val() == '' ? $(password[1]).val() : $(password[0]).val();
					var wifiContent = $(this).closest('.wifiList-wrap').find('.wifiList-item-widget');
					var data = {};
					data.ssid = wifiContent.find('div.name-content').find('input').val();
					data.security = wifiContent.find('input.combobox-text').val();
					data.password = psdVal;
					viewObj.dom().triggerHandler('ev_connect_click', [data, btn]);
				}
			},
			{
				selector: '.password-content',
				event: 'keyup',
				callback: function (e, viewObj) {
					var widgetContent = $(this).closest('.wifiList-wrap').find('.wifiList-item-widget');
					var password = widgetContent.find('.password-text');
					var psdVal = $(password[0]).val() == '' ? $(password[1]).val() : $(password[0]).val();
					if (psdVal == '') {
						widgetContent.find('div[widget=button]').addClass('disabled');
					} else {
						widgetContent.find('div[widget=button]').removeClass('disabled');
					}
				}
			},
			{
				selector: '.wifiList-panel-tbar-container .btn-refresh',
				event: 'click',
				callback: function (e, viewObj) {
					viewObj.refresh();
				}
			}
		],
		init: function (options) {},

		render: function () {
			var viewObj = this;
			var dom = this.dom();
			var settings = this.settings;
			var me = this;

			dom.addClass('container widget-container wifiList-panel-container');

			var inHTML = '';
			inHTML += '<div class="wifiList-panel-wrap">';
			inHTML += '<div class="wifiList-panel-content">';
			inHTML += '<div class="wifiList-panel-tbar-container hidden"></div>';
			inHTML += '<div class="wifiList-panel-content-container">';
			inHTML += '<div class="wifiList-content-container">';
			inHTML += '<div class="wifiList-content-inner"></div>';
			inHTML += '<div class="wifiList-content-manual"></div>';
			inHTML += '</div>';
			inHTML += '</div>';
			inHTML += '</div>';
			inHTML += '</div>';

			var wifiList = $(inHTML);
			dom.append(wifiList);

			if (settings.manualStore) {
				this.initManualOptions(settings.manualStore.split('|'));
			}

			// 初始化operation
			if (settings.operation) {
				this.initTBar(settings.operation.split('|'));
			}
			dom.find('div[widget=combobox]').on('ev_view_change', function (e, v) {
				if (v.type == 'value') {
					viewObj.combobox.setValue(v.value);
				}
			});
		},
		initManualOptions: function (options) {
			var me = this;
			var _this = this.dom();
			var viewObj = this;
			var settings = this.settings;

			var manualContainer = this.dom().find('div.wifiList-content-manual');
			var dom = '';
			dom += '<div class="wifiList-wrap">';
			dom += '<div class="wifiList-item">' + 'Manual Setting';
			// dom += '<span class="icon-lock"></span>';
			// dom += '<span class="icon-wifi"></span>';
			dom += '</div>';
			dom += '<div class="wifiList-item-widget">';
			dom += '<div class="name-content">';
			dom += '<div widget="textbox" label-field="' + $.su.CHAR.OPERATION.NETWORK_NAME + '"></div>';
			dom += '</div>';
			dom += '<div class="combobox-content">';
			dom += '<div widget="combobox" data-options="{' + options + '}" label-field="' + $.su.CHAR.OPERATION.SECURITY + '"></div>';
			dom += '</div>';
			dom += '<div class="password-content">';
			dom += '<div widget="password" label-field="' + $.su.CHAR.OPERATION.PASSWORD + '"></div>';
			dom += '</div>';
			dom += '<div class="button-content">';
			dom += '<div widget="button" class="full-line" text="' + $.su.CHAR.OPERATION.CONNECT + '"></div>';
			dom += '</div>';
			dom += '</div>';
			dom += '</div>';

			$(dom).appendTo(manualContainer);

			var widgetTextbox = manualContainer.find('.name-content').find('div[widget=textbox]');
			for (var index = 0, len = widgetTextbox.length; index < len; index++) {
				new $.su.widgets.textbox({ id: $(widgetTextbox[index]) }).render();
			}

			var a;
			var widgetCombobox = manualContainer.find('.combobox-content').find('div[widget=combobox]');
			for (var index = 0, len = widgetCombobox.length; index < len; index++) {
				(a = new $.su.widgets.combobox({ id: $(widgetCombobox[index]), view: this._view })).render();
			}
			viewObj.combobox = a;

			var widgetPassword = manualContainer.find('.password-content').find('div[widget=password]');
			for (var index = 0, len = widgetPassword.length; index < len; index++) {
				new $.su.widgets.password({ id: $(widgetPassword[index]) }).render();
			}

			var btnWidget;
			var widgetButtons = manualContainer.find('.button-content').find('div[widget=button]');
			for (var index = 0, len = widgetButtons.length; index < len; index++) {
				new $.su.widgets.button({ id: $(widgetButtons[index]) }).render();
			}
		},
		initTBar: function (operation) {
			var viewObj = this;
			var tBarContainer = this.dom().find('div.wifiList-panel-tbar-container');
			var settings = this.settings;
			tBarContainer.removeClass('hidden');

			operation = $.isArray(operation) ? operation : [operation];

			var inHTML = '<div class="operation-container" id="' + viewObj.domId + '_' + operation + '">';
			for (var index = 0, len = operation.length; index < len; index++) {
				switch (operation[index]) {
					case 'refresh':
						inHTML += '<a tbar-name="refresh" class="operation-btn btn-refresh">';
						inHTML += '<span class="icon"></span>';
						inHTML += '<span class="text">' + $.su.CHAR.OPERATION.REFRESH + '</span>';
						inHTML += '</a>';
						break;
					default:
						break;
				}
			}
			inHTML += '</div>';

			var toolbar = $(inHTML);
			tBarContainer.append(toolbar);
		},
		syncData: function (keys, callback) {
			this._keys = keys;
			this._items = [];
			this._textList = [];
			var contentContainer = this.dom().find('.wifiList-content-inner');
			contentContainer.empty();
			this.dom().triggerHandler('ev_store_render_items', [keys]);
		},
		renderModels: function (key, models, callback) {
			var me = this;
			var _this = this.dom();
			var settings = this.settings;

			var dom = '';
			for (var i = 0; i < models.length; i++) {
				var item = models[i].getData();
				this._items.push(item);
				dom += this.renderRow(item);
			}
			var innerDom = this.dom().find('.wifiList-content-inner');
			innerDom.append(dom);

			var widgetPassword = innerDom.find('.password-content').find('div[widget=password]');
			for (var index = 0, len = widgetPassword.length; index < len; index++) {
				new $.su.widgets.password({ id: $(widgetPassword[index]) }).render();
			}

			var widgetButtons = innerDom.find('.button-content').find('div[widget=button]');
			for (var index = 0, len = widgetButtons.length; index < len; index++) {
				new $.su.widgets.button({ id: $(widgetButtons[index]) }).render();
			}

			this.hideAllWidget();
		},
		renderRow: function (data) {
			var convertData = this.convert(data);
			this._textList.push(convertData);

			var dom = '';
			dom += '<div class="wifiList-wrap">';
			dom += '<div class="wifiList-item-box">';
			dom += '<div class="wifiList-item">' + convertData.name;
			dom += '<span class="icon-wifi"></span>';
			if (convertData.security !== 'no') {
				dom += '<span class="icon-lock"></span>';
			}
			dom += '</div>';
			dom += '<div class="wifiList-item-widget">';
			if (convertData.security !== 'no') {
				dom += '<div class="password-content">';
				dom += '<div widget="password" label-field="' + $.su.CHAR.OPERATION.PASSWORD + '"></div>';
				dom += '</div>';
			}
			dom += '<div class="button-content">';
			dom += '<div widget="button" class="full-line" text="' + $.su.CHAR.OPERATION.CONNECT + '"></div>';
			dom += '</div>';
			dom += '</div>';
			dom += '</div>';

			dom += '</div>';

			return dom;
		},
		renderLastRow: function () {
			var dom = '';
			dom += '<div class="wifiList-wrap">';
			dom += '<div class="wifiList-item">' + 'Manual Setting';
			dom += '<span class="icon-lock"></span>';
			dom += '<span class="icon-wifi"></span>';
			dom += '</div>';
			dom += '<div class="wifiList-item-widget">';
			dom += '<div class="textbox-content">';
			dom += '<div widget="textbox" label-field="' + $.su.CHAR.OPERATION.NETWORK_NAME + '"></div>';
			dom += '</div>';
			dom += '<div class="combobox-content">';
			dom += '<div widget="combobox" data-options="{securityStore}" label-field="' + $.su.CHAR.OPERATION.SECURITY + '"></div>';
			dom += '</div>';
			dom += '<div class="password-content">';
			dom += '<div widget="password" label-field="' + $.su.CHAR.OPERATION.PASSWORD + '"></div>';
			dom += '</div>';
			dom += '<div class="button-content">';
			dom += '<div widget="button" class="full-line" text="' + $.su.CHAR.OPERATION.CONNECT + '"></div>';
			dom += '</div>';
			dom += '</div>';

			dom += '</div>';

			return dom;
		},
		refresh: function () {
			var store = this.dataBind[0];
			store.load();
			this.dom().triggerHandler('ev_refresh');
		},
		hideAllWidget: function () {
			var widgetContent = this.dom().find('.wifiList-item-widget');
			for (var i = 0; i < widgetContent.length; i++) {
				$(widgetContent[i]).hide();
			}
		},
		convert: function (data) {
			var ret = {};
			ret.name = data.name || 'unknown';
			ret.security = data.security || 'no';
			return ret;
		},
		setStatus: function (status, btnObj) {
			var me = this;
			me.connnectStatus = status ? true : false;
			var targetDom = btnObj.dom().closest('.wifiList-wrap').find('.wifiList-item-widget');
			var targetwidget = targetDom.find('div[widget=password]').data('viewObj');
			if (me.connnectStatus) {
				if (targetwidget) {
					targetwidget.show();
				}
				btnObj.setText('CONNECT');
			} else {
				if (targetwidget) {
					targetwidget.hide();
				}
				btnObj.setText('RETRY');
			}
		}
	});
})(jQuery);
