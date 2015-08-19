define(function(require) {

    'use strict';

    var _    = require('underscore');
    var PIXI = require('pixi');

    var PixiView = require('common/pixi/view');
    var Vector2  = require('common/math/vector2');

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

            this.fieldSense = FieldLatticeView.SHOW_FORCE_ON_ELECTRON;
            


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

            this.numLatticePtsX = Math.floor(1 + (width  - 1) / this.latticeSpacingX);
            this.numLatticePtsY = Math.floor(1 + (height - 1) / this.latticeSpacingY);

            var latticeSpacingX = this.latticeSpacingX;
            var latticeSpacingY = this.latticeSpacingY;

            var numLatticePtsX = this.numLatticePtsX;
            var numLatticePtsY = this.numLatticePtsY;
            var totalLatticePoints = numLatticePtsY * numLatticePtsX;
            var x;

            // Create lattice points for full-field view
            for (var i = 0; i < totalLatticePoints; i++) {
                this.latticePoints[i] = this.createLatticePoint(
                    (i % numLatticePtsX) * latticeSpacingX, 
                    (i / numLatticePtsX) * latticeSpacingY
                );
            }

            // Create x-axis lattice points and arrows on the left
            this.latticePointsLeft.push(this.createLatticePoint(origin.x - 0.001, origin.));

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

        /**
         * Initializes everything for rendering graphics
         */
        initGraphics: function() {
            

            this.updateMVT(this.mvt);
        },

        /**
         * Updates the model-view-transform and anything that
         *   relies on it.
         */
        updateMVT: function(mvt) {
            this.mvt = mvt;

            // Redraw everything
        },

        update: function(time, deltaTime) {

        },

        createLatticePoint: function(x, y) {
            return {
                location: new Vector2(x, y),
                field: new Vector2()
            };
        }

    }, Constants.FieldLatticeView);


    return FieldLatticeView;
});