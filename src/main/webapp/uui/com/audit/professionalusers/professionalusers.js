//@ sourceURL=com.sms.professionalusers.professionalusers
$.u.load("com.sms.common.stdComponentOperate");
$.u.load("com.sms.common.stdcomponentdelete");
$.u.define('com.audit.professionalusers.professionalusers', null, {
	//copy from com.sms.group.group
    init: function (options) {
        this._options = options;
    },
    afterrender: function (bodystr) {
    	this.unitArray=[];
    	var	unitArray=[];
    	var	fristoption=true;
    	this.i18n = com.audit.professionalusers.professionalusers.i18n;
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
	          {name:"name",
	        	  maxlength: 255,
	        	  label:this.i18n.name,
	        	  type:"text",
	        	  rule:{required:true},
	        	  message:this.i18n.nameNotNull
	          }
	        ]
    	});
    	
    	// 重写“用户组”组件的函数
        this.groupDialog.override({
            refreshDataTable: this.proxy(function () {
                this.dataTable.fnDraw(true);
            })
        });
        
        // 重写“用户组成员”组件的函数
       /* this.groupMembers.override({
            refreshDataTable: this.proxy(function () {
                this.dataTable.fnDraw(true);
            })
        });*/
        // 重写“编辑成员”组件的函数
        this.prousermembers.override({
            refreshDataTable: this.proxy(function () {
            	//this.dataTable.fnDestroy(true);
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
            this.clearselect2();
            this.dataTable.fnDraw();
        }));

        this.dataTable = this.qid("datatable").dataTable({
            searching: false,
            serverSide: true,
            bProcessing: true,
            ordering: false,
            bInfo : true,
            iDisplayLength:1,
            pageLength:30,
            sDom: "t<ip>",
            "columns": [
                { "title": this.i18n.Security_agencies ,"mData":"unit"},
                { "title": this.i18n.professionalname ,"mData":"profession"},
                { "title": this.i18n.userCount ,"mData":"users", "sWidth": "10%" },
                { "title": this.i18n.namedisc ,"mData":"users", "sWidth": "35%"},
                { "title": this.i18n.handle,"mData":"id", "sWidth": 150 }
            ],
            "oLanguage": { //语言
                "sSearch": this.i18n.search,
                "sLengthMenu":this.i18n.everPage+" _MENU_ "+this.i18n.record,
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
            	var unit,profession,name;
            	if($.trim(this.qid("securityagencies").val())){
            		unit=$.trim(this.qid("securityagencies").val());
            	}
            	if($.trim(this.qid("professional").val())){
            		profession=$.trim(this.qid("professional").val());
            	}
            	if($.trim(this.qid("username").val())){
            		name=$.trim(this.qid("username").val())
            	}
            	$.extend(aoData,{
            		"tokenid":$.cookie("tokenid"),
            		"method":"getProfessionUserBySearch",
            		"unit":unit,
            		"profession":profession,
            		"name":name
            	},true);
            	delete aoData.columns;
            	delete aoData.search;
            	delete aoData.order;
            }),
            "fnServerData": this.proxy(function (sSource, aoData, fnCallBack, oSettings) {
            	$.u.ajax({
                    url: $.u.config.constant.smsqueryserver,
                    type:"post",
                    dataType: "json",
                    cache: false,
                    async:false,
                    data: aoData
                }).done(this.proxy(function (data) {
                    if (data.success) {
                        fnCallBack(data.data);
                    	//data.data.aaData?this.dataunit(data.data.aaData):"";
                    }
                })).fail(this.proxy(function (jqXHR, errorText, errorThrown) {

                }));
            
            }),
            "aoColumnDefs": [
                             
                {
                    "aTargets": 2,
                    "mRender": function (data, type, full) {//yonghushu
/*                        return "<a href='../user/UserBrowser.html?userGroup="+full.id+"' class='btn btn-link viewusers'  data='"+JSON.stringify(full)+"'>"+(data ? data.length : "0")+"</a>";
*/                        return "<a href='#' class='btn btn-link viewusers'  data='"+JSON.stringify(full)+"'>"+(data ? data.length : "0")+"</a>";

                    }
                },
                {
                    "aTargets": 3,
                    "mRender": function (data, type, full) {//yonghu
                    	var htmls=["<ul style='padding-left:15px;'>"];
                		full.users && $.each(full.users,function(idx,user){
                			htmls.push("<li userid="+user.userId+">"+user.userFullName+"</li>");
                		});
                		htmls.push("</ul>");
                        return htmls.join("");
                    }
                },
                {
                    "aTargets": 4,
                    "mRender": function (data, type, full) {
                    	/*return "<button type='button' class='btn btn-link edit' data='" + JSON.stringify(full) + "'>" + com.sms.professionalusers.professionalusers.i18n.edit + "</button>" +
                               "<button type='button' class='btn btn-link editmembers' data='" + JSON.stringify(full) + "'>" + com.sms.professionalusers.professionalusers.i18n.editMember + "</button>" +
                               "<button type='button' class='btn btn-link delete'  data='" + JSON.stringify(full) + "'>" + com.sms.professionalusers.professionalusers.i18n.remove + "</button>";
                    */
                    	return  "<button type='button' class='btn btn-link editmembers' data='" + JSON.stringify(full) + "'>" + com.audit.professionalusers.professionalusers.i18n.editMember + "</button>"; 
      
                    }
                }
            ]
        });

        // 编辑用户组
        this.dataTable.off("click", "button.edit").on("click", "button.edit", this.proxy(function (e) {
            try{
                var data = JSON.parse($(e.currentTarget).attr("data"));
                this.groupDialog.open({
                    "title": this.i18n.editDialogTitle +"iiii"+ data.name,
                    "data": data
                });
            }catch(e){
                throw new Error(this.i18n .error+e.message);
            }
        }));

        // 编辑用户组成员
        this.dataTable.off("click", "button.editmembers").on("click", "button.editmembers", this.proxy(function (e) {
        	try{
        		this.prousermembers.open(JSON.parse($(e.currentTarget).attr("data")));
        	}catch(e){
        		throw new Error(this.i18n.error+e.message);
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
        
       
        
        this.qid("securityagencies").select2({
        	ajax:{
	        	url: $.u.config.constant.smsqueryserver,
	            dataType: "json",
	        	type:"post",
	            data:function(term,page){
	            	return {
        				"tokenid": $.cookie("tokenid"),
        				"method": "getunits",
        				"unitName": term
	            	};
	            },
		        results:this.proxy(function(response,page){
		        	if (response.success) {
		        		if(response.data[0] && fristoption){ 
	        	        	this.qid("securityagencies").select2("data",response.data[0]).select2("close");
	        	        	this.dataTable.fnDraw();
	        	        	fristoption=false;
	        	        	//this.qid("securityagencies").select2("close");
			        	}
		        		return {results:response.data};
		        	} 
		        	
		        })
	        },
	        formatResult: function(item){
	        	return item.name;      		
	        },
	        formatSelection: function(item){
	        	return item.name;	        	
	        }
		});
     
        
        this.qid("professional").select2({
        	ajax:{
	        	url: $.u.config.constant.smsqueryserver,
	            dataType: "json",
	        	type:"post",
	            data:function(term,page){
	            	return {
	            		"tokenid":$.cookie("tokenid"),
	    				"method":"stdcomponent.getbysearch",
	    				"dataobject":"dictionary",
	    				"rule":JSON.stringify([[{"key":"type","value":"系统分类"}]])
	            	};
	            },
		        results:this.proxy(function(response,page){
		        	if (response.success) {
		        		return {results:response.data.aaData};
		        	} 
		        })
	        },
	        formatResult: function(item){
	        	return item.name;      		
	        },
	        formatSelection: function(item){
	        	return item.name;	        	
	        }
		});
        
        this.qid("securityagencies").select2("open");
        
    },
    
    //method:getProfessionUserBySearch,unit:安监机构id,profession:专业id,name:用户名称

 
    dataunit:function(data){
    	$.each(data,this.proxy(function(idx,item){
    		if($.inArray(item.unit,this.unitArray)<0)
    			this.unitArray.push(item.unit);
    	}));
    },
    
    clearselect2:function(){
    	this.qid("securityagencies").val("");
        this.qid("professional").val("");
        this.qid("securityagencies").select2("data","");
        this.qid("professional").select2("data","");
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
    
    
    openajax:function(){
    	$.u.ajax({
            url: $.u.config.constant.smsqueryserver,
            type:"post",
            dataType: "json",
            cache: false,
            async:false,
            data: aoData
        }).done(this.proxy(function (data) {
            if (data.success) {
                fnCallBack(data.data);
            	//data.data.aaData?this.dataunit(data.data.aaData):"";
            }
        })).fail(this.proxy(function (jqXHR, errorText, errorThrown) {

        }));
    },
    
    
    
    destroy: function () {
        this._super();
    }
}, { usehtm: true, usei18n: true });


com.audit.professionalusers.professionalusers.widgetjs = ['../../../uui/widget/jqdatatable/js/jquery.dataTables.js',
                                                          '../../../uui/widget/jqdatatable/js/dataTables.bootstrap.js'];
com.audit.professionalusers.professionalusers.widgetcss = [{ path: '../../../uui/widget/jqdatatable/css/jquery.dataTables.css' },
                                                     { path: '../../../uui/widget/jqdatatable/css/dataTables.bootstrap.css' }];


