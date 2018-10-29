//@ sourceURL=uui.ide.myide.layout
$.u.define('uui.ide.myide.layout', null, {
    beforechildrenrender: function () {
        var layoutSettings_Outer = {
            name: "outerLayout"
            , defaults: {
                //	effect defaults - overridden on some panes
                fxName: "none"		// none, slide, drop, scale
                , fxSpeed_open: 750
                , fxSpeed_close: 1500
                , fxSettings_open: { easing: "easeInQuint" }
                , fxSettings_close: { easing: "easeOutQuint" }
            }, north: {
                size: 45
                , spacing_open: 6			// cosmetic spacing
		        , togglerLength_open: 0
		        , togglerLength_closed: -1			// "100%" OR -1 = full width of pane
		        , resizable: false
		        , slidable: false
		        , fxName: "none"
            }
            , west: {
                size: 300
                , spacing_closed: 21			// wider space when closed
                , togglerLength_closed: 21			// make toggler 'square' - 21x21
                , togglerAlign_closed: "top"		// align to top of resizer
                , togglerLength_open: 0			// NONE - using custom togglers INSIDE west-pane
                , togglerTip_open: "关闭"
                , togglerTip_closed: "打开"
                , resizerTip_open: "拖动"
                , slideTrigger_open: "mouseover" 	// default
                , initClosed: false
                , onresize: this.proxy(function (pane, $pane, state, options) {
                    this.left.resize();
                })
            }
            , east: {
                size: 400
                , spacing_closed: 21			// wider space when closed
                , togglerLength_closed: 21			// make toggler 'square' - 21x21
                , togglerAlign_closed: "top"		// align to top of resizer
                , togglerLength_open: 0 			// NONE - using custom togglers INSIDE east-pane
                , togglerTip_open: "关闭"
                , togglerTip_closed: "打开"
                , resizerTip_open: "拖动"
                , slideTrigger_open: "mouseover"
                , initClosed: true
                , onresize: this.proxy(function (pane, $pane, state, options) {
                    this.right.resize();
                })
            }
            , center: {
                minWidth: 600
                , minHeight: 600
                , onresize: this.proxy(function (pane, $pane, state, options) {
                    this.center.resize();
                })
            }
        };
        var outerLayout = this.$.layout(layoutSettings_Outer);
        var westSelector = this.qid("left"); // outer-west pane
        var eastSelector = this.qid("right");  // outer-east pane
        $("<span></span>").addClass("ui-layout-pin-button").prependTo(westSelector);
        $("<span></span>").addClass("ui-layout-pin-button").prependTo(eastSelector);
        outerLayout.addPinBtn($(".ui-layout-pin-button", westSelector), "west");
        outerLayout.addPinBtn($(".ui-layout-pin-button", eastSelector), "east");

        $("<span></span>").addClass("ui-layout-closebtn").prependTo(westSelector);
        $("<span></span>").addClass("ui-layout-closebtn").prependTo(eastSelector);
        outerLayout.addCloseBtn($(".ui-layout-closebtn", westSelector), "west");
        outerLayout.addCloseBtn($(".ui-layout-closebtn", eastSelector), "east");
    },
    afterrender: function () {
        //var centerSelector = this.qid("center");
        //centerSelector.sortable({
        //    opacity: .35,
        //    update: function (e, ui) {
        //        var itm = $(ui.item);
        //        if (itm.hasClass('lyrow')) {
        //            $(".view", itm).children().insertAfter(itm);
        //            itm.remove();
        //        }
        //        itm = null;
        //    },
        //    start: function (e, t) {

        //    },
        //    stop: function (e, t) {

        //    }
        //});
        this.qid("save").unbind("click");
        this.qid("save").click(this.proxy(function (e) {
            this.center.save();
        }));
        this.qid("saveall").unbind("click");
        this.qid("saveall").click(this.proxy(function (e) {
            this.center.saveall();
        }));
        //this.qid("export").unbind("click");
        //this.qid("export").click(this.proxy(function (e) {
        //    if (this.center && (this.center instanceof uui.ide.myide.centermodule)) {
        //        $("<div/>").dialog({
        //            title: "导出html",
        //            modal: true,
        //            resizable: false,
        //            width: 800,
        //            height: 600,
        //            create: this.proxy(function (e) {
        //                $("<textarea style='width:100%;height:100%;'>" + this.center.rawhtm() + "</textarea>").appendTo($(e.target));
        //            }),
        //            close: function (e) {
        //                $(e.target).dialog("destroy").remove();
        //            }
        //        });
        //    }
        //}));
        this.qid("instance").unbind("click");
        this.qid("instance").click(this.proxy(function (e) {            
            this.center.activeTabPreview(true);
        }));
    }
}, { usehtm: true });

uui.ide.myide.layout.widgetjs = [
    "../../../uui/widget/jqlayout/jquery.layout-latest.js"
    , "../../../uui/widget/spin/spin.js"
    , "../../../uui/widget/jqblockui/jquery.blockUI.js"
    , "../../../uui/widget/ajax/layoutajax.js"];
uui.ide.myide.layout.widgetcss = [];