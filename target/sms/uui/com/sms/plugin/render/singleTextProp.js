//@ sourceURL=com.sms.plugin.render.singleTextProp
$.u.define("com.sms.plugin.render.singleTextProp", "com.sms.plugin.render.baseprop", {
    // table段
    table_html: function (data, type,row) { 
    	return data || ""; 
    },
    table_render: function (data, full, cellsel) { this.cellsel = cellsel; },
    // edit段
    edit_html: function (setting) { 
    	return  "<div class='form-group'>"+
    				"<label class='col-sm-2 control-label'>"+setting.name+(setting.required === true ? "<span class='text-danger' style='position:absolute;'>*</span>" : "")+"</label>"+
    				"<div class='col-sm-8 error-container'>"+
    					"<input type='text' maxlength='255' id='"+this._id+"-single-text' class='form-control input-sm' name='"+setting.key+"' value='' />"+
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
    	var htmls = '<td class="name">#{name}</td><td class="value">#{value}</td>';
    	htmls = htmls.replace(/#\{name\}/g, setting.name || "")
    		  	     .replace(/#\{value\}/g, setting.value || "");
    	return htmls; 
    },
    read_render: function (setting, sel) { },
    destroy: function () {
        this._super();
    }
}, { usehtm: false, usei18n: false });
