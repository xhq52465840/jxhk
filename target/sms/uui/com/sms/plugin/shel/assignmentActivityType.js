//@ sourceURL=com.sms.plugin.shel.assignmentActivityType
$.u.define('com.sms.plugin.shel.assignmentActivityType', null, {
    init: function(options) {
        this._options = options;
        this._SELECT2_PAGE_LENGTH = 10;
    },
    afterrender: function(bodystr) {
        this.i18n = com.sms.plugin.shel.assignmentActivityType.i18n;

        this.dataTable = this.qid("datatable").dataTable({
            searching: false,
            serverSide: true,
            bProcessing: true,
            ordering: false,
            paging: false,
            dom: "tip",
            "columns": [{
                "title": this.i18n.columns.sourceType,
                "mData": "sourceType"
            }, {
                "title": this.i18n.columns.distributeType,
                "mData": "distributeType"
            }, {
                "title": this.i18n.columns.unitType,
                "mData": "unitType"
            },{
                "title": this.i18n.columns.taskRole,
                "mData": "roles"
            }, {
                "title": this.i18n.columns.handle,
                "mData": "id",
                "sWidth": 150
            }],
            "oLanguage": { //语言
                "sSearch": this.i18n.dataTable.search,
                "sLengthMenu": this.i18n.dataTable.everPage + "_MENU_" + this.i18n.dataTable.record,
                "sZeroRecords": this.i18n.dataTable.message,
                "sInfo": this.i18n.dataTable.from + " _START_ " + this.i18n.dataTable.to + " _END_ /" + this.i18n.dataTable.all + "_TOTAL_ " + this.i18n.dataTable.allData,
                "sInfoEmpty": this.i18n.dataTable.withoutData,
                "sInfoFiltered": "(" + this.i18n.dataTable.fromAll + "_MAX_" + this.i18n.dataTable.filterRecord + ")",
                "sProcessing": "" + this.i18n.dataTable.searching + "...",
                "oPaginate": {
                    "sFirst": "<<",
                    "sPrevious": "" + this.i18n.dataTable.back + "",
                    "sNext": "" + this.i18n.dataTable.next + "",
                    "sLast": ">>"
                }
            },
            "fnServerParams": this.proxy(function(aoData) {
                $.extend(aoData, {
                    "tokenid": $.cookie("tokenid"),
                    "method": "stdcomponent.getbysearch",
                    "dataobject": "activityDistributeConfig",
                    "columns": JSON.stringify(aoData.columns),
                    "search": JSON.stringify(aoData.search),
                    "rule": JSON.stringify([
                        [{
                            "key": "sourceType.name",
                            "op": "like",
                            "value": this.qid("sourceType").val()
                        }],
                        [{
                            "key": "distributeType.name",
                            "op": "like",
                            "value": this.qid("distributeType").val()
                        }]
                    ])
                }, true);
            }),
            "fnServerData": this.proxy(function(sSource, aoData, fnCallBack, oSettings) {
                $.ajax({
                    url: $.u.config.constant.smsqueryserver,
                    dataType: "json",
                    type: "post",
                    cache: false,
                    data: aoData
                }).done(this.proxy(function(data) {
                    if (data.success) {
                        fnCallBack(data.data);
                    }
                })).fail(this.proxy(function(jqXHR, errorText, errorThrown) {

                })).complete(this.proxy(function() {}));
            }),
            "aoColumnDefs": [{
                "aTargets": 2,
                "mRender": this.proxy(function(data, type, full) {
                    return (data==='UT')? "机构" : "组织";
                })
            },{
            	"aTargets": 3,
            	"mRender": this.proxy(function(data, type, full) {
            		var html = "";
            		data.length && $.each(data,this.proxy(function(index,item){
            			html +=item.name;
            		}))
            		return html;
            	})
            
            },{
                "aTargets": 4,
                "mRender": this.proxy(function(data, type, full) {
                    return "<button class='btn btn-link delete' data='" + JSON.stringify(full) + "'>" + this.i18n.buttons.remove + "</button>";
                })
            }]
        });

        this.qid("btn_addActivityType").click(this.proxy(this.on_addActivityType_click));
        this.qid("btn_filter").click(this.proxy(this.on_filter_click));
        this.qid("btn_resetfilter").click(this.proxy(this.on_reset_click));
        this.dataTable.off("click", "button.delete").on("click", "button.delete", this.proxy(this.on_removeActivityType_click));

    },
    /**
     * @title 搜索
     * @return void
     */
    on_filter_click: function(e) {
        this.dataTable.fnDraw(false);
    },
    /**
     * @title 重置
     * @return void
     */
    on_reset_click: function(e) {
        this.qid("sourceType").val("");
        this.qid("distributeType").val("");
        this.dataTable.fnDraw(false);
    },
    /**
     * @title 添加任务分配配置
     * @param e {object} 鼠标对象
     * @return void
     */
    on_addActivityType_click: function(e) {
        if (this.activityTypeDialog == null) {
            this._initActivityTypeDialog();
        }
        this.activityTypeDialog.open();
    },
    /**
     * @title 删除任务分配配置
     * @param e {object} 鼠标对象
     * @return void 
     */
    on_removeActivityType_click: function(e) {
        var data = JSON.parse($(e.currentTarget).attr("data"));
        $.u.load("com.sms.common.stdcomponentdelete");
        (new com.sms.common.stdcomponentdelete({
            body: "<div>" +
                "<p>" + this.i18n.removeDialog.choose + "</p>" +
                "<p><span class='text-danger'>" + this.i18n.removeDialog.notice + "</span></p>" +
                "</div>",
            title: this.i18n.removeDialog.removeActivityType + "：" + data.sourceType + '=>' + data.distributeType,
            dataobject: "activityDistributeConfig",
            dataobjectids: JSON.stringify([parseInt(data.id)])
        })).override({
            refreshDataTable: this.proxy(function() {
                this.dataTable.fnDraw();
            })
        });
    },
    /**
     * @title 初始化模态层
     * @return void
     */
    _initActivityTypeDialog: function() {
        $.u.load("com.sms.common.stdComponentOperate");
        this.activityTypeDialog = new com.sms.common.stdComponentOperate($("div[umid='activityTypeDialog']", this.$), {
            "title": com.sms.plugin.shel.assignmentActivityType.i18n.buttons.addActivityType,
            "dataobject": "activityDistributeConfig",
            "fields": [{
                name: "sourceType",
                label: this.i18n.columns.sourceType,
                dataType: "int",
                type: "select",
                rule: {
                    required: true
                },
                message: this.i18n.messages.sourceTypeNotNull,
                option: {
                    params: {
                        "dataobject": "activityType"
                    },
                    ajax: {
                        data: this.proxy(function(term, page) {
                            return {
                                "tokenid": $.cookie("tokenid"),
                                "method": "stdcomponent.getbysearch",
                                "rule": JSON.stringify([
                                    [{
                                        "key": "name",
                                        "op": "like",
                                        "value": term
                                    }]
                                ]),
                                "start": (page - 1) * this._SELECT2_PAGE_LENGTH,
                                "length": this._SELECT2_PAGE_LENGTH,
                                "dataobject": "activityType"
                            };
                        }),
                        success: this.proxy(function(response, page) {
                            return {
                                "results": response.data.aaData,
                                "more": response.data.iTotaoRecords > (page * this._SELECT2_PAGE_LENGTH)
                            };
                        })
                    }
                }
            },{
                name: "unitType",
                label: this.i18n.columns.unitType,
                dataType: "string",
                type: "enum",
                rule: {
                    required: true
                },
                message: this.i18n.messages.unitTypeNotNull,
                enums:[{name:'机构',value:'UT'},{name:'组织',value:'DP'}]
                
            }, {
                name: "distributeType",
                label: this.i18n.columns.distributeType,
                dataType: "int",
                type: "select",
                rule: {
                    required: true
                },
                message: this.i18n.messages.distributeTypeNotNull,
                option: {
                    params: {
                        "dataobject": "activityType"
                    },
                    ajax: {
                        data: this.proxy(function(term, page) {
                            return {
                                "tokenid": $.cookie("tokenid"),
                                "method": "stdcomponent.getbysearch",
                                "rule": JSON.stringify([
                                    [{
                                        "key": "name",
                                        "op": "like",
                                        "value": term
                                    }]
                                ]),
                                "start": (page - 1) * this._SELECT2_PAGE_LENGTH,
                                "length": this._SELECT2_PAGE_LENGTH,
                                "dataobject": "activityType"
                            };
                        }),
                        success: this.proxy(function(response, page) {
                            return {
                                "results": response.data.aaData,
                                "more": response.data.iTotaoRecords > (page * this._SELECT2_PAGE_LENGTH)
                            };
                        })
                    }
                }
            },
            {
              /**
               * @int 增加用户角色
               */
                name: "roles",
                label: "分配角色",
                dataType: "array",
                type: "select",
                rule: {
                    required: true
                },
                message: this.i18n.messages.rolesNotNull,
                option: {
                    params: {
                        "dataobject": "role"
                    },
                    ajax: {
                        data: this.proxy(function(term, page) {
                            return {
                                "tokenid": $.cookie("tokenid"),
                                "method": "stdcomponent.getbysearch",
                                "rule": JSON.stringify([
                                    [{
                                        "key": "name",
                                        "op": "like",
                                        "value": term
                                    }]
                                ]),
                                "start": (page - 1) * this._SELECT2_PAGE_LENGTH,
                                "length": this._SELECT2_PAGE_LENGTH,
                                "dataobject": "role"
                            };
                        }),
                        success: this.proxy(function(response, page) {
                            return {
                                "results": response.data.aaData,
                                "more": response.data.iTotaoRecords > (page * this._SELECT2_PAGE_LENGTH)
                            };
                        })
                    }
                }
            
            }
            ]
        });
        this.activityTypeDialog.override({
            refreshDataTable: this.proxy(function() {
                this.dataTable.fnDraw();
            })
        });
    },
    destroy: function() {
        this._super();
    }
}, {
    usehtm: true,
    usei18n: true
});


com.sms.plugin.shel.assignmentActivityType.widgetjs = ['../../../../uui/widget/jqdatatable/js/jquery.dataTables.js', '../../../../uui/widget/jqdatatable/js/dataTables.bootstrap.js'];
com.sms.plugin.shel.assignmentActivityType.widgetcss = [{
    path: '../../../../uui/widget/jqdatatable/css/jquery.dataTables.css'
}, {
    path: '../../../../uui/widget/jqdatatable/css/dataTables.bootstrap.css'
}];