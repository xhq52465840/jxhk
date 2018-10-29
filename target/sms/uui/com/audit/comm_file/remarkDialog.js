//@ sourceURL=com.audit.comm_file.remarkDialog
$.u.define('com.audit.comm_file.remarkDialog', null, {
    init: function (option) {
    	this._options = option;
    	this.data = null;
    },
    afterrender: function (bodystr) {
    	this.form=this.qid("form"); 				  			// 表单
    	this.author = this.qid("author");			  			// 作者
    	this.createdate = this.qid("createdate");	  			// 创作日期
    	this.updateauthor = this.qid("updateauthor"); 			// 编辑人
    	this.updatedate = this.qid("updatedate");	  			// 编辑时间
    	this.updatecontainer = this.$.find("div.updateinfo");	// 编辑信息容器
    	this.remark = this.qid("remark");			  			// 备注
    	this.formDialog = this.qid("dialog").dialog({
            title:"编辑备注",
            width:740,
            modal: true,
            draggable: false,
            resizable: false,
            autoOpen: false,
            buttons:[
                {
                	"text":"保存",
                	"click":this.proxy(this.on_formDialogSave_click)
                },
                {
                	"text":"取消",
                	"class":"aui-button-link",
                	"click":this.proxy(this.on_formDialogCancel_click)
                }
            ],
            open:this.proxy(this.on_formDialogOpen_click),
            close:this.proxy(this.on_formDialogClosed_click)
        }); 
    	
    },
    /**
     * @title 保存
     * @return void
     */
    on_formDialogSave_click:function(){
    	if(this._validForm()){
    		$.u.ajax({
                url: $.u.config.constant.smsmodifyserver,
                type: "post",
                dataType: "json",
                data: {
                    "tokenid": $.cookie("tokenid"),
                    "method": "stdcomponent.update",
            		"dataobject": "auditAction",
            		"dataobjectid": this.data.id,
            		"obj": JSON.stringify(this._getData())
                }
            }, this.formDialog.parent(),{size:2}).done(this.proxy(function (result) {
                if (result.success) {
                    this.refreshDataTable();
                	this.formDialog.dialog("close");
                }
            })).fail(this.proxy(function (jqXHR, errorText, errorThrown) {
            	
            }));
    	}
    },
    /**
     * @title 取消
     * @return void
     */
    on_formDialogCancel_click:function(){
    	this.formDialog.dialog("close");
    },
    /**
     * @title 模态层中打开执行
     * @return void 
     */
    on_formDialogOpen_click:function(){
    	this._fillForm(this.data);
    },
    /**
     * @title 模态层关闭执行
     * 
     */
    on_formDialogClosed_click:function(){
    	this._clearForm();
    	//this.destroy();
    },
    /**
     * @title 填充表单
     * @param {object} data 备注json数据
     * @return void
     */
    _fillForm:function(data){
    	this.author.attr("href",this.getabsurl("../../sms/ViewProfile.html?id=")+data.userId).text(data.fullname + "(" + data.username + ")");
    	this.createdate.text(data.created);
    	this.remark.val(data.body);
    	if(data.updatedAuthor){
        	this.updateauthor.attr("href",this.getabsurl("../../sms/ViewProfile.html?id=")+data.updatedAuthorId).text(data.updatedAuthor);
        	this.updatedate.text(data.lastUpdate);
        	this.updatecontainer.removeClass("hidden");
    	}
    },
    /**
     * @title 清空表单
     * @return void
     */
    _clearForm:function(){
    	this.author.text("");
    	this.createdate.text("");
    	this.remark.val("");
    },
    /**
     * @title 获取表单数据
     * @return {object} 表单json数据
     */
    _getData:function(){
    	return {"body":this.remark.val()};
    },
    /**
     * @title 验证表单必输项
     * @retur {bool} 表单验证合格为true
     */
    _validForm:function(){
    	var isValid = true;
    	if(!this.remark.val()){
    		isValid = false;
    		this.remark.focus();
    	}
    	return isValid;
    },
    /**
     * @title 打开模态层
     * @param {object} data 备注json数据
     * @return void
     */
    open:function(data){
    	this.data = data;
    	this.formDialog.dialog("open");
    },
    /**
     * @title 用于重写
     */
    refreshDataTable:function(){},
    destroy: function () {
    	this.formDialog.dialog("destroy").remove();
        this._super();
    }
}, { usehtm: true, usei18n: false });


com.audit.comm_file.remarkDialog.widgetjs = [];
com.audit.comm_file.remarkDialog.widgetcss = [];