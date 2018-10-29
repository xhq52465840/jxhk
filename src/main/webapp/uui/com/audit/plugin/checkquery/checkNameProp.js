//@ sourceURL=com.audit.plugin.checkquery.checkNameProp
$.u.define("com.audit.plugin.checkquery.checkNameProp", "com.sms.plugin.search.baseprop",{
    // filter段
	//检查单名称
	
    table_html: function (data, type, row, meta) {
    	var url = "#";
    	if(row.planType === "SYS"){
    		url = "../../worklist/viewchecklist.html?id=" + row.id;
    	}else if(row.planType === "SUB2"){
    		url = "../../innerAudit/worklist/viewchecklist.html?id=" + row.id;
    	}else if(row.planType === "SUB3"){
    		url = "../../innerAudit/worklist/viewchecklist.html?type=erjineishen&id=" + row.id;
    	}
    	return "<span><a href='" +  this.getabsurl(url) + "' target='_top'>" + (data || "") + "</a></span>"; 

	},
	
    filter_html: function () { 
    	return  '<div class="filter-layer">'
			    + '<form style="min-width:250px;" role="form" id="'+this._id+'-form">'
		    	+	'<div class="form-body">'
			    + 		'<div style="padding: 10px; " >'
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
    	var value = $.trim(this.inputAds.val());
    	if(value){
    		//data.push({"id":"*" + value + "*", "name":value});
    		data.push({"id": isNaN(parseInt(value))?value:parseInt(value), "name":value});
    		this.setting.propshow = "\"*"+value+"*\"";
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
