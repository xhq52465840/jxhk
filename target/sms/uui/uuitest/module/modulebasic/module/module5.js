//@ sourceURL=uuitest.module.modulebasic.module.module5
$.u.define('uuitest.module.modulebasic.module.module5', null, {
    init: function () {
        this.module2display = 'hello module5'; // 在前面定义是能获取到
        this.notdisplay = 'not display'; // 另一个
        this.count = 1;
    },
    beforechildrenrender: function () {
        this.module2.module2display = "XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX";
        this.module2._options = { abc: 123 }; // 修改options
    },
    afterrender: function () {

    },
    bark5: function () {
        return 'wang5';
    }
}, { usehtm: true });