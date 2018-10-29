//@ sourceURL=com.sms.group.groupmembers
$.u.define('com.sms.group.groupmembers', null, {
    init: function (options) {
        this._options = options;
        this.groupdata = null;
        this._select2PageLength = 10;
    },
    afterrender: function (bodystr) {
    	this.i18n = com.sms.group.groupmembers.i18n;
    	// 用户组成员
    	this.selGroupMembers=this.qid("groupmembers");
    	
    	// 用户下拉框
    	this.selUsers=this.qid("users");
    	
    	// 删除选中成员
    	this.btnRemoveSelectedUsers=this.qid("btn_removeselectedusers");
    	
    	// 删除选中成员事件
        this.btnRemoveSelectedUsers.button().click(this.proxy(function(e){
        	e.preventDefault();
        	this.selGroupMembers.children("option:selected").remove();
        }));
        
        // 用户下拉框初始化
        this.selUsers.select2({
        	width:335,
        	ajax:{
	        	url: $.u.config.constant.smsqueryserver,
	            dataType: "json",
	            data: this.proxy(function(term,page){
        			return {
        				tokenid:$.cookie("tokenid"),
        				method:"stdcomponent.getbysearch",
        				dataobject:"user",
        				search:JSON.stringify({"value":term}),
                        start: (page - 1) * this._select2PageLength,
                        length: this._select2PageLength
        			};
		        }),
		        results: this.proxy(function(data,page){
		        	if(data.success){
		        		return {
                            results: data.data.aaData,
                            more: data.data.iTotalRecords > (page * this._select2PageLength)
                        };
		        	}
		        })
	        },
            formatResult:function(item){
                return "<img src='" + item.avatarUrl + "' width='16' height='16'/>&nbsp;" + item.fullname + "(" + item.username + ")";
            },
            formatSelection:function(item){
                return "<img src='" + item.avatarUrl + "' width='16' height='16'/>&nbsp;" + item.fullname + "(" + item.username + ")";
            }
        });
        
        // 用户下拉框选中事件
        this.selUsers.on("select2-selecting",this.proxy(function(e){
        	if(this.selGroupMembers.children("option[value='"+e.object.id+"']").length < 1){
        		$("<option/>").attr("value",e.object.id).text(e.object.username + "(" + e.object.fullname + ")").appendTo(this.selGroupMembers);
        	}
        }));

        this.groupDialog = this.qid("div_groupmembers").dialog({
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
                    		  this.selUsers.select2("enable",false);
                    		  this.selGroupMembers.attr("disabled",true);
                    		  $(e.currentTarget).add($(e.currentTarget).next()).add(this.btnRemoveSelectedUsers).button("disable");
                    		  
                    		  $.ajax({
                    			  url: $.u.config.constant.smsmodifyserver,
                                  type:"post",
                                  dataType: "json",
                                  cache: false,
                                  data: {
                              		"tokenid":$.cookie("tokenid"),
                              		"method":"stdcomponent.update",
                              		"dataobject":"userGroup",
                              		"dataobjectid":this.groupdata.id,
                              		"obj":JSON.stringify({"users":$.map(this.selGroupMembers.children("option"),function(obj,idx){
                              			return parseInt($(obj).val());
                              		})})
  	                            }
                    		  }).done(this.proxy(function(response){
                    			  if(response.success){
                    				  this.groupDialog.dialog("close");
                    				  this.refreshDataTable();
                    			  }
                    		  })).fail(this.proxy(function(jqXHR,errorText,errorThrown){
                    			  
                    		  })).complete(this.proxy(function(jqXHR,errorStatus){
                    			  this.selUsers.select2("enable",true);
                    			  this.selGroupMembers.attr("disabled",false);
                    			  $(e.currentTarget).add($(e.currentTarget).next()).add(this.btnRemoveSelectedUsers).button("enable");
                    		  }));
                    	  })
                      },
			            {
			                text: this.i18n.cancel,
			                "class": "aui-button-link",
			                click: this.proxy(function () {
			                    this.groupDialog.dialog("close");
			                })
			            }
            ],
            create: this.proxy(function () {
            	
            }),
            open: this.proxy(function () {
            	if(this.groupdata && this.groupdata.users){
            		$.each(this.groupdata.users,this.proxy(function(idx,user){
            			$("<option/>").attr("value",user.id).text(user.name).appendTo(this.selGroupMembers);
            		}));
            	}
            }),
            close:this.proxy(function(){
            	this.selUsers.select2("val","");
            	this.selGroupMembers.empty();
            })
        }); 
    },
    open: function (groupdata) {
    	if(groupdata){
    		this.groupdata=groupdata;
    		this.groupDialog.dialog("option","title",this.i18n.editUserGroup+groupdata.name).dialog("open");
    	}
    },
    destroy: function () {
        this._super();
        this.groupDialog.dialog("destroy").remove();
    }
}, { usehtm: true, usei18n: true });

com.sms.group.groupmembers.widgetjs = ['../../../uui/widget/select2/js/select2.min.js'];
com.sms.group.groupmembers.widgetcss = [{id:"",path:"../../../uui/widget/select2/css/select2.css"},{id:"",path:"../../../uui/widget/select2/css/select2-bootstrap.css"}];