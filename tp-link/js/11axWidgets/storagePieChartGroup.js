(function () {
	var StoragePieChartGroup = $.su.Widget.register('storagePieChartGroup', {
		settings: {
			configs: {
				attribute: 'configs',
				defaultValue: null
			},
			pieChartOption: {
				attribute: 'pie-chart-option',
				defaultValue: {
					baseOption: {
						series: [
							{
								type: 'pie',
								hoverAnimation: false,
								radius: ['0%', '30%'],
								avoidLabelOverlap: true,
								stillShowZeroSum: false,
								label: {
									normal: {
										show: true,
										position: 'center',
										color: 'rgba(255,255,255,0.8)',
										value: '#fff',
										fontSize: '16',
										lineHeight: 20,
										formatter: function (val) {
											return $.su.CHAR.GRID.TOTAL + ':' + '\n' + $.su.numToCapacity(val.name);
										}
									}
								},
								data: [
									{ value: 0, name: '{total}' } //$.su.numToCapacity(totalCapacity)
								]
							},
							{
								type: 'pie',
								hoverAnimation: false,
								radius: ['78%', '100%'],
								avoidLabelOverlap: true,
								label: {
									normal: {
										show: false
									}
								},
								labelLine: {
									normal: {
										show: false
									}
								},
								data: '{formData}',
								color: []
							}
						]
					}
				}
			}
		},

		listeners: [
			{
				selector: '.storage-pie-chart-group-switch-pre',
				event: 'click',
				callback: function (e, viewObj) {
					if ($(this).hasClass('disable')) {
						return;
					}
					viewObj.switchToPre();
				}
			},
			{
				selector: '.storage-pie-chart-group-switch-next',
				event: 'click',
				callback: function (e, viewObj) {
					if ($(this).hasClass('disable')) {
						return;
					}
					viewObj.switchToNext();
				}
			},
			{
				selector: function () {
					return {
						parent: window
					};
				},
				event: 'resize',
				callback: function (e, viewObj) {
					viewObj.echart.resize();
				}
			}
		],

		init: function () {
			StoragePieChartGroup.superclass.init.call(this);
			this._data = [];
			this.echart = null;
			this.settings.configs.fields = this.settings.configs.fields || [];
			this.settings.pieChartOption.baseOption.series[1].color = (function (fields) {
				var ret = [];
				for (var i = 0; i < fields.length; i++) {
					ret.push(fields[i].color);
				}
				return ret;
			})(this.settings.configs.fields);

			this._currentDataIndex = null;
		},

		render: function () {
			var me = this;
			var _this = this.dom();
			var settings = this.settings;

			var innerHTML = '';
			innerHTML += '<div class="storage-pie-chart-group-wrap">';
			innerHTML += '<div class="storage-pie-chart-group-operation-bar tbar-container">';
			innerHTML += '<div class="storage-pie-chart-group-switch-container">';
			innerHTML += '<a class="storage-pie-chart-group-switch-pre">';
			innerHTML += '</a>';
			innerHTML += '<div class="storage-pie-chart-group-item-title">';
			innerHTML += '</div>';
			innerHTML += '<a class="storage-pie-chart-group-switch-next">';
			innerHTML += '</a>';
			innerHTML += '</div>';
			innerHTML += '<div class="storage-pie-chart-group-refresh operation-container">';
			innerHTML += "<a class='operation-btn btn-refresh'>";
			innerHTML += "<span class='icon'></span>";
			innerHTML += "<span class='text'>" + $.su.CHAR.OPERATION.REFRESH + '</span>';
			innerHTML += '</a>';
			innerHTML += '</div>';
			innerHTML += '</div>';

			innerHTML += '<div class="storage-pie-chart-group-chart-wrap">';
			innerHTML += '<div class="storage-pie-chart-group-pie-chart-wrap">';
			innerHTML += '<div class="storage-pie-chart-group-pie-chart">';
			innerHTML += '</div>';
			innerHTML += '</div>';
			innerHTML += '<div class="storage-pie-chart-group-table-chart-wrap">';
			innerHTML += '<div class="storage-pie-chart-group-table-chart">';
			innerHTML += '</div>';
			innerHTML += '</div>';
			innerHTML += '</div>';
			innerHTML += '</div>';

			_this.addClass('storage-pie-chart-group-container').append(innerHTML);

			if (window.echarts === undefined) {
				var dtd = $.Deferred();
				$.su.router.loadFile('js/libs/echarts.min.js', function () {
					me.renderPieChart();
					dtd.resolve();
				});
				return dtd.promise();
			} else if (window.echarts) {
				me.renderPieChart();
			}
		},

		renderPieChart: function () {
			var _this = this.dom();
			this.echart = echarts.init(_this.find('.storage-pie-chart-group-pie-chart').get(0));
		},

		switchToPre: function () {
			this.switchToItemByIndex(this._currentDataIndex - 1);
		},

		switchToNext: function () {
			this.switchToItemByIndex(this._currentDataIndex + 1);
		},

		getCurrentDataIndex: function () {
			return this._currentDataIndex;
		},

		switchToItemByIndex: function (index) {
			this._loadChartData(this._data[index]);
			this._currentDataIndex = index;
			this._updateSwitchButton();
		},

		_loadChartData: function (formdata) {
			var _this = this.dom();

			//pie echart
			var data = this._pieChartDataDealer(formdata);
			this.echart.setOption(data);

			//title
			var title = formdata[this.settings.configs.nameField];
			_this.find('.storage-pie-chart-group-item-title').text(title);

			//table
			var tableInnerHTML = '';
			var fields = this.settings.configs.fields;
			for (var i = 0; i < fields.length; i++) {
				var field = fields[i];
				tableInnerHTML += '<div class="storage-pie-chart-group-table-chart-item ' + field.dataIndex + '">';
				tableInnerHTML += '<div class="storage-pie-chart-group-table-chart-item-spot" style="background-color:' + field.color + '">';
				tableInnerHTML += '</div>';
				tableInnerHTML += '<div class="storage-pie-chart-group-table-chart-item-label">';
				tableInnerHTML += field.text + this.settings.separator;
				tableInnerHTML += '</div>';
				tableInnerHTML += '<div class="storage-pie-chart-group-table-chart-item-value">';
				tableInnerHTML += formdata[field.dataIndex];
				tableInnerHTML += '</div>';
				tableInnerHTML += '</div>';
			}
			_this.find('.storage-pie-chart-group-table-chart').empty().append(tableInnerHTML);
		},

		_pieChartDataDealer: function (data) {
			var option = $.extend(true, {}, this.settings.pieChartOption);
			var fields = this.settings.configs.fields;

			var formData = [];
			var sum = 0;
			for (var i = 0; i < fields.length; i++) {
				var itemValue = data[fields[i].dataIndex];
				formData.push({
					name: fields[i].text,
					value: $.su.capacityToNum(itemValue)
				});
				sum += $.su.capacityToNum(itemValue);
			}

			option.baseOption.series[0].data[0].name = $.su.numToCapacity(sum);
			option.baseOption.series[1].data = formData;
			return option;
		},

		_updateSwitchButton: function () {
			var length = this._data.length;
			this._enablePreBtn();
			this._enableNextBtn();
			if (this._currentDataIndex === 0) {
				this._disablePreBtn();
			}
			if (this._currentDataIndex === length - 1) {
				this._disableNextBtn();
			}
		},

		_disablePreBtn: function () {
			this.dom().find('.storage-pie-chart-group-switch-pre').addClass('disable');
		},

		_enablePreBtn: function () {
			this.dom().find('.storage-pie-chart-group-switch-pre').removeClass('disable');
		},

		_disableNextBtn: function () {
			this.dom().find('.storage-pie-chart-group-switch-next').addClass('disable');
		},

		_enableNextBtn: function () {
			this.dom().find('.storage-pie-chart-group-switch-next').removeClass('disable');
		},

		_showBtn: function () {
			this.dom().find('.storage-pie-chart-group-switch-next').show();
			this.dom().find('.storage-pie-chart-group-switch-pre').show();
		},

		_hideBtn: function () {
			this.dom().find('.storage-pie-chart-group-switch-next').hide();
			this.dom().find('.storage-pie-chart-group-switch-pre').hide();
		},

		loadItems: function (models) {
			this._data = $.su.clone(models);
			if (models.length > 0) {
				this.switchToItemByIndex(0);
				if (this._data.length == 1) {
					this._hideBtn();
				} else {
					this._showBtn();
				}
			}
		}
	});
})();
