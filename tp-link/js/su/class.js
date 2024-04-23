/*
 * Class factory of SU, simulate a class system in SU frame, making it easier and lucid to define and use a class.
 * Considering ES6 has support Class, we use some similar name to simulator Class System /
 * rather than the keyword of ES6 such as "class"/"extends", avoiding incompatibility.
 *
 * considering only decided and several 'process' need to de deal,
 * SU use some decided methods to handle the config
 *
 * @author KYJ
 * @change
 *   2018/02/06: create file
 *   this.self -> Class
 *   su.create("className", "") //dynamic loading
 *
 * */
(function ($) {
	$.su.SUClass = (function () {
		/*
		 *  infact a factory of Class, to 'new a Class' seems not realistic, because Function is the base of
		 *  JS's Class Simulation, and Function is not a ordinary Object which is easy to 'new'
		 *
		 * TODO: class name in develop tool is not clear,,,
		 *
		 *  Use Case:
		 *  var classA = new $.su.SUClass({
		 *       name: "classA"
		 *  });
		 *
		 * */
		var SUClass = function (config) {
			var constructorFn;
			if (config && config.hasOwnProperty('constructor')) {
				constructorFn = config.constructor;
			} else if (config && config.extend) {
				var extendOpt = config.extend;
				var parentClassContructor;
				if ($.type(extendOpt) == 'string') {
					parentClassContructor = $.su.ClassManager.getInstance().get(config.extend);
				} else {
					parentClassContructor = config.extend;
				}
				constructorFn = function () {
					parentClassContructor.apply(this, arguments);
				};
			} else {
				constructorFn = generateEmptyConstructor();
			}

			init(constructorFn);
			!!config && applyConfig(constructorFn, config);

			return constructorFn;
		};

		/*
		 * init a SU Class
		 * */
		function init(Class) {
			$.extend(Class, SUClassStaticAddition);
			$.extend(Class.prototype, SUClassProtoAddition);

			Class.prototype.self = Class;
		}

		/*
		 * config a SU class by its construct config
		 * */
		function applyConfig(Class, config, manager) {
			//name
			var name = config.name || $.su.randomId('AnonymousClass');
			Class.setClassName(name);
			delete config.name;

			//extend
			if (config.extend) {
				var parentClass = config.extend;
				if ($.type(parentClass) == 'string') {
					parentClass = $.su.ClassManager.getInstance().get(parentClass);
				}
				Class.inherit(parentClass);
				delete config.extend;
			}

			//singleton
			if (config.singleton) {
				Class.addStatics(singletonStaticAddition);
				delete config.singleton;
			}

			//statics
			if (config.statics) {
				Class.addStatics(config.statics);
				delete config.statics;
			}

			//inheritableStatics
			if (config.inheritableStatics) {
				Class.addInheritableStatics(config.inheritableStatics);
				delete config.inheritableStatics;
			}

			//depsGatherer, need not deal in current SU version.
			if (config.depsGatherer) {
				Class.$depsGatherer = config.depsGatherer; //no use
				delete config.depsGatherer;
			}

			//inheritableDepsGatherer
			if (config.inheritableDepsGatherer) {
				Class.addInheritableDepsGatherers(config.inheritableDepsGatherer);
				delete config.inheritableDepsGatherer;
			}

			//onClassDefined
			if (config.onClassDefined) {
				Class.$onClassDefined = config.onClassDefined;
				delete config.onClassDefined;
			}

			//inheritableOnClassDefined
			if (config.inheritableOnClassDefined) {
				Class.addInheritableOnClassDefined(config.inheritableOnClassDefined);
				delete config.inheritableOnClassDefined;
			}

			Class.addProtoMembers(config);
		}

		function generateEmptyConstructor() {
			return function () {};
		}

		function _addMembers(target, members) {
			for (var name in members) {
				if (members.hasOwnProperty(name)) {
					if (checkReservedWord(name)) {
						// TODO: Class/Static/Proto reserved words check
					}
				}
			}
			$.extend(target, members);
		}

		function _addToArrayNoDifferent(target, members) {
			if ($.type(members) !== 'array') {
				members = [members];
			}
			var i = 0;
			var len = members.length;
			for (; i < len; i++) {
				if ($.inArray(members[i], target) < 0) {
					target.push(members[i]);
				}
			}
		}

		/*
		 * a object maintain attributes and methods a class should have on its self,
		 * to be called by its self.
		 * */
		var SUClassStaticAddition = {
			$className: '',
			$isClass: true,
			$parent: null,

			// Array
			$inheritableStatics: null,

			// Function
			$depsGatherer: null,

			// Array
			$inheritableDepsGatherer: [],

			// Array
			$inheritableOnClassDefined: [],

			/*
			 * inherit another class, only one parent class can be inherited;
			 * @param {Class/Function}: parentClass which will be inherited
			 *
			 * @note: this only declare the extend relation and inherit the parent methods, @method callParent
			 *        need to be called in constructor unless the parent class's constructor is not essential.
			 * */
			inherit: function (parentClass) {
				var childClass = this;
				if (typeof parentClass != 'function' || typeof childClass != 'function') {
					return false;
				}
				var Tmp = function () {};
				Tmp.prototype = parentClass.prototype;
				childClass.prototype = new Tmp();
				childClass.prototype.constructor = childClass;
				childClass.prototype.$parent = parentClass;
				childClass.superclass = parentClass.prototype;

				// $parent
				childClass.$parent = parentClass;

				//inheritableStatics
				var parentStatics = parentClass.$inheritableStatics;
				var childStatics = childClass.$inheritableStatics;
				if (parentStatics) {
					for (var i = 0; i < parentStatics.length; i++) {
						var name = parentStatics[i];
						childClass[name] = $.su.clone(parentStatics[name]);
						if ($.inArray(name, childStatics) < 0) {
							childStatics.push(name);
						}
					}
				}

				//inheritableDepsGatherer
				if (parentClass.$inheritableDepsGatherer) {
					var original = childClass.$inheritableDepsGatherer;
					childClass.$inheritableDepsGatherer = parentClass.$inheritableDepsGatherer.concat(original);
				}

				//inheritableOnClassDefined
				if (parentClass.$inheritableOnClassDefined) {
					var original = childClass.$inheritableOnClassDefined;
					childClass.$inheritableOnClassDefined = parentClass.$inheritableOnClassDefined.concat(original);
				}
			},

			setClassName: function (name) {
				this.$className = name;
			},

			/*
			 * TODO: $previous / $name(function)
			 * */
			addStatics: function (members) {
				_addMembers(this, members);
			},

			addInheritableStatics: function (members) {
				_addMembers(this, members);
				for (var name in members) {
					if (members.hasOwnProperty(name)) {
						this.$inheritableStatics[name] = true;
					}
				}
			},

			addProtoMembers: function (members) {
				_addMembers(this.prototype, members);
			},

			addInheritableDepsGatherers: function (members) {
				_addToArrayNoDifferent(this.$inheritableDepsGatherer, members);
			},

			addInheritableOnClassDefined: function (members) {
				_addToArrayNoDifferent(this.$inheritableOnClassDefined, members);
			},

			create: function () {
				var args = Array.prototype.slice.call(arguments, 0);
				var manager = $.su.ClassManager.getInstance();
				var instantiator = manager.getInstantiator(args.length);
				return instantiator(this, args);
			}
		};

		var singletonStaticAddition = {
			$instance: null,
			getInstance: function (option) {
				if (this.$instance) {
					return this.$instance;
				} else {
					var args = Array.prototype.slice.call(arguments, 0);
					var manager = $.su.ClassManager.getInstance();
					var instantiator = manager.getInstantiator(args.length);
					return (this.$instance = instantiator(this, args));
				}
			},
			create: function (option) {
				return this.getInstance(option);
			}
		};

		/*
		 * a object maintain attributes and methods a class should have on its prototype,
		 * to be called by its instance.
		 * */
		var SUClassProtoAddition = {
			// the Class its self
			self: null,

			// call the method of same name on the parent Class
			callParent: callParent

			// call the method of same name which has been override
			// TODO: LEFT
			// callSuper: null
		};

		/*
		 * call the method of same name on the parent Class
		 * TODO
		 * */
		function callParent() {}

		var RESERVED_WORDS = [];

		function checkReservedWord(name) {
			return false;
		}

		return SUClass;
	})();
})(jQuery);
