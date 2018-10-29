//@ sourceURL=com.sms.user.user
$.u.define('com.sms.user.user', null, {
    init: function (options) {
        this._options = options;
    },
    afterrender: function () {
    	this.i18n =com.sms.user.user.i18n;
    	// 账户名筛选
    	this.usernameContains=this.qid("usernamecontains");
    	
    	// 用户名筛选
    	this.fullnameContains=this.qid("fullnamecontains");
    	
    	// 邮箱筛选
    	this.emailContains=this.qid("emailcontains");
    	
    	// 工作组筛选
    	this.groupContains=this.qid("groupscontains");
    	
    	// 筛选按钮
    	this.btnFilter=this.qid("btn_filter");
    	
    	// 重置筛选条件
    	this.btnResetFilter=this.qid("btn_resetfilter");
    	
    	// 创建用户
    	this.btnCreateUser=this.qid("btn_createuser");
    	
    	
    	this.treeContent = this.qid("treeContent");
        this.organization=this.qid("organization");
        this.unit= this.qid("unit");
        // 筛选按钮事件
        this.btnFilter.click(this.proxy(function () {
            this.dataTable.fnDraw();
        }));
        
        // 清除筛选按钮事件
        this.btnResetFilter.click(this.proxy(function () {
            this.clearForm(this.qid("filter"));
            this.dataTable.fnDraw();
        }));
        
        // 创建用户事件
        this.btnCreateUser.click(this.proxy(function () {
        	if(!this.userDialog){
        		var clz = $.u.load("com.sms.user.userdialog");
        		this.userDialog = new clz(this.$.find("div[umid=userDialog]"));
        		this.userDialog.override({
                    refreshDataTable: this.proxy(function () {
                        this.dataTable.fnDraw(true);
                    })
                });
        	}
            this.userDialog.open();
        }));

        // 异步加载工作组下拉框后再初始化dataTable，用户组跳转链接到此组件时需设置工作组下拉框后再查询
        this.groupContains.attr("disabled",true);
        $.u.ajax({
        	url: $.u.config.constant.smsqueryserver,
            type:"post",
            dataType: "json",
            cache: false,
            data: {
        		"tokenid":$.cookie("tokenid"),
        		"method":"stdcomponent.getbysearch",
        		"dataobject":"userGroup"
	        }
        }, this.groupContains.parent()).done(this.proxy(function(response){
        	if(response.success){
        		$.each(response.data.aaData,this.proxy(function(idx,group){
        			$("<option/>").attr("value",group.id).text(group.name).appendTo(this.groupContains);
        		}));
        		var userGroup =$.urlParam().userGroup;
        		if(userGroup){
        			this.groupContains.val(userGroup);
        		}
        	}
        	this.dataTable = this.qid("datatable").dataTable({
                searching: false,
                serverSide: true,
                bProcessing: true,
                ordering: false,
                sDom: "t<ip>",
                "columns": [
                    { "title": this.i18n.columns.accountName,"mData":"username", "sWidth": 200 },
                    { "title": this.i18n.columns.userName, "mData": "fullname", "sWidth": 350 },
                    { "title": this.i18n.columns.login ,"mData":"id", "sWidth": 350 },
                    { "title": this.i18n.columns.userGroup,"mData":"usergroup", "sWidth": 250 },
                    { "title": this.i18n.columns.group,"mData":"organization", "sWidth": 250 },
                    { "title": this.i18n.columns.userSource,"mData":"type", "sWidth": 250 },
                    { "title": this.i18n.columns.handle,"mData":"id", "sWidth": 350 }
                ],
                "aoColumnDefs": [
					{
					    "aTargets": 0,
					    "mRender": function (data, type, full) {
					    	// if(full.status === "正常"){
					    		return "<a href='../ViewProfile.html?id="+full.id+"' class='btn view btn-link' data='"+JSON.stringify(full)+"'><img src='"+full.avatarUrl+"' width='16' height='16'/>&nbsp;" + data + "</a>";	
					    	// }else{
					    		// return "<a href='../ViewProfile.html?id="+full.id+"' class='btn view btn-link' data='"+JSON.stringify(full)+"' ><img src='"+full.avatarUrl+"' width='16' height='16'/>&nbsp;<del>" + data + "</del></a>";
					    	// }
					        
					    }
					},
                    {
                        "aTargets": 1,
                        "mRender": function (data, type, full) {
                            return data + (full.email?"<br/><button class='btn btn-link'>" + full.email + "</button>":"");
                        }
                    },
                    {
                        "aTargets": 2,
                        "mRender": function (data, type, full) {
                            return "<strong>总数：</strong>" + (full.loginCount||"0") + "<br/><strong>最近一次登录：</strong>" + (full.lastLogin||"");
                        }
                    },
                    {
                        "aTargets": 3,
                        "mRender": function (data, type, full) {
                    		var htmls=["<ul style='padding-left:15px;padding-bottom:0;'>"];
                    		data && $.each(data,function(idx,group){
                    			if(group.usergroupName){
                        			htmls.push("<li><a href='UserBrowser.html?userGroup="+group.usergroupId+"'>"+group.usergroupName+"</a></li>");
                    			}
                    		});
                    		htmls.push("</ul>");
                    		return htmls.join("");
                        }
                    },{
                        "aTargets": 4,
                        "mRender": function (data, type, full) {
                    		var htmls=["<ul style='padding-left:15px;padding-bottom:0;'>"];
                    		data && $.each(data,function(idx,org){
                    			htmls.push("<li><a href='#' class='disabled'>"+org.organizationName+"</a></li>");
                    		});
                    		htmls.push("</ul>");
                    		return htmls.join("");
                        }
                    },
                    {
                        "aTargets": 6,
                        "mRender": this.proxy(function (data, type, full) {
                            return "<button type='button' class='btn btn-link group'  data='"+JSON.stringify(full)+"'>"+this.i18n.buttons.userGroup+"</button>"+
                            		// "<button type='button' class='btn btn-link status' data-status='" + (full.status === "正常" ? '' : '正常') + "' data-id='"+full.id+"'>" + (full.status === "正常" ? this.i18n.buttons.disable : this.i18n.buttons.enable) + "</button>"+
                                    //"<button type='button' class='btn btn-link org'  data='"+JSON.stringify(full)+"'>"+com.sms.user.user.i18n.group+"</button>"+
                                    "<button type='button' class='btn btn-link role' data='"+JSON.stringify(full)+"'>"+this.i18n.buttons.role+"</button>"+
                                    "<button type='button' class='btn btn-link edit' data='"+JSON.stringify(full)+"'>"+this.i18n.buttons.edit+"</button>"+
                                    "<button type='button' class='btn btn-link delete' data='" + JSON.stringify(full) + "'>"+this.i18n.buttons.remove+"</button>";
                        })
                    }
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
                "fnServerParams": this.proxy(function (aoData) {
                	var rule=[];
                	if($.trim(this.usernameContains.val())){
                		rule.push([{"key":"username","op":"like","value":this.usernameContains.val()}]);
                	}
                	if($.trim(this.fullnameContains.val())){
                		rule.push([{"key":"fullname","op":"like","value":this.fullnameContains.val()}]);
                	}
                	
                	if($.trim(this.unit.select2("val"))){
                		rule.push([{"key":"unit","op":"like","value":this.unit.select2("val")}]);
                	}
                	if($.trim(this.organization.attr("value"))){
                		rule.push([{"key":"organization","op":"like","value":this.organization.attr("value")}]);
                	}
                	if($.trim(this.emailContains.val())){
                		rule.push([{"key":"email","op":"like","value":this.emailContains.val()}]);
                	}
                	if($.trim(this.groupContains.val())){
                		rule.push([{"key":"userGroup","op":"=","value":parseInt(this.groupContains.val())}]);
                	}
                	
                	var result={"username":this.usernameContains.val()||"",
		                		"fullname":this.fullnameContains.val()||"",
		                		"email":this.emailContains.val()||"",
		                		//"unit":this.unit.select2("val")||"",
		                		"organization":this.organization.attr("value")||"",
		                		"usergroup":this.groupContains.val()||""
                				}

                	delete aoData.columns
                	delete aoData.search
                	$.extend(aoData,{
                		"tokenid":$.cookie("tokenid"),
                		"method":"getUserBySearchN",
                		//"dataobject":"user",
                		"obj":JSON.stringify(result)
                		//"columns":JSON.stringify(aoData.columns),
                		//"search":JSON.stringify(aoData.search)
                	},true);
                }),
                "fnServerData": this.proxy(function (sSource, aoData, fnCallBack, oSettings) {
                	this.btnFilter.attr("disabled",true);
                    $.u.ajax({
                        url: $.u.config.constant.smsqueryserver,
                        type:"post",
                        dataType: "json",
                        cache: false,
                        data: aoData
                    }, this.qid("datatable")).done(this.proxy(function (data) {
                        if (data.success) {
                            fnCallBack(data.data);
                        }
                    })).fail(this.proxy(function (jqXHR, errorText, errorThrown) {

                    })).complete(this.proxy(function(){
                    	this.btnFilter.attr("disabled",false);
                    }));
                })
            });
        	
            // 用户状态
            this.dataTable.off("click", "button.status").on("click", "button.status", this.proxy(function (e) {
                try{
                    var $this = $(e.currentTarget), id = parseInt($this.attr("data-id")), status = $this.attr("data-status");
                    $.u.ajax({
                        url: $.u.config.constant.smsmodifyserver,
                        type: "post",
                        dataType: "json",
                        data: {
                            "tokenid": $.cookie("tokenid"),
                            "method": "stdcomponent.update",
                            "dataobject": "user",
                            "dataobjectid": id,
                            "obj": JSON.stringify({"status": status || null})
                        }
                    }, $this.closest("tr")).done(this.proxy(function(response){
                        if(response.success){
                            this.dataTable.fnDraw(true);
                        }
                    }));
                } catch (e) {
                    throw new Error(this.i18n.messages.editFail + e.message);
                }
            }));

        	// 编辑用户
            this.dataTable.off("click", "button.edit").on("click", "button.edit", this.proxy(function (e) {
                var $this = $(e.currentTarget);
                try{
                	if(!this.userDialog){
                		var clz = $.u.load("com.sms.user.userdialog");
                		this.userDialog = new clz(this.$.find("div[umid=userDialog]"));
                		this.userDialog.override({
                            refreshDataTable: this.proxy(function () {
                                this.dataTable.fnDraw(true);
                            })
                        });
                	}
                    this.userDialog.open(JSON.parse($this.attr("data")));
                } catch (e) {
                    throw new Error(this.i18n.messages.editFail + e.message);
                }
            }));
         
            // 编辑用户组
            this.dataTable.off("click", "button.group").on("click", "button.group", this.proxy(function (e) {
                var $this = $(e.currentTarget);
                try{
                	if(!this.userGroup){
                		var clz = $.u.load("com.sms.user.usergroup");
                		this.userGroup = new clz(this.$.find("div[umid=userGroup]")); 
                		this.userGroup.override({
                        	refreshDataTable:this.proxy(function(){
                        		this.dataTable.fnDraw(true);
                        	})
                        });
                	}
                    this.userGroup.open(JSON.parse($this.attr("data")));
                } catch (e) {
                    throw new Error(this.i18n.messages.edituserGroupFail + e.message);
                }
            }));
            
            // 编辑role
            this.dataTable.off("click", "button.role").on("click", "button.role", this.proxy(function (e) {
                var $this = $(e.currentTarget);
                var data=JSON.parse($this.attr("data"));
                try{
                	var $html=$("<ul></ul>");
                	$.each(data.role||[],this.proxy(function(idx,item){
                		if(item.roleName){
                			$html.append("<li>"+item.roleName+"</li>");
                		}
                	}))
                	this.userrole = $("<div/>").append($html).dialog({
		            	title:"用户角色："+data.fullname||"",
		                width:600,
		                modal: true,
		                draggable: false,
		                resizable: false,
		                autoOpen: true,
		                open: this.proxy(this.on_infoDialog_open),
		                close: this.proxy(this.on_infoDialog_close),
		                buttons:[{
                            "text":"关闭",
                            "class":"aui-button-link",
                            "click":this.proxy(function(){
                            	this.userrole.dialog("close");
                            })
                    	}]
		            }).dialog("open");
                	
                } catch (e) {
                    throw new Error("角色 对话框 " + e.message);
                }
            }));
            // 编辑组织
            this.dataTable.off("click", "button.org").on("click", "button.org", this.proxy(function (e) {
                var $this = $(e.currentTarget);
                try{
                	if(!this.userOrg){
                		var clz = $.u.load("com.sms.user.userorg");
                		this.userOrg = new clz(this.$.find("div[umid=userOrg]"));
                		this.userOrg.override({
                        	refreshDataTable:this.proxy(function(){
                        		this.dataTable.fnDraw(true);
                        	})
                        });
                	}
                    this.userOrg.open(JSON.parse($this.attr("data")));
                } catch (e) {
                    throw new Error(this.i18n.messages.editgroupFail + e.message);
                }
            }));
            
            // 删除用户
            this.dataTable.off("click", "button.delete").on("click", "button.delete", this.proxy(function (e) {
            	try{
            		var user = JSON.parse($(e.currentTarget).attr("data"));
            		$.u.load("com.sms.common.stdcomponentdelete");
            		(new com.sms.common.stdcomponentdelete({
            			body:"<div>"+
            				 	"<div class='alert alert-warning'>"+
            				 		"<span class='glyphicon glyphicon-exclamation-sign'></span>"+this.i18n.removeUserDialog.affirm+"'"+user.username+"'。"+this.i18n.removeUserDialog.remaind+""+
            				 	"</div>"+
            				 "</div>",
            			title:this.i18n.removeUserDialog.title + user.username,
            			dataobject:"user",
            			dataobjectids:JSON.stringify([parseInt(user.id)])
            		})).override({
            			refreshDataTable:this.proxy(function(){
            				this.dataTable.fnDraw();
            			})
            		});
            	}catch(e){
            		throw new Error(this.i18n.messages.removeUserFail+e.message);
            	}
            }));
            
        })).fail(this.proxy(function(jqXHR,errorText,errorThrown){
        	
        })).complete(this.proxy(function(jqXHR,errorText,errorThrown){
        	this.groupContains.attr("disabled",false);
        }));
        
    	
   /*
      //安监机构
        this.unit.select2({
     		placeholder: "选择",
     		allowClear:true,
         	ajax:{
 	        	url: $.u.config.constant.smsqueryserver,
 	        	type: "post",
 	            dataType: "json",
 	        	data: this.proxy(function(term, page){
 	        		return {
 	        			"tokenid":$.cookie("tokenid"),
 	        			"method":"getunits",
 	        			"unitName":term,
        				"start": (page - 1) * 5,
	    				"length": 5	  
 	        		};
 	    		}),
 		        results:this.proxy(function(data,page){
 		        	if(data.success){
 		        		return {results:$.map(data.data,function(item,idx){
 		        			return item;
 		        		})};
 		        	}
 		        })
 	        },
 	        formatResult: function(item){
 	        	return item.name;      		
 	        },
 	        formatSelection: function(item){
 	        	return item.name;	        	
 	        }
         }).on("select2-selecting", this.proxy(function(e) {
        	 this.organization.val("");
		     this.organization.attr("value","");
    	
    	}));
        
        */
      //组织
        this.organization.off("click").on("click",this.proxy(function(e){
			var offset = $(e.target).offset();
			this._getOrgTree();
			var width=this.organization.width();
 			this.treeContent.css("width",width+"px");
 			this.treeContent.css("height","350px");
			this.treeContent.css({left:offset.left + "px", top:offset.top + $(e.currentTarget).outerHeight() + "px"}).slideDown("fast");
			$("body").bind("mousedown", this.proxy(this.onBodyDown));
    	}));
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
    				beforeClick:this.proxy(function(treeId, treeNode, clickFlag){
    					this.organization.val(treeNode.name);
						this.organization.attr("value",treeNode.id);
						this.treeContent.fadeOut("fast");
    				})
    			}
    		};
    	var data=null;
 /*   	if(this.unit.val()){
    		data={
        		    "tokenid":$.cookie("tokenid"),
            		"method":"getByUnit",
            		"dataobject":"organization",
            		"unitId":this.unit.val()
                }
    	}else{*/
    		 data={
         		    "tokenid":$.cookie("tokenid"),
             		"method":"getAllOrganizations"
                 }
    /*	}*/
    	$.u.ajax({
    		url: $.u.config.constant.smsqueryserver,
            type:"post",
            dataType: "json",
            cache: false,
            data: data
    	},this.libTree).done(this.proxy(function(response){
    		if(response.success){
    			var aadata=[];
    			if(response.data && response.data.length > 0){
    				aadata=response.data;
    			}else if(response.data.aaData && response.data.aaData.length > 0){
    				aadata=response.data.aaData;
    			}
				var zNodes=$.map(aadata,this.proxy(function(perm,idx){
    				return {
                        id:perm.id,
                        pId:perm.parentId,
                        name:perm.name
                    };
    			}));
    			//下拉树
    			this.tree=$.fn.zTree.init(this.qid("tree"), setting, zNodes);
    			var sNodes_tree = this.tree.getNodes();
    			if (sNodes_tree.length) {
    				this.tree.expandNode(sNodes_tree[0], true, false, true);
    			}else{
    				this.qid("tree").append("<div>暂无数据！</div>")
    			}
    			
    			
    		}
    	})).fail(this.proxy(function(jqXHR,errorText,errorTHrown){
    		
    	}))
    },
    
 
    clearForm: function ($target) {
        $target.find("input,textarea,select").each(function () {
            switch (this.type) {
                case "password":
                case "text":
                case "textarea":
                	$(this).val("");
                	$(this).attr("value","");
                	$(this).select2("val","");
                	   break;
                case "select-one":
                case "select-multiple":
                    $(this).val("");
                    break;
                case "checkbox":
                case "radio":
                    $(this).prop("checked", false);
                    break;
                    // no default
            }
        });
    },
    destroy: function () {
        this._super();
    }
}, { usehtm: true, usei18n: true });

com.sms.user.user.widgetjs = ['../../../uui/widget/jqurl/jqurl.js',
                              '../../../uui/widget/jqdatatable/js/jquery.dataTables.js', 
                              '../../../uui/widget/jqdatatable/js/dataTables.bootstrap.js',
                              "../../../uui/widget/select2/js/select2.min.js",
                              '../../../uui/widget/jqztree/js/jquery.ztree.all-3.5.js'];
com.sms.user.user.widgetcss = [{ path: '../../../uui/widget/jqdatatable/css/jquery.dataTables.css' },
                               { path: '../../../uui/widget/jqdatatable/css/dataTables.bootstrap.css' },
                               { path: "../../../uui/widget/select2/css/select2.css"},
                               { path: "../../../uui/widget/select2/css/select2-bootstrap.css" },
                               { path: '../../../uui/widget/jqztree/css/zTreeStyle/zTreeStyle.css'}];