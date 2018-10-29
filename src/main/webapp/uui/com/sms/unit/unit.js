//@ sourceURL=com.sms.unit.unit
$.u.load("com.sms.common.stdcomponentdelete");
$.u.define('com.sms.unit.unit', null, {
    init: function (options) {
        this._options = options;
    },
    afterrender: function (bodystr) {
    	this.i18n = com.sms.unit.unit.i18n;
    	this.btn_addunit=this.qid("btn_addunit");		
    	this.unitDialogEdit = null;
    	this.organizationDialog = null;
    	this.coordDialog = null;
    	
    	this.dataTable = this.qid("datatable").dataTable({
            searching: false,
            serverSide: true,
            bProcessing: true,
            ordering: false,
            pageLength:1000,
            "sDom":"",
            "columns": [
                { "title": "" ,"mData":"id","sWidth":30},
                { "title": this.i18n.name ,"mData":"name","sWidth":150},
                { "title": this.i18n.flag ,"mData":"code","sWidth":80},
                { "title": this.i18n.safeAgency ,"mData":"responsibler","sWidth":150},
                { "title": this.i18n.code ,"mData":"category","sWidth":80},
                { "title": this.i18n.handle ,"mData":"id","sWidth":80}
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
            		"method":"getunits",
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
                        fnCallBack(data);
                    }
                })).fail(this.proxy(function (jqXHR, errorText, errorThrown) {

                })).complete(this.proxy(function(){
                }));
            }),
            "aoColumnDefs": [
                {
                    "aTargets": 0,
                    "mRender": this.proxy(function (data, type, full) {
	                    	return  '<img src="'+full.avatarUrl+'" width="24" height="24"></img>' ;
                    })
                },
                {
                    "aTargets": 1,
                    "mRender": this.proxy(function (data, type, full) {
                    		return  '<a href="../unitbrowse/Summary.html?id='+full.id+'">' + full.name + '</a>' ;
                    })
                },
                {
                    "aTargets": 2,
                    "mRender": this.proxy(function (data, type, full) {
	                    	return  '<small data-id="'+full.id+'">' + data + '</small>' ;
                    })
                },
                {
                    "aTargets": 3,
                    "mRender": this.proxy(function (data, type, full) {
	                    	return  '<small data-id="'+full.id+'">' + (full.responsibleUser==null?'':full.responsibleUser) + '</small>' ;
                    })
                },
                {
                    "aTargets": 4,
                    "mRender": function (data, type, full) {
	                	return data;
                    }
                },
                {
                    "aTargets": 5,
                    "mRender": function (data, type, full) {
	                	return "<button class='btn btn-link edit' data='"+JSON.stringify(full)+"'>"+com.sms.unit.unit.i18n.edit+"</button>"+
	                		   "<button class='btn btn-link maintain' data='"+JSON.stringify(full)+"'>"+com.sms.unit.unit.i18n.groupAgency+"</button>"+
	                		   "<button class='btn btn-link coord' data='"+JSON.stringify(full)+"'>"+com.sms.unit.unit.i18n.coord+"</button>"+
	                		   "<button class='btn btn-link delete' data='"+JSON.stringify(full)+"'>"+com.sms.unit.unit.i18n.remove+"</button>";
                    }
                }
            ]
        });
    	

    	this.btn_addunit.click(this.proxy(this.on_addUnit_click));
    	this.dataTable.off("click", "button.edit").on("click", "button.edit", this.proxy(this.on_editUnit_click));
    	this.dataTable.off("click", "button.maintain").on("click", "button.maintain", this.proxy(this.on_maintain_click));
    	this.dataTable.off("click", "button.coord").on("click", "button.coord", this.proxy(this.on_coord_click));  
    	this.dataTable.off("click", "button.delete").on("click", "button.delete", this.proxy(this.on_removeUnit_click));
    	
    },
    /**
     * @title 添加安监机构
     * @return void
     */
    on_addUnit_click:function(e){
		e.preventDefault();
		if(this.unitDialogEdit == null){
			this._initUnitDialog();
		}
		this.unitDialogEdit.open();
    },
    /**
     * @title 编辑安监机构
     * @return void
     */
    on_editUnit_click:function(e){
    	e.preventDefault();
    	try{
    		var data = JSON.parse($(e.currentTarget).attr("data"));
    		data.responsibleUserDisplayName = data.responsibleUser;
    		data.responsibleUser = data.responsibleUserId;
    		data.categoryDisplayName = data.category;
    		data.category = data.categoryId;
    		if(this.unitDialogEdit == null){
    			this._initUnitDialog();
    		}
        	this.unitDialogEdit.open({"data":data,"title":this.i18n.editSafeAgency+data.name});
    	}catch(e){
    		throw new Error(this.i18n.editFail+e.message);
    	}
    },
    /**
     * @title 维护组织机构
     * @param e {object} 鼠标对象
     * @return void
     */
    on_maintain_click:function(e){
    	 var $this = $(e.currentTarget);
         try {
        	 if(this.organizationDialog == null){
        		 $.u.load("com.sms.unit.organizationDialog");
        		 this.organizationDialog = new com.sms.unit.organizationDialog($("div[umid=organizationDialog]",this.$));
                 this.organizationDialog.override({
                     refreshDataTable: this.proxy(function () {
                         this.dataTable.fnDraw();
                     })
                 });
        	 }
             this.organizationDialog.open(JSON.parse($this.attr("data")));
         } catch (e) {
             throw new Error(this.i18n.editFail+e.message);
         }
    },
    /**
     * @title 设置坐标
     * @param e {object} 鼠标对象
     * @return void
     */
    on_coord_click:function(e){
    	try{
    		var data = $.parseJSON($(e.currentTarget).attr("data"));
    		$.u.ajax({
            	url: $.u.config.constant.smsqueryserver,
                type:"post",
                dataType: "json",
                cache: false,
                data: {
            		"tokenid":$.cookie("tokenid"),
            		"method":"stdcomponent.getbysearch",
            		"dataobject":"unitGeography",
            		"rule":JSON.stringify([[{"key":"unit","value":data.id}]])
                }
            },this.dataTable).done(this.proxy(function(response){
            	if(response.success){
            		var tempArray = [],item = null;
            		if(response.data.aaData.length>0){
            			item = response.data.aaData[0];
            		}else{
            			tempArray.push({"name":"unit","dataType":"int","type":"hidden","value":data.id});
            		}
            		tempArray.push({"name":"geography","label":"城市","dataType":"int","type":"select",rule:{required:true},message:"城市不能为空",option:{
            			"params":{"dataobject":"geography"},
            			"ajax":{
	    	        	  	"data":function(term){
	    	        	  		return {
	    	        	  			"tokenid":$.cookie("tokenid"),
	    	        	  			"method":"stdcomponent.getbysearch",
	    	        	  			"dataobject":"geography",
	    	        	  			"rule":JSON.stringify([[{"key":"city","op":"like","value":term}]])}
	    	        	  	}
	    	          	  },
	    	          	  "formatSelection":function(item){
	    	          		  return item.city;
	    	          	  },
	    	          	  "formatResult":function(item){
	    	          		  return item.city;
	    	          	  }
    	          	}});
            		if(!this.coordDialog){
            			$.u.load("com.sms.common.stdComponentOperate");
            		}else{
            			this.coordDialog.destroy();
            		}
        			this.coordDialog = new com.sms.common.stdComponentOperate($("div[umid=coordDialog]",this.$),{
        				title:"设置城市",
        				dataobject:"unitGeography",
        				fields:tempArray
        			});
        			if(item){
        				this.coordDialog.open({"data":{id:item.id,geography:item.geography.id},"title":"设置城市"});
        			}else{
        				this.coordDialog.open();
        			}
            	}
            })).fail(this.proxy(function(jqXHR,errorText,errorThrown){
            	
            }));
    	}catch(e){}
    },
    /**
     * @title 删除安监机构
     * @param e {object} 鼠标对象
     * @return void
     */
    on_removeUnit_click:function(e){
    	e.preventDefault();
    	try{
    		var data = JSON.parse($(e.currentTarget).attr("data"));
    		(new com.sms.common.stdcomponentdelete({
    			body:"<div>"+
    				 	"<p>"+this.i18n.affirm+"</p>"+
    				 "</div>",
    			title:this.i18n.removeSafeAgency+data.name,
    			dataobject:"unit",
    			dataobjectids:JSON.stringify([parseInt(data.id)])
    		})).override({
    			refreshDataTable:this.proxy(function(){
    				this.dataTable.fnDraw();
    			})
    		});
    	}catch(e){
    		throw new Error(this.i18n.removeFail+e.message);
    	}
    },
    /**
     * @title 初始化安监机构组件
     * @return void
     */
    _initUnitDialog:function(){
    	$.u.load("com.sms.unit.unitDialogEdit");
    	this.unitDialogEdit = new com.sms.unit.unitDialogEdit($("div[umid='unitDialogEdit']",this.$),null);
    	this.unitDialogEdit.override({
    		refreshDataTable:this.proxy(function(){
    			this.dataTable.fnDraw();
    		})
    	});
    },
    destroy: function () {
        this._super();
    }
}, { usehtm: true, usei18n: true });

com.sms.unit.unit.widgetjs = ['../../../uui/widget/jqdatatable/js/jquery.dataTables.js', '../../../uui/widget/jqdatatable/js/dataTables.bootstrap.js'];
com.sms.unit.unit.widgetcss = [{ path: '../../../uui/widget/jqdatatable/css/jquery.dataTables.css' }, { path: '../../../uui/widget/jqdatatable/css/dataTables.bootstrap.css' }];