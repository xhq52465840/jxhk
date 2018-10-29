//@ sourceURL=com.eiosa.audit.action
var actionDialog="";
var attach;
$.u.load("com.common.vueupload.fileList");
//$.u.load("com.eiosa.uploadDialog");
$.u.define('com.eiosa.audit.action', null, {
	init: function (options) {
		this._options = options || {};
		this.id = this._options.id;
		this.actId=this._options.actId;
        this.isarpId=this._options.isarpId;
        this.isUpload="0";
	},
    afterrender: function () {
	     this._initRel();
	     if(this.attachDialog != null) delete this.attachDialog;
	     
		
		
	     //给actionAuditor添加select2事件
    	$("#relActionAuditor").select2({
    		tokenSeparators:[',', ' '],
      		 allowClear: true,
      		tags: true,
			 ajax: {
               url: $.u.config.constant.smsqueryserver,
               dataType: "json",
               type: "post",
               data: this.proxy(function(term, page){
                   return {
                       tokenid: $.cookie("tokenid"),
                       method: "queryAuditors",
                       "type":"auditing",
                       "name":term
                   };
               }),
               results: this.proxy(function(response){
               	
                   if(response.success){
                	 
                       return {
                       	 "results": response.auditorList
                       	
                       }
                   }
               })
               
           },
           id: function(item){
               return item.id;
           },

           formatResult:function(item){
             return item.fullname+"("+item.username+")";
           	
           	
           },
           formatSelection:function(item){
           	return item.username;
           }
    	});

    },
    
    
	_initRel : function(e){
	    Vue.filter('datestr', function(value) {
			var date = new Date(value);
			if ( isNaN(date)==true ) return value;
			return date.format("yyyy-MM-dd");
		});
	   
		this.relformsvue = new Vue({
			el : '.relform',
			data : {rel : ''},
			methods : {
				attachclick : this.proxy(this._attachclick),
				attachdel : this.proxy(this._attachdel),
				save : this.proxy(this._save),
				addAttach : this.proxy(this._addAttach),
				close : this.proxy(this._close),
				reload : this.proxy(this._load()),
				
			},
		});
		 this.attachDialog=new com.common.vueupload.fileList($("div[umid='attachList']",this.$),{
			 activityId:this.id,filesId:this.isarpId,type:'iosa_action_attach',isUpload:this.isUpload
		 });
	    
	    $("#relAuditDate").datepicker({
			"dateFormat" : "yy-mm-dd",
			constrainInput : true
		});		
		
		this._load();
	},
	
	
    _load : function(e) {
    	if (this.id == null || isNaN(this.id)) return;
    	var data = {
    			"method" : "queryActions",
    			"id" : this.id,
    			"type":"queryById"
    		};
    		myAjaxQuery(data, null, this.proxy(function(response) {
    			if (response.success) {
    				
    				if(e=="attach"){
    					//this.relformsvue.$set("rel.attach", response.ActionList[0].attach);
    				}else{
    				    this.relformsvue.$set("rel", response.ActionList[0]);
    			        $("#relActionAuditor").select2("data",response.ActionList[0].auditorSelect2);
    				}
    			}
    			
    		})); 
    	},
    	
    	
    
    _attachclick : function(e) {
		var attachId = $(e.currentTarget).attr("dataid");
		openAttach(attachId);
	},

	_save : function(e) {
		//进行必填项验证
		if(this._isValid()){
			var data = {
					"tokenid":$.cookie("tokenid"),
					"method":"updateActions",
					"id":this.id,
					"auditDate":$("#relAuditDate").val(),
					"status": $("#relStatusValue").val(),
					"auditors": $("#relActionAuditor").val(),
					"reports": $("#relReports").val(),
					"title": $("#relTitle").val(),
					
				};
				
				
				myAjaxModify(data, null, this.proxy(function(response) {
					if(response.code=="success"){
						$.u.alert.success("保存成功！");
						parent.isarpvue.queryAction(this.isarpId);
						this._close();
					}else{
						$.u.alert.error("保存失败");
					}
				}));
			
		}
		
	
},
 _isValid:function(){
	var result=false;
	if($("#relActionAuditor").val()==null || $("#relActionAuditor").val()==""){
		layer.msg('Name(s) of the Auditor不能为空');
	}else{
		if($("#relReports").val()==null || $("#relReports").val()==""){
			layer.msg('Audit Record不能为空');
		}else{
			if($("#relAuditDate").val()==null || $("#relAuditDate").val()==""){
				layer.msg('Audit Date不能为空');
			}else{
				 if($("#relStatusValue").val()==null || $("#relStatusValue").val()==""){
						layer.msg('Satus不能为空');
				 }else{
					 if($("#relTitle").val()==null || $("#relTitle").val()==""){
							layer.msg('Title不能为空');
						}else{
							result=true;
						}
				 }
			}
		}
	}
	return  result;
},
	_attachdel : function(e) {
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
					this._load("attach");
				}));
				
			}, attachId, layerindex), this.proxy(function(){
			})) ;		
		
	},
	_addAttach:function(e){
		
		
		 this.attachDialog=new com.eiosa.uploadDialog($("div[umid='uploadDialog']",this.$),null);
    	var value={"id":this.id,"activityNumber":this.isarpId,"type":"iosa_action_attach",
		"onUploadSuccess" : this.proxy(function() {
			this._load("attach");
    	   				
    			}),
    		};
    	this.attachDialog.open(value);
    	
    },

	_close : function(e) {		
        var index = parent.layer.getFrameIndex(window.name); //先得到当前iframe层的索引		
		parent.layer.close(index);
	},

	
}, { usehtm: true, usei18n: false });

com.eiosa.audit.action.widgetjs = [
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
	                          "../../../uui/util/dateutil.js", "../base.js"
							  ];
com.eiosa.audit.action.widgetcss = [{id:"",path:"../../../uui/widget/select2/css/select2.css"},
                                    {id:"",path:"../../../uui/widget/select2/css/select2-bootstrap.css"},
                                    { path: '../../../css/eiosa.css' }];