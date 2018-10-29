//@ sourceURL=com.sms.horizontalMenus
$.u.define('com.sms.horizontalMenus', null, {
    init: function (options) {
    	/*
    	 * {
    	 * 	urlparams:true // 菜单url是否添加当前url参数
    	 * }
    	 */
		this._options=options;
    },
    afterrender: function (bodystr) {
    	
        // 菜单容器
        this.menus = this.qid("menu");
      //id
    	var id = parseInt($.urlParam().id);
        this.resetOptions(id);
    },
    /*
     * 渲染处理配置信息
     */
    resetOptions: function (id) {
    	$.ajax({
        	url: $.u.config.constant.smsqueryserver,
            type:"post",
            dataType: "json",
            cache: false,
            data: {
	        	"tokenid":$.cookie("tokenid"),
	    		"method":"getmenu",
	    		"type":this._options.menuType,
	    		"pid":this._options.menuId,
	    		"unit":id
	        }
        }).done(this.proxy(function(response){
        	if(response.success){
        		this.renderMenus(this.menus, response.data||[]);
        	}
        })).fail(this.proxy(function(jqXHR,errorText,errorThrown){
        	
        }));
    },
    /*
     * 渲染菜单
     */
    renderMenus: function ($container,menus) {
    	var params = "";
        $container.empty();
        if(this._options.urlparams){
        	var href = window.location.href;
        	params = href.substring(href.indexOf("?"), href.length)
        }
        $.each(menus, this.proxy(function (idx, menu) {
           $("<li class='dropdown "+(menu.name==this._options.selected?"open":"")+"'><a href='"+(menu.url+params)+"' class='dropdown-toggle' >" + menu.name + "</a></li").appendTo($container);
        }));
    },
    destroy: function () {
        this._super();
        this.$.remove();
    }
}, { usehtm: true, usei18n: false });

com.sms.horizontalMenus.widgetjs = ["../../uui/widget/jqurl/jqurl.js","../../uui/widget/spin/spin.js"
                                    , "../../uui/widget/jqblockui/jquery.blockUI.js"
                                    , "../../uui/widget/ajax/layoutajax.js"];
com.sms.horizontalMenus.widgetcss = [{ path: '' }];