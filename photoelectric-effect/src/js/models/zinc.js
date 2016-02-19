define(function (require) {

    'use strict';

    var Backbone = require('backbone');

    /**
     * Constants
     */
    var Constants = require('constants');

    var Zinc = Backbone.Model.extend({
        defaults: {
            workFunction: 4.3,
            energyLevels: [ -13.6 ]
        },

        initialize: function(attributes, options) {

        }
    }, Constants.Zinc);

    return Zinc;

});
