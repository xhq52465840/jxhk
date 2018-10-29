//@ sourceURL=com.audit.plugin.validate.queryDateProp
$.u.define("com.audit.plugin.validate.queryDateProp", "com.sms.plugin.search.baseprop",{
	//copy from com.sms.plugin.search.dateProp
	//审计日期
   table_html: function (data, type, row, meta) {
		return	'<span style="padding-left:15px;">' +(row.startDate?row.startDate:"")+ '</span><br>'
  			+  '<span style="padding-left:15px;">' +(row.endDate?row.endDate:"")+ '</span>';
			},
	// filter段
    filter_html: function () { 
    	return  '<div class="filter-layer">'
			    + '<form style="min-width:370px;" class="form-inline" role="form" id="'+this._id+'-form">'
		    	+	'<div class="form-body" style="padding: 10px 10px 0px 10px;">'
                +     '<div class="radiobox">'
                +        '<label><input type="radio" class="dateRange" checked="checked" name="datePropRadio">'
			    +			'<div class="form-group startdategroup">'
			    +        		'<div class="has-feedback">'
				+            		'<input type="text" class="form-control input-sm startdate" style="width:150px;" />'
				+					'<a class="select2-search-choice-close hidden" href="javascript:void(0)" style="right: 8px;top: 8px;"></a>'
				//+            		'<span class="glyphicon glyphicon-remove-circle form-control-feedback"></span>'
			    +        		'</div>'
			    +			'</div>&nbsp;&nbsp;-&nbsp;&nbsp;'
			    +			'<div class="form-group enddategroup">'
			    +        		'<div class="has-feedback">'
				+            		'<input type="text" class="form-control input-sm enddate" style="width:150px;" />'
				+					'<a class="select2-search-choice-close hidden" href="javascript:void(0)" style="right: 8px;top: 8px;"></a>'
				//+            		'<span class="glyphicon glyphicon-remove-circle form-control-feedback"></span>'
			    +        		'</div>'
		        +    		'</div>'
		        +			'<div class="text-danger hidden validmsg"></div>'
                +         '</label>'
                +     '</div>'
                +     '<div>'
               /* +       '<label>'
                +           '<input type="radio" class="currentSeason" name="datePropRadio">当前季度'
                +       '</label>'*/
                +     '</div>'
				+ 	'</div>'
				+   this._filter_buttons()
				+ '</form>'
				+ '</div>';
    },
    filter_render: function (setting,toolsel) {

        this.filtersel = toolsel;
        this.setting = setting;
        this.$startDate = this.filtersel.find(".startdate");
        this.$endDate = this.filtersel.find(".enddate");
        this.$dateRangeRadioBox = this.filtersel.find(":radio.dateRange");
        this.$currentSeasonRadioBox = this.filtersel.find(":radio.currentSeason");
        this.$validMsg = this.filtersel.find(".validmsg");
    	this.$startDate.add(this.$endDate).datepicker({ dateFormat: "yy-mm-dd" });

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
            if(data.startDate){
        	    this.$startDate.val(data.startDate).siblings("a").removeClass("hidden");
            }
            if(data.endDate){
            	this.$endDate.val(data.endDate ).siblings("a").removeClass("hidden");
            }
            this.init_aclose();
        }
        this.$startDate.add(this.$endDate).off("change").on("change",this.proxy(function(e){
        		var $tar=$(e.currentTarget);
        		if($.trim($tar.val())===""){
        			$tar.siblings("a").addClass("hidden");
        		}else{
        			$tar.siblings("a").removeClass("hidden");
        			 this.init_aclose();
        		}
        }))
    },
    init_aclose:function(){
    	 this.$startDate.siblings("a").add(this.$endDate.siblings("a")).off("click").on("click",this.proxy(function(e){
         	e.preventDefault();
         	$(e.currentTarget).siblings("input").val("");
     		$(e.currentTarget).addClass("hidden");
         }))
    },
    filter_getdata: function () {  	
        var startDate = null,endDate;
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
                this.setting.propvalue = [{ "id": "[" + startDate + "T00:00:00Z TO NOW ]", "startDate": startDate, "type": "dateRange" }];
                this.setting.propshow = startDate;
            } else if ( endDate ){
                this.setting.propvalue = [{ "id": "[ * TO " + (new Date(endDate)).addDays(1).format("yyyy-MM-dd") + "T00:00:00Z }", "endDate": endDate, "type": "dateRange" }];
                this.setting.propshow = endDate;
            }else{
            	 this.setting.propvalue = [];
                 this.setting.propshow = "";
            }
        }
        else if(this.$currentSeasonRadioBox.is(":checked")){
            this.setting.propvalue = [{ "id": "currentSeason()", "name": "currentSeason()", "type": "currentSeason" }];
            this.setting.propshow = "currentSeason()";
        }else {
        	this.setting.propvalue = [];
            this.setting.propshow = "";
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
    		msg.push("开始日期格式错误");
    		$startDateGroup.addClass("has-error");
    	}else{
    		startDate = new Date(startDate);
    		$startDateGroup.removeClass("has-error");
    	}
    	
    	if(endDate && (new Date(endDate)) == "Invalid Date"){
    		result = false;
    		msg.push("结束日期格式错误");
    		$endDateGroup.addClass("has-error");
    	}else{
    		endDate = new Date(endDate);
    		$endDateGroup.removeClass("has-error");
    	}
    	
    	if(startDate && endDate && (startDate - endDate > 0)){
    		result = false;
    		msg.push("开始日期不能大于结束日期");
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
}, { usehtm: false, usei18n: false });
