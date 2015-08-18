(function(window, document, $) {

    /**
     * @class CusScrollBar  自定义滚动条  使用示例：http://pyzy.net/Demo/cus_scroll_bar.html
     * @param options  <json object> 配置表
     *  {
     *       scrollDir:"y",           //滚动条方向          ['x'||'y',默认'y' 纵向滚动]
     *       contSelector:"",         //内容容器元素选择器  [必填项]
     *       scrollBarSelector:"",    //滚动条模拟元素选择器[非必填项,如果为空则自动取sliderSelector的父容器]
     *       sliderSelector:"",       //滚动条滑块          [非必填项,不需要滑块可忽略该配置（比如只需要按钮控制滚动时）]
     *       addBtnSelector:"",       //滚动条坐标增加按钮(横向的向右,纵向的向下按钮) [非必填项,不需要滚动条位移增加按钮，则忽略该配置]
     *       subBtnSelector:"",       //滚动条坐标减少按钮(横向的向左,纵向的向上按钮) [非必填项,不需要滚动条位移减少按钮，则忽略该配置]
     *       btnClkStepSize:60,       //按钮控制时，单次操作滚动的幅度（匀速动画形式完成滚动，滚动速度依赖scrollAnimTime、scrollStepTime配置）
     *       sliderMinHeight:10,      //滑块最小高度（若滑块按比例计算后小于当前值，则以当前值显示）
     *       sliderAlwaysShow:false,  //滑块是否保持显示(false则按照内容多少，自动判断显示、隐藏)
     *       scrollAnimTime:80,       //scrollToAnim单词动画总时长（结合scrollStepTime计算帧数）
     *       scrollStepTime:10,       //scrollToAnim动画执行中每帧时长
     *       scrollAnimAwait:false,   //滚动条动画是否等待上一帧完毕才执行交互响应
     *       wheelStepSize:80,        //滚轮控制滚动时,每次滚动触发的位移距离
     *       wheelBindSelector:'',    //滚轮事件要绑定到的DOM元素选择器（比如可以直接将内容容器的滚动交互绑到document上以实现局部fixed等）
     *       autoInitUiEvent:true,    //是否自动初始化UI事件绑定（使用者设为false则禁用自动初始化，此时可以手动调配一些隐含的配置后，再手动初始化）
     *       animEasing:function(p){ return p } //动画算子，改变则控制动画方式
     *  }
     * @events <自定义事件> 通过实例cs.on(type,handler)绑定、通过cs.un(type,handler)解绑、通过cs.fire(type)触发
     *  {
     *       scroll               //滚动条变化
     *       resizeSlider         //滑块尺寸变更 、内容容器改变
     *       sliderMove           //滑块坐标变更
     *       sliderShow           //滑块由隐藏变为显示
     *       sliderHide           //滑块由显示变为隐藏
     *       contChange           //变更了绑定的内容容器
     *       mouseEnter           //hoverDoms hover触发（含滑块、滚动条容器、按钮、内容容器）
     *       mouseLeave           //hoverDoms hover触发（含滑块、滚动条容器、按钮、内容容器）
     *       scrollToAnimSta      //滚动动画开始
     *       scrollToAnimEnd      //滚动动画结束
     *       scrollToAniming      //滚动动画播放中每一帧触发一次...
     *  }
     */
    function CusScrollBar(options) {

        this._init.call(this, options);

    };


    var topLeft = {
            y: "Top",
            x: "Left"
        },
        widthHeight = {
            y: "Height",
            x: "Width"
        },
        /* hover交互中各关联DOM及将追加的className */
        hoverCls = {
            scrollBar: "scroll-bar-hover",
            slider: "slider-hover",
            addBtn: "add-btn-hover",
            subBtn: "sub-btn-hover"
        },
        /* 设定要绑定hover交互的元素们 */
        hoverDoms = $.extend({
            cont: ''
        }, hoverCls),
        sliderActiveCls = "slider-active",
        /* 开关拖选功能 */
        preventDefaultHandler = function(e) {
            e.preventDefault()
        },
        selectEventType = "onselectstart" in document.createElement("div") ? "selectstart" : "mousedown";

    $.extend(CusScrollBar.prototype, {

        /** 
         * 统一初始化入口
         * @method _init
         * @param {Object} options JSON格式配置参数
         * @returns {CusScrollBar}
         */
        _init: function(options) {
            var _t = this;

            options = options || {};

            /* 合并配置参数 */
            _t.options = $.extend(true, {
                scrollDir: "y",
                contSelector: "",
                scrollBarSelector: "",
                sliderSelector: "",
                addBtnSelector: "",
                subBtnSelector: "",
                btnClkStepSize: 60,
                sliderMinHeight: 10,
                sliderAlwaysShow: false,
                scrollAnimTime: 80,
                scrollStepTime: 10,
                scrollAnimAwait: false,
                wheelStepSize: 80,
                wheelBindSelector: '',
                autoInitUiEvent: true,
                animEasing: function(p) {
                        return p
                    }
                    //animEasing:function(p){ return -1/2 * (Math.cos(Math.PI*p) - 1) }
                    /*animEasing:function (p) {
                        if (p < (1 / 2.75)) {
                            return (7.5625 * p * p);
                        } else if (p < (2 / 2.75)) {
                            return (7.5625 * (p -= (1.5 / 2.75)) * p + 0.75);
                        } else if (p < (2.5 / 2.75)) {
                            return (7.5625 * (p -= (2.25 / 2.75)) * p + 0.9375);
                        }
                        return (7.5625 * (p -= (2.625 / 2.75)) * p + 0.984375);
                    }*/
            }, options);

            /* 根据设定坐标方向得到要用于计算的属性（使用简写，不建议外部使用）*/
            var _dir = options.scrollDir == 'x' ? 'x' : 'y',
                scr = "scroll",
                _tl = topLeft[_dir],
                _wh = widthHeight[_dir];
            $.extend(true, _t, {
                _dir: _dir, //'x' || 'y'
                _tl: _tl, //'Top' || 'Left'
                _tl_: _tl.toLowerCase(), //'top' || 'left'
                _stl: scr + _tl, //'scrollTop' || 'scrollLeft'
                _wh: _wh, //'Width' || 'Height'
                _wh_: _wh.toLowerCase(), //'width' || 'height'
                _swh: scr + _wh //'scrollWidth' || 'scrollHeight'
            });

            //初始化自定义事件相关功能
            _t._initCustEvent()._initDomEvent();

            return _t;
        },

        /** 
         * 初始化自定义事件(让当前对象支持 on%un\fire方法)
         * @method _initCustEvent
         * @returns {CusScrollBar}
         */
        _initCustEvent: function() {
            var _t = this,
                _event = $(_t);
            $.each({
                on: "on",
                /*绑定*/
                un: "unbind",
                /*解绑*/
                fire: "triggerHandler" /*触发*/
            }, function(key, val) {
                _t[key] = function() {
                    _event[val].apply(_event, arguments);
                    return _t;
                };
            });
            return _t;
        },

        /** 
         * 初始化DOM引用、基础参数
         * @method _initDom
         * @returns {CusScrollBar}
         */
        _initDomEvent: function() {

            var _t = this,
                opts = _t.options,
                _sliderW = _t._sliderW = opts.sliderSelector && $(opts.sliderSelector);

            //内容容器
            _t._contW = $(opts.contSelector);
            //滚轮事件要绑定到的DOM元素
            _t._wheelBindW = opts.wheelBindSelector ? $(opts.wheelBindSelector) : _t._contW;
            //滚动条
            _t._scrollBarW = opts.scrollBarSelector ? $(opts.scrollBarSelector) : _sliderW && _sliderW.parent();

            //文档对象
            _t._docW = $(document);

            if (opts.autoInitUiEvent) {

                //初始化滚动条控制按钮（add、sub分别对应滚动条坐标增加、减少控制按钮）
                _t._initButton("add")
                    ._initButton("sub")
                    /*初始化滑块拖动功能*/
                    ._initSliderDragEvent()
                    /*初始化滚动条点击重新定位功能*/
                    ._initScrollBarEvent()
                    /*重算滑块尺寸*/
                    .resizeSlider()
                    /*重算滑块坐标*/
                    .removeSlider()
                    /*绑定滚轮操作*/
                    .bindMousewheel()
                    /*绑定内容滚动交互，同步滑块坐标*/
                    .bindContScroll()
                    /*绑定hover交互*/
                    .bindHover();

            }
        },

        /** 
         * 初始化控制按钮引用及交互事件，并将对应DOM引用赋值给_t._addBtnW||_t._subBtnW(前提需要有设置addBtnSelector||subBtnSelector)
         * @method _initButton
         * @param {String} btnType ["add"||"sub"] add、sub分别对应滚动条坐标增加、减少控制按钮
         * @returns {CusScrollBar}
         */
        _initButton: function(btnType) {
            var _t = this,
                opts = _t.options,
                btnSelector = opts[btnType + 'BtnSelector'];
            /* 没设定对应DOM元素选择器，则不执行后续初始化 */
            if (btnSelector) {
                var btnW = _t["_" + btnType + "BtnW"] = $(btnSelector),
                    basicNum = btnType == "add" ? 1 : -1,
                    docW = _t._docW;

                /* 按设定按钮点击对应滚动步长执行滚动动画 */
                function btnAnim() {
                    //console.log('btnAnim',_t.getScrollPosition(),_t.options.btnClkStepSize);
                    _t.scrollToAnim(_t.getScrollPosition() + _t.options.btnClkStepSize * basicNum);
                };

                /* 释放按钮 */
                function btnMouseUpHandler(e) {
                    e.preventDefault();
                    _t.un("scrollToAnimEnd", btnAnim);
                    docW.unbind("mouseup", btnMouseUpHandler);
                };

                /* 按下按钮 */
                btnW.on("mousedown", function(e) {
                    e.preventDefault();
                    docW.on("mouseup", btnMouseUpHandler);
                    _t.on("scrollToAnimEnd", btnAnim);
                    btnAnim();
                });
            }
            return _t;
        },

        //改变滚动条插件绑定到的容器为另一个contEl
        replaceCont: function(contSelector) {
            var _t = this,
                autoInitEvt = _t.options.autoInitUiEvent;
            //解除已绑定的DOM事件
            autoInitEvt && _t.unbindMousewheel().unbindContScroll().unbindHover();
            //替换掉内容容器
            _t._contW = $(contSelector);
            //重新初始化滑块尺寸、坐标、各DOM元素事件绑定
            autoInitEvt && _t.resizeSlider().removeSlider().bindMousewheel().bindContScroll().bindHover();
            _t.fire("contChange");
            return _t;
        },

        /** 
         * 绑定滚轮控制事件到设定元素
         * @method bindMousewheel
         * @returns {CusScrollBar}
         */
        bindMousewheel: function() {
            var _t = this;
            _t._wheelBindW.on("mousewheel", _t._mousewheelHandler || (_t._mousewheelHandler = function(e) {
                e.preventDefault();
                var oE = e.originalEvent,
                    wheelDelta = oE.detail || -(oE.wheelDelta || 0);
                _t.scrollToAnim(_t.getScrollPosition() + wheelDelta / Math.abs(wheelDelta) * _t.options.wheelStepSize);
            }));
            return _t;
        },

        /** 
         * 解绑滚轮控制（为内容容器可通过replaceCont进行更换提供解绑处理）
         * @method unbindMousewheel
         * @returns {CusScrollBar}
         */
        unbindMousewheel: function() {
            var _t = this,
                _mousewheelHandler = _t._mousewheelHandler;
            _mousewheelHandler && _t._wheelBindW.unbind("mousewheel", _mousewheelHandler);
            return _t;
        },

        /** 
         * 绑定内容容器的滚动事件（同步滑块坐标）
         * @method bindContScroll
         * @returns {CusScrollBar}
         */
        bindContScroll: function() {
            var _t = this;
            _t._contW.on("scroll", _t._contScrollHandler || (_t._contScrollHandler = function() {
                //console.log(this,'_contW scroll');
                _t.removeSlider();
            }));
            return _t;
        },

        /** 
         * 解除内容容器的滚动事件（为内容容器可通过replaceCont进行更换提供解绑处理）
         * @method unbindContScroll
         * @returns {CusScrollBar}
         */
        unbindContScroll: function() {
            var _t = this,
                _contScrollHandler = _t._contScrollHandler;
            _contScrollHandler && _t._contW.unbind("scroll", _contScrollHandler);
            return _t;
        },

        /** 
         * 为操作按钮或滑块绑定hover交互（追加或移除滑块、滚动条、操作按钮hover交互的className,内容容器hover时同样触发hover）
         * @method bindHover
         * @returns {CusScrollBar}
         */
        bindHover: function() {
            var _t = this,
                _mouseEnterHandler = _t._mouseEnterHandler || (_t._mouseEnterHandler = function() {
                    $.each(hoverCls, function(key, cls) {
                        var elW = _t["_" + key + "W"];
                        elW && elW.addClass(cls);
                        if (!_t._hoverStatus) {
                            _t._hoverStatus = true;
                            _t.fire("mouseEnter");
                        }
                    });
                }),
                _mouseLeaveHandler = _t._mouseLeaveHandler || (_t._mouseLeaveHandler = function() {
                    $.each(hoverCls, function(key, cls) {
                        var elW = _t["_" + key + "W"];
                        elW && elW.removeClass(cls);
                        if (_t._hoverStatus) {
                            _t._hoverStatus = false;
                            _t.fire("mouseLeave");
                        }
                    });
                });

            $.each(hoverDoms, function(key, cls) {
                var elW = _t["_" + key + "W"];
                elW && elW.on("mouseenter", _mouseEnterHandler).on("mouseleave", _mouseLeaveHandler);
            });

            return _t;
        },
        /** 
         * 为操作按钮或滑块解绑hover交互（为内容容器可通过replaceCont进行更换提供解绑处理）
         * @method unbindHover
         * @returns {CusScrollBar}
         */
        unbindHover: function() {
            var _t = this;
            $.each(hoverDoms, function(key, cls) {
                var elW = _t["_" + key + "W"];
                if (elW) {
                    _t._mouseEnterHandler && elW.unbind("mouseleave", _t._mouseEnterHandler);
                    _t._mouseLeaveHandler && elW.unbind("mouseleave", _t._mouseLeaveHandler);
                }
            });
            return _t;
        },

        /** 
         * 初始化滑块拖动DOM事件
         * @method _initSliderDragEvent
         * @returns {CusScrollBar}
         */
        _initSliderDragEvent: function() {
            var _t = this,
                sliderW = _t._sliderW,
                sliderEl = sliderW && sliderW[0];
            if (sliderEl) {
                var docW = _t._docW,
                    dragStaPagePos, dragStaScrollBarRate, dragStaScrollPos;

                /* document的museup事件释放拖动（除了鼠标释放，自动加载下一屏的需求中也需要自动释放拖动，所以后面通过releaseDrag将该方法暴露出去） */
                function docMouseupHandler(e) {
                    dragStaPagePos = null;
                    e && e.preventDefault();
                    sliderEl.releaseCapture && sliderEl.releaseCapture(); //for ie6 解除绑定滑块事件监听
                    sliderW.removeClass(sliderActiveCls);
                    docW.unbind(selectEventType, preventDefaultHandler); //重启拖选
                    //console.log('docMouseupHandler');
                    docW.unbind("mouseup contextmenu", docMouseupHandler).unbind("mousemove", docMousemoveHandler);
                };

                /* 暴露主动释放拖拽的功能接口 */
                _t.releaseDrag = docMouseupHandler;

                /* 拖拽 */
                function docMousemoveHandler(e) {
                    if (dragStaPagePos == null) return;
                    //起始坐标点 + (鼠标位移距离*滚动条最大坐标值/滚动条容器尺寸)
                    _t.scrollTo(dragStaScrollPos + (_t.getPageXY(e) - dragStaPagePos) * dragStaScrollBarRate);
                };

                /* 滑块被按下时启动拖拽 */
                sliderW.on("mousedown", function(e) {
                    e.stopPropagation();
                    e.preventDefault();
                    dragStaPagePos = _t.getPageXY(e); //鼠标按下时页面中的所在坐标
                    dragStaScrollBarRate = _t.getScrollSize() / _t.getScrollBarSize(); //鼠标按下时计算滚动条最大值与滚动条容器的比率(用于将鼠标位移距离转换为滚动条位移距离)
                    dragStaScrollPos = _t.getScrollPosition(); //鼠标按下时滚动条所在的坐标点
                    sliderEl.setCapture && sliderEl.setCapture(); //for ie6 绑定事件监听到滑块
                    sliderW.addClass(sliderActiveCls);
                    docW.on(selectEventType, preventDefaultHandler) //关闭拖选
                        .on("mouseup contextmenu", docMouseupHandler)
                        .on("mousemove", docMousemoveHandler);
                });
            }
            return _t;
        },


        /** 
         * 点击滚动条容器触发滚动并重新定位滑块
         * @method _initScrollBarEvent
         * @returns {CusScrollBar}
         */
        _initScrollBarEvent: function() {
            var _t = this,
                scrollBarW = _t._scrollBarW;
            scrollBarW && scrollBarW.on("mousedown", function(e) {
                _t.scrollToByPagePos(e);
            });
            return _t;
        },

        /** 
         * 为用于模拟的元素绑定原生DOM事件
         * @method onDomEvent
         * @param {String}   type      事件名称
         * @param {Function} handler   监听方法
         * @param {String}   elName    取值范围为对象hoverDoms的key或选择器(为空则默认为滑块)
         * @returns {CusScrollBar}
         */
        onDomEvent: function(type, handler, elName) {
            elName = elName || "slider"; //slider || cont || scrollBar
            var _t = this,
                elW = _t['_' + elName + 'W'] || $(elName);
            elW && elW.on(type, handler);
            return _t;
        },

        /** 
         * 为用于模拟的元素解绑原生事件
         * @method unDomEvent
         * @param {String}   type      事件名称
         * @param {Function} handler   监听方法
         * @param {String}   elName    取值范围为对象hoverDoms的key或选择器(为空则默认为滑块)
         * @returns {CusScrollBar}
         */
        unDomEvent: function(type, handler, elName) {
            elName = elName || "slider"; //slider || cont || scrollBar
            var _t = this,
                elW = _t['_' + elName + 'W'] || $(elName);
            elW && elW.unbind(type, handler);
            return _t;
        },

        _animTimer: null,
        _animProgress: null,
        /** 
         * 动画渐进式执行scrollTo
         * @method scrollToAnim
         * @param {Number}   toVal      要滚动到的目标坐标值
         * @param {Number}   stepTime   动画单帧时长(毫秒)
         * @param {Number}   animTime   动画总时长(毫秒)
         * @param {Boolean}  isAwait    是否强制等待前一动画执行完毕（忽略则默认为 options.scrollAnimAwait）
         * @param {Function} animEasing 动画算子（不传入则使用options.animEasing）
         * @returns {CusScrollBar}
         */
        scrollToAnim: function(toVal, stepTime, animTime, isAwait, animEasing) {
            var _t = this,
                opts = _t.options,
                easing = opts.animEasing;
            if (_t._animTimer) {
                if (isAwait == null ? opts.scrollAnimAwait : isAwait) return;
                _t.scrollToAnimStop();
            }
            stepTime = stepTime || opts.scrollStepTime;
            animTime = animTime || opts.scrollAnimTime;

            var formVal = _t.getScrollPosition(),
                currVal = formVal,
                distance = toVal - formVal,
                frameCount = Math.ceil(animTime / stepTime),
                frameProgress = 0,
                progress = 0;

            _t.fire('scrollToAnimSta');
            //开始动画
            (function() {
                frameProgress++;
                progress = frameProgress / frameCount;
                currVal = formVal + distance * easing(progress);
                //console.log('scrollToAniming',currVal);
                _t.scrollTo(currVal);
                _t._animProgress = {
                    progress: progress,
                    currVal: currVal,
                    formVal: formVal,
                    toVal: toVal,
                    distance: distance
                };
                _t.fire('scrollToAniming', _t._animProgress);
                if (frameProgress == frameCount) {
                    _t.scrollToAnimStop();
                } else {
                    _t._animTimer = setTimeout(arguments.callee, stepTime);
                }
            })();
            return _t;
        },

        /* 终止动画 */
        scrollToAnimStop: function() {
            var _t = this;
            clearTimeout(_t._animTimer);
            _t._animTimer = null;
            _t.fire('scrollToAnimEnd', _t._animProgress);
        },

        /* 根据event对象及dir ["x"||"y"]得到鼠标坐标 */
        getPageXY: function(event, dir) {
            return event["page" + ((dir || this._dir).toUpperCase())];
        },

        //按照pageXY定位滚动条坐标 scrollPosDiff是滑块操作时候的初始差值
        //如果不传scrollPosDiff则以当前pageXY作为滑块中心点,否则以scrollPosDiff与当前pageXY的差值作为滚动条新坐标
        scrollToByPagePos: function(e, scrollPosDiff) {
            var _t = this;
            _t.scrollTo(_t.getScrollSize() * (_t.getPageXY(e) - _t.getScrollBarPosition() - _t.getSliderSize() * .5) / (_t.getScrollBarSize() || 1));
            return _t;
        },
        //按差值调整滚动条所在位置
        scrollAdd: function(diffVal) {
            var _t = this;
            _t.scrollTo(_t.getScrollPosition() + (diffVal || 0));
            return _t;
        },
        //改变滚动条所在位置到positionVal
        scrollTo: function(positionVal) {
            var _t = this;
            //console.log('scrollTo:',_t._stl,positionVal);
            _t._contW[_t._stl](positionVal);
            _t.fire('scroll');
            return _t;
        },
        //取得滚动条所在位置坐标值
        getScrollPosition: function() {
            return this._contW[0][this._stl] || 0;
        },
        //取得滚动条最大可滚动到的坐标值
        getMaxScrollPosition: function() {
            return this.getScrollSize() - this.getContSize();
        },

        //内容容器高度
        getContSize: function() {
            return this._contW[this._wh_]();
        },

        //可滚动内容尺寸
        getScrollSize: function() {
            var _t = this;
            return Math.max(_t.getContSize(), this._contW[0][_t._swh] || 0);
        },

        //滚动条模拟元素尺寸
        getScrollBarSize: function() {
            return this._scrollBarW[this._wh_]();
        },

        //滚动条模拟元素坐标
        getScrollBarPosition: function() {
            return this._scrollBarW.offset()[this._tl_];
        },

        //滑块当前应在尺寸
        getSliderSize: function() {
            var _t = this;
            return Math.max(_t.getScrollBarSize() * _t.getContSize() / (_t.getScrollSize() || 1), _t.options.sliderMinHeight);
        },

        //滑块最大坐标
        getMaxSliderPosition: function() {
            return this.getScrollBarSize() - this._sliderW[this._wh_]();
        },

        //滑块当前应在坐标
        getSliderPosition: function() {
            var _t = this,
                maxSliderPos = _t.getMaxSliderPosition();
            return Math.min(maxSliderPos * _t.getScrollPosition() / (_t.getMaxScrollPosition() || 1), maxSliderPos);
        },

        /** 
         * 重新计算并设置滑块尺寸
         * @method scrollToAnim
         * @param {Number}   sizeVal   要调整到的长度尺寸，不传则默认为this.getSliderSize()
         * @returns {CusScrollBar}
         */
        resizeSlider: function(sizeVal) {
            var _t = this,
                sliderEl = _t._sliderW && _t._sliderW[0];
            if (sliderEl) {
                sizeVal = isNaN(sizeVal) ? _t.getSliderSize() : sizeVal;
                var sliderDisplay = _t.options.sliderAlwaysShow || sizeVal < _t.getScrollBarSize() ? "" : "none",
                    originDisplay = sliderEl.style.display;
                if (sliderDisplay != originDisplay) {
                    sliderEl.style.display = sliderDisplay;
                    _t.fire(sliderDisplay == "none" ? "sliderHide" : "sliderShow");
                }
                sliderEl.style[_t._wh_] = sizeVal + 'px';
                _t.fire('resizeSlider');
            }
            return _t;
        },

        /** 
         * 重新计算并设置滑块位置
         * @method scrollToAnim
         * @param {Number}   positionVal   要调整到的坐标值，不传则默认为this.getSliderPosition()
         * @returns {CusScrollBar}
         */
        removeSlider: function(positionVal) {
            var _t = this,
                sliderEl = _t._sliderW && _t._sliderW[0];
            if (sliderEl) {
                sliderEl.style[_t._tl_] = (isNaN(positionVal) ? _t.getSliderPosition() : positionVal) + 'px';
                _t.fire('sliderMove');
            }
            return _t;
        }
    });

    window.CusScrollBar = CusScrollBar;

})(window, document, jQuery);
/*  自定义滚动条功能模块 end */