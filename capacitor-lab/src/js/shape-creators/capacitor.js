define(function (require) {

    'use strict';

    var _ = require('underscore');

    var Rectangle      = require('common/math/rectangle');
    var Vector2        = require('common/math/vector2');
    var Vector3        = require('common/math/vector3');
    var PiecewiseCurve = require('common/math/piecewise-curve');

    var BoxShapeCreator = require('shape-creators/box');

    var deprecationMessage = 'You don\'t need this. Find a better way of doing what you\'re trying to do.';

    /**
     * Creates 2D projections of shapes that are related to the 3D capacitor
     *   model. Shapes are in the global view coordinate frame.  It creates
     *   the unoccluded shapes that are drawn in the scene, but it also needs
     *   to create occluded shapes like the original PhET version to be used
     *   in detecting which object a 2D point lies in (for determining where
     *   the tip of a probe is for the meter tools).  
     *
     *  Note: Instead of using Java's Constructive Area Geometry to determine
     *   these occluded shapes by area subtraction, I will just use arithmetic
     *   to find the points in the polygon of the occluded shape and create
     *   the polygon (PiecewiseCurve) by hand.  This is not as intuitive to
     *   read, but it will be runtime efficient and not require me to recreate
     *   a huge Java library in JavaScript.
     *                                                      - Patrick Wolfert
     */
    var CapacitorShapeCreator = function(capacitor, mvt) {
        BoxShapeCreator.apply(this, [mvt]);

        this.capacitor = capacitor;

        // Points before transforming to view
        this._m0 = new Vector3();
        this._m1 = new Vector3();
        this._m2 = new Vector3();
        this._m3 = new Vector3();
        this._m4 = new Vector3();
        this._m5 = new Vector3();

        this._p4 = new Vector2();
        this._p5 = new Vector2();
    };

    /**
     * Instance functions
     */
    _.extend(CapacitorShapeCreator.prototype, BoxShapeCreator.prototype, {

        //----------------------------------------------------------------------------------------
        // Unoccluded shapes
        //----------------------------------------------------------------------------------------

        createTopPlateShape: function() {
            var pos = this.capacitor.get('position');
            return this.createBoxShape(
                pos.x, 
                this.capacitor.getTopPlateCenter().y, 
                pos.z, 
                this.capacitor.get('plateWidth'), 
                this.capacitor.get('plateHeight'), 
                this.capacitor.get('plateDepth')
            );
        },

        createBottomPlateShape: function() {
            var pos = this.capacitor.get('position');
            return this.createBoxShape(
                pos.x, 
                this.capacitor.getBottomPlateCenter().y - this.capacitor.get('plateHeight'), 
                pos.z, 
                this.capacitor.get('plateWidth'), 
                this.capacitor.get('plateHeight'), 
                this.capacitor.get('plateDepth')
            );
        },

        createDielectricShape: function() {
            var pos = this.capacitor.get('position');
            return this.createBoxShape(
                pos.x + this.capacitor.get('dielectricOffset'), 
                pos.y - this.capacitor.getDielectricHeight() / 2, 
                pos.z, 
                this.capacitor.getDielectricWidth(), 
                this.capacitor.getDielectricHeight(), 
                this.capacitor.getDielectricDepth()
            );
        },

        createAirBetweenPlateShape: function() {
            var pos        = this.capacitor.get('position');
            var plateWidth = this.capacitor.get('plateWidth');
            var airWidth   = this.capacitor.get('dielectricOffset');

            return this.createBoxShape(
                pos.x - (plateWidth / 2) + (airWidth / 2), 
                pos.y - this.capacitor.getDielectricHeight() / 2, 
                pos.z, 
                airWidth, 
                this.capacitor.getDielectricHeight(), 
                this.capacitor.get('plateDepth')
            );
        },

        //----------------------------------------------------------------------------------------
        // Occluded shapes
        //----------------------------------------------------------------------------------------

        /**
         * Creates the visible portion of the top plate.  Nothing actually
         *   occludes the top plate.
         */
        createTopPlateShapeOccluded: function() {
            return this.createTopPlateShape();
        },

        /**
         * Creates the visible portion of the bottom plate.  This may be
         *   partially occluded by the top plate.
         */
        createBottomPlateShapeOccluded: function() {
            //return ShapeUtils.subtract( createBottomPlateShape(), createTopPlateShape() );
            throw deprecationMessage;
        },

        /**
         * Creates the visible portion of the dielectric between the plates,
         *   which is partially occluded by the top plate. If it's not between
         *   the plates at all, it will return an empty PiecewiseCurve.
         *    
         *             p1
         *            /|
         *           / |
         *          /  |
         *         /   |
         *        /    p2
         *  p5---p0   /
         *  |        /
         *  |       /
         *  |      /
         *  p4---p3
         *
         */
        createDielectricBetweenPlatesShapeOccluded: function() {
            var plateWidth  = this.capacitor.get('plateWidth');
            var dielectricOffset = this.capacitor.get('dielectricOffset');
            var dielectricOverlap = plateWidth - dielectricOffset;

            // If the dielectric isn't between the plates at all, just
            //   return an empty curve.
            if (dielectricOverlap <= 0)
                return new PiecewiseCurve();

            return this.createSpaceBetweenPlatesShapeOccluded(dielectricOverlap)
        },


        /**
         * I've deprecated this function.  Anything we're trying to do with
         *   this function we should be able to do with the non-occluded
         *   version, which is much simpler.  Right now it's only being used
         *   for hit detection (finding out if the meter probe is in this
         *   area).  Instead of making a complicated shape where the top
         *   plate occludes it, we can just detect a hit on the top plate
         *   first and don't let it go down to the air gap if the point lies
         *   within the top plate's area.
         */
        createAirBetweenPlatesShapeOccluded: function() {
            throw deprecationMessage;
        },

        /**
         * Creates the visible space between between the plates, occluded by
         *   the top plate.  The distanceFromEdge parameter is how far in
         *   from the right edge we are drawing, according to the following
         *   diagram where [w] is the distanceFromEdge.
         *    
         *               p1
         *              /|
         *             / |
         *            /  |
         *           /   |
         *      w   /    p2
         *  p5-----p0   /
         *  |          /
         *  |         /
         *  |   w    /
         *  p4-----p3
         *
         */
        createSpaceBetweenPlatesShapeOccluded: function(distanceFromEdge) {
            var x = this.capacitor.get('position').x;
            var y = this.capacitor.get('position').y;
            var z = this.capacitor.get('position').z;
            var plateWidth  = this.capacitor.get('plateWidth');
            var plateHeight = this.capacitor.get('plateHeight');
            var plateDepth  = this.capacitor.get('plateDepth');
            var plateSeparation = this.capacitor.get('plateSeparation');

            // 3D model-space points (before MVT)
            var m0 = this._m0;
            var m1 = this._m1;
            var m2 = this._m2;
            var m3 = this._m3;
            var m4 = this._m4;
            var m5 = this._m5;

            m0.set(x + (plateWidth / 2),    y + plateHeight,        z + (plateDepth / 2));
            m1.set(x + (plateWidth / 2),    y + plateHeight,        z - (plateDepth / 2));
            m2.set(m1.x,                    m1.y + plateSeparation, m1.z);
            m3.set(m2.x,                    m2.y,                   m0.z);
            m4.set(m3.x - distanceFromEdge, m3.y,                   m3.z);
            m5.set(m0.x - distanceFromEdge, m0.y,                   m0.z);

            // 2D view points (after MVT)
            var p0 = this._p0.set(this.mvt.modelToView(m0));
            var p1 = this._p1.set(this.mvt.modelToView(m1));
            var p2 = this._p2.set(this.mvt.modelToView(m2));
            var p3 = this._p3.set(this.mvt.modelToView(m3));
            var p4 = this._p4.set(this.mvt.modelToView(m4));
            var p5 = this._p5.set(this.mvt.modelToView(m5));
        },

        //----------------------------------------------------------------------------------------
        // Draw shaded boxes
        //----------------------------------------------------------------------------------------

        drawTopPlateShape: function(graphics, baseFillColor, fillAlpha) {
            var pos = this.capacitor.get('position');
            return this.drawBoxShape(
                graphics,
                baseFillColor,
                fillAlpha,
                pos.x, 
                this.capacitor.getTopPlateCenter().y, 
                pos.z, 
                this.capacitor.get('plateWidth'), 
                this.capacitor.get('plateHeight'), 
                this.capacitor.get('plateDepth')
            );
        },

        drawBottomPlateShape: function(graphics, baseFillColor, fillAlpha) {
            var pos = this.capacitor.get('position');
            return this.drawBoxShape(
                graphics,
                baseFillColor,
                fillAlpha,
                pos.x, 
                this.capacitor.getBottomPlateCenter().y - this.capacitor.get('plateHeight'), 
                pos.z, 
                this.capacitor.get('plateWidth'), 
                this.capacitor.get('plateHeight'), 
                this.capacitor.get('plateDepth')
            );
        },

        drawDielectricShape: function(graphics, baseFillColor, fillAlpha) {
            var pos = this.capacitor.get('position');
            return this.drawBoxShape(
                graphics,
                baseFillColor,
                fillAlpha,
                pos.x + this.capacitor.get('dielectricOffset'), 
                pos.y - this.capacitor.getDielectricHeight() / 2, 
                pos.z, 
                this.capacitor.getDielectricWidth(), 
                this.capacitor.getDielectricHeight(), 
                this.capacitor.getDielectricDepth()
            );
        },

        outlineTopPlateShape: function(graphics, outlineWidth, outlineColor, outlineAlpha) {
            var pos = this.capacitor.get('position');
            return this.outlineBoxShape(
                graphics,
                outlineWidth, 
                outlineColor,
                outlineAlpha,
                pos.x, 
                this.capacitor.getTopPlateCenter().y, 
                pos.z, 
                this.capacitor.get('plateWidth'), 
                this.capacitor.get('plateHeight'), 
                this.capacitor.get('plateDepth')
            );
        },

        outlineBottomPlateShape: function(graphics, outlineWidth, outlineColor, outlineAlpha) {
            var pos = this.capacitor.get('position');
            return this.outlineBoxShape(
                graphics,
                outlineWidth, 
                outlineColor,
                outlineAlpha,
                pos.x, 
                this.capacitor.getBottomPlateCenter().y - this.capacitor.get('plateHeight'),  
                pos.z, 
                this.capacitor.get('plateWidth'), 
                this.capacitor.get('plateHeight'), 
                this.capacitor.get('plateDepth')
            );
        },

        outlineDielectricShape: function(graphics, outlineWidth, outlineColor, outlineAlpha) {
            var pos = this.capacitor.get('position');
            return this.outlineBoxShape(
                graphics,
                outlineWidth, 
                outlineColor,
                outlineAlpha,
                pos.x + this.capacitor.get('dielectricOffset'), 
                pos.y - this.capacitor.getDielectricHeight() / 2, 
                pos.z, 
                this.capacitor.getDielectricWidth(), 
                this.capacitor.getDielectricHeight(), 
                this.capacitor.getDielectricDepth()
            );
        },

    });

    return CapacitorShapeCreator;
});

