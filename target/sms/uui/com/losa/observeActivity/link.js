$.u.define('com.losa.observeActivity.link', null, {
	init:function(options){
		this.id=options.id
	},
	afterrender:function(){
	//	this._scrollMenu('scrollnext');
		//添加链接
		this._addLink(this.id);
	},
	refresh:function(){
		
	},
    _scrollMenu:function(id){
    	setInterval(function(){
    		   var posX,posY; 
    		    if (window.innerHeight) {  
    		        posX = window.pageXOffset;  
    		        posY = window.pageYOffset;  
    		    }  
    		    else if (document.documentElement && document.documentElement.scrollTop) {  
    		        posX = document.documentElement.scrollLeft;  
    		        posY = document.documentElement.scrollTop;  
    		    }  
    		    else if (document.body) {  
    		        posX = document.body.scrollLeft;  
    		        posY = document.body.scrollTop;  
    		    }  
    		    this.scrollnext=document.getElementById(id);
    		    this.scrollnext.style.top=(posY+197)+"px";  
    	   	    this.scrollnext.style.left=(posX+30)+"px";
    		   
    	   }, 100); 
   },
   _addLink:function(data){
	      document.getElementById('homePage').href="../taskPlan/planEdit.html?id="+data;
		  document.getElementById('basicUrl').href="../obserview/obserview.html?id="+data;
		  document.getElementById('departUrl').href="../departure/departure.html?id="+data;
		  document.getElementById('takeOffUrl').href="../takeOff/takeOff.html?id="+data;
		  document.getElementById('cruiseUrl').href="../cruise/cruise.html?id="+data;
		  document.getElementById('techWsUrl').href="../techWorkSheet/techWorkSheet.html?id="+data;
		  document.getElementById('launchUrl').href="../launch/launch.html?id="+data; 
		  document.getElementById('wholeFlUrl').href="../wholeFlight/wholeFlight.html?id="+data;
		  document.getElementById('threatUrl').href="../threatWork/threatWork.html?id="+data;
		  document.getElementById('errorUrl').href="../errorWork/errorWork.html?id="+data;
		  document.getElementById('crewUrl').href="../crewInterview/crewInterview.html?id="+data;
		  document.getElementById('appendix').href="../appendix/appendix.html?id="+data;
   },
   submitLosa:function(id){
	   
	   var data = {
			   "method":"submitLosa",
		       "id":id
			};
	   myAjaxModify(data,null, this.proxy(function(response) {
				
					
					if(response.Code=="success"){
						$.u.alert.success("提交成功");
					}else{
						$.u.alert.error("提交失败");
					}
				
			}));
	  
   },
   save:function(value){
	   var data = {
			   "method":"pushActivity",
		      	"jsonActivity":value
			};
	   myAjaxModify(data,null, this.proxy(function(response) {	
		   if(response.Code=="success"){
				$.u.alert.success("保存成功");
				//this._query(this.observiewVue.obserview.id);
				this.refresh();
			}else{
				$.u.alert.error("保存失败");
			}
				
			}));
   }
   
}, { usehtm: true, usei18n: false });
com.losa.observeActivity.link.widgetjs = ['../base.js',
                                          '../../../uui/widget/select2/js/select2.min.js',                                         
                                          ];
com.losa.observeActivity.link.widgetcss = [
										{id:"",path:"../../../uui/widget/select2/css/select2.css"},
										{id:"",path:"../../../uui/widget/select2/css/select2-bootstrap.css"},
                                           ]