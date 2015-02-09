define(function (require, exports, module) {

    'use strict';

    var _ = require('underscore');

    var Simulation = require('backbone');

    /**
     * Constants
     */
    var Constants = require('constants');

    /**
     * Wraps the update function in 
     */
    var Body = Backbone.Model.extend({

        defaults: {

        },
        
        initialize: function(attributes, options) {

        },

        update: function(time, deltaTime) {
            
        }

    });

    return Body;
});
