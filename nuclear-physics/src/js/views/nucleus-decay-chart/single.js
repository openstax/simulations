define(function(require) {

    'use strict';

    var _    = require('underscore');
    var PIXI = require('pixi');

    var HalfLifeInfo  = require('models/half-life-info');
    var NucleusType   = require('models/nucleus-type');
    var AtomicNucleus = require('models/atomic-nucleus');

    var NucleusDecayChart = require('views/nucleus-decay-chart');

    var Constants = require('constants');

    /**
     * A panel that contains a chart showing the timeline for decay of nuclei over time.
     */
    var SingleNucleusDecayChart = NucleusDecayChart.extend({

        events: _.extend({}, NucleusDecayChart.prototype.events, {
            
        }),

        /**
         * Initializes the new SingleNucleusDecayChart.
         */
        initialize: function(options) {
            options = _.extend({
                
            }, options);

            NucleusDecayChart.prototype.initialize.apply(this, [options]);

            this.listenTo(this.simulation, 'nucleus-added', this.nucleusAdded);
            this.listenTo(this.simulation, 'nucleus-reset', this.nucleusAdded);

            this.nucleusAdded(this.simulation.atomicNucleus);
        },

        update: function(time, deltaTime, paused) {
            if (this._nucleusAdded) {
                this.addNucleus(this.simulation.atomicNucleus);
                this._nucleusAdded = false;
            }

            NucleusDecayChart.prototype.update.apply(this, arguments);
        },

        nucleusAdded: function(nucleus) {
            this._nucleusAdded = true;
        },

        nucleusTypeChanged: function(simulation, nucleusType) {
            this.clearNuclei();
            
            NucleusDecayChart.prototype.nucleusTypeChanged.apply(this, arguments);
        },

    });


    return SingleNucleusDecayChart;
});