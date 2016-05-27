define(function (require) {

    'use strict';

    var Constants = require('constants');

    var DEBUG_OUTPUT_ENABLED = false;

    /**
     * RutherfordScattering is the algorthm for computing the alpha particle trajectories
     *   for Plum Pudding, Bohr, deBroglie and Schrodinger hydrogen atom models.
     *   The only difference between models is the value of the constant D.
     * 
     * This algorithm was specified by Sam McKagan.
     *   See the file data/Rutherford_Scattering.pdf ("Trajectories for Rutherford Scattering"). 
     */
    var RutherfordScattering = {

        // Value of x used when x==0 (this algorithm fails when x==0)
        X_MIN: 0.01,
        
        /**
         * Moves an alpha particle under the influence of a hydrogen atom.
         * <p>
         * ASSUMPTIONS MADE IN THIS ALGORITHM: 
         * (1) The atom is located at (0,0).
         * This is not the case in our model. So coordindates are adjusted 
         * as described in the comments.
         * (2) +y is up.
         * Our model has +y down. So we'll be adjusting the sign on y 
         * coordinates, as described in the comments.
         * (3) alpha particles are moving from bottom to top
         * (4) x values are positive.
         * The algoritm fails for negative values of x. This is not
         * mentioned in the specification document. So we have to convert
         * to positive values of x, then convert back.
         * (5) Using "phi=arctan(-x,y)" as described in the spec causes
         * particles to jump discontinuously when they go above the y axis.
         * This is fixed by using Math.atan2 instead.
         *
         * @param atom the atom
         * @param alphaParticle the alpha particle
         * @param deltaTime the time step
         * @param D the constant D
         */
        moveParticle: function(atom, alphaParticle, deltaTime, plumPudding) {
            if (!(deltaTime > 0))
                throw 'deltaTime must be greater than 0';

            var D = this.getD(atom, alphaParticle, plumPudding);
            
            // Alpha particle's initial position, relative to the atom's center.
            var x0 = this.getX0(atom, alphaParticle, plumPudding);
            if (!(x0 > 0));
                throw 'x0 must be greater than 0';

            var y0 = alphaParticle.getInitialPosition().getY() - atom.getY();
            y0 *= -1; // flip y0 sign from model to algorithm

            // b, horizontal distance to atom's center at y == negative infinity
            var b1 = Math.sqrt((x0 * x0) + (y0 * y0));
            var b = 0.5 * (x0 + Math.sqrt((-2 * D * b1) - (2 * D * y0) + (x0 * x0)));
            if (!(b > 0));
                throw 'b must be greater than 0';

            // particle's current position and speed
            var x = alphaParticle.getX();
            var y = alphaParticle.getY();
            var v = alphaParticle.getSpeed();
            var v0 = alphaParticle.getInitialSpeed();
            
            // adjust for atom position
            x -= atom.getX();
            y -= atom.getY();
            
            // This algorithm fails for x < 0, so adjust accordingly.
            var sign = 1;
            if (x < 0) {
                x *= -1;
                sign = -1;
            }
            if (!(x >= 0))
                throw 'x must be greater than 0';
            
            // flip y sign from model to algorithm
            y *= -1;
            
            // convert current position to Polar coordinates, measured counterclockwise from the -y axis
            var r = Math.sqrt((x * x) + (y * y));
            var phi = Math.atan2(x, -y);

            // new position (in Polar coordinates) and speed
            var t1 = ((b * Math.cos(phi)) - ((D / 2) * Math.sin(phi)));
            var phiNew = phi + ((b * b * v * deltaTime) / (r * Math.sqrt(Math.pow(b, 4) + (r * r * t1 * t1))));
            var rNew = Math.abs((b * b) / ((b * Math.sin(phiNew)) + ((D / 2) * (Math.cos(phiNew) - 1))));
            var vNew = v0 * Math.sqrt(1 - (D / rNew));
            
            // convert new position to Cartesian coordinates
            var xNew =  rNew * Math.sin(phiNew);
            var yNew = -rNew * Math.cos(phiNew);
            
            // Debugging output, in coordinates relative to atom's center
            if (DEBUG_OUTPUT_ENABLED) {
                console.log('RutherfordScattering.moveParticle' );
                console.log('  particle id=' + alphaParticle.getId() );
                console.log('  atom type=' + atom.getClass().getName() );
                console.log('  constants:' );
                console.log('    L=' + (HAConstants.ANIMATION_BOX_SIZE.height).toFixed(2));
                console.log('    D=' + (D).toFixed(2));
                console.log('    deltaTime=' + ( deltaTime ).toFixed(2) );
                console.log('    (x0,y0)=(' + ( x0 ).toFixed(2) + ',' + ( y0 ).toFixed(2) + ')' );
                console.log('    v0=' + ( v0 ).toFixed(2) );
                console.log('    b=' + ( b ).toFixed(2) );
                console.log('  current state:' );
                console.log('    (x,y)=(' + ( x ).toFixed(2) + ',' + ( y ).toFixed(2) + ')' );
                console.log('    (r,phi)=(' + ( r ).toFixed(2) + ',' + ( Math.toDegrees( phi ) ).toFixed(2) + ')' );
                console.log('    v=' + ( v ).toFixed(2) );
                console.log('  new state:' );
                console.log('    (x,y)=(' + ( xNew ).toFixed(2) + ',' + ( yNew ).toFixed(2) + ')' );
                console.log('    (r,phi)=(' + ( rNew ).toFixed(2) + ',' + ( Math.toDegrees( phiNew ) ).toFixed(2) + ')' );
                console.log('    v=' + ( vNew ).toFixed(2) );
            }
            
            // Adjust the sign of x.
            xNew *= sign;
            
            // flip y sign from algorithm to model
            yNew *= -1;
            
            // adjust for atom position
            xNew += atom.getX();
            yNew += atom.getY();
            
            alphaParticle.setPosition(xNew, yNew);
            alphaParticle.set('speed', vNew);
            alphaParticle.set('orientation', phiNew);
        },

        /*
         * Gets the value x0.
         * This value must be > 0, and is adjusted accordingly.
         * 
         * @param atom
         * @param alphaParticle
         * @return
         */
        getX0: function(atom, alphaParticle, plumPudding) {
            var x0 = Math.abs(alphaParticle.getInitialPosition().x - atom.getX());
            if (x0 === 0)
                x0 = this.X_MIN;
            return x0;
        },
        
        /*
         * Gets the constant D.
         * 
         * @param alphaParticle
         * @return double
         */
        getD: function(atom, alphaParticle, plumPudding) {
            var D = 0;
            var L = Constants.ANIMATION_BOX_SIZE.height;
            var DB = L / 16;
            if (plumPudding) {
                var x0 = this.getX0(atom, alphaParticle, plumPudding);
                var R = atom.get('radius');
                D = (x0 <= R) ? ((DB * x0 * x0) / (R * R)) : DB;
            }
            else {
                D = DB;
            }
            return D;
        }
    };

    return RutherfordScattering;
});
