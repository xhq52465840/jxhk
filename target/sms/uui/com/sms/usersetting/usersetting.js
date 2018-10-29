//@ sourceURL=com.sms.usersetting.usersetting
$.u.define('com.sms.usersetting.usersetting', null, {
    init: function (options) {
        this._options = options;
    },
    afterrender: function (bodystr) {
    	this.i18n = com.sms.usersetting.usersetting.i18n;
        this.qid("btn_editdefaultvalue").click(this.proxy(function () {
            this.userSettingDialog.open();
        }));
        
        this.userSettingDialog.override({
        	refreshDataTable:this.proxy(function(){
        		this.dataTable.fnDraw();
        	})
        });

        this.dataTable = this.qid("datatable").dataTable({
        	searching: false,
            serverSide: true,
            bProcessing:true,
            ordering:false,
            pageLength:1000,
            sDom:"",
            "columns": [
                { "title": this.i18n.attributeName,"mData":"name" ,"sWidth":300},
                { "title": this.i18n.attributeValue ,"mData":"value"}
            ],
            "aoColumnDefs": [
                 {
                     "aTargets": 1,
                     "mRender": function (data, type, full) {
                    	 var result = data;
                    	 if (full.key == "emailUser" || full.key == "autoWatch") {
                    		 result = data == "Y" ? "是" : "否";
                    	 } else if (full.key == "defaultAccess"){
                    		 result = data == "Y" ? "公共" : "私有"; 
                    	 }
                         return result;
                     }
                 }
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
            		"method":"stdcomponent.getbysearch",
            		"dataobject":"dictionary",
            		"rule":JSON.stringify([[{"key":"type","value":"用户缺省设置"}]]),
            		"search":JSON.stringify(aoData.search)
            	},true);
            }),
            "fnServerData": this.proxy(function (sSource, aoData, fnCallBack, oSettings) {
                $.ajax({
                    url: $.u.config.constant.smsqueryserver,
                    type:"post",
                    dataType: "json",
                    cache: false,
                    data: aoData
                }).done(this.proxy(function (data) {
                    if (data.success) {
                        fnCallBack(data.data);
                    }
                })).fail(this.proxy(function (jqXHR, errorText, errorThrown) {

                })).complete(this.proxy(function(){
                }));
            })
        });
    },
    destroy: function () {
        this._super();
    }
}, { usehtm: true, usei18n: true });


com.sms.usersetting.usersetting.widgetjs = ['../../../uui/widget/jqdatatable/js/jquery.dataTables.js', '../../../uui/widget/jqdatatable/js/dataTables.bootstrap.js'];
com.sms.usersetting.usersetting.widgetcss = [{ path: '../../../uui/widget/jqdatatable/css/jquery.dataTables.css' }, { path: '../../../uui/widget/jqdatatable/css/dataTables.bootstrap.css' }];