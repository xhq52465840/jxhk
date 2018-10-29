//@ sourceURL=com.sms.plugin.workflow.setUser
$.u.define('com.sms.plugin.workflow.setUser', null, {
    init: function (options) {
        this._options = options;
        this._select2PageLengh = 10;
    },
    afterrender: function (bodystr) {
    	this.selectUser=this.qid("select-user");
    	
    	this.selectUser.select2({
    		width:360,
    		ajax:{
    			url: $.u.config.constant.smsqueryserver,
	            dataType: "json",
	            data: this.proxy(function(term, page){
					return {
        				tokenid:$.cookie("tokenid"),
        				method:"stdcomponent.getbysearch",
        				dataobject:"user",
        				rule:JSON.stringify([[{"key":"username","op":"like","value":term},{"key":"fullname","op":"like","value":term}]]),
        				start: (page - 1) * this._select2PageLengh,
        				length: this._select2PageLengh
        			};
		        }),
		        results:this.proxy(function(response,page,query){ 
		        	if(response.success){
		        		return {results:$.map(response.data.aaData,function(item,idx){
		        			return {"id":item.id,"username":item.username,"fullname":item.fullname};
		        		}), more: (page * this._select2PageLengh) < response.data.iTotalRecords};
		        	}
		        })
	    	},
	    	formatResult:function(item){
	    		return item.username+"("+item.fullname+")";
	    	},
	    	formatSelection:function(item){
	    		return item.username+"("+item.fullname+")";
	    	}
    	});
    	
    	this._options.data && this.fillData(this._options.data);
    },
    fillData:function(data){
    	this.selectUser.select2("data",data);
    	//this.selectUser && this.selectUser.select2("enable",false);
    	/*if(data){
	    	$.u.ajax({
	    		url:$.u.config.constant.smsqueryserver,
	            dataType: "json",
	            data:{
		    		tokenid:$.cookie("tokenid"),
					method:"stdcomponent.getbyid",
					dataobject:"user",
					dataobjectid:data
		    	}
	    	},this.selectUser).done(this.proxy(function(response){
	    		if(response.success){
	    			this.selectUser && this.selectUser.select2("data",response.data);
	    		}else{
	    			$.u.alert.error(response.msg);
	    		}
	    	})).fail(this.proxy(function(jqXHR,responseText,responseThrown){
	    		
	    	})).complete(this.proxy(function(jqXHR,responseStatus){
	    		this.selectUser && this.selectUser.select2("enable",true);
	    	}));
    	}*/
    },
    getData:function(){
    	return this.selectUser.select2("data");
    },
    destroy: function () {
    	this.selectUser && this.selectUser.select2("destroy");
        this._super();
    }
}, { usehtm: true, usei18n: true });


com.sms.plugin.workflow.setUser.widgetjs = ['../../../../uui/widget/jqurl/jqurl.js','../../../../uui/widget/select2/js/select2.min.js'];
com.sms.plugin.workflow.setUser.widgetcss = [{id:"",path:"../../../../uui/widget/select2/css/select2.css"},{id:"",path:"../../../../uui/widget/select2/css/select2-bootstrap.css"}];