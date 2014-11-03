/**
 * @fileOverview 图片放大查看imageZoomer.js
 * @author Zhao Jianfei <icefox0801@hotmail.com>
 * @version 0.0.1
 * @description 图片区域放大查看控件
 * @copyright © 2014 Jianfei Zhao
 **/
(function (window, undefined) {
    /**
     * @description imageZoomer.js图片放大查看控件
     * @module imageZoomer
     */
    if(typeof $ !== 'function') return false;

    var viewer = {},
        _instances = [];
    /**
     * @name module:imageZoomer~defaults
     * @type {object}
     * @property {string} viewerIdPrefix viewer元素id前缀
     * @property {number} viewerWidth viewer元素宽度
     * @property {number} viewerHeight viewer元素高度
     * @property {string} viewerLayout viewer布局方式，auto|top|right|bottom|left
     * @property {string} zoomerIdPrefix zoomer元素id前缀
     */
    var defaults = {
        viewerIdPrefix: 'imageViewer',
        viewerWidth: 600,
        viewerHeight: 300,
        viewerLayout: 'auto', // 'top'|'right'|'bottom'|'left'|'auto'
        zoomerIdPrefix: 'imageZoomer'
    };

    var caretStyle = {
        common: {
            'position': 'absolute',
            'background-image': 'url(./src/image/caret.gif)',
            'display': 'block'
        },
        bottom: {
            'top': '-9px',
            'width': '17px',
            'height': '9px',
            'background-position': '0 0'
        },
        left: {
            'right': '-9px',
            'width': '9px',
            'height': '17px',
            'background-position': '-4px -11px'
        },
        top: {
            'bottom': '-9px',
            'width': '17px',
            'height': '9px',
            'background-position': '0 -46px'
        },
        right: {
            'left': '-9px',
            'width': '9px',
            'height': '17px',
            'background-position': '-4px -28px'
        }
    };

    var getMaxProperValue = function (properValueArray, index) {
        var valueArray = [],
            maxValue;
        index = index || 0;

        if(properValueArray.length === 1) return properValueArray;

        if(typeof properValueArray[0][index] === 'undefined') return properValueArray;

        if(index === 0 && typeof properValueArray[0][0] === 'string') {
            return getMaxProperValue(properValueArray, 1);
        }

        maxValue = Math.max.apply(undefined, properValueArray.map(function (item){
            return item[index];
        })); // #TODO: map polyfill

        properValueArray = properValueArray.filter(function (item) {
            return item[index] >= maxValue;
        }); // #TODO: filter polyfill

        return getMaxProperValue(properValueArray, index+1);
    };

    viewer.getInstances = function () {
        return _instances;
    };

    viewer.initZoomer = function (elem, options) {

        var zoomer,
            instances;

        if(typeof options === 'string') {
            options = {
                viewerLayout: options
            };
        } else if (typeof options !== 'object'){
            options = {};
        }

        instances = viewer.getInstances();
        options._zoomerIndex = instances.length;

        zoomer = new Zoomer(elem, options);

        instances.push(zoomer);

        return zoomer;
    };

    viewer.destroyZoomer = function (instance) {

        var instances = [],
            zoomer;

        if(!(instance instanceof Zoomer)) return false;

        instances = viewer.getInstances();

        for(var idx = 0, len = instances.length; idx < len; idx++) {

            if(instances[idx] === instance) {
                instance.destroy();
                instances.splice(idx, 1);
            }

        }

        return instance;

    };
    /**
     * @name Zoomer
     * @class Zoomer类定义，封装了zoomer、viewer元素的渲染等方法
     * @constructor
     * @param {object|string} elem    绑定控件的DOM元素（或jQuery选择器）
     * @param {object} options 控件配置参数，属性请参考{@linkcode module:imageZooer~defaults}
     */
    var Zoomer = function (elem, options) {
        /**
         * @alias Zoomer#$elem
         * @description 绑定控件的jQuery对象
         * @type {object}
         */
        this.$elem = $(elem);
        /**
         * @alias Zoomer#$viewer
         * @description 图片查看区域的jQuery对象
         * @type {object}
         */
        this.$viewer = null;
        /**
         * @alias Zoomer#$viewerImage
         * @description 图片查看区域图片的jQuery对象
         * @type {object}
         */
        this.$viewerImage = null;
        /**
         * @alias Zoomer#$target
         * @description 当前鼠标悬停的jQuery对象
         * @type {object}
         */
        this.$target = null;
        /**
         * @alias Zoomer#zoomRate
         * @description 图片放大倍率
         * @type {number}
         */
        this.zoomRate = 0;
        /**
         * @alias Zoomer#options
         * @description 控件配置参数，默认值为{@linkcode module:imageZoomer~defaults}
         * @type {number}
         */
        this.options = $.extend({}, defaults, options);

        this.init();

    };
    /* Zoomer方法定义 */
    Zoomer.prototype = {
        /**
         * @description Zoomer构造方法
         * @memberOf Zoomer
         * @method constructor
         * @instance
         */
        constructor: Zoomer,
        /**
         * @description Zoomer初始化方法
         * @memberOf Zoomer
         * @instance
         */
        init: function () {
            var _t = this,
                img = new Image();

            _t.$zoomer = _t.createZoomer();
            _t.$viewer = _t.createViewer();
            _t.$viewerImage = _t.$viewer.find('.viewer-image');

            _t.$elem.on('mouseover', function (e) {
                var $t = $(this),
                    offset = {},
                    rect = {};

                _t.$target = $t;

                img.src = $t.attr('src'); // #TODO: url获取方法

                _t.$viewerImage.css({
                    'background-image': 'url(' + img.src + ')'
                });

                _t.layoutViewer(_t.options.viewerLayout);

                if(img.src == $t.attr('src')) {
                    originWidth = img.width;
                    zoomedWidth = $t.width();

                    _t.zoomRate = originWidth / zoomedWidth;

                    rect.width = _t.options.viewerWidth / _t.zoomRate;
                    rect.height = _t.options.viewerHeight / _t.zoomRate;

                    offset.left = e.offsetX;
                    offset.top = e.offsetY;

                    _t.$zoomer.css({
                        'width': Math.min($t.width(), rect.width),
                        'height': Math.min($t.height(), rect.height)
                    });

                    _t.$zoomer.show();
                    _t.$viewer.show();

                    $t.css({'cursor': 'move'});
                    _t.layoutZoomer($t, offset, rect);
                    return false;
                }

                img.onload = function () {
                    originWidth = img.width;
                    zoomedWidth = $t.width();

                    _t.zoomRate = originWidth / zoomedWidth;

                    rect.width = _t.options.viewerWidth / _t.zoomRate;
                    rect.height = _t.options.viewerHeight / _t.zoomRate;

                    offset.left = e.offsetX;
                    offset.top = e.offsetY;

                    _t.$zoomer.css({
                        'width': Math.min($t.width(), rect.width),
                        'height': Math.min($t.width(), rect.width)
                    });

                    _t.$zoomer.show();
                    _t.$viewer.show();

                    $t.css({'cursor': 'move'});
                    _t.layoutZoomer($t, offset, rect);
                };
            });
        },
        /**
         * @description Zoomer析构方法
         * @memberOf Zoomer
         * @instance
         */
        destroy: function () {
            var _t = this;
            // 解绑事件
            _t.$elem.off('mouseover');
            // 从DOM中移除元素
            _t.$zoomer.remove();
            _t.$viewer.remove();
            // 删除属性（引用）
            for(var attr in _t) delete(_t[attr]);
            // 删除原型（引用）
            _t.__proto__ = null;

        },
        /**
         * @description 创建zoomer元素方法
         * @memberOf Zoomer
         * @instance
         * @return {object} zoomer元素jQuery对象
         */
        createZoomer: function () {
            var _t = this,
                zoomerId = _t.options.zoomerIdPrefix + _t.options._zoomerIndex,
                originOffset = {},
                $zoomer = $('<div id="' + zoomerId + '"></div>');

            $zoomer.css({
                'display': 'none',
                'position': 'absolute',
                'cursor': 'move',
                'background-color': '#333',
                'background-color': 'rgba(255,192,0,0.5)',
                'box-sizing': 'border-box'
            });

            $zoomer.on('mousemove', function (e) {
                var $t = $(this),
                    offset = {},
                    shift = {},
                    rect = {
                        'width': $t.width(),
                        'height': $t.height()
                    };

                offset.left = e.pageX - _t.$target.offset()['left'];
                offset.top = e.pageY - _t.$target.offset()['top'];

                shift.left = _t.$zoomer.offset()['left'] - _t.$target.offset()['left'];
                shift.top = _t.$zoomer.offset()['top'] - _t.$target.offset()['top'];

                _t.layoutZoomer(_t.$target, offset, rect);
                _t.captureImage(shift);
            });

            $zoomer.on('mouseout', function (e) {
                var $t = $(this);

                $zoomer.hide();
                _t.$viewer.hide();
            });

            $zoomer.appendTo('body');

            return $zoomer;
        },
        /**
         * @description 创建viewer元素方法
         * @memberOf Zoomer
         * @instance
         * @return {object} viewer元素jQuery对象
         */
        createViewer: function () {
            var _t = this,
                viewerId = _t.options.viewerIdPrefix + _t.options._zoomerIndex,
                $viewer = $('<div id="' + viewerId + '"><div class="viewer-image"></div><span id="caret"></span></div>');

            $viewer.css({
                'display': 'none',
                'padding': '5px',
                'border': '1px solid #ccc',
                'position': 'absolute',
            });

            $viewer.find('.viewer-image').css({
                'width': _t.options.viewerWidth,
                'height': _t.options.viewerHeight
            });

            $viewer.appendTo('body');

            return $viewer;
        },
        /**
         * @description 截取图片区域方法
         * @memberOf Zoomer
         * @instance
         * @param  {object} offset 截取部分的坐标
         */
        captureImage: function (offset) {
            var _t = this;

            _t.$viewerImage.css({
                'background-position-x': -offset.left * _t.zoomRate,
                'background-position-y': -offset.top * _t.zoomRate
            });
        },
        /**
         * @description viewer元素布局方法
         * @memberOf Zoomer
         * @instance
         * @param  {string} layout 布局方式，具体参考{@linkcode module:imageZoomer~defaults}
         */
        layoutViewer: function (layout) {
            var _t = this,
                spacing = 20,
                properValueObj = {
                    top: [0, 0, 1],
                    right: [0, 0, 4],
                    bottom: [0, 0, 2],
                    left: [0, 0, 3]
                },
                bestDirection = 'right',
                properValueArray = [],
                screenPos = {},
                $window = $(window),
                area = {
                    top: 0,
                    right: 0,
                    bottom: 0,
                    left: 0
                },
                visibleArea = {
                    top: 0,
                    right: 0,
                    bottom: 0,
                    left: 0
                },
                offsetLeft = 0,
                offsetTop = 0,
                imgWidth = _t.$target.width(),
                imgHeight = _t.$target.height(),
                windowWidth = $window.width(),
                windowHeight = $window.height(),
                bodyScrollTop = $window.scrollTop(),
                bodyScrollLeft = $window.scrollLeft(),
                viewerWidth = _t.$viewer.width(),
                viewerHeight = _t.$viewer.height(),
                imgOffsetLeft = _t.$target.offset()['left'],
                imgOffsetTop = _t.$target.offset()['top'];

            screenPos.top = imgOffsetTop - bodyScrollTop - spacing;
            screenPos.left = imgOffsetLeft - bodyScrollLeft - spacing;
            screenPos.right = windowWidth - screenPos.left - imgWidth - spacing;
            screenPos.bottom = windowHeight - screenPos.top - imgHeight - spacing;

            visibleArea.top = Math.min(Math.max(screenPos.top, 0), viewerHeight) * Math.min(windowWidth, viewerWidth);
            visibleArea.left = Math.min(Math.max(screenPos.left, 0), viewerWidth) * Math.min(windowHeight, viewerHeight);
            visibleArea.right = Math.min(Math.max(screenPos.right, 0), viewerWidth) * Math.min(windowHeight, viewerHeight);
            visibleArea.bottom = Math.min(Math.max(screenPos.bottom, 0), viewerHeight) * Math.min(windowWidth, viewerWidth);

            area.top = screenPos.top * windowWidth;
            area.right = screenPos.right * windowHeight;
            area.bottom = screenPos.bottom * windowWidth;
            area.left = screenPos.left * windowHeight;

            for(var direction in properValueObj) {
                properValueObj[direction][0] = visibleArea[direction];
                properValueObj[direction][1] = area[direction];
                properValueArray.push([direction].concat(properValueObj[direction]));
            }

            bestDirection = getMaxProperValue(properValueArray)[0][0];

            if(layout !== 'auto') bestDirection = layout;
            console.log(bestDirection);

            switch(bestDirection) {
                case 'right':
                    offsetLeft = imgOffsetLeft + imgWidth + 20;
                    offsetTop = Math.min(Math.max(bodyScrollTop, imgOffsetTop - (viewerHeight - imgHeight) / 2), bodyScrollTop + Math.max(windowHeight - viewerHeight, 0));
                    break;
                case 'top':
                    offsetLeft = Math.min(Math.max(bodyScrollLeft, imgOffsetLeft - (viewerWidth - imgWidth) / 2), bodyScrollLeft + Math.max(windowWidth - viewerWidth, 0));
                    offsetTop = imgOffsetTop - viewerHeight - 30;
                    break;
                case 'left':
                    offsetLeft = imgOffsetLeft - viewerWidth - 30;
                    offsetTop = Math.min(Math.max(bodyScrollTop, imgOffsetTop - (viewerHeight - imgHeight) / 2), bodyScrollTop + Math.max(windowHeight - viewerHeight, 0));
                    break;
                case 'bottom':
                    offsetLeft = Math.min(Math.max(bodyScrollLeft, imgOffsetLeft - (viewerWidth - imgWidth) / 2), bodyScrollLeft + Math.max(windowWidth - viewerWidth, 0));
                    offsetTop = imgOffsetTop + imgHeight + 20;
                    break;
                default:
                    break;
            }

            _t.$viewer.css({
                left: offsetLeft,
                top: offsetTop
            });

            _t.layoutCaret(bestDirection);

        },
        /**
         * @description 放置viewer边缘小箭头方法
         * @memberOf Zoomer
         * @instance
         * @param  {string} bestDirection 放置方向
         */
        layoutCaret: function (bestDirection) {
            var _t = this,
                top = _t.$viewer.height() / 2,
                left = _t.$viewer.width() / 2,
                postionStyle  = ('left|right'.indexOf(bestDirection) > -1) ? {
                    top: top,
                    left: 'auto',
                    right: 'auto',
                    bottom: 'auto'
                } : {
                    left: left,
                    top: 'auto',
                    bottom: 'auto',
                    right: 'auto'
                };

            _t.$viewer.find('#caret').css($.extend(postionStyle, caretStyle.common, caretStyle[bestDirection]));

        },
        /**
         * @description 放置zoomer放大区块元素方法
         * @memberOf Zoomer
         * @instance
         * @param  {object} $elem  鼠标悬停元素的jQuery对象
         * @param  {object} offset 鼠标相对于悬停图片的位移
         * @param  {object} rect   鼠标悬停图片的宽高
         */
        layoutZoomer: function ($elem, offset, rect) {
            var _t = this,
                width = $elem.width(),
                height = $elem.height(),
                offsetTop = $elem.offset()['top'],
                offsetLeft = $elem.offset()['left'];

            _t.$zoomer.css({
                'top': Math.min(Math.max(0, offset.top - rect.height / 2), height - rect.height)  + offsetTop,
                'left': Math.min(Math.max(0, offset.left - rect.width / 2), width - rect.width) + offsetLeft
            });
        }
    };

    if (typeof define === 'function' && define.amd) {
        define('imageZoomer', [], function() {
            return viewer;
        });
    }

    window.viewer = viewer;
})(window, undefined);