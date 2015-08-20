define(function(require) {

    'use strict';

    var _    = require('underscore');
    var PIXI = require('pixi');

    var PixiView = require('common/pixi/view');
    var Vector2  = require('common/math/vector2');
    require('common/math/polyfills');

    var Constants = require('constants');

    /**
     * A view that represents an electron
     */
    var FieldLatticeView = PixiView.extend({

        /**
         * Initializes the new FieldLatticeView.
         */
        initialize: function(options) {
            this.mvt = options.mvt;

            this.sourceElectron   = options.sourceElectron;
            this.origin           = options.origin;
            this.width            = options.width;
            this.height           = options.height;
            this.latticeSpacingX  = options.latticeSpacingX;
            this.latticeSpacingY  = options.latticeSpacingY;

            this.firstArrowOffset = 25;
            this.singleVectorRowOffset = 0;
            this.curveStartingIndex = 1;

            this.fieldSense = FieldLatticeView.SHOW_FORCE_ON_ELECTRON;
            this.fieldDisplayType = FieldLatticeView.CURVE_WITH_VECTORS;
            this.displayStaticField = false;
            this.displayDynamicField = false;

            // Cached objects
            this._latticePointVec = new Vector2();

            this.initLattice();
            this.initGraphics();
        },

        /**
         *
         */
        initLattice: function() {
            // Lattice points for the full-field view
            this.latticePoints = [];

            // Lattice points on the x-axis
            this.latticePointsRight = [];
            this.latticePointsLeft  = [];
            this.leftArrows = [];
            this.rightArrows = [];
            this.arrows;

            this.numLatticePtsX = Math.floor(1 + (this.width  - 1) / this.latticeSpacingX);
            this.numLatticePtsY = Math.floor(1 + (this.height - 1) / this.latticeSpacingY);

            var latticeSpacingX = this.latticeSpacingX;
            var latticeSpacingY = this.latticeSpacingY;
            var numLatticePtsX = this.numLatticePtsX;
            var numLatticePtsY = this.numLatticePtsY;
            var totalLatticePoints = numLatticePtsY * numLatticePtsX;
            var origin = this.origin;
            var width = this.width;
            var x;

            // Create lattice points for full-field view
            for (var i = 0; i < totalLatticePoints; i++) {
                this.latticePoints[i] = this.createLatticePoint(
                    (i % numLatticePtsX) * latticeSpacingX, 
                    (i / numLatticePtsX) * latticeSpacingY
                );
            }

            // Create x-axis lattice points and arrows on the left
            this.latticePointsLeft.push(this.createLatticePoint(origin.x - 0.001, origin.y));

            for (x = origin.x - this.firstArrowOffset; x >= -latticeSpacingX; x -= latticeSpacingX) {
                this.latticePointsLeft.push(this.createLatticePoint(x, origin.y));
                //this.leftArrows.push(new Arrow( new Point2D.Double(), new Point2D.Double(), maxArrowHeadWidth, maxArrowHeadWidth, 3, 0.5, false ));
            }

            // Create x-axis lattice points and arrows on the right
            this.latticePointsRight.push(this.createLatticePoint(origin.x + 0.001, origin.y));

            for (x = origin.x + this.firstArrowOffset; x < width; x += latticeSpacingX) {
                this.latticePointsRight.push(this.createLatticePoint(x, origin.y));
                //this.rightArrows.push( new Arrow( new Point2D.Double(), new Point2D.Double(), maxArrowHeadWidth, maxArrowHeadWidth, 3, 0.5, false ) );
            }

            this.arrows = _.flatten(this.leftArrows, this.rightArrows);
        },

        createLatticePoint: function(x, y) {
            return {
                location: new Vector2(x, y),
                field: new Vector2()
            };
        },

        /**
         * Initializes everything for rendering graphics
         */
        initGraphics: function() {
            this.curveGraphics = new PIXI.Graphics();

            this.displayObject.addChild(this.curveGraphics);

            this.updateMVT(this.mvt);
        },

        /**
         * Updates the model-view-transform and anything that
         *   relies on it.
         */
        updateMVT: function(mvt) {
            this.mvt = mvt;

            // Redraw everything
            this.update();
        },

        update: function() {
            var i;

            switch (this.fieldDisplayType) {

                // Full field display
                case FieldLatticeView.FULL_FIELD:

                    for (i = 0; i < this.latticePoints.length; i++)
                        this.evaluateLatticePoint(this.latticePoints[i]);

                    break;

                // Single line display
                case FieldLatticeView.CURVE:
                case FieldLatticeView.CURVE_WITH_VECTORS:
                case FieldLatticeView.VECTORS_CENTERED_ON_X_AXIS:

                    // Set the field magnitudes for all the negative and positive arrows
                    for (i = 0; i < this.latticePointsLeft.length; i++)
                        this.evaluateLatticePoint(this.latticePointsLeft[i]);
                    
                    for (i = 0; i < this.latticePointsRight.length; i++)
                        this.evaluateLatticePoint(this.latticePointsRight[i]);

                    this.drawCurves(this.latticePointsLeft);
                    this.drawCurves(this.latticePointsRight);
                    // addArrows(negArrows, latticePtsNeg);
                    // addArrows(posArrows, latticePtsPos);

                    break;
            }
        },

        /**
         * Determines the field at the lattice point's location and sets its value
         */
        evaluateLatticePoint: function(latticePoint) {
            if (this.fieldDisplayType !== FieldLatticeView.NO_FIELD) {
                if (this.displayStaticField)
                    latticePoint.field.set(this.sourceElectron.getStaticFieldAt(latticePoint.location));
                else if (this.displayDynamicField)
                    latticePoint.field.set(this.sourceElectron.getDynamicFieldAt(latticePoint.location));
            }
        },

        /**
         * 
         */
        drawCurves: function(points) {
            // PhET note:
            // We modify the amplitude of the curve because it is supposed to connect the
            //  heads of the vectors onthe x axis that show the field strength, and those
            //  vectors are centered on the x axis. Their tails are not on the axis.

            var graphics = this.curveGraphics;
            graphics.clear();
            graphics.lineStyle(1, 0x000000, 1);

            var curveAmplitudeOffset = 1 - this.singleVectorRowOffset;
            var orig = points[this.curveStartingIndex];
            var xDist = orig.location.x - this.origin.x;
            var xSign = Math.sign(xDist);

            graphics.moveTo(
                orig.location.x, 
                orig.location.y + orig.field.length() * Math.sign(orig.field.y) * curveAmplitudeOffset
            );
            
            var yLast = orig.field.length() * Math.sign(orig.field.y * curveAmplitudeOffset);
            var yCurr = yLast;
            var xLimit = points[points.length - 1].location.x;
            var latticePoint = this._latticePointVec;
            var sourceElectron = this.sourceElectron;

            for (var x = orig.location.x; xSign > 0 ? x < xLimit : x > xLimit; x += 10 * xSign) {
                latticePoint.set(Math.abs(x), this.origin.y);
                var field = sourceElectron.getDynamicFieldAt(latticePoint);
                yCurr = field.length() * Math.sign(field.y);

                graphics.lineTo(x, this.origin.y + yCurr * curveAmplitudeOffset);

                yLast = yCurr;
            }

            graphics.lineTo(xLimit, this.origin.y + yCurr * xSign);
        }

    }, Constants.FieldLatticeView);


    return FieldLatticeView;
});