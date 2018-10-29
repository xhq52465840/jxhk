//@ sourceURL=com.sms.permissionset.permissionset
$.u.define('com.sms.permissionset.permissionset', null, {
    init: function (options) {
        this._options = options;
    },
    afterrender: function (bodystr) {
    	this.i18n = com.sms.permissionset.permissionset.i18n;
    	// 筛选名称文本框
    	this.nameContains=this.qid("namecontains");
    	
    	// 筛选按钮
    	this.btnFilter=this.qid("btn_filter");
    	
    	// 添加权限集
    	this.btnAddSet=this.qid("btn_addset");
    	
    	// 请出筛选值
    	this.btnResetFilter=this.qid("btn_resetfilter");
    	
    	// 重写“权限集”组件的函数
        this.setDialog.override({
            refreshDataTable: this.proxy(function () {
                this.dataTable.fnDraw();
            })
        });
        
        // 重写“编辑权限集权限点”组件的函数
        this.permissionDialog.override({
            refreshDataTable: this.proxy(function () {
                this.dataTable.fnDraw();
            })
        });

        // 筛选按钮事件
        this.btnFilter.click(this.proxy(function () {
            this.dataTable.fnDraw();
        }));
        
        // 添加权限集事件
        this.btnAddSet.click(this.proxy(function () {
            this.setDialog.open();
        }));

        // 清除筛选值
        this.btnResetFilter.click(this.proxy(function () {
            this.clearForm(this.qid("filter"));
            this.dataTable.fnDraw();
        }));

        this.dataTable = this.qid("datatable").dataTable({
            searching: false,
            serverSide: true,
            bProcessing: true,
            ordering: false,
            "columns": [
                { "title": this.i18n.name ,"mData":"name"},
                { "title": this.i18n.describute ,"mData":"description"},
                { "title": this.i18n.type ,"mData":"type"},
                { "title": this.i18n.handle,"mData":"id", "sWidth": 300 }
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
            	var rule=[];
            	if($.trim(this.nameContains.val())){
            		rule.push([{"key":"name","op":"like","value":this.nameContains.val()}]);
            	}
            	$.extend(aoData,{
            		"tokenid":$.cookie("tokenid"),
            		"method":"stdcomponent.getbysearch",
            		"dataobject":"permissionSet",
            		"rule":JSON.stringify(rule),
            		"columns": JSON.stringify([{ "data":"weight" } ]), 
            		"order": JSON.stringify([{ "column":0, "dir":"asc"} ]),
            		"search":JSON.stringify(aoData.search)
            	},true);
            }),
            "fnServerData": this.proxy(function (sSource, aoData, fnCallBack, oSettings) {
            	this.btnFilter.attr("disabled",true);
                $.ajax({
                    url: $.u.config.constant.smsqueryserver,
                    dataType: "json",
                    cache: false,
                    data: aoData
                }).done(this.proxy(function (data) {
                    if (data.success) {
                        fnCallBack(data.data);
                    }
                })).fail(this.proxy(function (jqXHR, errorText, errorThrown) {

                })).complete(this.proxy(function(){
                	this.btnFilter.attr("disabled",false);
                }));
            }),
            "aoColumnDefs": [
                {
                    "aTargets": 3,
                    "mRender": function (data, type, full) {
                        return "<button type='button' class='btn btn-link delete'  data='"+JSON.stringify(full)+"'>"+com.sms.permissionset.permissionset.i18n.remove+"</button>" +
                                "<button type='button' class='btn btn-link edit' data='"+JSON.stringify(full)+"'>"+com.sms.permissionset.permissionset.i18n.edit+"</button>"+
                                "<button type='button' class='btn btn-link bindpermission' data='"+JSON.stringify(full)+"'>"+com.sms.permissionset.permissionset.i18n.editPermissionset+"</button>";
                    }
                }
            ]
        });

        // 编辑权限集
        this.dataTable.off("click", "button.edit").on("click", "button.edit", this.proxy(function (e) {
            var $this = $(e.currentTarget);
            try {
                this.setDialog.open(JSON.parse($this.attr("data")));
            } catch (e) {
                throw new Error(this.i18n.editFail+e.message);
            }
        }));
        
        // 绑定权限点
        this.dataTable.off("click", "button.bindpermission").on("click", "button.bindpermission", this.proxy(function (e) {
            var $this = $(e.currentTarget);
            try {
                this.permissionDialog.open(JSON.parse($this.attr("data")));
            } catch (e) {
                throw new Error(this.i18n.boundFail+e.message);
            }
        }));
        
        
        // 删除权限集
        this.dataTable.off("click", "button.delete").on("click", "button.delete", this.proxy(function (e) {
        	try{
        		var set = JSON.parse($(e.currentTarget).attr("data"));
        		$.u.load("com.sms.common.stdcomponentdelete");
        		(new com.sms.common.stdcomponentdelete({
        			body:"<div>"+
        				 	"<div class='alert alert-info'>"+
        				 		"<span class='glyphicon glyphicon-exclamation-sign'></span>"+this.i18n.affirm+
        				 	"</div>"+
        				 "</div>",
        			title:this.i18n.removePermissionset+set.name,
        			dataobject:"permissionSet",
        			dataobjectids:JSON.stringify([parseInt(set.id)])
        		})).override({
        			refreshDataTable:this.proxy(function(){
        				this.dataTable.fnDraw();
        			})
        		});
        	}catch(e){
        		throw new Error(this.i18n.removeFail+e.message);
        	}
        }));

    },
    clearForm: function ($target) {
        $target.find("input,select,textarea").each(function () {
            switch (this.type) {
                case "password":
                case "text":
                case "textarea":
                case "select-one":
                case "select-multiple":
                    $(this).val("");
                    break;
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


com.sms.permissionset.permissionset.widgetjs = ['../../../uui/widget/jqdatatable/js/jquery.dataTables.js', '../../../uui/widget/jqdatatable/js/dataTables.bootstrap.js'];
com.sms.permissionset.permissionset.widgetcss = [{ path: '../../../uui/widget/jqdatatable/css/jquery.dataTables.css' }, { path: '../../../uui/widget/jqdatatable/css/dataTables.bootstrap.css' }];