/**
 * Created by admin on 2018/12/27.
 */
(function () {
	var Img = $.su.Widget.register('img', {
		settings: {
			imgSrc: {
				attribute: 'img-src',
				defaultValue: ''
			},
			alt: {
				attribute: 'alt',
				defaultValue: ''
			}
		},
		listeners: [],
		init: function () {},
		render: function () {
			var _this = this.dom();
			var settings = this.settings;
			var imgSrc = $.su.getAttrObject($.su.imgSrc, settings['img-src']); //can not get value from imgSrc,because the default root is $.su.CHAR
			_this.addClass('img-container');

			var inHTML = '';
			inHTML += '<img src="' + imgSrc + '" alt="' + settings.alt + '"/>';
			_this.append(inHTML);
		}
	});
})();
