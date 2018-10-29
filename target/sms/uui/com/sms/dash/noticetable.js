//@ sourceURL=com.sms.dash.noticetable
$.u.define('com.sms.dash.noticetable', null, {
    init: function (mode, gadgetsinstanceid) {
    	this._initmode = mode;
        this._gadgetsinstanceid = gadgetsinstanceid;
        this._gadgetsinstance = null;        
    },
    afterrender: function (bodystr) {
    	this._initDataTable();
    },
    _initDataTable: function(){    	
    	this.dataTable = this.qid("datatable").dataTable({
            searching: false,
            serverSide: true,
            bProcessing: true,
            ordering: false,
            pageLength:10,
            "sDom":"rt<ip>",
            "columns": [
                { "title": "主题" ,"mData":"title"},
                { "title": "发送人" ,"sClass":"nowrap" ,"mData":"sender","sWidth":100},
                { "title": "时间" ,"sClass":"nowrap" ,"mData":"sendTime","sWidth":60},
                { "title": "标记" ,"sClass":"nowrap", "mData":"id","sWidth":60}
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
                	"sFirst": "",
                    "sPrevious": "<span class='fa fa-caret-left fa-lg'></span>",
                    "sNext": "<span class='fa fa-caret-right fa-lg'></span>",
                    "sLast": ""
                }
            },
            "fnServerParams": this.proxy(function (aoData) {
            	$.extend(aoData,{
            		"tokenid": $.cookie("tokenid"),
            		"method": "stdcomponent.getbysearch",
            		"dataobject":"message",
            		"rule":JSON.stringify([
            		                       [{"key":"receiver","value":parseInt($.cookie("userid"))}],
            		                       [{"key":"checked","value":false}]
            		                     ]),
            		"search":"",
            		"columns":JSON.stringify([{"data":"sendTime"}]),
            		"order":JSON.stringify([{"column":0,"dir":"desc"}])
            	},true);
            }),
            "fnServerData": this.proxy(function (sSource, aoData, fnCallBack, oSettings) {
            	this._ajax(
            		$.u.config.constant.smsqueryserver,
            		true,
            		aoData,
            		this.qid("datatable"),
            		{ size:2, backgroundColor:"#fff" },
            		this.proxy(function(response){
                        fnCallBack(response.data);
                        if (window.parent) {
        			        window.parent.resizeGadget(this._gadgetsinstanceid, ($("body").outerHeight(true))  + "px");
        			    }
            		})
            	);
            }),
            "aoColumnDefs": [
				{
				    "aTargets": 0,
				    "mRender": this.proxy(function (data, type, full) {
				    	return '<div title="' + data + '" style="padding-left:22px;position:relative;overflow:hidden;white-space:nowrap;text-overflow:ellipsis;min-width:130px;"><span style="position: absolute;left:0px;top:-2px;margin: 0px;padding: 0px;width: 22px;height: 22px;overflow: hidden;"><img class="msg-i" style="left: -14px;top: -40px;position: absolute;" src="../../../img/msg.png" /></span><span>'+data+'</span></div>';
				    })
				},
                {
                    "aTargets": 3,
                    "mRender": function (data, type, full) {
                    	return !full.checked ? "<a href='#' class='editSee' data-id='" + full.id + "' >标记为已阅</a>" : "";
                    }
                }
            ],
            "rowCallback": this.proxy(function(row, data){
            	var $row = $(row), $summary = $(row).children("td:first");
            	$(row).data({"notice": data}).css("cursor","pointer");
            	$summary.children("div:first").width(this.dataTable.find("thead>tr>th:first").width()-100);
            })
        });
    	this.dataTable.off("click", "tbody > tr").on("click", "tbody > tr", this.proxy(this.on_row_click));
    	this.dataTable.off("click", "a.editSee").on("click", "a.editSee", this.proxy(this.on_editSee_click));
    },
    on_row_click: function(e){ 
    	this._notice = $(e.currentTarget).data("notice");
    	this._ajax(
    			$.u.config.constant.smsqueryserver,
    			true,
    			{
    				"method": "stdcomponent.getbyid",
    				"dataobject": "message",
            		"dataobjectid": this._notice.id
    			},
    			this.$,
    			{},
    			this.proxy(function(response){
    				this._notice = response.data;
    			
			    	if(this.detailDialog == null){
			    		this.qid("detailDialog").removeClass("hidden")
				    	this.detailDialog = this.qid("detailDialog").dialog({
				    		title: "信息详情",
				    		width: 800,
				    		modal: true,
				    		resizable: false,
				    		autoOpen: false,
				    		draggable: false,
				    		open: this.proxy(function(){
				    			this.qid("text_sender").text(this._notice.senderDisplayName);
				    			this.qid("text_title").text(this._notice.title);
				    			this.qid("textarea_content").html(this._notice.content);
				    			 $attachmentContainer = $('<ul class="list-unstyled"/>').appendTo(this.qid("attachments_container"));
				    			 $.each(this._notice.files, this.proxy(function(idx, file){
	                                    $('<li><a class="download-file" fileid="'+file.id+'" href="#">'+file.fileName+'</a></li>').appendTo($attachmentContainer);
	                                }));
				    			
		                            this.qid("attachments_container").on('click', '.download-file', this.proxy(function(e) {
		                                var data = parseInt($(e.currentTarget).attr("fileid"));
		                                window.open($.u.config.constant.smsqueryserver + "?method=downloadFiles&tokenid=" + $.cookie("tokenid") + "&ids=" + JSON.stringify([data]));
		                            }))
			                       
				    			 this.qid("a_link").siblings("button").remove();
				    			if(this._notice.activity){
				    				this.qid("a_link").removeClass("hidden").attr("href", this.getabsurl("../search/activity.html?activityId=" + this._notice.activity.id)).text(this._notice.activity.summary);
				    			}else{
				    				this.qid("a_link").addClass("hidden");
				    			}
				    			this._resizeGadget();
				    		}),
				    		
				    		close: this.proxy(function(){
				    			this.qid("text_sender").text("");
				    			this.qid("text_title").text("");
				    			this.qid("textarea_content").text("");
				    			this.qid("a_link").attr("href", "#");
				    			this._resizeGadget();
				    		}),
				    		buttons:[
				    		   {
				    			   text: "关闭",
				    			   "class": "aui-button-link",
				    			   click: this.proxy(function(){
				    				   this.qid("attachments_container").html("");
				    				   this.detailDialog.dialog("close");
				    			   })
				    		   }
				    		]	    		
				    	});
			    	}
			    	this.detailDialog.dialog("open");
    			})
		);
    },
    on_editSee_click: function(e){
    	e.preventDefault();
    	e.stopPropagation();
    	try{
    		var id = parseInt($(e.currentTarget).attr("data-id"));
    		this._ajax(
    			$.u.config.constant.smsmodifyserver,
    			true,
    			{
    				"method": "modifyMessage",
            		"paramType": "checkMessage",
            		"messageId": id
    			},
    			this.dataTable,
    			{},
    			this.proxy(function(response){
    				this.dataTable.fnDraw();
    			})
    		);
    	}catch(e){
    		throw new Error("操作失败:"+e.message);
    	}
    },
    /**
     * @title ajax
     * @param url {string} ajax url
     * @param async {bool} async
     * @param param {object} ajax param
     * @param $container {jQuery object} block
     * @param blockParam {object} block param
     * @param callback {function} callback
     */
    _ajax:function(url,async,param,$container,blockParam,callback){
    	$.u.ajax({
			"url": url,
			"datatype": "json",
			"async": async,
			"type": "post",
			"data": $.isArray(param) ? param : $.extend({
				"tokenid": $.cookie("tokenid")
			},param)
		},$container || this.$,$.extend({},blockParam||{size:2, backgroundColor:"#fff"})).done(this.proxy(function(response){
			if(response.success){
				callback(response);
			}
        })).fail(this.proxy(function (jqXHR, errorText, errorThrown) {
       
		}));
    },
    /**
     * @title 控制行动项看板的iframe高度
     */
    _resizeGadget: function(showDialog){
    	if (window.parent) {
	        if(this.qid("detailDialog").parent().is(":visible")){
	        	window.parent.resizeGadget && window.parent.resizeGadget(this._gadgetsinstanceid, (this.qid("detailDialog").parent().outerHeight(true)) + 1 + "px");
	        }else{
	        	window.parent.resizeGadget && window.parent.resizeGadget(this._gadgetsinstanceid, ($("body").outerHeight(true))  + 1 + "px");
	        }
	        
	    }
    },
    destroy: function () {
        return this._super();
    }
}, { usehtm: true, usei18n: true });


com.sms.dash.noticetable.widgetjs = ['../../../uui/widget/select2/js/select2.min.js',
                                       '../../../uui/widget/jqdatatable/js/jquery.dataTables.js',
                                       "../../../uui/widget/spin/spin.js", 
                                       "../../../uui/widget/jqblockui/jquery.blockUI.js",
                                       "../../../uui/widget/ajax/layoutajax.js"];
com.sms.dash.noticetable.widgetcss = [{id:"",path:"../../../uui/widget/select2/css/select2.css"},
                                        {id:"",path:"../../../uui/widget/select2/css/select2-bootstrap.css"},
                                        { path: '../../../uui/widget/jqdatatable/css/jquery.dataTables.css' }, 
                                        { path: '../../../uui/widget/jqdatatable/css/dataTables.bootstrap.css' }];