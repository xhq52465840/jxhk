//@ sourceURL=com.sms.safePromotion.rewardPunishment
/**
 * 奖惩记录
 * @author wans
 */
$.u.define('com.sms.safePromotion.rewardPunishment', null, {
    init: function(options) {
        this._SELECT2_PAGE_LENGTH = 10;
        this._option = options || {};
    },
    afterrender: function() {
        this.i18n = com.sms.safePromotion.rewardPunishment.i18n;
        this.addRecord = this.qid("addRecord");
        this.addRecord.off("click").on("click", this.proxy(this.addReward));
        this._export = this.qid("export");
        this._export.off("click").on("click", this.proxy(this._exportExcel));
        this.rewardType = this.qid("rewardType"); //奖惩类别
        this.unit = this.qid("unit"); //所属部门
        this.userName = this.qid("userName"); //姓名
        this.startDate = this.qid("startDate"); //开始日期
        this.endDate = this.qid("endDate"); //结束日期
        this.eventStartDate = this.qid("eventStartDate"); //事件开始日期
        this.eventEndDate = this.qid("eventEndDate"); //事件结束日期
        this.eventGrade = this.qid("eventGrade");
        this.getPermission();
        this._initData();
        this.btn_filter = this.qid("btn_filter");
        this.btn_filter.off("click").on("click", this.proxy(function(ent) {
            ent.preventDefault();
            this.freshTable();
        })).trigger("click");
        this.clean_filter = this.qid("clean_filter");
        this.clean_filter.off("click").on("click", this.proxy(function(ent) {
            ent.preventDefault();
            this.cleanTab();
            this.freshTable();
        }));
            
    },
    /**
     * @title 清楚筛选
     */
    cleanTab:function(){
        this.userName.select2("data","");
        //所属单位
        this.unit.select2("data",""); 
        this.eventGrade.select2("data","");
        this.rewardType.val(""); //奖惩类别
        this.startDate.val(""); //开始日期
        this.endDate.val(""); //结束日期
        this.eventStartDate.val(""); //事发开始日期
        this.eventEndDate.val("") //事发结束日期

    
    },
    getPermission: function() {
        $.ajax({
            url: $.u.config.constant.smsqueryserver,
            type: "post",
            data: {
                tokenid: $.cookie("tokenid"),
                method: "getRewardsPermission"
            },
            dataType: "json"
        }).done(this.proxy(function(response) {
            if (response.success) {
                if(response.data.managable){
                    this.addRecord.removeClass("hidden");
                }
            }
        }));

    },
    //初始化
    _initData: function() {
        //所属部门
        this.unit.select2({
            width: '100%',
            multiple: true,
            ajax: {
                url: $.u.config.constant.smsqueryserver,
                dataType: "json",
                type: "post",
                data: this.proxy(function(term, page) {
                    return {
                        tokenid: $.cookie("tokenid"),
                        method: "getunits",
                        "unitName":term
//                        dataobject: "unit",
//                        rule: JSON.stringify([
//                            [{
//                                "key": "name",
//                                "op": "like",
//                                "value": term
//                            }]
//                        ]),
                    };
               }),
                results: this.proxy(function(response, page, query) {
                    if (response.success) {
                        return {
                            results: response.data,
                        }
                    } else {
                        $.u.alert.error(response.reason, 1000 * 3);
                    }
                })
            },
            formatResult: function(item) {
                return "<img src='" + item.avatarUrl + "' width='16' height='16' />&nbsp;" + item.name;
            },
            formatSelection: function(item) {
                return "<img src='" + item.avatarUrl + "' width='16' height='16' />&nbsp;" + item.name;
            }
        }).on("select2-selecting", this.proxy(function(){
        	this.userName.select2("data","");
    	}));
        //姓名
        this.userName.select2({
            width: '100%',
            multiple: true,
            ajax: {
                url: $.u.config.constant.smsqueryserver,
                dataType: "json",
                type: "post",
                data: this.proxy(function(term, page) {
                    var unitIds = [];
                    this.unit.select2("data") && $.each(this.unit.select2("data"), function(k, v) {
                        unitIds.push(v.id);
                    });
                    return {
                        tokenid: $.cookie("tokenid"),
                        method: "getUsersByUnitIds",
                        unitIds: JSON.stringify(unitIds || ''),
                        "term":term,
                        "start": (page - 1) * this._SELECT2_PAGE_LENGTH,
	    				"length": this._SELECT2_PAGE_LENGTH
                    };
                }),
                results: this.proxy(function(response, page, query) {
                    if (response.success) {
                        return {
                            results: response.data.aaData,
                            more: response.data.iTotalRecords > (page * this._SELECT2_PAGE_LENGTH)
                        }
                    } else {
                        $.u.alert.error(response.reason, 1000 * 3);
                    }
                })
            },
            formatResult: function(item) {
                return "<img src='" + item.avatarUrl + "' width='16' height='16' />&nbsp;" + item.displayName;
            },
            formatSelection: function(item) {
                return "<img src='" + item.avatarUrl + "' width='16' height='16' />&nbsp;" + item.displayName;
            }
        });
        //事件等级
        this.eventGrade.select2({
            width: '100%',
            multiple: true,
            ajax: {
                url: $.u.config.constant.smsqueryserver,
                dataType: "json",
                type: "post",
                data: this.proxy(function(term, page) {
                    return {
                        tokenid: $.cookie("tokenid"),
                        method: "stdcomponent.getbysearch",
                        dataobject:"dictionary",
                        rule: JSON.stringify([[{"key":"type","value":"事件等级"}], [{key:"name",op:"like",value:term}]]),
                        "start": (page - 1) * this._SELECT2_PAGE_LENGTH,
	    				"length": this._SELECT2_PAGE_LENGTH
                    };
                }),
                results: this.proxy(function(response, page, query) {
                    if (response.success) {
                        return {
                            results: response.data.aaData,
                            more: response.data.iTotalRecords > (page * this._SELECT2_PAGE_LENGTH)
                        }
                    } else {
                        $.u.alert.error(response.reason, 1000 * 3);
                    }
                })
            },
            formatResult: function(item) {
                return  item.name;
            },
            formatSelection: function(item) {
                return  item.name;
            }
        });
        //日期
        this.startDate.add(this.endDate).add(this.eventEndDate).add(this.eventStartDate).datepicker({
            "dateFormat": "yy-mm-dd"
        });
    },
    getData: function() {
        //姓名
        var nameValue = [];
        this.userName.select2("data") && $.each(this.userName.select2("data"), function(k, v) {
            nameValue.push(v.id);
        });
        //所属单位
        var unitValue = [];
        this.unit.select2("data") && $.each(this.unit.select2("data"), function(k, v) {
            unitValue.push(v.id);
        });
        var eventLevelValue = [];
        this.eventGrade.select2("data") && $.each(this.eventGrade.select2("data"), function(k, v) {
        	eventLevelValue.push(v.id);
        });
        return obj = {
            "rewardType": this.rewardType.val(), //奖惩类别
            "eventLevel":eventLevelValue,/*事件等级*/
            "unit": unitValue, //所属单位 
            "userName": nameValue, //姓名
            "startDate": this.startDate.val(), //开始日期
            "endDate": this.endDate.val(), //结束日期
            "eventStartDate": this.eventStartDate.val(), //事发开始日期
            "eventEndDate": this.eventEndDate.val() //事发结束日期
        }
    },
    addReward: function(e) {
        var $this = $(e.currentTarget);
        var mode = $this.attr('mode') || '';
        if (!this.rewardDialog) {
            var clz = $.u.load("com.sms.safePromotion.rewardDialog");
            this.rewardDialog = new clz(this.$.find("div[umid=rewardDialog]"), {
                mode: mode
            });
        }
        this.rewardDialog.override({
            "fresh": this.proxy(function(actionItem) {
                $.u.ajax({
                    url: $.u.config.constant.smsmodifyserver,
                    type: "post",
                    data: {
                        tokenid: $.cookie("tokenid"),
                        method: "stdcomponent.add",
                        dataobject: 'rewards',
                        obj: JSON.stringify(actionItem)
                    },
                    dataType: "json"
                }, this.rewardDialog.rewardDialog.parent()).done(this.proxy(function(response) {
                    if (response.success) {
                        this.freshTable();
                        this.rewardDialog.rewardDialog.dialog("close");

                    }
                }));
            })
        });
        this.rewardDialog.open(mode);
    },
    freshTable: function() {
        this._rewardTable();
    },
    _rewardTable: function(e) {
        if ($.fn.DataTable.isDataTable(this.qid("rewardTable"))) {
            this.qid("rewardTable").dataTable().api().destroy();
            this.qid("rewardTable").empty();
        }
        this.rewardTable = this.qid("rewardTable").DataTable({
                "dom": 'tip',
                "loadingRecords": "加载中...",
                "info": true,
                "pageLength": this.i18n.pageLength,
                "sPaginationType": "full_numbers",
                "autoWidth": true,
                "ordering": false,
                "oLanguage": {
                    "sLengthMenu": "每页 _MENU_ 条记录",
                    "sZeroRecords": "没有找到记录",
                    "sInfo": this.i18n.from + " _START_ " + this.i18n.to + " _END_ /" + this.i18n.all + " _TOTAL_ " + this.i18n.allData,
                    "sInfoEmpty": "",
                    "sInfoFiltered": "(" + this.i18n.fromAll + "_MAX_" + this.i18n.filterRecord + ")",
                    "oPaginate": {
                        "sFirst": this.i18n.oPaginate.sFirst,
                        "sPrevious": this.i18n.oPaginate.sPrevious,
                        "sNext": this.i18n.oPaginate.sNext,
                        "sLast": this.i18n.oPaginate.sLast
                    }
                },
                "columns": [{
                    "title": this.i18n.columns.userName,
                    "mData": "rewardTarget",
                    "sWidth": "10%",
                    "class": "left"
                }, {
                    "title": this.i18n.columns.rewardType,
                    "mData": "rewardType",
                    "sWidth": "7%"
                }, {
                    "title": this.i18n.columns.eventLevel,
                    "mData": "eventLevel",
                    "sWidth": "7%"
                }, {
                    "title": this.i18n.columns.unit,
                    "mData": "rewardUnit",
                    "sWidth": "9%"
                }, {
                    "title": this.i18n.columns.rewardReason,
                    "mData": "rewardReason",
                    "sWidth": "16%"
                }, {
                    "title": this.i18n.columns.rewardContent,
                    "mData": "rewardContent",
                    "sWidth": "10%"
                }, {
                    "title": this.i18n.columns.rewardAmmount,
                    "mData": "rewardAmount",
                    "sWidth": "10%"
                }, {
                    "title": this.i18n.columns.rewardRemark,
                    "mData": "remark",
                    "sWidth": "14%"
                }, {
                    "title": this.i18n.columns.occurDate,
                    "mData": "occurDate",
                    "sWidth": "7%"
                }, {
                    "title": this.i18n.columns.updateDate,
                    "mData": "lastUpdate",
                    "sWidth": "8%"
                }, {
                    "title": this.i18n.columns.handle,
                    "class": "center",
                    "mData": "id",
                    "sWidth": "10%"
                }],
                "aoColumnDefs": [{
                    "aTargets": 0,
                    "mRender": function(data, type, full) {
                        return full.rewardTarget || '';
                    }
                }, {
                    "aTargets": 1,
                    "mRender": function(data, type, full) {
                        return full.rewardType.name || '';
                    }
                }, {
                    "aTargets": 4,
                    "mRender": function(data, type, full) {
                        return "<div style='overflow: hidden; white-space: nowrap;text-overflow: ellipsis;' data-toggle='popover' data-trigger='hover'  data-placement='right' data-content='"+(data ||"")+"'>"+(data ||"")+"</div>"
                    }
                }, {
                    "aTargets": 5,
                    "mRender": function(data, type, full) {
                        return "<div style='overflow: hidden; white-space: nowrap;text-overflow: ellipsis;' data-toggle='popover' data-trigger='hover'  data-placement='right' data-content='"+(data ||"")+"'>"+(data ||"")+"</div>"
                    }
                }, {
                    "aTargets": 6,
                    "mRender": function(data, type, full) {
                        return "<div style='overflow: hidden; white-space: nowrap;text-overflow: ellipsis;' data-toggle='popover' data-trigger='hover'  data-placement='right' data-content='"+(data ||"")+"'>"+(data ||"")+"</div>"
                    }
                }, {
                    "aTargets": 7,
                    "mRender": function(data, type, full) {
                    	return "<div style='overflow: hidden; white-space: nowrap;text-overflow: ellipsis;' data-toggle='popover' data-trigger='hover'  data-placement='right' data-content='"+(data ||"")+"'>"+(data ||"")+"</div>"
                    }
                }, {
                    "aTargets": 8,
                    "mRender": function(data, type, full) {
                        return "<div style='overflow: hidden; white-space: nowrap;text-overflow: ellipsis;' data-toggle='popover' data-trigger='hover'  data-placement='right' data-content='"+(data ||"")+"'>"+(data ||"")+"</div>"
                    }
                }, {
                    "aTargets": 9,
                    "mRender": function(data, type, full) {
                        return full.lastUpdate.substr(0,10) || '';
                    }
                }, {
                    "aTargets": 10,
                    "mRender": this.proxy(function(data, type, full) {
                        if (full.managable) {
                            return "<button type='button' style='padding-bottom: 2px; padding-left: 2px;' class='btn btn-link edit' mode='edit' data-id=" + full.id + ">" + this.i18n.buttons.edit + "</button>" + "   " + "<button type='button' style='padding-bottom: 2px; padding-left: 2px;' class='btn btn-link delete' mode='edit' data-id=" + full.id + ">" + this.i18n.buttons.remove + "</button>";
                        } else {
                            return "";
                        }
                    })
                }],
                "ajax": this.proxy(function(data, callback, settings) {
                    var rewardObj = this.getData();
                    this._ajax($.u.config.constant.smsqueryserver, $.extend({}, data, {
                        "method": "stdcomponent.getbysearch",
                        "dataobject": "rewards",
                        "columns": JSON.stringify([{
                            "data": "t.lastUpdate"
                        }]),
                        "order": JSON.stringify([{
                            "column": 0,
                            "dir": "desc"
                        }]),
                        "rule": JSON.stringify([
                            [{
                                "key": "rewardType",
                                "value": rewardObj.rewardType
                            }],
                            [{
                                "key": "rewardUnit.id",
                                "op": "in",
                                "value": rewardObj.unit.length ? rewardObj.unit : null
                            }],
                            [{
                                "key": "eventLevel.id",
                                "op": "in",
                                "value": rewardObj.eventLevel.length ? rewardObj.eventLevel : null
                            }],
                            [{
                                "key": "rewardTarget.id",
                                "op": "in",
                                "value": rewardObj.userName.length ? rewardObj.userName : null
                            }],
                            [{
                                "key": "lastUpdate",
                                "op": ">=",
                                "value": rewardObj.startDate
                            }],
                            [{
                                "key": "lastUpdate",
                                "op": "<",
                                "value": rewardObj.endDate ? new Date(rewardObj.endDate).addDays(1).format('yyyy-MM-dd') : ''
                            }],
                            [{
                                "key": "occurDate",
                                "op": ">=",
                                "value": rewardObj.eventStartDate
                            }],
                            [{
                                "key": "occurDate",
                                "op": "<",
                                "value": rewardObj.eventEndDate ? new Date(rewardObj.eventEndDate).addDays(1).format('yyyy-MM-dd') : ''
                            }]
                        ]),
                    }), this.qid("rewardTable").parent(), {
                        size: 2,
                        backgroundColor: "#fff"
                    }, this.proxy(function(response) {
                        if (response.success) {
                        	
                            callback({
                                "recordsFiltered": response.data.iTotalDisplayRecords,
                                "data": response.data.aaData
                            });
                        }
                    }));
                }),
                "refresh": function() {

                },
                "headerCallback": this.proxy(function(thead, data, start, end, display) {}),
                "rowCallback": this.proxy(function(row, data, index) {
                    $(row).data("all_data", [ data.operator, data.improveUnit,
                                     data.auditReason, data.improveReason, data.improveMeasure, data.auditResult,
                                     data.improveLastDate]);
                    $('[data-toggle="popover"]',$(row)).popover({
                       html: 'true',
                       trigger: 'hover',
                       content: function(){
                          var  popo=data.itemPoint;
                          if(data.itemPoint.indexOf("\n检查记录")>-1){
                                var ind=data.itemPoint.indexOf("\n检查记录");
                                popo=data.itemPoint.slice(0,ind) + "<br>"+data.itemPoint.slice(ind);
                          }
                          return popo;
                        },
                    });
                })
            }),
            this.rewardTable.off("click", "button.edit").on("click", "button.edit", this.proxy(function(e) {
                var $this = $(e.currentTarget),
                    id = parseInt($this.attr("data-id"));
                var mode = $this.attr('mode') || '';
                if (!this.rewardDialog) {
                    var clz = $.u.load("com.sms.safePromotion.rewardDialog");
                    this.rewardDialog = new clz(this.$.find("div[umid=rewardDialog]"), {
                        mode: mode
                    });
                };
                this.rewardDialog.override({
                    "fresh": this.proxy(function(actionItem) {
                        $.u.ajax({
                            url: $.u.config.constant.smsmodifyserver,
                            type: "post",
                            data: {
                                tokenid: $.cookie("tokenid"),
                                method: "stdcomponent.update",
                                dataobject: 'rewards',
                                dataobjectid: JSON.stringify(id),
                                obj: JSON.stringify(actionItem)
                            },
                            dataType: "json"
                        }, this.rewardDialog.rewardDialog.parent()).done(this.proxy(function(response) {
                            if (response.success) {
                                this.freshTable();
                                this.rewardDialog.rewardDialog.dialog("close");

                            }
                        }));
                    })
                });
                this.rewardDialog.open({
                    mode: mode,
                    id: id
                });

            })),
            this.rewardTable.off("click", "button.delete").on("click", "button.delete", this.proxy(function(e) {
                var $this = $(e.currentTarget),
                    id = parseInt($this.attr("data-id"));
                $.u.load("com.sms.common.stdcomponentdelete");
                (new com.sms.common.stdcomponentdelete({
                    body: "<div>" +
                        "<div class='alert alert-warning'>" +
                        "<span class='glyphicon glyphicon-exclamation-sign'></span>" + this.i18n.dialog.deleteContentPrefix + this.i18n.dialog.deleteContentOver +
                        "</div>" +
                        "</div>",
                    title: this.i18n.dialog.deleteTitle,
                    dataobject: "rewards",
                    dataobjectids: JSON.stringify([id])
                })).override({
                    refreshDataTable: this.proxy(function() {
                        this.freshTable();
                    })
                });
            }))
    },
    _exportExcel: function(ent) {
        var obj = this.getData();
        this._exportExcelOptions=$.extend(obj, {
            method: 'exportRewardsToExcel',
            tokenid: $.cookie('tokenid'),
            dataobject: 'rewards',
            "columns": JSON.stringify([{
                "data": "t.lastUpdate"
            }]),
            "order": JSON.stringify([{
                "column": 0,
                "dir": "desc"
            }]),
            "rule": JSON.stringify([
                                    [{
                                        "key": "rewardType",
                                        "value": obj.rewardType
                                    }],
                                    [{
                                        "key": "rewardUnit.id",
                                        "op": "in",
                                        "value": obj.unit.length ? obj.unit : null
                                    }],
                                    [{
                                        "key": "eventLevel.id",
                                        "op": "in",
                                        "value": obj.eventLevel.length ? obj.eventLevel : null
                                    }],
                                    [{
                                        "key": "rewardTarget.id",
                                        "op": "in",
                                        "value": obj.userName.length ? obj.userName : null
                                    }],
                                    [{
                                        "key": "lastUpdate",
                                        "op": ">=",
                                        "value": obj.startDate
                                    }],
                                    [{
                                        "key": "lastUpdate",
                                        "op": "<",
                                        "value": obj.endDate ? new Date(obj.endDate).addDays(1).format('yyyy-MM-dd') : ''
                                    }],
                                    [{
                                        "key": "occurDate",
                                        "op": ">=",
                                        "value": obj.eventStartDate
                                    }],
                                    [{
                                        "key": "occurDate",
                                        "op": "<",
                                        "value": obj.eventEndDate ? new Date(obj.eventEndDate).addDays(1).format('yyyy-MM-dd') : ''
                                    }]
                                ]),
            titles: window.encodeURIComponent(JSON.stringify([
                [
                    '姓名',
                    '奖惩类型',
                    '事件等级',
                    '所在部门',
                    '原因',
                    '内容',
                    '金额（元）',
                    '备注',
                    '事发时间',
                    '更新日期'
                ],
                [
                    'rewardTarget',
                    'rewardType',
                    'eventLevel',
                    'rewardUnit',
                    'rewardReason',
                    'rewardContent',
                    'rewardAmount',
                    'remark',
                    'occurDate',
                    'lastUpdate'
                ]
            ]))
        });
        /*var form = $("<form>", {
            style: 'display:none',
            target: '_blank',
            method: 'post',
            action: $.u.config.constant.smsqueryserver + "?" + encodeURI($.param(obj))
        });
        form.appendTo($("body")).submit().remove();*/
        var form = $("<form/>"), 
        action = $.urlBuilder($.u.config.constant.smsqueryserver, $.extend({
            "tokenid": $.cookie("tokenid"),
            "method": "exportRewardsToExcel",
            "length":5000,
            "url": window.encodeURIComponent(window.location.host + window.location.pathname + window.location.search)
        }, this._exportExcelOptions));   
    form.attr({
        'style': 'display:none',
        'method': 'post',
        'target': '_blank',
        'action': action
    });  
    form.appendTo('body').submit().remove();
    },
    _ajax: function(url, param, $container, blockParam, callback) {
        $.u.ajax({
            "url": url,
            "type": url.indexOf(".json") > -1 ? "get" : "post",
            "data": $.cookie("tokenid") ? $.extend({
                "tokenid": $.parseJSON($.cookie("tokenid"))
            }, param) : $.extend({
                "tokenid": $.parseJSON($.cookie("uskyuser")).tokenid
            }, param),
            "dataType": "json"
        }, $container, $.extend({}, blockParam)).done(this.proxy(function(response) {
            if (response.success) {
                callback && callback(response);
            }
        })).fail(this.proxy(function(jqXHR, responseText, responseThrown) {

        }));
    },
    destroy: function() {
        this._super();
    }
}, {
    usehtm: true,
    usei18n: true
});

com.sms.safePromotion.rewardPunishment.widgetjs = [
    "../../../uui/widget/uploadify/jquery.uploadify.js",
    '../../../uui/widget/jqurl/jqurl.js',
    "../../../uui/widget/jqdatatable/js/jquery.dataTables.js",
    "../../../uui/widget/select2/js/select2.min.js",
    "../../../uui/widget/spin/spin.js",
    "../../../uui/widget/ajax/layoutajax.js"
];
com.sms.safePromotion.rewardPunishment.widgetcss = [{
    path: "../../../uui/widget/select2/css/select2.css"
}, {
    path: '../../../uui/widget/jqdatatable/css/jquery.dataTables.css'
}, {
    path: '../../../uui/widget/jqdatatable/css/dataTables.bootstrap.css'
}, {
    path: "../../../uui/widget/select2/css/select2-bootstrap.css"
}, {
    path: "../../../uui/widget/uploadify/uploadify.css"
}];