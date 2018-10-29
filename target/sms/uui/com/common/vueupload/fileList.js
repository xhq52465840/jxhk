//@ sourceURL=com.common.vueupload.fileList
$.u.load("com.common.vueupload.uploadDialog");
$.u.define('com.common.vueupload.fileList', null, {
	init: function (options) {
		this._options = options || {};
		//活动id
		this.activityId=this._options.activityId;
		//文件夹的id
		this.filesId=this._options.filesId;
		//文件夹的类型
		this.type=this._options.type;
		//标题语言
		this.language=this._options.language;
		//是否显示删除按钮
		
		this.isDeleted=this._options.isDeleted;
		//是否显示上传按钮
		this.isUpload=this._options.isUpload;
	},
    afterrender: function () {
	     this.fileListVue=new Vue({
	    	 el:"#fileList",
	    	 data:{fileList:'',language:this.language,isDownLoad:this.isDownLoad,isDeleted:this.isDeleted,isUpload:this.isUpload},
	    	 methods : {
	    		 loadFile:this.proxy(this._loadFile),
	    		 deleteFile:this.proxy(this._deleteFile),
	    		 downFile:this.proxy(this._downFile),
	    		 addFile:this.proxy(this._addFile)
	    	 }
	    	 
	     })
	     
    	this._loadFile();
	    if(this.attachDialog != null) delete this.attachDialog;
	    this.attachDialog=new com.common.vueupload.uploadDialog($("div[umid='uploadDialog']",this.$),{});
    },
    //查找附件
    _loadFile:function(){
    	var data = {
    			"method" : "queryFileList",
    			"activityId" : this.activityId,
    		};
    	//debugger
    		myAjaxQuery(data, null, this.proxy(function(response) {
    			if (response.success) {
    			  this.fileListVue.$set('fileList',response.fileList);
    			  
    			}else{
    				$.u.alert.error("附件加载失败");
    			}
    			
    		})); 
    },
    //下载附件
    _downFile:function(e){
    	var fileId = $(e.currentTarget).attr("dataid");
		openAttach(fileId);
    },
    //删除附件
    _deleteFile:function(e){
    	var attachId = $(e.currentTarget).attr("dataid");
		var layerindex = layer.confirm('是否确认删除？', {
		    btn: ['确认','取消'] //按钮
		},  this.proxy(function(attachId, layerindex){
			var data = {
				"method":"deleteAttachFile",
   				"attachId": attachId[0],
			};
			myAjaxModify(data, null, this.proxy(function(response) {
				// 已删除;
				layer.close(layerindex); 					
				this._loadFile();
			}));
			
		}, attachId, layerindex), this.proxy(function(){
		})) ;		
		
    },
    //上传附件
    _addFile:function(){
    	
    	var value={"id":this.activityId,"activityNumber":this.filesId,"type":this.type,
    			"onUploadSuccess" : this.proxy(function() {
    				this._loadFile();	
    	    			}),
    	    		};
        this.attachDialog.open(value);
    }
	
}, { usehtm: true, usei18n: false });

com.common.vueupload.fileList.widgetjs = [
							 '../../eiosa/base.js'
							  ];
com.common.vueupload.fileList.widgetcss = [];