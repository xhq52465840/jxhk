//@ sourceURL=com.sms.unitbrowse.activityPanel
$.u.define('com.sms.unitbrowse.activityPanel', null, {
    init: function (options) {
        this._options = options;
    },
    afterrender: function (bodystr) {
    	//id
    	var id = $.urlParam().id;
    	if(!id){
			window.location.href="../dash/DashBoard.html";
		}
    },
    destroy: function () {
        this._super();
    }
}, { usehtm: true, usei18n: true });

com.sms.unitbrowse.activityPanel.widgetjs = ["../../../uui/widget/jqurl/jqurl.js",'../../../uui/widget/jqdatatable/js/jquery.dataTables.js', '../../../uui/widget/jqdatatable/js/dataTables.bootstrap.js'];
com.sms.unitbrowse.activityPanel.widgetcss = [{ path: '../../../uui/widget/jqdatatable/css/jquery.dataTables.css' }, { path: '../../../uui/widget/jqdatatable/css/dataTables.bootstrap.css' }];