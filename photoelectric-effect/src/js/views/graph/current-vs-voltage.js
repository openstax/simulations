define(function(require) {

    'use strict';

    var _ = require('underscore');

    var PEffectSimulation = require('models/simulation');

    var GraphView = require('views/graph');

    /**
     * 
     */
    var CurrentVsVoltageGraphView = GraphView.extend({

        initialize: function(options) {
            // Default values
            options = _.extend({
                title: 'Current vs Battery Voltage',
                x: {
                    start: PEffectSimulation.MIN_VOLTAGE,
                    end:   PEffectSimulation.MAX_VOLTAGE,
                    step:  2,
                    label: 'Voltage',
                    showNumbers: true
                },
                y: {
                    start: 0,
                    end:   PEffectSimulation.MAX_CURRENT,
                    step:  PEffectSimulation.MAX_CURRENT / 6,
                    label: 'Current',
                    showNumbers: false
                },
                lineColor: '#f00'
            }, options);

            GraphView.prototype.initialize.apply(this, [options]);

            this.listenTo(this.simulation, 'change:current', this.currentChanged);
            this.listenTo(this.simulation, 'voltage-changed', this.voltageChanged);
            this.listenTo(this.simulation.beam, 'change:wavelength', this.wavelengthChanged);
            this.listenTo(this.simulation.beam, 'change:photonsPerSecond', this.beamIntensityChanged);
            this.listenTo(this.simulation.target, 'change:targetMaterial', this.targetMaterialChanged);
        },

        addPoint: function() {
            this.points.push(this.createPoint(
                this.simulation.getVoltage(), 
                this.simulation.getCurrent()
            ));

            this.draw();
        },

        updateCurrentPoint: function() {
            if (this.points.length === 0)
                this.points.push(this.createPoint());

            this.points[this.points.length - 1].set(
                this.simulation.getVoltage(), 
                this.simulation.getCurrent()
            );

            this.draw();
        },

        currentChanged: function() {
            this.updateCurrentPoint();
        },

        voltageChanged: function() {
            this.addPoint();
        },

        wavelengthChanged: function() {
            this.clearPoints();
            this.updateCurrentPoint();
        },

        beamIntensityChanged: function() {
            this.clearPoints();
        },

        targetMaterialChanged: function() {
            this.clearPoints();
        }

    });


    return CurrentVsVoltageGraphView;
});
