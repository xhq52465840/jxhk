//@ sourceURL=com.sms.unitconfig.activityTypesSchemes
$.u.define('com.sms.unitconfig.activityTypesSchemes', null, {
    init: function (options) {
		/*{
			title:"",		// 标题
			dataobject:"",	// 数据对象
		}*/
        this._options = options || {};
        this._options.data=null;
    },
    afterrender: function (bodystr) {
    	this.i18n=com.sms.unitconfig.activityTypesSchemes.i18n;
    	// 表单
    	this.form=this.qid("form");
    	this.unitName=this.qid("unit-name");
    	this.unitActivity = this.qid("unit-activity");
    	this.formDialog = this.qid("dialog").dialog({
            title:this._options.title,
            width:550,
            modal: true,
            draggable: false,
            resizable: false,
            autoOpen: false,
            create:this.proxy(function(){

            }),
            open:this.proxy(function(){
            	this.buildForm();

            }),
            close:this.proxy(function(){
            	// 清空表单
            	this.clearFormData();
            })
        }); 
    	
    	this.activityTypeSchemeSecond = this.qid("activity-type-scheme-second");
    	this.activityTypeSecond = this.qid("activity-type-second");

    	this.qid("activitytypescheme-first").off("click", "option").on("click", "option", this.proxy(function (e) {
        	e.preventDefault();
        	try{
        		var value = $(e.currentTarget).attr("value");
        		$('div[cid=scheme'+value+']',this.qid("div-col-first")).removeClass("hidden").siblings().addClass("hidden");
        	}catch(e){
        		throw new Error(this.i18n.editFail+e.message);
        	}
    	}));
    	
    	this.qid("radio").off("click", "input:radio").on("click", "input:radio", this.proxy(function (e) {
        	try{
        		var value = $(e.currentTarget).attr("value");
	        	this.qid(value).removeClass("hidden").siblings().addClass("hidden");
        	}catch(e){
        		throw new Error(this.i18n.clickFail+e.message);
        	}
    	}));
    	
    	this.qid("unit").off("select2-selecting").on("select2-selecting",this.proxy(function(e){
    		this.activityTypeSchemeSecond.empty();
    		this.activityTypeSchemeSecond.text(e.object.scheme.name);
    		this.activityTypeSecond.empty();
        	var $div = $('<div></div>').appendTo(this.activityTypeSecond);
        	var $ul = $('<ul style="padding-left:15px;"></ul>').appendTo($div);
        	e.object.scheme.types && $.each(e.object.scheme.types,this.proxy(function(k1,v1){
        		$('<li><img  src="/sms/uui'+v1.url+'" width="16px" height="16px" />'+v1.name+'</li>').appendTo($ul);
        	}))
        	$div = null;
        	$ul = null;
    	}))
    },
    /*
     * 打开模态层
     * 
     */
    open: function (params) {
    	var dialogOptions=null;
	    this.mode = "ADD";
	    this._options = params;
		dialogOptions = {
	        title: this.i18n.choose+params.unitName+this.i18n.MsgType,
	        buttons: [
	            {
	                text: this.i18n.affirm,
	                click: this.proxy(function (e) {
	                    if (this.valid()) {
	                        this._sendModifyAjax({
	                        },e);
	                    }
	                })
	            },
	            {
	                text: this.i18n.cancel,
	                "class": "aui-button-link",
	                click: this.proxy(function () {
	                    this.formDialog.dialog("close");
	                })
	            }
	        ]
	    };
        this.formDialog.dialog("option",dialogOptions).dialog("open");
    },
    valid:function(){
    	var value = $('input[name=activitytypescheme]:checked',this.qid("radio")).attr("value");
    	$('small[name=small]').remove();
    	var data = null;
    	switch(value){
    		case "first":
    			var first = this.qid("activitytypescheme-first").val();
    			if(first){
    				data = true;
    			}else{
    				data = false;
    				$('<small name="small" style="color: red;"></small>').text(this.i18n.safeMsgNotNull).appendTo(this.qid("activitytypescheme-first").parent());
    			}
    			break;
    		case "second":
    			var second = this.qid("unit").select2("val");
    			if(second){
    				data = true;
    			}else{
    				data = false;
    				$('<small name="small" style="color: red;"></small>').text(this.i18n.safeAgencyNotNull).appendTo(this.qid("unit").parent());
    			}
    			break;
    		case "third":
    			var third = this.qid("activitytypescheme-third").val();
    			if(third){
    				data = true;
    			}else{
    				data = false;
    				$('<small name="small" style="color: red;"></small>').text(this.i18n.schemeNotNull).appendTo(this.qid("activitytypescheme-third").parent());
    			}
    			break;	
    	}
    	return data;
    },
    /*
     * 请求更新数据(新增、修改)
     */
    _sendModifyAjax:function(data,e){
    	this.disableForm();
    	var data = {};
    	var value = $('input[name=activitytypescheme]:checked',this.qid("radio")).attr("value");
    	switch(value){
	    	case "first":
	        	data = {
		        	"tokenid":$.cookie("tokenid"),
		    		"method":"stdcomponent.update",
		    		"dataobject":"unitConfig",
		    		"dataobjectid":this._options.config,
		    		"obj":JSON.stringify({
		    			"activityTypeScheme":parseInt(this.qid("activitytypescheme-first").val())
		    		})
		    	};
	    		break;
	    	case "second":
	    		data = {
		        	"tokenid":$.cookie("tokenid"),
		    		"method":"stdcomponent.update",
		    		"dataobject":"unitConfig",
		    		"dataobjectid":this._options.config,
		    		"obj":JSON.stringify({
		    			"activityTypeScheme":parseInt(this.qid("unit").select2("val"))
		    		})
		    	};
	    		break;
	    	case "third":
	    		data = {
	    			"tokenid":$.cookie("tokenid"),
		    		"method":"addactivitytypeschemeforunit",
		    		"unit":this._options.unit,
		    		"obj":JSON.stringify({
		    			"name":this.qid("qiv-col-third-type").text(),
            			"description":"",
            			"defaultType":"",
            			"types":$.map(this.qid("activitytypescheme-third").val(),function(li,idx){
            				return parseInt(li);
            			})
		    		})
		    	};
	    		break;
    	}
    	$.u.ajax({
        	url: $.u.config.constant.smsmodifyserver,
            type:"post",
            dataType: "json",
            cache: false,
            "data": data
        },this.qid("dialog")).done(this.proxy(function(response){
        	if(response.success){
                this.formDialog.dialog("close");
                this.refreshDataTable();
        	}
        })).fail(this.proxy(function(jqXHR,errorText,errorThrown){
        	
        })).complete(this.proxy(function(jqXHR,errorStatus){
        	this.enableForm();
        }));
    },
    /*
     * 根据设置创建表单 
     */
    buildForm:function(){
    	$.u.ajax({
            url: $.u.config.constant.smsqueryserver,
            dataType: "json",
            data: {
            	"tokenid":$.cookie("tokenid"),
				"method":"getactivitytypeschemeselectionforunit",
				"unit":this._options.id
            }
        },this.qid("dialog")).done(this.proxy(function (data) {
            if (data.success) {
            	//FIRST
            	data.data.schemes&&$.each(data.data.schemes,this.proxy(function(k,v){
                	$('<option value="'+v.id+'">'+v.name+'</option>').appendTo(this.qid("activitytypescheme-first"));
                	var $div = $('<div class="hidden" cid="scheme'+v.id+'"></div>').appendTo(this.qid("div-col-first"));
                	var $ul = $('<ul style="padding-left:15px;"></ul>').appendTo($div);
                	v.types && $.each(v.types,this.proxy(function(k1,v1){
                		$('<li><img  src="/sms/uui'+v1.url+'" width="16px" height="16px" />'+v1.name+'</li>').appendTo($ul);
                	}))
                	$div = null;
                	$ul = null;
            	}))
            	//SECOND
	           this.qid("unit").select2({
				width:200,
				data:{ results: data.data.units, text: 'name' },
		        formatResult:function(item){		        	
		        	return "<small>"+item.name+"</small>";
		        },
		        formatSelection:function(item){
		        	return "<small>"+item.name+"</small>";
		        },
		        id:function(item){
		        		return item.scheme.id;
		        }
			});
            //THIRD
        	data.data.types&&$.each(data.data.types,this.proxy(function(k,v){
            	$('<option value="'+v.id+'">'+v.name+'</option>').appendTo(this.qid("activitytypescheme-third"));
            }));
        	this.qid("qid-col-third-name").text(this._options.unitName);
        	this.qid("qiv-col-third-type").text(this._options.unitName+this.i18n.newMsgType);
            //
        	this.unitName.text(this._options.unitName);
        	this.unitActivity.text(this._options.name);
        	$('option[value='+this._options.id+']',this.qid("activitytypescheme-first")).attr("selected","selected");
        	$('div[cid=scheme'+this._options.id+']',this.qid("div-col-first")).removeClass("hidden");
        	this.enableForm();
            }
        })).fail(this.proxy(function (jqXHR, errorText, errorThrown) {

        })).complete(this.proxy(function(){
        }));
  
    },
    /*
     * 清空表单数据和校验错误信息
     */
    clearFormData:function(){
    	this.qid("activitytypescheme-first").empty();
    	this.qid("div-col-first").empty();
    	this.qid("unit").select2("val","");
    	this.qid("activity-type-scheme-second").empty();
    	this.qid("activity-type-second").empty();
    	this.qid("qid-col-third-name").empty();
    	this.qid("qiv-col-third-type").empty();
    	this.qid("activitytypescheme-third").empty();
    },
    /*
     * 禁用表单元素
     */
    disableForm:function(){
//    	$(":text,textarea,select",this.form).attr("disabled",true);
//    	$("input:hidden.select2").select2("enable",false);
    },
    /*
     * 启用表单元素
     */
    enableForm:function(){
//    	$(":text,textarea,select",this.form).attr("disabled",false);
//    	$("input:hidden.select2").select2("enable",true);
    },
    /*
     * 用于override
     */
    refreshDataTable:function(){},
    destroy: function () {
        this.formDialog.dialog("destroy").remove();
        this._super();
    }
}, { usehtm: true, usei18n: true });


com.sms.unitconfig.activityTypesSchemes.widgetjs = ['../../../uui/widget/select2/js/select2.min.js',
                                                    "../../../uui/widget/spin/spin.js",
                                                    "../../../uui/widget/jqblockui/jquery.blockUI.js",
                                                    "../../../uui/widget/ajax/layoutajax.js"];
com.sms.unitconfig.activityTypesSchemes.widgetcss = [{id:"",path:"../../../uui/widget/select2/css/select2.css"},{id:"",path:"../../../uui/widget/select2/css/select2-bootstrap.css"}];