define(function (require, exports, module) {

    'use strict';

    var _ = require('underscore');

    var FixedIntervalSimulation = require('common/simulation/fixed-interval-simulation');
    var Vector2                 = require('common/math/vector2');

    var Laser          = require('models/laser');
    var IntensityMeter = require('models/intensity-meter');

    /**
     * Constants
     */
    var Constants = require('constants');

    /**
     * Wraps the update function in 
     */
    var BendingLightSimulation = FixedIntervalSimulation.extend({

        defaults: _.extend(FixedIntervalSimulation.prototype.defaults, {
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
            this._updateOnNextFrame = true;

            this.simTime = 0;

            FixedIntervalSimulation.prototype.initialize.apply(this, [attributes, options]);

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

            this.listenTo(this.laser, 'change', this.simulationChanged);

            // Initialize the light-rays array
            this.rays = [];

            this.intensityMeter = new IntensityMeter({
                sensorPosition: new Vector2(Constants.MODEL_WIDTH * -0.15, Constants.MODEL_HEIGHT * -0.1),
                bodyPosition:   new Vector2(Constants.MODEL_WIDTH * -0.04, Constants.MODEL_HEIGHT * -0.2)
            });

            this.listenTo(this.intensityMeter, 'change:sensorPosition', this.simulationChanged);
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
                this.rays.splice(i, 1);
            }
            this.intensityMeter.clearRayReadings();
        },

        _update: function(time, deltaTime) {
            this.simTime += deltaTime;
            
            this.dirty = false;

            if (this._updateOnNextFrame) {
                this._updateOnNextFrame = false;

                this.clear();
                this.propagateRays();

                this.dirty = true;
            }

            // Update the light rays' running time for the waves
            for (var i = 0; i < this.rays.length; i++)
                this.rays[i].setTime(this.simTime);
        },

        updateOnNextFrame: function() {
            this._updateOnNextFrame = true;
        },

        propagateRays: function() { throw 'propagateRays must be implemented in child class.'; },

        simulationChanged: function() {
            this.updateOnNextFrame();
            if (this.get('paused'))
                this._update(this.get('time'), 0);
        },

        wavelengthChanged: function(simulation, wavelength) {
            this.laser.set('wavelength', wavelength);
        },

        getWidth: function() {
            return Constants.MODEL_WIDTH;
        },

        getHeight: function() {
            return Constants.MODEL_HEIGHT;
        },

        /**
         * Returns topmost light ray at the specified position or null if there is no
         *   ray at that position.
         */
        getRayAt: function(position) {
            var rays = this.rays.slice();

            // Sort rays by zIndex so the higher z-indexes come first so we hit the ones on top
            rays.sort(function(a, b) {
                return b.zIndex - a.zIndex;
            });

            var ray;
            for (var i = 0; i < rays.length; i++) {
                ray = rays[i];
                if (ray.contains(position, this.laser.get('wave'))) {
                    return ray;
                }
            }

            return null;
        },

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
