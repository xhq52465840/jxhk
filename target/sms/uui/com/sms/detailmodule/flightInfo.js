//@ sourceURL=com.sms.detailmodule.flightInfo
/**
 * 用于显示“信息获取”面板中的飞机信息
 * @author tchen@usky.com.cn
 * @date 2016/11/21
 */
$.u.define('com.sms.detailmodule.flightInfo', null, {
    init: function (options) {
    	var flightNo="";
    	var flightDat="";
    	var dptApt="";
    	 var arrApt="";
        this._options = options || {};
        flightNo=this._options.flightNO?this._options.flightNO:"";
  	    flightDate=this._options.flightDate?this._options.flightDate:"";
  	   if(this._options.deptAirportName&&this._options.arrAirportName){
  		  dptApt=this._options.deptAirportName.iCaoCode;
    	  arrApt=this._options.arrAirportName.iCaoCode;
  	   }
  	   
        /**
         ** options
         ** {
         **	 type:"",	  // 信息类型flight...
         **	 param:{},	// ajax的参数
         ** }
         **/
        this.layout = {
        	flightInfo:{
        		title:"航班信息",
        		tabs:[
        		    {
        		    	url:$.u.config.constant.smsqueryserver,
        		    	data:{method:"getFlightInfo",dataobject:"flightInfo"},
        		    	title:"航班信息",
        		    	html:"FORM",
        		    	width:450,
        		    	column:2,
        		    	fields:{
        		    		"tailNO":{label:"机号",colspan:2},
        		    		"flightNO":{label:"航班号"},
        		    		"flightBJDate":{label:"航班日期(BJ)",
        		    		},
        		    		"deptAirportName":{label:"实际起飞机场",
        		    		},
        		    		"arrAirportName":{label:"实际到达机场",
        		    		},
        		    		"planArrAirportName":{label:"计划到达机场"},
        		    		"planDeptAirport":{label:"计划起飞机场"},
        		    		"etd":{label:"预计起飞时间"},
        		    		"std":{label:"计划起飞时间"},
        		    		"sta":{label:"计划到达时间"},
        		    		"atd":{label:"实际起飞时间"},
        		    		"ata":{label:"实际到达时间"},
        		    		"internationalFlight":{label:"航班类型",render:function(full){
        		    			var result = full.internationalFlight;
        		    			switch(full.internationalFlight){
	        		    			case "I": result = "国际"; break;
	        		    			case "D": result = "国内"; break;
	        		    			case "R": result = "地区"; break;
	        		    			// no default
        		    			}
        		    			return result;
        		    		}},
        		    		"cabinOpenTime":{label:"开舱门时间"},
        		    		"cabinCloseTime":{label:"关舱门时间"},
        		    		"BlockOffTime":{label:"撤轮档时间"},
        		    		"blockOnTime":{label:"上轮档时间"},
        		    		"deptBay":{label:"桥位号"}
        		    	}
        		    }/*,
        		    {
          		    	url:$.u.config.constant.smsqueryserver,
          		    	data:{
          		    		method:"getWeather",
          		    		flightNo:flightNo,
          		    		flightDate:flightDate,
          		    		dptApt:dptApt,
          		    		arrApt:arrApt,
          		    		},
          		    	title:"天气信息",
          		    	html:"TABLE",
          		    	width:700,
          		    	column:2,
          		    	fields:{
          		    		"reportBJTime":{label:"报文时间",
          		    		},
          		    		"cnMessage":{label:"报文详情"},
          		    	}
          		    }*/
        		    
        		]
        	},
        	airport:{
        		title:"机场信息",
        		tabs:[
          		    {
          		    	url:$.u.config.constant.smsqueryserver,
          		    	data:{method:"getAirport"},
          		    	title:"机场信息",
          		    	html:"FORM",
          		    	width:300,
          		    	column:2,
          		    	fields:{
          		    		"iATACode":{label:"三字码",colspan:2},
          		    		"iCaoCode":{label:"四字码"},
          		    		"countryCode":{label:"所在国家"},
          		    		"cityName":{label:"所在城市"},
          		    		"fullName":{label:"机场中文名"},
          		    		"fullEnName":{label:"机场英文名"},
          		    		"longitude":{label:"经度"},
          		    		"latitude":{label:"纬度"},
          		    		"delayBuffer":{label:"延误时间"},
          		    		"regionType":{label:"地区类型"},
          		    		"isJoinAirport":{label:"军民合用机场"},
          		    		"isTLAirport":{label:"起降机场"},
          		    		"isALTNAirport":{label:"备降机场"},
          		    		"isETOpsAirport":{label:"ETOPS运行机场"},
          		    		"isPolarAirport":{label:"极地机场"},
          		    		"plateauAirportCategory":{label:"高原机场类型"},
          		    		"operationCategory":{label:"机场类型"}
          		    	}
          		    },
          		    {
          		    	url:$.u.config.constant.smsqueryserver,
          		    	data:{method:"getWeather"},
          		    	title:"天气信息",
          		    	html:"TABLE",
          		    	width:700,
          		    	column:2,
          		    	fields:{
          		    		"reportBJTime":{label:"报文时间"},
          		    		"cnMessage":{label:"报文详情"},
          		    	}
          		    }/*,
          		    {
          		    	url:$.u.config.constant.smsqueryserver,
          		    	data:{
          		    		method:"getAirportInformation"
          		    	},
          		    	title:"机场平面图",
          		    	html:"TABLE",
          		    	width:700,
          		    	column:2,
          		    	fields:{
          		    		"title":{label:"名称"}
          		    	}
          		    }*/
          		]
        	},
          riskairport:{
            title:"机场信息",
            tabs:[
                {
                    url:$.u.config.constant.smsqueryserver,
                    data:{method:"getAirport"},
                    title:"机场信息",
                    html:"FORM",
                    width:300,
                    column:2,
                    fields:{
                        "iATACode":{label:"三字码",colspan:2},
                        "iCaoCode":{label:"四字码"},
                        "countryCode":{label:"所在国家"},
                        "cityName":{label:"所在城市"},
                        "fullName":{label:"机场中文名"},
                        "fullEnName":{label:"机场英文名"},
                        "longitude":{label:"经度"},
                        "latitude":{label:"纬度"},
                        "delayBuffer":{label:"延误时间"},
                        "regionType":{label:"地区类型"},
                        "isJoinAirport":{label:"军民合用机场"},
                        "isTLAirport":{label:"起降机场"},
                        "isALTNAirport":{label:"备降机场"},
                        "isETOpsAirport":{label:"ETOPS运行机场"},
                        "isPolarAirport":{label:"极地机场"},
                        "plateauAirportCategory":{label:"高原机场类型"},
                        "operationCategory":{label:"机场类型"}
                    }
                }/*,
                {
                  url: $.u.config.constant.smsqueryserver,
                  data: {
                    method: "getAirportInformation"
                  },
                  title: "机场平面图",
                  html: "TABLE",
                  width: 400,
                  column: 2,
                  fields: {
                    "title": {
                      label: "名称"
                    }
                  }
                }*/
            ]
          },
        	aircraftInfo:{
        		title:"飞机信息",
        		tabs:[
        		    {
        		    	url:$.u.config.constant.smsqueryserver,
        		    	data:{method:"getAircraftInfo",dataobject:"aircraft"},
        		    	title:"飞机信息",
        		    	html:"FORM",
          		    width:500,
        		    	column:2,
        		    	fields:{
        		    		"tailNo":{label:"机号",colspan:2},
        		    		"aircraftType":{label:"机型"},
        		    		"engineTypeModel":{label:"发动机型号"},
        		    		"tsn":{label:"总飞行小时"},
        		    		"engineCount":{label:"发动机装机数"},
        		    		"exitFactoryDate":{label:"出厂日期"},
        		    		"apuType":{label:"APU型号"},
        		    		"fsn":{label:"机队序号"},
        		    		"csn":{label:"总飞行循环小时"},
        		    		"aircraftManufacturer":{label:"飞机制造商"},
        		    		"status":{label:"飞机状态"},
        		    		"maintDeptId":{label:"执管单位"},
        		    		"msn":{label:"出厂序号"},
        		    		"transFlag":{label:"转移或卖出标记"},
        		    		"aircraftDescription":{label:"飞机描述"},
        		    		"airwayId":{label:"营运人"}
        		    	}
        		    },
        		    {
        		    	url:$.u.config.constant.smsqueryserver,
        		    	data:{method:"getAircraftInfo",dataobject:"monit"},
        		    	title:"重点监控故障",
        		    	html:"TABLE",
          		    width:1000,
        		    	fields:{
        		    		"tailNo":{label:"机号"},
        		    		"actype":{label:"机型"},
        		    		"ifDifficult":{label:"是否为疑难故障"},
        		    		"controller":{label:"控制人"},
        		    		"status":{label:"状态"},
        		    		"confirmContents":{label:"审核意见"},
        		    		"confirm_person":{label:"审核人"},
        		    		"confirmDate":{label:"审核日期"},
        		    		"closeReason":{label:"关闭原因",width:"20%"},
        		    		"yngzzjStatus":{label:"疑难故障总结状态"}
        		    	}
        		    },
        		    {
        		    	url:$.u.config.constant.smsqueryserver,
        		    	data:{method:"getAircraftInfo",dataobject:"deferredDefect"},
        		    	title:"故障保留",
        		    	html:"TABLE",
          		    width:800,
        		    	fields:{
        		    		"taskCode":{label:"编号"},
        		    		"applyDate":{label:"申请签字日期"},
        		    		"expireDate":{label:"到期日期"},
        		    		"ddfType":{label:"保留类型"},
        		    		"limitEnd":{label:"批准修复时限止"},
        		    		"deferEnd":{label:"延期修复时限止"},
        		    		"info":{label:"故障描述/损伤情况"},
        		    		"hasLimit":{label:"是否有限制"}
        		    	}
        		    },
        		    {
        		    	url:$.u.config.constant.smsqueryserver,
        		    	data:{method:"getAircraftInfo",dataobject:"deferredPepair"},
        		    	title:"暂缓修理项目",
          		    	width:800,
        		    	html:"TABLE",
        		    	fields:{
        		    		"taskCode":{label:"编号"},
        		    		"happenDate":{label:"发生日期"},
        		    		"chapter":{label:"ATA"},
        		    		"resolveLimit":{label:"修复期限"},
        		    		"cancelReason":{label:"取消原因"},
        		    		"controlScheme":{label:"监控方案"}		    		
        		    	}
        		    }
        		    // {
        		    // 	url:$.u.config.constant.smsqueryserver,
        		    // 	data:{method:"getAircraftInfo",dataobject:"bzcsj"},
        		    // 	title:"不正常事件",
          		  //   	width:900,
        		    // 	html:"TABLE",
        		    // 	fields:{
        		    // 		"tailNo":{label:"机号"},
        		    // 		"matDate":{label:"发生日期","render":function(full){  return full.matDate ? (new Date(full.matDate)).format("yyyy-MM-dd hh:mm:ss") : ''; }},
        		    // 		"matAirport":{label:"发生地点"},
        		    // 		"matPhase":{label:"发生阶段"},
        		    // 		"matSrc":{label:"报告来源"},
        		    // 		"matChuli":{label:"处理情况"},
        		    // 		"matPieceName":{label:"故障件名称"},
        		    // 		"bzcsjRpter":{label:"填报人"},
        		    // 		"bzcsjRptDate":{label:"填报日期"},
        		    // 		"bzcsjRptAirport":{label:"地点"},
        		    // 		"bzcsjExamer":{label:"审核人"},
        		    // 		"bzcsjExamDate":{label:"审核日期"},
        		    // 		"bzcsjFx":{label:"分析及总结","render":function(full){ return full.bzcsjFx && full.bzcsjFx.length > 20 ? '<span title="'+full.bzcsjFx+'">'+full.bzcsjFx.substr(0,20)+'...</span>' : (full.bzcsjFx||''); } }
        		    // 	}
        		    // }
        		]
        	},
        	flightCrew:{
        		title:"机组信息",
        		tabs:[
        		    {
        		    	url:$.u.config.constant.smsqueryserver,
        		    	data:{method:"searchFlightCrew",dataobject:"flightCrewMember"},
        		    	title:"机组信息",
        		    	html:"TABLE",
          		    	width:700,
        		    	fields:{
        		    		//"pcode":{label:"岗位代码",colspan:2},
        		    		"name":{label:"姓名", render: function(full){
        		    			return "<a href='#' data-type='flightCrewPersonInfo' data-param='" + JSON.stringify({ pcode: full.pcode }) + "' class='flight-person'>" + full.name + "</a>";
        		    		}},
        		    		"postDuty":{label:"岗位名称"},
        		    		"birthDate":{label:"出生日期"},
        		    		"sex":{label:"性别", render: function(full){
                      var map = {'M':'男','F':'女'};
                      return map[full.sex] || '';
                    }},
        		    		"phone":{label:"电话"},
        		    		//"party":{label:"党籍"},
        		    		"nativer":{label:"国籍"},
        		    		/*"pcode":{label:"资质", render: function(full){
        		    			return "<a href='http://mos.ceair.com/Crew/FlyCrew?PCode="+full.pcode+"' target='_blank'>查看</a>";
        		    		}}*/
        		    	}
        		    }
        		]
        	},
        	flightCrewPersonInfo: {
        		title: "机组成员信息",
        		tabs: [
						{
							   url: $.u.config.constant.smsqueryserver,
							   data: { method: "searchFlightCrew", dataobject: "crewSpecAirportInfo" },
							   title: "特殊机场",
							   width: 500,
							   html: "TABLE",
							   fields: {
								   "cityName":{label:"城市"},
								   "airportname": { label: "机场" },
								   "rankName": { label: "资质等级" },
								   "firstDate": { label: "放飞日期" },
								   "lastDate": { label: "最后经历日期" },
								   "validFlag": {label:"有效标志", render: function(full){
						               var map = {'Y':'是','N':'否'};
						               return map[full.validFlag] || '';
						             }},
							   }
						},
        		      {
        			   url: $.u.config.constant.smsqueryserver,
        			   data: { method: "searchFlightCrew", dataobject: "crewBaoWu" },
        			   title: "报务",
        			   width: 500,
        			   html: "TABLE",
        			   fields: {
        				   "bmName": { label: "区域" },
        				   "firstDate": { label: "开始日期" },
        				   "lastDate": { label: "到期日期" }
        			   }
        		   },
        		  /* {
        			   url: $.u.config.constant.smsqueryserver,
        			   data: { method: "searchFlightCrew", dataobject: "crewRNP" },
        			   title: "RNP",
        			   width: 500,
        			   html: "TABLE",
        			   fields: {
        				   "airport": { label: "机场" },
        				   "techType": { label: "技术类型" },
        				   "rankname": { label: "资质等级" },
        				   "firstDate": { label: "开始日期" },
        				   "lastDate": { label: "到期日期" }
        			   }
        		   },*/
        		   
//        		   {
//        			   url: $.u.config.constant.smsqueryserver,
//        			   data: { method: "searchFlightCrew", dataobject: "crewEtopsInfo" },
//        			   title: "ETOPS",
//        			   width: 500,
//        			   html: "TABLE",
//        			   fields: {
//        				   "area": { label: "区域" },
//        				   "actype": { label: "机型" },
//        				   "firstDate": { label: "开始日期" },
//        				   "lastDate": { label: "到期日期" }
//        			   }
//        		   },
        		   {
        			   url: $.u.config.constant.smsqueryserver,
        			   data: { method: "searchFlightCrew", dataobject: "crewLicenseInfo" },
        			   title: "证件",
        			   width: 500,
        			   html: "TABLE",
        			   fields: {
        				   "doctype": { label: "执照类型" },
        				   "state": { label: "状态" },
        				   "start": { label: "颁发日期" },
        				   "end": { label: "到期日期" }
        			   }
        		   }
        		]
        	},
        	carbinCrew:{
        		title:"乘务组信息",
        		tabs:[
        		    {
        		    	url:$.u.config.constant.smsqueryserver,
        		    	data:{ method:"searchFlightCrew", dataobject:"cabinCrewMember" },
        		    	title:"乘务组信息",
        		    	html:"TABLE",
          		    width:500,
        		    	fields:{
        		    		"staffName":{label:"姓名", render: function(full){
        		    			return "<a href='#' data-type='carbinCrewPersonInfo' data-param='" + JSON.stringify({ staffid: full.staffid }) + "' class='flight-person'>" + full.staffName + "</a>";
        		    		}},
        		    		"birthday":{label:"出生日期",/*"render":function(full){  return full.birthday ? (new Date(full.birthday)).format("yyyy-MM-dd") : ''; }*/},
        		    		"sex":{label:"性别", render: function(full){
                      var map = {'M':'男','F':'女'};
                      return map[full.sex] || '';
                    }},
        		    		"phone":{label:"电话"},
        		    		"nationality":{label:"国籍"}    		    		
        		    	}
        		    }
        		]
        	},
        	carbinCrewPersonInfo: {
        		title: "乘务组成员详细",
        		tabs: [
        		    {
        		    	url: $.u.config.constant.smsqueryserver,
          			    data: { method:"searchFlightCrew", dataobject:"cabinQualificationInfo" },
          			    title: "飞行资格",
        		    	html: "TABLE",
          		    	width: 500,
          			    fields: {
          			    	"staffname": { label: "姓名" },
          			    	// "licenceCode": { label: "证件编码" },
          			    	// "announcerLevel": { label: "播音等级" },
          			    	// "announcerLanguage": { label: "播音语言" },
          			    	// "isInspector": { label: "检查员" },
          			    	"isTeacher": { label: "教员" },
          			    	// "isSpecial": { label: "专用" },
          			    	"isAnnouncer": { label: "播音员" },
          			    	// "isSafety": { label: "安全" }
          			    }
        		    },
        		    {
        		    	url: $.u.config.constant.smsqueryserver,
          			    data: { method:"searchFlightCrew", dataobject:"cabinLicenceInfo" },
          			    title: "签证",
        		    	html: "TABLE",
          		    	width: 500,
          			    fields: {
          			    	"passportType": { label: "护照类型" },
          			    	"visaType": { label: "签证类型" },
          			    	"paspoortName": { label: "护照名称" },
          			    	"visaName": { label: "签证名称" }
          			    }
        		    }
        		]
        	},
        	control:{
        		title:"运控信息",
        		tabs:[
        		    {
        		    	url:$.u.config.constant.smsqueryserver,
        		    	data:{method:"getFlightInfo",dataobject:"dispatchInfo"},
        		    	title:"航班签派情况",
        		    	html:"FORM",
          		    	width:400,
        		    	fields:{
        		    		"dispatcher":{label:"签派员"},
        		    		"planTakeOffFuel":{label:"计划燃油"},
        		    		"burn":{label:"航段耗油"},
        		    		"adjustedMTOW":{label:"最大起飞重量"},
        		    		"takeOffWeight":{label:"实际起飞重量"},
        		    		"maxLandingWeight":{label:"最大降落重量"},
        		    		"landingWeight":{label:"实际降落重量"},
        		    		"operatingEmptyWeight":{label:"飞机操作重量/干重"},
        		    		"zeroFuelWeight":{label:"实际无油重量"}
        		    	}
        		    },
        		    {
        		    	url:$.u.config.constant.smsqueryserver,
        		    	data:{method:"getFlightInfo",dataobject:"loadSheet"},
        		    	title:"舱单",
        		    	html:"FORM",
          		    	width:400,
        		    	fields:{
        		    		"flightLayout":{label:"舱位布局"},
        		    		"compartmentsTotalLoad":{label:"货物重量"},
        		    		"passengerWeight":{label:"旅客重量"},
        		    		"adultPassenger":{label:"成人数"},
        		    		"childPassenger":{label:"儿童数"},
        		    		"babyPassenger":{label:"婴儿数"},
        		    		"fstCheckInPax":{label:"头等舱登机数"},
        		    		"busCheckInPax":{label:"商务舱登机数"},
        		    		"encCheckInPax":{label:"经济舱登机数"},
        		    		"bag":{label:"行李重量"},
        		    		"pos":{label:"邮件重量"},
        		    		"maxTrafficLoad":{label:"最大业载"},
        		    		"totalTrafficLoad":{label:"实际业载"}
        		    	}
        		    }
        		]
        	}
        };
        this.DEFAULT_WIDTH = 500;
    },
    afterrender: function (bodystr) {
    	this.tabList = this.qid("tab-list");				    // 选项卡列表
    	this.tabContent = this.qid("tab-content");			// 选项卡内容
    	this.panelTitle = this.qid("title");				    // 标题
    	this.tabList.on("show.bs.tab", "a[data-toggle=tab]", this.proxy(this.on_tab_show));
    	
    	this._draw();
	},
	/**
	 * @title execute when tab show
	 * @param e {object} 鼠标对象
	 * @return void 
	 */
	on_tab_show:function(e){ 
		var $this = $(e.currentTarget),$content = $($this.attr("href")),tab = $this.closest("li").data("tab");
		this.$.parent().animate({"width":tab.width || this.DEFAULT_WIDTH});
		if($content.children().length < 1){
			this._drawTabContent(tab,$content);
		}
	},
	/**
	 * @title draw html
	 * @return void
	 */
	_draw:function(){
    var className = "",
      $content = null,
      config = this.layout[this._options.type];
    this.panelTitle.text(config.title);
    $.each(config.tabs, this.proxy(function(idx, tab) {
      className = idx == 0 ? "active" : "";
      $('<li role="presentation" class="' + className + '"><a href="#tab-' + this._id + "-" + idx + '" role="tab" data-toggle="tab">' + tab.title + '</a></li>').data("tab", tab).appendTo(this.tabList);
      $content = $('<div role="tabpanel" class="tab-pane ' + className + '" id="tab-' + this._id + "-" + idx + '"></div>').appendTo(this.tabContent);
      if (className) {
        this.$.parent().animate({
          "width": tab.width || this.DEFAULT_WIDTH
        });
        this._drawTabContent(tab, $content);
      }
    }));
    if (config.tabs.length == 1) {
      this.tabList.addClass("hidden");
    }
	},
	/**
	 * @title draw tab content 
	 * @param tab {object} tab setting
	 * @param container {jQuery object} html container
	 * @return void
	 */
	_drawTabContent:function(tab,$content){
		if(tab.html == "FORM"){ this._drawForm(tab,$content); }
		else if(tab.html == "TABLE") { this._drawTable(tab,$content); }
	},
	/**
	 * @title draw form
	 * @param tab {object} tab setting
	 * @param container {jQuery object} html container
	 * @return void
	 */
	_drawForm:function(tab,container){
		var $table = $("<table class='table table-condensed table-hover'/>").appendTo(container),
			param = $.extend({},this._options.param,tab.data),
			$tr = null;
		$.each(tab.fields,function(key,field){
			//TODO 根据tab.column 动态布局
			$("<tr><td class='tdlabel' style='width:35%;'>"+field.label+"</td><td class='tdvalue' data-key='"+key+"'></td></tr>").appendTo($table);
		});
		this._ajax(tab.url,param,$table,function(response){
			if(response.data){
				var key = null, data = $.isArray(response.data) && response.data.length > 0 ? response.data[0] : response.data;
				$table.find("td.tdvalue").each(function(){
					key = $(this).attr("data-key");
					$(this).html(tab.fields[key].render ? tab.fields[key].render(data) : data&&data[key] );
				});
			}
		});
	},
	/**
	 * @title draw table
	 * @param tab {object} tab setting
	 * @param container {jQuery object} html container
	 * @return void
	 */
	_drawTable:function(tab,container){
		var $table = $("<table class='table table-condensed table-hover'><thead><tr class='active'></tr></thead></table>").appendTo(container),
			$thead = $table.find("thead > tr"),
			param = $.extend({},this._options.param,tab.data),
			$tr = null;
		$.each(tab.fields,function(key,field){
			$("<th data-key='"+key+"' style='width:"+(field.width || '')+";'>"+field.label+"</th>").appendTo($thead);
		});
		if(tab.data.method =="getAirportInformation"){
			param = {
				"method":tab.data.method,
				"airportCode":this._options.param.iCaoCode || this._options.param.iATACode,
				"dataobject":"getAirportInformation"
			}
		}
		this._ajax(tab.url,param,$table,this.proxy(function(response){
			if(response.data){
				var $tr=null;
				if(tab.data.method =="getAirportInformation"){
					$tr = $("<tr/>").appendTo($table);
					response.data.airportRuleFile && $("<td><span data-href='"+(response.data.airportRuleFile.replace(/\\/g,'/'))+"' class='pdfUrl'>机场平面图</span></td>").appendTo($tr);
					$.each(response.data.chartList,function(idx,item){
						$tr = $("<tr/>").appendTo($table);
						$("<td><span data-href='"+(item.filePath.replace(/\\/g,'/'))+"'  class='pdfUrl'>"+item.chartName+"</span></td>").appendTo($tr);
					});
					if(!response.data.airportRuleFile && !response.data.chartList.length){
						$('<td>没有数据</td>').appendTo($tr);
					}
					$table.find('span.pdfUrl').off("click").on("click",this.proxy(this.getForm));
				}else{
					$.each(response.data,function(idx,item){
						$tr = $("<tr/>").appendTo($table);
						$.each(tab.fields,function(key,field){
							$("<td>"+(field.render ? field.render(item) : (item[key]||""))+"</td>").appendTo($tr);
						});
					});
				}
			}
		}));
	},
	getForm : function(e){
		var $e = $(e.currentTarget),url = $e.attr("data-href");
		window.open($.u.config.constant.smsqueryserver+"?method=getAirportPdf&tokenid="+$.cookie("tokenid")+"&pdfUrl="+url,'_blank');
	},
	/**
	 * @title ajax
	 * @param url {string} ajax url
	 * @param params {object} ajax params
	 * @param container {jQuery object} html container
	 * @param callback {function} after receiving the data execution
	 * @return void
	 */
	_ajax:function(url,params,container,callback){
		if(params.method=="getWeather"){
			delete params.flightInfoID;
		}
    $.u.ajax({
      url: url,
      dataType: "json",
      cache: false,
      data: $.extend({
        "tokenid": $.cookie("tokenid")
      }, params)
    }, container, {
      size: 1,
      backgroundColor: '#fff'
    }).done(this.proxy(function(response) {
      if (response.success) {
        callback(response);
      }
    })).fail(this.proxy(function(jqXHR, errorText, errorThrown) {}));
	},
    destroy: function () {
        this._super();
    }
}, { usehtm: true, usei18n: false });


com.sms.detailmodule.flightInfo.widgetjs = ['../../../uui/widget/validation/jquery.validate.js','../../../uui/widget/jqurl/jqurl.js'];
com.sms.detailmodule.flightInfo.widgetcss = [];