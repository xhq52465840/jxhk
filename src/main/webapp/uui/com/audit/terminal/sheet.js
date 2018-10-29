//@ sourceURL=com.audit.terminal.sheet
$.u.define('com.audit.terminal.sheet', null, {
    init: function (options) {
    	  
    	this._select2PageLength =10;
    	this._requiredPoint=false;
    	this._requiredUpload=false;
    	 this.ret=[]
	    	//下载:  计划,审计报告,签批件,完成情况
    	this.downloadtemp =	'<tr class="downloadtemp"><td class="name" field="plan_download">下载计划</td>'
				+'<td class="value" colspan="3" id="downloadplan">'
				+'<table qid="planFiles" class="table table-condensed ">'
		      	+'<thead><tr>'
		      			+'<th style="width: 60%;">文件名</th>'
		      			+'<th>文件大小</th>'
		      			+'<th style="width: 15%;">上传人</th>'
		      	+'</tr></thead>'
		      +'<tbody></tbody>'	
		      +'</table>'
				+'</td>'
			+'</tr>'
    	//检查要点	
    	this.checkPointTemp ='<div class="panel panel-sms">'
    			+'<div class="panel-heading">'
    				+'<h2 class="panel-title"><i class="glyphicon glyphicon-minus glyphicon-btn" style="padding-right: 5px;" ></i>检查要点'
    					+'<div class="pull-right">'
    						+'<div class="uui-cursor-pointer hidden" qid="add">'
    							+'<div class="">'
    								+'<img src="../img/add-question.png">'
    							+'</div>'
    						+'</div> '
    					+'</div>'
    				+'</h2>'
    			+'</div>'
    			+'<div class="panel-body">'
    				+'<div qid="checkpoints">'
    					+'<table qid="datatable" class="table table-striped table-bordered" cellspacing="0" style="margin-top: 0px !important;" width="100%">'
    		        	+'</table>'
    				+'</div>'
    				+'<div class="text-center hidden" qid="btn-showmore">'
    					+'<i class="fa fa-angle-double-down fa-lg uui-cursor-pointer"></i>'
    				+'</div>'
    				+'<div qid="conclusion" class="alert alert-info hidden" style="margin-bottom: 0px;"></div>'
    			+'</div>'
    		+'</div>'
    			
        	//审计结论
        	this.resulttemp ='<div class="panel panel-sms">'
    					+'<div class="panel-heading">'
    						+'<h2 class="panel-title">'
    						+'<i class="glyphicon glyphicon-minus glyphicon-btn" style="padding-right: 5px;"></i>审计结论'
    						+'</h2>'
    			       +'</div>'
    			      +'<div class="panel-body">' 
    			      +'<table class="uui-table" name="auditresult">'
    			     + '</table>'
    					 +'</div>'
        			+'</div>'
        		
    			//上传：计划,签批件,审计报告,签批件,完成情况
            	this.uploadtemp =	'<div class="panel panel-sms">'
        					+'<div class="panel-heading">'
        						+'<h2 class="panel-title">'
        						+'<i class="glyphicon glyphicon-minus glyphicon-btn" style="padding-right: 5px;"' 
        							+'></i>上传附件'
        						+'</h2>'
        			       +'</div>'
        			      +'<div class="panel-body">' 
        					 // + '<label for="<%= this._id%>-file_upload" class="col-sm-2 control-label">附件</label>' 
        					    +'<div class="col-sm-10" style="margin-top:15px;">'
        					     + '<input type="file" name="file_upload" qid="file_upload" id="uplooood" />'
        					   + '</div>'
        					   +'<div >'
        							   +'<table name="FilesList" class="table table-condensed hidden">'
        						      	+'<thead><tr>'
        						      			+'<th style="width: 60%;">文件名</th>'
        						      			+'<th>文件大小</th>'
        						      			+'<th style="width: 15%;">上传人</th>'
        						      			+'<th style="width: 15%;">操作</th>'
        						      	+'</tr></thead>'
        						      +'<tbody></tbody>'	
        						      +'</table>'
        					   +'</div>'
        					 +'</div>'
            			+'</div>'
        $.validator.addMethod( "compareDate", function( value, element, params ){
            var $compare = $(params), compareValue = $.trim($compare.val());
            if(value){
                value = new Date(value);
                if(compareValue){
                    compareValue = new Date(compareValue);
                    if(value - compareValue >= 0){
                        return true;
                    }
                    else{
                        return false;
                    }
                }
                else{
                    return true;
                }
            }
            else{
                return true;
            }
        }, "结束日期小于开始日期");
        
        $.validator.addMethod( "compareNowDate", function( value, element, params ){
            if(value){
                value = new Date(value);
            	value = value.getTime()+1000*60*60*24;
            	value = new Date(value);
                var now   = new Date();
                return value-now >= 0;
            }
            else{
                return true;
            }
        }, "日期不得早于今天");
        

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
           };
        this._DATATABE_LANGUAGE = { //语言
                "sSearch": this.i18n.search,
                "sLengthMenu": this.i18n.everPage+" _MENU_ "+this.i18n.record,
                "sZeroRecords": this.i18n.message,
                "sInfo": this.i18n.from+" _START_ "+this.i18n.to+" _END_ /"+this.i18n.all+" _TOTAL_ "+this.i18n.allData,
                "sInfoEmpty": this.i18n.withoutData,
                "sInfoFiltered": "("+this.i18n.fromAll+"_MAX_"+this.i18n.filterRecord+")",
                "sProcessing": ""+this.i18n.searching+"...",
                "oPaginate": {
                 /*   "sFirst": "<<",
                    "sPrevious": this.i18n.back,
                    "sNext": this.i18n.next,
                    "sLast": ">>"*/
                	  "sFirst": "",
	                   "sPrevious": "<span class='fa fa-caret-left fa-lg'></span>",
	                   "sNext": "<span class='fa fa-caret-right fa-lg'></span>",
	                   "sLast": ""
                }
        };
       this.isEmptyObject = function(obj){
    	   for(var i in obj){
    	        if(obj.hasOwnProperty(i)){
    	            return false;
    	        }
    	    }
    	    return true;
        }
       /**
        *  扩展jquery选择器的方法
        */
        $.fn.extend({
            mutton: function (s) {
                return s||""+" mutton is  muootn "+$(this).html() ;
            }
        });
        var size = 2;
        this._blockuiopts = {
                message: (new Spinner({ radius: 3 * size, width: 1 * size, length: 2 * size , color:"white" }).spin()).el, 
                overlayCSS: { 
                    backgroundColor: 'transparent' 
                },
                css:{
                    "background": "black", 
                    "border": "none",
                    "width":40,
                    "height":40,
                    "border-radius":8,
                    "left":"50%"
                }
            };
        
        $.datepicker._getInst = function(target) {
            try { 
         if ('object' === target.nodeName.toLowerCase()) {
            return false; 
                 } 
            return $.data(target, 'datepicker'); 
            } 
            catch (err) { 
                 throw 'Missing instance data for this datepicker'; 
            } 
         };
    },
    afterrender: function (bodystr) {
        this._wkid = $.urlParam().id;
        this._wkid = parseInt(this._wkid);
    	this.content = this.qid("content");
    	this.professionContainer = this.qid("professionContainer");				
        this.baoCun = this.qid("baoCun");
    	this.baoCun.off("click").on("click",this.proxy(this._save));
        this.btn_area= this.qid("btn_area");
    	this.form = this.qid("form");
    	this.managers=this.qid("managers");
    	this.teamLearder=this.qid("teamLearder");
		this.tbody=this.form.find('tbody');
 	    this.checkPoint=$("div.checkPoint");
		this.uploadDiv = $(".uploadDiv");
		this.resultDiv = $(".resultDiv");
 	    this.titleTip=$(".glyphicon-title");
        this.professionContainer.off("click", "input:checkbox").on("click", "input:checkbox", this.proxy(this._check));
        this._initColumn();
        $(document).ajaxStart($.blockUI(this._blockuiopts)).ajaxStop($.unblockUI);
        $("div.plugin-progress div.progress-bar").attr({
			"aria-valuenow":"100",
			"style":"width:100%"
		}).text("100%");
    
    },
  
    _initColumn : function(){
    	this.workName = this.qid("workName");
    	this.workNo = this.qid("workNo");
    	this.target = this.qid("target");
    	this.address = this.qid("address");
    	this.startDate = this.qid("startDate");
    	this.endDate = this.qid("endDate");
    	this.method = this.qid("method");
    	this.managers = this.qid("managers");
    	this.teamLeader=this.qid("teamLeader");
    	this.remark = this.qid("remark");
    	this.member = this.qid("member");
    	this.startDate.add(this.endDate).datepicker({
			dateFormat:"yy-mm-dd",
			onSelect:function(date){  
				this.focus();  
			}  
    	});
    	this.method.select2({
    		multiple: true,
    		//tags:['文件审核','现场检查','随机提问','跟班检查']
			data: [{id:'文件审核',text:'文件审核'},{id:'现场检查',text:'现场检查'},{id:'随机提问',text:'随机提问'},{id:'跟班检查',text:'跟班检查'}]
		});
    	this.managers.select2({
    		multiple: false,
	    	ajax:{
    			url: $.u.config.constant.smsqueryserver,
    			dataType: "json",
    			type: "GET",
	            data:this.proxy(function(term, page){
	            	return {
	        			"excludeOrgUsers":true,
	            		tokenid: $.cookie("tokenid"),
                        method: "getUserIdNameByGroupKey",
                        userName: term,
                        groupKey:"A1",
	    				"start": (page - 1) * this._select2PageLength,
	    				"length": this._select2PageLength
	    			};
	            }),
		        results:this.proxy(function(response, page, query){ 
		        	if(response.success){
		        		return {
		        			 results: response.data.aaData,
		        			 more: response.data.iTotalRecords > (page * this._select2PageLength) 
		        		};
		        	}
		        	else{
		        		$.u.alert.error(response.reason, 1000 * 3);
		        	}
		        })
    		},
    		formatSelection: function(item) {
    			if(item.username){
    				return item.fullname+"("+item.username+")";
    			}else{
    				return item.fullname || '';
    			}
            },
            formatResult: function(item){
            	
            	if(item.username){
    				return item.fullname+"("+item.username+")";
    			}else{
    				return item.fullname || '';
    			}
	        }
    	});
    	
    	//<-审计组长结束->
    	this.leftDiv = this.qid("left-div");
    	this._loadTask();
    },
    _loadTask : function(){
    	this._allowModifyCheckList=false;
    	this.canupload=false;
    	this._ajax(
			$.u.config.constant.smsqueryserver, 
			true, 
			{
				"method" : "getTermTaskById",
				"id" : this._wkid
			}, 
			this.$, 
			{},
			this.proxy(function(response) {
				if(response.success){
					this.targetId = response.data.task.target.targetId;
					this.workflow(response.data);
					this.data=response.data;
				}
			})
		);   
    },
    _fillFormData : function(data){
            if(data.logArea && data.logArea.key){
            	  this.qid("logsContainer").html("");
                var clz = $.u.load(data.logArea.key);
                var target = $("<div/>").attr("umid", "logs").appendTo(this.qid("logsContainer"));
                
                new clz( target, $.extend(true, data.logArea, {
                	businessUrl: this.getabsurl("Sheet.html?id=#{source}"),
                    logRule: [[{"key":"source","value": this._wkid}],[{"key":"sourceType","value":"task"}]],
                    remarkRule: [[{"key":"source","value": this._wkid}],[{"key":"sourceType","value":"task"}]],
                    remarkObj: {
                        source: this._wkid,
                        sourceType: "task"
                    },
                    addable: true,
                    flowid: data.task.flowId 
                }) );
            }
    	
    		this._disabledAll();
    		
            if(data.workflowNodeAttributes && $.isArray(data.actions) && data.actions.length > 0){
                if(data.workflowNodeAttributes.canDo){
                	$.each(data.workflowNodeAttributes.canDo.split(","), this.proxy(function(k,v){
                        this.canDo(v);
                    }));
                }
                if(data.workflowNodeAttributes.canModify){                  
                    $.each(data.workflowNodeAttributes.canModify.split(","), this.proxy(function(k,v){
                        this.canModify(v);
                    }));
                }
             
                if(data.workflowNodeAttributes.canModify){
                	 var exbaseInfo=['wanChengQingKuangTermFiles',
                	                 'qianPiJianTermFiles',
                	                 'reportTermFiles',
                	                 'shenHeQianPiTermFiles',
                	                 'taskTermFiles',
                	                 'workName',
                	                 'workNo',
                	                 'target',
                	                 'address',
                	                 'startDate',
                	                 'endDate',
                	                 'method',
                	                 'managers',
                	                 'teamLeader',
                	                 'member',
                	                 'remark'];
               	 this.ret=$.grep(data.workflowNodeAttributes.canModify.split(","), this.proxy(function(k,v){
                	 			return	$.inArray(k,exbaseInfo) == -1;
               			}));
                }
          
             
                if(data.workflowNodeAttributes.hiddenModel){
                    $.each(data.workflowNodeAttributes.hiddenModel.split(","), this.proxy(function(k,v){
                        if(v === "baseInfo"){
                            this.qid("toggle-baseinfo-panel").trigger("click");
                        }
                        else if(v === "logs"){
                            this.$.find("div[umid=logs]").find("[qid=toggle-panel]").trigger("click");
                        }
                        else if(v === "shenJiFanWei"){
                            this.qid("toggle-checkarea-panel").trigger("click");
                        }
                    }));
                }
              }
          
       
    },
    _filldate : function(data){
    	this.workName.val(data.task.workName||'');
    	this.workNo.val(data.task.workNo||'');
    	this.target.val(data.task.target.targetName||'');
    	this.address.val(data.task.address||'');
    	this.startDate.val(data.task.startDate||'');
    	this.endDate.val(data.task.endDate||'');
    	var v = data.task.method && data.task.method.split(",");
    	var d = [];
    	v && $.each(v,function(k,t){
    		d.push({id:t,text:t});
    	});
    	!this.isEmptyObject(d) && this.method.select2("data",d);
    	//项目主管
    	if(data.task.managers){
    		var m=data.task.managers[0];
    	}
    	if(!this.isEmptyObject(m)){
    		this.managers.select2("data",{id:m.id,fullname:m.name});
    	};
    	this.member.val(data.task.member||"");
    	this.remark.val(data.task.remark||'');
    	this.teamLeader.val(data.task.teamLeader||'');
    },
    _disabledAll : function(){
    	this.workName.add(this.workNo).add(this.target).add(this.address).add(this.startDate).add(this.endDate)
    		.add(this.remark).add(this.member).add(this.teamLeader).attr("disabled","disabled");
    	this.method.select2("enable", false);this.managers.select2("enable", false);
    },
   
    canModify : function(data){
    	switch(data){
	    	case "workName":
	    		this.workName.removeAttr("disabled");
	    		break;
	    	case "workNo":
	    		this.workNo.removeAttr("disabled");
	    		break;
	    	case "target":
	    		this.target.removeAttr("disabled");
	    		break;
	    	case "address":
	    		this.address.removeAttr("disabled");
	    		break;
	    	case "startDate":
	    		this.startDate.removeAttr("disabled");
	    		break;
	    	case "endDate":
	    		this.endDate.removeAttr("disabled");
	    		break;
	    	case "method":
	    		this.method.select2("enable", true);
	    		break;
	    	case "managers":
	    		this.managers.select2("enable", true);
	    		break;
	    	case "teamLeader":
	    		this.teamLeader.removeAttr("disabled");
	    		break;
	    	case "member":
	    		this.member.removeAttr("disabled");
	    		break;
	    	case "remark":
	    		this.remark.removeAttr("disabled");
	    		break;
	    	case "taskTermFiles":
	    		this.canupload=true;
	    		break;
	    	case "shenHeQianPiTermFiles":
	    		this.canupload=true;
	    		break;
	    	case "reportTermFiles":
	    		this.canupload=true;
	    		break;
	    	case "qianPiJianTermFiles":
	    		this.canupload=true;
	    		break;
	    	case "wanChengQingKuangTermFiles":
	    		this.canupload=true;
	    		break;
	    	
    	}
    },
    canDo : function(data){
    	switch(data){
    		case "baoCun":
    			$('button[qid='+data+']').removeClass("hidden");
    			break;
    	}
    },
    _fillBtn : function(data){
    	 this.btn_area.empty();
    	 var actionData= data.actions;
    	 var fox = false;//若存在可填字段 ，右上角按钮添加保存
    	 var baseInfo=[];
    	 this.tbody.find("input,textarea").each(this.proxy(function(idx,item){
    		 	baseInfo.push($(item).attr("name"));
    	 }))
    	
    	 if(data.workflowNodeAttributes && data.workflowNodeAttributes.canModify
    		&& data.workflowNodeAttributes.canModify.split(",").length > 0){
    		 $.each(data.workflowNodeAttributes.canModify.split(","),this.proxy(function(idx,item){
    			 if($.inArray(item,baseInfo) != -1){
    				  fox = true;
    			 }
    		}))
    	 }
    	
    	 if(actionData.length > 0){
    		  var hdata = [];
        	  if(data.workflowNodeAttributes.flowStatus === "jianChaBaoGao"){
        		  hdata.push({"name":"导出","key":"export"});
          		}
    		  fox && hdata.push({"name":"保存","key":"save"});
    		  $.each(actionData || [],this.proxy(function(k,v){
          	    this.btn_area.append('<button class="btn btn-success  next" name="'
            			+v.name+'" wipId="'+v.wipId
            			+'" style="text-shadow:0 0px 0 #ffffff;">'+v.name+'</button>');
              }))
              $.each(hdata || [],this.proxy(function(k,v){
            	  this.btn_area.append('<button class="btn btn-success '+v.key+' " name="'
            			+'" style="text-shadow:0 0px 0 #ffffff;">'+v.name+'</button>');
              }))
        	  this.btn_area.off("click","button.next").on("click","button.next",this.proxy(this._next));
        	  this.btn_area.off("click","button.save").on("click","button.save",this.proxy(this._save));
        	  this.btn_area.off("click","button.export").on("click","button.export",this.proxy(this._export));
    	 	}
    	 
    },
    _next : function(e){
    	this.curr_btn  = $(e.currentTarget).attr("name");
        e.preventDefault();
        var data = this._getParam();
        var $e = $(e.currentTarget);
        var id = $e.attr("wipId");
        var body="确认操作！";
        var width=600;
        if(this.curr_btn!=="审计记录"){
        	 var soupArray=$.grep( this.datatable.data()||[],this.proxy(function(item,idx){
        		return item.auditResultName==="";
	        }));
	        if(soupArray.length!==0){
	        	return $.u.alert.info("存在有未处理的要点项！",2000)
	        }
        }
        if($.trim(this.curr_btn)==="拒绝" ||$.trim(this.curr_btn)==="不通过"){
        	body="<div><lable class='col-md-3'>请填写"+this.curr_btn+"理由：</lable>" +
    		"<textarea class='col-md-9' name='reject' maxlength='500' rows='7'></textarea></div>";
        	width=800;
        }else{
        	 if(this.uploadDiv.children().length>0){
             	if(this.uploadDiv.find("tbody").children().length==0){
             		return $.u.alert.info("请上传附件！",2000)
             	}
             }
        }
        
        if(this.form.valid() && this._validPoint()){
        	var clz =$.u.load("com.audit.terminal.confirm")
            var confirm = new clz({
                "body": body,
                "width": width,
                "buttons": {
                    "ok": {
                        "click": this.proxy(function(event){//保存
                        	if(	$("textarea[name=reject]",confirm.confirmDialog).length>0){
                        		var val=$("textarea[name=reject]").val()||"";
                            	if(val==""){
                            		return $.u.alert.info("填写拒绝理由！",2000)
                            	}
                            	data.reject=val;
                        	}
                            this._ajax(
                                $.u.config.constant.smsmodifyserver, 
                                true, 
                                {
                                	"method" : "stdcomponent.update",
                					"dataobjectid" : this._wkid,
                					"dataobject" : "task",
                					"obj" : JSON.stringify(data)
                                }, 
                                confirm.confirmDialog.parent(), 
                                {},
                                this.proxy(function(response) {
                                    if(response.success){   
                                        this._ajax(
                                            $.u.config.constant.smsmodifyserver, 
                                            true, 
                                            {
                                                "method": "operate",
                                                "tokenid": $.cookie("tokenid"),
                                                "action" : id,
                                                "dataobject" : "task",
                                                "id" : this._wkid,
                                            }, 
                                            confirm.confirmDialog.parent(), 
                                            {},
                                            this.proxy(function(response) {
                                                if(response.success){            
                                                    confirm.confirmDialog.dialog("close");            
                                                    $.u.alert.success("操作成功");
                                                    this._loadTask();
                                                }
                                            })
                                        );
                                    }
                                })
                            );
                        })
                    }
                }
            });
    		
    	}
        this.$.find(".select2-container:hidden").show();
    },
    _export:function(){
    	var form = $("<form>");
        form.attr('style', 'display:none');
        form.attr('target', '_blank');
        form.attr('method', 'post');
        form.attr('action', $.u.config.constant.smsqueryserver+"?method=exportAuditReportToPdf&tokenid="+$.cookie("tokenid")+"&id="+ this._wkid);
        form.appendTo('body').submit().remove();
    },
    _getParam : function(){
    		var managers=new Array();
        	managers.push(Number(this.managers.select2("val")));
        	return {
                address: this.address.val(),
                startDate: this.startDate.val(),
                endDate: this.endDate.val(),
                method: this.method.val(),
                managers:managers,
                teamLeader:this.teamLeader.val(),
                member: this.member.val(),
                remark: this.remark.val()
            };	
    },
   
    
    creatDialog:function(){
    	 this.addDialog = this.qid("addDialog").removeClass("hidden").dialog({
    	    	title:"添加检查项",
    	        width:840,
    	        modal: true,
    	        draggable: false,
    	        resizable: false,
    	        autoOpen: false,
    	        buttons:[{
    				  "text":"保存",
    				  "click":this.proxy(this.on_addDialog_save)
    			  },
    	   		  {
    	   			  "text":"取消",
    	   			  "class":"aui-button-link",
    	   			  "click":this.proxy(this.on_addDialog_cancel)
    	   		  }
    	   		],
    	        close: this.proxy(this.on_addDialog_close),
    	        open: this.proxy(this.on_addDialog_open)
    	    });
    	 this.addPointDialog = this.qid("addPointDialog").removeClass("hidden").dialog({
             title:"增加临时审计要点",
             width:840,
             modal: true,
             draggable: false,
             resizable: false,
             autoOpen: false,
             buttons:[
               {
 				  "text":"保存",
 				  "click":this.proxy(this.on_addPointDialog_save)
 			  },
        		  {
        			  "text":"取消",
        			  "class":"aui-button-link",
        			  "click":this.proxy(this.on_addPointDialog_cancel)
        		  }
        		],
             open: this.proxy(function(){
                 var zIndex = parseInt(this.addDialog.parent().css("z-index"));
                 $("body>.ui-dialog:last").css("z-index", zIndex + 2);
                 $("body>.ui-widget-overlay:last").css("z-index", 1050);
             }),
             close: this.proxy(this.on_addPointDialog_close),
             create: this.proxy(this.on_addPointDialog_create)
         });
    },
    
   
    on_addPointDialog_create : function(){
        this.pointForm = this.qid("pointForm"); //增加临时审计要点
        this.pointForm.validate({
			rules:{
				"point": "required",
				"according": "required",
				"prompt": "required"
			},
    		messages:{
				"point": "审计要点不能为空",
				"according": "审计依据不能为空",
				"prompt": "审计提示不能为空"
			},
    		errorClass: "text-danger text-validate-element",
            errorElement:"div"
		});
    },
   
   
    _addPoints : function(){
		this.addDialog.dialog("open");
	},
	on_addDialog_cancel : function(){
		this.addDialog.dialog("close");
	},
	on_addDialog_close : function(){
		this.addDialog.find("textarea").val(''); 
        $.fn.zTree.destroy();
	},
	on_addDialog_open : function(){
        this._createTree();
	},
    _createTree : function(){
        var setting = {
            view : {
                selectdMulti : false  
            },
            check : {
                enable : true  
            },
            data : {
                simpleData: {
				    enable: true
				}
            },
            callback : {
                onClick : this.proxy(this._treeClick),
                onRightClick : this.proxy(this._treeRightClick)
            }
        };
        this._ajax(
            $.u.config.constant.smsqueryserver,
            true,
            {
                "method": "getItemTree",
                "rule":JSON.stringify([[{key:"taskId","value":this._wkid}]])
            },
            this.addDialog,
            {},
            this.proxy(function (response) {
                if (response.success) {
                    var checkArray = $.map(this.datatable.data(), function(item, idx){
                        return  item.itemId || item.actionItemId || null;
                    });
                    var zNodes=$.map(response.data.aaData,this.proxy(function(perm,idx){
        				return {
                            id:perm.id,
                            pId:perm.parentId,
                            name:perm.name,
                            type:perm.type,
                            checked: $.inArray(perm.id, checkArray) > -1,
                            chkDisabled: $.inArray(perm.id, checkArray) > -1
                        };
        			}));
        			this.tree=$.fn.zTree.init(this.leftDiv, setting, zNodes);
                }
            })
        ); 
    },
    _treeClick : function(event, treeId, treeNode){
        if(!treeNode.id){
            this.addDialog.find("textarea[name=point]").val(treeNode.name);
            this.addDialog.find("textarea[name=according]").val('');
            this.addDialog.find("textarea[name=prompt]").val('');
        }else {
            this._ajax(
                $.u.config.constant.smsqueryserver,
                true,
                {
                    "method": "stdcomponent.getbyid",
                    "dataobject" : "item",
    				"dataobjectid" : treeNode.id
                },
                this.addDialog,
                {},
                this.proxy(function(response){
                    if (response.success) {
                        this.addDialog.find("textarea[name=point]").val(response.data.point);
                        this.addDialog.find("textarea[name=according]").val(response.data.according);
                        this.addDialog.find("textarea[name=prompt]").val(response.data.prompt);
                    }
                })
            );
        }
    },
    
    
    _treeRightClick : function(event, treeId, treeNode){
        if(treeNode && treeNode.name == "临时检查项"){
            this.tempId = treeNode;
            this.addPointDialog.dialog("open");
        }
    },
    on_addDialog_save : function(){
        var nodes = this.tree.getCheckedNodes(true);
        var param = [];
        var ids=[]
        if(nodes.length){
             $.each(nodes,this.proxy(function(k,v){
                 if(!v.isParent /*&& v.pId*/){
                     param.push({"id":v.id,"type":v.type});
                     ids.push(v.id.toString());
                 }
             }));
        }
       var obj={"checkListIds":ids,"taskId": this._wkid}
        if(ids.length){
            this._ajax(
                $.u.config.constant.smsmodifyserver,
                true,
                {
                    "method": "saveCheckList",
                    "obj":JSON.stringify(obj)
                },
                this.addDialog,
                {},
                this.proxy(function(response){
                    if (response.success) {
                        this.addDialog.dialog("close");
                	    this._loadTask();
                    }
                })
            ); 
        }else{
            $.u.alert.error("未选中叶子节点");
        }
	},
	 on_addPointDialog_save : function(){ //TODO 保存启用状态下的节点
		 if(this.pointForm.valid()){
	           var param = {
	        		"taskId": this._wkid,
	                "parentId":this.tempId.id,
	                "point":this.addPointDialog.find("textarea[name=point]").val(),
	                "according":this.addPointDialog.find("textarea[name=according]").val(),
	                "prompt":this.addPointDialog.find("textarea[name=prompt]").val()
	            };
	            this._ajax(
	                $.u.config.constant.smsmodifyserver,
	                true,
	                {
	                    "method": "addTMPItem",
	                    "obj":JSON.stringify(param)
	                },
	                this.addPointDialog,
	                {},
	                this.proxy(function(response){
	                    if (response.success) {
	                    	this.tree.addNodes(this.tempId, {id:response.data, pId:this.tempId.id, name:param.point});
	                        this.addPointDialog.dialog("close");
	                    }
	                })
	            ); 
	        }
	    },
    on_addPointDialog_cancel : function(){
        this.addPointDialog.dialog("close");
    },
    on_addPointDialog_close : function(){
        this.addPointDialog.find("textarea").val('');
        this.tempId = '';
    },
	_creatTable:function(data){
		var	aaData=data.task.checkLists||[];
    	//检查要点列表
	    var columns=[
		             { "title": "序号" ,"mData":"id", "class":"tdidx","width":"8%"},
		             { "title": "检查要点" ,"mData":"itemPoint", "class":"","width":"62%"},
		             { "title": "检查结论" ,"mData":"auditResultName", "class":"","width":"20%"}
		         ];
	    var  columnsDefs=[
		           {
		               "aTargets": 0,
		               "orderable":false,
		               "sClass": "tdidx",//序号
		               "sContentPadding": "mmm",
		               "mDataProp": "engine", 
		               "sDefaultContent": "--",//允许给列值一个默认值，只要发现null值就会显示默认值
		               "mRender": function (data, type, full) {
		                    return  '';
		               }
		           },
		           {
		               "aTargets": 1,
		               "sDefaultContent": "--",
		               "sClass": "",
		               "orderable":false,
		               "mRender": function (data, type, full) {
		             	 return  "<a href='#' class='rModify'>" + data + "</a>";
		               }
		           },
		          {
		              "aTargets": 2,
		              "sClass": "",
		              "sDefaultContent": "--",
		              "mRender": function (data, type, full) {
		                   return  data;
		              }
		          }
		          
		      ];
	
		var handelcoldef={
	        "aTargets": 3,
	        "sClass": "",
	       // "visible": false,
	        "mRender": function (data, type, full) {
	       	 "<button type='button' class='btn btn-link edit' data='"+JSON.stringify(full)+"'>编辑</button>"
	  			+  "<button type='button' class='btn btn-link delete' data='"+JSON.stringify(full)+"'>删除</button>";
	       	  return  "<span data-id='" + data + "' class='uui-cursor-pointer del'><span class='glyphicon glyphicon-trash'></span></span>" ;
	        }
	    }
		var handelcol={ "title": "操作" ,"mData":"id","class":"handle","width":"10%"};
		this.checkPoint.find("div[qid=add]").is(":visible") && columnsDefs.push(handelcoldef) && columns.push(handelcol)
		
	    this.datatable = this.checkPoint.find("table").DataTable({
	    		 destroy: true,
	             searching: false,
	             serverSide: false,
	             bProcessing: false,
	             ordering: false,
	             pageLength : 1000,
	             "aaData":[],//aaData||[],
	             "columns": columns,
	             "sDom":"",
	             "oLanguage": { //语言
	                 "sZeroRecords": "抱歉未找到记录",
	                 "sInfoEmpty": "没有数据",
	             },
	            // "bInfo":false,
	            // "bDeferRender":false,
	             "aoColumnDefs":columnsDefs ,
	             "rowCallback": this.proxy(function(row, data, index){
	            	//C9E5C1 
	            	 
	            	  if(data.auditRecord && data.auditRecord.length > 0){
                          $(row).attr("style", "background-color: #dff0d8 !important");
                      }
	            	  $(row).children("td:first").text(index + 1);
                      $(row).data("data", data);
	             })
	         });
	    
	    	 this.datatable.off("click", ".rModify").on("click", ".rModify", this.proxy(this.modifyRow));
	         this.datatable.off("click", ".del").on("click", ".del", this.proxy(this.deleteRow));
	         var newaaData=  $.map(aaData,this.proxy(function(item,idx){
	        	 item.auditResultName=item.auditResultName||"符合项";
	        	 return item
	         }))
	         this.datatable.clear();
	         this.datatable.rows.add(newaaData).draw();
       
      
      /*   DataTable.Clear()//清除了所有
           DataTable.Table.Rows.Clear()//清除行数据，结构保留 */
       /*  this.datatable.fnClearTable();
         this.datatable.fnAddData(aaData)*/
	},
	deleteRow : function(e) {
		e.preventDefault();
		var $e = $(e.currentTarget);
		var id = parseInt($e.attr("data-id"));
        var clz = $.u.load("com.audit.comm_file.confirm");
        var confirm = new clz({
            "body": "确认操作？",
            "buttons": {
                "ok": {
                    "click": this.proxy(function(){
                        this._ajax(
                            $.u.config.constant.smsmodifyserver, 
                            true, 
                            {
                                "method" : "stdcomponent.delete",
                                "dataobject" : "checkList",
                                "dataobjectids" : JSON.stringify([id])
                            }, 
                            confirm.confirmDialog.parent(), 
                            {},
                            this.proxy(function(response) {
                                if(response.success){
                                    confirm.confirmDialog.dialog("close");
                                   // this.datatable.fnDeleteRow( $e.closest("tr") )
                                   //this.datatable.row($(this).parents('tr') ).remove().draw();
                                   this.datatable.row($e.closest("tr")).remove().draw();
                                }
                            })
                        );
                    })
                }
            }
        });		
	},
	modifyRow : function(e){
		e.preventDefault();
		var $e = $(e.currentTarget);
		var data = this.datatable.row($e.closest("tr")).data();
        if(data){
           if(!this.recordDiForm){
                $.u.load('com.audit.terminal.detailDialog');
                var sda=JSON.stringify(data);
                com.audit.terminal.detailDialog.prototype.makeSound = this.proxy(function(s){
                	});
                //var recordDiForm =com.audit.terminal.detailDialog._create()
                this.recordDiForm = new com.audit.terminal.detailDialog($("div[umid='recordDiForm']",this.$), {"editable":this._allowModifyCheckList});
           }
           
            this.recordDiForm.makeSound(sda);
            this.recordDiForm.override({
                refresh: this.proxy(function(formData){
                	data.files=formData.files;
                  this.datatable.row($e.closest("tr")).data($.extend(true, {}, data, {
                        auditRecord: formData.auditRecord,
                        auditResultName: formData.auditResultName,
                        improveLastDate: formData.improveLastDate,
                        termResponsibilityUnit:formData.termResponsibilityUnit
                    })).draw();
                })
            });
            this.recordDiForm.open(data,this.ret,{"editable": this._allowModifyCheckList});
        }
        else{
            console.error("未获取到data");
        }
	},
	

	//下载附件
	 on_downloadFile_click: function(e){
	        var data = parseInt($(e.currentTarget).attr("fileid"));
	        window.open($.u.config.constant.smsqueryserver+"?method=downloadFiles&tokenid="+$.cookie("tokenid")+"&ids="+JSON.stringify([data])+"&url="+window.location.href);
	    },
	    //删除附件
    on_deleteFile_click: function(e){
        var $this = $(e.currentTarget),
            $tr = $this.closest("tr"),
            data = $(e.currentTarget).closest("tr").data("data");
        if(data && data.id){
            var clz = $.u.load("com.audit.comm_file.confirm");          
            var confirm = new clz({
                "body": "确认删除？",
                "buttons": {
                    "ok": {
                        "click": this.proxy(function(){
                            $.u.ajax({
                                url: $.u.config.constant.smsmodifyserver,
                                type: "post",
                                dataType: "json",
                                data: {
                                    tokenid: $.cookie("tokenid"),
                                    method: "stdcomponent.delete",
                                    dataobject: "file",
                                    dataobjectids: JSON.stringify([data.id])
                                }                                
                            }, confirm.confirmDialog.parent()).done(this.proxy(function(response){
                                if(response.success){
                                    confirm.confirmDialog.dialog("close");
                                    $tr.fadeOut(this.proxy(function(){
                                        $tr.remove();
                                        if($("table[name=FilesList]",this.form).children("tbody").children("tr").length< 1){
                                        	$("table[name=FilesList]",this.form).addClass("hidden");
                                        }
                                    })); 
                                }
                            }));
                        })
                    }
                }
            }); 
        }
	},
	workflow:function(data){
    	if(!data){
			this.content.addClass("hidden");
			$.u.alert.error("没有数据");
    		return
    	}
		this._fillFormData(data);	//日志。 不可编辑。可编辑。必填。
		var str=data.workflowNodeAttributes.flowStatus||"jiHua";
		switch(str){
		    //
    	case 'jiHua'://工作计划
    		this._addwork_jiHua(data);
			break;
    	case "fenPeiZhuGuan":
    		this._addwork_jiHua(data);
			break;
    	case 'shenHe'://计划的审核
    		this._addwork_shenHe(data);
			break;
			//
		case 'xuanZeYaoDian'://选择要点
			this._addpoint(data);
			break;
		case 'shenJiJiLu'://填写审计记录
			this._addjilu(data);
			break;
		case 'jianChaBaoGao'://上传审计报告
			this._addjilu(data);
			this._addpoint(data);
			this._addreport(data);
			break;
		case 'baoGaoShenHe'://审计报告的审核
			this._addreportshenhe(data);
			break;
			//
		case 'wanChengQingKuang'://上传完成情况
			this._addfinish(data);
			break;
		case 'wanChengQingKuangShenHe'://完成情况的审核
			this._addfinishshenhe(data);
			break;
			//
		case 'jieAn'://jieAn
			this._addjieAn(data);
			break;
		default:
			window.open("../terminal/TerminalAudit.html" , '_blank');
		}
		this._fillBtn(data);
		this._filldate(data);//基本信息
      	this._creatTable(data);
      	this._required(data);//必填
      	this._init_glyphicon();
		 
	
	},
	_addwork_jiHua:function(data){//上传计划
			 this.creat_reject(data.task.reject||"");//拒绝意见
			 this.uploadDiv.empty().append(this.canupload && this.uploadtemp);
			 this.initUpLoad("上传计划",13);
			 this.appendToTbody(data.task.taskTermFiles);
			
	},
	_addwork_shenHe:function(data){//下载计划
			 this.td_down_file(data.task.taskTermFiles,"下载计划");
			 this.uploadDiv.empty().append(this.canupload &&this.uploadtemp);
			 this.initUpLoad("上传签批件",21);
			 this.appendToTbody(data.task.taskTermFiles);
			 //this._fillBtn(data);
	},
	_addpoint:function(data){//添加审计要点
		 	this.uploadDiv[0].innerHTML = "";
		     this.creatDialog();
		    // this._fillBtn(data);
		     this.td_down_file(data.task.taskTermFiles,"下载签批件");//
		     if(data.actions && data.actions[0] && data.actions[0].name && data.actions[0].name=="提交"){
		    	 this.checkPoint[0].innerHTML = "";
		    	 this.checkPoint.append(this.checkPointTemp);
			      this.add =this.checkPoint.find("div[qid=add]");
			      this.add.off("click").on("click", this.proxy(this._addPoints));
		    	 !this.add.is(":visible") && this.add.removeClass("hidden");
		     }
	},
	_addjilu:function(data){//填写审计记录
			if(data.actions && data.actions[0] && data.actions[0].name && data.actions[0].name=="提交"){
				this._allowModifyCheckList=true;
			}
		    this.checkPoint[0].innerHTML = ""
		    this.checkPoint.append(this.checkPointTemp);
		    this.creatDialog();
		   // this._fillBtn(data);
	},
   _addreport:function(data){//上传审计报告
	   		this.creat_reject(data.task.reject||"");//拒绝意见
	        this.checkPoint[0].innerHTML = "";
		    this.checkPoint.append(this.checkPointTemp);//检查要点
		    this.add =this.checkPoint.find("div[qid=add]");
		    this.add.off("click").on("click", this.proxy(this._addPoints));
	    	!this.add.is(":visible") && this.add.removeClass("hidden");
		    this.creatDialog();//要点弹出
		    this.resultDiv[0].innerHTML = "";
		    this.resultDiv.append(this.resulttemp);//勾画审计结论
		    this.initResult(data);//填充审计结论
		    this.uploadDiv[0].innerHTML = ""
		    this.uploadDiv.append(this.canupload &&this.uploadtemp);//上传附件
		    this.initUpLoad("上传审计报告",14);//初始化上传附件
		    this.appendToTbody(data.task.reportTermFiles);//填充已上传的附件
		    //this._fillBtn(data);
		    
	},
	_addreportshenhe:function(data){//下载报告 /上传签批件 
			this.tbody.find("[data-field=workNo]").replaceWith("<td class='name' data-field='workNo'>审计报告编号</td>")
			this.titleTip.siblings("span").replaceWith("<span>外站审计报告基本信息</span>")
	        this.checkPoint[0].innerHTML = ""
	        this.checkPoint.append(this.checkPointTemp);
			this.resultDiv[0].innerHTML = ""
			this.resultDiv.append(this.resulttemp);
			this.initResult(data);//审计结论
		    this.uploadDiv[0].innerHTML = ""
		    this.uploadDiv.append(this.canupload &&this.uploadtemp);
		    this.initUpLoad("上传签批件",16);
	        this.td_down_file(data.task.reportTermFiles,"下载报告");
		    this.creat_reject(data.task.reject);//拒绝意见
	        this.appendToTbody(data.task.qianPiJianTermFiles);
	        //this._fillBtn(data);
	},
	
   _addfinish:function(data){// 下载签批件 /上传完成情况 
		    this.tbody.find("[data-field=workNo]").replaceWith("<td class='name' data-field='workNo'>审计报告编号</td>")
		    this.titleTip.siblings("span").replaceWith("<span>航站整改反馈基本信息</span>")
		    this.checkPoint[0].innerHTML = "";
		    this.checkPoint.append(this.checkPointTemp);
		    this.resultDiv[0].innerHTML = "";
		    this.resultDiv.append(this.resulttemp);
		    this.initResult(data);//审计结论
		    this.uploadDiv[0].innerHTML = "";
		    this.uploadDiv.append(this.canupload && this.uploadtemp);
		    this.initUpLoad("上传完成情况",17);
		    this.td_down_file(data.task.qianPiJianTermFiles,"下载签批件");
		    this.creat_reject(data.task.reject || "");//拒绝意见
		    this.appendToTbody(data.task.wanChengQingKuangTermFiles);
		   // this._fillBtn(data);
	},
	_addfinishshenhe:function(data){//下载完成情况
		     this.tbody.find("[data-field=workNo]").replaceWith("<td class='name' data-field='workNo'>审计报告编号</td>")
			 this.titleTip.siblings("span").replaceWith("<span>航站整改反馈基本信息</span>")
			 this.checkPoint[0].innerHTML = "";
			 this.checkPoint.append(this.checkPointTemp);
			 this.resultDiv[0].innerHTML = "";
		     this.resultDiv.append(this.resulttemp);
			 this.initResult(data);//审计结论
			 this.uploadDiv[0].innerHTML = "";
	         this.td_down_file(data.task.wanChengQingKuangTermFiles,"下载完成情况");
	        // this._fillBtn(data);
	},
	_addjieAn:function(data){
		     this.tbody.find("[data-field=workNo]").replaceWith("<td class='name' data-field='workNo'>审计报告编号</td>")
			 this.titleTip.siblings("span").replaceWith("<span>航站整改反馈基本信息</span>")
			 this.checkPoint[0].innerHTML = "";
			 this.checkPoint.append(this.checkPointTemp);
			 this.resultDiv[0].innerHTML = "";
		     this.resultDiv.append(this.resulttemp);
			 this.initResult(data);//审计结论
			 this.uploadDiv[0].innerHTML = "";
			 //this._fillBtn(data);
	},
	
	td_down_file:function(data,title){
		    var files=data;
			if(this.tbody.find("tr.downloadtemp")){
				this.tbody.find("tr.downloadtemp").remove();
			}
			if(this.tbody.find("td#downloadplan").length==0){
				this.tbody.append(this.downloadtemp);
				$("[field=plan_download]",this.tbody).text(title);
				var $tbody = this.tbody.find("#downloadplan").find("tbody");
			    $.each(files||[],this.proxy(function(idx,file){
			    		var num=idx+1;
			    	      $("<tr>"+
	                         "<td>"+num+".<a href='#' style='margin-left: 20px;' class='download' fileid='"+file.id+"'>" + file.fileName + "</a></td>" +
	                         "<td>" + file.size + "</td>" +
	                         "<td>" + file.uploadUser +"</td>" +
	                       "</tr>").data("data", file).appendTo($tbody);
			    })) 
			  
	        }
			this.tbody.off("click", ".download").on("click", ".download", this.proxy(this.on_downloadFile_click));
	},
	//审核拒绝意见
	creat_reject:function(reject){
		if(reject){
			var html='<tr class="rejecttemp"><td class="name" field="reject">拒绝意见</td>'+
					 '<td class="value" colspan="3" name="reject">'+reject+'</td></tr>';
			this.tbody.find("tr.rejecttemp").remove();
			this.tbody.append(html);
		}
	},
	
	//上传
	initUpLoad:function(text,sourceType){
		this.planupload=$("input[name=file_upload]")
		this.planupload.uploadify({
            'auto':true,
            'swf': this.getabsurl('../../../uui/widget/uploadify/uploadify.swf'),
	        'uploader': $.u.config.constant.smsmodifyserver+"?tokenid="+$.cookie("tokenid")+"&method=uploadFiles&sourceType="+sourceType+"&source="+this._wkid,
            //'uploader': $.u.config.constant.smsmodifyserver+";jsessionid="+$.cookie("sessionid"),
            'fileTypeDesc':'doc',
            'fileTypeExts':'*.*',//可上传文件格式 *.doc;*.docx;*.rar;*.xls;*.ppt;*.ppt;*.pdf;*.jpg;*.bmp;*.png;*.xlsx;*.pptx;
            'removeCompleted': true,
            'buttonText': text,
            'cancelImg':this.getabsurl('../../../uui/widget/uploadify/uploadify-cancel.png'),
            'height': 30,   //按钮的高度和宽度
            'width': 200,
            'progressData':'speed',
            'method': 'get',
            'removeTimeout': 3,
            'successTimeout': 99999,
            'multi': true,
            'fileSizeLimit':'10MB',
            'queueSizeLimit':999,
            'simUploadLimit':999,
            'onQueueComplete':this.proxy(function(queueData){
            }),
            "onSWFReady": this.proxy(function(){
               // this.qid("file_upload").uploadify("disable", this._options.editable === false)
            }),
            'onUploadStart':this.proxy(function(file) {
             /*   var data = {
                    tokenid: $.cookie("tokenid"),
                    method: "uploadFiles",
                    sourceType: 13,
                    source: this._wkid
                };
        
                $("input[name=plan_upload]").uploadify('settings', 'formData', data);*/
                //this.$.find(".uploadify-queue").removeClass("hidden");
            }),
            'onUploadSuccess':this.proxy(function(file, data, response) {
                if(data){
                    data = JSON.parse(data);
                    if(data.success && data.data && $.isArray(data.data.aaData) && data.data.aaData.length > 0){
                    	this.appendToTbody(data.data.aaData);
                    	
                    }
                    else{
                        $.u.alert.error(data.reason, 1000 * 3);
                    }
                }
            })
        });
    
	},
	//上传
	appendToTbody:function(files){
    	this.FilesList=$("[name=FilesList]").removeClass("hidden");
        var $tbody = this.FilesList.children("tbody");
        this.$.find(".uploadify-queue").addClass("hidden");
        if(!this.FilesList.is(":visible")){
        	this.FilesList.removeClass("hidden");
        }
        $.isArray(files) && files.length==0 && this.FilesList.addClass("hidden"); 
        $.each(files||[],this.proxy(function(idx,file){
	        $("<tr>"+
	            "<td><a href = '#' class = 'download' fileid='"+file.id+"'>" + file.fileName + "</a></td>" +
	            "<td>" + file.size + "</td>" +
	            "<td>" + file.uploadUser + "</td>" +
				"<td><i class='fa fa-trash-o uui-cursor-pointer delete-file' style='padding-right: 10px;' fileid='"+file.id+"'/></td>" +
	          "</tr>").data("data", file).appendTo($tbody);
        }))
        
        $tbody.off("click", ".delete-file").on("click", ".delete-file", this.proxy(this.on_deleteFile_click));
        $tbody.off("click",".download").on("click", ".download", this.proxy(this.on_downloadFile_click));
	},
	
	initResult:function(data){
		var _temp="<tr><td style='width: 10%;'>结论 : </td>" +
		"<td><p class='p_result_textarea' dataid='' style='word-wrap: break-word;border-radius: 10px;margin-bottom: 20px;padding: 20px;'>"+(data.task.termResult||"")+"</p></td>" +
		"<td><i class='glyphicon glyphicon-pencil text-right' style='display:block;cursor: pointer;'></i>" +
		"<button name='result_save' type='button' class='btn btn-default btn-sm  result_save hidden' style='margin-top:30px;'>保存</button></td></tr>"
		  this.resultDiv.find("table").append(_temp);
		//不可编辑allResult  shenJiBaoGao  baoGaoShenHe
		if(data.actions.length ){
			if(data.workflowNodeAttributes.flowStatus==="shenJiBaoGao" || data.workflowNodeAttributes.flowStatus==="baoGaoShenHe" ){
				this.resultDiv.find("i.glyphicon-pencil").removeClass("hidden");
			}else{
				this.resultDiv.find("i.glyphicon-pencil").addClass("hidden");
				this.resultDiv.find("p.p_result_textarea").removeClass("p_result_textarea").addClass("bg-porp");
			}
		}else{
			this.resultDiv.find("i.glyphicon-pencil").addClass("hidden");
			this.resultDiv.find("p.p_result_textarea").removeClass("p_result_textarea").addClass("bg-porp");
		}
		
		
		
		  this.resultDiv.find("i.glyphicon-pencil").off("click").on("click",this.proxy(function(e){
			$(e.currentTarget).closest("tr").find("p").trigger("click");
		  }))
		  this.resultDiv.find("[name=result_save]").off("click").on("click",this.proxy(this._result_save));;
		  $("p.p_result_textarea").off("click").on("click",this.proxy(function(e){
				var $e=$(e.currentTarget);
  			     if($e.find("textarea").length>0){
					return
				}
				var value=$e.text();
				var $td=$e.closest("td")
				var $tdchild=$td.children().detach();
				var $input=$('<textarea class="form-control" style="resize:none;" rows="3"></textarea>').appendTo($td);
				$input.focus().val(value);
				$input.blur(this.proxy(function(e){
					var  val= $input.val();
					  $input.remove();
					  $tdchild.text(val).appendTo($td)
					  if(value!=val){
						  $("[name=result_save]").trigger("click");
					  }
				  }));
			}))
	},
    _result_save:function(e){
    	$.u.ajax({
			url : $.u.config.constant.smsmodifyserver,
			type:"post",
            dataType: "json",
            cache: false,
            data: {
                "method": "stdcomponent.update",
                "tokenid": $.cookie("tokenid"),
                "dataobjectid": this._wkid,
                "dataobject":"task",
                "obj":JSON.stringify({"termResult":$("p.p_result_textarea").text()||""})
            },
    	}).done(this.proxy(function(response) {
    		if(response.success){
    			$.u.alert.success("保存成功");
    		}else{
    			$.u.alert.error(data.reason+"!保存失败");
    		}
    	}))
    },
	
	_init_glyphicon:function(){
   	 $(".glyphicon-btn").off("click").on("click",this.proxy(function(event){
	    		var $tar=$(event.currentTarget);
	    		var $span=$tar.parent().find("i");
	    		$tar.closest(".panel-heading").siblings(".panel-body").slideToggle(600);
	    		if($span.hasClass("glyphicon-minus")){
	    			$span.removeClass("glyphicon-minus").addClass("glyphicon-plus");
	    		}else{
	    			$span.removeClass("glyphicon-plus").addClass("glyphicon-minus");
	    		}
	    	})).css({"cursor":"pointer"});
	},
	 generateSelect2SettingFactory: function(params) {
	        params.rule = params.rule || [];
	        return {
	            width: '100%',
	            ajax: {
	                url: $.u.config.constant.smsqueryserver,
	                dataType: "json",
	                type: "post",
	                data: this.proxy(function(term, page) {
	                    var rules = params.rule.concat([$.map(params.filterFields, function(field, index) {
	                        return {
	                            key: field,
	                            op: 'like',
	                            value: term
	                        }
	                    })]);
	                    return {
	                        tokenid: $.cookie("tokenid"),
	                        method: "stdcomponent.getbysearch",
	                        dataobject: params.dataobject,
	                        rule: JSON.stringify(rules),
	                        start: (page - 1) * this.select2PageLength,
	                        length: this.select2PageLength
	                    };
	                }),
	                results: this.proxy(function(response, page, query) {
	                    if (response.success) {
	                        return {
	                            results: response.data.aaData,
	                            more: response.data.iTotalRecords > (page * this.select2PageLength)
	                        }
	                    } else {
	                        $.u.alert.error(response.reason, 1000 * 3);
	                    }
	                })
	            },
	            formatSelection: params.formatSelection || function(item) {
	                return item.name;
	            },
	            formatResult: params.formatResult || function(item) {
	                return item.name;
	            }
	        };
	    },
	_save:function(e){
		e.preventDefault();
    	var getParam = this._getParam();
    	if(this.form.valid()){
    		this._ajax(
				$.u.config.constant.smsmodifyserver, 
				true, 
				{
					"method" : "stdcomponent.update",
					"dataobjectid" : this._wkid,
					"dataobject" : "task",
					"obj" : JSON.stringify(getParam)
				}, 
				this.$, 
				{},
				this.proxy(function(response) {
					if(response.success){
						$.u.alert.success("保存成功");
						this._loadTask();
					}
				})
			);
    	}        
        this.$.find(".select2-container:hidden").show();
	},
	
	_required:function(data){
		  if(data.workflowNodeAttributes.required){
            	 var exrules = {}, exmessages ={};
            	 var ISOdate=["startDate","endDate"];//var ISOdate = new Array();
                 $.each(data.workflowNodeAttributes.required.split(","), this.proxy(function(k,val){
                	 ISOdate.push(val);
                 }))
                 $.each(ISOdate,this.proxy(function(idx,v){
                     if(v === "aCheck"){
                         this._requiredProfessions = true;
                     }else if(v === "startDate" || v === "endDate"){
                    	     exrules[v] = {
                                 date: true,
								 dateISO: true,
								 required:true,
                                 compareNowDate:""
                             };
                             exmessages[v] = {
                                 date: "无效日期",
								 dateISO: "无效日期",
								 required:"该项不能为空",
                                 compareNowDate:"所选时间不得早于今天 "
                             };
	                            if(v === "endDate"){
	                              exrules[v]["compareDate"] = "#" + this._id + "-startDate";
	                              exmessages[v]["compareDate"] = "结束日期不得早于开始日期";
	                            }
                     }else if(this[v]){    
                     	
                         var $label = $("[data-field=" + v + "]"); 
                         exrules[v] = { required: true };
                         exmessages[v] = { required: "该项不能为空" };
                         if($label.children("span.text-danger").length < 1){
                             $("<span class='text-danger'>&nbsp;&nbsp;*</span>").appendTo($label);
                         }
                     }else if(v=="yaoDian"){
                    	 this._requiredPoint = true;
                     }else if(v==="qianPiJianTermFiles"||'wanChengQingKuangTermFiles'||'reportTermFiles'||"taskTermFiles"||'shenHeQianPiTermFiles'){
                    	 this._requiredUpload= true;
                     }
                 }));
                 this.form.validate({
					onfocusout: function(element){
						$(element).valid();
					},
					// onfocusout:true,
                	/* highlight : function(element) {  
                         $(element).closest('.form-group').addClass('has-error');  
                     },  
           
                     success : function(label) {  
                         label.closest('.form-group').removeClass('has-error');  
                         label.remove();  
                     },  
           
                     errorPlacement : function(error, element) {  
                         element.parent('div').append(error);  
                     },*/
                     rules: exrules,
                     messages: exmessages,
                     errorClass: "text-danger text-validate-element",
                 });
            }
            
             if(data.workflowNodeAttributes.required){
                 var rules = {}, messages ={};
                 $.each(data.workflowNodeAttributes.required.split(","), this.proxy(function(k,v){
                     if(v === "aCheck"){
                         this._requiredProfessions = true;
                     }
                     else if(this[v]){                        
                         var $label = $("[data-field=" + v + "]"); 
                         rules[v] = { required: true };
                         messages[v] = { required: "该项不能为空" };
                         if(v === "startDate" || v === "endDate"){
                             rules[v] = {
                                 required: true,
                                 date: true,
                                 dateISO: true,
                                 compareNowDate:""
                             };
                             messages[v] = {
                                 required: "该项不能为空",
                                 date: "无效日期",
                                 dateISO: "无效日期",
                                 compareNowDate:"所选时间不得早于今天 "
                             }
                             if(v === "endDate"){
                                 rules[v]["compareDate"] = "#" + this._id + "-startDate";
                                 messages[v]["compareDate"] = "结束日期必须大于开始日期";
                             }
                             $label = $("[data-field=startEndDate]");
                         }
                         if($label.children("span.text-danger").length < 1){
                             $("<span class='text-danger'>&nbsp;&nbsp;*</span>").appendTo($label);
                         }
                     }
                 }));
                 this.form.validate({
					onfocusout: function(element){
						$(element).valid();
					},
                     rules: rules,
                     messages: messages,
                     ignore: ".ignore",
                     errorClass: "text-danger text-validate-element",
                     errorElement:"div"
                 });
             }
	},
	
	  _validPoint: function(){
	        var validP = false; 
	        var validU = false; 
	        if(this._requiredPoint === true){
	        	if(this.datatable.data().length>0){
	        		
	        		validP = true;
	        	}
	        	/*if($(".checkPoint",this.form).find("table").data().length>0){
	        		 valid = true;
	        	}*/
	            if(validP === false){
	                $.u.alert.error("请创建检查要点！", 1000 * 3);
	            }
	        }
	        else{
	        	validP = true;
	        }
	        if(this._requiredUpload === true &&this.curr_btn!="拒绝"){
	        	if(this.uploadDiv.find("tbody tr").length>0){
	        		validU = true;
	        	}
	        	if(validU === false){
	                $.u.alert.error("请上传附件！", 1000 * 3);
	            }
	        }else{
	        	validU = true;
	        }
	        return validP && validU;
	    },
	    
	    
    _ajax : function(url, async, param, $container, blockParam, callback) {
		$.u.ajax({
			url : url,
			datatype : "json",
			type : 'post',
			"async" : async,
			data : $.extend({
				tokenid : $.cookie("tokenid")
			}, param)
		}, $container || this.$, $.extend({}, blockParam || {})).done(this.proxy(function(response) {
			if (response.success) {
				callback(response);
			}
		})).fail(this.proxy(function(jqXHR, errorText, errorThrown) {

		}));
	},
}, { usehtm: true, usei18n: false });

com.audit.terminal.sheet.widgetjs = [ 
                                      "../../../uui/widget/select2/js/select2.min.js",
                                        "../../../uui/widget/spin/spin.js", 
                                        "../../../uui/widget/jqblockui/jquery.blockUI.js",
                                        "../../../uui/widget/jqztree/js/jquery.ztree.all-3.5.js",
                                        "../../../uui/widget/ajax/layoutajax.js",
                                        "../../../uui/widget/jqdatatable/js/jquery.dataTables.js",
                                 	   "../../../uui/widget/jqdatatable/js/dataTables.bootstrap.js",
                                        "../../../uui/widget/uploadify/jquery.uploadify.js", ];
com.audit.terminal.sheet.widgetcss = [{ path: "../../../uui/widget/select2/css/select2.css" }, 
                                           { path: '../../../uui/widget/jqdatatable/css/jquery.dataTables.css' }, 
                                           { path: '../../../uui/widget/jqdatatable/css/dataTables.bootstrap.css' },
                                         { path: "../../../uui/widget/select2/css/select2-bootstrap.css" },
                                         { path: "../../../uui/widget/jqztree/css/zTreeStyle/zTreeStyle.css"},
                                         {path:"../../../uui/widget/uploadify/uploadify.css"}];
