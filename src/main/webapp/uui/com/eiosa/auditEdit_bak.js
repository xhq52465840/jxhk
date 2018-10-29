//@ sourceURL=com.eiosa.auditEdit
var isarpText="";
var documentList="";
var actionList="";
var isarpId="";
var sectionName="";
var sectionId="";
var reportId="";
var actionId="";
var docId=null;
var documentType="";
var assessFinding=[];
var assessObserve=[];
var conformity=[];
$.u.load("com.eiosa.uploadDialog");
$.u.load("com.eiosa.logTable");
$.u.define('com.eiosa.auditEdit', null, {
    init: function (options) {
        this._options = options||null;
        
    },
    afterrender: function (bodystr) {
    	//先查出assessment的所有选项，分别赋值给assessFinding、assessObserve
    	
    	$.ajax({
			url: $.u.config.constant.smsqueryserver,
            type:"post",
            dataType: "json",
            cache: false,
            data: {
       		   "tokenid":$.cookie("tokenid"),
       		   "method":"stdcomponent.getbysearch",
       		   "dataobject":"assessments"
            }
	        
		 }).done(function(response){
			if(response.success){
				 for(var i=0;i<response.data.aaData.length;i++){
					 var item=response.data.aaData[i];
					 var value={"number":item.id,"name":item.text+"("+item.type+")"};
					 conformity.push(value);
					 if(item.id=='1' || item.id=='8'){
							var value={"number":item.id,"name":item.text+"("+item.type+")"};
							 assessFinding.push(value);
							 assessObserve.push(value);
						}else if(item.id=='5'|| item.id=='6' || item.id=='7'){
							var value={"number":item.id,"name":item.text+"("+item.type+")"};
							 assessObserve.push(value);
						}else if(item.id=='3'|| item.id=='4'|| item.id=='2'){
							var value={"number":item.id,"name":item.text+"("+item.type+")"};
							 assessFinding.push(value);
						}
				 }
			}
			
		 });
    	//$("#auditDate").focus(function(){
		    //WdatePicker({dateFmt:'yyyy-MM-dd',lang:'zh-cn'});
    		
		//});
    	$("#assessment").change(function(){
    		if($("#assessment").val()=='1'){
          		document.getElementById("comments").style.display="";
          		document.getElementById("na").style.display="none";
          		document.getElementById("root").style.display="none";
          	}else if($("#assessment").val()=='8'){
          		document.getElementById("comments").style.display="none";
          		document.getElementById("na").style.display="";
          		document.getElementById("root").style.display="none";
          	}else if($("#assessment").val()==''){
          		document.getElementById("comments").style.display="none";
          		document.getElementById("na").style.display="none";
          		document.getElementById("root").style.display="none";
          	}else{
          		document.getElementById("comments").style.display="none";
          		document.getElementById("na").style.display="";
          		document.getElementById("root").style.display="";
          	}
        	  
    	});
    	this.qid("linkDocument").click(function(){
    		//window.open('http://localhost:8080/sms/uui/com/eiosa/main.html?document');
    		// $('#myTab li:eq(3) a').tab('show');//初始化显示哪个tab
    		
    		
    	});
    	this.addAttach=this.qid("addAttach");
 		this.addAttach.on("click",this.proxy(this._addAttach));
 		this.docAttach=$("#docAttach");
 		this.docAttach.on("click",this.proxy(this._docAttach));
 		$("#receiverTxt").select2({ 
 			ajax: {
                url: $.u.config.constant.smsqueryserver,
                dataType: "json",
                type: "post",
                data: this.proxy(function(term, page){
                    return {
                    	tokenid: $.cookie("tokenid"),
                        method: "queryUser",
                        username: term,
                        fullname: term
                    };
                }),
                results: this.proxy(function(response){
                	
                    if(response.success){
                        return {
                        	 "results": response.data.aaData
                        }
                    }
                })
                
            },
            id: function(item){
                return item.id;
            },

            formatResult:function(item){
            	 return item.username
            },
            formatSelection:function(item){
            	 return item.username
            },

            multiple: false,                
 			allowClear: true,
 		});
 		this.attachDialog=new com.eiosa.uploadDialog($("div[umid='uploadDialog']",this.$),null);
 		this.logTable=new com.eiosa.logTable($("div[umid='actionLogTable']", this.$),null);
    	this.divDialog = this.qid("div_Dialog").dialog({
    		title:"ISARP编辑",
            width:'80%',
            modal: true,
            draggable: false,
            resizable: false,
            autoOpen: false,
            buttons:[{
            	      "text":"导出",
            	      "click":this.proxy(function(){
            	    	  alert("导出该审计点编辑整个页面")
            	      })
                       },{
            	       "text":"添加说明",
            	       "click":this.proxy(function(){
            	    	   $("#explainTxt").val("");
            	    	   this.explainDialog= $('#addExplainDialog').dialog({
            	   			width:400,
            	   			height:200,
            	   		    modal: true,
            	   			draggable: false,
            	   			title:"添加说明",
            	   	        position:[500,100],
            	   		});
            	   	 var dialogOptions = {
            	   			
            	   				buttons: [{
            	   	            text: "保存",
            	   				"class": "aui-button-link",
            	   				click: this.proxy(function () {
            	   					
            	   					$.u.ajax({
        								url:$.u.config.constant.smsmodifyserver,
        								type: "post",
        				                dataType: "json",
        								data:{
        									"tokenid":$.cookie("tokenid"),
        									"method":"stdcomponent.add",
        									"dataobject":"operateLog",
        									"obj":JSON.stringify({
        									    "isarpId":isarpId,
        									    "descoperate":$("#explainTxt").val()
        									})
        								}
        							},$("#addExplainDialog")).done(this.proxy(function(response){
        								//this.log=new com.eiosa.logTable($("div[umid='actionLogTable']", this.$),null);
        								 $('#addExplainDialog').dialog("close");
        								// this.log.afterrender(way.get("isarp.id"));
        								 this.logTable.afterrender(String(way.get("isarp.id")));
        							}))
            	   	            })},{
            	   	            text: "取消",
            	   	  			"class": "aui-button-link",
            	   	  			click: function () {
            	   	  				
            	   	  		     $('#addExplainDialog').dialog("close");
            	   				}
            	   	            }
            	   		]
            	   		};
            	   	  this.explainDialog.dialog("option",dialogOptions).dialog("open");
            	       })
            	       
                      },{
                        "text":"发送消息",
                        "click":this.proxy(function(){
                        	this.messageDialog= $('#messageDialog').dialog({
                	   			width:600,
                	   			height:300,
                	   			title:"发送消息",
                	   	        position:[500,100],
                	   		});
                	   	 var dialogOptions = {
                	   			
                	   				buttons: [{
                	   	            text: "保存",
                	   				"class": "aui-button-link",
                	   				click:this.proxy( function () {
                	   					
                	   					$.u.ajax({
            								url:$.u.config.constant.smsmodifyserver,
            								type: "post",
            				                dataType: "json",
            								data:{
            									"tokenid":$.cookie("tokenid"),
            									"method":"stdcomponent.add",
            									"dataobject":"operateLog",
            									"obj":JSON.stringify({
            									    "isarpId":isarpId,
            									    "descoperate":$("#messageTxt").val(),
            									    "receiver":parseInt($("#receiverTxt").val())
            									})
            								}
            							},$('#messageDialog')).done(this.proxy(function(response){
            								//this.log=new com.eiosa.logTable($("div[umid='actionLogTable']", this.$),null);
            								 $('#messageDialog').dialog("close");
            								 //this.log.afterrender(way.get("isarp.id"));
            								 this.logTable.afterrender(String(way.get("isarp.id")));
            							}))
                	   	            })},{
                	   	            text: "取消",
                	   	  			"class": "aui-button-link",
                	   	  			click: this.proxy(function () {
                	   	  		     $('#messageDialog').dialog("close");
                	   	  		     
                	   				})
                	   	            }
                	   		]
                	   		};
                	   	  this.messageDialog.dialog("option",dialogOptions).dialog("open");
                	       })
                	       
                       
                      },{
                    	  "text":"提交",
                    	  "id":"isarpSubmit",
                    	  "click":this.proxy(function(){
                    		  $("#explainTxt").val("");
               	    	   this.explainDialog= $('#addExplainDialog').dialog({
               	   			width:400,
               	   			height:200,
               	   			title:"提交",
               	   	        position:[500,100],
               	   		});
               	   	 var dialogOptions = {
               	   			
               	   				buttons: [{
               	   	            text: "保存",
               	   				"class": "aui-button-link",
               	   				click: this.proxy(function () {
               	   					
               	   					$.u.ajax({
           								url:$.u.config.constant.smsmodifyserver,
           								type: "post",
           				                dataType: "json",
           								data:{
           									"tokenid":$.cookie("tokenid"),
           									"method":"isarpSubmit",
           									 "isarpId":isarpId,
           									  "dec":$("#explainTxt").val(),
           									  "type":"submit"
           									
           								}
           							},$("#addExplainDialog")
               	   					).done(this.proxy(function(response){
               	   					//this.log=new com.eiosa.logTable($("div[umid='actionLogTable']", this.$),null);
           								 $('#addExplainDialog').dialog("close");
           								//this.logTable.afterrender(String(way.get("isarp.id")));
           								this.logTable.afterrender(String(way.get("isarp.id")));
           								document.getElementById("isarpSubmit").style.display="none";
           					    		document.getElementById("isarpAudited").style.display="";
           					    		document.getElementById("isarpReaduit").style.display="";
           					    		document.getElementById("isarpSave").style.display="";
           					    		$("#status").html("审核中");
           					             if(response.success){
           					            	$.u.alert.success("提交成功");
           					            	this.refresh();
           					             }else{
           					            	$.u.alert.error("提交失败");
           					             }
           					             
           							}))
               	   	            })},{
               	   	            text: "取消",
               	   	  			"class": "aui-button-link",
               	   	  			click: function () {
               	   	  				
               	   	  		     $('#addExplainDialog').dialog("close");
               	   				}
               	   	            }
               	   		]
               	   		};
               	   	  this.explainDialog.dialog("option",dialogOptions).dialog("open");
                    		 /** $.ajax({
  								url:$.u.config.constant.smsmodifyserver,
  								type: "post",
  				                dataType: "json",
  								data:{
  									"tokenid":$.cookie("tokenid"),
  									"method":"stdcomponent.update",
  									"dataobject":"isarp",
  									"dataobjectid":isarpId,
  									"obj":JSON.stringify({
  									    "status":"审核中",
  						
  									})
  								}
  							}).done(function(response){
  								if(response.success){
  								$.u.alert.success("提交成功");
  								}
  							})*/
                    	  })
                      },{
                    	  "text":"审核通过",
                    	  "id":'isarpAudited',
                    	  "click":this.proxy(function(){

                    		  $("#explainTxt").val("");
               	    	   this.explainDialog= $('#addExplainDialog').dialog({
               	   			width:400,
               	   			height:200,
               	   			title:"审核通过",
               	   	        position:[500,100],
               	   		});
               	   	 var dialogOptions = {
               	   			
               	   				buttons: [{
               	   	            text: "保存",
               	   				"class": "aui-button-link",
               	   				click:this.proxy( function () {
               	   					
               	   					$.u.ajax({
           								url:$.u.config.constant.smsmodifyserver,
           								type: "post",
           				                dataType: "json",
           								data:{
           									"tokenid":$.cookie("tokenid"),
           									"method":"isarpSubmit",
           									 "isarpId":isarpId,
           									  "dec":$("#explainTxt").val(),
           									  "type":"audit"
           									
           								}
           							},$("#addExplainDialog")
               	   					).done(this.proxy(function(response){
           								//this.log=new com.eiosa.logTable($("div[umid='actionLogTable']", this.$),null);
           								 $('#addExplainDialog').dialog("close");
           								this.logTable.afterrender(String(way.get("isarp.id")));
           								document.getElementById("isarpSubmit").style.display="none";
           					    		document.getElementById("isarpAudited").style.display="none";
           					    		document.getElementById("isarpReaduit").style.display="";
           					    		document.getElementById("isarpSave").style.display="none";
           					    		$("#status").html("审核通过");
           								if(response.success){
           					            	$.u.alert.success("审核成功");
           					            	this.refresh();
           					             }else{
           					            	$.u.alert.error("提交失败");
           					             }
           								
           							}))
               	   	            })},{
               	   	            text: "取消",
               	   	  			"class": "aui-button-link",
               	   	  			click: function () {
               	   	  				
               	   	  		     $('#addExplainDialog').dialog("close");
               	   				}
               	   	            }
               	   		]
               	   		};
               	   	  this.explainDialog.dialog("option",dialogOptions).dialog("open");
                    	  })
                      },{
                    	  "text":"重新审计",
                    	  "id":"isarpReaduit",
                    	  "click":this.proxy(function(){
                    		  alert("重新审计")
                    		 /** var objs=[];
                    		  var newAction=[];
                    		  for(var i=0;i<actionList.length;i++){
                    			  var data={};var action={};
                    			  data["id"]=actionList[i].id;
                    			  data["libtype"]=3;
                    			  action["reports"]=actionList[i].reports; action["status"]="未完成";
                    			  action["title"]=actionList[i].title;action["isarpid"]=actionList[i].isarpid;
                    			  action["libtype"]=2;
                    			  
                    			  objs.push(data);newAction.push(action);
                    		  }
                    		  $.ajax({
  								url:$.u.config.constant.smsmodifyserver,
  								type: "post",
  				                dataType: "json",
  								data:{
  									"tokenid":$.cookie("tokenid"),
  									"method": "stdcomponent.updateall",
  									"dataobject": "isarpAction",
  				                    "objs": JSON.stringify(objs)
  				                  
  								},
  								
  							}).done(function(response){
  								if(response.success){
  									//添加action
  									$.ajax({
  		  								url:$.u.config.constant.smsmodifyserver,
  		  								type: "post",
  		  				                dataType: "json",
  		  								data:{
  		  									"tokenid":$.cookie("tokenid"),
  		  									"method": "stdcomponent.addall",
  		  									"dataobject": "isarpAction",
  		  				                    "objs": JSON.stringify(newAction)
  		  				                    
  		  								}
  		  							}).done(function(response){
  		  								if(response.success){
  		  								    $.ajax({
  		  					                url: $.u.config.constant.smsqueryserver,
  		  					                type:"post",
  		  					                dataType: "json",
  		  					                cache: false,
  		  					                data: {
  		  					           	       "tokenid":$.cookie("tokenid"),
  		  					  	       		  "method":"queryActions",
  		  					  	       	      "rule":isarpId
  		  					                 }
  		  					      }).done(function (data) {
  		  					      //way.set("actionList",data.ActionList);
		  					   	   actionList=data.ActionList;
  		  					      }); 
  		  						 
  		  						    $.u.alert.success("提交成功");
  		  						  
  		  								}
  		  							})
  								}
  							})*/
                    	  })
                      },{
					  "text":"保存",
					  "id":"isarpSave",
					  "click":this.proxy(function(){
						  
						  $.u.ajax({
								url:$.u.config.constant.smsmodifyserver,
								type: "post",
				                dataType: "json",
								data:{
									"tokenid":$.cookie("tokenid"),
									"method":"stdcomponent.update",
									"dataobject":"isarp",
									"dataobjectid":way.get("isarp.id"),
				            		 "obj":JSON.stringify({
				            			 assessment: parseInt($("#assessment").val()),
				            			 reason: $("#reason").val(),
				            			 rootCause: $("#rootCause").val(),
				            			 taken: $("#taken").val(),
				            			 comments: $("#commentsText").val()
				                    })
								}
							}).done(this.proxy(function(response){

								if(response.success){
									$.u.alert.success("保存成功");
									this.refresh();
								}else{
									$.u.alert.error("保存失败");
								}
							}))
						  
					  })
				  },
           		  {
           			  "text":"关闭",
           			  "class":"aui-button-link",
           			  "click":this.proxy(function(){
           				this.divDialog.dialog("close");
	  				     
           			  })
           		  }
           		],
           	
            open: this.proxy(function () {
            	
            }),
            _document:this.proxy(function(){
            	
            }),
            close: this.proxy(function () {
            	
            }),
            create: this.proxy(function () {
            	this.buildForm();
            })
        }); 
    },
    buildForm:function(){
    	
    },
    open:function(value,status,id,secId){
    	/**this.waitDialog= $('#waitDialog').dialog({
   			width:400,
   			height:100,
   			title:"正在加载数据...",
   	       
   		});*/
	  //this.waitDialog.dialog("open");
    	//way.set("isarp","");
    	//way.set("documentList","");
    	//way.set("actionList","");
    	
    	$("#status").html(status);
    	if(status=="审计中" ||status==null){
    		document.getElementById("isarpSubmit").style.display="";
    		document.getElementById("isarpAudited").style.display="none";
    		document.getElementById("isarpReaduit").style.display="";
    		document.getElementById("isarpSave").style.display="";
    		
    	}else if(status=="审核中"){
    		 //验证用户角色,如果是EIOSA审计员，则没有审核通过的权限
    	    	var result=false;
    	    	$.u.ajax({
    				url: $.u.config.constant.smsqueryserver,
    	            type:"post",
    	            dataType: "json",
    	            cache: false,
    	            data: {
    	       		   "tokenid":$.cookie("tokenid"),
    	       		   "method":"checkUserRole"
    	            }  
    			 },$("#isarp")).done(this.proxy(function(response){
    				 if(response.manager){
    					 result=true;
    					 document.getElementById("isarpAudited").style.display="";
    				 }else if(response.auditor){
    					 result=false;
    					 document.getElementById("isarpAudited").style.display="none";
    				 }
    			 }));
    	    	
    		/**if(result){//主管与管理员
    			document.getElementById("isarpAudited").style.display="";
    		}else{//普通审计员
    			document.getElementById("isarpAudited").style.display="none";
    		}*/
    		document.getElementById("isarpSubmit").style.display="none";
    		
    		document.getElementById("isarpReaduit").style.display="";
    		document.getElementById("isarpSave").style.display="";
    	}else if(status=="审核通过"){
    		//验证用户角色,如果是EIOSA审计员，则没有审核通过的权限
	    	$.u.ajax({
				url: $.u.config.constant.smsqueryserver,
	            type:"post",
	            dataType: "json",
	            cache: false,
	            data: {
	       		   "tokenid":$.cookie("tokenid"),
	       		   "method":"checkUserRole"
	            }  
			 },$("#isarp")).done(this.proxy(function(response){
				 if(response.manager){
					
						document.getElementById("isarpSave").style.display="";
				 }else if(response.auditor){
					
						document.getElementById("isarpSave").style.display="none";
				 }
			 }));
    		
    		document.getElementById("isarpSubmit").style.display="none";
    		document.getElementById("isarpAudited").style.display="none";
    		document.getElementById("isarpReaduit").style.display="";
    		document.getElementById("isarpSave").style.display="none";
    		
    	}else if(status=="继续整改中"){
    		document.getElementById("isarpSubmit").style.display="";
    		document.getElementById("isarpAudited").style.display="none";
    		document.getElementById("isarpReaduit").style.display="";
    		document.getElementById("isarpSave").style.display="";
    	}
    	isarpId=value;
    	//document.getElementById("add123").style.display="";
    	reportId=id;
    	sectionId=secId;
    	//初始化actionList;
    	//查询isarp
    	$.u.ajax({
			url: $.u.config.constant.smsqueryserver,
            type:"post",
            dataType: "json",
            cache: false,
            data: {
       		   "tokenid":$.cookie("tokenid"),
       		   //"method":"queryIsarp",
       		  // "id":value
       		   "method":"stdcomponent.getbyid",
       		   "dataobject":"isarp",
			   "dataobjectid":value
            }  
		 },$("#isarp")).done(this.proxy(function(response){
		  if(response.success){
			  $(document).ready(function() {
	        	  isarpText=response.data.text;
	        	  $.each(response.data,function(index,item){
	        		  if(item==null){
	        			  response.data[index]="";
	        		  }
	        	  });
	        	  way.set("isarp",response.data);
	        	  
	        	  way.set("isarp.status",status);
	        	  //$("#status").html(status);
	        	 $('#isarpText').html(response.data.text);
	        	 
	        	 $("#commentsText").val(response.data.comments);
	        	// var oDiv=document.createElement("DIV"); 
	        	 // oDiv.innerHTML=response.data.comments;
	        	  //document.getElementById("commentsText").appendChild(oDiv);   
	        	 $("#reason").val(response.data.reason);
	        	 $("#rootCause").val(response.data.rootCause);
	        	 $("#taken").val(response.data.taken);
	            var dataSpilt=response.data.text.split("</p>");
	            $("#assessment").empty();
	        	if(dataSpilt[0].indexOf("shall")>0){
	        		
	        		 addRoot(assessFinding,"assessment",response.data.assessment)
	        		
	        	 }else if(dataSpilt[0].indexOf("should")>0){
	        		 
	        		 addRoot(assessObserve,"assessment",response.data.assessment)
	        		 
	        	 }
	        	
	        	 $('#guidance').html(response.data.guidance);
	        	  //判断assessment显示逻辑
	          	if(way.get("isarp.assessment")=='1'){
	          		document.getElementById("comments").style.display="";
	          		document.getElementById("na").style.display="none";
	          		document.getElementById("root").style.display="none";
	          	}else if(way.get("isarp.assessment")=='8'){
	          		document.getElementById("comments").style.display="none";
	          		document.getElementById("na").style.display="";
	          		document.getElementById("root").style.display="none";
	          	}else if(way.get("isarp.assessment")==''){
	          		document.getElementById("comments").style.display="none";
	          		document.getElementById("na").style.display="none";
	          		document.getElementById("root").style.display="none";
	          	}else{
	          		document.getElementById("comments").style.display="none";
	          		document.getElementById("na").style.display="";
	          		document.getElementById("root").style.display="";
	          	}
	        	  
	        	 
	          })
	          //this.waitDialog.dialog("close");
	          this.divDialog.dialog("open");
		  }
         
		 }));
    	//  this.waitDialog.dialog("close");
         // this.divDialog.dialog("open");
    	//查询documents
    	this.queryDocument(value);
    	 //查询Action
    	 this.queryAction(value);
    	 //查询Log
    	 this.logTable.afterrender(value);
        /**$.ajax({
             url: $.u.config.constant.smsqueryserver,
              type:"post",
              dataType: "json",
              cache: false,
              data: {
            	  "tokenid":$.cookie("tokenid"),
   	       		  "method":"queryLog",
   	       	      "rule":{"isarp":value}
              }
       }).done(function(response){
    	   way.set("log",response.LogList);
       })
    	*/
    	
    	
    	
    
    	this.qid("addDocument").click(this.proxy(this._document));
    	$("#addNeWDocument").click(this.proxy(this._document));
    	this.qid("addAction").click(this.proxy(this._action));
    	
    },
    refresh:function(){
    },
    refreshDocument:function(){
    	
    },
    destroy: function () {
        this._super();
    },
   
    //打开documents

    _document:function(e){
    	e.preventDefault();
    	document.getElementById("documentText").innerHTML=isarpText;
    	var id="";
    	var charpetId=null;
    	
    	Vue.config.debug = true;
    	if($(e.currentTarget).attr("data")==""){//添加已有的Document
    		//way.set("document","");
    		way.set("jsonAttach","");
    		documentContent=new Vue({
				  el: '#documentDialog',
				  data: ""
				});
    		documentType="";
    		$("#documentReviewed").select2("data",null);
    		$("#documentDate").val("");
    		
    		$("#documentReviewed").val("");
    		$("#documentAcronyms").val("");
    		$("#documentVersiono").val("");
    		$("#charpter").val("");

    		//document.getElementById("addDocBtn").style.display="none";
    		//document.getElementById("docInput").style.display="none";
    		//document.getElementById("docSelect2").style.display="";
    		document.getElementById("documentReviewed").readOnly=false;
    		document.getElementById("documentAcronyms").readOnly=true;
        	document.getElementById("documentDate").readOnly=true;
        	document.getElementById("documentVersiono").readOnly=true;
        	//document.getElementById("showAddAttach").style.display="none";
        	document.getElementById("docType").disabled=true;
        	document.getElementById("docType").style.backgroundColor='#F0F0F0';
        	document.getElementById("addNeWDocument").style.display="";
        	$("#charpter").val("");
        	//添加select2控件
        	$("#documentReviewed").select2({
        		ajax: {
                    url: $.u.config.constant.smsqueryserver,
                    dataType: "json",
                    type: "post",
                    data: function(term, page){
                        return {
                            tokenid: $.cookie("tokenid"),
                            method: "queryDocuments",
                            "sectionId":sectionId,
                            "docName":term
                          /**  "rule":JSON.stringify([[{"key":"reviewed","value":term,"op":"like"}],
                            //[{"key":"reportId","value":Number(reportId)}]
                            ])*/
                        };
                    },
                    results: function(response){
                    	
                        if(response.success){
                            return {
                            	 "results": response.documents
                            }
                        }
                    }
                    
                },
                id: function(item){
                    return item.reviewed;
                },
                placeholder : "请输入",
                formatResult:function(item){
                  return "("+item.acronyms+")"+item.reviewed+"--"+item.versionno;
                	
                	
                },
                formatSelection:function(item){
                	
                	return item.reviewed;
                },
                formatNoMatches:function(item){
                	 return "没有您需要的参考文件，请添加新的参考文件";
    
                   
                }  
                    
        	}).on("select2-selecting", function(e){
				//way.set("document",e.object);
        		documentContent=new Vue({
  				  el: '#documentDialog',
  				  data: e.object
  				});
        		$("#documentReviewed").val(e.object.reviewed);
        		$("#documentAcronyms").val(e.object.acronyms);
        		$("#documentVersiono").val(e.object.versionno);
        		$("#docType").val(e.object.type);
				$("#documentDate").val(e.object.docdate);
				docId=e.object.id;
				var attach="";
				  if(e.object.attach!=null){
         			   
         			   for(var j=0;j<e.object.attach.length;j++){
         				  way.set("jsonAttach",e.object.attach);
           				 document.getElementById("download"+j).href="http://"+window.location.host+"/sms/query.do?"
          				 + "nologin=Y&method=downloadLosaFiles&fileId="+e.object.attach[j].id;
         				// var url="http://"+window.location.host+"/sms/query.do?"
       					// + "nologin=Y&method=downloadLosaFiles&fileId="+e.object.attach[j].id;
             			  // attach+="<a href='"+url+"'>"+e.object.attach[j].attachShowName+"</a><br>" 
             		   }
         			 
         			 /**$(document).ready(function() {
         			  document.getElementById("isarpDocAttach").innerHTML=attach;
         			 });*/
         		   }else{
         			   way.set("jsonAttach","");
         		   }
        	});
        	
    		
    	}else if($(e.currentTarget).attr("data")=="newDocument"){//添加新的Document
    		//way.set("document","");
    		way.set("jsonAttach","");
    		$("#documentReviewed").select2("destroy");
    		$("#documentDate").val("");
    		$("#documentReviewed").val("");
    		$("#documentAcronyms").val("");
    		$("#documentVersiono").val("");
    		$("#charpter").val("");
    		documentContent=new Vue({
				  el: '#documentDialog',
				  data: ""
				});
    		//document.getElementById("showAddAttach").style.display="";
    		//document.getElementById("documentReviewed").dispaly=true;
    		document.getElementById("addNeWDocument").style.display="";
        	document.getElementById("documentReviewed").readOnly=false;
        	document.getElementById("documentAcronyms").readOnly=false;
        	document.getElementById("documentDate").readOnly=false;
        	document.getElementById("documentVersiono").readOnly=false;
        	document.getElementById("docType").disabled=false;
        	document.getElementById("docType").style.backgroundColor='white';
        	document.getElementById("docType").options[0].selected = true;
        	
        	documentType="newDocument";
    	}else{//修改章节且禁用添加新的文档按钮
    		documentType="";
    		document.getElementById("addNeWDocument").style.display="none";
    		$("#documentReviewed").select2("destroy");
    		//document.getElementById("docInput").style.display="";
    		//document.getElementById("docSelect2").style.display="none";
        	document.getElementById("documentAcronyms").readOnly=true;
        	document.getElementById("documentReviewed").readOnly=true;
        	document.getElementById("documentDate").readOnly=true;
        	document.getElementById("documentVersiono").readOnly=true;
        	document.getElementById("docType").disabled=true;
        	document.getElementById("docType").style.backgroundColor='#F0F0F0';
        
        	//document.getElementById("docAttach").style.display="none";
        	
    		id=JSON.parse($(e.currentTarget).attr("data"));
    		
       	    $.each(documentList,this.proxy(function(index,item){
        		if(index==id){
        			//way.set("document",item);
        			 charpetId=item.charpterId;
        			 docId=item.id;
        			if (typeof(documentContent)!='undefined') {
        				documentContent.$data=item;
        			} else {
        				documentContent=new Vue({el: '#documentDialog',data: item});
        			}
					
        			$("#documentDate").val(item.docdate);
        			$("#charpter").val(item.charpter);
        			  var attach="";
           		   if(item.attach!=null){
              			   
              			   for(var j=0;j<item.attach.length;j++){
              				  way.set("jsonAttach",item.attach);
              				 document.getElementById("download"+j).href="http://"+window.location.host+"/sms/query.do?"
             				 + "nologin=Y&method=downloadLosaFiles&fileId="+item.attach[j].id;
              				/** var url="http://"+window.location.host+"/sms/query.do?"
            					 + "nologin=Y&method=downloadLosaFiles&fileId="+item.attach[j].id;
                  			   attach+="<a href='"+url+"'>"+item.attach[j].attachShowName+"</a><br>" */
                  		   }
              			/** $(document).ready(function() {
      
              			  document.getElementById("isarpDocAttach").innerHTML=attach;
              			 });*/
              		   }else{
              			 way.set("jsonAttach","");
              		   }
        		}
      	  }));
    	}

    	this.documentDialog= $('#documentDialog').dialog({
			width:'60%',
			top:'0px',
			title:"参考文件编辑",
			modal: true,
	        draggable: false,
	        resizable: false,
	        autoOpen: false,
	        position:[300,0],
		});
	 
	 var dialogOptions = {
			
				buttons: [{
	            text: "保存",
				"class": "aui-button-link",
				click: this.proxy(function () {
					//定义章节的验证
			    	
			    		// var regu="[a-z0-9,\s]+";
			    		var regu=/^[a-zA-Z0-9;,\.\-\(\)\s]*$/;
			    		// regu.test("dGr;l,5")
			    		 var re=new  RegExp(regu);
			    		 
			    		 if(re.test($("#charpter").val())==false && $("#charpter").val()!=""){
			    		   //alert("章节输入只能是字母数字和\";,-()\"") 
			    			// $('#charpter').popover('toggle');
			    			 layer.msg('章节输入只能是字母数字和";,-()"');
			    	    }else if($("#documentReviewed").val()==null||$("#documentReviewed").val()==""){
							// $("#documentReviewed").popover('toggle');
			    	    	layer.msg('"Full name of the Manuals/Documents"不能为空');
			    	    }else if($("#documentAcronyms").val()==null||$("#documentAcronyms").val()==""){
							 //$("#documentAcronyms").popover('toggle');
			    	    	layer.msg('"Acronyms"不能为空');
			    	    }else if($("#documentVersiono").val()==null||$("#documentVersiono").val()==""){
							 //$("#documentVersiono").popover('toggle');
			    	    	layer.msg('"Version/ Revision"不能为空');
			    	    }else if($("#documentDate").val()==null||$("#documentDate").val()==""){
							 //$("#documentDate").popover('toggle');
			    	    	layer.msg('"Distribution Date"不能为空');
			    	    }else{
			    		/** if(way.get("jsonAttach")==undefined){
								
								alert("请上传该文档的附件")
							
						}else{*/
							
							$.u.ajax({
								url:$.u.config.constant.smsmodifyserver,
								type: "post",
				                dataType: "json",
				                data:{
				                	"tokenid":$.cookie("tokenid"),
									"method":"updateDocuments",
									 "sectionId":sectionId,
									 "documentId":docId,
									 "documentType":documentType,
									"documentLibary":JSON.stringify({
										/**"reviewed":way.get("document.reviewed"),
										"acronyms":way.get("document.acronyms"),
										"versionno":way.get("document.versionno"),
										"docdate":$("#documentDate").val()+" 00:00:00",
										"id":way.get("document.id"),
										"type":way.get("document.type"),*/
										"reviewed":$("#documentReviewed").val(),
										"acronyms":$("#documentAcronyms").val(),
										"versionno":$("#documentVersiono").val(),
										"docdate":$("#documentDate").val()+" 00:00:00",
										//"id":documentContent.id,
										"type":$("#docType").val(),
										"reportId":reportId
									}),
									"charpter":JSON.stringify({
										"dec":$("#charpter").val(),
										//"id":way.get("document.charpterId"),
										//"documentid":{"id":way.get("document.id")},
										"id":charpetId,
										"documentid":{"id":docId},
										"isarpId":isarpId
									})
				                }
							},$('#documentDialog')).done(this.proxy(function(response){
								if(response.code=="success"){
									
									$.u.alert.success("保存成功");
									 $('#documentDialog').dialog("close");
									 //刷新列表
									 this.queryDocument(isarpId);
									 if(documentType=="newDocument"){
										 //刷新main页面的document列表
										 this.refreshDocument();
										 
									 }
									/** if(response.docId!=null){
										
										 way.set("document.id",response.docId);
										 
										 
									 }
									 way.set("document.charpter",$("#charpter").val());
									 documentList.push(way.get("document"));
									 
									 way.set("documentList",documentList);
									 $.each(way.get("documentList"),this.proxy(function(index,item){
										 $("#deleteDocument"+index).click(this.proxy(this._deleteDocument)) ;
									 }));*/
									 
								}else{
									if(response.existDocument){
										alert("该书已存在书库中，请勿重复添加")
									}else{
										$.u.alert.error("保存失败");
									}
									
								}
								
							}));
						}
						
			    	 }
					//way.set("document.docdate",$("#documentDate").val());
					//如果是添加新的书，必须上传附件
					
					
				  //}
				)
	            },
	             {
	            text: "取消",
	  			"class": "aui-button-link",
	  			click: this.proxy(function () {
	  				
	  		     $('#documentDialog').dialog("close");
				})
	            }
		]
		};
	 this.documentDialog.dialog("option",dialogOptions).dialog("open");
	
	// getDis(way.get("document.disciplines"));
 	
	if($("#documentDate").prop("readonly")==false) {
    	$("#documentDate").datepicker({"dateFormat":"yy-mm-dd", constrainInput:true});
	} else {
		$("#documentDate").datepicker("option", "disabled", true);
	}
	
    },
    //打开action
    _action:function(e){
    	e.preventDefault();
    	$("#actionAuditor").select2({
    		tokenSeparators:[',', ' '],
      		 allowClear: true,
      		tags: true,
			 ajax: {
               url: $.u.config.constant.smsqueryserver,
               dataType: "json",
               type: "post",
               data: this.proxy(function(term, page){
                   return {
                       tokenid: $.cookie("tokenid"),
                       method: "queryAuditors",
                       "type":"auditing",
                       "name":term
                   };
               }),
               results: this.proxy(function(response){
               	
                   if(response.success){
                	 
                       return {
                       	 "results": response.auditorList
                       	
                       }
                   }
               })
               
           },
           id: function(item){
               return item.id;
           },

           formatResult:function(item){
             return item.fullname+"("+item.username+")";
           	
           	
           },
           formatSelection:function(item){
           	return item.username;
           }
    	});
    	var id="";
    	var actionContent="";
    	//var actionId="";
        if($(e.currentTarget).attr("data")==""){
        	actionId='0000000';
        //	way.set("action",null);
        	way.set("jsonAttach",null);
        }else{
        	id=JSON.parse($(e.currentTarget).attr("data"));
        	  $.each(actionList,this.proxy(function(index,item){
        	   		
          		if(index==id){
          			//way.set("action",item);
          			/**if (typeof(actionContent)!='undefined') {
          				actionContent.$data=item;
        			} else {
        				actionContent=new Vue({el:'#actionEditDialog',data: item});
        			}*/
          			var data='<B>'+item.type+'</B>'+item.title;
          			 $("#title").html(data);
          			 actionId=item.id;
          			 $("#reports").val(item.reports);
          			 $("#actionStatus").val(item.statusValue);
          			 $("#auditDate").val(item.auditDate);
          			 
          			 $("#auditors").val(item.auditors);
          			 $("#auditDate_string").val(item.auditDate_string);
          			 $("#actionAuditor").select2("data",item.auditorSelect2);
          		}
        	  }));
        	 
        	  //查找附件
        	  for(var i=0;i<actionList.length;i++){
         	    	if(actionList[i].id==actionId){
         	    		
         	    	    if(actionList[i].attach!=null){
            	    	     way.set("jsonAttach",actionList[i].attach);
            	    	     for(var j=0;j<actionList[i].attach.length;j++){
                	    		 document.getElementById("download"+j).href="http://"+window.location.host+"/sms/query.do?"
             				 + "nologin=Y&method=downloadLosaFiles&fileId="+actionList[i].attach[j].id;
                	    		//var str=actionList[i].attach[j].updateTime;
                	    		//actionList[i].attach[j].updateTime=formAllDate(str);
                	    	 }
         	    	   }else{
         	    		 way.set("jsonAttach",null);
         	    	   }
         	    	}
         	    }
        }
   	 //查找附件
   	/** $.ajax({
			 url: $.u.config.constant.smsqueryserver,
          type:"post",
          dataType: "json",
          cache: false,
          data: {
     		"tokenid":$.cookie("tokenid"),
     		"tokenid":$.cookie("tokenid"),
     		"method":"queryAttach",
     		"activityId":actionId
          }
	        
		 }).done(function(response){
			
		 if(response.success){
			 way.set("jsonAttach",response.jsonAttach);
			 for (var i=0;i<response.jsonAttach.length;i++){
				 document.getElementById("download"+i).href="http://"+window.location.host+"/sms/query.do?"
					 + "nologin=Y&method=downloadLosaFiles&fileId="+response.jsonAttach[i].id;
				 var str=response.jsonAttach[i].updateTime;
				 response.jsonAttach[i].updateTime=formAllDate(str);
			 }
			 way.set("jsonAttach",response.jsonAttach);
			
		 }]
		
  
	 });*/
   	  
   	    
        
    	this.actionDialog= $('#actionEditDialog').dialog({
			title:"AAs编辑",
			width: '60%',
	        modal: true,
	       draggable: false,
	       resizable: false,
	       autoOpen: false
    	  
	       	});
	  var actionOptions = {
				buttons: [{
	            text: "保存",
				"class": "aui-button-link",
				
				click: this.proxy(function () {
					//way.set("action.auditDate",$("#auditDate").val());
					$.ajax({
						url:$.u.config.constant.smsmodifyserver,
						type: "post",
		                dataType: "json",
		                data:{
		                "tokenid":$.cookie("tokenid"),
		                "method":"updateActions",
		                "id":actionId,
					    "auditDate":$("#auditDate").val(),
		            	"status": $("#actionStatus").val(),
		            	"auditors": $("#actionAuditor").val(),
		            	"reports": $("#reports").val()
		                /**"auditDate":actionContent.auditDate,
		            	"status": actionContent.actionStatus,
		            	"auditors": actionContent.actionAuditor,
		            	"reports": actionContent.reports*/
		                }
					}).done(this.proxy(function(response){
						if(response.code=="success"){
							 //刷新列表
							//freshAction(way.get("jsonAttach"),id);
							
							$.u.alert.success("保存成功");
							
							$('#actionEditDialog').dialog("close");
							this.queryAction(isarpId);
						}else{
							
							$.u.alert.error("保存失败");
						}
					 }))
				  })
	            },
	             {
	            text: "取消",
	  			"class": "aui-button-link",
	  			click: function () {
	  				 //刷新列表
				 //  freshAction(way.get("jsonAttach"),id);
				  
				   $('#actionEditDialog').dialog("close");
				   }
	            }
		]
		};
	 this.actionDialog.dialog("option",actionOptions).dialog("open", 
		 
		 $("#auditDate").datepicker({"dateFormat":"yy-mm-dd", constrainInput:true})
	);
	
    },
    _addAttach:function(){
    	
    	var value={"id":actionId,"activityNumber":isarpId,"type":"iosa_action_attach"}
    	this.attachDialog.open(value);
    },
    _docAttach:function(){
    	
    	if(docId==null){
    		//先保存document
    		documentType="onlyAddAttach";
    		$.ajax({
				url:$.u.config.constant.smsmodifyserver,
				type: "post",
                dataType: "json",
                data:{
                	"tokenid":$.cookie("tokenid"),
					"method":"updateDocuments",
					 "documentType":documentType,
					"documentLibary":"",
					 "documentId":""
					
                }
			}).done(this.proxy(function(response){
				
				if(response.code=="success"){
					// way.set("document.id",response.docId);	
					 documentType="newDocument";
					 docId=response.docId;
					 var value={"id":response.docId,"activityNumber":reportId,"type":"iosa_document_attach"};
					 this.attachDialog.open(value);
				}
				
			}));
    		
    	}else{
    		var value={"id":docId,"activityNumber":reportId,"type":"iosa_document_attach"};
    		this.attachDialog.open(value);
    	}
    	
    	
    },
    _deleteDocument:function(e){
    	var id=$(e.currentTarget).attr("data");
    	 $.each(documentList,this.proxy(function(index,item){
     		if(index==id){
     			var doctmentId=item.charpterId;
     			$("#deleteContent").html('您确定要删除文档:"'+item.reviewed+'"吗?');
     		this.deleteDialog= $('#deleteDialog').dialog({
    	   			width:600,
    	   			height:150,
    	   			title:"删除文档",
    	   	        position:[500,100],
    	   		});
    	   	 var dialogOptions = {
    	   			
    	   				buttons: [{
    	   	            text: "确定",
    	   				"class": "aui-button-link",
    	   				click: this.proxy(function () {
    	   					
    	   					$.u.ajax({
								url:$.u.config.constant.smsmodifyserver,
								type: "post",
				                dataType: "json",
								data:{
									"tokenid":$.cookie("tokenid"),
									"method":"stdcomponent.delete",
									"dataobject":"chapter",
									"dataobjectids":JSON.stringify([doctmentId])
								}
							},$("#deleteDialog")).done(this.proxy(function(response){
								 $('#deleteDialog').dialog("close");
								/** way.remove("documentList["+id+"]");
								$.each(way.get("documentList"),this.proxy(function(index,item){
									 $("#deleteDocument"+index).click(this.proxy(this._deleteDocument)) ;
									 this.qid("documentTable"+index).off("click","a.document").on("click","a.document",this.proxy(this._document));		  
								 }));*/
								 this. queryDocument(isarpId);
								 
							}))
    	   			 })},{
     	   	            text: "取消",
     	   	  			"class": "aui-button-link",
     	   	  			 click: function () {
     	   	  		     $('#deleteDialog').dialog("close");
     	   				}
    	   			 }]
    	   	 };
    	   	 this.deleteDialog.dialog("option",dialogOptions).dialog("open");
     		}
     	}));
    },
    queryDocument:function(id){
    	 $.u.ajax({
             url: $.u.config.constant.smsqueryserver,
              type:"post",
              dataType: "json",
              cache: false,
              data: {
            	  "tokenid":$.cookie("tokenid"),
   	       		  "method":"queryDocuments",
   	       		  "isarpId":id
              }
       },this.qid("div_Dialog")).done(this.proxy(function (data) {
    	    this.qid("documentTable").find("tbody").empty();
    	  // way.set("documentList",data.documents);
              if (data.success) {
            	  documentList=data.documents;
            	
            	 $.each(data.documents,this.proxy(function(index,item){
            	  this.qid("documentTable").find("tbody").append("<tr><td><a  href='#' class='document' data='"+index+"'>"+item.reviewed+"</a></td><td>"+item.acronyms+
            				  "</td><td>"+item.versionno+"</td><td>"+item.charpter+"</td><td>" +
            				  		"<span class=' document glyphicon glyphicon glyphicon-trash uui-cursor-pointer fl-minus del-file' data='"+index+"'></span></td>"+
            				  "</tr>");
               
            	//this.qid("documentTable"+index).off("click","a.document").on("click","a.document",this.proxy(this._document));		  
            	//$("#deleteDocument"+index).click(this.proxy(this._deleteDocument)) ;
            	  }))
            	  this.qid("documentTable").off("click","a.document").on("click","a.document",this.proxy(this._document));		  
            	 this.qid("documentTable").off("click","span.document").on("click","span.document",this.proxy(this._deleteDocument));		  
            	 //$("#deleteDocument"+index).click(this.proxy(this._deleteDocument)) ;
             //}
    	    
    	  // documentList=data.documents;
        }}));
    },
    queryAction:function(id){
    	 
   	 $.u.ajax({
            url: $.u.config.constant.smsqueryserver,
             type:"post",
             dataType: "json",
             cache: false,
             data: {
           	  "tokenid":$.cookie("tokenid"),
  	       		  "method":"queryActions",
  	       	      "rule":id
             }
      },this.qid("div_Dialog")).done(this.proxy(function (data) {
             if (data.success) {
             actionList=data.ActionList;
             this.qid("actionTable").find("tbody").empty();
           	  $.each(data.ActionList,this.proxy(function(index,item){
           		  var attach="";
           		  if(item.attach!=null){
           		  for(var j=0;j<item.attach.length;j++){
       				 var url="http://"+window.location.host+"/sms/query.do?"
     				 + "nologin=Y&method=downloadLosaFiles&fileId="+item.attach[j].id;
           			   attach+="<a href='"+url+"'>"+item.attach[j].attachShowName+"</a><br>" 
           			   		"<span class='glyphicon glyphicon glyphicon-trash uui-cursor-pointer fl-minus del-file'"+
                        "onclick=deleteAttach('"+j+"')></span><br>";
           		   }//for
           		 }//if
           		  
           		var shortTitle = item.title.replace(/<[^>].*?>/g,"");;
	     		var title = html2Escape(item.title);
	     		if(shortTitle.length > 40){
	     			 shortTitle = shortTitle.substr(0,40)+"...";
	     		 };
	     		
           		  this.qid("actionTable").find("tbody").append("<tr><td ><a type='button' class='actionText' title='<B>"+item.type+"</B>"+title+"' href='#' data='"+index+"'><B>"+item.type+"</B>"+shortTitle+"</a></td><td>"+item.auditDate+
           				  "</td><td>"+item.auditingAuditors+"</td><td>"+item.reports+"</td>"+
           				  "<td>"+attach+"</td><td>"+item.status+"</td></tr>");
           	  }))//each fuction
           	  this.qid("actionTable").off("click","a.actionText").on("click","a.actionText",this.proxy(this._action));
           	  $(".actionText").tooltip({
           		  html:true,
           		  track: true,
        		showURL: false,
        		delay: 1000,
        		top: 5,
        		left: 5});

            } //if
             
//            way.set("actionList",data.ActionList);
//            setTimeout(this.proxy(function(){
//            	
//                actionList=data.ActionList;
//                
//        	       for(var i=0;i<data.ActionList.length;i++){
//        	    	
//        	    	  // this.qid("actionTable"+i).off("click","a.action").on("click","a.action",this.proxy(this._action));
//        	    	   this.qid("actionTable"+i).find("a.action").click(this.proxy(this._action));
//        		   /**var subTitle = ""; var subReport="";
//        		 var title=data.ActionList[i].title; var report=data.ActionList[i].reports
//       	           if(title.length > 10){
//       	        	 subTitle = title.substr(0,10); 
//                     }
//        		       if(report.length > 10){
//        		    	subReport= report.substr(0,10); 
//                }
//        		document.getElementById("title"+i).innerHTML='<a href="#" class="action " data="'+i+'" title="'+title+'">' + subTitle + '...</a>';
//       	    document.getElementById("reports"+i).innerHTML='<span title="'+report+'">' + subReport + '...</span>';*/
//	     		var shortTitle = data.ActionList[i].title;
//	     		   if(data.ActionList[i].title.length > 30){
//	     			 shortTitle = data.ActionList[i].title.substr(0,30);
//	     		 };
//	     	                      
//	        		document.getElementById("action"+i).innerHTML="<div class='actionText' title='<B>"+data.ActionList[i].type+"</B>"+data.ActionList[i].title+"' style=''><B>"+ data.ActionList[i].type+"</B>"+ shortTitle+"...</div>";//;
//	        		 
//	        		  var attach="";
//	        		   if(data.ActionList[i].attach!=null){
//	        			   
//	        			   for(var j=0;j<data.ActionList[i].attach.length;j++){
//	        				 var url="http://"+window.location.host+"/sms/query.do?"
//	      					 + "nologin=Y&method=downloadLosaFiles&fileId="+data.ActionList[i].attach[j].id;
//	            			   attach+="<a href='"+url+"'>"+data.ActionList[i].attach[j].attachShowName+"</a><br>" 
//	            			   	"<span class='glyphicon glyphicon glyphicon-trash uui-cursor-pointer fl-minus del-file'"+
//	                         "onclick=deleteAttach('"+j+"')></span><br>";
//	            		   }
//	            		  // $("#attach"+i).val(attach)
//	        			  document.getElementById("attach"+i).innerHTML=attach;
//	        		     }
//	        		   
//	        	        }
//	        	         //way.set("actionList",data.ActionList);
//	        	    $(".actionText").tooltip({
//	            	 html:true,
//	            	 track: true,
//	         		showURL: false,
//	         		delay: 800,
//	         		top: 5,
//	         		left: 5});
//	//     		$('.actionText').on('mouseover', function(){
//	//     			var that = this;
//	//     			var tip = $(this).attr('tip');
//	//     			layer.tips(tip, that, {tips:4, area: ['380px']}); //在元素的事件回调体中，follow直接赋予this即可
//	//     		});           	
//            }), 500); //timeout
 
       }))
      }
}, { usehtm: true, usei18n: false });

com.eiosa.auditEdit.widgetjs = ['../../uui/widget/select2/js/select2.min.js',
                           '../../uui/widget/jqdatatable/js/jquery.dataTables.js',
                           "../../uui/widget/spin/spin.js", 
                           "../../uui/widget/jqblockui/jquery.blockUI.js",
                           "../../uui/widget/ajax/layoutajax.js",
                           //"../sms/losa/WdatePicker.js",
                           "../../uui/vendor/underscore.js",
                           "../../uui/vendor/underscore.json.js",
                           "../../uui/vendor/form2js.js",
                           "../../uui/vendor/js2form.js",
                           "../../uui/way.js",
                           "../../uui/vue.js",
                          "../sms/losa/losa.js",
                          "../../uui/tooltip/myTooltip.js",
                          "../../uui/util/htmlutil.js",
                           "base.js"];
com.eiosa.auditEdit.widgetcss = [{id:"",path:"../../uui/widget/select2/css/select2.css"},
                            {id:"",path:"../../uui/widget/select2/css/select2-bootstrap.css"},
                            { path: '../../uui/widget/jqdatatable/css/jquery.dataTables.css' }, 
                            { path: '../../uui/tooltip/jquery.tooltip.css' },
                            { path: '../../uui/widget/jqdatatable/css/dataTables.bootstrap.css' }];