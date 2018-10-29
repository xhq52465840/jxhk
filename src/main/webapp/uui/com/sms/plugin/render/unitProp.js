//@ sourceURL=com.sms.plugin.render.unitProp
$.u.define("com.sms.plugin.render.unitProp", "com.sms.plugin.render.baseprop", {
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
    		//multiple:true,
    		ajax:{
    			url:$.u.config.constant.smsqueryserver,
    			dataType: "json",
    			type: "post",
	            data:function(term,page){
	            	tempTerm = term;
	            	return {
	            		tokenid: $.cookie("isAnonymityLogin") === "false" ? $.cookie("tokenid") : $.cookie("anonymityTokenid"),
	    				method:"getactivitycreatingunit"
	    			};
	            },
		        results:function(response,page,query){ 
		        	if(response.success){
		        		response.data.recentUnits = $.grep(response.data.recentUnits,function(item,idx){
		        			return item.name.indexOf(tempTerm) > -1;
		        		});
		        		response.data.units = $.grep(response.data.units,function(item,idx){
		        			return item.name.indexOf(tempTerm) > -1;
		        		});
		        		var tempData=[{name:"最新安监机构"}];
		        		tempData=tempData.concat(response.data.recentUnits);
		        		tempData.push({name:"所有安监机构"});
		        		tempData=tempData.concat(response.data.units);
		        		return {results:tempData};
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
    	temp[this.editSetting.key]=parseInt(this.$selectUnit.select2("val"));
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

com.sms.plugin.render.unitProp.widgetjs = ['../../../../uui/widget/select2/js/select2.min.js'];
com.sms.plugin.render.unitProp.widgetcss = [{id:"",path:"../../../../uui/widget/select2/css/select2.css"},
                                                  {id:"",path:"../../../../uui/widget/select2/css/select2-bootstrap.css"}]