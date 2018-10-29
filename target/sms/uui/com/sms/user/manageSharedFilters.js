//@ sourceURL=com.sms.user.manageSharedFilters
$.u.define('com.sms.user.manageSharedFilters', null, {
    init: function () {
    	this._select2PageLength = 10;
    },
    afterrender: function () {
    	this.i18n = com.sms.user.manageSharedFilters.i18n;
        this.qid("owner").select2({
            placeholder: this.i18n.selectOwner,
            allowClear: true,
            ajax: {
                url: $.u.config.constant.smsqueryserver,
                dataType: "json",
                data: this.proxy(function (term, page) {
                    return {
                        tokenid: $.cookie("tokenid"),
                        method: "stdcomponent.getbysearch",
                        dataobject: "user",
                        rule: JSON.stringify([[{"key":"username", "op":"like", "value": term},{"key":"fullname", "op":"like", "value": term }]]),
                        start: (page - 1) * this._select2PageLength,
                        length: this._select2PageLength
                    };
                }),
                results: this.proxy(function (data, page) {
                    if (data.success) {
                        return {
                            results: $.map(data.data.aaData, function (user, idx) {
                                user.text = user.username + "(" + user.fullname + ")";
                                return user;
                            }),
                            more: (page * this._select2PageLength) < data.data.iTotalRecords 
                        };
                    }
                })
            }
        });
        this.qid("sharedgrouplist").select2({
            width: 360,
            placeholder: this.i18n.selectuserGroup,
            allowClear: true,
            ajax: {
                url: $.u.config.constant.smsqueryserver,
                dataType: "json",
                data: this.proxy(function (term, page) {
                    return {
                        tokenid: $.cookie("tokenid"),
                        method: "stdcomponent.getbysearch",
                        dataobject: "userGroup",
                        "rule": JSON.stringify([[{ "key": "name", "op": "like", "value": term }]]),
                        start: (page - 1) * this._select2PageLength,
                        length: this._select2PageLength
                    };
                }),
                results: this.proxy(function (data, page) {
                    if (data.success) {
                        return {
                            results: $.map(data.data.aaData, function (group, idx) {
                                group.text = group.name;
                                return group;
                            }),
                            more: (page * this._select2PageLength) < data.data.iTotalRecords 
                        };
                    }
                })
            }
        });
        this.qid("shareduserlist").select2({
            width :360,
            placeholder: this.i18n.selectuser,
            allowClear: true,
            ajax: {
                url: $.u.config.constant.smsqueryserver,
                dataType: "json",
                data: this.proxy(function (term, page) {
                    return {
                        tokenid: $.cookie("tokenid"),
                        method: "stdcomponent.getbysearch",
                        dataobject: "user",
                        rule: JSON.stringify([[{"key":"username", "op":"like", "value": term},{"key":"fullname", "op":"like", "value": term }]]),
                        start: (page - 1) * this._select2PageLength,
                        length: this._select2PageLength
                    };
                }),
                results: this.proxy(function (data, page) {
                    if (data.success) {
                        return {
                            results: $.map(data.data.aaData, function (user, idx) {
                                user.text = user.username + "(" + user.fullname + ")";
                                return user;
                            }),
                            more: (page * this._select2PageLength) < data.data.iTotalRecords 
                        };
                    }
                })
            }
        });
        $("#s2id_" + this.qid("sharedgrouplist").attr("id")).hide();
        $("#s2id_" + this.qid("shareduserlist").attr("id")).hide();
        this.qid("shared").unbind("change");
        this.qid("shared").change(this.proxy(function () {
            var v = this.qid("shared").val();
            if (v == "ALL") {
                $("#s2id_" + this.qid("sharedgrouplist").attr("id")).hide();
                $("#s2id_" + this.qid("shareduserlist").attr("id")).hide();
                this.qid("sharedgrouplist").select2("data", null);
                this.qid("shareduserlist").select2("data", null);
            }
            else if (v == "GROUP") {
                $("#s2id_" + this.qid("sharedgrouplist").attr("id")).show();
                $("#s2id_" + this.qid("shareduserlist").attr("id")).hide();
                this.qid("sharedgrouplist").select2("data", null);
            }
            else if (v == "USER") {
                $("#s2id_" + this.qid("sharedgrouplist").attr("id")).hide();
                $("#s2id_" + this.qid("shareduserlist").attr("id")).show();
                this.qid("shareduserlist").select2("data", null);
            }
        }));
        this.qid("btn_search").unbind("click");
        this.qid("btn_search").click(this.proxy(function (e) {
            e.preventDefault();
            this.dataTable.fnDraw();
        }));
        
        this.dataTable = this.qid("datatable").dataTable({
            searching: false,
            serverSide: true,
            bProcessing: true,
            ordering: false,
            pageLength: 1000,
            "sDom": "",
            "columns": [
                { "title": this.i18n.name, "mData": "name", "orderable" : false },
                { "title": this.i18n.owner, "mData": "creator", "sWidth": "25%", "orderable": false },
                { "title": this.i18n.shareTo, "mData": "paladin", "sWidth": "25%", "orderable": false },
                { "title": this.i18n.popular, "mData": "", "sWidth": 120, "orderable": false },
                { "title": "", "mData": "id", "sWidth": 20, "orderable": false }
            ],
            "oLanguage": { //语言
                "sSearch": this.i18n.search,
                "sLengthMenu": this.i18n.everPage+" _MENU_ "+this.i18n.record,
                "sZeroRecords": this.i18n.message,
                "sInfo": this.i18n.from+" _START_ "+this.i18n.to+" _END_ /"+this.i18n.all+" _TOTAL_ "+this.i18n.allData,
                "sInfoEmpty": this.i18n.withoutData,
                "sInfoFiltered": "("+this.i18n.fromAll+"_MAX_"+this.i18n.filterRecord+")",
                "sProcessing": ""+this.i18n.searching+"...",
                "oPaginate": {
                    "sFirst": "<<",
                    "sPrevious": this.i18n.back,
                    "sNext": this.i18n.next,
                    "sLast": ">>"
                }
            },
            "fnServerParams": this.proxy(function (aoData) {
                var param = {};
                if (this.qid("content") != null) {
                	param["content"]=this.qid("content").val();                 
                }
                if (this.qid("owner").select2("data") != null ) {
                	param["creator"]=this.qid("owner").select2("data").id;                   
                }
                if (this.qid("sharedgrouplist").select2("data") != null) {
                	param["paladin"]=",G@#" + this.qid("sharedgrouplist").select2("data").id + ",";                  
                }
                if (this.qid("shareduserlist").select2("data") != null) {
                	param["paladin"]=",U@#" + this.qid("shareduserlist").select2("data").id + ","                   
                }
                $.extend(aoData, {
                	"tokenid": $.cookie("tokenid"),
                    "method": "getFilter",
                    "param": JSON.stringify(param),
                    "type":"S",
                    "dataobject":"filtermanager",
                    "order": JSON.stringify(aoData.order),
                    "columns": JSON.stringify(aoData.columns),
                    "search": JSON.stringify(aoData.search)
                }, true);
            }),
            "fnServerData": this.proxy(function (sSource, aoData, fnCallBack, oSettings) {
                $.u.ajax({
                    url: $.u.config.constant.smsqueryserver,
                    type : "post",
                    dataType: "json",
                    cache: false,
                    data: aoData
                },this.qid("datatable")).done(this.proxy(function (result) {
                    if (result.success) {
                        fnCallBack(result.data);
                    } 
                })).fail(this.proxy(function (jqXHR, errorText, errorThrown) {

                }));
            }),
            "aoColumnDefs": [{
                    "aTargets": 2,
                    "mRender": function (data, type, full) {
                        var htm = "<ul style='padding-left:0;'>";
                        if (!full.paladin || full.paladin == "") {
                            htm += "<li class='private'>"+com.sms.user.manageSharedFilters.i18n.privatePanel+"</li>";
                        } else {
                            if (full.paladin.indexOf("ALL") > -1) {
                                htm += "<li class='public'>"+com.sms.user.manageSharedFilters.i18n.shareAll+"</li>";
                            } else {
                                var alltypes = full.paladinDesc.split(",");
                                $.each(alltypes, function (idx, atype) {
                                    var typeinfo = atype.split("@#");
                                    var tp = typeinfo[0];
                                    if (tp != "") {
                                        htm += "<li class='public'><b>" + (tp == "U" ? com.sms.user.manageSharedFilters.i18n.user : (tp == "G" ? com.sms.user.manageSharedFilters.i18n.userGroup : com.sms.user.manageSharedFilters.i18n.unknown)) + "</b>：" + typeinfo[1] + "</li>";
                                    }
                                });
                            }
                        }
                        htm += "</ul>";
                        return htm;
                    }
                },
                {
                    "aTargets": 3,
                    "mRender": function (data, type, full) {
                        var allchose = full.charnelThose ? full.charnelThose.split(",") : [];
                        var count = 0;
                        $.each(allchose, function (idx, achoose) {
                            if (achoose != "") {
                                count++;
                            }
                        });
                        return count;
                    }
                },
                {
                    "aTargets": 4,
                    "mRender": function (data, type, full) {
                        return "<span class='dropdown operate'><a href='#' class='dropdown-toggle dropdown-toggle-icon' data-toggle='dropdown'><span class='glyphicon glyphicon-cog'></span><b class='caret'></b></a>" +
                        			"<ul class='dropdown-menu pull-right' >" +
                        				"<li><a href='#' class='change' data='" + JSON.stringify(full) + "'>"+com.sms.user.manageSharedFilters.i18n.changeOwner+"</a></li>" +
                                        "<li><a href='#' class='delete' data='" + JSON.stringify(full) + "'>"+com.sms.user.manageSharedFilters.i18n.removePanel+"</a></li>" +
                        			"</ul>";
                    }
                }
            ]
        });
        // 改变所有者
        this.dataTable.off("click", "a.change").on("click", "a.change", this.proxy(function (e) {
            e.preventDefault();
            try {
                var boarddata = JSON.parse($(e.currentTarget).attr("data"));
                if(!this.changedialog){
                	$.u.load("com.sms.common.stdComponentOperate");
                	this.changedialog = new com.sms.common.stdComponentOperate($("div[umid='changedialog']", this.$), {
                        title: "",
                        dataobject: "filtermanager",
                        fields: [{
                            name: "creator", label: "过滤器拥有者", type: "select", dataType: "int", rule: { required: true }, message: "拥有者不能为空", option: {
                                params: { "dataobject": "user" },
                                ajax: {
                                    "data": this.proxy(function (term, page) {
                                        return {
                                            "tokenid": $.cookie("tokenid"),
                                            "method": "stdcomponent.getbysearch",
                                            "dataobject": "user",
                                            "rule": JSON.stringify([[{ "key": "username", "op": "like", "value": term },{ "key": "fullname", "op": "like", "value": term }]]),
                                            "start": (page - 1) * this._select2PageLength,
                                            "length": this._select2PageLength
                                        };
                                    })
                                },
                                formatSelection: function (item) {
                                    return "<img src='" + item.avatarUrl + "' width='16' height='16'/>&nbsp;" + "(" + item.username + ")" + item.fullname;
                                },
                                formatResult: function (item) {
                                    return "<img src='" + item.avatarUrl + "' width='16' height='16'/>&nbsp;" + "(" + item.username + ")" + item.fullname;
                                },
                            }
                        }]
                    });
                    this.changedialog.override({
                        refreshDataTable: this.proxy(function () {
                            this.dataTable.fnDraw();
                        })
                    });
                }
                this.changedialog.open({
                    data: {id : boarddata.id, creator: boarddata.creatorId },
                    title: this.i18n.removepossessor
                });
            } catch (e) {
                throw new Error(this.i18n.removeFail + e.message);
            }
        }));
        // 删除
        this.dataTable.off("click", "a.delete").on("click", "a.delete", this.proxy(function (e) {
            e.preventDefault();
            try {
                var boarddata = JSON.parse($(e.currentTarget).attr("data"));
                $.u.load("com.sms.common.stdcomponentdelete");
                (new com.sms.common.stdcomponentdelete({
                    body: "<div>" +
        				 	"<p>"+this.i18n.affirm+"</p>" +
        				 "</div>",
                    title: this.i18n.removeFilter + boarddata.name,
                    dataobject: "filtermanager",
                    dataobjectids: JSON.stringify([parseInt(boarddata.id)])
                })).override({
                    refreshDataTable: this.proxy(function () {
                        this.dataTable.fnDraw();
                    })
                });
            } catch (e) {
                throw new Error(this.i18n.removeFail + e.message);
            }
        }));
    },
    resize: function () {

    }
}, { usehtm: true, usei18n: true });


com.sms.user.manageSharedFilters.widgetjs = ['../../../uui/widget/select2/js/select2.min.js', 
                                             '../../../uui/widget/jqdatatable/js/jquery.dataTables.js', 
                                             '../../../uui/widget/jqdatatable/js/dataTables.bootstrap.js',
                                             "../../../uui/widget/spin/spin.js",
                                             "../../../uui/widget/jqblockui/jquery.blockUI.js",
                                             "../../../uui/widget/ajax/layoutajax.js"];
com.sms.user.manageSharedFilters.widgetcss = [{ path: "../../../uui/widget/select2/css/select2.css" },
                                              { path: "../../../uui/widget/select2/css/select2-bootstrap.css" },
                                              { path: '../../../uui/widget/jqdatatable/css/jquery.dataTables.css' }, 
                                              { path: '../../../uui/widget/jqdatatable/css/dataTables.bootstrap.css' }];
