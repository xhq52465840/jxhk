//@ sourceURL=com.eiosa.main
var reportList="";
var sectionId;
//var reportId=undefined;
var repDocType="";
var assessmentType="";
var sectionNames=undefined;
var reportDocumentList=[];
var documentId="";
var sectionDocVue;
var isarpvue;
$.u.load("com.eiosa.general");
//$.u.load("com.eiosa.reportList");
$.u.load("com.eiosa.logTable");
$.u.load("com.eiosa.uploadDialog");
$.u.load("com.eiosa.followMain");
$.u.load("com.eiosa.section.section");
$.u.load("com.eiosa.document.docList");
$.u.load("com.eiosa.audit.isarpsList");
$.u.load("com.eiosa.auditor.auditorList");

$.u.define('com.eiosa.main', null, {
   init:function(options){
	   this._options = options || null;
//	   this.reportId = this._options.reportId;
	   this.i18n = com.eiosa.main.i18n;
	   this.followMainUm = null;
	   this.docListUm = null;
	   this.isaListUm = null;
	   this.portalUm = null;
	   this.auditorListUm = null;
	   this.sectionMainUm = null;
	   this.isarpStatusChange = false;
	   this.reportId=null;
	   this.isarpQueryUm=null;
	   
	},
	afterrender:function(){
		$("#tab_portal").off('click').on('click',this.proxy(this._initPortalTab));	
		$("#tab_section").off('click').on('click',this.proxy(this._initSectionTab));	
		$("#tab_documents").off('click').on('click',this.proxy(this._initDocumentsTab));	
		$("#tab_isarps").off('click').on('click',this.proxy(this._initIsarpsTab));	
		$("#tab_auditors").off('click').on('click',this.proxy(this._initAuditorsTab));	
		$("#tab_follow").off('click').on('click',this.proxy(this._initFollowTab));	
		$("#tab_portal").click();

		this.tabVue=new Vue({
			el : '#myTab',
			data : {
				userRole:''
				
			}
		});
		this.isarpQueryUm=new Vue({
			el : '#isarp',
			data : {
				sectionName:'',
				conformity:''
				
			}
		});
		// 查询当前用户的角色
		this._queryUserRole();
		if(window.location.href.split("&")[1]=='isarp'){
			this.reportId=window.location.href.split("&")[0].split("=")[1];
			$('#myTab li:eq(4) a').tab('show').click();
		//	this._initIsarpsTab();
				
		}
       
	},
	_queryUserRole:function(){
		var data = {
				"method" : "getEiosaUsersRole",
			};
			myAjaxQuery(data, null, this.proxy(function(response){
				
				if (response.success) {
					this.tabVue.$set('userRole',response.data);
					//将用户角色添加到cookie里面，以供其他页面调用
					$.cookie('eiosaUserRole',response.data);
				} 
			}));
	},
	//打开isarp编辑页面
//	_auditEdit:function(e){
//		var id=$(e.currentTarget).attr("data");
//		var status=$(e.currentTarget).attr("data-data");
//		var seId=$(e.currentTarget).attr("sectionId");
//		this.isarpStatusChange=false;
//		layer.open({
//	        type: 2,
//	        title: 'ISARPs编辑',
//	        maxmin: false,
//	        fix:false,
//	        shadeClose: false, //点击遮罩关闭层
//	        area : ['1000px' , '600px'],
//	        content:encodeURI(encodeURI( "audit/auditEdit.html?id="+ id+"&sectionId="+seId+"&reportId="+this.reportId)),
//	        end:  this.proxy(function() {
//	        	
//	        	if (this.isarpStatusChange == true) this.sectionTable.fnDraw(true);
//	        }),
//	    });
//    },



    
    _changeToIsarp:function(e){
    	var i=$(e.currentTarget).attr("data");
    	var data=$(e.currentTarget).attr("data-data");
    	if(data!=null){
    		assessmentType=data;
    	}else{
    		assessmentType="";
    	}

			   $.each(way.get("section"),this.proxy(function(index,item){
		    		if(i==index){
		    		sectionId=item.id;
		    		
		    		$("#isarpSection").val(item.id);
		    		
		    		}
		    	}));

		 $("#tab_isarps").click();
     },
     
//    _changeToDocument:function(e){
//    	var id=$(e.currentTarget).attr("data");
//    	this._initDocumentsTab({sectionId: way.get("section")[id].id});
//    	$('#myTab li:eq(2) a').tab('show');
//    },
    
    
//    _log:function(){
//    	 this.isarpLogTable=new com.eiosa.logTable($("div[umid='isarpLogTable']", this.$),null);
//    	 this.reprotDialog= $('#logDialog').dialog({
//				width:1000,
//				height:500,
//				title:"Logs",
//				modal: true,
//		        draggable: false,
//		        resizable: false,
//		        autoOpen: false,
//		        position:[200,100]
//			});
//    	 var dialogOptions = {
//					buttons: [{
//		            text: "确定",
//					"class": "aui-button-link",
//					click: function () {
//						$('#logDialog').dialog("close");
//							
//		            }},
//		             {
//		            text: "取消",
//		  			"class": "aui-button-link",
//		  			click: function () {
//		  				$('#logDialog').dialog("close");
//				     }
//		        }
//			]
//			};
//    	 this.reprotDialog.dialog("option",dialogOptions).dialog("open");
//    	 
//    },

//    _changeDealer:function(e){
//    	  var id=$(e.currentTarget).attr("data");
//		   //添加onchange事件
//			var sectionId=$(e.currentTarget).attr("sectionId");
//			var dealerId=$("#isarpDeal"+id).val();
//			
//			var operateFlag=$(e.currentTarget).attr("taskId");
//            var isarpNo=$(e.currentTarget).attr("no");
//            
//            if(isarpNo.lenght>4){
//            	$("#changeContent").html("您确认将本项协调人变为新的协调人吗？")
//            }else{
//            	$("#changeContent").html("您确认将本项和其下级协调人同时变为新的协调人吗？")
//            }
//			this.changeAuditor= $('#changeAuditor').dialog({
//	   			width:400,
//	   			height:200,
//	   			title:"更改协调人",
//	   	        position:[500,100],
//	   		});
//	   	 var dialogOptions = {
//	   			
//	   				buttons: [{
//	   	            text: "确定",
//	   				"class": "aui-button-link",
//	   				click: this.proxy(function () {
//	   					
//	   					
//	   					$.u.ajax({
//							url:$.u.config.constant.smsmodifyserver,
//							type: "post",
//			                dataType: "json",
//							data:{
//								"tokenid":$.cookie("tokenid"),
//								"method":"addDealer",
//								"sectionId":sectionId,
//								"dealerId":dealerId,
//								"operateFlag":operateFlag,
//								"isarpId":id,
//								"isarpNo":isarpNo
//							}
//						},$("#iosaSection")).done(this.proxy(function(response){
//							if(response.code=="success"){
//							$.u.alert.success("保存成功");
//							$('#changeAuditor').dialog("close");
//							this.sectionTable.fnDraw(true);
//						}else{
//							$.u.alert.error("保存失败");
//						}
//						}));
//	   	            })},{
//	   	            text: "取消",
//	   	  			"class": "aui-button-link",
//	   	  			click: function () {
//	   	  		
//	   	  		     $('#changeAuditor').dialog("close");
//	   				}
//	   	            }
//	   		]
//	   		};
//	   	  this.changeAuditor.dialog("option",dialogOptions).dialog("open");
//	   
//    },

	_initPortalTab:function(e){
		if(this.portalUm != null) delete this.portalUm;
//		this.portalUm = new com.eiosa.reportList($("div[umid='reportList']",this.$),{}); 
		this.portalUm = new com.eiosa.general($("div[umid='general']",this.$),{}); 
	},
	_initSectionTab:function(e){
		if(this.sectionMainUm != null) delete this.sectionMainum;
		this.sectionMainUm = new com.eiosa.section.section($("div[umid='sectionMain']",this.$),{reportId :this.reportId}); 
	},
	

	
//	//加载section页面
//	_initSectionTab:function(e){
//		debugger		
//		 new com.eiosa.section.section($("div[umid='sectionMain']",this.$),{"reportId":this.reportId}); 
//	},
//	_initSectionTab:function(e){
//		
//		$("#section").load("section/section.html?");
//
//	},
	
	
	
//	_initIsarpsTab:function(e){
//		//给conformity赋值
//		this._initConformity();
//		
//    	//给专业赋值：
//		this._initSectionNames();
//		
//		
//		this.sectionStatus=this.qid("sectionStatus");
//		this.isarp=this.qid("isarp");
//		this.isarp.select2({ 
//       		tags: true,
//			 //placeholder: "ISARPs No.",
//	         //minimumInputLength: 1,
//			 ajax: {
//		         quietMillis: 1000,  //输入后迟延1秒再发送请求
//                url: $.u.config.constant.smsqueryserver,
//                dataType: "json",
//                type: "post",
//                data: this.proxy(function(term, page){
//                    return {
//                        tokenid: $.cookie("tokenid"),
//                        method: "queryIsarpNo",
//                        "no":term,
//                        "sectionId":$("#isarpSection").val()
//                    };
//                }),
//                results: this.proxy(function(response){
//                	
//                    if(response.success){
//                        return {
//                        	 "results": response.data
//                        }
//                    }
//                })
//                
//            },
//            id: function(item){
//                return item.noSort;
//            },
//            formatResult:function(item){
//              return item.no;
//            },
//            formatSelection:function(item){
//            	return item.no;
//            }
//		});
//		
//		this.qid("exportComformity").off("click").on("click",(this.proxy(function(){
//			/**$.ajax({
//				url: $.u.config.constant.smsqueryserver,
//	            type:"post",
//	            dataType: "json",
//	            cache: false,
//	            data: {
//	       		   "tokenid":$.cookie("tokenid"),
//	       		   "method":"exportReport",
//	            }
//		        
//			 })*/
//			alert("导出符合查询条件的Isarp列表");
//			
//		})));
//
//		//表格显示
//		if(this.sectionTable) {
//			this.sectionTable.fnDraw();
//		} else {
//			this._initIsarpsTable();
//		}
//		
//		
//		this.sectionTable.off("click","button.isarp").on("click","button.isarp",this.proxy(this._auditEdit));
//	    //this.sectionTable.off("click","button.log").on("click","button.log",this.proxy(this._log));
//	    this.sectionTable.off("change","select.selectDealer").on("change","select.selectDealer",this.proxy(this._changeDealer));
//		//this.logTable=new com.eiosa.logTable($("div[umid='logTable']", this.$),null);
//		//this.addDocAttach=this.qid("addDocAttach");
// 		//$("#addDocAttach").click(this.proxy(this._addDocAttach));
//		$("#searchSection").off("click").on("click",(this.proxy(function(){
//			 assessmentType="";
//			
//			 this.sectionTable.fnDraw();
//		})));
//		this.qid("resetSection").off("click").on("click",(this.proxy(function(){
//			$("#isarpSection").val("");
//			this.qid("isarp").select2("data", null);
//			this.qid("sectionStatus").val("");
//			$("#conformity").val("");
//			$("#showMine").attr("checked",false);
//			
//		})));
//
//	}, //_initIsarpsTab
//	_initConformity:function(){
//		var data = {
//				"method":"stdcomponent.getbysearch",
//	       		   "dataobject":"assessments",
//	       		   "columns":JSON.stringify([{"data":"id"}]),
//	    		   "order":JSON.stringify([{"column":0,"dir":"asc"}])
//				
//			};
//		myAjaxQuery(data, $("#isarp"), this.proxy(function(response) {
//				if (response.success) {
//					this.isarpQueryUm.$set("conformity",response.data.aaData);
//				}
//		})); 
//	},
//	_initSectionNames:function(e){
//			var data = {
//					"method" : "getSectionName",
//					"reportId" : $.cookie('workReportId')
//					
//				};
//			myAjaxQuery(data, $("#isarp"), this.proxy(function(response) {
//					if (response.success) {
//					this.isarpQueryUm.$set("sectionName",response.data)
//					}
//			})); 
//		
//	},
//	_initIsarpsTable:function(e){
//		//sectionTable 部分功能
//		this.sectionTable=this.qid("iosaSection").dataTable({
//			searching: false,
//	        serverSide: true,
//	        bProcessing: true,
//	        bPaginate: true,  //是否分页。
//	        ordering: false,
//	        "columns": [
//	                    { "title": "专业", "mData":"sectionName","sWidth": 50 ,"sClass":"center"},
//	                    { "title": "ISARPs", "mData":"no", "sWidth": 50,"sClass":"center"},
//	                    { "title": "协调人", "mData":"dealer", "sWidth": 50,"sClass":"center" },
//	                    { "title": "Text", "mData":"text", "sWidth": 250,"sClass":"center"},
//	                    { "title": "Conformity", "mData":"conformity", "sWidth":80,"sClass":"center" },
//	                    { "title": "FinishStatus", "sWidth": 500, "sWidth":80,"sClass":"center" },
//	                    { "title": "FlowStatus", "mData":"status", "sWidth": 80,"sClass":"center" },
//	                    //{ "title": "Log",  "sWidth": 100,"sClass":"center" },
//	                ],
//	        "oLanguage": { //语言
//	        	   "sSearch": this.i18n.search,
//                   "sLengthMenu": this.i18n.everPage+" _MENU_ "+this.i18n.record,
//                   "sZeroRecords": this.i18n.message,
//                   "sInfo": this.i18n.from+" _START_ "+this.i18n.to+" _END_ /"+this.i18n.all+" _TOTAL_ "+this.i18n.allData,
//                   "sInfoEmpty": this.i18n.withoutData,
//                   "sInfoFiltered": "("+this.i18n.fromAll+"_MAX_"+this.i18n.filterRecord+")",
//                   "sProcessing": ""+this.i18n.searching+"...",
//                   "oPaginate": {
//                   "sFirst": "<<",
//                   "sPrevious": this.i18n.back,
//                   "sNext": this.i18n.next,
//                   "sLast": ">>"
//	                    }
//	                },
//	       "aoColumnDefs":[
//                
//	               {
//	            	   "aTargets": 0,
//		               "mRender": function (data, type, full) {
//		                if(full.no.length>4){
//		                     var htmls=data;
//		                     return htmls;
//		                }else if(full.no.length==1||full.no.length==2){
//		                	 htmls=[ '<B  style=" font-size:20px;">'+data+'</B>'];      
//		                	return htmls;
//		                }else if(full.no.length==3||full.no.length==4){
//		                	htmls=[ '<B  style="font-size:15px;">'+data+'</B>'];      
//		                	return htmls;
//		                }
//		                                                    
//		                 } 
//	            	   
//	               },{
//	            	   "aTargets": 1,
//		               "mRender": function (data, type, full) {
//		                if(full.no.length>4){
//		                     var htmls=[ '<button type="button" class="btn btn-link isarp" data='+full.isarpId+' sectionId='+full.sectionId+' data-data='+full.status+'>'+data+'</button>'];           
//		                     return htmls;
//		                }else if(full.no.length==1||full.no.length==2){
//		                	 htmls=[ '<B  style="font-size:20px;">'+data+'</B>'];      
//		                	return htmls;
//		                }else if(full.no.length==3||full.no.length==4){
//		                	htmls=[ '<B  style="font-size:15px;">'+data+'</B>'];      
//		                	return htmls;
//		                }
//		                                                    
//		                 } 
//	            	   
//	               },{
//	            	   "aTargets": 6,
//		               "mRender": function (data, type, full) {
//		                if(full.no.length>4){
//		                     var htmls=data;
//		                     return htmls;
//		                }else if(full.no.length==1||full.no.length==2){
//		                	 htmls=[ '<B  style="font-size:20px;">'+data+'</B>'];      
//		                	return htmls;
//		                }else if(full.no.length==3||full.no.length==4){
//		                	htmls=[ '<B  style="font-size:15px;">'+data+'</B>'];      
//		                	return htmls;
//		                }
//		                                                    
//		                 } 
//	            	   
//	               },{
//	            	   "aTargets": 5,
//		               "mRender": function (data, type, full) {
//		                if(full.no.length>4){
//		                	 htmls="<table class=' table table-striped table-bordered'><tr style=' background-color:#f5f5f7;border:none; margin:none;'><td style='border:none; margin:none;'>AA:</td><td style='border:none; margin:none;'><font color='#008000'>"+full.aaFinish+"/"+full.aaCount+"</font></td><td style='border:none; margin:none;'><font color='#008000'>"+full.aaPercent+"</font></td></tr></table>";
//		                     
//		                     return htmls;
//		                }else if(full.no.length==1||full.no.length==2){
//		                	// htmls=[ '<B  style="font-size:20px;">ISARP: <font color="#008000">'+full.isarpFinish+'/'+full.isarpCount+';'+full.isarpPercent+'</font></B><br></br>'];      
//		                	//htmls+=[ '<B  style="font-size:20px;">AA: <font color="#008000">'+full.aaFinish+'/'+full.aaCount+';'+full.aaPercent+'</font></B>'];      
//		                	 htmls="<table class=' table table-striped table-bordered'><tr style=' background-color:#f5f5f7'><td style='border:none; margin:none;'><B  style='font-size:20px;'>ISARP:</B></td><td style='border:none; margin:none;'><B  style='font-size:20px;'><font color='#008000'>"+full.isarpFinish+"/"+full.isarpCount+"</font></B></td><td style='border:none; margin:none;'><B  style='font-size:20px;'><font color='#008000'>"+full.isarpPercent+"</font></B></td></tr>"+
//		                	 //"<tr style=' background-color:#f5f5f7'><td style='border:none; margin:none;'><B  style='font-size:20px;'>ISARP-N:</B></td><td style='border:none; margin:none;'><B  style='font-size:20px;'><font color='#008000'>"+full.isaFinish+"/"+full.isaCount+"</font></B></td><td style='border:none; margin:none;'><B  style='font-size:20px;'><font color='#008000'>"+full.isaPercent+"</font></B></td></tr>"+
//		                	 "<tr style=' background-color:#f5f5f7'><td style='border:none; margin:none;'><B  style='font-size:20px;'>AA:</B></td><td style='border:none; margin:none;'><B  style='font-size:20px;'><font color='#008000'>"+full.aaFinish+"/"+full.aaCount+"</font></B></td><td style='border:none; margin:none;'><B  style='font-size:20px;'><font color='#008000'>"+full.aaPercent+"</font></B></td></tr></table>";
//		                	return htmls;
//		                }else if(full.no.length==3||full.no.length==4){
//		                	
//		                	 htmls="<table class=' table table-striped table-bordered'><tr style=' background-color:#f5f5f7'><td style='border:none; margin:none;'><B  style='font-size:15px;'>ISARP:</B></td><td style='border:none; margin:none;'><B  style='font-size:15px;'><font color='#008000'>"+full.isarpFinish+"/"+full.isarpCount+"</font></B></td><td style='border:none; margin:none;'><B  style='font-size:15px;'><font color='#008000'>"+full.isarpPercent+"</font></B></td></tr>"+
//		                	// "<tr style=' background-color:#f5f5f7'><td style='border:none; margin:none;'><B  style='font-size:15px;'>ISARP-N:</B></td><td style='border:none; margin:none;'><B  style='font-size:15px;'><font color='#008000'>"+full.isaFinish+"/"+full.isaCount+"</font></B></td><td style='border:none; margin:none;'><B  style='font-size:15px;'><font color='#008000'>"+full.isaPercent+"</font></B></td></tr>"+		                	 
//		                	 "<tr style=' background-color:#f5f5f7'><td style='border:none; margin:none;'><B  style='font-size:15px;'>AA:</B></td><td style='border:none; margin:none;'><B  style='font-size:15px;'><font color='#008000'>"+full.aaFinish+"/"+full.aaCount+"</font></B></td><td style='border:none; margin:none;'><B  style='font-size:15px;'><font color='#008000'>"+full.aaPercent+"</font></B></td></tr></table>";
//		                	return htmls;
//		                }
//		                                                    
//		                 } 
//	            	   
//	               },
//	               {
//	            	   "aTargets": 3,
//		               "mRender": function (data, type, full) {
//		                 var shortTitle = data.replace(/<[^>].*?>/g,"");
//		                 var title = html2Escape(data);
//		                 var html = "";
//		            	 if(shortTitle.length > 80){
//		            		  shortTitle = shortTitle.substr(0,80)+"...";
//		                 };
//	                     
//		            	// html = '<span title="'+data+'">' + a + '...</span>';
//		                if(full.no.length>4){
//		                   //  var htmls=data; 
//		                     
//		                    // return  '<span  title=<p>'+data+'</p>>' + a + '...</span>';
//		                	html="<div class='isarpText' data-toggle='tooltip' data-placement='right' data-html='true'  title='"+title+"'>"+shortTitle+"...<div>";
//		                	
//		           		    
//		                	return html;
//		                }else if(full.no.length==1||full.no.length==2){
//		                	 htmls=[ '<B   style="font-size:20px;">'+data+'</B>'];      
//		                	return htmls;
//		                }else if(full.no.length==3||full.no.length==4){
//		                	htmls=[ '<B  style="font-size:15px;">'+data+'</B>'];      
//		                	return htmls;
//		                }
//		                
//		               }                                     
//	               },
//	               {
//	            	   "aTargets": 2,
//		               "mRender": function (data, type, full) {
//		                 /**var a = "", html = "";
//		            	   if(data.length > 20){
//		                	 a = data.substr(0,20);
//		                 }
//		            	   html = '<span title="'+data+'">' + a + '...</span>';
//		            	   return html;*/
//		            	  
//		            	   var id="isarpDeal"+full.isarpId;
//		            	   var html="";
//		            	   if(full.userrole!="auditor"){
//		            		   html="<select class='selectDealer' style='width:130px' id="+id+" data="+full.isarpId+" sectionId="+full.sectionId+
//		            	   		" taskId="+full.taskId+" no="+full.no+"></select> ";
//		            	   }else{
//		            		   html="<select class='selectDealer' style='width:130px;'  id="+id+" data="+full.isarpId+" sectionId="+full.sectionId+
//		            	   		" taskId="+full.taskId+" no="+full.no+" disabled='true' ></select> ";
//		            	   }
//		            	  
//		                   //$("#"+id).empty();
//		            	  // addRoot(full.auditors,id,data);//给select 赋值
//		            	   return html;
//		                                                    
//		                 } 
//	            	   
//	               }
//	               /**,{
//	                  "aTargets": 7,
//	                  "mRender": function (data, type, full) {
//	                	  var log="";
//	                	 
//	                	if(full.receiver=="" &&full.creater!="" ){
//	                	   log=full.created+" "+full.creater+"发送消息："+"<br>'" +full.descoperate+"'";            
//	                	}else if(full.receiver!=""){
//	                	   log=full.created+" "+full.creater+"发送消息："+"<br>'" +full.descoperate+"'<br>予:"+full.receiver;             
//	                	}
//	                  
//	                   var htmls=[ '<button type="button" class="btn btn-link log">'+log+'</button>'];
//	                                    
//	                       return htmls;
//	                                                    
//	                 }
//	                    }*/
//	                ],
//	       "fnServerParams":this.proxy(function (aoData) {
//	        	           var rule=[];
//	        	           var showMine="";
//	        	           if(document.getElementById("showMine").checked){
//	        	        	   showMine="on"
//	        	           }else{
//	        	        	   showMine="off"
//	        	           }
//	        	           rule.push(
//	        	                      {
//	        	                       "sectionName":$("#isarpSection").val(),
//	        	                       "isarp":this.isarp.val(),
//	        	                       "status":this.sectionStatus.val(),
//	        	                       "conformity":$("#conformity").val(),
//	        	                       "showMine":showMine,
//	        	                       "assessmentType":assessmentType,
//	        	                       "reportId":this.reportId
//	        	                      }
//	        	                  );     
//	        	            	 //将上面的参数合并到aoData中
//	      $.extend(aoData,{
//	        	              "tokenid":$.cookie("tokenid"),
//	        	              "method":"querySection",
//	                 		  "rule": JSON.stringify(rule),
//	                 		  "columns": JSON.stringify( [{"data":"created"}] ),
//	                           "order": JSON.stringify( [{"column":0, "dir": "desc"}] ),
//	                 		  "search": JSON.stringify(aoData.search),
//	                 		 
//	        	              },true);
//	        	         }), 
//	      "fnServerData": this.proxy(function (sSource, aoData, fnCallBack, oSettings) {
//		                
//	    	             $.u.ajax({
//		                     url: $.u.config.constant.smsqueryserver,
//		                        type:"post",
//		                        dataType: "json",
//		                        cache: false,
//		                        data: aoData
//		                    },this.qid("iosaSection")).done(this.proxy(function (data) {
//		                    	if (data.success) {
//		                    	
//		                         fnCallBack(data.data.SectionList);
//		                         //对select进行赋值
//		                         for(var i=0;i<data.data.SectionList.aaData.length;i++){
//		                        	 var id="isarpDeal"+data.data.SectionList.aaData[i].isarpId;
//		
//		  		                     $("#"+id).empty();
//		  		            	     addRoot(data.data.SectionList.aaData[i].auditors,id,data.data.SectionList.aaData[i].dealer);//给select 赋值
//		  		            	 
//		                         }
//		                         $(".isarpText").tooltip({
//		                        	 html:true,
//		                        	 track: true,
//		                     		showURL: false,
//		                     		delay: 1000,
//		                     		top: 5,
//		                     		left: 5});
////				                	$('.isarpText').on('mouseover', function(){
////				                	    var that = this;
////				                	    var tip = $(this).attr('tip');
////				                	    layer.tips(tip, that, {tips:4, area: ['380px']}); //在元素的事件回调体中，follow直接赋予this即可
////				                	});
//
//		                     }else{
//		                    	 $.u.alert.error("没有符合查询条件的数据项");
//		                    	 
//		                     }
//		                    })).fail(this.proxy(function (jqXHR, errorText, errorThrown) {
//		                    	
//		                    }))
//		                })
//		});		
//	}, //_initIsarpsTable

	_initDocumentsTab:function(params){	    
		var newParam = $.extend({reportId :this.reportId}, params || {})
		if(this.docListUm != null) delete this.docListUm;
		this.docListUm = new com.eiosa.document.docList($("div[umid='docList']",this.$), newParam);
	},
	
	_initFollowTab:function(e){
		if(this.followMainUm != null) delete this.followMainUm;
		this.followMainUm = new com.eiosa.followMain($("div[umid='followMain']",this.$),{reportId :this.reportId}); 
	},
	
	
	_initAuditorsTab:function(params){
		if(this.auditorListUm != null) delete this.auditorListUm;
		this.auditorListUm = new com.eiosa.auditor.auditorList($("div[umid='auditorList']",this.$), {reportId :this.reportId});
	},
	
	_initIsarpsTab:function(params){	    
		var newParam = $.extend({reportId :this.reportId}, params || {})
		if(this.isaListUm != null) delete this.isaListUm;
		this.isaListUm = new com.eiosa.audit.isarpsList($("div[umid='isarpsList']",this.$), newParam);
	},
	

}, { usehtm: true, usei18n: true});



com.eiosa.main.widgetjs = ['../../uui/widget/select2/js/select2.min.js',
							  '../../uui/widget/spin/spin.js',
   							  '../../uui/widget/jqblockui/jquery.blockUI.js',
   							  '../../uui/widget/ajax/layoutajax.js',
   							  '../../uui/widget/validation/jquery.validate.js',
                           "../../uui/vendor/underscore.js",
                           "../../uui/vendor/underscore.json.js",
                           "../../uui/vendor/form2js.js",
                          
                           "../../uui/vendor/js2form.js",
                           "../sms/losa/losa.js",
                           "../../uui/way.js",
                           "base.js",
                           "../../uui/vue.min.js",
                           "../../uui/tooltip/myTooltip.js",
                           "../../uui/util/htmlutil.js",
                           //"../../uui/sorttable/sorttable.js",
                           "../../uui/async/async.min.js",
                           "../sms/dash/echarts/js/echarts.js"
                           ];
com.eiosa.main.widgetcss = [{ path: "../../uui/widget/select2/css/select2.css"},
                            {id:"",path:"../../uui/widget/select2/css/select2-bootstrap.css"},
                            { path: '../../uui/widget/jqdatatable/css/jquery.dataTables.css' },
                            { path: '../../uui/tooltip/jquery.tooltip.css' },
                            //{ path: '../../uui/sorttable/sorttable.css' },
                    
                            { path: "../../css/eiosa.css" },
                            { path: '../../uui/widget/jqdatatable/css/dataTables.bootstrap.css' }];

