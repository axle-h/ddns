(function () {
	var FolderTreeNodeNS = {
		SELECTED_STATUS: {
			//node's selected status: full, partial, unSelected
			FULL: 'full',
			PARTIAL: 'partial',
			UNSELECTED: 'unSelected'
		},
		SELECTED_CSS_CLASS: {
			FULL: 'selected',
			PARTIAL: 'partial-selected'
		},
		EVENT: {
			CHILDREN_LOADED: 'ev_children_loaded', //children items loaded event
			REFRESH_SELECTED_STATUS: 'ev_check_selected_status'
		}
	};

	var FolderTreeNode = $.su.Widget.register('folderTreeNode', {
		extend: 'treeNode',
		settings: function (parentSettings) {
			return $.extend(true, {}, parentSettings, {
				// multiSelect: true,
				accordion: false,
				lazyLoad: true
			});
		},

		listeners: function () {
			return [
				{
					selector: '.folder-tree-folder-node-select-icon',
					event: 'click',
					callback: function (e, viewObj) {
						e.stopPropagation();
						e.preventDefault();

						viewObj.syncSelectedStatusToBrother();

						if (
							viewObj.settings.multiSelect == 'single' &&
							!!viewObj.parentNode &&
							viewObj.parentNode._selectStatus !== FolderTreeNodeNS.SELECTED_STATUS.UNSELECTED
						) {
							viewObj.select();
						} else if (viewObj._selectStatus === FolderTreeNodeNS.SELECTED_STATUS.FULL) {
							viewObj.unSelect();
						} else {
							viewObj.select();
						}

						viewObj.syncSelectedStatusToChildren();
						viewObj.syncSelectedStatusToParent();

						var pathText = $(this).closest('.folder-tree-folder-node-row').find('.folder-tree-folder-node-text');
						var path = pathText.attr('path');
						viewObj
							.dom()
							.closest('.folder-tree-root-children-ul')
							.trigger('ev_click_item', [path, viewObj._selectStatus === FolderTreeNodeNS.SELECTED_STATUS.FULL]);

						if (viewObj.settings.autoCollapsible && viewObj._open) {
							pathText.click();
						}
					}
				},
				{
					selector: '.folder-tree-folder-node-text',
					event: 'click',
					callback: function (e, viewObj) {
						e.stopPropagation();
						e.preventDefault();
						var data = {};
						if ($(this).closest('.folder-tree-folder-node').hasClass('empty')) {
							return;
						}
						if ($(this).attr('uuid') == 'undefined') {
							data.uuid = $(this).parent().closest('[uuid]').attr('uuid');
							data.path = $(this).attr('path');
							if (viewObj._open) {
								viewObj
									.dom()
									.closest('.folder-tree-container')
									.triggerHandler('ev_folder_tree_close', [
										data,
										function (data) {
											viewObj.close(200);
										}
									]);
							} else {
								viewObj
									.dom()
									.closest('.folder-tree-container')
									.triggerHandler('ev_folder_tree_open', [
										data,
										function (data) {
											viewObj._renderNodeAsChild(data) ? viewObj.open(200) : '';
											viewObj.syncSelectedStatusToChildren();
											viewObj.dom().closest('.folder-tree-root-children-ul').trigger('ev_click_item_open', [data]);
										}
									]);
							}
						} else {
							if (viewObj._open) {
								viewObj.close(200);
							} else {
								viewObj.open(200);
							}
						}
					}
				},
				{
					selector: '.folder-tree-folder-node-open-icon',
					event: 'click',
					callback: function (e, viewObj) {
						e.stopPropagation();
						e.preventDefault();
						var data = {};
						if ($(this).closest('.folder-tree-folder-node').hasClass('empty')) {
							return;
						}
						if ($(this).closest('.folder-tree-folder-node').find('.folder-tree-folder-node-text').attr('uuid') == 'undefined') {
							data.uuid = $(this).parent().closest('[uuid]').attr('uuid');
							data.path = $(this).closest('.folder-tree-folder-node-row').find('.folder-tree-folder-node-text').attr('path');
							if (viewObj._open) {
								viewObj
									.dom()
									.closest('.folder-tree-container')
									.triggerHandler('ev_folder_tree_close', [
										data,
										function (data) {
											viewObj.close(200);
										}
									]);
							} else {
								viewObj
									.dom()
									.closest('.folder-tree-container')
									.triggerHandler('ev_folder_tree_open', [
										data,
										function (data) {
											viewObj._renderNodeAsChild(data) ? viewObj.open(200) : '';
											viewObj.syncSelectedStatusToChildren();
											viewObj.dom().closest('.folder-tree-root-children-ul').trigger('ev_click_item_open', [data]);
										}
									]);
							}
						} else {
							if (viewObj._open) {
								viewObj.close(200);
							} else {
								viewObj.open(200);
							}
						}
					}
				}
			];
		},

		init: function () {
			var me = this;
			FolderTreeNode.superclass.init.call(this);

			this._path = $.su.guid('tree-node');
			this._selectStatus = FolderTreeNodeNS.SELECTED_STATUS.UNSELECTED;
			this.parentNode = null;

			// this.on(FolderTreeNodeNS.EVENT.REFRESH_SELECTED_STATUS, function(){
			// 	this.checkSelectedStatus();
			// });
		},

		render: function () {
			FolderTreeNode.superclass.render.call(this);
			this.dom().addClass('folder-tree-node-container');
		},

		/*
		 * @override
		 * */
		_nodeIsBranch: function (data) {
			return data.hasBranch;
		},

		/*
		 * @override
		 * */
		_nodeIsLeaf: function (data) {
			return !data.hasBranch;
		},

		/*
		 * @override
		 * */
		_renderNodeAsBranch: function (data) {
			this._children = [];
			this._path = data.path;
			var node = this.dom();
			node.addClass('folder-tree-folder-node empty');
			var innerHTML = '';
			innerHTML += '<div>';
			innerHTML += '<div class="folder-tree-folder-node-row">';
			innerHTML += '<a class="checkbox">';
			innerHTML += '<span class="folder-tree-folder-node-select-icon"></span>';
			innerHTML += '</a>';
			innerHTML += '<a class="text-node">';
			innerHTML += '<span uuid="' + data.uuid + '" path="' + data.path + '" class="folder-tree-folder-node-text">' + data.name + '</span>';
			innerHTML += '<span class="folder-tree-folder-node-open-icon"></span>';
			innerHTML += '</a>';
			innerHTML += '</div>';
			innerHTML += '<ul class="folder-tree-folder-node-children-ul">';
			innerHTML += '</ul>';
			innerHTML += '</div>';
			node.append(innerHTML);

			var childrenUl = node.find('.folder-tree-folder-node-children-ul');

			childrenUl.hide();
			if (this._nodeIsBranch(data)) {
				node.removeClass('empty');
			}
			this._renderNodeAsChild(data);
		},

		_renderNodeAsChild: function (data) {
			var childrenData = this.convertChildrenData(data);

			if (!childrenData || !childrenData.length) {
				return;
			}

			var node = this.dom();
			var childrenUl = node.find('.folder-tree-folder-node-children-ul');

			var length = 0 || (childrenData && childrenData.length);
			var i = 0;
			if (length > 0) {
				node.removeClass('empty');
			} else {
				node.addClass('empty');
				return false;
			}
			node.find('.folder-tree-folder-node-text').attr('uuid', data.uuid);
			for (; i < length; i++) {
				var childDom = $('<div></div>');
				childrenUl.append(childDom);
				var childNode = new FolderTreeNode({
					id: childDom,
					settings: {
						childrenProp: this.settings.childrenProp,
						multiSelect: this.settings.multiSelect,
						extension: this.settings.extension,
						autoCollapsible: this.settings.autoCollapsible
					}
				});
				this._children.push(childNode);
				childNode.parentNode = this;
				childNode.render();
				childNode.loadData(childrenData[i]);
				// this.trigger(FolderTreeNodeNS.EVENT.CHILDREN_LOADED);
			}
			return true;
		},

		/*
		 * @override
		 * */
		_renderNodeAsLeaf: function (data) {
			// return;
			var node = this.dom();
			node.addClass('folder-tree-file-node');
			var innerHTML = '';
			innerHTML += '<div>';
			innerHTML += '<a>';
			innerHTML += '<span class="folder-tree-file-select-icon"></span>';
			innerHTML += '</a>';
			innerHTML += '<a>';
			innerHTML += '<span class="folder-tree-file-node-text">' + data.name + '</span>';
			innerHTML += '</a>';
			innerHTML += '</div>';
			node.append(innerHTML);
		},

		convertChildrenData: function (data) {
			var childrenProp = this.settings.childrenProp;
			var childrenPropArr = childrenProp.replace(' ', '').split(',');

			var result = [],
				self = this;
			$.each(childrenPropArr, function (index, key) {
				result.push.apply(result, key == 'leaves' ? self.filterLeavesData(data[key]) : data[key]);
			});

			return result;
		},

		filterLeavesData: function (data) {
			var extension = this.settings.extension;

			if (!extension || !data || !data.length) {
				return data;
			}

			return $.grep(data, function (leaf, index) {
				return leaf.character == extension;
			});
		},

		open: function (time) {
			time = !time && time !== 0 ? 200 : time;
			this._open = true;
			var dom = this.dom();
			dom.find('.folder-tree-folder-node-children-ul').eq(0).slideDown(time);
			dom.find('.folder-tree-folder-node-open-icon').eq(0).addClass('opened');
		},

		close: function (time) {
			time = !time && time !== 0 ? 200 : time;
			this._open = false;
			var dom = this.dom();
			dom.find('.folder-tree-folder-node-children-ul').eq(0).slideUp(time);
			dom.find('.folder-tree-folder-node-open-icon').eq(0).removeClass('opened');
		},

		select: function () {
			if (this._selectStatus == FolderTreeNodeNS.SELECTED_STATUS.FULL) {
				return;
			}
			this._selectStatus = FolderTreeNodeNS.SELECTED_STATUS.FULL;
			this.dom()
				.find('.folder-tree-folder-node-select-icon')
				.eq(0)
				.removeClass(FolderTreeNodeNS.SELECTED_CSS_CLASS.PARTIAL)
				.addClass(FolderTreeNodeNS.SELECTED_CSS_CLASS.FULL);
		},

		unSelect: function () {
			if (this._selectStatus == FolderTreeNodeNS.SELECTED_STATUS.UNSELECTED) {
				return;
			}
			this._selectStatus = FolderTreeNodeNS.SELECTED_STATUS.UNSELECTED;
			this.dom()
				.find('.folder-tree-folder-node-select-icon')
				.eq(0)
				.removeClass(FolderTreeNodeNS.SELECTED_CSS_CLASS.PARTIAL + ' ' + FolderTreeNodeNS.SELECTED_CSS_CLASS.FULL);
		},

		partialSelect: function () {
			if (this._selectStatus == FolderTreeNodeNS.SELECTED_STATUS.PARTIAL) {
				return;
			}
			this._selectStatus = FolderTreeNodeNS.SELECTED_STATUS.PARTIAL;
			this.dom()
				.find('.folder-tree-folder-node-select-icon')
				.eq(0)
				.removeClass(FolderTreeNodeNS.SELECTED_CSS_CLASS.FULL)
				.addClass(FolderTreeNodeNS.SELECTED_CSS_CLASS.PARTIAL);
		},

		syncSelectedStatusToChildren: function () {
			var desStatus = this._selectStatus;
			var operation;

			if (desStatus == FolderTreeNodeNS.SELECTED_STATUS.FULL) {
				operation = 'select';
			} else if (desStatus == FolderTreeNodeNS.SELECTED_STATUS.UNSELECTED) {
				operation = 'unSelect';
			}

			if (this._children) {
				$.each(this._children, function (index, child) {
					operation && child[operation]();
					child.syncSelectedStatusToChildren();
				});
			}
		},

		syncSelectedStatusToBrother: function () {
			if (!this.parentNode) {
				return;
			}

			if (this.settings.multiSelect == 'multiple') {
				return;
			}

			this.parentNode.unSelect();
			this.parentNode.syncSelectedStatusToBrother();

			var self = this;
			$.each(this.parentNode._children, function (index, child) {
				if (child.domId !== self.domId && child._selectStatus !== FolderTreeNodeNS.SELECTED_STATUS.UNSELECTED) {
					child.unSelect();
					child.syncSelectedStatusToChildren();
				}
			});
		},

		syncSelectedStatusToParent: function () {
			if (!this.parentNode) {
				return;
			}

			var allSelected = true;
			var allUnSelected = true;

			//calculate
			var length = this.parentNode._children.length; //this fn will only be triggered by someone of its child
			for (var i = 0; i < length; i++) {
				var child = this.parentNode._children[i];
				switch (child._selectStatus) {
					case FolderTreeNodeNS.SELECTED_STATUS.FULL:
						allUnSelected = false;
						break;
					case FolderTreeNodeNS.SELECTED_STATUS.UNSELECTED:
						allSelected = false;
						break;
					case FolderTreeNodeNS.SELECTED_STATUS.PARTIAL:
						allUnSelected = false;
						allSelected = false;
						break;
				}
				if (!allSelected && !allUnSelected) {
					break;
				}
			}

			//update
			if (allSelected) {
				this.parentNode.select();
			} else if (allUnSelected) {
				this.parentNode.unSelect();
			} else {
				this.parentNode.partialSelect();
			}

			//Bubble
			this.parentNode.syncSelectedStatusToParent();
		},

		getSelectedTree: function (allData) {
			if (this._selectStatus == FolderTreeNodeNS.SELECTED_STATUS.FULL) {
				allData.push(this._path);
			} else {
				if (this._children) {
					$.each(this._children, function (index, child) {
						child.getSelectedTree(allData);
					});
				}
			}
		},

		_findByPath: function (path) {
			if (path === this._path) {
				return this;
			} else if (!this._children) {
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
		}
	});
})();
