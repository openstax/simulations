define(function(require) {

    'use strict';

    var BohrModel = require('hydrogen-atom/models/atomic-model/bohr');

    var EnergyDiagramView = require('hydrogen-atom/views/energy-diagram');

    var Constants = require('constants');

    // Margins inside the drawing area
    var X_MARGIN = 20;
    var Y_MARGIN = 10;
    
    // Horizontal space between a state's line and its label
    var LINE_LABEL_SPACING = 10;

    /**
     * 
     */
    var BohrEnergyDiagramView = EnergyDiagramView.extend({

        initialize: function(options) {
            // Default values
            options = _.extend({
                numberOfStates: BohrModel.getNumberOfStates()
            }, options);

            var resolution = this.getResolution();
            this.xMargin = X_MARGIN * resolution;
            this.yMargin = Y_MARGIN * resolution;
            this.lineLabelSpacing = LINE_LABEL_SPACING * resolution;

            EnergyDiagramView.prototype.initialize.apply(this, [options]);
        },

        setAtom: function(atom) {
            this._previousState = atom.getElectronState();

            EnergyDiagramView.prototype.setAtom.apply(this, arguments);
        },

        /**
         * Updates the graph
         */
        update: function(time, deltaTime, paused) {
            if (!this.atom || this._hidden)
                return;

            if (this._previousState !== this.atom.getElectronState()) {
                this.draw();
                this._previousState = this.atom.getElectronState();
            }
        },

        drawEmptyGraph: function() {
            EnergyDiagramView.prototype.drawEmptyGraph.apply(this, arguments);

            var ctx = this.ctx;

            for (var n = 1; n <= BohrModel.getNumberOfStates(); n++)
                this.drawState(ctx, n);
        },

        drawState: function(ctx, state) {
            var x = this.getXOffset(state);
            var y = this.getYOffset(state);

            this.drawStateLine(ctx, x, y);

            // Shift the label position to the right
            x += this.stateLineLength + this.lineLabelSpacing;
            y -= 1 * this.getResolution();
            if (state === 6)
                y -= 4 * this.getResolution(); // HACK requested by Sam McKagan: for n=6, move label up a bit to prevent overlap with n=5
            else if (state === 4)
                y += 2 * this.getResolution();

            this.drawStateLabel(ctx, x, y, state);
        },

        drawData: function() {
            var ctx = this.ctx;

            var n = this.atom.getElectronState();

            // Create the new squiggle for photon absorption/emission
            if (n !== this._previousState) {
                var wavelength = 0;
                if (n > this._previousState) {
                    // a photon has been absorbed
                    wavelength = BohrModel.getWavelengthAbsorbed(this._previousState, n);
                }
                else {
                    // a photon has been emitted
                    wavelength = BohrModel.getWavelengthAbsorbed(n, this._previousState);
                }
                var x1 = this.getXOffset(this._previousState) + (this.stateLineLength / 2);
                var y1 = this.getYOffset(this._previousState);
                var x2 = this.getXOffset(n) + (this.stateLineLength / 2);
                var y2 = this.getYOffset(n);
                this.drawSquiggle(ctx, x1, y1, x2, y2, wavelength);    
            }

            // Place the electron
            var x = this.getXOffset(n) + (this.stateLineLength / 2);
            var y = this.getYOffset(n) - this.electronImage.height / 2;
            this.drawElectron(ctx, x, y);
        },

        /**
         * Gets the x-offset that corresponds to a specified state.
         * This is used for positioning both the state lines and the electron.
         */
        getXOffset: function(state) {
            return this.paddingLeft + this.xMargin;
        },
        
        /**
         * Gets the y-offset that corresponds to a specific state.
         * This is used for positioning both the state lines and the electron.
         */
        getYOffset: function(state) {
            var minE = this.getEnergy(1);
            var maxE = this.getEnergy(BohrModel.getNumberOfStates());
            var rangeE = maxE - minE;
            var height = this.getGraphHeight() - (2 * this.yMargin);
            var y = this.paddingTop + this.yMargin + (height * (maxE - this.getEnergy(state)) / rangeE);
            return y;
        }

    });


    return BohrEnergyDiagramView;
});
