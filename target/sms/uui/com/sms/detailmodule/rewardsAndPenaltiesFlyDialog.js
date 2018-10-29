//@ sourceURL=com.sms.detailmodule.rewardsAndPenaltiesFlyDialog
$.u.define('com.sms.detailmodule.rewardsAndPenaltiesFlyDialog', null, {
    init: function (options) {
        this._options = options || {};
        this._select2PageLength = 10;
        this._flightTemplate = '<div class="row">'
        					  +		'<div class="col-sm-3">#{carrier}#{flightNO}</div>'
        					  +		'<div class="col-sm-9">'
        					  +			'<div>起飞机场：#{deptAirportName}</div>'
        					  +			'<div>起飞时间：#{atd}</div>'
        					  +		'</div>'
        					  +'</div>';
    },
    afterrender: function (bodystr) {
    	this.form = this.qid("flyForm");
    	this.date = this.qid("date");
    	this.flightNumber = this.qid("flightnumber");
    	
    	this.form.validate({
    		rules:{
    			"date":{"required":true,"dateISO":true},
    			"flightnumber":"required"
    		},
    		messages:{
    			"date":{"required":"航班日期不能为空","dateISO":"航班日期格式不正确"},
    			"flightnumber":"航班号不能为空"
    		},
    		errorClass: "text-danger text-validate-element",
            errorElement:"div"
    	});
    	
	    this.flyDialog = this.qid("div_flyDialog").dialog({
	    	title:"航班信息",
	        width:540,
	        modal: true,
	        draggable: false,
	        resizable: false,
	        autoOpen: false,
	        buttons: [
	            { text: "添加",click: this.proxy(this.on_ok_click)},
	            { text: "取消","class": "aui-button-link",click: this.proxy(this.on_cancel_click)}
	        ],
	        open: this.proxy(this.on_dialog_open),
	        close: this.proxy(this.on_dialog_close),
	        create: this.proxy(this.on_dialog_create)
	    }); 
	    
		this.date.datepicker({
    		dateFormat: "yy-mm-dd",
    		changeMonth: true,
    		changeYear: true,
    		onSelect: this.proxy(function(dateText, inst){ 
    			if(this.flightDate != dateText){
    				this.flightNumber.select2("val", null);
    			}
    			this.flightDate = dateText;
    		}),
    		onClose: this.proxy(function(){
    			this.flightNumber.select2("enable", this.form.validate().element(this.date));
    		})
    	});
	    
	    this.flightNumber.select2({
	    	ajax:{
    			url: $.u.config.constant.smsqueryserver,
    			dataType: "json",
    			type: "post",
    			quietMillis: 250,
	            data:this.proxy(function(term, page){
	            	return {
	            		"tokenid": $.cookie("tokenid"),
	    				"method": "getBaseInfo",
	    				"dataTime": this.date.val(),
	    				"flightNum": term,
	    				"start": (page - 1) * this._select2PageLength,
	    				"length": this._select2PageLength
	    			};
	            }),
		        results:this.proxy(function(response, page, query){ 
		        	if(response.success){ 
		        		return { 
		        			"results": response.data.aaData, 
		        			"more": (page * this._select2PageLength) < response.data.iTotalRecords 
		        		};
		        	}
		        	else{
		        		$.u.alert.error(response.reason);
		        	}
		        })
    		},
    		id:function(item){ return item.flightInfoID; },
	        formatResult: this.proxy(this._getFlightHtml),
	        formatSelection: function(item){
	        	return item.carrier + item.flightNO;
	        }
    	});
	},
	/**
	 * @title at after dialog open execute
	 * @return void 
	 */
	on_dialog_open:function(){
		var zIndex = parseInt(this.flyDialog.parent().css("z-index"));
        $("body>.ui-dialog:last").css("z-index", zIndex + 2);
        $("body>.ui-widget-overlay:last").css("z-index", 1050);
	},
	on_dialog_close:function(){
		this.date.val("");
		this.flightNumber.select2("val","");
		this.form.validate().resetForm();
	},
	on_ok_click:function(){
		if(this.form.valid()){
			var obj = {
				"flightNo":	this.flightNumber.select2("data").carrier + this.flightNumber.select2("data").flightNO,
				"flightDate": this.flightNumber.select2("data").flightBJDate,
				"aircraftType": "",
				"tailNo":this.flightNumber.select2("data").tailNO
			}
			this.flyDialog.dialog("close");
			this.refreshList(obj);
		}
	},
	on_cancel_click:function(){
		this.flyDialog.dialog("close");
	},
    open: function (type) {
    	this.flyDialog.dialog("open");
    },
    _getFlightHtml: function(flight){
    	return this._flightTemplate.replace(/#\{carrier\}/g, flight.carrier)
    							   .replace(/#\{flightNO\}/g, flight.flightNO)
    							   .replace(/#\{deptAirportName\}/g, flight.deptAirportName)
    							   .replace(/#\{atd\}/g, flight.atd == null ? "" : flight.atd); 
    },
    refreshList:function(){
    	
    },
    destroy: function () {
    	this.flightNumber.select2("destroy");
    	this.flyDialog.dialog("destroy").remove();
        this._super();
    }
}, { usehtm: true, usei18n: false });


com.sms.detailmodule.rewardsAndPenaltiesFlyDialog.widgetjs = ['../../../uui/widget/validation/jquery.validate.js','../../../uui/widget/jqurl/jqurl.js'];
com.sms.detailmodule.rewardsAndPenaltiesFlyDialog.widgetcss = [];