define(function (require) {

    'use strict';

    var Backbone = require('backbone');

    /**
     * Constants
     */
    var Constants = require('constants');

    var Sodium = Backbone.Model.extend({
        defaults: {
            workFunction: 2.3,
            energyLevels: [ -3.03, -1.95, -1.52,
                            -1.39, -1.02, -0.86 ]
        },

        initialize: function(attributes, options) {

        }
    }, Constants.Sodium);

    return Sodium;

});
