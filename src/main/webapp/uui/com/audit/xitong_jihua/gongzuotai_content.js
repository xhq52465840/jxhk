//@ sourceURL=com.audit.xitong_jihua.gongzuotai_content
$.u.define('com.audit.xitong_jihua.gongzuotai_content', null, {
    init: function(options) {
        this._options = options;
        this.urlparam = {};
        this._activity = null;
        this._timerduration = 500;
        this._timer = null;
        this._isDisplayedRightMenu = false;
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
        this.flowid = null;
        this.isremark = false;
        this.comm_data = null;
        this.currdo_year = null;
        this.leftColumns = this.qid("left-column");
        this.first_year = $(".first_year");
        this.num_year = $(".num_year");
        this.comps = {};

        this.getFirstPlanYear();
        var year = [];
        var this_year = this._options.year || new Date().format("yyyy");
        year.push(parseInt(this_year));
        this.get_data(year); //先调用服务显示或隐藏某些元素及按钮
        this.qid("time_left").click(this.proxy(this.chage_time_click));
        this.qid("time_right").click(this.proxy(this.chage_time_click));

        this.qid("oneyear").click(this.proxy(this.chage_time_click));
        this.qid("twoyear").click(this.proxy(this.chage_time_click));
        this.qid("threeyear").click(this.proxy(this.chage_time_click));
        //审核按钮（通过，不通过）
        this.qid("shenhe_btn").click(this.proxy(this.shenhe_ok));
        this.qid("qiziok").click(this.proxy(this.qiziok));
        $(".update_time").click(this.proxy(this.show_time));
        $(".gongzuodan_time").click(this.proxy(this.gongzuodan));
        $(".jianchadan_time").click(this.proxy(this.jianchadan));
        $(".shenjibaogao_time").click(this.proxy(this.shenjibaogao));
        $(".zhenggaidan_time").click(this.proxy(this.zhenggaidan));
        $(".genzongbiao_time").click(this.proxy(this.genzongbiao));
        $(".delete_time").click(this.proxy(this.delete_qizi));

        $("#myModal").on('hide.bs.modal', function() { //关闭模态框时清除警告提示
            $(".alert").hide();
        })

        $(document).on("mousedown", function(event) {
            //button等于0代表左键，button等于1代表中键	
            if (event.button == 0 || event.button == 1) {
                $("div.coveraudit").hide();
                $(".youjian_Menu").stop().fadeOut(200); //获取菜单停止动画，进行隐藏使用淡出效果		} });
            }
        });
        /*2016.07.07 增加ipad触屏长按，弹出菜单功能  当菜单显示时，点击其他地方菜单隐藏 start 3*/
        $("div.coveraudit").height($(document).height());
        $("div.coveraudit").width($(document).width());
        $("div.coveraudit").on("touchstart", function(event) {
            event.preventDefault();
            $(".youjian_Menu").stop().fadeOut(200); //获取菜单停止动画，进行隐藏使用淡出效果
            $("div.coveraudit").hide();
        });
        /*2016.07.07 增加ipad触屏长按，弹出菜单功能  当菜单显示时，点击其他地方菜单隐藏 end 3*/
        this.first_year.change(this.proxy(this.change_firstyear));
        this.num_year.change(this.proxy(this.change_numyear));

        var elm = this.qid("thead_th");
        var yuele = this.qid("yueli_width");
        $(window).scroll(function() {
            var height = elm.height();
            var width = elm.width();
            var top = elm.offset().top;
            var left = elm.offset().left;
            var navbar = $(".year-month-navbar")
            var temp = yuele.clone();
            if ($(this).scrollTop() > top) {
                navbar.addClass("year_month_fixed");
                navbar.offset().top = top;
                navbar.offset().left = left;
                temp.find("tbody").remove();
                temp.attr("style", "postion:fixed,top: 0px;right:20px;z-index:999;");
                /**
                 * 样式处理
                 */
                var agent = navigator.userAgent.toLowerCase();
        		if(agent.indexOf("edge") > 0){ 
        			if(screen.availWidth==1920){
        				temp.find("th")[0].style.minWidth="227px";
        			}else{
        				temp.find("th")[0].style.minWidth=(screen.availWidth-1366)/10+152+"px";
        			}
        		}else if(agent.indexOf("chrome") > 0){ 
        			if(screen.availWidth==1920){
        				temp.find("th")[0].style.minWidth="225px";
        			}else{
        				temp.find("th")[0].style.minWidth=(screen.availWidth-1366)/10+150+"px";
        			}
        		}else if(agent.indexOf("msie") > 0 || agent.indexOf("Edge") > 0){ 
        			if(screen.availWidth==1920){
        				temp.find("th")[0].style.minWidth="227px";
        			}else{
        				temp.find("th")[0].style.minWidth=(screen.availWidth-1366)/10+152+"px";
        			}
        		}else{ 
        			if(screen.availWidth==1920){
        				temp.find("th")[0].style.minWidth="227px";
        			}else{
        				temp.find("th")[0].style.minWidth=(screen.availWidth-1366)/10+152+"px";
        			}
        		}
                if (navbar.find("table").length == 0) {
                    temp.height(height + "px");
                    temp.width(width + "px");
                    temp.find("th:first").addClass("td_header_th_first");
                    navbar.append(temp);
                }
            } else {
                navbar.removeClass("year_month_fixed").find("div").remove()
            }
        });
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
        this.get_data(arr_year);
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
        this.get_data(arr_year);
    },

    getFirstPlanYear: function() {
        var now_year = new Date().format("yyyy");
        $.u.ajax({
            url: $.u.config.constant.smsqueryserver,
            type: "post",
            dataType: "json",
            cache: false,
            data: {
                "method": "getFirstPlanYear",
                "tokenid": $.cookie("tokenid"),
                "planType": "SYS"
            }
        }).done(this.proxy(function(response) {
            if (response.success) {
                var first_year;
                if (response.data) {
                    first_year = parseInt(response.data);
                    var s_html = "";
                    if (first_year > parseInt(now_year)) {
                        s_html += "<option value='" + parseInt(now_year) + "'>" + parseInt(now_year) + "年</option>";
                        s_html += "<option value='" + (parseInt(now_year) + 1) + "'>" + (parseInt(now_year) + 1) + "年</option>";
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
            $.u.load("com.audit.comm_file.diagramView");
            this.diagramDialog = new com.audit.comm_file.diagramView($("div[umid=diagramviewdialog]", this.$));
        }
        this.diagramDialog.open({
            "id": wi_id,
            "title": "###",
            "type": "inst"
        });
    },
    button_init: function() { //新建按钮是否显示
        var init_url = $.u.config.constant.smsqueryserver;
        var year = this.qid("year_plan").text();
        if (year.indexOf("--") < 0) {
            //var id = response.data.aaData[0].value+"";
            $.u.ajax({ //获取新建按钮是否显示
                url: init_url,
                type: "post",
                dataType: "json",
                cache: false,
                data: {
                    "method": "getAddPlanPermission",
                    "tokenid": $.cookie("tokenid"),
                    "year": year,
                    "planType": "SYS"
                }
            }).done(this.proxy(function(response) {
                if (response.data.addable) {
                    var year = this.qid("year_plan").text();
                    if (year.indexOf("--") < 0) { //只有一年的情况下才能新建计划
                        if (parseInt(year) < parseInt((new Date().format("yyyy"))) + 2) { //新建计划必须今年或明年 parseInt(year) >= parseInt((new Date().format("yyyy")))
                            this.qid("btn_group").html("<a href='#' class='create btn btn-default' qid='create' title='' id=''>新建</a>");
                            this.$.find(".create").unbind("click").click(this.proxy(this.new_create));
                        }
                    }
                }
            }))
        }
    },

    get_data: function(arr_year) {
        this.comm_data = null;
        $.u.ajax({
            url: $.u.config.constant.smsqueryserver,
            type: "post",
            dataType: "json",
            cache: false,
            data: {
                "method": "getPlanByYearAndType",
                "tokenid": $.cookie("tokenid"),
                "obj": JSON.stringify({
                    year: arr_year,
                    planType: "SYS"
                })
            }
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
                if (data.data.plans.length < 1) { //返回数据为空，即还没有新建
                    this.qid("thead_th").html("<tr><th class='text-center'><h4>暂无数据可查！</h4></th></tr>");
                    this.button_init();
                    this._drawModule(data.data.logArea); //备注
                } else {
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
                            tbodystr += "<td name='" + data.data.plans[i].year + "01," + data.data.plans[0].targets[j]['id'] + "," + data.data.plans[i]['id'] + "," + data.data.plans[0].targets[j]['name'] + "'></td><td name='" + data.data.plans[i].year + "02," + data.data.plans[0].targets[j]['id'] + "," + data.data.plans[i]['id'] + "," + data.data.plans[0].targets[j]['name'] + "'></td><td name='" + data.data.plans[i].year + "03," + data.data.plans[0].targets[j]['id'] + "," + data.data.plans[i]['id'] + "," + data.data.plans[0].targets[j]['name'] + "'></td><td name='" + data.data.plans[i].year + "04," + data.data.plans[0].targets[j]['id'] + "," + data.data.plans[i]['id'] + "," + data.data.plans[0].targets[j]['name'] + "'></td><td name='" + data.data.plans[i].year + "05," + data.data.plans[0].targets[j]['id'] + "," + data.data.plans[i]['id'] + "," + data.data.plans[0].targets[j]['name'] + "'></td><td name='" + data.data.plans[i].year + "06," + data.data.plans[0].targets[j]['id'] + "," + data.data.plans[i]['id'] + "," + data.data.plans[0].targets[j]['name'] + "'></td><td name='" + data.data.plans[i].year + "07," + data.data.plans[0].targets[j]['id'] + "," + data.data.plans[i]['id'] + "," + data.data.plans[0].targets[j]['name'] + "'></td><td name='" + data.data.plans[i].year + "08," + data.data.plans[0].targets[j]['id'] + "," + data.data.plans[i]['id'] + "," + data.data.plans[0].targets[j]['name'] + "'></td><td name='" + data.data.plans[i].year + "09," + data.data.plans[0].targets[j]['id'] + "," + data.data.plans[i]['id'] + "," + data.data.plans[0].targets[j]['name'] + "'></td><td name='" + data.data.plans[i].year + "10," + data.data.plans[0].targets[j]['id'] + "," + data.data.plans[i]['id'] + "," + data.data.plans[0].targets[j]['name'] + "'></td><td name='" + data.data.plans[i].year + "11," + data.data.plans[0].targets[j]['id'] + "," + data.data.plans[i]['id'] + "," + data.data.plans[0].targets[j]['name'] + "'></td>";
                            if (i == (data.data.plans.length - 1)) {
                                tbodystr += "<td name='" + data.data.plans[i].year + "12," + data.data.plans[0].targets[j]['id'] + "," + data.data.plans[i]['id'] + "," + data.data.plans[0].targets[j]['name'] + "'></td>";
                            } else {
                                tbodystr += "<td style='border-right:1px green solid' name='" + data.data.plans[i].year + "12," + data.data.plans[0].targets[j]['id'] + "," + data.data.plans[i]['id'] + "," + data.data.plans[0].targets[j]['name'] + "'></td>";
                            }
                        }
                        tbodystr += "</tr>";
                    }
                    this.qid("thead_th").html(theadstr);
                    this.qid("tbody_td").html(tbodystr);
                    this.qid("thead_th").find("th").get(0).style.minWidth="150px";
                    for(i in this.qid("thead_th").find("th:gt(1)")){
                    	if(i<=11){
                    		this.qid("thead_th").find("th:gt(1)")[i].style.minWidth="80px"
                    	}
                    };
                    for(i in this.qid("tbody_td").find("tr")){
                    	if(i<=11){
                    		for(o in $(this.qid("tbody_td").find("tr")[i]).find("td:gt(0)")){
                        		if(o<=11){
                        			$(this.qid("tbody_td").find("tr")[i]).find("td:gt(0)")[o].style.width="79px";
                        		}
                        	}
                    	}
                    }
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
                                    $_html.html(("<div><img class='qizi' width='20px' height='20px'  jihua_step='" + jihua_step + "' style='position: relative;z-index: 3;' name='") + flowStep + ("' data-toggle='context' data-target='#context-menu' src='../img/plane1.png' alt='' />"));
                                } else if (jihua_step === "2") { //计划审核
                                    flowStep = "plan" + data.data.plans[i].flowStep;
                                    $_html.html(("<div><img class='qizi' width='20px' height='20px'  jihua_step='" + jihua_step + "' style='position: relative;z-index: 3;' name='") + flowStep + ("' data-toggle='context' data-target='#context-menu' src='../img/plane1.png' alt='' />"));
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
                                            $_html.html(("<div><img class='qizi' width='20px' height='20px' jihua_step='" + jihua_step + "' style='position: relative;z-index: 3;'name='") + flowStep + ("'  data-toggle='tooltip'  data-placement='top' data-html='true' data-original-title='" + btitle + "' data-target='#context-menu' src='../img/plane4.png' alt='' />"));
                                        } else if (data.data.plans[i].targets[j].tasks[k].improve.flowStep == "4") {
                                            btitle += "<br><strong>整改：" + created + "</strong>" +
                                                "<br><strong>完成：" + completeDate + "</strong>";
                                            if(data.data.plans[i].targets[j].tasks[k].improve.completeDate){
                                                $_html.html(("<div><img class='qizi' width='20px' height='20px'  jihua_step='" + jihua_step + "' style='position: relative;z-index: 3;'name='") + flowStep + ("'  data-toggle='tooltip'  data-placement='top' data-html='true' data-original-title='" + btitle + "' data-target='#context-menu' src='../img/plane6.png' alt='' />"));
                                            }else{
                                                $_html.html(("<div><img class='qizi' width='20px' height='20px'  jihua_step='" + jihua_step + "' style='position: relative;z-index: 3;'name='") + flowStep + ("'  data-toggle='tooltip'  data-placement='top' data-html='true' data-original-title='" + btitle + "' data-target='#context-menu' src='../img/plane4.png' alt='' />"));
                                            }
                                        } else if(data.data.plans[i].targets[j].tasks[k].improve.flowStep == "5"){
                                            btitle += "<br><strong>整改：" + created + "</strong>" +
                                                "<br><strong>完成：" + completeDate + "</strong>";
                                            $_html.html(("<div><img class='qizi' width='20px' height='20px'  jihua_step='" + jihua_step + "' style='position: relative;z-index: 3;'name='") + flowStep + ("'  data-toggle='tooltip'  data-placement='top' data-html='true' data-original-title='" + btitle + "' data-target='#context-menu' src='../img/plane6.png' alt='' />"));
                                        }else{
                                            btitle += "<br><strong>整改：" + created + "</strong>" +
                                                "<br><strong>延期：" + improveDelayDate + "</strong>";
                                            $_html.html(("<div><img class='qizi' width='20px' height='20px'  jihua_step='" + jihua_step + "' style='position: relative;z-index: 3;'name='") + flowStep + ("'  data-toggle='tooltip'  data-placement='top' data-html='true' data-original-title='" + btitle + "' data-target='#context-menu' src='../img/plane7.png' alt='' />"));
                                        }

                                    } else { //工作单
                                        if (data.data.plans[i].targets[j].tasks[k] && data.data.plans[i].targets[j].tasks[k].closeDate) {
                                            btitle += "<strong>计划：" + planTime + "</strong>" +
                                                "<br><strong>审计：" + generateReportDate + "</strong>";
                                            $_html.html(("<div><img class='qizi' width='20px' height='20px'  jihua_step='" + jihua_step + "' style='position: relative;z-index: 3;' name='") + flowStep + ("' data-toggle='tooltip'  data-placement='top' data-html='true' data-original-title='" + btitle + "' data-target='#context-menu' src='../img/plane6.png' alt='' />"));

                                        } else {
                                            if (flowStep1 === "1") {
                                                btitle += "<strong>计划：" + planTime + "</strong>";
                                                $_html.html(("<div><img class='qizi' width='20px' height='20px' jihua_step='" + jihua_step + "' style='position: relative;z-index: 3;' name='") + flowStep + ("' data-toggle='tooltip'  data-placement='top' data-html='true' data-original-title='" + btitle + "' data-target='#context-menu' src='../img/plane2.png' alt='' />"));
                                            } else if (flowStep1 === "2" || flowStep1 === "3" || flowStep1 === "4" || flowStep1 === "5") {
                                                btitle += "<strong>计划：" + planTime + "</strong>" +
                                                    "<br><strong>审计：" + generateReportDate + "</strong>";
                                                $_html.html(("<div><img class='qizi' width='20px' height='20px'  jihua_step='" + jihua_step + "' style='position: relative;z-index: 3;' name='") + flowStep + ("' data-toggle='tooltip'  data-placement='top' data-html='true' data-original-title='" + btitle + "' data-target='#context-menu' src='../img/plane3.png' alt='' />"));
                                            } else if (flowStep1 === "6") {
                                                btitle += "<strong>计划：" + planTime + "</strong>" +
                                                    "<br><strong>审计：" + generateReportDate + "</strong>";
                                                $_html.html(("<div><img class='qizi' width='20px' height='20px'  jihua_step='" + jihua_step + "' style='position: relative;z-index: 3;' name='") + flowStep + ("' data-toggle='tooltip'  data-placement='top' data-html='true' data-original-title='" + btitle + "' data-target='#context-menu' src='../../img/plane4.png' alt='' />"));
                                            } else {
                                                btitle += "<strong>计划：" + planTime + "</strong>" +
                                                    "<br><strong>审计：" + generateReportDate + "</strong>";
                                                $_html.html(("<div><img class='qizi' width='20px' height='20px'  jihua_step='" + jihua_step + "' style='position: relative;z-index: 3;' name='") + flowStep + ("' data-toggle='tooltip'  data-placement='top' data-html='true' data-original-title='" + btitle + "' data-target='#context-menu' src='../img/plane6.png' alt='' />"));

                                            };

                                        };

                                    }
                                } else if (jihua_step === "4") { //计划结案
                     
                                	if (data.data.plans[i].targets[j].tasks[k].flowStatus=="结案") { //整改单
//                                      var created = this.indexOfjoin(data.data.plans[i].targets[j].tasks[k].improve.created); //整改
//                                      var completeDate = this.indexOfjoin(data.data.plans[i].targets[j].tasks[k].improve.completeDate); //完成
//                                      var improveDelayDate = this.indexOfjoin(data.data.plans[i].targets[j].tasks[k].improve.improveDelayDate); //延期
                                      btitle += "<strong>计划：" + planTime + "</strong>" +
                                          "<br><strong>审计：" + generateReportDate + "</strong>" 
//                                          +"<br><strong>整改：" + created + "</strong>" +
//                                          "<br><strong>完成：" + completeDate + "</strong>";
                                      $_html.html(("<div><img class='qizi' width='20px' height='20px'  jihua_step='" + jihua_step + "' style='position: relative;z-index: 3;' name='") + flowStep + ("'  data-toggle='tooltip'  data-placement='top' data-html='true' data-original-title='" + btitle + "' data-target='#context-menu' src='../img/plane6.png' alt='' />"));
                                  }
                                	 if (data.data.plans[i].targets[j].tasks[k].improve) { //整改单
                                         var created = this.indexOfjoin(data.data.plans[i].targets[j].tasks[k].improve.created); //整改
                                         var completeDate = this.indexOfjoin(data.data.plans[i].targets[j].tasks[k].improve.completeDate); //完成
                                         var improveDelayDate = this.indexOfjoin(data.data.plans[i].targets[j].tasks[k].improve.improveDelayDate); //延期
                                         btitle += "<strong>计划：" + planTime + "</strong>" +
                                             "<br><strong>审计：" + generateReportDate + "</strong>" +
                                             "<br><strong>整改：" + created + "</strong>" +
                                             "<br><strong>完成：" + completeDate + "</strong>";
                                         $_html.html(("<div><img class='qizi' width='20px' height='20px'  jihua_step='" + jihua_step + "' style='position: relative;z-index: 3;' name='") + flowStep + ("'  data-toggle='tooltip'  data-placement='top' data-html='true' data-original-title='" + btitle + "' data-target='#context-menu' src='../img/plane6.png' alt='' />"));
                                     }

                                }
                            }
                        }
                    }

                    //this._addline();
                    $("img.qizi").tooltip({
                        html: true,
                        left: 25,
                        trigger: 'click hover focus'
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
                        "margin-top": '-16px',
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
        var year = name.split(",")[0].substr(0, 4);
        var month = name.split(",")[0].substr(4, 2); //当前右键的月份
        $(".currentyear").text(year + "年");
        $radio = $(".months").find("input[type=radio]");
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
        var obj = {
            planType: "SYS",
            year: parseInt(year),
            "planName": title
        };
        $.u.ajax({ //新建计划
            url: init_url,
            type: "post",
            dataType: "json",
            cache: false,
            data: {
                "method": "stdcomponent.add",
                "dataobject": "plan",
                "tokenid": $.cookie("tokenid"),
                "obj": JSON.stringify(obj)
            }
        }).done(this.proxy(function(response) {
            if (response.success) {
                this.get_data([parseInt(year)]);
            }
        }))
    },
    //添加小旗
    chage_td: function(event) {
        var instanceWorkflow = "";
        if (this.comm_data && this.comm_data.data.workflowNodeAttributes && this.comm_data.data.workflowNodeAttributes.flowStatus == "faBu") {
            instanceWorkflow = "instanceWorkflow";
        }
        /*if($(event.currentTarget).closest("tr").has("img").length > 0){//一年只能建立一个单
        	return;
        }*/
        if (this.comm_data.data.actions.length <= 0) {
            return;
        }
        if (this.comm_data.data.workflowNodeAttributes.canDo.indexOf("jiHua") < 0 && this.comm_data.data.workflowNodeAttributes.canDo.indexOf("jihua") < 0) {
            return;
        }
        var num_year = $(".num_year option:selected").val();
        if (num_year != "one") { //只有一年的情况下才能草拟计划
            return;
        }
        /*if($(event.currentTarget).html() == ""){*/
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
                var obj = {
                    planType: "SYS",
                    target: danwei_id,
                    year: parseInt(year),
                    planTime: year + mon
                };
            } else {
                var obj = {
                    plan: parseInt(plan),
                    planType: "SYS",
                    target: danwei_id,
                    year: parseInt(year),
                    planTime: year + mon,
                    workName: (year + $(event.currentTarget).attr("name").split(",")[3] + "安全审计工作单"),
                    reportName: (year + $(event.currentTarget).attr("name").split(",")[3] + "审计报告")
                };
            }
            $.u.ajax({ //保存计划
                url: $.u.config.constant.smsmodifyserver,
                type: "post",
                dataType: "json",
                cache: false,
                data: {
                    "method": "createTask",
                    "tokenid": $.cookie("tokenid"),
                    "obj": JSON.stringify(obj),
                    "operate": instanceWorkflow
                }
            }).done(this.proxy(function(response) {
                if (response.success) {
                    var year = [];
                    var year_time = parseInt(this.qid("year_plan").text());
                    year.push(year_time);
                    this.get_data(year);
                }
            }))
        }
    },
    //右键点击工作单，跳转到工作单
    gongzuodan: function(e) {
        e.stopPropagation();
        $_current = $(e.currentTarget);
        var td_id = parseInt($_current.attr("name").split(",")[4]);
        window.open("../worklist/viewworklist.html?id=" + td_id, '_blank');
    },

    jianchadan: function(e) {
        e.stopPropagation();
        $_current = $(e.currentTarget);
        var td_id = parseInt($_current.attr("name").split(",")[4]);
        window.open("../worklist/viewworklist.html?id=" + td_id, '_blank');
    },

    shenjibaogao: function(e) {
        e.stopPropagation();
        $_current = $(e.currentTarget);
        var td_id = parseInt($_current.attr("name").split(",")[4]);
        if ($_current.hasClass("shengcheng")) {
            window.open("Xitong_jihua_shengchengshenjibaogao.html?id=" + td_id, '_blank');
        } else if ($_current.hasClass("shangchuan")) {
            window.open("Xitong_jihua_shangchuanshenjibaogao.html?id=" + td_id, '_blank');
        }
    },

    zhenggaidan: function(e) {
        e.stopPropagation();
        var $e = $(e.currentTarget),
            dataId = $e.attr("name").split(",");
        var newWindow = window.open();
        if (dataId[1]) {
            $.u.ajax({
                url: $.u.config.constant.smsqueryserver,
                type: "post",
                dataType: "json",
                cache: false,
                data: {
                    "method": "checkThirdGradeAuditMaster",
                    "unitId": dataId[1],
                    "tokenid": $.cookie("tokenid")
                }
            }).done(this.proxy(function(data) {
                if (data.success) {
                    var show = data.data;
                    $.u.ajax({
                        url: $.u.config.constant.smsqueryserver,
                        type: "post",
                        dataType: "json",
                        cache: false,
                        data: {
                            "method": "getImproveByTaskId",
                            "taskId": parseInt(dataId[4]),
                            "tokenid": $.cookie("tokenid")
                        }
                    }).done(this.proxy(function(response) {
                        if (response.success) {
                            newWindow.location = "Xitong_jihua_zhenggaifankui.html?id=" + response.data.id + "&isTransmitted=false&isDividedByProfession=true";
                            // if (response.data.flowStep === "2") {
                            //     newWindow.location = "Xitong_jihua_zhenggaifankui.html?id=" + response.data.id + "&isTransmitted=false&isDividedByProfession=true";
                            // } else {
                            //     newWindow.location = "Xitong_jihua_zhenggaifankui.html?id=" + response.data.id + "&isTransmitted=" + (show ? "true" : "false") + "&isDividedByProfession=false", "_blank";
                            // }
                        } else {
                            $.u.alert.error(response.reason);
                        }
                    }))
                }
            }));
        }
    },

    genzongbiao: function(e) {
        e.stopPropagation();
        $_current = $(e.currentTarget);
        var td_id = parseInt($_current.attr("name").split(",")[4]);
        var newWindow = window.open();
        if (td_id) {
            $.u.ajax({ //有工作单id查询跟踪表id
                url: $.u.config.constant.smsqueryserver,
                type: "post",
                dataType: "json",
                cache: false,
                data: {
                    "method": "getImproveByTaskId",
                    "taskId": td_id, //工作单ID
                    "tokenid": $.cookie("tokenid")
                }
            }).done(this.proxy(function(response) {
                if (response.success) {
                    newWindow.location = "../tracklist/TrackList.html?id=" + response.data.id;
                } else {
                    $.u.alert.error(response.reason);
                }
            }))
        }
    },

    //删除旗子
    delete_qizi: function(event) {
        event.stopPropagation();
        $_current = $(event.currentTarget);
        var td = parseInt($_current.attr("name").split(",")[4]);
        var td_id = new Array();
        td_id[0] = td;
        var init_url = $.u.config.constant.smsmodifyserver;
        var clz = $.u.load("com.audit.comm_file.confirm");
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
                            }
                        }).done(this.proxy(function(response) {
                            if (response.success) {
                                var arr_name = $_current.attr("name").split(",");
                                var year = arr_name[0].substr(0, 4);
                                var year_arr = [parseInt(year)];
                                var name = arr_name.pop();
                                name = arr_name.join(",");
                                $_current.attr("name", name);
                                confirm.confirmDialog.dialog("close");
                                this.get_data(year_arr);
                            } else {
                                $.u.alert.error(response.reason);
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
        var time = $(e.currentTarget).attr("qid");
        var start_time = new Date().format("yyyy") + ".01";
        var end_time = new Date().format("yyyy") + ".12";
        if (time == "oneyear") {
            //设置显示一年的计划,调用函数改变显示
        } else if (time == "twoyear") {
            start_time = parseInt((new Date()).format("yyyy")) - 1 + ".01";
            end_time = new Date().format("yyyy") + ".12";
            this.qid("baopi").hide();
        } else if (time == "threeyear") {
            start_time = parseInt((new Date()).format("yyyy")) - 2 + ".01";
            end_time = new Date().format("yyyy") + ".12";
            this.qid("baopi").hide();
        } else if (time == "time_left") {
            start_time = new Date(this.qid("time_scope").text().split("---")[0]).format("yyyy");
            end_time = new Date(this.qid("time_scope").text().split("---")[1]).format("yyyy");
            var time_scope = parseInt(end_time) - parseInt(end_time);
            start_time = parseInt(start_time) - (time_scope + 1) + ".01";
            end_time = parseInt(end_time) - (time_scope + 1) + ".12";
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
        start_year = start_time;
        end_year = end_time;
        $(this.qid("time_scope")).text(start_time + "---" + end_time);

        start_ = parseInt(start_year.substr(0, 4));
        end_ = parseInt(end_year.substr(0, 4));
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
        this.get_data(year);
    },

    //点击操作按钮(报批，审核等)
    comm_button: function(type) {
        event.preventDefault();
        name = $(event.currentTarget).attr("name");
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
                    "tokenid": $.cookie("tokenid"),
                    "action": action,
                    "dataobject": "plan",
                    "id": planid
                }
            }).done(this.proxy(function(response) {
                if (response.success) {
                    var year = [];
                    var year_time = this.qid("year_plan").text();
                    year.push(parseInt(year_time));
                    this.get_data(year);
                } else {
                    $.u.alert.error(response.reason);
                }
            }))
        } else {
            var clz = $.u.load("com.audit.comm_file.confirm");
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
                                }
                            }, confirm.confirmDialog.parent()).done(this.proxy(function(response) {
                                if (response.success) {
                                    confirm.confirmDialog.dialog("close");
                                    var year = [];
                                    var year_time = this.qid("year_plan").text();
                                    year.push(parseInt(year_time));
                                    this.get_data(year);
                                } else {
                                    $.u.alert.error(response.reason);
                                }
                            }))
                        })
                    }
                }
            })
        }
    },

    //选择月份后，提交更改
    qiziok: function() {
        var name = $(".currentyear").attr("name");
        var checked_month = $(".months").find("input[type='radio']:checked").val();
        var yearmonth = $(".currentyear").text().substr(0, 4) + checked_month;
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
                    planTime: yearmonth
                }),
                "tokenid": $.cookie("tokenid"),
                "dataobject": "task"
            }
        }).done(this.proxy(function(response) {
            if (response.success) {
                $('.qiziModal').modal('hide');
                this.get_data([parseInt($(".currentyear").text().substr(0, 4))]);
            } else {
                $.u.alert.error(response.reason);
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
            }
        }).done(this.proxy(function(response) {
            if (response.success) {
                this.isremark = true;
                $('#myModal').modal('hide');
                this.comm_button();
            } else {
                $.u.alert.error(response.reason);
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


    //点击导出按钮
    daochu: function() {
        event.preventDefault();
    },

    init_memu: function(data) {
        var _that = this;
        var actionlength = 0;
        if (data.actions) {
            actionlength = data.actions.length;
        }
        var boolSeeTask = data.boolSeeTask || false;
        $('.qizi').on("contextmenu", function(event) {
            var flowStep_name = $(this).attr("name");
            _that.init_mobile_menu(event, actionlength, boolSeeTask, flowStep_name, this);
        });

        /*2016.07.07 增加ipad触屏长按弹出菜单事件 start 1*/
        $('.qizi').on("touchstart", function(event) {
            if (event.originalEvent.targetTouches.length == 1) {
                var flowStep_name = $(this).attr("name");
                var _this = this;
                //	    		_that.init_mobile_menu(event,actionlength,boolSeeTask,flowStep_name,this);
                _that._timer = setTimeout(function() {
                    _that._isDisplayedRightMenu = true;
                    _that.init_mobile_menu(event, actionlength, boolSeeTask, flowStep_name, _this);
                }, _that._timerduration);
            }
        });

        $('.qizi').on("touchend", function(event) {
            if (_that._isDisplayedRightMenu) {
                event.preventDefault();
                _that._isDisplayedRightMenu = false;
            }
            clearTimeout(_that._timer);
        });
        /*2016.07.07 增加ipad触屏长按弹出菜单事件 end 1*/

    },
    /*2016.07.07 增加ipad触屏长按弹出功能封装的pc，ipad通用的方法 用来显示菜单start 2*/
    init_mobile_menu: function(event, actionlength, boolSeeTask, flowStep_name, _that) {
        $(".gongzuodan,.jianchadan,.shenjibaogao,.zhenggaidan,.genzongbiao,.delete,.update").addClass("hidden");
        $(".shenjibaogao_time").removeClass("shengcheng");
        $(".shenjibaogao_time").removeClass("shangchuan");
        /*	if(flowStep_name == "plan"){
        		if(candelete == "not"){
        			$(".delete,.update,.gongzuodan,.jianchadan,.shenjibaogao,.zhenggaidan,.genzongbiao").addClass("hidden");
        		}else if(candelete == "ok"){
        			$(".gongzuodan,.jianchadan,.shenjibaogao,.zhenggaidan,.genzongbiao").addClass("hidden");//
        		}
        	}else if(flowStep_name == "task1"){// 指派
        		$(".jianchadan,.shenjibaogao,.zhenggaidan,.genzongbiao").addClass("hidden");
        	}else if(flowStep_name == "task2"){// 选组员
        		$(".shenjibaogao_time").addClass("shengcheng");
        		$(".delete,.update,.shenjibaogao,.zhenggaidan,.genzongbiao").addClass("hidden");
        	}else if(flowStep_name == "task3"){//审计报告
        		$(".delete,.update,.zhenggaidan,.genzongbiao").addClass("hidden");
        		$(".shenjibaogao_time").addClass("shangchuan");
        	}else if(flowStep_name == "task4"){//签批
        		$(".delete,.update,.zhenggaidan,.genzongbiao").addClass("hidden");
        		$(".shenjibaogao_time").addClass("shangchuan");
        	}else if(flowStep_name == "task5"){//完成
        		$(".shenjibaogao_time").addClass("shangchuan");
        		$(".delete,.update,.genzongbiao").addClass("hidden");
        	}else if(flowStep_name == "tasknull"){//计划审核通过之前
        		$(".gongzuodan,.jianchadan,.shenjibaogao,.zhenggaidan,.genzongbiao").addClass("hidden");//
        	}else if(flowStep_name == "improve1"){
        		$(".shenjibaogao_time").addClass("shangchuan");
        		$(".delete,.update,.genzongbiao").addClass("hidden");
        	}else if(flowStep_name == "improve2"){
        		$(".shenjibaogao_time").addClass("shangchuan");
        		$(".delete,.update,.genzongbiao").addClass("hidden");
        	}else if(flowStep_name == "improve3"){
        		$(".shenjibaogao_time").addClass("shangchuan");
        		$(".delete,.update").addClass("hidden");
        	}else if(flowStep_name == "improve4"){
        		$(".shenjibaogao_time").addClass("shangchuan");
        		$(".delete,.update").addClass("hidden");
        	}else if(flowStep_name == "improve5"){//结案
        		$(".shenjibaogao_time").addClass("shangchuan");
        		$(".delete,.update").addClass("hidden");
        	}*/
        event.preventDefault(); //阻止浏览器与事件相关的默认行为；此处就是弹出右键菜单 
        var name = $(_that).closest("td").attr("name");
        $(".gongzuodan_time").attr("name", name);
        $(".jianchadan_time").attr("name", name);
        $(".shenjibaogao_time").attr("name", name);
        $(".zhenggaidan_time").attr("name", name);
        $(".genzongbiao_time").attr("name", name);
        $(".update_time").attr("name", name);
        $(".delete_time").attr("name", name);

        var pageX = 0; //鼠标单击的x坐标
        var pageY = 0; //鼠标单击的y坐标

        if (event.originalEvent.targetTouches == undefined) {
            pageX = event.pageX;
            pageY = event.pageY;
        } else {
            var _touch = event.originalEvent.targetTouches[0];
            pageX = _touch.pageX;
            pageY = _touch.pageY;
        }
        //获取菜单并设置菜单的位置	 
        //boolSeeTask 判断是否是一级审计经理或者一级审计主管，
        //actionlength 判断是否有流程操作权限
        if (boolSeeTask || !!actionlength) {
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
                    $(".gongzuodan,.jianchadan,.shenjibaogao,.zhenggaidan,.genzongbiao").removeClass("hidden");
                    $(".shenjibaogao_time").addClass("shangchuan");
                    break;
                case "task1":
                    //工作单//指派
                    //$(".jianchadan,.shenjibaogao,.zhenggaidan,.genzongbiao").addClass("hidden");
                    $(".gongzuodan,.delete,.update").removeClass("hidden");
                    break;
                case "task2":
                    //工作单// 选组员 //  点击下一步，进入审计报告流程
                    //$(".delete,.update,.shenjibaogao,.zhenggaidan,.genzongbiao").addClass("hidden");
                    $(".gongzuodan,.jianchadan").removeClass("hidden");
                    break;
                case "task3":
                    //工作单// 审计报告   //点击生成审计报告，进入3
                    //$(".delete,.update,.zhenggaidan,.genzongbiao").addClass("hidden");
                    //$(".shenjibaogao_time").addClass("shengcheng");
                    $(".gongzuodan,.jianchadan,.shenjibaogao").removeClass("hidden");
                    $(".shenjibaogao_time").addClass("shengcheng");
                    break;
                case "task4":
                    //工作单 //签批
                    //$(".delete,.update,.zhenggaidan,.genzongbiao").addClass("hidden");
                    $(".gongzuodan,.jianchadan,.shenjibaogao").removeClass("hidden");
                    $(".shenjibaogao_time").addClass("shangchuan");
                    break;
                case "task5":
                    //工作单 //完成
                    //$(".delete,.update,.genzongbiao").addClass("hidden");
                    $(".gongzuodan,.jianchadan,.shenjibaogao,.zhenggaidan").removeClass("hidden");
                    $(".shenjibaogao_time").addClass("shangchuan");
                    break;
                case "task6":
                    //工作单 //完成
                    //$(".delete,.update,.genzongbiao").addClass("hidden");
                    $(".gongzuodan,.jianchadan,.shenjibaogao").removeClass("hidden");
                    $(".shenjibaogao_time").addClass("shangchuan");
                    break;
                case "task7":
                    //工作单 //完成
                    //$(".delete,.update,.genzongbiao").addClass("hidden");
                    $(".gongzuodan,.jianchadan,.shenjibaogao").removeClass("hidden");
                    $(".shenjibaogao_time").addClass("shangchuan");
                    break;
                case "improve1":
                    //整改单//填写原因和措施
                    //$(".delete,.update,.genzongbiao").addClass("hidden");
                    $(".gongzuodan,.jianchadan,.shenjibaogao,.zhenggaidan").removeClass("hidden");
                    $(".shenjibaogao_time").addClass("shangchuan");
                    break;
                case "improve2":
                    //整改单//整改审核
                    //$(".delete,.update,.genzongbiao").addClass("hidden");
                    $(".gongzuodan,.jianchadan,.shenjibaogao,.zhenggaidan").removeClass("hidden");
                    $(".shenjibaogao_time").addClass("shangchuan");
                    break;
                case "improve3":
                    //整改单//整改完成情况
                    //$(".delete,.update").addClass("hidden");
                    $(".gongzuodan,.jianchadan,.shenjibaogao,.zhenggaidan,.genzongbiao").removeClass("hidden");
                    $(".shenjibaogao_time").addClass("shangchuan");
                    break;
                case "improve4":
                    //整改单//整改完成情况
                    //$(".delete,.update").addClass("hidden");
                    $(".gongzuodan,.jianchadan,.shenjibaogao,.zhenggaidan,.genzongbiao").removeClass("hidden");
                    $(".shenjibaogao_time").addClass("shangchuan");
                    break;
                case "improve5":
                    //整改单//结案
                    //$(".delete,.update").addClass("hidden");
                    $(".gongzuodan,.jianchadan,.shenjibaogao,.zhenggaidan,.genzongbiao").removeClass("hidden");
                    $(".shenjibaogao_time").addClass("shangchuan");
                    break;
            }

        } else { //判断是否是流程处理人，是否参与过流程的处理，参与过哪些流程
            var taksid = null;
            taksid = name.split(",")[4];
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
                                    $(".shenjibaogao_time").addClass("shangchuan");
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
        $("div.coveraudit").show();
        $(".youjian_Menu").css({
            left: pageX + "px", //设置菜单离页面左边距离，left等效于x坐标 
            top: pageY + "px" //设置菜单离页面上边距离，top等效于y坐标
        }).stop().show(); //显示使用淡入效果,比如不需要动画可以使用show()替换;
        if ($(".youjian_Menu").find("li:visible").length == 0) {
            $(".youjian_Menu").hide();
        }
    },
    /*2016.07.07 增加ipad触屏长按弹出功能封装的pc，ipad通用的方法 用来显示菜单end 2*/
    destroy: function() {
        this._super();
    }
}, {
    usehtm: true,
    usei18n: false
});