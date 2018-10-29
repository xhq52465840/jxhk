//@ sourceURL=com.sms.plugin.render.activityTypeProp
$.u.define("com.sms.plugin.render.activityTypeProp", "com.sms.plugin.render.baseprop", {
    // table段
    table_html:function (data, type,row) {
    	return data ? "<img src='" + this.getabsurl(data.url) + "' width='16' height='16''/>&nbsp;" + data.name : ""; 
    },
    table_render: function (data, full, cellsel) {
    	this.cellsel = cellsel;
    	return "ha ha";
    },
    // edit段
    edit_html: function (setting) { 
    	return "<div class='form-group'>"+
					"<label class='col-sm-2 control-label'>"+setting.name+(setting.required === true ? "<span class='text-danger' style='position:absolute;'>*</span>" : "")+"</label>"+
					"<div class='col-sm-8'>"+
						"<input type='hidden' id='"+this._id+"-activity-type' class='select2-field select2-field-activity-type form-control' name='"+setting.key+"' style='width:100%' value='' />"+
						(setting.description ? "<div class='help-block'><small>"+setting.description+"</small></div>" : "")+
					"</div>"+
				"</div>"; 
    },
    edit_render: function (setting, sel) {
    	this.editSetting = setting;
    	this.editSel = sel;
    	this.$activityType = $("#"+this._id+"-activity-type",this.editSel);
    	
    	var tempTerm = null, 
    		param = {
				method: "getactivitycreatingtype",
				unit: this.editSetting.unit
	    	};
    	if(this.editSetting.activityId){
    		param = {
    			method: "getactivitytransformtype",
    			activity: this.editSetting.activityId
    		};
    	}
    	this.$activityType.select2({
    		width:'100%',
    		//multiple:true,
    		ajax:{
    			url:$.u.config.constant.smsqueryserver,
    			dataType: "json",
    			type: "post",
	            data:this.proxy(function(term,page){
	            	tempTerm=term;
	            	return $.extend({
	            		tokenid: $.cookie("tokenid"),
	    				rule: JSON.stringify([[{key:"name",op:"like",value:term}]])
	    			},param);
	            }),
		        results:function(response,page,query){ 
		        	if(response.success){
		        		return {results:$.grep(response.data,function(item,idx){
		        			return item.name.indexOf(tempTerm) > -1;
		        		})};
		        	}else{
		        		$.u.alert.error(response.reason, 1000 * 3);
		        	}
		        }
    		},
	        formatResult: this.proxy(function(item){ 
	        	return "<img src='" + this.getabsurl(item.url) + "' width='16' height='16' />&nbsp;" + item.name;
	        }),
	        formatSelection: this.proxy(function(item){ 
	        	return "<img src='" + this.getabsurl(item.url) + "' width='16' height='16' />&nbsp;" + item.name;
	        })
    	});
    	
    	try{
    		var activityType = JSON.parse(this.editSetting.defaultValue);
    		if(activityType){
    			this.$activityType.select2("data",activityType);
    		}
    	}catch(e){
    		
    	}
    },
    edit_getdata: function () {
    	var temp = {};
    	temp[this.editSetting.key]=parseInt(this.$activityType.select2("val"));
    	return temp;
    },
    edit_disable:function(){
    	this.$activityType.select2("enable",false);
    },
    edit_enable:function(){
    	this.$activityType.select2("enable",true);
    },
    edit_valid:function(){
    	var result = true;
    	this.editSel.find(".required-message").remove();
    	if(this.editSetting.required === true && !$.trim(this.$activityType.val())){
    		result = false;
    		$("<div class='required-message text-danger'>"+this.editSetting.name+"不能为空</div>").appendTo(this.editSel.find(".col-sm-8"));
    	}
    	return result;
    },
    // read段
    read_html: function (setting) {
    	var activity = setting.value;
        var htmls = '<td class="name">#{name}</td><td class="value"><img src="#{img}" width="16" height="16"/>&nbsp;#{value}</td>';
    	htmls = htmls.replace(/#\{name\}/g,setting.name)
    				 .replace(/#\{img\}/g,this.getabsurl("../../../../"+activity.type.url))
    		  	     .replace(/#\{value\}/g,activity.type.name);
    	return htmls; 
    },
    read_render: function (setting,sel) { },
    destroy: function () {
    	this.$activityType.select2("destroy").remove();
        this._super();
    },
    
    reloadFields:function(){}
}, { usehtm: false, usei18n: false });

com.sms.plugin.render.activityTypeProp.widgetjs = ['../../../../uui/widget/select2/js/select2.min.js'];
com.sms.plugin.render.activityTypeProp.widgetcss = [{id:"",path:"../../../../uui/widget/select2/css/select2.css"},
                                                  {id:"",path:"../../../../uui/widget/select2/css/select2-bootstrap.css"}]