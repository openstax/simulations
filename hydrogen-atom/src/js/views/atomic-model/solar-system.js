define(function(require) {

    'use strict';

    var PIXI = require('pixi');

    var ParticleGraphicsGenerator = require('views/particle-graphics-generator');
    var AtomicModelView = require('hydrogen-atom/views/atomic-model');

    var Constants = require('constants');
    var Assets = require('assets');
    
    /**
     * Represents the scene for the SolarSystemModel
     */
    var SolarSystemModelView = AtomicModelView.extend({

        /**
         * Initializes the new SolarSystemModelView.
         */
        initialize: function(options) {
            AtomicModelView.prototype.initialize.apply(this, arguments);
        },

        /**
         * Initializes everything for rendering graphics
         */
        initGraphics: function() {
            AtomicModelView.prototype.initGraphics.apply(this, arguments);

            this.kaboom = Assets.createSprite(Assets.Images.KABOOM);
            this.kaboom.anchor.x = 0.5;
            this.kaboom.anchor.y = 0.5;
            this.kaboom.visible = false;

            this.displayObject.addChild(this.kaboom);
        },

        /**
         * Updates the model-view-transform and anything that relies on it.
         */
        updateMVT: function(mvt) {
            AtomicModelView.prototype.updateMVT.apply(this, arguments);

            if (this.electronSprite) {
                this.displayObject.removeChild(this.electronSprite);
                this.displayObject.removeChild(this.protonSprite);
            }

            this.electronSprite = ParticleGraphicsGenerator.generateElectron(this.particleMVT);
            this.protonSprite = ParticleGraphicsGenerator.generateProton(this.particleMVT);

            var atomPosition = this.getViewPosition();
            this.protonSprite.x = atomPosition.x;
            this.protonSprite.y = atomPosition.y;
            
            this.displayObject.addChild(this.electronSprite);
            this.displayObject.addChild(this.protonSprite);

            this.kaboom.x = atomPosition.x;
            this.kaboom.y = atomPosition.y;
            var targetWidth = mvt.modelToViewDeltaX(240);
            var scale = targetWidth / this.kaboom.texture.width;
            this.kaboom.scale.x = scale;
            this.kaboom.scale.y = scale;
        },

        update: function(time, deltaTime, paused) {
            AtomicModelView.prototype.update.apply(this, arguments);

            if (this.electronSprite) {
                var viewOffset = this.mvt.modelToView(this.atom.electronPosition);
                this.electronSprite.x = viewOffset.x;
                this.electronSprite.y = viewOffset.y;

                if (this.atom.isDestroyed()) {
                    this.protonSprite.visible = false;
                    this.electronSprite.visible = false;
                    this.kaboom.visible = true;
                }
                else {
                    this.protonSprite.visible = true;
                    this.electronSprite.visible = true;
                    this.kaboom.visible = false;
                }
            }
        }

    });


    return SolarSystemModelView;
});