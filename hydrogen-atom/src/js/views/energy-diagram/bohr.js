define(function(require) {

    'use strict';

    var BohrModel = require('hydrogen-atom/models/atomic-model/bohr');

    var EnergyDiagramView = require('hydrogen-atom/views/energy-diagram');

    var Constants = require('constants');

    /**
     * 
     */
    var BohrEnergyDiagramView = EnergyDiagramView.extend({

        initialize: function(options) {
            // Default values
            options = _.extend({
                numberOfStates: BohrModel.getNumberOfStates()
            }, options);

            EnergyDiagramView.prototype.initialize.apply(this, [options]);
        },

        /**
         * Updates the graph
         */
        update: function(time, deltaTime, paused) {},

        drawEmptyGraph: function() {
            EnergyDiagramView.prototype.drawEmptyGraph.apply(this, arguments);

            var ctx = this.ctx;
            var width = this.getGraphWidth();
            var height = this.getGraphHeight();
            var originX = this.paddingLeft;
            var originY = this.paddingTop + height;
            var resolution = this.getResolution();

            
        },

        drawData: function() {}

    });


    return BohrEnergyDiagramView;
});
