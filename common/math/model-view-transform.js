define(function (require) {

    'use strict';

    var _         = require('underscore');
    var Rectangle = require('rectangle-node');
    var Vector2   = require('vector2-node');
    var PiecewiseCurve = require('./piecewise-curve');

    /**
     * | m00 m01 m02 |
     * | m10 m11 m12 | = m00 * m11 - m01 * m10
     * |  0   0   1  |
     */
    var determinant = function(matrix) {
        return matrix[0] * matrix[4] - matrix[1] * matrix[3];
    };

    /**
     * From the source of java.awt.geom.AffineTransform
     */
    var inverse = function(matrix) {
        var a = matrix;
        var m00 = a[0], m01 = a[1], m02 = a[2],
            m10 = a[3], m11 = a[4], m12 = a[5];

        var det = determinant(matrix);
        if (det === 0) 
            throw 'Cannot invert this transformation matrix--zero determinant';

        var inv00, inv01, inv02,
            inv10, inv11, inv12;

        inv00 = m11 / det;
        inv10 = -m10 / det;
        inv01 = -m01 / det;
        inv11 = m00 / det;
        inv02 = (m01 * m12 - m02 * m11) / det;
        inv12 = (-m00 * m12 + m10 * m02) / det;

        return [
            inv00, inv01, inv02,
            inv10, inv11, inv12
        ];
    };

    /**
     *  Returns an array of straight integer components where
     *    the arguments can be any mix of integers and objects
     *    that have properties for x and y.
     */
    var componentsFromArguments = function(arguments, numRequired, defaultValue) {
        var i;
        var componenets = [];
        for (i = 0; i < arguments.length; i++) {
            if (i === arguments.length) {
                throw 'Invalid arguments given: ' + arguments;
            }
            else if (_.isObject(arguments[i])) {
                if ('x' in arguments[i] && 'y' in arguments[i]) {
                    components.push(arguments[i].x);
                    components.push(arguments[i].y);
                    i++;
                }
                else {
                    throw 'Invalid arguments given: ' + arguments;
                }
            }
            else {
                components.push(arguments[i]);
            }
        }
        
        if (components.length < numRequired && defaultValue !== undefined) {
            i = components.length - 1;
            while (i < numRequired) {
                components[i] = defaultValue;
                i++;
            }
        }
        
        return components;
    };

    /**
     * This is the equivalent of PhET's 
     *   phetcommon.view.graphics.transforms.ModelViewTransform,
     *   which stores a transformation for model coordinates to
     *   view coordinates and provides helper functions to
     *   perform some of those transformations.
     */
    var ModelViewTransform = function(transformationMatrix) {

        this.matrix = transformationMatrix || [
            1, 0, 0,
            0, 1, 0
        ];

        this.inverseMatrix = inverse(this.matrix);

        this._point = new Vector2();
        this._rect  = new Rectangle();
        this._point1 = new Vector2();
        this._point2 = new Vector2();
        this._point3 = new Vector2();
        this._point4 = new Vector2();
    };

    /**
     * Static functions
     */
    _.extend(ModelViewTransform, {

        /**
         * Creates a ModelViewTransform that has the specified scale 
         *   and offset such that
         *   view = model * scale + offset
         *
         * @param offset the offset in view coordinates
         * @param xScale the scale to map model to view in the x-dimension
         * @param yScale the scale to map model to view in the y-dimension
         */
        createOffsetScaleMapping: function(offset, xScale, yScale) {
            if (yScale === undefined)
                yScale = xScale;

            return new ModelViewTransform([
                xScale, 0,      offset.x,
                0,      yScale, offset.y
            ]);
        },

        /**
         * Creates a shearless ModelViewTransform that maps the 
         *   specified model point to the specified view point, 
         *   with the given x and y scales.
         *
         * @param modelPoint the reference point in the model which maps to the specified view point
         * @param viewPoint  the reference point in the view
         * @param xScale     the amount to scale in the x direction
         * @param yScale     the amount to scale in the y direction
         * @return the resultant ModelViewTransform
         */
        createSinglePointScaleMapping: function(modelPoint, viewPoint, xScale, yScale) {
            if (yScale === undefined)
                yScale = xScale;

            var xOffset = viewPoint.x - modelPoint.x * xScale;
            var yOffset = viewPoint.y - modelPoint.y * yScale;

            return ModelViewTransform.createOffsetScaleMapping(new Vector2(xOffset, yOffset), xScale, yScale);
        },

        /**
         * Creates a shearless ModelViewTransform that maps the 
         *   specified model point to the specified view point, 
         *   with the given scale factor for both x and y 
         *   dimensions, but inverting the y axis so that +y in 
         *   the model corresponds to -y in the view. Inverting 
         *   the y axis is commonly necessary since +y is usually 
         *   up in textbooks and -y is down in pixel coordinates.
         *
         * @param modelPoint the reference point in the model which maps to the specified view point
         * @param viewPoint  the reference point in the view
         * @param scale      the amount to scale in the x and y directions
         * @return the resultant ModelViewTransform
         */
        createSinglePointScaleInvertedYMapping: function(modelPoint, viewPoint, scale) {
            return ModelViewTransform.createSinglePointScaleMapping(modelPoint, viewPoint, scale, -scale);
        }

    });

    /**
     * Instance functions
     */
    _.extend(ModelViewTransform.prototype, {

        modelToView: function(coordinates) {
            if (coordinates instanceof Rectangle)
                return this.transformRectangle(coordinates);
            else if (coordinates instanceof Vector2 || ('x' in coordinates && 'y' in coordinates))
                return this.transformPoint(coordinates);
            else if (coordinates instanceof PiecewiseCurve)
                return this.transformPiecewiseCurve(coordinates);
        },

        transformPoint: function(point) {
            var tm = this.matrix;
            this._point.x = tm[0] * point.x + tm[1] * point.y + tm[2];
            this._point.y = tm[3] * point.x + tm[4] * point.y + tm[5];
            return this._point;
        },

        transformRectangle: function(rectangle) {
            // Create points for the rectangle's points and transform them
            var corner1 = this._point1;
            var corner2 = this._point2;

            corner1.set(rectangle.x, rectangle.y);
            corner2.set(rectangle.x + rectangle.w, rectangle.y + rectangle.h);

            corner1 = this.transformPoint(corner1);
            corner2 = this.transformPoint(corner2);

            return this._rect.set(
                corner1.x,
                corner1.y,
                corner2.x - corner1.x,
                corner2.y - corner1.y
            );
        },

        transformPiecewiseCurve: function(curve) {
            var clone = curve.clone();
            clone.transform(this.matrix);
            return clone;
        }

    });

    return ModelViewTransform;
});

