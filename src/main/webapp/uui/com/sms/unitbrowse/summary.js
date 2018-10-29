//@ sourceURL=com.sms.unitbrowse.summary
$.u.load("com.sms.log.activitylog");
$.u.load('com.sms.unitbrowse.activityLine');
$.u.define('com.sms.unitbrowse.summary', null, {
    init: function (options) {
        this._options = options;
    },
    afterrender: function (bodystr) {
    	/*
    	 * 1.根据url得到id
    	 * 2.获取数据，显示界面上的内容
    	 */
    	//id
    	var id = parseInt($.urlParam().id);

    	if(!id){
			window.location.href="../dash/DashBoard.html";
		}
    	this.activityLog = new com.sms.log.activitylog($("div[umid='activity-log']",this.$),{
    		"title":com.sms.unitbrowse.summary.i18n.actLog,
    		"count":"20",
    		"rules":[{"key":"activity.unit.id","op":"in","value":[{"id":id}]}],
    		"autorefresh":true,
    		"autorefreshminiute":"15"
    	});
	
		//描述
		this.description = this.qid("description");
		
		//根据id获取基本数据
    	this.getBaseDataById(id);		
        this.activityLine = new com.sms.unitbrowse.activityLine($("div[umid=safeMessage]",this.$),{"method":"countActivity","unit":id});	
    },
    getBaseDataById:function(id){
    	$.u.ajax({
            url: $.u.config.constant.smsqueryserver,
            dataType: "json",
            cache: false,
            data: {
            	"tokenid":$.cookie("tokenid"),
        		"method": "getByUnit",
                "dataobject": "organization",
                "unitId": id
            }
        },this.qid("organization").parent()).done(this.proxy(function (data) {
        	if (data.success) {
                var setting = {
                    data: {
                        simpleData: {
                            enable: true
                        }
                    },
                    check:{
                        enable:false
                    }
                };
                var nodes = $.map(data.data, this.proxy(function(org, idx){
                    return {
                        id: org.id,
                        pId: org.parentId,
                        name: org.name
                    };
                }));
                $.fn.zTree.init(this.qid("organization"), setting, nodes);
            }
        })).fail(this.proxy(function (jqXHR, errorText, errorThrown) {

        })).complete(this.proxy(function(){
        }));
    },
    destroy: function () {
        this._super();
    }
}, { usehtm: true, usei18n: true });

com.sms.unitbrowse.summary.widgetjs = ["../../../uui/widget/jqurl/jqurl.js",
                                       "../../../uui/widget/spin/spin.js",
                                       "../../../uui/widget/jqblockui/jquery.blockUI.js",
                                       "../../../uui/widget/ajax/layoutajax.js",
                                       "../../../uui/widget/jqztree/js/jquery.ztree.all-3.5.js"
                                       ];
com.sms.unitbrowse.summary.widgetcss = [{id:"ztreestyle",path:"../../../uui/widget/jqztree/css/zTreeStyle/zTreeStyle.css"}];