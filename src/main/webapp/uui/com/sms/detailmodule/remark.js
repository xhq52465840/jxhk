//@ sourceURL=com.sms.detailmodule.remark
$.u.define('com.sms.detailmodule.remark', null, {
    init: function (option) {
    	this._options = option; //<a href="'+this.getabsurl("../ViewProfile.html?id=#{userid}")+'">#{username}</a>
    	this.i18n = com.sms.detailmodule.remark.i18n;
    	this.temp='<a href="#" data-id="#{id}" class="list-group-item" style="cursor:default;">'+
			        '<div class="sh-a" style="cursor:pointer;"><i class="fa fa-chevron-down arrowicon" style="margin-left:-14px;padding-right:3px;"></i><img height="16" width="16" src="#{imgUrl}"/>&nbsp;#{username}&nbsp;添加了备注-#{time}#{editflag}'+
			        	'<span class="sh-span" style="display:none;padding-left:5px;">#{remark}</span>'+
				    	'<span class="sh-icon" style="float: right;display:none;">'+
				        	'<i class="fa fa-pencil fa-fw edit" title="' + this.i18n.edit + '" style="cursor: pointer;"></i>'+
				        	'<span class="glyphicon glyphicon glyphicon-trash" title="' + this.i18n.remove + '" data-id="#{id}" style="cursor: pointer;"></span>'+
				        '</span>'+
				    '</div>'+
				    '<div class="sh-div" style="word-wrap:break-word;">#{remark}</div>'+
			    '</a>';
    },
    afterrender: function (bodystr) {
    	this.listDiv = this.qid("remarklist");
    	//this.reload();//加载时获取数据并显示 
    	this.$.on("click","i.edit",this.proxy(this.on_edit_click));
    	this.$.off("click", "span.glyphicon-trash").on("click", "span.glyphicon-trash", this.proxy(this.on_remove_click));
    	this.$.on("click","div.sh-a",this.proxy(this.on_remarkitem_click));
    	this.$.on("click","a.list-group-item",this.proxy(function(e){e.preventDefault();}));
    	this.$.on("mouseenter mouseleave","a.list-group-item",this.proxy(this.on_remarkitem_mouse));
    	
    },
    /**
     * @title 编辑
     * @param {object} a 鼠标对象
     * @return void
     */
    on_edit_click:function(e){
    	e.preventDefault();
    	e.stopPropagation();
		var $this = $(e.currentTarget), data = $this.data("data");
		$.u.load("com.sms.detailmodule.remarkDialog");
		this.remarkDialog && this.remarkDialog.destroy && this.remarkDialog.destroy();
    	this.remarkDialog = new com.sms.detailmodule.remarkDialog($("div[umid='remarkDialog']",this.$));
    	this.remarkDialog.override({
    		refreshDataTable:this.proxy(function(){
    			this.reload();
    		})
    	});
		this.remarkDialog.open(data);
    },
    /**
     * @title 删除
     * @param {object} a 鼠标对象
     * @return void
     */
    on_remove_click:function(e){
    	e.preventDefault();
    	e.stopPropagation();
		try{
    		var id = $(e.currentTarget).attr("data-id"), data = $(e.currentTarget).data("data");
    		$.u.load("com.sms.common.stdcomponentdelete"); 
    		(new com.sms.common.stdcomponentdelete({
    			body:"<div>"+
    				 	"<p>你确定要删除这个备注吗?</p>" +
    				 	"<dl class='dl-horizontal'>" +
    				 		"<dt style='font-weight:normal;' class='text-muted'>作者</dt><dd><a href='" + this.getabsurl("../ViewProfile.html?id=") + data.userId + "' target='_blank'>" + data.fullname + "(" + data.username + ")" + "</a></dd>" +
    				 		"<dt style='font-weight:normal;' class='text-muted'>创建日期</dt><dd>" + data.created + "</dd>" +
    				 		(data.updatedAuthor && data.date != data.lastDate ? "<dt style='font-weight:normal;' class='text-muted'>编辑人</dt><dd><a href='" + this.getabsurl("../ViewProfile.html?id=") + data.updateAuthorId + "'>" + data.updatedAuthor + "</a></dd>" : "") +
    				 		(data.updatedAuthor && data.date != data.lastDate ? "<dt style='font-weight:normal;' class='text-muted'>编辑日期</dt><dd>" + data.lastUpdate + "</dd>" : "") +
    				 		"<dt style='font-weight:normal;' class='text-muted'>备注</dt><dd>" + data.body + "</dd>" +
    				 	"</dl>" +
    				 "</div>",
    			title:"删除备注",
    			dataobject:"action",
    			dataobjectids:JSON.stringify([parseInt(id)])
    		})).override({
    			refreshDataTable:this.proxy(function(){
    				this.$.find("a.list-group-item[data-id="+id+"]").fadeOut(function(){
    					$(this).remove();
    				});
    			})
    		});
    	}catch(e){
    		throw new Error("删除操作失败");
    	}
    },
    /**
     * @title 备注记录点击事件
     * @return void
     */
    on_remarkitem_click:function(e){
    	e.preventDefault();
    	var $curr = $(e.currentTarget).parent();
    		$div = $('div.sh-div',$curr);
			$span = $('span.sh-span',$curr);
			$icon=$("span.sh-icon",$curr);
			console.log($span.html());
			$arrowicon=$("i.arrowicon",$curr);
    	$curr.toggleClass("collapsed");
    	$div.toggle();
    	//$span.toggle();
    	if($curr.hasClass("collapsed")){
    		$icon.hide();
    		$span.hide();
    		$arrowicon.removeClass("fa-chevron-down").addClass("fa-chevron-right").css({"margin-left":"-10px"});
    	}else{
    		$icon.show();
    		
    		$arrowicon.removeClass("fa-chevron-right").addClass("fa-chevron-down").css({"margin-left":"-14px"});
    	}
    },
    /**
     * @title 备注记录鼠标移入移出事件
     * @retur void
     */
    on_remarkitem_mouse:function(e){
    	var $curr = $(e.currentTarget),
			$icon=$("span.sh-icon",$curr);
    	if(!$curr.hasClass("collapsed")){
    		$icon.toggle();
    	}
    },
    /**
     * @title 加载备注列表
     * @return void
     */
    reload: function () {
        $.u.ajax({
            url: $.u.config.constant.smsqueryserver,
            type: "post",
            dataType: "json",
            cache: false,
            data: {
                "tokenid": $.cookie("tokenid"),
                "method":"stdcomponent.getbysearch",
        		"dataobject":"action",
        		"columns":JSON.stringify([{"data":"created"}]),
        		"order":JSON.stringify([{"column":0,"dir":"desc"}]),
        		"rule":JSON.stringify([[{"key":"activity","value":this._options.activity}]])
            }
        }, this.$,{size:2,backgroundColor:"#fff"}).done(this.proxy(function (result) {
            if (result.success) {
            	var datenew, timeinfo, tp, $tp;
                this.listDiv.empty();
                if(result.data.aaData.length == 0){
                	$("<div>这条信息没有备注。</div>").appendTo(this.listDiv);
                }else{
	                $.each(result.data.aaData, this.proxy(function (idx, adata) {
	                    datenew = (adata.date && this._pastdatetitlerule(adata.date))||null;
	                    timeinfo = this._pastdaterule(adata.date);
	                    tp = this.temp.replace(/#\{id\}/g, adata.id)
                    				  .replace(/#\{time\}/g, timeinfo)
                    				  .replace(/#\{remark}/g,adata.body===null?"未输入任何消息":adata.body)
                    				  .replace(/#\{username}/g,adata.fullname)
                    				  .replace(/#\{imgUrl}/g,adata.avatar)
                    				  .replace(/#\{userid}/g,adata.userId)
                    				  .replace(/#\{editflag}/g,adata.date != adata.lastDate ? "<span class='text-danger'>-已编辑</span>" : "");
	                    $tp = $(tp).appendTo(this.listDiv);
	                    if (adata.editable === false) {
	                    	$tp.find("i.edit").remove();
	                    } else {
	                    	$tp.find("i.edit").data("data", adata);
	                    }
	                    if (adata.deletable === false) {
	                		$tp.find("span.glyphicon-trash").remove();
	                    }else{
	                    	$tp.find("span.glyphicon-trash").data("data", adata);
	                    }
	                }));
                }
            }
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
}, { usehtm: true, usei18n: true });


com.sms.detailmodule.remark.widgetjs = ["../../../uui/widget/spin/spin.js", 
                                       "../../../uui/widget/jqblockui/jquery.blockUI.js",
                                       "../../../uui/widget/ajax/layoutajax.js"];
com.sms.detailmodule.remark.widgetcss = [];