var Notes = $.su.Widget.register('notes', {
	settings: {
		title: {
			attribute: 'notes-title',
			defaultValue: '' //标题
		},
		showTitle: {
			attribute: 'show-title',
			defaultValue: true
		},
		constantIndex: {
			attribute: 'constant-index',
			defaultValue: ''
		},
		autoIndex: {
			attribute: 'auto-index', //自动序号, 当为 false 时关闭自动序号
			defaultValue: '1'
		},
		indexPoint: {
			attribute: 'index-point',
			defaultValue: true
		},
		items: {
			attribute: 'items',
			defaultValue: null
			/**
			 * items: [{
			 *          text: 'line1',   //如果不写renderer，此值为显示的文本
			 *          renderer: function(value) {  //可选，将text作为value传入，自定义内容作为返回值
			 *          }
			 *      }, {
			 *          text: 'line2',
			 *          renderer: function(value) {
			 *          }
			 *      }, {
			 *          text: 'line3'
			 *      }]
			 */
		}
	},

	listeners: [],

	init: function () {},

	render: function () {
		this.element = this.dom();

		this.element.addClass('notes-ctn').empty();
		if (this.settings.showTitle) {
			this.settings.title = this.settings.title || $.su.CHAR.COMMON.NOTES + ':';
			this.element.append('<div class="notes-title">' + this.settings.title + '</div>');
		}

		var options = {
			autoIndex: this.settings.autoIndex,
			constantIndex: this.settings.constantIndex,
			indexPoint: this.settings.indexPoint
		};

		this.element.append(this.createListItem(this.settings.items, options));
	},

	createListItem: function (items, options) {
		if (!items || !$.isArray(items)) {
			return;
		}
		var html = '<ul class="notes-ul">';
		var tmpText;

		for (var i = 0, len = items.length, indexText, indexTextPoint, item; i < len; i++) {
			tmpText = '';
			item = items[i];
			if ($.isFunction(item.renderer)) {
				tmpText = item.renderer(item.text);
			} else {
				tmpText = item.text;
			}

			if (tmpText == '') {
				continue;
			}
			indexText = this.getIndexText(options, i);
			indexTextPoint = this.getIndexPoint(indexText, options);

			tmpText = '<span class="notes-index">' + indexText + indexTextPoint + '</span><span class="notes-content">' + tmpText + '</span>';

			html += '<li class="notes-li">';
			html += tmpText;
			html += '</li>';

			if ($.isArray(item.children)) {
				var childOptions = $.extend({}, options, item.childrenSettings);
				html += this.createListItem(item.children, childOptions);
			}
		}
		html += '</ul>';
		return html;
	},

	setTitle: function (text) {
		this.settings.title = text;
		this.dom().find('.notes-title').text(text);
	},

	getIndexText: function (options, i) {
		if (options.constantIndex !== '') {
			return options.constantIndex;
		}

		if (options.autoIndex && $.type(options.autoIndex) === 'string') {
			var startCharCode = options.autoIndex.charCodeAt(0);
			return String.fromCharCode(startCharCode + i);
		}

		return '';
	},

	getIndexPoint: function (text, options) {
		if (!text) {
			return '';
		}

		if (!options.indexPoint) {
			return ' ';
		}

		return '. ';
	}
});
