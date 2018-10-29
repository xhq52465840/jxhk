//@ sourceURL=com.sms.plugin.render.baseprop
/**
* 使用
* var inputRenderClazz = $.u.load("com.sms.plugin.inputprop")
* var inputRenderObj = new inputRenderClazz(options);
* var result = inputRenderObj.get("table", "html")(data , sel);
*
*/
$.u.define('com.sms.plugin.render.baseprop', null, {
    init: function (options) {
        this._options = options;
    },
    get: function (type, method) {
        if (type == "table" || type == "filter" || type == "edit" || type == "read") {
            Args = Array.prototype.slice.call(arguments, 2);
            return this[type + "_" + method].apply(this, Args);;
        }
        else {
            throw Exception("无此方法" + type + "_" + method);
        }
    },
    // table段
    table_html: function (data, type,row) { return data; },
    table_render: function (data, full, sel) { },
    // edit段
    edit_html: function (setting) { return "" },
    edit_render: function (setting, sel) { },
    edit_getdata: function () { },
    edit_valid:function(){},
    // read段
    read_html: function (setting) { return data; },
    read_render: function (setting,sel) { },
    destroy: function () {
        this._super();
    }
}, { usehtm: false, usei18n: false });
