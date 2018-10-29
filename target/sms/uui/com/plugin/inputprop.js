//@ sourceURL=com.plugin.inputprop
$.u.define("com.plugin.inputprop", "com.plugin.baseprop", {
    // table段
    table_html: function (data, type, full, meta) { return data; },
    table_render: function (data, full, cellsel) { this.cellsel = cellsel; },
    // filter段
    filter_html: function () { return "<input type='text' style='width:100%'/>" },
    filter_render: function (toolsel) {
        this.filtersel = toolsel;
        $.u.load("xx.xx.tab");
        this.tabcomp = new xx.xx.tab(toolsel);
    },
    filter_getdata: function () {
        this.tabcomp.getdata();
    },
    // edit段
    edit_html: function (data, full) { return "<input type='text' style='width:100%'/>" },
    edit_render: function (data, full, cellsel) { },
    edit_getdata: function () { },
    // read段
    read_html: function (data, full) { return data; },
    read_render: function (data, full, cellsel) { },
}, { usehtm: false, usei18n: false });
