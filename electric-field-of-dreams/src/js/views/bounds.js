define(function(require) {

    'use strict';

    var PIXI = require('pixi');
    
    var PixiView = require('common/pixi/view');
    var Colors   = require('common/colors/colors');

    var Constants = require('constants');

    var BoundsView = PixiView.extend({

        /**
         * Overrides PixiView's initializeDisplayObject function
         */
        initializeDisplayObject: function() {
            this.displayObject = new PIXI.Graphics();
        },

        initialize: function(options) {
            this.mvt = options.mvt;
            this.simulation = options.simulation;

            this.lineWidth = BoundsView.LINE_WIDTH;
            this.lineColor = Colors.parseHex(BoundsView.LINE_COLOR);
            this.lineAlpha = BoundsView.LINE_ALPHA;

            this.updateMVT(this.mvt);
        },

        draw: function() {
            var m = Constants.ParticleView.MODEL_RADIUS;
            var x = Math.round(this.mvt.modelToViewX(this.simulation.minX - m));
            var y = Math.round(this.mvt.modelToViewY(this.simulation.minY - m));
            var w = Math.round(this.mvt.modelToViewDeltaX(this.simulation.width + m * 2));
            var h = Math.round(this.mvt.modelToViewDeltaY(this.simulation.height + m * 2));

            var graphics = this.displayObject;

            graphics.clear();
            graphics.lineStyle(this.lineWidth, this.lineColor, this.lineAlpha);
            graphics.drawRect(x, y, w, h);
        },

        updateMVT: function(mvt) {
            this.mvt = mvt;

            this.draw();
        }

    }, Constants.BoundsView);

    return BoundsView;
});