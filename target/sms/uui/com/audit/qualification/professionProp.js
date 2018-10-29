//@ sourceURL=com.audit.qualification.professionProp
$.u.define("com.audit.qualification.professionProp", "com.sms.plugin.search.baseprop",{
	//copy from com.sms.plugin.search.dateProp
   table_html: function (data, type, row, meta) {
	   //专业 
	   if(data){
		   var htmls=["<ul style='padding-left:5px;'>"];
		   $.isArray(data) && $.each(data,this.proxy(function(idx,item){
			   htmls.push("<li><span class='' data-data ='"+JSON.stringify(item)+"'>"+item.name+"</span></li>"); 
		   }))
		     htmls.push("</ul>");
	        return htmls.join("");
	   }
	   return "";
   },
	// filter段
    filter_html: function () { 
    	return  '<div class="filter-layer">'
				+ '</div>';
    },
    filter_render: function (setting,toolsel) {},
    filter_getdata: function () {},
    filter_setdata:function(){
    	
    },
    filter_valid: function(){},
    destroy:function(){
    	this.$startDate.add(this.$endDate).datepicker("destroy");
    	this.filtersel.remove();
    	this.afterDestroy();
    	this._super();
    }
}, { usehtm: false, usei18n: false });
