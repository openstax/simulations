define(function(require) {

    'use strict';

    var _    = require('underscore');
    var PIXI = require('pixi');
    
    var PixiView = require('common/v3/pixi/view');
    var Colors   = require('common/colors/colors');

    var Constants = require('constants');

    /**
     * A view that represents an atom
     */
    var WireView = PixiView.extend({

        /**
         * Overrides PixiView's initializeDisplayObject function
         */
        initializeDisplayObject: function() {
            this.displayObject = new PIXI.Graphics();
        },

        /**
         * Initializes the new WireView.
         */
        initialize: function(options) {
            this.outerColor = Colors.parseHex(WireView.OUTER_COLOR);
            this.innerColor = Colors.parseHex(WireView.INNER_COLOR);

            this.updateMVT(options.mvt);
        },

        /**
         * Draws the wire patch
         */
        draw: function() {
            var graphics = this.displayObject;
            graphics.clear();

            // Do a pass for the outer color and inner color
            this.drawWire(WireView.OUTER_WIDTH, this.outerColor);
            this.drawWire(WireView.INNER_WIDTH, this.innerColor);
        },

        /**
         * Draws the wire segments at a certain wire width and color
         */
        drawWire: function(width, color) {
            var graphics = this.displayObject;
            
            var point;
            point = this.mvt.modelToView(this.model.get('startJunction').get('position'));
            var x0 = point.x;
            var y0 = point.y;
            point = this.mvt.modelToView(this.model.get('endJunction').get('position'));
            var x1 = point.x;
            var y1 = point.y;

            // Draw the base lines
            graphics.lineStyle(width, color, 1);
            graphics.moveTo(x0, y0);
            graphics.lineTo(x1, y1);

            // Then round the edges by drawing circles over the connection points
            var radius = width / 2;
            graphics.lineStyle(0, 0, 0);
            graphics.beginFill(color, 1);
            graphics.drawCircle(x0, y0, radius);
            graphics.drawCircle(x1, y1, radius);
            graphics.endFill();
        },

        /**
         * Updates the model-view-transform and anything that
         *   relies on it.
         */
        updateMVT: function(mvt) {
            this.mvt = mvt;

            this.draw();
        }

    }, Constants.WireView);

    return WireView;
});