//@ sourceURL=uuitest.module.modulebasic.module.module3
$.u.define('uuitest.module.modulebasic.module.module3', 'uuitest.module.modulebasic.module.module2', {
    init: function (me , you) {
        this.module2display = 'hello module3'; // 在前面定义是能获取到
        this.notdisplay = 'not display'; // 这里的会undefined，因为_super会调用htm，在这之后的，都无法在htm之后获取到
        this.count = 1;
        this.me = me;
        this.you = you;
    },
    bark2: function () {
        return 'wang3';
    },
    afterrender: function () {
        console.log(this.qid("myid0").text());
        console.log(this.qid("myclass0").text());
        console.log(this.me);
        console.log(this.you);
    }
}, { usehtm: true, usesuperhtm: true, usei18n: false });

uuitest.module.modulebasic.module.module3.widgetjs = ['../js/js2.js'];
uuitest.module.modulebasic.module.module3.widgetcss = [{path:'../css/css2.css'}];