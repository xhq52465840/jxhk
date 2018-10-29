//@ sourceURL=com.eiosa.section.sectionDetail
$.u.load("com.eiosa.log.eiosaIsarpOperateLog");
$.u.define('com.eiosa.section.sectionDetail', null, {
	init: function (options) {
		this._options = options || {};
		this.sectionId=this._options.id;
    	this.reportId=this._options.reportId;
    	this.sectionName=this._options.sectionName;	
	},
    afterrender: function (bodystr) {
    	Vue.filter('datestr', function(value) {
			var date = new Date(value);
			if ( isNaN(date)==true ) return value;
			return date.format("yyyy-MM-dd");
		});
    	this.sectionvue = new Vue({
			el : '#section',
			data : {
				sectionAll : '',				
			},
			methods : {
				queryLog:this.proxy(function(id){
					this._queryLog(id);
				}),
				
				logShow:this.proxy(function(e){
					this.on_togglePanel_click(e)
				}),
				
			}
		});
    	
		 this._querySection(this.sectionId);
		 this.logTable=new com.eiosa.log.eiosaIsarpOperateLog($("div[umid='sectionLogTable']", this.$),{targetId:this.sectionId});
    },


    _querySection : function(id){
 	   var data= {
 		   "method":"querySectionDtatil",
 	       "id":id
 		
        };
 	   myAjaxQuery(data, $("#section"), this.proxy(function(response){
 		  if(response.success){
 			  this.sectionvue.$set("sectionAll", response.data);
 			  
 		  }
 		  
 	   }));
    },
    _queryLog:function(id){
    	debugger
			  this.logTable.reload(parseInt(id));
		  
		  
	},
    on_togglePanel_click: function(e){
        var $this = $(e.currentTarget);
       
        if($this.hasClass("fa-minus")){
            $this.removeClass("fa-minus").addClass("fa-plus");
            
        }
        else{
            $this.removeClass("fa-plus").addClass("fa-minus");
            this._queryLog(this.sectionId)
        }
        $this.closest(".panel-heading").next().toggleClass("hidden");
    },
  	
	_close : function(e) {
		layer.close(this.myLayerIndex);//由父传递过来
	},
	
}, { usehtm: true, usei18n: false });

com.eiosa.section.sectionDetail.widgetjs = [
                                            "../../../uui/vue.min.js",
                                            "../../sms/losa/losa.js",
                                            "../../../uui/tooltip/myTooltip.js",
                                             "../../../uui/async/async.min.js",
                                             "../../../uui/util/htmlutil.js",
                                             "../base.js"];
com.eiosa.section.sectionDetail.widgetcss = [
                                    //{id:"",path:"../../uui/widget/select2/css/select2.css"},
                                            //{id:"",path:"../../uui/widget/select2/css/select2-bootstrap.css"}
                                    ];