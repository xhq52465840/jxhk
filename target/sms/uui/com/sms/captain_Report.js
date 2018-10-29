(function() {
  //解析url的传参，姓名username、邮件email、手机reporterPhone
  var ulrParam = $.urlParam();
    occurDate = $("#occurDate").val();
    urlfield = ["email", "reporterPhone"];
    var mode=false;
    if($.urlParam()){
    	var email=JSON.parse($.urlParam().json).email;
        var telephoneNumber=JSON.parse($.urlParam().json).telephoneNumber;
        $("#email").val(email);
        $("#reporterPhone").val(telephoneNumber);
    };
  $.each(ulrParam, function(k, v) {
    if ($.inArray(k, urlfield) > -1) {
      $('#' + k).val(v).parent().parent().hide();
    }
  });
  
  if(navigator.userAgent.match(/iPad/i)!=null){
	  $("#attachment").hide();
  }else{
	  $("#attachment").show();
  }
  var staffReportWidget = {
    options:{
      tag:{},
      i18n: {
        zh: {
          upload:'上传附件',
          messages: {
            unitIsRequired: '所属部门不能为空',
           /* dealDepartmentIsRequired: '所属处室不能为空',*/
            occurDateIsRequired: '发生日期不能为空',
            summaryIsRequired: '标题不能为空',
            descriptionIsRequired: '描述不能为空',
            emailFormatError: '邮箱格式不正确'
          },
          datepicker: {
            closeText: '关闭',
            prevText: '&#x3C;上月',
            nextText: '下月&#x3E;',
            currentText: '今天',
            monthNames: ['一月', '二月', '三月', '四月', '五月', '六月',
              '七月', '八月', '九月', '十月', '十一月', '十二月'
            ],
            monthNamesShort: ['一月', '二月', '三月', '四月', '五月', '六月',
              '七月', '八月', '九月', '十月', '十一月', '十二月'
            ],
            dayNames: ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'],
            dayNamesShort: ['周日', '周一', '周二', '周三', '周四', '周五', '周六'],
            dayNamesMin: ['日', '一', '二', '三', '四', '五', '六'],
            weekHeader: '周',
            dateFormat: 'yy-mm-dd',
            firstDay: 1,
            isRTL: false,
            showMonthAfterYear: true,
            yearSuffix: '年'
          }
        },
        en: {
          upload: 'Upload',
          messages: {
            unitIsRequired: 'This field is required.',/*
            dealDepartmentIsRequired: 'This field is required.',
            occurDateIsRequired: 'This field is required.',
            summaryIsRequired: 'This field is required.',*/
            descriptionIsRequired: 'This field is required.',
            emailFormatError: 'The email address is not valid.'
          },
          datepicker: {
            closeText: 'Done',
            prevText: 'Prev',
            nextText: 'Next',
            currentText: 'Today',
            monthNames: ['January', 'February', 'March', 'April', 'May', 'June',
              'July', 'August', 'September', 'October', 'November', 'December'
            ],
            monthNamesShort: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
              'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
            ],
            dayNames: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
            dayNamesShort: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
            dayNamesMin: ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'],
            weekHeader: 'Wk',
            dateFormat: 'dd/mm/yy',
            firstDay: 1,
            isRTL: false,
            showMonthAfterYear: false,
            yearSuffix: ''
          }
        }
      }
    },
    init: function() {
      this.initI18n();
      this.initForm();
      this.bindEvent();
      $(".uploadify-queue").addClass("hidden");
      $.datepicker._getInst = function(target) {
	      try { 
		   if ('object' === target.nodeName.toLowerCase()) {
		      return false; 
	           } 
	      return $.data(target, 'datepicker'); 
	      } 
	      catch (err) { 
	           throw 'Missing instance data for this datepicker'; 
	      } 
	   };
    },
    /**
     * @title 初始化i18n
     */
    initI18n: function(){
      var locale = $.cookie('locale') || 'zh';
      this.options.tag = this.options.i18n[locale];
      var datepickerTag = this.options.tag.datepicker;
      setTimeout(function(){
        $.datepicker.setDefaults(datepickerTag);
      }, 700);
      
    },
    /**
     * @title 初始化select2、datePicker、uploadify
     */
    initForm: function(){
      $("form:first").validate({
        rules: {
          unit: "required",/*
          dealDepartment: "required",*/
          occurDate: "required",
          summary: "required",
          description: "required",
          hopeMeasure: "required",
          email: {
            email: true
          }
        },
        messages: {
          unit: this.options.tag.messages.unitIsRequired,
         /* dealDepartment: this.options.tag.messages.dealDepartmentIsRequired,*/
          occurDate: this.options.tag.messages.occurDateIsRequired,
          summary: this.options.tag.messages.summaryIsRequired,
          description: this.options.tag.messages.descriptionIsRequired,
          email: {
            email: this.options.tag.messages.emailFormatError
          }
        },
        errorClass: "text-danger text-validate-element",
        errorElement: "div"
      });

      // 所属部门
      $("#unit").select2({
    	placeholder:$.cookie('locale') === 'en' ? 'Please fill in your department' : "请填写报告人所在部门",  
        width: "100%",
        ajax: {
          url: "/sms/query.do",
          type: "post",
          dataType: "json",
          data: function(term, page) {
            return {
              method: "stdcomponent.getbysearch",
              dataobject: "unit",
              rule: JSON.stringify([
                [{
                  "key": $.cookie('locale') === 'en' ? 'nameEn' : "name",
                  "op": "like",
                  "value": $.cookie('locale') === 'en' ? 'Flight Department' : "飞行部",
                }]
              ]),
              start: (page - 1) * 10,
              length: 10,
              nologin: "Y"
            };

          },
          results: function(response, page) {
            return {
              results: response.data.aaData,
              more: response.data.iTotalRecords > (page * 10)
            };
          }
        },
        formatSelection: function(item) {
          return item.nameByLanguage;
        },
        formatResult: function(item) {
          return item.nameByLanguage;
        }
      });

      //所属处室
      $("#dealDepartment").select2({
    	placeholder:$.cookie('locale') === 'en' ? 'Please fill in your office' : "请填写上报人所在处室",
        width: "100%",
        minimumResultsForSearch: -1,
        ajax: {
          url: "/sms/query.do",
          type: "post",
          dataType: "json",
          data: function(term, page) {
            return {
              method: "getByUnitforEm",
              dataobject: "organization",
              unitId: $("#unit").select2("val"),
              nologin: "Y"
            };
          },
          results: function(response, page) {
            return {
              results: response.data || []
            };
          }
        },
        formatSelection: function(item) {
          return item.nameByLanguage;
        },
        formatResult: function(item) {
          return item.nameByLanguage;
        }
      });

      // 发生日期
      $("#occurDate").datepicker({
        dateFormat: 'yy-mm-dd',
        timeFormat: 'hh:mm:ss',
        maxDate: 0,
        inline: true,
        onSelect: function(dateText, inst) {
          var theDate = new Date(Date.parse($(this).datepicker('getDate')));
          var dateFormatted = $.datepicker.formatDate('yy-mm-dd', theDate);
        }
      });
      
      // 附件
      $("#file").uploadify({
        'auto': true,
        'swf': '../../uui/widget/uploadify/last/uploadify.swf',
        'uploader': "/sms/modify.do",
        'fileTypeDesc': 'doc', //文件类型描述
        'fileTypeExts': '*.*', //可上传文件格式 *.doc;*.docx;*.rar;*.xls;*.ppt;*.ppt;*.pdf;*.jpg;*.bmp;*.png;*.xlsx;*.pptx;
        'removeCompleted': true,
        'buttonText': this.options.tag.upload, //按钮上的字
        'cancelImg': '../../uui/widget/uploadify/last/uploadify-cancel.png',
        'height': 25, //按钮的高度和宽度
        'width': 70,
        'progressData': 'speed',
        'method': 'get',
        'removeTimeout': 3,
        'successTimeout': 99999,
        'multi': false, //单个上传
        'fileSizeLimit': '10MB',
        'queueSizeLimit': 999,
        'simUploadLimit': 999,
        'onQueueComplete': function(queueData) {

        },
        'onUploadStart': function(file) {
          var data = {
            method: "uploadFiles",
            sourceType: 3,
            attachmentType: 0,
            nologin: "Y"
          };
          $("#file").uploadify('settings', 'formData', data);
          $(".uploadify-queue").removeClass("hidden");
        },
        'onUploadSuccess': function(file, data, response) {
          if (data) {
            $(".uploadify-queue").addClass("hidden");
            data = JSON.parse(data);
            if (data.success) {
            	 fileId = data.data.aaData[0].id;
              $.each(data.data.aaData, function(idx, file) {
                $("<div>" + file.fileName + "<span class='glyphicon glyphicon-trash' style='cursor:pointer;'></span></div>").appendTo($("#filelist")).data("fileid", file.id);
              });
            } else {
              alert(data.reason);
            }
          }
        }
      });
    },
    /**
     * @title 绑定事件
     */
    bindEvent: function(){
      $("#reporterPhone").on("blur",this._on_phone);
      $("#description").on("blur",this._on_description);
      $("#unit").on("select2-selecting", this._on_unit_selecting);
      //$("#dealDepartment").on("select2-opening", this._on_office_opening);
      $(".btn-addflight").on("click", this._on_addflight_click.bind(this));
      $("#btn-submit").on("click", this._on_submit_click.bind(this));
      $("#table-flight-body").on("click", "td.del", this._on_removeflight_click);
      $("#filelist").on("click", ".glyphicon-trash", this._on_deletefile_click);
      
    },
    /**
     * @title 获取表单的值
     */
    _getFormData: function(){
    	   /*var val=$("#description").val();
		   val=val.replace(/\n/g,'<br>');
		   $("#description").val(val);*/
      var data = {
        unit: parseInt($("#unit").select2("val")),/*
        dealDepartment: $("#dealDepartment").select2("val"),*/
        occurDate: $("#occurDate").val(),
        /*occurPlace: $("#occurPlace").val(),*/
        summary: $("#summary").val(),
       
        description: $("#description").val(),
        /*measure: $("#hopeMeasure").val(),*/
        reporterPhone: $.trim($("#reporterPhone").val()),
        email: $("#email").val(),
        mtype: 'PC',
        source: $.urlParam().source,
        userName: $("#username").val(),
      };

      data.flightInfos = (function() {
        var flightInfos = new Array();
        for (var i = 0; i < $(".flightID").length; i++) {
          flightInfos.push({
            "flightInfo": $(".flightID").eq(i).attr("flightID"),
            flightPhase: $(".phaseID").eq(i).attr("phaseID")
          });
        }
        return flightInfos;
      })();

      data.attachments = (function() {
        var attachments = [];
        $("#filelist > div").each(function(idx, item) {
          attachments.push({
            "attachmentId": $(item).data().fileid
          });
        });
        return attachments;
      })();
      
      return data;
    },
    /**
     * @title “所属部门”的下拉选择事件
     * @param {event object} e - 鼠标对象
     */
    _on_unit_selecting: function(e){
      $("#dealDepartment").select2("val", null);
    },
    /**
     * @title “所属处室”的下拉选择事件
     * @param {event object} e - 鼠标对象
     */
    _on_office_opening: function(e){
      if(!$("#unit").select2("val")){
        $("#unit").select2('open');
        e.preventDefault();
      }
    },
    /**
     * @title 添加航班
     */
    _on_addflight_click: function(){
    	if(this.validated() && this.validateFlight()){
    		if (!this.flyDialog){
    	        $.u.load("com.sms.flyDialog");
    	        this.flyDialog = new com.sms.flyDialog($("div[umid=fly]"));
    	        this.flyDialog.override({
    	          addFlight: function(date, flightID, flightNumber, phaseID, flightPhase) {     
                  var $occurDate = $("#occurDate");
    	            $("#table-flight-body").append('<tr>' + '<td>' + date + '</td>' + '<td class="flightID" flightID="' + flightID + '">' + flightNumber + '</td>' + '<td class="phaseID" phaseID="' + phaseID + '">' + flightPhase + '</td>' + '<td class="del operate-tool" ><span class="glyphicon glyphicon-trash"></span></td>' + '</tr>');
    	            $('#table-flight-header').removeClass('hidden');
                  if(!$.trim($occurDate.val())){
                    $occurDate.val(date);
                  }
    	            $occurDate.attr("disabled",true);
    	            this.flyDialog.flyDialog.dialog("close");
    	          }.bind(this)
    	          
    	        });
    	      }
    	      this.flyDialog.open($("#occurDate").val() || (new Date()).format("yyyy-MM-dd"));
    	}else{
    		return false;
    	}
      
    },
    /**
     * @title 删除航班
     */
    _on_removeflight_click:function(){
      $(this).parent().remove();
      if($('#table-flight-body').children().length < 1){
        $("#occurDate").attr('disabled', false);
        $('#table-flight-header').addClass('hidden');
      }
      this.deleteFlight();
    },
    /**
     * @tilte 验证航班数量
     */
    validateFlight:function(){
   	 if($("#table-flight-body").find("td").length>3){
		 return false;
	 }else{
		return true;
	 }
 },
 /**
  * @删除航班验证
  */
 deleteFlight:function(){
	 
 },
    //时间验证
    validated:function(){
             var d = new Date();
             var strDate = getDateStr(d);
             var d2 = new Date($("#occurDate").val());
             if (d2 > d) {
                 alert("填写的日期必须小于当前日期.");
                 return false;
             }else{
            	 return true; 
             }
         function getDateStr(date) {
             var month = date.getMonth() + 1;
             var strDate = date.getFullYear() + '-' + month + '-' + date.getDate();
             return strDate;
         };
    },
    /**
     * 电话号码验证
     */
    _on_phone:function(){
    var re=/[a-zA-Z~!@#$%^&<'>'{};.`()_（）]/;
	var zhwen=/[\u4e00-\u9fa5]/;//驗證中文
	var val=$("#reporterPhone").val();
		if(val!=null){
			if(re.test(val)){
				mode=false;
				if($.cookie('locale')=="zh"){         //员工报告中英文电话号码错误 提示
					$(".warm").html("手机号码格式不正确");
				}else if($.cookie('locale')=="en"){
					$(".warm").html("Incorrect phone number format");
				}else{
					$(".warm").html("手机号码格式不正确");
				}
				$("#reporterPhone").val("");
		}else{
			if(zhwen.test(val)){
        		mode=false;
        		if($.cookie('locale')=="zh"){         //员工报告中英文电话号码错误 提示
					$(".warm").html("手机号码格式不正确");
				}else if($.cookie('locale')=="en"){
					$(".warm").html("Incorrect phone number format");
				}else{
					$(".warm").html("手机号码格式不正确");
				}
        		$("#reporterPhone").val("");
        	}else{
        		mode=true;
        		$(".warm").html("");
        	}
		}
		}
    },
    /**
     * @title 航班验证
     */  
     flightInfos:function(){
    	 if($("#table-flight-body").find("td").length<2){
    		 $.cookie('locale')=="en" ? $(".flightWarm").html("Flight information cannot be null") :$ (".flightWarm").html("航班信息不能为空");
    		 return false;
    	 }else{
    		 $(".flightWarm").html("");
    		 return true;
    	 }
     },
    /**
     * 详细描述IE字数限制
     */
    _on_description:function(){
    	if($("#description").val().length >=1000) {
    		$("#description").val($("#description").val().substr(0,1000));
  	  }
    },
    /**
     * @title 提交
     * @param {event object} e - 鼠标对象
     */
    _on_submit_click: function(e){
    	e.preventDefault();
    	var txt=$.cookie('locale') === 'en' ? 'Do you confirm submission?' : "您确认提交吗？";
    	var mthis=this;
		var option = {
			title: "",
			btn: parseInt("0011",2),
			onOk: function(){
				 mthis._on_phone();
	    	      var language=document.title;
	    	      var languagePrompt='';
	    	      var message="";
	    	      var error="";
	    	      var zhwen=/[\u4e00-\u9fa5]/;//驗證中文
	    	      if(zhwen.test(language)){
	    	   	   languagePrompt="感谢您的报告,我们会尽快处理!";
	    	   	   message="数据提交中";
	    	   	   error="上报错误请联系管理员";
	    	      }else{
	    	   	   languagePrompt="Thank you for your report, we will as soon as possible!";
	    	   	   message="In the data submitted";
	    	   	   error="Report an error please contact your administrator";
	    	      }
	    	      if (mthis.flightInfos() && mthis.validated()&&$("form:first").valid()&& mode) {
	    	        var param = {
	    	          method: "submitAircraftCommanderReport",
	    	          activity: JSON.stringify(mthis._getFormData())
	    	        };
	    	        var token = $.cookie('tokenid');
	    	        if (token) {
	    	          param.tokenid = token;
	    	        } else {
	    	          param.nologin = "Y";
	    	        }
	    	        $.blockUI({
	    	          message: message
	    	        });
	    	        $.ajax({
	    	          url: "/sms/modify.do",
	    	          type: "post",
	    	          data: param,
	    	          dataType: "JSON"
	    	        }).done(function(response) {
	    	          if (response.success) {
	    	            alert(languagePrompt);
	    	            window.close();
	    	          } else {
	    	            alert(response.reason);
	    	          }
	    	        }).fail(function(jqXHR, errorText, errorThrown) {
	    	          alert(error);
	    	        }).complete(function() {
	    	          $.unblockUI();
	    	        });
	    	      }
	    	
			},
			onCancel:function(){
			}
		}
		window.wxc.xcConfirm(txt, window.wxc.xcConfirm.typeEnum.confirm,option);
    },
    /** 
     * @title 删除附件
     * @param {event object} e - 鼠标对象
     */
    _on_deletefile_click: function(e){
      $(e.currentTarget).parent().remove();
    }

  }

  staffReportWidget.init();
})();