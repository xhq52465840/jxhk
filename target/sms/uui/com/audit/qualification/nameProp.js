//@ sourceURL=com.audit.qualification.nameProp
$.u.define("com.audit.qualification.nameProp", "com.sms.plugin.search.baseprop",{
	//copy from com.sms.plugin.search.dateProp
   table_html: function (data, type, row, meta) {
	   //姓名 
	   return   '<img width="24" height="24" src="'+row.avatarUrl+'" qid="userpic" alt="" />'
	   			+'<span qid="username" style="padding: 4px;">'+data+'</span>'
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
