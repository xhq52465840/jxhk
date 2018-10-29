//@ sourceURL=com.audit.plugin.checklist.auditWeightProp
$.u.define("com.audit.plugin.checklist.auditWeightProp", "com.sms.plugin.search.baseprop",{
    // filter段
	//
	 table_html: function (data, type, row, meta) {
		 return data
	 },
    filter_html: function () { 
    	return  '<div class="filter-layer">'
			    + '<form style="min-width:250px; height:270px;" role="form" id="'+this._id+'-form">'
		    	+	'<div class="form-body">'
			    + 		'<div style="padding: 10px; " >'
			    +     '<select  class="form-control " id="'+this._id+'-select">'
			    +     '<option value="1">1</option>'
			    +     '<option value="2">2</option>'
			    +     '<option value="3">3</option>'
			    +      '</select>' 
				+		'</div>'
				+ 	'</div>'
				+   this._filter_buttons()
				+ '</form>'
				+ '</div>';
    },
    filter_render: function (setting,toolsel) {
        this.filtersel = toolsel;
        this.setting = setting;
        this.inputAds=$("#"+this._id+"-select",this.filtersel).focus();
        this._filter_bind_commonobj();
        this._loadData();
    },
    _loadData:function(){
    	if(this.setting.propvalue.length>0){
    		this.inputAds.val(this.setting.propvalue[0].id);
    	}
    },
    filter_getdata: function () {
    	var data = [];
    	var value = $.trim(this.inputAds.val());
    	if(value){
    		//data.push({"id":"*" + value + "*", "name":value});
    		data.push({"id": isNaN(parseInt(value))?value:parseInt(value), "name":value});
    		this.setting.propshow = "\"*"+value+"*\"";
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
