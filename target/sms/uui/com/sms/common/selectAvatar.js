//@ sourceURL=com.sms.common.selectAvatar
$.u.define('com.sms.common.selectAvatar', null, {
    init: function (options) {
		/*
		 * {
		 *  uploadparam:"", // 用于上传uploadify插件的url参数
		 * 	save:function(comp,avatar_id){} // 保存事件 comp:当前插件对象 avatar_id当前选中的图像Id
		 * }
		 */
        this._options = options || {};
    	this.searchParams={};
    	this.avatar_id=null;
    },
    afterrender: function () {
    	this.i18n = com.sms.common.selectAvatar.i18n;
    	// 图像列表容器
    	this.avatarContainer=this.qid("avatars");
    	
    	// 点击图像
    	this.avatarContainer.off("click",".avatar img").on("click",".avatar img",this.proxy(function(e){
    		var $sender=$(e.currentTarget);
    		$.isFunction(this._options.save) && this._options.save(this,$sender.attr("dataid"),$sender.attr("url"));
    	}));
    	
    	// 删除图像
    	this.avatarContainer.off("click","span.delete-avatar").on("click","span.delete-avatar",this.proxy(function(e){
    		var $sender=$(e.currentTarget);
    		$.u.ajax({
    			url: $.u.config.constant.smsmodifyserver,
                dataType: "json",
                data:{
    				tokenid:$.cookie("tokenid"),
    				method:"stdcomponent.delete",
    				dataobject:"avatar",
    				dataobjectids:JSON.stringify([parseInt($sender.attr("dataid"))])
    	        }
    		},$sender.parent(),{ size: 1,backgroundColor:'transparent'}).done(this.proxy(function(response){
    			if(response.success){
    	    		$sender.parents("li").fadeOut(function(){
    	    			$(this).remove();
    	    		});
    			}
    		})).fail(this.proxy(function(jqXHR,errorText,errorThrown){
    			
    		})).complete(this.proxy(function(jqXHR,errorStatus){
    			
    		}));
    	}));
    	
    	this.qid("upload-avatar").uploadify({
            'formData': {'tokenid': $.cookie("tokenid"), "method": "upload" },
            'buttonText': this.i18n.uploadImg,
            //'buttonClass': 'CancelBtn',
            //'buttonImage': this.getabsurl('res/upload.png'),
            'auto':true,
            'removeCompleted': true,
            'swf': this.getabsurl('../../../uui/widget/uploadify/uploadify.swf'),
            'uploader': $.u.config.constant.smsmodifyserver+"?tokenid="+$.cookie("tokenid")+"&method=upload&"+this._options.uploadparam,
            //'uploadLimit': 1,
            fileTypeExts:'*.jpg;*.png;*.jpeg',
            'removeTimeout': 0,
            'height': 30,
            'width': 150,
            //'preventCaching' : false,
            'onUploadSuccess': this.proxy(function (file, result, response) {
                var resultx = $.parseJSON(result);
                if (resultx.success) {
                    setTimeout(this.proxy(function(){this.loadAvatarList(this.searchParams);}) , 500);
                }
            }),
            'onUploadStart': this.proxy(function (file) {
            	//this.qid("upload-avatar").uploadify("settings", 'formData', {  });
            }),
            'onSelect': this.proxy(function (file) {
            	this.qid("upload-avatar").css("height" , "0");
                $("#" + this.id + "-upload-avatar-button").hide();
            }),
            'onSelectError': this.proxy(function (file) {
            	this.qid("upload-avatar").css("height", "14px");
            	$("#" + this.id + "-upload-avatar-button").show();
            }),
            'onCancel': this.proxy(function (file) {
            	this.qid("upload-avatar").css("height", "14px");
                $("#" + this.id + "-upload-avatar-button").fadeIn(3000);
            }),
            'onUploadComplete': this.proxy(function (file) {
            	this.qid("upload-avatar").css("height", "14px");
                $("#" + this.id + "-upload-avatar-button").show();
            })
        }); 
    	
    	this.selectAvatarDialog=this.qid("dialog-select-user-avatar").dialog({
    		width:540,
    		modal:true,
    		title:this.i18n.selectuserImg,
    		resizable:false,
    		draggable: false,
    		autoOpen:false,
    		buttons:[
    		  {
    			  "text":"关闭",
    			  "class":"aui-button-link",
    			  "click":this.proxy(function(){
    				  this.selectAvatarDialog.dialog("close");
    				  this.afterClose();
    			  })
    		  }
    		],
    		create:this.proxy(function(){
    			
    		}),
    		open:this.proxy(function(){
    			this.loadAvatarList(this.searchParams,this.avatar_id);
    		}),
    		close:this.proxy(function(){
    			
    		})
    	});
    },
    open:function(searchParams,avatar_id){
    	this.searchParams=searchParams;
    	this.avatar_id=avatar_id;
    	this.selectAvatarDialog.dialog("open");
    },
    /**
     * @title 加载用户图像列表
     * @params userinfo 用户信息
     */
    loadAvatarList: function (searchParams,avatar_id) {
        // by Wayne ,用this.getabsurl方法，参数是相对当前类的路径，绝对路径对网站目录迁移问题比较大
    	$.u.ajax({
			url: $.u.config.constant.smsqueryserver,
            dataType: "json",
            data:$.extend({
				tokenid:$.cookie("tokenid"),
				method:"stdcomponent.getbysearch",
				dataobject:"avatar"
	        },searchParams)
		}, this.selectAvatarDialog.parent(), {size:2, backgroundColor:"#fff"}).done(this.proxy(function(response){
			if(response.success){
				this.avatarContainer.empty();
		    	$.each(response.data.aaData,this.proxy(function(idx,avatar){
		    		$("<li title='"+this.i18n.chooseImg+"' class='avatar "+ (avatar_id && avatar.id==avatar_id ? "selected-avatar " : "") +(avatar.system === true ? "system-avatar" : "custom-avatar")+"'>"+
		    				"<span><img src='"+avatar.url+"' width='48' height='48' dataid='"+avatar.id+"' url='"+avatar.url+"' /></span>"+
		    				(avatar.system === false ? "<span class='delete-avatar glyphicon glyphicon-remove' dataid='"+avatar.id+"' title='"+this.i18n.removeImg+"'></span>" : "")+
		    		  "</li>").appendTo(this.avatarContainer);
		    	}));
			}
		})).fail(this.proxy(function(jqXHR,errorText,errorThrown){
			
		})).complete(this.proxy(function(jqXHR,errorStatus){
			
		}));
    	
    },
    // 用于重写
    afterClose: function(){},
    destroy: function () {
    	this.qid("upload-avatar").uploadify("destroy");
    	this.selectAvatarDialog.dialog("destroy").remove();
        this._super();
    }
}, { usehtm: true, usei18n: true });

com.sms.common.selectAvatar.widgetjs = ['../../../uui/widget/uploadify/jquery.uploadify.js',"../../../uui/widget/spin/spin.js"
                                        , "../../../uui/widget/jqblockui/jquery.blockUI.js"
                                        , "../../../uui/widget/ajax/layoutajax.js"];
com.sms.common.selectAvatar.widgetcss = [{id:"",path:"../../../uui/widget/uploadify/uploadify.css"}];