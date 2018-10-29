//@ sourceURL=com.sms.detailmodule.systemwork.workAnalysis
$.u.define('com.sms.detailmodule.systemwork.workAnalysis', null, {
    init: function (option) {
    	this._options = option || {}; 
    	this.worklistTab = "<tr itemid='#{itemid}'>"
							+	"<td style='width: 15%;'>#{system}</td>"
							+	"<td style='width: 15%;'>#{department}</td>"
							+	"<td style='width: 15%;'>#{downsystem}</td>"
							+	"<td style='width: 15%;'>#{oneFlow}</td>"
							+	"<td style='width: 15%;'>#{twoFlow}</td>"
							+	"<td style='width: 15%;'>#{threeFlow}</td>"
							+	"<td class='operate-tool' style='width: 10%;'><i class='fa fa-pencil fa-lg edit-tem edit-analysis ' mode='edit' data-data='#{analysisdata}' style='cursor: pointer; float:left;margin-left:15px;margin-top:2px'></i><span class='glyphicon glyphicon glyphicon-trash fl-minus del-analysis' data-data='#{analysisdata}' style='cursor: pointer;'></span></td>"
							+"</tr>";
    },
    afterrender: function (bodystr) {
        this.systemData="";
        this.unitData = "";
    	this.add_analysis = this.qid("add_analysis");
    	this.workList = this.qid("workList");
    	this.add_analysis.on("click",this.proxy(this.addAnalysis));
    	this.system = this.qid("system");
    	this.department = this.qid("department");
    	this.downsystem = this.qid("downsystem");
    	this.oneFlow = this.qid("oneFLow");
    	this.twoFlow =  this.qid("twoFLow");
    	this.threeFlow = this.qid("threeFLow");
    	this.workList.on("click",".edit-analysis",this.proxy(this.editsystem));
    	this.workList.on("click",".del-analysis",this.proxy(this._del_file));
    	this._options.systemAnalysisMappings && this.refresh_int(this._options.systemAnalysisMappings);
    	/**
    	 *@title 系统查询
    	 */ 
    	 $.u.ajax({
  			url : $.u.config.constant.smsqueryserver,
  			type:"post",
  			async:false,
              dataType: "json",
              data: {
             	"tokenid":$.cookie("tokenid"),
             	 method: "getSystemAnalysisFactorBySearch",
                 factor: "system",
              }
      	}).done(this.proxy(function(response){
      		   if(response.success){
      			   $.each(response.data,function(index,item){
      				   item.text=item.name;
      			   })
      			  this.systemData=response.data; 
      		   }
      	}));
    	 
    	
    	this.system.select2({
    		data:this.systemData
    	}).on("select2-selecting",this.proxy(function(){
	    	this.department.select2("data",null);
	    	this.downsystem.select2("data",null);
	    	this.oneFlow.select2("data",null);
	    	this.twoFlow.select2("data",null);
	    	this.threeFlow.val("");
	    	
	  })).on("select2-close",this.proxy(function(){
		  if(this.system.select2("val")){
			  this.proxy(this.systemID());  
		  }
	  })),
	 
		/**
		* @desc 子系统
		*/
		 this.downsystem.select2({
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
	                       unitId:this.department.select2("val"),
	                       factor: "subsystem",
	                       subsystem:term
	                   };
	               }),
	               results: this.proxy(function(response, page, query) {
	                   if (response.success) {
	                	   for(i in response.data){
	                		   response.data[i]={id:response.data[i],name:response.data[i]};
	                	   }
	                	   /*if(this.term){
	                		   var obj={id:this.term,name:this.term};
	                		   response.data.reverse();
	                    	   response.data.push(obj);
	                    	   response.data.reverse();
	                	   }*/
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
	       
		   }).on("select2-selecting",this.proxy(function(){
		    	this.oneFlow.select2("data",null);
		    	this.twoFlow.select2("data",null);
		    	this.threeFlow.val("");
		  })).on("select2-opening",this.proxy(function(){
			  if(this.system.select2("val")=="" || this.department.select2("val")==""){
				  $.u.alert.error("请按顺序选择");
				  return false;
			  }
		  }));
		 /**
		  * 一级流程 
		  */
		  this.oneFlow.select2({
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
	                       primaryWorkflow:term,
	                       systemId:this.system.select2("val"),
	                       unitId:this.department.select2("val"),
	                       subsystem:this.downsystem.select2("val"),
	                       
	                   };
	               }),
	               results: this.proxy(function(response, page, query) {
	                   if (response.success) {
	                	   for(i in response.data){
	                		   response.data[i]={id:response.data[i],name:response.data[i]};
	                	   }/*
	                	   if(this.term){
	                		   var obj={id:this.term,name:this.term};
	                		   response.data.reverse();
	                    	   response.data.push(obj);
	                    	   response.data.reverse();
	                	   }*/
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
	       
		   }).on("select2-selecting",this.proxy(function(){
		    	this.twoFlow.select2("data",null);
		    	this.threeFlow.val("");
		  })).on("select2-opening",this.proxy(function(){
			  if(this.system.select2("val")=="" || this.department.select2("val")=="" || this.downsystem.select2("val") == ""){
				  $.u.alert.error("请按顺序选择");
				  return false;
			  }
		  })),
		 /**
		  * @title 二级流程
		  */
		  this.twoFlow.select2({
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
	                       method: "stdcomponent.getbysearch",
		    				dataobject: "systemAnalysis",
		    				rule: JSON.stringify([
		    				                      [{"key":"system.id","value":this.system.select2("val")}],
		    				                      [{"key":"unit.id","value":this.department.select2("val")}],
		    				                      [{key:"subsystem",value:this.downsystem.select2("val")}],
		    				                      [{key:"primaryWorkflow",value:this.oneFlow.select2("val")}],
		    				                      [{key:"secondaryWorkflow",op:"like",value:term}],
		    				                     ]),
		    				
	                       
	                   };
	               }),
	               results: this.proxy(function(response, page, query) {
	                   if (response.success) {
	                	   var response=response;
	                	   for(i in response.data.aaData){
	                		   response.data.aaData[i].name=response.data.aaData[i].secondaryWorkflow;
	                	   }
	                	   return { 
	                           results: response.data.aaData,
	                       }
	                   } else {
	                       $.u.alert.error(response.reason, 1000 * 3);
	                   }
	               })
	           },
	           formatResult: function(item) {
	               return  item.secondaryWorkflow;
	           },
	           formatSelection: function(item) {
	               return  item.secondaryWorkflow;
	           },
	           id:function(item){
	        	   return item.id
	           }
	       
		   }).on("select2-selecting",this.proxy(function(){
		    	this.threeFlow.val("");
		  })).on("select2-opening",this.proxy(function(){
			  if(this.system.select2("val")=="" || this.department.select2("val")=="" || this.downsystem.select2("val") == "" || this.oneFlow.select2("val") == ""){
				  $.u.alert.error("请按顺序选择");
				  return false;
			  }
		  }));
		/**
    	 * @int 权限设置
    	 */
    	this.editable = this._options.editable;
    	this.statusCategory  = this._options.statusCategory;
    	if(this.editable && this.statusCategory!=="COMPLETE"){
    		this.add_analysis.show();
    		this.workList.find(".edit-analysis").removeClass("hidden");
    		this.workList.find(".del-analysis").removeClass("hidden");
    	}else{
    		this.add_analysis.hide();
    		this.workList.find(".edit-analysis").addClass("hidden");
    		this.workList.find(".del-analysis").addClass("hidden");
    	}
    },
    /**
     * @int unit
     */
    systemID:function(){

		  /**
	    	 * @title查询部门
	    	 */
		  
	    	 $.u.ajax({
	   			url : $.u.config.constant.smsqueryserver,
	   			type:"post",
	   			async:false,
	               dataType: "json",
	               data: {
	              	 "tokenid":$.cookie("tokenid"),
		          	method: "getSystemAnalysisFactorBySearch",
		            systemId:this.system.select2("val"),
		            factor: "unit", 
	               }
	       	}).done(this.proxy(function(response){
 			   $.each(response.data,function(index,item){
				   item.text=item.name;
			   })
			    this.unitData=response.data;
		   }));
	    	 
	    	 /**
	    	  * @unit
	    	  */
	    	 this.department.select2({
	   		  data:this.unitData
	   	  }).on("select2-selecting",this.proxy(function(){
	   	    	this.downsystem.select2("data",null);
	   	    	this.oneFlow.select2("data",null);
	   	    	this.twoFlow.select2("data",null);
	   	    	this.threeFlow.val("");
	   	  })).on("select2-opening",this.proxy(function(){
	   		  if(this.system.select2("val")==""){
	   			  $.u.alert.error("请选择系统");
	   			  return false;
	   		  }
	   	  }));
    },
    editsystem:function(e){
    	e.preventDefault();
    	e.stopPropagation();
    	var $this = $(e.target);
    	 this.analysisData=JSON.parse($(e.target).attr("data-data"));
    	 this.tr=$(e.target).parents("tr");
    	 this.mode=$(e.target).attr("mode");
    	 this.editanalysisDialog = false;
		if(!this.editanalysisDialog){
			this.editanalysisDialog = this.qid("analysisDialog").dialog({
	        	title:"系统工作分析",
	            width:540,
	            modal: true,
	            draggable: false,
	            resizable: false,
	            autoOpen: false,
	            buttons:[
                  {
					  "text":"确定",
					  "click":this.proxy(function(){
						  if(this.mode=="edit"){
							  this.edit_save_ok($this);
						  }else{
							  this.save_ok();  
						  }
					  })
				  },
           		  {
           			  "text":"取消",
           			  "class":"aui-button-link",
           			  "click":this.proxy(function(){
           				  this.editanalysisDialog.dialog("close");
           				  this.proxy(this.clean());
           			  })
           		  }
           		],
	            open: this.proxy(function () {
	            	this.objId=this.analysisData.objId;
	            	this.system.select2("data",{id:this.analysisData.system,name:this.analysisData.systemDisplayName,text:this.analysisData.systemDisplayName});
	            	this.proxy(this.systemID());
	            	this.department.select2("data",{id:this.analysisData.unit,name:this.analysisData.unitDisplayName,text:this.analysisData.unitDisplayName});
	            	this.downsystem.select2("data",{id:this.analysisData.subsystem,name:this.analysisData.subsystem});
	            	this.oneFlow.select2("data",{id:this.analysisData.primaryWorkflow,name:this.analysisData.primaryWorkflow});
	            	this.twoFlow.select2("data",{id:this.analysisData.id,secondaryWorkflow:this.analysisData.secondaryWorkflow});
	            	this.threeFlow.val(this.analysisData.tertiaryWorkflow);
	            	
	            }),
	            close: function () {
	            },
	            create: this.proxy(function () {
	            	  
	            })
	        }); 
		}
		this.editanalysisDialog.dialog("open");
    },
    edit_save_ok:function($this){
    	data=this.getData();
    	if(!data){
    		return false;
    	}
    	$.u.ajax({
            url: $.u.config.constant.smsmodifyserver,
            type: "post",
            dataType: "json",
            data: {
                tokenid: $.cookie("tokenid"),
                method: this.mode == "edit" ? "stdcomponent.update" :"stdcomponent.add",
                dataobject:"systemAnalysisMapping",
                dataobjectid:this.objId,
                obj: JSON.stringify(data)
            },
    	}).done(this.proxy(function(res){
    		if(res.success){
    			$.u.ajax({
    	            url: $.u.config.constant.smsqueryserver,
    	            type: "post",
    	            dataType: "json",
    	            data: {
    	                tokenid: $.cookie("tokenid"),
    	                method: "stdcomponent.getbysearch",
    	                dataobject:"systemAnalysisMapping",
    	                rule:JSON.stringify([[{key:"activity",value:this._options.activity}]])
    	            },
    			}).done(this.proxy(function(res){
    				this.refresh_int(res.data.aaData);
    			}));
    			this.proxy(this.clean());
    			this.editanalysisDialog.dialog("close");
    			
    		}
    	}))
    },
    getData:function(){
    	if(this.system.select2("val")==""  || this.downsystem.select2("val")=="" || this.department.select2("val") == " " || this.oneFlow.select2("val") == "" || this.twoFlow.select2("val") == ""){
    		$.u.alert.error("请选择必填字段");
    		return false
    	}else{
    		return {
    			activity:this._options.activity,
    			systemAnalysis:Number(this.twoFlow.select2("val")),
    		     tertiaryWorkflow:this.threeFlow.val()
    		    };
    	}
    	
    },
    addAnalysis: function(e){
    	e.preventDefault();
    	this.mode=null;
    	this.analysisData=null;
    	this.proxy(this.clean());
		if(!this.analysisDialog){
			this.analysisDialog = this.qid("analysisDialog").dialog({
	        	title:"系统工作分析",
	            width:540,
	            modal: true,
	            draggable: false,
	            resizable: false,
	            autoOpen: false,
	            buttons:[
                  {
					  "text":"确定",
					  "click":this.proxy(function(){
						  if(this.mode=="edit"){
							  this.edit_save_ok();
						  }else{
							  this.save_ok();  
						  }
						  
						  
					  })
				  },
           		  {
           			  "text":"取消",
           			  "class":"aui-button-link",
           			  "click":this.proxy(function(){
           				  this.analysisDialog.dialog("close");
           			  })
           		  }
           		],
	            open: this.proxy(function (param) {
	            }),
	            close: function () {
	            },
	            create: this.proxy(function () {
	            	  
	            })
	        }); 
		}
		this.analysisDialog.dialog("open");
    },
    save_ok:function(){
    	data=this.getData();
    	if(!data){
    		return false;
    	}
    	$.u.ajax({
            url: $.u.config.constant.smsmodifyserver,
            type: "post",
            dataType: "json",
            data: {
                tokenid: $.cookie("tokenid"),
                method: this.mode == "mode" ? "stdcomponent.update" :"stdcomponent.add",
                dataobject:"systemAnalysisMapping",
                obj: JSON.stringify(data)
            },
    	}).done(this.proxy(function(res){
    		if(res.success){
    			$.u.ajax({
    	            url: $.u.config.constant.smsqueryserver,
    	            type: "post",
    	            dataType: "json",
    	            data: {
    	                tokenid: $.cookie("tokenid"),
    	                method: "stdcomponent.getbysearch",
    	                dataobject:"systemAnalysisMapping",
    	                rule:JSON.stringify([[{key:"activity",value:this._options.activity}]])
    	            },
    			}).done(this.proxy(function(res){
    				this.refresh_int(res.data.aaData);
    				
    			}));
    			 this.analysisDialog.dialog("close");
    		}
    	}))
    },
    refresh_int:function(data){
    	var temp, $temp;
    	this.workList.empty();
    	$.each(data,this.proxy(function(k,v){
    	          v.systemAnalysis.objId=v.id;
    		temp = this.worklistTab.replace(/#\{itemid\}/g, v.systemAnalysis.objId || " ")
									.replace(/#\{fileid\}/g, v.systemAnalysis.id || " ")
									.replace(/#\{system\}/g, v.systemAnalysis.systemDisplayName || " ")
									.replace(/#\{department\}/g, v.systemAnalysis.unitDisplayName || " ")
									.replace(/#\{downsystem\}/g, v.systemAnalysis.subsystem || " ")
									.replace(/#\{oneFlow\}/g, v.systemAnalysis.primaryWorkflow || " ")
									.replace(/#\{twoFlow\}/g, v.systemAnalysis.secondaryWorkflow || " ")
									.replace(/#\{analysisdata\}/g,JSON.stringify(v.systemAnalysis) || " ")
									.replace(/#\{threeFlow\}/g, v.tertiaryWorkflow || " ");
    		$temp = $(temp).appendTo(this.workList);
    	}));
    },
    clean:function(){
    	this.system.select2("data",null);
    	this.department.select2("data",null);
    	this.downsystem.select2("data",null);
    	this.oneFlow.select2("data",null);
    	this.twoFlow.select2("data",null);
    	this.threeFlow.val("");
    },
    _del_file:function(e){
    	e.stopPropagation();
   	   this.analysisData=JSON.parse($(e.target).attr("data-data"));
   	   this.tr=$(e.target).parents("tr");
    	try{
    		var data = JSON.parse($(e.currentTarget).attr("data-data"));
    		$.u.load("com.sms.common.stdcomponentdelete");
    		(new com.sms.common.stdcomponentdelete({
    			body:"<div>"+
    				 	"<p>确认删除？</p>"+
    				 "</div>",
    			title:"删除工作分析",
    			dataobject:"systemAnalysisMapping",
    			dataobjectids:JSON.stringify([this.analysisData.objId])
    		})).override({
    			refreshDataTable:this.proxy(function(){
    				this.tr.fadeOut(function(){
		    			$(this).remove();
		    		})
    			})
    		});
    	}catch(e){
    		throw new Error("删除操作失败:"+e.message);
    	}
    },
    destroy: function () {
        this._super();
    }
}, { usehtm: true, usei18n: false });


com.sms.detailmodule.systemwork.workAnalysis.widgetjs = ["../../../../uui/widget/uploadify/jquery.uploadify.js",
                                            "../../../../uui/widget/spin/spin.js", 
                                            "../../../../uui/widget/jqblockui/jquery.blockUI.js",
                                            "../../../../uui/widget/ajax/layoutajax.js"];
com.sms.detailmodule.systemwork.workAnalysis.widgetcss = [{id:"",path:"../../../../uui/widget/uploadify/uploadify.css"}];