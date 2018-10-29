//@ sourceURL=com.sms.detailmodule.riskAnalysis.riskAnalysis
$.u.define('com.sms.detailmodule.riskAnalysis.riskAnalysis', null, {
    init: function(option) {
    	
        this._options = option || {};
        this.systemRiskAnalysis=this._options.systemAnalysisRiskAnalysis;
        this.systemRiskAnalysisDerive= this._options.residualDerivativeRisks;
        this.conclusion = this._options.conclusion;
        this._i18n = com.sms.detailmodule.riskAnalysis.riskAnalysis.i18n;
        this._MODE = {
            ADD: "add",
            EDIT: "edit",
            VIEW: "view"
        };
        this._SELECT2_PAGE_LENGTH = 3;
        /**
         * @in 风险分析header
         */
        this._RISK_ANALYSIS_TABLE = "" +
            "<div class='riskAnalysisTable' style='border-bottom: 1px solid #974676;'>" +
            "<table class='uui-table' >" +
            "<thead>" +
            "<tr class='infomodel-title'>" +
            "<th>#{sysTypeName}<span class='pull-right hidden'>" + this._i18n.columns.creator + "#{creator}&nbsp;&nbsp;" + this._i18n.columns.lastUpdate + "#{lastUpdate}&nbsp;</span></th>" +
            "<th class='operate-tool hidden'><button class='btn btn-default btn-sm submitRiskAnalysis mod-edit mod-add' data-riskAnalysisId='#{riskAnalysisId}'>" + this._i18n.buttons.submitRiskAnalysis + "</button></th>" +
            "<th class='operate-tool'><i title='" + this._i18n.buttons.removeRiskAnalysis + "' class='fa fa-lg fa-trash-o removeRiskAnalysis mod-edit mod-add' data-riskAnalysisId='#{riskAnalysisId}'></i></th>" +
            "</tr>" +
            "</thead>" +
            "</table>" +
            "<table class='uui-table table-fixed' >" +
            "<thead>" +
            "<tr>" +
            /*"<th style='width: 50px;' class='mod-add mod-edit'>" + this._i18n.buttons.removeMapping + "</th>" +*/
            "<th style='width:10%;'>" +  this._i18n.columns.threat + "</th>" +
            "<th style='width:10%;'>" +  this._i18n.columns.code + "</th>" +
            "<th style='width: 10%;'>" + this._i18n.columns.riskAnalysis + "</th>" +
            "<th style='width:10%;'>" + this._i18n.columns.riskLevel + "</th>" +
            "<th style='width:20%;'>" + this._i18n.columns.manualTerms + "</th>" +
            "<th style='width:10%;'>" +  this._i18n.columns.actionItem + "</th>" +
            "<th style='width:10%;'>" +  this._i18n.columns.personLable + "</th>" +
            "<th style='width:10%;'>" +  this._i18n.columns.dueDate + "</th>" +
            "<th style='width:5%;'>" + this._i18n.columns.status + "</th>" +
            "<th style='width:5%;'>" +  this._i18n.columns.handel+"</th>" +
            "<th class='operate-tool'><i title='" + this._i18n.buttons.addThreat + "' class='fa fa-plus fa-lg addRiskThreatErrorMapping mod-edit mod-add' data-type='threat' data-riskAnalysisId='#{riskAnalysisId}' data-sysTypeId='#{sysTypeId}'></i></th>" +
            "</tr>" +
            "</thead>" +
            "<tbody class='threat-tbody'></tbody>" +
            "</table>" +
            "<table class='uui-table table-fixed' >" +
            "<thead>" +
            "<tr>" +
            /*"<th style='width: 50px;' class='mod-add mod-edit'>" + this._i18n.buttons.removeMapping + "</th>" +*/
            "<th style='width:10%;'>"  + this._i18n.columns.error + "</th>" +
            "<th style='width:10%;'>" +  this._i18n.columns.code + "</th>" +
            "<th style='width: 10%;'>" + this._i18n.columns.riskAnalysis + "</th>" +
            "<th style='width:10%;'>" + this._i18n.columns.riskLevel + "</th>" +
            "<th style='width:20%;'>" + this._i18n.columns.manualTerms + "</th>" +
            "<th style='width:10%;'>" +  this._i18n.columns.actionItem + "</th>" +
            "<th style='width:10%;'>" +  this._i18n.columns.personLable + "</th>" +
            "<th style='width:10%;'>" +  this._i18n.columns.dueDate + "</th>" +
            "<th style='width: 5%;'>" + this._i18n.columns.status + "</th>" +
            "<th style='width:5%;'>" +  this._i18n.columns.handel+"</th>" +
            "<th class='operate-tool'><i title='" + this._i18n.buttons.addError + "' class='fa fa-plus fa-lg addRiskThreatErrorMapping mod-edit mod-add' data-type='error' data-riskAnalysisId='#{riskAnalysisId}' data-sysTypeId='#{sysTypeId}'></i></th>" +
            "</tr>" +
            "</thead>" +
            "<tbody class='error-tbody'></tbody>" +
            "</table>" +
            "</div>";
        /**
         * @int 风险分析body
         */
        this._TR = "" +
            "<tr data-threat-error-id='#{threatErrorId}' data-editable='#{editable}'>" +
            "<td class='descriptionTitle' title='#{nametitle}'>#{name}</td>" +
            "<td>#{code}</td>" +
            "<td><span class='descriptionTitle' style='word-wrap: break-word;' title='#{texttitle}'>#{text}</span> <i title='" + this._i18n.buttons.editMappingText + "' class='fa fa-pencil editText uui-cursor-pointer mod-edit mod-add' data-mappingId='#{id}' title='#{texttile}' data-text='#{text}' data-type='#{type}'></i></td>" +
            "<td style='background-color:#{colour}'><div  class='descriptionTitle bgcolor' title='P&nbsp:可能性&nbsp&nbsp&nbsp S&nbsp:严重性' class='bgcolor' style='font-size:14px;position:relative; line-height:20px;'>P:<span class='Pspan'>#{riskLevelP}</span>&nbsp&nbsp&nbspS:<span class='Sspan'>#{riskLevelS}</span><br><span class='accept'>#{accept}</span><div style='position:absolute;top:10px;right:10px;'> <i title='" + this._i18n.buttons.editMappingText + "' class='fa fa-pencil editText_grade uui-cursor-pointer mod-edit mod-add' data-mappingId='#{id}' title='#{texttitle}' data-text='#{text}' data-type='#{type}'></i></div><div></td>" +
            "<td colspan='5'>" +
            "<ol class='list-unstyled clauses'  style='margin:0;'></ol>" +
            "</td>" +
            "<td colspan='1'>" +
            "<button  class='btn btn-link addClause mod-edit mod-add' data-type='#{threatOrError}' data-threat-error-id='#{threatErrorId}' data-mappingId='#{id}' style='padding-left:0;'>" + this._i18n.buttons.addControl + "</button>" + //this._i18n.buttons.addClause
            // "<button  class='btn btn-link removeRiskThreatErrorMapping mod-edit mod-add' data-type='#{type}' data-id='#{id}'>" + "删除" + "</button>" +  //this._i18n.buttons.removeThreatError
            "</td>" +
            "<td style='padding-left: 0px;padding-right:10px;' class='mod-add mod-edit'><i  class='fa fa-lg fa-trash-o btn btn-link removeRiskThreatErrorMapping mod-edit mod-add' data-type='#{type}' data-id='#{id}'>" + "" + "</i></td>" +
            "</tr>";
        /**
         * @int 风险分析条款
         */
        this._MANUAL_TERMS = "<li style=' position: relative;'>" +
            "<i class='fa fa-trash-o uui-cursor-pointer removeClause mod-edit mod-add'   data-id='#{id}' title='" + this._i18n.buttons.removeControl + "'></i>" + 
            "<a    class='btn btn-link btn-sm actionItem' data-id='#{id}' data-title='#{number}&nbsp;#{title}'>" +
            "<div style='overflow: hidden;text-overflow: ellipsis;' class='text-left descriptionTitle'  title='#{nametitle}'><nobr title='#{nametitle}'>#{number}&nbsp;#{title}</nobr></div>" +
            "</a>" + "&nbsp" +
            "<div style='' class='action'>" +
            "</div>" +
            "</li>";
        /**
         * @int 行动项
         */
        this.ACTION =  "<div style='margin-left:20%'>" +
        "<span  class='descriptionTitle'  style='position: relative;left:21%;display: inline-block;width:20%;overflow:hidden;' title='#{actiontitle}'>#{action}</span>" +
        "<span class='clause-' style='position: relative;left:19%;text-align:center;display: inline-block;width:20%;overflow:hidden;'>#{personLable}</span>" +
        "<span class='clause-' style='position: relative;text-align:center;left:16%;display: inline-block;width:30%;overflow:hidden;'>#{dueDate}</span>" +
        "<span class='clause-status' style='position: relative;top:-5px;left:19%;display: inline-block;'>#{status}</span>" +
        "</div>";
        /**
         * @int 衍生风险header
         */
        this._RISK_ANALYSIS_TABLE_DERIVE = "" +
        "<div class='riskAnalysisTableDerive' systemAnalysisRiskAnalysisId='#{systemAnalysisRiskAnalysisId}' style='border-bottom: 1px solid #974676;'>" +
        "<table class='uui-table' >" +
        "<thead>" +
        "<tr class='infomodel-title'>" +
        "<th>#{sysTypeName}<span class='pull-right hidden'>" + this._i18n.columns.creator + "#{creator}&nbsp;&nbsp;" + this._i18n.columns.lastUpdate + "#{lastUpdate}&nbsp;</span></th>" +
        "<th class='operate-tool hidden'><button class='btn btn-default btn-sm submitRiskAnalysis mod-edit mod-add' data-riskAnalysisId='#{riskAnalysisId}'>" + this._i18n.buttons.submitRiskAnalysis + "</button></th>" +
        "<th class='operate-tool hidden'><i title='" + this._i18n.buttons.removeRiskAnalysis + "' class='fa fa-lg fa-trash-o removeRiskAnalysis mod-edit mod-add' data-riskAnalysisId='#{riskAnalysisId}'></i></th>" +
        "</tr>" +
        "</thead>" +
        "</table>" +
        "<table class='uui-table table-fixed' >" +
        "<thead>" +
        "<tr>" +
        /*"<th style='width: 50px;' class='mod-add mod-edit'>" + this._i18n.buttons.removeMapping + "</th>" +*/
        "<th style='width:20%;'>" +  this._i18n.columns.threat + "</th>" +
        "<th style='width:20%;'>" +  this._i18n.columns.code + "</th>" +
        "<th style='width: 20%;'>" + this._i18n.columns.riskAnalysis + "</th>" +
        "<th style='width:20%;'>" + this._i18n.columns.riskLevel + "</th>" +
        
        "<th style='width:8%;'>" +  this._i18n.columns.handel+"</th>" +
        "<th class='operate-tool addDerive' style='cursor: auto;'><i title='" + this._i18n.buttons.addThreat + "' class='' data-type='threat' data-riskAnalysisId='#{riskAnalysisId}' data-sysTypeId='#{sysTypeId}'></i></th>" +
        "</tr>" +
        "</thead>" +
        "<tbody class='threat-tbody'></tbody>" +
        "</table>" +
        "<table class='uui-table table-fixed' >" +
        "<thead>" +
        "<tr>" +
        /*"<th style='width: 50px;' class='mod-add mod-edit'>" + this._i18n.buttons.removeMapping + "</th>" +*/
        "<th style='width:20%;'>"  + this._i18n.columns.error + "</th>" +
        "<th style='width:20%;'>" +  this._i18n.columns.code + "</th>" +
        "<th style='width: 20%;'>" + this._i18n.columns.riskAnalysis + "</th>" +
        "<th style='width:20%;'>" + this._i18n.columns.riskLevel + "</th>" +
        
        "<th style='width:8%;'>" +  this._i18n.columns.handel+"</th>" +
        "<th class='operate-tool addDerive' style='cursor: auto;'><i title='" + this._i18n.buttons.addError + "' class='' data-type='error' data-riskAnalysisId='#{riskAnalysisId}' data-sysTypeId='#{sysTypeId}'></i></th>" +
        "</tr>" +
        "</thead>" +
        "<tbody class='error-tbody'></tbody>" +
        "</table>" +
        "</div>";
        /**
         * @int 衍生风险body
         */
        this._TR_DERIVE = "" +
        "<tr class='threatError' deleteTE-id='#{deleteTE-id}' style='background-color:#{derivecolor}' data-threat-error-id='#{threatErrorId}' systemAnalysisRiskErrorMappingId='#{systemAnalysisRiskErrorMappingId}' systemAnalysisRiskThreatMappingId='#{systemAnalysisRiskThreatMappingId}' data-editable='#{editable}'>" +
        "<td   class='descriptionTitle' title='#{nametitle}'>#{name}</td>" +
        "<td>#{code}</td>" +
        "<td><span class='descriptionTitle' style='word-wrap: break-word;' title='#{texttitle}'>#{text}</span> <i title='" + this._i18n.buttons.editMappingText + "' class='fa fa-pencil editText uui-cursor-pointer mod-edit mod-add' data-mappingId='#{id}' data-text='#{text}' data-type='#{type}'></i></td>" +
        "<td colspan='1' style='background-color:#{colour}'><div   class='descriptionTitle bgcolor' title='P&nbsp:可能性&nbsp&nbsp&nbsp S&nbsp:严重性' class='bgcolor' style='font-size:14px;position:relative;'>P:<span class='Pspan'>#{riskLevelP}</span>&nbsp&nbsp&nbspS:<span class='Sspan'>#{riskLevelS}</span><br><span class='accept'>#{accept}</span><div style='position:absolute;top:10px;right:20px;'> <i title='" + this._i18n.buttons.editMappingText + "' class='fa fa-pencil editText_derive uui-cursor-pointer mod-edit mod-add' data-mappingId='#{id}' data-text='#{text}' data-type='#{type}'></i></div></td>" +
        "<td><i style='margin-left:10px;' title='删除风险分析' class='hidden fa fa-lg fa-trash-o removeRiskAnalysis_derive' data-type='threat' data-riskAnalysisId='#{riskAnalysisId}' data-sysTypeId='#{sysTypeId}'></i></td>" +
        "<td class='operate-tool' style='text-align:left;padding-left:10px'><i title='" + this._i18n.buttons.addError + "' class='fa fa-plus fa-lg addRiskThreatErrorMapping mod-edit mod-add' data-type='error' data-riskAnalysisId='#{riskAnalysisId}' data-sysTypeId='#{sysTypeId}'></i></td>" +
       /* "<td colspan='1'>" +
        "<button  class='btn btn-link addClause mod-edit mod-add' data-type='#{threatOrError}' data-threat-error-id='#{threatErrorId}' data-mappingId='#{id}' style='padding-left:0;'>" + this._i18n.buttons.addControl + "</button>" + //this._i18n.buttons.addClause
        // "<button  class='btn btn-link removeRiskThreatErrorMapping mod-edit mod-add' data-type='#{type}' data-id='#{id}'>" + "删除" + "</button>" +  //this._i18n.buttons.removeThreatError
        "</td>" +
        "<td style='padding-left: 0px;padding-right:10px;' class='mod-add mod-edit'><button  class='btn btn-link removeRiskThreatErrorMapping mod-edit mod-add' data-type='#{type}' data-id='#{id}'>" + "删除" + "</button></td>" +*/
        "</tr>";
        /**
         * @int 添加衍生风险ADD
         */
        this.ADD_TR_DERIVE = "" +
        "<tr class='threatError' deleteTE-id='#{deleteTE-id}' style='background-color:#{derivecolor}' data-threat-error-id='#{threatErrorId}' systemAnalysisRiskErrorMappingId='#{systemAnalysisRiskErrorMappingId}' systemAnalysisRiskThreatMappingId='#{systemAnalysisRiskThreatMappingId}' data-editable='#{editable}'>" +
        "<td   class='descriptionTitle' title='#{nametitle}'>#{name}</td>" +
        "<td>#{code}</td>" +
        "<td><span style='word-wrap: break-word;' title='#{texttitle}'>#{text}</span> <i title='" + this._i18n.buttons.editMappingText + "' class='fa fa-pencil editText uui-cursor-pointer mod-edit mod-add' data-mappingId='#{id}' data-text='#{text}' data-type='#{type}'></i></td>" +
        "<td colspan='1' style='background-color:#{colour}'><div    class='descriptionTitle bgcolor' title='P&nbsp:可能性&nbsp&nbsp&nbsp S&nbsp:严重性' class='bgcolor' style='font-size:14px;position:relative;'>P:<span class='Pspan'>#{riskLevelP}</span>&nbsp&nbsp&nbspS:<span class='Sspan'>#{riskLevelS}</span><br><span class='accept'>#{accept}</span><div style='position:absolute;top:10px;right:20px;'> <i title='" + this._i18n.buttons.editMappingText + "' class='fa fa-pencil editText_derive uui-cursor-pointer mod-edit mod-add' data-mappingId='#{id}' data-text='#{text}' data-type='#{type}'></i></div></td>" +
        "<td><i style='margin-left:10px;    cursor: pointer;' title='' class=' fa fa-lg fa-trash-o removeRiskAnalysis_derive'  data-riskAnalysisId='#{riskAnalysisId}' data-sysTypeId='#{sysTypeId}'  data-deriveRiskAnalysisId='#{id}' data-type='#{type}' ></i></td>" +
        "<td class='operate-tool' style='text-align:left;padding-left:10px'></td>" +
       /* "<td colspan='1'>" +
        "<button  class='btn btn-link addClause mod-edit mod-add' data-type='#{threatOrError}' data-threat-error-id='#{threatErrorId}' data-mappingId='#{id}' style='padding-left:0;'>" + this._i18n.buttons.addControl + "</button>" + //this._i18n.buttons.addClause
        // "<button  class='btn btn-link removeRiskThreatErrorMapping mod-edit mod-add' data-type='#{type}' data-id='#{id}'>" + "删除" + "</button>" +  //this._i18n.buttons.removeThreatError
        "</td>" +
        "<td style='padding-left: 0px;padding-right:10px;' class='mod-add mod-edit'><button  class='btn btn-link removeRiskThreatErrorMapping mod-edit mod-add' data-type='#{type}' data-id='#{id}'>" + "删除" + "</button></td>" +*/
        "</tr>";
    },
    afterrender: function(bodystr) {
        this.tableContainer = this.qid("tablecontainer");
        this.text_summrize = this.qid("text_summrize");
        this.tableDerive = this.qid("tableDerive");
        this.edit_summrize= this.qid("edit_summrize");
        this.edit_text_summrize = this.qid("edit_text_summrize");
        this.riskThreatErrorMappingDialog = null;
        this.selectControlDialog = null;
        this.actionItemDialog = null;
        this.mappingTextDialog = null;
        this.mappingTextDialog_derive = null;
        this.riskLevelP = this.qid("riskLevelP");
        this.riskLevelS = this.qid("riskLevelS");
        this.riskLevelPS = this.qid("riskLevelPS");
        if (this._options.editable !== true || this._options.statusCategory =="COMPLETE") {
            this.qid("btn_add").remove();
        }
         
        /**
         * @title event 分析
         */
        this.riskLevelP.on("change",this.proxy(this.riskLevelEvent));
        this.riskLevelS.on("change",this.proxy(this.riskLevelEvent));
        this.systemRiskAnalysis && $.each(this.systemRiskAnalysis,this.proxy(function(index,item){
        	item.system={
        		created: item.created,
        		deleted: false,
        		id: item.systemId,
        		lastUpdate:item.lastUpdate,
        		name: item.system,
        		nameByLanguage: item.system,
        		nameEn: null,
        		sign: null,
        		type: "系统分类",
        		updateBy: null,
        		value: item.system};
        	    item.threats= item.riskThreatMappings;
                item.errors = item.riskErrorMappings,
                item.fullname = item.creator,
                item.editable = true;
        	this._drawRiskAnalysis(item);
        }));
        this.systemRiskAnalysisDerive.length>0 && $.each(this.systemRiskAnalysisDerive,this.proxy(function(index,item){
        	
            	    item.threats= item.residualRiskThreatMappings;
                    item.errors = item.residualRiskErrorMappings,
                    item.fullname = item.creator,
                    item.editable = true;
        	this._drawRiskAnalysis_derive (item);
        }))
        
        
        /**
	     * @int 总结评论填值
	     */
      this.conclusion &&   this.text_summrize.val(this.conclusion.conclusion);
        
        /**
         * @int 权限设置
         */
        this.editable = this._options.editable;
        this.statusCategory  = this._options.statusCategory;
        if(this.editable && this.statusCategory!=="COMPLETE"){
        	/**
             * @desc begin调试阶段
             */
            this.qid("btn_add").unbind("click").click(this.proxy(this.on_add_click));
            this.qid("btn_release").unbind("click").click(this.proxy(this.on_release_click));
            this.tableContainer.off("click", "i.addRiskThreatErrorMapping").on("click", "i.addRiskThreatErrorMapping", this.proxy(this.on_addRiskThreatErrorMapping_click));
            this.tableContainer.off("click", "i.removeRiskAnalysis").on("click", "i.removeRiskAnalysis", this.proxy(this.on_removeRiskAnalysis_click));
            this.tableContainer.off("click", "button.addClause").on("click", "button.addClause", this.proxy(this.on_addClause_click));
            this.tableContainer.off("click", "i.removeClause").on("click", "i.removeClause", this.proxy(this.on_removeClause_click));
            this.tableContainer.off("click", "button.removeRiskThreatErrorMapping").on("click", "i.removeRiskThreatErrorMapping", this.proxy(this.on_removeRiskThreatErrorMapping_click));
            this.tableContainer.off("click", "i.editText").on("click", "i.editText", this.proxy(this.on_editMappingText_click));
            this.tableContainer.off("click", "i.editText_grade").on("click", "i.editText_grade", this.proxy(this.on_editMappingText_click_grade));
            this.tableContainer.off("click", "input:checkbox.generate").on("click", "input:checkbox.generate", this.proxy(this.on_editMappingGenerate_click));
            this.tableContainer.off("click", ".submitRiskAnalysis").on("click", ".submitRiskAnalysis", this.proxy(this.on_submitRiskAnalysis_click));
            this.tableContainer.off("click", "a.actionItem").on("click", "a.actionItem", this.proxy(this.on_actionItem_click));
            /*end*/
            /**
             * @desc begin调试阶段
             */
            this.tableDerive.off("click", "i.addRiskThreatErrorMapping").on("click", "i.addRiskThreatErrorMapping", this.proxy(this.on_addRiskThreatErrorMapping_click_derive));
            this.tableDerive.off("click", "i.removeRiskAnalysis").on("click", "i.removeRiskAnalysis", this.proxy(this.on_removeRiskAnalysis_click));
            this.tableDerive.off("click", "button.addClause").on("click", "button.addClause", this.proxy(this.on_addClause_click));
            this.tableDerive.off("click", "i.removeClause").on("click", "i.removeClause", this.proxy(this.on_removeClause_click));
            this.tableDerive.off("click", "button.removeRiskThreatErrorMapping").on("click", "button.removeRiskThreatErrorMapping", this.proxy(this.on_removeRiskThreatErrorMapping_click));
            this.tableDerive.off("click", "i.editText").on("click", "i.editText_derive", this.proxy(this.on_editMappingText_click_derive));
            this.tableDerive.off("click", "i.editText").on("click", "i.editText", this.proxy(this.on_editMappingText_click));
            this.tableDerive.off("click", "input:checkbox.generate").on("click", "input:checkbox.generate", this.proxy(this.on_editMappingGenerate_click));
            this.tableDerive.off("click", ".submitRiskAnalysis").on("click", ".submitRiskAnalysis", this.proxy(this.on_submitRiskAnalysis_click));
            this.tableDerive.off("click", "button.actionItem").on("click", "button.actionItem", this.proxy(this.on_actionItem_click));
            
            this.tableDerive.off("click", "i.removeRiskAnalysis_derive").on("click", "i.removeRiskAnalysis_derive", this.proxy(this.on_removeRiskAnalysis_click_derive));
            /**
             * @int 总结评论块
             */
            this.edit_summrize.unbind("click").on("click",this.proxy(this.editSummrize));
        };
        /*鼠标悬停事件*/
        this.tableContainer.on('mouseover', '.descriptionTitle', this.proxy(this.title_show)).on('mouseout', '.descriptionTitle', this.proxy(this.title_back));
        this.tableDerive.on('mouseover', '.descriptionTitle', this.proxy(this.title_show)).on('mouseout', '.descriptionTitle', this.proxy(this.title_back));
        /**
         * @int 阻止机制
         */
        this.tableContainer.on('mouseover', '.Sspan', this.proxy(function(event){
        	event.stopPropagation(); 
        }));
        this.tableContainer.on('mouseover', '.Pspan', this.proxy(function(event){
        	event.stopPropagation(); 
        }));
        this.tableContainer.on('mouseover', '.accept', this.proxy(function(event){
        	event.stopPropagation(); 
        }));
        this.tableDerive.on('mouseover', '.Span', this.proxy(function(){
        	event.stopPropagation(); 
        }));
        this.tableDerive.on('mouseover', '.Pspan', this.proxy(function(event){
        	event.stopPropagation(); 
        }));
        this.tableDerive.on('mouseover', '.accept', this.proxy(function(event){
        	event.stopPropagation(); 
        }));
        
    },
  
   /**
    * @int 发布
    */
    on_release_click: function() {
        var clz = $.u.load("com.sms.common.confirm");
        var confirm = new clz({
            "buttons": {
                "ok": {
                    "click": this.proxy(function() {
                        $.u.ajax({
                            url: $.u.config.constant.smsmodifyserver,
                            type: "post",
                            dataType: "json",
                            data: {
                                "tokenid": $.cookie("tokenid"),
                                "method": "distributeActionItems",
                                "riskAnalysisId": this._options.riskId
                            }
                        }, confirm.confirmDialog.parent(), {
                            size: 2,
                            backgroundColor: "#fff"
                        }).done(this.proxy(function(resp) {
                            if (resp.success) {
                                confirm.confirmDialog.dialog("close");
                                $.u.alert.success("发布成功！", 3000);
                            }
                        }));
                    })
                }
            }
        });

    },
    /**
     * @int 风险分析添加button
     */
    on_add_click: function() {
        if (this.addRiskAnalysisDialog == null) {
            this.addRiskAnalysisDialog = this.qid("addDialog").removeClass("hidden").dialog({
                title: this._i18n.addRiskAnalysisDialog.title,
                width: 520,
                modal: true,
                resizable: false,
                autoOpen: false,
                create: this.proxy(this.on_addRiskAnalysisDialog_create),
                close: this.proxy(function() {
                    this.qid("system").select2("val", null);
                }),
                buttons: [{
                    "text": this._i18n.addRiskAnalysisDialog.buttons.ok,
                    "click": this.proxy(this.on_addRiskAnalysisDialog_save)
                }, {
                    "text": this._i18n.addRiskAnalysisDialog.buttons.cancel,
                    "class": "aui-button-link",
                    "click": this.proxy(function() {
                        this.addRiskAnalysisDialog.dialog("close");
                    })
                }]
            });
        }
        this.addRiskAnalysisDialog.dialog("open");
    },
    /**
     * @int 提交
     */
    on_submitRiskAnalysis_click: function(e) {
        var $this = $(e.currentTarget),
            riskAnalysisId = parseInt($this.attr("data-riskAnalysisId"));
        var clz = $.u.load("com.sms.common.confirm");
        var confirm = new clz({
            "body": this._i18n.messages.confirmSubmitRiskAnalysis,
            "buttons": {
                "ok": {
                    "click": this.proxy(function() {
                        this._ajax({
                            url: $.u.config.constant.smsmodifyserver,
                            data: {
                                "method": "stdcomponent.update",
                                "dataobject": "riskAnalysis",
                                "dataobjectid": riskAnalysisId,
                                "obj": JSON.stringify({
                                    "status": this._i18n.status.submitted
                                })
                            },
                            block: $this.closest(".riskAnalysisTable"),
                            callback: this.proxy(function(response) {
                                if (response.success) {
                                    confirm.confirmDialog.dialog("close");
                                    $this.closest("th").remove();
                                }
                            })
                        });
                    })
                }
            }
        });
    },
    /**
     * @int 增加危险源 风险分析
     */
    on_addRiskThreatErrorMapping_click: function(e) {
        var $this = $(e.currentTarget),
            type = $this.attr("data-type"),
            checkedArray = [],
            riskAnalysisId = parseInt($this.attr("data-riskAnalysisId")),
            sysTypeId = parseInt($this.attr("data-sysTypeId"));

        checkedArray = $.map($this.closest("table").find("tbody > tr"), function(tr, e) {
            return parseInt($(tr).attr("data-threat-error-id"));
        });

        this.riskThreatErrorMappingDialog && this.riskThreatErrorMappingDialog.destroy();
        var clz = $.u.load("com.sms.detailmodule.riskAnalysis.riskThreatErrorMappingDialog");
        this.riskThreatErrorMappingDialog = new clz(this.$.find("div[umid=riskThreatErrorMappingDialog]"), {
            "type": type,
            "sysTypeId": sysTypeId,
            "checkedArray": checkedArray
        });
        this.riskThreatErrorMappingDialog.override({
            save: this.proxy(function(comp, formdata) {
                if (type == "threat") {
                    this._addRiskThreatMapping({
                        "objs": $.map(formdata.threats, function(item, idx) {
                            return {
                                "threat": item.id,
                                "riskAnalysis": riskAnalysisId
                            };
                        }),
                        "container": $this.closest("table").find(".threat-tbody"),
                        "containerDerive": this.tableDerive.find(".threat-tbody")
                    });
                } else if (type == "error") {
                    this._addRiskErrorMapping({
                        "objs": $.map(formdata.errors, function(item, idx) {
                            return {
                                "error": item.id,
                                "riskAnalysis": riskAnalysisId
                            };
                        }),
                        "container": $this.closest("table").find(".error-tbody"),
                        "containerDerive": this.tableDerive.find(".error-tbody")
                    });
                }
            })
        });
        this.riskThreatErrorMappingDialog.open();
    },
    
    /**
     * @int 增加危险源_衍生风险_威胁
     */
    on_addRiskThreatErrorMapping_click_derive: function(e) {
        var $this = $(e.currentTarget),
            type = $this.parents("table").find(".addDerive").find("i").attr("data-type"),
            checkedArray = [],
            riskAnalysisId = parseInt($this.parents("table").find(".addDerive").find("i").attr("data-riskAnalysisId")),
            sysTypeId = parseInt($this.parents("table").find(".addDerive").find("i").attr("data-systypeid")),
            residualRiskThreatMappingId = parseInt($this.parents("tr").attr("systemanalysisriskthreatmappingid")),
            residualRiskErrorMappingId = parseInt($this.parents("tr").attr("systemanalysisriskerrormappingid")),
            checkedArray = $.map($this.closest("table").find("tbody > tr"), function(tr, e) {
            return parseInt($(tr).attr("data-threat-error-id"));
        });

        this.riskThreatErrorMappingDialog && this.riskThreatErrorMappingDialog.destroy();
        var clz = $.u.load("com.sms.detailmodule.riskAnalysis.riskThreatErrorMappingDialog");
        this.riskThreatErrorMappingDialog = new clz(this.$.find("div[umid=riskThreatErrorMappingDialog]"), {
            "type": type,
            "sysTypeId": sysTypeId,
            "checkedArray": checkedArray
        });
        
        this.riskThreatErrorMappingDialog.override({
            save: this.proxy(function(comp, formdata) {
                if (type == "threat") {
                    this._addRiskThreatMapping_derive({
                        "objs": $.map(formdata.threats, function(item, idx) {
                            return {
                                "threat": item.id,
                                "residualDerivativeRisk": riskAnalysisId,
                                "residualRiskThreatMappingId":residualRiskThreatMappingId,
                            };
                        }),
                        "containerDerive": this.tableDerive.find(".threat-tbody"),
                        "directing":$this,
                        "deleteTE_id":$this.parents("tr").attr("deleteTE-id")
                    });
                } else if (type == "error") {
                    this._addRiskErrorMapping_derive({
                        "objs": $.map(formdata.errors, function(item, idx) {
                            return {
                                "error": item.id,
                                "residualDerivativeRisk": riskAnalysisId,
                                "residualRiskErrorMappingId":residualRiskErrorMappingId
                            };
                        }),
                        "containerDerive": this.tableDerive.find(".error-tbody"),
                        "directing":$this,
                        "deleteTE_id":$this.parents("tr").attr("deleteTE-id")
                    });
                }
            })
        });
        this.riskThreatErrorMappingDialog.open();
    },
    
    /**
     * @int 添加条款
     */
    on_addClause_click: function(e) {
        var $this = $(e.currentTarget),
            type = $this.attr("data-type");
            threatOrErrorId = parseInt($this.attr("data-threat-error-id")),
            mappingId = parseInt($this.attr("data-mappingId")),
            obj = {};
        if (!this.selectControlDialog) {
            var clz = $.u.load("com.sms.detailmodule.riskAnalysis.selectControl");
            this.selectControlDialog = new clz(this.$.find("div[umid=selectControlDialog]"));
        }
        this.selectControlDialog.override({
            save: this.proxy(function(newIds) {
            	if(type=='threat'){
                	type='riskThreatMapping'
                }else if(type=='error'){
                	type='riskErrorMapping'
                };
                this._addClause({
                    "objs": $.map(newIds, function(newId, idx) {
                        obj = {};
                        obj[type] = mappingId;
                        obj.control = newId;
                        return obj;
                    }),
                    "container": $this.closest("tr").find("ol.clauses")
                });
            })
        });
        this.selectControlDialog.open({
            "type": type,
            "threatOrErrorId": threatOrErrorId
        });
    },
    /**
     * @int删除风险分析
     */
    on_removeRiskAnalysis_click: function(e) {
        var $this = $(e.currentTarget),
            id = parseInt($this.attr("data-riskAnalysisId"));
        $.u.load("com.sms.common.stdcomponentdelete");
        if (!$this.closest(".riskAnalysisTable").find("tbody.threat-tbody").is(":empty") || !$this.closest(".riskAnalysisTable").find("tbody.error-tbody").is(":empty")) {
            $.u.alert.error(this._i18n.messages.notAllowDeleteRiskAnalysis, 1000 * 3);
            return;
        }
        (new com.sms.common.stdcomponentdelete({
            body: "<div>" +
                "<div class='alert alert-warning'>" +
                "<span class='glyphicon glyphicon-exclamation-sign'></span>确认删除？" +
                "</div>" +
                "</div>",
            title: "确认删除",
            dataobject: "systemAnalysisRiskAnalysis",
            dataobjectids: JSON.stringify([id])
        })).override({
            refreshDataTable: this.proxy(function() {
                $this.closest(".riskAnalysisTable").fadeOut(function() {
                    $(this).remove();
                });
                $.each(this.tableDerive.find(".riskAnalysisTableDerive"),this.proxy(function(index,item){
                	var systemAnalysisRiskAnalysisId=$(item).attr("systemAnalysisRiskAnalysisid");
                	    if(systemAnalysisRiskAnalysisId==id){
                	    	/*
                	         * @ title 浏览器
                	         */
                	        var agent = navigator.userAgent.toLowerCase();
                	        
                	        if(agent.indexOf("edge") > 0){//edge流浪器
                	        	item.removeNode(this);
                	        }else if(agent.indexOf("chrome") > 0){
                	        	item.remove();
                	        }else if(agent.indexOf("msie") > 0){
                	        	item.removeNode(this);
                	            }else if(agent.indexOf("mozilla") > 0){
                	            	item.removeNode(this);
                	            }else{
                	            	item.removeNode(this)
                	            }
                	    }
                }))
            })
        });
    },
    /**
     * @int 删除风险分析 ADD衍生风险威胁差错
     */
    on_removeRiskAnalysis_click_derive: function(e) {
        var $this = $(e.currentTarget),
            id = parseInt($this.attr("data-deriveriskanalysisid"));
        var type = $this.attr("data-type");
        if(type=="residualRiskThreatMapping"){
        	type="derivativeRiskThreatMapping";
        }else if(type=="residualRiskErrorMapping"){
        	type="derivativeRiskErrorMapping";
        }
        $.u.load("com.sms.common.stdcomponentdelete");
        /*if (!$this.closest(".riskAnalysisTable").find("tbody.threat-tbody").is(":empty") || !$this.closest(".riskAnalysisTable").find("tbody.error-tbody").is(":empty")) {
            $.u.alert.error(this._i18n.messages.notAllowDeleteRiskAnalysis, 1000 * 3);
            return;
        }*/
        (new com.sms.common.stdcomponentdelete({
            body: "<div>" +
                "<div class='alert alert-warning'>" +
                "<span class='glyphicon glyphicon-exclamation-sign'></span>确认删除？" +
                "</div>" +
                "</div>",
            title: "确认删除",
            dataobject: type,
            dataobjectids: JSON.stringify([id])
        })).override({
            refreshDataTable: this.proxy(function() {
            	$this.parents("tr").remove();
            })
        });
    },
    /**
     * @int 增加行动项
     */
    on_actionItem_click: function(e) {
    	
        var $this = $(e.currentTarget),
            clauseId = parseInt($this.attr("data-id")),
            title = $this.attr("data-title"),
            editable = $this.closest("tr").attr("data-editable");
        var $ation = $this.next();
        this.actionItemDialog && this.actionItemDialog.destroy();
        var clz = $.u.load("com.sms.detailmodule.riskAnalysis.actionItemDialog");
        this.actionItemDialog = new clz(this.$.find("div[umid=actionItemDialog]"), {
            "mode": "TEM",
            "editable": eval(editable) && this._options.editable,
            "cate": "CLAUSE" 
        });
        this.actionItemDialog.override({
            refreshControlMeasure: this.proxy(function() {
                this._ajax({
                    data: {
                        "method": "stdcomponent.getbysearch",
                        "dataobject": "actionItem",
                        "rule": JSON.stringify([[{"key":"systemAnalysisClause.id","value":clauseId}]])
                    },
                    block: $this.closest("td"),
                    callback: this.proxy(function(response) {
                        if (response.success && response.data) {
                           this.action_draw(response.data.aaData,$ation);
                        }
                    })
                });
            })
        });
        this.actionItemDialog.open(clauseId, title);
    },
    /**
     * @int绘制行动项
     */
    action_draw:function(data,$ation){
    	var $container=$ation;
    	$container.empty();
    	$.each(data,this.proxy(function(index,item){
    		$(this.ACTION.replace(/#\{id\}/g, item.id)
                    .replace(/#\{personLable\}/g, item.confirmMan[0].fullname || "")
                    .replace(/#\{actiontitle\}/g,item.description)
                    .replace(/#\{action\}/g, item.description.length>4 ? item.description.substring(0,4) + "..." : item.description || "")
                    .replace(/#\{status\}/g, item.status || "")
                    .replace(/#\{dueDate\}/g, item.completionDeadLine || ""))
                    .appendTo($container);	
    	})); 
    	var $botton=$container;
    	$container.css({
    		"position":"relative",
    		top:"-7px"
    	})
    	if($container.parents("td").height()>50){
    		/**
    		 * @int 设置可接受不可接受背景颜色
    		 */
    		$container.parents("td").prev("td").find(".bgcolor").css({height:$container.parents("td").css("height"),
    			                                                       paddingTop:$container.parents("td").height()/5+'px'});
    		$container.parents("td").prev("td").find(".editText_grade").css({height:$container.parents("td").css("height"),
                paddingTop:$container.parents("td").height()/5+'px'});
    		/**
    		 * @title 条款位置
    		 */
    		$container.prev().css({
    			"position":"absolute",
    			"left":"4%",
    			"padding":"0px",
    			"zIndex":999,
                top:$container.parents("li").height()/4+'px'});
    		/**
    		 * @Int 删除设置
    		 */
    		$container.prev().prev().css({
    			"position":"absolute",
    			"zIndex":999,
                top:$container.parents("li").height()/3+'px'});
    	}else if($container.parents("td").height()<50){
    		/**
    		 * @int 设置可接受不可接受背景颜色
    		 */
    		$container.parents("td").prev("td").find(".bgcolor").css({height:"50px",
                                                                      paddingTop:"4px"});
    		/**
    		 * @title 条款位置
    		 */
    		debugger
    		$container.prev().css({
    			"position":"absolute",
                top:"10px"});
    		/**
    		 * @Int 删除设置
    		 */
    		$container.prev().prev().css({
    			"position":"absolute",
                top:'10px'});
    	}
    },
    /** 
     * @int移除条款
     */
    on_removeClause_click: function(e) {
        var $this = $(e.currentTarget),
            id = parseInt($(e.currentTarget).attr("data-id"));
        $.u.load("com.sms.common.stdcomponentdelete");
        (new com.sms.common.stdcomponentdelete({
            body: "<div>" +
                "<div class='alert alert-warning'>" +
                "<span class='glyphicon glyphicon-exclamation-sign'></span>确认删除?" +
                "</div>" +
                "</div>",
            title: "确认删除",
            dataobject: "systemAnalysisClause",
            dataobjectids: JSON.stringify([id])
        })).override({
            refreshDataTable: this.proxy(function() {
                $this.closest("li").remove();
            })
        });
    },
    /**
     * @int编辑风险分析
     */
    on_editMappingText_click: function(e) {
        var $this = $(e.currentTarget),
            id = parseInt($this.attr("data-mappingId")),
            text = $this.prev().attr("title"),
            type = $this.attr("data-type");
        this.mappingTextDialog && this.mappingTextDialog.destroy();
        var clz = $.u.load("com.sms.common.stdComponentOperate");
        this.mappingTextDialog = new clz(this.$.find("div[umid=mappingTextDialog]"), {
            dataobject: type,
            fields: [{
                "name": "text",
                "label": this._i18n.columns.riskAnalysis,
                "type": "text",
                "maxlength": 2000
            }],
            afterEdit: this.proxy(function(comp, formdata) {
                var $score = $this.closest("tr").find(".score");
                if (formdata.text) {
                    $score.removeClass("hidden");
                } else {
                    $score.addClass("hidden");
                }
                if(formdata.text && formdata.text.length){
                	$this.prev().text(formdata.text.substring(0,3) + "...");
                	$this.prev().attr("title",formdata.text);
                }else{
                	$this.prev().text(formdata.text);
                	$this.prev().attr("title",formdata.text);
                }
                
                $this.attr("data-text", formdata.text);
                this.mappingTextDialog.formDialog.dialog("close");
            })
        });
        this.mappingTextDialog.open({
            "title": this._i18n.columns.riskAnalysis,
            "data": {
                "id": id,
                "text": text
            }
        });
    },
    /**
     * @int 填写衍生风险分析等级
     */
    /**
     * @int 编辑风险分析风险等级
     */
    on_editMappingText_click_grade: function(e) {
        this.$this = $(e.currentTarget),
        $this  = $(e.currentTarget),
        id = parseInt($this.attr("data-mappingId")),
        text = $this.attr("data-text"),
        type = $this.attr("data-type");
        this.mappingTextDialog_derive=null;
    if(this.mappingTextDialog_derive==null){
    this.mappingTextDialog_derive = this.qid("riskDeriveDialog").removeClass("hidden").dialog({
        title: "编辑分析等级",
        width: 520,
        modal: true,
        resizable: false,
        autoOpen: false,
        create: this.proxy(function(){
        	
        }),
        close: this.proxy(function() {
        	this.riskLevelP.val("");
        	this.riskLevelS.val("");
        }),
        open:this.proxy(function(){
        	this.riskLevelP.val($this.parents("td").find(".Pspan").html());
        	this.riskLevelS.val($this.parents("td").find(".Sspan").html());
        	this.riskLevelPS.val(Number(this.riskLevelP.val()) * this.riskLevelS.val());
        }),
        buttons: [{
            "text": "确认",
            "click": this.proxy(function(){
                this._ajax({
                    url: $.u.config.constant.smsmodifyserver,
                    data: {
                        "method": "stdcomponent.update",
                        "dataobject": type,
                        "dataobjectid": id,
                        "obj": JSON.stringify({
                        	"riskLevelP":Number(this.riskLevelP.val()),
                        	"riskLevelS":Number(this.riskLevelS.val())
                        })
                    },
                    callback: this.proxy(function(response) {
                        if (response.success) {
                        	$.u.ajax({
                        		url: $.u.config.constant.smsqueryserver,
                        		data: {
                        			"tokenid": $.cookie("tokenid"),
                                    "method": "stdcomponent.getbyids",
                                    "dataobject": type,
                                    "dataobjectid": JSON.stringify([id])
                                },
                        		
                        	}).done(this.proxy(function(res){
                        		var data=res.data[0];
                        		this.data=data;
                        		 if(data.colour=="R"){
                         	    	data.colour='#FF5B5B';
                         	    	data.accept="不可接受";
                         	    }else if(data.colour=="G"){
                         	    	data.colour='#00FF40';
                         	    	data.accept="可接受";
                         	    }else if(data.colour=='Y'){
                         	    	data.colour="#FFFF51";
                         	    	data.accept="控制后可接受";
                         	    }else {
                         	    	data.accept="可接受";
                         	    	data.colour='#00FF40';
                         	    }
                        		 $this.parents("td").css({"background-color":data.colour});
                        		 $this.parents("td").find(".Pspan").html(data.riskLevelP);
                        		 $this.parents("td").find(".Sspan").html(data.riskLevelS);
                        		 $this.parents("td").find(".accept").html(data.accept);
                        		 
                        	}))
                        	this.mappingTextDialog_derive.dialog("close");
                        }
                    })
                });
            
            	
            	
            })
        }, {
            "text": "取消",
            "class": "aui-button-link",
            "click": this.proxy(function() {
                this.mappingTextDialog_derive.dialog("close");
            })
        }]
    });
    }
   this.mappingTextDialog_derive.dialog("open");
},
    /**
     * @int编辑风险等级 && 剩余衍生风险
     */
    on_editMappingText_click_derive: function(e) {
            this.$this = $(e.currentTarget),
            $this  = $(e.currentTarget),
            id = parseInt($this.attr("data-mappingId")),
            text = $this.attr("data-text"),
            type = $this.attr("data-type");
            this.mappingTextDialog_derive=null;
        if(this.mappingTextDialog_derive==null){
        this.mappingTextDialog_derive = this.qid("riskDeriveDialog").removeClass("hidden").dialog({
            title: "编辑分析等级",
            width: 520,
            modal: true,
            resizable: false,
            autoOpen: false,
            create: this.proxy(function(){
            	
            }),
            close: this.proxy(function() {
            	this.riskLevelP.val("");
            	this.riskLevelS.val("")
            }),
            open:this.proxy(function(){
            	this.riskLevelP.val($this.parents("td").find(".Pspan").html());
            	this.riskLevelS.val($this.parents("td").find(".Sspan").html());
            	this.riskLevelPS.val(Number(this.riskLevelP.val()) * this.riskLevelS.val());
            }),
            buttons: [{
                "text": "确认",
                "click": this.proxy(function(){
                    this._ajax({
                        url: $.u.config.constant.smsmodifyserver,
                        data: {
                            "method": "stdcomponent.update",
                            "dataobject": type,
                            "dataobjectid": id,
                            "obj": JSON.stringify({
                            	"riskLevelP":Number(this.riskLevelP.val()),
                            	"riskLevelS":Number(this.riskLevelS.val())
                            })
                        },
                        callback: this.proxy(function(response) {
                            if (response.success) {
                            	$.u.ajax({
                            		url: $.u.config.constant.smsqueryserver,
                            		data: {
                            			"tokenid": $.cookie("tokenid"),
                                        "method": "stdcomponent.getbyids",
                                        "dataobject": type,
                                        "dataobjectid": JSON.stringify([id])
                                    },
                            		
                            	}).done(this.proxy(function(res){
                            		var data=res.data[0];
                            		this.data=data;
                            		 if(data.colour=="R"){
                             	    	data.colour='#FF5B5B';
                             	    	data.accept="不可接受";
                             	    }else if(data.colour=="G"){
                             	    	data.colour='#00FF40';
                             	    	data.accept="可接受";
                             	    }else if(data.colour=='Y'){
                             	    	data.colour="#FFFF51";
                             	    	data.accept="控制后可接受";
                             	    }else {
                             	    	data.accept="可接受";
                             	    	data.colour='#00FF40';
                             	    }
                            		 $this.parents("td").css({"background-color":data.colour});
                            		 $this.parents("td").find(".Pspan").html(data.riskLevelP);
                            		 $this.parents("td").find(".Sspan").html(data.riskLevelS);
                            		 $this.parents("td").find(".accept").html(data.accept);
                            		 
                            	}))
                            	this.mappingTextDialog_derive.dialog("close");
                            }
                        })
                    });
                
                	
                	
                })
            }, {
                "text": "取消",
                "class": "aui-button-link",
                "click": this.proxy(function() {
                    this.mappingTextDialog_derive.dialog("close");
                })
            }]
        });
        }
       this.mappingTextDialog_derive.dialog("open");
    },
    /**
     * @int 
     */
    on_editMappingGenerate_click: function(e) {
        var $this = $(e.currentTarget),
            id = parseInt($this.attr("data-id"));
        this._ajax({
            url: $.u.config.constant.smsmodifyserver,
            data: {
                "method": "stdcomponent.update",
                "dataobject": "clause",
                "dataobjectid": id,
                "obj": JSON.stringify({
                    "generate": $this.is(":checked")
                })
            },
            block: $this.closest("li"),
            callback: function(response) {}
        });
    },
    
    /**
     * @int 删除危险源
     */
    on_removeRiskThreatErrorMapping_click: function(e) {
        var $this = $(e.currentTarget),
            id = parseInt($(e.currentTarget).attr("data-id")),
            type = $this.attr("data-type");
        if ($this.closest("tr").find("ol.clauses > li").length > 0) {
            $.u.alert.error(this._i18n.messages.notAllowDeleteMapping, 1000 * 3);
            return;
        }
        $.u.load("com.sms.common.stdcomponentdelete");
        (new com.sms.common.stdcomponentdelete({
            body: "<div>" +
                "<div class='alert alert-warning'>" +
                "<span class='glyphicon glyphicon-exclamation-sign'></span>确认删除?" +
                "</div>" +
                "</div>",
            title: "确认删除",
            dataobject: type,
            dataobjectids: JSON.stringify([id])
        })).override({
            refreshDataTable: this.proxy(function() {
                $this.closest("tr").remove();
                $.each(this.tableDerive.find(".threatError"),this.proxy(function(index,item){
                	if(type=='systemAnalysisRiskErrorMapping'){
                		var systemAnalysisRiskErrorMappingId=$(item).attr("deleteTE-id");
                	    if(systemAnalysisRiskErrorMappingId==id){
                	    	/*
                	         * @ title 浏览器
                	         */
                	        var agent = navigator.userAgent.toLowerCase();
                	        
                	        if(agent.indexOf("edge") > 0){//edge流浪器
                	        	item.removeNode(this);
                	        }else if(agent.indexOf("chrome") > 0){
                	        	item.remove();
                	        }else if(agent.indexOf("msie") > 0){
                	        	item.removeNode(this);
                	            }else if(agent.indexOf("mozilla") > 0){
                	            	item.removeNode(this);
                	            }else{
                	            	item.removeNode(this);
                	            }
                	    }
                	}else if(type=='systemAnalysisRiskThreatMapping'){
                		var systemAnalysisRiskThreatMappingId=$(item).attr("deleteTE-id");
                	    if(systemAnalysisRiskThreatMappingId==id){
                	    	/**
                	         * @ title 浏览器
                	         */
                	        var agent = navigator.userAgent.toLowerCase();
                	        
                	        if(agent.indexOf("edge") > 0){//edge流浪器
                	        	item.removeNode(this);
                	        }else if(agent.indexOf("chrome") > 0){
                	        	item.remove();
                	        }else if(agent.indexOf("msie") > 0){
                	        	item.removeNode(this);
                	            }else if(agent.indexOf("mozilla") > 0){
                	            	item.removeNode(this);
                	            }else{
                	            	item.removeNode(this)
                	            }
                	      
                	    }
                	}
                }))
                
            })
        });
    },
    /**
     * @title添加危险源创建时
     */
    on_addRiskAnalysisDialog_create: function() {
        this.qid("system").select2({
            width: 300,
            ajax: {
                url: $.u.config.constant.smsqueryserver,
                type: "post",
                data: this.proxy(function(term, page) {
                    return {
                        "tokenid": $.cookie("tokenid"),
                        "method": "stdcomponent.getbysearch",
                        "dataobject": "dictionary",
                        "rule": JSON.stringify([
                            [{
                                "key": "name",
                                "op": "like",
                                "value": term
                            }],
                            [{
                                "key": "type",
                                "value": "系统分类"
                            }]
                        ]),
                        "start": (page - 1) * this._SELECT2_PAGE_LENGTH,
                        "length": this._SELECT2_PAGE_LENGTH
                    };
                }),
                results: this.proxy(function(response, page) {
                    if (response.success) {
                        return {
                            "results": response.data.aaData,
                            "more": response.data.iTotalRecords > (page * this._SELECT2_PAGE_LENGTH)
                        };
                    } else {
                        $.u.alert.error(response.reason, 1000 * 3);
                    }
                })
            },
            formatSelection: function(item) {
                return item.name;
            },
            formatResult: function(item) {
                return item.name;
            }
        });
    },
    /**
     * 添加风险分析dialog确认
     */
    on_addRiskAnalysisDialog_save: function() {
    	
        var system = this.qid("system").select2("data");
        if (!system) {
            this.qid("system").select2("focus");
        } else {
            this._ajax({
                url: $.u.config.constant.smsmodifyserver,
                data: {
                    "method": "stdcomponent.add",
                    "dataobject": "systemAnalysisRiskAnalysis",
                    "obj": JSON.stringify({
                        "activity": this._options.activity,
                        "system": system.id
                    })
                },
                block: this.addRiskAnalysisDialog.parent(),
                callback: this.proxy(function(response) {
                    if (response.success) {
                        var user = JSON.parse($.cookie("uskyuser"));
                        this._drawRiskAnalysis({
                            "id": response.data,
                            "system": system,
                            "threats": [],
                            "errors": [],
                            "fullname": user.fullname,
                            "username": user.username,
                            "lastUpdate": (new Date()).format("yyyy-MM-dd HH:mm:ss"),
                            "editable": true,
                            "status": this._i18n.status.draft
                        });
                        /**
                         * @int 衍生风险
                         */
                        $.u.ajax({
                        	url: $.u.config.constant.smsqueryserver,
                            data: {
                            	"tokenid": $.cookie("tokenid"),
                                "method": "stdcomponent.getbysearch",
                                "dataobject": "residualDerivativeRisk",
                                "rule": JSON.stringify([[{
                                    "key": 'systemAnalysisRiskAnalysisId',
                                    "value": response.data
                                }]])
                            },
                        }).done(this.proxy(function(res){
                        	this._drawRiskAnalysis_derive(res.data.aaData[0]);
                        }));
                        this.addRiskAnalysisDialog.dialog("close");
                    }
                })
            });
        }
    },
    options: function(opt) {
        if (opt) {
            $.extend(true, this._options, opt);
        }
    },
    // exec after fillForm
    entryMode: function() {
        if (!this._options.mode === this._MODE.VIEW) {
            this.$.find("input:checkbox.generate").attr("disabled", true);
        } else {
            this.qid("btn_add").unbind("click").click(this.proxy(this.on_add_click));
            this.qid("btn_release").unbind("click").click(this.proxy(this.on_release_click));
            this.tableContainer.off("click", "i.addRiskThreatErrorMapping").on("click", "i.addRiskThreatErrorMapping", this.proxy(this.on_addRiskThreatErrorMapping_click));
            this.tableContainer.off("click", "i.removeRiskAnalysis").on("click", "i.removeRiskAnalysis", this.proxy(this.on_removeRiskAnalysis_click));
            this.tableContainer.off("click", "button.addClause").on("click", "button.addClause", this.proxy(this.on_addClause_click));
            this.tableContainer.off("click", "i.removeClause").on("click", "i.removeClause", this.proxy(this.on_removeClause_click));
            this.tableContainer.off("click", "button.removeRiskThreatErrorMapping").on("click", "button.removeRiskThreatErrorMapping", this.proxy(this.on_removeRiskThreatErrorMapping_click));
            this.tableContainer.off("click", "i.editText").on("click", "i.editText", this.proxy(this.on_editMappingText_click));
            this.tableContainer.off("click", "input:checkbox.generate").on("click", "input:checkbox.generate", this.proxy(this.on_editMappingGenerate_click));
            this.tableContainer.off("click", ".submitRiskAnalysis").on("click", ".submitRiskAnalysis", this.proxy(this.on_submitRiskAnalysis_click));
        }
        this.tableContainer.off("click", "button.actionItem").on("click", "button.actionItem", this.proxy(this.on_actionItem_click));
    },
    fillForm: function(data) {
        if (data.riskAnalyses) {
            $.each(data.riskAnalyses, this.proxy(function(idx, item) {
                this._drawRiskAnalysis(item);
                this._drawRiskAnalysis_derive(item);
            }));
        }
    },
    /**
     * @Int 绘制表captain_content
     */
    _drawRiskAnalysis: function(data) {
        var $riskAnalysisTable = null,
            $threatTbody = null,
            $errorTbody = null;
        $riskAnalysisTable = $(this._RISK_ANALYSIS_TABLE.replace(/#\{sysTypeId\}/g, data.system.id)
                .replace(/#\{creator\}/g, (data.fullname || "") + "（" + (data.username || "") + ")")
                .replace(/#\{lastUpdate\}/g, data.lastUpdate)
                .replace(/#\{sysTypeName\}/g, data.system.name)
                .replace(/#\{sysTypeName\}/g, data.system.name)
                .replace(/#\{riskAnalysisId\}/g, data.id))
            .appendTo(this.tableContainer);
        $threatTbody = $riskAnalysisTable.find(".threat-tbody");
        $errorTbody = $riskAnalysisTable.find(".error-tbody");
        if (data.status !== this._i18n.status.draft) {
            $riskAnalysisTable.find(".submitRiskAnalysis").closest("th").remove();
        }
        $.each(data.threats, this.proxy(function(idx, item) {
            item.editable = data.editable;
            this._drawRiskThreatMapping(item, $threatTbody);
        }));
        $.each(data.errors, this.proxy(function(idx, item) {
            item.editable = data.editable;
            this._drawRiskErrorMapping(item, $errorTbody);
        }));
        if (data.editable !== true || this._options.editable !== true) {
            var $objs = $riskAnalysisTable.find(".mod-add,.mod-edit");
            $.each($objs, function(idx, obj) {
                if ($(obj).parent().is("th.operate-tool") || $(obj).parent().is("td.operate-tool")) {
                    $(obj).parent().removeClass("operate-tool");
                }
            });
            $riskAnalysisTable.find("input:checkbox.generate").attr("disabled", true);
            $objs.remove();
        }
    },
    /**
     * @int 绘制威胁表body
     */
    _drawRiskThreatMapping: function(data, container) {
    	    if(data.colour=="R"){
    	    	data.colour='#FF5B5B';
    	    	data.accept="不可接受";
    	    }else if(data.colour=="G"){
    	    	data.colour='#00FF40';
    	    	data.accept="可接受";
    	    }else if(data.colour=='Y'){
    	    	data.colour="#FFFF51";
    	    	data.accept="控制后可接受";
    	    }else {
    	    	data.accept="可接受";
    	    	data.colour='#00FF40';
    	    }
        var $tr = $(this._TR.replace(/#\{id\}/g, data.id)
            .replace(/#\{threatErrorId\}/g, data.threat.id)
            .replace(/#\{code\}/g, data.threat.num)
            .replace(/#\{riskLevelP\}/g, data.riskLevelP || "")
            .replace(/#\{riskLevelS\}/g, data.riskLevelS || "")
            .replace(/#\{colour\}/g, data.colour || "")
            .replace(/#\{accept\}/g, data.accept || "")
            .replace(/#\{name\}/g, data.threat.name.substring(0,6) + "...")
            .replace(/#\{nametitle\}/g, data.threat.name)
            .replace(/#\{text\}/g, data.text && data.text.length>3 && data.text.substring(0,3) + "..." || data.text || "")
            .replace(/#\{texttitle\}/g, data.text || "")
            .replace(/#\{score\}/g, data.score)
            .replace(/#\{type\}/g, "systemAnalysisRiskThreatMapping")
            .replace(/#\{threatOrError\}/g, "threat")
            .replace(/#\{editable\}/g, data.editable)
            .replace(/#\{mark\}/g, this._getLabelTheme(data.mark))).appendTo(container);
        if (data.systemAnalysisClauses) {
            $.each(data.systemAnalysisClauses, this.proxy(function(idx, item) {
                this._drawClause(item, $tr.find("ol.clauses"),idx);
            }));
        }
        if (data.text) {
            $tr.find(".score").removeClass("hidden");
        }
    },
    /**
     * @Int 绘制表captain_content 衍生风险
     */
    _drawRiskAnalysis_derive: function(data) {
        var $riskAnalysisTable = null,
            $threatTbody = null,
            $errorTbody = null;
        $riskAnalysisTable = $(this._RISK_ANALYSIS_TABLE_DERIVE.replace(/#\{sysTypeId\}/g, data.systemId)
                .replace(/#\{creator\}/g, (data.fullname || "") + "（" + (data.username || "") + ")")
                .replace(/#\{lastUpdate\}/g, data.lastUpdate)
                .replace(/#\{systemAnalysisRiskAnalysisId\}/g, data.systemAnalysisRiskAnalysisId)
                .replace(/#\{sysTypeName\}/g, data.system)
                .replace(/#\{sysTypeName\}/g, data.system)
                .replace(/#\{riskAnalysisId\}/g, data.id))
            .appendTo(this.tableDerive);
        $threatTbody = $riskAnalysisTable.find(".threat-tbody");
        $errorTbody = $riskAnalysisTable.find(".error-tbody");
        if (data.status !== this._i18n.status.draft) {
            $riskAnalysisTable.find(".submitRiskAnalysis").closest("th").remove();
        }
        data.threats.length>0 && $.each(data.threats, this.proxy(function(idx, item) {
            item.editable = data.editable;
            this._drawRiskThreatMapping_derive(item, $threatTbody);
        }));
       
        
        data.errors.length>0 && $.each(data.errors, this.proxy(function(idx, item) {
            item.editable = data.editable;
            this._drawRiskErrorMapping_derive(item, $errorTbody);
        }));
       
        if (data.editable !== true || this._options.editable !== true) {
            var $objs = $riskAnalysisTable.find(".mod-add,.mod-edit");
            $.each($objs, function(idx, obj) {
                if ($(obj).parent().is("th.operate-tool") || $(obj).parent().is("td.operate-tool")) {
                    $(obj).parent().removeClass("operate-tool");
                }
            });
            
            $riskAnalysisTable.find("input:checkbox.generate").attr("disabled", true);
            $objs.remove();
        }
    },
    /**
     * @int 绘制威胁表body 衍生风险
     */
    _drawRiskThreatMapping_derive: function(data, container,mode) {
    	
				if(data.colour=="R"){
			    	data.colour='#FF5B5B';
			    	data.accept="不可接受";
			    }else if(data.colour=="G"){
			    	data.colour='#00FF40';
			    	data.accept="可接受";
			    }else if(data.colour=='Y'){
			    	data.colour="#FFFF51";
			    	data.accept="控制后可接受";
			    }else {
			    	data.accept="可接受";
			    	data.colour='#00FF40';
			    }
        var $tr = $(this._TR_DERIVE.replace(/#\{id\}/g, data.id)
            .replace(/#\{threatErrorId\}/g, data.threat.id)
            .replace(/#\{code\}/g, data.threat.num)
            .replace(/#\{deleteTE-id\}/g,data.systemAnalysisRiskThreatMappingId)
            .replace(/#\{riskLevelP\}/g, data.riskLevelP || "")
            .replace(/#\{riskLevelS\}/g, data.riskLevelS || "")
            .replace(/#\{derivecolor\}/g, data.derivecolor || "")
            .replace(/#\{colour\}/g, data.colour || "")
            .replace(/#\{accept\}/g, data.accept || "")
            .replace(/#\{name\}/g, data.threat.name.substring(0,6) + "...")
            .replace(/#\{nametitle\}/g, data.threat.name)
            .replace(/#\{text\}/g, data.text && data.text.length>3 && data.text.substring(0,3) + "..." || data.text || "")
            .replace(/#\{texttitle\}/g, data.text || "")
            .replace(/#\{score\}/g, data.score)
            .replace(/#\{sysTypeId\}/g, data.score)
            .replace(/#\{systemAnalysisRiskThreatMappingId\}/g,data.id)
            .replace(/#\{type\}/g, data.threat !==undefined ? "residualRiskThreatMapping" : residualRiskErrorMapping)
            .replace(/#\{threatOrError\}/g, "threat")
            .replace(/#\{editable\}/g, data.editable)
            .replace(/#\{mark\}/g, this._getLabelTheme(data.mark))).appendTo(container);
        /**
         * @int 绘制 威胁  衍生风险ADD
         */
        data.derivativeRiskThreatMappings.length>0 && $.each(data.derivativeRiskThreatMappings,this.proxy(function(index,item){
        	item.editable = data.editable;
        	item.derivecolor='#95CACA';
           this._drawRiskThreatMapping_derive_add(item, container);
        }));
        if (data.text) {
            $tr.find(".score").removeClass("hidden");
        }
    },
    /**
     * @int 绘制表body 衍生风险 ADD衍生威胁
     */
    _drawRiskThreatMapping_derive_add: function(data, container,directing,mode) {
    	
				if(data.colour=="R"){
			    	data.colour='#FF5B5B';
			    	data.accept="不可接受";
			    }else if(data.colour=="G"){
			    	data.colour='#00FF40';
			    	data.accept="可接受";
			    }else if(data.colour=='Y'){
			    	data.colour="#FFFF51";
			    	data.accept="控制后可接受";
			    }else {
			    	data.accept="可接受";
			    	data.colour='#00FF40';
			    }
				if(directing){
					var $tr = $(this.ADD_TR_DERIVE.replace(/#\{id\}/g, data.id)
				            .replace(/#\{threatErrorId\}/g, data.threat.id)
				            .replace(/#\{code\}/g, data.threat.num)
				            .replace(/#\{deleteTE-id\}/g,data.systemAnalysisRiskThreatMappingId)
				            .replace(/#\{riskLevelP\}/g, data.riskLevelP || "")
				            .replace(/#\{riskLevelS\}/g, data.riskLevelS || "")
				            .replace(/#\{derivecolor\}/g, data.derivecolor || "")
				            .replace(/#\{colour\}/g, data.colour || "")
				            .replace(/#\{accept\}/g, data.accept || "")
				            .replace(/#\{name\}/g, data.threat.name.substring(0,6) + "...")
				            .replace(/#\{nametitle\}/g, data.threat.name)
				            .replace(/#\{text\}/g, data.text && data.text.length>3 && data.text.substring(0,3) + "..." || data.text || "")
				            .replace(/#\{texttitle\}/g, data.text || "")
				            .replace(/#\{score\}/g, data.score)
				            .replace(/#\{sysTypeId\}/g, data.score)
				            .replace(/#\{systemAnalysisRiskThreatMappingId\}/g,data.id)
				            .replace(/#\{type\}/g, data.threat !==undefined ? "derivativeRiskThreatMapping" : derivativeRiskErrorMapping)
				            .replace(/#\{threatOrError\}/g, "threat")
				            .replace(/#\{editable\}/g, data.editable)
				            .replace(/#\{mark\}/g, this._getLabelTheme(data.mark)));
					         directing && directing.parents("tr").after($tr);
				}else{
					var $tr = $(this.ADD_TR_DERIVE.replace(/#\{id\}/g, data.id)
				            .replace(/#\{threatErrorId\}/g, data.threat.id)
				            .replace(/#\{code\}/g, data.threat.num)
				            .replace(/#\{deleteTE-id\}/g,data.systemAnalysisRiskThreatMappingId)
				            .replace(/#\{riskLevelP\}/g, data.riskLevelP || "")
				            .replace(/#\{riskLevelS\}/g, data.riskLevelS || "")
				            .replace(/#\{derivecolor\}/g, data.derivecolor || "")
				            .replace(/#\{colour\}/g, data.colour || "")
				            .replace(/#\{accept\}/g, data.accept || "")
				            .replace(/#\{name\}/g, data.threat.name.substring(0,6) + "...")
				            .replace(/#\{nametitle\}/g, data.threat.name)
				            .replace(/#\{text\}/g, data.text && data.text.length>3 && data.text.substring(0,3) + "..." || data.text || "")
				            .replace(/#\{texttitle\}/g, data.text || "")
				            .replace(/#\{score\}/g, data.score)
				            .replace(/#\{sysTypeId\}/g, data.score)
				            .replace(/#\{systemAnalysisRiskThreatMappingId\}/g,data.id)
				            .replace(/#\{type\}/g, data.threat !==undefined ? "derivativeRiskThreatMapping" : derivativeRiskErrorMapping)
				            .replace(/#\{threatOrError\}/g, "threat")
				            .replace(/#\{editable\}/g, data.editable)
				            .replace(/#\{mark\}/g, this._getLabelTheme(data.mark))).appendTo(container);
				}
        
           
        if (data.text) {
            $tr.find(".score").removeClass("hidden");
        }
    },
    /**
     * @int 绘制body 衍生风险 ADD衍生差错
     */
    _drawRiskErrorMapping_derive_add: function(data, container,directing,mode) {
				if(data.colour=="R"){
			    	data.colour='#FF5B5B';
			    	data.accept="不可接受";
			    }else if(data.colour=="G"){
			    	data.colour='#00FF40';
			    	data.accept="可接受";
			    }else if(data.colour=='Y'){
			    	data.colour="#FFFF51";
			    	data.accept="控制后可接受";
			    }else {
			    	data.accept="可接受";
			    	data.colour='#00FF40';
			    }
				if(directing){
					var $tr = $(this.ADD_TR_DERIVE.replace(/#\{id\}/g, data.id)
				            .replace(/#\{threatErrorId\}/g, data.error.id)
				            .replace(/#\{code\}/g, data.error.num)
				            .replace(/#\{deleteTE-id\}/g,data.systemAnalysisRiskErrorMappingId)
				            .replace(/#\{riskLevelP\}/g, data.riskLevelP || "")
				            .replace(/#\{riskLevelS\}/g, data.riskLevelS || "")
				            .replace(/#\{derivecolor\}/g, data.derivecolor || "")
				            .replace(/#\{colour\}/g, data.colour || "")
				            .replace(/#\{accept\}/g, data.accept || "")
				            .replace(/#\{name\}/g, data.error.name.substring(0,6) + "...")
				            .replace(/#\{nametitle\}/g, data.error.name)
				            .replace(/#\{text\}/g, data.text && data.text.length>3 && data.text.substring(0,3) + "..." || data.text || "")
				            .replace(/#\{texttitle\}/g, data.text || "")
				            .replace(/#\{score\}/g, data.score)
				            .replace(/#\{sysTypeId\}/g, data.score)
				            .replace(/#\{systemAnalysisRiskThreatMappingId\}/g,data.id)
				            .replace(/#\{type\}/g, data.error !==undefined ? "derivativeRiskErrorMapping" : derivativeRiskErrorMapping)
				            .replace(/#\{threatOrError\}/g, "threat")
				            .replace(/#\{editable\}/g, data.editable)
				            .replace(/#\{mark\}/g, this._getLabelTheme(data.mark)));
					         directing && directing.parents("tr").after($tr);
				}else{
					var $tr = $(this.ADD_TR_DERIVE.replace(/#\{id\}/g, data.id)
				            .replace(/#\{threatErrorId\}/g, data.error.id)
				            .replace(/#\{code\}/g, data.error.num)
				            .replace(/#\{deleteTE-id\}/g,data.systemAnalysisRiskErrorMappingId)
				            .replace(/#\{riskLevelP\}/g, data.riskLevelP || "")
				            .replace(/#\{riskLevelS\}/g, data.riskLevelS || "")
				            .replace(/#\{derivecolor\}/g, data.derivecolor || "")
				            .replace(/#\{colour\}/g, data.colour || "")
				            .replace(/#\{accept\}/g, data.accept || "")
				            .replace(/#\{name\}/g, data.error.name.substring(0,6) + "...")
				            .replace(/#\{nametitle\}/g, data.error.name)
				            .replace(/#\{text\}/g, data.text && data.text.length>3 && data.text.substring(0,3) + "..." || data.text || "")
				            .replace(/#\{texttitle\}/g, data.text || "")
				            .replace(/#\{score\}/g, data.score)
				            .replace(/#\{sysTypeId\}/g, data.score)
				            .replace(/#\{systemAnalysisRiskThreatMappingId\}/g,data.id)
				            .replace(/#\{type\}/g, data.error !==undefined ? "derivativeRiskErrorMapping" : derivativeRiskErrorMapping)
				            .replace(/#\{threatOrError\}/g, "threat")
				            .replace(/#\{editable\}/g, data.editable)
				            .replace(/#\{mark\}/g, this._getLabelTheme(data.mark))).appendTo(container);
				}
        
        if (data.text) {
            $tr.find(".score").removeClass("hidden");
        }
    },
    /**
     * @int 绘制风险差错body
     */
    _drawRiskErrorMapping: function(data, container) {
				if(data.colour=="R"){
			    	data.colour='#FF5B5B';
			    	data.accept="不可接受";
			    }else if(data.colour=="G"){
			    	data.colour='#00FF40';
			    	data.accept="可接受";
			    }else if(data.colour=='Y'){
			    	data.colour="#FFFF51";
			    	data.accept="控制后可接受";
			    }else {
			    	data.accept="可接受";
			    	data.colour='#00FF40';
			    }
        var $tr = $(this._TR.replace(/#\{id\}/g, data.id)
            .replace(/#\{threatErrorId\}/g, data.error.id)
            .replace(/#\{riskLevelP\}/g, data.riskLevelP || "")
            .replace(/#\{riskLevelS\}/g, data.riskLevelS || "")
            .replace(/#\{colour\}/g, data.colour || "")
            .replace(/#\{accept\}/g, data.accept || "")
            .replace(/#\{name\}/g, data.error.name.substring(0,6)+'...' || '')
            .replace(/#\{nametitle\}/g, data.error.name)
            .replace(/#\{code\}/g, data.error.num)
            .replace(/#\{text\}/g, data.text && data.text.length>3 && data.text.substring(0,3) + "..." || data.text || "")
            .replace(/#\{texttitle\}/g, data.text || "")
            .replace(/#\{score\}/g, data.score)
            .replace(/#\{type\}/g, "systemAnalysisRiskErrorMapping")
            .replace(/#\{threatOrError\}/g, "error")
            .replace(/#\{editable\}/g, data.editable)
            .replace(/#\{mark\}/g, this._getLabelTheme(data.mark))).appendTo(container);
        if (data.systemAnalysisClauses.length>0) {
            $.each(data.systemAnalysisClauses, this.proxy(function(idx, item) {
                this._drawClause(item, $tr.find("ol.clauses"),idx);
            }));
        }
        if (data.text) {
            $tr.find(".score").removeClass("hidden");
        }
    },
    /**
     * @int 绘制衍生风险差错body
     */
    _drawRiskErrorMapping_derive: function(data, container) {
				    	if(data.colour=="R"){
					    	data.colour='#FF5B5B';
					    	data.accept="不可接受";
					    }else if(data.colour=="G"){
					    	data.colour='#00FF40';
					    	data.accept="可接受";
					    }else if(data.colour=='Y'){
					    	data.colour="#FFFF51";
					    	data.accept="控制后可接受";
					    }else {
					    	data.accept="可接受";
					    	data.colour='#00FF40';
					    }
        var $tr = $(this._TR_DERIVE.replace(/#\{id\}/g, data.id)
            .replace(/#\{threatErrorId\}/g, data.error.id)
            .replace(/#\{deleteTE-id\}/g,data.systemAnalysisRiskErrorMappingId)
            .replace(/#\{name\}/g, data.error.name.substring(0,6)+'...')
            .replace(/#\{nametitle\}/g, data.error.name)
            .replace(/#\{riskLevelP\}/g, data.riskLevelP || "")
            .replace(/#\{riskLevelS\}/g, data.riskLevelS || "")
            .replace(/#\{colour\}/g, data.colour || "")
            .replace(/#\{accept\}/g, data.accept || "")
            .replace(/#\{code\}/g, data.error.num)
            .replace(/#\{text\}/g, data.text && data.text.length>3 && data.text.substring(0,3) + "..." || data.text || "")
            .replace(/#\{texttitle\}/g, data.text || "")
            .replace(/#\{score\}/g, data.score)
            .replace(/#\{type\}/g, "residualRiskErrorMapping")
            .replace(/#\{systemAnalysisRiskErrorMappingId\}/g,data.id)
            .replace(/#\{threatOrError\}/g, "error")
            .replace(/#\{editable\}/g, data.editable)
            .replace(/#\{mark\}/g, this._getLabelTheme(data.mark))).appendTo(container);
        /**
         * @int 绘制 差错 衍生风险ADD 
         */
        data.derivativeRiskErrorMappings.length>0 &&  $.each(data.derivativeRiskErrorMappings,this.proxy(function(index,item){
        	item.editable = data.editable;
        	item.derivecolor='#95CACA';
           this._drawRiskErrorMapping_derive_add(item, container);
        }));
        if (data.text) {
            $tr.find(".score").removeClass("hidden");
        }
    },
    /**
     * #int绘制条款
     */
    _drawClause: function(data, container,idx) {
        $(this._MANUAL_TERMS.replace(/#\{id\}/g, data.id)
                .replace(/#\{number\}/g, data.controlNumber || "")
                .replace(/#\{title\}/g, data.control.length > 15 ? data.control.substring(0,15) + "..." : data.control || "")
                .replace(/#\{nametitle\}/g, data.control)
                .replace(/#\{status\}/g, data.status || "")
                .replace(/#\{checked\}/g, data.generate ? "checked" : ""))
            .appendTo(container);
        if(data.actionItems.length>0){
        	data.actionItems && this.action_draw(data.actionItems,$(container.find(".action")[idx]));
        }
    },
    _getLabelTheme: function(color) {
        var result = "label-default";
        switch (color) {
            case "green":
                result = "label-success";
                break;
            case "yellow":
                result = "label-warning";
                break;
            case "red":
                result = "label-danger";
                break;
        }
        return result;
    },
    /**
     * @int 添加条款保存button
     * 
     */
    _addClause: function(params) {
        this._ajax({
            url: $.u.config.constant.smsmodifyserver,
            data: {
                "method": "stdcomponent.addall",
                "dataobject": "systemAnalysisClause",
                "objs": JSON.stringify(params.objs)
            },
            block: this.selectControlDialog.controlDialog.parent(),
            callback: this.proxy(function(response) {
                if (response.success) {
                    this.selectControlDialog.controlDialog.dialog("close");
                    this._ajax({
                        data: {
                            "method": "stdcomponent.getbyids",
                            "dataobject": "systemAnalysisClause",
                            "dataobjectid": JSON.stringify(response.data)
                        },
                        block: params.container,
                        callback: this.proxy(function(response) {
                            if (response.success) {
                                $.each(response.data, this.proxy(function(idx, item) {
                                    this._drawClause(item, params.container);
                                }));
                            }
                        })
                    });
                }
            })
        });
    },
    /**
     * @int 添加威胁保存button
     */
    _addRiskThreatMapping: function(params) {
        this._ajax({
            url: $.u.config.constant.smsmodifyserver,
            data: {
                "method": "stdcomponent.addall",
                "dataobject": "systemAnalysisRiskThreatMapping",
                "objs": JSON.stringify(params.objs)
            },
            block: this.riskThreatErrorMappingDialog.formDialog.parent(),
            callback: this.proxy(function(response) {
                if (response.success) {
                	this.deleteID=response.data;
                    this.riskThreatErrorMappingDialog.formDialog.dialog("close");
                    /**
                     * @int 风险分析
                     */
                    this._ajax({
                        data: {
                            "method": "stdcomponent.getbyids",
                            "dataobject": "systemAnalysisRiskThreatMapping",
                            "dataobjectid": JSON.stringify(response.data)
                        },
                        block: params.container,
                        callback: this.proxy(function(response) {
                            if (response.success) {
                                $.each(response.data, this.proxy(function(idx, item) {
                                    item.editable = true;
                                    this._drawRiskThreatMapping(item, params.container);
                                }));
                            }
                        })
                    });
                    /**
                     * @Int 剩余衍生风险
                     */
                    this._ajax({
                        data: {
                            "method": "stdcomponent.getbysearch",
                            "dataobject": "residualRiskThreatMapping",
                            "rule": JSON.stringify([[{"key":'systemAnalysisRiskThreatMappingId',
                            	                      "op":"in",
                            	                      "value":response.data}]])
                        },
                        block: params.container,
                        callback: this.proxy(function(response) {
                            if (response.success) {
                                $.each(response.data.aaData, this.proxy(function(idx, item) {
                                    item.editable = true;
                                    item.systemAnalysisRiskThreatMappingId = this.deleteID[idx]; 
                                    this._drawRiskThreatMapping_derive(item, params.containerDerive);
                                }));
                            }
                        })
                    });
                }
            })
        });
    },
    /**
     * @int 添加威胁button 保存  衍生风险分析
     */
    _addRiskThreatMapping_derive: function(params) {
        this._ajax({
            url: $.u.config.constant.smsmodifyserver,
            data: {
                "method": "stdcomponent.addall",
                "dataobject": "derivativeRiskThreatMapping",
                "objs": JSON.stringify(params.objs)
            },
            block: this.riskThreatErrorMappingDialog.formDialog.parent(),
            callback: this.proxy(function(response) {
                if (response.success) {
                    this.riskThreatErrorMappingDialog.formDialog.dialog("close");
                    /**
                     * @Int 剩余衍生风险
                     */
                    this._ajax({
                        data: {
                            "method": "stdcomponent.getbyids",
                            "dataobject": "derivativeRiskThreatMapping",
                            "dataobjectid": JSON.stringify(response.data),
                            /*"rule": JSON.stringify([[{"key":'residualRiskThreatMappingId',
                            	                      "op":"in",
                            	                      "value":params.objs[0].residualRiskThreatMappingId}]])*/
                        },
                        block: params.container,
                        callback: this.proxy(function(response) {
                            if (response.success) {
                                $.each(response.data, this.proxy(function(idx, item) {
                                    item.editable = true;
                                    item.systemAnalysisRiskThreatMappingId = params.deleteTE_id;
                                    item.derivecolor='#95CACA';
                                    this._drawRiskThreatMapping_derive_add(item, params.containerDerive,params.directing,{mode:'derive'});
                                }));
                            }
                        })
                    });
                }
            })
        });
    },
    /**
     * @int 添加差错button 保存  衍生风险分析
     */
    _addRiskErrorMapping_derive: function(params) {
        this._ajax({
            url: $.u.config.constant.smsmodifyserver,
            data: {
                "method": "stdcomponent.addall",
                "dataobject": "derivativeRiskErrorMapping",
                "objs": JSON.stringify(params.objs)
            },
            block: this.riskThreatErrorMappingDialog.formDialog.parent(),
            callback: this.proxy(function(response) {
                if (response.success) {
                    this.riskThreatErrorMappingDialog.formDialog.dialog("close");
                    /**
                     * @Int 剩余衍生风险
                     */
                    this._ajax({
                        data: {
                            "method": "stdcomponent.getbyids",
                            "dataobject": "derivativeRiskErrorMapping",
                            "dataobjectid": JSON.stringify(response.data)
                            /*"rule": JSON.stringify([[{"key":'residualRiskErrorMappingId',
                            	                      "op":"in",
                            	                      "value":params.objs[0].residualRiskThreatMappingId}]])*/
                        },
                        block: params.container,
                        callback: this.proxy(function(response) {
                            if (response.success) {
                                $.each(response.data, this.proxy(function(idx, item) {
                                    item.editable = true;
                                    item.derivecolor='#95CACA';
                                    item.systemAnalysisRiskErrorMappingId = params.deleteTE_id;
                                    this._drawRiskErrorMapping_derive_add(item, params.containerDerive,params.directing,{mode:'derive'});
                                }));
                            }
                        })
                    });
                }
            })
        });
    },
    /**
     * @int 添加差错保存按钮 风险分析
     */
    _addRiskErrorMapping: function(params) {
        this._ajax({
            url: $.u.config.constant.smsmodifyserver,
            data: {
                "method": "stdcomponent.addall",
                "dataobject": "systemAnalysisRiskErrorMapping",
                "objs": JSON.stringify(params.objs)
            },
            block: this.riskThreatErrorMappingDialog.formDialog.parent(),
            callback: this.proxy(function(response) {
                if (response.success) {
                	this.deleteID=response.data;
                    this.riskThreatErrorMappingDialog.formDialog.dialog("close");
                    /**
                     * @Int 风险分析差错添加
                     */
                    this._ajax({
                        data: {
                            "method": "stdcomponent.getbyids",
                            "dataobject": "systemAnalysisRiskErrorMapping",
                            "dataobjectid": JSON.stringify(response.data)
                        },
                        block: params.container,
                        callback: this.proxy(function(response) {
                            if (response.success) {
                                $.each(response.data, this.proxy(function(idx, item) {
                                    item.editable = true;
                                    item.systemAnalysisRiskErrorMappingId = this.deleteID[idx];
                                    this._drawRiskErrorMapping(item, params.container);
                                }));
                            }
                        })
                    });
                    /**
                     * @int 衍生风险差错
                     */
                    this._ajax({
                        data: {
                            "method": "stdcomponent.getbysearch",
                            "dataobject": "residualRiskErrorMapping",
                            "rule": JSON.stringify([[{"key":'systemAnalysisRiskErrorMappingId',
                            	                      "op":"in",
                            	                      "value":response.data}]])
                        },
                        block: params.container,
                        callback: this.proxy(function(response) {
                            if (response.success) {
                                $.each(response.data.aaData, this.proxy(function(idx, item) {
                                    item.editable = true;
                                    this._drawRiskErrorMapping_derive(item, params.containerDerive);
                                }));
                            }
                        })
                    });
                }
            })
        });
    },
    /**
     * @Int 风险分析等级 风险系数计算
     */
    riskLevelEvent:function(){
    	var riskLevelP = Number(this.qid("riskLevelP").val());
    	var riskLevelS = Number(this.qid("riskLevelS").val());
    	if(riskLevelP>5){
    		this.qid("riskLevelP").val(5);
    	}else if(riskLevelP<1){
    		this.qid("riskLevelP").val(1);
    	}else if(riskLevelS>5){
    		this.qid("riskLevelS").val(5);
    	}else if(riskLevelS<1){
    		this.qid("riskLevelS").val(1);
    	}
    	 riskLevelP = Number(this.qid("riskLevelP").val());
    	 riskLevelS = Number(this.qid("riskLevelS").val());
    	this.riskLevelPS.val(riskLevelP * riskLevelS);
    },
    /**
     * @title 编辑评价
     */
    editSummrize:function(){
    	
        if (this.edit_summrize_Dialog == null) {
            this.edit_summrize_Dialog = this.qid("textDialog").removeClass("hidden").dialog({
                title: "编辑总结",
                width: 520,
                modal: true,
                resizable: false,
                autoOpen: false,
                create: this.proxy(function(){
                	
                }),
                close: this.proxy(function() {
                    this.qid("system").select2("val", null);
                }),
                open:this.proxy(function(){
                	this.edit_text_summrize.val(this.text_summrize.val());
                }),
                buttons: [{
                    "text": "确认",
                    "click": this.proxy(function(){
                    	this.text_summrize.val(this.edit_text_summrize.val());
                    	if(this.conclusion && this.conclusion.id){
                    		$.u.ajax({
                        		url:$.u.config.constant.smsmodifyserver,
                        		data:{
                        			"tokenid": $.cookie("tokenid"),
                        			"method": "stdcomponent.update",
                                    "dataobject": "systemAnalysisRiskAnalysisConclusion",
                                    "dataobjectid": this.conclusion.id,
                                    "obj": JSON.stringify({
                                        "activity": this._options.activity,
                                        "conclusion":this.edit_text_summrize.val()
                                    })
                                    
                        		}
                        	}).done(this.proxy(function(response){
                        		if(response.success){
                        			this.edit_summrize_Dialog.dialog("close");
                        		}
                        	}));
                    	}else{
                    		$.u.ajax({
                        		url:$.u.config.constant.smsmodifyserver,
                        		data:{
                        			"tokenid": $.cookie("tokenid"),
                        			"method": "stdcomponent.add",
                                    "dataobject": "systemAnalysisRiskAnalysisConclusion",
                                    "obj": JSON.stringify({
                                        "activity": this._options.activity,
                                        "conclusion":this.edit_text_summrize.val()
                                    })
                                    
                        		}
                        	}).done(this.proxy(function(response){
                        		if(response.success){
                        			this.edit_summrize_Dialog.dialog("close");
                        		}
                        	}));
                    	}
                    	
                    })
                }, {
                    "text": "取消",
                    "class": "aui-button-link",
                    "click": this.proxy(function() {
                        this.edit_summrize_Dialog.dialog("close");
                    })
                }]
            });
        }
        this.edit_summrize_Dialog.dialog("open");
    },
    _ajax: function(param) {
        $.u.ajax({
            url: param.url || $.u.config.constant.smsqueryserver,
            type: "post",
            dataType: "json",
            data: $.extend(true, {
                "tokenid": $.cookie("tokenid")
            }, (param.data || {}))
        }, param.block).done(this.proxy(param.callback));
    },
    destroy: function() {
        this.qid("system").select2("destroy");
        this.addRiskAnalysisDialog && this.addRiskAnalysisDialog.dialog("destroy");
        this._super();
    },
    /**
     * 鼠标悬停事件处理
     */
    title_show:function(e){
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
  	    div.style.left = pageX(span)+50+'px';
  	    div.style.top = pageY(span)-230+'px';
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
  	    
    }
    
}, {
    usehtm: true,
    usei18n: true
});


com.sms.detailmodule.riskAnalysis.riskAnalysis.widgetjs = ['../../../../uui/widget/select2/js/select2.min.js',
    "../../../../uui/widget/spin/spin.js",
    "../../../../uui/widget/jqblockui/jquery.blockUI.js",
    "../../../../uui/widget/ajax/layoutajax.js",
];
com.sms.detailmodule.riskAnalysis.riskAnalysis.widgetcss = [{
    id: "",
    path: "../../../../uui/widget/select2/css/select2.css"
}, {
    id: "",
    path: "../../../../uui/widget/select2/css/select2-bootstrap.css"
}];