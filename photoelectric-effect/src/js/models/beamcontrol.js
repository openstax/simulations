define(function (require) {

    'use strict';

    var Backbone = require('backbone');

    /**
     * Constants
     */
    var Constants = require('constants');

    var BeamControl = Backbone.Model.extend({
        defaults: {
            wavelength: 400,
            intensity: 100
        },

        initialize: function(attributes, options) {
            
        }
    }, Constants.BeamControl);

    return BeamControl;

});
