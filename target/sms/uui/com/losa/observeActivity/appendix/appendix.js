$.u.load("com.losa.observeActivity.linknew");
$.u.load("com.common.vueupload.fileList");
$.u.define('com.losa.observeActivity.appendix.appendix', null, {
	init:function(options){
		this._options = options||null;
        this.id=this._options.id;
        this.index = this._options.index;
		this.linknewUm=null;
		this.planId = this._options.planId;
	},
	afterrender:function(){
		if(this.linknewUm!=null)delete this.linknewUm;
		this.linknewUm=new com.losa.observeActivity.linknew($("div[umid='linknewUm']",this.$),{id:this.id,index:this.index,planId:this.planId});
		 if(this.attachDialog != null) delete this.attachDialog;
		 this.attachDialog=new com.common.vueupload.fileList($("div[umid='attachment']",this.$),{
			 activityId:this.id,type:'losa',language:'ch'
		 });
		
		
	}
}, { usehtm: true, usei18n: false });


com.losa.observeActivity.appendix.appendix.widgetjs = [
														"../../../eiosa/base.js",
														"../../../../uui/widget/spin/spin.js",
														"../../../../uui/widget/jqblockui/jquery.blockUI.js",
														"../../../../uui/widget/ajax/layoutajax.js",
														'../../vuewidget/accordion/js/accordion_component.js'
                                                       ];
com.losa.observeActivity.appendix.appendix.widgetcss = [
                                                        {path:"../../../../uui/widget/uploadify/uploadify.css"},
                                                        { path: '../../../../css/losa.css' }
                                                        ];