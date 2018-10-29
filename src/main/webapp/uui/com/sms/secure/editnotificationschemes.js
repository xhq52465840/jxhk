//@ sourceURL=com.sms.secure.editnotificationschemes
$.u.load("com.sms.secure.editnotificationschemesDialog");
$.u.load("com.sms.common.stdcomponentdelete");
$.u.define('com.sms.secure.editnotificationschemes', null, {
    init: function (options) {
        this._options = options;
    },
    afterrender: function (bodystr) {
    	this.i18n = com.sms.secure.editnotificationschemes.i18n;
    	//id
    	this.id =$.urlParam().id;
		if(!this.id){
			window.location.href="ViewNotificationSchemes.html";
		}

		this.configname = this.qid("configname");
		this.configtext = this.qid("configtext");

        //显示几个安监机构
        this.units = this.qid("units");
        this.unitsUl = this.qid("units-ul");
        // 绑定方案标题的点击事件
    	this.$.on("click",".unit-config-scheme-name",this.proxy(this._toggleScreenScheme));

    	// “编辑界面”组件
    	this.editnotificationschemesDialog = new com.sms.secure.editnotificationschemesDialog($("div[umid='editnotificationschemesDialog']",this.$),{
    		"dataobject":"notificationSchemeItem",
    		"id":this.id
    	});

    	// 重写“编辑界面”组件的函数
    	this.editnotificationschemesDialog.override({
    		refreshDataTable:this.proxy(function(){
    			this.dataTable.fnDraw();
    		})
    	});
    	
    	// ”添加通知设置“按钮
    	this.btn_addnotificationschemes=this.qid("btn_addnotificationschemes");

    	// 绑定“添加通知设置”按钮事件
    	this.btn_addnotificationschemes.click(this.proxy(function(e){
    		e.preventDefault();
    		this.editnotificationschemesDialog.open({"title":this.i18n.addCase+this.configName});
    	}));
    	
    	/*
    	 * 获取该id下的数据
    	 * data
    	 */
    	this.dataTable = this.qid("datatable").dataTable({
            searching: false,
            serverSide: true,
            bProcessing: true,
            ordering: false,
            pageLength:1000,
            "sDom":"",
            "columns": [
                { "title": this.i18n.event ,"name":"id"},
                { "title": this.i18n.noticeSet ,"mData":"id","sWidth":"35%"},
                { "title": this.i18n.handle ,"mData":"id","sWidth":100}
            ],
            "aaData":[

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
            		"method":"getnotificationschemeitems",
            		"notificationScheme":parseInt(this.id),
            		"manage":true
            	},true);
            }),
            "fnServerData": this.proxy(function (sSource, aoData, fnCallBack, oSettings) {
            	$.u.ajax({
                    url: $.u.config.constant.smsqueryserver,
                    dataType: "json",
                    cache: false,
                    data: aoData
                },this.qid("datatable")).done(this.proxy(function (data) {
                    if (data.success) {
                    	this.configname.text(data.data.name);
                    	this.configtext.text(data.data.name);
                    	this.configName = data.data.name;
                    	this.unitsUl.empty();
                    	data.data.units&&$.each(data.data.units,this.proxy(function(idx,unit){
        					$('<li role="presentation"><a role="menuitem" tabindex="-1" href="../unitconfig/Summary.html?id='+unit.id+'"><img width="16" src="'+unit.avatar+'" height="16"/>&nbsp;'+unit.name+'</a></li>').appendTo(this.unitsUl);
        				}));
            			this.units.text(data.data.units.length);
                        fnCallBack(data.data.events);
                    }
                })).fail(this.proxy(function (jqXHR, errorText, errorThrown) {

                })).complete(this.proxy(function(){
                }));
            }),
            "aoColumnDefs": [
                {
                    "aTargets": 0,
                    "mRender": this.proxy(function (data, type, full) {
                    	return  '<strong>' + full.name +'</strong> '+'(<small>'+(full.system?"系统":"")+'</small>)';
                    })
                },
                {
                    "aTargets": 1,
                    "mRender": function (data, type, full) {
                    	var htmls=["<ul style='padding-left:15px;'>"];
                    	full.items && $.each(full.items,function(idx,items){
                			htmls.push("<li>"+items.type+"("+(items.parameter==undefined?"任何人":items.parameter)+")<button class='btn btn-link userdelete' data-id='"+items.id+"'>(删除)</button></li>");
                		});
                		htmls.push("</ul>");
                        return htmls.join("");
                    }
                },
                {
                    "aTargets": 2,
                    "mRender": function (data, type, full) {
	                	return "<button class='btn btn-link add' data='"+JSON.stringify(full)+"'>"+com.sms.secure.editnotificationschemes.i18n.add+"</button>";
                    }
                }
            ]
        });
    	
    	// 增加界面
    	this.dataTable.off("click", "button.add").on("click", "button.add", this.proxy(function (e) {
        	e.preventDefault();
        	try{
        		var data = JSON.parse($(e.currentTarget).attr("data"));
        		this.editnotificationschemesDialog.open({"data":data,"title":this.i18n.addCase+this.configName,"operate":"EDIT"});
        	}catch(e){
        		throw new Error(this.i18n.addFail+e.message);
        	}
    	}));

    	
    	/*
    	 * 删除用户组
    	 * method delete
    	 * dataobjectids：
    	 */
    	this.dataTable.off("click", "button.userdelete").on("click", "button.userdelete", this.proxy(function (e) {
        	e.preventDefault();
        	try{
        		var data = $(e.currentTarget).attr("data-id");
	        	$.ajax({
	                url: $.u.config.constant.smsmodifyserver,
	                dataType: "json",
	                cache: false,
	                data: {
	                	"tokenid":$.cookie("tokenid"),
	            		"method":"stdcomponent.delete",
	            		"dataobject":"notificationSchemeItem",
	            		"dataobjectids":JSON.stringify([parseInt(data)])
	                }
	            }).done(this.proxy(function (data) {
	                if (data.success) {
	                	this.dataTable.fnDraw();
	                }
	            })).fail(this.proxy(function (jqXHR, errorText, errorThrown) {
	
	            })).complete(this.proxy(function(){
	            }));
        	}catch(e){
        		throw new Error(this.i18n.removeFail+e.message);
        	}
    	}));
    	   	
    },
    _toggleScreenScheme:function(e){
    	var $sender = $(e.currentTarget),$prev=$sender.prev();
		$sender.closest("div.unit-config-scheme-item").toggleClass("collapsed");
		if($prev.hasClass("glyphicon-chevron-right")){
			$prev.removeClass("glyphicon-chevron-right").addClass("glyphicon-chevron-down");
		}else{
			$prev.removeClass("glyphicon-chevron-down").addClass("glyphicon-chevron-right");
		}
    },
    destroy: function () {
        this._super();
    }
}, { usehtm: true, usei18n: true });

com.sms.secure.editnotificationschemes.widgetjs = ['../../../uui/widget/jqurl/jqurl.js','../../../uui/widget/jqdatatable/js/jquery.dataTables.js', '../../../uui/widget/jqdatatable/js/dataTables.bootstrap.js',"../../../uui/widget/spin/spin.js"
                                                   , "../../../uui/widget/jqblockui/jquery.blockUI.js"
                                                   , "../../../uui/widget/ajax/layoutajax.js"];
com.sms.secure.editnotificationschemes.widgetcss = [{ path: '../../../uui/widget/jqdatatable/css/jquery.dataTables.css' }, { path: '../../../uui/widget/jqdatatable/css/dataTables.bootstrap.css' }];