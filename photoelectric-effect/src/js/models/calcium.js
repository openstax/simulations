define(function (require) {

    'use strict';

    var Backbone = require('backbone');

    /**
     * Constants
     */
    var Constants = require('constants');

    var Calcium = Backbone.Model.extend({
        defaults: {
            workFunction: 2.9,
            energyLevels: [ -13.6 ]
        },

        initialize: function(attributes, options) {

        }
    }, Constants.Calcium);

    return Calcium;

});
