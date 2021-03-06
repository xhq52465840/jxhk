﻿//@ sourceURL=com.sms.plugin.render.unitsProp
$.u.define("com.sms.plugin.render.unitsProp", "com.sms.plugin.render.baseprop", {
    // table段
    table_html: function (data, type,row) {
    	return  data ? "<img src='"+ data.avatarUrl +"' width='16' height='16''/>&nbsp;"+data.name : ""; 
    },
    table_render: function (data, full, cellsel) { this.cellsel = cellsel; },
    // edit段
    edit_html: function (setting) { 
    	return "<div class='form-group'>"+
					"<label class='col-sm-2 control-label'>"+setting.name+(setting.required === true ? "<span class='text-danger' style='position:absolute;'>*</span>" : "")+"</label>"+
					"<div class='col-sm-8 error-container'>"+
						"<input type='hidden' id='"+this._id+"-unit' class='select2-field select2-field-unit form-control' name='"+setting.key+"' />"+
						(setting.description ? "<div class='help-block'><small>"+setting.description+"</small></div>" : "")+
					"</div>"+
				"</div>"; 
    },
    edit_render: function (setting, sel) { 
    	this.editSel=sel;
    	this.editSetting=setting;
    	this.$selectUnit=$("#"+this._id+"-unit",this.editSel);
    	
    	var tempTerm=null;
    	this.$selectUnit.select2({
    		width:'100%',
    		multiple:true,
    		ajax:{
    			url:$.u.config.constant.smsqueryserver,
    			dataType: "json",
    			type: "post",
	            data:function(term,page){
	            	tempTerm=term;
	            	return {
	            		tokenid:$.cookie("isAnonymityLogin") === "false" ? $.cookie("tokenid") : $.cookie("anonymityTokenid"),
	    				method:"stdcomponent.getbysearch",
	    				dataobject:"unit",
	    				start: (page - 1) * 20,
	    				length: 20,
	    				rule: JSON.stringify([[{"key":"name", "op":"like", "value":term}]])
	    			};
	            },
		        results:function(response,page,query){ 
		        	if(response.success){
		        		return {results:response.data.aaData, more: page * 20 < response.data.iTotalRecords};
		        	}else{
		        		$.u.alert.error(response.reason, 1000 * 3);
		        	}
		        }
    		},
	        formatResult:function(item){
	        	if(!item.id){
	        		return "<strong>"+item.name+"</strong>";
	        	}else{
	        		return "<img src='"+item.avatarUrl+"' width='16' height='16' />&nbsp;"+item.name;
	        	}
	        },
	        formatSelection:function(item){
	        	if(!item.id){
	        		return "<strong>"+item.name+"</strong>";
	        	}else{
	        		return "<img src='"+item.avatarUrl+"' width='16' height='16' />&nbsp;"+item.name;
	        	}
	        }
    	});
    	
    	try{
    		var unit = JSON.parse(setting.defaultValue);
    		if(unit){
    			this.$selectUnit.select2("data",unit);
    		}
    	}catch(e){
    		
    	}
    },
    edit_getdata: function () {
    	var temp = {};
    	temp[this.editSetting.key] = $.map(this.$selectUnit.select2("data"), function(v, idx){ return v && v.id;  });
    	return temp;
    },
    edit_disable:function(){
    	this.$selectUnit.select2("enable",false);
    },
    edit_enable:function(){
    	this.$selectUnit.select2("enable",true);
    },
    edit_valid:function(){
    	var result = true;
    	this.editSel.find(".required-message").remove();
    	if(this.editSetting.required === true && !this.$selectUnit.select2("val")){
    		result = false;
    		$("<div class='required-message text-danger'>"+this.editSetting.name+"不能为空</div>").appendTo(this.editSel.find(".error-container"));
    	}
    	return result;
    },
    // read段
    read_html: function (setting) { return ""; },
    read_render: function (setting, sel) { },
    destroy: function () {
    	this.$selectUnit.select2("destroy").remove();
        this._super();
    },
    
    reloadFields:function(){}
}, { usehtm: false, usei18n: false });

com.sms.plugin.render.unitsProp.widgetjs = ['../../../../uui/widget/select2/js/select2.min.js'];
com.sms.plugin.render.unitsProp.widgetcss = [{id:"",path:"../../../../uui/widget/select2/css/select2.css"},
                                                  {id:"",path:"../../../../uui/widget/select2/css/select2-bootstrap.css"}]