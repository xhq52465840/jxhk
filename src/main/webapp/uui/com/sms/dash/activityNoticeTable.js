//@ sourceURL=com.sms.dash.activityNoticeTable
$.u.define('com.sms.dash.activityNoticeTable', null, {
    init: function(mode, gadgetsinstanceid) {
        this._initmode = mode;
        this._gadgetsinstanceid = gadgetsinstanceid;
        this._gadgetsinstance = null;

    },
    afterrender: function(bodystr) {
        this._initDataTable();
    },
    _initDataTable: function() {
        this.dataTable = this.qid("datatable").dataTable({
            searching: false,
            serverSide: true,
            bProcessing: true,
            ordering: false,
            pageLength: 10,
            "sDom": "rt<ip>",
            "columns": [{
                "title": "主题",
                "mData": "title",
                "width": "30%"
            }, {
                "title": "发送人",
                "sClass": "nowrap",
                "mData": "senderDisplayName",
                "width": "23%"
            }, {
                "title": "时间",
                "sClass": "nowrap",
                "mData": "sendTime",
                "width": "17%"
            }, {
                "title": "安全信息",
                "sClass": "nowrap",
                "mData": "activity",
                "width": "30%"
            }, {
                "title": "标记",
                "sClass": "nowrap",
                "mData": "id",
                "sWidth": 80
            }],
            "oLanguage": { //语言
                "sSearch": "搜索:",
                "sLengthMenu": "每页显示 _MENU_ 条记录",
                "sZeroRecords": "抱歉未找到记录",
                "sInfo": "从 _START_ 到 _END_ /共 _TOTAL_ 条数据",
                "sInfoEmpty": "",
                "sInfoFiltered": "(从总共_MAX_条记录中过滤)",
                "sProcessing": "检索中...",
                "oPaginate": {
                    "sFirst": "",
                    "sPrevious": "<span class='fa fa-caret-left fa-lg'></span>",
                    "sNext": "<span class='fa fa-caret-right fa-lg'></span>",
                    "sLast": ""
                }
            },
            "fnServerParams": this.proxy(function(aoData) {
                $.extend(aoData, {
                    "tokenid": $.cookie("tokenid"),
                    "method": "getMessages",
                    "paramType": "getUncheckedMessagesByReceiver",
                    "sourceType": "ACTIVITY"
                }, true);
            }),
            "fnServerData": this.proxy(function(sSource, aoData, fnCallBack, oSettings) {
                this._ajax(
                    $.u.config.constant.smsqueryserver,
                    true,
                    aoData,
                    this.qid("datatable"), {
                        size: 2,
                        backgroundColor: "#fff"
                    },
                    this.proxy(function(response) {
                        fnCallBack(response.data);
                        if (window.parent) {
                            window.parent.resizeGadget(this._gadgetsinstanceid, ($("body").outerHeight(true)) + "px");
                        }
                    })
                );
            }),
            "aoColumnDefs": [{
                "aTargets": 0,
                "mRender": this.proxy(function(data, type, full) {
                    //				    	return '<span class="msg" style="position: absolute;left: 30px;margin: 0px;padding: 0px;width: 22px;height: 22px;overflow: hidden;"><img class="msg-i" style="left: -14px;top: -40px;position: absolute;" src="../../../img/msg.png" /></span><span style="position: absolute;left: 54px;">'+data+'</span>';
                    return '<div title="' + data + '" style="padding-left:22px;position:relative;overflow:hidden;white-space:nowrap;text-overflow:ellipsis;min-width:130px;"><span style="position: absolute;left:0px;top:-2px;margin: 0px;padding: 0px;width: 22px;height: 22px;overflow: hidden;"><img class="msg-i" style="left: -14px;top: -40px;position: absolute;" src="../../../img/msg.png" /></span><span>' + data + '</span></div>';
                })
            }, {
                "aTargets": 3,
                "mRender": this.proxy(function(data, type, full) {
                    var results = "";
                    if (data) {
                        results = '<a href="' + this.getabsurl("../search/activity.html?activityId=" + data.id) + '" target="_top">' + (data && data.summary) + '</a>';
                    }
                    return results;
                })
            }, {
                "aTargets": 4,
                "mRender": function(data, type, full) {
                    return !full.checked ? "<a href='#' class='editSee' data-id='" + full.id + "' >标记为已阅</a>" : "";
                }
            }],
            "rowCallback": this.proxy(function(row, data) {
                $(row).data({
                    "notice": data
                }).css("cursor", "pointer");
            }),
            "drawCallback": this.proxy(function(row, data) {
                window.top && window.top.goHash(this._gadgetsinstanceid);
            })
        });
        this.dataTable.off("click", "tbody > tr").on("click", "tbody > tr", this.proxy(this.on_row_click));
        this.dataTable.off("click", "a.editSee").on("click", "a.editSee", this.proxy(this.on_editSee_click));
    },
    on_row_click: function(e) {
        var $tr = $(e.currentTarget);
        if ($tr.children("td").length === 1) return;
        if ($(e.target).is("a")) return;
        this._notice = $tr.data("notice");
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
    	}));
    },
    on_editSee_click: function(e) {
        e.preventDefault();
        e.stopPropagation();
        try {
            var id = parseInt($(e.currentTarget).attr("data-id"));
            this._ajax(
                $.u.config.constant.smsmodifyserver,
                true, {
                    "method": "modifyMessage",
                    "paramType": "checkMessage",
                    "messageId": id
                },
                this.dataTable, {},
                this.proxy(function(response) {
                    this.dataTable.fnDraw();
                })
            );
        } catch (e) {
            throw new Error("操作失败:" + e.message);
        }
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
    _ajax: function(url, async, param, $container, blockParam, callback) {
        $.u.ajax({
            "url": url,
            "datatype": "json",
            "async": async,
            "type": "post",
            "data": $.isArray(param) ? param : $.extend({
                "tokenid": $.cookie("tokenid")
            }, param)
        }, $container || this.$, $.extend({}, blockParam || {
            size: 2,
            backgroundColor: "#fff"
        })).done(this.proxy(function(response) {
            if (response.success) {
                callback(response);
            }
        })).fail(this.proxy(function(jqXHR, errorText, errorThrown) {

        }));
    },
    /**
     * @title 控制行动项看板的iframe高度
     */
    _resizeGadget: function(showDialog) {
        if (window.parent) {
            if (this.qid("detailDialog").parent().is(":visible")) {
                window.parent.resizeGadget && window.parent.resizeGadget(this._gadgetsinstanceid, (this.qid("detailDialog").parent().outerHeight(true)) + 1 + "px");
            } else {
                window.parent.resizeGadget && window.parent.resizeGadget(this._gadgetsinstanceid, ($("body").outerHeight(true)) + 1 + "px");
            }

        }
    },
    destroy: function() {
        return this._super();
    }
}, {
    usehtm: true,
    usei18n: true
});


com.sms.dash.activityNoticeTable.widgetjs = ['../../../uui/widget/select2/js/select2.min.js',
    '../../../uui/widget/jqdatatable/js/jquery.dataTables.js',
    "../../../uui/widget/spin/spin.js",
    "../../../uui/widget/jqblockui/jquery.blockUI.js",
    "../../../uui/widget/ajax/layoutajax.js"
];
com.sms.dash.activityNoticeTable.widgetcss = [{
    id: "",
    path: "../../../uui/widget/select2/css/select2.css"
}, {
    id: "",
    path: "../../../uui/widget/select2/css/select2-bootstrap.css"
}, {
    path: '../../../uui/widget/jqdatatable/css/jquery.dataTables.css'
}, {
    path: '../../../uui/widget/jqdatatable/css/dataTables.bootstrap.css'
}];