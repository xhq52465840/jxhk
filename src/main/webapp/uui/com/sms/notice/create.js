//@ sourceURL=com.sms.notice.create
$.u.define('com.sms.notice.create', null, {
    init: function (options) {
        this._options = options || {};
        this._select2PageLength = 10;
        this._linkId = null;
        this._attachmentIds = [];
    },
    afterrender: function (bodystr) {
    	this.i18n = com.sms.notice.create.i18n;
    	this.col_one_user_input = this.qid("col-one-user-input");			// 接收人输入框
    	this.col_one_user_select = this.qid("col-one-user-select");			// 接收人选择框
    	this.col_tree = this.qid("col-tree");								// 组织机构树
    	this.all_result = this.qid("all-result");							// 接收人列表
    	this.add_btn = this.qid("add_btn");									// 添加接收方
    	this.del_btn = this.qid("del_btn");									// 移除接收方
    	this.info_theme = this.qid("info-theme");							// 主题
    	this.info_content = this.qid("info-content");						// 内容
        this.info_attachment = this.qid("info-attachment");                 // 附件
    	this.collapse_role = this.qid("collapse-role");						// 角色选择框
    	this.collapse_role_input = this.qid("collapse-role-input");			// 角色输入框
    	this.org_tree = null;
        this.createDialog = this.qid("createDialog").dialog({
            title: this.i18n.title,
            width: 1220,
            modal: true,
            draggable: false,
            resizable: false,
            autoOpen: false,
            buttons: [{
                "text": this.i18n.sendButton,
                "click": this.proxy(this.on_send_click)
            }, {
                "text": this.i18n.closeButton,
                "class": "aui-button-link",
                "click": this.proxy(function() {
                    this.createDialog.dialog("close");
                })
            }],
            create: this.proxy(this.on_dialog_create),
            close: this.proxy(this.on_dialog_close)
        });
    	
    	this.qid("btn_searchuser").click(this.proxy(this.on_searchuser_click));
    	this.add_btn.on("click", this.proxy(this.on_addResult_click));
    	this.del_btn.on("click", this.proxy(this.on_deleteResult_click));
    	this.qid("collapseaccordion").find("div[role=tabpanel]").on("show.bs.collapse", this.proxy(this.on_collapse_show));
    	
    	//this.qid("collapseaccordion").find("div[role=tabpanel]:eq(0)").collapse("show");
    },
    /**
     * @title 模态层创建时执行
     */
    on_dialog_create: function(){
        this.qid("info-attachment").uploadify({
            'auto': false,
            'swf': this.getabsurl('../../../uui/widget/uploadify/uploadify.swf'),
            'uploader': $.u.config.constant.smsmodifyserver + ";jsessionid=" + $.cookie("sessionid"),
            'fileTypeDesc': 'doc', //文件类型描述
            'fileTypeExts': '*.*', //可上传文件格式 *.doc;*.docx;*.rar;*.xls;*.ppt;*.ppt;*.pdf;*.jpg;*.bmp;*.png;*.xlsx;*.pptx;
            'removeCompleted': true,
            'buttonText': '选择附件', //按钮上的字
            'cancelImg': this.getabsurl('../../../uui/widget/uploadify/uploadify-cancel.png'),
            'height': 25, //按钮的高度和宽度
            'width': 140,
            'progressData': 'speed',
            'method': 'get',
            'removeTimeout': 3,
            'successTimeout': 99999,
            'multi': true,
            'fileSizeLimit': '10MB',
            'queueSizeLimit': 999,
            'simUploadLimit': 999,
            'onQueueComplete': this.proxy(function(queueData) {
                if (queueData.uploadsErrored > 0) {
                    $.u.alert4$.error("上传失败："+data.reason, $("<div style='padding:0px;margin-bottom: 0px;'/>").appendTo(this.qid("select-error4")), 3000);
                }else{                    
                    this._sendNotice(this._attachmentIds);
                }
            }),
            'onUploadStart': this.proxy(function(file) {
                this.info_attachment.uploadify('settings', 'formData', {
                    method: 'uploadFiles',
                    tokenid: $.cookie("tokenid"),
                    source: this._options.activity,
                    sourceType: 26
                });
            }),
            'onUploadSuccess': this.proxy(function(file, data, response) {
                if (data) {
                    data = JSON.parse(data);
                    if (data.success) {
                        this._attachmentIds = this._attachmentIds.concat($.map(data.data.aaData, function(item, idx) {
                            return item.id;
                        }));
                    } else {
                        $.u.alert4$.error("上传失败：" + data.reason, $("<div style='padding:0px;margin-bottom: 0px;'/>").appendTo(this.qid("select-error4")), 3000);
                    }
                }
            })
        });
    },
    on_collapse_show: function(e){
    	var $this = $(e.currentTarget), type = $this.attr("data-type");
    	switch(type){
	    	case "user": break;
	    	case "orga":
	    		if(!this.org_tree){
	    			this._initOrgTree();
	    		}
	    		break;
	    	case "role":
	    		if(this.collapse_role_input.hasClass("select2-offscreen") === false){
	    			this._initRoleSelect2();
	    		}
	    		break;
    	}
    },
    on_searchuser_click: function(e){
        var value = this.col_one_user_input.val();
        this._ajax(
            $.u.config.constant.smsqueryserver,
            true, {
                method: "stdcomponent.getbysearch",
                dataobject: "user",
                rule: JSON.stringify([
                    [{
                        "key": "fullname",
                        "op": "like",
                        "value": value
                    }, {
                        "key": "username",
                        "op": "like",
                        "value": value
                    }]
                ])
            },
            this.col_one_user_select.parent(), {},
            this.proxy(function(response) {
                this.col_one_user_select.empty();
                $.each(response.data.aaData, this.proxy(function(idx, item) {
                    $('<option value="' + item.id + '" title="' + item.fullname + '(' + item.username + ')' + '" data-type="user">' + item.fullname + '(' + item.username + ')' + '</option>').appendTo(this.col_one_user_select);
                }));
            })
        );
    },
    on_deleteResult_click: function(){
    	var $select = $('option:selected',this.all_result);
    	if($select.length > 0){
    		$select.each(this.proxy(function(k,v){
    			switch($(v).attr("data-type")){
                    case 'role':
                        $('option[pid=' + v.value + ']', this.all_result).remove();
                        break;
                    case 'unit':
                        if($('option[pid='+$(v).attr('pid')+']', this.all_result).length === 1){
                            $('option[value='+$(v).attr('pid')+']', this.all_result).remove();
                        }
                        break;
                }
                $(v).remove();
    		}));
    	}else{
    		$.u.alert4$.error("未选择任何选项",$("<div style='padding:0px;margin-bottom: 0px;'/>").appendTo(this.qid("select-error")),3000);
    	}
    },
    on_addResult_click:function(e){
    	var $div = $('div.panel-collapse.collapse.in', this.createDialog) , type = $div.attr("data-type");
    	switch(type){
	    	case "user":
	    		$('option:selected',this.col_one_user_select).each(this.proxy(function(k,v){
	    			var $option = $(v).clone(true);
	    			if(this.all_result.find('option[value=' + $option.val() + '][data-type=user]').length > 0){
	    				$.u.alert4$.error("已被选中",$("<div style='padding:0px;margin-bottom: 0px;'/>").appendTo(this.qid("select-error")),3000);
	    			}else{
	    				$option.css("color","orange").appendTo(this.all_result);
	    			}
	    		}));
	    		break;
	    	case "orga":
	    		var nodes = this.org_tree.getCheckedNodes(true);
	    		$.each(nodes, this.proxy(function(idx, node){
	    			var $option = $('<option/>',{
                        value:node.id,
                        'data-type':'orga',
                        style:'color:red;',
                        title: node.name
                    }).text(node.name);
	    			if(this.all_result.find('option[value=' + $option.val() + '][data-type=orga]').length > 0){
	    				$.u.alert4$.error("已被选中", $("<div style='padding:0px;margin-bottom: 0px;'/>").appendTo(this.qid("select-error")), 3000);
	    			}else{
	    				$option.appendTo(this.all_result);
	    			}
	    		}))
	    		break;
	    	case "role"://先循环role，在内部循环安监机构，然后做append
	    		var roleData = this.collapse_role_input.select2("data");
	    		if(roleData.length){
	    			var unitData = $('option:selected', this.collapse_role);
	    			if(unitData.length){
	    				$.each(roleData, this.proxy(function(idx, data){
	    					var $option = $('<option />',{
                                value:data.id,
                                'data-type':'role',
                                style:'color:#1DE420;',
                                title:data.name
                            }).text(data.name + "：");
	    					if(!this.all_result.find('option[value=' + data.id + '][data-type=role]').length){
	    						$option.appendTo(this.all_result);
	    					}
		    				
		    				unitData.each(this.proxy(function(k, v){
				    			var $option1 = $(v).clone(true);
				    			$option1.css({"color":"#D926E5", "margin-left":"20px"}).attr("pid", data.id);
				    			if(!this.all_result.find('option[value=' + v.value + '][pid=' + data.id + '][data-type=unit]').length){
				    				this.all_result.find('option[value=' + data.id + '][data-type=role]').after($option1[0]);
				    			}
				    		}));
	    				}));
	    			}else{
	    				$.u.alert4$.error("未选择安监机构", $("<div style='padding:0px;margin-bottom: 0px;'/>").appendTo(this.qid("select-error")), 3000);
	    			}
	    		}else{
	    			$.u.alert4$.error("未选择机构角色", $("<div style='padding:0px;margin-bottom: 0px;'/>").appendTo(this.qid("select-error")),3000);
	    		}
	    		break;
	    	default:
	    		$.u.alert4$.error("未选择任何选项", $("<div style='padding:0px;margin-bottom: 0px;'/>").appendTo(this.qid("select-error")), 3000);
	    		break;
    	}
    	
    },
    on_dialog_close: function(e){
    	this.all_result.add(this.col_one_user_select).add(this.collapse_role).empty();
    	this.col_one_user_input.add(this.info_theme).add(this.info_content).val("");
    	this.collapse_role_input.select2("data","");
        this.info_attachment.uploadify('cancel', '*', true);
        this._attachmentIds = [];
    	if(this.org_tree){
        	this.org_tree.cancelSelectedNode();
    		this.org_tree.checkAllNodes(false);
    	}
    },
    /**
     * 回车换行
     * 
     */
    huanhang:function(){
			   var val=this.info_content.val();
			   val=val.replace(/\n/g,"<br>");
			   this.info_content.val(val);
    },
    on_send_click: function(e){
    	this.huanhang();
    	if( this.all_result.children().length == 0 ){
    		$.u.alert4$.error("接收人未填写", $("<div style='padding:0px;margin-bottom: 0px;'/>").appendTo(this.qid("select-error")), 3000);
    		return;
    	}
    	if( !$.trim(this.info_theme.val()) ){
    		$.u.alert4$.error("消息主题未填写", $("<div style='padding:0px;margin-bottom: 0px;'/>").appendTo(this.qid("select-error2")), 3000);
    		return;
    	}
    	if( !$.trim(this.info_content.val()) ){
    		$.u.alert4$.error("消息内容未填写", $("<div style='padding:0px;margin-bottom: 0px;'/>").appendTo(this.qid("select-error3")), 3000);
    		return;
    	}
    	
        if (this.info_attachment.data('uploadify').queueData.queueLength > 0) {
            this.info_attachment.uploadify('upload', '*');
        }else{
            this._sendNotice([]);
        }
    },
    /**
     * @title 发送消息
     * @params {Array<number>} fileIds - 附件ID集合
     */
    _sendNotice: function(fileIds){
        var userIds = [], organizationIds = [], roleIds = [], unitIds = [], type = null, id = null;        
        
        $('option', this.all_result).each(this.proxy(function(k, v){
            type = $(v).attr("data-type");
            id = parseInt($(v).val());
            switch(type){
                case "user": userIds.push(id); break;
                case "orga": organizationIds.push(id); break;
                case "role":
                    if($.inArray(id,roleIds) < 0){
                        roleIds.push(id);
                        unitIds.push({
                            "roleId": id,
                            "unitIds": (this.proxy(function(parID){
                                var data = [];
                                $('option[pid='+parID+'][data-type=unit]',this.all_result).each(function(key,value){
                                    data.push(value.value);
                                });
                                return data;
                            }))(id)
                        });
                    }
                    break;
                default: break;
            }
        }));
        
        this._ajax(
            $.u.config.constant.smsmodifyserver,
            true,
            {
                "method": "modifyMessage",
                "paramType": "sendMessage",
                "title": this.info_theme.val(),
                "content": this.info_content.val(),
                "link": this._linkId,
                "sourceType": this._options.sourceType ? this._options.sourceType : this._linkId ? "ACTIVITY" : "",
                "userIds": JSON.stringify(userIds),
                "organizationIds": JSON.stringify(organizationIds),
                "unitIds": JSON.stringify(unitIds),
                "files": JSON.stringify(fileIds)
            },
            this.createDialog.parent(),
            {},
            this.proxy(function(response){
                this.createDialog.dialog("close");
                this.refresh();
            })
        );
    },
    _getRole: function(){
    	this._ajax(
    		$.u.config.constant.smsqueryserver,
    		true,
    		{
    			method: "stdcomponent.getbysearch",
    			dataobject: "unit"
    		},
    		this.collapse_role.parent(),
    		{},
    		this.proxy(function(response){
    			this.collapse_role.empty();
            	$.each(response.data.aaData, this.proxy(function(idx, item){
            		$('<option/>',{
                        value: item.id,
                        'data-type':'unit',
                        title: item.name
                    }).text(item.name).appendTo(this.collapse_role);
            	}));
    		})
    	);
    },
    _initRoleSelect2: function(){
    	this.collapse_role_input.select2({
			multiple: true,
        	ajax:{
	        	url: $.u.config.constant.smsqueryserver,
	            dataType: "json",
	            type: "post",
	            data: this.proxy(function(term, page){
	            	return {
        				"tokenid": $.cookie("tokenid"),
        				"method": "stdcomponent.getbysearch",
        				"dataobject": "role",
        				"rule": JSON.stringify([[{"key":"name","op":"like","value":term}]]),
        				"start": (page - 1) * this._select2PageLength,
        				"length": this._select2PageLength
	            	};
	            }),
		        results:this.proxy(function(response, page){
		        	if(response.success){
		        		return {results:response.data.aaData, more:page * this._select2PageLength < response.data.iTotalRecords };
		        	}
		        })
	        },
	        formatResult:function(item){
	        	return item.name;
	        },
	        formatSelection:function(item){
	        	return item.name;
	        }
		}).on("select2-selecting", this.proxy(this._getRole))
		.on("select2-removing", this.proxy(this._getRole));
    },
    _initOrgTree: function(){
    	var setting = {
			data: {
				simpleData: {
					enable: true
				}
			},
			check: {
				enable: true,
				chkStyle: "checkbox",
				chkboxType: { "Y": "", "N": "" }
			},
			async:{
				url: $.u.config.constant.smsqueryserver,
				type: "post",
				enable: true,
				otherParam:{
					"tokenid": $.cookie("tokenid"),
            		"method": "getAllOrganizations"
				},
				dataFilter: function(treeId,parentNode,responseData){
					var nodes=[];
					if(responseData){
						nodes = $.map(responseData.data.aaData,function(perm,idx){
            				return {id:perm.id,pId:perm.parentId,name:perm.name};
            			});
					}
					return nodes;
				}
			},
			callback: {
				beforeCheck: this.proxy(function(treeId, treeNode){
					if(!treeNode.checked){
						this.org_tree.selectNode(treeNode);
					}else{
						this.org_tree.cancelSelectedNode(treeNode);
					}
				}),
				beforeClick: this.proxy(function(treeId, treeNode, clickFlag){
					if(treeNode.checked){
						this.org_tree.checkNode(treeNode, false, false);
					}else{
						this.org_tree.checkNode(treeNode, true, false);
					}
				})
			}
		};
    	this.org_tree = $.fn.zTree.init(this.col_tree, setting);
    },
    open: function(){
    	this.createDialog.dialog("open");
    },
    /**
     * @title 快速启动
     * @param linkId {int} 
     * @return void
     */
    quickTrigger:function(linkId){
    	this._linkId = linkId; 
    	this.open();
    },
    /**
     * @title ajax
     * @param url {string} ajax url
     * @param async {bool} async
     * @param param {object} ajax param
     * @param $container {jQuery object} block
     * @param blockParam {object} block param
     * @param callback {function} callback
     */
    _ajax:function(url,async,param,$container,blockParam,callback){
    	$.u.ajax({
			"url": url,
			"datatype": "json",
			"async": async || true,
			"type": "post",
			"data": $.extend({
				"tokenid": $.cookie("tokenid")
			},param)
		},$container || this.$,$.extend({ size:2, backgroundColor:"#fff" },blockParam||{})).done(this.proxy(function(response){
			if(response.success){
				callback(response);
			}else {
				//$.u.alert4$.error(response.reason,$("<div/>").appendTo(this.$));
            }
        })).fail(this.proxy(function (jqXHR, errorText, errorThrown) {
       
		}));
    },
    refresh: function(){},
    destroy: function () {
    	this.org_tree && this.org_tree.destroy();
    	this.collapse_role_input.hasClass("select2-offscreen") && this.collapse_role_input.select2("destroy"); 
    	this.createDialog.dialog("destroy").remove();
        return this._super();
    }
}, { usehtm: true, usei18n: true });


com.sms.notice.create.widgetjs = ['../../../uui/widget/jqztree/js/jquery.ztree.all-3.5.js',
                                  '../../../uui/widget/select2/js/select2.min.js',
                                  "../../../uui/widget/spin/spin.js",
                                  "../../../uui/widget/jqblockui/jquery.blockUI.js",
                                  "../../../uui/widget/ajax/layoutajax.js",
                                  "../../../uui/widget/uploadify/jquery.uploadify.js"];
com.sms.notice.create.widgetcss = [{id:"ztreestyle",path:"../../../uui/widget/jqztree/css/zTreeStyle/zTreeStyle.css"},
                                   {id:"",path:"../../../uui/widget/select2/css/select2.css"},
                                   {id:"",path:"../../../uui/widget/select2/css/select2-bootstrap.css"},
                                   {id:"",path:"../../../uui/widget/uploadify/uploadify.css"}];