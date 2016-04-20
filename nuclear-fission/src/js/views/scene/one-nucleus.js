define(function(require) {

    'use strict';

    var _    = require('underscore');
    var PIXI = require('pixi');

    var AppView            = require('common/v3/app/app');
    var ModelViewTransform = require('common/math/model-view-transform');
    var Vector2            = require('common/math/vector2');

    var Nucleon       = require('models/nucleon');
    var AlphaParticle = require('models/alpha-particle');
    var Electron      = require('models/electron');
    var Antineutrino  = require('models/antineutrino');

    var NucleonView               = require('views/nucleon');
    var AlphaParticleView         = require('views/alpha-particle');
    var ElectronView              = require('views/electron');
    var AntineutrinoView          = require('views/antineutrino');
    var ParticleGraphicsGenerator = require('views/particle-graphics-generator');
    var SingleNucleusDecayChart   = require('views/nucleus-decay-chart/single');
    var ExplodingNucleusView      = require('views/nucleus/exploding');

    var NeutronSourceView = require('nuclear-fission/views/neutron-source');

    var NuclearPhysicsSceneView = require('views/scene');

    /**
     *
     */
    var OneNucleusSceneView = NuclearPhysicsSceneView.extend({

        initialize: function(options) {
            this.showingLabels = true;
            this.particleViews = [];

            NuclearPhysicsSceneView.prototype.initialize.apply(this, arguments);

            // this.listenTo(this.simulation.freeNucleons, 'add',    this.nucleonEmitted);
            // this.listenTo(this.simulation.freeNucleons, 'remove', this.nucleonRemoved);
            this.listenTo(this.simulation.neutronSource, 'neutron-generated', this.neutronGenerated);
            this.listenTo(this.simulation.freeNucleons, 'destroy', this.nucleonDestroyed);
        },

        renderContent: function() {
            var self = this;
            this.$resetButton = $('<button class="btn btn-lg reset-nucleus-btn">Reset Nucleus</button>');
            this.$resetButton.on('click', function() {
                self.resetNucleus();
            });

            this.$ui.append(this.$resetButton);
        },

        reset: function() {
            this.showLabels();
        },

        getTopPadding: function() {
            return 220;
        },

        getRightPadding: function() {
            return 0;
        },

        initMVT: function() {
            this.viewOriginX = this.getLeftPadding() + this.getAvailableWidth() / 2;
            this.viewOriginY = this.getTopPadding() + this.getAvailableHeight() / 2;

            var pixelsPerFemtometer = 6;

            // The center of the screen is actually (5, 5) in the original
            this.mvt = ModelViewTransform.createSinglePointScaleMapping(
                new Vector2(0, 0),
                new Vector2(this.viewOriginX, this.viewOriginY),
                pixelsPerFemtometer
            );
        },

        initGraphics: function() {
            NuclearPhysicsSceneView.prototype.initGraphics.apply(this, arguments);

            this.particlesLayer = new PIXI.Container();
            this.nucleusLayer = new PIXI.Container();

            this.stage.addChild(this.particlesLayer);
            this.stage.addChild(this.nucleusLayer);

            this.initMVT();
            this.initNucleus();
            this.initNeutronSourceView();
        },

        initNucleus: function() {
            // Add a node for each particle that comprises the nucleus.
            var constituents = this.simulation.primaryNucleus.getConstituents();
            for (var i = 0; i < constituents.length; i++) {
                var particleView = this.createParticleView(constituents[i]);
                this.particleViews.push(particleView);
                this.particlesLayer.addChild(particleView.displayObject);
            }

            // Add the exploding nucleus view, which in this case is just the label and explosion animation
            this.nucleusView = new ExplodingNucleusView({
                model: this.simulation.primaryNucleus,
                mvt: this.mvt,
                showNucleus: false,
                showSymbol: this.showingLabels,
                renderer: this.renderer
            });
            this.nucleusLayer.addChild(this.nucleusView.displayObject);
        },

        initNeutronSourceView: function() {
            this.neutronSourceView = new NeutronSourceView({
                model: this.simulation.neutronSource,
                mvt: this.mvt,
                rotationEnabled: false
            });

            this.stage.addChild(this.neutronSourceView.displayObject);
        },

        createParticleView: function(particle) {
            if (particle instanceof Nucleon) {
                // Add a visible representation of the nucleon to the canvas.
                return new NucleonView({
                    model: particle,
                    mvt: this.mvt
                });
            }
            else if (particle instanceof AlphaParticle) {
                // Add a visible representation of the alpha particle to the canvas.
                return new AlphaParticleView({
                    model: particle,
                    mvt: this.mvt
                });
            }
            else {
                // There is some unexpected object in the list of constituents
                //   of the nucleus.  This should never happen and should be
                //   debugged if it does.
                throw 'unexpected particle';
            }
        },

        _update: function(time, deltaTime, paused, timeScale) {
            NuclearPhysicsSceneView.prototype._update.apply(this, arguments);

            this.nucleusView.update(time, deltaTime, paused);
            this.neutronSourceView.update(time, deltaTime, paused);

            for (var i = 0; i < this.particleViews.length; i++)
                this.particleViews[i].update(time, deltaTime, paused);
        },

        resetNucleus: function() {
            this.simulation.reset();
        },

        neutronGenerated: function(neutron) {
            var nucleonView = this.createParticleView(neutron);
            this.particleViews.push(nucleonView);
            this.particlesLayer.addChild(nucleonView.displayObject);
        },

        nucleonDestroyed: function(nucleon) {
            for (var i = 0; i < this.particleViews.length; i++) {
                if (this.particleViews[i].model === nucleon) {
                    this.particleViews[i].remove();
                    this.particleViews.splice(i, 1);
                    return;
                }
            }
        }

    });

    return OneNucleusSceneView;
});
