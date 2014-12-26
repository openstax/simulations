define(function (require) {

    'use strict';

    var _         = require('underscore');
    var Vector2   = require('common/math/vector2');

    /**
     * Constants
     */
    var Constants = require('constants');

    /**
     * 
     */
    var EnergyChunkPathMover = function(energyChunk, path, velocity) {
        this.energyChunk = energyChunk;
        this.path = path;
        this.velocity = velocity;

        if (path.length === 0)
            throw 'Path must have at least one point.';

        this.nextIndex = 0;
        this.pathFullyTraversed = false;

        this._velocityVector = new Vector2();
        this._nextVector = new Vector2();
    };

    /**
     * Functions
     */
    _.extend(EnergyChunkPathMover.prototype, {

        moveAlongPath: function(deltaTime) {
            var distanceToTravel = time * this.velocity;
            while (distanceToTravel > 0 && !this.pathFullyTraversed) {
                if (distanceToTravel < this.energyChunk.get('position').distance(this.path[this.nextPoint])) {
                    // Not arriving at destination next point yet, so just move towards it.
                    var angleToNext = this._nextVector
                        .set(this.path[this.nextPoint])
                        .sub(this.energyChunk.get('position'))
                        .angle();
                    var velocityVector = this._velocityVector
                        .set(distanceToTravel, 0)
                        .rotate(angleToNext);
                    this.energyChunk.translate(velocityVector);
                    distanceToTravel = 0; // No remaining distance.
                }
                else {
                    // Arrived at next destination point.
                    distanceToTravel -= this.energyChunk.get('position').distance(this.path[this.nextPoint]);
                    this.energyChunk.setPosition(this.path[this.nextPoint]);
                    if (this.nextIndex === (this.path.length - 1)) {
                        // At the end
                        this.pathFullyTraversed = true;
                    }
                    else {
                        // Set the next destination point
                        this.nextPoint++;
                    }
                }
            }
        },

        getFinalDestination: function() {
            return this.path[this.path.length - 1];
        },

        finished: function() {
            return this.pathFullyTraversed;
        }

    });

    return EnergyChunkPathMover;
});
