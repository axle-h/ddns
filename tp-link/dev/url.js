(function($){
	$.su = $.su || {};

	var urlMapPath = "./dev/url_to_json/";
	var urlMapFiles = [
		"nat_url_to_json_ljj.txt",
		"url_to_json_cx.txt",
		"url_to_json_szz.txt",
		"url_to_json_ycf.txt",
		"url_to_json_www.txt",
		"url_to_json_yzt.txt"
	];
	var urlMap = {};

	for (var i in urlMapFiles){
		var urlFileName = urlMapFiles[i];
		$.ajax({
			type: "GET",
			url: urlMapPath + urlFileName,
			async: false,
			dataType: "text",
			cache: false,
			success: function(data){
				var items = data.replace(/\#.*$/gm, '').split(/\n+/g);
				for (var j = 0; j < items.length; j++) {
					var item = items[j].replace(/^ +| +$/, '');	//$.trim(items[j])
					if(item.length > 1){
						item = item.split(/\s+/);
						if(item[0]){
							let requestUrl = item[0];
							let responseUrl = './data/' + item[1];
							let operation = item[2] || 'default';
							let urlMapItem = urlMap[requestUrl] || {};
							urlMapItem[operation] = responseUrl;
							urlMap[requestUrl] = urlMapItem;
						}
					}
				}
				$.su.urlMap = urlMap
			},
			error: function(){
			}
		});
	}

	var subs = "/cgi-bin/luci/;stok=";
	var ozkersubs = "/cgi-bin/ozker/;stok=";


	$.su.url = function(url){
		return urlMap[subs + $.su.url.stok + url]
			|| urlMap[subs + $.su.url.anotherStok + url]
			|| urlMap[subs + url]
			|| url;
	};

	$.su.url.stok = "";
	$.su.url.anotherStok = "12345";

	$.su.ozkerurl = function(url){
		return ozkersubs + $.su.url.stok + url;
	};

})(jQuery);