//@ sourceURL=com.sms.plugin.render.keywordProp
$.u.define("com.sms.plugin.render.keywordProp", "com.sms.plugin.render.baseprop", {
    // table段
    table_html: function (data, type,row) {
    	var result = ""; 
    	if(row && row.unit){
    		result = "<span><a href='" + this.getabsurl("../search/activity.html?activityId=" + row.id) + "' target='_blank'>" + row.unit.code + "-" + row.num + "</a></span>";
    	}
    	return result; 
    },
    table_render: function (data, full, cellsel) { this.cellsel = cellsel; },
    // edit段
    edit_html: function (setting) { 
    	return  ""; 
    },
    edit_render: function (setting, sel) {
    },
    edit_getdata: function () {
    },
    edit_disable:function(){
    },
    edit_enable:function(){
    },
    edit_valid:function(){
    },
    // read段
    read_html: function (setting) {
    },
    read_render: function (setting, sel) { },
    destroy: function () {
        this._super();
    }
}, { usehtm: false, usei18n: false });
