var legendChart = (function () {
'use strict';

var colors = ['#7cb5ec', '#f7a35c', '#434348', '#90ed7d', '#f15c80', '#8085e9', '#E4D354', '#2B908F', '#F45B5B', '#91E8E1', '#7CB5EC', '#434348'];
var getColor = function getColor(index) {
  return colors[index % colors.length];
};

// const hexToRgb = (hex, base = 16) => {
//     const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
//     return result ? {
//         r: parseInt(result[1], base),
//         g: parseInt(result[2], base),
//         b: parseInt(result[3], base),
//     } : null
// }

var measureText = function measureText(text, fontSize) {
  if (typeof wx !== 'undefined') {
    // wx canvas 未实现measureText方法, 此处自行实现
    text = String(text);
    var text = text.split('');
    var width = 0;
    text.forEach(function (item) {
      if (/[a-zA-Z]/.test(item)) {
        width += 7;
      } else if (/[0-9]/.test(item)) {
        width += 5.5;
      } else if (/\./.test(item)) {
        width += 2.7;
      } else if (/-/.test(item)) {
        width += 3.25;
      } else if (/[\u4e00-\u9fa5]/.test(item)) {
        width += 10;
      } else if (/\(|\)/.test(item)) {
        width += 3.73;
      } else if (/\s/.test(item)) {
        width += 2.5;
      } else if (/%/.test(item)) {
        width += 8;
      } else {
        width += 10;
      }
    });
    return width * fontSize / 10;
  } else {
    var currFont = this.font;
    this.font = fontSize + 'px serif';
    var width = this.measureText(text).width;
    this.font = currFont;
    return width;
  }
};

var Timing = {
  easeIn: function easeIn(pos) {
    return Math.pow(pos, 3);
  },

  easeOut: function easeOut(pos) {
    return Math.pow(pos - 1, 3) + 1;
  },

  easeInOut: function easeInOut(pos) {
    if ((pos /= 0.5) < 1) {
      return 0.5 * Math.pow(pos, 3);
    } else {
      return 0.5 * (Math.pow(pos - 2, 3) + 2);
    }
  },

  linear: function linear(pos) {
    return pos;
  }
};

var Animation$1 = function Animation(opts) {
  this.isStop = false;
  opts.duration = typeof opts.duration === 'undefined' ? 1000 : opts.duration;
  opts.timing = opts.timing || 'linear';

  var delay = 17;

  var createAnimationFrame = function createAnimationFrame() {
    if (typeof requestAnimationFrame !== 'undefined') {
      return requestAnimationFrame;
    } else if (typeof setTimeout !== 'undefined') {
      return function (step, delay) {
        setTimeout(function () {
          var timeStamp = +new Date();
          step(timeStamp);
        }, delay);
      };
    } else {
      return function (step) {
        step(null);
      };
    }
  };
  var animationFrame = createAnimationFrame();
  var startTimeStamp = null;
  var _step = function step(timestamp) {
    if (timestamp === null || this.isStop === true) {
      opts.onProcess && opts.onProcess(1);
      opts.onAnimationFinish && opts.onAnimationFinish();
      return;
    }
    if (startTimeStamp === null) {
      startTimeStamp = timestamp;
    }
    if (timestamp - startTimeStamp < opts.duration) {
      var process = (timestamp - startTimeStamp) / opts.duration;
      var timingFunction = Timing[opts.timing];
      process = timingFunction(process);
      opts.onProcess && opts.onProcess(process);
      animationFrame(_step, delay);
    } else {
      opts.onProcess && opts.onProcess(1);
      opts.onAnimationFinish && opts.onAnimationFinish();
    }
  };
  _step = _step.bind(this);

  animationFrame(_step, delay);
};

var createCanvas = function createCanvas(canvasId) {
  if (typeof wx !== 'undefined') {
    var wxCanvas = wx.createCanvasContext(canvasId);
    wxCanvas.measureText = measureText;
    return wxCanvas;
  }

  var canvas = document.getElementById(canvasId);
  if (canvas) {
    canvas = canvas.getContext('2d');

    //polyfill to web.
    canvas.setStrokeStyle = canvas.setStrokeStyle || function (style) {
      this.strokeStyle = style;
    };

    canvas.setFillStyle = canvas.setFillStyle || function (style) {
      this.fillStyle = style;
    };

    canvas.setLineWidth = canvas.setLineWidth || function (w) {
      this.lineWidth = w;
    };

    canvas.setLineJoin = canvas.setLineJoin || function (j) {
      this.lineJoin = j;
    };

    canvas.setFontSize = canvas.setFontSize || function (s) {
      this.font = s + 'px serif';
    };

    canvas.setLineCap = canvas.setLineCap || function (s) {
      this.lineCap = s;
    };

    canvas.setLineJoin = canvas.setLineJoin || function (s) {
      this.lineJoin = s;
    };

    canvas.setMiterLimit = canvas.setMiterLimit || function (s) {
      this.miterLimit = s;
    };

    canvas.setTextAlign = canvas.setTextAlign || function (s) {
      this.textAlign = s;
    };

    canvas.setGlobalAlpha = canvas.setGlobalAlpha || function (s) {
      this.globalAlpha = s;
    };

    canvas.setShadow = canvas.setShadow || function () {
      var offsetX = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0;
      var offsetY = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;
      var blur = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 0;
      var color = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : 'black';

      this.shadowOffsetX = offsetX;
      this.shadowOffsetY = offsetX;
      this.shadowBlur = blur;
      this.shadowColor = color;
    };

    //compatibility to original wechat logic
    canvas.clearRect = canvas.clearRect || function () {
      console.log('canvas cleared');
    };

    canvas.draw = canvas.draw || function () {
      console.log('chart rendered');
    };

    canvas.myMeasureText = measureText;

    return canvas;
  }

  return null;
};

var chartUtil = { /* measureText,*/Animation: Animation$1, getColor: getColor, /*hexToRgb,*/createCanvas: createCanvas };

var classCallCheck = function (instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
};

var createClass = function () {
  function defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ("value" in descriptor) descriptor.writable = true;
      Object.defineProperty(target, descriptor.key, descriptor);
    }
  }

  return function (Constructor, protoProps, staticProps) {
    if (protoProps) defineProperties(Constructor.prototype, protoProps);
    if (staticProps) defineProperties(Constructor, staticProps);
    return Constructor;
  };
}();

/**
 * 绘制饼图步骤
 * 1. 绘制入口draw()
 * 2. 计算数据总和, 确定各分片大小
 * 3. 绘制分片及分片占比数值, 入口drawSliceArc()
 *  3.1  计算分片绘制角度大小
 *  3.2  计算分片间隔大小, 计算圆心偏移点
 *  3.3  绘制弧形，连接圆心偏移点, 形成封闭, fill
 *  3.4  计算数值文本绘制点, 取弧度中心
 * 4. 绘制Legend, 入口drawLegend()
 *  4.1  计算平铺开需要的宽度及是否需要换行
 *  4.2  不需要换行则居中开始逐个绘制
 *  4.3  需要换行则计算legend数量是否过多, 过多则省略绘制, 反之列举颜色, 文本绘制范围
 */

var Animation = chartUtil.Animation;

var Pie = function () {
  function Pie(opts) {
    classCallCheck(this, Pie);

    console.log(opts);

    var data = opts.data,
        width = opts.width,
        height = opts.height;

    this.canvas = opts.canvas;
    this.width = width;
    this.height = height;
    this.highLightIndex = -1;
    this.chartPadding = opts.chartPadding || 40;
    this.legendPadding = opts.legendPadding || 5;
    this.legendFontSize = opts.legendFontSize || 10;
    this.radius = (this.width < this.height ? this.width : this.height) / 2 - this.chartPadding;
    this.highlightRadius = opts.highlightRadius || 15;
    this.total = opts.total || 0;

    this.drawWithAnimation = opts.drawWithAnimation === undefined ? true : opts.drawWithAnimation;

    this.noData = opts.noData || false;
    this.noDataText = opts.noDataText || '暂无数据';
    this.noDataTextColor = opts.noDataTextColor || '#69B5FC';
    this.noDataFontSize = opts.noDataFontSize || 11;
    this.data = data;

    this.sliceSpace = opts.sliceSpace || 0.5;
    this.legendEnable = opts.legendEnable || false;
    this.drawDataLabel = opts.drawDataLabel || false;
    this.dataLabelFontSize = opts.dataLabelFontSize || 8;
    this.datalabelCallBack = opts.datalabelCallBack || function () {
      return '';
    };

    this.tooltipCallBack = opts.tooltipCallBack;
    this.toolTipBackgroundColor = opts.toolTipBackgroundColor || 'rgba(0, 0, 0, 0.6)';
    this.toolTipPadding = opts.toolTipPadding || 10;
    this.toolTipTextPadding = opts.toolTipTextPadding || 8;
    this.toolTipFontSize = opts.toolTipFontSize || 10;
    this.toolTipSplitLineWidth = opts.toolTipSplitLineWidth || 1;
    this.toolTipSplitLineColor = opts.toolTipSplitLineColor || '#ffffff';

    this.muteCallback = opts.muteCallback || function () {
      return '';
    };

    var colors = ['#7cb5ec', '#f7a35c', '#434348', '#90ed7d', '#f15c80', '#8085e9', '#E4D354', '#2B908F', '#F45B5B', '#91E8E1', '#7CB5EC', '#434348'];
    this.colors = opts.colors && opts.colors.slice() || colors;

    this.seriesStatus = opts.seriesStatus || {}; //read only
    this.muteCallBack = opts.muteCallBack || function () {
      return '';
    };
    this.seriesStatus = opts.seriesStatus;

    this.draw();
  }

  createClass(Pie, [{
    key: 'getColor',
    value: function getColor(index) {
      if (this.isHiddenSeries(index)) {
        return '#cccccc';
      }
      return this.colors[index % this.colors.length];
    }
  }, {
    key: 'isHiddenSeries',
    value: function isHiddenSeries(index) {
      return this.seriesStatus && this.seriesStatus[index];
    }
  }, {
    key: 'getCurrentDataIndex',
    value: function getCurrentDataIndex(e) {
      var index = this.calculateClickPosition(e);
      if (index == -1) {
        return {};
      }
      return this.data[index];
    }
  }, {
    key: 'getCurrentHighLightIndex',
    value: function getCurrentHighLightIndex() {
      return this.highLightIndex;
    }
  }, {
    key: 'calculateClickPosition',
    value: function calculateClickPosition(e) {
      var isMove = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;

      if (this.noData || this.process != 1) {
        return -1;
      }
      if (e.touches && e.touches.length) {
        var x = e.touches[0].x;
        var y = e.touches[0].y;

        var chartPadding = this.chartPadding;
        var legendPadding = this.legendPadding;
        var legendFontSize = this.legendFontSize;
        var centerX = this.width / 2;
        var centerY = this.height / 2;

        if (Math.pow(x - centerX, 2) + Math.pow(y - centerY, 2) <= Math.pow(this.radius, 2)) {
          var currAngle = this.getAngleForPoint(x, y);
          var arcPointX = centerX + this.radius * Math.cos(currAngle);
          var arcPointY = centerY + this.radius * Math.sin(currAngle);
          var angle = 0;
          for (var i = 0; i < this.data.length; i++) {
            var slice = this.data[i];
            var endAngle = angle + slice.p * 2 * Math.PI;
            if (endAngle > 2 * Math.PI && endAngle % (2 * Math.PI) > currAngle) {
              return i;
            } else if (angle < currAngle && endAngle > currAngle) {
              return i;
            }
            angle = endAngle % (2 * Math.PI);
          }
        }

        if (isMove) {
          return -1;
        }

        //click on legend area
        if (x > chartPadding && x < this.width - chartPadding && y > this.height - legendPadding * 2 - legendFontSize && y < this.height) {
          var legendWidth = this.legendWidth;
          var isMultiLine = this.isMultiLine;

          if (!isMultiLine) {
            var startX = (this.width - legendWidth) / 2;

            if (x >= startX && x <= this.width - startX) {
              for (var i = 0; i < this.data.length; i++) {
                var textWidth = this.canvas.myMeasureText(this.data[i].name, legendFontSize);
                if (x < startX + textWidth + legendFontSize * 2.2) {
                  var chartInfo = this.muteCallback(i);
                  console.log(chartInfo);
                  this.data = chartInfo.data;
                  this.seriesStatus = chartInfo.seriesStatus;
                  this.draw(true, false);
                  break;
                }
                startX += legendFontSize * 2.2 + textWidth;
              }
            }
          } else {
            var startX = chartPadding;

            if (startX + legendFontSize * 1.2 * this.data.length <= this.width) {
              for (var i = 0; i < this.data.length; i++) {
                if (x < startX + legendFontSize * 1.2) {
                  var chartInfo = this.muteCallback(i);
                  console.log(chartInfo);
                  this.data = chartInfo.data;
                  this.seriesStatus = chartInfo.seriesStatus;
                  this.draw(true, false);
                  break;
                }
                startX += legendFontSize * 1.2;
              }
            }
          }
        }
        return -1;
      }
      return -1;
    }
  }, {
    key: 'getAngleForPoint',
    value: function getAngleForPoint(x, y) {
      var centerX = this.width / 2;
      var centerY = this.height / 2;

      var tx = x - centerX,
          ty = y - centerY;
      var length = Math.sqrt(tx * tx + ty * ty);
      var r = Math.acos(ty / length);

      var angle = r;
      if (x > centerX) {
        angle = 2 * Math.PI - angle;
      }
      angle = angle + Math.PI / 2;
      if (angle > 2 * Math.PI) {
        angle = angle - 2 * Math.PI;
      }

      return angle;
    }
  }, {
    key: 'showToolTip',
    value: function showToolTip(e) {
      var isMove = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;

      var index = this.calculateClickPosition(e, isMove);
      if (this.highLightIndex == index && index == -1) {
        return;
      }
      if (this.highLightIndex == index && !isMove) {
        this.highLightIndex = -1;
      } else if (this.highLightIndex == index) {
        console.log('HighLight不变, 不进行渲染');
        return;
      } else {
        this.highLightIndex = index;

        if (index != -1) {
          var highLightData = this.tooltipCallBack(index);
          this.highLightData = highLightData;
          this.highLightY = e.touches[0].y;
          this.highLightX = e.touches[0].x;
        }
      }
      this.draw(false);
    }
  }, {
    key: 'hiddenHighLight',
    value: function hiddenHighLight() {
      if (this.highLightIndex == -1) {
        return;
      }
      this.highLightIndex = -1;
      this.draw(false);
    }
  }, {
    key: 'draw',
    value: function draw() {
      var isAnimation = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : true;
      var animationWithLegend = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : true;

      this.isDrawFinish = false;
      var canvas = this.canvas;

      if (this.noData) {
        this.drawNoData(canvas);
        canvas.draw();
        this.isDrawFinish = true;
      } else {
        var that = this;
        var duration = isAnimation && this.drawWithAnimation ? 1000 : 0;
        var animation = new Animation({
          timing: 'easeIn',
          duration: duration,
          onProcess: function onProcess(process) {
            // console.time('pie draw')
            that.process = process;
            canvas.clearRect && canvas.clearRect(0, 0, that.width, that.height);

            var currPerAngle = 0;
            that.data.map(function (slice, i) {
              if (slice.p) {
                that.drawSliceArc(canvas, slice, i, that.sliceSpace, currPerAngle);
                currPerAngle += slice.p * 2 * Math.PI;
              }
            });
            that.drawToolTip(canvas);

            if (that.legendEnable) {
              if (!animationWithLegend) {
                that.drawLegend(canvas);
              } else if (process == 1) {
                that.drawLegend(canvas);
              }
            }
            canvas.draw();
            // console.timeEnd('pie draw')
          },
          onAnimationFinish: function onAnimationFinish() {
            that.isDrawFinish = true;
          }
        });
      }
    }
  }, {
    key: 'drawToolTip',
    value: function drawToolTip(canvas) {
      if (this.highLightIndex == -1) {
        return;
      }
      var chartPadding = this.chartPadding;
      var chartContentHeight = this.height - chartPadding * 2;
      var chartContentWidth = this.width - chartPadding * 2;
      var contentWidth = chartContentWidth;
      var x = this.highLightViewX;
      var y = this.highLightViewY;

      var toolTipBackgroundColor = this.toolTipBackgroundColor;
      var toolTipPadding = this.toolTipPadding;
      var toolTipTextPadding = this.toolTipTextPadding;
      var toolTipFontSize = this.toolTipFontSize;
      var toolTipSplitLineWidth = this.toolTipSplitLineWidth;
      var toolTipSplitLineColor = this.toolTipSplitLineColor;

      var toolTipWidth = toolTipPadding * 2;
      var toolTipHeight = toolTipPadding * 2;

      var highLightData = this.highLightData;

      //title
      var maxTipLineWidth = canvas.myMeasureText(highLightData.title, toolTipFontSize);
      toolTipHeight += toolTipFontSize + toolTipSplitLineWidth + toolTipTextPadding;
      highLightData.data.map(function (text, index) {
        toolTipHeight += toolTipFontSize + toolTipTextPadding;

        var textWidth = canvas.myMeasureText(text, toolTipFontSize);
        if (maxTipLineWidth < textWidth) {
          maxTipLineWidth = textWidth;
        }
      });
      toolTipWidth += maxTipLineWidth;

      var startX = x - toolTipWidth / 2;
      var startY = y - toolTipHeight / 2;
      if (y + toolTipHeight > chartContentHeight + chartPadding) {
        startY = chartContentHeight + chartPadding - toolTipHeight;
      }

      canvas.setFillStyle(toolTipBackgroundColor);
      canvas.beginPath();
      canvas.fillRect(startX, startY, toolTipWidth, toolTipHeight);
      canvas.closePath();

      canvas.setFillStyle(toolTipSplitLineColor);
      canvas.setStrokeStyle(toolTipSplitLineColor);
      canvas.setLineWidth(toolTipSplitLineWidth);
      canvas.setFontSize(toolTipFontSize);

      var drawX = startX + toolTipPadding;
      var drawY = startY + toolTipPadding + toolTipFontSize;

      canvas.fillText(highLightData.title, drawX, drawY);
      drawY += toolTipTextPadding + toolTipSplitLineWidth / 2;
      canvas.beginPath();
      canvas.moveTo(drawX - toolTipPadding * 0.25, drawY);
      canvas.lineTo(drawX + toolTipWidth - toolTipPadding * 1.75, drawY);
      canvas.stroke();
      canvas.closePath();

      highLightData.data.map(function (text, index) {
        drawY += toolTipTextPadding + toolTipFontSize;
        canvas.fillText(text, drawX, drawY);
      });
    }
  }, {
    key: 'drawLegend',
    value: function drawLegend(canvas) {
      var _this = this;

      var legendTextColor = '#000000';
      var legendFontSize = this.legendFontSize;
      var chartPadding = this.chartPadding;
      var legendPadding = this.legendPadding;

      canvas.setFontSize(legendFontSize);

      var legendWidth = 0;
      var isMultiLine = false;
      this.data.map(function (slice, i) {
        if (legendWidth > 0) {
          legendWidth += legendFontSize;
        }

        legendWidth += canvas.myMeasureText(slice.name, legendFontSize) + legendFontSize * 1.2;
        if (i == _this.data.length) {
          legendWidth -= legendFontSize;
        }
        if (legendWidth > _this.width - chartPadding * 2) {
          isMultiLine = true;
        }
      });

      this.legendWidth = legendWidth;
      this.isMultiLine = isMultiLine;

      if (!isMultiLine) {
        var startX = (this.width - legendWidth) / 2;
        var startY = this.height - legendPadding - legendFontSize;
        this.data.map(function (slice, i) {
          var textWidth = canvas.myMeasureText(slice.name, legendFontSize);
          if (startX + textWidth + legendFontSize * 1.2 > _this.width - chartPadding) {
            startX = chartPadding;
            startY += legendFontSize * 1.5;
          }

          var centerX = startX + legendFontSize / 2;
          var centerY = startY + legendFontSize / 2;
          var radius = legendFontSize / 2;
          // if (i == this.highLightIndex) {
          //   var gradient = canvas.createCircularGradient(centerX, centerY, radius)
          //   gradient.addColorStop(0, 'white')
          //   gradient.addColorStop(1, this.getColor(i))
          //   canvas.setFillStyle(gradient)
          // } else {
          var seriesColor = _this.getColor(i);
          canvas.setFillStyle(seriesColor);
          // }
          canvas.beginPath();
          canvas.arc(centerX, centerY, radius, 0, 2 * Math.PI);
          canvas.fill();
          canvas.closePath();

          startX += legendFontSize * 1.2;
          if (_this.isHiddenSeries(i)) {
            canvas.setFillStyle(seriesColor);
          } else {
            canvas.setFillStyle(legendTextColor);
          }
          canvas.fillText(slice.name, startX, startY + legendFontSize);

          startX += textWidth + legendFontSize;
        });
      } else {
        var startX = chartPadding;
        var startY = this.height - legendPadding - legendFontSize;

        if (startX + legendFontSize * 1.2 * this.data.length > this.width) {
          //legend数量过多
          canvas.setFillStyle(this.getColor(0));
          canvas.fillRect(startX, startY, legendFontSize, legendFontSize);
          startX += legendFontSize * 1.2;

          var betweenText = "~";
          var btwTextWidth = canvas.myMeasureText(betweenText, legendFontSize);
          canvas.setFillStyle(legendTextColor);
          canvas.fillText(betweenText, startX, startY + legendFontSize);
          startX += btwTextWidth + legendFontSize * 0.2;

          canvas.setFillStyle(this.getColor(this.data.length - 1));
          canvas.fillRect(startX, startY, legendFontSize, legendFontSize);
          startX += legendFontSize * 1.2;
        } else {
          this.data.map(function (slice, i) {
            // if (i == this.highLightIndex) {
            //   var gradient = canvas.createCircularGradient(startX + legendFontSize / 2, startY + legendFontSize / 2, legendFontSize / 2)
            //   gradient.addColorStop(0, 'white')
            //   gradient.addColorStop(1, this.getColor(i))
            //   canvas.setFillStyle(gradient)
            // } else {
            canvas.setFillStyle(_this.getColor(i));
            // }
            canvas.fillRect(startX, startY, legendFontSize, legendFontSize);
            startX += legendFontSize * 1.2;
          });
        }
        startX += legendFontSize * 0.3;
        var simpleText = this.data[0].name + " ~ " + this.data[this.data.length - 1].name;
        var spTextWidth = canvas.myMeasureText(simpleText, legendFontSize);
        canvas.setFillStyle(legendTextColor);
        canvas.fillText(simpleText, startX, startY + legendFontSize);
      }
    }
  }, {
    key: 'drawSliceArc',
    value: function drawSliceArc(canvas, slice, position, sliceSpace, currPerAngle) {
      var centerX = this.width / 2;
      var centerY = this.height / 2;
      var radius = this.radius;
      if (this.highLightIndex == position) {
        radius += this.highlightRadius;
        sliceSpace *= 2;
      }
      var process = this.process;

      var sliceAngle = slice.p * 2 * Math.PI;
      var sliceSpaceAngleOuter = sliceSpace / radius * Math.PI;
      var startAngleOuter = (currPerAngle + sliceSpaceAngleOuter) * process;
      var sweepAngleOuter = (sliceAngle - sliceSpaceAngleOuter) * process;
      if (sweepAngleOuter < 0) {
        sweepAngleOuter = 0;
      }

      canvas.setFillStyle(this.getColor(position));
      canvas.beginPath();
      var arcStartPointX = centerX + radius * Math.cos(startAngleOuter);
      var arcStartPointY = centerY + radius * Math.sin(startAngleOuter);
      if (sweepAngleOuter >= 2 * Math.PI && sweepAngleOuter % (2 * Math.PI) <= 1) {
        canvas.arc(centerX, centerY, radius, 0, 2 * Math.PI);
      } else {
        canvas.moveTo(arcStartPointX, arcStartPointY);
        canvas.arc(centerX, centerY, radius, startAngleOuter, startAngleOuter + sweepAngleOuter);
      }

      if (sweepAngleOuter % (2 * Math.PI) > 0) {
        if (sliceAngle <= Math.PI) {
          var angleMiddle = startAngleOuter + sweepAngleOuter / 2;
          var sliceSpaceOffset = this.calculateMinimumRadiusForSpacedSlice({
            centerX: centerX,
            centerY: centerY,
            radius: radius,
            angle: sliceAngle * process,
            arcStartPointX: arcStartPointX,
            arcStartPointY: arcStartPointY,
            startAngle: startAngleOuter,
            sweepAngle: sweepAngleOuter
          });

          var arcEndPointX = centerX + sliceSpaceOffset * Math.cos(angleMiddle);
          var arcEndPointY = centerY + sliceSpaceOffset * Math.sin(angleMiddle);

          canvas.lineTo(arcEndPointX, arcEndPointY);
        } else {
          canvas.lineTo(centerX, centerY);
        }
      }
      canvas.closePath();
      canvas.fill();

      if (this.drawDataLabel && process == 1) {
        var centerAngle = currPerAngle + sliceAngle / 2;
        var arcCenterX = centerX + radius * 2 / 3 * Math.cos(centerAngle);
        var arcCenterY = centerY + radius * 2 / 3 * Math.sin(centerAngle);

        if (this.highLightIndex == position) {
          this.highLightViewX = arcCenterX;
          this.highLightViewY = arcCenterY;
        }

        if (sliceAngle >= 2 * Math.PI) {
          arcCenterX = centerX;
          arcCenterY = centerY;
        }

        var text = this.datalabelCallBack(0, position);
        var textSize = this.dataLabelFontSize;
        var textWidth = canvas.myMeasureText(text, textSize);
        canvas.setFontSize(textSize);
        canvas.setFillStyle('#ffffff');
        canvas.fillText(text, arcCenterX - textWidth / 2, arcCenterY + textSize / 2);
      }
    }
  }, {
    key: 'drawNoData',
    value: function drawNoData(canvas) {
      var text = this.noDataText;
      var textWidth = canvas.myMeasureText(text, this.noDataFontSize);
      canvas.setFillStyle(this.noDataTextColor);
      canvas.fillText(text, (this.width - textWidth) / 2, (this.height + this.noDataFontSize) / 2);
    }
  }, {
    key: 'calculateMinimumRadiusForSpacedSlice',
    value: function calculateMinimumRadiusForSpacedSlice(param) {
      var angleMiddle = param.startAngle + param.sweepAngle / 2;
      var arcEndPointX = param.centerX + param.radius * Math.cos(param.startAngle + param.sweepAngle);
      var arcEndPointY = param.centerY + param.radius * Math.sin(param.startAngle + param.sweepAngle);

      var arcMidPointX = param.centerX + param.radius * Math.cos(angleMiddle);
      var arcMidPointY = param.centerY + param.radius * Math.sin(angleMiddle);

      var basePointsDistance = Math.sqrt(Math.pow(arcEndPointX - param.arcStartPointX, 2) + Math.pow(arcEndPointY - param.arcStartPointY, 2));

      var containedTriangleHeight = basePointsDistance / 2 * Math.tan((Math.PI - param.angle) / 2);

      var spacedRadius = param.radius - containedTriangleHeight;
      spacedRadius -= Math.sqrt(Math.pow(arcMidPointX - (arcEndPointX + param.arcStartPointX) / 2, 2) + Math.pow(arcMidPointY - (arcEndPointY + param.arcStartPointY) / 2, 2));

      return spacedRadius;
    }
  }]);
  return Pie;
}();

var pie = Pie;

var Animation$2 = chartUtil.Animation;

var Scatter = function () {
  function Scatter(opts) {
    var _this = this;

    classCallCheck(this, Scatter);

    console.log(opts);
    this.canvas = opts.canvas;
    this.width = opts.width;
    this.height = opts.height;
    this.chartPaddingLeft = opts.chartPaddingLeft || 40;
    this.chartPaddingRight = opts.chartPaddingRight || 40;
    this.chartPaddingTop = opts.chartPaddingTop || 40;
    this.chartPaddingBottom = opts.chartPaddingBottom || 40;

    this.drawWithAnimation = opts.drawWithAnimation === undefined ? true : opts.drawWithAnimation;

    this.highLightIndex = -1;
    this.highLightColor = 'rgba(0, 0, 0, 0.3)';
    this.highLightStrokeColor = 'white';

    this.noData = opts.noData || false;
    this.noDataText = opts.noDataText || '暂无数据';
    this.noDataTextColor = opts.noDataTextColor || '#69B5FC';
    this.noDataFontSize = opts.noDataFontSize || 11;
    this.data = opts.data;

    this.drawDataLabel = opts.drawDataLabel || false;
    this.datalabelCallBack = opts.datalabelCallBack || function () {
      return '';
    };
    this.dataLabelFontSize = opts.dataLabelFontSize || 8;
    this.dataLabelPadding = opts.dataLabelPadding || 4;
    this.dataLabelColor = opts.dataLabelColor || '#111111';

    this.axisEnable = opts.axisEnable || false;
    this.axisFontSize = opts.axisFontSize || 10;
    this.axisValuePadding = opts.axisValuePadding || 5;
    this.axisLineWidth = opts.axisLineWidth || 1;
    this.axisLineColor = opts.axisLineColor || '#dddddd';
    this.axisFontColor = opts.axisFontColor || '#444444';

    this.dashedLineWidth = opts.dashedLineWidth || 6;

    this.legendEnable = opts.legendEnable || false;
    this.legendFontSize = opts.legendFontSize || 10;
    this.legendPadding = opts.legendPadding || 5;
    this.legendTextColor = opts.legendTextColor || '#000000';

    this.maxValue = opts.maxValue;
    this.minValue = opts.minValue;
    this.maxXValue = opts.maxXValue;
    this.minXValue = opts.minXValue;
    this.circleRadius = opts.circleRadius || Math.max(4, Math.min(this.width, this.height) / 100);
    this.bubbleMaxRadius = opts.bubbleMaxRadius || Math.min(this.width, this.height) / 20;
    this.bubbleMinRadius = opts.bubbleMinRadius || Math.min(this.width, this.height) / 100;

    this.tooltipCallBack = opts.tooltipCallBack || function () {
      return '';
    };
    this.toolTipBackgroundColor = opts.toolTipBackgroundColor || 'rgba(0, 0, 0, 0.6)';
    this.toolTipPadding = opts.toolTipPadding || 10;
    this.toolTipTextPadding = opts.toolTipTextPadding || 8;
    this.toolTipFontSize = opts.toolTipFontSize || 10;
    this.toolTipSplitLineWidth = opts.toolTipSplitLineWidth || 1;
    this.toolTipSplitLineColor = opts.toolTipSplitLineColor || '#ffffff';

    this.muteCallback = opts.muteCallback || function () {
      return '';
    };
    this.seriesStatus = opts.seriesStatus;

    this.xTicks = opts.xTicks || [];
    this.xRefs = opts.xRefs || [];
    this.y1Refs = opts.y1Refs || [];
    this.y1Ticks = opts.y1Ticks || [];
    this.y2Ticks = opts.y2Ticks || [];

    if (this.axisEnable) {
      var maxY1Width = 0;
      this.y1Ticks.map(function (label, i) {
        var labelWidth = _this.canvas.myMeasureText(label, _this.axisFontSize);
        if (maxY1Width < labelWidth) {
          maxY1Width = labelWidth;
        }
      });
      maxY1Width += this.axisValuePadding * 2;
      if (this.chartPaddingLeft < maxY1Width) {
        this.chartPaddingLeft = maxY1Width;
      }

      var maxY2Width = 0;
      this.y2Ticks.map(function (label, i) {
        var labelWidth = _this.canvas.myMeasureText(label, _this.axisFontSize);
        if (maxY2Width < labelWidth) {
          maxY2Width = labelWidth;
        }
      });
      maxY2Width += this.axisValuePadding * 2;
      if (this.chartPaddingRight < maxY2Width) {
        this.chartPaddingRight = maxY2Width;
      }
    }

    var colors = ['#7cb5ec', '#f7a35c', '#434348', '#90ed7d', '#f15c80', '#8085e9', '#E4D354', '#2B908F', '#F45B5B', '#91E8E1', '#7CB5EC', '#434348'];
    this.colors = opts.colors && opts.colors.slice() || colors;
    this.draw();
  }

  createClass(Scatter, [{
    key: 'getColor',
    value: function getColor(index) {
      if (this.isHiddenSeries(index)) {
        return '#cccccc';
      }
      return this.colors[index % this.colors.length];
    }
  }, {
    key: 'getChartContentHeight',
    value: function getChartContentHeight() {
      return this.height - this.chartPaddingTop - this.chartPaddingBottom;
    }
  }, {
    key: 'getChartContentWidth',
    value: function getChartContentWidth() {
      return this.width - this.chartPaddingLeft - this.chartPaddingRight;
    }
  }, {
    key: 'isHiddenSeries',
    value: function isHiddenSeries(index) {
      return this.seriesStatus && this.seriesStatus[index];
    }
  }, {
    key: 'getCurrentDataIndex',
    value: function getCurrentDataIndex(e) {
      var res = this.calculateClickPosition(e);
      if (res == undefined) {
        return {};
      }
      return this.data[res[0]].data[res[1]];
    }
  }, {
    key: 'calculateClickPosition',
    value: function calculateClickPosition(e) {
      var isMove = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;

      if (this.noData || this.process != 1) {
        return null;
      }
      if (e.touches && e.touches.length) {
        var x = e.touches[0].x;
        var y = e.touches[0].y;

        var chartPaddingLeft = this.chartPaddingLeft;
        var chartPaddingRight = this.chartPaddingRight;
        var chartPaddingTop = this.chartPaddingTop;
        var chartPaddingBottom = this.chartPaddingBottom;
        var legendPadding = this.legendPadding;
        var legendFontSize = this.legendFontSize;

        for (var i = 0; i < this.xRefs.length; i++) {
          var ref = this.xRefs[i];
          if (x >= ref.left && x <= ref.right && y >= ref.top && y <= ref.bottom) {
            if (this.highLightX == ref.right && this.highLightY == ref.centerY && this.highLightData && !isMove) {
              //same label
              this.highLightIndex = -1;
              this.highLightData = null;
            } else {
              this.highLightData = {
                title: ref.name,
                data: [ref.fdName + ':' + ref.label]
              };
              this.highLightIndex = -1;
              this.highLightX = ref.right;
              this.highLightY = ref.centerY;
              this.highLightRadius = 0;
            }
            this.draw(false);
            return null;
          }
        }

        for (var i = 0; i < this.y1Refs.length; i++) {
          var ref = this.y1Refs[i];
          if (x >= ref.left && x <= ref.right && y >= ref.top && y <= ref.bottom) {
            if (this.highLightX == ref.right && this.highLightY == ref.centerY && this.highLightData && !isMove) {
              //same label
              this.highLightIndex = -1;
              this.highLightData = null;
            } else {
              this.highLightData = {
                title: ref.name,
                data: [ref.fdName + ':' + ref.label]
              };
              this.highLightIndex = -1;
              this.highLightX = ref.right;
              this.highLightY = ref.centerY;
              this.highLightRadius = 0;
            }
            this.draw(false);
            return null;
          }
        }

        if (x >= chartPaddingLeft && x <= this.width - chartPaddingRight && y >= chartPaddingTop && y <= this.height - chartPaddingBottom) {
          for (var i = this.data.length - 1; i >= 0; i--) {
            var layer = this.data[i];
            for (var j = layer.data.length - 1; j >= 0; j--) {
              var point = layer.data[j];
              var xPosition = point.xPosition;
              var yPosition = point.yPosition;
              var radius = point.radius;
              if (x >= xPosition - radius && x <= xPosition + radius && y >= yPosition - radius && y <= yPosition + radius) {
                return [i, j, xPosition, yPosition, radius];
              }
            }
          }
          return [-1, -1];
        }

        return [-1, -1];
      }
      return [-1, -1];
    }
  }, {
    key: 'getCurrentHighLightIndex',
    value: function getCurrentHighLightIndex() {
      return this.highLightIndex;
    }
  }, {
    key: 'showToolTip',
    value: function showToolTip(e) {
      var isMove = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;

      var res = this.calculateClickPosition(e, isMove);
      var x, y;
      if (res) {
        x = res[0];
        y = res[1];
      } else {
        return;
      }
      if (this.highLightIndex == x && x == -1) {
        if (this.highLightData) {
          this.highLightData = null;
          this.draw(false);
        }
        return;
      }
      if (this.highLightIndex == x && this.highLightArrayIndex == y && !isMove) {
        this.highLightIndex = -1;
        this.highLightData = null;
      } else if (this.highLightIndex == x && this.highLightArrayIndex == y) {
        console.log('同一个点, 不进行渲染');
        return;
      } else {
        this.highLightIndex = x;
        this.highLightArrayIndex = y;

        if (x != -1) {
          var highLightData = this.tooltipCallBack(y, x);
          this.highLightData = highLightData;
          this.highLightX = res[2];
          this.highLightY = res[3];
          this.highLightRadius = res[4];
        } else {
          this.highLightData = null;
        }
      }
      this.draw(false);
    }
  }, {
    key: 'hiddenHighLight',
    value: function hiddenHighLight() {
      if (this.highLightIndex == -1) {
        return;
      }
      this.highLightIndex = -1;
      this.draw(false);
    }
  }, {
    key: 'draw',
    value: function draw() {
      var isAnimation = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : true;
      var animationWithLegend = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : true;

      this.isDrawFinish = false;
      var canvas = this.canvas;

      if (this.noData) {
        this.drawNoData(canvas);
        canvas.draw();
        this.isDrawFinish = true;
      } else {
        var that = this;
        var duration = isAnimation && this.drawWithAnimation ? 1000 : 0;
        var animation = new Animation$2({
          timing: 'linear',
          duration: duration,
          onProcess: function onProcess(process) {
            // console.time('scatter draw')
            canvas.clearRect && canvas.clearRect(0, 0, that.width, that.height);
            that.process = process;
            that.dataLabels = [];

            if (that.axisEnable) {
              that.drawAxis(canvas);
            }

            that.data.map(function (item, index) {
              if (item) {
                that.drawItem(canvas, item, index);
              }
            });
            that.drawRefs(canvas);
            if (that.drawDataLabel && process == 1) {
              that.drawDataLabelLayer(canvas);
            }
            that.drawToolTip(canvas);

            if (that.legendEnable) {
              if (!animationWithLegend) {
                that.drawLegend(canvas);
              } else if (process == 1) {
                that.drawLegend(canvas);
              }
            }
            canvas.draw();
            // console.timeEnd('scatter draw')
          },
          onAnimationFinish: function onAnimationFinish() {
            that.isDrawFinish = true;
          }
        });
      }
    }
  }, {
    key: 'addDataLabel',
    value: function addDataLabel(label, x, y, labelWidth) {
      if (x + labelWidth > this.width - this.chartPaddingRight) {
        x = this.width - this.chartPaddingRight - labelWidth;
      }
      if (x < this.chartPaddingLeft) {
        x = this.chartPaddingLeft;
      }
      if (y > this.height - this.chartPaddingBottom) {
        y = this.height - this.chartPaddingBottom;
      }
      if (y - this.dataLabelFontSize < this.chartPaddingTop) {
        y = this.chartPaddingTop + this.dataLabelFontSize;
      }
      var left = x;
      var top = y - this.dataLabelFontSize;
      var right = x + labelWidth;
      var bottom = y;

      var currDataLabel = {
        label: label,
        left: left,
        top: top,
        right: right,
        bottom: bottom
      };

      var isCrash = false;
      for (var i = 0; i < this.dataLabels.length; i++) {
        var dataLabel = this.dataLabels[i];
        if (this.isRectCrash(currDataLabel, dataLabel)) {
          isCrash = true;
          break;
        }
      }
      if (!isCrash) {
        this.dataLabels.push(currDataLabel);
      }
    }
  }, {
    key: 'isRectCrash',
    value: function isRectCrash(a, b) {
      var left = Math.max(a.left, b.left);
      var top = Math.max(a.top, b.top);
      var right = Math.min(a.right, b.right);
      var bottom = Math.min(a.bottom, b.bottom);

      return left <= right && top <= bottom;
    }
  }, {
    key: 'drawDataLabelLayer',
    value: function drawDataLabelLayer(canvas) {
      canvas.setFontSize(this.dataLabelFontSize);
      canvas.setFillStyle(this.dataLabelColor);

      this.dataLabels.map(function (dataLabel, index) {
        canvas.fillText(dataLabel.label, dataLabel.left, dataLabel.bottom);
      });
    }
  }, {
    key: 'drawItem',
    value: function drawItem(canvas, item, index) {
      var color = this.getColor(index);
      var process = this.process;
      var maxValue = this.maxValue;
      var minValue = this.minValue;
      var maxXValue = this.maxXValue;
      var minXValue = this.minXValue;
      var chartPaddingLeft = this.chartPaddingLeft;
      var chartPaddingBottom = this.chartPaddingBottom;

      var chartContentHeight = this.getChartContentHeight();
      var chartContentWidth = this.getChartContentWidth();

      var dataSize = item.data.length;
      for (var i = 0; i < dataSize; i++) {
        var point = item.data[i];
        if (point && point.x <= maxXValue && point.x >= minXValue && point.y <= maxValue && point.y >= minValue) {
          var x = chartPaddingLeft + chartContentWidth / (maxXValue - minXValue) * (point.x - minXValue);
          var y = this.height - chartPaddingBottom - chartContentHeight / (maxValue - minValue) * (point.y - minValue) * process;
          var z = point.z;
          var radius;
          if (z) {
            radius = this.bubbleMaxRadius * Math.abs(z) * process;
            if (radius < this.bubbleMinRadius) {
              radius = this.bubbleMinRadius;
            }
          } else {
            radius = this.circleRadius;
          }
          point.xPosition = x;
          point.yPosition = y;
          point.radius = radius;

          if (index == this.highLightIndex && i == this.highLightArrayIndex) {
            canvas.setFillStyle(this.highLightColor);
            canvas.setStrokeStyle(this.highLightStrokeColor);
            canvas.setLineWidth(1);

            canvas.beginPath();
            canvas.arc(x, y, radius + 3, 0, 2 * Math.PI);
            canvas.fill();
            canvas.closePath();
            canvas.beginPath();
            canvas.arc(x, y, radius, 0, 2 * Math.PI);
            canvas.stroke();
            canvas.closePath();
          }
          if (point.colorBy) {
            canvas.setStrokeStyle(point.colorBy);
            canvas.setFillStyle(point.colorBy);
          } else {
            canvas.setStrokeStyle(color);
            canvas.setFillStyle(color);
          }
          canvas.beginPath();
          canvas.arc(x, y, radius, 0, 2 * Math.PI);
          canvas.fill();
          canvas.closePath();

          if (this.drawDataLabel && process == 1) {
            var dataLabelPadding = this.dataLabelPadding;
            var dataLabelFontSize = this.dataLabelFontSize;

            var label = this.datalabelCallBack(index, i, true);
            var labelWidth = canvas.myMeasureText(label, dataLabelFontSize);
            this.addDataLabel(label, x - labelWidth / 2, y - dataLabelPadding - radius, labelWidth);
          }
        }
      }
    }
  }, {
    key: 'drawToolTip',
    value: function drawToolTip(canvas) {
      if (!this.highLightData) {
        return;
      }
      var chartPaddingTop = this.chartPaddingTop;
      var chartContentHeight = this.getChartContentHeight();
      var chartContentWidth = this.getChartContentWidth();
      var x = this.highLightX;
      var y = this.highLightY;

      var toolTipBackgroundColor = this.toolTipBackgroundColor;
      var toolTipPadding = this.toolTipPadding;
      var toolTipTextPadding = this.toolTipTextPadding;
      var toolTipFontSize = this.toolTipFontSize;
      var toolTipSplitLineWidth = this.toolTipSplitLineWidth;
      var toolTipSplitLineColor = this.toolTipSplitLineColor;

      var toolTipWidth = toolTipPadding * 2;
      var toolTipHeight = toolTipPadding * 2;

      var highLightData = this.highLightData;

      //title
      var maxTipLineWidth = canvas.myMeasureText(highLightData.title, toolTipFontSize);
      toolTipHeight += toolTipFontSize + toolTipSplitLineWidth + toolTipTextPadding;
      highLightData.data.map(function (text, index) {
        toolTipHeight += toolTipFontSize + toolTipTextPadding;

        var textWidth = canvas.myMeasureText(text, toolTipFontSize);
        if (maxTipLineWidth < textWidth) {
          maxTipLineWidth = textWidth;
        }
      });
      toolTipWidth += maxTipLineWidth;

      var startX;
      if (x > chartContentWidth / 2) {
        startX = x - this.highLightRadius - toolTipWidth;
      } else {
        startX = x + this.highLightRadius;
      }
      var startY = y - toolTipHeight;
      if (startY < chartPaddingTop) {
        startY = y;
      }
      if (startY > chartContentHeight + chartPaddingTop) {
        startY = chartContentHeight + chartPaddingTop - toolTipHeight;
      }

      canvas.setFillStyle(toolTipBackgroundColor);
      canvas.beginPath();
      canvas.fillRect(startX, startY, toolTipWidth, toolTipHeight);
      canvas.closePath();

      canvas.setFillStyle(toolTipSplitLineColor);
      canvas.setStrokeStyle(toolTipSplitLineColor);
      canvas.setLineWidth(toolTipSplitLineWidth);
      canvas.setFontSize(toolTipFontSize);

      var drawX = startX + toolTipPadding;
      var drawY = startY + toolTipPadding + toolTipFontSize;

      canvas.fillText(highLightData.title, drawX, drawY);
      drawY += toolTipTextPadding + toolTipSplitLineWidth / 2;
      canvas.beginPath();
      canvas.moveTo(drawX - toolTipPadding * 0.25, drawY);
      canvas.lineTo(drawX + toolTipWidth - toolTipPadding * 1.75, drawY);
      canvas.stroke();
      canvas.closePath();

      highLightData.data.map(function (text, index) {
        drawY += toolTipTextPadding + toolTipFontSize;
        canvas.fillText(text, drawX, drawY);
      });
    }
  }, {
    key: 'drawRefs',
    value: function drawRefs(canvas) {
      var _this2 = this;

      var maxValue = this.maxValue;
      var minValue = this.minValue;
      var maxXValue = this.maxXValue;
      var minXValue = this.minXValue;
      var axisFontSize = this.axisFontSize;
      var axisLineWidth = this.axisLineWidth;
      var axisValuePadding = this.axisValuePadding;
      var dashedLineWidth = this.dashedLineWidth;
      var chartPaddingLeft = this.chartPaddingLeft;
      var chartPaddingRight = this.chartPaddingRight;
      var chartPaddingTop = this.chartPaddingTop;
      var chartPaddingBottom = this.chartPaddingBottom;

      var chartContentHeight = this.getChartContentHeight();
      var chartContentWidth = this.getChartContentWidth();

      this.xRefs.map(function (ref, index) {
        var x = chartPaddingLeft + chartContentWidth / (maxXValue - minXValue) * (ref.value - minXValue);

        canvas.setLineWidth(axisLineWidth);
        canvas.setStrokeStyle(ref.color);
        _this2.drawDashedLine(canvas, x, chartPaddingTop, x, _this2.height - chartPaddingBottom, dashedLineWidth);

        if (_this2.axisEnable) {
          var labelYOffset = index * (axisFontSize + axisValuePadding * 1.5);
          var labelWidth = canvas.myMeasureText(ref.label, axisFontSize);

          var leftX = x - labelWidth - axisValuePadding * 2;
          var centerX = x - axisValuePadding;
          var rightX = x;
          var topY = _this2.height - chartPaddingBottom - labelYOffset - axisFontSize / 2 - axisValuePadding / 2;
          var centerY = _this2.height - chartPaddingBottom - labelYOffset;
          var bottomY = _this2.height - chartPaddingBottom - labelYOffset + axisFontSize / 2 + axisValuePadding / 2;

          canvas.beginPath();
          canvas.moveTo(leftX, topY);
          canvas.lineTo(centerX, topY);
          canvas.lineTo(rightX, centerY);
          canvas.lineTo(centerX, bottomY);
          canvas.lineTo(leftX, bottomY);
          canvas.lineTo(leftX, topY);
          canvas.setFillStyle(ref.color);
          canvas.fill();
          canvas.closePath();

          ref.left = leftX;
          ref.top = topY;
          ref.centerY = centerY;
          ref.right = rightX;
          ref.bottom = bottomY;

          canvas.setFillStyle('white');
          canvas.setFontSize(axisFontSize);
          canvas.fillText(ref.label, leftX + axisValuePadding / 2, topY + axisValuePadding / 2 + axisFontSize);
        }
      });

      this.y1Refs.map(function (ref, index) {
        var y = _this2.height - chartPaddingBottom - chartContentHeight / (maxValue - minValue) * (ref.value - minValue);

        canvas.setLineWidth(axisLineWidth);
        canvas.setStrokeStyle(ref.color);
        _this2.drawDashedLine(canvas, chartPaddingLeft, y, _this2.width - chartPaddingRight, y, dashedLineWidth);

        if (_this2.axisEnable) {
          var labelWidth = canvas.myMeasureText(ref.label, axisFontSize);

          var leftX = chartPaddingLeft - axisValuePadding * 2 - labelWidth;
          var centerX = chartPaddingLeft - axisValuePadding * 1.5;
          var rightX = chartPaddingLeft;
          var topY = y - axisFontSize / 2 - axisValuePadding / 2;
          var centerY = y;
          var bottomY = y + axisFontSize / 2 + axisValuePadding / 2;

          canvas.beginPath();
          canvas.moveTo(leftX, topY);
          canvas.lineTo(centerX, topY);
          canvas.lineTo(rightX, centerY);
          canvas.lineTo(centerX, bottomY);
          canvas.lineTo(leftX, bottomY);
          canvas.lineTo(leftX, topY);
          canvas.setFillStyle(ref.color);
          canvas.fill();
          canvas.closePath();

          ref.left = leftX;
          ref.top = topY;
          ref.centerY = centerY;
          ref.right = rightX;
          ref.bottom = bottomY;

          canvas.setFillStyle('white');
          canvas.setFontSize(axisFontSize);
          canvas.fillText(ref.label, leftX + axisValuePadding / 2, topY + axisValuePadding / 2 + axisFontSize);
        }
      });
    }
  }, {
    key: 'drawDashedLine',
    value: function drawDashedLine(canvas, x1, y1, x2, y2, dashLength) {
      var deltaX = Math.abs(x2 - x1);
      var deltaY = Math.abs(y2 - y1);
      var numDashes = Math.floor(Math.sqrt(deltaX * deltaX + deltaY * deltaY) / dashLength);
      canvas.beginPath();
      for (var i = 0; i < numDashes; ++i) {
        canvas[i % 2 === 0 ? 'moveTo' : 'lineTo'](x1 + deltaX / numDashes * i, y1 + deltaY / numDashes * i);
      }
      canvas.stroke();
      canvas.closePath();
    }
  }, {
    key: 'drawAxis',
    value: function drawAxis(canvas) {
      var y1Ticks = this.y1Ticks;
      var yLabelCount = y1Ticks.length - 1;
      var maxValue = this.maxValue;
      var minValue = this.minValue;
      var xTicks = this.xTicks;
      var xLabelCount = xTicks.length - 1;
      var maxXValue = this.maxXValue;
      var minXValue = this.minXValue;
      var axisFontSize = this.axisFontSize;
      var axisValuePadding = this.axisValuePadding;
      var chartPaddingLeft = this.chartPaddingLeft;
      var chartPaddingRight = this.chartPaddingRight;
      var chartPaddingTop = this.chartPaddingTop;
      var chartPaddingBottom = this.chartPaddingBottom;

      var chartContentHeight = this.getChartContentHeight();
      var chartContentWidth = this.getChartContentWidth();

      var axisLineColor = this.axisLineColor;
      var axisFontColor = this.axisFontColor;
      var axisLineWidth = this.axisLineWidth;

      canvas.setStrokeStyle(axisLineColor);
      canvas.setFillStyle(axisFontColor);
      canvas.setLineWidth(axisLineWidth);
      canvas.setLineJoin('miter');
      canvas.beginPath();
      canvas.moveTo(chartPaddingLeft, chartPaddingTop);
      canvas.lineTo(chartPaddingLeft, this.height - chartPaddingBottom);
      canvas.stroke();

      var preYItemStep = chartContentHeight / yLabelCount;
      var preYItemValue = (maxValue - minValue) / yLabelCount;
      canvas.setFontSize(axisFontSize);
      for (var y = 0; y <= yLabelCount; y++) {
        var itemPosition = chartPaddingTop + preYItemStep * y;

        canvas.beginPath();
        canvas.moveTo(chartPaddingLeft, itemPosition);
        canvas.lineTo(this.width - chartPaddingRight, itemPosition);
        canvas.stroke();

        var axisItemText = y1Ticks[yLabelCount - y];
        var axisItemTextWidth = canvas.myMeasureText(axisItemText, axisFontSize);
        canvas.fillText(axisItemText, chartPaddingLeft - axisItemTextWidth - axisValuePadding, itemPosition + axisFontSize / 2);
      }

      var preXItemStep = chartContentWidth / xLabelCount;
      var preXItemValue = (maxXValue - minXValue) / xLabelCount;
      for (var x = 0; x <= xLabelCount; x++) {
        var itemPosition = chartPaddingLeft + preXItemStep * x;

        canvas.beginPath();
        canvas.moveTo(itemPosition, this.height - chartPaddingBottom);
        canvas.lineTo(itemPosition, this.height - chartPaddingBottom + axisValuePadding * 3 / 4);
        canvas.stroke();

        var axisItemText = xTicks[x];
        var axisItemTextWidth = canvas.myMeasureText(axisItemText, axisFontSize);
        canvas.fillText(axisItemText, itemPosition - axisItemTextWidth / 2, this.height - chartPaddingBottom + axisValuePadding + axisFontSize);
      }
    }
  }, {
    key: 'drawLegend',
    value: function drawLegend(canvas) {
      var chartPaddingLeft = this.chartPaddingLeft;
      var chartPaddingRight = this.chartPaddingRight;
      var legendFontSize = this.legendFontSize;
      var legendPadding = this.legendPadding;
      var legendTextColor = this.legendTextColor;

      canvas.setFontSize(legendFontSize);

      var legendWidth = 0;
      var isMultiLine = false;
      for (var i = 0; i < this.data.length; i++) {
        var slice = this.data[i];
        if (legendWidth > 0) {
          legendWidth += legendFontSize;
        }

        legendWidth += canvas.myMeasureText(slice.name, legendFontSize) + legendFontSize * 1.2;
        if (legendWidth > this.getChartContentWidth()) {
          isMultiLine = true;
        }
      }

      this.legendWidth = legendWidth;
      this.isMultiLine = isMultiLine;

      if (!isMultiLine) {
        var startX = (this.width - legendWidth) / 2;
        var startY = this.height - legendPadding - legendFontSize;
        for (var i = 0; i < this.data.length; i++) {
          var slice = this.data[i];
          var textWidth = canvas.myMeasureText(slice.name, legendFontSize);
          if (startX + textWidth + legendFontSize * 1.2 > this.width - chartPaddingRight) {
            startX = chartPaddingLeft;
            startY += legendFontSize * 1.5;
          }

          var seriesColor = this.getColor(i);
          canvas.setFillStyle(seriesColor);
          canvas.beginPath();
          canvas.arc(startX + legendFontSize / 2, startY + legendFontSize / 2, legendFontSize / 2, 0, 2 * Math.PI);
          canvas.fill();
          canvas.closePath();

          startX += legendFontSize * 1.2;
          if (this.isHiddenSeries(i)) {
            canvas.setFillStyle(seriesColor);
          } else {
            canvas.setFillStyle(legendTextColor);
          }
          canvas.fillText(slice.name, startX, startY + legendFontSize);

          startX += textWidth + legendFontSize;
        }
      } else {
        var startX = chartPaddingLeft;
        var startY = this.height - legendPadding - legendFontSize;

        if (startX + legendFontSize * 1.2 * this.data.length > this.width) {
          //legend数量过多
          canvas.setFillStyle(this.getColor(0));
          canvas.fillRect(startX, startY, legendFontSize, legendFontSize);
          startX += legendFontSize * 1.2;

          var betweenText = "~";
          var btwTextWidth = canvas.myMeasureText(betweenText, legendFontSize);
          canvas.setFillStyle(legendTextColor);
          canvas.fillText(betweenText, startX, startY + legendFontSize);
          startX += btwTextWidth + legendFontSize * 0.2;

          canvas.setFillStyle(this.getColor(this.data.length - 1));
          canvas.fillRect(startX, startY, legendFontSize, legendFontSize);
          startX += legendFontSize * 1.2;
        } else {
          for (var i = 0; i < this.data.length; i++) {
            var slice = this.data[i];
            canvas.setFillStyle(this.getColor(i));
            canvas.fillRect(startX, startY, legendFontSize, legendFontSize);
            startX += legendFontSize * 1.2;
          }
        }
        startX += legendFontSize * 0.3;
        var simpleText = this.data[0].name + " ~ " + this.data[this.data.length - 1].name;
        var spTextWidth = canvas.myMeasureText(simpleText, legendFontSize);
        canvas.setFillStyle(legendTextColor);
        canvas.fillText(simpleText, startX, startY + legendFontSize);
      }
    }
  }, {
    key: 'drawNoData',
    value: function drawNoData(canvas) {
      var text = this.noDataText;
      var textWidth = canvas.myMeasureText(text, this.noDataFontSize);
      canvas.setFillStyle(this.noDataTextColor);
      canvas.fillText(text, (this.width - textWidth) / 2, (this.height + this.noDataFontSize) / 2);
    }
  }]);
  return Scatter;
}();

var scatter = Scatter;

var Animation$3 = chartUtil.Animation;

var Mix = function () {
  function Mix(opts) {
    var _this = this;

    classCallCheck(this, Mix);

    console.log(opts);

    this.canvas = opts.canvas;
    this.width = opts.width;
    this.height = opts.height;
    this.chartPaddingLeft = opts.chartPaddingLeft || 40;
    this.chartPaddingRight = opts.chartPaddingRight || 40;
    this.chartPaddingTop = opts.chartPaddingTop || 40;
    this.chartPaddingBottom = opts.chartPaddingBottom || 40;

    this.drawWithAnimation = opts.drawWithAnimation === undefined ? true : opts.drawWithAnimation;

    this.noData = opts.noData || false;
    this.noDataText = opts.noDataText || '暂无数据';
    this.noDataTextColor = opts.noDataTextColor || '#69B5FC';
    this.noDataFontSize = opts.noDataFontSize || 11;
    this.data = opts.data;

    this.highLightIndex = -1;
    this.highLightColor = 'rgba(0, 0, 0, 0.3)';
    this.isHorizontal = opts.isHorizontal || false;

    this.drawDataLabel = opts.drawDataLabel || false;
    // right left bottom top outside center middle
    this.dataLabelPosition = opts.dataLabelPosition || 'outside';
    this.drawExtraDataLabel = opts.drawExtraDataLabel || false;
    this.extraDatalabelPosition = opts.extraDatalabelPosition || 'outside';
    this.datalabelCallBack = opts.datalabelCallBack || function () {
      return '';
    };
    this.dataLabelFontSize = opts.dataLabelFontSize || 8;
    this.dataLabelPadding = opts.dataLabelPadding || 4;
    this.dataLabelColor = opts.dataLabelColor || '#111111';

    this.axisEnable = opts.axisEnable || false;
    this.axisFontSize = opts.axisFontSize || 10;
    this.axisValuePadding = opts.axisValuePadding || 5;
    this.axisLineWidth = opts.axisLineWidth || 1;
    this.axisLineColor = opts.axisLineColor || '#dddddd';
    this.axisFontColor = opts.axisFontColor || '#444444';

    this.dashedLineWidth = opts.dashedLineWidth || 6;

    this.legendEnable = opts.legendEnable || false;
    this.legendFontSize = opts.legendFontSize || 10;
    this.legendPadding = opts.legendPadding || 5;
    this.legendTextColor = opts.legendTextColor || '#000000';

    this.tooltipCallBack = opts.tooltipCallBack || function () {
      return '';
    };
    this.toolTipBackgroundColor = opts.toolTipBackgroundColor || 'rgba(0, 0, 0, 0.6)';
    this.toolTipPadding = opts.toolTipPadding || 10;
    this.toolTipTextPadding = opts.toolTipTextPadding || 8;
    this.toolTipFontSize = opts.toolTipFontSize || 10;
    this.toolTipSplitLineWidth = opts.toolTipSplitLineWidth || 1;
    this.toolTipSplitLineColor = opts.toolTipSplitLineColor || '#ffffff';

    this.muteCallback = opts.muteCallback || function () {
      return '';
    };
    this.seriesStatus = opts.seriesStatus;

    this.maxValue = opts.maxValue;
    this.minValue = opts.minValue;
    this.maxSecondaryValue = opts.maxSecondaryValue;
    this.minSecondaryValue = opts.minSecondaryValue;
    this.secondaryAxisEnable = opts.secondaryAxisEnable || false;
    this.xAxisData = opts.xAxisData;
    this.xLabelCount = opts.xLabelCount || 5;

    this.circleRadius = opts.circleRadius || 3;
    this.lineWidth = opts.lineWidth || 2;
    this.bulletWidth = opts.bulletWidth || 3;

    var colors = ['#7cb5ec', '#f7a35c', '#434348', '#90ed7d', '#f15c80', '#8085e9', '#E4D354', '#2B908F', '#F45B5B', '#91E8E1', '#7CB5EC', '#434348'];
    this.colors = opts.colors && opts.colors.slice() || colors;
    this.drawOrder = opts.drawOrder && opts.drawOrder.slice() || [];
    this.y1Refs = opts.y1Refs || [];
    this.y2Refs = opts.y2Refs || [];
    this.y1Ticks = opts.y1Ticks || [];
    this.y2Ticks = opts.y2Ticks || [];

    if (this.axisEnable) {
      if (this.isHorizontal) {
        //计算x渲染高度碰撞
        var xAxisData = this.xAxisData;
        var xAxisSize = xAxisData.length;
        var preBarWidth = this.getContentWidth() / (xAxisSize + 0.2);
        var step = 1;
        if (preBarWidth <= this.axisFontSize) {
          step = Math.floor(this.axisFontSize / preBarWidth) + (this.axisFontSize % preBarWidth > 0 ? 1 : 0);
        }
        var maxXAxisWidth = 0;
        for (var i = 0; i < xAxisSize; i++) {
          if (i * step >= xAxisSize) {
            break;
          }
          var labelWidth = this.canvas.myMeasureText(xAxisData[i], this.axisFontSize);
          if (maxXAxisWidth < labelWidth) {
            maxXAxisWidth = labelWidth;
          }
        }
        maxXAxisWidth += this.axisValuePadding * 2;
        if (this.chartPaddingLeft < maxXAxisWidth) {
          this.chartPaddingLeft = maxXAxisWidth;
        }
      } else {
        var maxY1Width = 0;
        this.y1Ticks.map(function (label, i) {
          var labelWidth = _this.canvas.myMeasureText(label, _this.axisFontSize);
          if (maxY1Width < labelWidth) {
            maxY1Width = labelWidth;
          }
        });
        maxY1Width += this.axisValuePadding * 2;
        if (this.chartPaddingLeft < maxY1Width) {
          this.chartPaddingLeft = maxY1Width;
        }

        var maxY2Width = 0;
        this.y2Ticks.map(function (label, i) {
          var labelWidth = _this.canvas.myMeasureText(label, _this.axisFontSize);
          if (maxY2Width < labelWidth) {
            maxY2Width = labelWidth;
          }
        });
        maxY2Width += this.axisValuePadding * 2;
        if (this.chartPaddingRight < maxY2Width) {
          this.chartPaddingRight = maxY2Width;
        }
      }
    }

    this.draw();
  }

  createClass(Mix, [{
    key: 'getColor',
    value: function getColor(index) {
      if (this.isHiddenSeries(index)) {
        return '#cccccc';
      }
      if (this.drawOrder && this.drawOrder.length && index < this.drawOrder.length) {
        index = this.drawOrder[index];
      }
      return this.colors[index % this.colors.length];
    }
  }, {
    key: 'isHiddenSeries',
    value: function isHiddenSeries(index) {
      return this.seriesStatus && this.seriesStatus[index];
    }
  }, {
    key: 'getCurrentDataIndex',
    value: function getCurrentDataIndex(e) {
      var index = this.calculateClickPosition(e);
      return index;
    }
  }, {
    key: 'getChartContentHeight',
    value: function getChartContentHeight() {
      return this.height - this.chartPaddingTop - this.chartPaddingBottom;
    }
  }, {
    key: 'getChartContentWidth',
    value: function getChartContentWidth() {
      return this.width - this.chartPaddingLeft - this.chartPaddingRight;
    }
  }, {
    key: 'getContentWidth',
    value: function getContentWidth() {
      return this.isHorizontal ? this.getChartContentHeight() : this.getChartContentWidth();
    }
  }, {
    key: 'getContentHeight',
    value: function getContentHeight() {
      return this.isHorizontal ? this.getChartContentWidth() : this.getChartContentHeight();
    }
  }, {
    key: 'calculateClickPosition',
    value: function calculateClickPosition(e) {
      var isMove = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;

      if (this.noData || this.process != 1) {
        return null;
      }
      if (e.touches && e.touches.length) {
        var x = e.touches[0].x;
        var y = e.touches[0].y;

        var chartPaddingLeft = this.chartPaddingLeft;
        var chartPaddingRight = this.chartPaddingRight;
        var chartPaddingTop = this.chartPaddingTop;
        var chartPaddingBottom = this.chartPaddingBottom;
        var legendPadding = this.legendPadding;
        var legendFontSize = this.legendFontSize;
        var chartContentHeight = this.getChartContentHeight();
        var chartContentWidth = this.getChartContentWidth();
        var contentWidth = this.getContentWidth();

        for (var i = 0; i < this.y1Refs.length; i++) {
          var ref = this.y1Refs[i];
          if (x >= ref.left && x <= ref.right && y >= ref.top && y <= ref.bottom) {
            if (this.highLightX == ref.right && this.highLightY == ref.centerY && this.highLightData && !isMove) {
              //same label
              this.highLightIndex = -1;
              this.highLightData = null;
            } else {
              this.highLightData = {
                title: ref.name,
                data: ['' + ref.label]
              };
              this.highLightIndex = -1;
              this.highLightX = ref.right;
              this.highLightY = ref.centerY;
              this.highLightRadius = 0;
            }
            this.draw(false);
            return null;
          }
        }

        for (var i = 0; i < this.y2Refs.length; i++) {
          var ref = this.y2Refs[i];
          if (x >= ref.left && x <= ref.right && y >= ref.top && y <= ref.bottom) {
            if ((this.isHorizontal ? this.highLightX == ref.centerX && this.highLightY == ref.bottom : this.highLightX == ref.left && this.highLightY == ref.centerY) && this.highLightData && !isMove) {
              //same label
              this.highLightIndex = -1;
              this.highLightData = null;
            } else {
              this.highLightData = {
                title: ref.name,
                data: ['' + ref.label]
              };
              this.highLightIndex = -1;
              if (this.isHorizontal) {
                this.highLightX = ref.centerX;
                this.highLightY = ref.bottom;
              } else {
                this.highLightX = ref.left;
                this.highLightY = ref.centerY;
              }
              this.highLightRadius = 0;
            }
            this.draw(false);
            return null;
          }
        }

        if (x >= chartPaddingLeft && x <= this.width - chartPaddingRight && y >= chartPaddingTop && y <= this.height - chartPaddingBottom) {
          var size = this.xAxisData.length;
          var preBarWidth = contentWidth / (size + 0.2);
          var highLightPosition = -1;
          for (var i = 0; i < size; i++) {
            if (this.isHorizontal) {
              var startY = chartPaddingTop + preBarWidth * i;
              var endY = startY + preBarWidth;

              if (i == 0 && y <= endY || y <= endY && y >= startY || i == size - 1 && y >= startY) {
                if (highLightPosition == i && !isMove) {
                  highLightPosition = -1;
                } else {
                  highLightPosition = i;
                }
                break;
              }
            } else {
              var startX = chartPaddingLeft + preBarWidth * i;
              var endX = startX + preBarWidth;

              if (i == 0 && x <= endX || x <= endX && x >= startX || i == size - 1 && x >= startX) {
                if (highLightPosition == i && !isMove) {
                  highLightPosition = -1;
                } else {
                  highLightPosition = i;
                }
                break;
              }
            }
          }
          return highLightPosition;
        }

        if (isMove) {
          return -1;
        }

        if (x > chartPaddingLeft && x < this.width - chartPaddingRight && y > chartContentHeight - legendFontSize && y < this.height) {
          var legendWidth = this.legendWidth;
          var isMultiLine = this.isMultiLine;

          if (!isMultiLine) {
            var startX = (this.width - legendWidth) / 2;

            if (x >= startX && x <= this.width - startX) {
              for (var i = 0; i < this.legendList.length; i++) {
                var textWidth = this.canvas.myMeasureText(this.legendList[i], legendFontSize);
                if (x < startX + textWidth + legendFontSize * 2.2) {
                  var chartInfo = this.muteCallback(this.drawOrder[i]);
                  this.data = chartInfo.data;
                  this.seriesStatus = chartInfo.seriesStatus;
                  this.draw(true, false);
                  break;
                }
                startX += legendFontSize * 2.2 + textWidth;
              }
            }
          } else {
            var startX = chartPaddingLeft;

            if (startX + legendFontSize * 1.2 * this.legendList.length <= this.width) {
              for (var i = 0; i < this.legendList.length; i++) {
                if (x < startX + legendFontSize * 1.2) {
                  var chartInfo = this.muteCallback(this.drawOrder[i]);
                  this.data = chartInfo.data;
                  this.seriesStatus = chartInfo.seriesStatus;
                  this.draw(true, false);
                  break;
                }
                startX += legendFontSize * 1.2;
              }
            }
          }
        }

        return -1;
      }
      return -1;
    }
  }, {
    key: 'getCurrentHighLightIndex',
    value: function getCurrentHighLightIndex() {
      return this.highLightIndex;
    }
  }, {
    key: 'showToolTip',
    value: function showToolTip(e) {
      var isMove = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;

      var index = this.calculateClickPosition(e, isMove);
      if (index == null) {
        return;
      }
      if (this.highLightIndex == index && index == -1) {
        if (this.highLightData) {
          this.highLightData = null;
          this.draw(false);
        }
        return;
      }
      if (this.highLightIndex == index && !isMove) {
        this.highLightIndex = -1;
        this.highLightData = null;
      } else if (this.highLightIndex == index && this.highLightY && Math.abs(this.highLightY - e.touches[0].y) < 10) {
        console.log('移动间距小于10, 不进行渲染');
        return;
      } else {
        this.highLightIndex = index;

        if (index != -1) {
          var highLightData = this.tooltipCallBack(index);
          this.highLightData = highLightData;
          this.highLightY = e.touches[0].y;
          this.highLightX = e.touches[0].x;
        } else {
          this.highLightData = null;
        }
      }
      this.draw(false);
    }
  }, {
    key: 'hiddenHighLight',
    value: function hiddenHighLight() {
      if (this.highLightIndex == -1) {
        return;
      }
      this.highLightIndex = -1;
      this.draw(false);
    }
  }, {
    key: 'draw',
    value: function draw() {
      var isAnimation = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : true;
      var animationWithLegend = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : true;

      this.isDrawFinish = false;
      var canvas = this.canvas;

      if (this.noData) {
        this.drawNoData(canvas);
        canvas.draw();
        this.isDrawFinish = true;
      } else {
        var that = this;
        var duration = isAnimation && this.drawWithAnimation ? 1000 : 0;
        var animation = new Animation$3({
          timing: 'linear',
          duration: duration,
          onProcess: function onProcess(process) {
            // console.time('mix draw')
            canvas.clearRect && canvas.clearRect(0, 0, that.width, that.height);
            that.process = process;
            that.dataLabels = [];

            if (that.axisEnable) {
              that.drawAxis(canvas);
            }

            that.drawLayerData(canvas);
            that.drawRefs(canvas);
            if ((that.drawDataLabel || that.drawExtraDataLabel) && process == 1) {
              that.drawDataLabelLayer(canvas);
            }
            that.drawToolTip(canvas);

            if (that.legendEnable) {
              if (!animationWithLegend) {
                that.drawLegend(canvas);
              } else if (process == 1) {
                that.drawLegend(canvas);
              }
            }
            canvas.draw();
            // console.timeEnd('mix draw')
          },
          onAnimationFinish: function onAnimationFinish() {
            that.isDrawFinish = true;
          }
        });
      }
    }
  }, {
    key: 'drawToolTip',
    value: function drawToolTip(canvas) {
      if (!this.highLightData) {
        return;
      }
      var chartPaddingLeft = this.chartPaddingLeft;
      var chartPaddingTop = this.chartPaddingTop;
      var isHorizontal = this.isHorizontal;
      var chartContentHeight = this.getChartContentHeight();
      var contentWidth = this.getContentWidth();
      var preItemWidth = contentWidth / (this.xAxisData.length + 0.2);
      var x, y;
      if (this.highLightIndex == -1) {
        x = this.highLightX;
        y = this.highLightY;
      } else {
        if (isHorizontal) {
          x = this.highLightX;
          y = chartPaddingTop + preItemWidth * (this.highLightIndex + 0.6);
        } else {
          x = chartPaddingLeft + preItemWidth * (this.highLightIndex + 0.6);
          y = this.highLightY;
        }
      }

      var toolTipBackgroundColor = this.toolTipBackgroundColor;
      var toolTipPadding = this.toolTipPadding;
      var toolTipTextPadding = this.toolTipTextPadding;
      var toolTipFontSize = this.toolTipFontSize;
      var toolTipSplitLineWidth = this.toolTipSplitLineWidth;
      var toolTipSplitLineColor = this.toolTipSplitLineColor;

      var toolTipWidth = toolTipPadding * 2;
      var toolTipHeight = toolTipPadding * 2;

      var highLightData = this.highLightData;

      //title
      var maxTipLineWidth = canvas.myMeasureText(highLightData.title, toolTipFontSize);
      toolTipHeight += toolTipFontSize + toolTipSplitLineWidth + toolTipTextPadding;
      highLightData.data.map(function (text, index) {
        toolTipHeight += toolTipFontSize + toolTipTextPadding;

        var textWidth = canvas.myMeasureText(text, toolTipFontSize);
        if (maxTipLineWidth < textWidth) {
          maxTipLineWidth = textWidth;
        }
      });
      toolTipWidth += maxTipLineWidth;

      var startX;
      if (isHorizontal) {
        if (this.highLightIndex == -1) {
          if (x > this.width / 2) {
            startX = x - toolTipWidth;
          } else {
            startX = x;
          }
        } else {
          if (x > this.width / 2) {
            startX = x - toolTipWidth - 20;
          } else {
            startX = x + 20;
          }
        }
      } else {
        if (this.highLightIndex == -1) {
          if (x > this.width / 2) {
            startX = x - toolTipWidth;
          } else {
            startX = x;
          }
        } else {
          if (x > this.width / 2) {
            startX = x - preItemWidth * 0.5 - toolTipWidth;
          } else {
            startX = x + preItemWidth * 0.5;
          }
        }
      }
      var startY = y - toolTipHeight / 2;
      if (startY < chartPaddingTop) {
        startY = chartPaddingTop;
      }
      if (startY + toolTipHeight > chartContentHeight + chartPaddingTop) {
        startY = chartContentHeight + chartPaddingTop - toolTipHeight;
      }

      canvas.setFillStyle(toolTipBackgroundColor);
      canvas.beginPath();
      canvas.fillRect(startX, startY, toolTipWidth, toolTipHeight);
      canvas.closePath();

      canvas.setFillStyle(toolTipSplitLineColor);
      canvas.setStrokeStyle(toolTipSplitLineColor);
      canvas.setLineWidth(toolTipSplitLineWidth);
      canvas.setFontSize(toolTipFontSize);

      var drawX = startX + toolTipPadding;
      var drawY = startY + toolTipPadding + toolTipFontSize;

      canvas.fillText(highLightData.title, drawX, drawY);
      drawY += toolTipTextPadding + toolTipSplitLineWidth / 2;
      canvas.beginPath();
      canvas.moveTo(drawX - toolTipPadding * 0.25, drawY);
      canvas.lineTo(drawX + toolTipWidth - toolTipPadding * 1.75, drawY);
      canvas.stroke();
      canvas.closePath();

      highLightData.data.map(function (text, index) {
        drawY += toolTipTextPadding + toolTipFontSize;
        canvas.fillText(text, drawX, drawY);
      });
    }
  }, {
    key: 'addDataLabel',
    value: function addDataLabel(label, x, y, labelWidth) {
      if (x + labelWidth > this.width - this.chartPaddingRight) {
        x = this.width - this.chartPaddingRight - labelWidth;
      }
      if (x < this.chartPaddingLeft) {
        x = this.chartPaddingLeft;
      }
      if (y > this.height - this.chartPaddingBottom) {
        y = this.height - this.chartPaddingBottom;
      }
      if (y - this.dataLabelFontSize < this.chartPaddingTop) {
        y = this.chartPaddingTop + this.dataLabelFontSize;
      }
      var left = x;
      var top = y - this.dataLabelFontSize;
      var right = x + labelWidth;
      var bottom = y;

      var currDataLabel = {
        label: label,
        left: left,
        top: top,
        right: right,
        bottom: bottom
      };

      var isCrash = false;
      for (var i = 0; i < this.dataLabels.length; i++) {
        var dataLabel = this.dataLabels[i];
        if (this.isRectCrash(currDataLabel, dataLabel)) {
          isCrash = true;
          break;
        }
      }
      if (!isCrash) {
        this.dataLabels.push(currDataLabel);
      }
    }
  }, {
    key: 'isRectCrash',
    value: function isRectCrash(a, b) {
      var left = Math.max(a.left, b.left);
      var top = Math.max(a.top, b.top);
      var right = Math.min(a.right, b.right);
      var bottom = Math.min(a.bottom, b.bottom);

      return left <= right && top <= bottom;
    }
  }, {
    key: 'drawDataLabelLayer',
    value: function drawDataLabelLayer(canvas) {
      canvas.setFontSize(this.dataLabelFontSize);
      canvas.setFillStyle(this.dataLabelColor);

      this.dataLabels.map(function (dataLabel, index) {
        canvas.fillText(dataLabel.label, dataLabel.left, dataLabel.bottom);
      });
    }
  }, {
    key: 'drawLayerData',
    value: function drawLayerData(canvas) {
      var that = this;
      var colorPosition = 0;
      this.data.map(function (layer, index) {
        var preGroupSize = layer.data == undefined || layer.data.length == 0 || layer.data[0].subData == undefined ? 1 : layer.data[0].subData.length;
        switch (layer.type) {
          case 'group':
            that.drawGroup(canvas, layer, colorPosition);
            break;
          case 'line':
            that.drawLine(canvas, layer, colorPosition);
            break;
          case 'point':
            that.drawLine(canvas, layer, colorPosition, false);
            break;
          case 'stack':
            that.drawStacked(canvas, layer, colorPosition);
            break;
          case 'percent':
            that.drawPercent(canvas, layer, colorPosition);
            break;
          case 'bullet':
            that.drawBullet(canvas, layer, colorPosition);
            preGroupSize = 2;
            break;
        }
        colorPosition += preGroupSize;
      });
    }
  }, {
    key: 'drawBullet',
    value: function drawBullet(canvas, layer, colorPosition) {
      var chartPaddingLeft = this.chartPaddingLeft;
      var chartPaddingTop = this.chartPaddingTop;
      var isHorizontal = this.isHorizontal;
      var chartContentHeight = this.getChartContentHeight();
      var chartContentWidth = this.getChartContentWidth();
      var contentWidth = this.getContentWidth();
      var process = this.process;
      var size = layer.data.length;
      var preBarWidth = contentWidth / (size + 0.2);

      var max = layer.isSecondary ? this.maxSecondaryValue : this.maxValue;
      var min = layer.isSecondary ? this.minSecondaryValue : this.minValue;
      var valueLen = max - min;

      var drawSize = size * process;

      var zeroPosition;
      if (isHorizontal) {
        zeroPosition = chartPaddingLeft + (0 - min) / valueLen * chartContentWidth;
      } else {
        zeroPosition = chartPaddingTop + (max - 0) / valueLen * chartContentHeight;
      }
      var zeroPositionOffset = zeroPosition * (1 - process);

      for (var i = 0; i < drawSize; i++) {
        var entry = layer.data[i];
        var lastItemIndex = entry.subData.length - 1;

        var barEntry = entry.subData[0];
        var targetEntry = entry.subData[lastItemIndex];

        if (isHorizontal) {
          if (barEntry != undefined && barEntry != null) {
            var startX = zeroPosition;
            var endX = (chartPaddingLeft + (barEntry - min) / valueLen * chartContentWidth) * process + zeroPositionOffset;
            if (endX < startX) {
              var tmp = endX;
              endX = startX;
              startX = tmp;
            }

            var startY = chartPaddingTop + preBarWidth * (i + 0.2 + 0.1);
            var endY = startY + preBarWidth * 0.6;

            canvas.setFillStyle(this.getColor(colorPosition));
            canvas.fillRect(startX, startY, endX - startX, endY - startY);

            if (this.highLightIndex == i) {
              canvas.setFillStyle(this.highLightColor);
              canvas.setStrokeStyle(this.highLightColor);
              canvas.fillRect(startX, startY, endX - startX, endY - startY);
            }

            if ((layer.isSecondary ? this.drawExtraDataLabel : this.drawDataLabel) && process == 1) {
              var label = this.datalabelCallBack(this.drawOrder[colorPosition], i, true);
              this.drawDataLabelPosition(label, layer.isSecondary, startX, endX, startY, endY);
            }
          }

          if (targetEntry != undefined && targetEntry != null) {
            var targetX = chartPaddingLeft + (targetEntry - min) / valueLen * chartContentWidth * process;
            var targetStartY = chartPaddingTop + preBarWidth * (i + 0.1 + 0.1);
            var targeEndY = targetStartY + preBarWidth * 0.8;

            canvas.setStrokeStyle(this.getColor(colorPosition + 1));
            canvas.setLineWidth(this.bulletWidth);
            canvas.beginPath();
            canvas.moveTo(targetX, targetStartY);
            canvas.lineTo(targetX, targeEndY);
            canvas.stroke();
            canvas.beginPath();

            if (this.highLightIndex == i) {
              canvas.setFillStyle(this.highLightColor);
              canvas.setStrokeStyle(this.highLightColor);
              canvas.beginPath();
              canvas.moveTo(targetX, targetStartY);
              canvas.lineTo(targetX, targeEndY);
              canvas.stroke();
              canvas.beginPath();
            }
          }
        } else {
          if (barEntry != undefined && barEntry != null) {
            var startX = chartPaddingLeft + preBarWidth * (i + 0.2 + 0.1);
            var endX = startX + preBarWidth * 0.6;
            var startY = (chartPaddingTop + (max - barEntry) / valueLen * chartContentHeight) * process + zeroPositionOffset;
            var endY = zeroPosition;
            if (endY < startY) {
              var tmp = endY;
              endY = startY;
              startY = tmp;
            }

            canvas.setFillStyle(this.getColor(colorPosition));
            canvas.fillRect(startX, startY, endX - startX, endY - startY);

            if (this.highLightIndex == i) {
              canvas.setFillStyle(this.highLightColor);
              canvas.setStrokeStyle(this.highLightColor);
              canvas.fillRect(startX, startY, endX - startX, endY - startY);
            }

            if ((layer.isSecondary ? this.drawExtraDataLabel : this.drawDataLabel) && process == 1) {
              var label = this.datalabelCallBack(this.drawOrder[colorPosition], i, true);
              this.drawDataLabelPosition(label, layer.isSecondary, startX, endX, startY, endY);
            }
          }

          if (targetEntry != undefined && targetEntry != null) {
            var targetStartX = chartPaddingLeft + preBarWidth * (i + 0.1 + 0.1);
            var targetEndX = targetStartX + preBarWidth * 0.8;
            var targetY = (chartPaddingTop + (max - targetEntry) / valueLen * chartContentHeight) * process + zeroPositionOffset;

            canvas.setStrokeStyle(this.getColor(colorPosition + 1));
            canvas.setLineWidth(this.bulletWidth);
            canvas.beginPath();
            canvas.moveTo(targetStartX, targetY);
            canvas.lineTo(targetEndX, targetY);
            canvas.stroke();
            canvas.beginPath();

            if (this.highLightIndex == i) {
              canvas.setFillStyle(this.highLightColor);
              canvas.setStrokeStyle(this.highLightColor);
              canvas.beginPath();
              canvas.moveTo(targetStartX, targetY);
              canvas.lineTo(targetEndX, targetY);
              canvas.stroke();
              canvas.beginPath();
            }

            // if ((layer.isSecondary ? this.drawExtraDataLabel : this.drawDataLabel) && process == 1) {
            //   var label = this.datalabelCallBack(this.drawOrder[colorPosition + 1], i, true)
            //   this.drawDataLabelPosition(label, layer.isSecondary, startX, endX, startY, endY)
            // }
          }
        }
      }
    }
  }, {
    key: 'drawPercent',
    value: function drawPercent(canvas, layer, colorPosition) {
      var chartPaddingLeft = this.chartPaddingLeft;
      var chartPaddingTop = this.chartPaddingTop;
      var isHorizontal = this.isHorizontal;
      var chartContentHeight = this.getChartContentHeight();
      var chartContentWidth = this.getChartContentWidth();
      var contentWidth = this.getContentWidth();
      var process = this.process;
      var size = layer.data.length;
      var preBarWidth = contentWidth / (size + 0.2);

      var max = layer.isSecondary ? this.maxSecondaryValue : this.maxValue;
      var min = layer.isSecondary ? this.minSecondaryValue : this.minValue;
      var valueLen = max - min;

      var drawSize = size * process;

      var zeroPosition;
      if (isHorizontal) {
        zeroPosition = chartPaddingLeft + (0 - min) / valueLen * chartContentWidth;
      } else {
        zeroPosition = chartPaddingTop + (max - 0) / valueLen * chartContentHeight;
      }
      var zeroPositionOffset = zeroPosition * (1 - process);

      for (var i = 0; i < drawSize; i++) {
        var entry = layer.data[i];

        if (isHorizontal) {
          var negativeStartX = zeroPosition;
          var positiveStartX = negativeStartX;

          var startY = chartPaddingTop + preBarWidth * (i + 0.1 + 0.1);
          var endY = startY + preBarWidth * 0.8;

          var negativeHeight = (0 - min) / valueLen * chartContentWidth;
          var positiveHeight = (max - 0) / valueLen * chartContentWidth;

          if (entry.subData != undefined && entry.subData.length != 0) {
            var subSize = entry.subData.length;
            for (var j = 0; j < subSize; j++) {
              var itemIndex = j;
              var subEntry = entry.subData[itemIndex];
              if (!subEntry) {
                continue;
              }
              var startX, endX, subBarHeight;
              if (subEntry < 0) {
                startX = negativeStartX;
                subBarHeight = subEntry / entry.negativeSum * negativeHeight;
                endX = startX - subBarHeight;
                negativeStartX = negativeStartX - subBarHeight;
              } else {
                startX = positiveStartX;
                subBarHeight = subEntry / entry.positiveSum * positiveHeight;
                endX = startX + subBarHeight;
                positiveStartX = positiveStartX + subBarHeight;
              }
              startX = startX * process + zeroPositionOffset;
              endX = endX * process + zeroPositionOffset;
              if (endX < startX) {
                var tmp = endX;
                endX = startX;
                startX = tmp;
              }

              canvas.setFillStyle(this.getColor(colorPosition + itemIndex));
              canvas.fillRect(startX, startY, endX - startX, endY - startY);
              if (this.highLightIndex == i) {
                canvas.setFillStyle(this.highLightColor);
                canvas.fillRect(startX, startY, endX - startX, endY - startY);
              }

              if ((layer.isSecondary ? this.drawExtraDataLabel : this.drawDataLabel) && process == 1) {
                var label = this.datalabelCallBack(this.drawOrder[colorPosition + itemIndex], i, true);
                this.drawDataLabelPosition(label, layer.isSecondary, startX, endX, startY, endY);
              }
            }
          }
        } else {
          var startX = chartPaddingLeft + preBarWidth * (i + 0.1 + 0.1);
          var endX = startX + preBarWidth * 0.8;

          var negativeEndY = zeroPosition;
          var positiveEndY = negativeEndY;

          var negativeHeight = (0 - min) / valueLen * chartContentHeight;
          var positiveHeight = (max - 0) / valueLen * chartContentHeight;

          if (entry.subData != undefined && entry.subData.length != 0) {
            var subSize = entry.subData.length;
            for (var j = 0; j < subSize; j++) {
              var itemIndex = subSize - j - 1;
              var subEntry = entry.subData[itemIndex];
              if (!subEntry) {
                continue;
              }
              var endY;
              var subBarHeight;
              var startY;
              if (subEntry < 0) {
                endY = negativeEndY;
                subBarHeight = subEntry / entry.negativeSum * negativeHeight;
                startY = endY + subBarHeight;
                negativeEndY += subBarHeight;
              } else {
                endY = positiveEndY;
                subBarHeight = subEntry / entry.positiveSum * positiveHeight;
                startY = endY - subBarHeight;
                positiveEndY -= subBarHeight;
              }
              startY = startY * process + zeroPositionOffset;
              endY = endY * process + zeroPositionOffset;
              if (endY < startY) {
                var tmp = endY;
                endY = startY;
                startY = tmp;
              }

              canvas.setFillStyle(this.getColor(colorPosition + subSize - j - 1));
              canvas.fillRect(startX, startY, endX - startX, endY - startY);
              if (this.highLightIndex == i) {
                canvas.setFillStyle(this.highLightColor);
                canvas.fillRect(startX, startY, endX - startX, endY - startY);
              }

              if ((layer.isSecondary ? this.drawExtraDataLabel : this.drawDataLabel) && process == 1) {
                var label = this.datalabelCallBack(this.drawOrder[colorPosition + itemIndex], i, true);
                this.drawDataLabelPosition(label, layer.isSecondary, startX, endX, startY, endY);
              }
            }
          }
        }
      }
    }
  }, {
    key: 'drawStacked',
    value: function drawStacked(canvas, layer, colorPosition) {
      var chartPaddingLeft = this.chartPaddingLeft;
      var chartPaddingTop = this.chartPaddingTop;
      var isHorizontal = this.isHorizontal;
      var chartContentHeight = this.getChartContentHeight();
      var chartContentWidth = this.getChartContentWidth();
      var contentWidth = this.getContentWidth();
      var process = this.process;
      var size = layer.data.length;
      var preBarWidth = contentWidth / (size + 0.2);

      var max = layer.isSecondary ? this.maxSecondaryValue : this.maxValue;
      var min = layer.isSecondary ? this.minSecondaryValue : this.minValue;
      var valueLen = max - min;

      var drawSize = size * process;

      var zeroPosition;
      if (isHorizontal) {
        zeroPosition = chartPaddingLeft + (0 - min) / valueLen * chartContentWidth;
      } else {
        zeroPosition = chartPaddingTop + (max - 0) / valueLen * chartContentHeight;
      }
      var zeroPositionOffset = zeroPosition * (1 - process);

      for (var i = 0; i < drawSize; i++) {
        var entry = layer.data[i];

        if (isHorizontal) {
          var negativeStartX = zeroPosition;
          var positiveStartX = negativeStartX;

          var startY = chartPaddingTop + preBarWidth * (i + 0.1 + 0.1);
          var endY = startY + preBarWidth * 0.8;

          var negativeHeight = (0 - entry.negativeSum) / valueLen * chartContentWidth;
          var positiveHeight = (entry.positiveSum - 0) / valueLen * chartContentWidth;

          if (entry.subData != undefined && entry.subData.length != 0) {
            var subSize = entry.subData.length;
            for (var j = 0; j < subSize; j++) {
              var itemIndex = subSize - j - 1;
              var subEntry = entry.subData[itemIndex];
              if (!subEntry) {
                continue;
              }
              var startX, endX, subBarHeight;
              if (subEntry < 0) {
                startX = negativeStartX;
                subBarHeight = subEntry / entry.negativeSum * negativeHeight;
                endX = startX - subBarHeight;
                negativeStartX = negativeStartX - subBarHeight;
              } else {
                startX = positiveStartX;
                subBarHeight = subEntry / entry.positiveSum * positiveHeight;
                endX = startX + subBarHeight;
                positiveStartX = positiveStartX + subBarHeight;
              }
              startX = startX * process + zeroPositionOffset;
              endX = endX * process + zeroPositionOffset;
              if (endX < startX) {
                var tmp = endX;
                endX = startX;
                startX = tmp;
              }

              canvas.setFillStyle(this.getColor(colorPosition + itemIndex));
              canvas.fillRect(startX, startY, endX - startX, endY - startY);
              if (this.highLightIndex == i) {
                canvas.setFillStyle(this.highLightColor);
                canvas.fillRect(startX, startY, endX - startX, endY - startY);
              }

              if ((layer.isSecondary ? this.drawExtraDataLabel : this.drawDataLabel) && process == 1) {
                var label = this.datalabelCallBack(this.drawOrder[colorPosition + itemIndex], i, true);
                this.drawDataLabelPosition(label, layer.isSecondary, startX, endX, startY, endY);
              }
            }
          }
        } else {
          var startX = chartPaddingLeft + preBarWidth * (i + 0.1 + 0.1);
          var endX = startX + preBarWidth * 0.8;

          var negativeEndY = zeroPosition;
          var positiveEndY = negativeEndY;

          var negativeHeight = (0 - entry.negativeSum) / valueLen * chartContentHeight;
          var positiveHeight = (entry.positiveSum - 0) / valueLen * chartContentHeight;

          if (entry.subData != undefined && entry.subData.length != 0) {
            var subSize = entry.subData.length;
            for (var j = 0; j < subSize; j++) {
              var itemIndex = subSize - j - 1;
              var subEntry = entry.subData[itemIndex];
              if (!subEntry) {
                continue;
              }
              var endY;
              var subBarHeight;
              var startY;
              if (subEntry < 0) {
                endY = negativeEndY;
                subBarHeight = subEntry / entry.negativeSum * negativeHeight;
                startY = endY + subBarHeight;
                negativeEndY += subBarHeight;
              } else {
                endY = positiveEndY;
                subBarHeight = subEntry / entry.positiveSum * positiveHeight;
                startY = endY - subBarHeight;
                positiveEndY -= subBarHeight;
              }
              startY = startY * process + zeroPositionOffset;
              endY = endY * process + zeroPositionOffset;
              if (endY < startY) {
                var tmp = endY;
                endY = startY;
                startY = tmp;
              }

              canvas.setFillStyle(this.getColor(colorPosition + subSize - j - 1));
              canvas.fillRect(startX, startY, endX - startX, endY - startY);
              if (this.highLightIndex == i) {
                canvas.setFillStyle(this.highLightColor);
                canvas.fillRect(startX, startY, endX - startX, endY - startY);
              }

              if ((layer.isSecondary ? this.drawExtraDataLabel : this.drawDataLabel) && process == 1) {
                var label = this.datalabelCallBack(this.drawOrder[colorPosition + itemIndex], i, true);
                this.drawDataLabelPosition(label, layer.isSecondary, startX, endX, startY, endY);
              }
            }
          }
        }
      }
    }
  }, {
    key: 'drawLine',
    value: function drawLine(canvas, layer, colorPosition) {
      var drawPath = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : true;

      var chartPaddingLeft = this.chartPaddingLeft;
      var chartPaddingTop = this.chartPaddingTop;
      var chartPaddingBottom = this.chartPaddingBottom;
      var isHorizontal = this.isHorizontal;
      var chartContentHeight = this.getChartContentHeight();
      var chartContentWidth = this.getChartContentWidth();
      var contentWidth = this.getContentWidth();
      var process = this.process;
      var size = layer.data.length;
      var preItemWidth = contentWidth / (size + 0.2);

      var max = layer.isSecondary ? this.maxSecondaryValue : this.maxValue;
      var min = layer.isSecondary ? this.minSecondaryValue : this.minValue;
      var valueLen = max - min;

      var drawSize = size * process;

      var baseValue = min > 0 ? min : 0;
      var basePosition;
      if (isHorizontal) {
        basePosition = chartPaddingLeft + (baseValue - min) / valueLen * chartContentWidth;
      } else {
        basePosition = chartPaddingTop + (max - baseValue) / valueLen * chartContentHeight;
      }

      canvas.setLineWidth(this.lineWidth);

      var startLists = [];
      var subSize = layer.data[0].subData.length;
      for (var j = 0; j < subSize; j++) {
        for (var i = 0; i < drawSize; i++) {
          var entry = layer.data[i];
          var subEntry = entry.subData[j];

          if (subEntry == null || subEntry == undefined) {
            startLists[j * 2] = null;
            startLists[j * 2 + 1] = null;
            continue;
          }

          var color = this.getColor(colorPosition + j);
          canvas.setFillStyle(color);

          var x, y;
          if (isHorizontal) {
            x = chartPaddingLeft + (subEntry - baseValue) / valueLen * chartContentWidth * process;
            y = chartPaddingTop + preItemWidth * (i + 0.6);
          } else {
            x = chartPaddingLeft + preItemWidth * (i + 0.6);
            y = basePosition - (subEntry - baseValue) / valueLen * chartContentHeight * process;
          }

          canvas.beginPath();
          canvas.arc(x, y, this.circleRadius, 0, 2 * Math.PI);
          canvas.fill();
          canvas.closePath();
          if (i > 0 && drawPath) {
            var x1 = startLists[j * 2] || 0;
            var y1 = startLists[j * 2 + 1] || 0;

            if (x1 && y1) {
              canvas.setStrokeStyle(color);
              canvas.moveTo(x1, y1);
              canvas.lineTo(x, y);
              canvas.stroke();
            }
          }
          startLists[j * 2] = x;
          startLists[j * 2 + 1] = y;

          if ((layer.isSecondary ? this.drawExtraDataLabel : this.drawDataLabel) && process == 1) {
            var dataLabelPadding = this.dataLabelPadding;
            var dataLabelFontSize = this.dataLabelFontSize;

            var label = this.datalabelCallBack(this.drawOrder[colorPosition + j], i, true);
            var labelWidth = canvas.myMeasureText(label, dataLabelFontSize);
            this.addDataLabel(label, x - labelWidth / 2, y - dataLabelPadding, labelWidth);
          }
        }
      }

      if (this.highLightIndex >= 0) {
        var entry = layer.data[this.highLightIndex];
        var subSize = entry.subData.length;
        for (var j = 0; j < subSize; j++) {
          var subEntry = entry.subData[j];
          var x, y;
          if (isHorizontal) {
            x = chartPaddingLeft + (subEntry - baseValue) / valueLen * chartContentWidth * process;
            y = chartPaddingTop + preItemWidth * (this.highLightIndex + 0.6);
          } else {
            x = chartPaddingLeft + preItemWidth * (this.highLightIndex + 0.6);
            y = this.height - chartPaddingBottom - (subEntry - min) / valueLen * chartContentHeight * process;
          }

          canvas.setFillStyle(this.highLightColor);
          canvas.beginPath();
          canvas.arc(x, y, this.circleRadius * 1.5, 0, 2 * Math.PI);
          canvas.fill();
          canvas.closePath();
        }
      }
    }
  }, {
    key: 'drawGroup',
    value: function drawGroup(canvas, layer, colorPosition) {
      var chartPaddingLeft = this.chartPaddingLeft;
      var chartPaddingTop = this.chartPaddingTop;
      var isHorizontal = this.isHorizontal;
      var chartContentHeight = this.getChartContentHeight();
      var chartContentWidth = this.getChartContentWidth();
      var contentWidth = this.getContentWidth();
      var process = this.process;
      var size = layer.data.length;
      var preBarWidth = contentWidth / (size + 0.2);

      var max = layer.isSecondary ? this.maxSecondaryValue : this.maxValue;
      var min = layer.isSecondary ? this.minSecondaryValue : this.minValue;
      var valueLen = max - min;

      var drawSize = size * process;

      var zeroPosition;
      if (isHorizontal) {
        zeroPosition = chartPaddingLeft + (0 - min) / valueLen * chartContentWidth;
      } else {
        zeroPosition = chartPaddingTop + (max - 0) / valueLen * chartContentHeight;
      }
      var zeroPositionOffset = zeroPosition * (1 - process);

      for (var i = 0; i < drawSize; i++) {
        var entry = layer.data[i];

        var preGroupSize = entry.subData ? entry.subData.length : 0;
        if (preGroupSize == 0) {
          entry.subData = [entry.value];
        }

        var preSubBarWidth = preBarWidth * 0.8 / (preGroupSize + 0.2);
        for (var j = 0; j < preGroupSize; j++) {
          var subEntry = entry.subData[j];
          if (subEntry == null || subEntry == undefined) {
            continue;
          }
          var color = this.getColor(colorPosition + j);
          canvas.setFillStyle(color);

          if (isHorizontal) {
            var startX = zeroPosition;
            var endX = (chartPaddingLeft + (subEntry - min) / valueLen * chartContentWidth) * process + zeroPositionOffset;
            var startY = chartPaddingTop + preBarWidth * (i + 0.1 + 0.1) + preSubBarWidth * (j + 0.05 + 0.1);
            var endY = startY + preSubBarWidth * 0.85;

            if (endX < startX) {
              var tmp = endX;
              endX = startX;
              startX = tmp;
            }

            canvas.fillRect(startX, startY, endX - startX, endY - startY);
            if (this.highLightIndex == i) {
              canvas.setFillStyle(this.highLightColor);
              canvas.fillRect(startX, startY, endX - startX, endY - startY);
            }

            if ((layer.isSecondary ? this.drawExtraDataLabel : this.drawDataLabel) && process == 1) {
              var label = this.datalabelCallBack(this.drawOrder[colorPosition + j], i, true);
              this.drawDataLabelPosition(label, layer.isSecondary, startX, endX, startY, endY);
            }
          } else {
            var startX = chartPaddingLeft + preBarWidth * (i + 0.1 + 0.1) + preSubBarWidth * (j + 0.05 + 0.1);
            var endX = startX + preSubBarWidth * 0.85;
            var startY = (chartPaddingTop + (max - subEntry) / valueLen * chartContentHeight) * process + zeroPositionOffset;
            var endY = zeroPosition;

            if (endY < startY) {
              var tmp = endY;
              endY = startY;
              startY = tmp;
            }

            canvas.fillRect(startX, startY, endX - startX, endY - startY);
            if (this.highLightIndex == i) {
              canvas.setFillStyle(this.highLightColor);
              canvas.fillRect(startX, startY, endX - startX, endY - startY);
            }

            if ((layer.isSecondary ? this.drawExtraDataLabel : this.drawDataLabel) && process == 1) {
              var label = this.datalabelCallBack(this.drawOrder[colorPosition + j], i, true);
              this.drawDataLabelPosition(label, layer.isSecondary, startX, endX, startY, endY);
            }
          }
        }
      }
    }
  }, {
    key: 'drawDataLabelPosition',
    value: function drawDataLabelPosition(label, isSecondary, startX, endX, startY, endY) {
      var dataLabelPadding = this.dataLabelPadding;
      var dataLabelFontSize = this.dataLabelFontSize;

      var labelWidth = this.canvas.myMeasureText(label, dataLabelFontSize);
      var x;
      var y;
      if (this.isHorizontal) {
        y = (startY + endY + dataLabelFontSize) / 2;
        switch (isSecondary ? this.extraDatalabelPosition : this.dataLabelPosition) {
          case 'left':
            x = startX + dataLabelPadding;
            break;
          case 'right':
            x = endX - dataLabelPadding - labelWidth;
            break;
          case 'outside':
            x = endX + dataLabelPadding;
            break;
          case 'center':
            x = (startX + endX - labelWidth) / 2;
            break;
        }
        this.addDataLabel(label, x, y, labelWidth);
      } else {
        x = (startX + endX - labelWidth) / 2;
        switch (isSecondary ? this.extraDatalabelPosition : this.dataLabelPosition) {
          case 'bottom':
            y = endY - dataLabelPadding;
            break;
          case 'top':
            y = startY + dataLabelPadding + dataLabelFontSize;
            break;
          case 'outside':
            y = startY - dataLabelPadding;
            break;
          case 'middle':
            y = (startY + endY + dataLabelFontSize) / 2;
            break;
        }
      }
      this.addDataLabel(label, x, y, labelWidth);
    }
  }, {
    key: 'drawAxis',
    value: function drawAxis(canvas) {
      var process = this.process;
      var y1Ticks = this.y1Ticks;
      var y2Ticks = this.y2Ticks;
      var y1LabelCount = y1Ticks.length - 1;
      var y2LabelCount = y2Ticks.length - 1;
      var xLabelCount = this.xLabelCount;
      var xAxisData = this.xAxisData;
      var axisFontSize = this.axisFontSize;
      var axisValuePadding = this.axisValuePadding;
      var isHorizontal = this.isHorizontal;

      var chartPaddingLeft = this.chartPaddingLeft;
      var chartPaddingRight = this.chartPaddingRight;
      var chartPaddingTop = this.chartPaddingTop;
      var chartPaddingBottom = this.chartPaddingBottom;
      var chartContentHeight = this.getContentHeight();
      var chartContentWidth = this.getContentWidth();

      var axisLineColor = this.axisLineColor;
      var axisFontColor = this.axisFontColor;
      var axisLineWidth = this.axisLineWidth;

      canvas.setStrokeStyle(axisLineColor);
      canvas.setFillStyle(axisFontColor);
      canvas.setLineWidth(axisLineWidth);
      canvas.setLineJoin('miter');

      if (isHorizontal) {
        canvas.beginPath();
        canvas.moveTo(chartPaddingLeft, this.height - chartPaddingBottom);
        canvas.lineTo(this.width - chartPaddingRight, this.height - chartPaddingBottom);
        canvas.stroke();
        if (this.secondaryAxisEnable) {
          canvas.beginPath();
          canvas.moveTo(chartPaddingLeft, chartPaddingTop);
          canvas.lineTo(this.width - chartPaddingRight, chartPaddingTop);
          canvas.stroke();
        }
        var preYItemStep = chartContentHeight / y1LabelCount;
        canvas.setFontSize(axisFontSize);
        for (var y = 0; y <= y1LabelCount; y++) {
          var itemPosition = chartPaddingLeft + preYItemStep * y;

          var axisItemText = y1Ticks[y];
          var axisItemTextWidth = canvas.myMeasureText(axisItemText, axisFontSize);
          canvas.beginPath();
          canvas.moveTo(itemPosition, chartPaddingTop);
          canvas.lineTo(itemPosition, this.height - chartPaddingBottom);
          canvas.stroke();
          canvas.fillText(axisItemText, itemPosition - axisItemTextWidth / 2, this.height - chartPaddingBottom + axisValuePadding + axisFontSize);
        }
        if (this.secondaryAxisEnable) {
          var preYItemStep = chartContentHeight / y2LabelCount;
          for (var y = 0; y <= y2LabelCount; y++) {
            var itemPosition = chartPaddingLeft + preYItemStep * y;

            var axisItemText = y2Ticks[y];
            var axisItemTextWidth = canvas.myMeasureText(axisItemText, axisFontSize);
            if (y2LabelCount != y1LabelCount) {
              canvas.beginPath();
              canvas.moveTo(itemPosition, chartPaddingTop);
              canvas.lineTo(itemPosition, this.height - chartPaddingBottom);
              canvas.stroke();
            }
            canvas.fillText(axisItemText, itemPosition - axisItemTextWidth / 2, chartPaddingTop - axisValuePadding);
          }
        }

        //计算x渲染高度碰撞

        var xAxisSize = xAxisData.length;
        var preBarWidth = chartContentWidth / (xAxisSize + 0.2);
        var step = 1;
        if (preBarWidth <= axisFontSize) {
          step = Math.floor(axisFontSize / preBarWidth) + (axisFontSize % preBarWidth > 0 ? 1 : 0);
        }
        for (var i = 0; i < xAxisSize; i++) {
          if (i * step >= xAxisSize) {
            break;
          }
          var position = i * step;
          var label = xAxisData[position];
          var labelWidth = canvas.myMeasureText(label, axisFontSize);

          canvas.fillText(label, chartPaddingLeft - axisValuePadding - labelWidth, chartPaddingTop + preBarWidth * (position + 0.6) + axisFontSize / 2);
        }
      } else {
        canvas.beginPath();
        canvas.moveTo(chartPaddingLeft, chartPaddingTop);
        canvas.lineTo(chartPaddingLeft, this.height - chartPaddingBottom);
        canvas.stroke();
        if (this.secondaryAxisEnable) {
          canvas.beginPath();
          canvas.moveTo(this.width - chartPaddingRight, chartPaddingTop);
          canvas.lineTo(this.width - chartPaddingRight, this.height - chartPaddingBottom);
          canvas.stroke();
        }

        var preYItemStep = chartContentHeight / y1LabelCount;
        canvas.setFontSize(axisFontSize);
        for (var y = 0; y <= y1LabelCount; y++) {
          var itemPosition = chartPaddingTop + preYItemStep * y;

          var axisItemText = y1Ticks[y1LabelCount - y];
          var axisItemTextWidth = canvas.myMeasureText(axisItemText, axisFontSize);
          canvas.beginPath();
          canvas.moveTo(chartPaddingLeft, itemPosition);
          canvas.lineTo(this.width - chartPaddingRight, itemPosition);
          canvas.stroke();
          canvas.fillText(axisItemText, chartPaddingLeft - axisItemTextWidth - axisValuePadding, itemPosition + axisFontSize / 2);
        }
        if (this.secondaryAxisEnable) {
          var preYItemStep = chartContentHeight / y2LabelCount;
          for (var y = 0; y <= y2LabelCount; y++) {
            var itemPosition = chartPaddingTop + preYItemStep * y;

            var axisItemText = y2Ticks[y2LabelCount - y];
            var axisItemTextWidth = canvas.myMeasureText(axisItemText, axisFontSize);
            if (y2LabelCount != y1LabelCount) {
              canvas.beginPath();
              canvas.moveTo(chartPaddingLeft, itemPosition);
              canvas.lineTo(this.width - chartPaddingRight, itemPosition);
              canvas.stroke();
            }
            canvas.fillText(axisItemText, this.width - chartPaddingRight + axisValuePadding, itemPosition + axisFontSize / 2);
          }
        }

        var xAxisSize = xAxisData.length;
        var preBarWidth = chartContentWidth / (xAxisSize + 0.2);
        //计算x渲染宽度碰撞
        var step = 1;
        var labelWidthArray = [];
        var crashPadding = 5;
        for (; step < xAxisSize - 1; step++) {
          var lastLabelEnd = 0;
          var isCrash = false;
          for (var i = 0; i < xAxisSize; i += step) {
            var labelWidth = labelWidthArray[i];
            if (labelWidth == undefined) {
              labelWidth = canvas.myMeasureText(xAxisData[i], axisFontSize);
              labelWidthArray[i] = labelWidth;
            }
            var startX = preBarWidth * (i + 0.6) - labelWidth / 2;
            var endX = preBarWidth * (i + 0.6) + labelWidth / 2;

            if (lastLabelEnd == 0) {
              lastLabelEnd = endX;
            } else if (lastLabelEnd >= startX - crashPadding) {
              isCrash = true;
              break;
            } else {
              lastLabelEnd = endX;
            }
          }
          if (!isCrash) {
            break;
          }
        }
        for (var i = 0; i < xAxisSize; i++) {
          if (i * step >= xAxisSize) {
            break;
          }
          var position = i * step;
          var label = xAxisData[position];
          var labelWidth = labelWidthArray[position] || canvas.myMeasureText(label, axisFontSize);

          canvas.fillText(label, chartPaddingLeft + preBarWidth * (position + 0.6) - labelWidth / 2, this.height - chartPaddingBottom + axisValuePadding + axisFontSize);
        }
      }
    }
  }, {
    key: 'drawRefs',
    value: function drawRefs(canvas) {
      var _this2 = this;

      var maxValue = this.maxValue;
      var minValue = this.minValue;
      var maxSecondaryValue = this.maxSecondaryValue;
      var minSecondaryValue = this.minSecondaryValue;
      var axisFontSize = this.axisFontSize;
      var axisLineWidth = this.axisLineWidth;
      var axisValuePadding = this.axisValuePadding;
      var dashedLineWidth = this.dashedLineWidth;
      var chartPaddingLeft = this.chartPaddingLeft;
      var chartPaddingRight = this.chartPaddingRight;
      var chartPaddingTop = this.chartPaddingTop;
      var chartPaddingBottom = this.chartPaddingBottom;

      var chartContentHeight = this.getChartContentHeight();
      var chartContentWidth = this.getChartContentWidth();

      this.y1Refs.map(function (ref, index) {
        var leftX;
        var centerX;
        var rightX;
        var topY;
        var centerY;
        var bottomY;
        if (_this2.isHorizontal) {
          var x = chartPaddingLeft + chartContentWidth / (maxValue - minValue) * (ref.value - minValue);
          var labelYOffset = index * (axisFontSize + axisValuePadding * 1.5);

          canvas.setLineWidth(axisLineWidth);
          canvas.setStrokeStyle(ref.color);
          _this2.drawDashedLine(canvas, x, chartPaddingTop, x, _this2.height - chartPaddingBottom, dashedLineWidth);

          var labelWidth = canvas.myMeasureText(ref.label, axisFontSize);
          leftX = x - labelWidth - axisValuePadding * 2;
          centerX = x - axisValuePadding;
          rightX = x;
          topY = _this2.height - chartPaddingBottom - labelYOffset - axisFontSize / 2 - axisValuePadding / 2;
          centerY = _this2.height - chartPaddingBottom - labelYOffset;
          bottomY = _this2.height - chartPaddingBottom - labelYOffset + axisFontSize / 2 + axisValuePadding / 2;
        } else {
          var y = _this2.height - chartPaddingBottom - chartContentHeight / (maxValue - minValue) * (ref.value - minValue);

          canvas.setLineWidth(axisLineWidth);
          canvas.setStrokeStyle(ref.color);
          _this2.drawDashedLine(canvas, chartPaddingLeft, y, _this2.width - chartPaddingRight, y, dashedLineWidth);

          var labelWidth = canvas.myMeasureText(ref.label, axisFontSize);
          leftX = chartPaddingLeft - axisValuePadding * 2 - labelWidth;
          centerX = chartPaddingLeft - axisValuePadding * 1.5;
          rightX = chartPaddingLeft;
          topY = y - axisFontSize / 2 - axisValuePadding / 2;
          centerY = y;
          bottomY = y + axisFontSize / 2 + axisValuePadding / 2;
        }
        if (_this2.axisEnable) {
          canvas.beginPath();
          canvas.moveTo(leftX, topY);
          canvas.lineTo(centerX, topY);
          canvas.lineTo(rightX, centerY);
          canvas.lineTo(centerX, bottomY);
          canvas.lineTo(leftX, bottomY);
          canvas.lineTo(leftX, topY);
          canvas.setFillStyle(ref.color);
          canvas.fill();
          canvas.closePath();

          ref.left = leftX;
          ref.top = topY;
          ref.centerX = centerX;
          ref.centerY = centerY;
          ref.right = rightX;
          ref.bottom = bottomY;

          canvas.setFillStyle('white');
          canvas.setFontSize(axisFontSize);
          canvas.fillText(ref.label, leftX + axisValuePadding / 2, topY + axisValuePadding / 2 + axisFontSize);
        }
      });

      this.y2Refs.map(function (ref, index) {
        var leftX;
        var centerX;
        var rightX;
        var topY;
        var centerY;
        var bottomY;
        if (_this2.isHorizontal) {
          var x = chartPaddingLeft + chartContentWidth / (maxSecondaryValue - minSecondaryValue) * (ref.value - minSecondaryValue);
          var labelYOffset = index * (axisFontSize + axisValuePadding * 1.5);

          canvas.setLineWidth(axisLineWidth);
          canvas.setStrokeStyle(ref.color);
          _this2.drawDashedLine(canvas, x, chartPaddingTop, x, _this2.height - chartPaddingBottom, dashedLineWidth);

          var labelWidth = canvas.myMeasureText(ref.label, axisFontSize);
          leftX = x;
          centerX = x + axisValuePadding;
          rightX = x + labelWidth + axisValuePadding * 2;
          topY = chartPaddingTop + labelYOffset - axisFontSize / 2 - axisValuePadding / 2;
          centerY = chartPaddingTop + labelYOffset;
          bottomY = chartPaddingTop + labelYOffset + axisFontSize / 2 + axisValuePadding / 2;
        } else {
          var y = _this2.height - chartPaddingBottom - chartContentHeight / (maxSecondaryValue - minSecondaryValue) * (ref.value - minSecondaryValue);

          canvas.setLineWidth(axisLineWidth);
          canvas.setStrokeStyle(ref.color);
          _this2.drawDashedLine(canvas, chartPaddingLeft, y, _this2.width - chartPaddingRight, y, dashedLineWidth);

          var labelWidth = canvas.myMeasureText(ref.label, axisFontSize);
          leftX = _this2.width - chartPaddingRight;
          centerX = _this2.width - chartPaddingRight + axisValuePadding;
          rightX = _this2.width - chartPaddingRight + labelWidth + axisValuePadding * 2;
          topY = y - axisFontSize / 2 - axisValuePadding / 2;
          centerY = y;
          bottomY = y + axisFontSize / 2 + axisValuePadding / 2;
        }
        if (_this2.axisEnable) {
          canvas.beginPath();
          canvas.moveTo(rightX, topY);
          canvas.lineTo(centerX, topY);
          canvas.lineTo(leftX, centerY);
          canvas.lineTo(centerX, bottomY);
          canvas.lineTo(rightX, bottomY);
          canvas.lineTo(rightX, topY);
          canvas.setFillStyle(ref.color);
          canvas.fill();
          canvas.closePath();

          ref.left = leftX;
          ref.top = topY;
          ref.centerX = centerX;
          ref.centerY = centerY;
          ref.right = rightX;
          ref.bottom = bottomY;

          canvas.setFillStyle('white');
          canvas.setFontSize(axisFontSize);
          canvas.fillText(ref.label, leftX + axisValuePadding * 1.5, topY + axisValuePadding / 2 + axisFontSize);
        }
      });
    }
  }, {
    key: 'drawDashedLine',
    value: function drawDashedLine(canvas, x1, y1, x2, y2, dashLength) {
      var deltaX = Math.abs(x2 - x1);
      var deltaY = Math.abs(y2 - y1);
      var numDashes = Math.floor(Math.sqrt(deltaX * deltaX + deltaY * deltaY) / dashLength);
      canvas.beginPath();
      for (var i = 0; i < numDashes; ++i) {
        canvas[i % 2 === 0 ? 'moveTo' : 'lineTo'](x1 + deltaX / numDashes * i, y1 + deltaY / numDashes * i);
      }
      canvas.stroke();
      canvas.closePath();
    }
  }, {
    key: 'drawLegend',
    value: function drawLegend(canvas) {
      var chartPaddingLeft = this.chartPaddingLeft;
      var chartPaddingRight = this.chartPaddingRight;
      var chartPaddingTop = this.chartPaddingTop;
      var chartPaddingBottom = this.chartPaddingBottom;
      var legendFontSize = this.legendFontSize;
      var legendPadding = this.legendPadding;
      var legendTextColor = this.legendTextColor;

      canvas.setFontSize(legendFontSize);

      var legendList = [];
      this.data.map(function (layer, index) {
        if (layer.seriesName) {
          layer.seriesName.map(function (name, index) {
            legendList.push(name);
          });
        } else {
          legendList.push(layer.name);
        }
      });
      this.legendList = legendList;

      var legendWidth = 0;
      var isMultiLine = false;
      for (var i = 0; i < legendList.length; i++) {
        var legend = legendList[i];
        if (legendWidth > 0) {
          legendWidth += legendFontSize;
        }

        legendWidth += canvas.myMeasureText(legend, legendFontSize) + legendFontSize * 1.2;
        if (legendWidth > this.getChartContentWidth()) {
          isMultiLine = true;
        }
      }

      this.legendWidth = legendWidth;
      this.isMultiLine = isMultiLine;

      if (!isMultiLine) {
        var startX = (this.width - legendWidth) / 2;
        var startY = this.height - legendPadding - legendFontSize;
        for (var i = 0; i < legendList.length; i++) {
          var legend = legendList[i];
          var textWidth = canvas.myMeasureText(legend, legendFontSize);
          if (startX + textWidth + legendFontSize * 1.2 > this.width - chartPaddingRight) {
            startX = chartPaddingLeft;
            startY += legendFontSize * 1.5;
          }

          var seriesColor = this.getColor(i);
          canvas.setFillStyle(seriesColor);
          canvas.beginPath();
          canvas.arc(startX + legendFontSize / 2, startY + legendFontSize / 2, legendFontSize / 2, 0, 2 * Math.PI);
          canvas.fill();
          canvas.closePath();

          startX += legendFontSize * 1.2;
          if (this.isHiddenSeries(i)) {
            canvas.setFillStyle(seriesColor);
          } else {
            canvas.setFillStyle(legendTextColor);
          }
          canvas.fillText(legend, startX, startY + legendFontSize);

          startX += textWidth + legendFontSize;
        }
      } else {
        var startX = chartPaddingLeft;
        var startY = this.height - legendPadding - legendFontSize;

        if (startX + legendFontSize * 1.2 * legendList.length > this.width) {
          //legend数量过多
          canvas.setFillStyle(this.getColor(0));
          canvas.fillRect(startX, startY, legendFontSize, legendFontSize);
          startX += legendFontSize * 1.2;

          var betweenText = "~";
          var btwTextWidth = canvas.myMeasureText(betweenText, legendFontSize);
          canvas.setFillStyle(legendTextColor);
          canvas.fillText(betweenText, startX, startY + legendFontSize);
          startX += btwTextWidth + legendFontSize * 0.2;

          canvas.setFillStyle(this.getColor(legendList.length - 1));
          canvas.fillRect(startX, startY, legendFontSize, legendFontSize);
          startX += legendFontSize * 1.2;
        } else {
          for (var i = 0; i < legendList.length; i++) {
            canvas.setFillStyle(this.getColor(i));
            canvas.fillRect(startX, startY, legendFontSize, legendFontSize);
            startX += legendFontSize * 1.2;
          }
        }
        startX += legendFontSize * 0.3;
        var simpleText = legendList[0] + '~' + legendList[legendList.length - 1];
        var spTextWidth = canvas.myMeasureText(simpleText, legendFontSize);
        canvas.setFillStyle(legendTextColor);
        canvas.fillText(simpleText, startX, startY + legendFontSize);
      }
    }
  }, {
    key: 'drawNoData',
    value: function drawNoData(canvas) {
      var text = this.noDataText;
      var textWidth = canvas.myMeasureText(text, this.noDataFontSize);
      canvas.setFillStyle(this.noDataTextColor);
      canvas.fillText(text, (this.width - textWidth) / 2, (this.height + this.noDataFontSize) / 2);
    }
  }]);
  return Mix;
}();

var mix = Mix;

var Kpi = function () {
  function Kpi(opts) {
    classCallCheck(this, Kpi);

    console.log(opts);
    this.canvas = opts.canvas;
    this.width = opts.width;
    this.height = opts.height;

    this.currentName = opts.currentName;
    this.currentValue = opts.currentValue;
    this.compareName = opts.compareName;
    this.compareValue = opts.compareValue;
    this.isArise = opts.isArise;

    this.ariseColor = opts.ariseColor || '#67B5A0';
    this.ariseImg = opts.ariseImg || '/images/arise.jpg';
    this.dropColor = opts.dropColor || '#EB7B73';
    this.dropImg = opts.dropImg || '/images/drop.jpg';

    this.color1 = opts.color1 || 'black';
    this.color2 = opts.color2 || '#333333';
    this.color3 = opts.color3 || '#666666';

    this.noData = opts.noData || false;
    this.noDataText = opts.noDataText || '暂无数据';
    this.noDataTextColor = opts.noDataTextColor || '#69B5FC';
    this.noDataFontSize = opts.noDataFontSize || 11;

    this.fontSizeLarge = opts.fontSizeLarge || 30;
    this.fontSizeMedium = opts.fontSizeMedium || 22;
    this.fontSizeSmall = opts.fontSizeSmall || 16;
    this.textPadding = opts.textPadding || 10;

    this.draw();
  }

  createClass(Kpi, [{
    key: 'showToolTip',
    value: function showToolTip(e) {
      var isMove = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
    }
  }, {
    key: 'hiddenHighLight',
    value: function hiddenHighLight() {}
  }, {
    key: 'draw',
    value: function draw() {
      this.isDrawFinish = false;
      var canvas = this.canvas;

      if (this.noData) {
        this.drawNoData(canvas);
      } else {
        this.drawValue(canvas);
      }
      canvas.draw();
      this.isDrawFinish = true;
    }
  }, {
    key: 'drawValue',
    value: function drawValue(canvas) {
      var maxTextWidth;
      var textHeight = this.fontSizeLarge + this.fontSizeMedium + this.fontSizeSmall + this.textPadding * 2;

      var currentNameWidth = canvas.myMeasureText(this.currentName, this.fontSizeMedium);
      maxTextWidth = currentNameWidth;

      var currentValueWidth = canvas.myMeasureText(this.currentValue, this.fontSizeLarge);
      if (maxTextWidth < currentValueWidth) {
        maxTextWidth = currentValueWidth;
      }

      var compareNameWidth = canvas.myMeasureText(this.compareName, this.fontSizeSmall);
      var compareValueWidth = canvas.myMeasureText(this.compareValue, this.fontSizeSmall);
      if (compareNameWidth + compareValueWidth + this.fontSizeSmall * 2.5 > maxTextWidth) {
        maxTextWidth = compareNameWidth + compareValueWidth + this.fontSizeSmall * 2.5;
      }

      var x = (this.width - maxTextWidth) / 2;
      if (x < this.textPadding) {
        x = this.textPadding;
      }
      var startY = (this.height - textHeight) / 2;
      if (startY < this.textPadding) {
        startY = this.textPadding;
      }

      startY += this.fontSizeMedium;
      canvas.setFillStyle(this.color1);
      canvas.setFontSize(this.fontSizeMedium);
      canvas.fillText(this.currentName, x, startY);

      startY += this.fontSizeLarge + this.textPadding;
      canvas.setFillStyle(this.color3);
      canvas.setFontSize(this.fontSizeLarge);
      canvas.fillText(this.currentValue, x, startY);

      startY += this.fontSizeSmall + this.textPadding;
      canvas.setFillStyle(this.color2);
      canvas.setFontSize(this.fontSizeSmall);
      canvas.fillText(this.compareName, x, startY);

      if (this.isArise) {
        canvas.setFillStyle(this.ariseColor);
        canvas.drawImage(this.ariseImg, x + compareNameWidth + this.fontSizeSmall, startY - this.fontSizeSmall * 0.8, this.fontSizeSmall * 1.2, this.fontSizeSmall);
      } else {
        canvas.setFillStyle(this.dropColor);
        canvas.drawImage(this.dropImg, x + compareNameWidth + this.fontSizeSmall, startY - this.fontSizeSmall * 0.8, this.fontSizeSmall * 1.2, this.fontSizeSmall);
      }
      canvas.fillText(this.compareValue, x + compareNameWidth + this.fontSizeSmall * 2.5, startY);
    }
  }, {
    key: 'drawNoData',
    value: function drawNoData(canvas) {
      var text = this.noDataText;
      var textWidth = canvas.myMeasureText(text, this.noDataFontSize);
      canvas.setFillStyle(this.noDataTextColor);
      canvas.fillText(text, (this.width - textWidth) / 2, (this.height + this.noDataFontSize) / 2);
    }
  }]);
  return Kpi;
}();

var kpi = Kpi;

var SingleValue = function () {
  function SingleValue(opts) {
    classCallCheck(this, SingleValue);

    console.log(opts);
    this.canvas = opts.canvas;
    this.width = opts.width;
    this.height = opts.height;

    this.text = opts.text;
    this.textColor = opts.textColor || 'black';

    this.noData = opts.noData || false;
    this.noDataText = opts.noDataText || '暂无数据';
    this.noDataTextColor = opts.noDataTextColor || '#69B5FC';
    this.noDataFontSize = opts.noDataFontSize || 11;

    this.fontSize = opts.fontSize || 30;

    this.draw();
  }

  createClass(SingleValue, [{
    key: 'showToolTip',
    value: function showToolTip(e) {
      var isMove = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
    }
  }, {
    key: 'hiddenHighLight',
    value: function hiddenHighLight() {}
  }, {
    key: 'draw',
    value: function draw() {
      this.isDrawFinish = false;
      var canvas = this.canvas;

      if (this.noData) {
        this.drawNoData(canvas);
      } else {
        this.drawValue(canvas);
      }
      canvas.draw();
      this.isDrawFinish = true;
    }
  }, {
    key: 'drawValue',
    value: function drawValue(canvas) {
      var textWidth = canvas.myMeasureText(this.text, this.fontSize);
      var textHeight = this.fontSize;

      var x = (this.width - textWidth) / 2;
      var y = (this.height - textHeight) / 2 + this.fontSize;

      canvas.setFillStyle(this.textColor);
      canvas.setFontSize(this.fontSize);
      canvas.fillText(this.text, x, y);
    }
  }, {
    key: 'drawNoData',
    value: function drawNoData(canvas) {
      var text = this.noDataText;
      var textWidth = canvas.myMeasureText(text, this.noDataFontSize);
      canvas.setFillStyle(this.noDataTextColor);
      canvas.fillText(text, (this.width - textWidth) / 2, (this.height + this.noDataFontSize) / 2);
    }
  }]);
  return SingleValue;
}();

var singleValue = SingleValue;

var Animation$6 = chartUtil.Animation;

var Gauge = function () {
  function Gauge(opts) {
    classCallCheck(this, Gauge);

    console.log(opts);

    this.canvas = opts.canvas;
    this.width = opts.width;
    this.height = opts.height;
    this.chartPadding = opts.chartPadding || 40;
    this.radius = Math.min(this.width, this.height) / 2 - this.chartPadding;

    this.maxValue = opts.maxValue || 100;
    this.minValue = opts.minValue || 0;
    this.curValue = opts.curValue || 50;
    this.maxValueText = opts.maxValueText || '500';
    this.minValueText = opts.minValueText || '0';
    this.curValueText = opts.curValueText || '300';

    this.valueColor = opts.valueColor || '#DF5353';
    this.backgroundColor = opts.backgroundColor || 'white';
    this.backgroundBandColor = opts.backgroundBandColor || '#EEEEEE';
    this.limitTextColor = opts.limitTextColor || '#333333';

    this.valueFontSize = opts.valueFontSize || 36;
    this.limitFontSize = opts.limitFontSize || 12;

    this.drawWithAnimation = opts.drawWithAnimation === undefined ? true : opts.drawWithAnimation;

    this.noData = opts.noData || false;
    this.noDataText = opts.noDataText || '暂无数据';
    this.noDataTextColor = opts.noDataTextColor || '#69B5FC';
    this.noDataFontSize = opts.noDataFontSize || 11;

    this.draw();
  }

  createClass(Gauge, [{
    key: 'showToolTip',
    value: function showToolTip(e) {
      var isMove = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
    }
  }, {
    key: 'hiddenHighLight',
    value: function hiddenHighLight() {}
  }, {
    key: 'draw',
    value: function draw() {
      this.isDrawFinish = false;
      var canvas = this.canvas;

      if (this.noData) {
        this.drawNoData(canvas);
        canvas.draw();
        this.isDrawFinish = true;
      } else {
        var that = this;
        var duration = this.drawWithAnimation ? 1000 : 0;
        var animation = new Animation$6({
          timing: 'linear',
          duration: duration,
          onProcess: function onProcess(process) {
            // console.time('gauge draw')
            canvas.clearRect && canvas.clearRect(0, 0, that.width, that.height);
            that.process = process;

            that.drawGauge(canvas);
            canvas.draw();
            // console.timeEnd('gauge draw')
          },
          onAnimationFinish: function onAnimationFinish() {
            that.isDrawFinish = true;
          }
        });
      }
    }
  }, {
    key: 'drawGauge',
    value: function drawGauge(canvas) {
      var process = this.process;

      var centerX = this.width / 2;
      var centerY = this.height / 2;

      var startAngle = Math.PI * 5 / 6;
      var endAngle = Math.PI * 13 / 6;

      canvas.setFillStyle(this.backgroundBandColor);
      canvas.beginPath();
      canvas.moveTo(centerX, centerY);
      canvas.arc(centerX, centerY, this.radius, startAngle, endAngle);
      canvas.closePath();
      canvas.fill();

      var valueAngle = this.curValue / (this.maxValue - this.minValue) * (endAngle - startAngle) * process;

      canvas.setFillStyle(this.valueColor);
      canvas.beginPath();
      canvas.moveTo(centerX, centerY);
      canvas.arc(centerX, centerY, this.radius, startAngle, startAngle + valueAngle);
      canvas.closePath();
      canvas.fill();

      canvas.setFillStyle(this.backgroundColor);
      canvas.beginPath();
      canvas.arc(centerX, centerY, this.radius * 0.6, 0, 2 * Math.PI);
      canvas.closePath();
      canvas.fill();

      if (process == 1) {
        var valueTextWidht = canvas.myMeasureText(this.curValueText, this.valueFontSize);
        canvas.setFontSize(this.valueFontSize);
        canvas.setFillStyle(this.valueColor);
        canvas.fillText(this.curValueText, centerX - valueTextWidht / 2, centerY + this.valueFontSize / 2);

        var leftValueX = centerX - 3 / 4 * this.radius;
        var rightValueX = centerX + 3 / 4 * this.radius;
        var valueY = centerY + Math.sqrt(3) / 4 * this.radius + this.limitFontSize;

        canvas.setFontSize(this.limitFontSize);
        canvas.setFillStyle(this.limitTextColor);
        canvas.fillText(this.minValueText, leftValueX, valueY);

        var maxTextWidth = canvas.myMeasureText(this.maxValueText, this.limitFontSize);
        canvas.fillText(this.maxValueText, rightValueX - maxTextWidth, valueY);
      }
    }
  }, {
    key: 'drawNoData',
    value: function drawNoData(canvas) {
      var text = this.noDataText;
      var textWidth = canvas.myMeasureText(text, this.noDataFontSize);
      canvas.setFillStyle(this.noDataTextColor);
      canvas.fillText(text, (this.width - textWidth) / 2, (this.height + this.noDataFontSize) / 2);
    }
  }]);
  return Gauge;
}();

var gauge = Gauge;

var Animation$7 = chartUtil.Animation;

var Funnel = function () {
  function Funnel(opts) {
    classCallCheck(this, Funnel);

    console.log(opts);

    this.canvas = opts.canvas;
    this.width = opts.width;
    this.height = opts.height;
    this.chartPadding = opts.chartPadding || 40;

    this.highLightIndex = -1;
    this.highLightColor = 'rgba(0, 0, 0, 0.3)';

    this.drawAxisLabel = opts.drawAxisLabel || false;
    this.drawDataLabel = opts.drawDataLabel || false;
    this.dataLabelPosition = opts.dataLabelPosition || 'inside';
    this.datalabelCallBack = opts.datalabelCallBack || function () {
      return '';
    };
    this.dataLabelFontSize = opts.dataLabelFontSize || 8;
    this.dataLabelPadding = opts.dataLabelPadding || 4;
    this.dataLabelColor = opts.dataLabelColor || 'white';
    this.dataAxisLabelColor = opts.dataAxisLabelColor || '#111111';
    this.dataLabelLineWidth = opts.dataLabelLineWidth || 0.5;

    this.tooltipCallBack = opts.tooltipCallBack;
    this.toolTipBackgroundColor = opts.toolTipBackgroundColor || 'white';
    this.toolTipShadowColor = opts.toolTipShadowColor || 'rgba(0, 0, 0, 0.5)';
    this.toolTipShadowOffsetX = opts.toolTipShadowOffsetX || 2;
    this.toolTipShadowOffsetY = opts.toolTipShadowOffsetY || 5;
    this.toolTipShadowBlur = opts.toolTipShadowBlur || 50;
    this.toolTipPadding = opts.toolTipPadding || 10;
    this.toolTipTextPadding = opts.toolTipTextPadding || 8;
    this.toolTipFontSize = opts.toolTipFontSize || 10;
    this.toolTipSplitLineWidth = opts.toolTipSplitLineWidth || 1;
    this.toolTipSplitLineColor = opts.toolTipSplitLineColor || '#ffffff';

    this.drawWithAnimation = opts.drawWithAnimation === undefined ? true : opts.drawWithAnimation;

    this.noData = opts.noData || false;
    this.noDataText = opts.noDataText || '暂无数据';
    this.noDataTextColor = opts.noDataTextColor || '#69B5FC';
    this.noDataFontSize = opts.noDataFontSize || 11;
    this.data = opts.data;

    var colors = ['#7cb5ec', '#f7a35c', '#434348', '#90ed7d', '#f15c80', '#8085e9', '#E4D354', '#2B908F', '#F45B5B', '#91E8E1', '#7CB5EC', '#434348'];
    this.colors = opts.colors && opts.colors.slice() || colors;

    this.funnelWidth = opts.funnelWidth || Math.min(this.width, this.height) - this.chartPadding * 2 - this.dataLabelPadding * 2;
    var maxLeftLabelWidth = 0;
    var maxRightLabelWidth = 0;

    var transformLabels = [];
    var maxValue;
    for (var i = 0; i < this.data.length; i++) {
      var name = this.data[i].name;
      var value = this.data[i].value;

      if (!maxValue || maxValue < value) {
        maxValue = value;
      }
      if (this.drawAxisLabel) {
        var labelWidth = this.canvas.myMeasureText(name, this.dataLabelFontSize);
        this.data[i].labelWidth = labelWidth;

        if (maxRightLabelWidth < labelWidth) {
          maxRightLabelWidth = labelWidth;
        }
        if (i > 0) {
          var preValue = this.data[i - 1].value;
          var transformValue = value / preValue * 100;
          var transformLabel = '\u8F6C\u5316\u7387 ' + transformValue.toFixed(2) + '%';
          var transformWidth = this.canvas.myMeasureText(transformLabel, this.dataLabelFontSize);

          transformLabels.push({
            label: transformLabel,
            labelWidth: transformWidth
          });

          if (maxLeftLabelWidth < transformWidth) {
            maxLeftLabelWidth = transformWidth;
          }
        }
      }
    }
    this.maxValue = maxValue;
    this.transformLabels = transformLabels;

    var funnelWidth = this.width - maxLeftLabelWidth - maxRightLabelWidth - this.dataLabelPadding * 2 - this.chartPadding * 2;
    if (funnelWidth < this.funnelWidth) {
      this.funnelWidth = funnelWidth;
    }

    this.draw();
  }

  createClass(Funnel, [{
    key: 'getColor',
    value: function getColor(index) {
      return this.colors[index % this.colors.length];
    }
  }, {
    key: 'calculateClickPosition',
    value: function calculateClickPosition(e) {
      if (this.noData || this.process != 1) {
        return -1;
      }
      if (e.touches && e.touches.length) {
        var x = e.touches[0].x;
        var y = e.touches[0].y;

        var width = this.width;
        var height = this.height;

        var chartPadding = this.chartPadding;
        var funnelWidth = this.funnelWidth;
        var preHeight = (this.height - chartPadding * 2) / (this.data.length - 1);

        var centerX = width / 2;
        var startY = chartPadding;

        if (x >= chartPadding && x <= width - chartPadding && y >= chartPadding && y <= height - chartPadding) {
          return Math.floor((y - chartPadding) / preHeight);
        }

        return -1;
      }
      return -1;
    }
  }, {
    key: 'showToolTip',
    value: function showToolTip(e) {
      var isMove = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;

      var index = this.calculateClickPosition(e);
      if (this.highLightIndex == index && index == -1) {
        return;
      }
      if (this.highLightIndex == index && !isMove) {
        this.highLightIndex = -1;
      } else if (this.highLightIndex == index && this.highLightY && Math.abs(this.highLightY - e.touches[0].y) < 10) {
        return;
      } else {
        this.highLightIndex = index;

        if (index != -1) {
          var highLightData = this.tooltipCallBack(index);
          this.highLightData = highLightData;
          this.highLightY = e.touches[0].y;
          this.highLightX = e.touches[0].x;
        }
      }
      this.draw(false);
    }
  }, {
    key: 'hiddenHighLight',
    value: function hiddenHighLight() {
      if (this.highLightIndex == -1) {
        return;
      }
      this.highLightIndex = -1;
      this.draw(false);
    }
  }, {
    key: 'draw',
    value: function draw() {
      var isAnimation = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : true;

      this.isDrawFinish = false;
      var canvas = this.canvas;

      if (this.noData) {
        this.drawNoData(canvas);
        canvas.draw();
        this.isDrawFinish = true;
      } else {
        var that = this;
        var duration = isAnimation && this.drawWithAnimation ? 1000 : 0;
        var animation = new Animation$7({
          timing: 'linear',
          duration: duration,
          onProcess: function onProcess(process) {
            canvas.clearRect && canvas.clearRect(0, 0, that.width, that.height);
            that.process = process;
            that.dataLabels = [];

            that.drawFunnel(canvas);
            if (that.drawDataLabel && process == 1) {
              that.drawDataLabelLayer(canvas);
            }
            that.drawToolTip(canvas);
            canvas.draw();
          },
          onAnimationFinish: function onAnimationFinish() {
            that.isDrawFinish = true;
          }
        });
      }
    }
  }, {
    key: 'drawToolTip',
    value: function drawToolTip(canvas) {
      if (this.highLightIndex == -1) {
        return;
      }
      var chartPadding = this.chartPadding;
      var chartContentHeight = this.height - chartPadding * 2;
      var x = this.highLightX;
      var y = this.highLightY;

      var toolTipBackgroundColor = this.toolTipBackgroundColor;
      var toolTipPadding = this.toolTipPadding;
      var toolTipTextPadding = this.toolTipTextPadding;
      var toolTipFontSize = this.toolTipFontSize;
      var toolTipSplitLineWidth = this.toolTipSplitLineWidth;
      // var toolTipSplitLineColor = this.toolTipSplitLineColor
      var toolTipSplitLineColor = this.getColor(this.highLightIndex);

      var toolTipWidth = toolTipPadding * 2;
      var toolTipHeight = toolTipPadding * 2;

      var highLightData = this.highLightData;

      //title
      var maxTipLineWidth = canvas.myMeasureText(highLightData.title, toolTipFontSize);
      toolTipHeight += toolTipFontSize + toolTipSplitLineWidth + toolTipTextPadding;
      highLightData.data.map(function (text, index) {
        toolTipHeight += toolTipFontSize + toolTipTextPadding;

        var textWidth = canvas.myMeasureText(text, toolTipFontSize);
        if (maxTipLineWidth < textWidth) {
          maxTipLineWidth = textWidth;
        }
      });
      toolTipWidth += maxTipLineWidth;

      var startX = x - toolTipWidth / 2;
      var startY = y - toolTipHeight / 2;
      if (y + toolTipHeight > chartContentHeight + chartPadding) {
        startY = chartContentHeight + chartPadding - toolTipHeight;
      }

      canvas.setFillStyle(toolTipBackgroundColor);
      canvas.beginPath();
      canvas.setShadow(this.toolTipShadowOffsetX, this.toolTipShadowOffsetY, this.toolTipShadowBlur, this.toolTipShadowColor);
      canvas.fillRect(startX, startY, toolTipWidth, toolTipHeight);
      canvas.closePath();

      canvas.setFillStyle(toolTipSplitLineColor);
      canvas.setStrokeStyle(toolTipSplitLineColor);
      canvas.setLineWidth(toolTipSplitLineWidth);
      canvas.setFontSize(toolTipFontSize);
      canvas.setTextAlign('left');

      var drawX = startX + toolTipPadding;
      var drawY = startY + toolTipPadding + toolTipFontSize;

      canvas.fillText(highLightData.title, drawX, drawY);
      drawY += toolTipTextPadding + toolTipSplitLineWidth / 2;
      canvas.beginPath();
      canvas.moveTo(drawX - toolTipPadding * 0.25, drawY);
      canvas.lineTo(drawX + toolTipWidth - toolTipPadding * 1.75, drawY);
      canvas.stroke();
      canvas.closePath();

      highLightData.data.map(function (text, index) {
        drawY += toolTipTextPadding + toolTipFontSize;
        canvas.fillText(text, drawX, drawY);
      });
    }
  }, {
    key: 'drawFunnel',
    value: function drawFunnel(canvas) {
      var process = this.process;

      var width = this.width;
      var height = this.height;

      var dataLabelFontSize = this.dataLabelFontSize;
      var dataLabelPadding = this.dataLabelPadding;
      var dataAxisLabelColor = this.dataAxisLabelColor;

      var chartPadding = this.chartPadding;
      var funnelWidth = this.funnelWidth;
      var preHeight = (this.height - chartPadding * 2) / (this.data.length - 1);
      var centerX = width / 2;
      var size = this.data.length;
      var drawSize = size * process;

      canvas.setLineWidth(this.dataLabelLineWidth);
      canvas.setFontSize(dataLabelFontSize);
      canvas.setStrokeStyle(dataAxisLabelColor);

      var currentY = chartPadding;
      for (var i = 0; i < drawSize; i++) {
        var value = this.data[i].value;
        var valueWidth = value / this.maxValue * funnelWidth;

        if (this.drawAxisLabel && process == 1) {
          var name = this.data[i].name;
          var labelWidth = this.data[i].labelWidth;
          canvas.beginPath();
          canvas.moveTo((this.width + valueWidth) / 2, currentY);
          canvas.lineTo(this.width - chartPadding - labelWidth - dataLabelPadding, currentY);
          canvas.closePath();
          canvas.stroke();

          canvas.setTextAlign('right');
          canvas.setFillStyle(dataAxisLabelColor);
          canvas.fillText(name, this.width - chartPadding, currentY + dataLabelFontSize / 2);
        }

        if (i > 0) {
          var preValue = this.data[i - 1].value;
          var preValueWidth = preValue / this.maxValue * funnelWidth;

          if (this.drawAxisLabel && process == 1) {
            var transformLabel = this.transformLabels[i - 1].label;
            var transformLabelWidth = this.transformLabels[i - 1].labelWidth;

            canvas.beginPath();
            canvas.moveTo(centerX, currentY - preHeight / 2);
            canvas.lineTo(chartPadding + transformLabelWidth + dataLabelPadding, currentY - preHeight / 2);
            canvas.closePath();
            canvas.stroke();

            canvas.setTextAlign('left');
            canvas.setFillStyle(dataAxisLabelColor);
            canvas.fillText(transformLabel, chartPadding, currentY - preHeight / 2 + dataLabelFontSize / 2);
          }

          canvas.setFillStyle(this.getColor(i - 1));
          canvas.beginPath();
          canvas.moveTo(centerX - preValueWidth / 2, currentY - preHeight);
          canvas.lineTo(centerX + preValueWidth / 2, currentY - preHeight);
          canvas.lineTo(centerX + valueWidth / 2, currentY);
          canvas.lineTo(centerX - valueWidth / 2, currentY);
          canvas.closePath();
          canvas.fill();
        }

        if (this.drawDataLabel) {
          var label = this.datalabelCallBack(0, i);
          this.drawDataLabelPosition(canvas, label, valueWidth, currentY);
        }

        currentY += preHeight;
      }
    }
  }, {
    key: 'drawDataLabelPosition',
    value: function drawDataLabelPosition(canvas, label, valueWidth, startY) {
      var dataLabelPadding = this.dataLabelPadding;
      var dataLabelFontSize = this.dataLabelFontSize;

      var labelWidth = canvas.myMeasureText(label, dataLabelFontSize);
      var y;
      switch (this.dataLabelPosition) {
        case 'inside':
          y = startY + dataLabelPadding + dataLabelFontSize;
          break;
        case 'outside':
          y = startY - dataLabelPadding;
          break;
      }

      var color;
      if (y < this.chartPadding || y > this.height - this.chartPadding || labelWidth > valueWidth) {
        color = this.dataAxisLabelColor;
      } else {
        color = this.dataLabelColor;
      }
      this.addDataLabel(label, (this.width - labelWidth) / 2, y, labelWidth, color);
    }
  }, {
    key: 'addDataLabel',
    value: function addDataLabel(label, x, y, labelWidth, color) {
      var left = x;
      var top = y - this.dataLabelFontSize;
      var right = x + labelWidth;
      var bottom = y;

      var currDataLabel = {
        label: label,
        left: left,
        top: top,
        right: right,
        bottom: bottom,
        color: color
      };

      var isCrash = false;
      for (var i = 0; i < this.dataLabels.length; i++) {
        var dataLabel = this.dataLabels[i];
        if (this.isRectCrash(currDataLabel, dataLabel)) {
          isCrash = true;
          break;
        }
      }
      if (!isCrash) {
        this.dataLabels.push(currDataLabel);
      }
    }
  }, {
    key: 'isRectCrash',
    value: function isRectCrash(a, b) {
      var left = Math.max(a.left, b.left);
      var top = Math.max(a.top, b.top);
      var right = Math.min(a.right, b.right);
      var bottom = Math.min(a.bottom, b.bottom);

      return left <= right && top <= bottom;
    }
  }, {
    key: 'drawDataLabelLayer',
    value: function drawDataLabelLayer(canvas) {
      canvas.setTextAlign('left');
      canvas.setFontSize(this.dataLabelFontSize);

      this.dataLabels.map(function (dataLabel, index) {
        canvas.setFillStyle(dataLabel.color);
        canvas.fillText(dataLabel.label, dataLabel.left, dataLabel.bottom);
      });
    }
  }, {
    key: 'drawNoData',
    value: function drawNoData(canvas) {
      var text = this.noDataText;
      var textWidth = canvas.myMeasureText(text, this.noDataFontSize);
      canvas.setFillStyle(this.noDataTextColor);
      canvas.fillText(text, (this.width - textWidth) / 2, (this.height + this.noDataFontSize) / 2);
    }
  }]);
  return Funnel;
}();

var funnel = Funnel;

var Animation$8 = chartUtil.Animation;

var Polar = function () {
  function Polar(opts) {
    classCallCheck(this, Polar);

    console.log(opts);

    this.canvas = opts.canvas;
    this.width = opts.width;
    this.height = opts.height;
    this.chartPadding = opts.chartPadding || 40;
    this.chartPaddingLeft = opts.chartPaddingLeft || 40;
    this.chartPaddingRight = opts.chartPaddingRight || 40;
    this.chartPaddingTop = opts.chartPaddingTop || 40;
    this.chartPaddingBottom = opts.chartPaddingBottom || 40;
    this.polarWidth = opts.polarWidth || Math.min(this.width, this.height) - this.chartPadding * 2;
    this.circleRadius = opts.circleRadius || 3;
    this.lineWidth = opts.lineWidth || 2;

    this.highLightIndex = -1;
    this.highLightColor = 'rgba(0, 0, 0, 0.3)';
    this.axisHighLightEnable = opts.axisHighLightEnable || true;
    this.axisHighLightColor = opts.axisFontColor || '#69B5FC';

    this.drawDataLabel = opts.drawDataLabel || false;
    this.dataLabelFontSize = opts.dataLabelFontSize || 8;
    this.dataLabelPadding = opts.dataLabelPadding || 4;
    this.dataLabelColor = opts.dataLabelColor || '#111111';

    this.drawWithAnimation = opts.drawWithAnimation === undefined ? true : opts.drawWithAnimation;

    this.noData = opts.noData || false;
    this.noDataText = opts.noDataText || '暂无数据';
    this.noDataTextColor = opts.noDataTextColor || '#69B5FC';
    this.noDataFontSize = opts.noDataFontSize || 11;
    this.data = opts.data;

    this.axisEnable = opts.axisEnable || false;
    this.axisFontSize = opts.axisFontSize || 10;
    this.axisValuePadding = opts.axisValuePadding || 5;
    this.axisLineWidth = opts.axisLineWidth || 1;
    this.axisLineColor = opts.axisLineColor || '#dddddd';
    this.axisFontColor = opts.axisFontColor || '#444444';
    this.arcType = opts.arcType || 'arc';

    this.legendEnable = opts.legendEnable || false;
    this.legendFontSize = opts.legendFontSize || 10;
    this.legendPaddingTop = opts.legendPaddingTop || 60;
    this.legendTextColor = opts.legendTextColor || '#000000';

    this.tooltipCallBack = opts.tooltipCallBack;
    this.toolTipBackgroundColor = opts.toolTipBackgroundColor || 'rgba(0, 0, 0, 0.6)';
    this.toolTipPadding = opts.toolTipPadding || 10;
    this.toolTipTextPadding = opts.toolTipTextPadding || 8;
    this.toolTipFontSize = opts.toolTipFontSize || 10;
    this.toolTipSplitLineWidth = opts.toolTipSplitLineWidth || 1;
    this.toolTipSplitLineColor = opts.toolTipSplitLineColor || '#ffffff';

    this.muteCallback = opts.muteCallback || function () {
      return '';
    };
    this.seriesStatus = opts.seriesStatus;

    this.maxValue = opts.maxValue;
    this.minValue = opts.minValue;
    this.xAxisData = opts.xAxisData;
    this.y1Ticks = opts.y1Ticks || [];
    this.startAngle = -Math.PI / 2;

    var colors = ['#7cb5ec', '#f7a35c', '#434348', '#90ed7d', '#f15c80', '#8085e9', '#E4D354', '#2B908F', '#F45B5B', '#91E8E1', '#7CB5EC', '#434348'];
    this.colors = opts.colors && opts.colors.slice() || colors;

    this.draw();
  }

  createClass(Polar, [{
    key: 'getColor',
    value: function getColor(index) {
      if (this.isHiddenSeries(index)) {
        return '#cccccc';
      }
      if (this.drawOrder && this.drawOrder.length && index < this.drawOrder.length) {
        index = this.drawOrder[index];
      }
      return this.colors[index % this.colors.length];
    }
  }, {
    key: 'isHiddenSeries',
    value: function isHiddenSeries(index) {
      return this.seriesStatus && this.seriesStatus[index];
    }
  }, {
    key: 'calculateClickPosition',
    value: function calculateClickPosition(e) {
      var isMove = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;

      if (this.noData || this.process != 1) {
        return -1;
      }
      if (e.touches && e.touches.length) {
        var x = e.touches[0].x;
        var y = e.touches[0].y;

        var width = this.width;
        var height = this.height;
        var chartPadding = this.chartPadding;
        var legendPaddingTop = this.legendPaddingTop;
        var legendFontSize = this.legendFontSize;

        var polarWidth = this.polarWidth;
        var polarRadius = polarWidth / 2;
        var size = this.xAxisData.length;
        var preAngle = 2 * Math.PI / size;

        var startAngle = this.startAngle;
        var centerX = this.width / 2;
        var centerY = this.height / 2;

        if (Math.pow(x - centerX, 2) + Math.pow(y - centerY, 2) <= Math.pow(polarRadius, 2)) {
          var currAngle = (this.getAngleForPoint(x, y) - startAngle + 2 * Math.PI) % (2 * Math.PI);
          var ci = currAngle / preAngle;
          var index = Math.floor(ci);
          if (ci - index > 0.5) {
            index += 1;
            index = index % this.xAxisData.length;
          }
          return index;
        }

        if (isMove) {
          return -1;
        }

        if (x > chartPadding && x < this.width - chartPadding && y > this.height / 2 + this.polarWidth / 2 + legendPaddingTop && y < this.height / 2 + this.polarWidth / 2 + legendPaddingTop + legendFontSize) {
          var legendWidth = this.legendWidth;
          var isMultiLine = this.isMultiLine;

          if (!isMultiLine) {
            var startX = (this.width - legendWidth) / 2;

            if (x >= startX && x <= this.width - startX) {
              for (var i = 0; i < this.legendList.length; i++) {
                var textWidth = this.canvas.myMeasureText(this.legendList[i], legendFontSize);
                if (x < startX + textWidth + legendFontSize * 2.2) {
                  var chartInfo = this.muteCallback(i);
                  this.data = chartInfo.data;
                  this.seriesStatus = chartInfo.seriesStatus;
                  this.draw(true, false);
                  break;
                }
                startX += legendFontSize * 2.2 + textWidth;
              }
            }
          } else {
            var startX = chartPadding;

            if (startX + legendFontSize * 1.2 * this.legendList.length <= this.width) {
              for (var i = 0; i < this.legendList.length; i++) {
                if (x < startX + legendFontSize * 1.2) {
                  var chartInfo = this.muteCallback(i);
                  this.data = chartInfo.data;
                  this.seriesStatus = chartInfo.seriesStatus;
                  this.draw(true, false);
                  break;
                }
                startX += legendFontSize * 1.2;
              }
            }
          }
        }

        return -1;
      }
      return -1;
    }
  }, {
    key: 'getAngleForPoint',
    value: function getAngleForPoint(x, y) {
      var centerX = this.width / 2;
      var centerY = this.height / 2;

      var tx = x - centerX,
          ty = y - centerY;
      var length = Math.sqrt(tx * tx + ty * ty);
      var r = Math.acos(ty / length);

      var angle = r;
      if (x > centerX) {
        angle = 2 * Math.PI - angle;
      }
      angle = angle + Math.PI / 2;
      if (angle > 2 * Math.PI) {
        angle = angle - 2 * Math.PI;
      }

      return angle;
    }
  }, {
    key: 'showToolTip',
    value: function showToolTip(e) {
      var isMove = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;

      var index = this.calculateClickPosition(e, isMove);
      if (this.highLightIndex == index && index == -1) {
        return;
      }
      if (this.highLightIndex == index && !isMove) {
        this.highLightIndex = -1;
      } else if (this.highLightIndex == index && this.highLightY && Math.abs(this.highLightY - e.touches[0].y) < 10) {
        return;
      } else {
        this.highLightIndex = index;

        if (index != -1) {
          var highLightData = this.tooltipCallBack(index);
          this.highLightData = highLightData;
          this.highLightY = e.touches[0].y;
          this.highLightX = e.touches[0].x;
        }
      }
      this.draw(false);
    }
  }, {
    key: 'hiddenHighLight',
    value: function hiddenHighLight() {
      if (this.highLightIndex == -1) {
        return;
      }
      this.highLightIndex = -1;
      this.draw(false);
    }
  }, {
    key: 'draw',
    value: function draw() {
      var isAnimation = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : true;
      var animationWithLegend = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : true;

      this.isDrawFinish = false;
      var canvas = this.canvas;

      if (this.noData) {
        this.drawNoData(canvas);
        canvas.draw();
        this.isDrawFinish = true;
      } else {
        var that = this;
        var duration = isAnimation && this.drawWithAnimation ? 1000 : 0;
        var animation = new Animation$8({
          timing: 'easeIn',
          duration: duration,
          onProcess: function onProcess(process) {
            canvas.clearRect && canvas.clearRect(0, 0, that.width, that.height);
            that.process = process;

            that.drawAxis(canvas);
            that.drawLayerData(canvas);
            that.drawAxisValue(canvas);
            that.drawToolTip(canvas);

            if (that.legendEnable) {
              if (!animationWithLegend) {
                that.drawLegend(canvas);
              } else if (process == 1) {
                that.drawLegend(canvas);
              }
            }
            canvas.draw();
          },
          onAnimationFinish: function onAnimationFinish() {
            that.isDrawFinish = true;
          }
        });
      }
    }
  }, {
    key: 'drawToolTip',
    value: function drawToolTip(canvas) {
      if (this.highLightIndex == -1) {
        return;
      }
      var preAngle = 2 * Math.PI / this.xAxisData.length;
      var chartPadding = this.chartPadding;
      var chartContentHeight = this.height - chartPadding * 2;
      var x = this.width / 2 + this.polarWidth / 4 * Math.cos(preAngle * this.highLightIndex + this.startAngle);
      var y = this.height / 2 + this.polarWidth / 4 * Math.sin(preAngle * this.highLightIndex + this.startAngle);

      var toolTipBackgroundColor = this.toolTipBackgroundColor;
      var toolTipPadding = this.toolTipPadding;
      var toolTipTextPadding = this.toolTipTextPadding;
      var toolTipFontSize = this.toolTipFontSize;
      var toolTipSplitLineWidth = this.toolTipSplitLineWidth;
      var toolTipSplitLineColor = this.toolTipSplitLineColor;

      var toolTipWidth = toolTipPadding * 2;
      var toolTipHeight = toolTipPadding * 2;

      var highLightData = this.highLightData;

      //title
      var maxTipLineWidth = canvas.myMeasureText(highLightData.title, toolTipFontSize);
      toolTipHeight += toolTipFontSize + toolTipSplitLineWidth + toolTipTextPadding;
      highLightData.data.map(function (text, index) {
        toolTipHeight += toolTipFontSize + toolTipTextPadding;

        var textWidth = canvas.myMeasureText(text, toolTipFontSize);
        if (maxTipLineWidth < textWidth) {
          maxTipLineWidth = textWidth;
        }
      });
      toolTipWidth += maxTipLineWidth;

      var startX = x - toolTipWidth / 2;
      var startY = y - toolTipHeight / 2;
      if (y + toolTipHeight > chartContentHeight + chartPadding) {
        startY = chartContentHeight + chartPadding - toolTipHeight;
      }

      canvas.setFillStyle(toolTipBackgroundColor);
      canvas.beginPath();
      canvas.fillRect(startX, startY, toolTipWidth, toolTipHeight);
      canvas.closePath();

      canvas.setFillStyle(toolTipSplitLineColor);
      canvas.setStrokeStyle(toolTipSplitLineColor);
      canvas.setLineWidth(toolTipSplitLineWidth);
      canvas.setFontSize(toolTipFontSize);

      var drawX = startX + toolTipPadding;
      var drawY = startY + toolTipPadding + toolTipFontSize;

      canvas.fillText(highLightData.title, drawX, drawY);
      drawY += toolTipTextPadding + toolTipSplitLineWidth / 2;
      canvas.beginPath();
      canvas.moveTo(drawX - toolTipPadding * 0.25, drawY);
      canvas.lineTo(drawX + toolTipWidth - toolTipPadding * 1.75, drawY);
      canvas.stroke();
      canvas.closePath();

      highLightData.data.map(function (text, index) {
        drawY += toolTipTextPadding + toolTipFontSize;
        canvas.fillText(text, drawX, drawY);
      });
    }
  }, {
    key: 'drawLayerData',
    value: function drawLayerData(canvas) {
      var that = this;
      var colorPosition = 0;
      this.data.map(function (layer, index) {
        var preGroupSize = layer.data == undefined || layer.data.length == 0 || layer.data[0].subData == undefined ? 1 : layer.data[0].subData.length;
        switch (layer.type) {
          case 'line':
            that.drawPolar(canvas, layer, colorPosition, true);
            break;
          case 'stack':
            that.drawBar(canvas, layer, colorPosition);
            break;
        }
        colorPosition += preGroupSize;
      });
    }
  }, {
    key: 'drawBar',
    value: function drawBar(canvas, layer, colorPosition) {
      var process = this.process;

      var polarWidth = this.polarWidth;
      var polarRadius = polarWidth / 2;
      var max = this.maxValue;
      var min = this.minValue;
      var size = layer.data.length;
      var drawSize = size * process;
      var preAngle = 2 * Math.PI / size;
      var valueLen = max - min;

      var startAngle = this.startAngle;
      var centerX = this.width / 2;
      var centerY = this.height / 2;

      for (var i = 0; i < drawSize; i++) {
        var entry = layer.data[i];
        var subSize = entry.subData.length;

        var total = 0;
        entry.subData.map(function (value, index) {
          if (value) {
            total += value;
          }
        });

        var totalRadius = (total - min) / valueLen * polarRadius * process;
        for (var j = 0; j < subSize; j++) {
          if (totalRadius <= 0) {
            break;
          }

          var subEntry = entry.subData[j];
          if (!subEntry) {
            continue;
          }

          var color = this.getColor(colorPosition + j);
          canvas.setFillStyle(color);
          canvas.beginPath();
          canvas.moveTo(centerX, centerY);
          if (this.arcType == 'arc') {
            canvas.arc(centerX, centerY, totalRadius, startAngle - preAngle / 2, startAngle + preAngle / 2);
          } else {
            var x = centerX + totalRadius * Math.cos(startAngle);
            var y = centerY + totalRadius * Math.sin(startAngle);
            var x1 = centerX + totalRadius * Math.cos(startAngle + preAngle);
            var y2 = centerY + totalRadius * Math.sin(startAngle + preAngle);
            canvas.lineTo(x, y);
            canvas.lineTo(x1, y2);
          }
          canvas.closePath();
          canvas.fill();

          if (this.highLightIndex == i) {
            canvas.setFillStyle(this.highLightColor);
            canvas.beginPath();
            canvas.moveTo(centerX, centerY);
            if (this.arcType == 'arc') {
              canvas.arc(centerX, centerY, totalRadius, startAngle - preAngle / 2, startAngle + preAngle / 2);
            } else {
              var x = centerX + totalRadius * Math.cos(startAngle);
              var y = centerY + totalRadius * Math.sin(startAngle);
              var x1 = centerX + totalRadius * Math.cos(startAngle + preAngle);
              var y2 = centerY + totalRadius * Math.sin(startAngle + preAngle);
              canvas.lineTo(x, y);
              canvas.lineTo(x1, y2);
            }
            canvas.closePath();
            canvas.fill();
          }

          var itemRadius = (subEntry - min) / valueLen * polarRadius * process;
          totalRadius -= itemRadius;
        }
        startAngle += preAngle;
      }
    }
  }, {
    key: 'drawPolar',
    value: function drawPolar(canvas, layer, colorPosition, drawPath) {
      var process = this.process;

      var polarWidth = this.polarWidth;
      var polarRadius = polarWidth / 2;
      var max = this.maxValue;
      var min = this.minValue;
      var size = layer.data.length;
      var preAngle = 2 * Math.PI / size;
      var valueLen = max - min;

      var startAngle = this.startAngle;
      var centerX = this.width / 2;
      var centerY = this.height / 2;

      canvas.setLineWidth(this.lineWidth);

      var startLists = [];
      var subSize = layer.data[0].subData.length;
      for (var j = 0; j < subSize; j++) {
        for (var i = 0; i < size; i++) {
          var entry = layer.data[i];
          var subEntry = entry.subData[j];
          if (!subEntry) {
            continue;
          }

          if (subEntry == null || subEntry == undefined) {
            startLists[j * 2] = null;
            startLists[j * 2 + 1] = null;
            continue;
          }

          var color = this.getColor(colorPosition + j);
          canvas.setFillStyle(color);

          var itemRadius = (subEntry - min) / valueLen * polarRadius * process;

          var x = centerX + itemRadius * Math.cos(preAngle * i + startAngle);
          var y = centerY + itemRadius * Math.sin(preAngle * i + startAngle);

          canvas.beginPath();
          canvas.arc(x, y, this.circleRadius, 0, 2 * Math.PI);
          canvas.fill();
          canvas.closePath();
          if (i > 0 && drawPath) {
            var x1 = startLists[j * 2] || 0;
            var y1 = startLists[j * 2 + 1] || 0;

            if (x1 && y1) {
              canvas.beginPath();
              canvas.setStrokeStyle(color);
              canvas.moveTo(x1, y1);
              canvas.lineTo(x, y);
              canvas.stroke();
              canvas.closePath();
            }

            if (i == size - 1) {
              var startRadius = (layer.data[0].subData[j] - min) / valueLen * polarRadius * process;
              var sx = centerX + startRadius * Math.cos(startAngle);
              var sy = centerY + startRadius * Math.sin(startAngle);

              canvas.beginPath();
              canvas.setStrokeStyle(color);
              canvas.moveTo(x, y);
              canvas.lineTo(sx, sy);
              canvas.stroke();
              canvas.closePath();
            }
          }
          startLists[j * 2] = x;
          startLists[j * 2 + 1] = y;
        }
      }
    }
  }, {
    key: 'drawAxisValue',
    value: function drawAxisValue(canvas) {
      if (!this.axisEnable) {
        return;
      }
      var process = this.process;

      var polarWidth = this.polarWidth;
      var polarRadius = polarWidth / 2;
      var xAxisData = this.xAxisData;
      var y1Ticks = this.y1Ticks;
      var axisEnable = this.axisEnable;
      var axisFontSize = this.axisFontSize;
      var axisLineColor = this.axisLineColor;
      var axisHighLightEnable = this.axisHighLightEnable;
      var axisHighLightColor = this.axisHighLightColor;
      var axisFontColor = this.axisFontColor;
      var axisLineWidth = this.axisLineWidth;
      var arcType = this.arcType;
      var axisValuePadding = this.axisValuePadding;

      var centerX = this.width / 2;
      var centerY = this.height / 2;

      canvas.setFontSize(axisFontSize);

      var preAngle = 2 * Math.PI / xAxisData.length;
      var startAngle = this.startAngle;

      for (var i = 0; i < xAxisData.length; i++) {
        var x = centerX + polarRadius * Math.cos(preAngle * i + startAngle);
        var y = centerY + polarRadius * Math.sin(preAngle * i + startAngle);

        var labelX = centerX + (polarRadius + axisValuePadding) * Math.cos(preAngle * i + startAngle);
        var labelY = centerY + (polarRadius + axisValuePadding) * Math.sin(preAngle * i + startAngle);
        if (labelY > this.height / 2) {
          labelY += axisFontSize * Math.abs(Math.sin(preAngle * i + startAngle));
        }

        var label = xAxisData[i];
        var labelWidth = canvas.myMeasureText(label, axisFontSize);

        canvas.setFillStyle(axisFontColor);
        if (labelX >= centerX - axisValuePadding && labelX <= centerX + axisValuePadding) {
          canvas.fillText(label, labelX - labelWidth / 2, labelY);
        } else if (labelX < centerX) {
          if (labelX - labelWidth - axisValuePadding > axisValuePadding) {
            canvas.fillText(label, labelX - labelWidth - axisValuePadding, labelY);
          } else {
            var subSize = 0;
            var subLabel;
            var subLabelWidth;
            do {
              subLabel = '...'.concat(label.substring(subSize, label.length));
              subLabelWidth = canvas.myMeasureText(subLabel, axisFontSize);
              subSize += 1;
            } while (labelX - subLabelWidth - axisValuePadding <= axisValuePadding);
            canvas.fillText(subLabel, labelX - subLabelWidth - axisValuePadding, labelY);
          }
        } else {
          if (labelX + labelWidth + axisValuePadding < this.width - axisValuePadding) {
            canvas.fillText(label, labelX, labelY);
          } else {
            var subSize = label.length;
            var subLabel;
            var subLabelWidth;
            do {
              subLabel = label.substring(0, subSize).concat('...');
              subLabelWidth = canvas.myMeasureText(subLabel, axisFontSize);
              subSize -= 1;
            } while (labelX + subLabelWidth + axisValuePadding >= this.width - axisValuePadding);
            canvas.fillText(subLabel, labelX + axisValuePadding, labelY);
          }
        }
      }

      var ySize = y1Ticks.length;
      for (var i = 0; i < ySize; i++) {
        var subRadius = polarRadius * i / (ySize - 1);
        if (i < ySize - 1) {
          var labelWidth = canvas.myMeasureText(y1Ticks[i], axisFontSize);

          canvas.setFillStyle(axisFontColor);
          canvas.fillText(y1Ticks[i], centerX - labelWidth, centerY - subRadius);
        }
      }
    }
  }, {
    key: 'drawAxis',
    value: function drawAxis(canvas) {
      var process = this.process;

      var polarWidth = this.polarWidth;
      var polarRadius = polarWidth / 2;
      var xAxisData = this.xAxisData;
      var y1Ticks = this.y1Ticks;
      var axisEnable = this.axisEnable;
      var axisFontSize = this.axisFontSize;
      var axisLineColor = this.axisLineColor;
      var axisHighLightEnable = this.axisHighLightEnable;
      var axisHighLightColor = this.axisHighLightColor;
      var axisFontColor = this.axisFontColor;
      var axisLineWidth = this.axisLineWidth;
      var arcType = this.arcType;
      var axisValuePadding = this.axisValuePadding;

      var centerX = this.width / 2;
      var centerY = this.height / 2;

      canvas.setFontSize(axisFontSize);
      canvas.setLineWidth(axisLineWidth);
      canvas.setLineJoin('miter');

      var preAngle = 2 * Math.PI / xAxisData.length;
      var startAngle = this.startAngle;

      for (var i = 0; i < xAxisData.length; i++) {
        var x = centerX + polarRadius * Math.cos(preAngle * i + startAngle);
        var y = centerY + polarRadius * Math.sin(preAngle * i + startAngle);

        canvas.setStrokeStyle(axisHighLightEnable && i == this.highLightIndex ? axisHighLightColor : axisLineColor);
        canvas.setLineWidth(axisHighLightEnable && i == this.highLightIndex ? axisLineWidth * 2 : axisLineWidth);
        canvas.beginPath();
        canvas.moveTo(centerX, centerY);
        canvas.lineTo(x, y);
        canvas.stroke();
        canvas.closePath();
      }

      canvas.setLineWidth(axisLineWidth);
      var ySize = y1Ticks.length;
      for (var i = 0; i < ySize; i++) {
        var subRadius = polarRadius * i / (ySize - 1);

        canvas.setStrokeStyle(axisLineColor);
        canvas.beginPath();
        if (arcType == 'arc') {
          canvas.arc(centerX, centerY, subRadius, 0, 2 * Math.PI);
        } else {
          var points = [];
          for (var j = 0; j < xAxisData.length; j++) {
            var x = centerX + subRadius * Math.cos(preAngle * j + startAngle);
            var y = centerY + subRadius * Math.sin(preAngle * j + startAngle);
            points.push({ x: x, y: y });
          }

          points.map(function (point, index) {
            canvas[index == 0 ? 'moveTo' : 'lineTo'](point.x, point.y);
          });
        }
        canvas.closePath();
        canvas.stroke();
      }
    }
  }, {
    key: 'drawLegend',
    value: function drawLegend(canvas) {
      var chartPadding = this.chartPadding;
      var legendFontSize = this.legendFontSize;
      var legendPaddingTop = this.legendPaddingTop;
      var legendTextColor = this.legendTextColor;

      canvas.setFontSize(legendFontSize);

      var legendList = [];
      this.data.map(function (layer, index) {
        if (layer.seriesName) {
          layer.seriesName.map(function (name, index) {
            legendList.push(name);
          });
        } else {
          legendList.push(layer.name);
        }
      });
      this.legendList = legendList;

      var legendWidth = 0;
      var isMultiLine = false;
      for (var i = 0; i < legendList.length; i++) {
        var legend = legendList[i];
        if (legendWidth > 0) {
          legendWidth += legendFontSize;
        }

        legendWidth += canvas.myMeasureText(legend, legendFontSize) + legendFontSize * 1.2;
        if (legendWidth > this.width - this.chartPadding * 2) {
          isMultiLine = true;
        }
      }

      this.legendWidth = legendWidth;
      this.isMultiLine = isMultiLine;

      if (!isMultiLine) {
        var startX = (this.width - legendWidth) / 2;
        var startY = this.height / 2 + this.polarWidth / 2 + legendPaddingTop;
        for (var i = 0; i < legendList.length; i++) {
          var legend = legendList[i];
          var textWidth = canvas.myMeasureText(legend, legendFontSize);
          if (startX + textWidth + legendFontSize * 1.2 > this.width - chartPadding) {
            startX = chartPadding;
            startY += legendFontSize * 1.5;
          }

          var seriesColor = this.getColor(i);
          canvas.setFillStyle(seriesColor);
          canvas.beginPath();
          canvas.arc(startX + legendFontSize / 2, startY + legendFontSize / 2, legendFontSize / 2, 0, 2 * Math.PI);
          canvas.fill();
          canvas.closePath();

          startX += legendFontSize * 1.2;
          if (this.isHiddenSeries(i)) {
            canvas.setFillStyle(seriesColor);
          } else {
            canvas.setFillStyle(legendTextColor);
          }
          canvas.fillText(legend, startX, startY + legendFontSize);

          startX += textWidth + legendFontSize;
        }
      } else {
        var startX = chartPadding;
        var startY = this.height / 2 + this.polarWidth / 2 + legendPaddingTop;

        if (startX + legendFontSize * 1.2 * legendList.length > this.width) {
          //legend数量过多
          canvas.setFillStyle(this.getColor(0));
          canvas.fillRect(startX, startY, legendFontSize, legendFontSize);
          startX += legendFontSize * 1.2;

          var betweenText = "~";
          var btwTextWidth = canvas.myMeasureText(betweenText, legendFontSize);
          canvas.setFillStyle(legendTextColor);
          canvas.fillText(betweenText, startX, startY + legendFontSize);
          startX += btwTextWidth + legendFontSize * 0.2;

          canvas.setFillStyle(this.getColor(legendList.length - 1));
          canvas.fillRect(startX, startY, legendFontSize, legendFontSize);
          startX += legendFontSize * 1.2;
        } else {
          for (var i = 0; i < legendList.length; i++) {
            canvas.setFillStyle(this.getColor(i));
            canvas.fillRect(startX, startY, legendFontSize, legendFontSize);
            startX += legendFontSize * 1.2;
          }
        }
        startX += legendFontSize * 0.3;
        var simpleText = legendList[0] + '~' + legendList[legendList.length - 1];
        var spTextWidth = canvas.myMeasureText(simpleText, legendFontSize);
        canvas.setFillStyle(legendTextColor);
        canvas.fillText(simpleText, startX, startY + legendFontSize);
      }
    }
  }, {
    key: 'drawNoData',
    value: function drawNoData(canvas) {
      var text = this.noDataText;
      var textWidth = canvas.myMeasureText(text, this.noDataFontSize);
      canvas.setFillStyle(this.noDataTextColor);
      canvas.fillText(text, (this.width - textWidth) / 2, (this.height + this.noDataFontSize) / 2);
    }
  }]);
  return Polar;
}();

var polar = Polar;

/***
 * chart.js 图形绘制逻辑的统一入口
 * TODO list
 * 3. axis title
 * 8. 打印输出接口支持 （canvas.toDataURL)
 * 9. Axis 高级功能
 * 10. trendline 趋势线
 */

var Chart = function () {
  function Chart() {
    classCallCheck(this, Chart);
  }

  createClass(Chart, [{
    key: 'drawChart',
    value: function drawChart(canvasId, chartWidth, chartHeight, model) {
      var isPreview = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : false;
      var extraOpts = arguments.length > 5 && arguments[5] !== undefined ? arguments[5] : {};
      var dpi = arguments.length > 6 && arguments[6] !== undefined ? arguments[6] : 1;

      var defaultOpts = { canvas: chartUtil.createCanvas(canvasId), width: chartWidth, height: chartHeight };

      if (!model.isValidModel()) {
        return null;
      }

      if (model.isNoData()) {
        console.log('no data returned from model');
      }

      var API = null;
      var assign = Object.assign;
      var chartOptions = model.getChartInfo();
      var majorType = chartOptions.majorType;
      var subType = chartOptions.subtype;

      extraOpts = extraOpts || {};
      if (isPreview) {
        extraOpts.drawDataLabel = false;
        extraOpts.drawExtraDataLabel = false;
      }

      var paddingLeft;
      var paddingRight;
      var paddingTop;
      var paddingBottom;
      var secondaryAxisEnable = !isPreview && !model.isNoData() && model.isDualAxis(); //非preview， 有数据，且有Y2
      if (secondaryAxisEnable) {
        if (extraOpts.isHorizontal) {
          paddingTop = 40;
          paddingBottom = 40;
          paddingLeft = 40;
          paddingRight = 20;
        } else {
          paddingTop = 20;
          paddingBottom = 40;
          paddingLeft = 40;
          paddingRight = 40;
        }
      } else if (!isPreview) {
        paddingLeft = 40;
        paddingRight = 20;
        paddingTop = 20;
        paddingBottom = 40;
      } else {
        paddingLeft = 5;
        paddingRight = 5;
        paddingTop = 5;
        paddingBottom = 5;
      }

      extraOpts = assign(extraOpts || {}, {
        legendEnable: !isPreview,
        axisEnable: !isPreview,
        chartPadding: (isPreview ? 5 : 40) * dpi,
        chartPaddingLeft: paddingLeft * dpi,
        chartPaddingRight: paddingRight * dpi,
        chartPaddingTop: paddingTop * dpi,
        chartPaddingBottom: paddingBottom * dpi,
        sliceSpace: (isPreview ? 0.5 : 1) * dpi,
        bulletWidth: (isPreview ? 2 : 3) * dpi,
        lineWidth: (isPreview ? 1 : 2) * dpi,
        circleRadius: (isPreview ? 1.5 : 3) * dpi,
        dashedLineWidth: (isPreview ? 4 : 8) * dpi,
        secondaryAxisEnable: secondaryAxisEnable,
        drawWithAnimation: !(model && model.isHeavyChart()),
        dataLabelFontSize: 8 * dpi,
        dataLabelPadding: 4 * dpi,
        axisFontSize: 10 * dpi,
        axisValuePadding: 5 * dpi,
        axisLineWidth: 1 * dpi,
        legendFontSize: 10 * dpi,
        legendPadding: 5 * dpi,
        legendPaddingTop: 60 * dpi,
        toolTipPadding: 10 * dpi,
        toolTipTextPadding: 8 * dpi,
        toolTipFontSize: 10 * dpi,
        toolTipSplitLineWidth: 1 * dpi,
        highlightRadius: 15 * dpi,
        noDataFontSize: 11 * dpi,
        polarWidth: isPreview ? 0 : 300
      });

      switch (majorType) {
        case 'pie':
          extraOpts.drawDataLabel = !isPreview;
          API = chart.drawPie;
          break;
        case 'scatter':
          API = chart.drawScatter;
          break;
        case 'mix':
          API = subType === 'polar' ? chart.drawPolar : chart.drawMix;
          break;
        case 'kpi':
          extraOpts = assign(extraOpts, {
            fontSizeLarge: (isPreview ? 22 : 30) * dpi,
            fontSizeMedium: (isPreview ? 16 : 22) * dpi,
            fontSizeSmall: (isPreview ? 11 : 16) * dpi,
            textPadding: (isPreview ? 6 : 10) * dpi
          });
          API = chart.drawKpi;
          break;
        case 'singleValue':
          extraOpts = assign(extraOpts, {
            fontSize: (isPreview ? 22 : 30) * dpi
          });
          API = chart.drawSingleValue;
          break;
        case 'gauge':
          extraOpts = assign(extraOpts, {
            valueFontSize: (isPreview ? 20 : 36) * dpi,
            limitFontSize: (isPreview ? 10 : 14) * dpi
          });
          API = chart.drawGauge;
          break;
        case 'funnel':
          extraOpts.drawAxisLabel = !isPreview;
          API = chart.drawFunnel;
          break;
      }

      if (API) {
        return API(assign({}, defaultOpts, chartOptions, extraOpts));
      }

      return null;
    }
  }, {
    key: 'drawPie',
    value: function drawPie(opts) {
      return new pie(opts);
    }
  }, {
    key: 'drawScatter',
    value: function drawScatter(opts) {
      return new scatter(opts);
    }
  }, {
    key: 'drawMix',
    value: function drawMix(opts) {
      return new mix(opts);
    }
  }, {
    key: 'drawKpi',
    value: function drawKpi(opts) {
      return new kpi(opts);
    }
  }, {
    key: 'drawSingleValue',
    value: function drawSingleValue(opts) {
      return new singleValue(opts);
    }
  }, {
    key: 'drawGauge',
    value: function drawGauge(opts) {
      return new gauge(opts);
    }
  }, {
    key: 'drawFunnel',
    value: function drawFunnel(opts) {
      return new funnel(opts);
    }
  }, {
    key: 'drawPolar',
    value: function drawPolar(opts) {
      return new polar(opts);
    }
  }]);
  return Chart;
}();

var chart = new Chart();
var chart_1 = chart;

return chart_1;

}());
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibGVnZW5kLmpzIiwic291cmNlcyI6WyIuLi8uLi9zcmMvY2hhcnRVdGlsLmpzIiwiLi4vLi4vc3JjL3BpZS5qcyIsIi4uLy4uL3NyYy9zY2F0dGVyLmpzIiwiLi4vLi4vc3JjL21peC5qcyIsIi4uLy4uL3NyYy9rcGkuanMiLCIuLi8uLi9zcmMvc2luZ2xlVmFsdWUuanMiLCIuLi8uLi9zcmMvZ2F1Z2UuanMiLCIuLi8uLi9zcmMvZnVubmVsLmpzIiwiLi4vLi4vc3JjL3BvbGFyLmpzIiwiLi4vLi4vY2hhcnQuanMiXSwic291cmNlc0NvbnRlbnQiOlsiY29uc3QgY29sb3JzID0gWycjN2NiNWVjJywgJyNmN2EzNWMnLCAnIzQzNDM0OCcsICcjOTBlZDdkJywgJyNmMTVjODAnLCAnIzgwODVlOScsICcjRTREMzU0JywgJyMyQjkwOEYnLCAnI0Y0NUI1QicsICcjOTFFOEUxJywgJyM3Q0I1RUMnLCAnIzQzNDM0OCddXG5jb25zdCBnZXRDb2xvciA9IGZ1bmN0aW9uIChpbmRleCkge1xuICByZXR1cm4gY29sb3JzW2luZGV4ICUgY29sb3JzLmxlbmd0aF1cbn1cblxuY29uc3QgcmdiYVRvUmdiID0gKHIsIGcsIGIsIGEpID0+IHtcbiAgICBjb25zdCByMyA9IE1hdGgucm91bmQoKCgxIC0gYSkgKiAyNTUpICsgKGEgKiByKSlcbiAgICBjb25zdCBnMyA9IE1hdGgucm91bmQoKCgxIC0gYSkgKiAyNTUpICsgKGEgKiBnKSlcbiAgICBjb25zdCBiMyA9IE1hdGgucm91bmQoKCgxIC0gYSkgKiAyNTUpICsgKGEgKiBiKSlcbiAgICByZXR1cm4gYHJnYigke3IzfSwke2czfSwke2IzfSlgXG59XG5cbi8vIGNvbnN0IGhleFRvUmdiID0gKGhleCwgYmFzZSA9IDE2KSA9PiB7XG4vLyAgICAgY29uc3QgcmVzdWx0ID0gL14jPyhbYS1mXFxkXXsyfSkoW2EtZlxcZF17Mn0pKFthLWZcXGRdezJ9KSQvaS5leGVjKGhleClcbi8vICAgICByZXR1cm4gcmVzdWx0ID8ge1xuLy8gICAgICAgICByOiBwYXJzZUludChyZXN1bHRbMV0sIGJhc2UpLFxuLy8gICAgICAgICBnOiBwYXJzZUludChyZXN1bHRbMl0sIGJhc2UpLFxuLy8gICAgICAgICBiOiBwYXJzZUludChyZXN1bHRbM10sIGJhc2UpLFxuLy8gICAgIH0gOiBudWxsXG4vLyB9XG5cbmNvbnN0IG1lYXN1cmVUZXh0ID0gZnVuY3Rpb24odGV4dCwgZm9udFNpemUpIHtcbiAgICBpZiAodHlwZW9mIHd4ICE9PSAndW5kZWZpbmVkJykge1xuICAgICAgICAvLyB3eCBjYW52YXMg5pyq5a6e546wbWVhc3VyZVRleHTmlrnms5UsIOatpOWkhOiHquihjOWunueOsFxuICAgICAgICB0ZXh0ID0gU3RyaW5nKHRleHQpO1xuICAgICAgICB2YXIgdGV4dCA9IHRleHQuc3BsaXQoJycpO1xuICAgICAgICB2YXIgd2lkdGggPSAwO1xuICAgICAgICB0ZXh0LmZvckVhY2goZnVuY3Rpb24gKGl0ZW0pIHtcbiAgICAgICAgICBpZiAoL1thLXpBLVpdLy50ZXN0KGl0ZW0pKSB7XG4gICAgICAgICAgICB3aWR0aCArPSA3O1xuICAgICAgICAgIH0gZWxzZSBpZiAoL1swLTldLy50ZXN0KGl0ZW0pKSB7XG4gICAgICAgICAgICB3aWR0aCArPSA1LjU7XG4gICAgICAgICAgfSBlbHNlIGlmICgvXFwuLy50ZXN0KGl0ZW0pKSB7XG4gICAgICAgICAgICB3aWR0aCArPSAyLjc7XG4gICAgICAgICAgfSBlbHNlIGlmICgvLS8udGVzdChpdGVtKSkge1xuICAgICAgICAgICAgd2lkdGggKz0gMy4yNTtcbiAgICAgICAgICB9IGVsc2UgaWYgKC9bXFx1NGUwMC1cXHU5ZmE1XS8udGVzdChpdGVtKSkge1xuICAgICAgICAgICAgd2lkdGggKz0gMTA7XG4gICAgICAgICAgfSBlbHNlIGlmICgvXFwofFxcKS8udGVzdChpdGVtKSkge1xuICAgICAgICAgICAgd2lkdGggKz0gMy43MztcbiAgICAgICAgICB9IGVsc2UgaWYgKC9cXHMvLnRlc3QoaXRlbSkpIHtcbiAgICAgICAgICAgIHdpZHRoICs9IDIuNTtcbiAgICAgICAgICB9IGVsc2UgaWYgKC8lLy50ZXN0KGl0ZW0pKSB7XG4gICAgICAgICAgICB3aWR0aCArPSA4O1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB3aWR0aCArPSAxMDtcbiAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgICByZXR1cm4gd2lkdGggKiBmb250U2l6ZSAvIDEwO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIHZhciBjdXJyRm9udCA9IHRoaXMuZm9udFxuICAgICAgICB0aGlzLmZvbnQgPSBgJHtmb250U2l6ZX1weCBzZXJpZmBcbiAgICAgICAgdmFyIHdpZHRoID0gdGhpcy5tZWFzdXJlVGV4dCh0ZXh0KS53aWR0aFxuICAgICAgICB0aGlzLmZvbnQgPSBjdXJyRm9udFxuICAgICAgICByZXR1cm4gd2lkdGhcbiAgICB9XG59XG5cbmNvbnN0IFRpbWluZyA9IHtcbiAgZWFzZUluOiBmdW5jdGlvbiBlYXNlSW4ocG9zKSB7XG4gICAgcmV0dXJuIE1hdGgucG93KHBvcywgMylcbiAgfSxcblxuICBlYXNlT3V0OiBmdW5jdGlvbiBlYXNlT3V0KHBvcykge1xuICAgIHJldHVybiBNYXRoLnBvdyhwb3MgLSAxLCAzKSArIDFcbiAgfSxcblxuICBlYXNlSW5PdXQ6IGZ1bmN0aW9uIGVhc2VJbk91dChwb3MpIHtcbiAgICBpZiAoKHBvcyAvPSAwLjUpIDwgMSkge1xuICAgICAgcmV0dXJuIDAuNSAqIE1hdGgucG93KHBvcywgMylcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIDAuNSAqIChNYXRoLnBvdyhwb3MgLSAyLCAzKSArIDIpXG4gICAgfVxuICB9LFxuXG4gIGxpbmVhcjogZnVuY3Rpb24gbGluZWFyKHBvcykge1xuICAgIHJldHVybiBwb3NcbiAgfVxufVxuXG5cbmNvbnN0IEFuaW1hdGlvbiA9IGZ1bmN0aW9uKG9wdHMpIHtcbiAgdGhpcy5pc1N0b3AgPSBmYWxzZVxuICBvcHRzLmR1cmF0aW9uID0gdHlwZW9mIG9wdHMuZHVyYXRpb24gPT09ICd1bmRlZmluZWQnID8gMTAwMCA6IG9wdHMuZHVyYXRpb25cbiAgb3B0cy50aW1pbmcgPSBvcHRzLnRpbWluZyB8fCAnbGluZWFyJ1xuXG4gIHZhciBkZWxheSA9IDE3XG5cbiAgdmFyIGNyZWF0ZUFuaW1hdGlvbkZyYW1lID0gZnVuY3Rpb24gY3JlYXRlQW5pbWF0aW9uRnJhbWUoKSB7XG4gICAgaWYgKHR5cGVvZiByZXF1ZXN0QW5pbWF0aW9uRnJhbWUgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgICByZXR1cm4gcmVxdWVzdEFuaW1hdGlvbkZyYW1lXG4gICAgfSBlbHNlIGlmICh0eXBlb2Ygc2V0VGltZW91dCAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgIHJldHVybiBmdW5jdGlvbiAoc3RlcCwgZGVsYXkpIHtcbiAgICAgICAgc2V0VGltZW91dChmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgdmFyIHRpbWVTdGFtcCA9ICtuZXcgRGF0ZSgpXG4gICAgICAgICAgc3RlcCh0aW1lU3RhbXApXG4gICAgICAgIH0sIGRlbGF5KVxuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gZnVuY3Rpb24gKHN0ZXApIHtcbiAgICAgICAgc3RlcChudWxsKVxuICAgICAgfTtcbiAgICB9XG4gIH07XG4gIHZhciBhbmltYXRpb25GcmFtZSA9IGNyZWF0ZUFuaW1hdGlvbkZyYW1lKClcbiAgdmFyIHN0YXJ0VGltZVN0YW1wID0gbnVsbFxuICB2YXIgX3N0ZXAgPSBmdW5jdGlvbiBzdGVwKHRpbWVzdGFtcCkge1xuICAgIGlmICh0aW1lc3RhbXAgPT09IG51bGwgfHwgdGhpcy5pc1N0b3AgPT09IHRydWUpIHtcbiAgICAgIG9wdHMub25Qcm9jZXNzICYmIG9wdHMub25Qcm9jZXNzKDEpXG4gICAgICBvcHRzLm9uQW5pbWF0aW9uRmluaXNoICYmIG9wdHMub25BbmltYXRpb25GaW5pc2goKVxuICAgICAgcmV0dXJuXG4gICAgfVxuICAgIGlmIChzdGFydFRpbWVTdGFtcCA9PT0gbnVsbCkge1xuICAgICAgc3RhcnRUaW1lU3RhbXAgPSB0aW1lc3RhbXBcbiAgICB9XG4gICAgaWYgKHRpbWVzdGFtcCAtIHN0YXJ0VGltZVN0YW1wIDwgb3B0cy5kdXJhdGlvbikge1xuICAgICAgdmFyIHByb2Nlc3MgPSAodGltZXN0YW1wIC0gc3RhcnRUaW1lU3RhbXApIC8gb3B0cy5kdXJhdGlvblxuICAgICAgdmFyIHRpbWluZ0Z1bmN0aW9uID0gVGltaW5nW29wdHMudGltaW5nXVxuICAgICAgcHJvY2VzcyA9IHRpbWluZ0Z1bmN0aW9uKHByb2Nlc3MpXG4gICAgICBvcHRzLm9uUHJvY2VzcyAmJiBvcHRzLm9uUHJvY2Vzcyhwcm9jZXNzKVxuICAgICAgYW5pbWF0aW9uRnJhbWUoX3N0ZXAsIGRlbGF5KVxuICAgIH0gZWxzZSB7XG4gICAgICBvcHRzLm9uUHJvY2VzcyAmJiBvcHRzLm9uUHJvY2VzcygxKVxuICAgICAgb3B0cy5vbkFuaW1hdGlvbkZpbmlzaCAmJiBvcHRzLm9uQW5pbWF0aW9uRmluaXNoKClcbiAgICB9XG4gIH1cbiAgX3N0ZXAgPSBfc3RlcC5iaW5kKHRoaXMpXG5cbiAgYW5pbWF0aW9uRnJhbWUoX3N0ZXAsIGRlbGF5KVxufVxuXG5jb25zdCBjcmVhdGVDYW52YXMgPSBmdW5jdGlvbiAoY2FudmFzSWQpIHtcbiAgaWYgKHR5cGVvZiB3eCAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICBsZXQgd3hDYW52YXMgPSB3eC5jcmVhdGVDYW52YXNDb250ZXh0KGNhbnZhc0lkKVxuICAgIHd4Q2FudmFzLm1lYXN1cmVUZXh0ID0gbWVhc3VyZVRleHRcbiAgICByZXR1cm4gd3hDYW52YXNcbiAgfVxuXG4gIGxldCBjYW52YXMgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChjYW52YXNJZClcbiAgaWYgKGNhbnZhcykge1xuICAgIGNhbnZhcyA9IGNhbnZhcy5nZXRDb250ZXh0KCcyZCcpXG5cbiAgICAvL3BvbHlmaWxsIHRvIHdlYi5cbiAgICBjYW52YXMuc2V0U3Ryb2tlU3R5bGUgPSBjYW52YXMuc2V0U3Ryb2tlU3R5bGUgfHwgZnVuY3Rpb24gKHN0eWxlKSB7XG4gICAgICB0aGlzLnN0cm9rZVN0eWxlID0gc3R5bGVcbiAgICB9XG5cbiAgICBjYW52YXMuc2V0RmlsbFN0eWxlID0gY2FudmFzLnNldEZpbGxTdHlsZSB8fCBmdW5jdGlvbiAoc3R5bGUpIHtcbiAgICAgIHRoaXMuZmlsbFN0eWxlID0gc3R5bGVcbiAgICB9XG5cbiAgICBjYW52YXMuc2V0TGluZVdpZHRoID0gY2FudmFzLnNldExpbmVXaWR0aCB8fCBmdW5jdGlvbiAodykge1xuICAgICAgdGhpcy5saW5lV2lkdGggPSB3XG4gICAgfVxuXG4gICAgY2FudmFzLnNldExpbmVKb2luID0gY2FudmFzLnNldExpbmVKb2luIHx8IGZ1bmN0aW9uIChqKSB7XG4gICAgICB0aGlzLmxpbmVKb2luID0galxuICAgIH1cblxuICAgIGNhbnZhcy5zZXRGb250U2l6ZSA9IGNhbnZhcy5zZXRGb250U2l6ZSB8fCBmdW5jdGlvbiAocykge1xuICAgICAgdGhpcy5mb250ID0gYCR7c31weCBzZXJpZmBcbiAgICB9XG5cbiAgICBjYW52YXMuc2V0TGluZUNhcCA9IGNhbnZhcy5zZXRMaW5lQ2FwIHx8IGZ1bmN0aW9uIChzKSB7XG4gICAgICB0aGlzLmxpbmVDYXAgPSBzXG4gICAgfVxuXG4gICAgY2FudmFzLnNldExpbmVKb2luID0gY2FudmFzLnNldExpbmVKb2luIHx8IGZ1bmN0aW9uIChzKSB7XG4gICAgICB0aGlzLmxpbmVKb2luID0gc1xuICAgIH1cblxuICAgIGNhbnZhcy5zZXRNaXRlckxpbWl0ID0gY2FudmFzLnNldE1pdGVyTGltaXQgfHwgZnVuY3Rpb24gKHMpIHtcbiAgICAgIHRoaXMubWl0ZXJMaW1pdCA9IHNcbiAgICB9XG5cbiAgICBjYW52YXMuc2V0VGV4dEFsaWduID0gY2FudmFzLnNldFRleHRBbGlnbiB8fCBmdW5jdGlvbiAocykge1xuICAgICAgdGhpcy50ZXh0QWxpZ24gPSBzXG4gICAgfVxuXG4gICAgY2FudmFzLnNldEdsb2JhbEFscGhhID0gY2FudmFzLnNldEdsb2JhbEFscGhhIHx8IGZ1bmN0aW9uIChzKSB7XG4gICAgICB0aGlzLmdsb2JhbEFscGhhID0gc1xuICAgIH1cblxuICAgIGNhbnZhcy5zZXRTaGFkb3cgPSBjYW52YXMuc2V0U2hhZG93IHx8IGZ1bmN0aW9uIChvZmZzZXRYID0gMCwgb2Zmc2V0WSA9IDAsIGJsdXIgPSAwICwgY29sb3IgPSAnYmxhY2snKSB7XG4gICAgICB0aGlzLnNoYWRvd09mZnNldFggPSBvZmZzZXRYXG4gICAgICB0aGlzLnNoYWRvd09mZnNldFkgPSBvZmZzZXRYXG4gICAgICB0aGlzLnNoYWRvd0JsdXIgPSBibHVyXG4gICAgICB0aGlzLnNoYWRvd0NvbG9yID0gY29sb3JcbiAgICB9XG5cbiAgICAvL2NvbXBhdGliaWxpdHkgdG8gb3JpZ2luYWwgd2VjaGF0IGxvZ2ljXG4gICAgY2FudmFzLmNsZWFyUmVjdCA9IGNhbnZhcy5jbGVhclJlY3QgfHwgZnVuY3Rpb24gKCkgeyBjb25zb2xlLmxvZygnY2FudmFzIGNsZWFyZWQnKX1cblxuICAgIGNhbnZhcy5kcmF3ID0gY2FudmFzLmRyYXcgfHwgZnVuY3Rpb24gKCkgeyBjb25zb2xlLmxvZygnY2hhcnQgcmVuZGVyZWQnKSB9XG5cbiAgICBjYW52YXMubXlNZWFzdXJlVGV4dCA9IG1lYXN1cmVUZXh0XG5cbiAgICByZXR1cm4gIGNhbnZhc1xuICB9XG5cbiAgcmV0dXJuIG51bGxcbn1cblxuXG5tb2R1bGUuZXhwb3J0cyA9IHsvKiBtZWFzdXJlVGV4dCwqLyBBbmltYXRpb24sIGdldENvbG9yLCAvKmhleFRvUmdiLCovIGNyZWF0ZUNhbnZhcyB9XG4iLCIvKipcbiAqIOe7mOWItumlvOWbvuatpemqpFxuICogMS4g57uY5Yi25YWl5Y+jZHJhdygpXG4gKiAyLiDorqHnrpfmlbDmja7mgLvlkowsIOehruWumuWQhOWIhueJh+Wkp+Wwj1xuICogMy4g57uY5Yi25YiG54mH5Y+K5YiG54mH5Y2g5q+U5pWw5YC8LCDlhaXlj6NkcmF3U2xpY2VBcmMoKVxuICogIDMuMSAg6K6h566X5YiG54mH57uY5Yi26KeS5bqm5aSn5bCPXG4gKiAgMy4yICDorqHnrpfliIbniYfpl7TpmpTlpKflsI8sIOiuoeeul+WchuW/g+WBj+enu+eCuVxuICogIDMuMyAg57uY5Yi25byn5b2i77yM6L+e5o6l5ZyG5b+D5YGP56e754K5LCDlvaLmiJDlsIHpl60sIGZpbGxcbiAqICAzLjQgIOiuoeeul+aVsOWAvOaWh+acrOe7mOWItueCuSwg5Y+W5byn5bqm5Lit5b+DXG4gKiA0LiDnu5jliLZMZWdlbmQsIOWFpeWPo2RyYXdMZWdlbmQoKVxuICogIDQuMSAg6K6h566X5bmz6ZO65byA6ZyA6KaB55qE5a695bqm5Y+K5piv5ZCm6ZyA6KaB5o2i6KGMXG4gKiAgNC4yICDkuI3pnIDopoHmjaLooYzliJnlsYXkuK3lvIDlp4vpgJDkuKrnu5jliLZcbiAqICA0LjMgIOmcgOimgeaNouihjOWImeiuoeeul2xlZ2VuZOaVsOmHj+aYr+WQpui/h+Wkmiwg6L+H5aSa5YiZ55yB55Wl57uY5Yi2LCDlj43kuYvliJfkuL7popzoibIsIOaWh+acrOe7mOWItuiMg+WbtFxuICovXG52YXIgY2hhcnRVdGlscyA9IHJlcXVpcmUoJy4vY2hhcnRVdGlsLmpzJylcbmNvbnN0IHtBbmltYXRpb259ID0gY2hhcnRVdGlsc1xuXG5jbGFzcyBQaWUge1xuICBjb25zdHJ1Y3RvcihvcHRzKSB7XG4gICAgY29uc29sZS5sb2cob3B0cylcblxuICAgIGxldCB7ZGF0YSwgd2lkdGgsIGhlaWdodH0gPSBvcHRzXG4gICAgdGhpcy5jYW52YXMgPSBvcHRzLmNhbnZhc1xuICAgIHRoaXMud2lkdGggPSB3aWR0aFxuICAgIHRoaXMuaGVpZ2h0ID0gaGVpZ2h0XG4gICAgdGhpcy5oaWdoTGlnaHRJbmRleCA9IC0xXG4gICAgdGhpcy5jaGFydFBhZGRpbmcgPSBvcHRzLmNoYXJ0UGFkZGluZyB8fCA0MFxuICAgIHRoaXMubGVnZW5kUGFkZGluZyA9IG9wdHMubGVnZW5kUGFkZGluZyB8fCA1XG4gICAgdGhpcy5sZWdlbmRGb250U2l6ZSA9IG9wdHMubGVnZW5kRm9udFNpemUgfHwgMTBcbiAgICB0aGlzLnJhZGl1cyA9ICh0aGlzLndpZHRoIDwgdGhpcy5oZWlnaHQgPyB0aGlzLndpZHRoIDogdGhpcy5oZWlnaHQpIC8gMiAtIHRoaXMuY2hhcnRQYWRkaW5nXG4gICAgdGhpcy5oaWdobGlnaHRSYWRpdXMgPSBvcHRzLmhpZ2hsaWdodFJhZGl1cyB8fCAxNVxuICAgIHRoaXMudG90YWwgPSBvcHRzLnRvdGFsIHx8IDBcblxuICAgIHRoaXMuZHJhd1dpdGhBbmltYXRpb24gPSBvcHRzLmRyYXdXaXRoQW5pbWF0aW9uID09PSB1bmRlZmluZWQgPyB0cnVlIDogb3B0cy5kcmF3V2l0aEFuaW1hdGlvblxuXG4gICAgdGhpcy5ub0RhdGEgPSBvcHRzLm5vRGF0YSB8fCBmYWxzZVxuICAgIHRoaXMubm9EYXRhVGV4dCA9IG9wdHMubm9EYXRhVGV4dCB8fCAn5pqC5peg5pWw5o2uJ1xuICAgIHRoaXMubm9EYXRhVGV4dENvbG9yID0gb3B0cy5ub0RhdGFUZXh0Q29sb3IgfHwgJyM2OUI1RkMnXG4gICAgdGhpcy5ub0RhdGFGb250U2l6ZSA9IG9wdHMubm9EYXRhRm9udFNpemUgfHwgMTFcbiAgICB0aGlzLmRhdGEgPSBkYXRhXG5cbiAgICB0aGlzLnNsaWNlU3BhY2UgPSBvcHRzLnNsaWNlU3BhY2UgfHwgMC41XG4gICAgdGhpcy5sZWdlbmRFbmFibGUgPSBvcHRzLmxlZ2VuZEVuYWJsZSB8fCBmYWxzZVxuICAgIHRoaXMuZHJhd0RhdGFMYWJlbCA9IG9wdHMuZHJhd0RhdGFMYWJlbCB8fCBmYWxzZVxuICAgIHRoaXMuZGF0YUxhYmVsRm9udFNpemUgPSBvcHRzLmRhdGFMYWJlbEZvbnRTaXplIHx8IDhcbiAgICB0aGlzLmRhdGFsYWJlbENhbGxCYWNrID0gb3B0cy5kYXRhbGFiZWxDYWxsQmFjayB8fCBmdW5jdGlvbiAoKSB7IHJldHVybiAnJyB9XG5cbiAgICB0aGlzLnRvb2x0aXBDYWxsQmFjayA9IG9wdHMudG9vbHRpcENhbGxCYWNrXG4gICAgdGhpcy50b29sVGlwQmFja2dyb3VuZENvbG9yID0gb3B0cy50b29sVGlwQmFja2dyb3VuZENvbG9yIHx8ICdyZ2JhKDAsIDAsIDAsIDAuNiknXG4gICAgdGhpcy50b29sVGlwUGFkZGluZyA9IG9wdHMudG9vbFRpcFBhZGRpbmcgfHwgMTBcbiAgICB0aGlzLnRvb2xUaXBUZXh0UGFkZGluZyA9IG9wdHMudG9vbFRpcFRleHRQYWRkaW5nIHx8IDhcbiAgICB0aGlzLnRvb2xUaXBGb250U2l6ZSA9IG9wdHMudG9vbFRpcEZvbnRTaXplIHx8IDEwXG4gICAgdGhpcy50b29sVGlwU3BsaXRMaW5lV2lkdGggPSBvcHRzLnRvb2xUaXBTcGxpdExpbmVXaWR0aCB8fCAxXG4gICAgdGhpcy50b29sVGlwU3BsaXRMaW5lQ29sb3IgPSBvcHRzLnRvb2xUaXBTcGxpdExpbmVDb2xvciB8fCAnI2ZmZmZmZidcblxuICAgIHRoaXMubXV0ZUNhbGxiYWNrID0gb3B0cy5tdXRlQ2FsbGJhY2sgfHwgZnVuY3Rpb24gKCkgeyByZXR1cm4gJycgfVxuXG4gICAgdmFyIGNvbG9ycyA9IFsnIzdjYjVlYycsICcjZjdhMzVjJywgJyM0MzQzNDgnLCAnIzkwZWQ3ZCcsICcjZjE1YzgwJywgJyM4MDg1ZTknLCAnI0U0RDM1NCcsICcjMkI5MDhGJywgJyNGNDVCNUInLCAnIzkxRThFMScsICcjN0NCNUVDJywgJyM0MzQzNDgnXVxuICAgIHRoaXMuY29sb3JzID0gb3B0cy5jb2xvcnMgJiYgb3B0cy5jb2xvcnMuc2xpY2UoKSB8fCBjb2xvcnNcblxuICAgIHRoaXMuc2VyaWVzU3RhdHVzID0gb3B0cy5zZXJpZXNTdGF0dXMgfHwge30gLy9yZWFkIG9ubHlcbiAgICB0aGlzLm11dGVDYWxsQmFjayA9IG9wdHMubXV0ZUNhbGxCYWNrIHx8IGZ1bmN0aW9uICgpIHsgcmV0dXJuICcnIH1cbiAgICB0aGlzLnNlcmllc1N0YXR1cyA9IG9wdHMuc2VyaWVzU3RhdHVzXG5cbiAgICB0aGlzLmRyYXcoKVxuICB9XG5cbiAgZ2V0Q29sb3IoaW5kZXgpIHtcbiAgICBpZiAodGhpcy5pc0hpZGRlblNlcmllcyhpbmRleCkpIHtcbiAgICAgIHJldHVybiAnI2NjY2NjYydcbiAgICB9XG4gICAgcmV0dXJuIHRoaXMuY29sb3JzW2luZGV4ICUgdGhpcy5jb2xvcnMubGVuZ3RoXVxuICB9XG5cbiAgaXNIaWRkZW5TZXJpZXMoaW5kZXgpIHtcbiAgICByZXR1cm4gdGhpcy5zZXJpZXNTdGF0dXMgJiYgdGhpcy5zZXJpZXNTdGF0dXNbaW5kZXhdXG4gIH1cblxuICBnZXRDdXJyZW50RGF0YUluZGV4KGUpIHtcbiAgICB2YXIgaW5kZXggPSB0aGlzLmNhbGN1bGF0ZUNsaWNrUG9zaXRpb24oZSlcbiAgICBpZiAoaW5kZXggPT0gLTEpIHtcbiAgICAgIHJldHVybiB7fVxuICAgIH1cbiAgICByZXR1cm4gdGhpcy5kYXRhW2luZGV4XVxuICB9XG5cbiAgZ2V0Q3VycmVudEhpZ2hMaWdodEluZGV4KCkge1xuICAgIHJldHVybiB0aGlzLmhpZ2hMaWdodEluZGV4XG4gIH1cblxuICBjYWxjdWxhdGVDbGlja1Bvc2l0aW9uKGUsIGlzTW92ZSA9IGZhbHNlKSB7XG4gICAgaWYgKHRoaXMubm9EYXRhIHx8IHRoaXMucHJvY2VzcyAhPSAxKSB7XG4gICAgICByZXR1cm4gLTFcbiAgICB9XG4gICAgaWYgKGUudG91Y2hlcyAmJiBlLnRvdWNoZXMubGVuZ3RoKSB7XG4gICAgICB2YXIgeCA9IGUudG91Y2hlc1swXS54XG4gICAgICB2YXIgeSA9IGUudG91Y2hlc1swXS55XG5cbiAgICAgIHZhciBjaGFydFBhZGRpbmcgPSB0aGlzLmNoYXJ0UGFkZGluZ1xuICAgICAgdmFyIGxlZ2VuZFBhZGRpbmcgPSB0aGlzLmxlZ2VuZFBhZGRpbmdcbiAgICAgIHZhciBsZWdlbmRGb250U2l6ZSA9IHRoaXMubGVnZW5kRm9udFNpemVcbiAgICAgIHZhciBjZW50ZXJYID0gdGhpcy53aWR0aCAvIDJcbiAgICAgIHZhciBjZW50ZXJZID0gdGhpcy5oZWlnaHQgLyAyXG5cbiAgICAgIGlmIChNYXRoLnBvdyh4IC0gY2VudGVyWCwgMikgKyBNYXRoLnBvdyh5IC0gY2VudGVyWSwgMikgPD0gTWF0aC5wb3codGhpcy5yYWRpdXMsIDIpKSB7XG4gICAgICAgIHZhciBjdXJyQW5nbGUgPSB0aGlzLmdldEFuZ2xlRm9yUG9pbnQoeCwgeSlcbiAgICAgICAgdmFyIGFyY1BvaW50WCA9IGNlbnRlclggKyB0aGlzLnJhZGl1cyAqIE1hdGguY29zKGN1cnJBbmdsZSlcbiAgICAgICAgdmFyIGFyY1BvaW50WSA9IGNlbnRlclkgKyB0aGlzLnJhZGl1cyAqIE1hdGguc2luKGN1cnJBbmdsZSlcbiAgICAgICAgdmFyIGFuZ2xlID0gMFxuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMuZGF0YS5sZW5ndGg7IGkrKykge1xuICAgICAgICAgIHZhciBzbGljZSA9IHRoaXMuZGF0YVtpXVxuICAgICAgICAgIHZhciBlbmRBbmdsZSA9IGFuZ2xlICsgc2xpY2UucCAqIDIgKiBNYXRoLlBJO1xuICAgICAgICAgIGlmIChlbmRBbmdsZSA+ICgyICogTWF0aC5QSSkgJiYgKGVuZEFuZ2xlICUgKDIgKiBNYXRoLlBJKSA+IGN1cnJBbmdsZSkpIHtcbiAgICAgICAgICAgIHJldHVybiBpXG4gICAgICAgICAgfSBlbHNlIGlmIChhbmdsZSA8IGN1cnJBbmdsZSAmJiBlbmRBbmdsZSA+IGN1cnJBbmdsZSkge1xuICAgICAgICAgICAgcmV0dXJuIGlcbiAgICAgICAgICB9XG4gICAgICAgICAgYW5nbGUgPSBlbmRBbmdsZSAlICgyICogTWF0aC5QSSlcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICBpZiAoaXNNb3ZlKSB7XG4gICAgICAgIHJldHVybiAtMVxuICAgICAgfVxuXG4gICAgICAvL2NsaWNrIG9uIGxlZ2VuZCBhcmVhXG4gICAgICBpZiAoeCA+IGNoYXJ0UGFkZGluZyAmJiB4IDwgdGhpcy53aWR0aCAtIGNoYXJ0UGFkZGluZyAmJiB5ID4gdGhpcy5oZWlnaHQgLSBsZWdlbmRQYWRkaW5nICogMiAtIGxlZ2VuZEZvbnRTaXplICYmIHkgPCB0aGlzLmhlaWdodCkge1xuICAgICAgICB2YXIgbGVnZW5kV2lkdGggPSB0aGlzLmxlZ2VuZFdpZHRoXG4gICAgICAgIHZhciBpc011bHRpTGluZSA9IHRoaXMuaXNNdWx0aUxpbmVcblxuICAgICAgICBpZiAoIWlzTXVsdGlMaW5lKSB7XG4gICAgICAgICAgdmFyIHN0YXJ0WCA9ICh0aGlzLndpZHRoIC0gbGVnZW5kV2lkdGgpIC8gMlxuXG4gICAgICAgICAgaWYgKHggPj0gc3RhcnRYICYmIHggPD0gdGhpcy53aWR0aCAtIHN0YXJ0WCkge1xuICAgICAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLmRhdGEubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgICAgdmFyIHRleHRXaWR0aCA9IHRoaXMuY2FudmFzLm15TWVhc3VyZVRleHQodGhpcy5kYXRhW2ldLm5hbWUsIGxlZ2VuZEZvbnRTaXplKVxuICAgICAgICAgICAgICBpZiAoeCA8IHN0YXJ0WCArIHRleHRXaWR0aCArIGxlZ2VuZEZvbnRTaXplICogMi4yKSB7XG4gICAgICAgICAgICAgICAgdmFyIGNoYXJ0SW5mbyA9IHRoaXMubXV0ZUNhbGxiYWNrKGkpXG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coY2hhcnRJbmZvKVxuICAgICAgICAgICAgICAgIHRoaXMuZGF0YSA9IGNoYXJ0SW5mby5kYXRhXG4gICAgICAgICAgICAgICAgdGhpcy5zZXJpZXNTdGF0dXMgPSBjaGFydEluZm8uc2VyaWVzU3RhdHVzXG4gICAgICAgICAgICAgICAgdGhpcy5kcmF3KHRydWUsIGZhbHNlKVxuICAgICAgICAgICAgICAgIGJyZWFrXG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgc3RhcnRYICs9IGxlZ2VuZEZvbnRTaXplICogMi4yICsgdGV4dFdpZHRoXG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHZhciBzdGFydFggPSBjaGFydFBhZGRpbmdcblxuICAgICAgICAgIGlmIChzdGFydFggKyBsZWdlbmRGb250U2l6ZSAqIDEuMiAqIHRoaXMuZGF0YS5sZW5ndGggPD0gdGhpcy53aWR0aCkge1xuICAgICAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLmRhdGEubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgICAgaWYgKHggPCBzdGFydFggKyBsZWdlbmRGb250U2l6ZSAqIDEuMikge1xuICAgICAgICAgICAgICAgIHZhciBjaGFydEluZm8gPSB0aGlzLm11dGVDYWxsYmFjayhpKVxuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGNoYXJ0SW5mbylcbiAgICAgICAgICAgICAgICB0aGlzLmRhdGEgPSBjaGFydEluZm8uZGF0YVxuICAgICAgICAgICAgICAgIHRoaXMuc2VyaWVzU3RhdHVzID0gY2hhcnRJbmZvLnNlcmllc1N0YXR1c1xuICAgICAgICAgICAgICAgIHRoaXMuZHJhdyh0cnVlLCBmYWxzZSlcbiAgICAgICAgICAgICAgICBicmVha1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIHN0YXJ0WCArPSBsZWdlbmRGb250U2l6ZSAqIDEuMlxuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgcmV0dXJuIC0xXG4gICAgfVxuICAgIHJldHVybiAtMVxuICB9XG5cbiAgZ2V0QW5nbGVGb3JQb2ludCh4LCB5KSB7XG4gICAgdmFyIGNlbnRlclggPSB0aGlzLndpZHRoIC8gMlxuICAgIHZhciBjZW50ZXJZID0gdGhpcy5oZWlnaHQgLyAyXG5cbiAgICB2YXIgdHggPSB4IC0gY2VudGVyWCwgdHkgPSB5IC0gY2VudGVyWVxuICAgIHZhciBsZW5ndGggPSBNYXRoLnNxcnQodHggKiB0eCArIHR5ICogdHkpXG4gICAgdmFyIHIgPSBNYXRoLmFjb3ModHkgLyBsZW5ndGgpXG5cbiAgICB2YXIgYW5nbGUgPSByXG4gICAgaWYgKHggPiBjZW50ZXJYKSB7XG4gICAgICBhbmdsZSA9IDIgKiBNYXRoLlBJIC0gYW5nbGVcbiAgICB9XG4gICAgYW5nbGUgPSBhbmdsZSArIE1hdGguUEkgLyAyXG4gICAgaWYgKGFuZ2xlID4gMiAqIE1hdGguUEkpIHtcbiAgICAgIGFuZ2xlID0gYW5nbGUgLSAyICogTWF0aC5QSVxuICAgIH1cblxuICAgIHJldHVybiBhbmdsZVxuICB9XG5cbiAgc2hvd1Rvb2xUaXAoZSwgaXNNb3ZlID0gZmFsc2UpIHtcbiAgICB2YXIgaW5kZXggPSB0aGlzLmNhbGN1bGF0ZUNsaWNrUG9zaXRpb24oZSwgaXNNb3ZlKVxuICAgIGlmICh0aGlzLmhpZ2hMaWdodEluZGV4ID09IGluZGV4ICYmIGluZGV4ID09IC0xKSB7XG4gICAgICByZXR1cm5cbiAgICB9XG4gICAgaWYgKHRoaXMuaGlnaExpZ2h0SW5kZXggPT0gaW5kZXggJiYgIWlzTW92ZSkge1xuICAgICAgdGhpcy5oaWdoTGlnaHRJbmRleCA9IC0xXG4gICAgfSBlbHNlIGlmICh0aGlzLmhpZ2hMaWdodEluZGV4ID09IGluZGV4KSB7XG4gICAgICBjb25zb2xlLmxvZygnSGlnaExpZ2h05LiN5Y+YLCDkuI3ov5vooYzmuLLmn5MnKVxuICAgICAgcmV0dXJuXG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuaGlnaExpZ2h0SW5kZXggPSBpbmRleFxuXG4gICAgICBpZiAoaW5kZXggIT0gLTEpIHtcbiAgICAgICAgdmFyIGhpZ2hMaWdodERhdGEgPSB0aGlzLnRvb2x0aXBDYWxsQmFjayhpbmRleClcbiAgICAgICAgdGhpcy5oaWdoTGlnaHREYXRhID0gaGlnaExpZ2h0RGF0YVxuICAgICAgICB0aGlzLmhpZ2hMaWdodFkgPSBlLnRvdWNoZXNbMF0ueVxuICAgICAgICB0aGlzLmhpZ2hMaWdodFggPSBlLnRvdWNoZXNbMF0ueFxuICAgICAgfVxuICAgIH1cbiAgICB0aGlzLmRyYXcoZmFsc2UpXG4gIH1cblxuICBoaWRkZW5IaWdoTGlnaHQoKSB7XG4gICAgaWYgKHRoaXMuaGlnaExpZ2h0SW5kZXggPT0gLTEpIHtcbiAgICAgIHJldHVyblxuICAgIH1cbiAgICB0aGlzLmhpZ2hMaWdodEluZGV4ID0gLTFcbiAgICB0aGlzLmRyYXcoZmFsc2UpXG4gIH1cblxuICBkcmF3KGlzQW5pbWF0aW9uID0gdHJ1ZSwgYW5pbWF0aW9uV2l0aExlZ2VuZCA9IHRydWUpIHtcbiAgICB0aGlzLmlzRHJhd0ZpbmlzaCA9IGZhbHNlXG4gICAgdmFyIGNhbnZhcyA9IHRoaXMuY2FudmFzXG5cbiAgICBpZiAodGhpcy5ub0RhdGEpIHtcbiAgICAgIHRoaXMuZHJhd05vRGF0YShjYW52YXMpXG4gICAgICBjYW52YXMuZHJhdygpXG4gICAgICB0aGlzLmlzRHJhd0ZpbmlzaCA9IHRydWVcbiAgICB9IGVsc2Uge1xuICAgICAgdmFyIHRoYXQgPSB0aGlzXG4gICAgICB2YXIgZHVyYXRpb24gPSBpc0FuaW1hdGlvbiAmJiB0aGlzLmRyYXdXaXRoQW5pbWF0aW9uID8gMTAwMCA6IDA7XG4gICAgICB2YXIgYW5pbWF0aW9uID0gbmV3IEFuaW1hdGlvbih7XG4gICAgICAgIHRpbWluZzogJ2Vhc2VJbicsXG4gICAgICAgIGR1cmF0aW9uOiBkdXJhdGlvbixcbiAgICAgICAgb25Qcm9jZXNzOiBmdW5jdGlvbiAocHJvY2Vzcykge1xuICAgICAgICAgIC8vIGNvbnNvbGUudGltZSgncGllIGRyYXcnKVxuICAgICAgICAgIHRoYXQucHJvY2VzcyA9IHByb2Nlc3NcbiAgICAgICAgICBjYW52YXMuY2xlYXJSZWN0ICYmIGNhbnZhcy5jbGVhclJlY3QoMCwgMCwgdGhhdC53aWR0aCwgdGhhdC5oZWlnaHQpXG5cbiAgICAgICAgICB2YXIgY3VyclBlckFuZ2xlID0gMFxuICAgICAgICAgIHRoYXQuZGF0YS5tYXAoKHNsaWNlLCBpKSA9PiB7XG4gICAgICAgICAgICBpZiAoc2xpY2UucCkge1xuICAgICAgICAgICAgICB0aGF0LmRyYXdTbGljZUFyYyhjYW52YXMsIHNsaWNlLCBpLCB0aGF0LnNsaWNlU3BhY2UsIGN1cnJQZXJBbmdsZSlcbiAgICAgICAgICAgICAgY3VyclBlckFuZ2xlICs9IHNsaWNlLnAgKiAyICogTWF0aC5QSVxuICAgICAgICAgICAgfVxuICAgICAgICAgIH0pXG4gICAgICAgICAgdGhhdC5kcmF3VG9vbFRpcChjYW52YXMpXG5cbiAgICAgICAgICBpZiAodGhhdC5sZWdlbmRFbmFibGUpIHtcbiAgICAgICAgICAgIGlmICghYW5pbWF0aW9uV2l0aExlZ2VuZCkge1xuICAgICAgICAgICAgICB0aGF0LmRyYXdMZWdlbmQoY2FudmFzKVxuICAgICAgICAgICAgfSBlbHNlIGlmIChwcm9jZXNzID09IDEpIHtcbiAgICAgICAgICAgICAgdGhhdC5kcmF3TGVnZW5kKGNhbnZhcylcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgICAgY2FudmFzLmRyYXcoKVxuICAgICAgICAgIC8vIGNvbnNvbGUudGltZUVuZCgncGllIGRyYXcnKVxuICAgICAgICB9LFxuICAgICAgICBvbkFuaW1hdGlvbkZpbmlzaDogZnVuY3Rpb24gKCkge1xuICAgICAgICAgIHRoYXQuaXNEcmF3RmluaXNoID0gdHJ1ZVxuICAgICAgICB9XG4gICAgICB9KVxuICAgIH1cbiAgfVxuXG4gIGRyYXdUb29sVGlwKGNhbnZhcykge1xuICAgIGlmICh0aGlzLmhpZ2hMaWdodEluZGV4ID09IC0xKSB7XG4gICAgICByZXR1cm5cbiAgICB9XG4gICAgdmFyIGNoYXJ0UGFkZGluZyA9IHRoaXMuY2hhcnRQYWRkaW5nXG4gICAgdmFyIGNoYXJ0Q29udGVudEhlaWdodCA9IHRoaXMuaGVpZ2h0IC0gY2hhcnRQYWRkaW5nICogMlxuICAgIHZhciBjaGFydENvbnRlbnRXaWR0aCA9IHRoaXMud2lkdGggLSBjaGFydFBhZGRpbmcgKiAyXG4gICAgdmFyIGNvbnRlbnRXaWR0aCA9IGNoYXJ0Q29udGVudFdpZHRoXG4gICAgdmFyIHggPSB0aGlzLmhpZ2hMaWdodFZpZXdYXG4gICAgdmFyIHkgPSB0aGlzLmhpZ2hMaWdodFZpZXdZXG5cbiAgICB2YXIgdG9vbFRpcEJhY2tncm91bmRDb2xvciA9IHRoaXMudG9vbFRpcEJhY2tncm91bmRDb2xvclxuICAgIHZhciB0b29sVGlwUGFkZGluZyA9IHRoaXMudG9vbFRpcFBhZGRpbmdcbiAgICB2YXIgdG9vbFRpcFRleHRQYWRkaW5nID0gdGhpcy50b29sVGlwVGV4dFBhZGRpbmdcbiAgICB2YXIgdG9vbFRpcEZvbnRTaXplID0gdGhpcy50b29sVGlwRm9udFNpemVcbiAgICB2YXIgdG9vbFRpcFNwbGl0TGluZVdpZHRoID0gdGhpcy50b29sVGlwU3BsaXRMaW5lV2lkdGhcbiAgICB2YXIgdG9vbFRpcFNwbGl0TGluZUNvbG9yID0gdGhpcy50b29sVGlwU3BsaXRMaW5lQ29sb3JcblxuICAgIHZhciB0b29sVGlwV2lkdGggPSB0b29sVGlwUGFkZGluZyAqIDJcbiAgICB2YXIgdG9vbFRpcEhlaWdodCA9IHRvb2xUaXBQYWRkaW5nICogMlxuXG4gICAgdmFyIGhpZ2hMaWdodERhdGEgPSB0aGlzLmhpZ2hMaWdodERhdGFcblxuICAgIC8vdGl0bGVcbiAgICB2YXIgbWF4VGlwTGluZVdpZHRoID0gY2FudmFzLm15TWVhc3VyZVRleHQoaGlnaExpZ2h0RGF0YS50aXRsZSwgdG9vbFRpcEZvbnRTaXplKVxuICAgIHRvb2xUaXBIZWlnaHQgKz0gdG9vbFRpcEZvbnRTaXplICsgdG9vbFRpcFNwbGl0TGluZVdpZHRoICsgdG9vbFRpcFRleHRQYWRkaW5nXG4gICAgaGlnaExpZ2h0RGF0YS5kYXRhLm1hcCgodGV4dCwgaW5kZXgpID0+IHtcbiAgICAgIHRvb2xUaXBIZWlnaHQgKz0gdG9vbFRpcEZvbnRTaXplICsgdG9vbFRpcFRleHRQYWRkaW5nXG5cbiAgICAgIHZhciB0ZXh0V2lkdGggPSBjYW52YXMubXlNZWFzdXJlVGV4dCh0ZXh0LCB0b29sVGlwRm9udFNpemUpXG4gICAgICBpZiAobWF4VGlwTGluZVdpZHRoIDwgdGV4dFdpZHRoKSB7XG4gICAgICAgIG1heFRpcExpbmVXaWR0aCA9IHRleHRXaWR0aFxuICAgICAgfVxuICAgIH0pXG4gICAgdG9vbFRpcFdpZHRoICs9IG1heFRpcExpbmVXaWR0aFxuXG4gICAgdmFyIHN0YXJ0WCA9IHggLSB0b29sVGlwV2lkdGggLyAyXG4gICAgdmFyIHN0YXJ0WSA9IHkgLSB0b29sVGlwSGVpZ2h0IC8gMlxuICAgIGlmICh5ICsgdG9vbFRpcEhlaWdodCA+IGNoYXJ0Q29udGVudEhlaWdodCArIGNoYXJ0UGFkZGluZykge1xuICAgICAgc3RhcnRZID0gY2hhcnRDb250ZW50SGVpZ2h0ICsgY2hhcnRQYWRkaW5nIC0gdG9vbFRpcEhlaWdodFxuICAgIH1cblxuICAgIGNhbnZhcy5zZXRGaWxsU3R5bGUodG9vbFRpcEJhY2tncm91bmRDb2xvcilcbiAgICBjYW52YXMuYmVnaW5QYXRoKClcbiAgICBjYW52YXMuZmlsbFJlY3Qoc3RhcnRYLCBzdGFydFksIHRvb2xUaXBXaWR0aCwgdG9vbFRpcEhlaWdodClcbiAgICBjYW52YXMuY2xvc2VQYXRoKClcblxuICAgIGNhbnZhcy5zZXRGaWxsU3R5bGUodG9vbFRpcFNwbGl0TGluZUNvbG9yKVxuICAgIGNhbnZhcy5zZXRTdHJva2VTdHlsZSh0b29sVGlwU3BsaXRMaW5lQ29sb3IpXG4gICAgY2FudmFzLnNldExpbmVXaWR0aCh0b29sVGlwU3BsaXRMaW5lV2lkdGgpXG4gICAgY2FudmFzLnNldEZvbnRTaXplKHRvb2xUaXBGb250U2l6ZSlcblxuICAgIHZhciBkcmF3WCA9IHN0YXJ0WCArIHRvb2xUaXBQYWRkaW5nXG4gICAgdmFyIGRyYXdZID0gc3RhcnRZICsgdG9vbFRpcFBhZGRpbmcgKyB0b29sVGlwRm9udFNpemVcblxuICAgIGNhbnZhcy5maWxsVGV4dChoaWdoTGlnaHREYXRhLnRpdGxlLCBkcmF3WCwgZHJhd1kpXG4gICAgZHJhd1kgKz0gdG9vbFRpcFRleHRQYWRkaW5nICsgdG9vbFRpcFNwbGl0TGluZVdpZHRoIC8gMlxuICAgIGNhbnZhcy5iZWdpblBhdGgoKVxuICAgIGNhbnZhcy5tb3ZlVG8oZHJhd1ggLSB0b29sVGlwUGFkZGluZyAqIDAuMjUsIGRyYXdZKVxuICAgIGNhbnZhcy5saW5lVG8oZHJhd1ggKyB0b29sVGlwV2lkdGggLSB0b29sVGlwUGFkZGluZyAqIDEuNzUsIGRyYXdZKVxuICAgIGNhbnZhcy5zdHJva2UoKVxuICAgIGNhbnZhcy5jbG9zZVBhdGgoKVxuXG4gICAgaGlnaExpZ2h0RGF0YS5kYXRhLm1hcCgodGV4dCwgaW5kZXgpID0+IHtcbiAgICAgIGRyYXdZICs9IHRvb2xUaXBUZXh0UGFkZGluZyArIHRvb2xUaXBGb250U2l6ZVxuICAgICAgY2FudmFzLmZpbGxUZXh0KHRleHQsIGRyYXdYLCBkcmF3WSlcbiAgICB9KVxuICB9XG5cbiAgZHJhd0xlZ2VuZChjYW52YXMpIHtcbiAgICB2YXIgbGVnZW5kVGV4dENvbG9yID0gJyMwMDAwMDAnXG4gICAgdmFyIGxlZ2VuZEZvbnRTaXplID0gdGhpcy5sZWdlbmRGb250U2l6ZVxuICAgIHZhciBjaGFydFBhZGRpbmcgPSB0aGlzLmNoYXJ0UGFkZGluZ1xuICAgIHZhciBsZWdlbmRQYWRkaW5nID0gdGhpcy5sZWdlbmRQYWRkaW5nXG5cbiAgICBjYW52YXMuc2V0Rm9udFNpemUobGVnZW5kRm9udFNpemUpXG5cbiAgICB2YXIgbGVnZW5kV2lkdGggPSAwXG4gICAgdmFyIGlzTXVsdGlMaW5lID0gZmFsc2VcbiAgICB0aGlzLmRhdGEubWFwKChzbGljZSwgaSkgPT4ge1xuICAgICAgaWYgKGxlZ2VuZFdpZHRoID4gMCkge1xuICAgICAgICBsZWdlbmRXaWR0aCArPSBsZWdlbmRGb250U2l6ZVxuICAgICAgfVxuXG4gICAgICBsZWdlbmRXaWR0aCArPSBjYW52YXMubXlNZWFzdXJlVGV4dChzbGljZS5uYW1lLCBsZWdlbmRGb250U2l6ZSkgKyBsZWdlbmRGb250U2l6ZSAqIDEuMlxuICAgICAgaWYoaSA9PSB0aGlzLmRhdGEubGVuZ3RoKSB7XG4gICAgICAgIGxlZ2VuZFdpZHRoIC09IGxlZ2VuZEZvbnRTaXplXG4gICAgICB9XG4gICAgICBpZiAobGVnZW5kV2lkdGggPiB0aGlzLndpZHRoIC0gY2hhcnRQYWRkaW5nICogMikge1xuICAgICAgICBpc011bHRpTGluZSA9IHRydWVcbiAgICAgIH1cbiAgICB9KVxuXG4gICAgdGhpcy5sZWdlbmRXaWR0aCA9IGxlZ2VuZFdpZHRoXG4gICAgdGhpcy5pc011bHRpTGluZSA9IGlzTXVsdGlMaW5lXG5cbiAgICBpZiAoIWlzTXVsdGlMaW5lKSB7XG4gICAgICB2YXIgc3RhcnRYID0gKHRoaXMud2lkdGggLSBsZWdlbmRXaWR0aCkgLyAyO1xuICAgICAgdmFyIHN0YXJ0WSA9IHRoaXMuaGVpZ2h0IC0gbGVnZW5kUGFkZGluZyAtIGxlZ2VuZEZvbnRTaXplO1xuICAgICAgdGhpcy5kYXRhLm1hcCgoc2xpY2UsIGkpID0+IHtcbiAgICAgICAgdmFyIHRleHRXaWR0aCA9IGNhbnZhcy5teU1lYXN1cmVUZXh0KHNsaWNlLm5hbWUsIGxlZ2VuZEZvbnRTaXplKVxuICAgICAgICBpZiAoc3RhcnRYICsgdGV4dFdpZHRoICsgbGVnZW5kRm9udFNpemUgKiAxLjIgPiB0aGlzLndpZHRoIC0gY2hhcnRQYWRkaW5nKSB7XG4gICAgICAgICAgc3RhcnRYID0gY2hhcnRQYWRkaW5nXG4gICAgICAgICAgc3RhcnRZICs9IGxlZ2VuZEZvbnRTaXplICogMS41XG4gICAgICAgIH1cblxuICAgICAgICB2YXIgY2VudGVyWCA9IHN0YXJ0WCArIGxlZ2VuZEZvbnRTaXplIC8gMlxuICAgICAgICB2YXIgY2VudGVyWSA9IHN0YXJ0WSArIGxlZ2VuZEZvbnRTaXplIC8gMlxuICAgICAgICB2YXIgcmFkaXVzID0gbGVnZW5kRm9udFNpemUgLyAyXG4gICAgICAgIC8vIGlmIChpID09IHRoaXMuaGlnaExpZ2h0SW5kZXgpIHtcbiAgICAgICAgLy8gICB2YXIgZ3JhZGllbnQgPSBjYW52YXMuY3JlYXRlQ2lyY3VsYXJHcmFkaWVudChjZW50ZXJYLCBjZW50ZXJZLCByYWRpdXMpXG4gICAgICAgIC8vICAgZ3JhZGllbnQuYWRkQ29sb3JTdG9wKDAsICd3aGl0ZScpXG4gICAgICAgIC8vICAgZ3JhZGllbnQuYWRkQ29sb3JTdG9wKDEsIHRoaXMuZ2V0Q29sb3IoaSkpXG4gICAgICAgIC8vICAgY2FudmFzLnNldEZpbGxTdHlsZShncmFkaWVudClcbiAgICAgICAgLy8gfSBlbHNlIHtcbiAgICAgICAgdmFyIHNlcmllc0NvbG9yID0gdGhpcy5nZXRDb2xvcihpKVxuICAgICAgICBjYW52YXMuc2V0RmlsbFN0eWxlKHNlcmllc0NvbG9yKVxuICAgICAgICAvLyB9XG4gICAgICAgIGNhbnZhcy5iZWdpblBhdGgoKVxuICAgICAgICBjYW52YXMuYXJjKGNlbnRlclgsIGNlbnRlclksIHJhZGl1cywgMCwgMiAqIE1hdGguUEkpXG4gICAgICAgIGNhbnZhcy5maWxsKClcbiAgICAgICAgY2FudmFzLmNsb3NlUGF0aCgpXG5cbiAgICAgICAgc3RhcnRYICs9IGxlZ2VuZEZvbnRTaXplICogMS4yXG4gICAgICAgIGlmKHRoaXMuaXNIaWRkZW5TZXJpZXMoaSkpIHtcbiAgICAgICAgICBjYW52YXMuc2V0RmlsbFN0eWxlKHNlcmllc0NvbG9yKVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGNhbnZhcy5zZXRGaWxsU3R5bGUobGVnZW5kVGV4dENvbG9yKVxuICAgICAgICB9XG4gICAgICAgIGNhbnZhcy5maWxsVGV4dChzbGljZS5uYW1lLCBzdGFydFgsIHN0YXJ0WSArIGxlZ2VuZEZvbnRTaXplKVxuXG4gICAgICAgIHN0YXJ0WCArPSB0ZXh0V2lkdGggKyBsZWdlbmRGb250U2l6ZVxuICAgICAgfSlcbiAgICB9IGVsc2Uge1xuICAgICAgdmFyIHN0YXJ0WCA9IGNoYXJ0UGFkZGluZztcbiAgICAgIHZhciBzdGFydFkgPSB0aGlzLmhlaWdodCAtIGxlZ2VuZFBhZGRpbmcgLSBsZWdlbmRGb250U2l6ZTtcblxuICAgICAgaWYgKHN0YXJ0WCArIGxlZ2VuZEZvbnRTaXplICogMS4yICogdGhpcy5kYXRhLmxlbmd0aCA+IHRoaXMud2lkdGgpIHtcbiAgICAgICAgLy9sZWdlbmTmlbDph4/ov4flpJpcbiAgICAgICAgY2FudmFzLnNldEZpbGxTdHlsZSh0aGlzLmdldENvbG9yKDApKVxuICAgICAgICBjYW52YXMuZmlsbFJlY3Qoc3RhcnRYLCBzdGFydFksIGxlZ2VuZEZvbnRTaXplLCBsZWdlbmRGb250U2l6ZSlcbiAgICAgICAgc3RhcnRYICs9IGxlZ2VuZEZvbnRTaXplICogMS4yXG5cbiAgICAgICAgdmFyIGJldHdlZW5UZXh0ID0gXCJ+XCJcbiAgICAgICAgdmFyIGJ0d1RleHRXaWR0aCA9IGNhbnZhcy5teU1lYXN1cmVUZXh0KGJldHdlZW5UZXh0LCBsZWdlbmRGb250U2l6ZSlcbiAgICAgICAgY2FudmFzLnNldEZpbGxTdHlsZShsZWdlbmRUZXh0Q29sb3IpXG4gICAgICAgIGNhbnZhcy5maWxsVGV4dChiZXR3ZWVuVGV4dCwgc3RhcnRYLCBzdGFydFkgKyBsZWdlbmRGb250U2l6ZSlcbiAgICAgICAgc3RhcnRYICs9IGJ0d1RleHRXaWR0aCArIGxlZ2VuZEZvbnRTaXplICogMC4yXG5cbiAgICAgICAgY2FudmFzLnNldEZpbGxTdHlsZSh0aGlzLmdldENvbG9yKHRoaXMuZGF0YS5sZW5ndGggLSAxKSlcbiAgICAgICAgY2FudmFzLmZpbGxSZWN0KHN0YXJ0WCwgc3RhcnRZLCBsZWdlbmRGb250U2l6ZSwgbGVnZW5kRm9udFNpemUpXG4gICAgICAgIHN0YXJ0WCArPSBsZWdlbmRGb250U2l6ZSAqIDEuMlxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhpcy5kYXRhLm1hcCgoc2xpY2UsIGkpID0+IHtcbiAgICAgICAgICAvLyBpZiAoaSA9PSB0aGlzLmhpZ2hMaWdodEluZGV4KSB7XG4gICAgICAgICAgLy8gICB2YXIgZ3JhZGllbnQgPSBjYW52YXMuY3JlYXRlQ2lyY3VsYXJHcmFkaWVudChzdGFydFggKyBsZWdlbmRGb250U2l6ZSAvIDIsIHN0YXJ0WSArIGxlZ2VuZEZvbnRTaXplIC8gMiwgbGVnZW5kRm9udFNpemUgLyAyKVxuICAgICAgICAgIC8vICAgZ3JhZGllbnQuYWRkQ29sb3JTdG9wKDAsICd3aGl0ZScpXG4gICAgICAgICAgLy8gICBncmFkaWVudC5hZGRDb2xvclN0b3AoMSwgdGhpcy5nZXRDb2xvcihpKSlcbiAgICAgICAgICAvLyAgIGNhbnZhcy5zZXRGaWxsU3R5bGUoZ3JhZGllbnQpXG4gICAgICAgICAgLy8gfSBlbHNlIHtcbiAgICAgICAgICAgIGNhbnZhcy5zZXRGaWxsU3R5bGUodGhpcy5nZXRDb2xvcihpKSlcbiAgICAgICAgICAvLyB9XG4gICAgICAgICAgY2FudmFzLmZpbGxSZWN0KHN0YXJ0WCwgc3RhcnRZLCBsZWdlbmRGb250U2l6ZSwgbGVnZW5kRm9udFNpemUpXG4gICAgICAgICAgc3RhcnRYICs9IGxlZ2VuZEZvbnRTaXplICogMS4yXG4gICAgICAgIH0pXG4gICAgICB9XG4gICAgICBzdGFydFggKz0gbGVnZW5kRm9udFNpemUgKiAwLjNcbiAgICAgIHZhciBzaW1wbGVUZXh0ID0gdGhpcy5kYXRhWzBdLm5hbWUgKyBcIiB+IFwiICsgdGhpcy5kYXRhW3RoaXMuZGF0YS5sZW5ndGggLSAxXS5uYW1lO1xuICAgICAgdmFyIHNwVGV4dFdpZHRoID0gY2FudmFzLm15TWVhc3VyZVRleHQoc2ltcGxlVGV4dCwgbGVnZW5kRm9udFNpemUpXG4gICAgICBjYW52YXMuc2V0RmlsbFN0eWxlKGxlZ2VuZFRleHRDb2xvcilcbiAgICAgIGNhbnZhcy5maWxsVGV4dChzaW1wbGVUZXh0LCBzdGFydFgsIHN0YXJ0WSArIGxlZ2VuZEZvbnRTaXplKVxuICAgIH1cbiAgfVxuXG4gIGRyYXdTbGljZUFyYyhjYW52YXMsIHNsaWNlLCBwb3NpdGlvbiwgc2xpY2VTcGFjZSwgY3VyclBlckFuZ2xlKSB7XG4gICAgbGV0IGNlbnRlclggPSB0aGlzLndpZHRoIC8gMlxuICAgIGxldCBjZW50ZXJZID0gdGhpcy5oZWlnaHQgLyAyXG4gICAgbGV0IHJhZGl1cyA9IHRoaXMucmFkaXVzXG4gICAgaWYodGhpcy5oaWdoTGlnaHRJbmRleCA9PSBwb3NpdGlvbikge1xuICAgICAgcmFkaXVzICs9IHRoaXMuaGlnaGxpZ2h0UmFkaXVzXG4gICAgICBzbGljZVNwYWNlICo9IDJcbiAgICB9XG4gICAgbGV0IHByb2Nlc3MgPSB0aGlzLnByb2Nlc3NcblxuICAgIHZhciBzbGljZUFuZ2xlID0gc2xpY2UucCAqIDIgKiBNYXRoLlBJXG4gICAgdmFyIHNsaWNlU3BhY2VBbmdsZU91dGVyID0gc2xpY2VTcGFjZSAvIHJhZGl1cyAqIE1hdGguUElcbiAgICB2YXIgc3RhcnRBbmdsZU91dGVyID0gKGN1cnJQZXJBbmdsZSArIHNsaWNlU3BhY2VBbmdsZU91dGVyKSAqIHByb2Nlc3NcbiAgICB2YXIgc3dlZXBBbmdsZU91dGVyID0gKHNsaWNlQW5nbGUgLSBzbGljZVNwYWNlQW5nbGVPdXRlcikgKiBwcm9jZXNzXG4gICAgaWYgKHN3ZWVwQW5nbGVPdXRlciA8IDApIHtcbiAgICAgIHN3ZWVwQW5nbGVPdXRlciA9IDBcbiAgICB9XG5cbiAgICBjYW52YXMuc2V0RmlsbFN0eWxlKHRoaXMuZ2V0Q29sb3IocG9zaXRpb24pKVxuICAgIGNhbnZhcy5iZWdpblBhdGgoKVxuICAgIHZhciBhcmNTdGFydFBvaW50WCA9IGNlbnRlclggKyByYWRpdXMgKiBNYXRoLmNvcyhzdGFydEFuZ2xlT3V0ZXIpXG4gICAgdmFyIGFyY1N0YXJ0UG9pbnRZID0gY2VudGVyWSArIHJhZGl1cyAqIE1hdGguc2luKHN0YXJ0QW5nbGVPdXRlcilcbiAgICBpZiAoc3dlZXBBbmdsZU91dGVyID49IDIgKiBNYXRoLlBJICYmIHN3ZWVwQW5nbGVPdXRlciAlICgyICogTWF0aC5QSSkgPD0gMSkge1xuICAgICAgY2FudmFzLmFyYyhjZW50ZXJYLCBjZW50ZXJZLCByYWRpdXMsIDAsIDIgKiBNYXRoLlBJKVxuICAgIH0gZWxzZSB7XG4gICAgICBjYW52YXMubW92ZVRvKGFyY1N0YXJ0UG9pbnRYLCBhcmNTdGFydFBvaW50WSlcbiAgICAgIGNhbnZhcy5hcmMoY2VudGVyWCwgY2VudGVyWSwgcmFkaXVzLCBzdGFydEFuZ2xlT3V0ZXIsIHN0YXJ0QW5nbGVPdXRlciArIHN3ZWVwQW5nbGVPdXRlcilcbiAgICB9XG5cbiAgICBpZiAoc3dlZXBBbmdsZU91dGVyICUgKDIgKiBNYXRoLlBJKSA+IDApIHtcbiAgICAgIGlmIChzbGljZUFuZ2xlIDw9IE1hdGguUEkpIHtcbiAgICAgICAgdmFyIGFuZ2xlTWlkZGxlID0gc3RhcnRBbmdsZU91dGVyICsgc3dlZXBBbmdsZU91dGVyIC8gMlxuICAgICAgICB2YXIgc2xpY2VTcGFjZU9mZnNldCA9IHRoaXMuY2FsY3VsYXRlTWluaW11bVJhZGl1c0ZvclNwYWNlZFNsaWNlKHtcbiAgICAgICAgICBjZW50ZXJYOiBjZW50ZXJYLFxuICAgICAgICAgIGNlbnRlclk6IGNlbnRlclksXG4gICAgICAgICAgcmFkaXVzOiByYWRpdXMsXG4gICAgICAgICAgYW5nbGU6IHNsaWNlQW5nbGUgKiBwcm9jZXNzLFxuICAgICAgICAgIGFyY1N0YXJ0UG9pbnRYOiBhcmNTdGFydFBvaW50WCxcbiAgICAgICAgICBhcmNTdGFydFBvaW50WTogYXJjU3RhcnRQb2ludFksXG4gICAgICAgICAgc3RhcnRBbmdsZTogc3RhcnRBbmdsZU91dGVyLFxuICAgICAgICAgIHN3ZWVwQW5nbGU6IHN3ZWVwQW5nbGVPdXRlclxuICAgICAgICB9KVxuXG4gICAgICAgIHZhciBhcmNFbmRQb2ludFggPSBjZW50ZXJYICsgc2xpY2VTcGFjZU9mZnNldCAqIE1hdGguY29zKGFuZ2xlTWlkZGxlKVxuICAgICAgICB2YXIgYXJjRW5kUG9pbnRZID0gY2VudGVyWSArIHNsaWNlU3BhY2VPZmZzZXQgKiBNYXRoLnNpbihhbmdsZU1pZGRsZSk7XG5cbiAgICAgICAgY2FudmFzLmxpbmVUbyhhcmNFbmRQb2ludFgsIGFyY0VuZFBvaW50WSlcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGNhbnZhcy5saW5lVG8oY2VudGVyWCwgY2VudGVyWSlcbiAgICAgIH1cbiAgICB9XG4gICAgY2FudmFzLmNsb3NlUGF0aCgpXG4gICAgY2FudmFzLmZpbGwoKVxuXG4gICAgaWYgKHRoaXMuZHJhd0RhdGFMYWJlbCAmJiBwcm9jZXNzID09IDEpIHtcbiAgICAgIHZhciBjZW50ZXJBbmdsZSA9IGN1cnJQZXJBbmdsZSArIHNsaWNlQW5nbGUgLyAyXG4gICAgICB2YXIgYXJjQ2VudGVyWCA9IGNlbnRlclggKyByYWRpdXMgKiAyIC8gMyAqIE1hdGguY29zKGNlbnRlckFuZ2xlKVxuICAgICAgdmFyIGFyY0NlbnRlclkgPSBjZW50ZXJZICsgcmFkaXVzICogMiAvIDMgKiBNYXRoLnNpbihjZW50ZXJBbmdsZSlcblxuICAgICAgaWYgKHRoaXMuaGlnaExpZ2h0SW5kZXggPT0gcG9zaXRpb24pIHtcbiAgICAgICAgdGhpcy5oaWdoTGlnaHRWaWV3WCA9IGFyY0NlbnRlclhcbiAgICAgICAgdGhpcy5oaWdoTGlnaHRWaWV3WSA9IGFyY0NlbnRlcllcbiAgICAgIH1cblxuICAgICAgaWYgKHNsaWNlQW5nbGUgPj0gMiAqIE1hdGguUEkpIHtcbiAgICAgICAgYXJjQ2VudGVyWCA9IGNlbnRlclhcbiAgICAgICAgYXJjQ2VudGVyWSA9IGNlbnRlcllcbiAgICAgIH1cblxuICAgICAgdmFyIHRleHQgPSB0aGlzLmRhdGFsYWJlbENhbGxCYWNrKDAsIHBvc2l0aW9uKVxuICAgICAgdmFyIHRleHRTaXplID0gdGhpcy5kYXRhTGFiZWxGb250U2l6ZVxuICAgICAgdmFyIHRleHRXaWR0aCA9IGNhbnZhcy5teU1lYXN1cmVUZXh0KHRleHQsIHRleHRTaXplKVxuICAgICAgY2FudmFzLnNldEZvbnRTaXplKHRleHRTaXplKVxuICAgICAgY2FudmFzLnNldEZpbGxTdHlsZSgnI2ZmZmZmZicpXG4gICAgICBjYW52YXMuZmlsbFRleHQodGV4dCwgYXJjQ2VudGVyWCAtIHRleHRXaWR0aCAvIDIsIGFyY0NlbnRlclkgKyB0ZXh0U2l6ZSAvIDIpXG4gICAgfVxuICB9XG5cbiAgZHJhd05vRGF0YShjYW52YXMpIHtcbiAgICB2YXIgdGV4dCA9IHRoaXMubm9EYXRhVGV4dFxuICAgIHZhciB0ZXh0V2lkdGggPSBjYW52YXMubXlNZWFzdXJlVGV4dCh0ZXh0LCB0aGlzLm5vRGF0YUZvbnRTaXplKVxuICAgIGNhbnZhcy5zZXRGaWxsU3R5bGUodGhpcy5ub0RhdGFUZXh0Q29sb3IpXG4gICAgY2FudmFzLmZpbGxUZXh0KHRleHQsICh0aGlzLndpZHRoIC0gdGV4dFdpZHRoKSAvIDIsICh0aGlzLmhlaWdodCArIHRoaXMubm9EYXRhRm9udFNpemUpIC8gMilcbiAgfVxuXG4gIGNhbGN1bGF0ZU1pbmltdW1SYWRpdXNGb3JTcGFjZWRTbGljZShwYXJhbSkge1xuICAgIHZhciBhbmdsZU1pZGRsZSA9IHBhcmFtLnN0YXJ0QW5nbGUgKyBwYXJhbS5zd2VlcEFuZ2xlIC8gMlxuICAgIHZhciBhcmNFbmRQb2ludFggPSBwYXJhbS5jZW50ZXJYICsgcGFyYW0ucmFkaXVzICogTWF0aC5jb3MoKHBhcmFtLnN0YXJ0QW5nbGUgKyBwYXJhbS5zd2VlcEFuZ2xlKSlcbiAgICB2YXIgYXJjRW5kUG9pbnRZID0gcGFyYW0uY2VudGVyWSArIHBhcmFtLnJhZGl1cyAqIE1hdGguc2luKChwYXJhbS5zdGFydEFuZ2xlICsgcGFyYW0uc3dlZXBBbmdsZSkpXG5cbiAgICB2YXIgYXJjTWlkUG9pbnRYID0gcGFyYW0uY2VudGVyWCArIHBhcmFtLnJhZGl1cyAqIE1hdGguY29zKGFuZ2xlTWlkZGxlKVxuICAgIHZhciBhcmNNaWRQb2ludFkgPSBwYXJhbS5jZW50ZXJZICsgcGFyYW0ucmFkaXVzICogTWF0aC5zaW4oYW5nbGVNaWRkbGUpXG5cbiAgICB2YXIgYmFzZVBvaW50c0Rpc3RhbmNlID0gTWF0aC5zcXJ0KE1hdGgucG93KGFyY0VuZFBvaW50WCAtIHBhcmFtLmFyY1N0YXJ0UG9pbnRYLCAyKSArIE1hdGgucG93KGFyY0VuZFBvaW50WSAtIHBhcmFtLmFyY1N0YXJ0UG9pbnRZLCAyKSlcblxuICAgIHZhciBjb250YWluZWRUcmlhbmdsZUhlaWdodCA9IGJhc2VQb2ludHNEaXN0YW5jZSAvIDIgKiBNYXRoLnRhbigoTWF0aC5QSSAtIHBhcmFtLmFuZ2xlKSAvIDIpXG5cbiAgICB2YXIgc3BhY2VkUmFkaXVzID0gcGFyYW0ucmFkaXVzIC0gY29udGFpbmVkVHJpYW5nbGVIZWlnaHRcbiAgICBzcGFjZWRSYWRpdXMgLT0gTWF0aC5zcXJ0KE1hdGgucG93KGFyY01pZFBvaW50WCAtIChhcmNFbmRQb2ludFggKyBwYXJhbS5hcmNTdGFydFBvaW50WCkgLyAyLCAyKSArIE1hdGgucG93KGFyY01pZFBvaW50WSAtIChhcmNFbmRQb2ludFkgKyBwYXJhbS5hcmNTdGFydFBvaW50WSkgLyAyLCAyKSlcblxuICAgIHJldHVybiBzcGFjZWRSYWRpdXNcbiAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IFBpZTtcbiIsInZhciBjaGFydFV0aWxzID0gcmVxdWlyZSgnLi9jaGFydFV0aWwuanMnKVxuY29uc3Qge0FuaW1hdGlvbn0gPSBjaGFydFV0aWxzXG5cbmNsYXNzIFNjYXR0ZXIge1xuICBjb25zdHJ1Y3RvcihvcHRzKSB7XG4gICAgY29uc29sZS5sb2cob3B0cylcbiAgICB0aGlzLmNhbnZhcyA9IG9wdHMuY2FudmFzXG4gICAgdGhpcy53aWR0aCA9IG9wdHMud2lkdGhcbiAgICB0aGlzLmhlaWdodCA9IG9wdHMuaGVpZ2h0XG4gICAgdGhpcy5jaGFydFBhZGRpbmdMZWZ0ID0gb3B0cy5jaGFydFBhZGRpbmdMZWZ0IHx8IDQwXG4gICAgdGhpcy5jaGFydFBhZGRpbmdSaWdodCA9IG9wdHMuY2hhcnRQYWRkaW5nUmlnaHQgfHwgNDBcbiAgICB0aGlzLmNoYXJ0UGFkZGluZ1RvcCA9IG9wdHMuY2hhcnRQYWRkaW5nVG9wIHx8IDQwXG4gICAgdGhpcy5jaGFydFBhZGRpbmdCb3R0b20gPSBvcHRzLmNoYXJ0UGFkZGluZ0JvdHRvbSB8fCA0MFxuXG4gICAgdGhpcy5kcmF3V2l0aEFuaW1hdGlvbiA9IG9wdHMuZHJhd1dpdGhBbmltYXRpb24gPT09IHVuZGVmaW5lZCA/IHRydWUgOiBvcHRzLmRyYXdXaXRoQW5pbWF0aW9uXG5cbiAgICB0aGlzLmhpZ2hMaWdodEluZGV4ID0gLTFcbiAgICB0aGlzLmhpZ2hMaWdodENvbG9yID0gJ3JnYmEoMCwgMCwgMCwgMC4zKSdcbiAgICB0aGlzLmhpZ2hMaWdodFN0cm9rZUNvbG9yID0gJ3doaXRlJ1xuXG4gICAgdGhpcy5ub0RhdGEgPSBvcHRzLm5vRGF0YSB8fCBmYWxzZVxuICAgIHRoaXMubm9EYXRhVGV4dCA9IG9wdHMubm9EYXRhVGV4dCB8fCAn5pqC5peg5pWw5o2uJ1xuICAgIHRoaXMubm9EYXRhVGV4dENvbG9yID0gb3B0cy5ub0RhdGFUZXh0Q29sb3IgfHwgJyM2OUI1RkMnXG4gICAgdGhpcy5ub0RhdGFGb250U2l6ZSA9IG9wdHMubm9EYXRhRm9udFNpemUgfHwgMTFcbiAgICB0aGlzLmRhdGEgPSBvcHRzLmRhdGFcblxuICAgIHRoaXMuZHJhd0RhdGFMYWJlbCA9IG9wdHMuZHJhd0RhdGFMYWJlbCB8fCBmYWxzZVxuICAgIHRoaXMuZGF0YWxhYmVsQ2FsbEJhY2sgPSBvcHRzLmRhdGFsYWJlbENhbGxCYWNrIHx8IGZ1bmN0aW9uICgpIHsgcmV0dXJuICcnIH1cbiAgICB0aGlzLmRhdGFMYWJlbEZvbnRTaXplID0gb3B0cy5kYXRhTGFiZWxGb250U2l6ZSB8fCA4XG4gICAgdGhpcy5kYXRhTGFiZWxQYWRkaW5nID0gb3B0cy5kYXRhTGFiZWxQYWRkaW5nIHx8IDRcbiAgICB0aGlzLmRhdGFMYWJlbENvbG9yID0gb3B0cy5kYXRhTGFiZWxDb2xvciB8fCAnIzExMTExMSdcblxuICAgIHRoaXMuYXhpc0VuYWJsZSA9IG9wdHMuYXhpc0VuYWJsZSB8fCBmYWxzZVxuICAgIHRoaXMuYXhpc0ZvbnRTaXplID0gb3B0cy5heGlzRm9udFNpemUgfHwgMTBcbiAgICB0aGlzLmF4aXNWYWx1ZVBhZGRpbmcgPSBvcHRzLmF4aXNWYWx1ZVBhZGRpbmcgfHwgNVxuICAgIHRoaXMuYXhpc0xpbmVXaWR0aCA9IG9wdHMuYXhpc0xpbmVXaWR0aCB8fCAxXG4gICAgdGhpcy5heGlzTGluZUNvbG9yID0gb3B0cy5heGlzTGluZUNvbG9yIHx8ICcjZGRkZGRkJ1xuICAgIHRoaXMuYXhpc0ZvbnRDb2xvciA9IG9wdHMuYXhpc0ZvbnRDb2xvciB8fCAnIzQ0NDQ0NCdcblxuICAgIHRoaXMuZGFzaGVkTGluZVdpZHRoID0gb3B0cy5kYXNoZWRMaW5lV2lkdGggfHwgNlxuXG4gICAgdGhpcy5sZWdlbmRFbmFibGUgPSBvcHRzLmxlZ2VuZEVuYWJsZSB8fCBmYWxzZVxuICAgIHRoaXMubGVnZW5kRm9udFNpemUgPSBvcHRzLmxlZ2VuZEZvbnRTaXplIHx8IDEwXG4gICAgdGhpcy5sZWdlbmRQYWRkaW5nID0gb3B0cy5sZWdlbmRQYWRkaW5nIHx8IDVcbiAgICB0aGlzLmxlZ2VuZFRleHRDb2xvciA9IG9wdHMubGVnZW5kVGV4dENvbG9yIHx8ICcjMDAwMDAwJ1xuXG4gICAgdGhpcy5tYXhWYWx1ZSA9IG9wdHMubWF4VmFsdWVcbiAgICB0aGlzLm1pblZhbHVlID0gb3B0cy5taW5WYWx1ZVxuICAgIHRoaXMubWF4WFZhbHVlID0gb3B0cy5tYXhYVmFsdWVcbiAgICB0aGlzLm1pblhWYWx1ZSA9IG9wdHMubWluWFZhbHVlXG4gICAgdGhpcy5jaXJjbGVSYWRpdXMgPSBvcHRzLmNpcmNsZVJhZGl1cyB8fCBNYXRoLm1heCg0LCBNYXRoLm1pbih0aGlzLndpZHRoLCB0aGlzLmhlaWdodCkgLyAxMDApXG4gICAgdGhpcy5idWJibGVNYXhSYWRpdXMgPSBvcHRzLmJ1YmJsZU1heFJhZGl1cyB8fCBNYXRoLm1pbih0aGlzLndpZHRoLCB0aGlzLmhlaWdodCkgLyAyMFxuICAgIHRoaXMuYnViYmxlTWluUmFkaXVzID0gb3B0cy5idWJibGVNaW5SYWRpdXMgfHwgTWF0aC5taW4odGhpcy53aWR0aCwgdGhpcy5oZWlnaHQpIC8gMTAwXG5cbiAgICB0aGlzLnRvb2x0aXBDYWxsQmFjayA9IG9wdHMudG9vbHRpcENhbGxCYWNrIHx8IGZ1bmN0aW9uICgpIHsgcmV0dXJuICcnIH1cbiAgICB0aGlzLnRvb2xUaXBCYWNrZ3JvdW5kQ29sb3IgPSBvcHRzLnRvb2xUaXBCYWNrZ3JvdW5kQ29sb3IgfHwgJ3JnYmEoMCwgMCwgMCwgMC42KSdcbiAgICB0aGlzLnRvb2xUaXBQYWRkaW5nID0gb3B0cy50b29sVGlwUGFkZGluZyB8fCAxMFxuICAgIHRoaXMudG9vbFRpcFRleHRQYWRkaW5nID0gb3B0cy50b29sVGlwVGV4dFBhZGRpbmcgfHwgOFxuICAgIHRoaXMudG9vbFRpcEZvbnRTaXplID0gb3B0cy50b29sVGlwRm9udFNpemUgfHwgMTBcbiAgICB0aGlzLnRvb2xUaXBTcGxpdExpbmVXaWR0aCA9IG9wdHMudG9vbFRpcFNwbGl0TGluZVdpZHRoIHx8IDFcbiAgICB0aGlzLnRvb2xUaXBTcGxpdExpbmVDb2xvciA9IG9wdHMudG9vbFRpcFNwbGl0TGluZUNvbG9yIHx8ICcjZmZmZmZmJ1xuXG4gICAgdGhpcy5tdXRlQ2FsbGJhY2sgPSBvcHRzLm11dGVDYWxsYmFjayB8fCBmdW5jdGlvbiAoKSB7IHJldHVybiAnJyB9XG4gICAgdGhpcy5zZXJpZXNTdGF0dXMgPSBvcHRzLnNlcmllc1N0YXR1c1xuXG4gICAgdGhpcy54VGlja3MgICA9IG9wdHMueFRpY2tzICAgfHwgW11cbiAgICB0aGlzLnhSZWZzICAgID0gb3B0cy54UmVmcyAgICB8fCBbXVxuICAgIHRoaXMueTFSZWZzICAgPSBvcHRzLnkxUmVmcyAgIHx8IFtdXG4gICAgdGhpcy55MVRpY2tzICA9IG9wdHMueTFUaWNrcyAgfHwgW11cbiAgICB0aGlzLnkyVGlja3MgID0gb3B0cy55MlRpY2tzICB8fCBbXVxuXG4gICAgaWYgKHRoaXMuYXhpc0VuYWJsZSkge1xuICAgICAgdmFyIG1heFkxV2lkdGggPSAwXG4gICAgICB0aGlzLnkxVGlja3MubWFwKChsYWJlbCwgaSkgPT4ge1xuICAgICAgICB2YXIgbGFiZWxXaWR0aCA9IHRoaXMuY2FudmFzLm15TWVhc3VyZVRleHQobGFiZWwsIHRoaXMuYXhpc0ZvbnRTaXplKVxuICAgICAgICBpZiAobWF4WTFXaWR0aCA8IGxhYmVsV2lkdGgpIHtcbiAgICAgICAgICBtYXhZMVdpZHRoID0gbGFiZWxXaWR0aFxuICAgICAgICB9XG4gICAgICB9KVxuICAgICAgbWF4WTFXaWR0aCArPSB0aGlzLmF4aXNWYWx1ZVBhZGRpbmcgKiAyXG4gICAgICBpZiAodGhpcy5jaGFydFBhZGRpbmdMZWZ0IDwgbWF4WTFXaWR0aCkge1xuICAgICAgICB0aGlzLmNoYXJ0UGFkZGluZ0xlZnQgPSBtYXhZMVdpZHRoXG4gICAgICB9XG5cbiAgICAgIHZhciBtYXhZMldpZHRoID0gMFxuICAgICAgdGhpcy55MlRpY2tzLm1hcCgobGFiZWwsIGkpID0+IHtcbiAgICAgICAgdmFyIGxhYmVsV2lkdGggPSB0aGlzLmNhbnZhcy5teU1lYXN1cmVUZXh0KGxhYmVsLCB0aGlzLmF4aXNGb250U2l6ZSlcbiAgICAgICAgaWYgKG1heFkyV2lkdGggPCBsYWJlbFdpZHRoKSB7XG4gICAgICAgICAgbWF4WTJXaWR0aCA9IGxhYmVsV2lkdGhcbiAgICAgICAgfVxuICAgICAgfSlcbiAgICAgIG1heFkyV2lkdGggKz0gdGhpcy5heGlzVmFsdWVQYWRkaW5nICogMlxuICAgICAgaWYgKHRoaXMuY2hhcnRQYWRkaW5nUmlnaHQgPCBtYXhZMldpZHRoKSB7XG4gICAgICAgIHRoaXMuY2hhcnRQYWRkaW5nUmlnaHQgPSBtYXhZMldpZHRoXG4gICAgICB9XG4gICAgfVxuXG4gICAgdmFyIGNvbG9ycyA9IFsnIzdjYjVlYycsICcjZjdhMzVjJywgJyM0MzQzNDgnLCAnIzkwZWQ3ZCcsICcjZjE1YzgwJywgJyM4MDg1ZTknLCAnI0U0RDM1NCcsICcjMkI5MDhGJywgJyNGNDVCNUInLCAnIzkxRThFMScsICcjN0NCNUVDJywgJyM0MzQzNDgnXVxuICAgIHRoaXMuY29sb3JzID0gb3B0cy5jb2xvcnMgJiYgb3B0cy5jb2xvcnMuc2xpY2UoKSB8fCBjb2xvcnNcbiAgICB0aGlzLmRyYXcoKVxuICB9XG5cbiAgZ2V0Q29sb3IoaW5kZXgpIHtcbiAgICBpZiAodGhpcy5pc0hpZGRlblNlcmllcyhpbmRleCkpIHtcbiAgICAgIHJldHVybiAnI2NjY2NjYydcbiAgICB9XG4gICAgcmV0dXJuIHRoaXMuY29sb3JzW2luZGV4ICUgdGhpcy5jb2xvcnMubGVuZ3RoXVxuICB9XG5cbiAgZ2V0Q2hhcnRDb250ZW50SGVpZ2h0KCkge1xuICAgIHJldHVybiB0aGlzLmhlaWdodCAtIHRoaXMuY2hhcnRQYWRkaW5nVG9wIC0gdGhpcy5jaGFydFBhZGRpbmdCb3R0b21cbiAgfVxuXG4gIGdldENoYXJ0Q29udGVudFdpZHRoKCkge1xuICAgIHJldHVybiB0aGlzLndpZHRoIC0gdGhpcy5jaGFydFBhZGRpbmdMZWZ0IC0gdGhpcy5jaGFydFBhZGRpbmdSaWdodFxuICB9XG5cbiAgaXNIaWRkZW5TZXJpZXMoaW5kZXgpIHtcbiAgICByZXR1cm4gdGhpcy5zZXJpZXNTdGF0dXMgJiYgdGhpcy5zZXJpZXNTdGF0dXNbaW5kZXhdXG4gIH1cblxuICBnZXRDdXJyZW50RGF0YUluZGV4KGUpIHtcbiAgICB2YXIgcmVzID0gdGhpcy5jYWxjdWxhdGVDbGlja1Bvc2l0aW9uKGUpXG4gICAgaWYgKHJlcyA9PSB1bmRlZmluZWQpIHtcbiAgICAgIHJldHVybiB7fVxuICAgIH1cbiAgICByZXR1cm4gdGhpcy5kYXRhW3Jlc1swXV0uZGF0YVtyZXNbMV1dXG4gIH1cblxuICBjYWxjdWxhdGVDbGlja1Bvc2l0aW9uKGUsIGlzTW92ZSA9IGZhbHNlKSB7XG4gICAgaWYgKHRoaXMubm9EYXRhIHx8IHRoaXMucHJvY2VzcyAhPSAxKSB7XG4gICAgICByZXR1cm4gbnVsbFxuICAgIH1cbiAgICBpZiAoZS50b3VjaGVzICYmIGUudG91Y2hlcy5sZW5ndGgpIHtcbiAgICAgIHZhciB4ID0gZS50b3VjaGVzWzBdLnhcbiAgICAgIHZhciB5ID0gZS50b3VjaGVzWzBdLnlcblxuICAgICAgdmFyIGNoYXJ0UGFkZGluZ0xlZnQgPSB0aGlzLmNoYXJ0UGFkZGluZ0xlZnRcbiAgICAgIHZhciBjaGFydFBhZGRpbmdSaWdodCA9IHRoaXMuY2hhcnRQYWRkaW5nUmlnaHRcbiAgICAgIHZhciBjaGFydFBhZGRpbmdUb3AgPSB0aGlzLmNoYXJ0UGFkZGluZ1RvcFxuICAgICAgdmFyIGNoYXJ0UGFkZGluZ0JvdHRvbSA9IHRoaXMuY2hhcnRQYWRkaW5nQm90dG9tXG4gICAgICB2YXIgbGVnZW5kUGFkZGluZyA9IHRoaXMubGVnZW5kUGFkZGluZ1xuICAgICAgdmFyIGxlZ2VuZEZvbnRTaXplID0gdGhpcy5sZWdlbmRGb250U2l6ZVxuXG4gICAgICBmb3IodmFyIGk9MDsgaSA8IHRoaXMueFJlZnMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgdmFyIHJlZiA9IHRoaXMueFJlZnNbaV1cbiAgICAgICAgaWYoeCA+PSByZWYubGVmdCAmJiB4IDw9IHJlZi5yaWdodCAmJiB5ID49IHJlZi50b3AgJiYgeSA8PSByZWYuYm90dG9tKSB7XG4gICAgICAgICAgaWYgKHRoaXMuaGlnaExpZ2h0WCA9PSByZWYucmlnaHRcbiAgICAgICAgICAgICYmIHRoaXMuaGlnaExpZ2h0WSA9PSByZWYuY2VudGVyWVxuICAgICAgICAgICAgJiYgdGhpcy5oaWdoTGlnaHREYXRhICYmICFpc01vdmUpIHtcbiAgICAgICAgICAgIC8vc2FtZSBsYWJlbFxuICAgICAgICAgICAgdGhpcy5oaWdoTGlnaHRJbmRleCA9IC0xXG4gICAgICAgICAgICB0aGlzLmhpZ2hMaWdodERhdGEgPSBudWxsXG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMuaGlnaExpZ2h0RGF0YSA9IHtcbiAgICAgICAgICAgICAgdGl0bGU6IHJlZi5uYW1lLFxuICAgICAgICAgICAgICBkYXRhOiBbYCR7cmVmLmZkTmFtZX06JHtyZWYubGFiZWx9YF1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHRoaXMuaGlnaExpZ2h0SW5kZXggPSAtMVxuICAgICAgICAgICAgdGhpcy5oaWdoTGlnaHRYID0gcmVmLnJpZ2h0XG4gICAgICAgICAgICB0aGlzLmhpZ2hMaWdodFkgPSByZWYuY2VudGVyWVxuICAgICAgICAgICAgdGhpcy5oaWdoTGlnaHRSYWRpdXMgPSAwXG4gICAgICAgICAgfVxuICAgICAgICAgIHRoaXMuZHJhdyhmYWxzZSlcbiAgICAgICAgICByZXR1cm4gbnVsbFxuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy55MVJlZnMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgdmFyIHJlZiA9IHRoaXMueTFSZWZzW2ldXG4gICAgICAgIGlmICh4ID49IHJlZi5sZWZ0ICYmIHggPD0gcmVmLnJpZ2h0ICYmIHkgPj0gcmVmLnRvcCAmJiB5IDw9IHJlZi5ib3R0b20pIHtcbiAgICAgICAgICBpZiAodGhpcy5oaWdoTGlnaHRYID09IHJlZi5yaWdodFxuICAgICAgICAgICAgJiYgdGhpcy5oaWdoTGlnaHRZID09IHJlZi5jZW50ZXJZXG4gICAgICAgICAgICAmJiB0aGlzLmhpZ2hMaWdodERhdGEgJiYgIWlzTW92ZSkge1xuICAgICAgICAgICAgLy9zYW1lIGxhYmVsXG4gICAgICAgICAgICB0aGlzLmhpZ2hMaWdodEluZGV4ID0gLTFcbiAgICAgICAgICAgIHRoaXMuaGlnaExpZ2h0RGF0YSA9IG51bGxcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5oaWdoTGlnaHREYXRhID0ge1xuICAgICAgICAgICAgICB0aXRsZTogcmVmLm5hbWUsXG4gICAgICAgICAgICAgIGRhdGE6IFtgJHtyZWYuZmROYW1lfToke3JlZi5sYWJlbH1gXVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdGhpcy5oaWdoTGlnaHRJbmRleCA9IC0xXG4gICAgICAgICAgICB0aGlzLmhpZ2hMaWdodFggPSByZWYucmlnaHRcbiAgICAgICAgICAgIHRoaXMuaGlnaExpZ2h0WSA9IHJlZi5jZW50ZXJZXG4gICAgICAgICAgICB0aGlzLmhpZ2hMaWdodFJhZGl1cyA9IDBcbiAgICAgICAgICB9XG4gICAgICAgICAgdGhpcy5kcmF3KGZhbHNlKVxuICAgICAgICAgIHJldHVybiBudWxsXG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgaWYgKHggPj0gY2hhcnRQYWRkaW5nTGVmdCAmJiB4IDw9IHRoaXMud2lkdGggLSBjaGFydFBhZGRpbmdSaWdodCAmJiB5ID49IGNoYXJ0UGFkZGluZ1RvcCAmJiB5IDw9IHRoaXMuaGVpZ2h0IC0gY2hhcnRQYWRkaW5nQm90dG9tKSB7XG4gICAgICAgIGZvciAodmFyIGkgPSB0aGlzLmRhdGEubGVuZ3RoIC0gMTsgaSA+PSAwOyBpLS0pIHtcbiAgICAgICAgICB2YXIgbGF5ZXIgPSB0aGlzLmRhdGFbaV1cbiAgICAgICAgICBmb3IgKHZhciBqID0gbGF5ZXIuZGF0YS5sZW5ndGggLSAxOyBqID49IDA7IGotLSkge1xuICAgICAgICAgICAgdmFyIHBvaW50ID0gbGF5ZXIuZGF0YVtqXVxuICAgICAgICAgICAgdmFyIHhQb3NpdGlvbiA9IHBvaW50LnhQb3NpdGlvblxuICAgICAgICAgICAgdmFyIHlQb3NpdGlvbiA9IHBvaW50LnlQb3NpdGlvblxuICAgICAgICAgICAgdmFyIHJhZGl1cyA9IHBvaW50LnJhZGl1c1xuICAgICAgICAgICAgaWYgKHggPj0geFBvc2l0aW9uIC0gcmFkaXVzICYmIHggPD0geFBvc2l0aW9uICsgcmFkaXVzXG4gICAgICAgICAgICAgICAgJiYgeSA+PSB5UG9zaXRpb24gLSByYWRpdXMgJiYgeSA8PSB5UG9zaXRpb24gKyByYWRpdXMpIHtcbiAgICAgICAgICAgICAgcmV0dXJuIFtpLCBqLCB4UG9zaXRpb24sIHlQb3NpdGlvbiwgcmFkaXVzXVxuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gWy0xLCAtMV1cbiAgICAgIH1cblxuICAgICAgcmV0dXJuIFstMSwgLTFdXG4gICAgfVxuICAgIHJldHVybiBbLTEsIC0xXVxuICB9XG5cbiAgZ2V0Q3VycmVudEhpZ2hMaWdodEluZGV4KCkge1xuICAgIHJldHVybiB0aGlzLmhpZ2hMaWdodEluZGV4XG4gIH1cblxuICBzaG93VG9vbFRpcChlLCBpc01vdmUgPSBmYWxzZSkge1xuICAgIHZhciByZXMgPSB0aGlzLmNhbGN1bGF0ZUNsaWNrUG9zaXRpb24oZSwgaXNNb3ZlKVxuICAgIHZhciB4LCB5XG4gICAgaWYgKHJlcykge1xuICAgICAgeCA9IHJlc1swXVxuICAgICAgeSA9IHJlc1sxXVxuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm5cbiAgICB9XG4gICAgaWYgKHRoaXMuaGlnaExpZ2h0SW5kZXggPT0geCAmJiB4ID09IC0xKSB7XG4gICAgICBpZiAodGhpcy5oaWdoTGlnaHREYXRhKSB7XG4gICAgICAgIHRoaXMuaGlnaExpZ2h0RGF0YSA9IG51bGxcbiAgICAgICAgdGhpcy5kcmF3KGZhbHNlKVxuICAgICAgfVxuICAgICAgcmV0dXJuXG4gICAgfVxuICAgIGlmICh0aGlzLmhpZ2hMaWdodEluZGV4ID09IHggJiYgdGhpcy5oaWdoTGlnaHRBcnJheUluZGV4ID09IHkgJiYgIWlzTW92ZSkge1xuICAgICAgdGhpcy5oaWdoTGlnaHRJbmRleCA9IC0xXG4gICAgICB0aGlzLmhpZ2hMaWdodERhdGEgPSBudWxsXG4gICAgfSBlbHNlIGlmICh0aGlzLmhpZ2hMaWdodEluZGV4ID09IHggJiYgdGhpcy5oaWdoTGlnaHRBcnJheUluZGV4ID09IHkpIHtcbiAgICAgIGNvbnNvbGUubG9nKCflkIzkuIDkuKrngrksIOS4jei/m+ihjOa4suafkycpXG4gICAgICByZXR1cm5cbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5oaWdoTGlnaHRJbmRleCA9IHhcbiAgICAgIHRoaXMuaGlnaExpZ2h0QXJyYXlJbmRleCA9IHlcblxuICAgICAgaWYgKHggIT0gLTEpIHtcbiAgICAgICAgdmFyIGhpZ2hMaWdodERhdGEgPSB0aGlzLnRvb2x0aXBDYWxsQmFjayh5LCB4KVxuICAgICAgICB0aGlzLmhpZ2hMaWdodERhdGEgPSBoaWdoTGlnaHREYXRhXG4gICAgICAgIHRoaXMuaGlnaExpZ2h0WCA9IHJlc1syXVxuICAgICAgICB0aGlzLmhpZ2hMaWdodFkgPSByZXNbM11cbiAgICAgICAgdGhpcy5oaWdoTGlnaHRSYWRpdXMgPSByZXNbNF1cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRoaXMuaGlnaExpZ2h0RGF0YSA9IG51bGxcbiAgICAgIH1cbiAgICB9XG4gICAgdGhpcy5kcmF3KGZhbHNlKVxuICB9XG5cbiAgaGlkZGVuSGlnaExpZ2h0KCkge1xuICAgIGlmICh0aGlzLmhpZ2hMaWdodEluZGV4ID09IC0xKSB7XG4gICAgICByZXR1cm5cbiAgICB9XG4gICAgdGhpcy5oaWdoTGlnaHRJbmRleCA9IC0xXG4gICAgdGhpcy5kcmF3KGZhbHNlKVxuICB9XG5cbiAgZHJhdyhpc0FuaW1hdGlvbiA9IHRydWUsIGFuaW1hdGlvbldpdGhMZWdlbmQgPSB0cnVlKSB7XG4gICAgdGhpcy5pc0RyYXdGaW5pc2ggPSBmYWxzZVxuICAgIHZhciBjYW52YXMgPSB0aGlzLmNhbnZhc1xuXG4gICAgaWYgKHRoaXMubm9EYXRhKSB7XG4gICAgICB0aGlzLmRyYXdOb0RhdGEoY2FudmFzKVxuICAgICAgY2FudmFzLmRyYXcoKVxuICAgICAgdGhpcy5pc0RyYXdGaW5pc2ggPSB0cnVlXG4gICAgfSBlbHNlIHtcbiAgICAgIHZhciB0aGF0ID0gdGhpc1xuICAgICAgdmFyIGR1cmF0aW9uID0gaXNBbmltYXRpb24gJiYgdGhpcy5kcmF3V2l0aEFuaW1hdGlvbiA/IDEwMDAgOiAwXG4gICAgICB2YXIgYW5pbWF0aW9uID0gbmV3IEFuaW1hdGlvbih7XG4gICAgICAgIHRpbWluZzogJ2xpbmVhcicsXG4gICAgICAgIGR1cmF0aW9uOiBkdXJhdGlvbixcbiAgICAgICAgb25Qcm9jZXNzOiBmdW5jdGlvbiAocHJvY2Vzcykge1xuICAgICAgICAgIC8vIGNvbnNvbGUudGltZSgnc2NhdHRlciBkcmF3JylcbiAgICAgICAgICBjYW52YXMuY2xlYXJSZWN0ICYmIGNhbnZhcy5jbGVhclJlY3QoMCwgMCwgdGhhdC53aWR0aCwgdGhhdC5oZWlnaHQpXG4gICAgICAgICAgdGhhdC5wcm9jZXNzID0gcHJvY2Vzc1xuICAgICAgICAgIHRoYXQuZGF0YUxhYmVscyA9IFtdXG5cbiAgICAgICAgICBpZiAodGhhdC5heGlzRW5hYmxlKSB7XG4gICAgICAgICAgICB0aGF0LmRyYXdBeGlzKGNhbnZhcylcbiAgICAgICAgICB9XG5cbiAgICAgICAgICB0aGF0LmRhdGEubWFwKChpdGVtLCBpbmRleCkgPT4ge1xuICAgICAgICAgICAgaWYgKGl0ZW0pIHtcbiAgICAgICAgICAgICAgdGhhdC5kcmF3SXRlbShjYW52YXMsIGl0ZW0sIGluZGV4KVxuICAgICAgICAgICAgfVxuICAgICAgICAgIH0pXG4gICAgICAgICAgdGhhdC5kcmF3UmVmcyhjYW52YXMpXG4gICAgICAgICAgaWYgKHRoYXQuZHJhd0RhdGFMYWJlbCAmJiBwcm9jZXNzID09IDEpIHtcbiAgICAgICAgICAgIHRoYXQuZHJhd0RhdGFMYWJlbExheWVyKGNhbnZhcylcbiAgICAgICAgICB9XG4gICAgICAgICAgdGhhdC5kcmF3VG9vbFRpcChjYW52YXMpXG5cbiAgICAgICAgICBpZiAodGhhdC5sZWdlbmRFbmFibGUpIHtcbiAgICAgICAgICAgIGlmICghYW5pbWF0aW9uV2l0aExlZ2VuZCkge1xuICAgICAgICAgICAgICB0aGF0LmRyYXdMZWdlbmQoY2FudmFzKVxuICAgICAgICAgICAgfSBlbHNlIGlmIChwcm9jZXNzID09IDEpIHtcbiAgICAgICAgICAgICAgdGhhdC5kcmF3TGVnZW5kKGNhbnZhcylcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgICAgY2FudmFzLmRyYXcoKVxuICAgICAgICAgIC8vIGNvbnNvbGUudGltZUVuZCgnc2NhdHRlciBkcmF3JylcbiAgICAgICAgfSxcbiAgICAgICAgb25BbmltYXRpb25GaW5pc2g6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICB0aGF0LmlzRHJhd0ZpbmlzaCA9IHRydWVcbiAgICAgICAgfVxuICAgICAgfSlcbiAgICB9XG4gIH1cblxuICBhZGREYXRhTGFiZWwobGFiZWwsIHgsIHksIGxhYmVsV2lkdGgpIHtcbiAgICBpZiAoeCArIGxhYmVsV2lkdGggPiB0aGlzLndpZHRoIC0gdGhpcy5jaGFydFBhZGRpbmdSaWdodCkge1xuICAgICAgeCA9IHRoaXMud2lkdGggLSB0aGlzLmNoYXJ0UGFkZGluZ1JpZ2h0IC0gbGFiZWxXaWR0aFxuICAgIH1cbiAgICBpZiAoeCA8IHRoaXMuY2hhcnRQYWRkaW5nTGVmdCkge1xuICAgICAgeCA9IHRoaXMuY2hhcnRQYWRkaW5nTGVmdFxuICAgIH1cbiAgICBpZiAoeSA+IHRoaXMuaGVpZ2h0IC0gdGhpcy5jaGFydFBhZGRpbmdCb3R0b20pIHtcbiAgICAgIHkgPSB0aGlzLmhlaWdodCAtIHRoaXMuY2hhcnRQYWRkaW5nQm90dG9tXG4gICAgfVxuICAgIGlmICh5IC0gdGhpcy5kYXRhTGFiZWxGb250U2l6ZSA8IHRoaXMuY2hhcnRQYWRkaW5nVG9wKSB7XG4gICAgICB5ID0gdGhpcy5jaGFydFBhZGRpbmdUb3AgKyB0aGlzLmRhdGFMYWJlbEZvbnRTaXplXG4gICAgfVxuICAgIHZhciBsZWZ0ID0geFxuICAgIHZhciB0b3AgPSB5IC0gdGhpcy5kYXRhTGFiZWxGb250U2l6ZVxuICAgIHZhciByaWdodCA9IHggKyBsYWJlbFdpZHRoXG4gICAgdmFyIGJvdHRvbSA9IHlcblxuICAgIHZhciBjdXJyRGF0YUxhYmVsID0ge1xuICAgICAgbGFiZWw6IGxhYmVsLFxuICAgICAgbGVmdDogbGVmdCxcbiAgICAgIHRvcDogdG9wLFxuICAgICAgcmlnaHQ6IHJpZ2h0LFxuICAgICAgYm90dG9tOiBib3R0b21cbiAgICB9XG5cbiAgICB2YXIgaXNDcmFzaCA9IGZhbHNlXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLmRhdGFMYWJlbHMubGVuZ3RoOyBpKyspIHtcbiAgICAgIHZhciBkYXRhTGFiZWwgPSB0aGlzLmRhdGFMYWJlbHNbaV1cbiAgICAgIGlmICh0aGlzLmlzUmVjdENyYXNoKGN1cnJEYXRhTGFiZWwsIGRhdGFMYWJlbCkpIHtcbiAgICAgICAgaXNDcmFzaCA9IHRydWVcbiAgICAgICAgYnJlYWtcbiAgICAgIH1cbiAgICB9XG4gICAgaWYgKCFpc0NyYXNoKSB7XG4gICAgICB0aGlzLmRhdGFMYWJlbHMucHVzaChjdXJyRGF0YUxhYmVsKVxuICAgIH1cbiAgfVxuXG4gIGlzUmVjdENyYXNoKGEsIGIpIHtcbiAgICB2YXIgbGVmdCA9IE1hdGgubWF4KGEubGVmdCwgYi5sZWZ0KVxuICAgIHZhciB0b3AgPSBNYXRoLm1heChhLnRvcCwgYi50b3ApXG4gICAgdmFyIHJpZ2h0ID0gTWF0aC5taW4oYS5yaWdodCwgYi5yaWdodClcbiAgICB2YXIgYm90dG9tID0gTWF0aC5taW4oYS5ib3R0b20sIGIuYm90dG9tKVxuXG4gICAgcmV0dXJuIGxlZnQgPD0gcmlnaHQgJiYgdG9wIDw9IGJvdHRvbVxuICB9XG5cbiAgZHJhd0RhdGFMYWJlbExheWVyKGNhbnZhcykge1xuICAgIGNhbnZhcy5zZXRGb250U2l6ZSh0aGlzLmRhdGFMYWJlbEZvbnRTaXplKVxuICAgIGNhbnZhcy5zZXRGaWxsU3R5bGUodGhpcy5kYXRhTGFiZWxDb2xvcilcblxuICAgIHRoaXMuZGF0YUxhYmVscy5tYXAoKGRhdGFMYWJlbCwgaW5kZXgpID0+IHtcbiAgICAgIGNhbnZhcy5maWxsVGV4dChkYXRhTGFiZWwubGFiZWwsIGRhdGFMYWJlbC5sZWZ0LCBkYXRhTGFiZWwuYm90dG9tKVxuICAgIH0pXG4gIH1cblxuICBkcmF3SXRlbShjYW52YXMsIGl0ZW0sIGluZGV4KSB7XG4gICAgbGV0IGNvbG9yID0gdGhpcy5nZXRDb2xvcihpbmRleClcbiAgICB2YXIgcHJvY2VzcyA9IHRoaXMucHJvY2Vzc1xuICAgIHZhciBtYXhWYWx1ZSA9IHRoaXMubWF4VmFsdWVcbiAgICB2YXIgbWluVmFsdWUgPSB0aGlzLm1pblZhbHVlXG4gICAgdmFyIG1heFhWYWx1ZSA9IHRoaXMubWF4WFZhbHVlXG4gICAgdmFyIG1pblhWYWx1ZSA9IHRoaXMubWluWFZhbHVlXG4gICAgdmFyIGNoYXJ0UGFkZGluZ0xlZnQgPSB0aGlzLmNoYXJ0UGFkZGluZ0xlZnRcbiAgICB2YXIgY2hhcnRQYWRkaW5nQm90dG9tID0gdGhpcy5jaGFydFBhZGRpbmdCb3R0b21cblxuICAgIHZhciBjaGFydENvbnRlbnRIZWlnaHQgPSB0aGlzLmdldENoYXJ0Q29udGVudEhlaWdodCgpXG4gICAgdmFyIGNoYXJ0Q29udGVudFdpZHRoID0gdGhpcy5nZXRDaGFydENvbnRlbnRXaWR0aCgpXG5cbiAgICB2YXIgZGF0YVNpemUgPSBpdGVtLmRhdGEubGVuZ3RoXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBkYXRhU2l6ZTsgaSsrKSB7XG4gICAgICB2YXIgcG9pbnQgPSBpdGVtLmRhdGFbaV1cbiAgICAgIGlmIChwb2ludCAmJiBwb2ludC54IDw9IG1heFhWYWx1ZSAmJiBwb2ludC54ID49IG1pblhWYWx1ZSAmJiBwb2ludC55IDw9IG1heFZhbHVlICYmIHBvaW50LnkgPj0gbWluVmFsdWUpIHtcbiAgICAgICAgdmFyIHggPSBjaGFydFBhZGRpbmdMZWZ0ICsgY2hhcnRDb250ZW50V2lkdGggLyAobWF4WFZhbHVlIC0gbWluWFZhbHVlKSAqIChwb2ludC54IC0gbWluWFZhbHVlKVxuICAgICAgICB2YXIgeSA9IHRoaXMuaGVpZ2h0IC0gY2hhcnRQYWRkaW5nQm90dG9tIC0gY2hhcnRDb250ZW50SGVpZ2h0IC8gKG1heFZhbHVlIC0gbWluVmFsdWUpICogKHBvaW50LnkgLSBtaW5WYWx1ZSkgKiBwcm9jZXNzXG4gICAgICAgIHZhciB6ID0gcG9pbnQuelxuICAgICAgICB2YXIgcmFkaXVzXG4gICAgICAgIGlmICh6KSB7XG4gICAgICAgICAgcmFkaXVzID0gdGhpcy5idWJibGVNYXhSYWRpdXMgKiBNYXRoLmFicyh6KSAqIHByb2Nlc3NcbiAgICAgICAgICBpZiAocmFkaXVzIDwgdGhpcy5idWJibGVNaW5SYWRpdXMpIHtcbiAgICAgICAgICAgIHJhZGl1cyA9IHRoaXMuYnViYmxlTWluUmFkaXVzXG4gICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHJhZGl1cyA9IHRoaXMuY2lyY2xlUmFkaXVzXG4gICAgICAgIH1cbiAgICAgICAgcG9pbnQueFBvc2l0aW9uID0geFxuICAgICAgICBwb2ludC55UG9zaXRpb24gPSB5XG4gICAgICAgIHBvaW50LnJhZGl1cyA9IHJhZGl1c1xuXG4gICAgICAgIGlmIChpbmRleCA9PSB0aGlzLmhpZ2hMaWdodEluZGV4ICYmIGkgPT0gdGhpcy5oaWdoTGlnaHRBcnJheUluZGV4KSB7XG4gICAgICAgICAgY2FudmFzLnNldEZpbGxTdHlsZSh0aGlzLmhpZ2hMaWdodENvbG9yKVxuICAgICAgICAgIGNhbnZhcy5zZXRTdHJva2VTdHlsZSh0aGlzLmhpZ2hMaWdodFN0cm9rZUNvbG9yKVxuICAgICAgICAgIGNhbnZhcy5zZXRMaW5lV2lkdGgoMSlcblxuICAgICAgICAgIGNhbnZhcy5iZWdpblBhdGgoKVxuICAgICAgICAgIGNhbnZhcy5hcmMoeCwgeSwgcmFkaXVzICsgMywgMCwgMiAqIE1hdGguUEkpXG4gICAgICAgICAgY2FudmFzLmZpbGwoKVxuICAgICAgICAgIGNhbnZhcy5jbG9zZVBhdGgoKVxuICAgICAgICAgIGNhbnZhcy5iZWdpblBhdGgoKVxuICAgICAgICAgIGNhbnZhcy5hcmMoeCwgeSwgcmFkaXVzLCAwLCAyICogTWF0aC5QSSlcbiAgICAgICAgICBjYW52YXMuc3Ryb2tlKClcbiAgICAgICAgICBjYW52YXMuY2xvc2VQYXRoKClcbiAgICAgICAgfVxuICAgICAgICBpZiAocG9pbnQuY29sb3JCeSkge1xuICAgICAgICAgIGNhbnZhcy5zZXRTdHJva2VTdHlsZShwb2ludC5jb2xvckJ5KVxuICAgICAgICAgIGNhbnZhcy5zZXRGaWxsU3R5bGUocG9pbnQuY29sb3JCeSlcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBjYW52YXMuc2V0U3Ryb2tlU3R5bGUoY29sb3IpXG4gICAgICAgICAgY2FudmFzLnNldEZpbGxTdHlsZShjb2xvcilcbiAgICAgICAgfVxuICAgICAgICBjYW52YXMuYmVnaW5QYXRoKClcbiAgICAgICAgY2FudmFzLmFyYyh4LCB5LCByYWRpdXMsIDAsIDIgKiBNYXRoLlBJKVxuICAgICAgICBjYW52YXMuZmlsbCgpXG4gICAgICAgIGNhbnZhcy5jbG9zZVBhdGgoKVxuXG4gICAgICAgIGlmICh0aGlzLmRyYXdEYXRhTGFiZWwgJiYgcHJvY2VzcyA9PSAxKSB7XG4gICAgICAgICAgbGV0IGRhdGFMYWJlbFBhZGRpbmcgPSB0aGlzLmRhdGFMYWJlbFBhZGRpbmdcbiAgICAgICAgICBsZXQgZGF0YUxhYmVsRm9udFNpemUgPSB0aGlzLmRhdGFMYWJlbEZvbnRTaXplXG5cbiAgICAgICAgICB2YXIgbGFiZWwgPSB0aGlzLmRhdGFsYWJlbENhbGxCYWNrKGluZGV4LCBpLCB0cnVlKVxuICAgICAgICAgIHZhciBsYWJlbFdpZHRoID0gY2FudmFzLm15TWVhc3VyZVRleHQobGFiZWwsIGRhdGFMYWJlbEZvbnRTaXplKVxuICAgICAgICAgIHRoaXMuYWRkRGF0YUxhYmVsKGxhYmVsLCB4IC0gbGFiZWxXaWR0aCAvIDIsIHkgLSBkYXRhTGFiZWxQYWRkaW5nIC0gcmFkaXVzLCBsYWJlbFdpZHRoKVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgZHJhd1Rvb2xUaXAoY2FudmFzKSB7XG4gICAgaWYgKCF0aGlzLmhpZ2hMaWdodERhdGEpIHtcbiAgICAgIHJldHVyblxuICAgIH1cbiAgICB2YXIgY2hhcnRQYWRkaW5nVG9wID0gdGhpcy5jaGFydFBhZGRpbmdUb3BcbiAgICB2YXIgY2hhcnRDb250ZW50SGVpZ2h0ID0gdGhpcy5nZXRDaGFydENvbnRlbnRIZWlnaHQoKVxuICAgIHZhciBjaGFydENvbnRlbnRXaWR0aCA9IHRoaXMuZ2V0Q2hhcnRDb250ZW50V2lkdGgoKVxuICAgIHZhciB4ID0gdGhpcy5oaWdoTGlnaHRYXG4gICAgdmFyIHkgPSB0aGlzLmhpZ2hMaWdodFlcblxuICAgIHZhciB0b29sVGlwQmFja2dyb3VuZENvbG9yID0gdGhpcy50b29sVGlwQmFja2dyb3VuZENvbG9yXG4gICAgdmFyIHRvb2xUaXBQYWRkaW5nID0gdGhpcy50b29sVGlwUGFkZGluZ1xuICAgIHZhciB0b29sVGlwVGV4dFBhZGRpbmcgPSB0aGlzLnRvb2xUaXBUZXh0UGFkZGluZ1xuICAgIHZhciB0b29sVGlwRm9udFNpemUgPSB0aGlzLnRvb2xUaXBGb250U2l6ZVxuICAgIHZhciB0b29sVGlwU3BsaXRMaW5lV2lkdGggPSB0aGlzLnRvb2xUaXBTcGxpdExpbmVXaWR0aFxuICAgIHZhciB0b29sVGlwU3BsaXRMaW5lQ29sb3IgPSB0aGlzLnRvb2xUaXBTcGxpdExpbmVDb2xvclxuXG4gICAgdmFyIHRvb2xUaXBXaWR0aCA9IHRvb2xUaXBQYWRkaW5nICogMlxuICAgIHZhciB0b29sVGlwSGVpZ2h0ID0gdG9vbFRpcFBhZGRpbmcgKiAyXG5cbiAgICB2YXIgaGlnaExpZ2h0RGF0YSA9IHRoaXMuaGlnaExpZ2h0RGF0YVxuXG4gICAgLy90aXRsZVxuICAgIHZhciBtYXhUaXBMaW5lV2lkdGggPSBjYW52YXMubXlNZWFzdXJlVGV4dChoaWdoTGlnaHREYXRhLnRpdGxlLCB0b29sVGlwRm9udFNpemUpXG4gICAgdG9vbFRpcEhlaWdodCArPSB0b29sVGlwRm9udFNpemUgKyB0b29sVGlwU3BsaXRMaW5lV2lkdGggKyB0b29sVGlwVGV4dFBhZGRpbmdcbiAgICBoaWdoTGlnaHREYXRhLmRhdGEubWFwKCh0ZXh0LCBpbmRleCkgPT4ge1xuICAgICAgdG9vbFRpcEhlaWdodCArPSB0b29sVGlwRm9udFNpemUgKyB0b29sVGlwVGV4dFBhZGRpbmdcblxuICAgICAgdmFyIHRleHRXaWR0aCA9IGNhbnZhcy5teU1lYXN1cmVUZXh0KHRleHQsIHRvb2xUaXBGb250U2l6ZSlcbiAgICAgIGlmIChtYXhUaXBMaW5lV2lkdGggPCB0ZXh0V2lkdGgpIHtcbiAgICAgICAgbWF4VGlwTGluZVdpZHRoID0gdGV4dFdpZHRoXG4gICAgICB9XG4gICAgfSlcbiAgICB0b29sVGlwV2lkdGggKz0gbWF4VGlwTGluZVdpZHRoXG5cbiAgICB2YXIgc3RhcnRYXG4gICAgaWYgKHggPiBjaGFydENvbnRlbnRXaWR0aCAvIDIpIHtcbiAgICAgIHN0YXJ0WCA9IHggLSB0aGlzLmhpZ2hMaWdodFJhZGl1cyAtIHRvb2xUaXBXaWR0aFxuICAgIH0gZWxzZSB7XG4gICAgICBzdGFydFggPSB4ICsgdGhpcy5oaWdoTGlnaHRSYWRpdXNcbiAgICB9XG4gICAgdmFyIHN0YXJ0WSA9IHkgLSB0b29sVGlwSGVpZ2h0XG4gICAgaWYgKHN0YXJ0WSA8IGNoYXJ0UGFkZGluZ1RvcCkge1xuICAgICAgc3RhcnRZID0geVxuICAgIH1cbiAgICBpZiAoc3RhcnRZID4gY2hhcnRDb250ZW50SGVpZ2h0ICsgY2hhcnRQYWRkaW5nVG9wKSB7XG4gICAgICBzdGFydFkgPSBjaGFydENvbnRlbnRIZWlnaHQgKyBjaGFydFBhZGRpbmdUb3AgLSB0b29sVGlwSGVpZ2h0XG4gICAgfVxuXG4gICAgY2FudmFzLnNldEZpbGxTdHlsZSh0b29sVGlwQmFja2dyb3VuZENvbG9yKVxuICAgIGNhbnZhcy5iZWdpblBhdGgoKVxuICAgIGNhbnZhcy5maWxsUmVjdChzdGFydFgsIHN0YXJ0WSwgdG9vbFRpcFdpZHRoLCB0b29sVGlwSGVpZ2h0KVxuICAgIGNhbnZhcy5jbG9zZVBhdGgoKVxuXG4gICAgY2FudmFzLnNldEZpbGxTdHlsZSh0b29sVGlwU3BsaXRMaW5lQ29sb3IpXG4gICAgY2FudmFzLnNldFN0cm9rZVN0eWxlKHRvb2xUaXBTcGxpdExpbmVDb2xvcilcbiAgICBjYW52YXMuc2V0TGluZVdpZHRoKHRvb2xUaXBTcGxpdExpbmVXaWR0aClcbiAgICBjYW52YXMuc2V0Rm9udFNpemUodG9vbFRpcEZvbnRTaXplKVxuXG4gICAgdmFyIGRyYXdYID0gc3RhcnRYICsgdG9vbFRpcFBhZGRpbmdcbiAgICB2YXIgZHJhd1kgPSBzdGFydFkgKyB0b29sVGlwUGFkZGluZyArIHRvb2xUaXBGb250U2l6ZVxuXG4gICAgY2FudmFzLmZpbGxUZXh0KGhpZ2hMaWdodERhdGEudGl0bGUsIGRyYXdYLCBkcmF3WSlcbiAgICBkcmF3WSArPSB0b29sVGlwVGV4dFBhZGRpbmcgKyB0b29sVGlwU3BsaXRMaW5lV2lkdGggLyAyXG4gICAgY2FudmFzLmJlZ2luUGF0aCgpXG4gICAgY2FudmFzLm1vdmVUbyhkcmF3WCAtIHRvb2xUaXBQYWRkaW5nICogMC4yNSwgZHJhd1kpXG4gICAgY2FudmFzLmxpbmVUbyhkcmF3WCArIHRvb2xUaXBXaWR0aCAtIHRvb2xUaXBQYWRkaW5nICogMS43NSwgZHJhd1kpXG4gICAgY2FudmFzLnN0cm9rZSgpXG4gICAgY2FudmFzLmNsb3NlUGF0aCgpXG5cbiAgICBoaWdoTGlnaHREYXRhLmRhdGEubWFwKCh0ZXh0LCBpbmRleCkgPT4ge1xuICAgICAgZHJhd1kgKz0gdG9vbFRpcFRleHRQYWRkaW5nICsgdG9vbFRpcEZvbnRTaXplXG4gICAgICBjYW52YXMuZmlsbFRleHQodGV4dCwgZHJhd1gsIGRyYXdZKVxuICAgIH0pXG4gIH1cblxuICBkcmF3UmVmcyhjYW52YXMpIHtcbiAgICB2YXIgbWF4VmFsdWUgPSB0aGlzLm1heFZhbHVlXG4gICAgdmFyIG1pblZhbHVlID0gdGhpcy5taW5WYWx1ZVxuICAgIHZhciBtYXhYVmFsdWUgPSB0aGlzLm1heFhWYWx1ZVxuICAgIHZhciBtaW5YVmFsdWUgPSB0aGlzLm1pblhWYWx1ZVxuICAgIHZhciBheGlzRm9udFNpemUgPSB0aGlzLmF4aXNGb250U2l6ZVxuICAgIHZhciBheGlzTGluZVdpZHRoID0gdGhpcy5heGlzTGluZVdpZHRoXG4gICAgdmFyIGF4aXNWYWx1ZVBhZGRpbmcgPSB0aGlzLmF4aXNWYWx1ZVBhZGRpbmdcbiAgICB2YXIgZGFzaGVkTGluZVdpZHRoID0gdGhpcy5kYXNoZWRMaW5lV2lkdGhcbiAgICB2YXIgY2hhcnRQYWRkaW5nTGVmdCA9IHRoaXMuY2hhcnRQYWRkaW5nTGVmdFxuICAgIHZhciBjaGFydFBhZGRpbmdSaWdodCA9IHRoaXMuY2hhcnRQYWRkaW5nUmlnaHRcbiAgICB2YXIgY2hhcnRQYWRkaW5nVG9wID0gdGhpcy5jaGFydFBhZGRpbmdUb3BcbiAgICB2YXIgY2hhcnRQYWRkaW5nQm90dG9tID0gdGhpcy5jaGFydFBhZGRpbmdCb3R0b21cblxuICAgIHZhciBjaGFydENvbnRlbnRIZWlnaHQgPSB0aGlzLmdldENoYXJ0Q29udGVudEhlaWdodCgpXG4gICAgdmFyIGNoYXJ0Q29udGVudFdpZHRoID0gdGhpcy5nZXRDaGFydENvbnRlbnRXaWR0aCgpXG5cbiAgICB0aGlzLnhSZWZzLm1hcCgocmVmLCBpbmRleCkgPT4ge1xuICAgICAgdmFyIHggPSBjaGFydFBhZGRpbmdMZWZ0ICsgY2hhcnRDb250ZW50V2lkdGggLyAobWF4WFZhbHVlIC0gbWluWFZhbHVlKSAqIChyZWYudmFsdWUgLSBtaW5YVmFsdWUpXG5cbiAgICAgIGNhbnZhcy5zZXRMaW5lV2lkdGgoYXhpc0xpbmVXaWR0aClcbiAgICAgIGNhbnZhcy5zZXRTdHJva2VTdHlsZShyZWYuY29sb3IpXG4gICAgICB0aGlzLmRyYXdEYXNoZWRMaW5lKGNhbnZhcywgeCwgY2hhcnRQYWRkaW5nVG9wLCB4LCB0aGlzLmhlaWdodCAtIGNoYXJ0UGFkZGluZ0JvdHRvbSwgZGFzaGVkTGluZVdpZHRoKVxuXG4gICAgICBpZiAodGhpcy5heGlzRW5hYmxlKSB7XG4gICAgICAgIHZhciBsYWJlbFlPZmZzZXQgPSBpbmRleCAqIChheGlzRm9udFNpemUgKyBheGlzVmFsdWVQYWRkaW5nICogMS41KVxuICAgICAgICB2YXIgbGFiZWxXaWR0aCA9IGNhbnZhcy5teU1lYXN1cmVUZXh0KHJlZi5sYWJlbCwgYXhpc0ZvbnRTaXplKVxuXG4gICAgICAgIHZhciBsZWZ0WCAgID0geCAtIGxhYmVsV2lkdGggLSBheGlzVmFsdWVQYWRkaW5nICogMlxuICAgICAgICB2YXIgY2VudGVyWCA9IHggLSBheGlzVmFsdWVQYWRkaW5nXG4gICAgICAgIHZhciByaWdodFggID0geFxuICAgICAgICB2YXIgdG9wWSAgICA9IHRoaXMuaGVpZ2h0IC0gY2hhcnRQYWRkaW5nQm90dG9tIC0gbGFiZWxZT2Zmc2V0IC0gYXhpc0ZvbnRTaXplIC8gMiAtIGF4aXNWYWx1ZVBhZGRpbmcgLyAyXG4gICAgICAgIHZhciBjZW50ZXJZID0gdGhpcy5oZWlnaHQgLSBjaGFydFBhZGRpbmdCb3R0b20gLSBsYWJlbFlPZmZzZXRcbiAgICAgICAgdmFyIGJvdHRvbVkgPSB0aGlzLmhlaWdodCAtIGNoYXJ0UGFkZGluZ0JvdHRvbSAtIGxhYmVsWU9mZnNldCArIGF4aXNGb250U2l6ZSAvIDIgKyBheGlzVmFsdWVQYWRkaW5nIC8gMlxuXG4gICAgICAgIGNhbnZhcy5iZWdpblBhdGgoKVxuICAgICAgICBjYW52YXMubW92ZVRvKGxlZnRYLCB0b3BZKVxuICAgICAgICBjYW52YXMubGluZVRvKGNlbnRlclgsIHRvcFkpXG4gICAgICAgIGNhbnZhcy5saW5lVG8ocmlnaHRYLCBjZW50ZXJZKVxuICAgICAgICBjYW52YXMubGluZVRvKGNlbnRlclgsIGJvdHRvbVkpXG4gICAgICAgIGNhbnZhcy5saW5lVG8obGVmdFgsIGJvdHRvbVkpXG4gICAgICAgIGNhbnZhcy5saW5lVG8obGVmdFgsIHRvcFkpXG4gICAgICAgIGNhbnZhcy5zZXRGaWxsU3R5bGUocmVmLmNvbG9yKVxuICAgICAgICBjYW52YXMuZmlsbCgpXG4gICAgICAgIGNhbnZhcy5jbG9zZVBhdGgoKVxuXG4gICAgICAgIHJlZi5sZWZ0ID0gbGVmdFhcbiAgICAgICAgcmVmLnRvcCA9IHRvcFlcbiAgICAgICAgcmVmLmNlbnRlclkgPSBjZW50ZXJZXG4gICAgICAgIHJlZi5yaWdodCA9IHJpZ2h0WFxuICAgICAgICByZWYuYm90dG9tID0gYm90dG9tWVxuXG4gICAgICAgIGNhbnZhcy5zZXRGaWxsU3R5bGUoJ3doaXRlJylcbiAgICAgICAgY2FudmFzLnNldEZvbnRTaXplKGF4aXNGb250U2l6ZSlcbiAgICAgICAgY2FudmFzLmZpbGxUZXh0KHJlZi5sYWJlbCwgbGVmdFggKyBheGlzVmFsdWVQYWRkaW5nIC8gMiwgdG9wWSArIGF4aXNWYWx1ZVBhZGRpbmcgLyAyICsgYXhpc0ZvbnRTaXplKVxuICAgICAgfVxuICAgIH0pXG5cbiAgICB0aGlzLnkxUmVmcy5tYXAoKHJlZiwgaW5kZXgpID0+IHtcbiAgICAgIHZhciB5ID0gdGhpcy5oZWlnaHQgLSBjaGFydFBhZGRpbmdCb3R0b20gLSBjaGFydENvbnRlbnRIZWlnaHQgLyAobWF4VmFsdWUgLSBtaW5WYWx1ZSkgKiAocmVmLnZhbHVlIC0gbWluVmFsdWUpXG5cbiAgICAgIGNhbnZhcy5zZXRMaW5lV2lkdGgoYXhpc0xpbmVXaWR0aClcbiAgICAgIGNhbnZhcy5zZXRTdHJva2VTdHlsZShyZWYuY29sb3IpXG4gICAgICB0aGlzLmRyYXdEYXNoZWRMaW5lKGNhbnZhcywgY2hhcnRQYWRkaW5nTGVmdCwgeSwgdGhpcy53aWR0aCAtIGNoYXJ0UGFkZGluZ1JpZ2h0LCB5LCBkYXNoZWRMaW5lV2lkdGgpXG5cbiAgICAgIGlmICh0aGlzLmF4aXNFbmFibGUpIHtcbiAgICAgICAgdmFyIGxhYmVsV2lkdGggPSBjYW52YXMubXlNZWFzdXJlVGV4dChyZWYubGFiZWwsIGF4aXNGb250U2l6ZSlcblxuICAgICAgICB2YXIgbGVmdFggICA9IGNoYXJ0UGFkZGluZ0xlZnQgLSBheGlzVmFsdWVQYWRkaW5nICogMiAtIGxhYmVsV2lkdGhcbiAgICAgICAgdmFyIGNlbnRlclggPSBjaGFydFBhZGRpbmdMZWZ0IC0gYXhpc1ZhbHVlUGFkZGluZyAqIDEuNVxuICAgICAgICB2YXIgcmlnaHRYICA9IGNoYXJ0UGFkZGluZ0xlZnRcbiAgICAgICAgdmFyIHRvcFkgICAgPSB5IC0gYXhpc0ZvbnRTaXplIC8gMiAtIGF4aXNWYWx1ZVBhZGRpbmcgLyAyXG4gICAgICAgIHZhciBjZW50ZXJZID0geVxuICAgICAgICB2YXIgYm90dG9tWSA9IHkgKyBheGlzRm9udFNpemUgLyAyICsgYXhpc1ZhbHVlUGFkZGluZyAvIDJcblxuICAgICAgICBjYW52YXMuYmVnaW5QYXRoKClcbiAgICAgICAgY2FudmFzLm1vdmVUbyhsZWZ0WCwgICAgdG9wWSlcbiAgICAgICAgY2FudmFzLmxpbmVUbyhjZW50ZXJYLCAgdG9wWSlcbiAgICAgICAgY2FudmFzLmxpbmVUbyhyaWdodFgsICAgY2VudGVyWSlcbiAgICAgICAgY2FudmFzLmxpbmVUbyhjZW50ZXJYLCAgYm90dG9tWSlcbiAgICAgICAgY2FudmFzLmxpbmVUbyhsZWZ0WCwgICAgYm90dG9tWSlcbiAgICAgICAgY2FudmFzLmxpbmVUbyhsZWZ0WCwgICAgdG9wWSlcbiAgICAgICAgY2FudmFzLnNldEZpbGxTdHlsZShyZWYuY29sb3IpXG4gICAgICAgIGNhbnZhcy5maWxsKClcbiAgICAgICAgY2FudmFzLmNsb3NlUGF0aCgpXG5cbiAgICAgICAgcmVmLmxlZnQgPSBsZWZ0WFxuICAgICAgICByZWYudG9wID0gdG9wWVxuICAgICAgICByZWYuY2VudGVyWSA9IGNlbnRlcllcbiAgICAgICAgcmVmLnJpZ2h0ID0gcmlnaHRYXG4gICAgICAgIHJlZi5ib3R0b20gPSBib3R0b21ZXG5cbiAgICAgICAgY2FudmFzLnNldEZpbGxTdHlsZSgnd2hpdGUnKVxuICAgICAgICBjYW52YXMuc2V0Rm9udFNpemUoYXhpc0ZvbnRTaXplKVxuICAgICAgICBjYW52YXMuZmlsbFRleHQocmVmLmxhYmVsLCBsZWZ0WCArIGF4aXNWYWx1ZVBhZGRpbmcgLyAyLCB0b3BZICsgYXhpc1ZhbHVlUGFkZGluZyAvIDIgKyBheGlzRm9udFNpemUpXG4gICAgICB9XG4gICAgfSlcbiAgfVxuXG4gIGRyYXdEYXNoZWRMaW5lKGNhbnZhcywgeDEsIHkxLCB4MiwgeTIsIGRhc2hMZW5ndGgpIHtcbiAgICB2YXIgZGVsdGFYID0gTWF0aC5hYnMoeDIgLSB4MSlcbiAgICB2YXIgZGVsdGFZID0gTWF0aC5hYnMoeTIgLSB5MSlcbiAgICB2YXIgbnVtRGFzaGVzID0gTWF0aC5mbG9vcihNYXRoLnNxcnQoZGVsdGFYICogZGVsdGFYICsgZGVsdGFZICogZGVsdGFZKSAvIGRhc2hMZW5ndGgpXG4gICAgY2FudmFzLmJlZ2luUGF0aCgpXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBudW1EYXNoZXM7ICsraSkge1xuICAgICAgY2FudmFzW2kgJSAyID09PSAwID8gJ21vdmVUbycgOiAnbGluZVRvJ10oeDEgKyAoZGVsdGFYIC8gbnVtRGFzaGVzKSAqIGksIHkxICsgKGRlbHRhWSAvIG51bURhc2hlcykgKiBpKVxuICAgIH1cbiAgICBjYW52YXMuc3Ryb2tlKClcbiAgICBjYW52YXMuY2xvc2VQYXRoKClcbiAgfVxuXG4gIGRyYXdBeGlzKGNhbnZhcykge1xuICAgIHZhciB5MVRpY2tzID0gdGhpcy55MVRpY2tzXG4gICAgdmFyIHlMYWJlbENvdW50ID0geTFUaWNrcy5sZW5ndGggLSAxXG4gICAgdmFyIG1heFZhbHVlID0gdGhpcy5tYXhWYWx1ZVxuICAgIHZhciBtaW5WYWx1ZSA9IHRoaXMubWluVmFsdWVcbiAgICB2YXIgeFRpY2tzID0gdGhpcy54VGlja3NcbiAgICB2YXIgeExhYmVsQ291bnQgPSB4VGlja3MubGVuZ3RoIC0gMVxuICAgIHZhciBtYXhYVmFsdWUgPSB0aGlzLm1heFhWYWx1ZVxuICAgIHZhciBtaW5YVmFsdWUgPSB0aGlzLm1pblhWYWx1ZVxuICAgIHZhciBheGlzRm9udFNpemUgPSB0aGlzLmF4aXNGb250U2l6ZVxuICAgIHZhciBheGlzVmFsdWVQYWRkaW5nID0gdGhpcy5heGlzVmFsdWVQYWRkaW5nXG4gICAgdmFyIGNoYXJ0UGFkZGluZ0xlZnQgPSB0aGlzLmNoYXJ0UGFkZGluZ0xlZnRcbiAgICB2YXIgY2hhcnRQYWRkaW5nUmlnaHQgPSB0aGlzLmNoYXJ0UGFkZGluZ1JpZ2h0XG4gICAgdmFyIGNoYXJ0UGFkZGluZ1RvcCA9IHRoaXMuY2hhcnRQYWRkaW5nVG9wXG4gICAgdmFyIGNoYXJ0UGFkZGluZ0JvdHRvbSA9IHRoaXMuY2hhcnRQYWRkaW5nQm90dG9tXG5cbiAgICB2YXIgY2hhcnRDb250ZW50SGVpZ2h0ID0gdGhpcy5nZXRDaGFydENvbnRlbnRIZWlnaHQoKVxuICAgIHZhciBjaGFydENvbnRlbnRXaWR0aCA9IHRoaXMuZ2V0Q2hhcnRDb250ZW50V2lkdGgoKVxuXG4gICAgdmFyIGF4aXNMaW5lQ29sb3IgPSB0aGlzLmF4aXNMaW5lQ29sb3JcbiAgICB2YXIgYXhpc0ZvbnRDb2xvciA9IHRoaXMuYXhpc0ZvbnRDb2xvclxuICAgIHZhciBheGlzTGluZVdpZHRoID0gdGhpcy5heGlzTGluZVdpZHRoXG5cbiAgICBjYW52YXMuc2V0U3Ryb2tlU3R5bGUoYXhpc0xpbmVDb2xvcilcbiAgICBjYW52YXMuc2V0RmlsbFN0eWxlKGF4aXNGb250Q29sb3IpXG4gICAgY2FudmFzLnNldExpbmVXaWR0aChheGlzTGluZVdpZHRoKVxuICAgIGNhbnZhcy5zZXRMaW5lSm9pbignbWl0ZXInKVxuICAgIGNhbnZhcy5iZWdpblBhdGgoKVxuICAgIGNhbnZhcy5tb3ZlVG8oY2hhcnRQYWRkaW5nTGVmdCwgY2hhcnRQYWRkaW5nVG9wKVxuICAgIGNhbnZhcy5saW5lVG8oY2hhcnRQYWRkaW5nTGVmdCwgdGhpcy5oZWlnaHQgLSBjaGFydFBhZGRpbmdCb3R0b20pXG4gICAgY2FudmFzLnN0cm9rZSgpXG5cbiAgICB2YXIgcHJlWUl0ZW1TdGVwID0gY2hhcnRDb250ZW50SGVpZ2h0IC8geUxhYmVsQ291bnRcbiAgICB2YXIgcHJlWUl0ZW1WYWx1ZSA9IChtYXhWYWx1ZSAtIG1pblZhbHVlKSAvIHlMYWJlbENvdW50XG4gICAgY2FudmFzLnNldEZvbnRTaXplKGF4aXNGb250U2l6ZSlcbiAgICBmb3IgKHZhciB5ID0gMDsgeSA8PSB5TGFiZWxDb3VudDsgeSsrKSB7XG4gICAgICB2YXIgaXRlbVBvc2l0aW9uID0gY2hhcnRQYWRkaW5nVG9wICsgcHJlWUl0ZW1TdGVwICogeVxuXG4gICAgICBjYW52YXMuYmVnaW5QYXRoKClcbiAgICAgIGNhbnZhcy5tb3ZlVG8oY2hhcnRQYWRkaW5nTGVmdCwgaXRlbVBvc2l0aW9uKVxuICAgICAgY2FudmFzLmxpbmVUbyh0aGlzLndpZHRoIC0gY2hhcnRQYWRkaW5nUmlnaHQsIGl0ZW1Qb3NpdGlvbilcbiAgICAgIGNhbnZhcy5zdHJva2UoKVxuXG4gICAgICB2YXIgYXhpc0l0ZW1UZXh0ID0geTFUaWNrc1t5TGFiZWxDb3VudCAtIHldXG4gICAgICB2YXIgYXhpc0l0ZW1UZXh0V2lkdGggPSBjYW52YXMubXlNZWFzdXJlVGV4dChheGlzSXRlbVRleHQsIGF4aXNGb250U2l6ZSlcbiAgICAgIGNhbnZhcy5maWxsVGV4dChheGlzSXRlbVRleHQsIGNoYXJ0UGFkZGluZ0xlZnQgLSBheGlzSXRlbVRleHRXaWR0aCAtIGF4aXNWYWx1ZVBhZGRpbmcsIGl0ZW1Qb3NpdGlvbiArIGF4aXNGb250U2l6ZSAvIDIpXG4gICAgfVxuXG4gICAgdmFyIHByZVhJdGVtU3RlcCA9IGNoYXJ0Q29udGVudFdpZHRoIC8geExhYmVsQ291bnRcbiAgICB2YXIgcHJlWEl0ZW1WYWx1ZSA9IChtYXhYVmFsdWUgLSBtaW5YVmFsdWUpIC8geExhYmVsQ291bnRcbiAgICBmb3IgKHZhciB4ID0gMDsgeCA8PSB4TGFiZWxDb3VudDsgeCsrKSB7XG4gICAgICB2YXIgaXRlbVBvc2l0aW9uID0gY2hhcnRQYWRkaW5nTGVmdCArIHByZVhJdGVtU3RlcCAqIHhcblxuICAgICAgY2FudmFzLmJlZ2luUGF0aCgpXG4gICAgICBjYW52YXMubW92ZVRvKGl0ZW1Qb3NpdGlvbiwgdGhpcy5oZWlnaHQgLSBjaGFydFBhZGRpbmdCb3R0b20pXG4gICAgICBjYW52YXMubGluZVRvKGl0ZW1Qb3NpdGlvbiwgdGhpcy5oZWlnaHQgLSBjaGFydFBhZGRpbmdCb3R0b20gKyBheGlzVmFsdWVQYWRkaW5nICogMyAvIDQpXG4gICAgICBjYW52YXMuc3Ryb2tlKClcblxuICAgICAgdmFyIGF4aXNJdGVtVGV4dCA9IHhUaWNrc1t4XVxuICAgICAgdmFyIGF4aXNJdGVtVGV4dFdpZHRoID0gY2FudmFzLm15TWVhc3VyZVRleHQoYXhpc0l0ZW1UZXh0LCBheGlzRm9udFNpemUpXG4gICAgICBjYW52YXMuZmlsbFRleHQoYXhpc0l0ZW1UZXh0LCBpdGVtUG9zaXRpb24gLSBheGlzSXRlbVRleHRXaWR0aCAvIDIsIHRoaXMuaGVpZ2h0IC0gY2hhcnRQYWRkaW5nQm90dG9tICsgYXhpc1ZhbHVlUGFkZGluZyArIGF4aXNGb250U2l6ZSlcbiAgICB9XG4gIH1cblxuICBkcmF3TGVnZW5kKGNhbnZhcykge1xuICAgIHZhciBjaGFydFBhZGRpbmdMZWZ0ID0gdGhpcy5jaGFydFBhZGRpbmdMZWZ0XG4gICAgdmFyIGNoYXJ0UGFkZGluZ1JpZ2h0ID0gdGhpcy5jaGFydFBhZGRpbmdSaWdodFxuICAgIHZhciBsZWdlbmRGb250U2l6ZSA9IHRoaXMubGVnZW5kRm9udFNpemVcbiAgICB2YXIgbGVnZW5kUGFkZGluZyA9IHRoaXMubGVnZW5kUGFkZGluZ1xuICAgIHZhciBsZWdlbmRUZXh0Q29sb3IgPSB0aGlzLmxlZ2VuZFRleHRDb2xvclxuXG4gICAgY2FudmFzLnNldEZvbnRTaXplKGxlZ2VuZEZvbnRTaXplKVxuXG4gICAgdmFyIGxlZ2VuZFdpZHRoID0gMFxuICAgIHZhciBpc011bHRpTGluZSA9IGZhbHNlXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLmRhdGEubGVuZ3RoOyBpKyspIHtcbiAgICAgIHZhciBzbGljZSA9IHRoaXMuZGF0YVtpXVxuICAgICAgaWYgKGxlZ2VuZFdpZHRoID4gMCkge1xuICAgICAgICBsZWdlbmRXaWR0aCArPSBsZWdlbmRGb250U2l6ZVxuICAgICAgfVxuXG4gICAgICBsZWdlbmRXaWR0aCArPSBjYW52YXMubXlNZWFzdXJlVGV4dChzbGljZS5uYW1lLCBsZWdlbmRGb250U2l6ZSkgKyBsZWdlbmRGb250U2l6ZSAqIDEuMlxuICAgICAgaWYgKGxlZ2VuZFdpZHRoID4gdGhpcy5nZXRDaGFydENvbnRlbnRXaWR0aCgpKSB7XG4gICAgICAgIGlzTXVsdGlMaW5lID0gdHJ1ZVxuICAgICAgfVxuICAgIH1cblxuICAgIHRoaXMubGVnZW5kV2lkdGggPSBsZWdlbmRXaWR0aFxuICAgIHRoaXMuaXNNdWx0aUxpbmUgPSBpc011bHRpTGluZVxuXG4gICAgaWYgKCFpc011bHRpTGluZSkge1xuICAgICAgdmFyIHN0YXJ0WCA9ICh0aGlzLndpZHRoIC0gbGVnZW5kV2lkdGgpIC8gMjtcbiAgICAgIHZhciBzdGFydFkgPSB0aGlzLmhlaWdodCAtIGxlZ2VuZFBhZGRpbmcgLSBsZWdlbmRGb250U2l6ZTtcbiAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy5kYXRhLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIHZhciBzbGljZSA9IHRoaXMuZGF0YVtpXVxuICAgICAgICB2YXIgdGV4dFdpZHRoID0gY2FudmFzLm15TWVhc3VyZVRleHQoc2xpY2UubmFtZSwgbGVnZW5kRm9udFNpemUpXG4gICAgICAgIGlmIChzdGFydFggKyB0ZXh0V2lkdGggKyBsZWdlbmRGb250U2l6ZSAqIDEuMiA+IHRoaXMud2lkdGggLSBjaGFydFBhZGRpbmdSaWdodCkge1xuICAgICAgICAgIHN0YXJ0WCA9IGNoYXJ0UGFkZGluZ0xlZnRcbiAgICAgICAgICBzdGFydFkgKz0gbGVnZW5kRm9udFNpemUgKiAxLjVcbiAgICAgICAgfVxuXG4gICAgICAgIHZhciBzZXJpZXNDb2xvciA9IHRoaXMuZ2V0Q29sb3IoaSlcbiAgICAgICAgY2FudmFzLnNldEZpbGxTdHlsZShzZXJpZXNDb2xvcilcbiAgICAgICAgY2FudmFzLmJlZ2luUGF0aCgpXG4gICAgICAgIGNhbnZhcy5hcmMoc3RhcnRYICsgbGVnZW5kRm9udFNpemUgLyAyLCBzdGFydFkgKyBsZWdlbmRGb250U2l6ZSAvIDIsIGxlZ2VuZEZvbnRTaXplIC8gMiwgMCwgMiAqIE1hdGguUEkpXG4gICAgICAgIGNhbnZhcy5maWxsKClcbiAgICAgICAgY2FudmFzLmNsb3NlUGF0aCgpXG5cbiAgICAgICAgc3RhcnRYICs9IGxlZ2VuZEZvbnRTaXplICogMS4yXG4gICAgICAgIGlmICh0aGlzLmlzSGlkZGVuU2VyaWVzKGkpKSB7XG4gICAgICAgICAgY2FudmFzLnNldEZpbGxTdHlsZShzZXJpZXNDb2xvcilcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBjYW52YXMuc2V0RmlsbFN0eWxlKGxlZ2VuZFRleHRDb2xvcilcbiAgICAgICAgfVxuICAgICAgICBjYW52YXMuZmlsbFRleHQoc2xpY2UubmFtZSwgc3RhcnRYLCBzdGFydFkgKyBsZWdlbmRGb250U2l6ZSlcblxuICAgICAgICBzdGFydFggKz0gdGV4dFdpZHRoICsgbGVnZW5kRm9udFNpemVcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgdmFyIHN0YXJ0WCA9IGNoYXJ0UGFkZGluZ0xlZnRcbiAgICAgIHZhciBzdGFydFkgPSB0aGlzLmhlaWdodCAtIGxlZ2VuZFBhZGRpbmcgLSBsZWdlbmRGb250U2l6ZTtcblxuICAgICAgaWYgKHN0YXJ0WCArIGxlZ2VuZEZvbnRTaXplICogMS4yICogdGhpcy5kYXRhLmxlbmd0aCA+IHRoaXMud2lkdGgpIHtcbiAgICAgICAgLy9sZWdlbmTmlbDph4/ov4flpJpcbiAgICAgICAgY2FudmFzLnNldEZpbGxTdHlsZSh0aGlzLmdldENvbG9yKDApKVxuICAgICAgICBjYW52YXMuZmlsbFJlY3Qoc3RhcnRYLCBzdGFydFksIGxlZ2VuZEZvbnRTaXplLCBsZWdlbmRGb250U2l6ZSlcbiAgICAgICAgc3RhcnRYICs9IGxlZ2VuZEZvbnRTaXplICogMS4yXG5cbiAgICAgICAgdmFyIGJldHdlZW5UZXh0ID0gXCJ+XCJcbiAgICAgICAgdmFyIGJ0d1RleHRXaWR0aCA9IGNhbnZhcy5teU1lYXN1cmVUZXh0KGJldHdlZW5UZXh0LCBsZWdlbmRGb250U2l6ZSlcbiAgICAgICAgY2FudmFzLnNldEZpbGxTdHlsZShsZWdlbmRUZXh0Q29sb3IpXG4gICAgICAgIGNhbnZhcy5maWxsVGV4dChiZXR3ZWVuVGV4dCwgc3RhcnRYLCBzdGFydFkgKyBsZWdlbmRGb250U2l6ZSlcbiAgICAgICAgc3RhcnRYICs9IGJ0d1RleHRXaWR0aCArIGxlZ2VuZEZvbnRTaXplICogMC4yXG5cbiAgICAgICAgY2FudmFzLnNldEZpbGxTdHlsZSh0aGlzLmdldENvbG9yKHRoaXMuZGF0YS5sZW5ndGggLSAxKSlcbiAgICAgICAgY2FudmFzLmZpbGxSZWN0KHN0YXJ0WCwgc3RhcnRZLCBsZWdlbmRGb250U2l6ZSwgbGVnZW5kRm9udFNpemUpXG4gICAgICAgIHN0YXJ0WCArPSBsZWdlbmRGb250U2l6ZSAqIDEuMlxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLmRhdGEubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICB2YXIgc2xpY2UgPSB0aGlzLmRhdGFbaV1cbiAgICAgICAgICBjYW52YXMuc2V0RmlsbFN0eWxlKHRoaXMuZ2V0Q29sb3IoaSkpXG4gICAgICAgICAgY2FudmFzLmZpbGxSZWN0KHN0YXJ0WCwgc3RhcnRZLCBsZWdlbmRGb250U2l6ZSwgbGVnZW5kRm9udFNpemUpXG4gICAgICAgICAgc3RhcnRYICs9IGxlZ2VuZEZvbnRTaXplICogMS4yXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHN0YXJ0WCArPSBsZWdlbmRGb250U2l6ZSAqIDAuM1xuICAgICAgdmFyIHNpbXBsZVRleHQgPSB0aGlzLmRhdGFbMF0ubmFtZSArIFwiIH4gXCIgKyB0aGlzLmRhdGFbdGhpcy5kYXRhLmxlbmd0aCAtIDFdLm5hbWU7XG4gICAgICB2YXIgc3BUZXh0V2lkdGggPSBjYW52YXMubXlNZWFzdXJlVGV4dChzaW1wbGVUZXh0LCBsZWdlbmRGb250U2l6ZSlcbiAgICAgIGNhbnZhcy5zZXRGaWxsU3R5bGUobGVnZW5kVGV4dENvbG9yKVxuICAgICAgY2FudmFzLmZpbGxUZXh0KHNpbXBsZVRleHQsIHN0YXJ0WCwgc3RhcnRZICsgbGVnZW5kRm9udFNpemUpXG4gICAgfVxuICB9XG5cbiAgZHJhd05vRGF0YShjYW52YXMpIHtcbiAgICB2YXIgdGV4dCA9IHRoaXMubm9EYXRhVGV4dFxuICAgIHZhciB0ZXh0V2lkdGggPSBjYW52YXMubXlNZWFzdXJlVGV4dCh0ZXh0LCB0aGlzLm5vRGF0YUZvbnRTaXplKVxuICAgIGNhbnZhcy5zZXRGaWxsU3R5bGUodGhpcy5ub0RhdGFUZXh0Q29sb3IpXG4gICAgY2FudmFzLmZpbGxUZXh0KHRleHQsICh0aGlzLndpZHRoIC0gdGV4dFdpZHRoKSAvIDIsICh0aGlzLmhlaWdodCArIHRoaXMubm9EYXRhRm9udFNpemUpIC8gMilcbiAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IFNjYXR0ZXI7XG4iLCJ2YXIgY2hhcnRVdGlscyA9IHJlcXVpcmUoJy4vY2hhcnRVdGlsLmpzJylcbmNvbnN0IHtBbmltYXRpb259ID0gY2hhcnRVdGlsc1xuY2xhc3MgTWl4IHtcbiAgY29uc3RydWN0b3Iob3B0cykge1xuICAgIGNvbnNvbGUubG9nKG9wdHMpXG5cbiAgICB0aGlzLmNhbnZhcyA9IG9wdHMuY2FudmFzXG4gICAgdGhpcy53aWR0aCA9IG9wdHMud2lkdGhcbiAgICB0aGlzLmhlaWdodCA9IG9wdHMuaGVpZ2h0XG4gICAgdGhpcy5jaGFydFBhZGRpbmdMZWZ0ID0gb3B0cy5jaGFydFBhZGRpbmdMZWZ0IHx8IDQwXG4gICAgdGhpcy5jaGFydFBhZGRpbmdSaWdodCA9IG9wdHMuY2hhcnRQYWRkaW5nUmlnaHQgfHwgNDBcbiAgICB0aGlzLmNoYXJ0UGFkZGluZ1RvcCA9IG9wdHMuY2hhcnRQYWRkaW5nVG9wIHx8IDQwXG4gICAgdGhpcy5jaGFydFBhZGRpbmdCb3R0b20gPSBvcHRzLmNoYXJ0UGFkZGluZ0JvdHRvbSB8fCA0MFxuXG4gICAgdGhpcy5kcmF3V2l0aEFuaW1hdGlvbiA9IG9wdHMuZHJhd1dpdGhBbmltYXRpb24gPT09IHVuZGVmaW5lZCA/IHRydWUgOiBvcHRzLmRyYXdXaXRoQW5pbWF0aW9uXG5cbiAgICB0aGlzLm5vRGF0YSA9IG9wdHMubm9EYXRhIHx8IGZhbHNlXG4gICAgdGhpcy5ub0RhdGFUZXh0ID0gb3B0cy5ub0RhdGFUZXh0IHx8ICfmmoLml6DmlbDmja4nXG4gICAgdGhpcy5ub0RhdGFUZXh0Q29sb3IgPSBvcHRzLm5vRGF0YVRleHRDb2xvciB8fCAnIzY5QjVGQydcbiAgICB0aGlzLm5vRGF0YUZvbnRTaXplID0gb3B0cy5ub0RhdGFGb250U2l6ZSB8fCAxMVxuICAgIHRoaXMuZGF0YSA9IG9wdHMuZGF0YVxuXG4gICAgdGhpcy5oaWdoTGlnaHRJbmRleCA9IC0xXG4gICAgdGhpcy5oaWdoTGlnaHRDb2xvciA9ICdyZ2JhKDAsIDAsIDAsIDAuMyknXG4gICAgdGhpcy5pc0hvcml6b250YWwgPSBvcHRzLmlzSG9yaXpvbnRhbCB8fCBmYWxzZVxuXG4gICAgdGhpcy5kcmF3RGF0YUxhYmVsID0gb3B0cy5kcmF3RGF0YUxhYmVsIHx8IGZhbHNlXG4gICAgLy8gcmlnaHQgbGVmdCBib3R0b20gdG9wIG91dHNpZGUgY2VudGVyIG1pZGRsZVxuICAgIHRoaXMuZGF0YUxhYmVsUG9zaXRpb24gPSBvcHRzLmRhdGFMYWJlbFBvc2l0aW9uIHx8ICdvdXRzaWRlJ1xuICAgIHRoaXMuZHJhd0V4dHJhRGF0YUxhYmVsID0gb3B0cy5kcmF3RXh0cmFEYXRhTGFiZWwgfHwgZmFsc2VcbiAgICB0aGlzLmV4dHJhRGF0YWxhYmVsUG9zaXRpb24gPSBvcHRzLmV4dHJhRGF0YWxhYmVsUG9zaXRpb24gfHwgJ291dHNpZGUnXG4gICAgdGhpcy5kYXRhbGFiZWxDYWxsQmFjayA9IG9wdHMuZGF0YWxhYmVsQ2FsbEJhY2sgfHwgZnVuY3Rpb24gKCkgeyByZXR1cm4gJycgfVxuICAgIHRoaXMuZGF0YUxhYmVsRm9udFNpemUgPSBvcHRzLmRhdGFMYWJlbEZvbnRTaXplIHx8IDhcbiAgICB0aGlzLmRhdGFMYWJlbFBhZGRpbmcgPSBvcHRzLmRhdGFMYWJlbFBhZGRpbmcgfHwgNFxuICAgIHRoaXMuZGF0YUxhYmVsQ29sb3IgPSBvcHRzLmRhdGFMYWJlbENvbG9yIHx8ICcjMTExMTExJ1xuXG4gICAgdGhpcy5heGlzRW5hYmxlID0gb3B0cy5heGlzRW5hYmxlIHx8IGZhbHNlXG4gICAgdGhpcy5heGlzRm9udFNpemUgPSBvcHRzLmF4aXNGb250U2l6ZSB8fCAxMFxuICAgIHRoaXMuYXhpc1ZhbHVlUGFkZGluZyA9IG9wdHMuYXhpc1ZhbHVlUGFkZGluZyB8fCA1XG4gICAgdGhpcy5heGlzTGluZVdpZHRoID0gb3B0cy5heGlzTGluZVdpZHRoIHx8IDFcbiAgICB0aGlzLmF4aXNMaW5lQ29sb3IgPSBvcHRzLmF4aXNMaW5lQ29sb3IgfHwgJyNkZGRkZGQnXG4gICAgdGhpcy5heGlzRm9udENvbG9yID0gb3B0cy5heGlzRm9udENvbG9yIHx8ICcjNDQ0NDQ0J1xuXG4gICAgdGhpcy5kYXNoZWRMaW5lV2lkdGggPSBvcHRzLmRhc2hlZExpbmVXaWR0aCB8fCA2XG5cbiAgICB0aGlzLmxlZ2VuZEVuYWJsZSA9IG9wdHMubGVnZW5kRW5hYmxlIHx8IGZhbHNlXG4gICAgdGhpcy5sZWdlbmRGb250U2l6ZSA9IG9wdHMubGVnZW5kRm9udFNpemUgfHwgMTBcbiAgICB0aGlzLmxlZ2VuZFBhZGRpbmcgPSBvcHRzLmxlZ2VuZFBhZGRpbmcgfHwgNVxuICAgIHRoaXMubGVnZW5kVGV4dENvbG9yID0gb3B0cy5sZWdlbmRUZXh0Q29sb3IgfHwgJyMwMDAwMDAnXG5cbiAgICB0aGlzLnRvb2x0aXBDYWxsQmFjayA9IG9wdHMudG9vbHRpcENhbGxCYWNrIHx8IGZ1bmN0aW9uICgpIHsgcmV0dXJuICcnIH1cbiAgICB0aGlzLnRvb2xUaXBCYWNrZ3JvdW5kQ29sb3IgPSBvcHRzLnRvb2xUaXBCYWNrZ3JvdW5kQ29sb3IgfHwgJ3JnYmEoMCwgMCwgMCwgMC42KSdcbiAgICB0aGlzLnRvb2xUaXBQYWRkaW5nID0gb3B0cy50b29sVGlwUGFkZGluZyB8fCAxMFxuICAgIHRoaXMudG9vbFRpcFRleHRQYWRkaW5nID0gb3B0cy50b29sVGlwVGV4dFBhZGRpbmcgfHwgOFxuICAgIHRoaXMudG9vbFRpcEZvbnRTaXplID0gb3B0cy50b29sVGlwRm9udFNpemUgfHwgMTBcbiAgICB0aGlzLnRvb2xUaXBTcGxpdExpbmVXaWR0aCA9IG9wdHMudG9vbFRpcFNwbGl0TGluZVdpZHRoIHx8IDFcbiAgICB0aGlzLnRvb2xUaXBTcGxpdExpbmVDb2xvciA9IG9wdHMudG9vbFRpcFNwbGl0TGluZUNvbG9yIHx8ICcjZmZmZmZmJ1xuXG4gICAgdGhpcy5tdXRlQ2FsbGJhY2sgPSBvcHRzLm11dGVDYWxsYmFjayB8fCBmdW5jdGlvbiAoKSB7IHJldHVybiAnJyB9XG4gICAgdGhpcy5zZXJpZXNTdGF0dXMgPSBvcHRzLnNlcmllc1N0YXR1c1xuXG4gICAgdGhpcy5tYXhWYWx1ZSA9IG9wdHMubWF4VmFsdWVcbiAgICB0aGlzLm1pblZhbHVlID0gb3B0cy5taW5WYWx1ZVxuICAgIHRoaXMubWF4U2Vjb25kYXJ5VmFsdWUgPSBvcHRzLm1heFNlY29uZGFyeVZhbHVlXG4gICAgdGhpcy5taW5TZWNvbmRhcnlWYWx1ZSA9IG9wdHMubWluU2Vjb25kYXJ5VmFsdWVcbiAgICB0aGlzLnNlY29uZGFyeUF4aXNFbmFibGUgPSBvcHRzLnNlY29uZGFyeUF4aXNFbmFibGUgfHwgZmFsc2VcbiAgICB0aGlzLnhBeGlzRGF0YSA9IG9wdHMueEF4aXNEYXRhXG4gICAgdGhpcy54TGFiZWxDb3VudCA9IG9wdHMueExhYmVsQ291bnQgfHwgNVxuXG4gICAgdGhpcy5jaXJjbGVSYWRpdXMgPSBvcHRzLmNpcmNsZVJhZGl1cyB8fCAzXG4gICAgdGhpcy5saW5lV2lkdGggPSBvcHRzLmxpbmVXaWR0aCB8fCAyXG4gICAgdGhpcy5idWxsZXRXaWR0aCA9IG9wdHMuYnVsbGV0V2lkdGggfHwgM1xuXG4gICAgdmFyIGNvbG9ycyA9IFsnIzdjYjVlYycsICcjZjdhMzVjJywgJyM0MzQzNDgnLCAnIzkwZWQ3ZCcsICcjZjE1YzgwJywgJyM4MDg1ZTknLCAnI0U0RDM1NCcsICcjMkI5MDhGJywgJyNGNDVCNUInLCAnIzkxRThFMScsICcjN0NCNUVDJywgJyM0MzQzNDgnXVxuICAgIHRoaXMuY29sb3JzID0gb3B0cy5jb2xvcnMgJiYgb3B0cy5jb2xvcnMuc2xpY2UoKXx8IGNvbG9yc1xuICAgIHRoaXMuZHJhd09yZGVyID0gb3B0cy5kcmF3T3JkZXIgJiYgb3B0cy5kcmF3T3JkZXIuc2xpY2UoKSB8fCBbXVxuICAgIHRoaXMueTFSZWZzID0gb3B0cy55MVJlZnMgfHwgW11cbiAgICB0aGlzLnkyUmVmcyA9IG9wdHMueTJSZWZzIHx8IFtdXG4gICAgdGhpcy55MVRpY2tzID0gb3B0cy55MVRpY2tzIHx8IFtdXG4gICAgdGhpcy55MlRpY2tzID0gb3B0cy55MlRpY2tzIHx8IFtdXG5cbiAgICBpZiAodGhpcy5heGlzRW5hYmxlKSB7XG4gICAgICBpZiAodGhpcy5pc0hvcml6b250YWwpIHtcbiAgICAgICAgLy/orqHnrpd45riy5p+T6auY5bqm56Kw5pKeXG4gICAgICAgIHZhciB4QXhpc0RhdGEgPSB0aGlzLnhBeGlzRGF0YVxuICAgICAgICB2YXIgeEF4aXNTaXplID0geEF4aXNEYXRhLmxlbmd0aFxuICAgICAgICB2YXIgcHJlQmFyV2lkdGggPSB0aGlzLmdldENvbnRlbnRXaWR0aCgpIC8gKHhBeGlzU2l6ZSArIDAuMilcbiAgICAgICAgdmFyIHN0ZXAgPSAxXG4gICAgICAgIGlmIChwcmVCYXJXaWR0aCA8PSB0aGlzLmF4aXNGb250U2l6ZSkge1xuICAgICAgICAgIHN0ZXAgPSBNYXRoLmZsb29yKHRoaXMuYXhpc0ZvbnRTaXplIC8gcHJlQmFyV2lkdGgpICsgKHRoaXMuYXhpc0ZvbnRTaXplICUgcHJlQmFyV2lkdGggPiAwID8gMSA6IDApXG4gICAgICAgIH1cbiAgICAgICAgdmFyIG1heFhBeGlzV2lkdGggPSAwXG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgeEF4aXNTaXplOyBpKyspIHtcbiAgICAgICAgICBpZiAoaSAqIHN0ZXAgPj0geEF4aXNTaXplKSB7XG4gICAgICAgICAgICBicmVha1xuICAgICAgICAgIH1cbiAgICAgICAgICB2YXIgbGFiZWxXaWR0aCA9IHRoaXMuY2FudmFzLm15TWVhc3VyZVRleHQoeEF4aXNEYXRhW2ldLCB0aGlzLmF4aXNGb250U2l6ZSlcbiAgICAgICAgICBpZiAobWF4WEF4aXNXaWR0aCA8IGxhYmVsV2lkdGgpIHtcbiAgICAgICAgICAgIG1heFhBeGlzV2lkdGggPSBsYWJlbFdpZHRoXG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIG1heFhBeGlzV2lkdGggKz0gdGhpcy5heGlzVmFsdWVQYWRkaW5nICogMlxuICAgICAgICBpZiAodGhpcy5jaGFydFBhZGRpbmdMZWZ0IDwgbWF4WEF4aXNXaWR0aCkge1xuICAgICAgICAgIHRoaXMuY2hhcnRQYWRkaW5nTGVmdCA9IG1heFhBeGlzV2lkdGhcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdmFyIG1heFkxV2lkdGggPSAwXG4gICAgICAgIHRoaXMueTFUaWNrcy5tYXAoKGxhYmVsLCBpKSA9PiB7XG4gICAgICAgICAgdmFyIGxhYmVsV2lkdGggPSB0aGlzLmNhbnZhcy5teU1lYXN1cmVUZXh0KGxhYmVsLCB0aGlzLmF4aXNGb250U2l6ZSlcbiAgICAgICAgICBpZiAobWF4WTFXaWR0aCA8IGxhYmVsV2lkdGgpIHtcbiAgICAgICAgICAgIG1heFkxV2lkdGggPSBsYWJlbFdpZHRoXG4gICAgICAgICAgfVxuICAgICAgICB9KVxuICAgICAgICBtYXhZMVdpZHRoICs9IHRoaXMuYXhpc1ZhbHVlUGFkZGluZyAqIDJcbiAgICAgICAgaWYgKHRoaXMuY2hhcnRQYWRkaW5nTGVmdCA8IG1heFkxV2lkdGgpIHtcbiAgICAgICAgICB0aGlzLmNoYXJ0UGFkZGluZ0xlZnQgPSBtYXhZMVdpZHRoXG4gICAgICAgIH1cblxuICAgICAgICB2YXIgbWF4WTJXaWR0aCA9IDBcbiAgICAgICAgdGhpcy55MlRpY2tzLm1hcCgobGFiZWwsIGkpID0+IHtcbiAgICAgICAgICB2YXIgbGFiZWxXaWR0aCA9IHRoaXMuY2FudmFzLm15TWVhc3VyZVRleHQobGFiZWwsIHRoaXMuYXhpc0ZvbnRTaXplKVxuICAgICAgICAgIGlmIChtYXhZMldpZHRoIDwgbGFiZWxXaWR0aCkge1xuICAgICAgICAgICAgbWF4WTJXaWR0aCA9IGxhYmVsV2lkdGhcbiAgICAgICAgICB9XG4gICAgICAgIH0pXG4gICAgICAgIG1heFkyV2lkdGggKz0gdGhpcy5heGlzVmFsdWVQYWRkaW5nICogMlxuICAgICAgICBpZiAodGhpcy5jaGFydFBhZGRpbmdSaWdodCA8IG1heFkyV2lkdGgpIHtcbiAgICAgICAgICB0aGlzLmNoYXJ0UGFkZGluZ1JpZ2h0ID0gbWF4WTJXaWR0aFxuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG4gICAgdGhpcy5kcmF3KClcbiAgfVxuXG4gIGdldENvbG9yKGluZGV4KSB7XG4gICAgaWYgKHRoaXMuaXNIaWRkZW5TZXJpZXMoaW5kZXgpKSB7XG4gICAgICByZXR1cm4gJyNjY2NjY2MnXG4gICAgfVxuICAgIGlmICh0aGlzLmRyYXdPcmRlciAmJiB0aGlzLmRyYXdPcmRlci5sZW5ndGggJiYgaW5kZXggPCB0aGlzLmRyYXdPcmRlci5sZW5ndGgpIHtcbiAgICAgIGluZGV4ID0gdGhpcy5kcmF3T3JkZXJbaW5kZXhdXG4gICAgfVxuICAgIHJldHVybiB0aGlzLmNvbG9yc1tpbmRleCAlIHRoaXMuY29sb3JzLmxlbmd0aF1cbiAgfVxuXG4gIGlzSGlkZGVuU2VyaWVzKGluZGV4KSB7XG4gICAgcmV0dXJuIHRoaXMuc2VyaWVzU3RhdHVzICYmIHRoaXMuc2VyaWVzU3RhdHVzW2luZGV4XVxuICB9XG5cbiAgZ2V0Q3VycmVudERhdGFJbmRleChlKSB7XG4gICAgdmFyIGluZGV4ID0gdGhpcy5jYWxjdWxhdGVDbGlja1Bvc2l0aW9uKGUpXG4gICAgcmV0dXJuIGluZGV4XG4gIH1cblxuICBnZXRDaGFydENvbnRlbnRIZWlnaHQoKSB7XG4gICAgcmV0dXJuIHRoaXMuaGVpZ2h0IC0gdGhpcy5jaGFydFBhZGRpbmdUb3AgLSB0aGlzLmNoYXJ0UGFkZGluZ0JvdHRvbVxuICB9XG5cbiAgZ2V0Q2hhcnRDb250ZW50V2lkdGgoKSB7XG4gICAgcmV0dXJuIHRoaXMud2lkdGggLSB0aGlzLmNoYXJ0UGFkZGluZ0xlZnQgLSB0aGlzLmNoYXJ0UGFkZGluZ1JpZ2h0XG4gIH1cblxuICBnZXRDb250ZW50V2lkdGgoKSB7XG4gICAgcmV0dXJuIHRoaXMuaXNIb3Jpem9udGFsID8gdGhpcy5nZXRDaGFydENvbnRlbnRIZWlnaHQoKSA6IHRoaXMuZ2V0Q2hhcnRDb250ZW50V2lkdGgoKVxuICB9XG5cbiAgZ2V0Q29udGVudEhlaWdodCgpIHtcbiAgICByZXR1cm4gdGhpcy5pc0hvcml6b250YWwgPyB0aGlzLmdldENoYXJ0Q29udGVudFdpZHRoKCkgOiB0aGlzLmdldENoYXJ0Q29udGVudEhlaWdodCgpXG4gIH1cblxuICBjYWxjdWxhdGVDbGlja1Bvc2l0aW9uKGUsIGlzTW92ZSA9IGZhbHNlKSB7XG4gICAgaWYgKHRoaXMubm9EYXRhIHx8IHRoaXMucHJvY2VzcyAhPSAxKSB7XG4gICAgICByZXR1cm4gbnVsbFxuICAgIH1cbiAgICBpZiAoZS50b3VjaGVzICYmIGUudG91Y2hlcy5sZW5ndGgpIHtcbiAgICAgIHZhciB4ID0gZS50b3VjaGVzWzBdLnhcbiAgICAgIHZhciB5ID0gZS50b3VjaGVzWzBdLnlcblxuICAgICAgdmFyIGNoYXJ0UGFkZGluZ0xlZnQgPSB0aGlzLmNoYXJ0UGFkZGluZ0xlZnRcbiAgICAgIHZhciBjaGFydFBhZGRpbmdSaWdodCA9IHRoaXMuY2hhcnRQYWRkaW5nUmlnaHRcbiAgICAgIHZhciBjaGFydFBhZGRpbmdUb3AgPSB0aGlzLmNoYXJ0UGFkZGluZ1RvcFxuICAgICAgdmFyIGNoYXJ0UGFkZGluZ0JvdHRvbSA9IHRoaXMuY2hhcnRQYWRkaW5nQm90dG9tXG4gICAgICB2YXIgbGVnZW5kUGFkZGluZyA9IHRoaXMubGVnZW5kUGFkZGluZ1xuICAgICAgdmFyIGxlZ2VuZEZvbnRTaXplID0gdGhpcy5sZWdlbmRGb250U2l6ZVxuICAgICAgdmFyIGNoYXJ0Q29udGVudEhlaWdodCA9IHRoaXMuZ2V0Q2hhcnRDb250ZW50SGVpZ2h0KClcbiAgICAgIHZhciBjaGFydENvbnRlbnRXaWR0aCA9IHRoaXMuZ2V0Q2hhcnRDb250ZW50V2lkdGgoKVxuICAgICAgdmFyIGNvbnRlbnRXaWR0aCA9IHRoaXMuZ2V0Q29udGVudFdpZHRoKClcblxuICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLnkxUmVmcy5sZW5ndGg7IGkrKykge1xuICAgICAgICB2YXIgcmVmID0gdGhpcy55MVJlZnNbaV1cbiAgICAgICAgaWYgKHggPj0gcmVmLmxlZnQgJiYgeCA8PSByZWYucmlnaHQgJiYgeSA+PSByZWYudG9wICYmIHkgPD0gcmVmLmJvdHRvbSkge1xuICAgICAgICAgIGlmICh0aGlzLmhpZ2hMaWdodFggPT0gcmVmLnJpZ2h0ICYmIHRoaXMuaGlnaExpZ2h0WSA9PSByZWYuY2VudGVyWVxuICAgICAgICAgICAgJiYgdGhpcy5oaWdoTGlnaHREYXRhICYmICFpc01vdmUpIHtcbiAgICAgICAgICAgIC8vc2FtZSBsYWJlbFxuICAgICAgICAgICAgdGhpcy5oaWdoTGlnaHRJbmRleCA9IC0xXG4gICAgICAgICAgICB0aGlzLmhpZ2hMaWdodERhdGEgPSBudWxsXG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMuaGlnaExpZ2h0RGF0YSA9IHtcbiAgICAgICAgICAgICAgdGl0bGU6IHJlZi5uYW1lLFxuICAgICAgICAgICAgICBkYXRhOiBbYCR7cmVmLmxhYmVsfWBdXG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB0aGlzLmhpZ2hMaWdodEluZGV4ID0gLTFcbiAgICAgICAgICAgIHRoaXMuaGlnaExpZ2h0WCA9IHJlZi5yaWdodFxuICAgICAgICAgICAgdGhpcy5oaWdoTGlnaHRZID0gcmVmLmNlbnRlcllcbiAgICAgICAgICAgIHRoaXMuaGlnaExpZ2h0UmFkaXVzID0gMFxuICAgICAgICAgIH1cbiAgICAgICAgICB0aGlzLmRyYXcoZmFsc2UpXG4gICAgICAgICAgcmV0dXJuIG51bGxcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMueTJSZWZzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIHZhciByZWYgPSB0aGlzLnkyUmVmc1tpXVxuICAgICAgICBpZiAoeCA+PSByZWYubGVmdCAmJiB4IDw9IHJlZi5yaWdodCAmJiB5ID49IHJlZi50b3AgJiYgeSA8PSByZWYuYm90dG9tKSB7XG4gICAgICAgICAgaWYgKCh0aGlzLmlzSG9yaXpvbnRhbCA/IHRoaXMuaGlnaExpZ2h0WCA9PSByZWYuY2VudGVyWCAmJiB0aGlzLmhpZ2hMaWdodFkgPT0gcmVmLmJvdHRvbSA6IHRoaXMuaGlnaExpZ2h0WCA9PSByZWYubGVmdCAmJiB0aGlzLmhpZ2hMaWdodFkgPT0gcmVmLmNlbnRlclkpXG4gICAgICAgICAgICAmJiB0aGlzLmhpZ2hMaWdodERhdGEgJiYgIWlzTW92ZSkge1xuICAgICAgICAgICAgLy9zYW1lIGxhYmVsXG4gICAgICAgICAgICB0aGlzLmhpZ2hMaWdodEluZGV4ID0gLTFcbiAgICAgICAgICAgIHRoaXMuaGlnaExpZ2h0RGF0YSA9IG51bGxcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5oaWdoTGlnaHREYXRhID0ge1xuICAgICAgICAgICAgICB0aXRsZTogcmVmLm5hbWUsXG4gICAgICAgICAgICAgIGRhdGE6IFtgJHtyZWYubGFiZWx9YF1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHRoaXMuaGlnaExpZ2h0SW5kZXggPSAtMVxuICAgICAgICAgICAgaWYgKHRoaXMuaXNIb3Jpem9udGFsKSB7XG4gICAgICAgICAgICAgIHRoaXMuaGlnaExpZ2h0WCA9IHJlZi5jZW50ZXJYXG4gICAgICAgICAgICAgIHRoaXMuaGlnaExpZ2h0WSA9IHJlZi5ib3R0b21cbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgIHRoaXMuaGlnaExpZ2h0WCA9IHJlZi5sZWZ0XG4gICAgICAgICAgICAgIHRoaXMuaGlnaExpZ2h0WSA9IHJlZi5jZW50ZXJZXG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB0aGlzLmhpZ2hMaWdodFJhZGl1cyA9IDBcbiAgICAgICAgICB9XG4gICAgICAgICAgdGhpcy5kcmF3KGZhbHNlKVxuICAgICAgICAgIHJldHVybiBudWxsXG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgaWYgKHggPj0gY2hhcnRQYWRkaW5nTGVmdCAmJiB4IDw9IHRoaXMud2lkdGggLSBjaGFydFBhZGRpbmdSaWdodCAmJiB5ID49IGNoYXJ0UGFkZGluZ1RvcCAmJiB5IDw9IHRoaXMuaGVpZ2h0IC0gY2hhcnRQYWRkaW5nQm90dG9tKSB7XG4gICAgICAgIHZhciBzaXplID0gdGhpcy54QXhpc0RhdGEubGVuZ3RoXG4gICAgICAgIHZhciBwcmVCYXJXaWR0aCA9IGNvbnRlbnRXaWR0aCAvIChzaXplICsgMC4yKVxuICAgICAgICB2YXIgaGlnaExpZ2h0UG9zaXRpb24gPSAtMVxuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHNpemU7IGkrKykge1xuICAgICAgICAgIGlmICh0aGlzLmlzSG9yaXpvbnRhbCkge1xuICAgICAgICAgICAgdmFyIHN0YXJ0WSA9IGNoYXJ0UGFkZGluZ1RvcCArIHByZUJhcldpZHRoICogaVxuICAgICAgICAgICAgdmFyIGVuZFkgPSBzdGFydFkgKyBwcmVCYXJXaWR0aFxuXG4gICAgICAgICAgICBpZiAoaSA9PSAwICYmIHkgPD0gZW5kWVxuICAgICAgICAgICAgICB8fCB5IDw9IGVuZFkgJiYgeSA+PSBzdGFydFlcbiAgICAgICAgICAgICAgfHwgaSA9PSAoc2l6ZSAtIDEpICYmIHkgPj0gc3RhcnRZKSB7XG4gICAgICAgICAgICAgIGlmIChoaWdoTGlnaHRQb3NpdGlvbiA9PSBpICYmICFpc01vdmUpIHtcbiAgICAgICAgICAgICAgICBoaWdoTGlnaHRQb3NpdGlvbiA9IC0xXG4gICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgaGlnaExpZ2h0UG9zaXRpb24gPSBpXG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgYnJlYWtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdmFyIHN0YXJ0WCA9IGNoYXJ0UGFkZGluZ0xlZnQgKyBwcmVCYXJXaWR0aCAqIGlcbiAgICAgICAgICAgIHZhciBlbmRYID0gc3RhcnRYICsgcHJlQmFyV2lkdGg7XG5cbiAgICAgICAgICAgIGlmIChpID09IDAgJiYgeCA8PSBlbmRYXG4gICAgICAgICAgICAgIHx8IHggPD0gZW5kWCAmJiB4ID49IHN0YXJ0WFxuICAgICAgICAgICAgICB8fCBpID09IChzaXplIC0gMSkgJiYgeCA+PSBzdGFydFgpIHtcbiAgICAgICAgICAgICAgaWYgKGhpZ2hMaWdodFBvc2l0aW9uID09IGkgJiYgIWlzTW92ZSkge1xuICAgICAgICAgICAgICAgIGhpZ2hMaWdodFBvc2l0aW9uID0gLTFcbiAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBoaWdoTGlnaHRQb3NpdGlvbiA9IGlcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICBicmVha1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gaGlnaExpZ2h0UG9zaXRpb25cbiAgICAgIH1cblxuICAgICAgaWYgKGlzTW92ZSkge1xuICAgICAgICByZXR1cm4gLTFcbiAgICAgIH1cblxuICAgICAgaWYgKHggPiBjaGFydFBhZGRpbmdMZWZ0ICYmIHggPCB0aGlzLndpZHRoIC0gY2hhcnRQYWRkaW5nUmlnaHQgJiYgeSA+IGNoYXJ0Q29udGVudEhlaWdodCAtIGxlZ2VuZEZvbnRTaXplICYmIHkgPCB0aGlzLmhlaWdodCkge1xuICAgICAgICB2YXIgbGVnZW5kV2lkdGggPSB0aGlzLmxlZ2VuZFdpZHRoXG4gICAgICAgIHZhciBpc011bHRpTGluZSA9IHRoaXMuaXNNdWx0aUxpbmVcblxuICAgICAgICBpZiAoIWlzTXVsdGlMaW5lKSB7XG4gICAgICAgICAgdmFyIHN0YXJ0WCA9ICh0aGlzLndpZHRoIC0gbGVnZW5kV2lkdGgpIC8gMlxuXG4gICAgICAgICAgaWYgKHggPj0gc3RhcnRYICYmIHggPD0gdGhpcy53aWR0aCAtIHN0YXJ0WCkge1xuICAgICAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLmxlZ2VuZExpc3QubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgICAgdmFyIHRleHRXaWR0aCA9IHRoaXMuY2FudmFzLm15TWVhc3VyZVRleHQodGhpcy5sZWdlbmRMaXN0W2ldLCBsZWdlbmRGb250U2l6ZSlcbiAgICAgICAgICAgICAgaWYgKHggPCBzdGFydFggKyB0ZXh0V2lkdGggKyBsZWdlbmRGb250U2l6ZSAqIDIuMikge1xuICAgICAgICAgICAgICAgIHZhciBjaGFydEluZm8gPSB0aGlzLm11dGVDYWxsYmFjayh0aGlzLmRyYXdPcmRlcltpXSlcbiAgICAgICAgICAgICAgICB0aGlzLmRhdGEgPSBjaGFydEluZm8uZGF0YVxuICAgICAgICAgICAgICAgIHRoaXMuc2VyaWVzU3RhdHVzID0gY2hhcnRJbmZvLnNlcmllc1N0YXR1c1xuICAgICAgICAgICAgICAgIHRoaXMuZHJhdyh0cnVlLCBmYWxzZSlcbiAgICAgICAgICAgICAgICBicmVha1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIHN0YXJ0WCArPSBsZWdlbmRGb250U2l6ZSAqIDIuMiArIHRleHRXaWR0aFxuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICB2YXIgc3RhcnRYID0gY2hhcnRQYWRkaW5nTGVmdFxuXG4gICAgICAgICAgaWYgKHN0YXJ0WCArIGxlZ2VuZEZvbnRTaXplICogMS4yICogdGhpcy5sZWdlbmRMaXN0Lmxlbmd0aCA8PSB0aGlzLndpZHRoKSB7XG4gICAgICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMubGVnZW5kTGlzdC5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgICBpZiAoeCA8IHN0YXJ0WCArIGxlZ2VuZEZvbnRTaXplICogMS4yKSB7XG4gICAgICAgICAgICAgICAgdmFyIGNoYXJ0SW5mbyA9IHRoaXMubXV0ZUNhbGxiYWNrKHRoaXMuZHJhd09yZGVyW2ldKVxuICAgICAgICAgICAgICAgIHRoaXMuZGF0YSA9IGNoYXJ0SW5mby5kYXRhXG4gICAgICAgICAgICAgICAgdGhpcy5zZXJpZXNTdGF0dXMgPSBjaGFydEluZm8uc2VyaWVzU3RhdHVzXG4gICAgICAgICAgICAgICAgdGhpcy5kcmF3KHRydWUsIGZhbHNlKVxuICAgICAgICAgICAgICAgIGJyZWFrXG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgc3RhcnRYICs9IGxlZ2VuZEZvbnRTaXplICogMS4yXG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIHJldHVybiAtMVxuICAgIH1cbiAgICByZXR1cm4gLTFcbiAgfVxuXG4gIGdldEN1cnJlbnRIaWdoTGlnaHRJbmRleCgpIHtcbiAgICByZXR1cm4gdGhpcy5oaWdoTGlnaHRJbmRleFxuICB9XG5cbiAgc2hvd1Rvb2xUaXAoZSwgaXNNb3ZlID0gZmFsc2UpIHtcbiAgICB2YXIgaW5kZXggPSB0aGlzLmNhbGN1bGF0ZUNsaWNrUG9zaXRpb24oZSwgaXNNb3ZlKVxuICAgIGlmKGluZGV4ID09IG51bGwpIHtcbiAgICAgIHJldHVyblxuICAgIH1cbiAgICBpZiAodGhpcy5oaWdoTGlnaHRJbmRleCA9PSBpbmRleCAmJiBpbmRleCA9PSAtMSkge1xuICAgICAgaWYgKHRoaXMuaGlnaExpZ2h0RGF0YSkge1xuICAgICAgICB0aGlzLmhpZ2hMaWdodERhdGEgPSBudWxsXG4gICAgICAgIHRoaXMuZHJhdyhmYWxzZSlcbiAgICAgIH1cbiAgICAgIHJldHVyblxuICAgIH1cbiAgICBpZiAodGhpcy5oaWdoTGlnaHRJbmRleCA9PSBpbmRleCAmJiAhaXNNb3ZlKSB7XG4gICAgICB0aGlzLmhpZ2hMaWdodEluZGV4ID0gLTFcbiAgICAgIHRoaXMuaGlnaExpZ2h0RGF0YSA9IG51bGxcbiAgICB9IGVsc2UgaWYgKHRoaXMuaGlnaExpZ2h0SW5kZXggPT0gaW5kZXggJiYgdGhpcy5oaWdoTGlnaHRZICYmIE1hdGguYWJzKHRoaXMuaGlnaExpZ2h0WSAtIGUudG91Y2hlc1swXS55KSA8IDEwKSB7XG4gICAgICBjb25zb2xlLmxvZygn56e75Yqo6Ze06Led5bCP5LqOMTAsIOS4jei/m+ihjOa4suafkycpXG4gICAgICByZXR1cm5cbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5oaWdoTGlnaHRJbmRleCA9IGluZGV4XG5cbiAgICAgIGlmIChpbmRleCAhPSAtMSkge1xuICAgICAgICB2YXIgaGlnaExpZ2h0RGF0YSA9IHRoaXMudG9vbHRpcENhbGxCYWNrKGluZGV4KVxuICAgICAgICB0aGlzLmhpZ2hMaWdodERhdGEgPSBoaWdoTGlnaHREYXRhXG4gICAgICAgIHRoaXMuaGlnaExpZ2h0WSA9IGUudG91Y2hlc1swXS55XG4gICAgICAgIHRoaXMuaGlnaExpZ2h0WCA9IGUudG91Y2hlc1swXS54XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLmhpZ2hMaWdodERhdGEgPSBudWxsXG4gICAgICB9XG4gICAgfVxuICAgIHRoaXMuZHJhdyhmYWxzZSlcbiAgfVxuXG4gIGhpZGRlbkhpZ2hMaWdodCgpIHtcbiAgICBpZiAodGhpcy5oaWdoTGlnaHRJbmRleCA9PSAtMSkge1xuICAgICAgcmV0dXJuXG4gICAgfVxuICAgIHRoaXMuaGlnaExpZ2h0SW5kZXggPSAtMVxuICAgIHRoaXMuZHJhdyhmYWxzZSlcbiAgfVxuXG4gIGRyYXcoaXNBbmltYXRpb24gPSB0cnVlLCBhbmltYXRpb25XaXRoTGVnZW5kID0gdHJ1ZSkge1xuICAgIHRoaXMuaXNEcmF3RmluaXNoID0gZmFsc2VcbiAgICB2YXIgY2FudmFzID0gdGhpcy5jYW52YXNcblxuICAgIGlmICh0aGlzLm5vRGF0YSkge1xuICAgICAgdGhpcy5kcmF3Tm9EYXRhKGNhbnZhcylcbiAgICAgIGNhbnZhcy5kcmF3KClcbiAgICAgIHRoaXMuaXNEcmF3RmluaXNoID0gdHJ1ZVxuICAgIH0gZWxzZSB7XG4gICAgICB2YXIgdGhhdCA9IHRoaXNcbiAgICAgIHZhciBkdXJhdGlvbiA9IGlzQW5pbWF0aW9uICYmIHRoaXMuZHJhd1dpdGhBbmltYXRpb24gPyAxMDAwIDogMFxuICAgICAgdmFyIGFuaW1hdGlvbiA9IG5ldyBBbmltYXRpb24oe1xuICAgICAgICB0aW1pbmc6ICdsaW5lYXInLFxuICAgICAgICBkdXJhdGlvbjogZHVyYXRpb24sXG4gICAgICAgIG9uUHJvY2VzczogZnVuY3Rpb24gKHByb2Nlc3MpIHtcbiAgICAgICAgICAvLyBjb25zb2xlLnRpbWUoJ21peCBkcmF3JylcbiAgICAgICAgICBjYW52YXMuY2xlYXJSZWN0ICYmIGNhbnZhcy5jbGVhclJlY3QoMCwgMCwgdGhhdC53aWR0aCwgdGhhdC5oZWlnaHQpXG4gICAgICAgICAgdGhhdC5wcm9jZXNzID0gcHJvY2Vzc1xuICAgICAgICAgIHRoYXQuZGF0YUxhYmVscyA9IFtdXG5cbiAgICAgICAgICBpZiAodGhhdC5heGlzRW5hYmxlKSB7XG4gICAgICAgICAgICB0aGF0LmRyYXdBeGlzKGNhbnZhcylcbiAgICAgICAgICB9XG5cbiAgICAgICAgICB0aGF0LmRyYXdMYXllckRhdGEoY2FudmFzKVxuICAgICAgICAgIHRoYXQuZHJhd1JlZnMoY2FudmFzKVxuICAgICAgICAgIGlmICgodGhhdC5kcmF3RGF0YUxhYmVsIHx8IHRoYXQuZHJhd0V4dHJhRGF0YUxhYmVsKSAmJiBwcm9jZXNzID09IDEpIHtcbiAgICAgICAgICAgIHRoYXQuZHJhd0RhdGFMYWJlbExheWVyKGNhbnZhcylcbiAgICAgICAgICB9XG4gICAgICAgICAgdGhhdC5kcmF3VG9vbFRpcChjYW52YXMpXG5cbiAgICAgICAgICBpZiAodGhhdC5sZWdlbmRFbmFibGUpIHtcbiAgICAgICAgICAgIGlmICghYW5pbWF0aW9uV2l0aExlZ2VuZCkge1xuICAgICAgICAgICAgICB0aGF0LmRyYXdMZWdlbmQoY2FudmFzKVxuICAgICAgICAgICAgfSBlbHNlIGlmKHByb2Nlc3MgPT0gMSkge1xuICAgICAgICAgICAgICB0aGF0LmRyYXdMZWdlbmQoY2FudmFzKVxuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgICBjYW52YXMuZHJhdygpXG4gICAgICAgICAgLy8gY29uc29sZS50aW1lRW5kKCdtaXggZHJhdycpXG4gICAgICAgIH0sXG4gICAgICAgIG9uQW5pbWF0aW9uRmluaXNoOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgdGhhdC5pc0RyYXdGaW5pc2ggPSB0cnVlXG4gICAgICAgIH1cbiAgICAgIH0pXG4gICAgfVxuICB9XG5cbiAgZHJhd1Rvb2xUaXAoY2FudmFzKSB7XG4gICAgaWYgKCF0aGlzLmhpZ2hMaWdodERhdGEpIHtcbiAgICAgIHJldHVyblxuICAgIH1cbiAgICB2YXIgY2hhcnRQYWRkaW5nTGVmdCA9IHRoaXMuY2hhcnRQYWRkaW5nTGVmdFxuICAgIHZhciBjaGFydFBhZGRpbmdUb3AgPSB0aGlzLmNoYXJ0UGFkZGluZ1RvcFxuICAgIHZhciBpc0hvcml6b250YWwgPSB0aGlzLmlzSG9yaXpvbnRhbFxuICAgIHZhciBjaGFydENvbnRlbnRIZWlnaHQgPSB0aGlzLmdldENoYXJ0Q29udGVudEhlaWdodCgpXG4gICAgdmFyIGNvbnRlbnRXaWR0aCA9IHRoaXMuZ2V0Q29udGVudFdpZHRoKClcbiAgICB2YXIgcHJlSXRlbVdpZHRoID0gY29udGVudFdpZHRoIC8gKHRoaXMueEF4aXNEYXRhLmxlbmd0aCArIDAuMilcbiAgICB2YXIgeCwgeVxuICAgIGlmICh0aGlzLmhpZ2hMaWdodEluZGV4ID09IC0xKSB7XG4gICAgICB4ID0gdGhpcy5oaWdoTGlnaHRYXG4gICAgICB5ID0gdGhpcy5oaWdoTGlnaHRZXG4gICAgfSBlbHNlIHtcbiAgICAgIGlmIChpc0hvcml6b250YWwpIHtcbiAgICAgICAgeCA9IHRoaXMuaGlnaExpZ2h0WFxuICAgICAgICB5ID0gY2hhcnRQYWRkaW5nVG9wICsgcHJlSXRlbVdpZHRoICogKHRoaXMuaGlnaExpZ2h0SW5kZXggKyAwLjYpXG4gICAgICB9IGVsc2Uge1xuICAgICAgICB4ID0gY2hhcnRQYWRkaW5nTGVmdCArIHByZUl0ZW1XaWR0aCAqICh0aGlzLmhpZ2hMaWdodEluZGV4ICsgMC42KVxuICAgICAgICB5ID0gdGhpcy5oaWdoTGlnaHRZXG4gICAgICB9XG4gICAgfVxuXG4gICAgdmFyIHRvb2xUaXBCYWNrZ3JvdW5kQ29sb3IgPSB0aGlzLnRvb2xUaXBCYWNrZ3JvdW5kQ29sb3JcbiAgICB2YXIgdG9vbFRpcFBhZGRpbmcgPSB0aGlzLnRvb2xUaXBQYWRkaW5nXG4gICAgdmFyIHRvb2xUaXBUZXh0UGFkZGluZyA9IHRoaXMudG9vbFRpcFRleHRQYWRkaW5nXG4gICAgdmFyIHRvb2xUaXBGb250U2l6ZSA9IHRoaXMudG9vbFRpcEZvbnRTaXplXG4gICAgdmFyIHRvb2xUaXBTcGxpdExpbmVXaWR0aCA9IHRoaXMudG9vbFRpcFNwbGl0TGluZVdpZHRoXG4gICAgdmFyIHRvb2xUaXBTcGxpdExpbmVDb2xvciA9IHRoaXMudG9vbFRpcFNwbGl0TGluZUNvbG9yXG5cbiAgICB2YXIgdG9vbFRpcFdpZHRoID0gdG9vbFRpcFBhZGRpbmcgKiAyXG4gICAgdmFyIHRvb2xUaXBIZWlnaHQgPSB0b29sVGlwUGFkZGluZyAqIDJcblxuICAgIHZhciBoaWdoTGlnaHREYXRhID0gdGhpcy5oaWdoTGlnaHREYXRhXG5cbiAgICAvL3RpdGxlXG4gICAgdmFyIG1heFRpcExpbmVXaWR0aCA9IGNhbnZhcy5teU1lYXN1cmVUZXh0KGhpZ2hMaWdodERhdGEudGl0bGUsIHRvb2xUaXBGb250U2l6ZSlcbiAgICB0b29sVGlwSGVpZ2h0ICs9IHRvb2xUaXBGb250U2l6ZSArIHRvb2xUaXBTcGxpdExpbmVXaWR0aCArIHRvb2xUaXBUZXh0UGFkZGluZ1xuICAgIGhpZ2hMaWdodERhdGEuZGF0YS5tYXAoKHRleHQsIGluZGV4KSA9PiB7XG4gICAgICB0b29sVGlwSGVpZ2h0ICs9IHRvb2xUaXBGb250U2l6ZSArIHRvb2xUaXBUZXh0UGFkZGluZ1xuXG4gICAgICB2YXIgdGV4dFdpZHRoID0gY2FudmFzLm15TWVhc3VyZVRleHQodGV4dCwgdG9vbFRpcEZvbnRTaXplKVxuICAgICAgaWYgKG1heFRpcExpbmVXaWR0aCA8IHRleHRXaWR0aCkge1xuICAgICAgICBtYXhUaXBMaW5lV2lkdGggPSB0ZXh0V2lkdGhcbiAgICAgIH1cbiAgICB9KVxuICAgIHRvb2xUaXBXaWR0aCArPSBtYXhUaXBMaW5lV2lkdGhcblxuICAgIHZhciBzdGFydFhcbiAgICBpZiAoaXNIb3Jpem9udGFsKSB7XG4gICAgICBpZiAodGhpcy5oaWdoTGlnaHRJbmRleCA9PSAtMSkge1xuICAgICAgICBpZiAoeCA+IHRoaXMud2lkdGggLyAyKSB7XG4gICAgICAgICAgc3RhcnRYID0geCAtIHRvb2xUaXBXaWR0aFxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHN0YXJ0WCA9IHhcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgaWYgKHggPiB0aGlzLndpZHRoIC8gMikge1xuICAgICAgICAgIHN0YXJ0WCA9IHggLSB0b29sVGlwV2lkdGggLSAyMFxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHN0YXJ0WCA9IHggKyAyMFxuICAgICAgICB9XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIGlmICh0aGlzLmhpZ2hMaWdodEluZGV4ID09IC0xKSB7XG4gICAgICAgIGlmICh4ID4gdGhpcy53aWR0aCAvIDIpIHtcbiAgICAgICAgICBzdGFydFggPSB4IC0gdG9vbFRpcFdpZHRoXG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgc3RhcnRYID0geFxuICAgICAgICB9XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBpZiAoeCA+IHRoaXMud2lkdGggLyAyKSB7XG4gICAgICAgICAgc3RhcnRYID0geCAtIHByZUl0ZW1XaWR0aCAqIDAuNSAtIHRvb2xUaXBXaWR0aFxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHN0YXJ0WCA9IHggKyBwcmVJdGVtV2lkdGggKiAwLjVcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgICB2YXIgc3RhcnRZID0geSAtIHRvb2xUaXBIZWlnaHQgLyAyXG4gICAgaWYgKHN0YXJ0WSA8IGNoYXJ0UGFkZGluZ1RvcCkge1xuICAgICAgc3RhcnRZID0gY2hhcnRQYWRkaW5nVG9wXG4gICAgfVxuICAgIGlmIChzdGFydFkgKyB0b29sVGlwSGVpZ2h0ID4gY2hhcnRDb250ZW50SGVpZ2h0ICsgY2hhcnRQYWRkaW5nVG9wKSB7XG4gICAgICBzdGFydFkgPSBjaGFydENvbnRlbnRIZWlnaHQgKyBjaGFydFBhZGRpbmdUb3AgLSB0b29sVGlwSGVpZ2h0XG4gICAgfVxuXG4gICAgY2FudmFzLnNldEZpbGxTdHlsZSh0b29sVGlwQmFja2dyb3VuZENvbG9yKVxuICAgIGNhbnZhcy5iZWdpblBhdGgoKVxuICAgIGNhbnZhcy5maWxsUmVjdChzdGFydFgsIHN0YXJ0WSwgdG9vbFRpcFdpZHRoLCB0b29sVGlwSGVpZ2h0KVxuICAgIGNhbnZhcy5jbG9zZVBhdGgoKVxuXG4gICAgY2FudmFzLnNldEZpbGxTdHlsZSh0b29sVGlwU3BsaXRMaW5lQ29sb3IpXG4gICAgY2FudmFzLnNldFN0cm9rZVN0eWxlKHRvb2xUaXBTcGxpdExpbmVDb2xvcilcbiAgICBjYW52YXMuc2V0TGluZVdpZHRoKHRvb2xUaXBTcGxpdExpbmVXaWR0aClcbiAgICBjYW52YXMuc2V0Rm9udFNpemUodG9vbFRpcEZvbnRTaXplKVxuXG4gICAgdmFyIGRyYXdYID0gc3RhcnRYICsgdG9vbFRpcFBhZGRpbmdcbiAgICB2YXIgZHJhd1kgPSBzdGFydFkgKyB0b29sVGlwUGFkZGluZyArIHRvb2xUaXBGb250U2l6ZVxuXG4gICAgY2FudmFzLmZpbGxUZXh0KGhpZ2hMaWdodERhdGEudGl0bGUsIGRyYXdYLCBkcmF3WSlcbiAgICBkcmF3WSArPSB0b29sVGlwVGV4dFBhZGRpbmcgKyB0b29sVGlwU3BsaXRMaW5lV2lkdGggLyAyXG4gICAgY2FudmFzLmJlZ2luUGF0aCgpXG4gICAgY2FudmFzLm1vdmVUbyhkcmF3WCAtIHRvb2xUaXBQYWRkaW5nICogMC4yNSwgZHJhd1kpXG4gICAgY2FudmFzLmxpbmVUbyhkcmF3WCArIHRvb2xUaXBXaWR0aCAtIHRvb2xUaXBQYWRkaW5nICogMS43NSwgZHJhd1kpXG4gICAgY2FudmFzLnN0cm9rZSgpXG4gICAgY2FudmFzLmNsb3NlUGF0aCgpXG5cbiAgICBoaWdoTGlnaHREYXRhLmRhdGEubWFwKCh0ZXh0LCBpbmRleCkgPT4ge1xuICAgICAgZHJhd1kgKz0gdG9vbFRpcFRleHRQYWRkaW5nICsgdG9vbFRpcEZvbnRTaXplXG4gICAgICBjYW52YXMuZmlsbFRleHQodGV4dCwgZHJhd1gsIGRyYXdZKVxuICAgIH0pXG4gIH1cblxuICBhZGREYXRhTGFiZWwobGFiZWwsIHgsIHksIGxhYmVsV2lkdGgpIHtcbiAgICBpZiAoeCArIGxhYmVsV2lkdGggPiB0aGlzLndpZHRoIC0gdGhpcy5jaGFydFBhZGRpbmdSaWdodCkge1xuICAgICAgeCA9IHRoaXMud2lkdGggLSB0aGlzLmNoYXJ0UGFkZGluZ1JpZ2h0IC0gbGFiZWxXaWR0aFxuICAgIH1cbiAgICBpZiAoeCA8IHRoaXMuY2hhcnRQYWRkaW5nTGVmdCkge1xuICAgICAgeCA9IHRoaXMuY2hhcnRQYWRkaW5nTGVmdFxuICAgIH1cbiAgICBpZiAoeSA+IHRoaXMuaGVpZ2h0IC0gdGhpcy5jaGFydFBhZGRpbmdCb3R0b20pIHtcbiAgICAgIHkgPSB0aGlzLmhlaWdodCAtIHRoaXMuY2hhcnRQYWRkaW5nQm90dG9tXG4gICAgfVxuICAgIGlmICh5IC0gdGhpcy5kYXRhTGFiZWxGb250U2l6ZSA8IHRoaXMuY2hhcnRQYWRkaW5nVG9wKSB7XG4gICAgICB5ID0gdGhpcy5jaGFydFBhZGRpbmdUb3AgKyB0aGlzLmRhdGFMYWJlbEZvbnRTaXplXG4gICAgfVxuICAgIHZhciBsZWZ0ICA9IHhcbiAgICB2YXIgdG9wICAgPSB5IC0gdGhpcy5kYXRhTGFiZWxGb250U2l6ZVxuICAgIHZhciByaWdodCA9IHggKyBsYWJlbFdpZHRoXG4gICAgdmFyIGJvdHRvbT0geVxuXG4gICAgdmFyIGN1cnJEYXRhTGFiZWwgPSB7XG4gICAgICBsYWJlbDogbGFiZWwsXG4gICAgICBsZWZ0OiBsZWZ0LFxuICAgICAgdG9wOiB0b3AsXG4gICAgICByaWdodDogcmlnaHQsXG4gICAgICBib3R0b206IGJvdHRvbVxuICAgIH1cblxuICAgIHZhciBpc0NyYXNoID0gZmFsc2VcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMuZGF0YUxhYmVscy5sZW5ndGg7IGkrKykge1xuICAgICAgdmFyIGRhdGFMYWJlbCA9IHRoaXMuZGF0YUxhYmVsc1tpXVxuICAgICAgaWYgKHRoaXMuaXNSZWN0Q3Jhc2goY3VyckRhdGFMYWJlbCwgZGF0YUxhYmVsKSkge1xuICAgICAgICBpc0NyYXNoID0gdHJ1ZVxuICAgICAgICBicmVha1xuICAgICAgfVxuICAgIH1cbiAgICBpZighaXNDcmFzaCkge1xuICAgICAgdGhpcy5kYXRhTGFiZWxzLnB1c2goY3VyckRhdGFMYWJlbClcbiAgICB9XG4gIH1cblxuICBpc1JlY3RDcmFzaChhLCBiKSB7XG4gICAgdmFyIGxlZnQgPSBNYXRoLm1heChhLmxlZnQsIGIubGVmdClcbiAgICB2YXIgdG9wID0gTWF0aC5tYXgoYS50b3AsIGIudG9wKVxuICAgIHZhciByaWdodCA9IE1hdGgubWluKGEucmlnaHQsIGIucmlnaHQpXG4gICAgdmFyIGJvdHRvbSA9IE1hdGgubWluKGEuYm90dG9tLCBiLmJvdHRvbSlcblxuICAgIHJldHVybiBsZWZ0IDw9IHJpZ2h0ICYmIHRvcCA8PSBib3R0b21cbiAgfVxuXG4gIGRyYXdEYXRhTGFiZWxMYXllcihjYW52YXMpIHtcbiAgICBjYW52YXMuc2V0Rm9udFNpemUodGhpcy5kYXRhTGFiZWxGb250U2l6ZSlcbiAgICBjYW52YXMuc2V0RmlsbFN0eWxlKHRoaXMuZGF0YUxhYmVsQ29sb3IpXG5cbiAgICB0aGlzLmRhdGFMYWJlbHMubWFwKChkYXRhTGFiZWwsIGluZGV4KSA9PiB7XG4gICAgICBjYW52YXMuZmlsbFRleHQoZGF0YUxhYmVsLmxhYmVsLCBkYXRhTGFiZWwubGVmdCwgZGF0YUxhYmVsLmJvdHRvbSlcbiAgICB9KVxuICB9XG5cbiAgZHJhd0xheWVyRGF0YShjYW52YXMpIHtcbiAgICB2YXIgdGhhdCA9IHRoaXNcbiAgICB2YXIgY29sb3JQb3NpdGlvbiA9IDBcbiAgICB0aGlzLmRhdGEubWFwKChsYXllciwgaW5kZXgpID0+IHtcbiAgICAgIHZhciBwcmVHcm91cFNpemUgPSAobGF5ZXIuZGF0YSA9PSB1bmRlZmluZWQgfHwgbGF5ZXIuZGF0YS5sZW5ndGggPT0gMCB8fCBsYXllci5kYXRhWzBdLnN1YkRhdGEgPT0gdW5kZWZpbmVkKSA/IDEgOiBsYXllci5kYXRhWzBdLnN1YkRhdGEubGVuZ3RoXG4gICAgICBzd2l0Y2gobGF5ZXIudHlwZSkge1xuICAgICAgICBjYXNlICdncm91cCc6XG4gICAgICAgICAgdGhhdC5kcmF3R3JvdXAoY2FudmFzLCBsYXllciwgY29sb3JQb3NpdGlvbilcbiAgICAgICAgICBicmVha1xuICAgICAgICBjYXNlICdsaW5lJzpcbiAgICAgICAgICB0aGF0LmRyYXdMaW5lKGNhbnZhcywgbGF5ZXIsIGNvbG9yUG9zaXRpb24pXG4gICAgICAgICAgYnJlYWtcbiAgICAgICAgY2FzZSAncG9pbnQnOlxuICAgICAgICAgIHRoYXQuZHJhd0xpbmUoY2FudmFzLCBsYXllciwgY29sb3JQb3NpdGlvbiwgZmFsc2UpXG4gICAgICAgICAgYnJlYWtcbiAgICAgICAgY2FzZSAnc3RhY2snOlxuICAgICAgICAgIHRoYXQuZHJhd1N0YWNrZWQoY2FudmFzLCBsYXllciwgY29sb3JQb3NpdGlvbilcbiAgICAgICAgICBicmVha1xuICAgICAgICBjYXNlICdwZXJjZW50JzpcbiAgICAgICAgICB0aGF0LmRyYXdQZXJjZW50KGNhbnZhcywgbGF5ZXIsIGNvbG9yUG9zaXRpb24pXG4gICAgICAgICAgYnJlYWtcbiAgICAgICAgY2FzZSAnYnVsbGV0JzpcbiAgICAgICAgICB0aGF0LmRyYXdCdWxsZXQoY2FudmFzLCBsYXllciwgY29sb3JQb3NpdGlvbilcbiAgICAgICAgICBwcmVHcm91cFNpemUgPSAyXG4gICAgICAgICAgYnJlYWtcbiAgICAgIH1cbiAgICAgIGNvbG9yUG9zaXRpb24gKz0gcHJlR3JvdXBTaXplXG4gICAgfSlcbiAgfVxuXG4gIGRyYXdCdWxsZXQoY2FudmFzLCBsYXllciwgY29sb3JQb3NpdGlvbikge1xuICAgIHZhciBjaGFydFBhZGRpbmdMZWZ0ID0gdGhpcy5jaGFydFBhZGRpbmdMZWZ0XG4gICAgdmFyIGNoYXJ0UGFkZGluZ1RvcCA9IHRoaXMuY2hhcnRQYWRkaW5nVG9wXG4gICAgdmFyIGlzSG9yaXpvbnRhbCA9IHRoaXMuaXNIb3Jpem9udGFsXG4gICAgdmFyIGNoYXJ0Q29udGVudEhlaWdodCA9IHRoaXMuZ2V0Q2hhcnRDb250ZW50SGVpZ2h0KClcbiAgICB2YXIgY2hhcnRDb250ZW50V2lkdGggPSB0aGlzLmdldENoYXJ0Q29udGVudFdpZHRoKClcbiAgICB2YXIgY29udGVudFdpZHRoID0gdGhpcy5nZXRDb250ZW50V2lkdGgoKVxuICAgIHZhciBwcm9jZXNzID0gdGhpcy5wcm9jZXNzXG4gICAgdmFyIHNpemUgPSBsYXllci5kYXRhLmxlbmd0aFxuICAgIHZhciBwcmVCYXJXaWR0aCA9IGNvbnRlbnRXaWR0aCAvIChzaXplICsgMC4yKVxuXG4gICAgdmFyIG1heCA9IGxheWVyLmlzU2Vjb25kYXJ5ID8gdGhpcy5tYXhTZWNvbmRhcnlWYWx1ZSA6IHRoaXMubWF4VmFsdWVcbiAgICB2YXIgbWluID0gbGF5ZXIuaXNTZWNvbmRhcnkgPyB0aGlzLm1pblNlY29uZGFyeVZhbHVlIDogdGhpcy5taW5WYWx1ZVxuICAgIHZhciB2YWx1ZUxlbiA9IG1heCAtIG1pblxuXG4gICAgdmFyIGRyYXdTaXplID0gc2l6ZSAqIHByb2Nlc3NcblxuICAgIHZhciB6ZXJvUG9zaXRpb25cbiAgICBpZiAoaXNIb3Jpem9udGFsKSB7XG4gICAgICB6ZXJvUG9zaXRpb24gPSBjaGFydFBhZGRpbmdMZWZ0ICsgKDAgLSBtaW4pIC8gdmFsdWVMZW4gKiBjaGFydENvbnRlbnRXaWR0aFxuICAgIH0gZWxzZSB7XG4gICAgICB6ZXJvUG9zaXRpb24gPSBjaGFydFBhZGRpbmdUb3AgKyAobWF4IC0gMCkgLyB2YWx1ZUxlbiAqIGNoYXJ0Q29udGVudEhlaWdodFxuICAgIH1cbiAgICB2YXIgemVyb1Bvc2l0aW9uT2Zmc2V0ID0gemVyb1Bvc2l0aW9uICogKDEgLSBwcm9jZXNzKVxuXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBkcmF3U2l6ZTsgaSsrKSB7XG4gICAgICB2YXIgZW50cnkgPSBsYXllci5kYXRhW2ldXG4gICAgICB2YXIgbGFzdEl0ZW1JbmRleCA9IGVudHJ5LnN1YkRhdGEubGVuZ3RoIC0gMVxuXG4gICAgICB2YXIgYmFyRW50cnkgPSBlbnRyeS5zdWJEYXRhWzBdXG4gICAgICB2YXIgdGFyZ2V0RW50cnkgPSBlbnRyeS5zdWJEYXRhW2xhc3RJdGVtSW5kZXhdXG5cbiAgICAgIGlmKGlzSG9yaXpvbnRhbCkge1xuICAgICAgICBpZiAoYmFyRW50cnkgIT0gdW5kZWZpbmVkICYmIGJhckVudHJ5ICE9IG51bGwpIHtcbiAgICAgICAgICB2YXIgc3RhcnRYID0gemVyb1Bvc2l0aW9uXG4gICAgICAgICAgdmFyIGVuZFggPSAoY2hhcnRQYWRkaW5nTGVmdCArIChiYXJFbnRyeSAtIG1pbikgLyB2YWx1ZUxlbiAqIGNoYXJ0Q29udGVudFdpZHRoKSAqIHByb2Nlc3MgKyB6ZXJvUG9zaXRpb25PZmZzZXRcbiAgICAgICAgICBpZiAoZW5kWCA8IHN0YXJ0WCkge1xuICAgICAgICAgICAgdmFyIHRtcCA9IGVuZFhcbiAgICAgICAgICAgIGVuZFggPSBzdGFydFhcbiAgICAgICAgICAgIHN0YXJ0WCA9IHRtcFxuICAgICAgICAgIH1cblxuICAgICAgICAgIHZhciBzdGFydFkgPSBjaGFydFBhZGRpbmdUb3AgKyBwcmVCYXJXaWR0aCAqIChpICsgMC4yICsgMC4xKVxuICAgICAgICAgIHZhciBlbmRZID0gc3RhcnRZICsgcHJlQmFyV2lkdGggKiAwLjZcblxuICAgICAgICAgIGNhbnZhcy5zZXRGaWxsU3R5bGUodGhpcy5nZXRDb2xvcihjb2xvclBvc2l0aW9uKSlcbiAgICAgICAgICBjYW52YXMuZmlsbFJlY3Qoc3RhcnRYLCBzdGFydFksIGVuZFggLSBzdGFydFgsIGVuZFkgLSBzdGFydFkpXG5cbiAgICAgICAgICBpZiAodGhpcy5oaWdoTGlnaHRJbmRleCA9PSBpKSB7XG4gICAgICAgICAgICBjYW52YXMuc2V0RmlsbFN0eWxlKHRoaXMuaGlnaExpZ2h0Q29sb3IpXG4gICAgICAgICAgICBjYW52YXMuc2V0U3Ryb2tlU3R5bGUodGhpcy5oaWdoTGlnaHRDb2xvcilcbiAgICAgICAgICAgIGNhbnZhcy5maWxsUmVjdChzdGFydFgsIHN0YXJ0WSwgZW5kWCAtIHN0YXJ0WCwgZW5kWSAtIHN0YXJ0WSlcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBpZiAoKGxheWVyLmlzU2Vjb25kYXJ5ID8gdGhpcy5kcmF3RXh0cmFEYXRhTGFiZWwgOiB0aGlzLmRyYXdEYXRhTGFiZWwpICYmIHByb2Nlc3MgPT0gMSkge1xuICAgICAgICAgICAgdmFyIGxhYmVsID0gdGhpcy5kYXRhbGFiZWxDYWxsQmFjayh0aGlzLmRyYXdPcmRlcltjb2xvclBvc2l0aW9uXSwgaSwgdHJ1ZSlcbiAgICAgICAgICAgIHRoaXMuZHJhd0RhdGFMYWJlbFBvc2l0aW9uKGxhYmVsLCBsYXllci5pc1NlY29uZGFyeSwgc3RhcnRYLCBlbmRYLCBzdGFydFksIGVuZFkpXG4gICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHRhcmdldEVudHJ5ICE9IHVuZGVmaW5lZCAmJiB0YXJnZXRFbnRyeSAhPSBudWxsKSB7XG4gICAgICAgICAgdmFyIHRhcmdldFggPSBjaGFydFBhZGRpbmdMZWZ0ICsgKHRhcmdldEVudHJ5IC0gbWluKSAvIHZhbHVlTGVuICogY2hhcnRDb250ZW50V2lkdGggKiBwcm9jZXNzXG4gICAgICAgICAgdmFyIHRhcmdldFN0YXJ0WSA9IGNoYXJ0UGFkZGluZ1RvcCArIHByZUJhcldpZHRoICogKGkgKyAwLjEgKyAwLjEpXG4gICAgICAgICAgdmFyIHRhcmdlRW5kWSA9IHRhcmdldFN0YXJ0WSArIHByZUJhcldpZHRoICogMC44XG5cbiAgICAgICAgICBjYW52YXMuc2V0U3Ryb2tlU3R5bGUodGhpcy5nZXRDb2xvcihjb2xvclBvc2l0aW9uICsgMSkpXG4gICAgICAgICAgY2FudmFzLnNldExpbmVXaWR0aCh0aGlzLmJ1bGxldFdpZHRoKVxuICAgICAgICAgIGNhbnZhcy5iZWdpblBhdGgoKVxuICAgICAgICAgIGNhbnZhcy5tb3ZlVG8odGFyZ2V0WCwgdGFyZ2V0U3RhcnRZKVxuICAgICAgICAgIGNhbnZhcy5saW5lVG8odGFyZ2V0WCwgdGFyZ2VFbmRZKVxuICAgICAgICAgIGNhbnZhcy5zdHJva2UoKVxuICAgICAgICAgIGNhbnZhcy5iZWdpblBhdGgoKVxuXG4gICAgICAgICAgaWYgKHRoaXMuaGlnaExpZ2h0SW5kZXggPT0gaSkge1xuICAgICAgICAgICAgY2FudmFzLnNldEZpbGxTdHlsZSh0aGlzLmhpZ2hMaWdodENvbG9yKVxuICAgICAgICAgICAgY2FudmFzLnNldFN0cm9rZVN0eWxlKHRoaXMuaGlnaExpZ2h0Q29sb3IpXG4gICAgICAgICAgICBjYW52YXMuYmVnaW5QYXRoKClcbiAgICAgICAgICAgIGNhbnZhcy5tb3ZlVG8odGFyZ2V0WCwgdGFyZ2V0U3RhcnRZKVxuICAgICAgICAgICAgY2FudmFzLmxpbmVUbyh0YXJnZXRYLCB0YXJnZUVuZFkpXG4gICAgICAgICAgICBjYW52YXMuc3Ryb2tlKClcbiAgICAgICAgICAgIGNhbnZhcy5iZWdpblBhdGgoKVxuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgaWYgKGJhckVudHJ5ICE9IHVuZGVmaW5lZCAmJiBiYXJFbnRyeSAhPSBudWxsKSB7XG4gICAgICAgICAgdmFyIHN0YXJ0WCA9IGNoYXJ0UGFkZGluZ0xlZnQgKyBwcmVCYXJXaWR0aCAqIChpICsgMC4yICsgMC4xKVxuICAgICAgICAgIHZhciBlbmRYID0gc3RhcnRYICsgcHJlQmFyV2lkdGggKiAwLjZcbiAgICAgICAgICB2YXIgc3RhcnRZID0gKGNoYXJ0UGFkZGluZ1RvcCArIChtYXggLSBiYXJFbnRyeSkgLyB2YWx1ZUxlbiAqIGNoYXJ0Q29udGVudEhlaWdodCkgKiBwcm9jZXNzICsgemVyb1Bvc2l0aW9uT2Zmc2V0XG4gICAgICAgICAgdmFyIGVuZFkgPSB6ZXJvUG9zaXRpb25cbiAgICAgICAgICBpZiAoZW5kWSA8IHN0YXJ0WSkge1xuICAgICAgICAgICAgdmFyIHRtcCA9IGVuZFlcbiAgICAgICAgICAgIGVuZFkgPSBzdGFydFlcbiAgICAgICAgICAgIHN0YXJ0WSA9IHRtcFxuICAgICAgICAgIH1cblxuICAgICAgICAgIGNhbnZhcy5zZXRGaWxsU3R5bGUodGhpcy5nZXRDb2xvcihjb2xvclBvc2l0aW9uKSlcbiAgICAgICAgICBjYW52YXMuZmlsbFJlY3Qoc3RhcnRYLCBzdGFydFksIGVuZFggLSBzdGFydFgsIGVuZFkgLSBzdGFydFkpXG5cbiAgICAgICAgICBpZiAodGhpcy5oaWdoTGlnaHRJbmRleCA9PSBpKSB7XG4gICAgICAgICAgICBjYW52YXMuc2V0RmlsbFN0eWxlKHRoaXMuaGlnaExpZ2h0Q29sb3IpXG4gICAgICAgICAgICBjYW52YXMuc2V0U3Ryb2tlU3R5bGUodGhpcy5oaWdoTGlnaHRDb2xvcilcbiAgICAgICAgICAgIGNhbnZhcy5maWxsUmVjdChzdGFydFgsIHN0YXJ0WSwgZW5kWCAtIHN0YXJ0WCwgZW5kWSAtIHN0YXJ0WSlcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBpZiAoKGxheWVyLmlzU2Vjb25kYXJ5ID8gdGhpcy5kcmF3RXh0cmFEYXRhTGFiZWwgOiB0aGlzLmRyYXdEYXRhTGFiZWwpICYmIHByb2Nlc3MgPT0gMSkge1xuICAgICAgICAgICAgdmFyIGxhYmVsID0gdGhpcy5kYXRhbGFiZWxDYWxsQmFjayh0aGlzLmRyYXdPcmRlcltjb2xvclBvc2l0aW9uXSwgaSwgdHJ1ZSlcbiAgICAgICAgICAgIHRoaXMuZHJhd0RhdGFMYWJlbFBvc2l0aW9uKGxhYmVsLCBsYXllci5pc1NlY29uZGFyeSwgc3RhcnRYLCBlbmRYLCBzdGFydFksIGVuZFkpXG4gICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHRhcmdldEVudHJ5ICE9IHVuZGVmaW5lZCAmJiB0YXJnZXRFbnRyeSAhPSBudWxsKSB7XG4gICAgICAgICAgdmFyIHRhcmdldFN0YXJ0WCA9IGNoYXJ0UGFkZGluZ0xlZnQgKyBwcmVCYXJXaWR0aCAqIChpICsgMC4xICsgMC4xKVxuICAgICAgICAgIHZhciB0YXJnZXRFbmRYID0gdGFyZ2V0U3RhcnRYICsgcHJlQmFyV2lkdGggKiAwLjhcbiAgICAgICAgICB2YXIgdGFyZ2V0WSA9IChjaGFydFBhZGRpbmdUb3AgKyAobWF4IC0gdGFyZ2V0RW50cnkpIC8gdmFsdWVMZW4gKiBjaGFydENvbnRlbnRIZWlnaHQpICogcHJvY2VzcyArIHplcm9Qb3NpdGlvbk9mZnNldFxuXG4gICAgICAgICAgY2FudmFzLnNldFN0cm9rZVN0eWxlKHRoaXMuZ2V0Q29sb3IoY29sb3JQb3NpdGlvbiArIDEpKVxuICAgICAgICAgIGNhbnZhcy5zZXRMaW5lV2lkdGgodGhpcy5idWxsZXRXaWR0aClcbiAgICAgICAgICBjYW52YXMuYmVnaW5QYXRoKClcbiAgICAgICAgICBjYW52YXMubW92ZVRvKHRhcmdldFN0YXJ0WCwgdGFyZ2V0WSlcbiAgICAgICAgICBjYW52YXMubGluZVRvKHRhcmdldEVuZFgsIHRhcmdldFkpXG4gICAgICAgICAgY2FudmFzLnN0cm9rZSgpXG4gICAgICAgICAgY2FudmFzLmJlZ2luUGF0aCgpXG5cbiAgICAgICAgICBpZiAodGhpcy5oaWdoTGlnaHRJbmRleCA9PSBpKSB7XG4gICAgICAgICAgICBjYW52YXMuc2V0RmlsbFN0eWxlKHRoaXMuaGlnaExpZ2h0Q29sb3IpXG4gICAgICAgICAgICBjYW52YXMuc2V0U3Ryb2tlU3R5bGUodGhpcy5oaWdoTGlnaHRDb2xvcilcbiAgICAgICAgICAgIGNhbnZhcy5iZWdpblBhdGgoKVxuICAgICAgICAgICAgY2FudmFzLm1vdmVUbyh0YXJnZXRTdGFydFgsIHRhcmdldFkpXG4gICAgICAgICAgICBjYW52YXMubGluZVRvKHRhcmdldEVuZFgsIHRhcmdldFkpXG4gICAgICAgICAgICBjYW52YXMuc3Ryb2tlKClcbiAgICAgICAgICAgIGNhbnZhcy5iZWdpblBhdGgoKVxuICAgICAgICAgIH1cblxuICAgICAgICAgIC8vIGlmICgobGF5ZXIuaXNTZWNvbmRhcnkgPyB0aGlzLmRyYXdFeHRyYURhdGFMYWJlbCA6IHRoaXMuZHJhd0RhdGFMYWJlbCkgJiYgcHJvY2VzcyA9PSAxKSB7XG4gICAgICAgICAgLy8gICB2YXIgbGFiZWwgPSB0aGlzLmRhdGFsYWJlbENhbGxCYWNrKHRoaXMuZHJhd09yZGVyW2NvbG9yUG9zaXRpb24gKyAxXSwgaSwgdHJ1ZSlcbiAgICAgICAgICAvLyAgIHRoaXMuZHJhd0RhdGFMYWJlbFBvc2l0aW9uKGxhYmVsLCBsYXllci5pc1NlY29uZGFyeSwgc3RhcnRYLCBlbmRYLCBzdGFydFksIGVuZFkpXG4gICAgICAgICAgLy8gfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgZHJhd1BlcmNlbnQoY2FudmFzLCBsYXllciwgY29sb3JQb3NpdGlvbikge1xuICAgIHZhciBjaGFydFBhZGRpbmdMZWZ0ID0gdGhpcy5jaGFydFBhZGRpbmdMZWZ0XG4gICAgdmFyIGNoYXJ0UGFkZGluZ1RvcCA9IHRoaXMuY2hhcnRQYWRkaW5nVG9wXG4gICAgdmFyIGlzSG9yaXpvbnRhbCA9IHRoaXMuaXNIb3Jpem9udGFsXG4gICAgdmFyIGNoYXJ0Q29udGVudEhlaWdodCA9IHRoaXMuZ2V0Q2hhcnRDb250ZW50SGVpZ2h0KClcbiAgICB2YXIgY2hhcnRDb250ZW50V2lkdGggPSB0aGlzLmdldENoYXJ0Q29udGVudFdpZHRoKClcbiAgICB2YXIgY29udGVudFdpZHRoID0gdGhpcy5nZXRDb250ZW50V2lkdGgoKVxuICAgIHZhciBwcm9jZXNzID0gdGhpcy5wcm9jZXNzXG4gICAgdmFyIHNpemUgPSBsYXllci5kYXRhLmxlbmd0aFxuICAgIHZhciBwcmVCYXJXaWR0aCA9IGNvbnRlbnRXaWR0aCAvIChzaXplICsgMC4yKVxuXG4gICAgdmFyIG1heCA9IGxheWVyLmlzU2Vjb25kYXJ5ID8gdGhpcy5tYXhTZWNvbmRhcnlWYWx1ZSA6IHRoaXMubWF4VmFsdWVcbiAgICB2YXIgbWluID0gbGF5ZXIuaXNTZWNvbmRhcnkgPyB0aGlzLm1pblNlY29uZGFyeVZhbHVlIDogdGhpcy5taW5WYWx1ZVxuICAgIHZhciB2YWx1ZUxlbiA9IG1heCAtIG1pblxuXG4gICAgdmFyIGRyYXdTaXplID0gc2l6ZSAqIHByb2Nlc3NcblxuICAgIHZhciB6ZXJvUG9zaXRpb25cbiAgICBpZiAoaXNIb3Jpem9udGFsKSB7XG4gICAgICB6ZXJvUG9zaXRpb24gPSBjaGFydFBhZGRpbmdMZWZ0ICsgKDAgLSBtaW4pIC8gdmFsdWVMZW4gKiBjaGFydENvbnRlbnRXaWR0aFxuICAgIH0gZWxzZSB7XG4gICAgICB6ZXJvUG9zaXRpb24gPSBjaGFydFBhZGRpbmdUb3AgKyAobWF4IC0gMCkgLyB2YWx1ZUxlbiAqIGNoYXJ0Q29udGVudEhlaWdodFxuICAgIH1cbiAgICB2YXIgemVyb1Bvc2l0aW9uT2Zmc2V0ID0gemVyb1Bvc2l0aW9uICogKDEgLSBwcm9jZXNzKVxuXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBkcmF3U2l6ZTsgaSsrKSB7XG4gICAgICB2YXIgZW50cnkgPSBsYXllci5kYXRhW2ldXG5cbiAgICAgIGlmKGlzSG9yaXpvbnRhbCkge1xuICAgICAgICB2YXIgbmVnYXRpdmVTdGFydFggPSB6ZXJvUG9zaXRpb25cbiAgICAgICAgdmFyIHBvc2l0aXZlU3RhcnRYID0gbmVnYXRpdmVTdGFydFhcblxuICAgICAgICB2YXIgc3RhcnRZID0gY2hhcnRQYWRkaW5nVG9wICsgcHJlQmFyV2lkdGggKiAoaSArIDAuMSArIDAuMSlcbiAgICAgICAgdmFyIGVuZFkgPSBzdGFydFkgKyBwcmVCYXJXaWR0aCAqIDAuOFxuXG4gICAgICAgIHZhciBuZWdhdGl2ZUhlaWdodCA9ICgwIC0gbWluKSAvIHZhbHVlTGVuICogY2hhcnRDb250ZW50V2lkdGhcbiAgICAgICAgdmFyIHBvc2l0aXZlSGVpZ2h0ID0gKG1heCAtIDApIC8gdmFsdWVMZW4gKiBjaGFydENvbnRlbnRXaWR0aFxuXG4gICAgICAgIGlmIChlbnRyeS5zdWJEYXRhICE9IHVuZGVmaW5lZCAmJiBlbnRyeS5zdWJEYXRhLmxlbmd0aCAhPSAwKSB7XG4gICAgICAgICAgdmFyIHN1YlNpemUgPSBlbnRyeS5zdWJEYXRhLmxlbmd0aFxuICAgICAgICAgIGZvciAodmFyIGogPSAwOyBqIDwgc3ViU2l6ZTsgaisrKSB7XG4gICAgICAgICAgICB2YXIgaXRlbUluZGV4ID0galxuICAgICAgICAgICAgdmFyIHN1YkVudHJ5ID0gZW50cnkuc3ViRGF0YVtpdGVtSW5kZXhdXG4gICAgICAgICAgICBpZiAoIXN1YkVudHJ5KSB7XG4gICAgICAgICAgICAgIGNvbnRpbnVlXG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB2YXIgc3RhcnRYLCBlbmRYLCBzdWJCYXJIZWlnaHRcbiAgICAgICAgICAgIGlmIChzdWJFbnRyeSA8IDApIHtcbiAgICAgICAgICAgICAgc3RhcnRYID0gbmVnYXRpdmVTdGFydFhcbiAgICAgICAgICAgICAgc3ViQmFySGVpZ2h0ID0gc3ViRW50cnkgLyBlbnRyeS5uZWdhdGl2ZVN1bSAqIG5lZ2F0aXZlSGVpZ2h0XG4gICAgICAgICAgICAgIGVuZFggPSBzdGFydFggLSBzdWJCYXJIZWlnaHRcbiAgICAgICAgICAgICAgbmVnYXRpdmVTdGFydFggPSBuZWdhdGl2ZVN0YXJ0WCAtIHN1YkJhckhlaWdodFxuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgc3RhcnRYID0gcG9zaXRpdmVTdGFydFhcbiAgICAgICAgICAgICAgc3ViQmFySGVpZ2h0ID0gc3ViRW50cnkgLyBlbnRyeS5wb3NpdGl2ZVN1bSAqIHBvc2l0aXZlSGVpZ2h0XG4gICAgICAgICAgICAgIGVuZFggPSBzdGFydFggKyBzdWJCYXJIZWlnaHRcbiAgICAgICAgICAgICAgcG9zaXRpdmVTdGFydFggPSBwb3NpdGl2ZVN0YXJ0WCArIHN1YkJhckhlaWdodFxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgc3RhcnRYID0gc3RhcnRYICogcHJvY2VzcyArIHplcm9Qb3NpdGlvbk9mZnNldFxuICAgICAgICAgICAgZW5kWCA9IGVuZFggKiBwcm9jZXNzICsgemVyb1Bvc2l0aW9uT2Zmc2V0XG4gICAgICAgICAgICBpZiAoZW5kWCA8IHN0YXJ0WCkge1xuICAgICAgICAgICAgICB2YXIgdG1wID0gZW5kWFxuICAgICAgICAgICAgICBlbmRYID0gc3RhcnRYXG4gICAgICAgICAgICAgIHN0YXJ0WCA9IHRtcFxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBjYW52YXMuc2V0RmlsbFN0eWxlKHRoaXMuZ2V0Q29sb3IoY29sb3JQb3NpdGlvbiArIGl0ZW1JbmRleCkpXG4gICAgICAgICAgICBjYW52YXMuZmlsbFJlY3Qoc3RhcnRYLCBzdGFydFksIGVuZFggLSBzdGFydFgsIGVuZFkgLSBzdGFydFkpXG4gICAgICAgICAgICBpZiAodGhpcy5oaWdoTGlnaHRJbmRleCA9PSBpKSB7XG4gICAgICAgICAgICAgIGNhbnZhcy5zZXRGaWxsU3R5bGUodGhpcy5oaWdoTGlnaHRDb2xvcilcbiAgICAgICAgICAgICAgY2FudmFzLmZpbGxSZWN0KHN0YXJ0WCwgc3RhcnRZLCBlbmRYIC0gc3RhcnRYLCBlbmRZIC0gc3RhcnRZKVxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAoKGxheWVyLmlzU2Vjb25kYXJ5ID8gdGhpcy5kcmF3RXh0cmFEYXRhTGFiZWwgOiB0aGlzLmRyYXdEYXRhTGFiZWwpICYmIHByb2Nlc3MgPT0gMSkge1xuICAgICAgICAgICAgICB2YXIgbGFiZWwgPSB0aGlzLmRhdGFsYWJlbENhbGxCYWNrKHRoaXMuZHJhd09yZGVyW2NvbG9yUG9zaXRpb24gKyBpdGVtSW5kZXhdLCBpLCB0cnVlKVxuICAgICAgICAgICAgICB0aGlzLmRyYXdEYXRhTGFiZWxQb3NpdGlvbihsYWJlbCwgbGF5ZXIuaXNTZWNvbmRhcnksIHN0YXJ0WCwgZW5kWCwgc3RhcnRZLCBlbmRZKVxuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdmFyIHN0YXJ0WCA9IGNoYXJ0UGFkZGluZ0xlZnQgKyBwcmVCYXJXaWR0aCAqIChpICsgMC4xICsgMC4xKVxuICAgICAgICB2YXIgZW5kWCA9IHN0YXJ0WCArIHByZUJhcldpZHRoICogMC44XG5cbiAgICAgICAgdmFyIG5lZ2F0aXZlRW5kWSA9IHplcm9Qb3NpdGlvblxuICAgICAgICB2YXIgcG9zaXRpdmVFbmRZID0gbmVnYXRpdmVFbmRZXG5cbiAgICAgICAgdmFyIG5lZ2F0aXZlSGVpZ2h0ID0gKDAgLSBtaW4pIC8gdmFsdWVMZW4gKiBjaGFydENvbnRlbnRIZWlnaHRcbiAgICAgICAgdmFyIHBvc2l0aXZlSGVpZ2h0ID0gKG1heCAtIDApIC8gdmFsdWVMZW4gKiBjaGFydENvbnRlbnRIZWlnaHRcblxuICAgICAgICBpZiAoZW50cnkuc3ViRGF0YSAhPSB1bmRlZmluZWQgJiYgZW50cnkuc3ViRGF0YS5sZW5ndGggIT0gMCkge1xuICAgICAgICAgIHZhciBzdWJTaXplID0gZW50cnkuc3ViRGF0YS5sZW5ndGhcbiAgICAgICAgICBmb3IgKHZhciBqID0gMDsgaiA8IHN1YlNpemU7IGorKykge1xuICAgICAgICAgICAgdmFyIGl0ZW1JbmRleCA9IHN1YlNpemUgLSBqIC0gMVxuICAgICAgICAgICAgdmFyIHN1YkVudHJ5ID0gZW50cnkuc3ViRGF0YVtpdGVtSW5kZXhdXG4gICAgICAgICAgICBpZiAoIXN1YkVudHJ5KSB7XG4gICAgICAgICAgICAgIGNvbnRpbnVlXG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB2YXIgZW5kWVxuICAgICAgICAgICAgdmFyIHN1YkJhckhlaWdodFxuICAgICAgICAgICAgdmFyIHN0YXJ0WVxuICAgICAgICAgICAgaWYgKHN1YkVudHJ5IDwgMCkge1xuICAgICAgICAgICAgICBlbmRZID0gbmVnYXRpdmVFbmRZXG4gICAgICAgICAgICAgIHN1YkJhckhlaWdodCA9IHN1YkVudHJ5IC8gZW50cnkubmVnYXRpdmVTdW0gKiBuZWdhdGl2ZUhlaWdodFxuICAgICAgICAgICAgICBzdGFydFkgPSBlbmRZICsgc3ViQmFySGVpZ2h0XG4gICAgICAgICAgICAgIG5lZ2F0aXZlRW5kWSArPSBzdWJCYXJIZWlnaHRcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgIGVuZFkgPSBwb3NpdGl2ZUVuZFlcbiAgICAgICAgICAgICAgc3ViQmFySGVpZ2h0ID0gc3ViRW50cnkgLyBlbnRyeS5wb3NpdGl2ZVN1bSAqIHBvc2l0aXZlSGVpZ2h0XG4gICAgICAgICAgICAgIHN0YXJ0WSA9IGVuZFkgLSBzdWJCYXJIZWlnaHRcbiAgICAgICAgICAgICAgcG9zaXRpdmVFbmRZIC09IHN1YkJhckhlaWdodFxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgc3RhcnRZID0gc3RhcnRZICogcHJvY2VzcyArIHplcm9Qb3NpdGlvbk9mZnNldFxuICAgICAgICAgICAgZW5kWSA9IGVuZFkgKiBwcm9jZXNzICsgemVyb1Bvc2l0aW9uT2Zmc2V0XG4gICAgICAgICAgICBpZiAoZW5kWSA8IHN0YXJ0WSkge1xuICAgICAgICAgICAgICB2YXIgdG1wID0gZW5kWVxuICAgICAgICAgICAgICBlbmRZID0gc3RhcnRZXG4gICAgICAgICAgICAgIHN0YXJ0WSA9IHRtcFxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBjYW52YXMuc2V0RmlsbFN0eWxlKHRoaXMuZ2V0Q29sb3IoY29sb3JQb3NpdGlvbiArIHN1YlNpemUgLSBqIC0gMSkpXG4gICAgICAgICAgICBjYW52YXMuZmlsbFJlY3Qoc3RhcnRYLCBzdGFydFksIGVuZFggLSBzdGFydFgsIGVuZFkgLSBzdGFydFkpXG4gICAgICAgICAgICBpZiAodGhpcy5oaWdoTGlnaHRJbmRleCA9PSBpKSB7XG4gICAgICAgICAgICAgIGNhbnZhcy5zZXRGaWxsU3R5bGUodGhpcy5oaWdoTGlnaHRDb2xvcilcbiAgICAgICAgICAgICAgY2FudmFzLmZpbGxSZWN0KHN0YXJ0WCwgc3RhcnRZLCBlbmRYIC0gc3RhcnRYLCBlbmRZIC0gc3RhcnRZKVxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAoKGxheWVyLmlzU2Vjb25kYXJ5ID8gdGhpcy5kcmF3RXh0cmFEYXRhTGFiZWwgOiB0aGlzLmRyYXdEYXRhTGFiZWwpICYmIHByb2Nlc3MgPT0gMSkge1xuICAgICAgICAgICAgICB2YXIgbGFiZWwgPSB0aGlzLmRhdGFsYWJlbENhbGxCYWNrKHRoaXMuZHJhd09yZGVyW2NvbG9yUG9zaXRpb24gKyBpdGVtSW5kZXhdLCBpLCB0cnVlKVxuICAgICAgICAgICAgICB0aGlzLmRyYXdEYXRhTGFiZWxQb3NpdGlvbihsYWJlbCwgbGF5ZXIuaXNTZWNvbmRhcnksIHN0YXJ0WCwgZW5kWCwgc3RhcnRZLCBlbmRZKVxuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIGRyYXdTdGFja2VkKGNhbnZhcywgbGF5ZXIsIGNvbG9yUG9zaXRpb24pIHtcbiAgICB2YXIgY2hhcnRQYWRkaW5nTGVmdCA9IHRoaXMuY2hhcnRQYWRkaW5nTGVmdFxuICAgIHZhciBjaGFydFBhZGRpbmdUb3AgPSB0aGlzLmNoYXJ0UGFkZGluZ1RvcFxuICAgIHZhciBpc0hvcml6b250YWwgPSB0aGlzLmlzSG9yaXpvbnRhbFxuICAgIHZhciBjaGFydENvbnRlbnRIZWlnaHQgPSB0aGlzLmdldENoYXJ0Q29udGVudEhlaWdodCgpXG4gICAgdmFyIGNoYXJ0Q29udGVudFdpZHRoID0gdGhpcy5nZXRDaGFydENvbnRlbnRXaWR0aCgpXG4gICAgdmFyIGNvbnRlbnRXaWR0aCA9IHRoaXMuZ2V0Q29udGVudFdpZHRoKClcbiAgICB2YXIgcHJvY2VzcyA9IHRoaXMucHJvY2Vzc1xuICAgIHZhciBzaXplID0gbGF5ZXIuZGF0YS5sZW5ndGhcbiAgICB2YXIgcHJlQmFyV2lkdGggPSBjb250ZW50V2lkdGggLyAoc2l6ZSArIDAuMilcblxuICAgIHZhciBtYXggPSBsYXllci5pc1NlY29uZGFyeSA/IHRoaXMubWF4U2Vjb25kYXJ5VmFsdWUgOiB0aGlzLm1heFZhbHVlXG4gICAgdmFyIG1pbiA9IGxheWVyLmlzU2Vjb25kYXJ5ID8gdGhpcy5taW5TZWNvbmRhcnlWYWx1ZSA6IHRoaXMubWluVmFsdWVcbiAgICB2YXIgdmFsdWVMZW4gPSBtYXggLSBtaW5cblxuICAgIHZhciBkcmF3U2l6ZSA9IHNpemUgKiBwcm9jZXNzXG5cbiAgICB2YXIgemVyb1Bvc2l0aW9uXG4gICAgaWYgKGlzSG9yaXpvbnRhbCkge1xuICAgICAgemVyb1Bvc2l0aW9uID0gY2hhcnRQYWRkaW5nTGVmdCArICgwIC0gbWluKSAvIHZhbHVlTGVuICogY2hhcnRDb250ZW50V2lkdGhcbiAgICB9IGVsc2Uge1xuICAgICAgemVyb1Bvc2l0aW9uID0gY2hhcnRQYWRkaW5nVG9wICsgKG1heCAtIDApIC8gdmFsdWVMZW4gKiBjaGFydENvbnRlbnRIZWlnaHRcbiAgICB9XG4gICAgdmFyIHplcm9Qb3NpdGlvbk9mZnNldCA9IHplcm9Qb3NpdGlvbiAqICgxIC0gcHJvY2VzcylcblxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgZHJhd1NpemU7IGkrKykge1xuICAgICAgdmFyIGVudHJ5ID0gbGF5ZXIuZGF0YVtpXVxuXG4gICAgICBpZihpc0hvcml6b250YWwpIHtcbiAgICAgICAgdmFyIG5lZ2F0aXZlU3RhcnRYID0gemVyb1Bvc2l0aW9uXG4gICAgICAgIHZhciBwb3NpdGl2ZVN0YXJ0WCA9IG5lZ2F0aXZlU3RhcnRYXG5cbiAgICAgICAgdmFyIHN0YXJ0WSA9IGNoYXJ0UGFkZGluZ1RvcCArIHByZUJhcldpZHRoICogKGkgKyAwLjEgKyAwLjEpXG4gICAgICAgIHZhciBlbmRZID0gc3RhcnRZICsgcHJlQmFyV2lkdGggKiAwLjhcblxuICAgICAgICB2YXIgbmVnYXRpdmVIZWlnaHQgPSAoMCAtIGVudHJ5Lm5lZ2F0aXZlU3VtKSAvIHZhbHVlTGVuICogY2hhcnRDb250ZW50V2lkdGhcbiAgICAgICAgdmFyIHBvc2l0aXZlSGVpZ2h0ID0gKGVudHJ5LnBvc2l0aXZlU3VtIC0gMCkgLyB2YWx1ZUxlbiAqIGNoYXJ0Q29udGVudFdpZHRoXG5cbiAgICAgICAgaWYgKGVudHJ5LnN1YkRhdGEgIT0gdW5kZWZpbmVkICYmIGVudHJ5LnN1YkRhdGEubGVuZ3RoICE9IDApIHtcbiAgICAgICAgICB2YXIgc3ViU2l6ZSA9IGVudHJ5LnN1YkRhdGEubGVuZ3RoXG4gICAgICAgICAgZm9yICh2YXIgaiA9IDA7IGogPCBzdWJTaXplOyBqKyspIHtcbiAgICAgICAgICAgIHZhciBpdGVtSW5kZXggPSBzdWJTaXplIC0gaiAtIDFcbiAgICAgICAgICAgIHZhciBzdWJFbnRyeSA9IGVudHJ5LnN1YkRhdGFbaXRlbUluZGV4XVxuICAgICAgICAgICAgaWYgKCFzdWJFbnRyeSkge1xuICAgICAgICAgICAgICBjb250aW51ZVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdmFyIHN0YXJ0WCwgZW5kWCwgc3ViQmFySGVpZ2h0XG4gICAgICAgICAgICBpZiAoc3ViRW50cnkgPCAwKSB7XG4gICAgICAgICAgICAgIHN0YXJ0WCA9IG5lZ2F0aXZlU3RhcnRYXG4gICAgICAgICAgICAgIHN1YkJhckhlaWdodCA9IHN1YkVudHJ5IC8gZW50cnkubmVnYXRpdmVTdW0gKiBuZWdhdGl2ZUhlaWdodFxuICAgICAgICAgICAgICBlbmRYID0gc3RhcnRYIC0gc3ViQmFySGVpZ2h0XG4gICAgICAgICAgICAgIG5lZ2F0aXZlU3RhcnRYID0gbmVnYXRpdmVTdGFydFggLSBzdWJCYXJIZWlnaHRcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgIHN0YXJ0WCA9IHBvc2l0aXZlU3RhcnRYXG4gICAgICAgICAgICAgIHN1YkJhckhlaWdodCA9IHN1YkVudHJ5IC8gZW50cnkucG9zaXRpdmVTdW0gKiBwb3NpdGl2ZUhlaWdodFxuICAgICAgICAgICAgICBlbmRYID0gc3RhcnRYICsgc3ViQmFySGVpZ2h0XG4gICAgICAgICAgICAgIHBvc2l0aXZlU3RhcnRYID0gcG9zaXRpdmVTdGFydFggKyBzdWJCYXJIZWlnaHRcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHN0YXJ0WCA9IHN0YXJ0WCAqIHByb2Nlc3MgKyB6ZXJvUG9zaXRpb25PZmZzZXRcbiAgICAgICAgICAgIGVuZFggPSBlbmRYICogcHJvY2VzcyArIHplcm9Qb3NpdGlvbk9mZnNldFxuICAgICAgICAgICAgaWYgKGVuZFggPCBzdGFydFgpIHtcbiAgICAgICAgICAgICAgdmFyIHRtcCA9IGVuZFhcbiAgICAgICAgICAgICAgZW5kWCA9IHN0YXJ0WFxuICAgICAgICAgICAgICBzdGFydFggPSB0bXBcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgY2FudmFzLnNldEZpbGxTdHlsZSh0aGlzLmdldENvbG9yKGNvbG9yUG9zaXRpb24gKyBpdGVtSW5kZXgpKVxuICAgICAgICAgICAgY2FudmFzLmZpbGxSZWN0KHN0YXJ0WCwgc3RhcnRZLCBlbmRYIC0gc3RhcnRYLCBlbmRZIC0gc3RhcnRZKVxuICAgICAgICAgICAgaWYgKHRoaXMuaGlnaExpZ2h0SW5kZXggPT0gaSkge1xuICAgICAgICAgICAgICBjYW52YXMuc2V0RmlsbFN0eWxlKHRoaXMuaGlnaExpZ2h0Q29sb3IpXG4gICAgICAgICAgICAgIGNhbnZhcy5maWxsUmVjdChzdGFydFgsIHN0YXJ0WSwgZW5kWCAtIHN0YXJ0WCwgZW5kWSAtIHN0YXJ0WSlcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKChsYXllci5pc1NlY29uZGFyeSA/IHRoaXMuZHJhd0V4dHJhRGF0YUxhYmVsIDogdGhpcy5kcmF3RGF0YUxhYmVsKSAmJiBwcm9jZXNzID09IDEpIHtcbiAgICAgICAgICAgICAgdmFyIGxhYmVsID0gdGhpcy5kYXRhbGFiZWxDYWxsQmFjayh0aGlzLmRyYXdPcmRlcltjb2xvclBvc2l0aW9uICsgaXRlbUluZGV4XSwgaSwgdHJ1ZSlcbiAgICAgICAgICAgICAgdGhpcy5kcmF3RGF0YUxhYmVsUG9zaXRpb24obGFiZWwsIGxheWVyLmlzU2Vjb25kYXJ5LCBzdGFydFgsIGVuZFgsIHN0YXJ0WSwgZW5kWSlcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHZhciBzdGFydFggPSBjaGFydFBhZGRpbmdMZWZ0ICsgcHJlQmFyV2lkdGggKiAoaSArIDAuMSArIDAuMSlcbiAgICAgICAgdmFyIGVuZFggPSBzdGFydFggKyBwcmVCYXJXaWR0aCAqIDAuOFxuXG4gICAgICAgIHZhciBuZWdhdGl2ZUVuZFkgPSB6ZXJvUG9zaXRpb25cbiAgICAgICAgdmFyIHBvc2l0aXZlRW5kWSA9IG5lZ2F0aXZlRW5kWVxuXG4gICAgICAgIHZhciBuZWdhdGl2ZUhlaWdodCA9ICgwIC0gZW50cnkubmVnYXRpdmVTdW0pIC8gdmFsdWVMZW4gKiBjaGFydENvbnRlbnRIZWlnaHRcbiAgICAgICAgdmFyIHBvc2l0aXZlSGVpZ2h0ID0gKGVudHJ5LnBvc2l0aXZlU3VtIC0gMCkgLyB2YWx1ZUxlbiAqIGNoYXJ0Q29udGVudEhlaWdodFxuXG4gICAgICAgIGlmIChlbnRyeS5zdWJEYXRhICE9IHVuZGVmaW5lZCAmJiBlbnRyeS5zdWJEYXRhLmxlbmd0aCAhPSAwKSB7XG4gICAgICAgICAgdmFyIHN1YlNpemUgPSBlbnRyeS5zdWJEYXRhLmxlbmd0aFxuICAgICAgICAgIGZvciAodmFyIGogPSAwOyBqIDwgc3ViU2l6ZTsgaisrKSB7XG4gICAgICAgICAgICB2YXIgaXRlbUluZGV4ID0gc3ViU2l6ZSAtIGogLSAxXG4gICAgICAgICAgICB2YXIgc3ViRW50cnkgPSBlbnRyeS5zdWJEYXRhW2l0ZW1JbmRleF1cbiAgICAgICAgICAgIGlmICghc3ViRW50cnkpIHtcbiAgICAgICAgICAgICAgY29udGludWVcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHZhciBlbmRZXG4gICAgICAgICAgICB2YXIgc3ViQmFySGVpZ2h0XG4gICAgICAgICAgICB2YXIgc3RhcnRZXG4gICAgICAgICAgICBpZiAoc3ViRW50cnkgPCAwKSB7XG4gICAgICAgICAgICAgIGVuZFkgPSBuZWdhdGl2ZUVuZFlcbiAgICAgICAgICAgICAgc3ViQmFySGVpZ2h0ID0gc3ViRW50cnkgLyBlbnRyeS5uZWdhdGl2ZVN1bSAqIG5lZ2F0aXZlSGVpZ2h0XG4gICAgICAgICAgICAgIHN0YXJ0WSA9IGVuZFkgKyBzdWJCYXJIZWlnaHRcbiAgICAgICAgICAgICAgbmVnYXRpdmVFbmRZICs9IHN1YkJhckhlaWdodFxuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgZW5kWSA9IHBvc2l0aXZlRW5kWTtcbiAgICAgICAgICAgICAgc3ViQmFySGVpZ2h0ID0gc3ViRW50cnkgLyBlbnRyeS5wb3NpdGl2ZVN1bSAqIHBvc2l0aXZlSGVpZ2h0XG4gICAgICAgICAgICAgIHN0YXJ0WSA9IGVuZFkgLSBzdWJCYXJIZWlnaHRcbiAgICAgICAgICAgICAgcG9zaXRpdmVFbmRZIC09IHN1YkJhckhlaWdodFxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgc3RhcnRZID0gc3RhcnRZICogcHJvY2VzcyArIHplcm9Qb3NpdGlvbk9mZnNldFxuICAgICAgICAgICAgZW5kWSA9IGVuZFkgKiBwcm9jZXNzICsgemVyb1Bvc2l0aW9uT2Zmc2V0XG4gICAgICAgICAgICBpZiAoZW5kWSA8IHN0YXJ0WSkge1xuICAgICAgICAgICAgICB2YXIgdG1wID0gZW5kWVxuICAgICAgICAgICAgICBlbmRZID0gc3RhcnRZXG4gICAgICAgICAgICAgIHN0YXJ0WSA9IHRtcFxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBjYW52YXMuc2V0RmlsbFN0eWxlKHRoaXMuZ2V0Q29sb3IoY29sb3JQb3NpdGlvbiArIHN1YlNpemUgLSBqIC0gMSkpXG4gICAgICAgICAgICBjYW52YXMuZmlsbFJlY3Qoc3RhcnRYLCBzdGFydFksIGVuZFggLSBzdGFydFgsIGVuZFkgLSBzdGFydFkpXG4gICAgICAgICAgICBpZiAodGhpcy5oaWdoTGlnaHRJbmRleCA9PSBpKSB7XG4gICAgICAgICAgICAgIGNhbnZhcy5zZXRGaWxsU3R5bGUodGhpcy5oaWdoTGlnaHRDb2xvcilcbiAgICAgICAgICAgICAgY2FudmFzLmZpbGxSZWN0KHN0YXJ0WCwgc3RhcnRZLCBlbmRYIC0gc3RhcnRYLCBlbmRZIC0gc3RhcnRZKVxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAoKGxheWVyLmlzU2Vjb25kYXJ5ID8gdGhpcy5kcmF3RXh0cmFEYXRhTGFiZWwgOiB0aGlzLmRyYXdEYXRhTGFiZWwpICYmIHByb2Nlc3MgPT0gMSkge1xuICAgICAgICAgICAgICB2YXIgbGFiZWwgPSB0aGlzLmRhdGFsYWJlbENhbGxCYWNrKHRoaXMuZHJhd09yZGVyW2NvbG9yUG9zaXRpb24gKyBpdGVtSW5kZXhdLCBpLCB0cnVlKVxuICAgICAgICAgICAgICB0aGlzLmRyYXdEYXRhTGFiZWxQb3NpdGlvbihsYWJlbCwgbGF5ZXIuaXNTZWNvbmRhcnksIHN0YXJ0WCwgZW5kWCwgc3RhcnRZLCBlbmRZKVxuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIGRyYXdMaW5lKGNhbnZhcywgbGF5ZXIsIGNvbG9yUG9zaXRpb24sIGRyYXdQYXRoID0gdHJ1ZSkge1xuICAgIHZhciBjaGFydFBhZGRpbmdMZWZ0ID0gdGhpcy5jaGFydFBhZGRpbmdMZWZ0XG4gICAgdmFyIGNoYXJ0UGFkZGluZ1RvcCA9IHRoaXMuY2hhcnRQYWRkaW5nVG9wXG4gICAgdmFyIGNoYXJ0UGFkZGluZ0JvdHRvbSA9IHRoaXMuY2hhcnRQYWRkaW5nQm90dG9tXG4gICAgdmFyIGlzSG9yaXpvbnRhbCA9IHRoaXMuaXNIb3Jpem9udGFsXG4gICAgdmFyIGNoYXJ0Q29udGVudEhlaWdodCA9IHRoaXMuZ2V0Q2hhcnRDb250ZW50SGVpZ2h0KClcbiAgICB2YXIgY2hhcnRDb250ZW50V2lkdGggPSB0aGlzLmdldENoYXJ0Q29udGVudFdpZHRoKClcbiAgICB2YXIgY29udGVudFdpZHRoID0gdGhpcy5nZXRDb250ZW50V2lkdGgoKVxuICAgIHZhciBwcm9jZXNzID0gdGhpcy5wcm9jZXNzXG4gICAgdmFyIHNpemUgPSBsYXllci5kYXRhLmxlbmd0aFxuICAgIHZhciBwcmVJdGVtV2lkdGggPSBjb250ZW50V2lkdGggLyAoc2l6ZSArIDAuMilcblxuICAgIHZhciBtYXggPSBsYXllci5pc1NlY29uZGFyeSA/IHRoaXMubWF4U2Vjb25kYXJ5VmFsdWUgOiB0aGlzLm1heFZhbHVlXG4gICAgdmFyIG1pbiA9IGxheWVyLmlzU2Vjb25kYXJ5ID8gdGhpcy5taW5TZWNvbmRhcnlWYWx1ZSA6IHRoaXMubWluVmFsdWVcbiAgICB2YXIgdmFsdWVMZW4gPSBtYXggLSBtaW5cblxuICAgIHZhciBkcmF3U2l6ZSA9IHNpemUgKiBwcm9jZXNzXG5cbiAgICB2YXIgYmFzZVZhbHVlID0gbWluID4gMCA/IG1pbiA6IDBcbiAgICB2YXIgYmFzZVBvc2l0aW9uXG4gICAgaWYgKGlzSG9yaXpvbnRhbCkge1xuICAgICAgYmFzZVBvc2l0aW9uID0gY2hhcnRQYWRkaW5nTGVmdCArIChiYXNlVmFsdWUgLSBtaW4pIC8gdmFsdWVMZW4gKiBjaGFydENvbnRlbnRXaWR0aFxuICAgIH0gZWxzZSB7XG4gICAgICBiYXNlUG9zaXRpb24gPSBjaGFydFBhZGRpbmdUb3AgKyAobWF4IC0gYmFzZVZhbHVlKSAvIHZhbHVlTGVuICogY2hhcnRDb250ZW50SGVpZ2h0XG4gICAgfVxuXG4gICAgY2FudmFzLnNldExpbmVXaWR0aCh0aGlzLmxpbmVXaWR0aClcblxuICAgIHZhciBzdGFydExpc3RzID0gW11cbiAgICB2YXIgc3ViU2l6ZSA9IGxheWVyLmRhdGFbMF0uc3ViRGF0YS5sZW5ndGhcbiAgICBmb3IgKHZhciBqID0gMDsgaiA8IHN1YlNpemU7IGorKykge1xuICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBkcmF3U2l6ZTsgaSsrKSB7XG4gICAgICAgIHZhciBlbnRyeSA9IGxheWVyLmRhdGFbaV1cbiAgICAgICAgdmFyIHN1YkVudHJ5ID0gZW50cnkuc3ViRGF0YVtqXVxuXG4gICAgICAgIGlmIChzdWJFbnRyeSA9PSBudWxsIHx8IHN1YkVudHJ5ID09IHVuZGVmaW5lZCkge1xuICAgICAgICAgIHN0YXJ0TGlzdHNbaiAqIDJdID0gbnVsbFxuICAgICAgICAgIHN0YXJ0TGlzdHNbaiAqIDIgKyAxXSA9IG51bGxcbiAgICAgICAgICBjb250aW51ZVxuICAgICAgICB9XG5cbiAgICAgICAgdmFyIGNvbG9yID0gdGhpcy5nZXRDb2xvcihjb2xvclBvc2l0aW9uICsgailcbiAgICAgICAgY2FudmFzLnNldEZpbGxTdHlsZShjb2xvcilcblxuICAgICAgICB2YXIgeCwgeVxuICAgICAgICBpZihpc0hvcml6b250YWwpIHtcbiAgICAgICAgICB4ID0gY2hhcnRQYWRkaW5nTGVmdCArIChzdWJFbnRyeSAtIGJhc2VWYWx1ZSkgLyB2YWx1ZUxlbiAqIGNoYXJ0Q29udGVudFdpZHRoICogcHJvY2Vzc1xuICAgICAgICAgIHkgPSBjaGFydFBhZGRpbmdUb3AgKyBwcmVJdGVtV2lkdGggKiAoaSArIDAuNilcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICB4ID0gY2hhcnRQYWRkaW5nTGVmdCArIHByZUl0ZW1XaWR0aCAqIChpICsgMC42KVxuICAgICAgICAgIHkgPSBiYXNlUG9zaXRpb24gLSAoc3ViRW50cnkgLSBiYXNlVmFsdWUpIC8gdmFsdWVMZW4gKiBjaGFydENvbnRlbnRIZWlnaHQgKiBwcm9jZXNzXG4gICAgICAgIH1cblxuICAgICAgICBjYW52YXMuYmVnaW5QYXRoKClcbiAgICAgICAgY2FudmFzLmFyYyh4LCB5LCB0aGlzLmNpcmNsZVJhZGl1cywgMCwgMiAqIE1hdGguUEkpXG4gICAgICAgIGNhbnZhcy5maWxsKClcbiAgICAgICAgY2FudmFzLmNsb3NlUGF0aCgpXG4gICAgICAgIGlmIChpID4gMCAmJiBkcmF3UGF0aCkge1xuICAgICAgICAgIHZhciB4MSA9IHN0YXJ0TGlzdHNbaiAqIDJdIHx8IDBcbiAgICAgICAgICB2YXIgeTEgPSBzdGFydExpc3RzW2ogKiAyICsgMV0gfHwgMFxuXG4gICAgICAgICAgaWYgKHgxICYmIHkxKSB7XG4gICAgICAgICAgICBjYW52YXMuc2V0U3Ryb2tlU3R5bGUoY29sb3IpXG4gICAgICAgICAgICBjYW52YXMubW92ZVRvKHgxLCB5MSlcbiAgICAgICAgICAgIGNhbnZhcy5saW5lVG8oeCwgeSlcbiAgICAgICAgICAgIGNhbnZhcy5zdHJva2UoKVxuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBzdGFydExpc3RzW2ogKiAyXSA9IHhcbiAgICAgICAgc3RhcnRMaXN0c1tqICogMiArIDFdID0geVxuXG4gICAgICAgIGlmICgobGF5ZXIuaXNTZWNvbmRhcnkgPyB0aGlzLmRyYXdFeHRyYURhdGFMYWJlbCA6IHRoaXMuZHJhd0RhdGFMYWJlbCkgJiYgcHJvY2VzcyA9PSAxKSB7XG4gICAgICAgICAgbGV0IGRhdGFMYWJlbFBhZGRpbmcgPSB0aGlzLmRhdGFMYWJlbFBhZGRpbmdcbiAgICAgICAgICBsZXQgZGF0YUxhYmVsRm9udFNpemUgPSB0aGlzLmRhdGFMYWJlbEZvbnRTaXplXG5cbiAgICAgICAgICB2YXIgbGFiZWwgPSB0aGlzLmRhdGFsYWJlbENhbGxCYWNrKHRoaXMuZHJhd09yZGVyW2NvbG9yUG9zaXRpb24gKyBqXSwgaSwgdHJ1ZSlcbiAgICAgICAgICB2YXIgbGFiZWxXaWR0aCA9IGNhbnZhcy5teU1lYXN1cmVUZXh0KGxhYmVsLCBkYXRhTGFiZWxGb250U2l6ZSlcbiAgICAgICAgICB0aGlzLmFkZERhdGFMYWJlbChsYWJlbCwgeCAtIGxhYmVsV2lkdGggLyAyLCB5IC0gZGF0YUxhYmVsUGFkZGluZywgbGFiZWxXaWR0aClcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cblxuICAgIGlmICh0aGlzLmhpZ2hMaWdodEluZGV4ID49IDApIHtcbiAgICAgIHZhciBlbnRyeSA9IGxheWVyLmRhdGFbdGhpcy5oaWdoTGlnaHRJbmRleF1cbiAgICAgIHZhciBzdWJTaXplID0gZW50cnkuc3ViRGF0YS5sZW5ndGhcbiAgICAgIGZvciAodmFyIGogPSAwOyBqIDwgc3ViU2l6ZTsgaisrKSB7XG4gICAgICAgIHZhciBzdWJFbnRyeSA9IGVudHJ5LnN1YkRhdGFbal1cbiAgICAgICAgdmFyIHgsIHlcbiAgICAgICAgaWYgKGlzSG9yaXpvbnRhbCkge1xuICAgICAgICAgIHggPSBjaGFydFBhZGRpbmdMZWZ0ICsgKHN1YkVudHJ5IC0gYmFzZVZhbHVlKSAvIHZhbHVlTGVuICogY2hhcnRDb250ZW50V2lkdGggKiBwcm9jZXNzXG4gICAgICAgICAgeSA9IGNoYXJ0UGFkZGluZ1RvcCArIHByZUl0ZW1XaWR0aCAqICh0aGlzLmhpZ2hMaWdodEluZGV4ICsgMC42KVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHggPSBjaGFydFBhZGRpbmdMZWZ0ICsgcHJlSXRlbVdpZHRoICogKHRoaXMuaGlnaExpZ2h0SW5kZXggKyAwLjYpXG4gICAgICAgICAgeSA9IHRoaXMuaGVpZ2h0IC0gY2hhcnRQYWRkaW5nQm90dG9tIC0gKHN1YkVudHJ5IC0gbWluKSAvIHZhbHVlTGVuICogY2hhcnRDb250ZW50SGVpZ2h0ICogcHJvY2Vzc1xuICAgICAgICB9XG5cbiAgICAgICAgY2FudmFzLnNldEZpbGxTdHlsZSh0aGlzLmhpZ2hMaWdodENvbG9yKVxuICAgICAgICBjYW52YXMuYmVnaW5QYXRoKClcbiAgICAgICAgY2FudmFzLmFyYyh4LCB5LCB0aGlzLmNpcmNsZVJhZGl1cyAqIDEuNSwgMCwgMiAqIE1hdGguUEkpXG4gICAgICAgIGNhbnZhcy5maWxsKClcbiAgICAgICAgY2FudmFzLmNsb3NlUGF0aCgpXG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgZHJhd0dyb3VwKGNhbnZhcywgbGF5ZXIsIGNvbG9yUG9zaXRpb24pIHtcbiAgICB2YXIgY2hhcnRQYWRkaW5nTGVmdCA9IHRoaXMuY2hhcnRQYWRkaW5nTGVmdFxuICAgIHZhciBjaGFydFBhZGRpbmdUb3AgPSB0aGlzLmNoYXJ0UGFkZGluZ1RvcFxuICAgIHZhciBpc0hvcml6b250YWwgPSB0aGlzLmlzSG9yaXpvbnRhbFxuICAgIHZhciBjaGFydENvbnRlbnRIZWlnaHQgPSB0aGlzLmdldENoYXJ0Q29udGVudEhlaWdodCgpXG4gICAgdmFyIGNoYXJ0Q29udGVudFdpZHRoID0gdGhpcy5nZXRDaGFydENvbnRlbnRXaWR0aCgpXG4gICAgdmFyIGNvbnRlbnRXaWR0aCA9IHRoaXMuZ2V0Q29udGVudFdpZHRoKClcbiAgICB2YXIgcHJvY2VzcyA9IHRoaXMucHJvY2Vzc1xuICAgIHZhciBzaXplID0gbGF5ZXIuZGF0YS5sZW5ndGhcbiAgICB2YXIgcHJlQmFyV2lkdGggPSBjb250ZW50V2lkdGggLyAoc2l6ZSArIDAuMilcblxuICAgIHZhciBtYXggPSBsYXllci5pc1NlY29uZGFyeSA/IHRoaXMubWF4U2Vjb25kYXJ5VmFsdWUgOiB0aGlzLm1heFZhbHVlXG4gICAgdmFyIG1pbiA9IGxheWVyLmlzU2Vjb25kYXJ5ID8gdGhpcy5taW5TZWNvbmRhcnlWYWx1ZSA6IHRoaXMubWluVmFsdWVcbiAgICB2YXIgdmFsdWVMZW4gPSBtYXggLSBtaW5cblxuICAgIHZhciBkcmF3U2l6ZSA9IHNpemUgKiBwcm9jZXNzXG5cbiAgICB2YXIgemVyb1Bvc2l0aW9uXG4gICAgaWYgKGlzSG9yaXpvbnRhbCkge1xuICAgICAgemVyb1Bvc2l0aW9uID0gY2hhcnRQYWRkaW5nTGVmdCArICgwIC0gbWluKSAvIHZhbHVlTGVuICogY2hhcnRDb250ZW50V2lkdGhcbiAgICB9IGVsc2Uge1xuICAgICAgemVyb1Bvc2l0aW9uID0gY2hhcnRQYWRkaW5nVG9wICsgKG1heCAtIDApIC8gdmFsdWVMZW4gKiBjaGFydENvbnRlbnRIZWlnaHRcbiAgICB9XG4gICAgdmFyIHplcm9Qb3NpdGlvbk9mZnNldCA9IHplcm9Qb3NpdGlvbiAqICgxIC0gcHJvY2VzcylcblxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgZHJhd1NpemU7IGkrKykge1xuICAgICAgdmFyIGVudHJ5ID0gbGF5ZXIuZGF0YVtpXVxuXG4gICAgICB2YXIgcHJlR3JvdXBTaXplID0gZW50cnkuc3ViRGF0YSA/IGVudHJ5LnN1YkRhdGEubGVuZ3RoIDogMFxuICAgICAgaWYocHJlR3JvdXBTaXplID09IDApIHtcbiAgICAgICAgZW50cnkuc3ViRGF0YSA9IFtlbnRyeS52YWx1ZV1cbiAgICAgIH1cblxuICAgICAgdmFyIHByZVN1YkJhcldpZHRoID0gcHJlQmFyV2lkdGggKiAwLjggLyAocHJlR3JvdXBTaXplICsgMC4yKVxuICAgICAgZm9yICh2YXIgaiA9IDA7IGogPCBwcmVHcm91cFNpemU7IGorKykge1xuICAgICAgICB2YXIgc3ViRW50cnkgPSBlbnRyeS5zdWJEYXRhW2pdXG4gICAgICAgIGlmKHN1YkVudHJ5ID09IG51bGwgfHwgc3ViRW50cnkgPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgY29udGludWVcbiAgICAgICAgfVxuICAgICAgICB2YXIgY29sb3IgPSB0aGlzLmdldENvbG9yKGNvbG9yUG9zaXRpb24gKyBqKVxuICAgICAgICBjYW52YXMuc2V0RmlsbFN0eWxlKGNvbG9yKVxuXG4gICAgICAgIGlmKGlzSG9yaXpvbnRhbCkge1xuICAgICAgICAgIHZhciBzdGFydFggPSB6ZXJvUG9zaXRpb25cbiAgICAgICAgICB2YXIgZW5kWCA9IChjaGFydFBhZGRpbmdMZWZ0ICsgKHN1YkVudHJ5IC0gbWluKSAvIHZhbHVlTGVuICogY2hhcnRDb250ZW50V2lkdGgpICogcHJvY2VzcyArIHplcm9Qb3NpdGlvbk9mZnNldFxuICAgICAgICAgIHZhciBzdGFydFkgPSBjaGFydFBhZGRpbmdUb3AgKyBwcmVCYXJXaWR0aCAqIChpICsgMC4xICsgMC4xKSArIHByZVN1YkJhcldpZHRoICogKGogKyAwLjA1ICsgMC4xKVxuICAgICAgICAgIHZhciBlbmRZID0gc3RhcnRZICsgcHJlU3ViQmFyV2lkdGggKiAwLjg1XG5cbiAgICAgICAgICBpZiAoZW5kWCA8IHN0YXJ0WCkge1xuICAgICAgICAgICAgdmFyIHRtcCA9IGVuZFhcbiAgICAgICAgICAgIGVuZFggPSBzdGFydFhcbiAgICAgICAgICAgIHN0YXJ0WCA9IHRtcFxuICAgICAgICAgIH1cblxuICAgICAgICAgIGNhbnZhcy5maWxsUmVjdChzdGFydFgsIHN0YXJ0WSwgZW5kWCAtIHN0YXJ0WCwgZW5kWSAtIHN0YXJ0WSlcbiAgICAgICAgICBpZiAodGhpcy5oaWdoTGlnaHRJbmRleCA9PSBpKSB7XG4gICAgICAgICAgICBjYW52YXMuc2V0RmlsbFN0eWxlKHRoaXMuaGlnaExpZ2h0Q29sb3IpXG4gICAgICAgICAgICBjYW52YXMuZmlsbFJlY3Qoc3RhcnRYLCBzdGFydFksIGVuZFggLSBzdGFydFgsIGVuZFkgLSBzdGFydFkpXG4gICAgICAgICAgfVxuXG4gICAgICAgICAgaWYgKChsYXllci5pc1NlY29uZGFyeSA/IHRoaXMuZHJhd0V4dHJhRGF0YUxhYmVsIDogdGhpcy5kcmF3RGF0YUxhYmVsKSAmJiBwcm9jZXNzID09IDEpIHtcbiAgICAgICAgICAgIHZhciBsYWJlbCA9IHRoaXMuZGF0YWxhYmVsQ2FsbEJhY2sodGhpcy5kcmF3T3JkZXJbY29sb3JQb3NpdGlvbiArIGpdLCBpLCB0cnVlKVxuICAgICAgICAgICAgdGhpcy5kcmF3RGF0YUxhYmVsUG9zaXRpb24obGFiZWwsIGxheWVyLmlzU2Vjb25kYXJ5LCBzdGFydFgsIGVuZFgsIHN0YXJ0WSwgZW5kWSlcbiAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgdmFyIHN0YXJ0WCA9IGNoYXJ0UGFkZGluZ0xlZnQgKyBwcmVCYXJXaWR0aCAqIChpICsgMC4xICsgMC4xKSArIHByZVN1YkJhcldpZHRoICogKGogKyAwLjA1ICsgMC4xKVxuICAgICAgICAgIHZhciBlbmRYID0gc3RhcnRYICsgcHJlU3ViQmFyV2lkdGggKiAwLjg1XG4gICAgICAgICAgdmFyIHN0YXJ0WSA9IChjaGFydFBhZGRpbmdUb3AgKyAobWF4IC0gc3ViRW50cnkpIC8gdmFsdWVMZW4gKiBjaGFydENvbnRlbnRIZWlnaHQpICogcHJvY2VzcyArIHplcm9Qb3NpdGlvbk9mZnNldFxuICAgICAgICAgIHZhciBlbmRZID0gemVyb1Bvc2l0aW9uXG5cbiAgICAgICAgICBpZiAoZW5kWSA8IHN0YXJ0WSkge1xuICAgICAgICAgICAgdmFyIHRtcCA9IGVuZFlcbiAgICAgICAgICAgIGVuZFkgPSBzdGFydFlcbiAgICAgICAgICAgIHN0YXJ0WSA9IHRtcFxuICAgICAgICAgIH1cblxuICAgICAgICAgIGNhbnZhcy5maWxsUmVjdChzdGFydFgsIHN0YXJ0WSwgZW5kWCAtIHN0YXJ0WCwgZW5kWSAtIHN0YXJ0WSlcbiAgICAgICAgICBpZiAodGhpcy5oaWdoTGlnaHRJbmRleCA9PSBpKSB7XG4gICAgICAgICAgICBjYW52YXMuc2V0RmlsbFN0eWxlKHRoaXMuaGlnaExpZ2h0Q29sb3IpXG4gICAgICAgICAgICBjYW52YXMuZmlsbFJlY3Qoc3RhcnRYLCBzdGFydFksIGVuZFggLSBzdGFydFgsIGVuZFkgLSBzdGFydFkpXG4gICAgICAgICAgfVxuXG4gICAgICAgICAgaWYgKChsYXllci5pc1NlY29uZGFyeSA/IHRoaXMuZHJhd0V4dHJhRGF0YUxhYmVsIDogdGhpcy5kcmF3RGF0YUxhYmVsKSAmJiBwcm9jZXNzID09IDEpIHtcbiAgICAgICAgICAgIHZhciBsYWJlbCA9IHRoaXMuZGF0YWxhYmVsQ2FsbEJhY2sodGhpcy5kcmF3T3JkZXJbY29sb3JQb3NpdGlvbiArIGpdLCBpLCB0cnVlKVxuICAgICAgICAgICAgdGhpcy5kcmF3RGF0YUxhYmVsUG9zaXRpb24obGFiZWwsIGxheWVyLmlzU2Vjb25kYXJ5LCBzdGFydFgsIGVuZFgsIHN0YXJ0WSwgZW5kWSlcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBkcmF3RGF0YUxhYmVsUG9zaXRpb24obGFiZWwsIGlzU2Vjb25kYXJ5LCBzdGFydFgsIGVuZFgsIHN0YXJ0WSwgZW5kWSkge1xuICAgIGxldCBkYXRhTGFiZWxQYWRkaW5nID0gdGhpcy5kYXRhTGFiZWxQYWRkaW5nXG4gICAgbGV0IGRhdGFMYWJlbEZvbnRTaXplID0gdGhpcy5kYXRhTGFiZWxGb250U2l6ZVxuXG4gICAgdmFyIGxhYmVsV2lkdGggPSB0aGlzLmNhbnZhcy5teU1lYXN1cmVUZXh0KGxhYmVsLCBkYXRhTGFiZWxGb250U2l6ZSlcbiAgICB2YXIgeFxuICAgIHZhciB5XG4gICAgaWYgKHRoaXMuaXNIb3Jpem9udGFsKSB7XG4gICAgICB5ID0gKHN0YXJ0WSArIGVuZFkgKyBkYXRhTGFiZWxGb250U2l6ZSkgLyAyXG4gICAgICBzd2l0Y2ggKGlzU2Vjb25kYXJ5ID8gdGhpcy5leHRyYURhdGFsYWJlbFBvc2l0aW9uIDogdGhpcy5kYXRhTGFiZWxQb3NpdGlvbikge1xuICAgICAgICBjYXNlICdsZWZ0JzpcbiAgICAgICAgICB4ID0gc3RhcnRYICsgZGF0YUxhYmVsUGFkZGluZ1xuICAgICAgICAgIGJyZWFrXG4gICAgICAgIGNhc2UgJ3JpZ2h0JzpcbiAgICAgICAgICB4ID0gZW5kWCAtIGRhdGFMYWJlbFBhZGRpbmcgLSBsYWJlbFdpZHRoXG4gICAgICAgICAgYnJlYWtcbiAgICAgICAgY2FzZSAnb3V0c2lkZSc6XG4gICAgICAgICAgeCA9IGVuZFggKyBkYXRhTGFiZWxQYWRkaW5nXG4gICAgICAgICAgYnJlYWtcbiAgICAgICAgY2FzZSAnY2VudGVyJzpcbiAgICAgICAgICB4ID0gKHN0YXJ0WCArIGVuZFggLSBsYWJlbFdpZHRoKSAvIDJcbiAgICAgICAgICBicmVha1xuICAgICAgfVxuICAgICAgdGhpcy5hZGREYXRhTGFiZWwobGFiZWwsIHgsIHksIGxhYmVsV2lkdGgpXG4gICAgfSBlbHNlIHtcbiAgICAgIHggPSAoc3RhcnRYICsgZW5kWCAtIGxhYmVsV2lkdGgpIC8gMlxuICAgICAgc3dpdGNoIChpc1NlY29uZGFyeSA/IHRoaXMuZXh0cmFEYXRhbGFiZWxQb3NpdGlvbiA6IHRoaXMuZGF0YUxhYmVsUG9zaXRpb24pIHtcbiAgICAgICAgY2FzZSAnYm90dG9tJzpcbiAgICAgICAgICB5ID0gZW5kWSAtIGRhdGFMYWJlbFBhZGRpbmdcbiAgICAgICAgICBicmVha1xuICAgICAgICBjYXNlICd0b3AnOlxuICAgICAgICAgIHkgPSBzdGFydFkgKyBkYXRhTGFiZWxQYWRkaW5nICsgZGF0YUxhYmVsRm9udFNpemVcbiAgICAgICAgICBicmVha1xuICAgICAgICBjYXNlICdvdXRzaWRlJzpcbiAgICAgICAgICB5ID0gc3RhcnRZIC0gZGF0YUxhYmVsUGFkZGluZ1xuICAgICAgICAgIGJyZWFrXG4gICAgICAgIGNhc2UgJ21pZGRsZSc6XG4gICAgICAgICAgeSA9IChzdGFydFkgKyBlbmRZICsgZGF0YUxhYmVsRm9udFNpemUpIC8gMlxuICAgICAgICAgIGJyZWFrXG4gICAgICB9XG4gICAgfVxuICAgIHRoaXMuYWRkRGF0YUxhYmVsKGxhYmVsLCB4LCB5LCBsYWJlbFdpZHRoKVxuICB9XG5cbiAgZHJhd0F4aXMoY2FudmFzKSB7XG4gICAgdmFyIHByb2Nlc3MgPSB0aGlzLnByb2Nlc3NcbiAgICB2YXIgeTFUaWNrcyA9IHRoaXMueTFUaWNrc1xuICAgIHZhciB5MlRpY2tzID0gdGhpcy55MlRpY2tzXG4gICAgdmFyIHkxTGFiZWxDb3VudCA9IHkxVGlja3MubGVuZ3RoIC0gMVxuICAgIHZhciB5MkxhYmVsQ291bnQgPSB5MlRpY2tzLmxlbmd0aCAtIDFcbiAgICB2YXIgeExhYmVsQ291bnQgPSB0aGlzLnhMYWJlbENvdW50XG4gICAgdmFyIHhBeGlzRGF0YSA9IHRoaXMueEF4aXNEYXRhXG4gICAgdmFyIGF4aXNGb250U2l6ZSA9IHRoaXMuYXhpc0ZvbnRTaXplXG4gICAgdmFyIGF4aXNWYWx1ZVBhZGRpbmcgPSB0aGlzLmF4aXNWYWx1ZVBhZGRpbmdcbiAgICB2YXIgaXNIb3Jpem9udGFsID0gdGhpcy5pc0hvcml6b250YWxcblxuICAgIHZhciBjaGFydFBhZGRpbmdMZWZ0ID0gdGhpcy5jaGFydFBhZGRpbmdMZWZ0XG4gICAgdmFyIGNoYXJ0UGFkZGluZ1JpZ2h0ID0gdGhpcy5jaGFydFBhZGRpbmdSaWdodFxuICAgIHZhciBjaGFydFBhZGRpbmdUb3AgPSB0aGlzLmNoYXJ0UGFkZGluZ1RvcFxuICAgIHZhciBjaGFydFBhZGRpbmdCb3R0b20gPSB0aGlzLmNoYXJ0UGFkZGluZ0JvdHRvbVxuICAgIHZhciBjaGFydENvbnRlbnRIZWlnaHQgPSB0aGlzLmdldENvbnRlbnRIZWlnaHQoKVxuICAgIHZhciBjaGFydENvbnRlbnRXaWR0aCA9IHRoaXMuZ2V0Q29udGVudFdpZHRoKClcblxuICAgIHZhciBheGlzTGluZUNvbG9yID0gdGhpcy5heGlzTGluZUNvbG9yXG4gICAgdmFyIGF4aXNGb250Q29sb3IgPSB0aGlzLmF4aXNGb250Q29sb3JcbiAgICB2YXIgYXhpc0xpbmVXaWR0aCA9IHRoaXMuYXhpc0xpbmVXaWR0aFxuXG4gICAgY2FudmFzLnNldFN0cm9rZVN0eWxlKGF4aXNMaW5lQ29sb3IpXG4gICAgY2FudmFzLnNldEZpbGxTdHlsZShheGlzRm9udENvbG9yKVxuICAgIGNhbnZhcy5zZXRMaW5lV2lkdGgoYXhpc0xpbmVXaWR0aClcbiAgICBjYW52YXMuc2V0TGluZUpvaW4oJ21pdGVyJylcblxuICAgIGlmKGlzSG9yaXpvbnRhbCkge1xuICAgICAgY2FudmFzLmJlZ2luUGF0aCgpXG4gICAgICBjYW52YXMubW92ZVRvKGNoYXJ0UGFkZGluZ0xlZnQsIHRoaXMuaGVpZ2h0IC0gY2hhcnRQYWRkaW5nQm90dG9tKVxuICAgICAgY2FudmFzLmxpbmVUbyh0aGlzLndpZHRoIC0gY2hhcnRQYWRkaW5nUmlnaHQsIHRoaXMuaGVpZ2h0IC0gY2hhcnRQYWRkaW5nQm90dG9tKVxuICAgICAgY2FudmFzLnN0cm9rZSgpXG4gICAgICBpZiAodGhpcy5zZWNvbmRhcnlBeGlzRW5hYmxlKSB7XG4gICAgICAgIGNhbnZhcy5iZWdpblBhdGgoKVxuICAgICAgICBjYW52YXMubW92ZVRvKGNoYXJ0UGFkZGluZ0xlZnQsIGNoYXJ0UGFkZGluZ1RvcClcbiAgICAgICAgY2FudmFzLmxpbmVUbyh0aGlzLndpZHRoIC0gY2hhcnRQYWRkaW5nUmlnaHQsIGNoYXJ0UGFkZGluZ1RvcClcbiAgICAgICAgY2FudmFzLnN0cm9rZSgpXG4gICAgICB9XG4gICAgICB2YXIgcHJlWUl0ZW1TdGVwID0gY2hhcnRDb250ZW50SGVpZ2h0IC8geTFMYWJlbENvdW50XG4gICAgICBjYW52YXMuc2V0Rm9udFNpemUoYXhpc0ZvbnRTaXplKVxuICAgICAgZm9yICh2YXIgeSA9IDA7IHkgPD0geTFMYWJlbENvdW50OyB5KyspIHtcbiAgICAgICAgdmFyIGl0ZW1Qb3NpdGlvbiA9IGNoYXJ0UGFkZGluZ0xlZnQgKyBwcmVZSXRlbVN0ZXAgKiB5XG5cbiAgICAgICAgdmFyIGF4aXNJdGVtVGV4dCA9IHkxVGlja3NbeV1cbiAgICAgICAgdmFyIGF4aXNJdGVtVGV4dFdpZHRoID0gY2FudmFzLm15TWVhc3VyZVRleHQoYXhpc0l0ZW1UZXh0LCBheGlzRm9udFNpemUpXG4gICAgICAgIGNhbnZhcy5iZWdpblBhdGgoKVxuICAgICAgICBjYW52YXMubW92ZVRvKGl0ZW1Qb3NpdGlvbiwgY2hhcnRQYWRkaW5nVG9wKVxuICAgICAgICBjYW52YXMubGluZVRvKGl0ZW1Qb3NpdGlvbiwgdGhpcy5oZWlnaHQgLSBjaGFydFBhZGRpbmdCb3R0b20pXG4gICAgICAgIGNhbnZhcy5zdHJva2UoKVxuICAgICAgICBjYW52YXMuZmlsbFRleHQoYXhpc0l0ZW1UZXh0LCBpdGVtUG9zaXRpb24gLSBheGlzSXRlbVRleHRXaWR0aCAvIDIsIHRoaXMuaGVpZ2h0IC0gY2hhcnRQYWRkaW5nQm90dG9tICsgYXhpc1ZhbHVlUGFkZGluZyArIGF4aXNGb250U2l6ZSlcbiAgICAgIH1cbiAgICAgIGlmICh0aGlzLnNlY29uZGFyeUF4aXNFbmFibGUpIHtcbiAgICAgICAgdmFyIHByZVlJdGVtU3RlcCA9IGNoYXJ0Q29udGVudEhlaWdodCAvIHkyTGFiZWxDb3VudFxuICAgICAgICBmb3IgKHZhciB5ID0gMDsgeSA8PSB5MkxhYmVsQ291bnQ7IHkrKykge1xuICAgICAgICAgIHZhciBpdGVtUG9zaXRpb24gPSBjaGFydFBhZGRpbmdMZWZ0ICsgcHJlWUl0ZW1TdGVwICogeVxuXG4gICAgICAgICAgdmFyIGF4aXNJdGVtVGV4dCA9IHkyVGlja3NbeV1cbiAgICAgICAgICB2YXIgYXhpc0l0ZW1UZXh0V2lkdGggPSBjYW52YXMubXlNZWFzdXJlVGV4dChheGlzSXRlbVRleHQsIGF4aXNGb250U2l6ZSlcbiAgICAgICAgICBpZiAoeTJMYWJlbENvdW50ICE9IHkxTGFiZWxDb3VudCkge1xuICAgICAgICAgICAgY2FudmFzLmJlZ2luUGF0aCgpXG4gICAgICAgICAgICBjYW52YXMubW92ZVRvKGl0ZW1Qb3NpdGlvbiwgY2hhcnRQYWRkaW5nVG9wKVxuICAgICAgICAgICAgY2FudmFzLmxpbmVUbyhpdGVtUG9zaXRpb24sIHRoaXMuaGVpZ2h0IC0gY2hhcnRQYWRkaW5nQm90dG9tKVxuICAgICAgICAgICAgY2FudmFzLnN0cm9rZSgpXG4gICAgICAgICAgfVxuICAgICAgICAgIGNhbnZhcy5maWxsVGV4dChheGlzSXRlbVRleHQsIGl0ZW1Qb3NpdGlvbiAtIGF4aXNJdGVtVGV4dFdpZHRoIC8gMiwgY2hhcnRQYWRkaW5nVG9wIC0gYXhpc1ZhbHVlUGFkZGluZylcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICAvL+iuoeeul3jmuLLmn5Ppq5jluqbnorDmkp5cblxuICAgICAgdmFyIHhBeGlzU2l6ZSA9IHhBeGlzRGF0YS5sZW5ndGhcbiAgICAgIHZhciBwcmVCYXJXaWR0aCA9IGNoYXJ0Q29udGVudFdpZHRoIC8gKHhBeGlzU2l6ZSArIDAuMilcbiAgICAgIHZhciBzdGVwID0gMVxuICAgICAgaWYgKHByZUJhcldpZHRoIDw9IGF4aXNGb250U2l6ZSkge1xuICAgICAgICBzdGVwID0gTWF0aC5mbG9vcihheGlzRm9udFNpemUgLyBwcmVCYXJXaWR0aCkgKyAoYXhpc0ZvbnRTaXplICUgcHJlQmFyV2lkdGggPiAwID8gMSA6IDApXG4gICAgICB9XG4gICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHhBeGlzU2l6ZTsgaSsrKSB7XG4gICAgICAgIGlmIChpICogc3RlcCA+PSB4QXhpc1NpemUpIHtcbiAgICAgICAgICBicmVha1xuICAgICAgICB9XG4gICAgICAgIHZhciBwb3NpdGlvbiA9IGkgKiBzdGVwXG4gICAgICAgIHZhciBsYWJlbCA9IHhBeGlzRGF0YVtwb3NpdGlvbl1cbiAgICAgICAgdmFyIGxhYmVsV2lkdGggPSBjYW52YXMubXlNZWFzdXJlVGV4dChsYWJlbCwgYXhpc0ZvbnRTaXplKVxuXG4gICAgICAgIGNhbnZhcy5maWxsVGV4dChsYWJlbCwgY2hhcnRQYWRkaW5nTGVmdCAtIGF4aXNWYWx1ZVBhZGRpbmcgLSBsYWJlbFdpZHRoLCBjaGFydFBhZGRpbmdUb3AgKyBwcmVCYXJXaWR0aCAqIChwb3NpdGlvbiArIDAuNikgKyBheGlzRm9udFNpemUgLyAyKVxuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICBjYW52YXMuYmVnaW5QYXRoKClcbiAgICAgIGNhbnZhcy5tb3ZlVG8oY2hhcnRQYWRkaW5nTGVmdCwgY2hhcnRQYWRkaW5nVG9wKVxuICAgICAgY2FudmFzLmxpbmVUbyhjaGFydFBhZGRpbmdMZWZ0LCB0aGlzLmhlaWdodCAtIGNoYXJ0UGFkZGluZ0JvdHRvbSlcbiAgICAgIGNhbnZhcy5zdHJva2UoKVxuICAgICAgaWYgKHRoaXMuc2Vjb25kYXJ5QXhpc0VuYWJsZSkge1xuICAgICAgICBjYW52YXMuYmVnaW5QYXRoKClcbiAgICAgICAgY2FudmFzLm1vdmVUbyh0aGlzLndpZHRoIC0gY2hhcnRQYWRkaW5nUmlnaHQsIGNoYXJ0UGFkZGluZ1RvcClcbiAgICAgICAgY2FudmFzLmxpbmVUbyh0aGlzLndpZHRoIC0gY2hhcnRQYWRkaW5nUmlnaHQsIHRoaXMuaGVpZ2h0IC0gY2hhcnRQYWRkaW5nQm90dG9tKVxuICAgICAgICBjYW52YXMuc3Ryb2tlKClcbiAgICAgIH1cblxuICAgICAgdmFyIHByZVlJdGVtU3RlcCA9IGNoYXJ0Q29udGVudEhlaWdodCAvIHkxTGFiZWxDb3VudFxuICAgICAgY2FudmFzLnNldEZvbnRTaXplKGF4aXNGb250U2l6ZSlcbiAgICAgIGZvciAodmFyIHkgPSAwOyB5IDw9IHkxTGFiZWxDb3VudDsgeSsrKSB7XG4gICAgICAgIHZhciBpdGVtUG9zaXRpb24gPSBjaGFydFBhZGRpbmdUb3AgKyBwcmVZSXRlbVN0ZXAgKiB5XG5cbiAgICAgICAgdmFyIGF4aXNJdGVtVGV4dCA9IHkxVGlja3NbeTFMYWJlbENvdW50IC0geV1cbiAgICAgICAgdmFyIGF4aXNJdGVtVGV4dFdpZHRoID0gY2FudmFzLm15TWVhc3VyZVRleHQoYXhpc0l0ZW1UZXh0LCBheGlzRm9udFNpemUpXG4gICAgICAgIGNhbnZhcy5iZWdpblBhdGgoKVxuICAgICAgICBjYW52YXMubW92ZVRvKGNoYXJ0UGFkZGluZ0xlZnQsIGl0ZW1Qb3NpdGlvbilcbiAgICAgICAgY2FudmFzLmxpbmVUbyh0aGlzLndpZHRoIC0gY2hhcnRQYWRkaW5nUmlnaHQsIGl0ZW1Qb3NpdGlvbilcbiAgICAgICAgY2FudmFzLnN0cm9rZSgpXG4gICAgICAgIGNhbnZhcy5maWxsVGV4dChheGlzSXRlbVRleHQsIGNoYXJ0UGFkZGluZ0xlZnQgLSBheGlzSXRlbVRleHRXaWR0aCAtIGF4aXNWYWx1ZVBhZGRpbmcsIGl0ZW1Qb3NpdGlvbiArIGF4aXNGb250U2l6ZSAvIDIpXG4gICAgICB9XG4gICAgICBpZiAodGhpcy5zZWNvbmRhcnlBeGlzRW5hYmxlKSB7XG4gICAgICAgIHZhciBwcmVZSXRlbVN0ZXAgPSBjaGFydENvbnRlbnRIZWlnaHQgLyB5MkxhYmVsQ291bnRcbiAgICAgICAgZm9yICh2YXIgeSA9IDA7IHkgPD0geTJMYWJlbENvdW50OyB5KyspIHtcbiAgICAgICAgICB2YXIgaXRlbVBvc2l0aW9uID0gY2hhcnRQYWRkaW5nVG9wICsgcHJlWUl0ZW1TdGVwICogeVxuXG4gICAgICAgICAgdmFyIGF4aXNJdGVtVGV4dCA9IHkyVGlja3NbeTJMYWJlbENvdW50IC0geV1cbiAgICAgICAgICB2YXIgYXhpc0l0ZW1UZXh0V2lkdGggPSBjYW52YXMubXlNZWFzdXJlVGV4dChheGlzSXRlbVRleHQsIGF4aXNGb250U2l6ZSlcbiAgICAgICAgICBpZiAoeTJMYWJlbENvdW50ICE9IHkxTGFiZWxDb3VudCkge1xuICAgICAgICAgICAgY2FudmFzLmJlZ2luUGF0aCgpXG4gICAgICAgICAgICBjYW52YXMubW92ZVRvKGNoYXJ0UGFkZGluZ0xlZnQsIGl0ZW1Qb3NpdGlvbilcbiAgICAgICAgICAgIGNhbnZhcy5saW5lVG8odGhpcy53aWR0aCAtIGNoYXJ0UGFkZGluZ1JpZ2h0LCBpdGVtUG9zaXRpb24pXG4gICAgICAgICAgICBjYW52YXMuc3Ryb2tlKClcbiAgICAgICAgICB9XG4gICAgICAgICAgY2FudmFzLmZpbGxUZXh0KGF4aXNJdGVtVGV4dCwgdGhpcy53aWR0aCAtIGNoYXJ0UGFkZGluZ1JpZ2h0ICsgYXhpc1ZhbHVlUGFkZGluZywgaXRlbVBvc2l0aW9uICsgYXhpc0ZvbnRTaXplIC8gMilcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICB2YXIgeEF4aXNTaXplID0geEF4aXNEYXRhLmxlbmd0aFxuICAgICAgdmFyIHByZUJhcldpZHRoID0gY2hhcnRDb250ZW50V2lkdGggLyAoeEF4aXNTaXplICsgMC4yKVxuICAgICAgLy/orqHnrpd45riy5p+T5a695bqm56Kw5pKeXG4gICAgICB2YXIgc3RlcCA9IDFcbiAgICAgIHZhciBsYWJlbFdpZHRoQXJyYXkgPSBbXVxuICAgICAgbGV0IGNyYXNoUGFkZGluZyA9IDVcbiAgICAgIGZvcig7IHN0ZXAgPCB4QXhpc1NpemUgLSAxOyBzdGVwKyspIHtcbiAgICAgICAgdmFyIGxhc3RMYWJlbEVuZCA9IDBcbiAgICAgICAgdmFyIGlzQ3Jhc2ggPSBmYWxzZVxuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHhBeGlzU2l6ZTsgaSs9IHN0ZXApIHtcbiAgICAgICAgICB2YXIgbGFiZWxXaWR0aCA9IGxhYmVsV2lkdGhBcnJheVtpXVxuICAgICAgICAgIGlmIChsYWJlbFdpZHRoID09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgbGFiZWxXaWR0aCA9IGNhbnZhcy5teU1lYXN1cmVUZXh0KHhBeGlzRGF0YVtpXSwgYXhpc0ZvbnRTaXplKVxuICAgICAgICAgICAgbGFiZWxXaWR0aEFycmF5W2ldID0gbGFiZWxXaWR0aFxuICAgICAgICAgIH1cbiAgICAgICAgICB2YXIgc3RhcnRYID0gcHJlQmFyV2lkdGggKiAoaSArIDAuNikgLSBsYWJlbFdpZHRoIC8gMlxuICAgICAgICAgIHZhciBlbmRYID0gcHJlQmFyV2lkdGggKiAoaSArIDAuNikgKyBsYWJlbFdpZHRoIC8gMlxuXG4gICAgICAgICAgaWYobGFzdExhYmVsRW5kID09IDApIHtcbiAgICAgICAgICAgIGxhc3RMYWJlbEVuZCA9IGVuZFhcbiAgICAgICAgICB9IGVsc2UgaWYgKGxhc3RMYWJlbEVuZCA+PSBzdGFydFggLSBjcmFzaFBhZGRpbmcpIHtcbiAgICAgICAgICAgIGlzQ3Jhc2ggPSB0cnVlXG4gICAgICAgICAgICBicmVha1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBsYXN0TGFiZWxFbmQgPSBlbmRYXG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGlmKCFpc0NyYXNoKSB7XG4gICAgICAgICAgYnJlYWtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCB4QXhpc1NpemU7IGkrKykge1xuICAgICAgICBpZiAoaSAqIHN0ZXAgPj0geEF4aXNTaXplKSB7XG4gICAgICAgICAgYnJlYWtcbiAgICAgICAgfVxuICAgICAgICB2YXIgcG9zaXRpb24gPSBpICogc3RlcFxuICAgICAgICB2YXIgbGFiZWwgPSB4QXhpc0RhdGFbcG9zaXRpb25dXG4gICAgICAgIHZhciBsYWJlbFdpZHRoID0gbGFiZWxXaWR0aEFycmF5W3Bvc2l0aW9uXSB8fCBjYW52YXMubXlNZWFzdXJlVGV4dChsYWJlbCwgYXhpc0ZvbnRTaXplKVxuXG4gICAgICAgIGNhbnZhcy5maWxsVGV4dChsYWJlbCwgY2hhcnRQYWRkaW5nTGVmdCArIHByZUJhcldpZHRoICogKHBvc2l0aW9uICsgMC42KSAtIGxhYmVsV2lkdGggLyAyLCB0aGlzLmhlaWdodCAtIGNoYXJ0UGFkZGluZ0JvdHRvbSArIGF4aXNWYWx1ZVBhZGRpbmcgKyBheGlzRm9udFNpemUpXG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgZHJhd1JlZnMoY2FudmFzKSB7XG4gICAgdmFyIG1heFZhbHVlID0gdGhpcy5tYXhWYWx1ZVxuICAgIHZhciBtaW5WYWx1ZSA9IHRoaXMubWluVmFsdWVcbiAgICB2YXIgbWF4U2Vjb25kYXJ5VmFsdWUgPSB0aGlzLm1heFNlY29uZGFyeVZhbHVlXG4gICAgdmFyIG1pblNlY29uZGFyeVZhbHVlID0gdGhpcy5taW5TZWNvbmRhcnlWYWx1ZVxuICAgIHZhciBheGlzRm9udFNpemUgPSB0aGlzLmF4aXNGb250U2l6ZVxuICAgIHZhciBheGlzTGluZVdpZHRoID0gdGhpcy5heGlzTGluZVdpZHRoXG4gICAgdmFyIGF4aXNWYWx1ZVBhZGRpbmcgPSB0aGlzLmF4aXNWYWx1ZVBhZGRpbmdcbiAgICB2YXIgZGFzaGVkTGluZVdpZHRoID0gdGhpcy5kYXNoZWRMaW5lV2lkdGhcbiAgICB2YXIgY2hhcnRQYWRkaW5nTGVmdCA9IHRoaXMuY2hhcnRQYWRkaW5nTGVmdFxuICAgIHZhciBjaGFydFBhZGRpbmdSaWdodCA9IHRoaXMuY2hhcnRQYWRkaW5nUmlnaHRcbiAgICB2YXIgY2hhcnRQYWRkaW5nVG9wID0gdGhpcy5jaGFydFBhZGRpbmdUb3BcbiAgICB2YXIgY2hhcnRQYWRkaW5nQm90dG9tID0gdGhpcy5jaGFydFBhZGRpbmdCb3R0b21cblxuICAgIHZhciBjaGFydENvbnRlbnRIZWlnaHQgPSB0aGlzLmdldENoYXJ0Q29udGVudEhlaWdodCgpXG4gICAgdmFyIGNoYXJ0Q29udGVudFdpZHRoID0gdGhpcy5nZXRDaGFydENvbnRlbnRXaWR0aCgpXG5cbiAgICB0aGlzLnkxUmVmcy5tYXAoKHJlZiwgaW5kZXgpID0+IHtcbiAgICAgIHZhciBsZWZ0WFxuICAgICAgdmFyIGNlbnRlclhcbiAgICAgIHZhciByaWdodFhcbiAgICAgIHZhciB0b3BZXG4gICAgICB2YXIgY2VudGVyWVxuICAgICAgdmFyIGJvdHRvbVlcbiAgICAgIGlmICh0aGlzLmlzSG9yaXpvbnRhbCkge1xuICAgICAgICB2YXIgeCA9IGNoYXJ0UGFkZGluZ0xlZnQgKyBjaGFydENvbnRlbnRXaWR0aCAvIChtYXhWYWx1ZSAtIG1pblZhbHVlKSAqIChyZWYudmFsdWUgLSBtaW5WYWx1ZSlcbiAgICAgICAgdmFyIGxhYmVsWU9mZnNldCA9IGluZGV4ICogKGF4aXNGb250U2l6ZSArIGF4aXNWYWx1ZVBhZGRpbmcgKiAxLjUpXG5cbiAgICAgICAgY2FudmFzLnNldExpbmVXaWR0aChheGlzTGluZVdpZHRoKVxuICAgICAgICBjYW52YXMuc2V0U3Ryb2tlU3R5bGUocmVmLmNvbG9yKVxuICAgICAgICB0aGlzLmRyYXdEYXNoZWRMaW5lKGNhbnZhcywgeCwgY2hhcnRQYWRkaW5nVG9wLCB4LCB0aGlzLmhlaWdodCAtIGNoYXJ0UGFkZGluZ0JvdHRvbSwgZGFzaGVkTGluZVdpZHRoKVxuXG4gICAgICAgIHZhciBsYWJlbFdpZHRoID0gY2FudmFzLm15TWVhc3VyZVRleHQocmVmLmxhYmVsLCBheGlzRm9udFNpemUpXG4gICAgICAgIGxlZnRYICAgPSB4IC0gbGFiZWxXaWR0aCAtIGF4aXNWYWx1ZVBhZGRpbmcgKiAyXG4gICAgICAgIGNlbnRlclggPSB4IC0gYXhpc1ZhbHVlUGFkZGluZ1xuICAgICAgICByaWdodFggID0geFxuICAgICAgICB0b3BZICAgID0gdGhpcy5oZWlnaHQgLSBjaGFydFBhZGRpbmdCb3R0b20gLSBsYWJlbFlPZmZzZXQgLSBheGlzRm9udFNpemUgLyAyIC0gYXhpc1ZhbHVlUGFkZGluZyAvIDJcbiAgICAgICAgY2VudGVyWSA9IHRoaXMuaGVpZ2h0IC0gY2hhcnRQYWRkaW5nQm90dG9tIC0gbGFiZWxZT2Zmc2V0XG4gICAgICAgIGJvdHRvbVkgPSB0aGlzLmhlaWdodCAtIGNoYXJ0UGFkZGluZ0JvdHRvbSAtIGxhYmVsWU9mZnNldCArIGF4aXNGb250U2l6ZSAvIDIgKyBheGlzVmFsdWVQYWRkaW5nIC8gMlxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdmFyIHkgPSB0aGlzLmhlaWdodCAtIGNoYXJ0UGFkZGluZ0JvdHRvbSAtIGNoYXJ0Q29udGVudEhlaWdodCAvIChtYXhWYWx1ZSAtIG1pblZhbHVlKSAqIChyZWYudmFsdWUgLSBtaW5WYWx1ZSlcblxuICAgICAgICBjYW52YXMuc2V0TGluZVdpZHRoKGF4aXNMaW5lV2lkdGgpXG4gICAgICAgIGNhbnZhcy5zZXRTdHJva2VTdHlsZShyZWYuY29sb3IpXG4gICAgICAgIHRoaXMuZHJhd0Rhc2hlZExpbmUoY2FudmFzLCBjaGFydFBhZGRpbmdMZWZ0LCB5LCB0aGlzLndpZHRoIC0gY2hhcnRQYWRkaW5nUmlnaHQsIHksIGRhc2hlZExpbmVXaWR0aClcblxuICAgICAgICB2YXIgbGFiZWxXaWR0aCA9IGNhbnZhcy5teU1lYXN1cmVUZXh0KHJlZi5sYWJlbCwgYXhpc0ZvbnRTaXplKVxuICAgICAgICBsZWZ0WCA9IGNoYXJ0UGFkZGluZ0xlZnQgLSBheGlzVmFsdWVQYWRkaW5nICogMiAtIGxhYmVsV2lkdGhcbiAgICAgICAgY2VudGVyWCA9IGNoYXJ0UGFkZGluZ0xlZnQgLSBheGlzVmFsdWVQYWRkaW5nICogMS41XG4gICAgICAgIHJpZ2h0WCA9IGNoYXJ0UGFkZGluZ0xlZnRcbiAgICAgICAgdG9wWSA9IHkgLSBheGlzRm9udFNpemUgLyAyIC0gYXhpc1ZhbHVlUGFkZGluZyAvIDJcbiAgICAgICAgY2VudGVyWSA9IHlcbiAgICAgICAgYm90dG9tWSA9IHkgKyBheGlzRm9udFNpemUgLyAyICsgYXhpc1ZhbHVlUGFkZGluZyAvIDJcbiAgICAgIH1cbiAgICAgIGlmICh0aGlzLmF4aXNFbmFibGUpIHtcbiAgICAgICAgY2FudmFzLmJlZ2luUGF0aCgpXG4gICAgICAgIGNhbnZhcy5tb3ZlVG8obGVmdFgsIHRvcFkpXG4gICAgICAgIGNhbnZhcy5saW5lVG8oY2VudGVyWCwgdG9wWSlcbiAgICAgICAgY2FudmFzLmxpbmVUbyhyaWdodFgsIGNlbnRlclkpXG4gICAgICAgIGNhbnZhcy5saW5lVG8oY2VudGVyWCwgYm90dG9tWSlcbiAgICAgICAgY2FudmFzLmxpbmVUbyhsZWZ0WCwgYm90dG9tWSlcbiAgICAgICAgY2FudmFzLmxpbmVUbyhsZWZ0WCwgdG9wWSlcbiAgICAgICAgY2FudmFzLnNldEZpbGxTdHlsZShyZWYuY29sb3IpXG4gICAgICAgIGNhbnZhcy5maWxsKClcbiAgICAgICAgY2FudmFzLmNsb3NlUGF0aCgpXG5cbiAgICAgICAgcmVmLmxlZnQgPSBsZWZ0WFxuICAgICAgICByZWYudG9wID0gdG9wWVxuICAgICAgICByZWYuY2VudGVyWCA9IGNlbnRlclhcbiAgICAgICAgcmVmLmNlbnRlclkgPSBjZW50ZXJZXG4gICAgICAgIHJlZi5yaWdodCA9IHJpZ2h0WFxuICAgICAgICByZWYuYm90dG9tID0gYm90dG9tWVxuXG4gICAgICAgIGNhbnZhcy5zZXRGaWxsU3R5bGUoJ3doaXRlJylcbiAgICAgICAgY2FudmFzLnNldEZvbnRTaXplKGF4aXNGb250U2l6ZSlcbiAgICAgICAgY2FudmFzLmZpbGxUZXh0KHJlZi5sYWJlbCwgbGVmdFggKyBheGlzVmFsdWVQYWRkaW5nIC8gMiwgdG9wWSArIGF4aXNWYWx1ZVBhZGRpbmcgLyAyICsgYXhpc0ZvbnRTaXplKVxuICAgICAgfVxuICAgIH0pXG5cbiAgICB0aGlzLnkyUmVmcy5tYXAoKHJlZiwgaW5kZXgpID0+IHtcbiAgICAgIHZhciBsZWZ0WFxuICAgICAgdmFyIGNlbnRlclhcbiAgICAgIHZhciByaWdodFhcbiAgICAgIHZhciB0b3BZXG4gICAgICB2YXIgY2VudGVyWVxuICAgICAgdmFyIGJvdHRvbVlcbiAgICAgIGlmICh0aGlzLmlzSG9yaXpvbnRhbCkge1xuICAgICAgICB2YXIgeCA9IGNoYXJ0UGFkZGluZ0xlZnQgKyBjaGFydENvbnRlbnRXaWR0aCAvIChtYXhTZWNvbmRhcnlWYWx1ZSAtIG1pblNlY29uZGFyeVZhbHVlKSAqIChyZWYudmFsdWUgLSBtaW5TZWNvbmRhcnlWYWx1ZSlcbiAgICAgICAgdmFyIGxhYmVsWU9mZnNldCA9IGluZGV4ICogKGF4aXNGb250U2l6ZSArIGF4aXNWYWx1ZVBhZGRpbmcgKiAxLjUpXG5cbiAgICAgICAgY2FudmFzLnNldExpbmVXaWR0aChheGlzTGluZVdpZHRoKVxuICAgICAgICBjYW52YXMuc2V0U3Ryb2tlU3R5bGUocmVmLmNvbG9yKVxuICAgICAgICB0aGlzLmRyYXdEYXNoZWRMaW5lKGNhbnZhcywgeCwgY2hhcnRQYWRkaW5nVG9wLCB4LCB0aGlzLmhlaWdodCAtIGNoYXJ0UGFkZGluZ0JvdHRvbSwgZGFzaGVkTGluZVdpZHRoKVxuXG4gICAgICAgIHZhciBsYWJlbFdpZHRoID0gY2FudmFzLm15TWVhc3VyZVRleHQocmVmLmxhYmVsLCBheGlzRm9udFNpemUpXG4gICAgICAgIGxlZnRYICAgPSB4XG4gICAgICAgIGNlbnRlclggPSB4ICsgYXhpc1ZhbHVlUGFkZGluZ1xuICAgICAgICByaWdodFggID0geCArIGxhYmVsV2lkdGggKyBheGlzVmFsdWVQYWRkaW5nICogMlxuICAgICAgICB0b3BZICAgID0gY2hhcnRQYWRkaW5nVG9wICsgbGFiZWxZT2Zmc2V0IC0gYXhpc0ZvbnRTaXplIC8gMiAtIGF4aXNWYWx1ZVBhZGRpbmcgLyAyXG4gICAgICAgIGNlbnRlclkgPSBjaGFydFBhZGRpbmdUb3AgKyBsYWJlbFlPZmZzZXRcbiAgICAgICAgYm90dG9tWSA9IGNoYXJ0UGFkZGluZ1RvcCArIGxhYmVsWU9mZnNldCArIGF4aXNGb250U2l6ZSAvIDIgKyBheGlzVmFsdWVQYWRkaW5nIC8gMlxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdmFyIHkgPSB0aGlzLmhlaWdodCAtIGNoYXJ0UGFkZGluZ0JvdHRvbSAtIGNoYXJ0Q29udGVudEhlaWdodCAvIChtYXhTZWNvbmRhcnlWYWx1ZSAtIG1pblNlY29uZGFyeVZhbHVlKSAqIChyZWYudmFsdWUgLSBtaW5TZWNvbmRhcnlWYWx1ZSlcblxuICAgICAgICBjYW52YXMuc2V0TGluZVdpZHRoKGF4aXNMaW5lV2lkdGgpXG4gICAgICAgIGNhbnZhcy5zZXRTdHJva2VTdHlsZShyZWYuY29sb3IpXG4gICAgICAgIHRoaXMuZHJhd0Rhc2hlZExpbmUoY2FudmFzLCBjaGFydFBhZGRpbmdMZWZ0LCB5LCB0aGlzLndpZHRoIC0gY2hhcnRQYWRkaW5nUmlnaHQsIHksIGRhc2hlZExpbmVXaWR0aClcblxuICAgICAgICB2YXIgbGFiZWxXaWR0aCA9IGNhbnZhcy5teU1lYXN1cmVUZXh0KHJlZi5sYWJlbCwgYXhpc0ZvbnRTaXplKVxuICAgICAgICBsZWZ0WCAgID0gdGhpcy53aWR0aCAtIGNoYXJ0UGFkZGluZ1JpZ2h0XG4gICAgICAgIGNlbnRlclggPSB0aGlzLndpZHRoIC0gY2hhcnRQYWRkaW5nUmlnaHQgKyBheGlzVmFsdWVQYWRkaW5nXG4gICAgICAgIHJpZ2h0WCAgPSB0aGlzLndpZHRoIC0gY2hhcnRQYWRkaW5nUmlnaHQgKyBsYWJlbFdpZHRoICsgYXhpc1ZhbHVlUGFkZGluZyAqIDJcbiAgICAgICAgdG9wWSAgICA9IHkgLSBheGlzRm9udFNpemUgLyAyIC0gYXhpc1ZhbHVlUGFkZGluZyAvIDJcbiAgICAgICAgY2VudGVyWSA9IHlcbiAgICAgICAgYm90dG9tWSA9IHkgKyBheGlzRm9udFNpemUgLyAyICsgYXhpc1ZhbHVlUGFkZGluZyAvIDJcbiAgICAgIH1cbiAgICAgIGlmICh0aGlzLmF4aXNFbmFibGUpIHtcbiAgICAgICAgY2FudmFzLmJlZ2luUGF0aCgpXG4gICAgICAgIGNhbnZhcy5tb3ZlVG8ocmlnaHRYLCAgIHRvcFkpXG4gICAgICAgIGNhbnZhcy5saW5lVG8oY2VudGVyWCwgIHRvcFkpXG4gICAgICAgIGNhbnZhcy5saW5lVG8obGVmdFgsICAgIGNlbnRlclkpXG4gICAgICAgIGNhbnZhcy5saW5lVG8oY2VudGVyWCwgIGJvdHRvbVkpXG4gICAgICAgIGNhbnZhcy5saW5lVG8ocmlnaHRYLCAgIGJvdHRvbVkpXG4gICAgICAgIGNhbnZhcy5saW5lVG8ocmlnaHRYLCAgIHRvcFkpXG4gICAgICAgIGNhbnZhcy5zZXRGaWxsU3R5bGUocmVmLmNvbG9yKVxuICAgICAgICBjYW52YXMuZmlsbCgpXG4gICAgICAgIGNhbnZhcy5jbG9zZVBhdGgoKVxuXG4gICAgICAgIHJlZi5sZWZ0ID0gbGVmdFhcbiAgICAgICAgcmVmLnRvcCA9IHRvcFlcbiAgICAgICAgcmVmLmNlbnRlclggPSBjZW50ZXJYXG4gICAgICAgIHJlZi5jZW50ZXJZID0gY2VudGVyWVxuICAgICAgICByZWYucmlnaHQgPSByaWdodFhcbiAgICAgICAgcmVmLmJvdHRvbSA9IGJvdHRvbVlcblxuICAgICAgICBjYW52YXMuc2V0RmlsbFN0eWxlKCd3aGl0ZScpXG4gICAgICAgIGNhbnZhcy5zZXRGb250U2l6ZShheGlzRm9udFNpemUpXG4gICAgICAgIGNhbnZhcy5maWxsVGV4dChyZWYubGFiZWwsIGxlZnRYICsgYXhpc1ZhbHVlUGFkZGluZyAqIDEuNSwgdG9wWSArIGF4aXNWYWx1ZVBhZGRpbmcgLyAyICsgYXhpc0ZvbnRTaXplKVxuICAgICAgfVxuICAgIH0pXG4gIH1cblxuICBkcmF3RGFzaGVkTGluZShjYW52YXMsIHgxLCB5MSwgeDIsIHkyLCBkYXNoTGVuZ3RoKSB7XG4gICAgdmFyIGRlbHRhWCA9IE1hdGguYWJzKHgyIC0geDEpXG4gICAgdmFyIGRlbHRhWSA9IE1hdGguYWJzKHkyIC0geTEpXG4gICAgdmFyIG51bURhc2hlcyA9IE1hdGguZmxvb3IoTWF0aC5zcXJ0KGRlbHRhWCAqIGRlbHRhWCArIGRlbHRhWSAqIGRlbHRhWSkgLyBkYXNoTGVuZ3RoKVxuICAgIGNhbnZhcy5iZWdpblBhdGgoKVxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgbnVtRGFzaGVzOyArK2kpIHtcbiAgICAgIGNhbnZhc1tpICUgMiA9PT0gMCA/ICdtb3ZlVG8nIDogJ2xpbmVUbyddKHgxICsgKGRlbHRhWCAvIG51bURhc2hlcykgKiBpLCB5MSArIChkZWx0YVkgLyBudW1EYXNoZXMpICogaSlcbiAgICB9XG4gICAgY2FudmFzLnN0cm9rZSgpXG4gICAgY2FudmFzLmNsb3NlUGF0aCgpXG4gIH1cblxuICBkcmF3TGVnZW5kKGNhbnZhcykge1xuICAgIHZhciBjaGFydFBhZGRpbmdMZWZ0ID0gdGhpcy5jaGFydFBhZGRpbmdMZWZ0XG4gICAgdmFyIGNoYXJ0UGFkZGluZ1JpZ2h0ID0gdGhpcy5jaGFydFBhZGRpbmdSaWdodFxuICAgIHZhciBjaGFydFBhZGRpbmdUb3AgPSB0aGlzLmNoYXJ0UGFkZGluZ1RvcFxuICAgIHZhciBjaGFydFBhZGRpbmdCb3R0b20gPSB0aGlzLmNoYXJ0UGFkZGluZ0JvdHRvbVxuICAgIHZhciBsZWdlbmRGb250U2l6ZSA9IHRoaXMubGVnZW5kRm9udFNpemVcbiAgICB2YXIgbGVnZW5kUGFkZGluZyA9IHRoaXMubGVnZW5kUGFkZGluZ1xuICAgIHZhciBsZWdlbmRUZXh0Q29sb3IgPSB0aGlzLmxlZ2VuZFRleHRDb2xvclxuXG4gICAgY2FudmFzLnNldEZvbnRTaXplKGxlZ2VuZEZvbnRTaXplKVxuXG4gICAgdmFyIGxlZ2VuZExpc3QgPSBbXVxuICAgIHRoaXMuZGF0YS5tYXAoKGxheWVyLCBpbmRleCkgPT4ge1xuICAgICAgaWYgKGxheWVyLnNlcmllc05hbWUpIHtcbiAgICAgICAgbGF5ZXIuc2VyaWVzTmFtZS5tYXAoKG5hbWUsIGluZGV4KSA9PiB7XG4gICAgICAgICAgbGVnZW5kTGlzdC5wdXNoKG5hbWUpXG4gICAgICAgIH0pXG4gICAgICB9IGVsc2Uge1xuICAgICAgICBsZWdlbmRMaXN0LnB1c2gobGF5ZXIubmFtZSlcbiAgICAgIH1cbiAgICB9KVxuICAgIHRoaXMubGVnZW5kTGlzdCA9IGxlZ2VuZExpc3RcblxuICAgIHZhciBsZWdlbmRXaWR0aCA9IDBcbiAgICB2YXIgaXNNdWx0aUxpbmUgPSBmYWxzZVxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgbGVnZW5kTGlzdC5sZW5ndGg7IGkrKykge1xuICAgICAgdmFyIGxlZ2VuZCA9IGxlZ2VuZExpc3RbaV1cbiAgICAgIGlmIChsZWdlbmRXaWR0aCA+IDApIHtcbiAgICAgICAgbGVnZW5kV2lkdGggKz0gbGVnZW5kRm9udFNpemVcbiAgICAgIH1cblxuICAgICAgbGVnZW5kV2lkdGggKz0gY2FudmFzLm15TWVhc3VyZVRleHQobGVnZW5kLCBsZWdlbmRGb250U2l6ZSkgKyBsZWdlbmRGb250U2l6ZSAqIDEuMlxuICAgICAgaWYgKGxlZ2VuZFdpZHRoID4gdGhpcy5nZXRDaGFydENvbnRlbnRXaWR0aCgpKSB7XG4gICAgICAgIGlzTXVsdGlMaW5lID0gdHJ1ZVxuICAgICAgfVxuICAgIH1cblxuICAgIHRoaXMubGVnZW5kV2lkdGggPSBsZWdlbmRXaWR0aFxuICAgIHRoaXMuaXNNdWx0aUxpbmUgPSBpc011bHRpTGluZVxuXG4gICAgaWYgKCFpc011bHRpTGluZSkge1xuICAgICAgdmFyIHN0YXJ0WCA9ICh0aGlzLndpZHRoIC0gbGVnZW5kV2lkdGgpIC8gMjtcbiAgICAgIHZhciBzdGFydFkgPSB0aGlzLmhlaWdodCAtIGxlZ2VuZFBhZGRpbmcgLSBsZWdlbmRGb250U2l6ZTtcbiAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgbGVnZW5kTGlzdC5sZW5ndGg7IGkrKykge1xuICAgICAgICB2YXIgbGVnZW5kID0gbGVnZW5kTGlzdFtpXVxuICAgICAgICB2YXIgdGV4dFdpZHRoID0gY2FudmFzLm15TWVhc3VyZVRleHQobGVnZW5kLCBsZWdlbmRGb250U2l6ZSlcbiAgICAgICAgaWYgKHN0YXJ0WCArIHRleHRXaWR0aCArIGxlZ2VuZEZvbnRTaXplICogMS4yID4gdGhpcy53aWR0aCAtIGNoYXJ0UGFkZGluZ1JpZ2h0KSB7XG4gICAgICAgICAgc3RhcnRYID0gY2hhcnRQYWRkaW5nTGVmdFxuICAgICAgICAgIHN0YXJ0WSArPSBsZWdlbmRGb250U2l6ZSAqIDEuNVxuICAgICAgICB9XG5cbiAgICAgICAgdmFyIHNlcmllc0NvbG9yID0gdGhpcy5nZXRDb2xvcihpKVxuICAgICAgICBjYW52YXMuc2V0RmlsbFN0eWxlKHNlcmllc0NvbG9yKVxuICAgICAgICBjYW52YXMuYmVnaW5QYXRoKClcbiAgICAgICAgY2FudmFzLmFyYyhzdGFydFggKyBsZWdlbmRGb250U2l6ZSAvIDIsIHN0YXJ0WSArIGxlZ2VuZEZvbnRTaXplIC8gMiwgbGVnZW5kRm9udFNpemUgLyAyLCAwLCAyICogTWF0aC5QSSlcbiAgICAgICAgY2FudmFzLmZpbGwoKVxuICAgICAgICBjYW52YXMuY2xvc2VQYXRoKClcblxuICAgICAgICBzdGFydFggKz0gbGVnZW5kRm9udFNpemUgKiAxLjJcbiAgICAgICAgaWYodGhpcy5pc0hpZGRlblNlcmllcyhpKSkge1xuICAgICAgICAgIGNhbnZhcy5zZXRGaWxsU3R5bGUoc2VyaWVzQ29sb3IpXG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgY2FudmFzLnNldEZpbGxTdHlsZShsZWdlbmRUZXh0Q29sb3IpXG4gICAgICAgIH1cbiAgICAgICAgY2FudmFzLmZpbGxUZXh0KGxlZ2VuZCwgc3RhcnRYLCBzdGFydFkgKyBsZWdlbmRGb250U2l6ZSlcblxuICAgICAgICBzdGFydFggKz0gdGV4dFdpZHRoICsgbGVnZW5kRm9udFNpemVcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgdmFyIHN0YXJ0WCA9IGNoYXJ0UGFkZGluZ0xlZnRcbiAgICAgIHZhciBzdGFydFkgPSB0aGlzLmhlaWdodCAtIGxlZ2VuZFBhZGRpbmcgLSBsZWdlbmRGb250U2l6ZVxuXG4gICAgICBpZiAoc3RhcnRYICsgbGVnZW5kRm9udFNpemUgKiAxLjIgKiBsZWdlbmRMaXN0Lmxlbmd0aCA+IHRoaXMud2lkdGgpIHtcbiAgICAgICAgLy9sZWdlbmTmlbDph4/ov4flpJpcbiAgICAgICAgY2FudmFzLnNldEZpbGxTdHlsZSh0aGlzLmdldENvbG9yKDApKVxuICAgICAgICBjYW52YXMuZmlsbFJlY3Qoc3RhcnRYLCBzdGFydFksIGxlZ2VuZEZvbnRTaXplLCBsZWdlbmRGb250U2l6ZSlcbiAgICAgICAgc3RhcnRYICs9IGxlZ2VuZEZvbnRTaXplICogMS4yXG5cbiAgICAgICAgdmFyIGJldHdlZW5UZXh0ID0gXCJ+XCJcbiAgICAgICAgdmFyIGJ0d1RleHRXaWR0aCA9IGNhbnZhcy5teU1lYXN1cmVUZXh0KGJldHdlZW5UZXh0LCBsZWdlbmRGb250U2l6ZSlcbiAgICAgICAgY2FudmFzLnNldEZpbGxTdHlsZShsZWdlbmRUZXh0Q29sb3IpXG4gICAgICAgIGNhbnZhcy5maWxsVGV4dChiZXR3ZWVuVGV4dCwgc3RhcnRYLCBzdGFydFkgKyBsZWdlbmRGb250U2l6ZSlcbiAgICAgICAgc3RhcnRYICs9IGJ0d1RleHRXaWR0aCArIGxlZ2VuZEZvbnRTaXplICogMC4yXG5cbiAgICAgICAgY2FudmFzLnNldEZpbGxTdHlsZSh0aGlzLmdldENvbG9yKGxlZ2VuZExpc3QubGVuZ3RoIC0gMSkpXG4gICAgICAgIGNhbnZhcy5maWxsUmVjdChzdGFydFgsIHN0YXJ0WSwgbGVnZW5kRm9udFNpemUsIGxlZ2VuZEZvbnRTaXplKVxuICAgICAgICBzdGFydFggKz0gbGVnZW5kRm9udFNpemUgKiAxLjJcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgbGVnZW5kTGlzdC5sZW5ndGg7IGkrKykge1xuICAgICAgICAgIGNhbnZhcy5zZXRGaWxsU3R5bGUodGhpcy5nZXRDb2xvcihpKSlcbiAgICAgICAgICBjYW52YXMuZmlsbFJlY3Qoc3RhcnRYLCBzdGFydFksIGxlZ2VuZEZvbnRTaXplLCBsZWdlbmRGb250U2l6ZSlcbiAgICAgICAgICBzdGFydFggKz0gbGVnZW5kRm9udFNpemUgKiAxLjJcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgc3RhcnRYICs9IGxlZ2VuZEZvbnRTaXplICogMC4zXG4gICAgICB2YXIgc2ltcGxlVGV4dCA9IGAke2xlZ2VuZExpc3RbMF19fiR7bGVnZW5kTGlzdFtsZWdlbmRMaXN0Lmxlbmd0aCAtIDFdfWBcbiAgICAgIHZhciBzcFRleHRXaWR0aCA9IGNhbnZhcy5teU1lYXN1cmVUZXh0KHNpbXBsZVRleHQsIGxlZ2VuZEZvbnRTaXplKVxuICAgICAgY2FudmFzLnNldEZpbGxTdHlsZShsZWdlbmRUZXh0Q29sb3IpXG4gICAgICBjYW52YXMuZmlsbFRleHQoc2ltcGxlVGV4dCwgc3RhcnRYLCBzdGFydFkgKyBsZWdlbmRGb250U2l6ZSlcbiAgICB9XG4gIH1cblxuICBkcmF3Tm9EYXRhKGNhbnZhcykge1xuICAgIHZhciB0ZXh0ID0gdGhpcy5ub0RhdGFUZXh0XG4gICAgdmFyIHRleHRXaWR0aCA9IGNhbnZhcy5teU1lYXN1cmVUZXh0KHRleHQsIHRoaXMubm9EYXRhRm9udFNpemUpXG4gICAgY2FudmFzLnNldEZpbGxTdHlsZSh0aGlzLm5vRGF0YVRleHRDb2xvcilcbiAgICBjYW52YXMuZmlsbFRleHQodGV4dCwgKHRoaXMud2lkdGggLSB0ZXh0V2lkdGgpIC8gMiwgKHRoaXMuaGVpZ2h0ICsgdGhpcy5ub0RhdGFGb250U2l6ZSkgLyAyKVxuICB9XG59XG5tb2R1bGUuZXhwb3J0cyA9IE1peFxuIiwidmFyIGNoYXJ0VXRpbHMgPSByZXF1aXJlKCcuL2NoYXJ0VXRpbC5qcycpXG5jb25zdCB7QW5pbWF0aW9ufSA9IGNoYXJ0VXRpbHNcblxuY2xhc3MgS3BpIHtcbiAgY29uc3RydWN0b3Iob3B0cykge1xuICAgIGNvbnNvbGUubG9nKG9wdHMpXG4gICAgdGhpcy5jYW52YXMgPSBvcHRzLmNhbnZhc1xuICAgIHRoaXMud2lkdGggPSBvcHRzLndpZHRoXG4gICAgdGhpcy5oZWlnaHQgPSBvcHRzLmhlaWdodFxuXG4gICAgdGhpcy5jdXJyZW50TmFtZSA9IG9wdHMuY3VycmVudE5hbWVcbiAgICB0aGlzLmN1cnJlbnRWYWx1ZSA9IG9wdHMuY3VycmVudFZhbHVlXG4gICAgdGhpcy5jb21wYXJlTmFtZSA9IG9wdHMuY29tcGFyZU5hbWVcbiAgICB0aGlzLmNvbXBhcmVWYWx1ZSA9IG9wdHMuY29tcGFyZVZhbHVlXG4gICAgdGhpcy5pc0FyaXNlID0gb3B0cy5pc0FyaXNlXG5cbiAgICB0aGlzLmFyaXNlQ29sb3IgPSBvcHRzLmFyaXNlQ29sb3IgfHwgJyM2N0I1QTAnXG4gICAgdGhpcy5hcmlzZUltZyA9IG9wdHMuYXJpc2VJbWcgfHwgJy9pbWFnZXMvYXJpc2UuanBnJ1xuICAgIHRoaXMuZHJvcENvbG9yID0gb3B0cy5kcm9wQ29sb3IgfHwgJyNFQjdCNzMnXG4gICAgdGhpcy5kcm9wSW1nID0gb3B0cy5kcm9wSW1nIHx8ICcvaW1hZ2VzL2Ryb3AuanBnJ1xuXG4gICAgdGhpcy5jb2xvcjEgPSBvcHRzLmNvbG9yMSB8fCAnYmxhY2snXG4gICAgdGhpcy5jb2xvcjIgPSBvcHRzLmNvbG9yMiB8fCAnIzMzMzMzMydcbiAgICB0aGlzLmNvbG9yMyA9IG9wdHMuY29sb3IzIHx8ICcjNjY2NjY2J1xuXG4gICAgdGhpcy5ub0RhdGEgPSBvcHRzLm5vRGF0YSB8fCBmYWxzZVxuICAgIHRoaXMubm9EYXRhVGV4dCA9IG9wdHMubm9EYXRhVGV4dCB8fCAn5pqC5peg5pWw5o2uJ1xuICAgIHRoaXMubm9EYXRhVGV4dENvbG9yID0gb3B0cy5ub0RhdGFUZXh0Q29sb3IgfHwgJyM2OUI1RkMnXG4gICAgdGhpcy5ub0RhdGFGb250U2l6ZSA9IG9wdHMubm9EYXRhRm9udFNpemUgfHwgMTFcblxuICAgIHRoaXMuZm9udFNpemVMYXJnZSA9IG9wdHMuZm9udFNpemVMYXJnZSB8fCAzMFxuICAgIHRoaXMuZm9udFNpemVNZWRpdW0gPSBvcHRzLmZvbnRTaXplTWVkaXVtIHx8IDIyXG4gICAgdGhpcy5mb250U2l6ZVNtYWxsID0gb3B0cy5mb250U2l6ZVNtYWxsIHx8IDE2XG4gICAgdGhpcy50ZXh0UGFkZGluZyA9IG9wdHMudGV4dFBhZGRpbmcgfHwgMTBcblxuICAgIHRoaXMuZHJhdygpXG4gIH1cblxuICBzaG93VG9vbFRpcChlLCBpc01vdmUgPSBmYWxzZSkge1xuXG4gIH1cblxuICBoaWRkZW5IaWdoTGlnaHQoKSB7XG5cbiAgfVxuXG4gIGRyYXcoKSB7XG4gICAgdGhpcy5pc0RyYXdGaW5pc2ggPSBmYWxzZVxuICAgIHZhciBjYW52YXMgPSB0aGlzLmNhbnZhc1xuXG4gICAgaWYgKHRoaXMubm9EYXRhKSB7XG4gICAgICB0aGlzLmRyYXdOb0RhdGEoY2FudmFzKVxuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLmRyYXdWYWx1ZShjYW52YXMpXG4gICAgfVxuICAgIGNhbnZhcy5kcmF3KClcbiAgICB0aGlzLmlzRHJhd0ZpbmlzaCA9IHRydWVcbiAgfVxuXG4gIGRyYXdWYWx1ZShjYW52YXMpIHtcbiAgICB2YXIgbWF4VGV4dFdpZHRoXG4gICAgdmFyIHRleHRIZWlnaHQgPSB0aGlzLmZvbnRTaXplTGFyZ2UgKyB0aGlzLmZvbnRTaXplTWVkaXVtICsgdGhpcy5mb250U2l6ZVNtYWxsICsgdGhpcy50ZXh0UGFkZGluZyAqIDJcblxuICAgIHZhciBjdXJyZW50TmFtZVdpZHRoID0gY2FudmFzLm15TWVhc3VyZVRleHQodGhpcy5jdXJyZW50TmFtZSwgdGhpcy5mb250U2l6ZU1lZGl1bSlcbiAgICBtYXhUZXh0V2lkdGggPSBjdXJyZW50TmFtZVdpZHRoXG5cbiAgICB2YXIgY3VycmVudFZhbHVlV2lkdGggPSBjYW52YXMubXlNZWFzdXJlVGV4dCh0aGlzLmN1cnJlbnRWYWx1ZSwgdGhpcy5mb250U2l6ZUxhcmdlKVxuICAgIGlmIChtYXhUZXh0V2lkdGggPCBjdXJyZW50VmFsdWVXaWR0aCkge1xuICAgICAgbWF4VGV4dFdpZHRoID0gY3VycmVudFZhbHVlV2lkdGhcbiAgICB9XG5cbiAgICB2YXIgY29tcGFyZU5hbWVXaWR0aCA9IGNhbnZhcy5teU1lYXN1cmVUZXh0KHRoaXMuY29tcGFyZU5hbWUsIHRoaXMuZm9udFNpemVTbWFsbClcbiAgICB2YXIgY29tcGFyZVZhbHVlV2lkdGggPSBjYW52YXMubXlNZWFzdXJlVGV4dCh0aGlzLmNvbXBhcmVWYWx1ZSwgdGhpcy5mb250U2l6ZVNtYWxsKVxuICAgIGlmIChjb21wYXJlTmFtZVdpZHRoICsgY29tcGFyZVZhbHVlV2lkdGggKyB0aGlzLmZvbnRTaXplU21hbGwgKiAyLjUgPiBtYXhUZXh0V2lkdGgpIHtcbiAgICAgIG1heFRleHRXaWR0aCA9IGNvbXBhcmVOYW1lV2lkdGggKyBjb21wYXJlVmFsdWVXaWR0aCArIHRoaXMuZm9udFNpemVTbWFsbCAqIDIuNVxuICAgIH1cblxuICAgIHZhciB4ID0gKHRoaXMud2lkdGggLSBtYXhUZXh0V2lkdGgpIC8gMlxuICAgIGlmICh4IDwgdGhpcy50ZXh0UGFkZGluZykge1xuICAgICAgeCA9IHRoaXMudGV4dFBhZGRpbmdcbiAgICB9XG4gICAgdmFyIHN0YXJ0WSA9ICh0aGlzLmhlaWdodCAtIHRleHRIZWlnaHQpIC8gMlxuICAgIGlmIChzdGFydFkgPCB0aGlzLnRleHRQYWRkaW5nKSB7XG4gICAgICBzdGFydFkgPSB0aGlzLnRleHRQYWRkaW5nXG4gICAgfVxuXG4gICAgc3RhcnRZICs9IHRoaXMuZm9udFNpemVNZWRpdW1cbiAgICBjYW52YXMuc2V0RmlsbFN0eWxlKHRoaXMuY29sb3IxKVxuICAgIGNhbnZhcy5zZXRGb250U2l6ZSh0aGlzLmZvbnRTaXplTWVkaXVtKVxuICAgIGNhbnZhcy5maWxsVGV4dCh0aGlzLmN1cnJlbnROYW1lLCB4LCBzdGFydFkpXG5cbiAgICBzdGFydFkgKz0gdGhpcy5mb250U2l6ZUxhcmdlICsgdGhpcy50ZXh0UGFkZGluZ1xuICAgIGNhbnZhcy5zZXRGaWxsU3R5bGUodGhpcy5jb2xvcjMpXG4gICAgY2FudmFzLnNldEZvbnRTaXplKHRoaXMuZm9udFNpemVMYXJnZSlcbiAgICBjYW52YXMuZmlsbFRleHQodGhpcy5jdXJyZW50VmFsdWUsIHgsIHN0YXJ0WSlcblxuICAgIHN0YXJ0WSArPSB0aGlzLmZvbnRTaXplU21hbGwgKyB0aGlzLnRleHRQYWRkaW5nXG4gICAgY2FudmFzLnNldEZpbGxTdHlsZSh0aGlzLmNvbG9yMilcbiAgICBjYW52YXMuc2V0Rm9udFNpemUodGhpcy5mb250U2l6ZVNtYWxsKVxuICAgIGNhbnZhcy5maWxsVGV4dCh0aGlzLmNvbXBhcmVOYW1lLCB4LCBzdGFydFkpXG5cbiAgICBpZih0aGlzLmlzQXJpc2UpIHtcbiAgICAgIGNhbnZhcy5zZXRGaWxsU3R5bGUodGhpcy5hcmlzZUNvbG9yKVxuICAgICAgY2FudmFzLmRyYXdJbWFnZSh0aGlzLmFyaXNlSW1nLCB4ICsgY29tcGFyZU5hbWVXaWR0aCArIHRoaXMuZm9udFNpemVTbWFsbCwgc3RhcnRZIC0gdGhpcy5mb250U2l6ZVNtYWxsICogMC44LCB0aGlzLmZvbnRTaXplU21hbGwgKiAxLjIsIHRoaXMuZm9udFNpemVTbWFsbClcbiAgICB9IGVsc2Uge1xuICAgICAgY2FudmFzLnNldEZpbGxTdHlsZSh0aGlzLmRyb3BDb2xvcilcbiAgICAgIGNhbnZhcy5kcmF3SW1hZ2UodGhpcy5kcm9wSW1nLCB4ICsgY29tcGFyZU5hbWVXaWR0aCArIHRoaXMuZm9udFNpemVTbWFsbCwgc3RhcnRZIC0gdGhpcy5mb250U2l6ZVNtYWxsICogMC44LCB0aGlzLmZvbnRTaXplU21hbGwgKiAxLjIsIHRoaXMuZm9udFNpemVTbWFsbClcbiAgICB9XG4gICAgY2FudmFzLmZpbGxUZXh0KHRoaXMuY29tcGFyZVZhbHVlLCB4ICsgY29tcGFyZU5hbWVXaWR0aCArIHRoaXMuZm9udFNpemVTbWFsbCAqIDIuNSAsIHN0YXJ0WSlcbiAgfVxuXG4gIGRyYXdOb0RhdGEoY2FudmFzKSB7XG4gICAgdmFyIHRleHQgPSB0aGlzLm5vRGF0YVRleHRcbiAgICB2YXIgdGV4dFdpZHRoID0gY2FudmFzLm15TWVhc3VyZVRleHQodGV4dCwgdGhpcy5ub0RhdGFGb250U2l6ZSlcbiAgICBjYW52YXMuc2V0RmlsbFN0eWxlKHRoaXMubm9EYXRhVGV4dENvbG9yKVxuICAgIGNhbnZhcy5maWxsVGV4dCh0ZXh0LCAodGhpcy53aWR0aCAtIHRleHRXaWR0aCkgLyAyLCAodGhpcy5oZWlnaHQgKyB0aGlzLm5vRGF0YUZvbnRTaXplKSAvIDIpXG4gIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBLcGk7XG4iLCJ2YXIgY2hhcnRVdGlscyA9IHJlcXVpcmUoJy4vY2hhcnRVdGlsLmpzJylcbmNvbnN0IHtBbmltYXRpb259ID0gY2hhcnRVdGlsc1xuXG5jbGFzcyBTaW5nbGVWYWx1ZSB7XG4gIGNvbnN0cnVjdG9yKG9wdHMpIHtcbiAgICBjb25zb2xlLmxvZyhvcHRzKVxuICAgIHRoaXMuY2FudmFzID0gb3B0cy5jYW52YXNcbiAgICB0aGlzLndpZHRoID0gb3B0cy53aWR0aFxuICAgIHRoaXMuaGVpZ2h0ID0gb3B0cy5oZWlnaHRcblxuICAgIHRoaXMudGV4dCA9IG9wdHMudGV4dFxuICAgIHRoaXMudGV4dENvbG9yID0gb3B0cy50ZXh0Q29sb3IgfHwgJ2JsYWNrJ1xuXG4gICAgdGhpcy5ub0RhdGEgPSBvcHRzLm5vRGF0YSB8fCBmYWxzZVxuICAgIHRoaXMubm9EYXRhVGV4dCA9IG9wdHMubm9EYXRhVGV4dCB8fCAn5pqC5peg5pWw5o2uJ1xuICAgIHRoaXMubm9EYXRhVGV4dENvbG9yID0gb3B0cy5ub0RhdGFUZXh0Q29sb3IgfHwgJyM2OUI1RkMnXG4gICAgdGhpcy5ub0RhdGFGb250U2l6ZSA9IG9wdHMubm9EYXRhRm9udFNpemUgfHwgMTFcblxuICAgIHRoaXMuZm9udFNpemUgPSBvcHRzLmZvbnRTaXplIHx8IDMwXG5cbiAgICB0aGlzLmRyYXcoKVxuICB9XG5cbiAgc2hvd1Rvb2xUaXAoZSwgaXNNb3ZlID0gZmFsc2UpIHtcblxuICB9XG5cbiAgaGlkZGVuSGlnaExpZ2h0KCkge1xuXG4gIH1cblxuICBkcmF3KCkge1xuICAgIHRoaXMuaXNEcmF3RmluaXNoID0gZmFsc2VcbiAgICB2YXIgY2FudmFzID0gdGhpcy5jYW52YXNcblxuICAgIGlmICh0aGlzLm5vRGF0YSkge1xuICAgICAgdGhpcy5kcmF3Tm9EYXRhKGNhbnZhcylcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5kcmF3VmFsdWUoY2FudmFzKVxuICAgIH1cbiAgICBjYW52YXMuZHJhdygpXG4gICAgdGhpcy5pc0RyYXdGaW5pc2ggPSB0cnVlXG4gIH1cblxuICBkcmF3VmFsdWUoY2FudmFzKSB7XG4gICAgdmFyIHRleHRXaWR0aCA9IGNhbnZhcy5teU1lYXN1cmVUZXh0KHRoaXMudGV4dCwgdGhpcy5mb250U2l6ZSlcbiAgICB2YXIgdGV4dEhlaWdodCA9IHRoaXMuZm9udFNpemVcblxuICAgIHZhciB4ID0gKHRoaXMud2lkdGggLSB0ZXh0V2lkdGgpIC8gMlxuICAgIHZhciB5ID0gKHRoaXMuaGVpZ2h0IC0gdGV4dEhlaWdodCkgLyAyICsgdGhpcy5mb250U2l6ZVxuXG4gICAgY2FudmFzLnNldEZpbGxTdHlsZSh0aGlzLnRleHRDb2xvcilcbiAgICBjYW52YXMuc2V0Rm9udFNpemUodGhpcy5mb250U2l6ZSlcbiAgICBjYW52YXMuZmlsbFRleHQodGhpcy50ZXh0LCB4LCB5KVxuICB9XG5cbiAgZHJhd05vRGF0YShjYW52YXMpIHtcbiAgICB2YXIgdGV4dCA9IHRoaXMubm9EYXRhVGV4dFxuICAgIHZhciB0ZXh0V2lkdGggPSBjYW52YXMubXlNZWFzdXJlVGV4dCh0ZXh0LCB0aGlzLm5vRGF0YUZvbnRTaXplKVxuICAgIGNhbnZhcy5zZXRGaWxsU3R5bGUodGhpcy5ub0RhdGFUZXh0Q29sb3IpXG4gICAgY2FudmFzLmZpbGxUZXh0KHRleHQsICh0aGlzLndpZHRoIC0gdGV4dFdpZHRoKSAvIDIsICh0aGlzLmhlaWdodCArIHRoaXMubm9EYXRhRm9udFNpemUpIC8gMilcbiAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IFNpbmdsZVZhbHVlO1xuIiwidmFyIGNoYXJ0VXRpbHMgPSByZXF1aXJlKCcuL2NoYXJ0VXRpbC5qcycpXG5jb25zdCB7QW5pbWF0aW9ufSA9IGNoYXJ0VXRpbHNcblxuY2xhc3MgR2F1Z2Uge1xuICBjb25zdHJ1Y3RvcihvcHRzKSB7XG4gICAgY29uc29sZS5sb2cob3B0cylcblxuICAgIHRoaXMuY2FudmFzID0gb3B0cy5jYW52YXNcbiAgICB0aGlzLndpZHRoID0gb3B0cy53aWR0aFxuICAgIHRoaXMuaGVpZ2h0ID0gb3B0cy5oZWlnaHRcbiAgICB0aGlzLmNoYXJ0UGFkZGluZyA9IG9wdHMuY2hhcnRQYWRkaW5nIHx8IDQwXG4gICAgdGhpcy5yYWRpdXMgPSBNYXRoLm1pbih0aGlzLndpZHRoLCB0aGlzLmhlaWdodCkgLyAyIC0gdGhpcy5jaGFydFBhZGRpbmdcblxuICAgIHRoaXMubWF4VmFsdWUgPSBvcHRzLm1heFZhbHVlIHx8IDEwMFxuICAgIHRoaXMubWluVmFsdWUgPSBvcHRzLm1pblZhbHVlIHx8IDBcbiAgICB0aGlzLmN1clZhbHVlID0gb3B0cy5jdXJWYWx1ZSB8fCA1MFxuICAgIHRoaXMubWF4VmFsdWVUZXh0ID0gb3B0cy5tYXhWYWx1ZVRleHQgfHwgJzUwMCdcbiAgICB0aGlzLm1pblZhbHVlVGV4dCA9IG9wdHMubWluVmFsdWVUZXh0IHx8ICcwJ1xuICAgIHRoaXMuY3VyVmFsdWVUZXh0ID0gb3B0cy5jdXJWYWx1ZVRleHQgfHwgJzMwMCdcblxuICAgIHRoaXMudmFsdWVDb2xvciA9IG9wdHMudmFsdWVDb2xvciB8fCAnI0RGNTM1MydcbiAgICB0aGlzLmJhY2tncm91bmRDb2xvciA9IG9wdHMuYmFja2dyb3VuZENvbG9yIHx8ICd3aGl0ZSdcbiAgICB0aGlzLmJhY2tncm91bmRCYW5kQ29sb3IgPSBvcHRzLmJhY2tncm91bmRCYW5kQ29sb3IgfHwgJyNFRUVFRUUnXG4gICAgdGhpcy5saW1pdFRleHRDb2xvciA9IG9wdHMubGltaXRUZXh0Q29sb3IgfHwgJyMzMzMzMzMnXG5cbiAgICB0aGlzLnZhbHVlRm9udFNpemUgPSBvcHRzLnZhbHVlRm9udFNpemUgfHwgMzZcbiAgICB0aGlzLmxpbWl0Rm9udFNpemUgPSBvcHRzLmxpbWl0Rm9udFNpemUgfHwgMTJcblxuICAgIHRoaXMuZHJhd1dpdGhBbmltYXRpb24gPSBvcHRzLmRyYXdXaXRoQW5pbWF0aW9uID09PSB1bmRlZmluZWQgPyB0cnVlIDogb3B0cy5kcmF3V2l0aEFuaW1hdGlvblxuXG4gICAgdGhpcy5ub0RhdGEgPSBvcHRzLm5vRGF0YSB8fCBmYWxzZVxuICAgIHRoaXMubm9EYXRhVGV4dCA9IG9wdHMubm9EYXRhVGV4dCB8fCAn5pqC5peg5pWw5o2uJ1xuICAgIHRoaXMubm9EYXRhVGV4dENvbG9yID0gb3B0cy5ub0RhdGFUZXh0Q29sb3IgfHwgJyM2OUI1RkMnXG4gICAgdGhpcy5ub0RhdGFGb250U2l6ZSA9IG9wdHMubm9EYXRhRm9udFNpemUgfHwgMTFcblxuICAgIHRoaXMuZHJhdygpXG4gIH1cblxuICBzaG93VG9vbFRpcChlLCBpc01vdmUgPSBmYWxzZSkge1xuXG4gIH1cblxuICBoaWRkZW5IaWdoTGlnaHQoKSB7XG5cbiAgfVxuXG4gIGRyYXcoKSB7XG4gICAgdGhpcy5pc0RyYXdGaW5pc2ggPSBmYWxzZVxuICAgIHZhciBjYW52YXMgPSB0aGlzLmNhbnZhc1xuXG4gICAgaWYgKHRoaXMubm9EYXRhKSB7XG4gICAgICB0aGlzLmRyYXdOb0RhdGEoY2FudmFzKVxuICAgICAgY2FudmFzLmRyYXcoKVxuICAgICAgdGhpcy5pc0RyYXdGaW5pc2ggPSB0cnVlXG4gICAgfSBlbHNlIHtcbiAgICAgIHZhciB0aGF0ID0gdGhpc1xuICAgICAgdmFyIGR1cmF0aW9uID0gdGhpcy5kcmF3V2l0aEFuaW1hdGlvbiA/IDEwMDAgOiAwXG4gICAgICB2YXIgYW5pbWF0aW9uID0gbmV3IEFuaW1hdGlvbih7XG4gICAgICAgIHRpbWluZzogJ2xpbmVhcicsXG4gICAgICAgIGR1cmF0aW9uOiBkdXJhdGlvbixcbiAgICAgICAgb25Qcm9jZXNzOiBmdW5jdGlvbiAocHJvY2Vzcykge1xuICAgICAgICAgIC8vIGNvbnNvbGUudGltZSgnZ2F1Z2UgZHJhdycpXG4gICAgICAgICAgY2FudmFzLmNsZWFyUmVjdCAmJiBjYW52YXMuY2xlYXJSZWN0KDAsIDAsIHRoYXQud2lkdGgsIHRoYXQuaGVpZ2h0KVxuICAgICAgICAgIHRoYXQucHJvY2VzcyA9IHByb2Nlc3NcblxuICAgICAgICAgIHRoYXQuZHJhd0dhdWdlKGNhbnZhcylcbiAgICAgICAgICBjYW52YXMuZHJhdygpXG4gICAgICAgICAgLy8gY29uc29sZS50aW1lRW5kKCdnYXVnZSBkcmF3JylcbiAgICAgICAgfSxcbiAgICAgICAgb25BbmltYXRpb25GaW5pc2g6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICB0aGF0LmlzRHJhd0ZpbmlzaCA9IHRydWVcbiAgICAgICAgfVxuICAgICAgfSlcbiAgICB9XG4gIH1cblxuICBkcmF3R2F1Z2UoY2FudmFzKSB7XG4gICAgdmFyIHByb2Nlc3MgPSB0aGlzLnByb2Nlc3NcblxuICAgIHZhciBjZW50ZXJYID0gdGhpcy53aWR0aCAvIDJcbiAgICB2YXIgY2VudGVyWSA9IHRoaXMuaGVpZ2h0IC8gMlxuXG4gICAgdmFyIHN0YXJ0QW5nbGUgPSBNYXRoLlBJICogNSAvIDZcbiAgICB2YXIgZW5kQW5nbGUgPSBNYXRoLlBJICogMTMgLyA2XG5cbiAgICBjYW52YXMuc2V0RmlsbFN0eWxlKHRoaXMuYmFja2dyb3VuZEJhbmRDb2xvcilcbiAgICBjYW52YXMuYmVnaW5QYXRoKClcbiAgICBjYW52YXMubW92ZVRvKGNlbnRlclgsIGNlbnRlclkpXG4gICAgY2FudmFzLmFyYyhjZW50ZXJYLCBjZW50ZXJZLCB0aGlzLnJhZGl1cywgc3RhcnRBbmdsZSwgZW5kQW5nbGUpXG4gICAgY2FudmFzLmNsb3NlUGF0aCgpXG4gICAgY2FudmFzLmZpbGwoKVxuXG4gICAgdmFyIHZhbHVlQW5nbGUgPSB0aGlzLmN1clZhbHVlIC8gKHRoaXMubWF4VmFsdWUgLSB0aGlzLm1pblZhbHVlKSAqIChlbmRBbmdsZSAtIHN0YXJ0QW5nbGUpICogcHJvY2Vzc1xuXG4gICAgY2FudmFzLnNldEZpbGxTdHlsZSh0aGlzLnZhbHVlQ29sb3IpXG4gICAgY2FudmFzLmJlZ2luUGF0aCgpXG4gICAgY2FudmFzLm1vdmVUbyhjZW50ZXJYLCBjZW50ZXJZKVxuICAgIGNhbnZhcy5hcmMoY2VudGVyWCwgY2VudGVyWSwgdGhpcy5yYWRpdXMsIHN0YXJ0QW5nbGUsIHN0YXJ0QW5nbGUgKyB2YWx1ZUFuZ2xlKVxuICAgIGNhbnZhcy5jbG9zZVBhdGgoKVxuICAgIGNhbnZhcy5maWxsKClcblxuICAgIGNhbnZhcy5zZXRGaWxsU3R5bGUodGhpcy5iYWNrZ3JvdW5kQ29sb3IpXG4gICAgY2FudmFzLmJlZ2luUGF0aCgpXG4gICAgY2FudmFzLmFyYyhjZW50ZXJYLCBjZW50ZXJZLCB0aGlzLnJhZGl1cyAqIDAuNiwgMCwgMiAqIE1hdGguUEkpXG4gICAgY2FudmFzLmNsb3NlUGF0aCgpXG4gICAgY2FudmFzLmZpbGwoKVxuXG4gICAgaWYocHJvY2VzcyA9PSAxKSB7XG4gICAgICB2YXIgdmFsdWVUZXh0V2lkaHQgPSBjYW52YXMubXlNZWFzdXJlVGV4dCh0aGlzLmN1clZhbHVlVGV4dCwgdGhpcy52YWx1ZUZvbnRTaXplKVxuICAgICAgY2FudmFzLnNldEZvbnRTaXplKHRoaXMudmFsdWVGb250U2l6ZSlcbiAgICAgIGNhbnZhcy5zZXRGaWxsU3R5bGUodGhpcy52YWx1ZUNvbG9yKVxuICAgICAgY2FudmFzLmZpbGxUZXh0KHRoaXMuY3VyVmFsdWVUZXh0LCBjZW50ZXJYIC0gdmFsdWVUZXh0V2lkaHQgLyAyLCBjZW50ZXJZICsgdGhpcy52YWx1ZUZvbnRTaXplIC8gMilcblxuICAgICAgdmFyIGxlZnRWYWx1ZVggPSBjZW50ZXJYIC0gMyAvIDQgKiB0aGlzLnJhZGl1c1xuICAgICAgdmFyIHJpZ2h0VmFsdWVYID0gY2VudGVyWCArIDMgLyA0ICogdGhpcy5yYWRpdXNcbiAgICAgIHZhciB2YWx1ZVkgPSBjZW50ZXJZICsgTWF0aC5zcXJ0KDMpIC8gNCAqIHRoaXMucmFkaXVzICsgdGhpcy5saW1pdEZvbnRTaXplXG5cbiAgICAgIGNhbnZhcy5zZXRGb250U2l6ZSh0aGlzLmxpbWl0Rm9udFNpemUpXG4gICAgICBjYW52YXMuc2V0RmlsbFN0eWxlKHRoaXMubGltaXRUZXh0Q29sb3IpXG4gICAgICBjYW52YXMuZmlsbFRleHQodGhpcy5taW5WYWx1ZVRleHQsIGxlZnRWYWx1ZVgsIHZhbHVlWSlcblxuICAgICAgdmFyIG1heFRleHRXaWR0aCA9IGNhbnZhcy5teU1lYXN1cmVUZXh0KHRoaXMubWF4VmFsdWVUZXh0LCB0aGlzLmxpbWl0Rm9udFNpemUpXG4gICAgICBjYW52YXMuZmlsbFRleHQodGhpcy5tYXhWYWx1ZVRleHQsIHJpZ2h0VmFsdWVYIC0gbWF4VGV4dFdpZHRoLCB2YWx1ZVkpXG4gICAgfVxuICB9XG5cbiAgZHJhd05vRGF0YShjYW52YXMpIHtcbiAgICB2YXIgdGV4dCA9IHRoaXMubm9EYXRhVGV4dFxuICAgIHZhciB0ZXh0V2lkdGggPSBjYW52YXMubXlNZWFzdXJlVGV4dCh0ZXh0LCB0aGlzLm5vRGF0YUZvbnRTaXplKVxuICAgIGNhbnZhcy5zZXRGaWxsU3R5bGUodGhpcy5ub0RhdGFUZXh0Q29sb3IpXG4gICAgY2FudmFzLmZpbGxUZXh0KHRleHQsICh0aGlzLndpZHRoIC0gdGV4dFdpZHRoKSAvIDIsICh0aGlzLmhlaWdodCArIHRoaXMubm9EYXRhRm9udFNpemUpIC8gMilcbiAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IEdhdWdlO1xuIiwidmFyIGNoYXJ0VXRpbHMgPSByZXF1aXJlKCcuL2NoYXJ0VXRpbC5qcycpXG5jb25zdCB7QW5pbWF0aW9ufSA9IGNoYXJ0VXRpbHNcblxuY2xhc3MgRnVubmVsIHtcbiAgY29uc3RydWN0b3Iob3B0cykge1xuICAgIGNvbnNvbGUubG9nKG9wdHMpXG5cbiAgICB0aGlzLmNhbnZhcyA9IG9wdHMuY2FudmFzXG4gICAgdGhpcy53aWR0aCA9IG9wdHMud2lkdGhcbiAgICB0aGlzLmhlaWdodCA9IG9wdHMuaGVpZ2h0XG4gICAgdGhpcy5jaGFydFBhZGRpbmcgPSBvcHRzLmNoYXJ0UGFkZGluZyB8fCA0MFxuXG4gICAgdGhpcy5oaWdoTGlnaHRJbmRleCA9IC0xXG4gICAgdGhpcy5oaWdoTGlnaHRDb2xvciA9ICdyZ2JhKDAsIDAsIDAsIDAuMyknXG5cbiAgICB0aGlzLmRyYXdBeGlzTGFiZWwgPSBvcHRzLmRyYXdBeGlzTGFiZWwgfHwgZmFsc2VcbiAgICB0aGlzLmRyYXdEYXRhTGFiZWwgPSBvcHRzLmRyYXdEYXRhTGFiZWwgfHwgZmFsc2VcbiAgICB0aGlzLmRhdGFMYWJlbFBvc2l0aW9uID0gb3B0cy5kYXRhTGFiZWxQb3NpdGlvbiB8fCAnaW5zaWRlJ1xuICAgIHRoaXMuZGF0YWxhYmVsQ2FsbEJhY2sgPSBvcHRzLmRhdGFsYWJlbENhbGxCYWNrIHx8IGZ1bmN0aW9uICgpIHsgcmV0dXJuICcnIH1cbiAgICB0aGlzLmRhdGFMYWJlbEZvbnRTaXplID0gb3B0cy5kYXRhTGFiZWxGb250U2l6ZSB8fCA4XG4gICAgdGhpcy5kYXRhTGFiZWxQYWRkaW5nID0gb3B0cy5kYXRhTGFiZWxQYWRkaW5nIHx8IDRcbiAgICB0aGlzLmRhdGFMYWJlbENvbG9yID0gb3B0cy5kYXRhTGFiZWxDb2xvciB8fCAnd2hpdGUnXG4gICAgdGhpcy5kYXRhQXhpc0xhYmVsQ29sb3IgPSBvcHRzLmRhdGFBeGlzTGFiZWxDb2xvciB8fCAnIzExMTExMSdcbiAgICB0aGlzLmRhdGFMYWJlbExpbmVXaWR0aCA9IG9wdHMuZGF0YUxhYmVsTGluZVdpZHRoIHx8IDAuNVxuXG4gICAgdGhpcy50b29sdGlwQ2FsbEJhY2sgPSBvcHRzLnRvb2x0aXBDYWxsQmFja1xuICAgIHRoaXMudG9vbFRpcEJhY2tncm91bmRDb2xvciA9IG9wdHMudG9vbFRpcEJhY2tncm91bmRDb2xvciB8fCAnd2hpdGUnXG4gICAgdGhpcy50b29sVGlwU2hhZG93Q29sb3IgPSBvcHRzLnRvb2xUaXBTaGFkb3dDb2xvciB8fCAncmdiYSgwLCAwLCAwLCAwLjUpJ1xuICAgIHRoaXMudG9vbFRpcFNoYWRvd09mZnNldFggPSBvcHRzLnRvb2xUaXBTaGFkb3dPZmZzZXRYIHx8IDJcbiAgICB0aGlzLnRvb2xUaXBTaGFkb3dPZmZzZXRZID0gb3B0cy50b29sVGlwU2hhZG93T2Zmc2V0WSB8fCA1XG4gICAgdGhpcy50b29sVGlwU2hhZG93Qmx1ciA9IG9wdHMudG9vbFRpcFNoYWRvd0JsdXIgfHwgNTBcbiAgICB0aGlzLnRvb2xUaXBQYWRkaW5nID0gb3B0cy50b29sVGlwUGFkZGluZyB8fCAxMFxuICAgIHRoaXMudG9vbFRpcFRleHRQYWRkaW5nID0gb3B0cy50b29sVGlwVGV4dFBhZGRpbmcgfHwgOFxuICAgIHRoaXMudG9vbFRpcEZvbnRTaXplID0gb3B0cy50b29sVGlwRm9udFNpemUgfHwgMTBcbiAgICB0aGlzLnRvb2xUaXBTcGxpdExpbmVXaWR0aCA9IG9wdHMudG9vbFRpcFNwbGl0TGluZVdpZHRoIHx8IDFcbiAgICB0aGlzLnRvb2xUaXBTcGxpdExpbmVDb2xvciA9IG9wdHMudG9vbFRpcFNwbGl0TGluZUNvbG9yIHx8ICcjZmZmZmZmJ1xuXG4gICAgdGhpcy5kcmF3V2l0aEFuaW1hdGlvbiA9IG9wdHMuZHJhd1dpdGhBbmltYXRpb24gPT09IHVuZGVmaW5lZCA/IHRydWUgOiBvcHRzLmRyYXdXaXRoQW5pbWF0aW9uXG5cbiAgICB0aGlzLm5vRGF0YSA9IG9wdHMubm9EYXRhIHx8IGZhbHNlXG4gICAgdGhpcy5ub0RhdGFUZXh0ID0gb3B0cy5ub0RhdGFUZXh0IHx8ICfmmoLml6DmlbDmja4nXG4gICAgdGhpcy5ub0RhdGFUZXh0Q29sb3IgPSBvcHRzLm5vRGF0YVRleHRDb2xvciB8fCAnIzY5QjVGQydcbiAgICB0aGlzLm5vRGF0YUZvbnRTaXplID0gb3B0cy5ub0RhdGFGb250U2l6ZSB8fCAxMVxuICAgIHRoaXMuZGF0YSA9IG9wdHMuZGF0YVxuXG4gICAgdmFyIGNvbG9ycyA9IFsnIzdjYjVlYycsICcjZjdhMzVjJywgJyM0MzQzNDgnLCAnIzkwZWQ3ZCcsICcjZjE1YzgwJywgJyM4MDg1ZTknLCAnI0U0RDM1NCcsICcjMkI5MDhGJywgJyNGNDVCNUInLCAnIzkxRThFMScsICcjN0NCNUVDJywgJyM0MzQzNDgnXVxuICAgIHRoaXMuY29sb3JzID0gb3B0cy5jb2xvcnMgJiYgb3B0cy5jb2xvcnMuc2xpY2UoKSB8fCBjb2xvcnNcblxuICAgIHRoaXMuZnVubmVsV2lkdGggPSBvcHRzLmZ1bm5lbFdpZHRoIHx8IE1hdGgubWluKHRoaXMud2lkdGgsIHRoaXMuaGVpZ2h0KSAtIHRoaXMuY2hhcnRQYWRkaW5nICogMiAtIHRoaXMuZGF0YUxhYmVsUGFkZGluZyAqIDJcbiAgICB2YXIgbWF4TGVmdExhYmVsV2lkdGggPSAwXG4gICAgdmFyIG1heFJpZ2h0TGFiZWxXaWR0aCA9IDBcblxuICAgIHZhciB0cmFuc2Zvcm1MYWJlbHMgPSBbXVxuICAgIHZhciBtYXhWYWx1ZVxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy5kYXRhLmxlbmd0aDsgaSsrKSB7XG4gICAgICB2YXIgbmFtZSA9IHRoaXMuZGF0YVtpXS5uYW1lXG4gICAgICB2YXIgdmFsdWUgPSB0aGlzLmRhdGFbaV0udmFsdWVcblxuICAgICAgaWYgKCFtYXhWYWx1ZSB8fCBtYXhWYWx1ZSA8IHZhbHVlKSB7XG4gICAgICAgIG1heFZhbHVlID0gdmFsdWVcbiAgICAgIH1cbiAgICAgIGlmICh0aGlzLmRyYXdBeGlzTGFiZWwpIHtcbiAgICAgICAgdmFyIGxhYmVsV2lkdGggPSB0aGlzLmNhbnZhcy5teU1lYXN1cmVUZXh0KG5hbWUsIHRoaXMuZGF0YUxhYmVsRm9udFNpemUpXG4gICAgICAgIHRoaXMuZGF0YVtpXS5sYWJlbFdpZHRoID0gbGFiZWxXaWR0aFxuXG4gICAgICAgIGlmIChtYXhSaWdodExhYmVsV2lkdGggPCBsYWJlbFdpZHRoKSB7XG4gICAgICAgICAgbWF4UmlnaHRMYWJlbFdpZHRoID0gbGFiZWxXaWR0aFxuICAgICAgICB9XG4gICAgICAgIGlmIChpID4gMCkge1xuICAgICAgICAgIHZhciBwcmVWYWx1ZSA9IHRoaXMuZGF0YVtpIC0gMV0udmFsdWVcbiAgICAgICAgICB2YXIgdHJhbnNmb3JtVmFsdWUgPSB2YWx1ZSAvIHByZVZhbHVlICogMTAwXG4gICAgICAgICAgdmFyIHRyYW5zZm9ybUxhYmVsID0gYOi9rOWMlueOhyAke3RyYW5zZm9ybVZhbHVlLnRvRml4ZWQoMil9JWBcbiAgICAgICAgICB2YXIgdHJhbnNmb3JtV2lkdGggPSB0aGlzLmNhbnZhcy5teU1lYXN1cmVUZXh0KHRyYW5zZm9ybUxhYmVsLCB0aGlzLmRhdGFMYWJlbEZvbnRTaXplKVxuXG4gICAgICAgICAgdHJhbnNmb3JtTGFiZWxzLnB1c2goe1xuICAgICAgICAgICAgbGFiZWw6IHRyYW5zZm9ybUxhYmVsLFxuICAgICAgICAgICAgbGFiZWxXaWR0aDogdHJhbnNmb3JtV2lkdGhcbiAgICAgICAgICB9KVxuXG4gICAgICAgICAgaWYgKG1heExlZnRMYWJlbFdpZHRoIDwgdHJhbnNmb3JtV2lkdGgpIHtcbiAgICAgICAgICAgIG1heExlZnRMYWJlbFdpZHRoID0gdHJhbnNmb3JtV2lkdGhcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gICAgdGhpcy5tYXhWYWx1ZSA9IG1heFZhbHVlXG4gICAgdGhpcy50cmFuc2Zvcm1MYWJlbHMgPSB0cmFuc2Zvcm1MYWJlbHNcblxuICAgIHZhciBmdW5uZWxXaWR0aCA9IHRoaXMud2lkdGggLSBtYXhMZWZ0TGFiZWxXaWR0aCAtIG1heFJpZ2h0TGFiZWxXaWR0aCAtIHRoaXMuZGF0YUxhYmVsUGFkZGluZyAqIDIgLSB0aGlzLmNoYXJ0UGFkZGluZyAqIDJcbiAgICBpZiAoZnVubmVsV2lkdGggPCB0aGlzLmZ1bm5lbFdpZHRoKSB7XG4gICAgICB0aGlzLmZ1bm5lbFdpZHRoID0gZnVubmVsV2lkdGhcbiAgICB9XG5cbiAgICB0aGlzLmRyYXcoKVxuICB9XG5cbiAgZ2V0Q29sb3IoaW5kZXgpIHtcbiAgICByZXR1cm4gdGhpcy5jb2xvcnNbaW5kZXggJSB0aGlzLmNvbG9ycy5sZW5ndGhdXG4gIH1cblxuICBjYWxjdWxhdGVDbGlja1Bvc2l0aW9uKGUpIHtcbiAgICBpZiAodGhpcy5ub0RhdGEgfHwgdGhpcy5wcm9jZXNzICE9IDEpIHtcbiAgICAgIHJldHVybiAtMVxuICAgIH1cbiAgICBpZiAoZS50b3VjaGVzICYmIGUudG91Y2hlcy5sZW5ndGgpIHtcbiAgICAgIHZhciB4ID0gZS50b3VjaGVzWzBdLnhcbiAgICAgIHZhciB5ID0gZS50b3VjaGVzWzBdLnlcblxuICAgICAgdmFyIHdpZHRoID0gdGhpcy53aWR0aFxuICAgICAgdmFyIGhlaWdodCA9IHRoaXMuaGVpZ2h0XG5cbiAgICAgIHZhciBjaGFydFBhZGRpbmcgPSB0aGlzLmNoYXJ0UGFkZGluZ1xuICAgICAgdmFyIGZ1bm5lbFdpZHRoID0gdGhpcy5mdW5uZWxXaWR0aFxuICAgICAgdmFyIHByZUhlaWdodCA9ICh0aGlzLmhlaWdodCAtIGNoYXJ0UGFkZGluZyAqIDIpIC8gKHRoaXMuZGF0YS5sZW5ndGggLSAxKVxuXG4gICAgICB2YXIgY2VudGVyWCA9IHdpZHRoIC8gMlxuICAgICAgdmFyIHN0YXJ0WSA9IGNoYXJ0UGFkZGluZ1xuXG4gICAgICBpZiAoeCA+PSBjaGFydFBhZGRpbmcgJiYgeCA8PSB3aWR0aCAtIGNoYXJ0UGFkZGluZyAmJiB5ID49IGNoYXJ0UGFkZGluZyAmJiB5IDw9IGhlaWdodCAtIGNoYXJ0UGFkZGluZykge1xuICAgICAgICByZXR1cm4gTWF0aC5mbG9vcigoeSAtIGNoYXJ0UGFkZGluZykgLyBwcmVIZWlnaHQpXG4gICAgICB9XG5cbiAgICAgIHJldHVybiAtMVxuICAgIH1cbiAgICByZXR1cm4gLTFcbiAgfVxuXG4gIHNob3dUb29sVGlwKGUsIGlzTW92ZSA9IGZhbHNlKSB7XG4gICAgdmFyIGluZGV4ID0gdGhpcy5jYWxjdWxhdGVDbGlja1Bvc2l0aW9uKGUpXG4gICAgaWYgKHRoaXMuaGlnaExpZ2h0SW5kZXggPT0gaW5kZXggJiYgaW5kZXggPT0gLTEpIHtcbiAgICAgIHJldHVyblxuICAgIH1cbiAgICBpZiAodGhpcy5oaWdoTGlnaHRJbmRleCA9PSBpbmRleCAmJiAhaXNNb3ZlKSB7XG4gICAgICB0aGlzLmhpZ2hMaWdodEluZGV4ID0gLTFcbiAgICB9IGVsc2UgaWYgKHRoaXMuaGlnaExpZ2h0SW5kZXggPT0gaW5kZXggJiYgdGhpcy5oaWdoTGlnaHRZICYmIE1hdGguYWJzKHRoaXMuaGlnaExpZ2h0WSAtIGUudG91Y2hlc1swXS55KSA8IDEwKSB7XG4gICAgICByZXR1cm5cbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5oaWdoTGlnaHRJbmRleCA9IGluZGV4XG5cbiAgICAgIGlmIChpbmRleCAhPSAtMSkge1xuICAgICAgICB2YXIgaGlnaExpZ2h0RGF0YSA9IHRoaXMudG9vbHRpcENhbGxCYWNrKGluZGV4KVxuICAgICAgICB0aGlzLmhpZ2hMaWdodERhdGEgPSBoaWdoTGlnaHREYXRhXG4gICAgICAgIHRoaXMuaGlnaExpZ2h0WSA9IGUudG91Y2hlc1swXS55XG4gICAgICAgIHRoaXMuaGlnaExpZ2h0WCA9IGUudG91Y2hlc1swXS54XG4gICAgICB9XG4gICAgfVxuICAgIHRoaXMuZHJhdyhmYWxzZSlcbiAgfVxuXG4gIGhpZGRlbkhpZ2hMaWdodCgpIHtcbiAgICBpZiAodGhpcy5oaWdoTGlnaHRJbmRleCA9PSAtMSkge1xuICAgICAgcmV0dXJuXG4gICAgfVxuICAgIHRoaXMuaGlnaExpZ2h0SW5kZXggPSAtMVxuICAgIHRoaXMuZHJhdyhmYWxzZSlcbiAgfVxuXG4gIGRyYXcoaXNBbmltYXRpb24gPSB0cnVlKSB7XG4gICAgdGhpcy5pc0RyYXdGaW5pc2ggPSBmYWxzZVxuICAgIHZhciBjYW52YXMgPSB0aGlzLmNhbnZhc1xuXG4gICAgaWYgKHRoaXMubm9EYXRhKSB7XG4gICAgICB0aGlzLmRyYXdOb0RhdGEoY2FudmFzKVxuICAgICAgY2FudmFzLmRyYXcoKVxuICAgICAgdGhpcy5pc0RyYXdGaW5pc2ggPSB0cnVlXG4gICAgfSBlbHNlIHtcbiAgICAgIHZhciB0aGF0ID0gdGhpc1xuICAgICAgdmFyIGR1cmF0aW9uID0gaXNBbmltYXRpb24gJiYgdGhpcy5kcmF3V2l0aEFuaW1hdGlvbiA/IDEwMDAgOiAwXG4gICAgICB2YXIgYW5pbWF0aW9uID0gbmV3IEFuaW1hdGlvbih7XG4gICAgICAgIHRpbWluZzogJ2xpbmVhcicsXG4gICAgICAgIGR1cmF0aW9uOiBkdXJhdGlvbixcbiAgICAgICAgb25Qcm9jZXNzOiBmdW5jdGlvbiAocHJvY2Vzcykge1xuICAgICAgICAgIGNhbnZhcy5jbGVhclJlY3QgJiYgY2FudmFzLmNsZWFyUmVjdCgwLCAwLCB0aGF0LndpZHRoLCB0aGF0LmhlaWdodClcbiAgICAgICAgICB0aGF0LnByb2Nlc3MgPSBwcm9jZXNzXG4gICAgICAgICAgdGhhdC5kYXRhTGFiZWxzID0gW11cblxuICAgICAgICAgIHRoYXQuZHJhd0Z1bm5lbChjYW52YXMpXG4gICAgICAgICAgaWYgKHRoYXQuZHJhd0RhdGFMYWJlbCAmJiBwcm9jZXNzID09IDEpIHtcbiAgICAgICAgICAgIHRoYXQuZHJhd0RhdGFMYWJlbExheWVyKGNhbnZhcylcbiAgICAgICAgICB9XG4gICAgICAgICAgdGhhdC5kcmF3VG9vbFRpcChjYW52YXMpXG4gICAgICAgICAgY2FudmFzLmRyYXcoKVxuICAgICAgICB9LFxuICAgICAgICBvbkFuaW1hdGlvbkZpbmlzaDogZnVuY3Rpb24gKCkge1xuICAgICAgICAgIHRoYXQuaXNEcmF3RmluaXNoID0gdHJ1ZVxuICAgICAgICB9XG4gICAgICB9KVxuICAgIH1cbiAgfVxuXG4gIGRyYXdUb29sVGlwKGNhbnZhcykge1xuICAgIGlmICh0aGlzLmhpZ2hMaWdodEluZGV4ID09IC0xKSB7XG4gICAgICByZXR1cm5cbiAgICB9XG4gICAgdmFyIGNoYXJ0UGFkZGluZyA9IHRoaXMuY2hhcnRQYWRkaW5nXG4gICAgdmFyIGNoYXJ0Q29udGVudEhlaWdodCA9IHRoaXMuaGVpZ2h0IC0gY2hhcnRQYWRkaW5nICogMlxuICAgIHZhciB4ID0gdGhpcy5oaWdoTGlnaHRYXG4gICAgdmFyIHkgPSB0aGlzLmhpZ2hMaWdodFlcblxuICAgIHZhciB0b29sVGlwQmFja2dyb3VuZENvbG9yID0gdGhpcy50b29sVGlwQmFja2dyb3VuZENvbG9yXG4gICAgdmFyIHRvb2xUaXBQYWRkaW5nID0gdGhpcy50b29sVGlwUGFkZGluZ1xuICAgIHZhciB0b29sVGlwVGV4dFBhZGRpbmcgPSB0aGlzLnRvb2xUaXBUZXh0UGFkZGluZ1xuICAgIHZhciB0b29sVGlwRm9udFNpemUgPSB0aGlzLnRvb2xUaXBGb250U2l6ZVxuICAgIHZhciB0b29sVGlwU3BsaXRMaW5lV2lkdGggPSB0aGlzLnRvb2xUaXBTcGxpdExpbmVXaWR0aFxuICAgIC8vIHZhciB0b29sVGlwU3BsaXRMaW5lQ29sb3IgPSB0aGlzLnRvb2xUaXBTcGxpdExpbmVDb2xvclxuICAgIHZhciB0b29sVGlwU3BsaXRMaW5lQ29sb3IgPSB0aGlzLmdldENvbG9yKHRoaXMuaGlnaExpZ2h0SW5kZXgpXG5cbiAgICB2YXIgdG9vbFRpcFdpZHRoID0gdG9vbFRpcFBhZGRpbmcgKiAyXG4gICAgdmFyIHRvb2xUaXBIZWlnaHQgPSB0b29sVGlwUGFkZGluZyAqIDJcblxuICAgIHZhciBoaWdoTGlnaHREYXRhID0gdGhpcy5oaWdoTGlnaHREYXRhXG5cbiAgICAvL3RpdGxlXG4gICAgdmFyIG1heFRpcExpbmVXaWR0aCA9IGNhbnZhcy5teU1lYXN1cmVUZXh0KGhpZ2hMaWdodERhdGEudGl0bGUsIHRvb2xUaXBGb250U2l6ZSlcbiAgICB0b29sVGlwSGVpZ2h0ICs9IHRvb2xUaXBGb250U2l6ZSArIHRvb2xUaXBTcGxpdExpbmVXaWR0aCArIHRvb2xUaXBUZXh0UGFkZGluZ1xuICAgIGhpZ2hMaWdodERhdGEuZGF0YS5tYXAoKHRleHQsIGluZGV4KSA9PiB7XG4gICAgICB0b29sVGlwSGVpZ2h0ICs9IHRvb2xUaXBGb250U2l6ZSArIHRvb2xUaXBUZXh0UGFkZGluZ1xuXG4gICAgICB2YXIgdGV4dFdpZHRoID0gY2FudmFzLm15TWVhc3VyZVRleHQodGV4dCwgdG9vbFRpcEZvbnRTaXplKVxuICAgICAgaWYgKG1heFRpcExpbmVXaWR0aCA8IHRleHRXaWR0aCkge1xuICAgICAgICBtYXhUaXBMaW5lV2lkdGggPSB0ZXh0V2lkdGhcbiAgICAgIH1cbiAgICB9KVxuICAgIHRvb2xUaXBXaWR0aCArPSBtYXhUaXBMaW5lV2lkdGhcblxuICAgIHZhciBzdGFydFggPSB4IC0gdG9vbFRpcFdpZHRoIC8gMlxuICAgIHZhciBzdGFydFkgPSB5IC0gdG9vbFRpcEhlaWdodCAvIDJcbiAgICBpZiAoeSArIHRvb2xUaXBIZWlnaHQgPiBjaGFydENvbnRlbnRIZWlnaHQgKyBjaGFydFBhZGRpbmcpIHtcbiAgICAgIHN0YXJ0WSA9IGNoYXJ0Q29udGVudEhlaWdodCArIGNoYXJ0UGFkZGluZyAtIHRvb2xUaXBIZWlnaHRcbiAgICB9XG5cbiAgICBjYW52YXMuc2V0RmlsbFN0eWxlKHRvb2xUaXBCYWNrZ3JvdW5kQ29sb3IpXG4gICAgY2FudmFzLmJlZ2luUGF0aCgpXG4gICAgY2FudmFzLnNldFNoYWRvdyh0aGlzLnRvb2xUaXBTaGFkb3dPZmZzZXRYLCB0aGlzLnRvb2xUaXBTaGFkb3dPZmZzZXRZLCB0aGlzLnRvb2xUaXBTaGFkb3dCbHVyLCB0aGlzLnRvb2xUaXBTaGFkb3dDb2xvcilcbiAgICBjYW52YXMuZmlsbFJlY3Qoc3RhcnRYLCBzdGFydFksIHRvb2xUaXBXaWR0aCwgdG9vbFRpcEhlaWdodClcbiAgICBjYW52YXMuY2xvc2VQYXRoKClcblxuICAgIGNhbnZhcy5zZXRGaWxsU3R5bGUodG9vbFRpcFNwbGl0TGluZUNvbG9yKVxuICAgIGNhbnZhcy5zZXRTdHJva2VTdHlsZSh0b29sVGlwU3BsaXRMaW5lQ29sb3IpXG4gICAgY2FudmFzLnNldExpbmVXaWR0aCh0b29sVGlwU3BsaXRMaW5lV2lkdGgpXG4gICAgY2FudmFzLnNldEZvbnRTaXplKHRvb2xUaXBGb250U2l6ZSlcbiAgICBjYW52YXMuc2V0VGV4dEFsaWduKCdsZWZ0JylcblxuICAgIHZhciBkcmF3WCA9IHN0YXJ0WCArIHRvb2xUaXBQYWRkaW5nXG4gICAgdmFyIGRyYXdZID0gc3RhcnRZICsgdG9vbFRpcFBhZGRpbmcgKyB0b29sVGlwRm9udFNpemVcblxuICAgIGNhbnZhcy5maWxsVGV4dChoaWdoTGlnaHREYXRhLnRpdGxlLCBkcmF3WCwgZHJhd1kpXG4gICAgZHJhd1kgKz0gdG9vbFRpcFRleHRQYWRkaW5nICsgdG9vbFRpcFNwbGl0TGluZVdpZHRoIC8gMlxuICAgIGNhbnZhcy5iZWdpblBhdGgoKVxuICAgIGNhbnZhcy5tb3ZlVG8oZHJhd1ggLSB0b29sVGlwUGFkZGluZyAqIDAuMjUsIGRyYXdZKVxuICAgIGNhbnZhcy5saW5lVG8oZHJhd1ggKyB0b29sVGlwV2lkdGggLSB0b29sVGlwUGFkZGluZyAqIDEuNzUsIGRyYXdZKVxuICAgIGNhbnZhcy5zdHJva2UoKVxuICAgIGNhbnZhcy5jbG9zZVBhdGgoKVxuXG4gICAgaGlnaExpZ2h0RGF0YS5kYXRhLm1hcCgodGV4dCwgaW5kZXgpID0+IHtcbiAgICAgIGRyYXdZICs9IHRvb2xUaXBUZXh0UGFkZGluZyArIHRvb2xUaXBGb250U2l6ZVxuICAgICAgY2FudmFzLmZpbGxUZXh0KHRleHQsIGRyYXdYLCBkcmF3WSlcbiAgICB9KVxuICB9XG5cbiAgZHJhd0Z1bm5lbChjYW52YXMpIHtcbiAgICB2YXIgcHJvY2VzcyA9IHRoaXMucHJvY2Vzc1xuXG4gICAgdmFyIHdpZHRoID0gdGhpcy53aWR0aFxuICAgIHZhciBoZWlnaHQgPSB0aGlzLmhlaWdodFxuXG4gICAgdmFyIGRhdGFMYWJlbEZvbnRTaXplID0gdGhpcy5kYXRhTGFiZWxGb250U2l6ZVxuICAgIHZhciBkYXRhTGFiZWxQYWRkaW5nID0gdGhpcy5kYXRhTGFiZWxQYWRkaW5nXG4gICAgdmFyIGRhdGFBeGlzTGFiZWxDb2xvciA9IHRoaXMuZGF0YUF4aXNMYWJlbENvbG9yXG5cbiAgICB2YXIgY2hhcnRQYWRkaW5nID0gdGhpcy5jaGFydFBhZGRpbmdcbiAgICB2YXIgZnVubmVsV2lkdGggPSB0aGlzLmZ1bm5lbFdpZHRoXG4gICAgdmFyIHByZUhlaWdodCA9ICh0aGlzLmhlaWdodCAtIGNoYXJ0UGFkZGluZyAqIDIpIC8gKHRoaXMuZGF0YS5sZW5ndGggLSAxKVxuICAgIHZhciBjZW50ZXJYID0gd2lkdGggLyAyXG4gICAgdmFyIHNpemUgPSB0aGlzLmRhdGEubGVuZ3RoXG4gICAgdmFyIGRyYXdTaXplID0gc2l6ZSAqIHByb2Nlc3NcblxuICAgIGNhbnZhcy5zZXRMaW5lV2lkdGgodGhpcy5kYXRhTGFiZWxMaW5lV2lkdGgpXG4gICAgY2FudmFzLnNldEZvbnRTaXplKGRhdGFMYWJlbEZvbnRTaXplKVxuICAgIGNhbnZhcy5zZXRTdHJva2VTdHlsZShkYXRhQXhpc0xhYmVsQ29sb3IpXG5cbiAgICB2YXIgY3VycmVudFkgPSBjaGFydFBhZGRpbmdcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGRyYXdTaXplOyBpKyspIHtcbiAgICAgIHZhciB2YWx1ZSA9IHRoaXMuZGF0YVtpXS52YWx1ZVxuICAgICAgdmFyIHZhbHVlV2lkdGggPSB2YWx1ZSAvIHRoaXMubWF4VmFsdWUgKiBmdW5uZWxXaWR0aFxuXG4gICAgICBpZiAodGhpcy5kcmF3QXhpc0xhYmVsICYmIHByb2Nlc3MgPT0gMSkge1xuICAgICAgICB2YXIgbmFtZSA9IHRoaXMuZGF0YVtpXS5uYW1lXG4gICAgICAgIHZhciBsYWJlbFdpZHRoID0gdGhpcy5kYXRhW2ldLmxhYmVsV2lkdGhcbiAgICAgICAgY2FudmFzLmJlZ2luUGF0aCgpXG4gICAgICAgIGNhbnZhcy5tb3ZlVG8oKHRoaXMud2lkdGggKyB2YWx1ZVdpZHRoKSAvIDIsIGN1cnJlbnRZKVxuICAgICAgICBjYW52YXMubGluZVRvKHRoaXMud2lkdGggLSBjaGFydFBhZGRpbmcgLSBsYWJlbFdpZHRoIC0gZGF0YUxhYmVsUGFkZGluZywgY3VycmVudFkpXG4gICAgICAgIGNhbnZhcy5jbG9zZVBhdGgoKVxuICAgICAgICBjYW52YXMuc3Ryb2tlKClcblxuICAgICAgICBjYW52YXMuc2V0VGV4dEFsaWduKCdyaWdodCcpXG4gICAgICAgIGNhbnZhcy5zZXRGaWxsU3R5bGUoZGF0YUF4aXNMYWJlbENvbG9yKVxuICAgICAgICBjYW52YXMuZmlsbFRleHQobmFtZSwgdGhpcy53aWR0aCAtIGNoYXJ0UGFkZGluZywgY3VycmVudFkgKyBkYXRhTGFiZWxGb250U2l6ZSAvIDIpXG4gICAgICB9XG5cbiAgICAgIGlmKGkgPiAwKSB7XG4gICAgICAgIHZhciBwcmVWYWx1ZSA9IHRoaXMuZGF0YVtpIC0gMV0udmFsdWVcbiAgICAgICAgdmFyIHByZVZhbHVlV2lkdGggPSBwcmVWYWx1ZSAvIHRoaXMubWF4VmFsdWUgKiBmdW5uZWxXaWR0aFxuXG4gICAgICAgIGlmICh0aGlzLmRyYXdBeGlzTGFiZWwgJiYgcHJvY2VzcyA9PSAxKSB7XG4gICAgICAgICAgdmFyIHRyYW5zZm9ybUxhYmVsID0gdGhpcy50cmFuc2Zvcm1MYWJlbHNbaSAtIDFdLmxhYmVsXG4gICAgICAgICAgdmFyIHRyYW5zZm9ybUxhYmVsV2lkdGggPSB0aGlzLnRyYW5zZm9ybUxhYmVsc1tpIC0gMV0ubGFiZWxXaWR0aFxuXG4gICAgICAgICAgY2FudmFzLmJlZ2luUGF0aCgpXG4gICAgICAgICAgY2FudmFzLm1vdmVUbyhjZW50ZXJYLCBjdXJyZW50WSAtIHByZUhlaWdodCAvIDIpXG4gICAgICAgICAgY2FudmFzLmxpbmVUbyhjaGFydFBhZGRpbmcgKyB0cmFuc2Zvcm1MYWJlbFdpZHRoICsgZGF0YUxhYmVsUGFkZGluZywgY3VycmVudFkgLSBwcmVIZWlnaHQgLyAyKVxuICAgICAgICAgIGNhbnZhcy5jbG9zZVBhdGgoKVxuICAgICAgICAgIGNhbnZhcy5zdHJva2UoKVxuXG4gICAgICAgICAgY2FudmFzLnNldFRleHRBbGlnbignbGVmdCcpXG4gICAgICAgICAgY2FudmFzLnNldEZpbGxTdHlsZShkYXRhQXhpc0xhYmVsQ29sb3IpXG4gICAgICAgICAgY2FudmFzLmZpbGxUZXh0KHRyYW5zZm9ybUxhYmVsLCBjaGFydFBhZGRpbmcsIGN1cnJlbnRZIC0gcHJlSGVpZ2h0IC8gMiArIGRhdGFMYWJlbEZvbnRTaXplIC8gMilcbiAgICAgICAgfVxuXG4gICAgICAgIGNhbnZhcy5zZXRGaWxsU3R5bGUodGhpcy5nZXRDb2xvcihpIC0gMSkpXG4gICAgICAgIGNhbnZhcy5iZWdpblBhdGgoKVxuICAgICAgICBjYW52YXMubW92ZVRvKGNlbnRlclggLSBwcmVWYWx1ZVdpZHRoIC8gMiwgY3VycmVudFkgLSBwcmVIZWlnaHQpXG4gICAgICAgIGNhbnZhcy5saW5lVG8oY2VudGVyWCArIHByZVZhbHVlV2lkdGggLyAyLCBjdXJyZW50WSAtIHByZUhlaWdodClcbiAgICAgICAgY2FudmFzLmxpbmVUbyhjZW50ZXJYICsgdmFsdWVXaWR0aCAvIDIsIGN1cnJlbnRZKVxuICAgICAgICBjYW52YXMubGluZVRvKGNlbnRlclggLSB2YWx1ZVdpZHRoIC8gMiwgY3VycmVudFkpXG4gICAgICAgIGNhbnZhcy5jbG9zZVBhdGgoKVxuICAgICAgICBjYW52YXMuZmlsbCgpXG4gICAgICB9XG5cbiAgICAgIGlmKHRoaXMuZHJhd0RhdGFMYWJlbCkge1xuICAgICAgICB2YXIgbGFiZWwgPSB0aGlzLmRhdGFsYWJlbENhbGxCYWNrKDAsIGkpXG4gICAgICAgIHRoaXMuZHJhd0RhdGFMYWJlbFBvc2l0aW9uKGNhbnZhcywgbGFiZWwsIHZhbHVlV2lkdGgsIGN1cnJlbnRZKVxuICAgICAgfVxuXG4gICAgICBjdXJyZW50WSArPSBwcmVIZWlnaHRcbiAgICB9XG4gIH1cblxuICBkcmF3RGF0YUxhYmVsUG9zaXRpb24oY2FudmFzLCBsYWJlbCwgdmFsdWVXaWR0aCwgc3RhcnRZKSB7XG4gICAgbGV0IGRhdGFMYWJlbFBhZGRpbmcgPSB0aGlzLmRhdGFMYWJlbFBhZGRpbmdcbiAgICBsZXQgZGF0YUxhYmVsRm9udFNpemUgPSB0aGlzLmRhdGFMYWJlbEZvbnRTaXplXG5cbiAgICB2YXIgbGFiZWxXaWR0aCA9IGNhbnZhcy5teU1lYXN1cmVUZXh0KGxhYmVsLCBkYXRhTGFiZWxGb250U2l6ZSlcbiAgICB2YXIgeVxuICAgIHN3aXRjaCAodGhpcy5kYXRhTGFiZWxQb3NpdGlvbikge1xuICAgICAgY2FzZSAnaW5zaWRlJzpcbiAgICAgICAgeSA9IHN0YXJ0WSArIGRhdGFMYWJlbFBhZGRpbmcgKyBkYXRhTGFiZWxGb250U2l6ZVxuICAgICAgICBicmVha1xuICAgICAgY2FzZSAnb3V0c2lkZSc6XG4gICAgICAgIHkgPSBzdGFydFkgLSBkYXRhTGFiZWxQYWRkaW5nXG4gICAgICAgIGJyZWFrXG4gICAgfVxuXG4gICAgdmFyIGNvbG9yXG4gICAgaWYgKHkgPCB0aGlzLmNoYXJ0UGFkZGluZyB8fCB5ID4gdGhpcy5oZWlnaHQgLSB0aGlzLmNoYXJ0UGFkZGluZyB8fCBsYWJlbFdpZHRoID4gdmFsdWVXaWR0aCkge1xuICAgICAgY29sb3IgPSB0aGlzLmRhdGFBeGlzTGFiZWxDb2xvclxuICAgIH0gZWxzZSB7XG4gICAgICBjb2xvciA9IHRoaXMuZGF0YUxhYmVsQ29sb3JcbiAgICB9XG4gICAgdGhpcy5hZGREYXRhTGFiZWwobGFiZWwsICh0aGlzLndpZHRoIC0gbGFiZWxXaWR0aCkgLyAyLCB5LCBsYWJlbFdpZHRoLCBjb2xvcilcbiAgfVxuXG4gIGFkZERhdGFMYWJlbChsYWJlbCwgeCwgeSwgbGFiZWxXaWR0aCwgY29sb3IpIHtcbiAgICB2YXIgbGVmdCA9IHhcbiAgICB2YXIgdG9wID0geSAtIHRoaXMuZGF0YUxhYmVsRm9udFNpemVcbiAgICB2YXIgcmlnaHQgPSB4ICsgbGFiZWxXaWR0aFxuICAgIHZhciBib3R0b20gPSB5XG5cbiAgICB2YXIgY3VyckRhdGFMYWJlbCA9IHtcbiAgICAgIGxhYmVsOiBsYWJlbCxcbiAgICAgIGxlZnQ6IGxlZnQsXG4gICAgICB0b3A6IHRvcCxcbiAgICAgIHJpZ2h0OiByaWdodCxcbiAgICAgIGJvdHRvbTogYm90dG9tLFxuICAgICAgY29sb3I6IGNvbG9yXG4gICAgfVxuXG4gICAgdmFyIGlzQ3Jhc2ggPSBmYWxzZVxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy5kYXRhTGFiZWxzLmxlbmd0aDsgaSsrKSB7XG4gICAgICB2YXIgZGF0YUxhYmVsID0gdGhpcy5kYXRhTGFiZWxzW2ldXG4gICAgICBpZiAodGhpcy5pc1JlY3RDcmFzaChjdXJyRGF0YUxhYmVsLCBkYXRhTGFiZWwpKSB7XG4gICAgICAgIGlzQ3Jhc2ggPSB0cnVlXG4gICAgICAgIGJyZWFrXG4gICAgICB9XG4gICAgfVxuICAgIGlmICghaXNDcmFzaCkge1xuICAgICAgdGhpcy5kYXRhTGFiZWxzLnB1c2goY3VyckRhdGFMYWJlbClcbiAgICB9XG4gIH1cblxuICBpc1JlY3RDcmFzaChhLCBiKSB7XG4gICAgdmFyIGxlZnQgPSBNYXRoLm1heChhLmxlZnQsIGIubGVmdClcbiAgICB2YXIgdG9wID0gTWF0aC5tYXgoYS50b3AsIGIudG9wKVxuICAgIHZhciByaWdodCA9IE1hdGgubWluKGEucmlnaHQsIGIucmlnaHQpXG4gICAgdmFyIGJvdHRvbSA9IE1hdGgubWluKGEuYm90dG9tLCBiLmJvdHRvbSlcblxuICAgIHJldHVybiBsZWZ0IDw9IHJpZ2h0ICYmIHRvcCA8PSBib3R0b21cbiAgfVxuXG4gIGRyYXdEYXRhTGFiZWxMYXllcihjYW52YXMpIHtcbiAgICBjYW52YXMuc2V0VGV4dEFsaWduKCdsZWZ0JylcbiAgICBjYW52YXMuc2V0Rm9udFNpemUodGhpcy5kYXRhTGFiZWxGb250U2l6ZSlcblxuICAgIHRoaXMuZGF0YUxhYmVscy5tYXAoKGRhdGFMYWJlbCwgaW5kZXgpID0+IHtcbiAgICAgIGNhbnZhcy5zZXRGaWxsU3R5bGUoZGF0YUxhYmVsLmNvbG9yKVxuICAgICAgY2FudmFzLmZpbGxUZXh0KGRhdGFMYWJlbC5sYWJlbCwgZGF0YUxhYmVsLmxlZnQsIGRhdGFMYWJlbC5ib3R0b20pXG4gICAgfSlcbiAgfVxuXG4gIGRyYXdOb0RhdGEoY2FudmFzKSB7XG4gICAgdmFyIHRleHQgPSB0aGlzLm5vRGF0YVRleHRcbiAgICB2YXIgdGV4dFdpZHRoID0gY2FudmFzLm15TWVhc3VyZVRleHQodGV4dCwgdGhpcy5ub0RhdGFGb250U2l6ZSlcbiAgICBjYW52YXMuc2V0RmlsbFN0eWxlKHRoaXMubm9EYXRhVGV4dENvbG9yKVxuICAgIGNhbnZhcy5maWxsVGV4dCh0ZXh0LCAodGhpcy53aWR0aCAtIHRleHRXaWR0aCkgLyAyLCAodGhpcy5oZWlnaHQgKyB0aGlzLm5vRGF0YUZvbnRTaXplKSAvIDIpXG4gIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBGdW5uZWw7XG4iLCJ2YXIgY2hhcnRVdGlscyA9IHJlcXVpcmUoJy4vY2hhcnRVdGlsLmpzJylcbmNvbnN0IHtBbmltYXRpb259ID0gY2hhcnRVdGlsc1xuXG5jbGFzcyBQb2xhciB7XG4gIGNvbnN0cnVjdG9yKG9wdHMpIHtcbiAgICBjb25zb2xlLmxvZyhvcHRzKVxuXG4gICAgdGhpcy5jYW52YXMgPSBvcHRzLmNhbnZhc1xuICAgIHRoaXMud2lkdGggPSBvcHRzLndpZHRoXG4gICAgdGhpcy5oZWlnaHQgPSBvcHRzLmhlaWdodFxuICAgIHRoaXMuY2hhcnRQYWRkaW5nID0gb3B0cy5jaGFydFBhZGRpbmcgfHwgNDBcbiAgICB0aGlzLmNoYXJ0UGFkZGluZ0xlZnQgPSBvcHRzLmNoYXJ0UGFkZGluZ0xlZnQgfHwgNDBcbiAgICB0aGlzLmNoYXJ0UGFkZGluZ1JpZ2h0ID0gb3B0cy5jaGFydFBhZGRpbmdSaWdodCB8fCA0MFxuICAgIHRoaXMuY2hhcnRQYWRkaW5nVG9wID0gb3B0cy5jaGFydFBhZGRpbmdUb3AgfHwgNDBcbiAgICB0aGlzLmNoYXJ0UGFkZGluZ0JvdHRvbSA9IG9wdHMuY2hhcnRQYWRkaW5nQm90dG9tIHx8IDQwXG4gICAgdGhpcy5wb2xhcldpZHRoID0gb3B0cy5wb2xhcldpZHRoIHx8IE1hdGgubWluKHRoaXMud2lkdGgsIHRoaXMuaGVpZ2h0KSAtIHRoaXMuY2hhcnRQYWRkaW5nICogMlxuICAgIHRoaXMuY2lyY2xlUmFkaXVzID0gb3B0cy5jaXJjbGVSYWRpdXMgfHwgM1xuICAgIHRoaXMubGluZVdpZHRoID0gb3B0cy5saW5lV2lkdGggfHwgMlxuXG4gICAgdGhpcy5oaWdoTGlnaHRJbmRleCA9IC0xXG4gICAgdGhpcy5oaWdoTGlnaHRDb2xvciA9ICdyZ2JhKDAsIDAsIDAsIDAuMyknXG4gICAgdGhpcy5heGlzSGlnaExpZ2h0RW5hYmxlID0gb3B0cy5heGlzSGlnaExpZ2h0RW5hYmxlIHx8IHRydWVcbiAgICB0aGlzLmF4aXNIaWdoTGlnaHRDb2xvciA9IG9wdHMuYXhpc0ZvbnRDb2xvciB8fCAnIzY5QjVGQydcblxuICAgIHRoaXMuZHJhd0RhdGFMYWJlbCA9IG9wdHMuZHJhd0RhdGFMYWJlbCB8fCBmYWxzZVxuICAgIHRoaXMuZGF0YUxhYmVsRm9udFNpemUgPSBvcHRzLmRhdGFMYWJlbEZvbnRTaXplIHx8IDhcbiAgICB0aGlzLmRhdGFMYWJlbFBhZGRpbmcgPSBvcHRzLmRhdGFMYWJlbFBhZGRpbmcgfHwgNFxuICAgIHRoaXMuZGF0YUxhYmVsQ29sb3IgPSBvcHRzLmRhdGFMYWJlbENvbG9yIHx8ICcjMTExMTExJ1xuXG4gICAgdGhpcy5kcmF3V2l0aEFuaW1hdGlvbiA9IG9wdHMuZHJhd1dpdGhBbmltYXRpb24gPT09IHVuZGVmaW5lZCA/IHRydWUgOiBvcHRzLmRyYXdXaXRoQW5pbWF0aW9uXG5cbiAgICB0aGlzLm5vRGF0YSA9IG9wdHMubm9EYXRhIHx8IGZhbHNlXG4gICAgdGhpcy5ub0RhdGFUZXh0ID0gb3B0cy5ub0RhdGFUZXh0IHx8ICfmmoLml6DmlbDmja4nXG4gICAgdGhpcy5ub0RhdGFUZXh0Q29sb3IgPSBvcHRzLm5vRGF0YVRleHRDb2xvciB8fCAnIzY5QjVGQydcbiAgICB0aGlzLm5vRGF0YUZvbnRTaXplID0gb3B0cy5ub0RhdGFGb250U2l6ZSB8fCAxMVxuICAgIHRoaXMuZGF0YSA9IG9wdHMuZGF0YVxuXG4gICAgdGhpcy5heGlzRW5hYmxlID0gb3B0cy5heGlzRW5hYmxlIHx8IGZhbHNlXG4gICAgdGhpcy5heGlzRm9udFNpemUgPSBvcHRzLmF4aXNGb250U2l6ZSB8fCAxMFxuICAgIHRoaXMuYXhpc1ZhbHVlUGFkZGluZyA9IG9wdHMuYXhpc1ZhbHVlUGFkZGluZyB8fCA1XG4gICAgdGhpcy5heGlzTGluZVdpZHRoID0gb3B0cy5heGlzTGluZVdpZHRoIHx8IDFcbiAgICB0aGlzLmF4aXNMaW5lQ29sb3IgPSBvcHRzLmF4aXNMaW5lQ29sb3IgfHwgJyNkZGRkZGQnXG4gICAgdGhpcy5heGlzRm9udENvbG9yID0gb3B0cy5heGlzRm9udENvbG9yIHx8ICcjNDQ0NDQ0J1xuICAgIHRoaXMuYXJjVHlwZSA9IG9wdHMuYXJjVHlwZSB8fCAnYXJjJ1xuXG4gICAgdGhpcy5sZWdlbmRFbmFibGUgPSBvcHRzLmxlZ2VuZEVuYWJsZSB8fCBmYWxzZVxuICAgIHRoaXMubGVnZW5kRm9udFNpemUgPSBvcHRzLmxlZ2VuZEZvbnRTaXplIHx8IDEwXG4gICAgdGhpcy5sZWdlbmRQYWRkaW5nVG9wID0gb3B0cy5sZWdlbmRQYWRkaW5nVG9wIHx8IDYwXG4gICAgdGhpcy5sZWdlbmRUZXh0Q29sb3IgPSBvcHRzLmxlZ2VuZFRleHRDb2xvciB8fCAnIzAwMDAwMCdcblxuICAgIHRoaXMudG9vbHRpcENhbGxCYWNrID0gb3B0cy50b29sdGlwQ2FsbEJhY2tcbiAgICB0aGlzLnRvb2xUaXBCYWNrZ3JvdW5kQ29sb3IgPSBvcHRzLnRvb2xUaXBCYWNrZ3JvdW5kQ29sb3IgfHwgJ3JnYmEoMCwgMCwgMCwgMC42KSdcbiAgICB0aGlzLnRvb2xUaXBQYWRkaW5nID0gb3B0cy50b29sVGlwUGFkZGluZyB8fCAxMFxuICAgIHRoaXMudG9vbFRpcFRleHRQYWRkaW5nID0gb3B0cy50b29sVGlwVGV4dFBhZGRpbmcgfHwgOFxuICAgIHRoaXMudG9vbFRpcEZvbnRTaXplID0gb3B0cy50b29sVGlwRm9udFNpemUgfHwgMTBcbiAgICB0aGlzLnRvb2xUaXBTcGxpdExpbmVXaWR0aCA9IG9wdHMudG9vbFRpcFNwbGl0TGluZVdpZHRoIHx8IDFcbiAgICB0aGlzLnRvb2xUaXBTcGxpdExpbmVDb2xvciA9IG9wdHMudG9vbFRpcFNwbGl0TGluZUNvbG9yIHx8ICcjZmZmZmZmJ1xuXG4gICAgdGhpcy5tdXRlQ2FsbGJhY2sgPSBvcHRzLm11dGVDYWxsYmFjayB8fCBmdW5jdGlvbiAoKSB7IHJldHVybiAnJyB9XG4gICAgdGhpcy5zZXJpZXNTdGF0dXMgPSBvcHRzLnNlcmllc1N0YXR1c1xuXG4gICAgdGhpcy5tYXhWYWx1ZSA9IG9wdHMubWF4VmFsdWVcbiAgICB0aGlzLm1pblZhbHVlID0gb3B0cy5taW5WYWx1ZVxuICAgIHRoaXMueEF4aXNEYXRhID0gb3B0cy54QXhpc0RhdGFcbiAgICB0aGlzLnkxVGlja3MgPSBvcHRzLnkxVGlja3MgfHwgW11cbiAgICB0aGlzLnN0YXJ0QW5nbGUgPSAtIE1hdGguUEkgLyAyXG5cbiAgICB2YXIgY29sb3JzID0gWycjN2NiNWVjJywgJyNmN2EzNWMnLCAnIzQzNDM0OCcsICcjOTBlZDdkJywgJyNmMTVjODAnLCAnIzgwODVlOScsICcjRTREMzU0JywgJyMyQjkwOEYnLCAnI0Y0NUI1QicsICcjOTFFOEUxJywgJyM3Q0I1RUMnLCAnIzQzNDM0OCddXG4gICAgdGhpcy5jb2xvcnMgPSBvcHRzLmNvbG9ycyAmJiBvcHRzLmNvbG9ycy5zbGljZSgpIHx8IGNvbG9yc1xuXG4gICAgdGhpcy5kcmF3KClcbiAgfVxuXG4gIGdldENvbG9yKGluZGV4KSB7XG4gICAgaWYgKHRoaXMuaXNIaWRkZW5TZXJpZXMoaW5kZXgpKSB7XG4gICAgICByZXR1cm4gJyNjY2NjY2MnXG4gICAgfVxuICAgIGlmICh0aGlzLmRyYXdPcmRlciAmJiB0aGlzLmRyYXdPcmRlci5sZW5ndGggJiYgaW5kZXggPCB0aGlzLmRyYXdPcmRlci5sZW5ndGgpIHtcbiAgICAgIGluZGV4ID0gdGhpcy5kcmF3T3JkZXJbaW5kZXhdXG4gICAgfVxuICAgIHJldHVybiB0aGlzLmNvbG9yc1tpbmRleCAlIHRoaXMuY29sb3JzLmxlbmd0aF1cbiAgfVxuXG4gIGlzSGlkZGVuU2VyaWVzKGluZGV4KSB7XG4gICAgcmV0dXJuIHRoaXMuc2VyaWVzU3RhdHVzICYmIHRoaXMuc2VyaWVzU3RhdHVzW2luZGV4XVxuICB9XG5cbiAgY2FsY3VsYXRlQ2xpY2tQb3NpdGlvbihlLCBpc01vdmUgPSBmYWxzZSkge1xuICAgIGlmICh0aGlzLm5vRGF0YSB8fCB0aGlzLnByb2Nlc3MgIT0gMSkge1xuICAgICAgcmV0dXJuIC0xXG4gICAgfVxuICAgIGlmIChlLnRvdWNoZXMgJiYgZS50b3VjaGVzLmxlbmd0aCkge1xuICAgICAgdmFyIHggPSBlLnRvdWNoZXNbMF0ueFxuICAgICAgdmFyIHkgPSBlLnRvdWNoZXNbMF0ueVxuXG4gICAgICB2YXIgd2lkdGggPSB0aGlzLndpZHRoXG4gICAgICB2YXIgaGVpZ2h0ID0gdGhpcy5oZWlnaHRcbiAgICAgIHZhciBjaGFydFBhZGRpbmcgPSB0aGlzLmNoYXJ0UGFkZGluZ1xuICAgICAgdmFyIGxlZ2VuZFBhZGRpbmdUb3AgPSB0aGlzLmxlZ2VuZFBhZGRpbmdUb3BcbiAgICAgIHZhciBsZWdlbmRGb250U2l6ZSA9IHRoaXMubGVnZW5kRm9udFNpemVcblxuICAgICAgdmFyIHBvbGFyV2lkdGggPSB0aGlzLnBvbGFyV2lkdGhcbiAgICAgIHZhciBwb2xhclJhZGl1cyA9IHBvbGFyV2lkdGggLyAyXG4gICAgICB2YXIgc2l6ZSA9IHRoaXMueEF4aXNEYXRhLmxlbmd0aFxuICAgICAgdmFyIHByZUFuZ2xlID0gMiAqIE1hdGguUEkgLyBzaXplXG5cbiAgICAgIHZhciBzdGFydEFuZ2xlID0gdGhpcy5zdGFydEFuZ2xlXG4gICAgICB2YXIgY2VudGVyWCA9IHRoaXMud2lkdGggLyAyXG4gICAgICB2YXIgY2VudGVyWSA9IHRoaXMuaGVpZ2h0IC8gMlxuXG4gICAgICBpZihNYXRoLnBvdyh4IC0gY2VudGVyWCwgMikgKyBNYXRoLnBvdyh5IC0gY2VudGVyWSwgMikgPD0gTWF0aC5wb3cocG9sYXJSYWRpdXMsIDIpKSB7XG4gICAgICAgIHZhciBjdXJyQW5nbGUgPSAodGhpcy5nZXRBbmdsZUZvclBvaW50KHgsIHkpIC0gc3RhcnRBbmdsZSArIDIgKiBNYXRoLlBJKSAlICgyICogTWF0aC5QSSlcbiAgICAgICAgdmFyIGNpID0gY3VyckFuZ2xlIC8gcHJlQW5nbGVcbiAgICAgICAgdmFyIGluZGV4ID0gTWF0aC5mbG9vcihjaSlcbiAgICAgICAgaWYgKGNpIC0gaW5kZXggPiAwLjUpIHtcbiAgICAgICAgICBpbmRleCArPSAxXG4gICAgICAgICAgaW5kZXggPSBpbmRleCAlIHRoaXMueEF4aXNEYXRhLmxlbmd0aFxuICAgICAgICB9XG4gICAgICAgIHJldHVybiBpbmRleFxuICAgICAgfVxuXG4gICAgICBpZiAoaXNNb3ZlKSB7XG4gICAgICAgIHJldHVybiAtMVxuICAgICAgfVxuXG4gICAgICBpZiAoeCA+IGNoYXJ0UGFkZGluZyAmJiB4IDwgdGhpcy53aWR0aCAtIGNoYXJ0UGFkZGluZyAmJiB5ID4gdGhpcy5oZWlnaHQgLyAyICsgdGhpcy5wb2xhcldpZHRoIC8gMiArIGxlZ2VuZFBhZGRpbmdUb3AgJiYgeSA8IHRoaXMuaGVpZ2h0IC8gMiArIHRoaXMucG9sYXJXaWR0aCAvIDIgKyBsZWdlbmRQYWRkaW5nVG9wICsgbGVnZW5kRm9udFNpemUpIHtcbiAgICAgICAgdmFyIGxlZ2VuZFdpZHRoID0gdGhpcy5sZWdlbmRXaWR0aFxuICAgICAgICB2YXIgaXNNdWx0aUxpbmUgPSB0aGlzLmlzTXVsdGlMaW5lXG5cbiAgICAgICAgaWYgKCFpc011bHRpTGluZSkge1xuICAgICAgICAgIHZhciBzdGFydFggPSAodGhpcy53aWR0aCAtIGxlZ2VuZFdpZHRoKSAvIDJcblxuICAgICAgICAgIGlmICh4ID49IHN0YXJ0WCAmJiB4IDw9IHRoaXMud2lkdGggLSBzdGFydFgpIHtcbiAgICAgICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy5sZWdlbmRMaXN0Lmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAgIHZhciB0ZXh0V2lkdGggPSB0aGlzLmNhbnZhcy5teU1lYXN1cmVUZXh0KHRoaXMubGVnZW5kTGlzdFtpXSwgbGVnZW5kRm9udFNpemUpXG4gICAgICAgICAgICAgIGlmICh4IDwgc3RhcnRYICsgdGV4dFdpZHRoICsgbGVnZW5kRm9udFNpemUgKiAyLjIpIHtcbiAgICAgICAgICAgICAgICB2YXIgY2hhcnRJbmZvID0gdGhpcy5tdXRlQ2FsbGJhY2soaSlcbiAgICAgICAgICAgICAgICB0aGlzLmRhdGEgPSBjaGFydEluZm8uZGF0YVxuICAgICAgICAgICAgICAgIHRoaXMuc2VyaWVzU3RhdHVzID0gY2hhcnRJbmZvLnNlcmllc1N0YXR1c1xuICAgICAgICAgICAgICAgIHRoaXMuZHJhdyh0cnVlLCBmYWxzZSlcbiAgICAgICAgICAgICAgICBicmVha1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIHN0YXJ0WCArPSBsZWdlbmRGb250U2l6ZSAqIDIuMiArIHRleHRXaWR0aFxuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICB2YXIgc3RhcnRYID0gY2hhcnRQYWRkaW5nXG5cbiAgICAgICAgICBpZiAoc3RhcnRYICsgbGVnZW5kRm9udFNpemUgKiAxLjIgKiB0aGlzLmxlZ2VuZExpc3QubGVuZ3RoIDw9IHRoaXMud2lkdGgpIHtcbiAgICAgICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy5sZWdlbmRMaXN0Lmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAgIGlmICh4IDwgc3RhcnRYICsgbGVnZW5kRm9udFNpemUgKiAxLjIpIHtcbiAgICAgICAgICAgICAgICB2YXIgY2hhcnRJbmZvID0gdGhpcy5tdXRlQ2FsbGJhY2soaSlcbiAgICAgICAgICAgICAgICB0aGlzLmRhdGEgPSBjaGFydEluZm8uZGF0YVxuICAgICAgICAgICAgICAgIHRoaXMuc2VyaWVzU3RhdHVzID0gY2hhcnRJbmZvLnNlcmllc1N0YXR1c1xuICAgICAgICAgICAgICAgIHRoaXMuZHJhdyh0cnVlLCBmYWxzZSlcbiAgICAgICAgICAgICAgICBicmVha1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIHN0YXJ0WCArPSBsZWdlbmRGb250U2l6ZSAqIDEuMlxuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICByZXR1cm4gLTFcbiAgICB9XG4gICAgcmV0dXJuIC0xXG4gIH1cblxuICBnZXRBbmdsZUZvclBvaW50KHgsIHkpIHtcbiAgICB2YXIgY2VudGVyWCA9IHRoaXMud2lkdGggLyAyXG4gICAgdmFyIGNlbnRlclkgPSB0aGlzLmhlaWdodCAvIDJcblxuICAgIHZhciB0eCA9IHggLSBjZW50ZXJYLCB0eSA9IHkgLSBjZW50ZXJZXG4gICAgdmFyIGxlbmd0aCA9IE1hdGguc3FydCh0eCAqIHR4ICsgdHkgKiB0eSlcbiAgICB2YXIgciA9IE1hdGguYWNvcyh0eSAvIGxlbmd0aClcblxuICAgIHZhciBhbmdsZSA9IHJcbiAgICBpZiAoeCA+IGNlbnRlclgpIHtcbiAgICAgIGFuZ2xlID0gMiAqIE1hdGguUEkgLSBhbmdsZVxuICAgIH1cbiAgICBhbmdsZSA9IGFuZ2xlICsgTWF0aC5QSSAvIDJcbiAgICBpZiAoYW5nbGUgPiAyICogTWF0aC5QSSkge1xuICAgICAgYW5nbGUgPSBhbmdsZSAtIDIgKiBNYXRoLlBJXG4gICAgfVxuXG4gICAgcmV0dXJuIGFuZ2xlXG4gIH1cblxuICBzaG93VG9vbFRpcChlLCBpc01vdmUgPSBmYWxzZSkge1xuICAgIHZhciBpbmRleCA9IHRoaXMuY2FsY3VsYXRlQ2xpY2tQb3NpdGlvbihlLCBpc01vdmUpXG4gICAgaWYgKHRoaXMuaGlnaExpZ2h0SW5kZXggPT0gaW5kZXggJiYgaW5kZXggPT0gLTEpIHtcbiAgICAgIHJldHVyblxuICAgIH1cbiAgICBpZiAodGhpcy5oaWdoTGlnaHRJbmRleCA9PSBpbmRleCAmJiAhaXNNb3ZlKSB7XG4gICAgICB0aGlzLmhpZ2hMaWdodEluZGV4ID0gLTFcbiAgICB9IGVsc2UgaWYgKHRoaXMuaGlnaExpZ2h0SW5kZXggPT0gaW5kZXggJiYgdGhpcy5oaWdoTGlnaHRZICYmIE1hdGguYWJzKHRoaXMuaGlnaExpZ2h0WSAtIGUudG91Y2hlc1swXS55KSA8IDEwKSB7XG4gICAgICByZXR1cm5cbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5oaWdoTGlnaHRJbmRleCA9IGluZGV4XG5cbiAgICAgIGlmIChpbmRleCAhPSAtMSkge1xuICAgICAgICB2YXIgaGlnaExpZ2h0RGF0YSA9IHRoaXMudG9vbHRpcENhbGxCYWNrKGluZGV4KVxuICAgICAgICB0aGlzLmhpZ2hMaWdodERhdGEgPSBoaWdoTGlnaHREYXRhXG4gICAgICAgIHRoaXMuaGlnaExpZ2h0WSA9IGUudG91Y2hlc1swXS55XG4gICAgICAgIHRoaXMuaGlnaExpZ2h0WCA9IGUudG91Y2hlc1swXS54XG4gICAgICB9XG4gICAgfVxuICAgIHRoaXMuZHJhdyhmYWxzZSlcbiAgfVxuXG4gIGhpZGRlbkhpZ2hMaWdodCgpIHtcbiAgICBpZiAodGhpcy5oaWdoTGlnaHRJbmRleCA9PSAtMSkge1xuICAgICAgcmV0dXJuXG4gICAgfVxuICAgIHRoaXMuaGlnaExpZ2h0SW5kZXggPSAtMVxuICAgIHRoaXMuZHJhdyhmYWxzZSlcbiAgfVxuXG4gIGRyYXcoaXNBbmltYXRpb24gPSB0cnVlLCBhbmltYXRpb25XaXRoTGVnZW5kID0gdHJ1ZSkge1xuICAgIHRoaXMuaXNEcmF3RmluaXNoID0gZmFsc2VcbiAgICB2YXIgY2FudmFzID0gdGhpcy5jYW52YXNcblxuICAgIGlmICh0aGlzLm5vRGF0YSkge1xuICAgICAgdGhpcy5kcmF3Tm9EYXRhKGNhbnZhcylcbiAgICAgIGNhbnZhcy5kcmF3KClcbiAgICAgIHRoaXMuaXNEcmF3RmluaXNoID0gdHJ1ZVxuICAgIH0gZWxzZSB7XG4gICAgICB2YXIgdGhhdCA9IHRoaXNcbiAgICAgIHZhciBkdXJhdGlvbiA9IGlzQW5pbWF0aW9uICYmIHRoaXMuZHJhd1dpdGhBbmltYXRpb24gPyAxMDAwIDogMFxuICAgICAgdmFyIGFuaW1hdGlvbiA9IG5ldyBBbmltYXRpb24oe1xuICAgICAgICB0aW1pbmc6ICdlYXNlSW4nLFxuICAgICAgICBkdXJhdGlvbjogZHVyYXRpb24sXG4gICAgICAgIG9uUHJvY2VzczogZnVuY3Rpb24gKHByb2Nlc3MpIHtcbiAgICAgICAgICBjYW52YXMuY2xlYXJSZWN0ICYmIGNhbnZhcy5jbGVhclJlY3QoMCwgMCwgdGhhdC53aWR0aCwgdGhhdC5oZWlnaHQpXG4gICAgICAgICAgdGhhdC5wcm9jZXNzID0gcHJvY2Vzc1xuXG4gICAgICAgICAgdGhhdC5kcmF3QXhpcyhjYW52YXMpXG4gICAgICAgICAgdGhhdC5kcmF3TGF5ZXJEYXRhKGNhbnZhcylcbiAgICAgICAgICB0aGF0LmRyYXdBeGlzVmFsdWUoY2FudmFzKVxuICAgICAgICAgIHRoYXQuZHJhd1Rvb2xUaXAoY2FudmFzKVxuXG4gICAgICAgICAgaWYgKHRoYXQubGVnZW5kRW5hYmxlKSB7XG4gICAgICAgICAgICBpZiAoIWFuaW1hdGlvbldpdGhMZWdlbmQpIHtcbiAgICAgICAgICAgICAgdGhhdC5kcmF3TGVnZW5kKGNhbnZhcylcbiAgICAgICAgICAgIH0gZWxzZSBpZiAocHJvY2VzcyA9PSAxKSB7XG4gICAgICAgICAgICAgIHRoYXQuZHJhd0xlZ2VuZChjYW52YXMpXG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICAgIGNhbnZhcy5kcmF3KClcbiAgICAgICAgfSxcbiAgICAgICAgb25BbmltYXRpb25GaW5pc2g6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICB0aGF0LmlzRHJhd0ZpbmlzaCA9IHRydWVcbiAgICAgICAgfVxuICAgICAgfSlcbiAgICB9XG4gIH1cblxuICBkcmF3VG9vbFRpcChjYW52YXMpIHtcbiAgICBpZiAodGhpcy5oaWdoTGlnaHRJbmRleCA9PSAtMSkge1xuICAgICAgcmV0dXJuXG4gICAgfVxuICAgIHZhciBwcmVBbmdsZSA9IDIgKiBNYXRoLlBJIC8gdGhpcy54QXhpc0RhdGEubGVuZ3RoXG4gICAgdmFyIGNoYXJ0UGFkZGluZyA9IHRoaXMuY2hhcnRQYWRkaW5nXG4gICAgdmFyIGNoYXJ0Q29udGVudEhlaWdodCA9IHRoaXMuaGVpZ2h0IC0gY2hhcnRQYWRkaW5nICogMlxuICAgIHZhciB4ID0gdGhpcy53aWR0aCAvIDIgKyB0aGlzLnBvbGFyV2lkdGggLyA0ICogTWF0aC5jb3MocHJlQW5nbGUgKiB0aGlzLmhpZ2hMaWdodEluZGV4ICsgdGhpcy5zdGFydEFuZ2xlKVxuICAgIHZhciB5ID0gdGhpcy5oZWlnaHQgLyAyICsgdGhpcy5wb2xhcldpZHRoIC8gNCAqIE1hdGguc2luKHByZUFuZ2xlICogdGhpcy5oaWdoTGlnaHRJbmRleCArIHRoaXMuc3RhcnRBbmdsZSlcblxuICAgIHZhciB0b29sVGlwQmFja2dyb3VuZENvbG9yID0gdGhpcy50b29sVGlwQmFja2dyb3VuZENvbG9yXG4gICAgdmFyIHRvb2xUaXBQYWRkaW5nID0gdGhpcy50b29sVGlwUGFkZGluZ1xuICAgIHZhciB0b29sVGlwVGV4dFBhZGRpbmcgPSB0aGlzLnRvb2xUaXBUZXh0UGFkZGluZ1xuICAgIHZhciB0b29sVGlwRm9udFNpemUgPSB0aGlzLnRvb2xUaXBGb250U2l6ZVxuICAgIHZhciB0b29sVGlwU3BsaXRMaW5lV2lkdGggPSB0aGlzLnRvb2xUaXBTcGxpdExpbmVXaWR0aFxuICAgIHZhciB0b29sVGlwU3BsaXRMaW5lQ29sb3IgPSB0aGlzLnRvb2xUaXBTcGxpdExpbmVDb2xvclxuXG4gICAgdmFyIHRvb2xUaXBXaWR0aCA9IHRvb2xUaXBQYWRkaW5nICogMlxuICAgIHZhciB0b29sVGlwSGVpZ2h0ID0gdG9vbFRpcFBhZGRpbmcgKiAyXG5cbiAgICB2YXIgaGlnaExpZ2h0RGF0YSA9IHRoaXMuaGlnaExpZ2h0RGF0YVxuXG4gICAgLy90aXRsZVxuICAgIHZhciBtYXhUaXBMaW5lV2lkdGggPSBjYW52YXMubXlNZWFzdXJlVGV4dChoaWdoTGlnaHREYXRhLnRpdGxlLCB0b29sVGlwRm9udFNpemUpXG4gICAgdG9vbFRpcEhlaWdodCArPSB0b29sVGlwRm9udFNpemUgKyB0b29sVGlwU3BsaXRMaW5lV2lkdGggKyB0b29sVGlwVGV4dFBhZGRpbmdcbiAgICBoaWdoTGlnaHREYXRhLmRhdGEubWFwKCh0ZXh0LCBpbmRleCkgPT4ge1xuICAgICAgdG9vbFRpcEhlaWdodCArPSB0b29sVGlwRm9udFNpemUgKyB0b29sVGlwVGV4dFBhZGRpbmdcblxuICAgICAgdmFyIHRleHRXaWR0aCA9IGNhbnZhcy5teU1lYXN1cmVUZXh0KHRleHQsIHRvb2xUaXBGb250U2l6ZSlcbiAgICAgIGlmIChtYXhUaXBMaW5lV2lkdGggPCB0ZXh0V2lkdGgpIHtcbiAgICAgICAgbWF4VGlwTGluZVdpZHRoID0gdGV4dFdpZHRoXG4gICAgICB9XG4gICAgfSlcbiAgICB0b29sVGlwV2lkdGggKz0gbWF4VGlwTGluZVdpZHRoXG5cbiAgICB2YXIgc3RhcnRYID0geCAtIHRvb2xUaXBXaWR0aCAvIDJcbiAgICB2YXIgc3RhcnRZID0geSAtIHRvb2xUaXBIZWlnaHQgLyAyXG4gICAgaWYgKHkgKyB0b29sVGlwSGVpZ2h0ID4gY2hhcnRDb250ZW50SGVpZ2h0ICsgY2hhcnRQYWRkaW5nKSB7XG4gICAgICBzdGFydFkgPSBjaGFydENvbnRlbnRIZWlnaHQgKyBjaGFydFBhZGRpbmcgLSB0b29sVGlwSGVpZ2h0XG4gICAgfVxuXG4gICAgY2FudmFzLnNldEZpbGxTdHlsZSh0b29sVGlwQmFja2dyb3VuZENvbG9yKVxuICAgIGNhbnZhcy5iZWdpblBhdGgoKVxuICAgIGNhbnZhcy5maWxsUmVjdChzdGFydFgsIHN0YXJ0WSwgdG9vbFRpcFdpZHRoLCB0b29sVGlwSGVpZ2h0KVxuICAgIGNhbnZhcy5jbG9zZVBhdGgoKVxuXG4gICAgY2FudmFzLnNldEZpbGxTdHlsZSh0b29sVGlwU3BsaXRMaW5lQ29sb3IpXG4gICAgY2FudmFzLnNldFN0cm9rZVN0eWxlKHRvb2xUaXBTcGxpdExpbmVDb2xvcilcbiAgICBjYW52YXMuc2V0TGluZVdpZHRoKHRvb2xUaXBTcGxpdExpbmVXaWR0aClcbiAgICBjYW52YXMuc2V0Rm9udFNpemUodG9vbFRpcEZvbnRTaXplKVxuXG4gICAgdmFyIGRyYXdYID0gc3RhcnRYICsgdG9vbFRpcFBhZGRpbmdcbiAgICB2YXIgZHJhd1kgPSBzdGFydFkgKyB0b29sVGlwUGFkZGluZyArIHRvb2xUaXBGb250U2l6ZVxuXG4gICAgY2FudmFzLmZpbGxUZXh0KGhpZ2hMaWdodERhdGEudGl0bGUsIGRyYXdYLCBkcmF3WSlcbiAgICBkcmF3WSArPSB0b29sVGlwVGV4dFBhZGRpbmcgKyB0b29sVGlwU3BsaXRMaW5lV2lkdGggLyAyXG4gICAgY2FudmFzLmJlZ2luUGF0aCgpXG4gICAgY2FudmFzLm1vdmVUbyhkcmF3WCAtIHRvb2xUaXBQYWRkaW5nICogMC4yNSwgZHJhd1kpXG4gICAgY2FudmFzLmxpbmVUbyhkcmF3WCArIHRvb2xUaXBXaWR0aCAtIHRvb2xUaXBQYWRkaW5nICogMS43NSwgZHJhd1kpXG4gICAgY2FudmFzLnN0cm9rZSgpXG4gICAgY2FudmFzLmNsb3NlUGF0aCgpXG5cbiAgICBoaWdoTGlnaHREYXRhLmRhdGEubWFwKCh0ZXh0LCBpbmRleCkgPT4ge1xuICAgICAgZHJhd1kgKz0gdG9vbFRpcFRleHRQYWRkaW5nICsgdG9vbFRpcEZvbnRTaXplXG4gICAgICBjYW52YXMuZmlsbFRleHQodGV4dCwgZHJhd1gsIGRyYXdZKVxuICAgIH0pXG4gIH1cblxuICBkcmF3TGF5ZXJEYXRhKGNhbnZhcykge1xuICAgIHZhciB0aGF0ID0gdGhpc1xuICAgIHZhciBjb2xvclBvc2l0aW9uID0gMFxuICAgIHRoaXMuZGF0YS5tYXAoKGxheWVyLCBpbmRleCkgPT4ge1xuICAgICAgdmFyIHByZUdyb3VwU2l6ZSA9IChsYXllci5kYXRhID09IHVuZGVmaW5lZCB8fCBsYXllci5kYXRhLmxlbmd0aCA9PSAwIHx8IGxheWVyLmRhdGFbMF0uc3ViRGF0YSA9PSB1bmRlZmluZWQpID8gMSA6IGxheWVyLmRhdGFbMF0uc3ViRGF0YS5sZW5ndGhcbiAgICAgIHN3aXRjaCAobGF5ZXIudHlwZSkge1xuICAgICAgICBjYXNlICdsaW5lJzpcbiAgICAgICAgICB0aGF0LmRyYXdQb2xhcihjYW52YXMsIGxheWVyLCBjb2xvclBvc2l0aW9uLCB0cnVlKVxuICAgICAgICAgIGJyZWFrXG4gICAgICAgIGNhc2UgJ3N0YWNrJzpcbiAgICAgICAgICB0aGF0LmRyYXdCYXIoY2FudmFzLCBsYXllciwgY29sb3JQb3NpdGlvbilcbiAgICAgICAgICBicmVha1xuICAgICAgfVxuICAgICAgY29sb3JQb3NpdGlvbiArPSBwcmVHcm91cFNpemVcbiAgICB9KVxuICB9XG5cbiAgZHJhd0JhcihjYW52YXMsIGxheWVyLCBjb2xvclBvc2l0aW9uKSB7XG4gICAgdmFyIHByb2Nlc3MgPSB0aGlzLnByb2Nlc3NcblxuICAgIHZhciBwb2xhcldpZHRoID0gdGhpcy5wb2xhcldpZHRoXG4gICAgdmFyIHBvbGFyUmFkaXVzID0gcG9sYXJXaWR0aCAvIDJcbiAgICB2YXIgbWF4ID0gdGhpcy5tYXhWYWx1ZVxuICAgIHZhciBtaW4gPSB0aGlzLm1pblZhbHVlXG4gICAgdmFyIHNpemUgPSBsYXllci5kYXRhLmxlbmd0aFxuICAgIHZhciBkcmF3U2l6ZSA9IHNpemUgKiBwcm9jZXNzXG4gICAgdmFyIHByZUFuZ2xlID0gMiAqIE1hdGguUEkgLyBzaXplXG4gICAgdmFyIHZhbHVlTGVuID0gbWF4IC0gbWluXG5cbiAgICB2YXIgc3RhcnRBbmdsZSA9IHRoaXMuc3RhcnRBbmdsZVxuICAgIHZhciBjZW50ZXJYID0gdGhpcy53aWR0aCAvIDJcbiAgICB2YXIgY2VudGVyWSA9IHRoaXMuaGVpZ2h0IC8gMlxuXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBkcmF3U2l6ZTsgaSsrKSB7XG4gICAgICB2YXIgZW50cnkgPSBsYXllci5kYXRhW2ldXG4gICAgICB2YXIgc3ViU2l6ZSA9IGVudHJ5LnN1YkRhdGEubGVuZ3RoXG5cbiAgICAgIHZhciB0b3RhbCA9IDBcbiAgICAgIGVudHJ5LnN1YkRhdGEubWFwKCh2YWx1ZSwgaW5kZXgpID0+IHtcbiAgICAgICAgaWYodmFsdWUpIHtcbiAgICAgICAgICB0b3RhbCArPSB2YWx1ZVxuICAgICAgICB9XG4gICAgICB9KVxuXG4gICAgICB2YXIgdG90YWxSYWRpdXMgPSAodG90YWwgLSBtaW4pIC8gdmFsdWVMZW4gKiBwb2xhclJhZGl1cyAqIHByb2Nlc3NcbiAgICAgIGZvciAodmFyIGogPSAwOyBqIDwgc3ViU2l6ZTsgaisrKSB7XG4gICAgICAgIGlmKHRvdGFsUmFkaXVzIDw9IDApIHtcbiAgICAgICAgICBicmVha1xuICAgICAgICB9XG5cbiAgICAgICAgdmFyIHN1YkVudHJ5ID0gZW50cnkuc3ViRGF0YVtqXVxuICAgICAgICBpZiAoIXN1YkVudHJ5KSB7XG4gICAgICAgICAgY29udGludWVcbiAgICAgICAgfVxuXG4gICAgICAgIHZhciBjb2xvciA9IHRoaXMuZ2V0Q29sb3IoY29sb3JQb3NpdGlvbiArIGopXG4gICAgICAgIGNhbnZhcy5zZXRGaWxsU3R5bGUoY29sb3IpXG4gICAgICAgIGNhbnZhcy5iZWdpblBhdGgoKVxuICAgICAgICBjYW52YXMubW92ZVRvKGNlbnRlclgsIGNlbnRlclkpXG4gICAgICAgIGlmICh0aGlzLmFyY1R5cGUgPT0gJ2FyYycpIHtcbiAgICAgICAgICBjYW52YXMuYXJjKGNlbnRlclgsIGNlbnRlclksIHRvdGFsUmFkaXVzLCBzdGFydEFuZ2xlIC0gcHJlQW5nbGUgLyAyLCBzdGFydEFuZ2xlICsgcHJlQW5nbGUgLyAyKVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHZhciB4ID0gY2VudGVyWCArIHRvdGFsUmFkaXVzICogTWF0aC5jb3Moc3RhcnRBbmdsZSlcbiAgICAgICAgICB2YXIgeSA9IGNlbnRlclkgKyB0b3RhbFJhZGl1cyAqIE1hdGguc2luKHN0YXJ0QW5nbGUpXG4gICAgICAgICAgdmFyIHgxID0gY2VudGVyWCArIHRvdGFsUmFkaXVzICogTWF0aC5jb3Moc3RhcnRBbmdsZSArIHByZUFuZ2xlKVxuICAgICAgICAgIHZhciB5MiA9IGNlbnRlclkgKyB0b3RhbFJhZGl1cyAqIE1hdGguc2luKHN0YXJ0QW5nbGUgKyBwcmVBbmdsZSlcbiAgICAgICAgICBjYW52YXMubGluZVRvKHgsIHkpXG4gICAgICAgICAgY2FudmFzLmxpbmVUbyh4MSwgeTIpXG4gICAgICAgIH1cbiAgICAgICAgY2FudmFzLmNsb3NlUGF0aCgpXG4gICAgICAgIGNhbnZhcy5maWxsKClcblxuICAgICAgICBpZiAodGhpcy5oaWdoTGlnaHRJbmRleCA9PSBpKSB7XG4gICAgICAgICAgY2FudmFzLnNldEZpbGxTdHlsZSh0aGlzLmhpZ2hMaWdodENvbG9yKVxuICAgICAgICAgIGNhbnZhcy5iZWdpblBhdGgoKVxuICAgICAgICAgIGNhbnZhcy5tb3ZlVG8oY2VudGVyWCwgY2VudGVyWSlcbiAgICAgICAgICBpZiAodGhpcy5hcmNUeXBlID09ICdhcmMnKSB7XG4gICAgICAgICAgICBjYW52YXMuYXJjKGNlbnRlclgsIGNlbnRlclksIHRvdGFsUmFkaXVzLCBzdGFydEFuZ2xlIC0gcHJlQW5nbGUgLyAyLCBzdGFydEFuZ2xlICsgcHJlQW5nbGUgLyAyKVxuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB2YXIgeCA9IGNlbnRlclggKyB0b3RhbFJhZGl1cyAqIE1hdGguY29zKHN0YXJ0QW5nbGUpXG4gICAgICAgICAgICB2YXIgeSA9IGNlbnRlclkgKyB0b3RhbFJhZGl1cyAqIE1hdGguc2luKHN0YXJ0QW5nbGUpXG4gICAgICAgICAgICB2YXIgeDEgPSBjZW50ZXJYICsgdG90YWxSYWRpdXMgKiBNYXRoLmNvcyhzdGFydEFuZ2xlICsgcHJlQW5nbGUpXG4gICAgICAgICAgICB2YXIgeTIgPSBjZW50ZXJZICsgdG90YWxSYWRpdXMgKiBNYXRoLnNpbihzdGFydEFuZ2xlICsgcHJlQW5nbGUpXG4gICAgICAgICAgICBjYW52YXMubGluZVRvKHgsIHkpXG4gICAgICAgICAgICBjYW52YXMubGluZVRvKHgxLCB5MilcbiAgICAgICAgICB9XG4gICAgICAgICAgY2FudmFzLmNsb3NlUGF0aCgpXG4gICAgICAgICAgY2FudmFzLmZpbGwoKVxuICAgICAgICB9XG5cbiAgICAgICAgdmFyIGl0ZW1SYWRpdXMgPSAoc3ViRW50cnkgLSBtaW4pIC8gdmFsdWVMZW4gKiBwb2xhclJhZGl1cyAqIHByb2Nlc3NcbiAgICAgICAgdG90YWxSYWRpdXMgLT0gaXRlbVJhZGl1c1xuICAgICAgfVxuICAgICAgc3RhcnRBbmdsZSArPSBwcmVBbmdsZVxuICAgIH1cbiAgfVxuXG4gIGRyYXdQb2xhcihjYW52YXMsIGxheWVyLCBjb2xvclBvc2l0aW9uLCBkcmF3UGF0aCkge1xuICAgIHZhciBwcm9jZXNzID0gdGhpcy5wcm9jZXNzXG5cbiAgICB2YXIgcG9sYXJXaWR0aCA9IHRoaXMucG9sYXJXaWR0aFxuICAgIHZhciBwb2xhclJhZGl1cyA9IHBvbGFyV2lkdGggLyAyXG4gICAgdmFyIG1heCA9IHRoaXMubWF4VmFsdWVcbiAgICB2YXIgbWluID0gdGhpcy5taW5WYWx1ZVxuICAgIHZhciBzaXplID0gbGF5ZXIuZGF0YS5sZW5ndGhcbiAgICB2YXIgcHJlQW5nbGUgPSAyICogTWF0aC5QSSAvIHNpemVcbiAgICB2YXIgdmFsdWVMZW4gPSBtYXggLSBtaW5cblxuICAgIHZhciBzdGFydEFuZ2xlID0gdGhpcy5zdGFydEFuZ2xlXG4gICAgdmFyIGNlbnRlclggPSB0aGlzLndpZHRoIC8gMlxuICAgIHZhciBjZW50ZXJZID0gdGhpcy5oZWlnaHQgLyAyXG5cbiAgICBjYW52YXMuc2V0TGluZVdpZHRoKHRoaXMubGluZVdpZHRoKVxuXG4gICAgdmFyIHN0YXJ0TGlzdHMgPSBbXVxuICAgIHZhciBzdWJTaXplID0gbGF5ZXIuZGF0YVswXS5zdWJEYXRhLmxlbmd0aFxuICAgIGZvciAodmFyIGogPSAwOyBqIDwgc3ViU2l6ZTsgaisrKSB7XG4gICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHNpemU7IGkrKykge1xuICAgICAgICB2YXIgZW50cnkgPSBsYXllci5kYXRhW2ldXG4gICAgICAgIHZhciBzdWJFbnRyeSA9IGVudHJ5LnN1YkRhdGFbal1cbiAgICAgICAgaWYgKCFzdWJFbnRyeSkge1xuICAgICAgICAgIGNvbnRpbnVlXG4gICAgICAgIH1cblxuICAgICAgICBpZiAoc3ViRW50cnkgPT0gbnVsbCB8fCBzdWJFbnRyeSA9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICBzdGFydExpc3RzW2ogKiAyXSA9IG51bGxcbiAgICAgICAgICBzdGFydExpc3RzW2ogKiAyICsgMV0gPSBudWxsXG4gICAgICAgICAgY29udGludWVcbiAgICAgICAgfVxuXG4gICAgICAgIHZhciBjb2xvciA9IHRoaXMuZ2V0Q29sb3IoY29sb3JQb3NpdGlvbiArIGopXG4gICAgICAgIGNhbnZhcy5zZXRGaWxsU3R5bGUoY29sb3IpXG5cbiAgICAgICAgdmFyIGl0ZW1SYWRpdXMgPSAoc3ViRW50cnkgLSBtaW4pIC8gdmFsdWVMZW4gKiBwb2xhclJhZGl1cyAqIHByb2Nlc3NcblxuICAgICAgICB2YXIgeCA9IGNlbnRlclggKyBpdGVtUmFkaXVzICogTWF0aC5jb3MocHJlQW5nbGUgKiBpICsgc3RhcnRBbmdsZSlcbiAgICAgICAgdmFyIHkgPSBjZW50ZXJZICsgaXRlbVJhZGl1cyAqIE1hdGguc2luKHByZUFuZ2xlICogaSArIHN0YXJ0QW5nbGUpXG5cbiAgICAgICAgY2FudmFzLmJlZ2luUGF0aCgpXG4gICAgICAgIGNhbnZhcy5hcmMoeCwgeSwgdGhpcy5jaXJjbGVSYWRpdXMsIDAsIDIgKiBNYXRoLlBJKVxuICAgICAgICBjYW52YXMuZmlsbCgpXG4gICAgICAgIGNhbnZhcy5jbG9zZVBhdGgoKVxuICAgICAgICBpZiAoaSA+IDAgJiYgZHJhd1BhdGgpIHtcbiAgICAgICAgICB2YXIgeDEgPSBzdGFydExpc3RzW2ogKiAyXSB8fCAwXG4gICAgICAgICAgdmFyIHkxID0gc3RhcnRMaXN0c1tqICogMiArIDFdIHx8IDBcblxuICAgICAgICAgIGlmICh4MSAmJiB5MSkge1xuICAgICAgICAgICAgY2FudmFzLmJlZ2luUGF0aCgpXG4gICAgICAgICAgICBjYW52YXMuc2V0U3Ryb2tlU3R5bGUoY29sb3IpXG4gICAgICAgICAgICBjYW52YXMubW92ZVRvKHgxLCB5MSlcbiAgICAgICAgICAgIGNhbnZhcy5saW5lVG8oeCwgeSlcbiAgICAgICAgICAgIGNhbnZhcy5zdHJva2UoKVxuICAgICAgICAgICAgY2FudmFzLmNsb3NlUGF0aCgpXG4gICAgICAgICAgfVxuXG4gICAgICAgICAgaWYgKGkgPT0gc2l6ZSAtIDEpIHtcbiAgICAgICAgICAgIHZhciBzdGFydFJhZGl1cyA9IChsYXllci5kYXRhWzBdLnN1YkRhdGFbal0gLSBtaW4pIC8gdmFsdWVMZW4gKiBwb2xhclJhZGl1cyAqIHByb2Nlc3NcbiAgICAgICAgICAgIHZhciBzeCA9IGNlbnRlclggKyBzdGFydFJhZGl1cyAqIE1hdGguY29zKHN0YXJ0QW5nbGUpXG4gICAgICAgICAgICB2YXIgc3kgPSBjZW50ZXJZICsgc3RhcnRSYWRpdXMgKiBNYXRoLnNpbihzdGFydEFuZ2xlKVxuXG4gICAgICAgICAgICBjYW52YXMuYmVnaW5QYXRoKClcbiAgICAgICAgICAgIGNhbnZhcy5zZXRTdHJva2VTdHlsZShjb2xvcilcbiAgICAgICAgICAgIGNhbnZhcy5tb3ZlVG8oeCwgeSlcbiAgICAgICAgICAgIGNhbnZhcy5saW5lVG8oc3gsIHN5KVxuICAgICAgICAgICAgY2FudmFzLnN0cm9rZSgpXG4gICAgICAgICAgICBjYW52YXMuY2xvc2VQYXRoKClcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgc3RhcnRMaXN0c1tqICogMl0gPSB4XG4gICAgICAgIHN0YXJ0TGlzdHNbaiAqIDIgKyAxXSA9IHlcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBkcmF3QXhpc1ZhbHVlKGNhbnZhcykge1xuICAgIGlmICghdGhpcy5heGlzRW5hYmxlKSB7XG4gICAgICByZXR1cm5cbiAgICB9XG4gICAgdmFyIHByb2Nlc3MgPSB0aGlzLnByb2Nlc3NcblxuICAgIHZhciBwb2xhcldpZHRoID0gdGhpcy5wb2xhcldpZHRoXG4gICAgdmFyIHBvbGFyUmFkaXVzID0gcG9sYXJXaWR0aCAvIDJcbiAgICB2YXIgeEF4aXNEYXRhID0gdGhpcy54QXhpc0RhdGFcbiAgICB2YXIgeTFUaWNrcyA9IHRoaXMueTFUaWNrc1xuICAgIHZhciBheGlzRW5hYmxlID0gdGhpcy5heGlzRW5hYmxlXG4gICAgdmFyIGF4aXNGb250U2l6ZSA9IHRoaXMuYXhpc0ZvbnRTaXplXG4gICAgdmFyIGF4aXNMaW5lQ29sb3IgPSB0aGlzLmF4aXNMaW5lQ29sb3JcbiAgICB2YXIgYXhpc0hpZ2hMaWdodEVuYWJsZSA9IHRoaXMuYXhpc0hpZ2hMaWdodEVuYWJsZVxuICAgIHZhciBheGlzSGlnaExpZ2h0Q29sb3IgPSB0aGlzLmF4aXNIaWdoTGlnaHRDb2xvclxuICAgIHZhciBheGlzRm9udENvbG9yID0gdGhpcy5heGlzRm9udENvbG9yXG4gICAgdmFyIGF4aXNMaW5lV2lkdGggPSB0aGlzLmF4aXNMaW5lV2lkdGhcbiAgICB2YXIgYXJjVHlwZSA9IHRoaXMuYXJjVHlwZVxuICAgIHZhciBheGlzVmFsdWVQYWRkaW5nID0gdGhpcy5heGlzVmFsdWVQYWRkaW5nXG5cbiAgICB2YXIgY2VudGVyWCA9IHRoaXMud2lkdGggLyAyXG4gICAgdmFyIGNlbnRlclkgPSB0aGlzLmhlaWdodCAvIDJcblxuICAgIGNhbnZhcy5zZXRGb250U2l6ZShheGlzRm9udFNpemUpXG5cbiAgICB2YXIgcHJlQW5nbGUgPSAyICogTWF0aC5QSSAvIHhBeGlzRGF0YS5sZW5ndGhcbiAgICB2YXIgc3RhcnRBbmdsZSA9IHRoaXMuc3RhcnRBbmdsZVxuXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCB4QXhpc0RhdGEubGVuZ3RoOyBpKyspIHtcbiAgICAgIHZhciB4ID0gY2VudGVyWCArIHBvbGFyUmFkaXVzICogTWF0aC5jb3MocHJlQW5nbGUgKiBpICsgc3RhcnRBbmdsZSlcbiAgICAgIHZhciB5ID0gY2VudGVyWSArIHBvbGFyUmFkaXVzICogTWF0aC5zaW4ocHJlQW5nbGUgKiBpICsgc3RhcnRBbmdsZSlcblxuICAgICAgdmFyIGxhYmVsWCA9IGNlbnRlclggKyAocG9sYXJSYWRpdXMgKyBheGlzVmFsdWVQYWRkaW5nKSAqIE1hdGguY29zKHByZUFuZ2xlICogaSArIHN0YXJ0QW5nbGUpXG4gICAgICB2YXIgbGFiZWxZID0gY2VudGVyWSArIChwb2xhclJhZGl1cyArIGF4aXNWYWx1ZVBhZGRpbmcpICogTWF0aC5zaW4ocHJlQW5nbGUgKiBpICsgc3RhcnRBbmdsZSlcbiAgICAgIGlmIChsYWJlbFkgPiB0aGlzLmhlaWdodCAvIDIpIHtcbiAgICAgICAgbGFiZWxZICs9IGF4aXNGb250U2l6ZSAqIE1hdGguYWJzKE1hdGguc2luKHByZUFuZ2xlICogaSArIHN0YXJ0QW5nbGUpKVxuICAgICAgfVxuXG4gICAgICB2YXIgbGFiZWwgPSB4QXhpc0RhdGFbaV1cbiAgICAgIHZhciBsYWJlbFdpZHRoID0gY2FudmFzLm15TWVhc3VyZVRleHQobGFiZWwsIGF4aXNGb250U2l6ZSlcblxuICAgICAgY2FudmFzLnNldEZpbGxTdHlsZShheGlzRm9udENvbG9yKVxuICAgICAgaWYgKGxhYmVsWCA+PSBjZW50ZXJYIC0gYXhpc1ZhbHVlUGFkZGluZyAmJiBsYWJlbFggPD0gY2VudGVyWCArIGF4aXNWYWx1ZVBhZGRpbmcpIHtcbiAgICAgICAgY2FudmFzLmZpbGxUZXh0KGxhYmVsLCBsYWJlbFggLSBsYWJlbFdpZHRoIC8gMiwgbGFiZWxZKVxuICAgICAgfSBlbHNlIGlmIChsYWJlbFggPCBjZW50ZXJYKSB7XG4gICAgICAgIGlmIChsYWJlbFggLSBsYWJlbFdpZHRoIC0gYXhpc1ZhbHVlUGFkZGluZyA+IGF4aXNWYWx1ZVBhZGRpbmcpIHtcbiAgICAgICAgICBjYW52YXMuZmlsbFRleHQobGFiZWwsIGxhYmVsWCAtIGxhYmVsV2lkdGggLSBheGlzVmFsdWVQYWRkaW5nLCBsYWJlbFkpXG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgdmFyIHN1YlNpemUgPSAwXG4gICAgICAgICAgdmFyIHN1YkxhYmVsXG4gICAgICAgICAgdmFyIHN1YkxhYmVsV2lkdGhcbiAgICAgICAgICBkbyB7XG4gICAgICAgICAgICBzdWJMYWJlbCA9ICcuLi4nLmNvbmNhdChsYWJlbC5zdWJzdHJpbmcoc3ViU2l6ZSwgbGFiZWwubGVuZ3RoKSlcbiAgICAgICAgICAgIHN1YkxhYmVsV2lkdGggPSBjYW52YXMubXlNZWFzdXJlVGV4dChzdWJMYWJlbCwgYXhpc0ZvbnRTaXplKVxuICAgICAgICAgICAgc3ViU2l6ZSArPSAxXG4gICAgICAgICAgfSB3aGlsZSAobGFiZWxYIC0gc3ViTGFiZWxXaWR0aCAtIGF4aXNWYWx1ZVBhZGRpbmcgPD0gYXhpc1ZhbHVlUGFkZGluZylcbiAgICAgICAgICBjYW52YXMuZmlsbFRleHQoc3ViTGFiZWwsIGxhYmVsWCAtIHN1YkxhYmVsV2lkdGggLSBheGlzVmFsdWVQYWRkaW5nLCBsYWJlbFkpXG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGlmIChsYWJlbFggKyBsYWJlbFdpZHRoICsgYXhpc1ZhbHVlUGFkZGluZyA8IHRoaXMud2lkdGggLSBheGlzVmFsdWVQYWRkaW5nKSB7XG4gICAgICAgICAgY2FudmFzLmZpbGxUZXh0KGxhYmVsLCBsYWJlbFgsIGxhYmVsWSlcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICB2YXIgc3ViU2l6ZSA9IGxhYmVsLmxlbmd0aFxuICAgICAgICAgIHZhciBzdWJMYWJlbFxuICAgICAgICAgIHZhciBzdWJMYWJlbFdpZHRoXG4gICAgICAgICAgZG8ge1xuICAgICAgICAgICAgc3ViTGFiZWwgPSBsYWJlbC5zdWJzdHJpbmcoMCwgc3ViU2l6ZSkuY29uY2F0KCcuLi4nKVxuICAgICAgICAgICAgc3ViTGFiZWxXaWR0aCA9IGNhbnZhcy5teU1lYXN1cmVUZXh0KHN1YkxhYmVsLCBheGlzRm9udFNpemUpXG4gICAgICAgICAgICBzdWJTaXplIC09IDFcbiAgICAgICAgICB9IHdoaWxlIChsYWJlbFggKyBzdWJMYWJlbFdpZHRoICsgYXhpc1ZhbHVlUGFkZGluZyA+PSB0aGlzLndpZHRoIC0gYXhpc1ZhbHVlUGFkZGluZylcbiAgICAgICAgICBjYW52YXMuZmlsbFRleHQoc3ViTGFiZWwsIGxhYmVsWCArIGF4aXNWYWx1ZVBhZGRpbmcsIGxhYmVsWSlcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cblxuICAgIHZhciB5U2l6ZSA9IHkxVGlja3MubGVuZ3RoXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCB5U2l6ZTsgaSsrKSB7XG4gICAgICB2YXIgc3ViUmFkaXVzID0gcG9sYXJSYWRpdXMgKiBpIC8gKHlTaXplIC0gMSlcbiAgICAgIGlmIChpIDwgeVNpemUgLSAxKSB7XG4gICAgICAgIHZhciBsYWJlbFdpZHRoID0gY2FudmFzLm15TWVhc3VyZVRleHQoeTFUaWNrc1tpXSwgYXhpc0ZvbnRTaXplKVxuXG4gICAgICAgIGNhbnZhcy5zZXRGaWxsU3R5bGUoYXhpc0ZvbnRDb2xvcilcbiAgICAgICAgY2FudmFzLmZpbGxUZXh0KHkxVGlja3NbaV0sIGNlbnRlclggLSBsYWJlbFdpZHRoLCBjZW50ZXJZIC0gc3ViUmFkaXVzKVxuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIGRyYXdBeGlzKGNhbnZhcykge1xuICAgIHZhciBwcm9jZXNzID0gdGhpcy5wcm9jZXNzXG5cbiAgICB2YXIgcG9sYXJXaWR0aCA9IHRoaXMucG9sYXJXaWR0aFxuICAgIHZhciBwb2xhclJhZGl1cyA9IHBvbGFyV2lkdGggLyAyXG4gICAgdmFyIHhBeGlzRGF0YSA9IHRoaXMueEF4aXNEYXRhXG4gICAgdmFyIHkxVGlja3MgPSB0aGlzLnkxVGlja3NcbiAgICB2YXIgYXhpc0VuYWJsZSA9IHRoaXMuYXhpc0VuYWJsZVxuICAgIHZhciBheGlzRm9udFNpemUgPSB0aGlzLmF4aXNGb250U2l6ZVxuICAgIHZhciBheGlzTGluZUNvbG9yID0gdGhpcy5heGlzTGluZUNvbG9yXG4gICAgdmFyIGF4aXNIaWdoTGlnaHRFbmFibGUgPSB0aGlzLmF4aXNIaWdoTGlnaHRFbmFibGVcbiAgICB2YXIgYXhpc0hpZ2hMaWdodENvbG9yID0gdGhpcy5heGlzSGlnaExpZ2h0Q29sb3JcbiAgICB2YXIgYXhpc0ZvbnRDb2xvciA9IHRoaXMuYXhpc0ZvbnRDb2xvclxuICAgIHZhciBheGlzTGluZVdpZHRoID0gdGhpcy5heGlzTGluZVdpZHRoXG4gICAgdmFyIGFyY1R5cGUgPSB0aGlzLmFyY1R5cGVcbiAgICB2YXIgYXhpc1ZhbHVlUGFkZGluZyA9IHRoaXMuYXhpc1ZhbHVlUGFkZGluZ1xuXG4gICAgdmFyIGNlbnRlclggPSB0aGlzLndpZHRoIC8gMlxuICAgIHZhciBjZW50ZXJZID0gdGhpcy5oZWlnaHQgLyAyXG5cbiAgICBjYW52YXMuc2V0Rm9udFNpemUoYXhpc0ZvbnRTaXplKVxuICAgIGNhbnZhcy5zZXRMaW5lV2lkdGgoYXhpc0xpbmVXaWR0aClcbiAgICBjYW52YXMuc2V0TGluZUpvaW4oJ21pdGVyJylcblxuICAgIHZhciBwcmVBbmdsZSA9IDIgKiBNYXRoLlBJIC8geEF4aXNEYXRhLmxlbmd0aFxuICAgIHZhciBzdGFydEFuZ2xlID0gdGhpcy5zdGFydEFuZ2xlXG5cbiAgICBmb3IodmFyIGkgPSAwOyBpIDwgeEF4aXNEYXRhLmxlbmd0aDsgaSsrKSB7XG4gICAgICB2YXIgeCA9IGNlbnRlclggKyBwb2xhclJhZGl1cyAqIE1hdGguY29zKHByZUFuZ2xlICogaSArIHN0YXJ0QW5nbGUpXG4gICAgICB2YXIgeSA9IGNlbnRlclkgKyBwb2xhclJhZGl1cyAqIE1hdGguc2luKHByZUFuZ2xlICogaSArIHN0YXJ0QW5nbGUpXG5cbiAgICAgIGNhbnZhcy5zZXRTdHJva2VTdHlsZShheGlzSGlnaExpZ2h0RW5hYmxlICYmIGkgPT0gdGhpcy5oaWdoTGlnaHRJbmRleCA/IGF4aXNIaWdoTGlnaHRDb2xvciA6IGF4aXNMaW5lQ29sb3IpXG4gICAgICBjYW52YXMuc2V0TGluZVdpZHRoKGF4aXNIaWdoTGlnaHRFbmFibGUgJiYgaSA9PSB0aGlzLmhpZ2hMaWdodEluZGV4ID8gYXhpc0xpbmVXaWR0aCAqIDIgOiBheGlzTGluZVdpZHRoKVxuICAgICAgY2FudmFzLmJlZ2luUGF0aCgpXG4gICAgICBjYW52YXMubW92ZVRvKGNlbnRlclgsIGNlbnRlclkpXG4gICAgICBjYW52YXMubGluZVRvKHgsIHkpXG4gICAgICBjYW52YXMuc3Ryb2tlKClcbiAgICAgIGNhbnZhcy5jbG9zZVBhdGgoKVxuICAgIH1cblxuICAgIGNhbnZhcy5zZXRMaW5lV2lkdGgoYXhpc0xpbmVXaWR0aClcbiAgICB2YXIgeVNpemUgPSB5MVRpY2tzLmxlbmd0aFxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgeVNpemU7IGkrKykge1xuICAgICAgdmFyIHN1YlJhZGl1cyA9IHBvbGFyUmFkaXVzICogaSAvICh5U2l6ZSAtIDEpXG5cbiAgICAgIGNhbnZhcy5zZXRTdHJva2VTdHlsZShheGlzTGluZUNvbG9yKVxuICAgICAgY2FudmFzLmJlZ2luUGF0aCgpXG4gICAgICBpZiAoYXJjVHlwZSA9PSAnYXJjJykge1xuICAgICAgICBjYW52YXMuYXJjKGNlbnRlclgsIGNlbnRlclksIHN1YlJhZGl1cywgMCwgMiAqIE1hdGguUEkpXG4gICAgICB9IGVsc2Uge1xuICAgICAgICB2YXIgcG9pbnRzID0gW11cbiAgICAgICAgZm9yICh2YXIgaiA9IDA7IGogPCB4QXhpc0RhdGEubGVuZ3RoOyBqKyspIHtcbiAgICAgICAgICB2YXIgeCA9IGNlbnRlclggKyBzdWJSYWRpdXMgKiBNYXRoLmNvcyhwcmVBbmdsZSAqIGogKyBzdGFydEFuZ2xlKVxuICAgICAgICAgIHZhciB5ID0gY2VudGVyWSArIHN1YlJhZGl1cyAqIE1hdGguc2luKHByZUFuZ2xlICogaiArIHN0YXJ0QW5nbGUpXG4gICAgICAgICAgcG9pbnRzLnB1c2goeyB4OiB4LCB5OiB5IH0pXG4gICAgICAgIH1cblxuICAgICAgICBwb2ludHMubWFwKChwb2ludCwgaW5kZXgpID0+IHtcbiAgICAgICAgICBjYW52YXNbaW5kZXggPT0gMCA/ICdtb3ZlVG8nIDogJ2xpbmVUbyddKHBvaW50LngsIHBvaW50LnkpXG4gICAgICAgIH0pXG4gICAgICB9XG4gICAgICBjYW52YXMuY2xvc2VQYXRoKClcbiAgICAgIGNhbnZhcy5zdHJva2UoKVxuICAgIH1cbiAgfVxuXG4gIGRyYXdMZWdlbmQoY2FudmFzKSB7XG4gICAgdmFyIGNoYXJ0UGFkZGluZyA9IHRoaXMuY2hhcnRQYWRkaW5nXG4gICAgdmFyIGxlZ2VuZEZvbnRTaXplID0gdGhpcy5sZWdlbmRGb250U2l6ZVxuICAgIHZhciBsZWdlbmRQYWRkaW5nVG9wID0gdGhpcy5sZWdlbmRQYWRkaW5nVG9wXG4gICAgdmFyIGxlZ2VuZFRleHRDb2xvciA9IHRoaXMubGVnZW5kVGV4dENvbG9yXG5cbiAgICBjYW52YXMuc2V0Rm9udFNpemUobGVnZW5kRm9udFNpemUpXG5cbiAgICB2YXIgbGVnZW5kTGlzdCA9IFtdXG4gICAgdGhpcy5kYXRhLm1hcCgobGF5ZXIsIGluZGV4KSA9PiB7XG4gICAgICBpZiAobGF5ZXIuc2VyaWVzTmFtZSkge1xuICAgICAgICBsYXllci5zZXJpZXNOYW1lLm1hcCgobmFtZSwgaW5kZXgpID0+IHtcbiAgICAgICAgICBsZWdlbmRMaXN0LnB1c2gobmFtZSlcbiAgICAgICAgfSlcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGxlZ2VuZExpc3QucHVzaChsYXllci5uYW1lKVxuICAgICAgfVxuICAgIH0pXG4gICAgdGhpcy5sZWdlbmRMaXN0ID0gbGVnZW5kTGlzdFxuXG4gICAgdmFyIGxlZ2VuZFdpZHRoID0gMFxuICAgIHZhciBpc011bHRpTGluZSA9IGZhbHNlXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBsZWdlbmRMaXN0Lmxlbmd0aDsgaSsrKSB7XG4gICAgICB2YXIgbGVnZW5kID0gbGVnZW5kTGlzdFtpXVxuICAgICAgaWYgKGxlZ2VuZFdpZHRoID4gMCkge1xuICAgICAgICBsZWdlbmRXaWR0aCArPSBsZWdlbmRGb250U2l6ZVxuICAgICAgfVxuXG4gICAgICBsZWdlbmRXaWR0aCArPSBjYW52YXMubXlNZWFzdXJlVGV4dChsZWdlbmQsIGxlZ2VuZEZvbnRTaXplKSArIGxlZ2VuZEZvbnRTaXplICogMS4yXG4gICAgICBpZiAobGVnZW5kV2lkdGggPiB0aGlzLndpZHRoIC0gdGhpcy5jaGFydFBhZGRpbmcgKiAyKSB7XG4gICAgICAgIGlzTXVsdGlMaW5lID0gdHJ1ZVxuICAgICAgfVxuICAgIH1cblxuICAgIHRoaXMubGVnZW5kV2lkdGggPSBsZWdlbmRXaWR0aFxuICAgIHRoaXMuaXNNdWx0aUxpbmUgPSBpc011bHRpTGluZVxuXG4gICAgaWYgKCFpc011bHRpTGluZSkge1xuICAgICAgdmFyIHN0YXJ0WCA9ICh0aGlzLndpZHRoIC0gbGVnZW5kV2lkdGgpIC8gMjtcbiAgICAgIHZhciBzdGFydFkgPSB0aGlzLmhlaWdodCAvIDIgKyB0aGlzLnBvbGFyV2lkdGggLyAyICsgbGVnZW5kUGFkZGluZ1RvcFxuICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBsZWdlbmRMaXN0Lmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIHZhciBsZWdlbmQgPSBsZWdlbmRMaXN0W2ldXG4gICAgICAgIHZhciB0ZXh0V2lkdGggPSBjYW52YXMubXlNZWFzdXJlVGV4dChsZWdlbmQsIGxlZ2VuZEZvbnRTaXplKVxuICAgICAgICBpZiAoc3RhcnRYICsgdGV4dFdpZHRoICsgbGVnZW5kRm9udFNpemUgKiAxLjIgPiB0aGlzLndpZHRoIC0gY2hhcnRQYWRkaW5nKSB7XG4gICAgICAgICAgc3RhcnRYID0gY2hhcnRQYWRkaW5nXG4gICAgICAgICAgc3RhcnRZICs9IGxlZ2VuZEZvbnRTaXplICogMS41XG4gICAgICAgIH1cblxuICAgICAgICB2YXIgc2VyaWVzQ29sb3IgPSB0aGlzLmdldENvbG9yKGkpXG4gICAgICAgIGNhbnZhcy5zZXRGaWxsU3R5bGUoc2VyaWVzQ29sb3IpXG4gICAgICAgIGNhbnZhcy5iZWdpblBhdGgoKVxuICAgICAgICBjYW52YXMuYXJjKHN0YXJ0WCArIGxlZ2VuZEZvbnRTaXplIC8gMiwgc3RhcnRZICsgbGVnZW5kRm9udFNpemUgLyAyLCBsZWdlbmRGb250U2l6ZSAvIDIsIDAsIDIgKiBNYXRoLlBJKVxuICAgICAgICBjYW52YXMuZmlsbCgpXG4gICAgICAgIGNhbnZhcy5jbG9zZVBhdGgoKVxuXG4gICAgICAgIHN0YXJ0WCArPSBsZWdlbmRGb250U2l6ZSAqIDEuMlxuICAgICAgICBpZiAodGhpcy5pc0hpZGRlblNlcmllcyhpKSkge1xuICAgICAgICAgIGNhbnZhcy5zZXRGaWxsU3R5bGUoc2VyaWVzQ29sb3IpXG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgY2FudmFzLnNldEZpbGxTdHlsZShsZWdlbmRUZXh0Q29sb3IpXG4gICAgICAgIH1cbiAgICAgICAgY2FudmFzLmZpbGxUZXh0KGxlZ2VuZCwgc3RhcnRYLCBzdGFydFkgKyBsZWdlbmRGb250U2l6ZSlcblxuICAgICAgICBzdGFydFggKz0gdGV4dFdpZHRoICsgbGVnZW5kRm9udFNpemVcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgdmFyIHN0YXJ0WCA9IGNoYXJ0UGFkZGluZ1xuICAgICAgdmFyIHN0YXJ0WSA9IHRoaXMuaGVpZ2h0IC8gMiArIHRoaXMucG9sYXJXaWR0aCAvIDIgKyBsZWdlbmRQYWRkaW5nVG9wXG5cbiAgICAgIGlmIChzdGFydFggKyBsZWdlbmRGb250U2l6ZSAqIDEuMiAqIGxlZ2VuZExpc3QubGVuZ3RoID4gdGhpcy53aWR0aCkge1xuICAgICAgICAvL2xlZ2VuZOaVsOmHj+i/h+WkmlxuICAgICAgICBjYW52YXMuc2V0RmlsbFN0eWxlKHRoaXMuZ2V0Q29sb3IoMCkpXG4gICAgICAgIGNhbnZhcy5maWxsUmVjdChzdGFydFgsIHN0YXJ0WSwgbGVnZW5kRm9udFNpemUsIGxlZ2VuZEZvbnRTaXplKVxuICAgICAgICBzdGFydFggKz0gbGVnZW5kRm9udFNpemUgKiAxLjJcblxuICAgICAgICB2YXIgYmV0d2VlblRleHQgPSBcIn5cIlxuICAgICAgICB2YXIgYnR3VGV4dFdpZHRoID0gY2FudmFzLm15TWVhc3VyZVRleHQoYmV0d2VlblRleHQsIGxlZ2VuZEZvbnRTaXplKVxuICAgICAgICBjYW52YXMuc2V0RmlsbFN0eWxlKGxlZ2VuZFRleHRDb2xvcilcbiAgICAgICAgY2FudmFzLmZpbGxUZXh0KGJldHdlZW5UZXh0LCBzdGFydFgsIHN0YXJ0WSArIGxlZ2VuZEZvbnRTaXplKVxuICAgICAgICBzdGFydFggKz0gYnR3VGV4dFdpZHRoICsgbGVnZW5kRm9udFNpemUgKiAwLjJcblxuICAgICAgICBjYW52YXMuc2V0RmlsbFN0eWxlKHRoaXMuZ2V0Q29sb3IobGVnZW5kTGlzdC5sZW5ndGggLSAxKSlcbiAgICAgICAgY2FudmFzLmZpbGxSZWN0KHN0YXJ0WCwgc3RhcnRZLCBsZWdlbmRGb250U2l6ZSwgbGVnZW5kRm9udFNpemUpXG4gICAgICAgIHN0YXJ0WCArPSBsZWdlbmRGb250U2l6ZSAqIDEuMlxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBsZWdlbmRMaXN0Lmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgY2FudmFzLnNldEZpbGxTdHlsZSh0aGlzLmdldENvbG9yKGkpKVxuICAgICAgICAgIGNhbnZhcy5maWxsUmVjdChzdGFydFgsIHN0YXJ0WSwgbGVnZW5kRm9udFNpemUsIGxlZ2VuZEZvbnRTaXplKVxuICAgICAgICAgIHN0YXJ0WCArPSBsZWdlbmRGb250U2l6ZSAqIDEuMlxuICAgICAgICB9XG4gICAgICB9XG4gICAgICBzdGFydFggKz0gbGVnZW5kRm9udFNpemUgKiAwLjNcbiAgICAgIHZhciBzaW1wbGVUZXh0ID0gYCR7bGVnZW5kTGlzdFswXX1+JHtsZWdlbmRMaXN0W2xlZ2VuZExpc3QubGVuZ3RoIC0gMV19YFxuICAgICAgdmFyIHNwVGV4dFdpZHRoID0gY2FudmFzLm15TWVhc3VyZVRleHQoc2ltcGxlVGV4dCwgbGVnZW5kRm9udFNpemUpXG4gICAgICBjYW52YXMuc2V0RmlsbFN0eWxlKGxlZ2VuZFRleHRDb2xvcilcbiAgICAgIGNhbnZhcy5maWxsVGV4dChzaW1wbGVUZXh0LCBzdGFydFgsIHN0YXJ0WSArIGxlZ2VuZEZvbnRTaXplKVxuICAgIH1cbiAgfVxuXG4gIGRyYXdOb0RhdGEoY2FudmFzKSB7XG4gICAgdmFyIHRleHQgPSB0aGlzLm5vRGF0YVRleHRcbiAgICB2YXIgdGV4dFdpZHRoID0gY2FudmFzLm15TWVhc3VyZVRleHQodGV4dCwgdGhpcy5ub0RhdGFGb250U2l6ZSlcbiAgICBjYW52YXMuc2V0RmlsbFN0eWxlKHRoaXMubm9EYXRhVGV4dENvbG9yKVxuICAgIGNhbnZhcy5maWxsVGV4dCh0ZXh0LCAodGhpcy53aWR0aCAtIHRleHRXaWR0aCkgLyAyLCAodGhpcy5oZWlnaHQgKyB0aGlzLm5vRGF0YUZvbnRTaXplKSAvIDIpXG4gIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBQb2xhcjtcbiIsIi8qKipcbiAqIGNoYXJ0LmpzIOWbvuW9oue7mOWItumAu+i+keeahOe7n+S4gOWFpeWPo1xuICogVE9ETyBsaXN0XG4gKiAzLiBheGlzIHRpdGxlXG4gKiA4LiDmiZPljbDovpPlh7rmjqXlj6PmlK/mjIEg77yIY2FudmFzLnRvRGF0YVVSTClcbiAqIDkuIEF4aXMg6auY57qn5Yqf6IO9XG4gKiAxMC4gdHJlbmRsaW5lIOi2i+WKv+e6v1xuICovXG52YXIgcGllID0gcmVxdWlyZSgnLi9zcmMvcGllLmpzJylcbnZhciBzY2F0dGVyID0gcmVxdWlyZSgnLi9zcmMvc2NhdHRlci5qcycpXG52YXIgbWl4ID0gcmVxdWlyZSgnLi9zcmMvbWl4LmpzJylcbnZhciBrcGkgPSByZXF1aXJlKCcuL3NyYy9rcGkuanMnKVxudmFyIHNpbmdsZVZhbHVlID0gcmVxdWlyZSgnLi9zcmMvc2luZ2xlVmFsdWUuanMnKVxudmFyIGdhdWdlID0gcmVxdWlyZSgnLi9zcmMvZ2F1Z2UuanMnKVxudmFyIGZ1bm5lbCA9IHJlcXVpcmUoJy4vc3JjL2Z1bm5lbC5qcycpXG52YXIgcG9sYXIgPSByZXF1aXJlKCcuL3NyYy9wb2xhci5qcycpXG52YXIgY2hhcnRVdGlscyA9IHJlcXVpcmUoJy4vc3JjL2NoYXJ0VXRpbC5qcycpXG5cbmNsYXNzIENoYXJ0IHtcbiAgZHJhd0NoYXJ0KGNhbnZhc0lkLCBjaGFydFdpZHRoLCBjaGFydEhlaWdodCwgbW9kZWwsIGlzUHJldmlldyA9IGZhbHNlLCBleHRyYU9wdHMgPSB7fSwgZHBpID0gMSkge1xuICAgIGxldCBkZWZhdWx0T3B0cyA9IHtjYW52YXM6IGNoYXJ0VXRpbHMuY3JlYXRlQ2FudmFzKGNhbnZhc0lkKSwgd2lkdGg6IGNoYXJ0V2lkdGgsIGhlaWdodDogY2hhcnRIZWlnaHR9XG5cbiAgICBpZiAoIW1vZGVsLmlzVmFsaWRNb2RlbCgpKSB7XG4gICAgICByZXR1cm4gbnVsbFxuICAgIH1cblxuICAgIGlmIChtb2RlbC5pc05vRGF0YSgpKSB7XG4gICAgICBjb25zb2xlLmxvZygnbm8gZGF0YSByZXR1cm5lZCBmcm9tIG1vZGVsJylcbiAgICB9XG5cbiAgICBsZXQgQVBJID0gbnVsbFxuICAgIGxldCBhc3NpZ24gPSBPYmplY3QuYXNzaWduXG4gICAgbGV0IGNoYXJ0T3B0aW9ucyA9IG1vZGVsLmdldENoYXJ0SW5mbygpXG4gICAgbGV0IG1ham9yVHlwZSA9IGNoYXJ0T3B0aW9ucy5tYWpvclR5cGVcbiAgICBsZXQgc3ViVHlwZSA9IGNoYXJ0T3B0aW9ucy5zdWJ0eXBlXG5cbiAgICBleHRyYU9wdHMgPSBleHRyYU9wdHMgfHwge31cbiAgICBpZiAoaXNQcmV2aWV3KSB7XG4gICAgICBleHRyYU9wdHMuZHJhd0RhdGFMYWJlbCA9IGZhbHNlXG4gICAgICBleHRyYU9wdHMuZHJhd0V4dHJhRGF0YUxhYmVsID0gZmFsc2VcbiAgICB9XG5cbiAgICB2YXIgcGFkZGluZ0xlZnRcbiAgICB2YXIgcGFkZGluZ1JpZ2h0XG4gICAgdmFyIHBhZGRpbmdUb3BcbiAgICB2YXIgcGFkZGluZ0JvdHRvbVxuICAgIHZhciBzZWNvbmRhcnlBeGlzRW5hYmxlID0gIWlzUHJldmlldyAmJiAhbW9kZWwuaXNOb0RhdGEoKSAmJiBtb2RlbC5pc0R1YWxBeGlzKCkgLy/pnZ5wcmV2aWV377yMIOacieaVsOaNru+8jOS4lOaciVkyXG4gICAgaWYgKHNlY29uZGFyeUF4aXNFbmFibGUpIHtcbiAgICAgIGlmIChleHRyYU9wdHMuaXNIb3Jpem9udGFsKSB7XG4gICAgICAgIHBhZGRpbmdUb3AgICAgPSA0MFxuICAgICAgICBwYWRkaW5nQm90dG9tID0gNDBcbiAgICAgICAgcGFkZGluZ0xlZnQgICA9IDQwXG4gICAgICAgIHBhZGRpbmdSaWdodCAgPSAyMFxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcGFkZGluZ1RvcCAgICA9IDIwXG4gICAgICAgIHBhZGRpbmdCb3R0b20gPSA0MFxuICAgICAgICBwYWRkaW5nTGVmdCAgID0gNDBcbiAgICAgICAgcGFkZGluZ1JpZ2h0ICA9IDQwXG4gICAgICB9XG4gICAgfSBlbHNlIGlmKCFpc1ByZXZpZXcpIHtcbiAgICAgIHBhZGRpbmdMZWZ0ICAgPSA0MFxuICAgICAgcGFkZGluZ1JpZ2h0ICA9IDIwXG4gICAgICBwYWRkaW5nVG9wICAgID0gMjBcbiAgICAgIHBhZGRpbmdCb3R0b20gPSA0MFxuICAgIH0gZWxzZSB7XG4gICAgICBwYWRkaW5nTGVmdCAgID0gNVxuICAgICAgcGFkZGluZ1JpZ2h0ICA9IDVcbiAgICAgIHBhZGRpbmdUb3AgICAgPSA1XG4gICAgICBwYWRkaW5nQm90dG9tID0gNVxuICAgIH1cblxuICAgIGV4dHJhT3B0cyA9IGFzc2lnbigoZXh0cmFPcHRzIHx8IHt9KSwge1xuICAgICAgICAgIGxlZ2VuZEVuYWJsZSAgICAgICAgOiAhaXNQcmV2aWV3LFxuICAgICAgICAgIGF4aXNFbmFibGUgICAgICAgICAgOiAhaXNQcmV2aWV3LFxuICAgICAgICAgIGNoYXJ0UGFkZGluZyAgICAgICAgOiAoaXNQcmV2aWV3ID8gNSA6IDQwKSAqIGRwaSxcbiAgICAgICAgICBjaGFydFBhZGRpbmdMZWZ0ICAgIDogcGFkZGluZ0xlZnQgKiBkcGksXG4gICAgICAgICAgY2hhcnRQYWRkaW5nUmlnaHQgICA6IHBhZGRpbmdSaWdodCAqIGRwaSxcbiAgICAgICAgICBjaGFydFBhZGRpbmdUb3AgICAgIDogcGFkZGluZ1RvcCAqIGRwaSxcbiAgICAgICAgICBjaGFydFBhZGRpbmdCb3R0b20gIDogcGFkZGluZ0JvdHRvbSAqIGRwaSxcbiAgICAgICAgICBzbGljZVNwYWNlICAgICAgICAgIDogKGlzUHJldmlldyA/IDAuNSA6IDEpICogZHBpLFxuICAgICAgICAgIGJ1bGxldFdpZHRoICAgICAgICAgOiAoaXNQcmV2aWV3ID8gMiA6IDMpICogZHBpLFxuICAgICAgICAgIGxpbmVXaWR0aCAgICAgICAgICAgOiAoaXNQcmV2aWV3ID8gMSA6IDIpICogZHBpLFxuICAgICAgICAgIGNpcmNsZVJhZGl1cyAgICAgICAgOiAoaXNQcmV2aWV3ID8gMS41IDogMykgKiBkcGksXG4gICAgICAgICAgZGFzaGVkTGluZVdpZHRoICAgICA6IChpc1ByZXZpZXcgPyA0IDogOCkgKiBkcGksXG4gICAgICAgICAgc2Vjb25kYXJ5QXhpc0VuYWJsZSA6IHNlY29uZGFyeUF4aXNFbmFibGUsXG4gICAgICAgICAgZHJhd1dpdGhBbmltYXRpb24gICA6ICEobW9kZWwgJiYgbW9kZWwuaXNIZWF2eUNoYXJ0KCkpLFxuICAgICAgICAgIGRhdGFMYWJlbEZvbnRTaXplICAgOiA4ICogZHBpLFxuICAgICAgICAgIGRhdGFMYWJlbFBhZGRpbmcgICAgOiA0ICogZHBpLFxuICAgICAgICAgIGF4aXNGb250U2l6ZSAgICAgICAgOiAxMCAqIGRwaSxcbiAgICAgICAgICBheGlzVmFsdWVQYWRkaW5nICAgIDogNSAqIGRwaSxcbiAgICAgICAgICBheGlzTGluZVdpZHRoICAgICAgIDogMSAqIGRwaSxcbiAgICAgICAgICBsZWdlbmRGb250U2l6ZSAgICAgIDogMTAgKiBkcGksXG4gICAgICAgICAgbGVnZW5kUGFkZGluZyAgICAgICA6IDUgKiBkcGksXG4gICAgICAgICAgbGVnZW5kUGFkZGluZ1RvcCAgICA6IDYwICogZHBpLFxuICAgICAgICAgIHRvb2xUaXBQYWRkaW5nICAgICAgOiAxMCAqIGRwaSxcbiAgICAgICAgICB0b29sVGlwVGV4dFBhZGRpbmcgIDogOCAqIGRwaSxcbiAgICAgICAgICB0b29sVGlwRm9udFNpemUgICAgIDogMTAgKiBkcGksXG4gICAgICAgICAgdG9vbFRpcFNwbGl0TGluZVdpZHRoOiAxICogZHBpLFxuICAgICAgICAgIGhpZ2hsaWdodFJhZGl1cyAgICAgOiAxNSAqIGRwaSxcbiAgICAgICAgICBub0RhdGFGb250U2l6ZSAgICAgIDogMTEgKiBkcGksXG4gICAgICAgICAgcG9sYXJXaWR0aDogaXNQcmV2aWV3ID8gMCA6IDMwMCxcbiAgICB9KVxuXG4gICAgc3dpdGNoKG1ham9yVHlwZSkge1xuICAgICAgY2FzZSAncGllJzpcbiAgICAgICAgZXh0cmFPcHRzLmRyYXdEYXRhTGFiZWwgPSAhaXNQcmV2aWV3XG4gICAgICAgIEFQSSA9IGNoYXJ0LmRyYXdQaWVcbiAgICAgIGJyZWFrXG4gICAgICBjYXNlICdzY2F0dGVyJzpcbiAgICAgICAgQVBJID0gY2hhcnQuZHJhd1NjYXR0ZXJcbiAgICAgIGJyZWFrXG4gICAgICBjYXNlICdtaXgnOlxuICAgICAgICBBUEkgPSBzdWJUeXBlID09PSAncG9sYXInID8gY2hhcnQuZHJhd1BvbGFyOiAgY2hhcnQuZHJhd01peFxuICAgICAgYnJlYWtcbiAgICAgIGNhc2UgJ2twaSc6XG4gICAgICAgIGV4dHJhT3B0cyA9IGFzc2lnbihleHRyYU9wdHMsIHtcbiAgICAgICAgICBmb250U2l6ZUxhcmdlOiAoaXNQcmV2aWV3ID8gMjIgOiAzMCkgKiBkcGksXG4gICAgICAgICAgZm9udFNpemVNZWRpdW06IChpc1ByZXZpZXcgPyAxNiA6IDIyKSAqIGRwaSxcbiAgICAgICAgICBmb250U2l6ZVNtYWxsOiAoaXNQcmV2aWV3ID8gMTEgOiAxNikgKiBkcGksXG4gICAgICAgICAgdGV4dFBhZGRpbmc6IChpc1ByZXZpZXcgPyA2IDogMTApICogZHBpXG4gICAgICAgIH0pXG4gICAgICAgIEFQSSA9IGNoYXJ0LmRyYXdLcGlcbiAgICAgIGJyZWFrXG4gICAgICBjYXNlICdzaW5nbGVWYWx1ZSc6XG4gICAgICAgIGV4dHJhT3B0cyA9IGFzc2lnbihleHRyYU9wdHMsIHtcbiAgICAgICAgICBmb250U2l6ZTogKGlzUHJldmlldyA/IDIyIDogMzApICogZHBpXG4gICAgICAgIH0pXG4gICAgICAgIEFQSSA9IGNoYXJ0LmRyYXdTaW5nbGVWYWx1ZVxuICAgICAgYnJlYWtcbiAgICAgIGNhc2UgJ2dhdWdlJzpcbiAgICAgICAgZXh0cmFPcHRzID0gYXNzaWduKGV4dHJhT3B0cywge1xuICAgICAgICAgIHZhbHVlRm9udFNpemUgOiAoaXNQcmV2aWV3ID8gMjAgOiAzNikgKiBkcGksXG4gICAgICAgICAgbGltaXRGb250U2l6ZSA6IChpc1ByZXZpZXcgPyAxMCA6IDE0KSAqIGRwaVxuICAgICAgICB9KVxuICAgICAgICBBUEkgPSBjaGFydC5kcmF3R2F1Z2VcbiAgICAgIGJyZWFrXG4gICAgICBjYXNlICdmdW5uZWwnOlxuICAgICAgICBleHRyYU9wdHMuZHJhd0F4aXNMYWJlbCA9ICFpc1ByZXZpZXdcbiAgICAgICAgQVBJID0gY2hhcnQuZHJhd0Z1bm5lbFxuICAgICAgYnJlYWtcbiAgICB9XG5cbiAgICBpZiAoQVBJKSB7XG4gICAgICAgcmV0dXJuIEFQSShhc3NpZ24oe30sIGRlZmF1bHRPcHRzLCBjaGFydE9wdGlvbnMsIGV4dHJhT3B0cykpXG4gICAgfVxuXG4gICAgcmV0dXJuIG51bGxcbiAgfVxuXG4gIGRyYXdQaWUob3B0cykge1xuICAgIHJldHVybiBuZXcgcGllKG9wdHMpXG4gIH1cblxuICBkcmF3U2NhdHRlcihvcHRzKSB7XG4gICAgcmV0dXJuIG5ldyBzY2F0dGVyKG9wdHMpXG4gIH1cblxuICBkcmF3TWl4KG9wdHMpIHtcbiAgICByZXR1cm4gbmV3IG1peChvcHRzKVxuICB9XG5cbiAgZHJhd0twaShvcHRzKSB7XG4gICAgcmV0dXJuIG5ldyBrcGkob3B0cylcbiAgfVxuXG4gIGRyYXdTaW5nbGVWYWx1ZShvcHRzKSB7XG4gICAgcmV0dXJuIG5ldyBzaW5nbGVWYWx1ZShvcHRzKVxuICB9XG5cbiAgZHJhd0dhdWdlKG9wdHMpIHtcbiAgICByZXR1cm4gbmV3IGdhdWdlKG9wdHMpXG4gIH1cblxuICBkcmF3RnVubmVsKG9wdHMpIHtcbiAgICByZXR1cm4gbmV3IGZ1bm5lbChvcHRzKVxuICB9XG5cbiAgZHJhd1BvbGFyKG9wdHMpIHtcbiAgICByZXR1cm4gbmV3IHBvbGFyKG9wdHMpXG4gIH1cbn1cblxubGV0IGNoYXJ0ID0gbmV3IENoYXJ0KClcbm1vZHVsZS5leHBvcnRzID0gY2hhcnRcbiJdLCJuYW1lcyI6WyJjb2xvcnMiLCJnZXRDb2xvciIsImluZGV4IiwibGVuZ3RoIiwibWVhc3VyZVRleHQiLCJ0ZXh0IiwiZm9udFNpemUiLCJ3eCIsIlN0cmluZyIsInNwbGl0Iiwid2lkdGgiLCJmb3JFYWNoIiwiaXRlbSIsInRlc3QiLCJjdXJyRm9udCIsImZvbnQiLCJUaW1pbmciLCJlYXNlSW4iLCJwb3MiLCJNYXRoIiwicG93IiwiZWFzZU91dCIsImVhc2VJbk91dCIsImxpbmVhciIsIkFuaW1hdGlvbiIsIm9wdHMiLCJpc1N0b3AiLCJkdXJhdGlvbiIsInRpbWluZyIsImRlbGF5IiwiY3JlYXRlQW5pbWF0aW9uRnJhbWUiLCJyZXF1ZXN0QW5pbWF0aW9uRnJhbWUiLCJzZXRUaW1lb3V0Iiwic3RlcCIsInRpbWVTdGFtcCIsIkRhdGUiLCJhbmltYXRpb25GcmFtZSIsInN0YXJ0VGltZVN0YW1wIiwiX3N0ZXAiLCJ0aW1lc3RhbXAiLCJvblByb2Nlc3MiLCJvbkFuaW1hdGlvbkZpbmlzaCIsInByb2Nlc3MiLCJ0aW1pbmdGdW5jdGlvbiIsImJpbmQiLCJjcmVhdGVDYW52YXMiLCJjYW52YXNJZCIsInd4Q2FudmFzIiwiY3JlYXRlQ2FudmFzQ29udGV4dCIsImNhbnZhcyIsImRvY3VtZW50IiwiZ2V0RWxlbWVudEJ5SWQiLCJnZXRDb250ZXh0Iiwic2V0U3Ryb2tlU3R5bGUiLCJzdHlsZSIsInN0cm9rZVN0eWxlIiwic2V0RmlsbFN0eWxlIiwiZmlsbFN0eWxlIiwic2V0TGluZVdpZHRoIiwidyIsImxpbmVXaWR0aCIsInNldExpbmVKb2luIiwiaiIsImxpbmVKb2luIiwic2V0Rm9udFNpemUiLCJzIiwic2V0TGluZUNhcCIsImxpbmVDYXAiLCJzZXRNaXRlckxpbWl0IiwibWl0ZXJMaW1pdCIsInNldFRleHRBbGlnbiIsInRleHRBbGlnbiIsInNldEdsb2JhbEFscGhhIiwiZ2xvYmFsQWxwaGEiLCJzZXRTaGFkb3ciLCJvZmZzZXRYIiwib2Zmc2V0WSIsImJsdXIiLCJjb2xvciIsInNoYWRvd09mZnNldFgiLCJzaGFkb3dPZmZzZXRZIiwic2hhZG93Qmx1ciIsInNoYWRvd0NvbG9yIiwiY2xlYXJSZWN0IiwibG9nIiwiZHJhdyIsIm15TWVhc3VyZVRleHQiLCJjaGFydFV0aWxzIiwiUGllIiwiZGF0YSIsImhlaWdodCIsImhpZ2hMaWdodEluZGV4IiwiY2hhcnRQYWRkaW5nIiwibGVnZW5kUGFkZGluZyIsImxlZ2VuZEZvbnRTaXplIiwicmFkaXVzIiwiaGlnaGxpZ2h0UmFkaXVzIiwidG90YWwiLCJkcmF3V2l0aEFuaW1hdGlvbiIsInVuZGVmaW5lZCIsIm5vRGF0YSIsIm5vRGF0YVRleHQiLCJub0RhdGFUZXh0Q29sb3IiLCJub0RhdGFGb250U2l6ZSIsInNsaWNlU3BhY2UiLCJsZWdlbmRFbmFibGUiLCJkcmF3RGF0YUxhYmVsIiwiZGF0YUxhYmVsRm9udFNpemUiLCJkYXRhbGFiZWxDYWxsQmFjayIsInRvb2x0aXBDYWxsQmFjayIsInRvb2xUaXBCYWNrZ3JvdW5kQ29sb3IiLCJ0b29sVGlwUGFkZGluZyIsInRvb2xUaXBUZXh0UGFkZGluZyIsInRvb2xUaXBGb250U2l6ZSIsInRvb2xUaXBTcGxpdExpbmVXaWR0aCIsInRvb2xUaXBTcGxpdExpbmVDb2xvciIsIm11dGVDYWxsYmFjayIsInNsaWNlIiwic2VyaWVzU3RhdHVzIiwibXV0ZUNhbGxCYWNrIiwiaXNIaWRkZW5TZXJpZXMiLCJlIiwiY2FsY3VsYXRlQ2xpY2tQb3NpdGlvbiIsImlzTW92ZSIsInRvdWNoZXMiLCJ4IiwieSIsImNlbnRlclgiLCJjZW50ZXJZIiwiY3VyckFuZ2xlIiwiZ2V0QW5nbGVGb3JQb2ludCIsImFyY1BvaW50WCIsImNvcyIsImFyY1BvaW50WSIsInNpbiIsImFuZ2xlIiwiaSIsImVuZEFuZ2xlIiwicCIsIlBJIiwibGVnZW5kV2lkdGgiLCJpc011bHRpTGluZSIsInN0YXJ0WCIsInRleHRXaWR0aCIsIm5hbWUiLCJjaGFydEluZm8iLCJ0eCIsInR5Iiwic3FydCIsInIiLCJhY29zIiwiaGlnaExpZ2h0RGF0YSIsImhpZ2hMaWdodFkiLCJoaWdoTGlnaHRYIiwiaXNBbmltYXRpb24iLCJhbmltYXRpb25XaXRoTGVnZW5kIiwiaXNEcmF3RmluaXNoIiwiZHJhd05vRGF0YSIsInRoYXQiLCJhbmltYXRpb24iLCJjdXJyUGVyQW5nbGUiLCJtYXAiLCJkcmF3U2xpY2VBcmMiLCJkcmF3VG9vbFRpcCIsImRyYXdMZWdlbmQiLCJjaGFydENvbnRlbnRIZWlnaHQiLCJjaGFydENvbnRlbnRXaWR0aCIsImNvbnRlbnRXaWR0aCIsImhpZ2hMaWdodFZpZXdYIiwiaGlnaExpZ2h0Vmlld1kiLCJ0b29sVGlwV2lkdGgiLCJ0b29sVGlwSGVpZ2h0IiwibWF4VGlwTGluZVdpZHRoIiwidGl0bGUiLCJzdGFydFkiLCJiZWdpblBhdGgiLCJmaWxsUmVjdCIsImNsb3NlUGF0aCIsImRyYXdYIiwiZHJhd1kiLCJmaWxsVGV4dCIsIm1vdmVUbyIsImxpbmVUbyIsInN0cm9rZSIsImxlZ2VuZFRleHRDb2xvciIsInNlcmllc0NvbG9yIiwiYXJjIiwiZmlsbCIsImJldHdlZW5UZXh0IiwiYnR3VGV4dFdpZHRoIiwic2ltcGxlVGV4dCIsInNwVGV4dFdpZHRoIiwicG9zaXRpb24iLCJzbGljZUFuZ2xlIiwic2xpY2VTcGFjZUFuZ2xlT3V0ZXIiLCJzdGFydEFuZ2xlT3V0ZXIiLCJzd2VlcEFuZ2xlT3V0ZXIiLCJhcmNTdGFydFBvaW50WCIsImFyY1N0YXJ0UG9pbnRZIiwiYW5nbGVNaWRkbGUiLCJzbGljZVNwYWNlT2Zmc2V0IiwiY2FsY3VsYXRlTWluaW11bVJhZGl1c0ZvclNwYWNlZFNsaWNlIiwiYXJjRW5kUG9pbnRYIiwiYXJjRW5kUG9pbnRZIiwiY2VudGVyQW5nbGUiLCJhcmNDZW50ZXJYIiwiYXJjQ2VudGVyWSIsInRleHRTaXplIiwicGFyYW0iLCJzdGFydEFuZ2xlIiwic3dlZXBBbmdsZSIsImFyY01pZFBvaW50WCIsImFyY01pZFBvaW50WSIsImJhc2VQb2ludHNEaXN0YW5jZSIsImNvbnRhaW5lZFRyaWFuZ2xlSGVpZ2h0IiwidGFuIiwic3BhY2VkUmFkaXVzIiwiU2NhdHRlciIsImNoYXJ0UGFkZGluZ0xlZnQiLCJjaGFydFBhZGRpbmdSaWdodCIsImNoYXJ0UGFkZGluZ1RvcCIsImNoYXJ0UGFkZGluZ0JvdHRvbSIsImhpZ2hMaWdodENvbG9yIiwiaGlnaExpZ2h0U3Ryb2tlQ29sb3IiLCJkYXRhTGFiZWxQYWRkaW5nIiwiZGF0YUxhYmVsQ29sb3IiLCJheGlzRW5hYmxlIiwiYXhpc0ZvbnRTaXplIiwiYXhpc1ZhbHVlUGFkZGluZyIsImF4aXNMaW5lV2lkdGgiLCJheGlzTGluZUNvbG9yIiwiYXhpc0ZvbnRDb2xvciIsImRhc2hlZExpbmVXaWR0aCIsIm1heFZhbHVlIiwibWluVmFsdWUiLCJtYXhYVmFsdWUiLCJtaW5YVmFsdWUiLCJjaXJjbGVSYWRpdXMiLCJtYXgiLCJtaW4iLCJidWJibGVNYXhSYWRpdXMiLCJidWJibGVNaW5SYWRpdXMiLCJ4VGlja3MiLCJ4UmVmcyIsInkxUmVmcyIsInkxVGlja3MiLCJ5MlRpY2tzIiwibWF4WTFXaWR0aCIsImxhYmVsIiwibGFiZWxXaWR0aCIsIm1heFkyV2lkdGgiLCJyZXMiLCJyZWYiLCJsZWZ0IiwicmlnaHQiLCJ0b3AiLCJib3R0b20iLCJmZE5hbWUiLCJoaWdoTGlnaHRSYWRpdXMiLCJsYXllciIsInBvaW50IiwieFBvc2l0aW9uIiwieVBvc2l0aW9uIiwiaGlnaExpZ2h0QXJyYXlJbmRleCIsImRhdGFMYWJlbHMiLCJkcmF3QXhpcyIsImRyYXdJdGVtIiwiZHJhd1JlZnMiLCJkcmF3RGF0YUxhYmVsTGF5ZXIiLCJjdXJyRGF0YUxhYmVsIiwiaXNDcmFzaCIsImRhdGFMYWJlbCIsImlzUmVjdENyYXNoIiwicHVzaCIsImEiLCJiIiwiZ2V0Q2hhcnRDb250ZW50SGVpZ2h0IiwiZ2V0Q2hhcnRDb250ZW50V2lkdGgiLCJkYXRhU2l6ZSIsInoiLCJhYnMiLCJjb2xvckJ5IiwiYWRkRGF0YUxhYmVsIiwidmFsdWUiLCJkcmF3RGFzaGVkTGluZSIsImxhYmVsWU9mZnNldCIsImxlZnRYIiwicmlnaHRYIiwidG9wWSIsImJvdHRvbVkiLCJ4MSIsInkxIiwieDIiLCJ5MiIsImRhc2hMZW5ndGgiLCJkZWx0YVgiLCJkZWx0YVkiLCJudW1EYXNoZXMiLCJmbG9vciIsInlMYWJlbENvdW50IiwieExhYmVsQ291bnQiLCJwcmVZSXRlbVN0ZXAiLCJwcmVZSXRlbVZhbHVlIiwiaXRlbVBvc2l0aW9uIiwiYXhpc0l0ZW1UZXh0IiwiYXhpc0l0ZW1UZXh0V2lkdGgiLCJwcmVYSXRlbVN0ZXAiLCJwcmVYSXRlbVZhbHVlIiwiTWl4IiwiaXNIb3Jpem9udGFsIiwiZGF0YUxhYmVsUG9zaXRpb24iLCJkcmF3RXh0cmFEYXRhTGFiZWwiLCJleHRyYURhdGFsYWJlbFBvc2l0aW9uIiwibWF4U2Vjb25kYXJ5VmFsdWUiLCJtaW5TZWNvbmRhcnlWYWx1ZSIsInNlY29uZGFyeUF4aXNFbmFibGUiLCJ4QXhpc0RhdGEiLCJidWxsZXRXaWR0aCIsImRyYXdPcmRlciIsInkyUmVmcyIsInhBeGlzU2l6ZSIsInByZUJhcldpZHRoIiwiZ2V0Q29udGVudFdpZHRoIiwibWF4WEF4aXNXaWR0aCIsInNpemUiLCJoaWdoTGlnaHRQb3NpdGlvbiIsImVuZFkiLCJlbmRYIiwibGVnZW5kTGlzdCIsImRyYXdMYXllckRhdGEiLCJwcmVJdGVtV2lkdGgiLCJjb2xvclBvc2l0aW9uIiwicHJlR3JvdXBTaXplIiwic3ViRGF0YSIsInR5cGUiLCJkcmF3R3JvdXAiLCJkcmF3TGluZSIsImRyYXdTdGFja2VkIiwiZHJhd1BlcmNlbnQiLCJkcmF3QnVsbGV0IiwiaXNTZWNvbmRhcnkiLCJ2YWx1ZUxlbiIsImRyYXdTaXplIiwiemVyb1Bvc2l0aW9uIiwiemVyb1Bvc2l0aW9uT2Zmc2V0IiwiZW50cnkiLCJsYXN0SXRlbUluZGV4IiwiYmFyRW50cnkiLCJ0YXJnZXRFbnRyeSIsInRtcCIsImRyYXdEYXRhTGFiZWxQb3NpdGlvbiIsInRhcmdldFgiLCJ0YXJnZXRTdGFydFkiLCJ0YXJnZUVuZFkiLCJ0YXJnZXRTdGFydFgiLCJ0YXJnZXRFbmRYIiwidGFyZ2V0WSIsIm5lZ2F0aXZlU3RhcnRYIiwicG9zaXRpdmVTdGFydFgiLCJuZWdhdGl2ZUhlaWdodCIsInBvc2l0aXZlSGVpZ2h0Iiwic3ViU2l6ZSIsIml0ZW1JbmRleCIsInN1YkVudHJ5Iiwic3ViQmFySGVpZ2h0IiwibmVnYXRpdmVTdW0iLCJwb3NpdGl2ZVN1bSIsIm5lZ2F0aXZlRW5kWSIsInBvc2l0aXZlRW5kWSIsImRyYXdQYXRoIiwiYmFzZVZhbHVlIiwiYmFzZVBvc2l0aW9uIiwic3RhcnRMaXN0cyIsInByZVN1YkJhcldpZHRoIiwieTFMYWJlbENvdW50IiwieTJMYWJlbENvdW50IiwiZ2V0Q29udGVudEhlaWdodCIsImxhYmVsV2lkdGhBcnJheSIsImNyYXNoUGFkZGluZyIsImxhc3RMYWJlbEVuZCIsInNlcmllc05hbWUiLCJsZWdlbmQiLCJLcGkiLCJjdXJyZW50TmFtZSIsImN1cnJlbnRWYWx1ZSIsImNvbXBhcmVOYW1lIiwiY29tcGFyZVZhbHVlIiwiaXNBcmlzZSIsImFyaXNlQ29sb3IiLCJhcmlzZUltZyIsImRyb3BDb2xvciIsImRyb3BJbWciLCJjb2xvcjEiLCJjb2xvcjIiLCJjb2xvcjMiLCJmb250U2l6ZUxhcmdlIiwiZm9udFNpemVNZWRpdW0iLCJmb250U2l6ZVNtYWxsIiwidGV4dFBhZGRpbmciLCJkcmF3VmFsdWUiLCJtYXhUZXh0V2lkdGgiLCJ0ZXh0SGVpZ2h0IiwiY3VycmVudE5hbWVXaWR0aCIsImN1cnJlbnRWYWx1ZVdpZHRoIiwiY29tcGFyZU5hbWVXaWR0aCIsImNvbXBhcmVWYWx1ZVdpZHRoIiwiZHJhd0ltYWdlIiwiU2luZ2xlVmFsdWUiLCJ0ZXh0Q29sb3IiLCJHYXVnZSIsImN1clZhbHVlIiwibWF4VmFsdWVUZXh0IiwibWluVmFsdWVUZXh0IiwiY3VyVmFsdWVUZXh0IiwidmFsdWVDb2xvciIsImJhY2tncm91bmRDb2xvciIsImJhY2tncm91bmRCYW5kQ29sb3IiLCJsaW1pdFRleHRDb2xvciIsInZhbHVlRm9udFNpemUiLCJsaW1pdEZvbnRTaXplIiwiZHJhd0dhdWdlIiwidmFsdWVBbmdsZSIsInZhbHVlVGV4dFdpZGh0IiwibGVmdFZhbHVlWCIsInJpZ2h0VmFsdWVYIiwidmFsdWVZIiwiRnVubmVsIiwiZHJhd0F4aXNMYWJlbCIsImRhdGFBeGlzTGFiZWxDb2xvciIsImRhdGFMYWJlbExpbmVXaWR0aCIsInRvb2xUaXBTaGFkb3dDb2xvciIsInRvb2xUaXBTaGFkb3dPZmZzZXRYIiwidG9vbFRpcFNoYWRvd09mZnNldFkiLCJ0b29sVGlwU2hhZG93Qmx1ciIsImZ1bm5lbFdpZHRoIiwibWF4TGVmdExhYmVsV2lkdGgiLCJtYXhSaWdodExhYmVsV2lkdGgiLCJ0cmFuc2Zvcm1MYWJlbHMiLCJwcmVWYWx1ZSIsInRyYW5zZm9ybVZhbHVlIiwidHJhbnNmb3JtTGFiZWwiLCJ0b0ZpeGVkIiwidHJhbnNmb3JtV2lkdGgiLCJwcmVIZWlnaHQiLCJkcmF3RnVubmVsIiwiY3VycmVudFkiLCJ2YWx1ZVdpZHRoIiwicHJlVmFsdWVXaWR0aCIsInRyYW5zZm9ybUxhYmVsV2lkdGgiLCJQb2xhciIsInBvbGFyV2lkdGgiLCJheGlzSGlnaExpZ2h0RW5hYmxlIiwiYXhpc0hpZ2hMaWdodENvbG9yIiwiYXJjVHlwZSIsImxlZ2VuZFBhZGRpbmdUb3AiLCJwb2xhclJhZGl1cyIsInByZUFuZ2xlIiwiY2kiLCJkcmF3QXhpc1ZhbHVlIiwiZHJhd1BvbGFyIiwiZHJhd0JhciIsInRvdGFsUmFkaXVzIiwiaXRlbVJhZGl1cyIsInN0YXJ0UmFkaXVzIiwic3giLCJzeSIsImxhYmVsWCIsImxhYmVsWSIsInN1YkxhYmVsIiwic3ViTGFiZWxXaWR0aCIsImNvbmNhdCIsInN1YnN0cmluZyIsInlTaXplIiwic3ViUmFkaXVzIiwicG9pbnRzIiwiQ2hhcnQiLCJjaGFydFdpZHRoIiwiY2hhcnRIZWlnaHQiLCJtb2RlbCIsImlzUHJldmlldyIsImV4dHJhT3B0cyIsImRwaSIsImRlZmF1bHRPcHRzIiwiaXNWYWxpZE1vZGVsIiwiaXNOb0RhdGEiLCJBUEkiLCJhc3NpZ24iLCJPYmplY3QiLCJjaGFydE9wdGlvbnMiLCJnZXRDaGFydEluZm8iLCJtYWpvclR5cGUiLCJzdWJUeXBlIiwic3VidHlwZSIsInBhZGRpbmdMZWZ0IiwicGFkZGluZ1JpZ2h0IiwicGFkZGluZ1RvcCIsInBhZGRpbmdCb3R0b20iLCJpc0R1YWxBeGlzIiwiaXNIZWF2eUNoYXJ0IiwiY2hhcnQiLCJkcmF3UGllIiwiZHJhd1NjYXR0ZXIiLCJkcmF3TWl4IiwiZHJhd0twaSIsImRyYXdTaW5nbGVWYWx1ZSIsInBpZSIsInNjYXR0ZXIiLCJtaXgiLCJrcGkiLCJzaW5nbGVWYWx1ZSIsImdhdWdlIiwiZnVubmVsIiwicG9sYXIiXSwibWFwcGluZ3MiOiI7OztBQUFBLElBQU1BLFNBQVMsQ0FBQyxTQUFELEVBQVksU0FBWixFQUF1QixTQUF2QixFQUFrQyxTQUFsQyxFQUE2QyxTQUE3QyxFQUF3RCxTQUF4RCxFQUFtRSxTQUFuRSxFQUE4RSxTQUE5RSxFQUF5RixTQUF6RixFQUFvRyxTQUFwRyxFQUErRyxTQUEvRyxFQUEwSCxTQUExSCxDQUFmO0FBQ0EsSUFBTUMsV0FBVyxTQUFYQSxRQUFXLENBQVVDLEtBQVYsRUFBaUI7U0FDekJGLE9BQU9FLFFBQVFGLE9BQU9HLE1BQXRCLENBQVA7Q0FERjs7QUFJQTs7Ozs7Ozs7O0FBZ0JBLElBQU1DLGNBQWMsU0FBZEEsV0FBYyxDQUFTQyxJQUFULEVBQWVDLFFBQWYsRUFBeUI7TUFDckMsT0FBT0MsRUFBUCxLQUFjLFdBQWxCLEVBQStCOztXQUVwQkMsT0FBT0gsSUFBUCxDQUFQO1FBQ0lBLE9BQU9BLEtBQUtJLEtBQUwsQ0FBVyxFQUFYLENBQVg7UUFDSUMsUUFBUSxDQUFaO1NBQ0tDLE9BQUwsQ0FBYSxVQUFVQyxJQUFWLEVBQWdCO1VBQ3ZCLFdBQVdDLElBQVgsQ0FBZ0JELElBQWhCLENBQUosRUFBMkI7aUJBQ2hCLENBQVQ7T0FERixNQUVPLElBQUksUUFBUUMsSUFBUixDQUFhRCxJQUFiLENBQUosRUFBd0I7aUJBQ3BCLEdBQVQ7T0FESyxNQUVBLElBQUksS0FBS0MsSUFBTCxDQUFVRCxJQUFWLENBQUosRUFBcUI7aUJB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
