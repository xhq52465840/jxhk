//@ sourceURL=com.audit.qualification.tablehtml
$.u.define("com.audit.qualification.tablehtml", "com.sms.plugin.search.baseprop",{
	//copy from com.sms.plugin.search.dateProp
   table_html: function (data, type, row, meta) {
		return	"<button type='button' class='btn btn-link edit' data='"+JSON.stringify(row)+"'>编辑</button>"
  			+  "<button type='button' class='btn btn-link delete' data='"+JSON.stringify(row)+"'>删除</button>";
			},
	// filter段
    filter_html: function () { 
    	return  '<div class="filter-layer">'
				+ '</div>';
    },
    filter_render: function (setting,toolsel) {},
    filter_getdata: function () {},
    filter_setdata:function(){
    	
    },
    filter_valid: function(){},
    
    filter_table:function(){
        this._DATATABE_LANGUAGE = { //语言
                "sSearch": this.i18n.search,
                "sZeroRecords": "抱歉未找到记录",
                "sInfoEmpty": "没有数据",
                "sProcessing": ""+this.i18n.searching+"...",
            };
        
        
        
        
    	//整改通知单
    	this.dataTable = this.qid("datatable").dataTable({
            searching: false,
            serverSide: true,
            bProcessing: true,
            ordering: true,
            pageLength:10,
            "sDom":"tip",
            "columns": [
                { "title": "整改编号" ,"mData":"improveNoticeNo"},
                { "title": "来源" ,"mData":"source"},
                { "title": "签发单位" ,"mData":"operator"},
                { "title": "责任单位" ,"mData":"improveUnit"},
                { "title": "检查地点" ,"mData":"address"},
                { "title": "状态" ,"mData":"status"},
                { "title": "更新时间" ,"mData":"lastUpdate"},
                { "title": "回复期限" ,"mData":"replyDeadLine"}
            ],
            "oLanguage": {
                "sSearch": "搜索:",
                "sLengthMenu": "每页显示 _MENU_ 条记录",
                "sZeroRecords": "抱歉未找到记录",
                "sInfo": "从 _START_ 到 _END_ /共 _TOTAL_ 条数据",
                "sInfoEmpty": "没有数据",
                "sInfoFiltered": "(从总共_MAX_条记录中过滤)",
                "sProcessing": "检索中...",
                "oPaginate": {
                    "sFirst": "<<",
                    "sPrevious": "上一页",
                    "sNext": "下一页",
                    "sLast": ">>"
                }
            },
            "fnServerParams": this.proxy(function (aoData) {}),
            "fnServerData": this.proxy(function (sSource, aoData, fnCallBack, oSettings) {}),
            "aoColumnDefs": [
                {
                    "aTargets": 0,
                    "mRender": function (data, type, full) {
                    	var html = "";
                    	if(full.status && full.status.name == "未下发"){
                    		html = '<a href="RectificationForm.html?id='+full.id+'&unit='+full.operator.id+'" target="_blank">'+(data||'')+'</a>';
                    	}else if(full.status && full.status.name == "下发"){
                    		html = "<a href='RectificationFormSubmit.html?id="+full.id +"' target='_blank' >" + (data||"") + "</a>";
                    	}
                    	 return html;
                    }
                },
                {
                    "aTargets": 1,
                    "mRender": function (data, type, full) {
                    	 return data?data.name:"";
                    }
                }
            ]
        });
    
    	//
    	 this.dataTable_one = this.qid("resumetable").dataTable({
             searching: false,
             serverSide: false,//服务端处理分页
             bProcessing: false,//当datatable获取数据时候是否显示正在处理提示信息。
             'bFilter': false,  //是否使用内置的过滤功能
             'bPaginate': true,  //是否分页。
             "sPaginationType": "bootstrap", //分页样式   full_numbers
             'bLengthChange': true, //是否允许自定义每页显示条数.
            // "sAjaxSource": "/kuiyu.net/article/getarticle",
             //"sUrl": "@theme/js/jquery.dataTable.cn.txt",
          /*   "aoColumns": [
 						{ "sClass": "center", "sName": "Id" },
 						{ "sClass": "center", "sName": "Title1" },
 			
 						{ //自定义列
 						"sName": "Id",
 						"sClass": "center",
 						"bSearchable": false,
 						"bStorable": false,
 						"fnRender": function (obj) {
 							return '<a class="ajaxify" href=\"/admin/Article/edit?Id=' + obj.aData[0] + '\">编辑</a> ' + ' <a href=\"#\" onclick=\"DeleteArticle('+obj.aData[0]+')\">删除</a>';
 						}
 						}
 						],
    	 */
             ordering: false,
             bRetrieve: true,
             pageLength : 10,
             'iDisplayLength':13, //每页显示10条记录
             "aaData":data.personal||[],
             "sDom":"t<i>",
             "columns":  [
                      { "title": "日期" ,"mData":"eventDate", "class":"","sWidth":"30px"},
                      { "title": "所在单位和部门" ,"mData":"department", "class":"","sWidth":"30%"},
                      { "title": "担任职务" ,"mData":"content", "class": "","sWidth":"25%"},
                      { "title": "操作" ,"mData":"id","sWidth":"15%"}
                      ],
           
             "bInfo":false,
             "bDeferRender":false,
             "oLanguage": this._DATATABE_LANGUAGE,//语言国际化
             "aoColumnDefs": [
                  {
                      "aTargets": 0,
                      "orderable":false,
                      "sClass": "eventDate-td",
                     "sContentPadding": "mmm",
                     "mDataProp": "engine", 
                      "sDefaultContent": "--",//允许给列值一个默认值，只要发现null值就会显示默认值
                      "mRender": function (data, type, full) {
                             return data;
                      }
                  },
                  {
                      "aTargets": 1,
                      "sDefaultContent": "--",
                      "sClass": "department-td",
                      "orderable":false,
                      "mRender": function (data, type, full) {
                    	       return  data;
                      }
                  }
             ],
             "rowCallback": this.proxy(function(row, data, index){
            	 
             })
         });
    	 
    	 
    	 this.dataTable_four = this.qid("datatablefour").dataTable({
             searching: false,
             serverSide: true,
             bProcessing: true,
             ordering: false,
             bInfo : true,
             iDisplayLength:1,
             pageLength:30,
             sDom: "t<ip>",
             "columns": [
                 { "title": "安监机构" ,"mData":"unit"},
                 { "title": "专业名称" ,"mData":"profession"},
                 { "title": "用户数" ,"mData":"users", "sWidth": "10%" },
                 { "title": "用户" ,"mData":"users", "sWidth": "35%"},
                 { "title": "操作","mData":"id", "sWidth": 150 }
             ],
     /*        "oLanguage": { //语言
                 "sSearch": "搜索:",
                 "sLengthMenu":"每页显示 _MENU_ 条记录",
                 "sZeroRecords": "抱歉未找到记录",
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
             },*/
             "oLanguage": {
                 "sSearch": "搜索:",
                 "sLengthMenu": "每页显示 _MENU_ 条记录",
                 "sZeroRecords": "抱歉未找到记录",
                 "sInfo": "从 _START_ 到 _END_ /共 _TOTAL_ 条数据",
                 "sInfoEmpty": "没有数据",
                 "sInfoFiltered": "(从总共_MAX_条记录中过滤)",
                 "sProcessing": "检索中...",
                 "oPaginate": {
                     "sFirst": "<<",
                     "sPrevious": "上一页",
                     "sNext": "下一页",
                     "sLast": ">>"
                 }
             },
             "fnServerParams": this.proxy(function (aoData) {
             	var unit,profession,name;
             	if($.trim(this.qid("securityagencies").val())){
             		unit=$.trim(this.qid("securityagencies").val());
             	}
             	if($.trim(this.qid("professional").val())){
             		profession=$.trim(this.qid("professional").val());
             	}
             	if($.trim(this.qid("username").val())){
             		name=$.trim(this.qid("username").val())
             	}
             	$.extend(aoData,{
             		"tokenid":$.cookie("tokenid"),
             		"method":"getProfessionUserBySearch",
             		"unit":unit,
             		"profession":profession,
             		"name":name
             	},true);
             	delete aoData.columns;
             	delete aoData.search;
             	delete aoData.order;
             }),
             "fnServerData": this.proxy(function (sSource, aoData, fnCallBack, oSettings) {
             	$.u.ajax({
                     url: $.u.config.constant.smsqueryserver,
                     type:"post",
                     dataType: "json",
                     cache: false,
                     async:false,
                     data: aoData
                 }).done(this.proxy(function (data) {
                     if (data.success) {
                         fnCallBack(data.data);
                     	//data.data.aaData?this.dataunit(data.data.aaData):"";
                     }
                 })).fail(this.proxy(function (jqXHR, errorText, errorThrown) {

                 }));
             
             }),
             "aoColumnDefs": [
                              
                 {
                     "aTargets": 2,
                     "mRender": function (data, type, full) {//yonghushu
                     return "<a href='#' class='btn btn-link viewusers'  data='"+JSON.stringify(full)+"'>"+(data ? data.length : "0")+"</a>";

                     }
                 },
                 {
                     "aTargets": 3,
                     "mRender": function (data, type, full) {//yonghu
                     	var htmls=["<ul style='padding-left:15px;'>"];
                 		full.users && $.each(full.users,function(idx,user){
                 			htmls.push("<li userid="+user.userId+">"+user.userFullName+"</li>");
                 		});
                 		htmls.push("</ul>");
                         return htmls.join("");
                     }
                 },
                 {
                     "aTargets": 4,
                     "mRender": function (data, type, full) {
                    
                     	return  "<button type='button' class='btn btn-link editmembers' data='" + JSON.stringify(full) + "'>" + com.audit.professionalusers.professionalusers.i18n.editMember + "</button>"; 
       
                     }
                 }
             ]
         });
    },
    
    
    
    
    
    destroy:function(){
    	this.$startDate.add(this.$endDate).datepicker("destroy");
    	this.filtersel.remove();
    	this.afterDestroy();
    	this._super();
    }
}, { usehtm: false, usei18n: false });
