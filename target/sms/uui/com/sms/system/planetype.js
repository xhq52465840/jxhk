//@ sourceURL=com.sms.system.planetype
$.u.load("com.sms.common.stdComponentOperate");
$.u.load("com.sms.common.stdcomponentdelete");
$.u.define('com.sms.system.planetype', null, {
    init: function (options) {
        this._options = options || {};
        this._SELECT2_PAGE_LENGTH = 10;
    },
    afterrender: function (bodystr) {
    	this.i18n = com.sms.system.planetype.i18n;
    	this._createDatatable();
    	this.qid("btn_addplanetype").click(this.proxy(this.on_addplanetype_click));
    	this.qid("btn_filter").click(this.proxy(this.on_filter_click));
    	this.qid("btn_resetfilter").click(this.proxy(this.on_reset_click));
    	this.dataTable.off("click", "button.edit").on("click", "button.edit", this.proxy(this.on_editplanetype_click));
    	this.dataTable.off("click", "button.delete").on("click", "button.delete", this.proxy(this.on_removeplanetype_click));
    },
    _createDatatable : function(){
    	this.dataTable = this.qid("datatable").dataTable({
            searching: false,
            serverSide: true,
            bProcessing: true,
            ordering: false,
            dom: "tip",
            "columns": [
                { "title": this.i18n.planetype ,"mData":"familycode"},
                { "title": this.i18n.planenumber ,"mData":"code"},
                { "title": "机型厂商" ,"mData":"manufacturer"},
                { "title": this.i18n.handle,"mData":"id","sWidth":100}
            ],
            "oLanguage": { //语言
                "sSearch": this.i18n.search,
                "sLengthMenu": this.i18n.everPage+"_MENU_"+this.i18n.record,
                "sZeroRecords": this.i18n.message,
                "sInfo": this.i18n.from+" _START_ "+this.i18n.to+" _END_ /"+this.i18n.all+"_TOTAL_ "+this.i18n.allData,
                "sInfoEmpty": this.i18n.withoutData,
                "sInfoFiltered": "("+this.i18n.fromAll+"_MAX_"+this.i18n.filterRecord+")",
                "sProcessing": ""+this.i18n.searching+"...",
                "oPaginate": {
                    "sFirst": "<<",
                    "sPrevious": ""+this.i18n.back+"",
                    "sNext": ""+this.i18n.next+"",
                    "sLast": ">>"
                }
            },
            "fnServerParams": this.proxy(function (aoData) {
            	var rule = [];
            	if(this.qid("planetype").val()){
            		rule.push([{"key":"familycode", "op":"like", "value":this.qid("planetype").val()}]);
            	}
            	$.extend(aoData,{
            		"tokenid": $.cookie("tokenid"),
            		"method": "stdcomponent.getbysearch",
            		"dataobject": "aircraftModel",
            		"columns": JSON.stringify([{"data":"created"}]),
            		"order":JSON.stringify([{"column":0, "dir":"desc"}]),
            		"search": JSON.stringify(aoData.search),
            		"rule": JSON.stringify(rule)
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
                    "aTargets": 3,
                    "mRender": function (data, type, full) {
	                	return "<button class='btn btn-link edit' data='"+JSON.stringify(full)+"'>"+com.sms.system.planetype.i18n.editing+"</button>"+
	                	 "<button class='btn btn-link delete' data='"+JSON.stringify(full)+"'>"+com.sms.system.planetype.i18n.remove+"</button>";
                    }
                }
            ]
        });
    },
    /**
     * @title 搜索
     * @return void
     */
    on_filter_click: function(e){
    	this.dataTable.fnDraw(false);
    },
    on_reset_click: function(e){
    	this.qid("planetype").val("");
    	this.dataTable.fnDraw(false);
    },
    on_addplanetype_click:function(e){
    	if(this.planetypeDialog == null){
    		this._initplanetypeDialog();
    	}
    	this.planetypeDialog.open();
    },
    on_editplanetype_click:function(e){
    	e.preventDefault();
    	try{
    		var data = JSON.parse($(e.currentTarget).attr("data"));
    		if(this.planetypeDialog == null){
        		this._initplanetypeDialog();
        	}
    		var sendData = {};
    		sendData.id = data.id;
    		sendData.code = data.code;
    		sendData.familycode = data.familycode;
    		sendData.manufacturer = data.manufacturer;
    		this.planetypeDialog.open({"data":sendData,"title":""+this.i18n.editplanetype+"："+data.familycode});
    	}catch(e){
    		throw new Error(""+this.i18n.editFail+"："+e.message);
    	}
    },
    on_removeplanetype_click:function(e){
    	e.preventDefault();
    	try{
    		var data = JSON.parse($(e.currentTarget).attr("data"));
    		(new com.sms.common.stdcomponentdelete({
    			body:"<div>"+
    				 	"<p>"+this.i18n.choose+"</p>"+
    				 	"<p><span class='text-danger'>"+this.i18n.notice+"</span></p>"+
    				 "</div>",
    			title:""+this.i18n.removeplanetype+"："+data.aircraftType,
    			dataobject:"aircraftTypeDictionary",
    			dataobjectids:JSON.stringify([parseInt(data.id)])
    		})).override({
    			refreshDataTable:this.proxy(function(){
    				if(this.dataTable){
    					if(this.dataTable.fnGetData().length > 1 ){
    						this.dataTable.fnDraw(true);
    					}else{
    						this.dataTable.fnDraw();
    					}
    				}
    			})
    		});
    	}catch(e){
    		throw new Error(""+this.i18n.removeFail+"："+e.message);
    	}
    },
    _initplanetypeDialog:function(){
    	this.planetypeDialog = new com.sms.common.stdComponentOperate($("div[umid='planetypeDialog']",this.$),{
    		"title":com.sms.system.planetype.i18n.addplanetype,
    		"dataobject":"aircraftTypeDictionary",
    		"fields":[
	          {name:"familycode", label:this.i18n.planetype,type:"select",rule:{required:true},message:this.i18n.planetypeNotNull, 
	        	  option: {
	        		  tags: this.proxy(function(){
	        			  var data1 = null;
	        			  $.u.ajax({
	                          url: $.u.config.constant.smsqueryserver,
	                          type:"post",
	                          dataType: "json",
	                          async: false,
	                          cache: false,
	                          data: {
	                        	  "tokenid": $.cookie("tokenid"),
	                      		  "method": "getFamilycodeBySearch"
	                          }
	                      },this.qid("datatable")).done(this.proxy(function (data) {
	                          if (data.success) {
	                              data1 = data.data.aaData;
	                          }
	                      })).fail(this.proxy(function (jqXHR, errorText, errorThrown) {

	                      }));
	        			  return data1;
	        		  })() 
	        	  }
	          },
	          {name:"code",label:this.i18n.planenumber,type:"select",dataType:"string",rule:{required:true},message:this.i18n.planenumberNotNull,
	        	  option:{
	        		  tags: []
	        	 }
	          },
	          {name:"manufacturer", label:"机型厂商",type:"select",rule:{required:true},message:"机型厂商不能为空", 
	        	  option: {
	        		  tags: this.proxy(function(){
	        			  var data1 = null;
	        			  $.u.ajax({
	                          url: $.u.config.constant.smsqueryserver,
	                          type:"post",
	                          dataType: "json",
	                          async: false,
	                          cache: false,
	                          data: {
	                        	  "tokenid": $.cookie("tokenid"),
	                      		  "method": "getManufacturerBySearch"
	                          }
	                      },this.qid("datatable")).done(this.proxy(function (data) {
	                          if (data.success) {
	                              data1 = data.data.aaData;
	                          }
	                      })).fail(this.proxy(function (jqXHR, errorText, errorThrown) {

	                      }));
	        			  return data1;
	        		  })() 
	        	  }
	          },
	        ],
    		"add":this.proxy(function(comp,data){
			  	this._ajax(
			  		$.u.config.constant.smsmodifyserver, 
					true,
					{
						"tokenid":$.cookie("tokenid"),
                		"method":"modifyAircraftModel",
                		"paramType":"add",
                		"obj":JSON.stringify(data),
                		"code":data.code,
                		"familycode":data.familycode,
                		"manufacturer":data.manufacturer
					}, 
					this.$, 
					{},
					this.proxy(function(response) {
						comp.formDialog.dialog("close");
						this.dataTable.fnDraw();
					})
				);
		    }),
		    "edit": this.proxy(function(comp, data, id){
                data.familycode = data.familycode.split(',')[0];
			  	this._ajax(
			  		$.u.config.constant.smsmodifyserver, 
					true,
					{
			  			"tokenid":$.cookie("tokenid"),
                		"method":"stdcomponent.update",
                		"dataobject":"aircraftModel",
                		"dataobjectid":id,
                		"obj":JSON.stringify(data)
					}, 
					this.$, 
					{},
					this.proxy(function(response) {
						comp.formDialog.dialog("close");
						this.dataTable.fnDraw();
					})
				);
            })
    	});
    	
    },
    _ajax : function(url, async, param, $container, blockParam, callback) {
		$.u.ajax({
			url : url,
			datatype : "json",
			type : 'post',
			"async" : async,
			data : $.extend({
				tokenid : $.cookie("tokenid")
			}, param)
		}, $container || this.$, $.extend({}, blockParam || {})).done(this.proxy(function(response) {
			if (response.success) {
				callback(response);
			}
		})).fail(this.proxy(function(jqXHR, errorText, errorThrown) {

		}));
	},
    destroy: function () {
        this._super();
    }
}, { usehtm: true, usei18n: true });


com.sms.system.planetype.widgetjs = ['../../../uui/widget/jqdatatable/js/jquery.dataTables.js', 
                                     '../../../uui/widget/jqdatatable/js/dataTables.bootstrap.js',
                                     '../../../uui/widget/spin/spin.js',
 									 '../../../uui/widget/jqblockui/jquery.blockUI.js',
 									 '../../../uui/widget/ajax/layoutajax.js'
                                     ];
com.sms.system.planetype.widgetcss = [{ path: '../../../uui/widget/jqdatatable/css/jquery.dataTables.css' }, { path: '../../../uui/widget/jqdatatable/css/dataTables.bootstrap.css' }];