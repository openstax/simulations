define(function (require) {

    'use strict';

    var _              = require('underscore');
    var Rectangle      = require('rectangle-node');
    var Vector2        = require('vector2-node');

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
    };

    /**
     * Static functions
     */
    _.extend(ModelViewTransform, {

        /**
         * Creates a ModelViewTransform that has the specified 
         *   scale and offset such that
         *   view = model * scale + offset
         *
         * Can take (Vector2, Vector2)
         *       or (int, int, Vector2)
         *       or (Vector2, int, int)
         *       or (int, int, int, int)
         */
        createOffsetScaleMapping: function(xOff, yOff, xScale, yScale) {
            var components = componentsFromArguments(arguments, 4, 1);
            xOff   = components[0];
            yOff   = components[1];
            xScale = components[2];
            yScale = components[3];

            return new ModelViewTransform([
                xScale, 0,      xOff,
                0,      yScale, yOff
            ]);
        },

        /**
         * Creates a shearless ModelViewTransform that maps the specified model point to the specified view point, with the given x and y scales.
         *
         * @param modelPoint the reference point in the model which maps to the specified view point
         * @param viewPoint  the reference point in the view
         * @param xScale     the amount to scale in the x direction
         * @param yScale     the amount to scale in the y direction
         * @return the resultant ModelViewTransform
         */
        createSinglePointScaleMapping: function(modelX, modelY, viewX, viewY, xScale, yScale) {
            var components = componentsFromArguments(arguments, 6, 1);
            modelX = components[0];
            modelY = components[1];
            viewX  = components[2];
            viewY  = components[3];
            xScale = components[4];
            yScale = components[5];
        }
    });

    /**
     * Instance functions
     */
    _.extend(ModelViewTransform.prototype, {

        transformPoint: function(transformMatrix) {
            var newX;
            var newY;
            var tm = transformMatrix;
            var xPoints = this.xPoints;
            var yPoints = this.yPoints;
            for (var i = 0; i < this.index; i++) {
                newX = tm[0] * xPoints[i] + tm[1] * yPoints[i] + tm[2];
                newY = tm[3] * xPoints[i] + tm[4] * yPoints[i] + tm[5];
                xPoints[i] = newX;
                yPoints[i] = newY;
            }
            return this;
        },

        /**
         * Creates a 2D translation matrix and calls transform.
         */
        translate: function(dx, dy) {
            this._translation[2] = dx;
            this._translation[5] = dy;
            this.transform(this._translation);
            return this;
        },

        /**
         * Creates a 2D rotation matrix and calls transform.
         */
        rotate: function(theta) {
            var cos = Math.cos(theta);
            var sin = Math.sin(theta);
            this._rotation[0] = cos;
            this._rotation[1] = -sin;
            this._rotation[3] = sin;
            this._rotation[4] = cos;
            this.transform(this._rotation);
            return this;
        },

        scale: function(x, y) {
            this._scale[0] = x;
            this._scale[4] = y !== undefined ? y : x;
            this.transform(this._scale);
            return this;
        },

        /**
         * Evaluates if a rectangle intersects a path.
         */
        intersects: function(x, y, w, h) {
            if (x instanceof Rectangle) {
                h = x.h;
                w = x.w;
                y = x.y;
                x = x.x;
            }

            // Does any edge intersect?
            if (this.getAxisIntersections(x, y,     false, w) !== 0 ||
                this.getAxisIntersections(x, y + h, false, w) !== 0 ||
                this.getAxisIntersections(x + w, y, false, h) !== 0 ||
                this.getAxisIntersections(x, y,     false, h) !== 0) {
                return true;
            }

            // No intersections, is any point inside?
            if (this.getWindingNumber(x, y) !== 0)
                return true;

            return false;
        },

    });

    return ModelViewTransform;
});

