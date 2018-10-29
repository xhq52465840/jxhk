
$.u.load("com.losa.log.losaOperateLog");
$.u.define('com.losa.scheme.schemeLog', null, {
	init : function(options){
		this._options = options || null;
	},
	
	afterrender:function(){
		this.schemeId = this._options.schemeId;
		
		this.schemeLogVue = new Vue({
			el : '#schemeLog',
			data : {},			
			methods : {
		queryLog:this.proxy(function(id){
			this._queryLog(id);
		}),
		
		logShow:this.proxy(function(e){
			this.on_togglePanel_click(e)
		}),
			}
		});	
//		debugger
		this.logTable=new com.losa.log.losaOperateLog($("div[umid='schemeLogTable']", this.$),{targetId:this.schemeId});
	},
	
	_queryLog:function(id){
			  this.logTable.reload(parseInt(id));		  
	},
    on_togglePanel_click: function(e){
        var $this = $(e.currentTarget);
       
        if($this.hasClass("fa-minus")){
            $this.removeClass("fa-minus").addClass("fa-plus");
            
        }
        else{
            $this.removeClass("fa-plus").addClass("fa-minus");
            this._queryLog(this.schemeId)
        }
        $this.closest(".uui-panel-rect-header-new").next().toggleClass("hidden");
    },
  	
	
},{
	usehtm : true,
	usei18n : false
});
com.losa.scheme.schemeEdit.widgetjs = ['../../../uui/vue.js',
                                       "../../losa/base.js",
                                       '../../../uui/widget/select2/js/select2.min.js',];
com.losa.scheme.schemeEdit.widgetcss = [{ path: '../../../css/losa.css' },
                                        { path:"../../../uui/widget/select2/css/select2.css"},
                                        {path:"../../../uui/widget/select2/css/select2-bootstrap.css"}];