
function deleteAttach(id){
	document.getElementById("deleteContent").innerHTML="确定要删除："+way.get("jsonAttach")[id].attachShowName+"吗？";
	 this.deleteDialog= $('#deleteDialog').dialog({
			width:540,
			title:"删除",
			modal: true,
	        draggable: false,
	        resizable: false,
	        autoOpen: false,
	        position:[500,300],
		});
	 
	 var dialogOptions = {
				buttons: [{
	            text: "确定",
				"class": "aui-button-link",
				click: function () {
					 $.ajax({
				   			url:$.u.config.constant.smsmodifyserver,
				   			type: "post",
				            dataType: "json",
				   			data:{
				   				"tokenid":$.cookie("tokenid"),
				   				"method":"deleteFile",
				   				"attachment":JSON.stringify(
				   					way.get("jsonAttach")[id]
				   				),
				   				"activityNumber":way.get("jsonAttach")[id].activityId
				   			},
				   		}).done(function(){
				   				$('#deleteDialog').dialog("close");
					   			way.remove("jsonAttach["+id+"]");
				   			    
				   			
				   		})
				    }
	            },
	             {
	            text: "取消",
	  			"class": "aui-button-link",
	  			click: function () {
	  				
	  				
	  				$('#deleteDialog').dialog("close");
				}
	            }
		]
		};
	 this.deleteDialog.dialog("option",dialogOptions).dialog("open");
	 
	
}

//@ sourceURL=com.eiosa.uploadDialog
$.u.define('com.eiosa.uploadDialog', null, {
    init: function (options) {
        this._options = options||null;
    },
    afterrender: function (bodystr) {
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
           				this.qid("div_Dialog").dialog("close");
           			  })
           		  }
           		],
            open: this.proxy(function () {
            	 
            	
            }),
            close: this.proxy(function () {
            	
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
			'swf': this.getabsurl('../../uui/widget/uploadify/uploadify.swf'),
			'uploader': $.u.config.constant.smsmodifyserver+";jsessionid="+$.cookie("sessionid"),
			'fileTypeDesc':'所有文件', //文件类型描述
			'fileTypeExts':'*.*',//可上传文件格式  *.doc;*.docx;*.rar;*.xls;*.ppt;*.ppt;*.pdf;*.jpg;*.bmp;*.png;*.xlsx;*.pptx;
			'removeCompleted': true,
			'buttonText':'选择附件', //按钮上的字
			'cancelImg':this.getabsurl('../../uui/widget/uploadify/uploadify-cancel.png'),
			'height': 30,	//按钮的高度和宽度
			'width': 180,
			'progressData':'speed',
			'successTimeout': 99999,
			'removeTimeout': 3,	
			'method':'get',
			'multi': true, //单个上传
			'fileSizeLimit':'400MB',
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
				var data = {
				   "method":"uploadFile","dataobject":"losa","tokenid":$.cookie("tokenid"),
				   "id":param.id,"activityNumber":param.activityNumber,"userid":$.cookie("userid"),"type":param.type
				};//id 对应于数据库中的observeId, acticityNumber 对应于保存文件路径中的activityNumber
				
				this.qid("uploadify").uploadify('settings','formData',data);
			}),
    		'onUploadSuccess':this.proxy(function(file, data, response) {
    			     debugger;
        			if(response){
        				$.u.alert.success("上传成功");
        				if(param.onUploadSuccess!=null && typeof(param.onUploadSuccess)!="undefined") { //有自定义回调
        					param.onUploadSuccess.apply(this);
        					return;
        				}
        				/**$.ajax({
             				 url: $.u.config.constant.smsqueryserver,
             	             type:"post",
             	             dataType: "json",
             	             cache: false,
             	             data: {
             	        		"tokenid":$.cookie("tokenid"),
             	        		"method":"queryAttach",
             	        		"activityId":param.id
             	             }
             		        
             			 }).done(function(response){
             				
           				 if(response.success){
           					
           					 way.set("jsonAttach",response.jsonAttach);
           					for (var i=0;i<response.jsonAttach.length;i++){
           					 document.getElementById("download"+i).href="http://"+window.location.host+"/sms/query.do?"
           						 + "nologin=Y&method=downloadLosaFiles&fileId="+response.jsonAttach[i].id;
           					 
           					 var str=response.jsonAttach[i].updateTime;
           					 response.jsonAttach[i].updateTime=formAllDate(str);
           				 }
           					
           					way.set("jsonAttach",response.jsonAttach);  
           			 } 
           				 
           			 });*/
        					
        			}else{
                        $.u.alert.error(data.reason, 1000 * 3);
        				
        			}
        				
    			}
    		)
        });
    	this.divDialog.dialog("open");
    	
    },
    refresh:function(){
    	
    },
    destroy: function () {
        this._super();
    }
}, { usehtm: true, usei18n: false });

com.eiosa.uploadDialog.widgetjs = ['../../uui/widget/uploadify/jquery.uploadify.js',
                                   "../../uui/widget/spin/spin.js",
                                       "../../uui/widget/jqblockui/jquery.blockUI.js",
                                       "../../uui/widget/ajax/layoutajax.js",
                                       "../sms/losa/losa.js"];
com.eiosa.uploadDialog.widgetcss = [{id:"",path:"../../uui/widget/uploadify/uploadify.css"}];