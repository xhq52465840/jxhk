//@ sourceURL=com.sms.dash.manageSearch
$.u.define('com.sms.dash.manageSearch', null, {
    init: function () {
    },
    afterrender: function () {
    	this.select2PageLength = 10;
        this.qid("owner").select2({
            placeholder: com.sms.dash.manageSearch.i18n.selectOwner,
            allowClear: true,
            ajax: {
                url: $.u.config.constant.smsqueryserver,
                dataType: "json",
                type: "post",
                data: this.proxy(function (term, page) { 
                    return {
                        tokenid: $.cookie("tokenid"),
                        method: "stdcomponent.getbysearch",
                        dataobject: "user",
                        rule: JSON.stringify([[{"key":"fullname", "op":"like", "value": term },{"key":"username", "op":"like", "value": term }]]),
                        start: (page - 1) * this.select2PageLength,
                        length: this.select2PageLength
                    };
                }),
                results: this.proxy(function (data, page) {
                    if (data.success) {
                        return {
                            results: $.map(data.data.aaData, function (user, idx) {
                                user.text = user.username + "(" + user.fullname + ")";
                                return user;
                            }),
                            more: (page * this.select2PageLength) < data.data.iTotalRecords
                        };
                    }
                })
            }
        });
        this.qid("sharedgrouplist").select2({
            width: 360,
            placeholder: com.sms.dash.manageSearch.i18n.selectUserGroup,
            allowClear: true,
            ajax: {
                url: $.u.config.constant.smsqueryserver,
                dataType: "json",
                type: "post",
                data: this.proxy(function (term, page) {
                    return {
                        tokenid: $.cookie("tokenid"),
                        method: "stdcomponent.getbysearch",
                        dataobject: "userGroup",
                        rule: JSON.stringify([[{"key":"name", "op":"like", "value": term }]]),
                        start: (page - 1) * this.select2PageLength,
                        length: this.select2PageLength
                    };
                }),
                results: this.proxy(function (data, page) {
                    if (data.success) {
                        return {
                            results: $.map(data.data.aaData, function (group, idx) {
                                group.text = group.name;
                                return group;
                            }),
                            more: (page * this.select2PageLength) < data.data.iTotalRecords
                        };
                    }
                })
            }
        });
        this.qid("shareduserlist").select2({
            width :360,
            placeholder: com.sms.dash.manageSearch.i18n.selectUser,
            allowClear: true,
            ajax: {
                url: $.u.config.constant.smsqueryserver,
                dataType: "json",
                type: "post",
                data: this.proxy(function (term, page) {
                    return {
                        tokenid: $.cookie("tokenid"),
                        method: "stdcomponent.getbysearch",
                        dataobject: "user",
                        rule: JSON.stringify([[{"key":"fullname", "op":"like", "value": term },{"key":"username", "op":"like", "value": term }]]),
                        start: (page - 1) * this.select2PageLength,
                        length: this.select2PageLength
                    };
                }),
                results: this.proxy(function (data, page) {
                    if (data.success) {
                        return {
                            results: $.map(data.data.aaData, function (user, idx) {
                                user.text = user.username + "(" + user.fullname + ")";
                                return user;
                            }),
                            more: (page * this.select2PageLength) < data.data.iTotalRecords
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
            //iDeferLoading : 57,
            "sDom": "",
            "columns": [
                { "title": com.sms.dash.manageSearch.i18n.name, "mData": "name", "orderable" : false },
                { "title": com.sms.dash.manageSearch.i18n.owner, "mData": "creator", "sWidth": "30%", "orderable": false },
                { "title": com.sms.dash.manageSearch.i18n.share, "mData": "paladin", "sWidth": "30%", "orderable": false },
                { "title": com.sms.dash.manageSearch.i18n.popular, "mData": "", "sWidth": 50, "orderable": false}
            ],
            "oLanguage": { //语言
                "sSearch": com.sms.dash.manageSearch.i18n.search,
                "sLengthMenu": com.sms.dash.manageSearch.i18n.everPage+" _MENU_ "+com.sms.dash.manageSearch.i18n.record,
                "sZeroRecords": com.sms.dash.manageSearch.i18n.message,
                "sInfo": com.sms.dash.manageSearch.i18n.from+" _START_ "+com.sms.dash.manageSearch.i18n.to+" _END_ /"+com.sms.dash.manageSearch.i18n.all+" _TOTAL_ "+com.sms.dash.manageSearch.i18n.allData,
                "sInfoEmpty": com.sms.dash.manageSearch.i18n.withoutData,
                "sInfoFiltered": "("+com.sms.dash.manageSearch.i18n.fromAll+"_MAX_"+com.sms.dash.manageSearch.i18n.filterRecord+")",
                "sProcessing": ""+com.sms.dash.manageSearch.i18n.searching+"...",
                "oPaginate": {
                    "sFirst": "<<",
                    "sPrevious": com.sms.dash.manageSearch.i18n.back,
                    "sNext": com.sms.dash.manageSearch.i18n.next,
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
                    "method": "getShareDashboard",
                    "param": JSON.stringify(param),
                    "order": JSON.stringify(aoData.order),
                    "columns": JSON.stringify(aoData.columns),
                    "search": JSON.stringify(aoData.search)
                }, true);
            }),
            "fnServerData": this.proxy(function (sSource, aoData, fnCallBack, oSettings) {
                $.ajax({
                    url: $.u.config.constant.smsqueryserver,
                    type : "post",
                    dataType: "json",
                    cache: false,
                    data: aoData
                }).done(this.proxy(function (result) {
                    if (result.success) {
                        fnCallBack(result.data);
                    }
                })).fail(this.proxy(function (jqXHR, errorText, errorThrown) {

                }));
            }),
            "aoColumnDefs": [
                {
                    "aTargets": 0,
                    "mRender": function (data, type, full) {
                        var charnel = false;
                        if (full.charnelThose && full.charnelThose.indexOf("," + $.cookie("userid") + ",") > -1) {
                            charnel = true;
                        }
                        return "<span class='star glyphicon glyphicon-star" + (charnel ? "" : "-empty") + "' data='" + JSON.stringify(full) + "'></span><span><a href='./DashBoard.html?pageId=" + full.id + "' style='padding-left: 10px;'>" + full.name + "</a>" +
                                "<p class='text-muted' style='padding-left: 24px;'><small>" + (full.description || "") + "</small></p></span>";
                    }
                }, {
                    "aTargets": 2,
                    "mRender": function (data, type, full) {
                        var htm = "<ul style='padding-left:0;'>";
                        if (!full.paladin || full.paladin == "") {
                            htm += "<li class='private'>"+com.sms.dash.manageSearch.i18n.privateDash+"</li>";
                        } else {
                            if (full.paladin.indexOf("ALL") > -1) {
                                htm += "<li class='public'>"+com.sms.dash.manageSearch.i18n.allperShare+"</li>";
                            } else {
                                var alltypes = full.paladinDesc.split(",");
                                $.each(alltypes, function (idx, atype) {
                                    var typeinfo = atype.split("@#");
                                    var tp = typeinfo[0];
                                    if (tp != "") {
                                        htm += "<li class='public'><b>" + (tp == "U" ? com.sms.dash.manageSearch.i18n.user : (tp == "G" ? com.sms.dash.manageSearch.i18n.userGroup : com.sms.dash.manageSearch.i18n.unknown)) + "</b>：" + typeinfo[1] + "</li>";
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
                		var count = 0;
                		if(full.charnelThose){
                			var allchose = full.charnelThose.split(",");
                            $.each(allchose, function (idx, achoose) {
                                if (achoose != "") {
                                    count++;
                                }
                            });
                		}
                        return count;
                    }
                }
            ]
        });
        //收藏
        this.dataTable.off("click", "span.star").on("click", "span.star", this.proxy(function (e) {
            e.preventDefault();
            var $fav = $(e.currentTarget);
            var datajson = JSON.parse($fav.attr("data"));
            $.ajax({
                url: $.u.config.constant.smsmodifyserver,
                type: "post",
                dataType: "json",
                cache: false,
                data: {
                    "tokenid": $.cookie("tokenid"),
                    "method": "favorDashBoard",
                    "dashBoardId": datajson.id,
                    "charnelThose": $fav.hasClass("glyphicon-star") ? "0" : "1" // 要相反
                }
            }).done(this.proxy(function (response) {
                if (response.success) {
                    if ($fav.hasClass("glyphicon-star")) {
                        $fav.removeClass("glyphicon-star");
                        $fav.addClass("glyphicon-star-empty");
                    }
                    else {
                        $fav.removeClass("glyphicon-star-empty");
                        $fav.addClass("glyphicon-star");
                    }
                }
            })).fail(this.proxy(function (jqXHR, errorText, errorThrown) {

            }));
        }));
    },
    resize: function () {

    }
}, { usehtm: true, usei18n: true });


com.sms.dash.manageSearch.widgetjs = ['../../../uui/widget/select2/js/select2.min.js', '../../../uui/widget/jqdatatable/js/jquery.dataTables.js', '../../../uui/widget/jqdatatable/js/dataTables.bootstrap.js'];
com.sms.dash.manageSearch.widgetcss = [{ path: "../../../uui/widget/select2/css/select2.css" }, { path: "../../../uui/widget/select2/css/select2-bootstrap.css" }, { path: '../../../uui/widget/jqdatatable/css/jquery.dataTables.css' }, { path: '../../../uui/widget/jqdatatable/css/dataTables.bootstrap.css' }];
