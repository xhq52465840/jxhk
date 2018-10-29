//@ sourceURL=com.sms.detailmodule.flyDialog
$.u.define('com.sms.detailmodule.flyDialog', null, {
    init: function (options) {
        this._options = options || {};
        this._select2PageLength = 10;
		this._flightTemplate = '<div class="row"><div class="col-sm-11"><span style="margin-right:10px">#{flightNO}</span><span style="margin-right:10px">#{deptAirportName}</span>—<span  style="margin:0px 10px">#{arrAirportName}</span></div></div>';
    },
    afterrender: function (bodystr) {
    	this.form = this.qid("flyForm");
    	this.date = this.qid("date");								// 航班日期
    	this.flightNumber = this.qid("flightnumber");				// 航班号
    	this.flightPhase = this.qid("phase");						// 飞行阶段
    	this.form.validate({
    		rules:{
    			"date":{"required":true,"dateISO":true},
    			"flightnumber":"required",
    			"phase":"required"
    		},
    		messages:{
    			"date":{"required":"航班日期不能为空","dateISO":"航班日期格式不正确"},
    			"flightnumber":"航班号不能为空",
    			"phase":"飞行阶段不能为空"
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
	        	return item.flightNO;
	        }
    	}).on("select2-open", this.proxy(this.on_select2_open));
	    
	    this.flightPhase.select2({
	    	ajax:{
    			url: $.u.config.constant.smsqueryserver,
    			dataType: "json",
    			type: "post",
    			quietMillis: 250,
	            data: this.proxy(function(term, page){
	            	return {
	            		"tokenid": $.cookie("tokenid"),
	    				"method": "stdcomponent.getbysearch",
	    				"dataobject": "dictionary",
	    				"rule": JSON.stringify([[{"key":"name","op":"like","value":term}],[{"key":"type","value":"飞行阶段"}]]),
	    				"start": (page - 1) * this._select2PageLength,
	    				"length": this._select2PageLength
	    			};
	            }),
		        results:this.proxy(function(response, page, query){ 
		        	if(response.success){return {results:response.data.aaData, more:page * this._select2PageLength < response.data.iTotalRecords};}
		        })
    		},
    		//id:function(item){ return item.id; },
	        formatResult:function(item){ return item.name; },
	        formatSelection:function(item){ return item.name; }
    	}).on("select2-open", this.proxy(this.on_select2_open));
	    
	},
	on_select2_open: function(e){
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
	/**
	 * @title at after dialog close execute
	 * @return void 
	 */
	on_dialog_close:function(){
		this.date.val("");
		this.flightNumber.select2("val","");
		this.flightPhase.select2("val","");
		this.form.validate().resetForm();
	},
	/**
	 * @title at after dialog create execute
	 * @return void 
	 */
	on_dialog_create:function(){
		/*this.date.datepicker({
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
    	});*/
    },
	/**
	 * @title ok event
	 * @return void
	 */
	on_ok_click:function(){
		debugger;
		if(this.form.valid()){
			$.u.ajax({
                url: $.u.config.constant.smsmodifyserver,
                type: "post",
                dataType: "json",
                data: {
                	"tokenid": $.cookie("tokenid"),
            		"method":"stdcomponent.add",
            		"dataobject":"flightInfoEntity",
            		"obj":JSON.stringify({
            			"activity":this._options.activity,
            			"flightInfo":parseInt(this.flightNumber.select2("val")),
            			"flightPhase":parseInt(this.flightPhase.select2("val"))
            		})
                }
            }, this.flyDialog.parent(),{size:2, backgroundColor:"#fff"}).done(this.proxy(function (response) {
                if (response.success) {
                	this.flyDialog.dialog("close");
                    this.refreshList();
                }
            })).fail(this.proxy(function (jqXHR, errorText, errorThrown) {
            	
            }));
		}
	},
	/**
	 * @title cancel event
	 * @return void
	 */
	on_cancel_click:function(){
		this.flyDialog.dialog("close");
	},
	/**
	 * @title open dialog
	 * @param {string} datetime 发生日期yyyy-mm-dd
	 * @return void
	 */
    open: function (datetime) {
    	this.date.val(datetime);
    	this.flyDialog.dialog("open");
    },
    _getFlightHtml: function(flight){
    	return this._flightTemplate.replace(/#\{flightNO\}/g, flight.flightNO)
    							   .replace(/#\{deptAirportName\}/g, flight.deptCityName)
    							   .replace(/#\{arrAirportName\}/g, flight.arrCityName); 
    },
    /**
     * @title function for override
     */
    refreshList:function(){},
    destroy: function () {
    	this.flightNumber.select2("destroy");
    	this.flightPhase.select2("destroy");
    	this.flyDialog.dialog("destroy").remove();
        this._super();
    }
}, { usehtm: true, usei18n: false });


com.sms.detailmodule.flyDialog.widgetjs = ['../../../uui/widget/validation/jquery.validate.js','../../../uui/widget/jqurl/jqurl.js'];
com.sms.detailmodule.flyDialog.widgetcss = [];