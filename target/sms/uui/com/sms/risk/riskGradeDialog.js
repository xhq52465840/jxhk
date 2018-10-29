//@ sourceURL=com.sms.risk.riskGradeDialog
/**
 * 编辑风险等级对话框
 * @author wans
 */
$.u.define('com.sms.risk.riskGradeDialog', null, {
    init: function(options) {
        this._options = options || {};
        this._SELECT2_PAGE_LENGTH = 10;
        this.dengerClassify = this._options.dengerClassify;
        this.datadata = this._options.datadata;

    },
    afterrender: function() {
        this.i18n = com.sms.risk.riskGradeDialog.i18n;
        this.possibility = this.qid("possibility");
        this.severity = this.qid("severity");
        this.riskRatio = this.qid("riskRatio");
        this.riskColour = this.qid("riskColour");
        this.possibility.on("change",this.proxy(this.pRiskRatio));
        this.severity.on("change",this.proxy(this.sRiskRatio));
        this.form = this.qid("form").validate({
            rules: {
                "possibility": {
                    "required": true,
                    "digits": true,
                    "range": [1, 5]
                },
                "severity": {
                    "required": true,
                    "digits": true,
                    "range": [1, 5]
                },
            },
            ignore: ".ignore",
            messages: {
                "possibility": {
                    "required": "可能性不能为空",
                    "digits": "请输入正整数",
                    "range": "请输入1~5以内的正整数"
                },
                "severity": {
                    "required": "严重性不能为空",
                    "digits": "请输入正整数",
                    "range": "请输入1~5以内的正整数"
                },
            },
            errorClass: "text-danger text-validate-element",
            errorElement: "div"
        });

        this.riskGradeDialog = this.qid("riskGradeDialog").dialog({
            title: this.i18n.title,
            width: 540,
            modal: true,
            draggable: false,
            resizable: false,
            autoOpen: false,
            buttons: [{
                "text": this.i18n.buttons.confirm,
                "click": this.proxy(this.on_ok_click)
            }, {
                "text": this.i18n.buttons.cancel,
                "class": "aui-button-link",
                "click": this.proxy(this.on_cancel_click)
            }],
            create: this.proxy(this.on_dialog_create),
            open: this.proxy(this.on_dialog_open),
            close: this.proxy(this.on_dialog_close)
        });



    },
    /**
     * @title 模态层创建时执行
     */
    on_dialog_create: function() {

    },

    /**
     * @title 模态层打开时执行
     */
    on_dialog_open: function() {


    },
    /**
     * @title 模态层关闭时执行
     */
    on_dialog_close: function() {
        this.clearFormData();
        this.qid("form").validate().resetForm();
    },


    on_ok_click: function() {
        this.form = this.qid("form");
        if (this.form.valid()) {
            this.fresh(this.getFormData());
        };
    },
    fresh: function(param) {
    },
    on_cancel_click: function() {
        this.riskGradeDialog.dialog("close");
    },

    open: function(param) {
        if (param.mode == 'edit') {
            this.riskGradeDialog.dialog("option", {
                title: "编辑风险等级"
            });
            this.dengerClassify = param.dengerClassify ;
            this.possibility.val(param.datadata.riskLevelP || "");    //可能性
            this.severity.val(param.datadata.riskLevelS || "");    //严重性
            this.riskRatio.val((parseInt(param.datadata.riskLevelP) * parseInt(param.datadata.riskLevelS))|| "");
        };
        this.riskGradeDialog.dialog("open");
    },
    close: function(){
         this.riskGradeDialog.dialog("close");
    },

     /**
     * @title 可能性改变时调用方法
     */

    pRiskRatio:function(){
         if(this.severity.val() && this.possibility.val()){
            var R = parseInt(this.severity.val()) * parseInt(this.possibility.val());
            this.riskRatio.val(R);
            this.Rcolour(R);
        }
        
    },

    /**
     * @title 严重性改变时调用方法
     */

    sRiskRatio: function(){
        if(this.severity.val() && this.possibility.val()){
            var R = parseInt(this.severity.val()) * parseInt(this.possibility.val());
            this.riskRatio.val(R);
            this.Rcolour(R);
        }
    },
    /**
     * @title 风险等级颜色
     */

    Rcolour: function(colour){
        if(colour < 5){
            this.riskColour.css({"background-color":"green"});
        }else if(5 <= colour && colour < 15){
            this.riskColour.css({"background-color":"yellow"});
        }else if (colour >= 15){
            this.riskColour.css({"background-color":"red"});
        }

    },

    getFormData: function() {
        var p = this.possibility.val(), s = this.severity.val();
        var r = p * s;
        return {
            possibility: parseInt(p), //可能性
            severity: parseInt(s),       //严重性
            dengerClassify:this.dengerClassify

        };
    },
    clearFormData: function() {
        this.possibility.val(null); //可能性
        this.severity.val(null);    //严重性
        this.riskRatio.val(null);   //风险系数
        this.riskColour.css({"background-color":"#eee"});   //风险系数  #eee
    },
    destroy: function() {
        this._super();
    }
}, {
    usehtm: true,
    usei18n: true
});

com.sms.risk.riskGradeDialog.widgetjs = [
    "../../../uui/widget/jqurl/jqurl.js",
    "../../../uui/widget/select2/js/select2.min.js",
    "../../../uui/widget/spin/spin.js",
    "../../../uui/widget/ajax/layoutajax.js"
];
com.sms.risk.riskGradeDialog.widgetcss = [{
    path: "../../../uui/widget/select2/css/select2.css"
}, {
    path: "../../../uui/widget/select2/css/select2-bootstrap.css"
}];