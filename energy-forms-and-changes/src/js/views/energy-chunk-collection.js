define(function(require) {

    'use strict';

    var PIXI = require('pixi');

    var SpriteCollectionView = require('common/pixi/view/sprite-collection');

    var EnergyChunk = require('models/energy-chunk');
    
    var Assets = require('assets');

    var Textures;
    var initTextures = function() {
        if (!Textures) {
            Textures = {};
            Textures[EnergyChunk.THERMAL]    = Assets.Texture(Assets.Images.E_THERM_BLANK_ORANGE);
            Textures[EnergyChunk.ELECTRICAL] = Assets.Texture(Assets.Images.E_ELECTRIC_BLANK);
            Textures[EnergyChunk.MECHANICAL] = Assets.Texture(Assets.Images.E_MECH_BLANK);
            Textures[EnergyChunk.LIGHT]      = Assets.Texture(Assets.Images.E_LIGHT_BLANK);
            Textures[EnergyChunk.CHEMICAL]   = Assets.Texture(Assets.Images.E_CHEM_BLANK_LIGHT);
            Textures[EnergyChunk.HIDDEN]     = Assets.Texture(Assets.Images.E_DASHED_BLANK);
        }    
    };

    var Constants = require('constants');

    var WIDTH                        = Constants.EnergyChunkCollectionView.WIDTH;
    var Z_DISTANCE_WHERE_FULLY_FADED = Constants.EnergyChunkCollectionView.Z_DISTANCE_WHERE_FULLY_FADED;
    

    /**
     * A view that renders photon sprites for every photon in the sim
     */
    var EnergyChunkCollectionView = SpriteCollectionView.extend({

        initialize: function(options) {
            SpriteCollectionView.prototype.initialize.apply(this, arguments);
        },

        /**
         * Returns texture used for sprites.  Override in child classes.
         */
        getTexture: function() {
            initTextures();
            return Textures[EnergyChunk.THERMAL];
        },

        /**
         * Calculates current scale for sprites.  Override in child classes.
         */
        getSpriteScale: function() {
            return this.mvt.modelToViewDeltaX(WIDTH) / this.texture.width;
        },

        updateSprite: function(sprite, model) {
            SpriteCollectionView.prototype.updateSprite.apply(this, arguments);
            
            sprite.visible = model.get('visible');
            sprite.alpha = (model.get('zPosition') < 0) ?
                Math.max((Z_DISTANCE_WHERE_FULLY_FADED + model.get('zPosition')) / Z_DISTANCE_WHERE_FULLY_FADED, 0) :
                1;
            sprite.setTexture(Textures[model.get('energyType')]);
        }

    }, Constants.EnergyChunkCollectionView);


    return EnergyChunkCollectionView;
});