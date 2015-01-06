define(function(require) {

    'use strict';

    var _ = require('underscore');
    var PIXI = require('pixi');

    var EnergySourceView   = require('views/energy-source');
    var LightRaySourceView = require('views/light-ray-source');

    var Constants = require('constants');

    var SunView = EnergySourceView.extend({

        /**
         *
         */
        initialize: function(options) {
            options = _.extend({
                
            }, options);

            EnergySourceView.prototype.initialize.apply(this, [options]);
        },

        initGraphics: function() {
            EnergySourceView.prototype.initGraphics.apply(this);

            var sunRadius = this.mvt.modelToViewDeltaX(Constants.Sun.RADIUS);
            var sunCenter = this.mvt.modelToViewDelta(Constants.Sun.OFFSET_TO_CENTER_OF_SUN);
            
            this.initOrb(sunRadius, sunCenter);
            this.initRays(sunRadius, sunCenter);
        },

        initOrb: function(sunRadius, sunCenter) {
            // Create a texture
            var sunTexture = PIXI.Texture.generateCircleTexture(
                sunRadius, 
                0, 
                sunRadius * SunView.GRADIENT_END, 
                SunView.INNER_FILL_COLOR, 
                SunView.OUTER_FILL_COLOR,
                SunView.LINE_WIDTH,
                SunView.LINE_COLOR
            );

            // Create a sprite
            var sunSprite = new PIXI.Sprite(sunTexture);
            sunSprite.anchor.x = sunSprite.anchor.y = 0.5;

            // Move the sprite
            sunSprite.x = sunCenter.x;
            sunSprite.y = sunCenter.y;

            // Add it
            this.displayObject.addChild(sunSprite);
        },

        initRays: function(sunRadius, sunCenter) {
            // Create a ray source
            var raySource = new LightRaySourceView({
                center:      sunCenter, 
                innerRadius: sunRadius, 
                outerRadius: 1000,      
                numRays:     40,            
                color:       SunView.RAY_COLOR
            });

            // Save it
            this.lightRays = raySource.displayObject;

            // Add it
            this.displayObject.addChild(this.lightRays);
        },

        initClouds: function() {

        },

        initControls: function() {

        }

    }, Constants.SunView);

    return SunView;
});