$.u.define('com.sms.losa.taskPlan', null, {
	init:function(){
		 this.i18n=com.sms.losa.taskPlan.i18n;
	},
	afterrender:function(){
	  scrollMenu('newCreate');
	  $('#newCreate').click(this.proxy(function(){
		  var dialogOptions = {
			         buttons: [
						        {
								   text: "草稿",
								   "style":"font-size:16px",
								   "class": "btn",
								    click: this.proxy(function () {
								    	
									    
								    })
						         },{
									   text: "发布",
									   "style":"font-size:16px",
									   "class": "btn",
									    click: this.proxy(function () {
									    	
										    
									    })
							         },{
						        	   text: "取消",
						        	   "style":"font-size:16px",
									   "class": "btn",
									   click: this.proxy(function (e) {
									    	this.createDialog.dialog("close");
									    })
						         }
			            ]
			        };
				this.createDialog = this.qid("taskPlanDialog").dialog({
				    title : "LOSA航线安全审计计划",
					width:1000,
					height:600,
					modal: true,
			        draggable: false,
			        resizable: false,
			        autoOpen: false,
			        position:[300,100],  
				});
				this.createDialog.dialog("option",dialogOptions).dialog("open");

	  }));
	//Table
	 
		/*this.dataTable = this.qid("taskPlanTab").dataTable({
			searching: false,
	        serverSide: true,
	        bProcessing: true,
	        bPaginate: true,  //是否分页。
	        ordering: false,
	        "columns":[
                        { "title": '观察员', "mData":"IDENTIFY_NUMBER","sWidth": 60 },
                        { "title": '活动编号', "mData":"ACTIVITY_NUMBER","sWidth": 60 },
                        { "title": '观察日期', "mData":"TASK_PLAIN_TIME","sWidth": 80 },
                        { "title": '航班号', "mData":"FLIGHT_NO","sWidth": 80 },
                        { "title": '状态', "mData":"FLIGHT_CITY","sWidth": 80 },
                        { "title": '批次号', "mData":"FLIGHT_DATE","sWidth": 80 },
                        { "title": '操作', "mData":"id","sWidth": 100},
	                   
	        ],
	        "aoColumnDefs":[
                            {
                              "aTargets": 6,
                               "mRender": this.proxy(function (data, type, full) {
    	                       var htmls = "";
    		                   htmls+="<button class='btn btn-info modify' data='"+data+"' >修改</button>";
        	                   htmls+="<button class='btn btn-warning deleted' data='"+data+"'>删除</button>";
                               return htmls;
                            })
                          }  
                              
                            
                   ],
	           "oLanguage": { //语言
                "sSearch": this.i18n.search,
                "sLengthMenu": this.i18n.everPage+" _MENU_ "+this.i18n.record,
                "sZeroRecords": this.i18n.message,
                "sInfo": this.i18n.from+" _START_ "+this.i18n.to+" _END_ /"+this.i18n.all+" _TOTAL_ "+this.i18n.allData,
                "sInfoEmpty": this.i18n.withoutData,
                "sInfoFiltered": "("+this.i18n.fromAll+"_MAX_"+this.i18n.filterRecord+")",
                "sProcessing": ""+this.i18n.searching+"...",
                "oPaginate": {
                    "sFirst": "<<",
                    "sPrevious": this.i18n.back,
                    "sNext": this.i18n.next,
                    "sLast": ">>"
                }
            },
            //设置查询的参数
	        "fnServerParams":this.proxy(function (aoData) {
	            	var rule=[];
	            	//if($.trim(this.observiewerId.val())){
	                   // rule.push([{"key":"identity_number","value":this.observiewerId.val()}]);
	               // }
	            	 //将上面的参数合并到aoData中
	              	$.extend(aoData,{
	              		"tokenid":$.cookie("tokenid"),
	              		"method":"stdcomponent.getbysearch",
	              	    "dataobject": "taskPlan",
       		            "rule": JSON.stringify(rule),
       		            "columns": JSON.stringify( [{"data":"created"}] ),
                        "order": JSON.stringify( [{"column":0, "dir": "desc"}] ),
       		            "search": JSON.stringify(aoData.search)
	              	},true);
	              }), 
	              //查询方法
	                "fnServerData": this.proxy(function (sSource, aoData, fnCallBack, oSettings) {
	                	
	                    $.ajax({
	                        url: $.u.config.constant.smsqueryserver,
	                        type:"post",
	                        dataType: "json",
	                        cache: false,
	                        data: aoData
	                    }).done(this.proxy(function (data) {
	                    	if (data.success) {
	                         fnCallBack(data.data);
	                     }
	                    })).fail(this.proxy(function (jqXHR, errorText, errorThrown) {

	                    }))
	                })
	        
	        
		});*/
		//this.dataTable.off("click", "button.modify").on("click", "button.modify", this.proxy(this._modifyDialog));
		//this.dataTable.off("click","button.detail").on("click","button.detail",this.proxy(this._detailDialog));
		this.qid('flightDetail').click(this.proxy(function(){
			 var dialogOptions = {
			         buttons: [
						        {
						        	   text: "取消",
						        	   "style":"font-size:16px",
									   "class": "btn",
									   click: this.proxy(function (e) {
									    	this.flightDetail.dialog("close");
									    })
						         }
			            ]
			        };
				this.flightDetail = this.qid("flight").dialog({
				    title : "航班信息",
					width:400,
					height:500,
					modal: true,
			        draggable: false,
			        resizable: false,
			        autoOpen: false,
			        position:[300,100],  
				});
				this.flightDetail.dialog("option",dialogOptions).dialog("open");
		}));
		this.qid('detail').click(this.proxy(function(){
			 var dialogOptions = {
			         buttons: [
			                   {
			                	   text: "确定",
					        	   "style":"font-size:16px",
								   "class": "btn", 
			                	   
			                   },{
						        	   text: "取消",
						        	   "style":"font-size:16px",
									   "class": "btn",
									   click: this.proxy(function (e) {
									    	this.observDetail.dialog("close");
									    })
						         }
			            ]
			        };
				this.observDetail = this.qid("PatchDetail").dialog({
				    title : "批次信息",
					width:600,
					height:500,
					modal: true,
			        draggable: false,
			        resizable: false,
			        autoOpen: false,
			        position:[300,100],  
				});
				this.observDetail.dialog("option",dialogOptions).dialog("open");
		}));
		this.qid('newDetail').click(this.proxy(function(){
			 var dialogOptions = {
			         buttons: [
			                   {
			                	   text: "确定",
					        	   "style":"font-size:16px",
								   "class": "btn", 
			                	   
			                   },{
						        	   text: "取消",
						        	   "style":"font-size:16px",
									   "class": "btn",
									   click: this.proxy(function (e) {
									    	this.observDetail.dialog("close");
									    })
						         }
			            ]
			        };
				this.observDetail = this.qid("PatchDetail").dialog({
				    title : "批次信息",
					width:600,
					height:500,
					modal: true,
			        draggable: false,
			        resizable: false,
			        autoOpen: false,
			        position:[300,100],  
				});
				this.observDetail.dialog("option",dialogOptions).dialog("open");
		}));
		
	 
	},
	 _modifyDialog:function(e){
		 var id=JSON.parse($(e.currentTarget).attr("data"));
		 
		 
	 },
	
	
}, { usehtm: true, usei18n: true });
com.sms.losa.taskPlan.widgetjs = ['../../../uui/widget/jqurl/jqurl.js',
                                  '../../../uui/widget/jqdatatable/js/jquery.dataTables.js', 
                                  '../../../uui/widget/jqdatatable/js/dataTables.bootstrap.js',
                                  '../../../uui/widget/select2/js/select2.min.js',
                                  "../../../uui/widget/spin/spin.js", 
                                  "../../../uui/widget/jqblockui/jquery.blockUI.js",
                                  "../../../uui/widget/ajax/layoutajax.js"];
 com.sms.losa.taskPlan.widgetcss = [{ path: '../../../uui/widget/jqdatatable/css/jquery.dataTables.css' }, 
                                   { path: '../../../uui/widget/jqdatatable/css/dataTables.bootstrap.css' },
                                   {path:"../../../uui/widget/select2/css/select2.css"},
                                   {path:"../../../uui/widget/select2/css/select2-bootstrap.css"},
                                   {path:"../../../uui/widget/bootstrap/css/bootstrap.css"}]