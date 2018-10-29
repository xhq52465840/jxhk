//@ sourceURL=com.sms.detailmodule.assignment
/**
 * “任务分配”列表
 * @author tchen@usky.com.cn
 * @date 2016/11/21
 */
$.u.define('com.sms.detailmodule.assignment', null, {
    init: function (option) {
    	this._options = option || {};
    	this._PUBLISHED = "Y";
        this._UNPUBLISHED = "N";
       this.editable=this._options.editable;
        this._TR_TEMPLATE = "<tr data-id='#{id}' data-publish='#{arePublished}'>" + 
                                "<td>#{orgName}</td>" +
                                "<td>#{arePublishedLabel}</td>" +
                                "<td>" +
                                    "<button class='btn btn-link btn-sm #{buttonClassName}' style='padding-left: 0px;' data-activity='#{activityId}' data-org='#{orgId}' data-id='#{id}' >#{publishButton}</button>" +
                                    "<i class='fa fa-trash-o fa-lg remove-button uui-cursor-pointer'  data-id='#{id}' ></i>" +
                                "</td>" +
                            "</tr>";
    },
    afterrender: function (bodystr) {
    	this.i18n = com.sms.detailmodule.assignment.i18n;
    	this.btnAssign = this.qid( "btn_assign" );
    	this.btnAdd = this.qid( "btn_add" );
    	this.btnStartAnalysis = this.qid( "btn_startAnalysis" );
    	this.table = this.qid( "table" );
        this.tbody = this.table.find( "tbody" );
    	
        if(this.editable == false){
            this.btnAssign.add(this.btnAdd).add(this.btnStartAnalysis).remove();
        }else{
            this.btnAssign.click(this.proxy(this.on_assign_click));
            this.btnAdd.click(this.proxy(this.on_addOrg_click));
            this.btnStartAnalysis.click(this.proxy(this.on_startAnalysis_click));
            this.tbody.on("click", ".publish-button", this.proxy(this.on_publish_click));
            this.tbody.on("click", ".return-button", this.proxy(this.on_return_click));
            this.tbody.on("click", ".remove-button", this.proxy(this.on_remove_click));
        }

        this._fillTable(this._options.assignment || []);
    },
    /**
     * @title “是否分配任务”复选框事件
     * @desc 选中“是否分配任务”时，隐藏右侧“开始分析”按钮，取消“是否分配任务”时，会将已添加的任务清空。
     */
    on_assign_click: function(e){
    	if( !this.btnAssign.hasClass( "fa-square-o" ) ){ // change unchecked
            if(this.tbody.children("tr[data-publish=" + this._PUBLISHED + "]").length > 0){
                $.u.alert.warn(this.i18n.messages.hasPublished, 1000 * 3);
                return;
            }
            if(this.tbody.children("tr").length === 0){
                this.btnAdd.add( this.btnStartAnalysis ).add( this.table ).toggleClass( "hidden" );
                this.btnAssign.toggleClass( "fa-square-o" );
                return;
            }
    		 this.removeDialog = $("<div>" + this.i18n.dialog.areAssignentTaskContent + "</div>").dialog({
                title:this.i18n.dialog.areAssignentTaskTitle,
                width:540,
                modal:true,
                resizable:false,
                buttons:[
                 {
                     text: this.i18n.dialog.buttons.ok,
                     click: this.proxy(function(e){
                         $(e.currentTarget).add($(e.currentTarget).next()).button("disable");
                         $.u.ajax({
                             url: $.u.config.constant.smsmodifyserver,
                             dataType: "json",
                             type: "post",
                             data: {
                                "tokenid": $.cookie("tokenid"),
                                "method": "stdcomponent.delete",
                                "dataobject": "riskTask",
                                "dataobjectids": JSON.stringify($.map(this.tbody.children("tr"), function(tr, idx){
                                    return $(tr).attr("data-id");
                                }))
                             }
                         },this.removeDialog.parent(),{ size: 1,backgroundColor:'transparent', selector:$(e.currentTarget).parent(), orient: "west" }).done(this.proxy(function(response){
                             if(response.success){
                                this.removeDialog.dialog("close");
                                this.tbody.empty();
                                this.btnAdd.add( this.btnStartAnalysis ).add( this.table ).toggleClass( "hidden" );
                                this.btnAssign.toggleClass( "fa-square-o" );
                             }else{
                                 $(e.currentTarget).add($(e.currentTarget).next()).button("enable");
                             }
                         })).fail(this.proxy(function(jqXHR,errorText,errorThrown){
                             $(e.currentTarget).add($(e.currentTarget).next()).button("enable");
                         }));
                     })
                 },
                 {
                     text: this.i18n.dialog.buttons.cancel,
                     "class":"aui-button-link",
                     click:this.proxy(function(){
                         this.removeDialog.dialog("close");
                     })
                 }
                ],
                close:this.proxy(function(){
                    this.removeDialog.dialog("destroy").remove();
                })
            });
    	}else{
            this.btnAdd.add( this.btnStartAnalysis ).add( this.table ).toggleClass( "hidden" );
            this.btnAssign.toggleClass( "fa-square-o" );
        }
    },
    /**
     * @title 开始分析
     */
    on_startAnalysis_click: function(e){
        window.location.href = this.getabsurl("../risk/RiskDetail.html?mode=add&activityId=" + this._options.activity);
    },
    /**
     * @title 添加组织
     */
    on_addOrg_click: function(e){
    	if( !this.assignOrg ){
    		var clz = $.u.load( "com.sms.detailmodule.assignmentOrg" );
    		this.assignOrg = new clz( this.$.find( "div[umid=assignOrg]" ) );
    		this.assignOrg.override( {
    			"on_afterSave": this.proxy( function(org){
                    $.u.ajax({
                        url: $.u.config.constant.smsmodifyserver,
                        type: "post",
                        data: {
                            tokenid: $.cookie("tokenid"),
                            method: "stdcomponent.add",
                            dataobject: "riskTask",
                            obj: JSON.stringify( { 
                                "activity": this._options.activity, 
                                "organization": org.id,
                                "type" : this._UNPUBLISHED,
                                "sequence": this.tbody.children("tr").length ++
                            } )
                        },
                        dataType: "json"
                    }, this.assignOrg.orgDialog.parent()).done(this.proxy(function(response){
                        if(response.success){
                            this._drawTr({
                                "id": response.data,
                                "orgId": org.id,
                                "orgName": org.name,
                                "type": this._UNPUBLISHED
                            });
                            this.assignOrg.orgDialog.dialog("close");
                        }
                    }));
    			} )
    		} );
    	}
    	this.assignOrg.open();
    },
    /**
     * @title 发布任务
     */
    on_publish_click: function(e){
        var clz = null,
            $this = $(e.currentTarget),
            $tr = $this.closest('tr').addClass('selected'),
            id = parseInt($this.attr("data-id")),
            activity = parseInt($this.attr("data-activity")),
            org = parseInt($this.attr("data-org"));

        if (!this.assignPublish) {
            clz = $.u.load('com.sms.detailmodule.assignmentPublish');
            this.assignPublish = new clz(this.$.find('[umid=assignPublish]'), {
                activity: this._options.activity
            });
        }
        this.assignPublish.override({
            on_after_publish: this.proxy(function(userIds) {
                $.u.ajax({
                    url: $.u.config.constant.smsmodifyserver,
                    type: "post",
                    dataType: "json",
                    data: {
                        tokenid: $.cookie("tokenid"),
                        method: "publish",
                        activity: activity,
                        organization: org,
                        riskTask: id,
                        riskAnalysisPersons: JSON.stringify(userIds)
                    }
                }, this.assignPublish.publishDialog.parent()).done(this.proxy(function(response) {
                    if (response.success) {
                        $.u.alert.success(this.i18n.messages.success);
                        $this.removeClass('publish-button').addClass('return-button').text(this.i18n.buttons.republish).next().remove();
                        $this.parent().prev().text(this.i18n.columns.published);
                        $tr.removeClass('selected').attr("data-publish", "Y");
                        this.assignPublish.publishDialog.dialog("close");
                    }
                }));
            }),
            on_after_cancel: function() {
                $tr.removeClass('selected');
            }
        });
        this.assignPublish.open({
            orgId: org
        });
    },
    /**
     * @title 退回任务
     */
    on_return_click: function(e){
        var $this = $(e.currentTarget),
            id = parseInt($this.attr("data-id")),
            $tr = $this.closest('tr').addClass('selected'),
            activity = parseInt($this.attr("data-activity")),
            org = parseInt($this.attr("data-org")),
            clz = $.u.load("com.sms.common.confirm"),
            confirm = null;

        confirm = new clz({
            "body": this.i18n.messages.confirmReturn,
            "buttons": {
                "ok": {
                    "click": this.proxy(function() {
                        $.u.ajax({
                            url: $.u.config.constant.smsmodifyserver,
                            type: "post",
                            dataType: "json",
                            data: {
                                "tokenid": $.cookie("tokenid"),
                                "method": "publish",
                                "activity": activity,
                                "organization": org,
                                "riskTask": id
                            }
                        }, confirm.confirmDialog.parent()).done(this.proxy(function(response) {
                            if (response.success) {
                                $.u.alert.success(this.i18n.messages.success);
                                $tr.removeClass('selected');
                                confirm.confirmDialog.dialog("close");
                            }
                        }));
                    })
                },
                "cancel":{
                    "click": function(){
                        $tr.removeClass('selected');
                        confirm.confirmDialog.dialog("close");
                    }
                }
            }
        });
    },
    /**
     * @title 删除任务
     */
    on_remove_click: function(e){
        var $this = $(e.currentTarget), id = $this.attr("data-id"), $tr = $this.closest('tr').addClass('selected');

        $.u.load("com.sms.common.stdcomponentdelete");
        (new com.sms.common.stdcomponentdelete({
            body:"<div>"+
                    "<div class='alert alert-warning'>"+
                        "<span class='glyphicon glyphicon-exclamation-sign'></span>确认删除?"+
                    "</div>"+
                 "</div>",
            title: "确认删除",
            dataobject: "riskTask",
            dataobjectids:JSON.stringify([id])
        })).override({
            refreshDataTable:this.proxy(function(){
                $tr.remove();
            }),
            cancel: function(){
                $tr.removeClass('selected');
            }
        });  
    },
    /**
     * @title 绘制任务列表
     * @params {Array} items - 任务集合
     */
    _fillTable: function(items){
        this.tbody.empty();
        if(items.length > 0){
            this.btnAssign.trigger("click");
            this.table.removeClass("hidden");
            items.sort(function(x, y){
                return x.sequence > y.sequence;
            });
            $.each(items, this.proxy(function(idx, item){
                item.orgName = item.organization.path + "/" + item.organization.name;
                item.orgId = item.organization.id;
                this._drawTr(item);
            }));
        }
    },
    /**
     * @title 绘制任务行
     * @params {object} data - 任务
     */
    _drawTr: function(data){ 
        var $tr = $( this._TR_TEMPLATE.replace(/#\{orgId\}/g, data.orgId)
                                      .replace(/#\{orgName\}/g, data.orgName)
                                      .replace(/#\{activityId\}/g, this._options.activity)
                                      .replace(/#\{id\}/g, data.id)
                                      .replace(/#\{arePublishedLabel\}/g, this.i18n.columns[ data.type == this._UNPUBLISHED ? "unpublished" :  "published" ])
                                      .replace(/#\{arePublished\}/g, data.type)
                                      .replace(/#\{buttonClassName\}/g, data.type == this._UNPUBLISHED ? 'publish-button' : 'return-button')
                                      .replace(/#\{publishButton\}/g, this.i18n.buttons[ data.type == this._UNPUBLISHED ? "publish" : "republish" ]) ).appendTo( this.tbody );
        
        if(data.type == this._PUBLISHED){
            $tr.find(".remove-button").remove();
        }
        if(this.editable == false){
            $tr.find(".publish-button, .return-button, .remove-button").remove();
        }
    },
    destroy: function () {
    	this._super(); 
    }
}, { usehtm: true, usei18n: true });


com.sms.detailmodule.assignment.widgetjs = ["../../../uui/widget/spin/spin.js", 
                                            "../../../uui/widget/jqblockui/jquery.blockUI.js",
                                            "../../../uui/widget/ajax/layoutajax.js"];
com.sms.detailmodule.assignment.widgetcss = [];