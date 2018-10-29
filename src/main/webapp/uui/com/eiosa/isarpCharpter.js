//$.u.load("com.eiosa.audit.auditEdit");
$.u.define('com.eiosa.isarpCharpter', null, {
	
   init:function(options){
	    this._options = options || null;
		this.reportId = this._options.reportId;
	},
	
	afterrender:function(){	

		this.isarpChaptervue = new Vue({
			el : '#isarpChapter',
			data : {				
				isarpList : '',
				isarpSectionNames : '',
				isarpQueryForm : {
					sectionId : '',
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
			   iarpCharpterSearch: this.proxy(this._iarpCharpterSearch),
			   iarpCharpterSearchClick: this.proxy(this._iarpCharpterSearchClick),
			   resetIsarpCharpter: this.proxy(this._resetIsarpCharpter),
			   exportEXcelOrPdf: this.proxy(this._exportEXcelOrPdf),
			   exportComformity: this.proxy(this._exportComformity),
			   page : this.proxy(this._iarpCharpterSearch),
			   noClick: this.proxy(this._isarpAcronym),
		   },
		});		
	

//	    $("#isarpAcronyms").select2({
//	    	ajax: {
//                url: $.u.config.constant.smsqueryserver,
//                dataType: "json",
//                type: "post",
//                data: this.proxy(function(term, page){
//                    return {
//                    	tokenid: $.cookie("tokenid"),
//                        method: "queryAcronyms",
//                        sectionId:$("#isarpCharpterSection").val(),
//                        reportId: $.cookie("workReportId"),
//                        acronyms:term
//                    };
//                }),
//                results: this.proxy(function(response){
//                	
//                    if(response.success){
//                        return {
//                        	 "results": response.data
//                        }
//                    }
//                })
//                
//            },
//           
//            id: function(item){
//                return item.acronyms;
//            },
//
//            formatResult:function(item){
//            	 return item.acronyms
//            },
//            formatSelection:function(item){
//            	 return item.acronyms
//            },
//            placeholder: "请输入",
//			allowClear : true,
//	    });
	    $("#isarpCharpter").select2({
	    	tags: true,
	    	
	    });
        $("#export").click(this.proxy(function(){
	    	this._export();
		}));
        
        this._iarpCharpterSearch();
        this._initSectionNames(); 
        this._isarpAcronym();
	},	
	
	_isarpAcronym:function(){
		$("#isarpAcronyms").select2('data','');
		var data = {
			  tokenid: $.cookie("tokenid"),
              method: "queryAcronyms",
              sectionId:$("#isarpCharpterSection").val(),
              reportId: $.cookie("workReportId"),
		};
		debugger
		myAjaxQuery(data, null, this.proxy(function(param, response) {
			if (param.success) {
				var array = new Array();
				$.each(param.data,function(index,value){
					var obj = new Object();
					obj.id = value.acronyms;
					obj.text = value.acronyms;
					array.push(obj);
				})
				this.isarpChaptervue.$set("options", array);
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
	
	_resetIsarpCharpter : function() {
		$("#isarpCharpterSection").val("");
    	$("#isarpAcronyms").select2('data','');
    	$("#isarpCharpter").select2('data','');
	},
	
	_iarpCharpterSearchClick : function() {
		this.isarpChaptervue.$set("pagebarsVue.cur",1);
		this.isarpChaptervue.$set("pagebarsVue.start",0);
		this._iarpCharpterSearch();
},

	_iarpCharpterSearch : function(page) {		
			var data = {
				"method" : "queryIsarpCharpter",
				"reportId" : this.reportId,
				"sectionId" : $("#isarpCharpterSection").val(),
				"acronyms" : $("#isarpAcronyms").val(),
				"charpter" : $("#isarpCharpter").val(),
				"start" :  this.isarpChaptervue.pagebarsVue.start,
				"length" : this.isarpChaptervue.pagebarsVue.length,
				"sortby" : this.isarpChaptervue.orders.sortby,
				"sortorders" : this.isarpChaptervue.orders.sortorders,
			};
			debugger
			myAjaxQuery(data, $("#tabContent_documentChapter"),this.proxy(function(response) {
				if (response.success) {
					this.isarpChaptervue.$set("isarpList", response.isarpList.aaData);					
				    this.isarpChaptervue.$set("pagebarsVue.all",response.isarpList.iTotalRecords);	
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


	_isarpInfo:function(e){
		
		var isarpId=$(e.currentTarget).attr("data");
		var sectionId=$(e.currentTarget).attr("data-data");
		//this.auditEditUm = new com.eiosa.audit.auditEdit($("div[umid='auditEdit']",this.$),{id:isarpId,sectionId:'',reportId:$.cookie("workReportId")});
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

	_export:function(){
		layer.open({
			  type: 1,
			  title: false,
			  shade: [0],
			  offset : [$('#export')[0].getBoundingClientRect().top+40, $('#export')[0].getBoundingClientRect().left-20],			
			  shadeClose: true,
			  closeBtn : 0,
			  border: [0],
			  scrollbar :false,
			  skin: 'layer-noboder',
			  content:$('#exportComformity'), 
			 
			});
	},
//	_exportComformity:function(tmpType){
//		debugger
//		var rule=[];
//	    rule.push(
//	    		{
//	             	"sectionId":$("#isarpCharpterSection").val(),
//	             	"acronyms":$("#isarpAcronyms").val(),
//	            	"charpter":$("#isarpCharpter").val(),
//	            	"reportId":$.cookie("workReportId")
//	             }
//	    );   
//	   var url="http://"+window.location.host+"/sms/query.do?" + "method=isarpCharpterReports&tokenid="+$.cookie("tokenid")+"&rule="+JSON.stringify(rule);
//	   window.open(url,'_blank');  
//	},
	_exportEXcelOrPdf:function(tmpType){
	document.getElementById("exportComformity").style.display="none";
	var rule=[];
    rule.push(
    		{
             	"sectionId":$("#isarpCharpterSection").val(),
             	"acronyms":$("#isarpAcronyms").val(),
            	"charpter":$("#isarpCharpter").val(),
            	"reportId":$.cookie("workReportId")
             }
    );   
   var url="http://"+window.location.host+"/sms/query.do?" + "method=exportisarpCharpterToPdf&tokenid="+$.cookie("tokenid")+"&rule="+JSON.stringify(rule)+""+"&tmpType="+tmpType;
   window.open(url,'_blank');  
},

},{ usehtm: true, usei18n: false});
com.eiosa.isarpCharpter.widgetjs = [//'../../uui/widget/select2/js/select2.min.js',
                           
                         /**  '../../uui/widget/jqdatatable/js/jquery.dataTables.js',
                           "../../uui/widget/spin/spin.js", 
                           "../../uui/widget/jqblockui/jquery.blockUI.js",
                           "../../uui/widget/ajax/layoutajax.js",
                           '../../uui/widget/validation/jquery.validate.js',
                           "../../uui/vendor/underscore.js",
                           "../../uui/vendor/underscore.json.js",
                           "../../uui/vendor/form2js.js",
                           "../../uui/vendor/js2form.js",
                           "../sms/losa/losa.js",
                           "base.js",
                           "../../uui/way.js"*/];
com.eiosa.isarpCharpter.widgetcss = [//{id:"",path:"../../uui/widget/select2/css/select2.css"},
                            //{id:"",path:"../../uui/widget/select2/css/select2-bootstrap.css"},
                            //{ path: '../../uui/widget/jqdatatable/css/jquery.dataTables.css' }, 
                            //{ path: '../../uui/widget/jqdatatable/css/dataTables.bootstrap.css' }
                                     ];