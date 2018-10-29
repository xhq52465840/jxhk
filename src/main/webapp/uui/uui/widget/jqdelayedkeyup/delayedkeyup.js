(function ($) {
    $.widget("ui.delayedkeyup", {
        _init: function () {
            $(this.element).keyup($.proxy(function (e) {
                if (typeof (window['jqInputTimeout']) != "undefined") {
                    window.clearTimeout(window['jqInputTimeout']);
                }
                window['jqInputTimeout'] = window.setTimeout($.proxy(function (ex) {
                    this.options.handler(ex);
                }, this, e), this.options.delay);
            }, this));
        },
        options: {
            handler: $.noop(),
            delay: 500
        }

    });
})(jQuery);
