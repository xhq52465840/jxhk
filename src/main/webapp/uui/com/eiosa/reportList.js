$.u.load("com.eiosa.reportDetail");
$.u.load('com.eiosa.reportExportDialog');
$.u.load('com.eiosa.section.section');
$.u.define('com.eiosa.reportList', null, {
	init : function(options) {
		this._options = options || null;
		this.reportDetailUm = null;
		this.reportExportDialogUm = null;
		this.reportList = null;
		this.i18n = com.eiosa.reportList.i18n;
		this.reportId=this._options.reportId;
	},
	afterrender : function() {
		Vue.filter('datestr', function(value) {
			var date = new Date(value);
			if ( isNaN(date)==true ) return value;
			return date.format("yyyy-MM-dd");
		});
		this.reportvue = new Vue({
			el : '#report',
			data : {				
				reportList : '',
				reportQueryForm : {
					repNo :'' ,repDate : '',repDateto : '',repStatus : '',
				},
				pagebarsVue:{
					all : 0, // 总条数
					cur : 1,// 当前页码
					start : 0,//当前条数
					length : 10,// 单页条数
				},
			    options: [
		      		      { id: 0, text: '' },
		      		    ],
      		    orders:{
					sortby : '', // 排序字段
					sortorders : 'asc',// 排序方式
				}, 

			},
			

		   methods :{
			   reportSearch:this.proxy(this._reportSearch),
			   searchClick: this.proxy(this._search),
			   reset: this.proxy(this._reset),
			   page : this.proxy(this._reportSearch),
			   noClick: this.proxy(this._queryReportNo),
			   showReport1: this.proxy(this._showReport1),
		   },
		});		
	

		this._queryReportNo();
		this._reportSearch();		
//		this.reprotNo=this.qid("reprotNo");
//		this.reprotNo.select2({ 
//			tokenSeparators:[',', ' '],
//			placeholder: "请输入",
//			allowClear: true,
//       		 
//			 ajax: {
//                url: $.u.config.constant.smsqueryserver,
//                dataType: "json",
//                type: "post",
//                data: this.proxy(function(term, page){
//                    return {
//                        tokenid: $.cookie("tokenid"),
//                        method: "stdcomponent.getbysearch",
//                        "dataobject": "eiosaReprot",
//                        "rule":JSON.stringify([[{"key":"libType","value":parseInt(2)}],
//                                               [{"key":"repNO","value":term,"op":"like"}]])
//                    };
//                }),
//                results: this.proxy(function(response){
//                	
//                    if(response.success){
//                        return {
//                        	 "results": response.data.aaData
//                        }
//                    }
//                })
//                
//            },
//            id: function(item){
//                return item.repNO;
//            },
//
//            formatResult:function(item){
//              return item.repNO;
//            	
//            	
//            },
//            formatSelection:function(item){
//            	return item.repNO;
//            }
//		});
		
		
		this.reportDate=this.qid("reportDate");
		this.reportDate.datepicker({"dateFormat":"yy-mm-dd", constrainInput:true});
		
		this.reportDateTo=this.qid("reportDateTo");
		this.reportDateTo.datepicker({"dateFormat":"yy-mm-dd", constrainInput:true});
		this.reportStatus=this.qid("reportStatus");
//
//
//		this.search=this.qid("search");
//		this.reset=this.qid("reset");
		
		//首页的表格显示
//		if(this.dataTable) {
//			this.dataTable.fnDraw();
//		} else {
//			this._initReportDatatable();
//		}
		
		
//		this.dataTable.off("click", "button.report").on("click", "button.report",
//				this.proxy(this._showReport1)
//		);	
//		this.dataTable.off("click", "button.section").on("click", "button.section", this.proxy(this._changeToSection));
//		this.dataTable.off("click", "button.export").on("click", "button.export", this.proxy(this._openExport));
//		this.search.off("click").on("click",(this.proxy(function () {
//		      this.dataTable.fnDraw();
//		 })));
//		this.reset.off("click").on("click",(this.proxy(function(){
//			
//			 this.reprotNo.select2("data", null);
// 	         this.reportDate.val("");
// 	         this.reportStatus.val("");
// 	         this.reportDateTo.val("");
// 	                 
//		})));
		
	},
	
	_search : function() {
		this.reportvue.$set("pagebarsVue.cur",1);
		this.reportvue.$set("pagebarsVue.start",0);
		this._reportSearch();

},

    _reportSearch : function() {
			var data = {
				"method" : "queryReport",
//				"reportId" : this.reportId,
				"reportQueryForm": JSON.stringify(this.reportvue.reportQueryForm),
				"start" :  this.reportvue.pagebarsVue.start,
				"length" : this.reportvue.pagebarsVue.length,
				"sortby" : this.reportvue.orders.sortby,
				"sortorders" : this.reportvue.orders.sortorders,
			};
			debugger
			myAjaxQuery(data, $("#report"),this.proxy(function(response) {
				if (response.success) {
					this.reportvue.$set("reportList", response.data.aaData);
				    this.reportvue.$set("pagebarsVue.all",response.data.iTotalRecords);
				   
				}
			}));
		
			
	},
	_queryReportNo:function(){
		var data = {
			  tokenid: $.cookie("tokenid"),
              method: "queryReport",
              "reportQueryForm": JSON.stringify(this.reportvue.reportQueryForm),
		};
		myAjaxQuery(data, null, this.proxy(function(param, response) {
			if (param.success) {
				var array = new Array();
				$.each(param.data.aaData,function(index,value){
					var obj = new Object();
					obj.id = value.id;
					obj.text = value.repNo;
					array.push(obj);
				})
				this.reportvue.$set("options", array);
				}
		})); 		
	},
	
	_reset : function() {
		debugger
		this.reportvue.reportQueryForm.repNo.val("");
		this.reportvue.$set("reportQueryForm.repStatus","");
         this.reportStatus.val("");
         this.reportDateTo.val("");
	},

//	_initReportDatatable:function(e){
//		this.dataTable = this.qid("iosaReport").dataTable({
//			searching: false,
//            serverSide: true,
//            bProcessing: true,
//            bPaginate: true,  //是否分页。
//            ordering: false,
//            "columns": [
//                        { "title": "No", "mData":"repNO","sWidth": 80 ,"sClass":"center" },
//                        { "title": "Title", "mData":"title","sWidth": 150,"sClass":"center" },
//                        { "title": "Date", "mData":"repDate", "sWidth": 80,"sClass":"center"},
//                        { "title": "Status", "mData":"repStatus", "sWidth": 80,"sClass":"center"  },
//                        { "title": "", "mData":"", "sWidth": 50,"sClass":"center"  },
//                       
//                    ],
//                    "oLanguage": { //语言
//     	        	   "sSearch": this.i18n.search,
//                        "sLengthMenu": this.i18n.everPage+" _MENU_ "+this.i18n.record,
//                        "sZeroRecords": this.i18n.message,
//                        "sInfo": this.i18n.from+" _START_ "+this.i18n.to+" _END_ /"+this.i18n.all+" _TOTAL_ "+this.i18n.allData,
//                        "sInfoEmpty": this.i18n.withoutData,
//                        "sInfoFiltered": "("+this.i18n.fromAll+"_MAX_"+this.i18n.filterRecord+")",
//                        "sProcessing": ""+this.i18n.searching+"...",
//                        "oPaginate": {
//                        "sFirst": "<<",
//                        "sPrevious": this.i18n.back,
//                        "sNext": this.i18n.next,
//                        "sLast": ">>"
//     	                    }
//     	                },
//            "aoColumnDefs":[
//                  {
//                      "aTargets": 3,
//                       "mRender": function (data, type, full) {
//            	               
//                       var htmls=[ '<button type="button" class="btn btn-link section" data='+full.id+'>'+data||""+'</button>' ];
//                      
//                       return htmls;
//                                      
//                         }
//                    },
//                  {
//                      "aTargets": 4,
//                       "mRender": function (data, type, full) {
////                       var htmls=[ '<button type="button" class="btn btn-link export" data='+full.id+'>'+"导出审计报告"+'</button>' ];
//                       var htmls=[ '' ];
//                       return htmls;
//                       }
//                    },
//                    {
//                       "aTargets": 0,
//                       "mRender": function (data, type, full) {
//    	                   
//                           var htmls=['<button type="button" class="btn btn-link report" data='+full.id+'>'+data+'</button>'];
//                          
//                           return htmls;
//                                          
//                             }
//                            	  
//                  }
//              ],
//            "fnServerParams":this.proxy(function (aoData) {
//       	           var rule=[];
//       	            	
//       	           rule.push([{"key":"repNO","value":this.reprotNo.val()}],
//       	                      [{"key":"repDate","value":this.reportDate.val()}],
//       	                      [{"key":"repStatus","value":this.reportStatus.val()}],
//       	                      [{"key":"libType","value":parseInt(2)}],
//       	                      [{"key":"repDate","value":this.reportDateTo.val()}]
//       	                  );      
//       	            	 //将上面的参数合并到aoData中
//       	              	$.extend(aoData,{
//       	              		"tokenid":$.cookie("tokenid"),
//       	              		"method":"stdcomponent.getbysearch",
//       	              	    "dataobject": "eiosaReprot",
//                		    "rule": JSON.stringify(rule),
//                		    "columns": JSON.stringify( [{"data":"created"}] ),
//                            "order": JSON.stringify( [{"column":0, "dir": "desc"}] ),
//                		    "search": JSON.stringify(aoData.search)
//       	              	},true);
//       	              }), 
//       	              //查询方法
//       	                "fnServerData": this.proxy(function (sSource, aoData, fnCallBack, oSettings) {
//       	                	
//       	                $.u.ajax({
//       	                        url: $.u.config.constant.smsqueryserver,
//       	                        type:"post",
//       	                        dataType: "json",
//       	                        cache: false,
//       	                        data: aoData
//       	                    },
//       	                  this.qid("iosaReport")).done(
//       	                  this.proxy(function (data) {
//       	                    	if (data.success) {
//       	                    		this.reportList=data.data.aaData;
//									
//          	                         //得到第一个report的id，作为默认工作的report
//       	                    		var reportId = eiosaMainUm.reportId;
//									 if(reportId==null || isNaN(reportId) ) {
//										 if($.cookie('workReportId')==null || isNaN($.cookie('workReportId')) ) {
//											 eiosaMainUm.reportId = this.reportList[0].id;
//											$.cookie('workReportId',eiosaMainUm.reportId);
//										 } else {
//											 eiosaMainUm.reportId = $.cookie('workReportId');
//										 }
//          	                        }
//          	                         //this._initSectionNames(); //TODO:以后不同功能页面的sectionnames加载要分开
//
//          	                         
//       	                         fnCallBack(data.data);
//       	                       
//       	                     }
//       	                    })).fail(this.proxy(function (jqXHR, errorText, errorThrown) {
//
//       	                    }))
//       	                })
//       	           
//			
//		});
//	}, //_initReportDatatable
	
	
	_initSectionNames:function(e){
		if(sectionNames) {
			$("#isarpSection").empty();
			addRoot(sectionNames,"isarpSection",null);
		} else {
			$.ajax({
				  url: $.u.config.constant.smsqueryserver,
			   type:"post",
			   dataType: "json",
			   cache: false,
			   data: {
				  "tokenid":$.cookie("tokenid"),
					  "method":"getSectionName",
					  "reportId":eiosaMainUm.reportId
			   }
			}).done(function(response){
				if(response.success){
					sectionNames=response.data;
					addRoot(sectionNames,"isarpSection",null);//给select 赋值
					//addRoot(response.data,"docSection",null);//给select 赋值
					//addRoot(response.data,"auditorSection",null);//给select 赋值
				}
			});
		}
	},
	
    _changeToSection:function(e){
    	eiosaMainUm.reportId=$(e.currentTarget).attr("data");
		$.cookie('workReportId',eiosaMainUm.reportId);
		
    	 $('#myTab li:eq(1) a').tab('show');//显示哪个tab
    	// new com.eiosa.section.section($("div[umid='sectionTab']",this.$),{reportId :$.cookie("workReportId")});
 		
    	// $("#section").load("section/section.html"); //TODO 使用uui的loader，去除html
    	// $("#section").load($("div[umid='sectionTab']",this.$));
    	 $("#tab_section").click();	
    	 layer.close(this.myLayerIndex);
    	//this._querySection(eiosaMainUm.reportId);
    	//$(".date").datepicker({"dateFormat":"yy-mm-dd", constrainInput:true});
    },
    
    _openExport :function(e){
//    	var reportId = $(e.currentTarget).attr("data");
//    	
//		if(this.reportExportDialogUm != null) delete this.reportExportDialogUm;
//		this.reportExportDialogUm = new com.eiosa.reportExportDialog($("div[umid='reportExportDialog']",this.$),{reportId: eiosaMainUm.reportId});
//
//		var layerindex = layer.open({
//	        type: 1,
//	        title: 'EIOSA报告导出',
//	        maxmin: false,
//	        fix: false,
//	        zIndex : 20, //不能太高，免得附件窗口被遮挡
//	        shadeClose: false, //点击遮罩关闭层
//	        area : ['800px' , '520px'],
//	        content: $("div[umid='reportExportDialog']",this.$),
//	    });
//		this.reportExportDialogUm.myLayerIndex = layerindex;
    },
    
    _showReport1:function(e){
//    	eiosaMainUm.reportId = $(e.currentTarget).attr("data");
//        $.cookie('workReportId',eiosaMainUm.reportId);
debugger
         var reportId=$(e.currentTarget).attr("data");
		if(this.reportDetailUm != null) delete this.reportDetailUm;
		this.reportDetailUm = new com.eiosa.reportDetail($("div[umid='reportDetail2']",eiosaMainUm.$),{id:reportId});
		var layerindex = layer.open({
	        type: 1,
	        title: 'EIOSA报告详细信息',
	        maxmin: false,
	        fix: false,
	        zIndex : 20, //不能太高，免得附件窗口被遮挡
	        shadeClose: false, //点击遮罩关闭层
	        area : ['800px' , '520px'],
	        content: $("div[umid='reportDetail2']",eiosaMainUm.$),
	        end:  this.proxy(function() {
	        	//if (this.sectionDocVue.child_modified == true) this._queryReportDocument();
	        }),
	    });
		this.reportDetailUm.myLayerIndex = layerindex;
		 layer.close(this.myLayerIndex);
	},
	
//	_querySection:function(id){
//   	 $.u.ajax({
//		    url:$.u.config.constant.smsqueryserver,
//				type: "post",
//            dataType: "json",
//            data: {
//        	   "tokenid":$.cookie("tokenid"),
//        	   "method":"querySection",
//        	   "reportId":id
//             }
//			},$("#section")).done(this.proxy(function(response){
//				if(response.success){
//					
//					way.set("section",response.data.SectionList.aaData);
//					var data=response.data.SectionList.aaData;
//					$(".date").datepicker({"dateFormat":"yy-mm-dd", constrainInput:true});
//					//给select 赋值
//					 	for(var i=0;i<data.length;i++){
//						this.qid("sectionTable"+i).off("click","a.section").on("click","a.section",this.proxy(this._changeToIsarp));
//						this.qid("sectionTable"+i).off("click","a.document").on("click","a.document",this.proxy(this._changeToDocument));
//						htmls="<table class=' table table-striped table-bordered'><tr style=' background-color:#f5f5f7'><td style='border:none; margin:none;'>ISARP:</td><td style='border:none; margin:none;'><font color='#008000'>"+data[i].isarpFinish+"/"+data[i].isarpCount+"</font></td><td style='border:none; margin:none;'><font color='#008000'>"+data[i].isarpPercent+"</font></td></tr>"+
//	                	 "<tr style=' background-color:#f5f5f7'><td style='border:none; margin:none;'>AA:</td><td style='border:none; margin:none;'><font color='#008000'>"+data[i].aaFinish+"/"+data[i].aaCount+"</font></td><td style='border:none; margin:none;'><font color='#008000'>"+data[i].aaPercent+"</font></td></tr></table>";
//	                	$("#finishStatus"+i).html(htmls);
//	                	$("#startDate"+i).datepicker({"dateFormat":"yy-mm-dd", constrainInput:true});
//	                	$("#endDate"+i).datepicker({"dateFormat":"yy-mm-dd", constrainInput:true});
//						if(data[i].auditors!=null){
//							
//							//给开始日期和结束日期添加保存事件
//							
//							$("#startDate"+i).blur(function(e){
//								var index=$(e.currentTarget).attr("data");
//								
//								var date=$("#startDate"+index).val();
//								
//								$.u.ajax({
//	  								url:$.u.config.constant.smsmodifyserver,
//	  								type: "post",
//	  				                dataType: "json",
//	  								data:{
//	  									"tokenid":$.cookie("tokenid"),
//	  									"method":"stdcomponent.update",
//	  									"dataobject":"iosaSection",
//	  									"dataobjectid":way.get("section")[index].id,
//	  									"obj":JSON.stringify({
//	  									    "startDate":date
//	  						
//	  									})
//	  								}
//	  							},$("#section")).done(function(response){
//	  								if(response.success){
//								      $.u.alert.success("日期保存成功");
//								    
//								     }
//	  							})
//								
//							});
//							
//							$("#endDate"+i).blur(function(e){
//								var index=$(e.currentTarget).attr("data");
//								var date=$("#endDate"+index).val();
//								$.u.ajax({
//	  								url:$.u.config.constant.smsmodifyserver,
//	  								type: "post",
//	  				                dataType: "json",
//	  								data:{
//	  									"tokenid":$.cookie("tokenid"),
//	  									"method":"stdcomponent.update",
//	  									"dataobject":"iosaSection",
//	  									"dataobjectid":way.get("section")[index].id,
//	  									"obj":JSON.stringify({
//	  									    "endDate":date
//	  						
//	  									})
//	  								}
//	  							},$("#section")).done(function(response){
//	  								if(response.success){
//	  								    // $.u.alert.success("日期保存成功");
//	  								     }
//		  							})
//								
//							});
//							//添加select2事件
//							$("#chief"+i).select2({
//								tokenSeparators:[',', ' '],
//					       		 allowClear: true,
//								   ajax: {
//				                        url: $.u.config.constant.smsqueryserver,
//				                        dataType: "json",
//				                        type: "post",
//				                        data: function(term, page){
//				                            return {
//				                                tokenid: $.cookie("tokenid"),
//				                                method: "getUserIdNameByGroupName",
//				                                groupName: 'EIOSA审计管理员',
//				                                userName: term
//				                            };
//				                        },
//				                        results:function(response, page, query){
//				                            if(response.success){
//				                                return {
//				                                    "results": response.data.aaData
//				                                }
//				                            }
//				                        }
//				                    },
//				                    id: function(item){
//				                        return item.id;
//				                    },
//				                    formatResult:function(item){
//				                   	 return item.fullname+"("+item.username+")"
//				                   },
//				                   formatSelection:function(item){
//				                   	 return item.fullname
//				                   }
//							});
//							
//							   if(data[i].chief!=null){
//								   $("#chief"+i).select2("data",data[i].chief);
//							   }else{
//								   $("#chief"+i).select2("data",'');
//							   }
//								
//							
//							
//							
//							$("#chief"+i).change(function(e){
//								var index=$(e.currentTarget).attr("data");
//								$.u.ajax({
//								url:$.u.config.constant.smsmodifyserver,
//								type: "post",
//				                dataType: "json",
//								data:{
//									"tokenid":$.cookie("tokenid"),
//									"method":"updateChiefAuditor",
//									"sectionId":way.get("section")[index].id,
//									"userId":$("#"+this.id).val()
//									
//								}
//							},$("#section")).done(function(response){
//								if(response.code=="success"){
//									$.u.alert.success("保存成功");
//									$("#"+this.id).dialog("close");
//								}else{
//									$.u.alert.error("保存失败");
//								}
//							});
//							});
//                         
//							//添加onchange事件
//							$("#secDealer"+i).change(function(e){
//								
//								var index=$(e.currentTarget).attr("data");
//								
//								$("#changeContent").html("您确认将本项和其下级负责人同时变为新的负责人吗？")
//								var selectId=this.id;
//					
//								//var sectionId=data[i-1].id;
//								var dealerId=$("#"+selectId).val();
//								//var operateFlag=way.get("section")[i].taskId;
//								
//								this.changeAuditor= $('#changeAuditor').dialog({
//		            	   			width:400,
//		            	   			height:150,
//		            	   			title:"变换负责人",
//		            	   	       // position:[300,100],
//		            	   		});
//		            	   	    var dialogOptions = {
//		            	   			
//		            	   				buttons: [{
//		            	   	            text: "保存",
//		            	   				"class": "aui-button-link",
//		            	   				click: function () {
//		            	   					$('#changeAuditor').dialog("close");
//		            	   					$.u.ajax({
//	            								url:$.u.config.constant.smsmodifyserver,
//	            								type: "post",
//	            				                dataType: "json",
//	            								data:{
//	            									"tokenid":$.cookie("tokenid"),
//	            									"method":"addDealer",
//	            									"sectionId":way.get("section")[index].id,
//	            									"dealerId":dealerId,
//	            									"operateFlag":way.get("section")[index].taskId
//	            								}
//	            							},$("#section")).done(function(response){
//	            								
//	            								if(response.code=="success"){
//	            									$.u.alert.success("保存成功");
//	            									
//	            								}else{
//	            									$.u.alert.error("保存失败");
//	            								}
//	            							});
//		            	   	            }},{
//		            	   	            text: "取消",
//		            	   	  			"class": "aui-button-link",
//		            	   	  			click: function () {
//		            	   	  		
//		            	   	  		     $('#changeAuditor').dialog("close");
//		            	   				}
//		            	   	            }
//		            	   		]
//		            	   		};
//		            	   	  this.changeAuditor.dialog("option",dialogOptions).dialog("open");
//						   });
//							 $("#secDealer"+i).empty();
//								
//							 addRoot(data[i].auditors,"secDealer"+i,data[i].dealer);//给select 赋值
//						}
//						
//					}						
//					
//				 //  $(document).ready(function() {
//
//				   //});
//				}
//				
//			}));
//   }, //_querySection

   
}, {
	usehtm : true,
	usei18n : true
});

com.eiosa.reportList.widgetjs = [
		//"base.js", "../../uui/vue.min.js",
		//"../../uui/tooltip/myTooltip.js", "../../uui/util/htmlutil.js",
		//"../../uui/async/async.min.js",
 ];
com.eiosa.reportList.widgetcss = [ {
	//path : '../../uui/tooltip/jquery.tooltip.css'
},  ];