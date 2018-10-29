//@ sourceURL=com.sms.tem.temModel
$.u.load("com.sms.common.stdcomponentdelete");
$.u.define('com.sms.tem.temModel', null, {
    init: function (options) {
    	this._options = options || {};
    	this.i18n = com.sms.tem.temModel.i18n;
    	this.data = [{id:0,text:'重大风险'},{id:1,text:'不安全状态'},{id:2,text:'威胁'},{id:3,text:'差错'},{id:4,text:'控制措施'},{id:5,text:'严重等级'}];
    	this.status = [{"id":"有效","name":"有效"},{"id":"无效","name":"无效"},{"id":"部分有效","name":"部分有效"}];
    	this.systemTemplate = '<div class="form-group" style="margin-right:1.5em;">'
			                 +		'<div class="radio">'
							 +		  '<label>'
							 +		    '<input type="radio" name="systemRadios"  value="#{id}" #{checked}>#{name}'
							 +		  '</label>'
							 +		'</div>'
			                 +	'</div>';
    	this.systemTemplate = '<li><a href="#" role="tab" data-toggle="tab" data-value="#{id}">#{name}</a></li>';
    	this._currAddDialog = null;
        this._SELECT2_PAGE_LENGTH = 10;
    	this._fields = {
    		name: {name:"name",maxlength:255, label:this.i18n.name, type:"text", rule:{required:true}, message:this.i18n.nameNotNull},
    		num: {name:"num",maxlength:100, label:this.i18n.num, type:"text", rule:{required:false}},
    		system: {name:"system", label:this.i18n.system, type:"select", dataType:"int", rule:{required:true}, message:this.i18n.systemNotNull,
		         option:{
		        	  "params": {"dataobject":"dictionary"},
	        		  "ajax":{
	        			  data: this.proxy(function(term,page){
	        				 return {
	        					 method:"stdcomponent.getbysearch",
	        					 dataobject:"dictionary",
	        					 tokenid:$.cookie("tokenid"),
	        					 rule:JSON.stringify([[{"key":"name","op":"like","value":term}],[{"key":"type", "value":"系统分类"}]]),
                                 start: (page - 1) * this._SELECT2_PAGE_LENGTH,
                                 length: this._SELECT2_PAGE_LENGTH
	        				 };
	        			 }),
                          success: this.proxy(function(response, page){
                            var more = page * this._SELECT2_PAGE_LENGTH < response.data.iTotalRecords;
                            return {"results":response.data.aaData, "more":more};
                          })
	        		  }
	        	 }
	        },
    		insecuritys: {name:"insecuritys", label:this.i18n.insecuritys, type:"select", message:this.i18n.insecuritysNotNull,
		         option:{
	        		  "ajax":{
	        			  data: this.proxy(function(term,page){
	        				 var rule = [[{"key":"name","op":"like","value":term}]];
	        				 if(this._currAddDialog){
	        					 rule.push([{"key":"system", "value":parseInt(this._currAddDialog.form.find("[name=system]").val())}]);
	        				 }
	        				 return {
	        					 method:"stdcomponent.getbysearch",
	        					 dataobject:"insecurity",
	        					 tokenid:$.cookie("tokenid"),
	        					 rule:JSON.stringify(rule),
                                 start: (page - 1) * this._SELECT2_PAGE_LENGTH,
                                 length: this._SELECT2_PAGE_LENGTH
	        				 };
	        			 }),
                          success: this.proxy(function(response, page){
                            var more = page * this._SELECT2_PAGE_LENGTH < response.data.iTotalRecords;
                            return {"results":response.data.aaData, "more":more};
                          })
	        		  },
	        		  "multiple":true
	        	 }
	        },
	        consequences: {name:"consequences",label:this.i18n.consequences,type:"select",message:this.i18n.consequencesNotNull,
		          option:{
	        		  "ajax":{
	        			  data: this.proxy(function(term,page){
	        				 var rule = [[{"key":"name","op":"like","value":term}]];
	        				 if(this._currAddDialog){
	        					 rule.push([{"key":"system", "value":parseInt(this._currAddDialog.form.find("[name=system]").val())}]);
	        				 }
	        				 return {
	        					 method:"stdcomponent.getbysearch",
	        					 dataobject:"consequence",
	        					 tokenid:$.cookie("tokenid"),
	        					 rule:JSON.stringify(rule),
                                 start: (page - 1) * this._SELECT2_PAGE_LENGTH,
                                 length: this._SELECT2_PAGE_LENGTH
	        				 };
	        			 }),
                          success: this.proxy(function(response, page){
                            var more = page * this._SELECT2_PAGE_LENGTH < response.data.iTotalRecords;
                            return {"results":response.data.aaData, "more":more};
                          })
	        		  },
	        		  "multiple":true
	        	 }
	        },
	        threats: {name:"threats",label:this.i18n.threats,type:"select",message:this.i18n.threatsNotNull,
		          option:{
	        		  "ajax":{
	        			  data: this.proxy(function(term,page){
	        				  var rule = [[{"key":"name","op":"like","value":term}]];
	        				 if(this._currAddDialog){
	        					 rule.push([{"key":"system", "value":parseInt(this._currAddDialog.form.find("[name=system]").val())}]);
	        				 }
	        				 return {
	        					 method:"stdcomponent.getbysearch",
	        					 dataobject:"threat",
	        					 tokenid:$.cookie("tokenid"),
	        					 rule:JSON.stringify(rule),
                                 start: (page - 1) * this._SELECT2_PAGE_LENGTH,
                                 length: this._SELECT2_PAGE_LENGTH
	        				 };
	        			 }),
                          success: this.proxy(function(response, page){
                            var more = page * this._SELECT2_PAGE_LENGTH < response.data.iTotalRecords;
                            return {"results":response.data.aaData, "more":more};
                          })
	        		  },
	        		  "multiple":true
	        	 }
	        },
	        errors: {name:"errors",label:this.i18n.errors,type:"select",message:this.i18n.errorsNotNull,
		          option:{
	        		  "ajax":{
	        			  data: this.proxy(function(term,page){
	        				 var rule = [[{"key":"name","op":"like","value":term}]];
	        				 if(this._currAddDialog){
	        					 rule.push([{"key":"system", "value":parseInt(this._currAddDialog.form.find("[name=system]").val())}]);
	        				 }
	        				 return {
	        					 method:"stdcomponent.getbysearch",
	        					 dataobject:"error",
	        					 tokenid:$.cookie("tokenid"),
	        					 rule:JSON.stringify(rule),
                                 start: (page - 1) * this._SELECT2_PAGE_LENGTH,
                                 length: this._SELECT2_PAGE_LENGTH
	        				 };
	        			 }),
                          success: this.proxy(function(response, page){
                            var more = page * this._SELECT2_PAGE_LENGTH < response.data.iTotalRecords;
                            return {"results":response.data.aaData, "more":more};
                          })
	        		  },
	        		  "multiple":true
	        	 }
	        },
	        controls: {name:"controls",label:this.i18n.controls,type:"select",message:this.i18n.controlsNotNull,
		          option:{
	        		  "ajax":{
	        			  data: this.proxy(function(term,page){
	        				 var rule = [[{"key":"title","op":"like","value":term},{"key":"number","op":"like","value":term}]];
	        				 return {
	        					 method:"stdcomponent.getbysearch",
	        					 dataobject:"control",
	        					 tokenid:$.cookie("tokenid"),
	        					 rule:JSON.stringify(rule),
                                 start: (page - 1) * this._SELECT2_PAGE_LENGTH,
                                 length: this._SELECT2_PAGE_LENGTH
	        				 };
	        			 }),
                          success: this.proxy(function(response, page){
                            var more = page * this._SELECT2_PAGE_LENGTH < response.data.iTotalRecords;
                            return {"results":response.data.aaData, "more":more};
                          })
	        		  },
	        		  "formatResult":function(item){
	        			  return item.number+item.title;  
	        		  },
	        		  "formatSelection":function(item){
	        			  return item.number+item.title;
	        		  },
	        		  "multiple":true
	        	 }
	        },
	        classification: {name:"classification",maxlength:50, label:this.i18n.classification,type:"text",message:this.i18n.classificationNotNull},
	        category: {name:"category",maxlength:50, label:this.i18n.category,type:"text",message:this.i18n.categoryNotNull},
	        comment: {name:"comment",maxlength:2000, label:this.i18n.remark,type:"textarea"},
	        number: {name:"number",maxlength:50, label:this.i18n.number,type:"text",rule:{required:true},message:this.i18n.numberNotNull},
	        title: {name:"title",maxlength:255, label:this.i18n.title,type:"text",rule:{required:true},message:this.i18n.titleNotNull,
        	  option:{
        		  formatResult:function(item){
        			  return item.title;
        		  },
        		  formatSelection:function(item){
        			  return item.title;
        		  }
        	  }
           }
    	};
        this._DATATABE_LANGUAGE = { //语言
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
        };
        this._manageable = false;
    },
    afterrender: function (bodystr) {
    	this.addFDialog = null;
    	this.addSDialog = null;
    	this.addTDialog = null;
    	this.addEDialog = null;
    	this.addCDialog = null;
    	this.addVDialog = null;
    	
        this.hideInput();
    	this.qid("systemlist").on("shown.bs.tab", "a[role='tab']", this.proxy(this.on_systemTab_click));
 
    	$.u.ajax({
    		url: $.u.config.constant.smsqueryserver,
    		type: "post",
    		dataType: "json",
    		data: {
    			tokenid: $.cookie("tokenid"),
    			method: "stdcomponent.getbysearch",
    			dataobject: "dictionary",
    			rule: JSON.stringify([[{"key":"type", "value":"系统分类"}]]),
                columns: JSON.stringify([{"data":"last_update"}]),
                order: JSON.stringify([{"column":0,"dir":"desc"}])
    		}
    	},this.qid("systemlist")).done(this.proxy(function(response){
    		if(response.success){
    			var container = this.qid("systemlist");
    			$.each(response.data.aaData, this.proxy(function(idx, item){
    				$(this.systemTemplate.replace(/#\{id\}/g, item.id).replace(/#\{name\}/g, item.name)).addClass(idx === 0 ? "active" : "").appendTo(container);
    			}));
    		}
            
    	}));
        
        $.u.ajax({
            url: $.u.config.constant.smsqueryserver,
            type: "post",
            dataType: "json",
            data: {
                tokenid: $.cookie("tokenid"),
                method: "getManageTemDictionaryPermission"
            }
        }, this.$).done(this.proxy(function(response){
            if(response.success && response.data){
                this._manageable = response.data.manageable;
                if(this._manageable === true){
                    this.qid("button").on("click", "button", this.proxy(this.on_add_click));
                }else{
                    this.qid("button").remove();
                }
                this.qid("tem-select").select2({
                    placeholder: "请选择类型",
                    data : this.data
                }) .on("select2-selecting", this.proxy(this.on_select2_selecting));
            }
        }));
        
    },
    hideInput : function(){
         this.qid("tem-name").hide();
         this.qid("tem-name-label").hide();
         this.qid("tem-categories").hide();
         this.qid("tem-categories-label").hide();
         this.qid("btn_filter").off("click").on("click",this.proxy(this.searchData));
         this.qid("btn_resetfilter").off("click").on("click",this.proxy(this.clear));
    },
    searchData : function(){
        if(this.dataTable){
            this.dataTable.fnDraw();
        }
    },
    clear : function(){
         this.qid("tem-name").val("");
         this.qid("tem-categories").val("");
    },
    on_select2_selecting: function(e){
        if($.fn.DataTable.isDataTable(this.qid("datatable"))){
            this.qid("datatable").dataTable().api().destroy();
        }
        this.qid("datatable").empty();
        switch(e.val){
            case 0://重大风险
                this.qid("tem-name").show();
                this.qid("tem-name-label").show();
                this.qid("tem-categories").hide();
                this.qid("tem-categories-label").hide();
                this.qid("systemlist").removeClass("hidden");
                this.qid("systemlist").find("a:first").tab("show");
                this.dataTable = this.qid("datatable").dataTable({
                    searching: false,
                    serverSide: true,
                    bProcessing: true,
                    ordering: false,
                    pageLength : 1000,
                    "sDom":"t<i>",
                    "columns": $.extend([
                        { "title": this.i18n.num ,"mData":"num"},
                        { "title": this.i18n.name ,"mData":"name"},
                        { "title": this.i18n.insecuritys ,"mData":"insecuritys"},
                        { "title": this.i18n.system ,"mData":"system"}
                    ], this._manageable === true ? { "title": this.i18n.handle ,"mData":"id","sWidth":100} : null),
                    "aaData":[
                              
                    ],
                    "oLanguage": this._DATATABE_LANGUAGE,
                    "fnServerParams": this.proxy(function (aoData) {
                        var rule = [[{"key":"system","value":parseInt(this.qid("systemlist").find("li.active a").attr("data-value"))}]];
                        if(this.qid("tem-name").val()){
                            rule.push([{"key":"name", "op":"like", "value":this.qid("tem-name").val()}]);
                        }
                        $.extend(aoData,{
                            "tokenid":$.cookie("tokenid"),
                            "method":"stdcomponent.getbysearch",
                            "dataobject":"consequence",
                            "columns":JSON.stringify([{"data":"num"}]),
                            "order": JSON.stringify([{"column":0, "dir":"asc"}]),
                            "search":JSON.stringify(aoData.search),
                            "rule": JSON.stringify(rule)
                        },true);
                    }),
                    "fnServerData": this.proxy(function (sSource, aoData, fnCallBack, oSettings) {
                        $.u.ajax({
                            url: $.u.config.constant.smsqueryserver,
                            type: "post",
                            dataType: "json",
                            cache: false,
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
                            "aTargets": 1,
                            "mRender": function (data, type, full) {
                                 return  data;
                            }
                        },
                        {
                            "aTargets": 2,
                            "mRender": function (data, type, full) {
                                var htmls=["<ul style='padding-left:15px;list-style:none;'>"];
                                full.insecuritys && $.each(full.insecuritys,function(idx,insecuritys){
                                  htmls.push("<li>"+(insecuritys.num || "")+" <a href='#' class='addF' data-data ='"+JSON.stringify(insecuritys)+"'>"+insecuritys.name+"</a></li>"); 
                                });
                                htmls.push("</ul>");
                                return htmls.join("");
                            }
                        },{
                            "aTargets": 4,
                            "mRender": this.proxy(function (data, type, full) {
                                var htmls = "";
                                if(this._manageable === true){
                                    htmls += "<button class='btn btn-link edit' data='" + JSON.stringify(full) + "'>" + this.i18n.edit + "</button>";
                                    htmls += "<button class='btn btn-link delete' data='" + JSON.stringify(full) + "'>" + this.i18n.remove + "</button>";
                                }
                                return htmls;
                            })
                        }
                    ]
                });
                //修改不安全状态
                this.dataTable.off("click","a.addF").on("click","a.addF",this.proxy(function(e){
                    e.preventDefault();
                    try{
                        var data = JSON.parse($(e.currentTarget).attr("data-data"));
                        $.u.ajax({
                            url: $.u.config.constant.smsqueryserver,
                            dataType: "json",
                            cache: false,
                            data: {
                                "tokenid":$.cookie("tokenid"),
                                "method":"stdcomponent.getbyid",
                                "dataobject":"insecurity",
                                "dataobjectid":parseInt(data.id)
                            }
                        },this.qid("datatable")).done(this.proxy(function (result) {
                            if (result.success) {
                                if (this.addSDialog == null) {
                                    this.addSDialog = this._getFormModule("s");
                                }
                                this.addSDialog.override({
                                    refreshDataTable: this.proxy(function(){
                                        this.dataTable && this.dataTable.fnDraw(true);
                                    })
                                });
                                this.addSDialog.open({"data":result.data,"title":this.i18n.editMsgS+data.name});
                                if(this._manageable === false){
                                    this.addSDialog.formDialog.parent().find(".ui-dialog-buttonpane button.ok").remove();
                                }
                            }
                        })).fail(this.proxy(function (jqXHR, errorText, errorThrown) {

                        }))
                    }catch(e){
                        throw new Error(this.i18n.editFail+e.message);
                    }
                }));
                //编辑重大风险
                this.dataTable.off("click","button.edit").on("click","button.edit",this.proxy(function(e){
                    e.preventDefault();
                    try{
                        var data = JSON.parse($(e.currentTarget).attr("data")); 
                        data.system = data.systemId; 
                        if (this.addFDialog == null) {
                            this.addFDialog = this._getFormModule("f");
                        }
                        this.addFDialog.override({
                            refreshDataTable: this.proxy(function(){
                                this.dataTable && this.dataTable.fnDraw(true);
                            })
                        });
                        this._currAddDialog = this.addFDialog;
                        this.addFDialog.open({"data":data,"title":this.i18n.editMsg+data.name});  
                        if(this._manageable === false){
                            this.addFDialog.formDialog.parent().find(".ui-dialog-buttonpane button.ok").remove();
                        }                          
                    }catch(e){
                        throw new Error(this.i18n.editFail+e.message);
                    }
                }));
                //删除重大风险
                this.dataTable.off("click", "button.delete").on("click", "button.delete", this.proxy(function (e) {
                    e.preventDefault();
                    try{
                        var data = JSON.parse($(e.currentTarget).attr("data"));
                        (new com.sms.common.stdcomponentdelete({
                            body:"<div>"+
                                    this.i18n.confirm + "？" +
                                 "</div>",
                            title:this.i18n.removeStatus+data.name,
                            dataobject:"consequence",
                            dataobjectids:JSON.stringify([parseInt(data.id)])
                        })).override({
                            refreshDataTable:this.proxy(function(){
                                if(this.dataTable){
                                    if(this.dataTable.fnGetData().length > 1 ){
                                        this.dataTable.fnDraw(true);
                                    }else{
                                        this.dataTable.fnDraw();
                                    }
                                }
                            })
                        });
                    }catch(e){
                        throw new Error(this.i18n.removeFail+e.message);
                    }
                }));
                break;
            case 1://不安全状态
                this.qid("tem-name").show();
                this.qid("tem-name-label").show();
                this.qid("tem-categories").hide();
                this.qid("tem-categories-label").hide();
                this.qid("systemlist").removeClass("hidden");
                this.qid("systemlist").find("a:first").tab("show");
                this.dataTable = this.qid("datatable").dataTable({
                    searching: false,
                    serverSide: true,
                    bProcessing: true,
                    ordering: false,
                    pageLength : 1000,
                    "sDom":"t<i>",
                    "columns": $.extend([
                        { "title": this.i18n.num ,"mData":"num","sWidth":40},
                        { "title": this.i18n.name ,"mData":"name","sWidth":100},
                        { "title": this.i18n.consequences ,"mData":"consequences","sWidth":150},
                        { "title": this.i18n.threats ,"mData":"threats"},
                        { "title": this.i18n.errors ,"mData":"errors"},
                        { "title": this.i18n.system ,"mData":"system"}
                    ], this._manageable === true ? { "title": this.i18n.handle ,"mData":"id","sWidth":100} : null),
                    "aaData":[
                              
                    ],
                    "oLanguage": this._DATATABE_LANGUAGE,
                    "fnServerParams": this.proxy(function (aoData) {
                        var rule = [[{"key":"system","value":parseInt(this.qid("systemlist").find("li.active a").attr("data-value"))}]];
                        if(this.qid("tem-name").val()){
                            rule.push([{"key":"name", "op":"like", "value":this.qid("tem-name").val()}]);
                        }
                        $.extend(aoData,{
                            "tokenid":$.cookie("tokenid"),
                            "method":"stdcomponent.getbysearch",
                            "dataobject":"insecurity",
                            "columns":JSON.stringify([{"data":"num"}]),
                            "order": JSON.stringify([{"column":0, "dir":"asc"}]),
                            "search":JSON.stringify(aoData.search),
                            "rule": JSON.stringify(rule)
                        },true);
                    }),
                    "fnServerData": this.proxy(function (sSource, aoData, fnCallBack, oSettings) {
                        $.u.ajax({
                            url: $.u.config.constant.smsqueryserver,
                            type: "post",
                            dataType: "json",
                            cache: false,
                            data: aoData
                        },this.qid("datatable")).done(this.proxy(function (data) {
                            if (data.success) {
                                fnCallBack(data.data);
                            }
                        })).fail(this.proxy(function (jqXHR, errorText, errorThrown) {

                        })).complete(this.proxy(function(){
                        }));
                    }),
                    "aoColumnDefs": [{
                            "aTargets": 1,
                            "mRender": function (data, type, full) {
                                 return  data;
                            }
                        },{
                            "aTargets": 2,
                            "mRender": function (data, type, full) {
                                var htmls=["<ul style='padding-left:15px;list-style: none;'>"];
                                full.consequences && $.each(full.consequences,function(idx,consequences){
                                  htmls.push("<li>" + (consequences.num || "") + " <a href='#' class='addS' data-data ='"+JSON.stringify(consequences)+"'>"+consequences.name+"</a></li>"); 
                                });
                                htmls.push("</ul>");
                                return htmls.join("");
                            }
                        },{
                            "aTargets": 3,
                            "mRender": function (data, type, full) {
                                var htmls=["<ul style='padding-left:15px;list-style:none;'>"];
                                full.threats && $.each(full.threats,function(idx,threats){
                                  htmls.push("<li>"+(threats.num || "")+" <a href='#' class='addT' data-data ='"+JSON.stringify(threats)+"'>"+threats.name+"</a></li>"); 
                                });
                                htmls.push("</ul>");
                                return htmls.join("");
                            }
                        },
                        {
                            "aTargets": 4,
                            "mRender": function (data, type, full) {
                                var htmls=["<ul style='padding-left:15px;list-style:none;'>"];
                                full.errors && $.each(full.errors,function(idx,errors){
                                  htmls.push("<li>"+(errors.num || "")+" <a href='#' class='addE' data-data ='"+JSON.stringify(errors)+"'>"+errors.name+"</a></li>"); 
                                });
                                htmls.push("</ul>");
                                return htmls.join("");
                            }
                        },{
                            "aTargets": 6,
                            "mRender": this.proxy(function (data, type, full) {
                                var htmls = "";
                                if(this._manageable === true){
                                    htmls += "<button class='btn btn-link edit' data='" + JSON.stringify(full) + "'>" + this.i18n.edit + "</button>";
                                    htmls += "<button class='btn btn-link delete' data='" + JSON.stringify(full) + "'>" + this.i18n.remove + "</button>";
                                }
                                return htmls;
                            })
                        }
                    ]
                });
                //修改重大风险
                this.dataTable.off("click","a.addS").on("click","a.addS",this.proxy(function(e){
                    e.preventDefault();
                    try{
                        var data = JSON.parse($(e.currentTarget).attr("data-data"));
                        $.u.ajax({
                            url: $.u.config.constant.smsqueryserver,
                            dataType: "json",
                            cache: false,
                            data: {
                                "tokenid":$.cookie("tokenid"),
                                "method":"stdcomponent.getbyid",
                                "dataobject":"consequence",
                                "dataobjectid":parseInt(data.id)
                            }
                        },this.qid("datatable")).done(this.proxy(function (result) {
                            if (result.success) {
                                if (this.addFDialog == null) {
                                    this.addFDialog = this._getFormModule("f");
                                }
                                this.addFDialog.override({
                                    refreshDataTable: this.proxy(function(){
                                        this.dataTable && this.dataTable.fnDraw(true);
                                    })
                                });
                                this._currAddDialog = this.addFDialog;
                                this.addFDialog.open({"data":result.data,"title":this.i18n.editMsg+data.name});
                                if(this._manageable === false){
                                    this.addFDialog.formDialog.parent().find(".ui-dialog-buttonpane button.ok").remove();
                                }
                            }
                        })).fail(this.proxy(function (jqXHR, errorText, errorThrown) {

                        }))
                    }catch(e){
                        throw new Error(this.i18n.editFail+e.message);
                    }
                }));
                //修改威胁
                this.dataTable.off("click","a.addT").on("click","a.addT",this.proxy(function(e){
                    e.preventDefault();
                    try{
                        var data = JSON.parse($(e.currentTarget).attr("data-data"));
                        $.u.ajax({
                            url: $.u.config.constant.smsqueryserver,
                            dataType: "json",
                            cache: false,
                            data: {
                                "tokenid":$.cookie("tokenid"),
                                "method":"stdcomponent.getbyid",
                                "dataobject":"threat",
                                "dataobjectid":parseInt(data.id)
                            }
                        },this.qid("datatable")).done(this.proxy(function (result) {
                            if (result.success) {
                                if (this.addTDialog == null) {
                                    this.addTDialog = this._getFormModule("t");
                                }
                                this.addTDialog.override({
                                    refreshDataTable: this.proxy(function(){
                                        this.dataTable && this.dataTable.fnDraw(true);
                                    })
                                });
                                this._currAddDialog = this.addTDialog;
                                this.addTDialog.open({"data":result.data,"title":this.i18n.editMsgT+data.name});
                                if(this._manageable === false){
                                    this.addTDialog.formDialog.parent().find(".ui-dialog-buttonpane button.ok").remove();
                                }
                            }
                        })).fail(this.proxy(function (jqXHR, errorText, errorThrown) {

                        }))
                    }catch(e){
                        throw new Error(this.i18n.editFail+e.message);
                    }
                }));
                //修改差错
                this.dataTable.off("click","a.addE").on("click","a.addE",this.proxy(function(e){
                    e.preventDefault();
                    try{
                        var data = JSON.parse($(e.currentTarget).attr("data-data"));
                        $.u.ajax({
                            url: $.u.config.constant.smsqueryserver,
                            dataType: "json",
                            cache: false,
                            data: {
                                "tokenid":$.cookie("tokenid"),
                                "method":"stdcomponent.getbyid",
                                "dataobject":"error",
                                "dataobjectid":parseInt(data.id)
                            }
                        },this.qid("datatable")).done(this.proxy(function (result) {
                            if (result.success) {
                                if (this.addEDialog == null) {
                                    this.addEDialog = this._getFormModule("e");
                                }
                                this.addEDialog.override({
                                    refreshDataTable: this.proxy(function(){
                                        this.dataTable && this.dataTable.fnDraw(true);
                                    })
                                });
                                this._currAddDialog = this.addEDialog;
                                this.addEDialog.open({"data":result.data,"title":this.i18n.editMsgE+data.name});
                                if(this._manageable === false){
                                    this.addEDialog.formDialog.parent().find(".ui-dialog-buttonpane button.ok").remove();
                                }
                            }
                        })).fail(this.proxy(function (jqXHR, errorText, errorThrown) {

                        }))
                    }catch(e){
                        throw new Error(this.i18n.editFail+e.message);
                    }
                }));
                //编辑不安全状态
                this.dataTable.off("click","button.edit").on("click","button.edit",this.proxy(function(e){
                    e.preventDefault();
                    try{
                        var data = JSON.parse($(e.currentTarget).attr("data"));
                        data.system = data.systemId;
                        if (this.addSDialog == null) {
                            this.addSDialog = this._getFormModule("s");
                        }
                        this.addSDialog.override({
                            refreshDataTable: this.proxy(function(){
                                this.dataTable && this.dataTable.fnDraw(true);
                            })
                        });
                        this._currAddDialog = this.addSDialog;
                        this.addSDialog.open({"data":data,"title":this.i18n.editMsgS+data.name});
                        if(this._manageable === false){
                            this.addSDialog.formDialog.parent().find(".ui-dialog-buttonpane button.ok").remove();
                        }
                    }catch(e){
                        throw new Error(this.i18n.editFail+e.message);
                    }
                }));
                //删除不安全状态
                this.dataTable.off("click", "button.delete").on("click", "button.delete", this.proxy(function (e) {
                    e.preventDefault();
                    try{
                        var data = JSON.parse($(e.currentTarget).attr("data"));
                        (new com.sms.common.stdcomponentdelete({
                            body:"<div>"+
                                    this.i18n.confirmS + "？" +
                                 "</div>",
                            title:this.i18n.removeStatusS+data.name,
                            dataobject:"insecurity",
                            dataobjectids:JSON.stringify([parseInt(data.id)])
                        })).override({
                            refreshDataTable:this.proxy(function(){
                                if(this.dataTable){
                                    if(this.dataTable.fnGetData().length > 1 ){
                                        this.dataTable.fnDraw(true);
                                    }else{
                                        this.dataTable.fnDraw();
                                    }
                                }
                            })
                        });
                    }catch(e){
                        throw new Error(this.i18n.removeFail+e.message);
                    }
                }));
                break;
            case 2://威胁
                this.qid("tem-name").show();
                this.qid("tem-name-label").show();
                this.qid("tem-categories").show();
                this.qid("tem-categories-label").show();
                this.qid("systemlist").removeClass("hidden");
                this.qid("systemlist").find("a:first").tab("show");
                this.dataTable = this.qid("datatable").dataTable({
                    searching: false,
                    serverSide: true,
                    bProcessing: true,
                    ordering: false,
                    pageLength : 1000,
                    "sDom":"t<i>",
                    "columns": $.extend([
                        { "title": this.i18n.num ,"mData":"num","sWidth":40},
                        { "title": this.i18n.name ,"mData":"name","sWidth":100},
                        { "title": this.i18n.category ,"mData":"category","sWidth":100},
                        { "title": this.i18n.classification ,"mData":"classification","sWidth":60},
                        { "title": this.i18n.insecuritys ,"mData":"insecuritys"},
                        { "title": this.i18n.controls ,"mData":"controls"},
                        { "title": this.i18n.system ,"mData":"system"},
                    ], this._manageable === true ? { "title": this.i18n.handle ,"mData":"id","sWidth":100} : null),
                    "aaData":[
                              
                    ],
                    "oLanguage": this._DATATABE_LANGUAGE,
                    "fnServerParams": this.proxy(function (aoData) {
                        var rule = [[{"key":"system","value":parseInt(this.qid("systemlist").find("li.active a").attr("data-value"))}]];
                        if(this.qid("tem-name").val()){
                            rule.push([{"key":"name", "op":"like", "value":this.qid("tem-name").val()}]);
                        }
                        if(this.qid("tem-categories").val()){
                            rule.push([{"key":"category", "op":"like", "value":this.qid("tem-categories").val()},
                                       {"key":"classification", "op":"like", "value":this.qid("tem-categories").val()}]);
                        }
                        $.extend(aoData,{
                            "tokenid":$.cookie("tokenid"),
                            "method":"stdcomponent.getbysearch",
                            "dataobject":"threat",
                            "columns":JSON.stringify([{"data":"num"}]),
                            "order": JSON.stringify([{"column":0, "dir":"asc"}]),
                            "search":JSON.stringify(aoData.search),
                            "rule": JSON.stringify(rule)
                        },true);
                    }),
                    "fnServerData": this.proxy(function (sSource, aoData, fnCallBack, oSettings) {
                        $.u.ajax({
                            url: $.u.config.constant.smsqueryserver,
                            type: "post",
                            dataType: "json",
                            cache: false,
                            data: aoData
                        },this.qid("datatable")).done(this.proxy(function (data) {
                            if (data.success) {
                                fnCallBack(data.data);
                            }
                        })).fail(this.proxy(function (jqXHR, errorText, errorThrown) {

                        })).complete(this.proxy(function(){
                        }));
                    }),
                    "aoColumnDefs": [{
                            "aTargets": 1,
                            "mRender": function (data, type, full) {
                                 return  data;
                            }
                        },{
                            "aTargets": 3,
                            "mRender": function (data, type, full) {
                                return data;
                            }
                        },{
                            "aTargets": 4,
                            "mRender": function (data, type, full) {
                                var htmls=["<ul style='padding-left:15px;list-style:none;'>"];
                                full.insecuritys && $.each(full.insecuritys,function(idx,insecuritys){
                                  htmls.push("<li>"+(insecuritys.num || "")+" <a href='#' class='addS' data-data ='"+JSON.stringify(insecuritys)+"'>"+insecuritys.name+"</a></li>"); 
                                });
                                htmls.push("</ul>");
                                return htmls.join("");
                            }
                        },
                        {
                            "aTargets": 5,
                            "mRender": function (data, type, full) {
                                var htmls=["<ul style='padding-left:15px;list-style:none;'>"];
                                full.controls && $.each(full.controls,function(idx,controls){
                                  htmls.push("<li>"+(controls.number || "")+" <a href='#' class='addC' data-data ='"+JSON.stringify(controls)+"'>"+controls.title+"</a></li>"); 
                                });
                                htmls.push("</ul>");
                                return htmls.join("");
                            }
                        },{
                            "aTargets": 7,
                            "mRender": this.proxy(function (data, type, full) {
                                var htmls = "";
                                if(this._manageable === true){
                                    htmls += "<button class='btn btn-link edit' data='" + JSON.stringify(full) + "'>" + this.i18n.edit + "</button>";
                                    htmls += "<button class='btn btn-link delete' data='" + JSON.stringify(full) + "'>" + this.i18n.remove + "</button>";
                                }
                                return htmls;
                            })
                        }
                    ]
                });
                //修改不安全状态
                this.dataTable.off("click","a.addS").on("click","a.addS",this.proxy(function(e){
                    e.preventDefault();
                    try{
                        var data = JSON.parse($(e.currentTarget).attr("data-data"));
                        $.u.ajax({
                            url: $.u.config.constant.smsqueryserver,
                            dataType: "json",
                            cache: false,
                            data: {
                                "tokenid":$.cookie("tokenid"),
                                "method":"stdcomponent.getbyid",
                                "dataobject":"insecurity",
                                "dataobjectid":parseInt(data.id)
                            }
                        },this.qid("datatable")).done(this.proxy(function (result) {
                            if (result.success) {
                                if (this.addSDialog == null) {
                                    this.addSDialog = this._getFormModule("s");
                                }
                                this.addSDialog.override({
                                    refreshDataTable: this.proxy(function(){
                                        this.dataTable && this.dataTable.fnDraw(true);
                                    })
                                });
                                this._currAddDialog = this.addSDialog;
                                this.addSDialog.open({"data":result.data,"title":this.i18n.editMsgS+data.name});
                                if(this._manageable === false){
                                    this.addSDialog.formDialog.parent().find(".ui-dialog-buttonpane button.ok").remove();
                                }
                            }
                        })).fail(this.proxy(function (jqXHR, errorText, errorThrown) {

                        }))
                    }catch(e){
                        throw new Error(this.i18n.editFail+e.message);
                    }
                }));
                //修改控制措施
                this.dataTable.off("click","a.addC").on("click","a.addC",this.proxy(function(e){
                    e.preventDefault();
                    try{
                        var data = JSON.parse($(e.currentTarget).attr("data-data"));
                        $.u.ajax({
                            url: $.u.config.constant.smsqueryserver,
                            dataType: "json",
                            cache: false,
                            data: {
                                "tokenid":$.cookie("tokenid"),
                                "method":"stdcomponent.getbyid",
                                "dataobject":"control",
                                "dataobjectid":parseInt(data.id)
                            }
                        },this.qid("datatable")).done(this.proxy(function (result) {
                            if (result.success) {
                                if (this.addCDialog == null) {
                                    this.addCDialog = this._getFormModule("c");
                                }
                                this.addCDialog.override({
                                    refreshDataTable: this.proxy(function(){
                                        this.dataTable && this.dataTable.fnDraw(true);
                                    })
                                });
                                this.addCDialog.open({"data":result.data,"title":this.i18n.editMsgC+data.title});
                                if(this._manageable === false){
                                    this.addCDialog.formDialog.parent().find(".ui-dialog-buttonpane button.ok").remove();
                                }
                            }
                        })).fail(this.proxy(function (jqXHR, errorText, errorThrown) {

                        }))
                    }catch(e){
                        throw new Error(this.i18n.editFail+e.message);
                    }
                }));
                //编辑威胁
                this.dataTable.off("click","button.edit").on("click","button.edit",this.proxy(function(e){
                    e.preventDefault();
                    try{
                        var data = JSON.parse($(e.currentTarget).attr("data"));
                        data.system = data.systemId;
                        if (this.addTDialog == null) {
                            this.addTDialog = this._getFormModule("t");
                        }
                        this.addTDialog.override({
                            refreshDataTable: this.proxy(function(){
                                this.dataTable && this.dataTable.fnDraw(true);
                            })
                        });
                        this._currAddDialog = this.addTDialog;
                        this.addTDialog.open({"data":data,"title":this.i18n.editMsgT+data.name});
                        if(this._manageable === false){
                            this.addTDialog.formDialog.parent().find(".ui-dialog-buttonpane button.ok").remove();
                        }
                    }catch(e){
                        throw new Error(this.i18n.editFail+e.message);
                    }
                }));
                //删除威胁
                this.dataTable.off("click", "button.delete").on("click", "button.delete", this.proxy(function (e) {
                    e.preventDefault();
                    try{
                        var data = JSON.parse($(e.currentTarget).attr("data"));
                        (new com.sms.common.stdcomponentdelete({
                            body:"<div>"+
                                    this.i18n.confirmT + "？" +
                                 "</div>",
                            title:this.i18n.removeStatusT+data.name,
                            dataobject:"threat",
                            dataobjectids:JSON.stringify([parseInt(data.id)])
                        })).override({
                            refreshDataTable:this.proxy(function(){
                                if(this.dataTable){
                                    if(this.dataTable.fnGetData().length > 1 ){
                                        this.dataTable.fnDraw(true);
                                    }else{
                                        this.dataTable.fnDraw();
                                    }
                                }
                            })
                        });
                    }catch(e){
                        throw new Error(this.i18n.removeFail+e.message);
                    }
                }));
                break;
            case 3://差错
                this.qid("tem-name").show();
                this.qid("tem-name-label").show();
                this.qid("tem-categories").show();
                this.qid("tem-categories-label").show();
                this.qid("systemlist").removeClass("hidden");
                this.qid("systemlist").find("a:first").tab("show");
                this.dataTable = this.qid("datatable").dataTable({
                    searching: false,
                    serverSide: true,
                    bProcessing: true,
                    ordering: false,
                    pageLength : 1000,
                    "sDom":"t<i>",
                    "columns": $.extend([
                        { "title": this.i18n.num ,"mData":"num","sWidth":40},
                        { "title": this.i18n.name ,"mData":"name","sWidth":100},
                        { "title": this.i18n.category ,"mData":"category","sWidth":100},
                        { "title": this.i18n.classification ,"mData":"classification","sWidth":100},
                        { "title": this.i18n.insecuritys ,"mData":"insecuritys"},
                        { "title": this.i18n.controls ,"mData":"controls"},
                        { "title": this.i18n.system ,"mData":"system"}
                    ], this._manageable === true ? { "title": this.i18n.handle ,"mData":"id","sWidth":100} : null),
                    "aaData":[
                              
                    ],
                    "oLanguage": this._DATATABE_LANGUAGE,
                    "fnServerParams": this.proxy(function (aoData) {
                        var rule = [[{"key":"system","value":parseInt(this.qid("systemlist").find("li.active a").attr("data-value"))}]];
                        if(this.qid("tem-name").val()){
                            rule.push([{"key":"name", "op":"like", "value":this.qid("tem-name").val()}]);
                        }
                        if(this.qid("tem-categories").val()){
                            rule.push([{"key":"category", "op":"like", "value":this.qid("tem-categories").val()},
                                       {"key":"classification", "op":"like", "value":this.qid("tem-categories").val()}]);
                        }
                        $.extend(aoData,{
                            "tokenid":$.cookie("tokenid"),
                            "method":"stdcomponent.getbysearch",
                            "dataobject":"error",
                            "columns":JSON.stringify([{"data":"num"}]),
                            "order": JSON.stringify([{"column":0, "dir":"asc"}]),
                            "search":JSON.stringify(aoData.search),
                            "rule": JSON.stringify(rule)
                        },true);
                    }),
                    "fnServerData": this.proxy(function (sSource, aoData, fnCallBack, oSettings) {
                        $.u.ajax({
                            url: $.u.config.constant.smsqueryserver,
                            type: "post",
                            dataType: "json",
                            cache: false,
                            data: aoData
                        },this.qid("datatable")).done(this.proxy(function (data) {
                            if (data.success) {
                                fnCallBack(data.data);
                            }
                        })).fail(this.proxy(function (jqXHR, errorText, errorThrown) {

                        })).complete(this.proxy(function(){
                        }));
                    }),
                    "aoColumnDefs": [{
                            "aTargets": 1,
                            "mRender": function (data, type, full) {
                                 return data;
                            }
                        },{
                            "aTargets": 3,
                            "mRender": function (data, type, full) {
                                return data;
                            }
                        },{
                            "aTargets": 4,
                            "mRender": function (data, type, full) {
                                var htmls=["<ul style='padding-left:15px;list-style:none;'>"];
                                full.insecuritys && $.each(full.insecuritys,function(idx,insecuritys){
                                  htmls.push("<li>"+(insecuritys.num || "")+" <a href='#' class='addS' data-data ='"+JSON.stringify(insecuritys)+"'>"+insecuritys.name+"</a></li>"); 
                                });
                                htmls.push("</ul>");
                                return htmls.join("");
                            }
                        },
                        {
                            "aTargets": 5,
                            "mRender": function (data, type, full) {
                                var htmls=["<ul style='padding-left:15px;list-style:none;'>"];
                                full.controls && $.each(full.controls,function(idx,controls){
                                  htmls.push("<li>"+(controls.number || "")+" <a href='#' class='addC' data-data ='"+JSON.stringify(controls)+"'>"+controls.title+"</a></li>"); 
                                });
                                htmls.push("</ul>");
                                return htmls.join("");
                            }
                        },{
                            "aTargets": 7,
                            "mRender": this.proxy(function (data, type, full) {
                                var htmls = "";
                                if(this._manageable === true){
                                    htmls += "<button class='btn btn-link edit' data='" + JSON.stringify(full) + "'>" + this.i18n.edit + "</button>";
                                    htmls += "<button class='btn btn-link delete' data='" + JSON.stringify(full) + "'>" + this.i18n.remove + "</button>";
                                }
                                return htmls;
                            })
                        }
                    ]
                });
                //修改不安全状态
                this.dataTable.off("click","a.addS").on("click","a.addS",this.proxy(function(e){
                    e.preventDefault();
                    try{
                        var data = JSON.parse($(e.currentTarget).attr("data-data"));
                        $.u.ajax({
                            url: $.u.config.constant.smsqueryserver,
                            dataType: "json",
                            cache: false,
                            data: {
                                "tokenid":$.cookie("tokenid"),
                                "method":"stdcomponent.getbyid",
                                "dataobject":"insecurity",
                                "dataobjectid":parseInt(data.id)
                            }
                        },this.qid("datatable")).done(this.proxy(function (result) {
                            if (result.success) {
                                if (this.addSDialog == null) {
                                    this.addSDialog = this._getFormModule("s");
                                }
                                this.addSDialog.override({
                                    refreshDataTable: this.proxy(function(){
                                        this.dataTable && this.dataTable.fnDraw(true);
                                    })
                                });
                                this._currAddDialog = this.addSDialog;
                                this.addSDialog.open({"data":result.data,"title":this.i18n.editMsgS+data.name});
                                if(this._manageable === false){
                                    this.addSDialog.formDialog.parent().find(".ui-dialog-buttonpane button.ok").remove();
                                }
                            }
                        })).fail(this.proxy(function (jqXHR, errorText, errorThrown) {

                        }))
                    }catch(e){
                        throw new Error(this.i18n.editFail+e.message);
                    }
                }));
                //修改控制措施
                this.dataTable.off("click","a.addC").on("click","a.addC",this.proxy(function(e){
                    e.preventDefault();
                    try{
                        var data = JSON.parse($(e.currentTarget).attr("data-data"));
                        $.u.ajax({
                            url: $.u.config.constant.smsqueryserver,
                            dataType: "json",
                            cache: false,
                            data: {
                                "tokenid":$.cookie("tokenid"),
                                "method":"stdcomponent.getbyid",
                                "dataobject":"control",
                                "dataobjectid":parseInt(data.id)
                            }
                        },this.qid("datatable")).done(this.proxy(function (result) {
                            if (result.success) {
                                if (this.addCDialog == null) {
                                    this.addCDialog = this._getFormModule("c");
                                }
                                this.addCDialog.override({
                                    refreshDataTable: this.proxy(function(){
                                        this.dataTable && this.dataTable.fnDraw(true);
                                    })
                                });
                                this.addCDialog.open({"data":result.data,"title":this.i18n.editMsgC+data.title});
                                if(this._manageable === false){
                                    this.addCDialog.formDialog.parent().find(".ui-dialog-buttonpane button.ok").remove();
                                }
                            }
                        })).fail(this.proxy(function (jqXHR, errorText, errorThrown) {

                        }))
                    }catch(e){
                        throw new Error(this.i18n.editFail+e.message);
                    }
                }));
                //编辑差错
                this.dataTable.off("click","button.edit").on("click","button.edit",this.proxy(function(e){
                    e.preventDefault();
                    try{
                        var data = JSON.parse($(e.currentTarget).attr("data"));
                        data.system = data.systemId;
                        if (this.addEDialog == null) {
                            this.addEDialog = this._getFormModule("e");
                        }
                        this.addEDialog.override({
                            refreshDataTable: this.proxy(function(){
                                this.dataTable && this.dataTable.fnDraw(true);
                            })
                        });
                        this._currAddDialog = this.addEDialog;
                        this.addEDialog.open({"data":data,"title":this.i18n.editMsgE+data.name});
                        if(this._manageable === false){
                            this.addEDialog.formDialog.parent().find(".ui-dialog-buttonpane button.ok").remove();
                        }
                    }catch(e){
                        throw new Error(this.i18n.editFail+e.message);
                    }
                }));
                //删除差错
                this.dataTable.off("click", "button.delete").on("click", "button.delete", this.proxy(function (e) {
                    e.preventDefault();
                    try{
                        var data = JSON.parse($(e.currentTarget).attr("data"));
                        (new com.sms.common.stdcomponentdelete({
                            body:"<div>"+
                                    this.i18n.confirmE + "？" +
                                 "</div>",
                            title:this.i18n.removeStatusE+data.name,
                            dataobject:"error",
                            dataobjectids:JSON.stringify([parseInt(data.id)])
                        })).override({
                            refreshDataTable:this.proxy(function(){
                                if(this.dataTable){
                                    if(this.dataTable.fnGetData().length > 1 ){
                                        this.dataTable.fnDraw(true);
                                    }else{
                                        this.dataTable.fnDraw();
                                    }
                                }
                            })
                        });
                    }catch(e){
                        throw new Error(this.i18n.removeFail+e.message);
                    }
                }));
                break;
            case 4://控制措施
                this.qid("tem-name").show();
                this.qid("tem-name-label").show();
                this.qid("tem-categories").hide();
                this.qid("tem-categories-label").hide();
                this.qid("systemlist").addClass("hidden");
                this.qid("systemlist").find(":radio[name=systemRadios]").prop("checked", false);
                this.dataTable = this.qid("datatable").dataTable({
                    searching: false,
                    serverSide: true,
                    bProcessing: true,
                    ordering: false,
                    pageLength : 1000,
                    "sDom":"t<i>",
                    "columns": $.extend([
                        { "title": this.i18n.number ,"mData":"number","sWidth":50},
                        { "title": this.i18n.title ,"mData":"title","sWidth":150},
                        { "title": this.i18n.threats ,"mData":"threats"},
                        { "title": this.i18n.errors ,"mData":"errors"},
                    ], this._manageable === true ? { "title": this.i18n.handle ,"mData":"id","sWidth":100} : null),
                    "aaData":[
                              
                    ],
                    "oLanguage": this._DATATABE_LANGUAGE,
                    "fnServerParams": this.proxy(function (aoData) {
                        var rule = [];
                        if(this.qid("tem-name").val()){
                            rule.push([{"key":"title", "op":"like", "value":this.qid("tem-name").val()},
                                       {"key":"number", "op":"like", "value":this.qid("tem-name").val()}]);
                        }
                        $.extend(aoData,{
                            "tokenid":$.cookie("tokenid"),
                            "method":"stdcomponent.getbysearch",
                            "dataobject":"control",
                            "columns":JSON.stringify([{"data":"number"}]),
                            "order": JSON.stringify([{"column":0, "dir":"asc"}]),
                            "search":JSON.stringify(aoData.search),
                            "rule": JSON.stringify(rule)
                        },true);
                    }),
                    "fnServerData": this.proxy(function (sSource, aoData, fnCallBack, oSettings) {
                        $.u.ajax({
                            url: $.u.config.constant.smsqueryserver,
                            type: "post",
                            dataType: "json",
                            cache: false,
                            data: aoData
                        },this.qid("datatable")).done(this.proxy(function (data) {
                            if (data.success) {
                                fnCallBack(data.data);
                            }
                        })).fail(this.proxy(function (jqXHR, errorText, errorThrown) {

                        })).complete(this.proxy(function(){
                        }));
                    }),
                    "aoColumnDefs": [{
                            "aTargets": 0,
                            "mRender": function (data, type, full) {
                                 return  data;
                            }
                        },{
                            "aTargets": 1,
                            "mRender": function (data, type, full) {
                                return data;
                            }
                        },{
                            "aTargets": 2,
                            "mRender": function (data, type, full) {
                                var htmls=["<ul style='padding-left:15px;list-style:none;'>"];
                                full.threats && $.each(full.threats,function(idx,threats){
                                  htmls.push("<li>"+(threats.num || "")+" <a href='#' class='addT' data-data ='"+JSON.stringify(threats)+"'>"+threats.name+"</a></li>"); 
                                });
                                htmls.push("</ul>");
                                return htmls.join("");
                            }
                        },
                        {
                            "aTargets": 3,
                            "mRender": function (data, type, full) {
                                var htmls=["<ul style='padding-left:15px;list-style:none;'>"];
                                full.errors && $.each(full.errors,function(idx,errors){
                                  htmls.push("<li>"+(errors.num || "")+" <a href='#' class='addE' data-data ='"+JSON.stringify(errors)+"'>"+errors.name+"</a></li>"); 
                                });
                                htmls.push("</ul>");
                                return htmls.join("");
                            }
                        },{
                            "aTargets": 4,
                            "mRender": this.proxy(function (data, type, full) {
                                var htmls = "";
                                if(this._manageable === true){
                                    htmls += "<button class='btn btn-link edit' data='" + JSON.stringify(full) + "'>" + this.i18n.edit + "</button>";
                                    htmls += "<button class='btn btn-link delete' data='" + JSON.stringify(full) + "'>" + this.i18n.remove + "</button>";
                                }
                                return htmls;
                            })
                        }
                    ]
                });
                //修改威胁
                this.dataTable.off("click","a.addT").on("click","a.addT",this.proxy(function(e){
                    e.preventDefault();
                    try{
                        var data = JSON.parse($(e.currentTarget).attr("data-data"));
                        $.u.ajax({
                            url: $.u.config.constant.smsqueryserver,
                            dataType: "json",
                            cache: false,
                            data: {
                                "tokenid":$.cookie("tokenid"),
                                "method":"stdcomponent.getbyid",
                                "dataobject":"threat",
                                "dataobjectid":parseInt(data.id)
                            }
                        },this.qid("datatable")).done(this.proxy(function (result) {
                            if (result.success) {
                                if (this.addTDialog == null) {
                                    this.addTDialog = this._getFormModule("t");
                                }
                                this.addTDialog.override({
                                    refreshDataTable: this.proxy(function(){
                                        this.dataTable && this.dataTable.fnDraw(true);
                                    })
                                });
                                this._currAddDialog = this.addTDialog;
                                this.addTDialog.open({"data":result.data,"title":this.i18n.editMsgT+data.name});
                                if(this._manageable === false){
                                    this.addTDialog.formDialog.parent().find(".ui-dialog-buttonpane button.ok").remove();
                                }
                            }
                        })).fail(this.proxy(function (jqXHR, errorText, errorThrown) {

                        }))
                    }catch(e){
                        throw new Error(this.i18n.editFail+e.message);
                    }
                }));
                //修改差错
                this.dataTable.off("click","a.addE").on("click","a.addE",this.proxy(function(e){
                    e.preventDefault();
                    try{
                        var data = JSON.parse($(e.currentTarget).attr("data-data"));
                        $.u.ajax({
                            url: $.u.config.constant.smsqueryserver,
                            dataType: "json",
                            cache: false,
                            data: {
                                "tokenid":$.cookie("tokenid"),
                                "method":"stdcomponent.getbyid",
                                "dataobject":"error",
                                "dataobjectid":parseInt(data.id)
                            }
                        },this.qid("datatable")).done(this.proxy(function (result) {
                            if (result.success) {
                                if (this.addEDialog == null) {
                                    this.addEDialog = this._getFormModule("e");
                                }
                                this.addEDialog.override({
                                    refreshDataTable: this.proxy(function(){
                                        this.dataTable && this.dataTable.fnDraw(true);
                                    })
                                });
                                this._currAddDialog = this.addEDialog;
                                this.addEDialog.open({"data":result.data,"title":this.i18n.editMsgE+data.name});
                                if(this._manageable === false){
                                    this.addEDialog.formDialog.parent().find(".ui-dialog-buttonpane button.ok").remove();
                                }
                            }
                        })).fail(this.proxy(function (jqXHR, errorText, errorThrown) {

                        }))
                    }catch(e){
                        throw new Error(this.i18n.editFail+e.message);
                    }
                }));
                //编辑控制措施
                this.dataTable.off("click","button.edit").on("click","button.edit",this.proxy(function(e){
                    e.preventDefault();
                    try{
                        var data = JSON.parse($(e.currentTarget).attr("data"));
                        if (this.addCDialog == null) {
                            this.addCDialog = this._getFormModule("c");
                        }
                        this.addCDialog.override({
                            refreshDataTable: this.proxy(function(){
                                this.dataTable && this.dataTable.fnDraw(true);
                            })
                        });
                        this._currAddDialog = null;
                        this.addCDialog.open({"data":data,"title":this.i18n.editMsgC+data.name});
                        if(this._manageable === false){
                            this.addCDialog.formDialog.parent().find(".ui-dialog-buttonpane button.ok").remove();
                        }
                    }catch(e){
                        throw new Error(this.i18n.editFail+e.message);
                    }
                }));
                //删除控制措施
                this.dataTable.off("click", "button.delete").on("click", "button.delete", this.proxy(function (e) {
                    e.preventDefault();
                    try{
                        var data = JSON.parse($(e.currentTarget).attr("data"));
                        (new com.sms.common.stdcomponentdelete({
                            body:"<div>"+
                                    this.i18n.confirmC + "？" +
                                 "</div>",
                            title:this.i18n.removeStatusC+data.title,
                            dataobject:"control",
                            dataobjectids:JSON.stringify([parseInt(data.id)])
                        })).override({
                            refreshDataTable:this.proxy(function(){
                                if(this.dataTable){
                                    if(this.dataTable.fnGetData().length > 1 ){
                                        this.dataTable.fnDraw(true);
                                    }else{
                                        this.dataTable.fnDraw();
                                    }
                                }
                            })
                        });
                    }catch(e){
                        throw new Error(this.i18n.removeFail+e.message);
                    }
                }));
                break;
            case 5://严重等级
                this.qid("tem-name").show();
                this.qid("tem-name-label").show();
                this.qid("tem-categories").hide();
                this.qid("tem-categories-label").hide();
                this.qid("systemlist").addClass("hidden");
                this.qid("systemlist").find(":radio[name=systemRadios]").prop("checked", false);
                this.dataTable = this.qid("datatable").dataTable({
                    searching: false,
                    serverSide: true,
                    bProcessing: true,
                    ordering: false,
                    pageLength : 1000,
                    "sDom":"t<i>",
                    "columns": $.extend([
                        { "title": this.i18n.name ,"mData":"name","sWidth":200},
                        { "title": this.i18n.level ,"mData":"provisions"}                       
                    ], this._manageable === true ? { "title": this.i18n.handle ,"mData":"id","sWidth":150} : null),
                    "aaData":[
                              
                    ],
                    "oLanguage": this._DATATABE_LANGUAGE,
                    "fnServerParams": this.proxy(function (aoData) {
                        var rule = [];
                        if(this.qid("tem-name").val()){
                            rule.push([{"key":"name", "op":"like", "value":this.qid("tem-name").val()}]);
                        }
                        $.extend(aoData,{
                            "tokenid":$.cookie("tokenid"),
                            "method":"stdcomponent.getbysearch",
                            "dataobject":"severity",
                            "columns":JSON.stringify([{"data":"name"}]),
                            "order": JSON.stringify([{"column":0, "dir":"asc"}]),
                            "search":JSON.stringify(aoData.search),
                            "rule":JSON.stringify(rule)
                        },true);
                    }),
                    "fnServerData": this.proxy(function (sSource, aoData, fnCallBack, oSettings) {
                        $.u.ajax({
                            url: $.u.config.constant.smsqueryserver,
                            type: "post",
                            dataType: "json",
                            cache: false,
                            data: aoData
                        },this.qid("datatable")).done(this.proxy(function (data) {
                            if (data.success) {
                                fnCallBack(data.data);
                            }
                        })).fail(this.proxy(function (jqXHR, errorText, errorThrown) {

                        })).complete(this.proxy(function(){
                        }));
                    }),
                    "aoColumnDefs": [{
                            "aTargets": 0,
                            "mRender": function (data, type, full) {
                                 return  data;
                            }
                        },{
                            "aTargets": 1,
                            "mRender": this.proxy(function (data, type, full) {
                                var htmls=["<ol style='padding-left:15px;'>"];
                                full.provisions && $.each(full.provisions,this.proxy(this.proxy(function(idx,level){
                                  htmls.push("<li><a href='#' class='addV' data-data ='"+JSON.stringify(level)+"'>"+level.name+"</a>")
                                  if(this._manageable === true){
                                    htmls.push("<a class='removeV' data='"+JSON.stringify(level)+"' href='#' >("+this.i18n.remove+")</a></li>"); 
                                  }else{
                                    htmls.push("</li>")
                                  }
                                  
                                })));
                                htmls.push("</ol>");
                                return htmls.join("");
                            })
                        },{
                            "aTargets": 2,
                            "mRender": this.proxy(function (data, type, full) {
                                var htmls = "";
                                if(this._manageable === true){
                                    htmls += "<button class='btn btn-link edit' data='" + JSON.stringify(full) + "'>" + this.i18n.edit + "</button>";
                                    htmls += "<button class='btn btn-link level' data='" + JSON.stringify(full) + "'>" + this.i18n.addLevel + "</button>";
                                    htmls += "<button class='btn btn-link delete' data='" + JSON.stringify(full) + "'>" + this.i18n.remove + "</button>";
                                }
                                return htmls;
                            })
                        }
                    ]
                });
                //修改等级
                this.dataTable.off("click","a.addV").on("click","a.addV",this.proxy(function(e){
                    e.preventDefault();
                    try{
                        $.u.load("com.sms.common.stdComponentOperate");
                        var data = JSON.parse($(e.currentTarget).attr("data-data"));
                        this.addLDialogEdit && this.addLDialogEdit.destroy(); 
                        this.addLDialogEdit = new com.sms.common.stdComponentOperate({
                            "title":"",
                            "dataobject":"provision",
                            "disabled": this._manageable === false,
                            "fields":[
                                    {name:"name",maxlength:255, label:this.i18n.name,type:"textarea",rule:{required:true},message:this.i18n.nameNotNull},
                                    {name:"score",maxlength:10,label:this.i18n.score,type:"text",rule:{required:true,digits:true},message:{required:this.i18n.scoreNotNull,digits:this.i18n.scoreNotInt}}
                            ]
                        });
                        this.addLDialogEdit.target($("div[umid='addLDialogEdit']",this.$));
                        this.addLDialogEdit.parent(this);
                        this.addLDialogEdit.override({
                            refreshDataTable:this.proxy(function(){
                                this.dataTable && this.dataTable.fnDraw(true);
                            })
                        });
                        this.addLDialogEdit.open({"data":data,"title":this.i18n.addLDialogEditTitle+data.name});
                        if(this._manageable === false){
                            this.addLDialogEdit.formDialog.parent().find(".ui-dialog-buttonpane button.ok").remove();
                        }
                    }catch(e){
                        throw new Error(this.i18n.editFail+e.message);
                    }
                }));
                //删除等级
                this.dataTable.off("click", "a.removeV").on("click", "a.removeV", this.proxy(function (e) {
                    e.preventDefault();
                    try{
                        var data = JSON.parse($(e.currentTarget).attr("data"));
                        (new com.sms.common.stdcomponentdelete({
                            body:"<div>"+
                                    this.i18n.confirmL + "？" +
                                 "</div>",
                            title:this.i18n.removeStatusL+data.name,
                            dataobject:"provision",
                            dataobjectids:JSON.stringify([parseInt(data.id)])
                        })).override({
                            refreshDataTable:this.proxy(function(){
                                if(this.dataTable){
                                    if(this.dataTable.fnGetData().length > 1 ){
                                        this.dataTable.fnDraw(true);
                                    }else{
                                        this.dataTable.fnDraw();
                                    }
                                }
                            })
                        });
                    }catch(e){
                        throw new Error(this.i18n.removeFail+e.message);
                    }
                }));
                
                //添加条款
                this.dataTable.off("click","button.level").on("click","button.level",this.proxy(function(e){
                    e.preventDefault();
                    try{
                        $.u.load("com.sms.common.stdComponentOperate");
                        var data = JSON.parse($(e.currentTarget).attr("data"));
                        this.model && this.model.destroy();
                        this.model = new com.sms.common.stdComponentOperate({
                            "title":this.i18n.addLDialogTitle,
                            "dataobject":"provision",
                            "fields":[
                                    {name:"severity",type:"hidden",dataType:"int",value:data.id},
                                    {name:"name",maxlength:255,label:this.i18n.name,type:"textarea",rule:{required:true},message:this.i18n.nameNotNull},
                                    {name:"score",maxlength:10,label:this.i18n.score,type:"text",rule:{required:true,digits:true},message:{required:this.i18n.scoreNotNull,digits:this.i18n.scoreNotInt}}
                            ]
                        });
                        this.model.target($("div[umid='addLDialog']",this.$));
                        this.model.parent(this);
                        this.model.override({
                            refreshDataTable:this.proxy(function(){
                                this.dataTable && this.dataTable.fnDraw(true);
                            })
                        }); 
                        this.model.open();
                    }catch(e){
                        throw new Error(this.i18n.editFail+e.message);
                    }
                }));
                //编辑
                this.dataTable.off("click","button.edit").on("click","button.edit",this.proxy(function(e){
                    e.preventDefault();
                    try{
                        var data = JSON.parse($(e.currentTarget).attr("data"));
                        if (this.addVDialog == null) {
                            this.addVDialog = this._getFormModule("v");
                        }
                        this.addVDialog.override({
                            refreshDataTable: this.proxy(function(){
                                this.dataTable && this.dataTable.fnDraw(true);
                            })
                        });
                        this._currAddDialog = null;
                        this.addVDialog.open({"data":data,"title":this.i18n.editMsgV+data.name});
                        if(this._manageable === false){
                            this.addVDialog.formDialog.parent().find(".ui-dialog-buttonpane button.ok").remove();
                        }
                    }catch(e){
                        throw new Error(this.i18n.editFail+e.message);
                    }
                }));
                //删除
                this.dataTable.off("click", "button.delete").on("click", "button.delete", this.proxy(function (e) {
                    e.preventDefault();
                    try{
                        var data = JSON.parse($(e.currentTarget).attr("data"));
                        (new com.sms.common.stdcomponentdelete({
                            body:"<div>"+
                                    this.i18n.confirmV + "？" +
                                 "</div>",
                            title:this.i18n.removeStatusV+data.name,
                            dataobject:"severity",
                            dataobjectids:JSON.stringify([parseInt(data.id)])
                        })).override({
                            refreshDataTable:this.proxy(function(){
                                if(this.dataTable){
                                    if(this.dataTable.fnGetData().length > 1 ){
                                        this.dataTable.fnDraw(true);
                                    }else{
                                        this.dataTable.fnDraw();
                                    }
                                }
                            })
                        });
                    }catch(e){
                        throw new Error(this.i18n.removeFail+e.message);
                    }
                }));
                break;
                
        };
    },
    on_systemTab_click: function(e){
    	var $tab = $(e.target);
    	this.dataTable && this.dataTable.fnDraw(false);
    },
    on_add_click: function(e){
    	var $button = $(e.currentTarget),
    		type = $button.attr("data-type"),
			$active = this.qid("systemlist").find("li.active a");
    	switch (type) {
    		case "f": 
    			var system = {id:parseInt($active.attr("data-value")), name:$active.text()};
    			if (this.addFDialog == null) {
    				this.addFDialog = this._getFormModule(type);
    			}
    			this.addFDialog.form.find("[name=system]").select2("data", system);
    			this.addFDialog.form.find("[name=num]").val("R-");
    			this.addFDialog.open();
    			this._currAddDialog = this.addFDialog;
    			break;
    		case "s":
    			var system = {id:parseInt($active.attr("data-value")), name:$active.text()};
    			if (this.addSDialog == null) {
    				this.addSDialog = this._getFormModule(type);
    			}
    			this.addSDialog.form.find("[name=system]").select2("data", system);
    			this.addSDialog.form.find("[name=num]").val("U-");
    			this.addSDialog.open();
    			this._currAddDialog = this.addSDialog;
    			break;
    		case "t": 
    			var system = {id:parseInt($active.attr("data-value")), name:$active.text()};
    			if (this.addTDialog == null) {
    				this.addTDialog = this._getFormModule(type);
    			}
    			this.addTDialog.form.find("[name=system]").select2("data", system);
    			this.addTDialog.form.find("[name=num]").val("T-");
    			this.addTDialog.open();
    			this._currAddDialog = this.addTDialog;
    			break;
    		case "e":
    			var system = {id:parseInt($active.attr("data-value")), name:$active.text()};
    			if (this.addEDialog == null) {
    				this.addEDialog = this._getFormModule(type);
    			}
    			this.addEDialog.form.find("[name=system]").select2("data", system);
    			this.addEDialog.form.find("[name=num]").val("E-");
    			this.addEDialog.open();
    			this._currAddDialog = this.addEDialog;
    			break;
    		case "c":
    			if (this.addCDialog == null) {
    				this.addCDialog = this._getFormModule(type);
    			}
    			this.addCDialog.open();
    			this._currAddDialog = null;
    			break;
    		case "v":
    			if (this.addVDialog == null) {
    				this.addVDialog = this._getFormModule(type);
    			}
    			this.addVDialog.open();
    			this._currAddDialog = null;
    			break;
    		default:
    			break;
    	}
    },
    _getFormModule: function(type){
    	var comp = null;
    	switch(type){
	    	case "f":
				comp = this._generateDialog(
					$("div[umid='addFDialog']",this.$), 
					this.i18n.addFDialogTitle, 
					"consequence",
					[this._fields.num, this._fields.name, this._fields.system, this._fields.insecuritys, this._fields.comment]
				);
				break;
			case "s":				
				comp = this._generateDialog(
					$("div[umid='addSDialog']",this.$), 
					this.i18n.addSDialogTitle, 
					"insecurity",
					[this._fields.num, this._fields.name, this._fields.system, this._fields.consequences, this._fields.threats,this._fields.errors, this._fields.comment]
				);
				break;
			case "t": 				
				comp = this._generateDialog(
					$("div[umid='addTDialog']",this.$), 
					this.i18n.addTDialogTitle, 
					"threat",
					[this._fields.num, this._fields.name, this._fields.system, this._fields.category, this._fields.classification, this._fields.insecuritys, this._fields.controls, this._fields.comment]
				);				
				break;
			case "e":
				comp = this._generateDialog(
					$("div[umid='addEDialog']",this.$), 
					this.i18n.addEDialogTitle, 
					"error",
					[this._fields.num, this._fields.name, this._fields.system, this._fields.category, this._fields.classification, this._fields.insecuritys, this._fields.controls, this._fields.comment]
				);
				break;
			case "c":				
				comp = this._generateDialog(
					$("div[umid='addCDialog']",this.$), 
					this.i18n.addCDialogTitle, 
					"control",
					[this._fields.number, this._fields.title, this._fields.threats, this._fields.errors, this._fields.comment]
				);				
				break;
			case "v":
				comp = this._generateDialog(
					$("div[umid='addVDialog']",this.$), 
					this.i18n.addVDialogTitle, 
					"severity",
					[this._fields.name, this._fields.comment]
				);
				break;
			default:
				break;
    	} 
    	comp.form.on("change", "input[name=system]", this.proxy(function(e){
    		$(e.currentTarget).closest("form").find("input[name=consequences],input[name=insecuritys],input[name=threats],input[name=errors]").select2("val", null);
    	}));
    	return comp;
    },
    _generateDialog: function(target, title, dataobject, fields){
    	var clz = $.u.load("com.sms.common.stdComponentOperate");
    	var comp = new clz(target, { "title": title, "disabled": this._manageable, "dataobject": dataobject, "fields": fields });
    	comp.override({
    		refreshDataTable: this.proxy(function(){
    			this.dataTable && this.dataTable.fnDraw();
    		})
    	});    
    	return comp; 
    },
    destroy: function () {
        this._super();
    }
}, { usehtm: true, usei18n: true });


com.sms.tem.temModel.widgetjs = [
                         	   "../../../uui/widget/jqdatatable/js/jquery.dataTables.js",
                         	   "../../../uui/widget/jqdatatable/js/dataTables.bootstrap.js",
                               "../../../uui/widget/spin/spin.js",
                               "../../../uui/widget/jqblockui/jquery.blockUI.js",
                               "../../../uui/widget/ajax/layoutajax.js",
                               "../../../uui/widget/select2/js/select2.min.js",
                               "../../../uui/widget/colortools/js/eye.js",
                               "../../../uui/widget/colortools/js/utils.js"
                              ];
com.sms.tem.temModel.widgetcss = [{ path: '../../../uui/widget/jqdatatable/css/jquery.dataTables.css' }, 
                                  { path: '../../../uui/widget/jqdatatable/css/dataTables.bootstrap.css' },
                                  { path:"../../../uui/widget/select2/css/select2.css"},
                                  { path:"../../../uui/widget/select2/css/select2-bootstrap.css"},
                                  { path: '../../../uui/widget/colortools/css/layout.css'}
                                ];