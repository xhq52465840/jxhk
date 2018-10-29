//@ sourceURL=com.sms.safePromotion.safeTranning
$.u.define('com.sms.safePromotion.safeTranning', null,
{
    init: function (options) {
    	this._SELECT2_PAGE_LENGTH=10;
    	this._DATATABE_LANGUAGE =  { //语言
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
    	  }

	    this._LANGUAGE = {
		           	"processing":"数据加载中...",
		           	"info": " _START_ - _END_ of _TOTAL_ ",
		        	"infoEmpty": "0 - 0 of 0 ",
		            "zeroRecords":"无搜索结果",
		           	"infoFiltered":"",
		           	"infoEmpty":"",
		           	"paginate": {
		                   "first": "",
		                   "previous": "<span class='fa fa-caret-left fa-lg'></span>",
		                   "next": "<span class='fa fa-caret-right fa-lg'></span>",
		                   "last": ""
		               }
	           }
  
    },
    afterrender: function () {
    	this.fileUpload = this.qid("fileUpload");
    	this._initAudit();
    	this._initFileUpload();
    	this._export=$("[name=export]");
		this._export.off("click").on("click",this.proxy(this._exportExcel));
		this.$.on("click","span.downloadfile",this.proxy(this._download_file));
    },
    _initAudit:function(){
    	this.auditpanel            =$("#audit");    //审计
		this.audittype             =$("[name=audittype]",this.auditpanel);  //审计类型
		this.operators             =$("[name=operators]",this.auditpanel);//执行单位
		this.auditimproveStartDate =$("[name=improveStartDate]",this.auditpanel);//整改期限
		this.auditimproveEndDate   =$("[name=improveEndDate]",this.auditpanel);//整改期限
		this.auditconfirmResult    =$("[name=confirmResult]",this.auditpanel);//验证状态
		this._initauditselect();
		this.btnauditfilter=this.qid("btn_audit_filter");
		this.btnauditfilter.off("click").on("click",this.proxy(function(ent){
			ent.preventDefault();
			this.freshAuditTable();
		})).trigger("click");
    },
	getAuditData: function(){
		//审计类型
		var audittypevalue=[];
			$.each(this.audittype.val().split(",")||[],this.proxy(function(k,v){
				v && audittypevalue.push(v)
			}));
		//执行单位
		var operatorsData = [];
		this.operators.select2("data") && $.each(this.operators.select2("data"), function(k, v){
			operatorsData.push(v.id);
		});
	  	//验证状态
	  	var confirmResultvalue=[];
		$.each(this.auditconfirmResult.val().split(",")||[],this.proxy(function(n,m){
			m && confirmResultvalue.push(m);
	  	}))
	  	return obj = {
			    "issueType":"audit",
           		"auditType": JSON.stringify(audittypevalue),      //审计类型
           		"operators": JSON.stringify(operatorsData),       //执行单位
                "improveStartDate":this.auditimproveStartDate.val(),            //整改期限
                "improveEndDate":this.auditimproveEndDate.val(),               	//整改期限
        		"confirmResult":JSON.stringify(confirmResultvalue)             //验证状态
			}
	},
    _initFileUpload: function () {
    	this.dialog = this.qid("dialog").dialog({
        	title:"批量验证",
            width:540,
            modal: true,
            draggable: false,
            resizable: false,
            autoOpen: false,
            buttons:[
              {
				  "text":"确认",
				  "click":this.proxy(function(){
					  if(this.fileUpload.data('uploadify').queueData.queueLength){
						  this.fileUpload.uploadify('upload','*');
					  }else{
						  $.u.alert.error("未选择文件！", 1000 * 3);
					  }
				  })
			  },
       		  {
       			  "text":"取消",
       			  "class":"aui-button-link",
       			  "click":this.proxy(function(){
       				  this.fileUpload.uploadify('cancel', '*');
       				  this.dialog.dialog("close");
       			  })
       		  }
       		],
            open: this.proxy(function () {

            }),
            close: this.proxy(function () {

            }),
            create: this.proxy(function () {
            	this.buildForm();
            })
        });
    },
    buildForm:function(){
    	this.fileUpload.uploadify({
			'auto':false,
			'swf': this.getabsurl('../../../../uui/widget/uploadify/uploadify.swf'),
			'uploader': $.u.config.constant.smsmodifyserver+";jsessionid="+$.cookie("sessionid"),
			'fileTypeDesc':'doc', //文件类型描述
			'fileTypeExts':'*.*',//可上传文件格式 
			'removeCompleted': true,
			'buttonText':'选择附件', //按钮上的字
			'cancelImg':this.getabsurl('../../../../uui/widget/uploadify/uploadify-cancel.png'),
			'height': 25,	//按钮的高度和宽度
			'width': 140,
			'progressData':'speed',
			'method': 'get',
			'removeTimeout': 3,
			'successTimeout': 99999,
			'multi': true, 
			'fileSizeLimit':'10MB',
			'queueSizeLimit':999,
			'simUploadLimit':999,
			'onQueueComplete':this.proxy(function(queueData){
				if(queueData.uploadsErrored < 1){
					this.dialog.dialog("close");
				}else{
					$.u.alert.error(data.reason+"!上传失败", 1000 * 3);
				}
			}),
			'onUploadStart':this.proxy(function(file) {
				var data = {};
				data.method = "confirmImproveIssue";
				data.tokenid = $.cookie("tokenid");
				data.issueType = this.issuestype.substring(1);
				data.objs = JSON.stringify(this.issuesIds);
				this.fileUpload.uploadify('settings','formData',data);
			}),
    		'onUploadSuccess':this.proxy(function(file, data, response) {
    			if(data){
    				data = JSON.parse(data);
        			if(data.success){
        				$.u.alert.success("验证成功");
        				if(this.issuestype === "#audit"){
	        				this.issueaudittable && this.issueaudittable.fnDraw();
	        			}else if(this.issuestype === "#check"){
	        				this.issuechecktable && this.issuechecktable.fnDraw();
	        			}
        			}else{
        				$.u.alert.error(data.reason+"!验证失败", 1000 * 3);
        			}
    			}
    		})
        });
    },
    isNum : function(str){
    	var reg = "^([+-]?)\\d*\\.?\\d+$";
    	return new RegExp(reg).test(str);
    },
    //初始化审计筛选框
    _initauditselect:function(){
    	var termval="";
    	//审计类型
    	this.audittype.select2({
    		placeholder: "选择...",
    		multiple: true,
    	    allowClear: true,
            ajax: {
                url: $.u.config.constant.smsqueryserver,
                type: "post",
                data: this.proxy(function(term, page){
                	termval=term;
                    return {
                        "tokenid": $.cookie("tokenid"),
                        "method": "getPlanTypeForImproveIssue",
                        "start": ( page - 1) * this._SELECT2_PAGE_LENGTH,
                        "length": this._SELECT2_PAGE_LENGTH                                     
                    };
                }),
                results: this.proxy(function(response, page){
                    if(response.success){
                        return {
                            "results": termval ? ($.grep(response.data.aaData||[],this.proxy(function(item,idx){
  		                        	return item.name.indexOf(termval) > -1
  		                    	}))):response.data.aaData,
                            "more": response.data.iTotalRecords > (page * this._SELECT2_PAGE_LENGTH)
                        };
                    }
                    else{
                        $.u.alert.error(response.reason, 1000 * 3);
                    }
                })
            },
            formatSelection: function(item){
                return item.name;
            },
            formatResult: function(item){
                return item.name;
            }
    	});
    	//执行单位
    	this.operators.select2({
    		placeholder: "选择...",
    		multiple: true,
    	    allowClear: true,
            ajax: {
                url: $.u.config.constant.smsqueryserver,
                type: "post",
                data: this.proxy(function(term, page){
                	var audittypeData = this.audittype.select2("data"),
                	arr = [];
                	audittypeData && $.each(audittypeData, function(k, v){
                		arr.push(v.id);
                	});
                    return {
                        "tokenid": $.cookie("tokenid"),
                        "method": "getOperatorForImproveIssue",
                        "auditType": JSON.stringify(arr),
                        "term": term,
                        "start": ( page - 1) * this._SELECT2_PAGE_LENGTH,
                        "length": this._SELECT2_PAGE_LENGTH                                     
                    };
                }),
                results: this.proxy(function(response, page){
                    if(response.success){
                        return {
                            "results": response.data.aaData,
                            "more": response.data.iTotalRecords > (page * this._SELECT2_PAGE_LENGTH)
                        };
                    }
                    else{
                        $.u.alert.error(response.reason, 1000 * 3);
                    }
                })
            },
            formatSelection: function(item){
                return item.name;
            },
            formatResult: function(item){
                return item.name;
            }
    	});
    	this.auditimproveStartDate
    	.add(this.auditimproveEndDate).datepicker({"dateFormat":"yy-mm-dd"});
    	//验证状态:
    	this.auditconfirmResult.select2({
    		placeholder: "选择...",
    		multiple: true,
    	    allowClear: true,
            ajax: {
                url: $.u.config.constant.smsqueryserver,
                type: "post",
                data: this.proxy(function(term, page){
                    return {
                    	"tokenid": $.cookie("tokenid"),
                        "method": "getEnumTraceItemStatus",
                        "term": term,
                        "type":"audit",
                        "start": ( page - 1) * this._SELECT2_PAGE_LENGTH,
                        "length": this._SELECT2_PAGE_LENGTH                                         
                    };
                }),
                results: this.proxy(function(response, page){
                    if(response.success){
                        return {
                            "results": response.data,
                            "more": response.data.length > (page * this._SELECT2_PAGE_LENGTH)
                        };
                    }
                    else{
                        $.u.alert.error(response.reason, 1000 * 3);
                    }
                })
            },
            formatSelection: function(item){
                return item.name;
            },
            formatResult: function(item){
                return item.name;
            }
    	})
    },
    freshAuditTable:function(){
    	this._Audittable();
    },
	_Audittable:function(e){
	   	if ($.fn.DataTable.isDataTable(this.qid("issueaudittable"))) {
            this.qid("issueaudittable").dataTable().api().destroy();
            this.qid("issueaudittable").empty();
        }
	    this.issueaudittable=this.qid("issueaudittable").dataTable({
           "dom": 'tip',
           "loadingRecords": "加载中...",  
           "info":true,
           "pageLength": 50,
           "pagingType": "full_numbers",
           "autoWidth": true,
           "processing": false,
           "serverSide": true,
           "bRetrieve": true,
           "ordering": true,
           "language":this._LANGUAGE,
           "columns":  [//整改原因、措施、验证状态          
                         { "title": "<input type='checkbox' class='all' />" ,"mData":"checkType", "sWidth": "4%", "orderable": false},
                         { "title": "系统分类" ,"mData":"checkType", "sWidth": "20%" },
		                 { "title": "执行单位" ,"mData":"operator", "sWidth": "20%" },
		                 { "title": "验证状态" ,"mData":"confirmResult", "sWidth": "20%"},
		                 { "title": "整改期限" ,"mData":"improveLastDate", "sWidth": "20%" },
		                 { "title": "附件" ,"mData":"files", "sWidth": "20%"}
		             ],
           "aoColumnDefs": [
							{
							    "aTargets": 0,
							    "mRender": function (data, type, full) {
							    	return full.editable ? '<input type="checkbox" class="single" data-id="'+full.id+'"/>' : '';
							    }
							}
                        ],
           "ajax": this.proxy(function (data, callback, settings) {
		               var order = {}, oorder={}, column = '', dir = '';
		               if(data.order.length){
		            	   order = data.order[0];
		            	   column = data.columns[order['column']]['data'];
		            	   dir = order.dir;
		            	   oorder[column]= dir;
		               }
		               delete data.columns;
		               delete data.draw;
		               delete data.search;
		               var auditObj = this.getAuditData();
	        	   this._ajax($.u.config.constant.smsqueryserver,$.extend({},data,{
   	        		"order":JSON.stringify(oorder),
	           		"method": "getImproveIssueList",
	           		"issueType":"audit",
	           		"auditType": JSON.stringify(auditObj.audittypevalue),
	           		"operators": JSON.stringify(auditObj.operatorsData),
            		"confirmResult":JSON.stringify(auditObj.confirmResultvalue),//??//验证状态
                    "improveStartDate":this.auditimproveStartDate.val(),
                    "improveEndDate":this.auditimproveEndDate.val(),
	            	}),this.qid("issueaudittable").parent(),{size:2,backgroundColor:"#fff"},this.proxy(function(response){
	            			if(response.success){
	                      		 callback({
	 	                      		"recordsFiltered":response.data.iTotalDisplayRecords,
	 	                      		"data":response.data.aaData
	 	                      	});
	                       	}
	           	}));
        	  }),
           "headerCallback": this.proxy(function( thead, data, start, end, display ) {
           }),
            "rowCallback": this.proxy(function(row, data, index){
            	$(row).data("all_data", [data.checkType, data.improveUnit, data.operator, data.target, data.itemPoint,
            	 data.auditReason, data.improveReason, data.improveMeasure, data.auditResult, data.confirmResult,
            	 data.improveLastDate, data.improveRemark, data.improveDate, data.improveItemStatus]);
            	 $('[data-toggle="popover"]',$(row)).popover({
                     html: 'true',
                     trigger: 'hover',
                 });
         })
       });
	    this.issueaudittable.off("click", "input.all").on("click", "input.all", this.proxy(function(e){
	    	var $e = $(e.currentTarget), check = $e.prop("checked");
	    	this.issueaudittable.find('input.single').prop("checked", check);
	    	return ;
	    }));
	},
	_exportExcel:function(ent){
		var type=$("#navtabs").find("li.active>a").attr("href"),
		    $type=$(type), checkArr = $type.find('input.single:checked');
		var obj = this.getAuditData();
	  	var obj2 = $.param(obj);
 		var actionstr=$.u.config.constant.smsqueryserver+"?method=exportImproveIssueToExcel&tokenid="+
		$.cookie("tokenid")+
		"&" + obj2;
		//"&datas="+ JSON.stringify(datas);
    	var form = $("<form>");
        form.attr('style', 'display:none');
        form.attr('target', '_blank');
        form.attr('method', 'post');
        form.attr('action', actionstr);
        form.appendTo('body').submit().remove();
	},

	 transform_data_type:function(data){
	    	var uuu=data;
	    	var str = "{";
	    	for(i in uuu){
	    		if(parseInt(i)+1 != uuu.length){
	    			str += '"' + uuu[i].name + '":"' +uuu[i].value + '",';
	    		}else{
	    			str += '"' + uuu[i].name + '":"' +uuu[i].value + '"';
	    		}
	    	}
	    	str += "}";
	    	return JSON.parse(str);
	    	//{s: "1", f: "2", v: "3"}
	    },
    /**
     * @title ajax
     * @param url {string} url
     * @param param {object} ajax param
     * @param $container {jQuery object} the object for block
     * @param blockParam {object} blockui param
     * @param callback {function} callback
     */
    _ajax:function(url,param,$container,blockParam,callback){
    	$.u.ajax({
    		"url":url,
    		"type": url.indexOf(".json") > -1 ? "get" : "post" ,
    		"data":$.cookie("tokenid") ? $.extend({"tokenid":$.parseJSON($.cookie("tokenid"))},param) : $.extend({"tokenid":$.parseJSON($.cookie("uskyuser")).tokenid},param),
    		"dataType":"json"
    	},$container,$.extend({},blockParam)).done(this.proxy(function(response){
    		if (response.success) {
    			callback && callback(response);
    		}   		
    	})).fail(this.proxy(function(jqXHR,responseText,responseThrown){
    		
    	}));
    },
    _download_file:function(e){
    	var data = parseInt($(e.currentTarget).attr("fileid"));
        window.open($.u.config.constant.smsqueryserver+"?method=downloadFiles&tokenid="+$.cookie("tokenid")+"&ids="+JSON.stringify([data]));
    },
    destroy: function () {
        this._super();
    }
}, { usehtm: true, usei18n: false });

com.sms.safePromotion.safeTranning.widgetjs = [
                           "../../../uui/widget/uploadify/jquery.uploadify.js",
                           '../../../uui/widget/jqurl/jqurl.js',
                            "../../../uui/widget/jqdatatable/js/jquery.dataTables.js",
                            "../../../uui/widget/select2/js/select2.min.js",
                            "../../../uui/widget/spin/spin.js",
                            "../../../uui/widget/ajax/layoutajax.js"];
com.sms.safePromotion.safeTranning.widgetcss = [
                                         { path: "../../../uui/widget/select2/css/select2.css" }, 
                                         { path: '../../../uui/widget/jqdatatable/css/jquery.dataTables.css' }, 
                                         { path: '../../../uui/widget/jqdatatable/css/dataTables.bootstrap.css' },
                                         { path: "../../../uui/widget/select2/css/select2-bootstrap.css" },
                                         { path:"../../../uui/widget/uploadify/uploadify.css"}];

