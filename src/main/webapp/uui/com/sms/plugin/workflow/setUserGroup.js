//@ sourceURL=com.sms.plugin.workflow.setUserGroup
$.u.define('com.sms.plugin.workflow.setUserGroup', null, {
    init: function (options) {
        this._options = options;
    },
    afterrender: function (bodystr) {
    	this.selectUserGroup=this.qid("select-usergroup");
    	
    	this.selectUserGroup.select2({
    		width:360,
    		ajax:{
    			url: $.u.config.constant.smsqueryserver,
	            dataType: "json",
	            data:function(term,page){
					return {
        				tokenid:$.cookie("tokenid"),
        				method:"stdcomponent.getbysearch",
        				dataobject:"userGroup",
        				rule:JSON.stringify([[{"key":"name","op":"like","value":term}]])
        			};
		        },
		        results:this.proxy(function(response,page,query){ 
		        	if(response.success){
		        		return {results:$.map(response.data.aaData,function(item,idx){
		        			return {"id":item.id,"name":item.name};
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
    	this.selectUserGroup && this.selectUserGroup.select2("data",data);
    	/*this.selectUserGroup && this.selectUserGroup.select2("enable",false);
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
	    			this.selectUserGroup && this.selectUserGroup.select2("data",response.data);
	    		}else{
	    			$.u.alert.error(response.msg);
	    		}
	    	})).fail(this.proxy(function(jqXHR,responseText,responseThrown){
	    		
	    	})).complete(this.proxy(function(jqXHR,responseStatus){
	    		this.selectUserGroup && this.selectUserGroup.select2("enable",true);
	    	}));
    	}*/
    },
    getData:function(){
    	return this.selectUserGroup.select2("data");
    },
    destroy: function () {
    	this.selectUserGroup && this.selectUserGroup.select2("destroy");
        this._super();
    }
}, { usehtm: true, usei18n: true });


com.sms.plugin.workflow.setUserGroup.widgetjs = ['../../../../uui/widget/select2/js/select2.min.js'];
com.sms.plugin.workflow.setUserGroup.widgetcss = [{id:"",path:"../../../../uui/widget/select2/css/select2.css"},{id:"",path:"../../../../uui/widget/select2/css/select2-bootstrap.css"}];