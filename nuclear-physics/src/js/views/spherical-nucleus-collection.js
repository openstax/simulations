define(function(require) {

    'use strict';

    var PIXI = require('pixi');

    var SpriteCollectionView = require('common/v3/pixi/view/sprite-collection');

    var ParticleGraphicsGenerator = require('views/particle-graphics-generator');

    /**
     * A view that renders photon sprites for every photon in the sim
     */
    var SphericalNucleusCollectionView = SpriteCollectionView.extend({

        initialize: function(options) {
            SpriteCollectionView.prototype.initialize.apply(this, arguments);

            this.simulation = options.simulation;

            this.listenTo(this.simulation, 'change:nucleusType', this.nucleusTypeChanged);
            this.nucleusTypeChanged();
        },

        /**
         * Returns texture used for sprites.  Override in child classes.
         */
        getTexture: function() {
            return ParticleGraphicsGenerator.getSphereTexture();
        },

        /**
         * Calculates current scale for sprites.  Override in child classes.
         */
        getSpriteScale: function() {
            var nucleus = this.simulation.createNucleus();
            var targetWidth = this.mvt.modelToViewDeltaX(nucleus.get('diameter'));
            var scale = targetWidth / this.texture.width;
            nucleus.destroy();
            return scale;
        },

        /**
         * Updates the model-view-transform and anything that
         *   relies on it.
         */
        updateMVT: function(mvt) {
            this.mvt = mvt;

            this.update();
        },

        updateSprite: function(sprite, model) {
            SpriteCollectionView.prototype.updateSprite.apply(this, arguments);
            
            if (model.hasDecayed())
                sprite.tint = this.decayedColor;
            else
                sprite.tint = this.activeColor;
        },

        nucleusTypeChanged: function(simulation) {
            var nucleus = this.simulation.createNucleus();
            this.activeColor = ParticleGraphicsGenerator.getColorForElement(nucleus);
            nucleus.decay();
            this.decayedColor = ParticleGraphicsGenerator.getColorForElement(nucleus);
            nucleus.destroy();

            this.spriteScale = this.getSpriteScale();
        }

    });

    return SphericalNucleusCollectionView;
});