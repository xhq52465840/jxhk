//@ sourceURL=com.sms.plugin.render.selectUserProp
$.u.define("com.sms.plugin.render.selectUserProp", "com.sms.plugin.render.baseprop", {
    // table段
    table_html: function (data, type,row) {
    	return '<span>' + (data ? data.fullname : "") + '</span>'; 
    },
    table_render: function (data, full, cellsel) { this.cellsel = cellsel; },
    // edit段
    edit_html: function (setting) { 
    	return "<div class='form-group'>"+
					"<label class='col-sm-2 control-label'>"+setting.name+(setting.required === true ? "<span class='text-danger' style='position:absolute;'>*</span>" : "")+"</label>"+
					"<div class='col-sm-8 error-container'>"+
						"<input type='hidden' id='"+this._id+"-select-user' class='select2-field form-control' name='"+setting.key+"' />"+
						(setting.description ? "<div class='help-block'><small>"+setting.description+"</small></div>" : "")+
					"</div>"+
				"</div>"; 
    },
    edit_render: function (setting, sel) { 
    	this.editSel=sel;
    	this.editSetting=setting;
    	this.$selectUser=$("#"+this._id+"-select-user",this.editSel);
    	
    	this.$selectUser.select2({
    		width:'100%',
    		//multiple:true,
    		ajax:{
    			url:$.u.config.constant.smsqueryserver,
    			dataType: "json",
    			type: "post",
	            data:function(term, page){
	            	return {
	            		tokenid: $.cookie("isAnonymityLogin") === "false" ? $.cookie("tokenid") : $.cookie("anonymityTokenid"),
	    				method: "stdcomponent.getbysearch",
	    				dataobject: "user",
	    				search: JSON.stringify({"value":term}),
	    				start: (page - 1) * 10,
	    				length: 10
	    			};
	            },
		        results:function(response,page,query){ 
		        	if(response.success){
		        		return {results:response.data.aaData, more:page * 10 < response.data.iTotalRecords};
		        	}else{
		        		$.u.alert.error(response.reason, 1000 * 3);
		        	}
		        }
    		},
	        formatResult:function(item){
	        	return "<img src='"+item.avatarUrl+"' width='16' height='16'/>&nbsp;"+item.fullname+"-"+item.username;
	        },
	        formatSelection:function(item){
	        	return "<img src='"+item.avatarUrl+"' width='16' height='16'/>&nbsp;"+item.fullname;
	        }
    	}).select2("data", setting.value || setting.defaultValue || null);
    },
    edit_getdata: function () {
    	var temp = {},val=this.$selectUser.select2("val");
    	if(val){
    		temp[this.editSetting.key]=parseInt(val);
    	}	
    	return temp;
    },
    edit_disable:function(){
    	this.$selectUser.select2("enable",false);
    },
    edit_enable:function(){
    	this.$selectUser.select2("enable",true);
    },
    edit_valid:function(){
    	var result = true;
    	this.editSel.find(".required-message").remove();
    	if(this.editSetting.required === true && !$.trim(this.$selectUser.select2("val"))){
    		result = false;
    		$("<div class='required-message text-danger'>"+this.editSetting.name+"不能为空</div>").appendTo(this.editSel.find(".error-container"));
    	}
    	return result;
    },
    // read段
    read_html: function (setting) {
    	var htmls = '<td class="name">#{name}</td><td class="value">#{value}</td>';
		htmls = htmls.replace(/#\{name\}/g,setting.name)
		  	     .replace(/#\{value\}/g,setting.value);
		return htmls; 
    },
    read_render: function (setting, sel) { },
    destroy: function () {
    	this.$selectUser.select2("destroy").remove();
        this._super();
    }
}, { usehtm: false, usei18n: false });

com.sms.plugin.render.selectUserProp.widgetjs = ['../../../../uui/widget/select2/js/select2.min.js'];
com.sms.plugin.render.selectUserProp.widgetcss = [{id:"",path:"../../../../uui/widget/select2/css/select2.css"},
                                                  {id:"",path:"../../../../uui/widget/select2/css/select2-bootstrap.css"}]