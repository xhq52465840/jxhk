$.u.define('com.eiosa.section.sectionStatus', null, {
	init : function(options) {
		this._options = options || null;
		this.reportId=this._options.reportId
	},
	afterrender : function() {
		
		this.sectionVue= new Vue({
            el : '#sectionStatusContext',
            data:{sectionList:''},
            methods : {
          	  querySection:this.proxy(this._querySection),
          	  sectionToIsarp:this.proxy(this._sectionToIsarp),
          	  sectionDocument:this.proxy(this._sectionDocument),
          	  conformity:this.proxy(this._conformity),
            },
             
             });
		this._querySection();
		
		$("#exportComformitys").click(this.proxy(function(){
	    	this._exportComformity();
		}));
	
		
	},
	
	_querySection:function(){
		
		var data = {
				"method":"querySection",
				"reportId":this.reportId
		};
		myAjaxQuery(data, null, this.proxy(function(param, response) {
			
			
			if (param.success) {
	            this.sectionVue.$set('sectionList',param.data.SectionList.aaData) 
	            
		}
			
		})); 
		
	},
	_sectionToIsarp:function(e){
		var sectionId=$(e.currentTarget).attr("data");
		var check="false";
		eiosaMainUm._initIsarpsTab({sectionId: sectionId,check :check});
		$('#myTab li:eq(4) a').tab('show');
	},
	_conformity:function(e){
		var sectionId=$(e.currentTarget).attr("data");
		var type=$(e.currentTarget).attr("type");
//		$("#isarpSection").val(id);
//		assessmentType=type;
//		$("#tab_isarps").click();
		var check="false";
		eiosaMainUm._initIsarpsTab({sectionId: sectionId,check :check,assessmentType: type});
		$('#myTab li:eq(4) a').tab('show');
	},
	_sectionDocument:function(e){
		var sectionId=$(e.currentTarget).attr("data");
//		sectionId=secId;
//		$("#docSection").val(secId);
//$("#tab_documents").click();
		eiosaMainUm._initDocumentsTab({sectionId: sectionId});
    	$('#myTab li:eq(2) a').tab('show');		
	},
	
	_exportComformity:function(){
		var rule=[];
        rule.push(
        		{
	            	"reportId":$.cookie("workReportId")
                 }
        );     
        //将上面的参数合并到aoData中
        debugger
		var url="http://"+window.location.host+"/sms/query.do?" + "method=sectionStatusReports&tokenid="+$.cookie("tokenid")+"&rule="+JSON.stringify(rule)+"";
		window.open(url,'_blank');
	}

	
}, {
	usehtm : true,
	usei18n : false
});

com.eiosa.section.sectionStatus.widgetjs = [
                                      '../../../uui/widget/select2/js/select2.min.js',
        							  '../../../uui/widget/spin/spin.js',
        							  '../../../uui/widget/jqblockui/jquery.blockUI.js',
        							  '../../../uui/widget/ajax/layoutajax.js',
        							  '../../../uui/widget/validation/jquery.validate.js',
        							 '../../../uui/vue.js',
        							"../base.js"
        							
        							  ];
 com.eiosa.section.sectionStatus.widgetcss = [{id:"",path:"../../../uui/widget/select2/css/select2.css"},
                                            {id:"",path:"../../../uui/widget/select2/css/select2-bootstrap.css"}];

