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
                deltaTimePerFrame: Constants.CLOCK_STEP
            }, options);

            FixedIntervalSimulation.prototype.initialize.apply(this, [attributes, options]);
        },

        /**
         * Initializes the models used in the simulation
         */
        initComponents: function() {
            this.electrons = new Backbone.Collection();
        },

        resetComponents: function() {
            this.clearElectrons();
        },

        addElectron: function(electron) {
            this.electrons.add(electron);
        },

        removeElectron: function(electron) {
            for (var i = this.electrons.length - 1; i >= 0; i--) {
                if (this.electrons[i] === electron) {
                    this.electrons.splice(i, 1);
                    break;
                }
            }
        },

        clearElectrons: function() {
            this.electrons.reset();
        },

        _update: function(time, deltaTime) {
            for (var i = 0; i < this.electrons.length; i++)
                this.electrons.at(i).update(time, deltaTime);
        }

    });

    return FaradaySimulation;
});
