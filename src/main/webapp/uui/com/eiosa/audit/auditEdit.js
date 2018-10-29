//@ sourceURL=com.eiosa.auditEdit
var assessFinding=[];
var assessObserve=[];
var conformity=[];
var value;
//var isarpId="";
//var sectionId="";
//var reportId="";
var operateType="";
$.u.load("com.eiosa.uploadDialog");
$.u.load("com.eiosa.log.eiosaIsarpOperateLog");
$.u.load("com.eiosa.isarplink.isarpLink");
$.u.define('com.eiosa.audit.auditEdit', null, {
    init: function (options) {
        this._options = options||null;
        this.isarpId=this._options.id;
    	this.sectionId=this._options.sectionId;
    	this.reportId=this._options.reportId;
    	this.sectionName=this._options.sectionName;
    	this.chapter=this._options.chapter;
    	this.logTable = null;
    	this.isarpLinkCheckUm = null;
		//Vue.config.debug = true;

    },
    afterrender: function (bodystr) {
		 this.isarpvue = new Vue({
			el : '#isarp',
			data : {
				isarpAll : {status:{}, isarp:{} ,showIsarpLink:false},
				actionlist : '',
				documentList : '',
				eiosaUserRole:$.cookie('eiosaUserRole')
				
			},
			methods : {
				saveIsarp : this.proxy(this._saveIsarp),
				submitIsarp : this.proxy(this._submitIsarp),
				reAudit : this.proxy(this._reAudit),
				showAction : this.proxy(this._showAction),
				downAttach : this.proxy(this._downAttach),
				deleteAttach : this.proxy(this._deleteAttach),
				showDocument : this.proxy(this._showDocument),
				delCharpter:this.proxy(this._delCharpter),
				openIsarpHistory : this.proxy(this._openIsarpHistory),
				openIsarpLink:this.proxy(this._openIsarpLink),
				ismItemReport:this.proxy(this._ismItemReport),
				addExplain:this.proxy(this._addExplain),
				sendMessage:this.proxy(this._sendMessage),
				auditFinish:this.proxy(this._auditFinish),
				delAction:this.proxy(this._delAction),
				queryAction:this.proxy(function(id){
					 this._queryAction(id);
				}),
				queryDocument:this.proxy(function(id){
					 this._queryIsarpDocuments(id);
				}),
				queryLog:this.proxy(function(id){
					this._queryLog(id);
				}),
				queryIsarp:this.proxy(function(id){
					this._queryIsarp(id);
				}),
				logShow:this.proxy(function(e){
					this.on_togglePanel_click(e)
				}),
				
			}
		});
		 parent.isarpvue=this.isarpvue;
		 
		 if (typeof(this.sectionName)!='undefined' && typeof(this.chapter)!='undefined' && 
				 this.sectionName!='undefined' && this.chapter!='undefined') {
			 //另外一种传参途径。先去查询获得isarpId和sectionId
			 var that=this;
			 async.waterfall([
					function (cb) {that._queryBySectionChapter(cb); },
					function(lastParam, cb) {that._otherInit(lastParam, cb) },
				], function (err, result) {
					// log('1.1 err: ', err);
				} );
		 } else {
			this._otherInit0(this.isarpId);
		 }
		
        
   },
  
   _queryBySectionChapter : function(cb) {
		var data = {
			"method" : "queryIsarpIdBySectionChapter",
			"sectionName" : this.sectionName,
			"chapter" : this.chapter,
			"reportId" : this.reportId
		};
		myAjaxQuery(data, null, this.proxy(function(param, response) {
			if (response.success) {
	//			this.isarpId = response.isarpId;
	//			this.sectionId = response.sectionId;
				param[0].cb(null, {
					'isarpId' : response.isarpId,
					'sectionId' : response.sectionId
				});
			} else {
				param[0].cb('Not get isarpId!', null);
			}
		}, {'cb':cb})); // myAjax
   },
 
   _otherInit: function(lastParam, cb) {
	   this.isarpId = lastParam.isarpId;
	   this.sectionId = lastParam.sectionId;
	   this._otherInit0(this.isarpId);
       cb(null);
   },

   _otherInit0: function(id) {
       // 查询isarp
       this._queryIsarp(id);
      //查询action
      this._queryAction(id);
      //查询document
      this._queryIsarpDocuments(id);
      //查询Log
      if(this.logTable == null) this.logTable=new com.eiosa.log.eiosaIsarpOperateLog($("div[umid='actionLogTable']", this.$),{targetId:id});
     // this.logTable._queryTable(parseInt(id));
  },
  _queryLog:function(id){
	  this.logTable.reload(parseInt(id));
  },
  _queryIsarp : function(id){
	   var data= {
		   "method":"getIsarpFull",
		   "id":id
      };
	   
	   myAjaxQuery(data, $("#isarp"), this.proxy(function(response){
		   
		  if(response.success){
			  this.isarpvue.$set("isarpAll", response.data);
			  var text=this.isarpvue.isarpAll.isarp.text;
			   value=text.substr(0,11);
			  this.sectionName = this.isarpvue.isarpAll.sectionName;
			  $(document).attr('title', removeHtmlTab(this.isarpvue.isarpAll.isarp.text));              
				if(this.isarpLinkCheckUm != null) delete this.isarpLinkCheckUm;
				this.isarpLinkCheckUm = new com.eiosa.isarplink.isarpLink($("div[umid='isarpLinkCheck']",this.$),{reportId :this.reportId});
				Vue.nextTick( this.proxy(function() {
					this.isarpvue.$set("isarpAll.showIsarpLink", this.isarpLinkCheckUm.exists(this.sectionName,  this.isarpvue.isarpAll.isarp.no));
					//this.isarpvue.isarpAll.showIsarpLink = this.isarpLinkCheckUm.exists(this.sectionName,  this.isarpvue.isarpAll.isarp.no);
				}) );				
		  }}));	   
  },

   
   _saveIsarp : function() {
	var data = {
		"method" : "stdcomponent.update",
		"dataobject" : "isarp",
		"dataobjectid" : this.isarpvue.isarpAll.isarp.id,
		"obj" : JSON.stringify({
			assessment : parseInt(this.isarpvue.isarpAll.assessment),
			reason : this.isarpvue.isarpAll.isarp.reason,
			rootCause : this.isarpvue.isarpAll.isarp.rootCause,
			taken : this.isarpvue.isarpAll.isarp.taken,
			comments : this.isarpvue.isarpAll.isarp.comments
		})
	};
	
	myAjaxModify(data, $("#isarp"), this.proxy(function(response) {
		if (response.success) {
			$.u.alert.success("保存成功");
			this._queryLog(this.isarpvue.isarpAll.isarp.id);
		} else {
			$.u.alert.error("保存失败");
		}
	}));

		
	},
   _queryAction:function(id){
	   
	   var data= {
 	       		  "method":"queryActions",
 	       	      "id":id,
 	       	      "type":"queryByIsarpId"
            };
	   debugger
		   myAjaxQuery(data, $("#isarp"), this.proxy(function(response){
			  if(response.success){
				  this.isarpvue.$set('actionlist',response.ActionList)
				  /** Vue.nextTick(this.proxy(function() {
					   $(".actionText").tooltip({
			           		  html:true,
			           		  track: true,
			        		showURL: false,
			        		delay: 1000,
			        		top: 5,
			        		left: 5});
				   }));*/
				 
				  }
		   }));
		   

   },
   _queryIsarpDocuments : function(id) {
		var data = {
			"method" : "queryDocumentsByIsarp",
			"isarpId" : id
		};
		myAjaxQuery(data, $("#isarp"), this.proxy(function(response) {
			if (response.success) {
				this.isarpvue.$set('documentList', response.data.chapters)
			}
		}));
	},
   // 打开action页面
   _showAction:function(e){
	   var id=$(e.currentTarget).attr("data");
	   parent.layer.open({
	        type: 2,
	        title: 'AA编辑',
	        maxmin: false,
	        fix:false,
	        shadeClose: false, //点击遮罩关闭层
	        area : ['800px' , '600px'],
	        content: "/sms/uui/com/eiosa/audit/action.html?id="+ id+"&isarpId="+this.isarpId,
	        end:this.proxy(function(){
	        	this._queryAction(id)
	        })
	        
	    });
   },
   //打开isarpHistory
   _openIsarpHistory:function(e){
	   var id=$(e.currentTarget).attr("data");
	   var url="/sms/uui/com/eiosa/audit/auditEdit.html?id="+ id+"&sectionId="+this.sectionId+"&reportId="+this.reportId;
	   window.open(url);
   },
   _openIsarpLink:function(e){
	   e.preventDefault();
	   var url="/sms/uui/com/eiosa/isarplink/isarpLink-index.html?sourceSection="+this.sectionName+"&sourceNo="+this.isarpvue.isarpAll.isarp.no;
	   window.open(url);
   },
   
   _showDocument:function(e){
	   debugger
	   var id=$(e.currentTarget).attr("data");
	   var type=null;
	   
	   if(id==""){
		   type="addEixstDocument";
	   }else{
		   type="modifyDocument"
	   }
	   if (isNaN(id)||id==""||id==null) {
			this.isUpload=1;
		}else{
			this.isUpload=0;
		}	   
	   parent.layer.open({
			type: 2,
			title: '参考文件编辑',
			maxmin: false,
		    fix:false,
		    shadeClose: false, //点击遮罩关闭层
		    closeBtn: 0,
		    area : ['800px','600px'],
		    content: "/sms/uui/com/eiosa/document/docEdit-Isarp.html?docId="+id+"&type="+type+"&isarpId="+this.isarpId+"&reportId="+this.reportId+"&sectionId="+this.sectionId+"&isUpload="+this.isUpload
	   });
   },
   _downAttach:function(e){
	   var id=$(e.currentTarget).attr("data");
	   openAttach(id);
	   
   },
   _deleteAttach:function(e){
	   var index=$(e.currentTarget).attr("data");
	   deleteAttach(index)
   },
   
   
   _reAudit:function(){

   var layerindex=layer.confirm("ISARPs："+value+"即将开始重新审计，此操作无法撤销，请确认是否继续？", {
		    btn: ['确认','取消'] //按钮
		}, 
	
		this.proxy(function(){
			var data = {
					"method":"reAudit",
		       	      "isarpId":this.isarpId,
			}
			
			myAjaxModify(data, $("#isarp"), this.proxy(function(response) {
				if (response.success) {
					layer.close(layerindex);
					this.isarpId=response.data.isarpId;
					this._otherInit0(this.isarpId);
					this. _queryLog(this.isarpId);
					
					parent.eiosaMainUm.isarpStatusChange=true;
					
					$.u.alert.success("开始重新审计");
					
				} else {
					$.u.alert.error("重新审计失败");
				}
			}));
		}), function(){
			
		});	  
   },
   //导出报表
   _ismItemReport:function(){
	   var url="http://"+window.location.host+"/sms/query.do?" + "method=ismItemReport&tokenid="+$.cookie("tokenid")+"&isarpId="+this.isarpId +"&type=queryByIsarpId"+"";
	   window.open(url,'_blank');
	   },
   //添加说明
   _addExplain:function(){
	   operateType="addExplain";
	  this._openMessage(operateType);
	  
   },
   //发送消息
   _sendMessage:function(){
	   operateType="sendMessage";
	  this._openMessage(operateType);
   },
  _submitIsarp:function(){
	  operateType="submitIsarp";
	  //验证比填项
	 if(this._isValid()){
		this._openMessage(operateType);
	 }  
   },
   _isValid:function(){
		var result=false;
		if(this.isarpvue.isarpAll.assessment==null || this.isarpvue.isarpAll.assessment==""){
			layer.msg('Assessment不能为空');
			
		}else if(this.isarpvue.isarpAll.assessment==1){
			if(this.isarpvue.isarpAll.isarp.comments==null || this.isarpvue.isarpAll.isarp.comments==""){
				layer.msg('Auditor Comments不能为空');
			}else {
				result=true;
			}
		   
		}else if(this.isarpvue.isarpAll.assessment!=1){
			
			if(this.isarpvue.isarpAll.assessment!=8){
				if(this.isarpvue.isarpAll.isarp.reason==null || this.isarpvue.isarpAll.isarp.reason==""){
					layer.msg('Description of Nonconformity or Description of Reason for N/A不能为空');
				}else {
					if(this.isarpvue.isarpAll.isarp.rootCause==null || this.isarpvue.isarpAll.isarp.rootCause==""){
						layer.msg('Root Cause不能为空');
				       }else if(this.isarpvue.isarpAll.isarp.taken==null || this.isarpvue.isarpAll.isarp.taken==""){
				    	   layer.msg('Corrective Action Taken不能为空');
				       }else{
				    	   result=true;
				       }
			        }
			}else {
				if(this.isarpvue.isarpAll.isarp.reason==null || this.isarpvue.isarpAll.isarp.reason==""){
					layer.msg('Description of Nonconformity or Description of Reason for N/A不能为空');
				}else{
					result=true;
				}
			}
					   
		}
		
		return result;
	},
   _auditFinish:function(){
		  operateType="auditFinish";
		  this._openMessage(operateType);
		   
	   },
   _openMessage:function(type){
	   parent.layer.open({
	        type: 2,
	        title: '信息编辑',
	        maxmin: false,
	        fix:false,
	        shadeClose: false, //点击遮罩关闭层
	        area : ['600px' , '300px'],
	        content: "/sms/uui/com/eiosa/message/message.html?type="+ type+"&isarpId="+this.isarpId
	    });
   },
   _delCharpter:function(e){
	   var id=$(e.currentTarget).attr("data");
	   var layerindex=layer.confirm('是否确认删除？', {
		    btn: ['确认','取消'] //按钮
		}, this.proxy(function(){
			var data = {
					"method":"stdcomponent.delete",
					"dataobject":"chapter",
					"dataobjectids":JSON.stringify([id])
			}
			myAjaxModify(data,null , this.proxy(function(response) {
				layer.close(layerindex);
				this._queryIsarpDocuments(this.isarpId)
			}));
		}), function(){
			
		});	  
   },
   _delAction:function(e){
	   
	   var id=$(e.currentTarget).attr("data");
	   var layerindex=layer.confirm('是否确认删除？', {
		    btn: ['确认','取消'] //按钮
		}, this.proxy(function(){
			var data = {
					"method":"stdcomponent.delete",
					"dataobject":"isarpAction",
					"dataobjectids":JSON.stringify([id])
			}
			myAjaxModify(data,null , this.proxy(function(response) {
				layer.close(layerindex);
				this._queryAction(this.isarpId)
			}));
		}), function(){
			
		});	  
   },
   on_togglePanel_click: function(e){
       var $this = $(e.currentTarget);
      
       if($this.hasClass("fa-minus")){
           $this.removeClass("fa-minus").addClass("fa-plus");
           
       }
       else{
           $this.removeClass("fa-plus").addClass("fa-minus");
           this._queryLog(this.isarpId)
       }
       $this.closest(".panel-heading").next().toggleClass("hidden");
   },
           		
}, { usehtm: true, usei18n: false });

com.eiosa.audit.auditEdit.widgetjs = [
                           "../../../uui/vue.min.js",
                          "../../sms/losa/losa.js",
                          "../../../uui/tooltip/myTooltip.js",
                           "../../../uui/async/async.min.js",
                           "../../../uui/util/htmlutil.js",
                           "../base.js"];
com.eiosa.audit.auditEdit.widgetcss = [
                            { path: '../../../uui/tooltip/jquery.tooltip.css' },
                            { path: '../../../css/eiosa.css' },
                            ];