//@ sourceURL=com.sms.plugin.render.tagProp
$.u.define("com.sms.plugin.render.tagProp", "com.sms.plugin.render.baseprop", {
    // table段
    table_html: function (data, type,row) { return data || ""; },
    table_render: function (data, full, cellsel) { this.cellsel = cellsel; },
    // edit段
    edit_html: function (setting) { 
    	return "<div class='form-group'>"+
					"<label class='col-sm-2 control-label'>"+setting.name+(setting.required === true ? "<span class='text-danger' style='position:absolute;'>*</span>" : "")+"</label>"+
					"<div class='col-sm-8 error-container'>"+
						"<input type='hidden' maxlength='50' id='"+this._id+"-tag' class='select2-field form-control' name='"+setting.key+"'  />"+
						(setting.description ? "<div class='help-block'><small>"+setting.description+"</small></div>" : "")+
					"</div>"+
				"</div>";
    },
    edit_render: function (setting, sel) { 
    	this.editSel = sel;
    	this.editSetting = setting;
    	this.$selectTag = $("#"+this._id+"-tag",this.editSel);
    	$.u.ajax({
    		url:$.u.config.constant.smsqueryserver,
			dataType: "json",
			async:false,
			data:{
				tokenid: $.cookie("isAnonymityLogin") === "false" ? $.cookie("tokenid") : $.cookie("anonymityTokenid"),
				method:"getlabels"
			}
    	},this.$selectTag).done(this.proxy(function(response){
    		if(response.success){
    			this.$selectTag.select2({
    	    		width:'100%',
                    maximumInputLength: 50,
    		        tags:response.data
    			}).select2("val", setting.value || setting.defaultValue || null);
                this.$selectTag.parent().find(".select2-input").unbind("keypress").keypress(function(e){
                    if(e.which === 32){
                        return false;
                    }
                });
    		}
    	})).fail(this.proxy(function(jqXHR,errorText,errorThrown){
    		$.u.alert.error(errorText);
    	}));
   
    },
    edit_getdata: function () {
    	var temp = {};
    	temp[this.editSetting.key]=this.$selectTag.select2("val").join(" ");
    	return temp;
    },
    edit_disable:function(){
    	this.$selectTag.select2("enable",false);
    },
    edit_enable:function(){
    	this.$selectTag.select2("enable",true);
    },
    edit_valid:function(){
    	var result = true;
    	this.editSel.find(".required-message").remove();
    	if(this.editSetting.required === true && this.$selectTag.length < 1){
    		result = false;
    		$("<div class='required-message text-danger'>"+this.editSetting.name+"不能为空</div>").appendTo(this.editSel.find(".error-container"));
    	}
    	return result;
    },
    // read段
    read_html: function (setting) { 
    	var activity = setting.value;
    	var htmls = '<td class="name">#{name}</td><td class="value">#{value}</td>';
		htmls = htmls.replace(/#\{name\}/g,setting.name)
		 		 	 .replace(/#\{value\}/g,$.map(activity.label,this.proxy(function(label,idx){
		 		 		 return "<span class='label label-success'>"+label+"</span>";
		 		 	 })).join(" "));
		return htmls;
    },
    read_render: function (setting, sel) { },
    destroy: function () {
    	this.$selectTag.select2("destroy").remove();
        this._super();
    }
}, { usehtm: false, usei18n: false });

com.sms.plugin.render.tagProp.widgetjs = ['../../../../uui/widget/select2/js/select2.min.js'];
com.sms.plugin.render.tagProp.widgetcss = [{id:"",path:"../../../../uui/widget/select2/css/select2.css"},
                                                  {id:"",path:"../../../../uui/widget/select2/css/select2-bootstrap.css"}]