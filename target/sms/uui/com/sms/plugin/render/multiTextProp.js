//@ sourceURL=com.sms.plugin.render.multiTextProp
$.u.define("com.sms.plugin.render.multiTextProp", "com.sms.plugin.render.baseprop", {
    // table段
    table_html: function (data, type,row) { return data || ""; },
    table_render: function (data, full, cellsel) { this.cellsel = cellsel; },
    // edit段
    edit_html: function (setting) { 
    	return "<div class='form-group'>"+
					"<label class='col-sm-2 control-label'>" + setting.name + (setting.required === true ? "<span class='text-danger' style='position:absolute;'>*</span>" : "") + "</label>" +
					"<div class='col-sm-8 error-container'>" +
						"<textarea id='" + this._id + "-multi-text' maxlength='2000' class='form-control input-sm mytextarea' name='" + setting.key + "' ></textarea>"+
						(setting.description ? "<div class='help-block'><small>" + setting.description + "</small></div>" : "")+
					"</div>"+
				"</div>"; 
    },
    edit_render: function (setting, sel) {
    	this.editSel = sel;
    	this.editSetting = setting;
    	this.$text = $("#" + this._id + "-multi-text", this.editSel);
    	this.$text.on("blur",this.proxy(this.yanzhengtext));
    	this.$text.val(setting.value || setting.defaultValue || "");
    },
    yanzhengtext:function(){
    	  if(this.$text.val().length >=1990) {
    		  this.$text.val(this.$text.val().substr(0,1990));
    	  }
    },
    edit_getdata: function () {
    	var temp = {};
    	temp[this.editSetting.key] = this.$text.val();
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
    	   var val=setting.value;
		   val=val.replace(/\n/g,'<br>');
		   setting.value=val;
		   
    	var htmls = '<td class="name" style="white-space:pre-wrap;word-wrap: break-word"><pre style="white-space:pre-wrap;font-size:13px;line-height:20px;padding:0px;border:none;background-color:#E7E7E9;white-space:pre-wrap;word-wrap: break-word;">#{name}</pre></td><td class="value"><div><pre style="white-space:pre-wrap;font-size:13px;line-height:20px;font-family:微软雅黑;padding:0px;border:none;background-color:#F4F4F6">#{value}</pre><div></td>';
		htmls = htmls.replace(/#\{name\}/g, setting.name || "")
		 		 	 .replace(/#\{value\}/g, setting.value || "");
		return htmls;
    },
    read_render: function (setting, sel) { },
    destroy: function () {
        this._super();
    }
}, { usehtm: false, usei18n: false });
