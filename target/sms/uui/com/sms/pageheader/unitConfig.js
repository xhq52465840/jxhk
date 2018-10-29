//@ sourceURL=com.sms.pageheader.unitConfig
$.u.define('com.sms.pageheader.unitConfig', null, {
    init: function (options) {
        this._options = options || {};
        this.unit_id = $.urlParam().id;
        this.unit_id = this.unit_id ? parseInt(this.unit_id) : null;
    },
    afterrender: function (bodystr) {
    	this.i18n = com.sms.pageheader.unitConfig.i18n;
    	this.unitDialogEdit = null;
    	this.editUnit = this.qid("editUnit");
    	this.category = this.qid("unit-config-details-unit-category");
    	
    	if(this._options.show){
    		this.editUnit.show();
    	}else{
    		this.editUnit.remove();
    	}
    	
    	if(this.unit_id){
    		this.loadUnitInfo(this.unit_id);
    	}
    	
//    	this.category.click(this.proxy(function(e){    	
//    		e.preventDefault();
//        	try{
//        		var data = JSON.parse($(e.currentTarget).attr("data"));
//        		this.categoryEdit && this.categoryEdit.destroy();
//        		$.u.load("com.sms.common.stdComponentOperate");
//            	this.categoryEdit = new com.sms.common.stdComponentOperate({
//            		"dataobject":"unit",
//            		"fields":[
//        	          {name:"category",label:this.i18n.safeagencyType,dataType:"int",type:"select",message:this.i18n.safeagencyTypeNotNull,
//	        	          option:{
//	    	        		  "params":{dataobject:"unitCategory"},
//	    	        		  "ajax":{
//	    	        			  data:function(term,page){
//	    	        				 return {
//	    	        					 method:"stdcomponent.getbysearch",
//	    	        					 dataobject:"unitCategory",
//	    	        					 tokenid:$.cookie("tokenid"),
//	    	        					 rule:JSON.stringify([[{"key":"name","op":"like","value":term}]])
//	    	        				 };
//	    	        			 }
//	    	        		  }
//	    	        	 }
//        	          }
//        	        ]
//            	});
//            	this.categoryEdit.target($("div[umid='categoryEdit']",this.$));
//            	this.categoryEdit.open({"data":data,"title":this.i18n.choosesafeagencyType+data.name});
//            	this.categoryEdit.override({
//            		refreshDataTable:this.proxy(function(){
//            			this.loadUnitInfo(this.unit_id);
//            		})
//            	});
//        	}catch(e){
//        		throw new Error(this.i18n.editTypeFail+e.message);
//        	}
//    	}));
    	
    	this.editUnit.click(this.proxy(function(e){
    		e.preventDefault();
        	try{
        		var data = JSON.parse($(e.currentTarget).attr("data"));
        		if(this.unitDialogEdit === null){
	        		$.u.load("com.sms.unit.unitDialogEdit");
	            	this.unitDialogEdit = new com.sms.unit.unitDialogEdit($("div[umid='unitDialogEdit']",this.$),{
	            		"title":this.i18n.editsreface,
	            		"dataobject":"unit"
	            	});            	
	            	this.unitDialogEdit.override({
	            		refreshDataTable:this.proxy(function(){
	            			this.loadUnitInfo(this.unit_id);
	            		})
	            	});
        		}
        		this.unitDialogEdit.open({"data":data,"title":this.i18n.safeagency+"："+data.name});
        	}catch(e){
        		throw new Error(this.i18n.editfail+e.message);
        	}
    	}));
    },
    /**
     * @title 加载机构信息
     * @param unit_id 机构id
     */
    loadUnitInfo:function(unit_id){
    	$.u.ajax({
			url: $.u.config.constant.smsqueryserver,
			type:"post",
            dataType: "json",
            data:{
				tokenid:$.cookie("tokenid"),
				method:"stdcomponent.getbyid",
				dataobject:"unit",
				dataobjectid:unit_id
	        }
		},this.category.parents("ul")).done(this.proxy(function(response){
			if(response.success){
				this.qid("unit-avatar").attr("src",response.data.avatarUrl);
				this.qid("unit-config-header-name").text(response.data.name);
				this.qid("unit-config-details-unit-code").text(response.data.code);
				this.qid("unit-config-details-unit-rsp-user").text(response.data.responsibleUserDisplayName);
				this.editUnit.attr({"data":JSON.stringify(response.data)});
				this.qid("unit-config-details-unit-category").attr({"data":JSON.stringify(response.data)}).text(response.data.categoryDisplayName?response.data.categoryDisplayName:"none");
			}
		})).fail(this.proxy(function(jqXHR,errorText,errorThrown){
			
		})).complete(this.proxy(function(jqXHR,errorStatus){
			
		}));
    },
    destroy: function () {
        this._super();
    }
}, { usehtm: true, usei18n: true });

com.sms.pageheader.unitConfig.widgetjs = ['../../../uui/widget/jqurl/jqurl.js',"../../../uui/widget/spin/spin.js"
                                          , "../../../uui/widget/jqblockui/jquery.blockUI.js"
                                          , "../../../uui/widget/ajax/layoutajax.js"];
com.sms.pageheader.unitConfig.widgetcss = [{ path: '' }];