//@ sourceURL=com.sms.system.systemAnalysis_dialog
$.u.define('com.sms.system.systemAnalysis_dialog', null, {
    init: function (options) {
    	
    },
    afterrender: function (bodystr) {
    	this.form=this.qid("form");
    	this.system=this.qid("system");
    	this.unit=this.qid("unit");
    	this.subsystem = this.qid("subsystem");
    	this.primaryWorkflow = this.qid("primaryWorkflow");
    	this.secondaryWorkflow= this.qid("secondaryWorkflow");
    	this.formDialog = this.qid("dialog").dialog({
            title:"配置系统分析",
            width: 600,
            minHeight: 500,
            position: ["center", 150],
            modal: true,
            draggable: false,
            resizable: false,
            autoOpen: false,
            buttons:[
				{
					"text":"确定",
					"class":"audit_ok",
					"click":this.proxy(this.on_ok_click)
				},
                {
                	"text":"取消",
                	"class":"audit_cancel",
                	"click":this.proxy(this.on_cancel_click)
                }
            ],
            create:this.proxy(this.on_formDialog_create),
            open:this.proxy(this.on_formDialog_open),
            close:this.proxy(this.on_formDialog_close)
        });
    },
    on_formDialog_create:function(){
			   this.system.select2({
		           width: '100%',
		           multiple: false,
		           ajax: {
		               url: $.u.config.constant.smsqueryserver,
		               dataType: "json",
		               type: "post",
		               data: this.proxy(function(term, page) {
			            	return {
			            		tokenid: $.cookie("isAnonymityLogin") === "false" ? $.cookie("tokenid") : $.cookie("anonymityTokenid"),
			    				method: "stdcomponent.getbysearch",
			    				dataobject: "dictionary",
			    				rule: JSON.stringify([[{"key":"type","value":"系统分类"}], [{key:"name",op:"like",value:term}]]),
			    				start: (page - 1) * 10,
			    				length: 10
			    			};
			            }),
		               results: this.proxy(function(response, page, query) {
		                   if (response.success) {
		                	   return { 
		                           results: response.data.aaData,
		                       }
		                   } else {
		                       $.u.alert.error(response.reason, 1000 * 3);
		                   }
		               })
		           },
		           formatResult: function(item) {
		               return  item.name;
		           },
		           formatSelection: function(item) {
		               return  item.name;
		           }
		       
		  }),
		 
		  this.unit.select2({
	           width: '100%',
	           multiple: false,
	           ajax: {
	               url: $.u.config.constant.smsqueryserver,
	               dataType: "json",
	               type: "post",
	               data: this.proxy(function(term, page) {
	                   return {
	                       tokenid: $.cookie("tokenid"),
	                       method: "getunits",
	                   };
	               }),
	               results: this.proxy(function(response, page, query) {
	                   if (response.success) {
	                	   return { 
	                           results: response.data,
	                       }
	                   } else {
	                       $.u.alert.error(response.reason, 1000 * 3);
	                   }
	               })
	           },
	           formatResult: function(item) {
	               return  item.name;
	           },
	           formatSelection: function(item) {
	               return  item.name;
	           }
	       
	  });
	/**
	 * @desc 子系统
	 */
	   this.subsystem.select2({
          tag:true,
           width: '100%',
           multiple: false,
           ajax: {
               url: $.u.config.constant.smsqueryserver,
               dataType: "json",
               type: "post",
               data: this.proxy(function(term, page) {
            	   this.term=term;
                   return {
                       tokenid: $.cookie("tokenid"),
                       method: "getSystemAnalysisFactorBySearch",
                       systemId:this.system.select2("val"),
                       unitId:this.unit.select2("val"),
                       factor: "subsystem"
                   };
               }),
               results: this.proxy(function(response, page, query) {
                   if (response.success) {
                	   for(i in response.data){
                		   response.data[i]={id:response.data[i],name:response.data[i]};
                	   }
                	   if(this.term){
                		   var obj={id:this.term,name:this.term};
                		   response.data.reverse();
                    	   response.data.push(obj);
                    	   response.data.reverse();
                	   }
                	   return { 
                           results: response.data,
                       }
                   } else {
                       $.u.alert.error(response.reason, 1000 * 3);
                   }
               })
           },
           formatResult: function(item) {
               return  item.name;
           },
           formatSelection: function(item) {
               return  item.name;
           }
       
	   })
	   /**
	    * 一级流程 
	    */
	    this.primaryWorkflow.select2({
          tag:true,
           width: '100%',
           multiple: false,
           ajax: {
               url: $.u.config.constant.smsqueryserver,
               dataType: "json",
               type: "post",
               data: this.proxy(function(term, page) {
            	   this.term=term;
                   return {
                       tokenid: $.cookie("tokenid"),
                       method: "getSystemAnalysisFactorBySearch",
                       factor: "primaryWorkflow",
                       systemId:this.system.select2("val"),
                       unitId:this.unit.select2("val"),
                       subsystem:this.subsystem.select2("val"),
                       
                   };
               }),
               results: this.proxy(function(response, page, query) {
                   if (response.success) {
                	   for(i in response.data){
                		   response.data[i]={id:response.data[i],name:response.data[i]};
                	   }
                	   if(this.term){
                		   var obj={id:this.term,name:this.term};
                		   response.data.reverse();
                    	   response.data.push(obj);
                    	   response.data.reverse();
                	   }
                	   return { 
                           results: response.data,
                       }
                   } else {
                       $.u.alert.error(response.reason, 1000 * 3);
                   }
               })
           },
           formatResult: function(item) {
               return  item.name;
           },
           formatSelection: function(item) {
               return  item.name;
           }
       
	   })
	   /**
	    * @title 二级流程
	    */
	    this.secondaryWorkflow.select2({
          tag:true,
           width: '100%',
           multiple: false,
           ajax: {
               url: $.u.config.constant.smsqueryserver,
               dataType: "json",
               type: "post",
               data: this.proxy(function(term, page) {
            	   this.term=term;
                   return {
                       tokenid: $.cookie("tokenid"),
                       method: "getSystemAnalysisFactorBySearch",
                       factor: "secondaryWorkflow",
                       systemId:this.system.select2("val"),
                       unitId:this.unit.select2("val"),
                       subsystem:this.subsystem.select2("val"),
                    	   
                   };
               }),
               results: this.proxy(function(response, page, query) {
                   if (response.success) {
                	   for(i in response.data){
                		   response.data[i]={id:response.data[i],name:response.data[i]};
                	   }
                	   if(this.term){
                		   var obj={id:this.term,name:this.term};
                		   response.data.reverse();
                    	   response.data.push(obj);
                    	   response.data.reverse();
                	   }
                	   return { 
                           results: response.data,
                       }
                   } else {
                       $.u.alert.error(response.reason, 1000 * 3);
                   }
               })
           },
           formatResult: function(item) {
               return  item.name;
           },
           formatSelection: function(item) {
               return  item.name;
           }
       
	   })
    },
    open:function(param){
        if(param && param.mode=='edit'){
	        var data=param.data;
	        this.objId=data.id;
	        this.system.select2("data",{id:data.systemId,name:data.system});
	        this.unit.select2("data",{id:data.unitId,name:data.unit});
	        this.subsystem.select2("data",{id:data.subsystem,name:data.subsystem});
	        this.primaryWorkflow.select2("data",{id:data.primaryWorkflow,name:data.primaryWorkflow});
	        this.secondaryWorkflow.select2("data",{id:data.secondaryWorkflow,name:data.secondaryWorkflow});
         };
         this.formDialog.dialog("open");
    },
    /**
     * @title 确定事件
     */
    on_ok_click:function(param){
    	this.form = this.qid("form");
    	if(this.system.select2("val")==""  || this.subsystem.select2("val")=="" || this.unit.select2("val") == " "){
    		$.u.alert.error("请选择必填字段");
    		return false
    	}else if(this.form.valid()){
        	if(this.objId){
        		this.fresh_edit(this.getFormData(),this.objId);
        		this.objId=false;
        	}else{
        		this.fresh(this.getFormData());
        	}
        };
    },
    /**
     * @title 获取数据
     */
    getFormData:function(){
    	if(this.system.select2("val")==""  || this.subsystem.select2("val")=="" || this.unit.select2("val") == " "){
    		$.u.alert.error("请选择必填字段");
    		return false
    	}else{
    		return {
    		    system:Number(this.system.val()),
    		    subsystem:this.subsystem.select2("val"),
    		     unit:Number(this.unit.select2("val")),
    		     primaryWorkflow:this.primaryWorkflow.select2("val"),
    		     secondaryWorkflow:this.secondaryWorkflow.select2("val")
    		    };
    	}
    	
    },
    /**
     * @title 刷新数据，增加提交
     */
    fresh:function(param){
    	var FormData=this.getFormData();
   },
   /**
    * @tilte 编辑提交
    */
	   fresh_edit:function(param){
	   	var FormData=this.getFormData();
	  },
    /**
     * @title  取消事件
     */
    on_cancel_click:function(){
    	this.formDialog.dialog("close");
    },
    refresh: function(data){
    	
    },
    /**
     * @title 清空表单
     */
    on_formDialog_close:function(){
    $(":text,textarea,select",this.form).val("");
    	this.system.select2("data",null);
    	this.subsystem.select2("data",null);
    	this.unit.select2("data",null);
    	this.primaryWorkflow.select2("data",null);
    	this.secondaryWorkflow.select2("data",null);
    }
}, { usehtm: true, usei18n: false });

com.sms.system.systemAnalysis_dialog.widgetjs = ["../../../uui/widget/uploadify/jquery.uploadify.js",
										"../../../uui/widget/select2/js/select2.min.js",
                                        "../../../uui/widget/spin/spin.js", 
                                        "../../../uui/widget/jqblockui/jquery.blockUI.js",
                                        "../../../uui/widget/ajax/layoutajax.js",
                                        "../../../uui/widget/jqztree/js/jquery.ztree.all-3.5.js",
										];
com.sms.system.systemAnalysis_dialog.widgetcss = [
                                       { path: "../../../uui/widget/select2/css/select2.css" }, 
                                       { path: "../../../uui/widget/select2/css/select2-bootstrap.css" },
							            {path:"../../../uui/widget/uploadify/uploadify.css"},
                                        {id:"ztreestyle",
							            path:"../../../uui/widget/jqztree/css/zTreeStyle/zTreeStyle.css"}
										            ];
