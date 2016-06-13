define(function (require) {

    'use strict';

    var _ = require('underscore');

    var Vector2 = require('common/math/vector2');

    var BohrModel          = require('hydrogen-atom/models/atomic-model/bohr');
    var DeBroglieViewModes = require('hydrogen-atom/models/debroglie-view-modes');
    
    var Constants = require('constants');

    /**
     * DeBroglieModel is the deBroglie model of a hydrogen atom.
     * It is identical to the Bohr model, but has different visual representations.
     * The different visual representations mean that it also has different
     * methods of handling collision detection and determining electron position.
     * 
     * NOTE: The algorithms for collision detection and calculation
     * of electron position differ greatly for 2D and 3D views. 
     * Therefore this model needs to know something about the view in order
     * to make things look right in 3D.  So this model cannot be shown in
     * both 2D and 3D views simultaneously.  There are undubtedly ways to
     * do this, but this simulation does not require multiple simultaneous
     * views of the model.
     */
    var DeBroglieModel = BohrModel.extend({

        defaults: _.extend({}, BohrModel.prototype.defaults, {
            viewMode: DeBroglieViewModes.RADIAL_DISTANCE
        }),

        initialize: function(attributes, options) {
            BohrModel.prototype.initialize.apply(this, [attributes, options]);

            this.electronPosition3D = new Vector2();

            // Cached objects
            this._vec = new Vector2();
        },

        /**
         * Gets the amplitude of a standing wave at some angle,
         *   in some specified state of the electron.
         */
        getAmplitude: function(angle, state) {
            if (state === undefined)
                state = this.getElectronState();

            if (!(state >= DeBroglieModel.getGroundState() && state <= DeBroglieModel.getGroundState() + DeBroglieModel.getNumberOfStates() - 1))
                throw 'Bad state supplied to getAmplitude';

            var electronAngle = this.getElectronAngle();
            var amplitude = Math.sin(state * angle) * Math.sin(electronAngle);

            if (!(amplitude >= -1 && amplitude <= 1))
                throw 'Amplitude must be in the range of -1 to 1';

            return amplitude;
        },

        /**
         * Determines whether a photon collides with this atom.
         * Uses different algorithms depending on whether the view is 2D or 3D.
         */
        collides: function(photon) {
            if (this.get('viewMode') === DeBroglieViewModes.HEIGHT_3D)
                return this.collides3D(photon);
            else
                return this.collides2D(photon);
        },
        
        /*
         * Determines whether a photon collides with this atom in the 3D view.
         * In this case, the photon collides with the atom if it
         *   hits the ellipse that is the 2D projection of the electron's 3D orbit.
         */
        collides3D: function(photon) {
            // Position of photon relative to atom's center
            var vec = this._vec
                .set(photon.get('position'))
                .sub(this.get('position'));
            var angle = Math.atan(vec.y / vec.x);
            
            // Position on orbit at corresponding angle
            var orbitRadius = this.getElectronOrbitRadius();
            var orbitX = orbitRadius * Math.cos(angle);
            var orbitY = DeBroglieModel.ORBIT_Y_SCALE * orbitRadius * Math.sin(angle);
            
            // Distance from electron to closest point on orbit
            var distance = vec.distance(orbitX, orbitY);
            
            // How close the photon's center must be to a point on the electron's orbit
            var closeness = DeBroglieModel.COLLISION_CLOSENESS + (Constants.DeBroglieModelBrightnessSubView.RING_WIDTH / 2);
            
            var collides = (distance <= closeness);
            return collides;
        },
        
        /*
         * Determines whether a photon collides with this atom in one of the 2D views.
         * In all 2D views (including "radial distance"), the photon collides with
         *   the atom if it hits the ring used to represent the standing wave in one
         *   of the brightness views.
         */
        collides2D: function(photon) {
            // Position of photon relative to atom's center
            var vec = this._vec
                .set(photon.get('position'))
                .sub(this.get('position'));
            
            // Distance of photon and electron from atom's center
            var photonRadius = vec.length();
            var orbitRadius = this.getElectronOrbitRadius();
            
            // How close the photon's center must be to a point on the electron's orbit
            var closeness = DeBroglieModel.COLLISION_CLOSENESS + (Constants.DeBroglieModelBrightnessSubView.RING_WIDTH / 2);
            
            var collides = (Math.abs(photonRadius - orbitRadius) <= closeness);
            return collides;
        },
        
        /**
         * Calculates the new electron angle for some time step.
         * For deBroglie, the change in angle (and thus the oscillation frequency)
         *   is the same for all states of the electron.
         */
        calculateNewElectronAngle: function(deltaTime) {
            var deltaAngle = deltaTime * this.getElectronAngleDelta();
            return this.getElectronAngle() - deltaAngle; // clockwise
        },
        
        /**
         * Gets a reference to the electron's position in world coordinates.
         * This is the electron's offset adjusted by the atom's position.
         * If we're using a 3D view, adjust the y coordinate to account 
         * for the 3D perspective.
         * 
         * This method does not allocate a Point2D -- take care not to change the value returned!
         */
        getElectronPosition: function() {
            var p = BohrModel.prototype.getElectronPosition.apply(this, arguments);
            if (this.get('viewMode') === DeBroglieViewModes.HEIGHT_3D) {
                var x = p.x;
                var y = this.getY() + ((p.y - this.getY()) * DeBroglieModel.ORBIT_Y_SCALE); // adjust distance from atom's center
                this.electronPosition3D.set(x, y);
                p = this.electronPosition3D;
            }
            return p;
        }

    }, Constants.DeBroglieModel);

    return DeBroglieModel;
});