define(function (require) {

    'use strict';

    var _ = require('underscore');

    var Vector2 = require('common/math/vector2');

    var FaradayObject = require('models/faraday-object');

    var Constants = require('constants');

    /**
     * Electron is the model of an electron, capable of moving along some path.
     *   The path is described by an ordered set of ElectronPathDescriptors.
     */
    var Electron = FaradayObject.extend({

        defaults: _.extend({}, FaradayObject.prototype.defaults, {
            // Electron's speed & direction (-1...+1)
            speed: 0,
            // Scale for adjusting speed.
            speedScale: 1
        }),

        initialize: function(attributes, options) {
            options = _.extend({
                pathIndex: 0,
                pathPosition: 1
            }, options);

            FaradayObject.prototype.initialize.apply(this, arguments);

            this.path = options.path;
            this.pathIndex = options.pathIndex; // first curve
            this.pathPosition = options.pathPosition; // curve's start point

            // Cached objects
            this._point = new Vector2();

            this.updatePositionFromPath();
        },

        /**
         * Gets the descriptor for the curve that the electron is currently on.
         * 
         * @return an ElectronPathDescriptor
         */
        getPathDescriptor: function() {
            return this.path.get(this.pathIndex);
        },

        updatePositionFromPath: function() {
            // Evaluate the quadratic to determine XY location.
            var descriptor = this.path[this.pathIndex];
            var curve = descriptor.getCurve();
            var point = curve.evaluate(this.pathPosition);
            this.setPosition(point);
        },

        /**
         * Moves the electron along the path.  
         * 
         * The electron's path is described by the ElectronPathDescriptor array.
         *
         * The electron's speed & direction determine its position along a curve.
         *   Speed is scaled to account for possible differences in the lengths 
         *   of the curves. Shorter curves will have a larger scaling factor.
         * 
         * When an electron gets to the end of the current curve, it jumps
         *   to the next curve, to a point that represent the "overshoot".
         *   The order of curves is determined by the order of elements in the 
         *   ElectronPathDescriptor array.
         */
        update: function(time, deltaTime) {
            if (this.get('enabled')) {
                // Move the electron along the path.
                var pathScale = this.path[this.pathIndex].getPathScale();
                var delta = deltaTime * Electron.MAX_PATH_POSITION_DELTA * this.speed * this.speedScale * pathScale;
                this.pathPosition -= delta;
                
                // Do we need to switch curves?
                if ( this.pathPosition <= 0 || this.pathPosition >= 1 ) {
                    this.switchCurves();  // sets this.pathIndex and this.pathPosition !
                }
                
                this.updatePositionFromPath();
            }
        },

        /**
         * Moves the electron to an appropriate point on the next/previous curve.
         *   Rescales any "overshoot" of position so the distance moved looks 
         *   approximately the same when moving between curves that have different 
         *   lengths.  
         * 
         * If curves have different lengths, it is possible that we may totally
         *   skip a curve.  This is handled via recursive calls to switchCurves.
         */
        switchCurves: function() {
            var oldSpeedScale = this.path[this.pathIndex].getPathScale();
            var newSpeedScale;
            var overshoot;
            
            if ( this.pathPosition <= 0 ) {
                
                // We've passed the end point, so move to the next curve.
                this.pathIndex++;
                if (this.pathIndex > this.path.length - 1)
                    this.pathIndex = 0;
                
                // Set the position on the curve.
                newSpeedScale = this.path[this.pathIndex].getPathScale();
                overshoot = Math.abs( this.pathPosition * newSpeedScale / oldSpeedScale );
                this.pathPosition = 1.0 - overshoot;
                
                // Did we overshoot the curve?
                if (this.pathPosition < 0)
                    this.switchCurves();
            }
            else if (this.pathPosition >= 1) {
                
                // We've passed the start point, so move to the previous curve.
                this.pathIndex--;
                if (this.pathIndex < 0)
                    this.pathIndex = this.path.length - 1;
                
                // Set the position on the curve.
                newSpeedScale = this.path[this.pathIndex].getPathScale();
                overshoot = Math.abs((1 - this.pathPosition) * newSpeedScale / oldSpeedScale);
                this.pathPosition = 0 + overshoot;
                
                // Did we overshoot the curve?
                if (this.pathPosition > 1)
                    this.switchCurves();
            }
        }

    }, Constants.Electron);

    return Electron;
});
