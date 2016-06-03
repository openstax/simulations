define(function (require) {

    'use strict';

    var _ = require('underscore');

    /**
     * Matrix3D is a fairly conventional 3D matrix that can transform sets of
     * 3D points and perform a variety of manipulations on the transform.
     * 
     * This code was distributed with JDK 1.4.2 as class Matrix3D, 
     * in the Wireframe example applet.
     */
    var Matrix3D = function() {
        this.unit();
    };

    _.extend(Matrix3D.prototype, {

        /**
         * Scale by specified factor in all dimensions
         */
        scale: function(scale) {
            xx *= scale;
            xy *= scale;
            xz *= scale;
            xo *= scale;
            yx *= scale;
            yy *= scale;
            yz *= scale;
            yo *= scale;
            zx *= scale;
            zy *= scale;
            zz *= scale;
            zo *= scale;
        },

        /**
         * Scale along each axis independently
         */
        scale: function(x, y, z) {
            this.xx *= x;
            this.xy *= x;
            this.xz *= x;
            this.xo *= x;
            this.yx *= y;
            this.yy *= y;
            this.yz *= y;
            this.yo *= y;
            this.zx *= z;
            this.zy *= z;
            this.zz *= z;
            this.zo *= z;
        },

        /**
         * Translate the origin
         */
        translate: function(x, y, z) {
            this.xo += x;
            this.yo += y;
            this.zo += z;
        },

        /**
         * rotate theta degrees about the y axis
         */
        yrot: function(theta) {
            theta *= (Math.PI / 180);
            var ct = Math.cos(theta);
            var st = Math.sin(theta);

            var Nxx = this.xx * ct + this.zx * st;
            var Nxy = this.xy * ct + this.zy * st;
            var Nxz = this.xz * ct + this.zz * st;
            var Nxo = this.xo * ct + this.zo * st;

            var Nzx = this.zx * ct - this.xx * st;
            var Nzy = this.zy * ct - this.xy * st;
            var Nzz = this.zz * ct - this.xz * st;
            var Nzo = this.zo * ct - this.xo * st;

            this.xo = Nxo;
            this.xx = Nxx;
            this.xy = Nxy;
            this.xz = Nxz;
            this.zo = Nzo;
            this.zx = Nzx;
            this.zy = Nzy;
            this.zz = Nzz;
        },

        /**
         * rotate theta degrees about the x axis
         */
        xrot: function(theta) {
            theta *= (Math.PI / 180);
            var ct = Math.cos(theta);
            var st = Math.sin(theta);

            var Nyx = this.yx * ct + this.zx * st;
            var Nyy = this.yy * ct + this.zy * st;
            var Nyz = this.yz * ct + this.zz * st;
            var Nyo = this.yo * ct + this.zo * st;

            var Nzx = this.zx * ct - this.yx * st;
            var Nzy = this.zy * ct - this.yy * st;
            var Nzz = this.zz * ct - this.yz * st;
            var Nzo = this.zo * ct - this.yo * st;

            this.yo = Nyo;
            this.yx = Nyx;
            this.yy = Nyy;
            this.yz = Nyz;
            this.zo = Nzo;
            this.zx = Nzx;
            this.zy = Nzy;
            this.zz = Nzz;
        },

        /**
         * rotate theta degrees about the z axis
         */
        zrot: function(theta) {
            theta *= (Math.PI / 180);
            var ct = Math.cos(theta);
            var st = Math.sin(theta);

            var Nyx = this.yx * ct + this.xx * st;
            var Nyy = this.yy * ct + this.xy * st;
            var Nyz = this.yz * ct + this.xz * st;
            var Nyo = this.yo * ct + this.xo * st;

            var Nxx = this.xx * ct - this.yx * st;
            var Nxy = this.xy * ct - this.yy * st;
            var Nxz = this.xz * ct - this.yz * st;
            var Nxo = this.xo * ct - this.yo * st;

            this.yo = Nyo;
            this.yx = Nyx;
            this.yy = Nyy;
            this.yz = Nyz;
            this.xo = Nxo;
            this.xx = Nxx;
            this.xy = Nxy;
            this.xz = Nxz;
        },

        /**
         * Multiply this matrix by a second: M = M*R
         */
        mult: function(rhs) {
            var lxx = this.xx * rhs.xx + this.yx * rhs.xy + this.zx * rhs.xz;
            var lxy = this.xy * rhs.xx + this.yy * rhs.xy + this.zy * rhs.xz;
            var lxz = this.xz * rhs.xx + this.yz * rhs.xy + this.zz * rhs.xz;
            var lxo = this.xo * rhs.xx + this.yo * rhs.xy + this.zo * rhs.xz + rhs.xo;

            var lyx = this.xx * rhs.yx + this.yx * rhs.yy + this.zx * rhs.yz;
            var lyy = this.xy * rhs.yx + this.yy * rhs.yy + this.zy * rhs.yz;
            var lyz = this.xz * rhs.yx + this.yz * rhs.yy + this.zz * rhs.yz;
            var lyo = this.xo * rhs.yx + this.yo * rhs.yy + this.zo * rhs.yz + rhs.yo;

            var lzx = this.xx * rhs.zx + this.yx * rhs.zy + this.zx * rhs.zz;
            var lzy = this.xy * rhs.zx + this.yy * rhs.zy + this.zy * rhs.zz;
            var lzz = this.xz * rhs.zx + this.yz * rhs.zy + this.zz * rhs.zz;
            var lzo = this.xo * rhs.zx + this.yo * rhs.zy + this.zo * rhs.zz + rhs.zo;

            this.xx = lxx;
            this.xy = lxy;
            this.xz = lxz;
            this.xo = lxo;

            this.yx = lyx;
            this.yy = lyy;
            this.yz = lyz;
            this.yo = lyo;

            this.zx = lzx;
            this.zy = lzy;
            this.zz = lzz;
            this.zo = lzo;
        },

        /**
         * Reinitialize to the unit matrix
         */
        unit: function() {
            this.xo = 0;
            this.xx = 1;
            this.xy = 0;
            this.xz = 0;
            this.yo = 0;
            this.yx = 0;
            this.yy = 1;
            this.yz = 0;
            this.zo = 0;
            this.zx = 0;
            this.zy = 0;
            this.zz = 1;
        },

        /**
         * Transform nvert points from v into tv.  v contains the input
         * coordinates in floating point.  Three successive entries in
         * the array constitute a point.  tv ends up holding the transformed
         * points as integers; three successive entries per point
         */
        transform: function(v, tv, numVertices) {
            var lxx = this.xx, lxy = this.xy, lxz = this.xz, lxo = this.xo;
            var lyx = this.yx, lyy = this.yy, lyz = this.yz, lyo = this.yo;
            var lzx = this.zx, lzy = this.zy, lzz = this.zz, lzo = this.zo;
            for (var i = numVertices * 3; (i -= 3) >= 0; ) {
                var x = v[i];
                var y = v[i + 1];
                var z = v[i + 2];
                tv[i]     = (x * lxx + y * lxy + z * lxz + lxo);
                tv[i + 1] = (x * lyx + y * lyy + z * lyz + lyo);
                tv[i + 2] = (x * lzx + y * lzy + z * lzz + lzo);
            }
        },

        /**
         * Provides a string representation of the matrix.
         */
        toString: function() {
            return ('[' + 
                this.xo + ',' + this.xx + ',' + this.xy + ',' + this.xz + ';' + 
                this.yo + ',' + this.yx + ',' + this.yy + ',' + this.yz + ';' + 
                this.zo + ',' + this.zx + ',' + this.zy + ',' + this.zz + ']'
            );
        }

    });


    return Matrix3D;

});