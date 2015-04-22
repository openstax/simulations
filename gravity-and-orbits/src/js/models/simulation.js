define(function (require, exports, module) {

    'use strict';

    var _        = require('underscore');
    var Backbone = require('backbone');

    var Simulation = require('common/simulation/simulation');

    var Body   = require('models/body');
    var Moon   = require('models/body/moon');
    var Planet = require('models/body/planet');

    var Constants = require('constants');
    var Scenarios = require('scenarios');

     /* PhET explanation: "
      *    Subdivide DT intervals by this factor to improve smoothing, 
      *    otherwise some orbits look too non-smooth (you can see 
      *    their corners). "
      */
    var SMOOTHING_STEPS = 5;

    /**
     * 
     */
    var GOSimulation = Simulation.extend({

        defaults: _.extend(Simulation.prototype.defaults, {
            scenario: Scenarios.Friendly[0]
        }),
        
        /**
         *
         */
        initialize: function(attributes, options) {
            this.bodies = new Backbone.Collection([], {
                model: Body
            });

            Simulation.prototype.initialize.apply(this, [attributes, options]);

            this.on('change:scenario', this.scenarioChanged);

            this.scenarioChanged(this, this.get('scenario'));
        },

        /**
         *
         */
        applyOptions: function(options) {
            Simulation.prototype.applyOptions.apply(this, [options]);

            
        },

        /**
         *
         */
        initComponents: function() {
            
        },

        /**
         * Loads a scenario. Sets up the bodies, applies simulation
         *   attributes, and resets the simulation.
         */
        scenarioChanged: function(simulation, scenario) {
            this.bodies.reset(_.map(scenario.bodies, function(body) {
                return body.clone();
            }));

            this.set(scenario.simulationAttributes);

            //this.reset();
        },

        /**
         *
         */
        reset: function() {
            Simulation.prototype.reset.apply(this);

        },

        /**
         *
         */
        play: function() {
            // May need to save the current state here for the rewind button

            Simulation.prototype.play.apply(this);
        },

        /**
         *
         */
        rewind: function() {
            // Apply the saved state
        },

        /**
         * Only runs if simulation isn't currently paused.
         * If we're recording, it saves state
         */
        _update: function(time, delta) {
            // For the time slider and anything else relying on time
            this.set('time', time);

            // Split up the delta time into steps to smooth out the orbit
            delta /= SMOOTHING_STEPS;
            for (var i = 0; i < SMOOTHING_STEPS; i++)
                this.performSubstep(delta);
        },

        /**
         *
         */
        performSubstep: function(delta) {
            
        }

    });

    return GOSimulation;
});