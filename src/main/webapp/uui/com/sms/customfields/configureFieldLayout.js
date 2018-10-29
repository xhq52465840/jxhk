//@ sourceURL=com.sms.customfields.configureFieldLayout
$.u.define('com.sms.customfields.configureFieldLayout', null, {
    init: function (options) {
        this._options = options;
    },
    afterrender: function (bodystr) {
    	this.i18n = com.sms.customfields.configureFieldLayout.i18n;
    	var configFieldLayoutId = $.urlParam().id;

		if(!configFieldLayoutId){
			window.location.href="ViewFieldLayouts.html";
		}
    	
        this.units = this.qid("units");
        this.unitsUl = this.qid("units-ul");
		this.configname = this.qid("configname");
    	this.$.on("click",".unit-config-scheme-name",this.proxy(this._toggleScreenScheme));
    	
    	this.dataTable = this.qid("datatable").dataTable({
            searching: false,
            serverSide: true,
            bProcessing: true,
            ordering: false,
            pageLength:1000,
            "sDom":"",
            "columns": [
                { "title": this.i18n.name ,"mData":"name"},
                { "title": this.i18n.boundary ,"mData":"screens","sWidth":"40%"},
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
            		"method":"getfieldlayoutitems",
            		"layout":configFieldLayoutId
            	},true);
            }),
            "fnServerData": this.proxy(function (sSource, aoData, fnCallBack, oSettings) {
            	$.u.ajax({
                    url: $.u.config.constant.smsqueryserver,
                    dataType: "json",
                    cache: false,
                    data: aoData
                },this.qid("datatable")).done(this.proxy(function (response) {
                    if (response.success) {
                    	response.data["layout"]&&this.configname.text(response.data["layout"])&&this.qid("configtext").text(response.data["layout"]);
                    	this.unitsUl.empty();
                    	response.data.units&&$.each(response.data.units,this.proxy(function(idx,unit){
        					$('<li role="presentation"><a role="menuitem" tabindex="-1" href="../unitconfig/Summary.html?id='+unit.id+'"><img width="16" src="'+unit.avatarUrl+'" height="16"/>&nbsp;'+unit.name+'</a></li>').appendTo(this.unitsUl);
        				}));
            			this.units.text(response.data.units.length);
                    	response.data.aaData = response.data.items;
                        fnCallBack(response.data);
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
                        	'<p class="text-muted"><small>' + full.rendererName + '</small></p>'+
                                '<p class="text-muted"><small>' + (full.description || "") + '</small></p>';
                    }
                },
                {
                    "aTargets": 1,
                    "mRender": function (data, type, full) {
                		var htmls=["<ul style='padding-left:15px;'>"];
                		full.screens&&$.each(full.screens,function(idx,screen){
                			htmls.push("<li><a href='../fieldscreen/ConfigFieldScreen.html?id="+screen.id+"'>"+screen.name+"</a>("+screen.tab+")</li>");
                		});
                		htmls.push("</ul>");
                        return htmls.join("");
                    }
                },
                {
                    "aTargets": 2,
                    "mRender": function (data, type, full) {
                    	var showHtml="";
                    	if(!full.hidden){
                    		showHtml += "<button class='btn btn-link edit' data='"+JSON.stringify(full)+"'>"+com.sms.customfields.configureFieldLayout.i18n.edit+"</button>";
                    		showHtml += "<button class='btn btn-link all' datatypes='hidden'  data='"+JSON.stringify(full)+"'>"+com.sms.customfields.configureFieldLayout.i18n.hidden+"</button>";
                    		var required = full.required?"可选择的":"必选项";
                        	showHtml+="<button class='btn btn-link all' datatypes='required' data='"+JSON.stringify(full)+"'>"+required+"</button>";
                        	showHtml+="<a class='btn btn-link screen ' href='../fieldscreen/AssociateFieldToScreens.html?key=" + full.key + "&name=" + escape(full.name) + "&id=" + configFieldLayoutId + "' class='btn btn-link btn-sm'>" + com.sms.customfields.configureFieldLayout.i18n.boundary + "</a>"+
                        						"<button class='btn btn-link renderer'  data='"+JSON.stringify(full)+"'>"+com.sms.customfields.configureFieldLayout.i18n.renderer+"</button>";
                    	}
                    	else{
                    		showHtml += "<button class='btn btn-link disabled' data='"+JSON.stringify(full)+"'>"+com.sms.customfields.configureFieldLayout.i18n.edit+"</button>";
                    		showHtml += "<button class='btn btn-link all' datatypes='hidden'  data='"+JSON.stringify(full)+"'>"+com.sms.customfields.configureFieldLayout.i18n.display+"</button>";
                    	}
                        return showHtml;                     	   
                    }
                }
            ]
        });
    	
    	
    	// 编辑字段配置
    	this.dataTable.off("click", "button.edit").on("click", "button.edit", this.proxy(function (e) {
        	e.preventDefault();
        	try{
        		var data = JSON.parse($(e.currentTarget).attr("data"));
        		if(!this.configFieldLayoutEdit){
        			$.u.load("com.sms.common.stdComponentOperate");
        			this.configFieldLayoutEdit = new com.sms.common.stdComponentOperate($("div[umid='configFieldLayoutEdit']",this.$),{
        	    		"dataobject":"fieldLayoutItem",
        	    		"fields":[
        		          {name:"description",label:this.i18n.describute,type:"textarea",maxlength:255}
        		        ]
        	    	});
        	    	this.configFieldLayoutEdit.override({
        	    		refreshDataTable:this.proxy(function(){
        	    			this.dataTable.fnDraw();
        	    		})
        	    	});
        		}
        		this.configFieldLayoutEdit.open({"data":data,"title":this.i18n.editDesc+data.name});
        	}catch(e){
        		throw new Error(this.i18n.editFail+e.message);
        	}
    	}));
    	
    	// 隐藏/显示字段配置
    	this.dataTable.off("click", "button.all").on("click", "button.all", this.proxy(function (e) {
        	e.preventDefault();
        	try{
        		var data = JSON.parse($(e.currentTarget).attr("data"));
        		var datatype = $(e.currentTarget).attr("datatypes");
        		var sendData = "";
        		switch(datatype){
        			case "hidden":
        				sendData = JSON.stringify({
            				"hidden":data.hidden?false:true
            			}) 
        				break;
        			case "required"	:
        				sendData = JSON.stringify({
            				"required":data.required?false:true
            			})
            			break;
        		}
            	$.ajax({
                	url: $.u.config.constant.smsmodifyserver,
                    type:"post",
                    dataType: "json",
                    cache: false,
                    "data": {
                    	"tokenid":$.cookie("tokenid"),
                		"method":"stdcomponent.update",
                		"dataobject":"fieldLayoutItem",
                		"dataobjectid":data.id,
                		"obj":sendData
                    }
                }).done(this.proxy(function(response){
                	if(response.success){
                		this.dataTable.fnDraw();
                	}
                })).fail(this.proxy(function(jqXHR,errorText,errorThrown){
                	
                })).complete(this.proxy(function(jqXHR,errorStatus){
                	
                }));
        	}catch(e){
        		throw new Error(this.i18n.hiddenFail+e.message);
        	}
    	}));
    	
    	// 界面
    	this.dataTable.off("click", "button.screen").on("click", "button.screen", this.proxy(function (e) {
        	e.preventDefault();
        	try{
        		var data = JSON.parse($(e.currentTarget).attr("data"));
        		window.location.href="../fieldscreen/AssociateFieldToScreens.html?key="+data.key+"&name="+escape(data.name)+"&id="+configFieldLayoutId;
        	}catch(e){
        		throw new Error(this.i18n.editFail+e.message);
        	}
    	}));
    	
    	//渲染器
    	this.dataTable.off("click", "button.renderer").on("click", "button.renderer", this.proxy(function (e) {
        	e.preventDefault();
        	try{
        		var data = JSON.parse($(e.currentTarget).attr("data"));
        		$.u.load("com.sms.common.stdComponentOperate");
        		this.configFieldLayoutRenderer&&this.configFieldLayoutRenderer.destroy();
            	this.configFieldLayoutRenderer = new com.sms.common.stdComponentOperate({
            		"dataobject":"fieldLayoutItem",
            		"fields":[
        	          {name:"renderer",label:this.i18n.renderer,type:"render",rule:{required:true},message:this.i18n.rendererNotNull,ajax:{"data":{"method":"getrendererbyfieldlayoutitem","fieldlayouyitem":data.id}}}
        	        ]
            	});
            	this.configFieldLayoutRenderer.target($("div[umid='configFieldLayoutRenderer']",this.$));
        		this.configFieldLayoutRenderer.open({"data":data,"title":this.i18n.rendererDesc+data.name});
        		this.configFieldLayoutRenderer.override({
            		refreshDataTable:this.proxy(function(){
            			this.dataTable.fnDraw();
            		})
            	});
        	}catch(e){
        		throw new Error(this.i18n.rendererFail+e.message);
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


com.sms.customfields.configureFieldLayout.widgetjs = ['../../../uui/widget/jqurl/jqurl.js','../../../uui/widget/jqdatatable/js/jquery.dataTables.js', '../../../uui/widget/jqdatatable/js/dataTables.bootstrap.js',
                                                      "../../../uui/widget/spin/spin.js"
                                                      , "../../../uui/widget/jqblockui/jquery.blockUI.js"
                                                      , "../../../uui/widget/ajax/layoutajax.js"];
com.sms.customfields.configureFieldLayout.widgetcss = [{ path: '../../../uui/widget/jqdatatable/css/jquery.dataTables.css' }, { path: '../../../uui/widget/jqdatatable/css/dataTables.bootstrap.css' }];