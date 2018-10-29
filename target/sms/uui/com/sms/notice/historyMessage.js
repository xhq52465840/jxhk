//@ sourceURL=com.sms.notice.historyMessage
$.u.define('com.sms.notice.historyMessage', null, {
    init: function (options) {
        this._options = options || {};
        this.select2PageLength = 10;
    },
    afterrender: function (bodystr) {
    	this._createTable();
    	this.qid("search").off("click").on("click",this.proxy(function(){
    		this.dataTable.fnDraw();
    	}));
    	this._createSelect();
    	this.dataTable.off("click", "button.read").on("click", "button.read", this.proxy(this._viewData));
    },
    _createSelect : function(){
    	this.qid("sender").select2({
    		placeholder : "请选择...",
            allowClear: true,
            ajax: {
                url: $.u.config.constant.smsqueryserver,
                dataType: "json",
                data: this.proxy(function (term, page) {
                    return {
                        tokenid: $.cookie("tokenid"),
                        method: "stdcomponent.getbysearch",
                        dataobject: "user",
                        search: JSON.stringify({ "value": term }),
                        start: (page - 1) * this.select2PageLength,
                        length: this.select2PageLength
                    };
                }),
                results: this.proxy(function (data, page) {
                    if (data.success) {
                        return {
                            results: $.map(data.data.aaData, function (user, idx) {
                                user.text = user.username + "(" + user.fullname + ")";
                                return user;
                            }),
                            more: (page * this.select2PageLength) < data.data.iTotalRecords
                        };
                    }
                })
            }
        });
    },
    _createTable : function(){
    	this.dataTable = this.qid("datatable").dataTable({
            searching: false,
            serverSide: true,
            bProcessing: true,
            ordering: false,
            pageLength:10,
            "sDom":"tip",
            "columns": [
                { "title": "主题" ,"mData":"title","sWidth":"10%"},
                { "title": "内容" ,"mData":"content","sWidth":"15%"},
                { "title": "发送人" ,"mData":"sender","sWidth":"10%"},
                { "title": "时间" ,"mData":"sendTime","sWidth":"10%"},
                { "title": "状态" ,"mData":"checked","sWidth":"10%"},
                { "title": "标记" ,"mData":"id","sWidth":"10%"},
                {"title":"附件","mData":"files","render":this.getDataTableColumnRender("files"),"sWidth":"10%"},
            ],
            "aaData":[
                      
            ],
            "oLanguage": { //语言
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
            	$.extend(aoData,{
            		"tokenid":$.cookie("tokenid"),
            		"method":"stdcomponent.getbysearch",
            		"dataobject":"message",
            		"rule":JSON.stringify([
            		                       [{"key":"receiver","value":parseInt($.cookie("userid"))}],
            		                       [{"key":"title","op":"like","value":this.qid("title").val()}],
            		                       [{"key":"content","op":"like","value":this.qid("content").val()}],
            		                       [{"key":"sender","value":parseInt(this.qid("sender").val())}]
            		                     ]),
            		"search":"",
            		"columns": JSON.stringify([{ "data":"sendTime" } ]), 
            		"order": JSON.stringify([{ "column":0, "dir":"desc"}])
            	},true);
            }),
            "fnServerData": this.proxy(function (sSource, aoData, fnCallBack, oSettings) {
            	$.u.ajax({
                    url: $.u.config.constant.smsqueryserver,
                    dataType: "json",
                    type:"post",
                    cache: false,
                    data: aoData
                },this.qid("datatable")).done(this.proxy(function (data) {
                    if (data.success) {
                        fnCallBack(data.data);
                    }
                })).fail(this.proxy(function (jqXHR, errorText, errorThrown) {

                }));
            }),
            "aoColumnDefs": [
                {
                    "aTargets": 4,
                    "mRender": function (data, type, full) {
                    	 return data?"已阅":"未阅";
                    }
                },
                {
                    "aTargets": 5,
                    "mRender": function (data, type, full) {
                    	var htmls = "";
                    	if(!full.checked){
                            htmls += "<button class='btn btn-link read' data='"+data+"'>标记为已阅</button>";
                    	}
                    	 return htmls;  
                    }
                }
            ]
        });
    },
    getDataTableColumnRender: function(files){
    	var render=null;
    	switch(files){
    	case 'files':
    		render=function(data,type,full){
    		var html=["<ul>"];
    		$.each(data||[],function(idx, files){
	              html.push('<li style="list-style-type:none;float: left;width:145px;word-break:break-all"><a class="download-file" target="_blank" href="' + $.u.config.constant.smsqueryserver + "?method=downloadFiles&tokenid=" + $.cookie("tokenid") + "&ids=" + JSON.stringify([files.id]) + '">' + files.fileName + '</a></li></br>');
    		})
    		html.push("</ul>");
    		return html.join("");
    	};
    	break;
    	};
    	return render;
    },
    _viewData : function(e){
    	e.preventDefault();
    	try{
    		var data = JSON.parse($(e.currentTarget).attr("data"));
    		this._done(data);
    	}catch(e){
    		throw new Error("操作失败！"+e.message);
    	}
    },
    _done : function(id){
    	$.u.ajax({
    		url: $.u.config.constant.smsmodifyserver,
            type: "POST",
            dataType: "json",
            data: {
     			"tokenid":$.cookie("tokenid"),
        		"method": "modifyMessage",
        		"paramType": "checkMessage",
        		"messageId": id
			}
    	},this.dataTable).done(this.proxy(function(response){
    		if(response.success){
    			this.dataTable.fnDraw();
    		}
    	})).fail(this.proxy(function(jqXHR,errorText,errorTHrown){
    		
    	}))
    },
    destroy: function () {

    }
}, { usehtm: true, usei18n: false });


com.sms.notice.historyMessage.widgetjs = ["../../../uui/widget/jqdatatable/js/jquery.dataTables.js", 
                                          "../../../uui/widget/jqdatatable/js/dataTables.bootstrap.js",
		                                  "../../../uui/widget/spin/spin.js",
		                                  "../../../uui/widget/jqblockui/jquery.blockUI.js",
		                                  "../../../uui/widget/ajax/layoutajax.js",
		                                  "../../../uui/widget/select2/js/select2.min.js"];
com.sms.notice.historyMessage.widgetcss = [{id:"",path:"../../../uui/widget/jqdatatable/css/jquery.dataTables.css"},
                                           {id:"",path:"../../../uui/widget/jqdatatable/css/dataTables.bootstrap.css"},
                                           { path: '../../../uui/widget/select2/css/select2.css'},
                                           { path: '../../../uui/widget/select2/css/select2-bootstrap.css'}
										  ];