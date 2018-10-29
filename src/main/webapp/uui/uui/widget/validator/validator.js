(function () {
    /**
    *参数说明：
    * 校验str
    * 规则rule: { bRequired : true/false , sType : * , aoTypeData : * , iLength : * , sRegex : *  } 必填（默认false），类型校验(支持string , int , double , enum, text)，类型为enum时候的校验数组 ，长度校验，正则校验
    * 如果sType为enum,那么aoTypeData为[{sReal :* , sName : *},...]这种结构
    */
    $.u.valid = function (str, rule) {
        if (rule) {
            if (rule.bRequired != null && rule.bRequired == true) {
                if (!str || str == "") {
                    return "必填";
                }
            }
            if (rule.sType) {
                if (rule.sType == "int") {
                    if (str && str != "") {
                        if (!str.isInt()) {
                            return "只允许整数";
                        }
                    }
                }
                if (rule.sType == "double") {
                    if (str && str != "") {
                        if (!str.isFloat()) {
                            return "只允许数字";
                        }
                    }
                }
                if (rule.sType == "enum") {
                    var eq = false;
                    if (rule.aoTypeData && rule.aoTypeData.length > 0) {
                        $.each(rule.aoTypeData, function (idx, aparam) {
                            if (str == aparam.sReal) {
                                eq = true;
                                return; // 跳出判断
                            }
                        });
                    }
                    if (!eq) {
                        return "必须是有效枚举值";
                    }
                }
            }
            // 只判断有长度以及长度有效情况
            if (rule.iLength && rule.iLength > 0) {
                if (str && str.length > rule.iLength) {
                    return "长度超出限制";
                }
            }
            if (rule.sRegex) {
                var re = new RegExp(rule.sRegex)
                if (!re.test(str)) {
                    return "不符合规则";
                }
            }
        }
        return null;
    }

    $.u.access = function (sPermid, context) {
        if (sPermid == null || sPermid == "") {
            // 没设表示全部都可以
            return true;
        }
        var tp = typeof (sPermid);
        if (tp == "function") {
            return $.proxy(sPermid, context)();
        }
        else if (tp == "string" && tp.startwith("function")) {
            eval("var functmp=" + sPermid + ";return $.proxy(functmp, context)();");
        }
        else {
            // 这里到底看cookie还是看什么?
            var uskyuser = $.parseJSON($.cookie("uskyuser"));
            if (uskyuser.perms) {
                if ($.inArray(sPermid, uskyuser.perms) > -1)
                    return true;
                else
                    return false;
            }
            else {
                // TODO:这里以后是return false;
                //return false;
                return true;
            }
        }
    }
})();