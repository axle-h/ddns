(function () {
	var Tree = $.su.Widget.register('tree', {
		settings: {
			childrenProp: {
				attribute: 'children-prop',
				defaultValue: 'branches'
			},
			multiSelect: {
				attribute: 'multi-select',
				defaultValue: 'multiple' // single or multiple
			},
			extension: {
				attribute: 'extension',
				defaultValue: ''
			},
			autoCollapsible: {
				attribute: 'auto-collapsible',
				defaultValue: false
			}
		},

		listeners: [],

		init: function () {},

		render: function () {
			var dom = this.dom();
			dom.addClass('tree-container');
			var innerHTML = '';
			innerHTML += '<div class="tree-root">';
			innerHTML += '<ul class="tree-root-children-ul">';
			innerHTML += '</ul>';
			innerHTML += '</div>';
			dom.append(innerHTML);
		},

		_createRootNode: function (dom) {
			return new $.su.widgets['treeNode']({ id: dom });
		},

		renderTree: function (data) {
			if (!$.isArray(data)) {
				data = [data];
			}
			var i = 0;
			var length = data.length;

			this._children = [];
			for (; i < length; i++) {
				var childDom = $('<div uuid="' + data[i].uuid + '"></div>');
				this.dom().find('.tree-root-children-ul').append(childDom);
				var childNode = this._createRootNode(childDom);
				this._children.push(childNode);
				childNode.render();
				childNode.loadData(data[i]);
			}
		},

		/*
		 * @method find child node by key
		 * */
		_findByKey: function (key) {
			if (!this._children) {
				return false;
			} else {
				for (var i = 0; i < this._children.length; i++) {
					var child = this._children[i];
					if (child._findByKey(key)) {
						return child;
					}
				}
				return false;
			}
		}
	});
})();
