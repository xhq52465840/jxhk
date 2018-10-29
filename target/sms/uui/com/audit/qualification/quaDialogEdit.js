//@ sourceURL=com.audit.qualification.quaDialogEdit
$.u.define('com.audit.qualification.quaDialogEdit', null, {
	
	//用户信息-基本信息
    init: function (options) {
        this._options = options || {};
        this._options.data = null;
    	this._options.dataobject = "unit";
    	this._avatarIsVisible = false;
    	this._personSelect2Length = 10;
    	this._select2PageLength = 10;
    },
    afterrender: function (bodystr) {
    	
    	this.temp = "<div class='col-md-3 col-lg-3 professionWidget' style='margin-top: 2px;'>"+
						"<div class='col-sm-12 col-md-12 col-lg-12'>" +
						"<input type='checkbox' data-iid='#{id}' style='margin-right: 2px;'>" +
						"<span class='professionName'>#{labelName}</span></div>"+
					"</div>";
    	//this.i18n = com.audit.qualification.quaDialogEdit.i18n;
    	this.form = this.qid("unit-form");
	    this.$validMsg = this.form.find(".validmsg");
		this.professionContainer = this.qid("professionContainer");
		
		$("input[name=user]").attr("readonly",true);
		
	    try{
	    	
    	this.formDialog = this.qid("item-dialog-edit").dialog({
            title: this._options.title,
            width: 880,
            modal: true,
            draggable: false,
            resizable: false,
            autoOpen: false,
            create: this.proxy(function(){
            		this.buildForm();
            	    this.loadProfessions();
            }),
            open: this.proxy(function(){
	            	this.fillFormData(this._options.data);
            }),
            close: this.proxy(function(){
            		this.clearFormData();
            })
        }) ; 
    	
    	this.formDialog.css({"padding":"0","font-weight":"200"}).find("td.name").css({"background-color":""}); 

    	
	    }catch(e){
	    	throw new Error("this.formDialog"+e.message);
	    }
	    
		this._user=$("[name=user]");
		this._sex=$("[name=sex]");// 性别
		this._unit=$("[name=unit]");// 所属单位
		this._department=$("[name=department]");// 所属部门
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
		/*this._userpic=$("[name=userpic]");// 头像*/ 
		
		
		this._user.select2({
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
 					        			return user;	
 					        	}),
 					        	more: data.data.iTotalRecords > (page * this._select2PageLength),	
 		        		};
 		        	}
 		        })
 	        },
 	       formatResult: function(item){
	        	return item.fullname;	 
	        },
	        formatSelection: this.proxy(function(item){
	        	return item.fullname;	        	
	        })
         })
         
		this._sex.select2({
    		//multiple: true,
			data: [{id:'男',text:'男'},{id:'女',text:'女'}]
		});
		
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
		 })
	 
		 this._hiredDate.datepicker({ dateFormat: "yy-mm-dd" });
		
    },
    
    loadProfessions : function(){
    	this._ajax(
			$.u.config.constant.smsqueryserver, 
			false, 
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
    
    
    /*
     * 打开模态层
     * @params 参数数据 {data:{},title:"",edit:function(comp,formdata){},afterEdit:function(comp,formdata){}} data:数据，title为编辑时的标题 ，edit为自定义处理事件
     */
    open:function(params){
    	this._options.data=params.data;
    	var dialogOptions=null;
            dialogOptions = {
                title: params.title,
                buttons: [
                    {
                        text: "保存",
                        click: this.proxy(function (e) {
	                        	var obj=this.formdata(this.form.serializeArray());
	                         	if(this.form.valid()){
	                         		this._sendModifyAjax({
	                            		"tokenid": $.cookie("tokenid"),
	                            		"method": "stdcomponent.update",
	                            		"dataobject":"auditor",
	                            		"dataobjectid":params.data.id,
	                            		"obj":JSON.stringify(obj)  
		                            },e);
	                         	}
                        		}
                        )
                    },
                    {
                        text: '取消',
                        "class": "aui-button-link",
                        click: this.proxy(function () {
                            this.formDialog.dialog("close");
                        })
                    }
                ]
        	}
    	try{
    		this.formDialog.dialog("option",dialogOptions).dialog("open");
    	}catch(e){
    		throw new Error("dialog(open) 报错"+e.message);
    	}
    },
    
    
    
    _initimg:function(){
    	//this.qid("user-pic").attr("src","/sms/uui/img/useravatar/useravatar-unknown.png");
    	//this.qid("user-pic").off("click").on("click",this.proxy(this.on_editUserAvatar_click));
    },
    
    //上传头像
    on_editUserAvatar_click: function(e){
    	
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
  
    	this.selectUserAvatar.open({rule:JSON.stringify([[{key:"system",value:true},{key:"owner",value:this.userinfo.username}],[{key:"type",value:"user"}]])},this.userinfo.avatar);
    },
    
    
    /*
     * 请求更新数据(新增、修改)
     */
    _sendModifyAjax:function(data,e,func){
    	this.disableForm();
    	$.u.ajax({
        	url: $.u.config.constant.smsmodifyserver,
            type:"post",
            dataType: "json",
            cache: false,
            "data": data
        },this.qid("unit-dialog-edit").parent(), {size:2, backgroundColor:"#fff"}).done(this.proxy(function(response){
        	if(response.success){
                this.formDialog.dialog("close");
                this.refreshDataTable();
                $.u.alert.success("操作成功");
        	}
        })).fail(this.proxy(function(jqXHR,errorText,errorThrown){
        	
        })).complete(this.proxy(function(jqXHR,errorStatus){
        	this.enableForm();
        }));
    },
    

    /*
     * 提交(编辑 添加)数据
    */
    formdata:function(form){
  
    	
    	 obj=this.transform_data_type(form);
		 obj.user= obj.user && parseInt(obj.user);
		 obj.unit= obj.unit && parseInt(obj.unit);
		 usertype=[];
		 obj.userTypea && usertype.push(obj.userTypea) && delete obj.userTypea;
		 obj.userTypeb && usertype.push(obj.userTypeb) && delete obj.userTypeb;
		 obj.userTypec && usertype.push(obj.userTypec) && delete obj.userTypec;
		 obj.userTyped && usertype.push(obj.userTyped) && delete obj.userTyped;
		 usertypestr= usertype.join(",")
		 
		 professionArray=[];
		 var $check = this.professionContainer.find("input:checkbox:checked");
	    	$.each($check,this.proxy(function(idx,checked){
	    		professionArray.push(parseInt($(checked).attr("data-iid")));
	    	}))
		  $.extend(true,obj,{"system":professionArray,"userType":usertypestr});
    	return obj;
    },	
    
    
	
	  transform_data_type:function(data){
	    	//uuu=[{id:"1",name:"s"},{id:"2",name:"f"},{id:"3",name:"v"}]
	    	uuu=data;
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
     * 根据设置创建表单
     */
    buildForm:function(){

    },
    /*
     * 获取表单数据（JSON格式）
     */
    getFormData:function(){
    	var data={};
    	$.each(this.form.serializeArray(), function(idx, field){
    		data[field.name] = field.value;
    	});
    	data["category"] = this.qid("category").select2("data").id;
    	data["responsibleUser"] = this.qid("unit-person").select2("data").id;
    	data["avatar"] = this.qid("unit-image").attr("value") && parseInt(this.qid("unit-image").attr("value"));
    	return data;
    },
    /*
     * 填充表单数据
     */
    fillFormData:function(data){
    	try{
    		data.user && this._user.select2("data", {id:data.user.id, fullname:data.user.fullname});
    		data.sex && this._sex.select2("data", {id:data.sex, text:data.sex});
    		data.unitDisplayName && data.unit && this._unit.select2("data", {id:data.unit, name:data.unitDisplayName});// 所属单位  unit
    		data.department && this._department.val(data.department);//所属部门
    		data.duties && this._duties.val(data.duties);//职务
    		data.quarters && this._quarters.val(data.quarters);//岗位
    		data.officeTel && this._officeTel.val(data.officeTel);//办公电话
    		data.faxNumber && this._faxNumber.val(data.faxNumber);//传真电话
    		data.cellTel && this._cellTel.val(data.cellTel);// 手机电话
    		data.email && this._email.val(data.email);//电子邮箱
    		data.political && this._political.val(data.political);//政治面貌
    		data.nationalist && this._nationalist.val(data.nationalist);//民族
    		data.education && this._education.val(data.education);//文化程度
    		data.recruitment && this._recruitment.val(data.recruitment);// 籍贯
    		data.cardNo && this._cardNo.val(data.cardNo);//身份证号码
    		data.address && this._address.val(data.address);//家庭住址
    		data.safeNo && this._safeNo.val(data.safeNo);//安全监察证编号
    		data.hiredDate && this._hiredDate.val(data.hiredDate);//首次受聘日期
    		data.auditorNo && this._auditorNo.val(data.auditorNo);//编号
    		
    		if($.isArray(data.system) && data.system.length > 0){
        		var vid;
        		$.each(data.system,this.proxy(function(idx,item){
        			vid=item.id;
        			$.each(this.professionContainer.find("input"),this.proxy(function(k,value){
            			iid=$(value).attr("data-iid");
            			if($.inArray(parseInt(iid),[vid])>-1){
            				$(value).attr("checked","checked");
            			}
            			
            		}))
        		}))
        	}
    		
    	 	if(data.userType){
        		typedata=data.userType.split(",");
        		$userTypea=$("input[name=userTypea]",this.form);
        		$userTypeb=$("input[name=userTypeb]",this.form);
        		$userTypec=$("input[name=userTypec]",this.form);
        		$userTyped=$("input[name=userTyped]",this.form);
        		$.each(typedata,this.proxy(function(idx,item){
        			if($.inArray(item,[$userTypea.val()]) >-1){
        				$userTypea.attr("checked",true);
        			}
        			if($.inArray(item,[$userTypeb.val()]) >-1){
        				$userTypeb.attr("checked",true);
        			}
        			if($.inArray(item,[$userTypec.val()]) >-1){
        				$userTypec.attr("checked",true);
        			}
        			if($.inArray(item,[$userTyped.val()]) >-1){
        				$userTyped.attr("checked",true);
        			}
        		}))
        	}
        	
			
    	}catch(e){
    		throw new Error("fillFormData"+e.message);
    	} 
    },
   
    _valid:function(){
    	 
    },
   
    
    /*
     * 清空表单数据和校验错误信息
     */
    clearFormData:function(){
    	/*$(":text,textarea",this.form).val("").text("");
    	$("input.select2",this.formDialog).select2("data","");
    	$(".startdate").val("");
       	$(".enddate").val("");
        var cdate =$(".startdate",this.form).parent().parent();
        cdate.is(":hidden")?"":cdate.addClass("hidden");
        var cver =$(".version",this.form).parent().parent();
        cver.is(":hidden")?cver.removeClass("hidden"):cver.addClass("hidden");
        cver.hasClass("hidden");
        $("[name=optionsRadios]",this.form).removeAttr("disabled");
        backID= carryid= parryid=[];
    	this.form.validate().resetForm();*/
    },
    
    
    display_date:function(){
		dateRenderClazz = $.u.load("com.audit.checklist.DateProp");
		dateRenderObj = new dateRenderClazz();
		dateRenderObj.override({
			"afterDestroy": this.proxy(function(){ 
			}),});
	    result = dateRenderObj.get("filter", "html");
		sel = $(result).appendTo($(".form-groups .form-group:last",this.form));
		dateRenderObj.get("filter","render","",sel); 

    },
    
  
   
    /*
     * 用于override
     */
    refreshDataTable:function(){},
    _refresh:function(){
    	
    },
    
    
    filter_valid: function(obj){
    	var startDate = $.trim(obj.startDate), 
    		endDate = $.trim(obj.endDate), 
    		result = true, 
    		msg = [];
    	if(startDate && (new Date(startDate)) == "Invalid Date"){
    		result = false;
    		msg.push("开始日期有误！");
    	}else{
    		startDate = new Date(startDate);
    	}
    	
    	if(endDate && (new Date(endDate)) == "Invalid Date"){
    		result = false;
    		msg.push("结束日期有误");
    	}else{
    		endDate = new Date(endDate);
    	}
    	
    	if(startDate && endDate && (startDate - endDate > 0)){
    		result = false;
    		msg.push("开始日期晚于结束日期");
    	}
    	if(result){
    		this.$validMsg.addClass("hidden").text("");
    	}else{
    		this.$validMsg.removeClass("hidden").text(msg.join(" ")).css("display","block");
    	}
    	return result;
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
    /*
     * 禁用表单元素
     */
    disableForm:function(){
    	$(":text,textarea",this.form).attr("disabled",true);
    	this.formDialog.parent().find(".ui-dialog-buttonpane button").button("disable");
    },
    /*
     * 启用表单元素
     */
    enableForm:function(){
    	$(":text,textarea",this.form).attr("disabled",false);
    	this.formDialog.parent().find(".ui-dialog-buttonpane button").button("enable");
    },
    /*
     * 用于override
     */
   /* refreshDataTable:function(){},*/
    destroy: function () {
        this.formDialog.dialog("destroy").remove();
        this._super();
    }
}, { usehtm: true, usei18n: false });


com.audit.qualification.quaDialogEdit.widgetjs = ['../../../uui/widget/select2/js/select2.min.js',
                                               "../../../uui/widget/spin/spin.js", 
                                               "../../../uui/widget/jqblockui/jquery.blockUI.js", 
                                               "../../../uui/widget/validation/jquery.validate.js", 
                                               "../../../uui/widget/ajax/layoutajax.js"];
com.audit.qualification.quaDialogEdit.widgetcss = [{id:"",path:"../../../uui/widget/select2/css/select2.css"},
                                                {id:"",path:"../../../uui/widget/select2/css/select2-bootstrap.css"}];

