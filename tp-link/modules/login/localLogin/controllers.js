//@ sourceURL=modules/login/localLogin/controllers.js

/*
 * @description @module localLogin
 * @author
 * @change
 *
 * */
(function ($) {
	$.su.moduleManager.define(
		'localLogin',
		{
			services: ['ajax'],
			
			models: ['localLogin', 'localLoginControl', 'vercodeModel', 'resetPwdModel'],
			views: ['localLoginView'],
			deps: ['login', 'main'],
			listeners: {
				ev_on_launch: function (e, me, views, models, stores, deps, services) {
					views.localLoginView.noInternetTips.hide();

					// 获取加密登录密码的 RSA 公钥
					services.ajax.request({
						proxy: 'keyProxy',
						success: function (ret) {
							var data = ret;
							if (data && data.password) {
								me.encryptKey = data.password;
							}
						}
					});
				}
			},
			init: function (me, views, models, stores, deps, services) {
				this.control({
					'#local-login-pwd': {
						keyup: function (e) {
							e.preventDefault();
							if (e.keyCode == 13) {
								$(e.target).blur();
								me.doLogin();
							}
						}
					},
					'#local-login-button': {
						ev_button_click: function () {
							me.doLogin();
						}
					},
					'.local-login-switch-to-tp': {
						click: function (e) {
							services.ajax.request({
								proxy: 'loginCheckInternetProxy',
								method: 'read',
								success: function (data) {
									deps.login.goToChildModule('tpLogin');
								},
								fail: function () {
									views.localLoginView.noInternetTips.show();
									views.localLoginView.noInternetTips.setText($.su.CHAR.LOGIN.LOCAL_SWITCH_TP_NO_INTERNET_TIPS);
								},
								error: function () {
									views.localLoginView.noInternetTips.show();
									views.localLoginView.noInternetTips.setText($.su.CHAR.LOGIN.LOCAL_SWITCH_TP_NO_INTERNET_TIPS);
								}
							});
						}
					},
					'.local-login-forget-pwd': {
						mousedown: function () {
							me.forgetPasswordHandler();
						}
					},
					'#send-code-btn': {
						ev_button_click: function () {
							views.localLoginView.sendCodeFailedNote.hide();
							services.ajax.request({
								data: {
									operation: 'read'
								},
								proxy: 'sendCodeProxy',
								success: function (data) {
									me.enableConfirm = true;
									views.localLoginView.sendCodeBtn.disable();
									views.localLoginView.sendCodeBtn.setText(me.receiveCodeTimeCount + $.su.CHAR.LOGIN.SEC);
									clearInterval(me.countDownTimer);
									me.countDownTimer = setInterval(function () {
										if (me.receiveCodeTimeCount > 0) {
											me.receiveCodeTimeCount--;
											views.localLoginView.sendCodeBtn.setText(me.receiveCodeTimeCount + $.su.CHAR.LOGIN.SEC);
										} else {
											clearInterval(me.countDownTimer);
											me.receiveCodeTimeCount = 60;
											views.localLoginView.sendCodeBtn.enable();
											views.localLoginView.sendCodeBtn.setText($.su.CHAR.LOGIN.SEND);
										}
									}, 1 * 1000);
								},
								fail: function () {
									views.localLoginView.sendCodeFailedNote.show();
								}
							});
						}
					},
					'#confirm-code-btn': {
						ev_button_click: function () {
							if (me.enableConfirm) {
								views.localLoginView.sendCodeFailedNote.hide();
								models.vercodeModel.submit({
									success: function (data) {
										me.vercode = data.vercode;
										views.localLoginView.forgetPasswordSendCodeMsg.hide();
										models.resetPwdModel.password.setValue();
										models.resetPwdModel.confirm.setValue();
										views.localLoginView.resetPasswordMsg.show();
									},
									fail: function (ret, errCode) {
										models.vercodeModel.vercode.setError();
										views.localLoginView.confirmCodeOverlimitNote.setText($.su.CHAR.ERROR[errCode]);
										views.localLoginView.confirmCodeOverlimitMsg.show();
									},
									error: function () {
										models.vercodeModel.vercode.setError();
									}
								});
							}
						}
					},
					'#reset-pwd-btn': {
						ev_button_click: function () {
							if (models.resetPwdModel.validate()) {
								var password = models.resetPwdModel.password.getValue();
								var confirmPassword = models.resetPwdModel.confirm.getValue();

								if (password != confirmPassword) {
									models.resetPwdModel.confirm.setError($.su.CHAR.ERROR['00000080']);
									return;
								}

								var encryptedValue = models.resetPwdModel.password.doEncrypt(me.encryptKey);

								services.ajax.request({
									proxy: 'forgetPasswordProxy',
									data: {
										operation: 'write',
										password: encryptedValue,
										confirm: true,
										vercode: me.vercode
									},
									success: function (data) {
										views.localLoginView.resetPasswordMsg.hide();
									}
								});
							}
						}
					},
					'#send-code-content': {
						ev_view_change: function (e, obj) {
							if (obj.type === 'value') {
								var val = obj.value;
								if (me.enableConfirm && val) {
									views.localLoginView.confirmCodeBtn.enable();
								} else {
									views.localLoginView.confirmCodeBtn.disable();
								}
							}
						}
					},
					'.find-local-pwd-jump-label': {
						click: function () {
							me.queryRecoveryPasswordMethod().then(function (able) {
								if (able) {
									deps.login.goToChildModule('localPwdRecovery');
								} else {
									views.localLoginView.noRecoveryMethodMsg.show();
								}
							});
						}
					},
					'#user-conflict-prompt': {
						ev_msg_ok: function () {
							var encryptedValue = models.localLoginControl.password.doEncrypt(me.encryptKey);
							models.localLogin.password.setValue(encryptedValue);
							models.localLogin.login({
								data: {
									operation: 'login',
									confirm: true
								},
								success: me.loginSuccessDealer,
								fail: me.loginFailDealer,
								error: me.loginErrorDealer
							});
						}
					}
				});
			}
		},
		function (me, views, models, stores, deps, services) {
			var _loginLockTimer = undefined;
			return {
				enableConfirm: false,
				receiveCodeTimeCount: 60,
				countDownTimer: null,
				encryptKey: null,
				vercode: '',
				doLogin: function () {
					if (_loginLockTimer) {
						return;
					}

					if (models.localLoginControl.validate()) {
						var pwdOrigin = models.localLoginControl.password.getValue();
						var encryptedValue = models.localLoginControl.password.doEncrypt(me.encryptKey);
						models.localLogin.password.setValue(encryptedValue);
						views.localLoginView.localLoginBtn.loading(true);

						// 获取随机数和登录必须同步完成，以避免多个浏览器抢占登录出现随机数不匹配的情况
						// Obtaining random numbers and logging in must be completed simultaneously to avoid multiple browsers preempting logins and causing random number mismatches.
						services.ajax.request({
							proxy: 'authProxy',
							success: function (data) {
								$.su.encryptor.setRSAKey(data.key[0], data.key[1]);
								$.su.encryptor.setSeq(data.seq);

								$.su.encryptor.genAESKey();
								$.su.encryptor.setHash('admin', pwdOrigin);
								$.encrypt.encryptManager.recordEncryptor();

								models.localLogin.login({
									preventFailEvent: true,
									success: me.loginSuccessDealer,
									fail: me.loginFailDealer,
									error: me.loginErrorDealer
								});
							},
							error: me.loginErrorDealer
						});
					}
				},
				loginSuccessDealer: function (data, ret) {
					views.localLoginView.localLoginBtn.loading(false);
					var token =
						data.stok ||
						(function () {
							var stok = '12345',
								href = top.location.href;
							var stokPos = href.indexOf('stok=');
							if (stokPos >= 0) {
								stok = href.substring(stokPos + 5);
							}
							return stok;
						})();
					if (localStorage) {
						deps.main.setToken(token);
						deps.main.reload();
					}
				},
				loginFailDealer: function (data, errorcode) {
					views.localLoginView.localLoginBtn.loading(false);
					var overTimes = !(data.data && data.data.failureCount && data.data.failureCount >= 7);
					if (data.data && data.data.hasOwnProperty('errorcode') && overTimes) {
						var err = String(data.data.errorcode).replace(/^-/, 'E');
						models.localLoginControl.password.setErrorHtml($.su.CHAR.ERROR[err]);
						// $("#local-login-pwd .find-local-pwd-jump-label").off('click').on('click',me.forgetPasswordHandler);
						return;
					} else if (errorcode) {
						switch (errorcode) {
							case 'user conflict':
								var anotherUser = data.data.logined_user;
								views.localLoginView.userConflictMsgContent.setText($.su.CHAR.LOGIN.USER_CONFLICT_MSG);
								views.localLoginView.userConflictMsg.show();
								break;
							case 'login failed':
								if ($.su.IS_RG_SEC) {
									me.handleSGLoginFailed(data);
								} else {
									me.handleDefaultLoginFailed(data);
								}
								break;
							case 'exceeded max attempts':
								var num1 = data.data.failureCount;
								var num2 = data.data.attemptsAllowed;
								var num3 = num2 + num1;
								var str = $.su.CHAR.ERROR['00000089'].replace('%num', num3);
								views.localLoginView.maxAttemptsMsgContent.setText(str);
								views.localLoginView.maxAttemptsMsg.show();
								break;
							default:
								break;
						}
					}
				},
				loginErrorDealer: function () {
					deps.main.reload();
				},
				queryRecoveryPasswordMethod: function () {
					var dtd = $.Deferred();
					dtd.resolve(true);
					return dtd.promise();
				},
				forgetPasswordHandler: function () {
					services.ajax.request({
						proxy: 'forgetPasswordProxy',
						success: function (data) {
							if (data) {
								if (data.enable_rec) {
									// send code
									// views.localLoginView.sendCodeInfo.setText($.su.CHAR.LOGIN.LOCAL_PWD_INFO.replace("%EMAIL%", data.email))
									views.localLoginView.sendCodeFailedNote.hide();
									models.vercodeModel.vercode.setNormal();
									models.vercodeModel.vercode.setValue();
									views.localLoginView.confirmCodeBtn.disable();

									views.localLoginView.forgetPasswordSendCodeMsg.show();
								} else {
									views.localLoginView.forgetPasswordMsg.show();
								}
								clearInterval(me.countDownTimer);
								me.receiveCodeTimeCount = 60;
								views.localLoginView.sendCodeBtn.enable();
								views.localLoginView.sendCodeBtn.setText($.su.CHAR.LOGIN.SEND);
							}
						}
					});
				},
				handleDefaultLoginFailed: function (data) {
					var num1 = data.data.failureCount;
					var num2 = data.data.attemptsAllowed;
					var num3 = num2 + num1;
					if (num2 === 0) {
						var str = $.su.CHAR.ERROR['00000089'].replace('%num', num3);
						views.localLoginView.maxAttemptsMsgContent.setText(str);
						views.localLoginView.maxAttemptsMsg.show();
					} else if (num1 >= num2) {
						var str = $.su.CHAR.LOGIN.LOGIN_FAILED_COUNT.replace('%num1', num1);
						str = str.replace('%num2', num2);
						views.localLoginView.leftAttemptsMsgContent.setText(str);
						views.localLoginView.leftAttemptsMsg.show();
					} else {
						views.localLoginView.leftAttemptsMsgContent.setText($.su.CHAR.LOGIN.LOGIN_FAILED);
						views.localLoginView.leftAttemptsMsg.show();
					}
				},
				handleSGLoginFailed: function (data) {
					var errorMsg = $.su.CHAR.LOGIN.LOGIN_FAILED_SG.replace('10', data.data.failureCount + data.data.attemptsAllowed).replace(
						'%SEC%',
						data.data.failureCount
					);

					models.localLoginControl.password.setError(errorMsg);

					me.disableLoginBtn(data.data.remainTime || 2);
				},
				disableLoginBtn: function (remainTime) {
					var retryNote = $.su.CHAR.LOGIN.LOGIN_RETRY_SG;

					views.localLoginView.localLoginBtn.disable();
					views.localLoginView.loginRetryNote.setText(retryNote.replace('%SEC%', remainTime));
					views.localLoginView.loginRetryNote.show();

					_loginLockTimer = setInterval(function () {
						remainTime -= 1;

						if (!remainTime) {
							return me.enableLoginBtn();
						}

						views.localLoginView.loginRetryNote.setText(retryNote.replace('%SEC%', remainTime));
					}, 1000);
				},
				enableLoginBtn: function () {
					clearInterval(_loginLockTimer);
					_loginLockTimer = undefined;

					views.localLoginView.localLoginBtn.enable();
					views.localLoginView.loginRetryNote.hide();
				}
			};
		}
	);
})(jQuery);
