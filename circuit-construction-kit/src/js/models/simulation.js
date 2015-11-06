define(function (require, exports, module) {

    'use strict';

    var _        = require('underscore');
    var Backbone = require('backbone');

    var FixedIntervalSimulation = require('common/simulation/fixed-interval-simulation');

    /**
     * Constants
     */
    var Constants = require('constants');

    /**
     * 
     */
    var CCKSimulation = FixedIntervalSimulation.extend({

        defaults: _.extend(FixedIntervalSimulation.prototype.defaults, {

        }),
        
        initialize: function(attributes, options) {
            options = _.extend({
                
            }, options);

            FixedIntervalSimulation.prototype.initialize.apply(this, [attributes, options]);
        },

        /**
         * Initializes the models used in the simulation
         */
        initComponents: function() {
            
        },

        resetComponents: function() {
            
        },

        _update: function(time, deltaTime) {
            for (var i = 0; i < this.electrons.length; i++)
                this.electrons.at(i).update(time, deltaTime);
        }

    });

    return CCKSimulation;
});
