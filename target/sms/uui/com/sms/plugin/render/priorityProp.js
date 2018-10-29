//@ sourceURL=com.sms.plugin.render.priorityProp
$.u.define("com.sms.plugin.render.priorityProp", "com.sms.plugin.render.baseprop", {
    // table段
    table_html: function (data, type,row) { return data ? '<img src="' + this.getabsurl(data.url) + '" width="16"/>'+data.name : ""; },
    table_render: function (data, full, cellsel) { this.cellsel = cellsel; },
    // edit段
    edit_html: function (setting) { 
    	return "<div class='form-group'>"+
					"<label class='col-sm-2 control-label'>"+setting.name+(setting.required === true ? "<span class='text-danger' style='position:absolute;'>*</span>" : "")+"</label>"+
					"<div class='col-sm-8 error-container'>"+
						"<input type='hidden' id='"+this._id+"-priority' class='select2-field form-control' name='"+setting.key+"'  />"+
						(setting.description ? "<div class='help-block'><small>"+setting.description+"</small></div>" : "")+
					"</div>"+
				"</div>"; 
    },
    edit_render: function (setting, sel) { 
    	this.editSel=sel;
    	this.editSetting=setting;
    	this.$priority=$("#"+this._id+"-priority",this.editSel);
    	
    	this.$priority.select2({
    		width:'100%',
    		//multiple:true,
    		ajax:{
    			url:$.u.config.constant.smsqueryserver,
    			dataType: "json",
    			type: "post",
	            data: function(term, page){
	            	return {
	            		tokenid: $.cookie("isAnonymityLogin") === "false" ? $.cookie("tokenid") : $.cookie("anonymityTokenid"),
	    				method: "stdcomponent.getbysearch",
	    				dataobject: "activityPriority",
	    				rule: JSON.stringify([[{key:"name",op:"like",value:term}]]),
	    				start: (page - 1) * 10,
	    				length: 10
	    			};
	            },
		        results:function(response, page, query){ 
		        	if(response.success){
		        		return {results:response.data.aaData, more:page * 10 < response.data.iTotalRecords};
		        	}else{
		        		$.u.alert.error(response.reason, 1000 * 3);
		        	}
		        }
    		},
	        formatResult: this.proxy(function(item){
	        	return "<img src='" + this.getabsurl(item.url) + "' width='16' height='16'/>&nbsp;"+item.name;
	        }),
	        formatSelection: this.proxy(function(item){
	        	return "<img src='" + this.getabsurl(item.url) + "' width='16' height='16'/>&nbsp;"+item.name;
	        })
    	}).select2("data", setting.value || setting.defaultValue || null);

        // if(setting.defaultValue){
        //     this.$priority.select2("data", setting.defaultValue);
        // }
    },
    edit_getdata: function () {
    	var temp = {},val = this.$priority.select2("val");
    	if(val){
        	temp[this.editSetting.key] = parseInt(val);
    	}
    	return temp;
    },
    edit_disable:function(){
    	this.$priority.select2("enable",false);
    },
    edit_enable:function(){
    	this.$priority.select2("enable",true);
    },
    edit_valid:function(){
    	var result = true;
    	this.editSel.find(".required-message").remove();
    	if(this.editSetting.required === true && !$.trim(this.$priority.select2("val"))){
    		result = false;
    		$("<div class='required-message text-danger'>"+this.editSetting.name+"不能为空</div>").appendTo(this.editSel.find(".error-container"));
    	}
    	return result;
    },
    // read段
    read_html: function (setting) { 
    	var priority = setting.value.priority || {};
    	var htmls = '<td class="name">#{name}</td><td class="value">#{url}#{value}</td>';
		htmls = htmls.replace(/#\{name\}/g,setting.name)
				     .replace(/#\{url\}/g,priority.url ?  '<img src="'+this.getabsurl("../../../../"+priority.url)+'" width="16"/>' : '')
		 	 	     .replace(/#\{value\}/g,priority.name || '');
		return htmls; 
    },
    read_render: function (setting, sel) { },
    destroy: function () {
    	this.$priority.select2("destroy").remove();
        this._super();
    }
}, { usehtm: false, usei18n: false });

com.sms.plugin.render.priorityProp.widgetjs = ['../../../../uui/widget/select2/js/select2.min.js'];
com.sms.plugin.render.priorityProp.widgetcss = [{id:"",path:"../../../../uui/widget/select2/css/select2.css"},
                                                  {id:"",path:"../../../../uui/widget/select2/css/select2-bootstrap.css"}]