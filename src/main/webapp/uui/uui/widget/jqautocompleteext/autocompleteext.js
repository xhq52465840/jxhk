; (function ($, undefined) {
    $.widget("ui.autocomplete", $.ui.autocomplete, {
        _create: function () {
            this._super();
            this.inputclear = $("<span style='position:relative;'><a class='ui-icon ui-icon-trash'>X</a></span>").insertAfter(this.element);
            //$("a", this.inputclear).offset({ top: this.element.offset().top + 2, left: (this.element.offset().left + this.element.width() - 25) });
            $("a", this.inputclear).css("position", "absolute").css("cursor", "pointer").css("right", "20px").css("top", "-3px");
            this.inputclear.unbind("click");
            this.inputclear.click(function (e) {
                var ele = $(e.currentTarget).prev();
                ele.removeAttr("real");
                ele.val(null);
            });
        },
        _destroy: function () {
            this._super();
            this.inputclear.remove();
        }
    });
})(jQuery);

