/*
* Create by wayne 1
*/
//@ sourceURL=propertyplug
(function () {
    $.u = $.u || {};
    var propertyplug = {
        _plugmapping: {},
        add: function (key, settings) {
            if (typeof (key) != "string") {
                throw new Exception("标识必须为字符");
            }
            if (this._plugmapping[key]) {
                throw new Exception("标识" + key + "已存在");
            }
            var keyclz = $.u.clazz.extend(settings);
            this._plugmapping[key] = keyclz;
        },
        newinstance: function (key, options) {
            return new this._plugmapping[key](options);
        }
    };
    $.u.propertyplug = propertyplug;
})();

// 创建插件
$.u.propertyplug.add("input", {
    _init: function (options) {
        //初始化插件实例对象

    },
    table: {
        //渲染插件前的html（提升速度）
        html: function (data, full) { return data; },
        //渲染插件后的额外操作
        render: function (data, full, cellsel) {
            this.cellsel = toolsel;
        }
    },
    filter: {
        html: function () { return "<input type='text' style='width:100%'/>" },
        render: function (toolsel) {
            this.filtersel = toolsel;
            $.u.load("xx.xx.tab");
            this.tabcomp = new xx.xx.tab(toolsel);
        },
        //获取数据
        getdata: function () {
        	this.tabcomp.getdata();
        }
    },
    edit: {
        html: function (data, full) { return "<input type='text' style='width:100%'/>" },
        render: function (data, full, cellsel) {
            this.readsel = cellsel;
        },
        getdata: function () {

        }
    },
    read: {
        html: function (data, full) { return data; },
        render: function (data, full, cellsel) { }
    }
});

// formbuilder组件
// tablebuilder组件


// 解析插件
var p = $.u.propertyplug.newinstance("input", {/*初始化属性*/});

p.read.html();
p.read.render();
p.read.getdata();

