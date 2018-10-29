//@ sourceURL=com.sms.filter.manageFavourites
$.u.load("com.sms.common.stdcomponentdelete");
$.u.define('com.sms.filter.manageFavourites', null, {
    init: function () {
    },
    afterrender: function () {
    	this.i18n = com.sms.filter.manageFavourites.i18n;
        this.dataTable = this.qid("datatable").dataTable({
            searching: false,
            serverSide: true,
            bProcessing: true,
            ordering: false,
            pageLength: 1000,
            "sDom": "",
            "columns": [
                { "title": this.i18n.name, "mData": "name" },
                { "title": this.i18n.owner, "mData": "creator", "sWidth": "25%"},
                { "title": this.i18n.shareTo, "mData": "paladin", "sWidth": "25%"},
                { "title": this.i18n.subscribe, "mData": "id", "sWidth": 80},
                { "title": "", "mData": "id", "sWidth": 20}
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
                    "type":"F",
                    "dataobject":"filtermanager"
                }, true);
            }),
            "fnServerData": this.proxy(function (sSource, aoData, fnCallBack, oSettings) {
                $.ajax({
                    url: $.u.config.constant.smsqueryserver,
                    type: "post",
                    dataType: "json",
                    cache: false,
                    data: aoData
                }).done(this.proxy(function (result) {
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
                        return "<span class='star glyphicon glyphicon-star" + (charnel ? "" : "-empty") + "' data='" + JSON.stringify(full) + "'></span><span><a href='../search/Search.html?filterId=" + full.id + "' style='padding-left: 10px;'>" + full.name + "</a>" +
                        "<p class='text-muted' style='padding-left: 24px;'><small>" + (full.description==undefined?"":full.description) + "</small></p></span>";
                    }
                }, {
                    "aTargets": 2,
                    "mRender": function (data, type, full) {
                        var htm = "<ul style='padding-left:0;'>";
                        if (!full.paladin || full.paladin == "") {
                            htm += "<li class='private'>"+com.sms.filter.manageFavourites.i18n.privatePanel+"</li>";
                        } else {
                            if (full.paladin.indexOf("ALL") > -1) {
                                htm += "<li class='public'>"+com.sms.filter.manageFavourites.i18n.shareAll+"</li>";
                            } else {
                                var alltypes = full.paladinDesc.split(",");
                                $.each(alltypes, function (idx, atype) {
                                    var typeinfo = atype.split("@#");
                                    var tp = typeinfo[0];
                                    if (tp != "") {
                                        htm += "<li class='public'><b>" + (tp == "U" ? com.sms.filter.manageFavourites.i18n.user : (tp == "G" ? com.sms.filter.manageFavourites.i18n.userGroup : com.sms.filter.manageFavourites.i18n.unknown)) + "</b>：" + typeinfo[1] + "</li>";
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
                        		htmls+= "<a href='ViewSubscriptions.html?id="+full.id+"' data-data='"+JSON.stringify(full)+"'>"+full.SubscribeList.length+com.sms.filter.manageFavourites.i18n.Gsubscibe+"</a>";
                        	}else{
                        		htmls+= com.sms.filter.manageFavourites.i18n.no+" -<button class='btn btn-link subscribe' style='margin-top: -3px;' data-data='"+JSON.stringify(full)+"'>"+com.sms.filter.manageFavourites.i18n.subscribe+"</button>";
                        	}
                        }
                        return htmls;
                    }
                },
                {
                    "aTargets": 4,
                    "mRender": function (data, type, full) {
                        var myown = true;
                        if (full.creatorId != parseInt($.cookie("userid"))) {
                            myown = false;
                        }
                        return (myown ?"<span class='dropdown operate'><a href='#' class='dropdown-toggle dropdown-toggle-icon' data-toggle='dropdown'><span class='glyphicon glyphicon-cog'></span><b class='caret'></b></a>" +
                    			"<ul class='dropdown-menu pull-right' >" +
                				"<li><a href='#' class='edit' data='" + JSON.stringify(full) + "'>"+com.sms.filter.manageFavourites.i18n.edit+"</a></li>" +
                				"<li><a href='#' class='delete' data='" + JSON.stringify(full) + "'>"+com.sms.filter.manageFavourites.i18n.remove+"</a></li>"  +
                			"</ul>":"");
                    }
                }
            ]
        });
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
            }).done(this.proxy(function (result) {
                if (result.success) {
                    if ($fav.hasClass("glyphicon-star")) {
                        $fav.removeClass("glyphicon-star");
                        $fav.addClass("glyphicon-star-empty");
                        this.qid("allalert").show();
                        var template = "<br/><span>'#{title}'"+this.i18n.hasRemove+"<a class='restorefav' real='#{dashid}' style='cursor:pointer;'>"+this.i18n.revocation+"</a></span>";
                        this.qid("allalert").children().first().append(template.replace(/#\{title\}/g, datajson.name).replace(/#\{dashid\}/g, datajson.id));
                    }
                    else {
                        $fav.removeClass("glyphicon-star-empty");
                        $fav.addClass("glyphicon-star");
                    }
                    this.dataTable.fnDraw();
                }
            })).fail(this.proxy(function (jqXHR, errorText, errorThrown) {

            }));
        }));
        
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

        // 编辑
        this.dataTable.off("click", "a.edit").on("click", "a.edit", this.proxy(function (e) {
            e.preventDefault();
            var data = JSON.parse($(e.currentTarget).attr("data"));
            var dialog = $.um($("<div umid='" + $.u.uniqid() + "' umodule='com.sms.filter.filterDialog'/>"));//内存创建
            dialog.parent(this);
            dialog.override({
                on_submit: this.proxy(function () {
                    this.dataTable.fnDraw();
                })
            });
            dialog.open(data);
        }));

     // 删除
        this.dataTable.off("click", "a.delete").on("click", "a.delete", this.proxy(function (e) {
            e.preventDefault();
            try {
                var data = JSON.parse($(e.currentTarget).attr("data"));
                (new com.sms.common.stdcomponentdelete({
                    body: "<div>" +
        				 	"<p>"+this.i18n.affirm+"</p>" +
        				 "</div>",
                    title: this.i18n.removePanel + data.name,
                    dataobject: "filtermanager",
                    dataobjectids: JSON.stringify([parseInt(data.id)])
                })).override({
                    refreshDataTable: this.proxy(function () {
                        this.dataTable.fnDraw();
                    })
                });
            } catch (e) {
                throw new Error(this.i18n.removeFail + e.message);
            }
        }));
        
        this.qid("allalert").off("click", "a.restorefav").on("click", "a.restorefav", this.proxy(function (e) {
            $.ajax({
                url: $.u.config.constant.smsmodifyserver,
                type: "post",
                dataType: "json",
                cache: false,
                data: {
                    "tokenid": $.cookie("tokenid"),
                    "method": "favorFiltermanager",
                    "filtermanagerId": parseInt($(e.currentTarget).attr("real")),
                    "charnelThose": "1"
                }
            }).done(this.proxy(function (response) {
                if (response.success) {
                    $(e.currentTarget).parent().prev().remove();
                    $(e.currentTarget).parent().remove();
                    if (this.qid("allalert").children().first().children().length == 1) {
                        this.qid("allalert").hide();
                    }
                    this.dataTable.fnDraw();
                }
            })).fail(this.proxy(function (jqXHR, errorText, errorThrown) {

            }));
        }));
    },
    resize: function () {

    }
}, { usehtm: true, usei18n: true });


com.sms.filter.manageFavourites.widgetjs = ['../../../uui/widget/jqdatatable/js/jquery.dataTables.js', '../../../uui/widget/jqdatatable/js/dataTables.bootstrap.js'];
com.sms.filter.manageFavourites.widgetcss = [{ path: '../../../uui/widget/jqdatatable/css/jquery.dataTables.css' }, { path: '../../../uui/widget/jqdatatable/css/dataTables.bootstrap.css' }];
