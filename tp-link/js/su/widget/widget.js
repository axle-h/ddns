(function ($) {
	$.su = $.su || {};
	$.su.widgets = {};

	$.su.Widget = (function () {
		var _settings = {
			labelField: {
				attribute: 'label-field',
				defaultValue: ''
			},
			cls: {
				attribute: 'cls',
				defaultValue: ' container widget-container '
			},
			separator: {
				attribute: 'separator',
				defaultValue: ':'
			},
			labelCls: {
				attribute: 'label-cls',
				defaultValue: ''
			},
			inputCls: {
				attribute: 'input-cls',
				defaultValue: ''
			},
			tips: {
				attribute: 'tips',
				defaultValue: ''
			},
			shortTips: {
				attribute: 'short-tips',
				defaultValue: ''
			},
			tipsCls: {
				attribute: 'tips-cls',
				defaultValue: ''
			},
			errorTipsCls: {
				attribute: 'error-tips-cls',
				defaultValue: ''
			}
		};
		var Widget = function (options) {
			if ($.type(options.id) === 'object') {
				if ($(options.id).attr('id')) {
					this.domId = $(options.id).attr('id');
				} else {
					this.domId = $.su.randomId('widget-');
					$(options.id).attr('id', this.domId);
				}
				options.id = this.domId;
			} else if ($.type(options.id) === 'string') {
				this.domId = options.id;
			} else {
				// console.error("Widget id doesn't exists. ");
				return;
			}

			this._init(options);
			this.init(options);

			var renderTmp = this.render;
			this.render = (function (renderTmp, constructor) {
				return function () {
					var me = this;
					var ret;
					var renderRet = renderTmp.call(this);
					if (renderRet && renderRet.then) {
						ret = renderRet;
					} else {
						ret = $.Deferred().resolve();
					}

					return ret.then(function () {
						constructor._bindListeners();
						constructor._initTip();
						constructor._initScrollbar();
						!!me._view && me._view.onChildWidgetRendered(me);
						me.rendered = true;
					});
				};
			})(renderTmp, this);

			return this;
		};

		Widget.prototype = {
			_init: function (options) {
				var _this = this.dom();
				var constructor = this;
				var opSettings;
				opSettings = options.settings = options.settings || {};

				this.settings = (function () {
					var settings = {};
					var tempSettings = $.extend({}, _settings, constructor.settings);

					// for (var prop in tempSettings){
					// 	if (tempSettings.hasOwnProperty(prop) && options.settings[prop] == undefined){
					// 		options.settings[prop] = tempSettings[prop].defaultValue;
					// 	}
					// }
					for (var prop in tempSettings) {
						if (tempSettings.hasOwnProperty(prop)) {
							var opt = tempSettings[prop];
							if (opSettings.hasOwnProperty(opt.attribute) || (_this[0] && _this[0].hasAttribute(opt.attribute))) {
								if ($.type(opSettings[opt.attribute]) === 'object' && $.type(opt.defaultValue) === 'object') {
									opSettings[opt.attribute] = $.extend(true, {}, opt.defaultValue, opSettings[opt.attribute]);
								}

								var attr = opSettings[opt.attribute] || _this.attr(opt.attribute); //options
								var setting;

								if ($.isFunction(opt.setter)) {
									setting = opt.setter.call(_this, attr);
								} else {
									setting = attr;
								}
								opSettings[prop] = setting;
							} else {
								var val = opt.defaultValue;
								if (opt.getter) {
									opSettings[prop] = opt.getter.call(_this);
								} else {
									opSettings[prop] = $.type(val) === 'object' ? $.su.clone(val) : val;
								}
							}
						}
					}
					return opSettings;
				})();
				if (options.customSettings) {
					$.extend(this.settings, options.customSettings);
				}
				this._view = options.view;
				!!this._view && this._view.addChildWidget(this);
				this._status = {
					shown: true,
					disabled: false
				};
				this.dom().data('viewObj', this);
			},
			_initTip: function (viewObj) {
				var viewObj = this;
				var settings = viewObj.settings;
				var container = viewObj.getContainer();

				// tooltip
				if ((settings.tipText || settings.customTipText) && container) {
					var tip = container.children('div[widget=toolTip]');
					if (tip.get(0)) {
						$(tip[0]).attr('id', viewObj.domId + '_tooltip');
						new $.su.widgets.toolTip({
							id: $(tip[0]),
							tipText: settings.tipText,
							globalCls: settings.customTipGlobalCls,
							tipSmallSizePosition: settings.customTipSmallSizePosition
						}).render();
					}
				}

				// errortip
				if (container) {
					var errorTip = container.children('.widget-wrap-outer').children('div[widget=errortip]');
					if (errorTip.get(0)) {
						$(errorTip[0]).attr('id', viewObj.domId + '_errortip');
						viewObj.errortip = new $.su.widgets.errortip({
							id: $(errorTip[0]),
							type: viewObj._type
						});
						viewObj.errortip.render();
						viewObj.errortip.hide();
					}
				}

				// tips(unit)
				viewObj.setTips(settings.tips);
			},
			_initScrollbar: function () {
				var viewObj = this;
				viewObj
					.dom()
					.find('.su-scroll')
					.add(viewObj.dom().filter('.su-scroll'))
					.each(function (i, elem) {
						if ($(this).closest('[widget]')[0] == viewObj.dom()[0]) {
							$.su.scrollbar({
								ele: elem,
								opts: viewObj.scrollOption || {}
							});
						}
					});
			},
			_bindListeners: function () {
				if (!this.listeners || !$.isArray(this.listeners)) {
					return;
				}
				var viewObj = this;
				var i, len;
				var listeners = this.listeners;

				// 清空之前的事件绑定。
				if (viewObj._eventMap && viewObj._eventMap.length > 0) {
					for (i = 0, len = viewObj._eventMap.length; i < len; i++) {
						var event = viewObj._eventMap[i];
						if (event.target) {
							event.parent.off(event.event, event.target, event.func);
						} else {
							event.parent.off(event.event, event.func);
						}
					}
				}
				viewObj._eventMap = [];

				for (i = 0, len = listeners.length; i < len; i++) {
					(function (i) {
						var func = function () {
							var slice = Array.prototype.slice;
							var args = slice.apply(arguments);
							args.push(viewObj);

							listeners[i].callback.apply(this, args);
						};

						if (listeners[i].condition && listeners[i].condition(viewObj) === false) {
							return false;
						}

						var selector = listeners[i].selector;
						if ($.type(selector) === 'function') {
							// 需要返回对象，里面包含parent,target两个属性
							var obj = selector.call(viewObj);
							if (obj.target) {
								$(obj.parent).on(listeners[i].event, obj.target, func);
							} else {
								$(obj.parent).on(listeners[i].event, func);
							}
							viewObj._eventMap.push({
								parent: $(obj.parent),
								target: obj.target || '',
								event: listeners[i].event,
								handler: func
							});
						} else {
							if (selector !== '') {
								viewObj.dom().on(listeners[i].event, selector, func);
							} else {
								viewObj.dom().on(listeners[i].event, func);
							}
							viewObj._eventMap.push({
								parent: viewObj.dom(),
								target: selector || '',
								event: listeners[i].event,
								handler: func
							});
						}
					})(i);
				}
			},
			init: function () {},
			dom: function () {
				return $('#' + this.domId);
			},
			render: function () {
				this.dom().addClass(this.settings.cls);
			},
			getContainer: function () {
				var _this = this.dom();

				if (_this.hasClass('widget-container')) {
					return _this;
				} else {
					var container = _this.children('.widget-container');
					if (container.get(0)) {
						return $(container.get(0));
					} else {
						return null;
					}
				}
			},
			setLabelField: function (text) {
				var _this = this.dom();
				_this.find('label.widget-fieldlabel').html(text);
			},
			setLabelVisible: function (visible) {
				var _this = this.dom();
				_this.find('.widget-fieldlabel-inner').css('visibility', visible ? 'visible' : 'hidden');
			},
			show: function () {
				this.dom().show();
				this.dom().triggerHandler('ev_widget_show');
			},
			hide: function () {
				this.dom().hide();
				this.dom().triggerHandler('ev_widget_hide');
			},
			fadeOut: function (time) {
				var me = this;
				var transitionTime = time / 1000 + 's';
				this.dom().css({
					opacity: 0,
					transtion: 'opacity ' + transitionTime
				});
				setTimeout(function () {
					me.dom().hide().css({
						display: 'none',
						opacity: 1,
						transtion: 'no '
					});
				}, time);
			},
			toggle: function () {
				if (this.dom().is(':visible')) {
					this.hide();
				} else {
					this.show();
				}
			},
			enable: function () {
				this.dom().removeClass('disabled');
			},
			disable: function () {
				this.dom().addClass('disabled');
			},
			isDisabled: function () {
				var _this = this.dom();
				var container = this.getContainer();
				return (container && container.hasClass('disabled') && !container.hasClass('visual-disabled')) || _this.prop('disabled') === true;
			},
			setError: function (tips, force) {
				var _this = this.dom();
				var container = this.getContainer();
				var errorDom = _this.find('div[widget=errortip]');

				if (!container || (this.isDisabled() && !force)) {
					return;
				}

				if (this.errortip) {
					!!tips && this.errortip.show(tips);
				} else if (errorDom.length > 0 && container) {
					var errorTip = container.children('.widget-wrap-outer').children('div[widget=errortip]');
					if (errorTip.get(0)) {
						$(errorTip[0]).attr('id', this.domId + '_errortip');
						this.errortip = $(errorTip[0]).errortip({ type: this.type })[0];
						this.errortip.render();
						!!tips && this.errortip.show(tips);
					}
				}

				container.removeClass('valid').addClass('error');
				container.find('span.widget-validate-icon').css({
					display: 'inline-block'
				});
			},

			setErrorHtml: function (tips) {
				var _this = this.dom();
				var container = this.getContainer();
				var errorDom = _this.find('div[widget=errortip]');

				if (!container || this.isDisabled() || !tips) {
					return;
				}

				if (this.errortip) {
					this.errortip.showHtml(tips);
				} else if (errorDom.length > 0 && container) {
					var errorTip = container.children('.widget-wrap-outer').children('div[widget=errortip]');
					if (errorTip.get(0)) {
						$(errorTip[0]).attr('id', this.domId + '_errortip');
						this.errortip = $(errorTip[0]).errortip({ type: this.type })[0];
						this.errortip.render();
						this.errortip.showHtml(tips);
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

				if (!container) {
					return;
				}

				// this.setTips(settings.tips);

				container.removeClass('focus error disable dirty correct');
				container.find('span.widget-validate-icon').css({
					display: 'none'
				});
				if (this.errortip) {
					this.errortip.hide();
				}
				// else if(errorDom.length > 0){
				// 	$(errorDom[0]).attr('id', this.domId + '_errortip');
				// 	this.errortip = $(errorDom[0]).errortip({type: this.type})[0];
				// 	this.errortip.hide();
				// }
			},
			addClass: function (classes) {
				var _this = this.dom();
				if (_this && _this.length > 0) {
					_this.addClass(classes);
				}
				return this;
			},
			removeClass: function (classes) {
				var _this = this.dom();
				if (_this && _this.length > 0) {
					_this.removeClass(classes);
				}
				return this;
			},
			setFocus: function () {
				var container = this.getContainer();

				this.setNormal();
				container.addClass('focus');
			},
			removeFocus: function () {
				var container = this.getContainer();

				//me[name]("setNormal");
				container.removeClass('focus');
			},
			setTips: function (tips) {
				var _this = this.dom();
				var settings = this.settings;
				var container = this.getContainer() || _this;
				var tipsContainer = container.find('div.widget-tips');

				settings.tips = tips;

				if ($.type(tips) === 'string') {
					tipsContainer.find('div.tips-content').html(tips);
				}
				if (!tips) {
					tipsContainer.hide();
					tipsContainer.css('display', 'none');
				} else {
					tipsContainer.show();
					tipsContainer.fadeIn(150);
				}
			},
			setShortTips: function (shortTips) {
				var _this = this.dom();
				var settings = this.settings;
				var container = this.getContainer() || _this;
				var shortTipsContainer = container.find('div.widget-short-tips');
				settings.shortTips = shortTips;

				if ($.type(shortTips) === 'string') {
					shortTipsContainer.find('div.short-tips-content').html(shortTips);
				}
				if (!shortTips) {
					shortTipsContainer.hide();
					shortTipsContainer.css('display', 'none');
				} else {
					shortTipsContainer.css('display', 'inline-block');
					shortTipsContainer.fadeIn(150);
				}
			},
			setToolTip: function (tipText) {
				var _this = this.dom();
				var settings = this.settings;
				var container = this.getContainer() || _this;
				var tipsContainer = container.find('div.tooltip-container');

				settings.tipText = tipText;

				if ($.type(tipText) === 'string') {
					tipsContainer.find('p.tip-text').html(tipText);
				}

				if (!tipText) {
					tipsContainer.hide();
				} else {
					tipsContainer.show();
				}
			},
			setPosition: function (left, top, right, bottom) {
				//当输入值为center, center时居中显示
				var container = this.getContainer();
				if (!container) {
					return;
				}

				var posX = left === 'center' ? parseInt(($(window).width() - container.outerWidth()) / 2, 10) : left || 0;
				var posY = top === 'center' ? parseInt(($(window).height() - container.outerHeight()) / 2, 10) : top || 0;

				posX = posX < 0 ? 0 : posX;
				posY = posY < 0 ? 0 : posY;

				//这里没有考虑scroll！
				container.css({
					left: posX,
					top: posY,
					right: right,
					bottom: bottom
				});

				return {
					x: posX,
					y: posY
				};
			},
			getMask: function () {
				var m = $('#global-mask');
				if (m.length > 0) {
					return m.data('viewObj');
				} else {
					$('<div id="global-mask"></div>').appendTo($('body'));
					return new $.su.widgets.mask({
						id: 'global-mask'
					});
				}
			},
			_destroy: function () {
				!!this._view && this._view.removeChildWidget(this);
				!!this.destroy && this.destroy();
				if (this._eventMap) {
					for (var i = 0, len = this._eventMap.length; i < len; i++) {
						var m = this._eventMap[i];
						if (m.target) {
							$(m.parent).off(m.event, m.target, m.handler);
						} else {
							$(m.parent).off(m.event, m.handler);
						}
					}
					this._eventMap = [];
				}

				this.dom().data('viewObj', null);
				this.dom().remove();
				this.settings = null;
			},
			getStatus: function (prop) {
				if (prop) {
					return this._status[prop];
				}
				return this._status;
			},
			setStatus: function (prop, value) {
				this._status[prop] = value;
				this.dom().triggerHandler('ev_status_change', [this._status]);
			},
			setVisible: function (flag) {
				if (!flag) {
					this.dom().css('visibility', 'hidden');
				} else {
					this.dom().css('visibility', 'visible');
				}
			}
		};

		Widget.regMap = {
			base: $.extend(
				{
					settings: _settings,
					listeners: []
				},
				Widget.prototype
			)
		};

		Widget.register = function (name, options) {
			var obj;
			var superClass;

			Widget.regMap[name] = options;

			if (options.extend) {
				superClass = $.su.widgets[options.extend];
			} else {
				superClass = $.su.Widget;
			}

			Widget.regMap[name].settings = _getSettings();
			Widget.regMap[name].listeners = _getListeners();

			obj = $.su.widgets[name] = function (configs) {
				if (!this._type) {
					this._type = name;
					this.settings = Widget.regMap[name].settings;
					this.listeners = Widget.regMap[name].listeners;
				}

				superClass.call(this, configs);

				// this.init();
				return this;
			};

			$.su.inherit(superClass, obj);

			for (var method in options) {
				if (options.hasOwnProperty(method) && $.isFunction(options[method])) {
					obj.prototype[method] = options[method];
				}
			}

			function _defaultSetter(attrName) {
				return function (val) {
					var _this = $(this);
					var getAttrObject = $.su.getAttrObject;
					if (val === null || val === undefined) {
						return;
					}

					// return _this.attr(attrName).match(/{(.+)}/g) ? getAttrObject($.su.CHAR, _this.attr(attrName)) :
					// _this.attr(attrName);
					if ($.type(val) === 'string' && val.match(/{(.+)}/g)) {
						var value = getAttrObject($.su.CHAR, val);
						if (value !== null && value !== undefined) {
							return value;
						} else {
							return 'Not Defined';
						}
					} else {
						return val;
					}
				};
			}

			function _getSettings() {
				var superSettings = options.extend ? Widget.regMap[options.extend].settings : _settings;
				var settings;

				if ($.isFunction(options.settings)) {
					settings = options.settings.call(obj, $.extend({}, superSettings));
				} else {
					settings = $.extend({}, superSettings, options.settings);
				}

				for (var prop in settings) {
					if (settings.hasOwnProperty(prop) && !settings[prop].setter) {
						settings[prop].setter = _defaultSetter(settings[prop].attribute);
					}
				}
				return settings;
			}

			function _getListeners() {
				var superListeners = options.extend ? Widget.regMap[options.extend].listeners : [];
				options.listeners = options.listeners || [];

				if ($.isFunction(options.listeners)) {
					return options.listeners.call(obj, superListeners);
				}
				return superListeners.concat(options.listeners);
			}

			return obj;
		};

		return Widget;
	})();

	$('html')
		.delegate('input', 'focus', function (e) {
			e.stopPropagation();
			e.preventDefault();
		})
		.on('click', function (e) {
			e.stopPropagation();
			$('div.region-select-wrap, div.region-search-wrap').hide();
			$('div.timepicker-msg-container').removeAttr('dragFlag');
		})
		.on('mouseup', function (e) {
			$('div.button-container').removeClass('clicked');
			$('div.btn-help-container a.btn-help').removeClass('clicked');

			$('div.timepicker-msg-container-wrap').trigger('mouseup');
		})
		.on('keyup mousedown', function (e) {});
	$(document).ready(function (e) {
		$('<div id="global-mask"></div>').appendTo($('body'));
		var mask = new $.su.widgets.mask({
			id: 'global-mask'
		});
		mask.render();
		$('<div id="global-combobox-options" data-shown="_hidden_"></div>').appendTo($('body'));
		$('<div id="global-tips-text" class="global-tips-text" data-shown="_hidden_"></div>').appendTo($('body'));

		var clientWidth = document.body.clientWidth;
		var widgetSize;
		if (clientWidth < 768) {
			widgetSize = 's';
		} else if (clientWidth < 1024) {
			widgetSize = 'm';
		} else if (clientWidth < 1280) {
			widgetSize = 'l';
		} else {
			widgetSize = 'xl';
		}
		$.su.widgetSize = widgetSize;
	});

	$(window).on(
		'resize',
		$.su.throttle(
			function (e) {
				var msg = $('div.msg-container');
				var clientWidth = document.body.clientWidth;
				var widgetSize;
				var globalOptions = $('#global-combobox-options');
				var globalToolTip = $('#global-tips-text');
				var id = globalOptions.attr('data-shown');
				var toolTipId = globalToolTip.attr('data-shown');
				var oldWidgetSize = $.su.widgetSize;
				if (clientWidth < 768 || $.su.isMobile()) {
					widgetSize = 's';
				} else if (clientWidth < 1024) {
					widgetSize = 'm';
				} else if (clientWidth < 1280) {
					widgetSize = 'l';
				} else {
					widgetSize = 'xl';
				}
				$.su.widgetSize = widgetSize;
				$(window).trigger('ev_resize', [widgetSize, clientWidth, oldWidgetSize]);
				$(window).trigger(['ev_iframe_resize'], [widgetSize]);
				msg.each(function (i, obj) {
					var m = $(obj).data('viewObj');
					if (m.settings.shown) {
						m.setPosition('center', 'center');
					}
				});

				if (id !== '_hidden_') {
					$('#' + id)
						.data('viewObj')
						.calculatePosition();
				}
				if (toolTipId !== '_hidden_') {
					$('#' + toolTipId)
						.data('viewObj')
						.adjustLayout($.su.widgetSize);
				}

				var ps = $('.page-content').data('ps');
				ps && ps.update();
			},
			100,
			100
		)
	);

	$(document).on(
		'DOMSubtreeModified',
		$.su.debounce(function () {
			$('.ps').each(function (ele) {
				var ps = $(this).data('ps');
				ps && ps.update();
			});
		}, 100)
	);
})(jQuery);
