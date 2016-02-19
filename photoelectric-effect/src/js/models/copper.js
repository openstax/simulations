define(function (require) {

    'use strict';

    var Backbone = require('backbone');

    /**
     * Constants
     */
    var Constants = require('constants');

    var Copper = Backbone.Model.extend({
        defaults: {
            workFunction: 4.7,
            energyLevels: [ -13.6 ]
        },

        initialize: function(attributes, options) {

        }
    }, Constants.Copper);

    return Copper;

});
