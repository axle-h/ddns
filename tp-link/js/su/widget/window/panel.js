(function () {
	var Panel = $.su.Widget.register('panel', {
		settings: {
			_title: {
				attribute: 'title-label',
				defaultValue: ''
			},
			instruction: {
				attribute: 'instruction',
				defaultValue: ''
			},
			icon: {
				attribute: 'icon',
				defaultValue: ''
			},
			iconCls: {
				attribute: 'icon-cls',
				defaultValue: ''
			},
			panelType: {
				attribute: 'panel-type',
				defaultValue: 'form' //block
			},
			collapsible: {
				attribute: 'collapsible',
				defaultValue: false
			},
			collapsed: {
				attribute: 'collapsed',
				defaultValue: false
			}
		},
		listeners: [
			{
				selector: function (v) {
					return {
						parent: this.getContainer().find('.panel-title:first')
					};
				},
				//			selector: '.panel-header:eq(0)',
				event: 'click',
				callback: function (e, viewObj) {
					var btn = $(this).find('span.panel-header-btn-collapse');
					var settings = viewObj.settings;
					if (!settings.collapsible) {
						return;
					}
					var container = viewObj.getContainer();
					var content = container.find('div.panel-content');

					if (settings.collapsed) {
						content.slideDown(200, function () {
							content.css('display', 'block');
						});
						container.removeClass('collapsed');
						settings.collapsed = false;
						btn.closest('div[widget=panel]').triggerHandler('ev_panel_open');
					} else {
						content.slideUp(200, function () {
							$(this).css('display', 'none');
						});
						container.addClass('collapsed');
						settings.collapsed = true;
						btn.closest('div[widget=panel]').triggerHandler('ev_panel_close');
					}
				}
			}
		],
		init: function () {},
		render: function () {
			var _this = this.dom();
			var settings = this.settings;

			var display = settings.collapsible ? (settings.collapsed === false ? 'block' : 'none') : 'block';
			var collapsed = settings.collapsed ? ' collapsed' : '';
			_this.addClass(settings.cls + 'panel-container ' + settings.panelType + collapsed);

			var inHTML = '';
			inHTML += '<div class="panel-wrap-before"></div>';
			inHTML += '<div class="panel-wrap">';

			if (settings._title !== false) {
				inHTML += '<div class="panel-header">';
				inHTML += '<h3 class="panel-title">';
				inHTML += '<span class="panel-title-icon"></span>';
				inHTML += '<span class="panel-title-text">' + settings._title + '</span>';

				if ($.type(settings.instruction) === 'string' && settings.instruction !== '') {
					inHTML += '<div class="panel-title-instruction">' + settings.instruction + '</div>';
				}

				inHTML += '<div class="panel-header-btn-container">';

				if (settings.collapsible) {
					inHTML += '<span class="panel-header-btn-collapse" type="button"></span>';
				}

				inHTML += '</div>';
				inHTML += '</h3>';
				inHTML += '</div>';
			}

			inHTML += '<div class="panel-content" style="display: ' + display + '">';
			inHTML += '<div class="panel-tbar-container"></div>';
			inHTML += '<div class="panel-content-container"></div>';
			inHTML += '<div class="panel-fbar-container"></div>';
			inHTML += '</div>';
			inHTML += '</div>';
			inHTML += '<div class="panel-wrap-after"></div>';
			var content = $(inHTML);

			if (_this.find('div.panel-content-container').length > 0) {
				content.find('div.panel-content-container').append(_this.find('div.panel-content-container').children().detach());
				_this.find('.panel-wrap').remove();
			} else {
				content.find('div.panel-content-container').append(_this.children().detach());
			}

			_this.append(content);
		},
		setTitle: function (title) {
			var container = this.getContainer();

			if (!title) {
				return;
			}
			// container.find("h3.panel-title span.panel-title-text").html(title);
			// container.find("h3.panel-title span.panel-title-text").first().html(title);
			container.children('.panel-wrap').children('.panel-header').find('h3.panel-title span.panel-title-text').html(title);
		},
		setInstruction: function (instruction) {
			var container = this.getContainer();

			if (!instruction) {
				container.find('h3.panel-title div.panel-title-instruction').hide();
				return;
			}
			container.find('h3.panel-title div.panel-title-instruction').show();
			container.find('h3.panel-title div.panel-title-instruction').html(instruction);
		},
		close: function () {
			var settings = this.settings;
			var container = this.getContainer();
			var content = container.find('div.panel-content');

			content.slideUp(200, function () {
				$(this).css('display', 'none');
			});

			container.addClass('collapsed');

			settings.collapsed = true;
			this.dom().triggerHandler('ev_panel_close');
		},
		open: function () {
			var settings = this.settings;
			var container = this.getContainer();
			var content = container.find('div.panel-content');
			var btn = container.find('span.panel-header-btn-collapse');
			content.slideDown(200, function () {
				content.css('display', 'block');
				container.removeClass('collapsed');
			});
			settings.collapsed = false;
			this.dom().triggerHandler('ev_panel_open');
		},
		isOpen: function () {
			var container = this.getContainer();
			return !container.hasClass('collapsed');
		},
		showTitle: function () {
			var container = this.getContainer();
			var title = container.find('div.panel-header');

			container.removeClass('hide-title');
			title.show();
		},
		hideTitle: function () {
			var container = this.getContainer();
			var title = container.find('div.panel-header');

			container.addClass('hide-title');
			title.hide();
		}
	});
})();
