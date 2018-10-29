// 默认的代码是一个从 xui.Com 派生来的类
Class('{className}', 'xui.Com',{
    // 要确保键值对的值不能包含外部引用
    Instance:{
        // 实例的属性要在此函数中初始化，不要直接放在Instance下
        initialize : function(){
            // 本Com是否随着第一个控件的销毁而销毁
            this.autoDestroy = true;
            // 初始化属性
            this.properties = {};
        },
        // 初始化内部控件（通过界面编辑器生成的代码，大部分是界面控件）
        // *** 如果您不是非常熟悉XUI框架，请慎重手工改变本函数的代码 ***
        iniComponents : function(){
            // [[Code created by CrossUI RAD Tools
            var host=this, children=[], append=function(child){children.push(child.get(0));};
            
            append(
                (new xui.UI.SButton())
                .setHost(host,"ctl_sbutton1")
                .setLeft(90)
                .setTop(40)
                .setCaption(" 点 我 ")
                .onClick("_ctl_sbutton1_onclick")
            );
            
            return children;
            // ]]Code created by CrossUI RAD Tools
        },
        // 加载其他Com可以用本函数
        iniExComs : function(com, threadid){
        },
        // 可以自定义哪些界面控件将会被加到父容器中
        customAppend : function(parent, subId, left, top){
            // "return false" 表示默认情况下所有的第一层内部界面控件会被加入到父容器
            return false;
        },
        // Com本身的事件映射
        events : {},
        // 例子：button 的 click 事件函数
        _ctl_sbutton1_onclick : function (profile, e, src, value) {
            var uictrl = profile.boxing();
            xui.alert("我是 " + uictrl.getAlias());
        }
    }
});