/*
 * @description
 * @author XCH
 * @change
 *   2017/11/08: create file
 *
 * */
(function ($) {
	var QosBtn = $.su.Widget.register('switchField', {
		settings: {
			fields: {
				attribute: 'fields',
				defaultValue: null
			},
			supportViewSwitch: {
				attribute: 'view-switch',
				defaultValue: true
			}
		},

		listeners: [
			{
				selector: 'div.fields-item-name',
				event: 'click',
				callback: function (e, viewObj) {
					if (!viewObj.settings.supportViewSwitch) {
						return;
					}
					var item = $(this).attr('item');
					viewObj.switchField(item);
					// viewObj.dom().find("div.fields-item-name").removeClass("select");
					// $(this).addClass("select");

					// var fields = viewObj.settings.fields;
					// for(var i = 0;  i < fields.length; i++){
					// 	$("div.fieldset-container."+fields[i].container).hide();
					// }

					// $("div.fieldset-container."+item).show();
					// viewObj.dom().triggerHandler("ev_switch_click", item);
				}
			}
		],

		init: function () {},

		render: function () {
			var me = this;
			var _this = this.dom();
			var settings = this.settings;
			var i = 0;
			var supportCls = settings.supportViewSwitch ? '' : ' view-disabled';
			_this.addClass(settings.cls + 'switch-field-container' + supportCls);

			var innerHTML = '<div class="switch-field-name-wrapper">';
			innerHTML += '<div class="switch-field-name">';
			for (i = 0; i < settings.fields.length; i++) {
				innerHTML +=
					'<div class="fields-item-name ' +
					settings.fields[i].name +
					(i == 0 ? ' first' : '') +
					(i == settings.fields.length - 1 ? ' lst' : '') +
					'" item="' +
					settings.fields[i].name +
					'"">';
				innerHTML += '<span>' + settings.fields[i].text + '</span>';
				innerHTML += '</div>';
			}
			innerHTML += '</div>';
			innerHTML += '</div>';
			innerHTML += '<div class="switch-field-content">';
			innerHTML += '</div>';

			_this.append(innerHTML);

			// if (_this.children('div[widget]').length > 0){
			// 	_this.children('div[widget]').appendTo(_this.find('div.switch-field-content'));
			// }
		},
		setSupportViewSwitch: function (support) {
			var _this = this.dom();
			this.settings.supportViewSwitch = support;
			support ? _this.removeClass('view-disabled') : _this.addClass('view-disabled');
		},
		itemClick: function (item) {
			var _this = this.dom();
			_this.find('div.fields-item-name.' + item).trigger('click');
		},
		getCurField: function () {
			var dom = this.dom();
			var curTab = dom.find('div.fields-item-name.select');
			var curName = null;
			if (curTab.length) {
				curName = curTab.attr('item');
			}
			return curName;
		},
		switchField: function (fieldName) {
			var dom = this.dom();
			dom.find('div.fields-item-name').removeClass('select select-prev');
			var fields = this.settings.fields;
			var found = null;
			for (var i = 0, field, len = fields.length; i < len; i++) {
				field = fields[i];
				if (field.name === fieldName) {
					found = field;
					$('div.fieldset-container.' + field.container).show();
					dom
						.find('.fields-item-name.' + fieldName)
						.addClass('select')
						.prev()
						.addClass('select-prev');
				} else {
					$('div.fieldset-container.' + field.container).hide();
				}
			}
			found && dom.triggerHandler('ev_switch_click', fieldName);
		},
		switchPrev: function () {
			var dom = this.dom();
			var settings = this.settings;

			var curName = dom.find('.fields-item-name.select').attr('item');
			var curIdx = -1;
			for (var fields = settings.fields, last = fields.length, field; last--; ) {
				field = fields[last];
				if (field.name == curName) {
					curIdx = last;
					break;
				}
			}
			if (curIdx > 0) {
				this.switchField(settings.fields[curIdx - 1].name);
			}
		},
		switchNext: function () {
			var dom = this.dom();
			var settings = this.settings;
			var curName = dom.find('.fields-item-name.select').attr('item');
			var curIdx = -1;
			for (var fields = settings.fields, last = fields.length, field; last--; ) {
				field = fields[last];
				if (field.name == curName) {
					curIdx = last;
					break;
				}
			}
			if (curIdx >= 0 && curIdx < fields.length - 1) {
				this.switchField(settings.fields[curIdx + 1].name);
			}
		}
	});
})(jQuery);
