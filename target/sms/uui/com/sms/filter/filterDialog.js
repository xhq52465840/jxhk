//@ sourceURL=com.sms.filter.filterDialog
$.u.define('com.sms.filter.filterDialog', null, {
    init: function () {
    	this.i18n = com.sms.filter.filterDialog.i18n;
        this.mode = "ADD";
        this.editFilterData = {};
        this.emptysharedliststring = "<div class='shareItem' real='NULL'><div title='"+this.i18n.VnotShareToUser+"'><span class='icon-filter-private'>"+this.i18n.proprietary+"</span>"+this.i18n.noShare+"</div></div>";
        this.sharedliststring = "<div class='shareItem' real='#{value}'><div title='#{title}'><span class='icon-filter-public'>"+this.i18n.share+"</span><span style='margin-left: 5px;'>#{info}</span><span class='glyphicon glyphicon-trash' style='margin-left: 10px;cursor:pointer;'></span></div></div>";
    },
    afterrender: function () {
    	this.i18n = com.sms.filter.filterDialog.i18n;
        this.dialog = this.$.dialog({
            width: 700,
            modal: true,
            draggable: false,
            resizable: false,
            autoOpen: false,
            create: this.proxy(function () {

            }),
            open: this.proxy(function () {
                if (this.mode == "EDIT") {
                    this.qid("name").val(this.editFilterData.name);
                    this.qid("description").val(this.editFilterData.description);
                    // 默认打开是有star，只要判断没有的时候
                    if(!this.editFilterData.charnelThose){
                    	this.qid("charnelThose").addClass("glyphicon-star-empty");
                    }
                    if (this.editFilterData.charnelThose && this.editFilterData.charnelThose.indexOf("," + $.cookie("userid") + ",") == -1) {
                        this.qid("charnelThose").removeClass("star");
                        this.qid("charnelThose").removeClass("glyphicon-star");
                        this.qid("charnelThose").addClass("glyphicon-star-empty");
                    }
                    //默认有emptystring
                    if (this.editFilterData.paladin && this.editFilterData.paladin != "") {
                        this.qid("sharedlist").empty();
                        var valhtm = "";
                        if (this.editFilterData.paladin == "ALL") {
                            valhtm = this.sharedliststring.replace(/#\{title\}/g, this.i18n.shareToAll).replace(/#\{info\}/g, this.i18n.withShareToAll).replace(/#\{value\}/g, "ALL");
                        }
                        else {
                            var pd = this.editFilterData.paladin.split(",");
                            var pddesc = this.editFilterData.paladinDesc.split(",");
                            $.each(pd, this.proxy(function (idx, ap) {
                                if (ap != "") {
                                    var aps = ap.split("@#");
                                    var apdescs = pddesc[idx].split("@#");
                                    if (aps[0] == "G") {
                                        valhtm += this.sharedliststring.replace(/#\{title\}/g, ""+this.i18n.ShareToUserGroup+"'" + apdescs[1] + "'"+this.i18n.member+"").replace(/#\{info\}/g, "<b>"+this.i18n.userGroup+"</b>：" + apdescs[1]).replace(/#\{value\}/g, "G@#" + aps[1]);
                                    }
                                    else if (aps[0] == "U") {
                                        valhtm += this.sharedliststring.replace(/#\{title\}/g, ""+this.i18n.shareUser+"'" + apdescs[1]).replace(/#\{info\}/g, "<b>"+this.i18n.user+"</b>：" + apdescs[1]).replace(/#\{value\}/g, "U@#" + aps[1]);
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
        this.qid("filterform").validate({
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
            placeholder: this.i18n.selectUserGroup,
            allowClear: true,
            ajax: {
                url: $.u.config.constant.smsqueryserver,
                dataType: "json",
                data: function (term, page) {
                    return {
                        tokenid: $.cookie("tokenid"),
                        method: "stdcomponent.getbysearch",
                        dataobject: "userGroup",
                        search: JSON.stringify({ "value": term })
                    };
                },
                results: function (data, page) {
                    if (data.success) {
                        return {
                            results: $.map(data.data.aaData, function (group, idx) {
                                group.text = group.name;
                                return group;
                            })
                        };
                    }
                }
            }
        });
        this.qid("shareduserlist").select2({
            width: 200,
            placeholder: this.i18n.selectUser,
            allowClear: true,
            ajax: {
                url: $.u.config.constant.smsqueryserver,
                dataType: "json",
                data: function (term, page) {
                    return {
                        tokenid: $.cookie("tokenid"),
                        method: "stdcomponent.getbysearch",
                        dataobject: "user",
                        search: JSON.stringify({ "value": term })
                    };
                },
                results: function (data, page) {
                    if (data.success) {
                        return {
                            results: $.map(data.data.aaData, function (user, idx) {
                                user.text = user.username + "(" + user.fullname + ")";
                                return user;
                            })
                        };
                    }
                }
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
            var valhtm = this.sharedliststring.replace(/#\{title\}/g, this.i18n.shareToAll).replace(/#\{info\}/g, this.i18n.withShareToAll).replace(/#\{value\}/g, "ALL");
            var v = this.qid("shared").val();
            if (v == "ALL") {
                if (this.qid("sharedlist").children("[real='NULL']").length == 0) {
                    if (this.qid("sharedlist").children("[real='ALL']").length == 1) {
                        var itm = this.qid("sharedlist").children().first();
                        // 两遍，才能变回来
                        itm.toggle("highlight").toggle("highlight");
                    }
                    else {
                        if (confirm(this.i18n.clear)) {
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
                    var valhtm = this.sharedliststring.replace(/#\{title\}/g, ""+this.i18n.ShareToUserGroup+"'" + data.name + "'"+this.i18n.member+"").replace(/#\{info\}/g, "<b>"+this.i18n.userGroup+"</b>：" + data.name).replace(/#\{value\}/g, "G@#" + data.id);
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
                    var valhtm = this.sharedliststring.replace(/#\{title\}/g, ""+this.i18n.shareUser+"'" + data.username + "(" + data.fullname + ")'").replace(/#\{info\}/g, "<b>"+this.i18n.user+"</b>：" + data.username + "(" + data.fullname + ")").replace(/#\{value\}/g, "U@#" + data.id);
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
        if (!this.qid("charnelThose").hasClass("star")) {
            this.qid("charnelThose").addClass("star");
        }
        this.qid("sharedlist").empty();
        this.qid("sharedlist").append(this.emptysharedliststring);
        this.qid("shared").val("ALL");
    },
    open: function (userdata) {
        var dialogOptions = null;
        this.editFilterData = userdata;
        if (this.editFilterData && this.editFilterData.id) {
            this.mode = "EDIT";
            dialogOptions = {
                title: this.i18n.editFilter + this.editFilterData.name,
                buttons: [
                    {
                        text: this.i18n.save,
                        click: this.proxy(function (e) {
                            if (this.qid("filterform").valid()) {
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
                                    "dataobject": "filtermanager",
                                    "dataobjectid": this.editFilterData.id,
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
                if (this.mode == "EDIT") {
                    this.on_submit(this.editFilterData.id);
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


com.sms.filter.filterDialog.widgetjs = ['../../../uui/widget/select2/js/select2.min.js'
    , "../../../uui/widget/spin/spin.js"
    , "../../../uui/widget/jqblockui/jquery.blockUI.js"
    , "../../../uui/widget/ajax/layoutajax.js", '../../../uui/widget/validation/jquery.validate.js'];
com.sms.filter.filterDialog.widgetcss = [{ path: "../../../uui/widget/select2/css/select2.css" }, { path: "../../../uui/widget/select2/css/select2-bootstrap.css" }];
