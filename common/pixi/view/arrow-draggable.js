define(function(require) {

    'use strict';

    var Backbone = require('backbone');
    var PIXI     = require('pixi');
    var PixiView = require('../view');

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


    var ArrowView = PixiView.extend({

        initialize: function(options) {
            options = _.extend({
                tailWidth: 10,

                headWidth: 20,
                headLength: 20,

                fillColor: '#ff0000',
                fillAlpha: 1,

                lineColor: '#000',
                lineWidth: 0,
                lineAlpha: 1,

                dragFillColor: undefined,
                dragFillAlpha: undefined,

                dragLineColor: undefined,
                dragLineWidth: undefined,
                dragLineAlpha: undefined
            }, options);

            this.origin = options.origin;
            this.bounds = options.bounds;
            this.gridSize = options.gridSize;
            this.gridOffsetX = options.gridOffsetX;
            this.gridOffsetY = options.gridOffsetY;
            this.smallGridSize = options.smallGridSize;
            this.smallGridEnabled = options.smallGridEnabled;

            this.lineColor = Colors.parseHex(options.lineColor);
            this.lineWidth = options.lineWidth;
            this.lineAlpha = options.lineAlpha;

            this.initGraphics();
        },

        initGraphics: function() {
            this.smallGrid = new PIXI.Graphics();
            this.largeGrid = new PIXI.Graphics();

            this.displayObject.addChild(this.smallGrid);
            this.displayObject.addChild(this.largeGrid);

            this.drawGrids();
        },

        drawArrow: function() {
            var graphics = this.graphics();

            if (this.lineWidth)
                graphics.lineStyle(this.lineWidth, this.lineColor, this.lineAlpha);


        }

    }, {

        ArrowViewModel: ArrowViewModel

    });

    return ArrowView;
});
