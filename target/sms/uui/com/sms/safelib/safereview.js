//@ sourceURL=com.sms.safelib.safereview
$.u.load("com.sms.common.stdcomponentdelete");
$.u.load("com.sms.safelib.uploadDialog");
$.u.define('com.sms.safelib.safereview', null, {
    init: function (options) {
        this._options = options||null;
        this.reviewTemp = "<div class='nav-heading'><strong>#{title}</strong></div>";
        this.reviewPanel = "<li><a href='#' title='#{content}' data='#{data}'>#{content}</a></li>";
    },
    afterrender: function (bodystr) {
    	this.reviewLay = this.qid("reviewLay");
    	this.reviewMain = this.qid("reviewMain");
    	this._initSearch();
    	this._createDialog();
    	this.reviewLay.on('click','a',this.proxy(this.aClick));
    	this.qid("btn_acompletion").on('click',this.proxy(this.addCompletion));
    	this.uploadFileDialog = new com.sms.safelib.uploadDialog($("div[umid='uploadFileDialog']",this.$),null);
    	this.uploadFileDialog.override({
    		refresh:this.proxy(function(data){
    			this.dataTable.fnDraw();
    		})
    	});
    	this._getData();
    },
    _initSearch : function(){
    	var unitData = this.getUnitData();
    	this.unitId = this.qid("unitId").select2({
    		placeholder : "请选择安监机构",
    		allowClear : true,
        	ajax:{
	        	url: $.u.config.constant.smsqueryserver,
	            dataType: "json",
	            type:"post",
	            data:function(term,page){
	            	return {
	        				"tokenid":$.cookie("tokenid"),
	        				"method":"getunits",
	        				"unitName":term,
	        				start: (page - 1) * 5,
		    				length: 5	  
	            	};
	            },
		        results:this.proxy(function(response,page){
		        	if(response.success){
		        		return {results:response.data, more:page * 5 < response.data.length};
		        	}
		        })
	        },
	        formatResult:function(item){
	        		return item.name;
	        },
	        formatSelection:function(item){
	        		return item.name;
	        }
		});
    	if(unitData){
    		this.unitId.select2('data', unitData );
		}
    	this.remark = this.qid("remark");
    	this.status = this.qid("status");
    	this.year = this.qid("year");
    	this.season = this.qid("season");
    	this.yearDialog = this.qid("yearDialog");
    	this.seasonDialog = this.qid("seasonDialog");
    	var date = new Date();
    	var year = date.getFullYear() + 5;
    	var year_arr = [];
    	for(var i = year; i > year - 10; i--){
    		year_arr.push('<option value="'+i+'">'+i+'</option>');
    	}
    	this.year.add(this.yearDialog).append(year_arr.join(''));
    	this.year.add(this.yearDialog).find('option[value='+(year-5)+']').attr("selected","selected");
    	this.qid("search").off("click").on("click",this.proxy(function(){
    		this.dataTable.fnDraw();
    	}));
    },
    getUnitData: function(){
    	var data = "";
    	$.ajax({
    		url: $.u.config.constant.smsqueryserver,
            dataType: "json",
            type:"post",
            async: false,
            data:{
				"tokenid":$.cookie("tokenid"),
				"method":"getunits" 
            },
    	}).done(this.proxy(function(response){
    		if(response.success){
    			if(response.data.length){
    				data = response.data[0];
    			}
    		}
    	})).fail(this.proxy(function(jqXHR,errorText,errorTHrown){
    		
    	}))
    	return data;
    },
    _createDatatable : function(id){
    	this.dataTable = this.qid("datatable").dataTable({
			destroy: true,
            searching: false,
            serverSide: true,
            bProcessing: true,
            ordering: false,
            pageLength:1000,
            "sDom":"",
            "columns": [
                { "title": "安监机构" ,"mData":"unit","sWidth":120},
                { "title": "描述" ,"mData":"description","sWidth":150},
                { "title": "附件" ,"mData":"id","sWidth":100},
                { "title": "状态" ,"mData":"status","sWidth":50},
                { "title": "创建人" ,"mData":"creator","sWidth":100},
                { "title": "年份" ,"mData":"year","sWidth":25},
                { "title": "季度" ,"mData":"season","sWidth":25},
                { "title": "操作" ,"mData":"id","sWidth":130}
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
            		"method":"getDailySafetyWorkStatus",
            		"assessmentCommentId":id,
            		"columns":"",
            		"search":"",
            		"year": this.year.val(),
            		"season": this.season.val(),
            		"unitId":this.unitId.val(),
            		"description": this.remark.val(),
            		"status": this.status.val()
            	},true);
            }),
            "fnServerData": this.proxy(function (sSource, aoData, fnCallBack, oSettings) {
            	$.u.ajax({
                    url: $.u.config.constant.smsqueryserver,
                    dataType: "json",
                    cache: false,
                    type:"post",
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
                    "mRender": this.proxy(function (data, type, full) {
                    	var htmls=["<ul style='padding-left:15px;'>"];
                        full.attachments && $.each(full.attachments,function(idx,attachment){
                     	  htmls.push("<li><span class='fileDownload' style='color:blue;cursor:pointer;' data-data ='"+JSON.stringify(attachment)+"'>"+attachment.name+"</span>"); 
                     	  if(full.editable){
                     	  	htmls.push("<span class='glyphicon glyphicon glyphicon-trash fl-minus fileDelete' style='cursor:pointer;float:right;' data-data ='"+JSON.stringify(attachment)+"'></span>");
                     	  }
                     	  htmls.push("</li>");
                        });
                        htmls.push("</ul>");
                        return htmls.join("");
                    })
                },
                {
                    "aTargets": 7,
                    "mRender": function (data, type, full) {
                     	if(full.editable){
    	                	return "<button class='btn btn-link comedit' data='"+JSON.stringify({
    	                				id:full.id,
    	                				unitId:full.unitId,
    	                				unit:full.unit,
    	                				description:full.description,
    	                				year: full.year,
    	                				season: full.season
        	                		})+"'>编辑</button>"+
        	                		"<button class='btn btn-link comupload' data='"+JSON.stringify({
        	                			id:full.id
        	                		})+"'>上传附件</button>"+
        	                		(full.status=="未发布"?"<button class='btn btn-link comrelease' data='"+JSON.stringify({id:full.id})+"'>发布</button>":"")+
        	                		"<button class='btn btn-link comdelete' data='"+JSON.stringify({
        	                			id:full.id,
        	                			name:full.unit
        	                		})+"'>删除</button>";
                     	}else{
                     		return "";
                     	}
                    }
                }
            ]
        });
    	this.dataTable.off("click","span.fileDownload").on("click","span.fileDownload",this.proxy(this.fileDownload));
		this.dataTable.off("click","span.fileDelete").on("click","span.fileDelete",this.proxy(this.fileDelete));
		this.dataTable.off("click","button.comedit").on("click","button.comedit",this.proxy(this._edit));
		this.dataTable.off("click","button.comupload").on("click","button.comupload",this.proxy(this._load));
		this.dataTable.off("click","button.comdelete").on("click","button.comdelete",this.proxy(this._delete));
		this.dataTable.off("click","button.comrelease").on("click","button.comrelease",this.proxy(this._release));
    },
    _createDialog : function(){
    	this.completionDialog = this.qid("completionDialog").dialog({
        	title:"添加日常安全工作内容",
            width:540,
            modal: true,
            draggable: false,
            resizable: false,
            autoOpen: false,
            open: this.proxy(function (e,ui) {
            	var dialogOptions=null;
            	if(this.openData){
            		this.qid("unit").select2("data",{
            			"id":this.openData.unitId,
            			"name":this.openData.unit
            		});
                	this.qid("description").val(this.openData.description);
                	this.yearDialog.val(this.openData.year);
                	this.seasonDialog.val(this.openData.season);
                	dialogOptions = {
    		                title: "编辑日常安全工作内容",
    	            		buttons:[{
    	  					  "text":"确认",
    	  					  "click":this.proxy(this._editDialogClick)
    	  				  },
                 		  {
                 			  "text":"取消",
                 			  "class":"aui-button-link",
                 			  "click":this.proxy(function(){
                 				  this.completionDialog.dialog("close");
                 			  })
                 		  }]
                	}
            	}else{
            		dialogOptions = {
		                title: "添加日常安全工作内容",
	            		buttons:[{
	  					  "text":"确认",
	  					  "click":this.proxy(this._addDialogClick)
	  				  },
             		  {
             			  "text":"取消",
             			  "class":"aui-button-link",
             			  "click":this.proxy(function(){
             				  this.completionDialog.dialog("close");
             			  })
             		  }]
            		}}
            		this.completionDialog.dialog("option",dialogOptions).dialog("open");
            	}
            ),
            close: this.proxy(this._dialogClose),
            create: this.proxy(this.buildForm)
        });
    },
    _dialogClose : function(){
    	this.openData = "";
    	this.qid("unit").select2("val","");
    	this.qid("description").val("");
    },
    buildForm:function(){
    	this.qid("unit").select2({
        	ajax:{
	        	url: $.u.config.constant.smsqueryserver,
	            dataType: "json",
	            type:"post",
	            data:function(term,page){
	            	return {
	        				"tokenid":$.cookie("tokenid"),
	        				"method":"getunits",
	        				"unitName":term,
	        				start: (page - 1) * 5,
		    				length: 5
		    		};
	            },
		        results:this.proxy(function(response,page){
		        	if(response.success){
		        		return {results:response.data, more:page * 5 < response.data.length};
		        	}
		        })
	        },
	        formatResult:function(item){
	        		return item.name;
	        },
	        formatSelection:function(item){
	        		return item.name;
	        }
		});
    	this.form = this.qid("form");
    	this.form.validate({
    		rules:{
    			unit:"required",
    			description:"required",
    			yearDialog: "required",
    			seasonDialog: "required"
    		},
    		messages:{
    			unit:"安监机构不能为空",
    			description:"描述不能为空",
    			yearDialog: "年份不能为空",
    			seasonDialog: "季度不能为空"
    		},
    		errorClass: "text-danger text-validate-element",
            errorElement:"div"
    	})
    },
    _addDialogClick : function(){
    	var id = $('li.nav-selected').find('a').attr("data");
    	if(this.form.valid()){
			this._ajax(
				$.u.config.constant.smsmodifyserver,
				"POST",
				{
	            	"tokenid":$.cookie("tokenid"),
	            	"method":"modifyDailySafetyWorkStatus",
	            	"paramType":"add",
	            	"unitId":parseInt(this.qid("unit").select2("val")),
	            	"description":this.qid("description").val(),
	            	"year": this.yearDialog.val(),
	            	"season": this.seasonDialog.val(),
	            	"assessmentCommentId":parseInt(id)
	            },
	            this.completionDialog.parent(),
				function(data,_this){
	            	_this.completionDialog.dialog("close");
	            	_this.dataTable.fnDraw();
				}
			);
		  }
    },
    _editDialogClick : function(){
    	if(this.form.valid()){
			this._ajax(
				$.u.config.constant.smsmodifyserver,
				"POST",
				{
	            	"tokenid":$.cookie("tokenid"),
	            	"method":"stdcomponent.update",
	            	"dataobjectid":this.openData.id,
	            	"dataobject":"dailySafetyWorkStatus",
	            	"obj":JSON.stringify({
	            		"unit":parseInt(this.qid("unit").select2("val")),
	            		"description":this.qid("description").val(),
	            		"year": this.yearDialog.val(),
		            	"season": this.seasonDialog.val()
	            	})
	            },
	            this.completionDialog.parent(),
				function(data,_this){
	            	_this.completionDialog.dialog("close");
	            	_this.dataTable.fnDraw();
				}
			)
		  }
    },
    _getData:function(data){
    	this._ajax(
			$.u.config.constant.smsqueryserver,
			"POST",
			{
            	"tokenid":$.cookie("tokenid"),
        		"method":"getAssessmentProjects",
        		"type":"R"
            },
            this.qid("reviewLay"),
			function(data,_this){
            	var clkId = null;
            	var id = $.urlParam().id;
				$.each(data.data.aaData,_this.proxy(function(idx,item){
            		var temp = _this.reviewTemp.replace(/#\{title\}/g,item.name);
            		$(temp).appendTo(_this.reviewLay);
            		var $ul = $('<ul class="nav"></ul>').appendTo(_this.reviewLay);
            		$.each(item.assessmentComments,_this.proxy(function(key,value){
            			var conTemp = _this.reviewPanel.replace(/#\{content\}/g,value.description)
            										  .replace(/#\{data\}/g,value.id);
            			$(conTemp).appendTo($ul);
            			if(idx ==0 && key==0){
            				clkId = value.id;
            			}
            		}));
            	}));
            	if(id){
            		_this.reviewLay.find("a[data="+id+"]").trigger("click");
            	}else if(clkId){
            		_this.reviewLay.find("a[data="+clkId+"]").trigger("click");
            	}
			}
		)
    },
    _ajax : function(url, type, data, $container,callback){
    	$.u.ajax({
    		url: url,
            type: type,
            dataType: "json",
            data: data
    	},$container).done(this.proxy(function(response){
    		if(response.success){
    			callback(response,this);
    		}
    	})).fail(this.proxy(function(jqXHR,errorText,errorTHrown){
    		
    	}))
    },
    aClick : function(e){
    	e.preventDefault();
    	try{
    		var data = JSON.parse($(e.currentTarget).attr("data"));
    		this.reviewLay.find("li.nav-selected").removeClass("nav-selected");
    		$(e.currentTarget).parent().addClass("nav-selected");
    		this.reviewMain.css("visibility","visible");
    		this._createDatatable(data);
    	}catch(e){
    		
    	}
    },
    fileDownload : function(e){
    	e.preventDefault();
    	try{
    		var data = JSON.parse($(e.currentTarget).attr("data-data"));
    		window.open($.u.config.constant.smsqueryserver+"?method=downloadFiles&tokenid="+$.cookie("tokenid")+"&ids="+JSON.stringify([parseInt(data.id)])+"&url="+window.encodeURIComponent(window.location.host+window.location.pathname));
    	}catch(e){
    		throw new Error("附件下载操作失败！"+e.message);
    	}
    },
    fileDelete : function(e){
    	e.preventDefault();
    	try{
    		var data = JSON.parse($(e.currentTarget).attr("data-data"));
    		(new com.sms.common.stdcomponentdelete({
    			body:"<div>"+
    				 	"确认删除：<strong>"+data.name+"</strong>"+"？"+
    				 "</div>",
    			title:"删除："+data.name,
    			dataobject:"file",
    			dataobjectids:JSON.stringify([parseInt(data.id)])
    		})).override({
    			refreshDataTable:this.proxy(function(){
    				this.dataTable.fnDraw();
    			})
    		});
    	}catch(e){
    		throw new Error("附件删除操作失败！"+e.message);
    	}
    },
    _edit : function(e){
    	e.preventDefault();
    	try{
    		this.openData = JSON.parse($(e.currentTarget).attr("data"));
    		this.completionDialog.dialog("open");
    	}catch(e){
    		throw new Error("编辑操作失败！"+e.message);
    	}
    },
    _load : function(e){
    	e.preventDefault();
    	try{
    		var data = JSON.parse($(e.currentTarget).attr("data"));
    		this.uploadFileDialog.open({
    			"source":data.id,
    			"sourceType":2,
    			"method":"uploadFiles",
    			"tokenid":$.cookie("tokenid")
    		});
    	}catch(e){
    		throw new Error("上传附件操作失败！"+e.message);
    	}
    },
    _delete : function(e){
    	e.preventDefault();
    	try{
    		var data = JSON.parse($(e.currentTarget).attr("data"));
    		(new com.sms.common.stdcomponentdelete({
    			body:"<div>"+
    				 	"确认删除：<strong>"+data.name+"</strong>"+"？"+
    				 "</div>",
    			title:"删除："+data.name,
    			dataobject:"dailySafetyWorkStatus",
    			dataobjectids:JSON.stringify([parseInt(data.id)])
    		})).override({
    			refreshDataTable:this.proxy(function(){
    				this.dataTable.fnDraw();
    			})
    		});
    	}catch(e){
    		throw new Error("删除操作失败！"+e.message);
    	}
    },
    _release : function(e){
    	e.preventDefault();
    	var data = JSON.parse($(e.currentTarget).attr("data"));
    	try{
	    	this._ajax(
				$.u.config.constant.smsmodifyserver,
				"POST",
				{
	            	"tokenid":$.cookie("tokenid"),
	            	"method":"stdcomponent.update",
	            	"dataobjectid":data.id,
	            	"dataobject":"dailySafetyWorkStatus",
	            	"obj":JSON.stringify({
	            		"status":"RELEASE"
	            	})
	            },
	            this.dataTable,
				function(data,_this){
	            	_this.dataTable.fnDraw();
				}
			)
    	}catch(e){
    		throw new Error("发布操作失败！"+e.message);
    	}
    },
    addCompletion : function(e){
    	e.preventDefault();
		this.completionDialog.dialog("open");
    },
    destroy: function () {
        this._super();
    }
}, { usehtm: true, usei18n: false });

com.sms.safelib.safereview.widgetjs = ["../../../uui/widget/jqdatatable/js/jquery.dataTables.js",
                                   "../../../uui/widget/jqdatatable/js/dataTables.bootstrap.js",
                                   "../../../uui/widget/select2/js/select2.min.js",
                                   "../../../uui/widget/jqurl/jqurl.js",
                                   "../../../uui/widget/jqztree/js/jquery.ztree.all-3.5.js",
                                   "../../../uui/widget/spin/spin.js",
                                   "../../../uui/widget/jqblockui/jquery.blockUI.js",
                                   "../../../uui/widget/ajax/layoutajax.js"];
com.sms.safelib.safereview.widgetcss = [{id:"ztreestyle",path:"../../../uui/widget/jqztree/css/zTreeStyle/zTreeStyle.css"},
                                    {id:"",path:"../../../uui/widget/select2/css/select2.css"},
                                    {id:"",path:"../../../uui/widget/select2/css/select2-bootstrap.css"},
                                    { path: '../../../uui/widget/jqdatatable/css/jquery.dataTables.css' }, 
                                    { path: '../../../uui/widget/jqdatatable/css/dataTables.bootstrap.css' }
                                    ];