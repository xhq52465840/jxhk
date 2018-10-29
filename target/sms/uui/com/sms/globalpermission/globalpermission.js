//@ sourceURL=com.sms.globalpermission.globalpermission
$.u.define('com.sms.globalpermission.globalpermission', null, {
    init: function (options) {
        this._options = options;
    },
    afterrender: function (bodystr) {
    	this.i18n = com.sms.globalpermission.globalpermission.i18n;
    	// 重写“全局权限”组件的函数
        this.globalPermissionDialog.override({
            refreshDataTable: this.proxy(function () {
                this.dataTable.fnDraw();
            })
        });

        //“添加全局权限集”按钮事件
        this.qid("btn_addglobalpermission").click(this.proxy(function () {
            this.globalPermissionDialog.open();
        }));
        
        this.dataTable = this.qid("datatable").dataTable({
            searching: false,
            serverSide: true,
            bProcessing: true,
            ordering: false,
            pageLength:1000,
            "sDom":"",
            "columns": [
                { "title": this.i18n.permission ,"mData":"name"},
                { "title": this.i18n.user_userGroup ,"mData":"userGroups","sWidth":400}
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
            		"dataobject":"permissionSet",
            		"rule":JSON.stringify([[{"key":"type","value":"global"}]]),
    				"columns": JSON.stringify([{ "data":"weight" }]), 
            		"order": JSON.stringify([{ "column":0, "dir":"asc"}]),
            		"search":JSON.stringify(aoData.search)
            	},true);
            }),
            "fnServerData": this.proxy(function (sSource, aoData, fnCallBack, oSettings) {
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
                }));
            }),
            "aoColumnDefs": [
                {
                    "aTargets": 0,
                    "mRender": function (data, type, full) {
                        return '<strong>' + full.name + '</strong>' +
                                '<p class="text-muted">' + full.description + '</p>';
                                /*'<p>' +
                                    '<span class="help-block"><strong style="color:#333;">备注：</strong>' + full.note + '</span>' +
                                '</p>';*/
                    }
                },
                {
                    "aTargets": 1,
                    "mRender": function (data, type, full) {
                        var results = [];
                        if (full.userGroups && full.userGroups.length > 0) {
                            results.push('<ul style="padding-left: 15px;margin-bottom:0;">');
                            $.each(full.userGroups, function (idx, item) {
                                results.push('<li>'+item.name+'</li>' +
                                            '<li style="list-style: none;">' +
                                                "<a href='../user/UserBrowser.html?userGroup="+item.id+"' class='btn btn-link viewusers' data='"+JSON.stringify(item)+"'>"+com.sms.globalpermission.globalpermission.i18n.lookUser+"</a>" +
                                                "<a href='#' type='button' class='btn btn-link delete' data='"+JSON.stringify($.extend({"setname":full.name,"setid":full.id},item))+"'>"+com.sms.globalpermission.globalpermission.i18n.remove+"</a>" +
                                            '</li>');
                            });
                            results.push('</ul>');
                        }
                        return results.join("")
                    }
                }
            ]
        });
        
        // 删除用户组
        this.dataTable.off("click", "a.delete").on("click", "a.delete", this.proxy(function (e) {
        	e.preventDefault();
        	try{
        		var group = JSON.parse($(e.currentTarget).attr("data"));
        		this.deleteDialog =$("<div>"+this.i18n.remainA+"<strong>"+group.setname+"</strong>"+this.i18n.remainB+" <strong>"+group.name+"</strong>?</div>").dialog({
        			title:this.i18n.removePermission,
        			width:540,
        			modal:true,
        			resizable:false,
        			draggable: false,
        			buttons:[
			         {
			        	 text:this.i18n.remove,
			        	 click:this.proxy(function(e){
			        		 $(e.currentTarget).add($(e.currentTarget).next()).button("disable");
			        		 $.ajax({
                            	url: $.u.config.constant.smsqueryserver,
                                type:"post",
                                dataType: "json",
                                cache: false,
                                data: {
                            		"tokenid":$.cookie("tokenid"),
                            		"method":"stdcomponent.getbyid",
                            		"dataobject":"permissionSet",
                            		"dataobjectid":group.setid
	                            }
                            }).done(this.proxy(function(response){
                            	if(response.success){
                            		var groups=response.data.userGroups ? $.map(response.data.userGroups,function(group,idx){
                            			return group.id;
                            		}) : [];
                            		groups.splice(groups.indexOf(parseInt(group.id)),1);
                                    $.ajax({
                                    	url: $.u.config.constant.smsmodifyserver,
                                        type:"post",
                                        dataType: "json",
                                        cache: false,
                                        data: {
                                    		"tokenid":$.cookie("tokenid"),
                                    		"method":"stdcomponent.update",
                                    		"dataobject":"permissionSet",
                                    		"dataobjectid":group.setid,
                                    		"obj":JSON.stringify({"userGroups":groups})
        	                            }
                                    }).done(this.proxy(function(response){
                                    	if(response.success){
                                    		this.deleteDialog.dialog("close");
                                    		this.dataTable.fnDraw();
                                    	}else{
	                                    	$(e.currentTarget).add($(e.currentTarget).next()).button("enable");
                                    	}
                                    })).fail(this.proxy(function(jqXHR,errorText,errorThrown){
                                    	$(e.currentTarget).add($(e.currentTarget).next()).button("enable");
                                    }));
                            	}
                            })).fail(this.proxy(function(jqXHR,errorText,errorThrown){
                            	
                            }));
			        	 })
			         },
			         {
			        	 text:this.i18n.cancel,
			        	 "class":"aui-button-link",
			        	 click:this.proxy(function(){
			        		 this.deleteDialog.dialog("close");
			        	 })
			         }
        			],
        			close:this.proxy(function(){
        				this.deleteDialog.dialog("destroy").remove();
        			})
        		});
        	}catch(e){
        		throw new Error(this.i18n.error+e.message);
        	}
        }));

    },
    destroy: function () {
        this._super();
    }
}, { usehtm: true, usei18n: true });


com.sms.globalpermission.globalpermission.widgetjs = ['../../../uui/widget/jqdatatable/js/jquery.dataTables.js', '../../../uui/widget/jqdatatable/js/dataTables.bootstrap.js'];
com.sms.globalpermission.globalpermission.widgetcss = [{ path: '../../../uui/widget/jqdatatable/css/jquery.dataTables.css' }, { path: '../../../uui/widget/jqdatatable/css/dataTables.bootstrap.css' }];