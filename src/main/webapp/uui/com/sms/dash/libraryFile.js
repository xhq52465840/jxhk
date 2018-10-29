//@ sourceURL=com.sms.dash.libraryFile
$.u.define('com.sms.dash.libraryFile', null, {
    init: function (mode, gadgetsinstanceid,urlparam) {
        this._initmode = mode;
        this._gadgetsinstanceid = gadgetsinstanceid;
        this.urlparam=urlparam;
        if(typeof(this.urlparam)=="string"){
        	this.urlparam=JSON.parse(this.urlparam);
        }
    },
    afterrender: function (bodystr){
    	this.initShow();
    },
    initShow : function(){
    	this.display = this.qid("display");
    	this.config = this.qid("config");
    	this.qid("update").click(this.proxy(this.on_update_click));
        this.qid("cancel").click(this.proxy(this.on_cancle_click));
        this.getData();
    },
    getData : function(){
    	this._ajax(
			$.u.config.constant.smsqueryserver, 
			true,
			{
	            "method": "stdcomponent.getbyid",
	            "dataobject": "gadgetsinstance",
	            "dataobjectid": this._gadgetsinstanceid
	        }, 
	        this.$, 
	        {},
	        this.proxy(function(response){
	        	var optons = response.data.urlparam;
	            if (this._initmode == "config") {
	            	if (window.parent.resizeGadget) {
    			        window.parent.resizeGadget(this._gadgetsinstanceid, 400);
    			    }
	                this.config.removeClass("hidden");
	                this.createTree(optons?$.parseJSON(optons):optons);
	            } else if(this._initmode == "display"){
	                this.display.removeClass("hidden");
	                this._initDataTable(optons?$.parseJSON(optons):optons);
	            }    
	        })
	    );
    },
    createTree : function(opt){
    	var setting = {
    			data: {
    				simpleData: {
    					enable: true
    				}
    			},
    			callback: {
    				onClick: this.proxy(function(e,treeId, treeNode, clickFlag){
    					if(treeNode.parentTId==null){
    						return false;
    					}else{
    						
    					}
    				})
    			}
    		};
    	this.tree = $.fn.zTree.init(this.qid("libTree"), setting,this._getTreeData());
    	var selectNode = this.tree.getNodeByParam("id", opt ? opt.id:"", null);
        if(selectNode){
            this.tree.selectNode(selectNode);
        }
    	var nodes = this.tree.getNodes();
    	$.each(nodes,this.proxy(function(idx,node){
    		if(node.parentTId==null){
    			this.tree.expandNode(node, true, false, true);
    		}
    	}));
    },
    _getTreeData:function(){
    	var nodes=[];
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
					nodes = $.map(responseData.directoryData.aaData,function(perm,idx){
        				return {id:perm.id,pId:perm.fatherId,name:perm.name};
        			});
				}
	    	}
	    })).fail(this.proxy(function(jqXHR,errorText,errorThrown){
	    	
	    }));
	    return nodes;
    },
    on_update_click:function(e){
    	var node = this.tree.getSelectedNodes();
    	if(node.length){
	        $.ajax({
				url : $.u.config.constant.smsmodifyserver,
				type : "post",
				dataType : "json",
				"data" : {
					"tokenid" : $.cookie("tokenid"),
					"method" : "stdcomponent.update",
					"dataobject" : "gadgetsinstance",
					"dataobjectid" : this._gadgetsinstanceid,
					"obj" : JSON.stringify({"urlparam" : JSON.stringify({"id":node[0].id,"name":node[0].name,"color":this.urlparam.color ? this.urlparam.color : $.cookie("color")})})
				}
			}).done(this.proxy(function(response) {
				window.location.reload( window.location.href.replace("config", "display"));
			}));
    	}else{
    		$.u.alert.info("未选中任何节点");
    	}
    },
    on_cancle_click : function(){
    	this.display.removeClass("hidden");
		window.location.reload( window.location.href.replace("config", "display"));
    },
    _initDataTable: function(dt){    	
        if(!dt || (dt && !dt.id)){
            this.qid('norule-tips').removeClass('hidden');
            return;
        }
    	this.dataTable = this.qid("datatable").dataTable({
            searching: false,
            serverSide: true,
            bProcessing: true,
            ordering: false,
            pageLength:10,
            "sDom":"rt<ip>",
            "columns": [
                { "title": "名字" ,"mData":"fileName"},
                { "title": "最后更新时间" ,"mData":"created"}
            ],
            "aaData":[

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
                	"sFirst": "",
                    "sPrevious": "<span class='fa fa-caret-left fa-lg'></span>",
                    "sNext": "<span class='fa fa-caret-right fa-lg'></span>",
                    "sLast": ""
                }
            },
            "fnServerParams": this.proxy(function (aoData) {
            	$.extend(aoData,{
            		"tokenid": $.cookie("tokenid"),
            		"search":"",
            		"method": "stdcomponent.getbysearch",
            		"dataobject":"file",
            		"rule": JSON.stringify([[{"key":"directory","value":dt.id}],[{"key":"directory.status","value":1}]]),
            		"columns": "",
                    "order": ""
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
                        if (window.parent.resizeGadget) {
        			        window.parent.resizeGadget(this._gadgetsinstanceid, $("body").outerHeight(true));
        			        window.parent.setGadgetTitle(this._gadgetsinstanceid, (dt?dt.name:""));
        			    }
            		})
            	);
            }),
            "aoColumnDefs": [
                {
	                "aTargets": 0,
	                "mRender": function (data, type, full) {
	                	var htmls = "";
                    	htmls += "<span class='downloadfile' style='color:#428bca;text-decoration:underline;cursor:pointer;' fileid='" + full.id + "'>" + full.fileName + "</span>";
                        return htmls;
	                }
	            }
            ]
        });
    	this.dataTable.on("click","span.downloadfile",this.proxy(this.download_file)); 
    },
    download_file:function(e){
    	var data = parseInt($(e.currentTarget).attr("fileid"));
    	var directoryId = this.treeId;
    	window.open($.u.config.constant.smsqueryserver+"?method=downloadFiles&tokenid="+$.cookie("tokenid")+"&ids="+JSON.stringify([data]));
    },
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
    destroy: function () {
        return this._super();
    }
}, { usehtm: true, usei18n: false });


com.sms.dash.libraryFile.widgetjs = ["../../../uui/widget/jqdatatable/js/jquery.dataTables.js",
                                 "../../../uui/widget/spin/spin.js", 
                                 "../../../uui/widget/jqblockui/jquery.blockUI.js",
                                 "../../../uui/widget/ajax/layoutajax.js",
                                 "../../../uui/widget/jqztree/js/jquery.ztree.all-3.5.js",];
com.sms.dash.libraryFile.widgetcss = [{path:"../../../uui/widget/jqztree/css/zTreeStyle/zTreeStyle.css"},
                                  { path: '../../../uui/widget/jqdatatable/css/jquery.dataTables.css' }, 
                                  { path: '../../../uui/widget/jqdatatable/css/dataTables.bootstrap.css' }];