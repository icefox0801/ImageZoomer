(function (window, undefined) {

    if(typeof $ !== 'function') return false;

    var snippets = {
        zoomer: '',
        viewer: ''
    };

    var viewer = {},
        instances = [],
        options = {},
        defaults = {
            viewerWidth: 600,
            viewerHeight: 300,
            viewerLayout: 'right', // 'top'|'right'|'bottom'|'left'|'auto'
        };

    var caretStyle = {
        common: {
            'position': 'absolute',
            'background-image': 'url(./src/caret.gif)',
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

    window.gg = getMaxProperValue;

    viewer.instances = instances;

    viewer.initZoomer = function (elem, options) {
        return new Zoomer(elem, options);
    };

    var Zoomer = function (elem, options) {

        this.$elem = $(elem);

        this.$viewer = null;

        this.$viewerImage = null;

        this.$target = null;

        this.zoomRate = 0;

        this.options = $.extend({}, defaults, options);

        this.init();

    };

    Zoomer.prototype = {
        constructor: Zoomer,
        init: function () {
            var _t = this,
                img = new Image();

            _t.$zoomer = _t.createZoomer();
            _t.$viewer = _t.createViewer();
            _t.$viewerImage = _t.$viewer.find('#viewer');

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
        createZoomer: function () {
            var _t = this,
                originOffset = {},
                $zoomer = $('<div id="zoomer"></div>');

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

        createViewer: function () {
            var _t = this,
                $viewer = $('<div id="viewerContainer"><div id="viewer"></div><span id="caret"></span></div>');

            $viewer.css({
                'display': 'none',
                'padding': '5px',
                'border': '1px solid #ccc',
                'position': 'absolute',
            });

            $viewer.find('#viewer').css({
                'width': _t.options.viewerWidth,
                'height': _t.options.viewerHeight
            });

            $viewer.appendTo('body');

            return $viewer;
        },

        captureImage: function (offset) {
            var _t = this;

            _t.$viewerImage.css({
                'background-position-x': -offset.left * _t.zoomRate,
                'background-position-y': -offset.top * _t.zoomRate
            });
        },

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

    window.viewer = viewer;
})(window, undefined);