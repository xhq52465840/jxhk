//@ sourceURL=com.audit.inspection.reviewFeedBack
$.u.define('com.audit.inspection.reviewFeedBack', null, {
    init: function (options) {
        this._options = options || {};
    },
    afterrender: function (bodystr) {
    	this.currdata = null;
    	this.zhenggaidan_id = "";
    	this.flowid = "";
    	this.file1 = this.qid("file1");
    	this.file2 = this.qid("file2");
    	this.pro_tbody = this.qid("pro_tbody");
    	this.init_data();
    	this.qid("top_buttons").on("click",".save_zhenggaidan",this.proxy(this.save_zhenggaidan));
    	this.qid("top_buttons").on("click",".daochu_zhenggai",this.proxy(this._export));
    	$(".zhenggaidan_modify_table").off("click", ".rModify").on("click", ".rModify", this.proxy(this.modifyRow));
    	this.qid("audit_report_qianpijian").on("click", ".file_click", this.proxy(this.download_file));
    	//页面最后的actions里按钮
    	this.qid("top_buttons").on("click", ".action_button", this.proxy(this._on_action_button));
    	this.qid("top_buttons").on("click", ".close_end", this.proxy(this.close_end)); //结案按钮
    	
    	this.qid("add_file").off("click").on("click",this.proxy(this._add_file));
    	this.qid("uploadFile").on("click",".del-file",this.proxy(this.delete_file));
    	this.leftColumns = this.qid("left-column");
    	$(".baseInfo_zhankai,.problem_zhankai,.file_zhankai").off("click").on("click",this.proxy(this.zhaikaiOrzhedie));
    }, 
	//TODO 报错
	_export : function(){
		var checklist_ids = [];
		this.pro_tbody.find('tr').each(function(k,v){
			checklist_ids.push($(v).find('input[type=checkbox]').attr('name').split(',')[0]);
	    });
        window.open($.u.config.constant.smsqueryserver+"?method=exportImproveToPdf&tokenid="+$.cookie("tokenid")+"&checkListIds="+checklist_ids+"&improveId="+this._options.id);
	},
    close_end:function(e){
    	//提交或结案
    	var cur_name = $(e.currentTarget).attr("name");
		var wipid = cur_name.split(",")[0];
		var improveid = cur_name.split(",")[1];
    	var clz = $.u.load("com.audit.innerAudit.comm_file.confirm");
		var confirm = new clz({
            "body": "确认操作？",
            "buttons": {
                "ok": {
                    "click": this.proxy(function(){
                    	if(this.zhuanfa_id != ""){
                			$.u.ajax({   
                				url : $.u.config.constant.smsmodifyserver,
                				type:"post",
                	            dataType: "json",
                	            cache: false,
                	            data: {
                	            	"method": "operate",
                	                "tokenid": $.cookie("tokenid"),
                	                "action" : wipid,
        	    	                "dataobject" : "improve",
        	    	                "id" : improveid
                	            }
                	    	},confirm.confirmDialog.parent()).done(this.proxy(function(response) {
                	    		if(response.success){
                	    			$.u.alert.success("操作成功");
                	    			confirm.confirmDialog.dialog("close");
                	    			this.init_data();
                	    		}else{
                	    			$.u.alert.error(response.reason);
                	    		}
                	    	}))
                		}
                    })
                }
            }
        })
    },
    
    zhaikaiOrzhedie:function(e){
    	var $this = $(e.currentTarget);
        if($this.hasClass("fa-plus")){
            $this.removeClass("fa-plus").addClass("fa-minus");
        }else if($this.hasClass("fa-minus")){
            $this.removeClass("fa-minus").addClass("fa-plus");
        }
    	if($this.hasClass("baseInfo_zhankai")){
    		$(".baseInfo").toggleClass("hidden");
    	}
    	if($this.hasClass("problem_zhankai")){
    		$this.closest(".panel-heading").next().toggleClass("hidden");
    	}
		if($this.hasClass("file_zhankai")){
			$(".file_body").toggleClass("hidden");
		}
    },
    init_data :function(type){
    	this.allPass = true; //判断问题列表 全部通过
    	this.showOrHide = true; //判断按钮的显示
    	this.zhenggaidan_id = "";
    	$.u.ajax({
			url : $.u.config.constant.smsqueryserver,
			type:"post",
            dataType: "json",
            data: {
            	"method": "getImproveById",
            	"id": this._options.id,
                "tokenid": $.cookie("tokenid")
            }
    	}, this.$).done(this.proxy(function(response) {
    		if(response.success){
    			this.currdata = response;
    			this.zhenggaidan_id = response.data.improve.id;
    			this.flowid = response.data.improve.flowId;
    			this.flowstep = response.data.improve.flowStep;
    			//基本信息 展示
				this.qid("improveName").val(response.data.improve.improveName || "");  //整改反馈名称
    			this.qid("improveNo").val(response.data.improve.improveNo || ""); //整改反馈单编号
    			this.qid("auditunit_Name").val(response.data.improve.operator?response.data.improve.operator.name:"");  //检查单位
    			this.qid("auditDate").val(response.data.improve.startDate?response.data.improve.startDate:"" +"至"+response.data.improve.endDate?response.data.improve.endDate:""); //检查日期
    			this.qid("auditedunit_Name").val(response.data.improve.target?response.data.improve.target.name:"");  //被检查的单位
    			this.qid("audit_address").val(response.data.improve.address || "");        //检查地点
    			var transactors = "";
    			for(var i in response.data.improve.transactor){
    				transactors += response.data.improve.transactor[i].name+" "
    			}
    			this.qid("transactor").val(transactors);   //经办人
    			this.qid("transactorTel").val(response.data.improve.transactorTel || "");  //经办人电话
    			
    			this.qid("improver").val(response.data.improve.improver || "");   //整改联系人
    			this.qid("improverTel").val(response.data.improve.improverTel || "");  //整改联系人电话
    			this.qid("info_remark").val(response.data.improve.remark || "");  //备注
    			if(this.flowstep  !== "1"){
    				this.qid("improver").attr("readonly","readonly");
    				this.qid("improverTel").attr("readonly","readonly");
    				this.qid("info_remark").attr("readonly","readonly");
    				$(".bitian").hide();
    				this.qid("add_file").remove();
    			}
    			//检查报告签批件
    			var audit_report_files = "";
    			response.data.improve.auditReportFiles && $.each(response.data.improve.auditReportFiles, this.proxy(function(item,value){
    				audit_report_files += '<a class="file_click" href="#" name="'+value.id+'">'+value.fileName+'</a>';
    			}));
    			this.qid("audit_report_qianpijian").html(audit_report_files);
    			
    			//问题列表
    			this.pro_tbody.html("");
    			var probody_html = "";
    			response.data.improve.checkLists && $.each(response.data.improve.checkLists, this.proxy(function(k,v){
    				var cando = "0";
    				var code = v.improveItemStatus.code.toString();
    				switch(this.flowstep ){
    					case "1":
    						if(code === "0" || code === "2" || code === "5"){
    							cando = "1";
    						}
    						if(code === "2" || code === "4"){
    							probody_html += "<tr style='background-color: #dff0d8;'";
    						}else{
    							probody_html += "<tr ";
    							this.allPass = false;
    						}
    						break;
    					case "2":
    						if(code === "2" || code === "8"){
    							cando = "2";
    						}
    						if(code === "4"){
    							probody_html += "<tr style='background-color: #dff0d8;'";
    						}else if(code === "5"){
    							probody_html += "<tr style='background-color: #dff0d8;'";
    							this.showOrHide = false;
    						}else{
    							probody_html += "<tr ";
    							this.allPass = false;
    						}
    						break;
    					case "3":
    						if(code === "3" || code === "4" || code === "7"){
    							cando = "3";
    						}else if(code === "8"){
    							cando = "5";
    						}
    						if(code === "7" || code === "8"){
    							probody_html += "<tr style='background-color: #dff0d8;'";
    						}else{
    							probody_html += "<tr ";
    							this.allPass = false;
    						}
    						break;
    					case "4":
    						if(code === "8"){
    							cando = "4";
    						}
    						probody_html += "<tr ";
    						break;
    				}
    				if(!response.data.actions.length){
    					cando = "0";
    				}
					probody_html += " >";
    				probody_html += "<td>"+ (k+1) +"</td><td style='text-align:left;'><span>检查要点：<a";
    				probody_html += " href='#' class='rModify' name='"+cando+",";
    				probody_html += v.id + "," + this.flowstep + "'>";
        			probody_html += (v.itemPoint || "") + "</a></span><br>";
        			probody_html += "检查记录："+ (v.auditRecord || "") +"</td>";
        			probody_html += "<td>" + (v.improveUnit.name || "")+"</td>";
        			probody_html += "<td>" + (v.improveLastDate || "")+"</td>";
        			probody_html += "<td>"+(v.improveItemStatus.description || "")+"</td>";
        			probody_html += "</tr>";
    			}));
    			this.pro_tbody.html(probody_html);
    			
    			//4、拒绝的签批件
    			var file1 = "";
    			this.file1.empty();
    			response.data.improve.improveRejectedFiles && $.each(response.data.improve.improveRejectedFiles, this.proxy(function(k,v){
    				file1 += "<tr><td><a href='#' class='file_click' name='"+v.id+"'>" + v.fileName + "</a></td>";
    				file1 += "<td>" + v.size + "</td>";
    				file1 += "<td>" + v.uploadTime + "</td>";
    				file1 += "<td>" + v.uploadUser + "</td>";
    				file1 += "<td></td>";
    				file1 += "</tr>";
    			}));
    			this.file1.append(file1);
    			this.file1.find("a.file_click").off("click").on("click",this.proxy(this.download_file));
    			this.file1.find("span.del-file").off("click").on("click",this.proxy(this.delete_file));
    			//5、新上传的签批件
    			var files = "";
    			this.file2.empty();
    			var user = JSON.parse($.cookie('uskyuser'));
    			var user_s = user.fullname+"("+user.username+")";
				response.data.improve.improveFiles && $.each(response.data.improve.improveFiles, this.proxy(function(k,v){
    				files += "<tr><td><a href='#' class='file_click' name='"+v.id+"'>" + v.fileName + "</a></td>";
    				files += "<td>" + v.size + "</td>";
    				files += "<td>" + v.uploadTime + "</td>";
    				files += "<td>" + v.uploadUser + "</td>";
    				if(v.uploadUser == user_s && this.flowstep === "1"){
    					files += "<td><span class='glyphicon glyphicon glyphicon-trash fl-minus del-file' name='"+v.id + "' style='cursor: pointer;'></span></td>";
    				}else{
    					files += "<td></td>";
    				}
    				files += "</tr>";
    			}));
    			this.file2.append(files);
    			this.file2.find("a.file_click").off("click").on("click",this.proxy(this.download_file));
    			this.file2.find("span.del-file").off("click").on("click",this.proxy(this.delete_file));
    			
        		var buttonstr = "";
        		$.each(response.data.actions, this.proxy(function(k,v){
        			if(this.showOrHide){
        				if(!response.data.hasAuditRejected){
        					if(v.name !== "拒绝"){
            					buttonstr += "<button type='button' class='btn btn-default btn-sm action_button' name='";
                    			buttonstr += v.wipId + "," + response.data.improve.id + "'>"
                    			buttonstr += v.name;
                    			buttonstr += "</button>";
            				}	
        				}else{
        					if(v.name === "拒绝"){
	        					buttonstr += "<button type='button' class='btn btn-default btn-sm action_button' name='";
	                			buttonstr += v.wipId + "," + response.data.improve.id + "'>"
	                			buttonstr += v.name;
	                			buttonstr += "</button>";
	        				}
        				}
        			}else{
        				if(v.name === "拒绝"){
        					buttonstr += "<button type='button' class='btn btn-default btn-sm action_button' name='";
                			buttonstr += v.wipId + "," + response.data.improve.id + "'>"
                			buttonstr += v.name;
                			buttonstr += "</button>";
        				}
        			}
        		}));
        		if(response.data.actions.length){
        			buttonstr += "<button type='button' class='btn btn-default btn-sm save_zhenggaidan notfirst_show' style=''>保存</button>";
        			buttonstr += "<button type='button' class='btn btn-default btn-sm daochu_zhenggai notfirst_show' style=''>导出</button>";
        		}else{
        			this.qid("add_file").remove();
        		}
        		if(buttonstr){
            		this.qid("top_buttons").html(buttonstr);
        		}
        		//日志
        		if(response.data.logArea && response.data.logArea.key){ 
        			var zhenggaidan_id = this.zhenggaidan_id;
                    var clz = $.u.load(response.data.logArea.key);
                    this.qid("left-column").html("");
                    var target = $("<div/>").attr("umid", "logs").appendTo(this.qid("left-column"));
                    new clz( target, $.extend(true, response.data.logArea, {
                        logRule: [[{"key":"source","value": zhenggaidan_id}],[{"key":"sourceType","value":"improve"}]],
                        remarkRule: [[{"key":"source","value": zhenggaidan_id}],[{"key":"sourceType","value":"improve"}]],
                        remarkObj: {
                            source: zhenggaidan_id,
                            sourceType: "improve"
                        },
                        addable: true,
                        flowid: this.flowid 
                    }) );
                }
        		if(this.flowstep  == "1"){
        			this.$.find("div[umid=logs]").find("[qid=toggle-panel]").trigger("click");
        		}else{
        			if(response.data.workflowNodeAttributes.hiddenModel){
                        $.each(response.data.workflowNodeAttributes.hiddenModel.split(","), this.proxy(function(k,v){
                            if(v === "logs"){
                                this.$.find("div[umid=logs]").find("[qid=toggle-panel]").trigger("click");
                            }
                        }));
                    }
        		}
    		}
    	}))
    },
    
    //上传签批件
    _add_file:function(){
    	var num;
    	if(this.currdata.data.workflowNodeAttributes.flowStatus == "wanCheng"){
    		num = 12;
    	}else{
    		num = 6;
    	}
    	if(!this.fileDialog){
    		var clz = $.u.load("com.audit.innerAudit.comm_file.audit_uploadDialog");
    		this.fileDialog = new clz($("div[umid='fileDialog']",this.$),null);
    	}
		this.fileDialog.override({
			refresh: this.proxy(function(data){
				this.init_data();
    		})
    	});
    	try{
    		this.fileDialog.open({
    			"method":"uploadFiles",
    			"source": this._options.id,
    			"tokenid":$.cookie("tokenid"),
    			"sourceType":num
    		});
    	}catch(e){
    		$.u.alert.error("上传出错！");
    	}
    },
    //删除文件
    delete_file:function(e){
    	var file_id = $(e.currentTarget).attr("name") ;
    	var clz = $.u.load("com.audit.innerAudit.comm_file.confirm");
        var confirm = new clz({
            "body": "确认删除？",
            "buttons": {
                "ok": {
                    "click": this.proxy(function(){
                    	$.u.ajax({
            				url : $.u.config.constant.smsmodifyserver,
            				type:"post",
            	            dataType: "json",
            	            cache: false,
            	            data: {
            	            	"method": "stdcomponent.delete",
            	            	"dataobjectids": JSON.stringify([parseInt(file_id)]),
            	                "tokenid": $.cookie("tokenid"),
            	                "dataobject" : "file"
            	            }
            	    	}).done(this.proxy(function(response) {
            	    		if(response.success){
            	    			this.init_data();
            	    		}
            	    	}))
                    })
                }
            }
        });
    },
    download_file:function(e){
    	e.preventDefault();
    	var id = $(e.currentTarget).attr("name");
        window.open($.u.config.constant.smsqueryserver+"?method=downloadFiles&tokenid="+$.cookie("tokenid")+"&ids=" + JSON.stringify([parseInt(id)]));
    },
    //问题列表 编辑？
    modifyRow : function(e){
    	e.preventDefault();
    	var tr_id = $(e.currentTarget).attr("name");
    	if(!this.recordDiForm){
            $.u.load('com.audit.inspection.feedBack_dialog');
        }
        this.recordDiForm = new com.audit.inspection.feedBack_dialog($("div[umid='recordDiForm']",this.$),{id:tr_id});
        this.recordDiForm.open();
		this.recordDiForm.override({
    		refresh: this.proxy(function(data){
    			this.init_data();
    		})
    	});
	},
	//页面保存 按钮？
	save_zhenggaidan :function(e){
		//整改联系人及联系电话的验证
		var contacts = this.qid("improver").val();
		var contactsTel = this.qid("improverTel").val();
		var info_remark = this.qid("info_remark").val();
		if(contacts == ""){
			$.u.alert.error("整改联系人不能为空");
			this.qid("improver").focus();
			return;
		}
		if(contactsTel == ""){
			$.u.alert.error("联系方式不能为空");
			this.qid("improverTel").focus();
			return;
		}
		var obj = {improver:contacts,improverTel:contactsTel,remark:info_remark};
		if(this.zhenggaidan_id != ""){
			$.u.ajax({
				url : $.u.config.constant.smsmodifyserver,
				type:"post",
	            dataType: "json",
	            cache: false,
	            data: {
	            	"method": "stdcomponent.update",
	            	"dataobject":"improve",
	            	"obj" :JSON.stringify(obj),
	            	"dataobjectid": parseInt(this.zhenggaidan_id),
	                "tokenid": $.cookie("tokenid")
	            }
	    	}).done(this.proxy(function(response) {
	    		if(response.success){
	    			$.u.alert.success("保存成功");
	    			location.reload();
	    		}
	    	}))
		}
	},
	//工作流按钮？
	_on_action_button:function(e){
		if(!this.allPass){
			$.u.alert.info('问题列表有未操作的条目', 3000);
			return false;
		}
		var cur_name = $(e.currentTarget).attr("name");
		var wipid = cur_name.split(",")[0];
		var improveid = cur_name.split(",")[1];
		var init_url = $.u.config.constant.smsmodifyserver;
		
		var contacts = this.qid("improver").val();
		var contactsTel = this.qid("improverTel").val();
		var info_remark = this.qid("info_remark").val();
		if(contacts == ""){
			$.u.alert.error("整改联系人不能为空");
			this.qid("improver").focus();
			return;
		}
		if(contactsTel == ""){
			$.u.alert.error("联系方式不能为空");
			this.qid("improverTel").focus();
			return;
		}
		//签批件是否上传
		if(this.currdata.data.improve.improveFiles.length == 0){
			$.u.alert.error("请先上传签批件");
			return;
		}
		var obj = {improver:contacts,improverTel:contactsTel,remark:info_remark};
		var clz = $.u.load("com.audit.innerAudit.comm_file.confirm");
		var confirm = new clz({
            "body": "确认操作？",
            "buttons": {
                "ok": {
                    "click": this.proxy(function(){
                    	if(this.zhenggaidan_id != ""){
                			$.u.ajax({   //先保存数据
                				url : init_url,
                				type:"post",
                	            dataType: "json",
                	            data: {
                	            	"method": "stdcomponent.update",
                	            	"dataobject":"improve",
                	            	"obj" :JSON.stringify(obj),
                	            	"dataobjectid": parseInt(this.zhenggaidan_id),
                	                "tokenid": $.cookie("tokenid"),
                	            },
                	    	},confirm.confirmDialog.parent()).done(this.proxy(function(response) {
                	    		if(response.success){
                	    			$.u.ajax({
                	    				url : init_url,
                	    				type:"post",
                	    	            dataType: "json",
                	    	            data: {
                	    	            	"method": "operate",
                	    	                "tokenid": $.cookie("tokenid"),
                	    	                "action" : wipid,
                	    	                "dataobject" : "improve",
                	    	                "id" : improveid
                	    	            }
                	    	    	},confirm.confirmDialog.parent()).done(this.proxy(function(response) {
                	    	    		if(response.success){
                	    	    			confirm.confirmDialog.dialog("close");
                	    	    			$.u.alert.success("操作成功");
                	    	    			location.reload();
                	    	    		}
                	    	    	}))
                	    		}
                	    	}))
                		}
                    })
                 }
            }
   	 	})
	},
    destroy: function () {
        this._super();
    }
}, { usehtm: true, usei18n: false });
com.audit.inspection.reviewFeedBack.widgetjs = [
                                      '../../../uui/widget/jqdatatable/js/jquery.dataTables.js', 
                                      '../../../uui/widget/jqdatatable/js/dataTables.bootstrap.js'];
com.audit.inspection.reviewFeedBack.widgetcss = [{ path: '../../../uui/widget/jqdatatable/css/jquery.dataTables.css' }, 
                                       { path: '../../../uui/widget/jqdatatable/css/dataTables.bootstrap.css' }];