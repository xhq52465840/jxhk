//@ sourceURL=com.audit.notice.fileUpload
$.u.define('com.audit.notice.fileUpload', null, {
    init: function (option) {
    	//附件上传对话框
    	this._option = option || null;
    },
    afterrender: function () {
    	this.createdialog();
    },
    open : function(){
    	this.file_dialog.dialog("open");
    },
    createdialog : function(){
    	this.file_dialog = this.qid("file_dialog").dialog({
    		title:"上传附件",
			width: 620,
			modal: true,
			resizable: false,
			autoOpen: false,
			create: this.proxy(this.on_unitdialog_create),
			buttons: [{
				"text" : "上传",
				"click" : this.proxy(function() {
					this.qid("uploadify").uploadify('upload','*');
				})
			},
			{
				"text" : "取消",
				"class" : "aui-button-link",
				"click" : this.proxy(function() {
					this.qid("uploadify").uploadify('cancel','*');
					this.file_dialog.dialog("close");
				})
			} ]
    	});
    },
    on_unitdialog_create : function(){
    	this.qid("uploadify").uploadify({
			'auto':false,
			'swf': this.getabsurl('../../../uui/widget/uploadify/uploadify.swf'),
			'uploader': $.u.config.constant.smsmodifyserver+";jsessionid="+$.cookie("sessionid"),
			'fileTypeDesc':'doc',
			'fileTypeExts':'*.*',
			'removeCompleted': true,
			'buttonText':'选择附件',
			'cancelImg':this.getabsurl('../../../uui/widget/uploadify/uploadify-cancel.png'),
			'height': 30,
			'width': 150,
			'progressData':'speed',
			'successTimeout': 99999,
			'removeTimeout': 3,	
			'method':'get',
			'multi': true,
			'fileSizeLimit':'10MB',
			'queueSizeLimit':999,
			'requeueErrors' : true,
			'onQueueComplete':this.proxy(function(queueData){
				if(queueData.uploadsErrored < 1){
					this.file_dialog.dialog("close");
				}else{
					$.u.alert.error(data.reason+"!上传失败", 1000 * 3);
				}
			}),
			'onUploadStart':this.proxy(function(file) {
				var data = this._option.source;
				this.qid("uploadify").uploadify('settings','formData',data);
			}),
    		'onUploadSuccess':this.proxy(function(file, data, response) {
    			if(data){
    				data = JSON.parse(data);
        			if(data.success){
        				$.u.alert.success("上传成功");
        				this._option.list(data.data.aaData);
        			}else{
                        $.u.alert.error(data.reason, 1000 * 3);
        			}
    			}
    		})
        });
    }
}, { usehtm: true, usei18n: false });

com.audit.notice.fileUpload.widgetjs = ["../../../uui/widget/uploadify/jquery.uploadify.js"];
com.audit.notice.fileUpload.widgetcss = [{id:"",path:"../../../uui/widget/uploadify/uploadify.css"}];