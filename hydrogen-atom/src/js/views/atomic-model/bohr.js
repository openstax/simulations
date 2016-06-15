define(function(require) {

    'use strict';

    require('common/v3/pixi/dash-circle');

    var ParticleGraphicsGenerator = require('views/particle-graphics-generator');

    var AtomicModelView = require('hydrogen-atom/views/atomic-model');
    
    /**
     * Represents the scene for the BohrModel
     */
    var BohrModelView = AtomicModelView.extend({

        /**
         * Initializes the new BohrModelView.
         */
        initialize: function(options) {
            AtomicModelView.prototype.initialize.apply(this, arguments);
        },

        /**
         * Initializes everything for rendering graphics
         */
        initGraphics: function() {
            AtomicModelView.prototype.initGraphics.apply(this, arguments);

            this.initOrbitalGraphics();
        },

        initSubatomicParticles: function() {
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

        /**
         * Updates the model-view-transform and anything that relies on it.
         */
        updateMVT: function(mvt) {
            AtomicModelView.prototype.updateMVT.apply(this, arguments);

            this.initSubatomicParticles();

            var viewPosition = this.getViewPosition();
            this.orbitalGraphics.x = viewPosition.x;
            this.orbitalGraphics.y = viewPosition.y;
            this.drawOrbitals(this.orbitalGraphics);
        },

        update: function(time, deltaTime, paused) {
            AtomicModelView.prototype.update.apply(this, arguments);

            if (this.electronSprite) {
                var viewOffset = this.mvt.modelToView(this.getAtom().electronPosition);
                this.electronSprite.x = viewOffset.x;
                this.electronSprite.y = viewOffset.y;
            }
        }

    });


    return BohrModelView;
});