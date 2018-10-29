/*
 * 对系统交互的操作提醒
 *
 *
 *
 */
;
(function() {
    function setup($) {
        var timer = null;
        var dialogor = null;
        $.u = $.u ? $.u : {};
        $.u.alert = {
            "options": {
                "timeout": null,
                "closable": true,
                "dialog": false
            },
            "reset": function() {
                $.u.alert.options = {
                    "timeout": null,
                    "closable": true,
                    "dialog": false
                }
            },
            "info": function(msg, timeout) {
                alertMsg('alert alert-info', 'fa-info-circle', msg, timeout || (1000 * 3));
            },
            "success": function(msg, timeout) {
                alertMsg('alert alert-success', ' fa-check-circle', msg, timeout || (1000 * 3));
            },
            "warn": function(msg, timeout) {
                alertMsg('alert alert-warning', 'fa-warning', msg, timeout || (1000 * 3));
            },
            "error": function(msg, timeout) {
                alertMsg('alert alert-danger', 'fa-exclamation-circle', msg, timeout || (1000 * 3));
            },
            "hide": function() {
                hideMsg();
            }
        }
        $.u.alert4$ = {
            "info": function(msg, divsel, timeout) {
                alertMsg4$('alert alert-info', msg, divsel, timeout);
            },
            "success": function(msg, divsel, timeout) {
                alertMsg4$('alert alert-success', msg, divsel, timeout);
            },
            "warn": function(msg, divsel, timeout) {
                alertMsg4$('alert alert-warning', msg, divsel, timeout);
            },
            "error": function(msg, divsel, timeout) {
                alertMsg4$('alert alert-danger', msg, divsel, timeout);
            }
        }
        $.u.alert4$._cachedsel = null;
        var hideMsg = function() {
            if ($.u.alert.options.dialog) {
                dialogor.dialog("close");
                dialogor = null;
            } else {
                var $alert = $('#uui-alert');
                $alert.children().first().removeAttr('class');
                $alert.children().first().children().first().empty();
                $alert.hide();
            }
        }
        var alertMsg = function(className, icon, message, timeout) {
            if (timer) {
                clearTimeout(timer);
                timer = null;
            }
            if ($.u.alert.options.dialog) {
                var title = null;
                if (className.indexOf("alert-info") > 0) {
                    title = "信息";
                } else if (className.indexOf("alert-success") > 0) {
                    title = "确认";
                } else if (className.indexOf("alert-warning") > 0) {
                    title = "警告";
                } else if (className.indexOf("alert-danger") > 0) {
                    title = "错误";
                }
                dialogor = $("<div/>").dialog({
                    title: title,
                    modal: true,
                    resizable: false,
                    create: function() {
                        $("<p>" + message + "</p>").appendTo($(this));
                    },
                    close: function() {
                        $(this).dialog("destroy").remove();
                    },
                    buttons: [{
                        text: "确定",
                        click: function() {
                            $(this).dialog("close");
                        }
                    }]
                });
                dialogor.prev(".ui-dialog-titlebar").removeClass("ui-widget-header").addClass(className);
            } else {
                var $alert = $('#uui-alert');
                if ($alert.length < 1) {
                    var htm = '<div id="uui-alert" class="ui-widget sms-message"><div><i class="fa  fa-lg message-icon"></i><p></p><span class="ui-icon ui-icon-close" style="cursor:pointer;position:absolute;right:4px;top:11px;"></span></div>';
                    if ($("body").children().length > 0) {
                        $alert = $(htm).insertBefore($("body").children().first());
                    } else {
                        $alert = $(htm).appendTo($('body'));
                    }
                    $alert.off("click", ".ui-icon-close");
                    $alert.on("click", ".ui-icon-close", function() {
                        hideMsg();
                    });
                }
                $alert.children().first().children().first().addClass(icon);
                $alert.children().first().removeAttr('class').addClass(className);
                $alert.children().first().children().eq(1).html(message);
                $alert.css({
                    "margin-left": ($(document).width() - $alert.width()) / 2
                });
                $alert.show();
            }
            if (timeout) { //$.u.alert.options.timeout
                timer = setTimeout(hideMsg, timeout);
            }
        }
        var alertMsg4$ = function(className, message, divsel, timeout) {
            if (timer) {
                clearTimeout(timer);
                timer = null;
            }
            if ($.u.alert4$._cachedsel) {
                $.u.alert4$._cachedsel.remove();
                $.u.alert4$._cachedsel = null;
            }
            divsel.addClass(className);
            divsel.html(message);
            divsel.slideDown(500);
            if (!timeout) {
                timeout = 2000; // 默认2s
            }
            $.u.alert4$._cachedsel = divsel;
            timer = setTimeout(function() {
                $.u.alert4$._cachedsel.fadeOut(500);
                $.u.alert4$._cachedsel.remove();
                $.u.alert4$._cachedsel = null;
            }, timeout);
        }
    }
    if (typeof define === 'function' && define.amd && define.amd.jQuery) {
        define(['jquery'], setup);
    } else {
        setup(jQuery);
    }
})();