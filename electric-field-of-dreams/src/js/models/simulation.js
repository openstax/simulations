define(function (require, exports, module) {

    'use strict';

    var _        = require('underscore');
    var Backbone = require('backbone');

    var FixedIntervalSimulation = require('common/simulation/fixed-interval-simulation');

    var Particle                    = require('models/particle');
    var ElectricForceLaw            = require('models/law/electric-force');
    var ParticleForceLawAdapter     = require('models/law/particle-force-law-adapter');
    var CoulombsLaw                 = require('models/law/coulombs');
    var ResetAccelerationPropagator = require('models/propagator/reset-acceleration');
    var FourBoundsPropagator        = require('models/propagator/four-bounds');
    var VelocityPropagator          = require('models/propagator/velocity');
    var PositionPropagator          = require('models/propagator/position');

    /**
     * Constants
     */
    var Constants = require('constants');

    /**
     * Contains all the logic for the model of the simulation.  It has a mixture of
     *   functionality from various classes in the original PhET version, including:
     *
     *     - core.RandomSystemFactory
     *     - phys2d_efield.System2D
     *
     * Note: I've stripped out all the random stuff from RandomSystemFactory because
     *   it wasn't actually utilized in their finished product.
     */
    var EFDSimulation = FixedIntervalSimulation.extend({

        defaults: _.extend(FixedIntervalSimulation.prototype.defaults, {

        }),
        
        initialize: function(attributes, options) {
            options = _.extend({
                frameDuration: Constants.FRAME_DURATION,
                deltaTimePerFrame: Constants.DT_PER_FRAME,

                width:  Constants.SYSTEM_WIDTH,
                height: Constants.SYSTEM_HEIGHT,
                minX:   Constants.SYSTEM_MIN_X,
                minY:   Constants.SYSTEM_MIN_Y
            }, options);

            this.minX = options.minX;
            this.minY = options.minY;
            this.width = options.width;
            this.height = options.height;

            FixedIntervalSimulation.prototype.initialize.apply(this, [attributes, options]);

        },

        /**
         * Initializes the models used in the simulation
         */
        initComponents: function() {
            // TODO: See RandomSystemFactory to:
            //  - Set up bounds
            //  - Do velocity update and position update

            // Particles that hold charge and can move around in the system
            this.particles = new Backbone.Collection();

            // Laws and Propagators (don't need any fancy collections for these)
            this.laws = [];
            this.propagators = [];

            // Electric force law (found in EFieldSimulationPanel in the original)
            this.fieldLaw = new ElectricForceLaw();

            // Coulomb's Law
            var coulombsLaw = new CoulombsLaw(100000);
            this.coulombsLaw = new ParticleForceLawAdapter([], coulombsLaw);

            // Add propagators
            this.propagators.push(new ResetAccelerationPropagator());
            this.propagators.push(new FourBoundsPropagator(this.minX, this.minY, this.width, this.height, 1.2));
            this.propagators.push(new VelocityPropagator(100));
            this.propagators.push(new PositionPropagator());
        },

        resetComponents: function() {

            // Electric force law
            this.fieldLaw.setField(0, 0);
        },

        addParticle: function(charge, mass) {
            this.particles.add(new Particle({
                charge: charge,
                mass: mass
            }));
        },

        /**
         * Removes the last-created particle.
         */
        removeParticle: function() {
            this.particles.remove(this.particles.last());
        },

        _update: function(time, deltaTime) {
            var i;

            for (i = 0; i < this.laws.length; i++)
                this.laws[i].update(deltaTime, this);

            for (i = 0; i < this.propagators.length; i++)
                this.propagators[i].update(deltaTime, this);
        }

    });

    return EFDSimulation;
});
