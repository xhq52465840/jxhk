﻿//@ sourceURL=com.sms.plugin.render.dateProp
$.u.define("com.sms.plugin.render.dateProp", "com.sms.plugin.render.baseprop", {
    // table段
    table_html: function (data, type,row) { return data || ""; },
    table_render: function (data, full, cellsel) { this.cellsel = cellsel; },
    // edit段
    edit_html: function (setting) { 
    	return "<div class='form-group'>"+
					"<label class='col-sm-2 control-label'>"+setting.name+(setting.required === true ? "<span class='text-danger' style='position:absolute;'>*</span>" : "")+"</label>"+
					"<div class='col-sm-4 error-container'>"+
						"<div class='input-group'>"+
							"<input type='text' id='"+this._id+"-date-text' class='form-control input-sm' name='"+setting.key+"' />"+
							"<span class='input-group-btn'>"+
								"<button class='btn btn-default btn-sm' style='padding: 4px 6px;' id='"+this._id+"-button-showdate'><span class='glyphicon glyphicon-calendar'></span></button>"+
							"</span>"+
						"</div>"+
						(setting.description ? "<div class='help-block'><small>"+setting.description+"</small></div>" : "")+
					"</div>"+
				"</div>"; 
    },
    edit_render: function (setting, sel) {
    	var date = "";
    	this.editSel = sel;
    	this.editSetting = setting;
    	this.$dateText = $("#"+this._id+"-date-text");
    	this.$showDateBtn = $("#"+this._id+"-button-showdate");
    	
    	this.$dateText.datepicker({
    		dateFormat:"yy-mm-dd",
            onClose: this.proxy(function(dateText, inst){
                this.$dateText.blur();
            })
    	});
    	if(setting.value || setting.defaultValue){
    		date = (new Date(setting.value || setting.defaultValue)).format("yyyy-MM-dd");
    	}
        this.$dateText.val(date);
    	this.$showDateBtn.click(this.proxy(function(e){
    		e.preventDefault();
    		this.$dateText.focus();
    	}));
    	
    },
    edit_getdata: function () {
    	var temp = {};
    	if(/((^((1[8-9]\d{2})|([2-9]\d{3}))([-\/\._])(10|12|0?[13578])([-\/\._])(3[01]|[12][0-9]|0?[1-9])$)|(^((1[8-9]\d{2})|([2-9]\d{3}))([-\/\._])(11|0?[469])([-\/\._])(30|[12][0-9]|0?[1-9])$)|(^((1[8-9]\d{2})|([2-9]\d{3}))([-\/\._])(0?2)([-\/\._])(2[0-8]|1[0-9]|0?[1-9])$)|(^([2468][048]00)([-\/\._])(0?2)([-\/\._])(29)$)|(^([3579][26]00)([-\/\._])(0?2)([-\/\._])(29)$)|(^([1][89][0][48])([-\/\._])(0?2)([-\/\._])(29)$)|(^([2-9][0-9][0][48])([-\/\._])(0?2)([-\/\._])(29)$)|(^([1][89][2468][048])([-\/\._])(0?2)([-\/\._])(29)$)|(^([2-9][0-9][2468][048])([-\/\._])(0?2)([-\/\._])(29)$)|(^([1][89][13579][26])([-\/\._])(0?2)([-\/\._])(29)$)|(^([2-9][0-9][13579][26])([-\/\._])(0?2)([-\/\._])(29)$))/.test(this.$dateText.val()) === true){
    		temp[this.editSetting.key] = this.$dateText.val();
    	}
    	else{
    		temp[this.editSetting.key] = "";
    	}    	
    	return temp;
    },
    edit_disable:function(){
    	this.$dateText.attr("disabled",true);
    	this.$showDateBtn.addClass("disabled");
    },
    edit_enable:function(){
    	this.$dateText.attr("disabled",false);
    	this.$showDateBtn.removeClass("disabled");
    },
    edit_valid:function(){
    	var result = true ;
    	this.editSel.find(".required-message").remove();
    	if(this.editSetting.required === true){
            if(!$.trim(this.$dateText.val())){
                result = false;
                $("<div class='required-message text-danger'>"+this.editSetting.name+"不能为空</div>").appendTo(this.editSel.find(".error-container"));  
            }
    	}
        if($.trim(this.$dateText.val()) && /((^((1[8-9]\d{2})|([2-9]\d{3}))([-\/\._])(10|12|0?[13578])([-\/\._])(3[01]|[12][0-9]|0?[1-9])$)|(^((1[8-9]\d{2})|([2-9]\d{3}))([-\/\._])(11|0?[469])([-\/\._])(30|[12][0-9]|0?[1-9])$)|(^((1[8-9]\d{2})|([2-9]\d{3}))([-\/\._])(0?2)([-\/\._])(2[0-8]|1[0-9]|0?[1-9])$)|(^([2468][048]00)([-\/\._])(0?2)([-\/\._])(29)$)|(^([3579][26]00)([-\/\._])(0?2)([-\/\._])(29)$)|(^([1][89][0][48])([-\/\._])(0?2)([-\/\._])(29)$)|(^([2-9][0-9][0][48])([-\/\._])(0?2)([-\/\._])(29)$)|(^([1][89][2468][048])([-\/\._])(0?2)([-\/\._])(29)$)|(^([2-9][0-9][2468][048])([-\/\._])(0?2)([-\/\._])(29)$)|(^([1][89][13579][26])([-\/\._])(0?2)([-\/\._])(29)$)|(^([2-9][0-9][13579][26])([-\/\._])(0?2)([-\/\._])(29)$))/.test($.trim(this.$dateText.val())) === false){
            result = false;
            $("<div class='required-message text-danger'>日期格式不正确</div>").appendTo(this.editSel.find(".error-container"));  
        }

    	return result;
    },
    // read段
    read_html: function (setting) {
        var htmls = '<td class="name">#{name}</td><td class="value">#{value}</td>';
		htmls = htmls.replace(/#\{name\}/g, setting.name)
		  	     	 .replace(/#\{value\}/g, setting.value || "" );
		return htmls; 
    },
    read_render: function (setting, sel) { },
    destroy: function () {
//    	this.$dateText.datepicker("destroy").remove();
        this._super();
    }
}, { usehtm: false, usei18n: false });
