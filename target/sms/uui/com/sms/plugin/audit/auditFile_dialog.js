//@ sourceURL=com.sms.plugin.audit.auditFile_dialog
$.u.define('com.sms.plugin.audit.auditFile_dialog', null, {
    init: function (options) {
    	
    },
    afterrender: function (bodystr) {
    	this.form=this.qid("form");
    	this.fileType=this.qid("fileType");
    	this.father = this.qid("father");
    	this.treeContent = this.qid("treeContent");
    	this.formDialog = this.qid("dialog").dialog({
            title:"添加附件类型",
            width: 600,
            minHeight: 500,
            position: ["center", 150],
            modal: true,
            draggable: false,
            resizable: false,
            autoOpen: false,
            buttons:[
				{
					"text":"确定",
					"class":"audit_ok",
					"click":this.proxy(this.on_ok_click)
				},
                {
                	"text":"取消",
                	"class":"audit_cancel",
                	"click":this.proxy(this.on_cancel_click)
                }
            ],
            create:this.proxy(this.on_formDialog_create),
            open:this.proxy(this.on_formDialog_open),
            close:this.proxy(this.on_formDialog_close)
        });
    	this.father.on("click",this.proxy(function(e){
			var offset = $(e.target).offset();
			this.treeContent.css({left:offset.left-420 + "px",
				                  top: $(e.currentTarget).outerHeight() + "px",
				                  height:300+'px'
				                  }).slideDown("fast");
			$("body").bind("mousedown", this.proxy(this.onBodyDown));
    	}));
    },
    onBodyDown:function(e){
    	if (!(e.target.id == (this._id+"-tree") || e.target.id == (this._id+"-treeContent") || $(e.target).parents("#"+this._id+"-treeContent").length>0)) {
			this.treeContent.fadeOut("fast");
			$("body").unbind("mousedown", this.proxy(this.onBodyDown));
		}
    },
    on_formDialog_create:function(){
	   this.fileType.select2({
           width: '100%',
           multiple: false,
           ajax: {
               url: $.u.config.constant.smsqueryserver,
               dataType: "json",
               type: "post",
               data: this.proxy(function(term, page) {
                   return {
                       tokenid: $.cookie("tokenid"),
                       method: "getFileTypes",
                       term:term
                   };
               }),
               results: this.proxy(function(response, page, query) {
                   if (response.success) {
                	   $.each(response.data,function(index,item){
                		   response.data[index].id=response.data[index].code;
                		   response.data[index].name=response.data[index].comment;
                	   });
                	   return { 
                           results: response.data,
                       }
                   } else {
                       $.u.alert.error(response.reason, 1000 * 3);
                   }
               })
           },
           formatResult: function(item) {
               return  item.name;
           },
           formatSelection: function(item) {
               return  item.name;
           }
       
  })
    },
    _getTree:function(){
    	var treeNodes=[];
	    $.ajax({
	    	url:$.u.config.constant.smsqueryserver,
	        type:"post",
	        dataType: "json",
	        cache: false,
	        async:false,
	        data: {
	        	"tokenid":$.cookie("tokenid"),
	    		"method":"getDirectorys",
	    		"paramType":"getAllDirectorys"
	        }
	    }).done(this.proxy(function(responseData){
	    	if(responseData.success){
				if(responseData){
					treeNodes = $.map(responseData.directoryData.aaData,function(perm,idx){
						if (perm.type !== 1) {
							return {id : perm.id,pId : perm.fatherId,name : perm.name};
						}
        			});
				}
	    	}
	    })).fail(this.proxy(function(jqXHR,errorText,errorThrown){
	    	
	    }));
    	var setting = {
    			data: {
    				simpleData: {
    					enable: true
    				}
    			},
    			callback: {
    				beforeClick:this.proxy(function(treeId, treeNode, clickFlag){
						this.father.val(treeNode.name);
						this.father.attr("value",treeNode.id);
						this.treeContent.fadeOut("fast");
    				})
    			},
    		};
    	this.tree = $.fn.zTree.init(this.qid("tree"), setting,treeNodes);
    	var nodes = this.tree.getNodes();
    	$.each(nodes,this.proxy(function(idx,node){
    		if(node.parentTId==null){
    			this.tree.expandNode(node, true, false, true);
    		}
    	}));
    	
    },
    open:function(param){
        if(param && param.mode=='edit'){
             this.formDialog.dialog("option", {title:"编辑附件类型"});
	        var data=param.data;
	        this.objId=data.id;
	        this.father.val(data.directory).attr("value",data.directoryId);
	        this.fileType.select2("data",{id:data.fileType.id,name:data.fileType.comment});
         };
         this.formDialog.dialog("open");
         //生成树
         this._getTree();
    },
    /**
     * @title 确定事件
     */
    on_ok_click:function(param){
    	this.form = this.qid("form");
        if(this.form.valid()){
        	if(this.objId){
        		this.fresh_edit(this.getFormData(),this.objId);	
        	}else{
        		this.fresh(this.getFormData());	
        	}
        };
    },
    /**
     * @title 获取数据
     */
    getFormData:function(){
    	return {
    		     directory:Number(this.father.attr("value")),
    		     fileType:this.fileType.select2("val")
    		    };
    },
    /**
     * @title 刷新数据，增加提交
     */
    fresh:function(param){
    	var FormData=this.getFormData();
   },
   /**
    * @tilte 编辑提交
    */
	   fresh_edit:function(param){
	   	var FormData=this.getFormData();
	  },
    /**
     * @title  取消事件
     */
    on_cancel_click:function(){
    	this.formDialog.dialog("close");
    },
    refresh: function(data){
    	
    },
    /**
     * @title 清空表单
     */
    on_formDialog_close:function(){
    $(":text,textarea,select",this.form).val("");
    	this.fileType.select2("data",null);
    }
}, { usehtm: true, usei18n: false });

com.sms.plugin.audit.auditFile_dialog.widgetjs = ["../../../../uui/widget/uploadify/jquery.uploadify.js",
										"../../../../uui/widget/select2/js/select2.min.js",
                                        "../../../../uui/widget/spin/spin.js", 
                                        "../../../../uui/widget/jqblockui/jquery.blockUI.js",
                                        "../../../../uui/widget/ajax/layoutajax.js",
                                        "../../../../uui/widget/jqztree/js/jquery.ztree.all-3.5.js",
										];
com.sms.plugin.audit.auditFile_dialog.widgetcss = [
                                       { path: "../../../../uui/widget/select2/css/select2.css" }, 
                                       { path: "../../../../uui/widget/select2/css/select2-bootstrap.css" },
							            {path:"../../../../../uui/widget/uploadify/uploadify.css"},
                                        {id:"ztreestyle",
							            path:"../../../../uui/widget/jqztree/css/zTreeStyle/zTreeStyle.css"}
										            ];
