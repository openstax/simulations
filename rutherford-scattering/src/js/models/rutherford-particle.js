define(function (require) {

    'use strict';

    var AlphaParticleModel = require('rutherford-scattering/models/alpha-particle');
    var Constants = require('constants');
    var Vector2 = require('common/math/vector2');

    var RutherfordParticle = AlphaParticleModel.extend({

        initialize: function(attributes, options) {
            AlphaParticleModel.prototype.initialize.apply(this, arguments);
            this.set('initialPosition', attributes.position);
        },

        move: function(deltaTime, L, protonCount) {

            // algorithm fails for x=0, so use this min value
            var X0_MIN = 0.00001;

            // Divisor for L used in the calculation of D.
            var L_DIVISOR = 8;

            //-------------------------------------------------------------------------------
            // misc constants that we'll need
            //-------------------------------------------------------------------------------

            var p = protonCount; // protons in the atom's nucleus
            var pd = Constants.DEFAULT_PROTON_COUNT; // default setting for the sim

            var s = this.get('speed');  // particle's current speed
            var s0 = this.get('defaultSpeed'); // speed when it left the gun
            var sd = Constants.DEFAULT_ALPHA_ENERGY; // default setting for the sim

            //-------------------------------------------------------------------------------
            // (x0,y0) : the alpha particle's initial position, relative to the atom's center.
            //-------------------------------------------------------------------------------

            var initialPosition = this.get('initialPosition');

            var x0 = Math.abs( initialPosition.x );
            if ( x0 < X0_MIN ) {
                x0 = X0_MIN; // algorithm fails for x0 < X0_MIN
            }

            var y0 = initialPosition.y;

            //-------------------------------------------------------------------------------
            // (x,y) : the alpha particle's current position, relative to the atom's center
            //-------------------------------------------------------------------------------

            var position = this.get('position');

            var x = position.x;
            var y = position.y;
            var xWasNegative = false;
            if ( x < 0 ) {
                // This algorithm fails for x < 0, so adjust accordingly.
                x *= -1;
                xWasNegative = true;
            }

            //-------------------------------------------------------------------------------
            // calculate D -
            //-------------------------------------------------------------------------------

            // handle potential algorithm failures
            if ( ( pd <= 0 ) || ( s0 === 0 ) ) {
                this.set('remove', true);
                return;
            }

            var D = ( L / L_DIVISOR ) * ( p / pd ) * ( ( sd * sd ) / ( s0 * s0 ) );

            //-------------------------------------------------------------------------------
            // calculate new alpha particle position, in Polar coordinates
            //-------------------------------------------------------------------------------

            // check intermediate values to handle potential algorithm failures
            var i0 = ( x0 * x0 ) + ( y0 * y0 );
            if ( i0 < 0 ) {
                this.set('remove', true);
                return;
            }

            // b, horizontal distance to atom's center at y == negative infinity
            var b1 = Math.sqrt( i0 );

            // check intermediate values to handle potential algorithm failures
            var i1 = ( -2 * D * b1 ) - ( 2 * D * y0 ) + ( x0 * x0 );
            if ( i1 < 0 ) {
                this.set('remove', true);
                return;
            }

            var b = 0.5 * ( x0 + Math.sqrt( i1 ) );

            // convert current position to Polar coordinates, measured counterclockwise from the -y axis

            // check intermediate values to handle potential algorithm failures
            var i2 = ( x * x ) + ( y * y );
            if ( i2 < 0 ) {
                this.set('remove', true);
                return;
            }

            var r = Math.sqrt( i2 );
            var phi = Math.atan2( x, -y );

            // new position (in Polar coordinates) and speed
            var t1 = ( ( b * Math.cos( phi ) ) - ( ( D / 2 ) * Math.sin( phi ) ) );

            // check intermediate values to handle potential algorithm failures
            var i3 = Math.pow( b, 4 ) + ( r * r * t1 * t1 );
            if ( i3 < 0 ) {
                this.set('remove', true);
                return;
            }
            var phiNew = phi + ( ( b * b * s * deltaTime ) / ( r * Math.sqrt( i3 ) ) );

            // check intermediate values to handle potential algorithm failures
            var i4 = ( ( b * Math.sin( phiNew ) ) + ( ( D / 2 ) * ( Math.cos( phiNew ) - 1 ) ) );
            if ( i4 < 0 ) {
                this.set('remove', true);
                return;
            }
            var rNew = Math.abs( ( b * b ) / i4 );

            // handle potential algorithm failures
            if ( rNew === 0 ) {
                this.set('remove', true);
                return;
            }
            var sNew = s0 * Math.sqrt( 1 - ( D / rNew ) );

            //-------------------------------------------------------------------------------
            // convert to Cartesian coordinates
            //-------------------------------------------------------------------------------

            var xNew = rNew * Math.sin( phiNew );
            if ( xWasNegative ) {
                xNew *= -1; // restore the sign
            }

            var yNew = -rNew * Math.cos( phiNew );

            //-------------------------------------------------------------------------------
            // handle potential algorithm failures
            //-------------------------------------------------------------------------------

            if ( !( b > 0 ) || !( sNew > 0 ) ) {
                this.set('remove', true);
                return;
            }

            //-------------------------------------------------------------------------------
            // set the alpha particle's new properties
            //-------------------------------------------------------------------------------

            this.set('position', new Vector2( xNew, yNew ));
            this.set('speed', sNew);
            this.set('orientation', phiNew);
        }

    }, {});

    return RutherfordParticle;
});
