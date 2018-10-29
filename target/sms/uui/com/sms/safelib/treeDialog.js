//@ sourceURL=com.sms.safelib.treeDialog
$.u.define('com.sms.safelib.treeDialog', null, {
    init: function (options) {
        this._options = options||null;
    },
    afterrender: function (bodystr) {
    	this.form = this.qid("treeForm");
    	this.father = this.qid("father");
    	this.previous = this.qid("previous");
    	this.name = this.qid("name");
    	this.status = this.qid("status");
    	this.description = this.qid("description");
    	this.treeContent = this.qid("treeContent");
    	this.treeDialog = this.qid("div_treeDialog").dialog({
        	title:"添加条目",
            width:860,
            modal: true,
            draggable: false,
            resizable: false,
            autoOpen: false,
            open: this.proxy(function () {
            	// 填充表单
            	if(this._options.data){
            		this.fillFormData(this._options.data);
            	}
            }),
            close: this.proxy(function () {
            	// 清空表单
            	this.clearFormData();
            }),
            create: this.proxy(function () {
            	this.buildForm();
            })
        });
    	this.father.on("click",this.proxy(function(e){
			var offset = $(e.target).offset();
			this.treeContent.css({left:offset.left + "px", top:offset.top + $(e.currentTarget).outerHeight() + "px"}).slideDown("fast");
			$("body").bind("mousedown", this.proxy(this.onBodyDown));
    	}));
    },
    onBodyDown:function(e){
    	if (!(e.target.id == (this._id+"-tree") || e.target.id == (this._id+"-treeContent") || $(e.target).parents("#"+this._id+"-treeContent").length>0)) {
			this.treeContent.fadeOut("fast");
			$("body").unbind("mousedown", this.proxy(this.onBodyDown));
		}
    },
    open: function (params) {
    	this.status.val("未发布");
    	var dialogOptions = null;
    	this._options.data = params.data||{};
		dialogOptions = {
                title: params.data.mode==='edit' ? params.title : "添加条目",
                buttons: [
                          {
                              text: "确认",
                              click: this.proxy(function(){
                              	if(this.form.valid()){
                              		params.data.mode==='edit' ? this.modifyAjax() : this.sendAjax();
                              	}
                              })
                          },
                          {
                              text: "取消",
                              "class": "aui-button-link",
                              click: this.proxy(function () {
                                  this.treeDialog.dialog("close");
                              })
                          }
                      ]
        };
        this.treeDialog.dialog("option",dialogOptions).dialog("open");
    	//生成tree
    	this._getTree();
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
						if (perm.type == 1) {
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
						this.previous.select2("val","");
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
    buildForm:function(){
    	this.previous.select2({
            width: 250,
            placeholder: "请选择",
            allowClear: true,
            ajax: {
                url: $.u.config.constant.smsqueryserver,
                dataType: "json",
                type:"post",
                data: this.proxy(function (term, page) {
                    return {
                        tokenid: $.cookie("tokenid"),
                        method: "getDirectorys",
                        paramType: "getSubDirectorys",
                        directoryId:this.father.attr("value"),
                        searchKey:term,
                        start: (page - 1) * 5,
	    				length: 5
                    };
                }),
                results: function (data, page) {
                    if (data.success) {
                        return {
                            results: $.map(data.directoryData.aaData, function (group, idx) {
                                group.text = group.name;
                                return group;
                            }),more:page * 5 < data.directoryData.iTotalRecords
                        };
                    }
                }
            }
        });
    	this.form.validate({
            rules: {
                "father": "required",
                "name":"required"
            },
            messages: {
            	"name": {
            		"required":"条目标题不能为空"
            	},
            	"father":"所属章节不能为空"
            },
            errorClass: "text-danger text-validate-element",
            errorElement:"div"
        });
    },
    clearFormData:function(){
    	$(":text,textarea,select",this.form).val("");
    	this.previous.select2("val","");
    	this.form.validate().resetForm();
    },
    fillFormData:function(data){
        if(data.mode==="edit"){
        	$.each(data,this.proxy(function(name,value){
        		if(name=="father"){
        			$("[name='fatherId']",this.form).val(value.text).attr("value",value.id);
        		}
        		$("[name='"+name+"']",this.form).val(value);
        	}));
        	if(!!data.previous.id){
        		this.previous.select2("data",data.previous);
        	}else{
        		this.previous.select2("data",{"id":"",text:""});
        	};
        }else if(data.mode==="add"){
        	$("[name='fatherId']",this.form).val(data.name).attr("value",data.id);
        	this.previous.select2("data",{"id":"",text:""});
        };
    },
    sendAjax:function(){
		$.u.ajax({
			url : $.u.config.constant.smsmodifyserver,
			type : "post",
			dataType : "json",
			cache : false,
			data :$.extend({
				"tokenid" : $.cookie("tokenid"),
				"method" : "modifyDirectory",
				"paramType":"addDirectory"
			},this.getFormData("add")) 
		},this.treeDialog.parent()).done(this.proxy(function(response) {
			if (response.success) {
				this.treeDialog.dialog("close");
				var responseDirectoryId=response.directoryId;
				this.refresh(responseDirectoryId);
			} 
		})).fail(this.proxy(function(jqXHR, errorText, errorThrown) {

		}));
    },
    modifyAjax:function(){
    	$.u.ajax({
			url : $.u.config.constant.smsmodifyserver,
			type : "post",
			dataType : "json",
			cache : false,
			data :$.extend({
				"tokenid" : $.cookie("tokenid"),
				"method" : "modifyDirectory",
				"paramType":"updateDirectory",
				"directoryId":this._options.data.id
			},this.getFormData("edit")) 
		},this.treeDialog.parent()).done(this.proxy(function(response) {
			if (response.success) {
				this.treeDialog.dialog("close");
				var responseDirectoryId=response.directoryId;
				this.refresh(responseDirectoryId);
			} 
		})).fail(this.proxy(function(jqXHR, errorText, errorThrown) {

		}));
    },
    getFormData:function(mode){
    	var data = {};
    	$.each(this.form.serializeArray(),this.proxy(function(k,v){
    		if(v.name=="status"){
    			v.value=0;
    		}
    		data[v.name] = v.value;
    	}));
    	if(mode==='edit'){
    		data["fatherId"] = this.father.attr("value");
    	}else if(mode==='add') {
    		data["fatherId"] = this.father.attr("value");
    	}
    	return data;
    },
    refresh:function(responseDirectoryId){
    	
    },
    destroy: function () {
        this._super();
    }
}, { usehtm: true, usei18n: false });

com.sms.safelib.treeDialog.widgetjs = ['../../../uui/widget/select2/js/select2.min.js',
                                       "../../../uui/widget/spin/spin.js",
                                       "../../../uui/widget/jqblockui/jquery.blockUI.js",
                                       "../../../uui/widget/ajax/layoutajax.js"];
com.sms.safelib.treeDialog.widgetcss = [{id:"",path:"../../../uui/widget/select2/css/select2.css"},{id:"",path:"../../../uui/widget/select2/css/select2-bootstrap.css"}];