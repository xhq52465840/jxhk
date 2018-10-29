$.u.define('com.eiosa.reportExportDialog', null, {
	init: function (options) {
		this._options = options || {};
		this.reportId = eiosaMainUm.reportId;
		this.section;
		this.openLayer;
	},
    afterrender: function (bodystr) {	
    	$('.linkspot.CR.XLS').on('click', this.proxy(this.exportIataXls));
    	$('.linkspot.CR.DOC').on('click', this.proxy(this.exportIataDoc));
    	$('.linkspot.CEA.DOC').on('click', this.proxy(this.exportCeaDoc));   
    },
    
    //导出IATA XLS
    exportIataXls:function(e){
    	var url="http://"+window.location.host+"/sms/query.do?" + "method=conformanceReports&tokenid="+$.cookie("tokenid")+"&reportId="+this.reportId+"";
		  window.open(url,'_blank');
    },

    
    //导出IATA DOC
    exportIataDoc:function(e){
 	   var section = $(e.currentTarget).attr("section");
 	   var url="http://"+window.location.host+"/sms/query.do?" + "method=ismWord&section="+section+"&tokenid="+$.cookie("tokenid")+"&reportId="+this.reportId+"";
		 window.open(url,'_blank');
    },
    
    //导出CEA DOC
    exportCeaDoc:function(e){
//    	var section = $(e.currentTarget).attr("section");
//  	  var url="http://"+window.location.host+"/sms/query.do?" + "method=ismCeaWord&section="+section+"&tokenid="+$.cookie("tokenid")+"&reportId="+this.reportId+"";
// 	    window.open(url,'_blank');
 	     
//	   var export_blob = new Blob(['<html xmlns:v="urn:schemas-microsoft-com:vml"  xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word"xmlns:dt="uuid:C2F41010-65B3-11d1-A29F-00AA00C14882" xmlns:m="http://schemas.microsoft.com/office/2004/12/omml"xmlns="http://www.w3.org/TR/REC-html40">'+document.documentElement.outerHTML]);  
//	   var save_link = document.createElementNS('http://www.w3.org/1999/xhtml', 'a');
//	   var url = URL.createObjectURL(export_blob);
//	   save_link.href = url;
//	   save_link.download = 'ismItem.doc';
//	   var event = document.createEvent('MouseEvents');
//	   event.initMouseEvent('click', true, false, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null);
//	   save_link.dispatchEvent(event);
//	   URL.revokeObjectURL(url);

    	 this.section = $(e.currentTarget).attr("section");
		   this.openLayer = layer.open({
					type : 1,
					title : false,
					shade : [ 0 ],
					offset : [ $(e.currentTarget).parent()[0].getBoundingClientRect().top + 40, $(e.currentTarget).parent()[0].getBoundingClientRect().left + 20 ],
					shadeClose : true,
					closeBtn : 0,
					border : [ 0 ],
					scrollbar : false,
					skin : 'layer-noboder',
					content : '<div><input style="width:160px;" type=button  value="导出Pdf报表" class="exportComformity"></br><input style="width:160px;" type=button  value="导出word报表" class="exportComformity"></div></td>'
		    });
		   $(".exportComformity").bind("click",this.proxy(function(e){
		  	 var tmpValue = $(e.currentTarget).attr("value");
		  		var tmpType="";
		  		if(tmpValue == '导出Pdf报表'){
		  			 tmpType = "pdf";
		  		}else{
		  			 tmpType = "word";
		  		}		  
		  	  var url="http://"+window.location.host+"/sms/query.do?" + "method=ismCeaWord&section="+this.section+"&tokenid="+$.cookie("tokenid")+"&reportId="+this.reportId+""+"&tmpType="+tmpType+"";
		  	  window.open(url,'_blank');  
		  	  layer.close(this.openLayer);
		  	}));
    },
  	
       
}, { usehtm: true, usei18n: false });
com.eiosa.reportExportDialog.widgetjs = [
							  ];
com.eiosa.reportExportDialog.widgetcss = [
                                    ];