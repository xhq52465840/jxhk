//@ sourceURL=com.sms.detailmodule.uploadFile
$.u.define('com.sms.detailmodule.uploadFile', null, {
    init: function (option) {
    	this._options = option || {};
    	this._COMPLETE = "COMPLETE";
    	this.editable=this._options.editable; 
    	this._denyModify = this._options.statusCategory === this._COMPLETE;
    	this.fileListTemp = "<tr itemid='#{itemid}'>"
							+	"<td style='white-space: nowrap;'><img src='#{filetype}' style='padding-right: 10px;padding-bottom: 10px;'/><span class='downloadfile' style='display: inline-block;;cursor: pointer;color:blue;text-overflow: ellipsis;overflow: hidden;width:100px;' fileid='#{fileid}' title='#{filename}'>#{filename}</span></td>"
							+	"<td style='width: 20%;'>#{directory}</td>"
							+	"<td style='width: 15%;'>#{filesize}</td>"
							+	"<td style='width: 15%;'>#{filetime}</td>"
							+	"<td class='operate-tool'><span class='glyphicon glyphicon glyphicon-trash fl-minus del-file' data-data='#{filedata}' style='cursor: pointer;'></span></td>"
							+"</tr>";
    },
    afterrender: function (bodystr) {
    	this.btn_file = this.qid("btn_file");
    	this.fileList = this.qid("fileList");
    	
    	this.fileList.on("click","span.del-file",this.proxy(this._del_file));
    	this.qid("fileList").on("click","span.downloadfile",this.proxy(this._download_file));
    	
    	this._getFile();
    	
    	if(this._denyModify === true || this.editable==false){
    		this.btn_file.remove();
    	}else{
        	this.btn_file.on("click", this.proxy(this.on_uploadFile_click));
    	}
    },
    on_uploadFile_click: function(e){
    	e.preventDefault();
		if(!this.infoFileDialog){
			this.infoFileDialog = this.qid("info-file").dialog({
	        	title:"上传附件",
	            width:540,
	            modal: true,
	            draggable: false,
	            resizable: false,
	            autoOpen: false,
	            buttons:[
                  {
					  "text":"上传",
					  "click":this.proxy(function(){
						  if(this.qid("file-upload").data('uploadify').queueData.queueLength){
							  this.qid("file-upload").uploadify('upload','*');
						  }else{
							  $.u.alert.error("未选择文件！", 1000 * 3);
						  }
					  })
				  },
           		  {
           			  "text":"取消",
           			  "class":"aui-button-link",
           			  "click":this.proxy(function(){
           				  this.qid("file-upload").uploadify('cancel', '*');
           				  this.infoFileDialog.dialog("close");
           			  })
           		  }
           		],
	            open: this.proxy(function () {
                    var $fileTypeSelect = this.infoFileDialog.parent().find("[qid=file-type]");
	            	$.u.ajax({
                        url: $.u.config.constant.smsqueryserver,
                        type: "post",
                        dataType: "json",
                        data: {
                            tokenid: $.cookie("tokenid"),
                            method: "getFtypeByActivityId",
                            dataobject: "file",
                            activityId: this._options.activity
                        }
                    }, $fileTypeSelect.parent()).done(this.proxy(function(response){
                        if(response.success){
                            $fileTypeSelect.empty();
                            $.each(response.data, this.proxy(function(idx, item){
                                $("<option/>").attr({
                                    "value": item.fileTypeKey,
                                    "selected": item.defaultType === "Y"
                                }).text(item.fileTypeName).appendTo($fileTypeSelect);
                            }));
                        }
                    }));
	            }),
	            close: this.proxy(function () {
                    // this.infoFileDialog.parent().find("[qid=file-type]").val("0");
	            }),
	            create: this.proxy(function () {
	            	this.buildForm();
	            })
	        }); 
		}
		this.infoFileDialog.dialog("open");
    },
    _getFile:function(){
    	$.u.ajax({
        	url: $.u.config.constant.smsqueryserver,
            type:"post",
            dataType: "json",
            cache: false,
            "data": {
            	"tokenid": $.cookie("tokenid"),
				"method": "getFilesBySource",
				"source": this._options.activity,
				"sourceType": 3
            }
        },this.$,{size:2,backgroundColor:"#fff"}).done(this.proxy(function(response){
        	if(response.success){
        		if(response.addable === false){
            		this.btn_file.remove();
            	}
        		this.refresh(response.data.aaData);
        	}
        })).fail(this.proxy(function(jqXHR,errorText,errorThrown){
        	
        }));
    },
    buildForm:function(){
    	this.qid("file-upload").uploadify({
			'auto':false,
			'swf': this.getabsurl('../../../uui/widget/uploadify/uploadify.swf'),
			'uploader': $.u.config.constant.smsmodifyserver+";jsessionid="+$.cookie("sessionid"),
			'fileTypeDesc':'doc', //文件类型描述
			'fileTypeExts':'*.*',//可上传文件格式 *.doc;*.docx;*.rar;*.xls;*.ppt;*.ppt;*.pdf;*.jpg;*.bmp;*.png;*.xlsx;*.pptx;
			'removeCompleted': true,
			'buttonText':'选择附件', //按钮上的字
			'cancelImg':this.getabsurl('../../../uui/widget/uploadify/uploadify-cancel.png'),
			'height': 25,	//按钮的高度和宽度
			'width': 140,
			'progressData':'speed',
			'method': 'get',
			'removeTimeout': 3,
			'successTimeout': 99999,
			'multi': true, 
			'fileSizeLimit':'10MB',
			'queueSizeLimit':999,
			'simUploadLimit':999,
			'onQueueComplete':this.proxy(function(queueData){
				if(queueData.uploadsErrored < 1){
					this.infoFileDialog.dialog("close");
				}else{
					$.u.alert.error(data.reason+"!上传失败", 1000 * 3);
				}
			}),
			'onUploadStart':this.proxy(function(file) {
				var data = {};
				data.method = "uploadFiles";
				data.tokenid = $.cookie("tokenid");
				data.source = this._options.activity;
				data.sourceType = 3;
				data.attachmentType = this.qid("file-type").val();
				this.qid("file-upload").uploadify('settings','formData',data);
			}),
    		'onUploadSuccess':this.proxy(function(file, data, response) {
    			if(data){
    				data = JSON.parse(data);
        			if(data.success){
        				$.u.alert.success("上传成功");
        				// this.qid("file-upload").uploadify('cancel', '*');
        				this._getFile();
        			}else{
        				$.u.alert.error(data.reason+"!上传失败", 1000 * 3);
        			}
    			}
    		})
        });
    },
    refresh:function(data){
    	var temp, $temp;
        this.fileList.empty();
    	$.each(data,this.proxy(function(k,v){
    		temp = this.fileListTemp.replace(/#\{itemid\}/g, v.id)
									.replace(/#\{filetype\}/g, this.proxy(function(){
										return this.pic(v.type);
									}))
									.replace(/#\{fileid\}/g, v.id)
									.replace(/#\{filename\}/g, v.fileName)
									.replace(/#\{directory\}/g, v.directory)
									.replace(/#\{filesize\}/g, v.size)
									.replace(/#\{filetime\}/g, v.uploadTime)
									.replace(/#\{filedata\}/g, JSON.stringify({"id":v.id,"name":v.fileName}));
    		$temp = $(temp).appendTo(this.fileList);
    		if(v.deletable !== true || this._denyModify === true || this.editable==false){
    			$temp.find(".del-file").parent().removeClass("operate-tool").empty();
    		}
    		var $filename = $temp.find(".downloadfile");
    		$filename.width( $filename.parent().width() -  $filename.prev().outerWidth(true) - 10 * 2 );
    	}));
    },
    pic:function(data){
    	switch(data){
    		case "rar":
    			return this.getabsurl("../../../img/rar.gif");
    		case "gif":
    		case "bmp":
    		case "png":
    		case "jpg":
    			return this.getabsurl("../../../img/gif.gif");
    		case "doc":
    		case "docx":
    			return this.getabsurl("../../../img/doc.gif");
    		case "ppt":
    		case "pptx":
    			return this.getabsurl("../../../img/ppt.gif");
    		case "xls":
    		case "xlsx":
    			return this.getabsurl("../../../img/xls.gif");	
    		default:
    			return this.getabsurl("../../../img/file.gif");
    	}
    },
    _del_file:function(e){
    	try{
    		var data = JSON.parse($(e.currentTarget).attr("data-data"));
    		$.u.load("com.sms.common.stdcomponentdelete");
    		(new com.sms.common.stdcomponentdelete({
    			body:"<div>"+
    				 	"<p>确认删除？</p>"+
    				 "</div>",
    			title:"删除文件:"+data.name,
    			dataobject:"file",
    			dataobjectids:JSON.stringify([parseInt(data.id)])
    		})).override({
    			refreshDataTable:this.proxy(function(){
    				$('tr[itemid='+data.id+']').fadeOut(function(){
		    			$(this).remove();
		    		})
    			})
    		});
    	}catch(e){
    		throw new Error("删除操作失败:"+e.message);
    	}
    },
    _download_file:function(e){
    	var data = parseInt($(e.currentTarget).attr("fileid"));
    	var utrl = window.location.host+window.location.pathname+"#activityId="+this._options.activity;
        window.open($.u.config.constant.smsqueryserver+"?method=downloadFiles&tokenid="+$.cookie("tokenid")+"&ids="+JSON.stringify([data])+"&url="+window.encodeURIComponent(utrl));
    },
    destroy: function () {
        this._super();
    }
}, { usehtm: true, usei18n: false });


com.sms.detailmodule.uploadFile.widgetjs = ["../../../uui/widget/uploadify/jquery.uploadify.js",
                                            "../../../uui/widget/spin/spin.js", 
                                            "../../../uui/widget/jqblockui/jquery.blockUI.js",
                                            "../../../uui/widget/ajax/layoutajax.js"];
com.sms.detailmodule.uploadFile.widgetcss = [{id:"",path:"../../../uui/widget/uploadify/uploadify.css"}];