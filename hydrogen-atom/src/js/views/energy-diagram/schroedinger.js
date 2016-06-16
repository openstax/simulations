define(function(require) {

    'use strict';

    var _ = require('underscore');

    var SchrodingerModel = require('hydrogen-atom/models/atomic-model/schroedinger');

    var EnergyDiagramView = require('hydrogen-atom/views/energy-diagram');

    // Margins inside the drawing area
    var X_MARGIN = 10;
    var Y_TOP_MARGIN = 22;
    var Y_BOTTOM_MARGIN = 2;
    
    // Margins for "m="
    var M_X_MARGIN = 2;
    var M_Y_MARGIN = 2;
    
    // horizontal spacing between state lines
    var LINE_LINE_SPACING = 10;
    // horizontal spacing between state line and label
    var LINE_LABEL_SPACING = 8;

    /**
     * SchrodingerEnergyDiagram is the energy diagram for the Schrodinger model.
     */
    var SchroedingerEnergyDiagramView = EnergyDiagramView.extend({

        initialize: function(options) {
            // Default values
            options = _.extend({
                numberOfStates: SchrodingerModel.getNumberOfStates()
            }, options);

            var resolution = this.getResolution();
            this.xMargin = X_MARGIN * resolution;
            this.yTopMargin = Y_TOP_MARGIN * resolution;
            this.yBottomMargin = Y_BOTTOM_MARGIN * resolution;
            this.xmMargin = M_X_MARGIN * resolution;
            this.ymMargin = M_Y_MARGIN * resolution;
            this.lineLabelSpacing = LINE_LABEL_SPACING * resolution;
            this.lineLineSpacing = LINE_LINE_SPACING * resolution;

            EnergyDiagramView.prototype.initialize.apply(this, [options]);
        },

        setAtom: function(atom) {
            this._previousState = atom.getElectronState();
            this._previousSecondaryState = atom.getSecondaryElectronState();

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
                this._previousSecondaryState = this.atom.getSecondaryElectronState();
            }
        },

        drawEmptyGraph: function() {
            EnergyDiagramView.prototype.drawEmptyGraph.apply(this, arguments);

            var ctx = this.ctx;

            for (var n = 1; n <= SchrodingerModel.getNumberOfStates(); n++)
                this.drawState(ctx, n);

            ctx.fillStyle = EnergyDiagramView.STATE_LINE_COLOR;
            ctx.font = this.stateLabelFont;
            ctx.textBaseline = 'top';
            ctx.textAlign = 'right';
            ctx.fillText('\u2113=', this.paddingLeft - 20, this.paddingTop);

            ctx.textAlign = 'center';

            for (var l = 0; l < SchrodingerModel.getNumberOfStates(); l++) {
                var x = this.getXOffset(l) + this.stateLineLength / 2;
                var y = this.paddingTop;
                ctx.fillText(l, x, y);
            }
        },

        /*
         * Draws the representation for the possible electron states for 
         *   some value of the electron's primary state (n).  State n has n 
         *   possible secondary states.  Each of these possible states is 
         *   represented as a horizontal line, and the lines are arranged 
         *   horizontally.
         */
        drawState: function(ctx, state) {
            var numberOfStates = SchrodingerModel.getNumberOfStates();

            var x = this.getXOffset(0);
            var y = this.getYOffset(state);

            for (var i = 0; i < state; i++)
                this.drawStateLine(ctx, x + i * (this.stateLineLength + this.lineLineSpacing), y);

            // Shift the label position to the right
            x += (numberOfStates * this.stateLineLength) + ((numberOfStates - 1) * this.lineLineSpacing) + this.lineLabelSpacing;
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
            var l = this.atom.getSecondaryElectronState();

            // Create the new squiggle for photon absorption/emission
            if (n !== this._previousState) {
                var wavelength = 0;
                if (n > this._previousState) {
                    // a photon has been absorbed
                    wavelength = SchrodingerModel.getWavelengthAbsorbed(this._previousState, n);
                }
                else {
                    // a photon has been emitted
                    wavelength = SchrodingerModel.getWavelengthAbsorbed(n, this._previousState);
                }
                var x1 = this.getXOffset(this._previousSecondaryState) + (this.stateLineLength / 2);
                var y1 = this.getYOffset(this._previousState);
                var x2 = this.getXOffset(l) + (this.stateLineLength / 2);
                var y2 = this.getYOffset(n);
                this.drawSquiggle(ctx, x1, y1, x2, y2, wavelength);    
            }

            // Place the electron
            var x = this.getXOffset(l) + (this.stateLineLength / 2);
            var y = this.getYOffset(n) - this.electronImage.height / 2;
            this.drawElectron(ctx, x, y);
        },

        /**
         * Gets the x-offset that corresponds to a specified state.
         * Horizontal position is based on the electron's secondary state (l).
         * This is used for positioning both the state lines and the electron.
         */
        getXOffset: function(l) {
            return this.paddingLeft + this.xMargin + (l * this.stateLineLength) + (l * this.lineLineSpacing);
        },
        
        /**
         * Gets the y-offset that corresponds to a specific state.
         * This is used for positioning both the state lines and the electron.
         */
        getYOffset: function(state) {
            var minE = this.getEnergy(1);
            var maxE = this.getEnergy(SchrodingerModel.getNumberOfStates());
            var rangeE = maxE - minE;
            var height = this.getGraphHeight() - (this.yTopMargin + this.yBottomMargin);
            var y = this.paddingTop + this.yTopMargin + (height * (maxE - this.getEnergy(state)) / rangeE);
            return y;
        }

    });


    return SchroedingerEnergyDiagramView;
});
