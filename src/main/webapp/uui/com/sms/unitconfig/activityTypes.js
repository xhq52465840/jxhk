//@ sourceURL=com.sms.unitconfig.activityTypes
$.u.define('com.sms.unitconfig.activityTypes', null, {
    init: function (options) {
        this._options = options;
    },
    afterrender: function (bodystr) {
    	this.i18n = com.sms.unitconfig.activityTypes.i18n;
    	this.unit_id = $.urlParam().id;
    	this.isAdmin = false;
    	this.btn_action = this.qid("btn-action");
    	if(!this.unit_id){
    		window.location.href="../dash/DashBoard.html";
    	}

    	this.dataTable = this.qid("datatable").dataTable({
            searching: false,
            serverSide: true,
            bProcessing: true,
            ordering: false,
            pageLength:1000,
            "sDom":"",
            "columns": [
                { "title": "" ,"mData":"id","sWidth":20},
                { "title": this.i18n.title ,"mData":"name","sWidth":"20%"},
				{ "title": this.i18n.describe ,"mData":"description","sWidth":"18%"},
				{ "title": this.i18n.workFlow ,"mData":"id","sWidth":"20%"},
				{ "title": this.i18n.fieldConfig ,"mData":"id","sWidth":"22%"},
				{ "title": this.i18n.surface ,"mData":"id","sWidth":"22%"}
            ],
            "aaData":[

            ],
            "oLanguage": { //语言
                "sSearch": this.i18n.search,
                "sLengthMenu": this.i18n.everPage+" _MENU_ "+this.i18n.record,
                "sZeroRecords": this.i18n.message,
                "sInfo": this.i18n.from+" _START_ "+this.i18n.to+" _END_ /"+this.i18n.all+" _TOTAL_ "+this.i18n.allData,
                "sInfoEmpty": this.i18n.withoutData,
                "sInfoFiltered": "("+this.i18n.fromAll+"_MAX_"+this.i18n.filterRecord+")",
                "sProcessing": ""+this.i18n.searching+"...",
                "oPaginate": {
                    "sFirst": "<<",
                    "sPrevious": this.i18n.back,
                    "sNext": this.i18n.next,
                    "sLast": ">>"
                }
            },
            "fnServerParams": this.proxy(function (aoData) {
            	$.extend(aoData,{
            		"tokenid":$.cookie("tokenid"),
            		"method":"getunitactivitytypescheme",
            		"unit":this.unit_id
            	},true);
            }),
            "fnServerData": this.proxy(function (sSource, aoData, fnCallBack, oSettings) {
            	$.u.ajax({
                    url: $.u.config.constant.smsqueryserver,
                    dataType: "json",
                    cache: false,
                    data: aoData
                },this.qid("datatable")).done(this.proxy(function (data) {
                    if (data.success) {
                    	data.data.aaData = data.data.schemes;    
                    	if(data.data.action.length>0){
                    		this.btn_action.removeClass("hidden");
                    	}
                    	this._data = {
                    			"name": data.data.name,
                    			"unitName":data.data.unitName,
                    			"config":data.data.config,
                    			"id":data.data.id,
                    			"unit":this.unit_id
                    	}
                    	this.activity = data.data.id;
                    	this.isAdmin = data.data.admin;
                    	this.qid("activity-types-name").text(data.data.name);
                    	$('ul',this.btn_action).empty();
                    	data.data.action&&$.each(data.data.action,this.proxy(function(k,v){
                    		$('<li role="presentation"><a class="btn" role="menuitem" tabindex="-1">'+v+'</a></li>').appendTo($('ul',this.btn_action));
                    	}))
                        fnCallBack(data.data);
                    }
                })).fail(this.proxy(function (jqXHR, errorText, errorThrown) {

                })).complete(this.proxy(function(){
                }));
            }),
            "aoColumnDefs": [
                {
                    "aTargets": 0,
                    "mRender": this.proxy(function (data, type, full) {
	                    return  '<img src="/sms/uui' + full.url + '">';
                    })
                },
                {
                    "aTargets": 1,
                    "mRender": this.proxy(function (data, type, full) {
	                    return  '<small >' + (data || "") + '</small>' ;
                    })
                },
                {
                    "aTargets": 2,
                    "mRender": function (data, type, full) {
                    	return  '<small >' + (data || "") + '</small>' ;
                    }
                },
                {
                    "aTargets": 3,
                    "mRender": this.proxy(function (data, type, full) { 
                    	var htmls = "<span class='unit-config-icon unit-config-icon-workflow' style='margin-right:5px;'></span>", workflow = full && full.workflow ? full.workflow : {};
                    	this.isAdmin ? htmls += '<a href="../workflow/WorkflowDesign.html?id=' + workflow.wsd_id + '&mode=view">' + (workflow.name || "") + '</a>' : htmls += (workflow.name || "");
	                	return htmls;
                    })
                },
                {
                    "aTargets": 4,
                    "mRender": this.proxy(function (data, type, full) {
                    	var htmls = "<span class='unit-config-icon unit-config-icon-field' style='margin-right:5px;'></span>";
                    	this.isAdmin ? htmls += '<a href="../customfields/ConfigureFieldLayout.html?id=' + full.fieldId + '">' + full.fieldName + '</a>' : htmls += full.fieldName;
	                	return htmls;
                    })
                },{
                    "aTargets": 5,
                    "mRender": this.proxy(function (data, type, full) {
                    	var htmls = "<span class='unit-config-icon unit-config-icon-screen' style='margin-right:5px;'></span>";
                    	this.isAdmin ? htmls += '<a href="../fieldscreen/ConfigureScreenScheme.html?id=' + full.screenId + '">' + full.screenName + '</a>' : htmls += full.screenName;
	                	return htmls;
                    })
                }
            ]
        });
    	
    	this.btn_action.off("click","a").on("click","a",this.proxy(function(e){
    		e.preventDefault();
        	try{
        		var text = $(e.currentTarget).text();
        		switch(text){
        			case this.i18n.editSafeType:
        				this.getActivityDataById(this.activity,this.qid("activity-types-name").text());
        				break;
        			case this.i18n.useType:
        				this.getActivityTypesSchemes();
        				break;
        		}
        	}catch(e){
        		throw new Error(this.i18n.editFail+e.message);
        	}
    	}))
    },
    getActivityTypesSchemes:function(){
    	if(!this.activityTypesSchemes){
    		var clz = $.u.load("com.sms.unitconfig.activityTypesSchemes");
    		this.activityTypesSchemes = new clz(this.$.find("div[umid=activityTypesSchemes]")); 
    		this.activityTypesSchemes.override({
    	     	refreshDataTable:this.proxy(function(){
    	     		this.dataTable.fnDraw();
    	     	})
         	});
    	}
    	this.activityTypesSchemes.open(this._data);
    },
    getActivityDataById:function(id,name){
    	var data={
			"id":id,
			"name":name
    	};
    	if(!this.activityTypeSchemeDialog){
    		var clz = $.u.load("com.sms.activitytype.activityTypeSchemeDialog");
    		this.activityTypeSchemeDialog = new clz(this.$.find("div[umid=activityTypeSchemeDialog]"));
            this.activityTypeSchemeDialog.override({
        		refreshDataTable:this.proxy(function(){
        			this.dataTable.fnDraw();
        		})
        	});
    	}
    	this.activityTypeSchemeDialog.open({"data":data,"title":this.i18n.editMsg+data.name,"operate":"EDIT"});
    },
    destroy: function () {
        this._super();
    }
}, { usehtm: true, usei18n: true });

com.sms.unitconfig.activityTypes.widgetjs = ['../../../uui/widget/jqurl/jqurl.js',
                                             '../../../uui/widget/jqdatatable/js/jquery.dataTables.js',
                                             '../../../uui/widget/jqdatatable/js/dataTables.bootstrap.js',
                                             "../../../uui/widget/spin/spin.js"
                                             , "../../../uui/widget/jqblockui/jquery.blockUI.js"
                                             , "../../../uui/widget/ajax/layoutajax.js"];
com.sms.unitconfig.activityTypes.widgetcss = [{ path: '../../../uui/widget/jqdatatable/css/jquery.dataTables.css' }, { path: '../../../uui/widget/jqdatatable/css/dataTables.bootstrap.css' }];