(function () {
    $.u = $.u || {};
    $.extend(true, $.u, {
        ide_getFolderPath: function (treeNode) {
            var filepath = "";
            var curnode = treeNode;
            filepath = "/" + curnode.name;
            while (curnode = curnode.getParentNode()) {
                filepath = "/" + curnode.name + filepath;
            }
            if (filepath.indexOf("/WEBROOT") > -1) {
                filepath = filepath.substr(8);
            }
            return filepath;
        }
    });
})();