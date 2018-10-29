//@ sourceURL=com.sms.plugin.organization.orgProp
$.u.define("com.sms.plugin.organization.orgProp", "com.sms.plugin.render.baseprop", {
    // table段
    table_html: function (data, full) { 
    	if(data && data.name){
    		return data.name || "";
    	}else{
    		return data || "";
    	}      
    	
    	},
    table_render: function (data, full, cellsel) { this.cellsel = cellsel; },
    // edit段
    edit_html: function (setting) { 
    	return "<div class='form-group'>"+
					"<label class='col-sm-2 control-label'>"+setting.name+(setting.required === true ? "<span class='text-danger' style='position:absolute;'>*</span>" : "")+"</label>"+
					"<div class='col-sm-8'>"+
						"<input type='hidden' id='"+this._id+"-unit' class='select2-field form-control' name='"+setting.key+"' />"+
						(setting.description ? "<div class='help-block'><small>"+setting.description+"</small></div>" : "")+
					"</div>"+
				"</div>"; 
    },
    edit_render: function (setting, sel) { 
    	this.editSel=sel;
    	this.editSetting=setting;
    	this.$unit=$("#"+this._id+"-unit",this.editsel);
    	 var unitName="";
         $.u.ajax({
  			url : $.u.config.constant.smsqueryserver,
  			type:"post",
  			async:false,
              dataType: "json",
              data: {
            	 tokenid:$.cookie("tokenid"),
          		dataobject:"organization",
  				method:"stdcomponent.getbysearch",
              }
      	}).done(this.proxy(function(response){
      		   if(response.success){
      			   console.log(response);
      			   for(i in response.data.aaData){
      				   if(response.data.aaData[i].id==setting.value){
      					 unitName=response.data.aaData[i].name;
      				   };
      			   }
      		   }
      	}));
    	this.$unit.select2({
    		width:'100%',
    		//multiple:true,
    		ajax:{
    			url:$.u.config.constant.smsqueryserver,
    			dataType: "json",
	            data:function(term,page){
	            	return {
	            		tokenid:$.cookie("tokenid"),
	            		dataobject:"organization",
	    				method:"stdcomponent.getbysearch",
	    			};
	            },
		        results:function(response,page,query){ 
		        	if(response.success){
		        		return {results:response.data.aaData};
		        	}
		        }
    		},
	        formatResult:function(item){
	        	return item.name;
	        },
	        formatSelection:function(item){
	        	return item.name;
	        }
    	}).select2("data", {value:this.editSetting.value?this.editSetting.value : "", 
    			name:this.editSetting.value ? unitName : ""});
    	if(!this.editSetting.value && this.editSetting.defaultValue){
            this.$unit.select2("data", this.editSetting.defaultValue);
        }
    },
    edit_getdata: function () {
    	var temp = {};
    	temp[this.editSetting.key]=Number(this.$unit.select2("val"));
    	return temp;
    },
    edit_disable:function(){
    	this.$unit.select2("enable",false);
    },
    edit_enable:function(){
    	this.$unit.select2("enable",true);
    },
    edit_valid:function(){
    	var result = true;
    	this.editSel.find(".required-message").remove();
    	if(this.editSetting.required === true && !$.trim(this.$unit.select2("val"))){
    		result = false;
    		$("<div class='required-message text-danger'>"+this.editSetting.name+""+不能为空+"</div>").appendTo(this.editSel.find(".col-sm-8"));
    	}
    	return result;
    },
    // read段
    read_html: function (setting) {
    	 var unitName="";
         $.u.ajax({
  			url : $.u.config.constant.smsqueryserver,
  			type:"post",
  			async:false,
              dataType: "json",
              data: {
            	 tokenid:$.cookie("tokenid"),
          		dataobject:"organization",
  				method:"stdcomponent.getbysearch",
              }
      	}).done(this.proxy(function(response){
      		   if(response.success){
      			   for(i in response.data.aaData){
      				   if(response.data.aaData[i].id==setting.value){
      					 unitName=response.data.aaData[i].name;
      				   };
      			   }
      		   }
      	}));
    	var htmls = '<td class="name">#{name}</td><td class="value">#{content}</td>';
		htmls = htmls.replace(/#\{name\}/g, setting.name || "")
		             .replace(/#\{content\}/g, unitName || "<span class='text-muted'>无</span>")
		 		 	 .replace(/#\{value\}/g, setting.value|| "");
		return htmls;
    },
    read_render: function (setting, sel) {},
    destroy: function () {
    	this.$unit.select2("destroy").remove();
        this._super();
    }
}, { usehtm: false, usei18n: true });

com.sms.plugin.organization.orgProp.widgetjs = ['../../../../uui/widget/select2/js/select2.min.js'];
com.sms.plugin.organization.orgProp.widgetcss = [{id:"",path:"../../../../uui/widget/select2/css/select2.css"},
                                                  {id:"",path:"../../../../uui/widget/select2/css/select2-bootstrap.css"}]