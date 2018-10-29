//@ sourceURL=com.sms.plugin.organization.org
$.u.load("com.sms.common.stdcomponentdelete");
$.u.define('com.sms.plugin.organization.org', null, {
    init: function (options) {
        this._options = options || {};
        this._select2PageLength = 10;
        this.setData = null;
        this._options.treeid = null; //当前选中的树id
    },
    afterrender: function (bodystr) {
    	this.i18n = com.sms.plugin.organization.org.i18n;
    	this.form = this.qid("form");
    	this.treeContent = this.qid("treeContent");
    	this.systems = this.qid("systems");
        this.oLevel = this.qid("olevel");
        this.unit = this.qid("unit");
    	this.parent = this.qid("parent");
    	this.previousParent = this.qid("previousParent");
    	this.addform = this.qid("addform");
    	this.btn_adduser = this.qid("btn_adduser");
    	this.member = this.qid("member");
    	//名称
    	this.orgName = this.qid("orgName");
    	//所属系统
    	this.orgSystem = this.qid("orgSystem");
        //所属安监机构
        this.orgUnit = this.qid("orgUnit");
        //安监机构负责人
        this.userUnit = this.qid("userUnit");
    	//组织编号
    	this.orgDeptCode = this.qid("orgDeptCode");
    	//组织编号描述
    	this.orgDeptCodeDesc = this.qid("orgDeptCodeDesc");
    	// 添加组织dialog
    	this.addOrgDialog = this.qid("addOrgDialog").dialog({
	        width:600,
	        modal: true,
	        resizable: false,
	        autoOpen: false,
	        create:this.proxy(function(){
	        	
	        }),
	        open:this.proxy(function(){
	        	$('button.ui-dialog-titlebar-close').remove();
	        	// 填充表单
	        	if(this._options.mode=="EDIT"){
	            	if(this._options.data){
	            		console.log(this._options.data);
	            		this.fillFormData(this._options.data);
	            	}
	        	}
                else if(this._options.mode == "ADD"){
                    var nodes = this.organizationTree.getSelectedNodes(), node = {}, selectNode = null;
                    if(nodes.length > 0){
                        node = nodes[0];
                        this.parent.attr("value", node.id).val(node.name);
                        selectNode = this.tree.getNodeByParam("id", node.id, null);
                        if(selectNode){
                            this.tree.selectNode(selectNode);
                        }
                    }
                }
	        }),
	        close:this.proxy(function(){
	        	// 清空表单
	        	this.clearFormData();
	        	// 1.当添加组织时，点击取消，不发生任何操作；点击添加时，做操作
	        	// 2.当编辑组织时，点击取消，不发生任何操作；点击添加时，做操作
	        	if(this._options.mode === "OP"){
	        		this._getOrgTree();
	        	}
                this.tree.cancelSelectedNode();
	        })
	    });
    	
    	// 添加成员dialog
        this.addMebDialog = this.qid("addMebDialog").dialog({
	        width:600,
	        modal: true,
	        resizable: false,
	        autoOpen: false,
	        create:this.proxy(function(){
	        	this.addform.validate({
	        		rules:{
	        			"users":"required"
	        		},
	        		messages:{
	        			"users":"成员不能为空"
	        		},
	        		errorClass: "text-danger text-validate-element",
	    		    errorElement: "div"
	        	})
	        }),
	        open:this.proxy(function(){
	        	$('button.ui-dialog-titlebar-close').remove();
	        }),
	        close:this.proxy(function(){
	        	// 清空表单
	        	this.addform.validate().resetForm();
	        	this.member.select2("data","");
	        	this._options.treeid = null;
	        	if(this._options.mode === "OP"){
	        		this._getChildData();
	        	}
	        })
	    });
        
        // 删除成员dialog
        this.delMebDialog = this.qid("delMebDialog").dialog({
        	width:600,
	        modal: true,
	        draggable: false,
	        resizable: false,
	        autoOpen: false,
	        create:this.proxy(function(){

	        }),
	        open:this.proxy(function(){
	        	$('button.ui-dialog-titlebar-close').remove();
	        }),
	        close:this.proxy(function(){
	        	this._getChildData();
	        })
        })
        
        // 所属系统 下拉
        this.systems.select2({
        	ajax: { 
	            url: $.u.config.constant.smsqueryserver,
	            dataType: 'json',
	            type: "post",
	            data: this.proxy(function(term,page){
					 return {
						 method: "stdcomponent.getbysearch",
						 dataobject: "dictionary",
						 tokenid: $.cookie("tokenid"),
						 rule: JSON.stringify([[{"key":"name","op":"like","value":term}],[{"key":"type", "value":"系统分类"}]]),
                         start: (page - 1) * this._select2PageLength,
                         length: this._select2PageLength
					 };
				 }),
	            results: this.proxy(function (data, page) { 
	                return {
                        results: data.data.aaData ,
                        more: data.data.iTotalRecords > (page * this._select2PageLength)
                    };
	            })
	        },
            formatResult: function(item){
            	return item.name;
            },
            formatSelection: function(item){
            	return item.name;
            },
	        multiple : true
        });

        // 安监机构 下拉
        this.unit.select2({
            allowClear: true,
            placeholder: "请选择",
            ajax: { 
                url: $.u.config.constant.smsqueryserver,
                dataType: 'json',
                type: 'post',
                data: this.proxy(function(term,page){
                     return {
                         method: "stdcomponent.getbysearch",
                         dataobject: "unit",
                         tokenid: $.cookie("tokenid"),
                         rule: JSON.stringify([[{"key":"name","op":"like","value":term}]]),
                         start: (page - 1) * this._select2PageLength,
                         length: this._select2PageLength
                     };
                 }),
                results: this.proxy(function (data, page) { 
                    return {
                        results: data.data.aaData ,
                        more: data.data.iTotalRecords > (page * this._select2PageLength)
                    };
                })
            },
            formatResult: function(item){
                return '<img style="margin-right: 4px;" height="16" width="16" src="' + item.avatarUrl + '" />' + item.name;
            },
            formatSelection: function(item){
                return item.name;
            }
        });
        
        // 前一组织 下拉
        this.previousParent.select2({
	       	 allowClear: true,
	       	 placeholder: "请选择",
	       	 query: this.proxy(function (query){
	       		var getData = {results:[]};
	       		try{
		       		if(this.parent.attr("value")){
		       			var nodes = this.organizationTree.getSelectedNodes();
		       			if(nodes.length){
		       				var orgid = nodes[0].id;
		       				var data = {};
		       				if(this._options.mode == "ADD"){
		       					data = {
									"tokenid":$.cookie("tokenid"),
									"method":"getOrganizationsByParent",
									"parentId":this.parent.attr("value"),
									"currentOrganizationId":orgid,
									"name":query.term
							    };
		       				}else if(this._options.mode == "EDIT"){
		       					data = {
									"tokenid":$.cookie("tokenid"),
									"method":"getOrganizationsByParent",
									"parentId":this.parent.attr("value"),
									"name":query.term
							    }
		       				}
							 $.ajax({
								url: $.u.config.constant.smsqueryserver,
							    type:"post",
							    dataType: "json",
							    async: false,
							    data: data
							 }).done(this.proxy(function(response){
								if(response.success){
									getData.results = response.data;
								}
							 })).fail(this.proxy(function(jqXHR,errorText,errorTHrown){
								
							 }));
							 
		       			}else{
		       				$.u.alert.error("当前未选择任何组织", 1000 * 3);
		       			}
		       		}else{
		       			$.u.alert.error("上级组织未选择", 1000 * 3);
		       		}
	       		}catch(e){
	       			$.u.alert.error(e.message, 1000 * 3);
	        	}
	       		query.callback(getData);
            }),
            formatResult: function(item){
            	return item.name;
            },
            formatSelection: function(item){
            	return item.name;
            }
       });
        
        // 成员
    	this.dataTable = this.qid("datatable").dataTable({
            searching: false,
            serverSide: false,
            bProcessing: true,
            ordering: false,
            pageLength: 10,
            data:[],
            dom: "tip",
            "columns": [
                { "title": "成员" ,"mData":"fullname"},
                { "title": "角色" ,"mData":"role"},
                { "title": "用户组" ,"mData":"usergroup"},
                { "title": this.i18n.handle,"mData":"id", "width":150}
            ],
            "oLanguage": { //语言
                "sSearch": this.i18n.search,
                "sLengthMenu": this.i18n.everPage+" _MENU_ "+this.i18n.record,
                "sZeroRecords": this.i18n.message,
                "sInfo": this.i18n.from+" _START_ "+this.i18n.to+" _END_ /"+this.i18n.all+" _TOTAL_ "+this.i18n.allData,
                "sInfoEmpty": this.i18n.withoutData,
                "sInfoFiltered": "("+this.i18n.fromAll+"_MAX_"+this.i18n.filterRecord+")",
                "sProcessing": ""+this.i18n.searching+"...",
                "oPaginate": {
                    "sFirst": "<<",
                    "sPrevious": this.i18n.back,
                    "sNext": this.i18n.next,
                    "sLast": ">>"
                }
            },
            "aoColumnDefs": [
                {
                    "aTargets": 0,
                    "mRender": function (data, type, full) {
                        return full.fullname+"("+full.username+")";
                    }
                },
                {
                    "aTargets": 1,
                    "orderable":false,
                    "sClass": "role-td",
                    "mRender": function (data, type, full) {
                    	var html="";
                		$.each(data||[],function(idx,item){
                			html+=item.roleName ? item.roleName+"<br/>":"";
                		})
                		return html;
                    }
                },
                {
                    "aTargets": 2,
                    "sClass": "usergroup-td",
                    "mRender": function (data, type, full) {
                    	var html="";
                		$.each(data||[],function(idx,item){
                			html+=(item.usergroupName||"")+"<br/>";
                		})
                		return html;
                    }
                },
                {
                    "aTargets": 3,
                    "mRender": function (data, type, full) {
                    	return  "<button type='button' class='btn btn-link delete' data='"+JSON.stringify(full)+"'>"+com.sms.plugin.organization.org.i18n.remove+"</button>";
                    }
                }
            ],
            "fnDrawCallback": this.proxy(function( oSettings ) {
            	$("button.delete" ,this.dataTable).unbind("click").click(this.proxy(this.on_delete_click));
             })
        });
        
    	// 添加组织
    	this.btnAddOrg = this.qid("btn_addorg");
    	// 添加组织事件
        this.btnAddOrg.off("click").on("click",this.proxy(this._addOrg));
        //添加成员
        this.btn_adduser.off("click").on("click",this.proxy(this._addUser));
        
        //编辑组织
        this.btn_editorg = this.qid("btn_editorg");
        this.btn_editorg.off("click").on("click", this.proxy(this._editOrg));
        // 删除组织
        this.btn_delorg = this.qid("btn_delorg");
        this.btn_delorg.off("click").on("click", this.proxy(this._delOrg));
        
        this.libTree = this.qid("libTree");
        this._getOrgTree();
    },
    onBodyDown:function(e){
    	if (!(e.target.id == (this._id+"-tree") || e.target.id == (this._id+"-treeContent") || $(e.target).parents("#"+this._id+"-treeContent").length>0)) {
			this.treeContent.fadeOut("fast");
			$("body").unbind("mousedown", this.proxy(this.onBodyDown));
		}
    },
    /**
     * 生成树
     */
    _getOrgTree:function(){
    	var setting = {
    			data: {
    				simpleData: {
    					enable: true
    				}
    			},
    			callback: {
    				onClick:this.proxy(function(treeId, treeNode, clickFlag){
    					this._getChildData();
    					if(clickFlag.level===0){
    						this.btn_editorg.removeClass("disabled");
    						this.btn_delorg.addClass("disabled");
    					}else{
    						this.btn_editorg.add(this.btn_delorg).removeClass("disabled");
    					}
    				})
    			}
    		};
    	var setting1 = {
    			data: {
    				simpleData: {
    					enable: true
    				}
    			},
    			callback: {
    				beforeClick:this.proxy(function(treeId, treeNode, clickFlag){
    					this.parent.val(treeNode.name);
						this.parent.attr("value",treeNode.id);
						this.previousParent.select2("val","");
						this.treeContent.fadeOut("fast");
    				})
    			}
    		};
    	$.u.ajax({
    		url: $.u.config.constant.smsqueryserver,
            type:"post",
            dataType: "json",
            cache: false,
            data: {
        		"tokenid":$.cookie("tokenid"),
        		"method":"getAllOrganizations"
            }
    	},this.libTree).done(this.proxy(function(response){
    		if(response.success){
    			var zNodes=$.map(response.data.aaData,this.proxy(function(perm,idx){
    				return {
                        id:perm.id,
                        pId:perm.parentId,
                        name:perm.name,
                        checked:(perm.id === this._options.treeid?true:false)
                    };
    			}));
    			//左边树
    			this.organizationTree=$.fn.zTree.init(this.libTree, setting, zNodes);
    			var sNodes = this.organizationTree.getNodes();
    			if (sNodes.length) {
    				this.organizationTree.expandNode(sNodes[0], true, false, true);
    			}
    			//下拉树
    			this.tree=$.fn.zTree.init(this.qid("tree"), setting1, zNodes);
    			var sNodes_tree = this.tree.getNodes();
    			if (sNodes_tree.length) {
    				this.tree.expandNode(sNodes_tree[0], true, false, true);
    			}
    			//当有被选中的点时
    			if(this._options.treeid){
    				var node = this.organizationTree.getNodeByParam("id", this._options.treeid, null);
        			this.organizationTree.selectNode(node,true);
        			this._getChildData(this._options.treeid);
    	    	}
    		}
    	})).fail(this.proxy(function(jqXHR,errorText,errorTHrown){
    		
    	}))
    },
    /**
     * 树节点的点击事件
     */
    _getChildData:function(id){
    	this._options.data = null;
    	this.dataTable.fnClearTable();
    	var orgid = null;
    	var nodes = this.organizationTree.getSelectedNodes();
    	if(id){
    		orgid = this._options.treeid;
    	}else{
        	orgid = nodes[0].id;
    	}

    	$.u.ajax({
    		url: $.u.config.constant.smsqueryserver,
            type:"post",
            dataType: "json",
            cache: false,
            data: {
        		"tokenid":$.cookie("tokenid"),
        		"method":"getUserByOrganizationN",
        		"id":orgid
            }
    	},this.qid("main")).done(this.proxy(function(response){
    		if(response.success){
    			if( response.data.length){
    	    		this.dataTable.fnAddData(response.data);
    	    	}
    		}
    	})).fail(this.proxy(function(jqXHR,errorText,errorTHrown){
    		
    	}))
    	$.u.ajax({
    		url: $.u.config.constant.smsqueryserver,
            type:"post",
            dataType: "json",
            cache: false,
            data: {
        		"tokenid":$.cookie("tokenid"),
        		"method":"stdcomponent.getbyid",
        		"dataobject":"organization",
        		"dataobjectid":orgid
            }
    	},this.qid("main")).done(this.proxy(function(response){
    		if(response.success){
    			//名称
    			this.orgName.text(nodes[0].name);
    	    	//所属系统
    			var system = "";
    			response.data.systems && $.each(response.data.systems,function(k,v){
    				system += v.name+"<br/>";
    			});
    	    	this.orgSystem.html(system);
                this.oLevel.val(response.data.olevel || '');
                this.orgUnit.text(response.data.unitDisplayName || '');
                this.userUnit.text(response.data.unitResponsibleUser || '');
    	    	this.orgDeptCode.text(response.data.deptCode||'');
    	    	//组织编号描述
    	    	this.orgDeptCodeDesc.text(response.data.deptCodeDesc||'');
    	    	var data = [];
    	    	if(response.data.users){
    	    		data = response.data.users;
    	    	}
    	    	//成员
    	    	/*if(data.length){
    	    		this.dataTable.fnAddData(data);
    	    	}*/
    	    	this._options.data = {
    	    		a:response.data.name,
    	    		b:response.data.systems,
    	    		c:{"id":response.data.parent,"name":response.data.parentDisplayName},
    	    		d:{"id":response.data.previous,"name":response.data.previousName},
    	    		e:response.data.deptCode,
    	    		f:response.data.deptCodeDesc,
                    g:response.data.olevel,
                    unit: {
                        id: response.data.unit,
                        name: response.data.unitDisplayName
                    }
    	    	}
    		}
    	})).fail(this.proxy(function(jqXHR,errorText,errorTHrown){
    		
    	}))
    },
    /**
     * 添加组织
     */
    _addOrg : function () {
    	this.previousParent.select2("enable", true);
        this.qid("upOrg").show();
        // 上级组织 树下拉
        this.parent.off("click").on("click",this.proxy(function(e){
			var offset = $(e.target).offset();
			this.treeContent.css({left:offset.left + "px", top:offset.top + $(e.currentTarget).outerHeight() + "px"}).slideDown("fast");
			$("body").bind("mousedown", this.proxy(this.onBodyDown));
    	}));
		var dialogOptions = null;
        this._options.mode = "ADD";
        var nodes = this.organizationTree.getSelectedNodes();
		if(nodes.length){
			this._options.treeid = nodes[0].id;
		}
    	dialogOptions = {
            title: "添加组织",
            buttons: [
                {
                    text: "添加",
                    click: this.proxy(function (e) {
                    	this._options.mode = "OP";
                    	e.preventDefault();
                    	this.form.validate({
        	        		rules:{
        	        			"name":"required",
        	        			"systems":"required",
                                "olevel":"required",
        	        			"parent":"required",
        	        			"deptCode":"required"
        	        		},
        	        		messages:{
        	        			"name":"名称不能为空",
        	        			"systems":"所属系统不能为空",
        	        			"parent":"上级组织不能为空",
        	        			"deptCode":"组织编号不能为空"
        	        		},
        	        		errorClass: "text-danger text-validate-element",
        	    		    errorElement: "div"
        	        	})
                    	if (this.form.valid()) {
                            this._sendModifyAjax({
                    			"tokenid":$.cookie("tokenid"),
                      		  	"method":"modifyOrganization",
                      		  	"paramType":"addOrganization",
                      		  	"obj":JSON.stringify(this.getFormData())
                      		})
                        }
                    })
                },
                {
                    text: "取消",
                    "class": "aui-button-link",
                    click: this.proxy(function (e) {
                    	e.preventDefault();
                        this.addOrgDialog.dialog("close");
                    })
                }
            ]
        };
        this.addOrgDialog.dialog("option",dialogOptions).dialog("open");
    },
    /**
     *  编辑组织
     */
    _editOrg : function (e) {
    	try{
    		//1.获取当前被选中的树节点
    		//2.取得name  id
    		var nodes = this.organizationTree.getSelectedNodes();
    		if(nodes.length){
    			// 如果为跟节点，不能编辑
    			if(nodes[0].level !== 0){
    				// 前一组织 下拉
	    	        this.previousParent.select2("enable", true);
	    	        this.qid("upOrg").show();
	    	        // 上级组织 树下拉
	    	        this.parent.off("click").on("click",this.proxy(function(e){
	    				var offset = $(e.target).offset();
                        var value = $(e.currentTarget).attr("value");
                        var selectNode = null;
                        this.tree.cancelSelectedNode();
                        if(value){
                            selectNode = this.tree.getNodeByParam("id", value, null);
                            if(selectNode){
                                this.tree.selectNode(selectNode);
                            }
                        }
	    				this.treeContent.css({left:offset.left + "px", top:offset.top + $(e.currentTarget).outerHeight() + "px"}).slideDown("fast");
	    				$("body").bind("mousedown", this.proxy(this.onBodyDown));
	    	    	}));
    				this._options.treeid = nodes[0].id;
        			var org = {};
            		org.name = nodes[0].name;
            		org.id = nodes[0].id;
            		var dialogOptions = null;
                    this._options.mode = "EDIT";
                	dialogOptions = {
                        title: "编辑组织:" + org.name,
                        buttons: [
                            {
                                text: "确定",
                                click: this.proxy(function (e) {
                                	this._options.mode = "OP";
                                	e.preventDefault();
                                	this.form.validate({
                    	        		rules:{
                    	        			"name":"required",
                    	        			"systems":"required",
                                            "olevel":"required",
                    	        			"parent":"required",
                    	        			"deptCode":"required"
                    	        		},
                    	        		messages:{
                    	        			"name":"名称不能为空",
                    	        			"systems":"所属系统不能为空",
                    	        			"parent":"上级组织不能为空",
                    	        			"deptCode":"组织编号不能为空"
                    	        		},
                    	        		errorClass: "text-danger text-validate-element",
                    	    		    errorElement: "div"
                    	        	});
                                	if (this.form.valid()) {
                                        this._sendModifyAjax({
                                			"tokenid":$.cookie("tokenid"),
        	                      		  	"method":"modifyOrganization",
        	                      		  	"paramType":"updateOrganization",
        	                      		  	"dataobjectid":parseInt(org.id),
        	                      		  	"obj":JSON.stringify(this.getFormData())
        	                      		})
                                    }
                                })
                            },
                            {
                                text: "取消",
                                "class": "aui-button-link",
                                click: this.proxy(function (e) {
                                	e.preventDefault();
                                    this.addOrgDialog.dialog("close");
                                })
                            }
                        ]
                    };
                    this.addOrgDialog.dialog("option",dialogOptions).dialog("open");
    			}else{
	    			// 前一组织 下拉
	    	        this.previousParent.select2("enable", false);
	    	        this.qid("upOrg").hide();
	    	        // 上级组织 树下拉
	    	        this.parent.off("click");
    				this._options.treeid = nodes[0].id;
        			var org = {};
            		org.name = nodes[0].name;
            		org.id = nodes[0].id;
            		var dialogOptions = null;
                    this._options.mode = "EDIT";
                    this.form.validate({
    	        		rules:{
    	        			"name":"required",
    	        			"systems":"required",
                            "olevel":"required",
    	        			"deptCode":"required"
    	        		},
    	        		messages:{
    	        			"name":"名称不能为空",
    	        			"systems":"所属系统不能为空",
    	        			"deptCode":"组织编号不能为空"
    	        		},
    	        		errorClass: "text-danger text-validate-element",
    	    		    errorElement: "div"
    	        	})
                	dialogOptions = {
                        title: "编辑组织:" + org.name,
                        buttons: [
                            {
                                text: "确定",
                                click: this.proxy(function (e) {
                                	this._options.mode = "OP";
                                	e.preventDefault();
                                	if (this.form.valid()) {
                                        this._sendModifyAjax({
                                			"tokenid":$.cookie("tokenid"),
        	                      		  	"method":"modifyOrganization",
        	                      		  	"paramType":"updateOrganization",
        	                      		  	"dataobjectid":parseInt(org.id),
        	                      		  	"obj":JSON.stringify(this.getFormData())
        	                      		})
                                    }
                                })
                            },
                            {
                                text: "取消",
                                "class": "aui-button-link",
                                click: this.proxy(function (e) {
                                	e.preventDefault();
                                    this.addOrgDialog.dialog("close");
                                })
                            }
                        ]
                    };
                    this.addOrgDialog.dialog("option",dialogOptions).dialog("open");
    			}
    		}else{
                $.u.alert.error("未选择任何组织", 1000 * 3);
    		}
    	}catch(e){
    		throw new Error(this.i18n.editGroupFail+e.message);
    	}
    },
    /**
     *  删除组织
     */
    _delOrg : function (e) {
    	try{
    		//1.获取当前被选中的树节点
    		//2.去得name  id
    		var nodes = this.organizationTree.getSelectedNodes();
    		if(nodes.length){
    			if(nodes[0].level !== 0){
    				var org = {};
            		org.name = nodes[0].name;
            		org.id = nodes[0].id;
            		(new com.sms.common.stdcomponentdelete({
            			body:"<div>"+
            				 	"<div class='alert alert-info'>"+
            				 		"<span class='glyphicon glyphicon-exclamation-sign'></span>"+this.i18n.affirm+"？"+
            				 	"</div>"+
            				 "</div>",
            			title:this.i18n.removeGroup+org.name,
            			dataobject:"organization",
            			dataobjectids:JSON.stringify([parseInt(org.id)])
            		})).override({
            			refreshDataTable:this.proxy(function(){
            				this.clearData();
            				this._options.treeid = null;
            				this._getOrgTree();
            			})
            		});
    			}else{
    				$.u.alert.error("当前组织不能删除", 1000 * 3);
    			}
    		}else{
                $.u.alert.error("未选择任何组织", 1000 * 3);
    		}
    	}catch(e){
    		throw new Error(this.i18n.removeGroupFail+e.message);
    	}
    },
    /**
     *  添加成员
     */
    _addUser : function () {
    	var nodes = this.organizationTree.getSelectedNodes();
		if(nodes.length){
			this._options.treeid = nodes[0].id;
    		var dialogOptions = null;
    		this._options.mode = "ADD";
        	dialogOptions = {
                title: "添加成员",
                buttons: [
                    {
                        text: "添加",
                        click: this.proxy(function (e) {
                        	e.preventDefault();
                        	this._options.mode = "OP";
                        	if (this.addform.valid()) {
                                var $userName = this.member.select2("data");
                                var userNameLength = $userName.length;
                                var userIds = [];
                                for (var i = 0; i < userNameLength; i++) {
                                    userIds.push($userName[i].id);
                                }
                                this._sendModifyAjax({
                                	 "tokenid": $.cookie("tokenid"),
                                     "method": "modifyOrganization",
                                     "paramType": "updateOrganization",
                                     "operate": "addUsers",
                                     "dataobjectid": nodes[0].id,
                                     "obj": JSON.stringify({
                                         "users": userIds
                                     })
                        			
	                      		})
                            }
                        })
                    },
                    {
                        text: "取消",
                        "class": "aui-button-link",
                        click: this.proxy(function (e) {
                        	e.preventDefault();
                            this.addMebDialog.dialog("close");
                        })
                    }
                ]
            };
            this.member.select2({
            	ajax: { 
    	            url: $.u.config.constant.smsqueryserver,
    	            dataType: 'json',
    	            type: "post",
    	            data: this.proxy(function(term,page){
    					 return {
    						tokenid: $.cookie("tokenid"),
                            method: "stdcomponent.getbysearch",
                            dataobject: "user",
                            start: (page - 1) * this._select2PageLength,
                            length: this._select2PageLength,
                            rule: JSON.stringify([
                                [{
                                    "key": "fullname",
                                    "op": "like",
                                    "value": term
                                }]
                            ])
    					 };
    				 }),
    	            results: this.proxy(function (data, page) { 
                        if(data.success){
        	                return {
                                results: data.data.aaData 
                            };
                        }
                        else{
                            $.u.alert.error(data.reason, 1000 * 3);
                        }
    	            })
    	        },
                id: function(item){
                    return item.id;
                },
                formatSelection: function(item){
                    return item.displayName;
                },
                formatResult: function(item){
                    return item.displayName;
                },
                multiple : true
            });
            this.addMebDialog.dialog("option",dialogOptions).dialog("open");
		}else{
            $.u.alert.error("未选择任何组织", 1000 * 3);
		}
    },
    /**
	 * 添加 编辑请求
	 * 1.添加组织：当添加时已选定组织，添加之后继续选定，右侧数据更新；未选定，不做操作，右侧数据清空
	 * 2.编辑组织：一定选定组织，右侧数据更新
	 * 
	 */
	_sendModifyAjax:function(data){
    	$.u.ajax({
			url : $.u.config.constant.smsmodifyserver,
			type : "post",
			data : data,
			dataType:"JSON"
		},this.addOrgDialog.parent()).done(this.proxy(function(response) {
			if (response.success) {
				this.addOrgDialog.dialog("close");
				this.clearData();
		    	this.addMebDialog.dialog("close");
				this.delMebDialog.dialog("close");
            }
		})).fail(this.proxy(function(jqXHR,errorText,errorTHrown){

    	}))
	},
	/**
	 * 成员删除
	 */
	on_delete_click:function(e){
		e.preventDefault();   	
    	try{
    		var nodes = this.organizationTree.getSelectedNodes();
    		if(nodes.length){
        		var data = JSON.parse($(e.currentTarget).attr("data"));
        		var did = parseInt(data.id);
        		var dialogOptions = null;
            	dialogOptions = {
                    title: "删除成员:" + data.name,
                    buttons: [
                        {
                            text: "确定",
                            click: this.proxy(function (e) {
                            	e.preventDefault();
                                this._sendModifyAjax({
                        			"tokenid":$.cookie("tokenid"),
                          		    "method":"modifyOrganization",
    	                      		"paramType" : "updateOrganization",
    	                      		"operate" : "deleteUsers",
    	                      		"dataobjectid":nodes[0].id,
    	                      		"obj":JSON.stringify({
    	                      			"users":[did]
    	                      		})
                          		})
                            })
                        },
                        {
                            text: "取消",
                            "class": "aui-button-link",
                            click: this.proxy(function (e) {
                            	e.preventDefault();
                                this.delMebDialog.dialog("close");
                            })
                        }
                    ]
                };
                this.delMebDialog.dialog("option",dialogOptions).dialog("open");
    		}else{
    			$.u.alert.error("未选择任何组织", 1000 * 3);
    		}
    	}catch(e){
    		throw new Error("删除失败 "+e.message);
    	}
	},
	/**
	 * 填充表单
	 */
	fillFormData:function(data){
        var selectNode = null;
        this.oLevel.val(data.g || '')
		this.qid("edit_name").val(data.a);
		this.systems.select2("data",data.b);
		this.parent.val(data.c.name||"");
		this.parent.attr("value",data.c.id||"");
		this.previousParent.select2("data",data.d);
		this.qid("deptCode").val(data.e||'');
    	this.qid("deptCodeDesc").val(data.f||'');
        if(data.unit && data.unit.id){
            this.unit.select2("data", data.unit);
        }else{
            this.unit.select2("data", '');
        }
        selectNode = this.tree.getNodeByParam("id", data.c.id, null);
        if(selectNode){
            this.tree.selectNode(selectNode);
        }
	},
	/**
	 * 获取表单数据
	 */
	getFormData:function(){
		var con = {};
		$.each(this.form.serializeArray(),this.proxy(function(k,v){
			con[v.name]=v.value;
		}));
		var conn = [];
		var conSys = con.systems.split(",");
		$.each(conSys,function(k,v){
			conn.push(parseInt(v));
		})
		con.systems = conn;
		if(this.parent.val()){
			con.parent = parseInt(this.parent.attr("value")) || null;
		}else{
			con.parent = null;
		};
        con.oLevel = this.oLevel.val();
		con.previousParent = parseInt(con.previousParent) || null;
        con.unit = this.unit.select2("val") ? parseInt(this.unit.select2("val")) : null;
		return con;
	},
	/**
	 * getAddFormData
	 */
	getAddFormData:function(){ 
		var con = {};
		$.each(this.addform.serializeArray(),this.proxy(function(k,v){
			con[v.name]=v.value;
		}));
		var conn = [];
		// var conUsers = con.users.split(",");
		// $.each(conUsers,function(k,v){
		// 	conn.push(parseInt(v));
		// })
		con.users = this.member.select2("data");
		return con;
	},
	/**
	 * 清空表单
	 */
	clearFormData : function(){
		$('input',this.form).val('');
		this.form.validate().resetForm();
		this.systems.select2("data","");
        this.unit.select2("data","");
		this.previousParent.select2("data","");
	},
	clearData:function(){
		this.orgName.text("");
    	this.orgSystem.text("");
        this.orgUnit.text("");
        this.userUnit.text("");
        this.orgDeptCode.text("");
        this.orgDeptCodeDesc.text("");
    	this.dataTable.fnClearTable();
	},
    destroy: function () {
        this._super();
    }
}, { usehtm: true, usei18n: true });


com.sms.plugin.organization.org.widgetjs = ['../../../../uui/widget/jqdatatable/js/jquery.dataTables.js', 
                                            '../../../../uui/widget/jqdatatable/js/dataTables.bootstrap.js',
                                            '../../../../uui/widget/jqurl/jqurl.js',
                                            '../../../../uui/widget/jqztree/js/jquery.ztree.all-3.5.js',
                                            '../../../../uui/widget/select2/js/select2.min.js',
                                            ];
com.sms.plugin.organization.org.widgetcss = [{ path: '../../../../uui/widget/jqdatatable/css/jquery.dataTables.css' }, 
                                             { path: '../../../../uui/widget/jqdatatable/css/dataTables.bootstrap.css' },
                                             { path: '../../../../uui/widget/jqztree/css/zTreeStyle/zTreeStyle.css'},
                                             { path: '../../../../uui/widget/select2/css/select2.css'},
                                             { path: '../../../../uui/widget/select2/css/select2-bootstrap.css'}];