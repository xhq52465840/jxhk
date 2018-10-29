// @ sourceURL=com.sms.dashfilter.setfilter
$.u.load("com.sms.dashfilter.dashfilter");
$.u.load("com.sms.common.stdcomponentdelete");
$.u.define('com.sms.dashfilter.setfilter', null, {
	init : function(options) {
		this._options = {};
	},
	afterrender : function(bodystr) {
		this.btn_addfilter = this.qid("btn_addfilter");
		this.btn_addfilter.off("click").on("click", this.proxy(this._addF));
		this._createDialog();
		this._createDatatable();
	},
	_addF : function(){
		this.addDialog.dialog("open");
	},
	_createDialog : function(){
		this.addDialog = this.qid("addDialog").dialog({
        	title:"过滤器规则",
            width:840,
            modal: true,
            draggable: false,
            resizable: false,
            autoOpen: false,
            buttons:[{
					  "text":"确认",
					  "click":this.proxy(this.formSave)
				  },
           		  {
           			  "text":"取消",
           			  "class":"aui-button-link",
           			  "click":this.proxy(this.formCancle)
           		  }
           		],
            close: this.proxy(this.dialogClose),
			open: this.proxy(this.dialogOpen)
        });
		this.filterDiv = new com.sms.dashfilter.dashfilter($('div[umid=filterDiv]'),null);
	},
	formSave : function(){
		var url = $('input[name=url]').val();
		var description = $('textarea[name=description]').val();
		var clickparamtype = $('input[name=clickparamtype]').val();
		var filterParam = [];
		$('div.search-criteria-extended').find(".criteria-item").each(this.proxy(function(k,v){
			var dat = $(v).data("data-data");
			dat.type = "static";
        	filterParam.push(dat);
        }));
		var clickParam = [];
		$('div.search-criteria-other').find(".criteria-item").each(this.proxy(function(k,v){
        	clickParam.push($(v).data("data-data"));
        }));
		var param = null;
		if(this.filterId){
			param = {
				"method" : "stdcomponent.update",
				"dataobject" : "gadgetInsParam",
				"dataobjectid" : this.filterId,
				"obj":JSON.stringify({
					"url":url,
					"description":description,
					"filterParam":JSON.stringify(filterParam),
					"clickParam":JSON.stringify(clickParam),
					"clickParamType":clickparamtype
				})
			};
		}else{
			param = {
				"method" : "stdcomponent.add",
				"dataobject" : "gadgetInsParam",
				"obj":JSON.stringify({
					"url":url,
					"description":description,
					"filterParam":JSON.stringify(filterParam),
					"clickParam":JSON.stringify(clickParam),
					"clickParamType":clickparamtype
				})
			};
		}
		this._ajax(
			$.u.config.constant.smsmodifyserver, 
			true, 
			param, 
			this.$, 
			{},
			this.proxy(function(response) {
				this.addDialog.dialog("close");
				this.dataTable.fnDraw();
			})
		);
	},
	formCancle : function(){
		this.addDialog.dialog("close");
	},
	dialogClose : function(){
		$('input').val('');
		$('textarea').val('');
		this.filterId = null;
		this.filterDiv.destroy();
		this.filterDiv = new com.sms.dashfilter.dashfilter($('div[umid=filterDiv]'),null);
	},
	_createDatatable : function(){
    	this.dataTable = this.qid("datatable").dataTable({
            "searching": false,
            "serverSide": true,
            "bProcessing": true,
            "ordering": false,
			"pageLength":1000,
            "dom": "tip",
            "columns": [
                { "title": "页面" ,"mData":"url","sWidth":150},
                { "title": "描述" ,"mData":"description","sWidth":150},
                { "title": "查询过滤器" ,"mData":"filterParam","sWidth":150},
                { "title": "点击过滤器","mData":"clickParam","sWidth":150},
                { "title": "操作","mData":"id","sWidth":150}
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
				$.extend(aoData,{
            		"tokenid": $.cookie("tokenid"),
            		"method": "stdcomponent.getbysearch",
            		"dataobject": "gadgetInsParam",
            		"search":"",
            		"columns":JSON.stringify([{"data":"created"}]),
            		"order":JSON.stringify([{"column":0,"dir":"asc"}])
            	},true);
            }),
            "fnServerData": this.proxy(function (sSource, aoData, fnCallBack, oSettings) {
            	$.u.ajax({
                    url: $.u.config.constant.smsqueryserver,
                    type:"post",
                    dataType: "json",
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
                    "aTargets": 2,
                    "mRender": function (data, type, full) {
						var param = $.parseJSON(data);
						var htmls=["<ul style='padding-left:15px;padding-bottom:0;'>"];
	                	param && $.each(param,function(idx,wf){
	            			htmls.push("<li>"+wf.propname+"</li>");
	            		});
	            		htmls.push("</ul>");
                    	return htmls.join("");
                    }
                },
                {
                    "aTargets": 3,
                    "mRender": function (data, type, full) {
						var param = $.parseJSON(data);
						var htmls=["<ul style='padding-left:15px;padding-bottom:0;'>"];
	                	param && $.each(param,function(idx,wf){
	            			htmls.push("<li>"+wf.propname+"</li>");
	            		});
	            		htmls.push("</ul>");
                    	return htmls.join("");
                    }
                },
                {
                    "aTargets": 4,
                    "mRender": function (data, type, full) {
						return "<button class='btn btn-link edit' data='"+JSON.stringify(full)+"'>编辑</button>"+
			             	   "<button class='btn btn-link delete' data='"+data+"'>删除</button>";
                    }
                }
            ]
        });
		this.dataTable.off("click", "button.delete").on("click", "button.delete",this.proxy(this.del));
		this.dataTable.off("click", "button.edit").on("click", "button.edit",this.proxy(this.edit));
    },
	del : function(e){
		var id = $(e.currentTarget).attr("data");
		try{
    		var id = $(e.currentTarget).attr("data");
    		(new com.sms.common.stdcomponentdelete({
    			body:"<div>"+
    				 	"<p>删除改过滤器规则</p>"+
    				 	"<p><span class='text-danger'>确认删除？</span></p>"+
    				 "</div>",
    			title:"删除过滤器规则",
    			dataobject:"gadgetInsParam",
    			dataobjectids:JSON.stringify([parseInt(id)])
    		})).override({
    			refreshDataTable:this.proxy(function(){
    				this.dataTable.fnDraw();
    			})
    		});
    	}catch(e){
    		throw new Error(e.message);
    	}
	},
	edit : function(e){
		try{
			var data = $.parseJSON($(e.currentTarget).attr("data"));
			this.filterId = data.id;
			$('input[name=url]').val(data.url);
			$('textarea[name=description]').val(data.description);
			$('input[name=clickparamtype]').val(data.clickParamType);
			var param = {};
			param.filterParam = $.parseJSON(data.filterParam);
			param.clickParam = $.parseJSON(data.clickParam);
			this.filterDiv = new com.sms.dashfilter.dashfilter($('div[umid=filterDiv]'),param);
			this.addDialog.dialog("open");
		}catch(e){
			$.u.alert.info("出错:"+e.message);
		}
	},
	getParam : function(){
		this._ajax(
			$.u.config.constant.smsqueryserver, 
			true, 
			{
				"method" : "stdcomponent.getbyid",
				"dataobject" : "gadgetsinstance",
				"dataobjectid" : this._options.id
			}, 
			this.$, 
			{},
			this.proxy(function(response) {
				this._options.filter = $.parseJSON(response.data.filterparam);
				this.createFilter();
			})
		);
	},
	_ajax: function (url, async, param, $container, blockParam, callback) {
		$.u.ajax({
			url: url,
			datatype: "json",
			type: 'post',
			"async": async,
			data: $.extend({
				tokenid: $.cookie("tokenid")
			}, param)
		}, $container || this.$, $.extend({}, blockParam || {})).done(this.proxy(function (response) {
			if (response.success) {
				callback(response);
			}
		})).fail(this.proxy(function (jqXHR, errorText, errorThrown) {

		}));
	}
}, {
	usehtm : true,
	usei18n : false
});

com.sms.dashfilter.setfilter.widgetjs = ["../../../uui/widget/spin/spin.js",
										 "../../../uui/widget/jqblockui/jquery.blockUI.js",
										 "../../../uui/widget/ajax/layoutajax.js",
										 "../../../uui/widget/jqdatatable/js/jquery.dataTables.js"
									    ];
com.sms.dashfilter.setfilter.widgetcss = [{ path: '../../../uui/widget/jqdatatable/css/jquery.dataTables.css' }, 
                                          { path: '../../../uui/widget/jqdatatable/css/dataTables.bootstrap.css' }
										 ];