﻿//@ sourceURL=com.sms.plugin.search.publishProp
$.u.define("com.sms.plugin.search.publishProp", "com.sms.plugin.search.baseprop",{
    // filter段
    filter_html: function () { 
    	return  '<div class="filter-layer">'
			    + '<form style="min-width:250px;" role="form" id="'+this._id+'-form">'
		    	+	'<div class="form-body">'
			    + 		'<div style="padding: 10px; ">'	
			    + 			'<div class="form-group has-feedback" style="margin-bottom:0;">'
				+ 				'<label class="control-label sr-only" for="inputSuccess5">Hidden label</label>'
				+ 				'<input type="text" placeholder="查找发布状态..."  class="form-control input-sm" id="'+this._id+'-search"/>'			
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
										+'<span>#{name}</span>'
									+'</label>'
								+'</div>'
							+'</li>';
        this.filtersel = toolsel;
        this.setting = setting;
        this.statusUl = $("#"+this._id+"-project-ul", this.filtersel); 
        this.searchAds = $("#"+this._id+"-search", this.filtersel).focus();
        
        this.searchAds.off("keyup").on("keyup", this.proxy(function(e){
        	var ads = $.trim(this.searchAds.val());
        	if(ads){
        		$(".removeads", this.filtersel).removeClass("glyphicon-search").addClass("glyphicon-remove-sign");
        	}else{
        		$(".removeads", this.filtersel).removeClass("glyphicon-remove-sign").addClass("glyphicon-search");
        	}
        	this._setData(ads);
    	}));
        
        this.filtersel.find(".removeads").unbind("click").click(this.proxy(function(e){
        	var $this = $(e.currentTarget);
        	$this.removeClass("glyphicon-remove-sign").addClass("glyphicon-search");
        	this.searchAds.val("").focus();
        	this._setData();
        }));
        
        this.statusUl.off("mouseenter","li.list-group-item:not(li.no)").on("mouseenter","li.list-group-item:not(li.no)",this.proxy(function(e){
        	this.statusUl.find("li.list-group-item").css({"background-color":"#fff"});
        	$(e.currentTarget).css({"background-color":"#ebf2f9"});
        }));
        
        this.statusUl.off("click", "a.clear-all").on("click", "a.clear-all", this.proxy(function(e){
        	e.preventDefault();
    		$(e.currentTarget).parent().remove();
    		$(":checkbox", this.filtersel).prop("checked", false);
    		this.checkedIdArray = [];
        }));
        
        this.statusUl.off("click", ":checkbox").on("click", ":checkbox", this.proxy(function(e){
        	var $this = $(e.currentTarget), data = $this.data("data");
        	if($this.is(":checked")){
        		this.checkedIdArray.push(data.id);
        	}else{
        		this.checkedIdArray.splice(this.checkedIdArray.indexOf(data.id), 1);
        	}
        	this.searchAds.focus();
        }));

        this._filter_bind_commonobj();
        this._loadData();
    },
    _drawItems: function(items, container){
    	if(items && container){
    		var htmls = "";
	    	$.each(items, this.proxy(function(idx, item){
	        	htmls = this._liTemplate.replace(/#\{id\}/g, item.id)
										.replace(/#\{name\}/g, item.name)
										.replace(/#\{checked\}/g, $.inArray(item.id, this.checkedIdArray) > -1 ? "checked" : ""  )
				$(htmls).appendTo(container).find(":checkbox").data("data", item);
	        }));
    	}
    },
    _loadData:function(){
    	this.statusUl.empty();
    	this.dataArray = []; 	
    	this.checkedIdArray = [];
		if(this.setting.propvalue.length>1){
			$('<li class="list-group-item no" ><a class="clear-all" href="#" id="'+this._id+'-btn_clear">清除选择的内容</a></li>').appendTo(this.statusUl);	
		}
		this.checkedIdArray = $.map(this.setting.propvalue, function(v, k){ 
			return v.id;
		});
		this.dataArray = [
		    { "id": "true", "name": "发布"},
		    { "id": "false", "name": "未发布"}
		]
        this._drawItems(this.dataArray, this.statusUl);
        this.statusUl.find("li.list-group-item:not(li.no)").eq(0).css({"background-color":"#ebf2f9"});
    },
    _setData:function(ads){
    	var tempArray = this.dataArray;
    	this.statusUl.empty();
    	if(ads){
    		tempArray = $.grep(this.dataArray, function(item, idx){
        		return item.name.indexOf(ads) > -1;
        	});
    		if(tempArray.length == 0){
    			$('<li  class="list-group-item" style="font-style: italic;">没有匹配的</li>').appendTo(this.statusUl);
    		}
    	}else if(this.checkedIdArray.length > 1){
    		$('<li class="list-group-item no" ><a class="clear-all" href="#" id="'+this._id+'-btn_clear">清除选择的内容</a></li>').appendTo(this.statusUl);
    	}
    	this._drawItems(tempArray, this.statusUl);
        this.statusUl.find("li.list-group-item:not(li.no)").eq(0).css({ "background-color": "#ebf2f9" });
    },
    filter_getdata: function () {
    	var data = $.grep(this.dataArray, this.proxy(function(item, idx){
    		return $.inArray(item.id, this.checkedIdArray) > -1;
    	}));
    	this.setting.propvalue= data;
    	this.setting.propshow = $.map(data,function(item,idx){
    		return item.name;
    	}).join(",");
    	return this.setting;
    },
    filter_setdata:function(){
    	
    },
    destroy:function(){
    	this.filtersel.remove();
    	this.afterDestroy();
    	this._super();
    }
}, { usehtm: false, usei18n: false });
