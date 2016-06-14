define(function(require) {

    'use strict';

    var _ = require('underscore');
    
    var PixiView = require('common/v3/pixi/view');
    var Vector2  = require('common/math/vector2');

    var LightRayView = require('views/light-ray');

    /**
     * A view that represents an element model
     */
    var LightRaySourceView = PixiView.extend({

        /**
         *
         */
        initialize: function(options) {
            options = _.extend({
                center: new Vector2(), // Origin of rays in pixels
                innerRadius: 0,        // Distance from center to start the rays
                outerRadius: 200,      // Furthest reach of the rays (making them technically segments)
                numRays: 20,           // The number of rays if none were clipped
                clippingWedgeAngle: 0, // Angle of area that won't emit rays
                color: '#fff'          // Ray color
            }, options);

            this.center = options.center;
            this.innerRadius = options.innerRadius;
            this.outerRadius = options.outerRadius;
            this.numRays = options.numRays;
            this.color = options.color;
            this.clippingWedgeAngle = options.clippingWedgeAngle;

            this.lightRayViews = [];

            this.initRays();
        },

        initRays: function() {
            if (!(this.numRays > 0 && this.outerRadius > this.innerRadius && this.clippingWedgeAngle < Math.PI * 2))
                throw 'Bad parameters for LightRaySourceView';

            for (var i = 0; i < this.numRays; i++) {
                var vec = new Vector2();
                var angle = i * (Math.PI * 2 / this.numRays);
                if (angle <= Math.PI / 2 - this.clippingWedgeAngle / 2 || angle >= Math.PI / 2 + this.clippingWedgeAngle / 2) {
                    // Ray is not inside the clipping wedge, so create and add it.
                    var rayStart = this.center.clone().add(vec.set(this.innerRadius, 0).rotate(angle));
                    var rayEnd   = this.center.clone().add(vec.set(this.outerRadius, 0).rotate(angle));

                    var lightRayView = new LightRayView({
                        start: rayStart,
                        end:   rayEnd,
                        color: this.color
                    });

                    this.lightRayViews.push(lightRayView);
                    this.displayObject.addChild(lightRayView.displayObject);
                }
            }
        },

        addLightAbsorbingShape: function(shape) {
            _.each(this.lightRayViews, function(lightRayView) {
                lightRayView.addLightAbsorbingShape(shape);
            });
        },

        removeLightAbsorbingShape: function(shape) {
            _.each(this.lightRayViews, function(lightRayView) {
                lightRayView.removeLightAbsorbingShape(shape);
            });
        },

        update: function() {
            for (var i = 0; i < this.lightRayViews.length; i++) {
                var lightRayView = this.lightRayViews[i];

                lightRayView.updateLineSegments();
            }
        }

    });

    return LightRaySourceView;
});