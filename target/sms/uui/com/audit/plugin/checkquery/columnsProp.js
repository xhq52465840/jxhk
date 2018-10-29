//@ sourceURL=com.audit.plugin.checkquery.columnsProp
$.u.define('com.audit.plugin.checkquery.columnsProp', null, {
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
        	if($this.is(":checked") && $.inArray(data.propid, this.checkedIdArray) < 0){
        		this.checkedIdArray.push(data.propid);
        		this.checkedArray.push(data);
        		this.uncheckedArray = $.grep(this.uncheckedArray, function(item, idx){ 
        			return item.propid != data.propid; });
        	}else{
        		this.uncheckedArray.push(data);
        		this.checkedIdArray.splice(this.checkedIdArray.indexOf(data.propid), 1);//只删不加
        		this.checkedArray = $.grep(this.checkedArray, function(item, idx){
        			return item.propid != data.propid; });
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
		/*if($.jStorage.get("userColumns")){
			this._defaultData = $.extend(true, {}, $.jStorage.get("userColumns"), true);
		}*/
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
		
    	/*$.ajax({
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
                $("button.update").trigger("click");
                this.fieldDiv.find("li.list-group-item:not(li.default)").eq(0).css({"background-color":"#ebf2f9"});
            }
        })).fail(this.proxy(function (jqXHR, errorText, errorThrown) {

        }));*/
		

    	this._ajax("checksheetfilter.json", {}, this.$, {}, this.proxy(function(result){
    		if(result.success){
    			this._userFilter = result.data;
        		//this._userFilter.dynamicfilters= $.extend(true,[],this._userFilter.columns , true);

                this.fieldDiv.empty();
              	this.checkedArray = $.extend(true, [], checked, true) || [];		// 已显示的列
              	this.checkedIdArray = [];					// 被选中的id
              	this.uncheckedArray = [];				// 去掉选中的所有的字段集合
              	if (this._userFilter.columns) {
              		var $ul = null;
              		this.checkedIdArray = $.map(this.checkedArray, function(item, idx){ return item.propid; });
              		if(this.checkedArray.length){
              			$ul = $(this._ulTemplate.replace(/#\{id\}/g, this._id+"-project-ul")).appendTo(this.fieldDiv);
              			this._drawItem(this.checkedArray, "checked", $ul);
              		}
              		$.each(this._userFilter.columns, this.proxy(function(idx, item){
              			if(item.key){
              				if($.inArray(item.key, this.checkedIdArray) < 0){
                  				this.uncheckedArray.push({ "key": item.key, "name": item.name, "propvalue": [], "propplugin": item.propplugin });
                  			}
              			}
              			if(item.propid){
              				if($.inArray(item.propid, this.checkedIdArray) < 0){
                  				this.uncheckedArray.push({ "propid": item.propid, "propname": item.propname, "propvalue": [], "propplugin": item.propplugin });
                  			}
              			}
              		})); 
                      if(this.uncheckedArray.length){
                      	$ul = $(this._ulTemplate.replace(/#\{id\}/g, this._id+"-project-ul-fields")).appendTo(this.fieldDiv);
                          this._drawItem(this.uncheckedArray, "", $ul);
                      }
                      $("button.update").trigger("click");
                      this.fieldDiv.find("li.list-group-item:not(li.default)").eq(0).css({"background-color":"#ebf2f9"});
                  }
                
    		}
    	}));
	
		
    },
    //匹配搜索
    _setData: function(ads){
    	var $ul = null, htmls = "";
    	this.partData = this.checkedArray.concat(this.uncheckedArray);
    	
		$ul = $(this._ulTemplate.replace(/#\{id\}/g, "")).appendTo(this.fieldDiv);
    	$.each(this.partData, this.proxy(function(idx, item){
    		if( item.propname.indexOf(ads) > -1){
				htmls = this._liTemplate.replace(/#\{data\}/g, JSON.stringify(item))
										.replace(/#\{propid\}/g, item.propid)
										.replace(/#\{checked\}/g, $.inArray(item.propid, this.checkedIdArray) > -1 ? "checked" : "" )
										.replace(/#\{propname\}/g, "<strong>" + item.propname + "</strong>");
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
										.replace(/#\{propid\}/g, value.propid)
										.replace(/#\{checked\}/g, checked )
										.replace(/#\{propname\}/g, value.propname);
				$(htmls).appendTo(container);
	        }));
    	}
    },
    
    /**
     * @title ajax
     * @param url {string} url
     * @param param {object} ajax param
     * @param $container {jQuery object} the object for block
     * @param blockParam {object} blockui param
     * @param callback {function} callback
     */
    _ajax:function(url,param,$container,blockParam,callback){
    
    	$.u.ajax({
    		"url":url,
    		"type": url.indexOf(".json") > -1 ? "get" : "post" ,
    		"data":$.cookie("tokenid") ? $.extend({"tokenid":$.parseJSON($.cookie("tokenid"))},param) : $.extend({"tokenid":$.parseJSON($.cookie("uskyuser")).tokenid},param),
    		"dataType":"json"
    	},$container,$.extend({},blockParam)).done(this.proxy(function(response){
    		if (response.success) {
    			callback && callback(response);
    		}   		
    	})).fail(this.proxy(function(jqXHR,responseText,responseThrown){
    		
    	}));
    },
    
    
    
    update:function(data,type){},
    close:function(){},
    destroy: function () {
        this._super();
    }
}, { usehtm: true, usei18n:true });


com.audit.plugin.checkquery.columnsProp.widgetjs = [];
com.audit.plugin.checkquery.columnsProp.widgetcss = [];