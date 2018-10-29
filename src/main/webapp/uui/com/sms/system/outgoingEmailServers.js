//@ sourceURL=com.sms.system.outgoingEmailServers
$.u.define('com.sms.system.outgoingEmailServers', null, {
    init: function (options) {
        this._options = options;
        this.id=null;
    },
    afterrender: function (bodystr) {
    	this.i18n = com.sms.system.outgoingEmailServers.i18n;
    	this.dataTable = this.qid("datatable").dataTable({
            searching: false,
            serverSide: true,
            bProcessing: true,
            ordering: false,
            sDom:"",
            "columns": [
                { "title": this.i18n.name ,"mData":"name"},
                { "title": this.i18n.detail ,"mData":"id","sWidth":"45%"},
                { "title": this.i18n.handle ,"mData":"id","sWidth":200}
            ],
            "oLanguage": { //语言
                "sSearch": this.i18n.search,
                "sLengthMenu": this.i18n.everPage+"_MENU_"+this.i18n.record,
                "sZeroRecords": this.i18n.message,
                "sInfo": this.i18n.from+" _START_ "+this.i18n.to+" _END_ /"+this.i18n.all+"_TOTAL_ "+this.i18n.allData,
                "sInfoEmpty": this.i18n.withoutData,
                "sInfoFiltered": "("+this.i18n.fromAll+"_MAX_"+this.i18n.filterRecord+")",
                "sProcessing": ""+this.i18n.searching+"...",
                "oPaginate": {
                    "sFirst": "<<",
                    "sPrevious": ""+this.i18n.back+"",
                    "sNext": ""+this.i18n.next+"",
                    "sLast": ">>"
                }
            },
            "fnServerParams": this.proxy(function (aoData) {
            	$.extend(aoData,{
            		"tokenid":$.cookie("tokenid"),
            		"method":"stdcomponent.getbysearch",
            		"dataobject":"smtp",
            		"columns":JSON.stringify(aoData.columns),
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
                    	if(data.data.iTotalRecords == 0){
                    		this.qid("button-add-server").removeClass("hidden");
                    	}else{
                    		this.qid("button-add-server").addClass("hidden");
                    	}
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
				    	return '<strong>'+data+'</strong>';
				    }
				},
				{
				    "aTargets": 1,
				    "mRender": function (data, type, full) {
				    	var htmls='<dl class="dl-horizontal">'+
						    		'<dt>'+com.sms.system.outgoingEmailServers.i18n.addresser+'：</dt>'+
									'<dd>'+full.address+'</dd>'+
									'<dt>'+com.sms.system.outgoingEmailServers.i18n.prefix+'：</dt>'+
									'<dd>'+full.prefix+'</dd>'+
									'<dt>'+com.sms.system.outgoingEmailServers.i18n.host+'：</dt>'+
									'<dd>'+full.server+'</dd>'+
									'<dt>SMTP '+com.sms.system.outgoingEmailServers.i18n.port+'：</dt>'+
									'<dd>'+full.port+'</dd>'+
									'<dt>'+com.sms.system.outgoingEmailServers.i18n.account+'：</dt>'+
									'<dd>'+full.account+'</dd>'+
				    	          '</dl>';
				    	return htmls;
				    }
				},
                {
                    "aTargets": 2,
                    "mRender": this.proxy(function (data, type, full) {
                    	this.id=parseInt(full.id);
                    	this.qid("label-active").text(full.active ? this.i18n.startUse : this.i18n.forbidden);
                    	this.qid("button-active").text(full.active ? this.i18n.forbidden : this.i18n.startSender).attr("data-active",full.active);
	                	return "<a class='btn btn-link edit' href='UpdateSmtpMailServer.html?id=" + full.id + "'>"+this.i18n.edit+"</a>"+
			             	   "<button class='btn btn-link delete' data-data='"+JSON.stringify(full)+"'>"+this.i18n.remove+"</button>"+
			             	   "<button class='btn btn-link sendtestemail ' data-data='"+JSON.stringify(full)+"'>"+this.i18n.sendMail+"</button>";
                    })
                }
            ]
        });
    	    	
    	// 绑定删除事件
    	this.dataTable.on("click","button.delete",this.proxy(this.deleteSmtpMailServer));
    	
    	this.dataTable.on("click","button.sendtestemail",this.proxy(this.on_sendTestEmail_click));
    	
    	// 绑定“配置新邮件服务器”事件
    	this.qid("button-add-server").click(this.proxy(this.addSmtpMailServer));
    	
    	// 禁用&启用
    	this.qid("button-active").click(this.proxy(this.changeActive));
    	
    	
    },
    /**
     * @title 禁用&启用
     * @param e
     */
    changeActive:function(e){
    	var active = $(e.currentTarget).attr("data-active") == "false";
    	$.u.ajax({
			url: $.u.config.constant.smsmodifyserver,
			type:"post",
            dataType: "json",
            data:{
            	tokenid:$.cookie("tokenid"),
            	method:"stdcomponent.update",
        		dataobject:"smtp",
        		dataobjectid:this.id,
        		obj:JSON.stringify({"active":active})
            }
		},this.$,{size:2,backgroundColor:"#fff"}).done(this.proxy(function(response){
			if(response.success){
				$.u.alert.success("操作成功。");
				this.dataTable.fnDraw();
			}
		})).fail(this.proxy(function(jqXHR,errorText,errorThrown){
			
		}));
    }, 
    /**
     * @title 配置新邮件服务器
     * @param e
     */
    addSmtpMailServer:function(e){
    	window.location.href="UpdateSmtpMailServer.html";
    },
    /**
     * @title 发送测试邮件
     * @param e 
     * @return void
     */
    on_sendTestEmail_click: function(e){
    	$.u.ajax({
    		url: $.u.config.constant.smsqueryserver,
    		type: "post",
    		data: {
    			tokenid: $.cookie("tokenid"),
    			method: "sendTestEmail"
    		},
    		dataType: "json"
    	},this.$,{size:2,backgroundColor:"#fff"}).done(this.proxy(function(response){
    		if(response.success){
    			$.u.alert.success("发送成功。");
    		}
    	})).fail(this.proxy(function(jqXHR, errorText, errorThrown){
    		
    	}));
    },
    /**
     * @title 删除
     * @param e
     */
    deleteSmtpMailServer:function(e){
    	try {
    		$.u.load("com.sms.common.stdcomponentdelete");
            var serverdata = JSON.parse($(e.currentTarget).attr("data-data"));
            (new com.sms.common.stdcomponentdelete({
                body: "<div>" +
    				 	"<p>"+this.i18n.confirm+"</p>" +
    				 "</div>",
                title: this.i18n.removeMail + serverdata.name,
                dataobject: "smtp",
                dataobjectids: JSON.stringify([parseInt(serverdata.id)])
            })).override({
                refreshDataTable: this.proxy(function () {
                    this.dataTable.fnDraw();
                })
            });
        } catch (e) {
            throw new Error(this.i18n.removeFail + e.message);
        }
    },
    destroy: function () {
        this._super();
    }
}, { usehtm: true, usei18n: true });


com.sms.system.outgoingEmailServers.widgetjs = ['../../../uui/widget/jqdatatable/js/jquery.dataTables.js', '../../../uui/widget/jqdatatable/js/dataTables.bootstrap.js'];
com.sms.system.outgoingEmailServers.widgetcss = [{ path: '../../../uui/widget/jqdatatable/css/jquery.dataTables.css' }, { path: '../../../uui/widget/jqdatatable/css/dataTables.bootstrap.css' }];