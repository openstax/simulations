define(function (require) {

    'use strict';

    var _ = require('underscore');

    var FaradayObject = require('models/faraday-object');

    /**
     * AbstractCoil is the abstract base class for all coils
     */
    var AbstractCoil = FaradayObject.extend({

        defaults: _.extend({}, FaradayObject.prototype.defaults, {
            // Number of loops in the coil.
            numberOfLoops: 1,
            // Radius of all loops in the coil.
            radius: 10,
            // Width of the wire.
            wireWidth: 16,
            // Spacing between the loops
            loopSpacing: 25,
            // Amplitude of the current in the coil (-1...+1)
            currentAmplitude: 0,
            // Area of the loops
            loopArea: undefined
        }),

        initialize: function(attributes, options) {
            FaradayObject.prototype.initialize.apply(this, arguments);

            if (this.get('loopArea') !== undefined)
                this.setLoopArea(this.get('loopArea'));
        },

        reset: function() {
            FaradayObject.prototype.reset.apply(this, arguments);

            if (this._startingAttributes.loopArea !== undefined)
                this.setLoopArea(this._startingAttributes.loopArea);
        },

        /**
         * Sets the surface area of one loop.
         */
        setLoopArea: function(area) {
            this.set('radius', Math.sqrt(area / Math.PI));
        },
        
        /**
         * Gets the surface area of one loop.
         */
        getLoopArea: function() {
            return (Math.PI * Math.pow(this.get('radius'), 2));
        }

    });

    return AbstractCoil;
});
