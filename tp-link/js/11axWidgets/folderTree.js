(function () {
	var FolderTree = $.su.Widget.register('folderTree', {
		extend: 'tree',

		listeners: function () {
			return [
				{
					selector: '.folder-tree-root-children-ul',
					event: 'ev_click_item',
					callback: function (e, path, selected, viewObj) {
						var tmp = [];

						for (var i = 0, len = viewObj._unexpandedTree.length; i < len; i++) {
							if (viewObj._unexpandedTree[i].indexOf(path) == -1) {
								tmp.push(viewObj._unexpandedTree[i]);
							}
						}
						viewObj._unexpandedTree = tmp;

						var currentValue;
						if (viewObj.isSaveCurrentPath() && selected && viewObj._unexpandedTree !== path) {
							currentValue = [path];
						} else {
							currentValue = viewObj.getSelectedTree().concat(viewObj._unexpandedTree);
						}

						viewObj.dom().triggerHandler('ev_view_change', [
							{
								type: 'value',
								value: JSON.stringify($.unique(currentValue))
							}
						]);
					}
				},
				{
					selector: '.folder-tree-root-children-ul',
					event: 'ev_click_item_open',
					callback: function (e, data, viewObj) {
						viewObj._selectTree([viewObj._unexpandedTree]);
					}
				}
			];
		},

		init: function () {
			this._originData = [];
			this._unexpandedTree = [];
			this._setOnce = true;
		},

		render: function () {
			var settings = this.settings;
			var labelField = settings.labelField === false ? 'label-empty' : '';
			var dom = this.dom();

			dom.addClass('widget-container folder-tree-container tree-container ' + labelField);

			var innerHTML = '';
			if (settings.labelField !== null) {
				innerHTML += '<div class="widget-fieldlabel-wrap ' + settings.labelCls + '">';
				innerHTML += '<div class="widget-fieldlabel-inner">';
				innerHTML += '<label class="widget-fieldlabel text-fieldlabel">' + settings.labelField + '</label>';
				if (settings.labelField) {
					innerHTML += '<span class="widget-separator">' + settings.separator + '</span>';
				}
				innerHTML += '</div>';
				innerHTML += '</div>';
			}
			innerHTML += '<div class="widget-wrap-outer folder-tree-wrap-outer tree-wrap-outer">';
			innerHTML += '<div class="widget-wrap folder-tree-wrap tree-wrap">';
			innerHTML += '<div class="folder-tree-root tree-root">';
			innerHTML += '<ul class="folder-tree-root-children-ul tree-root-children-ul">';
			innerHTML += '</ul>';
			innerHTML += '</div>';
			innerHTML += '</div>';
			innerHTML += '</div>';
			dom.append(innerHTML);
			$.su.scrollbar({
				ele: dom.find('.folder-tree-wrap-outer')[0],
				opts: {
					wheelPropagation: true,
					useBothWheelAxes: true,
					suppressScrollY: true
				}
			});
		},

		_createRootNode: function (dom) {
			return new $.su.widgets['folderTreeNode']({
				id: dom,
				settings: {
					childrenProp: this.settings.childrenProp,
					multiSelect: this.settings.multiSelect,
					extension: this.settings.extension,
					autoCollapsible: this.settings.autoCollapsible
				}
			});
		},

		clearTree: function (data) {
			this.dom().find('.tree-root-children-ul').empty();
		},

		renderTree: function (data) {
			var me = this;
			FolderTree.superclass.renderTree.call(this, data);
			this.setValue(null);
		},

		setValue: function (data) {
			if (data === null) {
				this.dom().triggerHandler('ev_view_change', [
					{
						type: 'value',
						value: []
					}
				]);
				return;
			}
			if (!data.length || typeof data !== 'object') {
				return;
			}

			if (this._setOnce) {
				this._originData = data;
				this._unexpandedTree = this.getUnexpandedTree();
				this._setOnce = false;
			}
			this._selectTree(data);
		},

		_selectTree: function (data) {
			if (data == null) {
				return;
			}
			for (var i = 0, len1 = data.length; i < len1; i++) {
				for (var j = 0, len2 = data[i].length; j < len2; j++) {
					var selectTree = this._findByPath(data[i][j]);
					if (selectTree) {
						selectTree.select();
						selectTree.syncSelectedStatusToChildren();
						selectTree.syncSelectedStatusToParent();
					} else {
						var parentPath = data[i][j].match(/(.+)\/.+/);
						while (parentPath && parentPath[1]) {
							var parentTree = this._findByPath(parentPath[1]);
							if (parentTree) {
								parentTree.partialSelect();
							}
							parentPath = parentPath[1].match(/(.+)\/.+/);
						}
					}
				}
			}
		},

		getSelectedTree: function () {
			if (!this._children) {
				return false;
			} else {
				var allData = [];
				$.each(this._children, function (index, child) {
					var childArr = [];
					child.getSelectedTree(childArr);
					if (childArr.length > 0) {
						allData = allData.concat(childArr);
					}
				});
				return allData;
			}
		},

		getUnexpandedTree: function () {
			var result = [];
			for (var i = 0, len1 = this._originData.length; i < len1; i++) {
				for (var j = 0, len2 = this._originData[i].length; j < len2; j++) {
					var selectTree = this._findByPath(this._originData[i][j]);
					if (!selectTree) {
						result.push(this._originData[i][j]);
					}
				}
			}
			return result;
		},

		compareTree: function (data) {},

		_findByPath: function (path) {
			if (!this._children) {
				return false;
			} else {
				for (var i = 0; i < this._children.length; i++) {
					var child = this._children[i];
					if (child._findByPath(path)) {
						return child._findByPath(path);
					}
				}
				return false;
			}
		},

		isSaveCurrentPath: function () {
			var settings = this.settings;
			return settings.multiSelect == 'single' && settings.childrenProp.indexOf('leaves');
		}
	});
})();
