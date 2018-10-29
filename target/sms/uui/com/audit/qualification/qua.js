//@ sourceURL=com.audit.qualification.qua
$.u.load("com.sms.log.activitylog");
$.u.define('com.audit.qualification.qua', null, {
    init: function (options) {
    	 this._filtertemplate ="<input type='text' class='form-control select2' placeholder='' name='#{propid}' maxlength='50'>";
/*
    	 this._droptemplate =
			  "<div class='dropzoneparent' zoneid='#{zoneid}' roleid='#{roleid}'>"+
				 "<div class=''>"+
					"<h6 class='panel-title col-md-6'>"+
						"<i class='fa fa-user' style='padding-right:10px;'></i>"+
						"#{rolename}"+
					"</h6>"+
					"<span class='glyphicon glyphicon-trash  uui-cursor-pointer col-md-6 text-right' title='移除' style='padding-right:10px;'></span>"+
				 "</div>"+
				 "<i class='fa  fa-times-circle-o pull-right' style='padding-right:10px;'></i>"+
				 
				 "<div class=''>"+
				 	"<div class='dropzone'></div>"+
				 "</div>"+
			 " </div> ";//A1.2一级审计主管
*/
    	 this._droptem =
			  "<div class='dropzoneparent' usergroupid='#{usergroupid}'>"+
				 "<div class=''>"+
					"<h6 class='panel-title '>"+
						"<i class='fa fa-user' style='padding-right:10px;'></i>"+
						"#{usergroupname}"+
					"</h6>"+
					"<span style='float:right;'>合计#{total}人</span>"+
/*					"<span class='glyphicon glyphicon-trash  uui-cursor-pointer col-md-6 text-right' title='移除' style='padding-right:10px;'></span>"+
*/				 "</div>"+
				/* "<i class='fa  fa-times-circle-o pull-right' style='padding-right:10px;'></i>"+*/
			/*	 
				 "<div class=''>"+
				 	"<div class='dropzone'></div>"+
				 "</div>"+*/
			 " </div> ";//A1.2一级审计主管
    	 
    	 
    	 
    	 
    	this._select2PageLength=10;
    	this.selectdata=[];
    	this.unitid='';
    	this.roleid='';
    	this.usersid='';
        this._options = options;
    	this.userinfo = null;
    	this.userid = null;
    
    	!this.userid ? this.userid = $.cookie("userid") : null; 
    	this.emailUserEnums = [{name:"通知我",value:"Y"},{name:"不要通知我",value:"N"}];
    	this.defaultAccessEnums = [{name:"共享",value:"Y"},{name:"不共享",value:"N"}];
    	this.autoWatchEnums = [{name:"启用",value:"Y"},{name:"禁用",value:"N"},{name:"从全局设置继承",value:"EXTEND"}];
    	this.i18n = com.audit.qualification.qua.i18n;
        this._DATATABE_LANGUAGE = { //语言
                "sSearch": this.i18n.search,
                "sZeroRecords": "抱歉未找到记录",
                "sInfoEmpty": "没有数据",
                "sProcessing": ""+this.i18n.searching+"...",
            };
  
        //NOLOGIN@#zwjiang
    },
    afterrender: function () {
		this.columns=[{
						"key":"userfullname",
			    		"name":"姓名" ,
			    		"propplugin": "com.audit.qualification.nameProp",
			    		"propvalue": [],
			             "propshow": ""
		    		},
		    		{
		    			"key":"unitname",
		    			"name":"所在部门", 
		    			//"propplugin": "com.audit.plugin.qualification.unitnameProp",
		    			"propvalue": [],
		                "propshow": ""
	    			},
	    			{
	    				"key":"profession",
	    				"name":"专业",
	    				"propplugin": "com.audit.qualification.professionProp",
	    				"propvalue": [],
	    	             "propshow": ""
	    			}];
    	this.filterbox=this.qid("filterbox");
    	this.unitdropzone=this.qid("unit-dropzone");
    	this.userSettingDialog = null;
    	this.userinfoDialog = null;
    	this.selectUserAvatar = null;
    	$("[name=addrole]").off("click").on("click", this.proxy(this._addrole)); //添加角色事件
    	this.qid("btn_adduser").off("click").on("click", this.proxy(this._adduser));//创建人员
    	this.qid("btn_addtrain").off("click").on("click", this.proxy(this._addtrain));//创建培训
    	$(".addrolebtn").off("click").on("click", this.proxy(this._addrolebtn));//a标签点击事件
    	this.createDialog();
    	this.createfilterbox();
    	this._initfilterbox();//右侧
     	this._cssfont();
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
        		this.qid("fullname").add(this.qid("label_username")).text(this.userinfo.fullname || " ");
            	this.qid("username").text(this.userinfo.username || " ");
            	this.qid("email").text(this.userinfo.email || " ");
            	this.qid("avatar-picker-trigger").add(this.qid("img_useravatar")).attr("src",this.userinfo.avatarUrl);
            	
                $.each(this.userinfo.userGroups || [], this.proxy(function(idx, group){
                    $("<li/>").text(group.name || "").appendTo(this.qid("userGroup"));
                }));
            	
            	this.qid("usersetting_pageDisplayNum").text(this.userinfo.pageDisplayNum || "");
            	this.qid("usersetting_emailFormat").text(this.userinfo.emailFormat || "");
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
            	}else{
            		this.qid("edit-usersetting-trigger").remove();
            		this.qid("btn_editUserinfo").remove();
            		this.qid("avatar-picker-trigger").css({"cursor":"default"});
            	}
            	
	               $.u.ajax({
	                    url: $.u.config.constant.smsqueryserver,
	                    type: "post",
	                    dataType: "json",
	                    data: {
	                        tokenid: $.cookie("tokenid"),
	                        method: "stdcomponent.getbysearch",
	                      	dataobject:"user"
	                    }
	                }, this.qid("modules")).done(this.proxy(function(response){
	                    if(response.success){
	                       this.allusers=$.map(response.data.aaData,function(user,idx){
			        			user.text=user.username+"("+user.fullname+")";
			        			return user.text;	
	                       		})
	                    }
	                }));
	        		}
        	
		        })).fail(this.proxy(function(jqXHR,errorText,errorThrown){
		        	
		        }));
    },
    
    _cssfont:function(){
    	
    	$("tr:hover").css({" border-bottom":"1px solid #2868c8",
			"background-color":"#5cb85c !important"
		});
    	
    	var height=$(".row").children().first().height();
    	$(".glyphicon-arrow").css({'position':'absolut', 'padding':'160% 50%'});
    	$("ul>li").css( "list-style-type","none" );
    	$(".dropzone").css({
		      "padding": "20px",
		  	  "background": "#eee",
		  	  "min-height": "100px",
		  	  "margin-bottom": "20px",
		  	  "z-index": "0",
		  	  "border-radius": "10px"
		  	}) ;
	
		  	$(".drop-item").css( {
		  	  "cursor": "pointer",
		  	  "margin-bottom":" 10px",
		  	  "background-color": "rgb(255, 255, 255)",
		  	  "padding": "5px 10px",
		  	  "border-radisu":" 3px",
		  	  "border": "1px solid rgb(204, 204, 204)",
		  	  "position": "relative"
		  	})
		$(".drop-item .remove ").css(	{
			  "position": "absolute",
			  "top": "4px",
			  "right": "4px"
		});
    	$(".item-details").children().first().css("margin-top","15px");
    	$(".panel-body").css("background","#E7E7E9 !important");
    	$(".panel-heading").css({
    		"FILTER": "progid:DXImageTransform.Microsoft.Gradient(gradientType=0,startColorStr=#98a5ae, endColorStr=#557582); /*IE 6 7 8*/",
    		"background":"-ms-linear-gradient(top, #98a5ae, #557582); /* IE 10 */",
    		"background":"-moz-linear-gradient(top, #98a5ae, #557582); /*firfox*/",
    		"background":" -webkit-gradient(linear, 0% 0%, 0% 100%, from(#98a5ae),to(#557582)); /*chrome*/",
    		"background": "-webkit-gradient(linear, 0% 0%, 0% 100%, from(#98a5ae),to(#557582)); /* Safari 4-5, Chrome 1-9*/",
    		"background": "-webkit-linear-gradient(top, #98a50e, #557582) !important;/*Safari5.1 Chrome 10+*/",
    		"background": "-o-linear-gradient(top, #98a5ae, #557582); /*Opera 11.10+*/",
    		"border-bottom": "1px;",
    		"padding": "7px 8px 7px 10px;",
    	});
   
    },
   
    
    isNum : function(str){
    	var reg = "^([+-]?)\\d*\\.?\\d+$";
    	return new RegExp(reg).test(str);
    },
    
    
    
    _resumetable:function(){
		this.deferfinishdata=[
		    {
		        "Date": "2013-07-30 -- 2015-07-30",
		        "unit": "公司",
		        "position": "会计"
		    
		    },
		    {
		        "Date": "2012-08-24 -- 2015-08-24",
		        "unit": "安监部",
		        "position": "审计员"
		    
		    },
		    {
		        "Date": "2014-07-18 -- 2015-08-24",
		        "unit": "运输公司",
		        "position": "经理"
		    
		    }
		]
    	
 	 this.resumetable =this.qid("resumetable").dataTable({
          searching: false,
          serverSide: false,
          bProcessing: true,
          ordering: false,
          pageLength : 1000,
          "sDom":"t<i>",
          "columns": [
              { "title": "日期" ,"mData":"Date","sWidth":"40%"},
              { "title": "所在单位及部门" ,"mData":"unit","sWidth":"30%"},
              { "title": "担任职务" ,"mData":"position","sWidth":"30%"}
             
          ],
          "aaData": this.deferfinishdata,
          "bInfo":false,
          "bDeferRender":false,
          "oLanguage": this._DATATABE_LANGUAGE,
          "aoColumnDefs": [
               {
                   "aTargets": 0,
                   "sClass": "my_checkbox",
                   "sContentPadding": "mmm",
                   "mDataProp": "engine", 
                   "sDefaultContent": "Edit",//允许给列值一个默认值，只要发现null值就会显示默认值
                   "mRender": function (data, type, full) {
                   	return data;
                   }
             
               },
               {
                   "aTargets": 1,
                   "mRender": function (data, type, full) {
	                        return data;
                   }
               },
              {
                  "aTargets": 2,
                  "sClass": "deferfinish-two",
                  "sDefaultContent": " ",
                  "mRender":this.proxy( function (data, type, full) {
               	   return   data;
                  })
              }
          ],
          "rowCallback": this.proxy(function(row, data, index){
           })
      });
},

	_roleselectinit:function(){
			  //角色 类型下拉框下拉中
			$("[name=role]").on("select2-selecting",this.proxy(function(e){
	    		var form_date=$(".startdate" ,e.target.parentNode.parentElement.parentElement).parent().parent();
	    	}));
		   	 // // 角色 下拉框初始化
			$("[name=role]").select2({
				 width:350,
		   		 placeholder: "选择角色",
		         ajax:{
			        	url: $.u.config.constant.smsqueryserver,
			        	type: "post",
			            dataType: "json",
			        	data: function(term, page){
			        		return {
			        			 tokenid: $.cookie("tokenid"),
		 	                     method: "stdcomponent.getbysearch",
		 	                     dataobject:"role",
		 	                  
		 	                     rule:JSON.stringify([[{"key":"type","value":"audit"}]])
			        		};
			    		},
				        results:function(data,page){
				        	if(data.success){
				        		return {results:$.map(data.data.aaData,function(item,idx){
				        			return item;
				        		})};
				        	}
				        }
			        },
			        formatResult: function(item){
			        	return item.name;      		
			        },
			        formatSelection: this.proxy(function(item){
			        	this._creatdropzone(item);//创建角色模块
			        	return item.name;	        	
			        })
		       });
			
		},

		
		//创建模块
	_creatdropzone:function(item){
		if(item){
			var dropzone={"zoneid":"","rolename":item.name,"roleid":item.id};
	             $.u.ajax({
	      	            url: $.u.config.constant.smsmodifyserver,
	      	            type:"post",
	      	            dataType: "json",
	      	            data: {
	      					tokenid:$.cookie("tokenid"),
	      					method:"stdcomponent.add",
	      					dataobject:"auditorRole",
	      					obj:JSON.stringify({"role":item.id})
	      				}
	      	        }).done(this.proxy(function (data) {
	      	        	if(data.success){
	      	        		if(data.data){
	      	        			dropzone.zoneid=data.data;//下拉创建模块 生成模块ID
	      	 				    var htm = this._droptemplate.replace(/#\{rolename\}/g, dropzone.rolename)
	      	 				 				     	        .replace(/#\{zoneid\}/g, dropzone.zoneid)
	      	 				 				     	        .replace(/#\{roleid\}/g, dropzone.roleid);
	      	 	               $(htm).appendTo(this.unitdropzone).data("data-data",dropzone); 
	      	 	               this._draggable();
	      	 	               this._addcss();
	      	        		}
	      	        	}
	      	        	
	      	        })).fail(this.proxy(function (jqXHR, errorText, errorThrown) {
	      	
	      	        }));
			}
		},
		
		//删除角色模块  点击trash事件
		_trashblock:function(event){
			event.preventDefault();
			var zoneid="";
			var tar=event.toElement||event.currentTarget;
			zoneid=$(tar).closest(".dropzoneparent").attr("zoneid");
			 $.u.ajax({
   	            url: $.u.config.constant.smsmodifyserver,
   	            type:"post",
   	            dataType: "json",
   	            data: {
   					tokenid:$.cookie("tokenid"),
   					method:"stdcomponent.delete",
   					dataobject:"auditorRole",
   					dataobjectids:"["+zoneid+"]"
   				}
   	        }).done(this.proxy(function (data) {
   	        	if(data.success){
   	        		$("[zoneid="+zoneid+"]").remove()
   	        	}
   	        })).fail(this.proxy(function (jqXHR, errorText, errorThrown) {
   	
   	        }));
		},
		

	_tablesearch:function(e){
		 var  uservalue=$("[name=userfullname]").val();
		 var unitnamevalue=$("[name=unitname]").val();
		 var professionvalue=$("[name=profession]").val();
	   	if ($.fn.DataTable.isDataTable(this.qid("usertable"))) {
            this.qid("usertable").dataTable().api().destroy();
            this.qid("usertable").empty();
        }
	   
		var tablecols = [];
		$.each(this.columns, this.proxy(function (idx, adata) {
            var atbcol = { "data": adata.key, "title": adata.name, "name": adata.name, "class": "field-" + adata.key};
            if (adata.propplugin) {
                var renderclz = $.u.load(adata.propplugin);
                var renderobj = new renderclz();
                atbcol.render =  this.proxy(renderobj.table_html);
            }
            tablecols.push(atbcol);
        })); 
		var editcol=  { "sWidth": "20%" ,"data": "", "title": "操作", "name": "", "class": "field-operation"};
   		var renderedit = $.u.load("com.audit.qualification.tablehtml");
        var rendereditobj = new renderedit();
        editcol.render =  this.proxy(rendereditobj.table_html);
        tablecols.push(editcol);
	    this.usertable=this.qid("usertable").dataTable({
           "dom": 'tip',
           "loadingRecords": "加载中...",  
           "info":true,
           "pageLength": parseInt(10||$.cookie("pageDisplayNum") || 10),
           "pagingType": "full_numbers",
           "autoWidth": true,
           "processing": false,
           "serverSide": true,
           "bRetrieve": true,
           "ordering": false,
           "language":{
	           	"processing":"数据加载中...",
	           	"info": " _START_ - _END_ of _TOTAL_ ",// "从 _START_ 到 _END_ /共 _TOTAL_ 条数据",
	            "zeroRecords":"无搜索结果",
	           	"infoFiltered":"",
	           	"paginate": {
	                   "first": "",
	                   "previous": "<span class='fa fa-caret-left fa-lg'></span>",
	                   "next": "<span class='fa fa-caret-right fa-lg'></span>",
	                   "last": ""
	               }
           },
           "columns": tablecols,
           "ajax": this.proxy(function (data, callback, settings) {
		        	   delete data.order;
		               delete data.draw;
		               delete data.search; 
		          	   delete data.columns;
	        	   this._ajax($.u.config.constant.smsqueryserver,$.extend({},data,{
	           		"method": "getAuditors",
	           		"unit": unitnamevalue,
                    "profession": professionvalue,
                    "user": uservalue
	            	}),this.$.find("table"),{size:2,backgroundColor:"#fff"},this.proxy(function(response){
	            			if(response.success){
	                      		 callback({
	 	                      		"recordsFiltered":response.data.right.iTotalRecords,
	 	                      		"data":response.data.right.aaData
	 	                      	});
	                      		this._drawblock(response.data.left);
	                      		this._draggable();
	                       	}
	           	}));
        	  }),
           "headerCallback": this.proxy(function( thead, data, start, end, display ) {
           }),
            "rowCallback": this.proxy(function(row, data, index){
        		this.callback(row,data);
         })
       });
	   this.usertable.off("click", "button.edit").on("click", "button.edit", this.proxy(this.on_editUnit_click));
       this.usertable.off("click", "button.delete").on("click", "button.delete", this.proxy(this.on_removeUnit_click));
	},
	
	
	callback:function(row,data){
		 $(row).addClass("drag uui-cursor-pointer")
    	 		.attr("data-data",JSON.stringify(data))
	 			.attr("data-id",data.id)
	 			.draggable({ //把什么拖拽
		    	  appendTo: 'body',//设置追加到什么地方
		    	  helper: 'clone',//设置拖动过程中, 跟随鼠标移动的组件
		    	  stop: function () { console.log("拖拽结束"); }

    	}).off("click").on("click",this.proxy(function(event){
        	var tar=$(event.currentTarget);
        	var thisid=tar.attr("data-id");//数据的ID
        	var thisdata=$.parseJSON(tar.attr("data-data"));
    		if($.inArray(thisid,this.selectdata) >-1){
    			var idx=this.selectdata.indexOf(thisid);
    			this.selectdata.splice(idx,1);
    		}else{
    			this.selectdata.push(thisid);
    		}
        }));
	},
	
	
	 _draggable:function(){
		   	$('.drag').draggable({ //把什么拖拽
				       	  appendTo: 'body',//设置追加到什么地方
				       	  helper: 'clone'//设置拖动过程中, 跟随鼠标移动的组件
				       	});
		   	$('.dropzone').droppable({//拖拽到这里
			   	  activeClass: 'active',
			   	  hoverClass: 'hover',
			   	  accept: ":not(.ui-sortable-helper)", 
			   	  drop:function (e, ui) {
			   		 var userid= $.parseJSON($(ui.draggable).attr("data-data")).userid;
			   		 var dat=ui.draggable.find(".field-userfullname").children();
			   		 var dataid=$(ui.draggable).attr("data-id");
			     	 var $el = $('<p class="drop-item" dataid="'+ dataid +'" userid="'+ userid +'">'+ dat[0].outerHTML +dat[1].outerHTML +'</p>');
			     	 var $bun=$('<a href="#" class="remove-role" title="移除"><span class="glyphicon glyphicon-remove-sign"></span></a>')
			   	    			.click(function () {$(this).parent().detach(); })
			   	    $el.append($bun);
			   	    $(this).append($el);
		   	  }
		   	}).sortable({// 排序
			   	  items: '.drop-item',
			   	  sort: function() {
			   	    $( this ).removeClass( "active" );
			   	  }
		   	});
			$('.dropzone').unbind('drop').bind('drop', this.proxy(function(event, ui) {
					var zonediv=$(event.currentTarget).closest(".dropzoneparent");
					var usergroupid=zonediv.attr("usergroupid");//用户组ID
			   	    var thisdataid=$.parseJSON(ui.helper.attr("data-id"));
			   	    this._addRoleNew(thisdataid,usergroupid);
			}));
			$(".remove-role").off("click").on("click",this.proxy(this._removeRoleNew));
	 },
	 
	 //a标签按钮点击事件
	 _addrolebtn:function(e){
		 e.preventDefault();
		 if( this.selectdata.length>0){
			
		 }
	 },
		
	 //添加角色事件
	 //把右边的人拉到左边：更新auditor的userGroup字段更新为左边用户组的id
	 
	 _addRoleNew:function(thisdataid,usergroupid){
		 if(!!!usergroupid||!!!thisdataid){
			 return false
		 }
		 $.u.ajax({
	            url: $.u.config.constant.smsmodifyserver,
	            type:"post",
	            dataType: "json",
	            data: {
					tokenid:$.cookie("tokenid"),
					method:"stdcomponent.update",
					dataobject:"auditor",
					dataobjectid:thisdataid,
					obj:JSON.stringify({"userGroup":parseInt(usergroupid)})
 			       }
	        }).done(this.proxy(function (data) {
	        	if(data.success){
	        		this._refresh();
	        		$.u.alert.success("操作成功",3000);
	        	}
	        	else{
	        		$("p.drop-item").each(this.proxy(function(idx,item){
		        		if($.inArray(parseInt($(item).attr("dataid")),[thisdataid])>-1){
		        			$(item).detach();
		        		}
	        		}))
	        	}
	        })).fail(this.proxy(function (jqXHR, errorText, errorThrown) {
	
	        }));
		 
		 
	 },
	//从用户组中删除某个用户
		_removeRoleNew:function(event){
			event.preventDefault();
			var varp=$(event.currentTarget.parentElement);
			var thisdataid=varp.attr("dataid");
			if(!thisdataid){
				return false
			}
			 $.u.ajax({
		            url: $.u.config.constant.smsmodifyserver,
		            type:"post",
		            dataType: "json",
		            data: {
		            	tokenid:$.cookie("tokenid"),
						method:"stdcomponent.update",
						dataobject:"auditor",
						dataobjectid:parseInt(thisdataid),//数据的ID
	  					obj:JSON.stringify({"userGroup":null})//8389423[模块里所有人的id，],

					}
		        }).done(this.proxy(function (data) {
		        	if(data.success){
		        		varp.detach();
		        		this._refresh();
			        	$.u.alert.success("删除成功",3000);
		        	}
		        	
		        })).fail(this.proxy(function (jqXHR, errorText, errorThrown) {
		
		        }));
			
		},
	 
	 //添加角色事件
	_addrole:function(usersid,unitid,zoneid,roleid){
		roleid=parseInt(roleid);//角色的ID
		zoneid=parseInt(zoneid);//
		var usersiddata=[];
		usersid && usersiddata.push(parseInt(usersid));//用户的ID
		var auditorsids=[];
		$("[zoneid="+zoneid+"]").eq(0).find(".drop-item").each(this.proxy(function(key,dropitem){
			auditorsids.push(parseInt($(dropitem).attr("userid")));
		}));
		auditorsids.push(usersid);
		  $.u.ajax({
	            url: $.u.config.constant.smsmodifyserver,
	            type:"post",
	            dataType: "json",
	            data: {
					tokenid:$.cookie("tokenid"),
					method:"setunitroles",
					obj:JSON.stringify({"unit":unitid,//21041,//部门ID
										"role":roleid,//8389423,//角色的ID
										"users":usersiddata,//[10960],//用户的ID
										"userGroups":[]
										})
				}
	        }).done(this.proxy(function (data) {
	        	if(data.success){
	      		  $.u.ajax({
	      	            url: $.u.config.constant.smsmodifyserver,
	      	            type:"post",
	      	            dataType: "json",
	      	            data: {
	      					tokenid:$.cookie("tokenid"),
	      					method:"stdcomponent.update",
	      					dataobject:"auditorRole",
	      					dataobjectid:zoneid,//左边模块的id
	      					obj:JSON.stringify({"auditors":auditorsids})//8389423[模块里所有人的id，],
	      				}
	      	        }).done(this.proxy(function (data) {
	      	        	if(data.success){
	      	        		this.unitid='';
	      		        	this.roleid='';
	      		        	this.usersid='';
	      		        	unitid='';
	      		        	usersid='';
	      		        	this._addcss();
	      		        	$.u.alert.success("操作成功",3000);
	      	        	}
	      	        	
	      	        })).fail(this.proxy(function (jqXHR, errorText, errorThrown) {
	      	
	      	        }));
	        	}
	        	
	        })).fail(this.proxy(function (jqXHR, errorText, errorThrown) {
	
	        }));
		  
	},
	
	
	//从角色中删除某个用户
	_removerole:function(event){
		event.preventDefault();
		var varp=$(event.currentTarget.parentElement);
		var delid=parseInt(varp.attr("userid"));
		var zoneid=parseInt(varp.closest(".dropzoneparent").attr("zoneid"));
		var idxyz=[];
		varp.parent().children(".drop-item").each(function(idx,item){
			idxyz.push(parseInt($(item).attr("userid")));
		})
		var num=idxyz.indexOf(delid);
		idxyz.splice(num,1);
		 $.u.ajax({
	            url: $.u.config.constant.smsmodifyserver,
	            type:"post",
	            dataType: "json",
	            data: {
	            	tokenid:$.cookie("tokenid"),
  					method:"stdcomponent.update",
  					dataobject:"auditorRole",
  					dataobjectid:zoneid,//左边模块的id
  					obj:JSON.stringify({"auditors":idxyz})//8389423[模块里所有人的id，],
				}
	        }).done(this.proxy(function (data) {
	        	if(data.success){
	        		varp.detach();
	        		this._refresh();
		        	$.u.alert.success("删除成功",3000);
	        	}
	        })).fail(this.proxy(function (jqXHR, errorText, errorThrown) {
	
	        }));
		
	},
	
	_refresh:function(){
		this.btnfilter.trigger("click");
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
                    maxlength: jQuery.format("密码不能多于{0}个字符")
                },
                confirm_password: {
                    required: "请填写密码",
                    maxlength: jQuery.format("密码不能多于{0}个字符"),
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
    
    
    createfilterbox:function(){
            $.each(this.columns, this.proxy(function (idx, afilter) {
                var htm = this._filtertemplate.replace(/#\{propid\}/g, afilter.key)
                			  				  .replace(/#\{propname\}/g, afilter.name);
                $(htm).appendTo(this.filterbox).data("data-data",afilter); 
            }));
           this.btnfilter= $("<button class='btn btn-default btn-sm text-right' qid='btn_filter'>搜索</button>")
           				.appendTo(this.filterbox).off("click").on("click",this.proxy(this._tablesearch));//搜索
           this.btnfilter.trigger("click");
    },
    
    _initfilterbox:function(){
    	var headwidth=  this.filterbox.width();
         // 用户
    	 $("[name=userfullname]").select2({
         	width:0.25*headwidth,
        	placeholder: "选择用户",
        	allowClear:true,
         	ajax:{
 	        	url: $.u.config.constant.smsqueryserver,
 	            dataType: "json",
 	            type:"post",
 	            data:this.proxy(function(term,page){
         			return {
         				tokenid:$.cookie("tokenid"),
         				method:"stdcomponent.getbysearch",
         				dataobject:"user",//item   parent
         				search:JSON.stringify({"value":term}),
         				start: (page - 1) * this._select2PageLength,
 	    				length: this._select2PageLength,
         				rule:JSON.stringify([[{"key":"fullname","op":"like","value":term}]])
         			};
 		        }),
 		        results:this.proxy(function(data,page){
 		        	if(data.success){
 		        		return {results:$.map(data.data.aaData,function(user,idx){
 		        							user.fullusername=user.fullname+"("+user.username+")"
 					        			return user;	
 					        	}),
 					        	more: data.data.iTotalRecords > (page * this._select2PageLength),	
 		        		};
 		        	}
 		        })
 	        },
 	        formatResult: function(item){
	        	return item.fullusername;      		
	        },
	        formatSelection: function(item){
	        	return item.fullusername;	        	
	        }
         });
    	 
     $("[name=unitname]").select2({
         	width:0.25*headwidth,
       	    placeholder: "选择安检机构",
       	    allowClear:true,
           	ajax:{
  	        	url: $.u.config.constant.smsqueryserver,
  	        	type: "post",
  	            dataType: "json",
  	        	data: function(term, page){
  	        		return {
  		    			"tokenid":$.cookie("tokenid"),
  		    			"method":"stdcomponent.getbysearch",
  						"dataobject":"unit",
  						"rule":JSON.stringify([[{"key":"name","value":term}]])
  	        		};
  	    		},
  		        results:function(data,page){
  		        	if(data.success){
  		        		return {results:$.map(data.data,function(item,idx){
  		        			return item;
  		        		})};
  		        	}
  		        }
  	        },
  	        formatResult: function(item){
  	        	return item.name;      		
  	        },
  	        formatSelection: function(item){
  	        	return item.name;	        	
  	        }
        });
    	
    //   专业下拉框初始化
     	$("[name=profession]").select2({
         	width:0.25*headwidth,
     		placeholder: "选择专业",
     		allowClear:true,
         	ajax:{
 	        	url: $.u.config.constant.smsqueryserver,
 	        	type: "post",
 	            dataType: "json",
 	        	data: function(term, page){
 	        		return {
 		    			"tokenid":$.cookie("tokenid"),
 		    			"method":"stdcomponent.getbysearch",
 		    			"dataobject":"dictionary",
 		    			"rule":JSON.stringify([[{"key":"type","value":"系统分类"}]])
 	        		};
 	    		},
 		        results:function(data,page){
 		        	if(data.success){
 		        		return {results:$.map(data.data.aaData,function(item,idx){
 		        			return item;
 		        		})};
 		        	}
 		        }
 	        },
 	        formatResult: function(item){
 	        	return item.name;      		
 	        },
 	        formatSelection: function(item){
 	        	return item.name;	        	
 	        }
         });
    },
    /**
     * @title 创建人员
     * @return void
     */
    _adduser:function(e){
		e.preventDefault();
		try{
	    	window.open(this.getabsurl('../qualification/viewEditUser.html'), 
	    			'newwindow',
	    			'MultiLine=true,height=650, width=1250, top=20, left=100, toolbar=no, menubar=no, scrollbars=yes, resizable=no, location=no, status=no');
	    	 
			
    	}catch(e){
    		throw new Error(com.audit.qualification.qua.i18n.createFail+e.message);
    	}
		
    },

    _initUnitDialog:function(){
    	$.u.load("com.audit.qualification.quaDialogEdit");
    	this.quaDialogEdit = new com.audit.qualification.quaDialogEdit($("div[umid='quaDialogEdit']",this.$),null);
    	this.quaDialogEdit.override({
    		refreshDataTable:this.proxy(function(){
    			this.dataTable.fnDraw();
    		})
    	});
    },
    
    

    /**
     * @title 编辑
     * @return void
     * 先查询 再编辑
		<query>
		tokenid：
		method：getAuditorInfoById
		id:数据ID
		http://localhost:8080/sms/query.do?
		method=getAuditorInfoById&tokenid=1438933056541&id=1
		<edit>
		tokenid：
		method：stdcomponent.update
		dataobject:auditor;
		dataobjectid:数据ID
		obj:{参数在Auditor类}
	* 
     * 
     */
    
   
    on_editUnit_click:function(e){
    	e.preventDefault();
    	var data = JSON.parse($(e.currentTarget).attr("data"));
    	try{
	    	window.open(this.getabsurl('../qualification/viewEditUser.html?clid='+data.id), 'newwindow', 'height=650, width=950, top=100, left=100, toolbar=no, menubar=no, scrollbars=yes, resizable=no, location=no, status=no');
    		//window.location.href="../qualification/viewEditUser.html?clid="+data.id;
    	}catch(e){
    		throw new Error(this.i18n.editFail+e.message);
    	}
    	
    },
    

    /**
     * @title 删除
     * @return void
     * <delete>
		tokenid：
		method：stdcomponent.delete
		dataobjectid:数据ID
     * 
     * 
     */
    on_removeUnit_click: function (e) {
    	e.preventDefault();
    	try{
    		var data = JSON.parse($(e.currentTarget).attr("data"));
    		$.u.load("com.sms.common.stdcomponentdelete");
    		(new com.sms.common.stdcomponentdelete({
    			body:"<div>"+
    				 	"<p> "+com.audit.qualification.qua.i18n.removedis+"</p>"+
    				 "</div>",
    			title:com.audit.qualification.qua.i18n.removetitle,
    			dataobject:"auditor",
    			dataobjectids:JSON.stringify([parseInt(data.id)])
    		})).override({
    			refreshDataTable:this.proxy(function(){
    				 this.usertable.fnDraw();
    			})
    		});
    	}catch(e){
    		throw new Error(com.audit.qualification.qua.i18n.removeFail+e.message);
    	}
    },
    
    //leftdata 勾画左侧角色块
    _drawblock:function(data){
    	if($.isArray(data)){
	    	this.unitdropzone.children(".dropzoneparent").remove();
			$.each(data,this.proxy(function(idx,item){//A1一级审计员组
			 var  htm = this._droptem.replace(/#\{usergroupname\}/g, item.usergroupname)
			 						.replace(/#\{total\}/g, item.users.length||0)
			 						.replace(/#\{usergroupid\}/g, item.usergroupid);
			  var $thisdropzone=$('<div class="dropzone"></div>');
			  var $thisdropzoneparent=$('<div class=""></div>');
	
	         $.isArray(item.users) && $.each(item.users,function(key,value){//A1一级审计员组的组员
		     	 var $el = $('<p class="drop-item" dataid="'+ value.id +'"userid="'+ value.userid +' "><img width="24" height="24" src="'
		     			 +value.avatarUrl+'" qid="userpic" alt="" /><span qid="username" style="padding: 4px;">'
		     			 +value.userfullname+'</span></p>');
			   	    var $bun=$('<a href="#" class="remove-role" title="移除"><span class="glyphicon glyphicon-remove-sign"></span></a>')
			   	    .click(function () {
			   	    	$(this).parent().detach(); })
			   	    $el.append($bun);
			   	    $thisdropzone.append($el);
	         })
	         
	         $thisdropzoneparent.append($thisdropzone);
	         var $htm=$(htm);
	         $htm.append($thisdropzoneparent);
			 $htm.appendTo(this.unitdropzone).data("data-data",item); 
			}))
	    }
    	
    	this._addcss();
    	
    },
    
    
    _addcss:function(){
    	  $(".glyphicon-remove-sign").attr("style","color:#bbb");
    	  
        	$(".dropzone").css( {
	      	  "padding": "20px",
	      	  "background": "#eee",
	      	  "min-height": "200px",
	      	  "margin-bottom": "20px",
	      	  "z-index": "0",
	      	  "border":"1px solid #C9C9C9",
	      	  "border-radius": "10px"
	      	})
      	$(".dropzone").parent().attr("style","padding:25px 5px;");
       
   
    	$(".glyphicon-trash ",this.unitdropzone).css({"opacity":"0.2"}).hover( function(event){
              $(this).css("opacity", "0.8");  //鼠标移入  
          }, function(event){
              $(this).css("opacity", "0.2");
          } ).off("click").on("click",this.proxy(this._trashblock));
    	
    	$(".glyphicon-remove-sign ",this.unitdropzone).css({"opacity":"0.2"}).hover( function(event){
            $(this).css("opacity", "0.8");  //鼠标移入  
        }, function(event){
            $(this).css("opacity", "0.2");
        } );
	   	  $("p").attr("style","margin:0 0 10px");
    },
    
    
    
    //移除单个用户
    _removeuser:function(){
    	
    },
    //创建培训
	//method:SaveAuditorTrain
	//tokenid:
	//obj:{"eventDate":日期,"content":内容,"department": 机构,"userIds":[所有人的id]}
    _addtrain:function(e){
		try{
			this.creattrain.open({data:"", title:"创建培训"});
			this.creattrain.override({
	    		refreshDataTable:this.proxy(function(){
	    		//	this.dataTable.fnDraw();
	    		})
	    	});
		}catch(e){
			throw new Error("_addtrain :"+e.message);
		}
    	
    },
    
    
    
    /**
     * @title ajax
     * @param url {string} url
     * @param param {object} ajax param
     * @param $container {jQuery object} the object for block
     * @param blockParam {object} blockui param
     * @param callback {function} callback
     */
    _ajax:function(url,param,$container,blockParam,callback){
    
    	$.u.ajax({
    		"url":url,
    		"type": url.indexOf(".json") > -1 ? "get" : "post" ,
    		"data":$.cookie("tokenid") ? $.extend({"tokenid":$.parseJSON($.cookie("tokenid"))},param) : $.extend({"tokenid":$.parseJSON($.cookie("uskyuser")).tokenid},param),
    		"dataType":"json"
    	},$container,$.extend({},blockParam)).done(this.proxy(function(response){
    		if (response.success) {
    			callback && callback(response);
    		}   		
    	})).fail(this.proxy(function(jqXHR,responseText,responseThrown){
    		
    	}));
    },
    destroy: function () {
        this._super();
    }
}, { usehtm: true, usei18n: true });

com.audit.qualification.qua.widgetjs = ['../../../uui/widget/jqurl/jqurl.js',
                            "../../../uui/widget/jqblockui/jquery.blockUI.js",
                            "../../../uui/widget/jqdatatable/js/jquery.dataTables.js",
                     	    //"../../../uui/widget/jqdatatable/js/dataTables.bootstrap.js",
                            "../../../uui/widget/select2/js/select2.min.js",
                            "../../../uui/widget/spin/spin.js",
                            "../../../uui/widget/jqblockui/jquery.blockUI.js",
                            "../../../uui/widget/ajax/layoutajax.js"];
com.audit.qualification.qua.widgetcss = [{ path: "../../../uui/widget/select2/css/select2.css" }, 
                                             { path: '../../../uui/widget/jqdatatable/css/jquery.dataTables.css' }, 
                                             { path: '../../../uui/widget/jqdatatable/css/dataTables.bootstrap.css' },
                                           { path: "../../../uui/widget/select2/css/select2-bootstrap.css" }];