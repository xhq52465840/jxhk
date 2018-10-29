//@ sourceURL=com.sms.plugin.render.statusProp
$.u.define("com.sms.plugin.render.statusProp", "com.sms.plugin.render.baseprop", {
    // table段
    table_html: function (data, type,row) {
    	var label=null;
    	if(data){
	    	switch(data.category){
				case "NEW": label="label-primary"; break;
				case "IN_PROGRESS": label="label-warning"; break;
				case "COMPLETE": label="label-success"; break;
				default: label="label-default"; break;
			}
    	}
    	return data ? "<span class='label "+label+"'>"+data.name+"</span>" : ""; 
   },
    table_render: function (data, full, cellsel) { this.cellsel = cellsel; },
    // edit段
    edit_html: function (setting) { 
    	return "<div class='form-group'>"+
					"<label class='col-sm-2 control-label'>"+setting.name+(setting.required === true ? "<span class='text-danger' style='position:absolute;'>*</span>" : "")+"</label>"+
					"<div class='col-sm-8 error-container'>"+
						"<input type='hidden' id='"+this._id+"-status' class='select2-field form-control' name='"+setting.key+"'  />"+
						(setting.description ? "<div class='help-block'><small>"+setting.description+"</small></div>" : "")+
					"</div>"+
				"</div>"; 
    },
    edit_render: function (setting, sel) { 
    	this.editSel=sel;
    	this.editSetting=setting;
    	this.$status=$("#"+this._id+"-status",this.editSel);
    	
    	this.$status.select2({
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
	    				dataobject: "activityStatus",
	    				rule: JSON.stringify([[{key:"name",op:"like",value:term}]]),
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
	        	return item.name;
	        },
	        formatSelection:function(item){
	        	return item.name;
	        }
    	}).select2("data", setting.value || setting.defaultValue || null);


    },
    edit_getdata: function () {
    	var temp = {},val = this.$status.select2("val");
    	if(val){
        	temp[this.editSetting.key]=parseInt(val);
    	}
    	return temp;
    },
    edit_disable:function(){
    	this.$status.select2("enable",false);
    },
    edit_enable:function(){
    	this.$status.select2("enable",true);
    },
    edit_valid:function(){
    	var result = true;
    	this.editSel.find(".required-message").remove();
    	if(this.editSetting.required === true && !$.trim(this.$status.select2("val"))){
    		result = false;
    		$("<div class='required-message text-danger'>"+this.editSetting.name+"不能为空</div>").appendTo(this.editSel.find(".error-container"));
    	}
    	return result;
    },
    // read段
    read_html: function (setting) {
    	var activity = setting.value;
        var htmls = '<td class="name">#{name}</td><td class="value"><span class="label #{color}">#{value}</span>(<a class="diagramview" data-id="#{workflow_id}" href="#">流程</a>)</td>';                    
		htmls = htmls.replace(/#\{name\}/g,setting.name)
					 .replace(/#\{color\}/g,this._getLabel(activity.status ? activity.status.category : ""))
					 .replace(/#\{workflow_id\}/g,activity.workflowId)
			 		 .replace(/#\{value\}/g,activity.status ? activity.status.name : "");
		return htmls; 
    },
    _getLabel:function(cate){
    	var label=null;
    	switch(cate){
			case "NEW":
				label="label-primary";
				break;
			case "IN_PROGRESS":
				label="label-warning";
				break;
			case "COMPLETE":
				label="label-success";
				break;
			default:
				label="label-default";
				break;
		}
    	return label;
    },
    read_render: function (setting, sel) { },
    destroy: function () {
    	this.$status.select2("destroy").remove();
        this._super();
    }
}, { usehtm: false, usei18n: false });

com.sms.plugin.render.statusProp.widgetjs = ['../../../../uui/widget/select2/js/select2.min.js'];
com.sms.plugin.render.statusProp.widgetcss = [{id:"",path:"../../../../uui/widget/select2/css/select2.css"},
                                                  {id:"",path:"../../../../uui/widget/select2/css/select2-bootstrap.css"}]