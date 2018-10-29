//@ sourceURL=com.sms.login
$.u.define('com.sms.login', null, {
    init: function (options) {
        this._options = options || this._options;
        this._ANONYMITY = {
            username: "ANONYMITY",
            password: "ABC-123"
        }; 
        this.allowSendALoginjax = true;

        var size = 2;
        this._blockuiopts = {
            message: (new Spinner({ radius: 3 * size, width: 1 * size, length: 2 * size , color:"white" }).spin()).el, 
            overlayCSS: { 
                backgroundColor: 'transparent' 
            },
            css:{
                "background": "black", 
                "border": "none",
                "width":40,
                "height":40,
                "border-radius":8,
                "left":"50%"
            }
        };

        com.sms.login.i18n.tag = com.sms.login.i18n[$.cookie('locale') || 'zh'];
        this._i18n = com.sms.login.i18n.tag;
        document.title = this._i18n.title;
    },
    afterrender: function () {
    	
        this.loginform = this.qid("loginform");
        this.username = this.qid("username");
        this.password = this.qid("password");
        this.btnLogin = this.qid("btn_login");
        this.identifying = this.qid("identifying");
        this.loginform.validate({
            rules: {
                username: "required",
                password: "required",
                identifying:"required",
            },
            messages: {
                username: this._i18n.messages.usernameNotNull,
                password: this._i18n.messages.passwordNotNull,
                identifying: this._i18n.messages.identifyingCodeNull
            },
            errorClass: "text-danger text-validate-element",
            errorElement: "div"
        });

        this.btnLogin.button().click(this.proxy(this.on_login_click));
        this.qid("btn_anonymityReport").click(this.proxy(this.on_anonymityReport_click));
        $('.change-language', this.$).click(this.proxy(this.on_language_click));
        /**
         * @title 验证码加载
         */
        $("#identifyingCode").click(function(){
         $("#identifyingCode").attr("src","");
  		$("#identifyingCode").attr("src", "/sms/login.do\?method=getVerifyCode&"+Math.floor(Math.random()*100));
  	 })
        
      
    },
    /**
     * @title 匿名员工报告
     * @param {event object} e - 鼠标对象
     */
    on_anonymityReport_click: function(e){
    	var json=JSON.stringify({email:"",telephoneNumber:""});
        var url = $.cookie('locale') === 'en' ? 'ViewStaffReport_EN.html' : 'ViewStaffReport.html';
    	window.open(this.getabsurl(url + '?time='+(new Date()).getTime())+'&&json='+json, 'newwindow', 'height=780, width=800, top=100, left=100, toolbar=no, menubar=no, scrollbars=yes, resizable=yes, location=no, status=no'); 
    },
    /**
     * @title 切换语言
     * @param {event object} e - 鼠标对象
     */
    on_language_click: function(e){
        e.preventDefault();
        $.cookie('locale', $(e.currentTarget).attr('data-language'), {
            path: '/'
        });
        window.location.reload();
    },
    /**
     * @title 登录
     * @param {event object} e - 鼠标对象
     */
    on_login_click: function(e){
        e.preventDefault();
        if (this.loginform.valid() && this.allowSendALoginjax === true){
        	/**
        	 * @title 验证码验证
        	 */
        	this.allowSendALoginjax = false;
            $.u.ajax({
        		url:"/sms/login.do?method=checkVerifyCode&verifyCode="+this.identifying.val()
        	}).done(this.proxy(function(res){
        		 if(res.success){
        			 $.u.ajax({
        	                url: $.u.config.constant.smsloginserver,
        	                type: "post",
        	                data: { "username": this.username.val(),
        	                	    "password": this.password.val(),
        	                	    "verifyCode" :this.identifying.val()
        	                	    },
        	                dataType: "json"
        	            },this.$.find("div.panel-default"),{ size: 1,backgroundColor:'transparent', selector: this.btnLogin, orient: "west" }).done(this.proxy(function (response) {
        	                if (response.success) { 
        	                    if($("input[name=rememberme]").prop("checked")){
        	                        $.cookie("username", this.username.val(), {path:"/"});
        	                        $.cookie("pwd", this.password.val(), {path:"/"});
        	                    }
        	                    $.cookie("userid", response.userid, {path: "/"});
        	                    $.cookie("sessionid", response.sessionid, {path: "/"});
        	                    $.cookie("uskyuser", JSON.stringify({}), {path:"/"});
        	                    var cookietime = new Date(); 
        	                    cookietime.setTime(cookietime.getTime() + (60 * 60 * 2000));  //coockie保存两小时
        	                    $.cookie("tokenid", response.tokenid, {path:"/"});
        	                    $.cookie("TGC", response.TGC, {expires:cookietime, path:"/", domain:"juneyaoair.com"});
        	                    $.cookie("pageDisplayNum", response.pageDisplayNum, {path:"/"});
        	                    $.jStorage.flush();
        	                    if($.urlParam().url){
        	                        window.location.href = unescape($.urlParam().url);
        	                    }else{
        	                        window.location.href = "dash/DashBoard.html";
        	                    }
        	                }else{
        	                	this.allowSendALoginjax = true;
        	                }
        	            })).complete(this.proxy(function (jqXHR, errorStatus) {
        	            	this.status++;
        	            	this.username.add(this.password).attr("disabled", true);
        	                this.btnLogin.button("disable");
        	                this.btnLogin.attr("disable",true);
        	                this.username.add(this.password).attr("disabled", false);
        	                this.btnLogin.button("enable");
        	                
        	            })).error(this.proxy(function(){
        	            	this.allowSendALoginjax = true;
        	            }));
        		 }else{
        			 this.allowSendALoginjax = true;
        		 }
        	})).fail(this.proxy(function(){
        		this.allowSendALoginjax = true;
        	}))
        }
    },
    destroy: function () {
        return this._super();
    }
}, { usehtm: true, usei18n: true });


com.sms.login.widgetjs = ['../../uui/widget/jqurl/jqurl.js',
                          '../../uui/widget/validation/jquery.validate.js',
                          "../../uui/widget/spin/spin.js",
                          "../../uui/widget/jqblockui/jquery.blockUI.js",
                          "../../uui/widget/ajax/layoutajax.js"];
