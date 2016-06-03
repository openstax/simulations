define(function (require) {

    'use strict';

    var _ = require('underscore');

    var Vector2     = require('common/math/vector2');
    var RandomUtils = require('common/math/random-utils');

    var AbstractAtomicModel = require('hydrogen-atom/models/atomic-model');
    
    var Constants = require('constants');

    /**
     * SolarSystemModel models the hydrogen atom as a classical solar system.
     * 
     * Physical representation:
     *   Proton at the center, electron spirals towards the proton.
     *   (Our spiral is clockwise to be consistent with all other orbits in this sim.)
     *   The electron starts at a fixed distance and random angle from the proton.
     *   The radius of the spiral decreases linearly and the electron accelerates 
     *   as the electron moves closer to the proton. 
     *   The final state shows the electron on top of the proton.
     *   In this final state, the atom is considered "destroyed".
     * 
     * Collision behavior:
     *   The spiraling behavior should occur fast enough so that the atom is
     *   destroyed before any photons or alpha particles reach it.  Therefore,
     *   there are no collisions.
     * 
     * Absorption behavior:
     *   Atom is destroyed, so it does not absorb photons or alpha particles.
     * 
     * Emission behavior:
     *   Atom is destroyed, so it does not emit photons or alpha particles.
     */
    var SolarSystemModel = AbstractAtomicModel.extend({

        defaults: _.extend({}, AbstractAtomicModel.prototype.defaults, {
            orientation: 0
        }),

        initialize: function(attributes, options) {
            AbstractAtomicModel.prototype.initialize.apply(this, [attributes, options]);

            this.electronOffset = new Vector2();
            this.electronDistance = AbstractAtomicModel.ELECTRON_DISTANCE;
            this.electronAngle = RandomUtils.randomAngle();
            this.electronAngleDelta = AbstractAtomicModel.ELECTRON_ANGLE_DELTA;
            this.destroyed = false;
        },

        /**
         * Has the atom been destroyed?
         * The atom is destroyed when the electron has completed its spiral into the proton.
         */
        isDestroyed: function() {
            return this.destroyed;
        },
        
        /**
         * Gets the electron position, relative to the center of the atom.
         */
        getElectronOffset: function() {
            return this.electronOffset;
        },
        
        /**
         * Gets the electron's distance from the center of the atom.
         */
        getElectronDistanceFromCenter: function() {
            var x = this.electronOffset.x;
            var y = this.electronOffset.y;
            return Math.sqrt((x * x) + (y * y));
        },

        update: function(time, deltaTime) {
            if (!this.destroyed) {
                // Increment the orbit angle
                this.electronAngle += (this.electronAngleDelta * deltaTime);
                // Increase the rate of change of the orbit angle
                this.electronAngleDelta *= SolarSystemModel.ELECTRON_ACCELERATION;
                // Decrease the electron's distance from the proton
                this.electronDistance -= (SolarSystemModel.ELECTRON_DISTANCE_DELTA * deltaTime);
                // Is the distance effectively zero?
                if (this.electronDistance <= SolarSystemModel.MIN_ELECTRON_DISTANCE)
                    this.electronDistance = 0;
                
                // Move the electron and notify observers
                this.setElectronPosition(this.electronAngle, this.electronDistance);
                
                // Was the atom destroyed?
                if (this.electronDistance === 0)
                    this.destroyed = true;
            }
        },
        
        /*
         * Sets the electron's position relative to the center of the atom,
         *   based on its angle and distance from the proton.
         */
        setElectronPosition: function(electronAngle, electronDistance) {
            var x = electronDistance * Math.cos(electronAngle);
            var y = electronDistance * Math.sin(electronAngle);
            this.electronOffset.set(x, y);
        }

    }, Constants.SolarSystemModel);

    return SolarSystemModel;
});