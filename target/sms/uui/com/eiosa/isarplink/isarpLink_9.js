$.u.define('com.eiosa.isarplink.isarpLink_9', null, {
	init : function(options) {
		this._options = options || null;
		this.reportId = this._options.reportId;
	},
	afterrender : function() {
		var _that = this;
		$('.linkspot').on('click', this.proxy(this._openIsarp));
		 if (typeof(this._options.sourceSection)!='undefined' && this._options.sourceSection!='undefined' ) {
			 //根据传入的参数，显示强调字体
			 var obj = this._getJQBySectionAndNo(this._options.sourceSection, this._options.sourceNo);
			 obj.parent().css('fontWeight','bold');
			 obj.parent().css('fontStyle','italic');
			 obj.parent().css('backgroundColor','#ffff00');
		 }
		 $(".scrollLoading").scrollLoading({
			    callback: function() {
			    	_that._getConfirmityResult($(this));
			    }
		 });
	},

	exists : function(sectionName, no) {
		//console.log($('.linkspot .sectionName:contains(ORG)~.chapter:contains(1.1.10A)'));
		var obj = this._getJQBySectionAndNo(sectionName, no);
		return obj.length>0;
	},
	
	_getJQBySectionAndNo : function(sectionName, no) {
		var obj = $('.linkspot .sectionName:contains('+sectionName+')~.chapter:contains('+no+')');
		return obj;
	},
	
   //打开isarp detail
   _openIsarp:function(e){
	   var sectionName = $('.sectionName', e.currentTarget).text();
	   var chapter = $('.chapter', e.currentTarget).text();
	   var url="/sms/uui/com/eiosa/audit/auditEdit.html?chapter="+ chapter+"&sectionName="+sectionName+"&reportId="+this.reportId;
	   window.open(url);
   },
   _getConfirmityResult:function(_parent){
	   var _that = this;
	   _parent.find('a.linkspot').each(function(i){
		   var sectionName = $('.sectionName', this).text();
		   var chapter = $('.chapter', this).text();
		   var reportId = _that.reportId;
		   var _that_a = this;
		   if (typeof(sectionName)!='undefined' && typeof(chapter)!='undefined' && 
					 sectionName!='undefined' && chapter!='undefined') {
				 //另外一种传参途径。先去查询获得isarpId和sectionId
				_that._queryBySectionChapter(sectionName,chapter,reportId,_that_a);
		   }
	   });
   },
   _queryBySectionChapter : function(sectionName,chapter,reportId,_that_a) {
	   var _that = this;
		var data = {
			"method" : "queryConfirmityBySectionChapterWithSuffix",
			"sectionName" : sectionName,
			"chapter" : chapter,
			"reportId" : reportId,
			"tokenid":$.cookie("tokenid")
		};
		var url = $.u.config.constant.smsqueryserver;
		jQuery.ajax({
		   type: "POST",
		   url: url,
		   data: data,
		   global:false,
		   success:function(response){
				 if(response.success){
					 var assessment = response.assessment;
					 if(assessment != null && assessment.length > 0){
						 if(assessment.length == 1){
							 _that._fillConfirmity(_that_a,assessment[0][2]);
						 }else{
							 for(var i=0;i<assessment.length;i++){
								 console.log("--"+assessment[i][0]+assessment[i][1]+"=="+sectionName+chapter+"--");
								 //debugger;
								 if(assessment[i][0]+assessment[i][1] != sectionName+chapter){
									 _that._fillConfirmity(_that_a,assessment[i][2],assessment[i][0],assessment[i][1]);
								 }
							 }
					 	}
					 }
				 }
			   }
		});
  },
 _fillConfirmity:function(_that_a,assessment,sectionName,chapter){
	 switch(assessment){
	 	case 1:   //Conformity(Documented and Implemented)
	 		$(_that_a).parent().append('<br/>');
	 		if(sectionName != null && sectionName != '' && sectionName != undefined
	 			&& chapter != null && chapter != '' && chapter != undefined){
	 			$(_that_a).parent().append($('<a>').attr('href','#').addClass('linkspot').addClass('uui-cursor-pointer')
	 			.append($('<span>').addClass('sectionName').text(sectionName))
	 			.append($('<span>').addClass('chapter').text(chapter)).off('click').on('click', this.proxy(this._openIsarp)))
	 			.append('<br/>');
	 		}
	 		$(_that_a).parent().append($('<span>').addClass('confirmitygreen').text('DOC'));
	 		$(_that_a).parent().append($('<span>').addClass('confirmitygreen').text('IMP'));
	 		$(_that_a).parent().append($('<span>').addClass('confirmitygrey').text('N/A'));
	 		break;
	 	case 5:   //Observation(Not Documented, Not Implemented)
	 		$(_that_a).parent().append('<br/>');
	 		if(sectionName != null && sectionName != '' && sectionName != undefined
	 			&& chapter != null && chapter != '' && chapter != undefined){
	 			$(_that_a).parent().append($('<a>').attr('href','#').addClass('linkspot').addClass('uui-cursor-pointer')
	 			.append($('<span>').addClass('sectionName').text(sectionName))
	 			.append($('<span>').addClass('chapter').text(chapter)).off('click').on('click', this.proxy(this._openIsarp)))
	 			.append('<br/>');
	 		}
	 		$(_that_a).parent().append($('<span>').addClass('confirmityred').text('DOC'));
	 		$(_that_a).parent().append($('<span>').addClass('confirmityred').text('IMP'));
	 		$(_that_a).parent().append($('<span>').addClass('confirmitygrey').text('N/A'));
	 		break;
	 	case 6:   //Observation(Not Documented, Implemented)
	 		$(_that_a).parent().append('<br/>');
	 		if(sectionName != null && sectionName != '' && sectionName != undefined
	 			&& chapter != null && chapter != '' && chapter != undefined){
	 			$(_that_a).parent().append($('<a>').attr('href','#').addClass('linkspot').addClass('uui-cursor-pointer')
	 			.append($('<span>').addClass('sectionName').text(sectionName))
	 			.append($('<span>').addClass('chapter').text(chapter)).off('click').on('click', this.proxy(this._openIsarp)))
	 			.append('<br/>');
	 		}
	 		$(_that_a).parent().append($('<span>').addClass('confirmityred').text('DOC'));
	 		$(_that_a).parent().append($('<span>').addClass('confirmitygreen').text('IMP'));
	 		$(_that_a).parent().append($('<span>').addClass('confirmitygrey').text('N/A'));
	 		break;
	 	case 7:   //Observation(Documented, Not Implemented)
	 		$(_that_a).parent().append('<br/>');
	 		if(sectionName != null && sectionName != '' && sectionName != undefined
	 			&& chapter != null && chapter != '' && chapter != undefined){
	 			$(_that_a).parent().append($('<a>').attr('href','#').addClass('linkspot').addClass('uui-cursor-pointer')
	 			.append($('<span>').addClass('sectionName').text(sectionName))
	 			.append($('<span>').addClass('chapter').text(chapter)).off('click').on('click', this.proxy(this._openIsarp)))
	 			.append('<br/>');
	 		}
	 		$(_that_a).parent().append($('<span>').addClass('confirmitygreen').text('DOC'));
	 		$(_that_a).parent().append($('<span>').addClass('confirmityred').text('IMP'));
	 		$(_that_a).parent().append($('<span>').addClass('confirmitygrey').text('N/A'));
	 		break;
	 	case 8:   //N/A(Not Applicable)
	 		$(_that_a).parent().append('<br/>');
	 		if(sectionName != null && sectionName != '' && sectionName != undefined
	 			&& chapter != null && chapter != '' && chapter != undefined){
	 			$(_that_a).parent().append($('<a>').attr('href','#').addClass('linkspot').addClass('uui-cursor-pointer')
	 			.append($('<span>').addClass('sectionName').text(sectionName))
	 			.append($('<span>').addClass('chapter').text(chapter)).off('click').on('click', this.proxy(this._openIsarp)))
	 			.append('<br/>');
	 		}
	 		$(_that_a).parent().append($('<span>').addClass('confirmitygrey').text('DOC'));
	 		$(_that_a).parent().append($('<span>').addClass('confirmitygrey').text('IMP'));
	 		$(_that_a).parent().append($('<span>').addClass('confirmitygreen').text('N/A'));
	 		break;
	 	default:
	 		$(_that_a).parent().append('<br/>');
	 		if(sectionName != null && sectionName != '' && sectionName != undefined
	 			&& chapter != null && chapter != '' && chapter != undefined){
	 			$(_that_a).parent().append($('<a>').attr('href','#').addClass('linkspot').addClass('uui-cursor-pointer')
	 			.append($('<span>').addClass('sectionName').text(sectionName))
	 			.append($('<span>').addClass('chapter').text(chapter)).off('click').on('click', this.proxy(this._openIsarp)))
	 			.append('<br/>');
	 		}
	 		$(_that_a).parent().append($('<span>').addClass('confirmitygrey').text('DOC'));
	 		$(_that_a).parent().append($('<span>').addClass('confirmitygrey').text('IMP'));
	 		$(_that_a).parent().append($('<span>').addClass('confirmitygrey').text('N/A'));
	 		break;
	 }
 }

}, {
	usehtm : true,
	usei18n : false
});

com.eiosa.isarplink.isarpLink_9.widgetjs = [
		//"../base.js", "../../../uui/vue.min.js",
		//"../../../uui/tooltip/myTooltip.js", "../../../uui/util/htmlutil.js",
];
com.eiosa.isarplink.isarpLink_9.widgetcss = [{
	//path : '../../../uui/tooltip/jquery.tooltip.css'
},];