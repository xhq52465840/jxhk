//@ sourceURL=com.audit.qualification.editUser
$.u.define('com.audit.qualification.editUser', null, {
    init: function (options) {
    	this.i18n = com.audit.qualification.editUser.i18n
    	this._SELECT2_PAGE_LENGTH = 10;
    	this._select2PageLength= 10;
    	this.temp = "<div class='col-sm-3 col-md-3 col-lg-3 professionWidget' style='margin-top: 5px;'>"+
						"<div class='col-sm-12 col-md-12 col-lg-12'><input type='checkbox' data-iid='#{id}' style='margin-right: 2px;'><span class='professionName'>#{labelName}</span></div>"+
				/*		"<div class='col-sm-8 col-md-8 col-lg-8 no-left-right-padding'>"+
						"<input type='text' class='form-control input-sm professionUserSelect2' data-id='#{id}'/>"+
						"</div>"+*/
					"</div>";
        this._requiredProfessions = false;
        $.validator.addMethod( "compareDate", function( value, element, params ){
            var $compare = $(params), compareValue = $.trim($compare.val());
            if(value){
                value = new Date(value);
                if(compareValue){
                    compareValue = new Date(compareValue);
                    if(value - compareValue > 0){
                        return true;
                    }
                    else{
                        return false;
                    }
                }
                else{
                    return true;
                }
            }
            else{
                return false;
            }
        }, "结束日期小于开始日期");
        this.editData=null;
        
    	this.emailUserEnums = [{name:"通知我",value:"Y"},{name:"不要通知我",value:"N"}];
    	this.defaultAccessEnums = [{name:"共享",value:"Y"},{name:"不共享",value:"N"}];
    	this.autoWatchEnums = [{name:"启用",value:"Y"},{name:"禁用",value:"N"},{name:"从全局设置继承",value:"EXTEND"}];
        
        this._DATATABE_LANGUAGE = { //语言
                "sSearch": this.i18n.search,
                "sZeroRecords": "抱歉未找到记录",
                "sInfoEmpty": "没有数据",
                "sProcessing": ""+this.i18n.searching+"...",
            };
    },
    afterrender: function (bodystr) {

    	
    	this._clid = $.urlParam().clid;//id 存在 就是编辑 不存在 就是 创建
    	this._clid = parseInt(this._clid);
    	if(this._clid){
    		this._parm_edit=true;
    		$("input[name=user]").attr("readonly",true);
    	}else{
    		$(".panel-button-container").addClass("hidden");
    		this._parm_edit=false;
    		$("input[name=user]").attr("readonly",false);
    	}
      	this.infoform=this.qid("infoform");
    	this.professionArray=[];
    	this._initprofile();//初始化基本信息
    	this.professionContainer = this.qid("professionContainer");
        this.professionContainer.off("click", "input:checkbox").on("click", "input:checkbox", this.proxy(this.on_profession));
        this.loadProfessions();
    	this._initimg();
    	this._return = this.qid("btn-return");
		this._return.off("click").on("click", this.proxy(this._on_return_click));//返回
		this.add = this.qid("add");
		this.add.off("click").on("click", this.proxy(this._addPoints));//添加培训
		this.addtwo = this.qid("addtwo");
		this.addtwo.off("click").on("click", this.proxy(this._addtwoPoints));//添加
		this.addthree = this.qid("addthree");
		this.addthree.off("click").on("click", this.proxy(this._addthreePoints));//添加
		this.addfour = this.qid("addfour");
		this.addfour.off("click").on("click", this.proxy(this._addfourPoints));//添加
		this.addfive = this.qid("addfive");
		this.addfive.off("click").on("click", this.proxy(this._addfivePoints));//添加
		this.addsix = this.qid("addsix");
		this.addsix.off("click").on("click", this.proxy(this._addsixPoints));//添加
		this.addseven = this.qid("addseven");
		this.addseven.off("click").on("click", this.proxy(this._addsevenPoints));//添加
		
		this._createDialog(); 
		this.btnsave =  this.qid("btn-save").off("click").on("click", this.proxy(this._on_btnsave));//保存
		this._userpic.off("click").on("click",this.proxy(this.on_ImgDialog_click));//头像点击事件  
		if(!this._clid){
			var data=[];
			this._createDatatable(data);
		}
		 this._initInfo();
		 $(".glyphicon-btn").off("click").on("click",this.proxy(function(event){
	       		var tar=$(event.currentTarget);
	       		tar.closest(".panel-heading").next().slideToggle(600);
	       		if(tar.hasClass("glyphicon-minus")){
	       			tar.removeClass("glyphicon-minus").addClass("glyphicon-plus");
	       		}else{
	       			tar.removeClass("glyphicon-plus").addClass("glyphicon-minus");
	       		}
	       		
	       	}));
		 
	
		 this.infoform.validate({
	            rules: {
	                "user": {
	                    required:true
	                },
	                "unit":{
	                	required:true
	                }
	            },
	            messages: {
	                "user": "姓名不能为空",
	             
	                "unit":"安监机构不能为空"
	            },
	            errorClass: "text-danger text-validate-element",
	            errorElement: "div"
	        });
		 
		 
	    	this.qid("upload-avatar").uploadify({
	            'formData': {'tokenid': $.cookie("tokenid"), "method": "upload" },
	            'buttonText':'选择头像', //按钮上的字
	            //'buttonClass': 'CancelBtn',
	            //'buttonImage': this.getabsurl('res/upload.png'),
	            'auto':true,
	            'removeCompleted': true,
	            'swf': this.getabsurl('../../../uui/widget/uploadify/uploadify.swf'),
	           'uploader': $.u.config.constant.smsmodifyserver+"?tokenid="+$.cookie("tokenid")+"&method=uploadAuditorPIC",
	            fileTypeExts:'*.jpg;*.png;*.jpeg',
	            'removeTimeout': 0,
	            'height': 30,
	            'width': 250,
	            'onUploadSuccess': this.proxy(function (file, result, response) {
	                var resultx = $.parseJSON(result);
	            		var dataid=resultx.data.id;
	            		this.dataID=resultx.data.id;
	            }),
	            'onUploadStart': this.proxy(function (file) {
	            	//this.qid("upload-avatar").uploadify("settings", 'formData', {  });
	            }),
	            'onSelect': this.proxy(function (file) {
	            }),
	            'onSelectError': this.proxy(function (file) {
	            }),
	            'onCancel': this.proxy(function (file) {
	            }),
	            'onUploadComplete': this.proxy(function (file,result, response) {
	            	this.on_ImgDialog_save(this.dataID);
	            })
	        }); 
	    	
    },
    
    loadProfessions : function(){
    	this._ajax(
			$.u.config.constant.smsqueryserver, 
			true, 
			{
				"method" : "stdcomponent.getbysearch",
				"dataobject" : "dictionary",
				"rule": JSON.stringify([[{"key":"type","value":"系统分类"}]]),
                "columns": JSON.stringify([{"data": "lastUpdate"}]),
                "order": JSON.stringify([{"column": 0, "dir": "desc"}])
			}, 
			this.$, 
			{},
			this.proxy(function(response) {
				if(response.success){
					this._drawProfession(response.data.aaData);
				}
			})
		);
    },
    
    _drawProfession : function(data){
    	data && $.each(data, this.proxy(function(key, item){
    		var temp = this.temp.replace(/#\{id\}/g, item.id)
    							.replace(/#\{iid\}/g, item.id)
    							.replace(/#\{labelName\}/g, item.name);
    		$(temp).appendTo(this.professionContainer);
    	}));
    	
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
	//初始化基本信息
	_initprofile:function(){
		this._user=$("[name=user]");
		this._spell=$("[name=spell]");//拼音
		this._sex=$("[name=sex]");// 性别
		this._unit=$("[name=unit]");// 所属单位
		this._department=$("[name=department]",this.infoform);// 所属部门
		this._duties=$("[name=duties]");// 职务
		this._quarters=$("[name=quarters]");// 岗位
		this._officeTel=$("[name=officeTel]");// 办公电话
		this._faxNumber=$("[name=faxNumber]");// 传真电话
		this._cellTel=$("[name=cellTel]");// 手机电话
		this._email=$("[name=email]");// 电子邮箱
		this._political=$("[name=political]");// 政治面貌
		this._nationalist=$("[name=nationalist]");// 民族
		this._education=$("[name=education]");// 文化程度
		this._recruitment=$("[name=recruitment]");// 籍贯
		this._cardNo=$("[name=cardNo]");// 身份证号码
		this._address=$("[name=address]");// 家庭住址
		this._safeNo=$("[name=safeNo]"); // 安全监察证编号
		this._hiredDate=$("[name=hiredDate]");// 首次受聘日期
		this._auditorNo=$("[name=auditorNo]");// 编号
		this._userpic=$("[name=userpic]");// 头像
		//姓名
		this._user.select2({
	        	placeholder: "选择姓名",
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
	 		        					user.fullusername=user.fullname+"("+user.username+")";	
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
		        formatSelection: this.proxy(function(item){
		        	return item.fullusername;	        	
		        })
	         }).on("select2-selecting", this.proxy(function(e) {
	 			var item={"id":e.object.id,"name":e.object.fullname};
	 			this._selectName(item);
	 			$("[for="+this._id+"-user]").remove();
	 		})).on("select2-removing", this.proxy(function(e) {
            }));;
		
		 this._sex.select2({
				data: [{id:'男',text:'男'},{id:'女',text:'女'}]
			});
		 
		 
		 //unitname
		 this._unit.select2({
		       	    placeholder: "选择安检机构",
			        ajax:{
		  	        	url: $.u.config.constant.smsqueryserver,
		  	        	type: "post",
		  	            dataType: "json",
		  	        	data: function(term, page){
		  	        		return {
		  		    			"tokenid":$.cookie("tokenid"),
		  		    			"method":"stdcomponent.getbysearch",
		  		    		    "dataobject":"unit",
			  	                "rule":JSON.stringify([[{"key":"name","op":"like","value":term}]])
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
		 }).on("select2-selecting", this.proxy(function(e) {
	 			$("[for="+this._id+"-unit]").remove();
	 		})).on("select2-removing", this.proxy(function(e) {
         }));
		 
		 this._hiredDate.datepicker({ dateFormat: "yy-mm-dd" });
		 
    },
    _initimg:function(){
    	
    	this._userpic.attr("src","/sms/uui/img/useravatar/useravatar-unknown.png");
    
    },
    
    //添加人员的页面，选择一个人以后，发送请求，查询人员的电话，邮箱，头像，所属部门，
    //把他所有的部门都列出来，方法：method=getUserInfoById&tokenid=1439443776456&id=11
    _selectName:function(item){
    	this.userid=item.id;
    	$.ajax({
        	url: $.u.config.constant.smsqueryserver,
	        type:"post",
	        dataType: "json",
	        cache: false,
	        "data": {
    		  "tokenid":$.cookie("tokenid"),
    		  "method":"getUserInfoById",
    		  "id":item.id
	    	}
        }).done(this.proxy(function(response){
        	if(response.success){
        		this.getUserInfo(response.data);
        	}
        })).fail(this.proxy(function(jqXHR,errorText,errorThrown){
        	
        })).complete(this.proxy(function(jqXHR,errorStatus){
        	
        }));
    	
    },
    
    
    
    getUserInfo:function(data){
    	if(data.user){
    		var infodata=data.user
        	infodata.telephoneNumber && this._cellTel.val("") && this._cellTel.val(infodata.telephoneNumber);// 手机电话
        	infodata.email && this._email.val("") && this._email.val(infodata.email);//电子邮箱
        	if(infodata.avatarUrl){
        		this._userpic.attr("src",infodata.avatarUrl);
        	}
    	}
    	
    	if(data.organization){
    		var orgpath=[];
    		$.isArray(data.organization) && $.each(data.organization,this.proxy(function(idx,item){
    			item.path && orgpath.push(item.path);
    		}))
    		this._department.val(orgpath.join("；"));
    	}
    },
	
    
    //上传头像
    //上传头像成功以后，更新user对象的avatar为上传头像返回的id
    on_editUserAvatar_click: function(e){
    	if(this.userid){
    		var cls = $.u.load("com.sms.common.selectAvatar");
    		this.selectUserAvatar = new cls($("div[umid='selectUserAvatar']",this.$),{
        		uploadparam:"dataobject=userAvatar",
        		save:this.proxy(function(comp,avatar_id){
        			this.avatarid=avatar_id;
        			$.ajax({
        	        	url: $.u.config.constant.smsmodifyserver,
        		        type:"post",
        		        dataType: "json",
        		        cache: false,
        		        "data": {
        	    		  "tokenid":$.cookie("tokenid"),
        	    		  "method":"stdcomponent.update",
        	    		  "dataobject":"user",
        	    		  "dataobjectid":this.userid,//用户的ID
        	    		  "obj":JSON.stringify({avatar:parseInt(avatar_id)})
        		    	}
        	        }).done(this.proxy(function(response){
        	        	if(response.success){
        	        		this._initInfo();
        	    			comp.selectAvatarDialog.dialog("close");
        	        	}
        	        })).fail(this.proxy(function(jqXHR,errorText,errorThrown){
        	        	
        	        })).complete(this.proxy(function(jqXHR,errorStatus){
        	        	
        	        }));
        		})
        	});
    	    this.selectUserAvatar.open({rule:JSON.stringify([[{key:"system",value:true},{key:"owner",value:$.parseJSON($.cookie("uskyuser")).username}],[{key:"type",value:"user"}]])},this.avatarid);
    
    	}else{
    		e.preventDefault();
    		$.u.alert.warn("请先选择姓名!",3000);
    	}
  },
    
  
   
    _createDatatable : function(data) {
        
      //个人简历
   	 this.dataTable_one = this.qid("resumetable").dataTable({
            searching: false,
            serverSide: false,//服务端处理分页
            bProcessing: false,//当datatable获取数据时候是否显示正在处理提示信息。
            'bFilter': false,  //是否使用内置的过滤功能
            'bPaginate': true,  //是否分页。
            "sPaginationType": "bootstrap", //分页样式   full_numbers
            'bLengthChange': true, //是否允许自定义每页显示条数.
            ordering: false,
            bRetrieve: true,
            pageLength : 1000,
            'iDisplayLength':13, //每页显示10条记录
            "aaData":data.personal||[],
            "sDom":"t<i>",
            "columns":  [
                     { "title": "日期" ,"mData":"eventDate", "class":"","sWidth":"30px"},
                     { "title": "所在单位和部门" ,"mData":"department", "class":"","sWidth":"30%"},
                     { "title": "担任职务" ,"mData":"content", "class": "","sWidth":"25%"},
                     { "title": "操作" ,"mData":"id","sWidth":"15%"}
                     ],
          
            "bInfo":false,
            "bDeferRender":false,
            "oLanguage": this._DATATABE_LANGUAGE,//语言国际化
            "aoColumnDefs": [
                 {
                     "aTargets": 0,
                     "orderable":false,
                     "sClass": "eventDate-td",
                     "mRender": function (data, type, full) {
                            return data;
                     }
                 },
                 {
                     "aTargets": 1,
                     "sDefaultContent": "--",
                     "sClass": "department-td",
                     "orderable":false,
                     "mRender": function (data, type, full) {
                   	       return  data;
                     }
                 },
                {
                    "aTargets": 2,
                    "sClass": "content-td",
                    "sDefaultContent": "--",
                    "mRender": function (data, type, full) {
                    	 return  data;
                    	
                    }
                },
	            {
	                "aTargets": 3,
	                "sClass": "handle",
	                "mRender":this.proxy( function (data, type, full) {
	                	return      "<button type='button' class='btn btn-link edit' data='"+JSON.stringify(full)+"'>编辑</button>"
	                			+  "<button type='button' class='btn btn-link delete' data='"+JSON.stringify(full.id)+"'>删除</button>";
	             	
	                })
	            }
            ],
            "rowCallback": this.proxy(function(row, data, index){
           	 if(data.confirmMan && data.confirmMan.length>0){
           		 $(row).attr("style", "background-color: #dff0d8 !important");
           	 }
            })
        });
   	 
   	
    //运行质量审计培训记录
     
      	 this.dataTable_two = this.qid("resumetabletwo").dataTable({
               searching: false,
               serverSide: false,
               bProcessing: false,
               ordering: false,
               bRetrieve: true,
               pageLength : 1000,
               "sDom":"t<i>",
               "columns": [
                   { "title": "序号" ,"mData":"id","sWidth":"10%"},
                   { "title": "日期" ,"mData":"eventDate","sWidth":"25%"},
                   { "title": "培训机构" ,"mData":"department","sWidth":"25%"},
                   { "title": "培训课程" ,"mData":"content","sWidth":"25%"},
                   { "title": "操作" ,"mData":"id","sWidth":"15%"}
               ],
               "aaData":data.train||[],
               "bInfo":false,
               "bDeferRender":false,
               "oLanguage": this._DATATABE_LANGUAGE,
               "fnServerParams": this.proxy(function (aoData) {}),
               "fnServerData": this.proxy(function (sSource, aoData, fnCallBack, oSettings) { }),
               "aoColumnDefs": [
                    {
                        "aTargets": 0,//序号
                        "orderable":false,
                        "sClass": "jtdidx",
                        "mRender": function (data, type, full) {
                       	 return  data;
                         
                        }
                  
                    },
                    {
                        "aTargets": 1,
                        "orderable":true,
                        "mDataProp": "engine", 
                        "sDefaultContent": "Edit",//允许给列值一个默认值，只要发现null值就会显示默认值
                        "mRender": function (data, type, full) {
                             return  data;
                         
                        }
                  
                    },
                   {
                       "aTargets": 2,
                       "orderable":false,
                       "mRender": function (data, type, full) {
                            return  data;
                       }
                   },
                   {
                       "aTargets": 3,
                       "mRender": function (data, type, full) {
                    	   return  data;
                       }
                   },
   	            {
   	                "aTargets": 4,
   	                "sClass": "handle",
   	                "mRender":this.proxy( function (data, type, full) {
   	                	return      "<button type='button' class='btn btn-link edit' data='"+JSON.stringify(full)+"'>编辑</button>"
   	                			+  "<button type='button' class='btn btn-link delete' data='"+JSON.stringify(full.id)+"'>删除</button>";
   	             	
   	                })
   	            }
               ]
           });
   	
      
   	 
      //资质、证书等情况记录
     	 this.dataTable_three = this.qid("resumetablethree").dataTable({
              searching: false,
              serverSide: false,
              bProcessing: true,
              bRetrieve: true,
              ordering: false,
              pageLength : 1000,
              "sDom":"t<i>",
              "columns": [
                  { "title": "序号" ,"mData":"idx","sWidth":"10%"},
                  { "title": "日期" ,"mData":"eventDate","sWidth":"20%"},
                  { "title": "名称" ,"mData":"content","sWidth":"30%"},
                  { "title": "颁证机构" ,"mData":"department","sWidth":"25%"},
                  { "title": "操作" ,"mData":"id","sWidth":"15%"}
              ],  
              "aaData": data.situation||[],
              "bInfo":false,
              "bDeferRender":false,
              "oLanguage": this._DATATABE_LANGUAGE,
             
              "aoColumnDefs": [
                   {
                	   "aTargets": 0,//序号
                       "orderable":false,
                       "sClass": "ktdidx",
                       "sContentPadding": "mmm",
                       "mDataProp": "engine", 
                       "sDefaultContent": "--",//允许给列值一个默认值，只要发现null值就会显示默认值
                       "mRender": function (data, type, full) {
                   
                    	   return  data;
                       }
                 
                   },
                   {
                       "aTargets": 1,
                       "mRender": function (data, type, full) {
                     
                    	   return  data;
                       }
                   },
                  {
                      "aTargets": 2,
                      "sClass": "deferfinish-two",
                      "sDefaultContent": " ",
                      "mRender":this.proxy( function (data, type, full) {
                    	  return  data;
                      })
                  },
  	            {
  	                "aTargets": 4,
  	                "sClass": "handle",
  	                "mRender":this.proxy( function (data, type, full) {
  	                	return      "<button type='button' class='btn btn-link edit' data='"+JSON.stringify(full)+"'>编辑</button>"
  	                			+  "<button type='button' class='btn btn-link delete' data='"+JSON.stringify(full.id)+"'>删除</button>";
  	             	
  	                })
  	            }
              ],
              "rowCallback": this.proxy(function(row, data, index){
               })
          });
     
   	
     	 //参加安全运行审计情况
   	this.dataTable_four = this.qid("resumetablefour").dataTable({
           searching: false,
           serverSide: false,
           bProcessing: true,
           bRetrieve: true,
           ordering: false,
           pageLength : 10,
           "sDom":"t<i>",
           "columns": [
               { "title": "序号" ,"mData":"idx","sWidth":"10%"},
               { "title": "日期" ,"mData":"eventDate","sWidth":"20%"},
               { "title": "受审单位" ,"mData":"department","sWidth":"25%"},
               { "title": "专业" ,"mData":"profession","sWidth":"15%"},
               { "title": "备注" ,"mData":"content","sWidth":"15%"},
               { "title": "操作" ,"mData":"id","sWidth":"15%"}
           ], 
           "aaData": data.audit||[],
           "bInfo":false,
           "bDeferRender":false,
           "oLanguage": this._DATATABE_LANGUAGE,
           "fnServerParams": this.proxy(function (aoData) {}),
           "fnServerData": this.proxy(function (sSource, aoData, fnCallBack, oSettings) {
            }),
           "aoColumnDefs": [
                {
                    "aTargets": 0,//序号
                    "orderable":false,
                    "sClass": "ltdidx",
                    "sContentPadding": "mmm",
                    "mDataProp": "engine", 
                    "sDefaultContent": "--",//允许给列值一个默认值，只要发现null值就会显示默认值
                    "mRender": function (data, type, full) {
                    	  return  data;
                    }
                },
                {
                    "aTargets": 1,
                    "mRender": function (data, type, full) {
                    	  return  data;
                    }
                },
               {
                   "aTargets": 2,
                   "sClass": "mislead-two",
                   "mRender":this.proxy( function (data, type, full) {
                	   return  data;
                   })
               },
	            {
	                "aTargets": 5,
	                "sClass": "handle",
	                "mRender":this.proxy( function (data, type, full) {
	                	return      "<button type='button' class='btn btn-link edit' data='"+JSON.stringify(full)+"'>编辑</button>"
	                			+  "<button type='button' class='btn btn-link delete' data='"+JSON.stringify(full.id)+"'>删除</button>";
	             	
	                })
	            }
           ]
       });
	 $(".jtdidx").each(function(ids,item){
   		 if(item.tagName=="TD"){
   			 item.innerText=ids;
   		 }
 	 })
 	  $(".ktdidx").each(function(ids,item){
   		 if(item.tagName=="TD"){
   			 item.innerText=ids;
   		 }
 	 })
 	  $(".ltdidx").each(function(ids,item){
   		 if(item.tagName=="TD"){
   			 item.innerText=ids;
   		 }
 	 })
 	 
 	
   	 //风险管理员
    	this.dataTable_five = this.qid("resumetablefive").dataTable({
            searching: false,
            serverSide: false,
            bProcessing: true,
            bRetrieve: true,
            ordering: false,
            pageLength : 10,
            "sDom":"t<i>",
            "columns": [
                    { "title": "序号" ,"mData":"idx","sWidth":"15%"},
                    { "title": "受聘日期" ,"mData":"eventDate","sWidth":"25%"},
                    { "title": "培训记录" ,"mData":"department","sWidth":"30%"},
                    { "title": "备注" ,"mData":"content","sWidth":"15%"},
                    { "title": "操作" ,"mData":"id","sWidth":"15%"}
            ], 
            "aaData": data.risk||[],
            "bInfo":false,
            "bDeferRender":false,
            "oLanguage": this._DATATABE_LANGUAGE,
            "fnServerParams": this.proxy(function (aoData) {}),
            "fnServerData": this.proxy(function (sSource, aoData, fnCallBack, oSettings) {
             }),
            "aoColumnDefs": [
                 {
                     "aTargets": 0,//序号
                     "orderable":false,
                     "sClass": "ftdidx",
                     "sContentPadding": "mmm",
                     "mDataProp": "engine", 
                     "sDefaultContent": "--",//允许给列值一个默认值，只要发现null值就会显示默认值
                     "mRender": function (data, type, full) {
                     	  return  data;
                     }
                 },
                 {
                     "aTargets": 1,
                     "mRender": function (data, type, full) {
                    
                     	  return  data;
                     }
                 },
                {
                    "aTargets": 2,
                    "sClass": "mislead-two",
                    "mRender":this.proxy( function (data, type, full) {
                
                 	   return  data;
                    })
                },
	            {
	                "aTargets": 4,
	                "sClass": "handle",
	                "mRender":this.proxy( function (data, type, full) {
	                	return      "<button type='button' class='btn btn-link edit' data='"+JSON.stringify(full)+"'>编辑</button>"
	                			+  "<button type='button' class='btn btn-link delete' data='"+JSON.stringify(full.id)+"'>删除</button>";
	             	
	                })
	            }
            ]
        });
 
 	 //不安全事件调查员
	this.dataTable_six = this.qid("resumetablesix").dataTable({
        searching: false,
        serverSide: false,
        bProcessing: true,
        bRetrieve: true,
        ordering: false,
        pageLength : 10,
        "sDom":"t<i>",
        "columns": [
            { "title": "序号" ,"mData":"idx","sWidth":"15%"},
            { "title": "受聘日期" ,"mData":"eventDate","sWidth":"20%"},
            { "title": "培训记录" ,"mData":"department","sWidth":"25%"},
            { "title": "备注" ,"mData":"content","sWidth":"25%"},
            { "title": "操作" ,"mData":"id","sWidth":"15%"}
        ], 
        "aaData": data.safe||[],
        "bInfo":false,
        "bDeferRender":false,
        "oLanguage": this._DATATABE_LANGUAGE,
        "fnServerParams": this.proxy(function (aoData) {}),
        "fnServerData": this.proxy(function (sSource, aoData, fnCallBack, oSettings) {
         }),
        "aoColumnDefs": [
             {
                 "aTargets": 0,//序号
                 "orderable":false,
                 "sClass": "stdidx",
                 "sContentPadding": "mmm",
                 "mDataProp": "engine", 
                 "sDefaultContent": "--",//允许给列值一个默认值，只要发现null值就会显示默认值
                 "mRender": function (data, type, full) {
                 	  return  data;
                 }
             },
             {
                 "aTargets": 1,
                 "mRender": function (data, type, full) {
                 	  return  data;
                 }
             },
            {
                "aTargets": 2,
                "sClass": "mislead-two",
                "mRender":this.proxy( function (data, type, full) {
             	   return  data;
                })
            },
            {
                "aTargets": 4,
                "sClass": "handle",
                "mRender":this.proxy( function (data, type, full) {
                	return      "<button type='button' class='btn btn-link edit' data='"+JSON.stringify(full)+"'>编辑</button>"
                			+  "<button type='button' class='btn btn-link delete' data='"+JSON.stringify(full.id)+"'>删除</button>";
             	
                })
            }
        ]
    });
	 
	 //信息管理员
		this.dataTable_seven = this.qid("resumetableseven").dataTable({
	        searching: false,
	        serverSide: false,
	        bProcessing: true,
	        bRetrieve: true,
	        ordering: false,
	        pageLength : 10,
	        "sDom":"t<i>",
	        "columns": [
                    { "title": "序号" ,"mData":"idx","sWidth":"15%"},
                    { "title": "受聘日期" ,"mData":"eventDate","sWidth":"25%"},
                    { "title": "培训记录" ,"mData":"department","sWidth":"25%"},
                    { "title": "备注" ,"mData":"content","sWidth":"20%"},
                    { "title": "操作" ,"mData":"id","sWidth":"15%"}
	        ], 
	        "aaData": data.info||[],
	        "bInfo":false,
	        "bDeferRender":false,
	        "oLanguage": this._DATATABE_LANGUAGE,
	        "fnServerParams": this.proxy(function (aoData) {}),
	        "fnServerData": this.proxy(function (sSource, aoData, fnCallBack, oSettings) {
	         }),
	        "aoColumnDefs": [
	             {
	                 "aTargets": 0,//序号
	                 "orderable":false,
	                 "sClass": "etdidx",
	                 "sContentPadding": "mmm",
	                 "mDataProp": "engine", 
	                 "sDefaultContent": "--",//允许给列值一个默认值，只要发现null值就会显示默认值
	                 "mRender": function (data, type, full) {
	                 	  return  data;
	                 }
	             },
	             {
	                 "aTargets": 1,
	                 "mRender": function (data, type, full) {
	                 	  return  data;
	                 }
	             },
	            {
	                "aTargets": 2,
	                "sClass": "mislead-two",
	                "mRender":this.proxy( function (data, type, full) {
	             	   return  data;
	                })
	            },
	            {
	                "aTargets": 4,
	                "sClass": "handle",
	                "mRender":this.proxy( function (data, type, full) {
	                	return      "<button type='button' class='btn btn-link edit' data='"+JSON.stringify(full)+"'>编辑</button>"
	                			+  "<button type='button' class='btn btn-link delete' data='"+JSON.stringify(full.id)+"'>删除</button>";
	             	
	                })
	            }
	        ]
	    });
		
		 $(".ftdidx").each(function(ids,item){
	   		 if(item.tagName=="TD"){
	   			 item.innerText=ids;
	   		 }
	 	 })
	 	  $(".stdidx").each(function(ids,item){
	   		 if(item.tagName=="TD"){
	   			 item.innerText=ids;
	   		 }
	 	 })
	 	  $(".etdidx").each(function(ids,item){
	   		 if(item.tagName=="TD"){
	   			 item.innerText=ids;
	   		 }
	 	 })
	 
	 this.dataTable_one
	 	.add(this.dataTable_two)
	 	.add(this.dataTable_three)
	 	.add(this.dataTable_four)
	 	.add(this.dataTable_five)
	 	.add(this.dataTable_six)
	 	.add(this.dataTable_seven).off("click","button.edit").on("click","button.edit",this.proxy(this.on_edit_click));
	 this.dataTable_one
	 	.add(this.dataTable_two)
	 	.add(this.dataTable_three)
	 	.add(this.dataTable_four)
	 	.add(this.dataTable_five)
	 	.add(this.dataTable_six)
	 	.add(this.dataTable_seven).off("click","button.delete").on("click","button.delete",this.proxy(this.on_delete_click));
	 	 
	 	 
	 	 
	 	$(".uui-table-ex").css({'width': '100%' ,'border-top': '1px solid #fff' }) ;
	 	$(".uui-table-ex tr > th:first-child, .uui-table tr > td:first-child").css({'padding-left': '10px;'} );
	 	$(".uui-table-ex > thead > tr").css( {'color': '#fff', 'background-color': '#A2ACB6',' height': '28px;' ,'border-bottom': '1px solid #fff;'});
	 	$(".uui-table-ex > thead > tr.infomodel-title ").css( {'color': '#333', 'background-color': '#E8E8EA', 'height': '32px', 'font-weight': 'bold;'});
		$(".uui-table-ex > tbody > tr ").css( {'background-color': '#F4F4F6', 'height': '38px' ,'border-bottom': '1px solid #fff'});
		$(".uui-table-ex > tbody > tr:last-child ").css( {'border-bottom-width': '0px;'});
		$(".uui-table-ex > tbody > tr > td.name ").css( { /*'width': '',*/ 'padding-left': '10px', 'font-weight': 'bolder', 'background-color':' #E7E7E9' });
		$(".uui-table-ex > tbody > tr > td.value").css(  { 'padding': '5px', 'border-right': '1px solid #fff', 'border-left': '1px solid #fff'});
		$(".uui-table-ex > tbody > tr > td.value:last-child ").css( {'border-right':'0px;'});
		$(".uui-table-ex > tbody > tr > td .label").css(  { 'padding-top': '0px','padding-bottom': '0px','margin-right': '10px', 'white-space': 'normal;'});
	 	 
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
            			tar=event.target;
            			this._fillDialogData(tar,this.editData);
            		}
           		})
        });
		//this.addtwoPoints
		this.addtwoDialog = this.qid("addtwoDialog").removeClass("hidden").dialog({
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
            close: this.proxy(this.on_addtwoDialog_close),
            open: this.proxy(function(event){
        		if(this.editData){
        			tar=event.target;
        			this._fillDialogData(tar,this.editData);
        		}
       		})
        });

		this.addthreeDialog = this.qid("addthreeDialog").removeClass("hidden").dialog({
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
            close: this.proxy(this.on_addthreeDialog_close),
            open: this.proxy(function(event){
        		if(this.editData){
        			tar=event.target;
        			this._fillDialogData(tar,this.editData);
        		}
       		})
        });
		
		this.addfourDialog = this.qid("addfourDialog").removeClass("hidden").dialog({
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
            close: this.proxy(this.on_addfourDialog_close),
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
            close: this.proxy(this.on_addfiveDialog_close),
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
            close: this.proxy(this.on_addsixDialog_close),
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
            close: this.proxy(this.on_addsevenDialog_close),
            open: this.proxy(function(event){
        		if(this.editData){
        			tar=event.target;
        			this._fillDialogData(tar,this.editData);
        		}
       		})
        });
		
		
		this.ImgDialog = this.qid("ImgDialog").removeClass("hidden").dialog({
        	title:"上传头像",
            width:540,
            modal: true,
            draggable: false,
            resizable: false,
            autoOpen: false,
            buttons:[
       		  {
       			  "text":"取消",
       			  "class":"aui-button-link",
       			  "click":this.proxy(this.on_ImgDialog_cancel)
       		  }
       		],
            close: this.proxy(this.on_addtwoDialog_close),
            open: this.proxy(this.on_addtwoDialog_open)
        });
		
		this.primaryDialog= this.qid("primaryDialog").removeClass("hidden").dialog({
        	title:"测试用例",
            width:840,
            modal: true,
            draggable: false,
            resizable: false,
            autoOpen: false,
            buttons:[{
				  "text":"保存",
				  "class":"btn-block",
				  "click":this.proxy(this.on_addDialog_save)
			  },
       		  {
       			  "text":"取消",
       			  "class":"aui-button-link",
       			  "click":this.proxy(this.on_primaryDialog_cancel)
       		  }
       		],
            close: this.proxy(this.on_primaryDialog_close),
            open: this.proxy(this.on_primaryDialog_open)
        });
	},
	
	on_ImgDialog_click: function(event){
		event.preventDefault()
		if(this.locuserid){
			this.ImgDialog.dialog("open");
		}else{
			$.u.alert.warn("请创建用户后再上传头像！",3000);
		}
	},
	
	//设置头像
	on_ImgDialog_save: function(avatar_id){
		$.ajax({
        	url: $.u.config.constant.smsmodifyserver,
	        type:"post",
	        dataType: "json",
	        cache: false,
	        "data": {
    		  "tokenid":$.cookie("tokenid"),
    		  "method":"stdcomponent.update",
    		  "dataobject":"user",
    		  "dataobjectid":this.locuserid,//用户的ID
    		  "obj":JSON.stringify({avatar:parseInt(avatar_id)})
	    	}
        }).done(this.proxy(function(response){
        	if(response.success){
        		this._initInfo();
        		this.ImgDialog.dialog("close");
        	}
        })).fail(this.proxy(function(jqXHR,errorText,errorThrown){
        	
        })).complete(this.proxy(function(jqXHR,errorStatus){
        	
        }));
	},
	
	on_ImgDialog_cancel:function(){
		this.ImgDialog.dialog("close");
	},
	
	
	on_addDialog_save : function(event){
		var tdialog=$(event.currentTarget).closest("div.ui-dialog");
		var tform=tdialog.find("form");
		var obj=this.transform_data_type(tform.serializeArray());
		$.extend(obj,{"auditor":this._clid});//url ID
		if(this.editData && this.editData.id){
			this._updateRecord(tdialog.find(".ui-dialog-content"),obj,this.editData.id);
		}else{
			this._addRecord(tdialog.find(".ui-dialog-content"),obj);
		}
		
	},
	on_addDialog_cancel : function(event){
		var ww=event.currentTarget.parentElement.parentElement.parentElement;
		$(ww).find(".ui-dialog-content").dialog("close");
	},

	on_addDialog_close : function(){
		this.addDialog.find("input").val("");
		this.addDialog.dialog("close");
		this.editData=null;
	},
	on_addtwoDialog_close: function(){
		this.addtwoDialog.find("input").val("");
		this.addtwoDialog.dialog("close");
		this.editData=null;
	},
	on_addthreeDialog_close: function(){
		this.addthreeDialog.find("input").val("");
		this.addthreeDialog.dialog("close");
		this.editData=null;
	},
	on_addfourDialog_close: function(){
		this.addfourDialog.find("input").val("");
		this.addfourDialog.find("textarea").val("");
		this.editData=null;
	},
	on_addfiveDialog_close: function(){
		this.addfiveDialog.find("input").val("");
		this.addfiveDialog.find("textarea").val("");
		this.editData=null;
	},
	
	on_addsixDialog_close: function(){
		this.addsixDialog.find("input").val("");
		this.addsixDialog.find("textarea").val("");
		this.editData=null;
	},
	
	on_addsevenDialog_close: function(){
		this.addsevenDialog.find("input").val("");
		this.addsevenDialog.find("textarea").val("");
		this.editData=null;
	},
	
	
	on_addDialog_open:function(){
		
	},
	
	
	/*
	<add>
	tokenid：
	method：stdcomponent.add
	dataobject:auditor;
	obj:{参数在Auditor类}
	人员添加类型字段为auditor的userType（String，用逗号分开）
	保存
	save
*/
	_on_btnsave:function(e){
		 e.preventDefault();
		 if(!this.infoform.valid()){
			 return false
		 }
		 
		 var  obj=this.transform_data_type(this.infoform.serializeArray());
		 obj.user= parseInt(obj.user);
		 obj.unit= parseInt(obj.unit);
		 var usertype=[];
		 obj.userTypea && usertype.push(obj.userTypea) && delete obj.userTypea;
		 obj.userTypeb && usertype.push(obj.userTypeb) && delete obj.userTypeb;
		 obj.userTypec && usertype.push(obj.userTypec) && delete obj.userTypec;
		 obj.userTyped && usertype.push(obj.userTyped) && delete obj.userTyped;
		 obj.userTypee && usertype.push(obj.userTypee) && delete obj.userTypee;
		 obj.userTypef && usertype.push(obj.userTypef) && delete obj.userTypef;
		 
		 var professionArray=[];
		 var $check = this.professionContainer.find("input:checkbox:checked");
	    	$.each($check,this.proxy(function(idx,checked){
	    		professionArray.push(parseInt($(checked).attr("data-iid")));
	    	}))
		  $.extend(true,obj,{"system":professionArray,"userType":usertype.join(",")});
        var clz = $.u.load("com.audit.innerAudit.comm_file.confirm");
        var confirm = new clz({
            "body": "确认操作？",
            "buttons": {
                "ok": {
                    "click": this.proxy(function(e){
                    	e.preventDefault();
                    	try{
                    		 if(this._parm_edit){ //编辑模式
                   			     this._editmodal(confirm,obj);
	                   		 }else{//创建模式
	                   			 this._creatmodal(confirm,obj);
	                   		 }
                      	}catch(e){
                    		throw new Error("出错:"+e.message);
                      	}
                    })
                }
            }
        });		
	  
	},
	
	
	
	
	
	 //编辑模式
	/*<edit>
	tokenid：
	method：stdcomponent.update
	dataobject:auditor;
	dataobjectid:数据ID
	obj:{参数在Auditor类}
	*/
	 _editmodal:function(confirm,obj){
			this._ajax(
				$.u.config.constant.smsmodifyserver, 
				true, 
				{
					"method" : "stdcomponent.update",
					"dataobject" :"auditor",
					"dataobjectid":this._clid,
					 "obj":JSON.stringify(obj)
				}, 
				this.$, 
				{},
				this.proxy(function(response) {
					confirm.confirmDialog.dialog("close");
					if(response.success){
						$.u.alert.success("操作成功!",2000);
					}
				})
			);
	 },
	 
	 
	//创建模式
	_creatmodal:function(confirm,obj){
		this._ajax(
			$.u.config.constant.smsmodifyserver, 
			true, 
			{
				"method" : "stdcomponent.add",
				"dataobject" :"auditor",
				 "obj":JSON.stringify(obj)
			}, 
			this.$, 
			{},
			this.proxy(function(response) {
				confirm.confirmDialog.dialog("close");
				if(response.success){
					$.u.alert.success("操作成功!",2000);
					this._clid=response.data;//response.data8394147
					this._parm_edit=true;
					setTimeout(function(){
						$.u.alert.success("人员信息创建成功，请完善个人简历及其他!");
						}, 3000);
					this._second();
					this.locuserid=this.userid;
				}
			})
		);
	
	},
	
	  _second:function(){
	      var destiny=window.location.href;
			window.location.href = destiny+"?clid="+this._clid;
	      	 $(".panel-button-container").removeClass("hidden");
	      	 $(".glyphicon-btn").eq(0).trigger("click");
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
	
  
	
    
   /* 风险管理员（RISK）、不安全事件调查员（SAFE），信息管理员（INFO）

    profession;// (专业)
    content 备注
    department 单位
    eventDate 日期
*/

    //添加个人简历等四个表格记录
    _addRecord : function(thisdialog ,obj){
    	this._ajax(
			$.u.config.constant.smsmodifyserver, 
			true, //async
			{
				"method" : "stdcomponent.add",
				"dataobject" : "auditorInfo",
                "obj": JSON.stringify(obj)//obj={type: "PERSONAL", eventDate: "2010到2018年", department: "份认购的风格", content: "拜拜拜拜"}
			}, 
			this.$, 
			{},
			this.proxy(function(response) {
				if(response.success){
					response.data;//8394203
					$(thisdialog).dialog("close");
					$.u.alert.success("添加成功!",2000);
					this._refresh();
				}
			})
		);
    },
    
    _refresh:function(){
    	if ($.fn.DataTable.isDataTable(this.qid("resumetable"))) {
            this.qid("resumetable").dataTable().api().destroy();
            this.qid("resumetable").empty();
        }
    	if ($.fn.DataTable.isDataTable(this.qid("resumetabletwo"))) {
            this.qid("resumetabletwo").dataTable().api().destroy();
            this.qid("resumetabletwo").empty();
        }
    	if ($.fn.DataTable.isDataTable(this.qid("resumetablethree"))) {
            this.qid("resumetablethree").dataTable().api().destroy();
            this.qid("resumetablethree").empty();
        }
    	if ($.fn.DataTable.isDataTable(this.qid("resumetablefour"))) {
            this.qid("resumetablefour").dataTable().api().destroy();
            this.qid("resumetablefour").empty();
        }
    	if ($.fn.DataTable.isDataTable(this.qid("resumetablefive"))) {
            this.qid("resumetablefive").dataTable().api().destroy();
            this.qid("resumetablefive").empty();
        }
    	if ($.fn.DataTable.isDataTable(this.qid("resumetablesix"))) {
            this.qid("resumetablesix").dataTable().api().destroy();
            this.qid("resumetablesix").empty();
        }
    	if ($.fn.DataTable.isDataTable(this.qid("resumetableseven"))) {
            this.qid("resumetableseven").dataTable().api().destroy();
            this.qid("resumetableseven").empty();
        }
    	this._initInfo();
    },
    
    
    _initInfo:function(){
    	if(this._clid ){
    		this._ajax(
        			$.u.config.constant.smsqueryserver, 
        			true, //async
        			{
        				"method" : "getAuditorInfoById",
                        "id": this._clid
        			}, 
        			this.$, 
        			{},
        			this.proxy(function(response) {
        				if(response.success){
        					this._fillData(response.data);
        				}
        			})
        		);
    	}
    },
    
    

    //填数据
    _fillData:function(data){
    	if(data.auditor){
    		var infodata=data.auditor;
    		infodata.user && this._user.select2("data", {id:infodata.user.id, fullusername:(infodata.userDisplayName||infodata.user.fullname)});
    		infodata.spell && this._spell.val(infodata.spell);//拼音
    		infodata.sex && this._sex.select2("data", {id:infodata.sex, text:infodata.sex});// 性别
    		infodata.unitDisplayName && infodata.unit && this._unit.select2("data", {id:infodata.unit||"", name:infodata.unitDisplayName||""});// 所属单位  unit
    		infodata.department && this._department.val(infodata.department);//所属部门
    		infodata.duties && this._duties.val(infodata.duties);//职务
    		infodata.quarters && this._quarters.val(infodata.quarters);//岗位
    		infodata.officeTel && this._officeTel.val(infodata.officeTel);//办公电话
    		infodata.faxNumber && this._faxNumber.val(infodata.faxNumber);//传真电话
    		infodata.cellTel && this._cellTel.val(infodata.cellTel);// 手机电话
    		infodata.email && this._email.val(infodata.email);//电子邮箱
    		infodata.political && this._political.val(infodata.political);//政治面貌
    		infodata.nationalist && this._nationalist.val(infodata.nationalist);//民族
    		infodata.education && this._education.val(infodata.education);//文化程度
    		infodata.recruitment && this._recruitment.val(infodata.recruitment);// 籍贯
    		infodata.cardNo && this._cardNo.val(infodata.cardNo);//身份证号码
    		infodata.address && this._address.val(infodata.address);//家庭住址
    		infodata.safeNo && this._safeNo.val(infodata.safeNo);//安全监察证编号
    		infodata.hiredDate && this._hiredDate.val(infodata.hiredDate);//首次受聘日期
    		infodata.auditorNo && this._auditorNo.val(infodata.auditorNo);//编号
    		
    		this.locuserid=infodata.user.id;
        	
        	if(infodata.avatarUrl){
        		this._userpic.attr("src",infodata.avatarUrl);
        	}else{
        		this._userpic.attr("src","/sms/uui/img/useravatar/useravatar-unknown.png");
        	}
        	if($.isArray(infodata.system)){
        		var vid;
        		$.each(infodata.system,this.proxy(function(idx,item){
        			vid=item.id;
        			$.each(this.professionContainer.find("input"),this.proxy(function(k,value){
            			var iid=$(value).attr("data-iid");
            			if($.inArray(parseInt(iid),[vid])>-1){
            				$(value).attr("checked","checked");
            			}
            			
            		}))
        		}))
        	}
        	if(infodata.userType){
        		var typedata=infodata.userType.split(",");
        		$.each(typedata,this.proxy(function(idx,item){
        			$.each($("input.userType",this.infoform),this.proxy(function(v,type){
        				if($.inArray(item,[$(type).val()]) >-1){
        					$(type).attr("checked",true);
            			}
        			}))
        		}))
        	}
        	
    	}
    		
      	  if(data.auditorInfo){
                this._createDatatable(data.auditorInfo);
            }
    	
    },
    _on_return_click:function(e){
    	e.preventDefault();
    	try{
    		window.location.href="../qualification/Qua.html";
    	}catch(e){
    		throw new Error("无法返回 _on_return_click()："+e.message);
    	}
    },
    _on_success_click:function(e){
    	if(this.newDialog == null){
    		var cls = $.u.load("com.sms.common.stdComponentOperate");
	    	this.newDialog = new cls($("div[umid='selectUserAvatar']", this.$), {
	    		dataobject: "user",
	    		fields:[
	    		   {name: "fullname",maxlength:255,label:this.i18n.fullName,type:"text",rule:{required:true},message:this.i18n.fullNameNorNull},
	 	    	   {name: "email",maxlength:255,label:this.i18n.post,type:"text",rule:{required:true,email:true},message:{required:this.i18n.postNotnull,email:this.i18n.IllegalFormat}},
	    		   {name: "pageDisplayNum",maxlength:3,rule:{digits:true},message:this.i18n.pageDisplayNumNotInt, label:this.i18n.pageDisplayNum, type:"text"},
	    		   {name: "emailFormat", label:this.i18n.emailFormat, type:"enum", enums:[{name:"HTML",value:"HTML"},{name:"TEXT",value:"TEXT"}]},
	    		   {name: "emailUser", label:this.i18n.emailUser, type:"enum", enums:this.emailUserEnums},
	    		   {name: "defaultAccess", label:this.i18n.defaultAccess, type:"enum", enums:this.defaultAccessEnums},
	    		   {name: "autoWatch", label:this.i18n.autoWatch, type:"enum", enums:this.autoWatchEnums}
	    		],
	    		afterEdit: this.proxy(function(comp,formdata){
	    			comp.formDialog.dialog("close");
	    		})
	    	});
    	}
    	this.newDialog.open({data:$.extend({},this.userinfo,{id:'65656'}),title:"修改"});
    },
    
    _on_primary_click:function(e){
    	this.primaryDialog.dialog("open");
    },
    
    on_primaryDialog_cancel:function(){
    	this.primaryDialog.find("input").val("");
		this.primaryDialog.dialog("close");
    },
    
    on_primaryDialog_close:function(){
    	this.primaryDialog.find("input").val("");
		this.primaryDialog.dialog("close");
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
		case 'TRAIN':
			this._addtwoPoints();
			break;
		case 'SITUATION':
			this._addthreePoints();
			break;
		case 'AUDIT':
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
        
        _updateRecord : function(thisdialog ,obj,recordid){
        	this._ajax(
    			$.u.config.constant.smsmodifyserver, 
    			true, //async
    			{
    				"method" : "stdcomponent.update",
    				"dataobject" : "auditorInfo",
    				"dataobjectid":JSON.stringify(recordid),
                    "obj": JSON.stringify(obj)//obj={type: "PERSONAL", eventDate: "2010到2018年", department: "份认购的风格", content: "拜拜拜拜"}
    			}, 
    			this.$, 
    			{},
    			this.proxy(function(response) {
    				if(response.success){
    					this.editData=null;
    					response.data;//8394203
    					$(thisdialog).dialog("close");
    					$.u.alert.success("修改成功!",2000);
    					this._refresh();
    				}
    			})
    		);
        },
        

        /*   删除记录*/
        on_delete_click:function(e){
        	e.preventDefault();
    		var $e = $(e.currentTarget);
    		var id = $e.attr("data");
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
                                    "dataobjectids" : JSON.stringify([parseInt(id)])
                                }, 
                                confirm.confirmDialog.parent(), 
                                {},
                                this.proxy(function(response) {
                                    if(response.success){
                                        confirm.confirmDialog.dialog("close");
                                    	$.u.alert.success("删除成功!",2000);
                                    	this._refresh();
                                    }
                                })
                            );
                        })
                    }
                }
            });	
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
		this.infoform.validate("destroy");
        this._super();
    }
}, { usehtm: true, usei18n: true });

com.audit.qualification.editUser.widgetjs = ["../../../uui/widget/select2/js/select2.min.js",
                                             "../../../uui/widget/jqurl/jqurl.js",
                                             '../../../uui/widget/validation/jquery.validate.js',
                                        "../../../uui/widget/spin/spin.js", 
                                        "../../../uui/widget/jqblockui/jquery.blockUI.js",
                                        "../../../uui/widget/ajax/layoutajax.js",
                                        "../../../uui/widget/uploadify/jquery.uploadify.js",
										"../../../uui/widget/jqdatatable/js/jquery.dataTables.js", 
										"../../../uui/widget/jqdatatable/js/dataTables.bootstrap.js",
                                        "../../../uui/widget/jqztree/js/jquery.ztree.all-3.5.js"
                                        
                                        ];
com.audit.qualification.editUser.widgetcss = [ {id:"",path: "../../../uui/widget/bootstrap/css/bootstrap.min.css" } ,     
     										 { id:"",path: "../../../uui/widget/jqdatatable/css/jquery.dataTables.css" }, 
     										 { id:"",path: "../../../uui/widget/jqdatatable/css/dataTables.bootstrap.css" },
                                              { id:"",path: "../../../uui/widget/jqztree/css/zTreeStyle/zTreeStyle.css"},
                                              {id:"", path: "../../../uui/widget/select2/css/select2.css" }, 
                                              {id:"",path:"../../../uui/widget/uploadify/uploadify.css"},
                                         {id:"", path: "../../../uui/widget/select2/css/select2-bootstrap.css" }];
