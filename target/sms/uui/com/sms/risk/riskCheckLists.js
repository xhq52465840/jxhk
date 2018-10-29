//@ sourceURL=com.sms.risk.riskCheckLists
$.u.define('com.sms.risk.riskCheckLists', null, {
    init: function (options) {
        this._options = options;
    },
    afterrender: function () {
    	this.i18n = com.sms.risk.riskCheckLists.i18n;
    	this.dengerName = this.qid("dengerName");
    	this.dengerClassify = this.qid("dengerclassify");
    	this.startTime = this.qid("startTime");
    	this.endTime   =this.qid("endTime");
    	this.excel = this.qid("excel");
    	this.excel.on("click",this.proxy(this.exportExcel));
    	this.btnFilter = this.qid("btn_filter");
    	this.btnResetFilter = this.qid("btn_resetfilter");
        this.btnFilter.click(this.proxy(function () {
		    this.rule=[];
		    this.rule.push([{"key":"name","op":"like","value": $.trim(this.dengerName.val())||""}]);
			this.classify=this.dengerClassify.val() || "";
			this.rule.push([{"key":"created", "op":">=", "value": this.startTime.val() || ""}]);
			this.rule.push([{"key":"created", "op":"<=", "value": this.endTime.val() || ""}]);
	        this.dataTable.fnDraw();
        }));
        /*
         * 清除过滤
         */
        this.btnResetFilter.click(this.proxy(function () {
            this.clearForm(this.qid("filter"));
        }));
        this.startTime.datepicker({
            dateFormat: 'yy-mm-dd',
            timeFormat: 'hh:mm:ss',
            inline: true,
            onSelect: function(dateText, inst) {
              var theDate = new Date(Date.parse($(this).datepicker('getDate')));
              var dateFormatted = $.datepicker.formatDate('yy-mm-dd', theDate);
            }
          });
        this.endTime.datepicker({
            dateFormat: 'yy-mm-dd',
            timeFormat: 'hh:mm:ss',
            inline: true,
            onSelect: function(dateText, inst) {
              var theDate = new Date(Date.parse($(this).datepicker('getDate')));
              var dateFormatted = $.datepicker.formatDate('yy-mm-dd', theDate);
            }
          });
        this.btnResetFilter.click(this.proxy(function () {
            this.clearForm(this.qid("filter"));
        }));
        

    	this.dataTable = this.qid("datatable").dataTable({
            searching: false,
            serverSide: true,
            bProcessing: true,
            ordering: false,
            sDom: "t<ip>",
            "columns": [
                { "title": this.i18n.columns.riskSerialNumber, "mData":"num", "sWidth":"10%"},
                { "title": this.i18n.columns.dengerName, "mData":"name" },
                { "title": this.i18n.columns.dengerClassify, "mData": "category", "sWidth": "10%","render": this.proxy(function(data,type,full){
                	var riskClass="";
                	if(this.classify){
                		riskClass=this.classify=="threat"?"威胁":"差错";
                	}else{
                		riskClass="威胁";
                	}
                		return riskClass;
                }) },
                { "title": this.i18n.columns.classA, "mData":"category", "sWidth": "10%" },
                { "title": this.i18n.columns.classB, "mData":"classification", "sWidth": "12%" },
                { "title": this.i18n.columns.riskRatio, "mData":"riskTotal", "sWidth": "10%" },
                { "title": this.i18n.columns.addTime, "mData":"created", "sWidth": "10%" },
                { "title": this.i18n.columns.controlmeasure, "mData":"controls", "sWidth": "12%" },
                { "title": this.i18n.columns.handle, "mData":"id", "sWidth": "8%" }
               
            ],
            "oLanguage": { //语言
                "sSearch": this.i18n.search,
                "sLengthMenu": this.i18n.everPage+" _MENU_ "+this.i18n.record,
                "sZeroRecords": this.i18n.message,
                "sInfo": this.i18n.from+" _START_ "+this.i18n.to+" _END_ /"+this.i18n.all+" _TOTAL_ "+this.i18n.allData,
                "sInfoEmpty": this.i18n.withoutData,
                "sInfoFiltered": "("+this.i18n.fromAll+"_MAX_"+this.i18n.filterRecord+")",
                "sProcessing": ""+this.i18n.searching+"...",
                "oPaginate": {
                    "sFirst": "<<",
                    "sPrevious": this.i18n.back,
                    "sNext": this.i18n.next,
                    "sLast": ">>"
                }
            },
            "fnServerParams": this.proxy(function (aoData) {
            	$.extend(aoData,{
            		"tokenid":$.cookie("tokenid"),
            		"method":"stdcomponent.getbysearch",
            		"dataobject":this.classify ||"threat",
            		"rule":JSON.stringify(this.rule),
            		"columns": JSON.stringify( [{"data":"t.created"}] ),
                    "order": JSON.stringify( [{"column":0, "dir": "desc"}] ),
            		"search":JSON.stringify(aoData.search)
            	},true);
            }),
            "fnServerData": this.proxy(function (sSource, aoData, fnCallBack, oSettings) {
            	this.btnFilter.attr("disabled",true);
                $.u.ajax({
                    url: $.u.config.constant.smsqueryserver,
                    type:"post",
                    dataType: "json",
                    cache: false,
                    data: aoData
                },this.qid("datatable")).done(this.proxy(function (data) {
                    if (data.success) {
                        this.managable = data.data.manageable;
                    	if(this.rule && this.rule.length>0){
                    		this.dengerName.val(this.rule[0][0].value);
                    		this.startTime.val(this.rule[1][0].value);
                    		this.endTime.val(this.rule[2][0].value);
                    		this.dengerClassify.val(this.classify);
                    	}else if(!this.rule){
                    		this.dengerName.val("");
                    		this.startTime.val("");
                    		this.endTime.val("");
                    		this.dengerClassify.val("threat");
                    	};
                        fnCallBack(data.data);
                    }
                })).complete(this.proxy(function(){
                	this.btnFilter.attr("disabled",false);
                }));
            }),
            "aoColumnDefs": [
                 {
                    "aTargets": 5,
                    "mRender": this.proxy(function (data, type, full) {
                    	var title = 'P &nbsp :可能性 &nbsp&nbsp&nbsp S &nbsp :严重性';
                        if(full.colour === "G"){
                            return "<div class='descriptionTitle'  title='"+title+"'  style='padding: 2px; vertical-align:center; text-align:center; background-color: green'" + ">"+
                            "<span  title='"+title+"'> P : &nbsp"+(full.riskLevelP  ? full.riskLevelP: '')+"</span>&nbsp&nbsp"  +
                            "<span  title='"+title+"'> S : &nbsp"+(full.riskLevelS  ? full.riskLevelS: '')+"</span><br>"  +
                            "<span  title='"+title+"'>可接受</span>" +
                            "</div>";
                        }else if(full.colour === "Y"){
                            return "<div class='descriptionTitle'   title='"+title+"'  style='padding: 2px; vertical-align:center; text-align:center; background-color: yellow'" + ">"+
                            "<span  title='"+title+"'> P : &nbsp"+(full.riskLevelP  ? full.riskLevelP: '')+"</span>&nbsp&nbsp"  +
                            "<span  title='"+title+"'> S : &nbsp"+(full.riskLevelS  ? full.riskLevelS: '')+"</span><br>"  +
                            "<span  title='"+title+"'>控制后可接受</span>" +
                            "</div>";
                        }else if(full.colour === "R"){
                            return "<div class='descriptionTitle'  title='"+title+"'  style='padding: 2px; vertical-align:center; text-align:center; background-color: red'" + ">"+ 
                            "<span  title='"+title+"'> P : &nbsp"+(full.riskLevelP  ? full.riskLevelP: '')+"</span>&nbsp&nbsp"  +
                            "<span  title='"+title+"'> S : &nbsp"+(full.riskLevelS  ? full.riskLevelS: '')+"</span><br>"  +
                            "<span  title='"+title+"'>不可接受</span>" +
                            "</div>";           
                        }else{
                            return '';
                        }
                    })
                },
               {
                     "aTargets": 7,
                     "mRender": function (data, type, full) {
                    	 var html = ["<ul style='padding:0px'>"];
                    	 data && data.length>0  && $.each(data,function(index,item){
                    		 html.push("<li style='list-style:none'>"+item.number + "</li>");
                    	 })
                    	 html.push("</ul>");
                    	 return html.join('');
                    }
                },
                {
                    "aTargets": 8,
                    "mRender": this.proxy(function (data, type, full) {
                        if(this.managable){
                            return "<button type='button' style='padding-bottom: 2px; padding-left: 2px;' class='btn btn-link edit' mode='edit' datadata='"+JSON.stringify(full)+"' data-id=" + full.id + " data-dengerClassify=" + this.dengerClassify.val() + ">" + this.i18n.buttons.edit + "</button>";
                        }else{
                            return "";
                        }
                        
                        // if (full.managable) {
                        //     return "<button type='button' style='padding-bottom: 2px; padding-left: 2px;' class='btn btn-link edit' mode='edit' data-id=" + full.id + ">" + this.i18n.buttons.edit + "</button>";
                        // } else {
                        //     return "";
                        // }
                    })
                }
            ]
        });
    	this.dataTable.on('mouseover', '.descriptionTitle', this.proxy(this.title_show)).on('mouseout', '.descriptionTitle', this.proxy(this.title_back));
    	this.dataTable.on('mouseover', '.descriptionTitle span', this.proxy(function(event){
    		//event.stopPropagation();
    	})).on('mouseout', '.descriptionTitle span', this.proxy(function(event){
    		//event.stopPropagation(); 
    	}));
    	this.dataTable.off("click", "button.edit").on("click", "button.edit", this.proxy(function(e) {
            var $this = $(e.currentTarget),
                datadata = JSON.parse($this.attr("datadata"));
                id = parseInt($this.attr("data-id")),
                dengerClassify = $this.attr("data-dengerClassify");
            var mode = $this.attr('mode') || '';
            if (!this.riskGradeDialog) {
                var clz = $.u.load("com.sms.risk.riskGradeDialog");
                this.riskGradeDialog = new clz(this.$.find("div[umid=riskGradeDialog]"), {
                    mode: mode,
                    datadata : datadata,
                    dengerClassify: dengerClassify
                });
            };
            this.riskGradeDialog.override({
                "fresh": this.proxy(function(riskLevel) {
                    $.u.ajax({
                        url: $.u.config.constant.smsmodifyserver,
                        type: "post",
                        data: {
                            tokenid: $.cookie("tokenid"),
                            // method: "updateRiskTwoLevels",
                            // id: id,
                            // riskLevelP: riskLevel.possibility,
                            // riskLevelS: riskLevel.severity
                            method: "stdcomponent.update",
                            dataobject: riskLevel.dengerClassify,
                            dataobjectid: id,
                            obj: JSON.stringify({"riskLevelP":riskLevel.possibility,"riskLevelS":riskLevel.severity})
                        },
                        dataType: "json"
                    }, this.riskGradeDialog.riskGradeDialog.parent()).done(this.proxy(function(response) {
                        if (response.success) {
                            // this.freshTable();
                            this.dataTable.fnDraw();
                            $.u.alert.success("更新成功！",3000);
                            this.riskGradeDialog.riskGradeDialog.dialog("close");

                        }
                    }));
                })
            });
            this.riskGradeDialog.open({
                mode: mode,
                id: id ,
                dengerClassify :dengerClassify,
                datadata : datadata
            });

        }))
    },
    
    clearForm: function ($target) {
        $target.find("input,textarea,select").each(function () {
            switch (this.type) {
                case "password":
                case "text":
                case "textarea":
                    $(this).val("");
                case "checkbox":
                case "radio":
                    $(this).prop("checked", false);
                    break;
                case "select-one":
                case "select-multiple":$(this).val("threat");
                   break;
                    // no default
            }
        });
    },
    /**
     * 鼠标悬停事件处理
     */
    title_show:function(e){
    	console.log(1);
    	e.preventDefault();
    	e.stopPropagation(); 
  	//获取当前的x坐标值
  	    function pageX(elem){
  	        return elem.offsetParent?(elem.offsetLeft+pageX(elem.offsetParent)):elem.offsetLeft;
  	    };
  	  //获取当前的Y坐标值
  	    function pageY(elem){
  	        return elem.offsetParent?(elem.offsetTop+pageY(elem.offsetParent)):elem.offsetTop;
  	    };
  	    function split_str(string,words_per_line) { 
  	        var output_string = string.substring(0,1);  //取出i=0时的字，避免for循环里换行时多次判断i是否为0 
  	        for(var i=1;i<string.length;i++) {      
  	            if(i%words_per_line == 0) {         
  	                output_string += "<br/>";       
  	            }       
  	            output_string += string.substring(i,i+1);   
  	        }   
  	        return output_string;
  	    };
  	    this.title_value = ''; 
  	    var span=e.target;
  	    var div=$(".title_show")[0];
  	    this.title_value = span.title;   
  	    div.style.left = pageX(span)+90+'px';
  	    div.style.top = pageY(span)+'px';
  	    var words_per_line = 40;     //每行字数 
  	    var title =  split_str(span.title,words_per_line);  //按每行25个字显示标题内容。    
  	    div.innerHTML = title;
  	    div.style.display = ''; 
  	    span.title = '';        //去掉原有title显示。
  	  
    },
    title_back:function(e){
  	  var span=e.target; 
  	    var div=$(".title_show")[0]; 
  	    span.title = this.title_value;   
  	    div.style.display = "none";
  	    
    },
    /**
     * @int
     */
    exportExcel:function(e){
        e.preventDefault();
        this.rule=[];
	    this.rule.push([{"key":"name","op":"like","value": $.trim(this.dengerName.val())||""}]);
		this.classify=this.dengerClassify.val() || "";
		this.rule.push([{"key":"created", "op":">=", "value": this.startTime.val() || ""}]);
		this.rule.push([{"key":"created", "op":"<=", "value": this.endTime.val() || ""}]);
        var form = $("<form/>");
        var query=null;
        var action=null;
		query = JSON.parse(window.decodeURIComponent(JSON.stringify([
		                                                             [
		                                                              '编号',
		                                                              '危险源名称',
		                                                              '分类',
		                                                              '一级分类',
		                                                              '二级分类',
		                                                              '风险等级',
		                                                              '入库时间',
		                                                              '控制措施'
		                                                          ],
		                                                          [
		                                                              'num',
		                                                              'name',
		                                                              'category',
		                                                              'category',
		                                                              'classification',
		                                                              'riskTotal',
		                                                              'created',
		                                                              'controls'
		                                                          ]
		                                                      ])
		                                                      ));
		var data_C=[{name:"tokenid",data:$.cookie("tokenid")},
		            {name:"method",data:this.dengerClassify.val()=="threat" ? "exportThreatsToExcel" :"exportErrorsToExcel"},
		            {name:"dataobject",data:this.dengerClassify.val()},
		            {name:"columns",data:JSON.stringify([{"data":"t.created"}])},
		            {name:"order",data:JSON.stringify([{"column":0,"dir":"desc"}])},
		            {name:"rule",data:JSON.stringify(this.rule) || []},
		            {name:"url",data:window.location.host + window.location.pathname + window.location.search},
		            ];
	
		 var input = document.createElement("input");  
			  input.type = "hidden";  
			  input.name ="titles";  
			  input.value = JSON.stringify(query);  
			  form.append(input); 
		 for(var i in data_C){  
			 var input = document.createElement("input");  
			  input.type = "hidden";  
			  input.name = data_C[i].name;  
			  input.value = data_C[i].data;  
			  form.append(input); 
			 }
        form.attr({
            'style': 'display:none',
            'method': 'post',
            'target': '_blank',
            'action':$.u.config.constant.smsqueryserver
        });  
        form.appendTo('body').submit().remove();
    },
    destroy: function () {
        this._super();
    }
}, { usehtm: true, usei18n: true });

com.sms.risk.riskCheckLists.widgetjs = ['../../../uui/widget/jqurl/jqurl.js',
                                      '../../../uui/widget/jqdatatable/js/jquery.dataTables.js', 
                                      '../../../uui/widget/jqdatatable/js/dataTables.bootstrap.js'];
com.sms.risk.riskCheckLists.widgetcss = [{ path: '../../../uui/widget/jqdatatable/css/jquery.dataTables.css' }, 
                                       { path: '../../../uui/widget/jqdatatable/css/dataTables.bootstrap.css' }];
