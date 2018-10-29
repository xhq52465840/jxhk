//@ sourceURL=com.sms.filter.filterNav
$.u.define('com.sms.filter.filterNav', null, {
    init: function (options) {
        this._options = options || null;
        this.params = $.urlParam(window.location.href, "#");
        if(!this.params.filterId){
        	this.params = $.urlParam(window.location.href, "?");
        }
        this._filterTemplate = '<li>'
        					   + '<a class="filter-link cursor" data-id="#{id}" title="#{name}">#{name}</a>'
//							   + '<div class="btn-group operate  pull-right hidden" style="position: absolute;right: 7px;top: 7px;z-index: 1;">'
        					   + '<div class="dropdown hidden pull-right" style="display:inline-block;margin-top:-25px;">'
							   +	'<a href="#" class="dropdown-toggle " data-toggle="dropdown"><span class="glyphicon glyphicon-collapse-down"></span></a>'
							   +	'<ul class="dropdown-menu" style="z-index:9999999" role="menu">'
							   +		'<li><a class="rename cursor" data-id="#{id}" data-name="#{name}">重命名</a></li>'
							   +		'<li><a class="copy cursor" data-id="#{id}" data-name="#{name}">复制</a></li>'
							   +		'<li><a class="remove cursor" data-id="#{id}" data-name="#{name}">从收藏中移除</a></li>'
							   +		'<li><a class="delete cursor" data-id="#{id}" data-name="#{name}">删除</a></li>'
							   +	'</ul>'
							   + '</div>'
							   +'</li>';
    },
    afterrender: function (bodystr) {
    	this.filter = this.qid("ul-filter");
    	this.loadFilter();
    	this.qid("link-createfilter").click(this.proxy(this.on_createFilter_click));
    	this.$.find(".filter-list").on("click", "a.filter-link", this.proxy(this.on_filterLink_click)); 
        this.filter.on("mouseenter mouseleave", "li", this.proxy(this.on_filterLi_mouse));
    	this.filter.on("click", "a.dropdown-toggle", this.proxy(this.on_filterDropToggle_click));        
    	this.filter.on("click","a.rename", this.proxy(this.on_rightMenuRename_click));    	
    	this.filter.on("click","a.remove", this.proxy(this.on_rightMenuRemove_click));    	
    	this.filter.on("click","a.delete", this.proxy(this.on_rightMenuDelete_click));    	
    	this.filter.on("click","a.copy", this.proxy(this.on_rightMenuCopy_click));    	
    },
    /**
     * 清楚过滤器
     */
    on_createFilter_click: function(e){
    	window.location.hash = "";
		window.location.reload();
    },
    /**
     * 过滤器的点击事件
     */
    on_filterLink_click: function(e){
    	e.preventDefault();
		var $a = $(e.currentTarget);
		this.$.find("a.filter-link.active").removeClass("active");
		this.filter.children("li.open").removeClass("open").find(".dropdown").addClass("hidden");
		$a.addClass("active");
		window.location.hash = "#filterId=" + $a.attr("data-id");
		this.loadFilterByUrl();
    },
    /**
     * 过滤器右侧小图标的点击事件
     */
    on_filterDropToggle_click: function(e){
    	var $this = $(e.currentTarget);
		this.filter.children("li").removeClass("open");
		this.filter.find(".dropdown").not($this.closest(".dropdown")).addClass("hidden");
		$this.closest("li").addClass("open");
    },
    /**
     * 过滤器的鼠标事件
     */
    on_filterLi_mouse: function(e){
    	var $this = $(e.currentTarget), $dropdown = $this.find(".dropdown");
    	this.filter.children("li:not(.open)").not($this).find(".dropdown").addClass("hidden");
    	if(!$dropdown.hasClass("open") && e.type == "mouseenter") {
    		$dropdown.removeClass("hidden");
    	} else if (!$dropdown.hasClass("open") && e.type == "mouseleave") {
    		$dropdown.addClass("hidden");
    	}
    	this.filter.children("li").not($this).removeClass("hover");
    	$this.toggleClass("hover");
    },
    on_rightMenuRename_click: function(e){
    	e.preventDefault();
		var name = $(e.currentTarget).attr("data-name"), id = $(e.currentTarget).attr("data-id");
    	if(this.filterDialog && "destroy" in this.filterDialog){
    		this.filterDialog.destroy();
    	}
    	$.u.load("com.sms.common.stdComponentOperate");
    	this.filterDialog = new com.sms.common.stdComponentOperate($("div[umid='filterDialog']",this.$),{
        	"title":"重命名过滤器:",
    		"dataobject":"filtermanager",
    		"fields":[
	          {name:"name",label:"过滤器名称",maxlength:50,type:"text",description:"",rule:{required:true},message:"过滤器名称不能为空"}
	        ],
	        "afterEdit":this.proxy(function(comp, formdata, response){
	        	if(response.success){
	        		$(e.currentTarget).closest(".dropdown").prev().text(formdata.name);
	        	}
	        })
        });
    	this.filterDialog.open({
    		"data":{"id":id,"name":name},
    		"title":"重命名过滤器:"+name
    	});
    },
    on_rightMenuRemove_click: function(e){
    	e.preventDefault();
		var name = $(e.currentTarget).attr("data-name"), id = $(e.currentTarget).attr("data-id");
		this.removeFilter(id);
    },
    on_rightMenuDelete_click: function(e){
    	e.preventDefault();
		 var name = $(e.currentTarget).attr("data-name"), id = $(e.currentTarget).attr("data-id");
		 $.u.load("com.sms.common.stdcomponentdelete");
		 (new com.sms.common.stdcomponentdelete({
            body: "<div>" +
				 	"<p>你确定要删除过滤器<strong>"+name+"</strong>吗？</p>" +
				 "</div>",
            title: "删除过滤器:"+name,
            dataobject: "filtermanager",
            dataobjectids: JSON.stringify([parseInt(id)])
        })).override({
            refreshDataTable: this.proxy(function () {
           	 this.loadFilter();
            })
        });
    },
    on_rightMenuCopy_click: function(e){
    	e.preventDefault();
		var name = $(e.currentTarget).attr("data-name"), id = $(e.currentTarget).attr("data-id");
    	if(this.filterDialogCopy && "destroy" in this.filterDialogCopy){
    		this.filterDialogCopy.destroy();
    	}
    	$.u.load("com.sms.common.stdComponentOperate");
    	this.filterDialogCopy = new com.sms.common.stdComponentOperate($("div[umid='filterDialogCopy']",this.$),{
        	"title":"复制过滤器:",
    		"dataobject":"filtermanager",
    		"fields":[
	          {name:"name",label:"过滤器名称",maxlength:50,type:"text",description:"",rule:{required:true},message:"过滤器名称不能为空"}
	        ]
	       
        });
    	this.filterDialogCopy.open({"data":{"id":id,"name":name},
    		"title":"复制过滤器:"+name,"operate":"COPY",method:"copyFiltermanager",
    		 "afterCopy":this.proxy(function(comp,formdata,response){
 	        	if(response.success){
 	        		this.loadFilter();
 	        	}
 	        })
    	});
    },
    /*
     * 加载收藏的过滤器
     * @param {int} filterId 指定被选中的过滤器ID
     */
    loadFilter:function(filterId){ 
    	$.u.ajax({
        	url: $.u.config.constant.smsqueryserver,
            type: "post",
            dataType: "json",
            data: {
            	"tokenid": $.cookie("tokenid"),
                "method": "getFilter",
                "type": "F",
                "dataobject": "filtermanager"
            }
        },this.filter.parent()).done(this.proxy(function(response){
        	if(response.success){
        		this._drawFilterList(response.data.aaData, filterId);     		
        	}
        })).fail(this.proxy(function(jqXHR,errorText,errorThrown){
        	
        }));
    },
    removeFilter:function(id, refresh){
        $.ajax({
            url: $.u.config.constant.smsmodifyserver,
            type: "post",
            dataType: "json",
            data: {
                "tokenid": $.cookie("tokenid"),
                "method": "favorFiltermanager",
                "filtermanagerId": id,
                "charnelThose": "0"
            }
        }).done(this.proxy(function (result) {
            if (result.success) {
               this.loadFilter();
               if(refresh){
            	   window.location.hash = "";
           		   window.location.reload();
               }
            }
        })).fail(this.proxy(function (jqXHR, errorText, errorThrown) {

        }));	
    },
    _drawFilterList: function(data, filterId){ 
    	this.filter.empty(); 
		if(data.length > 0){
			$.each(data, this.proxy(function(idx,item){
				$(this._filterTemplate.replace(/#\{id\}/g, item.id).replace(/#\{name\}/g, item.name)).appendTo(this.filter);
    		}));
		}
        else{
			$('<p style="height: 27px;box-sizing: border-box;min-height: 400px;overflow: auto;padding: 1px;margin: 10px -1px 0;">您还没有收藏任何过滤器。</p>').appendTo(this.filter);
		}  

		if(filterId){
			this.$.find("a.filter-link[data-id=" + filterId + "]").trigger("click");	
		}
        else if(this.params && this.params.filterId){
            var $selectedLink = this.$.find("a.filter-link[data-id=" + this.params.filterId + "]");
            if($selectedLink.length > 0){
                $selectedLink.trigger("click"); 
            }
            else{
                this.loadFilterByUrl();
            }
        }
        else if($.urlParam().filterRule){
            this.loadFilterByUrl();
        }
    },
    /**
     * @title 加载过滤器通过url(被重写)
     */
    loadFilterByUrl: function(){},
    destroy: function () {
        this._super();
    }
}, { usehtm: true, usei18n: false });

com.sms.filter.filterNav.widgetjs = ["../../../uui/widget/jqurl/jqurl.js",
                                     "../../../uui/widget/spin/spin.js", 
                                     "../../../uui/widget/jqblockui/jquery.blockUI.js",
                                     "../../../uui/widget/ajax/layoutajax.js"];
com.sms.filter.filterNav.widgetcss = [];