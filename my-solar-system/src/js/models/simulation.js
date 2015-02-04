define(function (require, exports, module) {

    'use strict';

    var _ = require('underscore');

    var Simulation = require('common/simulation/simulation');
    
    var Body = require('models/body');

    /**
     * Constants
     */
    var Constants = require('constants');

    /**
     * Wraps the update function in 
     */
    var MSSSimulation = Simulation.extend({

        defaults: _.extend(Simulation.prototype.defaults, {
            numBodies: 2,
            speed: 7
        }),
        
        initialize: function(attributes, options) {
            Simulation.prototype.initialize.apply(this, [attributes, options]);

            this.on('change:speed', this.shiftSpeed);
        },

        /**
         * Initializes the models used in the simulation
         */
        initComponents: function() {
            
        },

        _update: function(time, deltaTime) {
            
        },

        /**
         * Steps forward N steps and then updates the bodies' final property values.
         */
        stepForwardNTimes: function(n) {
            for (var i = 0; i < n; i++)
                this.stepForwardVelocityVerlet();
            
            for (var j = 0; j < this.bodies.length; j++)
                this.bodies[j].updateAttributes();
        },

        stepForwardVelocityVerlet: function() {

        },

        addBody: function() {
            if (this.get('numBodies') === Constants.MAX_BODIES)
                return false;
            else
                this.set('numBodies', this.get('numBodies') + 1);
        },

        removeBody: function() {
            if (this.get('numBodies') <= Constants.MIN_BODIES)
                return false;
            else
                this.set('numBodies', this.get('numBodies') - 1);
        },

        shiftSpeed: function(simulation, speed) {
            if (speed > this.stepTimes.length - 1 || speed < 0)
                throw 'Invalid speed setting';

            if (this.integrationOn) {
                this.stopIntegration();
                this.maxAccel = 0;
                this.timeStep = this.stepTimes[speed];
                this.numStepsPerFrame = this.stepCountsPerFrame[speed];
                this.startIntegration();
            }
            else {
                this.maxAccel = 0;
                this.timeStep = this.stepTimes[speed];
                this.numStepsPerFrame = this.stepCountsPerFrame[speed];
            }
        }

    });

    return MSSSimulation;
});
