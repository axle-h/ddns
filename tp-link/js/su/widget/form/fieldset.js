(function () {
	var Fieldset = $.su.Widget.register('fieldset', {
		settings: {
			legend: {
				attribute: 'legend',
				defaultValue: ''
			},
			keepValidate: {
				attribute: 'keep-validate',
				defaultValue: false
			},
			disableOnHide: {
				attribute: 'disable-on-hide',
				defaultValue: true
			},
			enableOnShow: {
				attribute: 'enable-on-show',
				defaultValue: true
			},
			showValue: {
				attribute: 'show-value',
				defaultValue: null
			},
			enableValue: {
				attribute: 'enable-value',
				defaultValue: null
			},
			parentEnabled: {
				defaultValue: true
			},
			selfEnabled: {
				defaultValue: true
			},
			autoExpand: {
				attribute: 'auto-expand',
				defaultValue: true
			}
		},

		listeners: [
			{
				selector: 'div.legend',
				event: 'click',
				callback: function (e, viewObj) {
					e.preventDefault();
					e.stopPropagation();
					var container = viewObj.getContainer();
					if (container.hasClass('expand')) {
						container.removeClass('expand').addClass('collapse');
					} else if (container.hasClass('collapse')) {
						container.removeClass('collapse').addClass('expand');
					} else {
						container.addClass('collapse');
					}
				}
			}
		],

		init: function () {},

		render: function () {
			var _this = this.dom();
			var settings = this.settings;

			_this.addClass(settings.cls + 'fieldset-container');

			if (settings.autoExpand) {
				_this.addClass('expand');
			} else {
				_this.addClass('collapse');
			}
			var inHTML = '';
			inHTML += '<div class="legend">';
			inHTML += '<div class="fieldset-img"></div>';
			inHTML += '<div class="fieldset-text">' + settings.legend + '</div>';
			inHTML += '</div>';
			inHTML += '<div class="fieldset-content"></div>';

			var children = _this.children('div');
			_this.append(inHTML);
			_this.find('div.fieldset-content').eq(0).append(children);

			var fields = [];

			function getChildren(node) {
				var children = $(node).children('div');
				for (var i = 0, len = children.length; i < len; i++) {
					if ($(children[i]).attr('widget')) {
						var wid = {
							id: $(children[i]).attr('id'),
							type: $(children[i]).attr('widget')
						};
						fields.push(wid);
					} else {
						getChildren(children[i]);
					}
				}
			}
			getChildren(_this.find('div.fieldset-content').get(0));
			this.fields = fields;
		},

		hide: function (callback) {
			var _this = this.dom();
			var settings = this.settings;

			if (settings.disableOnHide === 'true' || settings.disableOnHide === true) {
				this.disable();
			}

			_this.stop(true).hide();

			this.setStatus('shown', false);
			if (callback) {
				callback.call(_this);
			}
		},

		show: function (callback) {
			var _this = this.dom();
			var settings = this.settings;
			var me = this;

			this.setStatus('shown', true);
			_this.fadeIn(200, callback);
			if (settings.enableOnShow === 'true' || settings.enableOnShow === true) {
				me.enable();
			}
		},

		setValue: function (data) {
			var settings = this.settings;
			settings.data = data;

			if (settings.showValue !== null) {
				if (data == settings.showValue) {
					this.show();
				} else {
					this.hide();
				}
			}

			if (settings.enableValue !== null) {
				if (data == settings.enableValue) {
					this.enable();
				} else {
					this.disable();
				}
			}
		},

		getValue: function () {
			return this.settings.data;
		},

		disable: function (directly, callback) {
			var container = this.getContainer();
			var fields = this.fields;

			if (directly === true || directly === undefined) {
				this.settings.selfEnabled = false;
			} else {
				this.settings.parentEnabled = false;
			}
			container.addClass('disabled');

			for (var index = 0, len = fields.length; index < len; index++) {
				var field = fields[index];
				if (field) {
					var tar = $('#' + field.id);
					var type = field.type;
					if (tar.length > 0) {
						//add by Mai 2017/2/9 : render时子模块还没有render，不能调用disable、enable方法，因此加上try捕捉此种错误
						try {
							tar.data('viewObj').disable(this.settings.keepValidate);
						} catch (e) {}
					}
				}
			}

			if (callback) {
				callback.call(this);
			}
		},

		enable: function (directly, callback) {
			var container = this.getContainer();
			var fields = this.fields;

			if (directly === false) {
				this.settings.parentEnabled = true;
			} else {
				this.settings.selfEnabled = true;
			}
			if (this.settings.parentEnabled === false) {
				return;
			} else {
				if (this.settings.selfEnabled === false && directly === false) {
					return;
				}
			}
			container.removeClass('disabled');

			for (var index = 0, len = fields.length; index < len; index++) {
				var field = fields[index];
				if (field) {
					var tar = $('#' + field.id);
					var type = field.type;
					if (tar.length > 0) {
						//add by Mai 2017/2/9 : render时子模块还没有render，不能调用disable、enable方法，因此加上try捕捉此种错误
						try {
							tar.data('viewObj').enable(false);
						} catch (e) {}
					}
				}
			}

			this.setStatus('disabled', false);
			if (callback) {
				callback.call(this);
			}
		},
		expand: function (isExpand) {
			var container = this.getContainer();
			if (!isExpand) {
				container.removeClass('expand').addClass('collapse');
			} else {
				container.removeClass('collapse').addClass('expand');
			}
		},
		remove: function () {
			this.dom().remove();
		}
	});
})();
