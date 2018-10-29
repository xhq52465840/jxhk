//@ sourceURL=com.sms.system.lookAndFeel
$.u.define('com.sms.system.lookAndFeel', null, {
    init: function (options) {
//    		this._options = options || {};
        this._options = options;
    },
    afterrender: function (bodystr) {
    	/*
    	 * 标识
    	 */
    	this.getLogo();
    	this.logo = "/sms/uui/img/logo/logo.png";
    	$("#logoimage").find("img").attr("src",this.logo);
		this.qid("logo-upload").uploadify({
			'formData':{
				'tokenid': $.cookie("tokenid"),
				'method': 'uploadLogo',
				'dataobject': "logo",
			},
			'auto':true,
			'swf': this.getabsurl('../../../uui/widget/uploadify/uploadify.swf'),
			'uploader': $.u.config.constant.smsmodifyserver+"?method=uploadLogo&dataobject=logo&tokenid="+$.cookie("tokenid"),
			'fileTypeDesc':'Image', //文件类型描述
			'fileTypeExts':'*.png;',//可上传文件格式
			'removeCompleted': true,
			'buttonText':'直接上传', //按钮上的字
			'cancelImg':this.getabsurl('../../../uui/widget/uploadify/uploadify-cancel.png'),
			'height': 30,	//按钮的高度和宽度
			'width': 180,
			'progressData':'speed',
			'removeTimeout': 3,
			'multi': false, //单个上传
			'requeueErrors' : true,//当上传失败时，反复排队上传
    		'onUploadSuccess':this.proxy(function(file, data, response) {
    			if(response){
					$("#logoimage").find("img").attr("src",this.logo+"?v="+new Date().getTime());
					$("a[qid=logo]").find("img").attr("src",this.logo+"?v="+new Date().getTime());
    			}else{
    				$.u.alert.error("上传失败");
    			}
    		})
		});
		
		this.qid("btn_default").on("click",this.proxy(function(e){
			$.u.ajax({
	             url: $.u.config.constant.smsmodifyserver,
	             type: "post",
	             dataType: "json",
	             cache: false,
	             "data": {
	                 "tokenid": $.cookie("tokenid"),
	                 "method": "backLogo",
	                 "dataobject": "logo"
	             }
	         }).done(this.proxy(function (result) {
	             if (result.success) {
	            	 $("#logoimage").find("img").attr("src",this.logo+"?v="+new Date().getTime());
					 $("a[qid=logo]").find("img").attr("src",this.logo+"?v="+new Date().getTime());
	             }
	         })).fail(this.proxy(function (jqXHR, errorText, errorThrown) {

	         }));
			
		}));
    		
    	/*
    	 * 站点标题
    	 */
		this.qid("site-title").on("click","button.update",this.proxy(function(e){
			$.u.ajax({
             url: $.u.config.constant.smsmodifyserver,
             type: "post",
             dataType: "json",
             cache: false,
             data: {
                 "tokenid": $.cookie("tokenid"),
                 "method": "stdcomponent.update",
                 "dataobject": "siteFlag",
                 "dataobjectid":1,
                 "obj": JSON.stringify({
                	 "flag":($("#show-site-title").prop("checked")?"YES":"NO")
                 })
             }}).done(this.proxy(function (result) { 
	             if (result.success) {
	            	 $("a[qid=logo]").find("span").text(($("#show-site-title").prop("checked")?$.u.config.logo:""));
	             } 
	         })).fail(this.proxy(function (jqXHR, errorText, errorThrown) {
	
	         }));
		}));
    	/*
    	 * 图标
    	 */
    	
    	/*
    	 * 颜色
    	 */
    	//返回记录
    	$.ajax({
			url:$.u.config.constant.smsqueryserver,
			dataType: "json",
			cache: false,
			data: {
                "tokenid": $.cookie("tokenid"),
                "method": "stdcomponent.getbysearch",
                "dataobject": "color",
			}
    	}).done(this.proxy(function (result) {
            if (result.success) {
            	var	trArray = this.qid("color-table tbody").children();
            	 $.each(result.data.aaData, this.proxy(function (idx, item) {
            		 $(trArray[idx]).find("input:text").val(item.colorNum);
            		 $(trArray[idx]).find("div.colorSelector").css("background-color",item.colorNum);
            		 var $defaultVal = $(trArray[idx]).find("input:text").attr("defaultValue");
 	             	if(item.colorNum != $defaultVal){ //如上次点击行，input值跟默认值不一样，则显示“恢复”按钮
 	             		$(trArray[idx]).find("button.back").show();
 	             	}
            	 }));
		    } 
        })).fail(this.proxy(function (jqXHR, errorText, errorThrown) {
        }));
    	
    	//通过颜色选择器选择颜色
    	var $curentVal = "";
    	this.qid("color-table").on("click","div.edit",this.proxy(function(e){
    		e.preventDefault();
    		var $sender = $(e.currentTarget);
    		
			$sender.ColorPicker({
	    		color: '#0000ff',
	    		onShow: this.proxy(function (colpkr) {
	    			var $tr = $sender.closest("tr");
	    			var $oldTr = this.qid("color-table").find("tr.focused"); // 上次点击行
	    			$curentVal = $tr.find("input").val();
	    			var $inputVal = $oldTr.find("input:text").val();//上一次点击行input的值
	    			var $defaultVal = $oldTr.find("input:text").attr("defaultValue");
	    			if($inputVal!=$defaultVal){ //如上次点击行，input值跟默认值不一样，则显示“恢复”按钮
	    				$oldTr.find("button.back").show();
	    			}
	    			$oldTr.find("button.update,button.cancel").hide();//上一行的“更新”和“取消按钮隐藏”
	    			$oldTr.find("input:text").css("cursor","pointer");
	    			$oldTr.find("div.bi").show();
	    			$oldTr.css("background-color","");
	    			$oldTr.find("div.edit").css("background-color","");
	    			$oldTr.removeClass("focused");
	    			
	    			//点击当前行要做的事情
	    			$tr.find("button.update,button.cancel").show();	
	    			$tr.find("input:text").css("cursor","auto");
	    			$tr.find("input:text").select();
	    			$tr.find("div.bi").hide();
	    			$sender.css("background-color","#f0f0f0");
	    			$tr.css("background-color","#f0f0f0");
	    			$tr.addClass("focused");
	    			$(colpkr).fadeIn(100);
	    			return false;
	    		}),
	    		onHide: this.proxy(function (colpkr) {
	    			$(colpkr).fadeOut(100);
	    			return false;
	    		}),
	    		onChange: this.proxy(function (hsb, hex, rgb) {
	    			$sender.find("input:text").val("#" + hex);
	    			$sender.find("div.colorSelector").css('backgroundColor', '#' + hex);
	    		})
	    	});
			$sender.click();
    	}));
    	
    	//点击恢复时的事件
    	this.qid("color-table").on("click","button.back",this.proxy(function(e){
    		e.preventDefault();
    		var $sender = $(e.currentTarget),
    			$tr = $sender.closest("tr");
    		var $defaultVal = $tr.find("input:text").attr("defaultValue");
    		$.ajax({
	             url: $.u.config.constant.smsmodifyserver,
	             type: "post",
	             dataType: "json",
	             cache: false,
	             async: false,
	             "data": {
	                 "tokenid": $.cookie("tokenid"),
	                 "method": "stdcomponent.update",
	                 "dataobject": "color",
	                 "dataobjectid":$sender.attr("dataid"),
	                 "obj": JSON.stringify({"colorNum":$defaultVal})
	             }
	         }).done(this.proxy(function (result) { 
	             if (result.success) {
	            	 $tr.find("input:text").val($defaultVal);
	            	 $tr.find("div.colorSelector").css("background-color",$defaultVal);
	            	 $tr.find("div.bi").show();
	             } 
	         })).fail(this.proxy(function (jqXHR, errorText, errorThrown) {
	
	         }));
    		$sender.hide();
    	}));
    	//点击取消按钮事件
    	this.qid("color-table").on("click","button.cancel",this.proxy(function(e){
    		e.preventDefault();
    		var $sender = $(e.currentTarget),
    		$tr = $sender.closest("tr");
    		var $defaultVal = $tr.find("input:text").attr("defaultValue");
    		 
    		if($curentVal!=$defaultVal){
    			$tr.find("button.back").show();
    		}else{
    			$tr.find("button.back").hide();
    			
    		}
    		$tr.find("input:text").val($curentVal);
    		$tr.find("div.colorSelector").css("background-color",$curentVal);
    		$tr.css("background-color","");
    		$tr.find("div.edit").css("background-color","");
    		$tr.find("div.bi").show();
    		$sender.hide().siblings("button.update").hide();
    	}));
    	
    	//保存所选颜色
    	this.qid("color-table").on("click","button.update",this.proxy(function(e){
    		var $sender = $(e.currentTarget);
    		var	$tr = $sender.closest("tr");
    		var	colorNum = $tr.find("input").val();
	    	 $.ajax({
	             url: $.u.config.constant.smsmodifyserver,
	             type: "post",
	             dataType: "json",
	             cache: false,
	             async: false,
	             "data": {
	                 "tokenid": $.cookie("tokenid"),
	                 "method": "stdcomponent.update",
	                 "dataobject": "color",
	                 "dataobjectid":$sender.attr("dataid"),
	                 "obj": JSON.stringify({"colorNum":colorNum})
	             }
	         }).done(this.proxy(function (result) { 
	             if (result.success) {
	            	 $tr.find("input:text").val(colorNum);
	            	 $tr.find("button.update,button.cancel").hide();
	            	 var $defaultVal = $tr.find("input:text").attr("defaultValue");
	            	 if($defaultVal!=colorNum){
	            		 $tr.find("button.back").show();
	            	 }
	            	 $tr.find("div.colorSelector").css("background-color",colorNum);
	            	 $tr.find("div.bi").show();
	            	 $tr.css("background-color","");
	            	 $tr.find("div.edit").css("background-color","");
	             } 
	         })).fail(this.proxy(function (jqXHR, errorText, errorThrown) {
	
	         }));
    	}));
    	
    	/*
    	 * 小工具颜色
    	 */
    	//返回所有设置颜色的记录
    	//返回记录
    	$.ajax({
			url:$.u.config.constant.smsqueryserver,
			dataType: "json",
			cache: false,
			data: {
                "tokenid": $.cookie("tokenid"),
                "method": "stdcomponent.getbysearch",
                "dataobject": "toolColor",
			}
    	}).done(this.proxy(function (result) {
            if (result.success) {
            	var	trArray = this.qid("tools-color-table tbody").children();
            	 $.each(result.data.aaData, this.proxy(function (idx, item) {
            		 $(trArray[idx]).find("input:text").val(item.colorNum);
            		 $(trArray[idx]).find("div.colorSelector").css("background-color",item.colorNum);
            		 var $defaultVal = $(trArray[idx]).find("input:text").attr("defaultValue");
 	             	if(item.colorNum != $defaultVal){ //如上次点击行，input值跟默认值不一样，则显示“恢复”按钮
 	             		$(trArray[idx]).find("button.back").show();
 	             	}
            	 }));
		    }
        })).fail(this.proxy(function (jqXHR, errorText, errorThrown) {
        }));
    	
    	//通过颜色选择器选择颜色
    	var $curentTool = "";
    	this.qid("tools-color-table").on("click","div.edit",this.proxy(function(e){
    		e.preventDefault();
    		var $sender = $(e.currentTarget);
    		
			$sender.ColorPicker({
	    		color: '#0000ff',
	    		onShow: this.proxy(function (colpkr) {
    		var $tr = $sender.closest("tr");
    		var $oldTr = this.qid("tools-color-table").find("tr.focused"); // 上次点击行
    			$curentTool = $tr.find("input").val();
    		var $inputVal = $oldTr.find("input:text").val();//上一次点击行input的值
    		var $defaultVal = $oldTr.find("input:text").attr("defaultValue");
			if($inputVal!=$defaultVal){ //如上次点击行，input值跟默认值不一样，则显示“恢复”按钮
				$oldTr.find("button.back").show();
			}
    		$oldTr.find("button.update,button.cancel").hide();//上一行的“更新”和“取消按钮隐藏”
			$oldTr.find("input:text").css("cursor","pointer");
			$oldTr.find("div.bi").show();
			$oldTr.css("background-color","");
			$oldTr.find("div.edit").css("background-color","");
    		$oldTr.removeClass("focused");
    		
    		//点击当前行要做的事情
    		$tr.find("button.update,button.cancel").show();	
    		$tr.find("input:text").css("cursor","auto");
    		$tr.find("input:text").select();
    		$tr.find("div.bi").hide();
    		$sender.css("background-color","#f0f0f0");
    		$tr.css("background-color","#f0f0f0");
    		$tr.addClass("focused");
//	    			 
	    			$(colpkr).fadeIn(100);
	    			return false;
	    		}),
	    		onHide: this.proxy(function (colpkr) {
//	    			 
	    			$(colpkr).fadeOut(100);
	    			return false;
	    		}),
	    		onChange: this.proxy(function (hsb, hex, rgb) {
	    			$sender.find("input:text").val("#" + hex);
	    			$sender.find("div.colorSelector").css('backgroundColor', '#' + hex);
	    		})
	    	});
			$sender.click();
    	}));
    	
    	//点击恢复时的事件
    	this.qid("tools-color-table").on("click","button.back",this.proxy(function(e){
    		e.preventDefault();
    		var $sender = $(e.currentTarget),
    			$tr = $sender.closest("tr");
    		var $defaultVal = $tr.find("input:text").attr("defaultValue");
    		$.ajax({
	             url: $.u.config.constant.smsmodifyserver,
	             type: "post",
	             dataType: "json",
	             cache: false,
	             async: false,
	             "data": {
	                 "tokenid": $.cookie("tokenid"),
	                 "method": "stdcomponent.update",
	                 "dataobject": "toolColor",
	                 "dataobjectid":$sender.attr("dataid"),
	                 "obj": JSON.stringify({"colorNum":$defaultVal})
	             }
	         }).done(this.proxy(function (result) { 
	             if (result.success) {
	            	 $tr.find("input:text").val($defaultVal);
	            	 $tr.find("div.colorSelector").css("background-color",$defaultVal);
	            	 $tr.find("div.bi").show();
	             } 
	         })).fail(this.proxy(function (jqXHR, errorText, errorThrown) {
	
	         }));
    		$sender.hide();
    	}));
    	//点击取消按钮事件
    	this.qid("tools-color-table").on("click","button.cancel",this.proxy(function(e){
    		e.preventDefault();
    		var $sender = $(e.currentTarget),
    		$tr = $sender.closest("tr");
    		var $defaultVal = $tr.find("input:text").attr("defaultValue");
    		$tr.find("input:text").val($curentTool);
    		$tr.find("div.colorSelector").css("background-color",$curentTool);
    		 
    		if($curentTool!= $defaultVal){
    			$tr.find("button.back").show();
    		}else{
    			$tr.find("button.back").hide();
    			
    		}
    		$tr.css("background-color","");
    		$tr.find("div.bi").show();
    		$tr.find("div.edit").css("background-color","");
    		$sender.hide().siblings("button.update").hide();
    	}));
    	
    	//保存所选颜色
    	this.qid("tools-color-table").on("click","button.update",this.proxy(function(e){
    		var $sender = $(e.currentTarget);
    		var	$tr = $sender.closest("tr");
    		var	colorNum = $tr.find("input").val();
	    	 $.ajax({
	             url: $.u.config.constant.smsmodifyserver,
	             type: "post",
	             dataType: "json",
	             cache: false,
	             async: false,
	             "data": {
	                 "tokenid": $.cookie("tokenid"),
	                 "method": "stdcomponent.update",
	                 "dataobject": "toolColor",
	                 "dataobjectid":$sender.attr("dataid"),
	                 "obj": JSON.stringify({"colorNum":colorNum})
	             }
	         }).done(this.proxy(function (result) { 
	             if (result.success) {
	            	 $tr.find("input:text").val(colorNum);
	            	 $tr.find("button.update,button.cancel").hide();
	            	 var $defaultVal = $tr.find("input:text").attr("defaultValue");
	            	 if($defaultVal!=colorNum){
	            		 $tr.find("button.back").show();
	            	 }
	            	 $tr.find("div.colorSelector").css("background-color",colorNum);
	            	 $tr.find("div.bi").show();
	            	 $tr.css("background-color","");
	            	 $tr.find("div.edit").css("background-color","");
	             } 
	         })).fail(this.proxy(function (jqXHR, errorText, errorThrown) {
	
	         }));
    	}));
    	
    	/*
    	 * <!-- 日期/时间格式 -->
    	 */
    	var $currentCheck = ""
    	$.ajax({
			url:$.u.config.constant.smsqueryserver,
			dataType: "json",
			cache: false,
			data: {
                "tokenid": $.cookie("tokenid"),
                "method": "stdcomponent.getbysearch",
                "dataobject": "timeFormat",
			}
    	}).done(this.proxy(function (result) {
            if (result.success) {
            	var	trArray = this.qid("data-table tbody").children();
            	 $.each(result.data.aaData, this.proxy(function (idx, item) {
            		 if(idx<4){
            			 $(trArray[idx]).find("input:text").val(item.pattern);
            			 var $defaultVal = $(trArray[idx]).find("input:text").attr("defaultValue");
            			 if(item.pattern != $defaultVal){ //如上次点击行，input值跟默认值不一样，则显示“恢复”按钮
            				 $(trArray[idx]).find("button.back").show();
            			 }
            		 }
 	             	if(idx==4){
 	             		if("yes"==item.pattern){
 	             			$(trArray[idx]).find("#yes").show();
 	             			$(trArray[idx]).find("button.back").show();
 	             			$(trArray[idx]).find("input:checkbox").prop("checked",true);
 	             		}else{
 	             			$(trArray[idx]).find("#no").show();
 	             			$(trArray[idx]).find("input:checkbox").prop("checked",false);
 	             		}
 	             		$currentCheck = item.pattern;
 	             	}
            	 }));
		    } 
        })).fail(this.proxy(function (jqXHR, errorText, errorThrown) {
        }));
    	//点击格式的部分事件
    	var $currentDate = "";
//    	var $currentCheck = "";
    	this.qid("data-table tbody").on("click","div.datafm",this.proxy(function(e){
    		if(!$(e.target).is("input:checkbox")){
    			e.preventDefault();
    		}
    		var $sender = $(e.currentTarget),
				$tr = $sender.closest("tr");
    		$currentDate = $tr.find("input:text").val();
    		var $oldTr = this.qid("data-table tbody").find("tr.focused"); // 上次点击行
//    		if($tr.find("input:checkbox").is(":checked")){
//    			$currentCheck = 0;
//    		}else if(!($tr.find("input:checkbox").is(":checked"))){
//    			$currentCheck = 1;
//    		}
    		$oldTr.find("button.update,button.cancel").hide();
    		if($oldTr.find("button.update").attr("dataid")!=5){
    			$oldTr.find("span").show();
    		}
    		$oldTr.find("div.datafm").css("background-color","");
    		$oldTr.css("background-color","");
    		$oldTr.find("input").css("cursor","pointer");
    		var $defaultValue = $oldTr.find("input:text").attr("defaultValue");
    		var $value = $oldTr.find("input:text").val();
    		if($defaultValue!=$value){
    			$oldTr.find("button.back").show();
    		}
    		if($oldTr.find("button.update").attr("dataid")==5){
    			if($currentCheck == "yes"){
    				$oldTr.find("#yes").show();
    			}else if($currentCheck == "no"){
    				$oldTr.find("#no").show();
    			}
    			$oldTr.find("input:checkbox").hide();
    		}
    		$oldTr.removeClass("focused");
    		//点击当前行
    		$tr.find("button.update,button.cancel").show();
    		$tr.find("span").hide();
    		$tr.find("input:text").select();
    		$sender.css("background-color","#f0f0f0");
    		$tr.css("background-color","#f0f0f0");
    		$tr.find("input").css("cursor","auto");
    		if($tr.find("button.update").attr("dataid")==5){
    			$tr.find("#yes,#no").hide();
    			$tr.find("#choose").show();
    		}
    		$tr.addClass("focused");
    		
    		
    	}));
    	//恢复按钮功能
    	this.qid("data-table tbody").on("click","button.back",this.proxy(function(e){
    		e.preventDefault();
    		var $sender = $(e.currentTarget),
    			$tr = $sender.closest("tr");
    		var $value = "";
    		if($tr.find("button.back").attr("dataid")==5){
    				$value = "no";
    		}else{
    				$value = $tr.find("input:text").attr("defaultValue");
    		}
    		$.ajax({
	             url: $.u.config.constant.smsmodifyserver,
	             type: "post",
	             dataType: "json",
	             cache: false,
	             async: false,
	             "data": {
	                 "tokenid": $.cookie("tokenid"),
	                 "method": "stdcomponent.update",
	                 "dataobject": "timeFormat",
	                 "dataobjectid":$sender.attr("dataid"),
	                 "obj": JSON.stringify({"pattern":$value})
	             }
	         }).done(this.proxy(function (result) { 
	             if (result.success) {
	            	 if($tr.find("button.back").attr("dataid")==5){
	            		 $tr.find("#no").show();
	            		 $tr.find("#yes").hide();
	            		 $tr.find("input:checkbox").prop("checked",false);
		     		}else{
		     			 $tr.find("input:text").val($value);
		     			 $tr.find("span").show();
		     		}
	            	 $tr.find("button.update,button.cancel").hide();
	             } 
	         })).fail(this.proxy(function (jqXHR, errorText, errorThrown) {
	
	         }));
    		$sender.hide();
    	}));
    	
    	//更新按钮功能
    	this.qid("data-table tbody").on("click","button.update",this.proxy(function(e){
    		e.preventDefault();
    		var $sender = $(e.currentTarget),
    			$tr = $sender.closest("tr");
    		var $value = "";
    		 
    		if($tr.find("button.update").attr("dataid")== 5){
    			if(($tr.find("#choose").is(":checked"))){
    				$value = "yes";
    			}else{
    				$value = "no";
    			}
    			
    		}else{
    			$value = $tr.find("input:text").val();
    		}
    		$.ajax({
	             url: $.u.config.constant.smsmodifyserver,
	             type: "post",
	             dataType: "json",
	             cache: false,
	             async: false,
	             "data": {
	                 "tokenid": $.cookie("tokenid"),
	                 "method": "stdcomponent.update",
	                 "dataobject": "timeFormat",
	                 "dataobjectid":$sender.attr("dataid"),
	                 "obj": JSON.stringify({"pattern":$value})
	             }
	         }).done(this.proxy(function (result) {  
	             if (result.success) {
	            	 if($tr.find("button.update").attr("dataid")== 5){
	            		 if($value == "yes"){
	         				$tr.find("#yes").show();
	         				$tr.find("#no").hide();
	         				$tr.find("#choose").hide();
	         				$tr.find("button.back").show();
	         			}else{
	         				$tr.find("#yes").hide();
	         				$tr.find("#no").show();
	         				$tr.find("#choose").hide();
	         			}
	         			
	         		}else {
	         			var $defaultVal = $tr.find("input:text").attr("defaultValue");
	         			if($value!=$defaultVal){
	         				$tr.find("button.back").show();
	         			}
	         			 $tr.find("input:text").val($value);
	         			 $tr.find("span").show();
	         		}
	            	 $tr.find("button.cancel,button.update").hide();
	            	 $tr.css("background-color","");
	            	 $tr.find("div.datafm").css("background-color","");
	            	 
	             } 
	         })).fail(this.proxy(function (jqXHR, errorText, errorThrown) {
	
	         }));
    		$sender.hide();
    	}));
    	//取消按钮功能
    	this.qid("data-table tbody").on("click","button.cancel",this.proxy(function(e){
    		e.preventDefault();
    		var $sender = $(e.currentTarget),
    		$tr = $sender.closest("tr");
    		var $value = "";
    		 
    		if($tr.find("button.back").attr("dataid")==5){
    			if($currentCheck == "yes"){
    				$tr.find("#yes").show();
    				$tr.find("#no").hide();
    				$tr.find("#choose").hide();
    			}else{
    				$tr.find("#yes").hide();
    				$tr.find("#no").show();
    				$tr.find("#choose").hide();
    			}
    		}
    		if($tr.find("button.update").attr("dataid")!=5){
    			$tr.find("span").show();
    		}
    		$tr.find("input:text").val($currentDate);
    		
    		$tr.css("background-color","");
    		$tr.find("div.datafm").css("background-color","");
    		$sender.hide().siblings("button.update,button.back").hide();
    	}));
    	//分割线
    },
    getLogo:function(){
    	$.u.ajax({
            url: $.u.config.constant.smsqueryserver,
            type: "post",
            dataType: "json",
            cache: false,
            "data": {
                "tokenid": $.cookie("tokenid"),
                "method": "getSiteFlag"
            }
        }).done(this.proxy(function (result) { 
            if (result.success) {
           	 	if(result.data.flag=="YES"){
           	 		$("#show-site-title").prop("checked",true);
           	 	}else if(result.data.flag=="NO"){
           	 		$("#show-site-title").prop("checked",false);
           	 	}
            } 
        })).fail(this.proxy(function (jqXHR, errorText, errorThrown) {

        }));
    },
    destroy: function () {
        this._super();
    }
}, { usehtm: true, usei18n: false });


com.sms.system.lookAndFeel.widgetjs = ['../../../uui/widget/uploadify/jquery.uploadify.js',
                                       "../../../uui/widget/spin/spin.js",
                                       "../../../uui/widget/jqblockui/jquery.blockUI.js",
                                       "../../../uui/widget/ajax/layoutajax.js",
                                       "../../../uui/widget/colortools/js/colorpicker.js",
                                       "../../../uui/widget/colortools/js/eye.js",
                                       "../../../uui/widget/colortools/js/utils.js"
                                      ];
com.sms.system.lookAndFeel.widgetcss = [{ path: '../../../uui/widget/jqdatatable/css/jquery.dataTables.css' }, 
                                        { path: '../../../uui/widget/jqdatatable/css/dataTables.bootstrap.css' },
                                        { path:"../../../uui/widget/select2/css/select2.css"},
                                        { path:"../../../uui/widget/select2/css/select2-bootstrap.css"},
                                        { path: '../../../uui/widget/colortools/css/colorpicker.css'},
                                        { path: '../../../uui/widget/colortools/css/layout.css'},
                                        {path:"../../../uui/widget/uploadify/uploadify.css"}
                                        ];