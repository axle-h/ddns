(function () {
	var Form = $.su.Widget.register('form', {
		settings: {
			formName: {
				attribute: 'form-name',
				defaultValue: ''
			}
		},
		init: function () {
			this.fields = [];
		},
		render: function () {},
		loadData: function () {},
		getAllFields: function () {
			// var formName = this.settings.formName;
			// var findResult = this.dom().find("[name]");
			// return findResult;

			var fields = [];
			var widgets = this.dom().find('div[widget]');

			for (var i = 0, len = widgets.length; i < len; i++) {
				var widgetDom = $(widgets[i]);
				var name = widgetDom.attr('widget');
				var field = widgetDom.attr('name');

				if (field) {
					var widget = $(widgetDom).data('viewObj');
					if (!widget) {
						widget = $(widgetDom)[name]({})[0];
					}
					widget.field = field;
					fields.push(widget);
				}
			}

			return fields;
		},
		setNormal: function () {
			var fields = this.getAllFields();
			$.each(fields, function (index, field) {
				!!field.setNormal && field.setNormal();
			});
		},
		destroy: function () {
			var fields = this.getAllFields();
			$.each(fields, function (index, field) {
				field._destroy();
			});
		}
	});
})();
