define(function(require) {

    'use strict';

    var PIXI = require('pixi');
    
    var PixiView  = require('common/pixi/view');
    var Colors    = require('common/colors/colors');
    var Vector2  = require('common/math/vector2');

    var Constants = require('constants');

    /**
     * An equipotential plot (or a contour plot) draws a curve connecting
     *   every point where the value is the same--where in this case the
     *   voltage is the same.  For example, if the voltage tool were over
     *   a spot near a single positive charge where the voltage was 12 V, 
     *   and the user pressed the plot button to create an equipotential
     *   plot, a ring would be drawn around the positive charge showing 
     *   every point where the voltage is 12 V around it.
     *
     * The draw function here is based off of the GUI.traceV function in
     *   the original flash sim.
     */
    var EquipotentialPlot = PixiView.extend({

        /**
         * Overrides PixiView's initializeDisplayObject function
         */
        initializeDisplayObject: function() {
            this.displayObject = new PIXI.Graphics();
        },

        initialize: function(options) {
            options = _.extend({
                x: 0,
                y: 0
            }, options);

            this.simulation = options.simulation;
            this.x = options.x;
            this.y = options.y;

            // Set the initial MVT and draw
            this.updateMVT(options.mvt);
        },

        /**
         * This function assumes the simulation has charges.  If the 
         *   simulation does not have charges, we shouldn't be creating
         *   an equipotential plot.
         */
        draw: function() {
            var graphics = this.displayObject;
            var simulation = this.simulation;
            var mvt = this.mvt;

            var mx = this.mvt.viewToModelX(this.x);
            var my = this.mvt.viewToModelY(this.y);
            var voltage = simulation.getV(mx, my);

            var width = this.mvt.modelToViewDeltaX(simulation.get('width'));
            var height = Math.abs(this.mvt.modelToViewDeltaY(simulation.get('height')));

            graphics.lineStyle(1, 0x000000, 1);

            var delSA = 0.1;          // Step length along equipotential in meters
            var delSB = 0.1;
            var VFAC = Constants.VFAC; // Voltage conversion factor
            var tic = 0;

            var currXA = mx; // A path is clockwise movement along equipotential
            var currYA = my;
            var currXB = mx; // B path is counterclockwise movement along equipot.
            var currYB = my;

            var distSq = 0;

            var nextA;
            var nextB;
            var nextXA;
            var nextYA;
            var nextXB;
            var nextYB;

            var readyToBreak = false;


            while (tic < 500 && 
                Math.abs(currXA) < 1000 && 
                Math.abs(currYA) < 1000 && 
                Math.abs(currXB) < 1000 && 
                Math.abs(currYB) < 1000
            ) {
                // Get the next points in both directions
                nextA = simulation.getNextEqualVoltagePoint(voltage, currXA, currYA,  delSA);
                nextXA = nextA.x;
                nextYA = nextA.y;

                nextB = simulation.getNextEqualVoltagePoint(voltage, currXB, currYB, -delSB);
                nextXB = nextB.x;
                nextYB = nextB.y;

                // Draw it
                graphics.moveTo(mvt.modelToViewX(currXA), mvt.modelToViewY(currYA));
                graphics.lineTo(mvt.modelToViewX(nextXA), mvt.modelToViewY(nextYA));

                graphics.moveTo(mvt.modelToViewX(currXB), mvt.modelToViewY(currYB));
                graphics.lineTo(mvt.modelToViewX(nextXB), mvt.modelToViewY(nextYB));

                if (readyToBreak) 
                    break;

                distSq = (nextXA - nextXB) * (nextXA - nextXB) + (nextYA - nextYB) * (nextYA - nextYB);

                // If A and B lines meet up, make one more pass through drawing loop to close up curve
                // if (distSq < (delSA * delSA + delSB * delSB) / 3)
                //     readyToBreak = true; 

                currXA = nextXA;
                currYA = nextYA;
                currXB = nextXB;
                currYB = nextYB;

                console.log(currXA, currYA);
                tic++;
            }
        },

        updateMVT: function(mvt) {
            this.mvt = mvt;

            this.draw();
        }

    });

    return EquipotentialPlot;
});