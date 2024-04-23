(function () {
	var imageEditor = $.su.Widget.register('imageEditor', {
		extend: 'file',
		settings: {
			ratio: {
				attribute: 'ratio',
				defaultValue: '9:18'
			},
			maxSize: {
				attribute: 'max-size',
				defaultValue: 2 * 1024
			},
			btnCtrl: {
				attribute: 'btn-ctrl',
				defaultValue: false
			}
		},
		listeners: [
			{
				selector: 'input.file-input',
				event: 'click',
				callback: function (e, viewObj) {
					viewObj.resetFile();
				}
			},
			{
				selector: function () {
					return {
						parent: this.dom().find('input.file-input')
					};
				},
				event: 'change',
				callback: function (e, viewObj) {
					var container = viewObj.getContainer();
					var tar = $(this);
					var value = tar.val();
					if (!value) {
						return;
					}
					var size = 0;
					if ($.su.isIe9()) {
						var fso = new ActiveXObject('Scripting.FileSystemObject');
						size = fso.GetFile(tar.val()).size / 1000;
					} else {
						size = Math.round((tar[0].files[0].size / 1024) * 100) / 100;
					}
					if (tar[0].files) {
						if (viewObj.settings.maxSize) {
							if (size > Number(viewObj.settings.maxSize)) {
								viewObj.resetPreview();
								viewObj.dom().triggerHandler('ev_img_size_error', [size]);
								return;
							}
						}
					}

					var allowExtention = '.jpg,.png,.jpeg';

					function getFileSuffix(fileName) {
						var pos = fileName.lastIndexOf('.');
						return fileName.substr(pos);
					}

					if (allowExtention.indexOf(getFileSuffix(value).toLowerCase()) > -1) {
						var canvasElem = document.getElementById(viewObj.domId + '-canvas');
						if (canvasElem && canvasElem.getContext) {
							viewObj.previewImage($('#' + viewObj.domId + ' input')[0], viewObj.domId + '_jcrop_img', viewObj.domId + '_jcrop_wrap', viewObj.ratio);
							container.find('div.jcrop-wrap').show().css('display', 'inline-block');
						}
						container.find('div.img-editor-button-wrap').show();
						container.find('div.file-wrap-outer').hide();
						container.find('div[widget=toolTip]').hide();
						viewObj.dom().triggerHandler('ev_img_change', [viewObj.getFileName(), size]);
					} else {
						viewObj.dom().triggerHandler('ev_img_type_error', [getFileSuffix(value).toLowerCase()]);
						viewObj.resetPreview();
					}
				}
			},
			{
				selector: 'div.img-editor-confirm-btn',
				event: 'click',
				callback: function (e, viewObj) {
					var container = viewObj.getContainer();
					var tar = container.find('input.file-input');
					var btnObj = container.find('div.img-editor-confirm-btn').data('viewObj');
					var value = tar.val().toLowerCase();
					var canvasElem = document.getElementById(viewObj.domId + '-canvas');
					if (!canvasElem || !canvasElem.getContext) {
						viewObj.dom().triggerHandler('ev_img_edit', [value]);
						return;
					}
					var canvas = viewObj.drawSltImg();
					var base64 = canvas.toDataURL('image/png');
					var blob = canvas.toBlob(function (blob) {
						viewObj.dom().triggerHandler('ev_img_edit', [value, blob, btnObj, base64, viewObj.getFileName()]);
					}, 'image/jpeg');
				}
			},
			{
				selector: 'div.img-editor-change-btn',
				event: 'click',
				callback: function (e, viewObj) {
					var container = viewObj.getContainer();
					e.preventDefault();
					e.stopPropagation();
					container.find('input.file-input').click();
				}
			}
		],

		init: function () {
			var pattern_ratio = /^[0-9]+:[0-9]+$/;
			if (this.settings.ratio !== false && !this.settings.ratio.match(pattern_ratio)) {
				// console.error("ratio must be 'width:height',like '1:2'");
				return;
			}
			if (this.settings.ratio !== false) {
				var _ratio = this.settings.ratio.split(':');
				this.ratio = (_ratio[0] * 1) / _ratio[1];
				this.imgRatio = 1;
			}
			this.imgObj = new Image();
			this.imageSrc = '';
			this.jcrop_api;

			this.jcrop_x = 0;
			this.jcrop_y = 0;
			this.jcrop_w = 30;
			this.jcrop_h = !this.ratio ? 30 : 30 / this.ratio;
		},

		render: function () {
			imageEditor.superclass.render.call(this);
			var _this = this.dom();

			_this.addClass('imageEditor-container');

			var inHTML = '<div id="' + this.domId + '_jcrop_wrap" class="jcrop-wrap">';
			inHTML += '<img id="' + this.domId + '_jcrop_img" class="jcrop-img"/>';
			if (this.settings.btnCtrl) {
				inHTML += '<div class="img-editor-button-wrap" >';
				inHTML +=
					'<div widget="button" id="' +
					this.domId +
					'-confirm-btn" class="img-editor-confirm-btn m-t-12 m-r-10" label-field="test" type="button" text="' +
					$.su.CHAR.OPERATION.CONFIRM +
					'"></div>';
				inHTML +=
					'<div widget="button" id="' +
					this.domId +
					'-change-btn"  class="img-editor-change-btn" label-field="test" type="button" text="' +
					$.su.CHAR.OPERATION.CHANGE +
					'"></div>';
				inHTML += '</div>';
			}
			inHTML += '</div>';
			inHTML += '<canvas class="canvas-bgd" id="' + this.domId + '-canvas"></canvas>';

			_this.append(inHTML);

			var imageDfd = $.Deferred();

			if (!$('<div>').Jcrop) {
				$.su.router.loadFile('js/libs/jquery.Jcrop.js').then(function () {
					imageDfd.resolve();
				});
			} else {
				imageDfd.resolve();
			}

			imageDfd.then(function () {
				for (var i = 1, len = 3; i <= len; i++) {
					var tempObj = new $.su.widgets.button({
						id: _this.find('div[widget=button]').eq(i)
					});
					tempObj.render();
				}
			});
		},

		previewImage: function (fileObj, imgPreviewId, divPreviewId, ratio) {
			var viewObj = this;
			if (typeof viewObj.jcrop_api != 'undefined') {
				viewObj.jcrop_api.destroy();
			}

			//允许上传文件的后缀名document.getElementById("hfAllowPicSuffix").value;
			var allowExtention = '.jpg,.png,.jpeg';

			var extention = fileObj.value.substring(fileObj.value.lastIndexOf('.') + 1).toLowerCase();

			var browserVersion = window.navigator.userAgent.toUpperCase();

			if (extention.length != 0 && allowExtention.indexOf(extention) > -1) {
				if (fileObj.files) {
					//HTML5实现预览，兼容chrome、火狐7+等

					if (window.FileReader) {
						var reader = new FileReader();

						fileObj.files[0] == undefined ? 1 : reader.readAsDataURL(fileObj.files[0]);

						reader.onload = function (e) {
							//about canvas
							imageSrc = e.target.result;

							viewObj.imgObj.src = e.target.result;

							$(imgPreviewId).css('display', 'inline-block');

							var t = setTimeout(function () {
								if (viewObj.imgObj.width < 93 && viewObj.imgObj.height < 166) {
									document.getElementById(imgPreviewId).style.width = viewObj.imgObj.width + 'px';
									document.getElementById(imgPreviewId).style.height = viewObj.imgObj.height + 'px';
									viewObj.imgRatio = 1;
								} else if (viewObj.imgObj.width > viewObj.imgObj.height) {
									document.getElementById(imgPreviewId).style.width = '93px';
									document.getElementById(imgPreviewId).style.height = 'auto';

									viewObj.imgRatio = 93 / viewObj.imgObj.width;
								} else if (viewObj.imgObj.width < viewObj.imgObj.height) {
									document.getElementById(imgPreviewId).style.height = '166px';
									document.getElementById(imgPreviewId).style.width = 'auto';

									viewObj.imgRatio = 166 / viewObj.imgObj.height;
								} else if (viewObj.imgObj.width == viewObj.imgObj.height && viewObj.imgObj.height > 166) {
									document.getElementById(imgPreviewId).style.height = '166px';
									document.getElementById(imgPreviewId).style.width = 'auto';

									viewObj.imgRatio = 166 / viewObj.imgObj.height;
								}
								viewObj.jcrop_w = 30;
								viewObj.jcrop_h = !viewObj.ratio ? 30 : 30 / viewObj.ratio;

								// $(divPreviewId).show();
								$('#' + imgPreviewId).Jcrop(
									{
										aspectRatio: ratio,
										onSelect: function (c) {
											viewObj.jcrop_x = c.x;
											viewObj.jcrop_y = c.y;
											viewObj.jcrop_w = c.w;
											viewObj.jcrop_h = c.h;
											viewObj.dom().triggerHandler('ev_img_resize');
										},
										allowSelect: false,
										allowResize: true,
										allowMove: true,
										boundary: 0
									},
									function () {
										viewObj.jcrop_api = this;
										viewObj.jcrop_api.animateTo([0, 0, 30, !ratio ? 30 : 30 / ratio]);
										viewObj.dom().triggerHandler('ev_img_resize');
									}
								);
							}, 100);

							document.getElementById(imgPreviewId).style.display = 'inline-block';
							document.getElementById(imgPreviewId).setAttribute('src', e.target.result);
						};
					} else if (browserVersion.indexOf('SAFARI') > -1) {
						// alert("不支持Safari6.0以下浏览器的图片预览!");
					}
				} else if (browserVersion.indexOf('MSIE') > -1) {
					//ie[7-9]
					fileObj.select();
					if (browserVersion.indexOf('MSIE 9') > -1) {
						fileObj.blur(); //不加上document.selection.createRange().text在ie9会拒绝访问
					}

					var newPreview = document.getElementById(divPreviewId + 'New');

					if (newPreview == null) {
						newPreview = document.createElement('div');
						newPreview.setAttribute('id', divPreviewId + 'New');
						newPreview.style.width = document.getElementById(imgPreviewId).width + 'px';
						newPreview.style.height = document.getElementById(imgPreviewId).height + 'px';
						newPreview.style.border = 'solid 1px #d2e2e2';
					}

					newPreview.style.filter =
						"progid:DXImageTransform.Microsoft.AlphaImageLoader(sizingMethod='scale',src='" + document.selection.createRange().text + "')";

					var tempDivPreview = document.getElementById(divPreviewId);
					tempDivPreview.parentNode.insertBefore(newPreview, tempDivPreview);
					tempDivPreview.style.display = 'none';
				} else if (browserVersion.indexOf('FIREFOX') > -1) {
					//firefox
					var firefoxVersion = parseFloat(browserVersion.toLowerCase().match(/firefox\/([\d.]+)/)[1]);
					if (firefoxVersion < 7) {
						//firefox7以下版本
						document.getElementById(imgPreviewId).setAttribute('src', fileObj.files[0].getAsDataURL());
					} else {
						//firefox7.0+
						document.getElementById(imgPreviewId).setAttribute('src', window.URL.createObjectURL(fileObj.files[0]));
					}
				} else {
					document.getElementById(imgPreviewId).setAttribute('src', fileObj.value);
				}
			} else if (extention.length != 0) {
				// alert("仅支持"+allowExtention+"为后缀名的文件!");
				fileObj.value = ''; //清空选中文件
				if (browserVersion.indexOf('MSIE') > -1) {
					fileObj.select();
					document.selection.clear();
				}
				document.getElementById(imgPreviewId).setAttribute('src', '');
				document.getElementById(imgPreviewId).style.display = 'none';
			}
		},
		drawSltImg: function () {
			var viewObj = this;
			var canvasElem = document.getElementById(viewObj.domId + '-canvas');

			var coord_x = this.jcrop_x / this.imgRatio;
			var coord_y = this.jcrop_y / this.imgRatio;
			var coord_w = this.jcrop_w / this.imgRatio;
			var coord_h = this.jcrop_h / this.imgRatio;

			canvasElem.width = coord_w;
			canvasElem.height = coord_h;

			var cxtMap = canvasElem.getContext('2d');

			coord_w = coord_w > this.imgObj.width ? this.imgObj.width : coord_w;
			coord_h = coord_h > this.imgObj.height ? this.imgObj.height : coord_h;
			cxtMap.drawImage(this.imgObj, coord_x, coord_y, coord_w, coord_h, 0, 0, coord_w, coord_h);
			return canvasElem;
		},
		getImageData: function () {
			var dfd = $.Deferred();
			if (!this.imgObj.src) {
				dfd.resolve(null);
			} else {
				if (!HTMLCanvasElement.prototype.toBlob) {
					Object.defineProperty(HTMLCanvasElement.prototype, 'toBlob', {
						value: function (callback, type, quality) {
							var canvas = this;
							setTimeout(function () {
								var binStr = atob(canvas.toDataURL(type, quality).split(',')[1]);
								var len = binStr.length;
								var arr = new Uint8Array(len);
								for (var i = 0; i < len; i++) {
									arr[i] = binStr.charCodeAt(i);
								}
								callback(new Blob([arr], { type: type || 'image/png' }));
							});
						}
					});
				}

				var ret = {};
				var viewObj = this;
				var canvas = viewObj.drawSltImg();
				ret.base64 = canvas.toDataURL('image/png');
				canvas.toBlob(function (blob) {
					ret.blob = blob;
					dfd.resolve(ret);
				}, 'image/jpeg');
			}
			return dfd.promise();
		},
		resetPreview: function () {
			var container = this.getContainer();
			this.imgObj = new Image();
			container.find('div.jcrop-wrap').hide();
			container.find('div.img-editor-button-wrap').hide();
			//container.find("div.file-wrap-outer").show();
			//container.find("div[widget=toolTip]").show();
		}
	});
})();
