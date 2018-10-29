//@ sourceURL=com.sms.dash.slibrary
$.u.define('com.sms.dash.slibrary', null, {
    init: function(mode, gadgetsinstanceid,urlparam) {
        this._initmode = mode;
        this._gadgetsinstanceid = gadgetsinstanceid;
        this.urlparam=urlparam;
        if(typeof(this.urlparam)=="string"){
        	this.urlparam=JSON.parse(this.urlparam);
        }
    },
    afterrender: function(bodystr) {
    	this.treeid="";
        this.initShow();
    },
    initShow: function() {
        this.display = this.qid("display");
        this.config = this.qid("config");
        this.getData();
    },
    getData: function() {
        this._ajax(
            $.u.config.constant.smsqueryserver,
            true, {
                "method": "stdcomponent.getbyid",
                "dataobject": "gadgetsinstance",
                "dataobjectid": this._gadgetsinstanceid
            },
            this.$, {},
            this.proxy(function(response) {
                var options = {};
                try{
                    if(response.data.urlparam){
                        options = $.parseJSON(response.data.urlparam);
                    }
                }catch(e){}
                if (this._initmode == "config") {
                    this.qid("update").click(this.proxy(this.on_update_click));
                    this.qid("cancel").click(this.proxy(this.on_cancle_click));
                    this.qid('page-size').val($.isPlainObject(options) ? (options.pageSize || 10) : 10);
                    this.qid('window-height').val($.isPlainObject(options) ? (options.windowHeight || '') : 350);
                    this.config.removeClass("hidden");
                    this.createTree(options);
                    window.parent && window.parent.resizeGadget && window.parent.resizeGadget(this._gadgetsinstanceid, $("body").outerHeight(true));
                } else if (this._initmode == "display") {
                    this.display.css({height:$.isPlainObject(options) ? (options.windowHeight || '') : 350}).removeClass("hidden");
                    this._initDataTable(options);
                }
            })
        );
    },
    createTree: function(opt) {
        var setting = {
            data: {
                simpleData: {
                    enable: true
                }
            },
            callback: {
                onClick: this.proxy(function(e, treeId, treeNode, clickFlag) {
                    if (treeNode.parentTId == null) {
                        return false;
                    } else {

                    }
                })
            }
        };
        this.tree = $.fn.zTree.init(this.qid("libTree"), setting, this._getTreeData());
        var selectNode = this.tree.getNodeByParam("id", opt ? opt.id : "", null);
        if (selectNode) {
            this.tree.selectNode(selectNode);
        }
        var nodes = this.tree.getNodes();
        $.each(nodes, this.proxy(function(idx, node) {
            if (node.parentTId == null) {
                this.tree.expandNode(node, true, false, true);
            }
        }));
    },
    _getTreeData: function() {
        var nodes = [];
        $.ajax({
            url: $.u.config.constant.smsqueryserver,
            type: "post",
            dataType: "json",
            cache: false,
            async: false,
            data: {
                "tokenid": $.cookie("tokenid"),
                "method": "getDirectorys",
                "paramType": "getAllDirectorys"
            }
        }).done(this.proxy(function(responseData) {
            if (responseData.success) {
                if (responseData) {
                    nodes = $.map(responseData.directoryData.aaData, function(perm, idx) {
                        return {
                            id: perm.id,
                            pId: perm.fatherId,
                            name: perm.name
                        };
                    });
                }
            }
        })).fail(this.proxy(function(jqXHR, errorText, errorThrown) {

        }));
        return nodes;
    },
    on_update_click: function(e) {
        var node = this.tree.getSelectedNodes();
        if (node.length) {
            $.u.ajax({
                url: $.u.config.constant.smsmodifyserver,
                type: "post",
                dataType: "json",
                "data": {
                    "tokenid": $.cookie("tokenid"),
                    "method": "stdcomponent.update",
                    "dataobject": "gadgetsinstance",
                    "dataobjectid": this._gadgetsinstanceid,
                    "obj": JSON.stringify({
                        "urlparam": JSON.stringify({
                            "id": node[0].id,
                            "name": node[0].name,
                            "color":this.urlparam.color ?this.urlparam.color :$.cookie("color"),
                            windowHeight: this.qid('window-height').val(),
                            pageSize: this.qid('page-size').val()
                        })
                    })
                }
            }, this.$).done(this.proxy(function(response) {
                window.location.reload( window.location.href.replace("config", "display"));
            }));
        } else {
            $.u.alert.info("未选中任何节点");
        }
    },
    on_cancle_click: function() {
        this.display.removeClass("hidden");
        window.location.href = window.location.href.replace("config", "display");

    },
    _initDataTable: function(dt) {
        this.dataTable = this.qid("datatable").dataTable({
            searching: false,
            serverSide: true,
            bProcessing: true,
            ordering: false,
            pageLength: 5||6,
            "sDom": "rt<p>",
            "columns": [{
                "title": "名字",
                "mData": "name",
                "sWidth": "70%"
            }, {
                "title": "最后更新时间",
                "mData": "lastUpdate",
                "sWidth": "30%",
                
            }],
            "aaData": [
  
            ],
            "oLanguage": {
                "sSearch": "搜索:",
                "sLengthMenu": "每页显示 _MENU_ 条记录",
                "sZeroRecords": "抱歉未找到记录",
                "sInfo": "从 _START_ 到 _END_ /共 _TOTAL_ 条数据",
                "sInfoEmpty": "没有数据",
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
                    "search": "",
                    "columns":JSON.stringify([{"data":"t.lastUpdate"}]),
                    "order":JSON.stringify([{"column":0,"dir":"desc"}]),
                    "method": "stdcomponent.getbysearch",
                    "dataobject": "directory",
                    "rule": JSON.stringify([
                        [{
                            "key": "father",
                            "value": dt.id
                        }],
                        [{
                            "key": "father.status",
                            "value": 1
                        }],
                    ])
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
                        if (window.parent && window.parent.resizeGadget) {
                            window.parent.resizeGadget(this._gadgetsinstanceid, $("body").outerHeight(true));
                            window.parent.setGadgetTitle(this._gadgetsinstanceid, (dt ? dt.name : ""));
                        }
                    })
                );
            }),
            "aoColumnDefs": [{
                "aTargets": 0,
                "mRender": function(data, type, full) {
                    var htmls = ""; 
                    htmls += "<a href='/sms/uui/com/sms/safelib/ViewLibrary.html?id=" + 10733 + "&treeid=" + full.id + "' title='" + data + "' target='_balnk'>" + data + "</a>";
                    return htmls;
                }
                
            }]
        });
       
    },
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
    destroy: function() {
        return this._super();
    }
}, {
    usehtm: true,
    usei18n: false
});


com.sms.dash.slibrary.widgetjs = [
    "../../../uui/widget/jqdatatable/js/jquery.dataTables.min.js",
    "../../../uui/widget/spin/spin.js",
    "../../../uui/widget/jqblockui/jquery.blockUI.js",
    "../../../uui/widget/ajax/layoutajax.js",
    "../../../uui/widget/jqztree/js/jquery.ztree.all-3.5.min.js",
];
com.sms.dash.slibrary.widgetcss = [{
    path: "../../../uui/widget/jqztree/css/zTreeStyle/zTreeStyle.css"
}, {
    path: '../../../uui/widget/jqdatatable/css/jquery.dataTables.min.css'
}];