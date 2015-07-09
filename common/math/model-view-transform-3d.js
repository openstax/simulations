define(function (require) {

    'use strict';

    var _         = require('underscore');
    var Rectangle = require('./rectangle');
    var Vector2   = require('./vector2');
    var Vector3   = require('./vector3');
    var ModelViewTransform   = require('./model-view-transform');
    var PiecewiseCurve = require('./piecewise-curve');

    /**
     * This is a 3D version of the model-view transform.  It does not
     *   support offsetting on the z-axis.  It maintains all the same
     *   functionality in the xy plane as the 2D model-view transform
     *   class but adds another dimension using simply orthographic
     *   projection.
     *
     * It is modeled after PhET's CLModelViewTransform3D (in Capacitor
     *   Lab).  Here are the original notes about the class:
     *
     *     Provides the transforms between model and view 3D-coordinate
     *     systems. In both coordinate systems, +x is to the right, +y
     *     is down, +z is away from the viewer. Sign of rotation angles
     *     is specified using the right-hand rule.
     * 
     *     +y
     *     ^    +z
     *     |   /
     *     |  /
     *     | /
     *     +-------> +x
     * 
     */
    var ModelViewTransform3D = function(mvt2D, scale, pitch, yaw) {

        this.mvt2D = mvt2D;

        this.pitch = pitch;
        this.yaw = yaw;

        // Cached objects for recycling
        this._modelToViewPoint2D = new Vector2();
        this._deltaPoint2D = new Vector2();
        this._point3D = new Vector3();
        this._viewToModel2D = new Vector2();
        this._viewToModel3D = new Vector3();

        // Origins of model and view for making delta calculations
        this.modelOrigin = this.modelToView(0, 0, 0).clone();
        this.viewOrigin  = this.viewToModel(0, 0).clone();
    };

    /**
     * Static functions
     */
    _.extend(ModelViewTransform3D, {

        /**
         * Creates a ModelViewTransform3D that has the specified scale 
         *   and offset such that
         *   view = model * scale + offset
         */
        createOffsetScaleMapping: function(offset, xScale, yScale, pitch, yaw) {
            var mvt2D = ModelViewTransform.createOffsetScaleMapping(offset, xScale, yScale);
            return new ModelViewTransform3D(mvt2D, xScale, pitch, yaw);
        },

        /**
         * Creates a shearless ModelViewTransform3D that maps the 
         *   specified model point to the specified view point, 
         *   with the given x and y scales.
         */
        createSinglePointScaleMapping: function(modelPoint, viewPoint, xScale, yScale, pitch, yaw) {
            var mvt2D = ModelViewTransform.createSinglePointScaleMapping(modelPoint, viewPoint, xScale, yScale);
            return new ModelViewTransform3D(mvt2D, xScale, pitch, yaw);
        },

        /**
         * Creates a shearless ModelViewTransform3D that maps the 
         *   specified model point to the specified view point, 
         *   with the given scale factor for both x and y 
         *   dimensions, but inverting the y axis so that +y in 
         *   the model corresponds to -y in the view. Inverting 
         *   the y axis is commonly necessary since +y is usually 
         *   up in textbooks and -y is down in pixel coordinates.
         */
        createSinglePointScaleInvertedYMapping: function(modelPoint, viewPoint, scale, pitch, yaw) {
            var mvt2D = ModelViewTransform.createSinglePointScaleInvertedYMapping(modelPoint, viewPoint, scale);
            return new ModelViewTransform3D(mvt2D, scale, pitch, yaw);
        }

    });

    /**
     * Instance functions
     */
    _.extend(ModelViewTransform3D.prototype, {

        /*************************************************************************
         **                                                                     **
         **                            Model to View                            **
         **                                                                     **
         *************************************************************************/

        /**
         * Maps 3D model coordinates to 2D view coordinates.
         */
        modelToView: function(x, y, z) {
            if (x instanceof Rectangle || x instanceof PiecewiseCurve) {
                // The original CLModelViewTransform3D doesn't bother transforming 2D
                //   shapes in the z dimension, so neither will I.  They just assume
                //   all shapes are on the xy plane because they have no depth.

                return this.mvt2D.modelToView(x);
            }
            else {
                // Points we do want to project in the z dimension

                if (x instanceof Vector3 || (_.isObject(x) && 'x' in x && 'y' in x && 'z' in x)) {
                    z = x.z;
                    y = x.y;
                    x = x.x;
                }

                this._modelToViewPoint2D.x = x + (z * Math.sin(this.pitch) * Math.cos(this.yaw));
                this._modelToViewPoint2D.y = y + (z * Math.sin(this.pitch) * Math.sin(this.yaw));

                return this.mvt2D.modelToView(this._modelToViewPoint2D);
            }
        },

        /**
         * Maps relative distances (delta) from 3D model space to 2D view space.
         *   Takes a Vector3 object.
         */
        modelToViewDelta: function(coordinates) {
            if (coordinates instanceof Rectangle || coordinates instanceof PiecewiseCurve)
                throw 'modelToViewDelta cannot convert shapes.';

            var viewPoint = this.modelToView(coordinates);
            this._deltaPoint2D.x = point.x - this.modelOrigin.x;
            this._deltaPoint2D.y = point.y - this.modelOrigin.y;
            return this._deltaPoint2D;
        },

        /**
         * For things like bounds that we want to only transform
         *   by the scale. Works the same as modelToViewDelta but
         *   has a different name so its function is clearer.
         */
        modelToViewScale: function(coordinates) {
            return this.modelToViewDelta(coordinates);
        },

        modelToViewX: function(x) {
            return this.modelToView(this._point3D.set(x, 0, 0)).x;
        },

        modelToViewY: function(y) {
            return this.modelToView(this._point3D.set(0, y, 0)).y;
        },

        modelToViewZ: function(z) {
            return this.modelToView(this._point3D.set(0, 0, z)).z;
        },

        modelToViewDeltaX: function(x) {
            return this.modelToViewDelta(this._point3D.set(x, 0, 0)).x;
        },

        modelToViewDeltaY: function(y) {
            return this.modelToViewDelta(this._point3D.set(0, y, 0)).y;
        },

        modelToViewDeltaZ: function(z) {
            return this.modelToViewDelta(this._point3D.set(0, 0, z)).z;
        },

        /*************************************************************************
         **                                                                     **
         **                            View to Model                            **
         **                                                                     **
         *************************************************************************/

         /**
          * Maps a point from 2D view coordinates to 3D model coordinates.
          *   The z coordinate will be zero.
          */
        viewToModel: function(x, y) {
            if (x instanceof Rectangle || x instanceof PiecewiseCurve) {
                // These shapes are supposed to be 2D anyway, so we don't 
                //   need to do any special mapping to 3D space.
                return this.mvt2D.viewToModel(x);
            }
            else {
                // If it's a point, we do want to map it into 3D space,
                //   but to do this we're simply making z equal 0.
                if (_.isNumber(x))
                    this._viewToModel2D.set(x, y)
                else
                    this._viewToModel2D.set(x);
                
                var modelPoint = this.mvt2D.viewToModel(this._viewToModel2D);
                return this._viewToModel3D.set(modelPoint.x, modelPoint.y, 0);
            }
        },

        /**
         * Maps a delta from 2D view coordinates to 3D model coordinates.
         *   The z coordinate will be zero.  Assumes coordinates are just
         *   a point and not a 2D shape.
         */
        viewToModelDelta: function(coordinates) {
            if (x instanceof Rectangle || x instanceof PiecewiseCurve)
                throw 'modelToViewDelta cannot convert shapes.';

            var viewPoint = this.viewToModel(coordinates);
            this._deltaPoint2D.x = point.x - this.viewOrigin.x;
            this._deltaPoint2D.y = point.y - this.viewOrigin.y;
            return this._deltaPoint2D;
        },

        viewToModelScale: function(coordinates) {
            return this.viewToModelDelta(this.coordinates);
        },

        viewToModelX: function(x) {
            return this.viewToModel(this._point3D.set(x, 0, 0)).x;
        },

        viewToModelY: function(y) {
            return this.viewToModel(this._point3D.set(0, y, 0)).y;
        },

        viewToModelZ: function(z) {
            return this.viewToModel(this._point3D.set(0, 0, z)).z;
        },

        viewToModelDeltaX: function(x) {
            return this.viewToModelDelta(this._point3D.set(x, 0, 0)).x;
        },

        viewToModelDeltaY: function(y) {
            return this.viewToModelDelta(this._point3D.set(0, y, 0)).y;
        },

        viewToModelDeltaZ: function(z) {
            return this.viewToModelDelta(this._point3D.set(0, 0, z)).z;
        }

    });

    return ModelViewTransform3D;
});

