(function () {
	$.su.Widget.register('networkScanList', {
		settings: {
			titleText: {
				attribute: 'title-text'
			}
		},
		listeners: [
			{
				selector: '.status.operation',
				event: 'click',
				callback: function (e, viewObj) {
					var dom = viewObj.dom();
					var key = e.target.parentNode.getAttribute('key');
					dom.triggerHandler('ev_operation_click', key);
				}
			}
		],
		init: function () {},
		render: function () {
			var html = '';
			html += "<div class='scan-list-container'>";
			html += "<div class='list-title'><div class='title-content'>" + this.settings.titleText;
			html += "<div widget='toolTip' global-cls='question' class='question-tool-tip'></div></div>";
			html += "<div class='list-status'></div></div>";
			html += "<ul class='list-container'>";
			html += '</ul></div>';
			this.dom().append(html);
			this._registerToolTip();
		},
		syncData: function (keys, callback) {
			var contentContainer = this.dom().find('.scan-list-container .list-container');
			contentContainer.empty();
			this.dom().triggerHandler('ev_store_render_items', [keys]);
		},
		renderModels: function (keys, models) {
			var _this = this.dom().find('.list-container');
			var html = '';

			for (var i = 0; i < models.length; i++) {
				var data = models[i].getData();
				html += "<li class='list-content'" + "key='" + data.key + "'>" + data.name + '';

				if (data.titleSuffix) {
					html += data.titleSuffix;
				}
				var txt = data.operationTxt || '';
				var operationCls = data.operationCls || '';
				var operation = data.noOperation ? 'no-operation' : 'operation';

				if (data.operationHover) {
					html += "<div data-tip='" + data.operationHover + "' class='" + operationCls + " status'>" + txt + '</div>';
				} else {
					html += "<div class='" + operation + ' status ' + operationCls + "'>" + txt + '</div>';
				}
				if (data.warn) {
					html += "<div class='warning'>" + data.warn + '</div>';
				}
				html += '</li>';
			}
			html += '</ul></div>';
			_this.append(html);
		},
		setListStatus: function (statusHTML) {
			var statusContainer = this.dom().find('.list-status')[0];
			statusContainer.innerHTML = statusHTML;
		},
		_registerToolTip: function () {
			var _config = this.settings.configs;

			if (_config && _config.questionTip) {
				var questionTipTxt = _config.questionTip;
				var questionTip = this.dom().find('div[widget=toolTip].question-tool-tip');
				new $.su.widgets.toolTip({ id: $(questionTip[0]), tipText: questionTipTxt }).render();
			}
		}
	});
})();
