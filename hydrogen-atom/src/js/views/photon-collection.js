define(function(require) {

    'use strict';

    var PIXI = require('pixi');

    var SpriteCollectionView = require('common/v3/pixi/view/sprite-collection');
    var WavelengthColors     = require('common/colors/wavelength');
    var Colors               = require('common/colors/colors');

    var Assets = require('assets');

    /**
     * A view that renders photon sprites for every photon in the sim
     */
    var PhotonCollectionView = SpriteCollectionView.extend({

        initialize: function(options) {
            // A map of wavelengths to colors for caching
            this.colors = {};
            
            SpriteCollectionView.prototype.initialize.apply(this, arguments);
        },

        /**
         * Returns texture used for sprites.  Override in child classes.
         */
        getTexture: function() {
            return Assets.Texture(Assets.Images.PHOTON);
        },

        /**
         * Calculates current scale for sprites.  Override in child classes.
         */
        getSpriteScale: function() {
            var targetWidth = this.mvt.modelToViewDeltaX(22);
            var scale = targetWidth / this.texture.width;
            return scale;
        },

        getColorFromWavelength: function(wavelength) {
            var key = '' + wavelength;
            if (this.colors[key] === undefined)
                this.colors[key] = Colors.parseHex(WavelengthColors.nmToHex(wavelength));
            return this.colors[key];
        },

        updateSprite: function(sprite, model) {
            SpriteCollectionView.prototype.updateSprite.apply(this, arguments);
            
            sprite.tint = this.getColorFromWavelength(model.get('wavelength'));
        }

    });

    return PhotonCollectionView;
});