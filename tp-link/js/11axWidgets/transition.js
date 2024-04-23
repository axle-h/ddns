(function () {
	var Transition = $.su.Widget.register('transition', {
		init: function () {
			this._fields = [];
		},
		render: function () {
			var me = this;
			this._domStr = this.dom().html();
			var transferedStr = this._domStr.replace(/{.*?}/g, function (r) {
				var des = $.su.getAttrObject($.su.CHAR, r);
				if (des) {
					return des;
				} else {
					me._fields.push({
						//deal this as a field
						name: r.replace(/[\{,\}]/g, ''),
						value: null
					});
					return r;
				}
			});
			this._initTransferedStr = transferedStr; //only locale string transfered

			var initRenderString = transferedStr.replace(/{.*?}/g, function (r) {
				return '';
			});
			this.dom().html(initRenderString);
		},
		setField: function (fieldName, value) {
			var fields = this._fields;
			for (var i = 0; i < fields.length; i++) {
				if (fields[i].name === fieldName) {
					fields[i].value = value;
					break;
				}
			}
			this._updateDomStr();
		},
		_updateDomStr: function () {
			var me = this;
			var transferedStr = this._initTransferedStr.replace(/{.*?}/g, function (r) {
				var fieldName = r.replace(/[\{,\}]/g, '');
				var fields = me._fields;
				for (var i = 0; i < fields.length; i++) {
					if (fields[i].name === fieldName) {
						var fieldValue = fields[i].value;
						return fieldValue === null ? '' : fieldValue;
					}
				}
				return '';
			});
			this.dom().html(transferedStr);
		}
	});
})(jQuery);
