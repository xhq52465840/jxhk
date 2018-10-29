//@ sourceURL=com.sms.unitcategory.unitcategoriesDialog
$.u.load("com.sms.common.stdComponentOperate");
$.u.load("com.sms.common.stdcomponentdelete");
$.u.define('com.sms.unitcategory.unitcategories', null, {
    init: function (options) {
        this._options = options;
    },
    afterrender: function (bodystr) {
    	this.i18n = com.sms.unitcategory.unitcategories.i18n;
    	
    	// ”添加新的安监机构类别“按钮
    	this.btn_addunitcategories=this.qid("btn_addunitcategories");
    	
    	// 绑定“添加新的安监机构类别”按钮事件
    	this.btn_addunitcategories.click(this.proxy(function(e){
    		e.preventDefault();
    		this.unitcategoriesDialog.open();
    	}));
    	
    	// “编辑界面”组件
    	this.unitcategoriesDialog = new com.sms.common.stdComponentOperate($("div[umid='unitcategoriesDialog']",this.$),{
    		"title":this.i18n.addnewSafeAgency,
    		"dataobject":"unitCategory",
    		"fields":[      
	          {name:"name",label:this.i18n.name,type:"text",rule:{required:true},message:this.i18n.nameNotNull,maxlength:50},
	          {name:"description",label:this.i18n.describe,type:"text",maxlength:255}
	        ]
    	});
    	
    	// 重写“编辑界面”组件的函数
    	this.unitcategoriesDialog.override({
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
                { "title": this.i18n.name ,"mData":"name","sWidth":300},
                { "title": this.i18n.describe ,"mData":"description","sWidth":300},
                { "title": this.i18n.safeAgency ,"mData":"units","sWidth":300},
                { "title": this.i18n.handle ,"mData":"id"}
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
            		"method":"stdcomponent.getbysearch",
            		"dataobject":"unitCategory",
            		"columns":JSON.stringify(aoData.columns),
            		"search":JSON.stringify(aoData.search)
            	},true);
            }),
            "fnServerData": this.proxy(function (sSource, aoData, fnCallBack, oSettings) {
            	$.u.ajax({
                    url: $.u.config.constant.smsqueryserver,
                    dataType: "json",
                    cache: false,
                    type:"post",
                    data: aoData
                },this.qid("datatable")).done(this.proxy(function (data) {
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
                    "mRender": this.proxy(function (data, type, full) {
	                    return  '<strong data-id="' + full.id + '">' + full.name + '</strong>' ;
                    })
                },
                {
                    "aTargets": 1,
                    "mRender": this.proxy(function (data, type, full) {
	                    return  '<span data-id="' + full.id + '">' + (data || '') + '</span>' ;
                    })
                },
                {
                    "aTargets": 2,
                    "mRender": function (data, type, full) {
                        var htmls = ["<ul style='padding-left:15px;'>"];
                    	full.units && $.each(full.units,function(idx, units){
                			htmls.push('<li><a href="../unitbrowse/Summary.html?id=' + units.id + '">' + units.name + '</button></li>');
                		});
                		htmls.push("</ul>");
                        return htmls.join("");
                    }
                },
                {
                    "aTargets": 3,
                    "mRender": function (data, type, full) {
                    	var htmls = "";
                    	htmls += "<button class='btn btn-link edit' data='" + JSON.stringify(full) + "'>" + com.sms.unitcategory.unitcategories.i18n.edit + "</button>";
                    	if(!full.units){
                    		 htmls += "<button class='btn btn-link delete' data='" + JSON.stringify(full) + "'>" + com.sms.unitcategory.unitcategories.i18n.remove + "</button>";
                    	}
	                	return htmls;
                    }
                }
            ]
        });
    	
    	// 增加界面
    	this.dataTable.off("click", "button.edit").on("click", "button.edit", this.proxy(function (e) {
        	e.preventDefault();
        	try{
        		var data = JSON.parse($(e.currentTarget).attr("data"));
            	this.unitcategoriesDialog.open({"data":data,"title":this.i18n.editSurface+data.name});
        	}catch(e){
        		throw new Error(this.i18n.editFail+e.message);
        	}
    	}));

    	// 删除界面
        this.dataTable.off("click", "button.delete").on("click", "button.delete", this.proxy(function (e) {
        	e.preventDefault();
        	try{
        		var data = JSON.parse($(e.currentTarget).attr("data"));
        		(new com.sms.common.stdcomponentdelete({
        			body:"<div>"+
        				 	"<p>"+this.i18n.affirm+"</p>"+
        				 	"<p><span class='text-danger'>"+this.i18n.notice+"</span>"+this.i18n.noticef+"</p>"+
        				 "</div>",
        			title:this.i18n.removeSafeAgency+data.name,
        			dataobject:"unitCategory",
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
    destroy: function () {
        this._super();
    }
}, { usehtm: true, usei18n: true });

com.sms.unitcategory.unitcategories.widgetjs = ['../../../uui/widget/jqdatatable/js/jquery.dataTables.js', '../../../uui/widget/jqdatatable/js/dataTables.bootstrap.js'];
com.sms.unitcategory.unitcategories.widgetcss = [{ path: '../../../uui/widget/jqdatatable/css/jquery.dataTables.css' }, { path: '../../../uui/widget/jqdatatable/css/dataTables.bootstrap.css' }];