//@ sourceURL=com.sms.fieldscreen.associateFieldToScreens
$.u.define('com.sms.fieldscreen.associateFieldToScreens', null, {
    init: function (options) {
        this._options = options;
    },
    afterrender: function (bodystr) {
    	this.i18n = com.sms.fieldscreen.associateFieldToScreens.i18n;
    	//回传id
    	this.id = $.urlParam().id;
    	
    	//key
    	this.associateFieldToScreensKey = $.urlParam().key;
    	
    	//name
    	this.name = $.urlParam().name;

		if(!this.associateFieldToScreensKey||!this.name){
			window.location.href="../customfields/ConfigureFieldLayout.html";
		}
    	//显示标题
    	this.configname = this.qid("configname");

    	this.configname.text(this.name);
    	 	
    	this.dataTable = this.qid("datatable").dataTable({
            searching: false,
            serverSide: true,
            bProcessing: true,
            ordering: false,
            pageLength:1000,
            "sDom":"",
            "columns": [
                { "title": this.i18n.surface ,"mData":"name","sWidth":300},
                { "title": this.i18n.label ,"mData":"tabs"},
                { "title": this.i18n.choose ,"mData":"id"}
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
            		"method":"getfieldtabmapping",
            		"key":this.associateFieldToScreensKey,
            		"search":""
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
				    	return '<strong>' + data + '</strong><input type="hidden" value="'+full.id+'" name="screen"></input>';
				    	return "";
				    })
				},
				{
				    "aTargets": 1,
				    "mRender": function (data, type, full) {
				        var htmls=["<select name=\"tabid\">"];
                		full.tabs && $.each(full.tabs,function(idx,tab){
                			htmls.push('<option value="'+tab.id+'" '+(tab.selected?"selected=\"true\"":"")+'>'+tab.name+'</option>');
                		});
                		htmls.push("</select>");
                        return htmls.join("");
				    }
				},
                {
                    "aTargets": 2,
                    "mRender": function (data, type, full) {
                    	var htmls="";
                		full.tabs && $.each(full.tabs,function(idx,tab){
                			if(tab.selected){
                				htmls+='<input type="checkbox" name="selected" checked="checked"></input>';
                			}
                		});
                		if(htmls==""){
                			htmls+='<input type="checkbox" name="selected"></input>';
                		}
                        return htmls;
                    }
                }
            ]
        });
    	
    	/*
    	 * mapping:[{"selected":true,"tabid":,screen:},{"selected":true,"tabid":,screen:}]
    	 * key:this.associateFieldToScreensKey
    	 * method:setfieldtabmapping
    	 * "tokenid":$.cookie("tokenid")
    	 */
    	
    	
    	// 更新
    	this.$.off("click", "button.update").on("click", "button.update", this.proxy(function (e) {
        	e.preventDefault();
        	try{
        		var mapping=[];
        		var $tr=$("tr:gt(0)","table[qid=datatable]");
        		$tr.each(function(k,v){
        			var data={
        				"screen":parseInt($("input[name=screen]",v).val()),
        				"tab":parseInt($("select[name=tabid]",v).val()),
        				"selected":$(":checkbox",v).is(':checked')
        			}
        			mapping.push(data);
        		})
        		$.ajax({
   				 url: $.u.config.constant.smsmodifyserver,
   	             dataType: "json",
   	             cache: false,
   	             data: {
   				 	"tokenid":$.cookie("tokenid"),
   				 	"method":"setfieldtabmapping",
   				 	"key":this.associateFieldToScreensKey,
   				 	"mapping":JSON.stringify(mapping)
   	    		 }
   			 }).done(this.proxy(function(response){
   				 if(response.success){
   					window.location.href="../customfields/ConfigureFieldLayout.html?id="+this.id;
   				 }
   			 })).fail(this.proxy(function(jqXHR,errorText,errorThrown){
   				 
   			 }));
        	}catch(e){
        		throw new Error(this.i18n.updateFail+e.message);
        	}
    	})); 
    	
    	//取消
    	this.$.off("click", "button.cancel").on("click", "button.cancel", this.proxy(function (e) {
        	e.preventDefault();
        	window.location.href="../customfields/ConfigureFieldLayout.html?id="+this.id;
    	})); 
    },
    destroy: function () {
        this._super();
    }
}, { usehtm: true, usei18n: true });


com.sms.fieldscreen.associateFieldToScreens.widgetjs = ['../../../uui/widget/jqurl/jqurl.js','../../../uui/widget/jqdatatable/js/jquery.dataTables.js', '../../../uui/widget/jqdatatable/js/dataTables.bootstrap.js'];
com.sms.fieldscreen.associateFieldToScreens.widgetcss = [{ path: '../../../uui/widget/jqdatatable/css/jquery.dataTables.css' }, { path: '../../../uui/widget/jqdatatable/css/dataTables.bootstrap.css' }];