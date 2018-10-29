//@ sourceURL=com.audit.checklist.textView
$.u.define('com.audit.checklist.textView', null, {
	//copy from com.sms.workflow.textView

	//this.textView.open()
    init: function (options) {
      
    },
    afterrender: function (bodystr) {
    	this._i18n = com.audit.checklist.textView.i18n;
    	var maxHeight=$(window).height()*0.8;
    	$(".textview-container",this.$).css({"max-height":maxHeight,"overflow-y":"auto","margin-top":"-11px"});
    	this._btntrigger=this.qid("btntrigger");
    	//.siblings()JQ
    	//nextSibling()DOM
    
    	this.unitform=this.qid("unit-form");
    	this._loading=$(".loading-group",this.unitform);
    	this.ReadText=this.qid("ReadText");
    	this.uploadExcelDialog = $(".textview",this.$).dialog({
    		modal:true,
    		width:600,
    		resizable:false,
    		draggable: false,
    		//position:["center",30],
    		autoOpen:false,
    		open:this.proxy(/*this.loadPathList*/),
    		buttons:[
    		         {
	    			'text':'导入',
	    			'click':this.proxy(function(e){
	    				var	versionId=null;
	    				if($("input[name=version]").select2("data")){
	    				 versionId= $("input[name=version]").select2("data").id;
	    				};
	    				if(!versionId){
	    					$.u.alert.error("请选择版本！");
	    					return 
	    				};
	    				var	type=$("input[name=type]").val()
	    				if(!!!type){
	    					$.u.alert.error("请选择类型！");
	    					return 
	    				};
	    				if (this.qid("uploadify").data('uploadify').queueData.queueLength > 0){
	    					this.qid("uploadify").uploadify('upload','*');
		    				 this._loading.removeClass("hidden");
	    				} else{
	    					$.u.alert.error("请选择附件");
	    					return 
	    				}
	    				 
	    				 
	    				 })
	    			},
    		         {
	    			'text':'关闭',
	    			'class':'aui-button-link',
	    			'click':this.proxy(function(){
	    				this.uploadExcelDialog.dialog("close");
    					})
    		         }],
	         close:this.proxy(function(){
	        	 	$("input[name=type]").add($("input[name=version]")).select2("val", "");
	         	    this._loading.addClass("hidden");
	            })
    	
    	});
    	
    
    	//审计专业
    	$.u.ajax({
			url:$.u.config.constant.smsqueryserver,
			dataType:"json",
			type:"post",
			data:{
				"tokenid":$.cookie("tokenid"),
				"method":"stdcomponent.getbysearch",
				"dataobject":"dictionary",
				"rule":JSON.stringify([[{"key":"type","value":"系统分类"}]])
			}
    	}, this.filtersel, {size: 2, backgroundColor: "#fff"}).done(this.proxy(function (response) {
        	if (response.success) {
        		this._profession=$.map(response.data.aaData,this.proxy(function(item,idx){
        					return {"id":item.id,"name":item.name}
        					
        		}));
        		
            }
        })).fail(this.proxy(function (jqXHR, errorText, errorThrown) {

        }));
   
    	//版本
    	$.u.ajax({
            url: $.u.config.constant.smsqueryserver,
            dataType: "json",
            type:"post",
            data: {
        		"tokenid":$.cookie("tokenid"),
    			"method": "stdcomponent.getbysearch",
        		"rule": JSON.stringify([[{"key":"type","value":"审计库版本"}]]),
        		"dataobject": "dictionary"
        	}
        }, this.filtersel, {size: 2, backgroundColor: "#fff"}).done(this.proxy(function (response) {
        	if (response.success) {
        		this._version=$.map(response.data.aaData,this.proxy(function(item,idx){
					return {"id":item.id,"name":item.name}
					
        		}));
        	}
        })).fail(this.proxy(function (jqXHR, errorText, errorThrown) {

        }));
    
    	this.inittable();
    	this.qid("ReadText").on("change",this.proxy(this.on_ReadText));
    	this.qid("btn-excel").on("click",this.proxy(this.btn_excel));
    	$("input[name=type]").select2({
    		data: [{id:'SYS_STD',text:'公司安全运行审计标准检查单'},
    		       {id:'TERM_STD',text:'公司航站安全审计标准检查单'},
    		       {id:'SPOT_STD',text:'公司现场检查标准检查单'},
    		       {id:'SPEC_STD',text:'公司专项检查单'},
    		]
    	});
    	
    	 // //  下拉框初始化
    	 $("input[name=version]").select2({
       		 placeholder: "选择版本",
           	ajax:{
    	        	url: $.u.config.constant.smsqueryserver,
    	        	type: "post",
    	            dataType: "json",
    	        	data: function(term, page){
    	        		return {
    	        			"tokenid":$.cookie("tokenid"),
    	        			"method": "stdcomponent.getbysearch",
    	            		"rule": JSON.stringify([[{"key":"type","value":"审计库版本"}],[{"key":"key","value":"当前审计库版本"}]]),//R9 R10
    	            		"dataobject": "dictionary"
    	        		};
    	    		},
    		        results:function(data,page){
    		        	if(data.success){
    		        		return {results:$.map(data.data.aaData,function(item,idx){
    		        			return item;
    		        		})};
    		        	}
    		        }
    	        },
    	        formatResult: function(item){
    	        	return item.name;      		
    	        },
    	        formatSelection: function(item){
    	        	this.versionId=item.id;
    	        	return item.name;	        	
    	        }
           });
    	 $(".loading").css({
     	 	"width":"40px",
	 	 	"height":"40px",
	 	 	"position": "absolute",
	 	 	"top":"20%",
	 	 	"left":"5%",
	 	 	"line-height":"16px",
	 	 	"color":"#fff",
	 	 	"padding-left":"10px",
	 	 	"font-size":"15px",
	 	 	"background": " url(../img/loader.gif) no-repeat 10px 50%",
	 	 	"opacity":" 0.7",
	 	 	"z-index":"9999",
	 	 	"-moz-border-radius":"20px",
	 	 	"-webkit-border-radius":"20px",
	 	 	"border-radius":"20px"
 	 	
 	 });
    },
    inittable:function(){
    	this.col_data=[
    	               {name:"章节/要点"},
    	               {name:"审计专业"},
    	               {name:"版本号"},
    	               {name:"所属章节"},
    	               {name:"审计要点"},
    	               {name:"审计依据"},
    	               {name:"审计提示"},
    	               {name:"分值"}
    	               ];						
    	var $thead= $(".textview-show thead").empty();
    	var $tr = $("<tr/>").appendTo($thead);
    	$.each(this.col_data,this.proxy(function(idx,item){
    		$("<th/>").attr("thspan",item.key).html(item.name).css("width","10%").appendTo($tr);
    	}));
    },
    
    /**
     * 打开模态层
     * @param params {id:"",title:""}
     */
    open:function(params){
    	this.data=params.data;
    	this.uploadExcelDialog.dialog("option","title",params.title).dialog("open");
    	this._uploadify();
    },
    /**
     * @title 加载步骤列表
     * @param e
     */
    loadPathList:function(e){},
    /**
	 * @title 通过分类获取颜色标签
	 * @param v 分类的key值
	 */
    getLabel:function(v){
    	var label=null;
    	switch(v){
			case "NEW":
				label="label-primary";
				break;
			case "IN_PROGRESS":
				label="label-warning";
				break;
			case "COMPLETE":
				label="label-success";
				break;
			default:
				label="label-default";
				break;
		}
    	return label;
    },
    
    
    
    on_ReadText: function (e) {
    	this.returndata=[];
    	this.redata=[];
    	if(e.currentTarget){
			if(this.value=e.currentTarget.value){
				this.tbody = this.qid("tbody").empty();
	    		this.Content = this.value.replace(/(\n\n)/g, "\n").replace(/\n$/g,"");
	    		this.lines = this.Content.split("\n");
	    		var $thr= $(".textview-show thead tr");
	    		if($("[status=status]",$thr).length==0){
					$("<th/>").css("width","10%").attr("status","status").html("导入状态").appendTo($thr);
	    		}
	    		$.each(this.lines,this.proxy(function(idx,cols){
	    			
	    			this.col =cols.split("\t");
	    			if(this.col.length==(0||1||2||3||4||6)){
	    				console.log("第"+(idx+1)+"行文字几块： "+this.col.length);
	    				$.u.alert.warn("第"+(idx+1)+"行数据有误，请仔细校验后重新输入!",5000);
	    			}
	    			else{
	    				this.result={};
	    				this.settingdata={
    							"pointType": this.col[0]?this.col[0]:"",
    							"profession":this.col[1]?this.col[1]:"",
    							"version":   this.col[2]?this.col[2]:"",
    							"parent":    this.col[3]?this.col[3]:"",		
    							"point"	:    this.col[4]?this.col[4]:"",
    							"according": this.col[5]?this.col[5]:"",
    							"prompt":    this.col[6]?this.col[6]:"",
    							"value":     this.col[7]?this.col[7]:""
    							};
	    				this.result=this._validate(this.settingdata,idx);
	    				$(".alert-danger").tooltip({html : true ,left: 25}).tooltip('show');
		    			if($(".alert-danger",this.uploadExcelDialog).length==0){
		    				this.redata.push(this.result);
		    			}
	    			}
	    		}));
	    		if($(".alert-danger",this.uploadExcelDialog).length===0){
    				this.returndata=this.redata;
    			}
	    	}
		}
    },
    //
    _validate: function (coldata,idx) {
    	this.settingdata=coldata;
    	var $tr = $("<tr/>").appendTo(this.tbody);
        this.chapter=true;
        var $td ;
		if($.inArray(this.settingdata.pointType,["章节","要点"])<0){
	        $td = $("<td/>").attr("qid",this.settingdata.pointType).html("<span class='alert-danger'  data-toggle='tooltip' data-placement='bottom'  data-original-title='请确认是<h5>章节</h5>还是<h5>要点</h5>'>"+this.settingdata.pointType+"</span>").appendTo($tr);
    	}
		else{
	        $td = $("<td/>").attr("qid",this.settingdata.pointType).html("<span class=''>"+this.settingdata.pointType+"</span>").appendTo($tr);
		}
	 

		if(this.settingdata.pointType){
			if(this.settingdata.pointType=="章节"){
				 this.chapter=true;
			}else if(this.settingdata.pointType=="要点"){
				 this.chapter=false;
			}
				
			
		}
	
		this.inprofession =$.grep(this._profession,this.proxy(function(item, idx){
			return item.name.trim().toString()===this.settingdata.profession.trim().toString();
		}))
		if(this.inprofession.length===0){
			$("<td><span class='alert-danger' data-toggle='tooltip' data-placement='"+(idx===0?'top':'bottom')+"'  data-original-title='名称错误 格式为：货物运输CGO'>"+this.settingdata.profession+"</span></td>").appendTo($tr);
    	}else {
    		$("<td><span class=''>"+this.settingdata.profession+"</span></td>").appendTo($tr);
    	}
		
		this.inversion =$.grep(this._version,this.proxy(function(item, idx){
			return item.name.trim().toString()===this.settingdata.version.trim().toString();
		}))
		
		if(this.inversion.length===0){//("^[R][\\d]*$")("^[R][0-9]*$")
			$("<td><span class='alert-danger' data-toggle='tooltip' data-placement='"+(idx==0?'top':'bottom')+"'  data-original-title='格式为：R10'>"+this.settingdata.version+"</span></td>").appendTo($tr);
		}else {
			$("<td><span class=''>"+this.settingdata.version+"</span></td>").appendTo($tr);
		}
		$("<td><span class='parent' data-toggle='tooltip' data-placement='"+(idx==0?'top':'bottom')+"'  data-original-title=''>"+this.settingdata.parent+"</span></td>").appendTo($tr);

		if(!this.settingdata.point){
			$("<td><span class='alert-danger' data-toggle='tooltip' data-placement='"+(idx==0?'top':'bottom')+"'  data-original-title='不能为空'>"+this.settingdata.point+"</span></td>").appendTo($tr);
		}else{
			$("<td><span class=''>"+this.settingdata.point+"</span></td>").appendTo($tr);
		}
		
		if(this.chapter){
			$("<td></td><td></td><td></td><td><i class='glyphicon glyphicon-file'></i><span class='status '>未导入</span></td>").appendTo($tr);
			return   {
						"pointType": "chapter",
						"type":      "SYS",
						"profession":this.inprofession[0]?this.inprofession[0].id:"",
						"version":   this.inversion[0]?this.inversion[0].id:"",
						"parent":    this.settingdata.parent?this.settingdata.parent:"",
						"point"	:    this.settingdata.point?this.settingdata.point:"",		
					};
		}
		if(!this.settingdata.according){
			$("<td><span class='alert-danger' data-toggle='tooltip' data-placement='"+(idx==0?'top':'bottom')+"'  data-original-title='不能为空'>"+this.settingdata.according+"</span></td>").appendTo($tr);
		}else{
			$("<td><span class=''>"+this.settingdata.according+"</span></td>").appendTo($tr);
		}
			
		if(!this.settingdata.prompt){
			$("<td><span class='alert-danger' data-toggle='tooltip' data-placement='"+(idx==0?'top':'bottom')+"'  data-original-title='不能为空'>"+this.settingdata.prompt+"</span></td>").appendTo($tr);
		}else{
			$("<td><span class=''>"+this.settingdata.prompt+"</span></td>").appendTo($tr);
		}
		if(this.settingdata.value.trim()!=""){
			if(!this.settingdata.value.trim().match("^([0-9]{1,2}|100)$")){//^\\d{1,3}$
				$("<td><span class='alert-danger' data-toggle='tooltip' data-placement='"+(idx==0?'top':'bottom')+"'  data-original-title='分值为0-100的整数'>"+this.settingdata.value+"</span></td>").appendTo($tr);
	    	}else {
	    		$("<td><span class=''>"+this.settingdata.value+"</span></td>").appendTo($tr);
	    	}
		}else $("<td><span class=''></span></td>").appendTo($tr);
		
		$("<td><i class='glyphicon glyphicon-file'></i><span class='status'>未导入</span></td>").appendTo($tr);
		return  {
					"pointType": "point",
					"type":      "SYS",
					"profession":this.inprofession[0]?this.inprofession[0].id:"",
					"version":   this.inversion[0]?this.inversion[0].id:"",
					"parent":    this.settingdata.parent?this.settingdata.parent:"",			
					"point"	:    this.settingdata.point?this.settingdata.point:"",	
					"according": this.settingdata.according?this.settingdata.according:"",
					"prompt":    this.settingdata.prompt?this.settingdata.prompt:"",
					"value":     this.settingdata.value?this.settingdata.value:""
				};
    },
    
    //校验所属章节
    _isparent: function (parent,version,profession,ischapter) {
    	var	dataid=[[{"key":"profession","value":4129}],[{"key":"type","value":"SYS"}],[{"key":"version","value":8268530}]];
    	$.ajax({
	    	url:$.u.config.constant.smsqueryserver,
	        type:"post",
	        dataType: "json",
	        cache: false,
	        async:false,
	        data: {
	        	"tokenid":$.cookie("tokenid"),
	    		"method":"getItemTreeNode",
	    		"dataobject":"item",
	    		"rule":JSON.stringify(dataid)
	        }
	    }).done(this.proxy(function(data){
	    	if(data.success){
				if(data.data.aaData){
					this.treeNodes = $.map(data.data.aaData,function(perm,idx){
							return {id:perm.id, pId:perm.parentId, name:perm.name};
        			});
				}
	    	}
	    })).fail(this.proxy(function(jqXHR,errorText,errorThrown){
	    	
	    }));
    	this._set=$.grep(this.treeNodes,this.proxy(function(item,idx){
    				return $.inArray(item.name,parent)>-1;
    	}));
    	
    },
    
    
    
    //
    btn_validate: function (coldata,idx) {
    	this.settingdata=coldata;
        var $tr = $("<tr/>").appendTo(this.tbody);
        this.chapter=true;
	
		if($.inArray(this.settingdata.profession,this._profession)<0){
			$("<td><span class='alert-danger'  data-toggle='tooltip' data-placement='"+(idx==0?'top':'bottom')+"'  data-original-title='名称错误 格式为：货物运输CGO'>"+this.settingdata.profession+"</span></td>").appendTo($tr);
    	}else 
    		$("<td><span class=''>"+this.settingdata.profession+"</span></td>").appendTo($tr);
		
		
    },
    
    
    /*
     * 请求更新数据(新增、修改)
     */
    _sendModifyAjax:function(data,e,func){
    	var curr_row=data;
    	$.u.ajax({
        	url: $.u.config.constant.smsmodifyserver,
            type:"post",
            dataType: "json",
            cache: false,
            "data": data,
            async:false
        },this.qid("table").parent(), {size:2, backgroundColor:"#fff"}).done(this.proxy(function(response){
        	this.allparent=$(".parent");
        	if(response.success){
        		this.idx++;
        		this.allparent.eq(curr_row.idx).removeClass("alert-danger").attr("data-original-title","")
        		this.thisxi=$(".status",this.uploadExcelDialog).eq(curr_row.idx)
        													  .removeClass("label-warning")
													          .addClass("label label-success")
													          .html("导入成功")
													          .parent()
													          .find(".glyphicon");
				if(this.thisxi){
					this.thisxi.removeClass("glyphicon-file")
				 			  .removeClass("glyphicon-info-sign")
						      .addClass("glyphicon-ok");
				}
        	}else{
        		this.idy++;
        		/*if(response.reason.indexOf("】") > -1){
        			a=response.reason.split("】");
            		b=a[0].split("【");
            		son=b[1].trim();
            		$.map(this.allparent,this.proxy(function(item,idx){
            				if ($.inArray(item.innerText,[son]) > -1){
            					$(item).addClass("alert-danger").attr("data-original-title","章节内容有误").tooltip('show');
            					$(".status",item.parentNode.parentNode).html("导入失败").addClass("label label-warning");
            					$(".glyphicon",item.parentNode.parentNode).removeClass("glyphicon-file").addClass("glyphicon-info-sign");
            				}
            		}))
        		}*/
        		this.allparent.eq(curr_row.idx).addClass("alert-danger").attr("data-original-title","章节内容有误").tooltip('show');
        		this.thisyi=$(".status",this.uploadExcelDialog).eq(curr_row.idx)
        													  .removeClass("label-warning")
													          .addClass("label label-warning")
													          .html("导入失败")
													          .parent()
													          .find(".glyphicon");
				if(this.thisyi){
					this.thisyi.removeClass("glyphicon-file")
				 			  .addClass("glyphicon-info-sign")
						      .removeClass("glyphicon-ok");
				}
        	}
        	
        	if(this.datalength==(this.idy+this.idx)){
        		$.u.alert.success(this._i18n.messages.success+this._i18n.messages.beforespan
        				+this.idx+this._i18n.messages.afterspan+this._i18n.messages.beforefailed
        				+this.idy+this._i18n.messages.afterfailed+(this.idy==0?"":this._i18n.messages.reupload),5000);
        		console.log(this._i18n.messages.success+this._i18n.messages.beforespan
        				+this.idx+this._i18n.messages.afterspan+this._i18n.messages.beforefailed
        				+this.idy+this._i18n.messages.afterfailed+(this.idy==0?"":this._i18n.messages.reupload));
    			this.refreshDataTable();
    		}

        })).fail(this.proxy(function(jqXHR,errorText,errorThrown){
        	 this.returndata=[];
        })).complete(this.proxy(function(jqXHR,errorStatus){
        }));
    },
    
    
    //上传签批件
    _add_file:function(){
    	var num;
    	if(this._options.isTransmitted){
    		num = 11;
    	}else{
    		num = 6;
    	}
    	if(!this.fileDialog){
    		var clz = $.u.load("com.audit.comm_file.audit_uploadDialog");
    		this.fileDialog = new clz($("div[umid='fileDialog']",this.$),null);
    	}
		this.fileDialog.override({
    		refresh: this.proxy(function(data){
    			
    		})
    	});
    	try{
    		this.fileDialog.open({
    			"method":"uploadFiles",
    			"source": this._options.id,
    			"tokenid":$.cookie("tokenid"),
    			"sourceType":num
    		});
    	}catch(e){
    		$.u.alert.error("上传出错！");
    	}
    },
    
    delete_file:function(e){
    	var file_id = $(e.currentTarget).attr("name") ;
    	var clz = $.u.load("com.audit.comm_file.confirm");
        var confirm = new clz({
            "body": "确认删除？",
            "buttons": {
                "ok": {
                    "click": this.proxy(function(){
                    	$.u.ajax({   //删除文件
            				url : $.u.config.constant.smsmodifyserver,
            				type:"post",
            	            dataType: "json",
            	            cache: false,
            	            data: {
            	            	"method": "stdcomponent.delete",
            	            	"dataobjectids": JSON.stringify([parseInt(file_id)]),
            	                "tokenid": $.cookie("tokenid"),
            	                "dataobject" : "file"
            	            },
            	    	}).done(this.proxy(function(response) {
            	    		if(response.success){
            	    			confirm.confirmDialog.dialog("close");
            	    		}
            	    	}))
                    })
                }
            }
        });
    },
    
    
    
    
    //上传文件
  _uploadify:function(){
	  /*<a href="javascript:$('#file_upload').uploadify('upload', '*');">开始上传</a>
	    |
	    <a href="javascript:$('#file_upload').uploadify('cancel', '*');">清除队列</a>
	    |
	    <a href="javascript:$('#file_upload').uploadify('destroy');">销毁上传</a> |
	    <a href="javascript:$('#file_upload').uploadify('disable', true);">禁用上传</a>
	    |
	    <a href="javascript:$('#file_upload').uploadify('disable', false);">激活上传</a>
	    |
	    <a href="javascript:$('#file_upload').uploadify('stop');">停止上传</a> |*/
	  this.qid("uploadify").uploadify({
		  
			'auto':false,
			'swf': this.getabsurl('../../../uui/widget/uploadify/uploadify.swf'),
			'uploader': $.u.config.constant.smsmodifyserver+";jsessionid="+$.cookie("sessionid"),
			'fileTypeDesc':'doc', //文件类型描述
			'fileTypeExts':'*.*',//可上传文件格式  *.doc;*.docx;*.rar;*.xls;*.ppt;*.ppt;*.pdf;*.jpg;*.bmp;*.png;*.xlsx;*.pptx;
			'removeCompleted': true,
			'buttonText':'选择excel文件', //按钮上的字
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
					this.uploadExcelDialog.dialog("close");
				}else{
					$.u.alert.error(data.reason+"!上传失败", 1000 * 3);
				}
			}),
			'onUploadStart':this.proxy(function(file) {
				var	versionId=null;
				if($("input[name=version]").select2("data")){
				 versionId= $("input[name=version]").select2("data").id;
				}
				if(!versionId){
					$.u.alert.error("请选择版本！");
					return 
				}
				var	type=$("input[name=type]").val()
				if(!!!type){
					$.u.alert.error("请选择类型！");
					return 
				}
				var   param={
						  "tokenid":$.cookie("tokenid"),
						  "method":"importItem",
						  "versionId":versionId,//(Integer)版本ID
						  "type":type,//（String）类型
				  }
				
				
				this.qid("uploadify").uploadify('settings','formData',param);
			}),
			'onUploadSuccess':this.proxy(function(file, data, response) {
				if(data){
					data = JSON.parse(data);
	    			if(data.success){ 
	    				$.u.alert.success("上传成功",2000);
	    				
	    			}else{
	                    $.u.alert.error(data.reason, 1000 * 3);
	    			}
				}
			})
	    });

	/*    
	  $("<div class='plugin-progress'>"+
				"<div class='progress'>"+
					"<div class='progress-bar' role='progressbar' aria-valuenow='0' aria-valuemin='0' aria-valuemax='100' style='width: 0%;'>60%</div>"+
				"</div>"+
		  "</div>").dialog({
			title:"上传中",
			width:540,
			resizable:false,
			draggable: false,
			modal:true
		});*/
	  
	  
  },
	
  
  _loadshow:function(){
		this.qid("myModal").modal();
		this.uploadExcelDialog.dialog("close");
			  
	
			 
  },
  
  
    /*
     * 用于override
     */
    refreshDataTable:function(){},
    enableForm:function(){},
    destroy: function () {
    	this.uploadExcelDialog.dialog("destroy").remove();
        this._super();
    }
}, { usehtm: true, usei18n: true });


com.audit.checklist.textView.widgetjs = ['../../../uui/widget/jqdatatable/js/jquery.dataTables.js', 
                                         '../../../uui/widget/select2/js/select2.min.js',
                                      '../../../uui/widget/jqdatatable/js/dataTables.bootstrap.js',
                                      "../../../uui/widget/spin/spin.js",
                                      '../../../uui/widget/uploadify/jquery.uploadify.js',
                                      "../../../uui/widget/jqblockui/jquery.blockUI.js",
                                      "../../../uui/widget/ajax/layoutajax.js",
                                      "../../../uui/widget/jqurl/jqurl.js"
                                      ];
com.audit.checklist.textView.widgetcss = [{ id:"",path: '../../../uui/widget/jqdatatable/css/jquery.dataTables.css' },
                                          { id:"",path: '../../../uui/widget/bootstrap/css/bootstrap.min.css' } ,
                                          {id:"",path:"../../../uui/widget/uploadify/uploadify.css"},
                                          {id:"",path:"../../../uui/widget/select2/css/select2.css"},
                                          {id:"",path:"../../../uui/widget/select2/css/select2-bootstrap.css"},
                                         { id:"",path: '../../../uui/widget/jqdatatable/css/dataTables.bootstrap.css' }
                                        ];


