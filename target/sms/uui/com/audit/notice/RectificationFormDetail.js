//@ sourceURL=com.audit.notice.RectificationFormDetail
$.u.load('com.audit.notice.baseInfo');
$.u.define('com.audit.notice.RectificationFormDetail', null, {
    init: function () {
    	this.temp = '<tr style="border-bottom: 1px  solid #ddd"><th scope="row">#{num}</th>'
    		+ '<td><a href="RectificationFormSubmit.html?id=#{id}">#{improveUnit}</a></td>'
    		+ '<td>#{issueCount}</td>'
    		+ '<td>#{flowStatus}</td>'
    		+ '<td><a unitid="#{id}" href="#">删除</a></td></tr>';
    },
    afterrender: function () {
    	this.noticeid = $.urlParam().id;
    	if(!this.noticeid){
    		window.location.href = "RectificationNoticeList.html";
    	}
    	this.description = this.qid("description");
    	this.form = this.qid("form");
    	this.questionInfo = this.qid("questionInfo");
    	this.showLog = this.qid("log_show");
    	this.showData();
    },
    showData : function(){
    	this._ajax(
			$.u.config.constant.smsqueryserver,
			"post",
			{
				"method":"getImproveNoticeById",
				"id":this.noticeid.toString(),
				"isGroupedByImproveUnit":true
			},
			this.form,
			this.proxy(function(response){
				response.data.improveNotice.executive = response.data.improveNotice.executive;
				response.data.improveNotice.executiveTel = response.data.improveNotice.executiveTel;
				this.showBaseInfo(response.data.improveNotice,'', '', '');
				this.showFileInfo(response.data.improveNotice,'nobutton');
				this.description.val(response.data.improveNotice.description||'');
				this.showQuestionInfo(response.data.improveNotice.subImproveNotices,response.data.improveNotice.deletable);
				
				//显示流程图
				 if(response.data.logArea && response.data.logArea.key){
         			var id = response.data.subImproveNotice.improveNotice.id;
             		var flowid = response.data.subImproveNotice.flowId;
                     var clz = $.u.load(response.data.logArea.key);
                     this.showLog.html("");
                     var target = $("<div/>").attr("umid", "logs").appendTo(this.showLog);
                     new clz( target, $.extend(true, response.data.logArea, {
                     	businessUrl: this.getabsurl("RectificationFormSubmit.html?id="+this.noticeid),                    
                         logRule: [[{"key":"source","value": parseInt(id)}],[{"key":"sourceType","value":"improveNotice"}]],
                         remarkRule: [[{"key":"source","value": parseInt(id)}],[{"key":"sourceType","value":"subImproveNotice"}]],
                         remarkObj: {
                             source: parseInt(id),
                             sourceType: "subImproveNotice"
                         },
                         addable: true,
                         flowid: flowid 
                     }) );
                 }
			})
		);
    },
    showBaseInfo : function(data,canModify,required,workflowNodeAttributes){
    	this.baseInfo = new com.audit.notice.baseInfo($('div[umid=baseInfo]'),{
    		"workflowNodeAttributes":workflowNodeAttributes,
    		"canModify":canModify,
			"required":required,
			"data":data
    	});
    },
    showFileInfo : function(data,btn){
    	if(!this.fileInfo){
    		$.u.load('com.audit.notice.fileDialog');
    		this.fileInfo = new com.audit.notice.fileDialog($('div[umid=fileInfo]'),{
    			"file":data,
    			"btn":btn || '',
    			"source":{
    				"tokenid":$.cookie("tokenid"),
    				"method":"uploadFiles",
    				"sourceType":"9",
    				"source":this.noticeid.toString()
    			}
        	});
    	}
    },
    showQuestionInfo : function(data,deletable){
    	data && $.each(data, this.proxy(function(k, v){
    		var temp = this.temp.replace(/#{num}/g, k+1)
    			.replace(/#{id}/g, v.id)
    			.replace(/#{improveUnit}/g, v.improveUnit[0]["name"])
    			.replace(/#{issueCount}/g, v.issueCount)
    			.replace(/#{flowStatus}/g, v.flowStatus)
    			.replace(/#{id}/g, v.id);
    		this.questionInfo.append(temp);
    	}));
    	this.questionInfo.off("click","a[unitid]").on("click","a[unitid]",this.proxy(this.on_delete_unit) );
    	if(deletable){
    		this.questionInfo.find("a[unitid]").removeClass("hidden");
    	}else{
    		this.questionInfo.find("a[unitid]").addClass("hidden");
    	}
    	
    },
    on_delete_unit:function(e){
    	e.preventDefault();
    	try{
    		var unitid = $(e.currentTarget).attr("unitid");
    		(new com.sms.common.stdcomponentdelete({
    			body:"<div>"+
    				 	"<p>确认删除？</p>"+
    				 "</div>",
    			title:"删除该责任单位的所有问题要点",
    			dataobject:"subImproveNotice",
    			dataobjectids:JSON.stringify([parseInt(unitid)])
    		})).override({
    			refreshDataTable:this.proxy(function(){
    				$('[unitid='+unitid+']').closest("tr").fadeOut(function(){
		    		 	$(this).remove();
		    		 })
    			})
    		});
    	}catch(e){
    		throw new Error("删除操作失败:"+e.message);
    	}
    	
    },
    
    
    on_workflow : function(e){
    	var wipId = $(e.currentTarget).attr("data-wipid");
    	if(this.baseInfo.baseinfoform.valid()){
	    	if(this.questionInfo.trStatus()){
	    		var clz = $.u.load("com.audit.comm_file.confirm");
    			var confirm = new clz({
    	            "body": "确认操作？",
    	            "buttons": {
    	                "ok": {
    	                    "click": this.proxy(function(){
    	                    	this._ajax(
    	                    			$.u.config.constant.smsmodifyserver,
    	                    			"post",
    	                    			{
    	                    				"method":"stdcomponent.update",
    	                    				"dataobject":"subImproveNotice",
    	                    				"dataobjectid":this.noticeid,
    	                    				"obj":JSON.stringify(this.baseInfo.getFormData())
    	                    			},
    	                    			confirm.confirmDialog.parent(),
    	                    			this.proxy(function(response){
    	                    				confirm.confirmDialog.dialog("close");
    	                    				this.workflow_next(wipId);
    	                    			})
    	                    	);
    	                    })
    	                }
    	            }
    			})
	    	}else{
	    		$.u.alert.error("请将问题列表下的内容填写完整",3000);
	    	}
    	}
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

com.audit.notice.RectificationFormDetail.widgetjs = ["../../../uui/widget/jqurl/jqurl.js",
                                               "../../../uui/widget/spin/spin.js", 
                                               "../../../uui/widget/jqblockui/jquery.blockUI.js",
                                               "../../../uui/widget/ajax/layoutajax.js",
                                               "../../../uui/widget/select2/js/select2.min.js"
                                              ];
com.audit.notice.RectificationFormDetail.widgetcss = [{id:"",path:"../../../uui/widget/select2/css/select2.css"},
                                                {id:"",path:"../../../uui/widget/select2/css/select2-bootstrap.css"}];