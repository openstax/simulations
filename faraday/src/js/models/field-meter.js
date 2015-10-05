define(function (require) {

    'use strict';

    var _ = require('underscore');

    var Vector2 = require('common/math/vector2');

    var FaradayObject   = require('models/faraday-object');

    var Constants = require('constants');

    /**
     * FieldMeter is the model of a B-field meter.
     */
    var FieldMeter = FaradayObject.extend({

        initialize: function(attributes, options) {
            FaradayObject.prototype.initialize.apply(this, arguments);

            this.magnetModel = options.magnetModel; // Magnet that the field meter is observing.
            this.fieldVector = new Vector2();

            // Cached objects
            this._strength = new Vector2();

            this.update();
        },

        getStrength: function() {
            return this._strength.set(this.fieldVector);
        },

        /**
         * Updates the field meter's location and takes a B-field reading at that location.
         */
        update: function(time, deltaTime) {
            if (this.get('enabled'))
                this.fieldVector.set(this.magnetModel.getBField(this.get('position')));
        }

    });

    return FieldMeter;
});
