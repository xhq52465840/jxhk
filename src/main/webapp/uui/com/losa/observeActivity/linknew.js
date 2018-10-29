$.u.define('com.losa.observeActivity.linknew', null, {
	init:function(options){
		this.id=options.id
		this.index = options.index;
		if(this.index == undefined || isNaN(this.index)){
			this.index = 0;
		}
		this.savefunction = options.savefunction;
		this.planId = options.planId;
	},
	afterrender:function(){
	//	this._scrollMenu('scrollnext');
		//添加链接
		this._initLinkNewDetail(this.id,this.index,this.planId);
	},
	refresh:function(){
		
	},
	_initLinkNewDetail:function(data,index,planId){
		var _that = this;
		this.linknewVue = new Vue({
			el:"#scrollnext",
			data:{
				dataObject:[
					{
						firstmenutitle:'任务详情',
						firstmenuclick:function(){
							function redirectNewUrl(){
								window.location.href = "../taskPlan/planEdit.html?id="+data+"&planId="+planId+"&index=0";
							}
							_that.leaveConfirm(redirectNewUrl);
						}
					}, 
					{
						firstmenutitle:'基础信息',
						firstmenuclick:function(){
							function redirectNewUrl(){
								window.location.href = "../obserview/obserview.html?id="+data+"&planId="+planId+"&index=1";
							}
							_that.leaveConfirm(redirectNewUrl);
						}
					},
					{
						firstmenutitle:'离场前/滑出',
						firstmenuclick:function(){
							function redirectNewUrl(){
								window.location.href = "../departure/departure.html?id="+data+"&planId="+planId+"&index=2";
							}
							_that.leaveConfirm(redirectNewUrl);
						}
					},
					{
						firstmenutitle:'起飞/爬行',
						firstmenuclick:function(){
							function redirectNewUrl(){
								window.location.href = "../takeOff/takeOff.html?id="+data+"&planId="+planId+"&index=3";
							}
							_that.leaveConfirm(redirectNewUrl);
						}
					}, 
					{
						firstmenutitle:'巡航',
						firstmenuclick:function(){
							function redirectNewUrl(){
								window.location.href = "../cruise/cruise.html?id="+data+"&planId="+planId+"&index=4";
							}
							_that.leaveConfirm(redirectNewUrl);
						}
					},
					{
						firstmenutitle:'着陆技术工作单',
						firstmenuclick:function(){
							function redirectNewUrl(){
								window.location.href = "../techWorkSheet/techWorkSheet.html?id="+data+"&planId="+planId+"&index=5";
							}
							_that.leaveConfirm(redirectNewUrl);
						}
					},
					{
						firstmenutitle:'下降/进近/着陆',
						firstmenuclick:function(){
							function redirectNewUrl(){
								window.location.href = "../launch/launch.html?id="+data+"&planId="+planId+"&index=6";
							}
							_that.leaveConfirm(redirectNewUrl);
						}
					},
					{
						firstmenutitle:'整个飞行',
						firstmenuclick:function(){
							function redirectNewUrl(){
								window.location.href = "../wholeFlight/wholeFlight.html?id="+data+"&planId="+planId+"&index=7";
							}
							_that.leaveConfirm(redirectNewUrl);
						}
					}, 
					{
						firstmenutitle:'威胁管理工作单',
						firstmenuclick:function(){
							function redirectNewUrl(){
								window.location.href = "../threatWork/threatWork.html?id="+data+"&planId="+planId+"&index=8";
							}
							_that.leaveConfirm(redirectNewUrl);
						}
					},
					{
						firstmenutitle:'差错管理工作单',
						firstmenuclick:function(){
							function redirectNewUrl(){
								window.location.href = "../errorWork/errorWork.html?id="+data+"&planId="+planId+"&index=9";
							}
							_that.leaveConfirm(redirectNewUrl);
						}
					}, 
					{
						firstmenutitle:'机组访谈',
						firstmenuclick:function(){
							function redirectNewUrl(){
								window.location.href = "../crewInterview/crewInterview.html?id="+data+"&planId="+planId+"&index=10";
							}
							_that.leaveConfirm(redirectNewUrl);
						}
					},
					{
						firstmenutitle:'附件上传',
						firstmenuclick:function(){
							function redirectNewUrl(){
								window.location.href = "../appendix/appendix.html?id="+data+"&planId="+planId+"&index=11";
							}
							_that.leaveConfirm(redirectNewUrl);
						}
					}
				
				],
				options:{
					componentPosition:{
						width:'170px'
					},
					oneAtATime:true,
					isLiCrossChangeColor:{
						isChangeColor:false,
						oddColor:'liodd',
						evenColor:'lieven',
					},
					animateDuration:300,
					index:index
				},
				changeColor:false
			}
		});
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
	   debugger;
	   myAjaxModify(data,null, this.proxy(function(response) {	
		   if(response.Code=="success"){
				$.u.alert.success("保存成功");
				//this._query(this.observiewVue.obserview.id);
				this.refresh();
			}else{
				$.u.alert.error("保存失败");
			}
				
			}));
   },
   autoRowSpan:function(tb,row,col){
		var lastValue=""; 
		var value=""; 
		var pos=1; 
		//alert(tb.rows.length);
		for(var i=row;i<tb.rows.length;i++){ 
		//alert(tb.rows[i].cells[1]);
		value = tb.rows[i].cells[col].innerText||tb.rows[i].cells[col].textContent; 
		if(lastValue == value){ 
		tb.rows[i].deleteCell(col); 
		tb.rows[i-pos].cells[col].rowSpan = tb.rows[i-pos].cells[col].rowSpan+1; 
		pos++; 
		}else{ 
		lastValue = value; 
		pos=1; 
		} 
		} 
	}, 
//    leaveConfirm:function(func){
//    	var _that = this;
//    	var layerindex = layer.confirm('是否需要离开？', {
//		    btn: ['离开并保存','离开不保存',"取消"] //按钮
//    		,btn3:function(){
//    			layer.close(layerindex);
//    		},
//    		title:false,
//    		closeBtn:0
//		},  this.proxy(function(){
////			debugger;
//			layer.close(layerindex);
//			this.save(func);
//		}), this.proxy(function(){
//			func();
//		})) ;
//    }
	leaveConfirm:function(func){
		if(this.index == 11){
			func();
		}else{
			this.save(func);
		}
    }
}, { usehtm: true, usei18n: false });
com.losa.observeActivity.linknew.widgetjs = ['../base.js',
                                          '../../../uui/widget/select2/js/select2.min.js',  
                                          '../vuewidget/accordion/js/accordion_component.js',
                                          "../../eiosa/base.js",
                                          "../../../uui/widget/jqblockui/jquery.blockUI.js",
                                          "../../../uui/widget/ajax/layoutajax.js"
                                          ];
com.losa.observeActivity.linknew.widgetcss = [
										{id:"",path:"../../../uui/widget/select2/css/select2.css"},
										{id:"",path:"../../../uui/widget/select2/css/select2-bootstrap.css"},
										{path:"../vuewidget/accordion/css/ce_accordion.css"}
                                           ]