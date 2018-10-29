//@ sourceURL=com.sms.safelib.searchfile
$.u.define('com.sms.safelib.searchfile', null, {
    init: function (options) {
        this._options = options || {};
        this.listTemp = "<div >" +
						      // "<div class='headline-list' data-id='#{itemid}' data-type='#{itemtype}'>#{title}</div>" +
                            "<a href='#{url}'><h4 class='uui-font-sms-color' >#{title}</h4></a>" +
					        "<p>#{content}</p>" +
					        "<small>创建时间：#{createdtime}　更新时间：#{lastupdatetime}</small>" +
                        "</div>";	
        this._page = {
            size: 20,
            current: {
                activity: 1,
                directory: 1,
                dailySafetyWorkStatus: 1,
                hazards: 1,
                systemFlow: 1
            },
            total: {
                activity: 0,
                directory: 0,
                dailySafetyWorkStatus: 0,
                hazards: 0,
                systemFlow: 0
            }
        };
    },
    afterrender: function (bodystr) {
    	this.urlParam = $.urlParam();
    	if(!this.urlParam.wd){
    		window.location.href = this.getabsurl("ViewLibrary.html");
    	}
        this.qid("ads").text(this.urlParam.wd);
        this.qid("more").click( this.proxy(this.on_more_click) );

    	this.$.find(".search-results").on("click",".headline-list",this.proxy(this._toLib));
        this.qid("tabs").find("a[data-toggle=tab]").on("show.bs.tab",this.proxy(this.on_tabs_click));
        
        this.qid("tabs").find("a[href=#" + (this.urlParam.type || "directory") + "]").tab("show");
        
        
    },
    on_more_click: function(e){
        var idSelector = this.qid("tabs").find("li.open > a").attr("href"), params = {
            block: this.qid("more"),
            container: this.$.find(idSelector)
        };
        if(typeof this._page.current[idSelector.substr(1)] !== "undefined"){
            this._page.current[idSelector.substr(1)]++;
        }
        $.extend(true, params, this._buildSearchOptions(idSelector));
        this._getSearchData(params);
    },
    on_tabs_click: function(e){
        e.preventDefault();
        var $this = $(e.currentTarget), 
            idSelector = $this.attr("href"), 
            params = {
                block: this.$.find(idSelector),
                container: this.$.find(idSelector)
            };
        this.qid("more").addClass("hidden");
        $this.closest("li").siblings().removeClass("open");
        $this.closest("li").addClass("open");
        this.$.find(".search-results").addClass("hidden");
        params.container.removeClass("hidden");
        params.container.empty();
        $.each(this._page.current, this.proxy(function(key, value){
            this._page.current[key] = 1;
        }));
        $.extend(true, params, this._buildSearchOptions(idSelector));
        this._getSearchData(params);
        
    },
    _buildSearchOptions: function(idSelector){
        var params = {};
        if(idSelector === "#activity"){
            params.data = {
                "method": "fuzzySearchActivityInfos",
                "dataobject": "activity",
                "showPage": this._page.current.activity
            };
            params.type = "activity";
            params.callback = this.proxy(function(response){
                this._page.total.activity = response.totalCount;
                if( (this._page.size * this._page.current.activity) >= this._page.total.activity ){
                    this.qid("more").addClass("hidden");
                }
                else{
                    this.qid("more").removeClass("hidden");
                }
            });
        }
        else if(idSelector === "#directory"){
            params.data = {
                "method": "fuzzySearchDirectoryInfos",
                "dataobject": "directory",
                "showPage": this._page.current.directory
            };
            params.type = "directory";
            params.callback = this.proxy(function(response){
                this._page.total.directory = response.totalCount;
                if( (this._page.size * this._page.current.directory) >= this._page.total.directory ){
                    this.qid("more").addClass("hidden");
                }
                else{
                    this.qid("more").removeClass("hidden");
                }
            });
        }
        else if(idSelector === "#dailySafetyWorkStatus"){
            params.data = {
                "method": "fuzzySearchDailySafetyWorkStatusInfos",
                "dataobject": "dailySafetyWorkStatus",
                "showPage": this._page.current.dailySafetyWorkStatus
            };  
            params.type = "dailySafetyWorkStatus";
            params.callback = this.proxy(function(response){
                this._page.total.dailySafetyWorkStatus = response.totalCount;
                if( (this._page.size * this._page.current.dailySafetyWorkStatus) >= this._page.total.dailySafetyWorkStatus ){
                    this.qid("more").addClass("hidden");
                }
                else{
                    this.qid("more").removeClass("hidden");
                }
            });
        }        
        else if(idSelector === "#hazards"){
            params.data = {
                "method": "fuzzySearchRiskSourceSectionInfos",
                "dataobject": "directory",
                "showPage": this._page.current.hazards
            };  
            params.type = "hazards";
            params.callback = this.proxy(function(response){
                this._page.total.hazards = response.totalCount;
                if( (this._page.size * this._page.current.hazards) >= this._page.total.hazards ){
                    this.qid("more").addClass("hidden");
                }
                else{
                    this.qid("more").removeClass("hidden");
                }
            });
        }
        else if(idSelector === "#systemFlow"){
            params.data = {
                "method": "fuzzySearchRiskSourceDirectoryInfos",
                "dataobject": "directory",
                "showPage": this._page.current.systemFlow
            };  
            params.type = "directory";
            params.callback = this.proxy(function(response){
                this._page.total.systemFlow = response.totalCount;
                if( (this._page.size * this._page.current.systemFlow) >= this._page.total.systemFlow ){
                    this.qid("more").addClass("hidden");
                }
                else{
                    this.qid("more").removeClass("hidden");
                }
            });
        }
        return params;
    },
    _getSearchData:function(param){
    	$.u.ajax({
        	url: $.u.config.constant.smsqueryserver,
            type: "post",
            dataType: "json",
            cache: false,
            "data": $.extend(true, {
            	"tokenid": $.cookie("tokenid"),
				"searchKey": this.urlParam.wd,
				"row": this._page.size.toString()
            }, param.data)
        }, param.block).done(this.proxy(function(response){
        	if(response.success){
                param.callback(response);
        		if(response.data.length > 0){
        			$.each(response.data, this.proxy(function(idx,item){
            			var temp = this.listTemp.replace(/#\{url\}/g, this._getUrl(item.id, param.type))
                                                .replace(/#\{title\}/g, item.title)
            									.replace(/#\{content\}/g, item.content)
            									.replace(/#\{createdtime\}/g, item.created)
            									.replace(/#\{lastupdatetime\}/g, item.lastupdate);
            			$(temp).appendTo(param.container);
            		}));
        		}
                else{
        			$('<div class="no-result text-center">抱歉未找到记录</div>').appendTo(param.container);
        		}
        	}
        })).fail(this.proxy(function(jqXHR,errorText,errorThrown){
        	
        }));
    },
    _getUrl:function(id, type){
        var href = '#';
    	if($.inArray(type, ["directory", "hazards", "systemFlow"]) > -1){
    		href = this.getabsurl("ViewLibrary.html?id=" + id);
    	}
        else if("activity" == type){
    		href = this.getabsurl("../search/activity.html?activityId=" + id);
    	}
        else if("dailySafetyWorkStatus" == type){
    		href = this.getabsurl("ViewSafeReview.html?id=" + id);
    	}
        return href;
    },
    destroy: function () {
        this._super();
    }
}, { usehtm: true, usei18n: false });

com.sms.safelib.searchfile.widgetjs = ["../../../uui/widget/jqurl/jqurl.js","../../../uui/widget/spin/spin.js",
                                       "../../../uui/widget/jqblockui/jquery.blockUI.js",
                                       "../../../uui/widget/ajax/layoutajax.js"];
com.sms.safelib.searchfile.widgetcss = [];