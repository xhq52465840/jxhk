var undefined, _ = window._ = function () {
        return +new Date()
    },
    Namespace = window.Namespace = function (key) {
        var a = key.split("."),
            w = window;
        return _.get(w, a) || _.set(w, a, {})
    },
    Class = window.Class = function (key, pkey, obj) {
        var _Static, _parent = [],
            self = Class,
            w = window,
            env = self._fun,
            reg = self._reg,
            parent0, _this, i, t, _t;
        obj = obj || {};
        if (t = _.get(w, key.split("."))) {
            return t
        }
        pkey = (!pkey ? [] : typeof pkey == "string" ? [pkey] : pkey);
        for (i = 0; t = pkey[i]; i++) {
            if (!(_parent[i] = (_.get(w, t.split(".")) || (xui && xui.SC && xui.SC(t))))) {
                throw new Error("errNoParent--" + t)
            }
        }
        if (obj.Dependency) {
            if (typeof obj.Dependency == "string") {
                obj.Dependency = [obj.Dependency]
            }
            for (i = 0; t = obj.Dependency[i]; i++) {
                if (!(_.get(w, t.split(".")) || (xui && xui.SC && xui.SC(t)))) {
                    throw new Error("errNoDependency--" + t)
                }
            }
        }
        parent0 = _parent[0];
        _Static = obj.Static || {};
        t = {};
        for (i in _Static) {
            if (reg[i]) {
                t[i] = 1
            }
        }
        for (i in t) {
            delete _Static[i]
        }
        _Static.Before = obj.Before || (parent0 && parent0.Before);
        _Static.After = obj.After || (parent0 && parent0.After);
        _Static.$End = obj.$End || (parent0 && parent0.$End);
        _Static.__gc = obj.__gc || _Static.__gc || (parent0 && parent0.__gc) ||
        function () {
            Class.__gc(this.$key)
        };
        var cf = function () {
                if (typeof this.initialize == "function") {
                    this.initialize()
                }
            };
        if (typeof obj.Constructor == "function") {
            _this = env(obj.Constructor, "Constructor", key, parent0 || cf, "constructor");
            _this.Constructor = String(obj.Constructor)
        } else {
            if (parent0) {
                var f = cf,
                    str = parent0.Constructor;
                if (str) {
                    f = new Function(str.slice(str.indexOf("(") + 1, str.indexOf(")")).split(","), str.slice(str.indexOf("{") + 1, str.lastIndexOf("}")))
                }
                _this = env(f, "Constructor", key, parent0.upper, "constructor");
                _this.Constructor = str
            } else {
                _this = cf
            }
        }
        _t = _.fun();
        for (i = _parent.length - 1; t = _parent[i--];) {
            _.merge(_t, t);
            _.merge(_t.prototype, t.prototype)
        }
        _this.KEY = _this.$key = _this.prototype.KEY = _this.prototype.$key = key;
        self._wrap(_this, _Static, 0, _t, "static");
        if (t = obj.Instance) {
            self._wrap(_this.prototype, t, 1, _t.prototype, "instance")
        }
        self._inherit(_this, _t);
        self._inherit(_this.prototype, _t.prototype);
        _t = null;
        if (_.tryF(_this.Before, arguments, _this) === false) {
            return false
        }
        for (i = 0; t = _parent[i]; i++) {
            t = (t.$children || (t.$children = []));
            for (var j = 0, k = t.length, b; j < k; j++) {
                if (t[k] == key) {
                    b = true;
                    break
                }
            }
            if (!b) {
                t[t.length] = key
            }
        }
        _this.$xui$ = 1;
        _this.$children = [];
        _this.$parent = _parent;
        _this.prototype.constructor = _this;
        _this.prototype.$xui$ = 1;
        _this[key] = _this.prototype[key] = true;
        _.set(w, key.split("."), _this);
        _.tryF(_this.After, [], _this);
        _.tryF(obj.Initialize, [], _this);
        _.tryF(_this.$End, [], _this);
        _.breakO([obj.Static, obj.Instance, obj], 2);
        return _this
    },
    linb = window.linb = xui = window.xui = function (nodes, flag) {
        return xui.Dom.pack(nodes, flag)
    };
_.merge = function (target, source, type) {
    var i, f;
    if (typeof type == "function") {
        f = type;
        type = "fun"
    }
    switch (type) {
    case "fun":
        for (i in source) {
            if (true === f(source[i], i)) {
                target[i] = source[i]
            }
        }
        break;
    case "all":
        for (i in source) {
            target[i] = source[i]
        }
        break;
    case "with":
        for (i in source) {
            if (i in target) {
                target[i] = source[i]
            }
        }
        break;
    default:
        for (i in source) {
            if (!(i in target)) {
                target[i] = source[i]
            }
        }
    }
    return target
};
_.merge(_, {
    fun: function () {
        return function () {}
    },
    exec: function (script) {
        var me = this,
            d = document,
            h = d.getElementsByTagName("head")[0] || d.documentElement,
            s = d.createElement("script");
        s.type = "text/javascript";
        if (xui.browser.ie) {
            s.text = script
        } else {
            s.appendChild(d.createTextNode(script))
        }
        h.insertBefore(s, h.firstChild);
        s.disalbed = true;
        s.disabled = false;
        h.removeChild(s)
    },
    get: function (hash, path) {
        if (!path) {
            return hash
        }
        if (!_.isSet(hash)) {
            return undefined
        } else {
            if (typeof path == "string") {
                return hash[path]
            } else {
                for (var i = 0, l = path.length; i < l;) {
                    if (!hash || (hash = hash[path[i++]]) === undefined) {
                        return
                    }
                }
                return hash
            }
        }
    },
    set: function (hash, path, value) {
        if (typeof path != "string") {
            var v, i = 0,
                m, last = path.length - 1;
            for (; i < last;) {
                v = path[i++];
                if (hash[v] && ((m = typeof hash[v]) == "object" || m == "function")) {
                    hash = hash[v]
                } else {
                    hash = hash[v] = {}
                }
            }
            path = path[last]
        }
        if (value === undefined) {
            if (hash.hasOwnProperty && hash.hasOwnProperty(path)) {
                delete hash[path]
            } else {
                hash[path] = undefined
            }
        } else {
            return hash[path] = value
        }
    },
    tryF: function (fun, args, scope, df) {
        return (fun && typeof fun == "function") ? fun.apply(scope || {}, args || []) : df
    },
    asyRun: function (fun, defer, args, scope) {
        return setTimeout(typeof fun == "string" ? fun : function () {
            fun.apply(scope, args || []);
            fun = args = null
        }, defer || 0)
    },
    asyHTML: function (content, callback, defer, size) {
        var div = document.createElement("div"),
            fragment = document.createDocumentFragment();
        div.innerHTML = content;
        (function () {
            var i = size || 10;
            while (--i && div.firstChild) {
                fragment.appendChild(div.firstChild)
            }
            if (div.firstChild) {
                setTimeout(arguments.callee, defer || 0)
            } else {
                callback(fragment)
            }
        })()
    },
    isEmpty: function (hash) {
        for (var i in hash) {
            return false
        }
        return true
    },
    resetRun: function (key, fun, defer, args, scope) {
        var me = arguments.callee,
            k = key,
            cache = me.$cache || ((me.exists = function (k) {
                return this.$cache[k]
            }) && (me.$cache = {}));
        if (cache[k]) {
            clearTimeout(cache[k])
        }
        if (typeof fun == "function") {
            cache[k] = setTimeout(function () {
                delete cache[k];
                fun.apply(scope || null, args || [])
            }, defer || 0)
        } else {
            delete cache[k]
        }
    },
    observableRun: function (tasks, onEnd, threadid) {
        xui.Thread.observableRun(tasks, onEnd, threadid)
    },
    breakO: function (target, depth) {
        var n = depth || 1,
            l = 1 + (arguments[2] || 0),
            self = arguments.callee,
            _t = "___gc_",
            i;
        if (target && (typeof target == "object" || typeof target == "function") && target !== window && target !== document && target.nodeType !== 1) {
            if (target.hasOwnProperty(_t)) {
                return
            } else {
                try {
                    target[_t] = null
                } catch (e) {
                    return
                }
            }
            for (i in target) {
                if (target.hasOwnProperty(i) && target[i]) {
                    if (typeof target[i] == "object" || typeof target[i] == "function") {
                        if (l < n) {
                            self(target[i], n, l)
                        }
                    }
                    try {
                        target[i] = null
                    } catch (e) {}
                }
            }
            if (target.length) {
                target.length = 0
            }
            delete target[_t]
        }
    },
    each: function (hash, fun, scope) {
        scope = scope || hash;
        for (var i in hash) {
            if (false === fun.call(scope, hash[i], i, hash)) {
                break
            }
        }
        return hash
    },
    toFixedNumber: function (number, digits) {
        if (!_.isSet(digits)) {
            digits = 2
        }
        var m = Math.abs(number),
            s = "" + Math.round(m * Math.pow(10, digits)),
            v, t, start, end;
        if (/\D/.test(s)) {
            v = "" + m
        } else {
            while (s.length < 1 + digits) {
                s = "0" + s
            }
            start = s.substring(0, t = (s.length - digits));
            end = s.substring(t);
            if (end) {
                end = "." + end
            }
            v = start + end
        }
        return parseFloat((number < 0 ? "-" : "") + v)
    },
    toNumeric: function (value, precision, groupingSeparator, decimalSeparator) {
        if (!_.isNumb(value)) {
            value = parseFloat((value + "").replace(/\s*(e\+|[^0-9])/g, function (a, b, c) {
                return b == "e+" || b == "E+" || (c == 0 && b == "-") ? b : b == decimalSeparator ? "." : ""
            })) || 0
        }
        if (_.isSet(precision) && precision >= 0) {
            value = _.toFixedNumber(value, precision)
        }
        return value
    },
    formatNumeric: function (value, precision, groupingSeparator, decimalSeparator, forceFillZero) {
        if (_.isSet(precision)) {
            precision = parseInt(precision, 10)
        }
        precision = (precision || precision === 0) ? precision : 0;
        groupingSeparator = _.isSet(groupingSeparator) ? groupingSeparator : ",";
        decimalSeparator = decimalSeparator || ".";
        value = "" + parseFloat(value);
        if (value.indexOf("e") == -1) {
            value = _.toFixedNumber(value, precision) + "";
            value = value.split(".");
            if (forceFillZero !== false) {
                if ((value[1] ? value[1].length : 0) < precision) {
                    value[1] = (value[1] || "") + _.str.repeat("0", precision - (value[1] ? value[1].length : 0))
                }
            }
            value[0] = value[0].split("").reverse().join("").replace(/(\d{3})(?=\d)/g, "$1" + groupingSeparator).split("").reverse().join("");
            return value.join(decimalSeparator)
        } else {
            return value
        }
    },
    copy: function (hash, filter) {
        return _.clone(hash, filter, 1)
    },
    clone: function (hash, filter, deep) {
        var layer = arguments[3] || 0;
        if (hash && typeof hash == "object") {
            var c = hash.constructor,
                a = c == Array;
            if (a || c == Object) {
                var me = arguments.callee,
                    h = a ? [] : {},
                    v, i = 0,
                    l;
                if (!deep) {
                    if (deep <= 0) {
                        return hash
                    } else {
                        deep = 100
                    }
                }
                if (a) {
                    l = hash.length;
                    for (; i < l; i++) {
                        if (typeof filter == "function" && false === filter.call(hash, hash[i], i, layer + 1)) {
                            continue
                        }
                        h[h.length] = ((v = hash[i]) && deep && typeof v == "object") ? me(v, filter, deep - 1, layer + 1) : v
                    }
                } else {
                    for (i in hash) {
                        if (filter === true ? i.charAt(0) == "_" : typeof filter == "function" ? false === filter.call(hash, hash[i], i, layer + 1) : 0) {
                            continue
                        }
                        h[i] = ((v = hash[i]) && deep && typeof v == "object") ? me(v, filter, deep - 1, layer + 1) : v
                    }
                }
                return h
            } else {
                return hash
            }
        } else {
            return hash
        }
    },
    filter: function (obj, filter, force) {
        if (!force && obj && _.isArr(obj)) {
            var i, l, v, a = [],
                o;
            for (i = 0, l = obj.length; i < l; i++) {
                a[a.length] = obj[i]
            }
            obj.length = 0;
            for (i = 0, l = a.length; i < l; i++) {
                if (typeof filter == "function" ? false !== filter.call(a, a[i], i) : 1) {
                    obj[obj.length] = a[i]
                }
            }
        } else {
            var i, bak = {};
            for (i in obj) {
                if (filter === true ? i.charAt(0) == "_" : typeof filter == "function" ? false === filter.call(obj, obj[i], i) : 0) {
                    bak[i] = 1
                }
            }
            for (i in bak) {
                delete obj[i]
            }
        }
        return obj
    },
    toArr: function (value, flag) {
        if (!value) {
            return []
        }
        var arr = [];
        if (typeof flag == "boolean") {
            for (var i in value) {
                arr[arr.length] = flag ? i : value[i]
            }
        } else {
            if (typeof value == "string") {
                arr = value.split(flag || ",")
            } else {
                for (var i = 0, l = value.length; i < l; ++i) {
                    arr[i] = value[i]
                }
            }
        }
        return arr
    },
    toUTF8: function (str) {
        return str.replace(/[^\x00-\xff]/g, function (a, b) {
            return "\\u" + ((b = a.charCodeAt()) < 16 ? "000" : b < 256 ? "00" : b < 4096 ? "0" : "") + b.toString(16)
        })
    },
    fromUTF8: function (str) {
        return str.replace(/\\u([0-9a-f]{3})([0-9a-f])/g, function (a, b, c) {
            return String.fromCharCode((parseInt(b, 16) * 16 + parseInt(c, 16)))
        })
    },
    urlEncode: function (hash) {
        var a = [],
            i, o;
        for (i in hash) {
            if (_.isDefined(o = hash[i])) {
                a.push(encodeURIComponent(i) + "=" + encodeURIComponent(typeof o == "string" ? o : _.serialize(o)))
            }
        }
        return a.join("&")
    },
    urlDecode: function (str, key) {
        if (!str) {
            return key ? "" : {}
        }
        var arr, hash = {},
            a = str.split("&"),
            o;
        for (var i = 0, l = a.length; i < l; i++) {
            o = a[i];
            arr = o.split("=");
            try {
                hash[decodeURIComponent(arr[0])] = decodeURIComponent(arr[1])
            } catch (e) {
                hash[arr[0]] = arr[1]
            }
        }
        return key ? hash[key] : hash
    },
    preLoadImage: function (src, onSuccess, onFail) {
        if (_.isArr(src)) {
            for (var i = 0, l = arr.length; i < l; i++) {
                _.preLoadImage(src[i], onSuccess, onFail)
            }
            return l
        }
        var img = document.createElement("img");
        img.style.cssText = "position:absolute;left:-999px;top:-999px";
        img.width = img.height = 2;
        img.onload = function () {
            if (typeof onSuccess == "function") {
                onSuccess.call(this)
            }
            this.onload = this.onerror = null;
            document.body.removeChild(this)
        };
        img.onerror = function () {
            if (typeof onFail == "function") {
                onFail.call(this)
            }
            this.onload = this.onerror = null;
            document.body.removeChild(this)
        };
        document.body.appendChild(img);
        img.src = src;
        return 1
    },
    isDefined: function (target) {
        return target !== undefined
    },
    isNull: function (target) {
        return target === null
    },
    isSet: function (target) {
        return target !== undefined && target !== null
    },
    isObj: function (target) {
        return !!target && (typeof target == "object" || typeof target == "function")
    },
    isBool: function (target) {
        return typeof target == "boolean"
    },
    isNumb: function (target) {
        return typeof target == "number" && isFinite(target)
    },
    isFinite: function (target) {
        return (target || target === 0) && isFinite(target)
    },
    isDate: function (target) {
        return Object.prototype.toString.call(target) === "[object Date]" && isFinite(+target)
    },
    isFun: function (target) {
        return Object.prototype.toString.call(target) === "[object Function]"
    },
    isArr: function (target) {
        return Object.prototype.toString.call(target) === "[object Array]"
    },
    _ht: /^\s*function\s+Object\(\s*\)/,
    isHash: function (target) {
        return !!target && Object.prototype.toString.call(target) == "[object Object]" && target.constructor && _._ht.test(target.constructor.toString())
    },
    isReg: function (target) {
        return Object.prototype.toString.call(target) === "[object RegExp]"
    },
    isStr: function (target) {
        return typeof target == "string"
    },
    isArguments: function (target) {
        return !!(target && target.callee && target.callee.arguments === target)
    },
    str: {
        startWith: function (str, sStr) {
            return str.indexOf(sStr) === 0
        },
        endWith: function (str, eStr) {
            var l = str.length - eStr.length;
            return l >= 0 && str.lastIndexOf(eStr) === l
        },
        repeat: function (str, times) {
            return new Array(times + 1).join(str)
        },
        initial: function (str) {
            return str.charAt(0).toUpperCase() + str.substring(1)
        },
        trim: function (str) {
            return str ? str.replace(/^(\s|\uFEFF|\xA0)+|(\s|\uFEFF|\xA0)+$/g, "") : str
        },
        ltrim: function (str) {
            return str ? str.replace(/^(\s|\uFEFF|\xA0)+/, "") : str
        },
        rtrim: function (str) {
            return str ? str.replace(/(\s|\uFEFF|\xA0)+$/, "") : str
        },
        toDom: function (str) {
            var p = xui.$getGhostDiv(),
                r = [];
            p.innerHTML = str;
            for (var i = 0, t = p.childNodes, l = t.length; i < l; i++) {
                r[r.length] = t[i]
            }
            p = null;
            return xui(r)
        }
    },
    arr: {
        subIndexOf: function (arr, key, value) {
            if (value === undefined) {
                return -1
            }
            for (var i = 0, l = arr.length; i < l; i++) {
                if (arr[i] && arr[i][key] === value) {
                    return i
                }
            }
            return -1
        },
        removeFrom: function (arr, index, length) {
            arr.splice(index, length || 1);
            return arr
        },
        removeValue: function (arr, value) {
            for (var l = arr.length, i = l - 1; i >= 0; i--) {
                if (arr[i] === value) {
                    arr.splice(i, 1)
                }
            }
            return arr
        },
        insertAny: function (arr, target, index, flag) {
            var l = arr.length;
            flag = (!_.isArr(target)) || flag;
            if (index === 0) {
                if (flag) {
                    arr.unshift(target)
                } else {
                    arr.unshift.apply(arr, target)
                }
            } else {
                var a;
                if (!index || index < 0 || index > l) {
                    index = l
                }
                if (index != l) {
                    a = arr.splice(index, l - index)
                }
                if (flag) {
                    arr[arr.length] = target
                } else {
                    arr.push.apply(arr, target)
                }
                if (a) {
                    arr.push.apply(arr, a)
                }
            }
            return index
        },
        indexOf: function (arr, value) {
            for (var i = 0, l = arr.length; i < l; i++) {
                if (arr[i] === value) {
                    return i
                }
            }
            return -1
        },
        each: function (arr, fun, scope, desc) {
            var i, l, a = arr;
            if (!a) {
                return a
            }
            if (!_.isArr(a)) {
                if ((a = a._nodes) || !_.isArr(a)) {
                    throw new Error("errNotArray")
                }
                if (desc === undefined) {
                    desc = 1
                }
            }
            l = a.length;
            scope = scope || arr;
            if (!desc) {
                for (i = 0; i < l; i++) {
                    if (fun.call(scope, a[i], i, a) === false) {
                        break
                    }
                }
            } else {
                for (i = l - 1; i >= 0; i--) {
                    if (fun.call(scope, a[i], i, a) === false) {
                        break
                    }
                }
            }
            return arr
        },
        removeDuplicate: function (arr, subKey) {
            var l = arr.length,
                a = arr.concat();
            arr.length = 0;
            for (var i = l - 1; i >= 0; i--) {
                if (subKey ? this.subIndexOf(a, subKey, a[i][subKey]) === i : this.indexOf(a, a[i]) === i) {
                    arr.push(a[i])
                }
            }
            return arr.reverse()
        }
    }
});
_.merge(_.fun, {
    body: function (fun) {
        with(String(fun)) {
            return slice(indexOf("{") + 1, lastIndexOf("}"))
        }
    },
    args: function (fun) {
        with(String(fun)) {
            return slice(indexOf("(") + 1, indexOf(")")).split(",")
        }
    },
    clone: function (fun) {
        return new Function(_.fun.args(fun), _.fun.body(fun))
    }
});
_.merge(Class, {
    _reg: {
        $key: 1,
        $parent: 1,
        $children: 1,
        KEY: 1,
        Static: 1,
        Instance: 1,
        Constructor: 1,
        Initialize: 1
    },
    _reg2: {
        nodeType: 1,
        constructor: 1,
        prototype: 1,
        toString: 1,
        valueOf: 1,
        hasOwnProperty: 1,
        isPrototypeOf: 1,
        propertyIsEnumerable: 1,
        toLocaleString: 1
    },
    _fun: function (fun, name, original, upper, type) {
        fun.$name$ = name;
        fun.$original$ = original;
        if (type) {
            fun.$type$ = type
        }
        if (upper) {
            fun.upper = upper
        }
        return fun
    },
    _other: ["toString", "valueOf"],
    _o: {},
    _inherit: function (target, src, instance) {
        var i, o, r = this._reg;
        for (i in src) {
            if (i in target || (!instance && r[i]) || i.charAt(0) == "$") {
                continue
            }
            o = src[i];
            if (o && o.$xui$) {
                continue
            }
            target[i] = o
        }
    },
    _wrap: function (target, src, instance, parent, prtt) {
        var self = this,
            i, j, o, k = target.KEY,
            r = self._reg,
            r2 = self._reg2,
            f = self._fun,
            oo = self._other;
        for (i in src) {
            if (r2[i] || (!instance && r[i])) {
                continue
            }
            o = src[i];
            target[i] = (typeof o != "function") ? o : f(o, i, k, typeof parent[i] == "function" && parent[i], prtt)
        }
        for (j = 0; i = oo[j++];) {
            o = src[i];
            if (o && (o == self._o[i])) {
                continue
            }
            target[i] = (typeof o != "function") ? o : f(o, i, k, typeof parent[i] == "function" && parent[i], prtt)
        }
    },
    __gc: function (key) {
        if (typeof key == "object") {
            key = key.KEY || ""
        }
        var t = _.get(window, key.split(".")),
            s, i, j;
        if (t) {
            if (s = _.get(window, ["xui", "$cache", "SC"])) {
                delete s[key]
            }
            if (t.$parent) {
                t.$parent.length = 0
            }
            if (s = t.$children) {
                for (var i = 0, o; o = s[i]; i++) {
                    if (o = _.get(window, o.split("."))) {
                        o.__gc()
                    }
                }
                s.length = 0
            }
            for (i in t) {
                if (i != "upper" && typeof t[i] == "function") {
                    for (j in t[i]) {
                        if (t[i].hasOwnProperty(j)) {
                            delete t[i][j]
                        }
                    }
                }
            }
            _.breakO(t);
            t = t.prototype;
            for (i in t) {
                if (i != "upper" && typeof t[i] == "function") {
                    for (j in t[i]) {
                        if (t[i].hasOwnProperty(j)) {
                            delete t[i][j]
                        }
                    }
                }
            }
            _.breakO(t);
            _.set(window, key.split("."))
        }
    },
    destroy: function (key) {
        Class.__gc(key)
    }
});
_.merge(xui, {
    $DEFAULTHREF: "javascript:;",
    $IEUNSELECTABLE: function () {
        return xui.browser.ie ? ' onselectstart="return false;" ' : ""
    },
    SERIALIZEMAXLAYER: 99,
    SERIALIZEMAXSIZE: 9999,
    $localeKey: "en",
    $localeDomId: "xlid",
    $dateFormat: "",
    Locale: {},
    $cache: {
        thread: {},
        SC: {},
        hookKey: {},
        hookKeyUp: {},
        snipScript: {},
        subscribes: {},
        ghostDiv: [],
        domPurgeData: {},
        profileMap: {},
        reclaimId: {},
        template: {},
        UIKeyMapEvents: {},
        droppable: {}
    },
    subscribe: function (topic, subscriber, receiver, asy) {
        if (topic === null || topic === undefined || subscriber === null || subscriber === undefined || typeof receiver != "function") {
            return
        }
        var c = xui.$cache.subscribes,
            i;
        c[topic] = c[topic] || [];
        i = _.arr.subIndexOf(c[topic], "id", subscriber);
        if (i != -1) {
            _.arr.removeFrom(c[topic], i)
        }
        return c[topic].push({
            id: subscriber,
            receiver: receiver,
            asy: !! asy
        })
    },
    unsubscribe: function (topic, subscriber) {
        var c = xui.$cache.subscribes,
            i;
        if (!subscriber) {
            if (topic === null || topic === undefined) {
                c = {}
            } else {
                delete c[topic]
            }
        } else {
            if (c[topic]) {
                i = _.arr.subIndexOf(c[topic], "id", subscriber);
                if (i != -1) {
                    _.arr.removeFrom(c[topic], i)
                }
            }
        }
    },
    publish: function (topic, args, scope) {
        var c = xui.$cache.subscribes;
        if (topic === null || topic === undefined) {
            for (var topic in c) {
                _.arr.each(c[topic], function (o) {
                    if (o.asy) {
                        _.asyRun(o.receiver, 0, args, scope)
                    } else {
                        return _.tryF(o.receiver, args, scope, true)
                    }
                })
            }
        } else {
            if (c[topic]) {
                _.arr.each(c[topic], function (o) {
                    if (o.asy) {
                        _.asyRun(o.receiver, 0, args, scope)
                    } else {
                        return _.tryF(o.receiver, args, scope, true)
                    }
                })
            }
        }
    },
    getSubscribers: function (topic) {
        return (topic === null || topic === undefined) ? xui.$cache.subscribes : xui.$cache.subscribes[topic]
    },
    setDateFormat: function (format) {
        xui.$dateFormat = format
    },
    getDateFormat: function () {
        return xui.$dateFormat
    },
    setAppLangKey: function (key) {
        xui.$appLangKey = key
    },
    getAppLangKey: function (key) {
        return xui.$appLangKey
    },
    getLang: function () {
        return xui.$localeKey
    },
    setLang: function (key, callback) {
        var g = xui.getRes,
            t, v, i, j, f, m, z, a = [];
        xui.$localeKey = key;
        v = xui.browser.ie ? document.all.tags("span") : document.getElementsByTagName("span");
        for (i = 0; t = v[i]; i++) {
            if (t.id == xui.$localeDomId) {
                a[a.length] = t
            }
        }
        f = function () {
            (function () {
                j = a.splice(0, 100);
                for (i = 0; t = j[i]; i++) {
                    if (typeof (v = g(t.className)) == "string") {
                        t.innerHTML = v
                    }
                }
                if (a.length) {
                    setTimeout(arguments.callee, 0)
                }
                _.tryF(callback)
            }())
        }, z = "xui.Locale." + key, m = function () {
            var k = xui.$appLangKey;
            if (k) {
                xui.include(z + "." + k, xui.getPath("Locale." + key, ".js"), f, f)
            } else {
                f()
            }
        };
        xui.include(z, xui.getPath(z, ".js"), m, m)
    },
    getTheme: function (a) {
        try {
            a = xui.CSS.$getCSSValue(".setting-uikey", "fontFamily")
        } catch (e) {} finally {
            return a || "default"
        }
    },
    setTheme: function (key, refresh, onSucess, onFail) {
        key = key || "default";
        var okey = xui.getTheme();
        if (key != okey) {
            if (refresh !== false) {
                if (key != "default") {
                    var s;
                    try {
                        s = xui.CSS.$getCSSValue(".setting-uikey", "fontFamily")
                    } catch (e) {} finally {
                        if (s == key || key == "default") {
                            _.tryF(onSucess);
                            return
                        }
                    }
                    xui.CSS.includeLink(xui.getPath("xui.appearance." + key, "/theme.css"), "theme:" + key)
                }
                if (okey !== "default") {
                    var o = xui.CSS.get("id", "theme:" + okey);
                    if (o) {
                        o.disabled = true;
                        o.parentNode.removeChild(o)
                    }
                    var o = xui.CSS.$getCSSValue(".setting-uikey", "fontFamily", okey);
                    if (o) {
                        o.disabled = true;
                        o.parentNode.removeChild(o)
                    }
                }
            }
            if (refresh !== false) {
                xui.$CSSCACHE = {};
                var count = 0,
                    fun = function (a) {
                        if (count > 20) {
                            if (false !== _.tryF(onFail)) {
                                throw new Error("errLoadTheme:" + key)
                            }
                        }
                        count++;
                        var s;
                        try {
                            s = xui.CSS.$getCSSValue(".setting-uikey", "fontFamily")
                        } catch (e) {} finally {
                            if (s == key || key == "default") {
                                if (xui.UI) {
                                    xui.UI.getAll().reLayout(true)
                                }
                                _.tryF(onSucess);
                                fun = count = null
                            } else {
                                _.asyRun(fun, 100 * count)
                            }
                        }
                    };
                fun("l")
            } else {
                _.tryF(onSucess)
            }
        } else {
            _.tryF(onSucess)
        }
    },
    $CSSCACHE: {},
    _langParamReg: /\x24(\d+)/g,
    _langscMark: /[$@{][\S]+/,
    _langReg: /((\$)([^\w]))|((\$)([\w][\w\.]*[\w]+))|((\@)([\w][\w\.]*[\w]+)(\@?))|((\{)([~!@#$%^&*+-\/?.|:][\w]*|[\w][\w\.]*[\w]+)(\}))/g,
    getRes: function (path) {
        var arr, conf, tmp, params = arguments;
        if (typeof path == "string") {
            if (path.indexOf("-") != -1) {
                tmp = path.split("-");
                path = tmp[0];
                params = tmp
            }
            arr = path.split(".")
        } else {
            arr = path
        }
        conf = _.get(xui.Locale[xui.$localeKey], arr);
        return (tmp = typeof conf) == "string" ? (params.length > 1 ? conf.replace(xui._langParamReg, function (z, id, k) {
            k = params[1 + +id];
            return (k === null || k === undefined) ? z : k
        }) : conf) : tmp == "function" ? conf.apply(null, params) : conf ? conf : arr[arr.length - 1]
    },
    wrapRes: function (id) {
        var i = id,
            s, r;
        if (i.charAt(0) == "$") {
            arguments[0] = i.substr(1, i.length - 1)
        }
        s = id;
        r = xui.getRes.apply(null, arguments);
        if (s == r) {
            r = i
        }
        return '<span id="' + xui.$localeDomId + '" class="' + s + '" ' + xui.$IEUNSELECTABLE() + ">" + r + "</span>"
    },
    adjustRes: function (str, wrap, onlyBraces) {
        wrap = wrap ? xui.wrapRes : xui.getRes;
        return xui._langscMark.test(str) ? str.replace(xui._langReg, function (a, b, c, d, e, f, g, h, i, j, k, l, m, n) {
            return c == "$" ? d : f == "$" ? wrap(g) : ((onlyBraces ? 0 : i == "@") || m == "{") ? ((j = xui.SC.get(i == "@" ? j : n)) || (_.isSet(j) ? j : "")) : a
        }) : str
    },
    request: function (uri, query, onSuccess, onFail, threadid, options) {
        return ((options && options.proxyType) ? (options.proxyType.toLowerCase() == "sajax" ? xui.SAjax : options.proxyType.toLowerCase() == "iajax" ? xui.IAjax : xui.Ajax) : (typeof query == "object" && ((function (d) {
            if (!_.isHash(d)) {
                return 0
            }
            for (var i in d) {
                if (d[i] && d[i].nodeType == 1) {
                    return 1
                }
            }
        })(query))) ? xui.IAjax : (options && options.method && options.method.toLowerCase() == "post") ? xui.absIO.isCrossDomain(uri) ? xui.IAjax : xui.Ajax : xui.absIO.isCrossDomain(uri) ? xui.SAjax : xui.Ajax).apply(null, arguments).start()
    },
    include: function (id, path, onSuccess, onFail, sync, options) {
        if (id && xui.SC.get(id)) {
            _.tryF(onSuccess)
        } else {
            options = typeof options == "object" ? options : {};
            if (!sync) {
                options.rspType = "script";
                options.checkKey = id;
                xui.SAjax(path, "", onSuccess, onFail, 0, options).start()
            } else {
                options.asy = !sync;
                xui.Ajax(path, "", function (rsp) {
                    try {
                        _.exec(rsp)
                    } catch (e) {
                        _.tryF(onFail, [e.name + ": " + e.message])
                    }
                    _.tryF(onSuccess)
                }, onFail, 0, options).start()
            }
        }
    },
    require: function (cls, sync, onSuccess, onFail) {
        xui.include(cls, xui.getPath(cls, ".js", "js"), onSuccess, onFail, sync)
    },
    _m: [],
    main: function (fun) {
        xui._m.push(fun)
    },
    getPath: function (key, tag, folder) {
        key = key.split(".");
        if (folder) {
            var a = [key[0], folder];
            for (var i = 1, l = key.length; i < l; i++) {
                a.push(key[i])
            }
            key.length = 0;
            key = a
        }
        var pre, ini = xui.ini;
        if (key[0] == "xui") {
            pre = ini.path;
            key.shift();
            if (key.length == (folder ? 1 : 0)) {
                key.push("xui")
            }
        } else {
            pre = ini.appPath;
            if (key.length == ((folder ? 1 : 0) + 1) && tag == ".js") {
                key.push("index")
            }
            if (ini.verPath) {
                pre += ini.verPath + "/"
            }
            if (ini.ver) {
                pre += ini.ver + "/"
            }
        }
        if (pre.slice(-1) != "/") {
            pre += "/"
        }
        return pre + key.join("/") + (tag || "/")
    },
    log: _.fun(),
    message: _.fun(),
    _pool: [],
    getObject: function (id) {
        return xui._pool["$" + id]
    },
    _ghostDivId: "xui.ghost::",
    $getGhostDiv: function () {
        var pool = xui.$cache.ghostDiv,
            i = 0,
            l = pool.length,
            p;
        do {
            p = pool[i++]
        } while (i < l && (p && p.firstChild));
        if (!p || p.firstChild) {
            p = document.createElement("div");
            p.id = xui._ghostDivId;
            pool.push(p)
        }
        return p
    },
    $xid: 0,
    $registerNode: function (o) {
        var id, v, purge = xui.$cache.domPurgeData;
        if (!(o.$xid && (v = purge[o.$xid]) && v.element == o)) {
            id = "!" + xui.$xid++;
            v = purge[id] || (purge[id] = {});
            v.element = o;
            o.$xid = v.$xid = id
        }
        o = null;
        return v
    },
    getId: function (node) {
        if (typeof node == "string") {
            node = document.getElementById(node)
        }
        return node ? window === node ? "!window" : document === node ? "!document" : (node.$xid || "") : ""
    },
    getNode: function (xid) {
        return xui.use(xid).get(0)
    },
    getNodeData: function (node, path) {
        if (!node) {
            return
        }
        return _.get(xui.$cache.domPurgeData[typeof node == "string" ? node : xui.getId(node)], path)
    },
    setNodeData: function (node, path, value) {
        if (!node) {
            return
        }
        return _.set(xui.$cache.domPurgeData[typeof node == "string" ? node : xui.getId(node)], path, value)
    },
    $purgeChildren: function (node) {
        var cache = xui.$cache,
            proMap = cache.profileMap,
            ch = cache.UIKeyMapEvents,
            pdata = cache.domPurgeData,
            children = xui.browser.ie ? node.all : node.getElementsByTagName("*"),
            l = children.length,
            bak = [],
            i, j, o, t, v, w, id;
        for (i = 0; i < l; i++) {
            if (!(v = children[i])) {
                continue
            }
            if (t = v.$xid) {
                if (o = pdata[t]) {
                    if (w = o.eHandlers) {
                        for (j in w) {
                            v[j] = null
                        }
                    }
                    for (j in o) {
                        o[j] = null
                    }
                    delete pdata[t]
                }
                if (xui.browser.ie) {
                    v.removeAttribute("$xid")
                } else {
                    delete v.$xid
                }
            }
            if (id = v.id) {
                if (id in proMap) {
                    o = proMap[id];
                    if (!o) {
                        continue
                    }
                    t = o.renderId;
                    if ("!window" === t || "!document" === t) {
                        continue
                    }
                    o.__gc();
                    bak[bak.length] = i;
                    if (o.$domId && o.$domId != o.domId) {
                        bak[bak.length] = o.$domId
                    }
                }
            }
        }
        for (i = 0; i < bak.length;) {
            delete proMap[bak[i++]]
        }
        node.innerHTML = ""
    },
    create: function (tag) {
        var arr, o, t, me = arguments.callee,
            r1 = me.r1 || (me.r1 = /</);
        if (typeof tag == "string") {
            if (t = xui.absBox.$type[tag]) {
                arr = [];
                for (var i = 1, l = arguments.length; i < l; i++) {
                    arr[i - 1] = arguments[i]
                }
                o = new(xui.SC(t))(false);
                if (o._ini) {
                    o._ini.apply(o, arr)
                }
            } else {
                if (r1.test(tag)) {
                    o = _.str.toDom(tag)
                } else {
                    o = document.createElement(tag);
                    o.id = typeof id == "string" ? id : _.id();
                    o = xui(o)
                }
            }
        } else {
            o = new(xui.SC(tag.key))(tag)
        }
        return o
    },
    use: function (xid) {
        var c = xui._tempBox || (xui._tempBox = xui()),
            n = c._nodes;
        n[0] = xid;
        if (n.length != 1) {
            n.length = 1
        }
        return c
    }
});
new function () {
    var w = window,
        u = navigator.userAgent.toLowerCase(),
        d = document,
        dm = d.documentMode,
        b = xui.browser = {
            kde: /webkit/.test(u),
            opr: /opera/.test(u),
            ie: /msie/.test(u) && !/opera/.test(u),
            gek: /mozilla/.test(u) && !/(compatible|webkit)/.test(u),
            isStrict: d.compatMode == "CSS1Compat",
            isWebKit: /webkit/.test(u),
            isFF: /firefox/.test(u),
            isChrome: /chrome/.test(u),
            isSafari: (!/chrome/.test(u)) && /safari/.test(u),
            isWin: /(windows|win32)/.test(u),
            isMac: /(macintosh|mac os x)/.test(u),
            isAir: /adobeair/.test(u),
            isLinux: /linux/.test(u),
            isSecure: location.href.toLowerCase().indexOf("https") == 0,
            isTouch: (("ontouchend" in d) && !(/hp-tablet/).test(u)) || u.msPointerEnabled,
            isIOS: /iphone|ipad|ipod/.test(u),
            isAndroid: /android/.test(u),
            isBB: /blackberry/.test(u) || /BB[\d]+;.+\sMobile\s/.test(navigator.userAgent)
        },
        v = function (k, s) {
            s = u.split(s)[1].split(".");
            return k + (b.ver = parseFloat((s.length > 0 && isFinite(s[1])) ? (s[0] + "." + s[1]) : s[0]))
        };
    xui.$secureUrl = b.isSecure && b.ie ? 'javascript:""' : "about:blank";
    _.filter(b, function (o) {
        return !!o
    });
    if (b.ie) {
        if (_.isNumb(dm)) {
            b["ie" + (b.ver = dm)] = true
        } else {
            b[v("ie", "msie ")] = true
        }
        if (b.ie6) {
            try {
                document.execCommand("BackgroundImageCache", false, true)
            } catch (e) {}
            w.XMLHttpRequest = function () {
                return new ActiveXObject("Msxml2.XMLHTTP")
            }
        }
        b.cssTag1 = "-ms-";
        b.cssTag2 = "ms"
    } else {
        if (b.gek) {
            b[v("gek", /.+\//)] = true;
            b.cssTag1 = "-moz-";
            b.cssTag2 = "Moz"
        } else {
            if (b.opr) {
                b[v("opr", "opera/")] = true;
                b.cssTag1 = "-o-";
                b.cssTag2 = "O"
            } else {
                if (b.kde) {
                    b[v("kde", "webkit/")] = true;
                    if (b.isSafari) {
                        if (/applewebkit\/4/.test(u)) {
                            b["safari" + (b.ver = 2)] = true
                        } else {
                            b[v("safari", "version/")] = true
                        }
                    } else {
                        if (b.isChrome) {
                            b[v("chrome", "chrome/")] = true
                        }
                    }
                    if (b.isWebKit) {
                        b.cssTag1 = "-webkit-";
                        b.cssTag2 = "Webkit"
                    } else {
                        b.cssTag1 = "-khtml-";
                        b.cssTag2 = "Khtml"
                    }
                }
            }
        }
    }
    if (b.isBB && !b.ver) {
        b.ver = parseFloat(ua.split("/")[1].substring(0, 3));
        b["bb" + b.ver] = true
    }
    b.contentBox = function (n) {
        return (b.ie || b.opr) ? !/BackCompat|QuirksMode/.test(d.compatMode) : (n = (n = n || d.documentElement).style["-moz-box-sizing"] || n.style["box-sizing"]) ? (n == "content-box") : true
    }();
    var ini = xui.ini = {};
    if (window.xui_ini) {
        _.merge(ini, window.xui_ini)
    }
    if (!ini.path) {
        var s, arr = document.getElementsByTagName("script"),
            reg = /js\/xui(-[\w]+)?\.js$/,
            l = arr.length;
        while (--l >= 0) {
            s = arr[l].src;
            if (s.match(reg)) {
                ini.path = s.replace(reg, "");
                break
            }
        }
    }
    _.merge(ini, {
        appPath: location.href.split("?")[0].replace(/[^\\\/]+$/, ""),
        img_bg: ini.path + "bg.gif",
        img_busy: ini.path + "busy.gif",
        img_blank: b.ie && b.ver <= 7 ? (ini.path + "bg.gif") : "data:image/gif;base64,R0lGODlhAQABAID/AMDAwAAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw==",
        dummy_tag: "$_dummy_$"
    });
    if (!ini.path) {
        ini.path = ini.appPath + "/xui"
    }
    var f = function () {
            if (xui.isDomReady) {
                return
            }
            if (d.addEventListener) {
                d.removeEventListener("DOMContentLoaded", f, false);
                w.removeEventListener("load", f, false)
            } else {
                d.detachEvent("onreadystatechange", f);
                w.detachEvent("onload", f)
            }
            try {
                for (var i = 0, l = xui._m.length; i < l; i++) {
                    _.tryF(xui._m[i])
                }
                xui._m.length = 0;
                xui.isDomReady = true
            } catch (e) {
                _.asyRun(function () {
                    throw e
                })
            }
        };
    if (d.addEventListener) {
        d.addEventListener("DOMContentLoaded", f, false);
        w.addEventListener("load", f, false)
    } else {
        d.attachEvent("onreadystatechange", f);
        w.attachEvent("onload", f);
        (function () {
            if (xui.isDomReady) {
                return
            }
            try {
                d.activeElement.id;
                d.documentElement.doScroll("left");
                f()
            } catch (e) {
                setTimeout(arguments.callee, 9)
            }
        })()
    }(function () {
        ((!xui.isDomReady) && ((!d.readyState) || /in/.test(d.readyState))) ? setTimeout(arguments.callee, 9) : f()
    })()
};
new function () {
    xui._uriReg = /^([\w\+\.\-]+:)(?:\/\/([^\/?#:]*)(?::(\d+))?)?/;
    xui._localReg = /^(?:about|app|app\-storage|.+\-extension|file|widget):$/;
    xui._curHref = (function (a) {
        try {
            return location.href
        } catch (e) {
            a = document.createElement("a");
            a.href = "";
            return a.href
        }
    })(), xui._localParts = xui._uriReg.exec(xui._curHref.toLowerCase()) || []
};
new function () {
    var TAGNAMES = {
        select: "input",
        change: "input",
        submit: "form",
        reset: "form",
        error: "img",
        load: "img",
        abort: "img"
    },
        c = {};
    xui.isEventSupported = function (name) {
        if (name in c) {
            return c[name]
        }
        var el = document.createElement(TAGNAMES[name] || "div"),
            en = "on" + name,
            support = (en in el);
        if (!support) {
            el.setAttribute(en, "return;");
            support = typeof el[en] == "function"
        }
        el = null;
        return c[name] = support
    }
};
Class("xui.Thread", null, {
    Constructor: function (id, tasks, delay, callback, onStart, onEnd, cycle) {
        if (arguments.callee.upper) {
            arguments.callee.upper.call(this)
        }
        var self = this,
            me = arguments.callee,
            t = xui.$cache.thread;
        if (self.constructor !== me || !! self.id) {
            return new me(id, tasks, delay, callback, onStart, onEnd, cycle)
        }
        if (typeof id != "string") {
            id = "$" + (self.constructor.$xid++)
        }
        self.id = id;
        self.profile = t[id] || (t[id] = {
            id: id,
            _start: false,
            time: 0,
            _left: 0,
            _asy: -1,
            index: 0,
            tasks: tasks || [],
            delay: delay || 0,
            callback: callback,
            onStart: onStart,
            onEnd: onEnd,
            cache: {},
            status: "ini",
            cycle: !! cycle
        })
    },
    Instance: {
        _fun: _.fun(),
        __gc: function () {
            var m = xui.$cache.thread,
                t = m[this.id];
            if (t) {
                delete m[this.id];
                t.tasks.length = 0;
                for (var i in t) {
                    t[i] = null
                }
            }
        },
        _task: function () {
            var self = this,
                p = self.profile;
            if (!p || !p.status || !p.tasks) {
                return
            }
            p._asy = -1;
            var t = {},
                value = p.tasks[p.index],
                r, i, type = typeof value;
            if (type == "function") {
                t.task = value
            } else {
                if (type == "object") {
                    for (i in value) {
                        t[i] = value[i]
                    }
                }
            }
            if (typeof t.callback != "function") {
                t.callback = p.callback
            }
            if (typeof t.task == "function") {
                t.args = t.args || [];
                t.args.push(p.id)
            }
            p.index++;
            p.time = _();
            if (typeof t.task == "function") {
                r = _.tryF(t.task, t.args || [p.id], t.scope || self, null)
            }
            if (!p.status) {
                return
            }
            if (t.id) {
                p.cache[t.id] = r
            }
            if (t.callback && false === _.tryF(t.callback, [p.id], self, true)) {
                return self.abort()
            }
            if (p.status !== "run") {
                return
            }
            self.start()
        },
        start: function (time) {
            var self = this,
                p = self.profile,
                task, delay;
            if (p._start === false) {
                p._start = true;
                if (false === _.tryF(p.onStart, [p.id], self)) {
                    return self.abort()
                }
            }
            if (p.status != "run") {
                p.status = "run"
            }
            if (!p.tasks.length) {
                return self.abort()
            }
            if (p.index >= p.tasks.length) {
                if (p.cycle === true) {
                    self.profile.index = 0
                } else {
                    return self.abort()
                }
            }
            task = p.tasks[p.index];
            delay = typeof task == "number" ? task : (task && typeof task.delay == "number") ? task.delay : p.delay;
            p._left = (time || time === 0) ? time : delay;
            if (p._asy != -1) {
                clearTimeout(p._asy)
            }
            p._asy = _.asyRun(self._task, p._left, [], self);
            p.time = _();
            return self
        },
        suspend: function () {
            var n, p = this.profile;
            if (p.status == "pause") {
                return
            }
            p.status = "pause";
            if (p._asy !== -1) {
                clearTimeout(p._asy);
                if (p.index > 0) {
                    p.index--
                }
            }
            n = p._left - (_() - p.time);
            p._left = (n >= 0 ? n : 0);
            return this
        },
        resume: function (time) {
            var self = this;
            if (self.profile.status == "run") {
                return
            }
            time = time === undefined ? self.profile._left : time === true ? self.profile.delay : time === false ? 0 : (Number(time) || 0);
            self.profile.status = "run";
            self.start(time);
            return self
        },
        abort: function () {
            var t = this.profile;
            t.status = "stop";
            clearTimeout(t._asy);
            _.tryF(t.onEnd, [t.id]);
            this.__gc()
        },
        links: function (thread) {
            var p = this.profile,
                onEnd = p.onEnd,
                id = p.id;
            p.onEnd = function () {
                _.tryF(onEnd, [id]);
                thread.start()
            };
            return this
        },
        insert: function (arr, index) {
            var self = this,
                o = self.profile.tasks,
                l = o.length,
                a;
            if (!_.isArr(arr)) {
                arr = [arr]
            }
            index = index || self.profile.index;
            if (index < 0) {
                index = -1
            }
            if (index == -1) {
                Array.prototype.push.apply(o, arr)
            } else {
                if (index > l) {
                    index = l
                }
                a = o.splice(index, l - index);
                o.push.apply(o, arr);
                o.push.apply(o, a)
            }
            return self
        },
        getCache: function (key) {
            return this.profile.cache[key]
        },
        setCache: function (key, value) {
            this.profile.cache[key] = value;
            return this
        },
        isAlive: function () {
            return !!xui.$cache.thread[this.id]
        },
        getStatus: function () {
            return this.profile.status
        }
    },
    After: function () {
        var self = this,
            f = function (i) {
                self[i] = function (id) {
                    var t;
                    if (xui.$cache.thread[id]) {
                        (t = xui.Thread(id))[i].apply(t, Array.prototype.slice.call(arguments, 1))
                    }
                }
            },
            a = "start,suspend,resume,abort".split(",");
        for (var i = 0, l = a.length; i < l; i++) {
            f(a[i])
        }
    },
    Static: {
        $asFunction: 1,
        $xid: 1,
        __gc: function () {
            xui.$cache.thread = {}
        },
        isAlive: function (id) {
            return !!xui.$cache.thread[id]
        },
        observableRun: function (tasks, onEnd, threadid) {
            var thread = xui.Thread,
                dom = xui.Dom;
            if (!_.isArr(tasks)) {
                tasks = [tasks]
            }
            if (xui.$cache.thread[threadid]) {
                if (typeof onEnd == "function") {
                    tasks.push(onEnd)
                }
                thread(threadid).insert(tasks)
            } else {
                thread(threadid, tasks, 0, null, function (threadid) {
                    if (dom) {
                        dom.busy(threadid)
                    }
                }, function (threadid) {
                    _.tryF(onEnd, arguments, this);
                    if (dom) {
                        dom.free(threadid)
                    }
                }).start()
            }
        },
        group: function (id, group, callback, onStart, onEnd) {
            var bak = {},
                thread = xui.Thread,
                f = function (o, i, threadid) {
                    if (typeof o == "string") {
                        o = thread(o)
                    }
                    if (o) {
                        var f = function () {
                                var me = arguments.callee;
                                _.tryF(me.onEnd, arguments, this);
                                me.onEnd = null;
                                delete bak[i];
                                _.tryF(callback, [i, threadid], this);
                                if (_.isEmpty(bak)) {
                                    thread.resume(threadid)
                                }
                            };
                        f.onEnd = o.profile.onEnd;
                        o.profile.onEnd = f;
                        o.start()
                    }
                };
            for (var i in group) {
                bak[i] = 1
            }
            return thread(id, [function (threadid) {
                if (!_.isEmpty(group)) {
                    thread.suspend(threadid);
                    for (var i in group) {
                        f(group[i], i, threadid)
                    }
                }
            }], 0, null, onStart, onEnd)
        },
        repeat: function (task, interval, onStart, onEnd) {
            return xui.Thread(null, [null], interval || 0, task, onStart, onEnd, true).start()
        }
    }
});
Class("xui.absIO", null, {
    Constructor: function (uri, query, onSuccess, onFail, threadid, options) {
        if (arguments.callee.upper) {
            arguments.callee.upper.call(this)
        }
        if (typeof uri == "object") {
            options = uri
        } else {
            options = options || {};
            _.merge(options, {
                uri: uri,
                query: query,
                onSuccess: onSuccess,
                onFail: onFail,
                threadid: threadid
            })
        }
        var self = this,
            me = arguments.callee,
            con = self.constructor;
        if ((con !== me) || self.id) {
            return new me(options)
        }
        _.merge(options, {
            id: options.id || ("" + (con._id++)),
            uri: options.uri || "",
            username: options.username || undefined,
            password: options.password || undefined,
            query: options.query || "",
            contentType: options.contentType || "",
            Accept: options.Accept || "",
            header: options.header || null,
            asy: options.asy !== false,
            method: "POST" == (options.method || con.method).toUpperCase() ? "POST" : "GET"
        }, "all");
        var a = "retry,timeout,reqType,rspType,optimized,customQS".split(",");
        for (var i = 0, l = a.length; i < l; i++) {
            options[a[i]] = (a[i] in options) ? options[a[i]] : con[a[i]];
            if (typeof options[a[i]] == "string") {
                options[a[i]] = options[a[i]].toLowerCase()
            }
        }
        _.merge(self, options, "all");
        if (self.reqType == "xml") {
            self.method = "POST"
        }
        if (con.events) {
            _.merge(self, con.events)
        }
        self.query = self.customQS(self.query);
        if (typeof self.query == "object" && self.reqType != "xml") {
            self.query = _.clone(self.query, function (o) {
                return o !== undefined
            })
        }
        if (!self._useForm && typeof self.query != "string" && self.reqType != "xml") {
            self.query = con._buildQS(self.query, self.reqType == "json", self.method == "POST")
        }
        return self
    },
    Instance: {
        _fun: _.fun(),
        _flag: 0,
        _response: false,
        _txtresponse: "",
        _retryNo: 0,
        _time: function () {
            var self = this,
                c = self.constructor;
            self._clear();
            if (self._retryNo < self.retry) {
                self._retryNo++;
                _.tryF(self.onRetry, [self._retryNo], self);
                self.start()
            } else {
                if (false !== _.tryF(self.onTimeout, [], self)) {
                    self._onError(new Error("Request timeout"))
                }
            }
        },
        _onEnd: function () {
            var self = this;
            if (!self._end) {
                self._end = true;
                if (self._flag > 0) {
                    clearTimeout(self._flag);
                    self._flag = 0
                }
                xui.Thread.resume(self.threadid);
                _.tryF(self.onEnd, [], self);
                self._clear()
            }
        },
        _onStart: function () {
            var self = this;
            xui.Thread.suspend(self.threadid);
            _.tryF(self.onStart, [], self)
        },
        _onResponse: function () {
            var self = this;
            if (false !== _.tryF(self.beforeSuccess, [self._response, self.rspType, self.threadid], self)) {
                _.tryF(self.onSuccess, [self._response, self.rspType, self.threadid], self)
            }
            self._onEnd()
        },
        _onError: function (e) {
            var self = this;
            if (false !== _.tryF(self.beforeFail, [e, self.threadid], self)) {
                _.tryF(self.onFail, [e.name + ": " + e.message, self.rspType, self.threadid], self)
            }
            self._onEnd()
        },
        isAlive: function () {
            return !this._end
        },
        abort: function () {
            this._onEnd()
        }
    },
    Static: {
        $abstract: true,
        _id: 1,
        method: "GET",
        retry: 0,
        timeout: 60000,
        reqType: "form",
        rspType: "json",
        optimized: false,
        callback: "callback",
        _buildQS: function (hash, flag, post) {
            return flag ? ((flag = _.serialize(hash)) && (post ? flag : encodeURIComponent(flag))) : _.urlEncode(hash)
        },
        customQS: function (obj) {
            return obj
        },
        _if: function (doc, id, onLoad) {
            var ie8 = xui.browser.ie && xui.browser.ver < 9,
                scr = ie8 ? ("<iframe " + (id ? ("name='xui_IAajax_" + id + "'") : "") + (onLoad ? (" onload='xui.IAjax._o(\"" + id + "\")'") : "") + ">") : "iframe";
            var n = doc.createElement(scr),
                w;
            if (id) {
                n.id = n.name = "xui_IAajax_" + id
            }
            if (!ie8 && onLoad) {
                n.onload = onLoad
            }
            n.style.display = "none";
            doc.body.appendChild(n);
            w = frames[frames.length - 1].window;
            return [n, w, w.document]
        },
        isCrossDomain: function (uri) {
            var a = xui._uriReg.exec((uri || "").toLowerCase()),
                b = xui._localParts;
            return !!(a && (a[1] !== b[1] || a[2] !== b[2] || (a[3] || (a[1] === "http:" ? 80 : 443)) !== (b[3] || (b[1] === "http:" ? 80 : 443))))
        },
        groupCall: function (hash, callback, onStart, onEnd, threadid) {
            var i, f = function (o, i, hash) {
                    hash[i] = xui.Thread(null, [function (threadid) {
                        o.threadid = threadid;
                        o.start()
                    }])
                };
            for (i in hash) {
                f(hash[i], i, hash)
            }
            return xui.Thread.group(null, hash, callback, function () {
                xui.Thread(threadid).suspend();
                _.tryF(onStart, arguments, this)
            }, function () {
                _.tryF(onEnd, arguments, this);
                xui.Thread(threadid).resume()
            }).start()
        }
    }
});
Class("xui.Ajax", "xui.absIO", {
    Instance: {
        _XML: null,
        _header: function (n, v) {
            if (this._XML) {
                this._XML.setRequestHeader(n, v)
            }
        },
        start: function () {
            var self = this;
            if (false === _.tryF(self.beforeStart, [], self)) {
                self._onEnd();
                return
            }
            if (!self._retryNo) {
                self._onStart()
            }
            try {
                with(self) {
                    self._XML = new window.XMLHttpRequest();
                    if (asy) {
                        self._XML.onreadystatechange = function () {
                            if (self && self._XML && self._XML.readyState == 4) {
                                self._complete.apply(self);
                                self._clear()
                            }
                        }
                    }
                    if (!_retryNo && method != "POST") {
                        if (query) {
                            uri = uri.split("?")[0] + "?" + query
                        }
                        query = null
                    }
                    if (username && password) {
                        self._XML.open(method, uri, asy, username, password)
                    } else {
                        self._XML.open(method, uri, asy)
                    }
                    self._header("Accept", Accept ? Accept : (rspType == "xml" ? "text/xml; " : rspType == "json" ? "application/json; " : "default; "));
                    self._header("Content-type", contentType ? contentType : ((reqType == "xml" ? "text/xml; " : reqType == "json" ? "application/json; " : method == "POST" ? "application/x-www-form-urlencoded; " : "") + "charset=" + (self.charset || "UTF-8")));
                    self._header("X-Requested-With", "XMLHttpRequest");
                    if (optimized) {
                        try {
                            self._header("User-Agent", null);
                            self._header("Accept-Language", null);
                            self._header("Connection", "keep-alive");
                            self._header("Keep-Alive", null);
                            self._header("Cookie", null);
                            self._header("Cookie", "")
                        } catch (e) {}
                    }
                    try {
                        if (_.isHash(header)) {
                            _.each(header, function (o, i) {
                                self._header(i, o)
                            })
                        }
                    } catch (e) {}
                    if (false === _.tryF(self.beforeSend, [self._XML], self)) {
                        self._onEnd();
                        return
                    }
                    try {
                        self._XML.send(query)
                    } catch (e) {}
                    if (asy) {
                        if (self._XML && timeout > 0) {
                            _flag = _.asyRun(function () {
                                if (self && !self._end) {
                                    self._time()
                                }
                            }, self.timeout)
                        }
                    } else {
                        _complete()
                    }
                }
            } catch (e) {
                self._onError(e)
            }
            return self
        },
        abort: function () {
            var self = this;
            if (self._XML) {
                self._XML.onreadystatechange = self._fun;
                self._XML.abort();
                self._XML = null
            }
            arguments.callee.upper.call(self)
        },
        _clear: function () {
            var self = this;
            if (self._XML) {
                self._XML.onreadystatechange = self._fun;
                self._XML = null
            }
        },
        _complete: function () {
            with(this) {
                var ns = this,
                    obj, status = ns._XML.status;
                _txtresponse = rspType == "xml" ? ns._XML.responseXML : ns._XML.responseText;
                _response = rspType == "json" ? ((obj = _.unserialize(_txtresponse)) === false ? _txtresponse : obj) : _txtresponse;
                if (!status && xui._localReg.test(xui._localParts[1]) && !xui.absIO.isCrossDomain(uri)) {
                    status = ns._XML.responseText ? 200 : 404
                }
                if (status == 1223) {
                    status = 204
                }
                if (status === undefined || status < 10) {
                    _onError(new Error("Network problems--" + status))
                } else {
                    if (status === undefined || status === 0 || status == 304 || (status >= 200 && status < 300)) {
                        _onResponse()
                    } else {
                        _onError(new Error("XMLHTTP returns--" + status))
                    }
                }
            }
        }
    },
    Static: {
        $asFunction: 1
    }
});
Class("xui.SAjax", "xui.absIO", {
    Instance: {
        start: function () {
            var self = this,
                id, c = self.constructor,
                t, n, ok = false;
            if (false === _.tryF(self.beforeStart, [], self)) {
                self._onEnd();
                return
            }
            if (!self._retryNo) {
                self._onStart()
            }
            if (self.rspType == "script") {
                self.retry = 0
            }
            id = self.id;
            if (c._pool[id]) {
                c._pool[id].push(self)
            } else {
                c._pool[id] = [self]
            }
            c.No["_" + id] = function (rsp) {
                c.$response(rsp, id)
            };
            var w = c._n = document,
                _cb = function () {
                    if (!ok) {
                        ok = true;
                        if (self.rspType == "script") {
                            if (typeof self.checkKey == "string") {
                                _.asyRun(function () {
                                    _.exec("if(xui.SC.get('" + self.checkKey + "'))xui.SAjax._pool['" + id + "'][0]._onResponse();else xui.SAjax._pool['" + id + "'][0]._loaded();")
                                })
                            } else {
                                self._onResponse()
                            }
                        } else {
                            self._loaded()
                        }
                    }
                };
            n = self.node = w.createElement("script");
            var uri = self.uri;
            if (self.query) {
                uri = uri.split("?")[0] + "?" + self.query
            }
            n.src = uri;
            n.type = "text/javascript";
            n.charset = self.charset || "UTF-8";
            n.onload = n.onreadystatechange = function () {
                if (ok) {
                    return
                }
                var t = this.readyState;
                if (!t || t == "loaded" || t == "complete") {
                    _cb()
                }
                if (t == "interactive" && xui.browser.opr) {
                    xui.Thread.repeat(function () {
                        if (ok) {
                            return false
                        }
                        if (/loaded|complete/.test(document.readyState)) {
                            _cb();
                            return false
                        }
                    }, 50)
                }
            };
            if (xui.browser.gek) {
                n.onerror = _cb
            }
            w.body.appendChild(n);
            n = null;
            if (self.timeout > 0) {
                self._flag = _.asyRun(function () {
                    if (self && !self._end) {
                        self._time()
                    }
                }, self.timeout)
            }
        },
        _clear: function () {
            var self = this,
                n = self.node,
                c = self.constructor,
                id = self.id,
                _pool = c._pool;
            if (_pool[id]) {
                _pool[id].length = 0;
                delete _pool[id]
            }
            delete c.No["_" + id];
            if (n) {
                self.node = n.onload = n.onreadystatechange = n.onerror = null;
                var div = c._n.createElement("div");
                div.appendChild(n.parentNode && n.parentNode.removeChild(n) || n);
                if (xui.browser.ie) {
                    _.asyRun(function () {
                        div.innerHTML = n.outerHTML = "";
                        if (_.isEmpty(_pool)) {
                            c._id = 1
                        }
                        _pool = c = n = div = null
                    })
                } else {
                    _.asyRun(function () {
                        div.innerHTML = "";
                        n = div = null;
                        if (_.isEmpty(_pool)) {
                            c._id = 1
                        }
                    })
                }
            } else {
                if (_.isEmpty(_pool)) {
                    c._id = 1
                }
            }
        },
        _loaded: function () {
            var self = this;
            _.asyRun(function () {
                if (self.id && self.constructor._pool[self.id]) {
                    self._onError(new Error("SAjax return script doesn't match"))
                }
            }, 500)
        }
    },
    Static: {
        $asFunction: 1,
        _pool: {},
        No: {},
        $response: function (obj, id) {
            var self = this;
            try {
                if (obj && (o = self._pool[id])) {
                    for (var i = 0, l = o.length; i < l; i++) {
                        o[i]._response = obj;
                        o[i]._onResponse()
                    }
                } else {
                    self._onError(new Error("SAjax return value formatting error--" + obj))
                }
            } catch (e) {
                xui.Debugger && xui.Debugger.trace(e)
            }
        },
        customQS: function (obj) {
            var c = this.constructor,
                b = c.callback,
                nr = (this.rspType != "script");
            if (typeof obj == "string") {
                return (obj || "") + (nr ? ("&" + b + "=xui.SAjax.No._" + this.id) : "")
            } else {
                if (nr) {
                    obj[b] = "xui.SAjax.No._" + this.id
                }
                return obj
            }
        }
    }
});
Class("xui.IAjax", "xui.absIO", {
    Instance: {
        _useForm: true,
        start: function () {
            var self = this,
                c = self.constructor,
                i, id, t, n, k, o, b, form, onload;
            if (false === _.tryF(self.beforeStart, [], self)) {
                self._onEnd();
                return
            }
            if (!self._retryNo) {
                self._onStart()
            }
            id = self.id;
            if (c._pool[id]) {
                c._pool[id].push(self)
            } else {
                c._pool[id] = [self]
            }
            self._onload = onload = function (id) {
                if (self.OK) {
                    return
                }
                if (!self.node) {
                    return
                }
                var w = self.node.contentWindow,
                    c = xui.IAjax,
                    o, t;
                if (xui.browser.opr) {
                    try {
                        if (w.location == "about:blank") {
                            return
                        }
                    } catch (e) {}
                }
                self.OK = 1;
                try {
                    w.name
                } catch (e) {
                    w.location.replace(c._getDummy() + "#" + xui.ini.dummy_tag)
                }
                _.asyRun(function () {
                    if (xui.browser.kde && w.name === undefined) {
                        _.asyRun(arguments.callee);
                        return
                    } else {
                        try {
                            w.name
                        } catch (e) {
                            _.asyRun(arguments.callee);
                            return
                        }
                    }
                    var data;
                    if (("xui_IAajax_" + self.id) == w.name) {
                        self._clear();
                        self._onError(new Error("IAjax no return value"));
                        return
                    } else {
                        data = w.name
                    }
                    if (data && (o = _.unserialize(data)) && (t = c._pool[self.id])) {
                        for (var i = 0, l = t.length; i < l; i++) {
                            t[i]._response = o;
                            t[i]._onResponse()
                        }
                    } else {
                        self._clear();
                        self._onError(new Error("IAjax return value formatting error, or no matched 'id'-- " + data))
                    }
                })
            };
            var a = c._if(document, id, onload);
            self.node = a[0];
            self.frm = a[1];
            form = self.form = document.createElement("form");
            form.style.display = "none";
            var uri = self.uri;
            if (self.method != "POST") {
                uri = uri.split("?")[0]
            }
            form.action = self.uri;
            form.method = self.method;
            form.target = "xui_IAajax_" + id;
            k = self.query || {};
            for (i in k) {
                if (k[i] && k[i].nodeType == 1) {
                    k[i].id = k[i].name = i;
                    form.appendChild(k[i]);
                    b = true
                } else {
                    if (_.isDefined(k[i])) {
                        t = document.createElement("textarea");
                        t.id = t.name = i;
                        t.value = typeof k[i] == "string" ? k[i] : _.serialize(k[i], function (o) {
                            return o !== undefined
                        });
                        form.appendChild(t)
                    }
                }
            }
            if (self.method == "POST" && b) {
                form.enctype = "multipart/form-data";
                if (form.encoding) {
                    form.encoding = form.enctype
                }
            }
            document.body.appendChild(form);
            form.submit();
            t = form = null;
            if (self.timeout > 0) {
                self._flag = _.asyRun(function () {
                    if (self && !self._end) {
                        self._time()
                    }
                }, self.timeout)
            }
        },
        _clear: function () {
            var self = this,
                n = self.node,
                f = self.form,
                c = self.constructor,
                div = document.createElement("div"),
                id = self.id,
                _pool = c._pool;
            if (_pool[id]) {
                _pool[id].length = 0;
                delete _pool[id]
            }
            if (xui.browser.gek && n) {
                try {
                    n.onload = null;
                    var d = n.contentWindow.document;
                    d.write(" ");
                    d.close()
                } catch (e) {}
            }
            self.form = self.node = self.frm = null;
            if (n) {
                div.appendChild(n.parentNode.removeChild(n))
            }
            if (f) {
                div.appendChild(f.parentNode.removeChild(f))
            }
            div.innerHTML = "";
            if (_.isEmpty(_pool)) {
                c._id = 1
            }
            f = div = null
        }
    },
    Static: {
        $asFunction: 1,
        method: "POST",
        _pool: {},
        _o: function (id) {
            var self = this,
                p = self._pool[id],
                o = p[p.length - 1];
            _.tryF(o._onload)
        },
        _getDummy: function (win) {
            win = win || window;
            var ns = this,
                arr, o, d = win.document,
                ini = xui.ini,
                b = xui.browser,
                f = ns.isCrossDomain;
            if (ns.dummy) {
                return ns.dummy
            }
            if (ini.dummy) {
                return ns.dummy = ini.dummy
            }
            if (!f(ini.path)) {
                if (!d.getElementById("xui:img:bg")) {
                    o = d.createElement("img");
                    o.id = "xui:img:bg";
                    o.src = ini.img_bg;
                    o.style.display = "none";
                    d.body.appendChild(o);
                    o = null
                }
            }
            if (o = d.getElementById("xui:img:bg")) {
                return ns.dummy = o.src.split("#")[0]
            } else {
                arr = d.getElementsByTagName("img");
                for (var i = 0, j = arr.length; i < j; i++) {
                    o = arr[i];
                    if (o.src && !f(o.src)) {
                        return ns.dummy = o.src.split("#")[0]
                    }
                }
                if (b.gek) {
                    arr = d.getElementsByTagName("link");
                    for (var i = 0, j = arr.length; i < j; i++) {
                        o = arr[i];
                        if (o.rel == "stylesheet" && !f(o.href)) {
                            return ns.dummy = o.href.split("#")[0]
                        }
                    }
                }
            }
            try {
                if (win != win.parent) {
                    if ((win = win.parent) && !f("" + win.document.location.href)) {
                        return ns._getDummy(win)
                    }
                }
            } catch (e) {}
            return "/favicon.ico"
        },
        customQS: function (obj) {
            var s = this,
                c = s.constructor,
                t = c.callback;
            obj[t] = "window.name";
            return obj
        }
    }
});
Class("xui.SC", null, {
    Constructor: function (path, callback, isAsy, threadid, options) {
        if (arguments.callee.upper) {
            arguments.callee.upper.call(this)
        }
        var p = xui.$cache.SC,
            r;
        if (r = p[path] || (p[path] = _.get(window, path.split(".")))) {
            _.tryF(callback, [path, null, threadid], r)
        } else {
            options = options || {};
            options.$cb = callback;
            if (isAsy) {
                options.threadid = threadid
            }
            r = p[path] = xui.SC._call(path || "", options, isAsy)
        }
        return r
    },
    Static: {
        $asFunction: 1,
        __gc: function (k) {
            xui.$cache.SC = {}
        },
        get: function (path, obj) {
            return _.get(obj || window, (path || "").split("."))
        },
        _call: function (s, options, isAsy) {
            isAsy = !! isAsy;
            var i, t, r, o, funs = [],
                ep = xui.SC.get,
                ct = xui.$cache.snipScript,
                f = function (text, n, threadid) {
                    var self = this;
                    if (text) {
                        if (!ep(s)) {
                            if (self.$p) {
                                (self.$cache || ct)[self.$tag] = text
                            } else {
                                try {
                                    _.exec(text)
                                } catch (e) {
                                    throw new Error(e.name + ": " + e.message + " " + self.$tag)
                                }
                            }
                        }
                    }
                    _.tryF(self.$cb, [self.$tag, text, threadid], ep(s) || {})
                },
                fe = function (text) {
                    var self = this;
                    _.tryF(self.$cb, [null, null, self.threadid], self)
                };
            if (!(r = ep(s))) {
                if (t = ct[s]) {
                    isAsy = false;
                    f.call({
                        $cb: options.$cb
                    }, t);
                    delete ct[s]
                }
                if (!(r = ep(s))) {
                    o = xui.getPath(s, ".js", "js");
                    options = options || {};
                    options.$tag = s;
                    var ajax;
                    if (isAsy && !options.$p) {
                        options.rspType = "script";
                        ajax = xui.SAjax
                    } else {
                        options.asy = isAsy;
                        ajax = xui.Ajax
                    }
                    ajax(o, {
                        rand: _()
                    }, f, fe, null, options).start();
                    if (!isAsy) {
                        r = ep(s)
                    }
                }
            } else {
                if (options.$cb) {
                    f.call(options)
                }
            }
            return r
        },
        loadSnips: function (pathArr, cache, callback, onEnd, threadid) {
            if (!pathArr || !pathArr.length) {
                _.tryF(onEnd, [threadid]);
                return
            }
            var bak = {},
                options = {
                    $p: 1,
                    $cache: cache || xui.$cache.snipScript
                };
            for (var i = 0, l = pathArr.length; i < l; i++) {
                bak[pathArr[i]] = 1
            }
            if (callback || onEnd) {
                options.$cb = function (path) {
                    if (callback) {
                        _.tryF(callback, arguments, this)
                    }
                    delete bak[path || this.$tag];
                    if (_.isEmpty(bak)) {
                        _.tryF(onEnd, [threadid]);
                        onEnd = null;
                        xui.Thread.resume(threadid)
                    }
                }
            }
            xui.Thread.suspend(threadid);
            for (var i = 0, s; s = pathArr[i++];) {
                this._call(s, _.merge({
                    $tag: s
                }, options), true)
            }
        },
        runInBG: function (pathArr, callback, onStart, onEnd) {
            var i = 0,
                j, t, self = this,
                fun = function (threadid) {
                    while (pathArr.length > i && (t = self.get(j = pathArr[i++]))) {}
                    if (!t) {
                        self._call(j, {
                            threadid: threadid
                        }, true)
                    }
                    if (pathArr.length < i) {
                        xui.Thread(threadid).abort()
                    }
                    if (pathArr.length == i) {
                        i++
                    }
                };
            xui.Thread(null, [fun], 1000, callback, onStart, onEnd, true).start()
        },
        execSnips: function (cache) {
            var i, h = cache || xui.$cache.snipScript;
            for (i in h) {
                try {
                    _.exec(h[i])
                } catch (e) {
                    throw e
                }
            }
            h = {}
        },
        groupCall: function (pathArr, callback, onEnd, threadid) {
            if (pathArr) {
                var self = this;
                self.execSnips();
                xui.Thread.suspend(threadid);
                self.loadSnips(pathArr, 0, callback, function () {
                    self.execSnips();
                    _.tryF(onEnd, [threadid]);
                    onEnd = null;
                    xui.Thread.resume(threadid)
                })
            } else {
                _.tryF(onEnd, [threadid])
            }
        }
    }
});
new function () {
    var M = {
        "\b": "\\b",
        "\t": "\\t",
        "\n": "\\n",
        "\f": "\\f",
        "\r": "\\r",
        '"': '\\"',
        "\\": "\\\\",
        "/": "\\/",
        "\x0B": "\\u000b"
    },
        H = {
            "@window": "window",
            "@this": "this"
        },
        A1 = /\uffff/.test("\uffff") ? /[\\\"\x00-\x1f\x7f-\uffff]/ : /[\\\"\x00-\x1f\x7f-\xff]/,
        A2 = /\uffff/.test("\uffff") ? /[\\\"\x00-\x1f\x7f-\uffff]/g : /[\\\"\x00-\x1f\x7f-\xff]/g,
        D = /^(-\d+|\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})(?:\.(\d{1,3}))?((?:[+-](\d{2})(\d{2}))|Z)?$/,
        E = function (t, i, a, v, m, n, p) {
            for (i in t) {
                if ((a = typeof (v = t[i])) == "string" && (v = D.exec(v))) {
                    m = v[8] && v[8].charAt(0);
                    if (m != "Z") {
                        n = (m == "-" ? -1 : 1) * ((+v[9] || 0) * 60) + (+v[10] || 0)
                    } else {
                        n = 0
                    }
                    m = new Date(+v[1], +v[2] - 1, +v[3], +v[4], +v[5], +v[6], +v[7] || 0);
                    n += m.getTimezoneOffset();
                    if (n) {
                        m.setTime(m.getTime() + n * 60000)
                    }
                    t[i] = m
                } else {
                    if (a == "object" && t[i] && (_.isObj(t[i]) || _.isArr(t[i]))) {
                        E(t[i])
                    }
                }
            }
            return t
        },
        R = function (n) {
            return n < 10 ? "0" + n : n
        },
        F = "function",
        N = "number",
        L = "boolean",
        S = "string",
        O = "object",
        T = {},
        MS = function (x, s) {
            return "." + ((s = x[s]()) ? s < 10 ? "00" + s : s < 100 ? "0" + s : s : "000")
        },
        Z = (function (a, b) {
            a = -(new Date).getTimezoneOffset() / 60;
            b = a > 0 ? "+" : "-";
            a = "" + Math.abs(a);
            return b + (a.length == 1 ? "0" : "") + a + "00"
        })();
    T["undefined"] = function () {
        return "null"
    };
    T[L] = function (x) {
        return String(x)
    };
    T[N] = function (x) {
        return ((x || x === 0) && isFinite(x)) ? String(x) : "null"
    };
    T[S] = function (x) {
        return H[x] || '"' + (A1.test(x) ? x.replace(A2, function (a, b) {
            if (b = M[a]) {
                return b
            }
            return "\\u" + ((b = a.charCodeAt()) < 16 ? "000" : b < 256 ? "00" : b < 4096 ? "0" : "") + b.toString(16)
        }) : x) + '"'
    };
    T[O] = function (x, filter, dateformat, deep, max) {
        var me = arguments.callee,
            map = me.map || (me.map = {
                prototype: 1,
                constructor: 1,
                toString: 1,
                valueOf: 1
            });
        deep = deep || 1;
        max = max || 0;
        if (deep > xui.SERIALIZEMAXLAYER || max > xui.SERIALIZEMAXSIZE) {
            return '"too much recursion!"'
        }
        max++;
        if (x) {
            var a = [],
                b = [],
                f, i, l, v;
            if (x === window) {
                return "window"
            }
            if (x === document) {
                return "document"
            }
            if ((typeof x == O || typeof x == F) && !_.isFun(x.constructor)) {
                return x.nodeType ? "document.getElementById('" + x.id + "')" : "$alien"
            } else {
                if (_.isArr(x)) {
                    a[0] = "[";
                    l = x.length;
                    for (i = 0; i < l; ++i) {
                        if (typeof filter == "function" && false == filter.call(x, x[i], i)) {
                            continue
                        }
                        if (f = T[typeof (v = x[i])]) {
                            if (typeof (v = f(v, filter, dateformat, deep + 1, max)) == S) {
                                b[b.length] = v
                            }
                        }
                    }
                    a[2] = "]"
                } else {
                    if (_.isDate(x)) {
                        if (dateformat == "utc") {
                            return '"' + x.getUTCFullYear() + "-" + R(x.getUTCMonth() + 1) + "-" + R(x.getUTCDate()) + "T" + R(x.getUTCHours()) + ":" + R(x.getUTCMinutes()) + ":" + R(x.getUTCSeconds()) + MS(x, "getUTCMilliseconds") + 'Z"'
                        } else {
                            if (dateformat == "gmt") {
                                return '"' + x.getFullYear() + "-" + R(x.getMonth() + 1) + "-" + R(x.getDate()) + "T" + R(x.getHours()) + ":" + R(x.getMinutes()) + ":" + R(x.getSeconds()) + MS(x, "getMilliseconds") + Z + '"'
                            } else {
                                return "new Date(" + [x.getFullYear(), x.getMonth(), x.getDate(), x.getHours(), x.getMinutes(), x.getSeconds(), x.getMilliseconds()].join(",") + ")"
                            }
                        }
                    } else {
                        if (_.isReg(x)) {
                            return String(x)
                        } else {
                            if (typeof x.serialize == F) {
                                x = x.serialize()
                            }
                            if (typeof x == O) {
                                if (x.nodeType) {
                                    return "document.getElementById('" + x.id + "')"
                                } else {
                                    a[0] = "{";
                                    for (i in x) {
                                        if (map[i] || (filter === true ? i.charAt(0) == "_" : typeof filter == "function" ? false === filter.call(x, x[i], i) : 0)) {
                                            continue
                                        }
                                        if (f = T[typeof (v = x[i])]) {
                                            if (typeof (v = f(v, filter, dateformat, deep + 1, max)) == S) {
                                                b[b.length] = T.string(i) + ":" + v
                                            }
                                        }
                                    }
                                    a[2] = "}"
                                }
                            } else {
                                return String(x)
                            }
                        }
                    }
                }
            }
            a[1] = b.join(", ");
            return a[0] + a[1] + a[2]
        }
        return "null"
    };
    T[F] = function (x) {
        return x.$path ? x.$path : String(x)
    };
    _.serialize = function (obj, filter, dateformat) {
        return T[typeof obj](obj, filter, dateformat || (xui && xui.$dateFormat)) || ""
    };
    _.stringify = function (obj, filter, dateformat) {
        return _.fromUTF8(_.serialize(obj, filter, dateformat))
    };
    _.unserialize = function (str, dateformat) {
        try {
            str = eval("({_:" + str + "})");
            if (dateformat || (xui && xui.$dateFormat)) {
                E(str)
            }
            return str._
        } catch (e) {
            return false
        }
    }
};
_.id = function () {
    var self = this,
        me = arguments.callee;
    if (self.constructor !== me || self.a) {
        return (me._ || (me._ = new me)).next()
    }
    self.a = [-1];
    self.b = [""];
    self.value = ""
};
_.id.prototype = {
    constructor: _.id,
    _chars: "abcdefghijklmnopqrstuvwxyz".split(""),
    next: function (i) {
        with(this) {
            i = (i || i === 0) ? i : b.length - 1;
            var m, k, l;
            if ((m = a[i]) >= 25) {
                m = 0;
                if (i === 0) {
                    a.splice(0, 0, 1);
                    b.splice(0, 0, "a");
                    l = a.length;
                    for (k = 1; k < l; ++k) {
                        a[k] = 0;
                        b[k] = "0"
                    }++i
                } else {
                    next(i - 1)
                }
            } else {
                ++m
            }
            a[i] = m;
            b[i] = _chars[m];
            return value = b.join("")
        }
    }
};
Class("xui.absBox", null, {
    Constructor: function () {
        if (arguments.callee.upper) {
            arguments.callee.upper.call(this)
        }
        this._nodes = []
    },
    Before: function (key) {
        var t = xui.absBox;
        if (t) {
            (t = t.$type)[key.replace("xui.", "")] = t[key] = key
        }
    },
    Instance: {
        __gc: function () {
            this._nodes = 0
        },
        _get: function (index) {
            var t = this._nodes;
            return _.isNumb(index) ? t[index] : t
        },
        _empty: function () {
            this._nodes.length = 0;
            return this
        },
        get: function (index) {
            return this._get(index)
        },
        size: function () {
            return this._nodes.length
        },
        _each: function (fun) {
            var self = this,
                n;
            for (var i = 0, j = self._nodes, l = j.length; i < l; i++) {
                if (n = j[i]) {
                    if (false === fun.call(self, n, i)) {
                        break
                    }
                }
            }
            n = null;
            return self
        },
        each: function (fun) {
            return this._each(fun)
        },
        isEmpty: function () {
            return !this._nodes.length
        },
        merge: function (obj) {
            if (this == xui.win || this == xui.doc || this == xui("body")) {
                return this
            }
            var self = this,
                c = self.constructor,
                obj = obj._nodes,
                i = 0,
                t, n = self._nodes;
            if (obj.length) {
                for (; t = obj[i++];) {
                    n[n.length] = t
                }
                self._nodes = c._unique(n)
            }
            return self
        },
        reBoxing: function (key, ensureValue) {
            var self = this,
                t = xui.absBox.$type[key || "Dom"];
            if (!t) {
                return xui.UI.pack([])
            }
            if (t == self.KEY) {
                return self
            }
            if (t = xui.SC(t)) {
                return t.pack(self._nodes, ensureValue)
            }
        }
    },
    Static: {
        $abstract: true,
        $type: {},
        pack: function (arr, ensureValue) {
            var o = new this(false);
            o._nodes = !arr ? [] : ensureValue === false ? arr.constructor == Array ? arr : [arr] : typeof this._ensureValues == "function" ? this._ensureValues(arr) : arr.constructor == Array ? arr : [arr];
            return o
        },
        _unique: function (arr) {
            var h = {},
                a = [],
                i = 0,
                t, k;
            for (; t = arr[i++];) {
                k = typeof t == "string" ? t : t.$xid;
                if (!h[k]) {
                    h[k] = 1;
                    a[a.length] = t
                }
            }
            return a
        },
        plugIn: function (name, fun) {
            this.prototype[name] = fun;
            return this
        }
    }
});
Class("xui.absProfile", null, {
    Constructor: function () {
        if (arguments.callee.upper) {
            arguments.callee.upper.call(this)
        }
        if (!this.$xid) {
            this.$xid = xui.absProfile.$xid.next()
        }
    },
    Instance: {
        getId: function () {
            return this.$xid
        },
        link: function (obj, id, target) {
            var self = this,
                uid = "$" + self.$xid;
            target = target || self;
            if (obj[uid]) {
                self.unLink(id)
            }
            obj[uid] = target;
            if (_.isArr(obj)) {
                obj.push(target)
            }
            self._links[id] = obj;
            return self
        },
        unLink: function (id) {
            var self = this,
                o, uid = "$" + self.$xid;
            if (!self._links) {
                return
            }
            if (!(o = self._links[id])) {
                return
            }
            if (_.isArr(o)) {
                _.arr.removeValue(o, o[uid])
            }
            delete o[uid];
            delete self._links[id];
            return self
        },
        unLinkAll: function () {
            var self = this,
                id = "$" + self.$xid,
                l = self._links,
                o, i;
            for (i in l) {
                o = l[i];
                if (_.isArr(o)) {
                    _.arr.removeValue(o, o[id])
                }
                delete o[id]
            }
            self._links = {};
            return self
        }
    },
    Static: {
        $xid: new _.id,
        $abstract: true
    }
});
Class("xui.Profile", "xui.absProfile", {
    Constructor: function (host, key, alias, box, properties, events, options) {
        arguments.callee.upper.apply(this, arguments);
        var self = this;
        _.merge(self, options);
        self.key = key || self.key || "";
        self.alias = alias || self.alias || "", self.properties = properties ? _.copy(properties) : (self.properties || {});
        self.events = events ? _.copy(events) : (self.events || {});
        self.host = host || self.host || self;
        self.box = box || self.box || self.constructor;
        if (self.events) {
            self.setEvents(self.events);
            delete self.events
        }
        self._links = {}
    },
    Instance: {
        setEvents: function (key, value) {
            var evs = this.box.$EventHandlers;
            if (_.isHash(key)) {
                return _.merge(this, key, "all", function (o, i) {
                    return evs[i]
                })
            } else {
                if (evs[key]) {
                    this[key] = value
                }
            }
        },
        getEvents: function (key) {
            if (key) {
                return this[key]
            } else {
                var self = this,
                    t, hash = {};
                _.each(self.box.$EventHandlers, function (o, i) {
                    if (self[i]) {
                        hash[i] = self[i]
                    }
                });
                return hash
            }
        },
        getProperties: function (key) {
            var prop = this.properties;
            return key ? prop[key] : _.copy(prop)
        },
        setProperties: function (key, value) {
            if (_.isHash(key)) {
                this.properties = key
            } else {
                this.properties[key] = value
            }
        },
        _applySetAction: function (fun, value) {
            return fun.call(this, value)
        },
        __gc: function () {
            var ns = this;
            ns.unLinkAll();
            _.tryF(ns.clearCache, [], ns);
            var o = _.get(ns, ["box", "_namePool"]);
            if (o) {
                delete o[self.alias]
            }
            _.breakO([ns.properties, ns.events, ns], 2);
            ns.destroyed = 1
        },
        boxing: function () {
            var self = this,
                t;
            if (!self.box) {
                return null
            }
            if (!((t = self._cacheInstance) && t.get(0) == self && t._nodes.length == 1)) {
                t = self._cacheInstance = self.box.pack([self], false)
            }
            return t
        },
        serialize: function (rtnString, keepHost) {
            var t, self = this,
                o = (t = self.box._beforeSerialized) ? t(self) : self,
                r = {
                    alias: o.alias,
                    key: o.key,
                    host: o.host
                };
            if (r.host === self) {
                delete r.host
            } else {
                if (o.host && !keepHost) {
                    if (rtnString !== false) {
                        r.host = "@this"
                    } else {
                        delete r.host
                    }
                }
            }
            var c = {},
                p = o.box.$DataStruct,
                map = xui.absObj.$specialChars;
            _.merge(c, o.properties, function (o, i) {
                return (i in p) && p[i] !== o && !map[i.charAt(0)]
            });
            if (!_.isEmpty(c)) {
                r.properties = c
            }
            if (!_.isEmpty(t = this.getEvents())) {
                r.events = t
            }
            var eh = o.box.$EventHandlers;
            _.filter(r.events, function (o, i) {
                return o != eh[i]
            });
            if (_.isEmpty(r.events)) {
                delete r.events
            }
            return rtnString === false ? r : _.serialize(r)
        }
    }
});
Class("xui.absObj", "xui.absBox", {
    Constructor: function () {
        arguments.callee.upper.apply(this, arguments);
        if (arguments[0] !== false && typeof this._ini == "function") {
            return this._ini.apply(this, arguments)
        }
    },
    Before: function (key, parent_key, o) {
        xui.absBox.$type[key] = key;
        return true
    },
    After: function () {
        var self = this,
            me = arguments.callee,
            temp, t, k, u, m, i, j, l, v, n, b;
        self._nameId = 0;
        self._namePool = {};
        self._nameTag = self.$nameTag || ("ctl_" + (t = self.KEY.split("."))[t.length - 1].toLowerCase());
        self._cache = [];
        if (self === xui.absObj || self === xui.absObj) {
            return
        }
        m = me.a1 || (me.a1 = _.toArr("$Keys,$DataStruct,$EventHandlers,$DataModel"));
        for (j = 0; v = m[j++];) {
            k = {};
            if ((t = self.$parent) && (i = t.length)) {
                while (i--) {
                    _.merge(k, t[i][v])
                }
            }
            self[v] = k
        }
        self.setDataModel(self.DataModel);
        delete self.DataModel;
        self.setEventHandlers(self.EventHandlers);
        delete self.EventHandlers;
        m = me.a5 || (me.a5 = _.toArr("RenderTrigger,LayoutTrigger"));
        for (j = 0; v = m[j++];) {
            temp = [];
            if ((t = self.$parent) && (l = t.length)) {
                for (i = 0; i < l; i++) {
                    u = t[i];
                    if (u = u["$" + v]) {
                        temp.push.apply(temp, u)
                    }
                }
            }
            if (self[v]) {
                temp.push(self[v])
            }
            self["$" + v] = temp;
            delete self[v]
        }
    },
    Static: {
        $abstract: true,
        $specialChars: {
            _: 1,
            $: 1
        },
        getAll: function () {
            return this.pack(this._cache)
        },
        pickAlias: function () {
            var t, p = this._namePool,
                a = this._nameTag;
            while (p[t = (a + (++this._nameId))]) {}
            return t
        },
        setDataModel: function (hash) {
            var self = this,
                sc = xui.absObj.$specialChars,
                ds = self.$DataStruct,
                properties = self.$DataModel,
                ps = self.prototype,
                i, j, t, o, n, m, r;
            for (i in hash) {
                if (!properties[i]) {
                    properties[i] = {}
                }
                o = hash[i];
                if (null === o || undefined === o) {
                    r = _.str.initial(i);
                    delete ds[i];
                    delete properties[i];
                    delete ps["get" + r];
                    delete ps["set" + r]
                } else {
                    t = typeof o;
                    if (t != "object" || o.constructor != Object) {
                        o = {
                            ini: o
                        }
                    }
                    ds[i] = ("ini" in o) ? o.ini : (i in ds) ? ds[i] : "";
                    t = properties[i];
                    for (j in t) {
                        if (!(j in o)) {
                            o[j] = t[j]
                        }
                    }
                    properties[i] = o
                }
            }
            _.each(hash, function (o, i) {
                if (null === o || undefined === o || sc[i.charAt(0)]) {
                    return
                }
                r = _.str.initial(i);
                n = "set" + r;
                if (!(o && (o.readonly || o.inner))) {
                    var $set = o.set;
                    m = ps[n];
                    ps[n] = (typeof $set != "function" && typeof m == "function") ? m : Class._fun(function (value, force) {
                        return this.each(function (v) {
                            if (!v.properties) {
                                return
                            }
                            if (v.properties[i] === value && !force) {
                                return
                            }
                            var ovalue = v.properties[i];
                            if (v.beforePropertyChanged && false === v.boxing().beforePropertyChanged(v, i, value, ovalue)) {
                                return
                            }
                            if (typeof $set == "function") {
                                $set.call(v, value, ovalue)
                            } else {
                                var m = _.get(v.box.$DataModel, [i, "action"]);
                                v.properties[i] = value;
                                if (typeof m == "function" && v._applySetAction(m, value, ovalue) === false) {
                                    v.properties[i] = ovalue
                                }
                            }
                            if (v.afterPropertyChanged) {
                                v.boxing().afterPropertyChanged(v, i, value, ovalue)
                            }
                        })
                    }, n, self.KEY, null, "instance");
                    delete o.set;
                    if (ps[n] !== m) {
                        ps[n].$auto$ = 1
                    }
                } else {
                    delete ps[n]
                }
                n = "get" + r;
                if (!(o && o.inner)) {
                    var $get = o.get;
                    m = ps[n];
                    ps[n] = (typeof $get != "function" && typeof m == "function") ? m : Class._fun(function () {
                        if (typeof $get == "function") {
                            return $get.call(this.get(0))
                        } else {
                            return this.get(0).properties[i]
                        }
                    }, n, self.KEY, null, "instance");
                    delete o.get;
                    if (ps[n] !== m) {
                        ps[n].$auto$ = 1
                    }
                } else {
                    delete ps[n]
                }
            });
            return self
        },
        setEventHandlers: function (hash) {
            var self = this;
            _.each(hash, function (o, i) {
                if (null === o) {
                    delete self.$EventHandlers[i];
                    delete self.prototype[i]
                } else {
                    self.$EventHandlers[i] = o;
                    var f = function (fun) {
                            var l = arguments.length;
                            if (l == 1 && (typeof fun == "function" || typeof fun == "string")) {
                                return this.each(function (v) {
                                    if (v.renderId) {
                                        v.clearCache()
                                    }
                                    v[i] = fun
                                })
                            } else {
                                if (l == 1 && null === fun) {
                                    return this.each(function (v) {
                                        v.clearCache();
                                        delete v[i]
                                    })
                                } else {
                                    var args = [],
                                        v = this.get(0),
                                        t = v[i],
                                        k = v.host || v,
                                        j;
                                    if (v.$inDesign) {
                                        return
                                    }
                                    if (arguments[0] != v) {
                                        args[0] = v
                                    }
                                    for (j = 0; j < l; j++) {
                                        args[args.length] = arguments[j]
                                    }
                                    v.$lastEvent = i;
                                    if (typeof t == "string") {
                                        t = k[t]
                                    }
                                    if (typeof t == "function") {
                                        return _.tryF(t, args, k)
                                    }
                                }
                            }
                        };
                    f.$event$ = 1;
                    f.$original$ = o.$original$ || self.KEY;
                    f.$name$ = i;
                    f.$type$ = "event";
                    self.plugIn(i, f)
                }
            });
            return self
        },
        unserialize: function (target, keepSerialId) {
            if (typeof target == "string") {
                target = _.unserialize(target)
            }
            var f = function (o) {
                    if (_.isArr(o)) {
                        o = o[0]
                    }
                    delete o.serialId;
                    if (o.children) {
                        _.arr.each(o.children, f)
                    }
                },
                a = [];
            _.arr.each(target, function (o) {
                if (!keepSerialId) {
                    f(o)
                }
                a.push((new(xui.SC(o.key))(o)).get(0))
            });
            return this.pack(a, false)
        }
    },
    Instance: {
        clone: function () {
            var arr = [],
                clrItems = arguments,
                f = function (p) {
                    delete p.alias;
                    for (var i = 0; i < clrItems.length; i++) {
                        delete p[clrItems[i]]
                    }
                    if (p.children) {
                        for (var i = 0, c; c = p.children[i]; i++) {
                            f(c[0])
                        }
                    }
                };
            this.each(function (o) {
                o = o.serialize(false, true);
                f(o);
                arr.push(o)
            });
            return this.constructor.unserialize(arr)
        },
        serialize: function (rtnString, keepHost) {
            var a = [];
            this.each(function (o) {
                a[a.length] = o.serialize(false, keepHost)
            });
            return rtnString === false ? a : a.length == 1 ? " new " + a[0].key + "(" + _.serialize(a[0]) + ")" : "xui.UI.unserialize(" + _.serialize(a) + ")"
        },
        setAlias: function (str) {
            var self = this,
                prf = this.get(0),
                old;
            if (old = prf.alias) {
                if (prf.host && prf.host !== prf) {
                    try {
                        delete prf.host[old]
                    } catch (e) {
                        prf.host[old] = undefined
                    }
                    if (prf.host._ctrlpool) {
                        delete prf.host._ctrlpool[old]
                    }
                }
                delete self.constructor._namePool[old]
            }
            self.constructor._namePool[prf.alias = str] = 1;
            if (prf.host && prf.host !== prf) {
                prf.host[str] = self;
                if (prf.host._ctrlpool) {
                    prf.host._ctrlpool[str] = self.get(0)
                }
            }
            return self
        },
        getAlias: function () {
            return this.get(0).alias
        },
        getProperties: function (key) {
            var h = {},
                prf = this.get(0),
                prop = prf.properties,
                funName;
            if (key === true) {
                return _.copy(prop)
            } else {
                if (typeof key == "string") {
                    return prop[key]
                } else {
                    for (var k in prop) {
                        funName = "get" + _.str.initial(k);
                        if (typeof this[funName] == "function") {
                            h[k] = this[funName].call(this)
                        }
                    }
                    return h
                }
            }
        },
        setProperties: function (key, value) {
            if (typeof key == "string") {
                var h = {};
                h[key] = value;
                key = h
            }
            return this.each(function (o) {
                _.each(key, function (v, k) {
                    var funName = "set" + _.str.initial(k),
                        ins = o.boxing();
                    if (typeof ins[funName] == "function") {
                        ins[funName].call(ins, v)
                    }
                })
            })
        },
        getEvents: function (key) {
            return this.get(0).getEvents(key)
        },
        setEvents: function (key, value) {
            if (typeof key == "string") {
                var h = {};
                h[key] = value;
                key = h
            }
            return this.each(function (o) {
                var ins = o.boxing();
                _.each(key, function (v, k) {
                    if (typeof ins[k] == "function") {
                        ins[k].call(ins, v)
                    }
                })
            })
        },
        alias: function (value) {
            return value ? this.setAlias(value) : this.getAlias()
        },
        host: function (value, alias) {
            return value ? this.setHost(value, alias) : this.getHost()
        },
        setHost: function (host, alias) {
            var self = this;
            self.get(0).host = host;
            if (alias) {
                self.setAlias(alias)
            }
            return self
        },
        getHost: function () {
            return this.get(0).host
        }
    }
});
Class("xui.DataBinder", "xui.absObj", {
    Instance: {
        _ini: function (properties, events, host) {
            var self = this,
                c = self.constructor,
                profile, options, np = c._namePool,
                alias, temp;
            if (properties && properties["xui.Profile"]) {
                profile = properties;
                alias = profile.alias || c.pickAlias()
            } else {
                if (properties && properties.key && xui.absBox.$type[properties.key]) {
                    options = properties;
                    properties = null;
                    alias = options.alias;
                    alias = (alias && !np[alias]) ? alias : c.pickAlias()
                } else {
                    alias = c.pickAlias()
                }
                profile = new xui.Profile(host, self.$key, alias, c, properties, events, options)
            }
            np[alias] = 1;
            profile._n = profile._n || [];
            for (var i in (temp = c.$DataStruct)) {
                if (!(i in profile.properties)) {
                    profile.properties[i] = typeof temp[i] == "object" ? _.copy(temp[i]) : temp[i]
                }
            }
            profile.link(c._cache, "self").link(xui._pool, "xui");
            if (!profile.name) {
                profile.boxing().setName(alias)
            }
            self._nodes.push(profile);
            profile._cacheInstance = self;
            return self
        },
        destroy: function () {
            this.each(function (profile) {
                var box = profile.box,
                    name = profile.properties.name;
                _.arr.each(profile._n, function (v) {
                    if (v) {
                        box._unBind(name, v)
                    }
                });
                delete box._pool[name];
                profile.__gc()
            })
        },
        getUI: function (key) {
            var r;
            if (!key) {
                r = xui.UI.pack(this.get(0)._n, false)
            } else {
                _.arr.each(this.get(0)._n, function (profile) {
                    if (profile.properties.dataField == key) {
                        r = profile.boxing();
                        return false
                    }
                })
            }
            return r
        },
        checkValid: function () {
            return xui.absValue.pack(this.get(0)._n, false).checkValid()
        },
        getUIValue: function (withCaption, dirtied) {
            var ns = this,
                prf = ns.get(0),
                hash = {};
            _.arr.each(prf._n, function (profile) {
                var p = profile.properties,
                    b = profile.boxing(),
                    uv = b.getUIValue();
                if (!dirtied || (uv + " ") !== (b.getValue() + " ")) {
                    if (withCaption && b.getCaption) {
                        hash[p.dataField] = {
                            value: uv,
                            caption: b.getCaption()
                        }
                    } else {
                        hash[p.dataField] = uv
                    }
                }
            });
            return hash
        },
        isDirtied: function () {
            var prf = this.get(0);
            for (var i = 0, l = prf._n.length; i < l; i++) {
                var profile = prf._n[i],
                    ins = profile.boxing();
                if ((ins.getUIValue() + " ") !== (ins.getValue() + " ")) {
                    return true
                }
            }
            return false
        },
        getDirtied: function (withCaption) {
            return this.getUIValue(withCaption, true)
        },
        updateValue: function () {
            xui.absValue.pack(this.get(0)._n, false).updateValue();
            return this
        },
        updateDataFromUI: function (updateUIValue, withCaption, returnArr, adjustData) {
            var ns = this,
                prf = ns.get(0),
                hash = {},
                mapb;
            _.arr.each(prf._n, function (profile) {
                var p = profile.properties,
                    b = profile.boxing(),
                    v = b.getValue(_.isBool(returnArr) ? returnArr : profile.__returnArray),
                    uv = b.getUIValue(_.isBool(returnArr) ? returnArr : profile.__returnArray);
                if (withCaption && b.getCaption) {
                    hash[p.dataField] = {
                        value: uv,
                        caption: b.getCaption()
                    }
                } else {
                    hash[p.dataField] = uv
                }
                if (updateUIValue !== false && profile.renderId) {
                    b.updateValue()
                }
            });
            if (adjustData) {
                hash = _.tryF(adjustData, [hash, prf], this)
            }
            if (prf.afterUpdateDataFromUI) {
                mapb = this.afterUpdateDataFromUI(prf, hash);
                if (_.isHash(mapb)) {
                    hash = mapb
                }
                mapb = null
            }
            _.merge(prf.properties.data, hash, "all");
            return ns
        },
        updateDataToUI: function (adjustData) {
            var t, p, v, c, b, ns = this,
                prf = ns.get(0),
                prop = prf.properties,
                map = {},
                mapb, vs = {};
            _.merge(map, prop.data);
            if (adjustData) {
                map = _.tryF(adjustData, [map, prf], ns)
            }
            if (prf.beforeUpdateDataToUI) {
                mapb = ns.beforeUpdateDataToUI(prf, map);
                if (_.isHash(mapb)) {
                    map = mapb
                }
                mapb = null
            }
            _.arr.each(prf._n, function (profile) {
                p = profile.properties;
                t = p.dataField;
                v = (map && t in map) ? map[t] : "";
                vs[t] = v;
                c = null;
                b = profile.boxing();
                if (_.isHash(v)) {
                    c = _.isSet(v.caption) ? v.caption : null;
                    v = v.value
                }
                b.resetValue(v);
                profile.__returnArray = _.isArr(v);
                if (!_.isSet(p.caption) && b.setCaption) {
                    _.tryF(b.setCaption, [c, true], b)
                }
            });
            _.merge(prop.data, vs, "all");
            return ns
        },
        setHost: function (value, alias) {
            var self = this;
            if (value && alias) {
                self.setName(alias)
            }
            return arguments.callee.upper.apply(self, arguments)
        },
        invoke: function (onSuccess, onFail, onStart, onEnd, mode, threadid, options) {
            var ns = this,
                con = ns.constructor,
                prf = ns.get(0),
                prop = prf.properties,
                dsType = prop.dataSourceType,
                responseType = prop.responseType,
                requestType = prop.requestType,
                hashModel = _.isSet(prop.queryModel) && prop.queryModel !== "",
                queryURL = (hashModel ? (((prop.queryURL.lastIndexOf("/") != prop.queryURL.length - 1) ? (prop.queryURL + "/") : prop.queryURL) + prop.queryModel) : prop.queryURL),
                queryUserName = prop.queryUserName;
            queryPasswrod = prop.queryPasswrod;
            queryArgs = _.copy(prop.queryArgs), queryOptions = _.copy(prop.queryOptions);
            if (dsType != "remoting") {
                return
            }
            if (prf.beforeInvoke && false === prf.boxing().beforeInvoke(prf)) {
                return
            }
            var proxyType, rMap = {};
            if (responseType == "SOAP" || requestType == "SOAP") {
                if (!con.WDSLCache) {
                    con.WDSLCache = {}
                }
                if (!con.WDSLCache[queryURL]) {
                    var wsdl = xui.SOAP.getWsdl(queryURL, function (rspData) {
                        if (prf.afterInvoke) {
                            prf.boxing().afterInvoke(prf, rspData)
                        }
                        _.tryF(onFail, arguments, this);
                        _.tryF(onEnd, arguments, this)
                    });
                    if (wsdl) {
                        con.WDSLCache[queryURL] = wsdl
                    } else {
                        return
                    }
                }
            }
            switch (responseType) {
            case "JSON":
                rMap.rspType = "json";
                break;
            case "XML":
                proxyType = "ajax";
                rMap.rspType = "xml";
                break;
            case "SOAP":
                proxyType = "ajax";
                rMap.rspType = "xml";
                var namespace = xui.SOAP.getNameSpace(con.WDSLCache[queryURL]),
                    action = ((namespace.lastIndexOf("/") != namespace.length - 1) ? namespace + "/" : namespace) + (queryArgs.methodName || "");
                rMap.header = rMap.header || {};
                rMap.header.SOAPAction = action;
                break
            }
            switch (requestType) {
            case "HTTP":
                queryArgs = typeof queryArgs == "string" ? _.unserialize(queryArgs) : queryArgs;
                break;
            case "JSON":
                rMap.reqType = "json";
                if (prop.queryMethod == "auto") {
                    rMap.method = "POST"
                }
                queryArgs = typeof queryArgs == "string" ? queryArgs : _.serialize(queryArgs);
                break;
            case "XML":
                rMap.reqType = "xml";
                proxyType = "ajax";
                rMap.method = "POST";
                if (queryUserName && queryPassword) {
                    rMap.username = queryUserName;
                    rMap.password = queryPassword;
                    rMap.header = rMap.header || {};
                    rMap.header.Authorization = "Basic " + con._toBase64(queryUserName + ":" + queryPassword)
                }
                queryArgs = typeof queryArgs == "string" ? queryArgs : xui.XMLRPC.wrapRequest(queryArgs);
                break;
            case "SOAP":
                rMap.reqType = "xml";
                proxyType = "ajax";
                rMap.method = "POST";
                if (queryUserName && queryPassword) {
                    rMap.username = queryUserName;
                    rMap.password = queryPassword;
                    rMap.header = rMap.header || {};
                    rMap.header.Authorization = "Basic " + con._toBase64(queryUserName + ":" + queryPassword)
                }
                queryArgs = typeof queryArgs == "string" ? queryArgs : xui.SOAP.wrapRequest(queryArgs, con.WDSLCache[queryURL]);
                break
            }
            if (!proxyType && prop.proxyType != "auto") {
                proxyType = prop.proxyType
            }
            if (proxyType != "ajax") {
                rMap.asy = true
            }
            if (proxyType == "sajax") {
                rMap.method = "GET"
            }
            if (proxyType) {
                proxyType = proxyType.toLowerCase()
            }
            options = options || {};
            if (!("asy" in options)) {
                options.asy = !! prop.queryAsync
            }
            if (!("method" in options) && prop.queryMethod != "auto") {
                options.method = prop.queryMethod
            }
            if (!("onEnd" in options)) {
                options.onEnd = onEnd
            }
            if (!("onStart" in options)) {
                options.onStart = onStart
            }
            _.merge(options, queryOptions);
            _.merge(options, rMap, "all");
            var ajax = (proxyType ? (proxyType == "sajax" ? xui.SAjax : proxyType == "iajax" ? xui.IAjax : xui.Ajax) : ((function (d) {
                if (!_.isHash(d)) {
                    return 0
                }
                for (var i in d) {
                    if (d[i] && d[i].nodeType == 1) {
                        return 1
                    }
                }
            })(queryArgs)) ? xui.IAjax : (options && options.method && options.method.toLowerCase() == "post") ? xui.absIO.isCrossDomain(queryURL) ? xui.IAjax : xui.Ajax : xui.absIO.isCrossDomain(queryURL) ? xui.SAjax : xui.Ajax).apply(null, [queryURL, queryArgs, function (rspData) {
                var mapb;
                if (prf.afterInvoke) {
                    mapb = prf.boxing().afterInvoke(prf, rspData);
                    if (_.isSet(mapb)) {
                        rspData = mapb
                    }
                    mapb = null
                }
                if (dsType == "remoting" && !_.isHash(rspData) && !_.isStr(rspData)) {
                    if (responseType == "XML") {
                        rspData = xui.XMLRPC.parseResponse(rspData)
                    } else {
                        if (responseType == "SOAP") {
                            rspData = xui.SOAP.parseResponse(rspData, queryArgs.methodName, con.WDSLCache[queryURL])
                        }
                    }
                }
                _.tryF(onSuccess, arguments, this)
            }, function (rspData) {
                if (prf.afterInvoke) {
                    prf.boxing().afterInvoke(prf, rspData)
                }
                _.tryF(onFail, arguments, this)
            },
            threadid, options]);
            if (mode == "busy") {
                _.observableRun(function (threadid) {
                    ajax.start()
                })
            } else {
                if (mode == "return") {
                    return ajax
                } else {
                    ajax.start()
                }
            }
        },
        read: function (onSuccess, onFail, onStart, onEnd, mode, threadid, options, adjustData) {
            var ns = this,
                prf = ns.get(0),
                prop = prf.properties,
                dsType = prop.dataSourceType;
            if (dsType == "none" || dsType == "memory") {
                return
            }
            if (prf.beforeRead && false === prf.boxing().beforeRead(prf)) {
                return
            }
            return ns.invoke(function (rspData) {
                var mapb;
                if (prf.afterRead) {
                    mapb = prf.boxing().afterRead(prf, rspData);
                    if (_.isSet(mapb)) {
                        rspData = mapb
                    }
                    mapb = null
                }
                if (_.isHash(rspData)) {
                    prf.boxing().setData(rspData).updateDataToUI(adjustData)
                }
                _.tryF(onSuccess, arguments, this)
            }, onFail, onStart, onEnd, mode, threadid, options)
        },
        write: function (onSuccess, onFail, onStart, onEnd, mode, threadid, options) {
            var ns = this,
                prf = ns.get(0),
                dsType = prf.properties.dataSourceType;
            if (dsType == "none" || dsType == "memory") {
                return
            }
            if (prf.beforeWrite && false === prf.boxing().beforeWrite(prf)) {
                return
            }
            return ns.invoke(function (rspData) {
                var mapb;
                if (prf.afterWrite) {
                    mapb = prf.boxing().afterWrite(prf, rspData);
                    if (_.isSet(mapb)) {
                        rspData = mapb
                    }
                    mapb = null
                }
                _.tryF(onSuccess, arguments, this)
            }, onFail, onStart, onEnd, mode, threadid, options)
        },
        getData: function (key) {
            var prf = this.get(0),
                data = prf.properties.data;
            return _.isSet(key) ? data[key] : data
        },
        setData: function (key, value) {
            var prop = this.get(0).properties;
            if (key === false) {
                _.each(prop.data, function (o, i) {
                    prop.data[i] = null
                })
            } else {
                if (!_.isSet(key)) {
                    prop.data = {}
                } else {
                    if (_.isHash(key)) {
                        prop.data = key
                    } else {
                        prop.data[key] = value
                    }
                }
            }
            return this
        }
    },
    Static: {
        WDSLCache: {},
        $nameTag: "databinder_",
        _pool: {},
        destroyAll: function () {
            this.pack(_.toArr(this._pool, false), false).destroy();
            this._pool = {}
        },
        getFromName: function (name) {
            var o = this._pool[name];
            return o && o.boxing()
        },
        _toBase64: function (str) {
            var keyStr = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",
                arr = [],
                i = 0,
                c1, c2, c3, e1, e2, e3, e4;
            do {
                c1 = str.charCodeAt(i++);
                c2 = str.charCodeAt(i++);
                c3 = str.charCodeAt(i++);
                e1 = c1 >> 2;
                e2 = ((c1 & 3) << 4) | (c2 >> 4);
                e3 = ((c2 & 15) << 2) | (c3 >> 6);
                e4 = c3 & 63;
                if (isNaN(c2)) {
                    e3 = e4 = 64
                } else {
                    if (isNaN(c3)) {
                        e4 = 64
                    }
                }
                arr.push(keyStr.charAt(e1) + keyStr.charAt(e2) + keyStr.charAt(e3) + keyStr.charAt(e4))
            } while (i < str.length);
            return arr.join("")
        },
        _bind: function (name, profile) {
            var t, v, o = this._pool[name];
            if (!o) {
                o = new xui.DataBinder();
                o.setName(name);
                o = o.get(0)
            }
            var map = o.properties.data;
            if (profile) {
                if (_.arr.indexOf(o._n, profile) == -1) {
                    profile.link(o._n, "databinder." + name)
                }
                var p = profile.properties,
                    c, b;
                if (t = p.dataField) {
                    v = (map && t in map) ? map[t] : (p.value || "");
                    map[t] = v;
                    c = null;
                    b = profile.boxing();
                    if (_.isHash(v)) {
                        c = _.isSet(v.caption) ? v.caption : null;
                        v = v.value
                    }
                    b.resetValue(v);
                    if (!_.isSet(p.caption) && b.setCaption) {
                        _.tryF(b.setCaption, [c, true], b)
                    }
                }
            }
        },
        _unBind: function (name, profile) {
            if (profile && profile.box && this._pool[name]) {
                profile.unLink("databinder." + name)
            }
        },
        _beforeSerialized: function (profile) {
            var o = {};
            _.merge(o, profile, "all");
            var p = o.properties = _.copy(profile.properties);
            if (p.dataSourceType != "memory") {
                delete p.data
            }
            if (p.dataSourceType == "none" && p.dataSourceType == "memory") {
                delete p.queryURL;
                delete p.queryUserName;
                delete p.queryPassword;
                delete p.queryModel;
                delete p.queryArgs;
                delete p.queryOptions;
                delete p.proxyType;
                delete p.queryAsync;
                delete p.queryMethod;
                delete p.requestType;
                delete p.responseType
            }
            if (p.data && _.isEmpty(p.data)) {
                delete p.data
            }
            if (p.queryArgs && _.isEmpty(p.queryArgs)) {
                delete p.queryArgs
            }
            if (p.queryOptions && _.isEmpty(p.queryOptions)) {
                delete p.queryOptions
            }
            return o
        },
        DataModel: {
            data: {
                ini: {}
            },
            dataSourceType: {
                ini: "none",
                listbox: ["none", "memory", "remoting"]
            },
            queryURL: {
                ini: ""
            },
            queryUserName: {
                ini: ""
            },
            queryPassword: {
                ini: ""
            },
            queryModel: "",
            queryMethod: {
                ini: "auto",
                listbox: ["auto", "GET", "POST"]
            },
            queryAsync: true,
            requestType: {
                ini: "HTTP",
                listbox: ["HTTP", "JSON", "XML", "SOAP"]
            },
            responseType: {
                ini: "JSON",
                listbox: ["JSON", "XML", "SOAP"]
            },
            queryArgs: {
                ini: {}
            },
            queryOptions: {
                ini: {}
            },
            proxyType: {
                ini: "auto",
                listbox: ["auto", "Ajax", "SAjax", "IAjax"]
            },
            name: {
                set: function (value, ovalue) {
                    var o = this,
                        c = xui.DataBinder,
                        _p = c._pool,
                        _old = _p[ovalue],
                        _new = _p[value],
                        ui;
                    _p[o.properties.name = value] = o;
                    if (_old && !_new && o._n.length) {
                        ui = xui.absValue.pack(_.copy(o._n));
                        _.arr.each(o._n, function (v) {
                            c._unBind(ovalue, v)
                        });
                        ui.setDataBinder(value)
                    }
                    if (_new && !_old) {
                        o._n = _new._n
                    }
                    if (_old) {
                        delete _p[ovalue]
                    }
                }
            },
            proxyInvoker: {
                inner: true,
                trigger: function () {
                    this.read(null, null, null, null, true)
                }
            }
        },
        EventHandlers: {
            beforeUpdateDataToUI: function (profile, dataToUI) {},
            afterUpdateDataFromUI: function (profile, dataFromUI) {},
            beforeInvoke: function (profile) {},
            afterInvoke: function (profile, rspData) {},
            beforeRead: function (profile) {},
            afterRead: function (profile, rspData) {},
            beforeWrite: function (profile) {},
            afterWrite: function (profile, rspData) {}
        }
    }
});
Class("xui.Event", null, {
    Constructor: function (event, node, fordrag, tid) {
        var self = xui.Event,
            dd = 0,
            id, t, dragdrop = xui.DragDrop,
            src, type, pre, obj;
        if (!(event = event || window.event) || !(src = node)) {
            src = node = null;
            return false
        }
        node = null;
        type = event.type;
        if (xui.browser.isTouch && self.__realtouch) {
            if (("mousedown" == type || "dblclick" == type) && !self.__simulatedMousedown) {
                return false
            }
        }
        if ("mouseover" == type || "mouseout" == type) {
            dd = (dragdrop && dragdrop._profile.isWorking) ? 1 : 2;
            if (dd != 1 && fordrag) {
                src = null;
                return self.$FALSE
            }
            if (!self._handleMouseHover(event, src, dd == 1)) {
                src = null;
                return self.$FALSE
            }
            if (dd == 1) {
                pre = dragdrop && dragdrop._dropElement
            }
        } else {
            if ((obj = self._tabHookStack).length && self._kb[type] && (event.$key || event.keyCode || event.charCode) == 9 && false === self._handleTabHook(self.getSrc(event), obj = obj[obj.length - 1])) {
                src = null;
                return
            }
        }
        id = tid || self.getId(src);
        if (obj = self._getProfile(id)) {
            if (type == "DOMMouseScroll") {
                type = "mousewheel"
            }
            if (type == "mousedown" || type == "mousewheel") {
                _.tryF(xui.Dom._blurTrigger, [obj, event])
            } else {
                if (type == "resize") {
                    type = "size";
                    if (xui.browser.ie && window === src) {
                        var w = xui.browser.contentBox && document.documentElement.clientWidth || document.body.clientWidth,
                            h = xui.browser.contentBox && document.documentElement.clientHeight || document.body.clientHeight;
                        if (obj._w == w && obj._h == h) {
                            src = null;
                            return
                        }
                        obj._w = w;
                        obj._h = h
                    }
                }
            }
            var j, f, name, r = true,
                funs = [];
            for (j = 0; j <= 2; ++j) {
                if (dd == 1 && j !== 0 && !event.$force) {
                    break
                }
                if (dd == 2 && j === 0) {
                    continue
                }
                name = self._type[type + j] || (self._type[type + j] = self._getEventName(type, j));
                if (!event.$e || event.$all || (name == event.$name)) {
                    obj._getEV(funs, id, name, src.$xid)
                }
            }
            f = function (a, b) {
                for (var i = 0, v; v = arguments.callee.tasks[i++];) {
                    if (false === v(obj, a, b)) {
                        return false
                    }
                }
                return true
            };
            f.tasks = funs;
            r = f(event, src.$xid);
            if (dragdrop) {
                if (type == "drag") {
                    dragdrop._onDrag = f
                } else {
                    if (type == "dragover") {
                        dragdrop._onDragover = f
                    }
                }
            } else {
                f.tasks.length = 0;
                delete f.tasks;
                f = null
            }
            if (dd == 1) {
                if ("mouseover" == type && dragdrop._dropElement == src.$xid && pre && pre != src.$xid) {
                    t = xui.use(pre).get(0);
                    self({
                        type: "mouseout",
                        target: t,
                        $e: true,
                        $name: "beforeMouseout",
                        preventDefault: function () {
                            this.returnValue = false
                        },
                        stopPropagation: function () {
                            this.cancelBubble = true
                        }
                    }, t);
                    dragdrop.setDropElement(src.$xid)
                }
                if ("mouseout" == type && !dragdrop._dropElement && pre && pre == src.$xid) {
                    self._preDroppable = id;
                    _.asyRun(function () {
                        delete xui.Event._preDroppable
                    })
                }
                if (src.$xid == dragdrop._dropElement) {
                    r = false
                }
            }
            if (r === false) {
                self.stopBubble(event)
            }
            src = null;
            return r
        }
    },
    Static: {
        $FALSE: xui.browser.opr ? undefined : false,
        _type: {},
        _kb: {
            keydown: 1,
            keypress: 1,
            keyup: 1
        },
        _reg: /(-[\w]+)|([\w]+$)/g,
        $eventhandler: function () {
            return xui.Event(arguments[0], this)
        },
        $eventhandler2: function () {
            return xui.Event(arguments[0], this, 1)
        },
        $eventhandler3: function () {
            return xui.Event(arguments[0], xui.Event.getSrc(arguments[0] || window.event))
        },
        _events: ("mouseover,mouseout,mousedown,mouseup,mousemove,mousewheel,click,dblclick,contextmenu,keydown,keypress,keyup,scroll,blur,focus,load,unload,abort,change,select,submit,reset,error,move,size,dragbegin,drag,dragstop,dragleave,dragenter,dragover,drop,touchstart,touchmove,touchend,touchcancel").split(","),
        _getEventName: function (name, pos) {
            return (name = this._map1[name]) && ((pos === 0 || pos == 1 || pos == 2) ? name[pos] : name)
        },
        _getProfile: function (id, a, b) {
            return id && (typeof id == "string") && ((a = (b = xui.$cache.profileMap)[id]) ? a["xui.UIProfile"] ? a : (b = b[id.replace(this._reg, "")]) ? b : a : b[id.replace(this._reg, "")])
        },
        _handleTabHook: function (src, target) {
            if (src === document) {
                return true
            }
            var node = src,
                r, tabindex = node.tabIndex;
            do {
                if (xui.getId(node) == target[0]) {
                    node = src = null;
                    return true
                }
            } while (node && (node = node.parentNode) && node !== document && node !== window);
            r = _.tryF(target[1], [target[0], tabindex], src);
            node = src = null;
            return false
        },
        _handleMouseHover: function (event, target, dd) {
            if (target == document) {
                target = null;
                return true
            }
            var node = (event.type == "mouseover" ? event.fromElement : event.toElement) || event.relatedTarget;
            if (dd && event.type == "mouseover" && this._preDroppable) {
                try {
                    do {
                        if (node && node.id && node.id == this._preDroppable) {
                            target = node = null;
                            return true
                        }
                    } while (node && (node = node.parentNode) && node !== document && node !== window)
                } catch (a) {}
            }
            if (xui.browser.gek) {
                try {
                    do {
                        if (node == target) {
                            target = node = null;
                            return false
                        }
                    } while (node && (node = node.parentNode))
                } catch (a) {
                    var pos = this.getPos(event),
                        node = xui([target]),
                        p = node.offset(),
                        s = node.cssSize(),
                        out = (pos.left < p.left || pos.left > p.left + s.width || pos.top < p.top || pos.top > p.top + s.height);
                    target = node = null;
                    return event.type == "mouseover" ? !out : out
                }
            } else {
                do {
                    if (node == target) {
                        target = node = null;
                        return false
                    }
                } while (node && (node = node.parentNode))
            }
            target = node = null;
            return true
        },
        _tabHookStack: [],
        pushTabOutTrigger: function (boundary, trigger) {
            this._tabHookStack.push([xui(boundary)._nodes[0], trigger]);
            return this
        },
        popTabOutTrigger: function (flag) {
            if (flag) {
                this._tabHookStack = []
            } else {
                this._tabHookStack.pop()
            }
            return this
        },
        getSrc: function (event) {
            var a;
            return ((a = event.target || event.srcElement || null) && xui.browser.kde && a.nodeType == 3) ? a.parentNode : a
        },
        getId: function (node) {
            return window === node ? "!window" : document === node ? "!document" : node.id
        },
        getBtn: function (event) {
            return xui.browser.ie ? event.button == 4 ? "middle" : event.button == 2 ? "right" : "left" : event.which == 2 ? "middle" : event.which == 3 ? "right" : "left"
        },
        getPos: function (event) {
            event = event || window.event;
            if (xui.browser.isTouch && event.changedTouches && event.changedTouches[0]) {
                event = event.changedTouches[0]
            }
            if ("pageX" in event) {
                return {
                    left: event.pageX,
                    top: event.pageY
                }
            } else {
                var d = document,
                    doc = d.documentElement,
                    body = d.body,
                    _L = (doc && doc.scrollLeft || body && body.scrollLeft || 0) - (doc.clientLeft || 0),
                    _T = (doc && doc.scrollTop || body && body.scrollTop || 0) - (doc.clientTop || 0);
                return {
                    left: event.clientX + _L,
                    top: event.clientY + _T
                }
            }
        },
        getKey: function (event) {
            event = event || window.event;
            var res = [],
                t, k = event.$key || event.keyCode || event.charCode || 0;
            if (typeof k == "string") {
                res[0] = k
            } else {
                var key = String.fromCharCode(k),
                    type = event.type;
                if ((type == "keypress" && k >= 33 && k <= 128) || ((k >= 48 && k <= 57) || (k >= 65 && k <= 90))) {
                    res[0] = key
                } else {
                    if (!(t = arguments.callee.map)) {
                        t = arguments.callee.map = {};
                        var k, arr = ("3,enter,8,backspace,9,tab,12,numlock,13,enter,19,pause,20,capslock,27,esc,32, ,33,pageup,34,pagedown,35,end,36,home,37,left,38,up,39,right,40,down,44,printscreen,45,insert,46,delete,50,down,52,left,54,right,56,up,91,win,92,win,93,apps,96,0,97,1,98,2,99,3,100,4,101,5,102,6,103,7,104,8,105,9,106,*,107,+,109,-,110,.,111,/,112,f1,113,f2,114,f3,115,f4,116,f5,117,f6,118,f7,119,f8,120,f9,121,f10,122,f11,123,f12,144,numlock,145,scroll,186,;,187,=,189,-,190,.,191,/,192,`,219,[,220,\\,221,],222,',224,meta,63289,numlock,63276,pageup,63277,pagedown,63275,end,63273,home,63234,left,63232,up,63235,right,63233,down,63272,delete,63302,insert,63236,f1,63237,f2,63238,f3,63239,f4,63240,f5,63241,f6,63242,f7,63243,f8,63244,f9,63245,f10,63246,f11,63247,f12,63248,print").split(",");
                        for (var i = 1, l = arr.length; i < l; i = i + 2) {
                            t[arr[i - 1]] = arr[i]
                        }
                        arr.length = 0;
                        t[188] = ","
                    }
                    res[0] = t[k] || key
                }
            }
            if ((event.modifiers) ? (event.modifiers & Event.CONTROL_MASK) : (event.ctrlKey || event.ctrlLeft || k == 17 || k == 57391)) {
                if (k == 17 || k == 57391) {
                    res[0] = ""
                }
                res.push("1")
            } else {
                res.push("")
            }
            if ((event.modifiers) ? (event.modifiers & Event.SHIFT_MASK) : (event.shiftKey || event.shiftLeft || k == 16 || k == 57390)) {
                if (k == 16 || k == 57390) {
                    res[0] = ""
                }
                res.push("1")
            } else {
                res.push("")
            }
            if ((event.modifiers) ? false : (event.altKey || event.altLeft || k == 18 || k == 57388)) {
                if (k == 18 || k == 57388) {
                    res[0] = ""
                }
                res.push("1")
            } else {
                res.push("")
            }
            res[0] = res[0];
            res.key = res[0];
            res.type = type;
            res.ctrlKey = !! res[1];
            res.shiftKey = !! res[2];
            res.altKey = !! res[3];
            if (type == "keypress") {
                if (this.$keydownchar && this.$keydownchar.length > 1) {
                    res.key = this.$keydownchar
                }
            } else {
                if (type == "keydown") {
                    if (res[0].length > 1) {
                        this.$keydownchar = res[0]
                    } else {
                        if (this.$keydownchar) {
                            this.$keydownchar = null
                        }
                    }
                } else {
                    if (type == "keyup") {
                        if (this.$keydownchar) {
                            this.$keydownchar = null
                        }
                    }
                }
            }
            return res
        },
        getEventPara: function (event, mousePos) {
            if (!mousePos) {
                mousePos = xui.Event.getPos(event)
            }
            var keys = this.getKey(event),
                h = {
                    pageX: mousePos && mousePos.left,
                    pageY: mousePos && mousePos.top,
                    keyCode: keys.key,
                    ctrlKey: keys.ctrlKey,
                    shiftKey: keys.shiftKey,
                    altKey: keys[3].altKey
                };
            for (var i in event) {
                if (i.charAt(0) == "$") {
                    h[i] = event[i]
                }
            }
            return h
        },
        stopBubble: function (event) {
            event = event || window.event;
            if (event.stopPropagation) {
                event.stopPropagation()
            }
            event.cancelBubble = true;
            this.stopDefault(event)
        },
        stopDefault: function (event) {
            event = event || window.event;
            if (event.preventDefault) {
                event.preventDefault()
            }
            event.returnValue = false
        },
        keyboardHook: function (key, ctrl, shift, alt, fun, args, scope, host) {
            if (key) {
                var p = xui.$cache.hookKey,
                    k = (key || "").toLowerCase() + ":" + (ctrl ? "1" : "") + ":" + (shift ? "1" : "") + ":" + (alt ? "1" : "");
                if (typeof fun != "function") {
                    delete p[k]
                } else {
                    p[k] = [fun, args, scope, host]
                }
            }
            return this
        },
        keyboardHookUp: function (key, ctrl, shift, alt, fun, args, scope, host) {
            if (key) {
                var p = xui.$cache.hookKeyUp,
                    k = (key || "").toLowerCase() + ":" + (ctrl ? "1" : "") + ":" + (shift ? "1" : "") + ":" + (alt ? "1" : "");
                if (typeof fun != "function") {
                    delete p[k]
                } else {
                    p[k] = [fun, args, scope, host]
                }
            }
            return this
        },
        getWheelDelta: function (e) {
            return e.wheelDelta ? e.wheelDelta / 120 : -e.detail / 3
        },
        _simulateMousedown: function (event) {
            if (xui.Event.__simulatedMousedown) {
                return
            }
            var touches = event.changedTouches,
                first = touches[0],
                type = "mousedown";
            var evn = document.createEvent("MouseEvent");
            evn.initMouseEvent(type, true, true, window, 1, first.screenX, first.screenY, first.clientX, first.clientY, false, false, false, false, 0, null);
            xui.Event.__realtouch = 1;
            xui.Event.__simulatedMousedown = 1;
            first.target.dispatchEvent(evn);
            xui.Event.__simulatedMousedown = 0
        },
        _simulateFocus: function (event) {
            var touches = event.changedTouches,
                first = touches[0];
            if (first.target.tagName == "INPUT") {
                switch (first.target.type) {
                case "button":
                    event.preventDefault();
                    var evn = document.createEvent("MouseEvent"),
                        type = "click";
                    evn.initMouseEvent(type, true, true, window, 1, first.screenX, first.screenY, first.clientX, first.clientY, false, false, false, false, 0, null);
                    xui.Event.__simulatedClick = 1;
                    first.target.dispatchEvent(evn);
                    xui.Event.__simulatedClick = 0;
                    break;
                default:
                    first.target.focus()
                }
            }
        },
        stopPageTouchmove: function () {
            document.addEventListener("touchmove", function (e) {
                e.preventDefault()
            })
        }
    },
    Initialize: function () {
        var ns = this;
        var m1 = {
            move: null,
            size: null,
            drag: null,
            dragstop: null,
            dragover: null,
            mousewheel: null,
            dragbegin: "onmousedown",
            dragenter: "onmouseover",
            dragleave: "onmouseout",
            drop: "onmouseup"
        },
            a1 = ["before", "on", "after"],
            t1, t2, s;
        t1 = ns._map1 = {};
        _.arr.each(ns._events, function (o) {
            s = _.str.initial(o);
            t1[o] = [a1[0] + s, a1[1] + s, a1[2] + s]
        });
        t1 = ns._eventMap = {};
        t2 = ns._eventHandler = {};
        _.arr.each(ns._events, function (o) {
            s = _.str.initial(o);
            t1[o] = t1[a1[1] + o] = t1[a1[0] + s] = t1[a1[1] + s] = t1[a1[2] + s] = o;
            t2[o] = t2[a1[1] + o] = t2[a1[0] + s] = t2[a1[1] + s] = t2[a1[2] + s] = (o in m1) ? m1[o] : ("on" + o)
        });
        window.onresize = ns.$eventhandler;
        if (window.addEventListener) {
            window.addEventListener("DOMMouseScroll", ns.$eventhandler3, false)
        }
        document.onmousewheel = window.onmousewheel = ns.$eventhandler3;
        if (xui.browser.isTouch) {
            document.addEventListener("touchstart", xui.Event._simulateMousedown, true);
            if (xui.browser.isAndroid || xui.browser.isBB) {
                document.addEventListener("touchend", xui.Event._simulateFocus, true)
            }
        }
    }
});
Class("xui.Date", null, {
    Initialize: function () {
        var self = this;
        self._mapKeys(self.$TIMEUNIT);
        var a = self._key1,
            b = self._key2,
            u = self.$UNIT = {};
        for (var i = 0, l = a.length; i < l; i++) {
            u[a[i]] = 1
        }
        for (var i = 0, l = b.length; i < l; i++) {
            u[b[i]] = 1
        }
        u.w = 1
    },
    Static: {
        _key1: "MILLISECOND,SECOND,MINUTE,HOUR,DAY,WEEK,MONTH,QUARTER,YEAR,DECADE,CENTURY".split(","),
        _key2: "ms,s,n,h,d,ww,m,q,y,de,c".split(","),
        $TIMEUNIT: {
            MILLISECOND: 1,
            SECOND: 1000,
            MINUTE: 60000,
            HOUR: 3600000,
            DAY: 86400000,
            WEEK: 604800000,
            MONTH: 2592000000,
            QUARTER: 7776000000,
            YEAR: 31557600000,
            DECADE: 315576000000,
            CENTURY: 3155760000000
        },
        $TEXTFORMAT: {
            utciso: function (d, w, f) {
                f = xui.Date._fix;
                return d.getUTCFullYear() + "-" + f(d.getUTCMonth() + 1) + "-" + f(d.getUTCDate()) + "T" + f(d.getUTCHours()) + ":" + f(d.getUTCMinutes()) + ":" + f(d.getUTCSeconds()) + "Z"
            },
            iso: function (d, w, f) {
                f = xui.Date._fix;
                return d.getFullYear() + "-" + f(d.getMonth() + 1) + "-" + f(d.getDate()) + "T" + f(d.getHours()) + ":" + f(d.getMinutes()) + ":" + f(d.getSeconds())
            },
            ms: function (d, w) {
                return xui.Date._fix(d.getMilliseconds(), 3) + (w ? "" : xui.wrapRes("date.MS"))
            },
            s: function (d, w) {
                return d.getSeconds() + (w ? "" : xui.wrapRes("date.S"))
            },
            ss: function (d, w) {
                return xui.Date._fix(d.getSeconds()) + (w ? "" : xui.wrapRes("date.S"))
            },
            n: function (d, w) {
                return d.getMinutes() + (w ? "" : xui.wrapRes("date.N"))
            },
            nn: function (d, w) {
                return xui.Date._fix(d.getMinutes()) + (w ? "" : xui.wrapRes("date.N"))
            },
            h: function (d, w) {
                return d.getHours() + (w ? "" : xui.wrapRes("date.H"))
            },
            hh: function (d, w) {
                return xui.Date._fix(d.getHours()) + (w ? "" : xui.wrapRes("date.H"))
            },
            d: function (d, w) {
                return d.getDate() + (w ? "" : xui.wrapRes("date.D"))
            },
            dd: function (d, w) {
                return xui.Date._fix(d.getDate()) + (w ? "" : xui.wrapRes("date.D"))
            },
            w: function (d, w, firstDayOfWeek) {
                var a = (d.getDay() - firstDayOfWeek + 7) % 7;
                return w ? a : xui.wrapRes("date.WEEKS." + a)
            },
            ww: function (d, w, firstDayOfWeek) {
                return xui.Date.getWeek(d, firstDayOfWeek) + (w ? "" : xui.wrapRes("date.W"))
            },
            m: function (d, w) {
                return (d.getMonth() + 1) + (w ? "" : xui.wrapRes("date.M"))
            },
            mm: function (d, w) {
                return xui.Date._fix(d.getMonth() + 1) + (w ? "" : xui.wrapRes("date.M"))
            },
            q: function (d, w) {
                return (parseInt((d.getMonth() + 3) / 3 - 1, 10) + 1) + (w ? "" : xui.wrapRes("date.Q"))
            },
            y: function (d, w) {
                return d.getYear() + (w ? "" : xui.wrapRes("date.Y"))
            },
            yyyy: function (d, w) {
                return d.getFullYear() + (w ? "" : xui.wrapRes("date.Y"))
            },
            de: function (d, w) {
                return parseInt(d.getFullYear() / 10, 10) + (w ? "" : xui.wrapRes("date.DE"))
            },
            c: function (d, w) {
                return parseInt(d.getFullYear() / 100, 10) + (w ? "" : xui.wrapRes("date.C"))
            },
            hn: function (d, w) {
                return xui.wrapRes("date.HN-" + d.getHours() + "-" + d.getMinutes())
            },
            dhn: function (d, w) {
                return xui.wrapRes("date.DHN-" + d.getDate() + "-" + d.getHours() + "-" + d.getMinutes())
            },
            mdhn: function (d, w) {
                return xui.wrapRes("date.MDHN-" + (d.getMonth() + 1) + "-" + d.getDate() + "-" + d.getHours() + "-" + d.getMinutes())
            },
            hns: function (d, w) {
                return xui.wrapRes("date.HNS-" + d.getHours() + "-" + d.getMinutes() + "-" + d.getSeconds())
            },
            hnsms: function (d, w) {
                return xui.wrapRes("date.HNSMS-" + d.getHours() + "-" + d.getMinutes() + "-" + d.getSeconds() + "-" + d.getMilliseconds())
            },
            yq: function (d, w) {
                return xui.wrapRes("date.YQ-" + d.getFullYear() + "-" + (parseInt((d.getMonth() + 3) / 3 - 1, 10) + 1))
            },
            ym: function (d, w) {
                return xui.wrapRes("date.YM-" + d.getFullYear() + "-" + (d.getMonth() + 1))
            },
            md: function (d, w) {
                return xui.wrapRes("date.MD-" + (d.getMonth() + 1) + "-" + d.getDate())
            },
            ymd: function (d, w) {
                return xui.wrapRes("date.YMD-" + d.getFullYear() + "-" + (d.getMonth() + 1) + "-" + d.getDate())
            },
            ymd2: function (d, w) {
                return xui.wrapRes("date.YMD2-" + d.getFullYear() + "-" + (d.getMonth() + 1) + "-" + d.getDate())
            },
            ymdh: function (d, w) {
                return xui.wrapRes("date.YMDH-" + d.getFullYear() + "-" + (d.getMonth() + 1) + "-" + d.getDate() + "-" + d.getHours())
            },
            ymdhn: function (d, w) {
                return xui.wrapRes("date.YMDHN-" + d.getFullYear() + "-" + (d.getMonth() + 1) + "-" + d.getDate() + "-" + d.getHours() + "-" + d.getMinutes())
            },
            ymdhns: function (d, w) {
                return xui.wrapRes("date.YMDHNS-" + d.getFullYear() + "-" + (d.getMonth() + 1) + "-" + d.getDate() + "-" + d.getHours() + "-" + d.getMinutes() + "-" + d.getSeconds())
            },
            all: function (d, w) {
                return xui.wrapRes("date.ALL-" + d.getFullYear() + "-" + (d.getMonth() + 1) + "-" + d.getDate() + "-" + d.getHours() + "-" + d.getMinutes() + "-" + d.getSeconds() + "-" + d.getMilliseconds())
            }
        },
        $TIMEZONE: [{
            id: "Asia(East,North)",
            sub: [{
                id: "Brunei",
                v: "+0800"
            }, {
                id: "Burma",
                v: "+0630"
            }, {
                id: "Cambodia",
                v: "+0700"
            }, {
                id: "China",
                v: "+0800"
            }, {
                id: "China(HK,Macau)",
                v: "+0800"
            }, {
                id: "China(TaiWan)",
                v: "+0800"
            }, {
                id: "China(Urumchi)",
                v: "+0700"
            }, {
                id: "East Timor",
                v: "+0800"
            }, {
                id: "Indonesia",
                v: "+0700"
            }, {
                id: "Japan",
                v: "+0900"
            }, {
                id: "Kazakhstan(Aqtau)",
                v: "+0400"
            }, {
                id: "Kazakhstan(Aqtobe)",
                v: "+0500"
            }, {
                id: "Kazakhstan(Astana)",
                v: "+0600"
            }, {
                id: "Kirghizia",
                v: "+0500"
            }, {
                id: "Korea",
                v: "+0900"
            }, {
                id: "Laos",
                v: "+0700"
            }, {
                id: "Malaysia",
                v: "+0800"
            }, {
                id: "Mongolia",
                v: "+0800",
                tag: "03L03|09L03"
            }, {
                id: "Philippines",
                v: "+0800"
            }, {
                id: "Russia(Anadyr)",
                v: "+1300",
                tag: "03L03|10L03"
            }, {
                id: "Russia(Kamchatka)",
                v: "+1200",
                tag: "03L03|10L03"
            }, {
                id: "Russia(Magadan)",
                v: "+1100",
                tag: "03L03|10L03"
            }, {
                id: "Russia(Vladivostok)",
                v: "+1000",
                tag: "03L03|10L03"
            }, {
                id: "Russia(Yakutsk)",
                v: "+0900",
                tag: "03L03|10L03"
            }, {
                id: "Singapore",
                v: "+0800"
            }, {
                id: "Thailand",
                v: "+0700"
            }, {
                id: "Vietnam",
                v: "+0700"
            }]
        }, {
            id: "Asia(South,West)",
            sub: [{
                id: "Afghanistan",
                v: "+0430"
            }, {
                id: "Arab Emirates",
                v: "+0400"
            }, {
                id: "Bahrain",
                v: "+0300"
            }, {
                id: "Bangladesh",
                v: "+0600"
            }, {
                id: "Bhutan",
                v: "+0600"
            }, {
                id: "Cyprus",
                v: "+0200"
            }, {
                id: "Georgia",
                v: "+0500"
            }, {
                id: "India",
                v: "+0530"
            }, {
                id: "Iran",
                v: "+0330",
                tag: "04 13|10 13"
            }, {
                id: "Iraq",
                v: "+0300",
                tag: "04 13|10 13"
            }, {
                id: "Israel",
                v: "+0200",
                tag: "04F53|09F53"
            }, {
                id: "Jordan",
                v: "+0200"
            }, {
                id: "Kuwait",
                v: "+0300"
            }, {
                id: "Lebanon",
                v: "+0200",
                tag: "03L03|10L03"
            }, {
                id: "Maldives",
                v: "+0500"
            }, {
                id: "Nepal",
                v: "+0545"
            }, {
                id: "Oman",
                v: "+0400"
            }, {
                id: "Pakistan",
                v: "+0500"
            }, {
                id: "Palestine",
                v: "+0200"
            }, {
                id: "Qatar",
                v: "+0300"
            }, {
                id: "Saudi Arabia",
                v: "+0300"
            }, {
                id: "Sri Lanka",
                v: "+0600"
            }, {
                id: "Syria",
                v: "+0200",
                tag: "04 13|10 13"
            }, {
                id: "Tajikistan",
                v: "+0500"
            }, {
                id: "Turkey",
                v: "+0200"
            }, {
                id: "Turkmenistan",
                v: "+0500"
            }, {
                id: "Uzbekistan",
                v: "+0500"
            }, {
                id: "Yemen",
                v: "+0300"
            }]
        }, {
            id: "North Europe",
            sub: [{
                id: "Denmark",
                v: "+0100",
                tag: "04F03|10L03"
            }, {
                id: "Faroe Is.(DK)",
                v: "+0100"
            }, {
                id: "Finland",
                v: "+0200",
                tag: "03L01|10L01"
            }, {
                id: "Iceland",
                v: "+0000"
            }, {
                id: "Jan Mayen(Norway)",
                v: "-0100"
            }, {
                id: "Norwegian",
                v: "+0100"
            }, {
                id: "Svalbard(NORWAY)",
                v: "+0100"
            }, {
                id: "Sweden",
                v: "+0100",
                tag: "03L01|10L01"
            }]
        }, {
            id: "Eastern Europe",
            sub: [{
                id: "Armenia",
                v: "+0400"
            }, {
                id: "Austria",
                v: "+0100",
                tag: "03L01|10L01"
            }, {
                id: "Azerbaijan",
                v: "+0400"
            }, {
                id: "Belarus",
                v: "+0200",
                tag: "03L03|10L03"
            }, {
                id: "Czech",
                v: "+0100"
            }, {
                id: "Estonia",
                v: "+0200"
            }, {
                id: "Georgia",
                v: "+0500"
            }, {
                id: "Germany",
                v: "+0100",
                tag: "03L01|10L01"
            }, {
                id: "Hungarian",
                v: "+0100"
            }, {
                id: "Latvia",
                v: "+0200"
            }, {
                id: "Liechtenstein",
                v: "+0100"
            }, {
                id: "Lithuania",
                v: "+0200"
            }, {
                id: "Moldova",
                v: "+0200"
            }, {
                id: "Poland",
                v: "+0100"
            }, {
                id: "Rumania",
                v: "+0200"
            }, {
                id: "Russia(Moscow)",
                v: "+0300",
                tag: "03L03|10L03"
            }, {
                id: "Slovakia",
                v: "+0100"
            }, {
                id: "Switzerland",
                v: "+0100",
                tag: "03L01|10L01"
            }, {
                id: "Ukraine",
                v: "+0200"
            }, {
                id: "Ukraine(Simferopol)",
                v: "+0300"
            }]
        }, {
            id: "Western Europe",
            sub: [{
                id: "Andorra",
                v: "+0100",
                tag: "03L01|10L01"
            }, {
                id: "Belgium",
                v: "+0100",
                tag: "03L01|10L01"
            }, {
                id: "Channel Is.(UK)",
                v: "+0000",
                tag: "03L01|10L01"
            }, {
                id: "France",
                v: "+0100",
                tag: "03L01|10L01"
            }, {
                id: "Gibraltar(UK)",
                v: "+0100",
                tag: "03L01|10L01"
            }, {
                id: "Ireland",
                v: "+0000",
                tag: "03L01|10L01"
            }, {
                id: "Isle of Man(UK)",
                v: "+0000",
                tag: "03L01|10L01"
            }, {
                id: "Luxembourg",
                v: "+0100",
                tag: "03L01|10L01"
            }, {
                id: "Monaco",
                v: "+0100"
            }, {
                id: "Netherlands",
                v: "+0100",
                tag: "03L01|10L01"
            }, {
                id: "United Kingdom",
                v: "+0000",
                tag: "03L01|10L01"
            }]
        }, {
            id: "South Europe",
            sub: [{
                id: "Albania",
                v: "+0100"
            }, {
                id: "Bosnia",
                v: "+0100"
            }, {
                id: "Bulgaria",
                v: "+0200"
            }, {
                id: "Croatia",
                v: "+0100"
            }, {
                id: "Greece",
                v: "+0200",
                tag: "03L01|10L01"
            }, {
                id: "Holy See",
                v: "+0100"
            }, {
                id: "Italy",
                v: "+0100",
                tag: "03L01|10L01"
            }, {
                id: "Macedonia",
                v: "+0100"
            }, {
                id: "Malta",
                v: "+0100"
            }, {
                id: "Montenegro",
                v: "+0100"
            }, {
                id: "Portugal",
                v: "+0000",
                tag: "03L01|10L01"
            }, {
                id: "San Marino",
                v: "+0100"
            }, {
                id: "Serbia",
                v: "+0100"
            }, {
                id: "Slovenia",
                v: "+0100"
            }, {
                id: "Span",
                v: "+0100",
                tag: "03L01|10L01"
            }]
        }, {
            id: "North America",
            sub: [{
                id: "Canada(AST)",
                v: "-0400",
                tag: "04F02|10L02"
            }, {
                id: "Canada(CST)",
                v: "-0600",
                tag: "04F02|10L02"
            }, {
                id: "Canada(EST)",
                v: "-0500",
                tag: "04F02|10L02"
            }, {
                id: "Canada(MST)",
                v: "-0700",
                tag: "04F02|10L02"
            }, {
                id: "Canada(NST)",
                v: "-0330",
                tag: "04F02|10L02"
            }, {
                id: "Canada(PST)",
                v: "-0800",
                tag: "04F02|10L02"
            }, {
                id: "Greenland(DK)",
                v: "-0300"
            }, {
                id: "US(Central)",
                v: "-0600",
                tag: "03S02|11F02"
            }, {
                id: "US(Eastern)",
                v: "-0500",
                tag: "03S02|11F02"
            }, {
                id: "US(Mountain)",
                v: "-0700",
                tag: "03S02|11F02"
            }, {
                id: "US(Pacific)",
                v: "-0800",
                tag: "03S02|11F02"
            }, {
                id: "US(Alaska)",
                v: "-0900"
            }, {
                id: "US(Arizona)",
                v: "-0700"
            }]
        }, {
            id: "South America",
            sub: [{
                id: "Anguilla(UK)",
                v: "-0400"
            }, {
                id: "Antigua&amp;Barbuda",
                v: "-0400"
            }, {
                id: "Antilles(NL)",
                v: "-0400"
            }, {
                id: "Argentina",
                v: "-0300"
            }, {
                id: "Aruba(NL)",
                v: "-0400"
            }, {
                id: "Bahamas",
                v: "-0500"
            }, {
                id: "Barbados",
                v: "-0400"
            }, {
                id: "Belize",
                v: "-0600"
            }, {
                id: "Bolivia",
                v: "-0400"
            }, {
                id: "Brazil(AST)",
                v: "-0500",
                tag: "10F03|02L03"
            }, {
                id: "Brazil(EST)",
                v: "-0300",
                tag: "10F03|02L03"
            }, {
                id: "Brazil(FST)",
                v: "-0200",
                tag: "10F03|02L03"
            }, {
                id: "Brazil(WST)",
                v: "-0400",
                tag: "10F03|02L03"
            }, {
                id: "British Virgin Is.(UK)",
                v: "-0400"
            }, {
                id: "Cayman Is.(UK)",
                v: "-0500"
            }, {
                id: "Chilean",
                v: "-0300",
                tag: "10F03|03F03"
            }, {
                id: "Chilean(Hanga Roa)",
                v: "-0500",
                tag: "10F03|03F03"
            }, {
                id: "Colombia",
                v: "-0500"
            }, {
                id: "Costa Rica",
                v: "-0600"
            }, {
                id: "Cuba",
                v: "-0500",
                tag: "04 13|10L03"
            }, {
                id: "Dominican",
                v: "-0400"
            }, {
                id: "Ecuador",
                v: "-0500"
            }, {
                id: "El Salvador",
                v: "-0600"
            }, {
                id: "Falklands",
                v: "-0300",
                tag: "09F03|04F03"
            }, {
                id: "Grenada",
                v: "-0400"
            }, {
                id: "Guadeloupe(FR)",
                v: "-0400"
            }, {
                id: "Guatemala",
                v: "-0600"
            }, {
                id: "Guiana(FR)",
                v: "-0300"
            }, {
                id: "Guyana",
                v: "-0400"
            }, {
                id: "Haiti",
                v: "-0500"
            }, {
                id: "Honduras",
                v: "-0600"
            }, {
                id: "Jamaica",
                v: "-0500"
            }, {
                id: "Martinique(FR)",
                v: "-0400"
            }, {
                id: "Mexico(Mazatlan)",
                v: "-0700"
            }, {
                id: "Mexico(Tijuana)",
                v: "-0800"
            }, {
                id: "Mexico(Mexico)",
                v: "-0600"
            }, {
                id: "Montserrat(UK)",
                v: "-0400"
            }, {
                id: "Nicaragua",
                v: "-0500"
            }, {
                id: "Panama",
                v: "-0500"
            }, {
                id: "Paraguay",
                v: "-0400",
                tag: "10F03|02L03"
            }, {
                id: "Peru",
                v: "-0500"
            }, {
                id: "Puerto Rico(US)",
                v: "-0400"
            }, {
                id: "So. Georgia&amp;So. Sandwich Is.(UK)",
                v: "-0200"
            }, {
                id: "St. Kitts&amp;Nevis",
                v: "-0400"
            }, {
                id: "St. Lucia",
                v: "-0400"
            }, {
                id: "St. Vincent&amp;Grenadines",
                v: "-0400"
            }, {
                id: "Suriname",
                v: "-0300"
            }, {
                id: "Trinidad&amp;Tobago",
                v: "-0400"
            }, {
                id: "Turks&amp;Caicos Is.(UK)",
                v: "-0500"
            }, {
                id: "Uruguay",
                v: "-0300"
            }, {
                id: "Venezuela",
                v: "-0400"
            }, {
                id: "Virgin Is.(US)",
                v: "-0400"
            }]
        }, {
            id: "Africa(North)",
            sub: [{
                id: "Algeria",
                v: "+0100"
            }, {
                id: "Egypt",
                v: "+0200",
                tag: "04L53|09L43"
            }, {
                id: "Libyan",
                v: "+0200"
            }, {
                id: "Morocco",
                v: "+0000"
            }, {
                id: "Sudan",
                v: "+0200"
            }, {
                id: "Tunisia",
                v: "+0100"
            }]
        }, {
            id: "Africa(Western)",
            sub: [{
                id: "Benin",
                v: "+0100"
            }, {
                id: "Burkina Faso",
                v: "+0000"
            }, {
                id: "Canary Is.(SP)",
                v: "-0100"
            }, {
                id: "Cape Verde",
                v: "-0100"
            }, {
                id: "Chad",
                v: "+0100"
            }, {
                id: "Gambia",
                v: "+0000"
            }, {
                id: "Ghana",
                v: "+0000"
            }, {
                id: "Guinea",
                v: "+0000"
            }, {
                id: "Guinea-Bissau",
                v: "+0000"
            }, {
                id: "Ivory Coast",
                v: "+0000"
            }, {
                id: "Liberia",
                v: "+0000"
            }, {
                id: "Mali",
                v: "+0000"
            }, {
                id: "Mauritania",
                v: "+0000"
            }, {
                id: "Niger",
                v: "+0100"
            }, {
                id: "Nigeria",
                v: "+0100"
            }, {
                id: "Senegal",
                v: "+0000"
            }, {
                id: "Sierra Leone",
                v: "+0000"
            }, {
                id: "Togo",
                v: "+0000"
            }, {
                id: "Western Sahara",
                v: "+0000"
            }]
        }, {
            id: "Africa(Central)",
            sub: [{
                id: "Cameroon",
                v: "+0100"
            }, {
                id: "Cen.African Rep.",
                v: "+0100"
            }, {
                id: "Congo,Democratic",
                v: "+0100"
            }, {
                id: "Congo,Republic",
                v: "+0100"
            }, {
                id: "Equatorial Guinea",
                v: "+0100"
            }, {
                id: "Gabon",
                v: "+0100"
            }, {
                id: "Sao Tome&amp;Principe",
                v: "+0000"
            }]
        }, {
            id: "Africa(East)",
            sub: [{
                id: "Burundi",
                v: "+0200"
            }, {
                id: "Comoros",
                v: "+0300"
            }, {
                id: "Djibouti",
                v: "+0300"
            }, {
                id: "Eritrea",
                v: "+0300"
            }, {
                id: "Ethiopia",
                v: "+0300"
            }, {
                id: "Kenya",
                v: "+0300"
            }, {
                id: "Madagascar",
                v: "+0300"
            }, {
                id: "Malawi",
                v: "+0200"
            }, {
                id: "Mauritius",
                v: "+0400"
            }, {
                id: "Mayotte(FR)",
                v: "+0300"
            }, {
                id: "Mozambique",
                v: "+0200"
            }, {
                id: "Reunion(FR)",
                v: "+0400"
            }, {
                id: "Rwanda",
                v: "+0200"
            }, {
                id: "Seychelles",
                v: "+0300"
            }, {
                id: "Somalia",
                v: "+0300"
            }, {
                id: "Tanzania",
                v: "+0300"
            }, {
                id: "Uganda",
                v: "+0300"
            }]
        }, {
            id: "Africa(South)",
            sub: [{
                id: "Angola",
                v: "+0100"
            }, {
                id: "Botswana",
                v: "+0200"
            }, {
                id: "Lesotho",
                v: "+0200"
            }, {
                id: "Namibia",
                v: "+0200",
                tag: "09F03|04F03"
            }, {
                id: "Saint Helena(UK)",
                v: "-0100"
            }, {
                id: "South Africa",
                v: "+0200"
            }, {
                id: "Swaziland",
                v: "+0200"
            }, {
                id: "Zambia",
                v: "+0200"
            }, {
                id: "Zimbabwe",
                v: "+0200"
            }]
        }, {
            id: "Oceania",
            sub: [{
                id: "American Samoa(US)",
                v: "-1100"
            }, {
                id: "Australia(Adelaide)",
                v: "+0930",
                sub: "10L03|03L03"
            }, {
                id: "Australia(Brisbane)",
                v: "+1000"
            }, {
                id: "Australia(Darwin)",
                v: "+0930"
            }, {
                id: "Australia(Hobart)",
                v: "+1000",
                sub: "10L03|03L03"
            }, {
                id: "Australia(Perth)",
                v: "+0800"
            }, {
                id: "Australia(Sydney)",
                v: "+1000",
                sub: "10L03|03L03"
            }, {
                id: "Cook Islands(NZ)",
                v: "-1000"
            }, {
                id: "Eniwetok",
                v: "-1200"
            }, {
                id: "Fiji",
                v: "+1200",
                sub: "11F03|02L03"
            }, {
                id: "Guam",
                v: "+1000"
            }, {
                id: "Hawaii(US)",
                v: "-1000"
            }, {
                id: "Kiribati",
                v: "+1100"
            }, {
                id: "Marshall Is.",
                v: "+1200"
            }, {
                id: "Micronesia",
                v: "+1000"
            }, {
                id: "Midway Is.(US)",
                v: "-1100"
            }, {
                id: "Nauru Rep.",
                v: "+1200"
            }, {
                id: "New Calednia(FR)",
                v: "+1100"
            }, {
                id: "New Zealand",
                v: "+1200",
                sub: "10F03|04F63"
            }, {
                id: "New Zealand(CHADT)",
                v: "+1245",
                sub: "10F03|04F63"
            }, {
                id: "Niue(NZ)",
                v: "-1100"
            }, {
                id: "Nor. Mariana Is.",
                v: "+1000"
            }, {
                id: "Palau",
                v: "+0900"
            }, {
                id: "Papua New Guinea",
                v: "+1000"
            }, {
                id: "Pitcairn Is.(UK)",
                v: "-0830"
            }, {
                id: "Polynesia(FR)",
                v: "-1000"
            }, {
                id: "Solomon Is.",
                v: "+1100"
            }, {
                id: "Tahiti",
                v: "-1000"
            }, {
                id: "Tokelau(NZ)",
                v: "-1100"
            }, {
                id: "Tonga",
                v: "+1300",
                tag: "10F63|04F63"
            }, {
                id: "Tuvalu",
                v: "+1200"
            }, {
                id: "Vanuatu",
                v: "+1100"
            }, {
                id: "Western Samoa",
                v: "-1100"
            }, {
                id: "Data Line",
                v: "-1200"
            }]
        }],
        _mapKeys: function (obj) {
            var self = this,
                t = self._key2,
                m = self._key1;
            for (var i = 0, l = m.length; i < l; i++) {
                obj[t[i]] = obj[m[i]]
            }
        },
        _validUnit: function (datepart) {
            return this.$UNIT[datepart] ? datepart : "d"
        },
        _isDate: function (target) {
            return !!target && target.constructor == Date
        },
        _date: function (value, df) {
            return this._isDate(value) ? value : ((value || value === 0) && isFinite(value)) ? new Date(parseInt(value, 10)) : this._isDate(df) ? df : new Date
        },
        _isNumb: function (target) {
            return typeof target == "number" && isFinite(target)
        },
        _numb: function (value, df) {
            return this._isNumb(value) ? value : this._isNumb(df) ? df : 0
        },
        _timeZone: -((new Date).getTimezoneOffset() / 60),
        get: function (date, datepart, firstDayOfWeek) {
            var self = this;
            date = self._date(date);
            datepart = self._validUnit(datepart);
            firstDayOfWeek = self._numb(firstDayOfWeek);
            var map = arguments.callee.map || (arguments.callee.map = {
                ms: function (d) {
                    return d.getMilliseconds()
                },
                s: function (d) {
                    return d.getSeconds()
                },
                n: function (d) {
                    return d.getMinutes()
                },
                h: function (d) {
                    return d.getHours()
                },
                d: function (d) {
                    return d.getDate()
                },
                ww: function (d, fd) {
                    return xui.Date.getWeek(d, fd)
                },
                w: function (d, fd) {
                    return (7 + d.getDay() - fd) % 7
                },
                m: function (d) {
                    return d.getMonth()
                },
                q: function (d) {
                    return parseInt((d.getMonth() + 3) / 3 - 1, 10)
                },
                y: function (d) {
                    return d.getFullYear()
                },
                de: function (d) {
                    return parseInt(d.getFullYear() / 10, 10)
                },
                c: function (d) {
                    return parseInt(d.getFullYear() / 100, 10)
                }
            });
            return map[datepart](date, firstDayOfWeek)
        },
        _fix: function (str, len, chr) {
            len = len || 2;
            chr = chr || "0";
            str += "";
            if (str.length < len) {
                for (var i = str.length; i < len; i++) {
                    str = chr + str
                }
            }
            return str
        },
        add: function (date, datepart, count) {
            var self = this,
                tu = self.$TIMEUNIT,
                map, date2;
            date = self._date(date);
            datepart = self._validUnit(datepart);
            if (!(map = arguments.callee.map)) {
                map = arguments.callee.map = {
                    MILLISECOND: function (date, count) {
                        date.setTime(date.getTime() + count * tu.ms)
                    },
                    SECOND: function (date, count) {
                        date.setTime(date.getTime() + count * tu.s)
                    },
                    MINUTE: function (date, count) {
                        date.setTime(date.getTime() + count * tu.n)
                    },
                    HOUR: function (date, count) {
                        date.setTime(date.getTime() + count * tu.h)
                    },
                    DAY: function (date, count) {
                        date.setTime(date.getTime() + count * tu.d)
                    },
                    WEEK: function (date, count) {
                        date.setTime(date.getTime() + count * tu.ww)
                    },
                    MONTH: function (date, count) {
                        var a = date.getDate(),
                            b;
                        count = date.getMonth() + count;
                        this.YEAR(date, Math.floor(count / 12));
                        date.setMonth((count % 12 + 12) % 12);
                        if ((b = date.getDate()) != a) {
                            this.DAY(date, -b)
                        }
                    },
                    QUARTER: function (date, count) {
                        this.MONTH(date, count * 3)
                    },
                    YEAR: function (date, count) {
                        var a = date.getDate(),
                            b;
                        date.setFullYear(date.getFullYear() + count);
                        if ((b = date.getDate()) != a) {
                            this.DAY(date, -b)
                        }
                    },
                    DECADE: function (date, count) {
                        this.YEAR(date, 10 * count)
                    },
                    CENTURY: function (date, count) {
                        this.YEAR(date, 100 * count)
                    }
                };
                self._mapKeys(map)
            }
            map[datepart](date2 = new Date(date), count);
            return date2
        },
        diff: function (startdate, enddate, datepart, firstDayOfWeek) {
            var self = this;
            startdate = self._date(startdate);
            enddate = self._date(enddate);
            datepart = self._validUnit(datepart);
            firstDayOfWeek = self._numb(firstDayOfWeek);
            var tu = self.$TIMEUNIT,
                map;
            if (!(map = arguments.callee.map)) {
                map = arguments.callee.map = {
                    MILLISECOND: function (startdate, enddate) {
                        return enddate.getTime() - startdate.getTime()
                    },
                    SECOND: function (startdate, enddate) {
                        var startdate = self.getTimSpanStart(startdate, "s"),
                            enddate = self.getTimSpanStart(enddate, "s"),
                            t = enddate.getTime() - startdate.getTime();
                        return t / tu.s
                    },
                    MINUTE: function (startdate, enddate) {
                        var startdate = self.getTimSpanStart(startdate, "n"),
                            enddate = self.getTimSpanStart(enddate, "n"),
                            t = enddate.getTime() - startdate.getTime();
                        return t / tu.n
                    },
                    HOUR: function (startdate, enddate) {
                        var startdate = self.getTimSpanStart(startdate, "h"),
                            enddate = self.getTimSpanStart(enddate, "h"),
                            t = enddate.getTime() - startdate.getTime();
                        return t / tu.h
                    },
                    DAY: function (startdate, enddate) {
                        var startdate = self.getTimSpanStart(startdate, "d", 1),
                            enddate = self.getTimSpanStart(enddate, "d", 1),
                            t = enddate.getTime() - startdate.getTime();
                        return t / tu.d
                    },
                    WEEK: function (startdate, enddate, firstDayOfWeek) {
                        var startdate = self.getTimSpanStart(startdate, "ww", 1, firstDayOfWeek),
                            enddate = self.getTimSpanStart(enddate, "ww", 1, firstDayOfWeek),
                            t = enddate.getTime() - startdate.getTime();
                        return t / tu.ww
                    },
                    MONTH: function (startdate, enddate) {
                        return (enddate.getFullYear() - startdate.getFullYear()) * 12 + (enddate.getMonth() - startdate.getMonth())
                    },
                    QUARTER: function (startdate, enddate) {
                        return (enddate.getFullYear() - startdate.getFullYear()) * 4 + parseInt((enddate.getMonth() - startdate.getMonth()) / 3, 10)
                    },
                    YEAR: function (startdate, enddate) {
                        return parseInt((enddate.getFullYear() - startdate.getFullYear()), 10)
                    },
                    DECADE: function (startdate, enddate) {
                        return parseInt((enddate.getFullYear() - startdate.getFullYear()) / 10, 10)
                    },
                    CENTURY: function (startdate, enddate) {
                        return parseInt((enddate.getFullYear() - startdate.getFullYear()) / 100, 10)
                    }
                };
                self._mapKeys(map)
            }
            return map[datepart](new Date(startdate), new Date(enddate), firstDayOfWeek)
        },
        getTimSpanStart: function (date, datepart, count, firstDayOfWeek) {
            var self = this,
                tu = self.$TIMEUNIT,
                map, date2;
            date = self._date(date);
            datepart = self._validUnit(datepart);
            firstDayOfWeek = self._numb(firstDayOfWeek);
            count = self._numb(count, 1);
            if (!(map = arguments.callee.map)) {
                var clearInDay = function (d) {
                        d.setMilliseconds(0);
                        d.setSeconds(0);
                        d.setMinutes(0);
                        d.setHours(0)
                    },
                    clearInYear = function (d) {
                        clearInDay(d);
                        d.setDate(1);
                        d.setMonth(0)
                    };
                map = arguments.callee.map = {
                    MILLISECOND: function (date, count) {
                        var x = date.getMilliseconds();
                        date.setMilliseconds(x - (x % count))
                    },
                    SECOND: function (date, count) {
                        date.setMilliseconds(0);
                        var x = date.getSeconds();
                        date.setSeconds(x - (x % count))
                    },
                    MINUTE: function (date, count) {
                        date.setMilliseconds(0);
                        date.setSeconds(0);
                        var x = date.getMinutes();
                        date.setTime(date.getTime() - (x % count) * tu.n)
                    },
                    HOUR: function (date, count) {
                        date.setMilliseconds(0);
                        date.setSeconds(0);
                        date.setMinutes(0);
                        var x = date.getHours();
                        date.setHours(x - (x % count))
                    },
                    DAY: function (date, count) {
                        clearInDay(date);
                        var x = date.getDate();
                        date.setDate(x - (x % count))
                    },
                    WEEK: function (date, count, firstDayOfWeek) {
                        clearInDay(date);
                        var d = (date.getDay() + 7 - firstDayOfWeek) % 7,
                            date2, x, a = new Date();
                        date.setTime(date.getTime() - d * tu.d);
                        clearInYear(a);
                        a.setFullYear(date.getFullYear());
                        date2 = (a.getDay() + 7 - firstDayOfWeek) % 7;
                        a.setTime(a.getTime() - date2 * tu.d);
                        x = (date.getTime() - a.getTime()) / tu.d / 7;
                        date.setTime(date.getTime() - (x % count) * tu.ww)
                    },
                    MONTH: function (date, count) {
                        clearInDay(date);
                        date.setDate(1);
                        var x = date.getMonth();
                        date.setMonth(x - (x % count))
                    },
                    QUARTER: function (date, count) {
                        count = self._numb(count, 1);
                        return this.MONTH(date, count * 3)
                    },
                    YEAR: function (date, count) {
                        clearInYear(date);
                        var x = date.getFullYear();
                        date.setFullYear(x - (x % count))
                    },
                    DECADE: function (date, count) {
                        clearInYear(date);
                        date.setFullYear(Math.floor(date.getFullYear() / 10) * 10)
                    },
                    CENTURY: function (date, count) {
                        clearInYear(date);
                        date.setFullYear(Math.floor(date.getFullYear() / 100) * 100)
                    }
                };
                self._mapKeys(map)
            }
            map[datepart](date2 = new Date(date), count, firstDayOfWeek);
            return date2
        },
        getTimSpanEnd: function (date, datepart, count, firstDayOfWeek) {
            var self = this;
            date = self._date(date);
            datepart = self._validUnit(datepart);
            firstDayOfWeek = self._numb(firstDayOfWeek);
            count = self._numb(count, 1);
            var originalTime = date.getTime(),
                date2 = self.getTimSpanStart(date, datepart, count, firstDayOfWeek);
            if (date2.getTime() < originalTime) {
                date2 = self.add(date2, datepart, count)
            }
            return date2
        },
        offsetTimeZone: function (date, targetTimeZone, back) {
            var self = this;
            date = self._date(date);
            return new Date(date.getTime() + (back ? -1 : 1) * (targetTimeZone - self._timeZone) * self.$TIMEUNIT.h)
        },
        getWeek: function (date, firstDayOfWeek) {
            var self = this,
                date2, y;
            date = self._date(date);
            firstDayOfWeek = self._numb(firstDayOfWeek), y = date.getFullYear();
            date = self.add(self.getTimSpanStart(date, "ww", 1, firstDayOfWeek), "d", 6);
            if (date.getFullYear() != y) {
                return 1
            }
            date2 = self.getTimSpanStart(date, "y", 1);
            date2 = self.add(self.getTimSpanStart(date2, "ww", 1, firstDayOfWeek), "d", 6);
            return self.diff(date2, date, "ww") + 1
        },
        parse: function (str, format) {
            var rtn;
            if (_.isDate(str)) {
                rtn = str
            } else {
                str += "";
                if (isFinite(str)) {
                    rtn = new Date(parseInt(str, 10))
                } else {
                    if (typeof format == "string") {
                        var a = format.split(/[^ymdhns]+/),
                            b = str.split(/[^0-9]+/),
                            n = {
                                y: 0,
                                m: 0,
                                d: 0,
                                h: 0,
                                n: 0,
                                s: 0,
                                ms: 0
                            };
                        if (a.length && a.length === b.length) {
                            for (var i = 0; i < a.length; i++) {
                                if (a[i].length) {
                                    n[a[i] == "ms" ? "ms" : a[i].charAt(0)] = parseInt(b[i].replace(/^0*/, ""), 10)
                                }
                            }
                            rtn = new Date(n.y, n.m - 1, n.d, n.h, n.n, n.s, n.ms)
                        } else {
                            rtn = null
                        }
                    } else {
                        var self = this,
                            utc, me = arguments.callee,
                            dp = me.dp || (me.dp = {
                                FullYear: 2,
                                Month: 4,
                                Date: 6,
                                Hours: 8,
                                Minutes: 10,
                                Seconds: 12,
                                Milliseconds: 14
                            }),
                            match = str.match(me.iso || (me.iso = /^((-\d+|\d{4,})(-(\d{2})(-(\d{2}))?)?)?T((\d{2})(:(\d{2})(:(\d{2})(\.(\d{1,3})(\d)?\d*)?)?)?)?(([+-])(\d{2})((\d{2}))?|Z)?$/)),
                            date = new Date(0);
                        if (match) {
                            if (match[4]) {
                                match[4]--
                            }
                            if (match[15] >= 5) {
                                match[14]++
                            }
                            utc = match[16] || match[18] ? "UTC" : "";
                            for (var i in dp) {
                                var v = match[dp[i]];
                                if (!v) {
                                    continue
                                }
                                date["set" + utc + i](v);
                                if (date["get" + utc + i]() != match[dp[i]]) {
                                    rtn = null
                                }
                            }
                            if (match[18]) {
                                var h = Number(match[17] + match[18]),
                                    m = Number(match[17] + (match[20] || 0));
                                date.setUTCMinutes(date.getUTCMinutes() + (h * 60) + m)
                            }
                            rtn = date
                        } else {
                            if (/^((-\d+|\d{4,})(-(\d{1,2})(-(\d{1,2}))))/.test(str)) {
                                str = str.replace(/-/g, "/")
                            }
                            var r = Date.parse(str);
                            rtn = r ? date.setTime(r) && date : null
                        }
                    }
                }
            }
            return rtn === null ? null : isFinite(+rtn) ? rtn : null
        },
        getText: function (date, datepart, firstDayOfWeek) {
            var self = this,
                map = self.$TEXTFORMAT;
            date = self._date(date);
            firstDayOfWeek = self._numb(firstDayOfWeek);
            return map[datepart] ? map[datepart](date, false, firstDayOfWeek) : datepart
        },
        format: function (date, format, firstDayOfWeek) {
            var self = this,
                map = self.$TEXTFORMAT;
            date = self._date(date);
            firstDayOfWeek = self._numb(firstDayOfWeek);
            return format.replace(/(utciso|iso|yyyy|mm|ww|dd|hh|nn|ss|ms|de|c|y|q|m|w|d|h|n|s)/g, function (a, b) {
                return map[b] ? map[b](date, true, firstDayOfWeek) : b
            })
        }
    }
});
Class("xui.CSS", null, {
    Static: {
        _r: xui.browser.ie ? "rules" : "cssRules",
        _baseid: "xui:css:base",
        _firstid: "xui:css:first",
        _lastid: "xui:css:last",
        _reg1: /\.(\w+)\[CLASS~="\1"\]/g,
        _reg2: /\[ID"([^"]+)"\]/g,
        _reg3: /\*([.#])/g,
        _reg4: /\s+/g,
        _reg5: /\*\|/g,
        _reg6: /(\s*,\s*)/g,
        _rep: function (str) {
            var ns = this;
            return str.replace(ns._reg1, ".$1").replace(ns._reg2, "#$1").replace(ns._reg3, "$1").replace(ns._reg4, " ").replace(ns._reg5, "").replace(ns._reg6, ",").toLowerCase()
        },
        _createCss: function (id, last) {
            var ns = this,
                head = this._getHead(),
                fid = ns._firstid,
                lid = ns._lastid,
                fc, c;
            fc = document.createElement("style");
            fc.type = "text/css";
            fc.id = id;
            if (!last) {
                c = document.getElementById(fid) || head.firstChild;
                while ((c = c.nextSibling) && !/^(script|link|style)$/i.test("" + c.tagName)) {}
                if (c) {
                    head.insertBefore(fc, c)
                } else {
                    if (c = document.getElementById(lid)) {
                        head.insertBefore(fc, c)
                    } else {
                        head.appendChild(fc)
                    }
                }
            } else {
                head.appendChild(fc)
            }
            return fc
        },
        _getCss: function (id, last) {
            return document.getElementById(id) || this._createCss(id, last)
        },
        _getBase: function () {
            return this._getCss(this._baseid)
        },
        _getFirst: function () {
            return this._getCss(this._firstid)
        },
        _getLast: function () {
            return this._getCss(this._lastid, true)
        },
        _getHead: function () {
            return this._head || (this._head = document.getElementsByTagName("head")[0] || document.documentElement)
        },
        _check: function () {
            if (!xui.browser.ie) {
                return
            }
            var count = 0;
            for (var head = this._getHead(), i = 0, t = head.childNodes, l; l = t[i++];) {
                if (l.type == "text/css") {
                    count++
                }
            }
            return count > 20
        },
        get: function (property, value) {
            for (var head = this._getHead(), i = 0, t = head.childNodes, l; l = t[i++];) {
                if (l.type == "text/css" && property in l && l[property] == value) {
                    return l
                }
            }
        },
        addStyleSheet: function (txt, id, backOf) {
            var e, ns = this,
                head = ns._getHead(),
                add = function (txt, id, backOf) {
                    var e = document.createElement("style");
                    e.type = "text/css";
                    if (id) {
                        e.id = id
                    }
                    if (xui.browser.ie) {
                        e.styleSheet.cssText = txt || ""
                    } else {
                        try {
                            e.appendChild(document.createTextNode(txt || ""))
                        } catch (p) {
                            e.styleSheet.cssText = txt || ""
                        }
                    }
                    head.insertBefore(e, backOf ? ns._getLast() : ns._getBase());
                    e.disabled = true;
                    e.disabled = false;
                    return e
                },
                merge = function (txt, backOf) {
                    var e = backOf ? ns._getLast() : ns._getBase();
                    e.styleSheet.cssText += txt;
                    return e
                };
            if (id && (id = id.replace(/[^\w\-\_\.\:]/g, "_")) && (e = ns.get("id", id))) {
                return e
            }
            if (ns._check()) {
                return merge(txt, backOf)
            } else {
                return add(txt, id, backOf)
            }
        },
        includeLink: function (href, id, front, attr) {
            var e, ns = this,
                head = ns._getHead();
            if (href && (e = ns.get("href", href))) {} else {
                e = document.createElement("link");
                e.type = "text/css";
                e.rel = "stylesheet";
                e.href = href;
                if (id) {
                    e.id = id
                }
                e.media = "all";
                _.each(attr, function (o, i) {
                    e.setAttribute(i, o)
                })
            }
            head.insertBefore(e, front ? ns._getBase() : ns._getLast());
            e.disabled = true;
            e.disabled = false;
            return e
        },
        remove: function (property, value) {
            var head = this._getHead();
            if (value = this.get(property, value)) {
                value.disabled = true;
                head.removeChild(value)
            }
        },
        replaceLink: function (href, property, oValue, nValue) {
            var ns = this,
                head = ns._getHead(),
                attr = {},
                e, v;
            attr[property] = nValue;
            e = ns.includeLink(href, null, false, attr);
            if (v = ns.get(property, oValue)) {
                head.replaceChild(e, v)
            }
            e.disabled = true;
            e.disabled = false
        },
        _build: function (selector, value, flag) {
            var t = "";
            _.each(value, function (o, i) {
                t += i.replace(/([A-Z])/g, "-$1").toLowerCase() + ":" + o + ";"
            });
            return flag ? t : selector + "{" + t + "}"
        },
        setStyleRules: function (selector, value, force) {
            var ns = this,
                add = true,
                ds = document.styleSheets,
                target, target2, selectorText, bak, h, e, t, _t;
            selector = _.str.trim(selector.replace(/\s+/g, " "));
            if (!(value && force)) {
                bak = selector.toLowerCase();
                _.arr.each(_.toArr(ds), function (o) {
                    try {
                        o[ns._r]
                    } catch (e) {
                        return
                    }
                    _.arr.each(_.toArr(o[ns._r]), function (v, i) {
                        if (!v.selectorText) {
                            return
                        }
                        if (v.disabled) {
                            return
                        }
                        selectorText = ns._rep(v.selectorText);
                        _t = selectorText.split(",");
                        if (!value) {
                            add = false;
                            if (_.arr.indexOf(_t, bak) != -1 && _t.length > 1) {
                                _t = _.arr.removeFrom(_t, _.arr.indexOf(_t, bak)).join(",");
                                t = v.cssText.slice(v.cssText.indexOf("{") + 1, v.cssText.lastIndexOf("}"));
                                if (o.insertRule) {
                                    o.insertRule(_t + "{" + t + "}", o[ns._r].length)
                                } else {
                                    if (o.addRule) {
                                        o.addRule(_t, t)
                                    }
                                }
                                if (o.deleteRule) {
                                    o.deleteRule(i)
                                } else {
                                    o.removeRule(i)
                                }
                                o.disabled = true;
                                o.disabled = false
                            } else {
                                if (selectorText == bak) {
                                    if (o.deleteRule) {
                                        o.deleteRule(i)
                                    } else {
                                        o.removeRule(i)
                                    }
                                    o.disabled = true;
                                    o.disabled = false
                                }
                            }
                        } else {
                            if (selectorText == bak) {
                                target = v;
                                return false
                            }
                            if (_.arr.indexOf(_t, bak) != -1) {
                                target2 = v;
                                return false
                            }
                        }
                    }, null, true);
                    if (target) {
                        add = false;
                        try {
                            _.each(value, function (o, i) {
                                i = i.replace(/(-[a-z])/gi, function (m, a) {
                                    return a.charAt(1).toUpperCase()
                                });
                                target.style[i] = typeof o == "function" ? o(target.style[i]) : o
                            })
                        } catch (e) {}
                        o.disabled = true;
                        o.disabled = false;
                        return false
                    } else {
                        if (target2) {
                            add = false;
                            o.insertRule(ns._build(selector, value), o[ns._r].length);
                            o.disabled = true;
                            o.disabled = false;
                            return false
                        }
                    }
                }, null, true)
            }
            if (force || add) {
                ns._addRules(selector, value)
            }
            return ns
        },
        $getCSSValue: function (selector, cssKey, cssValue) {
            var ns = this,
                k = ns._r,
                ds = document.styleSheets,
                l = ds.length,
                m, o, v, i, j, selectorText;
            selector = _.str.trim(selector.replace(/\s+/g, " "));
            for (i = l - 1; i >= 0; i--) {
                try {
                    o = ds[i][k]
                } catch (e) {
                    continue
                }
                if (!ds[i].disabled) {
                    m = (o = ds[i][k]).length;
                    for (j = m - 1; j >= 0; j--) {
                        if ((v = o[j]).selectorText && !v.disabled) {
                            selectorText = ns._rep(v.selectorText);
                            if (_.arr.indexOf(selectorText.split(/\s*,\s*/g), selector) != -1) {
                                if (!cssValue) {
                                    return (v.style[cssKey] || "").replace(/^\"|\"$/g, "")
                                } else {
                                    if (cssValue === v.style[cssKey]) {
                                        return ds[i].ownerNode || ds[i].owningElement
                                    }
                                }
                            }
                        }
                    }
                }
            }
        },
        _addRules: function (selector, value) {
            var ns = this,
                target = ns._getLast(),
                changed = target.sheet || target.styleSheet;
            if (changed.insertRule) {
                changed.insertRule(ns._build(selector, value), changed[ns._r].length)
            } else {
                if (changed.addRule) {
                    changed.addRule(selector, ns._build(selector, value, true))
                }
            }
            target.disabled = true;
            target.disabled = false;
            return ns
        },
        resetCSS: function () {
            var b = xui.browser,
                css = "html{color:#000;background:#FFF;}body,div,dl,dt,dd,ul,ol,li,h1,h2,h3,h4,h5,h6,pre,code,form,fieldset,legend,input,textarea,p,blockquote,th,td{margin:0;padding:0;}table{border-collapse:collapse;border-spacing:0;}fieldset,img{border:0;}address,caption,cite,code,dfn,em,strong,th,ar{font-style:normal;font-weight:normal;}li{list-style:none;}caption,th{text-align:left;}h1,h2,h3,h4,h5,h6{font-size:100%;font-weight:normal;}q:before,q:after{content:'';}abbr,acronym{border:0;font-variant:normal;}sup{vertical-align:text-top;}sub{vertical-align:text-bottom;}input,textarea,select{font-family:inherit;font-size:inherit;font-weight:inherit;}input,textarea,select{*font-size:100%;}legend{color:#000;}span{outline-offset:-1px;" + (b.gek ? b.ver < 3 ? ((b.ver < 3 ? "-moz-outline-offset:-1px !important;" : "") + "display:-moz-inline-block;display:-moz-inline-box;display:inline-block;") : "display:inline-block;" : b.ie6 ? "display:inline-box;display:inline;" : "display:inline-block;") + (b.ie ? "zoom:1;" : "") + "}";
            this.addStyleSheet(css, "xui.CSSreset")
        }
    },
    Initialize: function () {
        var b = xui.browser,
            css = ".xui-node{margin:0;padding:0;line-height:1.22em;}.xui-wrapper{color:#000;font-family:arial,helvetica,clean,sans-serif;font-style:normal;font-weight:normal;font-size:12px;vertical-align:middle;}.xui-node-table{border-collapse:collapse;border-spacing:0;empty-cells:show;font-size:inherit;" + (b.ie ? "font:100%;" : "") + "}.xui-node-fieldset,.xui-node-img{border:0;}.xui-node-ol,.xui-node-ul,.xui-node-li{list-style:none;}.xui-node-caption,.xui-node-th{text-align:left;}.xui-node-th{font-weight:normal;}.xui-node-q:before,.xui-node-q:after{content:'';}.xui-node-abbr,.xui-node-acronym{border:0;font-variant:normal;}.xui-node-sup{vertical-align:text-top;}.xui-node-sub{vertical-align:text-bottom;}.xui-node-input,.xui-node-textarea,.xui-node-select{cursor:text;font-family:inherit;font-size:inherit;font-weight:inherit;" + (b.ie ? "font-size:100%;" : "") + "}.xui-node-del,.xui-node-ins{text-decoration:none;}.xui-node-pre,.xui-node-code,.xui-node-kbd,.xui-node-samp,.xui-node-tt{font-family:monospace;" + (b.ie ? "font-size:108%;" : "") + "line-height:100%;}.xui-node-select,.xui-node-input,.xui-node-button,.xui-node-textarea{font:99% arial,helvetica,clean,sans-serif;border-width:1px;}.xui-node-a{cursor:pointer;color:#0000ee;text-decoration:none;}.xui-node-a:hover{color:red}" + (b.gek ? (".xui-node-a:focus{outline-offset:-1px;" + (b.ver < 3 ? "-moz-outline-offset:-1px !important" : "") + "}") : "") + ".xui-node-span, .xui-node-div{border:0;font-size:12px;}.xui-node-span, .xui-wrapper span{outline-offset:-1px;" + (b.gek ? b.ver < 3 ? ((b.ver < 3 ? "-moz-outline-offset:-1px !important;" : "") + "display:-moz-inline-block;display:-moz-inline-box;display:inline-block;") : "display:inline-block;" : b.ie6 ? "display:inline-box;display:inline;" : "display:inline-block;") + (b.ie ? "zoom:1;" : "") + "}.xui-node-h1,.xui-node-h2,.xui-node-h3,.xui-node-h4,.xui-node-h5,.xui-node-h6{font-size:100%;font-weight:normal;}.xui-node-h1{font-size:138.5%;}.xui-node-h2{font-size:123.1%;}.xui-node-h3{font-size:108%;}.xui-node-h1,.xui-node-h2,.xui-node-h3{margin:1em 0;}.xui-node-h1,.xui-node-h2,.xui-node-h3,.xui-node-h4,.xui-node-h5,.xui-node-h6,.xui-node-strong{font-weight:bold;}.xui-node-em{font-style:italic;}.xui-node-legend{color:#000;}" + (b.ie6 ? ("#" + xui.$localeDomId + "{vertical-align:baseline;}") : "") + ".xui-nooutline:focus{outline:0;}.xui-cls-wordwrap{white-space: pre-wrap;" + (b.gek ? "white-space: -moz-pre-wrap;" : "") + (b.opr ? "white-space: -pre-wrap;" : "") + (b.opr ? "white-space: -o-pre-wrap;" : "") + (b.ie ? "word-wrap: break-word;" : "") + "}";
        this.addStyleSheet(css, "xui.CSS")
    }
});
Class("xui.DomProfile", "xui.absProfile", {
    Constructor: function (domId) {
        if (arguments.callee.upper) {
            arguments.callee.upper.call(this)
        }
        xui.$cache.profileMap[this.domId = domId] = this
    },
    Instance: {
        __gc: function () {
            delete xui.$cache.profileMap[this.domId]
        },
        _getEV: function (funs, id, name) {
            var t = xui.$cache.profileMap[id];
            if (t && (t = t.events) && (t = t[name])) {
                for (var i = 0, l = t.length; i < l; i++) {
                    if (typeof t[t[i]] == "function") {
                        funs[funs.length] = t[t[i]]
                    }
                }
            }
        }
    },
    Static: {
        get: function (id) {
            return xui.$cache.profileMap[id]
        },
        $abstract: true
    }
});
Class("xui.Dom", "xui.absBox", {
    Instance: {
        get: function (index) {
            var purge = xui.$cache.domPurgeData,
                t = this._nodes,
                s;
            if (_.isNumb(index)) {
                return (s = t[index]) && (s = purge[s]) && s.element
            } else {
                var a = [],
                    l = t.length;
                for (var i = 0; i < l; i++) {
                    a[a.length] = (s = purge[t[i]]) && s.element
                }
                return a
            }
        },
        each: function (fun) {
            var ns = this,
                purge = xui.$cache.domPurgeData,
                n;
            for (var i = 0, j = ns._nodes, l = j.length; i < l; i++) {
                if ((n = purge[j[i]]) && (n = n.element)) {
                    if (false === fun.call(ns, n, i)) {
                        break
                    }
                }
            }
            n = null;
            return ns
        },
        serialize: function () {
            var a = [];
            this.each(function (o) {
                a[a.length] = o.id
            });
            return "xui(['" + a.join("','") + "'])"
        },
        xid: function () {
            return xui.getId(this.get(0))
        },
        id: function (value, ignoreCache) {
            var t, i, cache = xui.$cache.profileMap;
            if (typeof value == "string") {
                return this.each(function (o) {
                    if ((i = o.id) !== value) {
                        if (!ignoreCache && (t = cache[i])) {
                            cache[value] = t;
                            delete cache[i]
                        }
                        o.id = value
                    }
                })
            } else {
                return this.get(0).id
            }
        },
        $sum: function (fun, args) {
            var arr = [],
                r, i;
            this.each(function (o) {
                r = fun.apply(o, args || []);
                if (r) {
                    if (_.isArr(r)) {
                        for (i = 0; o = r[i]; i++) {
                            arr[arr.length] = o
                        }
                    } else {
                        arr[arr.length] = r
                    }
                }
            });
            return xui(arr)
        },
        children: function () {
            return this.$sum(function () {
                return _.toArr(this.childNodes)
            })
        },
        clone: function (deep) {
            return this.$sum(function () {
                var n = this.cloneNode(deep ? true : false),
                    children = n.getElementsByTagName("*"),
                    ie = xui.browser.ie && xui.browser.ver < 9,
                    i = 0,
                    o;
                if (ie) {
                    n.removeAttribute("$xid")
                } else {
                    delete n.$xid
                }
                for (; o = children[i]; i++) {
                    if (ie) {
                        o.removeAttribute("$xid")
                    } else {
                        delete o.$xid
                    }
                }
                return n
            }, arguments)
        },
        $iterator: function (type, dir, inn, fun, top) {
            return this.$sum(function (type, dir, inn, fun, top) {
                var self = arguments.callee;
                if (typeof fun != "function") {
                    var count = fun || 0;
                    fun = function (n, index) {
                        return index == count
                    }
                }
                var index = 0,
                    m, n = this,
                    flag = 0,
                    t;
                while (n) {
                    if (n.nodeType == 1) {
                        if (fun(n, index++) === true) {
                            break
                        }
                    }
                    if (type == "x") {
                        n = dir ? n.nextSibling : n.previousSibling
                    } else {
                        if (type == "y") {
                            n = dir ? self.call(dir === 1 ? n.lastChild : n.firstChild, "x", (dir !== 1), true, 0, top) : n.parentNode
                        } else {
                            inn = _.isBool(inn) ? inn : true;
                            m = null;
                            n = dir ? (t = inn && n.firstChild) ? t : (t = n.nextSibling) ? t : (m = n.parentNode) : (t = inn && n.lastChild) ? t : (t = n.previousSibling) ? t : (m = n.parentNode);
                            if (m) {
                                while (!(m = dir ? n.nextSibling : n.previousSibling)) {
                                    n = n.parentNode;
                                    if (!n) {
                                        if (flag) {
                                            return null
                                        } else {
                                            flag = true;
                                            m = dir ? document.body.firstChild : document.body.lastChild;
                                            break
                                        }
                                    }
                                }
                                n = m
                            }
                            inn = true
                        }
                    }
                }
                return n
            }, arguments)
        },
        query: function (tagName, property, expr) {
            tagName = tagName || "*";
            var f = "getElementsByTagName",
                me = arguments.callee,
                f1 = me.f1 || (me.f1 = function (tag, attr, expr) {
                    var all = this[f](tag),
                        arr = [];
                    if (expr.test(this[attr])) {
                        arr[arr.length] = this
                    }
                    for (var o, i = 0; o = all[i]; i++) {
                        if (expr.test(o[attr])) {
                            arr[arr.length] = o
                        }
                    }
                    return arr
                }),
                f2 = me.f2 || (me.f2 = function (tag, attr, expr) {
                    var all = this[f](tag),
                        arr = [];
                    if (this[attr] == expr) {
                        arr[arr.length] = this
                    }
                    for (var o, i = 0; o = all[i]; i++) {
                        if (o[attr] == expr) {
                            arr[arr.length] = o
                        }
                    }
                    return arr
                }),
                f3 = me.f3 || (me.f3 = function (tag, attr, expr) {
                    var all = this[f](tag),
                        arr = [];
                    if (this[attr]) {
                        arr[arr.length] = this
                    }
                    for (var o, i = 0; o = all[i]; i++) {
                        if (o[attr]) {
                            arr[arr.length] = o
                        }
                    }
                    return arr
                }),
                f4 = me.f4 || (me.f4 = function (tag) {
                    return _.toArr(this[f](tag))
                }),
                f5 = me.f5 || (me.f5 = function (tag, attr) {
                    var all = this[f](tag),
                        arr = [];
                    if (attr(this)) {
                        arr[arr.length] = this
                    }
                    for (var o, i = 0; o = all[i]; i++) {
                        if (attr(o)) {
                            arr[arr.length] = o
                        }
                    }
                    return arr
                });
            return this.$sum(property ? typeof property == "function" ? f5 : expr ? expr.constructor == RegExp ? f1 : f2 : f3 : f4, [tagName, property, expr])
        },
        $add: function (fun, target, reversed) {
            if (_.isHash(target) || _.isStr(target)) {
                target = xui.create(target)
            }
            if (reversed) {
                reversed = xui(target);
                target = this
            } else {
                target = xui(target);
                reversed = this
            }
            if (target._nodes.length) {
                var one = reversed.get(0),
                    ns = target.get(),
                    dom = xui.Dom,
                    cache = xui.$cache.profileMap,
                    fragment, uiObj, p, i, o, j, v, uiObj, arr = [];
                target.each(function (o) {
                    uiObj = (p = o.id) && (p = cache[p]) && p.LayoutTrigger && dom.getStyle(one, "display") != "none" && p.LayoutTrigger;
                    if (uiObj) {
                        arr.push([uiObj, p])
                    }
                });
                if (ns.length == 1) {
                    fragment = ns[0]
                } else {
                    fragment = document.createDocumentFragment();
                    for (i = 0; o = ns[i]; i++) {
                        fragment.appendChild(o)
                    }
                }
                fun.call(one, fragment);
                for (i = 0; o = arr[i]; i++) {
                    for (j = 0; v = o[0][j]; j++) {
                        v.call(o[1])
                    }
                    if (o[1].onLayout) {
                        o[1].boxing().onLayout(o[1])
                    }
                }
                arr.length = 0;
                one = o = fragment = null
            }
            return this
        },
        prepend: function (target, reversed) {
            return this.$add(function (node) {
                if (this.previousSibling != node) {
                    if (this.firstChild) {
                        this.insertBefore(node, this.firstChild)
                    } else {
                        this.appendChild(node)
                    }
                }
            }, target, reversed)
        },
        append: function (target, reversed, force) {
            return this.$add(function (node) {
                if (force || this != node.parentNode) {
                    this.appendChild(node)
                }
            }, target, reversed)
        },
        addPrev: function (target, reversed) {
            return this.$add(function (node) {
                if (this.firstChild != node) {
                    this.parentNode.insertBefore(node, this)
                }
            }, target, reversed)
        },
        addNext: function (target, reversed) {
            return this.$add(function (node) {
                if (this.nextSibling != node) {
                    if (this.nextSibling) {
                        this.parentNode.insertBefore(node, this.nextSibling)
                    } else {
                        this.parentNode.appendChild(node)
                    }
                }
            }, target, reversed)
        },
        replace: function (target, triggerGC) {
            if (_.isHash(target) || _.isStr(target)) {
                target = xui.create(target)
            }
            target = xui(target);
            var v, i, c = this.get(0),
                ns = target.get(),
                l = ns.length;
            if (l > 0 && (v = ns[l - 1])) {
                c.parentNode.replaceChild(v, c);
                for (i = 0; i < l - 1; i++) {
                    v.parentNode.insertBefore(ns[i], v)
                }
                if (triggerGC) {
                    this.remove()
                }
            }
            c = v = null;
            return target
        },
        swap: function (target) {
            var self = this,
                t = xui.Dom.getEmptyDiv().html("*", false);
            if (_.isHash(target) || _.isStr(target)) {
                target = xui.create(target)
            }
            target = xui(target);
            self.replace(t, false);
            target.replace(self, false);
            t.replace(target, false);
            t.get(0).innerHTML = "";
            document.body.insertBefore(t.get(0), document.body.firstChild);
            return self
        },
        remove: function (triggerGC) {
            var c = xui.$getGhostDiv();
            if (triggerGC === false) {
                this.each(function (o, i) {
                    if (o.parentNode) {
                        o.parentNode.removeChild(o)
                    }
                })
            } else {
                this.each(function (o) {
                    c.appendChild(o)
                });
                xui.$purgeChildren(c);
                c.innerHTML = "";
                c = null
            }
            return this
        },
        empty: function (triggerGC) {
            return this.each(function (o) {
                xui([o]).html("", triggerGC)
            })
        },
        html: function (content, triggerGC, loadScripts) {
            var s = "",
                t, o = this.get(0);
            triggerGC = triggerGC !== false;
            if (content !== undefined) {
                if (o) {
                    if (o.nodeType == 3) {
                        o.nodeValue = content
                    } else {
                        if (!o.firstChild && content === "") {
                            return this
                        }
                        if (triggerGC) {
                            xui.$purgeChildren(o)
                        }
                        var scripts;
                        if (loadScripts) {
                            var reg1 = /(?:<script([^>]*)?>)((\n|\r|.)*?)(?:<\/script>)/ig,
                                reg2 = /(?:<script.*?>)((\n|\r|.)*?)(?:<\/script>)/ig,
                                reg3 = /\ssrc=([\'\"])(.*?)\1/i,
                                matched, attr, src;
                            scripts = [];
                            while ((matched = reg1.exec(content))) {
                                attr = matched[1];
                                src = attr ? attr.match(reg3) : false;
                                if (src && src[2]) {
                                    scripts.push([1, src[2]])
                                } else {
                                    if (matched[2] && matched[2].length > 0) {
                                        scripts.push([2, matched[2]])
                                    }
                                }
                            }
                            content = content.replace(reg2, "")
                        }
                        o.innerHTML = content;
                        if (scripts && scripts.length > 0) {
                            _.arr.each(scripts, function (s) {
                                if (s[0] == 1) {
                                    xui.include(null, s[1])
                                } else {
                                    _.exec(s[1])
                                }
                            })
                        }
                    }
                    o = null
                }
                return this
            } else {
                if (o) {
                    s = (o.nodeType == 3) ? o.nodeValue : o.innerHTML;
                    o = null
                }
                return s
            }
        },
        loadHtml: function (options, onStart, onEnd) {
            var ns = this;
            if (typeof options == "string") {
                options = {
                    url: options
                }
            }
            _.tryF(onStart);
            xui.Ajax(options.url, options.query, function (rsp) {
                var n = xui.create("div");
                n.html(rsp, false, true);
                ns.append(n.children());
                _.tryF(onEnd)
            }, function (err) {
                ns.append("<div>" + err + "</div>");
                _.tryF(onEnd)
            }, null, options.options).start()
        },
        loadIframe: function (options) {
            if (typeof options == "string") {
                options = {
                    url: options
                }
            }
            var id = "aiframe_" + _(),
                e = xui.browser.ie && xui.browser.ver < 9,
                ifr = document.createElement(e ? "<iframe name='" + id + "'>" : "iframe");
            ifr.id = ifr.name = id;
            ifr.src = options.url;
            ifr.frameBorder = "0";
            ifr.marginWidth = "0";
            ifr.marginHeight = "0";
            ifr.vspace = "0";
            ifr.hspace = "0";
            ifr.allowTransparency = "true";
            ifr.width = "100%";
            ifr.height = "100%";
            this.append(ifr);
            xui.Dom.submit(options.url, options.query, options.method, ifr.name, options.enctype)
        },
        outerHTML: function (content, triggerGC) {
            var self = this,
                t, s = "",
                o = self.get(0),
                id = o.id;
            if (content !== undefined) {
                var n = self.replace(_.str.toDom(content), false);
                self._nodes[0] = n._nodes[0];
                xui([o]).remove(triggerGC);
                return self
            } else {
                if (xui.browser.gek) {
                    var m = xui.$getGhostDiv();
                    m.appendChild(self.get(0).cloneNode(true));
                    s = m.innerHTML;
                    m.innerHTML = "";
                    m = null
                } else {
                    s = o.outerHTML
                }
                o = null;
                return s
            }
        },
        text: function (content) {
            if (content !== undefined) {
                var self = this,
                    arr = [];
                self.each(function (o) {
                    var t = o.firstChild;
                    if (t && t.nodeType != 1) {
                        t.nodeValue = content
                    } else {
                        arr[arr.length] = o
                    }
                });
                if (arr.length) {
                    xui(arr).empty().each(function (o) {
                        o.appendChild(document.createTextNode(content))
                    })
                }
                return self
            } else {
                return (function (o) {
                    var i, a = o.childNodes,
                        l = a.length,
                        content = "",
                        me = arguments.callee;
                    for (i = 0; i < l; i++) {
                        if (a[i].nodeType != 8) {
                            content += (a[i].nodeType != 1) ? a[i].nodeValue : me(a[i])
                        }
                    }
                    return content
                })(this.get(0))
            }
        },
        attr: function (name, value) {
            var self = this,
                me = arguments.callee,
                map1 = me.map1 || (me.map1 = {
                    "class": "className",
                    readonly: "readOnly",
                    tabindex: "tabIndex",
                    "for": "htmlFor",
                    maxlength: "maxLength",
                    cellspacing: "cellSpacing",
                    rowspan: "rowSpan",
                    value: "value"
                }),
                map2 = me.map2 || (me.map2 = {
                    href: 1,
                    src: 1,
                    style: 1
                });
            if (typeof name == "object") {
                for (var i in name) {
                    me.call(self, i, name[i])
                }
                return self
            }
            var iestyle = xui.browser.ie && name == "style",
                normal = !map2[name = map1[name] || name];
            if (value !== undefined) {
                return self.each(function (o) {
                    if (value === null) {
                        if (iestyle) {
                            o.style.cssText = ""
                        } else {
                            if (normal) {
                                try {
                                    o[name] = null;
                                    if (o.nodeType == 1) {
                                        o.removeAttribute(name)
                                    }
                                } catch (e) {}
                            }
                        }
                    } else {
                        if (iestyle) {
                            o.style.cssText = "" + value
                        } else {
                            if (normal) {
                                o[name] = value;
                                if (o.nodeType == 1 && name != "value" && typeof value == "string") {
                                    o.setAttribute(name, value)
                                }
                            } else {
                                o.setAttribute(name, value)
                            }
                        }
                    }
                })
            } else {
                var r, o = self.get(0);
                if (iestyle) {
                    return o.style.cssText
                }
                if (name == "selected" && xui.browser.kde) {
                    return o.parentNode.selectedIndex
                }
                r = ((name in o) && normal) ? o[name] : o.getAttribute(name, xui.browser.ie && !normal ? 2 : undefined);
                o = null;
                return r
            }
        },
        $touchscroll: function (type) {
            if (xui.browser.isTouch && (xui.browser.isAndroid || xui.browser.isBB)) {
                var hash = {
                    x: 1,
                    y: 1,
                    xy: 1
                },
                    opx = 0,
                    opy = 0,
                    ox = null,
                    oy = null,
                    nodes = this._nodes;
                if (!hash[type]) {
                    type = null
                }
                xui(nodes).onTouchstart(hash[type] ?
                function (p, e, src) {
                    if (xui.DragDrop._profile.isWorking) {
                        return true
                    }
                    var s = e.touches[0],
                        t = xui(src).get(0);
                    if (t) {
                        if (type == "xy" || type == "x") {
                            opx = s.pageX
                        }
                        if (type == "xy" || type == "y") {
                            opy = s.pageY
                        }
                    }
                    return true
                } : null);
                xui(nodes).onTouchmove(hash[type] ?
                function (p, e, src) {
                    if (xui.DragDrop._profile.isWorking) {
                        return true
                    }
                    var s = e.touches[0],
                        t = xui(src).get(0),
                        x1, y1, first;
                    if (t) {
                        x1 = t.scrollLeft;
                        y1 = t.scrollTop;
                        if (type == "xy" || type == "x") {
                            if (ox === null) {
                                first = 1;
                                ox = t.scrollLeft + s.pageX + (opx == s.pageX ? 0 : opx > s.pageX ? 1 : -1) * 10
                            }
                            t.scrollLeft = ox - s.pageX
                        }
                        if (type == "xy" || type == "y") {
                            if (oy === null) {
                                first = 1;
                                oy = t.scrollTop + s.pageY + (opy == s.pageY ? 0 : opy > s.pageY ? 1 : -1) * 10
                            }
                            t.scrollTop = oy - s.pageY
                        }
                        return (!first) && x1 == t.scrollLeft && y1 == t.scrollTop
                    }
                } : null);
                xui(nodes).onTouchend(hash[type] ?
                function (p, e, src) {
                    if (xui.DragDrop._profile.isWorking) {
                        return true
                    }
                    ox = oy = null
                } : null)
            }
            return this
        },
        css: function (name, value) {
            if (typeof name == "object" || value !== undefined) {
                this.each(function (o) {
                    xui.Dom.setStyle(o, name, value)
                });
                if (xui.browser.isTouch && (xui.browser.isAndroid || xui.browser.isBB)) {
                    if (name == "overflow" || name == "overflow-x" || name == "overflow-y") {
                        if (value == "auto" || value == "scroll") {
                            this.$touchscroll(name == "overflow" ? "xy" : name == "overflow-x" ? "x" : "y")
                        } else {
                            this.$touchscroll(null)
                        }
                    }
                }
                return this
            } else {
                return xui.Dom.getStyle(this.get(0), name)
            }
        },
        caret: function (begin, end) {
            var input = this.get(0),
                tn = input.tagName.toLowerCase(),
                type = typeof begin,
                ie = xui.browser.ie,
                pos;
            if (!/^(input|textarea)$/i.test(tn)) {
                return
            }
            if (tn == "input" && input.type.toLowerCase() != "text" && input.type.toLowerCase() != "password") {
                return
            }
            input.focus();
            if (type == "number") {
                if (ie) {
                    var r = input.createTextRange();
                    r.collapse(true);
                    r.moveEnd("character", end);
                    r.moveStart("character", begin);
                    r.select()
                } else {
                    input.setSelectionRange(begin, end)
                }
                return this
            } else {
                if (type == "string") {
                    var r = this.caret(),
                        l = 0,
                        m = 0,
                        ret, v = input.value,
                        reg1 = /\r/g;
                    if (ie) {
                        l = v.substr(0, r[0]).match(reg1);
                        l = (l && l.length) || 0;
                        m = begin.match(reg1);
                        m = (m && m.length) || 0
                    }
                    if (xui.browser.opr) {
                        l = begin.match(/\n/g);
                        l = (l && l.length) || 0;
                        m = begin.match(/\r\n/g);
                        m = (m && m.length) || 0;
                        m = l - m;
                        l = 0
                    }
                    input.value = v.substr(0, r[0]) + begin + v.substr(r[1], v.length);
                    ret = r[0] - l + m + begin.length;
                    this.caret(ret, ret);
                    return ret
                } else {
                    if (ie) {
                        var r = document.selection.createRange(),
                            txt = r.text,
                            l = txt.length,
                            e, m;
                        if (tn.toLowerCase() == "input") {
                            r.moveStart("character", -input.value.length);
                            e = r.text.length;
                            return [e - l, e]
                        } else {
                            var rb = r.duplicate();
                            rb.moveToElementText(input);
                            rb.setEndPoint("EndToEnd", r);
                            e = rb.text.length;
                            return [e - l, e]
                        }
                    } else {
                        return [input.selectionStart, input.selectionEnd]
                    }
                }
            }
        },
        show: function (left, top) {
            var style, t, auto = "auto",
                v = xui.Dom.HIDE_VALUE,
                vv;
            return this.each(function (o) {
                if (o.nodeType != 1) {
                    return
                }
                style = o.style;
                vv = xui.getNodeData(o);
                if (t = (top || (style.top == v && (vv._top || auto)))) {
                    style.top = t
                }
                if (t = (left || (style.left == v && (vv._left || auto)))) {
                    style.left = t
                }
                if (t = vv._position) {
                    if (style.position != t) {
                        style.position = t
                    }
                }
                vv._xuihide = 0;
                if (style.visibility != "visible") {
                    style.visibility = "visible"
                }
            })
        },
        hide: function () {
            var style, t, vv;
            return this.each(function (o) {
                if (o.nodeType != 1) {
                    return
                }
                style = o.style;
                t = xui([o]);
                vv = xui.getNodeData(o);
                if (vv._xuihide !== 1) {
                    vv._position = style.position;
                    vv._top = style.top;
                    vv._left = style.left;
                    vv._xuihide = 1
                }
                if (style.position != "absolute") {
                    style.position = "absolute"
                }
                style.top = style.left = xui.Dom.HIDE_VALUE
            })
        },
        cssRegion: function (region, triggerEvent) {
            var self = this;
            if (typeof region == "object") {
                var i, t, m, node = self.get(0),
                    dom = xui.Dom,
                    f = dom._setPxStyle,
                    m = {};
                for (var j = 0, c = dom._boxArr; i = c[j++];) {
                    m[i] = ((i in region) && region[i] !== null) ? f(node, i, region[i]) : false
                }
                if (triggerEvent) {
                    var f = dom.$hasEventHandler;
                    if (f(node, "onsize") && (m.width || m.height)) {
                        self.onSize(true, {
                            width: m.width,
                            height: m.height
                        })
                    }
                    if (f(node, "onmove") && (m.left || m.top)) {
                        self.onMove(true, {
                            left: m.left,
                            top: m.top
                        })
                    }
                }
                return self
            } else {
                var offset = region,
                    parent = triggerEvent,
                    pos = offset ? self.offset(null, parent) : self.cssPos(),
                    size = self.cssSize();
                return {
                    left: pos.left,
                    top: pos.top,
                    width: size.width,
                    height: size.height
                }
            }
        },
        cssSize: function (size, triggerEvent) {
            var self = this,
                node = self.get(0),
                r, dom = xui.Dom,
                f = dom._setPxStyle,
                b1, b2;
            if (size) {
                var t;
                b1 = size.width !== null ? f(node, "width", size.width) : false;
                b2 = size.height !== null ? f(node, "height", size.height) : false;
                if (triggerEvent && (b1 || b2) && dom.$hasEventHandler(node, "onsize")) {
                    self.onSize(true, {
                        width: b1,
                        height: b2
                    })
                }
                r = self
            } else {
                r = {
                    width: self._W(node, 1) || 0,
                    height: self._H(node, 1)
                }
            }
            return r
        },
        cssPos: function (pos, triggerEvent) {
            var node = this.get(0),
                dom = xui.Dom,
                f = dom._setPxStyle,
                b1, b2, r;
            if (pos) {
                var t;
                b1 = pos.left != null ? f(node, "left", pos.left) : false;
                b2 = pos.top !== null ? f(node, "top", pos.top) : false;
                if (triggerEvent && (b1 || b2) && dom.$hasEventHandler(node, "onmove")) {
                    this.onMove(true, {
                        left: b1,
                        top: b2
                    })
                }
                r = this
            } else {
                f = dom.getStyle;
                r = {
                    left: parseInt(f(node, "left"), 10) || 0,
                    top: parseInt(f(node, "top"), 10) || 0
                }
            }
            node = null;
            return r
        },
        offset: function (pos, boundary) {
            var r, t, browser = xui.browser,
                ns = this,
                node = ns.get(0),
                keepNode = node,
                parent = node.parentNode,
                op = node.offsetParent,
                doc = node.ownerDocument,
                dd = doc.documentElement,
                db = doc.body,
                _d = /^inline|table.*$/i,
                getStyle = xui.Dom.getStyle,
                fixed = getStyle(node, "position") == "fixed",
                me = arguments.callee,
                add = me.add || (me.add = function (pos, l, t) {
                    pos.left += parseInt(l, 10) || 0;
                    pos.top += parseInt(t, 10) || 0
                }),
                border = me.border || (me.border = function (node, pos) {
                    add(pos, getStyle(node, "borderLeftWidth"), getStyle(node, "borderTopWidth"))
                }),
                TTAG = me.TTAG || (me.TTAG = {
                    TABLE: 1,
                    TD: 1,
                    TH: 1
                }),
                HTAG = me.HTAG || (me.HTAG = {
                    BODY: 1,
                    HTML: 1
                }),
                posDiff = me.posDiff || (me.posDiff = function (o, target) {
                    var cssPos = o.cssPos(),
                        absPos = o.offset(null, target);
                    return {
                        left: absPos.left - cssPos.left,
                        top: absPos.top - cssPos.top
                    }
                });
            boundary = boundary ? xui(boundary).get(0) : doc;
            if (pos) {
                if (pos.left === null && pos.top === null) {
                    return ns
                }
                var d = posDiff(ns, boundary);
                ns.cssPos({
                    left: pos.left === null ? null : (pos.left - d.left),
                    top: pos.top === null ? null : (pos.top - d.top)
                });
                r = ns
            } else {
                if (!(xui.browser.gek && node === document.body) && node.getBoundingClientRect) {
                    t = node.getBoundingClientRect();
                    pos = {
                        left: t.left,
                        top: t.top
                    };
                    if (boundary.nodeType == 1 && boundary !== document.body) {
                        add(pos, -(t = boundary.getBoundingClientRect()).left + boundary.scrollLeft, -t.top + boundary.scrollTop)
                    } else {
                        add(pos, Math.max(dd.scrollLeft, db.scrollLeft) - dd.clientLeft, Math.max(dd.scrollTop, db.scrollTop) - dd.clientTop)
                    }
                } else {
                    pos = {
                        left: 0,
                        top: 0
                    };
                    add(pos, node.offsetLeft, node.offsetTop);
                    while (op && op != boundary && op != boundary.offsetParent) {
                        add(pos, op.offsetLeft, op.offsetTop);
                        if (browser.kde || (browser.gek && !TTAG[op.tagName])) {
                            border(op, pos)
                        }
                        if (!fixed && getStyle(op, "position") == "fixed") {
                            fixed = true
                        }
                        if (op.tagName != "BODY") {
                            keepNode = op.tagName == "BODY" ? keepNode : op
                        }
                        op = op.offsetParent
                    }
                    while (parent && parent.tagName && parent != boundary && !HTAG[parent.tagName]) {
                        if (!_d.test(getStyle(parent, "display"))) {
                            add(pos, -parent.scrollLeft, -parent.scrollTop)
                        }
                        if (browser.gek && getStyle(parent, "overflow") != "visible") {
                            border(parent, pos)
                        }
                        parent = parent.parentNode
                    }
                    if ((browser.gek && getStyle(keepNode, "position") != "absolute")) {
                        add(pos, -db.offsetLeft, -db.offsetTop)
                    }
                    if (fixed) {
                        add(pos, Math.max(dd.scrollLeft, db.scrollLeft), Math.max(dd.scrollTop, db.scrollTop))
                    }
                }
                r = pos
            }
            return r
        },
        hasClass: function (name) {
            var arr = this.get(0).className.split(/\s+/);
            return _.arr.indexOf(arr, name) != -1
        },
        addClass: function (name) {
            var arr, t, me = arguments.callee,
                reg = (me.reg || (me.reg = /\s+/));
            return this.each(function (o) {
                arr = (t = o.className).split(reg);
                if (_.arr.indexOf(arr, name) == -1) {
                    o.className = t + " " + name
                }
            })
        },
        removeClass: function (name) {
            var arr, i, l, a, t, bs = typeof name == "string",
                me = arguments.callee,
                reg = (me.reg || (me.reg = /\s+/));
            return this.each(function (o) {
                arr = o.className.split(reg);
                l = arr.length;
                a = [];
                for (i = 0; t = arr[i]; i++) {
                    if (bs ? (t != name) : (!name.test(String(t)))) {
                        a[a.length] = t
                    }
                }
                if (l != a.length) {
                    o.className = a.join(" ")
                }
            })
        },
        replaceClass: function (regexp, replace) {
            var n, r;
            return this.each(function (o) {
                r = (n = o.className).replace(regexp, replace);
                if (n != r) {
                    o.className = r
                }
            })
        },
        tagClass: function (tag, isAdd) {
            var self = this,
                me = arguments.callee,
                r1 = me["_r1_" + tag] || (me["_r1_" + tag] = new RegExp("([-\\w]+" + tag + "[-\\w]*)")),
                r2 = me._r2 || (me._r2 = /([-\w]+)/g);
            self.removeClass(r1);
            return (false === isAdd) ? self : self.replaceClass(r2, "$1 $1" + tag)
        },
        $addEventHandler: function (name) {
            var event = xui.Event,
                type, handler = event.$eventhandler;
            return this.each(function (o) {
                if (o.nodeType == 3) {
                    return
                }
                xui.setNodeData(o, ["eHandlers", "on" + event._eventMap[name]], handler);
                if (type = event._eventHandler[name]) {
                    o[type] = handler;
                    xui.setNodeData(o, ["eHandlers", type], handler)
                }
            })
        },
        $removeEventHandler: function (name) {
            var event = xui.Event,
                type;
            return this.each(function (o) {
                if (type = event._eventHandler[name]) {
                    o[type] = null
                }
                if (o = xui.getNodeData(o, "eHandlers")) {
                    delete o["on" + event._eventMap[name]]
                }
            })
        },
        $addEvent: function (name, fun, label, index) {
            var self = this,
                event = xui.Event,
                arv = _.arr.removeValue,
                ari = _.arr.insertAny,
                id, c, t, m;
            if (!index && index !== 0) {
                index = -1
            }
            if (typeof label == "string") {
                label = "$" + label
            } else {
                label = undefined
            }
            self.$addEventHandler(name).each(function (o) {
                if (o.nodeType == 3) {
                    return
                }
                if (!(id = event.getId(o))) {
                    id = o.id = xui.Dom._pickDomId()
                }
                if (!(c = xui.$cache.profileMap[id])) {
                    c = new xui.DomProfile(id)
                }
                t = c.events || (c.events = {});
                m = t[name] || (t[name] = []);
                if (label === undefined) {
                    m.length = 0;
                    m = t[name] = [];
                    index = -1;
                    label = "_"
                }
                m[label] = fun;
                arv(m, label);
                if (index == -1) {
                    m[m.length] = label
                } else {
                    ari(m, label, index)
                }
                if (xui.Event && (c = xui.Event._getProfile(id)) && c.clearCache) {
                    c.clearCache()
                }
            });
            return self
        },
        $removeEvent: function (name, label, bAll) {
            var self = this,
                c, t, k, id, i, type, event = xui.Event,
                dom = xui.$cache.profileMap,
                type = event._eventMap[name];
            self.each(function (o) {
                if (!(id = event.getId(o))) {
                    return
                }
                if (!(c = dom[id])) {
                    return
                }
                if (!(t = c.events)) {
                    return
                }
                if (bAll) {
                    _.arr.each(event._getEventName(type), function (o) {
                        delete t[o]
                    })
                } else {
                    if (typeof label == "string") {
                        label = "$" + label;
                        if (k = t[name]) {
                            if (_.arr.indexOf(k, label) != -1) {
                                _.arr.removeValue(k, label)
                            }
                            delete k[label]
                        }
                    } else {
                        delete t[name]
                    }
                }
                if (xui.Event && (c = xui.Event._getProfile(id)) && c.clearCache) {
                    c.clearCache()
                }
            });
            return self
        },
        $getEvent: function (name, label) {
            var id;
            if (!(id = xui.Event.getId(this.get(0)))) {
                return
            }
            if (label) {
                return _.get(xui.$cache.profileMap, [id, "events", name, "$" + label])
            } else {
                var r = [],
                    arr = _.get(xui.$cache.profileMap, [id, "events", name]);
                _.arr.each(arr, function (o, i) {
                    r[r.length] = {
                        o: arr[o]
                    }
                });
                return r
            }
        },
        $clearEvent: function () {
            return this.each(function (o) {
                if (!(o = xui.Event.getId(o))) {
                    return
                }
                if (!(o = xui.$cache.profileMap[o])) {
                    return
                }
                _.breakO(o.events, 2);
                delete o.events;
                _.arr.each(xui.Event._events, function (s) {
                    o["on" + s] = null
                })
            })
        },
        $fireEvent: function (name, args) {
            var type = xui.Event._eventMap[name],
                t, s = "on" + type,
                handler, hash, me = arguments.callee,
                f = xui.Event.$eventhandler,
                f1 = me.f1 || (me.f1 = function () {
                    this.returnValue = false
                }),
                f2 = me.f2 || (me.f2 = function () {
                    this.cancelBubble = true
                });
            return this.each(function (o) {
                if (!(handler = xui.getNodeData(o, ["eHandlers", s]))) {
                    return
                }
                if ("blur" == type || "focus" == type) {
                    try {
                        o[type]()
                    } catch (e) {}
                } else {
                    hash = _.copy(args);
                    _.merge(hash, {
                        type: type,
                        target: o,
                        button: 1,
                        $e: true,
                        $name: name,
                        preventDefault: f1,
                        stopPropagation: f2
                    }, "all");
                    handler.call(o, hash)
                }
            })
        },
        nativeEvent: function (name) {
            return this.each(function (o) {
                if (o.nodeType === 3 || o.nodeType === 8) {
                    return
                }
                try {
                    o[name]()
                } catch (e) {}
            })
        },
        $canFocus: function () {
            var me = arguments.callee,
                getStyle = xui.Dom.getStyle,
                map = me.map || (me.map = {
                    a: 1,
                    input: 1,
                    select: 1,
                    textarea: 1,
                    button: 1,
                    object: 1
                }),
                t, node;
            return !!((node = this.get(0)) && node.focus && (((t = map[node.tagName.toLowerCase()]) && !(parseInt(node.tabIndex, 10) <= -1)) || (!t && parseInt(node.tabIndex, 10) >= (xui.browser.ie ? 1 : 0))) && getStyle(node, "display") != "none" && getStyle(node, "visibility") != "hidden" && node.offsetWidth > 0 && node.offsetHeight > 0)
        },
        focus: function (force) {
            var ns = this;
            if (force || ns.$canFocus()) {
                try {
                    ns.get(0).focus()
                } catch (e) {}
            }
            return ns
        },
        setSelectable: function (value) {
            var me = arguments.callee,
                cls;
            this.removeClass("xui-ui-selectable").removeClass("xui-ui-unselectable");
            this.addClass(value ? "xui-ui-selectable" : "xui-ui-unselectable");
            return this.each(function (o) {
                if (xui.browser.ie) {
                    o._onxuisel = value ? "true" : "false"
                }
            })
        },
        setInlineBlock: function () {
            var ns = this;
            if (xui.browser.gek) {
                if (xui.browser.ver < 3) {
                    ns.css("display", "-moz-inline-block").css("display", "-moz-inline-box").css("display", "inline-block")
                } else {
                    ns.css("display", "inline-block")
                }
            } else {
                if (xui.browser.ie6) {
                    ns.css("display", "inline-block").css({
                        display: "inline",
                        zoom: "1"
                    })
                } else {
                    ns.css("display", "inline-block")
                }
            }
            return ns
        },
        topZindex: function (flag) {
            var i = 1000,
                j = 0,
                k, node = this.get(0),
                p = node.offsetParent,
                t, o;
            if (xui.browser.ie && (p.tagName + "").toUpperCase() == "HTML") {
                p = xui("body").get(0)
            }
            if (node.nodeType != 1 || !p) {
                return 1
            }
            t = p.childNodes;
            for (k = 0; o = t[k]; k++) {
                if (o == node || o.nodeType != 1 || !o.$xid || o.style.display == "none" || o.style.visibility == "hidden" || xui.getNodeData(o, "zIndexIgnore")) {
                    continue
                }
                j = parseInt(o.style && o.style.zIndex, 10) || 0;
                i = i > j ? i : j
            }
            i++;
            if (i >= xui.Dom.TOP_ZINDEX) {
                xui.Dom.TOP_ZINDEX = i + 1000
            }
            if (flag) {
                node.style.zIndex = i
            } else {
                j = parseInt(node.style.zIndex, 10) || 0;
                return i > j ? i : j
            }
            return this
        },
        nextFocus: function (downwards, includeChild, setFocus) {
            downwards = _.isBool(downwards) ? downwards : true;
            var self = this.get(0),
                node = this.$iterator("", downwards, includeChild, function (node) {
                    return node !== self && xui([node]).$canFocus()
                });
            if (!node.isEmpty() && setFocus !== false) {
                node.focus()
            }
            self = null;
            return node
        },
        animate: function (args, onStart, onEnd, time, step, type, threadid, unit) {
            var me = arguments.callee,
                hash = me.lib || (me.lib = {
                    linear: function (x, s) {
                        return x / s
                    },
                    expoIn: function (x, s) {
                        return (x / s == 0) ? 0 : Math.pow(2, 10 * (x / s - 1))
                    },
                    expoOut: function (x, s) {
                        return (x / s == 1) ? 1 : -Math.pow(2, -10 * x / s) + 1
                    },
                    expoInOut: function (x, s) {
                        if (x == 0) {
                            return 0
                        } else {
                            if (x == s) {
                                return 1
                            } else {
                                if ((x /= s / 2) < 1) {
                                    return 1 / 2 * Math.pow(2, 10 * (x - 1))
                                }
                            }
                        }
                        return 1 / 2 * (-Math.pow(2, -10 * --x) + 2)
                    },
                    sineIn: function (x, s) {
                        return -1 * Math.cos(x / s * (Math.PI / 2)) + 1
                    },
                    sineOut: function (x, s) {
                        return Math.sin(x / s * (Math.PI / 2))
                    },
                    sineInOut: function (x, s) {
                        return -1 / 2 * (Math.cos(Math.PI * x / s) - 1)
                    },
                    backIn: function (x, s) {
                        var n = 1.70158;
                        return (x /= s) * x * ((n + 1) * x - n)
                    },
                    backOut: function (x, s) {
                        var n = 1.70158;
                        return ((x = x / s - 1) * x * ((n + 1) * x + n) + 1)
                    },
                    backInOut: function (x, s) {
                        var n = 1.70158;
                        if ((x /= s / 2) < 1) {
                            return 1 / 2 * (x * x * (((n *= (1.525)) + 1) * x - n))
                        }
                        return 1 / 2 * ((x -= 2) * x * (((n *= (1.525)) + 1) * x + n) + 2)
                    },
                    bounceOut: function (x, s) {
                        if ((x /= s) < (1 / 2.75)) {
                            return 7.5625 * x * x
                        } else {
                            if (x < (2 / 2.75)) {
                                return 7.5625 * (x -= (1.5 / 2.75)) * x + 0.75
                            } else {
                                if (x < (2.5 / 2.75)) {
                                    return 7.5625 * (x -= (2.25 / 2.75)) * x + 0.9375
                                } else {
                                    return 7.5625 * (x -= (2.625 / 2.75)) * x + 0.984375
                                }
                            }
                        }
                    }
                }),
                color = me.color || (me.color = function (type, args, step, j) {
                    var f, fun, value = 0 + (100 - 0) * hash[type](j, step),
                        from = args[0],
                        to = args[1];
                    if (typeof from != "string" || typeof to != "string") {
                        return "#fff"
                    }
                    if (value < 0) {
                        return from
                    } else {
                        if (value > 100) {
                            return to
                        }
                    }
                    f = function (str) {
                        return (str.charAt(0) != "#") ? ("#" + str) : str
                    };
                    from = f(from);
                    to = f(to);
                    f = function (str, i, j) {
                        return parseInt(str.slice(i, j), 16) || 0
                    };
                    fun = function (o) {
                        return {
                            red: f(o, 1, 3),
                            green: f(o, 3, 5),
                            blue: f(o, 5, 7)
                        }
                    };
                    from = fun(from);
                    to = fun(to);
                    f = function (from, to, value, c) {
                        var r = from[c] + Math.round((value / 100) * (to[c] - from[c]));
                        return (r < 16 ? "0" : "") + r.toString(16)
                    };
                    return "#" + f(from, to, value, "red") + f(from, to, value, "green") + f(from, to, value, "blue")
                });
            time = time || 100;
            step = step || 5;
            type = hash[type] !== undefined ? type : "expoIn";
            var self = this,
                count = 0,
                funs = [function (threadid) {
                    if (++count > step) {
                        xui.Thread(threadid).abort();
                        return false
                    }
                    _.each(args, function (o, i) {
                        if (typeof o == "function") {
                            o(hash[type](count, step))
                        } else {
                            var value = String(_.str.endWith(i.toLowerCase(), "color") ? color(type, o, step, count) : (o[0] + (o[1] - o[0]) * hash[type](count, step)));
                            (self[i]) ? (self[i](value + (unit || ""))) : (self.css(i, value + (unit || "")))
                        }
                    })
                }];
            return xui.Thread(threadid || _.id(), funs, Math.max(time / step - 9, 0), null, onStart, onEnd, true)
        },
        popToTop: function (pos, type, parent) {
            var region, target = this,
                t;
            parent = xui(parent);
            if (parent.isEmpty()) {
                parent = xui("body")
            }
            target.css({
                position: "absolute",
                left: xui.Dom.HIDE_VALUE,
                top: xui.Dom.HIDE_VALUE,
                display: "block",
                zIndex: xui.Dom.TOP_ZINDEX
            });
            if (pos["xui.Dom"] || pos.nodeType == 1 || typeof pos == "string") {
                type = (type || 1).toString();
                var node = xui(pos),
                    abspos = node.offset(null, parent);
                region = {
                    left: abspos.left,
                    top: abspos.top,
                    width: node.offsetWidth(),
                    height: node.offsetHeight()
                }
            } else {
                type = type ? "3" : "0";
                t = type == "0" ? 0 : 8;
                region = pos.region || {
                    left: pos.left - t,
                    top: pos.top - t,
                    width: t * 2,
                    height: t * 2
                }
            }
            pos = {
                left: 0,
                top: 0
            };
            var t = (parent.get(0) === document.body || parent.get(0) === document || parent.get(0) === window) ? xui.win : parent,
                box = {};
            target.cssPos(pos).css({
                visibility: "hidden",
                display: "block"
            });
            parent.append(target);
            box.left = t.scrollLeft();
            box.top = t.scrollTop();
            box.width = t.width() + box.left;
            box.height = t.height() + box.top;
            var w = target.offsetWidth(),
                h = target.offsetHeight(),
                hi, wi;
            switch (type) {
            case "1":
                hi = false;
                wi = true;
                break;
            case "2":
                hi = true;
                wi = false;
                break;
            case "3":
                hi = false;
                wi = false;
                break;
            case "4":
                hi = wi = true;
                break
            }
            if (hi) {
                if (region.top + h < box.height) {
                    pos.top = region.top
                } else {
                    pos.top = region.top + region.height - h
                }
            } else {
                if (region.top + region.height + h < box.height) {
                    pos.top = region.top + region.height
                } else {
                    pos.top = region.top - h
                }
            }
            if (wi) {
                if (region.left + w < box.width) {
                    pos.left = region.left
                } else {
                    pos.left = region.left + region.width - w
                }
            } else {
                if (region.left + region.width + w < box.width) {
                    pos.left = region.left + region.width
                } else {
                    pos.left = region.left - w
                }
            }
            if (pos.left + w > box.width) {
                pos.left = box.width - w
            }
            if (pos.left < box.left) {
                pos.left = box.left
            }
            if (pos.top + h > box.height) {
                pos.top = box.height - h
            }
            if (pos.top < box.top) {
                pos.top = box.top
            }
            target.cssPos(pos).css({
                visibility: "visible"
            });
            return this
        },
        setBlurTrigger: function (id, trigger, group, checkChild, triggerNext) {
            var ns = this,
                doc = document,
                sid = "$blur_triggers$",
                fun = xui.Dom._blurTrigger || (xui.Dom._blurTrigger = function (p, e) {
                    var me = arguments.callee,
                        p = xui.Event.getPos(e),
                        arr = me.arr,
                        srcN = xui.Event.getSrc(e),
                        a = _.copy(arr),
                        b, pos, w, h, v;
                    _.arr.each(a, function (i) {
                        b = true;
                        if (!(v = arr[i].target)) {
                            b = false
                        } else {
                            v.each(function (o) {
                                if (!xui.Dom.byId(o.id)) {
                                    return b = false
                                }
                            })
                        }
                        if (!b) {
                            _.arr.removeValue(arr, i);
                            delete arr[i]
                        }
                    });
                    a = _.copy(arr);
                    _.arr.each(a, function (i) {
                        v = arr[i];
                        b = true;
                        var isChild = function () {
                                var nds = v.target.get();
                                while (srcN && srcN.tagName && srcN.tagName != "BODY" && srcN.tagName != "HTML") {
                                    if (_.arr.indexOf(nds, srcN) != -1) {
                                        return true
                                    }
                                    srcN = srcN.parentNode
                                }
                            };
                        if (!v.checkChild || isChild()) {
                            v.target.each(function (o) {
                                if (o.parentNode && (w = o.offsetWidth) && (h = o.offsetHeight)) {
                                    pos = xui([o]).offset();
                                    if (p.left >= pos.left && p.top >= pos.top && p.left <= (pos.left + w) && p.top <= (pos.top + h)) {
                                        return b = false
                                    }
                                }
                            })
                        }
                        if (b) {
                            _.tryF(v.trigger, [p, e], v.target);
                            _.arr.removeValue(arr, i);
                            delete arr[i]
                        } else {
                            if (v.stopNext) {
                                return false
                            }
                        }
                    }, null, true);
                    a.length = 0
                }),
                arr = fun.arr || (fun.arr = []),
                target;
            if (group) {
                if (group["xui.Dom"]) {
                    target = group
                } else {
                    if (_.isArr(group)) {
                        target = xui();
                        target._nodes = group
                    }
                }
            } else {
                target = ns
            }
            if (!doc.onmousedown) {
                doc.onmousedown = xui.Event.$eventhandler
            }
            target.each(function (o) {
                if (!o.id) {
                    o.id = xui.Dom._pickDomId()
                }
            });
            target.each(function (o) {
                if (!o.id) {
                    o.id = xui.Dom._pickDomId()
                }
            });
            if (!trigger) {
                _.arr.removeValue(arr, id);
                delete arr[id]
            } else {
                if (arr[id]) {
                    _.arr.removeValue(arr, id);
                    delete arr[id]
                }
            }
            arr[id] = {
                trigger: trigger,
                target: target,
                checkChild: !! checkChild,
                stopNext: !triggerNext
            };
            arr.push(id);
            return this
        },
        $firfox2: function () {
            if (!xui.browser.gek2) {
                return this
            }
            var ns = this;
            ns.css("overflow", "hidden");
            _.asyRun(function () {
                ns.css("overflow", "auto")
            });
            return ns
        },
        ieRemedy: function () {
            if (xui.browser.ie) {
                var a1 = this.get(),
                    a2 = [],
                    l = a1.length;
                _.asyRun(function () {
                    for (var i = 0; i < l; i++) {
                        if ((a2[i] = a1[i].style.WordWrap) == "break-word") {
                            a1[i].style.WordWrap = "normal"
                        } else {
                            a1[i].style.WordWrap = "break-word"
                        }
                    }
                });
                _.asyRun(function () {
                    for (var i = 0; i < l; i++) {
                        a1[i].style.WordWrap = a2[i]
                    }
                    a1.length = a2.length = 0
                })
            }
            return this
        },
        fixPng: function (type) {
            if (xui.browser.ie6) {
                type = type || "crop";
                return this.each(function (n) {
                    if (n.tagName == "IMG" && /\.png$/i.test(n.src)) {
                        n.style.height = n.height;
                        n.style.width = n.width;
                        n.style.filter = "progid:DXImageTransform.Microsoft.AlphaImageLoader(enabled=true, src=" + n.src + ", sizingMethod=" + type + ")";
                        n.src = xui.ini.img_bg
                    }
                    var bgimg = n.currentStyle.backgroundImage || n.style.backgroundImage,
                        bgmatch = bgimg.match(/^url[("']+(.*\.png[^\)"']*)[\)"']+[^\)]*$/i);
                    if (bgmatch) {
                        n.style.backgroundImage = "url(" + xui.ini.img_bg + ")";
                        n.style.filter = "progid:DXImageTransform.Microsoft.AlphaImageLoader(enabled=true, src=" + bgmatch[1] + ", sizingMethod=" + type + ")"
                    }
                })
            }
        }
    },
    Static: {
        HIDE_VALUE: "-10000px",
        TOP_ZINDEX: 10000,
        _boxArr: _.toArr("width,height,left,top,right,bottom"),
        _cursor: {},
        _pickDomId: function () {
            var id;
            do {
                id = "xui_" + _.id()
            } while (document.getElementById(id));
            return id
        },
        _map: {
            html: 1,
            head: 1,
            body: 1
        },
        _getTag: function (n) {
            return n ? n.$xid ? n.$xid : n.nodeType == 1 ? xui.$registerNode(n).$xid : 0 : 0
        },
        _ensureValues: function (obj) {
            var t, i, map = this._map,
                a = [],
                arr = obj === window ? ["!window"] : obj === document ? ["!document"] : obj.constructor == Array ? obj : obj["xui.Dom"] ? obj._nodes : obj._toDomElems ? obj._toDomElems() : typeof obj == "function" ? obj() : [obj];
            for (i = 0; i < arr.length; i++) {
                if (t = !(t = arr[i]) ? 0 : t === window ? "!window" : t === document ? "!document" : (typeof t == "string" || (t["xui.DomProfile"] && (t = t.domId))) ? t.charAt(0) == "!" ? t : this._getTag(map[t] ? document.getElementsByTagName(t)[0] : document.getElementById(t)) : ((t = arr[i])["xui.UIProfile"] || t["xui.Template"]) ? t.renderId ? t.renderId : (t.boxing().render() && t.renderId) : this._getTag(t)) {
                    a[a.length] = t
                }
            }
            return a.length <= 1 ? a : this._unique(a)
        },
        _scrollBarSize: 0,
        getScrollBarSize: function (force) {
            var ns = this;
            if (force || !ns._scrollBarSize) {
                var div;
                xui("body").append(div = xui.create('<div style="width:50px;height:50px;visibility:hidden;position:absolute;margin:0;padding:0;left:-10000px;overflow:scroll;"></div>'));
                ns._scrollBarSize = 50 - div.get(0).clientWidth + 2;
                div.remove()
            }
            return ns._scrollBarSize
        },
        getStyle: function (node, name) {
            if (!node || node.nodeType != 1) {
                return ""
            }
            var ns = xui.Dom,
                css3prop = xui.Dom._css3prop;
            var value, b;
            if (name == "opacity" && (!ns.css3Support("opacity")) && xui.browser.ie) {
                b = name = "filter"
            }
            value = node.style[name];
            if (!value) {
                var me = arguments.callee,
                    t, brs = xui.browser,
                    map = me.map || (me.map = {
                        "float": 1,
                        cssFloat: 1,
                        styleFloat: 1
                    }),
                    c1 = me._c1 || (me._c1 = {}),
                    c2 = me._c2 || (me._c2 = {}),
                    c3 = me._c3 || (me._c3 = {}),
                    name = c1[name] || (c1[name] = name.replace(/\-(\w)/g, function (a, b) {
                        return b.toUpperCase()
                    })),
                    name2 = c2[name] || (c2[name] = name.replace(/([A-Z])/g, "-$1").toLowerCase()),
                    name3, name4;
                var n1 = name;
                if (n1.indexOf("border") === 0) {
                    n1 = n1.replace(/[-]?(left|top|right|bottom)/ig, "")
                }
                if (_.arr.indexOf(css3prop, n1) != -1) {
                    if (!ns.css3Support(name)) {
                        return ""
                    } else {
                        if (name != "textShadow") {
                            name3 = brs.cssTag2 + name2.charAt(0).toUpperCase() + name2.substr(1);
                            name4 = brs.cssTag1 + name2
                        }
                    }
                }
                if (map[name]) {
                    name = xui.browser.ie ? "styleFloat" : "cssFloat"
                }
                value = ((t = document.defaultView) && t.getComputedStyle) ? (t = t.getComputedStyle(node, null)) ? (t.getPropertyValue(name2) || (name4 && t.getPropertyValue(name4))) : "" : node.currentStyle ? (node.currentStyle[name] || node.currentStyle[name2] || (name3 && (node.currentStyle[name3] || node.currentStyle[name4]))) : ((node.style && (node.style[name] || (name3 && node.style[name3]))) || "")
            }
            return b ? value ? (parseFloat(value.match(/alpha\(opacity=(.*)\)/)[1]) || 0) / 100 : 1 : (value || "")
        },
        $transformIE: function (node, value) {
            var r, angle, scaleX, scaleY, skewX, skewY, transX, transY, toD = function (d) {
                    return d * (Math.PI / 180)
                };
            if (!value) {
                node.style.filter = node.style.filter.replace(/progid\:DXImageTransform\.Microsoft\.Matrix\([^)]+\)/ig, "");
                node.style.marginTop = node.style.marginLeft = ""
            } else {
                r = value.match(/(rotate)\(\s*([\d.-]+)deg\s*\)/);
                if (r && r.length == 3) {
                    angle = r[2]
                }
                r = value.match(/(scale)\(\s*([\d.-]+)\s*,\s*([\d.-]+)\)/);
                if (r && r.length == 4) {
                    scaleX = r[2];
                    scaleY = r[3]
                }
                r = value.match(/(skew)\(\s*([\d.-]+)deg\s*,\s*([\d.-]+)deg\s*\)/);
                if (r && r.length == 4) {
                    skewX = r[2];
                    skewY = r[3]
                }
                r = value.match(/(translate)\(\s*([\d.-]+)px\s*,\s*([\d.-]+)px\s*\)/);
                if (r && r.length == 4) {
                    transX = r[2];
                    transY = r[3]
                }
                angle = parseFloat(angle) || 0;
                scaleX = parseFloat(scaleX) || 1;
                scaleY = parseFloat(scaleY) || 1;
                skewX = parseFloat(skewX) || 0;
                skewY = parseFloat(skewY) || 0;
                transX = parseFloat(transX) || 0;
                transY = parseFloat(transY) || 0;
                node.style.filter = node.style.filter.replace(/progid\:DXImageTransform\.Microsoft\.Matrix\([^)]+\)/ig, "");
                node.style.marginTop = node.style.marginLeft = "";
                var ow = node.offsetWidth,
                    oh = node.offsetHeight;
                var m11 = 1,
                    m21 = 0,
                    m12 = 0,
                    m22 = 1;
                if (angle) {
                    var rad = toD(angle);
                    m11 = Math.cos(rad);
                    m21 = Math.sin(rad);
                    m12 = -1 * Math.sin(rad);
                    m22 = Math.cos(rad)
                }
                if (scaleX != 1) {
                    m11 *= scaleX;
                    m21 *= scaleX
                }
                if (scaleY != 1) {
                    m12 *= scaleY;
                    m22 *= scaleY
                }
                if (skewX) {
                    m12 += Math.tan(toD(skewX))
                }
                if (skewY) {
                    m21 += Math.tan(toD(skewY))
                }
                node.style.filter = "progid:DXImageTransform.Microsoft.Matrix(M11=" + m11 + ",M12=" + m12 + ",M21=" + m21 + ",M22=" + m22 + ",SizingMethod='auto expand')";
                var w = node.offsetWidth,
                    h = node.offsetHeight;
                if (w != ow || transX) {
                    node.style.marginLeft = -(w - ow) / 2 + transX + "px"
                }
                if (h != oh || transY) {
                    node.style.marginTop = -(h - oh) / 2 + transY + "px"
                }
            }
        },
        $textShadowIE: function (node, value, box) {
            if (!value) {
                var f = function (s) {
                        return s.replace(/progid\:DXImageTransform\.Microsoft\.(Chroma|DropShadow|Glow)\([^)]+\)/ig, "")
                    },
                    s1 = node.style.filter,
                    s2 = node.style.msfilter;
                if (s1) {
                    node.style.filter = f(s1)
                }
                if (s2) {
                    node.style.msfilter = f(s2)
                }
                if (!box) {
                    node.style.backgroundColor = ""
                }
            } else {
                var f = function (x, y, r, c) {
                        return (box ? "" : "progid:DXImageTransform.Microsoft.Chroma(Color=#cccccc) ") + "progid:DXImageTransform.Microsoft.DropShadow(Color=" + c + ", OffX=" + x + ", OffY=" + y + ") " + (parseFloat(r) > 0 ? "progid:DXImageTransform.Microsoft.Glow(Strength=" + r + ", Color=" + c + ")" : "")
                    },
                    r = value.match(/([\d\.-]+)px\s+([\d\.-]+)px(\s+([\d\.-]+)px)?(\s+([#\w]+))?/);
                if (r) {
                    node.style.msfilter = node.style.filter = f(r[1], r[2], r[4], r[6] || "#000000");
                    if (!box) {
                        node.style.backgroundColor = "#cccccc"
                    }
                }
            }
        },
        $setGradients: function (node, value) {
            var ns = this,
                xb = xui.browser,
                ver = xb.ver,
                c16 = "0123456789ABCDEF",
                _toFF = function (n, b) {
                    n = parseInt(n * b, 10) || 0;
                    n = (n > 255 || n < 0) ? 0 : n;
                    return c16.charAt((n - n % 16) / 16) + c16.charAt(n % 16)
                },
                _to255 = function (s) {
                    s = s.split("");
                    return c16.indexOf(s[0].toUpperCase()) * 16 + c16.indexOf(s[1].toUpperCase())
                };
            if (!window.btoa) {
                window.btoa = function (text) {
                    if (/([^\u0000-\u00ff])/.test(text)) {
                        return
                    }
                    var table = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/",
                        i = 0,
                        cur, prev, byteNum, result = [];
                    while (i < text.length) {
                        cur = text.charCodeAt(i);
                        byteNum = (i + 1) % 3;
                        switch (byteNum) {
                        case 1:
                            result.push(table.charAt(cur >> 2));
                            break;
                        case 2:
                            result.push(table.charAt((prev & 3) << 4 | (cur >> 4)));
                            break;
                        case 0:
                            result.push(table.charAt((prev & 15) << 2 | (cur >> 6)));
                            result.push(table.charAt(cur & 63));
                            break
                        }
                        prev = cur;
                        i++
                    }
                    if (byteNum == 1) {
                        result.push(table.charAt((prev & 3) << 4));
                        result.push("==")
                    } else {
                        if (byteNum == 2) {
                            result.push(table.charAt((prev & 15) << 2));
                            result.push("=")
                        }
                    }
                    return result.join("")
                }
            }
            var iecracker1 = function (node, orient, stops, shape, size, rate) {
                    var id = "xui.s-ie8gdfix";
                    if (!node || node.nodeType != 1 || !node.style) {
                        return
                    }
                    var tmp1 = ns.getStyle(node, "overflow"),
                        tmp2 = ns.getStyle(node, "display");
                    if (tmp1 != "hidden" || (tmp2 != "block" && tmp2 != "relative")) {
                        return
                    }
                    if (!orient) {
                        var i, a = node.childNodes,
                            l = a.length;
                        for (i = 0; i < l; i++) {
                            if (a[i].nodeType == 1 && a[i].id == id) {
                                node.removeChild(a[i]);
                                break
                            }
                        }
                        node.style.backgroundColor = "";
                        node.style.filter = node.style.filter.replace(/progid\:DXImageTransform\.Microsoft\.Alpha\([^)]+\)/ig, "")
                    } else {
                        rate = rate || 1;
                        var innerColor = stops[0].clr,
                            outerColor = stops[stops.length - 1].clr;
                        var ew = node.offsetWidth,
                            eh = node.offsetHeight,
                            aw = ew * rate * 2,
                            ah = eh * rate * 2;
                        if (shape == "circle") {
                            aw = ah = Math.min(aw, ah)
                        }
                        var l = -aw / 2,
                            t = -ah / 2,
                            w = aw,
                            h = ah;
                        if (_.isObj(orient)) {
                            l = orient.left || (l + "px");
                            t = orient.top || (t + "px")
                        } else {
                            switch (orient) {
                            case "LT":
                                l = -aw / 2;
                                t = -ah / 2;
                                break;
                            case "T":
                                l = (ew - aw) / 2;
                                t = -ah / 2;
                                break;
                            case "RT":
                                l = ew - aw / 2;
                                t = -ah / 2;
                                break;
                            case "L":
                                l = -aw / 2;
                                t = (eh - ah) / 2;
                                break;
                            case "C":
                                l = (ew - aw) / 2;
                                t = (eh - ah) / 2;
                                break;
                            case "R":
                                l = ew - aw / 2;
                                t = (eh - ah) / 2;
                                break;
                            case "LB":
                                l = -aw / 2;
                                t = eh - ah / 2;
                                break;
                            case "B":
                                l = (ew - aw) / 2;
                                t = eh - ah / 2;
                                break;
                            case "RB":
                                l = ew - aw / 2;
                                t = eh - ah / 2;
                                break
                            }
                            l += "px";
                            t += "px"
                        }
                        var at = document.createElement("div"),
                            s = at.style;
                        at.id = id;
                        s.position = "absolute";
                        s.zIndex = "0";
                        s.top = t;
                        s.left = l;
                        s.width = w + "px";
                        s.height = h + "px";
                        s.backgroundColor = innerColor;
                        var starto = stops[0].opacity ? parseFloat(stops[0].opacity) * 100 : 100;
                        s.filter = "progid:DXImageTransform.Microsoft.Alpha(opacity=" + starto + ", finishopacity=0, style=2)";
                        if (node.firstChild) {
                            node.insertBefore(at, node.firstChild)
                        } else {
                            node.appendChild(at)
                        }
                        node.style.backgroundColor = outerColor;
                        if (stops[stops.length - 1].opacity) {
                            node.style.filter = "progid:DXImageTransform.Microsoft.Alpha(opacity=" + (parseFloat(stops[stops.length - 1].opacity) * 100) + ")"
                        }
                    }
                },
                iecracker21 = function (node, orient, stops) {
                    var id = "xui.s-ie8gdfix";
                    if (!node || node.nodeType != 1 || !node.style) {
                        return
                    }
                    var tmp1 = ns.getStyle(node, "overflow"),
                        tmp2 = ns.getStyle(node, "display");
                    if (tmp1 != "hidden") {
                        ns.setStyle(node, "overflow", "hidden")
                    }
                    if (tmp2 != "block" && tmp2 != "relative") {
                        ns.setStyle(node, "display", "relative")
                    }
                    if (!orient) {
                        var i, a = node.childNodes,
                            l = a.length;
                        for (i = 0; i < l; i++) {
                            if (a[i].nodeType == 1 && a[i].id == id) {
                                node.removeChild(a[i]);
                                break
                            }
                        }
                        node.style.backgroundColor = "";
                        node.style.filter = node.style.filter.replace(/progid\:DXImageTransform\.Microsoft\.Alpha\([^)]+\)/ig, "")
                    } else {
                        var innerColor = stops[0].clr,
                            outerColor = stops[stops.length - 1].clr;
                        var ew = node.offsetWidth,
                            eh = node.offsetHeight,
                            size = Math.min(ew, eh),
                            xs = 0,
                            xe = size,
                            ys = 0,
                            ye = size;
                        switch (orient) {
                        case "LT":
                            xs = 0;
                            ys = 0;
                            xe = size;
                            ye = size;
                            break;
                        case "RT":
                            xs = size;
                            ys = 0;
                            xe = 0;
                            ye = size;
                            break;
                        case "LB":
                            xs = 0;
                            ys = size;
                            xe = size;
                            ye = 0;
                            break;
                        case "RB":
                            xs = size;
                            ys = size;
                            xe = 0;
                            ye = 0;
                            break
                        }
                        var at = document.createElement("div"),
                            s = at.style;
                        at.id = id;
                        s.position = "absolute";
                        s.zIndex = "0";
                        s.top = 0;
                        s.left = 0;
                        s.width = ew;
                        s.height = eh;
                        s.backgroundColor = innerColor;
                        var starto = stops[0].opacity ? parseFloat(stops[0].opacity) * 100 : 100;
                        s.filter = "progid:DXImageTransform.Microsoft.Alpha(style=1, opacity=" + starto + ", finishopacity=0, startX=" + xs + ",finishX=" + xe + ",startY=" + ys + ",finishY=" + ye + ")";
                        if (node.firstChild) {
                            node.insertBefore(at, node.firstChild)
                        } else {
                            node.appendChild(at)
                        }
                        node.style.backgroundColor = outerColor;
                        if (stops[stops.length - 1].opacity) {
                            node.style.filter = "progid:DXImageTransform.Microsoft.Alpha(opacity=" + (parseFloat(stops[stops.length - 1].opacity) * 100) + ")"
                        }
                    }
                },
                iecracker2 = function (node, orient, stops) {
                    var id = "xui.s-ie8gdfix";
                    if (!node || node.nodeType != 1 || !node.style) {
                        return
                    }
                    if (!orient) {
                        node.style.filter = node.style.filter.replace(/progid\:DXImageTransform\.Microsoft\.Gradient\([^)]+\)/ig, "");
                        var i, a = node.childNodes,
                            l = a.length;
                        for (i = 0; i < l; i++) {
                            if (a[i].nodeType == 1 && a[i].id == id) {
                                node.removeChild(a[i]);
                                break
                            }
                        }
                        node.style.backgroundColor = "";
                        node.style.filter = node.style.filter.replace(/progid\:DXImageTransform\.Microsoft\.Alpha\([^)]+\)/ig, "")
                    } else {
                        var innerColor = stops[0].clr,
                            outerColor = stops[stops.length - 1].clr,
                            ori = 1,
                            t;
                        if (stops[0].opacity) {
                            innerColor = innerColor.replace("#", "#" + _toFF(stops[0].opacity, 255))
                        }
                        if (stops[stops.length - 1].opacity) {
                            outerColor = outerColor.replace("#", "#" + _toFF(stops[stops.length - 1].opacity, 255))
                        }
                        switch (orient) {
                        case "LT":
                        case "RT":
                        case "LB":
                        case "RB":
                            iecracker21(node, orient, stops);
                            return;
                        case "L":
                            ori = 1;
                            break;
                        case "R":
                            ori = 1;
                            t = innerColor;
                            innerColor = outerColor;
                            outerColor = t;
                            break;
                        case "T":
                            ori = 0;
                            break;
                        case "B":
                            ori = 0;
                            t = innerColor;
                            innerColor = outerColor;
                            outerColor = t;
                            break
                        }
                        node.style.filter = "progid:DXImageTransform.Microsoft.Gradient(StartColorstr='" + innerColor + "',EndColorstr='" + outerColor + "',GradientType=" + ori + ")"
                    }
                },
                svgcracker1 = function (node, orient, stops, shape, size, rate) {
                    if (!orient) {
                        node.style.backgroundImage = ""
                    } else {
                        rate = rate || 1;
                        var id = "svg:" + _.id(),
                            cx = "0%",
                            cy = "0%",
                            r = rate * 100 + "%";
                        if (_.isObj(orient)) {
                            cx = orient.left || cx;
                            cy = orient.left || cy
                        } else {
                            switch (orient) {
                            case "T":
                                cx = "50%";
                                cy = "0%";
                                break;
                            case "B":
                                cx = "50%";
                                cy = "100%";
                                break;
                            case "L":
                                cx = "0%";
                                cy = "50%";
                                break;
                            case "R":
                                cx = "100%";
                                cy = "50%";
                                break;
                            case "LT":
                                cx = "0%";
                                cy = "0%";
                                break;
                            case "RT":
                                cx = "100%";
                                cy = "0%";
                                break;
                            case "RB":
                                cx = "100%";
                                cy = "100%";
                                break;
                            case "LB":
                                cx = "0%";
                                cy = "100%";
                                break;
                            case "C":
                                cx = "50%";
                                cy = "50%";
                                break
                            }
                        }
                        var svg = '<svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="0 0 1 1" preserveAspectRatio="none"><radialGradient id="' + id + '" gradientUnits="userSpaceOnUse" cx="' + cx + '" cy="' + cy + '" r="' + r + '">';
                        for (var i = 0, l = stops.length; i < l; i++) {
                            svg += '<stop stop-color="' + stops[i].clr + '" offset="' + stops[i].pos + '" ' + (_.isSet(stops[i].opacity) ? (' stop-opacity="' + stops[i].opacity + '"') : "") + " />"
                        }
                        svg += '</radialGradient><rect x="-50" y="-50" width="101" height="101" fill="url(#' + id + ')" /></svg>';
                        node.style.backgroundImage = 'url("data:image/svg+xml;base64,' + window.btoa(svg) + '")'
                    }
                },
                svgcracker2 = function (node, orient, stops) {
                    if (!orient) {
                        node.style.backgroundImage = ""
                    } else {
                        var id = "svg" + _.id(),
                            x1 = "0%",
                            y1 = "0%",
                            x2 = "0%",
                            y2 = "100%";
                        switch (orient) {
                        case "T":
                            x1 = "50%";
                            y1 = "0%";
                            x2 = "50%";
                            y2 = "100%";
                            break;
                        case "B":
                            x1 = "50%";
                            y1 = "100%";
                            x2 = "50%";
                            y2 = "0%";
                            break;
                        case "L":
                            x1 = "0%";
                            y1 = "50%";
                            x2 = "100%";
                            y2 = "50%";
                            break;
                        case "R":
                            x1 = "100%";
                            y1 = "50%";
                            x2 = "0%";
                            y2 = "50%";
                            break;
                        case "LT":
                            x1 = "0%";
                            y1 = "0%";
                            x2 = "100%";
                            y2 = "100%";
                            break;
                        case "RT":
                            x1 = "100%";
                            y1 = "0%";
                            x2 = "0%";
                            y2 = "100%";
                            break;
                        case "RB":
                            x2 = "0%";
                            y2 = "0%";
                            x1 = "100%";
                            y1 = "100%";
                            break;
                        case "LB":
                            x1 = "0%";
                            y1 = "100%";
                            x2 = "100%";
                            y2 = "0%";
                            break;
                        default:
                        }
                        var svg = '<svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="0 0 1 1" preserveAspectRatio="none"><linearGradient id="' + id + '" gradientUnits="userSpaceOnUse" x1="' + x1 + '" y1="' + y1 + '" x2="' + x2 + '" y2="' + y2 + '">';
                        for (var i = 0, l = stops.length; i < l; i++) {
                            svg += '<stop stop-color="' + stops[i].clr + '" offset="' + stops[i].pos + '" ' + (_.isSet(stops[i].opacity) ? (' stop-opacity="' + stops[i].opacity + '"') : "") + "/>"
                        }
                        svg += '</linearGradient><rect x="0" y="0" width="1" height="1" fill="url(#' + id + ')" /></svg>';
                        node.style.backgroundImage = 'url("data:image/svg+xml;base64,' + window.btoa(svg) + '")'
                    }
                },
                css1 = function (node, orient, stops, shape, size, rate) {
                    var arr1 = [],
                        arr2 = [],
                        style = node.style;
                    _.arr.each(stops, function (o) {
                        var clr = o.clr;
                        if (_.isSet(o.opacity) && clr.charAt(0) == "#") {
                            clr = clr.slice(1);
                            clr = "rgba(" + _to255(clr.substr(0, 2)) + "," + _to255(clr.substr(2, 2)) + "," + _to255(clr.substr(4, 2)) + "," + parseFloat(o.opacity) + ")"
                        }
                        arr1.push(clr + " " + o.pos);
                        if (xb.isWebKit) {
                            arr2.push("color-stop(" + o.pos + "," + clr + ")")
                        }
                    });
                    if (!orient) {
                        style.backgroundImage = ""
                    } else {
                        var position;
                        if (_.isObj(orient)) {
                            position = orient.left + " " + orient.top
                        } else {
                            switch (orient) {
                            case "LT":
                                position = "left top";
                                break;
                            case "T":
                                position = "center top";
                                break;
                            case "RT":
                                position = "right top";
                                break;
                            case "L":
                                position = "left center";
                                break;
                            case "C":
                                position = "center center";
                                break;
                            case "R":
                                position = "right center";
                                break;
                            case "LB":
                                position = "left bottom";
                                break;
                            case "B":
                                position = "center bottom";
                                break;
                            case "RB":
                                position = "right bottom";
                                break;
                            default:
                                position = "left top"
                            }
                        }
                        if (xb.isWebKit) {
                            style.backgroundImage = "-webkit-gradient(radial," + position + ", 0px, " + position + ", 100%," + arr2.join(",") + ")"
                        }
                        var v1 = "radial-gradient(" + position + "," + shape + " " + size + "," + arr1.join(",") + ")";
                        if (xb.cssTag1) {
                            style.backgroundImage = xb.cssTag1 + v1
                        }
                        style.backgroundImage = "radial-gradient(" + size + " " + shape + " at " + position + "," + arr1.join(",") + ")"
                    }
                },
                css2 = function (node, orient, stops) {
                    var arr1 = [],
                        arr2 = [],
                        style = node.style;
                    _.arr.each(stops, function (o) {
                        var clr = o.clr;
                        if (_.isSet(o.opacity) && clr.charAt(0) == "#") {
                            clr = clr.slice(1);
                            clr = "rgba(" + _to255(clr.substr(0, 2)) + "," + _to255(clr.substr(2, 2)) + "," + _to255(clr.substr(4, 2)) + "," + parseFloat(o.opacity) + ")"
                        }
                        arr1.push(clr + " " + o.pos);
                        if (xb.isWebKit) {
                            arr2.push("color-stop(" + o.pos + "," + clr + ")")
                        }
                    });
                    if (!orient) {
                        style.backgroundImage = ""
                    } else {
                        var direction = "to bottom";
                        var directionmoz = "top";
                        var directionwebkit = "left top, left bottom";
                        switch (orient) {
                        case "LT":
                            direction = "135deg";
                            directionmoz = "-45deg";
                            directionwebkit = "left top, right bottom";
                            break;
                        case "T":
                            directionmoz = "top";
                            direction = "to bottom";
                            directionwebkit = "left top, left bottom";
                            break;
                        case "RT":
                            direction = directionmoz = "-135deg";
                            directionwebkit = "right top, left bottom";
                            break;
                        case "L":
                            directionmoz = "left";
                            direction = "to right";
                            directionwebkit = "left top, right top";
                            break;
                        case "R":
                            directionmoz = "right";
                            direction = "to left";
                            directionwebkit = "right top, left top";
                            break;
                        case "LB":
                            direction = directionmoz = "45deg";
                            directionwebkit = "left bottom, right top";
                            break;
                        case "B":
                            directionmoz = "bottom";
                            direction = "to top";
                            directionwebkit = "left bottom, left top";
                            break;
                        case "RB":
                            direction = "-45deg";
                            directionmoz = "135deg";
                            directionwebkit = "right bottom, left top";
                            break;
                        default:
                            direction = orient;
                            directionmoz = orient;
                            directionwebkit = "left top, right bottom"
                        }
                        if (xb.isWebKit) {
                            style.backgroundImage = "-webkit-gradient(linear," + directionwebkit + ", " + arr2.join(",") + ")"
                        }
                        var v1 = "linear-gradient({#}," + arr1.join(",") + ")";
                        if (xb.cssTag1) {
                            style.backgroundImage = xb.cssTag1 + v1.replace("{#}", directionmoz)
                        }
                        style.backgroundImage = v1.replace("{#}", direction)
                    }
                };
            var type = value ? (value.type || value || "linear").toLowerCase() : null,
                rate = value ? (value.rate || 1) : null,
                shape = value ? (value.shape || "circle").toLowerCase() : null,
                size = value ? (value.size || "farthest-corner").toLowerCase() : null,
                orient = value ? value.orient : null,
                stops = value ? value.stops : null;
            if (type != "linear") {
                type = "radial"
            }
            if (stops) {
                if (stops.length > 1) {
                    stops.sort(function (x, y) {
                        x = parseFloat(x.pos);
                        y = parseFloat(y.pos);
                        return x > y ? 1 : x == y ? 0 : -1
                    })
                } else {
                    return
                }
            }
            if (xb.ie && ver >= 6 && ver < 9) {
                if (type == "linear") {
                    iecracker2(node, orient, stops)
                } else {
                    iecracker1(node, orient, stops, shape, size, rate)
                }
            } else {
                if ((xb.ie && ver >= 9 && ver < 10) || (xb.opr && ver < 11.1)) {
                    if (type == "linear") {
                        svgcracker2(node, orient, stops)
                    } else {
                        svgcracker1(node, orient, stops, shape, size, rate)
                    }
                } else {
                    if ((xb.gek && ver >= 3.6) || (xb.isChrome && ver >= 10) || (xb.isSafari && ver >= 5.1) || (xb.ie && ver >= 10) || (xb.opr && ver >= 11.1)) {
                        if (type == "linear") {
                            css2(node, orient, stops)
                        } else {
                            if (xb.opr && ver < 12) {
                                svgcracker1(node, orient, stops, shape, size, rate)
                            } else {
                                css1(node, orient, stops, shape, size, rate)
                            }
                        }
                    }
                }
            }
        },
        setStyle: function (node, name, value) {
            var ns = xui.Dom,
                css3prop = xui.Dom._css3prop,
                xb = xui.browser;
            if (node.nodeType != 1) {
                return
            }
            if (typeof name == "string") {
                var me = this.getStyle,
                    c1 = me._c1 || (me._c1 = {}),
                    r1 = me._r1 || (me._r1 = /alpha\([^\)]*\)/ig),
                    map = me.map || (me.map = {
                        "float": 1,
                        cssFloat: 1,
                        styleFloat: 1
                    });
                var name2, name3, name4;
                name = c1[name] || (c1[name] = name.replace(/\-(\w)/g, function (a, b) {
                    return b.toUpperCase()
                }));
                var n1 = name;
                if (n1.indexOf("border") === 0) {
                    n1 = n1.replace(/[-]?(left|top|right|bottom)/ig, "")
                }
                if (name == "$gradients") {
                    return ns.$setGradients(node, value)
                } else {
                    if (name == "opacity") {
                        value = _.isNumb(value) ? parseFloat(value) > 1 ? 1 : parseFloat(value) <= 0 ? 0 : parseFloat(value) : 1;
                        value = value > 0.9999 ? "" : ((!ns.css3Support("opacity")) && xb.ie) ? "alpha(opacity=" + 100 * value + ")" : value;
                        if ((!ns.css3Support("opacity")) && xb.ie) {
                            node.zoom = 1;
                            name = "filter";
                            value = node.style.filter.replace(r1, "") + value
                        }
                    } else {
                        if (_.arr.indexOf(css3prop, n1) != -1) {
                            if (!ns.css3Support(name)) {
                                if (xb.ie && xb.ver < 9) {
                                    switch (name) {
                                    case "transform":
                                        linb.Dom.$transformIE(node, value);
                                        break;
                                    case "boxShadow":
                                        linb.Dom.$textShadowIE(node, value, true);
                                        break
                                    }
                                }
                                if (name == "textShadow" && xb.ie && xb.ver < 10) {
                                    linb.Dom.$textShadowIE(node, value)
                                }
                                return this
                            } else {
                                if (xb.cssTag2) {
                                    if (name != "textShadow") {
                                        name2 = xb.cssTag2 + name.charAt(0).toUpperCase() + name.substr(1)
                                    }
                                }
                            }
                        } else {
                            if (map[name]) {
                                name = xb.ie ? "styleFloat" : "cssFloat"
                            }
                        }
                    }
                }
                node.style[name] = value;
                if (name2) {
                    node.style[name2] = value
                }
                if (name3) {
                    node.style[name3] = value
                }
                if (name4) {
                    node.style[name4] = value
                }
            } else {
                for (var i in name) {
                    arguments.callee.call(this, node, i, name[i])
                }
            }
        },
        _css3prop: "opacity,textShadow,animationName,columnCount,flexWrap,boxDirection,backgroundSize,perspective,boxShadow,borderImage,borderRadius,boxReflect,transform,transition".split(","),
        css3Support: function (key) {
            var self = arguments.callee,
                _c = self._c || (self._c = {});
            key = key.replace(/\-(\w)/g, function (a, b) {
                return b.toUpperCase()
            });
            if (key in _c) {
                return _c[key]
            }
            var n = document.createElement("div"),
                s = n.style,
                rt = false,
                xb = xui.browser,
                f = function (k) {
                    k = k.replace(/\-(\w)/g, function (a, b) {
                        return b.toUpperCase()
                    });
                    if (s[k] !== undefined) {
                        return true
                    }
                    if (xui.browser.cssTag2) {
                        k = xui.browser.cssTag2 + k.charAt(0).toUpperCase() + k.substr(1);
                        if (s[k] !== undefined) {
                            return true
                        }
                    }
                    return false
                };
            n.id = "xui_css3_" + _();
            if (key.indexOf("border") === 0) {
                key = key.replace(/[-]?(left|top|right|bottom)/ig, "")
            }
            switch (key) {
            case "opacity":
            case "textShadow":
                rt = s[key] === "";
                break;
            case "generatedContent":
                var id = "tmp_css3_test" + _.id(),
                    css = "#" + n.id + "{line-height:auto;margin:0;padding:0;border:0;font:0/0 a}#" + n.id + ":after{content:'a';visibility:hidden;line-height:auto;margin:0;padding:0;border:0;font:3px/1 a}";
                linb.CSS.addStyleSheet(css, id);
                xui("body").append(n);
                var v = n.offsetHeight;
                linb.CSS.remove("id", id);
                xui(n.id).remove(n);
                rt = v >= 3;
                break;
            case "fontFace":
                if (xb.ie && xb.ver >= 6) {
                    rt = true
                } else {
                    var id = "tmp_css3_test" + _.id(),
                        css = '@font-face{font-family:"font";src:url("https://")}',
                        s = linb.CSS.addStyleSheet(css, id),
                        sh = s.sheet || s.styleSheet,
                        ctxt = sh ? ((sh.cssRules && sh.cssRules[0]) ? sh.cssRules[0].cssText : sh.cssText || "") : "";
                    rt = /src/i.test(ctxt) && ctxt.indexOf("@font-face") === 0;
                    linb.CSS.remove("id", id)
                }
                break;
            case "rgba":
                s.cssText = "background-color:rgba(0,0,0,0.1)";
                rt = s.backgroundColor.indexOf("rgba") != -1;
                break;
            case "hsla":
                s.cssText = "background-color:hsla(120,40%,100%,.5)";
                rt = s.backgroundColor.indexOf("hsla") != -1 || s.backgroundColor.indexOf("rgba") != -1;
                break;
            case "multiplebgs":
                s.cssText = "background:url(//:),url(//:),red url(//:)";
                rt = /(url\s*\(.*?){3}/.test(s.background);
                break;
            case "gradient":
                var k = "background-image:",
                    v1 = "-webkit-gradient(linear,left top,right bottom,from(#000),to(#fff));",
                    v2 = "linear-gradient(left top,#000,#fff);",
                    arr = [k, v2];
                if (xui.browser.cssTag1) {
                    arr.push(k);
                    arr.push(xui.browser.cssTag1 + v2)
                }
                if (xui.browser.isWebKit) {
                    arr.push(k);
                    arr.push(v1)
                }
                s.cssText = arr.join("");
                rt = !! s.backgroundImage;
                break;
            case "transform3d":
                var r = f("perspective");
                if (r && "webkitPerspective" in document.documentElement.style) {
                    var id = "tmp_css3_test" + _.id(),
                        css = "@media (transform-3d),(-webkit-transform-3d){#" + n.id + "{font:0/0;line-height:0;margin:0;padding:0;border:0;left:9px;position:absolute;height:3px;}}";
                    linb.CSS.addStyleSheet(css, id);
                    xui("body").append(n);
                    var v1 = n.offsetLeft,
                        v2 = n.offsetHeight;
                    linb.CSS.remove("id", id);
                    xui(n.id).remove(n);
                    rt = v1 === 9 && v2 === 3
                }
                rt = r;
                break;
            default:
                rt = f(key)
            }
            return _c[key] = rt
        },
        _setPxStyle: function (node, key, value) {
            if (node.nodeType != 1) {
                return false
            }
            var style = node.style;
            if (value || value === 0) {
                value = (("" + parseFloat(value)) == ("" + value)) ? (parseInt(value, 10) || 0) + "px" : value + "";
                if ((key == "width" || key == "height") && value.charAt(0) == "-") {
                    value = "0"
                }
                if (style[key] != value) {
                    style[key] = value;
                    return true
                }
            }
            return false
        },
        _emptyDivId: "xui.empty::",
        getEmptyDiv: function (sequence) {
            var i = 1,
                id, rt, style, o, t, count = 0,
                doc = document,
                body = doc.body,
                ini = function (o) {
                    o.id = id;
                    xui([o]).attr("style", "position:absolute;visibility:hidden;overflow:visible;left:" + xui.Dom.HIDE_VALUE + ";top:" + xui.Dom.HIDE_VALUE + ";")
                };
            sequence = sequence || 1;
            while (1) {
                id = this._emptyDivId + i;
                if (o = xui.Dom.byId(id)) {
                    if (!o.firstChild && ++count == sequence) {
                        return xui([o])
                    }
                } else {
                    o = doc.createElement("div");
                    ini(o, id);
                    if (body.firstChild) {
                        body.insertBefore(o, body.firstChild)
                    } else {
                        body.appendChild(o)
                    }
                    rt = xui([o]);
                    body = o = null;
                    return rt
                }
                i++
            }
            body = o = null
        },
        setCover: function (visible, label) {
            var me = arguments.callee,
                id = "xui.temp:cover:",
                id2 = "xui.temp:message:",
                content = typeof visible == "string" ? visible : "",
                o1, o2;
            if ((o1 = xui(id)).isEmpty()) {
                xui("body").prepend(o1 = xui.create('<div id="' + id + '" style="position:absolute;display:none;left:0;top:0;background-image:url(' + xui.ini.img_bg + ')"><div id="' + id2 + '" style="position:absolute;font-size:12px"></div></div>'));
                xui.setNodeData(o1.get(0), "zIndexIgnore", 1)
            }
            o2 = xui(id2);
            if (!visible) {
                if (typeof me._label == "string" && me._label !== label) {
                    return
                }
                if (me._showed) {
                    o2.empty(false);
                    o1.css({
                        zIndex: 0,
                        cursor: "",
                        display: "none"
                    });
                    me._showed = false
                }
                delete me._label
            } else {
                if (typeof label == "string") {
                    me._label = label
                }
                var t = xui.win;
                if (!me._showed) {
                    o1.css({
                        zIndex: xui.Dom.TOP_ZINDEX * 2,
                        display: "",
                        width: t.scrollWidth() + "px",
                        height: t.scrollHeight() + "px",
                        cursor: "progress"
                    });
                    me._showed = true
                }
                if (content) {
                    o2.css({
                        left: t.scrollLeft() + t.width() / 2 + "px",
                        top: t.scrollTop() + t.height() / 2 + "px"
                    });
                    o2.html(content + "", false)
                }
            }
        },
        byId: function (id) {
            return document.getElementById(id || "")
        },
        $hasEventHandler: function (node, name) {
            return xui.getNodeData(node, ["eHandlers", name])
        },
        submit: function (action, data, method, target, enctype) {
            data = _.isHash(data) ? data : {};
            data = _.clone(data, function (o) {
                return o !== undefined
            });
            method = method || "get";
            action = action || "";
            target = target || (action.substring(0, 6).toLowerCase() == "mailto" ? "_self" : "_blank");
            var _t = [];
            if (!_.isEmpty(data)) {
                if (method.toLowerCase() == "get") {
                    window.open(action + "?" + _.urlEncode(data), target)
                } else {
                    _.each(data, function (o, i) {
                        if (_.isDefined(o)) {
                            _t.push('<textarea name="' + i + '">' + (typeof o == "object" ? _.serialize(o) : o) + "</textarea>")
                        }
                    });
                    _t.push('<input type="hidden" name="rnd" value="' + _() + '">');
                    _t = _.str.toDom('<form target="' + target + '" action="' + action + '" method="' + method + (enctype ? '" enctype="' + enctype : "") + '">' + _t.join("") + "</form>");
                    xui.Dom.getEmptyDiv().append(_t);
                    _t.get(0).submit();
                    _t.remove();
                    _t = null
                }
            } else {
                window.open(action, target)
            }
        },
        busy: function (label) {
            xui.Dom.setCover(true, label)
        },
        free: function (label) {
            xui.Dom.setCover(false, label)
        },
        animate: function (css, args, onStart, onEnd, time, step, type, threadid, unit) {
            var node = document.createElement("div");
            _.merge(css, {
                position: "absolute",
                left: this.HIDE_VALUE,
                zIndex: this.TOP_ZINDEX + 10
            });
            xui.Dom.setStyle(node, css);
            document.body.appendChild(node);
            return xui([node]).animate(args, onStart, function () {
                _.tryF(onEnd);
                if (node.parentNode) {
                    node.parentNode.removeChild(node)
                }
                node = null
            }, time, step, type, threadid, unit)
        },
        $enableEvents: function (name) {
            if (!_.isArr(name)) {
                name = [name]
            }
            var self = this,
                f;
            _.arr.each(name, function (o) {
                f = function (fun, label, flag) {
                    if (typeof fun == "function") {
                        return this.$addEvent(o, fun, label, flag)
                    } else {
                        if (fun === null) {
                            return this.$removeEvent(o, label, flag)
                        }
                    }
                    var args = arguments[1] || {};
                    args.$all = (arguments[0] === true);
                    return this.$fireEvent(o, args)
                };
                f.$event$ = 1;
                self.plugIn(o, f)
            })
        }
    },
    After: function (d) {
        var self = this;
        _.each({
            parent: ["y", false],
            prev: ["x", false],
            next: ["x", true],
            first: ["y", true],
            last: ["y", 1]
        }, function (o, i) {
            self.plugIn(i, function (index) {
                return this.$iterator(o[0], o[1], true, index || 1)
            })
        });
        _.arr.each(_.toArr("offsetLeft,offsetTop,scrollWidth,scrollHeight"), function (o) {
            self.plugIn(o, function () {
                var t = this.get(0),
                    w = window,
                    d = document;
                if (t == w || t == d) {
                    if ("scrollWidth" == o || "scrollHeight" == o) {
                        var a = d.documentElement,
                            b = d.body;
                        return Math.max(a[o], b[o])
                    } else {
                        t = xui.browser.contentBox ? d.documentElement : d.body
                    }
                }
                return t[o]
            })
        });
        var p = "padding",
            m = "margin",
            b = "border",
            c = "inner",
            o = "offset",
            r = "outer",
            w = "width",
            h = "height",
            W = "Width",
            H = "Height",
            T = "Top",
            L = "Left",
            t = "top",
            l = "left",
            R = "Right",
            B = "Bottom";
        _.arr.each([
            ["_" + p + "H", p + T, p + B],
            ["_" + p + "W", p + L, p + R],
            ["_" + b + "H", b + T + W, b + B + W],
            ["_" + b + "W", b + L + W, b + R + W],
            ["_" + m + "W", m + L, m + R],
            ["_" + m + "H", m + T, m + B]
        ], function (o) {
            var node, fun = xui.Dom.getStyle;
            self.plugIn(o[0], function () {
                node = this.get(0);
                return (parseInt(fun(node, o[1]), 10) + parseInt(fun(node, o[2]), 10)) || 0
            })
        });
        _.arr.each([
            ["_W", w, "_" + p + "W", "_" + b + "W", "_" + m + "W", c + W, o + W],
            ["_H", h, "_" + p + "H", "_" + b + "H", "_" + m + "H", c + H, o + H]
        ], function (o) {
            self.plugIn(o[0], function (node, index, value) {
                var n, r, t, style = node.style,
                    me = arguments.callee,
                    contentBox = xui.browser.contentBox,
                    r1 = me.r1 || (me.r1 = /%$/),
                    getStyle = xui.Dom.getStyle,
                    f = xui.Dom._setPxStyle,
                    type = typeof value,
                    t1;
                if (type == "undefined" || type == "boolean") {
                    if (value === true) {
                        n = (getStyle(node, "display") == "none");
                        if (n) {
                            var temp = xui.Dom.getEmptyDiv().html("*", false);
                            xui([node]).swap(temp);
                            var b, p, d;
                            b = style.visibility, p = style.position, d = style.display;
                            p = p || "";
                            b = b || "";
                            d = d || "";
                            style.visibility = "hidden";
                            style.position = "absolute";
                            style.display = "block"
                        }
                    }
                    t = xui([node]);
                    switch (index) {
                    case 1:
                        r = getStyle(node, o[1]);
                        if (isNaN(parseInt(r, 10)) || r1.test(r)) {
                            r = me(node, 2) - (contentBox ? t[o[2]]() : 0)
                        }
                        r = parseInt(r, 10) || 0;
                        break;
                    case 2:
                        r = node[o[6]] - t[o[3]]();
                        break;
                    case 3:
                        r = node[o[6]];
                        if (!r) {
                            r = me(node, 1) + (contentBox ? t[o[2]]() : 0) + t[o[3]]()
                        }
                        break;
                    case 4:
                        r = me(node, 3);
                        r += t[o[4]]();
                        break
                    }
                    if (n) {
                        style.display = d;
                        style.position = p;
                        style.visibility = b;
                        t.swap(temp);
                        temp.empty(false)
                    }
                    return parseInt(r, 10) || 0
                } else {
                    switch (index) {
                    case 1:
                        if (f(node, o[1], value)) {
                            if (xui.Dom.$hasEventHandler(node, "onsize")) {
                                var args = {};
                                args[o[1]] = 1;
                                xui([node]).onSize(true, args)
                            }
                        }
                        break;
                    case 2:
                        me(node, 1, value - (contentBox ? xui([node])[o[2]]() : 0));
                        break;
                    case 3:
                        me(node, 1, value - (t = xui([node]))[o[3]]() - (contentBox ? t[o[2]]() : 0));
                        break;
                    case 4:
                        me(node, 1, value - (t = xui([node]))[o[4]]() - t[o[3]]() - (contentBox ? t[o[2]]() : 0));
                        break
                    }
                }
            })
        });
        _.arr.each([
            [c + W, "_W", 2],
            [o + W, "_W", 3],
            [r + W, "_W", 4],
            [c + H, "_H", 2],
            [o + H, "_H", 3],
            [r + H, "_H", 4]
        ], function (o) {
            self.plugIn(o[0], function (value) {
                var type = typeof value;
                if (type == "undefined" || type == "boolean") {
                    return this[o[1]](this.get(0), o[2])
                } else {
                    return this.each(function (v) {
                        this[o[1]](v, o[2], value)
                    })
                }
            })
        });
        _.arr.each([
            [l + "By", l],
            [t + "By", t],
            [w + "By", w],
            [h + "By", h]
        ], function (o) {
            self.plugIn(o[0], function (offset, triggerEvent) {
                if (offset === 0) {
                    return this
                }
                var m, args, k = o[1];
                return this.each(function (node) {
                    m = xui.use(node.$xid)[k]();
                    m = (parseInt(m, 10) || 0) + offset;
                    if (k == "width" || k == "height") {
                        m = m > 0 ? m : 0
                    }
                    node.style[k] = m + "px";
                    if (triggerEvent) {
                        args = {};
                        args[k] = 1;
                        var f = xui.Dom.$hasEventHandler;
                        if ((k == "left" || k == "top") && f(node, "onmove")) {
                            xui([node]).onMove(true, args)
                        }
                        if ((k == "width" || k == "height") && f(node, "onsize")) {
                            xui([node]).onSize(true, args)
                        }
                    }
                }, this)
            })
        });
        _.arr.each(["scrollLeft", "scrollTop"], function (o) {
            self.plugIn(o, function (value) {
                if (value !== undefined) {
                    return this.each(function (v) {
                        v[o] = value
                    })
                } else {
                    var v = this.get(0);
                    if (v === window || v === document) {
                        var a = document.documentElement,
                            b = document.body;
                        if ("scrollTop" == o) {
                            return window.pageYOffset || Math.max(a[o], b[o])
                        }
                        if ("scrollLeft" == o) {
                            return window.pageXOffset || Math.max(a[o], b[o])
                        }
                    }
                    return v[o]
                }
            })
        });
        _.arr.each("width,height,left,top".split(","), function (o) {
            self.plugIn(o, function (value) {
                var self = this,
                    node = self.get(0),
                    b = xui.browser,
                    type = typeof value,
                    doc = document,
                    t;
                if (!node || node.nodeType == 3) {
                    return
                }
                if (type == "undefined" || type == "boolean") {
                    if ((o == "width" && (t = "Width")) || (o == "height" && (t = "Height"))) {
                        if (doc === node) {
                            return Math.max(doc.body["scroll" + t], doc.body["offset" + t], doc.documentElement["scroll" + t], doc.documentElement["offset" + t])
                        }
                        if (window === node) {
                            return b.opr ? Math.max(doc.body["client" + t], window["inner" + t]) : b.kde ? window["inner" + t] : (xui.browser.contentBox && doc.documentElement["client" + t]) || doc.body["client" + t]
                        }
                    }
                    if (o == "width") {
                        value = parseInt(node.style.width, 10) || self._W(node, 1, value)
                    } else {
                        if (o == "height") {
                            value = parseInt(node.style.height, 10) || self._H(node, 1, value)
                        } else {
                            value = xui.Dom.getStyle(node, o)
                        }
                    }
                    return value == "auto" ? value : (parseInt(value, 10) || 0)
                } else {
                    var f = xui.Dom._setPxStyle,
                        t, a;
                    return self.each(function (v) {
                        if (v.nodeType != 1) {
                            return
                        }
                        if (v.style[o] !== value) {
                            if (o == "width") {
                                self._W(v, 1, value)
                            } else {
                                if (o == "height") {
                                    self._H(v, 1, value)
                                } else {
                                    if (f(v, o, value)) {
                                        if ((o == "top" || o == "left") && xui.Dom.$hasEventHandler(node, "onmove")) {
                                            a = {};
                                            a[o] = 1;
                                            xui([v]).onMove(true, a)
                                        }
                                    }
                                }
                            }
                        }
                    })
                }
            })
        });
        _.arr.each(xui.Event._events, function (o) {
            _.arr.each(xui.Event._getEventName(o), function (o) {
                self.$enableEvents(o)
            })
        })
    },
    Initialize: function () {
        _.set(xui.$cache.domPurgeData, "!window", {
            $xid: "!window",
            element: window
        });
        _.set(xui.$cache.domPurgeData, "!document", {
            $xid: "!document",
            element: document
        });
        xui.win = xui(["!window"], false);
        xui.doc = xui(["!document"], false);
        xui.$inlineBlock = xui.browser.gek ? xui.browser.ver < 3 ? ["-moz-inline-block", "-moz-inline-box", "inline-block"] : "inline-block" : xui.browser.ie6 ? ["inline-block", "inline"] : "inline-block", xui.doc.onKeydown(function (p, e, s) {
            xui.Event.$keyboard = xui.Event.getKey(e);
            var event = xui.Event,
                set, ks = event.getKey(e);
            if (ks) {
                if (ks[0].length == 1) {
                    ks[0] = ks[0].toLowerCase()
                }
                set = xui.$cache.hookKey[ks.join(":")];
                if (set) {
                    if (set[3]) {
                        if (typeof set[3] == "function" ? false === (set[3])() : (!xui(set[3]).size())) {
                            delete xui.$cache.hookKey[ks.join(":")];
                            return
                        }
                    }
                    if (_.tryF(set[0], set[1], set[2]) === false) {
                        event.stopBubble(e);
                        return false
                    }
                }
            }
            return true
        }, "document").onKeyup(function (p, e) {
            delete xui.Event.$keyboard;
            var event = xui.Event,
                set, ks = event.getKey(e);
            if (ks) {
                if (ks[0].length == 1) {
                    ks[0] = ks[0].toLowerCase()
                }
                set = xui.$cache.hookKeyUp[ks.join(":")];
                if (set) {
                    if (set[3]) {
                        if (typeof set[3] == "function" ? false === (set[3])() : (!xui(set[3]).size())) {
                            delete xui.$cache.hookKeyUp[ks.join(":")];
                            return
                        }
                    }
                    if (_.tryF(set[0], set[1], set[2]) === false) {
                        event.stopBubble(e);
                        return false
                    }
                }
            }
            return true
        }, "document");
        xui.doc.onClick(function (p, e, src) {
            if (!xui.History) {
                return
            }
            var s = location.href.split("#")[0],
                t = xui.Event,
                o = t.getSrc(e),
                b, i = 0,
                b;
            do {
                if (o.tagName == "A") {
                    b = true;
                    break
                }
                if (++i > 8) {
                    break
                }
            } while (o = o.parentNode);
            if (b) {
                if (o.href.indexOf("javascript:") == 0) {
                    return false
                }
                if (!t.getKey(e).shiftKey && t.getBtn(e) == "left" && (o.href.indexOf(s + "#") == 0 || o.href.indexOf("#") == 0)) {
                    xui.History.setFI(o.href.replace(s, ""));
                    return false
                }
            }
        }, "hookA", 0);
        if (xui.browser.ie && document.body) {
            document.body.onselectstart = function (n) {
                n = event.srcElement;
                while (n && n.tagName && n.tagName != "BODY" && n.tagName != "HTML") {
                    if ("_onxuisel" in n) {
                        return n._onxuisel != "false"
                    }
                    n = n.parentNode
                }
                return true
            }
        }
        xui.win.afterUnload(function () {
            window.onresize = null;
            if (window.removeEventListener) {
                window.removeEventListener("DOMMouseScroll", xui.Event.$eventhandler3, false);
                if (xui.browser.isTouch) {
                    document.removeEventListener("touchstart", xui.Event._simulateMousedown, true);
                    if (xui.browser.isAndroid || xui.browser.isBB) {
                        document.removeEventListener("touchend", xui.Event._simulateFocus, true)
                    }
                }
            }
            document.onmousewheel = window.onmousewheel = null;
            if (xui.browser.ie && document.body) {
                document.body.onselectstart = null
            }
            if ("onhashchange" in window) {
                window.onhashchange = null
            }
            xui.SC.__gc();
            xui.Thread.__gc();
            xui([window, document]).$clearEvent();
            xui("body").empty();
            _.breakO(xui.$cache, 2);
            _.breakO([xui, Class, _], 3);
            window.Class = window.Namespace = window.xui = window._ = undefined
        }, "window", -1)
    }
});
Class("xui.Template", "xui.absProfile", {
    Constructor: function (template, properties, events, domId) {
        arguments.callee.upper.apply(this, arguments);
        var self = this;
        self.$domId = self.KEY + ":" + (self.serialId = self._pickSerialId()) + ":";
        self.domId = typeof domId == "string" ? domId : self.$domId;
        self._links = {};
        self.template = {
            root: [
                ["<div></div>"],
                []
            ]
        };
        self.properties = {};
        self.events = {};
        self.$template = {};
        self.link(self.constructor._cache, "self").link(xui._pool, "xui");
        self.box = self.constructor;
        self.boxing = function () {
            return this
        };
        if (template) {
            self.setTemplate(typeof template == "string" ? {
                root: template
            } : template)
        }
        if (events) {
            self.setEvents(events)
        }
        if (properties) {
            self.setProperties(properties)
        }
        return self
    },
    Instance: {
        renderId: null,
        __gc: function () {
            var self = this,
                t = xui.$cache.reclaimId;
            if (!self.$noReclaim) {
                (t[self.KEY] || (t[self.KEY] = [])).push(self.serialId)
            } else {
                delete self.$noReclaim
            }
            delete xui.$cache.profileMap[self.domId];
            delete xui.$cache.profileMap[self.$domId];
            self.unLinkAll();
            _.breakO([self.properties, self.event, self], 2)
        },
        _reg0: /^\w[\w_-]*$/,
        show: function (parent) {
            if (!parent) {
                parent = xui("body")
            }
            parent = xui(parent);
            parent.append(this);
            return this
        },
        getRootNode: function () {
            return xui.getNodeData(this.renderId, "element")
        },
        getRoot: function () {
            return xui([this.renderId], false)
        },
        setDomId: function (id) {
            var t = this,
                c = xui.$cache.profileMap,
                reg = t._reg0;
            if (typeof id == "string" && reg.test(id) && !document.getElementById(id)) {
                if (t.domId != t.$domId) {
                    delete c[t.domId]
                }
                t.domId = id;
                if (t.renderId) {
                    t.getRootNode().id = id
                }
                if (c[t.$domId]) {
                    c[id] = t
                }
            }
            return t
        },
        destroy: function () {
            if (this.renderId) {
                var rn = this.getRootNode();
                xui.$purgeChildren(rn);
                if (rn.parentNode) {
                    rn.parentNode.removeChild(rn)
                }
                rn = null
            } else {
                this.__gc()
            }
        },
        setEvents: function (key, value) {
            var self = this;
            if (typeof key == "object") {
                self.events = key
            } else {
                self.events[key] = value
            }
            return self
        },
        setTemplate: function (key, value) {
            var self = this,
                t = self.template,
                $t = self.$template,
                h;
            if (typeof key == "object") {
                self.template = key;
                h = {};
                for (var i in key) {
                    h[i || "root"] = self._buildTemplate(key[i])
                }
                self.$template = h
            } else {
                if (typeof value == "string") {
                    $t[key] = self._buildTemplate(t[key] = value)
                } else {
                    $t.root = self._buildTemplate(t.root = key)
                }
            }
            return self
        },
        setProperties: function (key, value) {
            var self = this;
            if (typeof key == "object") {
                self.properties = key
            } else {
                self.properties[key] = value
            }
            return self
        },
        getItem: function (src) {
            var obj = xui.getNodeData(src);
            if (!obj) {
                return
            }
            var id = obj.tpl_evid,
                tpl_evkey = obj.tpl_evkey;
            if (!id || !tpl_evkey) {
                return
            }
            var me = arguments.callee,
                f = me.f || (me.f = function (data, tpl_evkey, id) {
                    var i, o, j, v;
                    for (j in data) {
                        o = data[j];
                        if (_.isArr(o) && (tpl_evkey == j || tpl_evkey.indexOf((data.tpl_evkey || j) + ".") === 0)) {
                            for (i = 0; v = o[i]; i++) {
                                if (v.tpl_evkey == tpl_evkey && v.id == id) {
                                    return v
                                } else {
                                    if (v = f(v, tpl_evkey, id)) {
                                        return v
                                    }
                                }
                            }
                        }
                    }
                });
            return f(this.properties, tpl_evkey, id)
        },
        _pickSerialId: function () {
            var arr = xui.$cache.reclaimId[this.KEY];
            if (arr && arr[0]) {
                return arr.shift()
            }
            return this.constructor._ctrlId.next()
        },
        render: function () {
            var self = this;
            if (!self.renderId) {
                var div = xui.$getGhostDiv();
                xui.$cache.profileMap[self.domId] = xui.$cache.profileMap[self.$domId] = this;
                div.innerHTML = self.toHtml();
                var ch = self.events,
                    eh = xui.Event._eventHandler,
                    children = div.getElementsByTagName("*"),
                    domId = self.$domId,
                    f = function () {
                        return xui.Event(arguments[0], this, 0, domId)
                    },
                    i, l, j, k, o, key, id, t, v;
                if (l = children.length) {
                    for (i = 0; i < l; i++) {
                        if ((o = children[i]).nodeType != 1) {
                            continue
                        }
                        key = o.getAttribute("tpl_evkey");
                        id = o.getAttribute("tpl_evid");
                        if (key !== null && id !== null) {
                            v = xui.$registerNode(o);
                            v.tpl_evkey = key;
                            v.tpl_evid = id;
                            if (t = ch[key]) {
                                v = v.eHandlers || (v.eHandlers = {});
                                for (j in t) {
                                    v[j] = f;
                                    if (k = eh[j]) {
                                        v[k] = o[k] = f
                                    }
                                }
                            }
                            o.removeAttribute("tpl_evkey");
                            o.removeAttribute("tpl_evid")
                        }
                    }
                    if (!div.firstChild.$xid) {
                        xui.$registerNode(div.firstChild)
                    }
                    self.renderId = div.firstChild.$xid
                }
                o = div = null
            }
            return self
        },
        refresh: function () {
            var ns = this;
            if (ns.renderId) {
                var proxy = document.createElement("span"),
                    rn = ns.getRootNode(),
                    cache = xui.$cache.profileMap;
                delete cache[ns.domId];
                delete cache[ns.$domId];
                if (rn.parentNode) {
                    rn.parentNode.replaceChild(proxy, rn)
                }
                ns.destroy();
                delete ns.renderId;
                ns.render();
                if (proxy.parentNode) {
                    proxy.parentNode.replaceChild(ns.getRootNode(), proxy)
                }
                proxy = rn = null
            }
            return ns
        },
        renderOnto: function (node) {
            var self = this,
                id, domNode, style = "style",
                t;
            if (typeof node == "string") {
                node = document.getElementById(node)
            }
            id = node.id || self.domId;
            if (!self.renderId) {
                self.render()
            }
            domNode = self.getRootNode();
            node.parentNode.replaceChild(domNode, node);
            if (domNode.tabIndex != node.tabIndex) {
                domNode.tabIndex != node.tabIndex
            }
            if (node.className) {
                domNode.className += node.className
            }
            if (xui.browser.ie && (t = node.style.cssText)) {
                domNode.style.cssText += t + ""
            } else {
                if (t = node.getAttribute(style)) {
                    domNode.setAttribute(style, (domNode.getAttribute(style) || "") + t)
                }
            }
            this.setDomId(id)
        },
        toHtml: function (properties) {
            var p = _.copy(properties || this.properties || {});
            p.tpl_evkey = "root";
            return this._doTemplate(p)
        },
        _reg1: /([^{}]*)\{([\w]+)\}([^{}]*)/g,
        _reg2: /\[event\]/g,
        _buildTemplate: function (str) {
            if (typeof str == "string") {
                var obj = [
                    [],
                    []
                ],
                    a0 = obj[0],
                    a1 = obj[1];
                str = str.replace(this._reg2, ' tpl_evid="{id}" tpl_evkey="{tpl_evkey}" ');
                str.replace(this._reg1, function (a, b, c, d) {
                    if (b) {
                        a0[a0.length] = b
                    }
                    a1[a0.length] = a0[a0.length] = c;
                    if (d) {
                        a0[a0.length] = d
                    }
                    return ""
                });
                return obj
            } else {
                return str
            }
        },
        _getEV: function (funs, id, name, xid) {
            var obj = xui.getNodeData(xid);
            if (!obj) {
                return
            }
            var evs = this.events,
                tpl_evkey = obj.tpl_evkey,
                evg = (tpl_evkey && evs && evs[tpl_evkey]) || evs,
                ev = evg && evg[name];
            if (ev) {
                funs.push(ev)
            }
        },
        _reg3: /(^\s*<\w+)(\s|>)(.*)/,
        _doTemplate: function (properties, tag, result) {
            if (!properties) {
                return ""
            }
            var self = this,
                me = arguments.callee,
                s, t, n, isA = properties.constructor == Array,
                template = self.$template,
                temp = template[tag || "root"],
                r = !result;
            result = result || [];
            if (isA) {
                if (typeof temp != "function") {
                    temp = me
                }
                for (var i = 0; t = properties[i++];) {
                    t.tpl_evkey = tag;
                    temp.call(self, t, tag, result)
                }
            } else {
                if (typeof temp == "function") {
                    temp.call(self, properties, tag, result)
                } else {
                    tag = tag ? tag + "." : "";
                    var a0 = temp[0],
                        a1 = temp[1];
                    for (var i = 0, l = a0.length; i < l; i++) {
                        if (n = a1[i]) {
                            if (n in properties) {
                                t = typeof properties[n] == "function" ? properties[n].call(self, n, properties) : properties[n];
                                if (template[s = tag + n]) {
                                    me.call(self, t, s, result)
                                } else {
                                    result[result.length] = t
                                }
                            }
                        } else {
                            result[result.length] = a0[i]
                        }
                    }
                }
            }
            if (r) {
                return result.join("").replace(self._reg3, '$1 id="' + self.$domId + '" $2$3')
            }
        },
        serialize: function () {
            var self = this,
                s = _.serialize,
                t = xui.absObj.$specialChars,
                properties = _.isEmpty(self.properties) ? null : _.clone(self.properties, function (o, i) {
                    return !t[(i + "").charAt(0)]
                });
            return "new xui.Template(" + s(self.template || null) + "," + s(properties) + "," + s(_.isEmpty(self.events) ? null : self.events) + "," + s(self.$domId != self.domId ? self.domId : null) + ")"
        }
    },
    Static: {
        getFromDom: function (id) {
            if ((id = typeof id == "string" ? id : (id && id.id)) && (id = xui.$cache.profileMap[id]) && id["xui.Template"]) {
                return id.boxing()
            }
        },
        _cache: [],
        _ctrlId: new _.id()
    }
});
Class("xui.Com", null, {
    Constructor: function (properties, events, host) {
        var self = this;
        self._nodes = [];
        self.host = host || self;
        self.$xid = self.constructor._ctrlId.next();
        self.properties = properties || (self.properties ? _.clone(self.properties) : {});
        self.events = _.copy(self.events) || {};
        if (events) {
            _.merge(self.events, events, "all")
        }
        self._ctrlpool = {};
        self._innerCall("initialize")
    },
    Instance: {
        autoDestroy: true,
        dataBindLoadType: "sync",
        _toDomElems: function () {
            var ns = this;
            if (!ns.created) {
                ns.create(null, false)
            }
            ns.render();
            return ns.getUIComponents()._toDomElems()
        },
        setAlias: function (str) {
            var self = this,
                old = self.alias;
            if (old && self.host && self.host !== self) {
                try {
                    delete self.host[old]
                } catch (e) {
                    self.host[old] = undefined
                }
            }
            if (self.host && self.host !== self) {
                self.host[str] = self
            }
            return self
        },
        getAlias: function () {
            return this.alias
        },
        setHost: function (host, alias) {
            var self = this;
            self.host = host;
            if (alias) {
                self.setAlias(alias)
            }
            return self
        },
        getHost: function () {
            return this.host
        },
        setProperties: function (key, value) {
            var self = this;
            if (!key) {
                self.properties = {}
            } else {
                if (typeof key == "string") {
                    self.properties[key] = value
                } else {
                    _.merge(self.properties, key, "all")
                }
            }
            return self
        },
        getProperties: function (key) {
            return key ? this.properties[key] : this.properties
        },
        setEvents: function (key, value) {
            var self = this;
            if (!key) {
                self.events = {}
            } else {
                if (typeof key == "string") {
                    self.events[key] = value
                } else {
                    _.merge(self.events, key, "all")
                }
            }
            return self
        },
        getEvents: function (key) {
            return key ? this.events[key] : this.events
        },
        fireEvent: function (name, args, host) {
            var t, self = this;
            if (self.events && (t = self.events[name])) {
                if (typeof t == "string") {
                    t = self[t]
                }
                if (typeof t == "function") {
                    return t.apply(host || self.host || self, args || [])
                }
            }
        },
        _fireEvent: function (name, args) {
            var t, self = this;
            if (self.events && (t = self.events[name])) {
                if (typeof t == "string") {
                    t = self[t]
                }
                self.$lastEvent = name;
                if (typeof t == "function") {
                    args = args || [];
                    args.splice(0, 0, self, self.threadid);
                    return t.apply(self.host || self, args)
                }
            }
        },
        _innerCall: function (name) {
            var self = this;
            return _.tryF(self[name], [self, self.threadid], self)
        },
        customAppend: function (parent, subId, left, top, threadid) {
            return false
        },
        show: function (onEnd, parent, subId, threadid, left, top) {
            var self = this,
                f = function () {
                    if (self.getUIComponents().isEmpty()) {
                        _.tryF(onEnd, [self, threadid], self.host)
                    } else {
                        if (!(parent && parent["xui.UI"] && !parent.get(0).renderId)) {
                            self.render()
                        }
                        if (false === _.tryF(self.customAppend, [parent, subId, left, top, threadid], self)) {
                            (parent || xui("body")).append(self.getUIComponents(), subId)
                        }
                        _.tryF(onEnd, [self, threadid], self.host)
                    }
                };
            self.threadid = threadid;
            if (self.created) {
                f()
            } else {
                self.create(f, threadid)
            }
            return self
        },
        render: function (triggerLayout) {
            var self = this;
            if (self.renderId != "ok") {
                self.getUIComponents().render(triggerLayout);
                self._fireEvent("onRender");
                self.renderId = "ok"
            }
            return self
        },
        create: function (onEnd, threadid) {
            var self = this;
            if (self.created) {
                _.tryF(onEnd, [self, threadid], self.host);
                return
            }
            var t, funs = [];
            self.threadid = threadid;
            if (false === self._fireEvent("beforeCreated")) {
                return
            }
            funs.push(function (threadid) {
                if (threadid) {
                    self.threadid = threadid
                }
                self._fireEvent("onCreated")
            });
            if (self.dataBindLoadType != "none") {
                var bds = self.getDataBinders();
                if (bds && bds.length) {
                    var dbf = function (threadid) {
                            var hash = {};
                            _.arr.each(bds, function (bd, i) {
                                var ajax = bd.boxing().read(null, null, null, null, "return");
                                if (ajax) {
                                    hash[i] = ajax
                                }
                            });
                            if (!_.isEmpty(hash)) {
                                xui.absIO.groupCall(hash, null, null, null, threadid)
                            }
                            bds.length = 0;
                            hash = bds = null
                        };
                    if (self.dataBindLoadType == "sync") {
                        funs.push(dbf)
                    } else {
                        dbf()
                    }
                }
            }
            if ((t = self.base) && t.length) {
                funs.push(function (threadid) {
                    xui.SC.groupCall(self.base, function (key) {
                        self._fireEvent("onLoadBaseClass", [key])
                    }, null, threadid)
                })
            }
            if ((t = self.required) && t.length) {
                funs.push(function (threadid) {
                    xui.SC.groupCall(self.required, function (key) {
                        self._fireEvent("onLoadReqiredClass", [key])
                    }, null, threadid)
                })
            }
            if (self.iniComponents) {
                funs.push(function () {
                    self._createInnerComs()
                })
            }
            if (self.iniResource) {
                funs.push(function () {
                    self._fireEvent("onIniResource");
                    self._innerCall("iniResource")
                })
            }
            if (self.iniExComs) {
                funs.push(function () {
                    self._innerCall("iniExComs")
                })
            }
            funs.push(function (threadid) {
                if (self.background) {
                    xui.SC.runInBG(self.background)
                }
                self._fireEvent("onReady")
            });
            funs.push(function (threadid) {
                self.created = true;
                _.tryF(onEnd, [self, threadid], self.host)
            });
            if (threadid === false) {
                _.arr.each(funs, function (fun) {
                    fun.call()
                })
            } else {
                xui.Thread.observableRun(funs, null, threadid)
            }
            return self
        },
        _createInnerComs: function () {
            var self = this;
            if (self._innerComsCreated) {
                return
            }
            if (false === self._fireEvent("beforeIniComponents")) {
                return
            }
            Array.prototype.push.apply(self._nodes, self._innerCall("iniComponents") || []);
            if (self.autoDestroy) {
                _.arr.each(self._nodes, function (o) {
                    if (o.box && o.box["xui.UI"] && !o.box.$noDomRoot) {
                        (o.$afterDestroy = (o.$afterDestroy || {}))["comDestroyTrigger"] = function () {
                            if (self.autoDestroy && !self.destroyed) {
                                self.destroy()
                            }
                            self = null
                        };
                        return false
                    }
                })
            }
            self._fireEvent("afterIniComponents");
            self._innerComsCreated = true
        },
        iniComponents: function () {},
        getAllComponents: function () {
            if (!this._innerComsCreated) {
                this._createInnerComs()
            }
            var arr = [];
            _.each(this._ctrlpool, function (o) {
                arr.push(o)
            });
            return xui.absObj.pack(arr, false)
        },
        getDataBinders: function () {
            if (!this._innerComsCreated) {
                this._createInnerComs()
            }
            var nodes = _.copy(this._nodes),
                t, k = "xui.DataBinder";
            _.filter(nodes, function (o) {
                return !!(o.box[k])
            });
            return nodes
        },
        getUIComponents: function () {
            if (!this._innerComsCreated) {
                this._createInnerComs()
            }
            var nodes = _.copy(this._nodes),
                t, k = "xui.UI";
            _.filter(nodes, function (o) {
                return !!(o.box[k])
            });
            return xui.UI.pack(nodes, false)
        },
        getComponents: function () {
            if (!this._innerComsCreated) {
                this._createInnerComs()
            }
            return xui.absObj.pack(_.copy(this._nodes), false)
        },
        setComponents: function (obj) {
            var self = this,
                t;
            _.arr.each(self._nodes, function (o) {
                if ((t = self[o.alias]) && t.get(0) == o) {
                    delete self[o.alias]
                }
            });
            _.arr.each(self._nodes = obj.get(), function (o) {
                o.boxing().setHost(self, o.alias)
            });
            return self
        },
        AddComponents: function (obj) {
            var self = this,
                ns = self._nodes;
            _.arr.each(obj.get(), function (o) {
                o.boxing().setHost(self, o.alias);
                self._nodes.push(o)
            });
            return self
        },
        isDestroyed: function () {
            return !!this.destroyed
        },
        destroy: function (threadid) {
            var self = this,
                ns = self._nodes;
            self.threadid = threadid;
            self._fireEvent("onDestroy");
            self.destroyed = true;
            if (ns && ns.length) {
                _.arr.each(ns, function (o) {
                    if (o && o.box) {
                        o.boxing().destroy()
                    }
                }, null, true)
            }
            if (ns && ns.length) {
                self._nodes.length = 0
            }
            self._ctrlpool = null;
            _.breakO(self);
            self.destroyed = true
        }
    },
    Static: {
        _ctrlId: new _.id(),
        load: function (cls, onEnd, lang, showUI) {
            var fun = function () {
                    xui.SC(cls, function (path) {
                        if (path) {
                            var a = this,
                                f = function () {
                                    var o = new a();
                                    if (showUI !== false) {
                                        o.show(onEnd)
                                    } else {
                                        _.tryF(onEnd, [o], o)
                                    }
                                };
                            if (lang) {
                                xui.setLang(lang, f)
                            } else {
                                f()
                            }
                        } else {
                            throw new Error(cls + " doesnt exists!")
                        }
                    }, true)
                };
            if (xui.isDomReady) {
                fun()
            } else {
                xui.main(fun)
            }
        },
        $EventHandlers: {
            beforeCreated: function (com, threadid) {},
            onLoadBaseClass: function (com, threadid, key) {},
            onIniResource: function (com, threadid) {},
            beforeIniComponents: function (com, threadid) {},
            afterIniComponents: function (com, threadid) {},
            onLoadRequiredClass: function (com, threadid, key) {},
            onReady: function (com, threadid) {},
            onRender: function (com, threadid) {},
            onDestroy: function (com) {}
        }
    }
});
Class("xui.Cookies", null, {
    Static: {
        set: function (name, value, days, path, domain, isSecure) {
            if (name) {
                document.cookie = escape(name) + "=" + escape(value) + (days ? ";expires=" + (new Date((new Date()).getTime() + (24 * 60 * 60 * 1000 * days))).toGMTString() : "") + (path ? ";path=" + path : "") + (domain ? ";domain=" + domain : "") + (isSecure ? ";secure" : "")
            }
            return this
        },
        get: function (name) {
            var i, a, ca = document.cookie.split("; ");
            for (i = 0; i < ca.length; i++) {
                a = ca[i].split("=");
                if (a[0] == escape(name)) {
                    return a[1] ? unescape(a[1]) : ""
                }
            }
            return null
        },
        remove: function (name) {
            return this.set(name, "", -1).set(name, "/", -1)
        },
        clear: function () {
            _.arr.each(document.cookie.split(";"), function (o) {
                xui.Cookies.remove(_.str.trim(o.split("=")[0]))
            })
        }
    }
});
Class("xui.MessageService", null, {
    Instance: {
        initialize: function () {
            this.$subscribers = {}
        },
        subscribe: function (topic, subscriber, receiver, asy) {
            if (topic === null || topic === undefined || subscriber === null || subscriber === undefined || typeof receiver != "function") {
                return
            }
            var c = this.$subscribers,
                i;
            c[topic] = c[topic] || [];
            i = _.arr.subIndexOf(c[topic], "id", subscriber);
            if (i != -1) {
                _.arr.removeFrom(c[topic], i)
            }
            return c[topic].push({
                id: subscriber,
                receiver: receiver,
                asy: !! asy
            })
        },
        unsubscribe: function (topic, subscriber) {
            var c = this.$subscribers,
                i;
            if (!subscriber) {
                if (topic === null || topic === undefined) {
                    c = {}
                } else {
                    delete c[topic]
                }
            } else {
                if (c[topic]) {
                    i = _.arr.subIndexOf(c[topic], "id", subscriber);
                    if (i != -1) {
                        _.arr.removeFrom(c[topic], i)
                    }
                }
            }
        },
        publish: function (topic, args, scope) {
            var c = this.$subscribers;
            if (topic === null || topic === undefined) {
                for (var topic in c) {
                    _.arr.each(c[topic], function (o) {
                        if (o.asy) {
                            _.asyRun(o.receiver, 0, args, scope)
                        } else {
                            return _.tryF(o.receiver, args, scope, true)
                        }
                    })
                }
            } else {
                if (c[topic]) {
                    _.arr.each(c[topic], function (o) {
                        if (o.asy) {
                            _.asyRun(o.receiver, 0, args, scope)
                        } else {
                            return _.tryF(o.receiver, args, scope, true)
                        }
                    })
                }
            }
        },
        getSubscribers: function (topic) {
            return (topic === null || topic === undefined) ? this.$subscribers : this.$subscribers[topic]
        }
    }
});
Class("xui.XML", null, {
    Static: {
        json2xml: function (jsonObj, kf, vf) {
            var arr = [],
                _f = function (key, value, arr) {
                    if (typeof value == "object") {
                        if (_.isArr(value)) {
                            if (value.length) {
                                for (var i = 0, l = value.length; i < l; i++) {
                                    arr.push(_f(key, value[i], arr))
                                }
                            } else {
                                arr.push("<" + (kf ? kf(key) : key) + ">__[]__</" + (kf ? kf(key) : key) + ">")
                            }
                        } else {
                            var b;
                            arr.push("<" + (kf ? kf(key) : key));
                            for (var i in value) {
                                if (i.charAt(0) == "@") {
                                    arr.push(" " + i.substr(1) + '="' + (vf ? vf(value[i]) : value[i]) + '"')
                                } else {
                                    b = 1
                                }
                            }
                            arr.push(b ? ">" : "/>");
                            if (b) {
                                for (var i in value) {
                                    if (i == "#text") {
                                        arr.push((vf ? vf(value[i]) : value[i]))
                                    } else {
                                        if (i == "#cdata") {
                                            arr.push("<![CDATA[" + (vf ? vf(value[i]) : value[i]) + "]]>")
                                        } else {
                                            if (i.charAt(0) != "@") {
                                                arr.push(_f(i, value[i], arr))
                                            }
                                        }
                                    }
                                }
                                arr.push("</" + (kf ? kf(key) : key) + ">")
                            }
                        }
                    } else {
                        arr.push("<" + (kf ? kf(key) : key) + ">" + (vf ? vf(value) : value) + "</" + (kf ? kf(key) : key) + ">")
                    }
                };
            for (var i in jsonObj) {
                _f(i, jsonObj[i], arr)
            }
            return '<?xml version="1.0" encoding="UTF-8" ?>' + arr.join("")
        },
        xml2json: function (xmlObj) {
            if (xmlObj.nodeType == 9) {
                xmlObj = xmlObj.documentElement
            }
            var o = {},
                M = {
                    "\b": "\\b",
                    "\t": "\\t",
                    "\n": "\\n",
                    "\f": "\\f",
                    "\r": "\\r",
                    '"': '\\"',
                    "\\": "\\\\"
                },
                R = /^-?(\d\d*\.\d*$)|(^-?\d\d*$)|(^-?\.\d\d*$)/,
                _map = {
                    "__[]__": [],
                    "null": null,
                    "false": false,
                    "true": true
                },
                _es = function (str) {
                    return str.replace(/[\s\S]/g, function (a, b) {
                        return (b = M[a]) ? b : a
                    })
                },
                _clear = function (xml) {
                    var n, k;
                    xml.normalize();
                    for (n = xml.firstChild; n;) {
                        k = n;
                        if (n.nodeType == 1) {
                            _clear(n)
                        }
                        n = n.nextSibling;
                        if (k.nodeType == 3 && !k.nodeValue.match(/\S/)) {
                            xml.removeChild(k)
                        }
                    }
                    return xml
                },
                _xml = function (n) {
                    if ("innerHTML" in n) {
                        n = n.innerHTML;
                        n = n in _map ? _map[n] : R.test(n) ? parseFloat(n) : n
                    } else {
                        var arr = [],
                            t, _in = function (n) {
                                if (n.nodeType == 1) {
                                    arr.push("<" + n.nodeName);
                                    var m = n.attributes;
                                    for (var i = 0, l = m.length; i < l; i++) {
                                        arr.push(" " + m[i].nodeName + '="' + (m[i].nodeValue || "") + '"')
                                    }
                                    if (n.firstChild) {
                                        arr.push(">");
                                        for (m = n.firstChild; m; m = m.nextSibling) {
                                            arr.push(_in(m))
                                        }
                                        arr.push("</" + n.nodeName + ">")
                                    } else {
                                        arr.push("/>")
                                    }
                                } else {
                                    if (n.nodeType == 3) {
                                        n = n.nodeValue;
                                        arr.push(n in _map ? _map[n] : R.test(n) ? parseFloat(n) : n)
                                    } else {
                                        if (n.nodeType == 4) {
                                            arr.push("<![CDATA[" + n.nodeValue + "]]>")
                                        }
                                    }
                                }
                            };
                        for (var m = n.firstChild; m; m = m.nextSibling) {
                            _in(m)
                        }
                        n = (arr.length == 1 ? arr[0] : arr.join(""))
                    }
                    return typeof n == "string" ? _es(n) : n
                },
                _f = function (xml) {
                    var o = null,
                        t, tt;
                    if (xml.nodeType == 1 && ((t = xml.attributes).length || xml.firstChild)) {
                        o = {};
                        if (t.length) {
                            for (var i = 0, l = t.length; i < l; i++) {
                                o["@" + t[i].nodeName] = (t[i].nodeValue || "") + ""
                            }
                        }
                        if (xml.firstChild) {
                            var text = 0,
                                cdata = 0,
                                children = 0,
                                n;
                            for (n = xml.firstChild; n; n = n.nextSibling) {
                                tt = n.nodeType;
                                if (tt == 1) {
                                    children++
                                } else {
                                    if (tt == 3) {
                                        text++
                                    } else {
                                        if (tt == 4) {
                                            cdata++
                                        }
                                    }
                                }
                            }
                            if (children) {
                                if (text < 2 && cdata < 2) {
                                    for (n = xml.firstChild; n; n = n.nextSibling) {
                                        if (n.nodeType == 3) {
                                            o["#text"] = _es(n.nodeValue)
                                        } else {
                                            if (n.nodeType == 4) {
                                                o["#cdata"] = _es(n.nodeValue)
                                            } else {
                                                if (o[tt = n.nodeName]) {
                                                    if (o[tt] instanceof Array) {
                                                        o[tt][o[tt].length] = _f(n)
                                                    } else {
                                                        o[tt] = [o[tt], _f(n)]
                                                    }
                                                } else {
                                                    o[tt] = _f(n)
                                                }
                                            }
                                        }
                                    }
                                } else {
                                    if (!t.length) {
                                        o = _xml(xml)
                                    } else {
                                        o["#text"] = _xml(xml)
                                    }
                                }
                            } else {
                                if (text) {
                                    if (!t.length) {
                                        o = _xml(xml)
                                    } else {
                                        o["#text"] = _xml(xml)
                                    }
                                } else {
                                    if (cdata) {
                                        if (cdata > 1) {
                                            o = _xml(xml)
                                        } else {
                                            for (n = xml.firstChild; n; n = n.nextSibling) {
                                                o["#cdata"] = _es(n.nodeValue)
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                    return o
                };
            o[xmlObj.nodeName] = _f(_clear(xmlObj));
            return o
        },
        parseXML: function (xmlText) {
            var dom = null;
            if (typeof DOMParser == "undefined") {
                try {
                    dom = new ActiveXObject("Microsoft.XMLDOM");
                    dom.async = false;
                    dom.loadXML(xmlText || "")
                } catch (e) {
                    dom = null
                }
            } else {
                try {
                    var p = new DOMParser();
                    dom = p.parseFromString(xmlText || "", "text/xml")
                } catch (e) {
                    dom = null
                } finally {
                    p = null
                }
            }
            return dom
        }
    }
});
Class("xui.XMLRPC", null, {
    Static: {
        wrapRequest: function (methodName, params) {
            if (typeof methodName == "object") {
                params = methodName.params;
                methodName = methodName.methodName
            }
            if (!methodName) {
                return null
            }
            if (params && !params instanceof Array) {
                return null
            }
            var ns = this,
                xml = ['<?xml version="1.0"?><methodCall><methodName>' + methodName + "</methodName>"];
            if (params) {
                xml.push("<params>");
                for (var i = 0, j = params.length; i < j; i++) {
                    xml.push("<param>" + ns._wrapParam(params[i]) + "</param>")
                }
                xml.push("</params>")
            }
            xml.push("</methodCall>");
            return xml.join("")
        },
        parseResponse: function (xmlObj) {
            if (!xmlObj || !xmlObj.documentElement) {
                return null
            }
            var doc = xmlObj.documentElement;
            if (doc.nodeName != "methodResponse") {
                return null
            }
            var ns = this,
                json = {},
                err, elem;
            elem = doc.getElementsByTagName("value")[0];
            if (elem.parentNode.nodeName == "param" && elem.parentNode.parentNode.nodeName == "params") {
                json.result = ns._parseElem(elem)
            } else {
                if (elem.parentNode.nodeName == "fault") {
                    err = ns._parseElem(elem);
                    json.error = {
                        code: err.faultCode,
                        message: err.faultString
                    }
                } else {
                    return null
                }
            }
            if (!json.result && !json.error) {
                return null
            }
            return json
        },
        _dateMatcher: /^(?:(\d\d\d\d)-(\d\d)(?:-(\d\d)(?:T(\d\d)(?::(\d\d)(?::(\d\d)(?:\.(\d+))?)?)?)?)?)$/,
        _parseElem: function (elem) {
            var ns = this,
                nodes = elem.childNodes,
                typeElem, dateElem, name, value, tmp;
            if (nodes.length == 1 && nodes.item(0).nodeType == 3) {
                return nodes.item(0).nodeValue
            }
            for (var i = 0, l = nodes.length; i < l; i++) {
                if (nodes.item(i).nodeType == 1) {
                    typeElem = nodes.item(i);
                    switch (typeElem.nodeName.toLowerCase()) {
                    case "i4":
                    case "int":
                        value = parseInt(typeElem.firstChild.nodeValue, 10);
                        return isNaN(value) ? null : value;
                    case "double":
                        value = parseFloat(typeElem.firstChild.nodeValue);
                        return isNaN(value) ? null : value;
                    case "boolean":
                        return Boolean(parseInt(typeElem.firstChild.nodeValue, 10) !== 0);
                    case "string":
                        return typeElem.firstChild ? typeElem.firstChild.nodeValue : "";
                    case "datetime.iso8601":
                        if (tmp = typeElem.firstChild.nodeValue.match(ns._dateMatcher)) {
                            value = new Date;
                            if (tmp[1]) {
                                value.setUTCFullYear(parseInt(tmp[1], 10))
                            }
                            if (tmp[2]) {
                                value.setUTCMonth(parseInt(tmp[2] - 1, 10))
                            }
                            if (tmp[3]) {
                                value.setUTCDate(parseInt(tmp[3], 10))
                            }
                            if (tmp[4]) {
                                value.setUTCHours(parseInt(tmp[4], 10))
                            }
                            if (tmp[5]) {
                                value.setUTCMinutes(parseInt(tmp[5], 10))
                            }
                            if (tmp[6]) {
                                value.setUTCSeconds(parseInt(tmp[6], 10))
                            }
                            if (tmp[7]) {
                                value.setUTCMilliseconds(parseInt(tmp[7], 10))
                            }
                            return value
                        }
                        return null;
                    case "base64":
                        return null;
                    case "nil":
                        return null;
                    case "struct":
                        value = {};
                        for (var mElem, j = 0; mElem = typeElem.childNodes.item(j); j++) {
                            if (mElem.nodeType == 1 && mElem.nodeName == "member") {
                                name = "";
                                elem = null;
                                for (var child, k = 0; child = mElem.childNodes.item(k); k++) {
                                    if (child.nodeType == 1) {
                                        if (child.nodeName == "name") {
                                            name = child.firstChild.nodeValue
                                        } else {
                                            if (child.nodeName == "value") {
                                                elem = child
                                            }
                                        }
                                    }
                                }
                                if (name && elem) {
                                    value[name] = ns._parseElem(elem)
                                }
                            }
                        }
                        return value;
                    case "array":
                        value = [];
                        dateElem = typeElem.firstChild;
                        while (dateElem && (dateElem.nodeType != 1 || dateElem.nodeName != "data")) {
                            dateElem = dateElem.nextSibling
                        }
                        if (!dateElem) {
                            return null
                        }
                        elem = dateElem.firstChild;
                        while (elem) {
                            if (elem.nodeType == 1) {
                                value.push(elem.nodeName == "value" ? ns._parseElem(elem) : null)
                            }
                            elem = elem.nextSibling
                        }
                        return value;
                    default:
                        return null
                    }
                }
            }
            return null
        },
        _map: {
            "<": "&lt;",
            ">": "&gt;",
            "&": "&amp;",
            '"': "&quot;",
            "'": "&apos;"
        },
        _date2utc: function (d) {
            var ns = this,
                r = this._zeroPad;
            return d.getUTCFullYear() + "-" + r(d.getUTCMonth() + 1) + "-" + r(d.getUTCDate()) + "T" + r(d.getUTCHours()) + ":" + r(d.getUTCMinutes()) + ":" + r(d.getUTCSeconds()) + "." + r(d.getUTCMilliseconds(), 3)
        },
        _zeroPad: function (v, w) {
            if (!w) {
                w = 2
            }
            v = ((!v && v !== 0) ? "" : ("" + v));
            while (v.length < w) {
                v = "0" + v
            }
            return v
        },
        _wrapParam: function (value) {
            var ns = this,
                map = ns._map,
                xml = ["<value>"],
                sign;
            switch (typeof value) {
            case "number":
                xml.push(!isFinite(value) ? "<nil/>" : parseInt(value, 10) === Math.ceil(value) ? ("<int>" + value + "</int>") : ("<double>" + value + "</double>"));
                break;
            case "boolean":
                xml.push("<boolean>" + (value ? "1" : "0") + "</boolean>");
                break;
            case "string":
                xml.push("<string>" + value.replace(/[<>&"']/g, function (a) {
                    return map[a]
                }) + "</string>");
                break;
            case "undefined":
                xml.push("<nil/>");
            case "function":
                xml.push("<string>" + ("" + value).replace(/[<>&"']/g, function (a) {
                    return map[a]
                }) + "</string>");
            case "object":
                sign = Object.prototype.toString.call(value);
                if (value === null) {
                    xml.push("<nil/>")
                } else {
                    if (sign === "[object Array]") {
                        xml.push("<array><data>");
                        for (var i = 0, j = value.length; i < j; i++) {
                            xml.push(ns._wrapParam(value[i]))
                        }
                        xml.push("</data></array>")
                    } else {
                        if (sign === "[object Date]" && isFinite(+value)) {
                            xml.push("<dateTime.iso8601>" + ns._date2utc(value) + "</dateTime.iso8601>")
                        } else {
                            xml.push("<struct>");
                            for (var key in value) {
                                if (value.hasOwnProperty(key)) {
                                    xml.push("<member><name>" + key + "</name>" + ns._wrapParam(value[key]) + "</member>")
                                }
                            }
                            xml.push("</struct>")
                        }
                    }
                }
                break
            }
            xml.push("</value>");
            return xml.join("")
        }
    }
});
Class("xui.SOAP", null, {
    Static: {
        RESULT_NODE_NAME: "return",
        getNameSpace: function (wsdl) {
            var ns = wsdl.documentElement.attributes.targetNamespace;
            return ns === undefined ? wsdl.documentElement.attributes.getNamedItem("targetNamespace").nodeValue : ns.value
        },
        getWsdl: function (queryURL, onFail) {
            var rst = false;
            xui.Ajax(queryURL + "?wsdl", null, function (rspData) {
                rst = rspData
            }, function (rspData) {
                _.tryF(onFail, [rspData], this)
            }, null, {
                method: "GET",
                rspType: "xml",
                asy: false
            }).start();
            return rst
        },
        wrapRequest: function (methodName, params, wsdl) {
            if (typeof methodName == "object") {
                wsdl = params;
                params = methodName.params;
                methodName = methodName.methodName
            }
            var ns = this,
                namespace = ns.getNameSpace(wsdl);
            return '<soap:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/"><soap:Body><' + methodName + ' xmlns="' + namespace + '">' + ns._wrapParams(params) + "</" + methodName + "></soap:Body></soap:Envelope>"
        },
        parseResponse: function (xmlObj, methodName, wsdl) {
            if (typeof methodName == "object") {
                methodName = methodName.methodName
            }
            var ns = this,
                hash = {},
                nd = xmlObj.getElementsByTagName(methodName + "Result");
            if (!nd.length) {
                nd = xmlObj.getElementsByTagName(ns.RESULT_NODE_NAME)
            }
            if (!nd.length) {
                hash.fault = {
                    faultcode: xmlObj.getElementsByTagName("faultcode")[0].childNodes[0].nodeValue,
                    faultstring: xmlObj.getElementsByTagName("faultstring")[0].childNodes[0].nodeValue
                }
            } else {
                hash.result = ns._rsp2Obj(nd[0], wsdl)
            }
            return hash
        },
        _rsp2Obj: function (xmlNode, wsdl) {
            var ns = this,
                types = ns._getTypesFromWsdl(wsdl);
            return ns._node2obj(xmlNode, types)
        },
        _getTypesFromWsdl: function (wsdl) {
            var types = [],
                ell, useNamedItem;
            ell = wsdl.getElementsByTagName("s:element");
            if (ell.length) {
                useNamedItem = true
            } else {
                ell = wsdl.getElementsByTagName("element");
                useNamedItem = false
            }
            for (var i = 0, l = ell.length; i < l; i++) {
                if (useNamedItem) {
                    if (ell[i].attributes.getNamedItem("name") != null && ell[i].attributes.getNamedItem("type") != null) {
                        types[ell[i].attributes.getNamedItem("name").nodeValue] = ell[i].attributes.getNamedItem("type").nodeValue
                    }
                } else {
                    if (ell[i].attributes.name != null && ell[i].attributes.type != null) {
                        types[ell[i].attributes.name.value] = ell[i].attributes.type.value
                    }
                }
            }
            return types
        },
        _getTypeFromWsdl: function (elems, types) {
            return types[elems] == undefined ? "" : types[elems]
        },
        _node2obj: function (xmlNode, types) {
            if (xmlNode == null) {
                return null
            }
            var ns = this,
                value, tmp;
            if (xmlNode.nodeType == 3 || xmlNode.nodeType == 4) {
                value = xmlNode.nodeValue;
                switch (ns._getTypeFromWsdl(xmlNode.parentNode.nodeName, types).toLowerCase()) {
                case "s:boolean":
                    return value + "" == "true";
                case "s:int":
                case "s:long":
                    return value === null ? 0 : parseInt(value + "", 10);
                case "s:double":
                    return value === null ? 0 : parseFloat(value + "");
                case "s:datetime":
                    if (value == null) {
                        return null
                    } else {
                        if (tmp = value.match(ns._dateMatcher)) {
                            var d = new Date;
                            if (tmp[1]) {
                                d.setUTCFullYear(parseInt(tmp[1], 10))
                            }
                            if (tmp[2]) {
                                d.setUTCMonth(parseInt(tmp[2] - 1, 10))
                            }
                            if (tmp[3]) {
                                d.setUTCDate(parseInt(tmp[3], 10))
                            }
                            if (tmp[4]) {
                                d.setUTCHours(parseInt(tmp[4], 10))
                            }
                            if (tmp[5]) {
                                d.setUTCMinutes(parseInt(tmp[5], 10))
                            }
                            if (tmp[6]) {
                                d.setUTCSeconds(parseInt(tmp[6], 10))
                            }
                            if (tmp[7]) {
                                d.setUTCMilliseconds(parseInt(tmp[7], 10))
                            }
                            return d
                        }
                        return null
                    }
                default:
                    return value === null ? "" : (value + "")
                }
            } else {
                if (xmlNode.childNodes.length == 1 && (xmlNode.childNodes[0].nodeType == 3 || xmlNode.childNodes[0].nodeType == 4)) {
                    return ns._node2obj(xmlNode.childNodes[0], types)
                } else {
                    if (ns._getTypeFromWsdl(xmlNode.nodeName, types).toLowerCase().indexOf("arrayof") == -1) {
                        var obj = xmlNode.hasChildNodes() ? {} : null;
                        for (var i = 0, l = xmlNode.childNodes.length; i < l; i++) {
                            obj[xmlNode.childNodes[i].nodeName] = ns._node2obj(xmlNode.childNodes[i], types)
                        }
                        return obj
                    } else {
                        var arr = [];
                        for (var i = 0, l = xmlNode.childNodes.length; i < l; i++) {
                            arr.push(ns._node2obj(xmlNode.childNodes[i], types))
                        }
                        return arr
                    }
                }
            }
            return null
        },
        _wrapParams: function (params) {
            var ns = this,
                arr = [];
            for (var p in params) {
                switch (typeof (params[p])) {
                case "string":
                case "number":
                case "boolean":
                case "object":
                    arr.push("<" + p + ">" + ns._wrapParam(params[p]) + "</" + p + ">");
                    break;
                default:
                    break
                }
            }
            return arr.join("")
        },
        _map: {
            "<": "&lt;",
            ">": "&gt;",
            "&": "&amp;",
            '"': "&quot;",
            "'": "&apos;"
        },
        _wrapParam: function (param) {
            var ns = this,
                s = "",
                map = ns._map,
                sign, sign2, type, value;
            switch (typeof (param)) {
            case "string":
                s += param.replace(/[<>&"']/g, function (a) {
                    return map[a]
                });
                break;
            case "number":
            case "boolean":
                s += param + "";
                break;
            case "object":
                sign = Object.prototype.toString.call(param);
                if (sign === "[object Date]" && isFinite(+param)) {
                    s += ns._date2utc(param)
                } else {
                    if (sign === "[object Array]") {
                        for (var p in param) {
                            value = param[p];
                            switch (typeof value) {
                            case "number":
                                type = parseInt(value, 10) === Math.ceil(value) ? "int" : "double";
                                break;
                            case "boolean":
                                type = "bool";
                                break;
                            case "string":
                                type = "string";
                                break;
                            case "object":
                                sign2 = Object.prototype.toString.call(value);
                                if (sign2 === "[object Array]") {
                                    type = "Array"
                                } else {
                                    if (sign2 === "[object Date]" && isFinite(+value)) {
                                        type = "DateTime"
                                    } else {
                                        type = "object"
                                    }
                                }
                                break
                            }
                            s += "<" + type + ">" + ns._wrapParam(param[p]) + "</" + type + ">"
                        }
                    } else {
                        for (var p in param) {
                            if (param.hasOwnProperty(p)) {
                                s += "<" + p + ">" + ns._wrapParam(param[p]) + "</" + p + ">"
                            }
                        }
                    }
                }
                break
            }
            return s
        },
        _date2utc: function (d) {
            var ns = this,
                r = this._zeroPad;
            return d.getUTCFullYear() + "-" + r(d.getUTCMonth() + 1) + "-" + r(d.getUTCDate()) + "T" + r(d.getUTCHours()) + ":" + r(d.getUTCMinutes()) + ":" + r(d.getUTCSeconds()) + "." + r(d.getUTCMilliseconds(), 3)
        },
        _zeroPad: function (v, w) {
            if (!w) {
                w = 2
            }
            v = ((!v && v !== 0) ? "" : ("" + v));
            while (v.length < w) {
                v = "0" + v
            }
            return v
        }
    }
});
Class("xui.DragDrop", null, {
    Static: {
        _eh: "_dd",
        _id: "xui.dd:proxy:",
        _idi: "xui.dd:td:",
        _type: {
            blank: 1,
            move: 1,
            shape: 1,
            deep_copy: 1,
            copy: 1,
            icon: 1,
            none: 1
        },
        _Icons: {
            none: "0 0",
            move: "0 -16px",
            link: "0 -32px",
            add: "0 -48px"
        },
        _profile: {},
        _left: function (value) {
            with(this._profile) {
                if (magneticDistance > 0 && xMagneticLines.length) {
                    var l = xMagneticLines.length;
                    while (l--) {
                        if (Math.abs(value - xMagneticLines[l]) <= magneticDistance) {
                            return xMagneticLines[l]
                        }
                    }
                }
                if (widthIncrement > 1) {
                    return Math.floor(value / widthIncrement) * widthIncrement
                }
                return value
            }
        },
        _top: function (value) {
            with(this._profile) {
                if (magneticDistance > 0 && yMagneticLines.length) {
                    var l = yMagneticLines.length;
                    while (l--) {
                        if (Math.abs(value - yMagneticLines[l]) <= magneticDistance) {
                            return yMagneticLines[l]
                        }
                    }
                }
                if (heightIncrement > 1) {
                    return Math.floor(value / heightIncrement) * heightIncrement
                }
                return value
            }
        },
        _ini: function (o) {
            var d = this,
                p = d._profile,
                _t = xui.win;
            d._box = {
                width: _t.width() + _t.scrollLeft(),
                height: _t.height() + _t.scrollTop()
            };
            p.ox = p.x;
            p.oy = p.y;
            if (d._proxy = o) {
                d._proxystyle = o.get(0).style;
                d._profile.curPos = d._cssPos = d._proxy.cssPos();
                d._cssPos_x = p.x - d._cssPos.left;
                d._cssPos_y = p.y - d._cssPos.top;
                p.restrictedLeft = p.x - (p.maxLeftOffset || 0);
                p.restrictedRight = p.x + (p.maxRightOffset || 0);
                p.restrictedTop = p.y - (p.maxTopOffset || 0);
                p.restrictedBottom = p.y + (p.maxBottomOffset || 0);
                d._proxyLeft = d._pre.left = d._cssPos.left;
                d._proxyTop = d._pre.top = d._cssPos.top;
                if ("move" !== p.dragType) {
                    d._proxy.css("zIndex", xui.Dom.TOP_ZINDEX * 10);
                    xui.setNodeData(d._proxy.get(0), "zIndexIgnore", 1)
                }
            }
        },
        _reset: function () {
            var d = this,
                NULL = null,
                FALSE = false;
            _.tryF(d.$reset);
            d.setDropFace();
            d._resetProxy();
            d.$proxySize = 50;
            d.$mousemove = d.$mouseup = d.$onselectstart = d.$ondragstart = "*";
            d._cursor = "";
            d._pre = {};
            d._proxyLeft = d._proxyTop = d._cssPos_x = d._cssPos_y = 0;
            d._stop = FALSE;
            if (d._onDrag && d._onDrag.tasks) {
                d._onDrag.tasks.length = 0;
                delete d._onDrag.tasks
            }
            if (d._onDragover && d._onDragover.tasks) {
                d._onDragover.tasks.length = 0;
                delete d._onDragover.tasks
            }
            if (d._c_droppable) {
                d._c_droppable.length = 0
            }
            d._c_droppable = d._c_dropactive = d._cssPos = d._box = d._dropElement = d._source = d._proxy = d._proxystyle = d._onDrag = d._onDragover = NULL;
            d._profile = {
                $id: _() + "",
                dragType: "shape",
                dragCursor: "move",
                targetReposition: true,
                dragIcon: xui.ini.path + "ondrag.gif",
                magneticDistance: 0,
                xMagneticLines: [],
                yMagneticLines: [],
                widthIncrement: 0,
                heightIncrement: 0,
                dragDefer: 0,
                horizontalOnly: FALSE,
                verticalOnly: FALSE,
                maxBottomOffset: NULL,
                maxLeftOffset: NULL,
                maxRightOffset: NULL,
                maxTopOffset: NULL,
                targetNode: NULL,
                targetCSS: NULL,
                dragKey: NULL,
                dragData: NULL,
                targetLeft: NULL,
                targetTop: NULL,
                targetWidth: NULL,
                targetHeight: NULL,
                targetOffsetParent: NULL,
                targetCallback: NULL,
                tagVar: NULL,
                shadowFrom: NULL,
                proxyNode: NULL,
                x: 0,
                y: 0,
                ox: 0,
                oy: 0,
                curPos: {},
                offset: {},
                isWorking: FALSE,
                restrictedLeft: NULL,
                restrictedRight: NULL,
                restrictedTop: NULL,
                restrictedBottom: NULL,
                dropElement: NULL
            };
            return d
        },
        abort: function () {
            this._stop = true
        },
        _end: function () {
            var d = this,
                doc = document,
                body = doc.body,
                md = "onmousedown",
                mm = "onmousemove",
                mu = "onmouseup",
                md1, mm2, mu2;
            if (xui.browser.isTouch) {
                md2 = "ontouchstart";
                mm2 = "ontouchmove";
                mu2 = "ontouchend"
            }
            if (d._proxy) {
                d._unpack()
            }
            if (d.$onselectstart != "*") {
                body.onselectstart = d.$onselectstart
            }
            if (d.$ondragstart != "*") {
                doc.ondragstart = d.$ondragstart
            }
            if (d.$mousemove != "*") {
                doc[mm] = d.$mousemove
            }
            if (d.$mouseup != "*") {
                doc[mu] = d.$mouseup
            }
            if (xui.browser.isTouch) {
                if (d.$touchmove != "*") {
                    doc[mm2] = d.$touchmove
                }
                if (d.$touchend != "*") {
                    doc[mu2] = d.$touchend
                }
            }
            return d
        },
        startDrag: function (e, targetNode, profile, dragKey, dragData) {
            var d = this,
                t;
            if (d._profile.isWorking) {
                return false
            }
            d._end()._reset();
            d._profile.isWorking = true;
            profile = _.isHash(profile) ? profile : {};
            e = e || window.event;
            if (xui.Event.getBtn(e) !== "left") {
                return true
            }
            d._source = profile.targetNode = xui(targetNode);
            d._cursor = d._source.css("cursor");
            if ((t = profile.targetNode.get(0)) && !t.id) {
                t.id = xui.Dom._pickDomId();
                t = null
            }
            d._defer = profile.dragDefer = _.isNumb(profile.dragDefer) ? profile.dragDefer : 0;
            if (true === profile.dragCursor) {
                profile.dragCursor = d._cursor
            }
            if (typeof profile.dragIcon == "string") {
                profile.dragType = "icon"
            }
            var doc = document,
                body = doc.body,
                _pos = xui.Event.getPos(e),
                md = "onmousedown",
                mm = "onmousemove",
                mu = "onmouseup",
                md1, mm2, mu2;
            if (xui.browser.isTouch) {
                md2 = "ontouchstart";
                mm2 = "ontouchmove";
                mu2 = "ontouchend"
            }
            profile.x = _pos.left;
            profile.y = _pos.top;
            profile.dragKey = dragKey || profile.dragKey || null;
            profile.dragData = dragData || profile.dragData || null;
            var fromN = xui.Event.getSrc(e);
            d._start = function (e) {
                var p = d._profile;
                _.merge(p, profile, "with");
                d._source.beforeDragbegin();
                if (d._stop) {
                    d._end()._reset();
                    return false
                }
                if (xui.Event && (t = d._source.get(0))) {
                    xui.Event._preDroppable = t.id;
                    t = null
                }
                if (p.dragType == "icon") {
                    p.targetReposition = false
                }
                d._ini(p.dragType == "none" ? null : d._pack(_pos, p.targetNode));
                if (profile.x >= d._box.width || profile.y >= d._box.height) {
                    d._end()._reset();
                    return true
                }
                d._source.onDragbegin();
                if (p.dragDefer < 1) {
                    d.$mousemove = doc[mm];
                    d.$mouseup = doc[mu];
                    if (xui.browser.isTouch) {
                        d.$touchmove = doc[mm2];
                        d.$touchend = doc[mu2]
                    }
                }
                if (xui.browser.ie) {
                    setTimeout(function () {
                        fromN.releaseCapture()
                    })
                }
                doc[mm] = d.$onDrag;
                doc[mu] = d.$onDrop;
                if (xui.browser.isTouch) {
                    doc[mm2] = d.$onDrag;
                    doc[mu2] = d.$onDrop
                }
                d._source.afterDragbegin();
                if (p.dragDefer > 0) {
                    d.$onDrag.call(d, e)
                }
                if (xui.browser.isTouch && xui.Event.__realtouch) {
                    d._c_droppable = [];
                    var cdata = xui.$cache.droppable[p.dragKey],
                        purge = [];
                    _.arr.each(cdata, function (i) {
                        if (!xui.use(i).get(0)) {
                            purge.push(i);
                            return
                        }
                        var ni = xui.use(i),
                            h = ni.offsetHeight(),
                            w = ni.offsetWidth(),
                            v = ni.css("visibility"),
                            hash;
                        if (w && h && v != "hidden") {
                            hash = ni.offset();
                            hash.width = w;
                            hash.height = h;
                            hash.id = i;
                            d._c_droppable.unshift(hash)
                        }
                    });
                    if (purge.length) {
                        _.arr.each(purge, function (key) {
                            _.arr.removeValue(cdata, key)
                        })
                    }
                }
            };
            if (xui.browser.ie) {
                d.$ondragstart = doc.ondragstart;
                d.$onselectstart = body.onselectstart;
                doc.ondragstart = body.onselectstart = null;
                if (doc.selection && doc.selection.empty) {
                    doc.selection.empty()
                }
            }
            xui.Event.stopBubble(e);
            if (profile.targetNode.get(0) !== doc) {
                xui(doc).onMousedown(true, xui.Event.getEventPara(e, _pos))
            }
            if (profile.dragDefer < 1) {
                _.tryF(d._start, [e], d);
                return false
            } else {
                d.$mouseup = doc[mu];
                doc[mu] = function (e) {
                    xui.DragDrop._end()._reset();
                    return _.tryF(document.onmouseup, [e], null, true)
                };
                if (xui.browser.isTouch) {
                    d.$touchend = doc[mu2];
                    doc[mu2] = doc[mu]
                }
                var pbak = {};
                d.$mousemove = doc[mm];
                doc[mm] = function (e) {
                    var p = xui.Event.getPos(e);
                    if (p.left === pbak.left && p.top === pbak.top) {
                        return
                    }
                    pbak = p;
                    if (--d._defer <= 0) {
                        xui.DragDrop._start(e)
                    }
                    return false
                };
                if (xui.browser.isTouch) {
                    d.$touchmove = doc[mm2];
                    doc[mm2] = doc[mm]
                }
            }
        },
        $onDrag: function (e) {
            var d = xui.DragDrop,
                p = d._profile;
            e = e || window.event;
            if (!p.isWorking || d._stop) {
                d.$onDrop(e);
                return true
            }
            var _pos = xui.Event.getPos(e);
            p.x = _pos.left;
            p.y = _pos.top;
            if (!p.isWorking) {
                return false
            }
            if (d._proxy) {
                if (!p.verticalOnly) {
                    d._proxyLeft = Math.floor(d._left(((p.maxLeftOffset !== null && p.x <= p.restrictedLeft) ? p.restrictedLeft : (p.maxRightOffset !== null && p.x >= p.restrictedRight) ? p.restrictedRight : p.x) - d._cssPos_x));
                    if (d._proxyLeft - d._pre.left) {
                        d._proxystyle.left = d._proxyLeft + "px"
                    }
                    d._pre.left = d._proxyLeft;
                    p.curPos.left = d._proxyLeft + d.$proxySize
                }
                if (!p.horizontalOnly) {
                    d._proxyTop = Math.floor(d._top(((p.maxTopOffset !== null && p.y <= p.restrictedTop) ? p.restrictedTop : (p.maxBottomOffset !== null && p.y >= p.restrictedBottom) ? p.restrictedBottom : p.y) - d._cssPos_y));
                    if (d._proxyTop - d._pre.top) {
                        d._proxystyle.top = d._proxyTop + "px"
                    }
                    d._pre.top = d._proxyTop;
                    p.curPos.top = d._proxyTop + d.$proxySize
                }
            } else {
                p.curPos.left = p.x;
                p.curPos.top = p.y
            }
            if (d._onDrag != 1) {
                if (d._onDrag) {
                    d._onDrag(e, d._source._get(0))
                } else {
                    d._onDrag = 1;
                    d._source.onDrag(true, xui.Event.getEventPara(e, _pos))
                }
            }
            if (xui.browser.isTouch && xui.Event.__realtouch) {
                if (d._c_droppable) {
                    var i = 0,
                        o, e, l = d._c_droppable.length,
                        oactive = d._c_dropactive;
                    for (; i < l; i++) {
                        o = d._c_droppable[i];
                        if (p.x >= o.left && p.y >= o.top && p.x <= (o.left + o.width) && p.y <= (o.top + o.height)) {
                            if (oactive == o.id) {
                                console.log("in " + o.id)
                            } else {
                                e = document.createEvent("MouseEvent");
                                e.initMouseEvent("mouseover", true, true, window, 1, p.left, p.top, p.left, p.top, false, false, false, false, 0, null);
                                xui.use(o.id).get(0).dispatchEvent(e);
                                d._c_dropactive = o.id;
                                console.log("active " + o.id);
                                if (oactive) {
                                    e = document.createEvent("MouseEvent");
                                    e.initMouseEvent("mouseout", true, true, window, 1, p.left, p.top, p.left, p.top, false, false, false, false, 0, null);
                                    xui.use(oactive).get(0).dispatchEvent(e);
                                    console.log("deactive " + oactive)
                                }
                            }
                            break
                        } else {
                            if (oactive == o.id) {
                                e = document.createEvent("MouseEvent");
                                e.initMouseEvent("mouseout", true, true, window, 1, p.left, p.top, p.left, p.top, false, false, false, false, 0, null);
                                xui.use(oactive).get(0).dispatchEvent(e);
                                d._c_dropactive = null;
                                console.log("deactive " + oactive);
                                break
                            }
                        }
                    }
                }
            }
            return false
        },
        $onDrop: function (e) {
            var d = xui.DragDrop,
                p = d._profile,
                evt = xui.Event;
            e = e || window.event;
            d._end();
            if (p.isWorking) {
                d.setDropFace();
                var r = d._source.onDragstop(true, evt.getEventPara(e));
                if (d._dropElement) {
                    xui.use(d._dropElement).onDrop(true, evt.getEventPara(e))
                }
            }
            d._reset();
            evt.stopBubble(e);
            _.tryF(document.onmouseup, [e]);
            return !!r
        },
        setDropElement: function (id) {
            this._profile.dropElement = this._dropElement = id;
            return this
        },
        getProfile: function () {
            var d = this,
                p = d._profile;
            p.offset = d._proxy ? {
                x: d._proxyLeft - p.ox + d._cssPos_x,
                y: d._proxyTop - p.oy + d._cssPos_y
            } : {
                x: p.x - p.ox,
                y: p.y - p.oy
            };
            return p
        },
        setDropFace: function (target, dragIcon) {
            var d = this,
                s1 = '<div style="position:absolute;z-index:' + xui.Dom.TOP_ZINDEX + ";font-size:0;line-height:0;border-",
                s2 = ":dashed 1px #ff6600;",
                region = d._Region,
                rh = d._rh,
                bg = "backgroundColor";
            if (region && region.parent()) {
                region.remove(false)
            }
            if (d._R) {
                d._R.css(bg, d._RB);
                delete d._R;
                delete d._RB
            }
            if (target) {
                if (!region || !region.get(0)) {
                    region = d._Region = xui.create(s1 + "top" + s2 + 'left:0;top:0;width:100%;height:0;"></div>' + s1 + "right" + s2 + 'right:0;top:0;height:100%;width:0;"></div>' + s1 + "bottom" + s2 + 'bottom:0;left:0;width:100%;height:0;"></div>' + s1 + 'left:solid 2px #ff6600;width:0;left:0;top:0;height:100%;"></div>');
                    rh = d._rh = xui([region.get(1), region.get(3)])
                }
                target = xui(target);
                if (xui.browser.ie6) {
                    rh.height("100%")
                }
                if (target.css("display") == "block") {
                    xui.setNodeData(region.get(0), "zIndexIgnore", 1);
                    target.append(region);
                    if (xui.browser.ie6 && !rh.get(0).offsetHeight) {
                        rh.height(target.get(0).offsetHeight)
                    }
                } else {
                    d._RB = target.get(0).style[bg];
                    d._R = target;
                    target.css(bg, "#FA8072")
                }
                d.setDragIcon(dragIcon || "move")
            } else {
                d.setDragIcon("none")
            }
            return d
        },
        setDragIcon: function (key) {
            _.resetRun("setDropFace", null);
            var d = this,
                p = d._profile,
                i = p.proxyNode,
                ic = d._Icons;
            if (i && p.dragType == "icon") {
                i.first(4).css(typeof key == "object" ? key : {
                    backgroundPosition: (ic[key] || key)
                })
            }
            return d
        },
        _setProxy: function (child, pos) {
            var t, temp, d = this,
                p = d._profile,
                dom = xui.Dom;
            if (!dom.byId(d._id)) {
                xui("body").prepend(xui.create('<div id="' + d._id + '" style="left:0;top:0;border:0;font-size:0;line-height:0;padding:' + d.$proxySize + "px;position:absolute;background:url(" + xui.ini.img_bg + ') repeat;"><div style="font-size:0;line-height:0;" id="' + d._idi + '">' + (xui.browser.ie6 ? "&nbsp;" : "") + "</div></div>"))
            }
            t = xui(d._id);
            if (p.dragKey) {
                d.$proxySize = 0;
                t.css("padding", 0)
            } else {
                pos.left -= d.$proxySize;
                pos.top -= d.$proxySize;
                if (!p.targetOffsetParent) {
                    dom.setCover(true)
                }
            }
            if (temp = p.targetOffsetParent) {
                xui(temp).append(t)
            }
            if (child) {
                xui(d._idi).empty(false).append(child);
                p.proxyNode = child
            } else {
                p.proxyNode = xui(d._idi)
            }
            t.css({
                display: "",
                zIndex: dom.TOP_ZINDEX * 10,
                cursor: p.dragCursor
            }).offset(pos, temp);
            xui.setNodeData(t.get(0), "zIndexIgnore", 1);
            return t
        },
        _resetProxy: function () {
            var d = this,
                p = d._profile,
                dom = xui.Dom,
                id1 = d._id,
                id2 = d._idi;
            if (dom.byId(id1)) {
                var t, k, o = xui(id2),
                    t = xui(id1);
                if (xui.browser.ie6) {
                    o.html("&nbsp;", false)
                } else {
                    o.empty(false)
                }
                o.attr("style", "font-size:0;line-height:0;");
                xui("body").prepend(t.css({
                    zIndex: 0,
                    cursor: "",
                    display: "none",
                    padding: d.$proxySize + "px"
                }));
                p.proxyNode = d._proxystyle = null;
                dom.setCover(false)
            }
        },
        _pack: function (mousePos, targetNode) {
            var target, pos = {},
                size = {},
                d = this,
                p = d._profile,
                t;
            if (p.targetLeft === null || null === p.targetTop) {
                t = targetNode.offset(null, p.targetOffsetParent)
            }
            pos.left = null !== p.targetLeft ? p.targetLeft : t.left;
            pos.top = null !== p.targetTop ? p.targetTop : t.top;
            switch (p.dragType) {
            case "deep_copy":
            case "copy":
                var t;
                size.width = _.isNumb(p.targetWidth) ? p.targetWidth : (targetNode.cssSize().width || 0);
                size.height = _.isNumb(p.targetHeight) ? p.targetHeight : (targetNode.cssSize().height || 0);
                var n = targetNode.clone(p.dragType == "deep_copy").css({
                    position: "relative",
                    margin: "0",
                    left: "0",
                    top: "0",
                    right: "",
                    bottom: "",
                    cursor: p.dragCursor,
                    cssFloat: "none"
                }).cssSize(size).id("", true).css("opacity", 0.8);
                if (p.targetCallback) {
                    p.targetCallback(n)
                }
                n.query("*").id("", true);
                if (p.targetCSS) {
                    n.css(p.targetCSS)
                }
                target = d._setProxy(n, pos);
                break;
            case "shape":
                size.width = null !== p.targetWidth ? p.targetWidth : targetNode.offsetWidth();
                size.height = null !== p.targetHeight ? p.targetHeight : targetNode.offsetHeight();
                size.width -= 2;
                size.height -= 2;
                target = d._setProxy(xui.create("div").css({
                    border: "dashed 1px",
                    fontSize: "0",
                    lineHeight: "0"
                }).cssSize(size), pos);
                break;
            case "blank":
                target = d._setProxy(null, pos);
                break;
            case "icon":
                pos.left = _.isNumb(p.targetLeft) ? p.targetLeft : (mousePos.left - xui.win.scrollLeft() + 16);
                pos.top = _.isNumb(p.targetTop) ? p.targetTop : (mousePos.top - xui.win.scrollTop() + 16);
                t = '<table border="0" class="xui-node xui-node-table"><tr><td valign="top"><span class="xui-node xui-node-span" style="background:url(' + p.dragIcon + ") no-repeat left top;width:" + (_.isNumb(p.targetWidth) ? p.targetWidth : 16) + "px;height:" + (_.isNumb(p.targetHeight) ? p.targetHeight : 16) + 'px;" ></span></td><td id="xui:dd:shadow" ' + (p.shadowFrom ? 'style="border:solid 1px #e5e5e5;background:#fff;font-size:12px;line-height:14px;"' : "") + ">" + (p.shadowFrom ? xui(p.shadowFrom).clone(true).css({
                    left: "auto",
                    top: "auto",
                    position: "relative"
                }).outerHTML().replace(/\s*id\=[^\s\>]*/g, "") : "") + "</td></tr></table>";
                target = d._setProxy(xui.create(t).css("opacity", 0.8), pos);
                break;
            case "move":
                d.$proxySize = 0;
                target = targetNode;
                if (target.css("position") != "absolute") {
                    target.css("position", "absolute").offset(pos)
                }
                target.css("cursor", p.dragCursor)
            }
            return target
        },
        _unpack: function () {
            var d = this,
                p = d._profile,
                t, f;
            if (p.targetReposition && ("move" != p.dragType)) {
                if ((t = xui(d._source))) {
                    if (!t.isEmpty()) {
                        if (t.css("position") != "absolute") {
                            t.css("position", "absolute").cssPos(t.offset(null, t.get(0).offsetParent))
                        }
                        if (xui.browser.ie) {
                            t.cssRegion({
                                right: "",
                                bottom: ""
                            })
                        }
                        t.offset(p.curPos, p.targetOffsetParent || document.body)
                    }
                }
            }
            if ("move" == p.dragType) {
                d._source.css("cursor", d._cursor)
            }
        },
        _unRegister: function (node, key) {
            var eh = this._eh;
            xui([node]).$removeEvent("beforeMouseover", eh).$removeEvent("beforeMouseout", eh).$removeEvent("beforeMousemove", eh);
            var o = xui.getNodeData(node.$xid, ["_dropKeys"]),
                c = xui.$cache.droppable;
            if (o) {
                for (var i in o) {
                    if (c[i]) {
                        _.arr.removeValue(c[i], node.$xid)
                    }
                }
            }
            xui.setNodeData(node.$xid, ["_dropKeys"])
        },
        _register: function (node, key) {
            var eh = this._eh;
            xui(node).beforeMouseover(function (p, e, i) {
                var t = xui.DragDrop,
                    p = t._profile;
                if (p.dragKey && xui.getNodeData(i, ["_dropKeys", p.dragKey])) {
                    t.setDropElement(i);
                    t._onDragover = null;
                    xui.use(i).onDragenter(true);
                    if (t._dropElement) {
                        _.resetRun("setDropFace", t.setDropFace, 0, [i], t)
                    }
                }
            }, eh).beforeMouseout(function (p, e, i) {
                var t = xui.DragDrop,
                    p = t._profile;
                if (p.dragKey && xui.getNodeData(i, ["_dropKeys", p.dragKey])) {
                    xui.use(i).onDragleave(true);
                    if (t._dropElement == i) {
                        t.setDropElement(t._onDragover = null);
                        _.resetRun("setDropFace", t.setDropFace, 0, [null], t)
                    }
                }
            }, eh).beforeMousemove(function (a, e, i) {
                var t = xui.DragDrop,
                    h = t._onDragover,
                    p = t._profile;
                if (h == 1) {
                    return
                }
                if (t._dropElement == i && p.dragKey && xui.getNodeData(i, ["_dropKeys", p.dragKey])) {
                    if (h) {
                        h(e, i)
                    } else {
                        t._onDragover = 1;
                        xui.use(i).onDragover(true, xui.Event.getEventPara(e))
                    }
                }
            }, eh);
            var o = xui.getNodeData(node.$xid, ["_dropKeys"]),
                c = xui.$cache.droppable;
            if (o) {
                for (var i in o) {
                    if (c[i]) {
                        _.arr.removeValue(c[i], node.$xid)
                    }
                }
            }
            var h = {},
                a = key.split(/[^\w-]+/);
            for (var i = 0, l = a.length; i < l; i++) {
                h[a[i]] = 1;
                c[a[i]] = c[a[i]] || [];
                c[a[i]].push(node.$xid)
            }
            xui.setNodeData(node.$xid, ["_dropKeys"], h)
        }
    },
    After: function () {
        this._reset();
        _.each({
            startDrag: function (e, profile, dragKey, dragData) {
                xui.DragDrop.startDrag(e, this.get(0), profile, dragKey || "", dragData || null);
                return this
            },
            draggable: function (flag, profile, dragKey, dragData) {
                var self = this,
                    dd = xui.DragDrop;
                if (flag === undefined) {
                    flag = true
                } else {
                    if (typeof flag == "object") {
                        profile = flag;
                        flag = true
                    }
                }
                if ( !! flag) {
                    var f = function (p, e, src) {
                            if (xui.getId(xui.Event.getSrc(e)) != src) {
                                return true
                            }
                            xui.use(src).startDrag(e, profile, dragKey, dragData);
                            return false
                        };
                    self.$addEvent("onMousedown", f, dd._eh, -1);
                    if (xui.browser.isTouch) {
                        self.$addEvent("onTouchstart", f, dd._eh, -1)
                    }
                } else {
                    self.$removeEvent("onMousedown", dd._eh);
                    if (xui.browser.isTouch) {
                        self.$removeEvent("onTouchstart", dd._eh)
                    }
                }
                return self
            },
            droppable: function (flag, key) {
                if (flag === undefined) {
                    flag = true
                }
                key = key || "default";
                var d = xui.DragDrop;
                return this.each(function (o) {
                    if ( !! flag) {
                        d._register(o, key)
                    } else {
                        d._unRegister(o, key)
                    }
                })
            }
        }, function (o, i) {
            xui.Dom.plugIn(i, o)
        })
    }
});
Class("xui.History", null, {
    Static: {
        _fid: "xui:history",
        _type: (xui.browser.ie && (xui.browser.ver < 8)) ? "iframe" : ("onhashchange" in window) ? "event" : "timer",
        setCallback: function (callback) {
            var self = this,
                hash = location.hash;
            if (!hash) {
                hash = ""
            }
            self._callback = callback;
            if (callback) {
                self._lastFI = hash;
                switch (self._type) {
                case "event":
                    window.onhashchange = self._checker;
                    break;
                case "iframe":
                    document.body.appendChild(document.createElement('<iframe id="' + self._fid + '" src="about:blank" style="display: none;"></iframe>'));
                    var doc = document.getElementById(self._fid).contentWindow.document;
                    doc.open("javascript:'<html></html>'");
                    doc.write("<html><head><script type=\"text/javascript\">parent.xui.History._checker('');<\/script></head><body></body></html>");
                    doc.close();
                case "timer":
                    if (self._itimer) {
                        clearInterval(self._itimer)
                    }
                    self._itimer = setInterval(self._checker, 100);
                    break
                }
                self._callback(decodeURIComponent(hash.replace(/^#!/, "")))
            } else {
                if (self._itimer) {
                    clearInterval(self._itimer)
                }
            }
            return self
        },
        _checker: function (hash) {
            var self = xui.History;
            if (typeof self._callback != "function") {
                if (self._itimer) {
                    clearInterval(self._itimer)
                }
                return
            }
            switch (self._type) {
            case "iframe":
                if (_.isSet(hash)) {
                    location.hash = hash
                }
            case "event":
            case "timer":
                if (decodeURIComponent(location.hash) != decodeURIComponent(self._lastFI)) {
                    self._lastFI = location.hash;
                    self._callback(decodeURIComponent(location.hash.replace(/^#!/, "")))
                }
                break
            }
        },
        getFI: function () {
            return this._lastFI
        },
        setFI: function (fi, triggerCallback) {
            var self = this;
            if (!self._callback) {
                return
            }
            if (fi) {
                fi = "#!" + encodeURIComponent(("" + fi).replace(/^#!/, ""))
            }
            if (self._lastFI == fi) {
                return false
            }
            switch (self._type) {
            case "iframe":
                var doc = document.getElementById(self._fid).contentWindow.document;
                doc.open("javascript:'<html></html>'");
                doc.write('<html><head><script type="text/javascript">parent.xui.History._checker(\'#!' + encodeURIComponent(fi.replace(/^#!/, "")) + "');<\/script></head><body></body></html>");
                doc.close();
                break;
            case "event":
            case "timer":
                location.hash = self._lastFI = fi;
                break
            }
            if (triggerCallback !== false) {
                _.tryF(self._callback, [decodeURIComponent(fi.replace(/^#!/, ""))])
            }
        }
    }
});
Class("xui.ComFactory", null, {
    Static: {
        _pro: {},
        _cache: {},
        _domId: "xui:ComFactory:",
        getProfile: function (key) {
            return key ? this._pro[key] : this._pro
        },
        setProfile: function (key, value) {
            if (typeof key == "string") {
                this._pro[key] = value
            } else {
                this._pro = key
            }
            return this
        },
        destroyAll: function () {
            _.each(this._cache, function (o) {
                _.tryF(o.destroy, [], o)
            });
            this._cache = {}
        },
        broadcast: function (fun) {
            if (typeof fun == "function") {
                var i, c = this._cache;
                for (i in c) {
                    fun.call(c[i], i)
                }
            }
        },
        setCom: function (id, obj) {
            this._cache[id] = obj;
            if (obj) {
                obj.comRefId = id
            }
            return this
        },
        getComFromCache: function (id) {
            return this._cache[id] || null
        },
        getCom: function (id, onEnd, threadid, singleton, properties, events) {
            singleton = singleton !== false;
            var c = this._cache,
                p = this._pro,
                config, clsPath;
            if (singleton && c[id]) {
                _.tryF(onEnd, [threadid, c[id]], c[id]);
                return c[id]
            } else {
                if (!(config = p[id])) {
                    config = {
                        cls: id,
                        singleton: singleton,
                        properties: properties,
                        events: events
                    };
                    clsPath = id
                } else {
                    clsPath = config.cls || config
                }
                var self = arguments.callee,
                    me = this,
                    task = function (cls, config, threadid) {
                        var o = new cls();
                        if (config.properties) {
                            _.merge(o.properties, config.properties, "all")
                        }
                        if (config.events) {
                            _.merge(o.events, config.events, "all")
                        }
                        if (config.singleton !== false) {
                            xui.ComFactory.setCom(id, o)
                        }
                        var args = [function (com) {
                            var arr = com.getUIComponents().get(),
                                fun = function (arr, subcfg, firstlayer) {
                                    var self1 = arguments.callee;
                                    _.arr.each(arr, function (v, i) {
                                        if (v.key == "xui.UI.Tag") {
                                            var tag = v,
                                                cid = tag.properties.tagKey;
                                            if (cid && subcfg && subcfg[cid]) {
                                                self.apply(me, [subcfg[cid], function () {
                                                    com[cid] = this;
                                                    this.parent = com;
                                                    var ui = this.getUIComponents(),
                                                        root;
                                                    if (!(root = ui.get(0))) {
                                                        return
                                                    }
                                                    xui.UI.Tag.replace(tag, root, firstlayer ? com : null)
                                                },
                                                threadid])
                                            }
                                        }
                                        if (v.children) {
                                            var a = [];
                                            _.arr.each(v.children, function (o) {
                                                a[a.length] = o[0]
                                            });
                                            self1(a, subcfg)
                                        }
                                    })
                                };
                            fun(arr, config.children, 1)
                        }];
                        args.push(threadid || null);
                        if (onEnd) {
                            xui.Thread(threadid).insert({
                                task: onEnd,
                                args: [threadid, o],
                                scope: o
                            })
                        }
                        _.tryF(o[config.iniMethod || "create"], args, o)
                    };
                xui.Thread.observableRun(function (threadid) {
                    var f = function (a, b, threadid) {
                            var cls;
                            if (cls = xui.SC.get(clsPath)) {
                                xui.Thread(threadid).insert({
                                    task: task,
                                    args: [cls, config, threadid]
                                })
                            }
                        };
                    xui.SC(clsPath, function (path) {
                        if (path) {
                            f(0, 0, threadid)
                        } else {
                            throw new Error(clsPath + " doesnt exists!")
                        }
                    }, true, threadid)
                }, null, threadid)
            }
        },
        newCom: function (cls, onEnd, threadid, properties, events) {
            return this.getCom(cls, onEnd, threadid, false, properties, events)
        },
        storeCom: function (id) {
            var m, t, c = this._cache,
                domId = this._domId;
            if (t = c[id]) {
                if (!(m = xui.Dom.byId(domId))) {
                    xui("body").prepend(xui.create('<div id="' + domId + '" style="display:none;"></div>'))
                }
                m = xui(domId);
                t = t.getUIComponents();
                if (!t.isEmpty()) {
                    t.get(0).unlinkParent();
                    m.append(t)
                }
            }
        },
        prepareComs: function (arr) {
            var self = this,
                funs = [];
            _.arr.each(arr, function (i) {
                funs.push(function () {
                    self.getCom(i)
                })
            });
            xui.Thread(null, funs, 500).start();
            return this
        }
    }
});
(xui.Locale.en || (xui.Locale.en = {})).inline = {
    ok: "O K",
    cancel: "Cancel",
    set: "SET",
    today: "Today",
    now: "Now",
    yes: "Yes",
    no: "No",
    noFlash: "No Flash PlugIn!"
};
xui.Locale.en.date = {
    WEEKS: {
        "0": "Su",
        "1": "Mo",
        "2": "Tu",
        "3": "We",
        "4": "Th",
        "5": "Fr",
        "6": "Sa",
        "7": "WK"
    },
    VIEWS: {
        "10 ms": "10 millisecond",
        "100 ms": "100 milliseconds",
        "1 s": "1 second",
        "10 s": "10 seconds",
        "1 n": "1 minute",
        "5 n": "5 minutes",
        "10 n": "10 minutes",
        "30 n": "30 minutes",
        "1 h": "1 hour",
        "2 h": "2 hours",
        "6 h": "6 hours",
        "1 d": "1 day",
        "1 w": "1 week",
        "15 d": "15 days",
        "1 m": "1 month",
        "1 q": "1 quarter",
        "1 y": "1 year",
        "1 de": "10 years",
        "1 c": "1 century"
    },
    MONTHS: {
        "1": "Jan.",
        "2": "Feb.",
        "3": "Mar.",
        "4": "Apr.",
        "5": "May.",
        "6": "Jun.",
        "7": "Jul.",
        "8": "Aug.",
        "9": "Sep.",
        "10": "Oct.",
        "11": "Nov.",
        "12": "Dec."
    },
    MS: "ms",
    S: "s",
    N: "n",
    H: "h",
    D: "d",
    W: "w",
    M: "m",
    Q: "q",
    Y: "y",
    DE: "de",
    C: "c",
    HN: function (n, a, b) {
        return (a.length == 1 ? "0" : "") + a + ":" + (b.length == 1 ? "0" : "") + b
    },
    DHN: function (n, a, b, c) {
        return a + "th " + (b.length == 1 ? "0" : "") + b + ":" + (c.length == 1 ? "0" : "") + c
    },
    MDHN: function (n, a, b, c, d) {
        return b + "th " + xui.getRes("date.MONTHS." + a) + " " + (c.length == 1 ? "0" : "") + c + ":" + (d.length == 1 ? "0" : "") + d
    },
    HNS: function (n, a, b, c) {
        return (a.length == 1 ? "0" : "") + a + ":" + (b.length == 1 ? "0" : "") + b + ":" + (c.length == 1 ? "0" : "") + c
    },
    HNSMS: function (n, a, b, c, d) {
        return (a.length == 1 ? "0" : "") + a + ":" + (b.length == 1 ? "0" : "") + b + ":" + (c.length == 1 ? "0" : "") + c + " " + (d.length == 1 ? "00" : d.length == 2 ? "0" : "") + d
    },
    YM: function (n, a, b) {
        return xui.getRes("date.MONTHS." + b) + " " + a
    },
    YQ: function (n, a, b) {
        return b + "Q " + a
    },
    YMD: function (n, a, b, c) {
        return a + "-" + (b.length == 1 ? "0" : "") + b + "-" + (c.length == 1 ? "0" : "") + c
    },
    YMD2: function (n, a, b, c) {
        return xui.getRes("date.MONTHS." + b) + " " + c + ", " + a
    },
    MD: function (n, a, b) {
        return xui.getRes("date.MONTHS." + a) + " " + b
    },
    YMDH: function (n, a, b, c, d) {
        return a + "-" + (b.length == 1 ? "0" : "") + b + "-" + (c.length == 1 ? "0" : "") + c + " " + (d.length == 1 ? "0" : "") + d + ":00"
    },
    YMDHN: function (n, a, b, c, d, e) {
        return a + "-" + (b.length == 1 ? "0" : "") + b + "-" + (c.length == 1 ? "0" : "") + c + " " + (d.length == 1 ? "0" : "") + d + ":" + (e.length == 1 ? "0" : "") + e
    },
    YMDHNS: function (n, a, b, c, d, e, f) {
        return a + "-" + (b.length == 1 ? "0" : "") + b + "-" + (c.length == 1 ? "0" : "") + c + " " + (d.length == 1 ? "0" : "") + d + ":" + (e.length == 1 ? "0" : "") + e + ":" + (f.length == 1 ? "0" : "") + f
    },
    ALL: function (n, a, b, c, d, e, f, g) {
        return a + "-" + (b.length == 1 ? "0" : "") + b + "-" + (c.length == 1 ? "0" : "") + c + " " + (d.length == 1 ? "0" : "") + d + ":" + (e.length == 1 ? "0" : "") + e + ":" + (f.length == 1 ? "0" : "") + f + " " + (g.length == 1 ? "00" : g.length == 2 ? "0" : "") + g
    }
};
xui.Locale.en.color = {
    LIST: {
        FFFFFF: "White",
        FFFFF0: "Ivory",
        FFFFE0: "Light Yellow",
        FFFF00: "Yellow",
        FFFAFA: "Snow",
        FFFAF0: "Floral White",
        FFFACD: "Lemon Chiffon",
        FFF8DC: "Cornislk",
        FFF5EE: "Sea Shell",
        FFF0F5: "Lavender Blush",
        FFEFD5: "Papaya Whip",
        FFEBCD: "Blanched Almond",
        FFE4E1: "Misty Rose",
        FFE4C4: "Bisque",
        FFE4B5: "Moccasin",
        FFDEAD: "Navajo White",
        FFDAB9: "Peach Puff",
        FFD700: "Gold",
        FFC0CB: "Pink",
        "FFB6C1 ": "Light Pink",
        FFA500: "Orange",
        FFA07A: "Light Salmon",
        FF8C00: "Dark Orange",
        FF7F50: "Coral",
        FF69B4: "Hot Pink",
        FF6347: "Tomato",
        FF4500: "Orange Red",
        FF1493: "Deep Pink",
        FF00FF: "Magenta",
        FF00FF: "Fuchsia",
        FF0000: "Red",
        FDF5E6: "Old Lace",
        FAFAD2: "Light Goldenrod Yellow",
        FAF0E6: "Linen",
        FAEBD7: "Antique White",
        FA8072: "Salmon",
        F8F8FF: "Ghost White",
        F5FFFA: "Medium Spring Green",
        F5F5F5: "White Smoke",
        F5DEB3: "Wheat",
        F4A460: "Sandy Brown",
        F0FFFF: "Azure",
        F0FFF0: "Honeydew",
        F0F8FF: "Alice Blue",
        F0E68C: "Khaki",
        F08080: "Light Coral",
        EEE8AA: "Pale Godenrod",
        EE82EE: "Violet",
        E9967A: "Dark Salmon",
        E6E6FA: "Lavender",
        E1FFFF: "Light Cyan",
        DEB887: "Bruly Wood",
        DDA0DD: "plum",
        DCDCDC: "Gainsboro",
        DC143C: "Crimson",
        DB7093: "Pale Violet Red",
        DAA520: "Gold Enrod",
        DA70D6: "Orchid",
        D8BFD8: "Thistle",
        D3D3D3: "Light Grey",
        D2B48C: "Tan",
        D2691E: "Chocolate",
        CD853F: "Peru",
        CD5C5C: "Indian Red",
        C71585: "Medium Violet Red",
        C0C0C0: "Silver",
        BDB76B: "Dark Khaki",
        BC8F8F: "Rosy Brown",
        BA55D3: "Medium Orchid",
        B22222: "Fire Brick",
        B0E0E6: "Pow Der Blue",
        B0C4DE: "Light Steel Blue",
        AFEEEE: "Pale Turquoise",
        ADFF2F: "Green Yellow",
        ADD8E6: "Light BLue",
        A9A9A9: "Dark Gray",
        A52A2A: "Brown",
        A0522D: "Sienna",
        "9932CC": "Dark Orchid",
        "98FB98": "Pale Green",
        "9400D3": "Dark Voilet",
        "9370DB": "Medium Purple",
        "90EE90": "Light Green",
        "8FBC8F": "Dark Sea Green",
        "8B4513": "Saddle Brown",
        "8B008B": "Dark Magenta",
        "8B0000": "Dark Red",
        "8A2BE2": "Blue Violet",
        "87CEFA": "Light Sky Blue",
        "87CEEB": "Sky Blue",
        "808080": "Gray",
        "808000": "Olive",
        "800080": "Purple",
        "800000": "Maroon",
        "7FFFAA": "Auqamarin",
        "7FFF00": "Chartreuse",
        "7CFC00": "Lawn Green",
        "7B68EE": "Medium Slate Blue",
        "778899": "Light Slate Gray",
        "708090": "Slate Gray",
        "6B8E23": "Beige",
        "6A5ACD": "Slate Blue",
        "696969": "Dim Gray",
        "6495ED": "Cornflower Blue",
        "5F9EA0": "Cadet Blue",
        "556B2F": "Olive Drab",
        "4B0082": "Indigo",
        "48D1CC": "Medium Turquoise",
        "483D8B": "Dark Slate Blue",
        "4682B4": "Steel Blue",
        "4169E1": "Royal Blue",
        "40E0D0": "Turquoise",
        "3CB371": "Spring Green",
        "32CD32": "Lime Green",
        "2F4F4F": "Dark Slate Gray",
        "2E8B57": "Sea Green",
        "228B22": "Forest Green",
        "20B2AA": "Light Sea Green",
        "1E90FF": "Doder Blue",
        "191970": "Midnight Blue",
        "00FFFF": "Cyan",
        "00FFFF": "Aqua",
        "00FF7F": "Mint Cream",
        "00FF00": "Lime",
        "00FA9A": "Medium Aquamarine",
        "00CED1": "Dark Turquoise",
        "00BFFF": "Deep Sky Blue",
        "008B8B": "Dark Cyan",
        "008080": "Teal",
        "008000": "Green",
        "006400": "Dark Green",
        "0000FF": "Blue",
        "0000CD": "Medium Blue",
        "00008B": "Dark Blue",
        "000080": "Navy",
        "000000": "Black"
    }
};
xui.Locale.en.editor = {
    bold: "Bold",
    italic: "Italic",
    underline: "Underline",
    strikethrough: "Strikethrough",
    subscript: "Subscript",
    superscript: "Superscript",
    forecolor: "Font Color",
    bgcolor: "Background Color",
    left: "Align Left",
    center: "Align Center",
    right: "Align Right",
    justify: "Justify",
    indent: "Indent",
    outdent: "Outdent",
    ol: "Ordered List",
    ul: "Unordered List",
    hr: "Insert Horizontal Rule",
    unlink: "Remove Link",
    removeformat: "Remove Formatting",
    html: "HTML Editor",
    insertimage: "Insert Image",
    insertimage2: "Image URL:",
    createlink: "Insert Link",
    createlink2: "Link URL:",
    fontsize: "Font Size",
    fontname: "Font Family",
    formatblock: "Font Block",
    fontsizeList: "1,1(8pt);2,2(10pt);3,3(12pt);4,4(14pt);5,5(18pt);6,6(24pt);...,...",
    fontnameList: "Arial;Arial Black;Comic Sans MS;Courier New;Impact;Tahoma;Times New Roman;Trebuchet MS;Verdana;...",
    formatblockList: "p,Normal;h1,Heading1;h2,Heading2;h3,Heading3;h4,Heading4;h5,Heading5;h6,Heading6;...,..."
};
Class("xui.Debugger", null, {
    Static: {
        $time: _(),
        _id1: "xui:dbg::_frm",
        _id4: "xui:dbg::_head",
        _id2: "xui:dbg::_con",
        _id3: "xui:dbg::_inp",
        err: function (sMsg, sUrl, sLine) {
            if (xui.browser.gek && sMsg == "Error loading script") {
                return true
            }
            xui.Debugger.log("*** An error raised ***", " >> Location: " + sUrl + " ( line " + sLine + " )", " >> Message: " + sMsg)
        },
        trace: function (obj) {
            var args = arguments,
                fun = args[1] || arguments.callee.caller,
                arr = args[2] || [];
            if (fun) {
                arr.push('function "' + (fun.$name$ || "") + '" in Class "' + (fun.$original$ || "") + '"');
                if (fun.caller) {
                    try {
                        arguments.callee(null, fun.caller, arr, 1)
                    } catch (e) {}
                }
            }
            if (!args[3]) {
                var a = [];
                a.push(" >> Object Info:");
                if (typeof obj == "object") {
                    for (var i in obj) {
                        a.push(" -- " + i + " : " + obj[i])
                    }
                } else {
                    a.push(obj)
                }
                a.push(" >> Function Trace: " + arr.join(" <= "));
                xui.Debugger.log.apply(xui.Debugger, a)
            }
        },
        log: function () {
            var t1, t2, time, self = this,
                arr = arguments,
                str;
            if (!arr.length) {
                return
            }
            t1 = document.createElement("div");
            t2 = document.createElement("div");
            t2.className = "xui-dbg-con1";
            time = _();
            t2.appendChild(document.createTextNode("Time stamp : " + time + "(" + (time - self.$time) + ")"));
            self.$time = time;
            t1.appendChild(t2);
            for (var i = 0, l = arr.length; i < l; i++) {
                str = arr[i];
                t2 = document.createElement("div");
                t2.className = "xui-dbg-con2";
                t2.appendChild(document.createTextNode(" " + _.serialize(_.isArguments(str) ? _.toArr(str) : str)));
                t1.appendChild(t2)
            }
            if (!xui.Dom.byId(self._id2)) {
                var ns = xui.create("<div id=" + self._id1 + ' style="left:5px;top:' + (xui.win.scrollTop() + 5) + 'px;" class="xui-node xui-node-div xui-wrapper xui-dbg-frm"><div class="xui-node xui-node-div xui-dbg-box"><div id=' + self._id4 + ' class="xui-node xui-node-div xui-dbg-header">&nbsp;&nbsp;:&nbsp;)&nbsp;&nbsp;CrossUI Monitor window <span class="xui-node xui-node-span xui-dbg-cmds"><a class="xui-node xui-node-a" href="javascript:;" onclick="xui(\'' + self._id2 + '\').empty();">Clear</a><a class="xui-node xui-node-a" href="javascript:;" onclick="xui(\'' + self._id1 + "').remove();\"> &Chi; </a></span></div><div id=" + self._id2 + ' class="xui-node xui-node-div xui-dbg-content"></div><div class="xui-node xui-node-div xui-dbg-tail"><table class="xui-node xui-node-table"><tr><td style="font-family:serif;">&nbsp;>>>&nbsp;</td><td style="width:100%"><input class="xui-node xui-node-input" id=' + self._id3 + " /></td></tr></table></div></div></div>");
                xui("body").append(ns);
                self.$con = xui(self._id2);
                xui(self._id4).onMousedown(function (p, e, s) {
                    if (xui.Event.getSrc(e) != xui.use(s).get(0)) {
                        return
                    }
                    xui.use(s).parent(2).startDrag(e)
                });
                if (ns.addShadow) {
                    ns.addShadow()
                }
                if (xui.browser.ie6) {
                    ns.height(ns.offsetHeight());
                    ns.width(299);
                    _.asyRun(function () {
                        ns.width(300)
                    })
                }
                var bak = "",
                    temp;
                xui(self._id3).onKeydown(function (p, e, s) {
                    var k = xui.Event.getKey(e).key;
                    s = xui.use(s).get(0);
                    if (k == "enter") {
                        switch (s.value) {
                        case "?":
                        case "help":
                            self.$con.append(xui.create("<div class='xui-node xui-node-div xui-dbg-con3'><p class='xui-node xui-node-p'><strong  class='xui-node xui-node-strong'>vailable commands:</strong></p><ul  class='xui-node xui-node-ul'><li  class='xui-node xui-node-li'> -- <strong  class='xui-node xui-node-strong'>[clr]</strong> or <strong>[clear]</strong> : clears the message</li><li  class='xui-node xui-node-li'> -- <strong  class='xui-node xui-node-strong'>[?]</strong> or <strong  class='xui-node xui-node-strong'>[help]</strong> : shows this message</li><li  class='xui-node xui-node-li'> -- <strong class='xui-node xui-node-strong'>any other</strong>: shows its string representation</li></ul></div>"));
                            break;
                        case "clr":
                        case "clear":
                            xui(self._id2).empty();
                            break;
                        default:
                            try {
                                temp = s.value;
                                if (/^\s*\x7b/.test(temp)) {
                                    temp = "(" + temp + ")"
                                }
                                self.log(eval(temp))
                            } catch (e) {
                                self.$con.append(xui.create("<div  class='xui-node xui-node-div xui-dbg-con4'>" + String(e) + "</div>"));
                                return
                            }
                        }
                        bak = s.value;
                        s.value = ""
                    } else {
                        if (k == "up" || k == "down") {
                            var a = s.value;
                            s.value = bak || "";
                            bak = a
                        }
                    }
                })
            }
            self.$con.append(t1).scrollTop(self.$con.scrollHeight());
            t1 = t2 = null
        }
    },
    Initialize: function () {
        xui.CSS.addStyleSheet(".xui-dbg-frm{position:absolute;width:300px;z-index:2000;}.xui-dbg-header{cursor:move;height:18px;padding-top:2px;position:relative;border-bottom:solid 1px #CCC;background-color:#FFAB3F;font-weight:bold;}.xui-dbg-cmds{position:absolute;right:2px;top:2px;}.xui-dbg-cmds a{margin:2px;}.xui-dbg-box{position:relative;overflow:hidden;border:solid 1px #AAA;}.xui-dbg-content{position:relative;width:100%;overflow:auto;height:300px;background:#fff;}.xui-dbg-con1{background-color:#CCC;width:298px;}.xui-dbg-con2{padding-left:6px;border-bottom:dashed 1px #CCC;width:292px;}.xui-dbg-con3{padding-left:6px;border-bottom:dashed 1px #CCC;background:#EEE;color:#0000ff;width:292px;}.xui-dbg-con4{padding-left:6px;border-bottom:dashed 1px #CCC;background:#EEE;color:#ff0000;width:292px;}.xui-dbg-tail{overflow:hidden;position:relative;border-top:solid 1px #CCC;height:16px;background:#fff;color:#0000ff;}.xui-dbg-tail input{width:100%;border:0;background:transparent;}", this.KEY);
        xui.log = function () {
            if (xui.browser.gek && window.console) {
                console.log.apply(console, arguments)
            }
            xui.Debugger.log.apply(xui.Debugger, arguments)
        };
        xui.message = function (body, head, width, time) {
            width = width || 200;
            if (xui.browser.ie) {
                width = width + (width % 2)
            }
            var div, h, me = arguments.callee,
                stack = me.stack || (me.stack = []),
                allmsg = me.allmsg || (me.allmsg = []),
                t = xui.win,
                left = t.scrollLeft() + t.width() / 2 - width / 2,
                height = t.height(),
                st = t.scrollTop();
            div = stack.pop();
            while (div && !div.get(0)) {
                div = stack.pop()
            }
            if (!div) {
                div = '<div class="xui-node xui-node-div xui-wrapper xui-uibg-bar xui-uiborder-outset" style="font-size:0;line-height:0;border:solid 1px #cdcdcd;position:absolute;overflow:visible;top:-50px;z-index:' + xui.Dom.TOP_ZINDEX + '"><div class="xui-node xui-node-div" style="font-size:14px;overflow:hidden;font-weight:bold;padding:2px;"></div><div class="xui-node xui-node-div" style="font-size:12px;padding:5px;overflow:hidden;"></div></div>';
                div = xui.create(div);
                if (div.addBorder) {
                    div.addBorder()
                }
                allmsg.push(div);
                if (xui.Dom.css3Support("boxShadow")) {
                    div.css("boxShadow", "4px 4px 4px #888")
                }
            }
            if (document.body.lastChild != div.get(0)) {
                xui("body").append(div, false, true)
            }
            div.__hide = 0;
            div.css({
                left: left + "px",
                width: width + "px",
                visibility: "visible"
            }).first().html(head || "").css("display", head ? "" : "none").next().html(body || "");
            if (xui.browser.id) {
                div.ieRemedy()
            }
            if (me.last && me.last.get(0) && div != me.last) {
                var last = me.last;
                var l = last.left();
                if (last._thread && last._thread.id && last._thread.isAlive()) {
                    last._thread.abort()
                }
                last._thread = last.animate({
                    left: [l, l + (last.width + width) / 2 + 20]
                }, function () {
                    last.left(l)
                }, function () {
                    last.left(l + (last.width + width) / 2 + 20)
                }, 100, 5).start();
                var lh = last.offsetHeight();
                _.filter(allmsg, function (ind) {
                    if (ind.isEmpty()) {
                        return false
                    }
                    if (!ind.__hide && ind != div && ind != last) {
                        if (ind._thread.id && ind._thread.isAlive()) {
                            ind._thread.abort()
                        }
                        ind.topBy(lh)
                    }
                })
            }
            me.last = div;
            me.last.width = width;
            h = div.height();
            if (xui.browser.ie6) {
                div.cssSize({
                    height: h,
                    width: width + 2
                })
            }
            if (div._thread && div._thread.id && div._thread.isAlive()) {
                div._thread.abort()
            }
            div._thread = div.animate({
                top: [st - h - 20, st + 20]
            }, function () {
                div.top(st - h - 20)
            }, function () {
                div.top(st + 20)
            }, 100, 5, "expoOut").start();
            _.asyRun(function () {
                if (div._thread && div._thread.id && div._thread.isAlive()) {
                    div._thread.abort()
                }
                div._thread = div.animate({
                    top: [div.top(), height + 20]
                }, null, function () {
                    stack.push(div);
                    div.hide();
                    div.__hide = 1
                }, 100, 10).start()
            }, time || 5000)
        };
        if (!_.isDefined(window.console)) {
            window.console = {
                log: xui.log
            }
        }
    }
});
new function () {
    var _imgdemo = "img/demo.gif";
    var _imgno = "img/error.gif";
    var _img_app = xui.getPath("img/", "App.gif");
    var _img_widgets = xui.getPath("img/", "widgets.gif");
    var _items = [{
        id: "a",
        caption: "item a",
        image: _imgdemo
    }, {
        id: "b",
        caption: "item b",
        image: _imgdemo
    }, {
        id: "c",
        caption: "item c",
        image: _imgdemo
    }, {
        id: "d",
        caption: "item d",
        image: _imgdemo,
        disabled: true
    }];
    var _items2 = [{
        id: "a",
        caption: "status 1"
    }, {
        id: "b",
        caption: "status 2"
    }, {
        id: "c",
        caption: "status 3"
    }, {
        id: "d",
        caption: "status 4"
    }];
    var _items3 = [{
        id: "a",
        caption: "page1",
        image: _imgdemo
    }, {
        id: "b",
        caption: "page2",
        image: _imgdemo
    }, {
        id: "c",
        caption: "page3",
        image: _imgdemo
    }, {
        id: "d",
        caption: "page4",
        image: _imgdemo,
        closeBtn: true,
        optBtn: true,
        popBtn: true
    }];
    window.CONF = {
        version: "1.11",
        dftLang: "en",
        localeItems: [{
            id: "en",
            caption: "$RAD.en"
        }, {
            id: "cn",
            caption: "$RAD.cn"
        }, {
            id: "tw",
            caption: "$RAD.tw"
        }, {
            id: "ja",
            caption: "$RAD.ja"
        }, {
            id: "ru",
            caption: "$RAD.ru"
        }],
        img_app: _img_app,
        img_widgets: _img_widgets,
        serviceType: "remote",
        remoteService: xui.ini.appPath + "request.php",
        testPath: xui.ini.appPath + "debug.php",
        path_opendir: "HTTP://www.crossui.com/CodeSnip/Classes/",
        getAPIPath: function () {
            return CONF.serviceType == "node-webkit" ? (NW.getCWD() + "API/") : "../xui/API/"
        },
        fileExts: /\.(jpg|png|gif|css|txt|swf)$/,
        fileNames: /[\w-]+\.[\w]+$/,
        prjPath: "XUIWorkSpace",
        requestKey: "RAD",
        requestKey2: "RAD2",
        path_link: "http://www.crossUI.com",
        path_simple: "Builder.html",
        path_forum: "http://www.crossui.com/Forum/",
        path_download: "http://www.crossui.com/download.html",
        path_licence: "http://www.crossui.com/license.html",
        path_video: "http://www.crossui.com/videos/index.html",
        mapWidgets: {},
        widgets: [{
            id: "xui.Data",
            key: "xui.Data",
            caption: "Data",
            group: true,
            image: xui.getPath("img/", "App.gif"),
            imagePos: "-48px -48px",
            sub: [{
                id: "xui.DataBinder",
                key: "xui.DataBinder",
                caption: "DataBinder",
                image: "img/widgets.gif",
                imagePos: "-640px top",
                draggable: false
            }]
        }, {
            id: "xui.UI.absForm1",
            key: "xui.UI.absForm1",
            caption: "Simple Elements",
            group: true,
            image: _img_app,
            imagePos: "-48px -48px",
            sub: [{
                id: "xui.UI.Element",
                key: "xui.UI.Element",
                caption: "Node Element",
                image: _img_widgets,
                imagePos: "left top",
                draggable: false
            }, {
                id: "xui.UI.Span",
                key: "xui.UI.Span",
                caption: "Span Element",
                image: _img_widgets,
                imagePos: "-544px -16px",
                draggable: false
            }, {
                id: "xui.UI.Div",
                key: "xui.UI.Div",
                caption: "Div Element",
                image: _img_widgets,
                imagePos: "-544px top",
                draggable: false
            }]
        }, {
            id: "xui.UI.absForm",
            key: "xui.UI.absForm",
            caption: "Form Elements",
            group: true,
            image: _img_app,
            imagePos: "-48px -48px",
            sub: [{
                id: "xui.UI.Link",
                key: "xui.UI.Link",
                caption: "Link",
                image: _img_widgets,
                imagePos: "-32px top",
                draggable: false
            }, {
                id: "xui.UI.SLabel",
                key: "xui.UI.SLabel",
                caption: "Label",
                image: _img_widgets,
                imagePos: "-16px top",
                draggable: false,
                sub: [{
                    id: "xui.UI.Label",
                    key: "xui.UI.Label",
                    caption: "Advanced Label",
                    image: _img_widgets,
                    imagePos: "-16px top",
                    draggable: false
                }]
            }, {
                id: "xui.UI.SButton",
                key: "xui.UI.SButton",
                caption: "Button",
                image: _img_widgets,
                imagePos: "-48px top",
                draggable: false,
                sub: [{
                    id: "xui.UI.Button",
                    key: "xui.UI.Button",
                    caption: "Advanced Button",
                    image: _img_widgets,
                    imagePos: "-48px top",
                    draggable: false,
                    sub: [{
                        id: "xui.UI.Button0",
                        key: "xui.UI.Button",
                        caption: "Image Button",
                        draggable: false,
                        iniProp: {
                            image: _imgdemo
                        }
                    }, {
                        id: "xui.UI.Button1",
                        key: "xui.UI.Button",
                        caption: "Status Button",
                        draggable: false,
                        iniProp: {
                            type: "status"
                        }
                    }, {
                        id: "xui.UI.Button2",
                        key: "xui.UI.Button",
                        caption: "Dropable Button",
                        draggable: false,
                        iniProp: {
                            type: "drop"
                        }
                    }]
                }]
            }, {
                id: "xui.UI.SCheckBox",
                key: "xui.UI.SCheckBox",
                caption: "CheckBox",
                image: _img_widgets,
                imagePos: "-96px top",
                draggable: false,
                sub: [{
                    id: "xui.UI.CheckBox",
                    key: "xui.UI.CheckBox",
                    caption: "Advanced CheckBox",
                    image: _img_widgets,
                    imagePos: "-96px top",
                    draggable: false
                }]
            }, {
                id: "xui.UI.Input",
                key: "xui.UI.Input",
                caption: "Input",
                image: _img_widgets,
                imagePos: "-112px top",
                draggable: false,
                sub: [{
                    id: "xui.UI.Input1",
                    key: "xui.UI.Input",
                    caption: "Password Input",
                    draggable: false,
                    iniProp: {
                        type: "password",
                        value: "pwd"
                    }
                }, {
                    id: "xui.UI.Input2",
                    key: "xui.UI.Input",
                    caption: "Text Area",
                    draggable: false,
                    iniProp: {
                        multiLines: true,
                        height: 120
                    }
                }, {
                    id: "xui.UI.Input3",
                    key: "xui.UI.Input",
                    caption: "Mask Input",
                    draggable: false,
                    iniProp: {
                        mask: "u-11-ll-aa(**)"
                    }
                }, {
                    id: "xui.UI.Input4",
                    key: "xui.UI.Input",
                    caption: "Left Label",
                    draggable: false,
                    iniProp: {
                        width: 240,
                        labelSize: 120
                    }
                }, {
                    id: "xui.UI.Input5",
                    key: "xui.UI.Input",
                    caption: "Top Label",
                    draggable: false,
                    iniProp: {
                        labelSize: 20,
                        labelPos: "top",
                        labelHAlign: "left",
                        height: 44
                    }
                }]
            }, {
                id: "xui.UI.ComboInput",
                key: "xui.UI.ComboInput",
                caption: "ComboInput",
                image: _img_widgets,
                imagePos: "-144px top",
                draggable: false,
                iniProp: {
                    items: _.copy(_items)
                },
                sub: [{
                    id: "xui.UI.ComboInput1",
                    key: "xui.UI.ComboInput",
                    caption: "Left Label",
                    draggable: false,
                    iniProp: {
                        width: 240,
                        labelSize: 120,
                        items: _.copy(_items)
                    }
                }, {
                    id: "xui.UI.ComboInput2",
                    key: "xui.UI.ComboInput",
                    caption: "Top Label",
                    draggable: false,
                    iniProp: {
                        labelSize: 20,
                        labelPos: "top",
                        items: _.copy(_items),
                        labelHAlign: "left",
                        height: 44
                    }
                }, {
                    id: "xui.UI.ComboInput3",
                    key: "xui.UI.ComboInput",
                    caption: "Normal Input",
                    draggable: false,
                    iniProp: {
                        type: "none",
                        items: _.copy(_items)
                    }
                }, {
                    id: "xui.UI.ComboInput4",
                    key: "xui.UI.ComboInput",
                    caption: "Combo Input",
                    draggable: false,
                    iniProp: {
                        type: "combobox",
                        items: _.copy(_items)
                    }
                }, {
                    id: "xui.UI.ComboInput5",
                    key: "xui.UI.ComboInput",
                    caption: "Drop List Input",
                    draggable: false,
                    iniProp: {
                        type: "listbox",
                        items: _.copy(_items)
                    }
                }, {
                    id: "xui.UI.ComboInput6",
                    key: "xui.UI.ComboInput",
                    caption: "Help Input",
                    draggable: false,
                    iniProp: {
                        type: "helpinput",
                        items: [{
                            id: "item 1 text",
                            caption: "item 1"
                        }, {
                            id: "item 2 text",
                            caption: "item 2"
                        }]
                    }
                }, {
                    id: "xui.UI.ComboInput7",
                    key: "xui.UI.ComboInput",
                    caption: "Currency Input",
                    draggable: false,
                    iniProp: {
                        type: "currency"
                    }
                }, {
                    id: "xui.UI.ComboInput8",
                    key: "xui.UI.ComboInput",
                    caption: "Number Input",
                    draggable: false,
                    iniProp: {
                        type: "number"
                    }
                }, {
                    id: "xui.UI.ComboInput9",
                    key: "xui.UI.ComboInput",
                    caption: "Spinner",
                    draggable: false,
                    iniProp: {
                        type: "spin"
                    }
                }, {
                    id: "xui.UI.ComboInput10",
                    key: "xui.UI.ComboInput",
                    caption: "Uploader",
                    draggable: false,
                    iniProp: {
                        type: "file"
                    }
                }, {
                    id: "xui.UI.ComboInput11",
                    key: "xui.UI.ComboInput",
                    caption: "Getter",
                    draggable: false,
                    iniProp: {
                        type: "getter"
                    }
                }, {
                    id: "xui.UI.ComboInput12",
                    key: "xui.UI.ComboInput",
                    caption: "Command Box",
                    draggable: false,
                    iniProp: {
                        type: "cmdbox"
                    }
                }, {
                    id: "xui.UI.ComboInput13",
                    key: "xui.UI.ComboInput",
                    caption: "Pop Box",
                    draggable: false,
                    iniProp: {
                        type: "popbox"
                    }
                }, {
                    id: "xui.UI.ComboInput14",
                    key: "xui.UI.ComboInput",
                    caption: "Date Picker",
                    draggable: false,
                    iniProp: {
                        type: "date"
                    }
                }, {
                    id: "xui.UI.ComboInput15",
                    key: "xui.UI.ComboInput",
                    caption: "Time Picker",
                    draggable: false,
                    iniProp: {
                        type: "time"
                    }
                }, {
                    id: "xui.UI.ComboInput16",
                    key: "xui.UI.ComboInput",
                    caption: "Date Time Picker",
                    draggable: false,
                    iniProp: {
                        type: "datetime"
                    }
                }, {
                    id: "xui.UI.ComboInput17",
                    key: "xui.UI.ComboInput",
                    caption: "ColorPicker",
                    draggable: false,
                    iniProp: {
                        type: "color"
                    }
                }, {
                    id: "xui.UI.ComboInput18",
                    key: "xui.UI.ComboInput",
                    caption: "With Save Button",
                    draggable: false,
                    iniProp: {
                        commandBtn: "save"
                    }
                }]
            }, {
                id: "xui.UI.List",
                key: "xui.UI.List",
                caption: "List",
                image: _img_widgets,
                imagePos: "-192px top",
                draggable: false,
                iniProp: {
                    items: _.copy(_items),
                    value: "a"
                },
                sub: [{
                    id: "xui.UI.List1",
                    key: "xui.UI.List",
                    caption: "Multi Mode",
                    draggable: false,
                    iniProp: {
                        selMode: "multibycheckbox",
                        items: _.copy(_items),
                        value: "a"
                    }
                }]
            }, {
                id: "xui.UI.RichEditor",
                key: "xui.UI.RichEditor",
                caption: "RichEditor",
                image: _img_widgets,
                imagePos: "-128px top",
                draggable: false
            }, {
                id: "xui.UI.ProgressBar",
                key: "xui.UI.ProgressBar",
                caption: "ProgressBar",
                image: _img_widgets,
                imagePos: "-608px top",
                draggable: false
            }, {
                id: "xui.UI.Slider",
                key: "xui.UI.Slider",
                caption: "Slider",
                image: _img_widgets,
                imagePos: "-63px -16px",
                draggable: false,
                iniProp: {
                    isRange: false
                },
                sub: [{
                    id: "xui.UI.Slider1",
                    key: "xui.UI.Slider",
                    caption: "Range Slider",
                    draggable: false,
                    iniProp: {
                        value: "0:50"
                    }
                }, {
                    id: "xui.UI.Slider2",
                    key: "xui.UI.Slider",
                    caption: "Vertical Slider",
                    draggable: false,
                    iniProp: {
                        isRange: false,
                        type: "vertical",
                        width: 50,
                        height: 200
                    }
                }]
            }, {
                id: "xui.UI.TimePicker",
                key: "xui.UI.TimePicker",
                caption: "TimePicker",
                image: _img_widgets,
                imagePos: "-240px top",
                draggable: false
            }, {
                id: "xui.UI.DatePicker",
                key: "xui.UI.DatePicker",
                caption: "DatePicker",
                image: _img_widgets,
                imagePos: "-256px top",
                draggable: false,
                sub: [{
                    id: "xui.UI.DatePicker1",
                    key: "xui.UI.DatePicker",
                    caption: "DateTime Picker",
                    draggable: false,
                    iniProp: {
                        timeInput: true
                    }
                }]
            }, {
                id: "xui.UI.ColorPicker",
                key: "xui.UI.ColorPicker",
                caption: "ColorPicker",
                image: _img_widgets,
                imagePos: "-272px top",
                draggable: false
            }, {
                id: "xui.UI.RadioBox",
                key: "xui.UI.RadioBox",
                caption: "RadioBox",
                image: _img_widgets,
                imagePos: "-208px top",
                draggable: false,
                iniProp: {
                    items: _.copy(_items),
                    value: "a"
                },
                sub: [{
                    id: "xui.UI.RadioBox1",
                    key: "xui.UI.RadioBox",
                    caption: "CheckBox Style",
                    draggable: false,
                    iniProp: {
                        items: _.copy(_items),
                        value: "a",
                        checkBox: true,
                        selMode: "multibycheckbox"
                    }
                }]
            }, {
                id: "xui.UI.StatusButtons",
                key: "xui.UI.StatusButtons",
                caption: "StatusButtons",
                image: _img_widgets,
                imagePos: "-16px -16px",
                draggable: false,
                iniProp: {
                    items: _.copy(_items2),
                    itemLinker: "none",
                    borderType: "none",
                    itemMargin: "2px 4px",
                    itemWidth: 50,
                    width: 280,
                    height: 30,
                    value: "a"
                },
                sub: [{
                    id: "xui.UI.StatusButtons1",
                    key: "xui.UI.StatusButtons",
                    caption: "With Linker",
                    draggable: false,
                    iniProp: {
                        width: 280,
                        height: 30,
                        items: _.copy(_items2),
                        value: "a"
                    }
                }]
            }, {
                id: "xui.UI.Group",
                key: "xui.UI.Group",
                caption: "Group",
                image: _img_widgets,
                imagePos: "-224px top",
                draggable: false,
                iniProp: {
                    toggleBtn: false
                },
                sub: [{
                    id: "xui.UI.Group1",
                    key: "xui.UI.Group",
                    caption: "Foldable Group",
                    draggable: false
                }]
            }]
        }, {
            id: "xui.UI.",
            key: "xui.UI.absContainer",
            caption: "Containers",
            group: true,
            image: _img_app,
            imagePos: "-48px -48px",
            sub: [{
                id: "xui.UI.Pane",
                key: "xui.UI.Pane",
                caption: "Pane",
                image: _img_widgets,
                imagePos: "-288px top",
                draggable: false,
                sub: [{
                    id: "xui.UI.Pane1",
                    key: "xui.UI.Pane",
                    caption: "Relative Pane",
                    draggable: false,
                    customRegion: 1,
                    iniProp: {
                        dock: "width",
                        position: "relative",
                        left: "auto",
                        top: "auto",
                        width: "auto",
                        height: 100
                    }
                }]
            }, {
                id: "xui.UI.Block",
                key: "xui.UI.Block",
                caption: "Block",
                image: _img_widgets,
                imagePos: "-304px top",
                draggable: false,
                sub: [{
                    id: "xui.UI.Block1",
                    key: "xui.UI.Block",
                    caption: "Relative Block",
                    draggable: false,
                    customRegion: 1,
                    iniProp: {
                        dock: "width",
                        position: "relative",
                        left: "auto",
                        top: "auto",
                        width: "auto",
                        height: 100
                    }
                }]
            }, {
                id: "xui.UI.Panel",
                key: "xui.UI.Panel",
                caption: "Panel",
                image: _img_widgets,
                imagePos: "-672px top",
                draggable: false,
                sub: [{
                    id: "xui.UI.Panel1",
                    key: "xui.UI.Panel",
                    caption: "Relative Panel",
                    draggable: false,
                    customRegion: 1,
                    iniProp: {
                        dock: "width",
                        position: "relative",
                        left: "auto",
                        top: "auto",
                        width: "auto",
                        height: 200,
                        toggleBtn: true,
                        closeBtn: true,
                        refreshBtn: true
                    }
                }, {
                    id: "xui.UI.Panel2",
                    key: "xui.UI.Panel",
                    caption: "Foldable Panel",
                    draggable: false,
                    iniProp: {
                        dock: "none",
                        width: 200,
                        height: 200,
                        toggleBtn: true,
                        closeBtn: true,
                        refreshBtn: true
                    }
                }]
            }, {
                id: "xui.UI.Layout",
                key: "xui.UI.Layout",
                caption: "Layout",
                image: _img_widgets,
                imagePos: "-336px top",
                draggable: false,
                iniProp: {
                    items: [{
                        id: "before",
                        pos: "before"
                    }, {
                        id: "main"
                    }, {
                        id: "after",
                        pos: "after"
                    }]
                },
                sub: [{
                    id: "xui.UI.Layout1",
                    key: "xui.UI.Layout",
                    caption: "Horizontal One",
                    draggable: false,
                    iniProp: {
                        type: "horizontal",
                        items: [{
                            id: "before",
                            pos: "before"
                        }, {
                            id: "main"
                        }, {
                            id: "after",
                            pos: "after",
                            cmd: false
                        }]
                    }
                }]
            }, {
                id: "xui.UI.Tabs",
                key: "xui.UI.Tabs",
                caption: "Tabs",
                image: _img_widgets,
                imagePos: "-352px top",
                draggable: false,
                iniProp: {
                    items: _.copy(_items3),
                    value: "a"
                }
            }, {
                id: "xui.UI.Stacks",
                key: "xui.UI.Stacks",
                caption: "Stacks",
                image: _img_widgets,
                imagePos: "-368px top",
                draggable: false,
                iniProp: {
                    items: _.copy(_items3),
                    value: "a"
                }
            }, {
                id: "xui.UI.ButtonViews",
                key: "xui.UI.ButtonViews",
                caption: "ButtonViews",
                image: _img_widgets,
                imagePos: "-384px top",
                draggable: false,
                iniProp: {
                    items: _.copy(_items3),
                    barSize: 28,
                    value: "a"
                },
                sub: [{
                    id: "xui.UI.ButtonViews2",
                    key: "xui.UI.ButtonViews",
                    caption: "Left Bar",
                    draggable: false,
                    iniProp: {
                        barLocation: "left",
                        items: _.copy(_items3),
                        barSize: 140,
                        value: "a"
                    }
                }, {
                    id: "xui.UI.ButtonViews3",
                    key: "xui.UI.ButtonViews",
                    caption: "Right Bar",
                    draggable: false,
                    iniProp: {
                        barLocation: "right",
                        items: _.copy(_items3),
                        barSize: 140,
                        value: "a"
                    }
                }, {
                    id: "xui.UI.ButtonViews4",
                    key: "xui.UI.ButtonViews",
                    caption: "Bottom Bar",
                    draggable: false,
                    iniProp: {
                        barLocation: "bottom",
                        items: _.copy(_items3),
                        barSize: 28,
                        value: "a"
                    }
                }]
            }, {
                id: "xui.UI.Dialog",
                key: "xui.UI.Dialog",
                caption: "Dialog",
                image: _img_widgets,
                imagePos: "-320px top",
                draggable: false
            }]
        }, {
            id: "xui.UI.absNavigator",
            key: "xui.UI.absNavigator",
            caption: "Navigators",
            group: true,
            image: _img_app,
            imagePos: "-48px -48px",
            sub: [{
                id: "xui.UI.PageBar",
                key: "xui.UI.PageBar",
                caption: "PageBar",
                image: _img_widgets,
                imagePos: "-48px -16px",
                draggable: false,
                sub: [{
                    id: "xui.UI.PageBar2",
                    key: "xui.UI.PageBar",
                    caption: "Custom",
                    draggable: false,
                    iniProp: {
                        value: "1:5:10",
                        textTpl: "[*]",
                        caption: ""
                    }
                }]
            }, {
                id: "xui.UI.PopMenu",
                key: "xui.UI.PopMenu",
                caption: "PopMenu",
                image: _img_widgets,
                imagePos: "-400px top",
                draggable: false,
                iniProp: {
                    items: _items
                }
            }, {
                id: "xui.UI.MenuBar",
                key: "xui.UI.MenuBar",
                caption: "MenuBar",
                image: _img_widgets,
                imagePos: "-416px top",
                draggable: false,
                iniProp: {
                    items: [{
                        id: "menu1",
                        sub: [{
                            id: "normal",
                            caption: "normal"
                        }, {
                            id: "disabled",
                            caption: "disabled",
                            disabled: true
                        }, {
                            id: "image",
                            caption: "image",
                            image: _imgdemo
                        }, {
                            type: "split"
                        }, {
                            id: "checkbox 1",
                            caption: "checkbox 1",
                            type: "checkbox"
                        }, {
                            id: "checkbox 2",
                            caption: "checkbox 2",
                            type: "checkbox"
                        }],
                        caption: "menu1"
                    }, {
                        id: "menu2",
                        sub: [{
                            id: "sub menu 1",
                            caption: "sub menu 1",
                            add: "[Ctrl+F]",
                            sub: [{
                                id: "sub 1",
                                type: "radiobox"
                            }, {
                                id: "sub 2",
                                type: "radiobox"
                            }, {
                                id: "sub 3"
                            }]
                        }, {
                            id: "sub menu 2",
                            caption: "sub menu 2",
                            add: "[Ctrl+T]",
                            sub: ["sub 3", "sub 4"]
                        }]
                    }]
                }
            }, {
                id: "xui.UI.ToolBar",
                key: "xui.UI.ToolBar",
                caption: "ToolBar",
                image: _img_widgets,
                imagePos: "-432px top",
                draggable: false,
                iniProp: {
                    items: [{
                        id: "grp1",
                        sub: [{
                            id: "a1",
                            caption: "button"
                        }, {
                            id: "a2",
                            type: "split"
                        }, {
                            id: "a3",
                            caption: "drop button",
                            dropButton: true
                        }, {
                            id: "a4",
                            caption: "status button",
                            statusButton: true
                        }]
                    }, {
                        id: "grp2",
                        sub: [{
                            id: "b1",
                            image: _imgdemo
                        }, {
                            id: "b2",
                            caption: "image button",
                            label: "label:",
                            image: _imgdemo
                        }]
                    }]
                }
            }, {
                id: "xui.UI.IconList",
                key: "xui.UI.IconList",
                caption: "IconList",
                image: _img_widgets,
                imagePos: "-384px top",
                draggable: false,
                iniProp: {
                    items: _.copy(_items),
                    value: "a"
                }
            }, {
                id: "xui.UI.Gallery",
                key: "xui.UI.Gallery",
                caption: "Gallery",
                image: _img_widgets,
                imagePos: "-448px top",
                draggable: false,
                iniProp: {
                    items: _.copy(_items),
                    value: "a"
                }
            }, {
                id: "xui.UI.TreeBar",
                key: "xui.UI.TreeBar",
                caption: "TreeBar",
                image: _img_widgets,
                imagePos: "-464px top",
                draggable: false,
                iniProp: {
                    items: [{
                        id: "node1",
                        sub: ["node11",
                        {
                            id: "node12",
                            image: _imgdemo
                        }, "node13", "node14"]
                    }, {
                        id: "node2",
                        sub: ["node21", "node22", "node23", "node24"]
                    }]
                },
                sub: [{
                    id: "xui.UI.TreeBar1",
                    key: "xui.UI.TreeBar",
                    caption: "Multi Mode",
                    draggable: false,
                    iniProp: {
                        group: true,
                        selMode: "multibycheckbox",
                        items: [{
                            id: "node1",
                            sub: ["node11",
                            {
                                id: "node12",
                                image: _imgdemo
                            }, "node13", "node14"]
                        }, {
                            id: "node2",
                            sub: ["node21", "node22", "node23", "node24"]
                        }]
                    }
                }]
            }, {
                id: "xui.UI.TreeView",
                key: "xui.UI.TreeView",
                caption: "TreeView",
                image: _img_widgets,
                imagePos: "-464px -16px",
                draggable: false,
                iniProp: {
                    items: [{
                        id: "node1",
                        sub: ["node11",
                        {
                            id: "node12",
                            image: _imgdemo
                        }, "node13", "node14"]
                    }, {
                        id: "node2",
                        sub: ["node21", "node22", "node23", "node24"]
                    }]
                }
            }, {
                id: "xui.UI.TreeGrid",
                key: "xui.UI.TreeGrid",
                caption: "TreeGrid",
                image: _img_widgets,
                imagePos: "-480px top",
                draggable: false,
                iniProp: {
                    rowHandler: true,
                    rowNumbered: true,
                    header: ["col1", "col2", "col3", "col4"],
                    rows: [
                        ["row1 col1", "row1 col2", "row1 col3", "row1 col4"],
                        ["row2 col1", "row2 col2", "row2 col3", "row2 col4"],
                        {
                            cells: ["row3 col1", "row3 col2", "row3 col3", "row3 col4"],
                            sub: [
                                ["sub1", "sub2", "sub3", "sub4"]
                            ]
                        }]
                },
                sub: [{
                    id: "xui.UI.TreeGrid1",
                    key: "xui.UI.TreeGrid",
                    caption: "Editable",
                    draggable: false,
                    iniProp: {
                        rowHandler: false,
                        rowNumbered: false,
                        editable: true,
                        header: [{
                            id: "label",
                            type: "label"
                        }, {
                            id: "input",
                            type: "input"
                        }, {
                            id: "combobox",
                            type: "combobox"
                        }, {
                            id: "listbox",
                            type: "listbox"
                        }, {
                            id: "getter",
                            type: "getter"
                        }, {
                            id: "cmdbox",
                            type: "cmdbox"
                        }, {
                            id: "popbox",
                            type: "popbox"
                        }, {
                            id: "date",
                            type: "date"
                        }, {
                            id: "time",
                            type: "time"
                        }, {
                            id: "datetime",
                            type: "datetime"
                        }, {
                            id: "color",
                            type: "color"
                        }, {
                            id: "spin",
                            type: "spin"
                        }, {
                            id: "currency",
                            type: "currency"
                        }, {
                            id: "number",
                            type: "number"
                        }],
                        rows: [
                            ["label1", "input1", "", "", "", "", "", new Date, "00:00", new Date, "#ffffff", 0.12, 23.44, 43.23],
                            ["label2", "input2", "", "", "", "", "", new Date, "02:00", new Date, "#f0f0f0", 0.13, 123, 56.32],
                            ["label3", "input3", "", "", "", "", "", new Date, "03:00", new Date, "#0f0f0f", 0.14, 233.55, 43.53]
                        ]
                    }
                }]
            }]
        }, {
            id: "xui.UI.absMisc",
            key: "xui.UI.absMisc",
            caption: "Medias",
            group: true,
            image: _img_app,
            imagePos: "-48px -48px",
            sub: [{
                id: "xui.UI.Image",
                key: "xui.UI.Image",
                caption: "Image Element",
                image: _img_widgets,
                imagePos: "-624px top",
                draggable: false,
                iniProp: {
                    src: _imgno
                }
            }, {
                id: "xui.UI.Flash",
                key: "xui.UI.Flash",
                caption: "Flash",
                image: _img_widgets,
                imagePos: "-560px -16px",
                draggable: false
            }, {
                id: "xui.UI.FusionChartFree",
                key: "xui.UI.FusionChartFree",
                caption: "FusionChartFree",
                image: _img_widgets,
                imagePos: "-560px top",
                draggable: false
            }, {
                id: "xui.UI.FusionChart3",
                key: "xui.UI.FusionChart3",
                caption: "FusionChart3",
                image: _img_widgets,
                imagePos: "-560px top",
                draggable: false
            }]
        }, {
            id: "xui.UI.absAdv",
            key: "xui.UI.absAdv",
            caption: "Advanced",
            group: true,
            image: _img_app,
            imagePos: "-48px -48px",
            sub: [{
                id: "xui.UI.TextEditor",
                key: "xui.UI.TextEditor",
                caption: "TextEditor",
                image: _img_widgets,
                imagePos: "-128px top",
                draggable: false
            }, {
                id: "xui.UI.Range",
                key: "xui.UI.Range",
                caption: "Range",
                image: _img_widgets,
                imagePos: "left -16px",
                draggable: false
            }, {
                id: "xui.UI.TagEditor",
                key: "xui.UI.TagEditor",
                caption: "TagEditor",
                image: _img_widgets,
                imagePos: "-624px top",
                draggable: false
            }, {
                id: "xui.UI.Poll",
                key: "xui.UI.Poll",
                caption: "Poll",
                image: _img_widgets,
                imagePos: "-208px -16px",
                draggable: false
            }, {
                id: "xui.UI.FoldingList",
                key: "xui.UI.FoldingList",
                caption: "FoldingList",
                image: _img_widgets,
                imagePos: "-32px -16px",
                draggable: false,
                iniProp: {
                    items: [{
                        id: "a",
                        caption: "tab1",
                        title: "title1",
                        text: "text1"
                    }, {
                        id: "b",
                        caption: "tab2",
                        title: "title2",
                        text: "text2"
                    }, {
                        id: "c",
                        caption: "tab3",
                        title: "title3",
                        text: "text3"
                    }, {
                        id: "d",
                        caption: "tab4",
                        title: "title4",
                        text: "text4"
                    }, {
                        id: "e",
                        caption: "tab5",
                        title: "title5",
                        text: "text5"
                    }],
                    cmds: ["Refresh", "Remove"]
                }
            }, {
                id: "xui.UI.FoldingTabs",
                key: "xui.UI.FoldingTabs",
                caption: "FoldingTabs",
                image: _img_widgets,
                imagePos: "-624px top",
                draggable: false,
                iniProp: {
                    items: [{
                        id: "a",
                        caption: "tab1",
                        message: "normal"
                    }, {
                        id: "b",
                        caption: "tab2",
                        message: "with image",
                        image: _imgdemo
                    }, {
                        id: "c",
                        caption: "tab3",
                        message: "height:100",
                        height: 100
                    }, {
                        id: "d",
                        caption: "tab4",
                        message: "with commands",
                        closeBtn: true,
                        optBtn: true,
                        popBtn: true
                    }],
                    value: "a"
                }
            }, {
                id: "xui.UI.Calendar",
                key: "xui.UI.Calendar",
                caption: "Calendar",
                image: _img_widgets,
                imagePos: "-496px top",
                draggable: false
            }, {
                id: "xui.UI.TimeLine",
                key: "xui.UI.TimeLine",
                caption: "TimeLine",
                image: _img_widgets,
                imagePos: "-528px top",
                draggable: false,
                iniProp: {},
                sub: [{
                    id: "xui.UI.TimeLine1",
                    key: "xui.UI.TimeLine",
                    caption: "Without Bar",
                    draggable: false,
                    iniProp: {
                        showBar: false,
                        showTips: false
                    }
                }, {
                    id: "xui.UI.TimeLine2",
                    key: "xui.UI.TimeLine",
                    caption: "Per 2 Hour",
                    draggable: false,
                    iniProp: {
                        timeSpanKey: "2 h",
                        multiTasks: true
                    }
                }, {
                    id: "xui.UI.TimeLine3",
                    key: "xui.UI.TimeLine",
                    caption: "Per 6 Hour",
                    draggable: false,
                    iniProp: {
                        timeSpanKey: "6 h",
                        multiTasks: true
                    }
                }, {
                    id: "xui.UI.TimeLine4",
                    key: "xui.UI.TimeLine",
                    caption: "Per 1 Week",
                    draggable: false,
                    iniProp: {
                        timeSpanKey: "1 w",
                        multiTasks: true
                    }
                }, {
                    id: "xui.UI.TimeLine5",
                    key: "xui.UI.TimeLine",
                    caption: "Per 1 Month",
                    draggable: false,
                    iniProp: {
                        timeSpanKey: "1 m",
                        multiTasks: true
                    }
                }]
            }]
        }],
        widgets_xprops: {
            "xui.DataBinder": ["name", "dataSourceType", "queryURL", "queryArgs", "queryModel", "requestType", "responseType", "proxyInvoker"],
            "xui.UI.Element": ["nodeName", "attributes"],
            "xui.UI.Span": ["html", "tabindex"],
            "xui.UI.Div": ["html", "tabindex"],
            "xui.UI.Pane": ["html", "tabindex"],
            "xui.UI.Block": ["html", "tabindex"],
            "xui.UI.SLabel": ["caption", "tabindex"],
            "xui.UI.Label": ["caption", "tabindex"],
            "xui.UI.Link": ["caption", "onClick", "tabindex"],
            "xui.UI.SButton": ["caption", "onClick", "tabindex"],
            "xui.UI.Button": ["type", "value", "caption", "onClick", "tabindex"],
            "xui.UI.SCheckBox": ["value", "caption", "onChecked", "tabindex", "dataBinder", "dataField"],
            "xui.UI.CheckBox": ["value", "caption", "onChecked", "tabindex", "dataBinder", "dataField"],
            "xui.UI.Input": ["value", "labelSize", "labelCaption", "tabindex", "dataBinder", "dataField"],
            "xui.UI.TextEditor": ["value", "labelSize", "labelCaption", "tabindex", "dataBinder", "dataField"],
            "xui.UI.List": ["items", "value", "onItemSelected", "tabindex", "dataBinder", "dataField"],
            "xui.UI.ComboInput": ["type", "value", "tabindex", "dataBinder", "dataField"],
            "xui.UI.ProgressBar": ["value", "tabindex", "dataBinder", "dataField"],
            "xui.UI.Slider": ["value", "tabindex", "dataBinder", "dataField"],
            "xui.UI.Range": ["value", "tabindex", "dataBinder", "dataField"],
            "xui.UI.RadioBox": ["items", "value", "onItemSelected", "tabindex", "dataBinder", "dataField"],
            "xui.UI.DatePiker": ["value", "tabindex", "dataBinder", "dataField"],
            "xui.UI.TimePiker": ["value", "tabindex", "dataBinder", "dataField"],
            "xui.UI.ColorPiker": ["value", "tabindex", "dataBinder", "dataField"],
            "xui.UI.Poll": ["Items", "onGetContent", "tabindex"],
            "xui.UI.Group": ["caption", "tabindex"],
            "xui.UI.Panel": ["caption", "tabindex"],
            "xui.UI.Layout": ["type", "items", "tabindex"],
            "xui.UI.Tabs": ["items", "value", "onItemSelected", "tabindex"],
            "xui.UI.Stacks": ["items", "value", "onItemSelected", "tabindex"],
            "xui.UI.ButtonViews": ["items", "value", "onItemSelected", "tabindex"],
            "xui.UI.FoldingTabs": ["items", "value", "onItemSelected", "tabindex"],
            "xui.UI.StatusButtons": ["items", "value", "onItemClick", "tabindex"],
            "xui.UI.FoldingList": ["items", "onGetContent", "tabindex"],
            "xui.UI.IconList": ["items", "value", "onItemSelected", "tabindex"],
            "xui.UI.Dialog": ["caption", "tabindex"],
            "xui.UI.Gallery": ["items", "value", "onItemSelected", "tabindex"],
            "xui.UI.PageBar": ["value", "onClick", "tabindex"],
            "xui.UI.PopMenu": ["items", "onMenuSelected"],
            "xui.UI.MenuBar": ["items", "onMenuSelected", "tabindex"],
            "xui.UI.ToolBar": ["items", "onClick", "tabindex"],
            "xui.UI.TreeBar": ["items", "value", "onItemSelected", "onGetContent", "tabindex"],
            "xui.UI.TreeView": ["items", "value", "onItemSelected", "onGetContent", "tabindex"],
            "xui.UI.TreeGrid": ["header", "rows", "value", "onClickCell", "beforeComboPop", "onRowSelected", "onGetContent", "tabindex"],
            "xui.UI.Image": ["src", "cursor", "tabindex"],
            "xui.UI.Flash": ["src", "parameters", "flashvars", "tabindex"],
            "xui.UI.TimeLine": ["onGetContent", "tabindex"],
            "xui.UI.TagEditor": ["tagCount", "tagMaxlength", "value", "tabindex"],
            "xui.UI.FusionChartFree": ["tabindex", "onFCClick"],
            "xui.UI.FusionChart3": ["tabindex", "onFCClick"]
        },
        ComFactoryProfile: {
            about: {
                cls: "RAD.About"
            },
            addFile: {
                cls: "RAD.AddFile"
            },
            delFile: {
                cls: "RAD.DelFile"
            },
            prjPro: {
                cls: "RAD.ProjectPro"
            },
            prjSel: {
                cls: "RAD.ProjectSelector"
            },
            objEditor: {
                cls: "RAD.ObjectEditor"
            },
            HTMLEditor: {
                cls: "RAD.HTMLEditor"
            },
            FileSelector: {
                cls: "RAD.FileSelector"
            },
            MobileInstruction: {
                cls: "RAD.MobileInstruction"
            },
            RegisterForm: {
                cls: "RAD.RegisterForm"
            }
        },
        designer_data_fontfamily: [{
            caption: "<span style='font-family:arial,helvetica,sans-serif'>Arial</span>",
            id: "arial,helvetica,sans-serif"
        }, {
            caption: "<span style='font-family:arial black,avant garde'>Arial Black</span>",
            id: "arial black,avant garde"
        }, {
            caption: "<span style='font-family:comic sans ms,cursive'>Comic Sans MS</span>",
            id: "comic sans ms,cursive"
        }, {
            caption: "<span style='font-family:courier new,courier,monospace'>Courier New</span>",
            id: "courier new,courier,monospace"
        }, {
            caption: "<span style='font-family:georgia,serif'>Georgia</span>",
            id: "georgia,serif"
        }, {
            caption: "<span style='font-family:impact,chicago'>impact</span>",
            id: "impact,chicago"
        }, {
            caption: "<span style='font-family:lucida sans unicode,lucida grande,sans-serif'>Lucida Sans Unicode</span>",
            id: "lucida sans unicode,lucida grande,sans-serif"
        }, {
            caption: "<span style='font-family:tahoma,geneva,sans-serif'>Tahoma</span>",
            id: "tahoma,geneva,sans-serif"
        }, {
            caption: "<span style='font-family:times new roman,times,serif'>Times New Roman</span>",
            id: "times new roman,times,serif"
        }, {
            caption: "<span style='font-family:trebuchet ms,helvetica,sans-serif'>Trebuchet MS</span>",
            id: "trebuchet ms,helvetica,sans-serif"
        }, {
            caption: "<span style='font-family:verdana,geneva,sans-serif'>Verdana</span>",
            id: "verdana,geneva,sans-serif"
        }, {
            caption: "<span style='font-family:wingdings'>WingDings</span>",
            id: "wingdings"
        }],
        designer_data_fontsize: ["8pt", "10pt", "12pt", "14pt", "18pt", "24pt", "34pt"],
        designer_data_fontweight: ["normal", "bolder", "bold", "lighter", "200", "100"],
        designer_data_fontstyle: ["normal", "italic", "oblique"],
        designer_data_textdecoration: ["none", "underline", "overline", "line-through", "blink"],
        designer_data_textalign: ["left", "right", "center", "justify"],
        designer_data_cursor: ["default", "text", "pointer", "move", "crosshair", "wait", "help", "e-resize", "ne-resize", "nw-resize", "n-resize", "se-resize", "sw-resize", "s-resize", "w-resize"],
        designer_data_overflow: ["auto", "visible", "hidden", "scroll", "inherited"],
        inplaceedit: {
            "xui.UI.Link": {
                KEY: [0, "getCaption", "setCaption"]
            },
            "xui.UI.SLabel": {
                KEY: [0, "getCaption", "setCaption"]
            },
            "xui.UI.Label": {
                KEY: [0, "getCaption", "setCaption"]
            },
            "xui.UI.SCheckBox": {
                CAPTION: [0, "getCaption", "setCaption"]
            },
            "xui.UI.CheckBox": {
                CAPTION: [0, "getCaption", "setCaption"]
            },
            "xui.UI.SButton": {
                KEY: [0, "getCaption", "setCaption"]
            },
            "xui.UI.Button": {
                CAPTION: [0, "getCaption", "setCaption"]
            },
            "xui.UI.Group": {
                CAPTION: [0, "getCaption", "setCaption"]
            },
            "xui.UI.Input": {
                LABEL: [0, "getLabelCaption", "setLabelCaption"]
            },
            "xui.UI.ComboInput": {
                LABEL: [0, "getLabelCaption", "setLabelCaption"]
            },
            "xui.UI.PageBar": {
                LABEL: [0, "getCaption", "setCaption"]
            },
            "xui.UI.Dialog": {
                CAPTION: [0, "getCaption", "setCaption"]
            },
            "xui.UI.Panel": {
                CAPTION: [0, "getCaption", "setCaption"]
            },
            "xui.UI.List": {
                ITEM: [1, "getItemByDom", "updateItem"]
            },
            "xui.UI.RadioBox": {
                CAPTION: [1, "getItemByDom", "updateItem"]
            },
            "xui.UI.StatusButtons": {
                CAPTION: [1, "getItemByDom", "updateItem"]
            },
            "xui.UI.Gallery": {
                CAPTION: [1, "getItemByDom", "updateItem"],
                COMMENT: [1, "getItemByDom", "updateItem", "comment"]
            },
            "xui.UI.Tabs": {
                CAPTION: [1, "getItemByDom", "updateItem"]
            },
            "xui.UI.Stacks": {
                CAPTION: [1, "getItemByDom", function (prf, item, itemKey, nv) {
                    prf.boxing().updateItem(item.id, {
                        caption: nv
                    });
                    prf.boxing().reLayout(true)
                }]
            },
            "xui.UI.ButtonViews": {
                CAPTION: [1, "getItemByDom", "updateItem"]
            },
            "xui.UI.MenuBar": {
                ITEM: [1, "getItemByDom", "updateItem"]
            },
            "xui.UI.TreeBar": {
                ITEMCAPTION: [1, "getItemByDom", "updateItem"]
            },
            "xui.UI.TreeView": {
                ITEMCAPTION: [1, "getItemByDom", "updateItem"]
            },
            "xui.UI.ToolBar": {
                LABEL: [1, function (prf, node) {
                    return prf.SubSerialIdMapItem[prf.getSubId(node.id)]
                }, "updateItem", "label"],
                BTN: [1, function (prf, node) {
                    return prf.SubSerialIdMapItem[prf.getSubId(node.id)]
                }, "updateItem"]
            },
            "xui.UI.TreeGrid": {
                CELLA: [1, function (prf, node) {
                    var subId = prf.getSubId(node.id),
                        o, item = {};
                    if (subId.charAt(0) == "r") {
                        o = prf.rowMap[subId];
                        item.id = o.id;
                        item.caption = o.caption;
                        item.isRow = true
                    } else {
                        o = prf.cellMap[subId];
                        item.id = o.id;
                        item.caption = o.value
                    }
                    return item
                }, function (prf, item, itemKey, nv) {
                    if (item.isRow) {
                        prf.boxing().updateRow(item.id, {
                            caption: nv
                        })
                    } else {
                        prf.boxing().updateCell(item.id, {
                            value: nv
                        })
                    }
                }],
                HCELLA: [1, function (prf, node) {
                    var subId = prf.getSubId(node.id);
                    return subId ? prf.colMap[subId] : {
                        id: " X ",
                        caption: prf.boxing().getGridHandlerCaption()
                    }
                }, function (prf, item, itemKey, nv) {
                    if (item.id != " X ") {
                        prf.boxing().updateHeader(item.id, {
                            caption: nv
                        })
                    } else {
                        prf.boxing().setGridHandlerCaption(nv)
                    }
                }]
            },
            "xui.UI.FoldingTabs": {
                CAPTION: [1, "getItemByDom", "updateItem"],
                MESSAGE: [1, "getItemByDom", "updateItem", "message"]
            }
        }
    };
    var fun = function (items, hash) {
            var self = arguments.callee;
            _.arr.each(items, function (o) {
                hash[o.id] = o;
                if (o.sub && o.sub.length) {
                    self(o.sub, hash);
                    o.tips = "$RAD.designer.openwidgets"
                } else {
                    o.tips = "$RAD.designer.dragwidget"
                }
            })
        };
    CONF.mapWidgets = {};
    fun(CONF.widgets, CONF.mapWidgets);
    xui.setAppLangKey("RAD");
    CONF.callService = function (query, onSuccess, onFail, threadid, options, observable) {
        var request;
        switch (CONF.serviceType) {
        case "remote":
            request = function () {
                var args = _.toArr(arguments);
                args.unshift(CONF.remoteService);
                return xui.request.apply(xui, args)
            };
            break;
        case "node-webkit":
            request = function () {
                return NW.request.apply(NW, arguments)
            };
            break
        }
        if (!observable) {
            request(query, onSuccess, onFail, threadid, options)
        } else {
            _.observableRun(function (threadid) {
                request(query, onSuccess, onFail, threadid, options)
            }, null, threadid)
        }
    };
    CONF.getLocalFile = function (path, onSuccess, onFail, threadid) {
        switch (CONF.serviceType) {
        case "remote":
            xui.Ajax(path, "", onSuccess, onFail, threadid, {
                rspType: "text"
            }).start();
            break;
        case "node-webkit":
            NW.getFileContent(path, onSuccess, onFail, threadid);
            break
        }
    };
    CONF.downloadFile = function (params, onSuccess, onFail, threadid, options, observable) {
        switch (CONF.serviceType) {
        case "remote":
            request = function () {
                var args = _.toArr(arguments);
                args.unshift(CONF.remoteService);
                return xui.IAjax.apply(xui.IAjax, args).start()
            };
            break;
        case "node-webkit":
            request = function () {
                return NW.request.apply(NW, arguments)
            };
            break
        }
        if (!observable) {
            request(query, onSuccess, onFail, threadid, options)
        } else {
            _.observableRun(function (threadid) {
                request(query, onSuccess, onFail, threadid, options)
            }, null, threadid)
        }
    };
    CONF.debugApp = function (url, data) {
        switch (CONF.serviceType) {
        case "remote":
            xui.Dom.submit(url, data, "post");
            break;
        case "node-webkit":
            var gui = require("nw.gui");
            if (gui) {
                gui.App.clearCache()
            }
            var url2 = unescape(url.replace("debug.html", "runtime"));
            NW.rmDir(url2);
            NW.copyDir(NW.getCWD() + "/runtime", url2);
            var win = require("nw.gui").Window.get(window.open(url));
            win.on("closed", function () {
                NW.rmDir(url2)
            });
            localStorage._debug_win_reload_mark = "true";
            break
        }
    };
    CONF.openAPI = function (para) {
        switch (CONF.serviceType) {
        case "remote":
            xui.Dom.submit(CONF.getAPIPath() + "#!" + (para || ""));
            break;
        case "node-webkit":
            var win = require("nw.gui").Window.get(window.open(CONF.getAPIPath() + "nw.index.html#!" + (para || "")));
            break
        }
    }, CONF.openJSONEditor = function () {
        switch (CONF.serviceType) {
        case "remote":
            xui.Dom.submit("http://www.crossui.com/JSONEditor");
            break;
        case "node-webkit":
            require("nw.gui").Window.get(window.open(NW.getCWD() + "JSONEditor/nw.index.html"));
            break
        }
    }, CONF.openURL = function (url) {
        switch (CONF.serviceType) {
        case "remote":
            xui.Dom.submit(url);
            break;
        case "node-webkit":
            require("nw.gui").Shell.openExternal(url);
            break
        }
    };
    CONF.openFile = function (url) {
        switch (CONF.serviceType) {
        case "remote":
            xui.Dom.submit(url);
            break;
        case "node-webkit":
            require("nw.gui").Shell.openItem(url);
            break
        }
    };
    CONF.openBook = function () {
        switch (CONF.serviceType) {
        case "remote":
            CONF.openFile("http://www.crossui.com/Forum/cookbook-f17.html");
            break;
        case "node-webkit":
            require("nw.gui").Shell.openItem("crossui.cookbook.pdf");
            break
        }
    }, CONF.openAdvanceVer = function (s) {
        switch (CONF.serviceType) {
        case "remote":
            xui.Dom.submit("index.html");
            break;
        case "node-webkit":
            require("child_process").exec("nw.exe");
            break
        }
    };
    CONF.openSimpleVer = function (s) {
        switch (CONF.serviceType) {
        case "remote":
            xui.Dom.submit("Builder.html");
            break;
        case "node-webkit":
            require("child_process").exec("nw.exe");
            break
        }
    };
    CONF.saveAS = function (hash) {
        switch (CONF.serviceType) {
        case "remote":
            var ifrid = "ifr_for_download";
            if (!xui.Dom.byId(ifrid)) {
                xui("body").append(xui.create('<iframe id="' + ifrid + '" name="' + ifrid + '" style="display:none;"/>'))
            }
            xui.Dom.submit(CONF.remoteService, hash, "post", ifrid);
            break;
        case "node-webkit":
            return NW.request(hash);
            break
        }
    };
    CONF.saveFiles = function (collections) {
        switch (CONF.serviceType) {
        case "remote":
            var hash = {};
            _.each(collections, function (o) {
                hash[o.id] = xui.IAjax(CONF.remoteService, {
                    key: CONF.requestKey,
                    paras: o.paras
                }, o.onSuccess, o.onFail)
            });
            if (!_.isEmpty(hash)) {
                _.observableRun(function (threadid) {
                    xui.absIO.groupCall(hash, null, null, function () {
                        xui.message(xui.getRes("RAD.ps.saved", collections.length))
                    }, threadid)
                })
            }
            break;
        case "node-webkit":
            var hh = {};
            _.arr.each(collections, function (o) {
                hh[o.id] = 1
            });
            if (!_.isEmpty(hh)) {
                var count = collections.length;
                var onEnd = function (threadid) {
                        xui.message(xui.getRes("RAD.ps.saved", count));
                        xui.Thread(threadid).resume()
                    };
                _.observableRun(function (threadid) {
                    xui.Thread(threadid).suspend();
                    _.arr.each(collections, function (o) {
                        NW.saveFile(o.paras, function (arg) {
                            _.tryF(o.onSuccess, [arg]);
                            delete hh[o.id];
                            if (_.isEmpty(hh)) {
                                onEnd(threadid)
                            }
                        }, function () {
                            _.tryF(o.onFail, [arg]);
                            delete hh[o.id];
                            if (_.isEmpty(hh)) {
                                onEnd(threadid)
                            }
                        })
                    })
                })
            }
            break
        }
    };
    CONF.getRegisterInfo = function (div) {
        switch (CONF.serviceType) {
        case "node-webkit":
            var info = NW.getRegisterInfo(function (txt) {
                div.setHtml(txt)
            });
            break
        }
    };
    CONF.getPrjPath = function (path) {
        var exepath;
        switch (CONF.serviceType) {
        case "remote":
            exepath = xui.ini.appPath;
            break;
        case "node-webkit":
            exepath = CONF.prjPath + "/";
            exepath = escape(exepath).replace("%3A", ":");
            break
        }
        if (_.str.startWith(path, exepath)) {
            return path
        } else {
            return exepath + path
        }
    }
};