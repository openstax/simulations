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
     * Wraps the update function in 
     */
    var FaradaySimulation = FixedIntervalSimulation.extend({

        defaults: _.extend(FixedIntervalSimulation.prototype.defaults, {

        }),
        
        initialize: function(attributes, options) {
            options = _.extend({
                framesPerSecond:   Constants.CLOCK_FRAME_RATE,
                deltaTimePerFrame: Constants.CLOCK_DELAY
            }, options);

            FixedIntervalSimulation.prototype.initialize.apply(this, [attributes, options]);

            this.electrons = new Backbone.Collection();
        },

        /**
         * Initializes the models used in the simulation
         */
        initComponents: function() {
            
        },

        addElectron: function(electron) {
            this.electrons.add(electron);
        },

        clearElectrons: function() {
            this.electrons.reset();
        },

        _update: function(time, deltaTime) {
            for (var i = 0; i < this.electrons.length)
                this.electrons.at(i).update(time, deltaTime);
        }

    });

    return FaradaySimulation;
});
