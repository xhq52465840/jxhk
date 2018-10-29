//@ sourceURL=com.sms.secure.activitysecurityschemes
$.u.load("com.sms.secure.usergroup");
$.u.load("com.sms.common.stdComponentOperate");
$.u.define('com.sms.secure.configactivitysecurityschemes', null, {
    init: function (options) {
        this._options = options;
    },
    afterrender: function (bodystr) {
    	this.i18n = com.sms.secure.configactivitysecurityschemes.i18n;
    	//id
    	this.configactivitysecurityschemesid = $.urlParam().id;
		if(!this.configactivitysecurityschemesid){
			window.location.href="ViewActivitySecuritySchemes.html";
		}
		this.configname = this.qid("configname");
        //显示几个安监机构
        this.units = this.qid("units");
        this.unitsUl = this.qid("units-ul");
        // 绑定方案标题的点击事件
    	this.$.on("click",".unit-config-scheme-name",this.proxy(this._toggleScreenScheme));
		
    	// ”添加信息安全级别“按钮
    	this.btn_addconfigactivitysecurityschemes=this.qid("btn_addconfigactivitysecurityschemes");
    	
    	// 绑定“添加信息安全级别”按钮事件
    	this.btn_addconfigactivitysecurityschemes.click(this.proxy(function(e){
    		e.preventDefault();
    		this.configactivitysecurityschemesDialog.open();
    	}));
    	
    	// “编辑界面”组件
    	this.configactivitysecurityschemesDialog = new com.sms.common.stdComponentOperate($("div[umid='configactivitysecurityschemesDialog']",this.$),{
    		"title":this.i18n.addMsg,
    		"dataobject":"activitySecurityLevel",
    		"fields":[
              {name:"scheme",label:"",type:"hidden",dataType:"int",value:parseInt(this.configactivitysecurityschemesid)},        
	          {name:"name",label:this.i18n.name,type:"text",rule:{required:true},message:this.i18n.nameNotNull},
	          {name:"description",label:this.i18n.describe,type:"textarea"}
	        ]
    	});
    	
    	// 重写“编辑界面”组件的函数
    	this.configactivitysecurityschemesDialog.override({
    		refreshDataTable:this.proxy(function(){
    			this.dataTable.fnDraw();
    		})
    	});
    	
    	this.dataTable = this.qid("datatable").dataTable({
            searching: false,
            serverSide: true,
            bProcessing: true,
            ordering: false,
            pageLength:1000,
            "sDom":"",
            "columns": [
                { "title": this.i18n.safeRange ,"mData":"name"},
                { "title": this.i18n.role ,"mData":"entities","sWidth":"35%"},
                { "title": this.i18n.handle ,"mData":"id","sWidth":150}
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
            		"method":"getactivitysecuritylevels",
            		"columns":"",
            		"search":"",
            		"manage":true,
            		"scheme":this.configactivitysecurityschemesid
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
                    	this.unitsUl.empty();
                    	data.data.units&&$.each(data.data.units,this.proxy(function(idx,unit){
        					$('<li role="presentation"><a role="menuitem" tabindex="-1" href="../unitconfig/Summary.html?id='+unit.id+'"><img width="16" src="'+unit.avatar+'" height="16"/>&nbsp;'+unit.name+'</a></li>').appendTo(this.unitsUl);
        				}));
            			this.units.text(data.data.units.length);
                        fnCallBack(data.data.levels);
                    }
                })).fail(this.proxy(function (jqXHR, errorText, errorThrown) {

                })).complete(this.proxy(function(){
                }));
            }),
            "aoColumnDefs": [
                {
                    "aTargets": 0,
                    "mRender": this.proxy(function (data, type, full) {
                		return  '<strong data-id="'+full.id+'">' + full.name + (full.default?'(默认)':'')+'</strong>' +
                        '<p class="text-muted"><small>' + full.description + '</small></p>';
                    })
                },
                {
                    "aTargets": 1,
                    "mRender": function (data, type, full) {
                        var htmls=["<ul style='padding-left:15px;'>"];
                    	full.entities && $.each(full.entities,function(idx,entities){
                			htmls.push("<li>"+entities.type+"("+(entities.parameter==undefined?"任何人":entities.parameter)+")<button class='btn btn-link userdelete' data-id='"+entities.id+"'>(删除)</button></li>");
                		});
                		htmls.push("</ul>");
                        return htmls.join("");
                    }
                },
                {
                    "aTargets": 2,
                    "mRender": function (data, type, full) {
	                	return "<button class='btn btn-link add' data='"+JSON.stringify(full)+"'>"+com.sms.secure.configactivitysecurityschemes.i18n.add+"</button>"+
	                		"<button class='btn btn-link default' data='"+JSON.stringify(full)+"'>"+com.sms.secure.configactivitysecurityschemes.i18n.defaulter+"</button>"+
	                		"<button class='btn btn-link delete' data='"+JSON.stringify(full)+"'>"+com.sms.secure.configactivitysecurityschemes.i18n.remove+"</button>";
                    }
                }
            ]
        });
    	
    	// 
    	this.qid("btn_default").click(this.proxy(function(e){
    		e.preventDefault();
        	try{
	        	$.ajax({
	                url: $.u.config.constant.smsmodifyserver,
	                dataType: "json",
	                cache: false,
	                data: {
	                	"tokenid":$.cookie("tokenid"),
	            		"method":"stdcomponent.update",
	            		"dataobject":"activitySecurityScheme",
	            		"dataobjectid":this.configactivitysecurityschemesid,
	            		"obj":JSON.stringify({"defaultLevel":null})
	                }
	            }).done(this.proxy(function (data) {
	                if (data.success) {
	                	this.dataTable.fnDraw();     	
	                }
	            })).fail(this.proxy(function (jqXHR, errorText, errorThrown) {
	
	            })).complete(this.proxy(function(){
	            }));
        	}catch(e){
        		throw new Error(this.i18n.defaultFail+e.message);
        	}
    	}));
    	
    	// 增加界面
    	this.dataTable.off("click", "button.add").on("click", "button.add", this.proxy(function (e) {
        	e.preventDefault();
        	try{
        		var data = JSON.parse($(e.currentTarget).attr("data"));
        		this.configuserDialog && this.configuserDialog.destroy();
            	this.configuserDialog = new com.sms.secure.usergroup({
            	});
            	this.configuserDialog.target($("div[umid='configuserDialog']",this.$));
            	this.configuserDialog.open({"data":data,"title":"将用户/用户组/安监机构角色添加到信息安全级别"
	    		});
            	this.configuserDialog.override({
            		refreshDataTable:this.proxy(function(){
            			this.dataTable.fnDraw();
            		})
            	});
        	}catch(e){
        		throw new Error(this.i18n.addFail+e.message);
        	}
    	}));
    	
    	// 默认
    	this.dataTable.off("click", "button.default").on("click", "button.default", this.proxy(function (e) {
        	e.preventDefault();
        	try{
	        	var data = JSON.parse($(e.currentTarget).attr("data"));
	        	$.ajax({
	                url: $.u.config.constant.smsmodifyserver,
	                dataType: "json",
	                cache: false,
	                data: {
	                	"tokenid":$.cookie("tokenid"),
	            		"method":"stdcomponent.update",
	            		"dataobject":"activitySecurityScheme",
	            		"dataobjectid":this.configactivitysecurityschemesid,
	            		"obj":JSON.stringify({"defaultLevel":data.id})
	                }
	            }).done(this.proxy(function (data) {
	                if (data.success) {
	                	this.dataTable.fnDraw();     	
	                }
	            })).fail(this.proxy(function (jqXHR, errorText, errorThrown) {
	
	            })).complete(this.proxy(function(){
	            }));
        	}catch(e){
        		throw new Error(this.i18n.defaultFail+e.message);
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
	            		"dataobject":"activitySecurityLevelEntity",
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
    	
    	// 删除
        this.dataTable.off("click", "button.delete").on("click", "button.delete", this.proxy(function (e) {
        	e.preventDefault();
        	try{
        		var data = JSON.parse($(e.currentTarget).attr("data"));
        		$.u.load("com.sms.common.stdcomponentdelete");
        		(new com.sms.common.stdcomponentdelete({
        			body:"<div>"+
        				 	"<p>"+this.i18n.confirm+"</p>"+
        				 "</div>",
        			title:"删除信息安全级别："+data.name,
        			dataobject:"activitySecurityLevel",
        			dataobjectids:JSON.stringify([parseInt(data.id)])
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

com.sms.secure.configactivitysecurityschemes.widgetjs = ['../../../uui/widget/jqurl/jqurl.js','../../../uui/widget/jqdatatable/js/jquery.dataTables.js', '../../../uui/widget/jqdatatable/js/dataTables.bootstrap.js',"../../../uui/widget/spin/spin.js"
                                                         , "../../../uui/widget/jqblockui/jquery.blockUI.js"
                                                         , "../../../uui/widget/ajax/layoutajax.js"];
com.sms.secure.configactivitysecurityschemes.widgetcss = [{ path: '../../../uui/widget/jqdatatable/css/jquery.dataTables.css' }, { path: '../../../uui/widget/jqdatatable/css/dataTables.bootstrap.css' }];