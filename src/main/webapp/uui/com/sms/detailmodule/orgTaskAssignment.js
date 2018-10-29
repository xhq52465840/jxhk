//@ sourceURL=com.sms.detailmodule.orgTaskAssignment
/**
 * “任务分配”列表
 * @author hou.ws@usky.com.cn
 * @date 2017/07/13
 */
$.u.define('com.sms.detailmodule.orgTaskAssignment', null, {
    init: function (option) {
    	
    	this._options = option || {};
    	this._PUBLISHED = "Y";
        this._UNPUBLISHED = "N";
       this.editable=this._options.editable;
       this.roleIds = this._options.roleIds;
        this._TR_TEMPLATE = "<tr style='background-color:#{colour}' data-id='#{id}'>" + 
                                "<td>#{orgName}</td>" +
                                "<td>#{operator}</td>" +
                                "<td>#{status}</td>" +
                                "<td>" +
                                    "<span class='btn btn-link btn-sm' style='padding-left: 0px;'><a href='"+this.getabsurl("../search/activity.html?activityId=#{id}'")+">查看<a></span>" +
                                    "<i class='fa fa-trash-o fa-lg remove-button uui-cursor-pointer'  data-id='#{id}' ></i>" +
                                "</td>" +
                               "</tr>";
    },
    afterrender: function (bodystr) {
    	this.i18n = com.sms.detailmodule.orgTaskAssignment.i18n;
    	this.btnAssign = this.qid( "btn_assign" );
    	this.btnAdd = this.qid( "btn_add" );
    	this.btnStartAnalysis = this.qid( "btn_startAnalysis" );
    	this.table = this.qid( "table" );
        this.tbody = this.table.find( "tbody" );
        this.selectMan = this.qid("selectMan");
        this.tbody.on("click", ".publish-button", this.proxy(this.on_publish_click));
        this.tbody.on("click", ".return-button", this.proxy(this.on_return_click));
        this.tbody.empty();
        if(this.editable){
        	this.btnAdd.click(this.proxy(this.on_addOrg_click));
        	this.tbody.on("click", ".remove-button", this.proxy(this.on_remove_click));
        }
        this._options.assignments && $.each(this._options.assignments,this.proxy(function(index,item){
        	this._drawTr(item);
        }))
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
                    /**
                     * @int 关闭组织选择
                     */
                    this.assignOrg.orgDialog.dialog("close");
    				var ids = [];
                    ids.push(org.id);
                    /**
                     * @int 开启选人模式
                     */
    				if(this.chhooseManDialog == null){
    				this.chooseManDialog=this.qid("chooseMan").removeClass("hidden").dialog({
    					"title":"选择处理人",
    					 width: 520,
    	                 modal: true,
    	                
    	                 resizable: false,
    	                 autoOpen: false,
    	                 create:this.proxy(function(){
    	                	 
    	                 }),
    	                 open:this.proxy(function(){
    	                	 this.selectMan.select2({
    	                         width: 300,
    	                         multiple: true,
    	                         ajax: {
    	                             url: $.u.config.constant.smsqueryserver,
    	                             type: "post",
    	                             data: this.proxy(function(term, page) {
    	                                 return {
    	                                     "tokenid": $.cookie("tokenid"),
    	                                     "method": "getDistributedActivityProcessors",
    	                                     "dataobject": "dictionary",
    	                                     "roleIds":JSON.stringify(this.roleIds),
    	                                      orgIds:JSON.stringify(ids),
    	                                     "term":term,
    	                                     
    	                                 };
    	                             }),
    	                             results: this.proxy(function(response, page) {
    	                                 if (response.success) {
    	                                     return {
    	                                         "results": response.data.aaData,
    	                                         "more": response.data.iTotalRecords > (page * this._SELECT2_PAGE_LENGTH)
    	                                     };
    	                                 } else {
    	                                     $.u.alert.error(response.reason, 1000 * 3);
    	                                 }
    	                             })
    	                         },
    	                         formatSelection: function(item) {
    	                             return item.displayName;
    	                         },
    	                         formatResult: function(item) {
    	                             return item.displayName;
    	                         }
    	                     })
    	                 }),
    	                 close:this.proxy(function(){
    	                	this.selectMan.select2("data",""); 
    	                 }),
    	                 buttons:[{
    	                	   "text":"确定",
    	                	   "class": "aui-button-link",
    	                	   "click":this.proxy(function(e){
    	                		   if(this.selectMan.select2("data").length > 0){
    	                			   $(e.target).parents(".ui-dialog-buttonset").find("button").attr('disabled',true);
        	                		   $(e.target).parent("button").attr('disabled',true);
        	                		   $(e.target).parent("button").attr("disabled","disabled");
                                     this.selectManid = [];
                                     this.selectMan.select2("data") && $.each(this.selectMan.select2("data"),this.proxy(function(idx,item){
                                    	 this.selectManid.push(item.id);
                                     }));
        	                           $.u.ajax({
        	                               url: $.u.config.constant.smsmodifyserver,
        	                               type: "post",
        	                               data: {
        	                                   tokenid: $.cookie("tokenid"),
        	                                   method: "distributeActivityThroughDept",
        	                                   id: this._options.activity,
        	                                   orgIds: JSON.stringify(ids),
        	                                   userIds:JSON.stringify(this.selectManid)
        	                               },
        	                               dataType: "json"
        	                           }, this.assignOrg.orgDialog.parent()).done(this.proxy(function(response){
        	                               if(response.success){
        	                            	   $(e.target).parents(".ui-dialog-buttonset").find("span").hide();
        	                            	   $.u.alert.success("操作成功");
        	                            	  this.chooseManDialog.dialog("close");
        	                               	  this.tbody.empty();
        	                               	$.each(response.data.activities,this.proxy(function(index,item){
        	                               		this._drawTr(item);
        	                               	}));
        	                               
        	                               }
        	                           }));
    	                		   }else{
    	                			   $.u.alert.eror("请选择处理人");
    	                		   }
    	                	   })
    	                        },
    	                        {
		    	    	       "text":"取消",
		    	    	       "class": "aui-button-link",
		    	    	       "click":this.proxy(function(){
		    	    	             this.chooseManDialog.dialog("close");   		   
            	                })
    	    	                 }
    	                 ]
    				})
    				};
    				this.chooseManDialog.dialog("open");
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
            dataobject: "activity",
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
     * @title 绘制任务行
     * @params {object} data - 任务
     */
    _drawTr: function(data){ 
    	data.activityProcessors="";
    	 for(i in data.processors){
    			 data.activityProcessors +=data.processors[i].fullname + '&nbsp&nbsp';
    	 }
    	 data.colour = data.dealNoticeSign == true ? "#FFFF06" : '';
        var $tr = $( this._TR_TEMPLATE.replace(/#\{orgId\}/g, data.orgid)
        		                       .replace(/#\{colour\}/g, data.colour)
                                      .replace(/#\{orgName\}/g, data.organization)
                                      .replace(/#\{activityId\}/g, this._options.activity)
                                      .replace(/#\{operator\}/g, data.activityProcessors)
                                      .replace(/#\{status\}/g, data.status.name)
                                      .replace(/#\{id\}/g, data.id)).appendTo( this.tbody );
        
    },
    destroy: function () {
    	this._super(); 
    }
}, { usehtm: true, usei18n: true });


com.sms.detailmodule.orgTaskAssignment.widgetjs = [  "../../../uui/widget/spin/spin.js", 
                                                    "../../../uui/widget/jqblockui/jquery.blockUI.js",
                                                     "../../../uui/widget/ajax/layoutajax.js"];
com.sms.detailmodule.orgTaskAssignment.widgetcss = [];