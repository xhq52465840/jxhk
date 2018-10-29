//@ sourceURL=com.eiosa.reportDetail
$.u.load("com.eiosa.log.eiosaIsarpOperateLog");
$.u.define('com.eiosa.reportDetail', null, {
	init: function (options) {
		this._options = options || {};
    	this.reportId=this._options.id;
    	//this.sectionId=this._options.sectionId;
    	
	
	},
    afterrender: function (bodystr) {
    	debugger
    	this.reportvue = new Vue({
			el : '#report',
			data : {
				reportAll : '',				
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
		 this._queryReport(this.reportId); 
		 this.logTable=new com.eiosa.log.eiosaIsarpOperateLog($("div[umid='reportLogTable']", this.$),{targetId:this.reportId});

    },



    _queryReport : function(id){
 	   var data= {
 		   "method":"queryReportDtatil",
 	       "id":id 		
        };
 	   debugger
 	   myAjaxQuery(data, $("#report"), this.proxy(function(response){
 		  if(response.success){
 			  this.reportvue.$set("reportAll", response.data);
 			  
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
            this._queryLog(this.reportId)
        }
        $this.closest(".panel-heading").next().toggleClass("hidden");
    },

     _initHtml: function(e){
    	//debugger
    	//var id=JSON.parse($(e.currentTarget).attr("data"));
    	
    	var id = this._options.id;
    	var reportList= eiosaMainUm.portalUm.reportListUm.reportList;
		 $.each(reportList,this.proxy(function(index,item){
	    		if(item.id==id){
	    			//debugger
	    			//delete reportItem;
	    			reportItem = new Vue({ 
	    				el: '#reportDialog',  
	    				data: item,
	    				methods : {
	    					close : this.proxy(this._close),
	    				},
	    			}); //TODO 从数据库读取
	    			
	    		}
	  	  }));

    },
	_close : function(e) {
		layer.close(this.myLayerIndex);//由父传递过来
	},
	
}, { usehtm: true, usei18n: false });

com.eiosa.reportDetail.widgetjs = [
//                                            "../../../uui/vue.min.js",
//                                            "../../sms/losa/losa.js",
//                                            "../../../uui/tooltip/myTooltip.js",
//                                             "../../../uui/async/async.min.js",
//                                             "../../../uui/util/htmlutil.js",
//                                             "../base.js"
];
com.eiosa.reportDetail.widgetcss = [
                                    //{id:"",path:"../../uui/widget/select2/css/select2.css"},
                                            //{id:"",path:"../../uui/widget/select2/css/select2-bootstrap.css"}
                                    ];