function showUserInformantion(id){
	window.open("/sms/uui/com/sms/ViewProfile.html?id="+id);	
}
$.u.define('com.losa.log.losaOperateLog', null, {
	 init: function (options) {
		 
		 this._headertemplate = "<div class='date-header'>#{daterule}</div>";
	        this._activityitemtemplate = "<div class='activity-item #{grouped}'>" +
	                    "<span class='user-icon'><a href='"+this.getabsurl("../../sms/ViewProfile.html?id=#{userid}")+"'><img alt='#{fullname}' title='#{fullname}' src='#{avatar}' width='48' height='48'></a></span>" +
	                        "<div class='activity-item-summary'>" +
	                            "<a href='"+this.getabsurl("../../sms/ViewProfile.html?id=#{userid}")+"' class='activity-item-user activity-item-author' style='font-weight:bolder;' data-username='#{username}'>#{fullname}</a>#{operationPrefix}&nbsp;<a href='"+this.getabsurl("../search/activity.html?activityId=#{activityId}")+"' target='_parent'><span class='#{activityResolved}'>#{unitKey}-#{activityNum}</span> - #{activityName}</a>&nbsp;#{operationSuffix}" +
	                                "<div class='activity-item-description'>" +
	                                    "#{descriptionhtml}" +
	                                "</div>" +
	                        "</div>" +
	                    "<div class='activity-item-info'>" +
	                        "<img class='icon' height='16' width='16' alt='#{activityTypeName}' src='#{activityTypeUrl}' title='#{activityTypeName}'><a href='"+this.getabsurl("../search/activity.html?activityId=#{activityId}")+"' class='timestamp' title='#{date}' target='_parent'>#{timeinfo}</a><div class='activity-item-actions'><span class='activity-item-action'><a href='#' class='activity-item-comment-link hidden'>备注</a></span><span class='activity-item-action #{vote}'><a href='#' class='activity-item-issue-vote-link'>投票</a><span class='activity-item-issue-vote-label hidden'>投票</span></span><span class='activity-item-action #{watch}'><a href='#' class='activity-item-issue-watch-link'>关注</a><span class='activity-item-issue-watch-label hidden'>关注</span></span></div>" +
	                        "<div class='activity-item-action-status-container hidden'></div>" +
	                    "</div>" +
	                    "<div class='clearer'></div>" +
	                "</div>";
	        this._formtemplate = "<form class='activity-item-comment-form ready'><fieldset><textarea cols='40' rows='6' maxlength='2000' name='comment'></textarea></fieldset><div class='submit'><button class='comment-submit btn btn-default' type='submit'>添加</button><button class='comment-cancel btn btn-link'>取消</button></div></form>";

	        this._options = options || {};
	        this._start = 0;
	        this._options.count&&(this._options.count = parseInt(this._options.count));
	        this._options.count = this._options.count || 10;
	        this._options.rules = this._options.rules || [];
	        this._options.autorefresh = this._options.autorefresh || false;
	        this._options.autorefreshminiute = this._options.autorefreshminiute || 15;
	        this._countadd = null;
	        this._timeouthandler = null;
	        this._options.manual=true;
	 },
	 reload: function (id) {
	        this.qid("logStream").empty();
	        this._start = 0;
	        this._queryTable(id);
	    },
	 afterrender: function (bodystr) {
//		 debugger
		 this._countadd = this._options.count;
	        if(this._options.manual !== true){	// 第一次需要手动触发加载
	        	this._queryTable(this._options.targetId);
	        }
		  this.qid("showMoreLog").unbind("click").click(this.proxy(this.on_showmore_click));

	      this.qid("logStream").off("click", ".activity-item-issue-vote-link").on("click", ".activity-item-issue-vote-link", this.proxy(this.on_vote_link_click));
	      this.qid("logStream").off("click", ".activity-item-issue-watch-link").on("click", ".activity-item-issue-watch-link", this.proxy(this.on_watch_link_click));
	      this.startrefresh();
	 },
	 startrefresh: function () {
	        if (this._options.autorefresh) {
	            if (this._timeouthandler) {
	                clearTimeout(this._timeouthandler);
	            }
	            this._timeouthandler = setTimeout(this.proxy(this.reload), this._options.autorefreshminiute * 60 * 1000);
	        }
	    },
	    on_vote_link_click: function (e) {
	        e.preventDefault();
	        // TODO : ajax
	        var $vote = $(e.currentTarget);
	        $vote.hide();
	        $vote.next().removeClass("hidden");
	        var linedata = $vote.closest(".activity-item").data("activitylogdata");
	    },
	    on_watch_link_click: function (e) {
	        e.preventDefault();
	        // TODO : ajax
	        var $watch = $(e.currentTarget);
	        $watch.hide();
	        $watch.next().removeClass("hidden");
	        var watchdata = $vote.closest(".activity-item").data("activitylogdata");

	    },
	    on_showmore_click: function (e) {
//	    	debugger
	        e.preventDefault();
	        this._queryTable(this._options.targetId);
	    },
	    
	 _queryTable:function(id){
		// this.qid("logStream").empty();
	        $.u.ajax({
	        	 url: $.u.config.constant.smsqueryserver,
	             type: "post",
	             dataType: "json",
	             cache: false,
	             data: {
	                 "tokenid": $.cookie("tokenid"),
	                 "method":"stdcomponent.getbysearch",
	         		"dataobject":"losaOperateLog",
	                 "start": this._start,
	                 "length": this._countadd,
	         		"columns":JSON.stringify([{"data":"created"}]),
	         		"order":JSON.stringify([{"column":0,"dir":"desc"}]),
	                "rule": JSON.stringify([[{"key":"targetId","value":parseInt(id)}]])
	             }
	        },(this.qid("showMoreLog").is(":visible") ? this.qid("showMoreLog") : this.$), {size:2 , backgroundColor:"#fff"}).done(this.proxy(function (result) {
//	        	debugger
	        	if (result.success) {
	                var prevdate = this.qid("logStream").children(".date-header:last").text();
	                var preperson = prevdate ? this.qid("logStream").find(".activity-item-author:last").attr("data-username") : null;
	                $.each(result.data.aaData, this.proxy(function (idx, adata) {
	                    var datenew = (adata.date&&this._pastdatetitlerule(adata.date))||null;
//	                     debugger;
	                    if (datenew != prevdate) {
	                        prevdate = datenew;
	                        this.qid("logStream").append(this._headertemplate.replace(/#\{daterule\}/g, prevdate));
	                        preperson = null; // 重置人
	                    }
	                    var timeinfo = this._pastdaterule(adata.date);
	                    var activityResolved = "", watch = "", vote = "", descriptionhtml = "", grouped = "";
	                    if (adata.activityResolved) {
	                        activityResolved = "resolved-link";
	                    }
	                    if (!adata.watch) {
	                        watch = "hidden";
	                    }
	                    if (!adata.vote) {
	                        vote = "hidden";
	                    }
	                    var newperson = adata.username;
	                    if (preperson == newperson) {
	                        grouped = "activity-item-grouped";
	                    }
	                    else {
	                        preperson = newperson;
	                    }
	                   
	                    	
	                        descriptionhtml += "<blockquote><p>" + adata.detail + "</p></blockquote>";
	                    
	                  
	                    var $_html = "<div class='activity-item #{grouped}'><span class='user-icon'><a href='#' onclick='showUserInformantion(#{userid})'><img alt='#{fullname}' title='#{fullname}' src='#{avatar}' width='48' height='48'></a></span><div class='activity-item-summary'><a  onclick='showUserInformantion(#{userid})' href='#' class='activity-item-user activity-item-author' style='font-weight:bolder;' data-username='#{username}'>#{fullname}</a>&nbsp;<div class='activity-item-description'>#{descriptionhtml}</div></div><div class='activity-item-info'><img class='icon' height='16' width='16' alt='#{activityTypeName}' src='#{activityTypeUrl}' title='#{activityTypeName}'><a href='"+this._options.businessUrl+"' class='timestamp' title='#{date}' target='_parent'>#{timeinfo}</a></div>";
	                    var tp = $_html.replace(/#\{source\}/g, adata.targetId).replace(/#\{grouped\}/g, grouped).replace(/#\{userid}/g,adata.userId).replace(/#\{username\}/g, adata.username).replace(/#\{fullname\}/g, adata.fullname).replace(/#\{avatar\}/g, adata.avatar).replace(/#\{operationPrefix\}/g, adata.operationPrefix).replace(/#\{operationSuffix\}/g, adata.operationSuffix||"").replace(/#\{activityName\}/g, adata.name). replace(/#\{activityTypeUrl\}/g, "/sms/uui/img/icons/ico_epic.png").replace(/#\{date\}/g, adata.date).replace(/#\{timeinfo\}/g, timeinfo).replace(/#\{descriptionhtml\}/g, descriptionhtml).replace(/#\{watch\}/g, watch).replace(/#\{vote\}/g, vote);
	                    
	                    var $tp = $(tp).appendTo(this.qid("logStream"));
	                    $tp.data("activitylogdata", adata);
//	                    if (idx == 0) {
//	                        this._start = result.data.aaData.length+1;
//	                    }
	                }));
	                if (result.data.iTotalRecords <= (this._start + this._countadd) ) {
	                    this.qid("showMoreLog").hide();
	                }
	                else {
	                    this._start += this._options.count;
	                }
	                if (this.parent() && this.parent().resizeGadget) {
	                    //this.parent().resizeGadget($("body").prop("scrollHeight"));
	                    this.parent().resizeGadget($("body").outerHeight(true) + 20);
	                }
	            };
	            
	        })).fail(this.proxy(function (jqXHR, errorText, errorThrown) {
	        }));
	    },
	    _pastdatetitlerule: function (strdatetime) {
	        var m = strdatetime.match(/(\d+)-(\d+)-(\d+)\s+(\d+):(\d+):(\d+)/);
	        var datetime = new Date(+m[1], +m[2] - 1, +m[3], +m[4], +m[5], +m[6]);
	        var _now = new Date();
	        var sdiffer = (_now.getTime() - datetime.getTime()) / 1000;
	        var ddiffer = sdiffer / (60 * 60 * 24);
	        if (ddiffer < 1) {
	            return "今天";
	        }
	        if (ddiffer < 2) {
	            return "昨天";
	        }
	        if (ddiffer < 8) {
	            var weekday = _now.getDay();
	            var n = weekday - Math.ceil(ddiffer);
	            if (n < 0) {
	                n += 7;
	            }
	            var wt = "";
	            switch (n) {
	                case 0:
	                    wt = "星期一";
	                    break;
	                case 1:
	                    wt = "星期二";
	                    break;
	                case 2:
	                    wt = "星期三";
	                    break;
	                case 3:
	                    wt = "星期四";
	                    break;
	                case 4:
	                    wt = "星期五";
	                    break;
	                case 5:
	                    wt = "星期六";
	                    break;
	                case 6:
	                    wt = "星期日";
	                    break;
	            }
	            // 一周内
	            return wt;
	        }
	        return datetime.format("yyyy-MM-dd");
	    },
	    _pastdaterule: function (strdatetime) {
	        var m = strdatetime.match(/(\d+)-(\d+)-(\d+)\s+(\d+):(\d+):(\d+)/);
	        var datetime = new Date(+m[1], +m[2] - 1, +m[3], +m[4], +m[5], +m[6]);
	        var _now = new Date();
	        var sdiffer = (_now.getTime() - datetime.getTime()) / 1000;
	        if (sdiffer < 60) {
	            return "刚刚";
	        }
	        var mdiffer = sdiffer / 60;
	        if (mdiffer < 60) {
	            return Math.floor(mdiffer) + "分钟前";
	        }
	        var hdiffer = mdiffer / 60;
	        if (hdiffer < 2) {
	            return "1小时前";
	        }
	        if (hdiffer < 24) {
	            return Math.floor(hdiffer) + "小时前";
	        }
	        var ddiffer = hdiffer / 24;
	        if (ddiffer < 2) {
	            return "昨天";
	        }
	        if (ddiffer < 8) {
	            return Math.floor(ddiffer) + "天前";
	        }
	        return datetime.format("yyyy-MM-dd hh:mm");
	    },
	    destroy: function () {
	        this._super();
	    }

}, { usehtm: true, usei18n: false })


com.losa.log.losaOperateLog.widgetjs = [];
com.losa.log.losaOperateLog.widgetcss = [];
