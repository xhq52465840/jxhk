//@ sourceURL=com.sms.user.usergroup
$.u.define('com.sms.user.usergroup', null, {
    init: function (options) {
        this._options = options;
        this.userdat=null;
    },
    afterrender: function (bodystr) {
    	this.i18n =com.sms.user.usergroup.i18n;
    	// 当前系统有效用户组
    	this.selUserGroups=this.qid("availablegroups");
    	
    	// 当前用户所属用户组
    	this.selCurrUserGroups=this.qid("currentgroups");
    	
    	// 加入选择的用户组按钮
    	this.btnJoinSelectedGroups=this.qid("btn_joinselectedgroups");
    	
    	// 离开选择的用户组按钮
    	this.btnLeaveSelectedGroups=this.qid("btn_leaveselectedgroups");
    	
    	// 加入选择的用户组的按钮事件
        this.btnJoinSelectedGroups.button().click(this.proxy(function(e){
        	e.preventDefault();
        	$.each(this.selUserGroups.children("option:selected"),this.proxy(function(idx,obj){
        		var $option=$(obj);
        		if(this.selCurrUserGroups.find("option[value='"+$option.val()+"']").length < 1){
        			$("<option/>").attr("value",$option.val()).text($option.text()).appendTo(this.selCurrUserGroups);
        			this.selUserGroups.children("option:selected").remove();
        		}
        	}));
        }));
        
        // 离开选择的用户组的按钮事件
        this.btnLeaveSelectedGroups.button().click(this.proxy(function(e){
        	e.preventDefault();
        	this.selCurrUserGroups.children("option:selected").remove().appendTo(this.selUserGroups);
        }));

        this.userGroupDialog = this.qid("div_usergroup").dialog({
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
	            		  this.selUserGroups.add(this.selCurrUserGroups).attr("disabled",true);
	            		  $(e.currentTarget).add($(e.currentTarget).next()).add(this.btnJoinSelectedGroups).add(this.btnLeaveSelectedGroups).button("disable");
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
	                      		"obj":JSON.stringify({"userGroups":$.map(this.selCurrUserGroups.children("option"),function(obj,idx){
	                      			return parseInt($(obj).val());
	                      		})})
	                          }
	            		  }).done(this.proxy(function(response){
	            			  if(response.success){
	            				  this.userGroupDialog.dialog("close");
	            				  this.refreshDataTable();
	            			  }
	            		  })).fail(this.proxy(function(jqXHR,errorText,errorThrown){
	            			  
	            		  })).complete(this.proxy(function(jqXHR,errorStatus){
	            			  this.selUserGroups.add(this.selCurrUserGroups).attr("disabled",false);
	            			  $(e.currentTarget).add($(e.currentTarget).next()).add(this.btnJoinSelectedGroups).add(this.btnLeaveSelectedGroups).button("enable");
	            		  }));
	            	  })
	              },
                {
                    text: this.i18n.cancel,
                    "class": "aui-button-link",
                    click: this.proxy(function () {
                        this.userGroupDialog.dialog("close");
                    })
                }
            ],
            create: this.proxy(function () {

            }),
            open: this.proxy(function () {
            	this.selUserGroups.attr("disabled",true);
            	this.btnJoinSelectedGroups.button("disable");
            	$.u.ajax({
            		url: $.u.config.constant.smsqueryserver,
                    type:"post",
                    dataType: "json",
                    cache: false,
                    async: false,
                    data: {
                		"tokenid":$.cookie("tokenid"),
                		"method":"stdcomponent.getbysearch",
                		"dataobject":"userGroup"
                    }
            	}, this.selUserGroups).done(this.proxy(function(response){
            		if(response.success){
            			this.selUserGroups.empty();
            			$.each(response.data.aaData,this.proxy(function(idx,group){
            				$("<option/>").attr("value",group.id).text(group.name).appendTo(this.selUserGroups);
            			}));
            		}
            	})).fail(this.proxy(function(jqXHR,errorText,errorThrown){
            		
            	})).complete(this.proxy(function(jqXHR,errorStatus){
            		this.selUserGroups.attr("disabled",false);
                	this.btnJoinSelectedGroups.button("enable");
            	}));
            	this.selCurrUserGroups.empty();
            	if(this.userdata && this.userdata.usergroup){
            		$.each(this.userdata.usergroup,this.proxy(function(idx,group){
            			$('option[value="'+group.usergroupId+'"]', this.selUserGroups).remove();
            			$("<option/>").attr("value",group.usergroupId).text(group.usergroupName).appendTo(this.selCurrUserGroups);
            		}));
            	}
            }),
            close:this.proxy(function(){
            	this.selCurrUserGroups.empty();
            })
        }); 
    },
    open: function (userdata) {
    	if(userdata){
	    	this.userdata=userdata;
	        this.userGroupDialog.dialog("option","title",com.sms.user.usergroup.i18n.editUserGroup+userdata.fullname).dialog("open");
    	}else{
    		alert("未接收到userdata");
    	}
    },
    destroy: function () {
        this._super();
        this.userGroupDialog.dialog("destroy").remove();
    }
}, { usehtm: true, usei18n: true });

com.sms.user.usergroup.widgetjs = [];
com.sms.user.usergroup.widgetcss = [];