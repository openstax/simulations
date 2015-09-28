define(function(require) {

    'use strict';

    var _    = require('underscore');
    var PIXI = require('pixi');
    
    var PixiView = require('common/pixi/view');
    var Colors   = require('common/colors/colors');

    var Constants = require('constants');

    /**
     * A view that represents an atom
     */
    var WirePatchView = PixiView.extend({

        /**
         * Overrides PixiView's initializeDisplayObject function
         */
        initializeDisplayObject: function() {
            this.displayObject = new PIXI.Graphics();
        },

        /**
         * Initializes the new WirePatchView.
         */
        initialize: function(options) {
            this.outerColor = Colors.parseHex(WirePatchView.OUTER_COLOR);
            this.innerColor = Colors.parseHex(WirePatchView.INNER_COLOR);

            this.updateMVT(options.mvt);
        },

        /**
         * Draws the wire patch
         */
        draw: function() {
            var graphics = this.displayObject;
            graphics.clear();

            // Do a pass for the outer color and inner color
            this.drawSegments(WirePatchView.OUTER_WIDTH, this.outerColor);
            this.drawSegments(WirePatchView.INNER_WIDTH, this.innerColor);
        },

        /**
         * Draws the wire segments at a certain wire width and color
         */
        drawSegments: function(width, color) {
            var graphics = this.displayObject;
            
            var segments = this.model.segments;
            var viewPoint;

            // Draw the base lines
            graphics.lineStyle(width, color, 1)
            for (var i = 0; i < segments.length; i++) {
                viewPoint = this.mvt.modelToView(segments[i].getStart());
                graphics.moveTo(viewPoint.x, viewPoint.y);
                viewPoint = this.mvt.modelToView(segments[i].getFinish());
                graphics.lineTo(viewPoint.x, viewPoint.y);
            }

            // Then round the edges by drawing circles over the connection points
            graphics.lineStyle(0, 0, 0);
            graphics.beginFill(color, 1);
            var radius = width / 2;
            for (var i = 0; i < segments.length; i++) {
                if (i === 0) {
                    viewPoint = this.mvt.modelToView(segments[i].getStart());
                    graphics.drawCircle(viewPoint.x, viewPoint.y, radius);
                }
                
                viewPoint = this.mvt.modelToView(segments[i].getFinish());
                graphics.drawCircle(viewPoint.x, viewPoint.y, radius);
            }
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

    }, Constants.WirePatchView);

    return WirePatchView;
});