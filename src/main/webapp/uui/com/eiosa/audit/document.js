//@ sourceURL=com.eiosa.audit.document

$.u.load("com.eiosa.uploadDialog");
var documentDialog="";
var documentType="";
$.u.define('com.eiosa.audit.document', null, {
	init: function (options) {
		debugger;
		this._options = options || {};
		
	},
    afterrender: function (bodystr) {
    	
    	this.documentVue=new Vue({ el:'#documentDilog', 
    		                      data:{doc:'',display:true},
    		                      methods : {
    		                    	  addNewDocument:this.proxy(this._addNewDocument)
    		                      }
    	                           }); 
    	//根据documentId查找document
    	this._queryDocument();
    	//if($("#documentDate").prop("readonly")==false) {
        	$("#documentDate").datepicker({"dateFormat":"yy-mm-dd", constrainInput:true});
    	//} else {
    		//$("#documentDate").datepicker("option", "disabled", true);
    	//}
    	this.saveDocument=this.qid("saveDocument");
    	this.saveDocument.on("click",this.proxy(this._saveDocument));
    	this.docAttach=this.qid("docAttach");
 		this.docAttach.on("click",this.proxy(this._docAttach));
    },
    _addNewDocument:function(){
    	this.documentVue.$set('display',false);
    	documentType="newDocument"
        $("#documentReviewed").select2("destroy");
    },
   _queryDocument:function(){
	   id = this._options.id;
	   type=this._options.type;
	  
	   if(type=="addEixstDocument"){
		 this.documentVue.$set('display',true);
		 documentType="";
		 
		/**document.getElementById("documentReviewed").readOnly=false;
   		document.getElementById("documentAcronyms").readOnly=true;
       	document.getElementById("documentDate").readOnly=true;
       	document.getElementById("documentVersiono").readOnly=true;
       	document.getElementById("docType").disabled=true;*/
       	document.getElementById("docType").style.backgroundColor='#F0F0F0';
       	//document.getElementById("addNeWDocument").style.display="";
	 
		 //添加select2控件
       	$("#documentReviewed").select2({
       		
       		ajax: {
                   url: $.u.config.constant.smsqueryserver,
                   dataType: "json",
                   type: "post",
                   data: this.proxy(function(term, page){
                       return {
                           tokenid: $.cookie("tokenid"),
                           method: "queryDocuments",
                           "sectionId":this._options.sectionId,
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
               placeholder : "请输入",
               tags:true,
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
       		this.documentVue.$set('doc', e.object);
       		
       	    this._addAttachToList(e.object.attach);
       	}));
		   
	   }else if(type=="modifyDocument"){
		   this.documentVue.$set('display',true);
		   documentType="";
			document.getElementById("docType").style.backgroundColor='#F0F0F0';
		   $.u.ajax({
	           url: $.u.config.constant.smsqueryserver,
	            type:"post",
	            dataType: "json",
	            cache: false,
	            data: {
	          	  "tokenid":$.cookie("tokenid"),
	 	       		  "method":"queryDocuments",
	 	       		  "isarpId":id,
	 	       		  "type":"queryById"
	            }
	     },$("#documentDilog")).done(this.proxy(function (data) {
	    	 if (data.success) {
	    		this.documentVue.$set('doc', data.data[0]);
	    		
	      		this._addAttachToList(data.data[0].attach);
	    	 }
	     }));
	   }
	  
   },
   _saveDocument:function(){
	    //定义章节的验证
		var regu=/^[a-zA-Z0-9;,\.\-\(\)\s]*$/;
		 var re=new  RegExp(regu);
		 
		 if(re.test($("#charpter").val())==false && $("#charpter").val()!=""){
		  
			 layer.msg('章节输入只能是字母数字和";,-()"');
	    }else if($("#documentReviewed").val()==null||$("#documentReviewed").val()==""){
			
	    	layer.msg('"Full name of the Manuals/Documents"不能为空');
	    }else if($("#documentAcronyms").val()==null||$("#documentAcronyms").val()==""){
			 
	    	layer.msg('"Acronyms"不能为空');
	    }else if($("#documentVersiono").val()==null||$("#documentVersiono").val()==""){
			 
	    	layer.msg('"Version/ Revision"不能为空');
	    }else if($("#documentDate").val()==null||$("#documentDate").val()==""){
			 
	    	layer.msg('"Distribution Date"不能为空');
	    }else{
	    	
	    	
			$.u.ajax({
				url:$.u.config.constant.smsmodifyserver,
				type: "post",
               dataType: "json",
               data:{
               	"tokenid":$.cookie("tokenid"),
					"method":"updateDocuments",
					 "sectionId":this._options.sectionId,
					 "documentId":this.documentVue.doc.id,
					 "documentType":documentType,
					"documentLibary":JSON.stringify({
						"reviewed":this.documentVue.doc.reviewed,
						"acronyms":this.documentVue.doc.acronyms,
						"versionno":this.documentVue.doc.versionno,
						"docdate":this.documentVue.doc.docdate+" 00:00:00",
						"type":this.documentVue.doc.type,
						"reportId":this._options.reportId
					}),
					"charpter":JSON.stringify({
						"dec":this.documentVue.doc.charpter,
						"id":this.documentVue.doc.charpterId,
						"documentid":{"id":this.documentVue.doc.id},
						"isarpId":this._options.isarpId
					})
               }
			},$('#documentDilog')).done(this.proxy(function(response){
				if(response.code=="success"){
					
					$.u.alert.success("保存成功");
					parent.isarpvue.queryDocument(this._options.isarpId);
					parent.isarpvue.queryLog(this._options.isarpId);
					this._close();
					
					 
				}else{
					if(response.existDocument){
						alert("该书已存在书库中，请勿重复添加")
					}else{
						$.u.alert.error("保存失败");
					}
					
				}
				
			}));
		}
		
   },
   _close : function(e) {
		var index = parent.layer.getFrameIndex(window.name); //先得到当前iframe层的索引
		
		parent.layer.close(index);
	},
   _addAttachToList:function(attach){
	   if(attach!=null){
			   for(var j=0;j<attach.length;j++){
				  way.set("jsonAttach",attach);
				 document.getElementById("download"+j).href="http://"+window.location.host+"/sms/query.do?"
			 + "nologin=Y&method=downloadLosaFiles&fileId="+attach[j].id;
 		     }
		   }else{
			 way.set("jsonAttach","");
		   }
   },
   _docAttach:function(){
	   this.attachDialog=new com.eiosa.uploadDialog($("div[umid='uploadDialog']",this.$),null);
	 
	   if(this.documentVue.doc.id==undefined){
		 //先保存document
	   		documentType="onlyAddAttach";
	   		$.ajax({
					url:$.u.config.constant.smsmodifyserver,
					type: "post",
	               dataType: "json",
	               data:{
	               	"tokenid":$.cookie("tokenid"),
						"method":"updateDocuments",
						 "documentType":documentType,
						"documentLibary":"",
						 "documentId":""
	               }
				}).done(this.proxy(function(response){
					if(response.code=="success"){	
						 documentType="newDocument";
						 this.documentVue.doc.id=response.docId;
						 var value={"id":response.docId,"activityNumber":this._options.reportId,"type":"iosa_document_attach"};
						 this.attachDialog.open(value);
					}
				}));
	   }else{
   		var value={"id":this.documentVue.doc.id,"activityNumber":this._options.reportId,"type":"iosa_document_attach"};
		this.attachDialog.open(value);
	}
   },
}, { usehtm: true, usei18n: false });

com.eiosa.audit.document.widgetjs = [
                              '../../../uui/widget/select2/js/select2.min.js',
							  '../../../uui/widget/spin/spin.js',
							  '../../../uui/widget/jqblockui/jquery.blockUI.js',
							  '../../../uui/widget/ajax/layoutajax.js',
							  '../../../uui/widget/validation/jquery.validate.js',
							 '../../../uui/vue.js',
							 "../../../uui/vendor/underscore.js",
	                         "../../../uui/vendor/underscore.json.js",
	                         "../../../uui/vendor/form2js.js",
	                         "../../../uui/vendor/js2form.js",
	                          "../../../uui/way.js",
							  ];
com.eiosa.audit.document.widgetcss = [{id:"",path:"../../../uui/widget/select2/css/select2.css"},
                                    {id:"",path:"../../../uui/widget/select2/css/select2-bootstrap.css"},
                                    { path: '../../../css/eiosa.css' }];