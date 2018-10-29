/**
*以xx开始
*/
;String.prototype.startwith = function (prefix) {
    return this.indexOf(prefix) === 0;
};
/**
*以xx结束
*/
String.prototype.endwith = function (suffix) {
    return this.match(suffix + "$") == suffix;
};

/**
*左面多少个字符
*/
String.prototype.left = function (n) {
    if (n > this.length)
        return this;
    return this.substr(0, n);
};

/**
*右面多少个字符
*/
String.prototype.right = function (n) {
    if (n > this.length)
        return this;

    return this.substr(this.length - n, n);
};

/**
*Trim
*/
String.prototype.trim = function () {
    return (this || "").replace(/^\s+|\s+$/g, "");
};
/**
*左Trim
*/
String.prototype.ltrim = function () {
    return (this || "").replace(/^\s+/g, "");
};
/**
*右Trim
*/
String.prototype.rtrim = function () {
    return (this || "").replace(/\s+$/g, "");
};
/**
*String翻转
*/
String.prototype.reverse = function () {
    splitext = this.split("");
    revertext = splitext.reverse();
    reversed = revertext.join("");
    return reversed;
};

/**
*加字符
*/
String.prototype.addcharat = function (ind, achar) {
    var string_one = this.slice(0, ind);
    var string_two = this.slice(ind, this.length);
    var final_string = string_one.concat(achar, string_two);
    return final_string;
};

/**
*去字符
*/
String.prototype.removecharat = function (ind) {
    var string_one = this.slice(0, ind);
    var string_two = this.slice(ind + 1, this.length);
    var final_string = string_one.concat(string_two);
    return final_string;
};
/**
*去<xx></xx>这样的标签
*/
String.prototype.striptags = function () {
    stripped = this.replace(/[\<\>]/gi, "");
    return stripped;
};
/**
*替换所有
*/
String.prototype.replaceall = function (oldstr, newstr, ignoreCase) {
    if (!RegExp.prototype.isPrototypeOf(oldstr)) {
        return this.replace(new RegExp(oldstr, (ignoreCase ? "gi" : "g")), newstr);
    } else {
        return this.replace(oldstr, newstr);
    }
};

/**
*首字大写，其他小写
*/
String.prototype.topropercase = function () {
    return this.toLowerCase().replace(/^(.)|\s(.)/g,
    function ($1) { return $1.toUpperCase(); });
};

/**
*js默认中文1个字符，这个是将中文识别为2个字符
*/
String.prototype.byteslen = function () {
    return this.replace(/[^x00-xff]/g, "**").length;
};

String.prototype.isFloat = function () {
    if (typeof this == 'number') {
        return true;
    }
    return !isNaN(this - 0);
};

String.prototype.isInt = function () {
    return this % 1 == 0;
};

/**
*重复几个字符,小于1的都是返回原值
*/
String.prototype.repeat = function (n) {
    var r = this;
    if (n <= 1)
        return r;
    for (var i = 0 ; i < n - 1 ; i++) {
        r += this;
    }
    return r;
};