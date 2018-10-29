/**
 * Created by wayne 
 * 
 * _打头的是尽量内部访问，大写的是外部访问
 * 功能：
 * 1、引入最基本的js和css，如果是dep发布模式，则自己在index.htm自己引入（所有js都在一个文件中）
 * 2、额外的js，还可以通过loadjs来加载
 */
//
(function() {
    $.u = $.u || {};
    $.extend(true, $.u, {
        /**
         *   全局使用，需要设置
         */
        config: {
            region: 'zh',
            i18n: {},
            appname: '', // 项目工程的名字，根据发布到web容器中的名字来
            mode: 'dep', // dev开发模式，按corejs、corecss加载;dep发布模式，一次性加载（前提先加载jquery）,dep 位生产模式
            deploy: {
                name: 'udef'
            }, //dep开发模式，读取压缩文件的名字
            debug: false, // debug模式必须是mode为dev情况下，他会在head上再次加载一边js，就可以用chrome调试
            constant: {} // 全局的常量, init后可以做一些extend
        },
        /**
         *   全局内部使用，不可设置
         */
        _global: {
            domain: "",
            protocol: "",
            scripturls: [],
            // 以下路径，必须绝对路径（从根开始）
            devcorejs: ['/uui/widget/jcookie/jquery.cookie.min.js', '/uui/widget/jstorage/jstorage.min.js', '/uui/widget/jqui/ui/jquery-ui.min.js', '/uui/widget/jqui/ui/i18n/jquery-ui-i18n.min.js', '/uui/widget/bootstrap/js/bootstrap.min.js', '/uui/util/json2.js', '/uui/util/dateutil.js', '/uui/util/stringutil.js', '/uui/core/uclazz.js', '/uui/core/umodule.js', '/uui/widget/jqalert/jqalert.js'],
            devcorecss: [{
                id: 'bootcss',
                path: '/uui/widget/bootstrap/css/bootstrap.min.css',
                disabled: false
            }, {
                id: 'bootjquicss',
                path: '/uui/widget/bootstrap/css/custom-theme/jquery-ui-1.10.3.custom.css',
                disabled: false
            }, {
                id: 'bootjquicss',
                path: '/uui/widget/fontawesome/css/font-awesome.css',
                disabled: false
            }, {
                id: 'main',
                path: 'main.css',
                disabled: false
            }], // 为什么要id，是因为
            depcorejs: [], //用来存压缩过的js
            depcorecss: [] //用来存压缩过的css
        },
        __uniqueids: [], //用于缓存生成的id
        __oldURL: null,
        __oldHash: null,
        __routeOptions: null,
        /////////////////////////////////以下是方法////////////////////////////////////////////
        /**
         * 解析相对Url的方法
         * 
         */
        _absolutizeuri: function(base, href) {
            function removeDotSegments(input) {
                var output = [];
                input.replace(/^(\.\.?(\/|$))+/, '')
                    .replace(/\/(\.(\/|$))+/g, '/')
                    .replace(/\/\.\.$/, '/../')
                    .replace(/\/?[^\/]*/g, function(p) {
                        if (p === '/..') {
                            output.pop();
                        } else {
                            output.push(p);
                        }
                    });
                return output.join('').replace(/^\//, input.charAt(0) === '/' ? '/' : '');
            }

            function parseURI(url) {
                var m = String(url).replace(/^\s+|\s+$/g, '').match(/^([^:\/?#]+:)?(\/\/(?:[^:@]*(?::[^:@]*)?@)?(([^:\/?#]*)(?::(\d*))?))?([^?#]*)(\?[^#]*)?(#[\s\S]*)?/);
                // authority = '//' + user + ':' + pass '@' + hostname + ':' port
                return (m ? {
                    href: m[0] || '',
                    protocol: m[1] || '',
                    authority: m[2] || '',
                    host: m[3] || '',
                    hostname: m[4] || '',
                    port: m[5] || '',
                    pathname: m[6] || '',
                    search: m[7] || '',
                    hash: m[8] || ''
                } : null);
            }

            href = parseURI(href || '');
            base = parseURI(base || '');

            return !href || !base ? null : (href.protocol || base.protocol) +
                (href.protocol || href.authority ? href.authority : base.authority) +
                removeDotSegments(href.protocol || href.authority || href.pathname.charAt(0) === '/' ? href.pathname : (href.pathname ? ((base.authority && !base.pathname ? '/' : '') + base.pathname.slice(0, base.pathname.lastIndexOf('/') + 1) + href.pathname) : base.pathname)) +
                (href.protocol || href.authority || href.pathname ? href.search : (href.search || base.search)) +
                href.hash;
        },
        /**
         * 先将自己的链接保存下来，以便后面校验重复
         * 参数，启动的当前html文件
         */
        inituui: function(pagename) {
            if ($.u._global.domain == '') {
                if (pagename && pagename != "") {
                    $.u.config.appname = window.location.pathname.replace(pagename, '');
                }
                if (window.location.protocol != 'http:' && window.location.protocol != 'https:') {
                    if (window.location.protocol == 'file:') {
                        if (arguments.length > 0) {
                            $.u._global.domain = window.location.protocol + '///' + arguments[0];
                            $.u._global.protocol = window.location.protocol;
                        } else {
                            throw new Error('开发时错误：file:模式下需要指定项目基本路径，使用_inituui("文件路径")');
                        }
                    } else {
                        // 不支持http和https以外的协议
                        throw new Error('开发时错误：不支持http、https、file以外的协议');
                    }
                } else {
                    $.u._global.domain = window.location.protocol + '//' + window.location.host;
                    if ($.u.config.appname != '') {
                        $.u._global.domain += $.u.config.appname;
                    } else {
                        $.u._global.domain += "/";
                    }
                    $.u._global.protocol = window.location.protocol;
                    /*
                    if (window.location.hostname == "localhost") {
                        var path = window.location.pathname;
                        if (path.indexOf("/") == 0) {
                            path = path.substring(1);
                        }
                        path = path.split("/", 1);
                        if (path != "") {
                            $.u._global.domain = $.u._global.domain + path + "/";
                        }
                    }
                    */
                }
                // 检查head加载的js和css，免得重复加载
                $('head').contents().filter(function() {
                    return $.u.nodeType == 1;
                }).each(
                    function(i, dom) {
                        if ('link' == dom.tagName.toLowerCase()) {
                            if (dom.href) {
                                $.u._global.scripturls.push($.u._absolutizeuri(window.location, dom.href));
                            }
                        } else if ('script' == dom.tagName.toLowerCase()) {
                            if (dom.src) {
                                $.u._global.scripturls.push($.u._absolutizeuri(window.location, dom.src));
                            }
                        }
                    }
                );
                if ($.u.config.mode == 'dev') {
                    // 加载国际化语言，如果配置了语言的话
                    if ($.u.config.region != '') {
                        var scriptLanUrl = $.u._global.domain + 'uui/core/i18n/uui-i18n-' + $.u.config.region + '.js';
                        if ($.inArray(scriptLanUrl, $.u._global.scripturls) == -1) {
                            if ($.u._global.protocol == 'file:') {
                                $('head').append('<script  type="text/javascript" src="' + scriptLanUrl + '"></script>');
                            } else {
                                $.ajax({
                                    url: scriptLanUrl,
                                    dataType: 'script',
                                    async: false,
                                    cache: false,
                                    success: function(data) {
                                        $.u._global.scripturls.push(scriptLanUrl);
                                    },
                                    error: function(XMLHttpRequest, textStatus, errorThrown) {
                                        throw new Error('开发时错误：' + XMLHttpRequest.status + ' ' + textStatus + ' ' + errorThrown + ' ,' + '无法加载全局国际化文件——' + scriptLanUrl);
                                    }
                                });
                            }
                        }
                    }
                    $.each($.u._global.devcorecss, function(idx, cssobj) {
                        // css即便没加载进来，也不用抛错
                        if (cssobj.path != null && cssobj.path != '') {
                            var absHrefUrl;
                            if (cssobj.path != null && cssobj.path != "" && cssobj.path[0] == "/") {
                                absHrefUrl = $.u._global.domain + cssobj.path.substr(1, cssobj.path.length - 1);
                            } else {
                                absHrefUrl = $.u._global.domain + cssobj.path;
                            }
                            if ($.inArray(absHrefUrl, $.u._global.scripturls) == -1) {
                                $.u._global.scripturls.push(absHrefUrl);
                                var linkstr = '<link  type="text/css" rel="stylesheet"';
                                if (cssobj.id && cssobj.id != '') {
                                    linkstr += ' id="' + cssobj.id + '" ';
                                }
                                if (cssobj.disabled && cssobj.disabled == true) {
                                    linkstr += ' disabled="disabled" ';
                                }
                                $('head').append(linkstr + ' href="' + absHrefUrl + '"/>');
                            }
                        }
                    });
                    $.each($.u._global.devcorejs, function(idx, jspath) {
                        var absJSUrl;
                        if (jspath != null && jspath != "" && jspath[0] == "/") {
                            absJSUrl = $.u._global.domain + jspath.substr(1, jspath.length - 1);
                        } else {
                            absJSUrl = $.u._global.domain + jspath;
                        }
                        if ($.inArray(absJSUrl, $.u._global.scripturls) == -1) {
                            if ($.u._global.protocol == "file:") {
                                $.u._global.scripturls.push(absJSUrl);
                                $('head').append('<script  type="text/javascript" src="' + absJSUrl + '"></script>');
                            } else {
                                $.ajax({
                                    url: absJSUrl,
                                    dataType: 'script',
                                    async: false,
                                    cache: false,
                                    success: function(data) {
                                        $.u._global.scripturls.push(absJSUrl);
                                    },
                                    error: function(XMLHttpRequest, textStatus, errorThrown) {
                                        throw new Error('开发时错误：' + XMLHttpRequest.status + ' ' + textStatus + ' ' + errorThrown + ' ,' + '无法加载——' + absJSUrl);
                                    }
                                });
                            }
                        }
                    });
                } else {
                    // 发布模式
                    // 继续加载全局的
                    // css放开
                    //$('head').append('<link  type="text/css" rel="stylesheet" href="' + $.u._global.domain + 'uall.min.css"/>');
                    //js必须要
                    $.ajax({
                        url: $.u._global.domain + $.u.config.deploy.name + ".min.js",
                        dataType: 'script',
                        async: false,
                        cache: true,
                        success: function(data) {},
                        error: function(XMLHttpRequest, textStatus, errorThrown) {
                            throw new Error('开发时错误：' + XMLHttpRequest.status + ' ' + textStatus + ' ' + errorThrown + ' ,' + '无法加载——' + $.u._global.domain + "udef.min.js");
                        }
                    });
                    // 先把这些url塞进去，免得再次加载
                    //$.each($.u._global.depcorecss, function (idx, csspath) {
                    //    // css即便没加载进来，也不用抛错
                    //    var absHrefUrl;
                    //    if (csspath != null && csspath != "" && csspath[0] == "/") {
                    //        absHrefUrl = $.u._global.domain + csspath.substr(1, csspath.length - 1);
                    //    }
                    //    else {
                    //        absHrefUrl = $.u._global.domain + csspath;
                    //    }
                    //    if ($.inArray(absHrefUrl, $.u._global.scripturls) == -1) {
                    //        $.u._global.scripturls.push(absHrefUrl);
                    //    }
                    //});
                    $.each($.u._global.depcorejs, function(idx, jspath) {
                        var absJSUrl;
                        if (jspath != null && jspath != "" && jspath[0] == "/") {
                            absJSUrl = $.u._global.domain + jspath.substr(1, jspath.length - 1);
                        } else {
                            absJSUrl = $.u._global.domain + jspath;
                        }
                        if ($.inArray(absJSUrl, $.u._global.scripturls) == -1) {
                            $.u._global.scripturls.push(absJSUrl);
                        }
                    });
                    // css仍然用原来的
                    $.each($.u._global.devcorecss, function(idx, cssobj) {
                        // css即便没加载进来，也不用抛错
                        if (cssobj.path != null && cssobj.path != '') {
                            var absHrefUrl;
                            if (cssobj.path != null && cssobj.path != "" && cssobj.path[0] == "/") {
                                absHrefUrl = $.u._global.domain + cssobj.path.substr(1, cssobj.path.length - 1);
                            } else {
                                absHrefUrl = $.u._global.domain + cssobj.path;
                            }
                            if ($.inArray(absHrefUrl, $.u._global.scripturls) == -1) {
                                $.u._global.scripturls.push(absHrefUrl);
                                var linkstr = '<link  type="text/css" rel="stylesheet"';
                                if (cssobj.id && cssobj.id != '') {
                                    linkstr += ' id="' + cssobj.id + '" ';
                                }
                                if (cssobj.disabled && cssobj.disabled == true) {
                                    linkstr += ' disabled="disabled" ';
                                }
                                $('head').append(linkstr + ' href="' + absHrefUrl + '"/>');
                            }
                        }
                    });
                    // 国际化
                    var i18nfuc = eval('$.u._global.__load_i18n_' + $.u.config.region);
                    if ($.isFunction(i18nfuc)) {
                        i18nfuc();
                    }
                }
            }
        },
        /**
         *组织绝对路径的
         */
        _absurl: function(path, basepath) {
            var absUrl = '';
            if (path != null && path != '') {
                if (path.indexOf('file') == 0 || path.indexOf('http') == 0 || path.indexOf('https') == 0) {
                    // 绝对
                    absUrl = path;
                } else if (path.indexOf('/') == 0) {
                    // 另一种绝对，加domain
                    absUrl = $.u._global.domain + path.substr(1); // 去掉一个/
                } else {
                    // 相对
                    if (basepath != null && basepath != '')
                        absUrl = $.u._absolutizeuri(basepath, path)
                    else
                        absUrl = $.u._absolutizeuri(window.location, path)
                }
            }
            return absUrl;
        },
        /**
         *通过对象实例获取相对路径
         */
        absurlbymoduleobj: function(path, moduleobject) {
            return $.u._absurl(path, $.u._buildmodulepathprefix(moduleobject.constructor.clazzname) + '.js');
        },
        absurlbymodulename: function(path, modulename) {
            return $.u._absurl(path, $.u._buildmodulepathprefix(modulename) + '.js');
        },
        /**
         * 做loadjs之前肯定已经_inituui过,所以domain已有
         * jspath为js的绝对路径, callback为回调函数（有回调表示异步调用）
         */
        loadjs: function(jspath, callback) {
            if (jspath == null || jspath == '')
                return;
            //$.u._absurl(jspath, basepath);
            var absJSUrl = jspath;
            if ($.inArray(absJSUrl, $.u._global.scripturls) == -1) {
                if ($.u._global.protocol == 'file:') {
                    $.u._global.scripturls.push(absJSUrl);
                    $('head').append('<script  type="text/javascript" src="' + absJSUrl + '"></script>');
                } else {
                    if (callback && $.isFunction(callback)) {
                        // 同步，直接塞入
                        $.ajax({
                            url: absJSUrl,
                            dataType: 'text',
                            async: true,
                            cache: $.u.config.mode === 'dep',
                            success: function(data) {
                                if ($.inArray(absJSUrl, $.u._global.scripturls) == -1) {
                                    // 要再判断一次，免得异步多次执行（宁可多请求也不多执行）
                                    eval(data); // js载入
                                    $.u._global.scripturls.push(absJSUrl);
                                    if ($.u.config.debug) {
                                        $('head').append('<script  type="text/javascript" src="' + absJSUrl + '"></script>');
                                    }
                                }
                            },
                            error: function(XMLHttpRequest, textStatus, errorThrown) {
                                throw new Error('开发时错误：' + XMLHttpRequest.status + ' ' + textStatus + ' ' + errorThrown + ' ,' + '无法加载——' + absJSUrl);
                            }
                        });
                    } else {
                        // 异步，先拿到字符串，然后eval
                        $.ajax({
                            url: absJSUrl,
                            dataType: 'script',
                            async: false,
                            cache: $.u.config.mode === 'dep',
                            success: function(data) {
                                $.u._global.scripturls.push(absJSUrl);
                                if ($.u.config.debug) {
                                    $('head').append('<script  type="text/javascript" src="' + absJSUrl + '"></script>');
                                }
                            },
                            error: function(XMLHttpRequest, textStatus, errorThrown) {
                                throw new Error('开发时错误：' + XMLHttpRequest.status + ' ' + textStatus + ' ' + errorThrown + ' ,' + '无法加载——' + absJSUrl);
                            }
                        });
                    }
                }
            }
        },
        /**
         *执行远程的js，执行一次算一次,同步, callback是对返回数据data的封装, callback必须要有return
         */
        exeremotejs: function(absJSUrl, context, callback) {
            if (absJSUrl == null || absJSUrl == '')
                return;
            var jstext = null;
            $.ajax({
                url: absJSUrl,
                dataType: "text",
                async: false,
                cache: $.u.config.mode === 'dep',
                success: function(data) {
                    if (callback) {
                        jstext = callback(data);
                    } else {
                        jstext = data;
                    }
                },
                error: function(XMLHttpRequest, textStatus, errorThrown) {
                    throw new Error('开发时错误：' + XMLHttpRequest.status + ' ' + textStatus + ' ' + errorThrown + ' ,' + '无法加载——' + absJSUrl);
                }
            });
            if (jstext && context) {
                var Args = [];
                if (arguments.length > 2)
                    Args = Array.prototype.slice.call(arguments, 2);
                var func = new Function(jstext);
                func.apply(context, Args);
            }
        },
        /**
         * 做Loadcss之前肯定已经_inituui过,所以domain已有
         * 如果cssPath是以domain打头，则是绝对路径;否则是相对路径
         * cssobj为对象, basepath为绝对路径
         */
        loadcss: function(cssobj) {
            if (cssobj == null || cssobj.path == null || cssobj.path == '')
                return;
            var absHrefUrl = cssobj.path;
            if ($.inArray(absHrefUrl, $.u._global.scripturls) == -1) {
                $.u._global.scripturls.push(absHrefUrl);
                var linkstr = '<link  type="text/css" rel="stylesheet"';
                if (cssobj.id && cssobj.id != '') {
                    linkstr += ' id="' + cssobj.id + '" ';
                }
                if (cssobj.disabled && cssobj.disabled == true) {
                    linkstr += ' disabled="disabled" ';
                }
                $('head').append(linkstr + ' href="' + absHrefUrl + '"/>');
            }
        },
        /**
         * 做loadjs之前肯定已经_inituui过,所以domain已有
         * 如果htmPath是以domain打头，则是绝对路径;否则是相对路径
         * htmpath为htm的绝对路径
         */
        loadhtm: function(htmpath) {
            var dtreturn = null;
            if (htmpath != null && htmpath != '') {
                var absHTMUrl = htmpath;
                $.ajax({
                    url: absHTMUrl,
                    async: false,
                    cache: $.u.config.mode === 'dep',
                    success: function(data) {
                        if ($.u._global.protocol == 'file:') {
                            dtreturn = $.u.xmltostring(data);
                        } else {
                            dtreturn = data;
                        }
                    },
                    error: function(XMLHttpRequest, textStatus, errorThrown) {
                        throw new Error('开发时错误：' + XMLHttpRequest.status + ' ' + textStatus + ' ' + errorThrown + ' ,' + '无法加载——' + absHTMUrl);
                    }
                });
            }
            return dtreturn;
        },
        /**
         *将HTML字符串中的特殊字符转换为HTML实体, 包含 & < > " ' \
         */
        escape: function(string) {
            return ('' + string).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#x27;').replace(/\//g, '&#x2F;');
        },
        getjssrcfromhead: function(headstr) {
            var arraySrcs = new Array();
            if (headstr != null && headstr != '') {
                var regExp_src = /<script.*src\s*=\s*["'][^"']*["'].*\/?>([^<>]*<\/script\s*>)?/gi;
                var matchArray_src = headstr.match(regExp_src);
                if (matchArray_src) {
                    for (var i = 0; i < matchArray_src.length; i++) {
                        var str_temp = matchArray_src[i].toString();
                        var regExp_src_temp = /<script.*src\s*=\s*["']([^"']*)["'].*\/?>([^<>]*<\/script\s*>)?/gi;
                        str_temp.match(regExp_src_temp);
                        arraySrcs[i] = RegExp.$1;
                    }
                }
            }
            return arraySrcs;
        },
        getcsssrcfromhead: function(headstr) {
            var arraySrcs = new Array();
            if (headstr != null && headstr != '') {
                var regExp_src = /<link.*href\s*=\s*["'][^"']*["'].*\/?>([^<>]*<\/link\s*>)?/gi;
                var matchArray_src = headstr.match(regExp_src);
                if (matchArray_src) {
                    for (var i = 0; i < matchArray_src.length; i++) {
                        var str_temp = matchArray_src[i].toString();
                        var regExp_src_temp = /<link.*href\s*=\s*["']([^"']*)["'].*\/?>([^<>]*<\/link\s*>)?/gi;
                        str_temp.match(regExp_src_temp);
                        arraySrcs[i] = RegExp.$1;
                    }
                }
            }
            return arraySrcs;
        },
        getcssrawfromhead: function(headstr) {
            var arraySrcs = new Array();
            if (headstr != null && headstr != '') {
                var regExp_src = /<style.*>[^<>]*<\/style\s*>?/gi;
                var matchArray_src = headstr.match(regExp_src);
                if (matchArray_src) {
                    for (var i = 0; i < matchArray_src.length; i++) {
                        var str_temp = matchArray_src[i].toString();
                        var regExp_src_temp = /<style.*>([^<>]*)<\/style\s*>?/gi;
                        str_temp.match(regExp_src_temp);
                        arraySrcs[i] = RegExp.$1;
                    }
                }
            }
            return arraySrcs;
        },
        /**
         * xml转string工具
         */
        xmltostring: function(xmlData) {
            var xmlString;
            //IE
            if (window.ActiveXObject) {
                xmlString = xmlData.xml;
            }
            // code for Mozilla, Firefox, Opera, etc.
            else {
                xmlString = (new XMLSerializer()).serializeToString(xmlData);
            }
            return xmlString;
        },
        /**
         * 清理jq的垃圾缓存
         * domselector：删除的dom选择器, type: 'remove'或'empty'，注意没有detach
         * 此方法只有在IE下有点效果，FF和chrome可以不考虑
         */
        releasedom: function(domselector, type) {
            if ($("#uuigarbage").length == 0) {
                $('body').append('<div id="uuigarbage" style="display:none"></div>');
            }
            if (domselector && domselector.length > 0) {
                if (type == null || type == 'remove') {
                    $("#uuigarbage").append(domselector.remove());
                } else if (type == 'empty') {
                    var allchd = domselector.children();
                    var i = 0;
                    for (; i < allchd.length; i++) {
                        $.u.releasedom($(allchd[i]));
                    }
                    allchd = null;
                }
            }
            domselector = null;
            $("#uuigarbage").html("");
        },
        /**
         * 生成唯一id，默认20长
         * 2014-06-02
         */
        uniqid: function(idlength) {
            if (!idlength)
                idlength = 20;
            var charstoformid = '_0123456789ABCDEFGHIJKLMNOPQRSTUVWXTZabcdefghiklmnopqrstuvwxyz'.split('');
            var uid = '';
            for (var i = 0; i < idlength; i++) {
                uid += charstoformid[Math.floor(Math.random() * charstoformid.length)];
            }
            if ($.inArray(uid, $.u.__uniqueids) == -1) {
                $.u.__uniqueids.push(uid);
                return uid;
            } else {
                return $.u.uniqid(idlength);
            }
        },
        /**
         * 赋值
         * var obj = {},
         * propName = "foo.bar.foobar";
         * $.u.assign(obj, propName, "Value");
         * 2014-06-26
         */
        assign: function(obj, prop, value) {
            if (typeof prop === "string")
                prop = prop.split(".");
            if (prop.length > 1) {
                var e = prop.shift();
                $.u.assign(obj[e] =
                    Object.prototype.toString.call(obj[e]) === "[object Object]" ? obj[e] : {},
                    prop,
                    value);
            } else {
                obj[prop[0]] = value;
            }
        },
        /**
         * 是否有此属性
         * 2014-07-1
         */
        hasProp: function(obj, prop) {
            if (typeof prop === "string") {
                var objn = obj;
                prop = prop.split(".");
                for (var i = 0; i < prop.length; i++) {
                    if (objn.hasOwnProperty) {
                        if (!objn.hasOwnProperty(prop[i]))
                            return false;
                    } else {
                        if (!(prop[i] in objn)) {
                            return false;
                        }
                    }
                    objn = objn[prop[i]];
                }
                return true;
            }
            return false;
        },
        htmlEncode: function(str) {
            var s = "";
            if (str.length == 0) return "";
            s = str.replace(/&/g, "&amp;");
            s = s.replace(/</g, "&lt;");
            s = s.replace(/>/g, "&gt;");
            s = s.replace(/\"/g, "&quot;");
            return s;
        },
        htmlDecode: function(str) {
            var s = "";
            if (str.length == 0) return "";
            s = str.replace(/&amp;/g, "&");
            s = s.replace(/&lt;/g, "<");
            s = s.replace(/&gt;/g, ">");
            s = s.replace(/&quot;/g, "\"");
            return s;
        },
        /**
         *初始化路由
         *记得路由必须放在$(function(){})里面
         *因为没有window.document.body
         */
        initroute: function() {
            // 增加hash, in 2014-10-05
            // 如果浏览器原生支持该事件,则不用
            if (!("onhashchange" in window.document.body)) {
                var location = window.location;
                $.u.__oldURL = location.href;
                $.u.__oldHash = location.hash;
                // 每隔100ms检测一下location.hash是否发生变化
                setInterval(function() {
                    var newURL = location.href,
                        newHash = location.hash;
                    // 如果hash发生了变化,且绑定了处理函数...
                    if (newHash != $.u.__oldHash && typeof window.onhashchange === "function") {
                        // execute the handler
                        window.onhashchange({
                            type: "hashchange",
                            oldURL: $.u.__oldURL,
                            newURL: newURL
                        });
                        $.u.__oldURL = newURL;
                        $.u.__oldHash = newHash;
                    }
                }, 100);
            }
            $(window).on("hashchange", function(e) {
                var fragment = window.location.hash;
                if (fragment.indexOf("#") == 0) {
                    fragment = fragment.substr(1);
                }
                if ($.u.__routeOptions.routes && $.u.__routeOptions.routes.length > 0) {
                    $.each($.u.__routeOptions.routes, function(idx, arouter) {
                        var expresult = arouter.reg.exec(fragment);
                        if (expresult) {
                            var rawparams = expresult.slice(1);
                            var params = [];
                            var l = rawparams.length;
                            $.each(rawparams, function(idx1, aparam) {
                                if (idx1 !== l - 1) {
                                    // 过滤掉最后一个null
                                    params.push(aparam ? decodeURIComponent(aparam) : null);
                                }
                            });
                            var Func = null;
                            if ($.type(arouter.func) === "string") {
                                Func = $.u.__routeOptions.methods[arouter.func];
                            } else if ($.isFunction(arouter.func)) {
                                Func = arouter.func;
                            }
                            if (Func) {
                                if ($.u.__routeOptions.modules.length > 0) {
                                    params = params.concat($.u.__routeOptions.modules);
                                }
                                Func.apply(window, params);
                            } else {
                                throw new Error(arouter.id + "没有对应的方法：" + arouter.func);
                            }
                            // 就近原则，跳出
                            return false;
                        }
                    });
                }
            });
        },
        // add by wayne in 2014-10-05 , add hash Router
        router: function(options) {
            options || (options = {});
            $.u.__routeOptions = {};
            $.u.__routeOptions.routes = [];
            $.u.__routeOptions.modules = options.modules || [];
            $.u.__routeOptions.methods = {};
            var optionalParam = /\((.*?)\)/g;
            var namedParam = /(\(\?)?:\w+/g;
            var splatParam = /\*\w+/g;
            var escapeRegExp = /[\-{}\[\]+?.,\\\^$|#\s]/g;
            for (var nm in options.routes) {
                var routeexp = nm.replace(escapeRegExp, '\\$&')
                    .replace(optionalParam, '(?:$1)?')
                    .replace(namedParam, function(match, optional) {
                        return optional ? match : '([^/?]+)';
                    })
                    .replace(splatParam, '([^?]*?)');
                $.u.__routeOptions.routes.push({
                    "id": nm,
                    "reg": new RegExp('^' + routeexp + '(?:\\?([\\s\\S]*))?$'),
                    "func": options.routes[nm]
                });
            };
            for (var nm in options) {
                if (nm !== "routes" || nm !== "modules") {
                    $.u.__routeOptions.methods[nm] = options[nm];
                }
            }
            $(window).trigger('hashchange');
        },
        routeto: function(hashurl) {
            hashurl = hashurl || "";
            if (hashurl.indexOf("#") !== 0) {
                hashurl = "#" + hashurl;
            }
            window.location.hash = hashurl;
        }
    });
})();