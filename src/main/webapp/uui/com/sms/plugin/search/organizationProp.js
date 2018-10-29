//@ sourceURL=com.sms.plugin.search.organizationProp
$.u.define("com.sms.plugin.search.organizationProp", "com.sms.plugin.search.baseprop",{
    // filter段
    filter_html: function () { 
    	return  '<div class="filter-layer">'
			    + '<form style="min-width:250px;" role="form" id="'+this._id+'-form">'
		    	+	'<div class="form-body">'
			    + 		'<div style="padding: 10px; ">'	
			    + 			'<div class="form-group has-feedback" style="margin-bottom:0;">'
				+ 				'<label class="control-label sr-only" for="inputSuccess5">Hidden label</label>'
				+ 				'<input type="text" placeholder="查找组织..."  class="form-control input-sm" id="'+this._id+'-search"/>'			
				+ 				'<span class="glyphicon glyphicon-search form-control-feedback removeads" style="cursor:pointer;"></span>'			
				+ 			'</div>'		
			    + 		'</div>'
				+ 		'<div style="max-height: 270px;overflow-y: auto;overflow-x: hidden;clear: both;" id="'+this._id+'-project-div">'
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
					+'<span style="width:150px;overflow: hidden;text-overflow: ellipsis;white-space: nowrap;"><img style="margin-right: 4px;" height="16" width="16" align="absmiddle" src="#{url}" title="#{name}" />#{name}</span>'
				+'</label>'
			+'</div>'
		+'</li>';
        this.filtersel = toolsel;
        this.setting = setting;
        this.unitDiv = $("#" + this._id + "-project-div", this.filtersel); 
        this.searchAds = $("#" + this._id + "-search", this.filtersel).focus();
        
        this.searchAds.off("keyup").on("keyup", this.proxy(function(e){
        	var ads = $.trim(this.searchAds.val());
        	if(ads){
        		$(".removeads", this.filtersel).removeClass("glyphicon-search").addClass("glyphicon-remove-sign");
            	this._setData(ads);
        	}else{
        		$(".removeads", this.filtersel).removeClass("glyphicon-remove-sign").addClass("glyphicon-search");
        		this._setAllData();
        	}
    	}));
        
        this.filtersel.find(".removeads").unbind("click").click(this.proxy(function(e){
        	var $this = $(e.currentTarget);
        	$this.removeClass("glyphicon-remove-sign").addClass("glyphicon-search");
        	this.searchAds.val("").focus();
        	this._setAllData();
        }));
        
        this.unitDiv.off("mouseenter","li.list-group-item:not(li.no)").on("mouseenter","li.list-group-item:not(li.no)",this.proxy(function(e){
        	this.unitDiv.find("li.list-group-item").css({"background-color":"#fff"});
        	$(e.currentTarget).css({"background-color":"#ebf2f9"});
        }));
        
        this.unitDiv.off("click", "a.clear-all").on("click", "a.clear-all", this.proxy(function(e){
        	e.preventDefault();
    		$(e.currentTarget).parent().remove();
    		$(":checkbox", this.filtersel).prop("checked", false);
    		this.checkedIdArray = [];
    		this.checkedUnitArray = [];
        }));
        
        this.unitDiv.off("click", ":checkbox").on("click", ":checkbox", this.proxy(function(e){
        	var $this = $(e.currentTarget), data = $this.data("data");
        	if($this.is(":checked")){
        		this.checkedIdArray.push(data.id);
        		this.checkedUnitArray.push(data);
        	}else{
        		this.checkedIdArray.splice(this.checkedIdArray.indexOf(data.id), 1);
        		this.checkedUnitArray = $.grep(this.checkedUnitArray, function(item, idx){
        			return item.id !== data.id;
        		});
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
										.replace(/#\{url\}/g, item.avatarUrl);
				$(htmls).appendTo(container).find(":checkbox").data("data", item);
	        }));
    	}
    },
    _loadData:function(){
    	this.units = [];		
    	this.uncheckedUnits = [];
    	this.recentUnits = [];	
    	this.uncheckedRecentUnits = [];	
    	this.checkedIdArray = [];		
    	this.checkedUnitArray = this.setting.propvalue || [];		
    	
    	$.u.ajax({
            url: $.u.config.constant.smsqueryserver,
            dataType: "json",
            data: {
        		"tokenid": $.cookie("tokenid"),
        		"method": "getunits"
        	}
        }, this.filtersel, {size: 2, backgroundColor: '#fff'}).done(this.proxy(function (response) {
        	if (response.success) {    	
        		this.units = $.map(response.data, this.proxy(function(item, idx){
        			return { "id": item.id, "name": item.name, "avatarUrl": item.avatarUrl, "code": item.code };
        		}));
        		// this.recentUnits = $.map(response.data.recentUnits, this.proxy(function(item, idx){
        		// 	return { "id": item.id, "name": item.name, "avatarUrl": item.avatarUrl, "code": item.code };
        		// }));
        		this.checkedIdArray = $.map(this.checkedUnitArray, this.proxy(function(item, idx){
        			return item.id;
        		}));
                
        		
        		this._setAllData();
                
                this.unitDiv.find("li.list-group-item:not(li.no)").eq(0).css({"background-color":"#ebf2f9"});
            }
        })).fail(this.proxy(function (jqXHR, errorText, errorThrown) {

        }))
    },
    _setData:function(ads){
    	var $ul = null;
    	this.unitDiv.empty();
    	$ul = $('<ul class="list-group"></ul>').appendTo(this.unitDiv);
    	this.data = $.grep(this.units, this.proxy(function(item, idx){
    		return item.name.indexOf(ads) > -1;
    	}));
    	this._drawItems(this.data, $ul);
		if( this.data.length === 0 ){
			$('<li class="list-group-item" style="font-style: italic;">没有匹配的</li>').appendTo(this.unitDiv);
		}
        this.unitDiv.find("li.list-group-item:not(li.no)").eq(0).css({"background-color":"#ebf2f9"});
    },
    _setAllData:function(){
    	var $ul = null; 
    	this.unitDiv.empty();
    	this.uncheckedRecentUnits = $.grep(this.recentUnits, this.proxy(function(item, idx){
        	return $.inArray(item.id, this.checkedIdArray) < 0;
        }));
        this.uncheckedUnits = $.grep(this.units, this.proxy(function(item, idx){
        	return $.inArray(item.id, this.checkedIdArray) < 0;
        }));
    	if( this.checkedIdArray.length > 0 ){
	    	$ul = $('<ul class="list-group" id="'+this._id+'-project-ul">').appendTo(this.unitDiv);
			if( this.checkedIdArray.length > 1 ){
				$('<li class="list-group-item no" ><a class="clear-all" href="#" id="'+this._id+'-btn_clear">清除选择的内容</a></li>').appendTo($ul);	
			}
			this._drawItems(this.checkedUnitArray, $ul);
    	}
    	if( this.uncheckedRecentUnits.length > 0 ){
    		$ul = $('<ul class="list-group" id="'+this._id+'-project-ul-recentUnits">').appendTo(this.unitDiv);
            $('<h5 style="font-weight: bold;padding: 3px;padding: 0 0 0 10px;">最新安监机构</h5>').appendTo($ul);
			this._drawItems(this.uncheckedRecentUnits, $ul);
    	}
    	if( this.uncheckedUnits.length > 0 ){
    		$ul = $('<ul class="list-group" id="'+this._id+'-project-ul-units">').appendTo(this.unitDiv);
            $('<h5 style="font-weight: bold;padding: 3px;padding: 0 0 0 10px;">所有安监机构</h5>').appendTo($ul);
			this._drawItems(this.uncheckedUnits, $ul);
    	}
    	
        this.unitDiv.find("li.list-group-item:not(li.no)").eq(0).css({"background-color":"#ebf2f9"});
    },
    filter_getdata: function () {
    	this.setting.propvalue= this.checkedUnitArray;
    	this.setting.propshow = $.map(this.checkedUnitArray, function(item, idx){
    		return item.name;
    	}).join(",");
    	return this.setting;
    },
    filter_setdata:function(){
    	
    },
    destroy:function(){
    	if(this.filtersel){
    		this.filtersel.remove();
    	}
    	this.afterDestroy();
    	this._super();
    }
}, { usehtm: false, usei18n: false });
