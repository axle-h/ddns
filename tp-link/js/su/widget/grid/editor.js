(function () {
	var Editor = $.su.Widget.register('editor', {
		settings: {},
		listeners: [],
		init: function (options) {
			var viewObj = this;
			var editorChildren = $(options.configs[this._type].content).find('div[widget][name]');
			this.widgets = [];
			this.settings = options;
			editorChildren.each(function (i, obj) {
				var name = $(obj).attr('name');
				var widget = $(obj).attr('widget');

				viewObj.widgets.push({
					id: $(obj).attr('id'),
					name: name,
					widget: widget
				});
			});
			this.setEditing(false);
		},
		getAllFields: function () {
			var fields = [];

			for (var i = 0, len = this.widgets.length; i < len; i++) {
				var widgetDom = $('#' + this.widgets[i].id);
				var name = this.widgets[i].widget;
				var field = this.widgets[i].name;

				if (field) {
					var widget = widgetDom.data('viewObj');
					widget.field = field;
					fields.push(widget);
				}
			}

			return fields;
		},
		hide: function () {
			var _this = this.dom();
			_this.detach().css('display', 'none');
		},
		startEdit: function (id) {
			var _this = this.dom();
			var settings = this.settings;
			var editingId = id || 'add';
			var gridObj = settings.objs.grid;
			var grid = gridObj.dom();
			var targetTr = null;
			var fields = this.getAllFields();
			var editorConfigs = settings.configs[this._type];

			this.hide();

			this.setEditing(true);
			this.setEditingId(editingId);

			for (var i = 0, len = fields.length; i < len; i++) {
				var field = fields[i];
				field.setNormal();
			}
		},
		loadData: function (data) {
			var settings = this.settings;
			var fields = this.widgets;

			for (var i = 0, len = fields.length; i < len; i++) {
				var obj = $('#' + fields[i].id).data('viewObj');
				obj.setValue(data[fields[i].name]);
			}
		},
		completeEdit: function () {
			this.setEditing(false);
			this.setEditingId('');
		},
		cancelEdit: function () {
			this.setEditing(false);
			this.setEditingId('');
		},
		setEditing: function (status) {
			var settings = this.settings;
			settings.configs[this._type].editing = status;
		},
		isEditing: function () {
			var settings = this.settings;
			return settings.configs[this._type].editing;
		},
		setEditingId: function (id) {
			var settings = this.settings;
			settings.configs[this._type].editingIndex = id;
		},
		getEditingId: function () {
			var settings = this.settings;
			return settings.configs[this._type].editingIndex;
		}
	});
})();
