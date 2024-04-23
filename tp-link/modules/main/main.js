//@ sourceURL=modules/main/main.js

// JavaScript Document
(function ($) {
	$.su.moduleManager.define(
		'main',
		{
			services: ['moduleLoader', 'user', 'ajax', 'device'],
			views: ['main'],
			listeners: {
				ev_on_launch: function (e, me, views, models, stores, deps, services) {
					me.syncTokenFromStorage();
					$('#global-splash .outer').css('background-size', 'cover');
					var timer = setTimeout(function () {
						me.hideSplash();
					}, 600);

					if (services.device.getIsBeta()) {
						$('body').addClass('beta');
					} else {
						$('body').removeClass('beta');
					}

					// 如果没登录且支持 TetherGuidance, 则跳转至引导页
					var supportTetherGuidance = services.device.getConfig().supportTetherGuidance;
					if (me.getToken() === '') {
						supportTetherGuidance ? me.loadBasicModule('tetherGuidance') : me.loadBasicModule('login');
						return;
					}

					try {
						$.su.encryptor = $.encrypt.encryptManager.getEncryptor();
						$.su.userInfo = localStorage.getItem('userInfo') ? JSON.parse($.su.DES3.decrypt(localStorage.getItem('userInfo'))) : {};
					} catch (e) {
						me.loadLoginPage();
						return;
					}

					services.ajax.request({
						proxy: 'firmwareProxy',
						method: 'read',
						success: function (data) {
							var qsModule = 'quickSetup';
							me.upgraded = data.upgraded;
							me.rebootTime = data.rebootTime * 1000;

							var defaultCallback = function (res) {
								me.loadBasicModule('index', me.resetUpgradedValue);
							};

							if (location.hash.substr(1) === qsModule || data.isDefault === true) {
								if (location.href.indexOf(qsModule) < 0) {
									location.href = location.href + '#' + qsModule;
								}
								me.loadBasicModule(qsModule);
								return;
							}
							// 支持 tether 引流时不跳入 quicksetup 步骤
							if (!me.upgraded || me.supportTetherGuidance) {
								defaultCallback();
								return;
							}

							services.ajax.request({
								proxy: 'checkInternetProxy',
								success: function (data) {
									services.ajax.request({
										proxy: 'cloudBindStatusProxy',
										method: 'read',
										success: function (data) {
											if (data.isbind) {
												defaultCallback();
											} else {
												me.loadBasicModule(qsModule);
											}
										},
										fail: defaultCallback,
										error: defaultCallback
									});
								},
								fail: defaultCallback,
								error: defaultCallback
							});
						},
						fail: function () {
							me.loadBasicModule('login');
						},
						error: function () {
							me.loadBasicModule('login');
						}
					});

					me.cloudInfo = {};
					if ($.su.userInfo.token) {
						me.cloudInfo.islogined = true;
						me.cloudInfo.username = $.su.userInfo.username;
					}

					services.ajax.request({
						proxy: 'checkUpgradeNumberProxy',
						method: 'read',
						success: function (data) {
							var updateNumber = parseInt(data.updateNumber, 10);
							if (updateNumber > 0) {
								me.showUpgradeHint = true;
							} else {
								me.showUpgradeHint = false;
							}
						}
					});

					me.checkMeshUpdate();
				},
				ev_login_timeout: function () {
					this.onLoginTimeout();
				},
				ev_auto_upgrading: function () {
					this.onAutoUpgrading();
				},
				ev_user_conflict: function () {
					this.onUserConflict();
				},
				ev_permission_denied: function () {
					this.onPermissionDenied();
				}
			},
			init: function (me, views, models, stores, deps, services) {
				this.control({
					'#global-confirm': {
						ev_msg_ok: function (e, msgEv) {
							me.globalConfirmSuccessCallback && me.globalConfirmSuccessCallback.call(null, msgEv);
							me.globalConfirmSuccessCallback = null;
						},
						ev_msg_no: function () {
							me.globalConfirmFailCallback && me.globalConfirmFailCallback.call();
							me.globalConfirmFailCallback = null;
						},
						ev_msg_close: function () {
							me.globalConfirmFailCallback && me.globalConfirmFailCallback.call();
							me.globalConfirmFailCallback = null;
						}
					},
					'#failure-retry-msg': {
						ev_msg_ok: function () {
							// retry remoteProxy
							$.su.moduleManager.get('firmware').failureRetry();
						}
					},
					'#upgrade-fail-alert': {
						ev_msg_ok: function () {
							var qsModule = $.su.moduleManager.get('qsInternetConnection');

							!!qsModule && qsModule.proceedTpCloud();
						}
					}
				});
			}
		},
		function (me, views, models, stores, deps, services) {
			var me = this;
			return {
				LOGOUT_URL: $.su.url('/admin/system?form=logout'),
				FIRMWARE_URL: $.su.url('/admin/firmware?form=upgrade'),
				waitingId: false,
				waitingTime: 20 * 1000,
				showUpgradeHint: false,
				upgraded: false,
				rebootTime: 2 * 60 * 1000,
				supportTetherGuidance: services.device.getConfig().supportTetherGuidance,
				loadBasicModule: function (name, callback) {
					services.moduleLoader.load(
						{
							module: 'main'
						},
						{
							module: name
						},
						views.main.basicModuleLoader,
						callback
					);
				},
				resetUpgradedValue: function () {
					services.ajax.request({
						proxy: 'firmwareProxy',
						method: 'write',
						data: {
							upgraded: false
						},
						preventSuccessEvent: true
					});
					me.upgraded = false;
				},
				splashTime: 1000,
				showSplash: function () {
					views.main.splash.show();
				},
				hideSplash: function () {
					views.main.splash.fadeOut(400);
				},
				showError: function (msg) {
					if (msg) {
						views.main.globalError.setContent(msg);
						views.main.globalError.show();
					}
				},
				startReboot: function (duration, others, tips) {
					duration = duration || 90000;
					var me = this;
					if (tips) {
						views.main.rebootTips.show();
						views.main.rebootTips.setText(tips);
					} else {
						views.main.rebootTips.hide();
					}
					views.main.rebootMsg.show(function () {
						views.main.rebootProgress.animate({
							duration: duration,
							percentageStart: 0,
							percentageEnd: 100,
							callback: function () {
								me.checkReboot();
								!!others && others();
							}
						});
					});
				},
				checkReboot: function () {
					views.main.rebootMsg.hide();
				},
				checkMeshUpdate: function () {
					/* <subuild name=supportMeshUpdate> */
					services.ajax.request({
						proxy: 'meshRouterUpdateProxy',
						success: function (data) {
							var routerNeedToUpdate = $.grep(data, function (item) {
								return !item.is_latest;
							});

							if (routerNeedToUpdate.length) {
								me.showUpgradeHint = true;
							}
						}
					});
					/* </subuild> */
				},
				showNotice: function (text, type) {
					views.main.globalNotice.show(text, type);
				},
				hideNotice: function (time) {
					views.main.globalNotice.hide(time);
				},
				checkLogin: function () {},
				setToken: function (value) {
					localStorage.setItem('token', value);
					$.su.url.stok = value;
				},
				getToken: function () {
					var token = $.su.url.stok || "12345";
					return token ? token : '';
				},
				syncTokenFromStorage: function () {
					var token = localStorage.getItem('token');
					if (token) {
						$.su.url.stok = token;
					}
				},
				onLoginTimeout: function () {
					me.setToken('');
					location.href = 'http://tplinkwifi.net';
				},
				onAutoUpgrading: function () {
					me.setToken('');
					location.href = './auto_update_blocking.html';
				},
				loadLoginPage: function () {
					me.setToken('');
					me.loadBasicModule('login');
				},
				onUserConflict: function () {
					// me.loadLoginPage();
				},
				onPermissionDenied: function () {
					me.alert($.su.CHAR.ERROR['00000088']);
				},
				reload: function () {
					location.href = './';
				},
				toggelVisibleMask: function (visible) {
					visible ? views.main.transparentMask.show('global-nontrans-mask') : views.main.transparentMask.hide('global-nontrans-mask');
				},
				showMask: function () {
					views.main.transparentMask.show('global-trans-mask');
				},
				hideMask: function () {
					views.main.transparentMask.hide('global-trans-mask');
				},
				confirm: function (msg, success, fail, yesText, cancelText) {
					if (msg) {
						views.main.globalConfirm.setContent(msg);
						views.main.globalConfirm.show();
						views.main.globalConfirm.setButtonText('ok', yesText || $.su.CHAR.OPERATION.YES_UPPERCASE);
						views.main.globalConfirm.setButtonText('no', cancelText || $.su.CHAR.OPERATION.CANCEL_UPPERCASE);
						me.globalConfirmSuccessCallback = success || function () {};
						me.globalConfirmFailCallback = fail || function () {};
					}
				},
				alert: function (msg) {
					if (msg) {
						views.main.globalAlert.setContent(msg);
						views.main.globalAlert.show();
					}
				},
				getCloudInfo: function () {
					return me.cloudInfo;
				},
				setWaitingEvent: function (eType, obj, waitingTime) {
					me.waitingId = false;
					var time = waitingTime || me.waitingTime;
					var obj = obj || window;
					obj = obj.jquery ? obj : $(obj);
					me.waitingId = setTimeout(function () {
						obj.trigger(eType);
					}, time);
					return true; // setWaiting success
				},
				clearWaitingEvent: function () {
					if (me.waitingId) {
						clearTimeout(me.waitingId);
						me.waitingId = false;
					}
				},
				showProBar: function (text, tips) {
					views.main.proBar.reset();
					views.main.proBar.setText(text);
					if (tips) {
						views.main.proBarTips.show();
						views.main.proBarTips.setText(tips);
					} else {
						views.main.proBarTips.hide();
					}
					views.main.progressbarWrap.show();
				},
				hideProBar: function () {
					views.main.progressbarWrap.hide();
				},
				setProBarValue: function (value, time) {
					views.main.proBar.setValue(value, time);
				},
				setProBarAnimate: function (duration, callback) {
					views.main.proBar.animate({
						percentageStart: 0,
						percentageEnd: 100,
						duration: duration * 1000,
						callback: callback
					});
				},
				setUpgradeRetryContent: function (text) {
					views.main.failRetryMsg.setContent(text);
				},
				showUpgradeRetry: function () {
					views.main.failRetryMsg.show();
				},
				showUpgradeFailAlert: function () {
					views.main.upgradeFailAlert.show();
				},
				showLoading: function (text) {
					views.main.loadingMsg.show();
					views.main.loadingText.setText(text);
				},
				hideLoading: function () {
					views.main.loadingMsg.hide();
				}
			};
		}
	);
})(jQuery);
