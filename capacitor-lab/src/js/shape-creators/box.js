define(function (require) {

    'use strict';

    var _         = require('underscore');
    var Rectangle = require('./rectangle');
    var Vector2   = require('./vector2');
    var Vector3   = require('./vector3');
    var ModelViewTransform   = require('./model-view-transform');
    var PiecewiseCurve = require('./piecewise-curve');

    /**
     * Creates 2D projections of shapes that are related to the 3D boxes.
     *   Shapes are in the view coordinate frame, everything else is in model
     *   coordinates. Shapes for all faces corresponds to a box with its
     *   origin in the center of the top face.
     */
    var BoxShapeCreator = function(mvt) {
        this.mvt = mvt;
    };

    /**
     * Static functions
     */
    _.extend(BoxShapeCreator, {



    });

    /**
     * Instance functions
     */
    _.extend(BoxShapeCreator.prototype, {

        updateMVT: function(mvt) {
            this.mvt = mvt;

            this._p0 = new Vector2();
            this._p1 = new Vector2();
            this._p2 = new Vector2();
            this._p3 = new Vector2();
        },

        /**
         * Top faces is a parallelogram.
         * 
         *      p0 -------------- p1
         *      /                /
         *     /                /
         *   p3 --------------p2
         * 
         */
        createTopFace: function(x, y, z, width, height, depth) {
            // Calculate points
            var p0 = this._p0.set(this.mvt.modelToView(x - (width / 2), y, z + (depth / 2)));
            var p1 = this._p1.set(this.mvt.modelToView(x + (width / 2), y, z + (depth / 2)));
            var p2 = this._p2.set(this.mvt.modelToView(x + (width / 2), y, z - (depth / 2)));
            var p3 = this._p3.set(this.mvt.modelToView(x - (width / 2), y, z - (depth / 2)));

            // Create the shape
            return this.createFace(p0, p1, p2, p3);
        },

        /**
         * Same as top face, translated down y
         */
        createBottomFace: function(x, y, z, width, height, depth) {
            return this.createTopFace(x, y + height, z, width, height, depth);
        },

        /**
         * Front face is a rectangle.
         * 
         *   p0 --------------- p1
         *   |                  |
         *   |                  |
         *   p3 --------------- p2
         * 
         */
        createFrontFace: function(x, y, z, width, height, depth) {
            // Calculate points
            var p0 = this._p0.set(this.mvt.modelToView(x - (width / 2), y,          z - (depth / 2)));
            var p1 = this._p1.set(this.mvt.modelToView(x + (width / 2), y,          z - (depth / 2)));
            var p2 = this._p2.set(this.mvt.modelToView(x + (width / 2), y + height, z - (depth / 2)));
            var p3 = this._p3.set(this.mvt.modelToView(x - (width / 2), y + height, z - (depth / 2)));

            // Create the shape
            return this.createFace(p0, p1, p2, p3);
        },

        /**
         * Same as front face, translated down z
         */
        createBackFace: function(x, y, z, width, height, depth) {
            return this.createFrontFace(x, y, z + depth, width, height, depth);
        },

        /**
         * Right-side face is a parallelogram.
         *
         *         p1
         *        /|
         *       / |
         *      /  |
         *     /   |
         *    /    p2
         *   p0   /
         *   |   /
         *   |  /
         *   | /
         *   p3
         * 
         */
        createRightSideFace: function(x, y, z, width, height, depth) {
            // Calculate points
            var p0 = this._p0.set(this.mvt.modelToView(x + (width / 2), y,          z - (depth / 2)));
            var p1 = this._p1.set(this.mvt.modelToView(x + (width / 2), y,          z + (depth / 2)));
            var p2 = this._p2.set(this.mvt.modelToView(x + (width / 2), y + height, z + (depth / 2)));
            var p3 = this._p3.set(this.mvt.modelToView(x + (width / 2), y + height, z - (depth / 2)));

            // Create the shape
            return this.createFace(p0, p1, p2, p3);
        },

        /**
         * Same as right-side face, translated down -x
         */
        createLeftSideFace: function(x, y, z, width, height, depth) {
            return this.createRightSideFace(x - width, y, z, width, height, depth);
        },

        /**
         * Creates a complete box (without the hidden sides) relative
         *   to a specific origin.
         */
        createBoxShape: function(x, y, z, width, height, depth) {
            var topCurve   = this.createTopFace( x, y, z, width, height, depth );
            var frontCurve = this.createFrontFace( x, y, z, width, height, depth );
            var sideCurve  = this.createRightSideFace( x, y, z, width, height, depth );
            // Add them all to one
            topCurve.add(frontCurve);
            topCurve.add(sideCurve);
            return topCurve;
        }

    });

    return BoxShapeCreator;
});

