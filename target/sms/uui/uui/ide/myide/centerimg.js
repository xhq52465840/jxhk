//@ sourceURL=uui.ide.myide.centerimg
$.u.define('uui.ide.myide.centerimg', null, {
    init: function (treeNode) {
        this.treeNode = treeNode;
    },
    afterrender: function () {
        var filepath = $.u.ide_getFolderPath(this.treeNode);
        this.parent().setTabLiTitle(this.$, filepath);
        this.qid("image").attr("src", filepath);
    },
    reload: function () {
        // 勿删
    },
    resize: function () {

    }
}, { usehtm: true });

uui.ide.myide.centerimg.widgetjs = [];
uui.ide.myide.centerimg.widgetcss = [];