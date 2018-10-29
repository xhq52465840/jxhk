//@ sourceURL=com.sms.plugin.search.textProp
$.u.define("com.sms.plugin.search.textProp", "com.sms.plugin.search.baseprop",{
    // filter段
    filter_html: function () { 
    	return  '<div class="filter-layer">'
			    + '<form style="min-width:250px;" role="form" id="'+this._id+'-form">'
		    	+	'<div class="form-body">'
			    + 		'<div style="padding: 10px; " >'
			    +     '<input  class="form-control input sm" maxlength="255" id="'+this._id+'-input">'
				+		'</div>'
				+ 	'</div>'
				+   this._filter_buttons()
				+ '</form>'
				+ '</div>';
    },
    filter_render: function (setting,toolsel) {
        this.filtersel = toolsel;
        this.setting = setting;
        this.inputAds = $("#"+this._id+"-input",this.filtersel).focus();
        this._filter_bind_commonobj();
        this._loadData();
    },
    _loadData:function(){
        var id = "";
    	if(this.setting.propvalue.length>0){
            id = this.setting.propvalue[0].id;
    		this.inputAds.val(id.substr(1, id.length - 2));
    	}
    },
    filter_getdata: function () {
    	var data = [];
    	var value = $.trim(this.inputAds.val());
    	if(value){
    		data.push({"id":"*" + value + "*", "name": value});
    		this.setting.propshow = "\"" + value + "\"";
    	}else{
    		this.setting.propshow = "";
    	}
    	this.setting.propvalue= data;
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
