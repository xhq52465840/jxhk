//@ sourceURL=com.sms.unitcategory.allUnit
$.u.define('com.sms.unitcategory.allUnit', null, {
    init: function (options) {
        this._options = options||null;
        this.left = [];
        this.leftObject = {};
    },
    afterrender: function (bodystr) {
        this.i18n = com.sms.unitcategory.allUnit.i18n;
    	this.category = this.qid("ul-category");
    	
    	this.unit = this.qid("div-unit");
    	
    	this.getUnit();
    	/**
    	 * 1.左侧的数组，
    	 * 2.
    	 */

    	this.category.off("click","a").on("click","a",this.proxy(function(e){
    		e.preventDefault();
    		$(e.currentTarget).parent().siblings().removeClass("nav-selected").end().addClass("nav-selected");
    		var aHref = $(e.currentTarget).attr("href");
    		if(aHref=="category所有安监机构"){
    			this.showAll();
    		}else{
    			$('div[cid='+aHref+']').siblings().addClass("hidden").end().removeClass("hidden");
    		}
    	}))
    },
    getUnit:function(){
    	this.left = [];
    	this.leftObject = {};
    	$.u.ajax({
        	url: $.u.config.constant.smsqueryserver,
            type:"post",
            dataType: "json",
            cache: false,
            data: {
            	"tokenid":$.cookie("tokenid"),
        		"method":"getunits"
            }
        },this.qid("view_unit").parent()).done(this.proxy(function(response){
        	if(response.success){
        		//取得左侧的数组	
        		this.leftObject["最近使用的安监机构"]=this.getRecentunits();
        		response.data&&$.each(response.data,this.proxy(function(k,v){
    				if($.inArray(v.category,this.left)<0){
    					this.left.push(v.category);
    					this.leftObject[v.category||"未分类"] = [];
    				}
    				this.leftObject[v.category||"未分类"].push(v);
    			}));
        		this.leftObject["所有安监机构"]="";
        		//循环左侧的数组
        		$.each(this.leftObject,this.proxy(function(k1,v1){
        			$('<li class="'+(k1=="所有安监机构"?"nav-selected":"")+'"><a href="category'+k1+'">'+k1+'</a></li>').appendTo(this.category);
        			$div=$('<div cid="category'+k1+'"></div>').appendTo(this.unit);
        			$h3=$('<h3 style="font-size:20px;margin-top:10px;">'+k1+'</h3>').appendTo($div);
        			$table = $('<table  class="table"><thead><tr><th width="3%"></th><th width="27%">'+com.sms.unitcategory.allUnit.i18n.SafetyAgencies+'</th><th width="25%">'+com.sms.unitcategory.allUnit.i18n.key+'</th><th width="25%">'+com.sms.unitcategory.allUnit.i18n.principal+'</th><th width="20%">'+com.sms.unitcategory.allUnit.i18n.operate+'</th></tr></thead>'+
        					+'</table>').appendTo($div);
        			$.each(v1,this.proxy(function(k2,v2){
        				$('<tr><td width="3%"><img src="'+v2.avatarUrl+'" width="26" height="26"></img></td><td><a href="../unitbrowse/Summary.html?id='+v2.id+'">'+v2.name+'</a></td><td>'+v2.code+'</td><td>'+(v2.responsibleUser?v2.responsibleUser:"")+'</td><td><a class="btn btn-link" style="padding-left: 0px;" href="'+this.getabsurl("../plugin/organization/ViewOrgUserRole01.html?id=" + v2.id)+'">'+this.i18n.usermanager+'</a><a class="btn btn-link" style="padding-left: 0px;" href="'+this.getabsurl("../unitbrowse/ViewLevelOneReview01.html?id=" + v2.id)+'">'+this.i18n.anquanpingshen+'</a></td></tr>').appendTo($table);
        			}))
        		}));		
        		this.showAll();
        	}
        })).fail(this.proxy(function(jqXHR,errorText,errorThrown){
        	
        })).complete(this.proxy(function(jqXHR,errorStatus){
        	
        }));
    },
    /**
     * method:getrecentunits
     * dataobject:unit
     */
    getRecentunits:function(){
    	var data = ""
    	$.ajax({
        	url: $.u.config.constant.smsqueryserver,
            type:"post",
            dataType: "json",
            cache: false,
            async:false,
            data: {
            	"tokenid":$.cookie("tokenid"),
        		"method":"getrecentunits"
            }
        }).done(this.proxy(function(response){
        	if(response.success){        
        		data = response.data.aaData;
        	}
        })).fail(this.proxy(function(jqXHR,errorText,errorThrown){
        	
        }));	
    	return data;
    },
    showAll:function(){
    	$('div',this.unit).removeClass("hidden");
		$('div[cid=category所有安监机构]',this.unit).addClass("hidden");
		$('div[cid=category最近使用的安监机构]',this.unit).addClass("hidden");
    },
    destroy: function () {
        this._super();
    }
}, { usehtm: true, usei18n: true });

com.sms.unitcategory.allUnit.widgetjs = ["../../../uui/widget/spin/spin.js"
                                         , "../../../uui/widget/jqblockui/jquery.blockUI.js"
                                         , "../../../uui/widget/ajax/layoutajax.js"];
com.sms.unitcategory.allUnit.widgetcss = [{ path: '' }];