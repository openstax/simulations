// add momentum and mass
define(function (require) {

    'use strict';

    var _ = require('underscore');
    
    var Vector2 = require('common/math/vector2');

    var Electron = require('models/electron');

    /**
     * Represents a body with mass moving in space.
     */
    var PositionConstrainedElectron = Electron.extend({

        /**
         * Initializes the new electron
         */
        initialize: function(attributes, options) {
            this.positionConstraint = options.positionConstraint;

            this._constrainedPosition = new Vector2();

            Electron.prototype.initialize.apply(this, [attributes, options]);
        },

        setPosition: function(x, y) {
            if (x instanceof Vector2)
                this._constrainedPosition.set(x);
            else
                this._constrainedPosition.set(x, y);

            this.positionConstraint.constrainPosition(this._constrainedPosition);

            Electron.prototype.setPosition.apply(this, [this._constrainedPosition]);
        },

        getMaxPos: function() {
            var maxPos = this._constrainedPosition.set(Number.MAX_VALUE, Number.MAX_VALUE);
            this.positionConstraint.constrainPosition(maxPos);
            return maxPos;
        },

        getMinPos: function() {
            var minPos = this._constrainedPosition.set(Number.MIN_VALUE, Number.MIN_VALUE);
            this.positionConstraint.constrainPosition(minPos);
            return minPos;
        },

    });


    return PositionConstrainedElectron;
});
