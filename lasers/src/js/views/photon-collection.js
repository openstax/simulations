define(function(require) {

    'use strict';

    var SpriteCollectionView = require('common/v3/pixi/view/sprite-collection');
    var WavelengthColors     = require('common/colors/wavelength');
    var Colors               = require('common/colors/colors');

    var PEffectSimulation = require('models/simulation');

    var Assets = require('assets');

    /**
     * A view that renders photon sprites for every photon in the sim
     */
    var PhotonCollectionView = SpriteCollectionView.extend({

        initialize: function(options) {
            // A map of wavelengths to colors for caching
            this.colors = {};
            this.cometTexture = Assets.Texture(Assets.Images.PHOTON_COMET);
            
            SpriteCollectionView.prototype.initialize.apply(this, arguments);

            this.simulation = options.simulation;

            this.listenTo(this.simulation, 'change:viewMode', this.viewModeChanged);
        },

        /**
         * Returns texture used for sprites.  Override in child classes.
         */
        getTexture: function() {
            return Assets.Texture(Assets.Images.PHOTON);
        },

        /**
         * Returns the texture to be used in a specific sprite instance.  Can
         *   be overrided in child classes to add things like random textures.
         */
        getSpriteTexture: function() {
            if (PhotonCollectionView.displayAsComets)
                return this.cometTexture;
            else
                return this.texture;
        },

        /**
         * Calculates current scale for sprites.  Override in child classes.
         */
        getSpriteScale: function() {
            var targetHeight = this.mvt.modelToViewDeltaX(PhotonCollectionView.modelSize);
            var scale = targetHeight / this.texture.height;
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
            sprite.visible = model.get('visible');
            sprite.texture = this.getSpriteTexture();
            sprite.rotation = model.get('velocity').angle();
        },

        viewModeChanged: function(simulation, viewMode) {
            if (viewMode === PEffectSimulation.PHOTON_VIEW)
                this.show();
            else
                this.hide();
        }

    }, {

        modelSize: 22,
        displayAsComets: false

    });

    return PhotonCollectionView;
});