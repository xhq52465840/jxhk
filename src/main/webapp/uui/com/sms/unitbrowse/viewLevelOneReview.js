//@ sourceURL=com.sms.unitbrowse.viewLevelOneReview
$.u.load("com.sms.common.stdcomponentdelete");
$.u.define('com.sms.unitbrowse.viewLevelOneReview', null, {
    init: function (options) {
        this._options = options || {};
    },
    beforechildrenrender: function () {
    },
    afterrender: function (bodystr) {
    	this.unitid = ($.urlParam().id=="undefined"?"":$.urlParam().id);
    	if(!this.unitid){
    		window.location.href="/sms/uui/com/sms/dash/DashBoard.html";
    	}
    	this._createDialog();
    	this._initSearch();
    	this._createDatatable();
    	this.unitName = this.qid("unitReview");
    	this.subTitle = this.qid("subTitle");
    	this.sendID = this.qid("sendID");
    	this.countScore = this.qid("countScore");
    	this.qid("replace").on("click", this.proxy(this._replace));
    	this.qid("search").off("click").on("click",this.proxy(this._search));
    	this.dataTable.off("click", "button.view").on("click", "button.view", this.proxy(this._viewData));
    	this.dataTable.off("click", "button.manage").on("click", "button.manage", this.proxy(this._manageData));
    	this.dataTable.off("click", "button.pdf").on("click", "button.pdf", this.proxy(this._pdfData));
    },
    _replace: function(){
    	this._ajax(
			$.u.config.constant.smsmodifyserver,
			"POST",
			{
     			"tokenid":$.cookie("tokenid"),
        		"method":"evalCompletionByMethanolInst",
        		"methanolId":parseInt(this._options.sid)	
			},
			$("div[qid=singleReview]").parent(),
			function(data,_this){
				if(data.success){
					$.u.alert.info("重新计算成功", 3000);
					_this._review_view(_this._options.sid, "manage");
				}
			}
		)
    },
    _createDialog : function(){
    	this.levelOneDialog = this.qid("levelOneDialog").dialog({
			title:"安全工作评审",
			width:960,
			modal: true,
            draggable: false,
            resizable: false,
            autoOpen: false,
            open: this.proxy(function () {
            	
            }),
            close: this.proxy(this._dialogClose),
            create: this.proxy(function () {
            	
            })
		});
    },
    _dialogClose : function(){
    	var $tbody = $('table>tbody',this.levelOneDialog);
    	$tbody.empty();
    	this.sendID.val("");
    	this.countScore.text("");
    	this._options.sid = '';
    },
    _initSearch : function(){
    	this.year = this.qid("year");
    	this.season = this.qid("season");
    	this.remark = this.qid("remark");
    	this.member = this.qid("member");
    	this.status = this.qid("status");
    	var date = new Date();
    	var year = date.getFullYear();
    	for(var i = year; i > year-20; i--){
    		$('<option value="'+i+'">'+i+'</option>').appendTo(this.year);
    	}
    	var month = date.getMonth()+1;
    	var time = this._setM(month, year);
    	this.year.find('option[value='+time.year+']').attr("selected","selected");
    	this.season.find('option[value='+time.season+']').attr("selected","selected");
    },
    _setM : function(mo,year){
    	var obj = {
    		"season":mo,
    		"year":year
    	};
    	switch(mo){
    		case 1:
    		case 2:
    		case 3:
    			obj.season = 4;
    			obj.year = year-1;
    			break;
    		case 4:
    		case 5:
    		case 6:
    			obj.season = 1;
    			obj.year = year;
    			break;
    		case 7:
    		case 8:
    		case 9:
    			obj.season = 2;
    			obj.year = year;
    			break;
    		case 10:
    		case 11:
    		case 12:
    			obj.season = 3;
    			obj.year = year;
    			break
    	}
    	return obj;
    },
    _search : function(e){
    	e.preventDefault();
    	this.dataTable.fnDraw();
    },
    _createDatatable : function(){
    	this.dataTable = this.qid("datatable").dataTable({
            searching: false,
            serverSide: true,
            bProcessing: true,
            ordering: false,
            pageLength:5,
            "sDom":"tip",
            "columns": [
                { "title": "安监该机构" ,"mData":"unit"},
                { "title": "评审年份" ,"mData":"year"},
                { "title": "季度" ,"mData":"season"},
                { "title": "总分数" ,"mData":"score"},
                { "title": "状态" ,"mData":"status"},
                { "title": "操作" ,"mData":"id","sWidth":150}
            ],
            "aaData":[
                      
            ],
            "oLanguage": { //语言
                "sSearch": "搜索:",
                "sLengthMenu": "每页显示 _MENU_ 条记录",
                "sZeroRecords": "抱歉未找到记录",
                "sInfo": "从 _START_ 到 _END_ /共 _TOTAL_ 条数据",
                "sInfoEmpty": "没有数据",
                "sInfoFiltered": "(从总共_MAX_条记录中过滤)",
                "sProcessing": "检索中...",
                "oPaginate": {
                    "sFirst": "<<",
                    "sPrevious": "上一页",
                    "sNext": "下一页",
                    "sLast": ">>"
                }
            },
            "fnServerParams": this.proxy(function (aoData) {
            	$.extend(aoData,{
            		"tokenid":$.cookie("tokenid"),
            		"method":"stdcomponent.getbysearch",
            		"dataobject":"methanolInst",
            		"rule":JSON.stringify([[{"key":"unit","value":parseInt(this.unitid)}],
            		                        [{"key":"year","value":parseInt(this.year.val())}],
            		                        [{"key":"season","value":parseInt(this.season.val())}],
            		                        [{"key":"status","value":this.status.val()}],
            		                        [{"key":"remark","value":this.remark.val()}]]),
            		"search":"",
            		"columns":JSON.stringify([{"data":"year"},{"data":"season"},{"data":"score"},{"data":"id"}]),
            		"order":JSON.stringify([{"column":0,"dir":"desc"},{"column":1,"dir":"desc"},{"column":2,"dir":"desc"},{"column":3,"dir":"desc"}])
            	},true);
            }),
            "fnServerData": this.proxy(function (sSource, aoData, fnCallBack, oSettings) {
            	$.u.ajax({
                    url: $.u.config.constant.smsqueryserver,
                    dataType: "json",
                    type:"post",
                    cache: false,
                    data: aoData
                },this.qid("datatable")).done(this.proxy(function (data) {
                    if (data.success) {
                        fnCallBack(data.data);
                    }
                })).fail(this.proxy(function (jqXHR, errorText, errorThrown) {

                }));
            }),
            "aoColumnDefs": [{
	                "aTargets": 0,
	                "mRender": function (data, type, full) {
	                	 return  full.unit;
	                }
	            },
                {
                    "aTargets": 1,
                    "mRender": function (data, type, full) {
                    	 return  data+"年";
                    }
                },
                {
                    "aTargets": 2,
                    "mRender": function (data, type, full) {
                    	 return "第" + data + "季度";
                    }
                },{
                    "aTargets": 3,
                    "mRender": this.proxy(function (data, type, full) {
	                	return data;
                    })
                },{
                    "aTargets": 4,
                    "mRender": this.proxy(function (data, type, full) {
                    	var retu = null;
                    	if(data=="NEW"){
                    		retu = "新建";
                    	}else if(data=="WAITING"){
                    		retu = "待审核";
                    	}else if(data=="COMPLETE"){
                    		retu = "完成";
                    	}else if(data=="CLOSED"){
                    		retu = "关闭";
                    	}
                    	return retu;
                    })
                },{
                    "aTargets": 5,
                    "mRender": this.proxy(function (data, type, full) {
                    	var htmls = "";
                    	if(full.status=="NEW"){
                    		htmls+=full.viewable?"<button class='btn btn-link view' data='"+data+"'>查看</button>":"";
                        	htmls+=full.manageable?"<button class='btn btn-link manage' data='"+data+"'>编辑</button>":"";
                    		htmls+="<button class='btn btn-link pdf' data='"+data+"'>导出</button>";
                    	}else{
                    		htmls+=full.viewable?"<button class='btn btn-link view' data='"+data+"'>查看</button>":"";
                    		htmls+="<button class='btn btn-link pdf' data='"+data+"'>导出</button>";
                    	}
                        return htmls;
                    })
                }
            ]
        });
    },
    _viewData : function(e){
    	e.preventDefault();
    	try{
    		var data = JSON.parse($(e.currentTarget).attr("data"));
    		var dialogOptions = {
	                buttons: [
	  			         {
	  					    text: "关闭",
	  					    "class": "aui-button-link",
	  					    click: this.proxy(function (e) {
	  					    	e.preventDefault();
	  					        this.levelOneDialog.dialog("close");
	  					    })
	  			         }
	                ]
	            };
    		this.levelOneDialog.dialog("option",dialogOptions).dialog("open");
    		this._review_view(data,"view");
    	}catch(e){
    		throw new Error("查看失败！"+e.message);
    	}
    },
    _review_view : function(id,type){
    	this._ajax(
			$.u.config.constant.smsqueryserver,
			"POST",
			{
     			"tokenid":$.cookie("tokenid"),
        		"method":"getMethanolById",
        		"id":parseInt(id)	
			},
			$("div[qid=levelOneDialog]").parent(),
			function(data,_this){
				if(data.success){
					_this._createTable(data.data,type);
				}
			}
		)
    },
    _createTable : function(data, type){
    	this.unitName.text(data.unitDisplayName+"安全工作评审表");
    	var season = "";
    	if(data.season == 1){
    		season = "一";
    	}else if(data.season == 2){
    		season = "二";
    	}else if(data.season == 3){
    		season = "三";
    	}else if(data.season == 4){
    		season = "四";
    	}
    	this.subTitle.text(data.created+"|"+data.year+"年第"+season+"季度的报表");
    	var length = $('th.comp').find("span").length;
    	switch(type){
    		case "view":
    			this._fillTable_new(data);
    			if(length){
    				$('th.comp').find("span").remove();
    			}
    			break;
    		case "manage":
    			this._fillTable_manage(data);
    			if(!length){
    				$('<span class="glyphicon glyphicon-edit" style="margin-left:5px;"></span>').appendTo($('th.comp'));
    			}
    			break;
    	}
    },
    _fillTable_new : function(data){
    	var $tbody = $('table>tbody',this.levelOneDialog);
    	$tbody.empty();
    	var score = 0;
    	data.assessmentProjectInsts && $.each(data.assessmentProjectInsts, this.proxy(function(index, item){
    		var length = item.assessmentCommentInsts.length;
    		item.assessmentCommentInsts && $.each(item.assessmentCommentInsts, this.proxy(function(key,value){
    			score += value.completion.score;
    			var tr = '<tr>';
    			if(key == 0){
    				tr +='<td rowspan="' + length + '" class="td-color">' + item.name + '</td>';
    			}
    			var oper = '';
    			if(value.type=="R"){
    				oper = '<a href="../safelib/ViewSafeReview.html?id='+value.assessmentCommentTemplateId+'" target="_blank">查看详情</a>';
    			}else if(value.type=="A"){
    				oper = '<a href="../search/Search.html?filterId='+value.filterId+'" target="_blank">查看详情</a>';
    			}
    			tr += '<td>' + (value.description ||'') + '</td>'+
    			       '<td style="background-color:#F4F4F0; text-align: left;">' + (value.standardSummary.replace(/\n/g,'<br/>') ||'') + '</td>'+
						'<td>' + ((value.completion && (value.completion.complete ||''))||'') + '</td>'+
						'<td  class="td-color">' + (((value.completion && (value.completion.score || ''))||'')==''?0:((value.completion && (value.completion.score || ''))||'')) + '</td>'+
						'<td >' + oper + '</td>'+
					  '</tr>';
    			$(tr).appendTo($tbody);
    		}))
    	}));
    	if(data.reviewers){
    		var len = data.reviewers.length - 1;
    		var text = "";
    		$.each(data.reviewers, this.proxy(function(k,v){
        		text += v.name + ((k==len)?"":",");
        	}));
    		this.member.val(text);
    	}
    	this.countScore.text(score);
    },
    _manageData : function(e){
    	e.preventDefault();
    	try{
    		var data = JSON.parse($(e.currentTarget).attr("data"));
    		this._options.sid = data;
    		var dialogOptions = {
	                buttons: [
						 {
							    text: "提交",
							    "class": "",
							    click: this.proxy(this._commitForm)
						 },
						 {
							    text: "保存",
							    "class": "",
							    click: this.proxy(this._saveForm)
						 },
	  			         {
	  					    text: "关闭",
	  					    "class": "aui-button-link",
	  					    click: this.proxy(function (e) {
	  					    	e.preventDefault();
	  					        this.levelOneDialog.dialog("close");
	  					    })
	  			         }
	                ]
	            };
    		this.levelOneDialog.dialog("option",dialogOptions).dialog("open");
    		this.sendID.val(data);
    		this._review_view(data, "manage");
    	}catch(e){
    		throw new Error("编辑失败！"+e.message);
    	}
    },
    _fillTable_manage : function(data){
    	var $tbody = $('table>tbody',this.levelOneDialog);
    	$tbody.empty();
    	var score = 0;
    	data.assessmentProjectInsts && $.each(data.assessmentProjectInsts, this.proxy(function(index, item){
    		var length = item.assessmentCommentInsts.length;
    		item.assessmentCommentInsts && $.each(item.assessmentCommentInsts, this.proxy(function(key,value){
    			score += value.completion.score;
    			var tr = '<tr>';
    			if(key == 0){
    				tr += '<td rowspan="' + length + '" class="td-color">' + item.name + '</td>';
    			}
    			var oper = '';
    			if(value.type=="R"){
    				oper = '<a href="../safelib/ViewSafeReview.html?id='+value.assessmentCommentTemplateId+'" target="_blank">查看详情</a>';
    			}else if(value.type=="A"){
    				oper = '<a href="../search/Search.html?filterId='+value.filterId+'" target="_blank">查看详情</a>';
    			}
    			tr += '<td>' + (value.description ||'') + '</td>'+
    			       '<td style="background-color:#F4F4F0; text-align: left;">' + (value.standardSummary.replace(/\n/g,'<br/>') ||'') + '</td>'+
						'<td class="com-edit"><span  data='+((value.completion && (value.completion.id ||''))||'')+'>' + ((value.completion && (value.completion.complete ||''))||'') + '</span></td>'+
						'<td  class="td-color">' + (((value.completion && (value.completion.score || ''))||'')==''?0:((value.completion && (value.completion.score || ''))||'')) + '</td>'+
						'<td>'+oper+'</td>'+
					  '</tr>';
    			$(tr).appendTo($tbody);
    		}))
    	}));
    	if(data.reviewers){
    		var len = data.reviewers.length - 1;
    		var text = "";
    		$.each(data.reviewers, this.proxy(function(k,v){
        		text += v.name + ((k==len)?"":",");
        	}));
    		this.member.val(text);
    	}
    	this.countScore.text(score);
    	$('td.com-edit').on("click",this.proxy(this._comEdit));
    },
    _comEdit : function(e){
    	var $target = $(e.currentTarget);
    	var $span = $(e.currentTarget).find("span");
    	var text = $(e.currentTarget).find("span").text();
    	var display = $span.css("display");
    	if(display!="none"){
    		$span.hide();
        	$('<textarea rows="6">'+text+'</textarea>').appendTo($target);
        	$target.find("textarea").focus();
        	$target.find("textarea").on("blur",function(e){
        		var value = $(e.currentTarget).val();
        		$span.text(value);
        		$(e.currentTarget).remove();
        		$span.show();
        	})
    	}
    },
    _saveForm : function(e){
    	e.preventDefault();
    	this._commit("save");
    },
    _commitForm : function(e){
    	e.preventDefault();
    	this._commit("commit");
    },
    _commit : function(type){
    	var snedData = [];
    	var mark = true;
    	var id = parseInt(this.sendID.val());
		$('td.com-edit > span').each(function(index, item){
    		var $this = $(item);
    		var id = parseInt($this.attr("data"));
    		var complete = $this.text();
    		if(type=="commit"){
    			if(complete == ""){
        			mark = false;
        			return false;
        		}else{
        			snedData.push({
        				"id": id,
        				"complete": complete
        			})
        		}
    		}else{
    			snedData.push({
    				"id": id,
    				"complete": complete
    			})
    		}
    	})	
    	if(mark){
    		this._ajax(
				$.u.config.constant.smsmodifyserver,
				"POST",
				{
	     			"tokenid":$.cookie("tokenid"),
	     			"operation":type,
	        		"method":"updateCompletionInsts",
	        		"completionInsts":JSON.stringify(snedData),
	        		"methanolId":id	
				},
				$("div[qid=levelOneDialog]").parent(),
				function(data,_this){
					if(data.success){
						_this.levelOneDialog.dialog("close");
						_this.dataTable.fnDraw();
					}
				}
			)
    	}else{
    		$.u.alert.error("有未填写的完成情况。");
    	}
    },
    _ajax : function(url, type, data, $container,callback){
    	$.u.ajax({
    		url: url,
            type: type,
            dataType: "json",
            data: data
    	},$container).done(this.proxy(function(response){
    		if(response.success){
    			callback(response,this);
    		}
    	})).fail(this.proxy(function(jqXHR,errorText,errorTHrown){
    		
    	}))
    },
    _pdfData : function(e){
    	var id = $(e.currentTarget).attr("data");
    	var form = $("<form>");
        form.attr('style', 'display:none');
        form.attr('target', '_blank');
        form.attr('method', 'post');
        form.attr('action', $.u.config.constant.smsqueryserver+"?method=exportMethanolToPdf&tokenid="+$.cookie("tokenid")+"&id="+id);
        form.appendTo('body').submit().remove();
    },
    destroy: function () {
        this._super();
    }
}, { usehtm: true, usei18n: false });

com.sms.unitbrowse.viewLevelOneReview.widgetjs = ['../../../uui/widget/jqdatatable/js/jquery.dataTables.js', 
                                                  '../../../uui/widget/jqdatatable/js/dataTables.bootstrap.js',
                                                  "../../../uui/widget/spin/spin.js",
                                                  "../../../uui/widget/jqblockui/jquery.blockUI.js",
                                                  "../../../uui/widget/ajax/layoutajax.js"];
com.sms.unitbrowse.viewLevelOneReview.widgetcss = [{ path: '../../../uui/widget/jqdatatable/css/jquery.dataTables.css' }, 
                                                   { path: '../../../uui/widget/jqdatatable/css/dataTables.bootstrap.css' }];