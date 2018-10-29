//@ sourceURL=com.sms.detailmodule.airline
$.u.define('com.sms.detailmodule.airline', null, {
    init: function (option) {
    	this._options = option || {};
    	this._airlineDialog = null;
    	this.editable=this._options.editable;
    },
    afterrender: function (bodystr) {
    	this.i18n = com.sms.detailmodule.airline.i18n;
    	
        if(this.editable== false){
            this.qid("btn_edit").remove();
        }else{
        	this.qid( "btn_edit" ).click( this.proxy( this.on_edit_click ) );
        }
        this._fillForm(this._options.airline || {});
    },
    on_edit_click: function(e){
        var $this = $(e.currentTarget);
    	if(this._airlineDialog === null){
    		var clz = $.u.load( "com.sms.detailmodule.airlineInfo" );
    		this._airlineDialog = new clz( this.$.find("[umid=airlineDialog]"), { "activity": this._options.activity } );
    		this._airlineDialog.override( {
    			"on_afterSave": this.proxy( function(newId){
                    if(newId){
                        this._options.airline = $.extend(true, {}, this._options.airline || {}, { "id" : newId });
                    }
    				this._reload();
    			} )
    		} );
    	}
    	this._airlineDialog.open(this._options.airline && this._options.airline.id ? $this.data() : null);
    },
    _reload: function(){
        if(this._options.airline && this._options.airline.id){
            $.u.ajax({
                url: $.u.config.constant.smsqueryserver,
                type: "post",
                data: {
                    tokenid: $.cookie("tokenid"),
                    method: "stdcomponent.getbyid",
                    dataobject: "airlineInfo",
                    dataobjectid: this._options.airline.id
                },
                dataType: "json"
            }, this.$).done(this.proxy(function(response){
                if(response.success){
                    this._fillForm(response.data);
                }
            }));
        }
    },
    _fillForm: function(data){
        this.qid("departureAirport").text( data.departureAirportName || "" );
        this.qid("arrivalAirport").text( data.arrivalAirportName || "" );
        this.qid("unitDisplayName").text( data.unitDisplayName || "" );

        this.qid("stopovers").empty();
        if(data.stopovers){
            data.stopovers.sort(function(x, y){
                return x.sequence > y.sequence;
            });
            data.stopovers && $.each(data.stopovers, this.proxy(function(idx, item){
                // $("<span style='white-space: normal;'/>").addClass("label label-success").text(item.airportName).appendTo(this.qid("stopovers"));
                 $("<span style='padding-right: 10px;'/>").text(item.airportName).appendTo(this.qid("stopovers"));
            }));
        }

        this.qid("craft").empty();
        if(data.types){
            data.types.sort(function(x, y){
                return x.sequence > y.sequence;
            });
            data.types && $.each(data.types, this.proxy(function(idx, item){
                $("<span style='white-space: normal;' />").addClass("label label-success").text(item.type).appendTo(this.qid("craft"));
            }));
        }
        this.qid("btn_edit").data($.extend(true, {}, data)); 
    },
    destroy: function () {
    	this._super(); 
    }
}, { usehtm: true, usei18n: true });


com.sms.detailmodule.airline.widgetjs = ["../../../uui/widget/spin/spin.js", 
                                         "../../../uui/widget/jqblockui/jquery.blockUI.js",
                                         "../../../uui/widget/ajax/layoutajax.js"];
com.sms.detailmodule.airline.widgetcss = [];