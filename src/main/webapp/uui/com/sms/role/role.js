//@ sourceURL=com.sms.role.role
$.u.load("com.sms.common.stdComponentOperate");
$.u.define('com.sms.role.role', null, {
    init: function (options) {
        this._options = options;
    },
    afterrender: function (bodystr) {
    	this.i18n = com.sms.role.role.i18n;
    	// 添加角色按钮
    	this.btnAddRole=this.qid("btn_addrole");
    	
    	// 初始化“角色”组件
    	this.roleDialog=new com.sms.common.stdComponentOperate($("div[umid='roleDialog']",this.$),{
    		"title":this.i18n.addrole,
    		"dataobject":"role",
    		"fields":[
	          {name:"name",label:this.i18n.name,type:"text",rule:{required:true},message:this.i18n.nameNotNull,maxlength:255},
	          {name:"description",label:this.i18n.describe,type:"textarea",maxlength:255}
	        ]
    	});
    	
    	// 重写“角色”组件的事件
        this.roleDialog.override({
            refreshDataTable: this.proxy(function () {
                this.dataTable.fnDraw(true);
            })
        });

        // 添加角色按钮事件
        this.btnAddRole.click(this.proxy(function () {
            this.roleDialog.open();
        }));
        
        this.dataTable = this.qid("datatable").dataTable({
            searching: false,
            serverSide: true,
            bProcessing: true,
            ordering: false,
            paging: false,
            "sDom":"",
            "columns": [
                { "title": this.i18n.name ,"mData":"name"},
                { "title": this.i18n.describe ,"mData":"description"},
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
            	$.extend(aoData,{
            		"tokenid":$.cookie("tokenid"),
            		"method":"stdcomponent.getbysearch",
            		"dataobject":"role",
            		"columns":JSON.stringify(aoData.columns),
            		"search":JSON.stringify(aoData.search)
            	},true);
            }),
            "fnServerData": this.proxy(function (sSource, aoData, fnCallBack, oSettings) {
                $.ajax({
                    url: $.u.config.constant.smsqueryserver,
                    type:"post",
                    dataType: "json",
                    cache: false,
                    data: aoData
                }).done(this.proxy(function (data) {
                    if (data.success) {
                        fnCallBack(data.data);
                    }
                })).fail(this.proxy(function (jqXHR, errorText, errorThrown) {

                })).complete(this.proxy(function(){
                }));
            }),
            "aoColumnDefs": [
                {
                    "aTargets": 2,
                    "mRender": function (data, type, full) {
                        return '<button type="button" class="btn btn-link hidden">'+com.sms.role.role.i18n.lookQuote+'</button>'+
                                '<button type="button" class="btn btn-link hidden">'+com.sms.role.role.i18n.editRole+'</button>'+
                                "<button type='button' class='btn btn-link edit' data='"+JSON.stringify(full)+"' >"+com.sms.role.role.i18n.edit+"</button>"+
                               "<button type='button' class='btn btn-link delete' data='"+JSON.stringify(full)+"'>"+com.sms.role.role.i18n.remove+"</button>";
                    }
                }
            ]
        });

        // 编辑角色
        this.dataTable.off("click", "button.edit").on("click", "button.edit", this.proxy(function (e) {
            var $this = $(e.currentTarget);
            try {
            	var data=JSON.parse($this.attr("data"));
                this.roleDialog.open({data:data,title:this.i18n.editrole+data.name});
            } catch (e) {
                throw new Error(tis.i18n.editroleFail+e.message);
            }
        }));
        
        // 删除角色
        this.dataTable.off("click", "button.delete").on("click", "button.delete", this.proxy(function (e) {
        	try{
        		var role = JSON.parse($(e.currentTarget).attr("data"));
        		$.u.load("com.sms.common.stdcomponentdelete");
        		(new com.sms.common.stdcomponentdelete({
        			body:"<div>"+
        				 	"<div class='alert alert-warning'>"+
        				 		"<span class='glyphicon glyphicon-exclamation-sign'></span>"+this.i18n.remaind+""+
        				 	"</div>"+
        				 "</div>",
        			title:this.i18n.removeRole+role.name,
        			dataobject:"role",
        			dataobjectids:JSON.stringify([parseInt(role.id)])
        		})).override({
        			refreshDataTable:this.proxy(function(){
        				this.dataTable.fnDraw(true);
        			})
        		});
        	}catch(e){
        		throw new Error(this.i18n.removeRoleFail+e.message);
        	}
        }));

    },
    destroy: function () {
        this._super();
    }
}, { usehtm: true, usei18n: true });


com.sms.role.role.widgetjs = ['../../../uui/widget/jqdatatable/js/jquery.dataTables.js', '../../../uui/widget/jqdatatable/js/dataTables.bootstrap.js'];
com.sms.role.role.widgetcss = [{ path: '../../../uui/widget/jqdatatable/css/jquery.dataTables.css' }, { path: '../../../uui/widget/jqdatatable/css/dataTables.bootstrap.css' }];