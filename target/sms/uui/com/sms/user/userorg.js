//@ sourceURL=com.sms.user.userorg
$.u.define('com.sms.user.userorg', null, {
    init: function (options) {
        this._options = options;
        this.userdat=null;
    },
    afterrender: function (bodystr) {
    	this.i18n =com.sms.user.userorg.i18n;
    	// 当前系统有效组织树
    	this.orgTree=this.qid("orgTree");
    	
    	// 当前用户所属组织
    	this.selCurrUserOrgs=this.qid("currentorgs");
    	
    	// 加入选择的组织按钮
    	this.btnJoinSelectedOrgs=this.qid("btn_joinselectedorgs");
    	
    	// 离开选择的组织按钮
    	this.btnLeaveSelectedOrgs=this.qid("btn_leaveselectedorgs");
    	
    	// 加入选择的组织的按钮事件
        this.btnJoinSelectedOrgs.button().click(this.proxy(function(e){
        	e.preventDefault();
        	var selectedOrgs = this.orgTree.getSelectedNodes();
        	$.each(selectedOrgs,this.proxy(function(idx,org){
        		$("<option/>").attr("value",org.id).text(org.name).appendTo(this.selCurrUserOrgs);
        	}));
        	this.orgTree.cancelSelectedNode();
        }));
        
        // 离开选择的组织的按钮事件
        this.btnLeaveSelectedOrgs.button().click(this.proxy(function(e){
        	e.preventDefault();
        	this.selCurrUserOrgs.children("option:selected").remove();
        }));

        this.userOrgDialog = this.qid("div_userorg").dialog({
            title:this.i18n.editUserGroup,
            width:540,
            modal: true,
            draggable: false,
            resizable: false,
            autoOpen: false,
            buttons: [
	              {
	            	  text:this.i18n.save,
	            	  click:this.proxy(function(e){
	            		  this.selCurrUserOrgs.attr("disabled",true);
	            		  $(e.currentTarget).add($(e.currentTarget).next()).add(this.btnJoinSelectedOrgs).add(this.btnLeaveSelectedOrgs).button("disable");
	            		  $.ajax({
	            			  url: $.u.config.constant.smsmodifyserver,
	                          type:"post",
	                          dataType: "json",
	                          cache: false,
	                          data: {
	                      		"tokenid":$.cookie("tokenid"),
	                      		"method":"stdcomponent.update",
	                      		"dataobject":"user",
	                      		"dataobjectid":this.userdata.id,
	                      		"obj":JSON.stringify({"organizations":$.map(this.selCurrUserOrgs.children("option"),function(obj,idx){
	                      			return parseInt($(obj).val());
	                      		})})
	                          }
	            		  }).done(this.proxy(function(response){
	            			  if(response.success){
	            				  this.userOrgDialog.dialog("close");
	            				  this.refreshDataTable();
	            			  }
	            		  })).fail(this.proxy(function(jqXHR,errorText,errorThrown){
	            			  
	            		  })).complete(this.proxy(function(jqXHR,errorStatus){
	            			  this.selCurrUserOrgs.attr("disabled",false);
	            			  $(e.currentTarget).add($(e.currentTarget).next()).add(this.btnJoinSelectedOrgs).add(this.btnLeaveSelectedOrgs).button("enable");
	            		  }));
	            	  })
	              },
                {
                    text: this.i18n.cancel,
                    "class": "aui-button-link",
                    click: this.proxy(function () {
                        this.userOrgDialog.dialog("close");
                    })
                }
            ],
            create: this.proxy(function () {

            }),
            open: this.proxy(function () {
            	var setting = {
        			data: {
        				simpleData: {
        					enable: true
        				}
        			},
        			check:{
        				enable:false
        			},
        			async:{
        				enable:true,
        				url:function(treeId,treeNode){
        					return $.u.config.constant.smsqueryserver;
        				},
        				otherParam:{
                    		"tokenid":$.cookie("tokenid"),
                    		"method":"getAllOrganizations"
                        },
                        dataType:"json",
        				dataFilter:function(treeId,parentNode,responseData){
        					if(responseData.success){
        						return $.map(responseData.data.aaData,function(org,idx){
        							return {id:org.id,pId:org.parentId,name:org.name};
        						});
        					}
	        			}
        			}
        		};
            	this.orgTree=$.fn.zTree.init(this.qid("orgTree"),setting, null);
            	
            	this.selCurrUserOrgs.empty();
            	if(this.userdata && this.userdata.organizations){
            		$.each(this.userdata.organizations,this.proxy(function(idx,org){
            			$("<option/>").attr("value",org.id).text(org.name).appendTo(this.selCurrUserOrgs);
            		}));
            	}
            }),
            close:this.proxy(function(){
            	this.orgTree.destroy();
            	this.selCurrUserOrgs.empty();
            })
        }); 
    },
    open: function (userdata) {
    	if(userdata){
	    	this.userdata=userdata;
	        this.userOrgDialog.dialog("option","title",com.sms.user.userorg.i18n.editGroup+userdata.fullname).dialog("open");
    	}else{
    		alert("未接收到userdata");
    	}
    },
    destroy: function () {
        this._super();
        this.userOrgDialog.dialog("destroy").remove();
    }
}, { usehtm: true, usei18n: true });

com.sms.user.userorg.widgetjs = ["../../../uui/widget/jqztree/js/jquery.ztree.all-3.5.js"];
com.sms.user.userorg.widgetcss = [{id:"ztreestyle",path:"../../../uui/widget/jqztree/css/zTreeStyle/zTreeStyle.css"}];