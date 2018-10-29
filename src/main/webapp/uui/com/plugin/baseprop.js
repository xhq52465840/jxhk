//@ sourceURL=com.plugin.baseprop
/**
* 使用
* var inputRenderClazz = $.u.load("com.plugin.inputprop")
* var inputRenderObj = new inputRenderClazz(options);
* var result = inputRenderObj.get("table", "html")(data , sel);
*
*/
$.u.define('com.plugin.baseprop', null, {
    init: function (options) {
        this._options = options;
    },
    get: function (type, method) {
        if (type == "table" || type == "filter" || type == "edit" || type == "read") {
            return this[type + "_" + method];
        }
        else {
            return null;
        }
    },
    // table段
    table_html: function (data, type, full, meta) { return data; },
    table_render: function (data, full, cellsel) { },
    // filter段
    filter_html: function () { return "" },
    filter_render: function (toolsel) { },
    filter_getdata: function () { return null; },
    // edit段
    edit_html: function (data, full) { return "" },
    edit_render: function (data, full, cellsel) { },
    edit_getdata: function () { },
    // read段
    read_html: function (data, full) { return data; },
    read_render: function (data, full, cellsel) { },
    destroy: function () {
        this._super();
    }
}, { usehtm: false, usei18n: false });
