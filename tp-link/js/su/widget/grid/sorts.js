(function () {
	var Sorts = $.su.Widget.register('sorts', {
		settings: {},
		listeners: [
			{
				selector: function () {
					var grid = this.settings.objs.grid;
					return {
						parent: grid.dom(),
						target: 'th.grid-header-other'
					};
				},
				event: 'click',
				callback: function (e, viewObj) {
					var columnName = $(this).attr('name');
					viewObj.sortByColumn(columnName);
				}
			}
		],
		init: function (options) {
			this.settings = $.extend({}, this.settings, {
				objs: options.objs
			});
			this._sortColumnName = null;
			this._sortKeys = [];
		},
		render: function () {},
		clearSortStatus: function () {
			var column = this._sortColumnName;
			var grid = this.settings.objs.grid;
			if (column === null) {
				return;
			}
			grid
				.dom()
				.find('div.grid-header-container th.grid-header.' + column)
				.removeClass('sort-asc sort-desc');
		},
		sortByColumn: function (columnName) {
			var grid = this.settings.objs.grid;
			var th = grid.dom().find('div.grid-header-container th.grid-header.' + columnName);
			var body = grid.dom().find('tbody.grid-content-data');

			if (columnName === this._sortColumnName) {
				if (th.hasClass('sort-asc')) {
					th.removeClass('sort-asc').addClass('sort-desc');
					this.sortValue(columnName, true);
				} else {
					th.removeClass('sort-desc').addClass('sort-asc');
					this.sortValue(columnName);
				}
			} else {
				this.clearSortStatus();
				th.addClass('sort-asc');
				this.sortValue(columnName);
			}
			this._sortColumnName = columnName;

			for (var i = 0, len = this._sortKeys.length; i < len; i++) {
				body.append(body.find('tr.grid-content-tr[data-key=' + this._sortKeys[i] + ']'));
			}
		},
		sortValue: function (columnName, reverse) {
			var grid = this.settings.objs.grid;
			var map = this.settings.objs.modelMap;
			var sortMap = {};
			var keys = this._sortKeys.length === 0 ? grid.getKeys() : this._sortKeys;

			// Generate "model key => columnValue" map.
			for (var key in map) {
				if (map.hasOwnProperty(key)) {
					var data = map[key].getData();
					var columnValue = data[columnName];
					if ($.type(columnValue) === 'string' && /^\d+$/.test(columnValue)) {
						sortMap[key] = parseInt(columnValue, 10);
					} else {
						sortMap[key] = columnValue;
					}
				}
			}

			// Sort tr.
			if (!reverse) {
				keys.sort(function (a, b) {
					if (sortMap[a] < sortMap[b]) {
						return -1;
					} else if (sortMap[a] > sortMap[b]) {
						return 1;
					} else {
						return 0;
					}
				});
			} else {
				keys.sort(function (a, b) {
					if (sortMap[a] > sortMap[b]) {
						return -1;
					} else if (sortMap[a] < sortMap[b]) {
						return 1;
					} else {
						return 0;
					}
				});
			}
			this._sortKeys = keys;
		}
	});
})();
