//@ sourceURL=com.audit.checklist.DateProp
$.u.define("com.audit.checklist.DateProp", "com.sms.plugin.search.baseprop",{
	//copy from com.sms.plugin.search.dateProp
  
	// filter段
    filter_html: function () { 
    	return  '<div class="col-sm-10 ">'
			    + '<form style="min-width:370px;" class="form-inline" role="form" id="'+this._id+'-form">'
		    	+	'<div class="form-body" style="padding: 10px 10px 0px 10px;">'
                +     '<div class="radiobox">'
                +        '<label>'
			    +			'<div class="form-group startdategroup">'
			    +        		'<div class="has-feedback">'
				+            		'<input type="text" class="form-control input-sm startdate" style="width:150px;" />'
				+            		'<span class="glyphicon glyphicon-calendar form-control-feedback"></span>'
			    +        		'</div>'
			    +			'</div>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;-&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;'
			    +			'<div class="form-group enddategroup">'
			    +        		'<div class="has-feedback">'
				+            		'<input type="text" class="form-control input-sm enddate" style="width:150px;" />'
				+            		'<span class="glyphicon glyphicon-calendar form-control-feedback"></span>'
			    +        		'</div>'
		        +    		'</div>'
		        +			'<div class="text-danger hidden validmsg"></div>'
                +         '</label>'
                +     '</div>'
                +     '<div>'
            
                +     '</div>'
				+ 	'</div>'
			//	+   this._filter_buttons()
				+ '</form>'
				+ '</div>';
    },
    filter_render: function (setting,toolsel) {
        this.filtersel = toolsel;
        this.$startDate = this.filtersel.find(".startdate");
        this.$endDate = this.filtersel.find(".enddate");
        this.$validMsg = this.filtersel.find(".validmsg");
    	this.$startDate.add(this.$endDate).datepicker({ dateFormat: "yy-mm-dd" });
        this.i18n = com.audit.checklist.DateProp.i18n;
        this._filter_bind_commonobj();        
        $("body").unbind("mousedown").bind("mousedown",this.proxy(function(e){ 
			var $this = $(e.target), inFilterInner = $this.parents(".filter-layer").length > 0;
			if( $this.hasClass("search-prop-close") && inFilterInner ){
				$("body").unbind("mousedown");
			}else if( !$this.hasClass("filter-layer") && $this.parents(".ui-datepicker").length == 0 && !inFilterInner ){
				this.destroy();
				$("body").unbind("mousedown");
			}
		}));
    },
    filter_getdata: function () {  	
        var startDate ,endDate= null;
    	Date.prototype.addDays = function (days){
    		var dat = new Date(this.valueOf());
    		dat.setDate(dat.getDate() + days);
    		return dat;
    	}

        if(this.$dateRangeRadioBox.is(":checked")){
            startDate = $.trim(this.$startDate.val()), endDate = $.trim(this.$endDate.val());
            if ( startDate && endDate ){
                this.setting.propvalue = [{ "id": "[" + startDate + "T00:00:00Z TO " + (new Date(endDate)).addDays(1).format("yyyy-MM-dd") + "T00:00:00Z }", "startDate": startDate, "endDate": endDate, "type": "dateRange" }];
                this.setting.propshow = startDate + " 至 " + endDate;
            } else if ( startDate ){
                this.setting.propvalue = [{ "id": "[" + startDate + "T00:00:00Z TO * ]", "startDate": startDate, "type": "dateRange" }];
                this.setting.propshow = startDate;
            } else if ( endDate ){
                this.setting.propvalue = [{ "id": "[ * TO " + (new Date(endDate)).addDays(1).format("yyyy-MM-dd") + "T00:00:00Z }", "endDate": endDate, "type": "dateRange" }];
                this.setting.propshow = endDate;
            }
        }
        else if(this.$currentSeasonRadioBox.is(":checked")){
            this.setting.propvalue = [{ "id": "currentSeason()", "name": "currentSeason()", "type": "currentSeason" }];
            this.setting.propshow = "currentSeason()";
        }
    	
    	return this.setting;
    },
    filter_setdata:function(){
    	
    },
    filter_valid: function(){  
    	var startDate = $.trim(this.$startDate.val()), 
    		endDate = $.trim(this.$endDate.val()), 
    		result = true, 
    		msg = [],
    		$startDateGroup = this.filtersel.find(".startdategroup"),
    		$endDateGroup = this.filtersel.find(".enddategroup");
    	
    	if(startDate && (new Date(startDate)) == "Invalid Date"){
    		result = false;
    		msg.push(this.i18n.startDateFormat);
    		$startDateGroup.addClass("has-error");
    	}else{
    		startDate = new Date(startDate);
    		$startDateGroup.removeClass("has-error");
    	}
    	
    	if(endDate && (new Date(endDate)) == "Invalid Date"){
    		result = false;
    		msg.push(this.i18n.endDateFormat);
    		$endDateGroup.addClass("has-error");
    	}else{
    		endDate = new Date(endDate);
    		$endDateGroup.removeClass("has-error");
    	}
    	
    	if(startDate && endDate && (startDate - endDate > 0)){
    		result = false;
    		msg.push(this.i18n.startBigThanEnd);
    		$startDateGroup.add($endDateGroup).addClass("has-error");
    	}
    	
    	if(result){
    		$startDateGroup.add($endDateGroup).removeClass("has-error");
    		this.$validMsg.addClass("hidden").text("");
    	}else{
    		this.$validMsg.removeClass("hidden").text(msg.join(" "));
    	}
    	return result;
    },
    destroy:function(){
    	this.$startDate.add(this.$endDate).datepicker("destroy");
    	this.filtersel.remove();
    	this.afterDestroy();
    	this._super();
    }
}, { usehtm: false, usei18n: true });
