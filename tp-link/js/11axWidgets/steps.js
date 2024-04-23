(function () {
	var Steps = $.su.Widget.register('steps', {
		settings: {
			// fieldItem[]: { name, text, unreachable, withoutNode, notCached, disabled }
			fields: {
				attribute: 'fields',
				defaultValue: null
			},
			// beforeStepEnter/beforeStepLeave: { stepName: (to, from, next) => Promise<string|undefine> }
			// next()，仍跳转至 to
			// next(string)，跳转到对应的步骤
			// 其他 next 参数则不跳转
			beforeStepEnterHooks: {
				attribute: 'beforeStepEnterHooks',
				defaultValue: {}
			},
			beforeStepLeaveHooks: {
				attribute: 'beforeStepLeaveHooks',
				defaultValue: {}
			}
		},

		render: function () {
			var _this = this.dom();
			var settings = this.settings;
			var fields = this.filter(settings.fields);

			_this.addClass('steps-container');

			var innerHTML = '<ul class="steps-ul">';
			innerHTML += this.renderItems(fields);
			innerHTML += '</ul>';
			_this.append(innerHTML);
		},

		renderItems: function (fields) {
			var innerHTML = '';
			this.settings.fields = fields;

			var fieldLen = fields.length;
			for (var i = 0; i < fieldLen; i++) {
				var field = fields[i];

				if (field.withoutNode) {
					continue;
				}

				if (i > 0) {
					innerHTML += '<li class="step-li step-line-wrapper' + field.name + '">';
					innerHTML += '<div class="step-item-line"></div>';
					innerHTML += '</li>';
				}

				var text = typeof field.text === 'string' ? field.text : '';
				innerHTML += '<li class="step-li step-point-wrapper step-item' + field.name + '">';
				innerHTML += '<div class="step-item-text hidden">' + text + '</div>';
				innerHTML += '<div class="step-item-point"></div>';
				innerHTML += '</li>';
			}

			return innerHTML;
		},

		loadItems: function (fields) {
			fields = this.filter(fields);
			var innerHTML = this.renderItems(fields);
			this.dom().find('.steps-ul').empty().append(innerHTML);
		},

		filter: function (items) {
			if (!items || !items.length) {
				return [];
			}

			return items.filter(function (item) {
				return !item.unreachable;
			});
		},

		setValue: function (value) {
			var settings = this.settings;
			var fields = settings.fields;
			if (!fields) {
				return;
			}
			this.value = value;

			var liDom = this.dom().find('.step-item' + value);
			var liTextDom = this.dom().find('.step-item' + value + ' .step-item-text');
			if (liDom.length > 0) {
				this.dom().find('.step-point-wrapper').removeClass('current done undone');
				this.dom().find('.step-item-text').addClass('hidden');
				liDom.prevAll().removeClass('current');
				liDom.prevAll().removeClass('undone');
				liDom.prevAll().addClass('done');
				liDom.nextAll().removeClass('current');
				liDom.nextAll().removeClass('done');
				liDom.nextAll().addClass('undone');
				liDom.removeClass('done');
				liDom.removeClass('undone');
				liDom.addClass('current');
				liTextDom.removeClass('hidden');
			}

			for (var i = 0; i < fields.length; i++) {
				$('div.fieldset-container.' + fields[i].container).hide();
			}

			$('div.fieldset-container.' + value).show();
		},

		getValue: function () {
			return this.value;
		},

		onBeforeStepLeave: function (to, from) {
			var leaveHooks = this.settings.beforeStepLeaveHooks;
			var prevStepLeaveHook = leaveHooks[from];

			var stepDfd = $.Deferred();
			var stepNext = function (stepName) {
				if (stepName === undefined) {
					stepName = to;
				}

				if (typeof stepName === 'string') {
					stepDfd.resolve(stepName);
				} else {
					stepDfd.reject();
				}
			};

			if (!prevStepLeaveHook) {
				stepDfd.resolve(to);
			} else {
				prevStepLeaveHook(to, from, stepNext);
			}

			return stepDfd;
		},

		onBeforeStepEnter: function (to, from) {
			var enterHooks = this.settings.beforeStepEnterHooks;
			var nextStepEnterHook = enterHooks[to];
			var stepDfd = $.Deferred();

			var stepNext = function (stepName) {
				if (stepName === undefined) {
					stepName = to;
				}

				if (typeof stepName === 'string') {
					stepDfd.resolve(stepName);
				} else {
					stepDfd.reject();
				}
			};

			if (!nextStepEnterHook) {
				stepDfd.resolve(to);
			} else {
				nextStepEnterHook(to, from, stepNext);
			}

			return stepDfd.promise();
		},

		handleStepChange: function (to, from) {
			var _self = this;

			_self
				.onBeforeStepLeave(to, from)
				.then(function (nextStep) {
					return _self.onBeforeStepEnter(nextStep, from);
				})
				.then(function (step) {
					_self.goTo(step);
				});
		},

		next: function (n) {
			n = n || 1;

			var settings = this.settings;
			var fields = settings.fields;
			var currentStepName = this.getValue();
			var index = this.findStepIndex(currentStepName);
			var nextIndex = index + n;
			var nextStep = fields[nextIndex];

			while (nextStep && nextStep.disabled) {
				nextIndex += 1;
				nextStep = fields[nextIndex];
			}

			if (nextIndex >= fields.length) {
				return this.dom().triggerHandler('ev_step_done');
			}

			this.handleStepChange(nextStep.name, currentStepName);
		},

		back: function (n) {
			n = n || 1;

			var settings = this.settings;
			var fields = settings.fields;
			var currentStepName = this.getValue();
			var index = this.findStepIndex(currentStepName);
			var prevIndex = index - n;
			var prevStep = fields[prevIndex];

			while (prevStep && (prevStep.notCached || prevStep.disabled)) {
				prevIndex -= 1;
				prevStep = fields[prevIndex];
			}

			if (!prevStep) {
				return;
			}

			this.handleStepChange(prevStep.name, currentStepName);
		},

		goTo: function (step) {
			var currentStep = this.getValue();

			if (!step || step === currentStep) {
				return;
			}

			var fields = this.settings.fields;
			var index = this.findStepIndex(step);

			if (this.isOutOfRange(index)) {
				return;
			}

			if (!fields[index].disabled) {
				this.setValue(step);
				// ev_step_goto: to, from
				this.dom().triggerHandler('ev_step_goto', [step, currentStep]);
			}
		},

		enable: function (steps) {
			var _self = this;

			if (typeof steps === 'string') {
				steps = [steps];
			}

			steps.forEach(function (step) {
				var index = _self.findStepIndex(step);

				if (index >= 0) {
					_self.settings.fields[index].disabled = false;
				}
			});
		},

		disable: function (steps) {
			var _self = this;

			if (typeof steps === 'string') {
				steps = [steps];
			}

			steps.forEach(function (step) {
				var index = _self.findStepIndex(step);

				if (index >= 0) {
					_self.settings.fields[index].disabled = true;
				}
			});
		},

		isOutOfRange: function (index) {
			var range = this.settings.fields.length - 1;

			return index < 0 || index > range;
		},

		findStepIndex: function (step) {
			return this.settings.fields.findIndex(function (field) {
				return field.name === step;
			});
		}
	});
})();
