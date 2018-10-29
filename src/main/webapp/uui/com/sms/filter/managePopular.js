//@ sourceURL=com.sms.filter.managePopular
$.u.define('com.sms.filter.managePopular', null, {
    init: function () {
    },
    afterrender: function () {
    	this.i18n = com.sms.filter.managePopular.i18n;

        this.dataTable = this.qid("datatable").dataTable({
            searching: false,
            serverSide: true,
            bProcessing: true,
            ordering: false,
            pageLength: 1000,
            "sDom": "",
            "columns": [
                { "title": this.i18n.name, "mData": "name"},
                { "title": this.i18n.owner, "mData": "creator", "sWidth": "25%"},
                { "title":this.i18n.shareTo, "mData": "paladin", "sWidth": "25%"},
                { "title": this.i18n.subscribe, "mData": "SubscribeList", "sWidth": 80},
                { "title": this.i18n.popular, "mData": "", "sWidth": 50}
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
                $.extend(aoData, {
                    "tokenid": $.cookie("tokenid"),
                    "method": "getFilter",
                    "type":"H",
                    "dataobject":"filtermanager"
                }, true);
            }),
            "fnServerData": this.proxy(function (sSource, aoData, fnCallBack, oSettings) {
                $.u.ajax({
                    url: $.u.config.constant.smsqueryserver,
                    type: "post",
                    dataType: "json",
                    cache: false,
                    data: aoData
                },this.qid("datatable")).done(this.proxy(function (result) {
                	if (result.success) {
                        fnCallBack(result.data);
                    }
                })).fail(this.proxy(function (jqXHR, errorText, errorThrown) {

                }));
            }),
            "aoColumnDefs": [
                {
                    "aTargets": 0,
                    "mRender": function (data, type, full) {
                        var charnel = false;
                        if (full.charnelThose && full.charnelThose.indexOf("," + $.cookie("userid") + ",") > -1) {
                            charnel = true;
                        }
                        return "<span class='star glyphicon glyphicon-star" + (charnel ? "" : "-empty") + "' data='" + JSON.stringify(full) + "'></span><span><a href='../search/Search.html?filterId=" + full.id + "' style='padding-left: 10px;'>" + full.name + "</a>"+
                        "<p class='text-muted' style='padding-left: 24px;'><small>" + (full.description==undefined?"":full.description) + "</small></p></span>";
                    }
                }, {
                    "aTargets": 2,
                    "mRender": function (data, type, full) {
                        var htm = "<ul style='padding-left:0;'>";
                        if (!full.paladin || full.paladin == "") {
                            htm += "<li class='private'>"+com.sms.filter.managePopular.i18n.privatePanel+"</li>";
                        } else {
                            if (full.paladin.indexOf("ALL") > -1) {
                                htm += "<li class='public'>"+com.sms.filter.managePopular.i18n.shareAll+"</li>";
                            } else {
                                var alltypes = full.paladinDesc.split(",");
                                $.each(alltypes, function (idx, atype) {
                                    var typeinfo = atype.split("@#");
                                    var tp = typeinfo[0];
                                    if (tp != "") {
                                        htm += "<li class='public'><b>" + (tp == "U" ? com.sms.filter.managePopular.i18n.user : (tp == "G" ? com.sms.filter.managePopular.i18n.userGroup : com.sms.filter.managePopular.i18n.unknown)) + "</b>：" + typeinfo[1] + "</li>";
                                    }
                                });
                            }
                        }
                        htm += "</ul>";
                        return htm;
                    }
                },
                {
                    "aTargets": 3,
                    "mRender": function (data, type, full) {
                    	var htmls = "";
                        if(full.SubscribeList){
                        	if(full.SubscribeList.length>0){
                        		htmls+= "<a href='ViewSubscriptions.html?id="+full.id+"' data-data='"+JSON.stringify(full)+"'>"+full.SubscribeList.length+com.sms.filter.managePopular.i18n.Gsubscibe+"</a>";
                        	}else{
                        		htmls+= com.sms.filter.managePopular.i18n.no+" -<button class='btn btn-link subscribe' style='margin-top: -3px;' data-data='"+JSON.stringify(full)+"'>"+com.sms.filter.managePopular.i18n.subscribe+"</button>";
                        	}
                        }
                        return htmls;
                    }
                },
                {
                    "aTargets": 4,
                    "mRender": function (data, type, full) {
                        var allchose = full.charnelThose.split(",");
                        var count = 0;
                        $.each(allchose, function (idx ,achoose) {
                            if (achoose != "") {
                                count++;
                            }
                        });
                        return count;
                    }
                }
            ]
        });
        
        this.subscribe.override({
    		refreshDataTable:this.proxy(function(){
    			this.dataTable.fnDraw();
    		})
    	});
        
        //订阅
        this.dataTable.off("click", "button.subscribe").on("click", "button.subscribe", this.proxy(function (e) {
            e.preventDefault();
            try{
            	var $fav = $(e.currentTarget);
                var datajson = JSON.parse($fav.attr("data-data"));
        		this.subscribe.open({"title":this.i18n.filterSubscibe,"dataobject":"subscribe","id":datajson.id});
        	}catch(e){
        		throw new Error(this.i18n.subscibeFail+e.message);
        	}

        }));
        
        //收藏
        this.dataTable.off("click", "span.star").on("click", "span.star", this.proxy(function (e) {
            e.preventDefault();
            var $fav = $(e.currentTarget);
            var datajson = JSON.parse($fav.attr("data"));
            $.ajax({
                url: $.u.config.constant.smsmodifyserver,
                type: "post",
                dataType: "json",
                cache: false,
                data: {
                    "tokenid": $.cookie("tokenid"),
                    "method": "favorFiltermanager",
                    "filtermanagerId": datajson.id,
                    "charnelThose": $fav.hasClass("glyphicon-star") ? "0" : "1" // 要相反
                }
            }).done(this.proxy(function (response) {
                if (response.success) {
                    if ($fav.hasClass("glyphicon-star")) {
                        $fav.removeClass("glyphicon-star");
                        $fav.addClass("glyphicon-star-empty");
                    }
                    else {
                        $fav.removeClass("glyphicon-star-empty");
                        $fav.addClass("glyphicon-star");
                    }
                }
            })).fail(this.proxy(function (jqXHR, errorText, errorThrown) {

            }));
        }));
    },
    resize: function () {

    }
}, { usehtm: true, usei18n: true });


com.sms.filter.managePopular.widgetjs = ['../../../uui/widget/jqdatatable/js/jquery.dataTables.js', '../../../uui/widget/jqdatatable/js/dataTables.bootstrap.js'];
com.sms.filter.managePopular.widgetcss = [{ path: '../../../uui/widget/jqdatatable/css/jquery.dataTables.css' }, { path: '../../../uui/widget/jqdatatable/css/dataTables.bootstrap.css' }];
