//@ sourceURL=com.audit.secondaryquery.reportquery.queryNameProp
$.u.define("com.audit.secondaryquery.reportquery.queryNameProp", "com.sms.plugin.search.baseprop", {
    // table段
	//copy form com.sms.plugin.render.summaryProp
	//工作单名称
    table_html: function (data, type,row) { 
    	return "<span><a href='" + this.getabsurl("../../innerAudit/xitong_jihua/AuditReport.html?id=" + row.id+"&type=") + "' target='_top'>" + (data || "") + "</a></span>"; 
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
    		this.inputAds.val(this.setting.propvalue[0].id);
    	}
    },
    filter_getdata: function () {
    	var data = [];
    	var value = $.trim(this.inputAds.val());
    	if(value){
    		//data.push({"id":"*" + value + "*", "name":value});
    		data.push({"id": value, "name":value});
    		this.setting.propshow = "\"*"+value+"*\"";
    	}else{
    		this.setting.propshow = "";
    	}
    	this.setting.propvalue= data;
    	return this.setting;
    },
    
    table_render: function (data, full, cellsel) { this.cellsel = cellsel; },
    // edit段
    edit_html: function (setting) { 
    	return  "<div class='form-group'>"+
    				"<label class='col-sm-2 control-label'>"+setting.name+(setting.required === true ? "<span class='text-danger' style='position:absolute;'>*</span>" : "")+"</label>"+
    				"<div class='col-sm-8 error-container'>"+
    					"<input type='text' id='"+this._id+"-single-text' class='form-control input-sm' name='"+setting.key+"'  />"+
    					(setting.description ? "<div class='help-block'><small>"+setting.description+"</small></div>" : "")+
    				"</div>"+
    			"</div>"; 
    },
    edit_render: function (setting, sel) { 
    	this.editSel = sel;
    	this.editSetting = setting;
    	this.$text = $("#"+this._id+"-single-text",this.editSel);
    	this.$text.val(setting.value || setting.defaultValue || "");
    },
    edit_getdata: function () {
    	var temp = {};
    	temp[this.editSetting.key]=this.$text.val();
    	return temp;
    },
    edit_disable:function(){
    	this.$text.attr("disabled",true);
    },
    edit_enable:function(){
    	this.$text.attr("disabled",false);
    },
    edit_valid:function(){
    	var result = true;
    	this.editSel.find(".required-message").remove();
    	if(this.editSetting.required === true && !$.trim(this.$text.val())){
    		result = false;
    		$("<div class='required-message text-danger'>"+this.editSetting.name+"不能为空</div>").appendTo(this.editSel.find(".error-container"));
    	}
    	return result;
    },
    // read段
    read_html: function (setting) {
    	return "";
    },
    read_render: function (setting, sel) { },
    destroy: function () {
    	this.filtersel.remove();
    	this.afterDestroy();
        this._super();
    }
}, { usehtm: false, usei18n: false });
