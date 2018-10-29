﻿//@ sourceURL=com.audit.notice.questionList
$.u.load("com.sms.common.stdcomponentdelete");
$.u.define('com.audit.notice.questionList', null, {
	
	//问题列表
    init: function (option) {
    	this._option = option || null;
    	this.questionTemp = '<tr data-id="#{id}" style="border-bottom:2px solid #A2ACB6 !important;"><td class="work issueContent" data-id="#{id}">#{issueContent}</td><td>#{improveUnit}</td><td>#{improveDeadLine}</td>'
    		+'<td data-id="#{id}" class="historyLog">历史记录</td>'
			+'<td class="operate-tool"><i class="fa fa-minus minu-question" style="color: red;" data-id="#{id}"></i></td></tr>';
    	this.questionListTemp = '<tr data-id="#{id}" style="border-bottom:2px solid #A2ACB6 !important;"><td class="work issueContent" data-id="#{id}">#{issueContent}</td><td></td><td>#{improveUnit}</td><td></td>'
    		+'<td>#{status}</td><td data-id="#{id}" class="historyLog">历史记录</td>'
			+'</tr>';
    	this.questionStatusTemp = '<tr data-id="#{id}" style="border-bottom:2px solid #A2ACB6 !important;"><td class="work issueContent" data-id="#{id}">#{issueContent}</td><td></td><td>#{improveUnit}</td><td></td>'
    		+'<td></td><td data-id="#{id}" class="historyLog">历史记录</td>'
			+'</tr>';
    	this.questionCompleteTemp = '<tr data-id="#{id}" style="border-bottom:2px solid #A2ACB6 !important;"><td class="work issueContent" data-id="#{id}">#{issueContent}</td><td></td><td>#{improveUnit}</td><td></td>'
    		+'<td></td><td></td><td data-id="#{id}" class="historyLog">历史记录</td>'
			+'</tr>';
    },
    afterrender: function () {
    	this.questionTable = this.qid("questionTable");
    	this.questionTable.find("i.add_question").off("click").on("click",this.proxy(this.addQuestion));
    	this.showDialog();
    	if(this._option.data){
    		this.showTable();
    	}
    },
    showDialog : function(){
    	this.showLogDialog = this.qid("logDialog").dialog({
    		title:"历史记录",
			width: 680,
			height: 480,
			modal: true,
			resizable: false,
			autoOpen: false,
			create: this.proxy(this.on_question_create),
			buttons:[{
				"text" : "关闭",
				"class": "aui-button-link",
				"click" : this.proxy(function(){
					this.showLogDialog.dialog("close");
				})
			}]
    	});
    },
    on_log_click : function(e){
    	if($('div[umid=historytLog]').length>1){
    		$('div[umid=historytLog]')[0].removeNode(true);
    	}
    	var $e = $(e.currentTarget),id = parseInt($e.attr("data-id"));
    	if(!this.logInfo){
			$.u.load('com.audit.comm_file.activitylog');
		}
    	this.logInfo && this.logInfo.destroy();
    	this.logInfo = new com.audit.comm_file.activitylog($('div[umid=historytLog]'),{
			"title": "日志",
			"count": "1000",
			"manual": true, 
	        "rules": [[{"key":"source","value":id}],[{"key":"sourceType","value":"improveNoticeIssue"}]],
			"autorefresh":true,
			"businessUrl":window.location.href,
			"autorefreshminiute":"15"
		});
		this.logInfo._appendLog();
		this.showLogDialog.dialog("open");
    },
    showTable : function(){
    	var $thead = this.questionTable.find("thead");
    	switch(this._option.flowStatus){
    		case "show":
    			this.lists();
    			break;
			case "cuoShi":
				$thead.empty();
				$('<tr><th style="">问题</th><th style="width: 20%;">整改措施</th><th style="width: 10%;">责任单位</th>'
				+'<th style="width: 10%;">预计完成时间</th><th style="width: 10%;">状态</th><th style="width: 10%;">操作记录</th></tr>').appendTo($thead);
				this.listTable();
				break;
			case "buMenShenHe":
			case "chuShiShenHe":	
			case "shenHe":
				$thead.empty();
				$('<tr><th style="width: 20%;">问题</th><th style="width: 20%;">整改措施</th><th style="width: 10%;">责任单位</th>'
				+'<th style="width: 15%;">预计完成时间</th><th style="width: 15%;">审核状态</th>'
				+'<th style="width: 10%;">操作记录</th></tr>').appendTo($thead);
				this.listStatus();
				break;
			case "wanCheng":
				$thead.empty();
				$('<tr><th style="width: 20%;">问题</th><th style="width: 20%;">整改措施</th><th style="width: 10%;">责任单位</th>'
				+'<th style="width: 15%;">预计完成时间</th><th style="width: 15%;">审核状态</th>'
				+'<th style="width: 10%;">完成日期</th><th style="width: 10%;">操作记录</th></tr>').appendTo($thead);
				this.listComplete();
				break;
			case "jieAn":
				$thead.empty();
				$('<tr><th style="width: 20%;">问题</th><th style="width: 20%;">整改措施</th><th style="width: 10%;">责任单位</th>'
				+'<th style="width: 15%;">预计完成时间</th><th style="width: 15%;">审核状态</th>'
				+'<th style="width: 10%;">完成日期</th><th style="width: 10%;">操作记录</th></tr>').appendTo($thead);
				this.listComplete();
				break;
		}
    },
    //单击右侧加号添加问题列表
    addQuestion : function(){
    	if(!this.questionDialog){
    		$.u.load('com.audit.notice.questionDialog');
    	}
    	this._option.data= "";
    	this.questionDialog = new com.audit.notice.questionDialog($('div[umid=questionDialog]'),{
			"title":"审计记录",
			"buttons":[{
				"text" : "保存",
				"class" : "ok",
				"click" : this.proxy(function(){
					if(qdForm.valid()){
						var data = this.questionDialog.getFormData();
						data.improveNotice = this._option.improveNotice;
						this._ajax(
							$.u.config.constant.smsmodifyserver,
							"post",
				    		{
					    		"method": "stdcomponent.add",
					            "dataobject":"improveNoticeIssue",
					            "obj":JSON.stringify(data)
				            },
				            qdForm,
				            this.proxy(function(response){
				            	if(response.success){	
				            		this.questionDialog.question.siblings().find("button").attr("disabled",true)
				            		var Inid=setInterval(this.proxy(function(){
				            			if(this.questionDialog.question.find(".uploadify-queue").children().length==0){
				            				clearInterval(Inid);
				            				this.questionDialog.question.siblings().find("button").attr("disabled",false)
							    			qdQuestion.dialog("close");
				            				$.u.alert.success("保存成功",3000);
				            				this.list(response.data);
					            		}}), 500);
					            		
					    		}
				            	
					    	})
					    );
					};
					
				})
			},{
				"text" : "关闭",
				"class": "aui-button-link",
				"click" : this.proxy(function(){
					qdQuestion.dialog("close");
				})
			}],
			"fields":this._option
    	});
		var qdForm = this.questionDialog.form, qdQuestion = this.questionDialog.question;
    	this.questionDialog.open();
    },
    lists:function(){
    	this._option.data && $.each(this._option.data,this.proxy(function(idx,data){
    		this.list(data.id,this._option.data[idx],{mode:"resever"});
    	}));
    	if(this._option.disabled==="disabled"){
    		$("i.fa",this.$).addClass("hidden");
    	}
    },
    list: function(data,optionData,mode){
    	if(optionData && mode.mode=="resever"){
    		
    		var response={data:optionData};
			var $tbody = this.questionTable.find("tbody");
			var text = [];
			response.data.improveUnit && $.each(response.data.improveUnit,function(idx,obj){
				text.push(obj.name);
			});
			var temp = this.questionTemp.replace(/#\{issueContent\}/g,response.data.issueContent.replace(/\n/g, "<br/>"))
				.replace(/#\{improveUnit\}/g,text.join(",").toString())
				.replace(/#\{improveDeadLine\}/g,response.data.improveDeadLine || '')
				.replace(/#\{id\}/g,response.data.id);
			$(temp).appendTo($tbody);
			$tbody.find('td.issueContent[data-id='+response.data.id+']').data("data",response.data);
			$tbody.find('.issueContent').off("click").on("click",this.proxy(this.updateContent));
			//$tbody.find('.upd').off("click").on("click",this.proxy(this.on_upd_click));
			$tbody.find('.minu-question').off("click").on("click",this.proxy(this.on_question_click));
			$tbody.find('.historyLog').off("click").on("click",this.proxy(this.on_log_click));
			if(this._option.disabled==="disabled"){
	    		$("i.fa",$tbody).addClass("hidden");
	    	}
			$tbody.find('td.issueContent').attr("style","padding-right:30px;padding-top:5px;padding-bottom:5px;")
    	}else{
    	this._ajax(
			$.u.config.constant.smsqueryserver,
			"post",
    		{
	    		"method": "stdcomponent.getbyid",
	            "dataobject":"improveNoticeIssue",
	            "dataobjectid":data
            },
            this.questionTable,
            this.proxy(function(response){
    			var $tbody = this.questionTable.find("tbody");
    			var text = [];
    			response.data.improveUnit && $.each(response.data.improveUnit,function(idx,obj){
    				text.push(obj.name);
    			});
    			var temp = this.questionTemp.replace(/#\{issueContent\}/g,response.data.issueContent.replace(/\n/g, "<br/>"))
    				.replace(/#\{improveUnit\}/g,text.join(",").toString())
    				.replace(/#\{improveDeadLine\}/g,response.data.improveDeadLine || '')
    				.replace(/#\{id\}/g,response.data.id);
    			$(temp).appendTo($tbody);
    			$tbody.find('td.issueContent[data-id='+response.data.id+']').data("data",response.data);
    			$tbody.find('.issueContent').off("click").on("click",this.proxy(this.updateContent));
    			//$tbody.find('.upd').off("click").on("click",this.proxy(this.on_upd_click));
    			$tbody.find('.minu-question').off("click").on("click",this.proxy(this.on_question_click));
    			$tbody.find('.historyLog').off("click").on("click",this.proxy(this.on_log_click));
    			if(this._option.disabled==="disabled"){
    	    		$("i.fa",$tbody).addClass("hidden");
    	    	}
    			$tbody.find('td.issueContent').attr("style","padding-right:30px;padding-top:5px;padding-bottom:5px;")
    			
	    	})
	    );
    	};
    },
    listbyid : function(id){
    	this._ajax(
			$.u.config.constant.smsqueryserver,
			"post",
    		{
	    		"method": "stdcomponent.getbyid",
	            "dataobject":"improveNoticeIssue",
	            "dataobjectid":id
            },
            this.questionTable,
            this.proxy(function(response){
    			var $tbody = this.questionTable.find("tbody");
    			var $tr = this.questionTable.find("tr[data-id="+id+"]");
    			var text = [];
    			response.data.improveUnit && $.each(response.data.improveUnit,function(idx,obj){
    				text.push(obj.name);
    			});
    			$tr.find('td').eq(0).text(response.data.issueContent || '').data("data",response.data);
    			$tr.find('td').eq(1).text(text.join(",").toString());
    			//$tr.find('td').eq(2).text(response.data.replyDeadLine || '');
    			$tr.find('td').eq(2).text(response.data.improveDeadLine || '');
    			//$tr.find('td').eq(3).text(response.data.companyReplyDeadLine || '');
	    	})
	    );
    },
    updateContent : function(e){
    	var $e = $(e.currentTarget);
    	var data = $e.data("data");
    	this.update_content(data);
    },
    //点击问题列表中的问题项 打开对话框
    update_content : function(sdata){
    	this._option.data = sdata;
    	this._option.improveUnit = "";
    	if(!this.questionDialog){
    		$.u.load('com.audit.notice.questionDialog');
    	}
    	var buttonsArray=[];
    	if(this._option.disabled !=="disabled"){
    		buttonsArray.push({
				"text" : "保存",
				"class" : "ok",
				"click" : this.proxy(function(){
					if(qdForm.valid()){
						var data = this.questionDialog.getFormData();
						this._ajax(
							$.u.config.constant.smsmodifyserver,
							"post",
				    		{
								"method": "stdcomponent.update",
					            "dataobject":"improveNoticeIssue",
					            "dataobjectid":sdata.id,
					            "obj":JSON.stringify(data)
				            },
				            qdForm,
				            this.proxy(function(response){
				            	if(response.success && response.data){
				            		this.questionDialog.stratUpload(response.data);
				            		this.questionDialog.question.siblings().find("button").attr("disabled",true)
				            		var Inid=setInterval(this.proxy(function(){
				            			if(this.questionDialog.question.find(".uploadify-queue").children().length==0){
				            				clearInterval(Inid);
				            				this.questionDialog.question.siblings().find("button").attr("disabled",false)
							    			qdQuestion.dialog("close");
				            				$.u.alert.success("保存成功",3000);
				            				this.listbyid(sdata.id);
					            		}}), 500)
					    		}else if(response.success && response.data == null){
					    			this.questionDialog.question.siblings().find("button").attr("disabled",true)
				            		var Inid=setInterval(this.proxy(function(){
				            			if(this.questionDialog.question.find(".uploadify-queue").children().length==0){
				            				clearInterval(Inid);
				            				this.questionDialog.question.siblings().find("button").attr("disabled",false)
							    			qdQuestion.dialog("close");
				            				$.u.alert.success("保存成功",3000);
				            				this.listbyid(sdata.id);
					            		}}), 500)}
					    	})
					    );
					}
				})
			})
    	}
    	
    	buttonsArray.push({
			"text" : "关闭",
			"class": "aui-button-link",
			"click" : this.proxy(function(){
				qdQuestion.dialog("close");
			})
		})
    	
    	this.questionDialog = new com.audit.notice.questionDialog($('div[umid=questionDialog]'),{
			"title":"审计记录",
			"buttons":buttonsArray,
			"fields":this._option
    	});
		var qdForm = this.questionDialog.form, qdQuestion = this.questionDialog.question;
    	this.questionDialog.open();
    },
    listTable : function(){	
    	this._option.data && $.each(this._option.data, this.proxy(function(idx, obj){
    		$.u.ajax({
				url : $.u.config.constant.smsqueryserver,
				type:"post",
	            dataType: "json",
	            cache: false,
	            async:false,
	            data: {
	            	"tokenid":$.cookie("tokenid"),
		    		"method": "stdcomponent.getbyid",
		            "dataobject":"improveNoticeIssue",
		            "dataobjectid":obj.id
	            }
	    	}).done(this.proxy(function(response) {
	    		if(response.success){
	        		if(response.data){
	        			obj.files=response.data.files
	        		}
	    		}else{
	    			$.u.alert.error(response.reason+"!查询 失败");
	    		}
	    	}))
    		
    		
    		var $tbody = this.questionTable.find("tbody");
    		var improveUnit = [];
    		obj.improveUnit && $.each(obj.improveUnit, function(k,v){
    			improveUnit.push(v.name);
    		});
    		var temp = this.questionListTemp.replace(/#\{issueContent\}/g,obj.issueContent.replace(/\n/g, "<br/>"))
    			.replace(/#\{improveUnit\}/g,improveUnit.join(",").toString())
    			.replace(/#\{status\}/g,(obj.status ? obj.status.name : ""))
    			.replace(/#\{id\}/g,obj.id);
    		$(temp).appendTo($tbody);
    		//$tbody.find('.upd').off("click").on("click",this.proxy(this.on_upd_click));
    		$tbody.find('td.issueContent[data-id='+obj.id+']').data("data",obj);
    		$tbody.find('.issueContent').off("click").on("click",this.proxy(this.up_content));
    		$tbody.find('.historyLog').off("click").on("click",this.proxy(this.on_log_click));
    		var $tr = this.questionTable.find("tr[data-id="+obj.id+"]");
    		if(obj.improveMeasure && obj.expectedCompletedDate){
    			$tr.attr("data-status","done").css("background","#DFF0D8");
    		}
    		$tr.find('td').eq(0).data("data",obj).css({"padding-right":"30px","padding-top":"5px","padding-bottom":"5px"});
    		$tr.find('td').eq(1).text(obj.improveMeasure || '');
    		$tr.find('td').eq(3).text(obj.expectedCompletedDate || '');
    		var $ul = $tr.find('ul');
    		var user = JSON.parse($.cookie("uskyuser"));
    	}));
    },
    listTableById : function(id){
    	this._ajax(
			$.u.config.constant.smsqueryserver,
			"post",
    		{
	    		"method": "stdcomponent.getbyid",
	            "dataobject":"improveNoticeIssue",
	            "dataobjectid":id
            },
            this.questionTable,
            this.proxy(function(response){
    			var $tbody = this.questionTable.find("tbody");
    			var $tr = this.questionTable.find("tr[data-id="+id+"]");
    			$tr.attr("data-status","done").css("background","#DFF0D8");
    			$tr.find('td').eq(0).data("data",response.data);
    			$tr.find('td').eq(1).text(response.data.improveMeasure || '');
    			$tr.find('td').eq(3).text(response.data.expectedCompletedDate || '');
	    	})
	    );
    },
    listStatus : function(){
    	this._option.data && $.each(this._option.data, this.proxy(function(idx, obj){
    	
    		$.u.ajax({
				url : $.u.config.constant.smsqueryserver,
				type:"post",
	            dataType: "json",
	            cache: false,
	            async:false,
	            data: {
	            	"tokenid":$.cookie("tokenid"),
		    		"method": "stdcomponent.getbyid",
		            "dataobject":"improveNoticeIssue",
		            "dataobjectid":obj.id
	            }
	    	}).done(this.proxy(function(response) {
	    		if(response.success){
	        		if(response.data){
	        			obj.files=response.data.files
	        		}
	    		}else{
	    			$.u.alert.error(response.reason+"!保存失败");
	    		}
	    	}))
    		
    		var $tbody = this.questionTable.find("tbody");
    		var improveUnit = [];
    		obj.improveUnit && $.each(obj.improveUnit, function(k,v){
    			improveUnit.push(v.name);
    		});
    		var temp = this.questionStatusTemp.replace(/#\{issueContent\}/g,obj.issueContent.replace(/\n/g, "<br/>"))
    			.replace(/#\{improveUnit\}/g,improveUnit.join(",").toString())
    			.replace(/#\{id\}/g,obj.id);
    		$(temp).appendTo($tbody);
    		//$tbody.find('.upd').off("click").on("click",this.proxy(this.on_upd_click));
    		$tbody.find('td.issueContent[data-id='+obj.id+']').data("data",$.extend(obj,{"auditOpinion":obj.auditOpinion||"同意"}));
    		$tbody.find('.issueContent').off("click").on("click",this.proxy(this.up_content));
    		$tbody.find('.historyLog').off("click").on("click",this.proxy(this.on_log_click));
    		var $tr = this.questionTable.find("tr[data-id="+obj.id+"]");
    		if(obj.improveMeasure && obj.expectedCompletedDate && obj.status){
    			$tr.attr("data-status","done").css("background","#DFF0D8");
    		}
    		$tr.find('td').eq(0).data("data",obj);
    		$tr.find('td').eq(1).text(obj.improveMeasure || '');
    		$tr.find('td').eq(3).text(obj.expectedCompletedDate || '');
    		$tr.find('td').eq(4).text((obj.status && obj.status.name) || '');
    		/*var $ul = $tr.find('ul');
    		obj.files && $.each(obj.files, function(idx, ob){
				$('<li><span class="down" data-id="'+ob.id+'">'+ob.fileName+'</span>').appendTo($ul);
			});
    		$ul.find('span.down').off("click").on("click", this.proxy(this.download_file));*/
    	}));
    },
    listTableByIdAndStatus: function(id){
    	this._ajax(
			$.u.config.constant.smsqueryserver,
			"post",
    		{
	    		"method": "stdcomponent.getbyid",
	            "dataobject":"improveNoticeIssue",
	            "dataobjectid":id
            },
            this.questionTable,
            this.proxy(function(response){
    			var $tbody = this.questionTable.find("tbody");
    			var $tr = this.questionTable.find("tr[data-id="+id+"]");
    			$tr.attr("data-status","done").css("background","#DFF0D8");
    			$tr.find('td').eq(0).data("data",response.data);
    			$tr.find('td').eq(1).text(response.data.improveMeasure || '');
    			$tr.find('td').eq(3).text(response.data.expectedCompletedDate || '');
    			$tr.find('td').eq(4).text(response.data.status.name || '');
    			this.refresh();
	    	})
	    );
    },
    listComplete : function(){
    	this._option.data && $.each(this._option.data, this.proxy(function(idx, obj){
    		$.u.ajax({
				url : $.u.config.constant.smsqueryserver,
				type:"post",
	            dataType: "json",
	            cache: false,
	            async:false,
	            data: {
	            	"tokenid":$.cookie("tokenid"),
		    		"method": "stdcomponent.getbyid",
		            "dataobject":"improveNoticeIssue",
		            "dataobjectid":obj.id
	            }
	    	}).done(this.proxy(function(response) {
	    		if(response.success){
	        		if(response.data){
	        			obj.files=response.data.files
	        		}
	    		}else{
	    			$.u.alert.error(response.reason+"!保存失败");
	    		}
	    	}))
    		var $tbody = this.questionTable.find("tbody");
    		var improveUnit = [];
    		obj.improveUnit && $.each(obj.improveUnit, function(k,v){
    			improveUnit.push(v.name);
    		});
    		var temp = this.questionCompleteTemp.replace(/#\{issueContent\}/g,obj.issueContent.replace(/\n/g, "<br/>"))
    			.replace(/#\{improveUnit\}/g,improveUnit.join(",").toString())
    			.replace(/#\{id\}/g,obj.id);
    		$(temp).appendTo($tbody);
    		//$tbody.find('.upd').off("click").on("click",this.proxy(this.on_upd_click));
    		$tbody.find('td.issueContent[data-id='+obj.id+']').data("data",obj);
    		$tbody.find('.issueContent').off("click").on("click",this.proxy(this.up_content));
    		$tbody.find('.historyLog').off("click").on("click",this.proxy(this.on_log_click));
    		var $tr = this.questionTable.find("tr[data-id="+obj.id+"]");
    		if(obj.improveMeasure && obj.expectedCompletedDate){
    			$tr.attr("data-status","done");
    		}
    		$tr.find('td').eq(0).data("data",obj);
    		$tr.find('td').eq(1).text(obj.improveMeasure || '');
    		$tr.find('td').eq(3).text(obj.expectedCompletedDate || '');
    		$tr.find('td').eq(4).text(obj.status.name || '');
    		$tr.find('td').eq(5).text(obj.completionDate || '');
    		/*var $ul = $tr.find('ul');
    		obj.files && $.each(obj.files, function(idx, ob){
				$('<li><span class="down" data-id="'+ob.id+'">'+ob.fileName+'</span>').appendTo($ul);
			});
    		$ul.find('span.down').off("click").on("click", this.proxy(this.download_file));*/
    	}));
    },
    listTableByIdAndComplete: function(id){
    	this._ajax(
			$.u.config.constant.smsqueryserver,
			"post",
    		{
	    		"method": "stdcomponent.getbyid",
	            "dataobject":"improveNoticeIssue",
	            "dataobjectid":id
            },
            this.questionTable,
            this.proxy(function(response){
    			var $tbody = this.questionTable.find("tbody");
    			var $tr = this.questionTable.find("tr[data-id="+id+"]");
    			$tr.attr("data-status","done").css("background","#DFF0D8");
    			$tr.find('td').eq(0).data("data",response.data);
    			$tr.find('td').eq(1).text(response.data.improveMeasure || '');
    			$tr.find('td').eq(3).text(response.data.expectedCompletedDate || '');
    			$tr.find('td').eq(4).text(response.data.status.name || '');
    			$tr.find('td').eq(5).text(response.data.completionDate || '');
	    	})
	    );
    },
    trStatus : function(){
    	var $tbody = this.questionTable.find("tbody");
    	var status = true;
    	$tbody.find("tr").each(function(idx, obj){
    		var $obj =  $(obj);
    		var done = $obj.attr("data-status");
    		if(!done){
    			status = false;
    			return false;
    		}
    	});
    	return status;
    },
    up_content : function(e){
    	var $e = $(e.currentTarget);
    	var data = $e.data("data");
    	var sendData = {};
    	sendData.id = data.id;
    	sendData.issueContent = data.issueContent;
    	sendData.improveReason = data.improveReason;
    	sendData.improveMeasure = data.improveMeasure;
    	sendData.improveUnit = data.improveUnit;
    	sendData.expectedCompletedDate = data.expectedCompletedDate;
    	sendData.replyDeadLine = data.replyDeadLine;
    	sendData.improveDeadLine = data.improveDeadLine;
    	sendData.companyReplyDeadLine = data.companyReplyDeadLine;
    	sendData.completionStatus = data.completionStatus;
    	sendData.completionDate = data.completionDate;
    	sendData.aaStatus = (data.status && data.status.id)||"";
    	sendData.files =  data.files;
    	sendData.auditOpinion =  data.auditOpinion;
    	sendData.reasonType =  data.auditReason;
    	sendData.actions = this._option.actions;
    	this.add_content(sendData);
    },
    add_content : function(data){
    	if(!this.questionDialog){
    		$.u.load('com.audit.notice.questionDialog');
    	}
    	var canModify, required, canDo,canedit;
    	data.actions  && $.each(data.actions,this.proxy(function(idx,item){
			if(item.name == "结案" || item.name=="完成"){
				canedit=true;
			}
    	}));
    	if(data.aaStatus == "AUDIT_UN_COMPLETED_TEMPORARILY" || data.aaStatus == "AUDIT_PASSED" || data.aaStatus == "AUDIT_REJECTED" || data.aaStatus == "COMPLETED" || data.aaStatus == "COMFIRM_COMPLETED" || data.aaStatus == "COMFIRM_ASSIGNED"){
    		if(this._option.flowStatus == "cuoShi" && this._option.canModify.indexOf("improveReason") > -1){
    			if(data.aaStatus == "AUDIT_REJECTED"){
    				canModify = this._option.canModify;
        			required = this._option.required;
        			if(this._option.actions.length > 0){
            			canDo = this._option.canDo;
            		}else{
            			canDo = "";
            		}
    			}else{
    				canModify = "";
            		required = "";
            		canDo = "";
    			}
    		}else if( data.aaStatus == "AUDIT_PASSED" && canedit){
    			canModify = "completionStatus";
        		required = "completionStatus";
        		canDo = "submit";
    		}else{
    			canModify = "";
        		required = "";
        		canDo = "";
    		}
    	}else{
    		canModify = this._option.canModify;
    		required = this._option.required;
    		if(this._option.actions.length > 0){
    			canDo = this._option.canDo;
    		}else{
    			canDo = "";
    		}
    	}
		this.questionDialog = new com.audit.notice.questionDialog($('div[umid=questionDialog]'),{
			"title":"审计记录",
			"buttons":[{
				"name":"baoCun",
				"text" : "保存",
				"class" : "ok",
				"click" : this.proxy(function(){
					if(qdForm.valid()){
						var sdata = this.questionDialog.getFormData();
						this._ajax(
							$.u.config.constant.smsmodifyserver,
							"post",
				    		{
					    		"method": "stdcomponent.update",
					            "dataobject":"improveNoticeIssue",
					            "dataobjectid":data.id,
					            "obj":JSON.stringify(sdata)
				            },
				            qdForm,
				            this.proxy(function(response){
				            	if(response.success){
				            		//this.questionDialog.stratUpload(data.id);
				            		this.questionDialog.question.siblings().find("button").attr("disabled",true)
				            		var Inid=setInterval(this.proxy(function(){
				            			if(this.questionDialog.question.find(".uploadify-queue").children().length==0){
				            				clearInterval(Inid);
				            				this.questionDialog.question.siblings().find("button").attr("disabled",false)
							    			qdQuestion.dialog("close");
				            				$.u.alert.success("保存成功",3000);
				            				this.listTableById(data.id);
					            		}}), 500)
					    		}
					    	})
					    );
					}
				})
			},{
				"name":"pass",
				"text" : "通过",
				"class" : "ok",
				"click" : this.proxy(function(){
					var clz = $.u.load("com.audit.comm_file.confirm");
			        var confirm = new clz({
			            "body": "确认操作？",
			            "buttons": {
			                "ok": {
			                    "click": this.proxy(function(){
			                    	if(qdForm.valid()){
			    						var sdata = this.questionDialog.getFormData();
			    						sdata.status = "AUDIT_PASSED";
			    						this._ajax(
			    							$.u.config.constant.smsmodifyserver,
			    							"post",
			    				    		{
			    					    		"method": "stdcomponent.update",
			    					            "dataobject":"improveNoticeIssue",
			    					            "dataobjectid":data.id,
			    					            "obj":JSON.stringify(sdata)
			    				            },
			    				            confirm.confirmDialog.parent(),
			    				            this.proxy(function(response){
			    				            	if(response.success){
			    				            		confirm.confirmDialog.dialog("close");
			    					    			$.u.alert.success("通过成功",3000);
			    					    			qdQuestion.dialog("close");
			    					    			this.listTableByIdAndStatus(data.id);
			    					    		}
			    					    	})
			    					    );
			    					}
			                    })
			                 }
			            }
			        })
				})
			},{
				"name":"noPass",
				"text" : "拒绝",
				"class" : "ok",
				"click" : this.proxy(function(){
					var clz = $.u.load("com.audit.comm_file.confirm");
			        var confirm = new clz({
			            "body": "确认操作？",
			            "buttons": {
			                "ok": {
			                    "click": this.proxy(function(){
			                    	if(qdForm.valid()){
			    						var sdata = this.questionDialog.getFormData();
			    						sdata.status = "AUDIT_REJECTED";
			    						this._ajax(
			    							$.u.config.constant.smsmodifyserver,
			    							"post",
			    				    		{
			    					    		"method": "stdcomponent.update",
			    					            "dataobject":"improveNoticeIssue",
			    					            "dataobjectid":data.id,
			    					            "obj":JSON.stringify(sdata)
			    				            },
			    				            qdForm,
			    				            this.proxy(function(response){
			    				            	if(response.success){
			    				            		confirm.confirmDialog.dialog("close");
			    					    			$.u.alert.success("拒绝成功",3000);
			    					    			qdQuestion.dialog("close");
			    					    			this.listTableByIdAndStatus(data.id);
			    					    		}
			    					    	})
			    					    );
			    					}
			                    })
			                 }
			            }
			        })
				})
			},{
				"name":"noComplete",
				"text" : "暂时无法完成",
				"class" : "ok",
				"click" : this.proxy(function(){
					var clz = $.u.load("com.audit.comm_file.confirm");
			        var confirm = new clz({
			            "body": "确认操作？",
			            "buttons": {
			                "ok": {
			                    "click": this.proxy(function(){
			                    	if(qdForm.valid()){
			    						var sdata = this.questionDialog.getFormData();
			    						sdata.status = "AUDIT_UN_COMPLETED_TEMPORARILY";
			    						this._ajax(
			    							$.u.config.constant.smsmodifyserver,
			    							"post",
			    				    		{
			    					    		"method": "stdcomponent.update",
			    					            "dataobject":"improveNoticeIssue",
			    					            "dataobjectid":data.id,
			    					            "obj":JSON.stringify(sdata)
			    				            },
			    				            qdForm,
			    				            this.proxy(function(response){
			    				            	if(response.success){
			    				            		confirm.confirmDialog.dialog("close");
			    					    			$.u.alert.success("暂时无法完成成功",3000);
			    					    			qdQuestion.dialog("close");
			    					    			this.listTableByIdAndStatus(data.id);
			    					    		}
			    					    	})
			    					    );
			    					}
			                    })
			                 }
			            }
			        })
				})
			},{
				"name":"complete",
				"text" : "保存",
				"class" : "ok",
				"click" : this.proxy(function(){
					if(qdForm.valid()){
						var sdata = this.questionDialog.getFormData();
						sdata.status = "COMPLETION";
						this._ajax(
							$.u.config.constant.smsmodifyserver,
							"post",
				    		{
					    		"method": "stdcomponent.update",
					            "dataobject":"improveNoticeIssue",
					            "dataobjectid":data.id,
					            "obj":JSON.stringify(sdata)
				            },
				            qdForm,
				            this.proxy(function(response){
				            	if(response.success){
					    			$.u.alert.success("成功",3000);
					    			qdQuestion.dialog("close");
					    			this.listTableByIdAndComplete(data.id);
					    		}
					    	})
					    );
					}
				})
			},{
				"name":"submit",
				"text" : "提交",
				"class" : "ok",
				"click" : this.proxy(function(){
					if(qdForm.valid()){
						var sdata = this.questionDialog.getFormData();
						sdata.status = "COMPLETED";
						this._ajax(
							$.u.config.constant.smsmodifyserver,
							"post",
				    		{
					    		"method": "stdcomponent.update",
					            "dataobject":"improveNoticeIssue",
					            "dataobjectid":data.id,
					            "obj":JSON.stringify(sdata)
				            },
				            qdForm,
				            this.proxy(function(response){
				            	if(response.success){

				            		this.questionDialog.stratUpload(data.id);
				            		this.questionDialog.question.siblings().find("button").attr("disabled",true)
				            		var Inid=setInterval(this.proxy(function(){
				            			if(this.questionDialog.question.find(".uploadify-queue").children().length==0){
				            				clearInterval(Inid);
				            				this.questionDialog.question.siblings().find("button").attr("disabled",false)
				            				$.u.alert.success("成功",3000);
							    			qdQuestion.dialog("close");
							    			this.listTableByIdAndComplete(data.id);
					            		}}), 500)
					    		
				            		
//				            		
//					    			$.u.alert.success("成功",3000);
//					    			qdQuestion.dialog("close");
//					    			this.listTableByIdAndComplete(data.id);
					    		}
					    	})
					    );
					}
				})
			},{
				"name":"close",
				"text" : "关闭",
				"class": "aui-button-link",
				"click" : this.proxy(function(){
					qdQuestion.dialog("close");
				})
			}],
			"canDo":canDo,
			"fields":{
				"data":data,
				"canModify":canModify,
				"deleted":this._option.deleted,
				"required":required
			},
			"status":this._option.flowStatus
    	});
		
		var qdForm = this.questionDialog.form, qdQuestion = this.questionDialog.question;
    	this.questionDialog.open();
    },
    on_upd_click : function(e){
    	var id = $(e.currentTarget).attr("data-id");
    	if(!this.fileUpd){
    		$.u.load('com.audit.notice.fileUpload');
    	}
    	this.fileUdp = new com.audit.notice.fileUpload($('div[umid=upd]'),{
    		"source":{
    			"tokenid":$.cookie("tokenid"),
    			"method":"uploadFiles",
    			"source":id.toString(),
    			"sourceType":"10"
    		},
    		"list":this.proxy(this.filelist)
    	});
    	this.fileUdp.open();
    },
    filelist : function(data){
    	var $ul = this.questionTable.find("ul[data-id="+data[0].source+"]");
    	$('<li><span class="down" data-id="'+data[0].id+'">'+data[0].fileName+'</span>'+
    	'<span class="glyphicon glyphicon-remove mr-left remove" data-id="'+data[0].id+'" data-name="'+data[0].fileName+'"></span></li>').appendTo($ul);
    	$ul.find('span.down').off("click").on("click", this.proxy(this.download_file));
    	$ul.find('span.remove').off("click").on("click", this.proxy(this.del_file));
    },
    download_file:function(e){
    	var data = parseInt($(e.currentTarget).attr("data-id"));
        window.open($.u.config.constant.smsqueryserver+"?method=downloadFiles&tokenid="+$.cookie("tokenid")+"&ids="+JSON.stringify([data]));
    },
    del_file:function(e){
    	try{
    		var id = $(e.currentTarget).attr("data-id");
    		var name = $(e.currentTarget).attr("data-name");
    		(new com.sms.common.stdcomponentdelete({
    			body:"<div>"+
    				 	"<p>确认删除？</p>"+
    				 "</div>",
    			title:"删除文件:" + name,
    			dataobject:"file",
    			dataobjectids:JSON.stringify([parseInt(id)])
    		})).override({
    			refreshDataTable:this.proxy(function(){
	    			$(e.currentTarget).closest('li').fadeOut(function(){
		    		 	$(this).remove();
		    		});
    			})
    		});
    	}catch(e){
    		throw new Error("删除操作失败:"+e.message);
    	}
    },
    on_question_click : function(e){
    	var id = $(e.currentTarget).attr("data-id");
    	try{
    		(new com.sms.common.stdcomponentdelete({
    			body:"<div>"+
    				 	"<p>确认删除？</p>"+
    				 "</div>",
    			title:"删除问题",
    			dataobject:"improveNoticeIssue",
    			dataobjectids:JSON.stringify([parseInt(id)])
    		})).override({
    			refreshDataTable:this.proxy(function(){
    				$(e.currentTarget).closest('tr').fadeOut(function(){
		    		 	$(this).remove();
		    		 })
    			})
    		});
    	}catch(e){
    		throw new Error("删除操作失败:"+e.message);
    	}
    },
    getById : function(dataId){ 
    	
    	$.u.ajax({
			url : $.u.config.constant.smsqueryserver,
			type:"post",
            dataType: "json",
            cache: false,
            async:false,
            data: {
            	"tokenid":$.cookie("tokenid"),
	    		"method": "stdcomponent.getbyid",
	            "dataobject":"improveNoticeIssue",
	            "dataobjectid":dataId
            }
    	}).done(this.proxy(function(response) {
    		if(response.success){
        		if(response.data){
        			return response.data.files;
        		}
    		}else{
    			$.u.alert.error(response.reason+"!保存失败");
    		}
    	}))
    },
    
    
    refresh : function(){
    	
    },
    _ajax:function(url,type,param,$container,callback){
    	$.u.ajax({
    		"url":url,
    		"type": type,
    		"data":$.cookie("tokenid") ? $.extend({"tokenid":$.parseJSON($.cookie("tokenid"))},param) : $.extend({"tokenid":$.parseJSON($.cookie("uskyuser")).tokenid},param),
    		"dataType":"json"
    	},$container).done(this.proxy(function(response){
    		if (response.success) {
    			callback && callback(response);
    		}   		
    	})).fail(this.proxy(function(jqXHR,responseText,responseThrown){
    		
    	}));
    }
}, { usehtm: true, usei18n: false });

com.audit.notice.questionList.widgetjs = ["../../../uui/widget/spin/spin.js", 
                                             "../../../uui/widget/jqblockui/jquery.blockUI.js",
                                             "../../../uui/widget/ajax/layoutajax.js",
                                             "../../../uui/widget/select2/js/select2.min.js"];
com.audit.notice.questionList.widgetcss = [{id:"",path:"../../../uui/widget/select2/css/select2.css"},
                                             {id:"",path:"../../../uui/widget/select2/css/select2-bootstrap.css"}];
