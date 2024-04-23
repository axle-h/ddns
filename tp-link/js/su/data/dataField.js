/**
 * Created by hwl on 2015/10/22.
 */
(function ($) {
	$.su.DataField = (function () {
		var DataField = function (options) {
			$.su.Observable.call(this);
			var options = $.extend(
				{
					name: '',
					mapping: null,
					defaultValue: null,
					disabled: false,
					readOnly: false,
					autoTrim: false,
					valueType: null,
					valid: true,
					validated: false,
					isDetect: true,
					format: null,
					allowBlank: true,
					blankText: $.su.CHAR.VTYPETEXT.BLANKTEXT,
					vtype: null,
					vtypeText: null,
					validator: null,
					maxLength: -1,
					minLength: -1,
					encrypt: $.su.encrypt
					//                invalidText: 'invalid'
				},
				options
			);

			var me = this;
			this.name = options.name;
			/**
			 * mapping must be a string or an array of string
			 */
			this.mapping = options.mapping || this.name;
			this.defaultValue = options.defaultValue;
			this.convert = options.convert || null;
			this.serialize = options.serialize || null;
			// if (!$.isArray(this.mapping) && typeof this.mapping !== 'string') {
			//	 throw new Error('Error in DataField: mapping must be a string or an array of string');
			// }
			this.valueType = options.valueType;
			this.allowBlank = options.allowBlank;
			this.blankText = options.blankText;
			this.disabled = options.disabled;
			this.valid = options.valid;
			this._realValid = options.valid;
			this.maxLength = options.maxLength;
			this.minLength = options.minLength;
			this.encrypt = options.encrypt;

			/**
			 * vtype can be a string of name, or an object:
			 * vtype:{
			 *   vtype:"number",
			 *   min:1,
			 *   max:65535
			 * },
			 * or an array of these.
			 */
			var i = 0,
				len = 0;

			this.vtype = $.isArray(options.vtype) ? options.vtype : [options.vtype];

			if (options.vtypeText) {
				var tmp = this.vtype[0];
				this.vtype[0] = {
					vtype: tmp,
					vtypeText: options.vtypeText
				};
			}

			if (options.validator) {
				if ($.isFunction(options.validator)) {
					this.validator = options.validator;
				} else {
					throw new Error('Error in DataField: validator must be a function.');
				}
			}

			//			this.invalidText = options.invalidText;

			this._value = this._formatType(options.defaultValue);
			this._valueBackup = this._formatType(options.defaultValue);

			/**
			 *method 'set' is used to set value with original data variable.
			 *if the value is rely on two or more variable, we should define this method like this:
			 *set(obj) { var val_new = obj.a + obj.b; return val_new}
			 */
			if (options.set) {
				this.set = function () {
					var args = Array.prototype.slice.call(arguments, 0, this.mapping.length);
					this.val(options.set.apply(this, args));
					return;
				};
			}
			/**
			 * method 'get' is used to get original data variable form value.
			 * if mapping is an array, 'get' must be an array, too.
			 * if the value is rely on two or more variable, we should define options.get like this:
			 * [func1() {return val1}, func2() {return val2}, func1() {return val3}]
			 *
			 * 16/11/15 KYJ, mapping exit one only
			 */
			if (options.get) {
				if ($.isFunction(options.get)) {
					this.get = function () {
						var result = {};
						result[me.mapping] = options.get.call(me, me._value);
						return result;
					};
				} else {
					throw new Error('Error in DataField: options.get must be a function, if options.get has been defined and mapping is a string.');
				}
			}
		};

		$.su.inherit($.su.Observable, DataField);

		DataField.prototype.getName = function () {
			return this.name;
		};

		/**
		 *get or set the value
		 *value can no be undefined
		 */
		DataField.prototype.val = function (value) {
			if (value !== undefined) {
				if (value !== this._value) {
					this._value = this._formatType(value);
				}
			}
			return this._value;
		};

		DataField.prototype._formatType = function (value) {
			if (value === null || value === undefined || value === '') {
				return value;
			}

			if (this.valueType === 'number') {
				var formattedValue = parseFloat(value, 10);
				if (isNaN(formattedValue) || (formattedValue + '').length !== (value + '').length) {
					return value;
				}
				return parseFloat(value, 10);
			} else if (this.valueType === 'string') {
				return value.toString();
			} else if (this.valueType === 'boolean') {
				if (value === 'true' || (typeof value === 'number' && value > 0) || (typeof value === 'string' && parseInt(value) > 0)) {
					return true;
				} else if (value === 'false' || value === 0 || value === '0') {
					return false;
				} else {
					return value;
				}
			}
			return value;
		};

		DataField.prototype.setValue = function (value) {
			var _value = value;
			if ($.isArray(value) || $.type(value) === 'object') {
				_value = JSON.parse(JSON.stringify(value));
			}
			this._set('_value', {
				oldValue: this.getValue(),
				value: _value
			}); //change name?
		};

		//?
		DataField.prototype.getValue = function () {
			var result = this._value;
			if ($.isArray(this._value) || $.type(result) === 'object') {
				result = JSON.parse(JSON.stringify(this._value));
			}
			return result;
		};

		DataField.prototype.getValid = function () {
			return this.valid;
		};

		DataField.prototype.getBackup = function () {
			var result = this._valueBackup;
			if ($.isArray(result) || $.type(result) === 'object') {
				result = JSON.parse(JSON.stringify(this._value));
			}
			return result;
		};
		DataField.prototype.getData = function () {
			var result = {};
			result[this.mapping] = this._value;
			return result;
		};

		/*record the current value as the backup value.*/
		DataField.prototype.record = function () {
			this._valueBackup = this._value;
			this.trigger('ev_data_record', [
				{
					value: this._value
				},
				this
			]);
			return this;
		};

		DataField.prototype.isDirty = function () {
			return !$.su.valueEqual(this._value, this._valueBackup);
		};

		DataField.prototype.isEnabled = function () {
			return !this.disabled;
		};

		/*reset the value as the backup value.*/
		DataField.prototype.reset = function () {
			this.setValue(this._valueBackup === null ? this.defaultValue : this._valueBackup);
		};

		DataField.prototype.doEncrypt = function (params) {
			var val = this.getValue();
			if ($.isFunction(this.encrypt)) {
				return this.encrypt(val, params);
			}
			return val;
		};

		// DataField.prototype.blankCheck = function(){
		//	 return !((this._value === '') && (this.allowBlank !== true));
		// };

		DataField.prototype.lengthCheck = function () {
			if (typeof this._value == 'string') {
				if (this.minLength != -1 && this._value.length < this.minLength) {
					return false;
				}

				if (this.maxLength != -1 && this._value.length > this.maxLength) {
					return false;
				}
			}
			return true;
		};

		DataField.prototype.setVtype = function (vtypeOption) {
			this.vtype = vtypeOption;
		};

		DataField.prototype.setValidator = function (validator) {
			this.validator = validator;
		};

		DataField.prototype.vtypeCheck = function () {
			var vtype = this.vtype;
			var result = true;

			if (!vtype) {
				return true;
			}
			vtype = $.isArray(vtype) ? vtype : [vtype];
			var vtypeExact = null;
			var VtypeService = $.su.serviceManager.get('vtype');

			for (i = 0, len = vtype.length; i < len; i++) {
				if (vtype[i]) {
					// result = $.su.Vtype.validate(this._value, vtype[i]);
					result = VtypeService.validate(this._value, vtype[i]);
					if (result !== true) {
						vtypeExact = vtype[i];
						this.valid = false;
						break;
					}
				}
			}
			return result;
		};

		DataField.prototype.validatorCheck = function () {
			if (this.validator) {
				return this.validator(this._value);
				// return this.validator.call(this);
			}
			return true;
		};

		DataField.prototype.validate = function () {
			var me = this;
			var value = this._value;

			var i = 0,
				len = 0;

			if (this.disabled) {
				this.setValid(true);
				return true;
			}

			//blank check
			if (
				this._value === '' ||
				this._value === null ||
				this._value === undefined ||
				($.type(this._value) === 'date' && this._value._isBlank === true)
			) {
				if (this.allowBlank !== true) {
					this.setValid(false, this.blankText);
					this._realValid = false;
					return false;
				} else {
					this.setValid(true);
					this._realValid = true;
					return true;
				}
			}

			// if(!this.blankCheck()){
			//	 this.setValid(false, this.blankText);
			//	 return false;
			// }
			if (!this.lengthCheck()) {
				var errText;
				if (this.minLength != -1 && this.maxLength != -1) {
					errText = $.su.CHAR.VTYPETEXT.LEN_MIN_MAX.replace('%min', this.minLength).replace('%max', this.maxLength);
				} else if (this.minLength != -1) {
					errText = $.su.CHAR.VTYPETEXT.LEN_MIN.replace('%min', this.minLength);
				} else {
					errText = $.su.CHAR.VTYPETEXT.LEN_MAX.replace('%max', this.maxLength);
				}
				this.setValid(false, errText);
				this._realValid = false;
				return false;
			}
			var vtypeResult = this.vtypeCheck();
			if (vtypeResult !== true) {
				this.setValid(false, this.vtypeText || vtypeResult);
				this._realValid = false;
				return false;
			}

			var checkValidatorResult = this.validatorCheck();
			if (checkValidatorResult !== true) {
				this.setValid(false, checkValidatorResult);
				this._realValid = false;
				return false;
			}
			this.setValid(true);
			this._realValid = true;
			return true;
		};

		DataField.prototype.disable = function (visually) {
			if (visually) return;
			this._set('disabled', true);
			this.setValid(true);
		};

		DataField.prototype.enable = function () {
			this._set('disabled', false);
			if (this._realValid !== true) {
				// this.validate();
				this.setValid(true); // set normal after enable
			}
		};

		// DataField.prototype.setVisible = function(visible){
		//  this._set("visible", visible);
		// };

		DataField.prototype.setValid = function (valid, msg) {
			this._set('valid', valid || msg);
			// if(valid){
			//  this.setNormal();
			// }else{
			//  this.setError(msg);
			// }
		};

		DataField.prototype._set = function (type, value) {
			if (type === '_value' && value.hasOwnProperty('value')) {
				value.value = this._formatType(value.value);
				this[type] = value.value;
				this.trigger('ev_data_change', [
					{
						type: type,
						value: value
					},
					this
				]);
			} else {
				this[type] = value;
				this.trigger('ev_data_change', [
					{
						type: type,
						value: value
					},
					this
				]);
			}
		};

		return DataField;
	})();
})(jQuery);
