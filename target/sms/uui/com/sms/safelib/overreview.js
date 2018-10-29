//@ sourceURL=com.sms.safelib.overreview
$.u.load("com.sms.common.stdcomponentdelete");
$.u.define('com.sms.safelib.overreview', null, {
    init: function (options) {
        this._options = options||null;
        this.select2PageLength = 10;
    },
    afterrender: function (bodystr) {
    	this._createDialog();
    	this._initSearch();
    	this._createDatatable();
    	this.tbody = this.qid("tbody");
    	this.unitName = this.qid("unitReview");
    	this.subTitle = this.qid("subTitle");
    	this.sendID = this.qid("sendID");
    	this.countScore = this.qid("countScore");
    	this.qid("search").off("click").on("click",this.proxy(this._search));
    	this.dataTable.off("click", "button.view").on("click", "button.view", this.proxy(this._viewData));
    	this.dataTable.off("click", "button.manage").on("click", "button.manage", this.proxy(this._manageData));
    	this.dataTable.off("click", "button.pdf").on("click", "button.pdf", this.proxy(this._pdfData));
    	this.tbody.on("click","td.assessment", this.proxy(this._assessment));
    },
    _assessment: function(e){
    	var id = parseInt($(e.currentTarget).attr("data-id"), 10);
    	this._ajax(
			$.u.config.constant.smsqueryserver,
			"POST",
			{
     			"tokenid":$.cookie("tokenid"),
        		"method":"stdcomponent.getbysearch",
        		"dataobject":"scoreStandardInst",
        		"rule":JSON.stringify([[{key:"assessmentCommentInst",value:id}]])
			},
			$("div[qid=levelOneDialog]").parent(),
			function(data,_this){
				_this.qid("assessmentDialog").empty();
				var dt = '', tr = '';
				if(data.success){
					if(data.data.aaData.length){
						dt = data.data.aaData[0];
						tr += '<tr><td rowspan="'+dt.details.length+'">'+(dt.min===null?'':dt.min)+'</td>'
					    	+ '<td rowspan="'+dt.details.length+'">'+(dt.max===null?'':dt.max)+'</td>';
						dt.details && $.each(dt.details, function(k, v){
							var left = v.leftInterval === null ? '-∞' : v.leftInterval,
							rigth = v.rightInterval === null ? '∞' : v.rightInterval,
							td = '<td >' + left + '-' + rigth +'</td>'
								+ '<td >' + (v.expression || '') + '</td>'
								+ '<td >' + (v.description || '') + '</td>';
							if(k === 0){
								tr += td;
							}else{
								tr += '<tr>'+td+'</tr>';
							}
						});
					}
					var table = '<table class="table">'
						+ '<thead>'
						+ '<th>最小值</th>'
						+ '<th>最大值</th>'
						+ '<th>范围</th>'
						+ '<th>公式</th>'
						+ '<th>描述</th>'
						+ '</thead>'
						+ '<tbody>'
						+ tr
						+ '</tbody>'
						+ '</table>';
					_this.qid("assessmentDialog").append(table);
					_this.assessmentDialog.dialog("open");
				}
			}
		);
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
    	this.comfirmDialog = this.qid("comfirmDialog").dialog({
    		title : "确认打分",
    		width:460,
			modal: true,
            draggable: false,
            resizable: false,
            autoOpen: false
    	});
    	this.assessmentDialog = this.qid("assessmentDialog").dialog({
    		title : "评审规则",
    		width:660,
			modal: true,
            draggable: false,
            resizable: false,
            autoOpen: false,
            buttons: [{
			    text: "关闭",
			    "class": "aui-button-link",
			    click: this.proxy(function (e) {
			    	e.preventDefault();
			        this.assessmentDialog.dialog("close");
			    })
	         }],
	         open: this.proxy(function(){
				var zIndex = parseInt($("body>.ui-dialog:last").css("z-index"), 10);
				$('div[qid=assessmentDialog]').parent('div.ui-dialog').css("z-index", zIndex + 2);
				$("body>.ui-widget-overlay:last").css("z-index", zIndex + 1);
			}),
			close: this.proxy(function(){
				this.qid("assessmentDialog").empty();
			})
    	});
    	this.scroeDialog = this.qid("scroeDialog").dialog({
    		title : "打分详情",
    		width:660,
			modal: true,
            draggable: false,
            resizable: false,
            autoOpen: false,
            buttons: [{
			    text: "关闭",
			    "class": "aui-button-link",
			    click: this.proxy(function (e) {
			    	e.preventDefault();
			        this.scroeDialog.dialog("close");
			    })
	         }],
	         open: this.proxy(function(){
				var zIndex = parseInt($("body>.ui-dialog:last").css("z-index"), 10);
				$('div[qid=scroeDialog]').parent('div.ui-dialog').css("z-index", zIndex + 2);
				$("body>.ui-widget-overlay:last").css("z-index", zIndex + 1);
			}),
			close: this.proxy(function(){
				this.qid("scroeDialog").empty();
			})
    	});
    },
    _dialogClose : function(){
    	var $tbody = $('table>tbody',this.levelOneDialog);
    	$tbody.empty();
    	this.sendID.val("");
    	this.countScore.text("");
    	this.remark_v.val("");
    	this.member.val("");
    	this.dataTable.fnDraw();
    },
    _initSearch : function(){
    	this.year = this.qid("year");
    	this.season = this.qid("season");
    	this.remark = this.qid("remark");
    	this.member = this.qid("member");
    	this.status = this.qid("status");
    	this.remark_v = this.qid("remark_v");
    	var date = new Date();
    	var year = date.getFullYear();
    	for(var i = year; i > year-20; i--){
    		$('<option value="'+i+'">'+i+'</option>').appendTo(this.year);
    	}
    	var month = date.getMonth()+1;
    	var time = this._setM(month, year);
    	this.year.find('option[value='+time.year+']').attr("selected","selected");
    	this.season.find('option[value='+time.season+']').attr("selected","selected");
    	this.unit = this.qid("unit").select2({
    		 placeholder: "请选择安监机构",
    		 allowClear: true,
             ajax: {
                url: $.u.config.constant.smsqueryserver,
                type : "POST",
                dataType: "json",
                data: this.proxy(function (term, page) {
                    return {
                        tokenid: $.cookie("tokenid"),
                        method: "stdcomponent.getbysearch",
                        dataobject: "unit",
                        rule : JSON.stringify([[{"key":"name","op":"like","value":term}]]),
                        start: (page - 1) * this.select2PageLength,
                        length: this.select2PageLength
                    };
                }),
                results: this.proxy(function (data, page) {
                    if (data.success) {
                        return {
                            results: data.data.aaData,
                            more: (page * this.select2PageLength) < data.data.iTotalRecords
                        };
                    }
                })
            },
            formatResult : function(item) {
				return item.name;
			},
			formatSelection : function(item) {
				return item.name;
			}
        });
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
    			break;
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
                { "title": "是否延期" ,"mData":"delay"},
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
            		"rule":JSON.stringify([[{"key":"unit","value":parseInt(this.unit.val()) ||""}],
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
                },
                {
                    "aTargets": 5,
                    "mRender": this.proxy(function (data, type, full) {
                    	return data ? '是' : '否';
                    })
                },
                {
                    "aTargets": 6,
                    "mRender": this.proxy(function (data, type, full) {
                    	var htmls = "";
                    	if(full.status=="WAITING"){
                    		htmls+=full.viewable?"<button class='btn btn-link view' data='"+data+"'>查看</button>":"";
                        	htmls+=full.auditable?"<button class='btn btn-link manage' data='"+data+"'>审核</button>":"";
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
    	this.remark_v.val(data.remark);
    	switch(type){
    		case "view":
    			this._fillTable_new(data);
    			if(length){
    				$('th.comp').find("span").remove();
    			}
    			this.remark_v.attr("readonly","readonly");
    			break;
    		case "manage":
    			this._fillTable_manage(data);
    			if(!length){
    				$('<span class="glyphicon glyphicon-edit" style="margin-left:5px;"></span>').appendTo($('th.completion'));
    				$('<span class="glyphicon glyphicon-edit" style="margin-left:5px;"></span>').appendTo($('th.comp'));
    			}
    			this.remark_v.removeAttr("readonly");
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
    				//oper += '<br/><a class="history-score" data="'+value.completion.id+'">打分日志</a>';
    			}else if(value.type=="A"){
    				oper = '<a href="../search/Search.html?filterId='+value.filterId+'" target="_blank">查看详情</a>';
    				//oper += '<br/><a class="history-score" data="'+value.completion.id+'">打分日志</a>';
    			}else{
    				oper = '';
    			}
    			tr += '<td class="'+(!(value.type !== 'R' && value.type !== 'A') ? 'assessment':'')+'" data-id="'+value.id+'">' + (value.description ||'') + '</td>'+
    					'<td class="td-color"  style="text-align: left;">' + (value.standardSummary.replace(/\n/g,'<br/>')||'') + '</td>'+
    					'<td>' + ((value.completion && (value.completion.complete ||''))||'') + '</td>'+
						'<td class="td-color">' + (((value.completion && (value.completion.score || ''))||'')==''?0:((value.completion && (value.completion.score || ''))||'')) + '</td>'+
						'<td data-id="'+value.id+'">' + oper + '</td>'+
					  '</tr>';
    			$(tr).appendTo($tbody);
    		}));
    	}));
    	$('a.history-score').off("click").on("click",this.proxy(this._history_score));
    	this.member.val(data.reviewer || "");
    	this.member.attr("readonly", "readonly");
    	this.countScore.text(score);
    },
    _manageData : function(e){
    	e.preventDefault();
    	try{
    		var data = JSON.parse($(e.currentTarget).attr("data"));
    		var dialogOptions = {
	                buttons: [
						 {
							    text: "审核完成",
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
    				//oper += '<br/><a class="history-score" data="'+value.completion.id+'">打分日志</a>';
    			}else if(value.type=="A"){
    				oper = '<a href="../search/Search.html?filterId='+value.filterId+'" target="_blank">查看详情</a>';
    				//oper += '<br/><a class="history-score" data="'+value.completion.id+'">打分日志</a>';
    			}else{
    			}
    			tr += '<td class="'+(!(value.type !== 'R' && value.type !== 'A') ? 'assessment':'')+'" data-id="'+value.id+'">' + (value.description ||'') + '</td>'+
    					'<td class="td-color" style="text-align: left;">' + (value.standardSummary.replace(/\n/g,'<br/>') ||'') + '</td>'+		
    					'<td class="comp-edit td-color '+((value.completion.status=='COMPLETE')?'no-edit':'')+'"><span data-id="'+value.completion.id+'" data='+((value.completion && (value.completion.complete ||''))||'')+'>' + ((value.completion && (value.completion.complete ||''))||'') + 
							'</span></td>'+
						'<td class="com-edit td-color '+((value.completion.status=='COMPLETE')?'no-edit':'')+'"><span data-id="'+value.completion.id+'" data ='+(((value.completion && (value.completion.score || ''))||'')==''?0:((value.completion && (value.completion.score || ''))||''))
							+'>' + (((value.completion && (value.completion.score || ''))||'')==''?0:((value.completion && (value.completion.score || ''))||'')) + '</span></td>'+
						'<td data-id="'+value.id+'">' + oper + '</td>'+
					  '</tr>';
    			$(tr).appendTo($tbody);
    		}))
    	}));
    	this.member.val(data.reviewer || "");
    	this.member.removeAttr("readonly");
    	this.countScore.text(score);
    	$('td.com-edit').off("click blur").on({
    		"click":this.proxy(this._comEdit)});
    	$('td.comp-edit').off("click blur").on({
    		"click":this.proxy(this._compEdit)});
    	$('a.com-score').off("click").on("click",this.proxy(this._complete));
    	$('a.history-score').off("click").on("click",this.proxy(this._history_score));
    },
    _blur: function(e){
    	var sNum = 0;
		$('td.com-edit').each(function(k,v){
			var value = parseFloat($(v).find("span").attr("data"));
			sNum += value;
		});
		this.countScore.text(sNum.toFixed(2));
    },
    _history_score: function(e){
    	var id = parseInt($(e.currentTarget).attr("data"), 10);
    	this._ajax(
			$.u.config.constant.smsqueryserver,
			"POST",
			{
     			"tokenid":$.cookie("tokenid"),
        		"method":"stdcomponent.getbysearch",
        		"dataobject":"completionInstOperation",
        		"rule":JSON.stringify([[{key:"completionInst",value:id}]])
			},
			$("div[qid=levelOneDialog]").parent(),
			function(data,_this){
				_this.qid("scroeDialog").empty();
				if(data.success){
					var dt = data.data.aaData,
						content = '', div = '';
					dt && $.each(dt, function(k, v){
						content += '<span> '+(k+1)+'、</span><span style="margin:0 5px;">'+v.date+'</span>'
							+ '<span style="margin:0 5px;">'+v.fullname+'</span>';
						v.details && $.each(v.details, function(idx, item){
							content += '<span style="color:blue;">' + item.content + '</span>';
						});
						div += '<div>'+content+'</div>';
					});
					_this.qid("scroeDialog").append(div);
					_this.scroeDialog.dialog("open");
				}
			}
		);
    },
    _comEdit : function(e){
    	var $target = $(e.currentTarget);
    	if($target.hasClass("no-edit")){
    		return false;
    	}
    	var self = this;
    	var $span = $(e.currentTarget).find("span");
    	var text = $(e.currentTarget).find("span").text();
    	var display = $span.css("display");
    	if(display!="none"){
    		$span.hide();
        	$('<input type="text" value="'+text+'" style="display:inline-block;width:100%;height:150px"/>').appendTo($target);
        	$target.find("input").focus();
        	$target.find("input").on("blur",function(e){
        		var value = $(e.currentTarget).val();
        		$span.text(value);
        		$span.attr("data",value);
        		$(e.currentTarget).remove();
        		$span.show();
        		self._blur();
        	})
    	}
    },
    _compEdit : function(e){
    	var $target = $(e.currentTarget);
    	if($target.hasClass("no-edit")){
    		return false;
    	}
    	var self = this;
    	var $span = $(e.currentTarget).find("span");
    	var text = $(e.currentTarget).find("span").text();
    	var display = $span.css("display");
    	if(display!="none"){
    		$span.hide();
        	$('<input type="text" value="'+text+'" style="display:inline-block;width:100%;height:150px;"/>').appendTo($target);
        	$target.find("input").focus();
        	$target.find("input").on("blur",function(e){
        		var value = $(e.currentTarget).val();
        		$span.text(value);
        		$span.attr("data",value);
        		$(e.currentTarget).remove();
        		$span.show();
        		self._blur();
        	})
    	}
    },
    _complete : function(e){
    	var $target = $(e.currentTarget);
    	var Sid = $target.attr("data");
    	var score = $target.parent().prev().find("span").text();
    	if(!this._isNum(score)){
    		$.u.alert.error("得分不为数字。");
    		return false;
    	}
    	this.comfirmDialog.dialog("option",
			"buttons", [
				 {
					    text: "确认",
					    "class": "",
					    click: this.proxy(function(e,$target){
					    	this._ajax(
								$.u.config.constant.smsmodifyserver,
								"POST",
								{
					     			"tokenid":$.cookie("tokenid"),
					     			"dataobject":"completionInst",
					        		"method":"stdcomponent.update",
					        		"dataobjectid":Sid,
					        		"obj":JSON.stringify({
					        			"score":parseInt(score),
					        			"status":"COMPLETE"
					        		})
								},
								$("div[qid=comfirmDialog]").parent(),
								function(data,_this){
									if(data.success){
										var $a = $('a[class=com-score][data='+Sid+']');
										$a.parent().prev().addClass("no-edit");
										$a.remove();
										var sNum = 0;
										$('td.com-edit').each(function(k,v){
											var value = parseFloat($(v).find("span").attr("data"));
											sNum += value;
										})
										_this.countScore.text(sNum);
										_this.comfirmDialog.dialog("close");
									}
								}
							)
					    })
				 },
		         {
				    text: "取消",
				    "class": "aui-button-link",
				    click: this.proxy(function (e) {
				    	e.preventDefault();
				        this.comfirmDialog.dialog("close");
				    })
		         }
	        ]).dialog("open");
    },
    _isNum : function(str){
    	var reg = "^([+-]?)\\d*\\.?\\d+$";
    	return new RegExp(reg).test(str);
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
    	var id = parseInt(this.sendID.val());
    	var member = this.member.val();
    	var completions = [];
    	$('td.com-edit').each(function(k,v){
    		var $span = $(v).find("span");
    		if(type=="commit"){
    			completions.push({
        			id: parseInt($span.attr("data-id")),
        			score: parseFloat($span.attr("data")),
    				status:"COMPLETE"
        		});
    		}else{
    			completions.push({
        			id: parseInt($span.attr("data-id")),
        			score: parseFloat($span.attr("data"))
        		});
    		}
    		
		});
    	$('td.comp-edit').each(function(k,v){
    		var $span = $(v).find("span");
    		completions[k].complete=$span.attr("data");
    		/*completions.push({
    			id: parseInt($span.attr("data-id")),
    			score: parseFloat($span.attr("data"))
    		});*/
		});
    	var remark = this.remark_v.val();
    	if(type == "save"){
    		this._ajax(
				$.u.config.constant.smsmodifyserver,
				"POST",
				{
	     			"tokenid":$.cookie("tokenid"),
	        		"method":"updateMethanolInsts",
	        		"operation":"save",
	        		"completions": JSON.stringify(completions),
	        		"methanolId":id,
	        		"remark":remark,
        			"reviewer": member
				},
				$("div[qid=levelOneDialog]").parent(),
				function(data,_this){
					if(data.success){
						_this.levelOneDialog.dialog("close");
					}
				}
			)
    	}else if(type == "commit"){
    		this._ajax(
				$.u.config.constant.smsmodifyserver,
				"POST",
				{
	     			"tokenid":$.cookie("tokenid"),
	        		"method":"updateMethanolInsts",
	        		"operation":"review",
	        		"completions": JSON.stringify(completions),
	        		"methanolId":id,
	        		"remark":remark,
        			"reviewer": member
				},
				$("div[qid=levelOneDialog]").parent(),
				function(data,_this){
					if(data.success){
						_this.levelOneDialog.dialog("close");
					}
				}
			)
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

com.sms.safelib.overreview.widgetjs = ['../../../uui/widget/jqdatatable/js/jquery.dataTables.js',
                                   '../../../uui/widget/jqdatatable/js/dataTables.bootstrap.js',
                                   "../../../uui/widget/select2/js/select2.min.js",
                                   "../../../uui/widget/jqurl/jqurl.js",
                                   "../../../uui/widget/jqztree/js/jquery.ztree.all-3.5.js",
                                   "../../../uui/widget/spin/spin.js",
                                   "../../../uui/widget/jqblockui/jquery.blockUI.js",
                                   "../../../uui/widget/ajax/layoutajax.js"];
com.sms.safelib.overreview.widgetcss = [{id:"ztreestyle",path:"../../../uui/widget/jqztree/css/zTreeStyle/zTreeStyle.css"},
                                    {path:'../../../uui/widget/select2/css/select2.css'},
                                    {path:'../../../uui/widget/select2/css/select2-bootstrap.css'},
                                    { path: '../../../uui/widget/jqdatatable/css/jquery.dataTables.css' }, 
                                    { path: '../../../uui/widget/jqdatatable/css/dataTables.bootstrap.css' }
                                    ];