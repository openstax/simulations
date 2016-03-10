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

            this.listenTo(this.simulation, 'voltage-changed', this.voltageChanged);
            this.listenTo(this.simulation.beam, 'change:wavelength', this.wavelengthChanged);
            this.listenTo(this.simulation.beam, 'change:photonsPerSecond', this.beamIntensityChanged);
            this.listenTo(this.simulation.target, 'change:targetMaterial', this.targetMaterialChanged);
        },

        /**
         * Updates the graph
         */
        update: function() {
            this.updateGraph();
        },

        updateGraph: function() {
            if (this.beamOn) {
                var wavelength = this.simulation.getWavelength();
                var frequency = PhysicsUtil.wavelengthToFrequency(wavelength) * FREQUENCY_MULTIPLIER;
                var workFunction = this.simulation.target.getMaterial().getWorkFunction();
                var energy = Math.max(0, PhysicsUtil.wavelengthToEnergy(wavelength) - workFunction);

                if ((this.lastFrequencyRecorded < this.kneeFrequency && frequency > this.kneeFrequency) ||
                    (this.lastFrequencyRecorded > this.kneeFrequency && frequency < this.kneeFrequency)
                ) {
                    this.points.push(this.createPoint(
                        this.kneeFrequency, 
                        0
                    ));
                }

                this.points.push(this.createPoint(
                    frequency, 
                    energy
                ));

                this.lastFrequencyRecorded = frequency;
            }

            this.draw();
        },

        determineKneeFrequency() {
            return PhysicsUtil.wavelengthToFrequency(PhysicsUtil.energyToWavelength(this.simulation.getWorkFunction()));
        },

        targetMaterialChanged: function() {
            this.kneeFrequency = this.determineKneeFrequency() * FREQUENCY_MULTIPLIER;
            this.clearPoints();
            this.updateGraph();
        },

        voltageChanged: function() {
            this.kneeFrequency = this.determineKneeFrequency() * FREQUENCY_MULTIPLIER;
            this.updateGraph();
        },

        wavelengthChanged: function() {
            this.updateGraph();
        },

        beamIntensityChanged: function() {
            if (this.simulation.beam.get('photonsPerSecond') === 0) {
                this.beamOn = false;
                this.clearPoints();
                this.updateGraph();
            }
            else {
                this.beamOn = true;
                this.updateGraph();
            }
        }

    });


    return EnergyVsFrequencyGraphView;
});
