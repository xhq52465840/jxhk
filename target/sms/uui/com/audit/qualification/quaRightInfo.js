//@ sourceURL=com.audit.qualification.quaRightInfo
$.u.define('com.audit.qualification.quaRightInfo', null, {
	
	//用户信息-基本信息
    init: function (options) {
        this._options = options || {};
        this._options.data = null;
   
    },
    afterrender: function (bodystr) {
    	
    	this.temp = "<div class='col-md-3 col-lg-3 professionWidget' style='margin-top: 2px;'>"+
						"<div class='col-sm-12 col-md-12 col-lg-12'>" +
						"<input type='checkbox' data-iid='#{id}' style='margin-right: 2px;'>" +
						"<span class='professionName'>#{labelName}</span></div>"+
					"</div>";
    	this.form = this.qid("right-form");
	    this.$validMsg = this.form.find(".validmsg");
	    this.userTypeContainer     = this.qid("userTypeContainer");
		this.professionContainer2  = this.qid("professionContainer2");
		this.professionContainer3  = this.qid("professionContainer3");
	    try{
	    	this.formDialog = this.qid("right-info-edit").dialog({
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
	        }) 
	    	
	    	this.formDialog.css({"padding":"0","font-weight":"200"}).find("td.name").css({"background-color":""}); 
	    }catch(e){
	    	throw new Error("this.formDialog"+e.message);
	    }
	    
		this._safeNo=$("[name=safeNo]"); // 安全监察证编号
		this._hiredDate=$("[name=hiredDate]");// 首次受聘日期
		this._auditorNo=$("[name=auditorNo]");// 编号
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
    		$(temp).appendTo(this.professionContainer2.add(this.professionContainer3));
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
    
    _sendModifyAjax:function(data,e,func){
    	this.disableForm();
    	$.u.ajax({
        	url: $.u.config.constant.smsmodifyserver,
            type:"post",
            dataType: "json",
            cache: false,
            "data": data
        },this.qid("right-info-edit").parent(), {size:2, backgroundColor:"#fff"}).done(this.proxy(function(response){
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
    	 var obj=this.transform_data_type(form);
    	 var userTypeArray=[];
    	 $.each($("input.userType:checked",this.form)||[],this.proxy(function(idx,checked){
    		userTypeArray.push($(checked).val());
    	 }))
    	 var professionArray2=[];
 		 $.each(this.professionContainer2.find("input:checkbox:checked")||[],this.proxy(function(idx,checked){
    		professionArray2.push(parseInt($(checked).attr("data-iid")));
    	 }))
		 var professionArray3=[];
    	 $.each(this.professionContainer3.find("input:checkbox:checked")||[],this.proxy(function(idx,checked){
    		professionArray3.push(parseInt($(checked).attr("data-iid")));
    	 }))
    	return   $.extend(obj,
						  {
						  "system2":professionArray2,
						  "system3":professionArray3,
						  "userType":userTypeArray.join(",")
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
    		 this._safeNo.val(data.safeNo||"");//安全监察证编号
    		 this._hiredDate.val(data.hiredDate||"");//首次受聘日期
    		 this._auditorNo.val(data.auditorNo||"");//编号
    		
    		if($.isArray(data.system2) && data.system2.length ){
        		var vid;
        		$.each(data.system2,this.proxy(function(idx,item){
        			vid=item.id;
        			$.each(this.professionContainer2.find("input"),this.proxy(function(k,value){
            			var iid=$(value).attr("data-iid");
            			if($.inArray(parseInt(iid),[vid])>-1){
            				$(value).attr("checked","checked");
            			}
            		}))
        		}))
        	}
    		if($.isArray(data.system3) && data.system3.length ){
        		var vid;
        		$.each(data.system3,this.proxy(function(idx,item){
        			vid=item.id;
        			$.each(this.professionContainer3.find("input"),this.proxy(function(k,value){
            			var iid=$(value).attr("data-iid");
            			if($.inArray(parseInt(iid),[vid])>-1){
            				$(value).attr("checked","checked");
            			}
            		}))
        		}))
        	}
    	 	if(data.userType){
        		var typedata=data.userType.split(",");
        		$.each(typedata,this.proxy(function(idx,item){
        			$.each($("input.userType",this.form),this.proxy(function(v,type){
        				if($.inArray(item,[$(type).val()]) >-1){
        					$(type).attr("checked",true);
            			}
        			}))
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
    },
    
    
    display_date:function(){
		var dateRenderClazz = $.u.load("com.audit.checklist.DateProp");
		var dateRenderObj = new dateRenderClazz();
		dateRenderObj.override({
			"afterDestroy": this.proxy(function(){ 
			}),});
	    var result = dateRenderObj.get("filter", "html");
		var sel = $(result).appendTo($(".form-groups .form-group:last",this.form));
		dateRenderObj.get("filter","render","",sel); 

    },
   
    /*
     * 用于override
     */
    refreshDataTable:function(){},
    
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
    destroy: function () {
        this.formDialog.dialog("destroy").remove();
        this._super();
    }
}, { usehtm: true, usei18n: false });


com.audit.qualification.quaRightInfo.widgetjs = ['../../../uui/widget/select2/js/select2.min.js',
                                               "../../../uui/widget/spin/spin.js", 
                                               "../../../uui/widget/jqblockui/jquery.blockUI.js", 
                                               "../../../uui/widget/validation/jquery.validate.js", 
                                               "../../../uui/widget/ajax/layoutajax.js"];
com.audit.qualification.quaRightInfo.widgetcss = [{id:"",path:"../../../uui/widget/select2/css/select2.css"},
                                                {id:"",path:"../../../uui/widget/select2/css/select2-bootstrap.css"}];

