//@ sourceURL=com.sms.customfields.configureCustomField
$.u.define('com.sms.customfields.configureCustomField', null, {
    init: function (options) {
        this._options = options;
    },
    afterrender: function (bodystr) {
    	this.i18n = com.sms.customfields.configureCustomField.i18n;
    	/*
    	 * 1.根据id获取当前自定义字段的具体信息
    	 * 2.显示配置自定义字段：xxx
    	 * 3.添加新的环境，打开一个dialog
    	 * 4.查看自定义字段，固定的连接
    	 * 5.根据取得的数据，循环生成table
    	 * 6.bug两个设想1、编辑设置之后重新加载2、添加新的环境时传入unitdata
    	 */
    	//id
    	this.configCustomFieldId = $.urlParam().id;
    	
		if(!this.configCustomFieldId){
			window.location.href="ViewCustomFields.html";
		}   
		
    	//用于显示title
    	this.configname = this.qid("configname");
    	
    	this.confignametext = "";
    	
    	//已有的安监机构
    	this.unitData = [];
    	
    	//根据id获取基本数据
    	this.getBaseDataById(this.configCustomFieldId);

    	//配置方案
    	this.configScheme = this.qid("configScheme");

    	//获取数据
    	this.getDataById(this.configCustomFieldId);
    	
    	//按钮---添加新的环境
    	this.btn_addNewConfiguration = this.qid("btn_addNewConfiguration");

    	// 绑定“添加新的环境”按钮事件
    	this.btn_addNewConfiguration.click(this.proxy(function(){
    		if(!this.unitData){
    			return false;
    		}
    		if(!this.configFieldManage){
        		this.configFieldManage = this.getConfigFieldManageModule();
        	}
    		this.configFieldManage.open({"unitdata":this.unitData,"fieldname":this.confignametext});
    	}));
    	
    	
    	
    	// 编辑字默认值--按钮
    	this.configScheme.off("click", "button.editDefault").on("click", "button.editDefault", this.proxy(function (e) {
        	e.preventDefault();
        	try{
        		var data = JSON.parse($(e.currentTarget).attr("data"));
        		if(!this.defaultDialog){
            		$.u.load("com.sms.common.stdComponentOperate");
            		this.defaultDialog = new com.sms.common.stdComponentOperate($("div[umid='defaultDialog']",this.$),{
                		"title":this.i18n.addDefaultValue,
                		"dataobject":"customFieldConfigScheme",
                		"fields":[
            	          {name:"defaultValue",label:this.i18n.defaultValue,type:"text",maxlength:255}
            	        ]
                	});
            		this.defaultDialog.override({
                		refreshDataTable:this.proxy(function(){
                			this.getDataById(this.configCustomFieldId);
                		})
                	});
            	}
        		this.defaultDialog.open({"data":data,"title":this.i18n.editDefaultValueTitle + data.name});
        	}catch(e){
        		throw new Error(this.i18n.editFail+e.message);
        	}
    	}));
    	
    	
    	//编辑配置--按钮
    	this.configScheme.off("click", "button.editConfig").on("click", "button.editConfig", this.proxy(function (e) {
        	e.preventDefault();
        	try{
        		var data = JSON.parse($(e.currentTarget).attr("data"));
        		if(!this.configFieldManage){
            		this.configFieldManage = this.getConfigFieldManageModule();
            	}
        		this.configFieldManage.open({"data":data,"title":this.i18n.editConfig+data.name,"unitdata":this.unitData,"fieldname":this.confignametext});
        	}catch(e){
        		throw new Error(this.i18n.editFail+e.message);
        	}
    	}));
    	

    	
    	// 编辑配置--右上角按钮
    	this.configScheme.off("click", "button.edit").on("click", "button.edit", this.proxy(function (e) {
        	e.preventDefault();
        	try{
        		var data = JSON.parse($(e.currentTarget).attr("data"));
        		if(!this.configFieldManage){
            		this.configFieldManage = this.getConfigFieldManageModule();
            	}
        		this.configFieldManage.open({"data":data,"title":this.i18n.editConfig+data.name,"unitdata":this.unitData,"fieldname":this.confignametext});
        	}catch(e){
        		throw new Error(this.i18n.editFail+e.message);
        	}
    	}));
    	
    	//删除--右上角按钮
    	this.configScheme.off("click", "button.del").on("click", "button.del", this.proxy(function (e) {
        	e.preventDefault();
        		
        	try{
        		var data = JSON.parse($(e.currentTarget).attr("data"));
        		$.u.load("com.sms.common.stdcomponentdelete");
        		(new com.sms.common.stdcomponentdelete({
        			body:"<div>"+
        				 	""+this.i18n.affirm+"<strong>"+data.name+"</strong>"+this.i18n.relate+"？"+
        				 "</div>",
        			title:this.i18n.removeConfig,
        			dataobject:"customFieldConfigScheme",
        			dataobjectids:JSON.stringify([parseInt(data.id)])
        		})).override({
        			refreshDataTable:this.proxy(function(){
            			this.getDataById(this.configCustomFieldId);
        			})
        		});
        	}catch(e){
        		throw new Error(this.i18n.removeFail+e.message);
        	}
    	}));
    	
    },
    getBaseDataById:function(id){
    	$.ajax({
            url: $.u.config.constant.smsqueryserver,
            dataType: "json",
            cache: false,
            data: {
            	"tokenid":$.cookie("tokenid"),
        		"method":"stdcomponent.getbyid",
        		"dataobject":"customField",
        		"dataobjectid":id
            }
        }).done(this.proxy(function (data) {
        	if (data.success) {
        		data.data["name"]&&this.configname.text(data.data["name"]);
        		this.confignametext = data.data["name"];
            }
        })).fail(this.proxy(function (jqXHR, errorText, errorThrown) {

        })).complete(this.proxy(function(){
        }));
    },
    getDataById:function(configId){
		this.configScheme.empty();
		this.unitData = [];
    	$.ajax({
            url: $.u.config.constant.smsqueryserver,
            dataType: "json",
            cache: false,
            data: {
            	"tokenid":$.cookie("tokenid"),
        		"method":"stdcomponent.getbysearch",
        		"dataobject":"customFieldConfigScheme",
        		"rule":JSON.stringify([[{"key":"field","value":parseInt(configId)}]])
            }
        }).done(this.proxy(function (data) {
        	if (data.success) {
        		$.each(data.data.aaData,this.proxy(function(k,v){
        			var $table = $('<table width="100%" style="font-size:13px;"></table>').appendTo(this.configScheme);
        			$('<tr><td colspan="2"><h3 style="border-bottom:1px solid #ddd;">'+v.name+'</h3>'
        				+'<div style="font-size:13px;">'+v.description+'</div>'
        				+'<div style="float:right;margin-top:-60px;"><div class="btn-group">'
        			    +'<button class="btn btn-default btn-sm edit" data=\''+JSON.stringify(v)+'\'><span class="glyphicon glyphicon-wrench"></span></button>'
        			    +'<button class="btn btn-default btn-sm del" data=\''+JSON.stringify(v)+'\'><span class="glyphicon glyphicon-trash"></span></button>'
        			    +'</div></div></td></tr>').appendTo($table);
        			$('<tr><td align="right" width="40%">'+this.i18n.applyCase+'</td><td>'
        			    +'<button class="btn btn-link editConfig" data=\''+JSON.stringify(v)+'\'>'+this.i18n.editConfig+'</button></td></tr>').appendTo($table);
        			//安全信息类型
        			var img ="<br/>";
        			v.activityTypes && $.each(v.activityTypes,function(k1,v1){
        				img+='<img src="/sms/uui/'+v1.url+'" width="16px" height="16px" />'
        			})
        			if(img=="<br/>"){
        				img='<br/>'+this.i18n.explainF+'';
        			}
        			$('<tr><td></td><td>'+this.i18n.safeType+''+img+'</td></tr>').appendTo($table);
        			//安监机构
        			var pro = "";
        			if(v.units==null){
        				this.unitData.push(-1);
        				pro += '<br/>'+this.i18n.explainS+'';
        			}
        			v.units && $.each(v.units,this.proxy(function(k2,v2){
        				this.unitData.push(v2.id);
        				pro +='<br/><a href="../unitconfig/Summary.html?id='+v2.id+'">'+v2.name+'</a>';
        			}))
        			$('<tr><td></td><td>'+this.i18n.safeOrganization+''+pro+'</td></tr>').appendTo($table);
        			$('<tr><td align="right">'+this.i18n.defaultValue+':</td><td>'
        			    +'<button class="btn btn-link editDefault" data=\''+JSON.stringify(v)+'\'>'+this.i18n.editDefaultValue+'</button><span>'+v.defaultValue || null+'</span></td></tr>').appendTo($table);
        		}))
            }
        })).fail(this.proxy(function (jqXHR, errorText, errorThrown) {

        })).complete(this.proxy(function(){
        }));
    },
    getConfigFieldManageModule: function(){
    	$.u.load("com.sms.customfields.configFieldManage");
    	var module = new com.sms.customfields.configFieldManage($("div[umid='configFieldManage']",this.$),{
    		"field":this.configCustomFieldId,
    		"title":this.i18n.addConfig,
    		"dataobject":"customFieldConfigScheme",
    		"fields":[{
    			  fields:[
    			  {name:"",label:this.i18n.editConfigTitle,type:"title",description:this.i18n.editConfigDesc},
    			  {name:"",label:this.i18n.definableFields,type:"label",description:""},
    			  {name:"name",label:this.i18n.configCase,type:"text",description:this.i18n.configCaseDesc,message:this.i18n.configCaseMsg},
    			  {name:"description",label:this.i18n.describute,type:"textarea",description:this.i18n.descributeDesc}
    			  ]	
    		  },{
    			  fields:[
    			  {name:"",label:this.i18n.selectSuitableType,type:"title",description:this.i18n.selectSuitableTypeDesc},
    			  {name:"activityTypes",label:this.i18n.safeType,dataType:"int",type:"select",description:this.i18n.safeTypeDesc,rule:{required:true},message:this.i18n.safeTypeMsg,ajax:{"data":{"dataobject":"activityType"}}},
    			  ]	
    		  },{
    			  fields:[
    			  {name:"",label:this.i18n.selectApp,type:"title",description:this.i18n.selectAppDesc},
    			  {name:"",label:"",type:"radio",description:""},
    			  {name:"units",label:this.i18n.safeOrganization,dataType:"int",type:"select",description:this.i18n.safeOrganizationDesc,rule:{required:true},message:this.i18n.safeOrganizationMsg,ajax:{"data":{"dataobject":"unit"}}}
    			  ]	
    		  }]
    	});
    	module.override({
    		refreshDataTable:this.proxy(function(){
    			this.getDataById(this.configCustomFieldId);
    		})
    	});
    	return module;
    },
    destroy: function () {
        this._super();
    }
}, { usehtm: true, usei18n: true });


com.sms.customfields.configureCustomField.widgetjs = ['../../../uui/widget/jqurl/jqurl.js','../../../uui/widget/jqdatatable/js/jquery.dataTables.js', '../../../uui/widget/jqdatatable/js/dataTables.bootstrap.js'];
com.sms.customfields.configureCustomField.widgetcss = [{ path: '../../../uui/widget/jqdatatable/css/jquery.dataTables.css' }, { path: '../../../uui/widget/jqdatatable/css/dataTables.bootstrap.css' }];