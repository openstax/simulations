define(function(require) {

    'use strict';

    var Backbone = require('backbone');
    var PIXI     = require('pixi');

    var ArrowView = require('./arrow');

    var Colors    = require('../../colors/colors');
    var Vector2   = require('../../math/vector2');
    var Rectangle = require('../../math/rectangle');


    var ArrowViewModel = new Backbone.Model.extend({
        defaults: {
            originX: 0,
            originY: 0,

            targetX: 50,
            targetY: 0,

            minLength: 25,
            maxLength: null
        }
    });


    var DraggableArrowView = ArrowView.extend({

        initialize: function(options) {
            options = _.extend({
                dragFillColor: undefined,
                dragFillAlpha: undefined
            }, options);

            

            this.initGraphics();
        },

        initGraphics: function() {
            ArrowView.prototype.initGraphics();
            
        },

        drawArrow: function() {
            var graphics = this.graphics();

            if (this.lineWidth)
                graphics.lineStyle(this.lineWidth, this.lineColor, this.lineAlpha);


        }

    }, {

        ArrowViewModel: ArrowViewModel

    });

    return DraggableArrowView;
});
