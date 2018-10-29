$.u.load("com.eiosa.document.docEdit");
$.u.load("com.eiosa.log.eiosaIsarpOperateLog");
$.u.load("com.eiosa.document.checkDocumentIosaDialog");
$.u.define('com.eiosa.document.docList', null, {
	init : function(options) {
		this._options = options || null;
		this.reportId = this._options.reportId;
		this.sectionId = this._options.sectionId;
		this.docEditUm = null;
		this.checkDocumentIosaDialogUm = null;
	},
	afterrender : function() {
		Vue.filter('datestr', function(value) {
			var date = new Date(value);
			if ( isNaN(date)==true ) return value;
			return date.format("yyyy-MM-dd");
		});
		
//		this.queryformsvue = new Vue({
//			el : '#queryform',
//			data : {
//				sectionNames:'',
//				eiosaUserRole:$.cookie('eiosaUserRole'), 
//				documentsQueryForm:{section:this.sectionId, docname:this._options.docname} 
//		           },
//			methods : {
//				search : this.proxy(this._queryReportDocument),
//				newdoc : this.proxy(this._opendoc),
//			}
//		});
//		
		//alert(JSON.stringify(this.queryformsvue.documentsQueryForm))
		this.sectionDocVue = new Vue({
			el : '#documents',
			data : {
				sectiondocument:'', 
				sectionNames:'',
				documentsQueryForm:{sectionId:this.sectionId, docname:this._options.docname}, 
				child_modified:false,child_modified2:false,eiosaUserRole:$.cookie('eiosaUserRole'),
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
				search : this.proxy(this._queryReportDocument),
				newdoc : this.proxy(this._opendoc),
				doccheck : this.proxy(this._checkDocumentIosa),
				attachclick : this.proxy(this._attachclick),
				opendoc : this.proxy(this._opendoc),
				deldoc : this.proxy(this._checkDocumentIosa),
	//			queryReportDocument : this.proxy(this._queryReportDocument),
				reportSearchClick : this.proxy(this._reportSearchClick),
				page : this.proxy(this._queryReportDocument),
				noClick: this.proxy(this._reviewedSelect),
				queryLog:this.proxy(function(id){
					this._queryLog(id);
				}),
				logShow:this.proxy(function(e){
					this.on_togglePanel_click(e)
				}),
				
			}
		});
	    this.logTable=new com.eiosa.log.eiosaIsarpOperateLog($("div[umid='documentLogTable']", this.$),{targetId:this.reportId});
		this._initDocumentsTab();
		this._initSectionNames();
		this._reviewedSelect();
		
	},
	
	_reviewedSelect:function(){
		this.sectionDocVue.$set("documentsQueryForm.docname","");
		var data = {
				tokenid : $.cookie("tokenid"),
				method : "queryDocReviewed",
				"reportId" : this.reportId,
				"sectionId" : $("#docSection").val(),
		};
		debugger
		myAjaxQuery(data, null, this.proxy(function(param, response) {
			if (param.success) {
				var array = new Array();
				$.each(param.data,function(index,value){
					var obj = new Object();
					obj.id = value.id;
					var tex1=value.acronyms;
					var tex2 =value.reviewed; 
					var tex3 =value.versionno; 
					obj.text = "("+tex1+")"+tex2+"--"+tex3;
					array.push(obj);
				})
				this.sectionDocVue.$set("options", array);
				}
		})); 		
	},

	//为外部页面调用，刷新整体数据
	refresh : function() {
		this._initDocumentsTab();
	},
	_queryLog:function(id){
		  this.logTable.reload(parseInt(id));
	  },
	_initDocumentsTab : function(e) {
		this.docSection = this.qid("docSection");
		this.qid("addNewDocument").off("click").on("click",
				(this.proxy(this._showDocument)));
		this.qid("linkIsarp").off("click").on("click", (this.proxy(function() {
			window.open('/sms/uui/com/eiosa/isarpCharpter.html');
		})));
		// 查找Document
		// 查询documents
		this._queryReportDocument();
		this._queryLog(this.reportId);
		

	},
	
	
	_reportSearchClick : function() {
		this.sectionDocVue.$set("pagebarsVue.cur",1);
		this.sectionDocVue.$set("pagebarsVue.start",0);
		this._queryReportDocument();

},
	_queryReportDocument : function() {		
		var data = {
			"method" : "queryDocumentsByReport",
			"reportId" : this.reportId,
			"documentsQueryForm": JSON.stringify(this.sectionDocVue.documentsQueryForm),
			"start" :  this.sectionDocVue.pagebarsVue.start,
			"length" : this.sectionDocVue.pagebarsVue.length,
			"sortby" : this.sectionDocVue.orders.sortby,
			"sortorders" : this.sectionDocVue.orders.sortorders,
		}
		debugger
		myAjaxQuery(data, $("#documents"), this.proxy(function(response) {
			if (response.success) {		
				debugger
				this.sectionDocVue.$set("sectiondocument", response.data.aaData);
				this.sectionDocVue.$set("pagebarsVue.all",response.data.iTotalRecords);				
			}
		})); // myAjax

	},
	
	_opendoc : function(e) {
		debugger
		var docId = $(e.currentTarget).attr("dataid");
		if (isNaN(docId)||docId==""||docId==null) {
			this.isUpload=1;
		}else{
			this.isUpload=0;
		}
		if(this.docEditUm != null) delete this.docEditUm;
		this.docEditUm = new com.eiosa.document.docEdit($("div[umid='docEdit']",this.$),{docId :docId, reportId: this.reportId,isUpload:this.isUpload});
		this.sectionDocVue.child_modified = false;
		var layerindex = layer.open({
	        type: 1,
	        title: '参考文件编辑',
	        maxmin: false,
	        fix: false,
	        closeBtn: 0,
	        zIndex : 20, //不能太高，免得附件窗口被遮挡
	        shadeClose: false, //点击遮罩关闭层
	        area : ['800px' , '620px'],
	        //content: 'document/docEdit.html?docId=' + docId + '&reportId=' + this.reportId,
	        content: $("div[umid='docEdit']",this.$),
	        end:  this.proxy(function() {
	        	if (this.sectionDocVue.child_modified == true){
	        		this._queryReportDocument();
	        		this._queryLog(this.reportId);
	        	}
	        }),
	        	
//	        zIndex: layer.zIndex, //重点1
//	        success: function(layero, index){
//	            layer.setTop(layero); //重点2
//	        }
	    });
		this.docEditUm.myLayerIndex = layerindex;
		
		
		//长文档弹layer有bug，父页面会滚动到顶部，下面的补丁把他再滚回来
    	$('html,body').animate({scrollTop: $(e.currentTarget).offset().top - $(e.currentTarget)[0].getBoundingClientRect().top}, 1);
	},
	
	_attachclick : function(e) {
		var attachId = $(e.currentTarget).attr("dataid");
		openAttach(attachId);
	},

	_documentCheck : function(docId,name,ischecked) {
		var data = {
			"method" : "?",
			"reportId" : this.reportId,
			"docId" : docId,
			"sectionName" : name,
		};

		if (ischecked == true) {
			data = $.extend(data, {
				"method" : "addDocumentSection"
			})
			myAjaxModify(data, $("#documents"), this.proxy(function(response) {
				// layer.msg('关联已添加');
				this._queryLog(this.reportId);
			}));
		} else {
			data = $.extend(data, {
				"method" : "delDocumentSection"
			})
			myAjaxModify(data, $("#documents"), this.proxy(function(response) {
				// layer.msg('关联已取消');
				this._queryLog(this.reportId);
			}));
		}
	},

	
	_deldoc : function(docId) {
		var layerindex = layer.confirm('是否确认删除？', {
		    btn: ['确认','取消'] //按钮
		}, this.proxy(function(){
			var data = {
				"method":"delEiosaDocument",
				"docId":docId,
			};
			myAjaxModify(data, null, this.proxy(function(response) {
				layer.close(layerindex);
				this._queryReportDocument();
			}));			
			
		}), function(){
		});	
	},
	
	
	_initSectionNames : function(e) {
		var data = {
			"method" : "getSectionName",
			"reportId" : this.reportId
		};
		myAjaxQuery(data, null, this.proxy(function(response) {
			if (response.success) {
				this.sectionDocVue.$set('sectionNames', response.data)
			}
		})); // myAjaxQuery
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
	   
	   

	// 查询引用章节
	_checkDocumentIosa : function(e) {
		var ischecked = $(e.currentTarget).is(':checked');
		var myclass = $(e.currentTarget).attr("class");
		var title = $(e.currentTarget).attr("title");

		var docId = $(e.currentTarget).attr("dataid");
		var sectionName = $(e.currentTarget).attr("datasec");
		this.sectionDocVue.child_modified2 = false;
		
		var data = {
			"method" : "checkDocumentIosa",
			"docId" : docId,
			"sectionName" : sectionName,
		};
		myAjaxQuery(data, null, this.proxy(function(response) {
			if (response.success&&response.data.length != 0&&ischecked==0) {
				if (this.checkDocumentIosaDialogUm != null)
					delete this.checkDocumentIosaDialogUm;
				this.checkDocumentIosaDialogUm = new com.eiosa.document.checkDocumentIosaDialog($("div[umid='checkDocumentIosaDialog']", this.$), { docId : docId, sectionName : sectionName });
				this.checkDocumentIosaDialogUm._initdata(response.data);
				
				var layerindex = layer.open({
					type : 1,
					title : '引用文档的ISARPs',
					maxmin : false,
					fix : false,
					zIndex : 20, // 不能太高，免得附件窗口被遮挡
					shadeClose : false, // 点击遮罩关闭层
					area : [ '350px', '370px' ],
					content : $("div[umid='checkDocumentIosaDialog']", this.$),
					end : this.proxy(function() {
						if (this.sectionDocVue.child_modified2 == true && myclass == "documentCheck") {
							this._documentCheck(docId, sectionName, ischecked);
						} else if (this.sectionDocVue.child_modified2 == true && title != null) {
							this._deldoc(docId);
						} else if (this.sectionDocVue.child_modified2 == false && myclass == "documentCheck") {
							var sd = this.sectionDocVue.sectiondocument;
							for (var c = 0; c < sd.length; c++) {
								if (sd[c].doc.id == docId) {
									for ( var i in sd[c]) {
										if (i == sectionName) {
											sd[c][i] = !ischecked;
										}
									}
								}
							}
						}
					}),
				});
				this.checkDocumentIosaDialogUm.myLayerIndex = layerindex;
			}else{
				if (myclass == "documentCheck") {
					this._documentCheck(docId, sectionName, ischecked);
				} else if (title != null) {
					this._deldoc(docId);
				}		
			}
		})); // myAjaxQuery

	},

}, {
	usehtm : true,
	usei18n : false
});

com.eiosa.document.docList.widgetjs = [
		//'../../../uui/widget/select2/js/select2.full.js',

		//'../../../uui/widget/jqdatatable/js/jquery.dataTables.js',
		//"../base.js", "../../../uui/vue.min.js",
		//"../../../uui/tooltip/myTooltip.js", "../../../uui/util/htmlutil.js",
		//"../../../uui/sorttable/sorttable.js", 
		];
com.eiosa.document.docList.widgetcss = [ 
//                                         {
//	id : "",
//	path : "../../../uui/widget/select2/css/select2.css"
//}, {
//	id : "",
//	path : "../../../uui/widget/select2/css/select2-bootstrap.css"
//}, {
//	path : '../../../uui/widget/jqdatatable/css/jquery.dataTables.css'
//}, {
//	path : '../../../uui/tooltip/jquery.tooltip.css'
//}, 
//{	path : '../../../uui/sorttable/sorttable.css'}, 
//{
//	path : '../../../uui/widget/jqdatatable/css/dataTables.bootstrap.css'
//} 
];