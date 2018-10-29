//@ sourceURL=com.audit.plugin.checklist.auditTextProp
$.u.define("com.audit.plugin.checklist.auditTextProp", "com.sms.plugin.search.baseprop",{
    // filter段
    filter_html: function () { 
    	return  '<div class="filter-layer">'
			    + '<form style="min-width:250px;" role="form" id="'+this._id+'-form">'
		    	+	'<div class="form-body">'
			    + 		'<div style="padding: 10px; height:270px;" >'
			    +     '<input  class="form-control input sm" id="'+this._id+'-input">'
				+		'</div>'
				+ 	'</div>'
				+   this._filter_buttons()
				+ '</form>'
				+ '</div>';
    },
    filter_render: function (setting,toolsel) {
        this.filtersel = toolsel;
        this.setting = setting;
        this.inputAds=$("#"+this._id+"-input",this.filtersel).focus();
        this._filter_bind_commonobj();
        this._loadData();
    },
    _loadData:function(){
    	if(this.setting.propvalue.length>0){
    		this.inputAds.val(this.setting.propvalue[0].name);
    	}
    },
    filter_getdata: function () {
    	var data = [];
    	var value = $.trim(this.inputAds.val()) || "";
    	if(value){
    		//data.push({"id":"*" + value + "*", "name":value});
    		data.push({"id": isNaN(parseInt(value))?value:parseInt(value), "name":value});
    		this.setting.propshow = "\"*"+value+"*\"";
    	}
    	this.setting.propvalue= data;
    	if(value){
    		this.setting.propshow = "\"*"+value+"*\"";
    	}else{
    		this.setting.propshow = "";
    	}
    	
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
