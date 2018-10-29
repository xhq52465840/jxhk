//@ sourceURL=com.audit.terminal.terminalplan
$.u.define('com.audit.terminal.terminalplan', null, {
	 init: function () {
       this.currentTaskid = null;	
       this.isfirst=true,
       this.i18n= {
    		search : '搜索:',
    		everPage : '每页显示',
    		record : '个用户',
    		message : '抱歉未找到记录',
    		from : '从',
    		to : '到',
    		all : '共',
    		allData : '条数据',
    		withoutData : '没有数据',
    		fromAll : '从总共',
    		filterRecord : '条记录中过滤',
    		searching : '检索中',
    		back : '上一页',
    		next : '下一页',
       }
       
       this._flag={
    		   "工作计划":"../img/r2.png",//工作计划附件
    		   "审核":"../img/r2.png",
    		   "选择要点":"../img/r3.png",
    		   "审计记录":"../img/r3.png",
    		   "检查报告":"../img/r3.png",//审计报告附件
    		   "审核报告":"../img/r3.png",//签批件
    		   "完成情况":"../img/r3.png",//完成情况附件
    		   "完成情况审核":"../img/r3.png",
    		   "结案":"../img/r6.png",
    		   "延期":"../img/r7.png"
       			}//flowStatus
   },
    afterrender: function (bodystr) {
    	  this.getPermition = this.getPermition();
    	  this.year = $.urlParam().year||null;
    	  this.btn_addunit=this.qid("btn_addunit");
    	  this.btngroup=$("[name=btn-group]");
		  $("ul").css({"list-style":"none"});
		  $(".test_ul li").css({"float":"right","margin-left":"10px"} );
		  $(".row").css({"margin-top":" 5px"}) ;
		  $(document).on("mousedown",function(event){
	    		//button等于0代表左键，button等于1代表中键	
	    		if(event.button==0 || event.button==1){
	    			$(".right_Menu").stop().fadeOut(200);//获取菜单停止动画，进行隐藏使用淡出效果		} });
	    		}
	    	})
		    this.first_year=$(".first_year");
		    var nameId=null;
			var now_year = parseInt(new Date().format("yyyy"));
	 		var next_year = now_year+1;
	 		var last_year = now_year+2;
	 		var init_html = "";
	 		for(var i=2015;i<=last_year;i++){
	 			if(now_year==i){
	 				init_html += "<option value='" + i + "'selected='selected'>" + i + "年</option>";
	 			}else{
	 				init_html += "<option value='" + i + "'>" + i + "年</option>";
	 			}
	 		}
	 		/*init_html += "<option value='" + now_year + "'>" + now_year + "年</option>";
	 		init_html += "<option value='" + next_year + "'>" + next_year + "年</option>";
	 		init_html += "<option value='" + last_year + "'>" + last_year + "年</option>";*/
	 		this.first_year.html(init_html).off("change").on("change",this.proxy(function(e){
				$(".terminal-title").text($(e.currentTarget).val()+"年度公司外站审计计划");
				this.get_plan();
			}));
		  	if(this.year){
		  		this.first_year.val(this.year);
		  	}
	 		$(".terminal-title").text((this.year||now_year)+"年度公司外站审计计划");
			this.qid("unitok").click(this.proxy(this.unitok));
			$("#addPlan").click(this.proxy(this.addPlan));
			//时间修改确定
			this.qid("timeok").click(this.proxy(this.timeok));
			$(".update_time").click(this.proxy(this.show_time));
		 	$(".delete_time").click(this.proxy(this.delete_qizi));
		 	$(".target_time").click(this.proxy(this.on_showModal));//分配责任单位
			this._loadinggroup=$(".loading-group");
		 	$(".loading").css({
		     	 	"width":"40px",
			 	 	"height":"40px",
			 	 	"position": "absolute",
			 	 	"top":"15%",
			 	 	"left":"10%",
			 	 	"line-height":"16px",
			 	 	"color":"#fff",
			 	 	"padding-left":"10px",
			 	 	"font-size":"15px",
			 	 	"background": " url(../img/loader.gif) no-repeat 10px 5%",
			 	 	"opacity":" 0.7",
			 	 	"z-index":"9999",
			 	 	"-moz-border-radius":"20px",
			 	 	"-webkit-border-radius":"20px",
			 	 	"border-radius":"20px"
		 	 	
		 	 }); 
		   // $(document).ajaxStart($.blockUI({ message: '<h1> 请稍后...</h1>' })).ajaxStop($.unblockUI);
		 	this.get_plan();
    },
    getNewButtonHidden:function(){
    	var val=this.first_year.val();
    	$.ajax({
        	url: $.u.config.constant.smsqueryserver,
	        type:"post",
	        dataType: "json",
	        cache: false,
	        "data": {
    		  "tokenid":$.cookie("tokenid"),
    		  "method":"getAddPlanPermission",
    		  "year":val,
    		  "planType":"TERM"
	    	}
        }).done(this.proxy(function(response){
        	if(response.success){
        		this.btngroup.empty();
        	    var button='<button class="btn btn-success" qid="new_btn"'
				      +'style="margin-bottom: 10px;text-shadow:0 0px 0 #ffffff;">新建计划</button>'	
				response.data.addable && $(button).appendTo(this.btngroup)
												  .off("click").on("click",this.proxy(this.on_new_plan));
        	    if($(button).html()=="新建计划"){
        	    	$("#addPlan").addClass("hidden");
        	    }else {
        	    	$("#addPlan").removeClass("hidden");
        	    }
        	    
        	}
        })).fail(this.proxy(function(jqXHR,errorText,errorThrown){
        	
        })).complete(this.proxy(function(jqXHR,errorStatus){
        	
        }));
    },

    //新建计划
       
    on_new_plan: function (e) {
    	e.preventDefault();
    	this.btngroup.find("button").attr("disabled",true);
    	var val=this.first_year.val();
    	var obj={"planType":"TERM","year":val,"planName":val+"年公司航站审计计划"};
    	$.u.ajax({
 			url : $.u.config.constant.smsmodifyserver,
 			type:"post",
             dataType: "json",
             cache: false,
             data: {
            	 "tokenid":$.cookie("tokenid"),
	       		  "method":"innerCreatePlan",
	       		  "obj":JSON.stringify(obj)
             }
     	},this.$).done(this.proxy(function(response) {
     		if(response.success){
     			this.qid("viewtable").html("");
        		this.get_plan();
     		}
     	}))
    	
    },
    getPermition:function(){
    	var power="";
        $.u.ajax({
 			url : $.u.config.constant.smsqueryserver,
 			type:"post",
 			async:false,
             dataType: "json",
             data: {
            	 "tokenid":$.cookie("tokenid"),
	       		  "method":"getAddPlanPermission",
	       		  "planType":"TERM"
             }
     	}).done(this.proxy(function(response){
     		   if(response.success){
     			  var planData=response.data.addable;
     			   if(response.data.addable==false){
     				  $("#addPlan").addClass("hidden");
     			   }
     			   power= planData;
     		   }
     	}));
        return power;
    },
  
    get_plan:function(){
    	this.isfirst && this._loadinggroup.removeClass("hidden");
    	var val=[];
    	val.push(parseInt(this.first_year.val()));
    	var obj={"planType":"TERM","year":val};
    	$.u.ajax({
 			url : $.u.config.constant.smsqueryserver,
 			type:"post",
             dataType: "json",
             cache: false,
             data: {
            	 "tokenid":$.cookie("tokenid"),
	       		  "method":"getPlanByYearAndType",
	       		  "obj":JSON.stringify(obj)
             }
     	},this.$).done(this.proxy(function(response){
     		if(response.success){
     			this._loadinggroup.addClass("hidden");
     			this.isfirst=false;
        		if(response.data.plans.length < 1){//返回数据为空，即还没有新建
        			this.qid("viewtable").html("<div class='text-center'><h4>暂无数据可查！</h4></div>");
                    this.qid("logsContainer").html("");
        			this.getNewButtonHidden();
        		}else{       			
        			if(this.getPermition){
        				$("#addPlan").removeClass("hidden");
        			}
        			this.btngroup.find("button").removeAttr("disabled");
        			this.qid("viewtable").empty();
        			this.planid = response.data.plans[0].id;
            		this.resultData = response.data;
            		this.creatTable(response,"");
            		this.rebuildActions(response.data);
            		this.relog(response.data);
        		}
     		}
     	}))
     	},
    rebuildActions:function(data){
    	this.btngroup.empty();
       var planid= 	this.planid;
        $.each(data.actions,this.proxy(function(idx,item){
        	var html="<button name='"+ item.name +"'  class='btn btn-success " + item.wipId + "' wipId='" + item.wipId + "'  planid='"+planid+"'>"+ item.name  +"</button>";
			this.btngroup.append(html);
        }))
        this.btngroup.find("button").css({"margin-bottom": "10px","text-shadow":"0 0px 0 #ffffff"})
                                    .off("click").on("click",this.proxy(this.comm_button));
    },
    
    //点击操作按钮(报批，通过， 不通过)
    comm_button : function(event){
    	event.preventDefault();
        var	planid=$(event.currentTarget).attr("planid");
        var wipId=$(event.currentTarget).attr("wipId");
    		var clz = $.u.load("com.audit.comm_file.confirm");
    		var confirm = new clz({
                "body": "确认操作？",
                "buttons": {
                    "ok": {
                        "click": this.proxy(function(){
                        	$.u.ajax({   //报批审核等
                    			url : $.u.config.constant.smsmodifyserver,
                    			type:"post",
                                dataType: "json",
                                cache: false,
                                data: {
                                	"method": "operate",
                                    "tokenid": $.cookie("tokenid"),
                                    "action" : wipId,
                                    "dataobject" : "plan",
                                    "id" : planid
                                },
                        	},confirm.confirmDialog.parent()).done(this.proxy(function(response) {
                        		if(response.success){
                        			confirm.confirmDialog.dialog("close");
                        			this.get_plan();
                        		}
                        	}))
                        })
                    }
                }
    		})
    },
    power: function(planData){
    	var planData=planData;
    	return planData;
    },
    creatTable:function(response){
    	var response=response;
    	var targets =response.data.plans[0].targets;
    	var dddata=[];
    	$.each(targets||[],this.proxy(function(idx,item){
    		 var obj={
    				 "qone":"",
    				 "qtwo":"",
    				 "qthree":"",
    				 "qfour":""
    		      }
    		$.each(item.tasks||[],this.proxy(function(num,filter){
    			var qqq=filter.planTime.substr(-1,1);
    			switch(qqq){
    			case '1':
    				$.extend(true,obj,{"qone":filter})
    				break;
    			case '2':
    				$.extend(true,obj,{"qtwo":filter})
    				break
    			case '3':
    				$.extend(true,obj,{"qthree":filter})
    				break
    			case '4':
    				$.extend(true,obj,{"qfour":filter})
    				break
    			}
        	}))
        	 $.extend(true,item,obj)
 			  dddata.push(item);
    	}))
    	  if ($.fn.DataTable.isDataTable(this.qid("viewtable"))) {
              this.qid("viewtable").dataTable().api().destroy();
              this.qid("viewtable").empty();
           /*  this.qid("viewtable").dataTable().fnClearTable();
             this.qid("viewtable").dataTable().fnAddData(dddata,true); */
             //this.qid("viewtable").dataTable().fnGetData();//得到所有数据：就是dddata
             //this.qid("viewtable").dataTable().fnSettings();
             //this.qid("viewtable").dataTable().fnPageChange(page);  // 设置datatables跳转到某页 
          }
    	this.dataTable = this.qid("viewtable").dataTable({
    		pageLength:200,
            searching: false,
            serverSide: false,//是否启动服务器端数据导入  
            bProcessing: false,
           "bFilter" : true, //是否启动过滤、搜索功能  
           "bSort" : true, //是否启动各个字段的排序功能  
            ordering: false,
           "aaSorting" : [[0, "asc"]], //默认的排序方式，第2列，升序排列  
            sDom: "t<f>",
            "info":true,
            "loadingRecords": "加载中...",  
            "aaData":dddata||[],
            "aoColumns": [
                { "title": "单位|年季度" ,"mData":"name","sWidth":"20%"},
                { "title": "第一季度", "mData":"qone","sWidth":"20%" },
                { "title": "第二季度", "mData": "qtwo", "sWidth": "20%" },
                { "title": "第三季度", "mData":"qthree", "sWidth": "20%" },
                { "title": "第四季度", "mData":"qfour", "sWidth": "20%" }
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
                	  "sFirst": "",
	                   "sPrevious": "<span class='fa fa-caret-left fa-lg'></span>",
	                   "sNext": "<span class='fa fa-caret-right fa-lg'></span>",
	                   "sLast": ""
                }
            },
            "fnServerParams": this.proxy(function (aoData) {}),
            "fnServerData": this.proxy(function (sSource, aoData, fnCallBack, oSettings) {}),
            "aoColumnDefs": [
                 {
                     "aTargets": 0,
                     "orderable":false,
                     "sClass": "airport-td",
                     "sContentPadding": "mmm",
                     "mDataProp": "name", 
                     "bVisible" : true,
                     "sDefaultContent": "--",//允许给列值一个默认值，只要发现null值就会显示默认值
                     "mRender": function (data, type, full) {
                    	 return "<div  targetid='"+full.id +","+full.name+"' >"+data+"</div>"
                     }
                 },
                 {
                     "aTargets": 1,
                     "sClass": "canedit-td q1",
                     "mRender":  this.proxy(function (data, type, full) {
                		 return data ?"<img class='qizi'  name='plan' dataq='1'	targetid='"+full.id +","+full.name+"' datadata='"+JSON.stringify(data)+"' data-toggle='context' data-target='#context-menu' src='"+(!!data.flowStatus && this._flag[data.flowStatus] ?this._flag[data.flowStatus]:"../img/r2.png")+"' alt='' />"+data.unitName:"";
                     })
                 },
               
                 {
                     "aTargets": 2,
                     "sClass": "canedit-td q2",
                     "mRender":  this.proxy(function (data, type, full) {
                    		 return data ?"<img class='qizi '  name='plan' dataq='2' targetid='"+full.id+","+full.name+"' datadata='"+JSON.stringify(data)+"' data-toggle='context' data-target='#context-menu' src='"+(!!data.flowStatus && this._flag[data.flowStatus] ?this._flag[data.flowStatus]:"../img/r2.png")+"' alt='' /> "+data.unitName:"";
                     })
                 },
                {
                    "aTargets": 3,
                    "sClass": "canedit-td q3",
                    "mRender":  this.proxy(function (data, type, full) {
               		 return data ?"<img class='qizi '  name='plan'  dataq='3' targetid='"+full.id+","+full.name+"' datadata='"+JSON.stringify(data)+"' data-toggle='context' data-target='#context-menu' src='"+(!!data.flowStatus && this._flag[data.flowStatus] ?this._flag[data.flowStatus]:"../img/r2.png")+"' alt='' />"+data.unitName:"";

                    })
                },
                {
                    "aTargets": 4,
                    "sClass": "canedit-td q4",
                    "mRender":  this.proxy(function (data, type, full) {
               		 return data ?"<img class='qizi '  name='plan'  dataq='4' targetid='"+full.id+","+full.name+"' datadata='"+JSON.stringify(data)+"' data-toggle='context' data-target='#context-menu' src='"+(!!data.flowStatus && this._flag[data.flowStatus] ?this._flag[data.flowStatus]:"../img/r2.png")+"' alt='' />"+data.unitName:"";

                    })
                }
            ],
            
            "rowCallback": this.proxy(function(row, data, index){
                var flowStatus =this.resultData.workflowNodeAttributes.flowStatus;
             	var flowStep =this.resultData.workflowNodeAttributes.flowStep;
             	$qizi=$(row).find("img.qizi");
             	if( flowStatus == "jiHua" || flowStatus == "shenHe"||flowStatus ==undefined){
             		$qizi.attr("src","../img/r1.png") 
				}
             	flowStatus=="faBu" && data.qone==""&&data.qtwo==""
             		&&data.qthree==""&&data.qfour=="" && $(row).addClass("hidden");
             })
        });
    	if(this.getPermition){
    	this.dataTable.off("click","td.canedit-td").on("click","td.canedit-td",this.proxy(this.creat_td));	
    	this.initmenu(response.data);
    	}
    },
   
   initmenu:function(Data){
	   $('.qizi').on("contextmenu",function(event){
		   event.preventDefault();//阻止浏览器与事件相关的默认行为；此处就是弹出右键菜单 
			var	datadata=$(this).attr("datadata");
	   		var targetid=$(this).attr("targetid");
	   		var dataq=$(this).attr("dataq");
			var dataid=JSON.parse(datadata).id;
			var pageX = event.pageX;//鼠标单击的x坐标
			var pageY = event.pageY;//鼠标单击的y坐标
			var dataobj=JSON.parse(datadata);
			$(".update_time").attr("name",name).addClass("hidden");
			$(".gongzuodan_time").attr("datadata",datadata).attr("href","../terminal/Sheet.html?id="+dataid).attr("target","_blank").addClass("hidden");
			$(".target_time").attr("datadata",datadata).attr("targetid",targetid).attr("dataq",dataq).addClass("hidden");
			/*$(".update_time").attr("datadata",datadata).attr("targetid",targetid).attr("dataq",dataq);*/
			$(".delete_time").attr("datadata",datadata).attr("targetid",targetid).attr("dataq",dataq);
			var nameid=null;
			var flow_flag=null;
			 $.u.ajax({  
					url : $.u.config.constant.smsqueryserver,
					type:"post",
		            dataType: "json",
		            async:false,//async默认的设置值为true，这种情况为异步方式，false 是同步，一直等待，返回response后才会执行后面的代码
		            cache: false,
		            data: {
		           		"method": "getTaskMenuPermission",
		               "tokenid": $.cookie("tokenid"),
		               "taskId" : dataobj.id
		           },
			   	}).done(function(response) {
			   		if(response.success){
			   			flow_flag=response.data;
			   			nameid=dataobj.id
			   			console.log(nameid);
			   		}
			   	})
			  nameId=nameid;
			//计划：计划-审核-发布-结案
			//工作单：计划-审核-选择要点-检查记录-审计报告-整改审核-完成情况-完成情况审核-结案
			var flowStatus=Data.workflowNodeAttributes.flowStatus||"";
			//工作单未进行到下一步，均可删除该工作单
			if(dataobj.flowStatus && dataobj.flowStatus==="工作计划"){
				$(".target_time").add($(".delete_time")).removeClass("hidden");
				$(".gongzuodan_time").removeClass("hidden");
			}else{//工作单进行到了下一步
			$(".target_time").add($(".delete_time"));
				$(".gongzuodan_time").removeClass("hidden");
			}
			

			//获取菜单并设置菜单的位置	 
			$(".right_Menu").css({		
				left:pageX+"px",//设置菜单离页面左边距离，left等效于x坐标 
				top:pageY+"px"//设置菜单离页面上边距离，top等效于y坐标
			}).stop().show();//显示使用淡入效果,比如不需要动画可以使用show()替换;
			
			if(flowStatus){
				if( flowStatus=="faBu" || flowStatus=="jieAn"){//发布后
					if( !!Data.actions.length || flow_flag){
					}else{
						$(".right_Menu").hide();
					}
				}else{//发布前   //"jiHua"
					if( !!Data.actions.length || flow_flag){
						$(".gongzuodan_time").addClass("hidden");
						$(".delete_time").removeClass("hidden");
					}else{
						$(".right_Menu").hide();
					}
				}
			}
			if($(".right_Menu").find("a:visible").length===0){
				$(".right_Menu").hide();
			}
		});	
   },
   //选择月份后，提交更改
    
   timeok :function(e){
   var planTime=$(".first_year").val();
   
   	var checked_month = $(".months").find("input[type='radio']:checked").val();
   	var yearmonth = $(".first_year").val()+ checked_month;
   	var namearray=name.split(",")
   	var workno=namearray.pop();
   	var init_url = $.u.config.constant.smsmodifyserver;
   	$.u.ajax({   //更改旗子位置
			url : init_url,
			type:"post",
           dataType: "json",
           cache: false,
           data: {
           	"method": "stdcomponent.update",
           	"dataobjectid": nameId,
           	"obj":JSON.stringify({"planTime":yearmonth}),
               "tokenid": $.cookie("tokenid"),
               "dataobject" : "task",
           },
   	}).done(this.proxy(function(response) {
   		if(response.success){
   			debugger;
   			$('.timeModal').modal('hide');
   			if(this._options.type == "erjineishen"){
   	    		if(this.bumen_id != null){
   	    			this.get_data([parseInt($(".currentyear").text().substr(0,4))],this.bumen_id);
   	    		}
   			}else{
   				if(this.unitid != null){
   					this.get_data([parseInt($(".currentyear").text().substr(0,4))],this.unitid);
   	    		}
   			}
   			parent.location.reload(); 
   		}
   	}))
   },
   
   //修改时间
   show_time :function(e){
   	
   	$(".currentyear").attr("name",name);
   	var namearray=name.split(",")
   	var workno=namearray.pop();
   	var year = name.split(",")[0].substr(0,4);
   	var month = name.split(",")[0].substr(4,2);//当前右键的月份
   	$(".currentyear").text($(".first_year").val()+"年");
   	var $radio = $(".months").find("input[type=radio]");
   	$radio.each(function(){
   		$(this).removeAttr("disabled");
   		$(this).attr("checked",false);
   	})
   	var $curr_td = this.qid("tbody_td").find("td[name*=" + name.split(",")[3] + "]");
   	$curr_td = $curr_td.has("img");//获取含有本公司旗子的td月份
   	$curr_td.each(function(){
   		var each_month = $(this).attr("name").split(",")[0].substr(4,2);
   		$radio.each(function(){
   	    		if($(this).val() == each_month){
   	    			$(this).attr("disabled", "disabled");
   	    		}
   	    })
   	})
   	$('.timeModal').modal('show');
   },
   
   getTaskMenuPermission:function(dataobjId){
	   $.u.ajax({   //删除计划
			url : $.u.config.constant.smsqueryserver,
			type:"post",
            dataType: "json",
            async:false,//async默认的设置值为true，这种情况为异步方式，false 是同步，一直等待，返回response后才会执行后面的代码
            cache: false,
            data: {
           		"method": "getTaskMenuPermission",
               "tokenid": $.cookie("tokenid"),
               "taskid" : dataobjId
           },
	   	}).done(this.proxy(function(response) {
	   		if(response.success){
	   			
	   		}
	   	}))
   },
    
 
    
    /**
     * @title 销毁页面的组件,请空按钮
     */
    _destroyModule:function(){
    	this.comps && $.each(this.comps,this.proxy(function(key,comp){
    		comp.destroy();
    		delete this.comps[key];
    	}));
    	this.leftColumns.empty();
    },
    _drawModule:function(logarea){
    	var $target = null,
    		clazz = null,
    		option = {};
    	//var planid = (this.qid("tbody_td").html() == "") ? "" : this.qid("tbody_td").find("tr").eq(0).find("td").eq(1).attr("name").split(",")[2];
    	this._destroyModule();
    	if(logarea){
    		//config.left && $.each(config.left,this.proxy(function(idx,comp){
    			clazz = $.u.load(logarea.key);
    			option = $.extend(true, {}, logarea, {
                    logRule: [[{"key":"source","value": parseInt(planid)}],[{"key":"sourceType","value":"plan"}]],
                    remarkRule: [[{"key":"source","value": parseInt(planid)}],[{"key":"sourceType","value":"plan"}]],
                    remarkObj: {
                        source: parseInt(planid),
                        sourceType: "plan"
                    },
                    "addable" : true,
                    flowid :this.flowid
    			});
    			this.comps[logarea.key] = new clazz($("<div umid='leftmodule4"+"'/>").appendTo(this.leftColumns),option);
    	}; 
    },
    
	  relog:function(data){
		  this.qid("logsContainer").html("");
		  var   flowId =data.plans[0].flowId;
		  if(data.logArea && data.logArea.key){ 
	          var clz = $.u.load(data.logArea.key);
	          var target = $("<div/>").attr("umid", "logs").appendTo(this.qid("logsContainer"));
	          new clz( target, $.extend(true, data.logArea, {
	            	businessUrl: this.getabsurl("TerminalAudit.html"),                    
	              logRule: [[{"key":"source","value": this.planid}],[{"key":"sourceType","value":"plan"}]],
	              remarkRule: [[{"key":"source","value": this.planid}],[{"key":"sourceType","value":"plan"}]],
	              remarkObj: {
	                  source: this.planid,
	                  sourceType: "plan"
	              },
	              addable: true,
	              flowid: flowId 
	          }) );
	      }  
	  },
	  
	  
	   //左键点击创建工作单
    creat_td:function(e){
	    	e.preventDefault();
	    	var $_tar = $(e.currentTarget);
	    	if(!this.resultData.actions.length ){
	    		return 
	    	}
	    	var targetid=$_tar.parent().find("td>div").attr("targetid");
    		var dataq="";
    		if($_tar.attr("class").match("[1-4]")){
    			 dataq=$_tar.attr("class").match("[1-4]")[0]-0;
    		}
	    	if($_tar.find("img").length==0){
	    		this.showModal(null,targetid,dataq);
	    	}else{
	        	var strSrc=$_tar.find("img").attr("src");
	        	var datadata=$_tar.find("img").attr("datadata");
	        	if(strSrc.match(/r\d.png/g)){
	        		if(strSrc.match(/r\d.png/g).pop().split(".")[0]=="r1"){
	        			this.showModal(datadata,targetid,dataq);
	        		}
	        	}
	    	}
	    	
			// this.currentTaskid=JSON.parse($(e.currentTarget).find("img.qizi").attr("datadata")).id;
			
	    },
	  
	  
	  on_showModal:function(event){//右键修改
		  var $_current = $(event.currentTarget);
		  var data =$_current.attr("datadata");
		  var targetid=$_current.attr("targetid");//机场
		  var dataq=$_current.attr("dataq");//季度
		  this.showModal(data,targetid,dataq);
	  },
	  
	  showModal:function(data,targetid,dataq){
		  	var $qiziModal=$('.qiziModal').modal('show')
		  							.data("data",data)
								    .data("targetid",targetid)
								    .data("dataq",dataq);
			 var $unit=$("input[name=unit]",$qiziModal);
			 $unit.select2({
		     		placeholder: "选择",
		     		allowClear:true,
		         	ajax:{
		 	        	url: $.u.config.constant.smsqueryserver,
		 	        	type: "post",
		 	            dataType: "json",
		 	        	data: this.proxy(function(term, page){
		 	        		return {
		 		    			"tokenid":$.cookie("tokenid"),
		 		    			"method":"stdcomponent.getbysearch",
		 		    			"dataobject":"unit",
	             				"rule":JSON.stringify([[{"key":"name","op":"like","value":term}]])
		 	        		};
		 	    		}),
		 		        results:this.proxy(function(data,page){
		 		        	if(data.success){
		 		        		return {results:$.map(data.data.aaData,function(item,idx){
		 		        			return item;
		 		        		})};
		 		        	}
		 		        })
		 	        },
		 	        formatResult: function(item){
		 	        	return item.name;      		
		 	        },
		 	        formatSelection: function(item){
		 	        	return item.name;	        	
		 	        }
		         });
	  },
	  
	    addPlan:function(){
	    	var planDialog=null;
	    	if(planDialog==null){
	    		$.u.load("com.audit.terminal.planDialog");
			  	planDialog = new com.audit.terminal.planDialog($("div[umid=addPlan]"));	
		  		planDialog.override({
		  			addPlan: function(){}
		  	    }); 
		  		
	    	}
	    	planDialog.open();  
	    },
	    unitok:function(e){
	    	e.preventDefault();
	    	var $_tar = $(e.currentTarget);
	    	var targetid="";
	    	var datadata=$_tar.closest('.qiziModal').data("data");
	    	if($_tar.closest('.qiziModal').data("targetid")){
	    		 targetid=$_tar.closest('.qiziModal').data("targetid").split(",");
	    	}
	    	var dataq=$_tar.closest('.qiziModal').data("dataq");//季度
	    	var operatorid=$("input[name=unit]").val();
	    	if(operatorid){
	    		var planid=this.resultData.plans[0].id;
		    	var year=this.resultData.plans[0].year||new Date().format("yyyy");
		    	var obj={
		    		"plan":planid,
		    		"planType":"TERM",
		    		"target":targetid[0],//机场ID
		    		"year":year,
		    		"planTime":year+"0"+dataq,
		    		"workName":year+targetid[1]+"航站审计工作单",
		    		"reportName":year+targetid[1]+"航站审计报告",
		    		"operator":operatorid
		    		}
		    	if(datadata){
		    		var	array=[];
			    	array.push(JSON.parse(datadata).id-0);
		          	$.u.ajax({   //删除计划
	    				url : $.u.config.constant.smsmodifyserver,
	    				type:"post",
	    	            dataType: "json",
	    	            async:false,//async默认的设置值为true，这种情况为异步方式，false 是同步，一直等待，返回response后才会执行后面的代码
	    	            cache: false,
	    	            data: {
	    	            	"method": "stdcomponent.delete",
	    	            	"dataobjectids": JSON.stringify(array),
	    	                "tokenid": $.cookie("tokenid"),
	    	                "dataobject" : "task"
	    	            },
	    	    	}).done(this.proxy(function(response) {
	    	    		if(response.success){
	    	    			
	    	    		}
	    	    	}))
		    	}
		    	
		    	var data= {
		                "method": "createTask",
		                "tokenid": $.cookie("tokenid"),
		                "obj" : JSON.stringify(obj)
		            };
		    	/*if(this.resultData && this.resultData.workflowNodeAttributes 
		    			&& this.resultData.workflowNodeAttributes.flowStatus
		    			&& this.resultData.workflowNodeAttributes.flowStatus =="faBu"){*/
		    		$.extend(true,data,{"operate":"instanceTermTaskWorkflow"});
		    	/*}*/
		    		
		    				
		    	$.u.ajax({   //保存计划
					url : $.u.config.constant.smsmodifyserver,
					type:"post",
		            dataType: "json",
		            cache: false,
		            data:data,
		    	}).done(this.proxy(function(response) {
		    		if(response.success){
		    			this.get_plan();
		    			$('.qiziModal').modal('hide');
		    			$("input[name=unit]").val("");
		    		}
		    	}))
	    	}else{
	    		$.u.alert.error("单位不能为空");
	    	}
	    },
	    
	    
	    
	    

	    //删除旗子
	    delete_qizi:function(event){
	    	var $_current = $(event.currentTarget);
	    	var	array=[];
	    	array.push(parseInt(JSON.parse($_current.attr("datadata")).id));
			var clz = $.u.load("com.audit.terminal.confirm");
	        var confirm = new clz({
	            "body": "确认删除？",
	            "buttons": {
	                "ok": {
	                    "click": this.proxy(function(){
	                    	$.u.ajax({   //删除计划
	            				url : $.u.config.constant.smsmodifyserver,
	            				type:"post",
	            	            dataType: "json",
	            	            cache: false,
	            	            data: {
	            	            	"method": "stdcomponent.delete",
	            	            	"dataobjectids": JSON.stringify(array),
	            	                "tokenid": $.cookie("tokenid"),
	            	                "dataobject" : "task"
	            	            },
	            	    	}).done(this.proxy(function(response) {
	            	    		if(response.success){
	            	    			confirm.confirmDialog.dialog("close");
	            	    			this.get_plan();
	            	    		}
	            	    	}))
	                    })
	                }
	            }
	        });
			
			try{
//	    	
//	    		$.u.load("com.sms.common.stdcomponentdelete");
//	    		(new com.sms.common.stdcomponentdelete({
//	    			body:"<div>"+
//	    				 	"<p> 确认删除？</p>"+
//	    				 "</div>",
//	    			title:'操作提示',
//	    			dataobject:"task",
//	    			dataobjectids:JSON.stringify(array)
//	    		})).override({
//	    			refreshDataTable:this.proxy(function(){
//		    			this.get_plan();
//	    			})
//	    		});
	    	}catch(e){
	    		throw new Error("确认删除  "+e.message);
	    	}
			
	    },
	    
	    
	    
    /**
     * @title ajax
     * @param url {string} url
     * @param param {object} ajax param
     * @param $container {jQuery object} the object for block
     * @param blockParam {object} blockui param
     * @param callback {function} callback
     */
    _ajax:function(url,param,$container,blockParam,callback){
    
    	$.u.ajax({
    		"url":url,
    		"type": url.indexOf(".json") > -1 ? "get" : "post" ,
    		"data":$.cookie("tokenid") ? $.extend({"tokenid":$.parseJSON($.cookie("tokenid"))},param) : $.extend({"tokenid":$.parseJSON($.cookie("uskyuser")).tokenid},param),
    		"dataType":"json"
    	},$container,$.extend({},blockParam)).done(this.proxy(function(response){
    		if (response.success) {
    			callback && callback(response);
    		}   		
    	})).fail(this.proxy(function(jqXHR,responseText,responseThrown){
    		
    	}));
    },
    /**
     * @title 重置搜索框（供左侧过滤器列表点击时调用）
     */
    resetSearchBox: function(){
    	this.qid("search-query").val("");
    },
    /**
     * @title 加载左侧过滤器列表（重写）
     */
    refreshFilterList:function(filterid){},
    /**
     * @title 删除当前选中过滤器(重写)
     */
    removeCurrentFilter:function(){},
    destroy: function () {
    	this.planid=null;
    	this.resultData=null;
        this._super();
    }
}, { usehtm: true, usei18n: false });

com.audit.terminal.terminalplan.widgetjs = ["../../../uui/widget/select2/js/select2.min.js",
                                          "../../../uui/widget/jqdatatable/js/jquery.dataTables.js",
                                    	   "../../../uui/widget/jqdatatable/js/dataTables.bootstrap.js",
                                        "../../../uui/widget/spin/spin.js", 
                                        "../../../uui/widget/jqblockui/jquery.blockUI.js",
                                        "../../../uui/widget/ajax/layoutajax.js",
                                        '../../../uui/widget/jqurl/jqurl.js',
                                        ];
com.audit.terminal.terminalplan.widgetcss = [{ path: "../../../uui/widget/select2/css/select2.css" }, 
                                           { path: '../../../uui/widget/jqdatatable/css/jquery.dataTables.css' }, 
                                           { path: '../../../uui/widget/jqdatatable/css/dataTables.bootstrap.css' },
                                         { path: "../../../uui/widget/select2/css/select2-bootstrap.css" }];
