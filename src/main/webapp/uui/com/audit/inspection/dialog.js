//@ sourceURL=com.audit.inspection.dialog
$.u.define('com.audit.inspection.dialog', null, {
    init: function (options) {
    	this._options = options;
        this._select2PageLength = 10;
        this._select2Options = {
        	placeholder:"请选择", 
        	allowClear: true,
            ajax:{
                url: $.u.config.constant.smsqueryserver,
                type: "post",
                dataType: "json",
                data: this.proxy(function(term,page){
                	var d = {
	        			"tokenid": $.cookie("tokenid"),
	                    "method": "getAddedImproveUnits",
	                    "improveNoticeType": this._options.checkGrade,
	                    "term": term,
	                    "unitId":this._options.operator,
	                    "start": (page - 1) * this._select2PageLength,
	                    "length": this._select2PageLength
                	};
                	/*if(this._options.checktype && this._options.checktype === "SYS"){
                		d = {
                            "tokenid": $.cookie("tokenid"),
                            "method": "getResponsibilityUnits",
                            "term": term,
                            "start": (page - 1) * this._select2PageLength,
                            "length": this._select2PageLength
                        }
                	}else{
                		d = {
                            "tokenid": $.cookie("tokenid"),
                            "method": "getResponsibilityUnits",
                            "checkId":this.checkId,
                            "term": term,
                            "start": (page - 1) * this._select2PageLength,
                            "length": this._select2PageLength
                        }
                	}*/
                    return d;
                }),
                results:this.proxy(function(response,page){
                    if (response.success) {
                        return {
                            results:response.data.aaData,
                            more: response.data.iTotalRecords > (page * this._select2PageLength)
                        };
                    } 
                    
                })
            },
            formatResult: function(item){
                return item.name;           
            },
            formatSelection: function(item){
                return item.name;               
            }
        };
        this._data = null;
        this._checkListId = null;
    },
    afterrender: function (bodystr) {
        this.recordForm = this.qid("recordForm");
        this.fields = {
            itemPoint: {
                val: this.proxy(function(v){
                    if(v){
                        this.qid("itemPoint").val(v.itemPoint || "");
                    }
                    else{
                        return this.qid("itemPoint").val();
                    }
                }),
                disable: this.proxy(function(){
                    this.qid("itemPoint").attr("disabled", true);
                })
            },
            itemAccording: {
                val: this.proxy(function(v){
                    if(v){
                        this.qid("itemAccording").val(v.itemAccording || "");
                    }
                    else{
                        return this.qid("itemAccording").val();
                    }
                }),
                disable: this.proxy(function(){
                    this.qid("itemAccording").attr("disabled", true);
                })
            },
            itemPrompt: {
                val: this.proxy(function(v){
                    if(v){
                        this.qid("itemPrompt").val(v.itemPrompt || "");
                    }
                    else{
                        return this.qid("itemPrompt").val();
                    }
                }),
                disable: this.proxy(function(){
                    this.qid("itemPrompt").attr("disabled", true);
                })
            },
            auditRecord: {
                val: this.proxy(function(v){
                    if(v){
                        this.qid("auditRecord").val(v.auditRecord || "");
                    }
                    else{
                        return this.qid("auditRecord").val();
                    }
                }),
                disable: this.proxy(function(){
                    this.qid("auditRecord").attr("disabled", true);
                })
            },
            auditResult: {
                val: this.proxy(function(v){
                    var result = null;
                    if(v && v.auditResult && v.auditResultDisplayName){
                        this.qid("auditResult").select2("data", {
                            id: v.auditResult,
                            name: v.auditResultDisplayName
                        });
                        if(v.auditResultDisplayName === "符合项" || v.auditResultDisplayName === "不适用"){
                        	this.qid("auditRecord-tip").addClass("hidden");
                        	this.qid("auditRecord").addClass("ignore");
                        	this.qid("improveUnit-tip").addClass("hidden");
                        	this.qid("improveUnit").addClass("ignore");
                            this.qid("improveLastDate-tip").addClass("hidden");
                            this.qid("improveLastDate").addClass("ignore");
                        }
                    }
                    else{
                        result = this.qid("auditResult").select2("val");
                    }
                    return $.isNumeric(result) ? parseInt(result) : result;
                }),
                disable: this.proxy(function(){
                    this.qid("auditResult").select2("enable", false);
                }),
                init: this.proxy(function(){
                    this.qid("auditResult").select2( $.extend(true, {}, this._select2Options, {
                    	allowClear: false,
                        ajax: {
                            data: this.proxy(function(term, page){
                                return {
                                    tokenid: $.cookie("tokenid"),
                                    method: "stdcomponent.getbysearch",
                                    dataobject: "dictionary",
                                    rule: JSON.stringify([[{"key": "name", "op": "like", "value": term}], [{"key": "type", "value": "审计结论"}]]),
                                    start: (page - 1) * this._select2PageLength,
                                    length: this._select2PageLength
                                };
                            })
                        }
                    }) ).on("select2-selecting", this.proxy(function(e){
                        if(e && e.object && (e.object.name === "符合项" || e.object.name === "不适用")){
                        	this.qid("auditRecord-tip").addClass("hidden");
                        	this.qid("auditRecord").addClass("ignore");
                        	this.qid("improveUnit-tip").addClass("hidden");
                        	this.qid("improveUnit").addClass("ignore");
                            this.qid("improveLastDate-tip").addClass("hidden");
                            this.qid("improveLastDate").addClass("ignore");
                        }
                        else {
                        	this.qid("auditRecord-tip").removeClass("hidden");
                        	this.qid("auditRecord").removeClass("ignore");
                        	this.qid("improveUnit-tip").removeClass("hidden");
                        	this.qid("improveUnit").removeClass("ignore");
                            this.qid("improveLastDate-tip").removeClass("hidden");
                            this.qid("improveLastDate").removeClass("ignore");
                        }
                    }));
                })
            },
            improveLastDate: {
                val: this.proxy(function(v){
                    if(v){
                        this.qid("improveLastDate").val(v.improveLastDate || "");
                    }
                    else{
                        return this.qid("improveLastDate").val();
                    }
                }),
                disable: this.proxy(function(){
                    this.qid("improveLastDate").attr("disabled", true);
                }),
                init: this.proxy(function(){
                    this.qid("improveLastDate").datepicker( { dateFormat:"yy-mm-dd" } );
                })
            },
            improveUnit: {
                val: this.proxy(function(v){
                    if(v){
                        this.qid("improveUnit").select2("data", v.improveUnit || null);
                    }
                    else{
                        var data = this.qid("improveUnit").select2("data");
                        return data ? (data.type ? (data.type + data.id) : data.id) : null;
                    }
                }),
                disable: this.proxy(function(){
                    this.qid("improveUnit").select2("enable", false);
                }),
                init: this.proxy(function(){
                    this.qid("improveUnit").select2( $.extend(true, {}, this._select2Options) );
                })
            },
            auditFiles: {
                val: this.proxy(function(v){
            	    var $tbody = this.qid("auditFiles").children("tbody");
                    $tbody.empty();
                    if(v){
                        if($.isArray(v.auditFiles) && v.auditFiles.length > 0){
                            this.qid("auditFiles").removeClass("hidden");
                            $.each(v.auditFiles, this.proxy(function(idx, file){
                                $("<tr>"+
                                    "<td class='break-word'><a href='#' class='download-file' fileid='" + file.id + "'>" + file.fileName + "</a></td>" +
                                    "<td>" + file.size + "</td>" +
                                    "<td>" + (this._options.editable === false ? "" : "<i class='fa fa-trash-o uui-cursor-pointer delete-file'/>") + "</td>" +
                                  "</tr>").data("data", file).appendTo($tbody);
                            }));
                        }
                    }
                    else{
                    	this.qid("auditFiles").addClass("hidden");
                    }
                }),
                disable: this.proxy(function(){
                    // this.qid("auditFiles").find(".delete-file").remove();
                    // this.qid("auditFiles").siblings().remove();
                    // this.qid("file_upload").uploadify("disable", true);
                }),
                init: this.proxy(function(){
                    this.qid("auditFiles").off("click", ".download-file").on("click", ".download-file", this.proxy(this.on_downloadFile_click));
                    this.qid("file_upload").uploadify({
                        'auto':true,
                        'swf': this.getabsurl('../../../uui/widget/uploadify/uploadify.swf'),
                        'uploader': $.u.config.constant.smsmodifyserver+";jsessionid="+$.cookie("sessionid"),
                        'fileTypeDesc':'doc',
                        'fileTypeExts':'*.*',//可上传文件格式 *.doc;*.docx;*.rar;*.xls;*.ppt;*.ppt;*.pdf;*.jpg;*.bmp;*.png;*.xlsx;*.pptx;
                        'removeCompleted': true,
                        'buttonText': "上传附件",
                        'cancelImg':this.getabsurl('../../../uui/widget/uploadify/uploadify-cancel.png'),
                        'height': 25,   //按钮的高度和宽度
                        'width': 70,
                        'progressData':'speed',
                        'method': 'get',
                        'removeTimeout': 3,
                        'successTimeout': 99999,
                        'multi': true,
                        'fileSizeLimit':'10MB',
                        'queueSizeLimit':999,
                        'simUploadLimit':999,
                        'onQueueComplete':this.proxy(function(queueData){
                            // if(queueData.uploadsErrored < 1){
                                
                            // }else{
                            //     $.u.alert.error(data.reason, 1000 * 3);
                            // }
                        }),
                        "onSWFReady": this.proxy(function(){
                            this.qid("file_upload").uploadify("disable", this._options.editable === false)
                        }),
                        'onUploadStart':this.proxy(function(file) {
                            var data = {
                                tokenid: $.cookie("tokenid"),
                                method: "uploadFiles",
                                sourceType: 4,
                                source: this._checkListId
                            };
                            this.qid("file_upload").uploadify('settings', 'formData', data);
                            this.$.find(".uploadify-queue").removeClass("hidden");
                        }),
                        'onUploadSuccess':this.proxy(function(file, data, response) {
                            if(data){
                                data = JSON.parse(data);
                                if(data.success && data.data && $.isArray(data.data.aaData) && data.data.aaData.length > 0){
                                    var $tbody = this.qid("auditFiles").children("tbody");
                                    var file = data.data.aaData[0];
                                    
                                    this.$.find(".uploadify-queue").addClass("hidden");
                                    if(!this.qid("auditFiles").is(":visible")){
                                        this.qid("auditFiles").removeClass("hidden");
                                    }
                                    $("<tr>"+
                                        "<td class='break-word'><a href='#'>" + file.fileName + "</a></td>" +
                                        "<td>" + file.size + "</td>" +
                                        "<td><i class='fa fa-trash-o uui-cursor-pointer delete-file'/></td>" +
                                      "</tr>").data("data", file).appendTo($tbody);
                                }
                                else{
                                    $.u.alert.error(data.reason, 1000 * 3);
                                }
                            }
                        })
                    });
                })
            }
        };
        this.qid("auditFiles").off("click", ".delete-file").on("click", ".delete-file", this.proxy(this.on_deleteFile_click));
		this._createDialog();
    },
    on_downloadFile_click: function(e){
        var data = parseInt($(e.currentTarget).attr("fileid"));
        window.open($.u.config.constant.smsqueryserver+"?method=downloadFiles&tokenid="+$.cookie("tokenid")+"&ids="+JSON.stringify([data])+"&url="+window.location.href);
    },
    on_deleteFile_click: function(e){
        var $this = $(e.currentTarget),
            $tr = $this.closest("tr"),
            data = $(e.currentTarget).closest("tr").data("data");
        if(data && data.id){
            var clz = $.u.load("com.audit.comm_file.confirm");          
            var confirm = new clz({
                "body": "确认删除？",
                "buttons": {
                    "ok": {
                        "click": this.proxy(function(){
                            $.u.ajax({
                                url: $.u.config.constant.smsmodifyserver,
                                type: "post",
                                dataType: "json",
                                data: {
                                    tokenid: $.cookie("tokenid"),
                                    method: "stdcomponent.delete",
                                    dataobject: "file",
                                    dataobjectids: JSON.stringify([data.id])
                                }                                
                            }, confirm.confirmDialog.parent()).done(this.proxy(function(response){
                                if(response.success){
                                    confirm.confirmDialog.dialog("close");
                                    $tr.fadeOut(this.proxy(function(){
                                        $tr.remove();
                                        if(this.qid("auditFiles").children("tbody").children("tr").length < 1){
                                            this.qid("auditFiles").addClass("hidden");
                                        }
                                    })); 
                                }
                            }));
                        })
                    }
                }
            }); 
        }
    },
	open : function(dataId){
        if(dataId){
            this._checkListId = dataId;
            this.recordDialog.dialog("open");
        }		
	},
	_createDialog : function(){
        var buttons = [];
        if(this._options.copyedit !== false){
            buttons.push({
            	"text":"复制并保存",
                "click":this.proxy(this.on_recordDialog_copy)
            });
        }
        if(this._options.editable !== false){
            buttons.push({
                "text":"保存",
                "click":this.proxy(this.on_recordDialog_save)
            });
        }
        buttons.push({
            "text":"关闭",
            "class":"aui-button-link",
            "click":this.proxy(this.on_recordDialog_cancel)
        });
		this.recordDialog = this.qid("recordDialog").dialog({
        	title:"检查记录",
            width:840,
            modal: true,
            draggable: false,
            resizable: false,
            autoOpen: false,
            buttons: buttons,
            open: this.proxy(this.on_recordDialog_open),
            close: this.proxy(this.on_recordDialog_close),
            create: this.proxy(this.on_recordDialog_create)
        });
	},
    on_recordDialog_open : function(){
        $.u.ajax({
            url: $.u.config.constant.smsqueryserver,
            type: "post",
            dataType: "json",
            data: {
                tokenid: $.cookie("tokenid"),
                method: "stdcomponent.getbyid",
                dataobject: "checkList",
                dataobjectid: this._checkListId
            }
        }, this.recordDialog.parent()).done(this.proxy(function(response){
            if(response.success){
            	this.checkId = response.data.check;//获取checkid
                $.each(this.fields, this.proxy(function(name, field){
                    field.val(response.data || {});
                }));
            }
        }));
    },
	on_recordDialog_close : function(){
		this.recordForm.validate().resetForm();
		$.each(this.fields, this.proxy(function(name, field){
            field.val(null);
        }));
	},
	on_recordDialog_create : function(){
		this.recordForm.validate({
			rules:{
				"improveLastDate": {
                    "required": true,
                    "date": true,
                    "dateISO": true
                },
                "auditRecord": "required",
				"improveUnit": "required"
			},
            ignore: ".ignore",
    		messages:{
				"improveLastDate": {
                    "required":"整改期限不能为空",
                    "date": "日期无效",
                    "dateISO": "日期无效"
                },
                "auditRecord": "审计记录不能为空",
				"improveUnit": "主要责任单位不能为空"
			},
    		errorClass: "text-danger text-validate-element",
            errorElement:"div"
		});

        $.each(this.fields, this.proxy(function(name, field){
            field.init && field.init();
            this._options.editable === false && field.disable();                
        }));
	},
	on_recordDialog_save : function(){
        if(this.recordForm.valid() ){
            if(this.qid("file_upload-queue").children().length > 0){
                this.qid("file_upload").uploadify('upload','*');
            }
            else{
                var formData = {};
                $.each(this.fields, this.proxy(function(name, field){
                    formData[name] = field.val();
                }));
                $.u.ajax({
                    url: $.u.config.constant.smsmodifyserver,
                    type: "post",
                    dataType: "json",
                    data: {
                        tokenid: $.cookie("tokenid"),
                        method: "stdcomponent.update",
                        dataobject: "checkList",
                        dataobjectid: this._checkListId,
                        obj: JSON.stringify(formData)
                    }
                }, this.recordDialog.parent()).done(this.proxy(function(response){
                    if(response.success){
                        $.u.alert.success("保存成功");
                        this.recordDialog.dialog("close");

                        var auditResult = this.qid("auditResult").select2("data");
                        this.refresh($.extend(true, {}, formData, {
                            improveUnit: this.qid("improveUnit").select2("data"),
                            auditResult: auditResult && auditResult.name ? auditResult.name : ""
                        }));
                    }
                }));
            }
        }
	},
	on_recordDialog_copy : function(){
		if(this.recordForm.valid() ){
            if(this.qid("file_upload-queue").children().length > 0){
                this.qid("file_upload").uploadify('upload','*');
            }
            else{
                var formData = {};
                $.each(this.fields, this.proxy(function(name, field){
                    formData[name] = field.val();
                }));
                formData.clone = true;
                $.u.ajax({
                    url: $.u.config.constant.smsmodifyserver,
                    type: "post",
                    dataType: "json",
                    data: {
                        tokenid: $.cookie("tokenid"),
                        method: "updateAndCloneCheckList",
                        dataobjectid: this._checkListId,
                        obj: JSON.stringify(formData)
                    }
                }, this.recordDialog.parent()).done(this.proxy(function(response){
                    if(response.success){
                        $.u.alert.success("保存成功");
                        this.recordDialog.dialog("close");
                        var auditResult = this.qid("auditResult").select2("data");
                        this.refresh($.extend(true, {}, formData, {
                            improveUnit: this.qid("improveUnit").select2("data"),
                            auditResult: auditResult && auditResult.name ? auditResult.name : ""
                        }),response.data);
                    }
                }));
            }
        }
	},
	on_recordDialog_cancel : function(){
		this.recordDialog.dialog("close");
	},
    refresh: function(data){}
}, { usehtm: true, usei18n: false });

com.audit.inspection.dialog.widgetjs = ["../../../uui/widget/uploadify/jquery.uploadify.js",
										"../../../uui/widget/select2/js/select2.min.js",
                                        "../../../uui/widget/spin/spin.js", 
                                        "../../../uui/widget/jqblockui/jquery.blockUI.js",
                                        "../../../uui/widget/ajax/layoutajax.js"
										];
com.audit.inspection.dialog.widgetcss = [{ path: "../../../uui/widget/select2/css/select2.css" }, 
                                         { path: "../../../uui/widget/select2/css/select2-bootstrap.css" },
										 {path:"../../../uui/widget/uploadify/uploadify.css"}];