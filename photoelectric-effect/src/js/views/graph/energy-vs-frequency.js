define(function(require) {

    'use strict';

    var _ = require('underscore');

    var PhysicsUtil = require('common/quantum/models/physics-util');

    var PEffectSimulation = require('models/simulation');

    var GraphView = require('views/graph');

    var FREQUENCY_MULTIPLIER = 1E-15;

    /**
     * 
     */
    var EnergyVsFrequencyGraphView = GraphView.extend({

        initialize: function(options) {
            var xStart = 0;
            var xEnd = PhysicsUtil.wavelengthToFrequency(PEffectSimulation.MIN_WAVELENGTH) * FREQUENCY_MULTIPLIER;
            var xStep = (xEnd - xStart) / 4;

            options = _.extend({
                title: 'Electron Energy vs Light Frequency',
                x: {
                    start: xStart,
                    end:   xEnd,
                    step:  xStep,
                    label: 'Frequency (x10^15 Hz)',
                    showNumbers: true,
                    decimals: 2
                },
                y: {
                    start: 0,
                    end:   PhysicsUtil.wavelengthToEnergy(PEffectSimulation.MIN_WAVELENGTH),
                    step:  2,
                    label: 'Energy (eV)',
                    showNumbers: true
                },
                lineColor: '#2575BA'
            }, options);

            GraphView.prototype.initialize.apply(this, [options]);
        },

        /**
         * Updates the graph
         */
        update: function() {
            this.draw();
        }

    });


    return EnergyVsFrequencyGraphView;
});
