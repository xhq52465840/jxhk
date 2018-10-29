//@ sourceURL=com.sms.activitytype.activityTypeSchemeDialog
$.u.define('com.sms.activitytype.activityTypeSchemeDialog', null, {
    init: function () {
        this.data=null;
        this.model="ADD";
    },
    afterrender: function (bodystr) {
    	this.i18n = com.sms.activitytype.activityTypeSchemeDialog.i18n;
    	// 表单
        this.activityTypeSchemeForm = this.qid("activityTypeSchemeForm");
        jQuery.validator.addMethod("isRequired", this.proxy(function(value, element){
    	    var li = this.sortable1.find("li");
    	    return li.length > 0;
    	}, ""));
        //表单-name
        this.name = this.qid("name");
        
        //显示几个单位
        this.units = this.qid("units");
        
        //
        this.unitsUl = this.qid("units-ul");
        
        //表单-description
        this.description = this.qid("description");
    	
        //下拉
        this.defaultType = this.qid("select");
        
        //拖动-ul
        this.sortable1 = this.qid("current-activity-sortable");
        this.sortable2 = this.qid("available-activity-sortable");
       
        //按钮-全部添加
        this.btn_activity_add = this.qid("btn_activity_add");
        
      //按钮-全部移除
        this.btn_activity_del = this.qid("btn_activity_del");
        
    	// 校验表单
        this.activityTypeSchemeForm.validate({
            rules: {
                "name": {
                	"required": true ,
                	"isRequired":true
                }
            },
            messages: {
            	"name": {
            		"required":this.i18n.casename,
                	"isRequired":this.i18n.requiredname
            	}
            },
            errorClass: "text-danger text-validate-element",
            errorElement:"div"
        });
        
        //拖动-ul
        this.sortable1.add(this.sortable2).sortable({
            connectWith: ".connectedSortable"
        }).disableSelection();
        
     // 绑定方案标题的点击事件
    	this.$.on("click",".unit-config-scheme-name",this.proxy(this._toggleScreenScheme));
        
        //下拉的添加、移除
        this.sortable1.on("sortreceive",(this.proxy(function(event,ui){
        	$('<option/>').attr("value",ui.item.attr("data-id")).text(ui.item.text()).appendTo(this.defaultType);
        })));
        
        this.sortable1.on("sortremove",(this.proxy(function(event,ui){
        	$("option[value="+ui.item.attr("data-id")+"]",this.defaultType).remove();
        })));

        //全部移除
        this.btn_activity_del.click(this.proxy(function(e){
        	e.preventDefault();
        	var $li = $("li",this.sortable1);
        	$li.remove();
        	$li.appendTo(this.sortable2);
        	$li.each(this.proxy(function(k,v){
        		$("option[value="+$(v).attr("data-id")+"]",this.defaultType).remove();
        	}));
        	$li = null;
        }));
        
        //全部添加
        this.btn_activity_add.click(this.proxy(function(e){
        	e.preventDefault();
        	var $li = $("li",this.sortable2);
        	$li.remove();
        	$li.appendTo(this.sortable1);
        	$li.each(this.proxy(function(k,v){
        		$('<option/>').attr("value",$(v).attr("data-id")).text($(v).text()).appendTo(this.defaultType);
        	}));
        	$li = null;
        }));

        
        this.activityTypeSchemeDialog = this.qid("activityTypeSchemeDialog").dialog({
            width:540,
            modal: true,
            draggable: false,
            resizable: false,
            autoOpen: false,
            create: this.proxy(function () {
            	
            }),
            open: this.proxy(function () {
            	if(this.mode=="ADD"){
            		this.unitsUl.parent().hide();
            		this.loadSortableData(null);
            	}else if(this.mode=="EDIT"){
            		this.unitsUl.parent().show();
            		this.loadSortableData(this.data);
            		this.name.val(this.data.name);
            	}else if(this.mode=="COPY"){
            		this.unitsUl.parent().hide();
            		this.loadSortableData(this.data);
            		this.name.val(this.data.name+this.i18n.transcript);
            	}
            }),
            close: this.proxy(function () {
                this.activityTypeSchemeForm.find("input:text").val("");
    			this.sortable2.empty();
    			this.sortable1.empty();
    			this.defaultType.empty();
    			this.unitsUl.empty();
    			this.units.text("0");
            })
        }); 
    },
    open: function (params) {
    	var dialogOptions=null;
    	this.btn_activity_del.show();
		this.btn_activity_add.parent().parent().show();
    	if(params){
	        if (params.operate=="EDIT") {
	            this.data = params.data;
	            this.mode = params.operate;
	            dialogOptions = {
	                title: params.title,
	                buttons: [
	                    {
	                        text: this.i18n.update,
	                        click: this.proxy(function (e) {
	                        	if (this.activityTypeSchemeForm.valid()) {
	                        		this._sendModifyAjax({
		                            	"tokenid":$.cookie("tokenid"),
					            		"method":"stdcomponent.update",
					            		"dataobject":"activityTypeScheme",
					            		"dataobjectid":this.data.id,
					            		"obj":JSON.stringify({
					            			"name":this.name.val(),
					            			"description":this.description.val(),
					            			"defaultType":parseInt(this.defaultType.val()),
					            			"types":$.map(this.sortable1.find("li"),function(li,idx){
					            				return parseInt($(li).attr("data-id"));
					            			})
					            		})
		                            },e);
		                        }
	                        })
	                    },
	                    {
	                        text: this.i18n.cancel,
	                        "class": "aui-button-link",
	                        click: this.proxy(function () {
	                            this.activityTypeSchemeDialog.dialog("close");
	                        })
	                    }
	                ]
	            };
	        }else if(params.operate=="COPY"){
	        	this.data = params.data;
	            this.mode = params.operate;
	            dialogOptions = {
	                title: params.title,
	                buttons: [
	                    {
	                        text: this.i18n.copy,
	                        click: this.proxy(function (e) {
	                        	if (this.activityTypeSchemeForm.valid()) {
	                        		this._sendModifyAjax({
		                            	"tokenid":$.cookie("tokenid"),
					            		"method":"stdcomponent.add",
					            		"dataobject":"activityTypeScheme",
					            		"obj":JSON.stringify({
					            			"name":this.name.val(),
					            			"description":this.description.val(),
					            			"defaultType":parseInt(this.defaultType.val()),
					            			"types":$.map(this.sortable1.find("li"),function(li,idx){
					            				return parseInt($(li).attr("data-id"));
					            			})
					            		})
		                            },e);
		                        }
	                        })
	                    },
	                    {
	                        text: this.i18n.cancel,
	                        "class": "aui-button-link",
	                        click: this.proxy(function () {
	                            this.activityTypeSchemeDialog.dialog("close");
	                        })
	                    }
	                ]
	            };
	        }
        }else {
	        this.mode = "ADD";
        	dialogOptions = {
	            title: this.i18n.addSafeScheme,
	            buttons: [
	                {
	                    text: this.i18n.add,
	                    click: this.proxy(function (e) {
	                        if (this.activityTypeSchemeForm.valid()) {
	                            this._sendModifyAjax({
	                            	"tokenid":$.cookie("tokenid"),
				            		"method":"stdcomponent.add",
				            		"dataobject":"activityTypeScheme",
				            		"obj":JSON.stringify({
				            			"name":this.name.val(),
				            			"description":this.description.val(),
				            			"defaultType":parseInt(this.defaultType.val()),
				            			"types":$.map(this.sortable1.find("li"),function(li,idx){
				            				return parseInt($(li).attr("data-id"));
				            			})
				            		})
	                            },e);
	                        }
	                    })
	                },
	                {
	                    text: this.i18n.cancel,
	                    "class": "aui-button-link",
	                    click: this.proxy(function () {
	                        this.activityTypeSchemeDialog.dialog("close");
	                    })
	                }
	            ]
	        };
        }
       
        this.activityTypeSchemeDialog.dialog("option",dialogOptions).dialog("open");
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
    _sendModifyAjax:function(data,e){
    	$("input,select",this.configureScreenSchemeForm).attr("disabled",true);
        $(e.currentTarget).add($(e.currentTarget).next()).button("disable");
        $.u.ajax({
        	url: $.u.config.constant.smsmodifyserver,
            type:"post",
            dataType: "json",
            cache: false,
            "data": data
        },this.qid("activityTypeSchemeDialog")).done(this.proxy(function(response){
        	if(response.success){
                this.activityTypeSchemeDialog.dialog("close");
                this.refreshDataTable();
        	}
        })).fail(this.proxy(function(jqXHR,errorText,errorThrown){
        	
        })).complete(this.proxy(function(jqXHR,errorStatus){
        	$("input,select",this.configureScreenSchemeForm).attr("disabled",false);
        	$(e.currentTarget).add($(e.currentTarget).next()).button("enable");
        }));
    },
    getById:function(id){
    	$.u.ajax({
    		url: $.u.config.constant.smsqueryserver,
            type:"post",
            dataType: "json",
            cache: false,
            "data": {
            	"tokenid":$.cookie("tokenid"),
        		"method":"stdcomponent.getbyid",
        		"dataobject":"activityTypeScheme",
        		"dataobjectid":parseInt(id)
            }
    	},this.qid("activityTypeSchemeDialog")).done(this.proxy(function(response){
    		if(response.success&&response.data){
    			this.unitsUl.empty();
    			this.units.text("0");
    			//应用于几个安监机构
    			response.data.units&&$.each(response.data.units,this.proxy(function(idx,unit){
					$('<li role="presentation"><a role="menuitem" tabindex="-1" href="../unitconfig/Summary.html?id='+unit.id+'" title="'+unit.name+'"><img width="16" src="'+unit.avatar+'" height="16"/>&nbsp;'+unit.name+'</a></li>').appendTo(this.unitsUl);
				}));
    			this.units.text(response.data.units.length);
        		this.description.val(response.data.description);
/*        		if(response.data.type=="default"){
        			this.btn_activity_del.hide();
        			this.btn_activity_add.parent().parent().hide();
        		}*/
    			//默认的安全信息类型
    			response.data.types&&$.each(response.data.types,this.proxy(function(k,v){
    				$('<option/>').attr("value",v.id).text(v.name).appendTo(this.defaultType);
    				//左侧的sort
					$('<li/>').attr("data-id",v.id).addClass("list-group-item").text(v.name).appendTo(this.sortable1);
    			}));
    			//右侧的sort
    			response.data.restTypes&&$.each(response.data.restTypes,this.proxy(function(k,v){
    				$('<li/>').attr("data-id",v.id).addClass("list-group-item").text(v.name).appendTo(this.sortable2);
    			}));

    			if(response.data.defaultType){
					$('option[value='+response.data.defaultType+']').attr("selected","selected");
					$('<option/>').attr({"value":""}).text(this.i18n.no).prependTo(this.defaultType);
    			}else{
    				$('<option/>').attr({"value":"","selected":"selected"}).text(this.i18n.no).prependTo(this.defaultType);
    			}
    		}
    	})).fail(this.proxy(function(jqXHR,errorText,errorThrown){
    		
    	})).complete(this.proxy(function(jqXHR,errorStatus){
    		
        }));
    },
    getBySearch:function(){
    	$.u.ajax({
    		url: $.u.config.constant.smsqueryserver,
            type:"post",
            dataType: "json",
            cache: false,
            "data": {
            	"tokenid":$.cookie("tokenid"),
        		"method":"stdcomponent.getbysearch",
        		"dataobject":"activityType"
            }
    	},this.qid("activityTypeSchemeDialog")).done(this.proxy(function(response){
    		if(response.success&&response.data){
    			$('<option/>').attr({"value":"","selected":"selected"}).text(this.i18n.no).prependTo(this.defaultType);
    			this.units.text("0");
    			//右边的sort
    			$.each(response.data.aaData,this.proxy(function(k,v){
    				$('<li/>').attr("data-id",v.id).addClass("list-group-item").text(v.name).appendTo(this.sortable2);
    			}))
    		}
    	})).fail(this.proxy(function(jqXHR,errorText,errorThrown){
    		
    	})).complete(this.proxy(function(jqXHR,errorStatus){
    		
        }));
    },
    loadSortableData:function(data){
    	if(data){
    		this.getById(data.id);
    	}else{
    		this.getBySearch();
    	}
    },
    destroy: function () {
        this._super();
    }
}, { usehtm: true, usei18n: true });



com.sms.activitytype.activityTypeSchemeDialog.widgetjs = [];
com.sms.activitytype.activityTypeSchemeDialog.widgetcss = [];