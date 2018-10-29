//@ sourceURL=com.sms.dash.managePopular
$.u.define('com.sms.dash.managePopular', null, {
    init: function () {
    },
    afterrender: function () {
        this.dataTable = this.qid("datatable").dataTable({
            searching: false,
            serverSide: true,
            bProcessing: true,
            ordering: false,
            pageLength: 1000,
            "sDom": "",
            "columns": [
                { "title": com.sms.dash.managePopular.i18n.name, "mData": "name", "orderable": true },
                { "title": com.sms.dash.managePopular.i18n.owner, "mData": "creator", "sWidth": "30%", "orderable": true },
                { "title": com.sms.dash.managePopular.i18n.share, "mData": "paladin", "sWidth": "30%", "orderable": false },
                { "title": com.sms.dash.managePopular.i18n.popular, "mData": "", "sWidth": 50, "orderable": false }
            ],
            "oLanguage": { //语言
                "sSearch": com.sms.dash.managePopular.i18n.search,
                "sLengthMenu": com.sms.dash.managePopular.i18n.everPage+" _MENU_ "+com.sms.dash.managePopular.i18n.record,
                "sZeroRecords": com.sms.dash.managePopular.i18n.message,
                "sInfo": com.sms.dash.managePopular.i18n.from+" _START_ "+com.sms.dash.managePopular.i18n.to+" _END_ /"+com.sms.dash.managePopular.i18n.all+" _TOTAL_ "+com.sms.dash.managePopular.i18n.allData,
                "sInfoEmpty": com.sms.dash.managePopular.i18n.withoutData,
                "sInfoFiltered": "("+com.sms.dash.managePopular.i18n.fromAll+"_MAX_"+com.sms.dash.managePopular.i18n.filterRecord+")",
                "sProcessing": ""+com.sms.dash.managePopular.i18n.searching+"...",
                "oPaginate": {
                    "sFirst": "<<",
                    "sPrevious": com.sms.dash.managePopular.i18n.back,
                    "sNext": com.sms.dash.managePopular.i18n.next,
                    "sLast": ">>"
                }
            },
            "fnServerParams": this.proxy(function (aoData) {
                $.extend(aoData, {
                    "tokenid": $.cookie("tokenid"),
                    "method": "getHotDashboard",
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
                            htm += "<li class='private'>"+com.sms.dash.managePopular.i18n.privateDash+"</li>";
                        } else {
                            if (full.paladin.indexOf("ALL") > -1) {
                                htm += "<li class='public'>"+com.sms.dash.managePopular.i18n.allperShare+"</li>";
                            } else {
                                var alltypes = full.paladinDesc.split(",");
                                $.each(alltypes, function (idx, atype) {
                                    var typeinfo = atype.split("@#");
                                    var tp = typeinfo[0];
                                    if (tp != "") {
                                        htm += "<li class='public'><b>" + (tp == "U" ? com.sms.dash.managePopular.i18n.user : (tp == "G" ? com.sms.dash.managePopular.i18n.usegGroup : com.sms.dash.managePopular.i18n.unknown)) + "</b>：" + typeinfo[1] + "</li>";
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
                        var allchose = full.charnelThose.split(",");
                        var count = 0;
                        $.each(allchose, function (idx ,achoose) {
                            if (achoose != "") {
                                count++;
                            }
                        });
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


com.sms.dash.managePopular.widgetjs = ['../../../uui/widget/jqdatatable/js/jquery.dataTables.js', '../../../uui/widget/jqdatatable/js/dataTables.bootstrap.js'];
com.sms.dash.managePopular.widgetcss = [{ path: '../../../uui/widget/jqdatatable/css/jquery.dataTables.css' }, { path: '../../../uui/widget/jqdatatable/css/dataTables.bootstrap.css' }];
