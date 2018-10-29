//@ sourceURL=com.audit.checklist.tablehtml
$.u.define("com.audit.checklist.tablehtml", "com.sms.plugin.search.baseprop",{
	//copy from com.sms.plugin.search.dateProp
   table_html: function (data, type, row, meta) {
	   
	   if(row.type && row.type!="系统级检查项"){
			return	"<button type='button' class='btn btn-link edit' data='"+JSON.stringify(row)+"'>"+com.audit.checklist.tablehtml.i18n.edit+"</button>"
  			+  "<button type='button' class='btn btn-link delete' data='"+JSON.stringify(row)+"'>"+com.audit.checklist.tablehtml.i18n.remove+"</button>";
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
}, { usehtm: false, usei18n: true });
