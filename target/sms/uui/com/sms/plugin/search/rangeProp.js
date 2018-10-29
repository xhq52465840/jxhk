//@ sourceURL=com.sms.plugin.search.rangeProp
$.u.define("com.sms.plugin.search.rangeProp", "com.sms.plugin.search.baseprop",{
    // filter段
    filter_html: function () { 
    	return  '<div class="filter-layer">'
			    + '<form style="min-width:250px;" role="form" id="'+this._id+'-form">'
		    	+	'<div class="form-body">'
			    + 		'<div style="padding: 10px; " >'
			    +		'<label>最小</label>'
			    +     '<input  class="form-control input sm" id="'+this._id+'-inputMin">'
			    +		'<label>最大</label>'
			    +     '<input  class="form-control input sm" id="'+this._id+'-inputMax">'
				+		'</div>'
				+		'<div class="help-block"><small>输入最小,最大或者一个范围</small></div>'
				+ 	'</div>'
				+   this._filter_buttons()
				+ '</form>'
				+ '</div>';
    },
    filter_render: function (setting,toolsel) {
    	//setting = [{"name":"进行中"}];
        this.filtersel = toolsel;
        this.setting = setting;
        this.inputMin=$("#"+this._id+"-inputMin",this.filtersel).focus();
        this.inputMax = $("#"+this._id+"-inputMax",this.filtersel);
        this._filter_bind_commonobj();
        this._loadData();
    },
    _loadData:function(){
    	//this.inputAds.val(this.setting[0].name?this.setting[0].name:"");
    },
    filter_getdata: function () {
    	
    },
    filter_setdata:function(){
    	
    },
    destroy:function(){
    	this.filtersel.remove();
    	this.afterDestroy();
    	this._super();
    }
}, { usehtm: false, usei18n: false });
