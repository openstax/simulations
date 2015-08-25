define(function (require, exports, module) {

    'use strict';

    var _ = require('underscore');

    var Simulation = require('common/simulation/simulation');

    var Laser = require('models/laser');

    /**
     * Constants
     */
    var Constants = require('constants');

    /**
     * Wraps the update function in 
     */
    var BendingLightSimulation = Simulation.extend({

        defaults: _.extend(Simulation.prototype.defaults, {
            wavelength: Constants.WAVELENGTH_RED
        }),
        
        initialize: function(attributes, options) {
            options = _.extend({
                frameDuration: Constants.FRAME_DURATION,
                deltaTimePerFrame: Constants.DEFAULT_DT,

                laserDistanceFromPivot: Constants.DEFAULT_LASER_DISTANCE_FROM_PIVOT, 
                laserAngle: Math.PI * 3 / 4, 
                topLeftQuadrant: true
            }, options);

            this.laserDistanceFromPivot = options.laserDistanceFromPivot
            this.laserAngle = options.laserAngle
            this.topLeftQuadrant = options.topLeftQuadrant
            this.updateOnNextFrame = true;

            Simulation.prototype.initialize.apply(this, [attributes, options]);

            this.on('change:wavelength', this.wavelengthChanged);
        },

        /**
         * Initializes the models used in the simulation
         */
        initComponents: function() {
            // Create the laser
            this.laser = new Laser({
                wavelength: this.get('wavelength')
            }, {
                distanceFromPivot: this.laserDistanceFromPivot, 
                angle: this.laserAngle, 
                topLeftQuadrant: this.topLeftQuadrant
            });

            this.listenTo(this.laser, 'change', this.laserChanged);

            // Initialize the light-rays array
            this.rays = [];
        },

        /**
         * Resets all model components
         */
        resetComponents: function() {
            
        },

        addRay: function(lightRay) {
            this.rays.push(lightRay);
        },

        /**
         * Clear the model in preparation for another ray propagation update phase
         */
        clear: function() {
            for (var i = this.rays.length - 1; i >= 0; i--) {
                this.rays[i].destroy();
                this.rays.slice(i, 1);
            }
        },

        _update: function(time, deltaTime) {
            this.dirty = false;

            if (this.updateOnNextFrame) {
                this.updateOnNextFrame = false;

                this.clear();
                this.propagateRays();

                this.dirty = true;
            }

            // Update the light rays' running time for the waves
            for (var i = 0; i < this.rays.length; i++)
                this.rays[i].setTime(time);
        },

        propagateRays: function() { throw 'propagateRays must be implemented in child class.'; },

        laserChanged: function() {
            this.updateOnNextFrame = true;
        },

        wavelengthChanged: function(simulation, wavelength) {
            this.laser.set('wavelength', wavelength);
        },

        getWidth: function() {
            return Constants.MODEL_WIDTH;
        },

        getHeight: function() {
            return Constants.MODEL_HEIGHT;
        }

    }, {

        /**
         * Get the fraction of power transmitted through the medium
         */
        getTransmittedPower: function(n1, n2, cosTheta1, cosTheta2) {
            return 4 * n1 * n2 * cosTheta1 * cosTheta2 / (Math.pow(n1 * cosTheta1 + n2 * cosTheta2, 2));
        },

        /**
         * Get the fraction of power reflected from the medium
         */
        getReflectedPower: function(n1, n2, cosTheta1, cosTheta2) {
            return Math.pow((n1 * cosTheta1 - n2 * cosTheta2) / (n1 * cosTheta1 + n2 * cosTheta2), 2);
        }

    });

    return BendingLightSimulation;
});
