//@ sourceURL=com.sms.search.columnsProp
$.u.define('com.sms.search.columnsProp', null, {
    init: function (options) {
        this._options = options || {};
		this._ulTemplate = '<ul class="list-group" id="#{id}" style="border-bottom: 1px solid #ccc;padding-bottom: 5px;margin-bottom:5px;">'
        				   		//+'<li class="list-group-item default hidden" ><a class="default btn-restore hidden" href="#" >恢复缺省值</a></li>'
        					+'</ul>';
		this._liTemplate = '<li class="list-group-item" >'
        						+'<div class="checkbox" style="margin: 0;">'
        							+'<label style="width:100%;">'
        								+'<input type="checkbox" data-data = \'#{data}\' value="#{propid}" #{checked} />'
        								+'<span>#{propname}</span>'
        							+'</label>'
        						+'</div>'
        					+'</li>';
        this._type = null;				// 类型（DEFAULT、FILTER、SYSTEM）
        this._selectedType = null;		// 当前选择的类型（DEFAULT、FILTER、SYSTEM）
        this._defaultData = null;		// DEFAULT的列数据
        this._filterData = null;		// FILTER的列数据
    },
    afterrender: function (bodystr) {
    	this.buttonDiv = this.qid("button_div");			// 按钮容器
    	this.fieldDiv = this.qid("field_div");				// 字段列表容器
        this.searchAds = this.qid("input_search");			// 搜索框
        this.btnMyDefault = this.qid("btn_mydefault");		// “我的默认”按钮
        this.btnFilter = this.qid("btn_filter");			// “过滤器”按钮
        this.btnSystem = this.qid("btn_system");			// “系统”按钮

        this.buttonDiv.on("click", ":radio", this.proxy(this.on_change_click));
        this.fieldDiv.on("mouseenter", "li.list-group-item:not(li.default)", this.proxy(this.on_item_mouseenter));
        this.searchAds.off("keyup").on("keyup", this.proxy(this.on_search_keyup));        
        this.$.off("click", "button.update").on("click", "button.update", this.proxy(this.on_update_click));
        this.$.off("click", "button.closed").on("click", "button.closed", this.proxy(this.on_close_click));
        this.$.off("click", "a.btn-restore").on("click", "a.btn-restore", this.proxy(this.on_restore_click));
        this.$.off("click", ":checkbox").on("click", ":checkbox", this.proxy(this.on_checkbox_click));
    },
    on_change_click:function(e){
    	var $this = $(e.currentTarget), type = $this.val().toUpperCase();
    	this.searchAds.val("");
    	$this.prop("checked", true).parent().addClass("active").siblings().removeClass("active");
    	switch(type){
    		case "DEFAULT": this._loadData(this._defaultData, this._type, "DEFAULT", true);  break;
    		case "FILTER": this._loadData(this._filterData, this._type, "FILTER", true); break;
    		// no default
    	}
    },
    on_item_mouseenter:function(e){
    	this.fieldDiv.find("li.list-group-item").css({"background-color":"#fff"});
    	$(e.currentTarget).css({"background-color":"#ebf2f9"});
    },
    on_search_keyup:function(e){
    	this.fieldDiv.empty();
    	var ads = $.trim(this.searchAds.val());
    	if(ads){
		    this._setData(ads);
	    }else{
		    this._setAllData();
	    }
    },
    on_restore_click: function(e){
    	e.preventDefault();
    	this._loadData(this._defaultData, "DEFAULT");
    },
    on_checkbox_click: function(e){
    	var $this = $(e.currentTarget), data = {};
    	try{
    		data = $.parseJSON($this.attr("data-data")); 
        	if($this.is(":checked") && $.inArray(data.propid, this.tempCheckedIdArray) < 0){
                if(this.tempCheckedIdArray.length > 30){
                	alert('最多只能显示30列');
                	$this.prop('checked', false);
                	return;
                }
        		this.tempCheckedIdArray.push(data.propid);
                this.tempCheckedArray.push(data);
                this.tempUncheckedArray = $.grep(this.tempUncheckedArray, function(item, idx){ return item.propid != data.propid; });
        		
                // this.checkedIdArray.push(data.propid);
        		// this.checkedArray.push(data);
        		// this.uncheckedArray = $.grep(this.uncheckedArray, function(item, idx){ return item.propid != data.propid; });
        	}
            else{
                this.tempUncheckedArray.push(data);
                this.tempCheckedIdArray.splice(this.tempCheckedIdArray.indexOf(data.propid), 1);
                this.tempCheckedArray = $.grep(this.tempCheckedArray, function(item, idx){ return item.propid != data.propid; });
        		// this.uncheckedArray.push(data);
        		// this.checkedIdArray.splice(this.checkedIdArray.indexOf(data.propid), 1);
        		// this.checkedArray = $.grep(this.checkedArray, function(item, idx){ return item.propid != data.propid; });
        	}
    	}catch(e){
            console.error(e.name + ": " + e.message);
        }
    },
    on_update_click:function(e){
    	e.preventDefault(); 
        this.searchAds.val("");
        this.checkedArray = $.extend([], this.tempCheckedArray);
        this.checkedIdArray = $.extend([], this.tempCheckedIdArray);
        this.uncheckedArray = $.extend([], this.tempUncheckedArray);
        this.searchAds.trigger("keyup");
        this.fieldDiv.scrollTop(0);
 	    this.update(this.checkedArray, this._selectedType);
    },
    on_close_click:function(e){
    	e.preventDefault();
    	this.searchAds.val("");
        this.tempCheckedArray = $.extend([], this.checkedArray);
        this.tempCheckedIdArray = $.extend([], this.checkedIdArray);
        this.tempUncheckedArray = $.extend([], this.uncheckedArray);
        this.searchAds.trigger("keyup");
        this.fieldDiv.scrollTop(0);
 	    this.close();
    },
    /**
     * @title 加载字段
     * @param checked {Array} 选中字段
     * @param type {string} DEFAULT/FILTER/SYSTEM
     * @param selected {string} DEFAULT/FILTER/SYSTEM 
     * @param isChangeTab {bool} 内部切换tab
     * @return void
     */
    _loadData:function(checked, type, selected, isChangeTab){ 
		this._type = type;
		this._selectedType = selected;
		this.buttonDiv.children().removeClass("active disabled");
		if($.jStorage.get("userColumns")){
			this._defaultData = $.extend({}, $.jStorage.get("userColumns"));
		}
		if(isChangeTab !== true){
			switch(type){
				case "DEFAULT": this.btnFilter.parent().addClass("disabled"); break;
				case "FILTER": this._filterData = $.extend([], checked); break;
				case "SYSTEM": break;
			}
		}
		switch(selected){
			case "DEFAULT": this.btnMyDefault.parent().addClass("active"); break;
			case "FILTER": this.btnFilter.parent().addClass("active"); break;
			case "SYSTEM": break;
		}   	
		
    	$.ajax({
            url: $.u.config.constant.smsqueryserver,
            dataType: "json",
            data: {
        		"tokenid":$.cookie("tokenid"),
        		"method":"getAllDisplayFields"
        	}
        }).done(this.proxy(function (response) {
        	this.fieldDiv.empty();
        	this.checkedArray = $.extend([], checked) || [];		// 已显示的列
        	this.checkedIdArray = [];				// 被选中的id
        	this.uncheckedArray = [];				// 去掉选中的所有的字段集合
            this.tempCheckedArray = $.extend([], checked) || [];
            this.tempCheckedIdArray = [];
            this.tempUncheckedArray = [];
        	if (response.success) {
        		var $ul = null;
        		
        		this.checkedIdArray = $.map(this.checkedArray, function(item, idx){ return item.propid; });
                this.tempCheckedIdArray = $.map(this.tempCheckedArray, function(item, idx){ return item.propid; });
        		if(this.checkedArray.length){
        			$ul = $(this._ulTemplate.replace(/#\{id\}/g, this._id+"-project-ul")).appendTo(this.fieldDiv);
        			this._drawItem(this.checkedArray, "checked", $ul);
        		}

        		$.each(response.data.aaData, this.proxy(function(idx, item){
        			if($.inArray(item.key, this.checkedIdArray) < 0){
        				this.uncheckedArray.push({ "propid": item.key, "propname": item.name, "propvalue": [], "propplugin": item.renderer });
                        this.tempUncheckedArray.push({ "propid": item.key, "propname": item.name, "propvalue": [], "propplugin": item.renderer });
        			}
        		})); 
                if(this.uncheckedArray.length){
                	$ul = $(this._ulTemplate.replace(/#\{id\}/g, this._id+"-project-ul-fields")).appendTo(this.fieldDiv);
                    this._drawItem(this.uncheckedArray, "", $ul);
                }
               
                this.fieldDiv.find("li.list-group-item:not(li.default)").eq(0).css({"background-color":"#ebf2f9"});
            }
        })).fail(this.proxy(function (jqXHR, errorText, errorThrown) {

        }));
    },
    _setData: function(ads){
    	var $ul = null, htmls = "", $li = null;
    	this.partData = this.checkedArray.concat(this.uncheckedArray);
    	
		$ul = $(this._ulTemplate.replace(/#\{id\}/g, "")).appendTo(this.fieldDiv);
    	$.each(this.partData, this.proxy(function(idx, item){
    		if( item.propname.indexOf(ads) > -1){
				htmls = this._liTemplate.replace(/#\{data\}/g, JSON.stringify(item))
										.replace(/#\{propid\}/g, item.propid)
										.replace(/#\{checked\}/g, $.inArray(item.propid, this.checkedIdArray) > -1 ? "checked" : "" )
										.replace(/#\{propname\}/g, "<strong>" + item.propname + "</strong>");
                $li = $(htmls).appendTo($ul);				
                if(item.propid === "keyword"){
                    $li.addClass("hidden");
                }
    		}
    	}));
		if($('ul',this.fieldDiv).children().length < 1){
			$('<li  class="list-group-item" style="font-style: italic;">没有匹配的</li>').appendTo(this.fieldDiv);
		}

        this.fieldDiv.find("li.list-group-item:not(li.default)").eq(0).css({"background-color":"#ebf2f9"});
    },
    _setAllData: function(){
    	var $ul = null;
    	if(this.checkedArray.length>0){
			$ul = $(this._ulTemplate.replace(/#\{id\}/g, this._id + "-project-ul")).appendTo(this.fieldDiv);
			this._drawItem(this.checkedArray, "checked", $ul);
		}
    	
    	if(this.uncheckedArray.length > 0 ){
        	$ul = $(this._ulTemplate.replace(/#\{id\}/g, this._id + "-project-ul-units")).appendTo(this.fieldDiv);
            this._drawItem(this.uncheckedArray, "", $ul);
        }

        this.fieldDiv.find("li.list-group-item:not(li.default)").eq(0).css({"background-color":"#ebf2f9"});        
    },
    /**
     * @title 绘制字段
     * @param items {Array} 字段集合
     * @param checked {string} 是否选中 checked or ""
     * @param container {jQuery object} 父容器 
     */
    _drawItem: function(items, checked, container){
    	if(items && container){
    		var htmls = "", $obj = null;
	    	$.each(items, this.proxy(function(key,value){
	        	htmls = this._liTemplate.replace(/#\{data\}/g, JSON.stringify(value))
										.replace(/#\{propid\}/g, value.propid)
										.replace(/#\{checked\}/g, checked )
										.replace(/#\{propname\}/g, value.propname);
				$obj = $(htmls).appendTo(container);
                if(value.propid === "keyword"){
                    $obj.addClass("hidden");
                }
	        }));
    	}
    },
    update:function(data,type){},
    close:function(){},
    destroy: function () {
        this._super();
    }
}, { usehtm: true, usei18n: true });


com.sms.search.columnsProp.widgetjs = [];
com.sms.search.columnsProp.widgetcss = [];