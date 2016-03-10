define(function(require) {

    'use strict';

    var _ = require('underscore');

    var PEffectSimulation = require('models/simulation');

    var GraphView = require('views/graph');

    /**
     * 
     */
    var CurrentVsIntensityGraphView = GraphView.extend({

        initialize: function(options) {
            // Default values
            options = _.extend({
                title: 'Current vs Light Intensity',
                x: {
                    start: 0,
                    end:   PEffectSimulation.MAX_PHOTONS_PER_SECOND,
                    step:  100,
                    label: 'Intensity',
                    showNumbers: false
                },
                y: {
                    start: 0,
                    end:   PEffectSimulation.MAX_CURRENT,
                    step:  PEffectSimulation.MAX_CURRENT / 6,
                    label: 'Current',
                    showNumbers: false
                },
                lineColor: '#349E34'
            }, options);

            GraphView.prototype.initialize.apply(this, [options]);

            this.listenTo(this.simulation, 'change:current', this.currentChanged);
            this.listenTo(this.simulation, 'voltage-changed', this.voltageChanged);
            this.listenTo(this.simulation.beam, 'change:wavelength', this.wavelengthChanged);
            this.listenTo(this.simulation.beam, 'change:photonsPerSecond', this.beamIntensityChanged);
            this.listenTo(this.simulation.target, 'change:targetMaterial', this.targetMaterialChanged);
        },

        /**
         * Updates the graph
         */
        update: function() {
            this.updateCurrentPoint();
        },

        addPoint: function() {
            this.points.push(this.createPoint(
                this.getBeamIntensity(), 
                this.simulation.getCurrent()
            ));

            this.draw();
        },

        updateCurrentPoint: function() {
            if (this.points.length === 0)
                this.points.push(this.createPoint());

            this.points[this.points.length - 1].set(
                this.getBeamIntensity(), 
                this.simulation.getCurrent()
            );

            this.draw();
        },

        getBeamIntensity: function() {
            return this.simulation.photonRateToIntensity(
                this.simulation.beam.get('photonsPerSecond'),
                this.simulation.beam.get('wavelength')
            );
        },

        currentChanged: function() {
            this.addPoint();
        },

        voltageChanged: function() {
            this.clearPoints();
            this.addPoint();
        },

        wavelengthChanged: function() {
            this.clearPoints();
            this.addPoint();
        },

        beamIntensityChanged: function() {
            this.addPoint();
        },

        targetMaterialChanged: function() {
            this.clearPoints();
        }

    });


    return CurrentVsIntensityGraphView;
});
