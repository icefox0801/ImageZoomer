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
            viewerHeight: 300
        };

    viewer.instances = instances;

    viewer.initZoomer = function (elem, options) {
        return new Zoomer(elem, options);
    };

    var Zoomer = function (elem, options) {

        this.$elem = $(elem);

        this.$viewer = null;

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

            _t.$elem.on('mouseover', function (e) {
                var $t = $(this),
                    offset = {},
                    rect = {};

                _t.$target = $t;

                img.src = $t.attr('src'); // #TODO: url获取方法

                _t.$viewer.css({
                    'background-image': 'url(' + img.src + ')'
                });

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
                    console.log('in');
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
                    console.log('in');
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

                console.log(rect);

                _t.layoutZoomer(_t.$target, offset, rect);
                _t.layoutImage(shift);

                console.log('move');
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
                $viewer = $('<div id="viewer"></div>');

            $viewer.css({
                'display': 'none',
                'position': 'fixed',
                'right': '50px',
                'top': '50px',
                'width': _t.options.viewerWidth,
                'height': _t.options.viewerHeight
            });

            $viewer.appendTo('body');

            return $viewer;
        },

        layoutImage: function (offset) {
            var _t = this;

            _t.$viewer.css({
                'background-position-x': -offset.left * _t.zoomRate,
                'background-position-y': -offset.top * _t.zoomRate
            });
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