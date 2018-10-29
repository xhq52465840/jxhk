 
$.u.define('com.eiosa.audit.isarpsList', null, {
   init : function(options){
	    this._options = options || null;
		this.reportId = this._options.reportId;
		this.sectionId=this._options.sectionId;
		this.check=this._options.check;
		this.assessmentType=this._options.assessmentType;
	},
	
	afterrender:function(){	
		debugger
		this.isarpChaptervue = new Vue({
			el : '#isarps',
			data : {				
				isarpList : '',
				isarpSectionNames : '',
				conformity:'',
				isarpsQueryForm : {
					sectionId :this.sectionId ,isarpNo : '',status : '',
					conformity : '',showMine :'',assessmentType :this.assessmentType,
				},
				eiosaUserRole:$.cookie('eiosaUserRole'),
				pagebarsVue:{
					all : 0, // 总条数
					cur : 1,// 当前页码
					start : 0,//当前条数
					length : 10,// 单页条数
				},
			    options: [
		      		      { id: 0, text: '' },
		      		    ],
      		    orders:{
					sortby : '', // 排序字段
					sortorders : 'asc',// 排序方式
				}, 

			},
			

		   methods :{
			   isarpInfo: this.proxy(this._isarpInfo),
			   isarpsSearch: this.proxy(this._isarpsSearch),
			   iarpsSearchClick: this.proxy(this._iarpsSearchClick),
			   changeManger:this.proxy(this._changeManger),
			   page : this.proxy(this._isarpsSearch),
			   noClick: this.proxy(this._queryIsarpNo),
		   },
		});		
	

		this._queryIsarpNo();
		this._showMine();
        this._isarpsSearch();
        this._initSectionNames();  
        this._initConformity();
        this.sectionStatus=this.qid("sectionStatus");     
        this.iosaSection=this.qid("iosaSection");
	},	
	
	_queryIsarpNo:function(){
		this.isarpChaptervue.$set("isarpsQueryForm.isarpNo","");
		var data = {
				tokenid: $.cookie("tokenid"),
                method: "queryIsarpNo",
                "sectionId":$("#isarpSection").val()
		};
		myAjaxQuery(data, null, this.proxy(function(param, response) {
			if (param.success) {
				var array = new Array();
				$.each(param.data,function(index,value){
					var obj = new Object();
					obj.id = value.noSort;
					obj.text = value.no;
					array.push(obj);
				})
				this.isarpChaptervue.$set("options", array);
				}
		})); 		
	},
	_showMine:function(){
		var checktype=this.check;
		if(checktype!=null){
			document.getElementById("showMine").checked=false
			this.isarpChaptervue.isarpsQueryForm.showMine="off";
		}else{
			if(document.getElementById("showMine").checked){
				this.isarpChaptervue.isarpsQueryForm.showMine="true"
	           }else{
	        	this.isarpChaptervue.isarpsQueryForm.showMine="off"
	           }
		}
	},
	_initConformity:function(){
		var data = {
				"method":"stdcomponent.getbysearch",
	       		   "dataobject":"assessments",
	       		   "columns":JSON.stringify([{"data":"id"}]),
	    		   "order":JSON.stringify([{"column":0,"dir":"asc"}])
				
			};
		myAjaxQuery(data, $("#isarp"), this.proxy(function(response) {
				if (response.success) {
					this.isarpChaptervue.$set("conformity",response.data.aaData);
				}
		})); 
	},
	_initSectionNames : function(e) {	
		var data = {
			"method" : "getSectionName",
			"reportId" : this.reportId
		};
		myAjaxQuery(data, null, this.proxy(function(response) {
			if (response.success) {
				this.isarpChaptervue.$set('isarpSectionNames', response.data)
			}
		}));
	},
	
	_iarpsSearchClick : function() {
		this.isarpChaptervue.$set("pagebarsVue.cur",1);
		this.isarpChaptervue.$set("pagebarsVue.start",0);
		this._isarpsSearch();

},

   _isarpsSearch : function() {
	   
			var data = {
				"method" : "queryIsarps",
				"reportId" : this.reportId,
				"isarpsQueryForm": JSON.stringify(this.isarpChaptervue.isarpsQueryForm),
				"start" :  this.isarpChaptervue.pagebarsVue.start,
				"length" : this.isarpChaptervue.pagebarsVue.length,
				"sortby" : this.isarpChaptervue.orders.sortby,
				"sortorders" : this.isarpChaptervue.orders.sortorders,
			};
			debugger
			myAjaxQuery(data, $("#isarps"),this.proxy(function(response) {
				if (response.success) {
					this.isarpChaptervue.$set("isarpList", response.SectionList.aaData);
				    this.isarpChaptervue.$set("pagebarsVue.all",response.SectionList.iTotalRecords);
				    Vue.nextTick( this.proxy(function() {
				    	 $(".isarpText").tooltip({
                        	 html:true,
                        	 track: true,
                     		showURL: false,
                     		delay: 1000,
                     		top: 5,
                     		left: 5});
					}) );
				   
				}
			}));
		
			
	},
	
	_changeManger:function(e){
   	       var id=$(e.currentTarget).attr("isarpId");
			var sectionId=$(e.currentTarget).attr("data");
			var dealerId=$("#section"+id).val();
			var isarpNo=$(e.currentTarget).attr("no");
			var operateFlag=$(e.currentTarget).attr("taskId");
            
           if(isarpNo.length>4){
           	$("#changeContent").html("您确认将本项协调人变为新的协调人吗？")
           }else{
           	$("#changeContent").html("您确认将本项和其下级协调人同时变为新的协调人吗？")
           }
			this.changeAuditor= $('#changeAuditor').dialog({
	   			width:400,
	   			height:200,
	   			title:"更改协调人",
	   	        position:[500,100],
	   		});
	   	 var dialogOptions = {
	   			
	   				buttons: [{
	   	            text: "确定",
	   				"class": "aui-button-link",
	   				click: this.proxy(function () {
	   					$.u.ajax({
							url:$.u.config.constant.smsmodifyserver,
							type: "post",
			                dataType: "json",
							data:{
								"tokenid":$.cookie("tokenid"),
								"method":"addDealer",
								"sectionId":sectionId,
								"dealerId":dealerId,
								"operateFlag":operateFlag,
								"isarpId":id,
								"isarpNo":isarpNo								
							}
	   					
						},$("#iosaSection")).done(this.proxy(function(response){
							if(response.code=="success"){
							$.u.alert.success("保存成功");
							$('#changeAuditor').dialog("close");
							this._isarpsSearch();
						}else{
							$.u.alert.error("保存失败");
						}
						}));
	   	            })},{
	   	            text: "取消",
	   	  			"class": "aui-button-link",
	   	  			click: function () {
	   	  		
	   	  		     $('#changeAuditor').dialog("close");
	   				}
	   	            }
	   		]
	   		};
	   	  this.changeAuditor.dialog("option",dialogOptions).dialog("open");	   
   },

	_isarpInfo:function(e){
		var isarpId=$(e.currentTarget).attr("data");
		var sectionId=$(e.currentTarget).attr("sectionId");
		debugger
		layer.open({
	        type: 2,
	        title: 'ISARPs编辑',
	        maxmin: false,
	        fix:false,
	        shadeClose: false, //点击遮罩关闭层
	        area : ['1000px' , '600px'],
	        content:encodeURI(encodeURI( "/sms/uui/com/eiosa/audit/auditEdit.html?id="+ isarpId+"&sectionId="+sectionId+"&reportId="+$.cookie("workReportId"))),
	        end:  this.proxy(function() {
	        }),
	    });
	},



},{ 
	usehtm: true,
	usei18n: false
	});
