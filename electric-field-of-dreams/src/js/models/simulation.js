define(function (require, exports, module) {

    'use strict';

    var _        = require('underscore');
    var Backbone = require('backbone');

    var FixedIntervalSimulation = require('common/simulation/fixed-interval-simulation');
    var Vector2                 = require('common/math/vector2');

    var System                      = require('models/system');
    var Particle                    = require('models/particle');
    var ElectricForceLaw            = require('models/law/electric-force');
    var ParticleForceLawAdapter     = require('models/law/particle-force-law-adapter');
    var CoulombsLaw                 = require('models/law/coulombs');
    var PropagatorLawAdapter        = require('models/law/propagator-adapter');
    var ResetAccelerationPropagator = require('models/propagator/reset-acceleration');
    var FourBoundsPropagator        = require('models/propagator/four-bounds');
    var VelocityPropagator          = require('models/propagator/velocity');
    var PositionPropagator          = require('models/propagator/position');
    var ChargeFieldCalculator       = require('models/charge-field-calculator');

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
            fieldLatticeWidth: Constants.DISCRETENESS_RANGE.defaultValue
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

            this.center = new Vector2(this.minX + this.width / 2, this.minY + this.height / 2);

            FixedIntervalSimulation.prototype.initialize.apply(this, [attributes, options]);
        },

        /**
         * Initializes the models used in the simulation
         */
        initComponents: function() {
            // TODO: See RandomSystemFactory to:
            //  - Set up bounds
            //  - Do velocity update and position update

            // These particles are in the simulation and are shown on the screen but
            //   aren't necessarily part of the system.
            this.particles = new Backbone.Collection();

            // The system: consists of particles, laws, and propagators
            this.system = new System();

            // Listen to particle events
            this.listenTo(this.particles, 'detach', this.particleDetached);
            this.listenTo(this.particles, 'attach', this.particleAttached);
            this.listenTo(this.particles, 'reset',  this.particlesReset);

            // Electric force law (found in EFieldSimulationPanel in the original)
            this.fieldLaw = new ElectricForceLaw();

            // Coulomb's Law
            var coulombsLaw = new CoulombsLaw(100000);
            this.coulombsLaw = new ParticleForceLawAdapter(coulombsLaw);

            // Create and add propagators and laws
            this.system.laws.push(new PropagatorLawAdapter(new ResetAccelerationPropagator()));
            this.system.laws.push(new PropagatorLawAdapter(new FourBoundsPropagator(this.minX, this.minY, this.width, this.height, 1.2)));
            this.system.laws.push(this.fieldLaw);
            this.system.laws.push(this.coulombsLaw);
            this.system.laws.push(new PropagatorLawAdapter(new VelocityPropagator(100)));
            this.system.laws.push(new PropagatorLawAdapter(new PositionPropagator()));

            // Initialize an object for calculating electric fields at a given location
            this.chargeFieldCalculator = new ChargeFieldCalculator(this.particles, 120000, Constants.MAX_ARROW_LENGTH);

            
        },

        resetComponents: function() {

            // Electric force law
            this.fieldLaw.field.set(0, 0);
        },

        addParticle: function(charge, mass) {
            var particle = new Particle({
                charge: charge,
                mass: mass,
                position: new Vector2(
                    this.minX + Math.random() * this.width,
                    this.minY + Math.random() * this.height
                )
            });

            this.particles.add(particle);
            this.system.particles.add(particle);
            this.coulombsLaw.particles.add(particle);
        },

        /**
         * Removes the last-created particle.
         */
        removeParticle: function() {
            var particle = this.particles.last();

            this.particles.remove(particle);
            this.system.particles.remove(particle);
            this.coulombsLaw.particles.remove(particle);
        },

        /**
         * Returns the electric field at a certain location.
         */
        getFieldAt: function(x, y) {
            // The field is actually a sum of the field created by the charges...
            var field = this.chargeFieldCalculator.getFieldAt(x, y);
            // ...and the external electric field
            field.add(this.fieldLaw.field);
            
            return field;
        },

        _update: function(time, deltaTime) {
            var i;

            for (i = 0; i < this.system.laws.length; i++)
                this.system.laws[i].update(deltaTime, this.system);

            // for (i = 0; i < this.particles.length; i++)
            //     console.log(this.particles.at(i).get('position'));
        },

        /**
         * A particle has triggered a detach event, meaning we should temporarily
         *   remove it from the system's particle list so position, velocity, and
         *   force propagators don't act upon it while in a detached state.
         */
        particleDetached: function(particle) {
            this.system.particles.remove(particle);
        },

        /**
         * A particle has triggreed an attach event, meaning it was previously in
         *   a detached state, and now it's time to add it back to the system's
         *   particle collection so it will again be affected by other forces and
         *   objects in the system.
         */
        particleAttached: function(particle) {
            this.system.particles.add(particle);
        },

        particlesReset: function() {
            this.coulombsLaw.particles.reset();
            this.system.particles.reset();
        }

    });

    return EFDSimulation;
});
