//@ sourceURL=com.sms.plugin.search.nullProp
$.u.define("com.sms.plugin.search.nullProp", "com.sms.plugin.search.baseprop",{
    // filter段
    filter_html: function () { 
    	return  '<div class="filter-layer">'
			    + '<form style="min-width:250px;" role="form" id="'+this._id+'-form">'
		    	+	'<div class="form-body">'
			    + 		'<div style="padding: 10px; " >'
			    +            '<div class="alert alert-danger" style="margin-bottom: 0px;"><i class="fa  fa-lg message-icon fa-exclamation-circle"></i><span style="padding-left: 10px;">当前字段未定义搜索过滤器</span></div>'
				+		'</div>'
				+ 	'</div>'
				+ '</form>'
				+ '</div>';
    },
    filter_render: function (setting,toolsel) {
        this.filtersel = toolsel;
        this.setting = setting;
        this._filter_bind_commonobj(); 
    },
    filter_getdata: function () {
    	return this.setting;
    },
    filter_setdata:function(){
    	
    },
    destroy:function(){
        this.filtersel.remove();
    	this.afterDestroy();
    	this._super();
    }
}, { usehtm: false, usei18n: false });
