define(function(require) {

    'use strict';

    var _    = require('underscore');
    var PIXI = require('pixi');

    var AppView            = require('common/v3/app/app');
    var ModelViewTransform = require('common/math/model-view-transform');
    var Vector2            = require('common/math/vector2');

    var ParticleGraphicsGenerator = require('views/particle-graphics-generator');
    var SingleNucleusDecayChart   = require('views/nucleus-decay-chart/single');
    var ExplodingNucleusView      = require('views/nucleus/exploding');

    var NuclearPhysicsSceneView = require('views/scene');

    /**
     *
     */
    var SingleNucleusSceneView = NuclearPhysicsSceneView.extend({

        initialize: function(options) {
            NuclearPhysicsSceneView.prototype.initialize.apply(this, arguments);

            this.listenTo(this.simulation.emittedParticles, 'add', this.particleEmitted);
        },

        renderContent: function() {
            var self = this;
            this.$resetButton = $('<button class="btn btn-lg reset-nucleus-btn">Reset Nucleus</button>');
            this.$resetButton.on('click', function() {
                self.resetNucleus();
            });

            this.$ui.append(this.$resetButton);
        },

        initMVT: function() {
            this.viewOriginX = this.getLeftPadding() + this.getAvailableWidth() / 2;
            this.viewOriginY = this.getTopPadding() + this.getAvailableHeight() / 2;

            var pixelsPerFemtometer = 25;

            // The center of the screen is actually (5, 5) in the original
            this.mvt = ModelViewTransform.createSinglePointScaleMapping(
                new Vector2(0, 0),
                new Vector2(this.viewOriginX, this.viewOriginY),
                pixelsPerFemtometer
            );
        },

        initGraphics: function() {
            NuclearPhysicsSceneView.prototype.initGraphics.apply(this, arguments);

            this.initMVT();
            this.initNucleus();
        },

        initNucleus: function() {
            this.nucleusView = new ExplodingNucleusView({
                model: this.simulation.atomicNucleus,
                mvt: this.mvt
            });

            this.stage.addChild(this.nucleusView.displayObject);
        },

        _update: function(time, deltaTime, paused, timeScale) {
            NuclearPhysicsSceneView.prototype._update.apply(this, arguments);

            this.nucleusView.update(time, deltaTime, paused);
        },

        resetNucleus: function() {
            this.simulation.resetNucleus();
        },

        particleEmitted: function(particle) {

        }

    });

    return SingleNucleusSceneView;
});
