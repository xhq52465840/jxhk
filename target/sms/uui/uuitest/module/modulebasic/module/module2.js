//@ sourceURL=uuitest.module.modulebasic.module.module2
$.u.define('uuitest.module.modulebasic.module.module2', null, {
    init: function () {
        this.module2display = 'hello module2'; // 在前面定义是能获取到
        this.notdisplay = 'not display'; // 另一个
        this.count = 1;
    },
    afterrender: function () {

    },
    bark2 : function (){
        return 'wang2';
    }
}, { usehtm: true, usei18n: true });

uuitest.module.modulebasic.module.module2.widgetjs = ['../js/js1.js'];
uuitest.module.modulebasic.module.module2.widgetcss = [{ path: '../css/css1.css' }];