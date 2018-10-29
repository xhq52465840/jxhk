var activityNumber="";
var id="";
function deleteAttach(id){
	
	//alert(way.get("jsonAttach")[id].id);
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
				   				"activityNumber":activityNumber
				   					
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
$.u.define('com.sms.losa.appendix', null, {
	init:function(){
		
	},
	afterrender:function(){
	
		scrollMenu('scrollnext');
		this.save=this.qid("saveAppendix");
		this.submit=this.qid("submitAppendix");
		this.addAttach=this.qid("addAttach");
		this.addAttach.on("click",this.proxy(this._addAttach));
		var url=location.href;
		
		var crewId="";
		if (url.indexOf("?") != -1){
			id=url.split('?')[1].split('=')[1];
			$.ajax({
				 url: $.u.config.constant.smsqueryserver,
	             type:"post",
	             dataType: "json",
	             cache: false,
	             data: {
	        		"tokenid":$.cookie("tokenid"),
	        		"method":"pullActivity",
	        		"activityId":id
	             }
		        
			 }).done(function(response){
				 if(response.jsonActivity.jsonAttach!=null){
					 way.set("jsonAttach",response.jsonActivity.jsonAttach);
					 
					 for (var i=0;i<response.jsonActivity.jsonAttach.length;i++){
						 $(document).ready(function() {
							 document.getElementById("download"+i).href=response.jsonActivity.jsonAttach[i].attachUrl;
							// document.getElementById("index"+i).innerHTML=i+1;
						 })
						 
						 var str=response.jsonActivity.jsonAttach[i].updateTime;
						 response.jsonActivity.jsonAttach[i].updateTime=formAllDate(str); 
						 
					 }
					 way.set("jsonAttach",response.jsonActivity.jsonAttach);
					 activityNumber= response.jsonActivity.jsonObserve[0].activityNumber;
					
				 }
				
				
				
		
			 });	
		}
		addLink(id);
		
		

	},
   _addAttach:function(){
	   this.uploadDialog= $('#uploadDialog').dialog({
			width:540,
			title:"上传附件",
			modal: true,
	        draggable: false,
	        resizable: false,
	        autoOpen: false,
	        position:[500,300],
	        buttons:[{
				  "text":"上传",
				  "click":this.proxy(function(){
					  $("#uploadAttach").uploadify('upload','*');
				  })
			  },
     		  {
     			  "text":"取消",
     			  "class":"aui-button-link",
     			  "click":this.proxy(function(){
     				  this.uploadDialog.dialog("close");
     			  })
     		  }
     		],
       
		});
	   $("#uploadAttach").uploadify({
		   'auto':false,
		   'swf': this.getabsurl('../../../uui/widget/uploadify/uploadify.swf'),
		   'buttonText':'选择附件', //按钮上的字
		   'uploader': $.u.config.constant.smsmodifyserver+";jsessionid="+$.cookie("sessionid"),
		   'fileTypeDesc':'Image Files', //文件类型描述
		   'fileTypeExts':'*.*',//可上传文件格式
		   'cancelImg':this.getabsurl('../../../uui/widget/uploadify/uploadify-cancel.png'),
		   'height': 30,	//按钮的高度和宽度
			'width': 180,
			'progressData':'speed',
			'successTimeout': 99999,
			'removeTimeout': 3,	
			'method':'get',
			'multi': true, //单个上传
			'queueSizeLimit':999,
			'requeueErrors' : true,//当上传失败时，反复排队上传
			'onQueueComplete':this.proxy(function(queueData){
				if(queueData.uploadsErrored < 1){
					this.uploadDialog.dialog("close");
				}else{
					$.u.alert.error(data.reason+"!上传失败", 1000 * 3);
				}
			}),
			'onUploadStart':this.proxy(function(file) {
				var data = {};
				var name=JSON.parse($.cookie("uskyuser")).username;
				data={"method":"uploadFile","dataobject":"losa","tokenid":$.cookie("tokenid"),
					  "id":id,"activityNumber":activityNumber,"userid":$.cookie("userid"),"type":"losa"
					  };
				
				
				$("#uploadAttach").uploadify('settings','formData',data);
			}),
			'onUploadSuccess':this.proxy(function(file, data, response) {
				
				if(response){
        		   $.u.alert.success("上传成功");
        		   $.ajax({
      				 url: $.u.config.constant.smsqueryserver,
      	             type:"post",
      	             dataType: "json",
      	             cache: false,
      	             data: {
      	        		"tokenid":$.cookie("tokenid"),
      	        		"method":"pullActivity",
      	        		"activityId":id
      	             }
      		        
      			 }).done(function(response){
    				 if(response.jsonActivity.jsonAttach!=null){
    					 way.set("jsonAttach",response.jsonActivity.jsonAttach);
    					 for (var i=0;i<response.jsonActivity.jsonAttach.length;i++){
    						 document.getElementById("download"+i).href=response.jsonActivity.jsonAttach[i].attachUrl;
    						// document.getElementById("index"+i).innerHTML=i+1;
    						 var str=response.jsonActivity.jsonAttach[i].updateTime;
    						 response.jsonActivity.jsonAttach[i].updateTime=formAllDate(str);
    					 }
    					 way.set("jsonAttach",response.jsonActivity.jsonAttach);
    					 activityNumber= response.jsonActivity.jsonObserve[0].activityNumber;
    					  
    				 }
    				 
    				 
    			 });
        		   
    			}else{
    				 $.u.alert.success("上传失败");
    			}
			}),
			
	   });
	   this.uploadDialog.dialog("open");
	},
 
	
}, 


{ usehtm: true, usei18n: false });


com.sms.losa.appendix.widgetjs = ['../../../uui/widget/jqurl/jqurl.js',
                                  '../../../uui/widget/jqdatatable/js/jquery.dataTables.js', 
                                  '../../../uui/widget/jqdatatable/js/dataTables.bootstrap.js',
                                  '../../../uui/widget/select2/js/select2.min.js',
                                  "../../../uui/widget/spin/spin.js", 
                                  "../../../uui/widget/jqblockui/jquery.blockUI.js",
                                  "../../../uui/widget/ajax/layoutajax.js",
                                  "../../../uui/vendor/underscore.js",
                                  "../../../uui/vendor/underscore.json.js",
                                   "../../../uui/vendor/form2js.js",
                                   "../../../uui/vendor/js2form.js",
                                   '../../../uui/widget/uploadify/jquery.uploadify.js',
                                   "../../../uui/way.js"];
 com.sms.losa.appendix.widgetcss = [{ path: '../../../uui/widget/jqdatatable/css/jquery.dataTables.css' }, 
                                   { path: '../../../uui/widget/jqdatatable/css/dataTables.bootstrap.css' },
                                   {path:"../../../uui/widget/select2/css/select2.css"},
                                   {path:"../../../uui/widget/select2/css/select2-bootstrap.css"},
                                   {path:"../../../uui/widget/bootstrap/css/bootstrap.css"},
                                   {id:"",path:"../../../uui/widget/uploadify/uploadify.css"}]