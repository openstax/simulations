define(function(require) {

    'use strict';

    var PIXI = require('pixi');

    var PixiView = require('common/v3/pixi/view');
    var Vector2  = require('common/math/vector2');
    var Colors   = require('common/colors/colors');

    var Constants = require('constants');
    var MAX_RAYS         = Constants.LightRaysView.MAX_RAYS;
    var MIN_RAYS         = Constants.LightRaysView.MIN_RAYS;
    var MAX_RAY_LENGTH   = Constants.LightRaysView.MAX_RAY_LENGTH;
    var MIN_RAY_LENGTH   = Constants.LightRaysView.MIN_RAY_LENGTH;
    var RAYS_START_ANGLE = Constants.LightRaysView.RAYS_START_ANGLE;
    var RAYS_ARC_ANGLE   = Constants.LightRaysView.RAYS_ARC_ANGLE;
    var RAY_COLOR        = Colors.parseHex(Constants.LightRaysView.RAY_COLOR);
    var RAY_BIG_WIDTH    = Constants.LightRaysView.RAY_BIG_WIDTH;
    var RAY_MEDIUM_WIDTH = Constants.LightRaysView.RAY_MEDIUM_WIDTH;
    var RAY_SMALL_WIDTH  = Constants.LightRaysView.RAY_SMALL_WIDTH;

    /**
     * 
     */
    var LightRaysView = PixiView.extend({

        /**
         * Initializes the new LightRaysView.
         */
        initialize: function(options) {
            this.mvt = options.mvt;
            this.bulbRadius = options.bulbRadius;

            // Cached objects
            this._vec1 = new Vector2();
            this._vec2 = new Vector2();

            this.initGraphics();
        },

        /**
         * Initializes everything for rendering graphics
         */
        initGraphics: function() {
            this.graphics = new PIXI.Graphics();

            this.displayObject.addChild(this.graphics);

            this.updateMVT(this.mvt);
        },

        /**
         * Updates the model-view-transform and anything that
         *   relies on it.
         */
        updateMVT: function(mvt) {
            this.mvt = mvt;
        },

        /**
         * Sets the intensity.
         * This generates the stroke and lines needed to represent the intensity.
         * The algorithm was adapted from
         * edu.colorado.phet.cck3.circuit.components.LightBulbGraphic.setIntensity
         */
        setIntensity: function(intensity) {
            // If intensity is zero, we're done.
            if (this.intensity === intensity)
                return;
            else if (intensity === 0) {
                this.graphics.clear();
                return;
            }

            this.intensity = intensity;

            // Number of rays is a function of intensity.
            var numberOfRays = MIN_RAYS + Math.floor(intensity * (MAX_RAYS - MIN_RAYS));

            // Ray length is a function of intensity.
            var rayLength = MIN_RAY_LENGTH + (intensity * (MAX_RAY_LENGTH - MIN_RAY_LENGTH));

            // Pick one of 3 pre-allocated ray widths.
            var rayWidth = RAY_SMALL_WIDTH;
            if (rayLength > (MAX_RAY_LENGTH * 0.6))
                rayWidth = RAY_BIG_WIDTH;
            else if (rayLength > (MAX_RAY_LENGTH * 0.3))
                rayWidth = RAY_MEDIUM_WIDTH;

            // Rays fill part of a circle, incrementing clockwise.
            var angle = RAYS_START_ANGLE;
            var deltaAngle = RAYS_ARC_ANGLE / (numberOfRays - 1);

            // Create the rays.
            var vec1 = this._vec1;
            var vec2 = this._vec2;
            rayLength = this.mvt.modelToViewDeltaX(rayLength);
            var bulbRadius = this.mvt.modelToViewDeltaX(this.bulbRadius);
            var graphics = this.graphics;
            graphics.clear();
            graphics.lineStyle(rayWidth, RAY_COLOR, 1);

            for (var i = 0; i < numberOfRays; i++) {
                // Determine the end points of the ray.
                vec1.set(bulbRadius, 0).rotate(angle);
                vec2.set(bulbRadius + rayLength).rotate(angle);

                // Draw the ray
                graphics.moveTo(vec1.x, vec1.y);
                graphics.lineTo(vec2.x, vec2.y);

                // Increment the angle.
                angle += deltaAngle;
            }
        }

    }, Constants.LightRaysView);


    return LightRaysView;
});