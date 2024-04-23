//@ sourceURL=modules/login/controllers.js

/*
 * @description @module login
 * @author
 * @change
 *
 * */
(function ($) {
	$.su.moduleManager.define(
		'login',
		{
			services: ['moduleLoader', 'ajax', 'device', 'language'],
			stores: ['loginLanguageStore'],
			models: ['firmwareModel', 'loginLanguage'],
			views: ['loginView'],
			listeners: {
				ev_on_launch: function (e, me, views, models, stores, deps, services) {
					localStorage.setItem('userInfo', '');
					sessionStorage.removeItem('cloudMsgToken');
					$.su.scrollbar({ ele: '.login-view' });
					var me = this;
					var locale = services.device.getLocale();
					if (services.device.getForce()) {
						me.lang = locale;
						views.loginView.switchLanBtn.setText($.su.CHAR.LANGUAGE[locale.toUpperCase()]);
						models.loginLanguage.language.disable();
					} else {
						stores.loginLanguageStore.load({
							success: function () {
								me.lang = locale;
								models.loginLanguage.language.setValue(locale);
								views.loginView.switchLanBtn.setText($.su.CHAR.LANGUAGE[locale.toUpperCase()]);
							}
						});
					}
					models.firmwareModel.load({
						success: function () {
							var data = models.firmwareModel.getData();

							var hardwareVersion = data.hardwareVersion;
							if (services.device.getConfig().supportFirmwareInfoReplace) {
								hardwareVersion = hardwareVersion.replace('v1.0', 'v1.0/v1.20');
							}
							views.loginView.hardwareVersion.setValue(hardwareVersion);
						}
					});

					// fetch prod name from dut;
					var productName = services.device.getProductName();
					document.title = productName;
					views.loginView.productName.setValue(productName);
					views.loginView.currentOperation.setValue(productName);

					services.ajax.request({
						proxy: 'firstTimeProxy',
						method: 'read',
						success: function (ret) {
							$.encrypt.encryptManager.cleanStorage();
							$.su.encryptor = $.encrypt.encryptManager.genEncryptor();

							var data = ret;
							if (data.is_default == true) {
								me.goToChildModule('initLogin');
								// me.loginType = "initial";
								me.firmwareDefault = true;
							} else if (data.cloud_ever_login == false) {
								me.goToChildModule('localLogin');
								// me.loginType = "normal";
								me.firmwareDefault = false;
							} else {
								me.goToChildModule('localLogin');
								// me.loginType = "cloud";
								me.firmwareDefault = false;
							}
						}
					});

					services.ajax.request({
						url: $.su.url('/domain_login?form=dlogin'),
						data: {
							operation: 'read'
						},
						success: function (ret) {
							var data = ret;
							if (data && data.conflict === true) {
								switch (data.mode) {
									case 0:
										views.loginView.situation0.show();
										views.loginView.situation1.hide();
										views.loginView.ipConflict0.setText($.su.CHAR.INIT.IMPORTANT_UPDATE_INFO + ' ' + data.new_addr + $.su.CHAR.INIT.END);
										break;
									case 1:
										views.loginView.situation0.hide();
										views.loginView.situation1.show();
										views.loginView.ipConflict1.setText(
											$.su.CHAR.INIT.IMPORTANT_UPDATE_INFO + ' ' + data.new_addr + ' ' + $.su.CHAR.INIT.OR + ' ' + data.dst_addr + $.su.CHAR.INIT.END2
										);
										me.dstAddress = '//' + data.dst_addr + data.dst_webpath;
										views.loginView.dstBtn.setText(data.dst_addr);
										views.loginView.newBtn.setText(data.new_addr);
										break;
								}
							}
							if (data && data.redirect) {
								location.href = data.redirect;
							}
						}
					});
				}
			},
			init: function (me, views, models, stores, deps, services) {
				this.control({
					'#ip-conflict-confirm-btn': {
						ev_button_click: function () {
							views.loginView.situation0.hide();
						}
					},
					'#ip-conflict-situation-1-dst': {
						ev_button_click: function () {
							window.location.href = me.dstAddress;
						}
					},
					'#ip-conflict-situation-1-new': {
						ev_button_click: function () {
							views.loginView.situation1.hide();
						}
					},
					'.qs-lan-cb': {
						mouseenter: function () {
							$('.login-lan-button').addClass('hover');
						},
						mouseleave: function () {
							$('.login-lan-button').removeClass('hover');
						},
						ev_view_change: function (e, data) {
							if (data.value !== me.lang) {
								services.language.switchTo(data.value);
							}
						}
					},
					
				});
			}
		},
		function (me, views, models, stores, deps, services) {
			return {
				dstAddress: '',

				setSecondContainerTitle: function (text) {
					views.loginView.currentOperation.setValue(text);
				},

				goToChildModule: (function () {
					var _currentChildModule;
					var _getContainer = function (name) {
						var containerName = name + 'Loader';
						return views.loginView[containerName];
					};
					var _loadedChildrenModule = [];

					var childModuleConfigs = {
						initLogin: {
							container: 'mainContainer', // which login view is the child module in
							reLaunchWhenShow: true // whether to reLaunch when switch to it
						},
						localLogin: {
							container: 'mainContainer', // which login view is the child module in
							reLaunchWhenShow: true // whether to reLaunch when switch to it
						},
						tpLogin: {
							container: 'mainContainer',
							reLaunchWhenShow: true
						},
						localPwdRecovery: {
							container: 'secondaryContainer',
							reLaunchWhenShow: true
						}
					};

					var _getChildModuleViewName = function (name) {
						if (name === 'tpLogin') {
							return 'tpLoginView';
						}
						return null;
					};

					return function (name, callback) {
						if (_currentChildModule) {
							_getContainer(_currentChildModule).hide();
						}
						if (childModuleConfigs[name].container === 'mainContainer') {
							views.loginView.secondaryContainer.hide();
							views.loginView.mainContainer.show();
						} else if (childModuleConfigs[name].container === 'secondaryContainer') {
							views.loginView.mainContainer.hide();
							views.loginView.secondaryContainer.show();
						}

						var childModuleLoader = _getContainer(name);
						childModuleLoader.show();
						if (!($.inArray(name, _loadedChildrenModule) >= 0)) {
							services.moduleLoader.load(
								{
									module: 'login',
									view: 'loginView'
								},
								{
									module: name,
									view: _getChildModuleViewName(name)
								},
								childModuleLoader,
								callback
							);
							!childModuleConfigs[name].reLaunchWhenShow && _loadedChildrenModule.push(name);
						}
						_currentChildModule = name;
					};
				})(),
				CHECK_INTERNET_URL: $.su.url('/login?form=check_internet'),
				hasInternet: function () {
					var dtd = $.Deferred();
					services.ajax.request({
						url: me.CHECK_INTERNET_URL,
						success: function () {
							dtd.resolve(true);
						},
						fail: function () {
							dtd.resolve(false);
						},
						error: function () {
							dtd.resolve(false);
						}
					});
					return dtd.promise();
				},
				unLoad: function () {
					services.moduleLoader.unLoad(views.loginView.tpCloudLoader);
				}
			};
		}
	);
})(jQuery);
