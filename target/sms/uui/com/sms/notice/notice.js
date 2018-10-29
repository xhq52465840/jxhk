//@ sourceURL=com.sms.notice.notice
$.u.define('com.sms.notice.notice', null, {
    init: function (options) {
        this._options = options;
        this._notice = {};
    },
    afterrender: function (bodystr) { 
    	this.createDialog = null;
    	this.detailDialog = null;
    	
    	this.noticeDialog = this.qid("noticeDialog").dialog({
        	title: '站内信息',
            width: 780,
            height: 400,
            modal: true,
            draggable: false,
            resizable: false,
            autoOpen: false,
            buttons:[
       		  {
       			  "text": "关闭",
       			  "class": "aui-button-link",
       			  "click": this.proxy(function(){
       				  this.noticeDialog.dialog("close");
       			  })
       		  }
       		],
            open: this.proxy(function () {
            	//this.dataTable.fnDraw();
            }),
            close: this.proxy(function () {
            	this.dataTable.fnDraw();
            }),
            create: this.proxy(function () {
            	this.buildForm();
            })
        });
    },
    buildForm:function(){
    	var $span = $('span.ui-dialog-title',this.qid("noticeDialog").parent());
    	$span.css("width","740px");
    	this.btn = $('<button class="btn btn-primary btn-sm pull-right" style="font-size:14px;margin-top:-5px;">创建站内信息</button>').appendTo($span);
    	this.btn2 = $('<button class="btn btn-primary btn-sm pull-right" style="font-size:14px;margin-top:-5px;margin-right: 10px;">全部已阅</button>').appendTo($span);
    	this.btn_history = $('<button class="btn btn-default pull-right" style="font-size:14px;margin-top:-5px;margin-right:10px;">消息历史记录</button>').appendTo($span);
    	this.dataTable = this.qid("datatable").dataTable({
            searching: false,
            serverSide: true,
            bProcessing: true,
            ordering: false,
            pageLength:1000,
            "sDom":"",
            "columns": [
                { "title": "主题" ,"mData":"title"},
                { "title": "发送人" ,"mData":"sender","sWidth":100},
                { "title": "时间" ,"mData":"sendTime","sWidth":100},
                { "title": "标记" ,"mData":"id","sWidth":80}
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
            		"tokenid": $.cookie("tokenid"),
            		"method": "stdcomponent.getbysearch",
            		"dataobject":"message",
            		"rule":JSON.stringify([
            		                       [{"key":"receiver","value":parseInt($.cookie("userid"))}],
            		                       [{"key":"checked","value":false}]
            		                     ]),
            		"search":"",
            		"columns":JSON.stringify([{"data":"sendTime"}]),
            		"order":JSON.stringify([{"column":0,"dir":"desc"}])
            	},true);
            }),
            "fnServerData": this.proxy(function (sSource, aoData, fnCallBack, oSettings) {
            	this._ajax(
            		$.u.config.constant.smsqueryserver,
            		true,
            		aoData,
            		this.qid("datatable"),
            		{},
            		this.proxy(function(response){
            			this._options.after(response.data.iTotalDisplayRecords);
                        fnCallBack(response.data);
            		})
            	);
            }),
            "aoColumnDefs": [
				{
				    "aTargets": 0,
				    "mRender": this.proxy(function (data, type, full) {
				    	return '<span class="msg"><img class="msg-i" src="../../../img/msg.png" /></span><span style="display: inline-block;margin-left:40px;word-break:break-all; margin-rigth:30px;">'+data+'</span>';
				    })
				},
                {
                    "aTargets": 3,
                    "mRender": function (data, type, full) {
                    	return !full.checked ? "<a href='#' class='editSee' data-id='" + full.id + "' >标记为已阅</a>" : "";
                    }
                }
            ],
            "rowCallback": this.proxy(function(row, data){
            	$(row).data({"notice": data}).css("cursor","pointer");
            })
        });
    	this.btn.on('click',this.proxy(this.on_createMessage_click));
    	this.btn2.on('click',this.proxy(this.on_read_click));
    	this.btn_history.off("click").on("click",this.proxy(this.on_historyMessage_click));
    	this.dataTable.off("click", "tbody > tr").on("click", "tbody > tr", this.proxy(this.on_row_click));
    	this.dataTable.off("click", "a.editSee").on("click", "a.editSee", this.proxy(this.on_editSee_click));
    },
    on_row_click: function(e){ 
    	this._notice = $(e.currentTarget).data("notice");
    	$.u.ajax({
			url : $.u.config.constant.smsqueryserver,
			type:"post",
            dataType: "json",
            cache: false,
            data: {
            	"method": "stdcomponent.getbyid",
                "tokenid": $.cookie("tokenid"),
                "dataobjectid" :this._notice.id,
                "dataobject" : "message"
            },
    	},this.$).done(this.proxy(function(response) {
    		if(response.success){
    			this._notice = response.data;
    			if(this.detailDialog == null){
    				this.qid("detailDialog").removeClass("hidden")
    				this.detailDialog = this.qid("detailDialog").dialog({
    					title: "信息详情",
    					width: 800,
    					modal: true,
    					resizable: false,
    					autoOpen: false,
    					draggable: false,
    					open: this.proxy(function(){
                            var $attachmentContainer = null;
    						var zIndex = $("body>.ui-dialog:last").css("z-index");
    						$("body>.ui-dialog:last").css("z-index", zIndex + 2);
    						$("body>.ui-widget-overlay:last").css("z-index", zIndex + 1);
                            if (this._notice) {
                                this.qid("text_sender").text(this._notice.senderDisplayName);
                                this.qid("text_title").text(this._notice.title);
                                this.qid("textarea_content").html(this._notice.content);
                                $attachmentContainer = $('<ul class="list-unstyled"/>').appendTo(this.qid("attachments_container"));

                                $.each(this._notice.files, this.proxy(function(idx, file){
                                    $('<li><a class="download-file" fileid="'+file.id+'" href="#">'+file.fileName+'</a></li>').appendTo($attachmentContainer);
                                }));

                                this.qid("a_link").siblings("button").remove();
                                if (this._notice.activity) {
                                	console.log(this._notice.activity);
                                    this.qid("a_link").removeClass("hidden").attr("href", this.getabsurl("../search/activity.html?activityId=" + this._notice.activity.id)).text(this._notice.activity.summary);
                                } else if (this._notice.risk) {
                                    this.qid("a_link").removeClass("hidden").attr("href", this.getabsurl("../risk/RiskDetail.html?mode=edit&riskId=" + this._notice.risk.id)).text(this._notice.risk.activitySummary);
                                } else if (this._notice.trace) {
                                    if (this._notice.trace.planType === "SPOT" || this._notice.trace.planType === "SPEC") {
                                        this.qid("a_link").removeClass("hidden").attr("href", this.getabsurl("../../audit/inspection/viewTrackList.html?id=" + this._notice.trace.id)).text(this._notice.trace.traceName);
                                    } else {
                                        this.qid("a_link").removeClass("hidden").attr("href", this.getabsurl("../../audit/tracklist/TrackList.html?id=" + this._notice.trace.id)).text(this._notice.trace.traceName);
                                    }
                                } else if (this._notice.improve) {
                                    this.qid("a_link").removeClass("hidden").attr("href", this.getabsurl("../../audit/xitong_jihua/Xitong_jihua_zhenggaifankui.html?id=" + this._notice.improve.id)).text(this._notice.improve.improveName);
                                } else if (this._notice.improveTransmitCommit) {
                                    this.qid("a_link").removeClass("hidden").attr("href", this.getabsurl("../../audit/xitong_jihua/Xitong_jihua_zhenggaifankui.html?id=" + this._notice.improveTransmitCommit.id + "&isTransmitted=false")).text(this._notice.improveTransmitCommit.improveName);
                                } else if (this._notice.improveNoticeTrace) {
                                    this.qid("a_link").removeClass("hidden").attr("href", this.getabsurl("../../audit/notice/RectificationFormDistribution.html?id=" + this._notice.improveNoticeTrace.id)).text(this._notice.improveNoticeTrace.improveNotice);
                                } else if (this._notice.improveNotice) {
                                    this.qid("a_link").removeClass("hidden").attr("href", this.getabsurl("../../audit/notice/RectificationFormSubmit.html?id=" + this._notice.improveNotice.id)).text(this._notice.improveNotice.improveNotice);
                                } else if (this._notice.subImproveNotice) {
                                    this.qid("a_link").removeClass("hidden").attr("href", this.getabsurl("../../audit/notice/RectificationFormSubmit.html?id=" + this._notice.subImproveNotice.id)).text(this._notice.subImproveNotice.subImproveNotice);
                                } else if (this._notice.riskValidate) {
                                    this.qid("a_link").removeClass("hidden").attr("href", this.getabsurl("../../audit/validate/RiskValidate.html?cmd=yanzheng")).text(this._notice.riskValidate.riskValidate);
                                } else if (this._notice.erjijiean) {
                                    this.qid("a_link").removeClass("hidden").attr("href", "#").addClass("erjijiean").text(this._notice.erjijiean.improveName).data("data", this._notice.erjijiean);
                                } else if (this._notice.improveNoticeAuditWaiting) {
                                    this.qid("a_link").removeClass("hidden").attr("href", this.getabsurl("../../audit/notice/RectificationFormNew.html?id=" + this._notice.improveNoticeAuditWaiting.id + "&improveNoticetype=AuditWaiting")).text(this._notice.improveNoticeAuditWaiting.improveNotice);
                                } else if (this._notice.improveNoticeAuditRejected) {
                                    this.qid("a_link").removeClass("hidden").attr("href", this.getabsurl("../../audit/notice/RectificationFormNew.html?id=" + this._notice.improveNoticeAuditRejected.id + "&improveNoticetype=AuditRejected")).text(this._notice.improveNoticeAuditRejected.improveNotice);
                                } else if (this._notice.isarp) {
                                    this.qid("a_link").removeClass("hidden").attr("href", this.getabsurl("../../eiosa/audit/auditEdit.html?id=" + this._notice.isarp.id + "&sectionId=" + this._notice.isarp.sectionId + "$reportId=" + $.cookie("workReportId"))).text(this._notice.isarp.summary);
                                } else if (this._notice.eiosa_audit) {
                                    this.qid("a_link").removeClass("hidden").attr("href", this.getbsurl("../../eiosa/main.html?id=" + this._notice.eiosa_audit.id + "&isarp")).text(this._notice.eiosa_audit.summary);
                                } else if (this._notice.subImproveNoticeClose) {
                                    if (this._notice.subImproveNoticeClose.action.length) {
                                        this.qid("a_link").removeClass("hidden").attr("href", this.getabsurl("../../audit/notice/RectificationFormSubmit.html?id=" + this._notice.subImproveNoticeClose.id + "&operate=completion")).text(this._notice.subImproveNoticeClose.subImproveNotice);
                                        this.qid("a_link").siblings().remove();
                                        //完成
                                        $.each(this._notice.subImproveNoticeClose.action, this.proxy(function(idx, item) {
                                            this.qid("a_link").after("<button class='btn btn-default subImproveNoticeClose' wipId='" + item.wipId + "' data-id='" + this._notice.subImproveNoticeClose.id + "' style='margin-left:30px;'>" + item.name + "</button>")
                                        }))
                                    } else {
                                        this.qid("a_link").removeClass("hidden").attr("href", this.getabsurl("../../audit/notice/RectificationNoticeList.html")).text(this._notice.subImproveNoticeClose.subImproveNotice);
                                    }
                                } else {
                                    this.qid("a_link").addClass("hidden");
                                }

                                $("button.subImproveNoticeClose").off("click").on("click", this.proxy(this.on_click_subImproveNoticeClose))


                                //系统性审计结案
                                $("a.erjijiean").off("click").on("click", this.proxy(function(e) {
                                    var clz = null
                                    if (!clz) {
                                        clz = $.u.load("com.audit.innerAudit.comm_file.confirm");
                                    }
                                    this.confirmTop = new clz({
                                        "body": "<p class='lead' style='text-indent: 2em;'>恭喜您," + this._notice.erjijiean.improveName + "已经全部完成！谢谢您为本次审计工作所做的努力！</p>",
                                        "buttons": {
                                            "ok": {
                                                "click": this.proxy(this.on_click_end)
                                            }
                                        }
                                    });
                                    $("button.aui-button-link").addClass("hidden");
                                }))
                            }
    					}),
                        create: this.proxy(function(){
                            this.qid("attachments_container").on('click', '.download-file', this.proxy(function(e) {
                                var data = parseInt($(e.currentTarget).attr("fileid"));
                                window.open($.u.config.constant.smsqueryserver + "?method=downloadFiles&tokenid=" + $.cookie("tokenid") + "&ids=" + JSON.stringify([data]));
                            }))
                        }),
    					close: this.proxy(function(){
    						this.qid("text_sender").text("");
    						this.qid("text_title").text("");
    						this.qid("textarea_content").text("");
                            this.qid("attachments_container").empty();
    						this.qid("a_link").attr("href", "#");
    						this.qid("a_link").siblings("span").remove();
    					}),
                        buttons: [{
                            text: "关闭",
                            "class": "aui-button-link",
                            click: this.proxy(function() {
                                this.detailDialog.dialog("close");
                            })
                        }]
    				});
    			}
    			if(this._notice){
    				this.detailDialog.dialog("open");
    			}
    		}
    	}))
    },
    
    isJieAn:function(){
    	$.u.ajax({   //actinos按钮操作
			url : $.u.config.constant.smsmodifyserver,
			type:"post",
            dataType: "json",
            cache: false,
            data: {
            	"method": "stdcomponent.update",
                "tokenid": $.cookie("tokenid"),
                "dataobjectid" :this._notice.id,
                "dataobject" : "message",
                "obj":JSON.stringify({checked:true})
            },
    	},this.detailDialog.parent()).done(this.proxy(function(response) {
    		if(response.success){
    			this.noticeDialog.dialog("close");
    		}
    	}))
    },
    //结案
    on_click_end:function(e){
			e.preventDefault();
			var data=$(e.currentTarget).data("data");
			$.u.ajax({   
				url : $.u.config.constant.smsmodifyserver,
				type:"post",
	            dataType: "json",
	            cache: false,
	            data: {
	            	"method": "operate",
	                "tokenid": $.cookie("tokenid"),
	                "action" :this._notice.erjijiean.action[0].wipId,
	                "dataobject" : "improve",
	                "id" : parseInt(this._notice.erjijiean.id),
	            },
	    	},this.detailDialog.parent()).done(this.proxy(function(response) {
	    		if(response.success){
	    			this.confirmTop.confirmDialog.dialog("close");
	    			this.detailDialog.dialog("close");
	    			this.isJieAn();
	    		}else{
        			$.u.alert.error(response.reason);
        		}
	    		 
	    	}))
    },
    //整改通知单结案
    on_click_subImproveNoticeClose:function(e){
    	e.preventDefault();
    	var wipId = $(e.currentTarget).attr("wipid");
    	var dataid=$(e.currentTarget).attr("data-id");
		var clz = $.u.load("com.audit.innerAudit.comm_file.confirm");
		var confirm = new clz({
            "body": "确认操作？",
            "buttons": {
                "ok": {
                    "click": this.proxy(function(){
                    	$.u.ajax({   
            				url : $.u.config.constant.smsmodifyserver,
            				type:"post",
            	            dataType: "json",
            	            cache: false,
            	            data: {
            	            	"method": "operate",
            	                "tokenid": $.cookie("tokenid"),
            	                "action" :wipId,
            	                "dataobject" : "subImproveNotice",
            	                "id" : dataid,
            	            },
            	    	},confirm.confirmDialog.parent()).done(this.proxy(function(response) {
            				if(response.success){
            					$.u.alert.info("结案成功！",3000);
                				this.qid("a_link").siblings("button").remove();
                				this.isJieAn();
            				}else{
                    			$.u.alert.error(response.reason);
                    		}
            				confirm.confirmDialog.dialog("close");
            				this.detailDialog.dialog("close");
            	    	}))
                    	})
                }
            }
		})
    },
    on_createMessage_click: function(e){
    	if(this.createDialog == null){
    		var cls = $.u.load("com.sms.notice.create");
    		this.createDialog = new cls($("div[umid=createDialog]", this.$));
    		this.createDialog.override({
    			refresh: this.proxy(function(){
    				this.dataTable.fnDraw();
    			})
    		});
    	}
    	this.createDialog.open();
    },
    on_read_click: function(e){
    	var clz = $.u.load("com.sms.common.confirm");
        var confirm = new clz({
            "buttons": {
                "ok": {
                    "click": this.proxy(function(){
                    	var $a = this.dataTable.find('a.editSee');
                    	var objs = [];
                    	$a.each(function(k, v){
                    		objs.push({
                    			id: parseInt($(v).attr("data-id")),
                    			checked: true
                    		})
                    	});
                    	this._ajax(
                			$.u.config.constant.smsmodifyserver,
                			true,
                			{
                				"method": "stdcomponent.updateall",
                				"dataobject": "message",
                				"tokenid": $.cookie("tokenid"),
                				"objs": JSON.stringify(objs)
                			},
                			this.dataTable,
                			{},
                			this.proxy(function(response){
                				confirm.confirmDialog.dialog("close");
                				this.dataTable.fnDraw();
                			})
                		);
                    })
                }
            }
        });
    },
    on_historyMessage_click : function(){
    	window.open("/sms/uui/com/sms/notice/historyMessage.html");
    },
    on_editSee_click: function(e){
    	e.preventDefault();
    	e.stopPropagation();
    	try{
    		var id = parseInt($(e.currentTarget).attr("data-id"));
    		this._ajax(
    			$.u.config.constant.smsmodifyserver,
    			true,
    			{
    				"method": "modifyMessage",
            		"paramType": "checkMessage",
            		"messageId": id
    			},
    			this.dataTable,
    			{},
    			this.proxy(function(response){
    				this.dataTable.fnDraw();
                	this._options.after();
    			})
    		);
    	}catch(e){
    		throw new Error("操作失败:"+e.message);
    	}
    },
    open:function(param){
    	this.noticeDialog.dialog("open");
    },
    /**
     * @title ajax
     * @param url {string} ajax url
     * @param async {bool} async
     * @param param {object} ajax param
     * @param $container {jQuery object} block
     * @param blockParam {object} block param
     * @param callback {function} callback
     */
    _ajax:function(url,async,param,$container,blockParam,callback){
    	$.u.ajax({
			"url": url,
			"datatype": "json",
			"async": async || true,
			"type": "post",
			"data": $.isArray(param) ? param : $.extend({
				"tokenid": $.cookie("tokenid")
			},param)
		},$container || this.$,$.extend({ size:2, backgroundColor:"#fff" },blockParam||{})).done(this.proxy(function(response){
			if(response.success){
				callback(response);
			}
        })).fail(this.proxy(function (jqXHR, errorText, errorThrown) {
       
		}));
    },
    destroy: function () {
    	this.dataTable.fnDestroy();
    	this.detailDialog && this.detailDialog.dialog("destroy").remove();
    	this.noticeDailog.dialog("destroy").remove();
        return this._super();
    }
}, { usehtm: true, usei18n: false });


com.sms.notice.notice.widgetjs = ['../../../uui/widget/jqdatatable/js/jquery.dataTables.js', 
                                  '../../../uui/widget/jqdatatable/js/dataTables.bootstrap.js',
                                  '../../../uui/widget/jqztree/js/jquery.ztree.all-3.5.js',
                                  "../../../uui/widget/spin/spin.js",
                                  "../../../uui/widget/jqblockui/jquery.blockUI.js",
                                  "../../../uui/widget/ajax/layoutajax.js"];
com.sms.notice.notice.widgetcss = [{ path: '../../../uui/widget/jqdatatable/css/jquery.dataTables.css' },
                                   { path: '../../../uui/widget/jqdatatable/css/dataTables.bootstrap.css' },
                                   {id:"ztreestyle",path:"../../../uui/widget/jqztree/css/zTreeStyle/zTreeStyle.css"}];