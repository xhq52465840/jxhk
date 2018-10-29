(function ($) {
    /**
    * absurl：请求的路径
    * splitter : 分隔符，默认是?
    */
    $.urlParam = function (absurl, splitter) {
        var url ;
        if (absurl)
            url = absurl;
        else
            url = location.search + location.hash; //获取url中"?"符后的字串
        var theRequest = {};
        if (!splitter)
            splitter = "?";
        var xidx = url.indexOf(splitter);
        if (xidx != -1) {
            var str = url.substr(xidx + 1);
            strs = str.split("&");
            for (var i = 0; i < strs.length; i++) {
                theRequest[strs[i].split("=")[0]] = unescape(strs[i].substring(strs[i].indexOf("=") + 1, strs[i].length));
            }
        }
        return theRequest;
    }

    /**
    * absurl：请求的路径
    * kvpairobj : kv参数对象，例如{"abc":"def", "ttt":"222"}
    */
    $.urlBuilder = function (absurl, kvpairobj) {
        var url = absurl;
        if (url && url != "") {
            var params = "";
            if ($.isPlainObject(kvpairobj)) {
                for (var itm in kvpairobj) {
                    params += itm + "=" + kvpairobj[itm] + "&";
                }
            }
            if (params != "") {
                params = params.substr(0, params.length - 1);
            }
            if (params != null) {
                if (url.indexOf("?") == -1) {
                    // 无参数
                    url += "?";
                }
                else {
                    url += "&";
                }
                url += params;
            }
        }
        return url;
    }
})(jQuery);