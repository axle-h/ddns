(function () {
	var TreeNode = $.su.Widget.register('treeNode', {
		listeners: [],

		init: function () {
			this._key = $.su.guid('tree-node');
		},

		render: function () {
			this.dom().addClass('tree-node-container');
		},

		loadData: function (data) {
			var _this = this.dom();
			var viewObj = this;
			var settings = this.settings;
			var childrenProp = settings.childrenProp;
			// if(this._nodeIsBranch(data)){
			this._renderNodeAsBranch(data);
			// }else{
			// 	this._renderNodeAsLeaf(data);
			// }
		},

		setValue: function (value) {},

		/*
		 * @abstract
		 * */
		_nodeIsBranch: function (data) {},

		/*
		 * @abstract
		 * */
		_nodeIsLeaf: function (data) {},

		/*
		 * @abstract
		 * */
		_renderNodeAsBranch: function (node, data) {
			this._children = [];
		},

		/*
		 * @abstract
		 * */
		_renderNodeAsLeaf: function (node, data) {},

		/*
		 * @method find child node by key
		 * */
		_findByKey: function (key) {
			if (key === this._key) {
				return this;
			} else if (!this._children) {
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
		},

		/*
		 * @method find child node by some condition
		 * */
		find: function (condition) {}
	});
})();
