//@ sourceURL=com.sms.plugin.workflow.setCustomField
$.u.define('com.sms.plugin.workflow.setCustomField', null, {
    init: function (options) {
        this._options = options;
    },
    afterrender: function (bodystr) {
    	this.selectCustomField=this.qid("select-customfield");
    	
    	this.selectCustomField.select2({
    		width:360,
    		ajax:{
    			url: $.u.config.constant.smsqueryserver,
	            dataType: "json",
	            data:function(term,page){
					return {
        				tokenid:$.cookie("tokenid"),
        				method:"stdcomponent.getbysearch",
        				dataobject:"customField",
        				rule:JSON.stringify([[{"key":"name","op":"like","value":term}]])
        			};
		        },
		        results:this.proxy(function(response,page,query){ 
		        	if(response.success){
		        		return {results:$.map(response.data.aaData,function(item,idx){
		        			return {"id":"customfield_"+item.id,"name":item.name};
		        		})};
		        	}
		        })
	    	},
	    	formatResult:function(item){
	    		return item.name;
	    	},
	    	formatSelection:function(item){
	    		return item.name;
	    	}
    	});
    	
    	this._options.data && this.fillData(this._options.data);
    },
    fillData:function(data){
    	this.selectCustomField.select2("data",data);
    	/*this.selectCustomField && this.selectCustomField.select2("enable",false);
    	if(data){
	    	$.ajax({
	    		url:$.u.config.constant.smsqueryserver,
	            dataType: "json",
	            data:{
		    		tokenid:$.cookie("tokenid"),
					method:"stdcomponent.getbyid",
					dataobject:"user",
					dataobjectid:data
		    	}
	    	}).done(this.proxy(function(response){
	    		if(response.success){
	    			this.selectCustomField && this.selectCustomField.select2("data",response.data);
	    		}else{
	    			$.u.alert.error(response.msg);
	    		}
	    	})).fail(this.proxy(function(jqXHR,responseText,responseThrown){
	    		
	    	})).complete(this.proxy(function(jqXHR,responseStatus){
	    		this.selectCustomField && this.selectCustomField.select2("enable",true);
	    	}));
    	}*/
    },
    getData:function(){
    	return this.selectCustomField.select2("data");
    },
    destroy: function () {
    	this.selectCustomField && this.selectCustomField.select2("destroy");
        this._super();
    }
}, { usehtm: true, usei18n: true });


com.sms.plugin.workflow.setCustomField.widgetjs = ['../../../../uui/widget/select2/js/select2.min.js'];
com.sms.plugin.workflow.setCustomField.widgetcss = [{id:"",path:"../../../../uui/widget/select2/css/select2.css"},{id:"",path:"../../../../uui/widget/select2/css/select2-bootstrap.css"}];