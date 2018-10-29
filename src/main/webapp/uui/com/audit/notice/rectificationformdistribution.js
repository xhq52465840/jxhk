//@ sourceURL=com.audit.notice.rectificationformdistribution
$.u.load('com.audit.notice.baseInfo');
$.u.define('com.audit.notice.rectificationformdistribution', null, {
    init: function () {
    	this.IDList=[];
    	this.tr1 = '<tr data-id="#{id}"><td><input type="checkbox" /></td><td>#{num}</td><td class="#{issue}">#{issueContent}</td><td>#{improveUnit}</td><td>#{completionStatus}</td>'+
    		'<td>#{completionDate}</td><td>#{confirmMan}</td><td>#{traceFlowStatus}</td><td>#{confirmDate}</td></tr>';
    	this.tr2 = '<tr><td>#{num}</td><td>#{issueContent}</td><td>#{completionStatus}</td><td>#{confirmMan}</td><td>#{confirmDeadLine}</td><td>#{confirmDate}'+
    		'</td><td>#{traceFlowStatus}</td></tr>';
    	this.tr3 = '<tr data-id="#{id}"><td>#{num}</td><td>#{issueContent}</td><td>#{confirmMan}</td><td class="auditSummary">#{auditSummary}</td></tr>';
    	this.tr4 = '<tr data-id="#{id}"><td>#{num}</td><td>#{issueContent}</td><td>#{confirmMan}</td><td class="auditSummary">#{auditSummary}<i class="glyphicon glyphicon-pencil text-right" style="display:block;"></i></td></tr>';
    },
    afterrender: function () {
    	this.noticeid = $.urlParam().id;
    	if(!this.noticeid){
    		window.location.href = "RectificationNoticeList.html";
    	}
    	this.button = this.qid("button");
    	this.btn_export = this.qid("btn_export");
    	this.btn_export.off("click").on("click",this.proxy(this.on_btn_export));
    	this.form = this.qid("form");
    	this.check = this.qid("check");
    	this.check.off("click").on("click",this.proxy(this.on_check));
    	this.btn_all = this.qid("btn_all");
    	this.btn_all.off("click").on("click",this.proxy(this.on_all));//批量分派验证人员
    	this.btn_th = this.qid("btn_th");
    	this.btn_th.off("click").on("click",this.proxy(this.on_th));//批量通过
    	this.showData();
    },
    showData : function(){
    	this._ajax(
			$.u.config.constant.smsqueryserver,
			"post",
			{
				"method":"getImproveNoticeById",
				"id":this.noticeid.toString(),
				"isDividedByTraceItemStatus":true
			},
			this.form,
			this.proxy(function(response){
				var data = response.data.improveNotice;
				this.showBaseInfo(data,'','');
				this.showFileInfo(data.files);
				this.showVerificationInfo(data.improveNoticeIssues.waitedMaps,data.assignable);
				this.showCompleteInfo(data.improveNoticeIssues.completedMaps,data.assignable);
				this.showUnfinishedInfo(data.improveNoticeIssues.uncompletedTimelyMaps,data.assignable);
				this.showUnabletocompleteInfo(data.improveNoticeIssues.uncompletedtemporarilyMaps,data.assignable);
			})
		);
    },
    showBaseInfo : function(data,canModify,required){
    	this.baseInfo = new com.audit.notice.baseInfo($('div[umid=baseInfo]'),{
    		"canModify":canModify,
			"required":required,
			"data":data
    	});
    },
    showFileInfo : function(data){
    	if(!this.fileInfo){
    		$.u.load('com.audit.notice.fileDialog');
    		this.fileInfo = new com.audit.notice.fileDialog($('div[umid=fileInfo]'),{
    			"file":data
        	});
    	}
    	this.fileInfo.fileTable.find(".add_file").remove();
    },
    showVerificationInfo : function(data,assignable){
    	this.verification = this.qid("verification");
    	$tbody = this.verification.find("tbody");
    	$tbody.empty();
    	if(!assignable){
    		this.btn_all.remove();
    	}else{
    		this.btn_th.remove();
    	}
    	if(!data.length){
    		this.btn_th.remove();
    	}
    	data && $.each(data,this.proxy(function(idx,obj){
    		var text = [],caneditArray=[];
    		var canedit=true;
    		username=JSON.parse($.cookie("uskyuser")).username;
    		obj.confirmMan && $.each(obj.confirmMan,function(k,v){
    			text.push(v.text);
    			caneditArray.push(v.text);
    		});
    		caneditArray=caneditArray.join(",");
    		if(caneditArray.indexOf(username) == -1){
				canedit=false;
			}else{
				this.IDList.push(obj.id);
			}
    		var improveUnit = [];
			obj.improveUnit && $.each(obj.improveUnit,function(k,v){
				improveUnit.push(v.name);
			});
    		var temp = this.tr1.replace(/#\{num\}/g,idx+1)
    			.replace(/#\{id\}/g,obj.id)
    			.replace(/#\{issue\}/g,assignable?"issueContent":"issue")
    			.replace(/#\{issueContent\}/g,obj.issueContent || '')
    			.replace(/#\{improveUnit\}/g,improveUnit.join(",").toString())
    			.replace(/#\{completionStatus\}/g,obj.completionStatus || '')
    			.replace(/#\{completionDate\}/g,obj.completionDate || '')
    			.replace(/#\{confirmMan\}/g,text.join("<br>"))
    			.replace(/#\{traceFlowStatus\}/g,(obj.traceFlowStatus && obj.traceFlowStatus.hasOwnProperty("name") && obj.traceFlowStatus.name) || "")
    			.replace(/#\{confirmDate\}/g,obj.confirmDate || '');
    		$issue=$(temp).appendTo($tbody).find("td").eq(2).data("com",obj);
    		!assignable && !canedit && $issue.css({"color" : "black","cursor" :" default"}) && $issue.closest("tr").find("[type=checkbox]").addClass("hidden");
    		!assignable &&  canedit && $issue.addClass("canedit");
    		$tbody.find('td.issueContent').off("click").on("click",this.proxy(this.add_issueContent));
    		$tbody.find('td.issue.canedit').off("click").on("click",this.proxy(this.edit_issue));
    	
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
            this.verification,
            this.proxy(function(response){
    			var $tbody = this.verification.find("tbody");
    			var $tr = this.verification.find("tr[data-id="+id+"]");
    			var text = [];
    			response.data.confirmMan && $.each(response.data.confirmMan,function(k,v){
        			text.push(v.text);
        		});
    			$tr.find('td').eq(2).data("com",response.data);
    			$tr.find('td').eq(4).text(response.data.completionStatus || '');
    			$tr.find('td').eq(5).text(response.data.completionDate || '');
    			$tr.find('td').eq(6).html(text.join("<br>"));
    			$tr.find('td').eq(7).text((response.data.traceFlowStatus && response.data.traceFlowStatus.name) || '');
    			$tr.find('td').eq(8).text(response.data.confirmDate || '');
	    	})
	    );
    },
    add_issueContent : function(e){
    	var $e = $(e.currentTarget),
    		data = $e.data("com");
    	this.dialogShow(data,"single");
    },
    edit_issue : function(e){
    	var $e = $(e.currentTarget),
			data = $e.data("com");
    	this.dialogEdit(data,"single");
    },
    dialogShow : function(data,type){
    	if(!this.distributionInfo){
    		$.u.load("com.audit.notice.distributionInfo");
    	}
    	this.distributionInfo = new com.audit.notice.distributionInfo($('div[umid=distributionInfo]'),{
    		"title":"验证分派",
			"buttons":[{
				"name":"baoCun",
				"text" : "提交",
				"class" : "ok",
				"click" : this.proxy(function(){
					if(distributionForm.valid()){
						var sdata = this.distributionInfo.getFormData();
						if(sdata.confirmMan){
							if(this.distributionInfo.qid("confirmMan").attr("value")){
								var ids = this.distributionInfo.qid("confirmMan").attr("value");
								sdata.confirmMan = ids;
							}else{
								$.u.alert.error("请选择验证人！",3000);
								return;
							}
						}
						if(type=="single"){
							this._ajax(
								$.u.config.constant.smsmodifyserver,
								"post",
					    		{
						    		"method": "stdcomponent.update",
						            "dataobject":"improveNoticeIssue",
						            "dataobjectid":data.id,
						            "obj":JSON.stringify(sdata)
					            },
					            distributionForm,
					            this.proxy(function(response){
					            	if(response.success){
						    			$.u.alert.success("提交成功",3000);
						    			distributionDialog.dialog("close");
						    			this.listTableById(data.id);
						    		}
						    	})
						    );
						}else if(type=="multi"){
							var params = [];
							data.id && $.each(data.id, function(k, v){
								var s = {};
								for(var name in sdata){
					    			s[name] = sdata[name];
					    		}
								s.id = v;
								params.push(s);
							});
							this._ajax(
								$.u.config.constant.smsmodifyserver,
								"post",
					    		{
						    		"method": "stdcomponent.updateall",
						            "dataobject":"improveNoticeIssue",
						            "objs":JSON.stringify(params)
					            },
					            distributionForm,
					            this.proxy(function(response){
					            	if(response.success){
						    			$.u.alert.success("提交成功",3000);
						    			distributionDialog.dialog("close");
						    			data.id && $.each(data.id, this.proxy(function(k, v){
						    				this.listTableById(v);
										}));
						    		}
						    	})
						    );
						}
					}
				})
			},{
				"name":"close",
				"text" : "关闭",
				"class": "aui-button-link",
				"click" : this.proxy(function(){
					distributionDialog.dialog("close");
				})
			}],
    		"data" : $.extend(data,{"type":type}),
    		"canModify":"confirmSuggestion,confirmMan,confirmDeadLine",
    		"required":"confirmSuggestion,confirmMan,confirmDeadLine",
    		"deleted":"traceFlowStatus,confirmDate"
    	});
    	var distributionForm = this.distributionInfo.form,distributionDialog = this.distributionInfo.isuContentDialog;
    	this.distributionInfo.open();
    },
    dialogEdit : function(data,type){
    	if(!this.distributionInfo){
    		$.u.load("com.audit.notice.distributionInfo");
    	}
    	this.distributionInfo = new com.audit.notice.distributionInfo($('div[umid=distributionInfo]'),{
    		"title":"填写验证结论",
			"buttons":[{
				"name":"baoCun",
				"text" : "提交",
				"class" : "ok",
				"click" : this.proxy(function(){
					if(distributionForm.valid()){
						var sdata = this.distributionInfo.getFormData();
						if(type=="single"){
							this._ajax(
								$.u.config.constant.smsmodifyserver,
								"post",
					    		{
						    		"method": "stdcomponent.update",
						            "dataobject":"improveNoticeIssue",
						            "dataobjectid":data.id,
						            "obj":JSON.stringify(sdata)
					            },
					            distributionForm,
					            this.proxy(function(response){
					            	if(response.success){
						    			$.u.alert.success("提交成功",3000);
						    			distributionDialog.dialog("close");
						    			this.showData();
						    		}
						    	})
						    );
						}else if(type=="multi"){
							var params = [];
							data.id && $.each(data.id, function(k, v){
								var s = {};
								for(var name in sdata){
					    			s[name] = sdata[name];
					    		}
								s.id = v;
								params.push(s);
							});
							this._ajax(
								$.u.config.constant.smsmodifyserver,
								"post",
					    		{
						    		"method": "stdcomponent.updateall",
						            "dataobject":"improveNoticeIssue",
						            "objs":JSON.stringify(params)
					            },
					            distributionForm,
					            this.proxy(function(response){
					            	if(response.success){
						    			$.u.alert.success("提交成功",3000);
						    			distributionDialog.dialog("close");
						    			this.showData();
						    		}
						    	})
						    );
						}
					}
				})
			},{
				"name":"close",
				"text" : "关闭",
				"class": "aui-button-link",
				"click" : this.proxy(function(){
					distributionDialog.dialog("close");
				})
			}],
    		"data" : data,
    		"canModify":"traceFlowStatus,confirmDate",
    		"required":"traceFlowStatus,confirmDate",
    		"deleted":"confirmSuggestion,confirmMan,confirmDeadLine"
    	});
    	var distributionForm = this.distributionInfo.form,distributionDialog = this.distributionInfo.isuContentDialog;
    	this.distributionInfo.open();
    },
    showCompleteInfo : function(data,assignable){
    	this.complete = this.qid("complete");
    	$tbody = this.complete.find("tbody");
    	$tbody.empty();
    	data && $.each(data,this.proxy(function(idx,obj){
    		var text = [];
    		obj.confirmMan && $.each(obj.confirmMan,function(k,v){
    			text.push(v.text);
    		});
    		var temp = this.tr2.replace(/#\{num\}/g,idx+1)
    			.replace(/#\{issueContent\}/g,obj.issueContent || '')
    			.replace(/#\{completionStatus\}/g,obj.completionStatus || '')
    			.replace(/#\{confirmDeadLine\}/g,obj.confirmDeadLine || '')
    			.replace(/#\{confirmMan\}/g,text.join("<br>"))
    			.replace(/#\{confirmDate\}/g,obj.confirmDate || '')
    			.replace(/#\{traceFlowStatus\}/g,(obj.traceFlowStatus && obj.traceFlowStatus.hasOwnProperty("name") && obj.traceFlowStatus.name) || "");
    		$(temp).appendTo($tbody);
    	}));
    },
    showUnfinishedInfo : function(data,assignable){
    	this.unfinished = this.qid("unfinished");
    	$tbody = this.unfinished.find("tbody");
    	$tbody.empty();
    	data && $.each(data,this.proxy(function(idx,obj){
    		var text = [];
    		obj.confirmMan && $.each(obj.confirmMan,function(k,v){
    			text.push(v.text);
    		});
    		var temp = this.tr3.replace(/#\{num\}/g,idx+1)
    			.replace(/#\{id\}/g,obj.id)
    			.replace(/#\{issueContent\}/g,obj.issueContent || '')
    			.replace(/#\{confirmMan\}/g,text.join("<br>") )
    			.replace(/#\{auditSummary\}/g,obj.auditSummary || '');
    		$temp=$(temp).appendTo($tbody);
    		this._is_confirmMan($temp);
    		$tbody.find("td.auditSummary.caneidt").off("click").on("click",this.proxy(this.audit_click));
    	}));
    },
    audit_click : function(e){
		var $e = $(e.currentTarget);
		if(!$e.find('textarea').length){
			var value = $e.text();
			$e.text("");
			$('<textarea class="form-control audit" style="resize:none;" rows="3">'+value+'</textarea>').appendTo($e);
			$('textarea.audit').focus();
			$("body").bind("mousedown", this.proxy(this.onBodyDown));
			this.value=value;
		}
	},
	onBodyDown : function(e){
		if(!((e.target.className == "auditSummary" && $(e.target).find('textarea').length>0) || (e.target.className == "form-control audit" && $(e.target).parents("td.auditSummary").length>0))){
			var $tr = $(e.target).parents("tr");
			var id = $tr.attr("data-id");
			var value = $('textarea.audit').val();
			if(	this.value==value ){
				$('textarea.audit').parent('td').text(value).append($("<i class='glyphicon glyphicon-pencil text-right' style='display:block;'></i>"));
				$('textarea.audit').remove();
				return 
			}
			if(value){
				this._ajax(
	    			$.u.config.constant.smsmodifyserver,
	    			"post",
	    			{
	    				"method": "stdcomponent.update",
			            "dataobject":"improveNoticeIssue",
			            "dataobjectid":id,
			            "obj":JSON.stringify({
			            	"auditSummary":value
			            })
	    			},
	    			$tr.parents('table'),
	    			this.proxy(function(response){
	    				$.u.alert.info("提交成功！",3000);
	    				$('textarea.audit').parent('td').text(value).append($("<i class='glyphicon glyphicon-pencil text-right' style='display:block;'></i>"));
	    				$('textarea.audit').remove();
	    				$("body").unbind("mousedown", this.proxy(this.onBodyDown));
	    				if(e.target.className == "auditSummary"){
	    					$(e.target).click();
	    				}
	    			})
	    		);
			}else{
				$('textarea.audit').remove();
				$("body").unbind("mousedown", this.proxy(this.onBodyDown));
				if(e.target.className == "auditSummary"){
					$(e.target).click();
				}
			}
		}
	},
    showUnabletocompleteInfo : function(data,assignable){
    	this.unabletocomplete = this.qid("unabletocomplete");
    	$tbody = this.unabletocomplete.find("tbody");
    	$tbody.empty();
    	data && $.each(data,this.proxy(function(idx,obj){
    		var text = [];
    		obj.confirmMan && $.each(obj.confirmMan,function(k,v){
    			text.push(v.text);
    		});
    		var temp = this.tr4.replace(/#\{num\}/g,idx+1)
    			.replace(/#\{id\}/g,obj.id)
    			.replace(/#\{issueContent\}/g,obj.issueContent || '')
    			.replace(/#\{confirmMan\}/g,text.join("<br>") || '')
    			.replace(/#\{auditSummary\}/g,obj.auditSummary || '');
    		$temp=$(temp).appendTo($tbody);
    		this._is_confirmMan($temp);
    		$tbody.find("td.auditSummary.caneidt").off("click").on("click",this.proxy(this.audit_click));
    	}));
    },
    _is_confirmMan:function(contain){
    	username=JSON.parse($.cookie("uskyuser")).username;
    	text=contain.children("td").eq(2).text();
    	if(text.indexOf(username) > -1){
    		contain.find(".auditSummary").addClass("caneidt").attr("style","cursor: pointer;");
    		//contain.find(".auditSummary").addClass("uui-cursor-pointer");
    	}
    	else{
    		contain.find(".auditSummary").attr("cursor", "Default");
    		contain.find("i.glyphicon-pencil").remove();
    	}
    },
    
    on_check : function(e){
    	var $e = $(e.currentTarget), $input = this.verification.find('tbody input[type=checkbox]');
    	if($e.prop("checked")){
    		$input.prop("checked", true);
    	}else{
    		$input.prop("checked", false);
    	}
    },
    on_btn_export : function(){
    	var improveNoticeIssueIds=this.IDList;
    	if(improveNoticeIssueIds.length){
    		var form = $("<form>");
            form.attr('style', 'display:none');
            form.attr('target', '_blank');
            form.attr('method', 'post');
            form.attr('action', $.u.config.constant.smsqueryserver+"?method=exportImproveNoticeToPdf&tokenid="+
            		$.cookie("tokenid")+"&exportType=TRACE&improveNoticeIssueIds="+JSON.stringify(improveNoticeIssueIds)+
            		"&id="+this.noticeid);
            form.appendTo('body').submit().remove();
    	}else{
    		$.u.alert.info("未发现待验证项目的问题列表",3000);
    	}
    },
    on_all : function(e){//批量分派
    	e.preventDefault();
    	var $tbody = this.verification.find("tbody");
    	var $checked = $tbody.find("input:checkbox:checked");
    	var length = $checked.length;
    	if(length){
    		var textie = "",textin = "",textcs = "",textit = "" ;
    		var id = [];
    		var data = $tbody.find("tr").eq(0).find("td").eq(2).data("com");
    		var data1 = {},idxdata=null;
    		for(var name in data){
    			data1[name] = data[name];
    		}
    		$checked.each(this.proxy(function(idx, obj){
    			var $tr = $(obj).parents('tr');
    			var tdData = $tr.find("td").eq(2).data("com");
    			idxdata=tdData;
    			//text += (idx+1)+"、"+tdData.issueContent+"\n";
    			textie += (idx+1)+"、"+tdData.improveMeasure+"\n";
    			textin += (idx+1)+"、"+tdData.improveReason+"\n";
    			textcs += (idx+1)+"、"+tdData.completionStatus+"\n";
    			textit += (idx+1)+"、"+tdData.issueContent+"\n";
    			id.push(tdData.id);
    		}));
    		//data1.issueContent = text;
    		data1.improveMeasure = textie;
    		data1.improveReason = textin;
    		data1.completionStatus = textcs;
    		data1.issueContent = textit;
    		data1.id = id;
    		if(length == 1){
    			this.dialogShow(idxdata,"single");
    		}else{
    			this.dialogShow(data1,"multi");
    		}
    	}else{
    		$.u.alert.error("未选择任何项目");
    	}
    },
    on_th : function(e){//批量验证
    	e.preventDefault();
    	var $tbody = this.verification.find("tbody");
    	var $checked = $tbody.find("input:checkbox:checked:visible");;
    	var length = $checked.length;
    	if(length){
    		var textie = "",textin = "",textcs = "",textit = "" ;
    		var id = [];
    		var data = $tbody.find("tr").eq(0).find("td").eq(2).data("com");
    		var data1 = {}, idxdata=null; 
    		for(var name in data){
    			data1[name] = data[name];
    		}
    		$checked.each(this.proxy(function(idx, obj){
    			var $tr = $(obj).parents('tr');
    			var tdData = $tr.find("td").eq(2).data("com");
    			idxdata=tdData;
    			textie += (idx+1)+"、"+tdData.improveMeasure+"\n";
    			textin += (idx+1)+"、"+tdData.improveReason+"\n";
    			textcs += (idx+1)+"、"+tdData.completionStatus+"\n";
    			textit += (idx+1)+"、"+tdData.issueContent+"\n";
    			id.push(tdData.id);
    		}));
    		data1.improveMeasure = textie;
    		data1.improveReason = textin;
    		data1.completionStatus = textcs;
    		data1.issueContent = textit;
    		data1.id = id;
    		if(length == 1){
    			this.dialogEdit(idxdata,"single");
    		}else{
    			this.dialogEdit(data1,"multi");
    		}
    	}else{
    		$.u.alert.error("未选择任何项目");
    	}
    },
    baseEdit : function(){
    	if(this.baseInfo.baseinfoform.valid()){
    		this._ajax(
    			$.u.config.constant.smsmodifyserver,
    			"post",
    			{
    				"method":"stdcomponent.update",
    				"dataobject":"subImproveNotice",
    				"dataobjectid":this.noticeid,
    				"obj":JSON.stringify(this.baseInfo.getFormData())
    			},
    			this.form,
    			this.proxy(function(response){
    				$.u.alert.info("提交成功！",3000);
    			})
    		);
    	}
    },
    _ajax:function(url,type,param,$container,callback){
    	$.u.ajax({
    		"url":url,
    		"type": type,
    		"data":$.cookie("tokenid") ? $.extend({"tokenid":$.cookie("tokenid")},param) : $.extend({"tokenid":$.parseJSON($.cookie("uskyuser")).tokenid},param),
    		"dataType":"json"
    	},$container).done(this.proxy(function(response){
    		if (response.success) {
    			callback && callback(response);
    		}   		
    	})).fail(this.proxy(function(jqXHR,responseText,responseThrown){
    		
    	}));
    }
}, { usehtm: true, usei18n: false });

com.audit.notice.rectificationformdistribution.widgetjs = ["../../../uui/widget/jqurl/jqurl.js",
                                               "../../../uui/widget/spin/spin.js", 
                                               "../../../uui/widget/jqblockui/jquery.blockUI.js",
                                               "../../../uui/widget/ajax/layoutajax.js",
                                               "../../../uui/widget/select2/js/select2.min.js"
                                              ];
com.audit.notice.rectificationformdistribution.widgetcss = [{id:"",path:"../../../uui/widget/select2/css/select2.css"},
                                                {id:"",path:"../../../uui/widget/select2/css/select2-bootstrap.css"}];