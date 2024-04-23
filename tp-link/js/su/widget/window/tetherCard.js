(function () {
	var TetherCard = $.su.Widget.register('tetherCard', {
		// 登录页面左侧 tether 引导卡片

		// 绑定数据需要提供 title description 和 iconClass（对应图片的类名）
		settings: {
			title: {
				attribute: 'title-text',
				defaultValue: ''
			}
		},
		init: function () {},
		render: function () {
			var html = '';

			html += '<div class="login-tether-wrapper">';
			html += '<div class="tether-card-title">' + this.settings.title + '</div>';
			html += '<div class="tether-card-content">';

			html += '</div>';
			html +=
				'<div class="login-tether" widget="tether" qr-link="https://download-app.tp-link.com/?app=tether&page=login&source=webui&function=open"></div></div>';
			this.dom().append(html);

			var item = this.dom().find('.login-tether');
			new $.su.widgets.tether({ id: $(item) }).render();
		},
		syncData: function (keys, callback) {
			this.dom().triggerHandler('ev_store_render_items', [keys]);
		},
		renderModels: function (keys, models) {
			var _this = this.dom().find('.tether-card-content');
			var html = '';

			models.forEach(function (model) {
				var item = model.getData();

				html += '<div class="tether-card">';
				html += '<div class="picture ' + item.iconClass + '"></div>';
				html += '<div class="description">';
				html += '<div class="title">' + item.title + '</div>';
				html += ' <p class="content">' + item.description + '</p></div>';
				html += '</div>';
			});

			_this.append(html);
		}
	});
})();
