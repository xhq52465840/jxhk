//@ sourceURL=com.sms.workflow.property
$.u.define('com.sms.workflow.property', null, {
    init: function (options) {
	    /*
	     {
	     	data:[], // 属性集合
	     	save:function(comp,data){} // 保存事件
	     }
	     */
        this._options = options;
    },
    afterrender: function (bodystr) {
    	this.i18n = com.sms.workflow.property.i18n;
    	// table
    	this.table=this.qid("table");
    	
    	// 属性键
    	this.key=this.qid("key");
    	
    	// 属性值
    	this.value=this.qid("value");
    	
    	// “增加”按钮
    	this.btnAdd=this.qid("btn_add");
    	
    	//"删除"事件
    	this.table.off("click","a.remove").on("click","a.remove",function(){
    		$(this).parent().parent().fadeOut(function(){
    			$(this).remove();
    		});
    	});
    	
    	// 绑定“增加”事件
    	this.btnAdd.click(this.proxy(function(){
    		var valid = true;
    		if(!$.trim(this.key.val())){
    			this.key.parent().addClass("has-error");
    			valid=false;
    		}else{
    			if(this.table.find("td[key='"+this.key.val()+"']").length>0){
    				this.key.parent().addClass("has-error");
    				valid=false;
    			}else{
    				this.key.parent().removeClass("has-error");
    			}
    		}
    		if(!$.trim(this.value.val())){
    			this.value.parent().addClass("has-error");
    			valid=false;
    		}else{
    			this.value.parent().removeClass("has-error");
    		}
    		if(!valid) return;
    		$("<tr><td key='"+this.key.val()+"'>"+this.key.val()+"</td><td>"+this.value.val()+"</td><td><a href='#' class='remove'>删除</a></td></tr>").appendTo(this.table.children("tbody"));
    		this.key.add(this.value).val("");
    	}));
    	
    	this.propertyDialog=this.qid("property-dialog").dialog({
    		title:this.i18n.attribute,
    		width:700,
    		height:550,
    		resizable:false,
    		draggable: false,
    		autoOpen:true,
    		modal:true,
    		buttons:[
		        {
		        	text:this.i18n.save,
		        	click:this.proxy(function(e){
		        		if(this._options.save && typeof this._options.save == "function"){
		        			this._options.save(this,this.getData());
		        		} else{
		        			this.propertyDialog.dialog("close");
		        		}
		        	})
		        },
		        {
		        	text:this.i18n.cancel,
		        	"class":"aui-button-link",
		        	click:this.proxy(function(){
		        		this.propertyDialog.dialog("close");
		        	})
		        }
    		],
    		create:this.proxy(function(){
    			// 如果有属性集合则调用填充表格方法
    	    	this._options.data ? this.fillData(this._options.data) : null;
    		}),
    		open:this.proxy(function(){
    			
    		}),
    		close:this.proxy(function(){
    			this.destroy();
    		})
    	});
    	
    	
    	
    },
    /*
     * 将属性集合填充到表格中
     */
    fillData:function(data){
    	$.each(data,this.proxy(function(idx,property){
    		$("<tr><td  class='break-word' key='"+property.key+"'>"+property.key+"</td><td class='break-word'>"+property.value+"</td><td>"+(property.readOnly !== true ? "<a href='#' class='remove'>"+this.i18n.remove+"</a>" : "")+"</td></tr>").appendTo(this.table.children("tbody"));
    	}));
    },
    /*
     * 获取属性集合
     */
    getData:function(){
    	var data=[];
    	this.table.find("tbody tr").each(function(){
    		data.push({"key":$(this).children("td:eq(0)").text(),"value":$(this).children("td:eq(1)").text()});
    	});
    	return data;
    },
    destroy: function () {
        this.propertyDialog.dialog("destroy").remove();
        this._super();
    }
}, { usehtm: true, usei18n: true });


com.sms.workflow.property.widgetjs = [];
com.sms.workflow.property.widgetcss = [];