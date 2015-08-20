define(function(require) {

    'use strict';

    var _    = require('underscore');
    var PIXI = require('pixi');

    var PixiView         = require('common/pixi/view');
    var ArrowOutlineView = require('common/pixi/view/arrow-outline');
    var Colors           = require('common/colors/colors');
    var Vector2          = require('common/math/vector2');
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
            this.minX             = options.minX;
            this.maxX             = options.maxX;
            this.width            = options.maxX - options.minX;
            this.height           = options.height;
            this.latticeSpacingX  = options.latticeSpacingX;
            this.latticeSpacingY  = options.latticeSpacingY;

            this.firstArrowOffset = 25;
            this.singleVectorRowOffset = 0;
            this.curveStartingIndex = 1;

            this.fieldSense = FieldLatticeView.SHOW_FORCE_ON_ELECTRON;
            this.fieldDisplayType = FieldLatticeView.CURVE_WITH_VECTORS;
            this.displayStaticField = false;
            this.displayDynamicField = true;

            this.forceColor = Colors.parseHex(FieldLatticeView.FORCE_COLOR);
            this.fieldColor = Colors.parseHex(FieldLatticeView.FIELD_COLOR);

            // Cached objects
            this._latticePointVec = new Vector2();
            this._arrowAttrs = {};

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

            this.numLatticePtsX = 1 + Math.floor((this.width  - 1) / this.latticeSpacingX);
            this.numLatticePtsY = 1 + Math.floor((this.height - 1) / this.latticeSpacingY);

            var latticeSpacingX = this.latticeSpacingX;
            var latticeSpacingY = this.latticeSpacingY;
            var numLatticePtsX = this.numLatticePtsX;
            var numLatticePtsY = this.numLatticePtsY;
            var totalLatticePoints = numLatticePtsY * numLatticePtsX;
            var origin = this.origin;
            var width = this.width;
            var x;
            var minX = this.minX - latticeSpacingX;
            var maxX = this.maxX + latticeSpacingX;

            // Create lattice points for full-field view
            for (var i = 0; i < totalLatticePoints; i++) {
                this.latticePoints[i] = this.createLatticePoint(
                    (i % numLatticePtsX) * latticeSpacingX, 
                    (i / numLatticePtsX) * latticeSpacingY
                );
            }

            // Create x-axis lattice points and arrows on the left
            this.latticePointsLeft.push(this.createLatticePoint(origin.x - 0.001, origin.y));

            for (x = origin.x - this.firstArrowOffset; x >= minX; x -= latticeSpacingX) {
                this.latticePointsLeft.push(this.createLatticePoint(x, origin.y));
                this.leftArrows.push(this.createArrow());
            }

            // Create x-axis lattice points and arrows on the right
            this.latticePointsRight.push(this.createLatticePoint(origin.x + 0.001, origin.y));

            for (x = origin.x + this.firstArrowOffset; x < maxX; x += latticeSpacingX) {
                this.latticePointsRight.push(this.createLatticePoint(x, origin.y));
                this.rightArrows.push(this.createArrow());
            }

            this.arrows = _.flatten(this.leftArrows, this.rightArrows);
        },

        createLatticePoint: function(x, y) {
            return {
                location: new Vector2(x, y),
                field: new Vector2()
            };
        },

        createArrow: function() {
            var arrowViewModel = new ArrowOutlineView.ArrowViewModel();

            var arrowView = new ArrowOutlineView({
                model: arrowViewModel,
                tailWidth: FieldLatticeView.ARROW_TAIL_WIDTH,
                headWidth: FieldLatticeView.ARROW_HEAD_WIDTH,
                headLength: FieldLatticeView.ARROW_HEAD_LENGTH,
                lineColor: this.forceColor
            });

            this.displayObject.addChild(arrowView.displayObject);

            return arrowViewModel;
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

                    var color = (this.displayDynamicField) ? this.forceColor : this.fieldColor;
                    var graphics = this.curveGraphics;
                    graphics.clear();
                    graphics.lineStyle(1, color, 1);

                    this.drawCurves(this.latticePointsLeft);
                    this.drawCurves(this.latticePointsRight);
                    this.updateArrows(this.leftArrows,  this.latticePointsLeft);
                    this.updateArrows(this.rightArrows, this.latticePointsRight);

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
         * Draws curve between the points specified. Note that the function doesn't
         *   actually use the field vector values in these points except for at the
         *   beginning of the line; it calculates the values on its own when it's
         *   about to draw because it draws way more points than are given in the
         *   points array.
         */
        drawCurves: function(points) {
            // PhET note:
            // We modify the amplitude of the curve because it is supposed to connect the
            //  heads of the vectors onthe x axis that show the field strength, and those
            //  vectors are centered on the x axis. Their tails are not on the axis.

            var graphics = this.curveGraphics;

            var curveAmplitudeOffset = 1 - this.singleVectorRowOffset;
            var orig = points[this.curveStartingIndex];
            var xDist = orig.location.x - this.origin.x;
            var xSign = Math.sign(xDist);

            graphics.moveTo(
                this.mvt.modelToViewX(orig.location.x), 
                this.mvt.modelToViewY(orig.location.y + orig.field.length() * Math.sign(orig.field.y) * curveAmplitudeOffset)
            );
            
            var yLast = orig.field.length() * Math.sign(orig.field.y * curveAmplitudeOffset);
            var yCurr = yLast;
            var xLimit = points[points.length - 1].location.x;
            var latticePoint = this._latticePointVec;
            var sourceElectron = this.sourceElectron;

            for (var x = orig.location.x; xSign > 0 ? x <= xLimit : x >= xLimit; x += 10 * xSign) {
                latticePoint.set(Math.abs(x), this.origin.y);
                var field = sourceElectron.getDynamicFieldAt(latticePoint);
                yCurr = field.length() * Math.sign(field.y);

                graphics.lineTo(
                    this.mvt.modelToViewX(x), 
                    this.mvt.modelToViewY(this.origin.y + yCurr * curveAmplitudeOffset)
                );

                yLast = yCurr;
            }
        },

        updateArrows: function(arrows, points) {
            var attrs = this._arrowAttrs;
            // We do not draw an arrow for the first lattice point because it is very close
            //   to the antenna.
            for (var i = 1; i < points.length; i++) {
                var latticePoint = points[i];
                var arrowDir = Math.sign(latticePoint.field.y) * (this.fieldSense === FieldLatticeView.SHOW_FORCE_ON_ELECTRON ? 1 : -1);
                var magnitude = latticePoint.field.length();
                var y = latticePoint.location.y + magnitude * arrowDir;
                y -= magnitude * arrowDir * this.singleVectorRowOffset;

                attrs.originX = this.mvt.modelToViewX(latticePoint.location.x);
                attrs.originY = this.mvt.modelToViewY(latticePoint.location.y - magnitude * arrowDir * this.singleVectorRowOffset);
                attrs.targetX = this.mvt.modelToViewX(latticePoint.location.x);
                attrs.targetY = this.mvt.modelToViewY(y);

                arrows[i - 1].set(attrs);
            }
        }

    }, Constants.FieldLatticeView);


    return FieldLatticeView;
});