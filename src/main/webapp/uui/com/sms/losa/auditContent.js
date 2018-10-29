/**
function selectModify(event,data){
	  $('#selectModify').show();
	  $('#selectModify').css({
			top: event.clientY + "px",
			left: event.clientX - 450 + "px",
			position: 'absolute'
		});
	  addLink(data);

};*/
$.u.define('com.sms.losa.auditContent', null, {
	
	init:function(){
		this.i18n = com.sms.losa.auditContent.i18n;
		
	},
	afterrender:function(){
		//scrollMenu('newCreate');
		//观察活动编号
		this.observiewNum=this.qid("observeNo");
		//航班号
		this.flightNo=this.qid("flightNo");
		//状态
		this.status=this.qid("status");
		//添加日期控件
		this.flightDate=this.qid("dateFrom");
		this.flightDate.datepicker({"dateFormat":"yy-mm-dd", constrainInput:true});
		this.flightDateTo=this.qid("dateTo");
		this.flightDateTo.datepicker({"dateFormat":"yy-mm-dd", constrainInput:true});
		this.dataTable = this.qid("auditContTab").dataTable({
			searching: false,
            serverSide: true,
            bProcessing: true,
            bPaginate: true,  //是否分页。
            ordering: false,
            "columns": [
                        { "title": "观察活动编号", "mData":"activityNumber","sWidth": 80 },
                        { "title": "观察日期", "mData":"flightDate", "sWidth": 80},
                        { "title": "航班号", "mData":"flightNO", "sWidth": 80 },
                        { "title": "活动状态", "mData":"activityStatus", "sWidth": 80 },
                        { "title": "状态更新时间", "mData":"activityUpdateTime", "sWidth": 80 },
                        
                    ],
            "aoColumnDefs":[
                            {
                              "aTargets": 0,
                               "mRender": this.proxy(function (data, type, full) {
                            	   
    	                      // var htmls = "";
    		                   //htmls+="<button class='btn btn-success detail' data='"+data+"' >详情</button>";
        	                   //htmls+="<button class='btn btn-link ' onclick=selectModify(event,"+data+")>修改</button>";
    		                  // htmls+="<button class='btn btn-link modify' data='"+data+"' >修改</button>";
    		                   //htmls+="<button class='btn btn-info modify' data-toggle='modal'data-target='#myModal' data='"+data+"' >修改</button>";
        	                   //htmls+="<button class='btn btn-warning deleted' data='"+data+"'>删除</button>";
        	                  
    	
                              // return htmls;
                               var htmls=["<a style='padding-left:15px;' href="+"obserview.html?id="+full.id+"><span  style='color:blue;cursor:pointer;' >"+data+"</span></a>"];
              
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
   	                    rule.push([{"key":"activityNumber","value":this.observiewNum.val()}],
   	                               [{"key":"flightNO","value":this.flightNo.val()}],
   	                               [{"key":"activityStatus","value":this.status.val()}],
   	                               [{"key":"flightDate","op":">=","value":this.flightDate.val()}],
   	                               [{"key":"flightDate","op":"<=","value":this.flightDateTo.val()}]
   	                              // {"key":"flightDate","value":this.flightDate.val()},
   	                              // {"key":"identity_number","value":this.flightDateTo.val()},
   	                               );
   	                //}
   	            	 //将上面的参数合并到aoData中
   	              	$.extend(aoData,{
   	              		"tokenid":$.cookie("tokenid"),
   	              		"method":"stdcomponent.getbysearch",
   	              	    "dataobject": "observe",
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
   	           
			
		});
	this.dataTable.off("click", "button.deleted").on("click", "button.deleted", this.proxy(this._deleteData));
	this.dataTable.off("click", "button.modify").on("click", "button.modify", this.proxy(this._modifyDialog));
	this.dataTable.off("click","button.detail").on("click","button.detail",this.proxy(this._detailDialog));
	//查询方法
	  this.search=this.qid("search");
	  this.search.click(this.proxy(function () {//debugger;
      this.dataTable.fnDraw();
		  
     }));
  //重置按钮
	 this.reset=this.qid("reset");
	 this.reset.click(this.proxy(function(){	
		 this.observiewNum.val("");
	    this.flightNo.val("");
	    this.status.val("");
		this.flightDate.val("");
		this.flightDateTo.val("");
	 }));
   
     this.qid("close").click(this.proxy(function(){
    	 $('#selectModify').hide();
     }));
     this.qid("create").click(this.proxy(function(){
    	 window.location.href="obserview.html";
     }));
	},
_deleteData:function(e){
	var id=JSON.parse($(e.currentTarget).attr("data"));
	var dialogOptions = {
         buttons: [
			        {
					   text: "确定",
					   "style":"font-size:25px",
					   "class": "btn",
					    click: this.proxy(function () {
					    	//var id=JSON.parse($(e.currentTarget).attr("data"));
						   	  $.ajax({
						   			url:$.u.config.constant.smsmodifyserver,
						   			type: "post",
						               dataType: "json",
						   			data:{
						   				"tokenid":$.cookie("tokenid"),
						   				"method":"stdcomponent.delete",
						   				"dataobject":"observe",
						   				"dataobjectids":JSON.stringify([id])
						   			},
						   		}).done(this.proxy(function (response) {
						   			this.deleteDialog.dialog("close");
						   			this.dataTable.fnDraw();
						   		}));
					    }) 
			         },{
			        	   text: "取消",
			        	   "style":"font-size:25px",
						   "class": "btn",
						   click: this.proxy(function (e) {
						    	this.deleteDialog.dialog("close");
						    })
			         }
            ]
        };
	this.deleteDialog = this.qid("deleteDialog").dialog({
		width:400,
		height:200,
		modal: true,
        draggable: false,
        resizable: false,
        autoOpen: false,
        position:[500,300],  
	});
	this.deleteDialog.dialog("option",dialogOptions).dialog("open");
	
    },
 _modifyDialog:function(e){
	 var id=JSON.parse($(e.currentTarget).attr("data"));
	  addLink(id);
	  /**var dialogOptions = {
		         buttons: [{
					        	  text: "取消",
								  "class": "btn",
								   click: this.proxy(function (e) {
								   this.selectModify.dialog("close");
								    })
					         }
		            ]
		        };
	  this.selectModify= this.qid("selectModify").dialog({
				title : "请选择需修改页面",
				width:250,
				modal: true,
		        draggable: false,
		        resizable: false,
		        autoOpen: false,
		       
		        position:[500,100],
			});
	 this.selectModify.dialog("option",dialogOptions).dialog("open"); */ 
 },
 _detailDialog:function(e){
	 var id=JSON.parse($(e.currentTarget).attr("data"));
	 window.location.href="obserview.html?id=" + id+"=detail";
	 
	 
 }
}, { usehtm: true, usei18n: true });
com.sms.losa.auditContent.widgetjs = ['../../../uui/widget/jqurl/jqurl.js',
                                  '../../../uui/widget/jqdatatable/js/jquery.dataTables.js', 
                                  '../../../uui/widget/jqdatatable/js/dataTables.bootstrap.js',
                                  '../../../uui/widget/select2/js/select2.min.js',
                                  "../../../uui/widget/spin/spin.js", 
                                  "../../../uui/widget/jqblockui/jquery.blockUI.js",
                                  "../../../uui/widget/ajax/layoutajax.js"];
 com.sms.losa.auditContent.widgetcss = [{ path: '../../../uui/widget/jqdatatable/css/jquery.dataTables.css' }, 
                                   { path: '../../../uui/widget/jqdatatable/css/dataTables.bootstrap.css' },
                                   {path:"../../../uui/widget/select2/css/select2.css"},
                                   {path:"../../../uui/widget/select2/css/select2-bootstrap.css"},
                                   {path:"../../../uui/widget/bootstrap/css/bootstrap.css"},
                                  ]

