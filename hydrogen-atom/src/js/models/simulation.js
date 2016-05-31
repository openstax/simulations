define(function (require, exports, module) {

    'use strict';

    var _ = require('underscore');

    var FixedIntervalSimulation = require('common/simulation/fixed-interval-simulation');
    var Vector2                 = require('common/math/vector2');
    var Rectangle               = require('common/math/rectangle');
    var VanillaCollection       = require('common/collections/vanilla');

    var Gun             = require('hydrogen-atom/models/gun');
    var AtomicModels    = require('hydrogen-atom/models/atomic-models');
    var ExperimentModel = require('hydrogen-atom/models/atomic-model/experiment');

    var DEG_TO_RAD = Math.PI / 180;

    /**
     * Constants
     */
    var Constants = require('constants');

    /**
     * Wraps the update function in 
     */
    var HydrogenAtomSimulation = FixedIntervalSimulation.extend({

        defaults: _.extend(FixedIntervalSimulation.prototype.defaults, {
            atomicModel: AtomicModels.BILLIARD_BALL,
            experimentSelected: true
        }),
        
        initialize: function(attributes, options) {
            options = _.extend({
                framesPerSecond: Constants.FRAME_RATE,
                deltaTimePerFrame: Constants.DEFAULT_DELTA_TIME_PER_FRAME
            }, options);
            
            FixedIntervalSimulation.prototype.initialize.apply(this, [attributes, options]);

            this.on('change:atomicModel', this.atomicModelChanged);
        },

        /**
         * Initializes the models used in the simulation
         */
        initComponents: function() {
            // Create the gun
            var position = new Vector2(0, 0);
            var orientation = -90 * DEG_TO_RAD; // degrees, pointing straight up
            var nozzleWidth = Constants.ANIMATION_BOX_SIZE.width;

            this.gun = new Gun({
                position: position, 
                orientation: orientation, 
                nozzleWidth: nozzleWidth, 
                minWavelength: Constants.MIN_WAVELENGTH, 
                maxWavelength: Constants.MAX_WAVELENGTH
            });

            this.listenTo(this.gun, 'photon-fired', this.photonFired);
            this.listenTo(this.gun, 'alpha-particle-fired', this.alphaParticleFired);

            // Create the bounds in which everything interacts
            var spaceWidth = this.gun.get('nozzleWidth');
            var spaceHeight = Constants.ANIMATION_BOX_SIZE.height;
            this.spaceRect = new Rectangle(-spaceWidth / 2, -spaceHeight, spaceWidth, spaceHeight);

            // Collections for photons and alpha particles
            this.photons = new VanillaCollection();
            this.alphaParticles = new VanillaCollection();

            // Create the starting atom
            this.updateAtomicModel();
        },

        _update: function(time, deltaTime) {
            this.gun.update(time, deltaTime);
            this.atom.update(time, deltaTime);
            this.updateParticles(time, deltaTime);
        },

        updateParticles: function(time, deltaTime) {
            this.moveParticles(deltaTime);
            this.cullParticles();
        },

        moveParticles: function(deltaTime) {
            if (this.atom) {
                var i;

                for (i = 0; i < this.photons.length; i++)
                    this.atom.movePhoton(this.photons.at(i), deltaTime);

                for (i = 0; i < this.alphaParticles.length; i++)
                    this.atom.moveAlphaParticle(this.alphaParticles.at(i), deltaTime);
            }
        },

        cullParticles: function() {
            var i;

            for (i = this.photons.length - 1; i >= 0; i--) {
                if (!this.spaceRect.contains(this.photons.at(i).getPosition()))
                    this.photons.remove(this.photons.at(i));
            }

            for (i = this.alphaParticles.length - 1; i >= 0; i--) {
                if (!this.spaceRect.contains(this.alphaParticles.at(i).getPosition()))
                    this.alphaParticles.remove(this.alphaParticles.at(i));
            }
        },

        updateAtomicModel: function() {
            if (this.atom)
                this.stopListening(this.atom);

            var position = this.spaceRect.center();

            if (this.get('experimentSelected')) {
                this.atom = new ExperimentModel({
                    position: position
                }, {
                    gun: this.gun
                });
            }
            else {
                var constructor = this.get('atomicModel').constructor;

                this.atom = new constructor({ 
                    position: position
                }, {
                    gun: this.gun
                });
            }

            this.listenTo(this.atom, 'photon-absorbed', this.photonAbsorbed);
            this.listenTo(this.atom, 'photon-emitted',  this.photonEmitted);
        },

        atomicModelChanged: function(simulation, atomicModel) {
            this.updateAtomicModel();
        },

        experimentSelectedChanged: function(simulation, experimentSelected) {
            this.updateAtomicModel();
        },

        // When the gun fires a photon, add the photon to the model.
        photonFired: function(photon) {
            this.photons.add(photon);
        },
        
        // When the gun fires an alpha particle, add the alpha particle to the model.
        alphaParticleFired: function(alphaParticle) {
            this.alphaParticles.add(alphaParticle);
        },

        // When a photon is absorbed by the atom, remove it from the model.
        photonAbsorbed: function(photon) {
            this.photons.remove(photon);
        },

        // When a photon is emitted by the atom, add it to the model.
        photonEmitted: function(photon) {
            this.photons.add(photon);
        }

    });

    return HydrogenAtomSimulation;
});
