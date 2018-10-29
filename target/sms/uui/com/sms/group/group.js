//@ sourceURL=com.sms.group.group
$.u.load("com.sms.common.stdComponentOperate");
$.u.load("com.sms.common.stdcomponentdelete");
$.u.define('com.sms.group.group', null, {
    init: function (options) {
        this._options = options;
    },
    afterrender: function (bodystr) {
    	this.i18n = com.sms.group.group.i18n;
    	// 筛选名称文本框
    	this.nameContains=this.qid("namecontains");
    	
    	// 筛选按钮
    	this.btnFilter=this.qid("btn_filter");
    	
    	// 添加用户组
    	this.btnAddGroup=this.qid("btn_addgroup");
    	
    	// 请出筛选值
    	this.btnResetFilter=this.qid("btn_resetfilter");
    	
    	// 初始化“用户组”组件
    	this.groupDialog = new com.sms.common.stdComponentOperate($("div[umid='groupDialog']",this.$),{
    		"title":this.i18n.addUserGroup,
    		"dataobject":"userGroup",
    		"fields":[
	          {name:"name",maxlength: 255,label:this.i18n.name,type:"text",rule:{required:true},message:this.i18n.nameNotNull}
	        ]
    	});
    	
    	// 重写“用户组”组件的函数
        this.groupDialog.override({
            refreshDataTable: this.proxy(function () {
                this.dataTable.fnDraw(true);
            })
        });
        
        // 重写“用户组成员”组件的函数
        this.groupMembers.override({
            refreshDataTable: this.proxy(function () {
                this.dataTable.fnDraw(true);
            })
        });

        // 筛选按钮事件
        this.btnFilter.click(this.proxy(function () {
            this.dataTable.fnDraw();
        }));
        
        // 添加用户组事件
        this.btnAddGroup.click(this.proxy(function () {
            this.groupDialog.open();
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
            sDom: "t<ip>",
            "columns": [
                { "title": this.i18n.name ,"mData":"name"},
                { "title": this.i18n.userCount ,"mData":"users", "sWidth": "10%" },
                { "title": this.i18n.precase ,"mData":"id", "sWidth": "35%"},
                { "title": this.i18n.handle,"mData":"id", "sWidth": 150 }
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
            		"dataobject":"userGroup",
            		"rule":JSON.stringify(rule),
            		"columns":JSON.stringify(aoData.columns),
            		"search":JSON.stringify(aoData.search)
            	},true);
            }),
            "fnServerData": this.proxy(function (sSource, aoData, fnCallBack, oSettings) {
            	this.btnFilter.attr("disabled",true);
                $.u.ajax({
                    url: $.u.config.constant.smsqueryserver,
                    dataType: "json",
                    cache: false,
                    data: aoData
                }, this.qid("datatable")).done(this.proxy(function (data) {
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
                    "aTargets": 1,
                    "mRender": function (data, type, full) {
                        return "<a href='../user/UserBrowser.html?userGroup="+full.id+"' class='btn btn-link viewusers'  data='"+JSON.stringify(full)+"'>"+(data ? data.length : "0")+"</a>";
                    }
                },
                {
                    "aTargets": 2,
                    "mRender": function (data, type, full) {
                    	var htmls=["<ul style='padding-left:15px;'>"];
                		full.schemes && $.each(full.schemes,function(idx,scheme){
                			htmls.push("<li><a href='../secure/configPermissionSchemes.html?id="+scheme.id+"'>"+scheme.name+"</a></li>");
                		});
                		htmls.push("</ul>");
                        return htmls.join("");
                    }
                },
                {
                    "aTargets": 3,
                    "mRender": function (data, type, full) {
                    	return "<button type='button' class='btn btn-link edit' data='" + JSON.stringify(full) + "'>" + com.sms.group.group.i18n.edit + "</button>" +
                               "<button type='button' class='btn btn-link editmembers' data='" + JSON.stringify(full) + "'>" + com.sms.group.group.i18n.editMember + "</button>" +
                               "<button type='button' class='btn btn-link delete'  data='" + JSON.stringify(full) + "'>" + com.sms.group.group.i18n.remove + "</button>";
                                
                    }
                }
            ]
        });

        // 编辑用户组
        this.dataTable.off("click", "button.edit").on("click", "button.edit", this.proxy(function (e) {
            try{
                var data = JSON.parse($(e.currentTarget).attr("data"));
                this.groupDialog.open({
                    "title": this.i18n.editDialogTitle + data.name,
                    "data": data
                });
            }catch(e){
                throw new Error(this.i18n .error+e.message);
            }
        }));

        // 编辑用户组成员
        this.dataTable.off("click", "button.editmembers").on("click", "button.editmembers", this.proxy(function (e) {
        	try{
        		this.groupMembers.open(JSON.parse($(e.currentTarget).attr("data")));
        	}catch(e){
        		throw new Error(this.i18n .error+e.message);
        	}
        }));
        
        // 删除用户组
        this.dataTable.off("click", "button.delete").on("click", "button.delete", this.proxy(function (e) {
        	try{
        		var group = JSON.parse($(e.currentTarget).attr("data"));
        		(new com.sms.common.stdcomponentdelete({
        			body:"<div>"+
        				 	"<div class='alert alert-info'>"+
        				 		"<span class='glyphicon glyphicon-exclamation-sign'></span>"+this.i18n.remaind+""+
        				 	"</div>"+
        				 "</div>",
        			title:this.i18n.removeuserGroup+group.name,
        			dataobject:"userGroup",
        			dataobjectids:JSON.stringify([parseInt(group.id)])
        		})).override({
        			refreshDataTable:this.proxy(function(){
        				this.dataTable.fnDraw(true);
        			})
        		});
        	}catch(e){
        		throw new Error(this.i18n .error+e.message);
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


com.sms.group.group.widgetjs = ['../../../uui/widget/jqdatatable/js/jquery.dataTables.js', '../../../uui/widget/jqdatatable/js/dataTables.bootstrap.js'];
com.sms.group.group.widgetcss = [{ path: '../../../uui/widget/jqdatatable/css/jquery.dataTables.css' }, { path: '../../../uui/widget/jqdatatable/css/dataTables.bootstrap.css' }];