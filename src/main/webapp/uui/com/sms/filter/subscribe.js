//@ sourceURL=com.sms.filter.subscribe
$.u.load("com.sms.common.stdComponentOperate");
$.u.define('com.sms.filter.subscribe', null, {
    init: function (options) {
        this._options = options || {};
        this._options.data=null;
        this._options.mode="ADD";
    },
    afterrender: function (bodystr) {
    	this.i18n = com.sms.filter.subscribe.i18n;
    	// 表单
    	this.form = this.qid("form");
    	
    	this.usergroup = this.qid("usergroup").select2({
			width:300,
			minimumResultsForSearch:-1,
        	ajax:{
	        	url: $.u.config.constant.smsqueryserver,
	            dataType: "json",
	            type:"post",
	            data:function(){
	            	return {
	        				"tokenid":$.cookie("tokenid"),
	        				"method":"stdcomponent.getbysearch",
	        				"dataobject":"userGroup"
	            	};
	            },
		        results:this.proxy(function(response,page){
		        	if(response.success){
		        		response.data.aaData.unshift({"id":$.cookie("userid"),"name":this.i18n.subscriptions});
		        		return {results:response.data.aaData};
		        	}
		        })
	        },
	        formatResult:function(item){
	        		return item.name;
	        },
	        formatSelection:function(item){
	        		return item.name;
	        }
		}).select2("data",{"id":$.cookie("userid"),"name":this.i18n.subscriptions});
    	
    	this.period = this.qid("period").select2({
    		minimumResultsForSearch:-1,
    		data:[{id:1,text:'1'},{id:2,text:'2'},{id:3,text:'3'},{id:4,text:'4'},{id:5,text:'5'},{id:6,text:'6'},{id:7,text:'7'},{id:8,text:'8'},{id:9,text:'9'},{id:10,text:'10'},{id:11,text:'11'},{id:12,text:'12'},{id:13,text:'13'},{id:14,text:'14'},{id:15,text:'15'},
    		      {id:16,text:'16'},{id:17,text:'17'},{id:18,text:'18'},{id:19,text:'19'},{id:20,text:'20'},{id:21,text:'21'},{id:22,text:'22'},{id:23,text:'23'},{id:24,text:'24'},{id:25,text:'25'},{id:26,text:'26'},{id:27,text:'27'},{id:28,text:'28'},{id:29,text:'29'},{id:30,text:'30'},{id:31,text:'31'}
    		]
    	}).select2("val",1);
    	
    	this.time = this.qid("time").select2({
    		minimumResultsForSearch:-1,
    	    data:[{id:0,text:'1'},{id:1,text:'2'},{id:2,text:'3'},{id:3,text:'4'},{id:4,text:'5'},{id:5,text:'6'},{id:6,text:'7'},{id:7,text:'8'},{id:8,text:'9'},{id:9,text:'10'},{id:10,text:'11'},{id:11,text:'12'},{id:12,text:'13'},{id:13,text:'14'},{id:14,text:'15'},{id:15,text:'16'}
    	    ,{id:16,text:'17'},{id:17,text:'18'},{id:18,text:'19'},{id:19,text:'20'},{id:20,text:'21'},{id:21,text:'22'},{id:22,text:'23'},{id:23,text:'24'}
    	    ]
    	}).select2("val",6);
    	
    	this.subscribeFilter = this.qid("subscribeFilter").dialog({
            title:this._options.title,
            width:520,
            modal: true,
            draggable: false,
            resizable: false,
            autoOpen: false,
            create:this.proxy(function(){

            }),
            open:this.proxy(function(){
            	// 填充表单
            	if(this._options.data){
            		this.fillFormData(this._options.data);
            	}
            }),
            close:this.proxy(function(){
            	// 清空表单
            	this.clearFormData();
            })
        }); 
    	
    },
    /*
     * 打开模态层
     * @params 参数数据 {data:{},title:""} data:数据，title为编辑时的标题
     * dataobject:scbscribe
     */
    open:function(params){
    	var dialogOptions=null;
        if (params.data) {
            this._options.mode = "EDIT";
            this._options.data = params.data;
            dialogOptions = {
                title: params.title,
                buttons: [
                    {
                        text: this.i18n.update,
                        click: this.proxy(function (e) {
                            	this._sendModifyAjax({
                            		"tokenid":$.cookie("tokenid"),
                            		"method":"stdcomponent.update",
                            		"dataobject":params.dataobject,
                            		"dataobjectid":params.id,
  	                      		  	"obj":JSON.stringify(this.getFormData())
	                            },e);
                        })
                    },
                    {
                        text: this.i18n.cancel,
                        "class": "aui-button-link",
                        click: this.proxy(function () {
                            this.subscribeFilter.dialog("close");
                        })
                    }
                ]
            };
        }else{
            this._options.mode = "ADD"; 
            this._options.id = params.id;
        	dialogOptions = {
                title: params.title,
                buttons: [
                    {
                        text: this.i18n.subscription,
                        click: this.proxy(function (e) {
                            this._sendModifyAjax({
                            	  "tokenid":$.cookie("tokenid"),
	                      		  "method":"stdcomponent.add",
	                      		  "dataobject":params.dataobject,
	                      		  "obj":JSON.stringify(this.getFormData())
                            },e);
                        })
                    },
                    {
                        text: this.i18n.cancel,
                        "class": "aui-button-link",
                        click: this.proxy(function () {
                            this.subscribeFilter.dialog("close");
                        })
                    }
                ]
            };
        }
        this.subscribeFilter.dialog("option",dialogOptions).dialog("open");
    },
    /**
     * @param data
     * @param e
     */
    _sendModifyAjax:function(data,e){
    	this.disableForm();
    	$(e.currentTarget).add($(e.currentTarget).next()).button("disable");
    	
    	$.ajax({
        	url: $.u.config.constant.smsmodifyserver,
            type:"post",
            dataType: "json",
            cache: false,
            "data": data
        }).done(this.proxy(function(response){
        	if(response.success){
                this.subscribeFilter.dialog("close");
                this.refreshDataTable();
        	}
        })).fail(this.proxy(function(jqXHR,errorText,errorThrown){
        	
        })).complete(this.proxy(function(jqXHR,errorStatus){
        	this.enableForm();
        	$(e.currentTarget).add($(e.currentTarget).next()).button("enable");
        }));
    },
    /*
     * 获取表单数据（JSON格式）
     */
    getFormData:function(){
    	var v1 = "0";
    	var v2 = "0";
    	var v3 = this.time.select2("val");
    	var v4 = this.period.select2("val");
    	var v5 = "*";
    	var v6 = "?";
    	var v = v1 + " " + v2 + " " + v3 + " */" + v4 + " " + v5 + " " + v6;
    	var data = {};
    	if(this.qid("usergroup").select2("data").users){
    		data.receivegroup = parseInt(this.usergroup.select2("val"));
    		data.receive = "";
    	}else{
    		data.receive = parseInt(this.usergroup.select2("val"));
    		data.receivegroup = "";
    	}
    	data.cronexpression = v;
    	data.isEmail = "Y";
    	data.filtermanager = parseInt(this._options.id || this._options.data.filtermanagerId);
    	return data;
    },
    /*
     * 填充表单数据
     */
    fillFormData:function(data){
    	var group = (function(){
			if(data.receive){
				return com.sms.filter.subscribe.i18n.subscriptions;
			}else if(data.receivegroup){
				return data.receivegroup;
			}
		})();
    	this.usergroup.select2("data",{"id":data.receiveId,"name":
    		group
    	});
    	var v1 = data.cronexpression.split(" ");
    	var length = v1[3].length;
    	var period = v1[3].substr(length-1);
    	this.period.select2("val",period);
    	this.time.select2("val",v1[2]);
    },
    /*
     * 清空表单数据和校验错误信息
     */
    clearFormData:function(){
    	this.qid("usergroup").select2("data",{"id":$.cookie("userid"),"name":com.sms.filter.subscribe.i18n.subscriptions});
    	this.period.select2("val",1);
    	this.time.select2("val",7);
    },
    /*
     * 禁用表单元素
     */
    disableForm:function(){
    	$("input,select",this.form).attr("disabled",true);
    },
    /*
     * 启用表单元素
     */
    enableForm:function(){
    	$("input,select",this.form).attr("disabled",false);
    },
    destroy: function () {
        this._super();
    }
}, { usehtm: true, usei18n: true });


com.sms.filter.subscribe.widgetjs = ['../../../uui/widget/select2/js/select2.min.js',
                                               "../../../uui/widget/spin/spin.js",
                                               "../../../uui/widget/jqblockui/jquery.blockUI.js",
                                               "../../../uui/widget/ajax/layoutajax.js"];
com.sms.filter.subscribe.widgetcss = [{ path: '../../../uui/widget/jqdatatable/css/jquery.dataTables.css' }, { path: '../../../uui/widget/jqdatatable/css/dataTables.bootstrap.css' },{id:"",path:"../../../uui/widget/select2/css/select2.css"},{id:"",path:"../../../uui/widget/select2/css/select2-bootstrap.css"}];