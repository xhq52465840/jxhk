//@ sourceURL=com.sms.dash.manageFavourites
$.u.load("com.sms.common.stdcomponentdelete");
$.u.define('com.sms.dash.manageFavourites', null, {
    init: function () {
    },
    afterrender: function () {
        //this.dialog = $.um($("<div umid='" + $.u.uniqid() + "' umodule='com.sms.dash.dashDialog'/>"));
        this.dataTable = this.qid("datatable").dataTable({
            searching: false,
            serverSide: true,
            bProcessing: true,
            ordering: false,
            pageLength: 1000,
            "sDom": "",
            "columns": [
                { "title": com.sms.dash.manageFavourites.i18n.name, "mData": "name", "orderable": true },
                { "title": com.sms.dash.manageFavourites.i18n.owner, "mData": "creator", "sWidth": "30%", "orderable": true },
                { "title": com.sms.dash.manageFavourites.i18n.share, "mData": "paladin", "sWidth": "30%", "orderable": false },
                { "title": "", "mData": "id", "sWidth": 20, "orderable": false }
            ],
            "oLanguage": { //语言
                "sSearch": com.sms.dash.manageFavourites.i18n.search,
                "sLengthMenu": com.sms.dash.manageFavourites.i18n.everPage+" _MENU_ "+com.sms.dash.manageFavourites.i18n.record,
                "sZeroRecords": com.sms.dash.manageFavourites.i18n.message,
                "sInfo": com.sms.dash.manageFavourites.i18n.from+" _START_ "+com.sms.dash.manageFavourites.i18n.to+" _END_ /"+com.sms.dash.manageFavourites.i18n.all+" _TOTAL_ "+com.sms.dash.manageFavourites.i18n.allData,
                "sInfoEmpty": com.sms.dash.manageFavourites.i18n.withoutData,
                "sInfoFiltered": "("+com.sms.dash.manageFavourites.i18n.fromAll+"_MAX_"+com.sms.dash.manageFavourites.i18n.filterRecord+")",
                "sProcessing": ""+com.sms.dash.manageFavourites.i18n.searching+"...",
                "oPaginate": {
                    "sFirst": "<<",
                    "sPrevious": com.sms.dash.manageFavourites.i18n.back,
                    "sNext": com.sms.dash.manageFavourites.i18n.next,
                    "sLast": ">>"
                }
            },
            "fnServerParams": this.proxy(function (aoData) {
                $.extend(aoData, {
                    "tokenid": $.cookie("tokenid"),
                    "method": "getFavorDashboard",
                    "order": JSON.stringify(aoData.order),
                    "columns": JSON.stringify(aoData.columns),
                    "search": JSON.stringify(aoData.search)
                }, true);
            }),
            "fnServerData": this.proxy(function (sSource, aoData, fnCallBack, oSettings) {
                $.ajax({
                    url: $.u.config.constant.smsqueryserver,
                    type: "post",
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
                            htm += "<li class='private'>"+com.sms.dash.manageFavourites.i18n.privateDash+"</li>";
                        } else {
                            if (full.paladin.indexOf("ALL") > -1) {
                                htm += "<li class='public'>"+com.sms.dash.manageFavourites.i18n.allperShare+"</li>";
                            } else {
                                var alltypes = full.paladinDesc.split(",");
                                $.each(alltypes, function (idx, atype) {
                                    var typeinfo = atype.split("@#");
                                    var tp = typeinfo[0];
                                    if (tp != "") {
                                        htm += "<li class='public'><b>" + (tp == "U" ? com.sms.dash.manageFavourites.i18n.user : (tp == "G" ? com.sms.dash.manageFavourites.i18n.userGroup : com.sms.dash.manageFavourites.i18n.unknown)) + "</b>：" + typeinfo[1] + "</li>";
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
                        var myown = true;
                        if (full.creatorId != parseInt($.cookie("userid"))) {
                            myown = false;
                        }
                        //"<span class='dashicon-arrow-first first'></span><span class='dashicon-arrow-up up'></span><span class='dashicon-arrow-down down'></span><span class='dashicon-arrow-last last'></span>"
                        return "<span class='dropdown operate'><a href='#' class='dropdown-toggle dropdown-toggle-icon' data-toggle='dropdown'><span class='glyphicon glyphicon-cog'></span><b class='caret'></b></a>" +
                        			"<ul class='dropdown-menu pull-right' >" +
                        				(myown ? "<li><a href='#' class='edit' data='" + JSON.stringify(full) + "'>"+com.sms.dash.manageFavourites.i18n.edit+"</a></li>" : "") +
                        				(myown ? "<li><a href='#' class='delete' data='" + JSON.stringify(full) + "'>"+com.sms.dash.manageFavourites.i18n.remove+"</a></li>" : "") +
                        				"<li><a href='#' class='copy' data='" + JSON.stringify(full) + "'>"+com.sms.dash.manageFavourites.i18n.copy+"</a></li>" +
                        			"</ul>";
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
            }).done(this.proxy(function (result) {
                if (result.success) {
                    if ($fav.hasClass("glyphicon-star")) {
                        $fav.removeClass("glyphicon-star");
                        $fav.addClass("glyphicon-star-empty");
                        this.qid("allalert").show();
                        var template = "<br/><span>'#{title}'"+com.sms.dash.manageFavourites.i18n.hasRemove+"<a class='restorefav' real='#{dashid}'>"+com.sms.dash.manageFavourites.i18n.repeal+"</a></span>";
                        this.qid("allalert").children().first().append(template.replace(/#\{title\}/g, datajson.name).replace(/#\{dashid\}/g, datajson.id));
                    }
                    else {
                        $fav.removeClass("glyphicon-star-empty");
                        $fav.addClass("glyphicon-star");
                    }
                    this.dataTable.fnDraw();
                }
            })).fail(this.proxy(function (jqXHR, errorText, errorThrown) {

            }));
        }));
        ////置顶
        //this.dataTable.off("click", "span.first").on("click", "span.first", this.proxy(function (e) {
        //    e.preventDefault();
        //}));
        ////上一个
        //this.dataTable.off("click", "span.up").on("click", "span.up", this.proxy(function (e) {
        //    e.preventDefault();
        //}));s
        ////下一个
        //this.dataTable.off("click", "span.down").on("click", "span.down", this.proxy(function (e) {
        //    e.preventDefault();
        //}));
        ////置末
        //this.dataTable.off("click", "span.last").on("click", "span.last", this.proxy(function (e) {
        //    e.preventDefault();
        //}));
        //复制
        this.dataTable.off("click", "a.copy").on("click", "a.copy", this.proxy(function (e) {
            e.preventDefault();
            var data = JSON.parse($(e.currentTarget).attr("data"));
            var dialog = $.um($("<div umid='" + $.u.uniqid() + "' umodule='com.sms.dash.dashDialog'/>"));//内存创建
            dialog.parent(this);
            dialog.override({
                on_submit: this.proxy(function () {
                    this.dataTable.fnDraw();
                })
            });
            dialog.open({copyFrom : data.id });
        }));
        // 编辑
        this.dataTable.off("click", "a.edit").on("click", "a.edit", this.proxy(function (e) {
            e.preventDefault();
            var data = JSON.parse($(e.currentTarget).attr("data"));
            var dialog = $.um($("<div umid='" + $.u.uniqid() + "' umodule='com.sms.dash.dashDialog'/>"));//内存创建
            dialog.parent(this);
            dialog.override({
                on_submit: this.proxy(function () {
                    this.dataTable.fnDraw();
                })
            });
            dialog.open(data);
        }));

        // 删除
        this.dataTable.off("click", "a.delete").on("click", "a.delete", this.proxy(function (e) {
            e.preventDefault();
            try {
                var boarddata = JSON.parse($(e.currentTarget).attr("data"));
                (new com.sms.common.stdcomponentdelete({
                    body: "<div>" +
        				 	"<p>"+com.sms.dash.manageFavourites.i18n.affirm+"</p>" +
        				 "</div>",
                    title: com.sms.dash.manageFavourites.i18n.removeDash + boarddata.name,
                    dataobject: "dashboard",
                    dataobjectids: JSON.stringify([parseInt(boarddata.id)])
                })).override({
                    refreshDataTable: this.proxy(function () {
                        this.dataTable.fnDraw();
                    })
                });
            } catch (e) {
                throw new Error(com.sms.dash.manageFavourites.i18n.removeFail + e.message);
            }
        }));
        this.qid("allalert").off("click", "a.restorefav").on("click", "a.restorefav", this.proxy(function (e) {
            $.ajax({
                url: $.u.config.constant.smsmodifyserver,
                type: "post",
                dataType: "json",
                cache: false,
                data: {
                    "tokenid": $.cookie("tokenid"),
                    "method": "favorDashBoard",
                    "dashBoardId": parseInt($(e.currentTarget).attr("real")),
                    "charnelThose": "1"
                }
            }).done(this.proxy(function (response) {
                if (response.success) {
                    $(e.currentTarget).parent().prev().remove();
                    $(e.currentTarget).parent().remove();
                    if (this.qid("allalert").children().first().children().length == 1) {
                        this.qid("allalert").hide();
                    }
                    this.dataTable.fnDraw();
                }
            })).fail(this.proxy(function (jqXHR, errorText, errorThrown) {

            }));
        }));
    },
    resize: function () {

    }
}, { usehtm: true, usei18n: true });


com.sms.dash.manageFavourites.widgetjs = ['../../../uui/widget/jqdatatable/js/jquery.dataTables.js', '../../../uui/widget/jqdatatable/js/dataTables.bootstrap.js'];
com.sms.dash.manageFavourites.widgetcss = [{ path: '../../../uui/widget/jqdatatable/css/jquery.dataTables.css' }, { path: '../../../uui/widget/jqdatatable/css/dataTables.bootstrap.css' }];
