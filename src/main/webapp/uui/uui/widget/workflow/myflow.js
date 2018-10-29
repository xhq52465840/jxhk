var _methods = {};
(function ($) {
	var myflow = {};
	// 流程配置属性
	myflow.config = {
		editable:true, // SMS: 启用编辑
		currentNodeId:null, // SMS: 当前节点编号
		lineHeight:15,
		basePath:"",
		rect:{ // SMS: 节点对象
			attr:{
				x:10,
				y:10,
				width:100,
				height:50,
				r:5,
				fill: "90-#fff-#C0C0C0", 
				stroke:"#000",
				"stroke-width":1
			},
			//showType:"image&text",
			showType:"text",
			type:"state",
			name:{
				text:"state",
				"font-style":"italic"
			},
			text:{
				text:"活动",
				"font-size":13
			},
			margin:5,
			props:{},
			img:{}
		},
		path:{  // SMS: 连接线对象
			attr:{
				path:{
					path:"M10 10L100 100",
					stroke:"#808080",
					fill:"none",
					"stroke-width":2
				},
				arrow:{
					path:"M10 10L10 10",
					stroke:"#808080",
					fill:"#808080",
					"stroke-width":2,
					radius:4
				},
				fromDot:{
					width:5,
					height:5,
					stroke:"#fff",
					fill:"#000",
					cursor:"move",
					"stroke-width":2
				},
				toDot:{
					width:5,
					height:5,
					stroke:"#fff",
					fill:"#000",
					cursor:"move",
					"stroke-width":2
				},
				bigDot:{
					width:5,
					height:5,
					stroke:"#fff",
					fill:"#000",
					cursor:"move",
					"stroke-width":2
				},
				smallDot:{
					width:5,
					height:5,
					stroke:"#fff",
					fill:"#000",
					cursor:"move",
					"stroke-width":3
				}
			},
			text:{
				text:"TO {to}",
				cursor:"move",
				background:"#000"
			},
			textPos:{
				x:0,
				y:-10
			},
			props:{
				
			}
		},
		tools:{
			attr:{left:10, top:10},
			pointer:{},
			path:{},
			states:{},
			save:{
				onclick:function (c) {
					alert(c);
				}
			}
		},
		props:{
			attr:{top:10, right:30},
			props:{attributes:{}}
		}, 
		restore:""
	};

    /*
     * SMS： 工具类
     */
	myflow.util = {isLine:function (g, f, e) {	// SMS: 判断是否为路径对象
		var d, c;
		if ((g.x - e.x) == 0) {
			d = 1;
		} else {
			d = (g.y - e.y) / (g.x - e.x);
		}
		c = (f.x - e.x) * d + e.y;
		if ((f.y - c) < 10 && (f.y - c) > -10) {
			f.y = c;
			return true;
		}
		return false;
	}, center:function (d, c) {	// SMS: 返回两个元素的中间坐标
		return {x:(d.x - c.x) / 2 + c.x, y:(d.y - c.y) / 2 + c.y};
	}, nextId:(function () {	// SMS: 返回全局唯一ID
		var c = 0;
		return function () {
			return ++c;
		};
	})(), connPoint:function (j, d) {
		var c = d, e = {x:j.x + j.width / 2, y:j.y + j.height / 2};
		var l = (e.y - c.y) / (e.x - c.x);
		l = isNaN(l) ? 0 : l;
		var k = j.height / j.width;
		var h = c.y < e.y ? -1 : 1, f = c.x < e.x ? -1 : 1, g, i;
		if (Math.abs(l) > k && h == -1) {
			g = e.y - j.height / 2;
			i = e.x + h * j.height / 2 / l;
		} else {
			if (Math.abs(l) > k && h == 1) {
				g = e.y + j.height / 2;
				i = e.x + h * j.height / 2 / l;
			} else {
				if (Math.abs(l) < k && f == -1) {
					g = e.y + f * j.width / 2 * l;
					i = e.x - j.width / 2;
				} else {
					if (Math.abs(l) < k && f == 1) {
						g = e.y + j.width / 2 * l;
						i = e.x + j.width / 2;
					}
				}
			}
		}
		return {x:i, y:g};
	}, arrow:function (l, k, d) { // SMS: 返回箭头
		var g = Math.atan2(l.y - k.y, k.x - l.x) * (180 / Math.PI);
		var h = k.x - d * Math.cos(g * (Math.PI / 180));
		var f = k.y + d * Math.sin(g * (Math.PI / 180));
		var e = h + d * Math.cos((g + 120) * (Math.PI / 180));
		var j = f - d * Math.sin((g + 120) * (Math.PI / 180));
		var c = h + d * Math.cos((g + 240) * (Math.PI / 180));
		var i = f - d * Math.sin((g + 240) * (Math.PI / 180));
		return [k, {x:e, y:j}, {x:c, y:i}];
	}
	};
	
	
	/*
	 * SMS:矩形对象
	 * @params rectOption  矩形配置信息(json)
	 * @params paper 绘画背景对象 (Raphael)
	 */
	myflow.rect = function (rectConfig, paper,currRects) {	
		this.type = 'rect';
		var self = this, 												  // SMS: 矩形对象本身
		selfId = "rect" + myflow.util.nextId(),							  // SMS: 矩形ID
		selfConfig = $.extend(true, {}, myflow.config.rect, rectConfig),  // SMS: 矩形配置
		currPaper = paper, 												  // SMS: Raphael对象
		selfRect, 														  // SMS: 新建矩形对象
		selfImg, 														  // SMS: 新建图片对象
		selfNameText, 													  // SMS: name文本对象
		selfTextText, 													  // SMS: text文本对象
		selfRectX, 														  // SMS: 记录移动前矩形的x坐标
		selfRectY; 														  // SMS: 记录移动前矩形的y坐标

		var tempPaths = [];
		
		var getRectStyle = function(cate){
			var style = {font:"white"};
			switch(cate){
				case "IN_PROGRESS":
					style.stroke = ""; 
					style.fill = "#f0ad4e";
					break;
				case "COMPLETE":
					style.stroke = "";
					style.fill="#5cb85c";
					break;
				case "NEW":
					style.stroke = "";
					style.fill="#428bca";
					break;
				default:
					break;
			}
			return style;
		}
		
		var getCurrentRectStyle = function(stateid){
			var style = {};
			try{
				if(parseInt(myflow.config.currentNodeId) == parseInt(stateid)){
					style["stroke"] = "red";
					style["stroke-width"] = 3;
					style["stroke-dasharray"]="-";
				}
			}catch(e){
				
			}
			return style;
		}
		$.extend(selfConfig.attr,getRectStyle(rectConfig.props.category));
		$.extend(selfConfig.attr,getCurrentRectStyle(rectConfig.props.id)); 
		
		selfRect = currPaper.rect(selfConfig.attr.x, selfConfig.attr.y, selfConfig.attr.width, selfConfig.attr.height, selfConfig.attr.r).hide().attr(selfConfig.attr);
		selfImg = currPaper.image(myflow.config.basePath + selfConfig.img.src, selfConfig.attr.x + selfConfig.img.width / 2, selfConfig.attr.y + (selfConfig.attr.height - selfConfig.img.height) / 2, selfConfig.img.width, selfConfig.img.height).hide();
		selfNameText = currPaper.text(selfConfig.attr.x + selfConfig.img.width + (selfConfig.attr.width - selfConfig.img.width) / 2, selfConfig.attr.y + myflow.config.lineHeight / 2, selfConfig.name.text).hide().attr(selfConfig.name);
		selfTextText = currPaper.text(selfConfig.attr.x + selfConfig.img.width + (selfConfig.attr.width - selfConfig.img.width) / 2, selfConfig.attr.y + (selfConfig.attr.height - myflow.config.lineHeight) / 2 + myflow.config.lineHeight, selfConfig.text.text).hide().attr(selfConfig.text);

        
		$.each(currRects, function (key, rect) {
		    var pos = rect.getBBox();
		    $.extend(currRects[key], { x: pos.x, y: pos.y });
		});
		

		selfRect.drag(function (newX, newY) {				// SMS: onmove事件 
		    createBaseLine() ? null : (function(){return false;})();
		    movePaperChildObj(newX, newY);
		}, function () {									// SMS: onstart事件
		    moveStartPaperChildObj();
		}, function () {									// SMS: onend事件
		    moveEndPaperChildObj();
		    removeTempPaths();
		});
		selfImg.drag(function (newX, newY) {			    // SMS: onmove事件
			createBaseLine() ? null : (function(){return false;})();
		    movePaperChildObj(newX, newY);
		}, function () {									// SMS: onstart事件
			moveStartPaperChildObj();
		}, function () {									// SMS: onend事件
			moveEndPaperChildObj();
		    removeTempPaths();
		});
		selfNameText.drag(function (newX, newY) {		    // SMS: onmove事件
			createBaseLine() ? null : (function(){return false;})();
		    movePaperChildObj(newX, newY);
		}, function () {									// SMS: onstart事件
			moveStartPaperChildObj();
		}, function () {									// SMS: onend事件
			moveEndPaperChildObj();
		    removeTempPaths();
		});
		selfTextText.drag(function (newX, newY) {		    // SMS: onmove事件
			createBaseLine() ? null : (function(){return false;})();
		    movePaperChildObj(newX, newY);
		}, function () {									// SMS: onstart事件
			moveStartPaperChildObj();
		}, function () {									// SMS: onend事件
			moveEndPaperChildObj();
		    removeTempPaths();
		});
		
		/*
		 * SMS: 删除所有基准线（新增）
		 */
		var removeTempPaths = function () {
		    $.each(tempPaths, function (idx, path) {
		        path.remove();
		        tempPaths[idx] = null;
		    });
		    temp = {};
		    tempPaths = $.grep(tempPaths, function (path, idx) {
		        return path;
		    });
		};
		
		/*
		 * SMS: 构建基准线（新增）
		 */
		var createBaseLine=function(){
			var result = true;
		    removeTempPaths();
			var pos = selfRect.getBBox(); 
			var tempRects={};
			$.each(currRects,function(idx,rect){
				rect ? tempRects[idx]=rect : null;
			});
			currRects = $.extend({},tempRects);
		    $.each(currRects, function (idx, rect) {
		        var tempPos = rect.getBBox(); 
		        if ((tempPos.x+4) - pos.x < 6 && (tempPos.x+4) - pos.x > -6 ) {
		        	selfRect.attr({x:(tempPos.x+4)});
		        	pos=selfRect.getBBox();
		            if (tempPos.y > pos.y) {
		                pathParams = "M" + (tempPos.x+4) + " " + (tempPos.y + tempPos.height) + "L" + pos.x + " " + pos.y;
		                tempPaths.push(currPaper.path(pathParams).attr({ stroke: "red" }));
		            } else {
		                pathParams = "M" + (pos.x) + " " + (pos.y + tempPos.height) + "L" + (tempPos.x+4) + " " + tempPos.y;
		                tempPaths.push(currPaper.path(pathParams).attr({ stroke: "red" }));
		            }result= false;
		        } else if ((tempPos.x + tempPos.width -4 ) - pos.x < 6 && (tempPos.x + tempPos.width -4 ) - pos.x > -6) {
		        	selfRect.attr({x:(tempPos.x+ tempPos.width-4)});
		        	pos=selfRect.getBBox();
		        	if (tempPos.y > pos.y) {
		                pathParams = "M" + (tempPos.x + tempPos.width -4 ) + " " + (tempPos.y + tempPos.height) + "L" + pos.x + " " + pos.y;
		                tempPaths.push(currPaper.path(pathParams).attr({ stroke: "red" }));
		            } else {
		                pathParams = "M" + (pos.x) + " " + (pos.y + tempPos.height) + "L" + (tempPos.x + tempPos.width -4 ) + " " + tempPos.y;
		                tempPaths.push(currPaper.path(pathParams).attr({ stroke: "red" }));
		            }
		        	result= false;
		        } else if ((tempPos.y + 4) - pos.y < 6 && (tempPos.y + 4) - pos.y > -6) {
		        	selfRect.attr({y:(tempPos.y + 4)});
		        	pos=selfRect.getBBox();
		            if (tempPos.x > pos.x) {
		                pathParams = "M" + pos.x + " " + pos.y + "L" + (tempPos.x + tempPos.width - 4) + " " + (tempPos.y + 4);
		                tempPaths.push(currPaper.path(pathParams).attr({ stroke: "red" }));
		            } else {
		                pathParams = "M" + tempPos.x +" " + (tempPos.y + 4) + "L" + (pos.x + pos.width) + " " + pos.y; 
		                tempPaths.push(currPaper.path(pathParams).attr({ stroke: "red" }));
		            }
		            result= false;
		        } else if ((tempPos.y + tempPos.height - 4) - pos.y < 6 && (tempPos.y + tempPos.height - 4) - pos.y > -6) {
		        	selfRect.attr({y:(tempPos.y + tempPos.height - 4)});
		        	pos=selfRect.getBBox();
		        	if (tempPos.x > pos.x) {
		                pathParams = "M" + pos.x + " " + pos.y + "L" + (tempPos.x + tempPos.width - 4) + " " + (tempPos.y + tempPos.height - 4);
		                tempPaths.push(currPaper.path(pathParams).attr({ stroke: "red" }));
		            } else {
		                pathParams = "M" + tempPos.x + " " + (tempPos.y + tempPos.height - 4) + "L" + (pos.x + pos.width) + " " + pos.y;
		                tempPaths.push(currPaper.path(pathParams).attr({ stroke: "red" }));
		            }
		        	result= false;
		        } else if ((tempPos.x + 4) - (pos.x+pos.width) < 6 && (tempPos.x + 4) - (pos.x+pos.width) > -6) {
		        	selfRect.attr({x:(tempPos.x + 4 - pos.width)});
		        	pos=selfRect.getBBox();
		        	if (tempPos.y > pos.y) {
		                pathParams = "M" + (pos.x+pos.width) + " " + pos.y + "L" + (tempPos.x+4) + " " + (tempPos.y + tempPos.height - 4);
		                tempPaths.push(currPaper.path(pathParams).attr({ stroke: "red" }));
		            } else {
		                pathParams = "M" + (tempPos.x+4) + " " + (tempPos.y+4) + "L" + (pos.x+pos.width) + " " + (pos.y + pos.height);
		                tempPaths.push(currPaper.path(pathParams).attr({ stroke: "red" }));
		            }
		        	result= false;
		        }
		    });
		    return result;
		}
		
		/*
		 * SMS: 移动对象
		 */
		var movePaperChildObj = function (x1, y1) {
			if (!myflow.config.editable) {
				return;
			}
			var tempX = (selfRectX + x1);
			var tempY = (selfRectY + y1);
			newRectPosInfo.x = tempX - selfConfig.margin;
			newRectPosInfo.y = tempY - selfConfig.margin;
			refreshRect();
		};
		/*
		 * SMS: 移动开始时记录x,y 并且将矩形系列对象设为半透明
		 */
		var moveStartPaperChildObj = function () {
			selfRectX = selfRect.attr("x");
			selfRectY = selfRect.attr("y");
			selfRect.attr({opacity:0.5});
			selfImg.attr({opacity:0.5});
			selfTextText.attr({opacity:0.5});
		};
		/*
		 * SMS: 去除矩形系列对象半透明状态
		 */
		var moveEndPaperChildObj = function () {
			selfRect.attr({opacity:1});
			selfImg.attr({opacity:1});
			selfTextText.attr({opacity:1});
		};
		var aroundRectPath,                 // SMS: 矩形周围的线条对象 
			rectAroundPoints = {}, 			// SMS: 矩形周围8个描点
			pointSize = 5,                  // SMS: 矩形周围描点的大小
			newRectPosInfo = {x:selfConfig.attr.x - selfConfig.margin, y:selfConfig.attr.y - selfConfig.margin, width:selfConfig.attr.width + selfConfig.margin * 2, height:selfConfig.attr.height + selfConfig.margin * 2};
		aroundRectPath = currPaper.path("M0 0L1 1").hide(); // SMS: 绘制线条move to 0,0 连接至1,1
        // 下面是节点的8个描点样式
		rectAroundPoints.t = currPaper.rect(0, 0, pointSize, pointSize).attr({fill:"#000", stroke:"#fff", cursor:"s-resize"}).hide().drag(function (newX, newY) {
		    moveRectAroundPoints(newX, newY, "t");
		}, function () {
		    saveStartXY(this.attr("x") + pointSize / 2, this.attr("y") + pointSize / 2, "t");
		}, function () {
		});
		rectAroundPoints.lt = currPaper.rect(0, 0, pointSize, pointSize).attr({ fill: "#000", stroke: "#fff", cursor: "nw-resize" }).hide().drag(function (newX, newY) {
		    moveRectAroundPoints(newX, newY, "lt");
		}, function () {
		    saveStartXY(this.attr("x") + pointSize / 2, this.attr("y") + pointSize / 2, "lt");
		}, function () {
		});
		rectAroundPoints.l = currPaper.rect(0, 0, pointSize, pointSize).attr({ fill: "#000", stroke: "#fff", cursor: "w-resize" }).hide().drag(function (newX, newY) {
		    moveRectAroundPoints(newX, newY, "l");
		}, function () {
		    saveStartXY(this.attr("x") + pointSize / 2, this.attr("y") + pointSize / 2, "l");
		}, function () {
		});
		rectAroundPoints.lb = currPaper.rect(0, 0, pointSize, pointSize).attr({ fill: "#000", stroke: "#fff", cursor: "sw-resize" }).hide().drag(function (newX, newY) {
		    moveRectAroundPoints(newX, newY, "lb");
		}, function () {
		    saveStartXY(this.attr("x") + pointSize / 2, this.attr("y") + pointSize / 2, "lb");
		}, function () {
		});
		rectAroundPoints.b = currPaper.rect(0, 0, pointSize, pointSize).attr({ fill: "#000", stroke: "#fff", cursor: "s-resize" }).hide().drag(function (newX, newY) {
		    moveRectAroundPoints(newX, newY, "b");
		}, function () {
		    saveStartXY(this.attr("x") + pointSize / 2, this.attr("y") + pointSize / 2, "b");
		}, function () {
		});
		rectAroundPoints.rb = currPaper.rect(0, 0, pointSize, pointSize).attr({ fill: "#000", stroke: "#fff", cursor: "se-resize" }).hide().drag(function (newX, newY) {
		    moveRectAroundPoints(newX, newY, "rb");
		}, function () {
		    saveStartXY(this.attr("x") + pointSize / 2, this.attr("y") + pointSize / 2, "rb");
		}, function () {
		});
		rectAroundPoints.r = currPaper.rect(0, 0, pointSize, pointSize).attr({ fill: "#000", stroke: "#fff", cursor: "w-resize" }).hide().drag(function (newX, newY) {
		    moveRectAroundPoints(newX, newY, "r");
		}, function () {
		    saveStartXY(this.attr("x") + pointSize / 2, this.attr("y") + pointSize / 2, "r");
		}, function () {
		});
		rectAroundPoints.rt = currPaper.rect(0, 0, pointSize, pointSize).attr({ fill: "#000", stroke: "#fff", cursor: "ne-resize" }).hide().drag(function (newX, newY) {
		    moveRectAroundPoints(newX, newY, "rt");
		}, function () {
		    saveStartXY(this.attr("x") + pointSize / 2, this.attr("y") + pointSize / 2, "rt");
		}, function () {
		});
	    /*
        *   SMS: 移动单个点则移动矩形系列对象
        *   @params newX 移动后的x坐标
        *   @params newY 移动后的y坐标
        *   @params pointType 定位矩形周围的8个点对象中的一个
        */
		var moveRectAroundPoints = function (newX, newY, pointType) {
			if (!myflow.config.editable) {
				return;
			}
			var tempX = _bx + newX, tempY = _by + newY; // SMS: 拖动开始前的坐标加上拖动后的坐标
			switch (pointType) {
			  case "t": // SMS: 顶部中间
			    newRectPosInfo.height += newRectPosInfo.y - tempY;
			    newRectPosInfo.y = tempY;
				break;
			  case "lt": // SMS: 左侧顶部
				newRectPosInfo.width += newRectPosInfo.x - tempX;
				newRectPosInfo.height += newRectPosInfo.y - tempY;
				newRectPosInfo.x = tempX;
				newRectPosInfo.y = tempY;
				break;
			  case "l": // SMS: 左侧中间
			    newRectPosInfo.width += newRectPosInfo.x - tempX;
			    newRectPosInfo.x = tempX;
				break;
			  case "lb": // SMS: 左侧底部
			    newRectPosInfo.height = tempY - newRectPosInfo.y;
				newRectPosInfo.width += newRectPosInfo.x - tempX;
				newRectPosInfo.x = tempX;
				break;
			  case "b": // SMS: 底部中间
			    newRectPosInfo.height = tempY - newRectPosInfo.y;
				break;
			  case "rb": // SMS: 右侧底部
			    newRectPosInfo.height = tempY - newRectPosInfo.y;
				newRectPosInfo.width = tempX - newRectPosInfo.x;
				break;
			  case "r": // SMS: 右侧中间
			    newRectPosInfo.width = tempX - newRectPosInfo.x;
				break;
			  case "rt": // SMS: 右侧顶部
			    newRectPosInfo.width = tempX - newRectPosInfo.x;
			    newRectPosInfo.height += newRectPosInfo.y - tempY;
			    newRectPosInfo.y = tempY;
				break;
			}
			refreshRect(); // SMS: 刷新矩形系列对象
		};
	    /*
         * SMS: 记录拖动前的坐标
         * @params oldX  拖动前的x坐标
         * @params oldY  拖动前的y坐标
         * @params pointType 具体到哪个点对象的类型
         */
		var saveStartXY = function (oldX, oldY, pointType) {
			_bx = oldX;
			_by = oldY;
		};

        // SMS: 绑定矩形系列对象的点击事件
		$([selfRect.node, selfTextText.node, selfNameText.node, selfImg.node]).bind("click", function () {
			if (!myflow.config.editable) {
				return;
			}
			showAroundRectObj(); // SMS: 显示矩形周围的8个描点和线条
			var mod = $(currPaper).data("mod");
			switch (mod) {
			  case "pointer":
				break;
			  case "path":
				var r = $(currPaper).data("currNode");
				if (r &&  r.getId().substring(0, 4) == "rect" && r.getId() != selfId) { // && r.getId() != selfId
					$(currPaper).trigger("addpath", [r, self]);
				}
				break;
			}
			$(currPaper).trigger("click", self);
			$(currPaper).data("currNode", self);
			return false;
		});

	    /*
         * SMS：矩形画布的点击事件（显示右侧属性面板的事件入口）
         *
         *
         */
		var rectClick = function (o, r) {
			if (!myflow.config.editable) {
				return;
			}
			if (r.getId() == selfId) {
				$(currPaper).trigger("showprops", [selfConfig.props, r]);
			} else {
			    hideAroundRectObj(); // SMS: 隐藏矩形周围的8个描点和线条
			}
		};
		$(currPaper).bind("click", rectClick); // SMS: 绑定矩形画布的点击事件
		
		/*
		 * SMS: 修改矩形显示字符
		 * @params F 显示内容
		 */
		var changeSelText = function (o, F, r) {
			if (r.getId() == selfId) {
				selfTextText.attr({text:F});
			}
		};
		$(currPaper).bind("textchange", changeSelText);
		
		/*
		 * SMS: 修改矩形背景色 （新增的方法）
		 * @params F 颜色
		 */
		var changeSelColor=function(o,F,r){
			if (r.getId() == selfId) {
				selfRect.attr(getRectStyle(F));
			}
		}
		$(currPaper).bind("colorchange", changeSelColor);

	    /*
         * SMS: 获取矩形周围环绕线条的坐标的信息
         *
         */
		function getAroundRectPosInfo() {
			return "M" + newRectPosInfo.x + " " + newRectPosInfo.y + "L" + newRectPosInfo.x + " " + (newRectPosInfo.y + newRectPosInfo.height) + "L" + (newRectPosInfo.x + newRectPosInfo.width) + " " + (newRectPosInfo.y + newRectPosInfo.height) + "L" + (newRectPosInfo.x + newRectPosInfo.width) + " " + newRectPosInfo.y + "L" + newRectPosInfo.x + " " + newRectPosInfo.y;
		}
	    /*
         * SMS: 显示矩形周围的8个描点和线条
         */
		function showAroundRectObj() {
			aroundRectPath.show();
			for (var point in rectAroundPoints) {
				rectAroundPoints[point].show();
			}
		}
	    /*
         * SMS: 隐藏矩形周围的8个描点和线条
         */
		function hideAroundRectObj() {
			aroundRectPath.hide();
			for (var point in rectAroundPoints) {
				rectAroundPoints[point].hide();
			}
		}
		
		/*
		 * SMS: 刷新矩形系列对象
		 */
		function refreshRect() {
			var newX = newRectPosInfo.x + selfConfig.margin, 				// SMS: x坐标
				newY = newRectPosInfo.y + selfConfig.margin, 				// SMS: y坐标
				newWidth = newRectPosInfo.width - selfConfig.margin * 2, 	// SMS: 宽度
				newHeight = newRectPosInfo.height - selfConfig.margin * 2;	// SMS: 高度	
			selfRect.attr({x:newX, y:newY, width:newWidth, height:newHeight});
			switch (selfConfig.showType) {
			  case "image":
				selfImg.attr({x:newX + (newWidth - selfConfig.img.width) / 2, y:newY + (newHeight - selfConfig.img.height) / 2}).show();
				break;
			  case "text":
				selfRect.show();
				selfTextText.attr({x:newX + newWidth / 2, y:newY + newHeight / 2}).show();
				break;
			  case "image&text":
				selfRect.show();
				selfNameText.attr({x:newX + selfConfig.img.width + (newWidth - selfConfig.img.width) / 2, y:newY + myflow.config.lineHeight / 2}).show();
				selfTextText.attr({x:newX + selfConfig.img.width + (newWidth - selfConfig.img.width) / 2, y:newY + (newHeight - myflow.config.lineHeight) / 2 + myflow.config.lineHeight}).show();
				selfImg.attr({x:newX + selfConfig.img.width / 2, y:newY + (newHeight - selfConfig.img.height) / 2}).show();
				break;
			}
			rectAroundPoints.t.attr({x:newRectPosInfo.x + newRectPosInfo.width / 2 - pointSize / 2, y:newRectPosInfo.y - pointSize / 2});	
			rectAroundPoints.lt.attr({x:newRectPosInfo.x - pointSize / 2, y:newRectPosInfo.y - pointSize / 2});
			rectAroundPoints.l.attr({x:newRectPosInfo.x - pointSize / 2, y:newRectPosInfo.y - pointSize / 2 + newRectPosInfo.height / 2});
			rectAroundPoints.lb.attr({x:newRectPosInfo.x - pointSize / 2, y:newRectPosInfo.y - pointSize / 2 + newRectPosInfo.height});
			rectAroundPoints.b.attr({x:newRectPosInfo.x - pointSize / 2 + newRectPosInfo.width / 2, y:newRectPosInfo.y - pointSize / 2 + newRectPosInfo.height});
			rectAroundPoints.rb.attr({x:newRectPosInfo.x - pointSize / 2 + newRectPosInfo.width, y:newRectPosInfo.y - pointSize / 2 + newRectPosInfo.height});
			rectAroundPoints.r.attr({x:newRectPosInfo.x - pointSize / 2 + newRectPosInfo.width, y:newRectPosInfo.y - pointSize / 2 + newRectPosInfo.height / 2});
			rectAroundPoints.rt.attr({x:newRectPosInfo.x - pointSize / 2 + newRectPosInfo.width, y:newRectPosInfo.y - pointSize / 2});
			aroundRectPath.attr({ path: getAroundRectPosInfo() }); // SMS: 设置矩形周围线条的坐标等信息
			$(currPaper).trigger("rectresize", self);
		}
		this.toJson = function () {
		    /*var r = "{\"type\":\"" + selfConfig.type + "\",\"text\":{\"text\":\"" + selfTextText.attr("text") + "\"}, \"attr\":{ \"x\":" + Math.round(selfRect.attr("x")) + ", \"y\":" + Math.round(selfRect.attr("y")) + ", \"width\":" + Math.round(selfRect.attr("width")) + ", \"height\":" + Math.round(selfRect.attr("height")) + "}, \"props\":{";
		    for (var o in selfConfig.props) {
		    	if(o=="options")
		    		r += "\"" + o + "\":\"" + JSON.stringify(selfConfig.props[o]) + "\",";
		    	else
		    		r += "\"" + o + "\":\"" + selfConfig.props[o] + "\",";
			}
			if (r.substring(r.length - 1, r.length) == ",") {
				r = r.substring(0, r.length - 1);
			}
			r += "}}";*/
			var r = {
				type:selfConfig.type,
				text:{text:selfTextText.attr("text")},
				attr:{
					x: Math.round(selfRect.attr("x")),
					y: Math.round(selfRect.attr("y")),
					width: Math.round(selfRect.attr("width")),
					height: Math.round(selfRect.attr("height"))
				},
				props:selfConfig.props
			};
			r.props.options && r.props.options.property && r.props.options.property.value && r.props.options.property.value[0].key == "state" ? r.props.options.property.value[0].value=selfConfig.props.id : null;
			return r;
		};
		this.restore = function (conf) { // SMS: 恢复指定状态
			var tempConf = conf;
			selfConfig = $.extend(true, selfConfig, conf);
			selfTextText.attr({text:tempConf.text.text});
			refreshRect();
		};
		this.getBBox = function () { 
			return newRectPosInfo;
		};
		this.getId = function () {	 // SMS: 获取矩形ID					
			return selfId;
		};
		this.remove = function () {	 // SMS: 删除矩形系列对象
			selfRect.remove();
			selfTextText.remove();
			selfNameText.remove();
			selfImg.remove();
			aroundRectPath.remove();
			for (var o in rectAroundPoints) {
				rectAroundPoints[o].remove();
			}
		};
		this.text = function () {	// SMS: 获取text
			return selfTextText.attr("text");
		};
		this.attr = function (conf) {	// SMS: 设置矩形配置
			if (conf) {
				selfRect.attr(conf);
			}
		};
		refreshRect(); // SMS: 刷新矩形系列对象
	};
	
	
	
	
	
	// 流程路径
	myflow.path = function (q, n, u, e) { 
		this.type = 'path';
		var v = this, z = n, B = $.extend(true, {}, myflow.config.path), i, t, f, h = B.textPos, y, w, k = u, s = e, g = "path" + myflow.util.nextId(), x;
		function p(G, H, D, L) {
			var F = this, M = G, r, o = D, O = L, K, I, N = H;
			switch (M) {
			  case "from":
				r = z.rect(H.x - B.attr.fromDot.width / 2, H.y - B.attr.fromDot.height / 2, B.attr.fromDot.width, B.attr.fromDot.height).attr(B.attr.fromDot);
				break;
			  case "big":
				r = z.rect(H.x - B.attr.bigDot.width / 2, H.y - B.attr.bigDot.height / 2, B.attr.bigDot.width, B.attr.bigDot.height).attr(B.attr.bigDot);
				break;
			  case "small":
				r = z.rect(H.x - B.attr.smallDot.width / 2, H.y - B.attr.smallDot.height / 2, B.attr.smallDot.width, B.attr.smallDot.height).attr(B.attr.smallDot);
				break;
			  case "to":
				r = z.rect(H.x - B.attr.toDot.width / 2, H.y - B.attr.toDot.height / 2, B.attr.toDot.width, B.attr.toDot.height).attr(B.attr.toDot);
				break;
			}
			if (r && (M == "big" || M == "small")) {
				r.drag(function (Q, P) {
					C(Q, P);
				}, function () {
					J();
				}, function () {
					E();
				});
				var C = function (R, Q) {
					var P = (K + R), S = (I + Q);
					F.moveTo(P, S);
				};
				var J = function () {
					if (M == "big") {
						K = r.attr("x") + B.attr.bigDot.width / 2;
						I = r.attr("y") + B.attr.bigDot.height / 2;
					}
					if (M == "small") {
						K = r.attr("x") + B.attr.smallDot.width / 2;
						I = r.attr("y") + B.attr.smallDot.height / 2;
					}
				};
				var E = function () {
				};
			}
			this.type = function (P) {
				if (P) {
					M = P;
				} else {
					return M;
				}
			};
			this.node = function (P) {
				if (P) {
					r = P;
				} else {
					return r;
				}
			};
			this.left = function (P) {
				if (P) {
					o = P;
				} else {
					return o;
				}
			};
			this.right = function (P) {
				if (P) {
					O = P;
				} else {
					return O;
				}
			};
			this.remove = function () {
				o = null;
				O = null;
				r.remove();
			};
			this.pos = function (P) {
				if (P) {
					N = P;
					r.attr({x:N.x - r.attr("width") / 2, y:N.y - r.attr("height") / 2});
					return this;
				} else {
					return N;
				}
			};
			this.moveTo = function (Q, T) {
				this.pos({x:Q, y:T});
				switch (M) {
				  case "from":
					if (O && O.right() && O.right().type() == "to") {
						O.right().pos(myflow.util.connPoint(s.getBBox(), N));
					}
					if (O && O.right()) {
						O.pos(myflow.util.center(N, O.right().pos()));
					}
					break;
				  case "big":
					if (O && O.right() && O.right().type() == "to") {
						O.right().pos(myflow.util.connPoint(s.getBBox(), N));
					}
					if (o && o.left() && o.left().type() == "from") {
						o.left().pos(myflow.util.connPoint(k.getBBox(), N));
					}
					if (O && O.right()) {
						O.pos(myflow.util.center(N, O.right().pos()));
					}
					if (o && o.left()) {
						o.pos(myflow.util.center(N, o.left().pos()));
					}
					var S = {x:N.x, y:N.y};
					if (myflow.util.isLine(o.left().pos(), S, O.right().pos())) {
						M = "small";
						r.attr(B.attr.smallDot);
						this.pos(S);
						var P = o;
						o.left().right(o.right());
						o = o.left();
						P.remove();
						var R = O;
						O.right().left(O.left());
						O = O.right();
						R.remove();
					}
					break;
				  case "small":
					if (o && O && !myflow.util.isLine(o.pos(), {x:N.x, y:N.y}, O.pos())) {
						M = "big";
						r.attr(B.attr.bigDot);
						var P = new p("small", myflow.util.center(o.pos(), N), o, o.right());
						o.right(P);
						o = P;
						var R = new p("small", myflow.util.center(O.pos(), N), O.left(), O);
						O.left(R);
						O = R;
					}
					break;
				  case "to":
					if (o && o.left() && o.left().type() == "from") {
						o.left().pos(myflow.util.connPoint(k.getBBox(), N));
					}
					if (o && o.left()) {
						o.pos(myflow.util.center(N, o.left().pos()));
					}
					break;
				}
				m();
			};
		}
		function j() {
			var D, C, E = k.getBBox(), F = s.getBBox(), r, o;
			r = myflow.util.connPoint(E, {x:F.x + F.width / 2, y:F.y + F.height / 2});
			o = myflow.util.connPoint(F, r);
			D = new p("from", r, null, new p("small", {x:(r.x + o.x) / 2, y:(r.y + o.y) / 2}));
			D.right().left(D);
			C = new p("to", o, D.right(), null);
			D.right().right(C);
			this.toPathString = function () {
				if (!D) {
					return "";
				}
				var J = D, I = "M" + J.pos().x + " " + J.pos().y, H = "";
				while (J.right()) {
					J = J.right();
					I += "L" + J.pos().x + " " + J.pos().y;
				}
				var G = myflow.util.arrow(J.left().pos(), J.pos(), B.attr.arrow.radius);
				H = "M" + G[0].x + " " + G[0].y + "L" + G[1].x + " " + G[1].y + "L" + G[2].x + " " + G[2].y + "z";
				return [I, H];
			};
			this.toJson = function () {
				/*var G = "[", H = D;
				while (H) {
					if (H.type() == "big") {
					    G += "{\"x\":" + Math.round(H.pos().x) + ",\"y\":" + Math.round(H.pos().y) + "},";
					}
					H = H.right();
				}
				if (G.substring(G.length - 1, G.length) == ",") {
					G = G.substring(0, G.length - 1);
				}
				G += "]";*/
				
				var G =[],H=D;
				while(H){
					if(H.type()=="big"){
						G.push({x: Math.round(H.pos().x),y: Math.round(H.pos().y)});
					}
					H = H.right();
				}
				
				return G;
			};
			this.restore = function (H) {
				var I = H, J = D.right();
				for (var G = 0; G < I.length; G++) {
					J.moveTo(I[G].x, I[G].y);
					J.moveTo(I[G].x, I[G].y);
					J = J.right();
				}
				this.hide();
			};
			this.fromDot = function () {
				return D;
			};
			this.toDot = function () {
				return C;
			};
			this.midDot = function () {
				var H = D.right(), G = D.right().right();
				while (G.right() && G.right().right()) {
					G = G.right().right();
					H = H.right();
				}
				return H;
			};
			this.show = function () {
				var G = D;
				while (G) {
					G.node().show();
					G = G.right();
				}
			};
			this.hide = function () {
				var G = D;
				while (G) {
					G.node().hide();
					G = G.right();
				}
			};
			this.remove = function () {
				var G = D;
				while (G) {
					if (G.right()) {
						G = G.right();
						G.left().remove();
					} else {
						G.remove();
						G = null;
					}
				}
			};
		}
		B = $.extend(true, B, q);
		i = z.path(B.attr.path.path).attr(B.attr.path);	// SMS: line
		t = z.path(B.attr.arrow.path).attr(B.attr.arrow);	// SMS: arrow
		x = new j();
		x.hide();
		f = z.text(0, 0, B.text.text).attr(B.text).attr({text:B.text.text.replace("{from}", k.text()).replace("{to}",s.text())});	// SMS: text
		B.props.name = B.text.text.replace("{from}", k.text()).replace("{to}",s.text()); // SMS: 设置prop的text
		f.drag(function (r, o) {
			if (!myflow.config.editable) {
				return;
			}
			f.attr({x:y + r, y:w + o});
		}, function () {
			y = f.attr("x");
			w = f.attr("y");
		}, function () {
			var o = x.midDot().pos();
			h = {x:f.attr("x") - o.x, y:f.attr("y") - o.y};
		});
		m();
		$([i.node, t.node]).bind("click", function () {
			if (!myflow.config.editable) {
				return;
			}
			$(z).trigger("click", v);
			$(z).data("currNode", v);
			return false;
		});
		var l = function (r, C) {
			if (!myflow.config.editable) {
				return;
			}
			if (C && C.getId() == g) {
				x.show();
				$(z).trigger("showprops", [B.props, v]);
			} else {
				x.hide();
			}
			var o = $(z).data("mod");
			switch (o) {
			  case "pointer":
				break;
			  case "path":
				break;
			}
		};
		$(z).bind("click", l);
		var A = function (o, r) {
			if (!myflow.config.editable) {
				return;
			}
			if (r && (r.getId() == k.getId() || r.getId() == s.getId())) {
				$(z).trigger("removepath", v);
			}
		};
		$(z).bind("removerect", A);
		var d = function (C, D) {
			if (!myflow.config.editable) {
				return;
			}
			if (k && k.getId() == D.getId()) {
				var o;
				if (x.fromDot().right().right().type() == "to") {
					o = {x:s.getBBox().x + s.getBBox().width / 2, y:s.getBBox().y + s.getBBox().height / 2};
				} else {
					o = x.fromDot().right().right().pos();
				}
				var r = myflow.util.connPoint(k.getBBox(), o);
				x.fromDot().moveTo(r.x, r.y);
				m();
			}
			if (s && s.getId() == D.getId()) {
				var o;
				if (x.toDot().left().left().type() == "from") {
					o = {x:k.getBBox().x + k.getBBox().width / 2, y:k.getBBox().y + k.getBBox().height / 2};
				} else {
					o = x.toDot().left().left().pos();
				}
				var r = myflow.util.connPoint(s.getBBox(), o);
				x.toDot().moveTo(r.x, r.y);
				m();
			}
		};
		$(z).bind("rectresize", d);
		var c = function (r, o, C) {
			if (C.getId() == g) {
				f.attr({text:o});
			}
		};
		$(z).bind("textchange", c);
		this.from = function () {
			return k;
		};
		this.to = function () {
			return s;
		};
		this.toJson = function () {
		    /*var r = "{\"from\":\"" + k.getId() + "\",\"to\":\"" + s.getId() + "\", \"dots\":" + x.toJson() + ",\"text\":{\"text\":\"" + f.attr("text") + "\"},\"textPos\":{\"x\":" + Math.round(h.x) + ",\"y\":" + Math.round(h.y) + "}, \"props\":{";
			for (var o in B.props) {
				if(o=="options")
					r += "\"" + o + "\":{\"value\":\"" + JSON.stringify(B.props[o]) + "\"},";
				else
					r += "\"" + o + "\":{\"value\":\"" + B.props[o] + "\"},";
			}
			if (r.substring(r.length - 1, r.length) == ",") {
				r = r.substring(0, r.length - 1);
			}
			r += "}}";*/
			var r={
				from:k.getId(),
				to:s.getId(),
				dots:x.toJson(),
				text:{text:f.attr("text")},
				textPos:{
					x:Math.round(h.x),
					y:Math.round(h.y)
				},
				props:B.props
			};
			
			return r;
		};
		this.restore = function (o) {
			var r = o;
			B = $.extend(true, B, o);
			x.restore(r.dots);
		};
		this.remove = function () {
			x.remove();
			i.remove();
			t.remove();
			f.remove();
			try {
				$(z).unbind("click", l);
			}
			catch (o) {
			}
			try {
				$(z).unbind("removerect", A);
			}
			catch (o) {
			}
			try {
				$(z).unbind("rectresize", d);
			}
			catch (o) {
			}
			try {
				$(z).unbind("textchange", c);
			}
			catch (o) {
			}
		};
		function m() { 
			var r = x.toPathString(), o = x.midDot().pos() , fromDot = x.fromDot().pos(), toDot = x.toDot().pos();
			i.attr({path:r[0]});	 				// SMS: line
			t.attr({path:r[1]});	 				// SMS: arrow
			
			if(u.getId() == e.getId()){
				var tempX = fromDot.x, tempY = fromDot.y - 20, height =u.getBBox().height;
				i.attr({path:"M" + tempX + "," + (tempY - height / 2) + " C" + tempX + "," + (tempY - height / 2) + " " + (tempX + height) + "," + (tempY + height / 2) + " " + tempX + "," + (tempY + height / 2) });
				//i.attr({path: "M" + fromDot.x + "," + fromDot.y + " L" + (fromDot.x + 20) + "," + fromDot.y + " V300 H360 V280"});
			}
			
			f.attr({x:o.x + h.x, y:o.y + h.y});		// SMS: text
		}
		this.getId = function () {
			return g;
		};
		this.text = function () {
			return f.attr("text");
		};
		this.attr = function (o) {
			if (o && o.path) {
				i.attr(o.path);
			}
			if (o && o.arrow) {
				t.attr(o.arrow);
			}
		};
	};
	myflow.props = function (h, paper) {
		var j = this, $propertyPanel = $("#"+myflow.config._id+"-property-panel").bind("click", function () {
			return false; // 防止当期节点失去焦点
		}), 
		//e = $propertyPanel.find("table:first"), // SMS:暂时禁止（觉得没有用） 
		tempPaper = paper,
		i;
		
		
	    /*
         * e 右侧属性面板对象
         * m 当前对象的json属性值
         *
         */
		var showprops = function (n, propData, sender) {
			var $stateText=$("#"+myflow.config._id+"-state"),					// SMS: 节点名称
				$descriptionText=$("#"+myflow.config._id+"-description"),		// SMS: 节点描述
				$editButton=$("#"+myflow.config._id+"-btn_editState"),				// SMS: “编辑”按钮
				$propertyListUL=$("#"+myflow.config._id+"-property-list");		// SMS: 选项列表容器
			//window.focus();
			
			if (!myflow.config.editable) {
				return;
			}
			
			// SMS: 只有矩形和线才显示属性面板
			if($.inArray(propData.type,["state","path"]) > -1){ 
				$propertyPanel.removeClass("hidden");
				
				// SMS: 显示名称和描述
				$stateText.text(propData.name || "");
				$descriptionText.text(propData.description||"");
				
				// SMS: 绑定面板编辑事件（每次点击重新绑定便于获取Porp数据）
				$editButton.unbind("click").click(function(){
					myflow.config.interfaces.editRectPath(tempPaper,sender,propData);
				});

				// SMS: 根据props的options配置生成选项
				$propertyListUL.empty();
				
				// SMS: 预绑定选项链接的事件
				$propertyListUL.off("click","a.property").on("click","a.property",function(){
					myflow.config.interfaces.editOptions(this,propData);
				});
				
				propData.options && $.each(propData.options,function(name,opt){
					$("<li><a href='#' class='property' cate='"+name+"' umodule='"+opt.umodule+"' option='"+(JSON.stringify(opt.option) || '')+"' >"+opt.label+"</a><span>("+opt.value.length+")</span></li>").appendTo($propertyListUL);
				});
			}else{
				$propertyPanel.addClass("hidden")
			}

		};
		this.restore = function (sender) {
		};
		$(tempPaper).bind("showprops", showprops);
	};
	myflow.editors = {textEditor:function () {
		var d, e, c, g, f;
		this.init = function (i, h, m, l, j) {
			d = i;
			e = h;
			c = m;
			g = l;
			f = j;
			$("<input  style=\"width:100%;\"/>").val(g.text()).change(function () {
				i[e].value = $(this).val();
				$(f).trigger("textchange", [$(this).val(), g]);
			}).appendTo("#" + c);
			$("#" + c).data("editor", this);
		};
		this.destroy = function () {
			$("#" + c + " input").each(function () {
				d[e].value = $(this).val();
				$(f).trigger("textchange", [$(this).val(), g]);
			});
		};
	}};
	myflow.init = function (x, options) {
		$.extend(true, myflow.config, options);
	    var windowWidth = myflow.config.width || $(window).width() * 1.5,
            windowHeight = myflow.config.height || $(window).height() * 1.5,
            paper = Raphael(x, windowWidth, windowHeight),
            currRectArray = {}, // SMS: 当前所有矩形对象列表
            currPathArray = {}; // SMS: 当前所有路径对象列表
		/*$(document).keydown(function (event) {  // SMS: 暂时禁止文本键盘输入事件
			if (!myflow.config.editable) {
				return;
			}
			if (event.ctrlKey && event.keyCode == 46) { // ctrl+delete // SMS: 暂时禁用
				var j = $(paper).data("currNode");
				if (j) {
					if (j.getId().substring(0, 4) == "rect") {
						$(paper).trigger("removerect", j);
					} else {
						if (j.getId().substring(0, 4) == "path") {
							$(paper).trigger("removepath", j);
						}
					}
					$(paper).removeData("currNode");
				}
			}
		});*/
		$(document).click(function (e) {	// SMS: 绑定document的点击事件
			if($(e.target).is("svg") || $(e.target).hasClass("switch-workflow-operate-mode")){      // SMS: 防止点击除svg外的触发对象获取光标
				$("#"+myflow.config._id+"-property-panel").addClass("hidden"); // SMS: 隐藏属性面板
				$(paper).data("currNode", null);
				$(paper).trigger("click", {getId:function () {
					return "00000000";
				}});
				$(paper).trigger("showprops", [myflow.config.props.props, {getId:function () {
					return "00000000";
				}}]);
			}
		});
		
		/*
		 * SMS: 删除节点和路径对象
		 * @params i 目标对象
		 * 
		 */
		var removeRectOrPath = function (e, i) {  
			var tempCurrRectArray={};
			if (!myflow.config.editable) {
				return;
			}
			if (i.getId().substring(0, 4) == "rect") {
				currRectArray[i.getId()] = null;
				i.remove();
				$.each(currRectArray,function(name,rect){ // SMS: 删除数据项为null
					if(rect){
						tempCurrRectArray[name]=rect;
					}
				});
				currRectArray=tempCurrRectArray;
			} else {
				if (i.getId().substring(0, 4) == "path") {
					currPathArray[i.getId()] = null;
					i.remove();
				}
			}
		};
		$(paper).bind("removepath", removeRectOrPath);	// SMS: 删除路径
		
		$(paper).bind("removerect", removeRectOrPath);	// SMS: 删除节点
		
		$(paper).bind("addrect", function (e, c, k) {	// SMS: 添加节点
		    var newRect = new myflow.rect($.extend(true, { text: { text: c }}, myflow.config.tools.states[c], k), paper, currRectArray);
			currRectArray[newRect.getId()] = newRect;
		});
		
		$(paper).bind("addpath", function (e, from, to) {   // SMS: 添加路径
		    var newPath = new myflow.path({}, paper, from, to);
		    currPathArray[newPath.getId()] = newPath;
		});
		
		$(paper).data("mod", "point"); 
		if (myflow.config.editable) {
			/*$("#workflowTools").draggable({handle:"#myflow_tools_handle"}).css(myflow.config.tools.attr); // SMS: 暂时禁止左侧工具栏
			$("#workflowTools .node").hover(function () {
				$(this).addClass("mover");
			}, function () {
				$(this).removeClass("mover");
			});
			$("#workflowTools .selectable").click(function () {
				$(".selected").removeClass("selected");
				$(this).addClass("selected");
				$(paper).data("mod", this.id);
			});
			$("#workflowTools .state").each(function () {
				$(this).draggable({helper:"clone"});
			});
			$(x).droppable({accept:".state", drop:function (c, i) { // SMS: 绑定左侧工具栏.state拖动生成矩形对象
				$(paper).trigger("addrect", [i.helper.attr("type"), {props:{code:{value:i.helper.context.id}}, attr:{x:i.helper.position().left, y:i.helper.position().top}}]);  // 如果是全屏的话就是offset,左侧有距离的话为position
			}
			});*/
			
			
			
			
			// SMS: 绑定添加状态按钮事件
			$("#"+myflow.config._id + "-btn_addRect").click(function () {
				myflow.config.interfaces.addRect(paper,currRectArray);
			}); 
			
			// SMS: 使流程图处于选择状态
			$("#"+myflow.config._id+"-btn_select").click(function(){
				$(paper).data("mod", "pointer");
				$(this).addClass("disabled");
				$("#"+myflow.config._id+"-btn_connect").removeClass("disabled");
			});
			
			// SMS: 使流程图处于连接状态
			$("#"+myflow.config._id+"-btn_connect").click(function(){
				$(paper).data("mod", "path");
				$(this).addClass("disabled");
				$("#"+myflow.config._id+"-btn_select").removeClass("disabled");
			});
			
			// SMS: 删除指定的state
			$("#"+myflow.config._id+"-btn_remove").click(function(){
				var obj = $(paper).data("currNode");
				if (obj) {
					if (obj.getId().substring(0, 4) == "rect") {
						$(paper).trigger("removerect", obj);
					} else {
						if (obj.getId().substring(0, 4) == "path") {
							$(paper).trigger("removepath", obj);
						}
					}
					$(paper).removeData("currNode");
					$("#"+myflow.config._id+"-property-panel").addClass("hidden");
				}
			});
			
			
			

			// SMS: 获取流程图数据
			$("#"+myflow.config._id + "-btn_getFlowData").click(function () {
				/*var flowJsonData = "{\"states\":{";
				for (var rect in currRectArray) {
					if (currRectArray[rect]) {
						flowJsonData += "\""+currRectArray[rect].getId() + "\":" + currRectArray[rect].toJson() + ",";
					}
				}
				if (flowJsonData.substring(flowJsonData.length - 1, flowJsonData.length) == ",") {
					flowJsonData = flowJsonData.substring(0, flowJsonData.length - 1);
				}
				flowJsonData += "},\"paths\":{";
				for (var path in currPathArray) {
					if (currPathArray[path]) {
					    flowJsonData += "\"" + currPathArray[path].getId() + "\":" + currPathArray[path].toJson() + ",";
					}
				}
				if (flowJsonData.substring(flowJsonData.length - 1, flowJsonData.length) == ",") {
					flowJsonData = flowJsonData.substring(0, flowJsonData.length - 1);
				}
				flowJsonData += "},\"props\":{\"props\":{";
				for (var c in myflow.config.props.props) {
    				flowJsonData += "\"" + c + "\":\"" + myflow.config.props.props[c] + "\",";
				}
				if (flowJsonData.substring(flowJsonData.length - 1, flowJsonData.length) == ",") {
					flowJsonData = flowJsonData.substring(0, flowJsonData.length - 1);
				}
				flowJsonData += "}}}";*/
				
				var flowJsonData={states:{},paths:{},props:{props:myflow.config.props.props}};
				for (var rect in currRectArray) {
					if (currRectArray[rect]) {
						flowJsonData.states[currRectArray[rect].getId()]=currRectArray[rect].toJson();
					}
				}
				for (var path in currPathArray) {
					if (currPathArray[path]) {
						flowJsonData.paths[currPathArray[path].getId()]=currPathArray[path].toJson();
					}
				}
				
				myflow.config.interfaces.saveWorkflowData(JSON.stringify(flowJsonData));
			});
			new myflow.props({}, paper); // SMS: 绑定对象的showpros方法
		}
		
		if (options.restore) { // SMS: 编辑流程时根据保存的数据初始化流程图
			var workflowData = options.restore;
			var z = {};
			if (workflowData.states) {
				for (var s in workflowData.states) {
					/*var attributes = {};  // SMS:　保存的格式和操作的格式保持一致（新增的）
					if (workflowData.states[s].props.attributes) {
					    if (workflowData.states[s].type == "state" || workflowData.states[s].props.type == "state") {  // 只有任务节点保留attributes属性
					        attributes = workflowData.states[s].props.attributes;
					    } 
					    workflowData.states[s]['props']['attributes'] = attributes;
					}*/
					workflowData.states[s].props.type == "state" ? workflowData.states[s].text.text = workflowData.states[s].props.name : null;
					var d = new myflow.rect($.extend(true, {}, myflow.config.tools.states[workflowData.states[s].type], workflowData.states[s]), paper,currRectArray);
					d.restore(workflowData.states[s]);
					z[s] = d;
					currRectArray[d.getId()] = d;
				}
			}
			if (workflowData.paths) {
				for (var s in workflowData.paths) {
					var n = new myflow.path($.extend(true, {}, myflow.config.tools.path, workflowData.paths[s]), paper, z[workflowData.paths[s].from], z[workflowData.paths[s].to]);
					n.restore(workflowData.paths[s]);
					currPathArray[n.getId()] = n;
				}
			}
			// 设置流程属性
			if (workflowData.props) {
				$.extend(true, myflow.config.props, workflowData.props);
			}
		}else{ // SMS: 新增流程图
			$(paper).trigger("addrect", ["start", { attr: { x: 300, y: 150 }}]);
			$(paper).trigger("addrect", ["end", { attr: { x: 350, y: 350 }}]);
		}
	};
	$.fn.myflow = function (options) {
		var $this = this.each(function () {
			myflow.init(this, options);
		});
		
		// 暴露myflow的config给调用方
		$this.config = myflow.config;
		return $this;
	};
	$.myflow = myflow;
})(jQuery);

