//@ sourceURL=com.sms.detailmodule.riskInformation
$.u.define('com.sms.detailmodule.riskInformation', null, {
    init: function (option) {
    	this._options = option || {};
        this._SELECT2_PAGE_LENGTH = 10;
        /*{
            "mode": "ADD", // EDIT VIEW
            "activityId" : 12,
            "riskId": 12
        }*/        
        this._MODE = {
            ADD: "add",
            EDIT: "edit",
            VIEW: "view"
        };
        this._formData = {};
    },
    afterrender: function (bodystr) {
    	this.i18n = com.sms.detailmodule.riskInformation.i18n;
        this.riskSerialNumberDialog = null;
        this.riskTitleDialog = null;
        this.riskDescDialog = null;
        this.riskAnalysisPersonDialog = null;
        this.systemWorkAnalysisDialog = null;
        this.flightInfo = null;

        this.btnRiskSerialNumber = this.qid("btn_riskSerialNumber");
        this.btnRiskTitle = this.qid("btn_riskTitle");
        this.btnRiskDesc = this.qid("btn_riskDesc");
    	this.btnRiskAnalysisPerson = this.qid("btn_riskAnalysisPerson");
        this.btnSystemWorkAnalysis = this.qid("btn_systemWorkAnalysis");
        this.btnUploadFile = this.qid("btn_uploadFile");
        this.fields = {
            "status": {
                "render": this.proxy(function(full){
                    this.qid("status").text(full.status || "");
                })
            },
            "riskSerialNumber":{
                "render": this.proxy(function(full){
                    this._formData.activity = full.activityId;
                    this.qid("riskSerialNumber").text(full.activityId ? full.unitCode + "-" + full.activityNum : ""); //.attr("href", this.getabsurl("../search/activity.html?activityId=" + full.activityId));
                })
            },
            "riskTitle": {
                "render": this.proxy(function(full){
                    this.btnRiskTitle.data("data", full.rsummary || "");
                    this.qid("riskTitle").text(full.rsummary || "");    //  activitySummary 
                })
            },
            "riskDesc": {
                "render": this.proxy(function(full){
                    this.btnRiskDesc.data("data", full.rdescription || "");
                    this.qid("riskDesc").text(full.rdescription || ""); // activityDescription
                })
            },
            "attachment" : {
                "render": this.proxy(function(full){
                    var $container = this.qid("attachment"), $a = null;
                    $container.empty();
                    if(full.activityId){
                        this._ajax({
                            data: {
                                "method": "getFilesBySource",
                                "source": full.activityId,
                                "sourceType": 3
                            },
                            block: this.qid("attachment"),
                            callback: this.proxy(function(response){
                                if(response.success){
                                    $.each(response.data.aaData, this.proxy(function(idx, file){
                                        $a = $("<li><a href='#' class='downfile'></a></li>").appendTo($container).children("a");
                                        $a.attr({
                                            "data-fileid": file.id,
                                            "title": file.fileName
                                        }).text(file.fileName);
                                        if(file.deletable === true){
                                            $("<i class='fa fa-trash-o uui-cursor-pointer mode-edit removeAttachment' style='padding-left: 5px;' title='" + this.i18n.buttons.deleteFile + "' data-id='" + file.id + "'></i>").insertAfter($a);
                                        }
                                    }));
                                    if(this._options.mode !== this._MODE.EDIT || this._options.editable !== true){
                                        $container.find(".removeAttachment").remove();
                                    }
                                    if(response.addable !== true){
                                        this.qid("file-upload").remove();                                        
                                    }
                                }
                            })
                        });
                    }
                })
            },
            "createdTime": {
                "render": this.proxy(function(full){
                    this.qid("createdTime").text(full.date || "");
                })
            },
            "createdUser": {
                "render": this.proxy(function(full){
                    if(full.fullname){
                        this.qid("createdUser").text(full.fullname + "(" + (full.username || "") + ")");
                    }
                })
            },
            "riskAnalysisPerson": {
                "render": this.proxy(function(full){
                    this.qid("riskAnalysisPerson").text(full.riskAnalysts || "");
                    this.btnRiskAnalysisPerson.data("data", full.riskAnalysts);
                })
            },
            "systemWorkAnalysis":  {
                "render": this.proxy(function(full){ 
                    this.qid("systemWorkAnalysis").empty();
                    try{
                        if(full.systems){
                            var jsonData = JSON.parse(full.systems);
                            this.btnSystemWorkAnalysis.data("data", jsonData);
                            $.each(jsonData, this.proxy(function(idx, item){
                                $("<label/>").addClass("label label-success").text(item.name).appendTo(this.qid("systemWorkAnalysis"));
                            }));
                        }
                    }catch(e){}
                })
            },
            "departureAirport":  {
                "render": this.proxy(function(full){
                    this.qid("departureAirport").text("").attr({
                        "href": "#",
                        "data-param": JSON.stringify({})
                    });
                    if(full.departureAirport && full.departureAirport.name){
                        this.qid("departureAirport").text(full.departureAirport.name).attr({
                            "href": "#",
                            "data-param": JSON.stringify({"iATACode": full.departureAirport.code})
                        });
                    }
                })
            },
            "arrivalAirport":  {
                "render": this.proxy(function(full){
                    this.qid("arrivalAirport").text("").attr({
                        "href": "#",
                        "data-param": JSON.stringify({})
                    });
                    if(full.arrivalAirport && full.arrivalAirport.name){
                        this.qid("arrivalAirport").text(full.arrivalAirport.name).attr({
                            "href": "#",
                            "data-param": JSON.stringify({"iATACode": full.arrivalAirport.code})
                        });
                    }                    
                })
            },            
            "stopovers":  {
                "render": this.proxy(function(full){
                    var $contianer = this.qid("stopovers");
                    $contianer.empty();
                    if(full.stopovers){
                        full.stopovers.sort(function(x, y){ return x.sequence > y.sequence; });
                        $.each(full.stopovers, this.proxy(function(idx, item){
                            $("<a class='flightInfoView' href='#' data-type='riskairport' style='padding-right: 10px;' data-param='" + JSON.stringify({"iATACode": item.code}) + "'></a>").text(item.name).appendTo($contianer);
                            // $("<span class='uui-cursor-pointer flightInfoView' data-type='riskairport' data-param='" + JSON.stringify({"iATACode": item.code}) + "' style='white-space: normal;'/>").addClass("label label-success").text(item.name).appendTo($contianer);
                            // $('<li class="stopover"><a href="#" data-type="riskairport" data-param="' + JSON.stringify({"iATACode": item.code}) + '" class="flightInfoView">' + item.name + '</a></li>').insertAfter($sender);
                        }));
                    }
                })
            },
            "unit": {
                "render": this.proxy(function(full){
                    this.qid("unitDisplayName").text(full.unit || "");
                })
            },
            "aircraftTypes":  {
                "render": this.proxy(function(full){
                    var $container = this.qid("aircraftTypes");
                    $container.empty();
                    if(full.aircraftTypes){
                        full.aircraftTypes.sort(function(x, y){
                            return x.sequence > y.sequence;
                        });
                        $.each(full.aircraftTypes, this.proxy(function(idx, item){
                            $("<span style='white-space: normal;' />").addClass("label label-success").text(item.type).appendTo($container);
                            // $("<a style='margin-right:10px;'/>").attr("href", "#").text(item.type).appendTo(this.qid("aircraftTypes"));
                        }));
                    }
                })
            },
            "unSafeEvent":  {
                "render": this.proxy(function(full){
                    var $target = this.qid("unSafeEvent"), 
                        $li = $target.closest("li"), 
                        filterRule = {
                            propid: "type",
                            propname: "类型",
                            propvalue: [],
                            propshow: "",
                            propplugin: "com.sms.plugin.search.typeProp"
                        };
                    if(full.activityId){
                        $li.addClass("hidden");
                        this._ajax({
                            data: {
                                method: "stdcomponent.getbysearch",
                                dataobject: "activityType"
                            },
                            block: $li,
                            callback: this.proxy(function(response){
                                if(response.success){
                                    $.each(response.data.aaData, this.proxy(function(idx, item){
                                        filterRule.propvalue = [ {id: item.id, name: item.name, url: this.getabsurl(item.url) } ];
                                        filterRule.propshow = item.name;
                                        $("<a/>").attr("href", $.urlBuilder(this.getabsurl("../search/Search.html"), {"filterRule": escape(JSON.stringify(filterRule))})).text(item.name).appendTo( $("<li/>").insertBefore($li) );
                                    }));
                                }
                            })
                        });
                    }
                    else{
                        $li.addClass("hidden");
                    }
                })
            },
            "hazard":  {
                "render": this.proxy(function(full){
                    var $target = this.qid("hazard");
                    if(full.activityId){
                        $target.closest("li").removeClass("hidden");
                        $target.attr("href", this.getabsurl("../safelib/ViewLibrary.html?name=" + escape("危险源")));
                    }
                    else{
                        $target.closest("li").addClass("hidden");
                    }
                })
            },
            "risk":  {
                "render": this.proxy(function(full){
                    var $target = this.qid("risk");
                    if(full.activityId){
                        $target.closest("li").removeClass("hidden");
                        $target.attr("href", this.getabsurl("../safelib/ViewLibrary.html?name=" + escape("风险通告")));
                    }
                    else{
                        $target.closest("li").addClass("hidden");
                    }
                })
            },
            "arp":  {
                "render": this.proxy(function(full){
                    var $target = this.qid("arp");
                    if(full.activityId){
                        $target.closest("li").removeClass("hidden");
                    }
                    else{
                        $target.closest("li").addClass("hidden");
                    }
                })
            },
            "chart":  {
                "render": this.proxy(function(full){
                    var $target = this.qid("chart");
                    if(full.activityId){
                        $target.closest("li").removeClass("hidden");
                    }
                    else{
                        $target.closest("li").addClass("hidden");
                    }
                })
            }
        };

        this.qid("attachment").on("click", "a", this.proxy(this.on_downFile_click));
      
    },
    on_riskSerialNumber_click: function(e){
        if(!this.riskSerialNumberDialog){
            var clz = $.u.load("com.sms.common.stdComponentOperate");
            this.riskSerialNumberDialog = new clz(this.$.find("[umid=riskSerialNumberDialog]"), {
                "title": this.i18n.dialog.riskSerialNumberTitle,
                "fields": [
                    {
                        "name": "activity",
                        "label": this.i18n.form.riskSerialNumber,
                        "type": "select",
                        "rule": {required:true},
                        "message": this.i18n.messages.riskSerialNumberNotNull,
                        "option": {
                            ajax: {
                                data: this.proxy(function(term, page){
                                    return {
                                        "tokenid": $.cookie("tokenid"),
                                        "method": "stdcomponent.getbysearch",
                                        "rule": JSON.stringify([[{"key":"summary","op":"like","value":term}],[{"key":"type.name","value":"专项风险管理"},{"key":"type.name","value":"新开航线"}]]),  //[{"key":"status.name","value":"风险管理"}]
                                        "start": (page - 1) * this._SELECT2_PAGE_LENGTH,
                                        "length": this._SELECT2_PAGE_LENGTH,
                                        "dataobject": "activity"
                                    };
                                })
                            },
                            formatSelection: function(item){
                                return item.unit.code + "-" + item.num + " (" + item.summary + ")";
                            },
                            formatResult: function(item){
                                return item.unit.code + "-" + item.num + " (" + item.summary + ")";
                            }
                        }
                    }
                ],
                "add": this.proxy(function(comp, formdata){  
                    var activity = this.riskSerialNumberDialog.formDialog.find("[name=activity]").select2("data");
                    if(this._options.riskId){
                        this._modifyRisk({
                            "obj": { "activity" : activity.id },
                            "block": this.riskSerialNumberDialog.formDialog.parent(),
                            "callback": this.proxy(function(response){
                                if(response.success){
                                	this.qid("file-upload").removeClass("hidden");
                                    this._loadActivityInfo(activity.id);
                                    this.riskSerialNumberDialog.formDialog.dialog("close");
                                }
                            })
                        });
                    }else{
                        this._loadActivityInfo(activity.id);
                        this.riskSerialNumberDialog.formDialog.dialog("close");
                    }
                })
            });
        }
        this.riskSerialNumberDialog.open();
    },
    on_riskTitle_click: function(e){
        var $this = $(e.currentTarget);
        if(!this.riskTitleDialog){
            var clz = $.u.load("com.sms.common.stdComponentOperate");
            this.riskTitleDialog = new clz(this.$.find("[umid=riskTitleDialog]"), {
                "title": this.i18n.dialog.riskTitle,
                "fields": [
                    {
                        "name": "rsummary",
                        "label": this.i18n.form.riskTitle,
                        "type": "text",
                        "maxlength": 255
                    }
                ],
                "edit": this.proxy(function(comp, formdata){
                    if(this._options.riskId){
                        this._modifyRisk({
                            "obj": { "rsummary" : formdata.rsummary },
                            "block": this.riskTitleDialog.formDialog.parent(),
                            "callback": this.proxy(function(response){
                                if(response.success){
                                    this.fields.riskTitle.render({ "rsummary" : formdata.rsummary });                             
                                    this.riskTitleDialog.formDialog.dialog("close");
                                }
                            })
                        });
                    }else{
                        this._formData.rsummary = formdata.rsummary;    
                        this.fields.riskTitle.render({ "rsummary" : formdata.rsummary });                                                 
                        this.riskTitleDialog.formDialog.dialog("close");
                    }
                })
            });
        }
        this.riskTitleDialog.open({
            "title": this.i18n.dialog.riskTitle,
            "data": {"rsummary":$this.data("data")}
        });
    },
    on_riskDesc_click: function(e){
        var $this = $(e.currentTarget);
        if(!this.riskDescDialog){
            var clz = $.u.load("com.sms.common.stdComponentOperate");
            this.riskDescDialog = new clz(this.$.find("[umid=riskDescDialog]"), {
                "title": this.i18n.dialog.riskDesc,
                "fields": [
                    {
                        "name": "rdescription",
                        "label": this.i18n.form.riskDesc,
                        "type": "textarea",
                        "maxlength": 2000
                    }
                ],
                "edit": this.proxy(function(comp, formdata){
                    if(this._options.riskId){
                        this._modifyRisk({
                            "obj": { "rdescription" : formdata.rdescription },
                            "block": this.riskDescDialog.formDialog.parent(),
                            "callback": this.proxy(function(response){
                                if(response.success){
                                    this.fields.riskDesc.render({ "rdescription" : formdata.rdescription });                             
                                    this.riskDescDialog.formDialog.dialog("close");
                                }
                            })
                        });
                    }else{
                        this._formData.rdescription = formdata.rdescription;    
                        this.fields.riskDesc.render({ "rdescription" : formdata.rdescription });                                                 
                        this.riskDescDialog.formDialog.dialog("close");
                    }
                })
            });
        }
        this.riskDescDialog.open({
            "title": this.i18n.dialog.riskDesc,
            "data": {"rdescription":$this.data("data")}
        });
    },
    on_riskAnalysisPerson_click: function(e){
        var $this = $(e.currentTarget);
        if(!this.riskAnalysisPersonDialog){
            var clz = $.u.load("com.sms.common.stdComponentOperate");
            this.riskAnalysisPersonDialog = new clz(this.$.find("[umid=riskAnalysisPersonDialog]"), {
                "title": this.i18n.dialog.riskAnalysisPersonTitle,
                "fields": [
                    {
                        "name": "riskAnalysts",
                        "label": this.i18n.form.riskAnalysisPerson,
                        "type": "text",
                        "maxlength": 100
                    }
                ],
                "edit": this.proxy(function(comp, formdata){
                    if(this._options.riskId){
                        this._modifyRisk({
                            "obj": { "riskAnalysts" : formdata.riskAnalysts },
                            "block": this.riskAnalysisPersonDialog.formDialog.parent(),
                            "callback": this.proxy(function(response){
                                if(response.success){
                                    this.fields.riskAnalysisPerson.render({ "riskAnalysts" : formdata.riskAnalysts });                             
                                    this.riskAnalysisPersonDialog.formDialog.dialog("close");
                                }
                            })
                        });
                    }else{
                        this._formData.riskAnalysts = formdata.riskAnalysts;    
                        this.fields.riskAnalysisPerson.render({ "riskAnalysts" : formdata.riskAnalysts });                                                 
                        this.riskAnalysisPersonDialog.formDialog.dialog("close");
                    }
                })
            });
        }
        this.riskAnalysisPersonDialog.open({
            "title": this.i18n.dialog.riskAnalysisPersonTitle,
            "data": {"riskAnalysts":$this.data("data")}
        });
    },
    on_systemWorkAnalysis_click: function(e){
        var $this = $(e.currentTarget);
        if(!this.systemWorkAnalysisDialog){
            var clz = $.u.load("com.sms.common.stdComponentOperate");
            this.systemWorkAnalysisDialog = new clz(this.$.find("[umid=systemWorkAnalysisDialog]"), {
                "title": this.i18n.dialog.systemWorkAnalysisTitle,
                "fields": [
                    {
                        "name": "systems",
                        "label": this.i18n.form.systemWorkAnalysis,
                        "type": "select",
                        "option": {
                            params: { "dataobject": "dictionary" },
                            multiple: true,
                            ajax: {
                                data: this.proxy(function(term, page){
                                    return {
                                        "tokenid": $.cookie("tokenid"),
                                        "method": "stdcomponent.getbysearch",
                                        "rule": JSON.stringify([[{"key":"name","op":"like","value":term}],[{"key":"type","value":"系统分类"}]]),
                                        "start": (page - 1) * this._SELECT2_PAGE_LENGTH,
                                        "length": this._SELECT2_PAGE_LENGTH,
                                        "dataobject": "dictionary"
                                    };
                                }),
                                success: this.proxy(function(response,page){
                                    if(response.success){
                                        return {
                                            "results": $.map(response.data.aaData, function(item, idx){
                                                return {"id":item.id, "name":item.name};
                                            }),
                                            "more": response.data.iTotalRecords > (page * this._SELECT2_PAGE_LENGTH)
                                        }
                                    }else{
                                        $.u.alert.error(response.reason, 1000 * 3);
                                    }
                                })
                            }
                        }
                    }
                ],
                "edit": this.proxy(function(comp, formdata){
                    var systems = this.systemWorkAnalysisDialog.formDialog.find("[name=systems]").select2("data");
                    if(this._options.riskId){
                        this._modifyRisk({
                            "obj": {"systems":JSON.stringify(systems)},
                            "block": this.systemWorkAnalysisDialog.formDialog.parent(),
                            "callback": this.proxy(function(response){
                                if(response.success){
                                    this.fields.systemWorkAnalysis.render({"systems": JSON.stringify(systems)});
                                    this.systemWorkAnalysisDialog.formDialog.dialog("close");
                                }
                            })
                        });
                    }else{
                        this._formData.systems = JSON.stringify(systems);
                        this.fields.systemWorkAnalysis.render({"systems": JSON.stringify(systems)});
                        this.systemWorkAnalysisDialog.formDialog.dialog("close");
                    }
                })
            });
        }
        this.systemWorkAnalysisDialog.open({
            "data": {"systems": $this.data("data")},
            "title": this.i18n.dialog.systemWorkAnalysisTitle
        });
    },
    on_flightInfoView_click: function(e){
        e.preventDefault();
        var $this = $(e.currentTarget),
            option = {},
            position=$this.position();
        try{
            option = {
                type: $this.attr("data-type"),
                param: JSON.parse($this.attr("data-param"))
            };
            this.qid("flightinfoview").removeClass("hidden").animate({top:position.top + $this.height() + 6, left:position.left - 30});
            if(!this.flightInfo){
                $.u.load("com.sms.detailmodule.flightInfo");
            }else{
                this.flightInfo.destroy();
                this.flightInfo = null;
            }
            this.flightInfo = new com.sms.detailmodule.flightInfo( $("div[umid=flightinfomodule]",this.$), option );
            $("body").unbind("mousedown").bind("mousedown",this.proxy(function(e){
                var $this = $(e.target);
                if($this.hasClass("flightinfoview")){
                    $("body").unbind("mousedown");
                }else if($this.closest("div.flightinfo").length < 1){
                    this.qid("flightinfoview").addClass("hidden");
                    $("body").unbind("mousedown");
                }
            }));
        }catch(e){
            
        }
    },
    on_uploadFile_click: function(e){
        this.qid("file-upload").uploadify('upload','*');
    },
    on_downFile_click: function(e){
        e.preventDefault();
        var $this = $(e.currentTarget), id = parseInt($this.attr("data-fileid"));
        window.open($.u.config.constant.smsqueryserver+"?method=downloadFiles&tokenid="+$.cookie("tokenid")+"&ids="+JSON.stringify([id])+"&url="+window.encodeURIComponent(window.location.host + window.location.pathname + window.location.search));
    },
    on_deleteFile_click: function(e){
        var $this = $(e.currentTarget), id = parseInt($this.attr("data-id"));
        var clz = $.u.load("com.sms.common.stdcomponentdelete");
        (new clz({
            body: this.i18n.messages.deleteFileConfirm,
            dataobject: "file",
            dataobjectids: JSON.stringify([id])
        })).override({
            refreshDataTable:this.proxy(function(){
                $this.closest("li").remove();
            })
        });
    },
    fillForm: function(data){
        if(data){
            this._formData = data;
            if(data.departureAirport && data.arrivalAirport){
                this.qid("riskInformationWidget").removeClass("hidden");
            }else{
                this.qid("riskInformationWidget").addClass("hidden");
            }
            $.each(this.fields, function(key, field){
                field.render(data);
            });
        }
    },
    options: function(opt){
        if(opt){
            $.extend(true, this._options, opt);
        }
    },
    entryMode: function(){ 
        if(this._options.mode === this._MODE.VIEW){

        }else{
            this.btnRiskSerialNumber.unbind("click").click(this.proxy(this.on_riskSerialNumber_click));
            this.btnRiskTitle.unbind("click").click(this.proxy(this.on_riskTitle_click));
            this.btnRiskDesc.unbind("click").click(this.proxy(this.on_riskDesc_click));
            this.btnRiskAnalysisPerson.unbind("click").click(this.proxy(this.on_riskAnalysisPerson_click));
            this.btnSystemWorkAnalysis.unbind("click").click(this.proxy(this.on_systemWorkAnalysis_click));
            this.btnUploadFile.unbind("click").click(this.proxy(this.on_uploadFile_click));
            this.qid("flightInfoLink").on("click", ".flightInfoView", this.proxy(this.on_flightInfoView_click));
            
            if(this._options.mode === this._MODE.ADD && this._options.activityId){    
                this._loadActivityInfo(this._options.activityId);
            }else if(this._options.mode === this._MODE.EDIT){
                this.qid("attachment").off("click", ".removeAttachment").on("click", ".removeAttachment", this.proxy(this.on_deleteFile_click));
                this.qid("btn_riskSerialNumber").css("margin-right", "70px");
                this.qid("file-upload").uploadify({
                    'auto':true,
                    'swf': this.getabsurl('../../../uui/widget/uploadify/uploadify.swf'),
                    'uploader': $.u.config.constant.smsmodifyserver+";jsessionid="+$.cookie("sessionid"),
                    'fileTypeDesc':'doc', //文件类型描述
                    'fileTypeExts':'*.*',//可上传文件格式 *.doc;*.docx;*.rar;*.xls;*.ppt;*.ppt;*.pdf;*.jpg;*.bmp;*.png;*.xlsx;*.pptx;
                    'removeCompleted': true,
                    'buttonText': this.i18n.buttons.upload, //按钮上的字
                    'cancelImg':this.getabsurl('../../../uui/widget/uploadify/uploadify-cancel.png'),
                    'height': 25,   //按钮的高度和宽度
                    'width': 70,
                    'progressData':'speed',
                    'method': 'get',
                    'removeTimeout': 3,
                    'successTimeout': 99999,
                    'multi': false, //单个上传
                    'fileSizeLimit':'10MB',
                    'queueSizeLimit':999,
                    'simUploadLimit':999,
                    'onQueueComplete':this.proxy(function(queueData){
                        if(queueData.uploadsErrored < 1){
                            
                        }else{
                            $.u.alert.error(data.reason, 1000 * 3);
                        }
                    }),
                    'onUploadStart':this.proxy(function(file) {
                        var data = {};
                        data.method = "uploadFiles";
                        data.tokenid = $.cookie("tokenid");
                        data.source = this._formData.activity;
                        data.sourceType = 3;
                        data.attachmentType = 3;
                        this.qid("file-upload").uploadify('settings', 'formData', data);
                        this.$.find(".uploadify-queue").removeClass("hidden");
                    }),
                    'onUploadSuccess':this.proxy(function(file, data, response) {
                        if(data){
                            data = JSON.parse(data);
                            if(data.success){
                                this.$.find(".uploadify-queue").addClass("hidden");
                                $.u.alert.success(this.i18n.messages.uploadSuccess);
                                this.qid("file-upload").uploadify('cancel', '*');
                                this.fields.attachment.render({"activityId": this._formData.activity});
                            }else{
                                $.u.alert.error(data.reason, 1000 * 3);
                            }
                        }
                    })
                });
                 this.qid("file-upload").css({
                    "position": "absolute",
                    "right": "5px",
                    "top": "5px"
                 });
                 if(this._formData.activity){
                	 this.qid("file-upload").removeClass("hidden"); // upload file only at edit model
                 }
                 else{
                	 this.qid("file-upload").addClass("hidden");
                 }
                this.$.find(".uploadify-queue").addClass("hidden");
            }
        }
    },
    getFormData: function(){
        return this._formData;
    },
    _modifyRisk: function(param){
        this._ajax({
            url: $.u.config.constant.smsmodifyserver,
            data: {
                "method": "stdcomponent.update",
                "dataobject": "risk",
                "dataobjectid": this._options.riskId,
                "obj": JSON.stringify(param.obj)
            },
            block: param.block,
            callback: param.callback
        });
    },
    _loadActivityInfo: function(id){
        this._ajax({
            data: {
                "method": "getActivityInfoOfRisk",
                "activity": id
            },
            block: this.$,
            callback: function(response){               
                if(response.success){
                    var fieldArray = ["riskSerialNumber", "riskDesc", "riskTitle", "attachment", "departureAirport", "arrivalAirport", "stopovers", "unit", "aircraftTypes"]; 
                    if(response.data.departureAirport && response.data.arrivalAirport){
                        this.qid("riskInformationWidget").removeClass("hidden");
                    }else{
                        this.qid("riskInformationWidget").addClass("hidden");
                    }
                    response.data.rsummary = response.data.activitySummary;
                    response.data.rdescription = response.data.activityDescription;
                    this._formData.rsummary = response.data.activitySummary;
                    this._formData.rdescription = response.data.activityDescription;
                    $.each(fieldArray, this.proxy(function(idx, field){
                        this.fields[field].render(response.data);
                    }));
                }
            }
        });
    },
    _ajax: function(param){
        $.u.ajax({
            url: param.url || $.u.config.constant.smsqueryserver,
            type: "post",
            dataType: "json",
            data: $.extend(true, {
                "tokenid": $.cookie("tokenid")
            }, (param.data || {}) )
        }, param.block).done(this.proxy(param.callback));
    },
    destroy: function () {
    	this._super(); 
    }
}, { usehtm: true, usei18n: true });


com.sms.detailmodule.riskInformation.widgetjs = ["../../../uui/widget/uploadify/jquery.uploadify.js",
                                                 "../../../uui/widget/spin/spin.js", 
                                                 "../../../uui/widget/jqblockui/jquery.blockUI.js",
                                                 "../../../uui/widget/ajax/layoutajax.js"];
com.sms.detailmodule.riskInformation.widgetcss = [{id:"",path:"../../../uui/widget/uploadify/uploadify.css"}];