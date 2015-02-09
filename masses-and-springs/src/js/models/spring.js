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
    var Spring = Backbone.Model.extend({

        defaults: {

        },
        
        initialize: function(attributes, options) {

            this.restL = attributes.restL; //equilibrium length of spring, stretched length handled by bodySpringSystem and view
            this.k = attributes.k;         //spring constant
            this.x = attributes.x;         //x position of spring (middle)
            this.y1 = attributes.y1;       //y position of top of spring

            this.y2 = this.y1 + this.restL; //y-position of bottom of spring
            this.body = undefined;  //a body can be attached to the spring
            this.snagged = false;   //a spring is snagged if it is attached to a mass
        },

        update: function(time, deltaTime) {
            
        }

    });

    return Spring;
});
