"use strict";
//@ sourceURL=com.sms.detailmodule.shel.analysis
$.u.define('com.sms.detailmodule.shel.analysis', null, {
    init: function(option) {
        /** option结构
         ** {
         **    activity: 0
         ** }
         **/
        this._options = option || {};
        this.editable=this._options.editable;
        this._COMPLETE = "COMPLETE";
        this._state=this._options.statusCategory;
    },
    afterrender: function(bodystr) {
    	this.editID=[];
        this.i18n = com.sms.detailmodule.shel.analysis.i18n;
        this.$btnAdd = this.qid("btn_add");
        this.$analysisContainer = this.qid('analysis-container');
        this.$analysisWidgetTemplate = this.qid('analysis-widget-template');

        if (this._state==this._COMPLETE || this.editable==false) {
            this.$btnAdd.remove();
        } else {
            this.$btnAdd.click(this.proxy(this.on_addAnalysis_click));
            this.$analysisContainer.on("click", ".remove-analysis", this.proxy(this.on_removeAnalysis_click));
            this.$analysisContainer.on("click", ".edit-analysis", this.proxy(this.on_editAnalysis_click));
            this.$analysisContainer.on("click", ".copy-analysis", this.proxy(this.on_copyAnalysis_click));
        }

        this._drawEventAnalysisList(this._options.eventAnalysises || []);
    },
    /**
     * @title 添加“事件分析”
     */
    on_addAnalysis_click: function(e) {
        var $this = $(e.currentTarget),
            id = parseInt($this.attr("data-id"));
        if (!this.analysisDialog) {
            var clz = $.u.load("com.sms.detailmodule.shel.analysisDialog");
            this.analysisDialog = new clz(this.$.find("div[umid=analysisDialog]"), {
                activity: this._options.activity
            });
        }
            this.analysisDialog.override({
                "on_afterSave": this.proxy(function(actionItem) {
                    $.u.ajax({
                        url: $.u.config.constant.smsmodifyserver,
                        type: "post",
                        data: {
                            tokenid: $.cookie("tokenid"),
                            method: "saveOrUpdateEventAnalysis",
                            dataobject:"actionItem",
                            obj: JSON.stringify(actionItem)
                        },
                        dataType: "json"
                    }, this.analysisDialog.analysisDialog.parent()).done(this.proxy(function(response) {
                        if (response.success) {
                            this.loadEventAnalysisById(response.data);
                            this.analysisDialog.analysisDialog.dialog("close");

                        }
                    }));
                })
            });
        
        this.analysisDialog.open();
    },
    /**
     * @title 删除“事件分析”
     */
    on_removeAnalysis_click: function(e) {
        var $this = $(e.currentTarget),
            id = parseInt($this.attr("data-id"));
        $.u.load("com.sms.common.stdcomponentdelete");
        (new com.sms.common.stdcomponentdelete({
            body: "<div>" +
                "<div class='alert alert-warning'>" +
                "<span class='glyphicon glyphicon-exclamation-sign'></span>" + this.i18n.removeDialog.content +
                "</div>" +
                "</div>",
            title: this.i18n.removeDialog.content,
            dataobject: "eventAnalysis",
            dataobjectids: JSON.stringify([id])
        })).override({
            refreshDataTable: this.proxy(function() {
                var $analysisHeader = $this.parents("table.analysis-header");
                $analysisHeader.add($analysisHeader.next()).remove();
                $.u.alert.success(this.i18n.messages.removeSuccess);
            })
        });
    },

    /**
     * @title 编辑“事件分析”
     */
    on_editAnalysis_click: function(e) {
        var $this = $(e.currentTarget),
            data = $this.data("data");
            data.mode = "edit";
            // data.actionItemId = 
        if (!this.analysisDialog) {
            var clz = $.u.load("com.sms.detailmodule.shel.analysisDialog");
            this.analysisDialog = new clz(this.$.find("div[umid=analysisDialog]"), {
                data:data
            });
            
        }
        this.analysisDialog.override({
                "on_afterSave": this.proxy(function(actionItem) {
                    var eventAnalysisId = actionItem.actionItemId;
                    $.u.ajax({
                        url: $.u.config.constant.smsmodifyserver,
                        type: "post",
                        data: {
                            tokenid: $.cookie("tokenid"),
                            method: "saveOrUpdateEventAnalysis",
                            dataobject: 'actionItem',
                            dataobjectid: actionItem.actionItemId,
                            obj: JSON.stringify(actionItem.data)
                        },
                        dataType: "json"
                    }, this.analysisDialog.analysisDialog.parent()).done(this.proxy(function(response) {
                        if (response.success) {
                            this.loadEventAnalysisById(response.data);
                            this.analysisDialog.analysisDialog.dialog("close");
                        }
                    }));
                })
            });
        this.analysisDialog.open($.extend(this._options, data || {}));
    },
    
    /**
     * @title 复制“事件分析”
     */
    on_copyAnalysis_click: function(e) {
        var $this = $(e.currentTarget),
            data = $this.data("data");
        var copyData = {},confirmMan = [] ,organizations = [];
        confirmMan.push(data.actionItem.confirmMan[0].id);
        organizations.push(data.actionItem.organizations[0].id);
         copyData.defectType = data.defectTypeId;
         copyData.activity = this._options.activity;
         copyData.defectAnalysis = data.defectAnalysis;
         copyData.measureType = data.measureTypeId;
         copyData.actionItem = {
        		 description: data.actionItem.description,
        		 completionDeadLine: data.actionItem.completionDeadLine,
        		 confirmMan:confirmMan,
        		 organizations:organizations
        		 
         }
            $.u.ajax({
                url: $.u.config.constant.smsmodifyserver,
                type: "post",
                data: {
                    tokenid: $.cookie("tokenid"),
                    method: "saveOrUpdateEventAnalysis",
                    dataobject:"actionItem",
                    obj: JSON.stringify(copyData)
                },
                dataType: "json"
            }).done(this.proxy(function(response) {
                if (response.success) {
                    this.loadEventAnalysisById(response.data);

                }
            }));
           
 
    },
    /**
     * @title 根据id加载事件分析
     * @param {string} id
     */
    loadEventAnalysisById: function(id) {
        $.u.ajax({
            url: $.u.config.constant.smsqueryserver,
            type: "post",
            data: {
                tokenid: $.cookie("tokenid"),
                method: "stdcomponent.getbysearch",
                dataobject: 'eventAnalysis',
                rule:"[[{key:id,value:"+id+"}]]"
                
            },
            dataType: "json"
        }, this.$analysisContainer).done(this.proxy(function(response) {
            if (response.success) {
            	response.data=response.data.aaData[0];
                this._drawEventAnalysis(response.data);
            }
        }));
    },
    /**
     * @title 填充事件分析列表
     * @param {Array} items 事件分析集合
     */
    _drawEventAnalysisList: function(items) {
        this.$analysisContainer.empty();
        if (items.length > 0) {
            $.each(items, this.proxy(function(idx, item) {
                this._drawEventAnalysis(item);
            }));
        }
    },
    /**
     * @title 绘制事件分析
     * @param {object} data 事件分析
     */
    _drawEventAnalysis: function(data) {
    	if($.inArray(data.id,this.editID)==-1){ //编辑前后的判断
    		this.editID.push(data.id);
        var $analysisWidget = this.$analysisWidgetTemplate.clone().children().appendTo(this.$analysisContainer);
        $analysisWidget.find('.remove-analysis').attr('data-id', data.id);
        $analysisWidget.find('.edit-analysis').attr('data-id', data.id);
        $analysisWidget.find('.edit-analysis').attr('data-actionItemId', data.actionItemId);
        $analysisWidget.find('.edit-analysis').data('data', data);
        $analysisWidget.find('.copy-analysis').attr('data-id', data.id);
        $analysisWidget.find('.copy-analysis').attr('data-actionItemId', data.actionItemId);
        $analysisWidget.find('.copy-analysis').data('data', data);
        $analysisWidget.find('td[data-field=defectType]').text(data.defectType);
        $analysisWidget.find('td[data-field=defectAnalysis]').text(data.defectAnalysis);
        $analysisWidget.find('td[data-field=measureType]').text(data.measureType);
        /**
         *  @title shel 分析添加行动项链接处理
         */
        var actionTtem_description="";
        if(data.actionItem){
        	if(data.actionItem.status=="草稿"){
            	actionTtem_description=data.actionItem.description;
            }else{
            	actionTtem_description="<a href=/sms/uui/com/audit/validate/RiskValidate.html?title="+ escape(data.actionItem.description.length > 40 ? data.actionItem.description.substring(0,40):data.actionItem.description)+"&&id="+data.actionItem.id+" target='_blank' >"+data.actionItem.description+"</a>";
            }
        }
        $analysisWidget.find('td[data-field=description]').html(actionTtem_description);
        if(data.actionItem && data.actionItem.organizations!=null){
        $analysisWidget.find('td[data-field=organizations]').text($.map(data.actionItem.organizations, function(org, index) {
            return org.name;
        }).join(','));
        }else{
            $analysisWidget.find('td[data-field=organizations]').text("");
            
        };
        if(data.actionItem){
        	 $analysisWidget.find('td[data-field=deadline]').text(data.actionItem.completionDeadLine || "");
        }else{
        	$analysisWidget.find('td[data-field=deadline]').text("");
        }
        if(data.actionItem && data.actionItem.organizations!=null){
        	 $analysisWidget.find('td[data-field=confirmMan]').text($.map(data.actionItem.confirmMan || [], function(user, idx) {
                 return user.fullname;
             }).join(','));	
        }else{
       	 $analysisWidget.find('td[data-field=confirmMan]').text("");
        }
        /**
         * @title 添加状态
         */
        if(data.actionItem){
        	$analysisWidget.find('td[data-field=status]').text(data.actionItem.status);	
        }else{
        	$analysisWidget.find('td[data-field=status]').text("");	
        }
    	}else{
    		for(var i=0;  i<this.$analysisContainer.children("table").length; i++){
    			if($(this.$analysisContainer.children("table")[i]).find('.edit-analysis').attr("data-id")==data.id){
    				var $$analysisWidget=$(this.$analysisContainer.children("table")[i]).find('.edit-analysis').parents("table").next();
    				    $$analysisWidget.prev().find('.remove-analysis').attr('data-id', data.id);
    			        $$analysisWidget.prev().find('.edit-analysis').attr('data-id', data.id);
    			        $$analysisWidget.prev().find('.edit-analysis').attr('data-actionItemId', data.actionItemId);
    			        $$analysisWidget.prev().find('.edit-analysis').data('data', data);
    			        $$analysisWidget.prev().find('.copy-analysis').attr('data-id', data.id);
    			        $$analysisWidget.prev().find('.copy-analysis').attr('data-actionItemId', data.actionItemId);
    			        $$analysisWidget.prev().find('.copy-analysis').data('data', data);
    			        $$analysisWidget.find('td[data-field=defectType]').text(data.defectType);
    			        $$analysisWidget.find('td[data-field=defectAnalysis]').text(data.defectAnalysis);
    			        $$analysisWidget.find('td[data-field=measureType]').text(data.measureType);
    			        var actionTtem_description="";
    			        if(data.actionItem){
    			        	 if(data.actionItem.status=="草稿"){
    	    			        	actionTtem_description=data.actionItem.description;
    	    			        }else{
    	    			        	actionTtem_description="<a href=/sms/uui/com/audit/validate/RiskValidate.html?title="+data.actionItem.description+"&&id="+data.actionItem.id+" target='_blank' >"+data.actionItem.description+"</a>";
    	    			        }
    			        }
    			        $$analysisWidget.find('td[data-field=description]').html(actionTtem_description || "");
    			        /**
    			         * @title 添加状态
    			         */
    			        if(data.actionItem){
    			        	 $$analysisWidget.find('td[data-field=status]').text(data.actionItem.status || "");
    			        }else{
    			        	 $$analysisWidget.find('td[data-field=status]').text("");
    			        }
    			       if(data.actionItem){
    			    	   $$analysisWidget.find('td[data-field=organizations]').text($.map(data.actionItem.organizations, function(org, index) {
       			            return org.name;
       			        }).join(',') || "");   
    			       }else{
    			    	   $$analysisWidget.find('td[data-field=organizations]').text("");   
    			       
    			       };
    			        if(data.actionItem){
    			        	$$analysisWidget.find('td[data-field=deadline]').text(data.actionItem.completionDeadLine || "");	
    			        }else{
    			        	$$analysisWidget.find('td[data-field=deadline]').text("");	
    			        }
    			        
    			        if(data.actionItem && data.actionItem.confirmMan!=null){
    			        	$$analysisWidget.find('td[data-field=confirmMan]').text($.map(data.actionItem.confirmMan || [], function(user, idx) {
        			            return user.fullname;
        			        }).join(',') || "");	
    			        }else{
    			        	$$analysisWidget.find('td[data-field=confirmMan]').text("");	
    			        
    			        };
    			        
    			}
    		}
    	}
        if (this._state==this._COMPLETE || this.editable==false) {
            $analysisWidget.find(".remove-analysis").removeClass('operate-tool').empty();
            $analysisWidget.find(".edit-analysis").removeClass('operate-tool').remove();
            $analysisWidget.find(".copy-analysis").removeClass('operate-tool').remove();
        }
    },
    destroy: function() {
        this._super();
    }
}, {
    usehtm: true,
    usei18n: true
});

com.sms.detailmodule.shel.analysis.widgetjs = [
    "../../../../uui/widget/spin/spin.js",
    "../../../../uui/widget/jqblockui/jquery.blockUI.js",
    "../../../../uui/widget/ajax/layoutajax.js"
];
com.sms.detailmodule.shel.analysis.widgetcss = [];
