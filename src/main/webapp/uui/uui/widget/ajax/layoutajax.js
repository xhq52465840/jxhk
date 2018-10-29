(function () {
    /**
    *在异步的情况下，屏蔽了beforeSend方法，用来block
    *always方法仍然可用
    *依赖spin和blockUI
    *
    * ajaxoptions
    *   Ajax的配置参数
    * selector
    *   遮罩那一块区域
    * spinneroptions
    *   selector : 选择器
    *   orient : "north" "south" "west" "east",
    *   backgroundColor : "#aaa"
    *   size : 3 // 1-10
    */
    $.u.ajax = function (ajaxoptions, selector, spinneroptions) {
        if (!ajaxoptions) {
            ajaxoptions = {};
        }
        if (!spinneroptions) {
            spinneroptions = {};
        }
        if (!selector)
            selector = $("body");
        if (ajaxoptions.async == null || ajaxoptions.async) {
            ajaxoptions.beforeSend = (function (thisSelector, opts, sopts) {
                return function () {
                    var size = sopts.size || 2;
                    opts.__spinner = new Spinner({ radius: 3 * size, width: 1 * size, length: 2 * size }).spin();
                    var blockuiopts = {
                        message: opts.__spinner.el, overlayCSS: { backgroundColor: sopts.backgroundColor || '#fff' }
                    };
                    var cssopt = {
                        "background": "transparent", "border": "none"
                    };
                    if (sopts.selector && sopts.selector instanceof $) {
                        var soffset = sopts.selector.offset();
                        var poffset = selector.offset();
                        var offset = { left: soffset.left - poffset.left, top: soffset.top - poffset.top };
                        var radiusall = 3 * size + 1 * size + 2 * size // (radius + length)
                        if (sopts.orient == "north") {
                            cssopt.left = offset.left + (Math.floor(sopts.selector.outerWidth(true) / 2)) + "px";
                            cssopt.top = (offset.top - radiusall) + "px";
                        } else if (sopts.orient == "south") {
                            cssopt.left = offset.left + (Math.floor(sopts.selector.outerWidth(true) / 2)) + "px";
                            cssopt.top = (offset.top + radiusall) + sopts.selector.outerHeight(true) + "px";
                        } else if (sopts.orient == "west") {
                            cssopt.left = (offset.left - radiusall) + "px";
                            cssopt.top = offset.top + (Math.floor(sopts.selector.outerHeight(true) / 2)) + "px";
                        } else if (sopts.orient == "east") {
                            cssopt.left = (offset.left + radiusall) + sopts.selector.outerWidth(true) + "px";
                            cssopt.top = offset.top + (Math.floor(sopts.selector.outerHeight(true) / 2)) + "px";
                        }
                        else {
                            cssopt.left = offset.left + (Math.floor(sopts.selector.outerWidth(true) / 2)) + "px";
                            cssopt.top = offset.top + (Math.floor(sopts.selector.outerHeight(true) / 2)) + "px";
                        }
                        cssopt.width = "0px";
                        sopts.selector.outerWidth(true) / 2;
                        blockuiopts.centerX = false;
                        blockuiopts.centerY = false;
                    }
                    else {
                        blockuiopts.centerX = true;
                        blockuiopts.centerY = true;
                    }
                    blockuiopts.css = cssopt;
                    if (thisSelector) {
                        thisSelector.block(blockuiopts);
                    }
                };
            })(selector, ajaxoptions, spinneroptions);
        }
        return $.ajax(ajaxoptions).always((function (thisSelector, opts) {
            return function () {
                if (thisSelector && (opts.async == null || opts.async)) {
                    opts.__spinner.stop();
                    opts.__spinner = null;
                    thisSelector.unblock();
                }
            }
        })(selector, ajaxoptions, spinneroptions));
    }

    /**
    *在异步的情况下，屏蔽了beforeSend方法，用来block
    *always方法仍然可用
    *依赖spin和blockUI
    *
    * ajaxoptions
    *   Ajax的配置参数
    * selector
    *   遮罩那一块区域
    * progressoptions
    *   width : 
    *   height : 
    */
    $.u.ajaxp = function (ajaxoptions, selector, progressoptions) {
        if (!ajaxoptions) {
            ajaxoptions = {};
        }
        if (!progressoptions) {
            progressoptions = {};
        }
        if (!selector)
            selector = $("body");
        if (ajaxoptions.async == null || ajaxoptions.async) {
            ajaxoptions.beforeSend = (function (thisSelector, opts, popts) {
                var width = popts.width || "100px";
                var height = popts.height || "10px";
                return function () {
                    var htm = "<div class='progress' style='height:" + height + ";width:" + width + "'><div class='progress-bar  progress-bar-danger progress-bar-striped active'  role='progressbar' aria-valuenow='45' aria-valuemin='0' aria-valuemax='100' style='width: 100%'><span class='sr-only'>45% Complete</span></div></div>";
                    var blockuiopts = {
                        message: htm, css: { "background": "transparent", "border": "none" }, overlayCSS: { backgroundColor: "transparent" }
                    };
                    if (thisSelector) {
                        thisSelector.block(blockuiopts);
                    }
                };
            })(selector, ajaxoptions, progressoptions);
        }
        return $.ajax(ajaxoptions).always((function (thisSelector, opts) {
            return function () {
                if (thisSelector && (opts.async == null || opts.async)) {
                    thisSelector.unblock();
                }
            }
        })(selector, ajaxoptions, progressoptions));
    }
})();