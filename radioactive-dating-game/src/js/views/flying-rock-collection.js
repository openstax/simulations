define(function(require) {

    'use strict';

    var PIXI = require('pixi');

    var SpriteCollectionView = require('common/v3/pixi/view/sprite-collection');

    var Constants = require('constants');
    var Assets = require('assets');

    var textures = undefined;
    var initTextures = function() {
        textures = [
            Assets.Texture(Assets.Images.ROCK_A_0),
            Assets.Texture(Assets.Images.ROCK_B_0),
            Assets.Texture(Assets.Images.ROCK_C_0)
        ];
    };
    var getRandomTexture = function() {
        if (!textures)
            initTextures();

        return _.sample(textures);
    };
    var getFirstTexture = function() {
        if (!textures)
            initTextures();
        
        return textures[0];
    };

    /**
     * A view that renders photon sprites for every photon in the sim
     */
    var FlyingRockCollectionView = SpriteCollectionView.extend({

        /**
         * Returns texture used for sprites.  Override in child classes.
         */
        getTexture: function() {
            return getFirstTexture();
        },

        /**
         * Returns the texture to be used in a specific sprite instance.
         */
        getSpriteTexture: function() {
            return getRandomTexture();
        },

        /**
         * Calculates current scale for sprites.  Override in child classes.
         */
        getSpriteScale: function() {
            var targetWidth = this.mvt.modelToViewDeltaX(Constants.MeasurementSimulation.FLYING_ROCK_WIDTH);
            return targetWidth / this.texture.width;
        },

        updateSprite: function(sprite, model) {
            SpriteCollectionView.prototype.updateSprite.apply(this, arguments);
            
            sprite.rotation = model.get('rotation');
        }

    });

    return FlyingRockCollectionView;
});