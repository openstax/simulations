define(function (require) {

    'use strict';

    var _ = require('underscore');

    var Vector2 = require('common/math/vector2');

    var MovementStrategy = require('models/movement-strategy');

    var Constants = require('constants');

    /**
     * This movement strategy does nothing automatically.  It is
     *   intended for use when the object in the model to which it
     *   applies is to be moved with the mouse.
     */
    var SinusoidalMovementStrategy = function(electron, frequency, amplitude) {
        this.electron = electron;

        this.frequency = frequency;
        this.amplitude = amplitude;
        this.nextPosition = new Vector2();
        this.omega = this.computeOmega();
        this.runningTime = 0;
        this.velocity = new Vector2();
    };

    /**
     * Instance functions/properties
     */
    _.extend(SinusoidalMovementStrategy.prototype, MovementStrategy.prototype, {

    	update: function(deltaTime) {
            this.runningTime += deltaTime;
            var position = this.electron.startPosition;
            var nextPosition = this.getNextPosition(position, this.runningTime);
            this.electron.setPosition(nextPosition);
        },

        computeOmega: function() {
            return this.frequency * Math.PI * 2;
        },

        getVelocity: function() {
            this.velocity.y = this.omega * Math.cos(this.omega * this.runningTime);
            return this.velocity;
        },

        getAcceleration: function() {
            return -this.amplitude * this.omega * this.omega * Math.sin(this.omega * this.runningTime);
        },

        getMaxAcceleration: function() {
            return -this.amplitude * this.omega * this.omega;
        },

        /**
         * Computes the next position dictated by the movement. Note that
         *   this method does not modify the position parameter, and that
         *   this method is not reentrant.
         */
        getNextPosition: function(position, t) {
            var newY = this.valueAtTime(this.frequency, this.amplitude, t);
            this.nextPosition.set(
                position.x,
                position.y + newY
            );
            return this.nextPosition;
        },

        getWaveValue: function(x) {
            var k = this.omega / Constants.SPEED_OF_LIGHT;
            var s = Math.sin(k * x - this.omega * this.runningTime);
            return -this.amplitude * this.omega * this.omega * s;
        },

        getFrequency: function() {
            return this.frequency;
        },

        getAmplitude: function() {
            return this.amplitude;
        },

        valueAtTime: function(frequency, maxAmplitude, time) {
            var amplitude;
            
            if (frequency !== 0)
                amplitude = Math.sin(frequency * time * Math.PI * 2) * maxAmplitude;
            else
                amplitude = 0;

            return amplitude;
        },

        setFrequency: function(frequency) {
            this.frequency = frequency;
            this.omega = this.computeOmega();
        },

        setAmplitude: function(amplitude) {
            this.amplitude = amplitude;
        },

        setRunningTime: function(runningTime) {
            this.runningTime = runningTime;
        }

    });

    return SinusoidalMovementStrategy;
});