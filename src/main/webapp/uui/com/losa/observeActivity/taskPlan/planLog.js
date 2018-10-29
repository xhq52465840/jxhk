
$.u.load("com.losa.log.losaOperateLog");
$.u.define('com.losa.observeActivity.taskPlan.planLog', null, {
	init : function(options){
		this._options = options || null;
	},
	
	afterrender:function(){
//		debugger
		this.planId = this._options.id;
		
		this.planLogVue = new Vue({
			el : '#planLog',
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
		this.logTable=new com.losa.log.losaOperateLog($("div[umid='planLogTable']", this.$),{targetId:this.planId});
	},
	
	_queryLog:function(id){
			  this.logTable.reload(parseInt(id));		  
	},
	
    on_togglePanel_click: function(e){
//    	debugger
        var $this = $(e.currentTarget);
       
        if($this.hasClass("fa-minus")){
            $this.removeClass("fa-minus").addClass("fa-plus");
            
        }
        else{
            $this.removeClass("fa-plus").addClass("fa-minus");
            this._queryLog(this.planId)
        }
        $this.closest(".uui-panel-rect-header-new").next().toggleClass("hidden");
    },
  	
	
},{
	usehtm : true,
	usei18n : false
});
com.losa.observeActivity.taskPlan.planLog.widgetjs = ['../../../../uui/widget/select2/js/select2.min.js', 
                                                      '../../vuewidget/selectflights/js/selectflights.js',
                                                      "../../../eiosa/base.js",];
com.losa.observeActivity.taskPlan.planLog.widgetcss = [{ path: '../../../../css/losa.css' },
                                                       { path:"../../../../uui/widget/select2/css/select2.css"},
                                                       {path:"../../../../uui/widget/select2/css/select2-bootstrap.css"},
                                                       {path:"../../vuewidget/selectflights/css/selectflights.css"}];