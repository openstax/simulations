// add momentum and mass
define(function (require) {

    'use strict';

    var _ = require('underscore');
    
    var Vector2 = require('common/math/vector2');

    var PositionConstrainedElectron = require('models/electron/position-constrained');
    var SinusoidalMovementStrategy  = require('models/movement-strategy/sinusoidal');

    /**
     * Represents a body with mass moving in space.
     */
    var EmfSensingElectron = PositionConstrainedElectron.extend({

        /**
         * Initializes the new electron
         */
        initialize: function(attributes, options) {
            this.sourceElectron = options.sourceElectron;
            this._location = new Vector2();
            this._aPrevious = new Vector2();

            PositionConstrainedElectron.prototype.initialize.apply(this, [attributes, options]);

            this.movementStrategy = this.manualMovement;
            this.recordingHistory = false;
        },

        update: function(time, deltaTime) {
            PositionConstrainedElectron.prototype.update.apply(this, arguments);

            var v = this.get('velocity');
            var location = this._location;
            var aPrev = this._aPrevious;

            // If there is no field, then move the electron back to its original location
            if (this.sourceElectron.isFieldOff(this.get('position').x)) {
                this.setVelocityX(0);
                this.setVelocityY((this.startPosition.y - this.get('position').y) / 30);
                location.set(this.get('position').x, this.get('position').y + v.y * dt);
            }
            else {
                // For sinusoidal movement, we will just use the incremental displacement of the source
                //   electron, multiplied by -1, because the second derivative of a sine or cosine is
                //   also a sine or cosine
                if (this.sourceElectron.getMovementTypeAt(location) instanceof SinusoidalMovementStrategy) {
                    var d = this.sourceElectron.getPositionAt(location);
                    var dy = (this.sourceElectron.getPositionAt(location) - this.startPosition.y) * 0.4;
                    location.set(location.x, this.startPosition.y + dy);
                }
                // If the movement is not sinusoidal, then we will use the acceleration of the source
                //   electron to determine the field
                else {
                    // The field strength is a force on the electron, so we must compute an
                    //   acceleration
                    var fieldStrength = this.sourceElectron.getDynamicFieldAt(location);
                    var a = fieldStrength;
                    var x = this.get('position').x;
                    var y = this.get('position').y;
                    location = this.get('position');
                    x += v.x * dt;

                    // The 30 here is a complete fudge factor
                    dt /= 10;
                    y = y + v.y * dt + a.y * dt * dt / 2;
                    v.y = v.y + ((a.y + aPrev.y) / 2) * dt; // Verlet
                    location.set(x, y);
                    aPrev.x = a.x;
                    aPrev.y = a.y;
                }

                this.setPosition(location);
            }
        },

        recenter: function() {
            this.setPosition(this.startPosition);
            this.movementStrategy = this.manualMovement;
        }

    });


    return EmfSensingElectron;
});
