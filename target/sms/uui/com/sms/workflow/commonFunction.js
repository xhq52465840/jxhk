//@ sourceURL=com.sms.workflow.commonFunction
$.u.define('com.sms.workflow.commonFunction', null, {
    init: function (options) {
		/*
	    {
	    	title:"",					// 标题
	    	description:"",				// 描述
	    	subtitles:["","",""],		// 3个步骤的标题
	    	buttontitles:["",""],		// 按钮的标题
	    	type:"",					// 获取FunctionList服务的过滤字段
	    	save:function(){},			// 保存的回调函数
	    	data:[]						// 已有功能列表
	    }
	    */
        this._options = options;
    },
    afterrender: function (bodystr) {
    	this.i18n = com.sms.workflow.commonFunction.i18n;
    	// 系统功能表格
    	this.systemFunctionsTable=this.qid("system-functions");
    	
    	// 已使用功能表格
    	this.existFunctionsTable=this.qid("exist-functions");
    	
    	// 添加已选中的功能
    	this.btnAddSelectedFunction=this.qid("btn_addSelectedFunction");
    	
    	// 删除已选中的功能
    	this.btnRemoveSelectedFunction=this.qid("btn_removeSelectedFunction");
    	
    	this.qid("description").html(this._options.description);
    	this.qid("first-title").text(this._options.subtitles[0]);
    	this.qid("second-title").text(this._options.subtitles[1]);
    	this.qid("third-title").text(this._options.subtitles[2]);
    	this.btnAddSelectedFunction.text(this._options.buttontitles[0]);
    	this.btnRemoveSelectedFunction.text(this._options.buttontitles[1]);
    	
    	// 绑定“添加已选中功能”事件
    	this.btnAddSelectedFunction.click(this.proxy(function(){
    		var $radio = this.systemFunctionsTable.find(":radio:checked");
    		if($radio.length >0){
    			var $tr = $radio.parents("tr:first")
    			if(this.existFunctionsTable.find("tr[dataid='"+$tr.attr("dataid")+"']").length<1){
	    			var $newTr = $tr.clone(true).appendTo(this.existFunctionsTable.children("tbody"));
	    			$newTr.find(":radio").prop("checked",false).attr("name","existfunction");
	    			$newTr.trigger("click");
    			}else{
    				alert(this.i18n.functionHasExist);
    			}
    		}else{
    			alert(this.i18n.chooseFunction)
    		}
    	}));
    	
    	// 绑定“删除已选中功能”事件
    	this.btnRemoveSelectedFunction.click(this.proxy(function(){
    		var $radio = this.existFunctionsTable.find(":radio:checked");
    		if($radio.length>0){
    			this.compModule && this.compModule.destroy && this.compModule.destroy();
    			$radio.parents("tr:first").fadeOut(function(){
    				$(this).remove();
    			})
    		}else{
    			alert(this.i18n.chooseFunction)
    		}
    	}));
    	
    	// 系统功能列表的行点击事件
    	this.systemFunctionsTable.off("click","tr").on("click","tr",this.proxy(function(e){
    		var $tr = $(e.currentTarget);
    		$tr.find(":radio").prop("checked",true);
    	}));
    	
    	// 已存在功能列表的行点击事件
    	this.compModule=null;
    	this.existFunctionsTable.off("click","tr").on("click","tr",this.proxy(function(e){
    		var $tr = $(e.currentTarget),
    			module=$tr.data("data").umodule,
    			$oldSelectedRadio=this.existFunctionsTable.find(":radio:checked");
    		if($oldSelectedRadio.length > 0 && this.compModule){
    			var $oldTr=$oldSelectedRadio.parents("tr:eq(0)"),
    				data = $oldTr.data("data");
    			data.value=this.compModule.getData();
    			$oldTr.data("data",data);
    		}
    		
    		$tr.find(":radio").prop("checked",true);
    		if(this.compModule && "destroy" in this.compModule){
    			this.compModule.destroy();
    			this.compModule = null;
    		}
    		if(module){ // 有没有前端组件的情况
    			compClaz =  $.u.load(module);
            	this.compModule = new compClaz({data:$tr.data("data").value,save:this.proxy(function(comp,data){
            	})});
            	this.compModule.target($("div[umid='container']",this.validatorDialog));
            	this.compModule.parent(this);
    		}
    	}));
    	
    	this.functionDialog=this.qid("function-dialog").dialog({
    		title:this._options.title,
    		width:950,
    		height:630,
    		resizable:false,
    		draggable: false,
    		autoOpen:true,
    		modal:true,
    		buttons:[
		        {
		        	text:this.i18n.save,
		        	click:this.proxy(function(e){
		        		if(this._options.save && typeof this._options.save == "function"){
		        			this.existFunctionsTable.find("tr:eq(0)").trigger("click");
		        			this._options.save(this,this.getData());
		        		} else{
		        			this.functionDialog.dialog("close");
		        		}
		        	})
		        },
		        {
		        	text:this.i18n.cancel,
		        	"class":"aui-button-link",
		        	click:this.proxy(function(){
		        		this.functionDialog.dialog("close");
		        	})
		        }
    		],
    		create:this.proxy(function(){
    			this.loadSystemValidators();
    			this._options.data && this.fillData(this._options.data);
    		}),
    		open:this.proxy(function(){
    			
    		}),
    		close:this.proxy(function(){
    			this.destroy();
    		})
    	});
    },
    /*
     * 加载系统功能集合
     */
    loadSystemValidators:function(){
    	$.u.ajax({
    		url:$.u.config.constant.workflowserver,
    		type:"post",
    		data:{
	    		"sv":"FunctionList",
	    		"user_id":$.cookie("userid"),
	    		"tokenid":$.cookie("tokenid"),
	    		"order":"showname",
	    		"page_size":50,
	    		"where":"type='"+this._options.type+"'"
	    	},
    		dataType:"json"
    	},this.systemFunctionsTable.parent()).done(this.proxy(function(response){
            if(response.success !== false){
        		if(response.responseHeader && response.responseHeader.status == 0){
        			$.each(response.responseData.list,this.proxy(function(idx,item){
        	    		$('<tr dataid="'+item.id+'">'+
        	    				'<td style="width:10px;"><input name="systemvalidator" type="radio"/></td>'+
        						'<td>'+item.showname+'</td>'+
        	    		  '</tr>').data("data",item).appendTo(this.systemFunctionsTable.find("tbody"));
        	    	}));
        		}else{
        			$.u.alert.error(response.responseHeader.msg);
        		}
            }
    	})).fail(this.proxy(function(jqXHR,errorText,errorThrown){
    		
    	}));
    },
    /*
     * 填充功能数据集合
     */
    fillData:function(data){
    	$.each(data,this.proxy(function(idx,item){
    		$('<tr dataid="'+item.id+'">'+
    				'<td style="width:10px;"><input name="existfunction" type="radio"/></td>'+
					'<td>'+item.showname+'</td>'+
    		  '</tr>').data("data",item).appendTo(this.existFunctionsTable.find("tbody"));
    	}));
    },
    /*
     * 获取功能数据集合
     */
    getData:function(){
    	var data = [];
    	$.each(this.existFunctionsTable.find("tr"),function(){
    		data.push($(this).data("data"));
    	});
    	return data;
    },
    destroy: function () {
        this.functionDialog.dialog("destroy").remove();
        this._super();
    }
}, { usehtm: true, usei18n: true });


com.sms.workflow.commonFunction.widgetjs = ["../../../uui/widget/spin/spin.js",
                                            "../../../uui/widget/jqblockui/jquery.blockUI.js",
                                            "../../../uui/widget/ajax/layoutajax.js"];
com.sms.workflow.commonFunction.widgetcss = [];