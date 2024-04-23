(function($){
    if (window.console && (typeof console.log === 'function')){
		$.su = $.su || {};
        $.su.debug = {
				log: function(){
					return console.log.apply(console, arguments);
				},
				warn: function(){
					return console.warn.apply(console, arguments);
				},
				error: function(){
					return console.error.apply(console, arguments);
				}
        };
    }else{
		$.su.debug = {
			log: function () {
			},
			warn: function () {
			},
			error: function () {
			}
		};
	}
})(jQuery);