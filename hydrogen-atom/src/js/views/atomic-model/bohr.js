define(function(require) {

    'use strict';

    var PIXI = require('pixi');

    require('common/v3/pixi/dash-circle');

    var ParticleGraphicsGenerator = require('views/particle-graphics-generator');

    var BohrModel       = require('hydrogen-atom/models/atomic-model/bohr');
    var AtomicModelView = require('hydrogen-atom/views/atomic-model');

    var Constants = require('constants');
    
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

            this.orbitalGraphics = new PIXI.Graphics();

            this.displayObject.addChild(this.orbitalGraphics);
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

        drawOrbitals: function() {
            var graphics = this.orbitalGraphics;
            graphics.clear();
            graphics.lineStyle(1, 0xFFFFFF, 1);

            var dashStyle = [2, 2];
            var viewPosition = this.getViewPosition();
            var x = viewPosition.x;
            var y = viewPosition.y;
            var groundState = BohrModel.getGroundState();
            var numberOfStates = BohrModel.getNumberOfStates();
            for (var state = groundState; state < (groundState + numberOfStates); state++) {
                var radius = this.mvt.modelToViewDeltaX(BohrModel.getOrbitRadius(state));
                graphics.dashCircle(x, y, radius, dashStyle);
            }
        },

        /**
         * Updates the model-view-transform and anything that relies on it.
         */
        updateMVT: function(mvt) {
            AtomicModelView.prototype.updateMVT.apply(this, arguments);

            this.initSubatomicParticles();
            this.drawOrbitals();
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


    return BohrModelView;
});