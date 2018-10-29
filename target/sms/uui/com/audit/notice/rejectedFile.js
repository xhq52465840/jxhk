//@ sourceURL=com.audit.notice.rejectedFile
$.u.load("com.sms.common.stdcomponentdelete");
$.u.define('com.audit.notice.rejectedFile', null, {
    init: function (option) {
    	this._option = option || null;
    	this.fileTemp = "<tr itemid='#{itemid}'>"
			+	"<td>"
			+	"<span class='downloadfile' style='color:#428bca;text-decoration:underline;cursor:pointer;' fileid='#{fileid}'>#{filename}</span></td>"
			+   "<td>#{size}</td><td>#{uploadTime}</td><td>#{uploadUser}</td>"
			+	"</tr>";
    },
    afterrender: function () {
    	this.rejectedFileTable = this.qid("rejectedFileTable");
    	this._option.data && this.list(this._option.data);
    },
    list : function(data){
    	var $tbody = this.rejectedFileTable.find("tbody");
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
    	this.rejectedFileTable.find(".downloadfile").off("click").on("click", this.proxy(this.download_file));
    },
   
    download_file:function(e){
    	var data = parseInt($(e.currentTarget).attr("fileid"));
        window.open($.u.config.constant.smsqueryserver+"?method=downloadFiles&tokenid="+$.cookie("tokenid")+"&ids="+JSON.stringify([data]));
    }
   
    
}, { usehtm: true, usei18n: false });

com.audit.notice.rejectedFile.widgetjs = ["../../../uui/widget/spin/spin.js", 
                                        "../../../uui/widget/jqblockui/jquery.blockUI.js",
                                        "../../../uui/widget/ajax/layoutajax.js"];
com.audit.notice.rejectedFile.widgetcss = [];