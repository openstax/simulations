define(function(require) {

    'use strict';

    var Vector2 = require('common/math/vector2');

    var EnergyDiagramView = require('hydrogen-atom/views/energy-diagram');

    var Constants = require('constants');

    // Distance between the electron and the vertical energy axis.
    var X_MARGIN = 15;
    
    // Distance between the electron's initial position and top of the diagram.
    var Y_MARGIN = 40;
    
    // Electron's distance from the atom's center when it drops off bottom of diagram.
    // If you want the last position of the electron to be close to the bottom of the chart:
    // Determine the electron's distance r from the proton for each clock step, for each clock speed.
    // Choose a value of r that all clock speeds have in common.
    // Then choose a value for MIN_RADIUS that is slightly less r. 
    var MIN_RADIUS = 5.85;

    /**
     * 
     */
    var SolarSystemEnergyDiagramView = EnergyDiagramView.extend({

        initialize: function(options) {
            // Default values
            options = _.extend({
                numberOfStates: 0
            }, options);

            EnergyDiagramView.prototype.initialize.apply(this, [options]);

            this._modelOffset = new Vector2();

            var resolution = this.getResolution();
            this.electronXOffset = 15 * resolution;
            this.electronYStart = 40 * resolution;
        },

        /**
         * Updates the graph
         */
        update: function(time, deltaTime, paused) {
            if (!this.atom || this._hidden)
                return;

            if (!this._modelOffset.equals(this.atom.electronOffset)) {
                this._modelOffset.set(this.atom.electronOffset);
                this.draw();
            }
            else if (this.atom.isDestroyed()) {
                this.clearAtom();
                this.draw();
            }
        },

        drawData: function() {
            var ctx = this.ctx;
            var width = this.getGraphWidth();
            var height = this.getGraphHeight();
            var originX = this.paddingLeft;
            var originY = this.paddingTop + height;

            var x = originX + this.electronXOffset;
            var y = Number.MAX_VALUE; // off the chart

            var r = this.atom.getElectronDistanceFromCenter();
            var minEnergy = -1 / (MIN_RADIUS * MIN_RADIUS);

            if (r > 0) {
                var energy = -1 / (r * r);
                if (energy >= minEnergy) {
                    var h = height - this.electronYStart; // height of energy axis
                    var d = h * energy / minEnergy; // how far down the energy axis is this energy value?
                    y = this.electronYStart + d;
                }
            }

            this.drawElectron(ctx, x, y);
        }

    });


    return SolarSystemEnergyDiagramView;
});
