define(function (require) {

    'use strict';

    var Backbone = require('backbone');

    /**
     * Constants
     */
    var Constants = require('constants');

    var Platinum = Backbone.Model.extend({
        defaults: {
            workFunction: 6.3,
            energyLevels: [ -13.6 ]
        },

        initialize: function(attributes, options) {

        }
    }, Constants.Platinum);

    return Platinum;

});
