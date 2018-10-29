//@ sourceURL=com.sms.logout
$.u.define('com.sms.logout', null, {
    init: function (options) {
        this._options = options || this._options;
    },
    afterrender: function () {
        //TODO logout server        
    	$.removeCookie("uskyuser", {path:"/"});
        $.removeCookie("tokenid", {path:"/"});
        $.removeCookie("sessionid", {path:"/"});
    	$.removeCookie("userid", {path:"/"});
    	$.removeCookie("username", {path:"/"});
    	$.removeCookie("pwd", {path:"/"});
    	$.cookie('TGC', null,{path:'/', domain:'.juneyaoair.com'});
    	$.removeCookie("TGC", {path:"/"}, {domain:"juneyaoair.com"});
        $(".applicationheader-top-right").addClass("hidden");
         
    },
    destroy: function () {
        return this._super();
    }
}, { usehtm: true, usei18n: true });

com.sms.logout.widgetjs = [];
