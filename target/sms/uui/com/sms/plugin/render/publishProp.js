//@ sourceURL=com.sms.plugin.render.publishProp
$.u.define("com.sms.plugin.render.publishProp", "com.sms.plugin.render.baseprop", {
    // table段
    table_html: function (data, type,row) { 
    	return data === "true" ? "发布" : "未发布"; 
    },
    table_render: function (data, full, cellsel) { this.cellsel = cellsel; },
    // edit段
    edit_html: function (setting) { 

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
