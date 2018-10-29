//@ sourceURL=com.sms.safelib.uploadDialog
$.u.define('com.sms.safelib.uploadDialog', null, {
    init: function (options) {
        this._options = options||null;
    },
    afterrender: function (bodystr) {
    	this.rememberTitle = document.title;
    	setInterval(this.proxy(function(){document.title=this.rememberTitle}),50);
    	this.divDialog = this.qid("div_Dialog").dialog({
        	title:"上传附件",
            width:540,
            modal: true,
            draggable: false,
            resizable: false,
            autoOpen: false,
            buttons:[{
					  "text":"上传",
					  "click":this.proxy(function(){
						  this.qid("uploadify").uploadify('upload','*');
					  })
				  },
           		  {
           			  "text":"取消",
           			  "class":"aui-button-link",
           			  "click":this.proxy(function(){
           				  this.qid("uploadify").uploadify('cancel', '*');
           				this.qid("description").val("");
           				  this.divDialog.dialog("close");
           			  })
           		  }
           		],
            open: this.proxy(function () {
              document.title=this.rememberTitle ;
            }),
            close: this.proxy(function () {
              document.title=this.rememberTitle ;
              this.qid("description").val("");
            }),
            create: this.proxy(function () {
            	this.buildForm();
            })
        }); 
    },
    buildForm:function(){
    },
    open:function(param){
    	this.qid("uploadify").uploadify({
			'auto':false,
			'swf': this.getabsurl('../../../uui/widget/uploadify/uploadify.swf'),
			'uploader': $.u.config.constant.smsmodifyserver+";jsessionid="+$.cookie("sessionid"),
			'fileTypeDesc':'doc', //文件类型描述
			'fileTypeExts':'*.*',//可上传文件格式  *.doc;*.docx;*.rar;*.xls;*.ppt;*.ppt;*.pdf;*.jpg;*.bmp;*.png;*.xlsx;*.pptx;
			'removeCompleted': true,
			'buttonText':'选择附件', //按钮上的字
			'cancelImg':this.getabsurl('../../../uui/widget/uploadify/uploadify-cancel.png'),
			'height': 30,	//按钮的高度和宽度
			'width': 180,
			'progressData':'speed',
			'successTimeout': 99999,
			'removeTimeout': 3,	
			'method':'get',
			'multi': true, //单个上传
			'fileSizeLimit':'10MB',
			'queueSizeLimit':999,
			'requeueErrors' : true,//当上传失败时，反复排队上传
			'onQueueComplete':this.proxy(function(queueData){
				if(queueData.uploadsErrored < 1){
					this.divDialog.dialog("close");
				}else{
					$.u.alert.error(data.reason+"!上传失败", 1000 * 3);
				}
			}),
			'onUploadStart':this.proxy(function(file) {
				var data = {};
				$.each(param,this.proxy(function(key,value){
					data[key] = value;
				}));
				data.description = window.encodeURIComponent(this.qid("description").val());
				this.qid("uploadify").uploadify('settings','formData',data);
			}),
    		'onUploadSuccess':this.proxy(function(file, data, response) {
    			if(data){
    				data = JSON.parse(data);
        			if(data.success){
        				$.u.alert.success("上传成功");
        				//this.qid("description").val("");
        				//TODO 可能是有bug所以之前加了下面这句，但是加上之后不能上传多个附件，先注释
        				//this.qid("uploadify").uploadify('cancel', '*');
        				if(data.data){
        					this.refresh(data.data.aaData[0]);	
        				}else{
        					this.refresh(data);
        				}
        			}else{
                        $.u.alert.error(data.reason, 1000 * 3);
                        this.qid("description").val("");
        				this.refresh(data);
        			}
    			};
    			
    		})
        });
    	this.divDialog.dialog("open");
    },
    refresh:function(){
    	
    },
    destroy: function () {
        this._super();
    }
}, { usehtm: true, usei18n: false });

com.sms.safelib.uploadDialog.widgetjs = ['../../../uui/widget/uploadify/jquery.uploadify.js',"../../../uui/widget/spin/spin.js",
                                       "../../../uui/widget/jqblockui/jquery.blockUI.js",
                                       "../../../uui/widget/ajax/layoutajax.js"];
com.sms.safelib.uploadDialog.widgetcss = [{id:"",path:"../../../uui/widget/uploadify/uploadify.css"}];