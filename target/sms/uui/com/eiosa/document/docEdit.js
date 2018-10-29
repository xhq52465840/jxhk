var attach;
//$.u.load("com.eiosa.uploadDialog");
$.u.load("com.common.vueupload.fileList");
$.u.load("com.eiosa.log.eiosaIsarpOperateLog");
$.u.define('com.eiosa.document.docEdit', null, {
	init : function(options) {
		debugger;
		this._options = options || null;
		this.chapterId = this._options.docId;
		this.docId = this._options.docId;
		this.reportId = this._options.reportId;
		this.type = this._options.type;
		this.isarpId = this._options.isarpId;
		this.sectionId = this._options.sectionId;
		this.isUpload=this._options.isUpload;
	},
	
	afterrender : function() {
		this._initDoc();
		
		
		if(this.attachDialog != null) delete this.attachDialog;
	},
	
	_initDoc : function(e) {
		Vue.filter('datestr', function(value) {
			var date = new Date(value);
			if ( isNaN(date)==true ) return value;
			return date.format("yyyy-MM-dd");
		});
		var readonly = true;
		var readonly1 = true;//fullname 的样式 
		//this.sectionId 如果是空：表示，当前页面是从 专业文件库tab页进来的，否则是从Isarp编辑页面进来的
		if (this.sectionId==null||isNaN(this.sectionId)||this.sectionId==""){
			readonly = false;
		    readonly1 = false;
		}else if(this.type=='addEixstDocument'){
			readonly1 = false;//当前页面是从Isarp编辑页面进来，而且是新增进来，不是修改进来			
		}
		this.docformsvue = new Vue({
			el : '.docform',
			data : {doc:'',sectionId:this.sectionId,readonly:readonly,readonly1:readonly1},
			methods : {
				save : this.proxy(this._save),
				close : this.proxy(this._close),
				reload : this.proxy(this._load()),
				addNewDocument:this.proxy(this._addNewDocument),
				queryLog:this.proxy(function(id){
					this._queryLog(id);
				}),
				logShow:this.proxy(function(e){
					this.on_togglePanel_click(e)
				}),
			},
		});
		if (this.sectionId==null||isNaN(this.sectionId)||this.sectionId==""){
			this._setModified(false);//专业文件库tab页进来才执行此操作
		}
		
		$("#repDocDate").datepicker({
			"dateFormat" : "yy-mm-dd",
			constrainInput : true
		})
		debugger
		this.attachDialog=new com.common.vueupload.fileList($("div[umid='attachList']",this.$),{
			 activityId:this.docId,filesId:this.reportId,type:'iosa_document_attach',isUpload:this.isUpload
		 });	
		this.logTable=new com.eiosa.log.eiosaIsarpOperateLog($("div[umid='docEditLogTable']", this.$),{targetId:this.docId});
		this._load();
		
    	
    //	this.attachDialog.open(value);
	},
	
	_queryLog:function(id){
		  if(id==''||id==null||isNaN(id)){
			  id = '00';
			  this.logTable.reload(parseInt(id));
		  }else{
			  this.logTable.reload(parseInt(id));
		  }	
	},
	
	_addNewDocument:function(){
	    this.docformsvue.$set('readonly',false);
	    $("#repReviewed").select2("destroy");
	},
	
	on_togglePanel_click: function(e){
	       var $this = $(e.currentTarget);
	      
	       if($this.hasClass("fa-minus")){
	           $this.removeClass("fa-minus").addClass("fa-plus");
	           
	       }
	       else{
	           $this.removeClass("fa-plus").addClass("fa-minus");
	           
	           this._queryLog(this.docId)
	       }
	       $this.closest(".panel-heading").next().toggleClass("hidden");
	   },
	   
	_load:function(e) {
		if (this.sectionId==null||isNaN(this.sectionId)||this.sectionId==""){//专业文件库进来执行的操作，新增和修改
			if (this.docId == null || isNaN(this.docId) || this.docId == "") return; //新增, 不用查询		
			var data = {
				"method" : "getEiosaDocumentById",
				"docId" : this.docId,
			};
			myAjaxQuery(data, null, this.proxy(function(response) {
				if (response.success) {
					this.docformsvue.$set("doc", response.data);
				}
			})); // myAjax
		}else{//Isarp编辑页面进来执行的操作
			var type = this.type;
			if(type=="addEixstDocument"){//新增操作	
				$("#repReviewed").removeAttr("readOnly");
				 //添加select2控件
		       	$("#repReviewed").select2({		       		
		       		ajax: {
		                   url: $.u.config.constant.smsqueryserver,
		                   dataType: "json",
		                   type: "post",
		                   data: this.proxy(function(term, page){
		                       return {
		                           tokenid: $.cookie("tokenid"),
		                           method: "queryDocuments",
		                           "sectionId":this._options.sectionId,
		                           "type":'queryDocBySection',
		                           "isarpId":this.isarpId,
		                           "docName":term
		                       };
		                   }),
		                   results: function(response){		                   	
		                       if(response.success){
		                           return {
		                           	 "results": response.data
		                           }
		                       }
		                   }		                   
		               },
		               id: function(item){
		                   return item.reviewed;
		               },
		               placeholder : "请输（已经添加的记录被过滤）",
		               
	         			allowClear : true,
		               formatResult:function(item){
		                 return "("+item.acronyms+")"+item.reviewed+"--"+item.versionno;		               			               	
		               },
		               formatSelection:function(item){		               	
		               	 return item.reviewed;
		               },
		               formatNoMatches:function(item){
		               	 return "没有您需要的参考文件，请添加新的参考文件";		   		                  
		               }  		                   
		       	}).on("select2-selecting", this.proxy(function(e){
		       		this.docId = e.object.id;
		       		var data = {
		    				"method" : "getEiosaDocumentById",
		    				"docId" : this.docId,
		    		};
		    		myAjaxQuery(data, null, this.proxy(function(response) {
		    			if (response.success) {
		    				this.docformsvue.$set("doc", response.data);
		    			}
		    		}));
		       	}));				   
			}else if(type=="modifyDocument"){
				//如果是Isarp页面进来，还需要查询chapter信息				
				if(this.isarpId != null && !isNaN(this.isarpId) && this.isarpId != ""){
					data = {
				 	       	 "method":"queryDocuments",
				 	         "isarpId":this.chapterId,
				 	       	 "type":"queryById"
				    }
					myAjaxQuery(data, null, this.proxy(function(response) {
						if (response.success) {
							this.docId = response.data[0].id;
							var data = {
									"method" : "getEiosaDocumentById",
									"docId" : this.docId,
								};
								myAjaxQuery(data, null, this.proxy(function(response1) {
									if (response.success) {
										this.docformsvue.$set("doc", response1.data);
										this.docformsvue.$set("doc.charpter", response.data[0].charpter);
										this.docformsvue.$set("doc.charpterId", response.data[0].charpterId);
									}
								}));
						}
					}));
				}else{
					var data = {
							"method" : "getEiosaDocumentById",
							"docId" : this.docId,
						};
						myAjaxQuery(data, null, this.proxy(function(response) {
							if(e=="attach"){
						//		this.docformsvue.$set("doc.attachmentList", response.data.attachmentList);
							}else{
								this.docformsvue.$set("doc", response.data);
							}
						}));					
				}												
			}else if(type=="addAttach"){
				$("#repReviewed").select2("destroy");
				$("#repReviewed").attr("readOnly","true");
				var data = {
						"method" : "getEiosaDocumentById",
						"docId" : this.docId,
					};
					myAjaxQuery(data, null, this.proxy(function(response) {
						if (response.success) {
							this.docformsvue.$set("doc.attachmentList", response.data.attachmentList);
						}
					}));
			}
		}
	},
	
	
	_save : function(e) {
		 //定义章节的验证
		var regu=/^[a-zA-Z0-9;,\.\-\(\)\s]*$/;
		var re=new  RegExp(regu);		 
		if(re.test($("#charpter").val())==false && $("#charpter").val()!=""){		  
			layer.msg('章节输入只能是字母数字和";,-()"');
		}else if($("#repReviewed").val()==null||$("#repReviewed").val()==""){
			layer.msg('"Full name of the Manuals/Documents"不能为空');
		}else if($("#repAcronyms").val==null || $("#repAcronyms").val()==""){
			layer.msg('"Acronyms"不能为空');
		}else if($("#repVersiono").val==null || $("#repVersiono").val()==""){
			layer.msg('"Version/ Revision"不能为空');
		}else if($("#repDocDate").val==null || $("#repDocDate").val()==""){
			layer.msg('"Distribution Date"不能为空');
		} else{
			//缩写转大写
			$("#repAcronyms").val($("#repAcronyms").val().toUpperCase()); 
			var docId = $(e.currentTarget).attr("dataid");
			var sectionId = this.sectionId;
			var repDocType = "";
			if(docId != null && !isNaN(docId) && docId != ""){
				if(sectionId == null || isNaN(sectionId) || sectionId == ""){//专业文件库tab页，修改文件
					repDocType = 'onlyUpdateDocument';//只修改document
				}else{//Isarp页面进来，选中section下面关联的doc,或者是修改进来
					repDocType = 'onlyUpdateCharpter';//只是修改charpter,增加章节或修改章节
				}
			}else {
				repDocType = 'newDocument';
			}
			//var repDocType= (docId!=null && docId!="") ? "onlyUpdateDocument" : "newDocument";
			var data = {
				 "method":"updateDocuments",
				 "sectionId":sectionId,
				 "documentId":docId,
				 "documentType":repDocType,
				 "documentLibary":JSON.stringify({
					"reviewed":$("#repReviewed").val(),
					"acronyms":$("#repAcronyms").val(),
					"versionno":$("#repVersiono").val(),
					"docdate":$("#repDocDate").val()+" 00:00:00",
					"type":$("#repType").val(),
					"reportId":this.reportId
				 }),
				 "charpter":JSON.stringify({
					"dec":this.docformsvue.doc.charpter,
					"id":this.docformsvue.doc.charpterId,
					"documentid":{"id":this.docformsvue.doc.id},
					"isarpId":this._options.isarpId
				 })
			};
			//专业文件库点击进来 没有chapter信息
			if(sectionId == null || isNaN(sectionId) || sectionId == ""){
				data = {
						 "method":"updateDocuments",
						 "documentId":docId,
						 "documentType":repDocType,
						 "documentLibary":JSON.stringify({
							"reviewed":$("#repReviewed").val(),
							"acronyms":$("#repAcronyms").val(),
							"versionno":$("#repVersiono").val(),
							"docdate":$("#repDocDate").val()+" 00:00:00",
							"type":$("#repType").val(),
							"reportId":this.reportId
						 })
					};
			}
			myAjaxModify(data, null, this.proxy(function(response) {
				if(response.code=="success"){
					parent.$.u.alert.success("保存成功！");
					if (this.sectionId==null||isNaN(this.sectionId)||this.sectionId==""){
						this._setModified(true);//专业文件库tab页进来才执行此操作
					}else{
						parent.isarpvue.queryDocument(this._options.isarpId);
						parent.isarpvue.queryLog(this._options.isarpId);
					}
					this._close();
					
				}else{
					if(response.existDocument){
						$.u.alert.error("该书已存在书库中，请勿重复添加！");
					}else{
						$.u.alert.error("保存失败！");
					}
				}
			}));
		}
		
	},
		
   

	_setModified: function(flag) {
		eiosaMainUm.docListUm.sectionDocVue.$set("child_modified", flag);
	},
	
	_getModified: function() {
		return eiosaMainUm.docListUm.sectionDocVue.child_modified;
	},
	
	_close : function(e) {
//		if(this.docformsvue.doc.attachmentList == null || this.docformsvue.doc.attachmentList.length == 0){
//			layer.msg('请上传附件！');
//		}else{
		//this.sectionId 如果是空：表示，当前页面是从 专业文件库tab页进来的，否则是从Isarp编辑页面进来的
			if (this.sectionId==null||isNaN(this.sectionId)||this.sectionId==""){
				layer.close(this.myLayerIndex);//由父传递过来			
			}else{
				debugger;
				var index = parent.layer.getFrameIndex(window.name); //先得到当前iframe层的索引
				parent.layer.close(index);
			}
//		}	
	},
		
}, {
	usehtm : true,
	usei18n : false
});

com.eiosa.document.docEdit.widgetjs = [
		'../../../uui/widget/select2/js/select2.min.js',
		"../../../uui/widget/spin/spin.js",
		"../../../uui/widget/jqblockui/jquery.blockUI.js",
		"../../../uui/widget/ajax/layoutajax.js", 
		"../../../uui/vue.min.js",
		"../../../uui/tooltip/myTooltip.js", 
		"../../../uui/util/htmlutil.js",
		"../../../uui/util/dateutil.js", 
		"../base.js" ];
com.eiosa.document.docEdit.widgetcss = [ 
            {id : "",path : "../../../uui/widget/select2/css/select2.css"},
            {id : "",path : "../../../uui/widget/select2/css/select2-bootstrap.css"}, 
            {path : '../../../uui/tooltip/jquery.tooltip.css'}];