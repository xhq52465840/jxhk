//@ sourceURL=com.sms.plugin.search.datetimeProp
$.u.define("com.sms.plugin.search.datetimeProp", "com.sms.plugin.search.baseprop",{
    // filter段
    filter_html: function () { 
        this.i18n = com.sms.plugin.search.datetimeProp.i18n;
    	return  '<div class="filter-layer">'
			    + '<form style="min-width:370px;" class="form-inline" role="form" id="' + this._id + '-form">'
		    	+	'<div class="form-body" style="padding: 10px 10px 0px 10px;">'
                +     '<div class="radio">'
                +        '<label><input type="radio" class="dateRange" checked="checked" name="datePropRadio">'
			    +			'<div class="form-group startdategroup">'
			    +        		'<div class="has-feedback">'
				+            		'<input type="text" class="form-control input-sm startdate" style="width:150px;" />'
				+            		'<span class="glyphicon glyphicon-calendar form-control-feedback"></span>'
			    +        		'</div>'
			    +			'</div>&nbsp;&nbsp;-&nbsp;&nbsp;'
			    +			'<div class="form-group enddategroup">'
			    +        		'<div class="has-feedback">'
				+            		'<input type="text" class="form-control input-sm enddate" style="width:150px;" />'
				+            		'<span class="glyphicon glyphicon-calendar form-control-feedback"></span>'
			    +        		'</div>'
		        +    		'</div>'
		        +			'<div class="text-danger hidden validmsg" style="padding-left: 14px;"></div>'
                +         '</label>'
                +     '</div><br/>'
                +     '<div class="radio">'
                +       '<label>'
                +           '<input type="radio" class="currentYear" name="datePropRadio">' + this.i18n.cate.currentYear
                +       '</label>'
                +     '</div><br/>'
                +     '<div class="radio">'
                +       '<label>'
                +           '<input type="radio" class="currentSeason" name="datePropRadio">' + this.i18n.cate.currentSeason
                +       '</label>'
                +     '</div><br/>'
                +     '<div class="radio">'
                +       '<label>'
                +           '<input type="radio" class="currentMonth" name="datePropRadio">' + this.i18n.cate.currentMonth
                +       '</label>'
                +     '</div><br/>'
                +     '<div class="radio">'
                +       '<label>'
                +           '<input type="radio" class="prevMonth" name="datePropRadio">' + this.i18n.cate.prevMonth
                +       '</label>'
                +     '</div><br/>'
                +     '<div class="radio">'
                +       '<label>'
                +           '<input type="radio" class="last12Months" name="datePropRadio">' + this.i18n.cate.last12Months
                +       '</label>'
                +     '</div>'
				+ 	'</div>'
				+   this._filter_buttons()
				+ '</form>'
				+ '</div>';
    },
    filter_render: function (setting,toolsel) {
//    	setting = [{"id":"inRangeRadio", "name":"-3w 4d 12h;8w 4d 12h"}];
        this.i18n = com.sms.plugin.search.datetimeProp.i18n;
        this.filtersel = toolsel;
        this.setting = setting;
        this.$startDate = this.filtersel.find(".startdate");
        this.$endDate = this.filtersel.find(".enddate");
        this.$dateRangeRadioBox = this.filtersel.find(":radio.dateRange");
        this.$currentYearRadioBox = this.filtersel.find(":radio.currentYear");
        this.$currentSeasonRadioBox = this.filtersel.find(":radio.currentSeason");
        this.$currentMonthRadioBox = this.filtersel.find(":radio.currentMonth");
        this.$prevMonthRadioBox = this.filtersel.find(":radio.prevMonth");
        this.$last12MonthsRadioBox = this.filtersel.find(":radio.last12Months");
        this.$validMsg = this.filtersel.find(".validmsg");

    	this.$startDate.add(this.$endDate).datepicker({ 
            dateFormat: "yy-mm-dd",
            onSelect: this.proxy(function(dateText, inst) {
                this.$dateRangeRadioBox.prop("checked", true);
            })
        });
    	
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
        
        if(this.setting.propvalue && this.setting.propvalue.length > 0){
        	var data = this.setting.propvalue[0];
            if(data.type === "currentYear"){
                this.$currentYearRadioBox.prop("checked", true);
            }
            else if(data.type === "currentSeason"){
                this.$currentSeasonRadioBox.prop("checked", true);
            }
            else if(data.type === "currentMonth"){
                this.$currentMonthRadioBox.prop("checked", true);
            }
            else if(data.type === "prevMonth"){
                this.$prevMonthRadioBox.prop("checked", true);
            }
            else if(data.type === "last12Months"){
                this.$last12MonthsRadioBox.prop("checked", true);
            }
            else { // dateRange
                this.$dateRangeRadioBox.prop("checked", true);
                this.$startDate.val(data.startDate || "");
                this.$endDate.val(data.endDate || "");
            }
        	
        }
    },
    filter_getdata: function () { 
        var startDate = null;
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
            } 
            else if ( startDate ){
                this.setting.propvalue = [{ "id": "[" + startDate + "T00:00:00Z TO NOW ]", "startDate": startDate, "type": "dateRange" }];
                this.setting.propshow = startDate;
            } 
            else if ( endDate ){
                this.setting.propvalue = [{ "id": "[ * TO " + (new Date(endDate)).addDays(1).format("yyyy-MM-dd") + "T00:00:00Z }", "endDate": endDate, "type": "dateRange" }];
                this.setting.propshow = endDate;
            }
        }
        else if(this.$currentYearRadioBox.is(":checked")){
            this.setting.propvalue = [{ "id": "currentYear()", "name": this.i18n.cate.currentYear, "type": "currentYear" }];
            this.setting.propshow = this.i18n.cate.currentYear;
        }
        else if(this.$currentSeasonRadioBox.is(":checked")){
            this.setting.propvalue = [{ "id": "currentSeason()", "name": this.i18n.cate.currentSeason, "type": "currentSeason" }];
            this.setting.propshow = this.i18n.cate.currentSeason;
        }
        else if(this.$currentMonthRadioBox.is(":checked")){
            this.setting.propvalue = [{ "id": "currentMonth()", "name": this.i18n.cate.currentMonth, "type": "currentMonth" }];
            this.setting.propshow = this.i18n.cate.currentMonth;
        }
        else if(this.$prevMonthRadioBox.is(":checked")){
            this.setting.propvalue = [{ "id": "prevMonth()", "name": this.i18n.cate.prevMonth, "type": "prevMonth" }];
            this.setting.propshow = this.i18n.cate.prevMonth;
        }
        else if(this.$last12MonthsRadioBox.is(":checked")){
            this.setting.propvalue = [{ "id": "last12Months()", "name": this.i18n.cate.last12Months, "type": "last12Months" }];
            this.setting.propshow = this.i18n.cate.last12Months;
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
    	
        if(this.$dateRangeRadioBox.is(":checked")){
        	if(startDate && (new Date(startDate)) == "Invalid Date"){
        		result = false;
        		msg.push(this.i18n.messages.startDateFormat);
        		$startDateGroup.addClass("has-error");
        	}
            else{
        		startDate = new Date(startDate);
        		$startDateGroup.removeClass("has-error");
        	}
        	
        	if(endDate && (new Date(endDate)) == "Invalid Date"){
        		result = false;
        		msg.push(this.i18n.messages.endDateFormat);
        		$endDateGroup.addClass("has-error");
        	}
            else{
        		endDate = new Date(endDate);
        		$endDateGroup.removeClass("has-error");
        	}
        	
        	if(startDate && endDate && (startDate - endDate > 0)){
        		result = false;
        		msg.push(this.i18n.messages.startBigThanEnd);
        		$startDateGroup.add($endDateGroup).addClass("has-error");
        	}
        }
    	
    	if(result){
    		$startDateGroup.add($endDateGroup).removeClass("has-error");
    		this.$validMsg.addClass("hidden").text("");
    	}
        else{
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
