define(function(require) {

    'use strict';

    var DielectricSimulation = require('models/simulation/dielectric');

    var CapacitorLabSceneView = require('views/scene');
    var CircuitView           = require('views/circuit');

    /**
     *
     */
    var MultipleCapacitorsSceneView = CapacitorLabSceneView.extend({

        events: {
            
        },

        initialize: function(options) {
            CapacitorLabSceneView.prototype.initialize.apply(this, arguments);

            this.listenTo(this.simulation, 'change:circuit', this.circuitChanged);
        },

        initGraphics: function() {
            CapacitorLabSceneView.prototype.initGraphics.apply(this, arguments);

            this.initCircuitViews();
        },

        initCircuitViews: function() {
            this.circuitViews = [];

            for (var i = 0; i < this.simulation.circuits.length; i++) {
                var circuitView = new CircuitView({
                    mvt:                            this.mvt,
                    model:                          this.simulation.circuits[i],
                    maxDielectricEField:            DielectricSimulation.getMaxDielectricEField(),
                    maxPlateCharge:                 DielectricSimulation.getMaxPlateCharge(),
                    maxExcessDielectricPlateCharge: DielectricSimulation.getMaxExcessDielectricPlateCharge(),
                    maxEffectiveEField:             DielectricSimulation.getMaxEffectiveEField()
                });

                // Hide it and add it to the stage
                circuitView.hide();
                this.circuitLayer.addChild(circuitView.displayObject);

                this.circuitViews.push(circuitView);
            }

            this.circuitChanged(this.simulation);
        },

        reset: function() {
            CapacitorLabSceneView.prototype.reset.apply(this, arguments);

            for (var i = 0; i < this.circuitViews.length; i++)
                this.circuitViews[i].reset();
        },

        _update: function(time, deltaTime, paused, timeScale) {
            CapacitorLabSceneView.prototype._update.apply(this, arguments);
            
            for (var i = 0; i < this.circuitViews.length; i++)
                this.circuitViews[i].update(time, deltaTime);
        },

        /**
         * Returns the view of the circuit component that intersects with the
         *   given polygon in view space.
         */
        getIntersectingComponentView: function(polygon) {
            return this.circuitViews[this.simulation.get('currentCircuitIndex')].getIntersectingComponentView(polygon);
        },

        /**
         * 
         */
        getIntersectingCapacitorView: function(point) {
            return this.circuitViews[this.simulation.get('currentCircuitIndex')].getIntersectingCapacitorView(point);
        },

        circuitChanged: function(simulation, circuit) {
            for (var i = 0; i < this.circuitViews.length; i++)
                this.circuitViews[i].hide();
            
            this.circuitViews[simulation.get('currentCircuitIndex')].show();
        },

        showPlateCharges: function() {
            for (var i = 0; i < this.circuitViews.length; i++)
                this.circuitViews[i].showPlateCharges();
        },

        hidePlateCharges: function() {
            for (var i = 0; i < this.circuitViews.length; i++)
                this.circuitViews[i].hidePlateCharges();
        },

        showEFieldLines: function() {
            for (var i = 0; i < this.circuitViews.length; i++)
                this.circuitViews[i].showEFieldLines();
        },

        hideEFieldLines: function() {
            for (var i = 0; i < this.circuitViews.length; i++)
                this.circuitViews[i].hideEFieldLines();
        }

    });

    return MultipleCapacitorsSceneView;
});
