define(function(require) {

    'use strict';

    var Backbone = require('backbone');
    var PIXI     = require('pixi');

    var ArrowView = require('./arrow');

    var Colors  = require('../../colors/colors');
    var Vector2 = require('../../math/vector2');

    var DraggableArrowView = ArrowView.extend({

        events: {
            'touchstart      .tailGraphics': 'dragStart',
            'mousedown       .tailGraphics': 'dragStart',
            'touchmove       .tailGraphics': 'drag',
            'mousemove       .tailGraphics': 'drag',
            'touchend        .tailGraphics': 'dragEnd',
            'mouseup         .tailGraphics': 'dragEnd',
            'touchendoutside .tailGraphics': 'dragEnd',
            'mouseupoutside  .tailGraphics': 'dragEnd',

            'touchstart      .headGraphics': 'dragHeadStart',
            'mousedown       .headGraphics': 'dragHeadStart',
            'touchmove       .headGraphics': 'dragHead',
            'mousemove       .headGraphics': 'dragHead',
            'touchend        .headGraphics': 'dragHeadEnd',
            'mouseup         .headGraphics': 'dragHeadEnd',
            'touchendoutside .headGraphics': 'dragHeadEnd',
            'mouseupoutside  .headGraphics': 'dragHeadEnd'
        },

        initialize: function(options) {
            options = _.extend({
                dragFillColor: undefined,
                dragFillAlpha: undefined,

                bodyDraggingEnabled: true,
                headDraggingEnabled: true
            }, options);

            ArrowView.prototype.initialize.apply(this, [options]);

            this.bodyDraggingEnabled = options.bodyDraggingEnabled;
            this.headDraggingEnabled = options.headDraggingEnabled;

            this.dragFillColor = options.dragFillColor !== undefined ? Colors.parseHex(options.dragFillColor) : this.fillColor;
            this.dragFillAlpha = options.dragFillAlpha !== undefined ? options.dragFillAlpha : this.fillAlpha;
        },

        initGraphics: function() {
            ArrowView.prototype.initGraphics();
            
        },

    });

    return DraggableArrowView;
});
