//@ sourceURL=com.sms.system.updateSmtpMailServer
$.u.define('com.sms.system.updateSmtpMailServer', null, {
    init: function (options) {
        this._options = options;
        this.params=$.urlParam();
    },
    afterrender: function (bodystr) {
    	this.i18n = com.sms.system.updateSmtpMailServer.i18n;
    	this.form=this.qid("form");
    	
    	this.formData={
    		name:{
    			obj:this.qid("name"),
    			setValue:this.proxy(function(v){
    				this.qid("name").val(v);
    			}),
    			getValue:this.proxy(function(){
    				return this.qid("name").val();
    			})
    	    },
    		description:{
    			obj:this.qid("description"),
    			setValue:this.proxy(function(v){
    				this.qid("description").val(v);
    			}),
    			getValue:this.proxy(function(){
    				return this.qid("description").val();
    			})
    	    },
    		address:{
    			obj:this.qid("address"),
    			setValue:this.proxy(function(v){
    				this.qid("address").val(v);
    			}),
    			getValue:this.proxy(function(){
    				return this.qid("address").val();
    			})
    	    },
    		prefix:{
    			obj:this.qid("prefix"),
    			setValue:this.proxy(function(v){
    				this.qid("prefix").val(v);
    			}),
    			getValue:this.proxy(function(){
    				return this.qid("prefix").val();
    			})
    	    },
    		protocol:{
    			obj:this.qid("protocol"),
    			setValue:this.proxy(function(v){
    				this.qid("protocol").val(v);
    			}),
    			getValue:this.proxy(function(){
    				return this.qid("protocol").val();
    			})
    	    },
    		server:{
    			obj:this.qid("server"),
    			setValue:this.proxy(function(v){
    				this.qid("server").val(v);
    			}),
    			getValue:this.proxy(function(){
    				return this.qid("server").val();
    			})
    	    },
    		port:{
    			obj:this.qid("port"),
    			setValue:this.proxy(function(v){
    				this.qid("port").val(v);
    			}),
    			getValue:this.proxy(function(){
    				return parseInt(this.qid("port").val());
    			})
    	    },
    		timeout:{
    			obj:this.qid("timeout"),
    			setValue:this.proxy(function(v){
    				this.qid("timeout").val(v);
    			}),
    			getValue:this.proxy(function(){
    				return parseInt(this.qid("timeout").val());
    			})
    	    },
    		tls:{
    			obj:this.qid("tls"),
    			setValue:this.proxy(function(v){
    				this.qid("tls").prop("checked",v);
    			}),
    			getValue:this.proxy(function(){
    				return this.qid("tls").is(":checked");
    			})
    	    },
    		account:{
    			obj:this.qid("account"),
    			setValue:this.proxy(function(v){
    				this.qid("account").val(v);
    			}),
    			getValue:this.proxy(function(){
    				return this.qid("account").val();
    			})
    	    },
    		changepassword:{
    			fake:true, // 获取表单数据时排除在外
    			obj:this.qid("changepassword"),
    			setValue:this.proxy(function(v){
    				this.qid("changepassword").val(v);
    			}),
    			getValue:this.proxy(function(){
    				return this.qid("changepassword").val();
    			})
    	    },
    		password:{
    			obj:this.qid("password"),
    			setValue:this.proxy(function(v){
    				this.qid("password").val(v);
    			}),
    			getValue:this.proxy(function(){
    				return this.qid("password").val();
    			})
    	    }
    	};
    	
    	// 校验表单
    	 this.form.validate({
             rules: {
                 name: "required",
                 address: {"required":true,"email":true},
                 prefix:"required",
                 server:"required"
             },
             messages: {
                 name: this.i18n.nameNotNull,
                 address: {"required":this.i18n.addressNotNull,"email":this.i18n.addressWrong},
                 prefix:this.i18n.prefixNotNull,
                 server:this.i18n.serveNameNotNull
             },
             errorClass: "text-danger text-validate-element",
             errorElement: "div"
         });
    	 
    	 // 绑定“测试连接”事件
    	 this.qid("button-test-connect").click(this.proxy(this.testConnect));
    	 
    	 // 绑定“更新”事件
    	 this.qid("button-update").click(this.proxy(this.updateSmtpMailServer)).text(this.params.id ? this.i18n.update : this.i18n.add);
    	 
    	 // 绑定“取消”事件
    	 this.qid("button-cancel").click(this.proxy(this.cancelEdit));
    	 
    	 // 加载邮件服务器信息
    	 this.params && this.params.id && this.loadSmtpMailServer(this.params.id);
    	
    },
    /**
     * @title 加载邮件服务器信息
     * @param id 
     */
    loadSmtpMailServer:function(id){
    	$.u.ajax({
			url: $.u.config.constant.smsqueryserver,
			type:"post",
            dataType: "json",
            data:{
				tokenid:$.cookie("tokenid"),
				method:"stdcomponent.getbyid",
				dataobject:"smtp",
				dataobjectid:id
	        }
		},this.$).done(this.proxy(function(response){
			if(response.success){
				this.fillForm(response.data);
			}
		})).fail(this.proxy(function(jqXHR,errorText,errorThrown){
			
		}));
    },
    /**
     * @title 填充表单
     * @param data
     */
    fillForm:function(data){
    	$.each(this.formData,function(key,item){
    		item.setValue(data[key]);
    	});
    },
    /**
     * @title 获取表单JSON值
     */
    getFormData:function(){
    	var data={};
    	$.each(this.formData,function(key,item){
    		!item.fake ? data[key]=item.getValue() : null;
    	});
    	return data;
    },
    /**
     * @title 测试连接
     * @param e
     */
    testConnect:function(e){
    	$.u.ajax({
			url: $.u.config.constant.smsqueryserver,
			type:"post",
            dataType: "json",
            data:{
				tokenid:$.cookie("tokenid"),
				method:"testConnection",
				smtp:JSON.stringify(this.getFormData())
	        }
		},this.$,{ size: 1,backgroundColor:'transparent', selector: $(e.currentTarget).parent(), orient: "west" }).done(this.proxy(function(response){
			if(response.success){
				$.u.alert.success(this.i18n.connectionSucceed);
			}
		})).fail(this.proxy(function(jqXHR,errorText,errorThrown){
			
		}));
    },
    /**
     * @title 更新SMTP邮件服务器信息
     * @param e
     */
    updateSmtpMailServer:function(e){
    	var p={
    		tokenid:$.cookie("tokenid"),
    		dataobject:"smtp",
    		obj:JSON.stringify(this.getFormData())
    	};
    	if(this.form.valid()===false) return;
    	if(this.params.id){
    		p.method="stdcomponent.update";
    		p.dataobjectid=this.params.id;
    	}else{
    		p.method="stdcomponent.add";
    	}
    	$.u.ajax({
			url: $.u.config.constant.smsmodifyserver,
			type:"post",
            dataType: "json",
            data:p
		},this.$,{ size: 1,backgroundColor:'transparent', selector: $(e.currentTarget).parent(), orient: "west" }).done(this.proxy(function(response){
			if(response.success){
				window.location.href="OutgoingEmailServers.html";
			}
		})).fail(this.proxy(function(jqXHR,errorText,errorThrown){
			
		}));
    },
    /**
     * @title 取消
     */
    cancelEdit:function(){
    	window.location.href="OutgoingEmailServers.html";
    },
    destroy: function () {
        this._super();
    }
}, { usehtm: true, usei18n: true });


com.sms.system.updateSmtpMailServer.widgetjs = ['../../../uui/widget/jqurl/jqurl.js'];
com.sms.system.updateSmtpMailServer.widgetcss = [];