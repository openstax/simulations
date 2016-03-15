define(function (require) {

    'use strict';

    var Backbone = require('backbone');

    /**
     * Constants
     */
    var Constants = require('constants');

    var Circuit = Backbone.Model.extend({
        defaults: {
            voltage: 0,
            circuitIsPositive: true
        },

        initialize: function(attributes, options) {
            
        }
    }, Constants.Circuit);

    return Circuit;

});
