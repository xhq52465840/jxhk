//@ sourceURL=com.audit.notice.distributionInfo
$.u.define('com.audit.notice.distributionInfo', null, {
	//待验证项目单条点击弹出的dialog
    init: function (option) {
    	this._option = option || {};
    	$.validator.addMethod( "compareNowDate", function( value, element, params ){
            if(value){
                value = new Date(value);
                value= value.getTime()+1000*60*60*24;
            	  value = new Date(value);
                now   = new Date();
                return value-now >= 0;
            }
            else{
                return false;
            }
        }, "日期必须晚于今天");
    },
    afterrender: function () {
    	this.form = this.qid("form");
    	this.table = this.qid("table");
    	this.traceFlowStatus = this.qid("traceFlowStatus");
    	this.createDialog();
    	this._tree = this.qid("tree");
    	this.treeContent=this.qid("treeContent");
    	this.unitconfirmMan=this.qid("confirmMan");
    	//this.unitconfirmMan.bind("keyup", this.proxy(this.onBodyDown));
    	this.unitconfirmMan.bind("keyup", this.proxy(this.onBodyDown));
    	this.unitconfirmMan.on("click",this.proxy(function(e){
    		this._pgetTree(this.unitconfirmMan.val());
			var offset = $(e.target).offset();
			var width = this.unitconfirmMan.width();
			this.treeContent.css("width",width+"px");
			this.treeContent.css({left:offset.left + "px", top:(offset.top + $(e.currentTarget).outerHeight() - 210) + "px"}).slideDown("fast");
			$(document).bind('click', this.proxy(this.onBody_click));
	 	}));
    	this.treeContent.on("click",".chk",this.proxy(this.checkbox_click));
    },
    checkbox_click:function(e){
    	this.checkedNode = this.tree.getCheckedNodes(true);
		var arry=[],idxyz=[];
		$.each(this.checkedNode,function(idx,item){
			arry.push(item.name);
			idxyz.push(item.id);
		})
		this.unitconfirmMan.val(arry.join(",").toString());
		this.unitconfirmMan.attr("value",idxyz.join(",").toString());
    },
    onBody_click:function(e){
    	if($(e.target).closest("div").attr("qid") != "treeContent" && $(e.target).attr("qid") != "confirmMan"){
    		this.treeContent.fadeOut("fast");
    		$(document).unbind('click', this.proxy(this.onBody_click));
    	}
    	this.unitconfirmMan.focus();
    },
    onBodyDown:function(e){
    	this.unitconfirmMan.trigger("click");
    },
    _pgetTree:function(term){
    	var treeNodes=[];
	    $.ajax({
	    	url:$.u.config.constant.smsqueryserver,
	        type:"post",
	        dataType: "json",
	        cache: false,
	        async:false,
	        data: {
	        	"tokenid":$.cookie("tokenid"),
	    		"method":"getImproveNoticeConfirmMan",
	    		"improveNoticeId":((this._option.data.improveNoticeId == undefined ? this._option.data.improveNotice :this._option.data.improveNoticeId) + ""),
	    		"term":term
	        }
	    }).done(this.proxy(function(data){
	    	if(data.success){
	    		this.qid("treeContent").show();
	    		if(data.data){
					treeNodes = $.map(data.data,this.proxy(function(perm,idx){
						return {
							id:perm.unitId||perm.userId,
							pId:perm.parentId, 
							name:perm.unitName||perm.userfullname,
							chkDisabled:perm.unitId?true:false, 
							noselect: perm.unitId?true:false
						};
					}));
				}
	    	}
	    })).fail(this.proxy(function(jqXHR,errorText,errorThrown){
	    	
	    }));
    	var setting = {
   			 check: {  
   				 enable: true,  
   				 chkstyle:"checkbox",
   				chkboxType : { "Y" : "ps", "N" : "ps" },
   				selectdMulti : false  
   	            },
    			 view: {  
    			    showLine : true,                  //是否显示节点间的连线  
        			checkable : true,                  //每个节点上是否显示 CheckBox  
   	               // showIcon: showIconForTree,  
    	            dblClickExpand: true  
    	            },
    			data: {
    				simpleData: {
    					enable: true
    				}
    			},
    			callback: {
    				/*onClick : this.proxy(function(treeId, treeNode, clickFlag){
    					this.checkedNode = this.tree.getCheckedNodes(true);
    					var arry=[],idxyz=[];
    					$.each(this.checkedNode,function(idx,item){
    						arry.push(item.name);
    						idxyz.push(item.id);
    					})
    					arry.join(",");
    					idxyz.join(",");
    					this.unitconfirmMan.val(arry);
    					this.unitconfirmMan.attr("value",idxyz);
						this.treeContent.fadeOut("fast");
       				})*/
    			}
    		};
    	this.tree = $.fn.zTree.init(this.qid("tree"), setting,treeNodes);
    	var nodes = this.tree.getNodes();
    	$.each(nodes,this.proxy(function(idx,node){
    		if(node.parentTId==null){
    			this.tree.expandNode(node, true, false, true);
    		}
    	}));
    },
    onBodyDown:function(e){
    	this.unitconfirmMan.trigger("click");
    },
    createDialog : function(){
    	this.isuContentDialog = this.qid("isuContent").dialog({
			width: 660,
			modal: true,
			resizable: false,
			autoOpen: false,
			open : this.proxy(this.on_isuContent_open),
			create: this.proxy(this.on_isuContent_create),
			close: this.proxy(this.on_isuContent_close)
    	});
    },
    on_isuContent_open : function(){
    	
    },
    on_isuContent_close : function(){
    	this.form.find("textarea,input").val("");
    	//this.confirmMan.select2("data","");
    	this.traceFlowStatus.select2("data","");
    	this.form.validate().resetForm();
    },
    on_isuContent_create : function(){
		this.table.find('input.date').datepicker({ dateFormat: "yy-mm-dd" });
    	/*this.confirmMan=this.qid("confirmMan").select2({
            placeholder: "",
            multiple:true,
            allowClear: true,
            ajax: {
                url: $.u.config.constant.smsqueryserver,
                dataType: "json",
                type: "post",
                data: function (term, page) {
                    return {
                        tokenid: $.cookie("tokenid"),//this._option.data.improveNoticeId
                        method: "stdcomponent.getbysearch", //getImproveNoticeConfirmMan
                        dataobject: "user",         //improveNoticeId
                        rule:JSON.stringify([[{"key":"username","value":term,"op":"like"},{"key":"fullname","value":term,"op":"like"}]]),
                        start: (page - 1) * 10,
	    				length: 10
                    };
                },
                results: function (data, page) {
                    if (data.success) {
                        return {
                            results: $.map(data.data.aaData, function (user, idx) {
                                user.text = user.username + "(" + user.fullname + ")";
                                return user;
                            }),
                            more:page * 10 < data.data.iTotalRecords
                        };
                    }
                }
            }
        });*/
    	this.traceFlowStatus.select2({
    		placeholder: "请选择...",
    		allowClear : true,
    		minimumResultsForSearch : -1,
    		ajax:{
 	        	url: $.u.config.constant.smsqueryserver,
 	        	type: "post",
 	            dataType: "json",
 	        	data: this.proxy(function(term, page){
 	        		return {
 		    			"tokenid":$.cookie("tokenid"),
 		    			"method":"getImproveNoticeIssueTraceStatus"
 	        		};
 	    		}),
 		        results:function(data,page){
 		        	if(data.success){
 		        		return { results: data.data };
 		        	}
 		        }
 	        },
 	        formatResult: function(item){
 	        	return item.name;      		
 	        },
 	        formatSelection: function(item){
 	        	return item.name;	        	
 	        }
       });
    	var rules = {};
    	if(this._option.required){
    		var required = this._option.required.split(",");
    		required && $.each(required, this.proxy(function(idx,obj){
    			var $obj = $('[qid='+obj+']');
    			$("<span class='text-danger'>*</span>").appendTo($obj.parent().prev());
    			rules[obj] = "required";
    			if(obj=="confirmDeadLine"){
    				rules[obj] = {
    						 required: true,
                             date: true,
                             dateISO: true,
                             compareNowDate:""
        				}
    			}
    		}));
    	}
    	if(this._option.canModify){
    		this._option.canModify = this._option.canModify.split(",");
    		this._option.canModify && $.each(this._option.canModify, this.proxy(function(idx,obj){
    			if(obj == "confirmMan" || obj === "traceFlowStatus"){
    				if(obj == "confirmMan"){
    					this.qid(obj).removeAttr("disabled");
    				}else{
    					this[obj].select2("enable", true);
    				}
    			}else{
    				var $obj = $('[qid='+obj+']');
        			$obj.removeAttr("disabled");
    			}
    		}));
    	}
    	if(this._option.deleted){
    		var deleted = this._option.deleted.split(",");
    		deleted && $.each(deleted, this.proxy(function(idx,obj){
    			var $obj = $('[qid='+obj+']'),$parent = $obj.parent();
    			if($parent.siblings().length == 1){
    				$parent.parent().remove();
    			}else{
    				$parent.prev().remove();
    				$parent.remove();
    			}
    		}));
    	}
    	if(this._option.data){ //confirmSuggestion confirmDeadLine
    		this._option.data && $.each(this._option.data, this.proxy(function(idx,value){
				if(idx === "confirmMan"){
					var a = [], b = [];
					value && $.each(value, function(k, v){
						a.push(v.id);
						b.push(v.text.split("(")[0]);
					});
					this.form.find('[name='+idx+']').val(b.join(",").toString());
					this.form.find('[name='+idx+']').attr("value",a.join(",").toString());
				}else{
					this.form.find('[name='+idx+']').val(value);
					if(this._option.data.type && this._option.data.type=="multi" && (idx=="confirmSuggestion" || idx=="confirmDeadLine")){
						this.form.find('[name='+idx+']').val("");
					}
				}
			}));
	    	
	    }
    	this.form.validate({
            rules: rules,
            messages: {
            	issueContent:"存在问题不能为空",confirmSuggestion:"分派建议不能为空",completionStatus:"完成情况不能为空",confirmMan:"验证人不能为空",
            	confirmDeadLine:{
                    required: "验证截止日期不能为空",
                    date: "无效日期",
                    dateISO: "无效日期",
                    compareNowDate:"所选时间不得早于今天 "
                },traceFlowStatus:"验证结论不能为空",confirmDate:"验证日期不能为空"
            },
            errorClass: "text-danger text-validate-element",
            errorElement:"div"
        });
    },
    open : function(){
    	this.isuContentDialog.dialog("option",{
    		title:this._option.title,
    		buttons:this._option.buttons
    	}).dialog("open");
    },
    getFormData : function(){
    	var data = {};
    	$.each(this.form.serializeArray(),this.proxy(function(idx,obj){
    		if($.inArray(obj.name,this._option.canModify) > -1){
    			data[obj.name] = obj.value;
    		}
    	}));
    	return data;
    }
}, { usehtm: true, usei18n: false });

com.audit.notice.distributionInfo.widgetjs = [
                                      "../../../uui/widget/spin/spin.js", 
                                      "../../../uui/widget/jqurl/jqurl.js",
                                      "../../../uui/widget/jqblockui/jquery.blockUI.js",
                                      "../../../uui/widget/ajax/layoutajax.js",
                                      '../../../uui/widget/jqztree/js/jquery.ztree.all-3.5.js',
                                      "../../../uui/widget/select2/js/select2.min.js"];
com.audit.notice.distributionInfo.widgetcss = [{id:"",path:"../../../uui/widget/select2/css/select2.css"},
                                               { id:"",path: '../../../uui/widget/jqztree/css/zTreeStyle/zTreeStyle.css'},
                                       {id:"",path:"../../../uui/widget/select2/css/select2-bootstrap.css"}
                                       ];