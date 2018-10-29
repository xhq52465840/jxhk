//@ sourceURL=com.sms.plugin.search.select2prop
$.u.define("com.sms.plugin.search.select2prop", "com.sms.plugin.search.baseprop", {
    // filter段
    filter_html: function () { return "<input type='text' style='width:100%'/>" },
    filter_render: function (toolsel) {
        this.filtersel = toolsel;
        $.u.load("xx.xx.tab");
        this.tabcomp = new xx.xx.tab(toolsel);
    },
    filter_getdata: function () {
        this.tabcomp.getdata();
    }
}, { usehtm: false, usei18n: false });
