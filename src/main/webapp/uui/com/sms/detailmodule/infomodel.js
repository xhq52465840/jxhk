//@ sourceURL=com.sms.detailmodule.infomodel
$.u.define('com.sms.detailmodule.infomodel', null, {
    init: function (options) {
    	this.flightNO="";
    	this.flightDate="";
    	this.deptAirportName="";
    	this.arrAirportName="";
        this._options = options || {}; 
        this.editable=this._options.editable;
        this._COMPLETE = "COMPLETE"; 
        this._SELECT2_PAGE_LENGTH = 10;
        this.unitTemplate = '<tr>'
								+'<td>#{name}</td>'
								+'<td class="operate-tool remove" data-id="#{id}" data-org-id="#{orgId}" data-type="organization"><span  class="glyphicon glyphicon glyphicon-trash " ></span></td>'
							+'</tr>';
        this.flightTemplate = '<tr>'
									+'<td><a href="#" class="flightinfoview" data-type="flightInfo" data-param=\'#{flightParam}\'>#{flightNumber}</a></td>'
									+'<td>#{flightDate}</td>'
									+'<td>#{flightPhase}</td>'
									+'<td><a href="#" class="flightinfoview" data-type="airport" data-param=\'#{deptAirportParam}\'>#{deptAirport}</a><i class="fa fa-arrow-right" style="margin:0 .5em;" /><a href="#" class="flightinfoview" data-type="airport" data-param=\'#{destAirportParam}\'>#{destAirport}</a></td>'
									+'<td><a href="#" class="flightinfoview" data-type="aircraftInfo" data-param=\'#{aircraftInfoParam}\'>#{tailNo}</a></td>'
									+'<td><a href="#" class="flightinfoview" data-type="flightCrew" data-param=\'#{flightCrewParam}\'>机组</a></td>'
									+'<td><a href="#" class="flightinfoview" data-type="carbinCrew" data-param=\'#{carbinCrewParam}\'>乘务组</a></td>'
									+'<td><a href="#" class="flightinfoview" data-type="control" data-param=\'#{controlParam}\'>运控</a></td>'
									/*+'<td><a target="_blank" href=\'' + this.getabsurl("../qar/qarQuery.html#flightInfoID=") + '#{flightInfoId}\'>QAR</a></td>'*/
									+'<td class="operate-tool remove" data-id="#{id}"  data-type="flight"><span class="glyphicon glyphicon glyphicon-trash " ></span></td>'
							  +'</tr>';
        this.positionTemplate = '<tr>'
									+'<td>#{position}</td>'
									+'<td>#{description}</td>'
									+'<td class="operate-tool remove" data-id="#{id}" data-type="position"><span  class="glyphicon glyphicon glyphicon-trash" ></span></td>'
								+'</tr>';
        this.carTemplate = '<tr>'
								+'<td>#{carno}</td>'
								+'<td>#{cartype}</td>'
								+'<td>#{description}</td>'
								+'<td class="operate-tool remove" data-id="#{id}" data-type="car"><span class="glyphicon glyphicon glyphicon-trash " ></span></td>'
							+'</tr>';
        this.toolTemplate = '<tr>'
								+'<td>#{maintainTool}</td>'
								+'<td>#{description}</td>'
								+'<td class="operate-tool remove" data-id="#{id}" data-type="tool"><span class="glyphicon glyphicon glyphicon-trash " ></span></td>'
							+'</tr>';
        this.groundStaffTemplate = '<tr>'
										+'<td>#{userName}</td>'
										+'<td>#{workType}</td>'
										+'<td>#{description}</td>'
										+'<td class="operate-tool remove" data-id="#{id}" data-type="groundStaff"><span  class="glyphicon glyphicon glyphicon-trash " ></span></td>'
									+'</tr>';
    },
    afterrender: function (bodystr) {
    	this.happenTimeDialog = null;								// 发生日期
    	this.unitDialog = null;										// 单位信息
    	this.flyDialog = null;										// 航班信息
    	this.positionDialog = null; 								// 地理位置
    	this.carDialog = null; 										// 车辆信息
    	this.toolDialog = null;										// 维护工具
    	this.groundStaffDialog = null;								// 地面人员
    	this.unitContainer = this.qid("unitcontainer");				// 单位容器
    	this.flyContainer = this.qid("flycontainer");				// 航班容器
    	this.positionContainer = this.qid("positioncontainer");		// 位置容器
    	this.carContainer = this.qid("carcontainer");				// 车辆容器
    	this.toolContainer = this.qid("toolcontainer");				// 工具容器
    	this.groundStaffContainer = this.qid("groundstaffcontainer"); // 地面人员容器
    	this.flightInfoView = this.qid("flightinfoview");			// 航班信息
    	this.dateTime = this.qid("datetime");						// 发生日期
    	       
    	if(this._options.statusCategory !== this._COMPLETE&&this.editable==true){
    		this.qid("btn-edithappentime").click(this.proxy(this.on_editHappenTime_click));
        	this.qid("btn-addunit").click(this.proxy(this.on_addunit_click));
        	this.qid("btn-addflight").click(this.proxy(this.on_addflight_click));
        	this.qid("btn-addlocation").click(this.proxy(this.on_addlocation_click));
        	this.qid("btn-addcar").click(this.proxy(this.on_addcar_click));
        	this.qid("btn-addtool").click(this.proxy(this.on_addtool_click));
        	this.qid("btn-addgroundstaff").click(this.proxy(this.on_addGroundStaff_click));
        	this.$.on("click", "td.remove", this.proxy(this.on_remove_click));
    	}else{
    		this.qid("btn-edithappentime").remove();
    		this.qid("btn-addunit")
    			.add(this.qid("btn-addflight"))
    			.add(this.qid("btn-addlocation"))
    			.add(this.qid("btn-addcar"))
    			.add(this.qid("btn-addtool"))
    			.add(this.qid("btn-addgroundstaff")).removeClass("operate-tool").empty();  		
    	}
    	this.flyContainer.on("click", ".flightinfoview", this.proxy(this.on_flightinfoview_click));
    	this.flightInfoView.on("click", ".flight-person", this.proxy(this.on_flightPerson_click));
        this.qid('btn-togglemore').click(this.proxy(this.on_toggleMore_click));

    	this._draw();
    },
    /**
     * @title 显示或隐藏“其他”
     */
    on_toggleMore_click: function(e){
        var $moreInfo = this.qid('more-info').toggle('fade', this.proxy(function(){
            this.qid('btn-togglemore').text($moreInfo.is(':visible') ? '隐藏其它信息' : '显示其它信息');
        }));
    },
    /**
     * @title edit happen time
     * @param e {object} mouse object
     * @return void
     */
    on_editHappenTime_click:function(e){
    	if(this.happenTimeDialog == null){
    		var cls = $.u.load("com.sms.common.stdComponentOperate");
    		this.happenTimeDialog = new cls($("div[umid=happentime]",this.$),{
    			"title":"设置发生时间",
        		"dataobject":"accessInformation",
        		"fields":[
        		  {name:"activity",type:"hidden",dataType:"int","value":this._options.activity},
                  {name:"occurredDate",label:"发生时间",type:"datetime",rule:{required:true},message:"发生时间不能为空"}
    	        ],
    	        "afterAdd":this.proxy(function(comp,formdata,response){
    	        	comp.formDialog.dialog("close");
    	        	this._options.occurredDate = {id:response.data,occurredDate:formdata.occurredDate};
    	        	this.dateTime.text(formdata.occurredDate);
    	        })
    		});
    	}

    	if(this._options.occurredDate){
    		var tempdata = this._options.occurredDate;
        	this.happenTimeDialog.open({"data":{id:tempdata.id,occurredDate:tempdata.occurredDate},"title":"设置发生日期","afterEdit":this.proxy(function(comp,formdata){
        		comp.formDialog.dialog("close");
        		this._options.occurredDate.occurredDate = formdata.occurredDate;
    	        this.dateTime.text(formdata.occurredDate);
        	})});
    	}else{
    		this.happenTimeDialog.open();
    	}
    	
    },
    /**
     * @title 飞机
     * @param {event object} e - 鼠标对象
     * @return void
     */
    on_flightinfoview_click:function(e){
    	e.preventDefault();
    	var $this = $(e.currentTarget);
    	var flightInfo=$this.attr("data-type");
    	if(flightInfo=="flightInfo"){
    		this.flightNO=$this.html();
        	this.flightDate=$this.parent().next().html();
        	this.deptAirportName=$this.parent().next().next().next().children().eq(0).attr("data-param");
        	this.arrAirportName=$this.parent().next().next().next().children().eq(2).attr("data-param");
    		option = {
    			type: $this.attr("data-type"),
    			param: JSON.parse($this.attr("data-param")),
    			flightNO:this.flightNO,
    			flightDate:this.flightDate,
    			deptAirportName:JSON.parse(this.deptAirportName),
    			arrAirportName:JSON.parse(this.arrAirportName),
	    	}
	    	}else{
	    		option = {
	        			type: $this.attr("data-type"),
	        			param: JSON.parse($this.attr("data-param")),
	    	    	}
	    	}
	    	position=$this.position();
    	this.flightInfoView.removeClass("hidden").animate({top:position.top + $this.height() + 6, left:position.left - 30});
    	
    	if(!this.flightInfo){
    		$.u.load("com.sms.detailmodule.flightInfo");
    	}else{
    		this.flightInfo.destroy();
    		this.flightInfo = null;
    	}
		this.flightInfo = new com.sms.detailmodule.flightInfo( $("div[umid=flightinfomodule]",this.$), option );
		$("body").unbind("mousedown").bind("mousedown",this.proxy(function(e){
			var $this = $(e.target);
			if($this.hasClass("flightinfoview")){
				$("body").unbind("mousedown");
			}else if($this.closest("div.flightinfo").length < 1){
				this.flightInfoView.addClass("hidden");
				$("body").unbind("mousedown");
			}
		}));
    },
    /**
     * @title 机组
     * @param {event object} e - 鼠标对象
     */
    on_flightPerson_click: function(e){
    	e.preventDefault();
    	var $this = $(e.currentTarget),
    		option = {
	    		"type": $this.attr("data-type"),
	    		"param": JSON.parse($this.attr("data-param"))
	    	};
    	if(!this.flightPersonInfo){
    		$.u.load("com.sms.detailmodule.flightInfo");
    	}else{
    		this.flightPersonInfo && this.flightPersonInfo.destroy();
			this.flightPersonInfo = null;
    	}
		this.flightPersonInfo = new com.sms.detailmodule.flightInfo( $("div[umid=flightperson]"), option );
    	if(!this.flightPersonDialog){
	    	this.flightPersonDialog = this.qid("flightpersondialog").removeClass("hidden").dialog({
	    		title: "查看",
	    		width: 500,
	    		modal:true,
	    		resizable: false,
	    		draggable: false,
	    		buttons: [
	    		   {
	    			   text: "关闭",
	    			   click: this.proxy(function(){
	    				   this.flightPersonDialog.dialog("close");
	    			   })
	    		   }
	    		]
	    	});
    	}
    	this.flightPersonDialog.dialog("open");
    },
    /**
     * @title remove
     * @param e {object} 鼠标对象
     * @return void 
     */
    on_remove_click:function(e){
    	var $this = $(e.currentTarget),$tr = $this.closest("tr"),id = parseInt($this.attr("data-id")),type = $this.attr("data-type"),
    		param = {
	            "tokenid": $.cookie("tokenid"),
	            "method":"stdcomponent.delete",
	    		"dataobjectids":JSON.stringify([id]),
	    		"dataobject":this._getDataobjectByType(type)
	        };
        $tr.addClass('selected');
    	this.removeDialog = $("<div>确认删除操作？</div>").dialog({
			title:"操作提示",
			width:540,
			modal:true,
			resizable:false,
			draggable: false,
			buttons:[
	         {
	        	 text:"删除",
	        	 click:this.proxy(function(e){
	        		 $(e.currentTarget).add($(e.currentTarget).next()).button("disable");
	        		 $.u.ajax({
	        			 url: $.u.config.constant.smsmodifyserver,
	                     dataType: "json",
	                     cache: false,
	                     data: param
	        		 },this.removeDialog.parent(),{ size: 1,backgroundColor:'transparent', selector:$(e.currentTarget).parent(), orient: "west" }).done(this.proxy(function(response){
	        			 if(response.success){
	        				 if(type == "organization"){
	        					 var orgId = parseInt($this.attr("data-org-id"));
	        					 var orgIds = $.extend(true, [], this.qid("btn-addunit").data("orgIds"));
	        					 orgIds.splice($.inArray(orgId, orgIds), 1);
	        					 this.qid("btn-addunit").data("orgIds", orgIds);
	        				 }
	        				 $.u.alert.success("删除成功。");
	        				 $tr.remove();
	        				 this.removeDialog.dialog("close");
	        			 }
	        		 })).fail(this.proxy(function(jqXHR,errorText,errorThrown){
	        		 }));
	        	 })
	         },
	         {
	        	 text:"取消",
	        	 "class":"aui-button-link",
	        	 click:this.proxy(function(){
	        		 this.removeDialog.dialog("close");
	        	 })
	         }
			],
			close:this.proxy(function(){
                $tr.removeClass('selected');
				this.removeDialog.dialog("destroy").remove();
			})
		});
    },
    /**
     * @title add organization
     * @return void
     */
    on_addunit_click:function(e){
    	var $this = $(e.currentTarget); 
    	if(this.unitDialog == null){
    		$.u.load("com.sms.detailmodule.unitDialog");
    		this.unitDialog = new com.sms.detailmodule.unitDialog($("div[umid=unit]",this.$),{
    			"activity": this._options.activity
    		});
    	}
    	this.unitDialog.open({
    		"orgIds": $this.data("orgIds"),
    		"funCall": this.proxy(function(data){
	    		$.u.ajax({
	                url: $.u.config.constant.smsmodifyserver,
	                type: "post",
	                dataType: "json",
	                data: {
	                	"tokenid": $.cookie("tokenid"),
	            		"method":"stdcomponent.add",
	            		"dataobject":"organizationEntity",
	            		"obj":JSON.stringify({
	            			"activity":this._options.activity,
	            			"organization":data.id
	            		})
	                }
	            }, this.unitContainer,{size:2, backgroundColor:"#fff"}).done(this.proxy(function (response) {
	                if (response.success) {
	                	this._reloadDataByType("organization",this.unitContainer,this.proxy(function(data){ 
	                		var orgIds = [];
	    	        		this.unitContainer.empty();
	    	        		$.each(data,this.proxy(function(idx,item){
	    	        			this._drawUnit(item);
	    	        			orgIds.push(item.organization.id);
	    	        		}));
	    	        		this.qid("btn-addunit").data("orgIds", orgIds);
	    	        	}));
	                }
	            })).fail(this.proxy(function (jqXHR, errorText, errorThrown) {
	            	
	            }));
			}
    	)});
    },
    /**
     * @title add flight
     * return void
     */
    on_addflight_click:function(){
    	if(this.flyDialog == null){
    		$.u.load("com.sms.detailmodule.flyDialog");
    		this.flyDialog = new com.sms.detailmodule.flyDialog($("div[umid=fly]",this.$),{"activity":this._options.activity});
    		this.flyDialog.override({
    			"refreshList":this.proxy(function(){
    				this._reloadDataByType("flight",this.flyContainer, this.proxy(function(data){
    	        		this.flyContainer.empty();
    	        		$.each(data, this.proxy(function(idx,item){
    	        			this._drawFly(item);
    	        		}));
    	        	}));
    			})
    		});    		
    	}
    	var datetime = (new Date()).format("yyyy-MM-dd");
    	if (this._options.occurredDate && this._options.occurredDate.occurredDate){
    		this._options.occurredDate.occurredDate = this._options.occurredDate.occurredDate.replace(/-/g,"/");
    		datetime = (new Date(this._options.occurredDate.occurredDate)).format("yyyy-MM-dd");
    	}
    	this.flyDialog.open(datetime);
    },
    /**
     * @title add ground position
     * return void
     */
    
    on_addlocation_click:function(){
    	if(this.positionDialog == null){
    		$.u.load("com.sms.common.stdComponentOperate");
        	this.positionDialog = new com.sms.common.stdComponentOperate($("div[umid='position']",this.$),{
        		"title":"地面位置",
        		"dataobject":"groundPositionEntity",
        		"fields":[
                  {name:"activity",type:"hidden",dataType:"int",value:this._options.activity},
    	          {name:"groundPosition",label:"位置",type:"select", dataType:"int", rule:{required:true},message:"位置不能为空",dataType:"int",
    	        	  option:{
			        	  "params": {"dataobject":"dictionary"},
		        		  "ajax":{
		        			  data: this.proxy(function(term, page){
		        				 return {
		        					 method: "stdcomponent.getbysearch",
		        					 dataobject: "dictionary",
		        					 tokenid: $.cookie("tokenid"),
		        					 rule: JSON.stringify([[{"key":"name","op":"like","value":term}], [{"key":"type", "value":"地面位置"}]]),
		        					 start: (page - 1) * this._SELECT2_PAGE_LENGTH,
		        					 length: this._SELECT2_PAGE_LENGTH
		        				 };
		        			 })
		        		  }
    	        	  }
        		  },
    	          {name:"description",label:"说明",type:"textarea",maxlength:2000}
    	        ],
    	        "afterAdd":this.proxy(function(comp,formdata,response){
    	        	comp.formDialog.dialog("close");
    	        	this._reloadDataByType("position",this.positionContainer,this.proxy(function(data){
    	        		this.positionContainer.empty();
    	        		$.each(data,this.proxy(function(idx,item){
    	        			this._drawPosition(item);
    	        		}));
    	        	}));
    	        })
        	});
    	}
    	this.positionDialog.open();
    },
    /**
     * @title add vehicle
     * @return void
     */
    on_addcar_click:function(){
    	if(this.carDialog == null){
    		$.u.load("com.sms.common.stdComponentOperate");
        	this.carDialog = new com.sms.common.stdComponentOperate($("div[umid='car']",this.$),{
        		"title":"车辆信息",
        		"dataobject":"vehicleInfoEntity",
        		"fields":[
        		  {name:"activity",type:"hidden",dataType:"int",value:this._options.activity},
    	          {name:"vehicleInfo",label:"车型",type:"select", dataType:"int", rule:{required:true},message:"车型不能为空",dataType:"int",
    	        	  option:{
			        	  "params": {"dataobject":"dictionary"},
		        		  "ajax":{
		        			  data: this.proxy(function(term, page){
		        				 return {
		        					 method: "stdcomponent.getbysearch",
		        					 dataobject: "dictionary",
		        					 tokenid: $.cookie("tokenid"),
		        					 rule: JSON.stringify([[{"key":"name","op":"like","value":term}], [{"key":"type", "value":"车辆类型"}]]),
		        					 start: (page - 1) * this._SELECT2_PAGE_LENGTH,
		        					 length: this._SELECT2_PAGE_LENGTH
		        				 };
		        			 })
		        		  }
    	        	  }
        		  },
    	          {name:"num",label:"车号",type:"text",maxlength:20},
    	          {name:"description",label:"说明",type:"textarea",maxlength:2000}
    	        ],
    	        "afterAdd":this.proxy(function(comp,formdata,response){
    	        	comp.formDialog.dialog("close");
    	        	this._reloadDataByType("car",this.carContainer,this.proxy(function(data){
    	        		this.carContainer.empty();
    	        		$.each(data,this.proxy(function(idx,item){
    	        			this._drawCar(item);
    	        		}));
    	        	}));
    	        })
        	});
    	}
        this.carDialog.open();
    },
    /**
     * @title add maintaintool
     * @return void
     */
    on_addtool_click:function(){
    	if(this.toolDialog == null){
    		$.u.load("com.sms.common.stdComponentOperate");
        	this.toolDialog = new com.sms.common.stdComponentOperate($("div[umid='tool']",this.$),{
        		"title":"维护工具",
        		"dataobject":"maintainToolEntity",
        		"fields":[
        		  {name:"activity",type:"hidden",dataType:"int",value:this._options.activity},
    	          {name:"maintainTool",label:"名称",type:"select", dataType:"int", rule:{required:true},message:"名称不能为空",dataType:"int",
    	        	  option:{
			        	  "params": {"dataobject":"dictionary"},
		        		  "ajax":{
		        			  data: this.proxy(function(term, page){
		        				 return {
		        					 method: "stdcomponent.getbysearch",
		        					 dataobject: "dictionary",
		        					 tokenid: $.cookie("tokenid"),
		        					 rule: JSON.stringify([[{"key":"name","op":"like","value":term}], [{"key":"type", "value":"维护工具"}]]),
		        					 start: (page - 1) * this._SELECT2_PAGE_LENGTH,
		        					 length: this._SELECT2_PAGE_LENGTH
		        				 };
		        			 })
		        		  }
    	        	  }
        		  },
    	          {name:"description",label:"说明",type:"textarea", maxlength:2000}
    	        ],
    	        "afterAdd":this.proxy(function(comp,formdata,response){
    	        	comp.formDialog.dialog("close");
    	        	this._reloadDataByType("tool",this.toolContainer,this.proxy(function(data){
    	        		this.toolContainer.empty();
    	        		$.each(data,this.proxy(function(idx,item){
    	        			this._drawTool(item);
    	        		}));
    	        	}));
    	        })
        	});
    	}
    	this.toolDialog.open();
    },
    on_addGroundStaff_click: function(e){
    	if(this.groundStaffDialog == null){
    		$.u.load("com.sms.common.stdComponentOperate");
        	this.groundStaffDialog = new com.sms.common.stdComponentOperate($("div[umid='staff']",this.$),{
        		"title":"地面人员",
        		"dataobject":"groundStaffEntity",
        		"fields":[
        		  {name:"activity",type:"hidden",dataType:"int",value:this._options.activity},
    	          {name:"userName", label:"姓名", type:"text", rule:{required:true}, message:"姓名不能为空",maxlength:100},
        		  {name:"workType",label:"工种",type:"select", dataType:"int", rule:{required:true},message:"工种不能为空",dataType:"int",
    	        	  option:{
			        	  "params": {"dataobject":"dictionary"},
		        		  "ajax":{
		        			  data: this.proxy(function(term, page){
		        				 return {
		        					 method: "stdcomponent.getbysearch",
		        					 dataobject: "dictionary",
		        					 tokenid: $.cookie("tokenid"),
		        					 rule: JSON.stringify([[{"key":"name","op":"like","value":term}], [{"key":"type", "value":"工种"}]]),
		        					 start: (page - 1) * this._SELECT2_PAGE_LENGTH,
		        					 length: this._SELECT2_PAGE_LENGTH
		        				 };
		        			 })
		        		  }
    	        	  }
        		  },
    	          {name:"description",label:"说明",type:"textarea",maxlength:2000}
    	        ],
    	        "afterAdd":this.proxy(function(comp,formdata,response){
    	        	comp.formDialog.dialog("close");
    	        	this._reloadDataByType("groundStaff",this.toolContainer,this.proxy(function(data){
    	        		this.groundStaffContainer.empty();
    	        		$.each(data, this.proxy(function(idx,item){
    	        			this._drawGroundStaff(item);
    	        		}));
    	        	}));
    	        })
        	});
    	}
    	this.groundStaffDialog.open();
    },
    /**
     * @title draw data
     * @param data {object} data contains unit、fly、position、tool
     * @return void
     */
    _draw:function(){
    	var orgIds = [];
    	this._options.occurredDate && this.dateTime.text(this._options.occurredDate.occurredDate);
    	this._options.organizations && this._options.organizations.length > 0 && $.each(this._options.organizations,this.proxy(function(idx,item){ this._drawUnit(item); orgIds.push(item.organization.id); }));
    	this._options.flightInfos && this._options.flightInfos.length > 0 && $.each(this._options.flightInfos,this.proxy(function(idx,item){ this._drawFly(item); }));
    	this._options.groundPositions && this._options.groundPositions.length > 0 && $.each(this._options.groundPositions,this.proxy(function(idx,item){ this._drawPosition(item); }));
    	this._options.vehicleInfos && this._options.vehicleInfos.length > 0 && $.each(this._options.vehicleInfos,this.proxy(function(idx,item){ this._drawCar(item); }));
    	this._options.maintainTools && this._options.maintainTools.length > 0 && $.each(this._options.maintainTools,this.proxy(function(idx,item){ this._drawTool(item); }));
    	this._options.groundStaffs && this._options.groundStaffs.length > 0 && $.each(this._options.groundStaffs,this.proxy(function(idx,item){ this._drawGroundStaff(item); }));
    	
    	this.qid("btn-addunit").data("orgIds", orgIds);
    },
    /**
     * @title create unit tr
     * @param unit {object} json data
     * @return void
     */
    _drawUnit:function(unit){
    	var htmls = "", $obj = null, org = unit ? (unit.organization || {}) : {};
    	htmls = this.unitTemplate.replace(/#\{name}/g, org.path+"/"+org.name)
    							 .replace(/#\{id}/g, unit.id)
    							 .replace(/#\{orgId}/g, org.id);
    	$obj = $(htmls).appendTo(this.unitContainer);
    	if(this._options.statusCategory == this._COMPLETE || this.editable==false){
    		$obj.find("span.remove").parent().removeClass("operate-tool").empty();
    	}
    },
    /**
     * @title create fly tr
     * @param fly {object} json data
     * @return void
     */
    _drawFly:function(fly){
        var htmls = "",
            $obj = null;
        htmls = this.flightTemplate.replace(/#\{flightNumber}/g, fly.flightInfo.flightNO || "")
            .replace(/#\{flightParam}/g, JSON.stringify({
                "flightInfoID": fly.flightInfo.flightInfoID
            }))
            .replace(/#\{id}/g, fly.id)
            .replace(/#\{flightDate}/g, fly.flightInfo.flightBJDate || "")
            .replace(/#\{flightPhase}/g, fly.flightPhase || "")
            .replace(/#\{tailNo}/g, fly.flightInfo.tailNO || "")
            .replace(/#\{flightInfoId}/g, fly.flightInfo.flightInfoID || "")
            .replace(/#\{deptAirport}/g, fly.flightInfo.deptAirport ? (fly.flightInfo.deptAirport.cityName || "") : "")
            .replace(/#\{deptAirportParam}/g, JSON.stringify({
                "iATACode": fly.flightInfo.deptAirport ? fly.flightInfo.deptAirport.iATACode : "",
                "iCaoCode": fly.flightInfo.deptAirport ? fly.flightInfo.deptAirport.iCaoCode : "",
                "atd": fly.flightInfo.atd || fly.flightInfo.etd,
                "ata": fly.flightInfo.ata || fly.flightInfo.eta,
                "status": "S"
            }))
            .replace(/#\{destAirport}/g, fly.flightInfo.arrAirport ? (fly.flightInfo.arrAirport.cityName || "") : "")
            .replace(/#\{destAirportParam}/g, JSON.stringify({
                "iATACode": fly.flightInfo.arrAirport ? fly.flightInfo.arrAirport.iATACode : "",
                "iCaoCode": fly.flightInfo.arrAirport ? fly.flightInfo.arrAirport.iCaoCode : "",
                "atd": fly.flightInfo.atd || fly.flightInfo.etd,
                "ata": fly.flightInfo.ata || fly.flightInfo.eta,
                "status": "E"
            }))
            .replace(/#\{aircraftInfoParam}/g, JSON.stringify({
                "tailNo": fly.flightInfo.tailNO
            }))
            .replace(/#\{flightCrewParam}/g, JSON.stringify({
                flightNo: fly.flightInfo.flightNO,
                flightDate: fly.flightInfo.flightBJDate,
                depAirport: fly.flightInfo.deptAirport && fly.flightInfo.deptAirport.iCaoCode,
                arrAirport: fly.flightInfo.arrAirport  &&  fly.flightInfo.arrAirport.iCaoCode
            }))
            .replace(/#\{carbinCrewParam}/g, JSON.stringify({
                flightNo: fly.flightInfo.flightNO,
                flightDate: fly.flightInfo.flightBJDate,
                depAirport: fly.flightInfo.deptAirport && fly.flightInfo.deptAirport.iCaoCode,
                arrAirport: fly.flightInfo.arrAirport  &&  fly.flightInfo.arrAirport.iCaoCode
            }))
            .replace(/#\{controlParam}/g, JSON.stringify({
                flightNo: fly.flightInfo.flightNO,
                flightDate: fly.flightInfo.flightBJDate,
                depAirport: fly.flightInfo.deptAirport && fly.flightInfo.deptAirport.iCaoCode,
                arrAirport: fly.flightInfo.arrAirport  &&  fly.flightInfo.arrAirport.iCaoCode
            }));
        $obj = $(htmls).appendTo(this.flyContainer);
        if (this._options.statusCategory == this._COMPLETE || this.editable==false) {
            $obj.find(".remove").empty();
        }
    },
    /**
     * @title create position tr
     * @param position {object} json data
     * @return void
     */
    _drawPosition:function(position){
    	var htmls = "", $obj = null;
    	htmls = this.positionTemplate.replace(/#\{position}/g,position.groundPosition || '')
				    				 .replace(/#\{description}/g,position.description || '')
				    				 .replace(/#\{id}/g,position.id);
    	$obj = $(htmls).appendTo(this.positionContainer);
    	if(this._options.statusCategory == this._COMPLETE || this.editable==false){
    		$obj.find("span.remove").parent().removeClass("operate-tool").empty();
    	}
    },
    /**
     * @title create car tr
     * @param car {object} json data
     * @return void
     */
    _drawCar:function(car){
    	var htmls = "", $obj = null;
    	htmls = this.carTemplate.replace(/#\{carno}/g,car.num || '')
			    				.replace(/#\{cartype}/g,car.vehicleInfo || '')
			    				.replace(/#\{description}/g,car.description || '')
			    				.replace(/#\{id}/g,car.id);
    	$obj = $(htmls).appendTo(this.carContainer);
    	if(this._options.statusCategory == this._COMPLETE || this.editable==false){
    		$obj.find("span.remove").parent().removeClass("operate-tool").empty();
    	}
    },
    /**
     * @title create tool tr
     * @param tool {object} json data
     * @return void
     */
    _drawTool: function(tool){
    	var htmls = "", $obj = null;
    	htmls = this.toolTemplate.replace(/#\{maintainTool}/g,tool.maintainTool || '')
    							 .replace(/#\{description}/g,tool.description || '')
    							 .replace(/#\{id}/g,tool.id);
    	$obj = $(htmls).appendTo(this.toolContainer);
    	if(this._options.statusCategory == this._COMPLETE || this.editable==false){
    		$obj.find("span.remove").parent().removeClass("operate-tool").empty();
    	}
    },
    /**
     * @title create groundStaff tr
     * @param tool {object} json data
     * @return void
     */
    _drawGroundStaff: function(groundStaff){
    	var htmls = "", $obj = null;
    	htmls = this.groundStaffTemplate.replace(/#\{userName}/g, groundStaff.userName || '')
    							 .replace(/#\{workType}/g, groundStaff.workType || '')
    							 .replace(/#\{description}/g, groundStaff.description || '')
    							 .replace(/#\{id}/g, groundStaff.id);
    	$obj = $(htmls).appendTo(this.groundStaffContainer);
    	if(this._options.statusCategory == this._COMPLETE || this.editable==false){
    		$obj.find("span.remove").parent().removeClass("operate-tool").empty();
    	}
    },
    /**
     * @title reload data by type
     * @param type {string} type
     * @param $container {jquery object} data container
     * @param callback {function} function that execute after get data 
     * @return void
     */
    _reloadDataByType:function(type,$container,callback){
    	$.u.ajax({
            url: $.u.config.constant.smsqueryserver,
            type: "post",
            dataType: "json",
            cache: false,
            data: {
                "tokenid": $.cookie("tokenid"),
                "method":"stdcomponent.getbysearch",
        		"dataobject":this._getDataobjectByType(type),
        		"rule":JSON.stringify([[{"key":"activity","value":this._options.activity}]])
            }
        }, $container,{size:2,backgroundColor:"#fff"}).done(this.proxy(function (response) {
            if (response.success) {
               callback(response.data.aaData);
            }
        })).fail(this.proxy(function (jqXHR, errorText, errorThrown) {
        }));
    },
    /**
     * @title get dataobject by type
     * @param type {string} type
     * @return {string} type
     */
    _getDataobjectByType:function(type){
    	var result = "";
    	switch(type){
			case "position": result = "groundPositionEntity"; break;
			case "car": result = "vehicleInfoEntity"; break;
			case "tool": result = "maintainToolEntity"; break;
			case "flight": result = "flightInfoEntity"; break; 
			case "organization": result = "organizationEntity"; break;
			case "groundStaff": result = "groundStaffEntity"; break;
			// no default
		};
		return result;
    },
    destroy: function () {
        this._super();
    }
}, { usehtm: true, usei18n: false });


com.sms.detailmodule.infomodel.widgetjs = ['../../../uui/widget/jqurl/jqurl.js',
                                           '../../../uui/widget/jqtimepicker/jquery-ui-timepicker-addon.js',
                                           '../../../uui/widget/jqtimepicker/jquery-ui-sliderAccess.js'];
com.sms.detailmodule.infomodel.widgetcss = [{id:"",path:"../../../uui/widget/jqtimepicker/jquery-ui-timepicker-addon.css"}];