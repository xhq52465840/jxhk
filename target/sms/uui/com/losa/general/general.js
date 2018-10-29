$.u.define('com.losa.general.general', null, {
	init : function(options) {
		this._options = options || null;
		this.year = new Date().getFullYear();
	},
	afterrender : function() {
		this.queryGenralformVue = new Vue({
			el : '#queryGenralform',
			data : {
				manageQueryForm:{s_schemeName:'',s_impleUnitId:'',s_schemeType:'',p_flightId:'',p_observerId:'',p_depAirportNo:'',p_arrAirportNo:'',p_observeDate:'',p_observeDateTo:'',isAll:'',f_org_code:''},
				countList:'',
				losaUserRole:$.cookie('losaUserRole'),
				losaUserGroup:$.cookie('losaUserGroup'),
				options6 : [ {
					id : 0,
					text : ''
				}, ],
			},
			methods : {
				searchRepotBefore : this.proxy(this._searchRepotBefore),
				searchRepotAfter : this.proxy(this._searchRepotAfter),
				search : this.proxy(this._changeImpleUnit),
				cancel : this.proxy(this._cancel),
			}
		});
		this._queryImpleUnit();
		
		this._getDate();		
		
	},
	
	_queryScoreTemplet : function(reportMethod,general,tabName) {	   
		var data = {
			"method" : reportMethod,
			"manageQueryForm" : JSON.stringify(this.queryGenralformVue.manageQueryForm),
		};
		myAjaxQuery(data, null, this.proxy(function(response) {
			if (response.success) {
				var data1 = JSON.parse(response.data1);
				var data2 = JSON.parse(response.data2);
				var dataPie = new Array();
				for(var i=0 ;i<data1.length; i++){
					if(data2[i]>0){
						var obj = new Object();
						obj.name = data1[i];
						obj.value = data2[i];
						dataPie[i] = obj;
					}else{
						data1.splice(i,1);
						data2.splice(i,1);
						i--;
					}
				}
				
				var option1 = {
				    title : {
				        text: tabName,
				        subtext: '统计数据',
				        x:'center'
				    },
				    tooltip : {
				        trigger: 'item',
				        formatter: "{a} <br/>{b} : {c} ({d}%)"
				    },
				    legend: {
				        orient : 'vertical',
				        x : 'left',
				        data:data1
				    },
				    toolbox: {
				        show : true,
				        feature : {
				            mark : {show: true},
				            dataView : {show: true, readOnly: false},
				            saveAsImage : {show: true}
				        }
				    },
				    calculable : false,
				    series : [
				          { 
				            type:'pie',
				            radius : '65%',
				            center: ['50%', '55%'],
										itemStyle : {
											normal : {
												label : {
													show : true,
													position : 'top',
													textStyle : {
														fontSize : '10',
														fontFamily : '宋体',
													},
													formatter : "{b} : {c} ({d}%)",
												}
											}
				            },
				            data:dataPie
				        }
				    ],    
				};
				
				require.config({paths : {echarts : "../sms/dash/echarts/js"}});
				require(['echarts','echarts/chart/bar','echarts/chart/pie','echarts/chart/line','echarts/chart/funnel'],   
		        function (ec) {
			      	var myChart1 = ec.init(document.getElementById(general));
	            myChart1.setOption(option1);		      						
		        }
		    );
			}
		}));
		},
	
	_queryManageCount : function() {		
		var data = {
			"tokenid": $.cookie("tokenid"),
			"method" : "queryThreatErrorCount",			
			"manageQueryForm" : JSON.stringify(this.queryGenralformVue.manageQueryForm),
		};
		myAjaxQuery(data, null, this.proxy(function(response) {
			if (response.success) {
				this.queryGenralformVue.$set("countList", response.data);
			}
		}));
	},
	
	//查询被实施单位
	_queryImpleUnit:function(){
		var data = {
				tokenid: $.cookie("tokenid"),
        method: "querySchemeOrgcode",
		};
		myAjaxQuery(data, null, this.proxy(function(param, response) {
			if (param.success) {
				var array = new Array();
				var obj = new Object();
				obj.id = "null";
				obj.text = "全部";
				array.push(obj);
				$.each(param.data,function(index,value){
					var obj = new Object();
					obj.id = value.id;
					obj.text = value.unitName;
					array.push(obj);
				})
				this.queryGenralformVue.$set("options6", array);
				
				var role=this.queryGenralformVue.losaUserRole;
				var group=this.queryGenralformVue.losaUserGroup;
				if(role!="系统管理员"){
					this.queryGenralformVue.manageQueryForm.f_org_code = group;
				}else{
					this.queryGenralformVue.manageQueryForm.f_org_code = "null";
				}
				this._changeImpleUnit();
				}
			
		})); 
	},
	
	_changeImpleUnit:function(){
		this._queryManageCount();
		this._queryScoreTemplet('queryThreatTop5','generaltab1','出现概率TOP5的威胁');
		this._queryScoreTemplet('queryErrorNameTop5','generaltab2','出现概率TOP5的差错');
	},
	
	_cancel:function(){
		this.queryGenralformVue.manageQueryForm = {s_schemeName:'',s_impleUnitId:'',s_schemeType:'',p_flightId:'',p_observerId:'',p_depAirportNo:'',p_arrAirportNo:'',p_observeDate:'',p_observeDateTo:'',isAll:'',f_org_code:''};
		this._getDate();
	},

	_searchRepotBefore : function(e) {  
		this.year -= 1; 
		this._getDate(this.year);
		this._changeImpleUnit();
	},
	
	_searchRepotAfter : function(e) {
		this.year += 1; 
		this._getDate(this.year);
		this._changeImpleUnit();
	},
	
	_getDate:function(){
		this.queryGenralformVue.manageQueryForm.p_observeDateTo = (this.year+1)+'-01-01';
		this.queryGenralformVue.manageQueryForm.p_observeDate = this.year +'-01-01';
		$('#generaltit').html(this.year+'年LOSA管理统计');
	},
	
}, {
	usehtm : true,
	usei18n : false
});

com.losa.general.general.widgetjs = [];
com.losa.general.general.widgetcss = [];


