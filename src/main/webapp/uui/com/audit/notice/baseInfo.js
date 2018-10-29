//@ sourceURL=com.audit.notice.baseInfo
$.u.define('com.audit.notice.baseInfo', null, {
    init: function(option) {
        //基本信息
        this._option = option || {};
        $.validator.addMethod("compareStartDate", function(value, element, params) {
            var $compare = $(params),
                compareValue = $.trim($compare.val());
            if (value) {
                value = new Date(value);
                if (compareValue) {
                    compareValue = new Date(compareValue);
                    if (value - compareValue >= 0) {
                        return true;
                    } else {
                        return false;
                    }
                } else {
                    return true;
                }
            } else {
                return true;
            }
        }, "结束日期小于开始日期");
        $.validator.addMethod("compareNowDate", function(value, element, params) {
            if (value) {
                value = new Date(value);
                value = value.getTime() + 1000 * 60 * 60 * 24;
                value = new Date(value);
                now = new Date();
                return value - now >= 0;
            } else {
                return false;
            }
        }, "日期必须晚于今天");
    },
    afterrender: function() {
        this.baseinfoform = this.qid("baseinfoform");
        this.table = this.qid("table");
        this.source = this.qid("source");
        this.improveNoticeNo = this.qid("improveNoticeNo");
        this.improveNoticeTransactor = this.qid("improveNoticeTransactor");
        this.improveNoticeTransactorTel = this.qid("improveNoticeTransactorTel");
        /**
         * @title 添加审核人处理段
         */
        this.improveNotice_flowUser = this.qid("improveNotice_flowUser");
        if(this._option.data.status.name=="新建"){
        	this.improveNotice_flowUser.parent("td").addClass("hidden");
        	this.improveNotice_flowUser.parents("tr").addClass("hidden");
        	this.qid("improveNotice_flowUser").parent("td").prev().addClass("hidden");
        }else if(this._option.data.status.name=="下发"){
        	this.improveNotice_flowUser.parent("td").addClass("hidden");
        	this.qid("improveNotice_flowUser").parent("td").prev().addClass("hidden");
        }
        this.createTable();
    },
    createTable: function() {
    	var flowUsers="";
    	if(this._option.data.flowUsers){
    		$.each(this._option.data.flowUsers,function(index,item){
        		flowUsers += item.name+" ";
        		return flowUsers;
        	})	
    	}
    	if(flowUsers){
    		this.improveNotice_flowUser.val(flowUsers);
    	}else{
    		$("input[name=improveNotice_flowUser]").parents("td").remove();
    		$("input[name=improveNotice_flowUser]").parents("td").prev().remove();
    	}
        if (this._option.data && (this._option.data.creator != $.cookie().userid)) {
           /* this.qid("replyDeadLine").parent("td").addClass("hidden");
            this.qid("replyDeadLine").parent("td").prev().addClass("hidden");*/
            this.qid("replyDeadLine").parent("td").attr("disabled",true);
            this.qid("replyDeadLine").parent("td").prev().attr("disabled",true);
        }
        this.table.find('input.date').datepicker({
            dateFormat: "yy-mm-dd"
        });
        this.source.select2({
            placeholder: "请选择来源",
            allowClear: true,
            minimumResultsForSearch: -1,
            ajax: {
                url: $.u.config.constant.smsqueryserver,
                type: "post",
                dataType: "json",
                data: function(term, page) {
                    return {
                        "tokenid": $.cookie("tokenid"),
                        "category": "OUTER",
                        "method": "getImproveNoticeSource"
                    };
                },
                results: function(data, page) {
                    if (data.success) {
                        return {
                            results: data.data
                        };
                    }
                }
            },
            formatResult: function(item) {
                return item.name;
            },
            formatSelection: function(item) {
                return item.name;
            }
        });
        var rules = {};
        if (this._option.required) {
            var required = this._option.required.split(",");
            required && $.each(required, this.proxy(function(idx, obj) {
                var $obj = $('[qid=' + obj + ']');
                $("<span class='text-danger'>*</span>").appendTo($obj.parent().prev());
                if (obj == "replyDeadLine") {
                    rules[obj] = {
                        "compareNowDate": "日期必须晚于今天",
                        "required": true,
                        "dateISO": true
                    }
                } else if (obj === "checkStartDate") {
                    rules[obj] = {
                        "required": true,
                        "dateISO": true
                    }
                } else if (obj === "checkEndDate") {
                    rules[obj] = {
                        "compareStartDate": "#" + this._id + "-checkStartDate",
                        "required": true,
                        "dateISO": true
                    }
                } else {
                    rules[obj] = "required";
                }
            }));
        }
        if (this._option.canModify) {
            this._option.canModify = this._option.canModify.split(",");
            this._option.canModify && $.each(this._option.canModify, this.proxy(function(idx, obj) {
                if (obj == "source") {
                    this[obj].select2("enable", true);
                } else {
                    var $obj = $('[qid=' + obj + ']');
                    $obj.removeAttr("disabled");
                }
            }));
        }
        if (this._option.deleted) {
            this._option.deleted = this._option.deleted.split(",");
            this._option.deleted && $.each(this._option.deleted, this.proxy(function(idx, obj) {
                var $obj = $('[qid=' + obj + ']', this.baseinfoform),
                    $parent = $obj.parent();
                if ($parent.siblings().length == 1) {
                    $parent.parent().remove();
                } else {
                    $parent.prev().remove();
                    $parent.remove();
                }
            }));
        }
        if (this._option.data) {
            this._option.data && $.each(this._option.data, this.proxy(function(idx, value) {
                if (idx === "source") {
                    if (value.id) {
                        this[idx].select2("data", value);
                        if (value.id === "SPEC" || value.id === "SPOT") {
                            this[idx].select2("enable", false);
                        }
                    }
                } else if (idx == "improveNoticeTransactor") {
                    this.baseinfoform.find('[name=' + idx + ']').val(this._option.data.creatorDisplayName);
                } else {
                    this.baseinfoform.find('[name=' + idx + ']').val(value);
                }
            }));
        }
        if (this._option.disabled === "disabled") {
            $("input,textarea", this.$).attr("disabled", true);
        }
        this.baseinfoform.validate({
            rules: rules,
            messages: {
                source: "来源不能为空",
                improveNoticeNo: "整改编号不能为空",
                address: "检查地点不能为空",
                checkDate: {
                    "required": "检查日期不能为空",
                    "dateISO": "请输入合法的日期"
                },
                checkStartDate: {
                    "required": "开始日期不能为空",
                    "dateISO": "请输入合法的日期"
                },
                checkEndDate: {
                    "required": "结束日期不能为空",
                    "dateISO": "请输入合法的日期"
                },
                replyDeadLine: {
                    "required": "回复期限不能为空",
                    "dateISO": "请输入合法的日期"
                },
                improveNoticeTransactor: "经办人不能为空",
                improveNoticeTransactorTel: "联系方式不能为空",
                improveNotice_flowUser:"处理人不能为空",
                executive: "负责人不能为空",
                executiveTel: "负责人联系方式不能为空"
            },
            errorClass: "text-danger text-validate-element",
            errorElement: "div"
        });
        if($(".mycontrl").find("td").length<2){
        	$(".mycontrl").remove();
        }
    },
    getFormData: function() {
        var data = {};
        $.each(this.baseinfoform.serializeArray(), this.proxy(function(idx, obj) {
            if ($.inArray(obj.name, this._option.canModify) > -1) {
                data[obj.name] = obj.value;
            }
        }));
        return data;
    }
}, {
    usehtm: true,
    usei18n: false
});

com.audit.notice.baseInfo.widgetjs = [
    "../../../uui/widget/spin/spin.js",
    "../../../uui/widget/jqurl/jqurl.js",
    "../../../uui/widget/jqblockui/jquery.blockUI.js",
    "../../../uui/widget/ajax/layoutajax.js",
    "../../../uui/widget/select2/js/select2.min.js"
];
com.audit.notice.baseInfo.widgetcss = [{
    id: "",
    path: "../../../uui/widget/select2/css/select2.css"
}, {
    id: "",
    path: "../../../uui/widget/select2/css/select2-bootstrap.css"
}];