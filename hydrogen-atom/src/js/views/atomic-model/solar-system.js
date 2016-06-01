define(function(require) {

    'use strict';

    var PIXI = require('pixi');

    var ParticleGraphicsGenerator = require('views/particle-graphics-generator');
    var AtomicModelView = require('hydrogen-atom/views/atomic-model');

    var Constants = require('constants');
    
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
        },

        update: function(time, deltaTime, paused) {
            AtomicModelView.prototype.update.apply(this, arguments);

            if (this.electronSprite) {
                var viewOffset = this.mvt.modelToView(this.atom.electronPosition);
                this.electronSprite.x = viewOffset.x;
                this.electronSprite.y = viewOffset.y;
            }
        }

    });


    return SolarSystemModelView;
});