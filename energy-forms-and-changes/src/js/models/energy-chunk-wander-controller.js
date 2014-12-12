define(function (require) {

    'use strict';

    var _         = require('underscore');
    var Rectangle = require('common/math/rectangle');
    var Vector2   = require('common/math/vector2');

    /**
     * Constants
     */
    var Constants = require('constants');

    /**
     * 
     */
    var EnergyChunkWanderController = function(energyChunk, destination, initialWanderConstraint) {
        this.energyChunk = energyChunk;
        this.destination = new Vector2(destination);
        this.velocity    = new Vector2(0, EnergyChunkWanderController.MAX_VELOCITY);
        this.countdownTimer = 0;

        if (initialWanderConstraint)
            this.initialWanderConstraint = new Rectangle(initialWanderConstraint);

        this._proposedPosition = new Vector2();
        this._vectorToDestination = new Vector2();
        this._translation = new Vector2();

        this.resetCountdownTimer();
        this.changeVelocityVector();
    };
    var C = EnergyChunkWanderController;

    var _debugEnergyChunk;

    /**
     * Apply static constants
     */
    _.extend(EnergyChunkWanderController, Constants.EnergyChunkWanderController);

    /**
     * Functions
     */
    _.extend(EnergyChunkWanderController.prototype, {

        updatePosition: function(deltaTime) {
            var distanceToDestination = this.energyChunk.get('position').distance(this.destination);
            if (distanceToDestination < this.velocity.length() * deltaTime && !this.energyChunk.get('position').equals(this.destination)) {
                 // Destination reached.
                this.energyChunk.setPosition(this.destination);
                this.velocity.scale(0);
            }
            else if (this.energyChunk.get('position').distance(this.destination) < deltaTime * this.velocity.length()) {
                // Prevent overshoot.
                this.velocity.scale(this.energyChunk.get('position').distance(this.destination) * deltaTime);
            }

            var translation = this._translation;

            // Stay within the horizontal confines of the initial bounds.
            if (this.initialWanderConstraint && this.energyChunk.get('position').y < this.initialWanderConstraint.top()) {
                translation
                    .set(this.velocity)
                    .scale(deltaTime);
                var proposedPosition = this._proposedPosition
                    .set(this.energyChunk.get('position'))
                    .add(translation);
                if (proposedPosition.x < this.initialWanderConstraint.left() || proposedPosition.x > this.initialWanderConstraint.right()) {
                    // Bounce in the x direction to prevent going outside initial bounds.
                    this.velocity.set(-this.velocity.x, this.velocity.y);
                }
            }

            translation
                .set(this.velocity)
                .scale(deltaTime);

            
            // if (this.fromBurnerDebug) {
            //     if (!_debugEnergyChunk)
            //         _debugEnergyChunk = this.energyChunk;
            //     if (_debugEnergyChunk === this.energyChunk)
            //         console.log('current: ' + this.energyChunk.get('position').x.toFixed(2) + ',' + this.energyChunk.get('position').y.toFixed(2) + ' target: ' + this.destination.x.toFixed(2) + ',' + this.destination.y.toFixed(2));
            // }
                
            
            this.energyChunk.translate(translation);
            this.countdownTimer -= deltaTime;
            if (this.countdownTimer <= 0) {
                this.changeVelocityVector();
                this.resetCountdownTimer();
            }
        },

        changeVelocityVector: function() {
            var vectorToDestination = this._vectorToDestination
                .set(this.destination)
                .sub(this.energyChunk.get('position'));
            var angle = vectorToDestination.angle();
            if (vectorToDestination.length() > C.DISTANCE_AT_WHICH_TO_STOP_WANDERING) {
                // Add some randomness to the direction of travel.
                angle += (Math.random() - 0.5) * 2 * C.MAX_ANGLE_VARIATION;
            }
            var scalarVelocity = C.MIN_VELOCITY 
                               + (C.MAX_VELOCITY - C.MIN_VELOCITY) 
                               * Math.random();
            this.velocity.set(scalarVelocity * Math.cos(angle), scalarVelocity * Math.sin(angle));
        },

        resetCountdownTimer: function() {
            this.countdownTimer = C.MIN_TIME_IN_ONE_DIRECTION + (C.MAX_TIME_IN_ONE_DIRECTION - C.MIN_TIME_IN_ONE_DIRECTION) * Math.random();
        },

        destinationReached: function() {
            return this.destination.distance(this.energyChunk.get('position')) < 1E-7;
        }

    });

    return EnergyChunkWanderController;
});
