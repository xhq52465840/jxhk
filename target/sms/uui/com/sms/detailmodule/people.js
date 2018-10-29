//@ sourceURL=com.sms.detailmodule.people
$.u.define('com.sms.detailmodule.people', null, {
    init: function (options) {
        this._options = options || {};
        this.assignTemplate = '<img width="24" height="24" src="#{img}" style="margin-bottom:5px;"/>&nbsp;'
							 +'<span>#{user}</span>&nbsp;';
    },
    afterrender: function (bodystr) {
    	this.assignContainer = this.qid("assigncontainer");		// 经办人
    	this.reporterimg = this.qid("reporterimg");				// 创建人图片
    	this.reportername = this.qid("reportername");			// 创建人名称
    	this.btnAssociation = this.qid("btn_association");		// 关注/停止关注按钮
    	this.btnWatchcount = this.qid("watchcount");
    	this.watchList = this.qid("watchlist");
    	
    	if(this._options.assignees){
    		var html = "";
    		$.each(this._options.assignees,this.proxy(function(idx,item){
    			html += this.assignTemplate.replace(/#\{img}/g,item.avatar).replace(/#\{user}/g,item.fullname);
    		}));
    		$(html).appendTo(this.assignContainer);
    	}
    	
    	if(this._options.reporter){
    		this.reporterimg.attr("src", this._options.reporter.avatar);
    		this.reportername.text(this._options.reporter.fullname);
    	}
    	
    	if(this._options.watchers){
    		this.btnWatchcount.text(this._options.watchers.count);
    		if(this._options.watchers.watched !== 0){
    			this.btnAssociation.attr({"data-type":"off","data-id":this._options.watchers.watched}).text("停止关注这条信息");
    		}else if (this._options.watchers.watched === 0){
    			this.btnAssociation.attr("data-type","on").text("关注这条信息");
    		}
    	}
    	
    	this.btnAssociation.click(this.proxy(this.on_association_click));
    	this.btnWatchcount.click(this.proxy(this.on_reloadWatchUser_click));
    	this.watchList.on("click","a",this.proxy(function(e){e.preventDefault();}));
    },
    /**
     * @title 添加/停止关注
     */
    on_association_click:function(e){
    	e.preventDefault();
    	var $this = $(e.currentTarget),
    		type = $this.attr("data-type") ,
    		id = $this.attr("data-id"),
    		param = {"tokenid":$.cookie("tokenid")};
    	if(type == "on"){
    		param = $.extend({},param,{
    			"tokenid":$.cookie("tokenid"),
    			"method":"stdcomponent.add",
    			"dataobject":"userAssociation",
    			"obj":JSON.stringify({
    				"user":parseInt($.cookie("userid")),
        			"entityType":"activity",
        			"entityId":this._options.activity+"",
        			"type":"watch"        			
    			})
    		});
    	}else if(type == "off"){
    		param = $.extend({},param,{
    			"method":"stdcomponent.delete",
    			"dataobject":"userAssociation",
    			"dataobjectids":JSON.stringify([parseInt(id)])
    		});
    	}
    	$.u.ajax({
    		url:$.u.config.constant.smsmodifyserver,
    		type:"post",
    		data:param,
    		dataType:"json"
    	},this.btnAssociation,{size:2,backgroundColor:"#fff"}).done(this.proxy(function(response){
    		if(response.success){
    			if(type == "on"){
    				this.btnAssociation.attr({"data-type":"off","data-id":response.data}).text("停止关注这条信息");
    			}else if(type == "off"){
    				this.btnAssociation.attr("data-type","on").text("关注这条信息");
    			}
    			this.on_reloadWatchUser_click();
    		}
    	})).fail(this.proxy(function(jqXHR,responseText,responseThrown){
    		
    	}));
    },
    /**
     * @title 获取获取用户
     * 
     */
    on_reloadWatchUser_click:function(e){
    	$.u.ajax({
    		url:$.u.config.constant.smsqueryserver,
    		type:"post",
    		data:{
    			"tokenid":$.cookie("tokenid"),
    			"method":"getWatchUser",
    			"entityId":this._options.activity+""   			
    		},
    		dataType:"json"
    	},this.watchList,{size:2,backgroundColor:"#fff"}).done(this.proxy(function(response){
    		if(response.success){
    			this.watchList.empty();
    			this.btnWatchcount.text(response.data.length);
    			$.each(response.data,this.proxy(function(idx,item){
    				$("<li role='presentation'><a role='menuitem' href='#'> <img src='"+item.avatarUrl+"' width='16' title='"+item.name+"'/>"+item.name+"</span></li>").appendTo(this.watchList);
    			}));
    		}
    	})).fail(this.proxy(function(jqXHR,responseText,responseThrown){
    		
    	}));
    },
    destroy: function () {
        this._super();
    }
}, { usehtm: true, usei18n: false });


com.sms.detailmodule.people.widgetjs = ['../../../uui/widget/jqurl/jqurl.js'];
com.sms.detailmodule.people.widgetcss = [];