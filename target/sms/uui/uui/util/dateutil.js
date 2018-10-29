/**    
 * 对Date的扩展，将 Date 转化为指定格式的String    
 * 月(M)、日(d)、12小时(h)、24小时(H)、分(m)、秒(s)、周(E)、季度(q) 可以用 1-2 个占位符    
 * 年(y)可以用 1-4 个占位符，毫秒(S)只能用 1 个占位符(是 1-3 位的数字)    
 * eg:    
 * (new Date()).format("yyyy-MM-dd hh:mm:ss.S") ==> 2006-07-02 08:09:04.423    
 * (new Date()).format("yyyy-MM-dd E HH:mm:ss") ==> 2009-03-10 二 20:09:04    
 * (new Date()).format("yyyy-MM-dd EE hh:mm:ss") ==> 2009-03-10 周二 08:09:04    
 * (new Date()).format("yyyy-MM-dd EEE hh:mm:ss") ==> 2009-03-10 星期二 08:09:04    
 * (new Date()).format("yyyy-M-d h:m:s.S") ==> 2006-7-2 8:9:4.18    
 */
Date.prototype.format = function(fmt) {
    var o = {
        "M+": this.getMonth() + 1,
          //月份       
        "d+": this.getDate(),
          //日       
        "h+": this.getHours() % 12 == 0 ? 12 : this.getHours() % 12,
          //小时       
        "H+": this.getHours(),
          //小时       
        "m+": this.getMinutes(),
          //分       
        "s+": this.getSeconds(),
          //秒       
        "q+": Math.floor((this.getMonth() + 3) / 3),
          //季度       
        "S": this.getMilliseconds()  //毫秒       
    };
    var week = {
        "0": "\u65e5",
        "1": "\u4e00",
        "2": "\u4e8c",
        "3": "\u4e09",
        "4": "\u56db",
        "5": "\u4e94",
        "6": "\u516d"
    };
    if (/(y+)/.test(fmt)) {
        fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
    }
    if (/(E+)/.test(fmt)) {
        fmt = fmt.replace(RegExp.$1, ((RegExp.$1.length > 1) ? (RegExp.$1.length > 2 ? "\u661f\u671f" : "\u5468") : "") + week[this.getDay() + ""]);
    }
    for (var k in o) {
        if (new RegExp("(" + k + ")").test(fmt)) {
            fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
        }
    }
    return fmt;
}

/* 
 * 参dateFmt: 
 * yy:长YY:短m:数MM:英dd:日hh:时 
 * mi:分ss秒ms:毫we:汉WE:英 
 * isFmtWithZero : zero补充，默认有
 */
Date.prototype.parsestring = function(dateFmt, isFmtWithZero) {
    dateFmt = (dateFmt == null ? "yy-mm-dd" : dateFmt);
    isFmtWithZero = (isFmtWithZero == null ? true : isFmtWithZero);
    if (typeof(dateFmt) != "string")
        throw (new Error(-1, 'parsestring()格式化字符串错误'));
    var weekArr = [
        ["星期日", "星期一", "星期二", "星期三", "星期四", "星期五", "星期六"],
        ["SUN", "MON", "TUR", "WED", "THU", "FRI", "SAT"]
    ];
    var monthArr = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
    var str = dateFmt;
    str = str.replace(/yy/g, this.getFullYear());
    str = str.replace(/YY/g, this.getYear());
    str = str.replace(/mm/g, (this.getMonth() + 1).toString().fmtWithZero(isFmtWithZero));
    str = str.replace(/MM/g, monthArr[this.getMonth()]);
    str = str.replace(/dd/g, this.getDate().toString().fmtWithZero(isFmtWithZero));
    str = str.replace(/hh/g, this.getHours().toString().fmtWithZero(isFmtWithZero));
    str = str.replace(/mi/g, this.getMinutes().toString().fmtWithZero(isFmtWithZero));
    str = str.replace(/ss/g, this.getSeconds().toString().fmtWithZero(isFmtWithZero));
    str = str.replace(/ms/g, this.getMilliseconds().toString().fmtWithZeroD(isFmtWithZero));
    str = str.replace(/we/g, weekArr[0][this.getDay()]);
    str = str.replace(/WE/g, weekArr[1][this.getDay()]);
    return str;
}

Date.prototype.addDays = function(number) {
    return new Date(this.getTime() + 24 * 60 * 60 * 1000 * number);
}