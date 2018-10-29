//@ sourceURL=com.sms.qar.qardetail
$.u.define('com.sms.qar.qardetail', null, {
    init: function (options) {
        this._options = options;
        this.mode = "ADD";
        this.editUserData = {};
    },
    afterrender: function (bodystr) {
    	this.i18n = com.sms.qar.qardetail.i18n;
    	
    	this.tabList = this.qid("tab-list");   	  	    

        this.qardetail = this.qid("div_user").dialog({
            width:540,
            modal: true,
            draggable: false,
            resizable: false,
            autoOpen: false,
            create: this.proxy(function () {

            }),
            open: this.proxy(function () {
            	$("#airline_code").text(this.editUserData.airline_code);
            	$("#ac_tail").text(this.editUserData.ac_tail);  
            	$("#arrival_airport").text(this.editUserData.arrival_airport);
            	$("#departure_airport").text(this.editUserData.departure_airport);
            	$("#flight_no").text(this.editUserData.flight_no);
            	$("#pro_desc").text(this.editUserData.pro_desc);
            	$("#severity_class_no").text(this.editUserData.severity_class_no);
            	$("#start_date").text(this.editUserData.start_date);
            	$("#takeoff_runway").text(this.editUserData.takeoff_runway);
            	$("#landing_runway").text(this.editUserData.landing_runway);
            	$("#Limit_value").text(this.editUserData.Limit_value);
            	$("#maximum_value").text(this.editUserData.maximum_value);
            	$("#procedure_no").text(this.editUserData.procedure_no);
            	$("#procedure_type").text(this.editUserData.procedure_type);
            	$("#exceedance_duration").text(this.editUserData.exceedance_duration);
            	$("#version_no").text(this.editUserData.version_no);
            	$("#flight_phase_no").text(this.editUserData.flight_phase_no);
            	$("#time_to_peak").text(this.editUserData.time_to_peak);
            	$("#average_gap").text(this.editUserData.average_gap);
            }),
            close: this.proxy(function () {
                
            })
        }); 
    },
    open: function (userdata) {
        var dialogOptions=null;
        if (userdata) {
            this.editUserData = userdata;
            this.mode = "EDIT";
            dialogOptions = {
                title: "QAR事件详细",
                buttons: [
                    {
                        text: "关闭",
                        "class": "aui-button-link",
                        click: this.proxy(function () {
                            this.qardetail.dialog("close");
                        })
                    }
                ]
            };
        }
        this.qardetail.dialog("option",dialogOptions).dialog("open");
    },
    destroy: function () {
        this._super();
        this.qardetail.dialog("destroy").remove();
    }
}, { usehtm: true, usei18n: true });

com.sms.qar.qardetail.widgetjs = ["../../../uui/widget/spin/spin.js",
                                    "../../../uui/widget/jqblockui/jquery.blockUI.js",
                                    "../../../uui/widget/ajax/layoutajax.js"];
com.sms.qar.qardetail.widgetcss = [];