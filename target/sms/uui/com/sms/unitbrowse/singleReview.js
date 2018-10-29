//@ sourceURL=com.sms.unitbrowse.singleReview
$.u.define('com.sms.unitbrowse.singleReview', null, {
    init: function (options) {
        this._options = options;
    },
    afterrender: function (bodystr) {
    	var id = ($.urlParam().id=="undefined"?"":$.urlParam().id);
    	if(!id){
    		window.location.href="/sms/uui/com/sms/dash/DashBoard.html";
    	}
    	this.unitName = this.qid("unitReview");
    	this.subTitle = this.qid("subTitle");
    	this.sendID = this.qid("sendID");
    	this.sendID.val(id);
    	this.countScore = this.qid("countScore");
    	this._review_view(id);
    	this.qid("replace").on("click", this.proxy(this._replace));
    	this.qid("submit").off("click").on("click",this.proxy(this._commitForm));
    	this.qid("save").off("click").on("click",this.proxy(this._saveForm));
    },
    _replace: function(){
    	var id = ($.urlParam().id=="undefined"?"":$.urlParam().id);
    	this._ajax(
			$.u.config.constant.smsmodifyserver,
			"POST",
			{
     			"tokenid":$.cookie("tokenid"),
        		"method":"evalCompletionByMethanolInst",
        		"methanolId":parseInt(id)	
			},
			$("div[qid=singleReview]").parent(),
			function(data,_this){
				if(data.success){
					$.u.alert.info("重新计算成功");
					_this._review_view(id);
				}
			}
		)
    },
    _review_view : function(id){
    	this._ajax(
			$.u.config.constant.smsqueryserver,
			"POST",
			{
     			"tokenid":$.cookie("tokenid"),
        		"method":"getMethanolById",
        		"id":parseInt(id)	
			},
			$("div[qid=singleReview]").parent(),
			function(data,_this){
				if(data.success){
					_this._createTable(data.data);
				}
			}
		)
    },
    _createTable : function(data){
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
		this._fillTable_manage(data);
		if(!length){
			$('<span class="glyphicon glyphicon-edit" style="margin-left:5px;"></span>').appendTo($('th.comp'));
		}
    },
    _fillTable_manage : function(data){
    	var $tbody = $('table>tbody');
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
    			       '<td style="background-color:#F4F4F6; text-align: left;">' + (value.standardSummary.replace(/\n/g,'<br/>') ||'') + '</td>'+
						'<td class=" com-edit"><span  data='+((value.completion && (value.completion.id ||''))||'')+'>' + ((value.completion && (value.completion.complete ||''))||'') + '</span></td>'+
						'<td  class="td-color">' + (((value.completion && (value.completion.score || ''))||'')==''?0:((value.completion && (value.completion.score || ''))||'')) + '</td>'+
						'<td>'+oper+'</td>'+
					  '</tr>';
    			$(tr).appendTo($tbody);
    		}))
    	}))
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
				$("div[qid=singleReview]").parent(),
				function(data,_this){
					if(data.success){
						_this._review_view(id);
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
    destroy: function () {
        this._super();
    }
}, { usehtm: true, usei18n: false });

com.sms.unitbrowse.singleReview.widgetjs = ['../../../uui/widget/jqdatatable/js/jquery.dataTables.js', 
                                                  '../../../uui/widget/jqdatatable/js/dataTables.bootstrap.js',
                                                  "../../../uui/widget/spin/spin.js",
                                                  "../../../uui/widget/jqblockui/jquery.blockUI.js",
                                                  "../../../uui/widget/ajax/layoutajax.js"];
com.sms.unitbrowse.singleReview.widgetcss = [{ path: '../../../uui/widget/jqdatatable/css/jquery.dataTables.css' }, 
                                                   { path: '../../../uui/widget/jqdatatable/css/dataTables.bootstrap.css' }];