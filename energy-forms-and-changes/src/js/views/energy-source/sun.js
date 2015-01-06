define(function(require) {

    'use strict';

    var _ = require('underscore');
    var PIXI = require('pixi');

    var EnergySourceView = require('views/energy-source');

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
            
            this.initOrb(sunRadius);
            this.initRays(sunRadius);
        },

        initOrb: function(sunRadius) {
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
            var offset = this.mvt.modelToViewDelta(Constants.Sun.OFFSET_TO_CENTER_OF_SUN);
            sunSprite.x = offset.x;
            sunSprite.y = offset.y;

            // Add it
            this.displayObject.addChild(sunSprite);
        },

        initRays: function(sunRadius) {

        },

        initClouds: function() {

        },

        initControls: function() {

        }

    }, Constants.SunView);

    return SunView;
});