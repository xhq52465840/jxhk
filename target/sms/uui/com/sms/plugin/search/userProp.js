//@ sourceURL=com.sms.plugin.search.userProp
$.u.define("com.sms.plugin.search.userProp", "com.sms.plugin.search.baseprop",{
    filter_html: function () { 
    	return  '<div class="filter-layer">'
			    + '<form style="min-width:250px;" role="form" id="'+this._id+'-form">'
		    	+	'<div class="form-body">'
			    + 		'<div style="padding: 10px; ">'	
			    + 			'<div class="form-group has-feedback" style="margin-bottom:0;">'
				+ 				'<label class="control-label sr-only" for="inputSuccess5">Hidden label</label>'
				+ 				'<input type="text" placeholder="查找用户..."  class="form-control input-sm" id="'+this._id+'-search"/>'			
				+ 				'<span class="glyphicon glyphicon-search form-control-feedback removeads" style="cursor:pointer;"></span>'			
				+ 			'</div>'		
			    + 		'</div>'
				+ 		'<div style="max-height: 270px;overflow-y: auto;overflow-x: hidden;clear: both;">'	
				+ 			'<ul class="list-group" id="'+this._id+'-project-ul">'
				+			'</ul>'	
				+		'</div>'
				+ 	'</div>'
				+   this._filter_buttons()
				+ '</form>'
				+ '</div>';
    },
    filter_render: function (setting,toolsel) {
    	this._liTemplate = '<li class="list-group-item" >'
									+'<div class="checkbox" style="margin: 0;">'
									+'<label style="width:100%;">'
										+'<input type="checkbox" name="#{name}" value="#{id}" #{checked} />'
										+'<span><img style="margin-right: 4px;" height="16" width="16" align="absmiddle" src="#{url}" />#{name}</span>'
									+'</label>'
								+'</div>'
							+'</li>';
    	this.CURR_PAGE = 0;
    	this.PAGE_LENGTH = 10;
        this.filtersel = toolsel;
        this.setting = setting;
        this.timer = null; 
        this.checkedUserArray = this.setting.propvalue;
    	this.checkedUserIdArray = $.map(this.setting.propvalue, function(item, idx){ return item.id; });
        this.userUl = $("#" + this._id + "-project-ul", this.filtersel); 
        this.searchAds = $("#" + this._id + "-search", this.filtersel).focus();
        
        this.searchAds.off("keyup").on("keyup",this.proxy(function(e){
        	var ads = $.trim(this.searchAds.val());
        	if(ads){
        		$(".removeads", this.filtersel).removeClass("glyphicon-search").addClass("glyphicon-remove-sign");
        	}else{
        		$(".removeads", this.filtersel).removeClass("glyphicon-remove-sign").addClass("glyphicon-search");
        	}
        	this.timer && clearTimeout(this.timer);
        	this.timer = setTimeout(this.proxy(function(){ 
            	this.CURR_PAGE = 0;
            	if(ads){
            		this._loadData(false);
            	}else{
            		this._drawDefaultPage();
            	}
        	}), 250)
    	}));
        
        this.filtersel.find(".removeads").unbind("click").click(this.proxy(function(e){
        	var $this = $(e.currentTarget);
        	$this.removeClass("glyphicon-remove-sign").addClass("glyphicon-search");
        	this.searchAds.val("").focus();
        	this._drawDefaultPage();
        }));
                
        this.userUl.off("mouseenter", "li.list-group-item:not(li.no)").on("mouseenter", "li.list-group-item:not(li.no)", this.proxy(function(e){
        	this.userUl.find("li.list-group-item").css({"background-color":"#fff"});
        	$(e.currentTarget).css({"background-color":"#ebf2f9"});
        }));
        
        this.userUl.off("click", "a.moreresult").on("click", "a.moreresult", this.proxy(function(e){
        	e.preventDefault();
        	this.CURR_PAGE++;
        	this._loadData(true);
        }));
        
        this.userUl.off("click", "a.clear-all").on("click", "a.clear-all", this.proxy(function(e){
        	e.preventDefault();
    		$(e.currentTarget).parent().remove();
    		$(":checkbox", this.filtersel).prop("checked", false);
    		this.checkedUserIdArray = [];
    		this.checkedUserArray = [];
        }));
        
        this.userUl.off("click", ":checkbox").on("click", ":checkbox", this.proxy(function(e){
        	var $this = $(e.currentTarget), data = $this.data("data");
        	if($this.is(":checked")){
        		this.checkedUserIdArray.push(data.id);
        		this.checkedUserArray.push(data);
        	}else{
        		this.checkedUserIdArray.splice(this.checkedUserIdArray.indexOf(data.id), 1);
        		this.checkedUserArray = $.grep(this.checkedUserArray, function(item, idx){
        			return item.id != data.id;
        		});
        	}
        	this.searchAds.focus();
        }));
        
        // 调用父类的绑定方法
        this._filter_bind_commonobj();
        
        // 绘制默认页
        this._drawDefaultPage();
    },
    _transformRule: function(s){
    	var result = s;
    	if(result == "currentUser()"){
        	result = $.parseJSON($.cookie("uskyuser")).avatarUrl;
    	}
    	return result;
    },
    _drawItems: function(items, container){
    	if(items && container){
    		var htmls = "";
	    	$.each(items, this.proxy(function(idx, item){
	    		if(item.name=="currentUser()"){        //我提交的安全信息的首次显示currentUser(),更改为当前用户
	    			item.name="当前用户"; 
	    		}
	        	htmls = this._liTemplate.replace(/#\{id\}/g, item.id)
										.replace(/#\{name\}/g, item.name)
										.replace(/#\{checked\}/g, $.inArray(item.id, this.checkedUserIdArray) > -1 ? "checked" : ""  )
										.replace(/#\{url\}/g, this._transformRule(item.url));
				$(htmls).appendTo(container).find(":checkbox").data("data", item);
	        }));
    	}
    },
    _loadData: function(ismore){
    	var ads = this.searchAds.val();
    	$.u.ajax({
            url: $.u.config.constant.smsqueryserver,
            dataType: "json",
            type: "post",
            data: {
        		"tokenid": $.cookie("tokenid"),
        		"method": "stdcomponent.getbysearch",
        		"dataobject": "user",
        		"rule": JSON.stringify([[{ "key": "username", "op": "like", "value": ads}, { "key": "fullname", "op": "like", "value": ads}]]),
        		"start": this.CURR_PAGE,
        		"length": (this.CURR_PAGE + 1) * this.PAGE_LENGTH
        	}
        }, this.filtersel, {size: 2, backgroundColor: '#fff'}).done(this.proxy(function (response) {
        	if (response.success) {
        		if(ismore === false){
        			this.userUl.empty();	
        		}else{
        			this.userUl.find("a.moreresult").parent().remove();
        		}
                this.userArray = $.map(response.data.aaData, function(item, idx){
                	return { "id": "" + item.id, "name": item.fullname + "(" + item.username + ")", "url": item.avatarUrl };
                });
                
                if(this.userArray.length == 0){
                	$('<li  class="list-group-item" style="font-style: italic;">没有匹配的</li>').appendTo(this.userUl);
                }
                
                this._drawItems(this.userArray, this.userUl);
                if( (this.CURR_PAGE + 1) * this.PAGE_LENGTH < response.data.iTotalRecords){
                	$("<li class='list-group-item text-center'><a href='#' class='moreresult'>更多</a></li>").appendTo(this.userUl);
                }
                this.userUl.find("li.list-group-item:not(li.no)").eq(0).css({"background-color":"#ebf2f9"});
            }
        })).fail(this.proxy(function (jqXHR, errorText, errorThrown) {

        }))
    },
    _drawDefaultPage: function(){
    	var tempArray = $.extend(true, [], this.checkedUserArray, true),
			currUser = "currentUser()";
		this.userUl.empty();
		if(tempArray.length > 1){
			$('<li class="list-group-item no" ><a class="clear-all" href="#" >清除选择的内容</a></li>').appendTo(this.userUl);
		}
		if($.inArray(currUser, this.checkedUserIdArray) < 0){
			tempArray.push({ id: currUser, name: "当前用户", url: currUser});
		}
		this._drawItems(tempArray, this.userUl);
		this.userUl.find("li.list-group-item:not(li.no)").eq(0).css({"background-color":"#ebf2f9"});
    },
    filter_getdata: function () {
    	this.setting.propvalue= this.checkedUserArray;
    	this.setting.propshow = $.map(this.checkedUserArray, this.proxy(function(item, idx){
    		return item.name;
    	})).join(",");
    	return this.setting;
    },
    filter_setdata:function(){
    	
    },
    update:function(){
    	
    },
    destroy:function(){
    	this.filtersel.remove();
    	this.afterDestroy();
    	this._super();
    }
}, { usehtm: false, usei18n: false });
