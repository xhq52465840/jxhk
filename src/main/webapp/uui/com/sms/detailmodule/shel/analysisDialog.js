﻿"use strict";
//@ sourceURL=com.sms.detailmodule.shel.analysisDialog
$.u.define('com.sms.detailmodule.shel.analysisDialog', null, {
    init: function(option) {
    	this.action=true;
        this._options = option || {};
        this.select2PageLength = 10; // select2每页显示条数
    },
    afterrender: function(bodystr) {
        this.i18n = com.sms.detailmodule.shel.analysisDialog.i18n;
        this.orgTreeWidget = null; // orgTree的uui组件
        this.$orgTreeContainer = null; // orgTree的div容器
        this.currentSelectOrgTreeNode = null; // 当前选中的组织书节点，用于关闭模态层时清除选中的节点
        this.$form = this.qid('form');
        this.$defectType = this.qid('defectType');
        this.$defectAnalysis = this.qid('defectAnalysis');
        this.$measureType = this.qid('measureType');
        this.$description = this.qid('description');
        this.$organizations = this.qid('organizations');
        this.$organizationIds = this.qid('organizationIds');
        this.$deadline = this.qid('deadline');
        this.$confirmMan = this.qid('confirmMan');
        /**
         * @title 树形
         */
        this.treeContent = this.qid("treeContent");
        this.analysisDialog = this.qid("analysisDialog").dialog({
            title: this.i18n.title,
            width: 540,
            modal: true,
            draggable: false,
            resizable: false,
            autoOpen: false,
            buttons: [{
                text: this.i18n.buttons.save,
                click: this.proxy(this.on_dialog_ok)
            }, {
                text: this.i18n.buttons.cancel,
                "class": "aui-button-link",
                click: this.proxy(this.on_dialog_cancel)
            }],
            create: this.proxy(this.on_dialog_create),
            open: this.proxy(this.on_dialog_open),
            close: this.proxy(this.on_dialog_close)
        });
        this.$defectType.on("click",this.proxy(function(e){
			var offset = $(e.target).offset(); 
			this.treeContent.css({left:103 + "px",
				                  top: 25+ "px",
				                  position:"absolute",
				                  zIndex:"999"
				                  }).slideDown("fast");
			$("body").bind("mousedown", this.proxy(this.onBodyDown));
    	}));
    },
    /**
     * @title 树形结构
     */
    onBodyDown:function(e){
    	if (!(e.target.id == (this._id+"-tree") || e.target.id == (this._id+"-treeContent") || $(e.target).parents("#"+this._id+"-treeContent").length>0)) {
			this.treeContent.fadeOut("fast");
			$("body").unbind("mousedown", this.proxy(this.onBodyDown));
		}
    },
    _getTree:function(){
    	var rule=[[{"key":"dictionary.type","value":"缺陷类型"}]];
    	var treeNodes=[];
	    $.ajax({
	    	url:$.u.config.constant.smsqueryserver,
	        type:"post",
	        dataType: "json",
	        cache: false,
	        async:false,
	        data: {
	        	"tokenid":$.cookie("tokenid"),
	    		"method":"stdcomponent.getbysearch",
	    		dataobject:"dictionaryGrade",
	    		rule:JSON.stringify(rule),
	        }
	    }).done(this.proxy(function(responseData){
	    	if(responseData.success){
				if(responseData){
					treeNodes = $.map(responseData.data.aaData,function(perm,idx){
						
							return {id : perm.dictionaryId,pId : perm.parentId,name : perm.dictionary};
						
        			});
				}
	    	}
	    })).fail(this.proxy(function(jqXHR,errorText,errorThrown){
	    	
	    }));
    	var setting = {
    			data: {
    				simpleData: {
    					enable: true
    				}
    			},
    			callback: {beforeClick:this.proxy(function(treeId, treeNode, clickFlag){
					
				}),
				onClick:this.proxy(function(treeId, treeNode, clickFlag){
					if(clickFlag.isParent==true){
						$.u.alert.error("不能选择此级节点");
						this.$defectType.val(null);
						this.$defectType.attr("value",null);
					}else{
						this.$defectType.val(clickFlag.name);
						this.$defectType.attr("value",clickFlag.id);
						this.treeContent.fadeOut("fast");
					}
				})
				},
    		};
    	this.tree = $.fn.zTree.init(this.qid("tree"), setting,treeNodes);
    	var nodes = this.tree.getNodes();
    	$.each(nodes,this.proxy(function(idx,node){
    		if(node.parentTId==null){
    			this.tree.expandNode(node, true, false, true);
    		}
    	}));
    	
    },
    /**
     * @title 模态层创建时执行
     */
    on_dialog_create: function() {
        var getDictionarySelect2Setting = this.proxy(function(type) {
            return this.generateSelect2SettingFactory({
                dataobject: 'dictionary',
                filterFields: ['name'],
                rule: [
                    [{
                        "key": "type",
                        "value": type
                    }]
                ],
                formatSelection: this.proxy(function(item) {
                	if(type=="措施类型"){
                		if(item.key=="NA"){
                    		this.action=false;
                    		this.$measureType.select2('data').key="NA";
                    		this.qid("Ymeasure").hide();
                    		this.qid("analysisDialog").css({height:"325px"});
                    	}else{
                    		this.qid("Ymeasure").show();
                    		this.qid("analysisDialog").css({height:"auto"});
                    	}
                	}
                    return item.name;
                }),
                formatResult: function(item) {
                    return item.name;
                }
            })
        });
        var userSelect2Setting = this.generateSelect2SettingFactory({
            ajaxData:function(term, page) {                
                return {
                    tokenid: $.cookie("tokenid"),
                    method: "getActionItemConfirmMen",
                    term: term,
                    start: (page - 1) * this.select2PageLength,
                    length: this.select2PageLength
                };
            },
            filterFields: ['username', 'fullname'],
            rule: [],
            formatSelection: function(item) {
                return "<img src='" + item.avatarUrl + "' width='16' height='16'/>&nbsp;" + item.fullname + "(" + item.username + ")";
            },
            formatResult: function(item) {
                return "<img src='" + item.avatarUrl + "' width='16' height='16'/>&nbsp;" + item.fullname + "(" + item.username + ")";
            }
        });
        var deadlineOption = {
            dateFormat: 'yy-mm-dd',
            minDate: 0,
            changeYear: false,
            changeMonth: false
        };
        var formValidateOption = this.generateFormValidateOptionFactory();
        this.$measureType.select2(getDictionarySelect2Setting('措施类型'));
        this.$confirmMan.select2(userSelect2Setting);
        this.$deadline.datepicker(deadlineOption);
        this.$form.validate(formValidateOption);
        this.$organizations.click(this.proxy(this.on_org_click));
        if(this.$measureType.select2('data') && this.$measureType.select2('data').key=="NA"){
    		delete this._options.actionItemId;
    	}
    },
    /**
     * @title 模态层打开时执行
     */
    on_dialog_open: function(option) {
        this.OPTION=option;
      
        //生成树
        this._getTree();
        
    },
    /**
     * @title 模态层关闭时执行
     */
    on_dialog_close: function() {
        this.clearFormData();
        this.$form.validate().resetForm();
    },
    /**
     * @title 分配事件
     */
    on_dialog_ok: function() {
        if (this.$form.valid()){
        	if(this.$measureType.select2('data') && this.$measureType.select2('data').key=="NA"){
        		delete this._options.actionItemId;
        	}
            this.on_afterSave(this.getFormData());
        }
    },
    /**
     * @title "取消"事件
     */
    on_dialog_cancel: function(e) {
        this.analysisDialog.dialog("close");
    },
    /**
     * @title 责任单位点击事件
     */
    on_org_click: function() {
        var orgContainerSelector = this._id + '-org-container',
            offset = this.$organizations.offset();

        if ($('#' + orgContainerSelector).length === 0) {
            this.$orgTreeContainer = $('<div/>', {
                id: orgContainerSelector,
                style: 'position: absolute; background: #efefef; border: 1px solid #efefef;height: 300px;overflow: auto;'
            }).appendTo('body');

            this.orgTreeWidget = this.createOrgTreeWidget($('<div/>', {
                umid: 'orgTree'
            }).appendTo(this.$orgTreeContainer));
        }

        this.$orgTreeContainer.css({
            width: this.$organizations.outerWidth(true),
            top: offset.top + this.$organizations.outerHeight(true),
            left: offset.left,
            zIndex: parseInt(this.analysisDialog.parent().css('zIndex')) + 1
        }).slideDown('fast');

        var mousedown = this.proxy(function(e) {
            if (!(e.target.id === this.$organizations.attr('id') || e.target.id === orgContainerSelector || e.target.id === this._id + '-org-label' || $(e.target).parents('#' + orgContainerSelector).length > 0)) {
                this.$orgTreeContainer.fadeOut('fast');
                $('body').off('mousedown', mousedown);
            }
        })
       $('body').on('mousedown', mousedown);
    },
    /**
     * @title 分配时调用，此事件用于被加载
     * @param {Array} units
     */
    on_afterSave: function(units) {
    	
    },
    /**
     * @title 创建组织树组件
     * @target 组件挂靠的dom节点
     * @return {object}
     */
    createOrgTreeWidget: function($target) {
        var clz = clz = $.u.load('com.sms.plugin.organization.orgTree');
        return new clz($target, {
        	type:"shel",
            activity: this._options.activity,
            treeOption: {
                async: {
                    dataFilter: function(treeId, parentNode, responseData) {
                        return $.map(responseData.data.aaData, function(item, idx) {
                            return {
                                id: item.id,
                                pId: item.parentId,
                                name: item.name,
                                nocheck: !item.isSpecifyUnit
                            };
                        });
                    }
                },
                callback: {
                    onCheck: this.proxy(function(e, treeId, treeNode) {
                        if (treeNode.checked) {
                            this.currentSelectOrgTreeNode = treeNode;
                            this.$organizations.val(treeNode.name);
                            this.$organizationIds.val(treeNode.id);
                            this.$orgTreeContainer.fadeOut("fast");
                        }
                    }),
                    beforeAsync: this.proxy(function() {
                        $('<div class="text-center loading-text" />').text(this.i18n.loading).appendTo(this.$orgTreeContainer);
                    }),
                    onAsyncSuccess: this.proxy(function() {
                        this.$orgTreeContainer.find('.loading-text').text('');
                    })
                }
            }
        });
    },
    /**
     * @title 生成select2的option
     * @param {object} params {dataobject:'实体类',filterFields:'模糊搜索的字段',rule:'固定的筛选条件',formatSelection:'下拉时渲染回调',formatResult:'选中结果渲染回调'}
     * @return {object}
     */
    generateSelect2SettingFactory: function(params) {
        params.rule = params.rule || [];
        return {
            width: '100%',
            ajax: {
                url: $.u.config.constant.smsqueryserver,
                dataType: "json",
                type: "post",
                data: this.proxy(params.ajaxData || function(term, page) {
                    var rules = params.rule.concat([$.map(params.filterFields, function(field, index) {
                        return {
                            key: field,
                            op: 'like',
                            value: term
                        }
                    })]);
                    return {
                        tokenid: $.cookie("tokenid"),
                        method: "stdcomponent.getbysearch",
                        dataobject: params.dataobject,
                        rule: JSON.stringify(rules),
                        start: (page - 1) * this.select2PageLength,
                        length: this.select2PageLength
                    };
                }),
                results: this.proxy(function(response, page, query) {
                    if (response.success) {
                        return {
                            results: response.data.aaData,
                            more: response.data.iTotalRecords > (page * this.select2PageLength)
                        }
                    } else {
                        $.u.alert.error(response.reason, 1000 * 3);
                    }
                })
            },
            formatSelection: params.formatSelection || function(item) {
                return item.name;
            },
            formatResult: params.formatResult || function(item) {
                return item.name;
            }
        };
    },
    /**
     * @title 获取表单验证配置
     * @return {object}
     */
    generateFormValidateOptionFactory: function() {
        return {
            rules: {
                defectType: 'required',
                defectAnalysis: 'required',
                measureType: 'required',
                description: 'required',
                organizations: 'required',
                deadline: {
                    required: true,
                    dateISO: true
                },
                confirmMan: 'required'
            },
            messages: {
                defectType: this.i18n.messages.fieldIsRequired,
                defectAnalysis: this.i18n.messages.fieldIsRequired,
                measureType: this.i18n.messages.fieldIsRequired,
                description: this.i18n.messages.fieldIsRequired,
                organizations: this.i18n.messages.fieldIsRequired,
                deadline: {
                    required: this.i18n.messages.fieldIsRequired,
                    dateISO: this.i18n.messages.dateFormatError
                },
                confirmMan: this.i18n.messages.fieldIsRequired
            },
            errorClass: "text-danger text-validate-element",
            errorElement: "div"
        };
    },
    /**
     * @title 获取form的值
     * @return {object}
     */
    getFormData: function() {
        if(this._options.mode && this._options.mode=="edit" && this.state=="edit"){
        	
        	if(this.$measureType.select2('data') && this.$measureType.select2('data').key=="NA"){
        		delete this._options.actionItemId;
        		this.action=false;
        		return {
                	data:{
    	                    id: this._options.id,
    	                    activity: this._options.activity,
    	                    defectType: parseInt(this.$defectType.attr("value")),
    	                    defectAnalysis: this.$defectAnalysis.val(),
    	                    measureType: parseInt(this.$measureType.select2('val')),
                		
    	            },
        		}
        	}else{
			        		var actionItemId="";
			            	if(this.action==true){
			            		actionItemId = this._options.actionItemId
			            	}else{
			            		actionItemId = null;
			            	}
        		return {
                	data:{
    	                    id:this._options.id,
    	                    activity: this._options.activity,
    	                    defectType: parseInt(this.$defectType.attr("value")),
    	                    defectAnalysis: this.$defectAnalysis.val(),
    	                    measureType: parseInt(this.$measureType.select2('val')),
    	                    actionItem:{
    	                    	id:actionItemId,
    	                    	description: this.$description.val(),
    	                    	completionDeadLine: this.$deadline.val(),
    	    	                confirmMan: [parseInt(this.$confirmMan.select2('val'))],
    	    	                organizations: [parseInt(this.$organizationIds.val())]
    	                    }  
    	            	},
                	
                    
                
        		}
        	}
        }else{
        	if(this.$measureType.select2('data') && this.$measureType.select2('data').key=="NA"){
        		delete this._options.actionItemId;
        		this.action=false;
        		return {
                        activity: this._options.activity,
                        defectType: parseInt(this.$defectType.attr("value")),
                        defectAnalysis: this.$defectAnalysis.val(),
                        measureType: parseInt(this.$measureType.select2('val'))
                    
                
        		}
        	}else{
        		return {
                        activity: this._options.activity,
                        defectType: parseInt(this.$defectType.attr("value")),
                        defectAnalysis: this.$defectAnalysis.val(),
                        measureType: parseInt(this.$measureType.select2('val')),
                        actionItem:{
	                    	description: this.$description.val(),
	                    	completionDeadLine: this.$deadline.val(),
	    	                confirmMan: [parseInt(this.$confirmMan.select2('val'))],
	    	                organizations: [parseInt(this.$organizationIds.val())]
	                    }   
        		}
        	}
        }
    },
    /**
     * @title 填充form的值
     */
    fillFormData: function(data){
    	this.$defectType.val(data.defectType).attr("value",data.defectTypeId);
        this.$defectAnalysis.val(data.defectAnalysis);
        this.$measureType.select2("data",{id:data.measureTypeId, name:data.measureType});
        if(this.$measureType.select2("data").name=="无需采取措施"){
        	this.$measureType.select2('data').key="NA";
        	this.qid("Ymeasure").hide();
        	this.qid("analysisDialog").css({height:"325px"});
        }else{
        	this.qid("Ymeasure").show();
        	this.qid("analysisDialog").css({height:"auto"});
        }
        if(data.actionItem){
        	this.$description.val(data.actionItem.description);
            this.$deadline.val(data.actionItem.completionDeadLine);
            this.$confirmMan.select2("data",data.actionItem.confirmMan[0]);
            this.$organizations.val(data.actionItem.organizations && data.actionItem.organizations[0].name);
            this.$organizationIds.val(data.actionItem.organizations && data.actionItem.organizations[0].id);
            this.action=true;
        }
    },
    /**
     * @title 清除form的值
     */
    clearFormData: function() {
    	delete this._options.actionItemId;
        this.$defectType.val(null);
        this.$defectAnalysis.val(null);
        this.$measureType.select2('val', null);
        this.$description.val(null);
        this.$deadline.val(null);
        this.$confirmMan.select2('val', null);
        this.$organizations.add(this.$organizationIds).val(null);
        /**
         * 关闭时会有影响
         */
        this.orgTreeWidget && this.currentSelectOrgTreeNode && this.orgTreeWidget.tree.checkNode(this.currentSelectOrgTreeNode, false);
    },
    /**
     * @title 打开模态层
     * @param {object} data
     */
    open: function(data) {
    	if(this.$measureType.select2('data')){
    		this.qid("Ymeasure").hide();
    		this.qid("analysisDialog").css({height:"325px"});
    	}else{
    		this.qid("Ymeasure").show();
    		this.qid("analysisDialog").css({height:"auto"});
    	};
        if(data && data.mode == "edit"){
        	this.state=data.mode;
            this.analysisDialog.dialog("option", {title:this.i18n.editTitle});
            this.fillFormData(data);
        }else{
        	this.state="";
        	this.analysisDialog.dialog("option", {title: this.i18n.title});
        	
        };
        $.extend(this._options, data || {});
        this.analysisDialog.dialog().dialog("open");
        if(this.$measureType.select2('data') && this.$measureType.select2('data').key && this.$measureType.select2('data').key=="NA"){
        	$(".analysisDialog").css({height:"325px"});
        }else{
        	$(".analysisDialog").css({height:"auto"});
        }
    },
    /**
     * @title 组件销毁
     */
    destroy: function() {
        this.$measureType.select2('destroy');
        this.$confirmMan.select2('destroy');
        this.analysisDialog.dialog("destroy").remove();
        this._super();
    }
}, {
    usehtm: true,
    usei18n: true
});


com.sms.detailmodule.shel.analysisDialog.widgetjs = [
                                                   "../../../../uui/widget/jqztree/js/jquery.ztree.all-3.5.js",      
                                                     ];
com.sms.detailmodule.shel.analysisDialog.widgetcss = [
												    {id:"ztreestyle",
												    path:"../../../../uui/widget/jqztree/css/zTreeStyle/zTreeStyle.css"}
                                                      ];
