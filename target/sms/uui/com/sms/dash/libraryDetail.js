//@ sourceURL=com.sms.dash.libraryDetail
$.u.define('com.sms.dash.libraryDetail', null, {
    init: function (option) {
        this.sectionTemp = "<div class='part'>" +
        "<table class='uui-table'>" +
        "<thead>" +
        "<tr class='infomodel-title' style='background-color: #EAEAEA;'>" +
        "<th>#{name}</th>" +
        "</tr>" +
        "</thead>" +
        "<tbody>" +
        "<tr style='background-color: #fff;'>" +
        "<td colspan='4' style='padding: 15px;'>#{content}</td>" +
        "</tr>" +
        "</tbody>" +
        "</table>" +
        "</div>";
    },
    afterrender: function (bodystr) {
        this.treeId = parseInt($.urlParam().treeid);
        if(this.treeId){
            this._ajax();
        }else{
            window.location.href = "../dash/DashBoard.html";
        }
    },
    _ajax: function(){
        $.u.ajax({
            url: $.u.config.constant.smsqueryserver,
            dataType: "json",
            type:"post",
            cache: false,
            data : {
            	"tokenid":$.cookie("tokenid"),
	    		"method":"getDirectorys",
	    		"paramType":"getDirectoryById",
	    		"directoryId":this.treeId
			}
        }).done(this.proxy(function (response) {
        	if(response.success){
                this.setData(response);
        		this.setDatatable();
        	}
        })).fail(this.proxy(function (jqXHR, errorText, errorThrown) {

        }));
    },
    pic:function(data){
    	switch(data){
    		case "rar":
    			return this.getabsurl("../../../img/rar.gif");
    		case "gif":
    		case "bmp":
    		case "png":
    		case "jpg":
    			return this.getabsurl("../../../img/gif.gif");
    		case "doc":
    		case "docx":
    			return this.getabsurl("../../../img/doc.gif");
    		case "ppt":
    		case "pptx":
    			return this.getabsurl("../../../img/ppt.gif");
    		case "pdf":
    			return this.getabsurl("../../../img/pdf.gif");
    		default:
    			return this.getabsurl("../../../img/file.gif");
    	}
    },
    setData : function(data){
        this.name = this.qid("name");
        this.description = this.qid("description");
        this.section = this.qid("section");
        this.searchAds = this.qid("searchAds");
        this.btnFilter = this.qid("btnFilter");
        this.btnFilter.click(this.proxy(this.on_btnFilter_click));
        data.directoryData.aaData && $.each(data.directoryData.aaData, this.proxy(function(k,v){
            this.name.text(v.name);
            if(v.description!=null){
            	this.description.text(v.description);
            }else{
            	this.description.text();
            }
            v.sections && $.each(v.sections, this.proxy(function(key,value){
                var temp = this.sectionTemp.replace(/#\{name\}/g, value.name)
                    .replace(/#\{content\}/g, value.content);
                $(temp).appendTo(this.section);
            }));
        }));
    },
    on_btnFilter_click: function(e){
        this.dataTable.draw();
    },
    setDatatable : function(){
      this.dataTable = this.qid("datatable").DataTable({
            searching: false,
            serverSide: true,
            bProcessing: true,
            ordering: false,
            sDom: "t<ip>",
            "columns": [
                { "title": "文件名","mData":"fileName", "class": "break-word", "width": "40%"},
                { "title": "大小", "mData": "size", "sWidth": "10%" },
                { "title": "类型" ,"mData":"sourceType", "sWidth": "10%" },
                { "title": "上传时间","mData":"uploadTime", "sWidth": "15%" },
                { "title": "上传用户","mData":"uploadUser", "sWidth": "15%" }
            ],
            "aoColumnDefs": [
                {
                    "aTargets": 0,
                    "mRender": this.proxy(function (data, type, full) {
                        return "<img src='" + this.pic(full.type) + "' style='margin-right: 10px;'/><span class='downloadfile' style='color:#428bca;text-decoration:underline;cursor:pointer;' fileid='" + full.id + "'>" + full.fileName + "</span>";
                    })
                },
                {
                    "aTargets": 2,
                    "mRender": this.proxy(function (data, type, full) {
                        var htmls = "";
                        if(full.sourceType === 1){
                            htmls = "自定义";
                        }
                        else if(full.sourceType === 2){
                            htmls = "安全评审";
                        }
                        else if(full.sourceType === 3){
                            htmls = "安全信息";
                        }
                        return htmls;
                    })
                }
            ],
            "oLanguage": {
                "sSearch": "搜索:",
                "sLengthMenu": "每页显示 _MENU_ 条记录",
                "sZeroRecords": "抱歉未找到记录",
                "sInfo": "从 _START_ 到 _END_ /共 _TOTAL_ 条数据",
                "sInfoEmpty": "没有数据",
                "sInfoFiltered": "(从总共_MAX_条记录中过滤)",
                "sProcessing": "检索中...",
                "oPaginate": {
                    "sFirst": "<<",
                    "sPrevious": "上一页",
                    "sNext": "下一页",
                    "sLast": ">>"
                }
            },
            "fnServerParams": this.proxy(function (aoData) {
                var rule=[[{"key": "directory", "value": this.treeId}]];
                if($.trim(this.searchAds.val())){
                    rule.push([{"key":"description","op":"like","value":$.trim(this.searchAds.val())}, {"key":"fileName","op":"like","value":$.trim(this.searchAds.val())}]);
                }
                $.extend(aoData,{
                    "tokenid":$.cookie("tokenid"),
                    "method":"stdcomponent.getbysearch",
                    "dataobject":"file",
                    "rule":JSON.stringify(rule),
                    "columns":JSON.stringify(aoData.columns),
                    "search":JSON.stringify(aoData.search)
                },true);
            }),
            "fnServerData": this.proxy(function (sSource, aoData, fnCallBack, oSettings) {
                this.btnFilter.attr("disabled",true);
                $.u.ajax({
                    url: $.u.config.constant.smsqueryserver,
                    type:"post",
                    dataType: "json",
                    cache: false,
                    data: aoData
                }, this.qid("datatable")).done(this.proxy(function (data) {
                    if (data.success) {
                        fnCallBack(data.data);
                    }
                })).fail(this.proxy(function (jqXHR, errorText, errorThrown) {

                })).complete(this.proxy(function(){
                    this.btnFilter.attr("disabled",false);
                }));
            }),
            "rowCallback": this.proxy(function(row, data, index){
                $(row).data("data", data);
            })
        }); 
        this.dataTable.on("click","span.downloadfile",this.proxy(this.download_file)); 
    },
    download_file:function(e){
    	var data = parseInt($(e.currentTarget).attr("fileid"));
    	var directoryId = this.treeId;
    	window.open($.u.config.constant.smsqueryserver+"?method=downloadFiles&tokenid="+$.cookie("tokenid")+"&ids="+JSON.stringify([data])+"&url="+window.encodeURIComponent(window.location.host+window.location.pathname+"?treeid="+directoryId));
    },
    destroy: function () {
        return this._super();
    }
}, { usehtm: true, usei18n: false });


com.sms.dash.libraryDetail.widgetjs = ["../../../uui/widget/jqdatatable/js/jquery.dataTables.js",
                                 "../../../uui/widget/spin/spin.js", 
                                 "../../../uui/widget/jqblockui/jquery.blockUI.js",
                                 "../../../uui/widget/ajax/layoutajax.js"];
com.sms.dash.libraryDetail.widgetcss = [{ path: '../../../uui/widget/jqdatatable/css/jquery.dataTables.css' }, 
                                  { path: '../../../uui/widget/jqdatatable/css/dataTables.bootstrap.css' }];