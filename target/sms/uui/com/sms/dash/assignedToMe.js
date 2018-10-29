//@ sourceURL=com.sms.dash.assignedToMe
$.u.define('com.sms.dash.assignedToMe', null, {
    init: function(mode, gadgetsinstanceid) {
        this._initmode = mode;
        this._gadgetsinstanceid = gadgetsinstanceid;
        this._gadgetsinstance = null;
        this._pageLength = 10;
        this._columns = [{
            "propid": "type",
            "propname": "类型",
            "propvalue": null,
            "propplugin": "com.sms.plugin.render.activityTypeProp"
        }, {
            "propid": "key",
            "propname": "编号",
            "propvalue": null,
            "propplugin": "com.sms.plugin.render.keywordProp",
            "orderable": false
        }, {
            "propid": "priority",
            "propname": "优先级",
            "propvalue": null,
            "propplugin": "com.sms.plugin.render.priorityProp",
            "order": "desc",
        }, {
            "propid": "summary",
            "propname": "主题",
            "propvalue": null,
            "propplugin": "com.sms.plugin.render.summaryProp"
        }, {
            "propid": "unit",
            "propname": "安监机构",
            "propvalue": null,
            "propplugin": "com.sms.plugin.render.unitProp"
        }, {
            "propid": "status",
            "propname": "状态",
            "propvalue": null,
            "propplugin": "com.sms.plugin.render.statusProp"
        }, {
            "propid": "lastUpdate",
            "propname": "最后更新时间",
            "propvalue": null,
            "propplugin": "com.sms.plugin.render.datetimeProp"
        }];
        this._queryArray = [{
            "propid": "processors",
            "propvalue": [{
                "id": "currentUser()",
                "name": "currentUser()",
                "url": "currentUser()"
            }]
        }];
        this._sort = "lastUpdate desc";
    },
    afterrender: function(bodystr) {
        this._ajax(
            $.u.config.constant.smsqueryserver,
            true, {
                "method": "stdcomponent.getbyid",
                "dataobject": "gadgetsinstance",
                "dataobjectid": this._gadgetsinstanceid
            },
            this.$, {
                size: 2,
                backgroundColor: "#fff"
            },
            this.proxy(function(response) {
                this._gadgetsinstance = response.data;
                this.dash_options = {};
                if (this._gadgetsinstance.urlparam) {
                    this.dash_options = JSON.parse(this._gadgetsinstance.urlparam);
                    this.dash_options.rule = this.dash_options.rule ? JSON.parse(this.dash_options.rule) : null;
                }
                this._initDataTable();
            })
        );
    },
    _initDataTable: function() {
        var orders = [],
            tablecols = [],
            atbcol = null;
        $.each(this._columns, this.proxy(function(idx, adata) {
            atbcol = {
                "data": adata.propid,
                "title": adata.propname,
                "class": "field-" + adata.propid,
                "orderable": adata.orderable
            };
            if (adata.propplugin) {
                var renderclz = $.u.load(adata.propplugin);
                var renderobj = new renderclz();
                atbcol.render = this.proxy(renderobj.table_html);
            }
            if (adata.order) {
                orders.push([idx, adata.order]);
            }
            tablecols.push(atbcol);
        }));
        this.dataTable = this.qid("datatable").dataTable({
            "dom": 'rt<ip>',
            "pageLength": parseInt(this.dash_options.pageLength || this._pageLength),
            "autoWidth": false,
            "processing": false,
            "serverSide": true,
            "ordering": false,
            "orderMulti": false, 
            "language": {
                "processing": "数据加载中...",
                "info": "从 _START_ 到 _END_ /共 _TOTAL_ 条数据",
                "zeroRecords": "无搜索结果",
                "infoEmpty": "",
                "infoFiltered": "",
                "paginate": {
                    "first": "",
                    "previous": "<span class='fa fa-caret-left fa-lg'></span>",
                    "next": "<span class='fa fa-caret-right fa-lg'></span>",
                    "last": ""
                }
            },
            "columns": tablecols,
            "ajax": this.proxy(this.on_dataTable_ajax),
            "headerCallback": this.proxy(this.on_dataTable_headerCallback),
            "drawCallback": this.proxy(this.on_dataTable_drawCallback)
        });
    },
    on_dataTable_drawCallback: function(row, data) {
        if (window.parent) {
            window.parent.resizeGadget(this._gadgetsinstanceid, $("body").outerHeight(true));
            if (this.dash_options.rulename) {
                window.parent.setGadgetTitle(this._gadgetsinstanceid, this._gadgetsinstance.gadgetsDisplayName + "：" + this.dash_options.rulename);
            }
        }
        window.top && window.top.goHash(this._gadgetsinstanceid);
    },
    on_dataTable_headerCallback: function(tr, data, start, end, display) {
        $(tr).children("th").css("padding", "5px 0");
    },
    on_dataTable_ajax: function(data, callback, settings) {
        var sort = "";
        var query = $.map(this._queryArray, function(filter) {
            if (filter.propvalue && filter.propvalue.length > 0) {
                return {
                    id: filter.propid,
                    value: filter.propvalue
                };
            }
        });
        if (data.order) {
            $.each(data.order, this.proxy(function(idx, order) {
                sort += data.columns[order.column].data + " " + order.dir + ",";
            }));
            sort += this._sort;
        }
        delete data.columns;
        delete data.draw;
        delete data.search;
        delete data.order;
        this._ajax(
            $.u.config.constant.smsqueryserver,
            true,
            $.extend({}, data, {
                "method": "getToDoActivities",
                "sort": JSON.stringify({key:"lastUpdate",value:"desc"})
            }, true),
            this.dataTable, {
                size: 2,
                backgroundColor: "#fff"
            },
            this.proxy(function(response) {
                if (response.data) {
                    callback({
                        "draw": data.draw,
                        "recordsFiltered": response.data.iTotalRecords,
                        "data": response.data.aaData
                    });
                } else {
                    callback({
                        "draw": data.draw,
                        "recordsFiltered": 0,
                        "data": []
                    });
                }
                
            })
        );
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
            "data": $.extend({
                "tokenid": $.cookie("tokenid")
            }, param)
        }, $container || this.$, $.extend({}, blockParam || {})).done(this.proxy(function(response) {
            if (response.success) {
                callback(response);
            }
        })).fail(this.proxy(function(jqXHR, errorText, errorThrown) {

        }));
    },
    destroy: function() {
        return this._super();
    }
}, {
    usehtm: true,
    usei18n: true
});


com.sms.dash.assignedToMe.widgetjs = [
    '../../../uui/widget/select2/js/select2.min.js',
    '../../../uui/widget/jqdatatable/js/jquery.dataTables.js',
    "../../../uui/widget/spin/spin.js",
    "../../../uui/widget/jqblockui/jquery.blockUI.js",
    "../../../uui/widget/ajax/layoutajax.js"
];
com.sms.dash.assignedToMe.widgetcss = [{
    id: "",
    path: "../../../uui/widget/select2/css/select2.css"
}, {
    id: "",
    path: "../../../uui/widget/select2/css/select2-bootstrap.css"
}, {
    path: '../../../uui/widget/jqdatatable/css/jquery.dataTables.css'
}, {
    path: '../../../uui/widget/jqdatatable/css/jquery.dataTables.css'
}, {
    path: '../../../uui/widget/jqdatatable/css/dataTables.bootstrap.css'
}];