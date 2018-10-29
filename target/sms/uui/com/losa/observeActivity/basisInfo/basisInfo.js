$.u.load("com.losa.observeActivity.scoreTemplet.scoreTemplet");
$.u.load("com.losa.observeActivity.threatEvent.threatEvent");
$.u.load("com.losa.observeActivity.observer.observerMaintain");
$.u.define('com.losa.observeActivity.basisInfo.basisInfo', null, {
	init:function(options){
		this.basisInfoTempletUm = null;
	},
	afterrender:function(){
		
		this._queryUserRole(this);	
	},
	_queryUserRole:function(_that){
		var data = {
				"method" : "losaGetUserAuth",
			};
		debugger;
			myAjaxQuery(data, null, this.proxy(function(response){				
				if (response.success) {
					this._initBasisInfoDetail(_that,response.data);
				} 
			}));
	},
	_initBasisInfoDetail:function(_that,_userAuth){
		this.basisInfoVue = new Vue({
			el:"#basisInfoVue",
			watch:{
				'dataObject':function(){
					if(this.isFirst){
						$("#basisInfoVue #ceair_accordioncontainer a.firstmenua").get(0).click();
						this.isFirst = false;
					}
				}
			},
			created:function(){
				debugger;
				this.userRole = _userAuth;
				if(_userAuth=="子公司管理员"||_userAuth=="子公司管理员+观察员"){
					this.dataObject = this.losaOber;
				}else{
					this.dataObject = this.losaObject;
						
				}
				
			},
			data:{	
				isFirst:true,
				userRole:{},
				losaOber:[{
					firstmenutitle:'LOSA人员维护',
					firstmenuclick:function(){
						_that._initObserverMaintain();
					}
				}
				],
				losaObject:[
						    {
						    	firstmenutitle:'威胁事件',
						    	firstmenuclick:function(){
						    		_that._initThreatEvent1();
						    	}
						    },
							{
								firstmenutitle:'差错事件',
								firstmenuclick:function(){
									_that._initThreatEvent2();
								}
							},
							{
					    	firstmenutitle:'非预期航空器状态',
					    	firstmenuclick:function(){
					    		_that._initThreatEvent3();
					    	}
					    },
					    {
					    	firstmenutitle:'离场前/滑出评分模板',
					    	firstmenuclick:function(){
					    		_that._initScoreTemplet1();
					    	}
					    },
					    {
					    	firstmenutitle:'起飞/爬升评分模板',
					    	firstmenuclick:function(){
					    		_that._initScoreTemplet2();
					    	}
					    },
					    {
					    	firstmenutitle:'巡航评分模板',
					    	firstmenuclick:function(){
					    		_that._initScoreTemplet3();
					    	}
					    },
					    {
					    	firstmenutitle:'着陆技术工作单模板',
					    	firstmenuclick:function(){
					    		_that._initScoreTemplet4();
					    	}
					    },
					    {
					    	firstmenutitle:'下降/进近/着陆评分模板',
					    	firstmenuclick:function(){
					    		_that._initScoreTemplet5();
					    	}
					    },
					    {
					    	firstmenutitle:'整个飞行',
					    	firstmenuclick:function(){
					    		_that._initScoreTemplet6();
					    	}
					    },
					    {
					    	firstmenutitle:'LOSA人员维护',
					    	firstmenuclick:function(){
					    		_that._initObserverMaintain();
					    	}
					    }     

				   ],
				dataObject:[
			    
				],
				options:{
					componentPosition:{
						width:'210px'
					},
					oneAtATime:true,
					isLiCrossChangeColor:{
						isChangeColor:false,
						oddColor:'liodd',
						evenColor:'lieven',
					},
					animateDuration:300
				}
			
			},
		});


	},
	_initThreatEvent1:function(){
		if(this.basisInfoTempletUm != null) delete this.basisInfoTempletUm;
		this.basisInfoTempletUm = new com.losa.observeActivity.threatEvent.threatEvent($("div[umid='basisInfoTemplet']",this.$),{eventType:'L_THREAT_BASEINFO',tabName:'威胁事件'});
	},
	_initThreatEvent2:function(){
		if(this.basisInfoTempletUm != null) delete this.basisInfoTempletUm;
		this.basisInfoTempletUm = new com.losa.observeActivity.threatEvent.threatEvent($("div[umid='basisInfoTemplet']",this.$),{eventType:'L_ERROR_BASEINFO',tabName:'差错事件'});
	},
	_initThreatEvent3:function(){
		if(this.basisInfoTempletUm != null) delete this.basisInfoTempletUm;
		this.basisInfoTempletUm = new com.losa.observeActivity.threatEvent.threatEvent($("div[umid='basisInfoTemplet']",this.$),{eventType:'L_UNEXCEPT_STATUS_BASEINFO',tabName:'非预期航空器状态'});
	},
	_initScoreTemplet1:function(){
		if(this.basisInfoTempletUm != null) delete this.basisInfoTempletUm;
		this.basisInfoTempletUm = new com.losa.observeActivity.scoreTemplet.scoreTemplet($("div[umid='basisInfoTemplet']",this.$),{flyStageName:'departure',flyStageValue:'离场前/滑出',tabName:'离场前/滑出评分模板'});
	},
	_initScoreTemplet2:function(){
		if(this.basisInfoTempletUm != null) delete this.basisInfoTempletUm;
		this.basisInfoTempletUm = new com.losa.observeActivity.scoreTemplet.scoreTemplet($("div[umid='basisInfoTemplet']",this.$),{flyStageName:'takeOff',flyStageValue:'起飞/爬升',tabName:'起飞/爬升评分模板'});
	},
	_initScoreTemplet3:function(){
		if(this.basisInfoTempletUm != null) delete this.basisInfoTempletUm;
		this.basisInfoTempletUm = new com.losa.observeActivity.scoreTemplet.scoreTemplet($("div[umid='basisInfoTemplet']",this.$),{flyStageName:'cruise',flyStageValue:'巡航',tabName:'巡航评分模板'});
	},
	_initScoreTemplet4:function(){
		if(this.basisInfoTempletUm != null) delete this.basisInfoTempletUm;
		this.basisInfoTempletUm = new com.losa.observeActivity.scoreTemplet.scoreTemplet($("div[umid='basisInfoTemplet']",this.$),{flyStageName:'techWorkSheet',flyStageValue:'着陆技术工作单',tabName:'着陆技术工作单模板'});
	},
	_initScoreTemplet5:function(){
		if(this.basisInfoTempletUm != null) delete this.basisInfoTempletUm;
		this.basisInfoTempletUm = new com.losa.observeActivity.scoreTemplet.scoreTemplet($("div[umid='basisInfoTemplet']",this.$),{flyStageName:'launch',flyStageValue:'下降/进近/着陆',tabName:'下降/进近/着陆评分模板'});
	},
	_initScoreTemplet6:function(){
		if(this.basisInfoTempletUm != null) delete this.basisInfoTempletUm;
		this.basisInfoTempletUm = new com.losa.observeActivity.scoreTemplet.scoreTemplet($("div[umid='basisInfoTemplet']",this.$),{flyStageName:'wholeFlight',flyStageValue:'整个飞行',tabName:'整个飞行评分模板'});
	},
	_initObserverMaintain:function(){
		debugger;
		if(this.basisInfoTempletUm != null) delete this.basisInfoTempletUm;
		this.basisInfoTempletUm = new com.losa.observeActivity.observer.observerMaintain($("div[umid='basisInfoTemplet']",this.$));
	},
}, { usehtm: true, usei18n: false});

com.losa.observeActivity.basisInfo.basisInfo.widgetjs = ['../../vuewidget/accordion/js/accordion_component.js',
                                                         "../../../eiosa/base.js"];
com.losa.observeActivity.basisInfo.basisInfo.widgetcss =  [{path:"../../vuewidget/accordion/css/ce_accordion.css"}];
