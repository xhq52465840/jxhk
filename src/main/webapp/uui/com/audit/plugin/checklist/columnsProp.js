//@ sourceURL=com.audit.plugin.checklist.columnsProp
$.u.define('com.audit.plugin.checklist.columnsProp', null, {
	// copy from com.sms.search.columnsProp
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
    //checkbox
    on_checkbox_click: function(e){
    	var $this = $(e.currentTarget), data = {};
    	try{ 
    		data = $.parseJSON($this.attr("data-data")); 
        	if($this.is(":checked") && $.inArray(data.key, this.checkedIdArray) < 0){
        		this.checkedIdArray.push(data.key);
        		this.checkedArray.push(data);
        		this.uncheckedArray = $.grep(this.uncheckedArray, function(item, idx){ return item.key != data.key; });
        	}else{
        		this.uncheckedArray.push(data);
        		this.checkedIdArray.splice(this.checkedIdArray.indexOf(data.key), 1);//只删不加
        		this.checkedArray = $.grep(this.checkedArray, function(item, idx){ return item.key != data.key; });
        		//grep()方法用于数组元素过滤筛选 grep(array,callback,invert)
        		

        	}
    	}catch(e){}
    },
    //更新
    on_update_click:function(e){
    	e.preventDefault(); 
    	this.searchAds.val("");
 	   this.update(this.checkedArray, this._selectedType);
    },
    on_close_click:function(e){
    	e.preventDefault();
    	this.searchAds.val("");
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
		if(isChangeTab !== true){
			switch(type){
				case "DEFAULT": this.btnFilter.parent().addClass("disabled"); break;
				case "FILTER": this._filterData = $.extend(true, [], checked, true); break;
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
              type:"post",
              dataType: "json",
              cache: false,
              async:false,
              data: {
  				tokenid:$.cookie("tokenid"),
  				method:"getItemFields",
  			}
        }).done(this.proxy(function (response) {
        	this.fieldDiv.empty();
        	this.checkedArray = $.extend(true, [], checked, true) || [];		// 已显示的列
        	this.checkedIdArray = [];					// 被选中的id
        	this.uncheckedArray = [];				// 去掉选中的所有的字段集合
        	if (response.success) {
        		var $ul = null;
        		
        		this.checkedIdArray = $.map(this.checkedArray, function(item, idx){ return item.key; });
        		if(this.checkedArray.length){
        			$ul = $(this._ulTemplate.replace(/#\{id\}/g, this._id+"-project-ul")).appendTo(this.fieldDiv);
        			this._drawItem(this.checkedArray, "checked", $ul);
        		}

        		$.each(response.data.aaData, this.proxy(function(idx, item){
        			if(item.key){
        				if($.inArray(item.key, this.checkedIdArray) < 0){
            				this.uncheckedArray.push({ "key": item.key, "name": item.name, "propvalue": [], "propplugin": item.propplugin });
            			}
        			}
        			if(item.propid){
        				if($.inArray(item.key, this.checkedIdArray) < 0){
            				this.uncheckedArray.push({ "key": item.key, "name": item.name, "propvalue": [], "propplugin": item.propplugin });
            			}
        			}
        		})); 
                if(this.uncheckedArray.length){
                	$ul = $(this._ulTemplate.replace(/#\{id\}/g, this._id+"-project-ul-fields")).appendTo(this.fieldDiv);
                    this._drawItem(this.uncheckedArray, "", $ul);
                }
               // $("button.update").trigger("click");
                this.fieldDiv.find("li.list-group-item:not(li.default)").eq(0).css({"background-color":"#ebf2f9"});
            }
        })).fail(this.proxy(function (jqXHR, errorText, errorThrown) {

        }));
    },
    _setData: function(ads){
    	var $ul = null, htmls = "";
    	this.partData = this.checkedArray.concat(this.uncheckedArray);
    	
		$ul = $(this._ulTemplate.replace(/#\{id\}/g, "")).appendTo(this.fieldDiv);
    	$.each(this.partData, this.proxy(function(idx, item){
    		if( item.name.indexOf(ads) > -1){
				htmls = this._liTemplate.replace(/#\{data\}/g, JSON.stringify(item))
										.replace(/#\{propid\}/g, item.key)
										.replace(/#\{checked\}/g, $.inArray(item.key, this.checkedIdArray) > -1 ? "checked" : "" )
										.replace(/#\{propname\}/g, "<strong>" + item.name + "</strong>");
				$(htmls).appendTo($ul);				
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
    		var htmls = "";
	    	$.each(items, this.proxy(function(key,value){
	        	htmls = this._liTemplate.replace(/#\{data\}/g, JSON.stringify(value))
										.replace(/#\{propid\}/g, value.key)
										.replace(/#\{checked\}/g, checked )
										.replace(/#\{propname\}/g, value.name);
				$(htmls).appendTo(container);
	        }));
    	}
    },
    update:function(data,type){},
    close:function(){},
    destroy: function () {
        this._super();
    }
}, { usehtm: true, usei18n:true });


com.audit.plugin.checklist.columnsProp.widgetjs = [];
com.audit.plugin.checklist.columnsProp.widgetcss = [];