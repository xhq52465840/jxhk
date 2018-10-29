//@ sourceURL=com.sms.dash.dashDialog
$.u.define('com.sms.dash.dashDialog', null, {
    init: function () {
        this.mode = "ADD";
        this.editDashboardData = {};
        this.emptysharedliststring = "<div class='shareItem' real='NULL'><div title='"+com.sms.dash.dashDialog.i18n.notShare+"'><span class='icon-filter-private'>"+com.sms.dash.dashDialog.i18n.privater+"</span>"+com.sms.dash.dashDialog.i18n.noShare+"</div></div>";
        this.sharedliststring = "<div class='shareItem' real='#{value}'><div title='#{title}'><span class='icon-filter-public'>共享</span><span style='margin-left: 5px;'>#{info}</span><span class='glyphicon glyphicon-trash' style='margin-left: 10px;cursor:pointer;'></span></div></div>";
        this.select2PageLength = 10;
    },
    afterrender: function () {
    	this.i18n = com.sms.dash.dashDialog.i18n;
        this.dialog = this.$.dialog({
            width: 700,
            modal: true,
            draggable: false,
            resizable: false,
            autoOpen: false,
            create: this.proxy(function () {

            }),
            open: this.proxy(function () {
                if (this.mode == "ADD") {
                    $.u.ajax({
                        url: $.u.config.constant.smsqueryserver,
                        type: "post",
                        dataType: "json",
                        cache: false,
                        data: {
                            "tokenid": $.cookie("tokenid"),
                            "method": "getFavorDashboard"
                        }
                    }, this.$.parent()).done(this.proxy(function (result) {
                        if (result.success) {
                            var htm = "<option value=''>"+this.i18n.blank+"</option>";
                            $.each(result.data.aaData, function (idx, afav) {
                                htm += "<option value='" + afav.id + "'>" + afav.name + "</option>";
                            });
                            this.qid("copyfrom").html(htm);
                            this.qid("copyfrom").val(this.editDashboardData ? (this.editDashboardData.copyFrom ? this.editDashboardData.copyFrom : "") : "");
                        }
                    })).fail(this.proxy(function (jqXHR, errorText, errorThrown) {

                    }));
                    $(".control.add", this.dialog).show();
                } else if (this.mode == "EDIT") {
                    this.qid("name").val(this.editDashboardData.name);
                    this.qid("description").val(this.editDashboardData.description);
                    if(!this.editDashboardData.charnelThose){
                    	this.qid("charnelThose").addClass("glyphicon-star-empty");
                    }
                    // 默认打开是有star，只要判断没有的时候
                    if (this.editDashboardData.charnelThose.indexOf("," + $.cookie("userid") + ",") == -1) {
                        this.qid("charnelThose").removeClass("star");
                        this.qid("charnelThose").removeClass("glyphicon-star");
                        this.qid("charnelThose").addClass("glyphicon-star-empty");
                    }
                    //默认有emptystring
                    if (this.editDashboardData.paladin && this.editDashboardData.paladin != "") {
                        this.qid("sharedlist").empty();
                        var valhtm = "";
                        if (this.editDashboardData.paladin == "ALL") {
                            valhtm = this.sharedliststring.replace(/#\{title\}/g, this.i18n.shareAll).replace(/#\{info\}/g, this.i18n.shareany).replace(/#\{value\}/g, "ALL");
                        }
                        else {
                            var pd = this.editDashboardData.paladin.split(",");
                            var pddesc = this.editDashboardData.paladinDesc.split(",");
                            $.each(pd, this.proxy(function (idx, ap) {
                                if (ap != "") {
                                    var aps = ap.split("@#");
                                    var apdescs = pddesc[idx].split("@#");
                                    if (aps[0] == "G") {
                                        valhtm += this.sharedliststring.replace(/#\{title\}/g, ""+this.i18n.shareToAllUserGroup+"'" + apdescs[1] + "'"+this.i18n.member+"").replace(/#\{info\}/g, "<b>"+this.i18n.userGroup+"</b>：" + apdescs[1]).replace(/#\{value\}/g, "G@#" + aps[1]);
                                    }
                                    else if (aps[0] == "U") {
                                        valhtm += this.sharedliststring.replace(/#\{title\}/g, ""+this.i18n.shareAllUser+"'" + apdescs[1]).replace(/#\{info\}/g, "<b>"+this.i18n.user+"</b>：" + apdescs[1]).replace(/#\{value\}/g, "U@#" + aps[1]);
                                    }
                                }
                            }));
                        }
                        this.qid("sharedlist").html(valhtm);
                    }
                    $(".control.add", this.dialog).hide();
                }
            }),
            close: this.proxy(function () {
                this.clearForm();
                this.destroy();
            })
        });
        // 校验必输项
        this.qid("dashform").validate({
            rules: {
                name: "required"
            },
            messages: {
                name: this.i18n.nameNotNull
            },
            errorClass: "text-danger text-validate-element",
            errorElement: "div"
        });
        this.qid("sharedgrouplist").select2({
            width: 200,
            placeholder: ""+this.i18n.selectUserGroup+"...",
            allowClear: true,
            ajax: {
                url: $.u.config.constant.smsqueryserver,
                dataType: "json",
                data: this.proxy(function (term, page) {
                    return {
                        tokenid: $.cookie("tokenid"),
                        method: "stdcomponent.getbysearch",
                        dataobject: "userGroup",
                        rule: JSON.stringify([[{"key":"name","op":"like", "value": term }]]),
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
            width: 200,
            placeholder: ""+this.i18n.selectUser+"...",
            allowClear: true,
            ajax: {
                url: $.u.config.constant.smsqueryserver,
                dataType: "json",
                data: this.proxy(function (term, page) {
                    return {
                        tokenid: $.cookie("tokenid"),
                        method: "stdcomponent.getbysearch",
                        dataobject: "user",
                        search: JSON.stringify({ "value": term }),
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
                this.qid("allalert").show();
            }
            else if (v == "GROUP") {
                $("#s2id_" + this.qid("sharedgrouplist").attr("id")).show();
                $("#s2id_" + this.qid("shareduserlist").attr("id")).hide();
                this.qid("sharedgrouplist").select2("data", null);
                this.qid("allalert").hide();
            }
            else if (v == "USER") {
                $("#s2id_" + this.qid("sharedgrouplist").attr("id")).hide();
                $("#s2id_" + this.qid("shareduserlist").attr("id")).show();
                this.qid("shareduserlist").select2("data", null);
                this.qid("allalert").hide();
            }
        }));
        this.qid("btn_addshare").unbind("click");
        this.qid("btn_addshare").click(this.proxy(function (e) {
            e.preventDefault();
            var valhtm = this.sharedliststring.replace(/#\{title\}/g, this.i18n.shareAll).replace(/#\{info\}/g, this.i18n.shareany).replace(/#\{value\}/g, "ALL");
            var v = this.qid("shared").val();
            if (v == "ALL") {
                if (this.qid("sharedlist").children("[real='NULL']").length == 0) {
                    if (this.qid("sharedlist").children("[real='ALL']").length == 1) {
                        var itm = this.qid("sharedlist").children().first();
                        // 两遍，才能变回来
                        itm.toggle("highlight").toggle("highlight");
                    }
                    else {
                        if (confirm(this.i18n.clearShare)) {
                            this.qid("sharedlist").empty();
                            this.qid("sharedlist").append(valhtm);
                        }
                    }
                }
                else {
                    this.qid("sharedlist").empty();
                    this.qid("sharedlist").append(valhtm);
                }
            }
            else if (v == "GROUP") {
                var data = this.qid("sharedgrouplist").select2("data");
                if (data) {
                    var valhtm = this.sharedliststring.replace(/#\{title\}/g, ""+this.i18n.shareToAllUserGroup+"'" + data.name + "'"+this.i18n.member+"").replace(/#\{info\}/g, "<b>"+this.i18n.userGroup+"</b>：" + data.name).replace(/#\{value\}/g, "G@#" + data.id);
                    if (this.qid("sharedlist").children("[real='G@#" + data.id + "']").length == 1) {
                        this.qid("sharedlist").children("[real='G@#" + data.id + "']").toggle("highlight").toggle("highlight");
                    }
                    else {
                        if (this.qid("sharedlist").children("[real='NULL']").length == 1 || this.qid("sharedlist").children("[real='ALL']").length == 1) {
                            this.qid("sharedlist").empty();
                        }
                        this.qid("sharedlist").append(valhtm);
                    }
                }
            }
            else if (v == "USER") {
                var data = this.qid("shareduserlist").select2("data");
                if (data) {
                    var valhtm = this.sharedliststring.replace(/#\{title\}/g, ""+this.i18n.shareAllUser+"'" + data.username + "(" + data.fullname + ")'").replace(/#\{info\}/g, "<b>"+this.i18n.user+"</b>：" + data.username + "(" + data.fullname + ")").replace(/#\{value\}/g, "U@#" + data.id);
                    if (this.qid("sharedlist").children("[real='U@#" + data.id + "']").length == 1) {
                        this.qid("sharedlist").children("[real='U@#" + data.id + "']").toggle("highlight").toggle("highlight");
                    }
                    else {
                        if (this.qid("sharedlist").children("[real='NULL']").length == 1 || this.qid("sharedlist").children("[real='ALL']").length == 1) {
                            this.qid("sharedlist").empty();
                        }
                        this.qid("sharedlist").append(valhtm);
                    }
                }
            }
        }));
        this.qid("sharedlist").append(this.emptysharedliststring);
        this.qid("sharedlist").off("click", ".glyphicon-trash").on("click", ".glyphicon-trash", this.proxy(function (e) {
            $(e.currentTarget).closest(".shareItem").remove();
            if (this.qid("sharedlist").children().length == 0) {
                this.qid("sharedlist").append(this.emptysharedliststring);
            }
        }));
        this.qid("charnelThose").unbind("click");
        this.qid("charnelThose").click(this.proxy(function (e) {
            if (this.qid("charnelThose").hasClass("star")) {
                this.qid("charnelThose").removeClass("star");
                this.qid("charnelThose").removeClass("glyphicon-star");
                this.qid("charnelThose").addClass("glyphicon-star-empty");
            }
            else {
                this.qid("charnelThose").removeClass("glyphicon-star-empty");
                this.qid("charnelThose").addClass("star");
                this.qid("charnelThose").addClass("glyphicon-star");
            }
        }));
    },
    /*
    * 清空表单
    */
    clearForm: function () {
        this.qid("name").val("");
        this.qid("description").val("");
        this.qid("copyfrom").empty();
        if (!this.qid("charnelThose").hasClass("star")) {
            this.qid("charnelThose").addClass("star");
        }
        this.qid("sharedlist").empty();
        this.qid("sharedlist").append(this.emptysharedliststring);
        this.qid("shared").val("ALL");
    },
    open: function (userdata) {
        var dialogOptions = null;
        this.editDashboardData = userdata;
        if (this.editDashboardData && this.editDashboardData.id) {
            this.mode = "EDIT";
            dialogOptions = {
                title: this.i18n.editPanel + this.editDashboardData.name,
                buttons: [
                    {
                        text: this.i18n.update,
                        click: this.proxy(function (e) {
                            if (this.qid("dashform").valid()) {
                                var paladins = this.qid("sharedlist").children("[real!='NULL']");
                                var paladinstr = "";
                                $.each(paladins, function (idx, aitm) {
                                    paladinstr += $(aitm).attr("real") + ",";
                                });
                                if (paladinstr.length > 0) {
                                    if (paladinstr != "ALL,") {
                                        //处理ALL情况
                                        paladinstr = "," + paladinstr;
                                    }
                                    else {
                                        paladinstr = paladinstr.substr(0, paladinstr.length - 1);
                                    }
                                }
                                this._sendAjax({
                                    "tokenid": $.cookie("tokenid"),
                                    "method": "stdcomponent.update",
                                    "dataobject": "dashboard",
                                    "dataobjectid": this.editDashboardData.id,
                                    "obj": JSON.stringify({
                                        name: this.qid("name").val(),
                                        description: this.qid("description").val(),
                                        charnelThose: (this.qid("charnelThose").hasClass("star") ? "1" : "0"),
                                        paladin: paladinstr
                                    })
                                }, e);
                            }
                        })
                    },
                    {
                        text: this.i18n.cancel,
                        "class": "aui-button-link",
                        click: this.proxy(function () {
                            this.dialog.dialog("close");
                        })
                    }
                ]
            };
        } else {
            this.mode = "ADD";
            dialogOptions = {
                title: this.i18n.createPanel,
                buttons: [
                    {
                        text: this.i18n.create,
                        click: this.proxy(function (e) {
                            if (this.qid("dashform").valid()) {
                                var paladins = this.qid("sharedlist").children("[real!='NULL']");
                                var paladinstr = "";
                                $.each(paladins, function (idx, aitm) {
                                    paladinstr += $(aitm).attr("real") + ",";
                                });
                                if (paladinstr.length > 0) {
                                    if (paladinstr != "ALL,") {
                                        //处理ALL情况
                                        paladinstr = "," + paladinstr;
                                    }
                                    else {
                                        paladinstr = paladinstr.substr(0, paladinstr.length - 1);
                                    }
                                }
                                this._sendAjax({
                                    "tokenid": $.cookie("tokenid"),
                                    "method": "stdcomponent.add",
                                    "dataobject": "dashboard",
                                    "obj": JSON.stringify({
                                        name: this.qid("name").val(),
                                        description: this.qid("description").val(),
                                        copyFrom: this.qid("copyfrom").val(),
                                        charnelThose: (this.qid("charnelThose").hasClass("star") ? "1" : "0"),
                                        paladin: paladinstr
                                    })
                                }, e);
                            }
                        })
                    },
                    {
                        text: this.i18n.cancel,
                        "class": "aui-button-link",
                        click: this.proxy(function () {
                            this.dialog.dialog("close");
                        })
                    }
                ]
            };
        }
        this.dialog.dialog("option", dialogOptions).dialog("open");
        ///////////////////////
        if (this.qid("shared").val() == "ALL") {
            this.qid("allalert").show();
        }
        else {
            this.qid("allalert").hide();
        }
    },
    _sendAjax: function (data, e) {
        $.u.ajax({
            url: $.u.config.constant.smsmodifyserver,
            type: "post",
            dataType: "json",
            cache: false,
            "data": data
        }, this.$.parent(), { selector: $(e.currentTarget).parent(), orient: "west", size: 1 }).done(this.proxy(function (response) {
            if (response.success) {
                if (this.mode == "ADD") {
                    this.on_submit(response.data);
                }
                else {
                    this.on_submit(this.editDashboardData.id);
                }
                this.dialog.dialog("close");
            }
        })).fail(this.proxy(function (jqXHR, errorText, errorThrown) {

        }));
    },
    on_submit: function () {

    },
    destroy: function () {
        if (this.dialog) {
            this.dialog.dialog("destroy").remove();
        }
        this._super();
    },
    resize: function () {

    }
}, { usehtm: true, usei18n: true });


com.sms.dash.dashDialog.widgetjs = ['../../../uui/widget/select2/js/select2.min.js'
    , "../../../uui/widget/spin/spin.js"
    , "../../../uui/widget/jqblockui/jquery.blockUI.js"
    , "../../../uui/widget/ajax/layoutajax.js", '../../../uui/widget/validation/jquery.validate.js'];
com.sms.dash.dashDialog.widgetcss = [{ path: "../../../uui/widget/select2/css/select2.css" }, { path: "../../../uui/widget/select2/css/select2-bootstrap.css" }];
