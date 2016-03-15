define(function (require) {

    'use strict';

    var ElementProperties = require('common/quantum/models/element-properties');

    var Constants = require('../constants');

    /**
     * A place to store element properties in the laser simulation
     */
    var LaserElementProperties = ElementProperties.extend({

        initialize: function(attributes, options) {
            ElementProperties.prototype.initialize.apply(this, [attributes, options]);

            // Set the mean lifetimes of the states
            var states = this.states;
            for (var i = 1; i < states.length; i++)
                states[i].set('meanLifetime', Constants.MAXIMUM_STATE_LIFETIME / 2);
        },

        getMiddleEnergyState: function() {
            return this.states[1];
        },

        getHighEnergyState: function() {
            throw 'Function must be implemented in child class.';
        }

    });


    return LaserElementProperties;
});
