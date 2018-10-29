//@ sourceURL=com.sms.activityinfo.tag
$.u.define('com.sms.activityinfo.tag', null, {
    init: function (options) {
    	/*
    	 {
    	 	activity:"",	// 安全信息ID
    	 	screen:"",		// 界面
    	 }    	 
    	 */
        this._options = options || {};
        this.activityid = this._options.activity;
    },
    afterrender: function (bodystr) {
    	this.form=this.qid("form");
    	this.label=this.qid("label");
    	this.m=[];
    	this.fieldDialog = this.qid("field-dialog").dialog({
    		title: "编辑",
    		width: 510,
    		modal: true,
    		resizable: false,
    		draggable: false,
    		autoOpen: false,
    		position: ["center",200],
    		create: this.proxy(this.on_dialog_create),
    		open: this.proxy(this.on_dialog_open),
    		close: this.proxy(this.on_dialog_close),
    		buttons:[
    		    {
    		    	text: "确认",
    		    	"class": "button-submit",
    		    	click: this.proxy(this.on_dialogsave_click)
    		    },
    		    {
    		    	text: "取消",
    		    	"class": "aui-button-link",
    		    	click: this.proxy(function(){
    		    		this.fieldDialog.dialog("close");
    		    	})
    		    }
    		]
    	});
    },
    open:function(){
    	this.fieldDialog.dialog("open");
    	/**
    	 * @title 填充值
    	 */
    	$.ajax({
    		url:$.u.config.constant.smsqueryserver,
			dataType: "json",
			async:false,
			data: {
				 tokenid:$.cookie("tokenid"),
				 method:"getactivityeditingconfig",
				 activity:this.activityid
			 }
			
    	}).done(this.proxy(function(response){
    		if(response.success){
    			var states=0;
    			var labelValue=[];
    			$.each(response.data.fields,this.proxy(function(index,item){
    				if(item.key=="label" && item.value.length>0){
    					states=1;
    					labelValue=item.value;
    				}
    			}));
    			if(states==1){
    				var m=[];
        			for(i in labelValue){
        				m.push({id:labelValue[i],name:labelValue[i]});
        			}
        			this.m=m;
    			}
    		}
    	}))
    	this.label.select2({
        	        width: "100%",
        	        multiple:true,
        	        ajax: {
        	        	url:$.u.config.constant.smsqueryserver,
        				dataType: "json",
        				async:false,
        				filter: this.qid("label").val(),
        	          data: function(term, page) {
        	        	  return {
        	        		  tokenid:$.cookie("tokenid"),
        	                  method: "getlabels",
        	                  filter:term
        	        	  }
        	          },
        	          results: function(response, page) {
        	        	  var aaData=[];
        	        	  for(i in response.data){
        	        		  aaData.push({
        	        			  id:response.data[i],
            	        		  name:response.data[i]
        	        		  })
        	        	  }
        	        	  response.aaData=aaData;
        	            return {
        	              results: response.aaData
        	            };
        	          }
        	        },
        	        formatSelection: function(item) {
        	          return item.name;
        	        },
        	        formatResult: function(item) {
        	          return item.name;
        	        }
        	      
    		
    	})
    	this.label.select2("data",this.m);
    },
    /**
     * @title execute when dialog open
     * @param e {object}
     * @return void
     */
    on_dialog_open:function(e){
    },
    /**
     * @title execute when dialog create
     * @param e {object}
     * @return void
     */
    on_dialog_create:function(e){
    	
    },
    /**
     * @title execute when dialog close
     * @param e {object}
     * @return void
     */
    on_dialog_close:function(e){},
    /**
     * @title save activity
     * @return void
     */
    on_dialogsave_click:function(){
		// if(this.label.val()){
			this.disable();
			$.u.ajax({
        		url: $.u.config.constant.smsmodifyserver,
                type:"post",
                dataType: "json",
                data: {
            		"tokenid":$.cookie("tokenid"),
            		"method":"stdcomponent.updateextend",
            		"dataobject":"activity",
            		"dataobjectid":this.activityid,
            		"obj":JSON.stringify(this.getData())
                }
        	},this.fieldDialog.parent(),{ size: 1,backgroundColor:'transparent', selector: this.fieldDialog.parent().find(".ui-dialog-buttonpane button:eq(0)"), orient: "west" }).done(this.proxy(function(response){
        		if(response.success){
        			this.refresh();
        			this.fieldDialog.dialog("close");
        		}
        	})).fail(this.proxy(function(jqXHR,errorText,errorTHrown){
        		
        	})).complete(this.proxy(function(jqXHR,errorStatus){
        		this.enable();
        	}));
		// }else{
		// 	$.u.alert.error("标签不能为空");
		// }
    },
    /**
     * @title reload fields
     * @param param {object} ajax params
     * @return void
     */
    _reloadFields:function(param){
		var size = 2 , opts={};
		opts.__spinner = new Spinner({ radius: 3 * size, width: 1 * size, length: 2 * size , color:"white" }).spin();
		var blockuiopts = {
		    message: opts.__spinner.el, 
		    overlayCSS: { 
		    	backgroundColor: 'transparent' 
		    },
		    css:{
		    	"background": "black", 
		    	"border": "none",
		    	"width":40,
		    	"height":40,
		    	"border-radius":8,
		    	"left":"50%"
		    }
		};

    	this.disable(); // 禁用创建表单的自定义字段
		this.fieldDialog.parent().addClass("hidden");
		$.blockUI(blockuiopts);
    	
    	$.u.ajax({
			url: $.u.config.constant.smsqueryserver,
            dataType: "json",
            data:$.extend({
				tokenid:$.cookie("tokenid")
	        },param)
		},this.fieldDialog.parent(),{ size: 1,backgroundColor:'transparent', selector: this.fieldDialog.parent().find(".ui-dialog-buttonpane button:eq(0)"), orient: "west" }).done(this.proxy(function(response){
	    	this.fieldDialog.parent().removeClass("hidden");
    		$.unblockUI();
			this.enable(); // 启用创建表单的自定义字段
			if(response.success){
	    		this._options=response.data;
	    		
	    		// 创建动态字段   		
    	    	// this.qid("field-dialog").css({"maxHeight":$(window).height()*0.8,"overflow-y":"auto"});
			}
		})).fail(this.proxy(function(jqXHR,errorText,errorThrown){
	    	this.enable();
		}));
    },
    /**
     * @title valid form
     * @return {bool} 
     */
    valid:function(){
    	
    },
    /**
     * @title disable form
     * @return void
     */
    disable:function(){
    	
    },
    /**
     * @title enable form
     * @return void
     */
    enable:function(){
    	
    },
    /**
     * @title get form data
     * @returns tempData {object} form data
     */
    getData:function(){
    	var tempData = {label:this.label.val().replace(/,/g, " ")};
    	
    	return tempData;
    },
    /**
     * @title quick trigger used by detail.html
     * @param activityid {id}
     * @return void
     */
    quickTrigger:function(activityid){
    	this.activityid = activityid;
    	this.open();
    },
    /**
     * @title used by overload
     */
    refresh:function(){},
    destroy: function () {
    	this.fieldDialog.dialog("destroy").remove();
        this._super();
    }
}, { usehtm: true, usei18n: false });


com.sms.activityinfo.tag.widgetjs = ["../../../uui/widget/spin/spin.js",
                                      "../../../uui/widget/jqblockui/jquery.blockUI.js",
                                      "../../../uui/widget/ajax/layoutajax.js",
                                      '../../../uui/widget/select2/js/select2.min.js'
                                      ];

com.sms.activityinfo.tag.widgecss = [
                                     {id:"",path:"../../../uui/widget/select2/css/select2.css"},
                                     {id:"",path:"../../../../uui/widget/select2/css/select2-bootstrap.css"}
                                  ];
