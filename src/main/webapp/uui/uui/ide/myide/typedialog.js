//@ sourceURL=uui.ide.myide.typedialog
$.u.define('uui.ide.myide.typedialog', null, {
    init: function (treeNode, mode) {
        this.mode = mode ? mode : "ADD";
        this.treeNode = treeNode;
    },
    afterrender: function () {
        $.validator.addMethod("regex", function (value, element, regexpr) {
            return regexpr.test(value);
        }, "");
        this.dialog = this.$.dialog({
            width: 700,
            modal: true,
            draggable: false,
            resizable: false,
            autoOpen: false,
            create: this.proxy(function () {

            }),
            open: this.proxy(function () {
                var filepath = $.u.ide_getFolderPath(this.treeNode);
                this.qid("filepath").val(filepath);
                if (this.mode == "ADD") {
                } else if (this.mode == "EDIT") {
                    this.qid("name").val(this.treeNode.name);
                }
                this.qid("radiogroup").off("click", "input").on("click", "input", this.proxy(function (e) {
                    if ($(e.currentTarget).val() == "img") {
                        this.qid("imgfile").closest(".control").show();
                        this.qid("name").closest(".control").hide();
                    }
                    else {
                        this.qid("imgfile").closest(".control").hide();
                        this.qid("name").closest(".control").show();
                    }
                }));
                this.$.children().first().validate({
                    rules: {
                        name: { "required": true, regex: /^[a-zA-Z]{1,20}$/ },
                        imgfile: "required"
                    },
                    messages: {
                        name: { "required": "名称不能为空", regex: "1-20位字母" },
                        imgfile: "必须要有上传文件"
                    },
                    errorClass: "text-danger",
                    errorElement: "div",
                    ignore: ":not(:visible)"
                });
            }),
            close: this.proxy(function () {
                this.clearForm();
                this.destroy();
            })
        });
    },
    /*
    * 清空表单
    */
    clearForm: function () {
        this.qid("name").val("");
        this.qid("radiogroup").children().first().children().first().trigger("click");
        this.qid("imgfile").val("");
        this.qid("imgfile").closest(".control").hide();
    },
    open: function () {
        var dialogOptions = null;
        if (this.mode == "ADD") {
            dialogOptions = {
                title: "创建新文件",
                buttons: [
                    {
                        text: "创建",
                        click: this.proxy(function (e) {
                            if (this.$.children().first().valid()) {
                                $.u.ajax({
                                    url: $.u.config.constant.addfile,
                                    type: "post",
                                    dataType: "json",
                                    cache: false,
                                    contentType: false,
                                    processData: false,
                                    data: new FormData(this.$.children().first()[0])
                                },this.$.parent()).done(this.proxy(function (result) {
                                    if (result.success) {
                                        var nm = this.qid("name").val();
                                        if (nm == "") {
                                            nm = this.qid("imgfile").val().split('/').pop().split('\\').pop();
                                        }
                                        this.on_submit(nm);
                                        this.dialog.dialog("close");
                                    } else {
                                        $.u.alert.error(result.reason);
                                    }
                                })).fail(this.proxy(function (jqXHR, errorText, errorThrown) {
                                }));
                            }
                        })
                    },
                    {
                        text: "取消",
                        "class": "aui-button-link",
                        click: this.proxy(function () {
                            this.dialog.dialog("close");
                        })
                    }
                ]
            };

        }
        else {
            dialogOptions = {
                title: "编辑：" + this.treeNode.name,
                buttons: [
                    {
                        text: "更新",
                        click: this.proxy(function (e) {
                            if (this.qid("dashform").valid()) {
                                if (this.$.children().first().valid()) {

                                }
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
                                    "dataobjectid": this.treeNode.id,
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
                        text: "取消",
                        "class": "aui-button-link",
                        click: this.proxy(function () {
                            this.dialog.dialog("close");
                        })
                    }
                ]
            };
        }
        this.dialog.dialog("option", dialogOptions).dialog("open");
    },
    on_submit: function () {

    },
    destroy: function () {
        this.dialog.dialog("destroy").remove();
        this._super();
    },
    resize: function () {

    }
}, { usehtm: true, usei18n: false });


uui.ide.myide.typedialog.widgetjs = ["../../../uui/widget/spin/spin.js"
    , "../../../uui/widget/jqblockui/jquery.blockUI.js"
    , "../../../uui/widget/ajax/layoutajax.js", '../../../uui/widget/validation/jquery.validate.js'];
uui.ide.myide.typedialog.widgetcss = [];
