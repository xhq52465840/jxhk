//@ sourceURL=com.sms.plugin.render.checkboxProp
$.u.define("com.sms.plugin.render.checkboxProp", "com.sms.plugin.render.baseprop", {
    // table段
    table_html: function (data, type,row) { return data || ""; },
    table_render: function (data, full, cellsel) { this.cellsel = cellsel; },
    // edit段
    edit_html: function (setting) { 
    	return  "<div class='form-group'>"+
    				"<label class='col-sm-2 control-label'>"+setting.name+(setting.required === true ? "<span class='text-danger' style='position:absolute;'>*</span>" : "")+"</label>"+
    				"<div class='col-sm-8'>"+
	    				"<div class='checkbox'>"+
	    					"<label><input id='"+this._id+"-checkbox' type='checkbox' class='' name='"+setting.key+"' style='top:8px;'/></label>"+
	    				"</div>"+
    					(setting.description ? "<div class='help-block'><small>"+setting.description+"</small></div>" : "")+
    				"</div>"+
    			"</div>"; 
    },
    edit_render: function (setting, sel) {
    	this.editSel = sel;
    	this.editSetting = setting;
    	this.$checkbox = $("#"+this._id+"-checkbox",this.editSel);
        this.$checkbox.prop("checked", setting.value === "true");
    },
    edit_getdata: function () {
    	var temp = {};
    	temp[this.editSetting.key] = this.$checkbox.is(":checked").toString();
    	return temp;
    },
    edit_disable:function(){
    	this.$checkbox.attr("disabled",true);
    },
    edit_enable:function(){
    	this.$checkbox.attr("disabled",false);
    },
    edit_valid:function(){
    	var result = true;
    	return result;
    },
    // read段
    read_html: function (setting) {
        var htmls = '<td class="name">#{name}</td><td class="value">#{value}</td>';
        htmls = htmls.replace(/#\{name\}/g, setting.name)
                     .replace(/#\{value\}/g, setting.value || "" );
        return htmls;
    },
    read_render: function (setting, sel) { },
    destroy: function () {
        this._super();
    }
}, { usehtm: false, usei18n: false });
