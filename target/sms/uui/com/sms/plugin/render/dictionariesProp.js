//@ sourceURL=com.sms.plugin.render.dictionariesProp
$.u.define("com.sms.plugin.render.dictionariesProp", "com.sms.plugin.render.baseprop", {
    // table段
    table_html: function (data, type,row) { return data || ""; },
    table_render: function (data, full, cellsel) { this.cellsel = cellsel; },
    // edit段
    edit_html: function (setting) { 
    	return "<div class='form-group'>"+
					"<label class='col-sm-2 control-label'>"+setting.name+(setting.required === true ? "<span class='text-danger' style='position:absolute;'>*</span>" : "")+"</label>"+
					"<div class='col-sm-8'>"+
						"<input type='hidden' class='select2-field form-control' id='" + this._id + "-dictionary' name='" + setting.key + "' />"+
						(setting.description ? "<div class='help-block'><small>" + setting.description + "</small></div>" : "")+
					"</div>"+
				"</div>"; 
    },
    edit_render: function (setting, sel) {
    	this.editSel = sel;
    	this.editSetting = setting;
    	this.$select = $("#" + this._id + "-dictionary", this.editSel);

    	this.$select.select2({
    		width: "100%",
    		multiple: true,
    		ajax: {
    			url: $.u.config.constant.smsqueryserver,
    			type: "post",
    			dataType: "json",
    			data: this.proxy(function(term, page){
	            	return {
	            		tokenid: $.cookie("isAnonymityLogin") === "false" ? $.cookie("tokenid") : $.cookie("anonymityTokenid"),
	    				method: "stdcomponent.getbysearch",
	    				dataobject: "dictionary",
	    				rule: JSON.stringify([[{"key":"type","value":this.editSetting.config}], [{key:"name",op:"like",value:term}]]),
	    				start: (page - 1) * 10,
	    				length: 10
	    			};
	            }),
		        results:function(response, page, query){ 
		        	if(response.success){
		        		return {results:response.data.aaData, more:page * 10 < response.data.iTotalRecords};
		        	}else{
		        		$.u.alert.error(response.reason, 1000 * 3);
		        	}
		        }
    		},
	        formatResult: this.proxy(function(item){
	        	return item.name;
	        }),
	        formatSelection: this.proxy(function(item){
	        	return item.name;
	        }),
	        id: this.proxy(function(item){
	        	return item.value;
	        })
    	}).select2("data", this.editSetting.value && $.map(this.editSetting.value, function(item, idx){
    		return {name: item, value: item};
    	}));

        if(!this.editSetting.value && this.editSetting.defaultValue){
            this.$select.select2("data", this.editSetting.defaultValue);
        }
    },
    edit_getdata: function () {
    	var temp = {};
    	temp[this.editSetting.key] = $.map(this.$select.select2("data"), this.proxy(function(item, idx){
    		return item.value;
    	}));
    	return temp;
    },
    edit_disable:function(){
    	this.$select.select2("enable", false);
    },
    edit_enable:function(){
    	this.$select.select2("enable", true);
    },
    edit_valid:function(){
    	var result = true;
    	this.editSel.find(".required-message").remove();
    	if(this.editSetting.required === true && this.$select.select2("val").length==0){
    		result = false;
    		$("<div class='required-message text-danger'>" + this.editSetting.name + "不能为空</div>").appendTo(this.editSel.find(".col-sm-8"));
    	}
    	return result;
    },
    // read段
    read_html: function (setting) { 
    	var htmls = '<td class="name">#{name}</td><td class="value">#{value}</td>';
		htmls = htmls.replace(/#\{name\}/g,setting.name)
		  	     	 .replace(/#\{value\}/g,setting.value || "<span class='text-muted'>无</span>");
		return htmls; 
    },
    read_render: function (setting, sel) { },
    destroy: function () {
        this._super();
    }
}, { usehtm: false, usei18n: false });

com.sms.plugin.render.dictionariesProp.widgetjs = ['../../../../uui/widget/select2/js/select2.min.js'];
com.sms.plugin.render.dictionariesProp.widgetcss = [{id:"",path:"../../../../uui/widget/select2/css/select2.css"},
                                                  {id:"",path:"../../../../uui/widget/select2/css/select2-bootstrap.css"}]