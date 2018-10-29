/*
* Create by wayne 
* 组件定义，组件有这些属性
*   moduleobject._id ; // 容器组件id
*   moduleobject._umid ; // 容器组件在父的名字
*   moduleobject.__targethtm // 在父容器里的htm标签内容
*   moduleobject.$ ; // 容器组件的jquery对象
*   moduleobject._parentmodule // 容器组件父对象
*   moduleobject._childrenmoduleids // 子对象id
*   moduleobject._options ; // 设置settings
*   moduleobject._configures ; // 设置配置（在init方法里设置）: 例子[{ title : "组1", list : [{key:"v1.v2", title:"属性1", def:"1234", type:"text"},{}]},{}]
*
*   module.clazzname ; // 标明当前类的String名
*   module.superclazz ;  // 标明当前类的父类,父类String名通过".superclass.name"获取
*   module.config.usehtm; // 是否有htm界面
*   module.config.usesuperhtm = false; // 使用父类htm
*   module.config.usei18n = false;      // 使用国际化,国际化文件为"类最后名_语言.js",比如"Secondtest_zh.js". 
*   module.i18n = {};                    // 国际化定义:$.extend(true ,test.another.Secondtest.i18n, { abc: "abc"});
*   module.widgetjs = [];                // 引用jq组件的js路径（相对于类js的jq-widget路径），当然，也可以选择直接在htm页面中script加载
*   module.widgetcss = [];               // 引用jq组件的css对象（cssobj.path相对于类js的css路径），当然，也可以选择直接在htm页面中link加载
*   module.htm;                          // 系统用，暂存获取的htm
*   module.htmcssurl = [];               // 系统用，暂存获取的style urls
*   module.htmcss;						 // 系统用，暂存获取的style标签
*
*   module.init                          // 初始化，settings和其他配置在这里传
*   module.beforerender                  // 读取htm后（usehtm设置为true），但未加载入parentselector
*   module.render                        // 加入parentselector
*   module.beforechildrenrender          // render之中，渲染children之前（用来做一些父组件的渲染，以及子组件的参数传递）
*   module.afterrender                   // 加入parentselector之后
*   module.destroy                       // 清除实例dom，不删除class对象
*   module.resize                        // htm的缩放
*   module.parent                        // 设置或获取父容器对象（看传递参数）
*   module.children                      // 获取子对象（不能设置）
*   
*   module.to$                           //selector + 组件方法
*组件相关方法
*   $.u.define         //定义module
*   $.u.load          //加载module
*****************************************************************************************************************************************************************************************************************
***********************************************************特别提醒注意：$.u.clazz.extend的那些基本方法，不能在impl或者override方法里实现，实现的话意味着直接覆盖module的这些方法*****************************
***********************************************************比如把destroy方法写在impl方法里，就无法使用this._super进行操作****************************************************************************************
*/
//@ sourceURL=umodule
(function () {
    var module = $.u.clazz.extend({
        /**
        *初始化传参 new 的时候
        *参数分别为：装载对象的对象(容器)
        */
        _init: function (moduleSelector) {
            this.$ = $();
            this._id = $.u.uniqid();
            this._umid = null;
            this._options = {};
            this._parentmodule = null;
            this._childrenmoduleids = [];
            this.__targethtm = "";
            if (moduleSelector instanceof $) {
                var Args = Array.prototype.slice.call(arguments, 1);
                this.init.apply(this, Args);
                this.target(moduleSelector);
            }
            else if (arguments.length > 0) {
                this.init.apply(this, arguments);
            }
            // 如果为空，表示没塞值，那么就要做configures到options的方法
            if (!this._options || $.isEmptyObject(this._options)) {
                this._options = $.u.configures2options(this.getclazz().moduleconfig);
            }
        },
        /**
        *加载htm，com.usky.xx，会有http://0.0.0.0/项目名/com/usky/xx.htm，或者用父亲的
        */
        _loadhtm: function () {
        	// 初始加载模板之前加载css
            var currentClazz = this.constructor;
            var scriptUrl = $.u._buildmodulepathprefix(currentClazz.clazzname) + '.js';
            $.each(currentClazz.widgetcss, function (idx, cssobj) {
                var abscssobj = $.extend(true, {}, cssobj);
                abscssobj.path = $.u._absurl(abscssobj.path, scriptUrl);
                $.u.loadcss(abscssobj);
            });
            // 一切只为了拿到htm
            var tempClazz = this.constructor;
            // 如果usesuperhtm为false，则找自己的页面，如果为true，则看递归往上找到父亲的页面。
            // 找到页面后，将页面的head全部导入，body构造为div, id为“类.id名”，然后里面所有的id都必须扩展为“类.id名.id”
            // JQuery获取这些id的时候为$("#类\\.id名\\.id");
            while (tempClazz.config.usesuperhtm) {
                tempClazz = tempClazz.superclazz;
            }            
            if (tempClazz.config.usehtm && tempClazz.htm == null) {
                if (tempClazz.clazzname != "module") { // 不能为根Class，根只有方法没有页面
                    var htmUrl = $.u._buildmodulepathprefix(tempClazz.clazzname) + '.htm';
                    var htmstring = $.u.loadhtm(htmUrl);
                    tempClazz.htmcss = "";
                    tempClazz.htmcssurl = [];
                    if (htmstring != null && htmstring != '') {
                        // 不能用 $(data), 会重新加载所有js导致内存溢出
                        htmstring.match(/<head[\s\S]*?>([\s\S]*)<\/head>[\s\S]*?<body[\s\S]*?>([\s\S]*)<\/body>/);
                        var headstr = RegExp.$1;
                        var bodystr = RegExp.$2;
                        // 忽略掉 "<script> code here </script>", these will cause memory leak                        
                        if (headstr && ($.trim(headstr) != "")) {                        	
                        	headstr = headstr.replace(/<!--[\w\W\r\n]*?-->/gmi, ''); // 去掉注释
                            $.each($.u.getjssrcfromhead(headstr), function (idx, src) {
                                var abssrc = $.u._absurl(src, htmUrl);
                                $.u.loadjs(abssrc);
                            });
                            $.each($.u.getcsssrcfromhead(headstr), function (idx, src) {
                            	tempClazz.htmcssurl.push(src);
                            });
                            $.each($.u.getcssrawfromhead(headstr), function (idx, src) {
                            	// 去掉回车换行
                            	src = src.replace(/[\f\n\r\t\v]/g, "");
                            	tempClazz.htmcss += src;
                            });
                        }
                        // 用了js模板这块就不能用了，所以img和a这类的必须要规范如果换行可能找不到--- 头加载完，这里要处理Body了，Body一个是将body里的内容全部放到div里，另一个是把国际化搞搞                        
                        //bodystr = bodystr.replace(/\r\n/g, '');
                        //// img和href的要特殊处理
                        //var rg = /(<img.*?src\s*=\s*["'])([^"']*)(["'])/gi;
                        //bodystr = this._bodyurlfill(bodystr, rg, htmUrl);
                        //rg = /(<a.*?href\s*=\s*["'])([^"']*)(["'])/gi;
                        //bodystr = this._bodyurlfill(bodystr, rg, htmUrl);
                        //rg = /(<object.*?codebase\s*=\s*["'])([^"']*)(["'])/gi;
                        //bodystr = this._bodyurlfill(bodystr, rg, htmUrl);
                        //currentClazz.htm = bodystr;
                        bodystr = $.trim(bodystr);
                        bodystr = bodystr.replace(/[\f\n\r\t\v]/g, "");
                        bodystr = bodystr.replace(/(>)( )+?(<)/g, "><");
                        tempClazz.htm = bodystr;
                    }
                }
            }
            if (tempClazz.config.usehtm) {
                //var bodystr = this._macrobodyfill(currentClazz.htm, /\{\@(.*?)\@\}/gi);// 模板格式为"{@内容@}"，内容定义: c.i18n.xxx本类的语言国际化，g.i18n.xxx全局的语言国际化，o.id本页面实例的id
            	var htmUrl = $.u._buildmodulepathprefix(tempClazz.clazzname) + '.htm';
            	if(tempClazz.htmcssurl && tempClazz.htmcssurl.length > 0){
	                $.each(tempClazz.htmcssurl, function (idx, src) {
	                    var cssobj = {};
	                    cssobj.path = $.u._absurl(src, htmUrl);
	                    $.u.loadcss(cssobj);
	                });
            	}
            	if(tempClazz.htmcss && tempClazz.htmcss !== ""){
                    $("head").append("<style  type=\"text/css\">" + tempClazz.htmcss + "<\/style>");
            	}
            	var bodystr = this._bodyurlreplace(tempClazz.htm, tempClazz.clazzname);
                bodystr = this._macrobodyfill(bodystr);
                eval(bodystr);
                bodystr = __p;
                this.beforerender(bodystr);
            } else {
                this.beforerender("");
            }
        },
        _bodyurlreplace: function (bodystr, clazzname) {
            // img和href的要特殊处理
            var htmUrl = $.u._buildmodulepathprefix(clazzname) + '.htm'
            var bodystrret = bodystr;
            var rg = /(<img.*?src\s*=\s*["'])([^"']*)(["'])/gi;
            bodystrret = this._bodyurlfill(bodystrret, rg, htmUrl);
            rg = /(<a.*?href\s*=\s*["'])([^"']*)(["'])/gi;
            bodystrret = this._bodyurlfill(bodystrret, rg, htmUrl);
            rg = /(<object.*?codebase\s*=\s*["'])([^"']*)(["'])/gi;
            bodystrret = this._bodyurlfill(bodystrret, rg, htmUrl);
            return bodystrret;
        },
        _bodyurlfill: function (str, reg, referenceurl) {
            return str.replace(reg, this.proxy(this._bodyurlfillmatcher, referenceurl));
        },
        _bodyurlfillmatcher: function (referenceurl, matchWholeStr, p1, p2, p3) {
            var p2url = $.trim(p2);
            if (p2url == "" || p2url.startwith("#") || p2url.startwith("data"))
                return matchWholeStr;
            else
                return p1 + $.u._absurl(p2url, referenceurl[0]) + p3;
        },
        _macrobodyfill: function (text) {
            var templateSettings = {
                // JavaScript可执行代码的界定符
                evaluate: /<%([\s\S]+?)%>/g,
                // 直接输出变量的界定符
                interpolate: /<%=([\s\S]+?)%>/g,
                // 需要将HTML输出为字符串(将特殊符号转换为字符串形式)的界定符
                escape: /<%-([\s\S]+?)%>/g
            };
            var noMatch = /.^/;
            // escapes对象记录了需要进行相互换转的特殊符号与字符串形式的对应关系, 在两者进行相互转换时作为索引使用
            // 首先根据字符串形式定义特殊字符
            var escapes = {
                '\\': '\\',
                "'": "'",
                'r': '\r',
                'n': '\n',
                't': '\t',
                'u2028': '\u2028',
                'u2029': '\u2029'
            };
            // 遍历所有特殊字符字符串, 并以特殊字符作为key记录字符串形式
            for (var p in escapes)
                escapes[escapes[p]] = p;
            // 定义模板中需要替换的特殊符号, 包含反斜杠, 单引号, 回车符, 换行符, 制表符, 行分隔符, 段落分隔符
            // 在将字符串中的特殊符号转换为字符串形式时使用
            var escaper = /\\|'|\r|\n|\t|\u2028|\u2029/g;
            // 在将字符串形式的特殊符号进行反转(替换)时使用
            var unescaper = /\\(\\|'|r|n|t|u2028|u2029)/g;
            // 反转字符串中的特殊符号
            // 在模板中涉及到需要执行的JavaScript源码, 需要进行特殊符号反转, 否则如果以HTML实体或字符串形式出现, 会抛出语法错误
            var unescape = function (code) {
                return code.replace(unescaper, function (match, escape) {
                    return escapes[escape];
                });
            };
            // Underscore模板解析方法, 用于将数据填充到一个模板字符串中
            // 模板解析流程:
            // 1. 将模板中的特殊符号转换为字符串
            // 2. 解析escape形式标签, 将内容解析为HTML实体
            // 3. 解析interpolate形式标签, 输出变量
            // 4. 解析evaluate形式标签, 创建可执行的JavaScript代码
            // 5. 生成一个处理函数, 该函数在得到数据后可直接填充到模板并返回填充后的字符串
            // 6. 根据参数返回填充后的字符串或处理函数的句柄
            // -------------------
            // 开始将模板解析为可执行源码
            var source = "__p+='" + text.replace(escaper, function (match) {
                // 将特殊符号转移为字符串形式
                return '\\' + escapes[match];
            }).replace(templateSettings.escape || noMatch, function (match, code) {
                // 解析escape形式标签 {@- @}, 将变量中包含的HTML通过_.escape函数转换为HTML实体
                return "'+\n$.u.escape(" + unescape(code) + ")+\n'";
            }).replace(templateSettings.interpolate || noMatch, function (match, code) {
                // 解析interpolate形式标签 {@= @}, 将模板内容作为一个变量与其它字符串连接起来, 则会作为一个变量输出
                return "'\n+(" + unescape(code) + ")+\n'";
            }).replace(templateSettings.evaluate || noMatch, function (match, code) {
                // 解析evaluate形式标签 {@ @}, evaluate标签中存储了需要执行的JavaScript代码, 这里结束当前的字符串拼接, 并在新的一行作为JavaScript语法执行, 并将后面的内容再次作为字符串的开始, 因此evaluate标签内的JavaScript代码就能被正常执行
                return "';\n" + unescape(code) + "\n;__p+='";
            }) + "';\n";
            source = "var __p='';" + source;
            return source;
        },
        _readableClazzEncode: function (decoded) {
            return decoded.replace(/\./g, '-');
        },
        _readableClazzDecode: function (encoded) {
            return encoded.replace(/\-/g, '.');
        },
        /** 
        * 类必须的其他初始化，参数是后面的参数
        */
        init: function () {

        },
        /**
        * 暴露出去的方法，用来渲染某个选择器
        */
        target: function (moduleSelector) {
            if (moduleSelector.isUm()) {
                // 先解决掉绑定在上面的
                moduleSelector = moduleSelector.um() && moduleSelector.um().destroy();
            }
            var checkresult = $.u._isValidModuleSelector(moduleSelector);
            if (checkresult != "") {
                throw new Error(checkresult);
            }
            this.__targethtm = moduleSelector.outerHTML();
            this._umid = moduleSelector.attr("umid");
            this.$ = moduleSelector;
            this._loadhtm();            
        },
        /**
        *用来覆盖，render之前调用，usehtm必须为true
        */
        beforerender: function (bodystr) {
            this.render(bodystr);
        },
        /**
        * 用来覆盖，usehtm必须为true，比如用jeasyui，_render内容要加上$.parser.parse
        */
        render: function (bodystr) {
            if (bodystr && bodystr != "") {
                var sel = $(bodystr).insertAfter(this.$);
                if (!sel.is("div")) {
                    throw new Error('开发时错误：render渲染的组件元素必须以div包括');
                }
                var sttemp = this.$.attr("style");
                if (!sttemp) {
                    sttemp = "";
                }
                else {
                    if (!sttemp.endwith(";")) {
                        sttemp += ";";
                    }
                }
                // class
                var clstemp = this.$.attr("class");
                if (!clstemp) {
                    clstemp = "";
                }
                else {
                    if (!clstemp.endwith(" ")) {
                        clstemp += " ";
                    }
                }
                this.$.remove(); // 移除原来的
                // 加style
                var sttempto = sel.attr("style")
                if (sttempto) {
                    sttemp += sttempto;
                }
                if (sttemp != "") {
                    sel.attr("style", sttemp);
                }
                // 加class
                var clstempto = sel.attr("class")
                if (clstempto) {
                    clstemp += clstempto;
                }
                if (clstemp != "") {
                    sel.attr("class", clstemp);
                }
                sel.addClass("__uskymoduleobject");
                sel.addClass(this._readableClazzEncode(this.getclazz().clazzname));
                sel.data("__uskymoduleobject", this);
                // 再通过qid加id，并且都加入到this里去
                sel.attr("id", this._id);
                sel.attr("umid", this._umid);
                $.each($("[qid]", sel), this.proxy(function (idx, aqidsel) {
                    var $aqidsel = $(aqidsel);
                    var umid = $aqidsel.attr("umid");
                    if (umid == null || umid == "") {
                        var qid = $aqidsel.attr("qid");
                        $aqidsel.attr("id", this._id + "-" + qid);
                    }
                }));
                sel.attr("id", this._id);
                this.$ = sel;
                // （这里是递归哟，只渲染有umodule的）先找到所有子组件（umodule参数不为空，为空的自己处理）-> 放到temp里 -> beforechildrenrender -> 再target渲染找到的子组件里的组件
                var childmoduletemp = [];
                $.each($("div[umodule]", this.$), this.proxy(function (idx, umsel) {
                    var moduleSelector = $(umsel);
                    var checkresult = $.u._isValidModuleSelector(moduleSelector);
                    if (checkresult != "") {
                        throw new Error(checkresult);
                    }
                    var umid = moduleSelector.attr("umid");
                    var umodule = moduleSelector.attr("umodule");
                    var moduleInstance = null, moduleClzNameOrInstance;
                    moduleClzNameOrInstance = umodule;
                    var clz = $.u.load(moduleClzNameOrInstance);
                    moduleInstance = new clz();
                    moduleInstance._umid = umid;
                    moduleInstance.init.apply(moduleInstance);
                    this[umid] = moduleInstance;
                    moduleInstance._parentmodule = this;
                    childmoduletemp.push({ "id": umid, "target": moduleSelector });
                    this._childrenmoduleids.push(umid);
                }));
                this.beforechildrenrender(); // ****渲染：子组件的渲染之前做好父组件的渲染，以及子组件的参数传递
                // 再渲染
                $.each(childmoduletemp, this.proxy(function (idx, atemp) {
                    var moduleSelector = atemp.target;
                    var moduleInstance = this[atemp.id];
                    moduleInstance.target(moduleSelector);
                }));
                childmoduletemp = null;
            }
            else {
                this.$.remove();
                this.$ = $();
            }
            this.afterrender();
        },
        /**
        *用来覆盖，usehtm必须为true，render中间渲染子组件的之前调用
        */
        beforechildrenrender: function () {

        },
        /**
        *用来覆盖，usehtm必须为true，render之前调用
        */
        afterrender: function () {

        },
        /**
        *获取组件的clazz，怕一些人不会用this.constructor
        */
        getclazz: function () {
            return this.constructor;
        },
        /**
        *用来覆盖，如果有htm的时候进行缩放
        */
        resize: function () { },
        /**
        * 用来覆盖，清除dom，还可以附加一些清理工作，比如jqueryui的dialog
        * 返回销毁后的selector
        */
        destroy: function () {
            var destroyedSelector = null;
            for (var key in this) {
                switch (key) {
                    case "$":
                        if (this.$.length > 0) {
                            if (this.__targethtm != "") {
                                destroyedSelector = $(this.__targethtm).insertAfter(this.$);
                                this.$.remove();
                                this.$ = $();
                                this.__targethtm = "";
                            }
                        }
                        break;
                    case "_id":
                        var genid = this[key];
                        $.u.__uniqueids = $.grep($.u.__uniqueids, function (value) {
                            return value != genid;
                        });
                        break;
                    case "_options":
                        break;
                    case "_parentmodule":
                        if (this._parentmodule) {
                            // 解除父绑定
                            this._parentmodule[this._umid] = null;
                            this._parentmodule = null;
                        }
                        break;
                    case "__targethtm":
                        break;
                    default:
                        if (this[key] instanceof $.u.module) {
                            this[key].destroy(); // 递归销毁
                        }
                        delete this[key];
                }
            }
            return destroyedSelector;
        },
        /**
        *用来覆盖，显示组件
        */
        show: function () { },
        /**
        *用来覆盖，隐藏组件
        */
        hide: function () { },
        /**
        *简化一下，怕小朋友们搞不定jq proxy的参数
        *func是函数，后面还可以带参数，记得参数的顺序是从func函数开始的顺序
        *比如onclick已有event参数，存在函数fun1，this.proxy(func1,newparam)，对应的func1目标有fun1x(newparam, event)顺序的参数
        */
        proxy: function (func) {
            if (arguments.length > 1) {
                var Args = [];
                Args = Array.prototype.slice.call(arguments, 1);
                return $.proxy(func, this, Args);
            }
            else
                return $.proxy(func, this);
        },
        /**
        *用来获取相对本js类路径文件的绝对路径
        */
        getabsurl: function (relativeurl) {
            return $.u.absurlbymoduleobj(relativeurl, this);
        },
        qid: function (qid) {
            return $("#" + this._id + "-" + qid);
        },
        parent: function (parentobj) {
            if (parentobj) {
                this._parentmodule = parentobj;
                parentobj[this._umid] = this;
                this._childrenmoduleids.push(this._umid);
            }
            else {
                return this._parentmodule;
            }
        },
        children: function () {
            var chdobj = [];
            $.each(this._childrenmoduleids, this.proxy(function (idx, achd) {
                chdobj.push(this[achd]);
            }));
            return chdobj;
        }
    });

    module.clazzname = 'module'; // 标明当前类的String名
    module.superclazz = null;  // 标明当前类的父类,父类String名通过".superclass.name"获取
    module.htm = null; // htm
    module.htmcssurl = [];               // 系统用，暂存获取的style urls
    module.htmcss = "";						 // 系统用，暂存获取的style标签    
    module.config = {};
    module.config.usehtm = false; // 使用加载htm    
    module.config.usesuperhtm = false; // 使用父类htm
    module.config.usei18n = false;      // 使用国际化,国际化文件为"类最后名_语言.js",比如"Secondtest_zh.js". 
    module.i18n = {};                       // 国际化定义:$.extend(true ,test.another.Secondtest.i18n, { abc: "abc"});
    module.widgetjs = [];
    module.widgetcss = [];

    $.u.module = module;
    window['module'] = $.u.module; //注册到window去

    ///////////////////////////////////////////////////与组件相关的方法////////////////////////////////////////////    
    $.extend(true, $.u, {
        /**
        * 定义类
        * superclz为null表示直接module
        * currentclz定义的类, superclz父类, currentclzmethods方法（当然也可以定义好后用impl继续添加方法）, currentclzconfigexts（扩展或覆盖类的config）
        */
        define: function (currentclz, superclz, currentclzmethods, currentclzconfigexts) {
            if (superclz == null || superclz == "")
                superclz = 'module';
            if (currentclz == 'module')
                throw new Error('开发时错误：module为基本组件，无法再定义');
            var i, currentclzsplit, superclzsplit, superco, currentco;
            // 先加载父类
            superco = window;
            superclzsplit = superclz.split(".");
            var sourcefind = true;
            for (i = 0; i < superclzsplit.length; i = i + 1) {
                superco = superco[superclzsplit[i]];
                if (superco == null) {
                    sourcefind = false;
                    break;
                }
            }
            if (!sourcefind) {
                // 父类没找到则加载并继续获取
                $.u.load(superclz);
                superco = window;
                for (i = 0; i < superclzsplit.length ; i = i + 1) {
                    superco = superco[superclzsplit[i]];
                }
            }
            // 构造子类
            currentclzsplit = currentclz.split(".");
            currentco = window;
            for (i = 0; i < currentclzsplit.length; i = i + 1) {
                if (i == currentclzsplit.length - 1) {
                    currentco[currentclzsplit[i]] = superco.extend(currentclzmethods);
                }
                else {
                    currentco[currentclzsplit[i]] = currentco[currentclzsplit[i]] || {};
                }
                currentco = currentco[currentclzsplit[i]];
            }
            currentco.clazzname = currentclz;
            currentco.superclazz = superco;
            currentco.config = currentco.config || {};
            $.extend(true, currentco.config, superco.config); // 深度合并
            if (currentclzconfigexts && typeof (currentclzconfigexts) == "object") {
                $.extend(true, currentco.config, currentclzconfigexts);
            }
            currentco.i18n = currentco.i18n || {};
            $.extend(true, currentco.i18n, superco.i18n);
            currentco.widgetjs = currentco.widgetjs || [];
            currentco.widgetcss = currentco.widgetcss || [];
        },
        /*
        *   加载类、类的国际化、类的css和js
        *   moduleClzName一个参数是组件的字符串类名（也可以是数组字符串类名，多个类加载）
        *
        */
        load: function (moduleClzName) {
            var single = true;
            var moduleNames = [];
            if ($.isArray(moduleClzName)) {
                moduleNames = moduleClzName;
                single = false;
            }
            else {
                moduleNames.push(moduleClzName);
            }
            var moduleClazzes = [];
            $.each(moduleNames, function (idx, amoduleClzName) {
                // 如果htm没有
                var scriptUrl = $.u._buildmodulepathprefix(amoduleClzName) + '.js';
                var domhas = false;
                if (!$.u.hasProp(window, amoduleClzName)) {
                	// 无的话加载，然后继续下面的加载
                    $.u.loadjs(scriptUrl);
                }
                else{
                	// 有的话表示加载过了，直接跳过下面加载
                	domhas = true;
                }
                /**
                *加载语言，com.usky.xx，会有http://0.0.0.0/项目名/com/usky/xx-i18n-zh.js
                */                
                var currentclzsplit = amoduleClzName.split(".");
                var currentco = window;
                for (var i = 0; i < currentclzsplit.length ; i++) {
                    currentco = currentco[currentclzsplit[i]];
                }
                if(!domhas){
                	// 有dom就不加载widgetjs
	                $.each(currentco.widgetjs, function (idx, jspath) {
	                    var absjspath = $.u._absurl(jspath, scriptUrl);
	                    $.u.loadjs(absjspath);
	                });
                }
                // 但是国际化还是要再跑一次，没加载的话，要重新刷一遍，因为语言变了
                if (currentco.config.usei18n) {
                	// 如果已经是压在一起了，表示有个"__load_i18n_语言"的方法存在，即发布模式...
                    var i18nfuc = eval(amoduleClzName + '.__load_i18n_' + $.u.config.region);
                    if($.isFunction(i18nfuc)){
                    	i18nfuc();
                    }
                    else{
                    	// 没有，表示开发模式加载
                    	var i18nUrl = $.u._buildmodulepathprefix(amoduleClzName) + '-i18n-' + $.u.config.region + ".js";
                    	$.u.loadjs(i18nUrl);
                    }
                }
                // 如果用了htm，样式得在new新对象并且加载在具体div，渲染_loadhtm的时候;没有用htm，则直接渲染
                if (!currentco.config.usehtm && !currentco.config.usesuperhtm) {
	                $.each(currentco.widgetcss, function (idx, cssobj) {
	                    var abscssobj = $.extend(true, {}, cssobj);
	                    abscssobj.path = $.u._absurl(abscssobj.path, scriptUrl);
	                    $.u.loadcss(abscssobj);
	                });
                }
                moduleClazzes.push(currentco);                
            });
            if (single) {
                return moduleClazzes[0];
            }
            else {
                return moduleClazzes;
            }
        },
        /**
        *   校验选择器是不是组件选择器是不是有效，返回""表示有效
        */
        _isValidModuleSelector: function (moduleSelector) {
            if (moduleSelector == null || !(moduleSelector instanceof $) || moduleSelector.length == 0) {
                return '开发时错误：页面元素不存在';
            }
            if (moduleSelector.length > 1) {
                return '开发时错误：组件只能是唯一的页面元素';
            }
            if (!moduleSelector.is("div")) {
                return '开发时错误：组件的页面元素必须使用div定义';
            }
            if (moduleSelector.children().length > 0) {
                return '开发时错误：组件的页面元素不能包含任何内容';
            }
            var umid = moduleSelector.attr("umid");
            if (umid == null || umid == "") {
                return '开发时错误：组件的页面元素必须有umid属性';
            }
            return "";

        },
        /*
        *组件的id
        *用-分割，比如"com.usky.xx"变成"com-usky-xx"
        */
        _buildmoduleid: function (moduleClzName, id) {
            if (moduleClzName == null || moduleClzName == '')
                throw new Error('开发时错误：无法加载空对象');
            var clzPaths = moduleClzName.replace(/\./g, '-');
            return clzPaths + '-' + id + '-';
        },
        /*
        *组件的pathprefix
        *用/分割，比如"com.usky.xx"变成"http://0.0.0.0/项目名/com/usky/xx"
        */
        _buildmodulepathprefix: function (moduleClzName) {
            if (moduleClzName == null || moduleClzName == '')
                throw new Error('开发时错误：无法加载空对象');
            var clzPaths = moduleClzName.replace(/\./g, '/');
            //return $.u._global.domain + '/' + clzPaths;
            return $.u._global.domain + clzPaths;
        },
        /*
        *将configure转换成option，默认值
        *参数：[{ title : "组1", list : [{key:"v1.v2", title:"属性1", def:"1234", type:"text"},{}]},{}]
        */
        configures2options: function (configures) {
            var newoptions = {};
            if (configures && $.isArray(configures)) {
                $.each(configures, function (idx, alist) {
                    if (alist.list && $.isArray(alist.list)) {
                        $.each(alist.list, function (idx1, aitem) {
                            $.u.assign(newoptions, aitem.key, aitem.def);
                        })
                    }
                });
            }
            return newoptions;
        }
    });

    /**
    * moduleSelector选择器
    * moduleClzNameOrInstance某个类实例或类名，如果为null，则必须在moduleSelector里面定义
    * 后面的arguments，都会传递给类的init方法
    * 返回的是组件对象（因为不一定有选择器）
    *
    * 两种情况例子：
    *   必须要有umid，um可以没有，不一定是div
    *   1、"<div umid='me' umodule='com.usky.xx'/>"
    *   2、"<div umid='me'/>"
    *   
    */
    $.um = function (moduleSelector) {
        var checkresult = $.u._isValidModuleSelector(moduleSelector);
        if (checkresult != "") {
            throw new Error(checkresult);
        }
        var umid = moduleSelector.attr("umid");
        var umodule = moduleSelector.attr("umodule");
        var moduleInstance = null, moduleClzNameOrInstance;
        if (umodule != null && umodule != "") {
            moduleClzNameOrInstance = umodule;
        } else {
            throw new Error('开发时错误：无法确定是哪种组件');
        }
        var clz = $.u.load(moduleClzNameOrInstance);
        moduleInstance = new clz();
        var Args = Array.prototype.slice.call(arguments, 1);
        moduleInstance._umid = umid;
        moduleInstance.init.apply(moduleInstance, Args);
        var parentmodule = moduleSelector.um();
        if (parentmodule) {
            parentmodule[umid] = moduleInstance;
            moduleInstance._parentmodule = parentmodule;
        }
        moduleInstance.target(moduleSelector);//直接渲染，不传参了
        return moduleInstance;
    };

    /**
    *  扩展jquery选择器的方法
    */
    $.fn.extend({
        /**
        *  能够取得组件   
        */
        um: function () {
            var moduleget = $(this).closest("div.__uskymoduleobject");
            if (moduleget.length == 1)
                return moduleget.data("__uskymoduleobject");
            else
                return null;
        },
        isUm: function () {
            return $(this).hasClass("__uskymoduleobject");
        },
        /**
        *  outerHtml方法
        */
        outerHTML: function (s) {
            return s
                ? this.before(s).remove()
                : $("<p>").append(this.eq(0).clone()).html();
        },
        /**
        *  getFullPath方法，参数，从某个Qid开始
        */
        getFullPath: function (stopAtQid) {
            stopAtQid = stopAtQid || false;
            function traverseUp(el) {
                var result = el.tagName.toLowerCase() + ':' + $(el).index() + '',
                    pare = $(el).parent()[0];
                if (pare.tagName !== undefined && (!stopAtQid || $(pare).attr("qid") !== stopAtQid)) {
                    result = [traverseUp(pare), result].join(';');
                }
                return result;
            };
            return this.length > 0 ? traverseUp(this[0]) : '';
        },
        mutton: function (s) {
            return s+" mutton is  muootn";
        }
    });
})();

