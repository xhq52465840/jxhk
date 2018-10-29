//@ sourceURL=com.sms.plugin.file.fileTypeActivityType
$.u.define('com.sms.plugin.file.fileTypeActivityType', null, {
    init: function (options) {
        this._options = options;
        this._SELECT2_PAGE_LENGTH = 10;
    },
    afterrender: function (bodystr) {
    	this.i18n = com.sms.plugin.file.fileTypeActivityType.i18n;
    	
    	this.dataTable = this.qid("datatable").dataTable({
            searching: false,
            serverSide: true,
            bProcessing: true,
            ordering: false,
            paging: false,
            dom: "",
            "columns": [
                { "title": this.i18n.columns.activityType ,"mData":"activityType", "sWidth": "30%"},
                { "title": this.i18n.columns.fileTypeKey ,"mData":"fileTypeKey", "sWidth": 150},
                { "title": this.i18n.columns.fileTypeName ,"mData":"fileTypeName", "sWidth": "30%"},
                { "title": this.i18n.columns.handle,"mData":"id","sWidth":200}
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
            		"tokenid": $.cookie("tokenid"),
            		"method": "stdcomponent.getbysearch",
            		"dataobject": "atypeFtypeEntity",
            		"columns": JSON.stringify(aoData.columns),
            		"search": JSON.stringify(aoData.search),
                    "order": JSON.stringify([{column: 0, dir: "desc"}]),
            		"rule": JSON.stringify([
                        [{"key":"activityType.name","op":"like","value":this.qid("activityTypeName").val()}],
                        [{"key":"fileTypeName","op":"like","value":this.qid("fileTypeName").val()}]
                    ]),
            	},true);
            }),
            "fnServerData": this.proxy(function (sSource, aoData, fnCallBack, oSettings) {
            	$.u.ajax({
                    url: $.u.config.constant.smsqueryserver,
                    dataType: "json",
                    type: "post",
                    cache: false,
                    data: aoData
                }, this.qid("datatable")).done(this.proxy(function (data) {
                    if (data.success) {
                    	fnCallBack(data.data);
                    }
                })).fail(this.proxy(function (jqXHR, errorText, errorThrown) {

                })).complete(this.proxy(function(){
                }));
            }),
            "rowCallback": function( row, data, index ) {
                $(row).data("data", data);
            },
            "aoColumnDefs": [
                {
                    "aTargets": 2,
                    "mRender": this.proxy(function (data, type, full) {
                    	return data ? data : '';
                    })
                },
                {
                    "aTargets": 3,
                    "mRender": this.proxy(function (data, type, full) {
	                	return "<button class='btn btn-link setdefault' >" + (full.defaultType === "Y" ? this.i18n.buttons.cancelDefault : this.i18n.buttons.setAsDefault) + "</button>" +
                               "<button class='btn btn-link edit' data='" + JSON.stringify(full) + "'>" + this.i18n.buttons.edit + "</button>"+
                               "<button class='btn btn-link delete' >" + this.i18n.buttons.remove + "</button>";
                    })
                }
            ]
        });

    	this.qid("btn_addActivityType").click(this.proxy(this.on_addActivityType_click));
    	this.qid("btn_filter").click(this.proxy(this.on_filter_click));
    	this.qid("btn_resetfilter").click(this.proxy(this.on_reset_click));
        this.dataTable.off("click", "button.setdefault").on("click", "button.setdefault", this.proxy(this.on_setDefault_click));
        this.dataTable.off("click", "button.delete").on("click", "button.delete", this.proxy(this.on_removeActivityType_click));
        this.dataTable.off("click", "button.edit").on("click", "button.edit", this.proxy(this.on_editActivityType_click));
    	
    },
    /**
     * @title 搜索
     * @return void
     */
    on_filter_click: function(e){
    	this.dataTable.fnDraw(false);
    },
    /**
     * @title 重置
     * @return void
     */
    on_reset_click: function(e){
    	this.qid("activityTypeName").val("");
        this.qid("fileTypeName").val("");
    	this.dataTable.fnDraw(false);
    },
    /**
     * @title 添加安全信息类型
     * @param e {object} 鼠标对象
     * @return void
     */
    on_addActivityType_click:function(e){
    	if(this.activityTypeDialog == null){
    		this._initActivityTypeDialog();
    	}    	
    	this.activityTypeDialog.open();
    },
    on_setDefault_click: function(e){
        var data = $(e.currentTarget).closest("tr").data("data");
        if(data){
            $.u.ajax({
                url: $.u.config.constant.smsmodifyserver,
                type: "post",
                dataType: "json",
                data: {
                    tokenid: $.cookie("tokenid"),
                    method: "stdcomponent.update",
                    dataobject: "atypeFtypeEntity",
                    dataobjectid: data.id,
                    obj: JSON.stringify({"defaultType": data.defaultType === "Y" ? "N" : "Y"})
                }
            }, $(e.currentTarget).closest("tr")).done(this.proxy(function(response){
                if(response.success){
                    this.dataTable.fnDraw();
                }
            }));
        }
    },
    on_editActivityType_click: function(e){
        var data = $(e.currentTarget).closest("tr").data("data");
        if(data){
            data = $.extend(true, {}, data);
            data.activityType = data.activityTypeId;
            if(this.activityTypeDialog == null){
                this._initActivityTypeDialog();
            }       
            data.fileTypeKey = {
                id: data.fileTypeKey,
                name: data.fileTypeName
            };
            this.activityTypeDialog.open({
                "title": this.i18n.editActivityTypeDialog.editActivityType,
                "data": data
            });
        }
    },
    /**
     * @title 删除安全信息类型
     * @param e {object} 鼠标对象
     * @return void 
     */
    on_removeActivityType_click:function(e){ 
		var data = $(e.currentTarget).closest("tr").data("data");
        if(data){
    		$.u.load("com.sms.common.stdcomponentdelete");
    		(new com.sms.common.stdcomponentdelete({
    			body: "<div>"+
    				 	"<p>"+this.i18n.removeActivityTypeDialog.choose+"</p>"+
    				 "</div>",
    			title: this.i18n.removeActivityTypeDialog.removeActivityType + "：" + data.activityType,
    			dataobject: "atypeFtypeEntity",
    			dataobjectids: JSON.stringify([parseInt(data.id)])
    		})).override({
    			refreshDataTable:this.proxy(function(){
    				this.dataTable.fnDraw();
    			})
    		});
        }
    },
    /**
     * @title 初始化模态层
     * @return void
     */
    _initActivityTypeDialog:function(){
    	$.u.load("com.sms.common.stdComponentOperate");
    	this.activityTypeDialog = new com.sms.common.stdComponentOperate($("div[umid='activityTypeDialog']",this.$),{
    		"title":com.sms.plugin.file.fileTypeActivityType.i18n.addActivityType,
    		"dataobject":"atypeFtypeEntity",
    		"fields":[
	          {name:"activityType", label:this.i18n.form.activityType, dataType: "int", type:"select", rule:{required:true}, message:this.i18n.messages.activityTypeNotNull,
	        	  option: {
	        		  params: { "dataobject": "activityType" },
	        		  ajax: {
	        			  data: this.proxy(function(term, page){
	        				  return {
	        					  "tokenid": $.cookie("tokenid"),
			        			  "method": "stdcomponent.getbysearch",
			        			  "rule": JSON.stringify([[{"key":"name","op":"like","value":term}]]),
			        			  "start": (page - 1) * this._SELECT2_PAGE_LENGTH,
			        			  "length": this._SELECT2_PAGE_LENGTH,
	        					  "dataobject": "activityType"
	        				  };
	        			  }),
        				  success: this.proxy(function(response, page){ 
        					  return {
        						  "results": response.data.aaData,
        						  "more": response.data.iTotalRecords > (page * this._SELECT2_PAGE_LENGTH)
        					  };
        				  })
	        		  }
	        	  }
	          },
              // {name:"fileTypeKey", maxLength: 10, label: this.i18n.form.fileTypeKey, type: "text", dataType: "int", rule:{required:true, digits: true}, message:{required:this.i18n.messages.fileTypeKeyNotNull, digits: this.i18n.messages.fileTypeKeyNotNumber}},
              {name:"fileTypeKey", label:this.i18n.form.fileTypeName, dataType: "int", type:"select", rule:{required:true}, message:this.i18n.messages.fileTypeNameNotNull,
                  option: {
                      params: { "dataobject": "fileType" },
                      ajax: {
                          data: this.proxy(function(term, page){
                              return {
                                  "tokenid": $.cookie("tokenid"),
                                  "method": "getSafetyInfoType",
                                  "term" :term
                              };
                          }),
                          success: this.proxy(function(response, page){ 
                              return {
                                  "results": response.data,
                                  "more": response.data.length > (page * this._SELECT2_PAGE_LENGTH)
                              };
                          })
                      }
                  }
              }
	        ]
    	});
    	this.activityTypeDialog.override({
    		refreshDataTable:this.proxy(function(){
    			this.dataTable.fnDraw();
    		})
    	});
    },
    destroy: function () {
        this._super();
    }
}, { usehtm: true, usei18n: true });


com.sms.plugin.file.fileTypeActivityType.widgetjs = ['../../../../uui/widget/jqdatatable/js/jquery.dataTables.js',
                                                     '../../../../uui/widget/jqdatatable/js/dataTables.bootstrap.js'];
com.sms.plugin.file.fileTypeActivityType.widgetcss = [{ path: '../../../../uui/widget/jqdatatable/css/jquery.dataTables.css' },
                                                      { path: '../../../../uui/widget/jqdatatable/css/dataTables.bootstrap.css' }];