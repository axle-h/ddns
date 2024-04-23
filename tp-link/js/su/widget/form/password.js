(function () {
	var Password = $.su.Widget.register('password', {
		settings: {
			hint: {
				attribute: 'hint',
				defaultValue: null
			},
			validateIcon: {
				attribute: 'validate-icon',
				defaultValue: false
			},
			showLevel: {
				attribute: 'show-level',
				defaultValue: false
			},
			allowBlank: {
				attribute: 'allow-blank',
				defaultValue: true
			},
			_minLength: {
				attribute: 'min-length',
				defaultValue: 2
			},
			_maxLength: {
				attribute: 'max-length',
				defaultValue: 16
			},
			vtype: {
				attribute: 'vtype',
				defaultValue: 'password'
			},
			invalidText: {
				attribute: 'invalid-text',
				defaultValue: $.su.CHAR.VTYPETEXT.INVALIDTEXT
			},
			blankText: {
				attribute: 'blank-text',
				defaultValue: $.su.CHAR.VTYPETEXT.BLANKTEXT
			},
			allowVisible: {
				attribute: 'allow-visible',
				defaultValue: true // 'icon' 'checkbox'
			},
			visibleDefault: {
				attribute: 'visible-default',
				defaultValue: false
			},
			readOnly: {
				attribute: 'read-only',
				defaultValue: false
			},
			tipText: {
				attribute: 'tip-text',
				defaultValue: ''
			},
			securityCheck: {
				attribute: 'security-check',
				defaultValue: false
			},
			autoTrim: {
				attribute: 'auto-trim',
				defaultValue: null
			},
			hideVisibleButton: {
				// 隐藏控制显示隐藏的眼睛图标
				attribute: 'hide-visible-button',
				defaultValue: false
			}
		},
		listeners: [
			{
				selector: 'input.password-text',
				event: 'click focus',
				callback: function (e, viewObj) {
					e.preventDefault();
					var _this = viewObj.dom();
					var passwordHint = _this.find('input.password-hint');

					passwordHint.fadeOut(50);
					viewObj.setFocus();
					viewObj.securityCheck(true, false);
				}
			},
			{
				selector: '.text-wrap, .allow-visible-wrapper',
				event: 'mouseenter',
				callback: function (e, viewObj) {
					viewObj.dom().addClass('hover');
				}
			},
			{
				selector: '.text-wrap, .allow-visible-wrapper',
				event: 'mouseleave',
				callback: function (e, viewObj) {
					viewObj.dom().removeClass('hover');
				}
			},
			{
				selector: 'input.password-text',
				event: 'blur',
				callback: function (e, viewObj) {
					var _this = viewObj.dom();
					var settings = viewObj.settings;
					var encrypt = settings.encrypt;
					var passwordVisibleText = _this.find('input.password-visible');
					var passwordHiddenText = _this.find('input.password-hidden');
					var passwordHint = _this.find('input.password-hint');

					var value = settings.passwordVisible ? passwordVisibleText.val() : passwordHiddenText.val();

					if (viewObj.settings.autoTrim === true) {
						value = $.trim(value);
						passwordVisibleText.val(value);
						passwordHiddenText.val(value);
					}
					viewObj.removeFocus();

					if (!value) {
						passwordHint.css('display', 'inline');
					}

					// viewObj.dom().triggerHandler("ev_view_change", [{
					// 	"type": "value",
					// 	"value": value
					// }]);

					viewObj.dom().triggerHandler('ev_view_change', [
						{
							type: 'valid',
							value: value
						}
					]);
					viewObj.dom().triggerHandler('ev_password_blur');
					viewObj.securityCheck(false, true);
				}
			},
			{
				selector: 'input.password-text',
				event: 'keyup',
				callback: function (e, viewObj) {
					var value = $(this).val();
					viewObj.levelCheck();
					viewObj.securityCheck(false, false);
					viewObj.dom().triggerHandler('ev_view_change', [
						{
							type: 'value',
							value: value
						}
					]);
				}
			},
			{
				selector: 'input.password-text',
				event: 'change',
				callback: function (e, viewObj) {
					var _this = viewObj.dom();
					var settings = viewObj.settings;
					var passwordVisibleText = _this.find('input.password-visible');
					var passwordHiddenText = _this.find('input.password-hidden');

					var value = settings.passwordVisible ? passwordVisibleText.val() : passwordHiddenText.val();

					viewObj.dom().triggerHandler('ev_view_change', [
						{
							type: 'value',
							value: value
						}
					]);
				}
			},
			{
				selector: 'input.password-text',
				event: 'copy cut',
				callback: function (e, viewObj) {
					if ($.su.IS_RG_SEC) {
						e.preventDefault();
					}
				}
			},
			{
				selector: 'span.allow-visible-btn',
				event: 'click',
				callback: function (e, viewObj) {
					var _this = viewObj.dom();
					var settings = viewObj.settings;
					var passwordVisibleText = _this.find('input.password-visible');
					var passwordHiddenText = _this.find('input.password-hidden');
					var isDisabled = _this.hasClass('disabled');
					var btn = $(this);
					var text = '';

					if (isDisabled) {
						return;
					}
					if (settings.passwordVisible) {
						text = passwordVisibleText.val();
						passwordHiddenText.val(text);

						passwordVisibleText.css('display', 'none');
						passwordHiddenText.css('display', 'inline-block');

						btn.removeClass('visible');
						settings.passwordVisible = false;
					} else {
						text = passwordHiddenText.val();
						passwordVisibleText.val(text);

						passwordHiddenText.css('display', 'none');
						passwordVisibleText.css('display', 'inline-block');

						btn.addClass('visible');
						settings.passwordVisible = true;
					}
				}
			},
			{
				selector: 'input.password-hint',
				event: 'click focus',
				callback: function (e, viewObj) {
					e.preventDefault();
					var _this = viewObj.dom();
					var settings = viewObj.settings;
					var passwordVisibleText = _this.find('input.password-visible');
					var passwordHiddenText = _this.find('input.password-hidden');
					_this.fadeOut(50, function () {
						if (settings.passwordVisible) {
							passwordVisibleText.focus();
						} else {
							passwordHiddenText.focus();
						}
						//passwordText.select();
					});
					return false;
				}
			}
		],
		init: function () {
			var settings = this.settings;
			if (settings.vtype) {
				var vtype = settings.vtype;

				if (settings.vtypeText) {
					settings.vtype.vtypeText = settings.vtypeText;
				}
				settings.vtype = vtype;
			}
		},
		render: function () {
			var _this = this.dom();
			var settings = this.settings;
			var tips = settings.tips === '' ? '' : ' tips';
			var shortTips = settings.shortTips === '' ? '' : ' short-tips';
			var readOnly = settings.readOnly ? 'readonly="readonly"' : '';
			var visible = settings.allowVisible ? ' visible' : '';

			_this.addClass(settings.cls + 'text-container password-container ' + tips + visible);

			var inHTML = '';

			if (settings.labelField !== null) {
				inHTML += '<div class="widget-fieldlabel-wrap ' + settings.labelCls + '">';
				inHTML += '<div class="widget-fieldlabel-inner">';
				inHTML += '<label class="widget-fieldlabel text-fieldlabel password-fieldlabel">' + settings.labelField + '</label>';

				if (settings.labelField !== '') {
					inHTML += '<span class="widget-separator">' + settings.separator + '</span>';
				}

				inHTML += '</div>';
				inHTML += '</div>';
			}
			inHTML += '<div class="widget-wrap-outer text-wrap-outer password-wrap-outer ' + (settings.allowVisible ? 'allow-visible' : '') + '">';
			inHTML += '<div class="widget-wrap text-wrap password-wrap">';
			inHTML += '<span class="text-wrap-before"></span>';
			inHTML += '<span class="text-wrap-inner password-wrap ">';
			inHTML +=
				'<input type="password" ' +
				readOnly +
				' class="text-text password-text password-hidden ' +
				(settings.visibleDefault ? 'hidden ' : ' ') +
				settings.inputCls +
				'"/>';

			if (settings.allowVisible) {
				settings.passwordVisible = settings.visibleDefault;

				inHTML +=
					'<input type="text" ' +
					readOnly +
					' class="text-text password-text password-visible ' +
					(settings.visibleDefault ? ' ' : 'hidden ') +
					settings.inputCls +
					'"/>';
			}

			inHTML += '</span>';

			if (settings.hint) {
				inHTML += '<span class="hint text-hint password-hint">';
				inHTML +=
					'<input class="text-hint password-hint ' +
					settings.inputCls +
					'" value="' +
					settings.hint +
					'" contenteditable="false" readonly="readonly"/>';
				inHTML += '</span>';
			}

			if (settings.showLevel) {
				inHTML += '<div class="password-level hidden ' + settings.inputCls + '">';
				inHTML += '<span class="level low">' + $.su.CHAR.OPERATION.LOW + '</span>';
				inHTML += '<span class="level middle">' + $.su.CHAR.OPERATION.MIDDLE + '</span>';
				inHTML += '<span class="level high">' + $.su.CHAR.OPERATION.HIGH + '</span>';
				inHTML += '</div>';
			}
			inHTML += '<span class="text-wrap-after"></span>';
			if (settings.allowVisible && !settings.hideVisibleButton) {
				inHTML += '<div class="allow-visible-wrapper">';
				inHTML += '<span class="icon allow-visible-btn ' + (settings.visibleDefault ? 'visible' : '') + '"></span>';
				inHTML += '<span class="text allow-visible-text">' + $.su.CHAR.OPERATION.SHOW + '</span>';
				inHTML += '</div>';
			}

			inHTML += '</div>';

			if (settings.validateIcon) {
				inHTML += '<span class="widget-validate-icon"></span>';
			}

			if (settings.shortTips != '' && settings.shortTips != null && settings.shortTips != undefined) {
				inHTML += '<div class="widget-short-tips textbox-short-tips">';
				inHTML += '<div class="content short-tips-content">' + settings.shortTips + '</div>';
				inHTML += '</div>';
			}

			if (settings.tips != '' && settings.tips != null && settings.tips != undefined) {
				inHTML += '<div class="widget-tips textbox-tips ' + settings.tipsCls + '">';
				inHTML += '<div class="content tips-content">' + settings.tips + '</div>';
				inHTML += '</div>';
			}

			inHTML += '<div widget="errortip" error-cls="' + settings.errorTipsCls + '">';
			inHTML += '</div>';
			if (settings.securityCheck) {
				inHTML += '<div class="pw-secure-check hidden">';
				inHTML += '<ul class="pw-secure-check-ls">';
				// 3 classed of li hint: warning error passed
				inHTML += '<li class="pw-nospace-hint"><div>' + $.su.CHAR.VTYPETEXT.PWD_NOSPACE_CHECK + '</div></li>';

				if ($.su.IS_RG_SEC) {
					inHTML += '<li class="pw-consecutive-hint"><div>' + $.su.CHAR.VTYPETEXT.PWD_CONSECUTIVE_CHECK + '</div></li>';
				}

				inHTML += '<li class="pw-length-hint"><div>' + $.su.CHAR.VTYPETEXT.PWD_LENGTH_CHECK + '</div></li>';
				inHTML += '<li class="pw-symbol-hint"><div>' + $.su.CHAR.VTYPETEXT.PWD_SYMBOL_CHECK + '</div></li>';
				inHTML += '</ul>';
				inHTML += '</div>';
			}

			inHTML += '</div>';

			if (settings.tipText) {
				inHTML += '<div widget="toolTip"></div>';
			}

			_this.append(inHTML);
			_this.find('div.progressbar-container').addClass('hidden');

			var container = this.getContainer();
			var passwordHiddenText = container.find('input.password-hidden');
			var passwordVisibleText = container.find('input.password-visible');
			var passwordHint = container.find('input.password-hint');
			var passwordLevel = container.find('input.password-level');

			if (settings.visibleDefault) {
				passwordVisibleText.css('display', 'inline-block');
				passwordHiddenText.css('display', 'none');
			} else {
				passwordVisibleText.css('display', 'none');
				passwordHiddenText.css('display', 'inline-block');
			}

			setTimeout(function () {
				//修正因为浏览器记住密码产生的bug
				if (passwordHiddenText.val() != '') {
					passwordHint.css('display', 'none');
				}
			}, 100);

			this.setTips(settings.tips);
		},
		securityCheck: function (focus, errorStatus) {
			var settings = this.settings;
			if (!settings.securityCheck) {
				return;
			}
			var container = this.getContainer();
			var passwordVisible = container.find('input.password-visible');
			var passwordHidden = container.find('input.password-hidden');
			var value = '';
			if (settings.passwordVisible) {
				value = passwordVisible.val();
			} else {
				value = passwordHidden.val();
			}
			var spacesReg = /[\s]/i;
			var charLenMin = $.su.IS_RG_SEC ? 10 : 6;
			var charLenMax = 32;
			var letterReg = /[a-zA-Z]/g;
			var numReg = /[0-9]/g;
			var symbolReg = /[\`\~\!\@\#\$\%\^\&\*\(\)\-\=\_\+\[\]\{\}\;\:\'\"\\\|\/\?\.\,\<\>\x20]/g;
			var consecutiveReg = /(.)\1/g;

			var hintsContainer = container.find('div.pw-secure-check');
			var nospaceHint = container.find('li.pw-nospace-hint');
			var lengthHint = container.find('li.pw-length-hint');
			var symbolHint = container.find('li.pw-symbol-hint');
			var consecutiveHint = container.find('li.pw-consecutive-hint');

			var checked = {
				noSpaces: !spacesReg.test(value),
				length: value.length >= charLenMin && value.length <= charLenMax,
				symbols: Boolean(letterReg.test(value)) + Boolean(numReg.test(value)) + Boolean(symbolReg.test(value)) >= 2,
				noConsecutive: !$.su.IS_RG_SEC || !consecutiveReg.test(value)
			};

			lengthHint.html('<div>' + $.su.CHAR.VTYPETEXT.PWD_LENGTH_CHECK.replace('%min%', charLenMin) + '</div>');

			nospaceHint.removeClass('warning error passed');
			lengthHint.removeClass('warning error passed');
			symbolHint.removeClass('warning error passed');
			consecutiveHint.removeClass('warning error passed');
			if (errorStatus) {
				checked.noSpaces ? nospaceHint.hide() : nospaceHint.addClass('error');
				checked.length ? lengthHint.hide() : lengthHint.addClass('error');
				checked.symbols ? symbolHint.hide() : symbolHint.addClass('error');
				checked.noConsecutive ? consecutiveHint.hide() : consecutiveHint.addClass('error');
				if (checked.noSpaces && checked.length && checked.symbols) {
					container.removeClass('error').addClass('valid');
				} else {
					container.removeClass('valid').addClass('error');
				}
			} else if (focus || !hintsContainer.hasClass('hidden')) {
				// 控制初始进入页面时不显示提示，只有focus后才显示提示
				nospaceHint.addClass(checked.noSpaces ? 'passed' : 'warning');
				lengthHint.addClass(checked.length ? 'passed' : 'warning');
				symbolHint.addClass(checked.symbols ? 'passed' : 'warning');
				consecutiveHint.addClass(checked.noConsecutive ? 'passed' : 'warning');
				nospaceHint.show();
				lengthHint.show();
				symbolHint.show();
				consecutiveHint.show();
				focus && hintsContainer.removeClass('hidden').fadeIn(100);
			}
		},
		levelCheck: function () {
			var settings = this.settings;
			if (!settings.showLevel) {
				return;
			}
			var container = this.getContainer();

			var passwordVisible = container.find('input.password-visible');
			var passwordHidden = container.find('input.password-hidden');
			var value = '';

			if (settings.passwordVisible) {
				value = passwordVisible.val();
			} else {
				value = passwordHidden.val();
			}

			var patternLowCase = /[a-z]/g;
			var patternUpCase = /[A-Z]/g;

			var hasDigit = 0;

			var hasUpper = patternUpCase.test(value) ? 1 : 0;
			var hasLower = patternLowCase.test(value) ? 1 : 0;
			var letterNumber = value.replace(/[^a-zA-Z]/g, '').length;
			var letterScore = (hasUpper + hasLower) * 10;

			var digitNumber = value.replace(/[^0-9]/g, '').length;
			var digitScore = ((digitNumber >= 1) + (digitNumber >= 2)) * 10;

			var signNumber = value.length - digitNumber - letterNumber;
			var signScore = (signNumber >= 1) * 10 + (signNumber >= 2) * 15;

			var hasLetter = hasLower || hasUpper;
			var hasDigit = digitNumber >= 1;
			var hasSign = signNumber >= 1;

			var bonus = 0;
			var totalNum = hasLetter + hasDigit + hasSign;
			if (totalNum >= 2) {
				bonus += totalNum;
			}
			if (totalNum >= 3 && hasLower && hasUpper) {
				bonus += 2;
			}

			var score = signNumber === value.length ? 0 : bonus + letterScore + digitScore + signScore;

			var lv = 0;

			if (score <= 20) {
				lv = 1;
			} else if (score <= 40) {
				lv = 2;
			} else {
				lv = 3;
			}

			var passwordLevel = container.find('div.password-level');
			passwordLevel.removeClass('level-0 level-1 level-2 level-3');
			if (value !== '') {
				//空值时要隐藏level
				passwordLevel
					.fadeIn(100)
					.addClass('level-' + lv)
					.removeClass('hidden');
				container.addClass('level');
			} else {
				passwordLevel.hide().addClass('hidden');
				container.removeClass('level');
			}
		},
		setValue: function (value) {
			var _this = this.dom();
			_this.find('span.password-wrap input').val(value);
			this.levelCheck();
			this.securityCheck(false, false);
		},
		getValue: function () {
			var _this = this.dom();
			return _this.find('span.password-wrap input').val();
		},
		setMaxLength: function (num) {
			var _this = this.dom();
			num = parseInt(num);

			if ($.type(num) !== 'number') {
				return;
			}
			_this.find('span.password-wrap input').attr('maxlength', num);
		},
		disable: function () {
			var container = this.getContainer();
			var password = container.find('input.password-text');

			container.addClass('disabled');
			password.prop('disabled', true);
			container.triggerHandler('ev_view_disable');
		},
		enable: function () {
			var container = this.getContainer();
			var password = container.find('input.password-text');

			container.removeClass('disabled');
			password.prop('disabled', false);
			container.triggerHandler('ev_view_enable');
		},
		setCorrect: function () {
			this.setNormal();
			this.getContainer().addClass('correct');
		},
		setError: function (err) {
			var _this = this.dom();
			var container = this.getContainer();
			var errorDom = _this.find('div[widget=errortip]');
			var tips = _this.find('.widget-tips');
			if (!container || this.isDisabled() || !err) {
				return;
			}
			tips.hide();
			if (this.settings.securityCheck) {
				this.securityCheck(false, true);
			} else {
				if (this.errortip) {
					this.errortip.show(err);
				} else if (errorDom.length > 0 && container) {
					var errorTip = container.children('.widget-wrap-outer').children('div[widget=errortip]');
					if (errorTip.get(0)) {
						$(errorTip[0]).attr('id', this.domId + '_errortip');
						this.errortip = $(errorTip[0]).errortip({ type: this.type })[0];
						this.errortip.render();
						this.errortip.show(err);
					}
				}
			}

			container.removeClass('valid').addClass('error');
			container.find('span.widget-validate-icon').css({
				display: 'inline-block'
			});
		},
		setNormal: function () {
			var _this = this.dom();
			var settings = this.settings;
			var container = this.getContainer() || _this;
			var errorDom = _this.find('div[widget=errortip]');
			var tips = _this.find('.widget-tips');
			if (!container) {
				return;
			}
			container.removeClass('focus error disable dirty correct');
			container.find('span.widget-validate-icon').css({
				display: 'none'
			});
			//		container.find("div.widget-addon").hide();
			if (this.errortip) {
				this.errortip.hide();
			}
			// this.securityCheck(false, false);
			if (tips.length > 0) {
				tips.fadeIn(150);
			}
		}
	});
})();
