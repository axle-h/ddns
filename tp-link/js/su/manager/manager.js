(function ($) {
	$.su.Manager = (function () {
		var Manager = function () {
			if (typeof this.constructor.instance === 'object') {
				return this.constructor.instance;
			}

			$.su.Observable.call(this);

			this.constructor.instance = this;

			this._map = {};
			this._infoMap = {};
			this.type = null;

			// var constructor = (typeof type === "string") ? $.su[type] : type;
			// if(typeof constructor === "function"){
			//     this.type = constructor;
			// }
		};
		$.su.inherit($.su.Observable, Manager);

		Manager.prototype.define = function (name, options, factory) {
			if (this._infoMap[name]) {
				$.su.debug.error('Duplicated definition "' + name + '"');
				return;
			}
			this._infoMap[name] = {};
			if (!factory) {
				this._infoMap[name].constructor = this.type;
			} else {
				this._infoMap[name].constructor = (function (constructor, factory) {
					return function (options) {
						constructor.call(this, options);
						!!factory && $.extend(this, factory.call(this));
					};
				})(this.type, factory);
			}
			this._infoMap[name].options = options;
		};

		Manager.prototype.init = function (name) {
			if (!this._infoMap[name]) {
				return;
			}
			this._map[name] = new this._infoMap[name].constructor(this._infoMap[name].options);
		};

		Manager.prototype.get = function (name) {
			return this._map[name];
		};
		Manager.prototype.destroy = function (name) {
			delete this._map[name];
		};

		return Manager;
	})();

	// $.su.define("Manager", {
	//     extend: "Observable",
	//     constructor: function(){
	//         this.callParent(arguments);
	//         // $.su.Observable.call(this);
	//         this._map = {};
	//         this._infoMap = {};
	//         this.type = null;
	//     },
	//     define: function(name, options, factory){
	//         this._infoMap[name] = {};
	//         if(!factory){
	//             this._infoMap[name].constructor = this.type;
	//         }else{
	//             this._infoMap[name].constructor = function(constructor, factory){
	//                 return function(options){
	//                     constructor.call(this, options);
	//                     !!factory && $.extend(this, factory.call(this));
	//                 };
	//             }(this.type, factory);
	//         }
	//         this._infoMap[name].options = options;
	//     },
	//
	//     init: function(name){
	//         if(!this._infoMap[name]){
	//             return;
	//         }
	//         this._map[name] = new this._infoMap[name].constructor(this._infoMap[name].options);
	//     },
	//
	//
	//     get: function(name){
	//         return this._map[name];
	//     },
	//     destroy: function(name){
	//         delete this._map[name];
	//     }
	// });
	//
	//
	// $.su.Manager = $.su.ClassManager.get("Manager");
})(jQuery);
