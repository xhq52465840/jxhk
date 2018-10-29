//@ sourceURL=com.sms.risk.riskAnalysis
$.u.define('com.sms.risk.riskAnalysis', null, {
    init: function (options) {
        this._options = options;
        this._NEW = "新建";
        this._COMPLETE = "完成";
    },
    afterrender: function () {
    	this.i18n = com.sms.risk.riskAnalysis.i18n;
    	this.riskTitleContains = this.qid("riskTitleContains");
    	this.statusContains = this.qid("statusContains");
    	
    	this.btnFilter = this.qid("btn_filter");
    	this.btnResetFilter = this.qid("btn_resetfilter");
    	this.btnCreate = this.qid("btn_create");
    	/*
    	 * *
    	 * 筛选框有值，不过滤处理
    	 */
        this.btnFilter.click(this.proxy(function (){
       	        this.rule=[];
        		this.rule.push([{"key":"rsummary","op":"like","value":this.riskTitleContains.val()||""}]);
            	this.rule.push([{"key":"status","value":this.statusContains.val()||""}]);
            this.dataTable.fnDraw();
        }));
        /*
         * 清除过滤
         */
        this.btnResetFilter.click(this.proxy(function () {
            this.clearForm(this.qid("filter"));
        }));
        this.btnCreate.click(this.proxy(function () {
        	window.location.href = this.getabsurl("RiskDetail.html?mode=add");
        }));
    	this.dataTable = this.qid("datatable").dataTable({
            searching: false,
            serverSide: true,
            bProcessing: true,
            ordering: false,
            sDom: "t<ip>",
            "columns": [
                { "title": this.i18n.columns.riskTitle, "mData":"rsummary","sWidth": "25%"},
                { "title": this.i18n.columns.unit, "mData":"unit" ,"sWidth": "15%"},
                { "title": this.i18n.columns.status, "mData":"status", "sWidth": "10%" },
                { "title": this.i18n.columns.creator, "mData":"fullname", "sWidth": "15%" },
                { "title": this.i18n.columns.createWhen, "mData":"date", "sWidth": "20%" },
                { "title": this.i18n.columns.handle, "mData":"id", "sWidth": "15%" }
            ],
            "aoColumnDefs": [
                 {
                     "aTargets": 0,
                     "mRender": this.proxy(function (data, type, full) {
                    	   var rlink='';
                    	   if (full.activityId){
                    		   rlink='<a href="../../sms/search/activity.html?activityId='+full.activityId+'" target="_blank">' + full.rsummary||"" + '</a>';
                    	   }else{
                    		   rlink=full.rsummary;
                    	   }
                    	   return rlink;
                     })
                 },
                 {
                     "aTargets": 1,
                     "mRender": this.proxy(function (data, type, full) {
                       return full.activityId?full.unitName:'';
                     })
                 },
                {
                    "aTargets": 3,
                    "mRender": this.proxy(function (data, type, full) {
                        return full.fullname ? full.fullname + "(" + full.username + ")" : "";
                    })
                },
                {
                    "aTargets": 5,
                    "mRender": this.proxy(function (data, type, full) {
                        var htmls = [];
                        if(full.status === this._NEW || full.status === '无效'){
                        	var username = $.parseJSON($.cookie("uskyuser")).username;
                        	htmls.push("<a href='" + this.getabsurl("RiskDetail.html?mode=view&riskId=" + full.id) + "'>" + this.i18n.buttons.view + "</a>");
                            if(username == full.username){
                            	htmls.push("<a href='" + this.getabsurl("RiskDetail.html?mode=edit&riskId=" + full.id) + "' style=' padding-left: 5px;'>" + this.i18n.buttons.edit + "</a>");
                            	htmls.push("<button type='button' style='padding-bottom: 2px; padding-left: 5px;' class='btn btn-link delete' data-id='" + full.id + "' data-title='" + full.activitySummary + "' >" + this.i18n.buttons.remove + "</button>");	
                            }
                        }else if(full.status === this._COMPLETE){
                            htmls.push("<a href='" + this.getabsurl("RiskDetail.html?mode=view&riskId=" + full.id) + "'  >" + this.i18n.buttons.view + "</a>");
                        }
                        return htmls.join("");
                    })
                }
            ],
            "oLanguage": { //语言
                "sSearch": this.i18n.search,
                "sLengthMenu": this.i18n.everPage+" _MENU_ "+this.i18n.record,
                "sZeroRecords": this.i18n.message,
                "sInfo": this.i18n.from+" _START_ "+this.i18n.to+" _END_ /"+this.i18n.all+" _TOTAL_ "+this.i18n.allData,
                "sInfoEmpty": this.i18n.withoutData,
                "sInfoFiltered": "("+this.i18n.fromAll+"_MAX_"+this.i18n.filterRecord+")",
                "sProcessing": ""+this.i18n.searching+"...",
                "oPaginate": {
                    "sFirst": "<<",
                    "sPrevious": this.i18n.back,
                    "sNext": this.i18n.next,
                    "sLast": ">>"
                }
            },
            "fnServerParams": this.proxy(function (aoData) {
            	$.extend(aoData,{
            		"tokenid": $.cookie("tokenid"),
            		"method": "stdcomponent.getbysearch",
            		"dataobject": "risk",
            		"rule": JSON.stringify(this.rule),
            		"columns": JSON.stringify( [{"data":"created"}] ), //JSON.stringify(aoData.columns),
                    "order": JSON.stringify( [{"column":0, "dir": "desc"}] ),
            		"search": JSON.stringify(aoData.search)
            	},true);
            }),
            "fnServerData": this.proxy(function (sSource, aoData, fnCallBack, oSettings) {
            	this.btnFilter.add(this.btnResetFilter).attr("disabled",true);
                $.u.ajax({
                    url: $.u.config.constant.smsqueryserver,
                    type:"post",
                    dataType: "json",
                    cache: false,
                    data: aoData
                }, this.qid("datatable")).done(this.proxy(function (data) {
                    if (data.success) {
                    	if(this.rule && this.rule.length>0){
                    		this.riskTitleContains.val(this.rule[0][0].value);
                    		this.statusContains.val(this.rule[1][0].value);
                    	}else if(!this.rule){
                    		this.riskTitleContains.val("");
                    		this.statusContains.val("");
                    	}
                        fnCallBack(data.data);
                    }
                })).complete(this.proxy(function(){
                	this.btnFilter.add(this.btnResetFilter).attr("disabled",false);
                }));
            })
        });
    	
        this.dataTable.off("click", "button.delete").on("click", "button.delete", this.proxy(function (e) {
    		var $this =  $(e.currentTarget), id = parseInt($this.attr("data-id")), title = $this.attr("data-title");
    		$.u.load("com.sms.common.stdcomponentdelete");
    		(new com.sms.common.stdcomponentdelete({
    			body:"<div>"+
    				 	"<div class='alert alert-warning'>"+
    				 		"<span class='glyphicon glyphicon-exclamation-sign'></span>" + this.i18n.dialog.deleteContentPrefix + "'" + title + "'" + this.i18n.dialog.deleteContentOver +
    				 	"</div>"+
    				 "</div>",
    			title: this.i18n.dialog.deleteTitle,
    			dataobject: "risk",
    			dataobjectids: JSON.stringify([id])
    		})).override({
    			refreshDataTable:this.proxy(function(){
    				this.dataTable.fnDraw();
    			})
    		});
        }));
    },
    clearForm: function ($target) {
        $target.find("input,textarea,select").each(function () { 
            switch (this.type) {
                case "password":
                case "text":
                case "textarea":
                case "select-one":
                case "select-multiple":
                    $(this).val("");
                case "checkbox":
                case "radio":
                    $(this).prop("checked", false);
                    break;
                    // no default
            }
        });
    },
    destroy: function () {
        this._super();
    }
}, { usehtm: true, usei18n: true });

com.sms.risk.riskAnalysis.widgetjs = ['../../../uui/widget/jqurl/jqurl.js',
                                      '../../../uui/widget/jqdatatable/js/jquery.dataTables.js', 
                                      '../../../uui/widget/jqdatatable/js/dataTables.bootstrap.js'];
com.sms.risk.riskAnalysis.widgetcss = [{ path: '../../../uui/widget/jqdatatable/css/jquery.dataTables.css' }, 
                                       { path: '../../../uui/widget/jqdatatable/css/dataTables.bootstrap.css' }];