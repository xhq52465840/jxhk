//@ sourceURL=com.sms.profile
$.u.load("com.sms.log.activitylog");
$.u.define('com.sms.profile', null, {
    init: function (options) {
        this._options = options;
    	this.userinfo = null;
    	this.userid = null;
    	this.dialogData= null;
    	this.rightInfo= null;
    	this.userid = $.urlParam().id;
    	!this.userid ? this.userid = $.cookie("userid") : null; 
    	this.emailUserEnums = [{name:"通知我",value:"Y"},{name:"不要通知我",value:"N"}];
    	this.defaultAccessEnums = [{name:"共享",value:"Y"},{name:"不共享",value:"N"}];
    	this.autoWatchEnums = [{name:"启用",value:"Y"},{name:"禁用",value:"N"},{name:"从全局设置继承",value:"EXTEND"}];
    },
    afterrender: function () {
    	this.i18n = com.sms.profile.i18n;
    	this.userSettingDialog = null;
    	this.userinfoDialog = null;
    	this.selectUserAvatar = null;
    	this.pwd = this.qid("pwd");
    	this.pwdText = $("#pwdText");
    	this.isFrist=true;
    	this.activityLog = new com.sms.log.activitylog($("div[umid='activity-log']",this.$),{
    		"title":this.i18n.activeLog,
    		"count":"10",
    		"rules":[{"key":"user","value":parseInt(this.userid)}],
    		"autorefresh":true,
    		"autorefreshminiute":"15"
    	}); 
    	this.loadUserInfo(this.userid);
    	this.createDialog();
    	this._exinit();
    },
    on_editUserInfo_click: function(e){
    	if(this.userinfoDialog == null){
    		var cls = $.u.load("com.sms.common.stdComponentOperate");
	    	this.userinfoDialog = new cls($("div[umid='userinfo']", this.$), {
	    		dataobject: "user",
	    		fields:[
	    		   {name: "fullname",maxlength:255,label:this.i18n.fullName,type:"text",rule:{required:true},message:this.i18n.fullNameNorNull},
	    		   {name: "email",maxlength:255,label:this.i18n.post,type:"text",rule:{required:true,email:true},message:{required:this.i18n.postNotnull,email:this.i18n.IllegalFormat}}
	    		],
	    		afterEdit: this.proxy(function(comp,formdata){
	    			comp.formDialog.dialog("close");
	    			this.loadUserInfo(this.userid);
	    		})
	    	});
    	}
    	this.userinfoDialog.open({data:$.extend({},this.userinfo,{id:this.userinfo.userid}),title:"修改配置"});
    },
    on_editUserAvatar_click: function(e){
    	if(this.selectUserAvatar == null){
    		var cls = $.u.load("com.sms.common.selectAvatar");
    		this.selectUserAvatar = new cls($("div[umid='selectUserAvatar']",this.$),{
        		uploadparam:"dataobject=userAvatar",
        		save:this.proxy(function(comp,avatar_id){
        			$.ajax({
        	        	url: $.u.config.constant.smsmodifyserver,
        		        type:"post",
        		        dataType: "json",
        		        cache: false,
        		        "data": {
        	    		  "tokenid":$.cookie("tokenid"),
        	    		  "method":"stdcomponent.update",
        	    		  "dataobject":"user",
        	    		  "dataobjectid":this.userid,
        	    		  "obj":JSON.stringify({avatar:parseInt(avatar_id)})
        		    	}
        	        }).done(this.proxy(function(response){
        	        	if(response.success){
        	        		this.loadUserInfo(this.userid);
        	    			comp.selectAvatarDialog.dialog("close");
        	        	}
        	        })).fail(this.proxy(function(jqXHR,errorText,errorThrown){
        	        	
        	        })).complete(this.proxy(function(jqXHR,errorStatus){
        	        	
        	        }));
        		})
        	});
    	}
    	this.selectUserAvatar.open({rule:JSON.stringify([[{key:"system",value:true},{key:"owner",value:this.userinfo.username}],[{key:"type",value:"user"}]])},this.userinfo.avatar);
    },
    on_editUserSetting_click: function(e){
    	if(this.userSettingDialog == null){
    		var cls = $.u.load("com.sms.common.stdComponentOperate");
	    	this.userSettingDialog = new cls($("div[umid='usersetting']", this.$), {
	    		dataobject: "user",
	    		fields:[
	    		   {name: "pageDisplayNum",maxlength:3,rule:{digits:true},message:this.i18n.pageDisplayNumNotInt, label:this.i18n.pageDisplayNum, type:"text"},
	    		   {name: "emailFormat", label:this.i18n.emailFormat, type:"enum", enums:[{name:"HTML",value:"HTML"},{name:"TEXT",value:"TEXT"}]},
	    		   {name: "emailUser", label:this.i18n.emailUser, type:"enum", enums:this.emailUserEnums},
	    		   {name: "defaultAccess", label:this.i18n.defaultAccess, type:"enum", enums:this.defaultAccessEnums},
	    		   {name: "autoWatch", label:this.i18n.autoWatch, type:"enum", enums:this.autoWatchEnums}
	    		],
	    		afterEdit: this.proxy(function(comp,formdata){
	    			$.cookie("pageDisplayNum", formdata.pageDisplayNum, {"path":"/"});
	    			comp.formDialog.dialog("close");
	    			this.loadUserInfo(this.userid);
	    		})
	    	});
    	}
    	this.userSettingDialog.open({data:$.extend({},this.userinfo,{id:this.userinfo.userid}),title:"修改配置"});
    },
    loadUserInfo:function(userid){
    	$.u.ajax({
        	url: $.u.config.constant.smsqueryserver,
	        type:"post",
	        dataType: "json",
	        "data": {
    		  "tokenid": $.cookie("tokenid"),
    		  "method": "stdcomponent.getbyid",
    		  "dataobject": "user",
    		  "dataobjectid": userid
	    	}
        },$(".userinfo",this.$), {size:2, backgroundColor:"#fff"}).done(this.proxy(function(response){
        	if(response.success){
        		this.userinfo = response.data;
                document.title = '用户信息['+(this.userinfo.fullname||'')+']';
        		this.qid("fullname").add(this.qid("label_username")).text(this.userinfo.fullname || " ");
            	this.qid("username").text(this.userinfo.username || " ");
            	this.qid("email").text(this.userinfo.email || " ");
            	this.qid("avatar-picker-trigger").add(this.qid("img_useravatar")).attr("src",this.userinfo.avatarUrl);
            	
                $.each(this.userinfo.userGroups || [], this.proxy(function(idx, group){
                    $("<li/>").text(group.name || "").appendTo(this.qid("userGroup"));
                }));
            	
            	this.qid("usersetting_pageDisplayNum").text(this.userinfo.pageDisplayNum || "");
            	this.qid("usersetting_emailFormat").text(this.userinfo.emailFormat || "");
            	this.qid("usersetting_oaDeptName").text(this.userinfo.oaDeptName || "");
            	this.qid("usersetting_emailuser").text(this._showEnumName(this.userinfo.emailUser, this.emailUserEnums));
            	this.qid("usersetting_defaultaccess").text(this._showEnumName(this.userinfo.defaultAccess, this.defaultAccessEnums));
            	this.qid("usersetting_autowatch").text(this._showEnumName(this.userinfo.autoWatch, this.autoWatchEnums));
                $.u.ajax({
                    url: $.u.config.constant.smsqueryserver,
                    type: "post",
                    dataType: "json",
                    data: {
                        tokenid: $.cookie("tokenid"),
                        method: "stdcomponent.getbysearch",
                        dataobject: "unitRoleActor",
                        rule: JSON.stringify([ [{"key": "type", "value": "USER"}], [{"key": "parameter", "value": userid}] ])
                    }
                }, this.qid("unitRoleContainer")).done(this.proxy(function(response){
                    if(response.success){
                        var $ul = this.qid("unitRole");
                        $.each(response.data.aaData, this.proxy(function(idx, item){
                            $("<li/>").text(item.unit + "：" + (item.role ? item.role.name : "") ).appendTo($ul);
                        }));
                    }
                }));

                $.u.ajax({
                    url: $.u.config.constant.smsqueryserver,
                    type: "post",
                    dataType: "json",
                    data: {
                        tokenid: $.cookie("tokenid"),
                        method: "getOrganizationByUserId",
                        userId: userid
                    }
                }, this.qid("orgContainer")).done(this.proxy(function(response){
                    if(response.success){
                        var $ul = this.qid("org");
                        $.each(response.data, this.proxy(function(idx, item){
                            $("<li/>").text(item.orgName).appendTo($ul);
                        }));
                    }
                }));
            	if(this.userinfo && this.userinfo.editable){
            		this.qid("edit-usersetting-trigger").click(this.proxy(this.on_editUserSetting_click));
                	this.qid("btn_editUserinfo").click(this.proxy(this.on_editUserInfo_click)); 
                	this.qid("avatar-picker-trigger").click(this.proxy(this.on_editUserAvatar_click));
                	this.pwd.off("click").on("click", this.proxy(this.on_password_click));
            	}else{
            		this.qid("pwd").remove();
            		this.qid("edit-usersetting-trigger").remove();
            		this.qid("btn_editUserinfo").remove();
            		this.qid("avatar-picker-trigger").css({"cursor":"default"});
            	}
        	}
        })).fail(this.proxy(function(jqXHR,errorText,errorThrown){
        	
        }));
    },
    /**
     * @title 显示枚举名称
     * @param value {string} 值
     * @param enums {Array} 枚举列表
     * @return {string} 显示值
     */
    _showEnumName: function(value, enums){
    	var result = "";
    	$.each(enums, function(idx, item){
    		if (item.value == value) {
    			result = item.name;
    		}
    	});
    	return result;
    },
    createDialog : function(){
    	this.pwdDialog = this.qid("pwdDialog").dialog({
    		title: "修改密码",
    		width: 540,
    		modal: true,
    		resizable: false,
    		draggable: false,
    		autoOpen: false,
    		create: this.proxy(this.on_dialog_create),
    		close: this.proxy(this.on_dialog_close),
    		buttons:[
    		    {
    		    	text: "确认",
    		    	"class": "button-submit",
    		    	click: this.proxy(this.on_savePwd_click)
    		    },
    		    {
    		    	text: "取消",
    		    	"class": "aui-button-link",
    		    	click: this.proxy(function(e){
    		    		e.preventDefault();
    		    		this.pwdDialog.dialog("close");
    		    	})
    		    }
    		]
    	});
    },
    on_dialog_create : function(){
    	this.pwdForm = this.qid("pwdForm");
    	this.pwdForm.validate({
            rules: {
            	pwdText: {
                    required: true,
                    maxlength:15
                },
                confirm_password: {
                    required: true,
                    maxlength:15,
                    equalTo:"#pwdText"
                }
            },
            messages: {
            	pwdText: {
                    required: "请填写密码",
                    //maxlength: jQuery.format("密码不能多于{0}个字符")
                },
                confirm_password: {
                    required: "请填写密码",
                    //maxlength: jQuery.format("密码不能多于{0}个字符"),
                    equalTo: "两次输入密码不一致"
                }
            }
        });
    },
    on_dialog_close : function(){
    	this.pwdText.val("");
    	$("#confirm_password").val("");
    },
    on_password_click : function(){
    	this.pwdDialog.dialog("open");
    },
    on_savePwd_click : function(e){
    	e.preventDefault();
    	var newPwd = this.pwdText.val();
    	if(this.pwdForm.valid()){
    		$.u.ajax({
                url: $.u.config.constant.smsmodifyserver,
                type: "post",
                dataType: "json",
                data: {
                    "tokenid": $.cookie("tokenid"),
                    "method":"stdcomponent.update",
   	    		 	"dataobject":"user",
                    "dataobjectid": this.userid,
                    "obj":JSON.stringify({password:newPwd})
                }
            }, this.qid("orgContainer")).done(this.proxy(function(response){
                if(response.success){
                	this.pwdDialog.dialog("close");
                    $.u.alert.info("密码修改成功!");
                }
            }));
    	}
    },
    
    
    
    _exinit:function(){
    	 this.editData=null;
    	 this.itemdetails = $(".item-details").eq(0).addClass("iteminfo");
    	 this._createDialog();
    		$.u.ajax({
                url: $.u.config.constant.smsqueryserver,
                type: "post",
                dataType: "json",
                data: {
                    "tokenid": $.cookie("tokenid"),
                    "method":"getAuditorInfoByUserId",
                    "id": this.userid
                }
            }, this.qid("orgContainer")).done(this.proxy(function(response){
                if(response.success){
                	this.tablecontainer=this.qid("tablecontainer");//右侧
                	this.infocontainer=this.qid("infocontainer");//左侧
		               if(response.data==null){
		            	var $div= $("<div class='ex_container' style='font-size:12px;'><div class='activity-blanket'></div><div class='activity-stream'  qid='stream'>"            
		            		+ "</div><a href='#' class='activity-stream-show-more' qid='showmore'><span>创建扩展信息</span></a></div>")
		            	 this.itemdetails.append($div);
		            	 this.ex_a_con=$(".ex_container");
		            	 $div.click(this.proxy(this._ex_a_click));
		            	 $div.find("span").css({
		            		    "-moz-border-radius": "4px",
			         		    "-webkit-border-radius": "4px",
			         		    "border-radius": "4px",
			         		    "border": "1px solid #CCC",
			         		    "display": "block",
			         		    "margin": "0 .2em 0 .2em",
			         		    "overflow": "hidden",
			         		    "padding": ".35em",
			         		    "text-align": "center",
			         		    "color": "#666",
			         		}) ;
		           
		               } else{
		                	 this._clid=response.data.auditor.id;//数据的ID
		                	 this._exInitToFun();
		               }
		                if(this.userinfo.id == $.cookie("userid")-0){//本人
		                    this.infocontainer.find("span.glyphicon-pencil").removeClass("hidden");
		                    this.edituserinforight.removeClass("hidden");//右侧基本信息
		                }else{
		                    this.infocontainer.find("span.glyphicon-pencil").addClass("hidden");
		                    this.qid("edit-usersetting-trigger").addClass("hidden");//右侧的设置
		                }
                }
            }));
    		
    		
    },

    _ex_a_click:function(e){
    	e.preventDefault();
    	$.u.ajax({
            url: $.u.config.constant.smsmodifyserver,
            type: "post",
            dataType: "json",
            data: {
                "tokenid": $.cookie("tokenid"),
                "method":"stdcomponent.add",
                "dataobject" :"auditor",
                "obj": JSON.stringify({"user":parseInt(this.userid)})
            }
        }, this.$).done(this.proxy(function(response){
            if(response.success){
            	this._clid=response.data;//8409167
            	this._exInitToFun();
            }
        }));
    },
    
    
    
    
    //根据数据ID 查询数据  初始
    _exInitToFun:function(){
    	
    	var dataid= this._clid;
    	this.ex_a_con && this.ex_a_con.remove();
    	$.u.ajax({
            url: $.u.config.constant.smsqueryserver,
            type: "post",
            dataType: "json",
            async:false,
            data: {
                "tokenid": $.cookie("tokenid"),
                "method" : "getAuditorInfoById",
                "id": dataid
            }
        }, this.$).done(this.proxy(function(response){
            if(response.success){
            	var settingUUi=this.tablecontainer.children().detach();//
        		response.data.auditor && this._exinfo(response.data);//左侧信息
        		this.infocontainer.append(settingUUi);
                response.data.auditorInfo && this._exfourtable(response.data.auditorInfo);//右侧表格
                this.dialogData=response.data.auditor;//左侧信息的数据
            }
        }));
    },
    
    //左侧信息
    _exinfo:function(redata){
    	var data=redata.auditor||'';
    	$(".tempinfo").remove();
    	this.tempgraph='<div class="uui-panel-graph">'  
			+'<div class="uui-panel-rect-widget">'
				+'<div class="uui-panel-rect-header">'
					+'<h4 class="uui-panel-rect-title"><strong>基本信息</strong>'
					+'<span qid="edit-userinfo-trigger" class="glyphicon glyphicon-pencil pull-right"></span></h4>'
				+'</div>'
				+'<div class="uui-panel-rect-body">'
					+'<div class="dl-horizontal item-details" qid="userinfo_container">'
					
					+'</div>'
				+'</div>'
			+'</div>'
		+'</div>';
    	this.tempgraphRight='<div class="uui-panel-graph">'  
			+'<div class="uui-panel-rect-widget">'
				+'<div class="uui-panel-rect-header">'
					+'<h4 class="uui-panel-rect-title"><strong>资质基本信息</strong>'
					+'<span qid="edit-userinforight-trigger" class="glyphicon glyphicon-pencil pull-right"></span></h4>'
				+'</div>'
				+'<div class="uui-panel-rect-body">'
					+'<div class="dl-horizontal item-details" qid="userinfo_container">'
					
					+'</div>'
				+'</div>'
			+'</div>'
		+'</div>';
    	
    	
    	var $tempgraph=$(this.tempgraph);
    	var $tempgraphRight=$(this.tempgraphRight);
    	this.userBaseInfo=$tempgraph.find(".item-details");
    	this.userBaseInfoRight=$tempgraphRight.find(".item-details");
    	this.tempinfo="<dl class='tempinfo'><dt>#{name}：   </dt><dd><span qid='#{qidname}'>#{value}</span></dd></dl> ";
    	this.keyvalue={
    			"department":"所属部门", 	
    			"unitDisplayName":"所属单位 ", 	
    			"duties":"职务", 	
    			"quarters":"岗位", 	
    			"officeTel":"办公电话",
    			"cellTel":"手机号码",
    			"faxNumber":"传真号码", 
    			"nationalist":"民族",
    			"recruitment":"籍贯", 
    			"education":"文化程度", 	
    			"political":"政治面貌", 
    			"cardNo":"身份证号码", 	
    			"address":"家庭住址", 	
    			"userType":"人员类型",
    			"hiredDate":"首次受聘日期",
    			"auditorNo":"编号",
    			"safeNo":"安全监察证编号",
    	}
    	this.rightInfo=["hiredDate","auditorNo","safeNo","userType"];
    	this.creatSystem(data);//勾画二三级资质
    	$tempgraph.appendTo(this.infocontainer);
    	$tempgraphRight.appendTo(this.tablecontainer);
    	
    	this.userinfo_container=$("[qid=userinfo_container]");
    	this.edituserinfo=this.qid("edit-userinfo-trigger");//左侧信息编辑
    	this.edituserinforight=$("[qid=edit-userinforight-trigger]",$tempgraphRight);//右侧信息编辑
    	if(!this.edituserinfo.isPrototypeOf(Array)){
    		this.edituserinfo=$("[qid=edit-userinfo-trigger]");
    	}
    	this.edituserinfo.off("click").on("click",this.proxy(this.edit_userinfo_click));//左侧信息编辑事件
    	this.edituserinforight.off("click").on("click",this.proxy(this.edit_userinforight_click));//右侧资质基本信息编辑事件
    	if(redata.auditorInfo && !redata.auditorInfo.edit){
    		 $tempgraphRight.find("span.glyphicon-pencil").addClass("hidden");
    		 $tempgraphRight.find("span.glyphicon-pencil").hide();
    	}
    },
    
    
    //右侧表格
    _exfourtable:function(data){
    	this.tempblock=	'<div class="uui-panel-graph">'
    			+'<div class="uui-panel-rect-widget" >'
    				+'<div class="uui-panel-rect-header">'
							+'<h4 class="uui-panel-rect-title"><strong >#{title}</strong>'
							+'<span qid="edit-table-trigger" key="#{key}" class="glyphicon glyphicon-pencil pull-right"></span></h4>'
						+'</div>'
						+'<div class="uui-panel-rect-body">'
							+'<div class="dl-horizontal item-table" >'
							+'<table qid="#{qid}" class=" table table-striped table-bordered" '
							+'cellspacing="0" width="100%" style="margin-bottom: 0;"></table>'
						+'</div></div></div></div>'
		var keytitle={
    			"audit":"参加安全运行审计情况",
    			"personal":"个人工作简历",
    			"situation":"资质及证书等情况记录",
    			"train":"培训记录",
    			"risk":"风险管理员",
    			"safe":"不安全事件调查员",
    			"info":"信息管理员"
    	}
    	
  
    	var canedit=["train", "audit" ,"situation"];//可以自己编辑
    	var edit=data.edit;
    	var tableData=data;//$.grep 只能操作数组
    	
    	var cdata=$.extend(true,[],data);//转不了数组
    	this._set=$.grep(cdata,this.proxy(function(item,idx){
			return $.isArray(item);
    	}));
    	var arr = $.makeArray( data );
    	tableData && $.each(tableData,this.proxy(function(key,cossin){
    		if($.isArray(cossin)){
    			var _html=(keytitle[key] && this.tempblock.replace(/#{title\}/g , keytitle[key])
						.replace(/#{key\}/g , key)
						.replace(/#{qid\}/g , key));
				var $_html=$(_html);
				if($.inArray(key,canedit) > -1 && !edit){
				$_html.find("span.glyphicon-pencil").addClass("hidden"); 
				}
				if(!edit){
					$_html.find("span.glyphicon-pencil").hide();
				}
				var thistable=$_html.find("table");
				this._creatTable(thistable,key,cossin);
				$_html.appendTo(this.tablecontainer);
				$(".uui-panel-graph").eq(4).appendTo(this.qid("infocontainer"));
				$(".uui-panel-graph").eq(4).appendTo(this.tablecontainer);
    		}
    	
    	}))
    	$("[qid=edit-table-trigger]:visible").click(this.proxy(this.on_addRecord_click));
    	this.tablecontainer.off("click", "button.edit").on("click", "button.edit", this.proxy(this.on_edit_click));
    	this.tablecontainer.off("click", "button.delete").on("click", "button.delete", this.proxy(this.on_delete_click));
    	this.qid("infocontainer").off("click", "button.edit").on("click", "button.edit", this.proxy(this.on_edit_click));
    	this.qid("infocontainer").off("click", "button.delete").on("click", "button.delete", this.proxy(this.on_delete_click));
    },
   
    _creatTable:function(thistable,key,data){
    	
    	// 个人简历（PERSONAL）、培训记录（TRAIN）、情况记录（SITUATION）、审计情况（AUDIT）
    	//风险管理员（RISK）、不安全事件调查员（SAFE），信息管理员（INFO）
    	this.columns={
			"personal":[{
		    				"key":"eventDate",
		    	    		"name":"日期" ,
		    	             "propshow": ""
		    			},
		    			{
		    				"key":"department",
		    				"name":"所在单位和部门", 
		    	            "propshow": ""
		    			},
		    			{
		    				"key":"content",
		    				"name":"担任职务",
		    	             "propshow": ""
		    			}],
			
    			"train":[
		    			{
		    				"key":"eventDate",
		    				"name":"日期", 
		    	            "propshow": ""
		    			},
		    			{
		    				"key":"department",
		    				"name":"培训机构", 
		    	            "propshow": ""
		    			},
		    			{
		    				"key":"content",
		    				"name":"培训课程",
		    	             "propshow": ""
		    			}],
			"situation":[
		    			{
		    				"key":"eventDate",
		    				"name":"日期", 
		    	            "propshow": ""
		    			},
		    			{
		    				"key":"content",
		    				"name":"名称", 
		    	            "propshow": ""
		    			},
		    			{
		    				"key":"department",
		    				"name":"颁证机构",
		    	             "propshow": ""
		    			}],			
	    	"audit":[
					{
						"key":"eventDate",
						"name":"日期", 
			            "propshow": ""
					},
					{
						"key":"department",
						"name":"受审单位", 
			            "propshow": ""
					},
					{
						"key":"profession",
						"name":"专业", 
			            "propshow": ""
					},
					{
						"key":"content",
						"name":"备注",
			             "propshow": ""
					}],
			"risk":[
					{
						"key":"eventDate",
						"name":"受聘日期", 
			            "propshow": ""
					},
					{
						"key":"department",
						"name":"培训记录", 
			            "propshow": ""
					},
					{
						"key":"content",
						"name":"备注",
			             "propshow": ""
					}],
			"safe":[
					{
						"key":"eventDate",
						"name":"受聘日期", 
			            "propshow": ""
					},
					{
						"key":"department",
						"name":"培训记录", 
			            "propshow": ""
					},
					{
						"key":"content",
						"name":"备注",
			             "propshow": ""
					}],		
			"info":[
					{
						"key":"eventDate",
						"name":"受聘日期", 
			            "propshow": ""
					},
					{
						"key":"department",
						"name":"培训记录", 
			            "propshow": ""
					},
					{
						"key":"content",
						"name":"备注",
			             "propshow": ""
					}],
    	
    	};
    		
    		
    		
    	
    	var tablecols = [];
		$.each(this.columns[key], this.proxy(function (idx, adata) {
            var atbcol = { "data": adata.key, "title": adata.name, "name": adata.name, "class": "field-" + adata.key};
            tablecols.push(atbcol);
        })); 
		var editcol=  {"sWidth": "80px" , "data": "", "title": "操作", "name": "", "class": "field-operation"};
   		var renderedit = $.u.load("com.audit.qualification.tablehtml");
        var rendereditobj = new renderedit();
        editcol.render =  this.proxy(rendereditobj.table_html);
        tablecols.push(editcol);
    	 this.usertable=thistable.dataTable({
             "dom": '',
             "loadingRecords": "加载中...",  
             "pageLength": parseInt(10||$.cookie("pageDisplayNum") || 10),
             "pagingType": "full_numbers",
             "autoWidth": true,
             "processing": false,
             "serverSide": false,
             "bRetrieve": true,
             "ordering": false,
             "language":{
  	           	"processing":"数据加载中...",
  	           	"info": " _START_ - _END_ of _TOTAL_ ",
  	             "zeroRecords":"无搜索结果",
  	           	"infoFiltered":"",
  	           	"paginate": {
  	                   "first": "",
  	                   "previous": "<span class='fa fa-caret-left fa-lg'></span>",
  	                   "next": "<span class='fa fa-caret-right fa-lg'></span>",
  	                   "last": ""
  	               }
             },
             "aaData":data,
             "columns": tablecols,
             "ajax": this.proxy(function (data, callback, settings) {}),
             "headerCallback": this.proxy(function( thead, data, start, end, display ) { }),
             "rowCallback": this.proxy(function(row, data, index){})
         }); 
    	 
    },
    
    
    //table 添加记录
    on_addRecord_click:function(e){
    	var key=$(e.currentTarget).attr("key");
    	switch(key){
	    	case "personal":
	    		this.Dialogone();
	    		break;
	    	case "audit":
	    		this.Dialogtwo();
	    		break;
	    	case "train":
	    		this.Dialogthree();
	    		break;
	    	case "situation":
	    		this.Dialogfour();
	    		break;
	    	case "risk":
	    		this.Dialogfive();
	    		break;
	    	case "safe":
	    		this.Dialogsix();
	    		break;
	    	case "info":
	    		this.Dialogseven();
	    		break;
    	}
    },
    
    
    
    
    Dialogone:function(){
    	this.addDialog.dialog("open");
    },
    Dialogtwo:function(){
    	this.addtwoDialog.dialog("open");
    },
    Dialogthree:function(){
    	this.addthreeDialog.dialog("open");
    },
    Dialogfour:function(){
    	this.addfourDialog.dialog("open");
    },
    Dialogfive:function(){
    	this.addfiveDialog.dialog("open");
    },
    Dialogsix:function(){
    	this.addsixDialog.dialog("open");
    },
    Dialogseven:function(){
    	this.addsevenDialog.dialog("open");
    },
    

	on_addDialog_save : function(event){
		var tdialog=$(event.currentTarget).closest("div.ui-dialog");
		var	tform=tdialog.find("form");
		var sobj=this.transform_data_type(tform.serializeArray());
		var dataid=this.tablecontainer.data("data-id");
		$.extend(sobj,{"auditor":this._clid||dataid});
		if(this.editData && this.editData.id){
			this._updateRecord(tdialog.find(".ui-dialog-content"),sobj,this.editData.id);
		}else{
			this._addRecord(tdialog.find(".ui-dialog-content"),sobj);
		}
		
	},
	
	
    //添加个人简历等四个表格记录
    _addRecord : function(thisdialog ,sobj){
    	this._ajax(
			$.u.config.constant.smsmodifyserver, 
			true, //async
			{
				"method" : "stdcomponent.add",
				"dataobject" : "auditorInfo",
                "obj": JSON.stringify(sobj)//obj={type: "PERSONAL", eventDate: "2010到2018年", department: "份认购的风格", content: "拜拜拜拜"}
			}, 
			this.$, 
			{},
			this.proxy(function(response) {
				if(response.success){
					response.data;//8394203
					$(thisdialog).dialog("close");
					$.u.alert.success("添加成功!",2000);
					this._refreshTable();
				}
			})
		);
    	location.reload(true);
    },
	
	on_addDialog_cancel : function(event){
		var ww=event.currentTarget.parentElement.parentElement.parentElement;
		$(ww).find(".ui-dialog-content").dialog("close");
	},
	
	on_addDialog_close : function(event){
		var rr=event.target.parentElement;
		$(rr).find(".ui-dialog-content").dialog("close").find("input,textarea").val("");
		this.editData=null;
	},
	
   

	_createDialog : function(){
		this.addDialog = this.qid("addDialog").removeClass("hidden").dialog({
        	title:"添加个人工作简历",
            width:640,
            modal: true,
            draggable: false,
            resizable: false,
            autoOpen: false,
            buttons:[{
				  "text":"保存",
				  "click":this.proxy(this.on_addDialog_save)
			  },
       		  {
       			  "text":"取消",
       			  "class":"aui-button-link",
       			  "click":this.proxy(this.on_addDialog_cancel)
       		  }
       		],
            close: this.proxy(this.on_addDialog_close),
            open: this.proxy(function(event){
        		if(this.editData){
        			var tar=event.target;
        			this._fillDialogData(tar,this.editData);
        		}
       		})
        });
		
		this.addtwoDialog = this.qid("addtwoDialog").removeClass("hidden").dialog({
        	title:"添加参加安全运行审计情况",
            width:640,
            modal: true,
            draggable: false,
            resizable: false,
            autoOpen: false,
            buttons:[{
				  "text":"保存",
				  "click":this.proxy(this.on_addDialog_save)
			  },
       		  {
       			  "text":"取消",
       			  "class":"aui-button-link",
       			  "click":this.proxy(this.on_addDialog_cancel)
       		  }
       		],
            close: this.proxy(this.on_addDialog_close),
            open: this.proxy(function(event){
        		if(this.editData){
        			tar=event.target;
        			this._fillDialogData(tar,this.editData);
        		}
       		})
        });
		//this.addtwoPoints
		this.addthreeDialog = this.qid("addthreeDialog").removeClass("hidden").dialog({
        	title:"培训记录",
            width:640,
            modal: true,
            draggable: false,
            resizable: false,
            autoOpen: false,
            buttons:[{
				  "text":"保存",
				  "click":this.proxy(this.on_addDialog_save)
			  },
       		  {
       			  "text":"取消",
       			  "class":"aui-button-link",
       			  "click":this.proxy(this.on_addDialog_cancel)
       		  }
       		],
            close: this.proxy(this.on_addDialog_close),
            open: this.proxy(function(event){
        		if(this.editData){
        			tar=event.target;
        			this._fillDialogData(tar,this.editData);
        		}
       		})
        });

		this.addfourDialog = this.qid("addfourDialog").removeClass("hidden").dialog({
        	title:"添加资质及证书等情况记录",
            width:640,
            modal: true,
            draggable: false,
            resizable: false,
            autoOpen: false,
            buttons:[{
				  "text":"保存",
				  "click":this.proxy(this.on_addDialog_save)
			  },
       		  {
       			  "text":"取消",
       			  "class":"aui-button-link",
       			  "click":this.proxy(this.on_addDialog_cancel)
       		  }
       		],
            close: this.proxy(this.on_addDialog_close),
            open: this.proxy(function(event){
        		if(this.editData){
        			tar=event.target;
        			this._fillDialogData(tar,this.editData);
        		}
       		})
        });
		
		

		this.addfiveDialog = this.qid("addfiveDialog").removeClass("hidden").dialog({
        	title:"创建风险管理员",
            width:640,
            modal: true,
            draggable: false,
            resizable: false,
            autoOpen: false,
            buttons:[{
				  "text":"保存",
				  "click":this.proxy(this.on_addDialog_save)
			  },
       		  {
       			  "text":"取消",
       			  "class":"aui-button-link",
       			  "click":this.proxy(this.on_addDialog_cancel)
       		  }
       		],
            close: this.proxy(this.on_addDialog_close),
            open: this.proxy(function(event){
        		if(this.editData){
        			tar=event.target;
        			this._fillDialogData(tar,this.editData);
        		}
       		})
        });
	
		
		this.addsixDialog = this.qid("addsixDialog").removeClass("hidden").dialog({
        	title:"创建不安全事件调查员",
            width:640,
            modal: true,
            draggable: false,
            resizable: false,
            autoOpen: false,
            buttons:[{
				  "text":"保存",
				  "click":this.proxy(this.on_addDialog_save)
			  },
       		  {
       			  "text":"取消",
       			  "class":"aui-button-link",
       			  "click":this.proxy(this.on_addDialog_cancel)
       		  }
       		],
            close: this.proxy(this.on_addDialog_close),
            open: this.proxy(function(event){
        		if(this.editData){
        			tar=event.target;
        			this._fillDialogData(tar,this.editData);
        		}
       		})
        });
	
		
		this.addsevenDialog = this.qid("addsevenDialog").removeClass("hidden").dialog({
        	title:"创建信息管理员",
            width:640,
            modal: true,
            draggable: false,
            resizable: false,
            autoOpen: false,
            buttons:[{
				  "text":"保存",
				  "click":this.proxy(this.on_addDialog_save)
			  },
       		  {
       			  "text":"取消",
       			  "class":"aui-button-link",
       			  "click":this.proxy(this.on_addDialog_cancel)
       		  }
       		],
            close: this.proxy(this.on_addDialog_close),
            open: this.proxy(function(event){
        		if(this.editData){
        			tar=event.target;
        			this._fillDialogData(tar,this.editData);
        		}
       		})
        });
	
		
		
		
		
	},
	
	  transform_data_type:function(data){
	    	//uuu=[{id:"1",name:"s"},{id:"2",name:"f"},{id:"3",name:"v"}]
	    	var uuu=data;
	    	var str = "{";
	    	for(i in uuu){
	    		if(parseInt(i)+1 != uuu.length){
	    			str += '"' + uuu[i].name + '":"' +uuu[i].value + '",';
	    		}else{
	    			str += '"' + uuu[i].name + '":"' +uuu[i].value + '"';
	    		}
	    	}
	    	str += "}";
	        return JSON.parse(str);
	    	//{s: "1", f: "2", v: "3"}
	    //	return str
	    },
	 /*
     * 获取表单数据（JSON格式）
     */
    getFormData:function(){
    	var data = {}, intFields = [], mult = [],str = [];
    	$.each(this._options.fields,function(idx,field){
    		field.dataType && field.dataType == "int" ? intFields.push(field.name) : null;
    		field.dataType && field.dataType == "string" ? str.push(field.name) : null;
    		field.option && field.option.multiple && mult.push(field.name);
    	});
    	$.each(this.form.serializeArray(), this.proxy(function(idx, field){
    		if ($.inArray(field.name, mult) > -1) {
    			data[field.name] = field.value ? $.map(field.value.split(","), this.proxy(function(n){
    				if($.inArray(field.name, str) > -1){
    					return n;
    				}else{
    					return parseInt(n);
    				}
    			})) : null;
    		} else if ($.inArray(field.name, intFields) > -1) {
    			data[field.name] = parseInt(field.value);
    		} else {
    			data[field.name] = field.value;
    		}
    	}));
    	return data;
    },
    
    
    _refreshTable:function(){
    	this.tablecontainer.find("table").each(this.proxy(function(idx,item){
    		var $item=$(item);
    		$item.dataTable().api().destroy();
    		$item.empty();
    	}));
    	this._exReTableToFun();
    },
    /**
     * 清除培训记录
     */
    _refreshinfo:function(e){
    	$(e.target).parents("tr").remove();
    },
    
   //基本信息编辑事件
    edit_userinfo_click:function(e){
    	e.preventDefault();
    	if(this.quaDialogEdit && "destroy" in this.quaDialogEdit){
    		this.quaDialogEdit.destroy();
    	}
	    $.u.load("com.audit.qualification.quaDialogEdit");
		this.quaDialogEdit = new com.audit.qualification.quaDialogEdit($("div[umid='quaDialogEdit']",this.$),null);
		this.quaDialogEdit.override({
			refreshDataTable:this.proxy(function(){
				this._exReInfoToFun();
			})
		});
		this.quaDialogEdit.open({"data":this.dialogData,"title":"编辑基本信息"});
    },
    //资质基本信息右侧编辑事件
    edit_userinforight_click:function(e){
    	e.preventDefault();
    	if(this.quaRightInfo && "destroy" in this.quaRightInfo){
    		this.quaRightInfo.destroy();
    	}
	    $.u.load("com.audit.qualification.quaRightInfo");
		this.quaRightInfo = new com.audit.qualification.quaRightInfo($("div[umid='quaRightInfo']",this.$),null);
		this.quaRightInfo.override({
			refreshDataTable:this.proxy(function(){
				this._exReInfoToFun();
			})
		});
		this.quaRightInfo.open({"data":this.dialogData,"title":"编辑资质基本信息"});
    },
    
    //根据数据ID 查询数据  左侧基本信息
    _exReInfoToFun:function(){
    	$.u.ajax({
            url: $.u.config.constant.smsqueryserver,
            type: "post",
            dataType: "json",
            data: {
                "tokenid": $.cookie("tokenid"),
                "method" : "getAuditorInfoById",
                "id": this._clid
            }
        }, this.$).done(this.proxy(function(response){
            if(response.success){
            	this.reDrawInfo(response.data);
            	this.dialogData=response.data.auditor
            }
        }));
    },
    
    
    //重画信息
    reDrawInfo:function(data){
    	this.userBaseInfo.add(this.userBaseInfoRight).empty();
    	this.creatSystem(data.auditor);
	},
	creatSystem:function(data){
		data && $.each(data,this.proxy(function(idx,item){
    		if( this.keyvalue[idx]){
    			var _htm = this.tempinfo.replace(/#\{name\}/g, this.keyvalue[idx])
								    .replace(/#\{qidname\}/g,idx )
								    .replace(/#\{value\}/g,item||"" );
    			if($.inArray(idx,this.rightInfo) > -1){
    				$(_htm).appendTo(this.userBaseInfoRight).data("data-data",item);
    				
    			}else{
    				$(_htm).appendTo(this.userBaseInfo).data("data-data",item);
    			}
    		}
    	}))
		var ul="<ul  class='list-unstyled' style='padding-left: 0px; margin: 0;'></ul>";
    	var $ul2 =$(ul);
      	//二级安全运行审计资格 单独处理
    	data.system2 && $.each(data.system2, this.proxy(function(idx, item){
            $("<li/>").text(item.name||"" ).appendTo($ul2);
  		}));
      	var _htms2 = this.tempinfo.replace(/#\{name\}/g, "二级安全运行审计资格")
  								   .replace(/#\{qidname\}/g,"system2" )
  								   .replace(/#\{value\}/g,"" );
      	var $_htms2=$(_htms2);
      	$ul2.appendTo($_htms2.find("span"));
      	$_htms2.appendTo(this.userBaseInfoRight);
      	//三级安全运行审计资格 单独处理
      	var $ul3 =$(ul);
      	data.system3 && $.each(data.system3, this.proxy(function(idx, item){
              $("<li/>").text(item.name||"" ).appendTo($ul3);
    		}));
    	var _htms3 = this.tempinfo.replace(/#\{name\}/g, "三级安全运行审计资格")
								   .replace(/#\{qidname\}/g,"system3" )
								   .replace(/#\{value\}/g,"" );
    	var $_htms3=$(_htms3);
    	$ul3.appendTo($_htms3.find("span"));
    	$_htms3.appendTo(this.userBaseInfoRight);
      	
	},
	
	//根据数据ID 查询数据   表格
    _exReTableToFun:function(){
    	$.u.ajax({
            url: $.u.config.constant.smsqueryserver,
            type: "post",
            dataType: "json",
            data: {
                "tokenid": $.cookie("tokenid"),
                "method" : "getAuditorInfoById",
                "id": this._clid
            }
        }, this.$).done(this.proxy(function(response){
            if(response.success){
            	response.data.auditorInfo && this._exfourtable(response.data.auditorInfo);
            }
        }));
    },
    
    
    /* 打开编辑*/
     on_edit_click:function(e){
     	e.preventDefault();
 		var $e = $(e.currentTarget);
 		var data = JSON.parse($e.attr("data"));
     	this.editData=data;
     	switch(data.type){
     	case 'PERSONAL':
     		this._addPoints();
 			break;
 		case 'AUDIT':
 			this._addtwoPoints();
 			break;
 		case 'TRAIN':
 			this._addthreePoints();
 			break;
 		case 'SITUATION':
 			this._addfourPoints();
 			break;
 		case 'RISK':
 			this._addfivePoints();
 			break;
 		case 'SAFE':
 			this._addsixPoints();
 			break;	
 		case 'INFO':
 			this._addsevenPoints();
 			break;	
     	}	
     }, 

     
     
     _addPoints : function(){
 		this.addDialog.dialog("open");
 	},
 	_addtwoPoints : function(){
 		this.addtwoDialog.dialog("open");
 	},
 	_addthreePoints : function(){
 		this.addthreeDialog.dialog("open");
 	},
 	_addfourPoints : function(){
 		this.addfourDialog.dialog("open");
 	},
 	_addfivePoints : function(){
 		this.addfiveDialog.dialog("open");
 	},
 	_addsixPoints : function(){
 		this.addsixDialog.dialog("open");
 	},
 	_addsevenPoints : function(){
 		this.addsevenDialog.dialog("open");
 	},
     

    /* 编辑打开对话框*/
     _fillDialogData:function(tar,editData){
     	var dialogForm=null;
     	var $dialogForm=$(tar).find("form");
     	editData && $.each(editData,this.proxy(function(idx,item){
     		var input=null
     		input=$("[name="+idx+"]",$dialogForm);
     		input && input.val(item);
     	}))
     	
     },
     
     
     //编辑
     _updateRecord : function(thisdialog ,obj,recordid){
     	this._ajax(
 			$.u.config.constant.smsmodifyserver, 
 			true, //async
 			{
 				"method" : "stdcomponent.update",
 				"dataobject" : "auditorInfo",
 				"dataobjectid":JSON.stringify(recordid),
                 "obj": JSON.stringify(obj)
 			}, 
 			this.$, 
 			{},
 			this.proxy(function(response) {
 				if(response.success){
 					this.editData=null;
 					response.data;//8394203
 					$(thisdialog).dialog("close");
 					$.u.alert.success("修改成功!",2000);
 					location.reload(true);
 					//this._refreshTable();
 				}
 			})
 		);
     },
     
     
     /*   删除记录*/
     on_delete_click:function(e){
     	e.preventDefault();
 		var $e = $(e.currentTarget);
 		var data = $e.attr("data");
 		data=JSON.parse(data);
         var clz = $.u.load("com.audit.comm_file.confirm");
         var confirm = new clz({
             "body": "确认操作？",
             "buttons": {
                 "ok": {
                     "click": this.proxy(function(){
                         this._ajax(
                             $.u.config.constant.smsmodifyserver, 
                             true, 
                             {
                                 "method" : "stdcomponent.delete",
                                 "dataobject" : "auditorInfo",
                                 "dataobjectids" : JSON.stringify([parseInt(data.id)])
                             }, 
                             confirm.confirmDialog.parent(), 
                             {},
                             this.proxy(function(response) {
                                 if(response.success){
                                     confirm.confirmDialog.dialog("close");
                                 	$.u.alert.success("删除成功!",2000);
                                 	this._refreshinfo(e);
                                 }
                             })
                         );
                     })
                 }
             }
         });	
     }, 
     /*删除*/
     on_removeUnit_click: function (e) {
     	e.preventDefault();
     	try{
     		var data = JSON.parse($(e.currentTarget).attr("data"));
     		$.u.load("com.sms.common.stdcomponentdelete");
     		(new com.sms.common.stdcomponentdelete({
     			body:"<div>"+
     				 	"<p> 确定删除?</p>"+
     				 "</div>",
     			title:"删除记录",
     			dataobject:"auditor",
     			dataobjectids:JSON.stringify([parseInt(data.id)])
     		})).override({
     			refreshDataTable:this.proxy(function(){
     				 this.usertable.fnDraw();
     			})
     		});
     	}catch(e){
     		throw new Error("删除失败："+e.message);
     	}
     },
    
    _ajax : function(url, async, param, $container, blockParam, callback) {
		$.u.ajax({
			url : url,
			datatype : "json",
			type : 'post',
			"async" : async,
			data : $.extend({
				tokenid : $.cookie("tokenid")
			}, param)
		}, $container || this.$, $.extend({}, blockParam || {})).done(this.proxy(function(response) {
			if (response.success) {
				callback(response);
			}
		})).fail(this.proxy(function(jqXHR, errorText, errorThrown) {

		}));
	},
    
    destroy: function () {
        this._super();
    }
}, { usehtm: true, usei18n: true });

com.sms.profile.widgetjs = ['../../uui/widget/jqurl/jqurl.js',
                            "../../uui/widget/jqblockui/jquery.blockUI.js",
                            "../../uui/widget/jqdatatable/js/jquery.dataTables.js",
                            "../../uui/widget/spin/spin.js",
                            "../../uui/widget/jqblockui/jquery.blockUI.js",
                            "../../uui/widget/ajax/layoutajax.js"];
com.sms.profile.widgetcss = [   { path: '../../uui/widget/jqdatatable/css/jquery.dataTables.css' }, 
                                { path: '../../uui/widget/jqdatatable/css/dataTables.bootstrap.css' },];