//@ sourceURL=com.sms.dash.insecurityLine
$.u.define('com.sms.dash.insecurityLine', null, {
  init: function(mode, gadgetsinstanceid) {
    this._initmode = mode;
    this._gadgetsinstanceid = gadgetsinstanceid;
    this._gadgetsinstance = null;
    this._select2PageLength = 10;
    this._select2Options = {
      width: 280,
      ajax: {
        url: $.u.config.constant.smsqueryserver,
        dataType: "json",
        type: "post",
        results: this.proxy(function(response, page, query) {
          if (response.success) {
            var all = {
              id: 0,
              name: "全部"
            };
            response.data.push(all);
            response.data.reverse();
            return {
              "results": response.data
            };
          }
        })
      },
      formatResult: function(item) {
        return item.name;
      },
      formatSelection: function(item) {
        return item.name;
      }
    };
  },
  afterrender: function() {
    this.display = this.qid("display"); // 显示界面
    this.config = this.qid("config"); // 编辑界面

    this.qid("activity").select2($.extend(true, {}, this._select2Options, {
      ajax: {
        data: function(term, page) {
          return {
            "tokenid": $.cookie("tokenid"),
            "method": "getunits",
            "dataobject": "unit",
            "unitName": term == "" ? null : term
          };
        }
      }
    })); // 安监机构

    this.qid("sysType").select2($.extend(true, {}, this._select2Options, {
      ajax: {
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
            "start": (page - 1) * this._select2PageLength,
            "length": this._select2PageLength
          };
        }),
        results: this.proxy(function(response, page, query) {
          if (response.success) {
            var all = {
                id: 0,
                name: "全部"
              },
              more = false;
            response.data.aaData.push(all);
            response.data.aaData.reverse();
            more = response.data && response.data.iTotalRecords > (page * this._select2PageLength);
            return {
              "results": response.data.aaData,
              "more": more
            };
          }
        })
      }
    }));

    this.on_search_click();

    require.config({
      paths: {
        echarts: 'echarts/js'
      }
    });


    this.qid("cancel").click(this.proxy(function() {
      if (this.paramlenght < 2) {
        alert("面板初始化，请点击保存或选择一个安监机构保存！");
        return false;
      }
      this.display.removeClass("hidden"); // 显示界面
      window.location.href = window.location.href.replace("config", "display");
      if (this.paramlenght > 2) {
        this.display.show();
        this.config.hide();
        /*this.qid("consequence").select2("data", {
          "name": this.line_options.consequenceName,
          "id": this.line_options.consequenceId
        });*/
        this._reloadData({
          "method": "drawLine",
          "unit": this.line_options.unitId,
          "consequence": this.qid("consequence").val() || 100000,
          "sysType": this.line_options.sysTypeId
        });
      }
    }));
    this.qid("update").click(this.proxy(this.on_update_click));
    if(this._initmode=="display"){
    	this.qid("search").click(this.proxy(function(){
    		console.log(this.qid("consequence").val());
    		this._reloadData({
                "method": "drawLine",
                "unit": this.line_options.unitId,
                "consequence": this.qid("consequence").val(),
                "sysType": this.line_options.sysTypeId
              });
    	}));
    }
   // this.qid("search").click(this.proxy(this.on_search_click));
  },
  on_search_click: function(){
    $.u.ajax({
      url: $.u.config.constant.smsqueryserver,
      type: "post",
      dataType: "json",
      cache: false,
      data: {
        "tokenid": $.cookie("tokenid"),
        "method": "stdcomponent.getbyid",
        "dataobject": "gadgetsinstance",
        "dataobjectid": this._gadgetsinstanceid
      }
    }, this.$).done(this.proxy(function(response) {
      if (response.success) {
        var sysType = "0";
        this._gadgetsinstance = response.data;
        if (this._gadgetsinstance.urlparam != null) {
          this.line_options = JSON.parse(this._gadgetsinstance.urlparam);
          this.paramlenght = this._gadgetsinstance.urlparam.split(",").length;
          sysType = this.line_options.sysTypeId;
        } else {
          this.line_options = null;
          this.paramlenght = 0;
        }
        if (this._initmode == "config") {
          this.config.removeClass("hidden");
          if (this.line_options == null || this.line_options.unitId == "0") {
            this.qid("activity").select2("data", {
              "name": "全部",
              "id": "0"
            });
          } else {
            this.qid("activity").select2("data", {
              "name": this.line_options.unitName,
              "id": this.line_options.unitId
            });
          }
          if (this.line_options == null || this.line_options.sysTypeId == "0") {
            this.qid("sysType").select2("data", {
              "name": "全部",
              "id": "0"
            });
          } else {
            this.qid("sysType").select2("data", {
              "name": this.line_options.sysTypeName,
              "id": this.line_options.sysTypeId
            });
          }

        } else if (this._initmode == "display") {
          this.qid("consequence").select2($.extend(true, {}, this._select2Options, {
            ajax: {
              data: this.proxy(function(term, page) {
                return {
                  "tokenid": $.cookie("tokenid"),
                  "method": "stdcomponent.getbysearch",
                  "dataobject": "consequence",
                  "rule": JSON.stringify([
                    [{
                      "key": "name",
                      "op": "like",
                      "value": term
                    }],
                    [{
                      "key": "system",
                      "value": sysType && sysType !== "0" ? parseInt(sysType) : null
                    }]
                  ]),
                  "start": (page - 1) * this._select2PageLength,
                  "length": this._select2PageLength
                };
              }),
              results: this.proxy(function(response, page, query) {
                if (response.success) {
                  return {
                    "results": response.data.aaData,
                    "more": response.data.iTotalRecords > (page * this._select2PageLength)
                  };
                }
              })
            }
          })); // 重大风险
          this.display.removeClass("hidden");
          /*this.qid("consequence").select2("data", {
            "name": this.line_options.consequenceName,
            "id": this.line_options.consequenceId
          });*/
          this._reloadData({
            "method": "drawLine",
            "unit": this.line_options.unitId,
            "consequence": this.qid("consequence").val() || 100000,
            "sysType": this.line_options.sysTypeId
          });
        }
      }
    })).fail(this.proxy(function(jqXHR, errorText, errorThrown) {

    }));
  },
  /**
   * @title 保存
   * @param e
   */
  on_update_click: function() {
    if (this.qid("consequence").val() == "") {
      pms = {
        unitId: this.qid("activity").select2("data").id,
        unitName: this.qid("activity").select2("data").name,
        sysTypeId: this.qid("sysType").select2("data").id,
        sysTypeName: this.qid("sysType").select2("data").name,
        consequenceId: "",
        consequenceName: ""
      };
    } else {
      pms = {
        unitId: this.line_options.unitId,
        unitName: this.line_options.unitName,
        sysTypeId: this.line_options.sysTypeId,
        sysTypeName: this.line_options.sysTypeName,
        consequenceId: this.qid("consequence").select2("data").id,
        consequenceName: this.qid("consequence").select2("data").name
      };
    }
    this._ajax(
      $.u.config.constant.smsmodifyserver,
      false, {
        "method": "stdcomponent.update",
        "dataobject": "gadgetsinstance",
        "dataobjectid": this._gadgetsinstanceid,
        "obj": JSON.stringify({
          "urlparam": JSON.stringify(pms)
        })
      },
      this.$, {},
      this.proxy(function(response) {
        window.location.href = window.location.href.replace("config", "display");
      })
    );
  },

  /**
   * @title 获取用于echart显示的数据
   * @param param {object} ajax param
   */
  _reloadData: function(param) {
    var timeaxis = [],
      insecurityname = [],
      seriesdata = [];
    $.u.ajax({
      url: $.u.config.constant.smsqueryserver,
      dataType: 'json',
      type: 'post',
      cache: false,
      data: $.extend({
        'tokenid': $.cookie("tokenid"),
      }, param)
    }).done(this.proxy(function(response) {
      if (response.success) {
        $.each(response.data, this.proxy(function(idx, item) {
          insecurityname.push(item.name);
          seriesdata.push({
            name: item.name,
            type: 'line',
            stack: null,
            data: item.value,
            smooth: true,
            markPoint: {
              data: [{
                type: 'max',
                name: '最大值'
              }, {
                type: 'min',
                name: '最小值'
              }]
            },
            markLine: {
              data: [{
                type: 'average',
                name: '平均值'
              }]
            }
          });
        }));
        timeaxis = response.timeline;
        this._reloadSource(timeaxis, insecurityname, seriesdata); //加载组件
        if (window.parent) {
          window.parent.resizeGadget(this._gadgetsinstanceid, ($("body").outerHeight(true)) + "px");
          window.parent.setGadgetTitle(this._gadgetsinstanceid, this._gadgetsinstance.gadgetsDisplayName + "　　安监机构：" + this.line_options.unitName + "　　系统分类：" + this.line_options.sysTypeName);
        }
      }
    }));
  },
  /**
   * @title init echart
   * @param timeaxis
   * @param consequencename
   * @param seriesdata
   */
  _reloadSource: function(timeaxis, insecurityname, seriesdata) {
    var $mainLine = this.qid("mainLine")[0];
    require(
      [
        'echarts',
        'echarts/chart/line', 'echarts/chart/bar'
      ],
      function(ec) {
        // --- 折线 ---
        var option = {
          tooltip: {
            trigger: 'axis'
          },
          legend: {
            x: 'center',
            y: 'top',
            orient: 'horizontal',
            data: insecurityname
          },
          toolbox: {
            show: true,
            x: 'right',
            y: 'center',
            orient: 'vertical',
            feature: {
              mark: {
                show: true
              },
              dataView: {
                show: true,
                readOnly: false
              },
              magicType: {
                show: true,
                type: ['line', 'bar']
              },
              restore: {
                show: true
              },
              saveAsImage: {
                show: true
              }
            }
          },
          calculable: true,
          xAxis: [{
            type: 'category',
            boundaryGap: false,
            data: timeaxis,
            name: '日期'
          }],
          yAxis: [{
            type: 'value',
            splitNumber: '8',
            name: '分数'
          }],
          series: seriesdata
        };
        var myChart2 = ec.init($mainLine);
        myChart2.setOption(option);
      });
  },
  /**
   * @title ajax
   * @param url {string} ajax url
   * @param async {bool} async
   * @param param {object} ajax param
   * @param $container {jQuery object} block
   * @param blockParam {object} block param
   * @param callback {function} callback
   */
  _ajax: function(url, async, param, $container, blockParam, callback) {
    $.u.ajax({
      url: url,
      type: "post",
      datatype: "json",
      "async": async,
      data: $.extend({
        tokenid: $.cookie("tokenid")
      }, param)
    }, $container || this.$, $.extend({}, blockParam || {})).done(this.proxy(function(response) {
      if (response.success) {
        callback(response);
      }
    })).fail(this.proxy(function(jqXHR, errorText, errorThrown) {

    }));
  },
  destroy: function() {
    this._super();
  }
}, {
  usehtm: true,
  usei18n: false
});

com.sms.dash.insecurityLine.widgetjs = ['../../../uui/widget/select2/js/select2.min.js',
  "../../../uui/widget/spin/spin.js",
  "../../../uui/widget/jqblockui/jquery.blockUI.js",
  "../../../uui/widget/ajax/layoutajax.js",
  'echarts/js/echarts.js',
  '../../../uui/widget/jqurl/jqurl.js'
];
com.sms.dash.insecurityLine.widgetcss = [{
  id: "",
  path: "../../../uui/widget/select2/css/select2.css"
}, {
  id: "",
  path: "../../../uui/widget/select2/css/select2-bootstrap.css"
}, {
  path: '../../../uui/widget/jqdatatable/css/jquery.dataTables.css'
}, {
  path: '../../../uui/widget/jqdatatable/css/dataTables.bootstrap.css'
}];