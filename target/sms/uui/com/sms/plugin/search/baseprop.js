//@ sourceURL=com.sms.plugin.search.baseprop
/**
* 使用
* var inputRenderClazz = $.u.load("com.sms.plugin.inputprop")
* var inputRenderObj = new inputRenderClazz(options);
* var result = inputRenderObj.get("table", "html")(data , sel);
*
*/
$.u.define('com.sms.plugin.search.baseprop', null, {
    init: function (options) {
        this._options = options;
    },
    get: function (type, method) {
    	if (type == "table" || type == "filter" || type == "edit" || type == "read") {
            Args = Array.prototype.slice.call(arguments, 2);
            return this[type + "_" + method].apply(this, Args);
        }
        else {
            throw Exception("无此方法" + type + "_" + method);
        }
    },
    // filter段
    filter_html: function () { return "" },
    /**
     * @title 返回工具组件Html
     */
    _filter_buttons:function(){
    	return "<div class='buttons-container' ><button class='btn btn-default btn-sm search-prop-update' id='"+this._id+"-button-update'>更新</button><button class='btn btn-link search-prop-close' id='"+this._id+"-button-close'>关闭</button></div>";
    },
    /**
     * @title 绑定公共按钮事件
     */
    _filter_bind_commonobj:function(){
    	$("#"+this._id+"-button-update", this.filtersel).click(this.proxy(function(e){ 
    		e.preventDefault(); 
    		if(!this.filter_valid || this.filter_valid()){
	    		this.update( this.filter_getdata() );
	    		$("body").unbind("mousedown");
	    		this.destroy();
    		}
    	}));
    	$("#"+this._id+"-button-close", this.filtersel).click(this.proxy(function(e){
    		e.preventDefault();
    		this.destroy();
    	}));
    	$("body").unbind("mousedown").bind("mousedown",this.proxy(function(e){
			var $this = $(e.target), inFilterInner = $this.parents(".filter-layer").length > 0;
			if( $this.hasClass("search-prop-close") && inFilterInner ){
				$("body").unbind("mousedown");
			}else if( !$this.hasClass("filter-layer") && !inFilterInner ){
				$("body").unbind("mousedown");
				this.destroy();
			}
		}));
    },
    filter_render: function (toolsel) { },
    filter_getdata: function () { return null; },
    filter_valid: function(){ return true;},
    destroy: function () {
        this._super();
    }
}, { usehtm: false, usei18n: false });
