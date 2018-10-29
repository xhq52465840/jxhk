//@ sourceURL=com.audit.validate.riskvalidate
$.u.define('com.audit.validate.riskvalidate', null, {
  init: function() {
    this._filtertemplate = "<li data-id='#{propid}' class='criteria-item'>" +
      "<button type='button' data-id='#{propid}' data-plugin='#{propplugin}' class='criteria-selector btn btn-subtle'>" +
      "<span class='criteria-wrap'><span class='fieldLabel'>#{propname}：</span><span class='fieldValue'>#{propshow}</span><span class='caret' style='margin-left: 5px;'></span></span>" +
      "</button>" +
      "<a href='#' class='remove-filter' title='移除条件' tabindex='-1'><span class='glyphicon glyphicon-remove-sign criteria-close'></span></a></li>";

    this._userFilter = null;
    this._cmd = $.urlParam().cmd; // 控制选中选项卡的顺序
    if($.urlParam().title && $.urlParam().id){
    	this.status=1;
    	this.description=$.urlParam().title;
    	this.id=$.urlParam().id;
    }
    this._statusMap = {
      operation:['待执行', '待执行(审核拒绝)','待执行(验证拒绝)'],    
      confirm: ['待验证'],
      approval: ['待审核']
    };
  },
  afterrender: function(bodystr) {
    this.i18n = com.audit.validate.riskvalidate.i18n;
    this.$operationCount=this.qid('operation-count');
    this.$confirmCount = this.qid('confirm-count');
    this.$approvalCount = this.qid('approval-count');
    this.$viewtable = this.qid("viewtableone");
    this.$operationDataTable=this.qid('operationDataTable');
    this.$verificationDataTable = this.qid("verificationDataTable");
    this.$approvalDataTable = this.qid("approvalDataTable");
    this.$batchBtnComfirm = this.qid("batch-btn-comfirm");
    this.$batchBtnApproval = this.qid("batch-btn-approval");
    this.$batchBtnReject = this.qid("batch-btn-reject");
    this.$batchBtn_valite_Reject = this.qid("valite-reject");
    this._ajax("riskValidateFilter.json", {}, this.$, {}, this.proxy(function(result) {
      this._userFilter = result.data;
      this._initnav();
    }));
    /*鼠标悬停事件*/
    this.$viewtable.on('mouseover', '.descriptionTitle', this.proxy(this.title_show)).on('mouseout', '.descriptionTitle', this.proxy(this.title_back));
    this.$operationDataTable.on('mouseover', '.descriptionTitle', this.proxy(this.title_show)).on('mouseout', '.descriptionTitle', this.proxy(this.title_back));
    this.$verificationDataTable.on('mouseover', '.descriptionTitle', this.proxy(this.title_show)).on('mouseout', '.descriptionTitle', this.proxy(this.title_back));
    this.$approvalDataTable.on('mouseover', '.descriptionTitle', this.proxy(this.title_show)).on('mouseout', '.descriptionTitle', this.proxy(this.title_back)); 
   
    $(".criteria-list", this.$).on("click", "li.criteria-item > button", this.proxy(this.on_btn_filter_click)); // 绑定筛选按钮事件
    this.$verificationDataTable.on('click', ':checkbox.check-all', this.proxy(this.on_checkall_click)).on('click', '.remove-file', this.proxy(this.on_deletefile_click));
    this.$operationDataTable.on('click', ':checkbox.check-all', this.proxy(this.on_checkall_click)).on('click', '.remove-file', this.proxy(this.on_deletefile_click));

    this.$approvalDataTable.on('click', ':checkbox.check-all', this.proxy(this.on_checkall_click));
    this.$operationDataTable.on('click','.completion',this.proxy(this.on_completion_click));
    this.$batchBtnComfirm.click(this.proxy(this.on_verification_click));
    this.$batchBtnApproval.click(this.proxy(this.on_approval_click));
    this.$batchBtnReject.click(this.proxy(this.on_approval_click));
    this.$batchBtn_valite_Reject.click(this.proxy(this.on_opreat_click));
    /**
     * @title 行动项导出Excel
     */
    this.qid("btn_excel").on('click',this.proxy(this.excel));
    /**
     * @tile 数据列
     */
    this.qid("btn_col").on('click',this.proxy(this.btn_col));
    this.qid("closed").on("click",this.proxy(this.closed_col));
    this.qid("update").on("click",this.proxy(this.update_col));
    this.colValue=['id','activityNo','activitySummary','description', 'organizations',"status",'completionDeadLine','executeFiles','auditFiles'];
    /**
     * @title 查询显示的列
     */
    this.colData=this.coldata();
    /**
     * @赋值给select
     */
    this.qid("columnsdiv").select2({
		multiple: true,
		placeholder:"请选择显示的列",
		data:this.colData
	});
  },
  coldata:function(){
    	var coldata="";
    	 $.u.ajax({
			url: "riskvalidate.json",
			dataType: "json",
			type: "post",
			cache: true,
			async:false,
	         data:function(term, page){
	      	return {
	      		tokenid: $.cookie("tokenid"),
				};
	      }
	    }).done(function(response){
		   if(response.success){
			   coldata=response.data.colmuns
		   }
	    });
	  return coldata;
  },
  btn_col:function(){
	  this.qid("colDiv").show(); 
  },
  closed_col:function(){
	this.qid("colDiv").hide();
	$(".select2-results").parent().hide();
	
  },
  update_col:function(){
	  this.colValue=['id','activityNo','activitySummary','description', 'organizations',"status",'completionDeadLine','executeFiles','auditFiles'];
	  $.each(this.qid("columnsdiv").select2("data"), this.proxy(function(k, v){
  		this.colValue.push(v.id);
      }));
	  this.creatAllTable();
	  this.qid("colDiv").hide();
	  $(".select2-results").parent().hide();
  },
  /**
   * @title 绑定Tab事件
   */
  _initnav: function() {
    $("#navtabs").off("click", "a").on("click", "a", this.proxy(function(e) {
      e.preventDefault();
      var $tar = $(e.currentTarget);
      $tar.tab('show');
      this.isActive = $tar.attr("id");
      this._initfit();
    }));
    if (this._cmd && $("#navtabs").find("a[data-cate="+this._cmd+"]").length > 0) {
      $("#navtabs").find("a[data-cate="+this._cmd+"]").trigger("click");
    } else
      $("#navtabs").find("a:first").trigger("click");
  },
  /**
   * @title 初始化过滤筛选字段和DataTable
   */
  _initfit: function(){
    this._rebuildstaticfilters();
    this._rebuilddynmaicfilters();
    this.init_Table();
  },
  /**
   * @title 根据选择的Tab初始化DataTable
   */
  init_Table: function(){
    switch (this.isActive) {
      case "FENGPAI":
        this.creatAllTable();
        break;
      case "ZHIXING":
          this.creatOperationTable();
          break;
      case "YANZHENG":
        this.creatConfirmTable();
        break;
      case "SHENPI":
        this.creatApprovalTable();
        break;
    }
  },
  /**
   * @title 初始化“所有行动项”的DataTable
   */
  creatAllTable: function() {
    if ($.fn.DataTable.isDataTable(this.qid("viewtableone"))) {
        this.qid("viewtableone").dataTable().api().destroy();
        this.qid("viewtableone").empty();
    };
    var save_col=this.generateDataTableColumns(this.colValue);
    this.dataTableone = this.qid("viewtableone").DataTable({
      searching: false,
      serverSide: true,
      bProcessing: true,
      ordering: false,
      sDom: "t<ip>",
      pageLength: 10,
      loadingRecords: "加载中...",
      info: true,
      columns: save_col,
      "oLanguage": this.generateDataTableLanguage(),
      "serverParams": this.proxy(this.generateDataTableServerParams([
         [{
             key: 'status',
             op:"!=",
             value: '草稿'
           }
           ],[{"key":"permittedQuery",value:true}]
           ])),
      "serverData": this.proxy(this.generateDataTableServerData(this.qid("viewtableone").parent()))
    });
  },
  /**
   * @title 初始化“待我执行”的DataTable
   */ 
   creatOperationTable:function(){
     if($.fn.DataTable.isDataTable(this.qid("operationDataTable"))){
       this.$operationDataTable.fnDraw();
       return;
     }
     this.$operationDataTable=this.qid("operationDataTable").dataTable({
          searching: false,
          serverSide: true,
          bProcessing: true,
          ordering: false,
          sDom: "t<ip>",
          pageLength: 10,
          "loadingRecords": "加载中...",
          "info": true,
          "columns": this.generateDataTableColumns(['id','activityNo','activitySummary','description','completionDeadLine','status','confirmComment','auditComment','completionOverdueDays','organizations', 'confirmMan','confirmFiles','handel','distributeDate','lastUpdate']),
          "oLanguage": this.generateDataTableLanguage(),
          "serverParams": this.proxy(this.generateDataTableServerParams([
         [{
             key: 'status',
             value: '待执行'
           }, 
           {
               key: 'status',
               value: '待执行(审核拒绝)'
             }, 
             {
                 key: 'status',
                 value: '待执行(验证拒绝)'
               }],
           [{
             key: 'processors.id',
             value: parseInt($.cookie('userid'))
           }]
            ])),
          "serverData": this.proxy(this.generateDataTableServerData(this.qid("operationDataTable").parent()))
          
     })
   },
  /**
   * @title 初始化“待我验证”的DataTable
   */
  creatConfirmTable: function() {
    if ($.fn.DataTable.isDataTable(this.qid("verificationDataTable"))) {
      this.$verificationDataTable.fnDraw();
      return;
    }
    this.$verificationDataTable = this.qid("verificationDataTable").dataTable({
      searching: false,
      serverSide: true,
      bProcessing: true,
      ordering: false,
      sDom: "t<ip>",
      pageLength: 10,
      "loadingRecords": "加载中...",
      "info": true,
      "columns": this.generateDataTableColumns(['idConfirm','activityNo','activitySummary','description','completionDeadLine', 'organizations', 'status', 'confirmFiles','completionDate','completionStatus','confirmOverdueDays','distributeDate','lastUpdate']),
      "oLanguage": this.generateDataTableLanguage(),
      "serverParams": this.proxy(this.generateDataTableServerParams([
        [{
          key: 'status',
          value: '待验证'
        }],
        [{
          key: 'processors.id',
          value: parseInt($.cookie('userid'))
        }]
      ])),
      "serverData": this.proxy(this.generateDataTableServerData(this.qid("verificationDataTable").parent()))
    });

  },
  /**
   * @title 初始化“待我审核”的DataTable
   */
  creatApprovalTable: function() {
    if ($.fn.DataTable.isDataTable(this.qid("approvalDataTable"))) {
      this.$approvalDataTable.fnDraw();
      return;
    }
    this.$approvalDataTable = this.qid("approvalDataTable").dataTable({
      searching: false,
      serverSide: true,
      bProcessing: true,
      ordering: false,
      sDom: "t<ip>",
      pageLength: 10,
      "loadingRecords": "加载中...",
      "info": true,
      "columns": this.generateDataTableColumns(['idApproval','activityNo','activitySummary','description','completionDeadLine','auditOverdueDays', 'organizations', 'status','executeFiles','auditFiles','confirmDate','confirmComment','distributeDate','lastUpdate']),
      "oLanguage": this.generateDataTableLanguage(),
      "serverParams": this.proxy(this.generateDataTableServerParams([
        [{
          key: 'status',
          value: '待审核'
        }],
        [{
          key: 'processors.id',
          value: parseInt($.cookie('userid'))
        }]
      ])),
      "serverData": this.proxy(this.generateDataTableServerData(this.qid("approvalDataTable").parent()))
    });
  },
  /**
   * @title 生成DataTable所需的columns
   * @param {string array} columnNames - 所需的column的name
   */
  generateDataTableColumns: function(columnNames){
    var columns = {
      id: {
        data: "id",
        visible: false,
        render: function(data, type, full) {
          return data || '';
        }
      },
      idConfirm:{
        title: "<div><input type='checkbox' class='check-all' data-name='checkall-confirm'/><span style='padding-left:3px;padding-right:3px'>全选</span></div>",
        data: "id",
        width: "7%",
        orderable: false,
        "class": "checkbox-td",
        contentPadding: "mmm",
        dataProp: "engine",
        defaultContent: "--",
        render: function(data, type, full){
          return "<div></span><input type='checkbox' name='checkall-confirm'  data-data='" + JSON.stringify(full).replace(/'/g,'&apos;') + "'/></div>";
        }
      },
      idApproval:{
        title: "<div><input type='checkbox' class='check-all' data-name='checkall-approval'/><span style='padding-left:3px;padding-right:3px'>全选</span></div>",
        data: "id",
        width: "7%",
        orderable:false,
        "class": "checkbox-td",
        contentPadding: "mmm",
        dataProp: "engine",
        defaultContent: "--",
        render: function(data, type, full) {
          return "<div></span><input type='checkbox' name='checkall-approval'  data-data='" + JSON.stringify(full).replace(/'/g,'&apos;') + "'/></div>";
        }
      },
      description: {
        title: "行动项",
        data: "description",
        width: "7%",
        render: function(data, type, full) {
          var rlink = '';
          if (full.activity) {
          	rlink = '<div  style="max-height:140px;line-height:20px;overflow:hidden"><span  class="descriptionTitle"  title='+"'"+data+"'"+'>' + data.substring(0,5) + "..." + '</span></div>';
          } else {
            rlink = data || '';
          }
          return rlink;
        }
      },
      activitySummary: {
          title: "信息标题",
          data: "activitySummary",
          width: "7%",
          render: function(data, type, full) {
            var rlink = '';
            if (full.activitySummary) {
            	rlink = '<div  style="max-height:140px;line-height:20px;overflow:hidden"><span class="descriptionTitle" title='+data+'>' + data.substring(0,5) + "..." + '</span></div>';
            } else {
              rlink = data || '';
            }
            return rlink;
          }
        },
        activityNo: {
          title: "信息编号",
          data: "activityNo",
          width: "7%",
          render: function(data, type, full) {
            var rlink = '';
            if (full.activityNo) {
              rlink = '<div  style="max-height:140px;line-height:20px;overflow:hidden"><a href="../../sms/search/activity.html?activityId=' + full.activity + '" target="_blank" title='+data+'>' + data + '</a></div>';
            } else {
              rlink = data || '';
            }
            return rlink;
          }
        },
      completionDeadLine: {
        title: "到期日",
        data: "completionDeadLine",
        width: "7%",
        render: function(data, type, full) {
          return data || "";
        }
      },
      organizations: {
        title: "责任部门",
        data: "organizations",
        width: "10%",
        render: function(data, type, full) {
          return "<div style='word-wrap:break-word'>" + $.map(data, function(item, idx) {
            return item.name;
          }).join('<br/>') || '' + "<div>";
        }
      },
      handel:{
          title: "操作",
          data: "completionStatus",
          width: "7%",
          "class":'center',
          render: function(data, type, full) {
            var btn='<button class="btn btn-success completion" data-id='+full.id+'>完成</button>'; 
            return btn || "";
          }
        },
      confirmMan: {
        title: "验证人",
        data: "confirmMan",
        width: "7%",
        render: this.proxy(function(data, type, full) {
          var hm = [];
          $.each(data || [], this.proxy(function(idx, item) {
            hm.push(item.fullname);
          }))
          return hm.join("<br>") || "";
        })
      },
      auditor: {
        title: "审批人",
        data: "auditor",
        width: "7%",
        render:function(data, type, full) {
          var hm = [];
//          $.each(data || [], function(idx, item) {
//            hm.push(item.name);
//          })
          for(var key in data){    
              hm.push(data[key].fullname || "");
             };    
          return hm.join("<br>") || "";
        }
      },
      auditComment:{
        title:'审批意见',
        data: 'auditComment',
        width: "7%",
        render: function(data, type, full){
            var rlink = '';
            if (full.auditComment) {
            	rlink = '<div  style="max-height:140px;line-height:20px;overflow:hidden"><span class="descriptionTitle" title='+data+'>' + data.substring(0,5) + "..." + '</span></div>';
            } else {
              rlink = data || '';
            }
            return rlink;
          }
      },
      completionStatus:{
        title: '完成情况',
        data: 'completionStatus',
        width:'7%',
        render: function(data, type, full){
        	var html="";
        	if(full.completionStatus){
        		data=data.replaceall("<br>","");
        		full.completionStatus=full.completionStatus.replaceall("<br>","");
        		 html="<div class='descriptionTitle' style='max-height:140px;line-height:20px;overflow:hidden;' title='"+data+"'>"+function(){if(data.length>10) {return  data.substring(0,10) + "..."}else{return  data}}() || " "+ "</div>";
        	}else{
        		html=data || '';
        	}
           return html;
        }
      },
      status: {
        title: "状态",
        data: "status",
        width: "7%",
        render: function(data, type, full) {
          return data || "";
        }
      },
      confirmComment:{
          title: "验证意见",
          data: "confirmComment",
          width: "7%",
          render: function(data, type, full) {
              var rlink = '';
              if (full.confirmComment) {
              	rlink = '<div  style="max-height:140px;line-height:20px;overflow:hidden"><span class="descriptionTitle" title='+data+'>' + data.substring(0,5) + "..." + '</span></div>';
              } else {
                rlink = data || '';
              }
              return rlink;
            }
        
      },
      files: {
        title: "附件",
        data: "files",
        width: "5%",
        render: function(data, type, full) {
          var htmls = ['<ul style="padding-left: 0px;">'];
          $.each(data || [], function(idx, file) {
            htmls.push('<li  style="word-wrap:break-word;"><a class="descriptionTitle download-file" target="_blank" href="' + $.u.config.constant.smsqueryserver + "?method=downloadFiles&tokenid=" + $.cookie("tokenid") + "&ids=" + JSON.stringify([file.id]) + '">' + file.fileName.substring(0,3) + "..."  + '</a></li>');
          });
          htmls.push('</ul>');
          return htmls.join('');
        }
      },
      auditFiles:{
          title: "验证附件",
          data: "confirmFiles",
          width: "5%",
          render: function(data, type, full) {
            var htmls = ['<ul style="padding-left: 0px;">'];
            $.each(data || [], function(idx, file) {
              htmls.push('<li  style="word-wrap:break-word;"><a class="descriptionTitle download-file" target="_blank" href="' + $.u.config.constant.smsqueryserver + "?method=downloadFiles&tokenid=" + $.cookie("tokenid") + "&ids=" + JSON.stringify([file.id]) + '"title='+file.fileName+'>' + file.fileName.substring(0,3) + "..."  + '</a></li>');
            });
            htmls.push('</ul>');
            return htmls.join('');
          }
        
      },
      executeFiles:{
          title: "执行附件",
          data: "executeFiles",
          width: "5%",
          render: function(data, type, full) {
            var htmls = ['<ul style="padding-left: 0px;">'];
            $.each(data || [], function(idx, file) {
              htmls.push('<li  style="word-wrap:break-word;"><a class="descriptionTitle download-file" target="_blank" href="' + $.u.config.constant.smsqueryserver + "?method=downloadFiles&tokenid=" + $.cookie("tokenid") + "&ids=" + JSON.stringify([file.id]) + '"title='+file.fileName+'>' + file.fileName.substring(0,3) + "..." + '</a></li>');
            });
            htmls.push('</ul>');
            return htmls.join('');
          }
        },
        confirmFiles:{    //验证附件
        title: "执行附件",
        data: "executeFiles",
        width: "7%",
        render: function(data, type, full) {
          var htmls = ['<ul style="padding-left: 0px;">'];
          $.each(data || [], function(idx, file) {
            htmls.push('<li style="word-wrap:break-word;" ><a class="descriptionTitle download-file" target="_blank" href="' + $.u.config.constant.smsqueryserver + "?method=downloadFiles&tokenid=" + $.cookie("tokenid") + "&ids=" + JSON.stringify([file.id]) + '"title='+file.fileName+'>' + file.fileName.substring(0,3) + "..."  + '</a>&nbsp;&nbsp;<i class="fa fa-trash-o fa-lg uui-cursor-pointer remove-file" data-id="'+file.id+'" data-name="'+file.fileName+'"></i></li>');
          });
          htmls.push('</ul>');
          return htmls.join('');
        }
      },
      completionOverdueDays:{
         title:'完成超期',
         data:'completionOverdueDays',
         width:'7%',
         render: function(data, type, full) {
         	var html="";
         	if(full.completionOverdueDays!=null){
         		 html="<div style='color:red';>"+data+"</div>";
         	}else{
         		html='';
         	}
            return html;
         
           }
      },
      completionDate:{
          title:'完成日期',
          data:'completionDate',
          width:'7%',
          render: function(data, type, full) {
              return data || "";
            }
       },
       /**
        * @title 新添加日期
        */
       confirmDate:{
           title:'验证日期',
           data:'confirmDate',
           width:'7%',
           render: function(data, type, full) {
               return data || "";
             }
        },
        confirmOverdueDays:{
            title:'验证超期',
            data:'confirmOverdueDays',
            width:'7%',
            render: function(data, type, full) {
             	var html="";
             	if(full.confirmOverdueDays!=null){
             		 html="<div style='color:red';>"+data+"</div>";
             	}else{
             		html='';
             	}
                return html;
             
               }
         },
         auditDate:{
             title:'审核日期',
             data:'auditDate',
             width:'7%',
             render: function(data, type, full) {
                 return data || "";
               }
          },
          auditOverdueDays:{
              title:'审核超期',
              data:'auditOverdueDays',
              width:'7%',
              render: function(data, type, full) {
             	var html="";
             	if(full.auditOverdueDays!=null){
             		 html="<div style='color:red';>"+data+"</div>";
             	}else{
             		html='';
             	}
                return html;
             
               }
           },
           distributeDate:{
               title:'下发日期',
               data:'distributeDate',
               width:'7%',
               render: function(data, type, full) {
                   return data || "";
                 }
            },
            lastUpdate:{
                title:'更新日期',
                data:'lastUpdate',
                width:'7%',
                render: function(data, type, full) {
                    return data || "";
                  }
             }
    };
    return $.map(columnNames, function(name, idx){      
      return columns[name] || {};
    });
  },
  /**
   * @title 生成DataTable所需的language
   */
  generateDataTableLanguage: function(){
    return { 
        "sSearch": this.i18n.dataTable.search,
        "sLengthMenu": this.i18n.dataTable.everPage + " _MENU_ " + this.i18n.dataTable.record,
        "sZeroRecords": this.i18n.dataTable.message,
        "sInfo": this.i18n.dataTable.from + " _START_ " + this.i18n.dataTable.to + " _END_ /" + this.i18n.dataTable.all + " _TOTAL_ " + this.i18n.dataTable.allData,
        "sInfoEmpty": this.i18n.dataTable.withoutData,
        "sInfoFiltered": "(" + this.i18n.dataTable.fromAll + "_MAX_" + this.i18n.dataTable.filterRecord + ")",
        "sProcessing": "" + this.i18n.dataTable.searching + "...",
        "oPaginate": {
          "sFirst": "",
          "sPrevious": "<span class='fa fa-caret-left fa-lg'></span>",
          "sNext": "<span class='fa fa-caret-right fa-lg'></span>",
          "sLast": ""
        }
      };
  },
  /**
   * @title 生成DataTable所需的serverParams
   * @param {array} defaultRule - 默认筛选规则
   */
  generateDataTableServerParams: function(defaultRule){
    return function(aoData) {
      var query = $.map(this._userFilter.staticfilters.concat(this._userFilter.dynamicfilters), function(filter) {
        if (filter.propvalue && filter.propvalue.length > 0) {
          return {
            id: filter.propid,
            value: filter.propvalue
          };
        }
      });
      var newRule = $.extend(true, [], defaultRule);
      var TOrule=[
                  [{
                      key: 'status',
                      op:"!=",
                      value: '草稿'
                    }
                    ],[{"key":"permittedQuery",value:true}]
                    ];
      var value = null;
      $.each(query, this.proxy(function(idx, item) {
    	  
        if (value = item.value) {
          switch (item.id) {
          /**
           * 增加安监查询
           */
          case "organizations.unit.id":
          case "status":
            newRule.push($.map(value, this.proxy(function(field, idx) {
              return {
                key: item.id,
                value: field.id,
              };
            })));
            TOrule.push($.map(value, this.proxy(function(field, idx) {
                return {
                  key: item.id,
                  op:"in",
                  value: field.id,
                };
              })));
            break;
            case "organizations.id":
            case "status":
              newRule.push($.map(value, this.proxy(function(field, idx) {
                return {
                  key: item.id,
                  value: field.id
                };
              })));
              TOrule.push($.map(value, this.proxy(function(field, idx) {
                  return {
                    key: item.id,
                    value: field.id
                  };
                })));
              break;
            case "completionDeadLine":
              if (value && value[0]) {
                value[0].startDate && newRule.push([{
                  key: item.id,
                  op: '>=',
                  value: value[0].startDate
                }]);
                value[0].endDate && newRule.push([{
                  key: item.id,
                  op: '<=',
                  value: value[0].endDate
                }]);
                value[0].startDate && TOrule.push([{
                    key: item.id,
                    op: '>=',
                    value: value[0].startDate
                  }]);
                  value[0].endDate && TOrule.push([{
                    key: item.id,
                    op: '<=',
                    value: value[0].endDate
                  }]);
              }
              break;
            case "description": //行动项
              if (value && value[0]) {
                newRule.push([{
                  key: item.id,
                  op: 'like',
                  value: value[0].name
                }]);
                TOrule.push([{
                    key: item.id,
                    op: 'like',
                    value: value[0].name
                  }]);
                
              }
              break;
            case "confirmMan.id": //验证人
            	newRule.push($.map(value, this.proxy(function(field, idx) {
                    return {
                      key: item.id,
                      op:"in",
                      value: field.id,
                    };
                  })));
                  TOrule.push($.map(value, this.proxy(function(field, idx) {
                      return {
                        key: item.id,
                        op:"in",
                        value: field.id,
                      };
                    })));
                break;
          }
        }
      }));

      delete aoData.columns
      delete aoData.search
      delete aoData.order
      delete aoData.draw
      this.excel_rule=newRule;
      this.toRule=TOrule;
      if(this.status && this.status==1 || this.id!=null){
    	  newRule.push([{"key":"description","op":"like","value":this.description}]);
    	  newRule.push([{"key":"id","value":this.id}]);
    	  this.status=2;
      };
      $.extend(aoData, {
        tokenid: $.cookie("tokenid"),
        method:"stdcomponent.getbysearch",
        dataobject: 'actionItem',
        "columns":JSON.stringify([{"data":"t.distributeDate"}]),
 		"order":JSON.stringify([{"column":0,"dir":"desc"}]),
        rule: JSON.stringify(newRule)
      }, true);

    }
  },
  /**
   * @title 生成DataTable所需的serverData
   * @param {jQuery object} $blockContainer - loading遮罩容器
   */
  generateDataTableServerData: function($blockContainer){
    return function(sSource, aoData, fnCallBack, oSettings) {
      $.u.ajax({
        url: $.u.config.constant.smsqueryserver,
        type: "post",
        dataType: "json",
        cache: false,
        data: aoData,
      }, $blockContainer, {
        size: 2,
        backgroundColor: "#fff"
      }).done(this.proxy(function(resp) {
        if (resp.success && resp.data) {
        	/**
        	 * @title 代办执行数量统计
        	 */
        	$.u.ajax({
                url:$.u.config.constant.smsqueryserver,
                type:"post",
                async:false,
                dataType: "json",
                data:{
                     "tokenid":$.cookie("tokenid"),
                     method:"getActionItemToDoStatistics",
                     rule:JSON.stringify(this.toRule)
                },
                
              }).done(this.proxy(function(response) {
                      if (response.success) {
                    	  this.$confirmCount.add(this.$operationCount).add(this.$approvalCount).text('(0)');
                          var itemCount=0;
                          $.each(response.data.toDoStatistics || {}, this.proxy(function(idx, item) {
                            if(this._statusMap.operation.indexOf(item.status) > -1){
                            		itemCount+=Number(item.count);
                              this.$operationCount.html('(<strong class="text-danger">' + itemCount + '</strong>)');  
                            }else if (this._statusMap.confirm.indexOf(item.status) > -1) {
                              this.$confirmCount.html('(<strong class="text-danger">' + item.count + '</strong>)');
                            } else if (this._statusMap.approval.indexOf(item.status) > -1) {
                              this.$approvalCount.html('(<strong class="text-danger">' + item.count + '</strong>)');
                            }
                          }));
                      }
                  }));
        	
          
          fnCallBack(resp.data);
        }
      }));
    };
  },
  /**
   * @title 批量验证事件
   * @param {object} e - event object
   */
  on_verification_click: function(e) {
    e.preventDefault();
    var fulldataArray = [];
    if ($('input[name=checkall-confirm]:checked').length == 0) {
      return $.u.alert.info("请至少勾选一条数据", 2000);
    }
    $('input[name=checkall-confirm]:checked').each(this.proxy(function(k, v) {
      var fulldata = JSON.parse($(v).attr("data-data"));
      fulldataArray.push(fulldata);
    }));
    if (!this.verificationActionItemWidget) {
      this.verificationActionItemWidget = this._initVerificationActionItemWidget();
    }
    this.verificationActionItemWidget.open({
      "actionItems": fulldataArray,
      "title": "风险验证"
    });
  },
  /**
   * @title 批量审核事件
   * @param {object} e - event object
   */
  on_approval_click: function(e) {
    var actionItemIds = [],
      actionItems = [],
      type = $(e.currentTarget).attr('data-type');
    $('input[name=checkall-approval]:checked').each(this.proxy(function(k, v) {
      var fulldata = JSON.parse($(v).attr("data-data"));
      actionItems.push(fulldata);
      actionItemIds.push(fulldata.id);
    }));

    if (actionItemIds.length === 0) {
      return $.u.alert.info("请至少勾选一条数据", 2000);
    }

    if (!this.approvalActionItemWidget) {
      this.approvalActionItemWidget = this._initApprovalActionItemWidget();
    }

    this.approvalActionItemWidget.override({
      onSave: this.proxy(function(formdata) {
        $.u.ajax({
          url: $.u.config.constant.smsmodifyserver,
          type: 'post',
          data: {
            tokenid: $.cookie('tokenid'),
            method: type === 'approve' ? 'auditPassActionItems' : 'auditRejectedActionItems',
            actionItemIds: JSON.stringify(actionItemIds),
            auditComment: formdata.auditComment
          },
          dataType: 'json'
        }, this.approvalActionItemWidget.formDialog.parent()).done(this.proxy(function(resp) {
          if (resp && resp.success) {
            this._initfit();
            this.approvalActionItemWidget.formDialog.dialog('close');
          }
        }));
      })
    });
    this.approvalActionItemWidget.open({
      title: type === 'approve' ?this.i18n.batchApprovalActionItem : this.i18n.batchRejectActionItem,
      actionItems: actionItems
    });

  },
  /**
   * @title 执行拒绝
   */
  on_opreat_click: function(e) {
	    var actionItemIds = [],
	      actionItems = [],
	      type = $(e.currentTarget).attr('data-type');
	    $('input[name=checkall-confirm]:checked').each(this.proxy(function(k, v) {
	      var fulldata = JSON.parse($(v).attr("data-data"));
	      actionItems.push(fulldata);
	      actionItemIds.push(fulldata.id);
	    }));

	    if (actionItemIds.length === 0) {
	      return $.u.alert.info("请至少勾选一条数据", 2000);
	    }

	    if (!this.approvalActionItemWidget) {
	        this.approvalActionItemWidget = this._initApprovalActionItemWidget();
	      }

	    this.approvalActionItemWidget.override({
	      onSave: this.proxy(function(formdata) {
	        $.u.ajax({
	          url: $.u.config.constant.smsmodifyserver,
	          type: 'post',
	          data: {
	            tokenid: $.cookie('tokenid'),
	            method:'confirmRejectedActionItems',
	            actionItemIds: JSON.stringify(actionItemIds),
	            confirmComment: formdata.auditComment
	          },
	          dataType: 'json'
	        }, this.approvalActionItemWidget.formDialog.parent()).done(this.proxy(function(resp) {
	          if (resp && resp.success) {
	            this._initfit();
	            this.approvalActionItemWidget.formDialog.dialog('close');
	          }
	        }));
	      })
	    });
	    this.approvalActionItemWidget.open({
	      title: type === 'approve' ?this.i18n.batchApprovalActionItem : this.i18n.batchRejectActionItem,
	      actionItems: actionItems
	    });

	  },
  /**
   * @title 添加完成情況
   */
  on_completion_click:function(e){
    var data_id=$(e.currentTarget).attr("data-id");
    if(!this.completionWidget){
      this.completionWidget = this._initCompletionActionItemWidget(data_id);
    }
    this.completionWidget._options.add = this.proxy(function(comp, formdata){
      var content=formdata.desc;
      $.u.ajax({
        url:$.u.config.constant.smsmodifyserver,
        type:"post",
        async:false,
        dataType: "json",
        data:{
             "tokenid":$.cookie("tokenid"),
             "method":"executeActionItem",
             "actionItemId":data_id,
             "completionStatus":content,
        },
        
      }).done(this.proxy(function(response) {
              if (response.success) {
               comp.formDialog.dialog('close');
               this.creatOperationTable();
              }
          }));
      
    });
    var param="";
    this.completionWidget.open(param,data_id);
  },
  /**
   * @title 初始化“完成”组件
   */
  _initCompletionActionItemWidget: function(data_id) {
    var clz = $.u.load("com.sms.common.stdComponentOperate");
    var ins = new clz($("div[umid='operationWidget']", this.$), {
      title: '完成',
      actionItemId: data_id,
      fields:[{
        name:"desc",label:"完成情況", type:"textarea",rule:{required:true},message:"完成情況不能为空"
      },{
        label:"附件", type:"file",rule:{required:true},message:"附件不能为空"
      },
      ]
    }); 
    ins.override({
        refreshDataTable: this.proxy(function() {
          this._initfit()
        })
      });
    return ins;
  },
  /**
   * @title 初始化“批量验证”组件
   */
  _initVerificationActionItemWidget: function() {
    var clz = $.u.load("com.audit.validate.itemDialogEditConfirm");
    var ins = new clz($("div[umid='verificationActionItemWidget']", this.$), null);
    ins.override({
      refreshDataTable: this.proxy(function() {
        this._initfit()
      })
    });
    return ins;
  },
  /**
   * @title 初始化“批量审核行动项”组件
   */
  _initApprovalActionItemWidget: function() {
    var clz = $.u.load('com.audit.validate.itemDialogEditApproval');
    return new clz($("div[umid='approvalActionItemWidget']", this.$), null);
  },
  /**
   * @title 全选
   * @param {object} e - event object
   */
  on_checkall_click: function(e) {
    var $this = $(e.currentTarget),
      name = $this.attr('data-name');
    $('input[name=' + name + ']').not(':disabled').prop("checked", $this.prop("checked"));
  },
  on_deletefile_click:function(e){
    var $this = $(e.currentTarget),
      fileId = $this.attr('data-id'),
      fileName = $this.attr('data-name');

    $.u.load("com.sms.common.stdcomponentdelete");
    (new com.sms.common.stdcomponentdelete({
      body: "<div>" +
        "<p>确认删除？</p>" +
        "</div>",
      title: "删除文件:" + fileName,
      dataobject: "file",
      dataobjectids: JSON.stringify([parseInt(fileId)])
    })).override({
      refreshDataTable: this.proxy(function() {
        $this.closest('li').fadeOut(function() {
          $(this).remove();
        })
      })
    });
  },

  /**
   * @title 筛选器按钮事件
   * @param e
   */
  on_btn_filter_click: function(e) {
    var $button = $(e.currentTarget),
      $allButtons = $(".criteria-list button"),
      plugin = $button.attr("data-plugin"),
      offset = $button.offset(),
      inputRenderClazz = null,
      inputRenderObj = null,
      result = null,
      sel = null;

    $allButtons.removeClass("active");
    $button.addClass("active");
    inputRenderClazz = $.u.load(plugin);
    inputRenderObj = new inputRenderClazz();
    inputRenderObj.override({
      "afterDestroy": this.proxy(function() {
        $allButtons.removeClass("active");
      }),
      "update": this.proxy(function(value) {
    	  /**
    	   * @peg 点击搜索条件 清除措施ID
    	   */
      	  var unitID=[];
      	  this.id=null;
        $.each(this._userFilter.staticfilters, this.proxy(function(idx, filter) {
          if (filter.propid == value.propid) {
        	   if(filter.propid=="organizations.unit.id"){
        		   var valuePropvalue=value.propvalue;
             	  for(i in valuePropvalue){
             		  unitID.push(valuePropvalue[i].id); 
             	  }
             	  console.log(unitID);
             	  $(".myUnitID").val(unitID); 
        	   }
        	  
            this._userFilter.staticfilters.splice(idx, 1, value);
          }
        }));
        $.each(this._userFilter.dynamicfilters, this.proxy(function(idx, filter) {
        	
          if (filter.propid == value.propid) {
            this._userFilter.dynamicfilters.splice(idx, 1, value);
          }
        }));
        this._initfit();
      })
    });
    result = inputRenderObj.get("filter", "html");
    sel = $(result).css({
      top: offset.top + $button.outerHeight(true) - 1,
      left: offset.left
    }).appendTo("body");
    inputRenderObj.get("filter", "render", $.extend(true, {}, $button.parent().data("data-data")), sel); // 采用extend，防止其他函数篡改数据（.data()存的数据是引用对象？？）
  },
  /**
   * @title 重新生成静态过滤器
   */
  _rebuildstaticfilters: function() {
    var staticfilters = this._userFilter.staticfilters;
    var staticul = this.qid("search-criteria").children().first();
    $(".criteria-item", staticul).remove();
    var staticultext = staticul.children().first();
    if (staticfilters) {
      $.each(staticfilters, this.proxy(function(idx, afilter) {
        var htm = this._filtertemplate.replace(/#\{propid\}/g, afilter.propid)
          .replace(/#\{propname\}/g, afilter.propname)
          .replace(/#\{propshow\}/g, $.trim(afilter.propshow) == "" ? "全部" : afilter.propshow)
          .replace(/#\{propplugin\}/g, afilter.propplugin);
        $(htm).insertBefore(staticultext).data("data-data", afilter); // 将以选中的值存入data，不放如attr中防止特殊符号干预json格式
      }));
    }

    $(".remove-filter", staticul).hide();

    $(".btn-columns").css({
      "float": "right"
    })
  },
  /**
   * @title 重新生成动态过滤器
   */
  _rebuilddynmaicfilters: function() {
    var dynamicfilters = this._userFilter.dynamicfilters;
    var dynamicul = this.qid("search-criteria-extended").children().first();
    dynamicul.empty();
    if (dynamicfilters) {
      $.each(dynamicfilters, this.proxy(function(idx, afilter) {
        var htm = this._filtertemplate.replace(/#\{propid\}/g, afilter.propid)
          .replace(/#\{propname\}/g, afilter.propname)
          .replace(/#\{propshow\}/g, $.trim(afilter.propshow) == "" ? "全部" : afilter.propshow)
          .replace(/#\{propplugin\}/g, afilter.propplugin);
        $(htm).appendTo(dynamicul).data("data-data", afilter);
      }));
    }
    dynamicul.off("click", "a.remove-filter").on("click", "a.remove-filter", this.proxy(function(e) {
      e.preventDefault();
      var $a = $(e.currentTarget),
        propid = $a.prev().attr("data-id"),
        $toggleobjs = this.qid("span-editflag").add(this.qid("div-savebuttons")),
        $btnsavefilteras = this.qid("btn-savefilteras");

      $a.closest("li").remove();
      this._userFilter.dynamicfilters = $.grep(this._userFilter.dynamicfilters, function(item, idx) {
        return item.propid !== propid;
      });
      this._initfit();

    }));
    $(".search-criteria-extended .criteria-close").css({
      "color": " #bbb"
    })
    $(".search-criteria-extended  .criteria-close:hover").css({
      "color": " #000"
    })
    $(".criteria-list li").css({
      "position": " relative",
      "margin-bottom": " 0",
      "display": " inline-block",
      "margin": " 0 6px 2px 0",
      "vertical-align": "top",
    });
  },
  /**
   * @title ajax
   * @param {string} url - url
   * @param {object} param - ajax param
   * @param {jQuery object} $container - the object for block
   * @param {object} blockParam - blockui param
   * @param {function} callback - callback
   */
  _ajax: function(url, param, $container, blockParam, callback) {
    $.u.ajax({
      "url": url,
      "type": url.indexOf(".json") > -1 ? "get" : "post",
      "data": $.cookie("tokenid") ? $.extend({
        "tokenid": $.parseJSON($.cookie("tokenid"))
      }, param) : $.extend({
        "tokenid": $.parseJSON($.cookie("uskyuser")).tokenid
      }, param),
      "dataType": "json"
    }, $container, $.extend({}, blockParam)).done(this.proxy(function(response) {
      if (response.success) {
        callback && callback(response);
      }
    })).fail(this.proxy(function(jqXHR, responseText, responseThrown) {

    }));
  },
  /**
   * 鼠标悬停事件处理
   */
  title_show:function(e){
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
	    div.style.left = pageX(span)+50+'px';
	    div.style.top = pageY(span)-10+'px';
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
   * @title 导出Excel
   */
	  excel:function(){
		  
		  var form = $("<form/>");
		  var cols_title=["信息编号",'信息标题',"行动项","责任部门",
		                  "完成情况","完成日期","到期日","完成超期","验证人",
		                  "审批意见","审批人","状态","验证日期",
		                  "验证超期","审核日期","审核超期","下发日期",
		                  "最后更新日期"];
		  var cols_des=['activityNo','activitySummary',"description","organizations.name",
		                "completionStatus","completionDate","completionDeadLine","completionOverdueDays","confirmMan.displayName",
		                "auditComment",'auditor.displayName',"status",'confirmDate',
		                'confirmOverdueDays','auditDate','auditOverdueDays','distributeDate',
		                'lastUpdate'];
		  this.cols=[];
		  this.cols.push(cols_title);this.cols.push(cols_des);
		  var obj = this.excel_rule;   //导出的查询条件
		  var query = JSON.stringify(obj);
		  var data_C=[{name:"tokenid",data:$.cookie("tokenid")},
			            {name:"method",data:"exportActionItemsToExcel"},
			            {name:"dataobject",data:"actionItem"},
			            {name:"url",data:window.location.host + window.location.pathname + window.location.search},
			            {name:"order",data:JSON.stringify([{"column":0,"dir":"desc"}])},
			            {name:"columns",data:JSON.stringify([{"data":"t.distributeDate"}])},
			            {name:"rule",data:query},
			            {name:"titles",data:JSON.stringify(this.cols)}
			            ];
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
	        'action': $.u.config.constant.smsqueryserver
	    });  
	    form.appendTo('body').submit().remove();
	  },
  /**
   * @title 重置搜索框（供左侧过滤器列表点击时调用）
   */
  resetSearchBox: function() {
    this.qid("search-query").val("");
  },
  /**
   * @title 加载左侧过滤器列表（重写）
   */
  refreshFilterList: function(filterid) {},
  /**
   * @title 删除当前选中过滤器(重写)
   */
  removeCurrentFilter: function() {},
  destroy: function() {
    this._super();
  }
}, {
  usehtm: true,
  usei18n: true
});

com.audit.validate.riskvalidate.widgetjs = [
  "../../../uui/widget/select2/js/select2.min.js",
  "../../../uui/widget/jqdatatable/js/jquery.dataTables.js",
  "../../../uui/widget/jqdatatable/js/dataTables.bootstrap.js",
  "../../../uui/widget/spin/spin.js",
  "../../../uui/widget/jqblockui/jquery.blockUI.js",
  "../../../uui/widget/ajax/layoutajax.js"
];
com.audit.validate.riskvalidate.widgetcss = [{
  path: "../../../uui/widget/select2/css/select2.css"
}, {
  path: '../../../uui/widget/jqdatatable/css/jquery.dataTables.css'
}, {
  path: '../../../uui/widget/jqdatatable/css/dataTables.bootstrap.css'
}, {
  path: "../../../uui/widget/select2/css/select2-bootstrap.css"
}];