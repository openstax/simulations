define(function(require) {

    'use strict';

    var _    = require('underscore');
    var PIXI = require('pixi');
    
    var PixiView = require('common/pixi/view');
    var Vector2  = require('common/math/vector2');

    var Constants = require('constants');

    /**
     * A view that represents an element model
     */
    var LightRayView = PixiView.extend({

        /**
         *
         */
        initialize: function(options) {
            options = _.extend({
                start: new Vector2(), // Start of the light ray
                end:   new Vector2(), // End of the light ray
                color: '#fff'         // Ray color
            }, options);

            this.start = options.start;
            this.end = options.end;
            this.color = options.color;

            this.lightAbsorbingShapes = [];

            this.graphics = new PIXI.Graphics();
            this.displayObject.addChild(this.graphics);

            this.updateLineSegments();
        },

        addLightAbsorbingShape: function(lightAbsorbingShape) {
            this.lightAbsorbingShapes.push(lightAbsorbingShape);
            this.listenTo(lightAbsorbingShape, 'change:lightAbsorptionCoefficient', this.updateLineSegments);
        },

        removeLightAbsorbingShape: function(lightAbsorbingShape) {
            this.stopListening(lightAbsorbingShape);
            this.lightAbsorbingShapes = _.without(this.lightAbsorbingShapes, lightAbsorbingShape);
            this.updateLineSegments();
        },

        updateLineSegments: function() {
            this.graphics.clear();

            var points = [];

            // Add the initial start and end points
            points.push({ point: this.start, fade: LightRayView.FADE_COEFFICIENT_IN_AIR });
            points.push({ point: this.end,   fade: 0 });

            // Add the entry and exit points for each shape
            var lightAbsorbingShape;
            for (var i = 0; i < this.lightAbsorbingShapes.length; i++) {
                lightAbsorbingShape = this.lightAbsorbingShapes[i];
                //if ()
            }
        },

    }, Constants.LightRayView);

    return LightRayView;
});