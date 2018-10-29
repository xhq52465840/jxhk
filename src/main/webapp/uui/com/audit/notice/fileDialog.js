//@ sourceURL=com.audit.notice.fileDialog
$.u.load("com.sms.common.stdcomponentdelete");
$.u.define('com.audit.notice.fileDialog', null, {
	
	//附件列表
    init: function (option) {
    	this._option = option || null;
    	this.fileTemp = "<tr itemid='#{itemid}'>"
			+	"<td>"
			+	"<span class='downloadfile' style='color:#428bca;text-decoration:underline;cursor:pointer;' fileid='#{fileid}'>#{filename}</span></td>"
			+   "<td>#{size}</td><td>#{uploadTime}</td><td>#{uploadUser}</td>"
			+	"<td style='text-align: center;'><i class='glyphicon glyphicon glyphicon-trash fl-minus del-file' data-data='#{data-data}' style='cursor: pointer;'></i></td>"
			+	"</tr>";
    	this.listFileTemp = "<tr itemid='#{itemid}'>"
			+	"<td>"
			+	"<span class='downloadfile' style='color:#428bca;text-decoration:underline;cursor:pointer;' fileid='#{fileid}'>#{filename}</span></td>"
			+   "<td>#{size}</td><td>#{uploadTime}</td><td>#{uploadUser}</td>"
			+	"</tr>";
    },
    afterrender: function () {
    	this.fileTable = this.qid("fileTable");
    	this.fileTable.find(".add_file").off("click").on("click",this.proxy(this.on_add));
    	if(this._option.btn === "nobutton"){
    		this.fileTable.find(".add_file").remove();
    	}
    	if(this._option.file){
    		this.listFile(this._option.file);
    	}
    	this._option.show && this.list(this._option.show);
    },
    on_add : function(){
    	if(!this.fileUpload){
    		$.u.load('com.audit.notice.fileUpload');
    	}
    	this.fileUpload = new com.audit.notice.fileUpload($('div[umid=file_dialog]'),{
    		"source":this._option.source,
    		"list":this.proxy(this.list)
    	});
    	this.fileUpload.open();
    },
    list : function(data){
    	
    	var $tbody = this.fileTable.find("tbody");
    	data && $.each(data, this.proxy(function(idx, obj){
    		var temp = this.fileTemp.replace(/#\{filename\}/g, obj.fileName)
			    .replace(/#\{itemid\}/g, obj.id)
			    .replace(/#\{fileid\}/g, obj.id)
			    .replace(/#\{size\}/g, obj.size)
			    .replace(/#\{uploadTime\}/g, obj.uploadTime)
			    .replace(/#\{uploadUser\}/g, obj.uploadUser)
			    .replace(/#\{data-data\}/g, JSON.stringify({"id":obj.id,"name":obj.fileName}));
    		$(temp).appendTo($tbody).addClass("comp");
    	}));
    	this.fileTable.find(".downloadfile").off("click").on("click", this.proxy(this.download_file));
    	this.fileTable.find(".del-file").off("click").on("click",this.proxy(this.del_file));
    	if(this._option.disabled==="disabled"){
    		$(".del-file",this.$).add($(".fa",this.$)).addClass("hidden");
    	}
    },
    listFile : function(data){
    	var $tbody = this.fileTable.find("tbody");
    	data.improveNoticeSentFiles && $.each(data.improveNoticeSentFiles, this.proxy(function(idx, obj){
    		var temp = this.listFileTemp.replace(/#\{filename\}/g, obj.fileName)
			    .replace(/#\{itemid\}/g, obj.id)
			    .replace(/#\{size\}/g, obj.size)
			    .replace(/#\{uploadTime\}/g, obj.uploadTime)
			    .replace(/#\{uploadUser\}/g, obj.uploadUser)
			    .replace(/#\{fileid\}/g, obj.id);
    		if(obj.sourceType === 9){
    			$(temp).appendTo($tbody).addClass("comp");
    		}else{
    			$(temp).appendTo($tbody);
    		}
    	}));
    	this.fileTable.find(".downloadfile").off("click").on("click", this.proxy(this.download_file));
    },
    download_file:function(e){
    	var data = parseInt($(e.currentTarget).attr("fileid"));
        window.open($.u.config.constant.smsqueryserver+"?method=downloadFiles&tokenid="+$.cookie("tokenid")+"&ids="+JSON.stringify([data]));
    },
    del_file:function(e){
    	try{
    		var data = $(e.currentTarget).data("data");
    		(new com.sms.common.stdcomponentdelete({
    			body:"<div>"+
    				 	"<p>确认删除？</p>"+
    				 "</div>",
    			title:"删除文件:" + data.name,
    			dataobject:"file",
    			dataobjectids:JSON.stringify([parseInt(data.id)])
    		})).override({
    			refreshDataTable:this.proxy(function(){
    				 $('tr[itemid='+data.id+']').fadeOut(function(){
		    		 	$(this).remove();
		    		 })
    			})
    		});
    	}catch(e){
    		throw new Error("删除操作失败:"+e.message);
    	}
    }
}, { usehtm: true, usei18n: false });

com.audit.notice.fileDialog.widgetjs = ["../../../uui/widget/spin/spin.js", 
                                        "../../../uui/widget/jqblockui/jquery.blockUI.js",
                                        "../../../uui/widget/ajax/layoutajax.js"];
com.audit.notice.fileDialog.widgetcss = [];