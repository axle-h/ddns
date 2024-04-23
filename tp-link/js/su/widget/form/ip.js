(function ($) {
	var Ip = $.su.Widget.register('ip', {
		extend: 'textbox',
		settings: {},
		listeners: [
			{
				selector: '.text-wrap-inner input',
				event: 'keydown',
				callback: function (e, viewObj) {
					var input = $(this);
					var index = parseInt(input.attr('data-index'), 10);
					var CHAR_WHITE_LIST = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '.'];

					if (viewObj.dom().hasClass('disabled')) {
						return;
					}

					// left,right,tab,ctrl use default behavior.
					if (e.keyCode === 37 || e.keyCode === 39 || e.keyCode === 9 || e.keyCode === 17 || (e.ctrlKey === true && e.keyCode === 65)) {
						return;
					}

					// prevent keys except number delete backspace ctrl "." and "command" in mac.
					if (
						!(e.keyCode >= 48 && e.keyCode <= 57) &&
						!(e.keyCode >= 96 && e.keyCode <= 105) &&
						e.keyCode != 8 &&
						e.keyCode != 46 &&
						e.keyCode != 190 &&
						e.keyCode != 110 &&
						!e.ctrlKey &&
						!e.metaKey
					) {
						e.preventDefault();
						return;
					}

					// prevent shift key
					if (e.shiftKey === true && !CHAR_WHITE_LIST.includes(e.key)) {
						e.preventDefault();
						return;
					}

					var val = input.val();
					var start = input.get(0).selectionStart;
					var end = input.get(0).selectionEnd;
					var selection = val.slice(start, end);
					var dotCount = val.split('.').length - 1;
					var part1 = val.slice(0, start);
					var part2 = val.slice(end);

					// behavior of "."
					if (e.keyCode === 190 && (part1.lastIndexOf('.') === part1.length - 1 || part2.indexOf('.') === 0 || dotCount > 2)) {
						e.preventDefault();
						return;
					}
				}
			}
		],

		init: function () {},

		render: function () {
			var inHtml = '';
			var _this = this.dom();
			Ip.superclass.render.call(this);
			_this.addClass('ip-container');
		},

		setMaxLength: function () {
			return false;
		}
	});
})(jQuery);
