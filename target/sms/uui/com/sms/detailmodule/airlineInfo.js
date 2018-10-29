//@ sourceURL=com.sms.detailmodule.airlineInfo
$.u.define('com.sms.detailmodule.airlineInfo', null, {
    init: function (option) {
    	this._options = option || {};
        this._data = null;
    	this._SELECT2_OPTION = {
            width: "100%",
            ajax: {
                url: $.u.config.constant.smsqueryserver,
                type: "post",
                results: this.proxy(function(response, page){
                    if( response.success ) {
                        return {
                            "results": response.data.aaData,
                            "more": (page * 10) < response.data.iTotalRecords
                        };
                    } else {
                        $.u.alert.error( response.reason );
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
        this._AIRPORT_SELECT2_OPTION = $.extend( true, {}, this._SELECT2_OPTION, {
            ajax: {
                data: this.proxy(function(term, page){
                    return {
                        "tokenid": $.cookie("tokenid"),
                        "method": "getAirportBySearch",
                        "term": term,
                        "start": ( page - 1 ) * 10,
                        "length": 10
                    };
                }),
                results: this.proxy(function(response, page){
                    if(response.success){
                        return {
                            "results": $.map(response.data.aaData, function(item, idx){
                                return { 
                                    "iCaoCode": item.iCaoCode,
                                    "name": $.trim( item.fullName || item.shortName || item.fullEnName || item.shortEnName )
                                }
                            }),
                            "more": page * 10 < response.data.iTotalRecords
                        };
                    }else{
                        $.u.alert.error( response.reason );
                    }
                })
            },
            id: function(item){
                return item.iCaoCode;
            }
        } );
        this._UNIT_SELECT2_OPTION =  $.extend( true, {}, this._SELECT2_OPTION, {
            ajax: {
                data: function(term, page){
                    return {
                        "tokenid": $.cookie("tokenid"),
                        "method": "stdcomponent.getbysearch",
                        "dataobject": "unit",
                        "rule": JSON.stringify( [[{"key": "name", "op": "like", "value": term}]] ),
                        "start": ( page - 1 ) * 10,
                        "length": 10
                    };
                }
            }
        } );
        this._CRAFT_SELECT2_OPTION = $.extend( true, {}, this._SELECT2_OPTION, {
            multiple: true,
            ajax: {
                data: this.proxy(function(term, page){
                    return {
                        "tokenid": $.cookie("tokenid"),
                        "method": "stdcomponent.getbysearch",
                        "dataobject":"aircraftModel",
                        "start": ( page - 1 ) * 10,
                        "length": 10
                    };
                })
            },
            id: function(item){
                return item.code;
            },
            formatResult: function(item){
                return $.trim( item.code );
            },
            formatSelection: function(item){
                return $.trim( item.code );
            }
        } );
    },
    afterrender: function (bodystr) {
    	this.i18n = com.sms.detailmodule.airlineInfo.i18n;
    	this.form = this.qid("form");
    	this.departureAirport = this.qid("departureAirport");
        this.arrivalAirport = this.qid("arrivalAirport");
        this.stopovers = this.qid("stopovers");
        this.unit = this.qid("unit");
        this.craft = this.qid("craft");

    	this.form.validate({
    		rules:{
    			"departureAirport": "required",
                "arrivalAirport": "required",
                "unit": "required",
                "craft": "required"
    		},
    		messages:{
    			"departureAirport": this.i18n.messages.departureAirport,
                "arrivalAirport": this.i18n.messages.arrivalAirport,
                "unit": this.i18n.messages.unit,
                "craft": this.i18n.messages.craft
    		},
    		errorClass: "text-danger text-validate-element",
            errorElement: "div"
    	});
    	
	    this.airlineDialog = this.qid("airlineDialog").dialog({
	    	title: this.i18n.title,
	        width: 540,
	        modal: true,
	        resizable: false,
	        autoOpen: false,
	        buttons: [
	            { text: this.i18n.buttons.ok, click: this.proxy( this.on_ok_click )},
	            { text: this.i18n.buttons.cancel, "class": "aui-button-link",click: this.proxy( this.on_cancel_click )}
	        ],
	        open: this.proxy( this.on_dialog_open ),
	        close: this.proxy( this.on_dialog_close ),
	        create: this.proxy( this.on_dialog_create )
	    }); 
    },
    on_ok_click: function(){
        var params = {
            tokenid: $.cookie("tokenid"),
            method: "addAirlineInfo",
            obj: JSON.stringify( this._getFormData() )
        };
        if ( this.form.valid() === false ) {
            return;
        }
        if(this._data && this._data.id){
            params.method = "updateAirlineInfo";
            params.obj = JSON.stringify( $.extend(true, {}, this._getFormData(), {"id": this._data.id}) )
        }
        $.u.ajax( {
            url: $.u.config.constant.smsmodifyserver,
            type: "post",
            data: params,
            dataType: "json"
        }, this.airlineDialog.parent() ).done( this.proxy( function(response){
            if ( response.success ) {
                this.on_afterSave( response.data );
                this.airlineDialog.dialog( "close" );
            } else {
                $.u.alert.error( response.reason );
            }
        } ) );
    },
    on_cancel_click: function(){
    	this.airlineDialog.dialog( "close" );
    },
    on_dialog_open: function(){
        this._setFormData();
    },
    on_dialog_close: function(){
        this._clearFormData();
    },
    on_dialog_create: function(){
    	this.departureAirport.add( this.arrivalAirport ).select2( this._AIRPORT_SELECT2_OPTION );
        this.stopovers.select2( $.extend( true, {}, this._AIRPORT_SELECT2_OPTION, { multiple: true } ) );
        this.unit.select2( this._UNIT_SELECT2_OPTION );
        this.craft.select2( this._CRAFT_SELECT2_OPTION );
    },
    on_afterSave: function(newId){

    },
    _clearFormData: function(){
        this.departureAirport.add( this.arrivalAirport )
                             .add( this.arrivalAirport )
                             .add( this.stopovers )
                             .add( this.unit )
                             .add( this.craft )
                             .select2( "val", null );
    },
    _getFormData: function(){ 
        var departureAirport = this.departureAirport.select2("data");
        var arrivalAirport = this.arrivalAirport.select2("data");
        return {
            "departureAirport": departureAirport.iCaoCode,
            "departureAirportName": departureAirport.name,
            "arrivalAirport": arrivalAirport.iCaoCode,
            "arrivalAirportName": arrivalAirport.name,
            "stopovers": $.map( this.stopovers.select2( "data" ), function(v, idx){
                return { 
                    "airport": v.iCaoCode, 
                    "airportName": v.name,
                    "sequence": idx 
                };
            } ),
            "unit": parseInt( this.unit.select2( "val" ) ),
            "types": $.map( this.craft.select2( "val" ), function(v, idx){
                return { "type": v, "sequence": idx };
            } ),
            "activity": this._options.activity
        } ;
    },
    _setFormData: function(){
        if(this._data){
            this.departureAirport.select2("data", { "iCaoCode": this._data.departureAirport, "name": this._data.departureAirportName });
            this.arrivalAirport.select2("data", { "iCaoCode": this._data.arrivalAirport, "name": this._data.arrivalAirportName });
            this.stopovers.select2("data", $.map(this._data.stopovers, function(item, idx){
                return {
                    "iCaoCode": item.airport,
                    "name": item.airportName
                };
            }));
            this.unit.select2("data", { "id": this._data.unit, "name": this._data.unitDisplayName });
            this.craft.select2("data", $.map(this._data.types, function(item, idx){
                return {"aircraftType": item.type};
            }));
        }
    },
    open: function(data){
        if(data){
            this._data = $.extend(true, {}, data);
        }
    	this.airlineDialog.dialog( "open" );
    },
    destroy: function () {
        this.departureAirport.add( this.arrivalAirport )
                             .add( this.arrivalAirport )
                             .add( this.stopovers )
                             .add( this.unit )
                             .add( this.craft )
                             .select2( "destroy" );
        this.airlineDialog.dialog( "destroy" );
    	this._super(); 
    }
}, { usehtm: true, usei18n: true });


com.sms.detailmodule.airlineInfo.widgetjs = ["../../../uui/widget/spin/spin.js", 
                                             "../../../uui/widget/jqblockui/jquery.blockUI.js",
                                             "../../../uui/widget/ajax/layoutajax.js",
                                             "../../../uui/widget/validation/jquery.validate.js"];
com.sms.detailmodule.airlineInfo.widgetcss = [];