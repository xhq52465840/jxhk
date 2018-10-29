//@ sourceURL=com.audit.innerAudit.xitong_jihua.gongzuotai_content
$.u.define('com.audit.innerAudit.xitong_jihua.gongzuotai_content', null, {
    init: function(options) {
        this._options = options;
        this.urlparam = {};
        this._activity = null;
        this.unitid = null;
        this.bumen_id = null;

        this.indexOfjoin = function(sate) {
            if (sate) {
                if (sate.length > 6) {
                    if (sate.indexOf("-")) {
                        return sate.split("-").join("");
                    }
                    return sate;
                } else {
                    return sate + "&nbsp;&nbsp;&nbsp;&nbsp;";
                }

            } else {
                return "-----------"
            }

        };

    },
    afterrender: function(bodystr) {
        this.year = $.urlParam().year || this._options.year;
        if (this._options.type == "erjineishen") {
            this.qid("neishen").replaceWith('<span qid="neishen" class="">年处室审核计划</span>')
            $(".fenzigongsi").addClass("hidden");
            $(".erjineishen").removeClass("hidden");
            //获取组织
            if (this._options.id) {
                $.u.ajax({
                    url: $.u.config.constant.smsqueryserver,
                    type: "post",
                    dataType: "json",
                    cache: false,
                    data: {
                        "method": "stdcomponent.getbyid",
                        "dataobject": "organization",
                        "dataobjectid": parseInt(this._options.id),
                        "tokenid": $.cookie("tokenid"),
                    },
                }).done(this.proxy(function(response) {
                    if (response.success) {
                        this.unitid = response.data.unit;
                        this.bumen_id = response.data.id;
                        this.units = this.qid("erji_units");
                        this.units.attr("name", response.data.unit);
                        this.qid("erji_units").select2("data", {
                            id: response.data.unit,
                            name: response.data.unitDisplayName
                        });

                        this.bumen_units_ids(response.data.unit);
                        this.qid("bumen_units").select2("data", {
                            id: response.data.id,
                            name: response.data.name
                        });
                        this.get_data([parseInt(this._options.year)], parseInt(response.data.id));
                    }
                }))
            }
        } else {
            //获取安监机构
            if (this._options.id) {
                $.u.ajax({ //保存数据
                    url: $.u.config.constant.smsqueryserver,
                    type: "post",
                    dataType: "json",
                    cache: false,
                    data: {
                        "method": "stdcomponent.getbyid",
                        "dataobject": "unit",
                        "dataobjectid": parseInt(this._options.id),
                        "tokenid": $.cookie("tokenid"),
                    },
                }).done(this.proxy(function(response) {
                    if (response.success) {
                        this.unitid = response.data.id;
                        this.units = this.qid("units");
                        this.units.attr("name", response.data.name)
                            .select2("data", {
                                id: response.data.id,
                                name: response.data.name
                            });
                        this.get_data([parseInt(this._options.year)], parseInt(response.data.id));
                    }
                }))
            }
        }

        if ($(window).width() < 1020) {
            this.qid("tu_h4").css("font-size", "15px");
            $(".init_div").addClass("mar_left");
        }
        this.flowid = null;
        this.isremark = false;
        this.comm_data = null;
        this.currdo_year = null;
        this.leftColumns = this.qid("left-column");
        this.first_year = $(".first_year:visible");
        this.num_year = $(".num_year");
        this.comps = {};
        var now_year = this._options.year || new Date().format("yyyy");
        this.getFirstPlanYear(now_year);
        this.qid("time_left").click(this.proxy(this.chage_time_click));
        this.qid("time_right").click(this.proxy(this.chage_time_click));

        this.qid("oneyear").click(this.proxy(this.chage_time_click));
        this.qid("twoyear").click(this.proxy(this.chage_time_click));
        this.qid("threeyear").click(this.proxy(this.chage_time_click));
        //审核按钮（通过，不通过）
        this.qid("shenhe_btn").click(this.proxy(this.shenhe_ok));
        this.qid("qiziok").click(this.proxy(this.qiziok)); //时间修改确定
        $(".update_time").click(this.proxy(this.show_time));
        $(".gongzuodan_time").click(this.proxy(this.gongzuodan));
        $(".jianchadan_time").click(this.proxy(this.jianchadan));
        $(".shenjibaogao_time").click(this.proxy(this.shenjibaogao));
        $(".zhenggaidan_time").click(this.proxy(this.zhenggaidan));
        $(".delete_time").click(this.proxy(this.delete_qizi));

        $("#myModal").on('hide.bs.modal', function() { //关闭模态框时清除警告提示
            $(".alert").hide();
        })

        $(document).on("mousedown", function(event) {
            //button等于0代表左键，button等于1代表中键	
            if (event.button == 0 || event.button == 1) {
                $(".youjian_Menu").stop().fadeOut(200); //获取菜单停止动画，进行隐藏使用淡出效果		} });
            }
        })
        this.first_year.change(this.proxy(this.change_firstyear));
        this.num_year.change(this.proxy(this.change_numyear));
        this.init_select2();

    },

    init_select2: function() {
        if (this._options.type == "erjineishen") {
            this.units = this.qid("erji_units");
        } else {
            this.units = this.qid("units");
        }
        this.units.select2({
            /*width:280,*/
            placeholder: "请选择...",
            allowClear: true,
            ajax: {
                url: $.u.config.constant.smsqueryserver,
                dataType: "json",
                type: "post",
                data: function(term, page) {
                    return {
                        tokenid: $.cookie("tokenid"),
                        method: "getunits",
                        unitName: term == "" ? null : term
                    };
                },
                results: function(response, page, query) {
                    if (response.success) {
                        return {
                            results: response.data
                        };
                    }
                }
            },
            formatResult: function(item) {
                return item.name;
            },
            formatSelection: function(item) {
                return item.name;
            }
        }).on("select2-selecting", this.proxy(function(e) {
            this.unitid = e.object.id;
            this.units.attr("name", e.object.id);
            if (this._options.type == "erjineishen") {
                this.bumen_units_ids(e.object.id);
            } else {
                var first_year = $(".first_year").val();
                var num_year = $(".num_year").val();
                var arr_year = [];
                if (num_year == "one") {
                    arr_year.push(parseInt(first_year));
                } else if (num_year == "two") {
                    arr_year.push(parseInt(first_year));
                    arr_year.push(parseInt(first_year) + 1);
                } else if (num_year == "three") {
                    arr_year.push(parseInt(first_year));
                    arr_year.push(parseInt(first_year) + 1);
                    arr_year.push(parseInt(first_year) + 2);
                }
                this.get_data(arr_year, e.object.id);
            }
        }))
    },
    //获取二级组织
    bumen_units_ids: function(unit_id) {
        this.bumen_units = this.qid("bumen_units");
        this.bumen_units.select2({
            //width:280,
            placeholder: "请选择...",
            allowClear: true,
            ajax: {
                url: $.u.config.constant.smsqueryserver,
                dataType: "json",
                type: "post",
                data: function(term_erji, page) {
                    return {
                        tokenid: $.cookie("tokenid"),
                        method: "getErJiZuZhiByUnit",
                        unitId: unit_id,
                        term: term_erji
                    };
                },
                results: function(response, page, query) {
                    if (response.success) {
                        return {
                            results: response.data
                        };
                    }
                }
            },
            formatResult: function(item) {
                return item.name;
            },
            formatSelection: function(item) {
                return item.name;
            }
        }).on("select2-selecting", this.proxy(function(e) {
            this.bumen_id = e.object.id;
            this.bumen_units.attr("name", e.object.id);
            var first_year = $(".first_year:visible").val();
            var num_year = $(".num_year").val();
            var arr_year = [];
            if (num_year == "one") {
                arr_year.push(parseInt(first_year));
            } else if (num_year == "two") {
                arr_year.push(parseInt(first_year));
                arr_year.push(parseInt(first_year) + 1);
            } else if (num_year == "three") {
                arr_year.push(parseInt(first_year));
                arr_year.push(parseInt(first_year) + 1);
                arr_year.push(parseInt(first_year) + 2);
            }
            this.get_data(arr_year, e.object.id);
        }))
    },

    getFirstPlanYear: function(now_year) {
        $.u.ajax({
            url: $.u.config.constant.smsqueryserver,
            type: "post",
            dataType: "json",
            async: false,
            cache: false,
            data: {
                "method": "getFirstPlanYear",
                "tokenid": $.cookie("tokenid"),
                "planType": "SUB2"
            },
        }).done(this.proxy(function(response) {
            if (response.success) {
                var first_year;
                if (response.data) {
                    first_year = parseInt(response.data);
                    var s_html = "";
                    if (first_year > parseInt(now_year)) {
                        s_html += "<option value='" + parseInt(now_year) + "'>" + parseInt(now_year) + "年</option>";
                        s_html += "<option value='" + (parseInt(now_year) + 1) + "'>" + (parseInt(now_year) + 1) + "年</option>";
                        s_html += "<option value='" + (parseInt(now_year) + 2) + "'>" + (parseInt(now_year) + 2) + "年</option>";
                    } else {
                        var subnum = parseInt(now_year) - 2015;
                        for (i = 0; i <= (subnum + 2); i++) {
                            s_html += "<option value='" + (2015 + i) + "'>" + (2015 + i) + "年</option>";
                        }
                    }
                    this.first_year.html(s_html).val(this._options.year || now_year);
                    this.qid("year_plan").html(this._options.year || now_year);
                }
            }
        }))
    },

    /**
     * @title 查看工作流事件
     * @param e {object} 鼠标对象
     * @return void
     */
    on_diagramview_click: function(e) {
        e.preventDefault();
        var $this = $(e.currentTarget),
            wi_id = JSON.parse($this.attr("data-id"));
        if (this.diagramDialog == null) {
            $.u.load("com.audit.innerAudit.comm_file.diagramView");
            this.diagramDialog = new com.audit.comm_file.diagramView($("div[umid=diagramviewdialog]", this.$));
        }
        this.diagramDialog.open({
            "id": wi_id,
            "title": "###",
            "type": "inst"
        });
    },

    init_btn: function(unitid) {
        var year = this.qid("year_plan").text();
        var plantype = "SUB2";
        if (this._options.type == "erjineishen") {
            plantype = "SUB3";
        }
        if (year.indexOf("--") < 0) {
            $.u.ajax({ //获取新建按钮是否显示
                url: $.u.config.constant.smsqueryserver,
                type: "post",
                dataType: "json",
                cache: false,
                data: {
                    "method": "getAddPlanPermission",
                    "tokenid": $.cookie("tokenid"),
                    "year": year,
                    "planType": plantype,
                    "unitId": unitid
                },
            }).done(this.proxy(function(response) {
                if (response.data.addable) {
                    var year = this.qid("year_plan").text();
                    if (year.indexOf("--") < 0) { //只有一年的情况下才能新建计划
                        if (parseInt(year) < parseInt((new Date().format("yyyy"))) + 2) { //新建计划必须今年或明年parseInt(year) >= parseInt((new Date().format("yyyy")))
                            this.qid("btn_group").html("<a href='#' class='create btn btn-default' qid='create' title='' id=''>新建</a>");
                            this.$.find(".create").unbind("click").click(this.proxy(this.new_create));
                        }
                    }
                }
            }))
        }
    },

    get_data: function(arr_year, unitid) {
        this.comm_data = null;
        var year = [];
        var now_year = new Date().format("yyyy");
        if (arr_year == undefined) {
            year.push(parseInt(now_year));
        } else {
            year = arr_year;
        }
        var plantype = "SUB2";
        //var unit_id = this.unitid;
        if (this._options.type == "erjineishen") {
            plantype = "SUB3";
            //unit_id = this.bumen_id;
        }
        var init_url = $.u.config.constant.smsqueryserver;
        var obj = {
            year: year,
            planType: plantype,
            operator: unitid
        };

        $.u.ajax({
            url: init_url,
            type: "post",
            dataType: "json",
            cache: false,
            data: {
                "method": "getPlanByYearAndType",
                "tokenid": $.cookie("tokenid"),
                "obj": JSON.stringify(obj)
            },
        }, this.$).done(this.proxy(function(data) {
            this.qid("btn_group").html("");
            this.qid("thead_th").html("");
            this.qid("tbody_td").html("");

            if (data.success) {
                if (data.data.plans.length == 1) {
                    this.qid("datatable").removeClass("two_year_width");
                    this.qid("datatable").removeClass("three_year_width");
                } else if (data.data.plans.length == 2) {
                    this.qid("datatable").removeClass("three_year_width");
                    this.qid("datatable").addClass("two_year_width");
                } else if (data.data.plans.length == 3) {
                    this.qid("datatable").removeClass("two_year_width");
                    this.qid("datatable").addClass("three_year_width");
                }

                if (data.data.plans.length == 1) {
                    //$(".diagramview").attr("data-id",data.data.plans[0].flowId);
                    this.flowid = data.data.plans[0].flowId;
                }

                this.comm_data = data;

                for (i in data.data.actions) {
                    var html_str = "";
                    var btn_name = data.data.actions[i].name;
                    var btn_id = data.data.actions[i].wipId;
                    if (data.data.actions[i].attributes.screen && data.data.actions[i].attributes.screen == "remarkBox") {
                        //通过
                        html_str += "<a name='remarkBox' href='#' class='btn btn-default " + btn_id + "' qid='" + btn_id + "' title='' id=''>" + btn_name + "</a>";
                    } else if (data.data.actions[i].attributes.screen && data.data.actions[i].attributes.screen == "denyBox") {
                        //不通过
                        html_str += "<a name='denyBox' href='#' class='btn btn-default " + btn_id + "' qid='" + btn_id + "' title='' id='' data-toggle='modal' data-target='#myModal'>" + btn_name + "</a>";
                    } else {
                        html_str += "<a href='#' class='btn btn-default " + btn_id + "' qid='" + btn_id + "' title='' id=''>" + btn_name + "</a>";
                    }
                    this.qid("btn_group").append(html_str);
                    this.$.find("." + btn_id).unbind("click").click(this.proxy(this.comm_button));

                }
                //this.qid("btn_group").html(html_str);
                if (data.data.plans.length < 1) { //返回数据为空，即还没有新建
                    this.qid("thead_th").html("<tr><th class='text-center'><h4>暂无数据可查！</h4></th></tr>");
                    this.init_btn(unitid);
                    this._drawModule(data.data.logArea); //备注
                } else {
                    /*this.qid("create").hide();*/
                    var theadstr = "<tr><th rowspan=2  class='text-center' style='line-height: 3.4;'>单位｜年月</th>";
                    var tbodystr = "";
                    for (i in data.data.plans) {
                        if (i == (data.data.plans.length - 1)) {
                            theadstr += "<th colspan=12 class='text-center'>" + data.data.plans[i].year + "</th>";
                        } else {
                            theadstr += "<th colspan=12 class='text-center' style='border-right: 1px green solid;'>" + data.data.plans[i].year + "</th>";
                        }
                    }
                    theadstr += "</tr><tr>";
                    for (i in data.data.plans) {
                        theadstr += "<th>01</th><th>02</th><th>03</th><th>04</th>" + "<th>05</th><th>06</th><th>07</th><th>08</th><th>09</th>" + "<th>10</th><th>11</th><th";
                        if (i == (data.data.plans.length - 1)) {
                            theadstr += ">12</th>";
                        } else {
                            theadstr += " style='border-right: 1px green solid;'>12</th>";
                        }
                    }

                    for (j in data.data.plans[0].targets) {
                        tbodystr += "<tr><td>" + data.data.plans[0].targets[j]['name'] + "</td>";
                        for (i in data.data.plans) {
                            tbodystr += "<td name='" + data.data.plans[i].year + "01," + data.data.plans[i].targets[j]['id'] + "," + data.data.plans[i]['id'] + "," + data.data.plans[i].targets[j]['name'] + "'></td><td name='" + data.data.plans[i].year + "02," + data.data.plans[i].targets[j]['id'] + "," + data.data.plans[i]['id'] + "," + data.data.plans[i].targets[j]['name'] + "'></td><td name='" + data.data.plans[i].year + "03," + data.data.plans[i].targets[j]['id'] + "," + data.data.plans[i]['id'] + "," + data.data.plans[i].targets[j]['name'] + "'></td><td name='" + data.data.plans[i].year + "04," + data.data.plans[i].targets[j]['id'] + "," + data.data.plans[i]['id'] + "," + data.data.plans[i].targets[j]['name'] + "'></td><td name='" + data.data.plans[i].year + "05," + data.data.plans[i].targets[j]['id'] + "," + data.data.plans[i]['id'] + "," + data.data.plans[i].targets[j]['name'] + "'></td><td name='" + data.data.plans[i].year + "06," + data.data.plans[i].targets[j]['id'] + "," + data.data.plans[i]['id'] + "," + data.data.plans[i].targets[j]['name'] + "'></td><td name='" + data.data.plans[i].year + "07," + data.data.plans[i].targets[j]['id'] + "," + data.data.plans[i]['id'] + "," + data.data.plans[i].targets[j]['name'] + "'></td><td name='" + data.data.plans[i].year + "08," + data.data.plans[i].targets[j]['id'] + "," + data.data.plans[i]['id'] + "," + data.data.plans[i].targets[j]['name'] + "'></td><td name='" + data.data.plans[i].year + "09," + data.data.plans[i].targets[j]['id'] + "," + data.data.plans[i]['id'] + "," + data.data.plans[i].targets[j]['name'] + "'></td><td name='" + data.data.plans[i].year + "10," + data.data.plans[i].targets[j]['id'] + "," + data.data.plans[i]['id'] + "," + data.data.plans[i].targets[j]['name'] + "'></td><td name='" + data.data.plans[i].year + "11," + data.data.plans[i].targets[j]['id'] + "," + data.data.plans[i]['id'] + "," + data.data.plans[i].targets[j]['name'] + "'></td>";
                            if (i == (data.data.plans.length - 1)) {
                                tbodystr += "<td name='" + data.data.plans[i].year + "12," + data.data.plans[i].targets[j]['id'] + "," + data.data.plans[i]['id'] + "," + data.data.plans[i].targets[j]['name'] + "'></td>";
                            } else {
                                tbodystr += "<td style='border-right:1px green solid' name='" + data.data.plans[i].year + "12," + data.data.plans[i].targets[j]['id'] + "," + data.data.plans[i]['id'] + "," + data.data.plans[i].targets[j]['name'] + "'></td>";
                            }
                        }
                        tbodystr += "</tr>";
                    }
                    this.qid("thead_th").html(theadstr);
                    this.qid("tbody_td").html(tbodystr);
                    for (i in data.data.plans) {
                        var jihua_step = data.data.plans[i].flowStep;
                        for (j in data.data.plans[i].targets) {
                            var danwei_id = data.data.plans[i].targets[j].id; //获取要插旗帜单位的id
                            for (k in data.data.plans[i].targets[j].tasks) {
                                var flowStep = "";
                                var flowStep1 = data.data.plans[i].targets[j].tasks[k].flowStep; //获取要插的旗帜类型
                                var plantime = data.data.plans[i].targets[j].tasks[k].planTime; //获取要插旗帜的年月
                                var td_id = data.data.plans[i].targets[j].tasks[k].id; //工作单id
                                var name_ = "'" + plantime + "," + danwei_id + "'";
                                var $_html = $("tbody").find("td[name^=" + name_ + "]");
                                var name = $_html.attr("name") + "," + td_id;
                                $_html.attr("name", name);
                                var planTime = this.indexOfjoin(data.data.plans[i].targets[j].tasks[k].planTime); //计划
                                var generateReportDate = this.indexOfjoin(data.data.plans[i].targets[j].tasks[k].generateReportDate); //审计报告
                                var btitle = "";

                                if (jihua_step === "1") { //计划新建
                                    flowStep = "plan" + data.data.plans[i].flowStep;
                                    $_html.html(("<div><img class='qizi' width='20px' height='20px'  jihua_step='" + jihua_step + "' style='position: relative;z-index: 3;' name='") + flowStep + ("' data-toggle='context' data-target='#context-menu' src='../../img/plane1.png' alt='' />"));
                                } else if (jihua_step === "2") { //计划审核
                                    flowStep = "plan" + data.data.plans[i].flowStep;
                                    $_html.html(("<div><img class='qizi' width='20px' height='20px'  jihua_step='" + jihua_step + "' style='position: relative;z-index: 3;' name='") + flowStep + ("' data-toggle='context' data-target='#context-menu' src='../../img/plane1.png' alt='' />"));
                                } else if (jihua_step === "3") { //计划发布
                                    flowStep = "task" + data.data.plans[i].targets[j].tasks[k].flowStep; //工作单的工作流
                                    if (data.data.plans[i].targets[j].tasks[k].improve) { //整改单
                                        flowStep = "improve" + data.data.plans[i].targets[j].tasks[k].improve.flowStep;
                                        var created = this.indexOfjoin(data.data.plans[i].targets[j].tasks[k].improve.created); //整改
                                        var completeDate = this.indexOfjoin(data.data.plans[i].targets[j].tasks[k].improve.completeDate); //完成
                                        var improveDelayDate = this.indexOfjoin(data.data.plans[i].targets[j].tasks[k].improve.improveDelayDate); //延期
                                        btitle += "<strong>计划：" + planTime + "</strong>" +
                                            "<br><strong>审计：" + generateReportDate + "</strong>";
                                        //improve.flowStep 整改单的 流程ID
                                        if (data.data.plans[i].targets[j].tasks[k].improve.flowStep == "1" || data.data.plans[i].targets[j].tasks[k].improve.flowStep == "2" || data.data.plans[i].targets[j].tasks[k].improve.flowStep == "3") {
                                            btitle += "<br><strong>整改：" + created + "</strong>";
                                            $_html.html(("<div><img class='qizi' width='20px' height='20px' jihua_step='" + jihua_step + "' style='position: relative;z-index: 3;'name='") + flowStep + ("'  data-toggle='tooltip'  data-placement='top' data-html='true' data-original-title='" + btitle + "' data-target='#context-menu' src='../../img/plane4.png' alt='' />"));
                                        } else if (data.data.plans[i].targets[j].tasks[k].improve.flowStep == "4") {
                                            btitle += "<br><strong>整改：" + created + "</strong>" +
                                                "<br><strong>完成：" + completeDate + "</strong>";
                                            if(data.data.plans[i].targets[j].tasks[k].improve.completeDate){
                                                $_html.html(("<div><img class='qizi' width='20px' height='20px'  jihua_step='" + jihua_step + "' style='position: relative;z-index: 3;'name='") + flowStep + ("'  data-toggle='tooltip'  data-placement='top' data-html='true' data-original-title='" + btitle + "' data-target='#context-menu' src='../../img/plane6.png' alt='' />"));
                                            }else{
                                                $_html.html(("<div><img class='qizi' width='20px' height='20px'  jihua_step='" + jihua_step + "' style='position: relative;z-index: 3;'name='") + flowStep + ("'  data-toggle='tooltip'  data-placement='top' data-html='true' data-original-title='" + btitle + "' data-target='#context-menu' src='../../img/plane4.png' alt='' />"));
                                            }
                                        } else if(data.data.plans[i].targets[j].tasks[k].improve.flowStep == "5"){
                                            btitle += "<br><strong>整改：" + created + "</strong>" +
                                                "<br><strong>完成：" + completeDate + "</strong>";
                                            $_html.html(("<div><img class='qizi' width='20px' height='20px'  jihua_step='" + jihua_step + "' style='position: relative;z-index: 3;'name='") + flowStep + ("'  data-toggle='tooltip'  data-placement='top' data-html='true' data-original-title='" + btitle + "' data-target='#context-menu' src='../../img/plane6.png' alt='' />"));
                                        } else {
                                            btitle += "<br><strong>整改：" + created + "</strong>" +
                                                "<br><strong>延期：" + improveDelayDate + "</strong>";
                                            $_html.html(("<div><img class='qizi' width='20px' height='20px'  jihua_step='" + jihua_step + "' style='position: relative;z-index: 3;'name='") + flowStep + ("'  data-toggle='tooltip'  data-placement='top' data-html='true' data-original-title='" + btitle + "' data-target='#context-menu' src='../../img/plane7.png' alt='' />"));
                                        }

                                    } else { //工作单
                                        if (data.data.plans[i].targets[j].tasks[k] && data.data.plans[i].targets[j].tasks[k].closeDate) {
                                            btitle += "<strong>计划：" + planTime + "</strong>" +
                                                "<br><strong>审计：" + generateReportDate + "</strong>";
                                            $_html.html(("<div><img class='qizi' width='20px' height='20px'  jihua_step='" + jihua_step + "' style='position: relative;z-index: 3;' name='") + flowStep + ("' data-toggle='tooltip'  data-placement='top' data-html='true' data-original-title='" + btitle + "' data-target='#context-menu' src='../../img/plane6.png' alt='' />"));
                                        } else {
                                            if (flowStep1 === "1") {
                                                btitle += "<strong>计划：" + planTime + "</strong>";
                                                $_html.html(("<div><img class='qizi' width='20px' height='20px' jihua_step='" + jihua_step + "' style='position: relative;z-index: 3;' name='") + flowStep + ("' data-toggle='tooltip'  data-placement='top' data-html='true' data-original-title='" + btitle + "' data-target='#context-menu' src='../../img/plane2.png' alt='' />"));
                                            } else if (flowStep1 === "2" || flowStep1 === "3" || flowStep1 === "4" || flowStep1 === "5") {
                                                btitle += "<strong>计划：" + planTime + "</strong>" +
                                                    "<br><strong>审计：" + generateReportDate + "</strong>";
                                                $_html.html(("<div><img class='qizi' width='20px' height='20px'  jihua_step='" + jihua_step + "' style='position: relative;z-index: 3;' name='") + flowStep + ("' data-toggle='tooltip'  data-placement='top' data-html='true' data-original-title='" + btitle + "' data-target='#context-menu' src='../../img/plane3.png' alt='' />"));
                                            } else if (flowStep1 === "6") {
                                                btitle += "<strong>计划：" + planTime + "</strong>" +
                                                    "<br><strong>审计：" + generateReportDate + "</strong>";
                                                $_html.html(("<div><img class='qizi' width='20px' height='20px'  jihua_step='" + jihua_step + "' style='position: relative;z-index: 3;' name='") + flowStep + ("' data-toggle='tooltip'  data-placement='top' data-html='true' data-original-title='" + btitle + "' data-target='#context-menu' src='../../img/plane4.png' alt='' />"));
                                            } else {
                                                btitle += "<strong>计划：" + planTime + "</strong>" +
                                                    "<br><strong>审计：" + generateReportDate + "</strong>";
                                                $_html.html(("<div><img class='qizi' width='20px' height='20px'  jihua_step='" + jihua_step + "' style='position: relative;z-index: 3;' name='") + flowStep + ("' data-toggle='tooltip'  data-placement='top' data-html='true' data-original-title='" + btitle + "' data-target='#context-menu' src='../../img/plane6.png' alt='' />"));

                                            };
                                        };
                                    }
                                } else if (jihua_step === "4") { //计划结案
                                    if (data.data.plans[i].targets[j].tasks[k].flowStatus=="结案") { //整改单
//                                        var created = this.indexOfjoin(data.data.plans[i].targets[j].tasks[k].improve.created); //整改
//                                        var completeDate = this.indexOfjoin(data.data.plans[i].targets[j].tasks[k].improve.completeDate); //完成
//                                        var improveDelayDate = this.indexOfjoin(data.data.plans[i].targets[j].tasks[k].improve.improveDelayDate); //延期
                                        btitle += "<strong>计划：" + planTime + "</strong>" +
                                            "<br><strong>审计：" + generateReportDate + "</strong>" 
//                                            +"<br><strong>整改：" + created + "</strong>" +
//                                            "<br><strong>完成：" + completeDate + "</strong>";
                                        $_html.html(("<div><img class='qizi' width='20px' height='20px'  jihua_step='" + jihua_step + "' style='position: relative;z-index: 3;' name='") + flowStep + ("'  data-toggle='tooltip'  data-placement='top' data-html='true' data-original-title='" + btitle + "' data-target='#context-menu' src='../../img/plane6.png' alt='' />"));
                                    }
                                    if (data.data.plans[i].targets[j].tasks[k].improve) { //整改单
                                        var created = this.indexOfjoin(data.data.plans[i].targets[j].tasks[k].improve.created); //整改
                                        var completeDate = this.indexOfjoin(data.data.plans[i].targets[j].tasks[k].improve.completeDate); //完成
                                        var improveDelayDate = this.indexOfjoin(data.data.plans[i].targets[j].tasks[k].improve.improveDelayDate); //延期
                                        btitle += "<strong>计划：" + planTime + "</strong>" +
                                            "<br><strong>审计：" + generateReportDate + "</strong>" +
                                            "<br><strong>整改：" + created + "</strong>" +
                                            "<br><strong>完成：" + completeDate + "</strong>";
                                        $_html.html(("<div><img class='qizi' width='20px' height='20px'  jihua_step='" + jihua_step + "' style='position: relative;z-index: 3;' name='") + flowStep + ("'  data-toggle='tooltip'  data-placement='top' data-html='true' data-original-title='" + btitle + "' data-target='#context-menu' src='../../img/plane6.png' alt='' />"));
                                    }
                                }
                            }
                        }
                    }
                    //this._addline();
                    $("img.qizi").tooltip({
                        html: true,
                        left: 25
                    });
                    this.qid("tbody_td").find("td").click(this.proxy(this.chage_td));

                    this._drawModule(data.data.logArea); //备注
                    var num_year = $(".num_year option:selected").val();
                    if (num_year === "one") { //只有一年的情况下才能草拟计划
                        this.init_memu(data.data);
                    }
                }
            } else {
                $.u.alert.error(data.reason);
            }
        }))
    },
    _addline: function() {
        //竖线
        var h = $("tbody.td_border").find("td:not(:first-child) ").eq(2).height() + 25;
        $("tbody.td_border").find("td:not(:first-child) ").each(this.proxy(function(idx, item) {
            if ($(item).find(".border-line").length == 0) {
                $("<div/>").appendTo($(item))
                    .css({
                        "background-color": 'rgb(231, 234, 223)',
                        "position": 'absolute',
                        "display": "inline-block",
                        "width": '2px',
                        "height": h + 'px',
                        "margin-top": '-15px',
                        "z-index": "2"
                    }).addClass("border-line");
            }
        }))

        $("tbody.td_border").find(".border-line").each(this.proxy(function(idx, item) {
            if ($(item).siblings().length > 0) {
                $(item).css({
                    "margin-top": '-30px',
                })
            }
        }))
    },
    show_time: function(e) {
        var name = $(e.currentTarget).attr("name");
        $(".currentyear").attr("name", name);
        var namearray = name.split(",")
        var workno = namearray.pop();
        var year = name.split(",")[0].substr(0, 4);
        var month = name.split(",")[0].substr(4, 2); //当前右键的月份
        $(".currentyear").text(year + "年");
        var $radio = $(".months").find("input[type=radio]");
        $radio.each(function() {
            $(this).removeAttr("disabled");
            $(this).attr("checked", false);
        })
        var $curr_td = this.qid("tbody_td").find("td[name*=" + name.split(",")[3] + "]");
        $curr_td = $curr_td.has("img"); //获取含有本公司旗子的td月份
        $curr_td.each(function() {
            var each_month = $(this).attr("name").split(",")[0].substr(4, 2);
            $radio.each(function() {
                if ($(this).val() == each_month) {
                    $(this).attr("disabled", "disabled");
                }
            })
        })
        $('.qiziModal').modal('show');
    },

    new_create: function() {
        event.preventDefault();
        var init_url = $.u.config.constant.smsmodifyserver;
        var year = this.qid("year_plan").text();
        var title = this.qid("title").text();
        var plantype = "SUB2";
        var unit_id = this.unitid;
        if (this._options.type == "erjineishen") {
            plantype = "SUB3";
            unit_id = this.bumen_id;
        }
        var obj = {
            planType: plantype,
            year: parseInt(year),
            "planName": title,
            "operator": unit_id
        };
        $.u.ajax({ //新建计划
            url: init_url,
            type: "post",
            dataType: "json",
            cache: false,
            data: {
                "method": "innerCreatePlan",
                "tokenid": $.cookie("tokenid"),
                "obj": JSON.stringify(obj)
            },
        }).done(this.proxy(function(response) {
            if (response.success) {
                var unit_id = "";
                if (this._options.type == "erjineishen") {
                    unit_id = this.bumen_id;
                } else {
                    unit_id = this.unitid;
                }
                this.get_data([parseInt(year)], unit_id);
            }
        }))
    },
    //添加小旗
    chage_td: function() {
        var instanceWorkflow = "";
        if (this.comm_data && this.comm_data.data.workflowNodeAttributes && this.comm_data.data.workflowNodeAttributes.flowStatus == "faBu") {
            if (this._options.type == "erjineishen") {
                instanceWorkflow = "instanceErJiInnerWorkflow";
            } else {
                instanceWorkflow = "instanceInnerWorkflow";
            }
        }
        /*if($(event.currentTarget).closest("tr").has("img").length > 0){//一年只能建立一个单
        	return;
        }*/
        if (this.comm_data.data.actions) {
            if (this.comm_data.data.actions.length == 0) {
                return;
            }
        } else {
            return;
        }

        if (this.comm_data.data.workflowNodeAttributes.canDo.indexOf("jiHua") < 0 && this.comm_data.data.workflowNodeAttributes.canDo.indexOf("jihua") < 0) {
            return;
        }
        var num_year = $(".num_year option:selected").val();
        if (num_year != "one") { //只有一年的情况下才能草拟计划
            return;
        }
        /*if(parseInt(year) < parseInt((new Date().format("yyyy"))) || parseInt(year) >= parseInt((new Date().format("yyyy")))+2){//草拟计划必须今年或明年
        	return;
        }*/
        if ($(event.currentTarget).find("img").length == 0) {

            var $_html = $(event.currentTarget);
            var danwei_id = $(event.currentTarget).attr("name").split(",")[1];
            var year = $(event.currentTarget).attr("name").split(",")[0].substr(0, 4);
            if (parseInt(year) < parseInt(new Date().format("yyyy")) || parseInt(year) > parseInt(new Date().format("yyyy")) + 1) {
                //return;
            }
            var mon = $(event.currentTarget).attr("name").split(",")[0].substr(4, 2);
            var plan = $(event.currentTarget).attr("name").split(",")[2];
            if ($(event.currentTarget).attr("name").split(",")[2] == "null") {
                if (this._options.type == "erjineishen") {
                    var obj = {
                        planType: "SUB3",
                        target: danwei_id,
                        year: parseInt(year),
                        planTime: year + mon
                    };
                } else {
                    var obj = {
                        planType: "SUB2",
                        target: danwei_id,
                        year: parseInt(year),
                        planTime: year + mon
                    };
                }
            } else {
                if (this._options.type == "erjineishen") {
                    var obj = {
                        operator: (this.bumen_id + ""),
                        plan: parseInt(plan),
                        planType: "SUB3",
                        target: danwei_id,
                        year: parseInt(year),
                        planTime: year + mon,
                        workName: (year + $(event.currentTarget).attr("name").split(",")[3] + "安全审计工作单"),
                        reportName: (year + $(event.currentTarget).attr("name").split(",")[3] + "审计报告")
                    };
                } else {
                    var obj = {
                        operator: (this.unitid + ""),
                        plan: parseInt(plan),
                        planType: "SUB2",
                        target: danwei_id,
                        year: parseInt(year),
                        planTime: year + mon,
                        workName: (year + $(event.currentTarget).attr("name").split(",")[3] + "安全审计工作单"),
                        reportName: (year + $(event.currentTarget).attr("name").split(",")[3] + "审计报告")
                    };
                }
            }
            var init_url = $.u.config.constant.smsmodifyserver;
            $.u.ajax({ //保存计划
                url: init_url,
                type: "post",
                dataType: "json",
                cache: false,
                data: {
                    "method": "createTask",
                    "tokenid": $.cookie("tokenid"),
                    "obj": JSON.stringify(obj),
                    "operate": instanceWorkflow
                },
            }).done(this.proxy(function(response) {
                if (response.success) {
                    var year = [];
                    var year_time = this.qid("year_plan").text();
                    year.push(parseInt(year_time));
                    if (this._options.type == "erjineishen") {
                        if (this.bumen_id != null) {
                            this.get_data(year, this.bumen_id);
                        }
                    } else {
                        if (this.unitid != null) {
                            this.get_data(year, this.unitid);
                        }
                    }



                }
            }))
        }
    },
    //右键点击工作单，跳转到工作单
    gongzuodan: function(e) {
        var $_current = $(event.currentTarget);
        var td_id = parseInt($_current.attr("name").split(",")[4]);
        window.open("../worklist/viewworklist.html?id=" + td_id + "&type=" + this._options.type, '_blank');
    },

    jianchadan: function(e) {
        var $_current = $(event.currentTarget);
        var td_id = parseInt($_current.attr("name").split(",")[4]);
        window.open("../worklist/viewworklist.html?id=" + td_id + "&type=" + this._options.type, '_blank');
    },

    shenjibaogao: function(e) {
        var $_current = $(event.currentTarget);
        var td_id = parseInt($_current.attr("name").split(",")[4]);
        window.open("AuditReport.html?id=" + td_id + "&type=" + this._options.type, '_blank');

    },

    zhenggaidan: function(e) {
        var $_current = $(event.currentTarget);
        var td_id = parseInt($_current.attr("name").split(",")[4]);
        if (td_id) {
            $.u.ajax({ //有工作单id查询整改单id
                url: $.u.config.constant.smsqueryserver,
                type: "post",
                dataType: "json",
                cache: false,
                data: {
                    "method": "getImproveByTaskId",
                    "taskId": td_id, //工作单ID
                    "tokenid": $.cookie("tokenid"),
                },
            }).done(this.proxy(function(response) {
                if (response.success && response.data) {
                    if (response.data.flowStep == "1" || response.data.flowStep == "2") {
                        window.open("Xitong_jihua_zhenggaifankui.html?id=" + response.data.id + "&isGroupedByImproveUnit=true&isDividedByProfession=false" + "&type=" + this._options.type)
                    } else if (response.data.flowStep == "3") {
                        window.open("Xitong_jihua_zhenggaifankui.html?id=" + response.data.id + "&isGroupedByImproveUnit=false&isDividedByProfession=true" + "&type=" + this._options.type)
                    } else {
                        window.open("Xitong_jihua_zhenggaifankui.html?id=" + response.data.id + "&isGroupedByImproveUnit=false&isDividedByProfession=false" + "&type=" + this._options.type)
                    }
                } else {
                    $.u.alert.error(response.reason || "无数据");
                }
            }))
        }
    },

    //删除旗子
    delete_qizi: function(event) {
        var $_current = $(event.currentTarget);
        var td = parseInt($_current.attr("name").split(",")[4]);
        var td_id = new Array();
        td_id[0] = td;
        var init_url = $.u.config.constant.smsmodifyserver;
        /*var obj = {year:year,planType:"SYS",plan:td_id};*/
        var clz = $.u.load("com.audit.innerAudit.comm_file.confirm");
        var confirm = new clz({
            "body": "确认删除？",
            "buttons": {
                "ok": {
                    "click": this.proxy(function() {
                        $.u.ajax({ //删除计划
                            url: init_url,
                            type: "post",
                            dataType: "json",
                            cache: false,
                            data: {
                                "method": "stdcomponent.delete",
                                "dataobjectids": JSON.stringify(td_id),
                                "tokenid": $.cookie("tokenid"),
                                "dataobject": "task"
                            },
                        }).done(this.proxy(function(response) {
                            if (response.success) {
                                var arr_name = $_current.attr("name").split(",");
                                var year = arr_name[0].substr(0, 4);
                                var year_arr = [parseInt(year)];
                                var name = arr_name.pop();
                                name = arr_name.join(",");
                                $_current.attr("name", name);
                                confirm.confirmDialog.dialog("close");
                                if (this._options.type == "erjineishen") {
                                    if (this.bumen_id != null) {
                                        this.get_data(year_arr, this.bumen_id);
                                    }
                                } else {
                                    if (this.unitid != null) {
                                        this.get_data(year_arr, this.unitid);
                                    }
                                }
                            }
                        }))
                    })
                }
            }
        });
    },

    //改变时间（年数）
    chage_time_click: function(e) {
        e.preventDefault();
        var time = $(event.currentTarget).attr("qid");
        var start_time = new Date().format("yyyy") + ".01";
        var end_time = new Date().format("yyyy") + ".12";
        if (time == "oneyear") {
            //设置显示一年的计划,调用函数改变显示
            //this.get_jihua_content((new Date()).format("yyyy"),(new Date()).format("yyyy"));
        } else if (time == "twoyear") {
            start_time = parseInt((new Date()).format("yyyy")) - 1 + ".01";
            end_time = new Date().format("yyyy") + ".12";

            // this.get_jihua_content(parseInt((new Date()).format("yyyy"))-1 + "",(new Date()).format("yyyy"));
            this.qid("baopi").hide();
        } else if (time == "threeyear") {
            start_time = parseInt((new Date()).format("yyyy")) - 2 + ".01";
            end_time = new Date().format("yyyy") + ".12";

            //this.get_jihua_content(parseInt((new Date()).format("yyyy"))-2 + "",(new Date()).format("yyyy"));
            this.qid("baopi").hide();
        } else if (time == "time_left") {
            start_time = new Date(this.qid("time_scope").text().split("---")[0]).format("yyyy");
            end_time = new Date(this.qid("time_scope").text().split("---")[1]).format("yyyy");
            var time_scope = parseInt(end_time) - parseInt(end_time);
            start_time = parseInt(start_time) - (time_scope + 1) + ".01";
            end_time = parseInt(end_time) - (time_scope + 1) + ".12";

            //this.get_jihua_content(parseInt(start_time) - (time_scope+1),parseInt(end_time) - (time_scope+1));
        } else if (time == "time_right") {
            start_time = new Date(this.qid("time_scope").text().split("---")[0]).format("yyyy");
            end_time = new Date(this.qid("time_scope").text().split("---")[1]).format("yyyy");
            if (parseInt(end_time) > parseInt((new Date()).format("yyyy"))) {
                return; //超过了当年后的第二年
            }
            var time_scope = parseInt(end_time) - parseInt(end_time);
            start_time = parseInt(start_time) + (time_scope + 1) + ".01";
            end_time = parseInt(end_time) + (time_scope + 1) + ".12";

        }
        var start_year = start_time;
        var end_year = end_time;
        $(this.qid("time_scope")).text(start_time + "---" + end_time);

        var start_ = parseInt(start_year.substr(0, 4));
        var end_ = parseInt(end_year.substr(0, 4));
        if (start_ == end_) {
            $(this.qid("year_plan")).text(start_);
        } else {
            $(this.qid("year_plan")).text(start_ + "--" + end_);
        }
        var year = [];
        if (end_ == start_) {
            year.push(end_);
        } else if ((start_ + 1) == end_) {
            year.push(end_);
            year.push(start_);
        } else if ((start_ + 2) == end_) {
            year.push(end_);
            year.push(end_ - 1);
            year.push(start_);
        }
        if (this._options.type == "erjineishen") {
            if (this.bumen_id != null) {
                this.get_data(year, this.bumen_id);
            }
        } else {
            if (this.unitid != null) {
                this.get_data(year, this.unitid);
            }
        }
    },

    //点击操作按钮(报批，审核等)
    comm_button: function(type) {
        event.preventDefault();
        var name = $(event.currentTarget).attr("name");
        /*if(name == "remarkBox"){
        	$(".modal-title").html("<label for='name' qid='"+ $(event.currentTarget).attr("qid") +"' name='laber_remarkBox'>审核通过</label>");
        	return;
        }else */
        if (name == "denyBox") {
            $(".modal-title").html("<label for='name' qid='" + $(event.currentTarget).attr("qid") + "'  name='laber_denyBox'>审核不通过</label>");
            return;
        }
        var planid = this.qid("tbody_td").find("tr").eq(0).find("td").eq(1).attr("name").split(",")[2];
        var action = "";
        if (this.isremark) {
            action = $(".modal-title").find("label").attr("qid");
            this.isremark = false;
        } else {
            action = $(event.currentTarget).attr("qid");
        }
        var init_url = $.u.config.constant.smsmodifyserver;
        var btn_name = $(".modal-title").find("label").attr("name");
        if (btn_name == "laber_denyBox") {
            $(".modal-title").find("label").attr("name", "");
            $.u.ajax({ //报批审核等
                url: init_url,
                type: "post",
                dataType: "json",
                cache: false,
                data: {
                    "method": "operate",
                    /*"dataobjectids": JSON.stringify(td_id),*/
                    "tokenid": $.cookie("tokenid"),
                    "action": action,
                    "dataobject": "plan",
                    "id": planid
                },
            }).done(this.proxy(function(response) {
                if (response.success) {
                    var year = [];
                    var year_time = this.qid("year_plan").text();
                    year.push(parseInt(year_time));
                    if (this._options.type == "erjineishen") {
                        if (this.bumen_id != null) {
                            this.get_data(year, this.bumen_id);
                        }
                    } else {
                        if (this.unitid != null) {
                            this.get_data(year, this.unitid);
                        }
                    }
                }
            }))
        } else {
            var clz = $.u.load("com.audit.innerAudit.comm_file.confirm");
            var confirm = new clz({
                "body": "确认操作？",
                "buttons": {
                    "ok": {
                        "click": this.proxy(function() {
                            $.u.ajax({ //报批审核等
                                url: init_url,
                                type: "post",
                                dataType: "json",
                                cache: false,
                                data: {
                                    "method": "operate",
                                    "tokenid": $.cookie("tokenid"),
                                    "action": action,
                                    "dataobject": "plan",
                                    "id": planid
                                },
                            }, confirm.confirmDialog.parent()).done(this.proxy(function(response) {
                                if (response.success) {
                                    confirm.confirmDialog.dialog("close");
                                    var year = [];
                                    var year_time = this.qid("year_plan").text();
                                    year.push(parseInt(year_time));
                                    if (this._options.type == "erjineishen") {
                                        if (this.bumen_id != null) {
                                            this.get_data(year, this.bumen_id);
                                        }
                                    } else {
                                        if (this.unitid != null) {
                                            this.get_data(year, this.unitid);
                                        }
                                    }
                                }
                            }))
                        })
                    }
                }
            })
        }
    },

    //选择月份后，提交更改
    qiziok: function(e) {

        var name = $(".currentyear").attr("name");
        var checked_month = $(".months").find("input[type='radio']:checked").val();
        var yearmonth = $(".currentyear").text().substr(0, 4) + checked_month;
        var namearray = name.split(",")
        var workno = namearray.pop();
        var init_url = $.u.config.constant.smsmodifyserver;
        $.u.ajax({ //更改旗子位置
            url: init_url,
            type: "post",
            dataType: "json",
            cache: false,
            data: {
                "method": "stdcomponent.update",
                "dataobjectid": parseInt(name.split(",").pop()),
                "obj": JSON.stringify({
                    "planTime": yearmonth
                }),
                "tokenid": $.cookie("tokenid"),
                "dataobject": "task",
            },
        }).done(this.proxy(function(response) {
            if (response.success) {
                $('.qiziModal').modal('hide');
                if (this._options.type == "erjineishen") {
                    if (this.bumen_id != null) {
                        this.get_data([parseInt($(".currentyear").text().substr(0, 4))], this.bumen_id);
                    }
                } else {
                    if (this.unitid != null) {
                        this.get_data([parseInt($(".currentyear").text().substr(0, 4))], this.unitid);
                    }
                }
            }
        }))
    },

    //点击审核确定按钮
    shenhe_ok: function() {
        event.preventDefault();
        var type = $(".modal-title").find("label").attr("name");
        var init_url = $.u.config.constant.smsmodifyserver;
        var descontent = this.qid("audit_description").val(); //备注内容
        if (type == "laber_denyBox" && $.trim(descontent) == "") {
            $(".alert").show();
            return;
        }
        if (type == "laber_remarkBox" && $.trim(descontent) == "") {
            this.comm_button();
            return;
        }
        var planid = this.qid("tbody_td").find("tr").eq(0).find("td").eq(1).attr("name").split(",")[2];
        var obj = {
            "source": planid,
            "sourceType": "plan",
            "body": descontent
        };
        $.u.ajax({ //审核等
            url: init_url,
            type: "post",
            dataType: "json",
            cache: false,
            data: {
                "method": "stdcomponent.add",
                "tokenid": $.cookie("tokenid"),
                "dataobject": "auditAction",
                "obj": JSON.stringify(obj)
            },
        }).done(this.proxy(function(response) {
            if (response.success) {
                this.isremark = true;
                $('#myModal').modal('hide');
                this.comm_button();
            }
        }))
    },

    /**
     * @title 销毁页面的组件,请空按钮
     */
    _destroyModule: function() {
        this.comps && $.each(this.comps, this.proxy(function(key, comp) {
            comp.destroy();
            delete this.comps[key];
        }));
        this.leftColumns.empty();
    },
    _drawModule: function(config) {
        var $target = null,
            clazz = null,
            option = {};
        var planid = (this.qid("tbody_td").html() == "") ? "" : this.qid("tbody_td").find("tr").eq(0).find("td").eq(1).attr("name").split(",")[2];
        this._destroyModule();
        if (config) {
            //config.left && $.each(config.left,this.proxy(function(idx,comp){
            clazz = $.u.load(config.key);
            option = $.extend(true, {}, config, {
                logRule: [
                    [{
                        "key": "source",
                        "value": parseInt(planid)
                    }],
                    [{
                        "key": "sourceType",
                        "value": "plan"
                    }]
                ],
                remarkRule: [
                    [{
                        "key": "source",
                        "value": parseInt(planid)
                    }],
                    [{
                        "key": "sourceType",
                        "value": "plan"
                    }]
                ],
                remarkObj: {
                    source: parseInt(planid),
                    sourceType: "plan"
                },
                "addable": true,
                flowid: this.flowid
            });
            this.comps[config.key] = new clazz($("<div umid='leftmodule4" + "'/>").appendTo(this.leftColumns), option);
        };
    },

    change_firstyear: function(e) {
        var first_year = $(e.currentTarget).val();
        var num_year = this.num_year.val();
        var arr_year = [];
        var year_plan = "";
        if (num_year == "one") {
            arr_year.push(parseInt(first_year));
            year_plan = first_year;
        } else if (num_year == "two") {
            arr_year.push(parseInt(first_year));
            arr_year.push(parseInt(first_year) + 1);
            year_plan += first_year + "--" + (parseInt(first_year) + 1);
        } else if (num_year == "three") {
            arr_year.push(parseInt(first_year));
            arr_year.push(parseInt(first_year) + 1);
            arr_year.push(parseInt(first_year) + 2);
            year_plan += first_year + "--" + (parseInt(first_year) + 2);
        }
        this.qid("year_plan").html(year_plan);
        if (this._options.type == "erjineishen") {
            if (this.bumen_id != null) {
                this.get_data(arr_year, this.bumen_id);
            }
        } else {
            if (this.unitid != null) {
                this.get_data(arr_year, this.unitid);
            }
        }
    },

    change_numyear: function(e) {
        var num_year = $(e.currentTarget).val();
        var first_year = this.first_year.val();
        var arr_year = [];
        var year_plan = "";
        if (num_year == "one") {
            arr_year.push(parseInt(first_year));
            year_plan = first_year;
        } else if (num_year == "two") {
            arr_year.push(parseInt(first_year));
            arr_year.push(parseInt(first_year) + 1);
            year_plan += first_year + "--" + (parseInt(first_year) + 1);
        } else if (num_year == "three") {
            arr_year.push(parseInt(first_year));
            arr_year.push(parseInt(first_year) + 1);
            arr_year.push(parseInt(first_year) + 2);
            year_plan += first_year + "--" + (parseInt(first_year) + 2);
        }
        this.qid("year_plan").html(year_plan);

        if (this._options.type == "erjineishen") {
            if (this.bumen_id != null) {
                this.get_data(arr_year, this.bumen_id);
            }
        } else {
            if (this.unitid != null) {
                this.get_data(arr_year, this.unitid);
            }
        }
    },



    init_memu: function(data) {
        var actionlength = 0;
        if (data.actions) {
            actionlength = data.actions.length;
        }
        var boolSeeTask = data.boolSeeTask || false;
        $('.qizi').on("contextmenu", function(event) {
            $(".gongzuodan,.jianchadan,.shenjibaogao,.zhenggaidan,.genzongbiao,.delete,.update").addClass("hidden");
            var flowStep_name = $(this).attr("name");
            event.preventDefault(); //阻止浏览器与事件相关的默认行为；此处就是弹出右键菜单 
            var name = $(this).closest("td").attr("name");
            $(".gongzuodan_time").attr("name", name);
            $(".jianchadan_time").attr("name", name);
            $(".shenjibaogao_time").attr("name", name);
            $(".zhenggaidan_time").attr("name", name);
            $(".update_time").attr("name", name);
            $(".delete_time").attr("name", name);
            var pageX = event.pageX; //鼠标单击的x坐标
            var pageY = event.pageY; //鼠标单击的y坐标
            if (boolSeeTask || !!actionlength) { //有查看权限或者有流程按钮
                switch (flowStep_name) {
                    case "plan1":
                        //计划新建 报批前
                        if (!!actionlength) {
                            $(".delete,.update").removeClass("hidden");
                        }
                        break;
                    case "plan2":
                        //计划报批后审核通过前
                        if (!!actionlength) {
                            $(".delete,.update").removeClass("hidden");
                        }
                        break;
                    case "plan3":
                        //计划审核通过后 发布
                        $(".gongzuodan,.delete,.update").removeClass("hidden");
                        break;
                    case "plan4":
                        //计划结案
                        $(".gongzuodan,.jianchadan,.shenjibaogao,.zhenggaidan").removeClass("hidden");
                        break;
                    case "task1":
                        //工作单//指派
                        $(".gongzuodan,.delete,.update").removeClass("hidden");
                        break;
                    case "task2":
                        //工作单// 选组员 //  点击下一步，进入审计报告流程
                        $(".gongzuodan,.jianchadan").removeClass("hidden");
                        break;
                    case "task3":
                        //工作单// 审计报告   //点击生成审计报告，进入3
                        $(".gongzuodan,.jianchadan,.shenjibaogao").removeClass("hidden");
                        break;
                    case "task4":
                        //工作单 //签批
                        $(".gongzuodan,.jianchadan,.shenjibaogao").removeClass("hidden");
                        break;
                    case "task5":
                        //工作单 //完成
                        $(".gongzuodan,.jianchadan,.shenjibaogao,.zhenggaidan").removeClass("hidden");
                        break;
                    case "task7":
                        //工作单 //完成
                        $(".gongzuodan,.jianchadan,.shenjibaogao").removeClass("hidden");
                        break;
                    case "improve1":
                        //整改单//填写原因和措施
                        $(".gongzuodan,.jianchadan,.shenjibaogao,.zhenggaidan").removeClass("hidden");
                        break;
                    case "improve2":
                        //整改单//整改审核
                        $(".gongzuodan,.jianchadan,.shenjibaogao,.zhenggaidan").removeClass("hidden");
                        break;
                    case "improve3":
                        //整改单//整改完成情况
                        $(".gongzuodan,.jianchadan,.shenjibaogao,.zhenggaidan").removeClass("hidden");
                        break;
                    case "improve4":
                        //整改单//完成
                        $(".gongzuodan,.jianchadan,.shenjibaogao,.zhenggaidan").removeClass("hidden");
                        break;
                    case "improve5":
                        //整改单//结案
                        $(".gongzuodan,.jianchadan,.shenjibaogao,.zhenggaidan").removeClass("hidden");
                        break;
                }

            } else { //判断是否是流程处理人，是否参与过流程的处理，参与过哪些流程
                var taksid = name.split(",")[4] || null;
                if (taksid) {
                    $.u.ajax({
                        url: $.u.config.constant.smsqueryserver,
                        type: "post",
                        dataType: "json",
                        cache: false,
                        async: false,
                        data: {
                            "method": "getTaskMenuPermissionByUser",
                            "tokenid": $.cookie("tokenid"),
                            "taskId": taksid
                        }
                    }).done(function(response) {
                        if (response.success) {
                            $.each(response.data, function(idx, item) {
                                switch (item) {
                                    case "task":
                                        $(".gongzuodan").removeClass("hidden");
                                        break;
                                    case "check":
                                        $(".jianchadan").removeClass("hidden");
                                        break;
                                    case "report":
                                        $(".shenjibaogao").removeClass("hidden");
                                        break;
                                    case "improve":
                                        $(".zhenggaidan").removeClass("hidden");
                                        break;
                                    case "trace":
                                        $(".genzongbiao").removeClass("hidden");
                                        break;
                                }
                            })
                        } else {
                            $.u.alert.info(response.reason, 2000);
                        }
                    })
                }
            }
            $(".youjian_Menu").css({
                left: pageX + "px", //设置菜单离页面左边距离，left等效于x坐标 
                top: pageY + "px" //设置菜单离页面上边距离，top等效于y坐标
            }).stop().show(); //显示使用淡入效果,比如不需要动画可以使用show()替换;

            if ($(".youjian_Menu").find("li:visible").length === 0) {
                $(".youjian_Menu").hide();
            }


        });
    },



    //点击导出按钮
    daochu: function() {
        event.preventDefault();
    },

    destroy: function() {
        this._super();
    }
}, {
    usehtm: true,
    usei18n: false
});

com.audit.innerAudit.xitong_jihua.gongzuotai_content.widgetjs = ['../../../../uui/widget/jqurl/jqurl.js',
    '../../../../uui/widget/jqdatatable/js/jquery.dataTables.js',
    '../../../../uui/widget/jqdatatable/js/dataTables.bootstrap.js',
    "../../../../uui/widget/select2/js/select2.min.js"
];
com.audit.innerAudit.xitong_jihua.gongzuotai_content.widgetcss = [{
    id: "",
    path: "../../../../uui/widget/select2/css/select2.css"
}, {
    id: "",
    path: "../../../../uui/widget/select2/css/select2-bootstrap.css"
}, {
    path: '../../../../uui/widget/jqdatatable/css/jquery.dataTables.css'
}, {
    path: '../../../../uui/widget/jqdatatable/css/dataTables.bootstrap.css'
}];