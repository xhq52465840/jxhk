//@ sourceURL=com.sms.plugin.organization.orgmembers
$.u.define('com.sms.plugin.organization.orgmembers', null, {
    init: function (options) {
        this._options = options;
        this._orgData = null;
        this._select2UserPageLength = 10;
    },
    afterrender: function (bodystr) {
    	this.i18n = com.sms.plugin.organization.orgmembers.i18n;    	
    	this.selOrgMembers=this.qid("orgmembers");	
    	this.selUsers=this.qid("users");
    	this.btnAddUser = this.qid("btn-adduser");
    	this.btnRemoveSelectedUsers=this.qid("btn_removeselectedusers");
    	
        this.btnRemoveSelectedUsers.button().click(this.proxy(function(e){
        	e.preventDefault();
        	this.selOrgMembers.children("option:selected").remove();
        }));
        
        this.selUsers.select2({
        	width:295,
        	ajax:{
	        	url: $.u.config.constant.smsqueryserver,
	            dataType: "json",
	            type: "post",
	            data: this.proxy(function(term,page){
        			return {
        				tokenid: $.cookie("tokenid"),
        				method: "stdcomponent.getbysearch",
        				dataobject: "user",
        				start: (page - 1) * this._select2UserPageLength,
        				length: this._select2UserPageLength,
        				search: JSON.stringify({"value":term})
        			};
		        }),
		        results: this.proxy(function(data, page){
		        	if(data.success){
		        		return {
		        			results: $.map(data.data.aaData,function(user,idx){
			        			user.text = user.fullname + "(" + user.username + ")";
			        			return user;
			        		}),
			        		more: data.data.iTotalRecords > (page * this._select2UserPageLength)
		        		};
		        	}
		        })
	        }
        });
        
        this.selUsers.on("select2-selecting",this.proxy(function(e){
        	this.btnAddUser.removeClass("disabled");
        }));
        
        this.btnAddUser.click(this.proxy(function(e){
        	var user = this.selUsers.select2("data");
        	if(user && user.id && this.selOrgMembers.children("option[value='" + user.id + "']").length < 1){
        		$("<option/>").attr("value", user.id).text(user.fullname + "(" + user.username + ")").appendTo(this.selOrgMembers);
        	}else{
        		this.selUsers.select2("focus");
        	}
        	return false;
        }));

        this.orgDialog = this.qid("div_orgmembers").dialog({
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
            		  this.selOrgMembers.attr("disabled",true);
            		  $(e.currentTarget).add($(e.currentTarget).next()).add(this.btnRemoveSelectedUsers).button("disable");
            		  
            		  $.ajax({
            			  url: $.u.config.constant.smsmodifyserver,
                          type:"post",
                          dataType: "json",
                          cache: false,
                          data: {
                      		"tokenid":$.cookie("tokenid"),
                      		"method":"stdcomponent.update",
                      		"dataobject":"organization",
                      		"dataobjectid":this._orgData.id,
                      		"obj":JSON.stringify({"users":$.map(this.selOrgMembers.children("option"),function(obj,idx){
                      			return parseInt($(obj).val());
                      		})})
                        }
            		  }).done(this.proxy(function(response){
            			  if(response.success){
            				  this.orgDialog.dialog("close");
            				  this.refreshDataTable();
            			  }
            		  })).fail(this.proxy(function(jqXHR,errorText,errorThrown){
            			  
            		  })).complete(this.proxy(function(jqXHR,errorStatus){
            			  this.selUsers.select2("enable",true);
            			  this.selOrgMembers.attr("disabled",false);
            			  $(e.currentTarget).add($(e.currentTarget).next()).add(this.btnRemoveSelectedUsers).button("enable");
            		  }));
            	  })
              },
	            {
	                text: this.i18n.cancel,
	                "class": "aui-button-link",
	                click: this.proxy(function () {
	                    this.orgDialog.dialog("close");
	                })
	            }
            ],
            create: this.proxy(function () {
            	
            }),
            open: this.proxy(function () {
            	if(this._orgData && this._orgData.users){
            		$.each(this._orgData.users,this.proxy(function(idx,user){
            			$("<option/>").attr("value",user.id).text(user.name).appendTo(this.selOrgMembers);
            		}));
            	}
            }),
            close:this.proxy(function(){
            	this.selUsers.select2("val","");
            	this.btnAddUser.addClass("disabled");
            	this.selOrgMembers.empty();
            })
        }); 
    },
    open: function (orgdata) {
    	if(orgdata){
    		this._orgData=orgdata;
    		this.orgDialog.dialog("option","title",com.sms.plugin.organization.orgmembers.i18n.editGroup+orgdata.name).dialog("open");
    	}
    },
    destroy: function () {
    	this.selUsers.select2("destroy");
        this.orgDialog.dialog("destroy").remove();
        this._super();
    }
}, { usehtm: true, usei18n: true });

com.sms.plugin.organization.orgmembers.widgetjs = ['../../../../uui/widget/select2/js/select2.min.js'];
com.sms.plugin.organization.orgmembers.widgetcss = [{id:"",path:"../../../../uui/widget/select2/css/select2.css"},{id:"",path:"../../../../uui/widget/select2/css/select2-bootstrap.css"}];